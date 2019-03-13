Ext.define('rtm.src.rtmTxnLoadPredict', {
    extend  : 'rtm.src.rtmLoadPredict',
    title   : common.Util.TR('Transaction Load Prediction'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',

    SQL: 'IMXRT_TxnLoadPredict.sql',

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

    // 쿼리를 실행한 시간
    isRunningTime   : null,

    // 차트를 그릴지 체크하는 항목
    isDrawStopChart : false,

    isSkip : false,

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);

            this.isClosedDockForm = true;
            this.chartId = null;
        }
    },


    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.chartId   = [];
        this.predictData = [];

        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        var statId, txnId, txnName, ix, ixLen;
        var viewData = Comm.RTComm.getTxnLoadPredictStatList(this.componentId);

        if (viewData) {
            statId  = viewData.stat;
            txnId   = viewData.id;
            txnName = viewData.name;
        }

        if (statId != null) {
            for (ix = 0, ixLen = realtime.loadPredictTxnStatList.length; ix < ixLen; ix++) {
                if (statId == realtime.loadPredictTxnStatList[ix].id) {
                    this.chartTitle = common.Util.TR(realtime.loadPredictTxnStatList[ix].name);
                    this.statId = statId[0];
                    break;
                }
            }
        } else {
            this.chartTitle = common.Util.TR('Transaction Execution Count');
            this.statId = realtime.loadPredictTxnStatList[0].id;
        }

        if (txnId) {
            this.txnId = txnId;
            this.txnName = txnName;
        } else {
            if (Comm.txnNameInfo.length > 0 || Comm.txnNameInfo[0]) {
                this.txnId = Comm.txnNameInfo[0].txnId;
                this.txnName = Comm.txnNameInfo[0].txnName;
            } else {
                this.txnId = 0;
                this.txnName = '';
            }
        }

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this,
            type  : 'small-circleloading'
        });
    },

    init: function() {

        this.initProperty();

        this.background = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            cls    : 'servicestat-area'
        });

        this.add(this.background);

        var rowPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '2 2 1 2',
            width  : '100%',
            border : false,
            bodyCls: 'servicestat-chart-area',
            flex: 1
        });

        var colPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'servicestat-chart',
            layout : 'fit',
            margin : '2 2 1 2',
            flex   : 1,
            height : '100%',
            border : false
        });

        this.chartId = colPanel.id;

        rowPanel.add(colPanel);

        this.background.add(rowPanel);

        this.chart = Ext.create('rtm.src.rtmTxnLoadPredictChart');
        this.chart.parent    = this;
        this.chart.parentId  = this.id;
        this.chart.setTitle(this.chartTitle, this.txnId, this.txnName);

        colPanel.add(this.chart);

        this.chart.init();

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);

        rowPanel   = null;
        colPanel   = null;
    },


    /**
     * 서비스 지표 변경.
     *
     * @param {String} statId 서비스 지표 ID
     */
    changeStat: function(statId, txnId, txnName) {
        this.isChangeStat = true;

        this.loadingMask.show();

        this.txnId = txnId;
        this.statId = statId;

        var ix, ixLen;
        for (ix = 0, ixLen = realtime.loadPredictTxnStatList.length; ix < ixLen; ix++) {
            if (statId == realtime.loadPredictTxnStatList[ix].id) {
                this.chart.setTitle(common.Util.TR(realtime.loadPredictTxnStatList[ix].name), txnId, txnName);
                break;
            }
        }

        Comm.RTComm.saveTxnLoadPredictStatList(this.componentId, [statId], txnId, txnName);

        this.refreshChartData();

        statId   = null;
    },


    /**
     * 설정된 지표에 해당하는 데이터를 조회.
     */
    queryRefresh: function() {
        var fromtime, totime, fromMinusMin, toMinusMin, predictStartIdx, loadPredictData;

        if (Repository.AILoadPredict[this.SQL]) {
            loadPredictData = Repository.AILoadPredict[this.SQL][this.txnId];
            if (loadPredictData && loadPredictData.isRunningQuery) {
                setTimeout(this.queryRefresh.bind(this), 30);
                return;
            }
        }

        // time = 16:50:00 이면 16:50:00 ~ 17:00:00 의 서머리 데이터가 들어간다.
        // 17:05:00 에 프로시저를 호출하여 데이터가 들어간다.
        // 그래서 15분 전을 toMinus
        fromMinusMin = -675;
        toMinusMin   = -15;

        fromtime = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MINUTE, fromMinusMin), 'Y-m-d H:i:00');
        fromtime = replaceAt(fromtime, 15, '0');
        totime   = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MINUTE, toMinusMin), 'Y-m-d H:i:00');
        totime   = replaceAt(totime, 15, '0');

        predictStartIdx = (Math.abs(fromMinusMin) - Math.abs(toMinusMin)) / 10;

        if(loadPredictData && loadPredictData.data && loadPredictData.data.rows[0][0] == fromtime && loadPredictData.header.parameters.bind[2].value == this.txnId) {
            if (loadPredictData.data.rows[predictStartIdx][2] == null && !this.isSkip) {
                this.isSkip = !this.isSkip;
                return;
            }
            this.onData(loadPredictData.header, loadPredictData.data);

        } else {
            try {
                if (!Repository.AILoadPredict[this.SQL]) {
                    Repository.AILoadPredict[this.SQL] = {};
                }
                Repository.AILoadPredict[this.SQL][this.txnId] = {};
                Repository.AILoadPredict[this.SQL][this.txnId].isRunningQuery = true;

                this.isRunningQuery = true;
                this.isRunningTime  = Date.now();

                WS.SQLExec({
                    sql_file: this.SQL,
                    bind: [{
                        name: 'fromtime', value: fromtime, type: SQLBindType.STRING
                    }, {
                        name: 'totime',   value: totime, type: SQLBindType.STRING
                    }, {
                        name: 'txnId',   value: this.txnId, type: SQLBindType.STRING
                    }]
                }, this.onData, this);

            } finally {
                fromtime    = null;
                totime      = null;
            }

        }

        function replaceAt(str, index, replacement) {
            return str.substr(0, index) + replacement + str.substr(index + replacement.length);
        }
    }

});

