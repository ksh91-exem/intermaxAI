Ext.define('rtm.src.rtmTuxActivityMonitor', {
    extend: 'rtm.src.rtmActivityMonitor',
    title : 'Tuxedo ' + common.Util.TR('Activity Monitor'),


    initProperty: function() {
        this.monitorType = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.rtmActiveTxnListClass = 'rtm.src.rtmTuxActiveTxnList';

        this.title = 'Tuxedo ' + common.Util.TR('Activity Monitor');

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
