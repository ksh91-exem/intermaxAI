Ext.define('Exem.WidgetLineTPSChart', {
    extend: 'Ext.Component',
    alias: 'widget.LineTPSChart',
    layout: 'fit',

    removeChart: function() {
        if (this.chart) {
            this.chart.destroy();
        }
    },

    init: function(column, widget, record) {
        var theme = Comm.RTComm.getCurrentTheme();
        var rData = record.data;

        if(!rData.bizId){
            return;
        }

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

        if(this.getEl()) {
            var initWidth = this.lastBox.width || 0;
            var initHeight = 55;

            this.chart = EXEM.cls.create('XMTrendChart', {
                target: this,
                showTitle: true,
                titleHeight: 15,
                dataBufferSize: 144,
                showLegend: false,
                initWidth: initWidth,
                initHeight: initHeight,
                initType: 'grid',
                toFixedNumber: 0,
                chartProperty: {
                    crosshair: {
                        show: true
                    },
                    tooltip: {
                        hitMode: 'x'
                    },
                    maxValueTip: {
                        show: true,
                        fix: true
                    },
                    highlight: {
                        show: false
                    },
                    xaxis: {
                        labelStyle: labelStyle,
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
                xLabelFormat: function (value) {
                    var date = new Date(+value);
                    return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                        (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
                }
            });

            this.chart.addSeries({
                id: rData.bizName,
                label: record.data.txn,
                color: realtime.Colors[0],
                lineWidth: 2,
                fill: 0.5,
                fillColor: realtime.Colors[0]
            });

            var ix, ixLen, jx;

            var bizData, data, d;

            d = [];

            for(ix = 0; ix < 30; ix++){
                d[ix] = 0;
            }


            for(ix in Repository.BizTrendDataLog){
                for(jx in Repository.BizTrendDataLog[ix]){
                    bizData = Repository.BizTrendDataLog[ix][jx];

                    if(bizData.TREE_KEY.split('-').indexOf(String(rData.bizId)) !== -1){
                        data = bizData.TIME;
                        d = this.sumArray(d, bizData.TPS);
                    }
                }
            }

            if(!data){
                return;
            }

            var max = 0;
            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                this.chart.addValue(0, [data[ix], d[ix]]);

                if (+d[ix] > max) {
                    max = +d[ix];
                }
            }

            this.chart.options.yaxis.max = max;

            this.chart.draw();
        }
    },

    sumArray: function(arr1, arr2){
        var ix, ixLen, newArr;

        newArr = [];

        for(ix = 0, ixLen = arr2.length; ix < ixLen; ix++){
            newArr[ix] = arr1[ix] + arr2[ix];
        }

        return newArr;
    }

});