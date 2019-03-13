Ext.define('rtm.src.rtmBizTPSMonitorChart', {
    extend : 'Ext.container.Container',
    layout : 'fit',
    width  : '100%',
    height : '100%',
    parent : null,
    padding: '0 0 1 0',
    title  : '',

    constructor: function() {
        this.callParent(arguments);
    },

    init: function() {
        var theme = Comm.RTComm.getCurrentTheme();
        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        var girdLineColor, borderColor;

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

        this.chart = EXEM.cls.create('XMTrendChart', {
            target   : this,
            showTitle: true,
            title    : this.title,
            titleHeight: 24,
            titleClass : 'gcstat-title',
            showLegend : false,
            toFixedNumber: 0,
            chartProperty: {
                crosshair : {
                    show: true
                },
                tooltip: {
                    hitMode: 'x'
                },
                maxValueTip: {
                    show: true,
                    fix : true
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
            xLabelFormat: function(value) {
                var date = new Date(+value);
                return (date.getHours()   < 10 ? '0' : '') + date.getHours() + ':' +
                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
            }
        });

        this.setChartSeries();
    },

    /**
     * Configuration Chart Series
     */
    setChartSeries: function() {
        var lineWidth = 2;
        var labelColors = realtime.serverColorMap.BIZ || realtime.DefaultColors;
        var labelColor, bizId, bizName;
        var ix, ixLen;

        for (ix = 0, ixLen = this.parent.bizNameArr.length; ix < ixLen; ix++) {
            bizId   = this.parent.bizIdArr[ix];
            bizName = this.parent.bizNameArr[ix];

            if (Array.isArray(labelColors)) {
                labelColor = labelColors[ix];
            } else {
                labelColor = labelColors[Object.keys(labelColors)[ix]];
            }

            if (this.chartOption) {
                lineWidth = this.chartOption[bizName].lineWidth;
            }

            this.chart.addSeries({
                id   : bizId,
                label: bizName,
                color: labelColor
            });

            if (this.chartOption) {
                this.chart.setLineWidth(ix, lineWidth);
            }
        }
    },

    /**
     * Set Chart Title
     */
    setTitle: function(title) {
        this.title = title;

        if (this.chart != null) {
            this.chart.titleLayer.setTitle(title);
        }
    },

    /**
     * Draw Line Chart Data
     */
    drawData: function(timeData, data, fixed) {
        var ix, ixLen, jx, jxLen;
        var arrayData, bizId, bizIdList;

        if (!this.chart.serieseList) {
            return;
        }

        this.chart.clearValues();

        bizIdList = Object.keys(data);

        for (ix = 0, ixLen = bizIdList.length; ix < ixLen; ix++) {
            bizId = bizIdList[ix];
            arrayData = data[bizId][1];

            for (jx = 0, jxLen = arrayData.length; jx < jxLen; jx++) {
                this.chart.addValue(ix, [timeData[jx], arrayData[jx]]);
            }
        }

        if (fixed > 0) {
            this.chart.toFixedNumber = fixed;
        }

        this.chart.draw();
    }

});
