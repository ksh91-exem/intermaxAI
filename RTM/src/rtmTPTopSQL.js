Ext.define('rtm.src.rtmTPTopSQL', {
    extend: 'rtm.src.rtmTopSQL',
    title : 'TP' + common.Util.CTR('Realtime TOP SQL'),

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            this.removeTooltip();
        }
    },

    initProperty: function() {
        this.monitorType  = 'TP';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.sqlGridName = 'intermax_rtm_tp_topsql';

        this.title = 'TP ' + common.Util.CTR('Realtime TOP SQL');

        this.sqlHistoryClass = 'TPSQLHistory';

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
