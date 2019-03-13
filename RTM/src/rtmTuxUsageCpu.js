Ext.define('rtm.src.rtmTuxUsageCpu',{
    extend: 'rtm.src.rtmUsageCpu',
    title : 'Tuxedo ' + common.Util.CTR('CPU Usage'),
    layout: 'fit',

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, this.barChart);
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WASSTAT, this.barChart);

            this.frameStopDraw();
        }
    },

    initProperty: function() {
        this.monitorType  = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.envKeyChartFit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_usageCpuChart_fit';

        this.title = 'Tuxedo ' + common.Util.CTR('CPU Usage');

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
