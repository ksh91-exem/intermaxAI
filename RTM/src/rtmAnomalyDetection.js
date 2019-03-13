Ext.define('rtm.src.rtmAnomalyDetection', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('WAS Anomaly Detection'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',

    SQL: 'IMXRT_AnomalyDetection.sql',

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

    // 쿼리를 실행한 시간
    isRunningTime   : null,

    // 차트를 그릴지 체크하는 항목
    isDrawStopChart : false,

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
        this.todayData = [];

        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        var statId, wasId, ix, ixLen;
        var viewData = Comm.RTComm.getAnomalyDetectionStatList(this.componentId);

        if (viewData) {
            statId = viewData.stat;
            wasId  = viewData.id;
        }

        if (statId != null) {
            for (ix = 0, ixLen = realtime.anoDetectionStatList.length; ix < ixLen; ix++) {
                if (statId == realtime.anoDetectionStatList[ix].id) {
                    this.chartTitle = common.Util.TR(realtime.anoDetectionStatList[ix].name);
                    this.statId = statId[0];
                    break;
                }
            }
        } else {
            this.chartTitle = common.Util.TR('TPS');
            this.statId = realtime.anoDetectionStatList[0].id;
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

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '5 10 0 5',
            cls    : 'servicestat-area'
        });
        this.add(this.background);

        this.chartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            flex: 1,
            cls: 'servicestat-chart-area'
        });

        this.background.add(this.chartArea);

        this.chart = Ext.create('rtm.src.rtmAnomalyDetectionChart');
        this.chartArea.add(this.chart);

        this.chart.parent    = this;
        this.chart.parentId  = this.id;
        this.chart.statId    = this.statId;
        this.chart.setTitle(this.chartTitle, this.wasId);

        this.chart.init();

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);
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
        var ix, ixLen;

        this.isChangeStat = true;
        this.loadingMask.show();

        this.wasId = wasId;
        this.statId = statId;

        for (ix = 0, ixLen = realtime.anoDetectionStatList.length; ix < ixLen; ix++) {
            if (statId === realtime.anoDetectionStatList[ix].id) {
                this.chart.setTitle(common.Util.TR(realtime.anoDetectionStatList[ix].name), wasId);
                break;
            }
        }

        Comm.RTComm.saveAnomalyDetectionStatList(this.componentId, [statId], wasId);

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
        var fromtime, totime;

        fromtime = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MINUTE, -120), 'Y-m-d H:i:00');
        totime   = Ext.Date.format(new Date(), 'Y-m-d H:i:00');

        try {

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
    },


    /**
     * 조회된 데이터를 차트에 그리기 위한 데이터로 구성.
     *
     * @param {Object} aheader
     * @param {Object} adata
     */
    onData: function(aheader, adata) {
        var isValidate = common.Util.checkSQLExecValid(aheader, adata),
            ix, ixLen;

        this.isRunningQuery = false;

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

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++ ) {
            this.todayData[ix] = [
                +new Date(adata.rows[ix][0]),   // time
                adata.rows[ix][indexOf],        // stat
                adata.rows[ix][indexOf + 1],    // moving average
                adata.rows[ix][indexOf + 2],    // lower
                adata.rows[ix][indexOf + 3],    // upper
                adata.rows[ix][indexOf + 4]     // isAnomaly
            ];
        }

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
        this.chart.drawData(this.todayData, this.statId);
    }

});

