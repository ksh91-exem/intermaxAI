Ext.define("view.TxnHistory", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        summary   : 'IMXPA_TxnHistory_summary.sql',
        gridClick : 'IMXPA_TxnHistory_gridClick.sql',
        txnElapse : 'IMXPA_TxnHistory_txnElapse.sql',
        sqlElapse : 'IMXPA_TxnHistory_sqlElapse.sql',
        txnDrag   : 'IMXPA_TxnHistory_txnDrag.sql',
        sqlDrag   : 'IMXPA_TxnHistory_sqlDrag.sql'
    },
    listeners: {
        beforedestroy: function () {
            this.isClosed = true;
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

    _wasValidCheck: function() {
        var self = this;
        var wasValue = self.wasField.getValue();
        var wasCombo = self.wasField.WASDBCombobox;

        var setFocus = function(){
            wasCombo.focus();
        };

        if (wasValue == null) {
            wasCombo.selectByIndex(0) ;
        }

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
        if (self.txnNameTF.getValue().trim().length < 1) {
            self.txnNameTF.setValue('%');
        }

        return self._wasValidCheck();
    },

    init: function() {
        var self = this;

        self.setWorkAreaLayout('border');
        self.radioType = 2;
        self.retrieveFlag = false;
        self.init_flag = false ; /* Retrieve버튼시 초기화 -> ActiveTab에대한 플래그로 사용. */
        self.draw_txn = false ; /* 그리드클릭이벤과 차트더블클릭이벤이 경합되는경우를 위한 플래그. */
        self.draw_sql = false ; /* 그리드클릭이벤과 차트더블클릭이벤이 경합되는경우를 위한 플래그. */

        var setFromTime = Ext.util.Format.date(this.datePicker.getFromDateTime(), Comm.dateFormat.HM);
        var setToTime   = Ext.util.Format.date(this.datePicker.getToDateTime(), Comm.dateFormat.HM);

        setFromTime = setFromTime.substr(0, setFromTime.length - 1) + '0';
        setToTime   = setToTime.substr(0, setToTime.length - 1) + '0';

        this.datePicker.mainFromField.setValue(setFromTime);
        this.datePicker.mainToField.setValue(setToTime);


        // chart Base 프로퍼티 갖춰주면 그거로 바꿔준다.


        /**************************** Condition Area *****************************/
            // Check 버튼을 넣어줄 FieldContainer
        self.addtionalCondition = Ext.create('Exem.FieldContainer', {
            x           : 630,
            y           : 5,
            layout      : 'hbox',
            width       : 700,
            itemId      : 'additionalCondition',
            defaultType : 'checkboxfield',
//            defaults    : {width: 90},
            cls         : 'exem-check',
            margin      : '0 0 0 100',
            items       : [{
                xtype: 'checkboxfield',
                name : 'closed_state',
                itemId: 'closed',
                listeners:{
                    change: function(){
                        if( this.getValue() ){
                            self.addtionalCondition.getComponent('statement').setVisible(true) ;
                            self.addtionalCondition.getComponent('connection').setVisible(true) ;
                            self.addtionalCondition.getComponent('result').setVisible(true) ;
                        }else{
                            self.addtionalCondition.getComponent('statement').setVisible(false) ;
                            self.addtionalCondition.getComponent('connection').setVisible(false) ;
                            self.addtionalCondition.getComponent('result').setVisible(false) ;

                            self.addtionalCondition.getComponent('statement').setValue(false) ;
                            self.addtionalCondition.getComponent('connection').setValue(false) ;
                            self.addtionalCondition.getComponent('result').setValue(false) ;
                        }
                    },
                    afterrender: function(){
                        self.addtionalCondition.getComponent('statement').setVisible(false) ;
                        self.addtionalCondition.getComponent('connection').setVisible(false) ;
                        self.addtionalCondition.getComponent('result').setVisible(false) ;
                    }
                }
            },{
                xtype : 'label',
                text  : common.Util.TR('Not Closed'),
                margin: '6 5 0 5',
                style : {
                    'color': '#258DC8',
                    'font-family': "'Droid Sans','NanumGothic'"
                    // 'font-family': 'PT Sans'
                }
            },{
                boxLabel  : common.Util.TR('Statement'),
                name      : 'additional_Condition',
                inputValue: 0,
                margin    : '0 5 0 5',
                itemId    : 'statement',
                listeners:{
                    change: function(){
                        self.change_style( this.getValue(), this.itemId ) ;
                    }
                }
            }, {
                boxLabel  : common.Util.TR('Connection'),
                name      : 'additional_Condition',
                inputValue: 1,
                margin    : '0 5 0 5',
                itemId    : 'connection',
                listeners:{
                    change: function(){
                        self.change_style( this.getValue(), this.itemId ) ;
                    }
                }
            }, {
                boxLabel  : common.Util.TR('ResultSet'),
                name      : 'additional_Condition',
                inputValue: 2,
                margin    : '0 5 0 5',
                itemId    : 'result',
                listeners:{
                    change: function(){
                        self.change_style( this.getValue(), this.itemId ) ;
                    }
                }
            }]
        });

        var groupStore = Ext.create('Ext.data.Store', {
            fields: ['idx', 'name'],
            data  : [{
                "idx":"0", "name":common.Util.TR("10 Minute")
            },{
                "idx":"1", "name":common.Util.TR("1 Hour")
            },{
                "idx":"2", "name":common.Util.TR("1 Day")
            }]
        });

        self.groupCombo = Ext.create('Exem.ComboBox', {
//            fieldLabel: common.Util.TR('Group By'),
            fieldLabel  : common.Util.TR('Grouping'),
            labelAlign  : 'left',
            store       : groupStore,
            valueField  : 'idx',
            displayField: 'name',
            labelWidth  : 60,
            width       : 145 ,
            x           : -10,
            y           : 30,
            margin      : '0 0 0 40',
            cls         : 'view_txn_history'
        });


        self.txnNameTF = Ext.create('Ext.form.field.Text', {
            fieldLabel: '',
            itemId    : 'transactionTF',
            labelAlign: 'right',
            labelWidth: 105,
            allowBlank: false,
            value     : common.Util.TR('Transaction Name'),
            maxLength : 255,
            enforceMaxLength:true,
            width     : 300, //430,
            x         : 390,
            y         : 30 ,
            listeners: {
                focus: function () {
                    if ( this.getValue() == '%' || this.getValue() == common.Util.TR('Transaction Name') ){
                        this.setValue('%') ;
                    }

                },
                blur: function() {
                    if ( this.getValue() == '%' ){
                        this.setValue(common.Util.TR('Transaction Name')) ;
                    }

                }

            }
        });


        self.wasField = Ext.create('Exem.wasDBComboBox', {
            width           : 370,
            comboLabelWidth : 60,
            comboWidth      : 310,
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            itemId          : 'wasCombo',
            x               : 375,
            y               : 5
        });

        // 상단 Area 설정 --- TF 는 TextField의 약자
        self.conditionArea.add(self.wasField, self.addtionalCondition, self.txnNameTF, self.groupCombo);

        self.wasField.init();

        /**************************** Work Area **********************************/

        //Main 화면
        var summaryArea = Ext.create('Exem.Panel', {
            title  : common.Util.TR('Summary'),
            layout : 'fit',
            minHeight: 150,
            region : 'north',
            split  : true,
            height : '30%'
        });

        var chartArea = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'fit',
            style : 'overflow-y: auto; overflow-x: hidden;',
            region: 'center'
        });

        var chartTabPnl = Ext.create('Exem.TabPanel', {
            layout  : 'fit',
            itemId : 'chartTabPnl',
            minHeight : 480,
            listeners: {
                tabchange: function(tabpnl, nv){

                    if ( nv.title == common.Util.TR('Transaction Trend') ){
                        self.txnElapseChart.plotDraw();
                        self.sqlElapseChart.plotDraw();
                    }else{
                        self.txnElapseTimeChart.plotRedraw();
                        self.txnExecuteChart.plotRedraw();
                        self.sqlElapseTimeChart.plotRedraw();
                    }
                }
            }
        });
        self.chartTabPnl = chartTabPnl;

        // Trend Chart - border로 3등분 (north, center, south)
        var trendChartTab = Ext.create('Exem.Container', {
            title  : common.Util.TR('Trend Chart'),
            layout : 'border'
        });

        // Transaction Trend - border 로 55대 45로 나눔. west 55  center.
        var txnTrendTab = Ext.create('Exem.Container', {
            title  : common.Util.TR('Transaction Trend'),
            itemId : 'txnTrendTab',
            layout : 'border'
        });

        this.initSummaryGrid();
        summaryArea.add(self.summaryGrid);

        this.initTxnElapseChart();

        var txnTrendTitleHeight = 30;
        var txnTrendtitleFontSize = '16px';

        //======================= Transaction Trend =========================

        var txnTrendTabLeftArea = Ext.create('Exem.Container', {
            //vbox
            layout : 'vbox',
            minWidth : 300,
            region : 'center',
            style  : {'background-color' : '#fff'}
        });


        var txnTrendTabTitleArea = Ext.create('Exem.Container', {
            //hbox
            layout : 'hbox',
            width  : '100%',
            height : txnTrendTitleHeight,
            padding: '0, 10, 0, 20',
            style  : {
                'font-size' : txnTrendtitleFontSize,
                'text-indent' : 20
            }
        });

        var title = Ext.create('Ext.form.Label', {
            width : 150,
            text : common.Util.TR('Transaction Elapse Time')
        });

        var spacer = Ext.create('Ext.toolbar.Spacer', {
            flex : 1
        });

        self.txnTrendRadioGroup = Ext.create('Exem.FieldContainer', {
            width : 150,
            layout : 'hbox',
            itemId : 'txnTrendRadioGroup',
            defaultType : 'radiofield',
            defaults : {flex : 1},
            items : [{
                boxLabel  : common.Util.TR('All'),
                name      : 'txnTrendType',
                inputValue: 2,
                itemid    : 'all',
                checked   : true,
                listeners : {
                    change: function (field) {
                        if (field.getValue()) {
                            self.radioType = 2;
                            self.trendChartDbClick( 'click' );
                        }
                    }
                }
            }, {
                boxLabel  : common.Util.TR('Exception'),
                name      : 'txnTrendType',
                inputValue: 0,
                itemid    : 'exception',
                listeners : {
                    change: function (field) {
                        if (field.getValue()){
                            self.radioType = 0;
                            self.trendChartDbClick( 'click' );
                        }
                    }
                }
            }]
        });

        txnTrendTabTitleArea.add(title, spacer, self.txnTrendRadioGroup);

        self.txnElapseChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout : 'fit',
            flex   : 1,
            mouseSelect       : true,
            mouseSelectMode   : 'xy',
            showTooltip       : true,
            interval          : PlotChart.time.exMin,
            toolTipFormat     : '%x [value:%y]',
            toolTipTimeFormat : '%d %H:%M',
            chartProperty  :{
                colors : [ '#155496', '#ff110f' ]
            },
            plotselection  : function(event, pos){
                self.dragScatterChart(pos, 0);
            }
        });
        self.txnElapseChart.addSeries({
            id    : 'txnTrendChart',
            label : common.Util.TR('Txn Elapse'),
            type  : PlotChart.type.exScatter
        });
        self.txnElapseChart.addSeries({
            id    : 'txnExceptionChart',
            label : common.Util.TR('Exception Elapse Time'),
            type  : PlotChart.type.exScatter
        });

        txnTrendTabLeftArea.add(txnTrendTabTitleArea, self.txnElapseChart);


        self.sqlElapseChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout : 'fit',
            region : 'east',
            width  : '45%',
            split  : true,
            title  : common.Util.TR('SQL Elapse Time'),
            minWidth : 300,
            titleHeight     : txnTrendTitleHeight,
