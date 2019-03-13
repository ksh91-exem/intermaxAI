Ext.define('rtm.src.rtmTierStat', {
    extend: 'Exem.DockForm',
    layout : 'fit',
    width : '100%',
    height: '100%',

    showToolMenu : false,    // 프레임 전체에 적용되는 옵션 아이콘 사용 여부
    isDockFrame  : false,

    listeners: {
        beforedestroy: function() {
            this.stopRefreshData();

            if (this.checkTimerInc) {
                clearTimeout(this.checkTimerInc);
            }
        },
        resize: function() {
            this.setFontSize();
        }
    },

    initProperty: function() {
        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.objOption = Comm.RTComm.getBizGroupList(this.componentId);

        this.objStatInfo = {
            arrName : [],
            arrId   : [],
            arrData : []
        };

        this.groupName = this.tierName;
        this.objStatInfo.arrId = ['TPS', 'TXN_ELAPSE', 'ERROR_COUNT'];

        this.serverIdArr   = Comm.tierInfo[this.tierId].serverList.concat();
        this.serverNameArr = [];

        for (var ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            this.serverNameArr.push(Comm.wasInfoObj[this.serverIdArr[ix]].wasName);
        }

        this.reqColorGroup = [];
        this.objStatInfo.arrData = [0,0,0];

        var statName;
        for (ix = 0; ix < 3; ix++) {
            statName = Comm.RTComm.getTierGroupStatNameById(this.objStatInfo.arrId[ix]);

            // EtoE 화면에서 트랜잭션 수행시간의 단위를 표시해달라는 요청으로 추가함.
            if (this.objStatInfo.arrId[ix] === 'TXN_ELAPSE') {
                statName += ' (ms)';
            }
            this.objStatInfo.arrName[ix] = statName;
        }

        if (this.tierType === 'APIM') {
            this.tierType = 'CD';
        }

        if (this.tierType === 'CD') {
            this.tierTrendData = Repository.CDTrendData;

        } else if (this.tierType === 'WEB') {
            this.tierTrendData = Repository.WebTrendData;

        } else if (this.tierType === 'TP') {
            this.tierTrendData = Repository.tmadminChartData;

        } else {
            this.tierTrendData = Repository.trendChartData;
        }

    },

    init: function() {

        this.initProperty();

        // Background
        this.background = Ext.create('Exem.Container', {
            cls   : 'rtm-tiergroupstat-base',
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 0 0 0',
            border: true
        });

        // Top Layer
        this.conBizGroupTitle = Ext.create('Exem.Container', {
            cls    : 'rtm-tiergroupstat-title',
            width  : '100%',
            height : '100%',
            minHeight : 30,
            layout : 'fit',
            flex   : 0.07
        });

        // CenterLayer
        this.pnlBizGroupStat = Ext.create('Exem.Panel', {
            bodyCls: 'group-center-base',
            layout : {
                type : 'vbox',
                align: 'center'
            },
            flex    : 0.93,
            width   : '100%',
            height  : '100%',
            minHeight : 70,
            margin  : '0 0 0 0',
            split   : false,
            border  : true,
            bodyStyle: {'background': 'transparent'}
        });

        // Top Contents
        var title =
                '<div class="rtm-tiergroupstat-title">' +
                    '<div class="title">' + this.tierName + '</div>' +
                '</div>';

        this.bizGroupTitle = Ext.create('Exem.Container', {
            cls    : 'rtm-tiergroupstat-title',
            width  : '100%',
            height : '100%',
            padding: '10 20 10 15',
            html   : title
        });

        //Center Contents
        var contents =
                '<div class="activity-status-template">' +
                    '<div class="box"><span class="stat" id="' + this.id +  '_stat1">'+ this.objStatInfo.arrName[0] +'</span><span class="value">0</span></div>' +
                    '<div class="box"><span class="stat" id="' + this.id +  '_stat2">'+ this.objStatInfo.arrName[1] +'</span><span class="value">0</span></div>' +
                    '<div class="box"><span class="stat" id="' + this.id +  '_stat3">'+ this.objStatInfo.arrName[2] +'</span><span class="value">0</span></div>' +
                '</div>';

        this.statusArea = Ext.create('Ext.container.Container', {
            cls   : 'status-area-base',
            layout:'fit',
            width : '100%',
            height: '100%',
            padding: '5 15 5 15',
            html  : contents
        });

        this.conBizGroupTitle.add(this.bizGroupTitle);
        this.pnlBizGroupStat.add(this.statusArea);

        this.background.add([this.conBizGroupTitle, this.pnlBizGroupStat]);
        this.add(this.background);

        this.$targetTitle = $('#' + this.bizGroupTitle.id);
        this.$targetStat = $('#' + this.id + ' .stat');

        this.$targetStat.on('click', function(e) {
            var curStat = $('#' + e.currentTarget.id).text();
            this.onClickStat(curStat);
        }.bind(this));

        this.stat1 = $('#'+this.id+' .activity-status-template .value')[0];
        this.stat2 = $('#'+this.id+' .activity-status-template .value')[1];
        this.stat3 = $('#'+this.id+' .activity-status-template .value')[2];

        this.box1 = $('#'+this.id+' .activity-status-template .box')[0];
        this.box2 = $('#'+this.id+' .activity-status-template .box')[1];
        this.box3 = $('#'+this.id+' .activity-status-template .box')[2];


        this.statDomId1 = document.getElementById(this.id+'_stat1');
        this.statDomId2 = document.getElementById(this.id+'_stat2');
        this.statDomId3 = document.getElementById(this.id+'_stat3');

        this.arrStatDomId = [this.statDomId1, this.statDomId2, this.statDomId3];

        this.groupTitle = $('#'+this.id+' .rtm-tiergroupstat-title .title')[0];

        this.refreshData();

    },


    setFontColor: function() {
        var grpColor = Comm.RTComm.realtime.GroupColors;
        var curTheme = Comm.RTComm.getCurrentTheme();

        var ix, jx, ixLen, jxLen;

        for (ix = 0, ixLen = this.reqColorGroup.length; ix < ixLen; ix++) {
            if (this.reqColorGroup[ix] == this.tierName) {
                this.stat1.style.color = grpColor.Group[ix];
                this.stat2.style.color = grpColor.Group[ix];
                this.stat3.style.color = grpColor.Group[ix];
                break;

            } else {
                for (jx = 0, jxLen = grpColor.Base.length; jx < jxLen; jx++) {
                    if (curTheme == grpColor.Base[jx].id) {
                        this.stat1.style.color = grpColor.Base[jx].baseColor;
                        this.stat2.style.color = grpColor.Base[jx].baseColor;
                        this.stat3.style.color = grpColor.Base[jx].baseColor;
                    }
                }
            }
        }
    },


    setFontSize: function() {
        if (this.stat1) {
            this.stat1.style.fontSize = '13px';
            this.stat2.style.fontSize = '13px';
            this.stat3.style.fontSize = '13px';

            this.box1.style.lineHeight = '13px';
            this.box2.style.lineHeight = '13px';
            this.box3.style.lineHeight = '13px';
        }
    },


    /**
     * 지표를 선택해서 변경하는 지표 변경 화면 표시
     *
     * @param {string} pStatName 선택한 지표명
     */
    onClickStat: function(pStatName) {
        this.statListWindow = Ext.create('rtm.src.rtmTierGroupList', {
            style: {'z-index': '10'}
        });

        this.statListWindow.statName = pStatName;
        this.statListWindow.oldStatName = Comm.RTComm.getTierGroupStatIdByName(pStatName);
        this.statListWindow.targetStat = this.id;
        this.statListWindow.statList = this.objStatInfo.arrId;
        this.statListWindow.init();
        this.statListWindow.show();
    },


    /**
     * 모니터링 대상 지표 변경
     *
     * @param {string} oldCaption 변경 전 지표명
     * @param {string} statname 변경 지표명
     */
    changeStat: function(oldCaption, statname) {
        var index;

        // 동일한 Stat은 동작하지 않는다.
        statname   = statname.replace(/ /gi, '_');
        oldCaption = oldCaption.replace(/ /gi, '_');

        if (this.objStatInfo.arrId.indexOf(statname) === -1) {
            index = this.objStatInfo.arrId.indexOf(oldCaption);

            if (index !== -1) {
                this.objStatInfo.arrId[index] = statname;
                this.objStatInfo.arrName[index] = Comm.RTComm.getTierGroupStatNameById(statname);
                this.arrStatDomId[index].textContent = this.objStatInfo.arrName[index];
                Comm.RTComm.saveBizGroupList(this.componentId, [this.tierName, this.objStatInfo]);
            }
        } else {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('StatName is aleady registered.'));
        }

        this.drawData();

        statname   = null;
        oldCaption = null;
    },


    stopRefreshData: function() {
        if (this.timerIncChart) {
            clearTimeout(this.timerIncChart);
        }
    },


    /**
     * 데이터 새로고침 (주기 3초)
     */
    refreshData: function() {
        this.stopRefreshData();

        this.drawData();

        this.timerIncChart = setTimeout(this.refreshData.bind(this), 3000);
    },


    /**
     * EtoE 지표 데이터 표시
     */
    drawData: function() {
        if (this.serverIdArr.length <= 0) {
            return;
        }

        var trendData;
        var count = 0;

        var curData = [
            { statId : 'ERROR_COUNT',        data : 0, format : '0,000' },
            { statId : 'REQUEST_RATE',       data : 0, format : '0,000.00'},
            { statId : 'ACTIVE_USERS',       data : 0, format : '0,000'},
            { statId : 'ACTIVE_TRANSACTION', data : 0, format : '0,000'},
            { statId : 'TXN_ELAPSE',         data : 0, format : '0,000.00'},
            { statId : 'TPS',                data : 0, format : '0,000'}
        ];

        for (var ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            trendData   = this.tierTrendData[this.serverIdArr[ix]];

            if (trendData) {
                curData[0].data += +trendData.ERROR_COUNT  || 0;
                curData[1].data += +trendData.REQUEST_RATE || 0;
                curData[2].data += +trendData.ACTIVE_USERS || 0;
                curData[3].data += +trendData.ACTIVE_TRANSACTION || 0;

                // EtoE 화면에서 트랜잭션 수행 시간을 밀리 세컨드 단위로 통일하여 보지게 해달라는 요청에 의해
                // 밀리 세컨드 단위로 보여지게 수정함.
                if (this.tierType === 'TP') {
                    curData[4].data += parseFloat(+trendData.AVERAGE * 1000) || 0;     // 초 단위에서 밀리세컨드 단위
                    curData[5].data += +trendData.TP_TPS  || 0;

                } else if (this.tierType === 'CD') {
                    curData[4].data += parseFloat(+trendData.TXN_ELAPSE / 1000) || 0;  // 마이크로 단위에서 밀리세컨드 단위
                    curData[5].data += +trendData.TPS || 0;

                } else {
                    curData[4].data += parseFloat(+trendData.TXN_ELAPSE * 1000) || 0;  // 초 단위에서 밀리세컨드 단위
                    curData[5].data += +trendData.TPS || 0;
                }

                count++;
            }
        }

        if (curData[4].data !== 0) {
            curData[4].data = curData[4].data/count || 0;
        }

        trendData = null;

        var jx, jxLen, kx, kxLen;
        var statData;

        for (jx = 0, jxLen = this.objStatInfo.arrId.length; jx < jxLen; jx++) {
            for (kx = 0, kxLen = curData.length; kx < kxLen; kx++) {
                if (this.objStatInfo.arrId[jx] == curData[kx].statId) {
                    // statData = Ext.util.Format.number(curData[kx].data , curData[kx].format);

                    // EtoE 실시간 화면에서 트랜잭션 수행 시간을 밀리세컨드 단위로 표시를 하게 되면서 소수점을 표시할 필요가 없어
                    // 소수점 자리를 없이 표시하게 변경함. (APM 본부 요청)
                    if (curData[kx].statId === 'REQUEST_RATE' || curData[kx].statId === 'TXN_ELAPSE') {
                        statData = common.Util.toFixed(curData[kx].data, 2);
                    } else {
                        statData = common.Util.toFixed(curData[kx].data, 0);
                    }

                    if (jx === 0) {
                        this.stat1.textContent = statData;

                    } else if(jx === 1) {
                        this.stat2.textContent = statData;

                    } else {
                        this.stat3.textContent = statData;
                    }
                }
            }
        }
    }
});
