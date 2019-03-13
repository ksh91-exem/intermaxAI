Ext.define('rtm.src.rtmGCStatChart', {
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
            xLabelFormat: function(value){
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
        var labelColor, serverId, serverName;

        for (var ix = 0, ixLen = this.parent.serverNameArr.length ; ix < ixLen; ix++) {
            serverId   = this.parent.serverIdArr[ix];
            serverName = this.parent.serverNameArr[ix];

            labelColor = realtime.serverColorMap[this.parent.openViewType][serverId];

            if (this.chartOption) {
                lineWidth = this.chartOption[serverName].lineWidth;
            }

            this.chart.addSeries({
                id   : serverId,
                label: serverName,
                color: labelColor
            });

            if (this.chartOption) {
                this.chart.setLineWidth(ix, lineWidth);
            }
        }
    },


    /**
     * Configuration Chart Series Visible
     */
    setVisibleSeries: function(visibleSeries) {
        var isAllVisible, isVisible;

        if (visibleSeries == null || visibleSeries.length <= 0) {
            isAllVisible = true;
        } else {
            isAllVisible = false;
        }

        for (var ix = 0, ixLen = this.parent.serverNameArr.length ; ix < ixLen; ix++) {
            if (isAllVisible === true) {
                isVisible = true;

            } else {
                isVisible = Ext.Array.contains(visibleSeries, this.parent.serverNameArr[ix]);
            }
            this.chart.setVisible(ix, isVisible);
        }
        visibleSeries = null;
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
    drawData: function(timedata, data, fixed) {
        if (this.chart.serieseList == null) {
            return;
        }
        this.chart.clearValues();

        var ix, ixLen, jx, jxLen;
        var d;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            d = data[ix][1];

            for (jx = 0, jxLen = d.length; jx < jxLen; jx++) {
                this.chart.addValue(ix, [timedata[jx], d[jx]]);
            }
        }

        if (fixed > 0) {
            this.chart.toFixedNumber = fixed;
        }

        this.chart.draw();
    }

});
