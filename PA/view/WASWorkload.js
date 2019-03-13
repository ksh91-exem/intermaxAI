Ext.define("view.WASWorkload", {
    extend: "Exem.FormOnCondition",
    width : '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.H,
    style : {
        background: '#cccccc'
    },
    sql: {
        lineChart : 'IMXPA_WASWorkload_line.sql',
        barChart  : 'IMXPA_WASWorkload_bar.sql',
        pieChart  : 'IMXPA_WASWorkload_pie.sql',
        jvmPieChart : 'IMXPA_WASWorkload_jvmPie.sql'
    },
    showMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : title,
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    },

    _wasValidCheck: function() {
        var self = this;
        var wasValue = self.wasField.getValue();
        var wasCombo = self.wasField.WASDBCombobox;

        if (wasValue == null) {
            wasCombo.select(wasCombo.store.getAt(0));
        }

        var setFocus = function(){
            wasCombo.focus();
        };

        if (wasCombo.getRawValue() != '(All)') {
            if (wasCombo.getRawValue().indexOf(',') == -1) {
                if (self.wasField.AllWasList.indexOf(wasValue+'') == -1) {
                    self.showMessage(common.Util.TR('ERROR'), common.Util.TR('Can not find the Agent Name'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                    return false;
                }
            } else {
                var tmpArray = wasValue.split(',');
                for (var ix = 0, len = tmpArray.length; ix < len; ix++) {
                    if (self.wasField.AllWasList.indexOf(tmpArray[ix]) == -1) {
                        self.showMessage(common.Util.TR('ERROR'), common.Util.TR('The Agent name is invalid'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                        return false;
                    }
                }
            }
        }

        return true;
    },


    checkValid: function() {
        var self = this;

        return self._wasValidCheck();
    },


    addChartArea: function(chartArea, chartType) {
        var self = this;

        chartArea.suspendLayouts();
        for (var ix = 0, len = self.wasStore.length; ix < len; ix++) {
            var wasIdx = self.wasStore[ix];
            var wasName = Comm.RTComm.getServerNameByID(wasIdx);
            chartArea.addSeries({
                label : wasName,
                id    : wasName,
//                point : true,
                type  : chartType
            });
        }

        chartArea.resumeLayouts();
        chartArea.doLayout();
        chartArea.plotRedraw();
    },


    init: function() {
        var self = this;

        this.count = 0;

        self.chartTitleHeight = 25;
        self.chartDbclickFlag = false;
        self.setWorkAreaLayout('border');
        self.retrieveFlag = false;

        self.wasField = Ext.create('Exem.wasDBComboBox', {
            x: 380,
            y: 5,
            width           : 400,
            multiSelect     : true,
            comboLabelWidth : 60,
            comboWidth      : 280,
            itemId          : 'wasCombo',
            selectType      : common.Util.TR('Agent')
        });


        self.conditionArea.add(self.wasField);
        self.wasField.init();


        self.btnArea = Ext.create('Exem.Container', {
            x : 720,
            y : 5,
            layout: 'hbox',
            width : 130,
            height: 20,
            margin: '5 0 0 0'
        });

        self.btnFirst= self.setBtn('btnFirst', 'firstLeftOFF',  21); // 820
        self.addBtnLine();
        self.btnPrev = self.setBtn('btnPrev',  'leftMoveOFF',   21);
        self.addBtnLine();
        self.btnNext = self.setBtn('btnNext',  'rightMoveOFF',  21);
        self.addBtnLine();
        self.btnLast = self.setBtn('btnLast',  'firstRightOFF', 21);


        switch(nation) {
            case 'ko' :
                self.LABEL_FORMAT = '____-__-__ __:__';
                break;
            case 'zh-CN':
            case 'ja' :
                self.LABEL_FORMAT = '____/__/__ __:__';
                break;
            case 'en' :
                self.LABEL_FORMAT = '__/__/____ __:__';
                break;
            default :
                break;
        }


        self.timeLable = Ext.create('Ext.form.Label', {
            itemId: 'timeLable',
            type  : 'date',
            text  : self.LABEL_FORMAT,
            x     : 830,
            y     : 10,
            style : {
                fontSize: '16px'
            }
        });

        self.conditionArea.add(self.btnArea, self.timeLable);


        var north = Ext.create('Exem.Panel', {
            itemId : 'NorthPnl',
            region : 'north',
            title  : common.Util.TR('Workload Comparison'),
            layout : 'hbox',
            split  : true,
            minHeight : 200,
            height : '30%',
            bodyStyle: 'borderRadius: 6px ;'
        });
        var center = Ext.create('Exem.Panel', {
            itemId : 'CenterPnl',
            region : 'center',
            title  : common.Util.TR('Active Transaction Comparison'),
            minHeight: 200,
            layout : 'border',
            bodyStyle: 'borderRadius: 6px ;'
        });
        var south = Ext.create('Exem.Panel', {
            itemId : 'SouthPnl',
            region : 'south',
            title  : common.Util.TR('TPS Comparison'),
            split  : true,
            minHeight: 200,
            height : '35%',
            layout : 'border',
            bodyStyle: 'borderRadius: 6px;'
        });

        self.workArea.add(north);
        self.workArea.add(center);
        self.workArea.add(south);

        //기본 틀=========================================================

        // Workload Comparison(Hbox) 에 들어갈 패널 3개 (파이차트 올릴것임)

        self.pie_JvmCpuUsage = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('JVM CPU Usage'),
            itemId          : 'JvmCpuUsage',
            legendTextAlign : 'east',
            titleHeight     : self.chartTitleHeight,
            flex            : 1,
            showHistoryInfo : false,
            showTitle       : true,
            showLegend      : true,
            showLegendValueArea : true,
            showTooltip     : true,
            toolTipFormat   : '[%s] %y',
            chartProperty   : {
                colors : realtime.Colors
            }
            /**
             //            style: {
//                border: '1px solid #eee',
//                padding: '3px'
//                margin : '13px'
//            }
             */

        });
        self.pie_TxnExecuteCount = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('Transaction Execution Count'),
            itemId          : 'TxnExecuteCount',
            legendTextAlign : 'east',
            titleHeight     : self.chartTitleHeight,
            flex            : 1,
            showHistoryInfo : false,
            showTitle       : true,
            showLegend      : true,
            showLegendValueArea : true,
            showTooltip     : true,
            toolTipFormat   : '[%s] %y',
            chartProperty   : {
                colors : realtime.Colors
            }
        });
        self.pie_TxnElapseTime = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('Transaction Elapse Time'),
            itemId          : 'TxnElapseTime',
            legendTextAlign : 'east',
            showHistoryInfo : false,
            titleHeight     : self.chartTitleHeight,
            showLegendValueArea : true,
            showTitle       : true,
            showLegend      : true,
            showTooltip     : true,
            flex            : 1,
            toolTipFormat   : '[%s] %y',
            chartProperty   : {
                colors : realtime.Colors
            }
        });

        /**
         //        self.addChartArea(self.pie_JvmCpuUsage, PlotChart.type.exPie);
         //        self.addChartArea(self.pie_TxnExecuteCount, PlotChart.type.exPie);
         //        self.addChartArea(self.pie_TxnElapseTime, PlotChart.type.exPie);
         **/

        north.add(self.pie_JvmCpuUsage, self.pie_TxnExecuteCount, self.pie_TxnElapseTime);

        // Active Transaction Trend(border)에 들어갈 패널 2개 (west 60%)

        self.line_ActiveTxnTrend = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('Active Transaction Trend'),
            region          : 'west',
            width           : '67%',
            itemId          : 'ActiveTxnTrend',
            legendTextAlign : 'east',
            titleHeight     : self.chartTitleHeight,
            interval        : PlotChart.time.exHour,
            indicatorLegendFormat: '%y',
            minWidth        : 500,
            showTitle       : true,
            showLegend      : true,
            legendNameWidth : 145,
            showIndicator   : true,
            split           : true,
            showContextMenu : true,
            xaxisCurrentToTime: true,
            toolTipFormat    : '[%s] %x [value:%y]',
            chartProperty      : {
                yLabelWidth: 40,
                colors : realtime.Colors
            },

            plotdblclick: function(event, pos, item, xAxis){
                if (!xAxis)
                    return;
                if (self.chartDbclickFlag) {
                    self.line_TpsTrend.drawIndicator(xAxis);
                    self.lineChartDbClick(xAxis);
                    self.currentTime = common.Util.getDate(xAxis.x);
                    self.timeLable.setText( Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM) );


                }
            },
            historyInfoDblClick: function(chart, record) {
                var xAxis = {};
                self.currentTime = record.data['TIME'];
                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                xAxis.x = (+new Date(self.currentTime));
                self.line_ActiveTxnTrend.drawIndicator(xAxis);
                self.line_TpsTrend.drawIndicator(xAxis);
                self.lineChartDbClick(xAxis);

            }

        });

        self.bar_ActiveTxnRate = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('Active Transaction Count'),
            region          : 'center',
            itemId          : 'ActiveTxnRate',
            titleHeight     : self.chartTitleHeight,
            minWidth        : 300,
            showTitle       : true,
            showMaxValue    : false,
            toolTipFormat    : '%x [value:%y]',
            chartProperty   : {
                yLabelWidth: 30,
                mode: "categories",
                xaxis: false,
                colors : realtime.Colors
            }
        });
        /**
         //        self.bar_ActiveTxnRate.addSeries({
//            id : 'ActiveTxn',
//            label : 'Active Transaction Count',
//            type  : PlotChart.type.exBar
//        });
         **/

        center.add(self.line_ActiveTxnTrend, self.bar_ActiveTxnRate);


        // 마찬가지 TPS Comparison 에 들어갈 패널 2개 west 60%

        self.line_TpsTrend = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('TPS Trend'),
            region          : 'west',
            width           : '67%',
            itemId          : 'TpsTrend',
            legendTextAlign : 'east',
            titleHeight     : self.chartTitleHeight,
            interval        : PlotChart.time.exHour,
            indicatorLegendFormat: '%y',
            minWidth        : 500,
            showTitle       : true,
            showLegend      : true,
            legendNameWidth : 145,
            showIndicator   : true,
            split           : true,
            showContextMenu : true,
            xaxisCurrentToTime: true,
            toolTipFormat    : '[%s] %x [value:%y]',
            chartProperty      : {
                yLabelWidth: 40,
                colors : realtime.Colors
            },

            plotdblclick: function(event, pos, item, xAxis){
                if (self.chartDbclickFlag) {
                    if (!xAxis)
                        return;
                    self.line_ActiveTxnTrend.drawIndicator(xAxis);
                    self.lineChartDbClick(xAxis);
                    self.currentTime = common.Util.getDate(xAxis.x);
                    self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                }
            },
            historyInfoDblClick: function(chart, record) {
                var xAxis = {};
                self.currentTime = record.data['TIME'];
                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                xAxis.x = (+new Date(self.currentTime));
                self.line_ActiveTxnTrend.drawIndicator(xAxis);
                self.line_TpsTrend.drawIndicator(xAxis);
                self.lineChartDbClick(xAxis);
            }

        });

        self.bar_TpsRate = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('TPS Rate'),
            region          : 'center',
            itemId          : 'TpsRate',
            titleHeight     : self.chartTitleHeight,
            showTitle       : true,
            showMaxValue    : false,
            minWidth        : 300,
            toolTipFormat    : '%x [value:%y]',
            chartProperty   : {
//                timeformat: '%m-%d %H:%M',
                mode: "categories",
                yLabelWidth: 30,
                xaxis: false,
                colors : realtime.Colors
            }
        });
        /**
         //        self.bar_TpsRate.addSeries({
//            id : 'TpsRate',
//            label : common.Util.TR('TPS Rate'),
//            type  : PlotChart.type.exBar
//        });
         */

        south.add(self.line_TpsTrend, self.bar_TpsRate);

    },

    addBtnLine : function() {
        var self = this;
        var seprator = Ext.create('Ext.container.Container',{
            width: 1,
            height: '100%',
            margin: '4 0 4 0',
            style: {
                background: '#E3E3E3'
            }
        });
        self.btnArea.add(seprator);
    },

    setBtn: function(itemId, cls, width) {
        var self = this;
        var btn = Ext.create('Exem.Container', {
            itemId: itemId,
            width : width,
            height: 18,
            cls : cls,
            listeners: {
                render: function() {
                    var btn = this;
                    this.getEl().on('click', function() {
                        var xAxis = {};

                        if (!self.chartDbclickFlag)
                            return;

                        switch (btn.itemId) {
                            case 'btnMove' :


                                break;
                            case 'btnPrev' :
                                if (self.currentTime <= self.fromTime)
                                    return;

                                xAxis.x = (+new Date(self.currentTime)) - 3600000;
                                self.currentTime = common.Util.getDate(xAxis.x);
                                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                                self.line_ActiveTxnTrend.drawIndicator(xAxis);
                                self.line_TpsTrend.drawIndicator(xAxis);
                                self.lineChartDbClick(xAxis);

                                break;
                            case 'btnNext' :
                                self.toEndTime = Ext.util.Format.date(self.datePicker.getToDateTime()+':00', 'Y-m-d H:i');

                                if (self.currentTime >= self.toEndTime)
                                    return;

                                xAxis.x = (+new Date(self.currentTime)) + 3600000;
                                self.currentTime = common.Util.getDate(xAxis.x);
                                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                                self.line_ActiveTxnTrend.drawIndicator(xAxis);
                                self.line_TpsTrend.drawIndicator(xAxis);
                                self.lineChartDbClick(xAxis);

                                break;
                            case 'btnFirst':
                                self.currentTime = self.fromTime;
                                xAxis.x = (+new Date(self.currentTime));
                                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                                self.line_ActiveTxnTrend.drawIndicator(xAxis);
                                self.line_TpsTrend.drawIndicator(xAxis);
                                self.lineChartDbClick(xAxis);

                                break;

                            case 'btnLast' :
                                self.currentTime = Ext.util.Format.date(self.datePicker.getToDateTime()+':00', 'Y-m-d H:i') ;
                                xAxis.x = (+new Date(self.currentTime));
                                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                                self.line_ActiveTxnTrend.drawIndicator(xAxis);
                                self.line_TpsTrend.drawIndicator(xAxis);
                                self.lineChartDbClick(xAxis);

                                break;

                            default : break;
                        }
                    });

                }
            }
        });
        self.btnArea.add(btn);
    },

    executeSQL: function() {
        var self = this;

        self.loadingMask.showMask();

        self.fromTime = Ext.util.Format.date(self.datePicker.getFromDateTime()+':00', 'Y-m-d H:i') + ':00';
        self.toTime   = Ext.util.Format.date(self.datePicker.getToDateTime()+':59', 'Y-m-d H:i') + ':59';


        self.wasStore = [];
        self.wasStore = self.wasField.getValue().split(',');


        self.currentTime = self.fromTime;

        // 비어있는 2차원 배열을 넣을 배열객체
        self.activeTxnStore = [];
        self.tpsStore = [];


        var dataset = {};
        var timeDiff;
        var tmpDate1;
        var tmpDate2;

        self.suspendLayouts();
        self.line_ActiveTxnTrend.clearValues();
        self.line_ActiveTxnTrend.clearAllSeires();
        self.line_ActiveTxnTrend.removeAllSeries();
        self.line_ActiveTxnTrend.labelLayer.removeAll();

        self.line_TpsTrend.clearValues();
        self.line_TpsTrend.clearAllSeires();
        self.line_TpsTrend.removeAllSeries();
        self.line_TpsTrend.labelLayer.removeAll();

        self.bar_ActiveTxnRate.clearAllSeires();
        self.bar_ActiveTxnRate.removeAllSeries();
        self.bar_TpsRate.clearAllSeires();
        self.bar_TpsRate.removeAllSeries();


        self.line_ActiveTxnTrend.plotRedraw();
        self.line_TpsTrend.plotRedraw();

        self.pie_JvmCpuUsage.removeAllSeries();
        self.pie_TxnExecuteCount.removeAllSeries();
        self.pie_TxnElapseTime.removeAllSeries();

        self.pie_JvmCpuUsage.labelLayer.removeAll();
        self.pie_TxnExecuteCount.labelLayer.removeAll();
        self.pie_TxnElapseTime.labelLayer.removeAll();

        self.resumeLayouts();

        // 나머지 차트 클리어
        self.chartClear();

        self.addChartArea(self.pie_JvmCpuUsage, PlotChart.type.exPie);
        self.addChartArea(self.pie_TxnExecuteCount, PlotChart.type.exPie);
        self.addChartArea(self.pie_TxnElapseTime, PlotChart.type.exPie);

        self.addChartArea(self.line_ActiveTxnTrend, PlotChart.type.exLine);
        self.addChartArea(self.line_TpsTrend, PlotChart.type.exLine);

        self.addChartArea(self.bar_ActiveTxnRate, PlotChart.type.exBar);
        self.addChartArea(self.bar_TpsRate, PlotChart.type.exBar);


        tmpDate1 = new Date(self.fromTime);
        tmpDate2 = new Date(self.toTime);

        // Totime - Fromtime 간이 몇시간 차이인지를 계산
        timeDiff = (tmpDate2.getTime() - tmpDate1.getTime()) / (1000 * 60 * 60);
        self.timeDiff = timeDiff;

        // 검색시간이 하루 이내면 %H:%M 으로 표시하고
        // 하루 이상이면 %d %H:%M 으로 표시

        /**
         //        if ( timeDiff > 23 ) {
//            self.line_ActiveTxnTrend._chartOption.xaxis.timeformat = '%d %H:%M';
//            self.line_TpsTrend._chartOption.xaxis.timeformat = '%d %H:%M';
//        } else {
//            self.line_ActiveTxnTrend._chartOption.xaxis.timeformat = '%H:%M';
//            self.line_TpsTrend._chartOption.xaxis.timeformat = '%H:%M';
//        }
         **/

        /*
         아래 작업은 Chart의 AddValues 의 규격에 맞는 데이타 형식을 만들기 위해
         2차원 배열을 만드는 과정임. wasId 별로 totime - fromtime 의 시간값만큼
         미리 만들어놓고 데몬이 죽어서 테이블데이터 자체가 없을 수 있기 때문에 모두
         null로 초기화를 해둔다.
         */

        for (var ix = 0; ix < timeDiff+1; ix++) {

            self.activeTxnStore.push([]);
            self.tpsStore.push([]);

            for (var jx = 1, len = self.wasStore.length; jx < len+1; jx++) {

                /**
                 // 차트에서 내부적으로 데이터 없으면 null 처리 하기 때문에 따로 넣어줄 필요 없음.
                 //                self.activeTxnStore[ix].push(null);
                 //                self.tpsStore[ix].push(null);
                 */

                if (ix == 0) {
                    self.activeTxnStore[ix][0] = tmpDate1.getTime();
                    self.tpsStore[ix][0] = tmpDate1.getTime();
                } else {
                    self.activeTxnStore[ix][0] = self.activeTxnStore[ix-1][0] + 3600000;
                    self.tpsStore[ix][0] = self.tpsStore[ix-1][0] + 3600000;
                }
            }
        }


        dataset.bind = [{
            name  : "from_time",
            value : self.fromTime,
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : self.toTime,
            type : SQLBindType.STRING
        }];
        dataset.replace_string = [{
            name  : "was_id",
            value : self.wasField.getValue()
        }];
        dataset.sql_file = self.sql.lineChart;
        WS.SQLExec(dataset, self.onChartData, self);
    },

    // 값의 위치를 잡아준다는 뜻의 함수명으로 바꿔야함.
    _lineCalculateData: function(dataRows, idx){
        var self = this;
        /*
         먼저 wasId 의 인덱스를 찾아와야함. indexOf 사용
         그다음 시간값 - from_time 을 해서 몇번째 인덱스인지 파악
         --> 데이터 때려박으면 됨.
         self.activeTxnStore[i][0] 시간값이 들어있는 위치
         self.activeTxnStore[i][1부터~]
         */

        var wasId_Index, fromTime, diffHour;

        for (var ix = 0, len = dataRows.length; ix < len; ix++ ) {

            // 0 에 시간값
            wasId_Index = (self.wasStore.indexOf(dataRows[ix][1] + '')) + 1;
            fromTime = new Date(self.fromTime);
            diffHour = (new Date(dataRows[ix][0]+':00:00') - fromTime) / 3600000;

            // Active Transaction Trend
            if (idx == 2)
                self.activeTxnStore[diffHour][wasId_Index] = dataRows[ix][idx];
            // TPS Trend
            else
                self.tpsStore[diffHour][wasId_Index] = dataRows[ix][idx];
        }
    },

    chartClear: function () {
        var self = this;

        /**
         //        self.totalExceptionRatio.clearValues();
         //        self.totalExceptionRatio.labelLayer.removeAll();
         //        self.totalExceptionRatio.removeAllSeries();


         //        self.pie_JvmCpuUsage.setLegendValues();
         //        self.pie_TxnExecuteCount.setLegendValues();
         //        self.pie_TxnElapseTime.setLegendValues();

         //        self.bar_ActiveTxnRate.clearAllSeires();
         //        self.bar_ActiveTxnRate.removeAllSeries();
         //        self.bar_TpsRate.clearAllSeires();
         //        self.bar_TpsRate.removeAllSeries();
         */
        self.suspendLayouts();
        self.pie_JvmCpuUsage.clearValues();
        self.pie_TxnExecuteCount.clearValues();
        self.pie_TxnElapseTime.clearValues();

        self.pie_JvmCpuUsage.setLegendValues();
        self.pie_TxnExecuteCount.setLegendValues();
        self.pie_TxnElapseTime.setLegendValues();

        self.bar_ActiveTxnRate.clearValues();
        self.bar_TpsRate.clearValues();

        self.pie_JvmCpuUsage.plotDraw();
        self.pie_TxnExecuteCount.plotDraw();
        self.pie_TxnElapseTime.plotDraw();

        self.bar_ActiveTxnRate.plotDraw();
        self.bar_TpsRate.plotDraw();
        self.resumeLayouts();
        self.doLayout();

    },

    /**
     _drawBarChart: function(fromTime, toTime){
        var self = this;
        var dataset = {};

        dataset.bind = [{
            name  : "from_time",
            value : fromTime,
            type  : "string"
        }, {
            name  : "to_time",
            value : toTime
        }];
        dataset.replace_string = [{
            name  : "was_id",
            value : self.wasField.getValue()
        }];

        dataset.sql_file = self.sql.barChart;
        WS.SQLExec(dataset, self.onChartData, self);

    },
     **/

    lineChartDbClick: function(xAxis){
        var self = this;

        var dataset = {};
        var dataTime = xAxis.x,
            from_time = common.Util.getDate(dataTime),
            to_time = Ext.util.Format.date(common.Util.getDate(dataTime), 'Y-m-d H') + ':59:59' ;

        self.loadingMask.showMask();

        self.chartClear();

        dataset.bind = [{
            name  : "from_time",
            value : from_time,
            type  : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : to_time,
            type  : SQLBindType.STRING
        }];
        dataset.replace_string = [{
            name  : "was_id",
            value : self.wasField.getValue()
        }];
        dataset.sql_file = self.sql.pieChart;
        WS.SQLExec(dataset, self.onChartData, self);
        dataset.sql_file = self.sql.jvmPieChart;
        WS.SQLExec(dataset, self.onChartData, self);
        dataset.sql_file = self.sql.barChart;
        WS.SQLExec(dataset, self.onChartData, self);

        /*
         X 축 변경관련 : AddValues 처럼 min, max 값이 정해져 있을 때는 plotDraw()를
         사용해야 하고, 그렇지 않은 경우에는 plotReDraw
         */
    },

    onChartData: function(header, data){
        var self = this;
        var dataRows;
        var ix, len;
        var wasIndex;

        if(!common.Util.checkSQLExecValid(header, data)){
            self.showMessage(common.Util.TR('ERROR'), header.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            self.loadingMask.hide();

            console.info('WASWorkload-onChartData');
            console.debug(header);
            console.debug(data);
            return;
        }

        dataRows = data.rows;

        if(dataRows.length > 0){
            switch(header.command){
                case self.sql.lineChart:
                    var param = header.parameters;
                    var tmpSeries = {};

                    self.chartDbclickFlag = true;

//                    self._drawBarChart(self.fromTime, self.toTime); // LineChat에 데이터가 하나이상 있을 때만 bar 차트를 그림(초기에)
                    self._lineCalculateData(dataRows, 2);

                    for ( ix = 0, len = self.wasStore.length; ix < len; ix++)
                        tmpSeries[ix] = Number(ix)+1;

                    self.suspendLayouts();
                    self.line_ActiveTxnTrend.addValues({
                        from: param.bind[0].value,
                        to  : param.bind[1].value,
//                        interval: 3600000,
                        time: 0,
                        data: self.activeTxnStore,
                        series: tmpSeries
                    });


                    self.line_ActiveTxnTrend.plotDraw();


                    self._lineCalculateData(dataRows, 3);
                    self.line_TpsTrend.addValues({
                        from: param.bind[0].value,
                        to  : param.bind[1].value,
//                        interval: 3600000,
                        time: 0,
                        data: self.tpsStore,
                        series: tmpSeries
                    });
                    self.line_TpsTrend.plotDraw();

                    self.resumeLayouts();
                    //====  최초 데이터 전체 시간에서 1시간으로 변경 ====
                    var xAxis = {};
                    self.currentTime = self.fromTime;
                    self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                    xAxis.x = (+new Date(self.currentTime));
                    self.line_ActiveTxnTrend.drawIndicator(xAxis);
                    self.line_TpsTrend.drawIndicator(xAxis);
                    self.lineChartDbClick(xAxis);

                    break;

                case self.sql.barChart:
                    wasIndex = 0;

                    for ( ix = 0, len = dataRows.length; ix < len; ix++ ) {

                        // was_id 14.07.23 추가
                        wasIndex = self.wasStore.indexOf(dataRows[ix][3]+'');

                        self.bar_ActiveTxnRate.addValue(
                            wasIndex, [dataRows[ix][0], dataRows[ix][1]]
                        );
                        self.bar_TpsRate.addValue(
                            wasIndex, [dataRows[ix][0], dataRows[ix][2]]
                        );
                    }
                    self.bar_ActiveTxnRate.plotDraw();
                    self.bar_TpsRate.plotDraw();


                    self.loadingMask.hide();
                    break;

                case self.sql.pieChart:
                    wasIndex = 0;
                    /*
                     파이에 들어가는 값을 다 더한다음. %를 구하고 그것을
                     setLegendValue(index, data) 로 넣어준다.
                     */
                    var countTotal = 0,
                        timeTotal = 0,
                        countNum = 0,
                        timeNum = 0;

                    for ( ix = 0, len = dataRows.length; ix < len; ix++ ) {
                        countTotal += dataRows[ix][2];
                        timeTotal += dataRows[ix][3];
                    }

                    if(!countTotal){
                        countTotal = 1;
                    }

                    if(!timeTotal){
                        timeTotal = 1;
                    }

                    for ( ix = 0, len = dataRows.length; ix < len; ix++ ){
                        wasIndex = self.wasStore.indexOf(dataRows[ix][1]+'');

                        countNum = (dataRows[ix][2] / countTotal * 100);
                        countNum = countNum.toFixed(3);
                        timeNum = (dataRows[ix][3] / timeTotal * 100);
                        timeNum = timeNum.toFixed(3);

                        self.pie_TxnExecuteCount.setLegendValue(wasIndex, countNum);
                        self.pie_TxnElapseTime.setLegendValue(wasIndex, timeNum);
                        self.pie_TxnExecuteCount.setData(wasIndex, dataRows[ix][2] || 0);
                        self.pie_TxnElapseTime.setData(wasIndex, dataRows[ix][3] || 0);
                    }
                    self.pie_TxnExecuteCount.plotDraw();
                    self.pie_TxnElapseTime.plotDraw();

                    break;

                case self.sql.jvmPieChart:
                    var jvmTotal = 0,
                        jvmNum = 0;

                    for ( ix = 0, len = dataRows.length; ix < len; ix++ ) {
                        jvmTotal += dataRows[ix][2];
                    }

                    if (jvmTotal > 0) {
                        for ( ix = 0, len = dataRows.length; ix < len; ix++) {
                            wasIndex = self.wasStore.indexOf(dataRows[ix][1]+'');

                            jvmNum = (dataRows[ix][2] / jvmTotal * 100);
                            jvmNum = jvmNum.toFixed(3);
                            self.pie_JvmCpuUsage.setLegendValue(wasIndex, jvmNum);
                            self.pie_JvmCpuUsage.setData(wasIndex, dataRows[ix][2]);
                        }
                    }

                    self.pie_JvmCpuUsage.plotDraw();

                    break;

                default : break;
            }
        }else{
            console.info('callback', 'no data');
            if (header.command == self.sql.barChart || header.command == self.sql.lineChart){
                self.loadingMask.hide();
            }
        }
    }
});