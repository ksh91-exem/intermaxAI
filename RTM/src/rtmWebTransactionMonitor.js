Ext.define('rtm.src.rtmWebTransactionMonitor', {
    extend: 'rtm.src.rtmTransactionMonitor',
    title : common.Util.CTR('Transaction Monitor'),

    interval: 1000,

    initProperty: function() {
        this.monitorType  = 'WEB';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.totalCountText = common.Util.TR('Total Count') + ' : ';
        this.maxOverText    = common.Util.TR('Max Over Count') + ' : ';
        this.maxValueText   = common.Util.TR('Max Elapsed Time (Sec)') + ' : ';

        this.isMemoryDB = (common.Util.isUsedMemoryDB && common.Util.isUsedMemoryDB() === true);

        this.topologyFilterWasNames = [];

        this.responseInspectorClass = 'view.WebResponseInspector';
        this.responseInspectorTitle = 'WEB ' + common.Util.TR('Transaction Trend');
        this.responseInspectorType  = 'WEB';

        this.envKeyChartOption = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_transactionMonitor_chartOption';
    },


    /**
     * 트랜잭션 모니터에서 드래그한 정보에 해당하는 트랜잭션 목록을 표시한다.
     *
     * @param {object} options - 드래그한 데이터 정보
     */
    openTxnList: function(options) {
        // From, To 시간 데이터가 없는 경우 미표시
        if (!options.timeRange || options.timeRange.length < 1) {
            return;
        }

        // Min, Max Elapsed Time 정보가 없는 경우 미표시
        if (!options.elapseRange || options.elapseRange.length < 1) {
            return;
        }

        var fromTime  = Ext.Date.format(options.timeRange[0], 'Y-m-d H:i:s');
        var toTime    = Ext.Date.format(options.timeRange[1], 'Y-m-d H:i:s');
        var minElapse = parseFloat(options.elapseRange[0]);
        var maxElapse = parseFloat(options.elapseRange[1]);
        var isException = options.isExceptoin;
        var serverId;

        if (options.wasName === 'All' ) {
            serverId = this.serverNameArr.join(',');

        } else if (Array.isArray(options.wasName)) {
            serverId = options.wasName.join(',');

        } else {
            serverId  = options.wasName;
        }

        var wetTxnList = Ext.create('rtm.src.rtmWebTxnList');
        wetTxnList.filters = {
            fromTime   : fromTime,
            toTime     : toTime,
            minElapse  : minElapse,
            maxElapse  : maxElapse,
            idList     : serverId,
            isException: isException
        };

        wetTxnList.initWindow();

        setTimeout(function() {
            wetTxnList.init();
            wetTxnList = null;
        }, 10);
    }

});
