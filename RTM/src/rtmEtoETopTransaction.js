Ext.define('rtm.src.rtmEtoETopTransaction', {
    extend: 'rtm.src.rtmTopTransaction',
    title : common.Util.CTR('Realtime TOP Transaction'),

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
        this.monitorType  = 'E2E';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getAllServerNameArr().concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.title = common.Util.CTR('Realtime TOP Transaction');

        this.txnHistoryClass = 'TxnHistory';

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    },

    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getAllServerNameArr().concat();

        this.frameChange(this.serverNameArr.concat());
    }

});
