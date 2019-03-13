Ext.define('rtm.src.rtmTuxTopSQL', {
    extend: 'rtm.src.rtmTopSQL',
    title : 'Tuxedo' + common.Util.CTR('Realtime TOP SQL'),

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            this.removeTooltip();
        }
    },

    initProperty: function() {
        this.monitorType  = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.sqlGridName = 'intermax_rtm_tux_topsql';

        this.title = 'Tuxedo ' + common.Util.CTR('Realtime TOP SQL');

        this.sqlHistoryClass = 'TuxSQLHistory';

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
