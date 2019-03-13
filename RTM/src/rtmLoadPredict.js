Ext.define('rtm.src.rtmLoadPredict', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('WAS Load Prediction'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',

    SQL: 'IMXRT_LoadPredict.sql',

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

        var statId, wasId, ix, ixLen;
        var viewData = Comm.RTComm.getLoadPredictStatList(this.componentId);

        if (viewData) {
            statId = viewData.stat;
            wasId  = viewData.id;
        }

        if (statId != null) {
            for (ix = 0, ixLen = realtime.loadPredictStatList.length; ix < ixLen; ix++) {
                if (statId == realtime.loadPredictStatList[ix].id) {
                    this.chartTitle = common.Util.TR(realtime.loadPredictStatList[ix].name);
                    this.statId = statId[0];
                    break;
                }
            }
        } else {
            this.chartTitle = common.Util.TR('Active Transaction Count');
            this.statId = realtime.loadPredictStatList[0].id;
        }

        var keys = Object.keys(Comm.wasInfoObj),
            initWasId, key;

        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];
            if (Comm.wasInfoObj[key].type == 'WAS') {
                initWasId = key;
                break;
            }
        }

        if (wasId != null) {
            this.wasId = wasId;
        } else {
            this.wasId = initWasId;
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

        this.chart = Ext.create('rtm.src.rtmLoadPredictChart');
        this.chart.parent    = this;
        this.chart.parentId  = this.id;
        this.chart.statId    = this.statId;
        this.chart.setTitle(this.chartTitle, this.wasId);

        colPanel.add(this.chart);

        this.chart.init();

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);

        rowPanel   = null;
        colPanel   = null;
    },


    frameRefresh: function() {
        this.isDrawStopChart = false;

        setTimeout(this.refreshChartData.bind(this), 30);
    },


    frameStopDraw: function() {
        this.isDrawStopChart = true;
    },


    /**
     * 서비스 지표 변경.
     *
     * @param {String} statId 서비스 지표 ID
     */
    changeStat: function(statId, wasId) {
        this.isChangeStat = true;

        this.loadingMask.show();

        this.wasId = wasId;
        this.statId = statId;

        var ix, ixLen;
        for (ix = 0, ixLen = realtime.loadPredictStatList.length; ix < ixLen; ix++) {
            if (statId == realtime.loadPredictStatList[ix].id) {
                this.chart.setTitle(common.Util.TR(realtime.loadPredictStatList[ix].name), wasId);
                break;
            }
        }

        Comm.RTComm.saveLoadPredictStatList(this.componentId, [statId], wasId);

        this.refreshChartData();

        statId   = null;
    },


    /**
     * 서비스 지표 차트를 일정주기로 업데이트.
     *
     * 각 컴포넌트에서 업데이트 처리하던 것을 RTMDataManager에서 일괄 관리하도록 변경.
     */
    refreshChartData: function() {
        if (this.isDrawStopChart) {
            return;
        }

        /*
         * 쿼리가 실행되고 있는지 체크하고 있는 시간이 2분이 넘는 경우 체크값을 초기화한다.
         * 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행유무를 체크하는 항목
         */
        if (Date.now() - this.isRunningTime > 120000) {
            this.isRunningQuery = false;
        }

        if (!this.isRunningQuery) {
            this.queryRefresh();
        }
    },


    /**
     * 설정된 지표에 해당하는 데이터를 조회.
     */
    queryRefresh: function() {
        var fromtime, totime, fromMinusMin, toMinusMin, predictStartIdx, loadPredictData;

        if (Repository.AILoadPredict[this.SQL]) {
            loadPredictData = Repository.AILoadPredict[this.SQL][this.wasId];
            if (loadPredictData && loadPredictData.isRunningQuery) {
                setTimeout(this.queryRefresh.bind(this), 30);
                return;
            }
        }

        fromMinusMin = -91;
        toMinusMin   = -1;

        fromtime = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MINUTE, fromMinusMin), 'Y-m-d H:i:00');
        totime   = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MINUTE, toMinusMin), 'Y-m-d H:i:00');

        predictStartIdx = Math.abs(fromMinusMin) - Math.abs(toMinusMin);

        if (loadPredictData && loadPredictData.data && loadPredictData.data.rows[0][0] == fromtime && loadPredictData.header.parameters.replace_string[0].value == this.wasId) {
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
                Repository.AILoadPredict[this.SQL][this.wasId] = {};
                Repository.AILoadPredict[this.SQL][this.wasId].isRunningQuery = true;

                this.isRunningQuery = true;
                this.isRunningTime  = Date.now();

                WS.SQLExec({
                    sql_file: this.SQL,
                    bind: [{
                        name: 'fromtime', value: fromtime, type: SQLBindType.STRING
                    }, {
                        name: 'totime',   value: totime, type: SQLBindType.STRING
                    }],
                    replace_string: [{
                        name: 'was_id',   value: this.wasId
                    }]
                }, this.onData, this);

            } finally {
                fromtime    = null;
                totime      = null;
            }
        }

    },


    /**
     * 조회된 데이터를 차트에 그리기 위한 데이터로 구성.
     *
     * @param {Object} aheader
     * @param {Object} adata
     */
    onData: function(aheader, adata) {

        var isValidate = common.Util.checkSQLExecValid(aheader, adata),
            bind, ix, ixLen;

        this.isRunningQuery = false;
        this.isSkip         = false;

        if (this.isClosedDockForm === true) {
            return;
        }

        if (!isValidate) {
            if (this.isChangeStat === true) {
                this.isChangeStat = false;
                this.loadingMask.hide();
            }
            return;
        }

        if (Comm.currentRepositoryInfo.database_type === 'Oracle' || Comm.currentRepositoryInfo.database_type === 'MSSQL') {
            adata.columns = common.Util.toLowerCaseArray(adata.columns);
        }

        var indexOf = adata.columns.indexOf(this.statId);

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            this.predictData[ix] = [
                +new Date(adata.rows[ix][0]), // time
                adata.rows[ix][indexOf],      // 오늘
                adata.rows[ix][indexOf + 1],  // 예측 값
                adata.rows[ix][indexOf + 2],  // pre_lower
                adata.rows[ix][indexOf + 3],  // pre_upper
                adata.rows[ix][indexOf + 4],  // lower
                adata.rows[ix][indexOf + 5]   // upper
            ];
        }


        if (this.SQL == 'IMXRT_TxnLoadPredict.sql' || this.SQL == 'IMXRT_BizLoadPredict.sql') {
            bind = aheader.parameters.bind[2].value;
        } else {
            bind = aheader.parameters.replace_string[0].value;
        }

        if (!Repository.AILoadPredict[this.SQL]) {
            Repository.AILoadPredict[this.SQL] = {};
            Repository.AILoadPredict[this.SQL][bind] = {};
        }

        Repository.AILoadPredict[this.SQL][bind].isRunningQuery = false;
        Repository.AILoadPredict[this.SQL][bind].header = aheader;
        Repository.AILoadPredict[this.SQL][bind].data   = adata;

        aheader = null;
        adata   = null;

        this.drawData();

        if (this.isChangeStat === true) {
            this.isChangeStat = false;
            this.loadingMask.hide();
        }
    },


    /**
     * 차트 그리기
     */
    drawData: function() {
        //console.log(this.predictData);
        this.chart.drawData(this.predictData, this.statId);
    }

});

