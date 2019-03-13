Ext.define('rtm.src.rtmDashLoadPredict', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('WAS Load Prediction'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',
    url : 'http://192.168.0.11:9999',

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

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

        this.initFlag = true;

        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        var statId, wasId, ix, ixLen;
        var viewData = Comm.RTComm.getDashLoadPredictStatList(this.componentId);

        if (viewData) {
            statId = viewData.stat;
            wasId  = viewData.id;
        }

        if (statId != null) {
            for (ix = 0, ixLen = realtime.dashLoadPredictStatList.length; ix < ixLen; ix++) {
                if (statId == realtime.dashLoadPredictStatList[ix].id) {
                    this.chartTitle = common.Util.TR(realtime.dashLoadPredictStatList[ix].name);
                    this.statId = statId[0];
                    break;
                }
            }
        } else {
            this.chartTitle = common.Util.TR('Active Transaction Count');
            this.statId = realtime.dashLoadPredictStatList[0].id;
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

        this.chart = Ext.create('rtm.src.rtmDashLoadPredictChart');
        this.chart.parent    = this;
        this.chart.parentId  = this.id;
        this.chart.statId    = this.statId;
        this.chart.setTitle(this.chartTitle);

        colPanel.add(this.chart);

        this.chart.init();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);

        rowPanel   = null;
        colPanel   = null;
    },

    /**
     * 서비스 지표 변경.
     *
     * @param {String} statId 서비스 지표 ID
     */
    changeStat: function(statId) {
        this.isChangeStat = true;

        this.loadingMask.show();

        var ix, ixLen;
        for (ix = 0, ixLen = realtime.dashLoadPredictStatList.length; ix < ixLen; ix++) {
            if (statId == realtime.dashLoadPredictStatList[ix].id) {
                this.chart.setTitle(common.Util.TR(realtime.dashLoadPredictStatList[ix].name));
                break;
            }
        }

        Comm.RTComm.saveDashLoadPredictStatList(this.componentId, [statId]);

        this.refreshChartData();

        statId   = null;
    },


    frameRefresh: function() {
        this.isDrawStopChart = false;

        setTimeout(this.refreshChartData.bind(this), 30);
    },


    frameStopDraw: function() {
        this.isDrawStopChart = true;
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

        if (!this.isRunningQuery) {
            this.queryRefresh();
        }
    },


    /**
     * 설정된 지표에 해당하는 데이터를 조회.
     */
    queryRefresh: function() {
        $.ajax({
            type : 'get',
            url  : this.url + '/graph/etoe/all',
            dataType: 'json',
            contentType: 'application/json',
            data : {
                "date": "2018-11-01 11:00:00"
            },
            success: function(data) {
                console.log(data);
                // this.drawAlarm(data.header.status);
                // this.drawData(data.body, data.header.stat);
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                console.log(XHR, textStatus, errorThrown);
            }
        });
    },


    /**
     * 조회된 데이터를 차트에 그리기 위한 데이터로 구성.
     *
     * @param {Object} aheader
     * @param {Object} adata
     */
    onData: function(data) {

        var ix, ixLen, jx, jxLen;

        if (this.isClosedDockForm === true) {
            return;
        }

        var RepositoryData = Repository.AILoadPredict[data.uid];

        for (ix = 0, ixLen = RepositoryData.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = data.body.length; jx < jxLen; jx++) {
                if (+new Date(data.date) == RepositoryData[ix][0]) {
                    RepositoryData[ix][2] = data.body[jx]['stat001'][0].value;

                    RepositoryData[ix + 1][2] = data.body[jx]['stat001'][1].value;
                    RepositoryData[ix + 1][3] = data.body[jx]['stat001'][1].lower;
                    RepositoryData[ix + 1][4] = data.body[jx]['stat001'][1].upper;

                    RepositoryData[ix + 2][2] = data.body[jx]['stat001'][2].value;
                    RepositoryData[ix + 2][3] = data.body[jx]['stat001'][2].lower;
                    RepositoryData[ix + 2][4] = data.body[jx]['stat001'][2].upper;

                    RepositoryData[ix + 3][2] = data.body[jx]['stat001'][3].value;
                    RepositoryData[ix + 3][3] = data.body[jx]['stat001'][3].lower;
                    RepositoryData[ix + 3][4] = data.body[jx]['stat001'][3].upper;

                    RepositoryData[ix + 4][2] = data.body[jx]['stat001'][4].value;
                    RepositoryData[ix + 4][3] = data.body[jx]['stat001'][4].lower;
                    RepositoryData[ix + 4][4] = data.body[jx]['stat001'][4].upper;
                }
            }
        }

        Repository.AILoadPredict[data.uid] = RepositoryData;

        this.drawData(Repository.AILoadPredict[data.uid]);

        if (this.isChangeStat === true) {
            this.isChangeStat = false;
            this.loadingMask.hide();
        }

        if (this.isRunningQuery === true) {
            this.isRunningQuery = false;
        }
    },


    /**
     * 차트 그리기
     */
    drawData: function(data) {
        this.chart.drawData(data, this.statId);
    }

});

