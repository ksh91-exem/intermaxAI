Ext.define('rtm.src.rtmWebActivityMonitor', {
    extend: 'rtm.src.rtmActivityMonitor',
    title : common.Util.TR('Activity Monitor'),


    initProperty: function() {
        this.monitorType  = 'WEB';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.rtmActiveTxnListClass = 'rtm.src.rtmWebActiveTxnList';
    }

});
