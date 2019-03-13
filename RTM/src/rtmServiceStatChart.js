Ext.define('rtm.src.rtmServiceStatChart', {
    extend: 'Ext.container.Container',
    layout: 'fit',
    width : '100%',
    height: '100%',
    target: null,
    parent: null,
    chartname: '',
    title    : '',

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

        switch(theme){
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

        this.chart = EXEM.cls.create('XMTrendChart', {
            target   : this,
            showTitle: true,
            title    : this.title,
            titleHeight: 24,
            dataBufferSize: 1440,
            titleClass: 'servicestat-title',
            showLegend: false,
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
                    tickLength: 24
                },
                yaxis: {
                    labelWidth: 30,
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
            showLastValueToolTip: true,
            lastValueSeriesIndex: 1,
            xLabelFormat: function(value){
                var date = new Date(+value);
                return (date.getHours()   < 10 ? '0' : '') + date.getHours();
            }
        });

        this.chart.addSeries({
            id       : 0,
            label    : common.Util.TR('Yesterday'),
            color    : '#8E8E8E',
            lineWidth: 0.5,
            fill     : 0.5,
            fillColor: '#F0F0F0',
            cls      : 'current_now_before1'
        });
        this.chart.addSeries({
            id       : 1,
            label    : common.Util.TR('Today'),
            color    : '#237DE6',
            lineWidth: 0.5,
            fill     : 0.5,
            fillColor: '#3791FA',
            cls      : 'current_now_before2'
        });
    },

    setTitle: function(title) {
        this.title = title;

        if (this.chart != null) {
            this.chart.titleLayer.setTitle(title);
        }
    },

    drawData: function(data) {

        if (this.chart.serieseList == null) {
            return;
        }

        this.chart.clearValues();

        this.chart.lastValueIndex = Comm.RTComm.getCurrentIndexOfDay();

        var ix = null, ixLen = null;
        var jx = null, jxLen = null;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {

            for (jx = 0, jxLen = data[ix].length; jx < jxLen; jx++) {
                this.chart.addValue(ix, [+data[ix][jx][0], data[ix][jx][1]]);
            }
        }

        var yMax = this.chart.serieseList[0].max;
        var tMax = this.chart.serieseList[1].max;
        var decimal = 0;

        if (this.chart.maxValueInfo.y > 5) {
            decimal = 0;
        } else if (this.chart.maxValueInfo.y > 1) {
            decimal = 1;
        } else {
            decimal = 2;
        }
        this.chart.toFixedNumber = decimal;

        this.chart.draw();

        if (this.parent.setMaxValueLabel != null) {
            yMax = common.Util.numberFixed(+yMax, decimal);
            tMax = common.Util.numberFixed(+tMax, decimal);

            this.parent.setMaxValueLabel(this.chartIndex, yMax, tMax);
        }
    }
});
