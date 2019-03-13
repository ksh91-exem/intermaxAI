Ext.define('rtm.src.rtmAnomalyDetectionChart', {
    extend: 'Ext.container.Container',
    layout: 'fit',
    width : '100%',
    height: '100%',
    target: null,
    parent: null,
    title : '',
    wasId : '',
    statId : '',

    constructor: function() {
        this.callParent(arguments);
    },

    init: function() {

        var theme = Comm.RTComm.getCurrentTheme();

        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        var girdLineColor = null;
        var borderColor = null;

        switch (theme) {
            case 'Black' :
                labelStyle.color = realtime.lineChartColor.BLACK.label;
                girdLineColor    = realtime.lineChartColor.BLACK.gridLine;
                borderColor      = realtime.lineChartColor.BLACK.border;
                break;
            case 'Gray' :
                labelStyle.color = realtime.lineChartColor.GRAY.label;
                girdLineColor    = realtime.lineChartColor.GRAY.gridLine;
                borderColor      = realtime.lineChartColor.GRAY.border;
                break;
            default :
                labelStyle.color = realtime.lineChartColor.WHITE.label;
                girdLineColor    = realtime.lineChartColor.WHITE.gridLine;
                borderColor      = realtime.lineChartColor.WHITE.border;
                break;
        }

        var name = Comm.wasInfoObj[this.wasId].wasName;

        this.chart = EXEM.cls.create('XMAiChart', {
            target   : this,
            showTitle: true,
            wasId    : this.wasId,
            statId   : this.statId,
            title    : this.title + ' (' + name + ')',
            titleHeight: 24,
            dataBufferSize: 120,
            titleClass: 'servicestat-title single',
            showLegend: true,
            showLegendResizeBar: false,
            toFixedNumber: 0,
            legendWidth : (Comm.Lang === 'ko' || window.nation === 'ko') ? 80 : 115,
            chartProperty: {
                crosshair : {
                    show: true
                },
                tooltip: {
                    hitMode: 'x'
                },
                maxValueTip: {
                    show: false
                },
                highlight: {
                    show: false
                },
                xaxis: {
                    labelStyle: labelStyle,
                    tickLength: 5
                },
                yaxis: {
                    autoscaleRatio: 0.15,
                    labelStyle: labelStyle
                },
                grid: {
                    gridLineColor: girdLineColor,
                    border: {
                        color: borderColor
                    }
                }
            },
            showLastValueToolTip: false,
            lastValueSeriesIndex: 1,
            titleClickEvent: function() {
                this.openStatList(this.title, this.wasId);
            }.bind(this),
            xLabelFormat: function(value) {
                var date = new Date(+value);
                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
            }
        });

        var LINE_WIDTH = 2;

        this.chart.addSeries({
            id       : 0,
            label    : common.Util.TR('Current'),
            color    : realtime.loadPredictChartColor.now,
            type     : 'target',
            lineWidth: LINE_WIDTH
        });
        this.chart.addSeries({
            id       : 1,
            label    : common.Util.TR('Moving Average'),
            color    : '#4db7ff',
            lineWidth: LINE_WIDTH
        });
        this.chart.addSeries({
            id       : 2,
            label    : common.Util.TR('Normal Range'),
            fill     : 1,
            fillColor : realtime.loadPredictChartColor.band,
            color    : realtime.loadPredictChartColor.band,
            type     : 'band',
            lineWidth: 0.1
        });
        this.chart.addSeries({
            id       : 3,
            label    : common.Util.TR('isAnomaly'),
            type     : 'anomaly',
            color    : '#d97009',
            lineWidth: 0.1
        });
    },

    setTitle: function(title, id) {
        var name;

        this.title = title;

        this.wasId = id;
        name = Comm.wasInfoObj[this.wasId].wasName;

        if (this.chart != null) {
            this.chart.titleLayer.setTitle(title + ' (' + name + ')');
        }
    },

    drawData: function(data, statId) {
        if (this.chart.serieseList == null) {
            return;
        }
        this.chart.clearValues();

        this.chart.lastValueIndex = Comm.RTComm.getCurrentIndexOfDay();

        var ix, ixLen, decimal;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            if (data[ix][3] < 0) {
                data[ix][3] = 0;
            }

            this.chart.addValue(0, [+data[ix][0], data[ix][1]]);
            this.chart.addValue(1, [+data[ix][0], data[ix][2]]);
            this.chart.addValue(2, [+data[ix][0], [data[ix][3], data[ix][4]]]);
            this.chart.addValue(3, [+data[ix][0], data[ix][5]]);
        }

        if (statId.indexOf('time') !== -1 || statId === 'txn_elapse') {
            decimal = 3;
        } else {
            decimal = 2;
        }
        this.chart.toFixedNumber = decimal;

        this.chart.draw();
    },

    openStatList: function(statName, id) {
        this.listWindow = Ext.create('rtm.src.rtmAnomalyDetectionStatList', {
            style: {'z-index': '10'}
        });

        this.listWindow.wasId       = id;
        this.listWindow.statName    = statName;
        this.listWindow.targetChart = this;
        this.listWindow.init();
        this.listWindow.show();
    }
});
