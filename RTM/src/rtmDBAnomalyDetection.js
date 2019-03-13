Ext.define('rtm.src.rtmDBAnomalyDetection', {
    extend  : 'rtm.src.rtmAnomalyDetection',
    title   : common.Util.TR('DB Anomaly Detection'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',

    SQL: 'IMXRT_DBAnomalyDetection.sql',

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

        var statId, dbId, ix, ixLen;
        var viewData = Comm.RTComm.getAnomalyDetectionDBStatList(this.componentId);

        if (viewData) {
            statId = viewData.stat;
            dbId  = viewData.id;
        }

        if (statId != null) {
            for (ix = 0, ixLen = realtime.anoDetectionDBStatList.length; ix < ixLen; ix++) {
                if (statId == realtime.anoDetectionDBStatList[ix].id) {
                    this.chartTitle = common.Util.TR(realtime.anoDetectionDBStatList[ix].name);
                    this.statId = statId[0];
                    break;
                }
            }
        } else {
            this.chartTitle = common.Util.TR('CPU Usage');
            this.statId = realtime.anoDetectionDBStatList[0].id;
        }

        var initDBId;
        if (Comm.activateDB.length) {
            initDBId = Comm.activateDB[0][0];
        } else {
            initDBId = 0;
        }

        if (dbId != null) {
            this.dbId = dbId;
        } else {
            this.dbId = initDBId;
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

        this.chart = Ext.create('rtm.src.rtmDBAnomalyDetectionChart');
        this.chartArea.add(this.chart);

        this.chart.parent    = this;
        this.chart.parentId  = this.id;
        this.chart.statId    = this.statId;
        this.chart.setTitle(this.chartTitle, this.dbId);

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
    changeStat: function(statId, dbId) {
        var ix, ixLen;

        this.isChangeStat = true;
        this.loadingMask.show();

        this.dbId = dbId;
        this.statId = statId;

        for (ix = 0, ixLen = realtime.anoDetectionDBStatList.length; ix < ixLen; ix++) {
            if (statId === realtime.anoDetectionDBStatList[ix].id) {
                this.chart.setTitle(common.Util.TR(realtime.anoDetectionDBStatList[ix].name), dbId);
                break;
            }
        }

        Comm.RTComm.saveAnomalyDetectionDBStatList(this.componentId, [statId], dbId);

        this.refreshChartData();

        statId   = null;
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
                    name: 'db_id',   value: this.dbId
                }]
            }, this.onData, this);

        } finally {
            fromtime    = null;
            totime      = null;
        }
    }

});

