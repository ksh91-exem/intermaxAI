Ext.define('rtm.src.rtmMemoryLeakTrendChart', {
    extend: 'Ext.container.Container',
    layout: 'fit',
    width : '100%',
    height: '100%',
    target: null,
    parent: null,
    title : '',

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
            titleHeight: 20,
            dataBufferSize: 144,
            titleClass: 'rtm-memoryleak-trend-title',
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
                    labelWidth: 30,
                    labelStyle: labelStyle,
                    tickLength: 24
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
            showLastValueToolTip: true,
            lastValueSeriesIndex: 1,
            xLabelFormat: function(value){
                var date = new Date(+value);
                return (date.getHours()   < 10 ? '0' : '') + date.getHours();
            }
        });

        this.chart.addSeries({
            id       : 0,
            label    : common.Util.TR('Today'),
            color    : '#237DE6',
            lineWidth: 0.5,
            fill     : 0.5,
            fillColor: '#3791FA',
            cls      : 'current_now_before1'
        });

        // 최대값을 보여주는 영역 설정
        var baseDom = this.getEl().dom;
        var maxValueInfo = baseDom.appendChild(document.createElement('div'));
        maxValueInfo.className = 'memoryleak-max-info';

        var maxLabel = maxValueInfo.appendChild(document.createElement('div'));
        maxLabel.className = 'memoryleak-max-label';
        maxLabel.textContent = common.Util.TR('MAX') + ': ';

        this.maxInfo = maxValueInfo.appendChild(document.createElement('div'));
        this.maxInfo.className = 'memoryleak-max-value';
        this.maxInfo.textContent = 0;

        this.countTrendData   = [];
        for (var ix = 0; ix < 144; ix++) {
            this.countTrendData[ix] = [ix, 0];
        }
    },

    setTitle: function(title) {
        this.title = title;

        if (this.chart) {
            this.chart.titleLayer.setTitle(title);
        }
    },

    drawData: function(data) {
        if (!this.chart.serieseList) {
            return;
        }
        this.chart.clearValues();

        // GET NOW MINUTE
        var dataTime = new Date();
        var newDate  = new Date();
        var min      = newDate.getUTCMinutes() ;
        var offset   = dataTime.getTimezoneOffset();

        dataTime.setMinutes( offset ) ;
        dataTime.setMinutes( Repository.timeZoneOffset[Repository.trendChartData.timeRecordWasId] || -offset) ;

        newDate.setMinutes( offset) ;
        newDate.setMinutes( Repository.timeZoneOffset[Repository.trendChartData.timeRecordWasId] || -offset) ;

        newDate.setHours(0,0,0,0) ;
        this.nowTime = dataTime.setMinutes(min);

        this.chart.lastValueIndex = Math.floor( (dataTime - newDate.getTime() ) / 1000 / 60) ;

        for (var jx = 0, jxLen = data.length; jx < jxLen; jx++) {
            this.chart.addValue(0, [+data[jx][0], +data[jx][1]]);
        }

        // 최대값 가져오기
        var maxValue = this.chart.serieseList[0].max;

        this.chart.toFixedNumber = 0;

        this.chart.draw();

        // 1000단위에 쉼표 표시
        maxValue = common.Util.numberFixed(+maxValue, 0);

        // 최대 값 표시 설정
        this.maxInfo.textContent = maxValue;
    },

    executeTrendChartSQL: function(record) {
        var temp = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(temp) !== true) {
            console.debug('%c [Memory Leak Trend Chart] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            temp = new Date(this.beforeLastestTime);
        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        var fromtime = Ext.Date.format(temp, 'Y-m-d 00:00:00.000');
        var totime   = Ext.Date.format(temp, 'Y-m-d 23:59:00.000');

        try {
            WS.SQLExec({
                sql_file: 'IMXRT_Memory_Leak_Trend.sql',
                bind: [{
                    name: 'fromtime',     value: fromtime,          type: SQLBindType.STRING
                }, {
                    name: 'totime',       value: totime,            type: SQLBindType.STRING
                }, {
                    name: 'className',    value: record.className,  type: SQLBindType.STRING
                }, {
                    name: 'identityCode', value: record.instanceId, type: SQLBindType.INTEGER
                }],
                replace_string: [{
                    name: 'was_id',   value: record.wasId
                }]
            }, this.drawChartData, this);
        } finally {
            temp = null;
        }
    },


    /**
     * 엘리먼트 갯수 추이 차트 데이터 그리기
     *
     * @param {object} aheader
     * @param {object} adata
     */
    drawChartData: function(aheader, adata) {
        this.loadingMask.hide();

        var isValid = common.Util.checkSQLExecValid(aheader, adata);
        if (!isValid) {
            return;
        }

        var time;

        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            time = +new Date(adata.rows[ix][0]);
            this.countTrendData[ix] = [ time, adata.rows[ix][1] ] ;
        }

        adata.rows    = null;
        adata         = null;

        this.drawData(this.countTrendData);
    }


});
