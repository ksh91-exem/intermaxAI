Ext.define("view.CDDailySummary", {
    extend: "Exem.FormOnCondition",
    width : '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.None,
    //DatePicker 에서 none 일 경우 defaultTimeGap 가 일단위로 처리가 됨. 즉, 21일
    defaultTimeGap : 21,
    isDiff : true,
    sql: {
        //xapm_was_stat_daily 테이블
        top : {
            txnCount   : 'daily_CD_txn_count.sql'
        },
        mid : {
            txnCount   : 'daily_CD_hour_txn_count.sql',
            elapseAvg  : 'daily_CD_hour_elapse_avg.sql'
        },
        //xapm_txn_summary 테이블
        grid : {
            txnGrid         : 'daily_CD_txn_grid.sql'
        },
        bottom : {
            elapseCount     : 'daily_txn_elapse_count.sql', // WAS 일일통계와 동일
            failCount       : 'daily_txn_fail_count.sql',   // WAS 일일통계와 동일
            elapseSum       : 'daily_CD_txn_elapse_sum.sql',
            elapseAvg       : 'daily_CD_txn_elapse_avg.sql',
            elapseMax       : 'daily_CD_txn_elapse_max.sql',
            elapseMin       : 'daily_CD_txn_elapse_min.sql'
        },
        under : {
            elapseCount     : 'daily_txn_hour_elapse_count.sql',  // WAS 일일통계와 동일
            failCount       : 'daily_txn_hour_fail_count.sql',    // WAS 일일통계와 동일
            elapseSum       : 'daily_CD_txn_hour_elapse_sum.sql',
            elapseAvg       : 'daily_CD_txn_hour_elapse_avg.sql',
            elapseMax       : 'daily_CD_txn_hour_elapse_max.sql',
            elapseMin       : 'daily_CD_txn_hour_elapse_min.sql'
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
        this.bottomSelect = null;
        this.retrieveFlag = false;
        this.microText = ' (' + decodeURI('%C2%B5') + 's)';
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
            layout  : 'vbox',
            height  : 250,
            split   : true,
            style   : {
                borderRadius    : '6px',
                background      : '#ffffff'
            }
        });

        this.bottomPanel = Ext.create('Exem.Container', {
            layout  : 'vbox',
            height  : 250,
            split   : true,
            style   : {
                borderRadius    : '6px',
                background      : '#ffffff'
            }
        });

        this.underPanel = Ext.create('Exem.Container', {
            layout  : 'vbox',
            height  : 250,
            split   : true ,
            style   : {
                borderRadius    : '6px',
                background      : '#ffffff'
            }
        });

        this.transactionTab = Ext.create('Exem.Container', {
            title   : common.Util.TR('Transaction'),
            itemId  : 'transactionTab'
        });

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

        //***************배치(workArea)*************
        //grid 배치
        this.summaryGridTabPnl.add(this.transactionTab);

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

        workBackground.add([ topPanel, midPanel, this.summaryGridTabPnl, this.bottomPanel, this.underPanel]) ;

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
            style       : {
                margin: '4px 0px 0px 10px'
            },
            items       : [{
                boxLabel    : common.Util.TR('Daily Request Count'),
                width       : 180,
                name        : this.id + '_dateData',
                checked     : true,
                listeners   : {
                    change  : function(){
                        self.radioChangeSetting(this,'top');
                    }
                }
            }]
        });
    },
    midChartRadio : function(){
        var self = this;
        //******************선택 일자의 시간당 선택 데이터*****************
        this.perHourRadioField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            itemId      : 'perHourRadioField',
            style       : {
                margin: '4px 0px 0px 10px'
            },
            items       : [{
                boxLabel    : common.Util.TR('Request Count Per Hour'),
                width       : 180,
                name        : this.id + '_perHourData',
                checked     : true,
                listeners   : {
                    change  : function(){
                        self.radioChangeSetting( this, 'mid');
                    }
                }
            }, {
                boxLabel    : common.Util.TR('Elapse Time (AVG)') + this.microText,
                width       : 180,
                name        : this.id + '_perHourData',
                listeners   : {
                    change  : function(){
                        self.radioChangeSetting( this, 'mid');
                    }
                }
            }]
        });
    },
    bottomChartRadio : function(){
        var self = this;
        //************** bottomChart의 트랜잭션명 들어갈 공간 추가 **************
        this.txnNameTitle = Ext.create('Exem.Container',{
            html    : common.Util.TR('Txn Name')  + ' : ',
            width   : '100%',
            height  : 15,
            style   : {
                margin: '4px 0px 0px 10px'
            }
        });
        //******************선택한 트랜잭션의 일별 선택 데이터****************
        this.txnDateRadioField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            itemId      : 'txnDateRadioField',
            style       : {
                margin: '4px 0px 0px 10px'
            },
            items       : [{
                boxLabel    : common.Util.TR('Daily Execute Count'),
                width       : 180,
                name        : this.id + '_txnDateData',
                checked     : true,
                listeners   : {
                    change  : function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel    : common.Util.TR('Daily Failure Count'),
                width       : 180,
                name        : this.id + '_txnDateData',
                listeners   : {
                    change  : function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel    : common.Util.TR('Daily Elapse Time (sum)') + this.microText,
                width       : 180,
                name        : this.id + '_txnDateData',
                listeners   : {
                    change  : function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel    : common.Util.TR('Daily Elapse Time (avg)') + this.microText,
                width       : 180,
                name        : this.id + '_txnDateData',
                listeners   : {
                    change  : function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel    : common.Util.TR('Daily Elapse Time (max)') + this.microText,
                width       : 180,
                name        : this.id + '_txnDateData',
                listeners   : {
                    change  : function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }, {
                boxLabel    : common.Util.TR('Daily Elapse Time (min)') + this.microText,
                width       : 180,
                name        : this.id + '_txnDateData',
                listeners   : {
                    change  : function () {
                        self.radioChangeSetting( this, 'bottom');
                    }
                }
            }]
        });
    },
    underChartRadio : function(){
        //****************선택한 트랜잭션의 선택 일자의 시간당 데이터************
        this.txnPerHourRadioField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            itemId      : 'txnPerHourRadioField',
            style       : {
                margin: '4px 0px 0px 10px'
            },
            items       : {
                boxLabel    : common.Util.TR('Per Hour Data'),
                width       : 300,
                name        : 'txnPerHourData',
                checked     : true
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

                //mid radio change
                case common.Util.TR('Request Count Per Hour'):
                    this.chartSetting('bar', position);
                    this.chartExecuteSQL(this.sql.mid.txnCount, 'mid');
                    break;
                case common.Util.TR('Elapse Time (AVG)') + this.microText:
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.mid.elapseAvg, 'mid');
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
                case common.Util.TR('Daily Elapse Time (sum)') + this.microText:
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseSum, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseSum;
                    break;
                case common.Util.TR('Daily Elapse Time (avg)') + this.microText:
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseAvg, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseAvg;
                    break;
                case common.Util.TR('Daily Elapse Time (max)') + this.microText:
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseMax, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseMax;
                    break;
                case common.Util.TR('Daily Elapse Time (min)') + this.microText:
                    this.chartSetting('line', position);
                    this.chartExecuteSQL(this.sql.bottom.elapseMin, 'bottom');
                    this.bottomSelect = this.sql.bottom.elapseMin;
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
            id      : 'top_bar_chart',
            type    : PlotChart.type.exBar,
            color   : '#2B99F0',
            cursor  : true
        });
    },
    midChart : function(){
        var self = this;
        this.midBarChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat       : '%x [value:%y]',
            toolTipTimeFormat   : '%d %H:%M',
            showTooltip         : true,
            showMaxValue        : true,
            highLighHold        : true,
            chartProperty       : { timeformat : '%H' },
            interval            : PlotChart.time.exHour,
            plotclick: function(event, pos, item){
                self.plotClickEvent(item, 'bar', 'mid');
            }
        });
        //*************line 차트를 위해서 새롭게 생성
        this.midLineChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat       : '%x [value:%y]',
            toolTipTimeFormat   : '%d %H:%M',
            showTooltip         : true,
            showMaxValue        : true,
            highLighHold        : true,
            chartProperty       : { timeformat : '%H' },
            interval            : PlotChart.time.exHour,
            plotclick           : function(event, pos, item){
                self.plotClickEvent(item, 'line', 'mid');
            }
        });

        this.midBarChart.addSeries({
            id      : 'mid_bar_chart',
            type    : PlotChart.type.exBar,
            color   : '#8AC44B',
            cursor  : true
        });

        this.midLineChart.addSeries({
            id          : 'mid_line_chart',
            type        : PlotChart.type.line,
            point       : true,
            lineWidth   : 3,
            color       : '#8AC44B',
            cursor      : true
        });
    },
    bottomChart : function(){
        var self = this;
        this.bottomBarChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat       : '%x [value:%y]',
            toolTipTimeFormat   : '%m-%d',
            showTooltip         : true,
            showMaxValue        : true,
            showDayLine         : false,
            highLighHold        : true,
            chartProperty       : { timeformat : '%m-%d' },
            interval            : PlotChart.time.exDay,
            plotclick           : function(event, pos, item){
                self.plotClickEvent(item, 'bar', 'bottom');
            }
        });

        this.bottomLineChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat       : '%x [value:%y]',
            toolTipTimeFormat   : '%m-%d',
            showTooltip         : true,
            showMaxValue        : true,
            showDayLine         : false,
            highLighHold        : true,
            chartProperty       : { timeformat : '%m-%d', xLabelWidth: 40 },
            interval            : PlotChart.time.exDay,
            plotclick           : function(event, pos, item){
                self.plotClickEvent(item, 'line', 'bottom');
            }
        });
        this.bottomBarChart.addSeries({
            id      : 'bottom_bar_chart',
            type    : PlotChart.type.exBar,
            color   : '#2B99F0',
            cursor  : true
        });
        this.bottomLineChart.addSeries({
            id          : 'bottom_line_chart',
            type        : PlotChart.type.line,
            point       : true,
            lineWidth   : 3,
            color       : '#2B99F0',
            cursor      : true
        });
    },
    underChart : function(){
        this.underBarChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat       : '%x [value:%y]',
            toolTipTimeFormat   : '%d %H:%M',
            showTooltip         : true,
            showMaxValue        : true,
            highLighHold        : true,
            chartProperty       : { timeformat : '%H' },
            interval            : PlotChart.time.exHour
        });

        this.underLineChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat       : '%x [value:%y]',
            toolTipTimeFormat   : '%d %H:%M',
            showTooltip         : true,
            showMaxValue        : true,
            highLighHold        : true,
            chartProperty       : { timeformat : '%H' },
            interval            : PlotChart.time.exHour
        });

        this.underBarChart.addSeries({
            id      : 'under_bar_chart',
            type    : PlotChart.type.exBar,
            color   : '#8AC44B'
        });

        this.underLineChart.addSeries({
            id          : 'under_line_chart',
            type        : PlotChart.type.line,
            point       : true,
            lineWidth   : 3,
            color       : '#8AC44B'
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
                var gridFromTime, gridToTime;

                if(chartType === 'bar'){
                    this.midBarChart.highLight(0, item.dataIndex);
                } else if (chartType === 'line'){
                    this.midLineChart.highLight(0, item.dataIndex);
                }

                this.chartIndex.mid = item.dataIndex;

                gridFromTime = common.Util.getDate(item.datapoint[0]);
                gridToTime = common.Util.getDate(item.datapoint[0] + 60 * 60 * 1000);

                this.transaction.loadingMask.showMask();

                this.gridExecuteSQL(this.sql.grid.txnGrid, gridFromTime, gridToTime);
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
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR ('Daily Elapse Time (sum)') + ')' + this.microText);
                break;
            case this.sql.bottom.elapseAvg :
                this.chartExecuteSQL(this.sql.under.elapseAvg, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily Elapse Time (avg)') + ')' + this.microText);
                break;
            case this.sql.bottom.elapseMax :
                this.chartExecuteSQL(this.sql.under.elapseMax, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily Elapse Time (max)') + ')' + this.microText);
                break;
            case this.sql.bottom.elapseMin :
                this.chartExecuteSQL(this.sql.under.elapseMin, 'under');
                this.txnPerHourRadioField.items.items[0].setBoxLabel(common.Util.TR('Per Hour Data') + ' (' + common.Util.TR('Daily Elapse Time (min)') + ')' + this.microText);
                break;
            default :
                break;
        }
    },

    gridTabPanel : function(){
        this.summaryGridTabPnl = Ext.create('Exem.TabPanel', {
            width   : '100%',
            height  : 250,
            layout  : 'vbox',
            split   : true ,
            itemId  : 'summaryGridTabPnl'
        }) ;
    },

    transactionGrid : function(){
        var self = this;
        this.transaction = Ext.create('Exem.BaseGrid', {
            gridName        : 'txn_grid_name',
            usePager        : false,
            useEmptyText    : true,
            emptyTextMsg    : common.Util.TR('No data to display'),
            itemclick       : function(dv, record) {
                if(record) {
                    self.loadingMask.showMask();
                    self.gridClickCheck     = true;
                    self.bottomBarCheck     = true;
                    self.txnName           = record.data['ts'];
                    self.rowsData           = record.data;
                    self.txnNameTitle.setHtml(common.Util.TR('Txn Name') +' : ' + common.Util.TR(self.txnName));
                    self.chartExecuteSQL(self.sql.bottom.elapseCount, 'bottom');
                }
            }
        });

        this.transaction.beginAddColumns();
        //**********************************************************
        this.transaction.addColumn( common.Util.CTR('txn_id'),                             'txn_id',   200, Grid.String, false, true);
        //***********************************************************
        this.transaction.addColumn( common.Util.CTR('Transaction'),                        'ts',       200, Grid.String, true, false);
        this.transaction.addColumn( common.Util.CTR('Execute Count'),                      'txn',      160, Grid.Number, true, false);
        this.transaction.addColumn( common.Util.CTR('Success Count'),                      'success',  140, Grid.Number, true, false);
        this.transaction.addColumn( common.Util.CTR('Failure Count'),                      'fail',     100, Grid.Number, true, false);
        this.transaction.addColumn( common.Util.CTR('Elapse Time (sum)') + this.microText, 'sum',      200, Grid.Number, true, false);
        this.transaction.addColumn( common.Util.CTR('Elapse Time (AVG)') + this.microText, 'txn_avg',  200, Grid.Float, true, false);
        this.transaction.addColumn( common.Util.CTR('Min Elapse Time') + this.microText,   'txn_min',  200, Grid.Number, true, false);
        this.transaction.addColumn( common.Util.CTR('Max Elapse Time') + this.microText,   'txn_max',  200, Grid.Number, true, false);
        this.transaction.endAddColumns();

        this.transaction.loadLayout(this.transaction.gridName);
        this.transactionTab.add(this.transaction);
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

        //그리드 선택 값 초기화
        this.gridClickCheck = null;
        this.rowsData = null;

        //초기화
        this.transaction.clearRows() ;

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

    gridExecuteSQL : function (gridSQL, fromTime, toTime) {
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

        WS.SQLExec(dataSet, this.gridDraw, this);
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
                case this.sql.top.txnCount:
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
                case this.sql.mid.txnCount:
                case this.sql.mid.elapseAvg:
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
                case this.sql.bottom.elapseCount:
                case this.sql.bottom.failCount:
                case this.sql.bottom.elapseSum:
                case this.sql.bottom.elapseAvg:
                case this.sql.bottom.elapseMax:
                case this.sql.bottom.elapseMin:
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
                case this.sql.under.elapseCount:
                case this.sql.under.failCount:
                case this.sql.under.elapseSum:
                case this.sql.under.elapseAvg:
                case this.sql.under.elapseMax:
                case this.sql.under.elapseMin:
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

    gridDraw: function(header,data){
        var ix;
        var dataRows;
        var len = data.rows.length;

        this.transaction.clearRows() ;
        this.transaction.showEmptyText();

        if (header.success) {
            for (ix = 0; ix < len; ix++) {
                dataRows = data.rows[ix];
                this.transaction.addRow(dataRows);
            }
            this.transaction.drawGrid();
            //정렬
            this.transaction.setOrderAct('txn_avg','DESC');
            //grid 클릭 이벤트
            if(len !== 0){
                var txnGrid = this.transaction.pnlExGrid;

                txnGrid.getView().getSelectionModel().select(0);
                txnGrid.fireEvent('itemclick', txnGrid, txnGrid.getSelectionModel().getLastSelected());
            } else{
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
        }
        this.transaction.loadingMask.hide();
    }
});