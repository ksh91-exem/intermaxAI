/**
 * Created by 신정훈 on 2017-09-20.
 */
Ext.define("view.CDWASWorkload", {
    extend: "Exem.FormOnCondition",
    width : '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.H,
    style : {
        background: '#cccccc'
    },
    sql: {
        lineChart : 'IMXPA_WASWorkload_line.sql', //WAS SQL와 동일
        barChart  : 'IMXPA_WASWorkload_bar.sql',  //WAS SQL와 동일
        cpuUsagePieChart     : 'IMXPA_CDWASWorkload_cpuUsage_pie.sql',
        executeCountPieChart : 'IMXPA_CDWASWorkload_executeCount_pie.sql',
        elapseTimePieChart   : 'IMXPA_CDWASWorkload_elapseTime_pie.sql'
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
        var wasValue = this.wasField.getValue();
        var wasCombo = this.wasField.WASDBCombobox;

        if (wasValue == null) {
            wasCombo.select(wasCombo.store.getAt(0));
        }

        var setFocus = function(){
            wasCombo.focus();
        };

        if (wasCombo.getRawValue() != '(All)') {
            if (wasCombo.getRawValue().indexOf(',') == -1) {
                if (this.wasField.AllWasList.indexOf(wasValue+'') == -1) {
                    this.showMessage(common.Util.TR('ERROR'), common.Util.TR('Can not find the Agent Name'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                    return false;
                }
            } else {
                var tmpArray = wasValue.split(',');
                for (var ix = 0, len = tmpArray.length; ix < len; ix++) {
                    if (this.wasField.AllWasList.indexOf(tmpArray[ix]) == -1) {
                        this.showMessage(common.Util.TR('ERROR'), common.Util.TR('The Agent name is invalid'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                        return false;
                    }
                }
            }
        }

        return true;
    },


    checkValid: function() {
        return this._wasValidCheck();
    },

    init: function() {
        var self = this;

        this.count = 0;

        this.chartTitleHeight = 25;
        this.chartDbclickFlag = false;
        this.setWorkAreaLayout('border');
        this.retrieveFlag = false;

        this.wasField = Ext.create('Exem.wasDBComboBox', {
            x: 380,
            y: 5,
            width           : 400,
            multiSelect     : true,
            comboLabelWidth : 60,
            comboWidth      : 280,
            fieldLabel      : common.Util.TR('Agent')
        });


        this.conditionArea.add(this.wasField);
        this.wasField.init();


        this.btnArea = Ext.create('Exem.Container', {
            x : 720,
            y : 5,
            layout: 'hbox',
            width : 130,
            height: 20,
            margin: '5 0 0 0'
        });

        this.btnFirst= this.setBtn('btnFirst', 'firstLeftOFF',  21); // 820
        this.addBtnLine();
        this.btnPrev = this.setBtn('btnPrev',  'leftMoveOFF',   21);
        this.addBtnLine();
        this.btnNext = this.setBtn('btnNext',  'rightMoveOFF',  21);
        this.addBtnLine();
        this.btnLast = this.setBtn('btnLast',  'firstRightOFF', 21);


        switch(nation) {
            case 'ko' :
                this.LABEL_FORMAT = '____-__-__ __:__';
                break;
            case 'zh-CN':
            case 'ja' :
                this.LABEL_FORMAT = '____/__/__ __:__';
                break;
            case 'en' :
                this.LABEL_FORMAT = '__/__/____ __:__';
                break;
            default :
                break;
        }


        this.timeLable = Ext.create('Ext.form.Label', {
            itemId: 'timeLable',
            type  : 'date',
            text  : this.LABEL_FORMAT,
            x     : 830,
            y     : 10,
            style : {
                fontSize: '16px'
            }
        });

        this.conditionArea.add(this.btnArea, this.timeLable);


        var north = Ext.create('Exem.Panel', {
            region : 'north',
            title  : common.Util.TR('Workload Comparison'),
            layout : 'hbox',
            split  : true,
            minHeight : 200,
            height : '40%',
            bodyStyle: 'borderRadius: 6px ;'
        });
        var center = Ext.create('Exem.Panel', {
            region : 'center',
            title  : common.Util.TR('TPS Comparison'),
            layout : 'border',
            split  : true,
            minHeight: 200,
            height : '60%',
            bodyStyle: 'borderRadius: 6px;'
        });

        this.workArea.add(north);
        this.workArea.add(center);

        //기본 틀=========================================================

        // Workload Comparison(Hbox) 에 들어갈 패널 3개 (파이차트 올릴것임)

        this.pie_cpuUsage = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            padding         : 10,
            title           : common.Util.TR('CPU Usage'),
            legendTextAlign : 'east',
            titleHeight     : this.chartTitleHeight,
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
        this.pie_TxnExecuteCount = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            padding         : 10,
            title           : common.Util.TR('Transaction Execution Count'),
            legendTextAlign : 'east',
            titleHeight     : this.chartTitleHeight,
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
        this.pie_TxnElapseTime = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            padding         : 10,
            title           : common.Util.TR('Transaction Elapse Time') + ' (' + decodeURI('%C2%B5') + 's)',
            legendTextAlign : 'east',
            showHistoryInfo : false,
            titleHeight     : this.chartTitleHeight,
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

        north.add(this.pie_cpuUsage, this.pie_TxnExecuteCount, this.pie_TxnElapseTime);


        // 마찬가지 TPS Comparison 에 들어갈 패널 2개 west 60%

        this.line_TpsTrend = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            padding         : '10 10 10 0',
            title           : common.Util.TR('TPS Trend'),
            region          : 'west',
            width           : '67%',
            itemId          : 'TpsTrend',
            legendTextAlign : 'east',
            titleHeight     : this.chartTitleHeight,
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
            style : {
                backgroundColor: '#ffffff'
            },

            plotdblclick: function(event, pos, item, xAxis){
                if (self.chartDbclickFlag) {
                    if (!xAxis)
                        return;

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
                self.line_TpsTrend.drawIndicator(xAxis);
                self.lineChartDbClick(xAxis);
            }

        });

        this.bar_TpsRate = Ext.create('Exem.chart.CanvasChartLayer', {
            layout          : 'fit',
            padding         : '10 10 10 0',
            title           : common.Util.TR('TPS Rate'),
            region          : 'center',
            itemId          : 'TpsRate',
            titleHeight     : this.chartTitleHeight,
            showTitle       : true,
            showMaxValue    : false,
            minWidth        : 300,
            toolTipFormat    : '%x [value:%y]',
            chartProperty   : {
                mode: "categories",
                yLabelWidth: 30,
                xaxis: false,
                colors : realtime.Colors
            },
            style : {
                backgroundColor: '#ffffff'
            }
        });

        center.add(this.line_TpsTrend, this.bar_TpsRate);

    },

    addBtnLine : function() {
        var separator = Ext.create('Ext.container.Container',{
            width: 1,
            height: '100%',
            margin: '4 0 4 0',
            style: {
                background: '#E3E3E3'
            }
        });
        this.btnArea.add(separator);
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
                                self.line_TpsTrend.drawIndicator(xAxis);
                                self.lineChartDbClick(xAxis);

                                break;

                            case 'btnLast' :
                                self.currentTime = Ext.util.Format.date(self.datePicker.getToDateTime()+':00', 'Y-m-d H:i') ;
                                xAxis.x = (+new Date(self.currentTime));
                                self.timeLable.setText(Ext.util.Format.date(self.currentTime, Comm.dateFormat.HM));
                                self.line_TpsTrend.drawIndicator(xAxis);
                                self.lineChartDbClick(xAxis);

                                break;

                            default : break;
                        }
                    });

                }
            }
        });
        this.btnArea.add(btn);
    },

    executeSQL: function() {
        this.loadingMask.showMask();

        this.fromTime = Ext.util.Format.date(this.datePicker.getFromDateTime()+':00', 'Y-m-d H:i') + ':00';
        this.toTime   = Ext.util.Format.date(this.datePicker.getToDateTime()+':59', 'Y-m-d H:i') + ':59';


        this.wasStore = [];
        this.wasStore = this.wasField.getValue().split(',');


        this.currentTime = this.fromTime;

        // 비어있는 2차원 배열을 넣을 배열객체
        this.tpsStore = [];


        var dataSet = {};
        var timeDiff;
        var tmpDate1;
        var tmpDate2;

        this.suspendLayouts();
        this.canvasChartClear(this.line_TpsTrend, false);
        this.canvasChartClear(this.bar_TpsRate, false);
        this.canvasChartClear(this.pie_cpuUsage, false);
        this.canvasChartClear(this.pie_TxnExecuteCount, false);
        this.canvasChartClear(this.pie_TxnElapseTime, false);
        this.resumeLayouts();
        this.doLayout();

        this.addChartArea(this.pie_cpuUsage, PlotChart.type.exPie);
        this.addChartArea(this.pie_TxnExecuteCount, PlotChart.type.exPie);
        this.addChartArea(this.pie_TxnElapseTime, PlotChart.type.exPie);

        this.addChartArea(this.line_TpsTrend, PlotChart.type.exLine);
        this.addChartArea(this.bar_TpsRate, PlotChart.type.exBar);


        tmpDate1 = new Date(this.fromTime);
        tmpDate2 = new Date(this.toTime);

        timeDiff = (tmpDate2.getTime() - tmpDate1.getTime()) / (1000 * 60 * 60);

        for (var ix = 0; ix < timeDiff+1; ix++) {
            this.tpsStore.push([]);

            for (var jx = 1, len = this.wasStore.length; jx < len+1; jx++) {

                if (ix == 0) {
                    this.tpsStore[ix][0] = tmpDate1.getTime();
                } else {
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
            name  : "was_id",
            value : this.wasField.getValue()
        }];
        dataSet.sql_file = this.sql.lineChart;
        WS.SQLExec(dataSet, this.onChartData, this);
    },

    canvasChartClear: function(chart, chartClick){
        switch (chart){
            case this.line_TpsTrend:
                chart.clearValues();
                chart.clearAllSeires();
                chart.removeAllSeries();
                chart.labelLayer.removeAll();
                chart.plotRedraw();
                break;
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
            case this.pie_TxnElapseTime:
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
        for (ix = 0, ixLen = this.wasStore.length; ix < ixLen; ix++) {
            wasIdx = this.wasStore[ix];
            wasName = Comm.wasInfoObj[wasIdx].wasName;
            chartArea.addSeries({
                label : wasName,
                id    : wasName,
                type  : chartType
                //tilt  : 0.5
            });
        }

        chartArea.resumeLayouts();
        chartArea.doLayout();
        chartArea.plotRedraw();
    },

    onChartData: function(header, data){
        var dataRows = data.rows;
        var ix, len;
        var wasIndex;

        if(!common.Util.checkSQLExecValid(header, data)){
            this.showMessage(common.Util.TR('ERROR'), header.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            this.loadingMask.hide();

            console.info('WASWorkload-onChartData');
            console.debug(header);
            console.debug(data);
            return;
        }

        switch(header.command){
            case this.sql.lineChart:
                var param = header.parameters;
                var tmpSeries = {};

                this.chartDbclickFlag = true;

                this._lineCalculateData(dataRows);

                for ( ix = 0, len = this.wasStore.length; ix < len; ix++){
                    tmpSeries[ix] = Number(ix)+1;
                }

                this.suspendLayouts();
                this.line_TpsTrend.addValues({
                    from: param.bind[0].value,
                    to  : param.bind[1].value,

                    time: 0,
                    data: this.tpsStore,
                    series: tmpSeries
                });
                this.line_TpsTrend.plotDraw();
                this.resumeLayouts();

                //====  최초 데이터 전체 시간에서 1시간으로 변경 ====
                var xAxis = {};
                this.currentTime = this.fromTime;
                this.timeLable.setText(Ext.util.Format.date(this.currentTime, Comm.dateFormat.HM));
                xAxis.x = (+new Date(this.currentTime));
                this.line_TpsTrend.drawIndicator(xAxis);
                this.lineChartDbClick(xAxis);
                break;

            case this.sql.barChart:
                wasIndex = 0;

                for ( ix = 0, len = dataRows.length; ix < len; ix++ ) {

                    wasIndex = this.wasStore.indexOf(dataRows[ix][3]+'');

                    this.bar_TpsRate.addValue(
                        wasIndex, [dataRows[ix][0], dataRows[ix][2]]
                    );
                }

                this.bar_TpsRate.plotDraw();

                this.loadingMask.hide();

                break;
            case this.sql.cpuUsagePieChart:
                this.pieChartDraw(this.pie_cpuUsage, dataRows);
                break;
            case this.sql.executeCountPieChart:
                this.pieChartDraw(this.pie_TxnExecuteCount, dataRows);
                break;
            case this.sql.elapseTimePieChart:
                this.pieChartDraw(this.pie_TxnElapseTime, dataRows);
                break;
            default : break;
        }
    },

    _lineCalculateData: function(dataRows){
        var wasId_Index, fromTime, diffHour;

        for (var ix = 0, len = dataRows.length; ix < len; ix++ ) {

            // 0 에 시간값
            wasId_Index = (this.wasStore.indexOf(dataRows[ix][1] + '')) + 1;
            fromTime = new Date(this.fromTime);
            diffHour = (new Date(dataRows[ix][0]+':00:00') - fromTime) / 3600000;

            // TPS Trend
            this.tpsStore[diffHour][wasId_Index] = dataRows[ix][3];
        }
    },

    lineChartDbClick: function(xAxis){
        var dataSet = {};
        var dataTime = xAxis.x,
            from_time = common.Util.getDate(dataTime),
            to_time = Ext.util.Format.date(common.Util.getDate(dataTime), 'Y-m-d H') + ':59:59' ;

        this.loadingMask.showMask();

        this.suspendLayouts();
        this.canvasChartClear(this.bar_TpsRate, true);
        this.canvasChartClear(this.pie_cpuUsage, true);
        this.canvasChartClear(this.pie_TxnExecuteCount, true);
        this.canvasChartClear(this.pie_TxnElapseTime, true);
        this.resumeLayouts();
        this.doLayout();

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
            name  : "was_id",
            value : this.wasField.getValue()
        }];

        dataSet.sql_file = this.sql.barChart;
        WS.SQLExec(dataSet, this.onChartData, this);
        //CPU 사용률
        dataSet.sql_file = this.sql.cpuUsagePieChart;
        WS.SQLExec(dataSet, this.onChartData, this);
        //트랜잭션 실행 건수
        dataSet.sql_file = this.sql.executeCountPieChart;
        WS.SQLExec(dataSet, this.onChartData, this);
        //트랜잭션 수행시간
        dataSet.sql_file = this.sql.elapseTimePieChart;
        WS.SQLExec(dataSet, this.onChartData, this);
    },

    pieChartDraw : function(chart, dataRows){
        var ix, ixLen, wasIndex, wasValue,
            total = 0,
            ratio = 0;

        for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++ ) {
            total += +dataRows[ix][2];
        }

        if(total > 0){
            for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++) {
                wasIndex = this.wasStore.indexOf(dataRows[ix][1]+'');

                ratio = (dataRows[ix][2] / total * 100);
                wasValue = dataRows[ix][2];
                ratio = ratio.toFixed(3);
                chart.setLegendValue(wasIndex, ratio);
                chart.setData(wasIndex, wasValue || 0);
            }
        }

        chart.plotDraw();
    }
});