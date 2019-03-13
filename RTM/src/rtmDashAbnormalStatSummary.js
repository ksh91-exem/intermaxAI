Ext.define('rtm.src.rtmDashAbnormalStatSummary', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('이상 지표 요약'),
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
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);

            this.isClosedDockForm = true;
            this.chartId = null;
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this,
            type  : 'small-circleloading'
        });
    },

    init: function() {

        this.initProperty();
        this.initLayout();

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);
    },

    initLayout: function() {

        var self = this;

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 10 0 10'
        });

        this.add(this.background);

        this.topContentsArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : 30,
            layout : 'hbox',
            margin : '15 10 10 0'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 30,
            margin : '0 0 0 15',
            cls    : 'header-title',
            text   : this.title,
            style  : {
                'top'       : '15px',
                'font-size' : '16px'
            }
        });

        this.topContentsArea.add(this.frameTitle);

        this.chartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            margin : '0 0 10 0',
            flex: 1,
            listeners: {
                resize: function(_this) {
                    if (self.chart) {
                        self.chart.draw(self.chart.id, _this.el.dom.clientWidth, _this.el.dom.clientHeight);
                    }
                }
            }
        });

        this.background.add(this.topContentsArea, this.chartArea);

        this.createChart();
    },

    createChart: function() {
        var girdLineColor;
        var borderColor;
        var theme = Comm.RTComm.getCurrentTheme();
        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        switch (theme) {
            case 'Black' :
                labelStyle.color = '#fff';
                girdLineColor    = '#525359';
                borderColor      = '#81858A';
                break;
            case 'Gray' :
                labelStyle.color = '#ABAEB5';
                girdLineColor    = '#525359';
                borderColor      = '#81858A';
                break;
            default :
                labelStyle.color = '#555555';
                girdLineColor    = '#F0F0F0';
                borderColor      = '#ccc';
                break;
        }

        this.chart = Ext.create('rtm.src.rtmDashAbnormalStatSummaryChart');

        this.chartArea.add(this.chart);

        this.chart.draw(this.chart.id, this.chartArea.getWidth(), this.chartArea.getHeight());
    },

    queryRefresh: function() {
        var data = {
            body : {
                "txn01": [1, 0, 3],
                "txn02": [5, 2, 11],
                "txn03": [5, 2, 11],
                "txn04": [5, 2, 11],
                "txn05": [5, 2, 11]
            }
        };

        this.drawData(data.body);
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

        this.queryRefresh();
    },

    drawData: function(data) {
        this.chart.setData(data);
    }

});

