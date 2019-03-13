Ext.define('rtm.src.rtmBizGroupPerformanceMetrics', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Business Group Performance Metrics'),
    layout : 'fit',
    width : '100%',
    height: '100%',

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

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        if (!this.componentId) {

            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.objOption = Comm.RTComm.getBizGroupList(this.componentId);

        this.objStatInfo = {
            arrName : [],
            arrId : [],
            arrData : []
        };

        if(Comm.bizGroups.length) {
            if(this.objOption) {
                var objStatOption = this.objOption[1];
                this.groupName = this.objOption[0] || Comm.bizGroups[0];
                this.objStatInfo.arrId = [objStatOption.arrId[0], objStatOption.arrId[1], objStatOption.arrId[2]];
            } else {
                this.groupName = Comm.bizGroups[0];
                this.objStatInfo.arrId = ['SESSION_COUNT', 'TPS', 'TXN_ELAPSE'];
                Comm.RTComm.saveBizGroupList(this.componentId, [this.groupName, this.objStatInfo]);
            }

            this.reqColorGroup = ['스마트뱅킹', '인터넷뱅킹'];
            this.objStatInfo.arrData = [0,0,0];

            for(var ix=0; ix<3; ix++) {
                this.objStatInfo.arrName[ix] = Comm.RTComm.getBizGroupStatNameById(this.objStatInfo.arrId[ix]);
            }
        }
    },

    init: function() {
        if(!Comm.bizGroups.length) {
            this.groupName = common.Util.TR('No Groups.');

            common.Util.showMessage(
                common.Util.TR('WARNING'),
                common.Util.TR('No Groups.'),
                Ext.Msg.OK, Ext.MessageBox.WARNING,
                function() {
                    this.up().close();
                }.bind(this));
            return;
        }

        this.initProperty();

        // Background
        this.background = Ext.create('Exem.Container', {
            cls   : 'rtm-bizgroupstat-base',
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 0 0 0'
        });

        // Top Layer
        this.conBizGroupTitle = Ext.create('Exem.Container', {
            cls : 'rtm-bizgroupstat-title',
            width : '100%',
            height : '100%',
            minHeight : 30,
            layout: 'fit',
            flex:0.07
        });

        // CenterLayer
        this.pnlBizGroupStat = Ext.create('Exem.Panel', {
            bodyCls : 'group-center-base',
            layout: {
                type: 'vbox',
                align: 'center'
            },
            flex : 0.93,
            width : '100%',
            height : '100%',
            minHeight : 70,
            margin  : '0 0 0 0',
            split   : false,
            border  : true,
            bodyStyle: {'background': 'transparent'}
        });


        // Top Contents
        var title =
                '<div class="rtm-bizgroupstat-title">' +
                    '<div class="title">' + this.groupName + '</div>' +
                '</div>';

        this.bizGroupTitle = Ext.create('Exem.Container', {
            cls : 'rtm-bizgroupstat-title',
            width : '100%',
            height : '100%',
            padding : '10 20 10 20',
            html : title
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

        this.selectedWasId   = [];
        this.selectedWasName = [];

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


        this.$targetTitle.on('click', function() {
            if(Comm.bizGroups.length) {
                this.onClickTitle(this.groupName);
            } else {
                common.Util.showMessage('', common.Util.TR('No Groups.'), Ext.Msg.OK, Ext.MessageBox.INFO);
            }

        }.bind(this));

        this.setComboData(this.groupName);

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

        this.groupTitle = $('#'+this.id+' .rtm-bizgroupstat-title .title')[0];

        this.setFontSize();
        this.setFontColor();
        this.refreshData();

    },

    setFontColor: function() {
        var grpColor = Comm.RTComm.realtime.GroupColors;
        var curTheme = Comm.RTComm.getCurrentTheme();

        for (var ix=0; ix<this.reqColorGroup.length; ix++) {
            if (this.reqColorGroup[ix] == this.groupName) {
                this.stat1.style.color = grpColor.Group[ix];
                this.stat2.style.color = grpColor.Group[ix];
                this.stat3.style.color = grpColor.Group[ix];
                break;

            } else {
                for (var jx=0; jx<grpColor.Base.length; jx++) {
                    if (curTheme == grpColor.Base[jx].id) {
                        this.stat1.style.color = grpColor.Base[jx].baseColor;
                        this.stat2.style.color = grpColor.Base[jx].baseColor;
                        this.stat3.style.color = grpColor.Base[jx].baseColor;
                    }
                }
            }
        }
    },

    setFontSize : function() {
        var fstSize = Math.min(Math.max(this.getHeight() * 0.25, 30), 60);
        var secSize = Math.min(Math.max(this.getHeight() * 0.12, 20), 35);

        if (this.stat1) {
            this.stat1.style.fontSize = fstSize + 'px';
            this.stat2.style.fontSize = secSize + 'px';
            this.stat3.style.fontSize = secSize + 'px';

            this.box1.style.lineHeight = (fstSize) + 'px';
            this.box2.style.lineHeight = (secSize* 1.5) + 'px';
            this.box3.style.lineHeight = (secSize* 1.5) + 'px';

        }
    },


    onClickTitle : function(pGroupName) {
        this.groupListWindow = Ext.create('rtm.src.rtmBizGroupList', {
            style: {'z-index': '10'}
        });

        this.groupListWindow.groupName     = pGroupName;
        this.groupListWindow.targetGroup  = this;
        this.groupListWindow.init();
        this.groupListWindow.show();
    },

    onClickStat: function(pStatName) {
        this.statListWindow = Ext.create('rtm.src.rtmBizGroupPerformanceStat', {
            style: {'z-index': '10'}
        });

        this.statListWindow.statName = pStatName;
        this.statListWindow.oldStatName = Comm.RTComm.getBizGroupStatIdByName(pStatName);
        this.statListWindow.targetStat = this.id;
        this.statListWindow.statList = this.objStatInfo.arrId;
        this.statListWindow.init();
        this.statListWindow.show();
    },


    changeGroup : function(pGroupName) {
        this.groupName = pGroupName;

        var selectWasId = Comm.RTComm.WASListInGroup(this.groupName);
        var selectWasName = [];

        for (var ix = 0; ix < selectWasId.length; ix++) {
            selectWasName.push(Comm.wasInfoObj[selectWasId[ix]].wasName);
        }

        this.setFontColor();

        this.selectedWasId.length = 0;
        this.selectedWasId = selectWasId;
        this.selectedWasName = selectWasName;

        this.setComboData(this.groupName);
        this.changeTitle();
        this.drawData();
        Comm.RTComm.saveBizGroupList(this.componentId, [this.groupName, this.objStatInfo]);

        selectWasId     = null;
        selectWasName   = null;

    },


    changeStat: function(oldCaption, statname) {
        var index;

        // 동일한 Stat은 동작하지 않는다.
        statname   = statname.replace(/ /gi, '_');
        oldCaption = oldCaption.replace(/ /gi, '_');

        if (this.objStatInfo.arrId.indexOf(statname) === -1) {
            if (oldCaption === common.Util.TR('Concurrent Users')) {
                oldCaption = 'SESSION_COUNT';
                index = this.objStatInfo.arrId.indexOf(oldCaption);
            } else {
                index = this.objStatInfo.arrId.indexOf(oldCaption);
            }
            if (index !== -1) {
                if (statname === common.Util.TR('Concurrent Users')) {
                    statname = 'SESSION_COUNT';
                }

                this.objStatInfo.arrId[index] = statname;
                this.objStatInfo.arrName[index] = Comm.RTComm.getBizGroupStatNameById(statname);
                this.arrStatDomId[index].textContent = this.objStatInfo.arrName[index];
                Comm.RTComm.saveBizGroupList(this.componentId, [this.groupName, this.objStatInfo]);
            }
        } else {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('StatName is already registered.'));
        }
        this.drawData();

        index      = null;
        statname   = null;
        oldCaption = null;
    },


    changeTitle : function() {
        this.groupTitle.textContent = this.groupName;
    },


    setComboData: function() {
        var groupName;
        var display,
            selectedIndex = Comm.bizGroups.indexOf(this.groupName);

        var comboData = [];
        var ix, ixLen;

        for (ix = 0, ixLen = Comm.bizGroups.length; ix < ixLen ; ix++ ) {
            groupName = Comm.bizGroups[ix];
            display  = Comm.bizGroups[ix];
            comboData.push({name: display, value: groupName});
        }

        if (selectedIndex < 0) {
            if (!this.componentId) {
                this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
            }

            this.groupName = Comm.RTComm.getDashboardActiveGroup(this.componentId);
            if(!this.groupName){
                this.groupName = Comm.bizGroups[0];
            }
        }

        this.selectedWasId = Comm.RTComm.WASListInGroup(this.groupName);

        for (ix = 0, ixLen = this.selectedWasId.length; ix < ixLen; ix++) {
            this.selectedWasName[this.selectedWasName.length] = Comm.wasInfoObj[this.selectedWasId[ix]].wasName;
        }
    },


    stopRefreshData: function() {
        if (this.timerIncChart) {
            clearTimeout(this.timerIncChart);
        }
    },


    refreshData: function() {
        this.stopRefreshData();
        this.drawData();
        this.timerIncChart = setTimeout(this.refreshData.bind(this), 3000);
    },


    drawData: function() {
        if (this.selectedWasId.length <= 0) {
            return;
        }
        var trendData, sessionData;
        var count = 0;

        var curData = [
            { statId : 'SESSION_COUNT', data : 0, format : '0,000' },
            { statId : 'REQUEST_RATE', data : 0, format : '0,000.00'},
            { statId : 'ACTIVE_USERS', data : 0, format : '0,000'},
            { statId : 'ACTIVE_TRANSACTION', data : 0, format : '0,000'},
            { statId : 'TXN_ELAPSE', data : 0, format : '0,000.00'},
            { statId : 'TPS', data : 0, format : '0,000'}
        ];

        for (var ix = 0; ix < this.selectedWasId.length; ix++) {
            trendData = Repository.trendChartData[this.selectedWasId[ix]];
            sessionData = Repository.WasSessionData[this.selectedWasId[ix]];

            if (trendData) {
                if(sessionData) {  // 1분후 집계되므로 따로 관리
                    curData[0].data += +sessionData.SESSION_COUNT;
                }
                curData[1].data += +trendData.REQUEST_RATE;
                curData[2].data += +trendData.ACTIVE_USERS;
                curData[3].data += +trendData.ACTIVE_TRANSACTION;
                curData[4].data += +trendData.TXN_ELAPSE;
                curData[5].data += +trendData.TPS;

                count++;
            }
        }

        if (curData[4].data !== 0) {
            curData[4].data = curData[4].data/count || 0;
        }

        trendData = null;
        sessionData = null;

        var jx, jxLen, kx, kxLen;
        for (jx = 0, jxLen = this.objStatInfo.arrId.length; jx < jxLen; jx++) {
            for (kx = 0, kxLen = curData.length; kx < kxLen; kx++) {
                if (this.objStatInfo.arrId[jx] == curData[kx].statId) {
                    if (jx === 0) {
                        this.stat1.textContent = Ext.util.Format.number(curData[kx].data , curData[kx].format);
                    } else if(jx==1) {
                        this.stat2.textContent = Ext.util.Format.number(curData[kx].data , curData[kx].format);
                    } else {
                        this.stat3.textContent = Ext.util.Format.number(curData[kx].data , curData[kx].format);
                    }
                }
            }
        }
    }
});
