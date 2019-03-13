Ext.define('rtm.src.rtmCDTopSQL', {
    extend: 'rtm.src.rtmTopSQL',
    title : 'C Daemon' + common.Util.CTR('Realtime TOP SQL'),

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            this.removeTooltip();
        }
    },

    initProperty: function() {
        this.monitorType  = 'CD';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.sqlGridName = 'intermax_rtm_cd_topsql';

        this.title = 'C Daemon ' + common.Util.CTR('Realtime TOP SQL');

        this.sqlHistoryClass = null;

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
