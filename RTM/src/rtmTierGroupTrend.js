Ext.define('rtm.src.rtmTierGroupTrend', {
    extend: 'Exem.DockForm',
    title : 'ETE ' + common.Util.TR('Tier Trend'),
    layout : 'fit',
    width : '100%',
    height: '100%',

    listeners: {
        beforedestroy: function() {
            if (this.checkTimerInc) {
                clearTimeout(this.checkTimerInc);
            }
        }
    },

    initProperty: function() {
        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }
    },

    init: function() {

        this.initProperty();

        // Background
        this.background = Ext.create('Exem.Container', {
            cls   : 'rtm-bizgroupstat-base',
            width : '100%',
            height: '100%',
            layout: {
                type : 'hbox',
                align: 'middle',
                pack : 'center'
            },
            margin: '0 0 0 0'
        });

        this.add(this.background);

        var topContentsArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '0 0 0 0',
            style  : {
                borderRadius: '5px'
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '3 0 0 10',
            padding: '0 0 0 0',
            cls    : 'header-title cursor',
            text   : this.title
        });
        topContentsArea.add(this.frameTitle);

        this.setTrend();
    },


    setTrend: function() {

        var topCon = Ext.create('Exem.Container', {
            cls : 'dashboard-mainView-topCon',
            layout: 'hbox'
        });

        var eTrend, tierId, tierName, tierType;

        for (var ix = 0, ixLen = Comm.tierList.length; ix < ixLen; ix++) {
            tierId   = Comm.tierList[ix];
            tierName = Comm.tierInfo[tierId].name;
            tierType = Comm.tierInfo[tierId].type;

            eTrend = Ext.create('rtm.src.rtmTierTrend', {
                tierId      : tierId,
                tierName    : tierName,
                tierType    : tierType,
                margin      : '0 0 0 0',
                flex        : 1,
                titleCursor : false,
                componentId : this.componentId,
                dashBizIndex: this.dashBizIndex
            });

            topCon.add(eTrend);
            eTrend.init();
        }
        this.background.add(topCon);
    },


    /**
     * 업무 그룹을 변경 시
     *
     * @param {string} pGroupName
     */
    changeGroup : function(pGroupName) {
        this.bizGroupName = pGroupName;

        this.serverIdArr   = Comm.RTComm.WASListInGroup(this.bizGroupName);
        this.serverNameArr = Comm.RTComm.WASNamesByID(this.serverIdArr.concat());

        this.selectServerIdArr   = this.serverIdArr.concat();
        this.selectServerNameArr = this.serverNameArr.concat();

        this.serverIpArr = [];
        this.tempIpAddr  = null;

        for (var ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            this.tempIpAddr = Comm.wasInfoObj[this.serverIdArr[ix]].ipAddr || '';
            this.tempIpAddr = this.tempIpAddr.split('.').slice(2).join('.');
            this.serverIpArr.push(this.tempIpAddr);
        }

        if (this.eTrend) {
            this.eTrend.changeGroup(this.bizGroupName);
        }

        this.frameTitle.setText(this.bizGroupName);
    },


    /**
     * 선택된 서버 목록으로 재설정.
     *
     * @param {string[]} serverNameList - 서버명 배열
     * @param {string[] | number[]} serverIDList - 서버 ID 배열
     */
    frameChange: function(serverNameList, serverIDList) {
        
    },


    /**
     * Start Bar Chart draw.
     */
    frameRefresh: function() {
        this.isDrawStopChart = false;

        if (this.eTrend) {
            this.eTrend.frameRefresh();
        }
    },


    /**
     * Stop Bar chart draw.
     */
    frameStopDraw: function() {
        this.isDrawStopChart = true;

        if (this.eTrend) {
            this.eTrend.frameStopDraw();
        }
    }


});
