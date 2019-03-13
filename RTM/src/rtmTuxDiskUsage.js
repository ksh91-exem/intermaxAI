Ext.define('rtm.src.rtmTuxDiskUsage', {
    extend: 'rtm.src.rtmDiskUsage',
    title : 'Tuxedo' + common.Util.TR('Disk Usage'),

    initProperty: function() {
        this.monitorType  = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.displayHostList = realtime.TuxHostList.concat();

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
