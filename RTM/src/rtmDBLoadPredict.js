Ext.define('rtm.src.rtmDBLoadPredict', {
    extend  : 'rtm.src.rtmLoadPredict',
    title   : common.Util.TR('DB Load Prediction'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',

    SQL: 'IMXRT_DBLoadPredict.sql',

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

        var statId, dbId, ix, ixLen;
        var viewData = Comm.RTComm.getDBLoadPredictStatList(this.componentId);

        if (viewData) {
            statId = viewData.stat;
            dbId  = viewData.id;
        }

        if (statId != null) {
            for (ix = 0, ixLen = realtime.loadPredictDBStatList.length; ix < ixLen; ix++) {
                if (statId == realtime.loadPredictDBStatList[ix].id) {
                    this.chartTitle = common.Util.TR(realtime.loadPredictDBStatList[ix].name);
                    this.statId = statId[0];
                    break;
                }
            }
        } else {
            this.chartTitle = common.Util.TR('DB Time');
            this.statId = realtime.loadPredictDBStatList[0].id;
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

        this.chart = Ext.create('rtm.src.rtmDBLoadPredictChart');
        this.chart.parent    = this;
        this.chart.parentId  = this.id;
        this.chart.statId    = this.statId;
        this.chart.setTitle(this.chartTitle, this.dbId);

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
    changeStat: function(statId, dbId) {
        this.isChangeStat = true;

        this.loadingMask.show();

        this.dbId = dbId;
        this.statId = statId;

        var ix, ixLen;
        for (ix = 0, ixLen = realtime.loadPredictDBStatList.length; ix < ixLen; ix++) {
            if (statId == realtime.loadPredictDBStatList[ix].id) {
                this.chart.setTitle(common.Util.TR(realtime.loadPredictDBStatList[ix].name), dbId);
                break;
            }
        }

        Comm.RTComm.saveDBLoadPredictStatList(this.componentId, [statId], dbId);

        this.refreshChartData();

        statId   = null;
    },


    /**
     * 설정된 지표에 해당하는 데이터를 조회.
     */
    queryRefresh: function() {
        var fromtime, totime, fromMinusMin, toMinusMin, predictStartIdx, loadPredictData;

        if (Repository.AILoadPredict[this.SQL]) {
            loadPredictData = Repository.AILoadPredict[this.SQL][this.dbId];
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

        if(loadPredictData && loadPredictData.data && loadPredictData.data.rows[0][0] == fromtime && loadPredictData.header.parameters.replace_string[0].value == this.dbId) {
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
                Repository.AILoadPredict[this.SQL][this.dbId] = {};
                Repository.AILoadPredict[this.SQL][this.dbId].isRunningQuery = true;

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

    }

});

