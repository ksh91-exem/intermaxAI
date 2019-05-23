Ext.define('rtm.src.rtmDashTxnLoadPredict1', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('Transaction Load Prediction'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',
    
    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

    // 차트를 그릴지 체크하는 항목
    isDrawStopChart : false,

    isInit : true,
    wooriPocDataFolder : realtime.wooriPocDataFolder,

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);
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
        var viewData = Comm.RTComm.getDashTxnLoadPredictStatList(this.componentId);

        if (viewData) {
            statId = viewData.stat;
            wasId  = viewData.id;
        }

        if (statId != null) {
            for (ix = 0, ixLen = realtime.dashTxnLoadPredictStatList.length; ix < ixLen; ix++) {
                if (statId == realtime.dashTxnLoadPredictStatList[ix].id) {
                    this.chartTitle = common.Util.TR(realtime.dashTxnLoadPredictStatList[ix].name);
                    this.statId = statId[0];
                    break;
                }
            }
        } else {
            this.chartTitle = common.Util.TR('TPS');
            this.statId = realtime.dashTxnLoadPredictStatList[0].id;
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
            margin : '0 2 1 0',
            width  : '100%',
            border : false,
            bodyCls: 'servicestat-chart-area',
            flex: 1
        });

        var colPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'servicestat-chart',
            layout : 'fit',
            margin : '0 2 1 0',
            flex   : 1,
            height : '100%',
            border : false
        });

        this.chartId = colPanel.id;

        rowPanel.add(colPanel);

        this.background.add(rowPanel);

        this.chart = Ext.create('rtm.src.rtmDashTxnLoadPredictChart');
        this.chart.parent    = this;
        this.chart.parentId  = this.id;
        this.chart.statId    = this.statId;
        this.chart.setTitle(this.chartTitle, this.wasId);

        colPanel.add(this.chart);

        this.chart.init();

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);

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
        for (ix = 0, ixLen = realtime.dashTxnLoadPredictStatList.length; ix < ixLen; ix++) {
            if (statId == realtime.dashTxnLoadPredictStatList[ix].id) {
                this.chart.setTitle(common.Util.TR(realtime.dashTxnLoadPredictStatList[ix].name));
                break;
            }
        }

        Comm.RTComm.saveDashTxnLoadPredictStatList(this.componentId, [statId]);

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
        var folder;
        if (this.isInit) {
            folder = this.wooriPocDataFolder + '_N';
        } else {
            folder = this.wooriPocDataFolder;
        }

        $.ajax({
            type : 'get',
            url  : '../service/' + folder + '/graph_etoe_restm_' + this.wooriPocDataFolder + '.json',
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                this.drawAlarm(data.header.status);
                this.drawData(data.body, data.header.stat);

                this.isInit = false;
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                console.log(XHR, textStatus, errorThrown);
            }
        });
    },


    drawAlarm: function(status) {
        if (status == 'critical') {
            this.chart.up().up().setStyle('border-color', '#ff5270');
            this.chart.up().up().setStyle('border-style', 'solid');
            this.chart.up().up().setStyle('border-width', '3px');
            this.chart.up().up().setStyle('border-radius', '5px');
        } else {
            this.chart.up().up().setStyle('border-color', '');
            this.chart.up().up().setStyle('border-style', '');
        }
    },

    /**
     * 차트 그리기
     */
    drawData: function(data, stat) {
        this.chart.statId = stat;
        this.chart.setTitle('Execution Count');
        this.chart.drawData(data, stat);
    }

});

