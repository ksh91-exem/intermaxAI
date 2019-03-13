Ext.define('rtm.src.rtmTierMetrics', {
    extend: 'Exem.DockForm',
    title : 'ETE ' + common.Util.TR('Tier Metrics'),
    layout : 'fit',
    width : '100%',
    height: '100%',

    listeners: {
        beforedestroy: function() {
            //this.stopRefreshData();

            if (this.checkTimerInc) {
                clearTimeout(this.checkTimerInc);
            }
        }
    },

    initProperty: function() {
        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.tierStatusIdList = [];
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

        var topCon, tierMetrics, tierStatus,
            tierId, tierName, tierType;

        for (var ix = 0, ixLen = Comm.tierList.length; ix < ixLen; ix++) {
            tierId   = Comm.tierList[ix];
            tierName = Comm.tierInfo[tierId].name;
            tierType = Comm.tierInfo[tierId].type;

            tierMetrics = Ext.create('rtm.src.rtmTierStat', {
                tierId   : tierId,
                tierName : tierName,
                tierType : tierType,
                tierIndex: ix
            });

            tierStatus = Ext.create('rtm.src.rtmTierStatus', {
                tierId   : tierId,
                tierName : tierName,
                tierType : tierType,
                tierIndex: ix
            });

            topCon = Ext.create('Exem.Container', {
                layout   : { type: 'vbox', align: 'stretch'},
                cls : 'dashboard-mainView-topCon',
                flex: 1
            });
            topCon.add([tierStatus, tierMetrics]);

            this.background.add(topCon);

            tierMetrics.init();
            tierStatus.init();

            tierMetrics.triggerCmpId = tierStatus.id;

            this.tierStatusIdList.push(tierStatus.id);
        }
    },

    /**
     * Start Tier Status Circle draw.
     */
    frameRefresh: function() {
        var ix, ixLen, cmpId,
            statusCmp;

        for (ix = 0, ixLen = this.tierStatusIdList.length; ix < ixLen; ix++) {
            cmpId = this.tierStatusIdList[ix];
            statusCmp = Ext.getCmp(cmpId);

            if (statusCmp) {
                statusCmp.frameRefresh();
            }
        }
    },


    /**
     * Stop Tier Status Circle draw.
     */
    frameStopDraw: function() {
        var ix, ixLen, cmpId,
            statusCmp;

        for (ix = 0, ixLen = this.tierStatusIdList.length; ix < ixLen; ix++) {
            cmpId = this.tierStatusIdList[ix];
            statusCmp = Ext.getCmp(cmpId);

            if (statusCmp) {
                statusCmp.frameStopDraw();
            }
        }
    }


});
