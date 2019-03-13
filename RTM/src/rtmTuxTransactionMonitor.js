Ext.define('rtm.src.rtmTuxTransactionMonitor', {
    extend: 'rtm.src.rtmTransactionMonitor',
    title : 'Tuxedo ' + common.Util.CTR('Transaction Monitor'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    interval: 1000,

    initProperty: function() {
        this.monitorType = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.totalCountText = common.Util.TR('Total Count') + ' : ';
        this.maxOverText    = common.Util.TR('Max Over Count') + ' : ';
        this.maxValueText   = common.Util.TR('Max Elapsed Time (Sec)') + ' : ';

        this.isMemoryDB = (common.Util.isUsedMemoryDB && common.Util.isUsedMemoryDB() === true);

        this.topologyFilterWasNames = [];

        this.responseInspectorClass = 'view.TuxResponseInspector';
        this.responseInspectorTitle = 'Tuxedo ' + common.Util.TR('Transaction Trend');
        this.responseInspectorType  = 'TUX';

        this.envKeyChartOption = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_transactionMonitor_chartOption';

        this.title = 'Tuxedo ' + common.Util.CTR('Transaction Monitor');

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
