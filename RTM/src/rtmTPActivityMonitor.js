Ext.define('rtm.src.rtmTPActivityMonitor', {
    extend: 'rtm.src.rtmActivityMonitor',
    title : 'TP ' + common.Util.TR('Activity Monitor'),


    initProperty: function() {
        this.monitorType = 'TP';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.rtmActiveTxnListClass = 'rtm.src.rtmTPActiveTxnList';

        this.title = 'TP ' + common.Util.TR('Activity Monitor');

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
