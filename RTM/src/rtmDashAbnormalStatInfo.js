Ext.define('rtm.src.rtmDashAbnormalStatInfo', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('이상 지표 정보'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',
    cls : 'dockform abnormal-stat-info',
    url : 'http://192.168.0.11:9999',

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

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

        this.chartArr = [];

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
            layout: 'vbox',
            width: '100%',
            height: 420,
            margin : '0 0 10 0',
            style : {
                background : '#ffffff',
                'border-color': 'rgb(187, 187, 187)',
                'border-width': '0.75px',
                'border-style': 'solid',
                'overflow' : 'hidden scroll'
            }
        });

        var ix, ixLen;
        for (ix = 0, ixLen = 5; ix < ixLen; ix++) {
            this.chart = Ext.create('rtm.src.rtmDashTxnLoadPredictChart', {
                height : '200px',
                style : {
                    'margin-bottom' : '20px'
                }
            });
            this.chart.titleClass = 'statInfo-title';
            this.chart.showLegend = false;
            this.chart.setTitle('지표명#111');

            this.chartArr.push(this.chart);
            this.chartArea.add(this.chart);
            this.chart.init();
        }

        this.background.add(this.topContentsArea, this.chartArea);

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);
    },

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
                this.drawData(data.body, data.header.stat);
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                console.log(XHR, textStatus, errorThrown);
            }
        });
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

    drawData: function(data, statId)  {
        var ix, ixLen,
            chart;

        for (ix = 0, ixLen = this.chartArr.length; ix < ixLen; ix++) {
            chart = this.chartArr[ix].chart;

            if (chart.serieseList == null) {
                return;
            }

            chart.clearValues();

            chart.lastValueIndex = Comm.RTComm.getCurrentIndexOfDay();

            var jx, jxLen, decimal;

            for (jx = 0, jxLen = data.length; jx < jxLen; jx++) {
                if (data[jx][3] < 0) {
                    data[jx][3] = 0;
                }
                if (data[jx][5] < 0) {
                    data[jx][5] = 0;
                }

                chart.addValue(0, [+new Date(data[jx][0]), data[jx][1]]);
                chart.addValue(1, [+new Date(data[jx][0]), data[jx][4]]);
                chart.addValue(2, [+new Date(data[jx][0]), [data[jx][2], data[jx][3]]]);
                chart.addValue(3, [+new Date(data[jx][0]), [data[jx][5], data[jx][6]]]);
            }

            if (statId.indexOf('time') !== -1 || statId === 'txn_elapse') {
                decimal = 3;
            } else {
                decimal = 2;
            }
            chart.toFixedNumber = decimal;
            chart.draw();
        }
    }
});

