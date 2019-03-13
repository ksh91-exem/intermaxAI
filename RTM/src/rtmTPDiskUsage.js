Ext.define('rtm.src.rtmTPDiskUsage', {
    extend: 'rtm.src.rtmDiskUsage',
    title : 'TP' + common.Util.TR('Disk Usage'),

    initProperty: function() {
        this.monitorType  = 'TP';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.displayHostList = realtime.TPHostList.concat();

        // 1: WAS, 2: DB, 3: WebServer, 15: C Daemon (APIM)
        this.serverType = 1;

        this.envKeyUsageLimit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_diskusage_limit';
        this.diskusageLimit = Comm.web_env_info[this.envKeyUsageLimit];

        if (this.diskusageLimit) {
            this.txnFilterDiskUsage = +this.diskusageLimit;
        } else {
            this.txnFilterDiskUsage = 0;
        }

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
