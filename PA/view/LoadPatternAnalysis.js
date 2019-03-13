Ext.define('view.LoadPatternAnalysis', {
    extend: 'Exem.Form',
    config: {
        fromDateField: null,
        toDateField: null
    },

    cls : 'list-condition Exem-FormOnCondition',

    DisplayTime   :  DisplayTimeMode.HM,
    defaultTimeGap : null,                     // 1시간 단위
    rangeOneDay   : true,
    singleField   : false,
    isDiff        : false,                     // Daily DatePicker 일자 경고메시지 10일로 변경하기 위해 추가 - HK
    multiSelect   : false,                     // Instance Name을 Single or Multi로 하는 옵션 추가. jc.won

    minDate : null,
    maxDate : null,

    width: '100%',
    height: '100%',

    style: {
        background: '#cccccc'
    },

    autoScroll: true,
    detail_topic : null,

    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    init: function() {
        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.retrieveFlag = false;
        this.isLoading  = false;
        this.isInitLayout = false;

        this.radarChartArr = [];
        this.chartList = [];
        this.chartData = [];
        this.statIdArr = ['cpu_time', 'elapsed_time', 'execution_count'];
        this.statObj = {
            'elapsed_time'    : 'Elapsed Time',
            'execute_count'   : 'Execute Count',
            'cpu_time'        : 'CPU Time',
            'remote_time'     : 'Remote Time',
            'execution_count' : 'Execution count',
            'sql_elapsed'     : 'SQL Elapse Time',
            'exception_count' : 'Exception Count',
            'db_conn_count'   : 'DB Conn Count',
            'fetch_time'      : 'Fetch Count'
        }
    },

    initLayout: function() {
        this.createConditionArea();
        this.setWorkAreaLayout('border');
        this.createWorkArea();

        var ix, ixLen;
        for (ix = 0, ixLen = this.radarChartArr.length; ix < ixLen; ix++) {
            this.radarChartArr[ix].init();
        }

        this.isInitLayout = true;
    },

    setWorkAreaLayout: function(atype) {
        this.workArea = Ext.create("Ext.container.Container", {
            width: '100%',
            flex: 1,
            layout: atype,
            border: false,
            cls  : 'Exem-Form-workArea',
            style: {
                borderRadius: '6px'
            }
        });

        this.add({ xtype: 'container', height : 10,  style: 'background : #e9e9e9' }, this.workArea);

        this.workArea.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.workArea,
            type: 'large-whirlpool'
        });
    },

    createConditionArea: function() {
        this.conditionArea = Ext.create("Ext.container.Container", {
            layout: 'hbox',
            width: '100%',
            height: 39
        });

        this.leftConditionContainer();
        this.rightConditionContainer();
        this.addWasComboBox();

        this.add(this.conditionArea);
    },

    leftConditionContainer: function() {
        this.leftConditionArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            itemId: 'containerArea',
            flex: 1,
            height: '100%',
            border: false,
            layout: 'absolute',
            style: {
                background: '#ffffff',
                padding: "5px 5px"
            }
        });

        // Calendar
        this.leftDatePicker = Ext.create('Exem.DatePicker',{
            x: 25,
            y: 5,
            useRetriveBtn : false,
            executeScope: this,
            //<0------ DatePicker Type 관련
            DisplayTime: this.DisplayTime,
            rangeOneDay: this.rangeOneDay,
            singleField: this.singleField,
            isDiff     : this.isDiff,
            defaultTimeGap : this.defaultTimeGap
        });

        this.leftConditionArea.add(this.leftDatePicker);


        // Retrieve Button Area
        this.leftConditionRetrieveArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            layout: 'absolute',
            width: 100,
            height: '100%',
            border: false,
            items: Ext.create("Ext.button.Button", {
                text: common.Util.TR('Analysis'),
                x: 0,
                y: '20%',
                width: 90,
                height: 25,
                cls: 'retrieve-btn',
                handler: function() {
                    this.analysis(this);;
                }.bind(this)
            })
        });

        var conditionBackground = Ext.create("Ext.container.Container", {
            layout: 'hbox',
            width: '45%',
            height: 39,
            style: {
                margin: '0px 0px 2px 0px',
                background: '#ffffff' ,
                borderRadius: '6px'
            }
        });

        conditionBackground.add([this.leftConditionArea, this.leftConditionRetrieveArea]);
        this.conditionArea.add(conditionBackground);
    },

    rightConditionContainer: function() {
        this.rightConditionArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            itemId: 'containerArea',
            flex: 1,
            height: '100%',
            border: false,
            layout: 'absolute',
            style: {
                background: '#ffffff',
                padding: "5px 5px"
            }
        });

        // Calendar
        this.rightDatePicker = Ext.create('Exem.DatePicker',{
            x: 25,
            y: 5,
            useRetriveBtn : false,
            executeScope: this,
            DisplayTime: this.DisplayTime,
            rangeOneDay: this.rangeOneDay,
            singleField: this.singleField,
            isDiff     : this.isDiff,
            defaultTimeGap : this.defaultTimeGap
        });

        this.rightConditionArea.add(this.rightDatePicker);



        // Retrieve Button Area
        this.rightConditionRetrieveArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            layout: 'absolute',
            width: 100,
            height: '100%',
            border: false,
            items: Ext.create("Ext.button.Button", {
                text: common.Util.TR('Retrieve'),
                x: 0,
                y: '20%',
                width: 90,
                height: 25,
                cls: 'retrieve-btn',
                handler: function() {
                    this.retrieve(this);
                }.bind(this)
            })
        });

        var conditionBackground = Ext.create("Ext.container.Container", {
            layout: 'hbox',
            width: '55%',
            height: 39,
            style: {
                margin: '0px 0px 2px 5px',
                background: '#ffffff' ,
                borderRadius: '6px'
            }
        });

        conditionBackground.add([this.rightConditionArea, this.rightConditionRetrieveArea]);
        this.conditionArea.add(conditionBackground);
    },

    addWasComboBox: function() {
        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            x: 295,
            y: 5,
            width           : 260,
            comboLabelWidth : 60,
            comboWidth      : 240,
            selectType: common.Util.TR('Agent'),
            addSelectAllItem: false
        });

        this.wasCombo.init();

        this.rdoServerTypeField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            labelWidth  : 40,
            x           : 580,
            y           : 5
        });

        this.leftConditionArea.add(this.wasCombo);
    },

    createWorkArea: function() {
        this.leftCon = Ext.create('Exem.Container',{
            region: 'west',
            layout: 'vbox',
            width : '45%',
            heigth: '100%',
            split : true,
            border: false
        });


        this.rightCon = Ext.create('Exem.Container',{
            region: 'center',
            layout: 'vbox' ,
            width : '55%',
            heigth: '100%'
        });

        this.createRadarChartArea();
        this.createChartArea();

        this.workArea.add(this.leftCon, this.rightCon);
    },

    createRadarChartArea: function() {
        var ix, ixLen,
            hboxCon, lRadarChart, rRadarChart;

        for (ix = 0, ixLen = 3; ix < ixLen; ix++) {
            hboxCon = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                width : '100%',
                flex : 1,
                style : {
                    background : '#ffffff'
                }
            });
            this.leftCon.add(hboxCon);

            lRadarChart = Ext.create('Exem.RadarChart');
            rRadarChart = Ext.create('Exem.RadarChart');

            hboxCon.add([lRadarChart, rRadarChart]);

            this.radarChartArr.push(lRadarChart);
            this.radarChartArr.push(rRadarChart);
        }
    },

    createChartArea: function() {
        var ix, ixLen, statId, statName;
        for (ix = 0, ixLen = this.statIdArr.length; ix < ixLen; ix++) {
            statId = this.statIdArr[ix];
            statName = common.Util.TR(this.statObj[statId]);

            this.rightCon.add(this.createChart(statName));
        }
    },

    createChart: function(title, statName) {
        var self = this,
            chart;

        chart = Ext.create('Exem.chart.CanvasChartLayer', {
            flex: 10,
            title: common.Util.CTR(title),
            statName: statName ? statName : title,
            interval: PlotChart.time.exTenMin,
            titleHeight: 17 ,
            titleWidth: 170,
            titleFontSize: '12px',
            showTitle: true,
            showLegend: true,
            showXAxis: false,
            legendWidth: 120,
            legendNameWidth: 90,
            legendTextAlign: 'east',
            showIndicator: true,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip: false,
            fillIntervalValue: true,
            useCustomContextMenu: true,
            cls: 'PerformanceTrend-MidChart',
            chartProperty: {
                yLabelWidth: 55,
                xLabelFont: { size: 8, color: 'black' },
                yLabelFont: { size: 8, color: 'black' },
                xaxis: true,
                colors: realtime.Colors,
                autoHighlight : false
            },
            xaxisCurrentToTime : true,
            historyInfoDblClick: function(chart, record) {
                self.setIndicatorTime(common.Util.getDate(record.data['TIME']));
                self.moveIndicator();
            },
            plotdblclick : function(event, pos, item, xAxis) {
                var fromTime, toTime;

                if (pos.x < 0 || !xAxis) {
                    return;
                }

                fromTime = +new Date(self.rightDatePicker.getFromDateTime());
                toTime = +new Date(self.rightDatePicker.getToDateTime());

                if (pos.x < fromTime || pos.x > toTime) {
                    return;
                }

                self.setIndicatorTime(common.Util.getDate(xAxis.x));
                self.moveIndicator();
            },
            plothover: function(event, pos, item) {
                if (item) {
                    this.currItem = item;
                } else {
                    this.lastItem = this.currItem;
                    this.currItem = null;
                }
            }
        });

        this.chartList.push(chart);

        return chart;
    },

    executeAnalysis: function() {
        var AJSON = {};

        if (!this.isLoading) {
            this.isLoading = true;
            this.loadingMask.showMask();
        } else {
            return;
        }

        AJSON.dll_name = 'IntermaxPlugin.dll';
        AJSON.options  = {
            func_name : 'ExemImxWCLSTWasTraining',
            was_id    : this.wasCombo.getValue(),
            from_time : Ext.util.Format.date(this.leftDatePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            to_time   : Ext.util.Format.date(this.leftDatePicker.getToDateTime(), 'Y-m-d H:i') + ':00'
        };
        AJSON['function'] = 'get_extends_script';

        console.log(AJSON);

        WS.PluginFunction(AJSON, function (aheader, adata) {
            try {
                if (aheader.success) {
                    var ix, ixLen,
                        jx, jxLen, key;

                    for (ix = 0, ixLen = adata.data.length; ix < ixLen; ix++) {
                        var keys = Object.keys(adata.data[ix]),
                            data = [];

                        for (jx = 0, jxLen = keys.length; jx < jxLen; jx++) {
                            key = keys[jx];
                            if (key != 'cluster_name') {
                                data.push({ axis : common.Util.TR(this.statObj[key]), value : adata.data[ix][key].toFixed(2), title : adata.data[ix]['cluster_name'] });
                            }
                        }

                        this.radarChartArr[ix].setData(data);
                        this.radarChartArr[ix].draw();
                    }

                    this.detail_topic = adata.detail_topic;
                    this.minDate = aheader.parameters.options.from_time;
                    this.maxDate = aheader.parameters.options.to_time;

                    // this.rightDatePicker.setFromTimeFocus()

                } else {
                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Failed to retrieve the data for this request.'), Ext.Msg.OK, Ext.MessageBox.ERROR);
                    console.warn(aheader);
                }
            } catch (e) {
                this.isLoading = false;
                this.loadingMask.hide();
            } finally {
                this.isLoading = false;
                this.loadingMask.hide();
            }
        }.bind(this));
    },

    executeSQL: function(idx) {
        if (this.detail_topic == null) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('분석부터 해주세요.'), Ext.Msg.OK, Ext.MessageBox.ERROR);
            return;
        }

        var AJSON = {};

        if (!this.isLoading) {
            this.isLoading = true;
            this.loadingMask.showMask();
        } else {
            return;
        }

        AJSON.dll_name = 'IntermaxPlugin.dll';
        AJSON.options  = {
            func_name : 'ExemImxWCLSTWasService',
            was_id    : this.wasCombo.getValue(),
            from_time : Ext.util.Format.date(this.rightDatePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            to_time   : Ext.util.Format.date(this.rightDatePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            topic     : this.detail_topic,
            stat_name : this.statIdArr[idx]
        };
        AJSON['function'] = 'get_extends_script';

        console.log(AJSON);


        WS.PluginFunction(AJSON, function (header, data) {
            // var header = {"ai_received_time(ms)":2870,"resultset_count":1,"ai_received_time":1545086661764,"received_time":1545086658845,"ai_topic":"exem_imx_wclst_was","type":"plugin_function","message":"","command":"get_extends_script","return_param":true,"request_time":1545086658846,"query_time(ms)":31,"job_id":"plugin_function_call_9317","success":true,"retry_count":0,"processing_time(ms)":2919,"ai_request_time":1545086658894,"value":"IntermaxPlugin.dll","parameters":{"options":{"stat_name":"elapsed_time","topic":"exem_imx_wclst_was_1545119037536-6fa357c4-2db3-4f15-a012-c2998d11e668","was_id":"1","to_time":"2018-12-13 22:50:00","from_time":"2018-12-13 01:40:00","func_name":"ExemImxWCLSTWasService"}},"ai_connection_time(ms)":13,"result_time":1545151461776,"parse_time":1545151461776};
            // var data = [{"Cluster_00":973,"Cluster_01":63,"Cluster_02":610,"time":"2018-12-13 11:20:00","Cluster_03":0,"Cluster_04":193},{"Cluster_00":0,"Cluster_01":0,"Cluster_02":0,"time":"2018-12-13 13:00:00","Cluster_03":884704,"Cluster_04":0},{"Cluster_00":2634600,"Cluster_01":66201,"Cluster_02":1562806,"time":"2018-12-13 13:10:00","Cluster_03":1962839,"Cluster_04":56023},{"Cluster_00":2939831,"Cluster_01":83784,"Cluster_02":1871620,"time":"2018-12-13 13:20:00","Cluster_03":1995651,"Cluster_04":70614},{"Cluster_00":4036376,"Cluster_01":163276,"Cluster_02":2404293,"time":"2018-12-13 13:30:00","Cluster_03":1896901,"Cluster_04":87083},{"Cluster_00":4905051,"Cluster_01":210691,"Cluster_02":3502955,"time":"2018-12-13 13:50:00","Cluster_03":1323844,"Cluster_04":70356}];

            // console.log(header);
            // console.log(data);

            try {
                if (header.success) {
                    var ix, ixLen,
                        jx, jxLen, rowDataArr= [],
                        time, dataArr = [], keys, key;

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        keys = Object.keys(data[ix]).sort().reverse();

                        dataArr = [];
                        dataArr.push(data[ix]['time']);

                        for (jx = 0, jxLen = keys.length; jx < jxLen; jx++) {
                            key = keys[jx];
                            if (key != 'time') {
                                dataArr.push(data[ix][key]);
                            }
                        }

                        rowDataArr.push(dataArr);
                    }

                    console.log(rowDataArr);

                    this.chartData.push(rowDataArr);
                    this.drawChart(header.parameters.options);
                } else {
                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Failed to retrieve the data for this request.'), Ext.Msg.OK, Ext.MessageBox.ERROR);
                    console.warn(header);
                }
            } catch (e) {
                if (idx == 2) {
                    this.isLoading = false;
                    this.loadingMask.hide();
                }
            } finally {
                if (idx == 2) {
                    this.isLoading = false;
                    this.loadingMask.hide();
                }
            }
        }.bind(this));

        this.isLoading = false;
    },

    analysis: function(scope) {
        var self = this;

        if (typeof scope != 'undefined')
            self = scope;

        var result = self.leftDatePicker.checkValid();
        if (result) {
            self.executeAnalysis();
        }
        else {
            console.warn('Failed validation - ', self.title);
            if (typeof result == 'string')
                console.warn('message :', result);

        }
    },

    retrieve: function(scope) {
        var self = this,
            ix, ixLen, chart;

        if (typeof scope != 'undefined')
            self = scope;

        var result = self.rightDatePicker.checkValid() && self.rangeCheck(this.minDate, this.maxDate);
        if (result) {
            for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
                chart = this.chartList[ix];

                chart.clearValues();
                chart.clearAllSeires();
                chart.removeAllSeries();
                chart.labelLayer.removeAll();
                chart.plotDraw();

                self.executeSQL(ix);
            }
        }
        else {
            console.warn('Failed validation - ', self.title);
            if (typeof result == 'string')
                console.warn('message :', result);

        }
    },

    addChartSeries: function(chart, ixLen) {
        var ix;

        chart.suspendLayouts();

        for (ix = 0; ix < ixLen; ix++){
            chart.addSeries({
                id : ix,
                label: 'Cluster_0' + ix,
                fill : 0.5,
                type : PlotChart.type.exLine
            });
        }

        chart.resumeLayouts();
        chart.doLayout();
        chart.plotDraw();
    },

    drawChart: function(options) {
        if (this.chartData.length < 3) {
            return;
        }

        var ix, ixLen, chart, rowDataArr,
            jx, jxLen, rowData, time,
            fromTime, toTime;

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            chart = this.chartList[ix];
            rowDataArr = this.chartData[ix];

            this.addChartSeries(chart, rowDataArr[0].length - 1);
            chart.setChartRange(+new Date(options.from_time) , +new Date(options.to_time));

            for (jx = 0, jxLen = rowDataArr.length; jx < jxLen; jx++) {
                rowData = rowDataArr[jx];
                time = +new Date(rowData[0]);

                chart.addValue(0, [time, rowData[1] + rowData[2] + rowData[3] + rowData[4] + rowData[5]]);
                chart.addValue(1, [time, rowData[1] + rowData[2] + rowData[3] + rowData[4]]);
                chart.addValue(2, [time, rowData[1] + rowData[2] + rowData[3]]);
                chart.addValue(3, [time, rowData[1] + rowData[2]]);
                chart.addValue(4, [time, rowData[1]]);
            }

            chart.plotDraw();
        }

        this.chartData = [];

        fromTime = +new Date(this.datePicker.getFromDateTime());
        toTime = +new Date(this.datePicker.getToDateTime());
        time = +new Date(this.indicatorTime);

        if (!this.indicatorTime || time < fromTime || time > toTime) {
            this.setIndicatorTime();
        }

        this.moveIndicator();
    },

    setIndicatorTime: function(time) {
        if (time) {
            this.indicatorTime = time;
        } else {
            this.indicatorTime = this.rightDatePicker.getFromDateTime() + ':00';
        }
    },

    moveIndicator: function() {
        var ix, ixLen, indicatorPos, chart,
            chart;

        indicatorPos = {
            x: +new Date(this.indicatorTime),
            y: null
        };

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            chart = this.chartList[ix];
            chart.drawIndicator(indicatorPos);
        }
    },

    rangeCheck: function(minDate, maxDate) {
        var fromTime, toTime;

        fromTime = Ext.util.Format.date(this.rightDatePicker.getFromDateTime(), 'Y-m-d H:i') + ':00';
        toTime = Ext.util.Format.date(this.rightDatePicker.getToDateTime(), 'Y-m-d H:i') + ':00';

        if (new Date(minDate) <= new Date(fromTime) && new Date(maxDate) >= new Date(toTime)) {
            return true;
        } else {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select the period %1 ~ %2.', [this.minDate, this.maxDate]), Ext.Msg.OK, Ext.MessageBox.WARNING);
        }
    }

});