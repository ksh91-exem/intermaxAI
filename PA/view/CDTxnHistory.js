Ext.define("view.CDTxnHistory", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        summary   : 'IMXPA_CDTxnHistory_summary.sql',
        gridClick : 'IMXPA_CDTxnHistory_gridClick.sql',
        txnElapse : 'IMXPA_CDTxnHistory_txnElapse.sql',
        txnDrag   : 'IMXPA_CDTxnHistory_txnDrag.sql'
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

        self.draw_txn = false;

        self.setWorkAreaLayout('border');

        self.createConditionLayout();
        self.createWorkGridLayout();
        self.createWorkChartLayout();

        self.workArea.add(self.summaryArea, self.chartArea);

        self.chartTabPnl.setActiveTab(0);
    },

    createConditionLayout: function() {
        var self = this,
            setFromTime, setToTime,
            groupStore;

        self.radioType = 2;
        self.retrieveFlag = false;
        self.init_flag = false;

        setFromTime = Ext.util.Format.date(this.datePicker.getFromDateTime(), Comm.dateFormat.HM);
        setToTime   = Ext.util.Format.date(this.datePicker.getToDateTime(), Comm.dateFormat.HM);

        setFromTime = setFromTime.substr(0, setFromTime.length - 1) + '0';
        setToTime   = setToTime.substr(0, setToTime.length - 1) + '0';

        this.datePicker.mainFromField.setValue(setFromTime);
        this.datePicker.mainToField.setValue(setToTime);

        groupStore = Ext.create('Ext.data.Store', {
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

        self.conditionArea.add(self.wasField, self.txnNameTF, self.groupCombo);
        self.wasField.init();
    },

    createWorkGridLayout: function() {
        var self = this;

        self.summaryArea = Ext.create('Exem.Panel', {
            title  : common.Util.TR('Summary'),
            layout : 'fit',
            minHeight: 150,
            region : 'north',
            split  : true,
            height : '30%'
        });

        self.initSummaryGrid();
        self.summaryArea.add(self.summaryGrid);
    },

    createWorkChartLayout: function() {
        var self = this,
            chartTab, trendLineChartArea, elapseScatterChartArea,
            elapseScatterTitleArea, elapseScatterTitle, elapseScatterSpace;

        var elapseScatterTitleHeight = 30,
            elapseScatterTtleFontSize = '16px';

        // Bottom Chart Area
        self.chartArea = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'fit',
            style : 'overflow-y: auto; overflow-x: hidden;',
            region: 'center'
        });

        // Chart Tab - [LineChart/ScatterChart , TxnDetailListGrid]
        self.chartTabPnl = Ext.create('Exem.TabPanel', {
            width : '100%',
            height : '100%',
            layout  : 'fit',
            itemId : 'chartTabPnl',
            minHeight : 480,
            listeners: {
                tabchange: function(tabpnl, nv){
                    if ( nv.title == common.Util.TR('Transaction Trend') ){
                        self.txnElapseChart.plotDraw();
                    }else{
                        self.txnElapseTimeChart.plotRedraw();
                        self.txnExecuteChart.plotRedraw();
                    }
                }
            }
        });

        // LineChart-ScatterChart
        chartTab = Ext.create('Exem.Container', {
            title  : common.Util.TR('Trend Chart'),
            width  : '100%',
            height : '100%',
            layout : 'hbox',
            style  : 'background : #E8E8E8;'
        });

        // Left Line Chart Area
        trendLineChartArea = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            flex  : 0.5
        });

        this.initTxnElapseChart();  // Create Line Chart

        //Right Scatter Chart Area
        elapseScatterChartArea = Ext.create('Exem.Container', {
            layout : 'vbox',
            minWidth : 300,
            flex   : 0.5,
            style  : {'background-color' : '#fff'}
        });

        // Elapse Scatter Chart - Title [Title, spacer Exception Radio]
        elapseScatterTitleArea = Ext.create('Exem.Container', {
            layout : 'hbox',
            width  : '100%',
            height : elapseScatterTitleHeight,
            padding: '0, 10, 0, 20',
            style  : {
                'font-size' : elapseScatterTtleFontSize,
                'text-indent' : 20
            }
        });

        elapseScatterTitle = Ext.create('Ext.form.Label', {
            width : 150,
            text : common.Util.TR('Transaction Elapse Time'),
            style : 'font-size : 14px;'
        });

        elapseScatterSpace = Ext.create('Ext.toolbar.Spacer', {
            flex : 1
        });

        self.elapseScatterRdoGroup = Ext.create('Exem.FieldContainer', {
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

        // Elapse Scatter Chart - Chart Contents
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
                self.dragScatterChart(pos);
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

        // Left Line Chart
        trendLineChartArea.add(self.txnExecuteChart, {xtype: 'splitter'}, self.txnElapseTimeChart);
        // Right Scatter Chart
        elapseScatterTitleArea.add(elapseScatterTitle, elapseScatterSpace, self.elapseScatterRdoGroup);
        elapseScatterChartArea.add(elapseScatterTitleArea, self.txnElapseChart);

        chartTab.add(trendLineChartArea, {xtype: 'splitter'}, elapseScatterChartArea);
        self.chartTabPnl.add(chartTab);
        self.chartArea.add(self.chartTabPnl);

    },

    initSummaryGrid : function(){
        var self = this,
            microSign = ' (' + decodeURI('%C2%B5') + 's)';

        self.summaryGrid = Ext.create('Exem.BaseGrid', {
            localeType: 'Y-m-d H:i',
            gridName  : 'pa_cd_txnhistory_summary_grid',
            itemclick: function(dv, record) {
                self.summarySelectRow(record.data);
            }
        });

        self.summaryGrid.beginAddColumns();
        self.summaryGrid.addColumn(common.Util.CTR('Time'),                          'TIME',           120, Grid.DateTime,     true,  false);
        self.summaryGrid.addColumn(common.Util.CTR('Agent'),                         'was_name',       120, Grid.String,       true,  false);
        self.summaryGrid.addColumn('WAS ID',                                         'was_id',         100, Grid.StringNumber, false, true);
        self.summaryGrid.addColumn('TXN ID',                                         'txn_id',         100, Grid.String,       false, true);
        self.summaryGrid.addColumn(common.Util.CTR('Transaction'),                   'txn_name',       350, Grid.String,       true,  false);
        self.summaryGrid.addColumn(common.Util.CTR('Transaction Execution Count'),   'txn_exec_count', 150, Grid.Number,       true,  false);
        self.summaryGrid.addColumn(common.Util.CTR('Elapse Time (MAX)') + microSign, 'max_txn_elapse', 200, Grid.Number,       true,  false);
        self.summaryGrid.addColumn(common.Util.CTR('Elapse Time (AVG)') + microSign, 'avg_txn_elapse', 200, Grid.Float,        true,  false);
        self.summaryGrid.addColumn(common.Util.CTR('Exception'),                     'EXCEPTION',      100, Grid.Number,       true,  false);
        self.summaryGrid.addColumn('Time',                                           'TIME_TEMP',      100, Grid.DateTime,     false, true);
        self.summaryGrid.endAddColumns();

        self.summaryGrid.loadLayout(self.summaryGrid.gridName);

        self.summaryGrid.contextMenu.addItem({
            title: common.Util.TR('Transaction Summary'),
            fn: function() {
                var record = this.up().record;

                self.groupByValue = self.groupCombo.getValue();
                var fromTime = Ext.util.Format.date(record['TIME'], Comm.dateFormat.HM);
                var toTime;
                switch(self.groupByValue) {
                    case '0':
                        toTime = Ext.util.Format.date(common.Util.getDate(+new Date(record['TIME']) + 1200000), Comm.dateFormat.HM);
                        break;
                    case '1':
                        toTime = Ext.util.Format.date(common.Util.getDate(+new Date(record['TIME']) + 3600000), Comm.dateFormat.HM);
                        break;
                    case '2':
                        record['TIME'] += ' 00:00:00';
                        fromTime = Ext.util.Format.date(record['TIME'], Comm.dateFormat.HM);
                        toTime = Ext.util.Format.date(common.Util.getDate(+new Date(record['TIME']) + 86400000), Comm.dateFormat.HM);
                        break;
                    default :
                        break;
                }

                var txnHistory = common.OpenView.open('CDTxnHistory', {
                    monitorType  : 'CD',
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

    initTxnElapseChart : function(){

        var self = this;

        var txnHistoryTitleHeight = 30;

        self.txnExecuteChart = Ext.create('Exem.chart.CanvasChartLayer', {
            width  : '100%',
            height : '100%',
            flex   : 0.5,
            layout : 'fit',
            title  : common.Util.TR('Transaction Execution Count'),
            split  : true,
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
                if (self.retrieveFlag) {

                    if (!xAxis) {
                        return;
                    }

                    self.txnElapseTimeChart.drawIndicator(xAxis);

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
            type  : PlotChart.type.exLine,
            point : true
        });
        self.txnExecuteChart.addSeries({
            id    : 'exception',
            label : common.Util.CTR('Exception'),
            type  : PlotChart.type.exLine,
            point : true
        });

        self.txnElapseTimeChart = Ext.create('Exem.chart.CanvasChartLayer', {
            width  : '100%',
            height : '100%',
            flex   : 0.5,
            layout : 'fit',
            title  : common.Util.TR('Transaction Elapse Time'),
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
            type  : PlotChart.type.exLine,
            point : true
        });
        self.txnElapseTimeChart.addSeries({
            id    : 'avg',
            label : common.Util.CTR('AVG'),
            type  : PlotChart.type.exLine,
            point : true
        });

    },

    _chartHide: function() {
        var self = this;

        var detailListTab = self.chartTabPnl.getComponent('detailListTab');

        if (detailListTab) {
            detailListTab.tab.hide();
            detailListTab.hide();
        }
    },

    _summaryGridDraw: function() {
        var self = this;

        self.summaryGrid.clearRows();

        var dataset = {};
        self.txn_name = self.txnNameTF.getValue() ;

        if ( self.txn_name == common.Util.TR('Transaction Name') ) {
            self.txn_name = '%' ;
        }
        self.txn_name  = '\''+self.txn_name +'\'' ;


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
            name : 'cb_idx',
            value : '\''+self.groupByValue + '\''
        }];

        dataset.sql_file = self.sql.summary;
        WS.SQLExec(dataset, self.onData, self);
    },

    // 시작지점 Flag- txnElpase
    dragScatterChart: function(pos) {
        var self = this;
        var xfrom, xto,
            fromTime, toTime;
        var txnDataset = {};
        var microSign = ' (' + decodeURI('%C2%B5') + 's)';

        var detailListTab = self.chartTabPnl.getComponent('detailListTab');

        if (detailListTab) {
            detailListTab.tab.show();
            detailListTab.show();
        }


        xfrom = pos.xaxis.from;
        xto   = pos.xaxis.to;
        if (xfrom == xto) {
            return;
        }

        fromTime = common.Util.getDate(xfrom);
        toTime = common.Util.getDate(xto);

        if (!self.detailListTab) {
            self.detailListTab = Ext.create('Exem.Container', {
                width : '100%',
                height : '100%',
                itemId : 'detailListTab',
                layout : 'fit',
                title  : common.Util.TR('Transaction')
            });
            self.chartTabPnl.add(self.detailListTab);
        } else {
            self.detailListTab.removeAll();
        }

        self.chartTabPnl.setActiveTab(1);

        self.detailListGrid = Ext.create('Exem.BaseGrid', {
            width : '100%',
            height : '100%',
            layout : 'fit',
            defaultPageSize : 26,
            localeType: 'Y-m-d H:i:s:u',
            gridName  : 'pa_cd_txnhistory_detail_grid'
        });

        self.detailListGrid.loadingMask.show() ;
        // txnElapse 드래그

        self.detailListGrid.beginAddColumns();
        self.detailListGrid.addColumn(common.Util.CTR('Time'),                     'time',           200, Grid.DateTime, true,  false);
        self.detailListGrid.addColumn(common.Util.CTR('Agent'),                    'was_name',       250, Grid.String,   true,  false);
        self.detailListGrid.addColumn(common.Util.CTR('Transaction Code'),         'txn_code',       150, Grid.String,   true,  false);
        self.detailListGrid.addColumn(common.Util.CTR('Start Time'),               'start_time',     200, Grid.DateTime, true,  false);
        self.detailListGrid.addColumn(common.Util.CTR('Elapsed Time') + microSign, 'elapse_time',    110, Grid.Number,   true,  false);
        self.detailListGrid.addColumn(common.Util.CTR('Exception'),                'exception_type', 200, Grid.String,   true,  false);
        self.detailListGrid.addColumn('WAS ID',                                    'was_id',         135, Grid.Number,   false, true);
        self.detailListGrid.addColumn('TID',                                       'tid',            155, Grid.String,   false, false);
        self.detailListGrid.addColumn('TXN ID',                                    'txn_id',         155, Grid.String,   false, true);
        self.detailListGrid.addColumn('Exception Count',                           'exception',      155, Grid.Number,   false, true);

        self.detailListGrid.endAddColumns();

        self.detailListGrid.loadLayout(self.detailListGrid.gridName);

        self.detailListGrid.addRenderer('exception_type', this.exceptionRenderer.bind(this) , RendererType.bar) ;


        self.detailListTab.add(self.detailListGrid);
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


        txnDataset.sql_file = self.sql.txnDrag;
        WS.SQLExec(txnDataset, self.onData, self);

    },

    exceptionRenderer: function(value, meta, record) {
        var customCellDOM;

        if (record.data.exception >0 && meta.column.dataIndex == 'exception_type'){
            meta.style="background-color:lightcoral;";
        }

        customCellDOM = '<div data-qtip="' + value + '">'+ value +'</div>';

        return customCellDOM;
    },

    exceptionTypeProc : function(data) {
        var retExceptionText = '',
            exceptionCnt = data[8],
            exceptionType = data[4];

        if(exceptionCnt > 0 && exceptionType == '') {
            retExceptionText = 'UnCaught Exception';
        } else {
            retExceptionText = exceptionType;
        }


        return retExceptionText;
    },

    trendChartDbClick: function() {

        if (this.draw_txn){
            this.showMessage(common.Util.TR('ERROR'), 'SQL is running', Ext.Msg.OK, Ext.MessageBox.ERROR, function(){

            });
            return ;
        }

        var self = this;
        var dataTime;
        var time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        if (time_zone > 0) {
            time_zone = '+' + time_zone;
        }

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

        self.txnElapseChart.clearAllSeires();
        self.txnElapseChart.plotRedraw();


        var fromTime = common.Util.getDate(dataTime),
            toTime,
            txnElapseDataset = {};

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
        txnElapseDataset.replace_string = [{
            name: 'time_zone', value: time_zone
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

        self.chartTabPnl.setActiveTab(0);

        if (!self.isLoading)
            self.chartTabPnl.loadingMask.showMask();

        self._chartHide();

        self.txnExecuteChart.clearAllSeires();
        self.txnElapseTimeChart.clearAllSeires();
        self.txnElapseChart.clearAllSeires();

        self.txnExecuteChart.plotRedraw();
        self.txnElapseTimeChart.plotRedraw();
        self.txnElapseChart.plotRedraw();


        if (self.detailListGrid) {
            self.detailListGrid.clearRows();
        }


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


        if (self.chartTabPnl.isLoading || this.draw_txn) {
            return;
        }

        self.retrieveFlag = true;
        self.txn_id = null;
        self.init_flag = true ;

        self._chartHide();

        self.txnExecuteChart.clearValues();
        self.txnElapseTimeChart.clearValues();
        self.txnElapseChart.clearValues();

        self.txnExecuteChart.clearAllSeires();
        self.txnElapseTimeChart.clearAllSeires();
        self.txnElapseChart.clearAllSeires();

        self.txnExecuteChart.plotRedraw();
        self.txnElapseTimeChart.plotRedraw();
        self.txnElapseChart.plotRedraw();

        self.loadingMask.showMask();

        if (self.detailListGrid)
            self.detailListGrid.clearRows();

        self.groupByValue = self.groupCombo.getValue();

        var chageTimeFormat = null;
        switch(self.groupByValue) {
            case "0":
                chageTimeFormat = 'Y-m-d H:i';
                self.txnExecuteChart.interval = PlotChart.time.exTenMin ;
                self.txnElapseTimeChart.interval = PlotChart.time.exTenMin ;
                break;
            case "1":
                chageTimeFormat = 'Y-m-d H';
                self.txnExecuteChart.interval = PlotChart.time.exHour ;
                self.txnElapseTimeChart.interval = PlotChart.time.exHour ;
                break;
            case "2":
                chageTimeFormat = 'Y-m-d';
                self.txnExecuteChart.interval = PlotChart.time.exDay ;
                self.txnElapseTimeChart.interval = PlotChart.time.exDay ;
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
        var dataRows, exceptionType;
        var ix, ixLen;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            if(command != self.sql.summary && self.detailListGrid != undefined){
                self.detailListGrid.loadingMask.hide();
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
                             dataRows[0]               // time (combobox)
                            ,dataRows[1]               // was_name
                            ,dataRows[2]               // was_id
                            ,dataRows[3]               // txn_id
                            ,dataRows[4]               // business_name
                            ,dataRows[5]               // txn_exec_count
                            ,dataRows[6]               // txn_elapse_us_max
                            ,dataRows[7]               // txn_elapse_us_avg
                            ,dataRows[8]               // EXCEPTION
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
                        exceptionType = this.exceptionTypeProc(dataRows);

                        self.detailListGrid.addRow([
                             dataRows[0]             // time
                            ,dataRows[1]             // was_name
                            ,dataRows[9]             // txn_code
                            ,dataRows[2]             // start_time
                            ,dataRows[3]             // txn_elapse_us
                            ,exceptionType           // exception_type
                            ,dataRows[5]             // was_id
                            ,dataRows[6]             // tid
                            ,dataRows[7]             // txn_id
                            ,dataRows[8]             // exception
                        ]);
                    }

                    self.detailListGrid.drawGrid();
                    self.detailListGrid.loadingMask.hide() ;

                    break;
                default : break;
            }
        }
        else {
            if ( self.detailListGrid != undefined ){
                self.detailListGrid.loadingMask.hide() ;
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

        if (command == self.sql.txnElapse) {
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
                    switch (self.groupByValue){
                        case "0": /* 10 분 */
                            self.interval = 600000;
                            self.timeformat = '%H:%M';
                            break;
                        case "1": /* 1 시간 */
                            self.interval = 3600000;
                            self.timeformat = '%d %H';

                            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                                dataRows = adata.rows[ix];
                                dataRows[0] = dataRows[0] + ':00:00';
                            }
                            break;
                        case "2": // 하루
                            self.interval = 86400000;
                            self.timeformat = '%d';

                            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                                dataRows = adata.rows[ix];
                                dataRows[0] = dataRows[0] + ' 00:00:00';
                            }
                            break;
                        default : break;
                    }

                    self.txnExecuteChart._chartOption.xaxis.timeformat = self.timeformat ;
                    self.txnElapseTimeChart._chartOption.xaxis.timeformat = self.timeformat ;

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


                    self.txnExecuteChart.plotDraw();
                    self.txnElapseTimeChart.plotDraw();

                    self.txnElapseTimeChart.plotRedraw();
                    self.txnExecuteChart.plotRedraw();


                    self.chartTabPnl.loadingMask.hide();

                    self.trendChartDbClick();
                    break;
                case self.sql.txnElapse:

                    // Scatter Chart.
                    dataRows = adata.rows;

                    self.chartTabPnl.loadingMask.showMask();

                    for (ix = 0, ixLen = dataRows.length; ix < ixLen; ix++) {
                        xaxis = +dataRows[ix][0];

                        if (dataRows[ix][2] == 0) {  /* Exception */
                            self.txnElapseChart.addValue(0, [xaxis, dataRows[ix][1]]);
                        }
                        else {
                            self.txnElapseChart.addValue(1, [xaxis, dataRows[ix][1]]);
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


            }
            console.info('OnChartData-callback', 'no data');
        }
    }

});