//            titleFontSize   : txnTrendtitleFontSize,
            showTitle       : true,
            mouseSelect     : true,
            mouseSelectMode : 'xy',
            showTooltip     : true,
            interval          : PlotChart.time.exMin,
            toolTipFormat     : '%x [value:%y]',
            toolTipTimeFormat: '%d %H:%M',
            chartProperty  :{
                colors : [ '#155496' ]//,
                //yLabelWidth: 50
            },
            plotselection  : function(event, pos){
                self.dragScatterChart(pos, 1);
            }
        });

        self.sqlElapseChart.addSeries({
            id : 'sqlElapseChart',
            label : common.Util.TR('SQL Elapse Time'),
            type : PlotChart.type.exScatter
        });


        trendChartTab.add(self.txnExecuteChart, self.txnElapseTimeChart, self.sqlElapseTimeChart);
        txnTrendTab.add(txnTrendTabLeftArea, self.sqlElapseChart);

        self.txnTrendTab = txnTrendTab;

        chartTabPnl.add(trendChartTab);
        chartArea.add(chartTabPnl);
        self.workArea.add(summaryArea, chartArea);

        self.chartTabPnl.setActiveTab( 0 ) ;
    },

    initSummaryGrid : function(){
        var self = this;
        //========================= summary Grid ===========================

        self.summaryGrid = Ext.create('Exem.BaseGrid', {
            localeType: 'Y-m-d H:i',
            gridName  : 'self.summaryGrid',
            itemclick: function(dv, record) {
                self.summarySelectRow(record.data);
            }
        });

        /*
         dataRows[0] // TIME
         ,dataRows[1] // was_name
         ,dataRows[2] // was_id          (visible False)
         ,dataRows[3] // txn_id          (visible False)
         ,dataRows[4] // txn_name
         ,dataRows[5] // txn_exec_count
         ,dataRows[6] // txn_elapse      (visible False)
         ,dataRows[7] // max_txn_elapse
         ,dataRows[8] // avg_txn_elapse
         ,dataRows[9] // txn_cpu_time_max
         ,dataRows[10]// txn_cpu_time_avg
         ,dataRows[11] // sql_exec_count
         ,dataRows[12]// sql_elapse      (visible False)
         ,dataRows[13]// max_sql_elapse
         ,dataRows[14]// avg_sql_elapse
         ,dataRows[15]// prepare_count
         ,dataRows[16]// fetch_count
         ,dataRows[17]// open_conn
         ,dataRows[18]// close_conn
         ,dataRows[19]// open_stmt
         ,dataRows[20]// close_stmt
         ,dataRows[21]// open_rs
         ,dataRows[22]// close_rs
         ,dataRows[23]// open_object
         ,dataRows[24]// close_object
         ,dataRows[25]// EXCEPTION
         */

        self.summaryGrid.beginAddColumns();
        self.summaryGrid.addColumn(common.Util.CTR('Time')                       , 'TIME'            , 120, Grid.DateTime    , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Agent')                      , 'was_name'        , 80 , Grid.String      , true , false);
        self.summaryGrid.addColumn('WAS ID'                                      , 'was_id'          , 100, Grid.StringNumber, false, true);
        self.summaryGrid.addColumn('TXN ID'                                      , 'txn_id'          , 100, Grid.String      , false, true);
        self.summaryGrid.addColumn(common.Util.CTR('Transaction')                , 'txn_name'        , 200, Grid.String      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Transaction Execution Count'), 'txn_exec_count'  , 150, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Transaction Elapse Time')    , 'txn_elapse'      , 100, Grid.Float       , false, true);
        self.summaryGrid.addColumn(common.Util.CTR('SQL Execution Count')        , 'sql_exec_count'  , 130, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('SQL Elapse Time')            , 'sql_elapse'      , 80 , Grid.Float       , false, true);
        self.summaryGrid.addColumn(common.Util.CTR('Elapse Time (MAX)')          , 'max_txn_elapse'  , 100, Grid.Float       , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Elapse Time (AVG)')          , 'avg_txn_elapse'  , 100, Grid.Float       , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Transaction CPU TIME (MAX)') , 'txn_cpu_time_max', 100, Grid.Float       , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Transaction CPU TIME (AVG)') , 'txn_cpu_time_avg', 100, Grid.Float       , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('SQL Elapse (MAX)')           , 'max_sql_elapse'  , 80 , Grid.Float       , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('SQL Elapse (AVG)')           , 'avg_sql_elapse'  , 80 , Grid.Float       , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Prepare Count')              , 'prepare_count'   , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Fetch Count')                , 'fetch_count'     , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Open Conn')                  , 'open_conn'       , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Close Conn')                 , 'close_conn'      , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Open Stmt')                  , 'open_stmt'       , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Close Stmt')                 , 'close_stmt'      , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Open RS')                    , 'open_rs'         , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Close RS')                   , 'close_rs'        , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Open Object')                , 'open_object'     , 100, Grid.Number      , false, true);
        self.summaryGrid.addColumn(common.Util.CTR('Close Object')               , 'close_object'    , 100, Grid.Number      , false, true);
        self.summaryGrid.addColumn(common.Util.CTR('Exception')                  , 'EXCEPTION'       , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn(common.Util.CTR('Fetch Time')                 , 'fetch_time'      , 100, Grid.Number      , true , false);
        self.summaryGrid.addColumn('Time'                                        , 'TIME_TEMP'       , 100, Grid.DateTime    , false, true);
        self.summaryGrid.endAddColumns();

        self.summaryGrid.loadLayout(self.summaryGrid.gridName);

        self.summaryGrid.addRenderer('close_stmt',   this.noClosedRenderer   , RendererType.bar);
        self.summaryGrid.addRenderer('close_conn',   this.noClosedRenderer   , RendererType.bar);
        self.summaryGrid.addRenderer('close_rs',     this.noClosedRenderer   , RendererType.bar);

        self.summaryGrid.contextMenu.addItem({
            title: common.Util.TR('Transaction Summary'),
            fn: function() {
                var record = this.up().record;

                self.groupByValue = self.groupCombo.getValue();
                var fromTime = Ext.util.Format.date(record['TIME'], Comm.dateFormat.HM);
                var toTime;
                switch(self.groupByValue) {
                    case "0":
                        toTime = Ext.util.Format.date(common.Util.getDate(+new Date(record['TIME']) + 1200000), Comm.dateFormat.HM);
                        break;
                    case "1":
                        toTime = Ext.util.Format.date(common.Util.getDate(+new Date(record['TIME']) + 3600000), Comm.dateFormat.HM);
                        break;
                    case "2":
                        record['TIME'] += ' 00:00:00';
                        fromTime = Ext.util.Format.date(record['TIME'], Comm.dateFormat.HM);
                        toTime = Ext.util.Format.date(common.Util.getDate(+new Date(record['TIME']) + 86400000), Comm.dateFormat.HM);
                        break;
                    default :
                        break;
                }

                var txnHistory = common.OpenView.open('TxnHistory', {
                    fromTime     : fromTime,
                    toTime       : toTime,
                    transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId : record['was_id']
                });
                setTimeout(function (){
                    txnHistory.retrieve();
                }, 300);
            }
        }, 0);
    },


    noClosedRenderer: function(value, meta, record) {

        var renderValue = null;

        if ((meta.column.dataIndex === 'close_stmt' && record.data.close_stmt < record.data.open_stmt) ||
            (meta.column.dataIndex === 'close_conn' && record.data.close_conn < record.data.open_conn) ||
            (meta.column.dataIndex === 'close_rs' && record.data.close_rs < record.data.open_rs)) {

            meta.style="background-color:lightcoral;";
        }

        if(meta.column.dataType == 'int') {
            if (meta.column.colType != Grid.StringNumber) {
                if (value % 1 != 0) {
                    renderValue = value;
                } else {
                    renderValue = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
            } else {
                renderValue = value;
            }
            meta.tdAttr = 'data-qtip="' + renderValue + '"';
        } else {
            renderValue = value;
        }

        return renderValue;
    },


    initTxnElapseChart : function(){
        //======================= Trend Chart  Tab =========================
        var self = this;

        var txnHistoryTitleHeight = 30;

        self.txnExecuteChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout : 'fit',
            title  : common.Util.TR('Transaction Execution Count'),
            region : 'north',
            split  : true,
            height : '33%',
            interval         : PlotChart.time.exTenMin,
            minHeight        : 120,
            titleHeight      : txnHistoryTitleHeight,
            showTitle        : true,
            showLegend       : true,
            showIndicator    : true,
            showTooltip      : true,
            toolTipFormat    : '[%s] %x [value:%y]',
            toolTipTimeFormat: '%d %H:%M',
            chartProperty      : {
                yLabelWidth: 40
            },

            historyInfoDblClick: function (chart, record) {
                var xAxis = {};
                xAxis.x = (+new Date(record.data['TIME']));
                self.txnExecuteChart.drawIndicator(xAxis);
                self.txnElapseTimeChart.drawIndicator(xAxis);
                self.sqlElapseTimeChart.drawIndicator(xAxis);
                self.xAxis = xAxis;
                self.trendChartDbClick();
            },

            plotdblclick: function (event, pos, item, xAxis) {
                if ( self.retrieveFlag ) {


                    if (!xAxis) {
                        return;
                    }

                    self.txnElapseTimeChart.drawIndicator(xAxis);
                    self.sqlElapseTimeChart.drawIndicator(xAxis);

                    if ( xAxis.y.length == 0 || (xAxis.y[0]['y'] == null && xAxis.y[1]['y'] == null) ) {
                        return;
                    }

                    self.xAxis = xAxis;   /* 전역객체를 주는 이유는 데이터를 담아놓고 radioChange 에서도 쓰기위함 */
                    self.trendChartDbClick();
                }
            }
        });
        self.txnExecuteChart.addSeries({
            id    : 'execute',
            label : common.Util.CTR('Execution'),
//            point : true,
            type  : PlotChart.type.exLine,
            point : true
        });
        self.txnExecuteChart.addSeries({
            id    : 'exception',
            label : common.Util.CTR('Exception'),
//            point : true,
            type  : PlotChart.type.exLine,
            point : true
        });


        self.txnElapseTimeChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout : 'fit',
            title  : common.Util.TR('Transaction Elapse Time'),
            region : 'center',
            titleHeight      : txnHistoryTitleHeight,
            minHeight        : 120,
            interval         : PlotChart.time.exTenMin,
            showTitle        : true,
            showLegend       : true,
            showIndicator    : true,
            showTooltip      : true,
            toolTipFormat    : '[%s] %x [value:%y]',
            toolTipTimeFormat: '%d %H:%M',
            chartProperty      : {
                yLabelWidth: 40
            },

            historyInfoDblClick: function (chart, record) {
                var xAxis = {};
                xAxis.x = (+new Date(record.data['TIME']));
                self.txnExecuteChart.drawIndicator(xAxis);
                self.txnElapseTimeChart.drawIndicator(xAxis);
                self.sqlElapseTimeChart.drawIndicator(xAxis);
                self.xAxis = xAxis;
                self.trendChartDbClick();
            },

            plotdblclick: function (event, pos, item, xAxis) {
                if ( self.retrieveFlag ) {
                    if (!xAxis) {
                        return;
                    }
                    self.txnExecuteChart.drawIndicator(xAxis);
                    self.sqlElapseTimeChart.drawIndicator(xAxis);

                    if ( xAxis.y.length == 0 || (xAxis.y[0]['y'] == null && xAxis.y[1]['y'] == null) ) {
                        return;
                    }

                    self.xAxis = xAxis;
                    self.trendChartDbClick();
                }
            }
        });

        self.txnElapseTimeChart.addSeries({
            id    : 'max',
            label : common.Util.CTR('MAX'),
//            point : true,
            type  : PlotChart.type.exLine,
            point : true
        });
        self.txnElapseTimeChart.addSeries({
            id    : 'avg',
            label : common.Util.CTR('AVG'),
//            point : true,
            type  : PlotChart.type.exLine,
            point : true
        });


        self.sqlElapseTimeChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout : 'fit',
            title  : common.Util.TR('SQL Elapse Time'),
            region : 'south',
            split  : true,
            height : '33%',
            minHeight        : 120,
            titleHeight      : txnHistoryTitleHeight,
            showTitle        : true,
            showLegend       : true,
            showIndicator    : true,
            showTooltip      : true,
            interval         : PlotChart.time.exTenMin,
            toolTipFormat    : '[%s] %x [value:%y]',
            toolTipTimeFormat: '%d %H:%M',
            chartProperty      : {
                yLabelWidth: 40
            },

            historyInfoDblClick: function (chart, record) {
                var xAxis = {};
                xAxis.x = (+new Date(record.data['TIME']));
                self.txnExecuteChart.drawIndicator(xAxis);
                self.txnElapseTimeChart.drawIndicator(xAxis);
                self.sqlElapseTimeChart.drawIndicator(xAxis);
                self.xAxis = xAxis;
                self.trendChartDbClick();
            },

            plotdblclick: function (event, pos, item, xAxis) {
                if ( self.retrieveFlag ) {
                    if (!xAxis) {
                        return;
                    }

                    self.txnExecuteChart.drawIndicator(xAxis);
                    self.txnElapseTimeChart.drawIndicator(xAxis);

                    if ( xAxis.y.length == 0 || (xAxis.y[0]['y'] == null && xAxis.y[1]['y'] == null) ) {
                        return;
                    }

                    self.xAxis = xAxis;
                    self.trendChartDbClick();
                }
            }
        });
        self.sqlElapseTimeChart.addSeries({
            id    : 'max',
            label : common.Util.CTR('MAX'),
//            point : true,
            type  : PlotChart.type.exLine,
            point : true
        });
        self.sqlElapseTimeChart.addSeries({
            id    : 'avg',
            label : common.Util.CTR('AVG'),
//            point : true,
            type  : PlotChart.type.exLine,
            point : true
        });
    },

    change_style: function( state, id ){
        var style;

        style = document.querySelectorAll(".exem-check .x-form-cb-label") ;

        if ( state ){

            switch( id ){
                case 'statement':
                    style[0].style.color = '#666' ;
                    break ;

                case 'connection':
                    style[1].style.color = '#666' ;
                    break ;

                case 'result':
                    style[2].style.color = '#666' ;
                    break ;

                default :
                    break;
            }
        }else{
            switch( id ){
                case 'statement':
                    style[0].style.color = '#A8A8A8' ;
                    break ;

                case 'connection':
                    style[1].style.color = '#A8A8A8' ;
                    break ;

                case 'result':
                    style[2].style.color = '#A8A8A8' ;
                    break ;

                default :
                    break;
            }
        }

        style = null;
    },

    _chartHide: function() {
        var self = this;

        var txnTrendTab = self.chartTabPnl.getComponent('txnTrendTab');
        var thirdTab    = self.chartTabPnl.getComponent('thirdTab');

        if (txnTrendTab) {
            txnTrendTab.tab.hide();
            txnTrendTab.hide();
        }
        if (thirdTab) {
            thirdTab.tab.hide();
            thirdTab.hide();
        }
    },

    _summaryGridDraw: function() {
        var self = this;

        self.summaryGrid.clearRows();

        var dataset = {};
        var tmpArray ;
        var stmt = '';
        var conn = '';
        var rs = '';
        var obj = '';
        self.txn_name = self.txnNameTF.getValue() ;

        if ( self.txn_name == common.Util.TR('Transaction Name') ) {
            self.txn_name = '%' ;
        }
        self.txn_name  = '\''+self.txn_name +'\'' ;

        tmpArray = self.addtionalCondition.getCheckedValueArr();
        for (var ix = 0; ix < tmpArray.length; ix++) {
            switch (tmpArray[ix]) {
                case 0:
                    stmt = 'AND close_stmt < open_stmt';
                    break;
                case 1:
                    conn = 'AND close_conn < open_conn';
                    break;
                case 2:
                    rs   = 'AND close_rs < open_rs';
                    break;
                default:
                    break;
            }
        }

        dataset.bind = [{
            name : "from_time",
            value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name : "to_time",
            value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }];

        dataset.replace_string = [{
            name : "txn_name",
            value: self.txn_name
        }, {
            name : "was_id",
            value: self.wasField.getValue()
        }, {
            name : "statement",
            value: stmt
        }, {
            name : "connection",
            value: conn
        }, {
            name : "result",
            value: rs
        }, {
            name : "object",
            value: obj
        }, {
            name : 'cb_idx',
            value : '\''+self.groupByValue + '\''
        }];

        dataset.sql_file = self.sql.summary;
        WS.SQLExec(dataset, self.onData, self);
    },

    // 시작지점 Flag- txnElpase, sqlElapse
    dragScatterChart: function(pos, txnSqlFlag) {
        var self = this;
        var xfrom, xto,
            fromTime, toTime;
        var txnDataset = {};
        var sqlDataset = {};
        var txn_name;

        var thirdTab = self.chartTabPnl.getComponent('thirdTab');

        if (thirdTab) {
            thirdTab.tab.show();
            thirdTab.show();
        }


        xfrom = pos.xaxis.from;
        xto   = pos.xaxis.to;
        if (xfrom == xto) {
            return;
        }

        fromTime = common.Util.getDate(xfrom);
        toTime = common.Util.getDate(xto);

        //비지니스명이 존재하는 txn name이라면 비지니스명뺀채로 넘긴다.
        txn_name = common.Util.cutOffTxnExtName(self.txn_name);

        if (!self.thirdTab) {
            self.thirdTab = Ext.create('Exem.Panel', {
                itemId : 'thirdTab',
                layout : 'fit'
            });
            self.chartTabPnl.add(self.thirdTab);
        } else {
            self.thirdTab.removeAll();
        }

        self.chartTabPnl.setActiveTab(2);

        self.thirdGrid = Ext.create('Exem.BaseGrid', {
            localeType: 'Y-m-d H:i:s',
            gridName  : 'self.thirdGrid',
            itemdblclick: function(dv, record){
                if ( record.data.txn_elapse !== undefined ){
                    self.openTxnDetail(record.raw);
                }
                else {

                    var winSQLFullText = Ext.create('Exem.FullSQLTextWindow');
                    winSQLFullText.getFullSQLText(record.data.sql_id);
                    winSQLFullText.show() ;

                    winSQLFullText = null ;
                }
            }
        });

        self.thirdTab.add(self.thirdGrid);

        this.thirdGrid.loadingMask.show() ;
        // txnElapse 드래그
        if (txnSqlFlag == 0) {

            self.thirdTab.setTitle(common.Util.TR('Transaction'));

            self.thirdGrid.beginAddColumns();
            self.thirdGrid.addColumn(common.Util.CTR('Time')                     ,'time'           ,150, Grid.DateTime, true, false);
            self.thirdGrid.addColumn(common.Util.CTR('Agent')                    ,'was_name'       ,100, Grid.String  , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('Exception')                ,'EXCEPTION'      ,100, Grid.Number  , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('Login Name')               ,'login_name'     ,100, Grid.String  , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('Transaction')              ,'txn_name'       ,180, Grid.String  , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('Client IP')                ,'client_ip'      ,150, Grid.String  , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('Transaction Elapse Time')  ,'txn_elapse'     ,150, Grid.Float   , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('SQL Elapse Time')          ,'sql_elapse'     ,100, Grid.Float   , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('SQL Elapse Time (AVG)')    ,'sql_elapse_avg' ,100, Grid.Float   , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('SQL Execution Count')      ,'sql_exec_count' ,110, Grid.Number  , true, false);
            self.thirdGrid.addColumn(common.Util.CTR('Fetch Count')              ,'fetch_count'    ,100, Grid.Number  , true, false);
            self.thirdGrid.addColumn('WAS ID'                                    ,'was_id'         ,100, Grid.StringNumber  , false, true);
            self.thirdGrid.addColumn('TID'                                       ,'tid'            ,100, Grid.String  , false, true);
            self.thirdGrid.addColumn('TXN ID'                                    ,'txn_id'         ,100, Grid.String  , false, true);
            self.thirdGrid.addColumn(common.Util.CTR('Start Time')               ,'start_time'     ,100, Grid.DateTime, false, true);
            self.thirdGrid.endAddColumns();

            self.thirdGrid.loadLayout(self.thirdGrid.gridName);

            /*
             // true
             [ix][0]  // time
             [ix][2]  // was_name
             [ix][10] // EXCEPTION
             [ix][9] // login_name
             [ix][3]  // txn_name
             [ix][4]  // client_ip
             [ix][5]  // txn_elapse
             [ix][6]  // sql_elapse
             [ix][14] // sql_elapse_Avg
             [ix][12] // sql_exec_count
             [ix][13] // fetch_count

             // false
             [ix][1]  // was_id
             [ix][7]  // tid
             [ix][8]  // txn_id
             [ix][11] // start_time
             */

            txnDataset.bind = [{
                name : "from_time",
                type : SQLBindType.STRING,
                value: fromTime
            }, {
                name : "to_time",
                type : SQLBindType.STRING,
                value: toTime
            }, {
                name : "txn_id",
                type : SQLBindType.STRING,
                value: self.txn_id
            }, {
                name : "txn_elapse_max",
                value: pos.yaxis.to,
                type : SQLBindType.FLOAT
            }, {
                name : "txn_elapse_min",
                value: pos.yaxis.from,
                type : SQLBindType.FLOAT
            }, {
                name : "was_id",
                value: self.was_id,
                type : SQLBindType.INTEGER
            }, {
                name : "type",
                value: self.radioType,
                type : SQLBindType.INTEGER
            }];

            txnDataset.replace_string = [{
                name : "txn_name",
                value: txn_name
            }];

            txnDataset.sql_file = self.sql.txnDrag;
            WS.SQLExec(txnDataset, self.onData, self);


            self.thirdGrid.contextMenu.addItem({
                title: common.Util.TR('Transaction Detail'),
                fn: function() {
                    self.openTxnDetail(this.up().record);
                }
            }, 0);


            self.thirdGrid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record, tr, rowIndex) {
                if(rowIndex != undefined && record.data['txn_elapse'] != undefined) {
                    self.thirdGrid.contextMenu.setDisableItem(0, true);
                }
                else {
                    self.thirdGrid.contextMenu.setDisableItem(0, false);
                }
            }.bind(this));



        } else {  /* sqlElapse 드래그 */
            self.thirdTab.setTitle(common.Util.TR('SQL'));


            self.thirdGrid.beginAddColumns();
            self.thirdGrid.addColumn(common.Util.CTR('Time')             ,'TIME',             150, Grid.DateTime, true , false);
            self.thirdGrid.addColumn('WAS ID'                            ,'was_id',           100, Grid.StringNumber  , false, true);
            self.thirdGrid.addColumn(common.Util.CTR('Agent')            ,'was_name',         100, Grid.String  , true , false);
            self.thirdGrid.addColumn('DB ID'                             ,'db_id',            100, Grid.StringNumber  , false, true);
            self.thirdGrid.addColumn(common.Util.CTR('Instance')         ,'INSTANCE',         120, Grid.String  , true , false);
            self.thirdGrid.addColumn(common.Util.CTR('SQL')              ,'sql_text',         200, Grid.String  , true , false);
            self.thirdGrid.addColumn('TXN ID'                            ,'txn_id',           100, Grid.String  , false, true);
            self.thirdGrid.addColumn(common.Util.CTR('Transaction')      ,'txn_name',         150, Grid.String  , true , false);
            self.thirdGrid.addColumn(common.Util.CTR('Execute Count')    ,'execute_count',    100, Grid.Number  , true , false);
            self.thirdGrid.addColumn(common.Util.CTR('Elapse Time (MAX)'),'elapsed_time_max', 100, Grid.Float   , true , false);
            self.thirdGrid.addColumn(common.Util.CTR('Elapse Time (AVG)'),'elapsed_time_avg', 100, Grid.Float   , true , false);
            self.thirdGrid.addColumn(common.Util.CTR('CPU Time')         ,'cpu_time',         100, Grid.Number  , true , false);
            self.thirdGrid.addColumn('TID'                               ,'tid',              100, Grid.String  , false, true);
            self.thirdGrid.addColumn('Wait Time'                         ,'wait_time',        100, Grid.Float  , false, true);
            self.thirdGrid.addColumn(common.Util.CTR('Logical Reads')    ,'logical_reads',    100, Grid.Number  , true , false);
            self.thirdGrid.addColumn(common.Util.CTR('Physical Reads')   ,'physical_reads',   100, Grid.Number  , true , false);
            self.thirdGrid.addColumn('SQL ID'                            ,'sql_id',           100, Grid.String  , false, true);
            self.thirdGrid.endAddColumns();


            sqlDataset.bind = [{
                name : "from_time",
                type : SQLBindType.STRING,
                value: fromTime
            }, {
                name : "to_time",
                type : SQLBindType.STRING,
                value: toTime
            }, {
                name : "txn_id",
                type : SQLBindType.STRING,
                value: self.txn_id
            }, {
                name : "elapsed_time_max",
                type : SQLBindType.FLOAT,
                value: pos.yaxis.to
            }, {
                name : "elapsed_time_avg",
                type : SQLBindType.FLOAT,
                value: pos.yaxis.from
            }, {
                name : "was_id",
                type : SQLBindType.INTEGER,
                value: self.was_id
            }];
            sqlDataset.replace_string = [{
                name : "txn_name",
                value: txn_name
            }];

            sqlDataset.sql_file = self.sql.sqlDrag;
            WS.SQLExec(sqlDataset, self.onData, self);

            self.thirdGrid.contextMenu.addItem({
                title: common.Util.TR('Transaction Summary'),
                fn: function() {
                    var record = this.up().record;
                    var txnHistory = common.OpenView.open('TxnHistory', {
                        fromTime     : Ext.util.Format.date(record['TIME'], Comm.dateFormat.HM),
                        toTime       : Ext.util.Format.date(common.Util.getDate(+new Date(record['TIME']) + 1200000), Comm.dateFormat.HM),
                        wasId : record['was_id'],
                        transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name'])
                    });
                    setTimeout(function (){
                        txnHistory.retrieve();
                    }, 300);
                }
            }, 0);

            self.thirdGrid.contextMenu.addItem({
                title : common.Util.TR('SQL Summary'),
                fn: function() {
                    var record = this.up().record;
                    var sqlHistory = common.OpenView.open('SQLHistory', {
                        fromTime     : Ext.util.Format.date(record['TIME'], Comm.dateFormat.HM),
                        toTime       : Ext.util.Format.date(common.Util.getDate(+new Date(record['TIME']) + 600000), Comm.dateFormat.HM),
                        wasId        : record['was_id'],
                        //dbId         : record['db_id'],
                        sqlIdTF      : record['sql_id']
                    });
                    setTimeout(function() {
                        sqlHistory.retrieve();
                    }, 300);
                }
            }, 1);

            self.thirdGrid.contextMenu.addItem({
                title : common.Util.TR('Full SQL Text'),
                fn: function() {
                    var record = this.up().record;
                    self.winSQLFullText = Ext.create('Exem.FullSQLTextWindow');
                    self.winSQLFullText.getFullSQLText(record['sql_id']);
                    self.winSQLFullText.show();
                }
            }, 2);


        }
    },

    openTxnDetail: function(data) {
        var record = data;

        var txnView = Ext.create('view.TransactionDetailView',{
            startTime  : Ext.util.Format.date(common.Util.getDate(record.start_time), Comm.dateFormat.HMS),
            endTime    : Ext.util.Format.date(common.Util.getDate(record.time), Comm.dateFormat.HMS),
            wasId      : record.was_id,
            name       : record.was_name,
            tid        : record.tid,
            txnName    : common.Util.cutOffTxnExtName(record.txn_name),
            elapseTime : record.txn_elapse,
            socket     : WS
        });

        var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
        mainTab.add(txnView);
        mainTab.setActiveTab(mainTab.items.length - 1);
        txnView.init();

        txnView = null ;
        mainTab = null ;

    },


    /**
    _createDetailTab: function() {
        var panel = Ext.create('Exem.Form', {
            title : common.Util.TR('Transaction Detail'),
            layout: 'fit',
            closable: true
        });
        var mainTabPanel = Ext.getCmp('viewPort').getComponent('mainTab');
        mainTabPanel.setActiveTab(mainTabPanel.add(panel));

        return panel.id;
    },
     **/

    /*
     * @param - event_idx: transaction trend tab에서 라디오버튼 클릭이벤트시에는 무조건1번탭으로 전환하기위한 파람.
     * */
    trendChartDbClick: function( event_idx ) {  /* sqlElapse 차트 갱신 주기 체크 용도. */

        if ( this.draw_txn || this.draw_sql ){
            this.showMessage(common.Util.TR('ERROR'), 'SQL is running', Ext.Msg.OK, Ext.MessageBox.ERROR, function(){

            });
            return ;
        }

        var self = this;
        var tab_index ;
        var dataTime;

        self.elapseSendCnt = 0;
        self.elapseReceiveCnt = 0;

        if(self.groupByValue === '2'){
            if(self.click_time.split(' ')[1] != '00:00:00') {
                self.click_time += ' 00:00:00';
            }
        }

        if ( self.xAxis == undefined ){
            dataTime = +new Date( self.click_time ) ;
            self.init_flag = true ;
        }else{
            if (!self.xAxis.x) {
                return false;
            }
            dataTime = self.xAxis.x ;
            self.init_flag = false ;
        }

        if ( self.init_flag && event_idx == undefined ) {
            tab_index = 0;
        }
        else
        {
            tab_index = 1;
        }



        self.txnElapseChart.clearAllSeires();
        self.txnElapseChart.plotRedraw();
        self.sqlElapseChart.clearAllSeires();
        self.sqlElapseChart.plotRedraw();


        var txnTrendTab = self.chartTabPnl.getComponent('txnTrendTab');

        if (!txnTrendTab)
            self.chartTabPnl.add(self.txnTrendTab);
        else  {
            txnTrendTab.tab.show();
            txnTrendTab.show();
        }

        self.chartTabPnl.setActiveTab(tab_index);


        var fromTime = common.Util.getDate(dataTime),
            toTime,
            txnElapseDataset = {},
            sqlElapseDataset = {};


        // 여기서 시간값을 각각의 포맷에 맞게 잘라서 계산해줘야 차트가 안꼬임.
        switch(self.groupByValue) {
            case "0":
                toTime = common.Util.getDate(dataTime + 600000);
                break;
            case "1":
                toTime = common.Util.getDate(dataTime + 3600000);
                break;
            case "2":
                toTime = common.Util.getDate(dataTime + 86400000);
                break;
            default : break;
        }

        dataTime = null ;

        self.sqlElapseChart.loadingMask.show() ;
        this.draw_sql = true ;
        sqlElapseDataset.bind = [{
            name : "from_time",
            value: fromTime,
            type : SQLBindType.STRING
        }, {
            name : "to_time",
            value: toTime,
            type : SQLBindType.STRING
        }, {
            name : "txn_id",
            value: self.txn_id,
            type : SQLBindType.STRING
        }, {
            name : "was_id",
            value: self.was_id,
            type : SQLBindType.INTEGER
        }];
        sqlElapseDataset.replace_string = [{
            name: "txn_name",
            value: self.txn_name
        }];

        sqlElapseDataset.sql_file = self.sql.sqlElapse;
        WS.SQLExec(sqlElapseDataset, self.onChartData, self);
        self.elapseSendCnt++;

        this.draw_txn = true ;
        self.txnElapseChart.loadingMask.show() ;
        txnElapseDataset.bind = [{
            name : "from_time",
            value: fromTime,
            type : SQLBindType.STRING
        }, {
            name : "to_time",
            value: toTime,
            type : SQLBindType.STRING
        }, {
            name : "txn_id",
            value: self.txn_id,
            type : SQLBindType.STRING
        }, {
            name : "was_id",
            value: self.was_id,
            type : SQLBindType.INTEGER
        }, {
            name : "type",
            value: self.radioType,
            type : SQLBindType.INTEGER
        }];

        txnElapseDataset.sql_file = self.sql.txnElapse;
        txnElapseDataset.querytimeout = '600';
        WS2.SQLExec(txnElapseDataset, self.onChartData, self);
        self.elapseSendCnt++;
    },


    summarySelectRow: function(adata) {

        if ( this.draw_txn || this.draw_sql ){
            return ;
        }

        var self = this;

        if(self.groupByValue === '2'){
            self.click_time = adata['TIME'] ;
        }else{
            self.click_time = adata['TIME_TEMP'] ;
        }

        /** 추이는 상관없지만 트랜잭션 조회의 데이터가 다르므로 정말 필요한가??
         if (self.txn_id && self.txn_id == adata['txn_id']){
            return;
        }
         **/


        self.chartTabPnl.setActiveTab(0);

        if (!self.isLoading)
            self.chartTabPnl.loadingMask.showMask();

        self._chartHide();

        self.txnExecuteChart.clearAllSeires();
        self.txnElapseTimeChart.clearAllSeires();
        self.sqlElapseTimeChart.clearAllSeires();
        self.txnElapseChart.clearValues(0);
        self.sqlElapseChart.clearValues(0);

        self.txnExecuteChart.plotRedraw();
        self.txnElapseTimeChart.plotRedraw();
        self.sqlElapseTimeChart.plotRedraw();
        self.txnElapseChart.plotRedraw();
        self.sqlElapseChart.plotRedraw();


        if (self.thirdGrid)
            self.thirdGrid.clearRows();

        // 콤보박스 변경하고 rows를 선택했을 때도 갱신되어야함
        self.groupByValue = self.groupCombo.getValue();

        if ( self.xAxis ){
            self.xAxis.x = +new Date(adata.TIME) ;
        }


        self.txn_id   = adata['txn_id']; /* self 로 저장하는 이유는 scatter 차트 쿼리에 들어가기 때문. */
        self.was_id   = adata['was_id'];
        self.txn_name = common.Util.cutOffTxnExtName(adata['txn_name']);
        var gridClickDataset = {};

        gridClickDataset.bind = [{
            name : 'from_time',
            value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name : 'to_time',
            value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name : 'txn_id',
            value: self.txn_id,
            type : SQLBindType.STRING
        }, {
            name : 'was_id',
            value: self.was_id,
            type : SQLBindType.INTEGER
        }];

        gridClickDataset.replace_string = [{
            name : 'cb_idx',
            value : '\''+self.groupByValue + '\''
        }];

        gridClickDataset.sql_file = self.sql.gridClick;
        WS.SQLExec(gridClickDataset, self.onChartData, self);
    },

    executeSQL: function() {
        var self = this;

        var setFromTime = Ext.util.Format.date(this.datePicker.getFromDateTime(), Comm.dateFormat.HM);
        var setToTime   = Ext.util.Format.date(this.datePicker.getToDateTime(), Comm.dateFormat.HM);

        setFromTime = setFromTime.substr(0, setFromTime.length - 1) + '0';
        setToTime   = setToTime.substr(0, setToTime.length - 1) + '0';

        this.datePicker.mainFromField.setValue(setFromTime);
        this.datePicker.mainToField.setValue(setToTime);


        if (self.chartTabPnl.isLoading || this.draw_txn || this.draw_sql) {
            return;
        }

        self.retrieveFlag = true;
        self.txn_id = null;
        self.init_flag = true ;

        self._chartHide();

        self.txnExecuteChart.clearValues();
        self.txnElapseTimeChart.clearValues();
        self.sqlElapseTimeChart.clearValues();

        self.txnExecuteChart.clearAllSeires();
        self.txnElapseTimeChart.clearAllSeires();
        self.sqlElapseTimeChart.clearAllSeires();


        self.txnElapseChart.clearValues(0);
        self.sqlElapseChart.clearValues(0);

        self.txnExecuteChart.plotRedraw();
        self.txnElapseTimeChart.plotRedraw();
        self.sqlElapseTimeChart.plotRedraw();
        self.txnElapseChart.plotRedraw();
        self.sqlElapseChart.plotRedraw();

        self.loadingMask.showMask();

        if (self.thirdGrid)
            self.thirdGrid.clearRows();

        self.groupByValue = self.groupCombo.getValue();

        var chageTimeFormat = null;
        switch(self.groupByValue) {
            case "0":
                chageTimeFormat = 'Y-m-d H:i';
                self.txnExecuteChart.interval = PlotChart.time.exTenMin ;
                self.txnElapseTimeChart.interval = PlotChart.time.exTenMin ;
                self.sqlElapseTimeChart.interval = PlotChart.time.exTenMin ;
                break;
            case "1":
                chageTimeFormat = 'Y-m-d H';
                self.txnExecuteChart.interval = PlotChart.time.exHour ;
                self.txnElapseTimeChart.interval = PlotChart.time.exHour ;
                self.sqlElapseTimeChart.interval = PlotChart.time.exHour ;
                break;
            case "2":
                chageTimeFormat = 'Y-m-d';
                self.txnExecuteChart.interval = PlotChart.time.exDay ;
                self.txnElapseTimeChart.interval = PlotChart.time.exDay ;
                self.sqlElapseTimeChart.interval = PlotChart.time.exDay ;
                break;
            default:
                break;
        }
        this.summaryGrid.changeLocale(chageTimeFormat);


        self._summaryGridDraw();

    },




    onData: function(aheader, adata) {
        var self = this;
        var command = aheader.command;
        var dataRows;
        var ix, ixLen;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            if(command != self.sql.summary && self.thirdGrid != undefined){
                self.thirdGrid.loadingMask.hide();
            }

            self.loadingMask.hide();

            console.info('TxnHistory-onData');
            console.info(aheader);
            console.info(adata);
            return;
        }

        if(adata.rows.length > 0){
            switch(command){
                case self.sql.summary:
                    var grid = self.summaryGrid.pnlExGrid;

                    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                        dataRows = adata.rows[ix];

                        self.summaryGrid.addRow([
                            dataRows[0] // TIME
                            ,dataRows[1] // was_name
                            ,dataRows[2] // was_id(visible-False)
                            ,dataRows[3] // txn_id(visible-False)
                            ,dataRows[4] // txn_name
                            ,dataRows[5] // txn_exec_count
                            ,dataRows[6] // txn_elapse(visible-False)
                            ,dataRows[11] // sql_exec_count
                            ,dataRows[12]// sql_elapse(visible-False)
                            ,dataRows[7] // max_txn_elapse
                            ,dataRows[8] // avg_txn_elapse
                            ,dataRows[9] // txn_cpu_time_max
                            ,dataRows[10]// txn_cpu_time_avg
                            ,dataRows[13]// max_sql_elapse
                            ,dataRows[14]// avg_sql_elapse
                            ,dataRows[15]// prepare_count
                            ,dataRows[16]// fetch_count
                            ,+dataRows[17]// open_conn  open_conn 부터 close_rs까지는 데이터 비교를 위하여 숫자타입으로 변경
                            ,+dataRows[18]// close_conn
                            ,+dataRows[19]// open_stmt
                            ,+dataRows[20]// close_stmt
                            ,+dataRows[21]// open_rs
                            ,+dataRows[22]// close_rs
                            ,dataRows[23]// open_object
                            ,dataRows[24]// close_object
                            ,dataRows[25]// EXCEPTION
                            ,dataRows[26]// fetch_time
                            ,Ext.util.Format.date(dataRows[0], 'Y-m-d H:i')// TIME_TEMP
                        ]);
                    }

                    self.summaryGrid.drawGrid();
                    self.loadingMask.hide();

                    //클릭이벤트 발생
                    grid.getView().getSelectionModel().select(0);
                    grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());

                    break;

                case self.sql.txnDrag:
                    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                        dataRows = adata.rows[ix];

                        self.thirdGrid.addRow([
                            dataRows[0]    // time
                            ,dataRows[2]    // was_name
                            ,dataRows[10]   // EXCEPTION
                            ,dataRows[9]   // login_name
                            ,dataRows[3]    // txn_name
                            ,dataRows[4]    // client_ip
                            ,dataRows[5]    // txn_elapse
                            ,dataRows[6]    // sql_elapse
                            ,dataRows[14]   // sql_elapse_Avg
                            ,dataRows[12]   // sql_exec_count
                            ,dataRows[13]   // fetch_count
                            ,dataRows[1]    // was_id
                            ,dataRows[7]    // tid
                            ,dataRows[8]    // txn_id
                            ,dataRows[11]   // start_time
                        ]);
                    }

                    self.thirdGrid.drawGrid();
                    self.thirdGrid.loadingMask.hide() ;

                    break;
                case self.sql.sqlDrag:
                    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                        dataRows = adata.rows[ix];

                        self.thirdGrid.addRow(dataRows);
                    }

                    self.thirdGrid.drawGrid();
                    self.thirdGrid.loadingMask.hide() ;

                    break;
                default : break;
            }
        }
        else {
            if ( self.thirdGrid != undefined ){
                self.thirdGrid.loadingMask.hide() ;
            }
            self.loadingMask.hide();
        }
    },


    onChartData: function(aheader, adata) {
        var self = this;
        var param = aheader.parameters;
        var command = aheader.command;
        var dataRows, xaxis;
        var ix, ixLen;

        if(this.isClosed){
            return;
        }

        if (command == self.sql.txnElapse || command == self.sql.sqlElapse) {
            self.elapseReceiveCnt++;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            self.showMessage(common.Util.TR('ERROR'), aheader.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                self.wasField.focus();
            });

            if (command == self.sql.txnElapse) {
                self.chartTabPnl.loadingMask.hide();
                 self.txnElapseChart.loadingMask.hide() ;
            }
            else if (command == self.sql.sqlElapse) {
                self.chartTabPnl.loadingMask.hide();
                self.sqlElapseChart.loadingMask.hide() ;
            }

            console.info('TxnHistory-onChartData');
            console.info(aheader);
            console.info(adata);
            return;
        }

        if (adata.rows.length > 0) {
            var from = param.bind[0].value;
            var to   = param.bind[1].value;

            switch(aheader.command) {
                case self.sql.gridClick:

                    /*
                     여기서 3놈을 그려야 함. 먼저 timeformat 을 설정해줘야 하고,
                     평균은 txn_elapse / txn_exec_count
                     sql_elapse / sql_exec_count
                     */

                    switch (self.groupByValue){
                        case "0": /* 10 분 */
                            self.interval = 600000;
                            self.timeformat = '%H:%M';

                            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                                dataRows = adata.rows[ix];
                                dataRows[3] = dataRows[3] / dataRows[1];
                                if ( Number(dataRows[5]) !== 0 ){
                                    dataRows[6] = dataRows[6] / dataRows[5];
                                }
                            }
                            break;
                        case "1": /* 1 시간 */
                            self.interval = 3600000;
                            self.timeformat = '%d %H';

                            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                                dataRows = adata.rows[ix];
                                dataRows[0] = dataRows[0] + ':00:00';
                                dataRows[3] = dataRows[3] / dataRows[1];
                                if ( Number(dataRows[5]) !== 0 ){
                                    dataRows[6] = dataRows[6] / dataRows[5];
                                }
                            }
                            break;
                        case "2": // 하루
                            self.interval = 86400000;
                            self.timeformat = '%d';

                            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                                dataRows = adata.rows[ix];
                                dataRows[0] = dataRows[0] + ' 00:00:00';
                                dataRows[3] = dataRows[3] / dataRows[1];
                                if ( Number(dataRows[5]) !== 0 ){
                                    dataRows[6] = dataRows[6] / dataRows[5];
                                }
                            }
                            break;
                        default : break;
                    }

                    self.txnExecuteChart._chartOption.xaxis.timeformat = self.timeformat ;
                    self.txnElapseTimeChart._chartOption.xaxis.timeformat = self.timeformat ;
                    self.sqlElapseTimeChart._chartOption.xaxis.timeformat = self.timeformat ;

                    self.txnExecuteChart.addValues({
                        from: from,
                        to  : to,
                        time: 0,
                        data: adata.rows,
                        series: {
                            0 : 1,
                            1 : 2
                        }
                    });

                    self.txnElapseTimeChart.addValues({
                        from: from,
                        to  : to,
                        time: 0,
                        data: adata.rows,
                        series: {
                            0 : 4,
                            1 : 3
                        }
                    });

                    self.sqlElapseTimeChart.addValues({
                        from: from,
                        to  : to,
                        time: 0,
                        data: adata.rows,
                        series: {
                            0 : 7,
                            1 : 6
                        }
                    });


                    self.txnExecuteChart.plotDraw();
                    self.txnElapseTimeChart.plotDraw();
                    self.sqlElapseTimeChart.plotDraw();

                    self.txnElapseTimeChart.plotRedraw();
                    self.txnExecuteChart.plotRedraw();
                    self.sqlElapseTimeChart.plotRedraw();

                    self.chartTabPnl.loadingMask.hide();


                    self.trendChartDbClick() ;


                    /*
                     X 축 변경관련 : AddValues 처럼 min, max 값이 정해져 있을 때는 plotDraw()를
                     사용해야 하고, 그렇지 않은 경우에는 plotReDraw() 를 사용해도 무방.
                     */

                    break;
                case self.sql.txnElapse:

                    // Scatter Chart.
                    dataRows = adata.rows;

                    self.chartTabPnl.loadingMask.showMask();

                    for (ix = 0, ixLen = dataRows.length; ix < ixLen; ix++) {
                        xaxis = +new Date(dataRows[ix][0]);

                        if (dataRows[ix][4] == 0) {  /* Exception */
                            self.txnElapseChart.addValue(0, [xaxis, dataRows[ix][3]]);
                        }
                        else {
                            self.txnElapseChart.addValue(1, [xaxis, dataRows[ix][3]]);
                        }
                    }

                    self.txnElapseChart.plotDraw();
                    self.txnElapseChart.loadingMask.hide() ;
                    self.chartTabPnl.loadingMask.hide();

                    /*
                     * 처음 retrieve를 누르면 두번째탭(scatter차트)까지 보여주게 변경.
                     * init_flag를 두어 처음 retrieve를 누른 경우에 activeTab을 0으로 두게함.
                     * */
                    this.draw_txn = false ;
                    break;
                case self.sql.sqlElapse:

                    // Scatter Chart.
                    dataRows = adata.rows;

                    self.chartTabPnl.loadingMask.showMask();

                    for (ix = 0, ixLen = dataRows.length; ix < ixLen; ix++) {
                        xaxis = +new Date(dataRows[ix][0]);

                        self.sqlElapseChart.addValue(0, [xaxis, dataRows[ix][2]]);
                    }

                    self.sqlElapseChart.plotDraw();
                    self.sqlElapseChart.loadingMask.hide() ;
                    self.chartTabPnl.loadingMask.hide();

                    this.draw_sql = false ;
                    break;

                default:
                    self.chartTabPnl.loadingMask.hide();
                    break;
            }
        } else {

            if (aheader.command == self.sql.txnElapse) {

                self.txnElapseChart.clearAllSeires();
                self.txnElapseChart.plotDraw() ;
                console.info('txnElapse', 'no data');
                self.chartTabPnl.loadingMask.hide();
                self.txnElapseChart.loadingMask.hide() ;
                this.draw_txn = false ;


            } else if (aheader.command == self.sql.sqlElapse) {

                self.sqlElapseChart.clearAllSeires();
                self.sqlElapseChart.plotDraw() ;
                console.info('sqlElapse', 'no data');
                self.chartTabPnl.loadingMask.hide();
                self.sqlElapseChart.loadingMask.hide() ;
                this.draw_sql = false ;
            }

            console.info('OnChartData-callback', 'no data');
        }
    }

});
