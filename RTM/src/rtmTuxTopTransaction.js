Ext.define('rtm.src.rtmTuxTopTransaction', {
    extend: 'rtm.src.rtmTopTransaction',
    title : 'Tuxedo' + common.Util.CTR('Realtime TOP Transaction'),

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            this.removeTooltip();

            $(this.el.dom).off('mouseover', '.'+this.cellEventCls);
            $(this.el.dom).off('mouseout', '.'+this.cellEventCls);
        }
    },


    initProperty: function() {
        this.monitorType  = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.title = 'Tuxedo ' + common.Util.CTR('Realtime TOP Transaction');

        this.txnHistoryClass = 'TuxTxnHistory';

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
