Ext.define('rtm.src.rtmDBMonitorChart', {
    extend: 'Ext.container.Container',
    layout: 'fit',

    parent: null,
    chartName: '',
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
            showTitle: false,
            title    : this.title,
            titleHeight: 0,
            titleClass: 'rtm-dbmonitor-title',
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
                    tickInterval: 60000
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
            xLabelFormat: function(value){
                var date = new Date(+value);
                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
            }
        });

    },

    setChartSeries: function(name) {
        var color = this.color || '#3ca0ff';

        this.chart.addSeries({
            id       : 0,
            label    : name || '',
            color    : color,
            lineWidth: 1.5,
            fill     : 0.5,
            fillColor: color
        });
    },

    setTitle: function(title) {
        this.title = title;

        if (this.chart != null) {
            this.chart.titleLayer.setTitle(title);
        }
    },

    drawData: function(timedata, data, name) {
        this.chart.clearValues();

        var ix = null, ixLen = null;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            this.chart.addValue(0, [+timedata[ix], data[ix]]);
        }

        if (this.chartName != name) {
            this.chart.removeSeries(0);
            this.setChartSeries(name);
            this.chartName = name;
        }

        this.chart.toFixedNumber = 1;

        this.chart.draw();

        timedata = null;
        data = null;
        name = null;
    }
});
