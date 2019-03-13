Ext.define('rtm.src.rtmCDActivityMonitor', {
    extend: 'rtm.src.rtmActivityMonitor',
    title : common.Util.TR('Activity Monitor'),

    initProperty: function() {
        this.monitorType  = 'CD';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.rtmActiveTxnListClass = null;

        this.title = common.Util.TR('Activity Monitor');

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
