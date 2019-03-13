/**
 * Created by 신정훈 on 2017-07-05.
 */
Ext.define("view.WebWASWorkload", {
    extend: "Exem.FormOnCondition",
    width : '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.H,
    style : {
        background: '#cccccc'
    },
    sql: {
        lineChart : 'IMXPA_WebWASWorkload_line.sql',
        barChart  : 'IMXPA_WebWASWorkload_bar.sql',
        cpuUsagePieChart   : 'IMXPA_WebWASWorkload_cpuUsage_pie.sql',
        txnCountPieChart   : 'IMXPA_WebWASWorkload_TxnCount_pie.sql',
        ErrorCountPieChart : 'IMXPA_WebWASWorkload_Error_pie.sql'
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
        var wasValue = self.wsField.getValue();
        var wasCombo = self.wsField.WASDBCombobox;

        if (wasValue == null) {
            wasCombo.select(wasCombo.store.getAt(0));
        }

        var setFocus = function(){
            wasCombo.focus();
        };

        if (wasCombo.getRawValue() != '(All)') {
            if (wasCombo.getRawValue().indexOf(',') == -1) {
                if (self.wsField.AllWasList.indexOf(wasValue+'') == -1) {
                    self.showMessage(common.Util.TR('ERROR'), common.Util.TR('Can not find the Agent Name'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                    return false;
                }
            } else {
                var tmpArray = wasValue.split(',');
                for (var ix = 0, len = tmpArray.length; ix < len; ix++) {
                    if (self.wsField.AllWasList.indexOf(tmpArray[ix]) == -1) {
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

    init: function() {
        var self = this;

        this.count = 0;

        self.chartTitleHeight = 25;
        self.chartDbclickFlag = false;
        self.setWorkAreaLayout('border');
        self.retrieveFlag = false;

        self.wsField = Ext.create('Exem.wasDBComboBox', {
            x: 380,
            y: 5,
            width           : 400,
            multiSelect     : true,
            comboLabelWidth : 60,
            comboWidth      : 280,
            fieldLabel      : common.Util.TR('WebServer')
        });


        self.conditionArea.add(self.wsField);
        self.wsField.init();


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
            region : 'north',
            title  : common.Util.TR('Workload Comparison'),
            layout : 'hbox',
            split  : true,
            minHeight : 200,
            height : '30%',
            bodyStyle: 'borderRadius: 6px ;'
        });
        var center = Ext.create('Exem.Panel', {
            region : 'center',
            title  : common.Util.TR('Active Transaction Comparison'),
            minHeight: 200,
            layout : 'border',
            bodyStyle: 'borderRadius: 6px ;'
        });
        var south = Ext.create('Exem.Panel', {
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

        self.pie_cpuUsage = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('CPU Usage'),
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
        self.pie_TxnExecuteCount = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('Transaction Execution Count'),
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
        self.pie_ErrorCount = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            title           : common.Util.TR('Error Count'),
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

        north.add(self.pie_cpuUsage, self.pie_TxnExecuteCount, self.pie_ErrorCount);

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
                mode: "categories",
                yLabelWidth: 30,
                xaxis: false,
                colors : realtime.Colors
            }
        });

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

                        if (!self.chartDbclickFlag){
                            return;
                        }

                        switch (btn.itemId) {
                            case 'btnFirst':
                                self.currentTime = self.fromTime;
                                xAxis.x = (+new Date(self.currentTime));
                                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                                self.line_ActiveTxnTrend.drawIndicator(xAxis);
                                self.line_TpsTrend.drawIndicator(xAxis);
                                self.lineChartDbClick(xAxis);

                                break;

                            case 'btnPrev' :
                                if (self.currentTime <= self.fromTime){
                                    return;
                                }

                                xAxis.x = (+new Date(self.currentTime)) - 3600000;
                                self.currentTime = common.Util.getDate(xAxis.x);
                                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                                self.line_ActiveTxnTrend.drawIndicator(xAxis);
                                self.line_TpsTrend.drawIndicator(xAxis);
                                self.lineChartDbClick(xAxis);

                                break;

                            case 'btnNext' :
                                self.toEndTime = Ext.util.Format.date(self.datePicker.getToDateTime()+':00', 'Y-m-d H:i');

                                if (self.currentTime >= self.toEndTime){
                                    return;
                                }

                                xAxis.x = (+new Date(self.currentTime)) + 3600000;
                                self.currentTime = common.Util.getDate(xAxis.x);
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
        this.loadingMask.showMask();

        this.fromTime = Ext.util.Format.date(this.datePicker.getFromDateTime()+':00', 'Y-m-d H:i') + ':00';
        this.toTime   = Ext.util.Format.date(this.datePicker.getToDateTime()+':59', 'Y-m-d H:i') + ':59';


        this.wsStore = [];
        this.wsStore = this.wsField.getValue().split(',');


        this.currentTime = this.fromTime;

        // 비어있는 2차원 배열을 넣을 배열객체
        this.activeTxnStore = [];
        this.tpsStore = [];


        var dataSet = {};
        var timeDiff;
        var tmpDate1;
        var tmpDate2;

        this.suspendLayouts();
        this.canvasChartClear(this.line_ActiveTxnTrend, false);
        this.canvasChartClear(this.line_TpsTrend, false);
        this.canvasChartClear(this.bar_ActiveTxnRate, false);
        this.canvasChartClear(this.bar_TpsRate, false);
        this.canvasChartClear(this.pie_cpuUsage, false);
        this.canvasChartClear(this.pie_TxnExecuteCount, false);
        this.canvasChartClear(this.pie_ErrorCount, false);
        this.resumeLayouts();
        this.doLayout();

        this.addChartArea(this.pie_cpuUsage, PlotChart.type.exPie);
        this.addChartArea(this.pie_TxnExecuteCount, PlotChart.type.exPie);
        this.addChartArea(this.pie_ErrorCount, PlotChart.type.exPie);

        this.addChartArea(this.line_ActiveTxnTrend, PlotChart.type.exLine);
        this.addChartArea(this.line_TpsTrend, PlotChart.type.exLine);

        this.addChartArea(this.bar_ActiveTxnRate, PlotChart.type.exBar);
        this.addChartArea(this.bar_TpsRate, PlotChart.type.exBar);


        tmpDate1 = new Date(this.fromTime);
        tmpDate2 = new Date(this.toTime);

        timeDiff = (tmpDate2.getTime() - tmpDate1.getTime()) / (1000 * 60 * 60);

        for (var ix = 0; ix < timeDiff+1; ix++) {

            this.activeTxnStore.push([]);
            this.tpsStore.push([]);

            for (var jx = 1, len = this.wsStore.length; jx < len+1; jx++) {

                if (ix == 0) {
                    this.activeTxnStore[ix][0] = tmpDate1.getTime();
                    this.tpsStore[ix][0] = tmpDate1.getTime();
                } else {
                    this.activeTxnStore[ix][0] = this.activeTxnStore[ix-1][0] + 3600000;
                    this.tpsStore[ix][0] = this.tpsStore[ix-1][0] + 3600000;
                }
            }
        }

        dataSet.bind = [{
            name  : "from_time",
            value : this.fromTime,
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : this.toTime,
            type : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name  : "ws_id",
            value : this.wsField.getValue()
        }];
        dataSet.sql_file = this.sql.lineChart;
        WS.SQLExec(dataSet, this.onChartData, this);
    },

    canvasChartClear: function(chart, chartClick){
        switch (chart){
            case this.line_ActiveTxnTrend:
            case this.line_TpsTrend:
                chart.clearValues();
                chart.clearAllSeires();
                chart.removeAllSeries();
                chart.labelLayer.removeAll();
                chart.plotRedraw();
                break;
            case this.bar_ActiveTxnRate:
            case this.bar_TpsRate:
                if(chartClick){
                    chart.clearValues();
                    chart.plotDraw();
                } else{
                    chart.clearAllSeires();
                    chart.removeAllSeries();
                }
                break;
            case this.pie_cpuUsage:
            case this.pie_TxnExecuteCount:
            case this.pie_ErrorCount:
                if(chartClick){
                    chart.clearValues();
                    chart.setLegendValues();
                    chart.plotDraw();
                } else {
                    chart.removeAllSeries();
                    chart.labelLayer.removeAll();
                }
                break;
            default: break;
        }
    },

    addChartArea: function(chartArea, chartType) {
        var ix, ixLen,
            wasIdx, wasName;

        chartArea.suspendLayouts();
        for (ix = 0, ixLen = this.wsStore.length; ix < ixLen; ix++) {
            wasIdx = this.wsStore[ix];
            wasName = Comm.webServersInfo[wasIdx].name;
            chartArea.addSeries({
                label : wasName,
                id    : wasName,
                type  : chartType
            });
        }

        chartArea.resumeLayouts();
        chartArea.doLayout();
        chartArea.plotRedraw();
    },

    onChartData: function(header, data){
        var self = this;
        var dataRows = data.rows;
        var ix, len;
        var wsIndex;

        if(!common.Util.checkSQLExecValid(header, data)){
            self.showMessage(common.Util.TR('ERROR'), header.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            self.loadingMask.hide();

            console.info('WASWorkload-onChartData');
            console.debug(header);
            console.debug(data);
            return;
        }

        switch(header.command){
            case self.sql.lineChart:
                var param = header.parameters;
                var tmpSeries = {};

                self.chartDbclickFlag = true;

                self._lineCalculateData(dataRows);

                for ( ix = 0, len = self.wsStore.length; ix < len; ix++){
                    tmpSeries[ix] = Number(ix)+1;
                }

                self.suspendLayouts();
                self.line_ActiveTxnTrend.addValues({
                    from: param.bind[0].value,
                    to  : param.bind[1].value,

                    time: 0,
                    data: self.activeTxnStore,
                    series: tmpSeries
                });
                self.line_ActiveTxnTrend.plotDraw();

                //

                self.line_TpsTrend.addValues({
                    from: param.bind[0].value,
                    to  : param.bind[1].value,

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
                wsIndex = 0;

                for ( ix = 0, len = dataRows.length; ix < len; ix++ ) {

                    wsIndex = self.wsStore.indexOf(dataRows[ix][1]+'');

                    self.bar_ActiveTxnRate.addValue(
                        wsIndex, [dataRows[ix][0], dataRows[ix][2]]
                    );

                    self.bar_TpsRate.addValue(
                        wsIndex, [dataRows[ix][0], dataRows[ix][3]]
                    );
                }

                self.bar_ActiveTxnRate.plotDraw();
                self.bar_TpsRate.plotDraw();

                self.loadingMask.hide();

                break;
            case self.sql.cpuUsagePieChart:
                self.pieChartDraw(self.pie_cpuUsage, dataRows);
                break;
            case self.sql.txnCountPieChart:
                self.pieChartDraw(self.pie_TxnExecuteCount, dataRows);
                break;
            case self.sql.ErrorCountPieChart:
                self.pieChartDraw(self.pie_ErrorCount, dataRows);
                break;
            default : break;
        }
    },

    _lineCalculateData: function(dataRows){
        var self = this;

        var wsId_Index, fromTime, diffHour;

        for (var ix = 0, len = dataRows.length; ix < len; ix++ ) {

            // 0 에 시간값
            wsId_Index = (self.wsStore.indexOf(dataRows[ix][1] + '')) + 1;
            fromTime = new Date(self.fromTime);
            diffHour = (new Date(dataRows[ix][0]+':00:00') - fromTime) / 3600000;

            // Active Transaction Trend
            self.activeTxnStore[diffHour][wsId_Index] = dataRows[ix][2];

            // TPS Trend
            self.tpsStore[diffHour][wsId_Index] = dataRows[ix][3];
        }
    },

    lineChartDbClick: function(xAxis){
        var self = this;

        var dataSet = {};
        var dataTime = xAxis.x,
            from_time = common.Util.getDate(dataTime),
            to_time = Ext.util.Format.date(common.Util.getDate(dataTime), 'Y-m-d H') + ':59:59' ;

        self.loadingMask.showMask();

        self.suspendLayouts();
        self.canvasChartClear(self.bar_ActiveTxnRate, true);
        self.canvasChartClear(self.bar_TpsRate, true);
        self.canvasChartClear(self.pie_cpuUsage, true);
        self.canvasChartClear(self.pie_TxnExecuteCount, true);
        self.canvasChartClear(self.pie_ErrorCount, true);
        self.resumeLayouts();
        self.doLayout();

        dataSet.bind = [{
            name  : "from_time",
            value : from_time,
            type  : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : to_time,
            type  : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name  : "ws_id",
            value : self.wsField.getValue()
        }];

        dataSet.sql_file = self.sql.barChart;
        WS.SQLExec(dataSet, self.onChartData, self);
        //웹 서버별 CPU 사용률
        dataSet.sql_file = self.sql.cpuUsagePieChart;
        WS.SQLExec(dataSet, self.onChartData, self);
        //웹 서버별 트랜잭션 실행 건수
        dataSet.sql_file = self.sql.txnCountPieChart;
        WS.SQLExec(dataSet, self.onChartData, self);
        //웹 서버별 오류 건수
        dataSet.sql_file = self.sql.ErrorCountPieChart;
        WS.SQLExec(dataSet, self.onChartData, self);
    },

    pieChartDraw : function(chart, dataRows){
        var ix, ixLen, wsIndex, wsValue,
            total = 0,
            ratio = 0;

        for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++ ) {
            if(chart === this.pie_ErrorCount){
                var errorCode400, errorCode500;
                errorCode400 = +dataRows[ix][2];
                errorCode500 = +dataRows[ix][3];
                total += errorCode400 + errorCode500;
            } else{
                total += +dataRows[ix][2];
            }
        }

        if(total > 0){
            for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++) {
                wsIndex = this.wsStore.indexOf(dataRows[ix][1]+'');

                if(chart === this.pie_ErrorCount){
                    errorCode400 = +dataRows[ix][2];
                    errorCode500 = +dataRows[ix][3];
                    ratio = ((errorCode400 + errorCode500) / total * 100);

                    wsValue = errorCode400 + errorCode500;
                } else{
                    ratio = (dataRows[ix][2] / total * 100);

                    wsValue = dataRows[ix][2];
                }
                ratio = ratio.toFixed(3);
                chart.setLegendValue(wsIndex, ratio);
                chart.setData(wsIndex, wsValue || 0);
            }
        }

        chart.plotDraw();
    }
});