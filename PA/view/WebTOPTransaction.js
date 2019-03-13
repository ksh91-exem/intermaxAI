Ext.define("view.WebTOPTransaction", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql : {
        TOPTxnList_GroupAgent : 'IMXPA_WebTOPTransaction_TOPTxnList_GroupAgent.sql',
        TOPTxnList_GroupTxn   : 'IMXPA_WebTOPTransaction_TOPTxnList_GroupTxn.sql',
        ChartQuery            : 'IMXPA_WebTOPTransaction_ChartQuery.sql'
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
    webStatCodeDescription : 'Status Code [ - 1xx : Informational - 2xx : Successful - 3xx : Redirection - 4xx : Client Error - 5xx : Internal Server Error ]',

    init: function(){
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
            value      : common.Util.TR('Transaction Name'),
            width      : 350,
            x          : 700,
            y          : 5 ,
            listeners: {
                focus: function () {
                    if ( this.getValue() == '%' || this.getValue() == common.Util.TR('Transaction Name') )
                        this.setValue('%') ;
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
                keydown: function(){
                    if ( this.value > self.elapse_max_size ){
                        var msg_str = common.Util.TR('Input value is exceeded.') + '<br>' + '<font-size = "2"> ('+  common.Util.TR('Input range')+': 0~2147483647) </font-size>' ;
                        var cmp = this ;
                        self.ShowMessage( 'ERROR!!!', msg_str,Ext.Msg.OK, Ext.MessageBox.ERROR, function() {
                            cmp.focus();
                            cmp.setValue(0);
                        }) ;
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

        self.webRetrieveRadioContainer = Ext.create('Exem.FieldContainer', {
            x           : 700,
            y           : 30,
            layout      : 'hbox',
            width       : 350,
            itemId      : 'webRetrieveRadioContainer',
            defaultType : 'radiofield',
            defaults    : {flex: 1},
            items: [{
                width     : 175,
                boxLabel  : common.Util.TR('For each WebServer Retrieve'),
                name      : self.id + '_retrieveType',
                inputValue: 'web_each',
                checked   : true
            },{
                width     : 175,
                boxLabel  : common.Util.TR('WebServer Integration Retrieve'),
                name      : self.id + '_retrieveType',
                inputValue: 'web_integrate'
            }]
        });

        self.conditionArea.add(self.wasCombo);
        self.conditionArea.add(self.txnName_TextField);
        self.conditionArea.add(self.ElapseTime_NumberField);
        self.conditionArea.add(self.orderByRadioContainer);
        self.conditionArea.add(self.webRetrieveRadioContainer);


        //작업 부분.

        //1. 상단 Tab 패널
        self.TOPtxnList_tabPanel = Ext.create('Exem.TabPanel', {
            region : 'north',
            layout : 'fit',
            height : '50%',
            split  : true,
            itemId : 'TOPtxnList_tabPanel',
            style: {
                'background': '#f6f6f6'
            },
            minHeight: 100,
            listeners: {
                render: function() {
                    this.setActiveTab(0);
                },
                tabchange: function( tabPanel, newCard ){
                    newCard.add(self.topTxnList_Grid);
                    self.topTxnList_Grid.clearRows() ;
                    self.ChartDetailGrid.clearRows();
                    self.left_txnList_Chart.clearValues();
                    self.left_txnList_Chart.plotDraw();
                    self.condition_executeSQL();
                }
            }
        });

        self.TotalTabPanel = Ext.create('Exem.Panel', {
            title    : common.Util.TR('Total'),
            itemId   : 'total',
            split    : true,
            layout   : 'fit'
        }) ;

        self.TOPtxnList_tabPanel.add(self.TotalTabPanel);

        self.topTxnList_Grid = Ext.create('Exem.BaseGrid', {
            layout : 'fit',
            pagerMsg : this.webStatCodeDescription,
            itemclick: function(dv, record) {
                self.rowsData = record.data;
                self.GridselectRows();
            }
        });

        self.topTxnList_Grid.contextMenu.addItem({
            title : common.Util.TR('Transaction Summary'),
            itemId: 'Transaction_history',
            fn: function() {
                var record = this.up().record;
                var ws_id, txnHistory;
                var active_tab = self.TOPtxnList_tabPanel.getActiveTab() ;
                if ( active_tab.itemId == 'total' ){
                    txnHistory = common.OpenView.open('WebTxnHistory', {
                        isWindow : false,
                        width    : 1200,
                        height   : 800,
                        fromTime : self.datePicker.getFromDateTime(),
                        toTime   : self.datePicker.getToDateTime(), // 10분 더하기
                        transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name'])
                    });
                }
                else{
                    ws_id = active_tab.itemId ;
                    txnHistory = common.OpenView.open('WebTxnHistory', {
                        isWindow : false,
                        width    : 1200,
                        height   : 800,
                        fromTime : self.datePicker.getFromDateTime(),
                        toTime   : self.datePicker.getToDateTime(), // 10분 더하기
                        transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name']),
                        wsId    : ws_id
                    });
                }

                setTimeout(function(){
                    txnHistory.retrieve();
                }, 300);
            }

        }, 0);


        self.TotalTabPanel.add(self.topTxnList_Grid);

        self.topTxnList_Grid.beginAddColumns();

        self.topTxnList_Grid.addColumn('TXN ID'                                                     , 'txn_id'           , 100, Grid.String, false, true);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction')                               , 'txn_name'         , 300, Grid.String, true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('WebServer')                                 , 'ws_name'          , 130, Grid.String, false, false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Execution Count')               , 'txn_exec_count'   , 140, Grid.Number, true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Elapse Time (Total)')           , 'txn_elapse'       , 160, Grid.Float , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Elapse Time (MAX)')             , 'txn_elapse_max'   , 160, Grid.Float , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Elapse Time (AVG)')             , 'txn_elapse_avg'   , 160, Grid.Float , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Transaction Elapse Time Standard Deviation'), 'txn_elapse_stddev', 110, Grid.Float , true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Status 1XX')                                , 'status_1'         , 150, Grid.Number, true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Status 2XX')                                , 'status_2'         , 150, Grid.Number, true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Status 3XX')                                , 'status_3'         , 150, Grid.Number, true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Status 4XX')                                , 'status_4'         , 150, Grid.Number, true , false);
        self.topTxnList_Grid.addColumn(common.Util.CTR('Status 5XX')                                , 'status_5'         , 150, Grid.Number, true , false);

        self.topTxnList_Grid.endAddColumns();



        //1. 하단 차트 및 상세 그리드
        self.bottom_txnDetail_Area = Ext.create('Exem.Container', {
            region : 'center',
            layout : 'hbox',
            minHeight: 100,
            height : '50%',
            itemId : 'bottom_txnDetail_Area',
            title  : common.Util.TR('Transaction Detail')
        });

        self.left_txnList_Chart_Background = Ext.create('Exem.Container',{
            layout  : 'fit',
            width   : '100%',
            height  : '100%',
            flex    : 0.5,
            minWidth: 200
        });

        self.left_txnList_Chart = Ext.create('Exem.chart.CanvasChartLayer', {
            title        : common.Util.TR('Elapse Time & Execute Count'),
            layout       : 'fit',
            height       : '100%',
            minHeight    : 70,
            width        : '100%',
            itemId       : 'left_txnList_Chart',
            interval     : PlotChart.time.exTenMin,
            showTitle    : true,
            showLegend   : true,
            legendOrder  : PlotChart.legendOrder.exDesc,
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
            showIndicator : false,
            titleHeight   : 20
        });

        self.left_txnList_Chart.addSeries({
            id   : 'max_value',
            label : common.Util.CTR('MAX'),
            type : PlotChart.type.exBar
        });

        //Chart Series 추가.
        self.left_txnList_Chart.addSeries({
            id    : 'avg_value',
            label : common.Util.CTR('AVG'),
            type  : PlotChart.type.exBar
        });

        self.left_txnList_Chart.addSeries({
            id    : 'exec_count',
            label : common.Util.CTR('Execute Count'),
            point : true,
            type  : PlotChart.type.exLine,
            yaxis : 2,
            gridType : Grid.Number
        });

        self.ChartDetailGrid = Ext.create('Exem.BaseGrid',{
            width     : '100%',
            height    : '100%',
            flex      : 0.5,
            minHeight : 70,
            minWidth  : 200,
            localeType: Comm.dateFormat.HMS,
            title     : common.Util.TR('Detail')
        });

        self.ChartDetailGrid.beginAddColumns() ;
        self.ChartDetailGrid.addColumn(common.Util.CTR('Time'),                          'time',           130, Grid.DateTime,     true,  false);
        self.ChartDetailGrid.addColumn('WS ID',                                          'ws_id',          70,  Grid.StringNumber, true,  true);
        self.ChartDetailGrid.addColumn(common.Util.CTR('WebServer'),                     'ws_name',        100, Grid.String,       false, false);
        self.ChartDetailGrid.addColumn('Transaction ID',                                 'txn_id',         150, Grid.String,       false, true);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Transaction Name'),              'txn_name',       200, Grid.String,       true,  false);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Transaction Elapse Time (MAX)'), 'txn_elapse_max', 160, Grid.Float,        true,  false);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Transaction Execution Count'),   'txn_exec_count', 150, Grid.Number,       true,  false);
        self.ChartDetailGrid.addColumn(common.Util.CTR('Transaction Elapse Time (AVG)'), 'txn_elapse_avg', 160, Grid.Float,        true,  false);
        self.ChartDetailGrid.endAddColumns();


        self.left_txnList_Chart_Background.add(self.left_txnList_Chart );
        self.bottom_txnDetail_Area.add(self.left_txnList_Chart_Background, {xtype : 'splitter'}, self.ChartDetailGrid);


        self.workArea.add(self.TOPtxnList_tabPanel, self.bottom_txnDetail_Area);

    },


    topTxnList_TabPanel_Add : function(id, name){
        var tab_panel = this.TOPtxnList_tabPanel;

        //상단 Tab page에 Add
        var toptxnList_panel = Ext.create('Exem.Panel', {
            title  : name,
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

    checkValid: function(){
        var self = this ;
        /*
         * txn_name, elapse_time조건에서 아무값없이 retrieve누르면 기본값채우고 ㄱㄱ
         */
        var txn = self.txnName_TextField ;
        var txn_value = txn.getValue() ;
        var msgStr;
        if( txn_value == '' ){
            //msgStr = common.Util.TR( 'Transaction name is incorrect.' )
            txn.setValue( '%' ) ;
            self.executeSQL() ;
            return false;
        } else if(( txn_value.length <= 1 )
            && ( txn_value !== '%' ) ) {
            msgStr = common.Util.TR( 'Enter at least one character.' );
            self.ShowMessage('ERROR', msgStr,Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                txn.focus();
            });
            return false;
        }

        var elapse =  self.ElapseTime_NumberField ;
        var elapse_value = elapse.getValue() ;
        if( ( elapse_value == null )
            || ( elapse_value > self.elapse_max_size )
            ||  ( elapse_value < 0 ) ){
            //msgStr = common.Util.TR( 'Elapse time value is incorrect.' )
            elapse.setValue( 0 ) ;
            self.executeSQL() ;
            return false;
        }

        return true;

    },

    condition_executeSQL: function(){
        var self = this;

        var wsid   = null;
        var txnname = null;
        var wsList = this.wasCombo.getValue();

        var TOPTxnList_dataset = {};

        if (self.retrieveFlag){
            wsid   = self.TOPtxnList_tabPanel.getActiveTab().itemId;

            if ( self.txnName_TextField.getValue() ==  common.Util.TR('Transaction Name') ){
                txnname = '%' ;
            }else{
                txnname = self.txnName_TextField.getValue() ;
            }

            if ( self.ElapseTime_NumberField.getValue() == null ){
                self.ElapseTime_NumberField.setValue( 0 ) ;
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
            } ] ;

            if (wsid == 'total'){
                TOPTxnList_dataset.replace_string = [{
                    name  : 'ws_id',
                    value : wsList
                }, {
                    name : 'order',
                    value : self.orderByRadioContainer.getCheckedValue()
                }];
            } else{
                TOPTxnList_dataset.replace_string = [{
                    name  : 'ws_id',
                    value : wsid
                }, {
                    name : 'order',
                    value : self.orderByRadioContainer.getCheckedValue()
                }];
            }

            if (this.webRetrieveRadioContainer.getCheckedValue() === 'web_each') {
                TOPTxnList_dataset.sql_file = self.sql.TOPTxnList_GroupAgent;
            } else {
                TOPTxnList_dataset.sql_file = self.sql.TOPTxnList_GroupTxn;
            }

            WS.SQLExec(TOPTxnList_dataset, self.onData, self );


            if (self.orderByRadioContainer.getCheckedValue() == common.Util.TR('txn_elapse_avg')){
                self.topTxnList_Grid.setOrderAct('txn_elapse_avg', 'DESC');
            }else {
                self.topTxnList_Grid.setOrderAct('txn_exec_count', 'DESC');
            }
        }

    },

    executeSQL: function() {
        var self = this;
        var wsIds;
        var ix, ixLen;
        var columnList = this.topTxnList_Grid.pnlExGrid.headerCt.getGridColumns();

        if(!self.isLoading){
            self.isLoading = true;
            self.loadingMask.showMask();
        } else {
            return;
        }

        this.TOPtxnList_tabPanel.setActiveTab(0) ;

        self.topTxnList_Grid.clearRows() ;

        self.left_txnList_Chart.clearValues();
        self.ChartDetailGrid.clearRows();

        self.TOPtxnList_tabPanel.suspendLayouts();

        for ( ix = this.TOPtxnList_tabPanel.items.length; ix > 1 ; ix-- ){
            this.TOPtxnList_tabPanel.items.items[1].destroy() ;
        }

        if (this.webRetrieveRadioContainer.getCheckedValue() === 'web_each') {
            wsIds = this.wasCombo.getValue() ;
            wsIds = wsIds.split(',') ;
            for(ix = 0, ixLen = wsIds.length; ix < ixLen; ix++) {
                self.wsId   = wsIds[ix];
                self.wsName = Comm.webServersInfo[wsIds[ix]].name;
                self.topTxnList_Obj[self.wsName] = self.topTxnList_TabPanel_Add(wsIds[ix], self.wsName);
            }

            for (ix = 0, ixLen = columnList.length; ix < ixLen; ix++) {
                if(columnList[ix].dataIndex === 'ws_name'){
                    columnList[ix].colvisible = true;
                    columnList[ix].setVisible(true);
                }
            }
        } else {
            for (ix = 0, ixLen = columnList.length; ix < ixLen; ix++) {
                if(columnList[ix].dataIndex === 'ws_name'){
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
        var wsid;

        if (!self.isLoading) {
            self.left_txnList_Chart_Background.loadingMask.showMask();

        }

        self.wsList = this.wasCombo.getValue();
        wsid = self.TOPtxnList_tabPanel.getActiveTab().itemId;

        if ( wsid == 'total' ){
            wsid = self.wsList ;
        }

        txn_dataset.sql_file = self.sql.ChartQuery;


        var txn_id = self.rowsData['txn_id'];

        self.left_txnList_Chart.clearValues();

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
            name  : 'ws_id',
            value : wsid
        }];

        //차트 실행
        WS.SQLExec(txn_dataset, self.onChartData, self);

    },



    onDrawGridTOPTxnList_Agent: function(adata){
        //TOP Transaction List 뿌려주기.
        var self = this;
        self.topTxnList_Grid.clearRows() ;

        for (var ix=0; ix <= adata.rows.length-1; ix++) {
            self.topTxnList_Grid.addRow([
                 adata.rows[ix][0]     //txn_id
                ,adata.rows[ix][1]     //business_name
                ,adata.rows[ix][2]     //ws_name
                ,adata.rows[ix][3]     //txn_exec_count
                ,adata.rows[ix][4]     //txn_elapse_sum
                ,adata.rows[ix][5]     //txn_elapse_max
                ,adata.rows[ix][6]     //txn_elapse_avg
                ,adata.rows[ix][7]     //txn_elapse_stddev
                ,adata.rows[ix][8]     //status_1xx
                ,adata.rows[ix][9]     //status_2xx
                ,adata.rows[ix][10]     //status_3xx
                ,adata.rows[ix][11]     //status_4xx
                ,adata.rows[ix][12]    //status_5xx

            ]);
        }
        self.topTxnList_Grid.drawGrid();
        if(adata.rows.length > 0){
            self._gridClick(self.topTxnList_Grid.pnlExGrid, 0);
        }
        else{
            self.left_txnList_Chart.plotDraw();
        }

        if(self.isLoading){
            self.loadingMask.hide();
            self.isLoading = false;
        }
    },

    onDrawGridTOPTxnList_Txn: function(adata){
        //TOP Transaction List 뿌려주기.
        var self = this;
        self.topTxnList_Grid.clearRows() ;

        for (var ix=0; ix <= adata.rows.length-1; ix++) {
            self.topTxnList_Grid.addRow([
                adata.rows[ix][0]     //txn_id
                ,adata.rows[ix][1]     //business_name
                ,''                    //ws_name
                ,adata.rows[ix][2]     //txn_exec_count
                ,adata.rows[ix][3]     //txn_elapse_sum
                ,adata.rows[ix][4]     //txn_elapse_max
                ,adata.rows[ix][5]     //txn_elapse_avg
                ,adata.rows[ix][6]     //txn_elapse_stddev
                ,adata.rows[ix][7]     //status_1xx
                ,adata.rows[ix][8]     //status_2xx
                ,adata.rows[ix][9]     //status_3xx
                ,adata.rows[ix][10]    //status_4xx
                ,adata.rows[ix][11]    //status_5xx

            ]);
        }
        self.topTxnList_Grid.drawGrid();
        if(adata.rows.length > 0){
            self._gridClick(self.topTxnList_Grid.pnlExGrid, 0);
        }
        else{
            self.left_txnList_Chart.plotDraw();
        }

        if(self.isLoading){
            self.loadingMask.hide();
            self.isLoading = false;
        }
    },


    onData: function(aheader, adata) {
        var self = this;
        var command = aheader.command;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            if(command == self.sql.TOPTxnList_GroupAgent || command == self.sql.TOPTxnList_GroupTxn){
                if(self.isLoading){
                    self.loadingMask.hide();
                    self.isLoading = false;

                    self.left_txnList_Chart.clearValues();
                    self.left_txnList_Chart.plotDraw() ;
                }}
            else{
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

            default :
                break;
        }

        self.loadingMask.hide();
    },


    DrawDetailGrid: function(data) {
        var self = this;
        self.ChartDetailGrid.clearRows();
        if(data.rows.length == 0) {
            self.left_txnList_Chart_Background.loadingMask.hide();
        }

        for (var ix=0; ix <= data.rows.length -1; ix++) {
            self.ChartDetailGrid.addRow([
                 data.rows[ix][0]
                ,data.rows[ix][1]
                ,data.rows[ix][2]
                ,data.rows[ix][3]
                ,data.rows[ix][4]
                ,data.rows[ix][5]
                ,data.rows[ix][6]
                ,data.rows[ix][7]
            ]);
        }

        self.left_txnList_Chart_Background.loadingMask.hide();
        self.ChartDetailGrid.drawGrid();
    },

    onChartData: function(header, data){
        var self = this ;

        var param;
        var row = [];
        var TOPtxnStore = [];
        var time = '' ;

        var max  = 0;
        var avg  = 0;
        var exec = 0;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            self.left_txnList_Chart_Background.loadingMask.hide() ;

            console.warn('TOPTransaction-onChartData');
            console.warn(header);
            console.warn(data);
            return;
        }

        param = header.parameters;

        // total tab에서 실행 했을 경우
        if (header.command == self.sql.ChartQuery) {
            for (var i = 0; i< data[0].rows.length; i++) {
                if ( time !== data[0].rows[i][0] ){
                    if ( time !== '' ){
                        TOPtxnStore.push(row);
                        row = [] ;
                    }

                    avg  = data[0].rows[i][5] ;
                    max  = data[0].rows[i][3] ;
                    exec = data[0].rows[i][4] ;
                    time = data[0].rows[i][0] ;
                }
                else{
                    avg  += data[0].rows[i][5] ;
                    max  += data[0].rows[i][3] ;
                    exec += data[0].rows[i][4] ;
                }

                row[0] = data[0].rows[i][0] ;
                row[1] = avg ;
                row[2] = max  ;
                row[3] = exec ;
            }
            if ( row.length !== 0 ){
                TOPtxnStore.push(row) ;
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

        self.left_txnList_Chart.plotDraw() ;

        self.left_txnList_Chart_Background.loadingMask.hide() ;
    },

    _gridClick: function (grid, idx) {
        grid.getView().getSelectionModel().select(idx);
        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
    }

});