Ext.define('rtm.src.rtmWebTrendStatChart', {
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
            titleClass : 'performance-title',
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
            },
            titleClickEvent: function() {
                this.openStatList(this.title);
            }.bind(this)
        });

        this.setChartSeries();

        this.settDblClickEvent();
    },


    /**
     * 더블 클릭 시 선택된 구간 및 지표에 해당하는 서버 정보를 보여주는 팝업창 표시
     */
    settDblClickEvent: function() {
        this.chart.chartContainer.addEventListener('dblclick', function(e) {
            var offset = this.chart.getMousePosition(e);
            var index  = this.chart.findHitXaxis(offset[0]);

            this.parent.openTxnList(this.statName, index);

        }.bind(this));
    },


    /**
     * Configuration Chart Series
     */
    setChartSeries: function() {
        var lineWidth = 2;
        var labelColor, serverId, serverName;

        for (var ix = 0, ixLen = Comm.webNameArr.length ; ix < ixLen; ix++) {

            serverName = Comm.webNameArr[ix];
            serverId   = Comm.webIdArr[ix];

            if (this.chartOption && this.chartOption[serverName]) {
                lineWidth = this.chartOption[serverName].lineWidth || 2;
            }

            labelColor = realtime.serverColorMap[this.parent.openViewType][serverId];

            this.chart.addSeries({
                id       : serverId,
                label    : serverName,
                color    : labelColor,
                lineWidth: lineWidth
            });
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

        for (var ix = 0, ixLen = Comm.webNameArr.length ; ix < ixLen; ix++) {
            if (isAllVisible === true) {
                isVisible = true;
            } else {
                isVisible = Ext.Array.contains(visibleSeries, Comm.webNameArr[ix]);
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
        if (this.chart) {
            this.chart.titleLayer.setTitle(title);
        }
    },

    /**
     * Draw Line Chart Data
     */
    drawData: function(timedata, data, fixed, maxValue) {

        if (!this.chart.serieseList) {
            return;
        }

        this.chart.clearValues();

        var ix, ixLen, jx, jxLen;
        var d;
        var max   = 0;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            d = data[ix][1];

            for (jx = 0, jxLen = d.length; jx < jxLen; jx++) {
                this.chart.addValue(ix, [timedata[jx], d[jx]]);

                if (+d[jx] > max) {
                    max = +d[jx];
                }
            }
        }

        if (max < 40) {
            maxValue = null;
        }

        this.chart.options.yaxis.max = maxValue;
        this.chart.toFixedNumber = fixed || 0;

        this.chart.draw();
    },

    /**
     * Open WEB Stat Configuration Window
     */
    openStatList: function(statname) {
        this.listWindow = Ext.create('rtm.src.rtmWebStatList', {
            style: {'z-index': '10'}
        });

        this.listWindow.statName     = statname;
        this.listWindow.oldStatName  = Comm.RTComm.getWebStatIdByName(statname);
        this.listWindow.targetChart  = this;
        this.listWindow.init();
        this.listWindow.show();
    }
});
