Ext.define('rtm.src.rtmTuxActiveTxnCount',{
    extend: 'rtm.src.rtmActiveTxnCount',
    title : this.title,
    layout: 'fit',

    initProperty: function() {
        this.title = 'Tuxedo ' + common.Util.CTR('Active Transaction Count');
        this.menu  = common.Menu.getClassConfig('rtmTuxActiveTxnCount');

        this.monitorType  = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.activeTxnListClass = 'rtm.src.rtmTuxActiveTxnList';

        this.envKeyChartFit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_activeTxnChart_fit';

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
