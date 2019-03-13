Ext.define("view.DailySummary", {
    extend: "Exem.FormOnCondition",
    width : '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.None,
    //DatePicker 에서 none 일 경우 defaultTimeGap 가 일단위로 처리가 됨. 즉, 21일
    defaultTimeGap : 21,
    isDiff : true,
    sql: {
        top : {
            txnCount        : 'daily_txn_count.sql',
            visitors        : 'daily_visitors.sql',
            exceptionSum    : 'daily_exception_sum.sql'
        },
        mid : {
            txnCount        : 'daily_hour_txn_count.sql',
            visitors        : 'daily_hour_visitors.sql',
            concurrentUsers : 'daily_hour_concurrent_users.sql',
            elapseAvg       : 'daily_hour_elapse_avg.sql',
            exceptionSum    : 'daily_hour_exception_sum.sql'
        },
        grid : {
            txnGrid         : 'daily_txn_grid.sql',
            SQLGrid         : 'daily_SQL_grid.sql',
            exceptionGrid   : 'daily_exception_grid.sql'
        },
        subGrid : {
            txnGrid         : 'daily_txn_sub_grid.sql',
            SQLGrid         : 'daily_SQL_sub_grid.sql',
            exceptionGrid   : 'daily_exception_sub_grid.sql'
        },
        bottom : {
            elapseCount     : 'daily_txn_elapse_count.sql',
            failCount       : 'daily_txn_fail_count.sql',
            elapseSum       : 'daily_txn_elapse_sum.sql',
            elapseAvg       : 'daily_txn_elapse_avg.sql',
            elapseMax       : 'daily_txn_elapse_max.sql',
            elapseMin       : 'daily_txn_elapse_min.sql',
            cpuSum          : 'daily_txn_cpu_sum.sql'
        },
        under : {
            elapseCount     : 'daily_txn_hour_elapse_count.sql',
            failCount       : 'daily_txn_hour_fail_count.sql',
            elapseSum       : 'daily_txn_hour_elapse_sum.sql',
            elapseAvg       : 'daily_txn_hour_elapse_avg.sql',
            elapseMax       : 'daily_txn_hour_elapse_max.sql',
            elapseMin       : 'daily_txn_hour_elapse_min.sql',
            cpuSum          : 'daily_txn_hour_cpu_sum.sql'
        }
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

    //***************************agent check***********************************
    checkValid: function() {
        return this.wasCombo.checkValid();
    },

    initProperty : function(){
        this.didRetrive = false;
        this.chartIndex = {
            mid : null,
            bottom : null
        };
        this.midBarCheck = false;
        this.bottomBarCheck = true;
        this.plotClickCheck = false;
        this.gridClickCheck = null;
        this.offsetCount= {
            txn : 0,
            sql : 0
        };
        this.bottomSelect = null;
        this.retrieveFlag = false;
    },

    init: function(){
        this.initProperty();

        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 350,
            comboWidth      : 260,
            comboLabelWidth : 60,
            multiSelect     : true,
            selectType      : common.Util.TR('Agent'),
            x               : 380,
            y               : 5
        });

        this.conditionArea.add( this.wasCombo );
        this.wasCombo.init();

        //**************autoScroll 적용 ***********
        var workBackground = Ext.create("Ext.container.Container", {
            region      : 'north',
            autoScroll  : true,
            layout      : 'vbox',
            height      : '100%',
            width       : '100%',
            style       : {
                margin          : '0px 0px 2px 0px',
                background      : '#e9e9e9',
                borderRadius    : '6px'
            }
        });

        this.setWorkAreaLayout('border');

        var topPanel = Ext.create('Exem.Container', {
            layout   : 'vbox',
            height   : 250,
            style    : {
                borderRadius    : '6px',
                background      : '#ffffff'
            }
        });

        var midPanel = Ext.create('Exem.Container', {
            layout   : 'vbox',
            height   : 250,
            split    : true,
            style    : {
                borderRadius    : '6px',
                background      : '#ffffff'
            }
        });

        this.bottomPanel = Ext.create('Exem.Container', {
            layout   : 'vbox',
            height   : 250,
            split    : true,
            style    : {
                borderRadius    : '6px',
                background      : '#ffffff'
            }
        });

        this.underPanel = Ext.create('Exem.Container', {
            layout   : 'vbox',
            height   : 250,
            split    : true ,
            style    : {
                borderRadius    : '6px',
                background      : '#ffffff'
            }
        });

        this.transactionTab = Ext.create('Exem.Container', {
            title   : common.Util.TR('Transaction'),
            itemId  : 'transactionTab'
        });

        this.SQLTab = Ext.create('Exem.Container', {
            title   : common.Util.TR('SQL'),
            itemId  : 'SQLTab'
        });

        this.exceptionTab = Ext.create('Exem.Container', {
            title   : common.Util.TR('Exception'),
            itemId  : 'exceptionTab'
        });

        this.subGridContainer = Ext.create('Exem.Container', {
            layout   : 'fit',
            height   : 200,
            split    : true ,
            style    : 'borderRadius : 6px;'
        }) ;

        this.topChartRadio();
        this.midChartRadio();
        this.bottomChartRadio();
        this.underChartRadio();

        this.topChart();
        this.midChart();
        this.bottomChart();
        this.underChart();

        this.gridTabPanel();

        this.transactionGrid();
        this.SQLGrid();
        this.exceptionGrid();

        this.subGridSum();

        //***************배치(workArea)*************
        //grid 배치
        this.summaryGridTabPnl.add([this.transactionTab, this.SQLTab, this.exceptionTab]);

        //radio 배치
        topPanel.add(this.dateRadioField);
        midPanel.add(this.perHourRadioField);
        this.bottomPanel.add([ this.txnNameTitle, this.txnDateRadioField ]);
        this.underPanel.add(this.txnPerHourRadioField);

        //chart 배치
        topPanel.add(this.topBarChart);
        midPanel.add([ this.midBarChart, this.midLineChart ]);
        this.bottomPanel.add([ this.bottomBarChart, this.bottomLineChart ]);
        this.underPanel.add([ this.underBarChart, this.underLineChart ]);

        //초기 line 차트 숨기기
        this.midLineChart.setVisible(false);
        this.bottomLineChart.setVisible(false);
        this.underLineChart.setVisible(false);

        workBackground.add([ topPanel, midPanel, this.summaryGridTabPnl, this.subGridContainer, this.bottomPanel, this.underPanel ]);

        this.workArea.add(workBackground);
    },
    //end init

    topChartRadio : function(){
        var self = this;
        //*****************일별 선택 데이터**********************
        this.dateRadioField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            itemId      : 'dateRadioField',
            items : [{
                boxLabel : common.Util.TR('Daily Request Count'),
                width: 180,
                name : this.id + '_dateData',
                checked: true,
                listeners : {
                    change: function(){
                        self.radioChangeSetting(this,'top');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Daily Visitor Count'),
                width: 180,
                name : this.id + '_dateData',
                listeners : {
                    change: function(){
                        self.radioChangeSetting(this,'top');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Daily Exception Count'),
                width: 180,
                name : this.id + '_dateData',
                listeners : {
                    change: function(){
                        self.radioChangeSetting(this,'top');
                    }
                }
            }],
            style    : {
                margin: '4px 0px 0px 10px'
            }
        });
    },
    midChartRadio : function(){
        var self = this;
        //******************선택 일자의 시간당 선택 데이터*****************
        this.perHourRadioField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            itemId      : 'perHourRadioField',
            items : [{
                boxLabel : common.Util.TR('Request Count Per Hour'),
                width: 180,
                name : this.id + '_perHourData',
                checked: true,
                listeners : {
                    change: function(){
                        self.radioChangeSetting( this, 'mid');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Visitor Count Per Hour'),
                width: 180,
                name : this.id + '_perHourData',
                listeners : {
                    change: function(){
                        self.radioChangeSetting( this, 'mid');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Concurrent Users'),
                width: 180,
                name : this.id + '_perHourData',
                listeners : {
                    change: function(){
                        self.radioChangeSetting( this, 'mid');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Elapse Time (AVG)'),
                width: 180,
                name : this.id + '_perHourData',
                listeners : {
                    change: function(){
                        self.radioChangeSetting( this, 'mid');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Exception Count Per Hour'),
                width: 180,
                name : this.id + '_perHourData',
                listeners : {
                    change: function(){
                        self.radioChangeSetting( this, 'mid');
                    }
                }
            }],
            style    : {
                margin: '4px 0px 0px 10px'
            }
        });
    },
    bottomChartRadio : function(){
        var self = this;
        //************** bottomChart의 트랜잭션명 들어갈 공간 추가 **************
        this.txnNameTitle = Ext.create('Exem.Container',{
            html: common.Util.TR('Txn Name')  + ' : ',
            width: '100%',
            height : 15,
            style: {
                margin: '4px 0px 0px 10px'
            }
        });
        //******************선택한 트랜잭션의 일별 선택 데이터****************
        this.txnDateRadioField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            itemId      : 'txnDateRadioField',
            items : [{
                boxLabel : common.Util.TR('Daily Execute Count'),
                width: 180,
                name : this.id + '_txnDateData',
                checked: true,
                listeners : {
                    change: function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Daily Failure Count'),
                width: 180,
                name : this.id + '_txnDateData',
                listeners : {
                    change: function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Daily Elapse Time (sum)'),
                width: 180,
                name : this.id + '_txnDateData',
                listeners : {
                    change: function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Daily Elapse Time (avg)'),
                width: 180,
                name : this.id + '_txnDateData',
                listeners : {
                    change: function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Daily Elapse Time (max)'),
                width: 180,
                name : this.id + '_txnDateData',
                listeners : {
                    change: function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Daily Elapse Time (min)'),
                width: 180,
                name : this.id + '_txnDateData',
                listeners : {
                    change: function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel : common.Util.TR('Daily CPU Time (sum)'),
                width: 180,
                name : this.id + '_txnDateData',
                listeners : {
                    change: function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }],
            style    : {
                margin: '4px 0px 0px 10px'
            }
        });
    },
    underChartRadio : function(){
        //****************선택한 트랜잭션의 선택 일자의 시간당 데이터************
        this.txnPerHourRadioField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            itemId      : 'txnPerHourRadioField',
            items : {
                boxLabel : common.Util.TR('Per Hour Date'),
                width: 300,
                name : 'txnPerTimeData',
                checked: true
            },
            style    : {
                margin: '4px 0px 0px 10px'
            }
        });
    },

    radioChangeSetting: function( radio, position ){
        if (radio.value && this.didRetrive){
            this.loadingMask.showMask();

            switch(radio.boxLabel){
                //top radio change
                case common.Util.TR('Daily Request Count'):
                    this.chartExecuteSQL(this.sql.top.txnCount, 'top');
                    break;
                case common.Util.TR('Daily Visitor Count'):
                    this.chartExecuteSQL(this.sql.top.visitors, 'top');
                    break;
                case common.Util.TR('Daily Exception Count'):
                    this.chartExecuteSQL(this.sql.top.exceptionSum, 'top');
                    break;

                //mid radio change
                case common.Util.TR('Request Count Per Hour'):
                    this.chartSetting('bar', position);
                    this.chartExecuteSQL(this.sql.mid.txnCount, 'mid');
                    break;
                case common.Util.TR('Visitor Count Per Hour'):
                    this.chartSetting('bar', position);
                    this.chartExecuteSQL(this.sql.mid.visitors, 'mid');
                    break;
                case common.Util.TR('Concurrent Users'):
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.mid.concurrentUsers, 'mid');
                    break;
                case common.Util.TR('Elapse Time (AVG)'):
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.mid.elapseAvg, 'mid');
                    break;
                case common.Util.TR('Exception Count Per Hour'):
                    this.chartSetting('bar', position);
                    this.chartExecuteSQL(this.sql.mid.exceptionSum, 'mid');
                    break;

                //bottom radio change
                case common.Util.TR('Daily Execute Count'):
                    this.chartSetting('bar', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseCount, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseCount;
                    break;
                case common.Util.TR('Daily Failure Count'):
                    this.chartSetting('bar', position);
                    this.chartExecuteSQL(this.sql.bottom.failCount, 'bottom');
                    this.bottomSelect = this.sql.bottom.failCount;
                    break;
                case common.Util.TR('Daily Elapse Time (sum)'):
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseSum, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseSum;
                    break;
                case common.Util.TR('Daily Elapse Time (avg)'):
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseAvg, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseAvg;
                    break;
                case common.Util.TR('Daily Elapse Time (max)'):
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseMax, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseMax;
                    break;
                case common.Util.TR('Daily Elapse Time (min)'):
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseMin, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseMin;
                    break;
                case common.Util.TR('Daily CPU Time (sum)'):
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.cpuSum, 'bottom');
                    this.bottomSelect = this.sql.bottom.cpuSum;
                    break;
                default:
                    break;
            }
        }
    },

    chartSetting: function( chartType, position ){
        if( chartType === 'bar' && position === 'mid' ){
            this.midBarCheck = true;
            this.midBarChart.setVisible(true);
            this.midLineChart.setVisible(false);
        }
        if( chartType === 'bar' && position === 'bottom' ){
            this.bottomBarCheck = true;
            this.bottomLineChart.setVisible(false);
            this.bottomBarChart.setVisible(true);
            this.gridClickCheck = false;
        }
        if ( chartType === 'line' && position === 'mid' ){
            this.midBarCheck = false;
            this.midBarChart.setVisible(false);
            this.midLineChart.setVisible(true);
        }
        if ( chartType === 'line' && position === 'bottom' ){
            this.bottomBarCheck = false;
            this.bottomLineChart.setVisible(true);
            this.bottomBarChart.setVisible(false);
            this.gridClickCheck = false;
        }

        this.plotClickCheck = false;
    },

    topChart : function(){
        var self = this;
        //************ Chart ************************************************************
        this.topBarChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat       : '%x [value:%y]',
            toolTipTimeFormat   : '%m-%d',
            showTooltip         : true,
            showDayLine         : false,
            showMaxValue        : true,
            highLighHold        : true,
            chartProperty       : { timeformat : '%m-%d' },
            interval            : PlotChart.time.exDay,
            plotclick           : function(event, pos, item){
                self.plotClickEvent(item, 'bar', 'top');
            }
        });

        this.topBarChart.addSeries({
            id: 'top_bar_chart',
            type: PlotChart.type.exBar,
            color: '#2B99F0',
            cursor : true
        });
    },
    midChart : function(){
        var self = this;
        this.midBarChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat  : '%x [value:%y]',
            toolTipTimeFormat : '%d %H:%M',
            showTooltip    : true,
            showMaxValue   : true,
            highLighHold   : true,
            chartProperty: { timeformat : '%H' },
            interval       : PlotChart.time.exHour,
            plotclick: function(event, pos, item){
                self.plotClickEvent(item, 'bar', 'mid');
            }
        });
        //*************line 차트를 위해서 새롭게 생성
        this.midLineChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat  : '%x [value:%y]',
            toolTipTimeFormat : '%d %H:%M',
            showTooltip    : true,
            showMaxValue   : true,
            highLighHold   : true,
            chartProperty: { timeformat : '%H' },
            interval       : PlotChart.time.exHour,
            plotclick: function(event, pos, item){
                self.plotClickEvent(item, 'line', 'mid');
            }
        });

        this.midBarChart.addSeries({
            id: 'mid_bar_chart',
            type: PlotChart.type.exBar,
            color: '#8AC44B',
            cursor : true
        });

        this.midLineChart.addSeries({
            id: 'mid_line_chart',
            type: PlotChart.type.line,
            point : true,
            lineWidth : 3,
            color: '#8AC44B',
            cursor : true
        });
    },
    bottomChart : function(){
        var self = this;
        this.bottomBarChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat  : '%x [value:%y]',
            toolTipTimeFormat : '%m-%d',
            showTooltip    : true,
            showMaxValue   : true,
            showDayLine    : false,
            highLighHold   : true,
            chartProperty: { timeformat : '%m-%d' },
            interval       : PlotChart.time.exDay,
            plotclick: function(event, pos, item){
                self.plotClickEvent(item, 'bar', 'bottom');
            }
        });

        this.bottomLineChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat  : '%x [value:%y]',
            toolTipTimeFormat : '%m-%d',
            showTooltip    : true,
            showMaxValue   : true,
            showDayLine    : false,
            highLighHold   : true,
            chartProperty: { timeformat : '%m-%d', xLabelWidth: 40 },
            interval       : PlotChart.time.exDay,
            plotclick: function(event, pos, item){
                self.plotClickEvent(item, 'line', 'bottom');
            }
        });

        this.bottomBarChart.addSeries({
            id: 'bottom_bar_chart',
            type: PlotChart.type.exBar,
            color: '#2B99F0',
            cursor : true
        });

        this.bottomLineChart.addSeries({
            id: 'bottom_line_chart',
            type: PlotChart.type.line,
            point : true,
            lineWidth : 3,
            color: '#2B99F0',
            cursor : true
        });
    },
    underChart : function(){
        this.underBarChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat  : '%x [value:%y]',
            toolTipTimeFormat : '%d %H:%M',
            showTooltip    : true,
            showMaxValue   : true,
            highLighHold   : true,
            chartProperty: { timeformat : '%H' },
            interval       : PlotChart.time.exHour
        });

        this.underLineChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat  : '%x [value:%y]',
            toolTipTimeFormat : '%d %H:%M',
            showTooltip    : true,
            showMaxValue   : true,
            highLighHold   : true,
            chartProperty: { timeformat : '%H' },
            interval       : PlotChart.time.exHour
        });

        this.underBarChart.addSeries({
            id: 'under_bar_chart',
            type: PlotChart.type.exBar,
            color: '#8AC44B'
        });

        this.underLineChart.addSeries({
            id: 'under_line_chart',
            type: PlotChart.type.line,
            point : true,
            lineWidth : 3,
            color: '#8AC44B'
        });
    },

    plotClickEvent: function(item, chartType, position){
        if (this.transaction.isLoading && item){
            return;
        }

        this.loadingMask.showMask();

        this.plotFlagSetting(chartType, position);

        switch (position){
            case 'top':
                this.midFromTime = null;
                this.midToTime = null;

                this.topBarChart.highLight(0, item.dataIndex);

                //예외 처리(데이터 확인후 타입값 정하기)
                if(item.dataIndex === 0){
                    this.midFromTime = Ext.util.Format.date(this.datePicker.getFromDateTime() , 'Y-m-d 00:00:00');
                    this.midToTime = Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d 23:59:59');
                }else{
                    this.midFromTime = common.Util.getDate(item.datapoint[0]);
                    this.midToTime = common.Util.getDate(item.datapoint[0] + 86399000);
                }

                this.chartExecuteSQL(this.sql.mid.txnCount, 'mid');
                break;
            case 'mid':
                this.gridFromTime = null;
                this.gridToTime = null;

                if(chartType === 'bar'){
                    this.midBarChart.highLight(0, item.dataIndex);
                } else if (chartType === 'line'){
                    this.midLineChart.highLight(0, item.dataIndex);
                }

                this.chartIndex.mid = item.dataIndex;

                this.gridFromTime = common.Util.getDate(item.datapoint[0]);
                this.gridToTime = common.Util.getDate(item.datapoint[0] + 60 * 60 * 1000);

                this.transaction.loadingMask.showMask();

                this.gridExecuteSQL(this.sql.grid.txnGrid, this.gridFromTime, this.gridToTime);
                this.summaryGridTabPnl.setActiveTab(0);
                break;
            case 'bottom':
                this.underFromTime = null;
                this.underToTime = null;

                if(chartType === 'bar'){
                    this.bottomBarChart.highLight(0, item.dataIndex);
                } else if (chartType === 'line'){
                    this.bottomLineChart.highLight(0, item.dataIndex);
                }
                this.chartIndex.bottom = item.dataIndex;

                //예외 처리(데이터 확인후 타입값 정하기)
                if(item.dataIndex === 0){
                    this.underFromTime = Ext.util.Format.date(this.datePicker.getFromDateTime() , 'Y-m-d 00:00:00');
                    this.underToTime = Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d 23:59:59');
                }else{
                    this.underFromTime = common.Util.getDate(item.datapoint[0]);
                    this.underToTime = common.Util.getDate(item.datapoint[0] + 86399000);
                }

                this.underDataSetting();
                break;
            default:
                break;
        }
    },

    plotFlagSetting: function(chartType, position){
        if( chartType === 'bar' && position === 'mid' || position === 'top'){
            this.midBarCheck = true;
        }
        if ( chartType === 'line' && position === 'mid' ){
            this.midBarCheck = false;
        }
        if( chartType === 'bar' && position === 'bottom' ){
            this.bottomBarCheck = true;
        }
        if ( chartType === 'line' && position === 'bottom' ){
            this.bottomBarCheck = false;
        }
        this.plotClickCheck = true;
    },

    underDataSetting: function(){
        switch(this.bottomSelect){
            case this.sql.bottom.elapseCount :
                this.chartExecuteSQL(this.sql.under.elapseCount, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily Execute Count') + ')');
                break;
            case this.sql.bottom.failCount :
                this.chartExecuteSQL(this.sql.under.failCount, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily Failure Count') + ')');
                break;
            case this.sql.bottom.elapseSum :
                this.chartExecuteSQL(this.sql.under.elapseSum, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR ('Daily Elapse Time (sum)') + ')');
                break;
            case this.sql.bottom.elapseAvg :
                this.chartExecuteSQL(this.sql.under.elapseAvg, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily Elapse Time (avg)') + ')');
                break;
            case this.sql.bottom.elapseMax :
                this.chartExecuteSQL(this.sql.under.elapseMax, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily Elapse Time (max)') + ')');
                break;
            case this.sql.bottom.elapseMin :
                this.chartExecuteSQL(this.sql.under.elapseMin, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily Elapse Time (min)') + ')');
                break;
            case this.sql.bottom.cpuSum :
                this.chartExecuteSQL(this.sql.under.cpuSum, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily CPU Time (sum)') + ')');
                break;
            default :
                break;
        }
    },

    gridTabPanel : function(){
        var self = this;
        //************* TabPanel ***********************************
        this.summaryGridTabPnl = Ext.create('Exem.TabPanel', {
            width       : '100%',
            height      : 250,
            layout      : 'vbox',
            split       : true ,
            itemId      : 'summaryGridTabPnl',
            listeners   : {
                tabchange: function(tabPanel, newCard){
                    if(newCard.itemId === 'transactionTab' && self.didRetrive){
                        self.transaction.loadingMask.showMask();

                        self.bottomPanel.show();
                        self.underPanel.show();

                        self.transactionSubGrid.setVisible(true);
                        self.SQLSubGrid.setVisible(false);
                        self.exceptionSubGrid.setVisible(false);

                        self.offsetCount.txn = 0;

                        self.gridExecuteSQL( self.sql.grid.txnGrid, self.gridFromTime, self.gridToTime );
                    }
                    if(newCard.itemId === 'SQLTab' && self.didRetrive){
                        self.SQL.loadingMask.showMask();

                        self.bottomPanel.hide();
                        self.underPanel.hide();

                        self.transactionSubGrid.setVisible(false);
                        self.SQLSubGrid.setVisible(true);
                        self.exceptionSubGrid.setVisible(false);

                        self.offsetCount.sql = 0;

                        self.gridExecuteSQL( self.sql.grid.SQLGrid, self.gridFromTime, self.gridToTime );
                    }
                    if(newCard.itemId === 'exceptionTab' && self.didRetrive){
                        self.exception.loadingMask.showMask();

                        self.bottomPanel.hide();
                        self.underPanel.hide();

                        self.transactionSubGrid.setVisible(false);
                        self.SQLSubGrid.setVisible(false);
                        self.exceptionSubGrid.setVisible(true);

                        self.gridExecuteSQL( self.sql.grid.exceptionGrid, self.gridFromTime, self.gridToTime );
                    }
                }
            }
        }) ;
    },

    transactionGrid : function(){
        var self = this;
        //************ grid(transaction) ************************************************************
        this.transaction = Ext.create('Exem.BaseGrid', {
            gridName        : 'txn_grid_name',
            usePager        : false,
            useEmptyText    : true,
            emptyTextMsg    : common.Util.TR('No data to display'),
            itemclick       : function(dv, record) {
                if(record) {
                    self.loadingMask.showMask();
                    self.transactionSubGrid.loadingMask.showMask();
                    self.gridClickCheck      = true;
                    self.bottomBarCheck = true;
                    self.txnName = record.data['ts'];
                    self.rowsData = record.data;
                    self.offsetCount.txn = 0;
                    self.txnNameTitle.setHtml(common.Util.TR('Txn Name') +' : ' + common.Util.TR(self.txnName));
                    self.subGridExecuteSQL(self.sql.subGrid.txnGrid, self.gridFromTime, self.gridToTime);
                    self.chartExecuteSQL(self.sql.bottom.elapseCount, 'bottom');
                }
            }
        });

        this.transaction.beginAddColumns();
        //**********************************************************
        this.transaction.addColumn( common.Util.CTR('txn_id'),                  'txn_id',       200, Grid.String,  false, true);
        //***********************************************************
        this.transaction.addColumn( common.Util.CTR('Transaction'),             'ts',           200, Grid.String,  true, false);
        this.transaction.addColumn( common.Util.CTR('Execute Count'),           'txn',          160, Grid.Number,  true, false);
        this.transaction.addColumn( common.Util.CTR('Success Count'),           'success',      140, Grid.Number,  true, false);
        this.transaction.addColumn( common.Util.CTR('Failure Count'),           'fail',         100, Grid.Number,  true, false);
        this.transaction.addColumn( common.Util.CTR('Elapse Time (sum)'),       'sum',          200, Grid.Float,   true, false);
        this.transaction.addColumn( common.Util.CTR('Elapse Time (AVG)'),       'txn_avg',      200, Grid.Float,   true, false);
        this.transaction.addColumn( common.Util.CTR('Min Elapse Time'),         'txn_min',      200, Grid.Float,   true, false);
        this.transaction.addColumn( common.Util.CTR('Max Elapse Time'),         'txn_max',      200, Grid.Float,   true, false);
        this.transaction.addColumn( common.Util.CTR('CPU Time (avg)'),          'cpu_time_avg', 200, Grid.Number,  true, false);
        this.transaction.addColumn( common.Util.CTR('CPU Time (sum)'),          'cpu_time_sum', 200, Grid.Number,  true, false);
        this.transaction.addColumn( common.Util.CTR('SQL Execute Hold Ratio'),  'sql_ratio',    200, Grid.Float,   true, false);
        this.transaction.addColumn( common.Util.CTR('SQL Elapse Time'),         'sql_time',     200, Grid.Float,   true, false);
        this.transaction.addColumn( common.Util.CTR('SQL Elapse Time (AVG)'),   'sql_time_avg', 200, Grid.Float,   true, false);
        this.transaction.addColumn( common.Util.CTR('SQL Elapse Time (MAX)'),   'sql_time_max', 200, Grid.Float,   true, false);

        this.transaction.endAddColumns();

        this.transaction.loadLayout(this.transaction.gridName);
        this.transactionTab.add(this.transaction);
    },
    SQLGrid : function(){
        var self = this;
        //*************************** grid Tap2(SQL)**********************
        this.SQL = Ext.create('Exem.BaseGrid', {
            gridName : 'sql_grid_name',
            usePager : true,
            useEmptyText        : true,
            emptyTextMsg        : common.Util.TR('No data to display'),
            itemclick: function(dv, record) {
                self.SQLSubGrid.loadingMask.showMask();
                self.rowsData = record.data;
                self.subGridExecuteSQL(self.sql.subGrid.SQLGrid, self.gridFromTime, self.gridToTime);
            }
        });

        this.SQL.beginAddColumns();
        //********************************************************
        this.SQL.addColumn( common.Util.CTR('txn_id'),              'txn_id',           200, Grid.String,  false, true);
        //*********************************************************
        this.SQL.addColumn( common.Util.CTR('SQL'),                 'sql',              200, Grid.String,  true, false);
        this.SQL.addColumn( common.Util.CTR('Execution Count'),     'execute_count',    160, Grid.Number,  true, false);
        this.SQL.addColumn( common.Util.CTR('Elapse Time (sum)'),   'elapsed_time_sum', 200, Grid.Float,   true, false);
        this.SQL.addColumn( common.Util.CTR('Elapse Time (AVG)'),   'elapsed_time_avg', 200, Grid.Float,   true, false);
        this.SQL.addColumn( common.Util.CTR('Elapse Time (MIN)'),   'elapsed_time_min', 200, Grid.Float,   true, false);
        this.SQL.addColumn( common.Util.CTR('Elapse Time (MAX)'),   'elapsed_time_max', 200, Grid.Float,   true, false);

        this.SQL.endAddColumns();

        this.SQL.loadLayout(this.SQL.gridName);
        this.SQLTab.add(this.SQL);

        /**
         * paging 처리를 위한 버튼
         * @type {Ext.button.Button}
         */
        this.sqlBtnFetch = Ext.create('Ext.button.Button',{
            cls : 'x-btn-default-small',
            style : {
                backgroundColor: '#efefef',
                borderColor: '#bbb'
            },
            text     : common.Util.TR('Next 100 Rows'),
            itemId   : 'sql_100_rows',
            listeners: {
                scope: this,
                click: function(me){
                    this.btnFetchClick(me) ;
                }
            }
        }) ;

        this.SQL.pnlExGridPager.add({ xtype: 'tbspacer', width : 20 }, this.sqlBtnFetch);
    },
    exceptionGrid : function(){
        var self = this;
        //*******************************grid Tap3(exception)************************
        this.exception = Ext.create('Exem.BaseGrid', {
            gridName : 'exception_grid_name',
            usePager : false,
            useEmptyText        : true,
            emptyTextMsg        : common.Util.TR('No data to display'),
            itemclick: function(dv, record) {
                self.exceptionSubGrid.loadingMask.showMask();
                self.rowsData = record.data;
                self.subGridExecuteSQL(self.sql.subGrid.exceptionGrid, self.gridFromTime, self.gridToTime);
            }
        });

        this.exception.beginAddColumns();

        this.exception.addColumn( common.Util.CTR('Count'),     'exception_count',  200, Grid.Number,   true, false);
        this.exception.addColumn( common.Util.CTR('Ratio'),     'exception_ratio',  160, Grid.Number,   true, false);
        this.exception.addColumn( common.Util.CTR('Exception'), 'exception_type',   300, Grid.String,   true, false);

        this.exception.endAddColumns();

        this.exception.loadLayout(this.exception.gridName);
        this.exceptionTab.add(this.exception);

        this.exception.addRenderer('exception_ratio', function(value){
            return '<div style="position:relative; width:100%; height:13px">' +
                '<div data-qtip="' + value + '%'+'" style="float:left; background-color:#5898E9;height:100%;width:'+ value +'%;"></div>' +
                '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(2) + '%</div>' +
                '</div>';
        }, RendererType.bar) ;
    },

    subGridSum : function(){
        //************************sub grid(transaction)************************
        this.transactionSubGrid = Ext.create('Exem.BaseGrid', {
            gridName : 'txn_sub_grid_name',
            usePager : true,
            useEmptyText        : true,
            emptyTextMsg        : common.Util.TR('No data to display')
        });

        this.transactionSubGrid.beginAddColumns();

        this.transactionSubGrid.addColumn( common.Util.CTR('Transaction Execute Hold Ratio'), 'txn_ratio',  200, Grid.String, true, false ) ;
        this.transactionSubGrid.addColumn( common.Util.CTR('Execution Count'),                'elapse',     160, Grid.Number, true, false ) ;
        this.transactionSubGrid.addColumn( common.Util.CTR('Elapse Time (sum)'),              'elapse_sum', 140, Grid.Float,  true, false ) ;
        this.transactionSubGrid.addColumn( common.Util.CTR('Elapse Time (AVG)'),              'elapse_avg', 100, Grid.Float,  true, false ) ;
        this.transactionSubGrid.addColumn( common.Util.CTR('Elapse Time (MIN)'),              'elapse_min', 200, Grid.Float,  true, false ) ;
        this.transactionSubGrid.addColumn( common.Util.CTR('Elapse Time (MAX)'),              'elapse_max', 200, Grid.Float,  true, false ) ;
        this.transactionSubGrid.addColumn( common.Util.CTR('SQL'),                            'sql',        450, Grid.String, true, false ) ;

        this.transactionSubGrid.endAddColumns();

        this.transactionSubGrid.loadLayout(this.transactionSubGrid.gridName);
        this.subGridContainer.add(this.transactionSubGrid);

        this.transactionSubGrid.addRenderer('txn_ratio', function(value){
            return '<div style="position:relative; width:100%; height:13px">' +
                '<div data-qtip="' + value + '%'+'" style="float:left; background-color:#5898E9;height:100%;width:'+ value +'%;"></div>' +
                '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(2) + '%</div>' +
                '</div>';
        }, RendererType.bar) ;

        /**
         * paging 처리를 위한 버튼
         * @type {Ext.button.Button}
         */
        this.txnBtnFetch = Ext.create('Ext.button.Button',{
            cls : 'x-btn-default-small',
            style : {
                backgroundColor: '#efefef',
                borderColor: '#bbb'
            },
            text     : common.Util.TR('Next 100 Rows'),
            itemId   : 'txn_100_rows',
            listeners: {
                scope: this,
                click: function(me){
                    this.btnFetchClick(me) ;
                }
            }
        }) ;

        this.transactionSubGrid.pnlExGridPager.add({ xtype: 'tbspacer', width : 20 }, this.txnBtnFetch);

        //**********************sub grid2(SQL)**************************
        this.SQLSubGrid = Ext.create('Exem.BaseGrid', {
            gridName : 'sql_sub_grid_name',
            usePager : false,
            useEmptyText        : true,
            emptyTextMsg        : common.Util.TR('No data to display')
        });

        this.SQLSubGrid.beginAddColumns();

        this.SQLSubGrid.addColumn( common.Util.CTR('Transaction Execute Hold Ratio'),   'txn_ratio',   200, Grid.String, true, false);
        this.SQLSubGrid.addColumn( common.Util.CTR('Execution Count'),                  'elapse',      160, Grid.Number, true, false);
        this.SQLSubGrid.addColumn( common.Util.CTR('Elapse Time (sum)'),                'elapse_sum',  140, Grid.Float,  true, false);
        this.SQLSubGrid.addColumn( common.Util.CTR('Elapse Time (AVG)'),                'elapse_avg',  100, Grid.Float,  true, false);
        this.SQLSubGrid.addColumn( common.Util.CTR('Elapse Time (MIN)'),                'elapse_min',  200, Grid.Float,  true, false);
        this.SQLSubGrid.addColumn( common.Util.CTR('Elapse Time (MAX)'),                'elapse_max',  200, Grid.Float,  true, false);
        this.SQLSubGrid.addColumn( common.Util.CTR('Transaction'),                      'transaction', 300, Grid.String, true, false);

        this.SQLSubGrid.endAddColumns();

        this.subGridContainer.add(this.SQLSubGrid);

        this.SQLSubGrid.loadLayout(this.SQLSubGrid.gridName);
        this.SQLSubGrid.addRenderer('txn_ratio', function(value){
            return '<div style="position:relative; width:100%; height:13px">' +
                '<div data-qtip="' + value + '%'+'" style="float:left; background-color:#5898E9;height:100%;width:'+ value +'%;"></div>' +
                '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(2) + '%</div>' +
                '</div>';
        }, RendererType.bar) ;


        //*********************sub grid3(exception)*********************
        this.exceptionSubGrid = Ext.create('Exem.BaseGrid', {
            gridName : 'exception_sud_grid_name',
            usePager : false,
            useEmptyText        : true,
            emptyTextMsg        : common.Util.TR('No data to display')
        });

        this.exceptionSubGrid.beginAddColumns();

        this.exceptionSubGrid.addColumn( common.Util.CTR('Count'),       'exception_count', 200, Grid.Number,  true, false);
        this.exceptionSubGrid.addColumn( common.Util.CTR('Ratio'),       'exception_ratio', 160, Grid.Number,  true, false);
        this.exceptionSubGrid.addColumn( common.Util.CTR('Transaction'), 'transaction',     300, Grid.String,  true, false);

        this.exceptionSubGrid.endAddColumns();

        this.subGridContainer.add(this.exceptionSubGrid);

        this.exceptionSubGrid.loadLayout(this.exceptionSubGrid.gridName);
        this.exceptionSubGrid.addRenderer('exception_ratio', function(value){
            return '<div style="position:relative; width:100%; height:13px">' +
                '<div data-qtip="' + value + '%'+'" style="float:left; background-color:#5898E9;height:100%;width:'+ value +'%;"></div>' +
                '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(2) + '%</div>' +
                '</div>';
        }, RendererType.bar) ;
    },

    executeSQL: function() {
        //조회 버튼 flag
        if(!this.didRetrive){
            this.bottomSelect = this.sql.bottom.elapseCount;
            this.didRetrive = true;
        }

        //index값 초기화
        this.chartIndex.mid = null;
        this.chartIndex.bottom = null;

        //offset 값 초기화
        this.offsetCount.txn = 0;
        this.offsetCount.sql = 0;

        //그리드 선택 값 초기화
        this.gridClickCheck = null;
        this.rowsData = null;

        //Grid & Chart 초기화.
        this.transaction.clearRows() ;
        this.SQL.clearRows() ;
        this.exception.clearRows();

        this.transactionSubGrid.clearRows() ;
        this.SQLSubGrid.clearRows() ;
        this.exceptionSubGrid.clearRows();

        this.topBarChart.clearValues();
        this.topBarChart.plotDraw();

        this.midBarChart.clearValues();
        this.midBarChart.plotDraw();
        this.midLineChart.clearValues();
        this.midLineChart.plotDraw();

        this.bottomBarChart.clearValues();
        this.bottomBarChart.plotDraw();
        this.bottomLineChart.clearValues();
        this.bottomLineChart.plotDraw();

        this.underBarChart.clearValues();
        this.underBarChart.plotDraw();
        this.underLineChart.clearValues();
        this.underLineChart.plotDraw();

        // clear가 먼저 진행 되고 난다음에야 tabchange 이벤트가 일어나야 정상동작함.(radio 버튼 위치 초기화)
        // topChart
        this.dateRadioField.items.items[0].setValue(true);
        // midChart
        this.perHourRadioField.items.items[0].setValue(true);
        // bottomChart
        this.txnDateRadioField.items.items[0].setValue(true);

        //time data 초기화(radio 버튼이 동작할때 time 값을 먼저 초기화 시키면 sql error가 남 time값이 없기때문에)
        this.midFromTime = null;
        this.midToTime = null;
        this.underFromTime = null;
        this.underToTime = null;
        this.gridFromTime = null;
        this.gridToTime = null;

        this.txnName = '';
        this.txnNameTitle.setHtml(common.Util.TR('Txn Name') +' : ' + common.Util.TR(this.txnName));

        this.retrieveFlag = true;

        this.chartExecuteSQL(this.sql.top.txnCount,'top');
    },

    chartExecuteSQL: function(sql, position){
        var dataSet = {};
        var fromTime, toTime, txnId;

        dataSet.sql_file = sql;

        if(position === 'top' || position === 'bottom'){
            fromTime = Ext.util.Format.date(this.datePicker.getFromDateTime() , 'Y-m-d 00:00:00');
            toTime   = Ext.util.Format.date(this.datePicker.getToDateTime() , 'Y-m-d 23:59:59');
        } else if(position === 'mid'){
            fromTime = this.midFromTime;
            toTime   = this.midToTime;
        } else if(position === 'under'){
            fromTime = this.underFromTime;
            toTime   = this.underToTime;
        }

        dataSet.bind = [{
            name: 'from_time',
            value: fromTime,
            type: SQLBindType.STRING
        },{
            name: 'to_time',
            value: toTime,
            type: SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'was_id',
            value: this.wasCombo.getValue()
        }];

        switch (position){
            case 'top':
            case 'mid':
                WS.SQLExec(dataSet, this.chartDraw, this);
                break;
            case 'bottom':
            case 'under':
                if(this.rowsData != null) {
                    txnId = this.rowsData['txn_id'];
                    dataSet.bind.push({ name: 'txn_id', value: txnId, type: SQLBindType.STRING });

                    WS.SQLExec(dataSet, this.chartDraw, this);
                } else{
                    this.loadingMask.hide();
                }
                break;
            default:
                break;
        }
    },

    chartDraw: function(header, data){
        var param = header.parameters,
            sql = header.command,
            chartIndex = 0, dataIndex = 1,
            chartParam = {}, seriesValue = {}, item = {};

        this.loadingMask.showMask();

        if (header.success) {
            chartParam.from = param.bind[0].value;
            chartParam.to = param.bind[1].value;
            chartParam.time = 0;
            chartParam.data = data.rows;

            seriesValue[0] = dataIndex;

            chartParam.series = seriesValue;

            switch (sql){
                //top
                case this.sql.top.txnCount:
                case this.sql.top.visitors:
                case this.sql.top.exceptionSum:

                    this.topBarChart.clearValues();

                    this.topBarChart.addValues(chartParam);
                    this.topBarChart.plotDraw();

                    if(this.retrieveFlag){
                        item.dataIndex = this.topBarChart.maxOffSet.index;
                        item.datapoint = [this.topBarChart.maxOffSet.x];

                        this.topBarChart.plotclick(null, null, item);

                        this.retrieveFlag = false;
                    }
                    break;
                //mid
                case this.sql.mid.txnCount:
                case this.sql.mid.visitors:
                case this.sql.mid.concurrentUsers:
                case this.sql.mid.elapseAvg:
                case this.sql.mid.exceptionSum:

                    this.midBarChart.clearValues();
                    this.midLineChart.clearValues();

                    if(this.chartIndex.mid != null){
                        chartIndex = this.chartIndex.mid;
                    }

                    if(this.midBarCheck){
                        this.midBarChart.addValues(chartParam);
                        this.midBarChart.plotDraw();
                        this.midBarChart.highLight( 0, chartIndex ) ;
                    }else{
                        this.midLineChart.addValues(chartParam);
                        this.midLineChart.plotDraw();
                        this.midLineChart.highLight( 0, chartIndex ) ;
                    }

                    if(this.plotClickCheck){
                        item.dataIndex = this.midBarChart.maxOffSet.index;
                        item.datapoint = [this.midBarChart.maxOffSet.x];

                        this.midBarChart.plotclick(null, null, item);
                        this.perHourRadioField.items.items[0].setValue(true);
                    }
                    break;
                //bottom
                case this.sql.bottom.elapseCount:
                case this.sql.bottom.failCount:
                case this.sql.bottom.elapseSum:
                case this.sql.bottom.elapseAvg:
                case this.sql.bottom.elapseMax:
                case this.sql.bottom.elapseMin:
                case this.sql.bottom.cpuSum:

                    this.bottomBarChart.clearValues();
                    this.bottomLineChart.clearValues();
                    chartParam.txn_id = param.bind[2].value;

                    if(this.chartIndex.bottom != null){
                        chartIndex = this.chartIndex.bottom;
                    }

                    item.dataIndex = chartIndex;

                    if(this.bottomBarCheck) {
                        this.bottomBarChart.addValues(chartParam);
                        this.bottomBarChart.plotDraw();
                        this.bottomBarChart.highLight(0, chartIndex);

                        item.datapoint = this.bottomBarChart.getSeries(0).data[chartIndex];
                        this.bottomBarChart.plotclick(null, null, item);
                    } else{
                        this.bottomLineChart.addValues(chartParam);
                        this.bottomLineChart.plotDraw();
                        this.bottomLineChart.highLight(0, chartIndex);

                        item.datapoint = this.bottomLineChart.getSeries(0).data[chartIndex];
                        this.bottomLineChart.plotclick(null, null, item);
                    }

                    if(this.gridClickCheck){
                        item.dataIndex = this.bottomBarChart.maxOffSet.index;
                        item.datapoint = [this.bottomBarChart.maxOffSet.x];

                        this.bottomBarChart.plotclick(null, null, item);
                        this.txnDateRadioField.items.items[0].setValue(true);
                    }
                    break;
                //under
                case this.sql.under.elapseCount:
                case this.sql.under.failCount:
                case this.sql.under.elapseSum:
                case this.sql.under.elapseAvg:
                case this.sql.under.elapseMax:
                case this.sql.under.elapseMin:
                case this.sql.under.cpuSum:

                    this.underBarChart.clearValues();
                    this.underLineChart.clearValues();
                    chartParam.txn_id = param.bind[2].value;

                    if(header.command === this.sql.under.elapseCount || header.command === this.sql.under.failCount){
                        this.underBarChart.setVisible(true);
                        this.underLineChart.setVisible(false);
                        this.underBarChart.addValues(chartParam);
                        this.underBarChart.plotDraw();
                        this.underBarChart.highLight(0, this.underBarChart.maxOffSet.index);
                    } else{
                        this.underBarChart.setVisible(false);
                        this.underLineChart.setVisible(true);
                        this.underLineChart.addValues(chartParam);
                        this.underLineChart.plotDraw();
                        this.underLineChart.highLight(0, this.underLineChart.maxOffSet.index);
                    }
                    break;
                default:
                    break;
            }
            this.loadingMask.hide();
        }
        this.loadingMask.hide();
    },

    gridExecuteSQL: function ( gridSQL, fromTime, toTime ) {
        var dataSet = {};

        dataSet.sql_file = gridSQL;

        dataSet.bind = [{
            name: 'from_time',
            value: fromTime,
            type: SQLBindType.STRING
        },{
            name: 'to_time',
            value: toTime,
            type: SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'was_id',
            value: this.wasCombo.getValue()
        }];

        if (gridSQL === this.sql.grid.SQLGrid){
            dataSet.replace_string.push({ name: 'offset_count', value: this.offsetCount.sql });
        }

        WS.SQLExec(dataSet, this.gridDraw, this);
    },

    subGridExecuteSQL: function ( gridSQL, fromTime, toTime ) {
        var dataSet = {};
        var txnId, exceptionType;

        dataSet.sql_file = gridSQL;

        dataSet.bind = [{
            name: 'from_time',
            value: fromTime,
            type: SQLBindType.STRING
        },{
            name: 'to_time',
            value: toTime,
            type: SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'was_id',
            value: this.wasCombo.getValue()
        }];

        switch (gridSQL){
            case this.sql.subGrid.txnGrid:
                txnId = this.rowsData['txn_id'];
                dataSet.bind.push({ name : 'txn_id', value: txnId, type: SQLBindType.STRING });
                dataSet.replace_string.push({ name: 'offset_count', value: this.offsetCount.txn });
                break;
            case this.sql.subGrid.SQLGrid:
                txnId = this.rowsData['txn_id'];
                dataSet.bind.push({ name : 'txn_id', value: txnId, type: SQLBindType.STRING });
                break;
            case this.sql.subGrid.exceptionGrid:
                exceptionType = this.rowsData['exception_type'];
                dataSet.bind.push({ name : 'exception_type', value: exceptionType, type: SQLBindType.STRING });
                break;
            default:
                break;
        }

        WS.SQLExec(dataSet, this.subGridDraw, this);
    },

    //*************grid 그리기*****************
    gridDraw: function(header,data){
        var ix, dataRows,
            txnGrid         = this.transaction.pnlExGrid,
            SQLGrid         = this.SQL.pnlExGrid,
            exceptionGrid   = this.exception.pnlExGrid,
            len             = data.rows.length;

        if (header.success) {

            if(this.offsetCount.txn === 0){
                this.transaction.clearRows() ;
            }
            if(this.offsetCount.sql === 0){
                this.SQL.clearRows();
            }
            this.exception.clearRows();

            this.transaction.showEmptyText();
            this.SQL.showEmptyText();
            this.exception.showEmptyText();

            if(len === 0) {
                this.bottomBarChart.clearValues();
                this.bottomBarChart.plotDraw();
                this.bottomLineChart.clearValues();
                this.bottomLineChart.plotDraw();

                this.underBarChart.clearValues();
                this.underBarChart.plotDraw();
                this.underLineChart.clearValues();
                this.underLineChart.plotDraw();

                this.loadingMask.hide();
            }

            switch (header.command){
                case this.sql.grid.txnGrid:
                    for (ix = 0; ix < len; ix++) {
                        dataRows = data.rows[ix];
                        if(dataRows[13] === null){
                            dataRows[13] = 0;
                        }
                        this.transaction.addRow(dataRows);
                    }

                    this.transaction.drawGrid();
                    //정렬
                    this.transaction.setOrderAct('txn_avg','DESC');
                    //grid 클릭 이벤트
                    if(len !== 0){
                        txnGrid.getView().getSelectionModel().select(0);
                        txnGrid.fireEvent('itemclick', txnGrid, txnGrid.getSelectionModel().getLastSelected());
                    }
                    this.transaction.loadingMask.hide();
                    break;
                case this.sql.grid.SQLGrid:
                    for (ix = 0; ix < len; ix++) {
                        dataRows = data.rows[ix];
                        this.SQL.addRow(dataRows);
                    }

                    this.SQL.drawGrid();
                    this.SQL.setOrderAct('elapsed_time_avg','DESC');
                    if(len !== 0) {
                        SQLGrid.getView().getSelectionModel().select(0);
                        SQLGrid.fireEvent('itemclick', SQLGrid, SQLGrid.getSelectionModel().getLastSelected());
                    }
                    this.sqlBtnFetch.setDisabled(false);
                    this.SQL.loadingMask.hide();
                    break;
                case this.sql.grid.exceptionGrid:
                    var totalExceptionCount = 0, exceptionRatio;
                    for (ix = 0; ix < len; ix++) {
                        totalExceptionCount += +data.rows[ix][0];
                    }
                    for (ix = 0; ix < len; ix++) {
                        exceptionRatio = (data.rows[ix][0] * 100) / totalExceptionCount;
                        data.rows[ix][1] = exceptionRatio;
                        dataRows = data.rows[ix];
                        this.exception.addRow(dataRows);
                    }

                    this.exception.drawGrid();
                    if(data.rows.length !== 0) {
                        exceptionGrid.getView().getSelectionModel().select(0);
                        exceptionGrid.fireEvent('itemclick', exceptionGrid, exceptionGrid.getSelectionModel().getLastSelected());
                    }
                    this.exception.loadingMask.hide();
                    break;
                default:
                    break;
            }
        }
    },

    subGridDraw : function(header, data){
        if (header.success) {
            var ix, dataRows,
                txnRatio, sqlRatio, exceptionRatio,
                txnAvg, sqlAvg, exceptionCount,
                len = data.rows.length;

            switch (header.command){
                case this.sql.subGrid.txnGrid:
                    if(this.offsetCount.txn === 0){
                        this.transactionSubGrid.clearRows();
                        this.transactionSubGrid.showEmptyText();
                    }

                    for (ix = 0; ix < len; ix++) {
                        txnAvg = this.transaction.getSelectedRow()[0].data.txn_avg;

                        sqlRatio = (data.rows[ix][3] * 100) / txnAvg;
                        txnRatio = 100 - sqlRatio;
                        if(txnRatio < 0){
                            txnRatio = 0;
                        }
                        data.rows[ix][0] = txnRatio;
                        dataRows = data.rows[ix];
                        this.transactionSubGrid.addRow(dataRows);
                    }

                    this.transactionSubGrid.drawGrid();
                    this.transactionSubGrid.loadingMask.hide();
                    this.txnBtnFetch.setDisabled(false);
                    break;
                case this.sql.subGrid.SQLGrid:
                    this.SQLSubGrid.clearRows();
                    this.SQLSubGrid.showEmptyText();

                    for (ix = 0; ix < len; ix++) {
                        sqlAvg = this.SQL.getSelectedRow()[0].data.elapsed_time_avg;

                        sqlRatio = (sqlAvg * 100) / data.rows[ix][3];
                        txnRatio = 100 - sqlRatio;
                        if(txnRatio < 0){
                            txnRatio = 0;
                        }
                        data.rows[ix][0] = txnRatio;
                        dataRows = data.rows[ix];
                        this.SQLSubGrid.addRow(dataRows);
                    }

                    this.SQLSubGrid.drawGrid();
                    this.SQLSubGrid.loadingMask.hide();
                    break;
                case this.sql.subGrid.exceptionGrid:
                    this.exceptionSubGrid.clearRows();
                    this.exceptionSubGrid.showEmptyText();

                    for (ix = 0; ix < len; ix++) {
                        exceptionCount = this.exception.getSelectedRow()[0].data.exception_count;

                        exceptionRatio = (data.rows[ix][0] * 100) / exceptionCount;
                        data.rows[ix][1] = exceptionRatio;
                        dataRows = data.rows[ix];
                        this.exceptionSubGrid.addRow(dataRows);
                    }

                    this.exceptionSubGrid.drawGrid();
                    this.exceptionSubGrid.loadingMask.hide();
                    break;
                default:
                    break;
            }
        }
    },

    btnFetchClick: function(object) {
        if (!this.didRetrive){
            return;
        }

        if (object.itemId === 'sql_100_rows') {
            this.offsetCount.sql = this.offsetCount.sql + 100;
            this.SQL.loadingMask.showMask();
            this.sqlBtnFetch.setDisabled(true);
            this.gridExecuteSQL( this.sql.grid.SQLGrid, this.gridFromTime, this.gridToTime );
        } else if(object.itemId === 'txn_100_rows') {
            this.offsetCount.txn = this.offsetCount.txn + 100;
            this.transactionSubGrid.loadingMask.showMask();
            this.txnBtnFetch.setDisabled(true);
            this.subGridExecuteSQL(this.sql.subGrid.txnGrid, this.gridFromTime, this.gridToTime);
        }
    }

}) ;
