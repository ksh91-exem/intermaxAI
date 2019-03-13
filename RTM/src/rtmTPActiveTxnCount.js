Ext.define('rtm.src.rtmTPActiveTxnCount',{
    extend: 'rtm.src.rtmActiveTxnCount',
    title : this.title,
    layout: 'fit',

    initProperty: function() {
        this.title = 'TP ' + common.Util.CTR('Active Transaction Count');
        this.menu  = common.Menu.getClassConfig('rtmTPActiveTxnCount');

        this.monitorType  = 'TP';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.activeTxnListClass = 'rtm.src.rtmTPActiveTxnList';

        this.envKeyChartFit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_activeTxnChart_fit';

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
