Ext.define('view.TOPTransaction', {
    extend: 'Exem.FormOnCondition',
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql : {
        TOPTxnList_GroupAgent : 'IMXPA_TOPTransaction_TOPTxnList_GroupAgent.sql',
        TOPTxnList_GroupTxn   : 'IMXPA_TOPTransaction_TOPTxnList_GroupTxn.sql',
        // Total 아니어도 같은쿼리 사용 140617 HK -> 1511.11 뭔소리인지모르겠음.쿼리 차트와 그리드 각각으로 변경(min)
        ChartQuery : 'IMXPA_TOPTransaction_ChartQuery.sql',
        SQLList    : 'IMXPA_TOPTransaction_SQLList.sql'
    },
    autoScroll: true,
    topTxnList_Obj   : {},
    retrieveFlag : false,
    isLoading    : false,
    elapse_max_size : 2147483647,
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    init: function() {
        var self = this;

        self.setWorkAreaLayout('border');

        self.wasCombo = Ext.create('Exem.wasDBComboBox', {
            itemId         : 'wasCombo',
            width          : 350,
            comboWidth     : 230,
            comboLabelWidth: 60,
            multiSelect    : true,
            selectType     : common.Util.TR('Agent'),
            x              : 380,
            y              : 5
        });

        self.txnName_TextField = Ext.create('Exem.TextField', {
            fieldLabel : '',
            labelAlign : 'right',
            labelWidth : 150,
            allowBlank : false,
            value      : common.Util.TR('Transaction Name'),//'%',
            width      : 350,
            x          : 700,
            y          : 5 ,
            listeners: {
                focus: function() {
                    if (this.getValue() == common.Util.TR('Transaction Name')) {
                        this.setValue('%');
                    }
                },
                focusleave: function() {
                    if (this.getValue() == '%') {
                        this.setValue(common.Util.TR('Transaction Name'));
                    }
                }
            }
        });

        self.ElapseTime_NumberField = Ext.create('Exem.NumberField', {
            fieldLabel : common.Util.TR('Elapse Time (AVG) >='),
            //itemId    : 'ElapseTime_TextField',
            labelAlign: 'right',
            labelWidth: 170,
            labelSeparator: '',
            allowBlank: false,
            value     : 0,
            width     : 232,
            x         : 1000,
            y         : 5,
            maxLength : 10,
            maxValue: 2147483647,
            minValue: 0,
            enforceMaxLength:true,
            enableKeyEvents: true,
            listeners      :{
                keydown: function() {
                    var msg_str, cmp;
                    if (this.value > self.elapse_max_size) {
                        msg_str = common.Util.TR('Input value is exceeded.') + '<br>' + '<font-size = "2"> (' +  common.Util.TR('Input range') + ': 0~2147483647) </font-size>';
                        cmp = this;
                        self.ShowMessage( 'ERROR!!!', msg_str,Ext.Msg.OK, Ext.MessageBox.ERROR, function() {
                            cmp.focus();
                            cmp.setValue(0);
                        });
                    }
                }
            }
        });

        self.orderByRadioContainer = Ext.create('Exem.FieldContainer', {
            x           : 400,
            y           : 30,
            layout      : 'hbox',
            width       : 250,
            itemId      : 'orderByRadioContainer',
            defaultType : 'radiofield',
            defaults    : {flex: 1},
            items: [{
                width     : 100,
                boxLabel  : common.Util.TR('By Elapse Time'),
                name      : self.id + '_orderBytype',
                inputValue: 'txn_elapse_avg',
                checked   : true
            },{
                width     : 100,
                boxLabel  : common.Util.TR('By Execution Count'),
                name      : self.id + '_orderBytype',
                inputValue: 'txn_exec_count'
            }]
        });

        self.agentRetrieveRadioContainer = Ext.create('Exem.FieldContainer', {
            x           : 700,
            y           : 30,
            layout      : 'hbox',
            width       : 350,
            itemId      : 'agentRetrieveRadioContainer',
            defaultType : 'radiofield',
            defaults    : {flex: 1},
            items: [{
                width     : 175,
                boxLabel  : common.Util.TR('For each Agent Retrieve'),
                name      : self.id + '_retrieveType',
                inputValue: 'agent_each',
                checked   : true
            },{
                width     : 175,
                boxLabel  : common.Util.TR('Agent Integration Retrieve'),
                name      : self.id + '_retrieveType',
                inputValue: 'agent_integrate'
            }]
        });

        self.conditionArea.add(self.wasCombo);
        self.conditionArea.add(self.txnName_TextField);
        self.conditionArea.add(self.ElapseTime_NumberField);
        self.conditionArea.add(self.orderByRadioContainer);
        self.conditionArea.add(self.agentRetrieveRadioContainer);


        //작업 부분.

        //1. Tab 패널
        self.TOPtxnList_tabPanel = Ext.create('Exem.TabPanel', {
            region : 'north',
            layout : 'fit',
            height : '50%',
            split  : true,
            itemId : 'TOPtxnList_tabPanel',
            style: {
                'background': '#f6f6f6'//'#3e3e3e'
            },
            minHeight: 100,
            listeners: {
                render: function() {
                    this.setActiveTab(0);
                },
                tabchange: function(tabPanel, newCard) {
                    newCard.add(self.topTxnList_Grid);
                    self.topTxnList_Grid.clearRows();
                    self.ChartDetailGrid.clearRows();
                    self.left_txnList_Chart.clearValues();
                    self.left_txnList_Chart.plotDraw();
                    self.right_SQLList_Grid.clearRows();
                    self.condition_executeSQL();
                }
            }
        });

        //2. 하단 작업 부분
        self.bottom_txnDetail_Area = Ext.create('Exem.Panel', {
            region : 'center',
            layout : 'border',
            minHeight: 100,
            height : '50%',
            itemId : 'bottom_txnDetail_Area',
            title  : common.Util.TR('Transaction Detail')
        });

        var TotalTabPanel = Ext.create('Exem.Panel', {
            title    : common.Util.TR('Total'),
            itemId   : 'total',
            split    : true,
            layout   : 'fit'
        });

        self.TotalTabPanel = TotalTabPanel;
        self.TOPtxnList_tabPanel.add(self.TotalTabPanel);

        var topTxnList_Grid = Ext.create('Exem.BaseGrid', {
            layout : 'fit',
            //adjustGrid : true,
            itemclick: function(dv, record) {
                self.rowsData = record.data;
                self.GridselectRows();
            }
        });

        self.topTxnList_Grid = topTxnList_Grid;

        if (this.monitorType !== 'TP') {
            self.topTxnList_Grid.contextMenu.addItem({
                title : common.Util.TR('Transaction Summary'),
                itemId: 'Transaction_history',
                fn: function() {
                    var record = this.up().record,
                        active_tab = self.TOPtxnList_tabPanel.getActiveTab(),
                        txnHistory;

                    txnHistory = common.OpenView.open('TxnHistory', {
                        isWindow : false,
                        width    : 1200,
                        height   : 800,
                        fromTime : self.datePicker.getFromDateTime(),
                        toTime   : self.datePicker.getToDateTime(), // 10분 더하기
                        transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name']),
                        wasId    : active_tab.itemId === 'total' ? active_tab.itemId : null
                    });

                    setTimeout(function() {
                        txnHistory.retrieve();
                    }, 300);
                }

            }, 0);
        }

        TotalTabPanel.add(self.topTxnList_Grid);

        self.topTxnList_Grid.beginAddColumns();

        self.topTxnList_Grid.addColumn('TXN ID'                                                     , 'txn_id'           , 100, Grid.String , false, true);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction')                               , 'txn_name'         , 300, Grid.String , true , false);
        self.topTxnList_Grid.addColumn('WAS ID'                                                     , 'was_id'           , 100, Grid.String , false, true);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Agent')                                     , 'was_name'         , 130, Grid.String , false, false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Execution Count')               , 'txn_exec_count'   , 130, Grid.Number , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('SQL Execution Count')                       , 'sql_exec_count'   , 120, Grid.Number , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Fetch Count')                               , 'fetch_count'      , 80 , Grid.Number , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Elapse Time (Total)')           , 'txn_elapse'       , 150, Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Elapse Time (MAX)')             , 'txn_elapse_max'   , 150, Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Elapse Time (AVG)')             , 'txn_elapse_avg'   , 160, Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Elapse Time Standard Deviation'), 'txn_elapse_stddev', 110, Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction CPU TIME (MAX)')                , 'txn_cpu_time_max' , 110, Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction CPU TIME (AVG)')                , 'txn_cpu_time_avg' , 110, Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('SQL Elapse Time (Total)')                   , 'sql_elapse'       , 95 , Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('SQL Elapse Time (MAX)')                     , 'sql_elapse_max'   , 95 , Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('SQL Elapse Time (AVG)')                     , 'sql_elapse_avg'   , 95 , Grid.Float  , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Open Conn')                                 , 'open_conn'        , 60 , Grid.Number , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Close Conn')                                , 'close_conn'       , 60 , Grid.Number , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Open Stmt')                                 , 'open_stmt'        , 60 , Grid.Number , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Close Stmt')                                , 'close_stmt'       , 60 , Grid.Number , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Open RS')                                   , 'open_rs'          , 60 , Grid.Number , false, true);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Close RS')                                  , 'close_rs'         , 60 , Grid.Number , false, true);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Open Object')                               , 'open_object'      , 60 , Grid.Number , false, true);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Close Object')                              , 'close_object'     , 60 , Grid.Number , false, true);

        self.topTxnList_Grid.endAddColumns();

        // 하단 좌측 chart + grid 영역
        self.left_txnList_Chart_Background = Ext.create('Exem.Container',{
            region  :'west',
            layout  : 'vbox',
            split   : true,
            minWidth: 200,
            width   : '50%'
        });
        //2-1. 왼쪽 차트
        self.left_txnList_Chart = Ext.create('Exem.chart.CanvasChartLayer', {
            title        : common.Util.TR('Elapse Time & Execute Count'),
            layout       : 'fit',
            height       : '50%',
            minHeight    : 70,
            width        : '100%',
            itemId       : 'left_txnList_Chart',
            interval     : PlotChart.time.exTenMin,
            showTitle    : true,
            showLegend   : true,
            legendOrder  : PlotChart.legendOrder.exDesc,           // ------
            chartProperty  :{
                yaxes: [{
                    min : 0
                },{
                    position: 'right'
                }]
            },
            legendWidth   : 95,
            split         : true,

            showTooltip   : true,
            toolTipFormat : '[%s]%x [value:%y]',
            toolTipTimeFormat : '%m-%d %H:%M',

            showMaxValue  : false,
            // maxValueFormat : '%y',
            // maxValueAxisTimeFormat : '%H"%M',
            showIndicator : false,
            titleHeight   : 20
        });

        self.left_txnList_Chart.addSeries({
            id   : 'max_value',
            label : common.Util.CTR('MAX'),
            type : PlotChart.type.exBar
            // stack: true
        });

        //Chart Series 추가.
        self.left_txnList_Chart.addSeries({
            id    : 'avg_value',
            label : common.Util.CTR('AVG'),
            type  : PlotChart.type.exBar
            // stack : true
        });

        self.left_txnList_Chart.addSeries({
            id    : 'exec_count',
            label : common.Util.CTR('Execute Count'),
            point : true,
            type  : PlotChart.type.exLine,
            yaxis : 2,
            gridType : Grid.Number
        });




        // 좌측 Detail Grid
        self.ChartDetailGrid = Ext.create('Exem.BaseGrid',{
            width     : '100%',
            height    : '50%',
            minHeight : 70,
            localeType       : Comm.dateFormat.HMS,
            title     : common.Util.TR('Detail')
        });

        self.ChartDetailGrid.beginAddColumns();
        self.ChartDetailGrid.addColumn(common.Util.CTR('Time')                          , 'time'             , 130, Grid.DateTime,  true,  false);
        self.ChartDetailGrid.addColumn('WAS ID'                                         , 'was_id'           , 70 , Grid.StringNumber  ,  true,  true);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Agent')                         , 'was_name'         , 100, Grid.String  ,  true,  false);
        self.ChartDetailGrid.addColumn('Transaction ID'                                 , 'txn_id'           , 150, Grid.String  ,  false, true);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Transaction Name')              , 'txn_name'         , 200, Grid.String  ,  true,  false);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Transaction Elapse Time (MAX)') , 'txn_elapse_max'   , 150, Grid.Float   ,  true,  false);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Transaction Execution Count')   , 'txn_exec_count'   , 150, Grid.Number  ,  true,  false);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Transaction Elapse Time (AVG)') , 'txn_elapse_avg'   , 160, Grid.Float   ,  true,  false);
        self.ChartDetailGrid.endAddColumns();



        //2-2. 오른쪽 그리드
        self.right_SQLList_Grid = Ext.create('Exem.BaseGrid', {
            title  : common.Util.TR('SQL List'),
            region : 'center',
            itemId : 'right_SQLList_Grid',
            itemdblclick: function(dv, record) {
                self.GridRowsdbClick(record.data);
            }
        });

        self.right_SQLList_Grid.contextMenu.addItem({
            title : common.Util.TR('Full SQL Text'),
            itemId: 'sqlFullText',
            icon  : '',
            fn: function() {
                var targetRow = self.right_SQLList_Grid.pnlExGrid.getSelectionModel().getSelection()[0].data;

                self.GridRowsdbClick(targetRow);
            }
        }, 0);

        self.right_SQLList_Grid.beginAddColumns();

        self.right_SQLList_Grid.addColumn(common.Util.CTR('SQL Text')         , 'sql_text'      , 500, Grid.String, true,  false);
        self.right_SQLList_Grid.addColumn(common.Util.CTR('Elapse Time (MAX)'), 'max_elapse'    , 100, Grid.Float,  true,  false);
        self.right_SQLList_Grid.addColumn(common.Util.CTR('Elapse Time (AVG)'), 'avg_elapse'    , 100, Grid.Float,  true,  false);
        self.right_SQLList_Grid.addColumn(common.Util.CTR('Execute Count')    , 'sql_exec_count', 80,  Grid.Number, true,  false);
        self.right_SQLList_Grid.addColumn(common.Util.CTR('CPU Time')         , 'cpu_time'      , 80,  Grid.Float,  true,  false);
        self.right_SQLList_Grid.addColumn(common.Util.CTR('Wait Time')        , 'wait_time'     , 80,  Grid.Float,  true,  false);
        self.right_SQLList_Grid.addColumn(common.Util.CTR('Logical Reads')    , 'logical_reads' , 80,  Grid.Number, true,  false);
        self.right_SQLList_Grid.addColumn(common.Util.CTR('Physical Reads')   , 'physical_reads', 80,  Grid.Number, true,  false);
        self.right_SQLList_Grid.addColumn('SQL ID'           , 'sql_id'        , 100, Grid.String, false, true);
        self.right_SQLList_Grid.addColumn('TXN ID'           , 'txn_id'        , 100, Grid.String, false, true);

        self.right_SQLList_Grid.endAddColumns();

        self.left_txnList_Chart_Background.add(self.left_txnList_Chart, self.ChartDetailGrid);
        self.bottom_txnDetail_Area.add(self.left_txnList_Chart_Background, self.right_SQLList_Grid);


        self.workArea.add(self.TOPtxnList_tabPanel, self.bottom_txnDetail_Area);


        common.WebEnv.set_nondb(self.right_SQLList_Grid, false);
    },


    topTxnList_TabPanel_Add: function(id, name) {
        var tab_panel = this.TOPtxnList_tabPanel;

        //상단 Tab page에 Add
        var toptxnList_panel = Ext.create('Exem.Panel', {
            title  : name,
            //title  : common.Util.TR(name),   // LSM 15.08.21 Change By request
            itemId : id,
            layout : 'fit'
        });

        tab_panel.add(toptxnList_panel);
    } ,


    ShowMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : common.Util.TR(title),
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    },

    checkValid: function() {

        // txn_name, elapse_time조건에서 아무값없이 retrieve누르면 기본값채우고 ㄱㄱ
        var self = this,
            txn = self.txnName_TextField,
            txn_value = txn.getValue(),
            elapse =  self.ElapseTime_NumberField,
            elapse_value = elapse.getValue();

        if (txn_value == '') {
            txn.setValue('%');
            self.executeSQL();
            return false;
        }

        if (elapse_value == null || elapse_value > self.elapse_max_size || elapse_value < 0) {
            elapse.setValue(0);
            self.executeSQL();
            return false;
        }

        return true;

    },

    condition_executeSQL: function() {
        var self = this;

        var wasid   = null;
        var txnname = null;
        var wasList = this.wasCombo.getValue();

        var TOPTxnList_dataset = {};

        if (self.retrieveFlag) {
            wasid   = self.TOPtxnList_tabPanel.getActiveTab().itemId;

            if (self.txnName_TextField.getValue() ==  common.Util.TR('Transaction Name')) {
                txnname = '%';
            } else {
                txnname = self.txnName_TextField.getValue();
            }

            TOPTxnList_dataset.bind = [{
                name  : 'from_time',
                value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
                type: SQLBindType.STRING
            }, {
                name  : 'to_time',
                value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
                type: SQLBindType.STRING
            }, {
                name : 'txn_name',
                value: txnname,
                type: SQLBindType.STRING
            }, {
                name : 'elapse',
                value : self.ElapseTime_NumberField.getValue(),
                type: SQLBindType.FLOAT
            }];

            if (wasid == 'total') {
                TOPTxnList_dataset.replace_string = [{
                    name  : 'was_id',
                    value : wasList
                }, {
                    name : 'order',
                    value : self.orderByRadioContainer.getCheckedValue()
                }];
            } else {
                TOPTxnList_dataset.replace_string = [{
                    name  : 'was_id',
                    value : wasid
                }, {
                    name : 'order',
                    value : self.orderByRadioContainer.getCheckedValue()
                }];
            }

            if (this.agentRetrieveRadioContainer.getCheckedValue() === 'agent_each') {
                TOPTxnList_dataset.sql_file = self.sql.TOPTxnList_GroupAgent;
            } else {
                TOPTxnList_dataset.sql_file = self.sql.TOPTxnList_GroupTxn;
            }


            WS.SQLExec(TOPTxnList_dataset, self.onData, self );


            if (self.orderByRadioContainer.getCheckedValue() == common.Util.TR('txn_elapse_avg')) {
                self.topTxnList_Grid.setOrderAct('txn_elapse_avg', 'DESC');
            } else {
                self.topTxnList_Grid.setOrderAct('txn_exec_count', 'DESC');
            }
        }

    },

    executeSQL: function() {
        var self = this;
        var wasIds;
        var ix, ixLen;
        var columnList = this.topTxnList_Grid.pnlExGrid.headerCt.getGridColumns();

        if (!self.isLoading) {
            self.isLoading = true;
            self.loadingMask.showMask();
        } else {
            return;
        }

        this.TOPtxnList_tabPanel.setActiveTab(0);

        self.topTxnList_Grid.clearRows();
        self.right_SQLList_Grid.clearRows();
        self.left_txnList_Chart.clearValues();
        self.ChartDetailGrid.clearRows();

        self.TOPtxnList_tabPanel.suspendLayouts();

        for (ix = this.TOPtxnList_tabPanel.items.length; ix > 1; ix--) {
            this.TOPtxnList_tabPanel.items.items[1].destroy();
        }

        if (this.agentRetrieveRadioContainer.getCheckedValue() === 'agent_each') {
            wasIds = this.wasCombo.getValue();
            wasIds = wasIds.split(',');
            for (ix = 0, ixLen = wasIds.length; ix < ixLen; ix++) {
                self.wasId   = wasIds[ix];
                self.wasName = Comm.RTComm.getServerNameByID(wasIds[ix]);
                self.topTxnList_Obj[self.wasName] = self.topTxnList_TabPanel_Add(wasIds[ix], self.wasName);
            }

            for (ix = 0, ixLen = columnList.length; ix < ixLen; ix++) {
                if (columnList[ix].dataIndex === 'was_name') {
                    columnList[ix].colvisible = true;
                    columnList[ix].setVisible(true);
                }
            }
        } else {
            for (ix = 0, ixLen = columnList.length; ix < ixLen; ix++) {
                if (columnList[ix].dataIndex === 'was_name') {
                    columnList[ix].colvisible = false;
                    columnList[ix].setVisible(false);
                }
            }
        }
        self.TOPtxnList_tabPanel.resumeLayouts();
        self.TOPtxnList_tabPanel.doLayout();
        self.retrieveFlag = true;

        self.condition_executeSQL();

    },

    //TOP Txn List 그리드에서 선택 된 Row 를 Bottom 영역에서 보여주기.
    GridselectRows: function() {
        var self = this;
        var txn_dataset = {};
        var wasid;

        if (!self.isLoading) {
            self.left_txnList_Chart_Background.loadingMask.showMask();
            self.right_SQLList_Grid.loadingMask.showMask();
        }

        if (this.agentRetrieveRadioContainer.getCheckedValue() === 'agent_each') {
            wasid = this.topTxnList_Grid.getSelectedRow()[0].data['was_id'];
        } else {
            wasid = this.wasCombo.getValue();
        }

        txn_dataset.sql_file = self.sql.ChartQuery;

        var txn_id = self.rowsData['txn_id'];

        self.left_txnList_Chart.clearValues();
        self.right_SQLList_Grid.clearRows();
        self.ChartDetailGrid.clearRows();

        //bind값 넣어줌.
        txn_dataset.bind = [{
            name  : 'from_time',
            value :Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type  : SQLBindType.STRING
        }, {
            name  : 'to_time',
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type  : SQLBindType.STRING
        },{
            name : 'txn_id',
            value: txn_id,
            type  : SQLBindType.STRING
        }];

        txn_dataset.replace_string = [{
            name  : 'was_id',
            value : wasid
        }];

        //차트 실행
        WS.SQLExec(txn_dataset, self.onChartData, self);

        //SQL Text 그리드 실행
        txn_dataset.sql_file = self.sql.SQLList;
        WS2.SQLExec(txn_dataset, self.onData, self);
    },


    // 우측 그리드를 클릭했을 경우
    GridRowsdbClick: function(data) {
        var self = this,
            bind_sql_text;

        // Window 팝업 뜰 때 사라짐..
        self.right_SQLList_Grid.loadingMask.showMask();

        self.sql_id = null;
        self.txn_id = null;

        var sql_id = data['sql_id'];
        var txn_id = data['txn_id'];

        var was_id;
        var active_tab = self.TOPtxnList_tabPanel.getActiveTab();
        if (active_tab.itemId === 'total') {
            was_id = this.wasCombo.getValue();
        } else {
            was_id = active_tab.itemId;
        }


        bind_sql_text = Ext.create('view.FullSQLText_TOP10');
        bind_sql_text.arr_dt['sql_id']    = sql_id;
        bind_sql_text.arr_dt['txn_id']    = txn_id;
        bind_sql_text.arr_dt['was_id']    = was_id;
        bind_sql_text.arr_dt['from_time'] = Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00';
        bind_sql_text.arr_dt['to_time']   = Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00';

        bind_sql_text.loading_grd         = self.right_SQLList_Grid;
        bind_sql_text.init();
    },


    onDrawGridTOPTxnList_Agent: function(adata) {
        //TOP Transaction List 뿌려주기.
        var self = this,
            ix, ixLen;

        self.topTxnList_Grid.clearRows();
        self.right_SQLList_Grid.clearRows();

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            self.topTxnList_Grid.addRow([
                adata.rows[ix][0]      // txn_id
                ,adata.rows[ix][1]     // txn_name
                ,adata.rows[ix][2]     // was_id
                ,adata.rows[ix][3]     // was_name
                ,adata.rows[ix][4]     // txn_exec_count
                ,adata.rows[ix][11]    // sql_exec_count
                ,adata.rows[ix][15]    // fetch_count
                ,adata.rows[ix][5]     // txn_elapse
                ,adata.rows[ix][6]     // txn_elapse_max
                ,adata.rows[ix][7]     // txn_elapse_avg
                ,adata.rows[ix][8]     // txn_elapse_stddev
                ,adata.rows[ix][9]     // txn_cpu_time_max
                ,adata.rows[ix][10]     // txn_cpu_time_avg
                ,adata.rows[ix][12]    // sql_elapse
                ,adata.rows[ix][13]    // sql_elapse_max
                ,adata.rows[ix][14]    // sql_elapse_avg
                ,adata.rows[ix][16]    // open_conn
                ,adata.rows[ix][17]    // close_conn
                ,adata.rows[ix][18]    // open_stmt
                ,adata.rows[ix][19]    // close_stmt
                ,adata.rows[ix][20]    // open_rs
                ,adata.rows[ix][21]    // close_rs
                ,adata.rows[ix][22]    // open_object
                ,adata.rows[ix][23]    // close_object
            ]);
        }
        self.topTxnList_Grid.drawGrid();
        if (adata.rows.length > 0) {
            self._gridClick(self.topTxnList_Grid.pnlExGrid, 0);
        } else {
            self.left_txnList_Chart.plotDraw();
        }

        if (self.isLoading) {
            self.loadingMask.hide();
            self.isLoading = false;
        }
    },

    onDrawGridTOPTxnList_Txn: function(adata) {
        //TOP Transaction List 뿌려주기.
        var self = this,
            ix, ixLen;

        self.topTxnList_Grid.clearRows();
        self.right_SQLList_Grid.clearRows();

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            self.topTxnList_Grid.addRow([
                adata.rows[ix][0]      // txn_id
                ,adata.rows[ix][1]     // txn_name
                ,''                    // was_id
                ,''                    // was_name
                ,adata.rows[ix][2]     // txn_exec_count
                ,adata.rows[ix][9]     // sql_exec_count
                ,adata.rows[ix][13]    // fetch_count
                ,adata.rows[ix][3]     // txn_elapse
                ,adata.rows[ix][4]     // txn_elapse_max
                ,adata.rows[ix][5]     // txn_elapse_avg
                ,adata.rows[ix][6]     // txn_elapse_stddev
                ,adata.rows[ix][7]     // txn_cpu_time_max
                ,adata.rows[ix][8]     // txn_cpu_time_avg
                ,adata.rows[ix][10]    // sql_elapse
                ,adata.rows[ix][11]    // sql_elapse_max
                ,adata.rows[ix][12]    // sql_elapse_avg
                ,adata.rows[ix][14]    // open_conn
                ,adata.rows[ix][15]    // close_conn
                ,adata.rows[ix][16]    // open_stmt
                ,adata.rows[ix][17]    // close_stmt
                ,adata.rows[ix][18]    // open_rs
                ,adata.rows[ix][19]    // close_rs
                ,adata.rows[ix][20]    // open_object
                ,adata.rows[ix][21]    // close_object
            ]);
        }
        self.topTxnList_Grid.drawGrid();
        if (adata.rows.length > 0) {
            self._gridClick(self.topTxnList_Grid.pnlExGrid, 0);
        } else {
            self.left_txnList_Chart.plotDraw();
        }

        if (self.isLoading) {
            self.loadingMask.hide();
            self.isLoading = false;
        }
    },

    onDrawGridSQLTextList: function(adata) {
        var self = this,
            cpuTime, ix, ixLen;
        self.right_SQLList_Grid.clearRows();

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            cpuTime = adata.rows[ix][4] > 0 ? adata.rows[ix][4] : 0;

            self.right_SQLList_Grid.addRow([
                adata.rows[ix][0]        // sql_text
                ,adata.rows[ix][1]       // max_elapse
                ,adata.rows[ix][2]       // avg_elapse
                ,adata.rows[ix][3]       // sql_exec_count
                ,cpuTime                 // cpu_time
                ,adata.rows[ix][5]       // wait_Time
                ,adata.rows[ix][6]       // logical_reads
                ,adata.rows[ix][7]       // physical_reads
                ,adata.rows[ix][8]       // sql_id
                ,adata.rows[ix][9]       // txn_id
            ]);
        }

        self.right_SQLList_Grid.drawGrid();
    },

    onData: function(aheader, adata) {
        var self = this;
        var command = aheader.command;

        if (self.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(aheader, adata)) {
            if (command == self.sql.TOPTxnList_GroupAgent || command == self.sql.TOPTxnList_GroupTxn) {
                if (self.isLoading) {
                    self.loadingMask.hide();
                    self.isLoading = false;

                    self.left_txnList_Chart.clearValues();
                    self.left_txnList_Chart.plotDraw();
                } else if (self.right_SQLList_Grid.isLoading) {
                    self.right_SQLList_Grid.loadingMask.hide();
                }
            } else if (command == self.sql.SQLList) {
                if (self.right_SQLList_Grid.isLoading) {
                    self.right_SQLList_Grid.loadingMask.hide();
                }
            } else {
                self.loadingMask.hide();
            }

            console.warn('TOPTransaction-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        switch (command) {
            case self.sql.TOPTxnList_GroupAgent:
                self.onDrawGridTOPTxnList_Agent(adata);
                break;

            case self.sql.TOPTxnList_GroupTxn:
                self.onDrawGridTOPTxnList_Txn(adata);
                break;

            case self.sql.SQLList :
                self.onDrawGridSQLTextList(adata);

                if (self.right_SQLList_Grid.isLoading) {
                    self.right_SQLList_Grid.loadingMask.hide();
                }
                break;

            default :
                break;
        }

        self.loadingMask.hide();
    },


    DrawDetailGrid: function(data) {
        var self = this,
            ix, ixLen;

        self.ChartDetailGrid.clearRows();
        if (data.rows.length == 0) {
            self.left_txnList_Chart_Background.loadingMask.hide();
        }

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            self.ChartDetailGrid.addRow([
                data.rows[ix][ 0]
                ,data.rows[ix][ 1]
                ,data.rows[ix][ 2]
                ,data.rows[ix][ 3]
                ,data.rows[ix][ 4]
                ,data.rows[ix][ 5]
                ,data.rows[ix][ 6]
                ,data.rows[ix][ 7]
            ]);
        }

        self.left_txnList_Chart_Background.loadingMask.hide();
        self.ChartDetailGrid.drawGrid();
    },

    onChartData: function(header, data) {
        var self = this;

        var param;
        var row = [];
        var TOPtxnStore = [];
        var time = '';

        var max  = 0;
        var avg  = 0;
        var exec = 0;

        if (self.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            self.left_txnList_Chart_Background.loadingMask.hide();

            console.warn('TOPTransaction-onChartData');
            console.warn(header);
            console.warn(data);
            return;
        }

        param = header.parameters;

        // total tab에서 실행 했을 경우
        var i;
        if (header.command == self.sql.ChartQuery) {
            for (i = 0; i < data[0].rows.length; i++) {
                if (time !== data[0].rows[i][0]) {
                    if (time !== '') {
                        TOPtxnStore.push(row);
                        row = [];
                    }

                    avg  = data[0].rows[i][5];
                    max  = data[0].rows[i][3];
                    exec = data[0].rows[i][4];
                    time = data[0].rows[i][0];
                } else {
                    avg  += data[0].rows[i][5];
                    max  += data[0].rows[i][3];
                    exec += data[0].rows[i][4];
                }

                row[0] = data[0].rows[i][0];
                row[1] = avg;
                row[2] = max;
                row[3] = exec;
            }
            if (row.length !== 0) {
                TOPtxnStore.push(row);
            }
            self.DrawDetailGrid(data[1]);
        }

        self.left_txnList_Chart.addValues({
            from    : param.bind[0].value,
            to      : param.bind[1].value,
            interval: 600000,
            time    : 0,
            data    : TOPtxnStore,
            series  : {
                0: 2,
                1: 1,
                2: 3
            }
        });

        self.left_txnList_Chart.plotDraw();

        self.left_txnList_Chart_Background.loadingMask.hide();
    },

    _gridClick: function(grid, idx) {
        grid.getView().getSelectionModel().select(idx);
        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
    }

});