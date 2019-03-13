Ext.define('rtm.src.rtmDBLoadPredictChart', {
    extend: 'rtm.src.rtmLoadPredictChart',
    layout: 'fit',
    width : '100%',
    height: '100%',
    target: null,
    parent: null,
    title : '',
    dbId  : '',
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

        var name, ix, ixLen;
        for (ix = 0, ixLen = Comm.activateDB.length; ix < ixLen; ix++) {
            if (Comm.activateDB[ix][0] == this.dbId) {
                name = Comm.activateDB[ix][1];
                break;
            }
        }

        this.chart = EXEM.cls.create('XMAiChart', {
            target   : this,
            showTitle: true,
            wasId    : this.dbId,
            statId   : this.statId,
            title    : this.title + ' (' + name + ')',
            titleHeight: 24,
            dataBufferSize: 1500,
            titleClass: 'servicestat-title single',
            showLegend: true,
            showLegendResizeBar: false,
            legendWidth : (Comm.Lang === 'ko' || window.nation === 'ko') ? 90 : 110,
            toFixedNumber: 0,
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
                this.openStatList(this.title, this.dbId);
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
            label    : common.Util.TR('Prediction Value'),
            color    : realtime.loadPredictChartColor.predictValue,
            predict  : true,
            lineWidth: LINE_WIDTH,
            lineContinueID : 0
        });
        this.chart.addSeries({
            id       : 2,
            label    : common.Util.TR('Normal Range'),
            fill     : 1,
            fillColor : realtime.loadPredictChartColor.band,
            type     : 'band',
            color    : realtime.loadPredictChartColor.band,
            lineWidth: 0.1
        });
        this.chart.addSeries({
            id       : 3,
            label    : common.Util.TR('Forecast Range'),
            fill     : 1,
            fillColor : realtime.loadPredictChartColor.predictBand,
            color    : realtime.loadPredictChartColor.predictBand,
            type     : 'band',
            predict  : true,
            lineContinueID : 0,
            lineWidth: 0.1
        });
        this.chart.addSeries({
            id       : 4,
            label    : common.Util.TR('isAnomaly'),
            type     : 'anomaly',
            color    : '#d97009',
            lineWidth: 0.1
        });
    },

    setTitle: function(title, id) {
        var name;

        this.title = title;

        this.dbId = id;
        var ix, ixLen;
        for (ix = 0, ixLen = Comm.activateDB.length; ix < ixLen; ix++) {
            if (Comm.activateDB[ix][0] == this.dbId) {
                name = Comm.activateDB[ix][1];
                break;
            }
        }

        if (this.chart != null) {
            this.chart.titleLayer.setTitle(title + ' (' + name + ')');
        }
    },

    openStatList: function(statName, id) {
        this.listWindow = Ext.create('rtm.src.rtmDBLoadPredictStatList', {
            style: {'z-index': '10'}
        });

        this.listWindow.dbId        = id;
        this.listWindow.statName    = statName;
        this.listWindow.targetChart = this;
        this.listWindow.init();
        this.listWindow.show();
    }
});
