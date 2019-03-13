/*
* 사용하지 X
* */

Ext.define("view.TxnSQL", {
    extend: "Exem.FormOnCondition",
    width: "100%",
    height: "100%",
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        txn_sql_All_instance: 'IMXPA_TXNSQL_TransactionSQL_All_InstanceName.sql',
        txn_sql_value_instance: 'IMXPA_TXNSQL_TransactionSQL_InstanceName.sql',
        txn_sql_active_txn: 'IMXPA_TXNSQL_TransactionSQL_Active_Transaction.sql',
        txn_sql_sql_bind: 'IMXPA_TXNSQL_TransactionSQL_SQLBind.sql'
    },


    init: function(){

        var self = this ;

        self.setLoadingFlag = false;

        //=======================================================================================
            self.wasField = Ext.create('Exem.wasDBComboBox', {
            itemId: 'wasCombo',
            multiSelect: true,
            width           : 260,
            comboLabelWidth : 60,
            comboWidth      : 203,
            selectType : common.Util.TR('Agent'),
            x: 380,
            y: 5
        }) ;
        this.conditionArea.add(self.wasField) ;
        self.wasField.init();

        //=======================================================================================
        self.dbCombo = Ext.create('Exem.wasDBComboBox', {
            comboWidth: 180,
            comboLabelWidth : 25,
            //width  : 205,
    //            fieldLabel : 'Instance Name',
            selectType : 'DB',
            itemId : 'dbCombo',
            labelWidth: 86,
            width : 265,
            x: 610,
            y: 5
        });
        this.conditionArea.add(self.dbCombo) ;
        self.dbCombo.init();

        //==============================================================================================
        self.txnSQL_edit_txnName = Ext.create('Exem.TextField', {
            fieldLabel: common.Util.TR('Transaction Name'),
            labelAlign: 'right',
            labelWidth: 110,
            width     : 490,
            value : '%',
            itemId : 'transactionNameTF',
            allowBlank: false,  // requires a non-empty value
            maxLength : 255,
            enforceMaxLength:true,
            x: 305,
            y: 30
        });
        this.conditionArea.add(self.txnSQL_edit_txnName) ;

        //==============================================================================================

        this.setWorkAreaLayout('border');

        var txnSQL_Main_Border = Ext.create('Exem.Panel', {
            itemId: 'txm_Main_Border',
            region: 'center',
            layout:  'border',
            flex  : 3
        });
        self.workArea.add(txnSQL_Main_Border) ;         // Vbox 위에 Border가 올라가 때 그 메인 보드
        //==============================================================================================
        var txnSQL_North_Pnl = Ext.create('Exem.Panel', {
            region : 'north',
            layout : 'border',
            height : '30%',
            minHeight: 150,
            split  : true
        });

        var txnSQL_Center_Pnl = Ext.create('Exem.Panel', {
            region : 'center',
            layout : 'border',
            minHeight: 150,
            height : '30%'
        });

        var txnSQL_South_Pnl = Ext.create('Exem.Panel', {
            region : 'south',
            layout : 'border',
            height : '40%',
            minHeight: 150,
            split  : true
        }) ;

        self.txnSQL_Center_Pnl = txnSQL_Center_Pnl;
        txnSQL_Main_Border.add(txnSQL_North_Pnl);
        txnSQL_Main_Border.add(txnSQL_Center_Pnl);
        txnSQL_Main_Border.add(txnSQL_South_Pnl) ;

        //   Main  패널 3단 만들었음
        //==============================================================================================


        var txnSQL_TransactionSQL_Pnl = Ext.create('Exem.Panel', {
            region : 'center',
            title  : common.Util.TR('Transaction SQL'),
            itemId : 'txnSQL_TransactionSQL_Pnl',
            split  : true,
            layout : 'fit'
        }) ;

        txnSQL_North_Pnl.add(txnSQL_TransactionSQL_Pnl);

        self.txnSQL_TransactionSQL_Grid = Ext.create('Exem.BaseGrid', {
            localeType: 'y-m-d H:i',
            gridName  : 'pa_txn_sql_txn_gridName',
            itemclick: function(dv, record) {
               self.selectRow(record.data);
            }
        });

        /*
         addColumn(TEXT, dataINdex, width, datlaType, colume표시여부(true=표시), list 숨김여부(false=표시)
         */

        txnSQL_North_Pnl.getComponent('txnSQL_TransactionSQL_Pnl').add(self.txnSQL_TransactionSQL_Grid);
        self.txnSQL_TransactionSQL_Grid.beginAddColumns();
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('Time'),             'TIME',             100, Grid.DateTime, true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn('WAS ID',           'was_id',           100, Grid.String, false, true);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('Agent'),              'was_name',         100, Grid.String, true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn('Transaction ID',   'txn_id',           100, Grid.String, false, true);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('Transaction'),      'txn_name',         200, Grid.String, true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('Instance'),         'instance_name',    100, Grid.String, true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn('DB ID',            'db_id',            100, Grid.String, false, true);
        self.txnSQL_TransactionSQL_Grid.addColumn('SQL ID',           'sql_id',           100, Grid.String, false, true);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('SQL'),              'sql_text',         250, Grid.String, true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('SQL Execution Count'),   'sql_exec_count',   100, Grid.Number, true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('SQL Elapse Time (MAX)'), 'sql_elapse_max',   110, Grid.Float,  true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('SQL Elapse Time (AVG)'), 'sql_elapse_avg',   110, Grid.Float,  true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('CPU Time'),         'cpu_time',         80,  Grid.Float,  true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('Wait Time'),        'wait_time',        80,  Grid.Float,  true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('Logical Reads'),    'logical_reads',    80,  Grid.Float,  true, false);
        self.txnSQL_TransactionSQL_Grid.addColumn(common.Util.TR('Physical Reads'),   'physical_reads',   80,  Grid.Float,  true, false);
        self.txnSQL_TransactionSQL_Grid.endAddColumns();

        self.txnSQL_TransactionSQL_Grid.loadLayout(self.txnSQL_TransactionSQL_Grid.gridName);


        self.txnSQL_TransactionSQL_Grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Summary'),                    // 20분 + 1200000
            fn: function() {
                var record = this.up().record;
                var txnHistory = common.OpenView.open('TxnHistory', {
                    fromTime     : common.Util.getDate(+new Date(record['TIME'])),
                    toTime       : common.Util.getDate(+new Date(record['TIME']) + 1200000),
                    transactionTF: common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId            : record['was_id']
                });
                setTimeout(function (){
                    txnHistory.retrieve();
                }, 300);
            }
        }, 0);

        self.txnSQL_TransactionSQL_Grid.contextMenu.addItem({
            title: common.Util.TR('Transaction SQL'),                        //  11분 + 660000
            fn: function() {
                var record = this.up().record;
                var txnSQL = common.OpenView.open('TxnSQL', {
                    fromTime         : common.Util.getDate(+new Date(record['TIME'])),
                    toTime           : common.Util.getDate(+new Date(record['TIME']) + 660000),
                    transactionNameTF: common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId            : record['was_id'],
                    dbId             : record['db_id']

                });
                setTimeout(function (){
                    txnSQL.retrieve();
                }, 300);
            }
        }, 1);


        self.txnSQL_TransactionSQL_Grid.contextMenu.addItem({
            title: common.Util.TR('SQL Summary'),
            fn: function() {
                var record = this.up().record;
                var sqlHistory = common.OpenView.open('SQLHistory', {
                    fromTime : common.Util.getDate(record['TIME']),
                    toTime   : common.Util.getDate( Number(new Date(record['TIME'])) + 600000),
                 // dbName   : record['instance_name'],
                    dbId     : record['db_id'],
                    sqlIdTF  : record['sql_id'],
                    wasId    : record['was_id']

                });
                setTimeout(function (){
                    sqlHistory.retrieve();
                }, 300);
            }
        }, 2);


        //==============================================================================================

        var txnSQL_BindValue_Pnl = Ext.create('Exem.Panel', {
            title  : common.Util.TR('Bind Value'),
            itemId : 'txnSQL_BindValue_Pnl',
            region : 'west',
            width  : '50%',
            minWidth: 400,
            split  : true,
            layout : 'fit'
        }) ;
        self.txnSQL_SQL_SetBindSQL_Pnl = Ext.create('Exem.SQLEditorBaseFrame', {
            itemId : 'SQL_pnl',
            minWidth: 400,
            useFormatBtn : true,
            region : 'center'
        }) ;

        txnSQL_Center_Pnl.add(txnSQL_BindValue_Pnl);
        txnSQL_Center_Pnl.add(self.txnSQL_SQL_SetBindSQL_Pnl);

        self.txnSQL_BindValue_Grid = Ext.create('Exem.BaseGrid', {
            usePager : true,
            localeType: 'y-m-d H:i:s',
            itemclick: function(dv, record) {
                self.bindSelectRow(record.data);
            }
        });
        txnSQL_Center_Pnl.getComponent('txnSQL_BindValue_Pnl').add(self.txnSQL_BindValue_Grid);

        self.txnSQL_BindValue_Grid.addColumn(common.Util.TR('Time'),             'time',           120, Grid.DateTime, true, false);
        self.txnSQL_BindValue_Grid.addColumn(common.Util.TR('Bind Value'),        'bind_list',      350, Grid.String, true, false);
        self.txnSQL_BindValue_Grid.addColumn(common.Util.TR('Elapse Time'),      'elapse_time',    100, Grid.Float,  true, false);
        self.txnSQL_BindValue_Grid.addColumn('Hidden_Bind',    'hidden_bind',    100, Grid.String, false, true);
        common.WebEnv.setVisibleGridColumn(self.txnSQL_BindValue_Grid, ['bind_list'], Comm.config.login.permission.bind !== 1? true : false ) ;


        //==============================================================================================


        var txnSQL_ActiveTransaction_Pnl = Ext.create('Exem.Panel', {
            title : common.Util.TR('Active Transaction'),
            itemId: 'txnSQL_ActiveTransaction_Pnl',
            region : 'center',
            layout : 'fit'
        }) ;
        txnSQL_South_Pnl.add(txnSQL_ActiveTransaction_Pnl);

        self.txnSQL_ActiveTransaction_Grid = Ext.create('Exem.BaseGrid', {
            usePager : true,
            gridName  : 'pa_txn_sql_active_gridName',
            localeType: 'y-m-d H:i:s'
        });


        self.txnSQL_ActiveTransaction_Grid.addEventListener('celldblclick', function (me, td, cellIndex, record, tr, rowIndex) {
            var dataRows;
            /*
                SQL1 ~ SQL5 면 해당 SQL iD 를 저장한다음 FullText를 실행하고
                그 외의 cellIndex면 detailView를 Open.
             */

            if (rowIndex != undefined) {
                dataRows = record.data;
                switch (cellIndex) {
                    case 21:
                        if(dataRows['sql_text_1'] == "") {
                             return;
                        }
                        self._fullTextCreate(dataRows['sql_id1']);
                        break;
                    case 22:
                        if(dataRows['sql_text_2'] == "") {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id2']);
                        break;
                    case 23:
                        if(dataRows['sql_text_3'] == "") {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id3']);
                        break;
                    case 24:
                        if(dataRows['sql_text_4'] == "") {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id4']);
                        break;
                    case 25:
                        if(dataRows['sql_text_5'] == "") {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id5']);
                        break;

                    default:
                        var txnView = Ext.create('view.TransactionDetailView',{
                            startTime: common.Util.getDate(dataRows['start_time']),
                            endTime  : common.Util.getDate(dataRows['time']),
                            wasId    : dataRows['was_id'],
                            name     : dataRows['was_name'],
                            txnName  : common.Util.cutOffTxnExtName(dataRows['txn_name']),
                            tid      : dataRows['tid'],
                            socket   : WS
                        });

                        var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                        mainTab.add(txnView);
                        mainTab.setActiveTab(mainTab.items.length - 1);
                        txnView.init();

                        txnView = null ;
                        mainTab = null ;

                        break;
                }
            }

        }, this);


        self.txnSQL_ActiveTransaction_Grid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record, tr, rowIndex) {
            // 활성화 비활성화 할 context Menu Index  = 3
            self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(3, false);
            self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(4, false);

            // 클릭한 곳에 cellIndex 에 맞는 record "" 이 아니면 visible을 true 로 바꿔주고
            // cellIndex에 따라 sql id 를 넘겨줌
            // cellIndex 가 20~24 이면서 20이면 sql_id1 , ~24면 sql_id5 를 넘겨줌 점프로직에 ..
            var dataRows;
            if (rowIndex != undefined) {
                dataRows = record.data;
                switch (cellIndex) {
                    case 21:
                        if (dataRows['sql_text_1'] == '') {
                            return;
                        }
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id1'];
                        break;
                    case 22:
                        if (dataRows['sql_text_2'] == '') {
                            return;
                        }
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id2'];
                        break;
                    case 23:
                        if (dataRows['sql_text_3'] == '') {
                            return;
                        }
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id3'];
                        break;
                    case 24:
                        if (dataRows['sql_text_4'] == '') {
                            return;
                        }
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id4'];
                        break;
                    case 25:
                        if (dataRows['sql_text_5'] == '') {
                            return;
                        }
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.txnSQL_ActiveTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id5'];
                        break;

                    default:
                        break;
                }
            }
        }, this);

        txnSQL_ActiveTransaction_Pnl.add(self.txnSQL_ActiveTransaction_Grid);
        self.txnSQL_ActiveTransaction_Grid.beginAddColumns();
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Time')              , 'time',           120, Grid.DateTime, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn('WAS ID'                            , 'was_id',         100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Agent')             , 'was_name',        80, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn('TID'                               , 'tid',            100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn('Transaction ID'                    , 'txn_id',         100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Transaction')       , 'txn_name',       200, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Current Method')    , 'class_method',   100, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Method Type')       , 'method_type',    100, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Client IP')         , 'client_ip',      120, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Login Name')        , 'login_name',     100, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Start Time')        , 'start_time',     120, Grid.DateTime, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Elapse Time (AVG)') , 'avg_elapse',     100, Grid.Float,  true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('CPU Time')          , 'cpu_time',       80, Grid.Float,  true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Thread CPU')        , 'thread_cpu',     80, Grid.Float,  true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('IO Read')           , 'io_read',        80, Grid.Number, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('IO Write')          , 'io_write',       80, Grid.Number, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('DB Time')           , 'db_time',        80, Grid.Float,  true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Wait Time')         , 'wait_time',      80, Grid.Float,  true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Pool')              , 'pool_name',      100, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Elapse Time')       , 'elapse_time',    100, Grid.Float,  true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Instance Name')     , 'instance_name',  130, Grid.String, true, false);

        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('SID')               , 'sid',            80, Grid.StringNumber, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('State')             , 'state',          120, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Bind Value')         , 'bind_list',      150, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('SQL 1')             , 'sql_text_1',     120, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('SQL 2')             , 'sql_text_2',     120, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('SQL 3')             , 'sql_text_3',     120, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('SQL 4')             , 'sql_text_4',     120, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('SQL 5')             , 'sql_text_5',     120, Grid.String, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('SQL Execution Count') , 'sql_exec_count', 110, Grid.Number, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Fetch Count')       , 'fetch_count',    100, Grid.Number, true, false);

        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Prepare Count')     , 'prepare_count',  100, Grid.Number, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('PGA Usage (MB)')     , 'mem_usage',      100, Grid.Float,  true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Logical Reads')     , 'logical_reads',  100, Grid.Number, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Physical Reads')    , 'physical_reads', 100, Grid.Number, true, false);
        self.txnSQL_ActiveTransaction_Grid.addColumn(common.Util.TR('Wait Info')         , 'wait_info',      150, Grid.String, true, false);

        self.txnSQL_ActiveTransaction_Grid.addColumn('Pool ID'               , 'pool_id',    100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn('SQL1 ID'               , 'sql_id1',    100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn('SQL2 ID'               , 'sql_id2',    100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn('SQL3 ID'               , 'sql_id3',    100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn('SQL4 ID'               , 'sql_id4',    100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn('SQL5 ID'               , 'sql_id5',    100, Grid.String, false, true);
        self.txnSQL_ActiveTransaction_Grid.addColumn('Current CRC ID'        , 'current_crc',100, Grid.String, false, true);

        self.txnSQL_ActiveTransaction_Grid.endAddColumns();

        common.WebEnv.setVisibleGridColumn(self.txnSQL_ActiveTransaction_Grid, ['bind_list'], Comm.config.login.permission.bind !== 1? true : false ) ;
        self.txnSQL_ActiveTransaction_Grid.loadLayout(self.txnSQL_ActiveTransaction_Grid.gridName);

        self.txnSQL_ActiveTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),
            fn: function() {
                var record = this.up().record;
                var txnView = Ext.create('view.TransactionDetailView',{
                    startTime : common.Util.getDate(record['start_time']),
                    endTime   : common.Util.getDate(record['time']),
                    wasId     : record['was_id'],
                    name      : record['was_name'],
                    txnName   : common.Util.cutOffTxnExtName(record['txn_name']),
                    tid       : record['tid'],
                    elapseTime: record['elapse_time'],
                    socket    : WS
                });

                var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.add(txnView);
                mainTab.setActiveTab(mainTab.items.length - 1);
                txnView.init();

                txnView = null ;
                mainTab = null ;
            }
        }, 0);

        self.txnSQL_ActiveTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Summary'),                    // 20분 + 1200000
            fn: function() {
                var record = this.up().record;
                var txnHistory = common.OpenView.open('TxnHistory', {
    //                    fromTime     : common.Util.getDate(record['time']),
                    fromTime     : common.Util.getDate(self.activeTxnTime),  // 이놈은 date 형식임 따라서 변환.
                    toTime       : common.Util.getDate(Number(self.activeTxnTime) + 1200000),
                    transactionTF: common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId        : record['was_id']
                });
                setTimeout(function (){
                    txnHistory.retrieve();
                }, 300);
            }
        }, 1);

        self.txnSQL_ActiveTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('Transaction SQL'),                        //  11분 + 660000
            fn: function() {
                var txnSQL;
                var record = this.up().record;
                if (record['instance_name'] == '') {
                    txnSQL = common.OpenView.open('TxnSQL', {
    //                    fromTime         : common.Util.getDate(record['time']),
                        fromTime         : common.Util.getDate(self.activeTxnTime),
                        toTime           : common.Util.getDate(Number(self.activeTxnTime) + 660000),
                        transactionNameTF: common.Util.cutOffTxnExtName(record['txn_name']),
                        wasId            : record['was_id']
                    });
                } else {
                    txnSQL = common.OpenView.open('TxnSQL', {
    //                    fromTime         : common.Util.getDate(record['time']),
                        fromTime         : common.Util.getDate(self.activeTxnTime),
                        toTime           : common.Util.getDate(Number(self.activeTxnTime) + 660000),
                        transactionNameTF: common.Util.cutOffTxnExtName(record['txn_name']),
                        dbName           : record['instance_name'],
                        wasId            : record['was_id']
                    });
                }

                setTimeout(function (){
                    txnSQL.retrieve();
                }, 300);
            }
        }, 2);


        self.txnSQL_ActiveTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('SQL Summary'),
            fn : function() {
                var record = this.up().record;
                var sqlHistory = common.OpenView.open('SQLHistory', {
                    fromTime : common.Util.getDate(self.activeTxnTime),
                    toTime   : common.Util.getDate(Number(self.activeTxnTime) + 600000),
                    sqlIdTF  : self.activeSqlId,
                    wasId    : record['was_id']

                });
                setTimeout(function (){
                    sqlHistory.retrieve();
                }, 300);
            }
        } , 3);

        self.txnSQL_ActiveTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('Full SQL Text'),
            fn : function() {
                self._fullTextCreate(self.activeSqlId);
            }
        }, 4);
    },

    _fullTextCreate: function(sqlId) {
        var self = this;

        self.winSQLFullText = Ext.create('Exem.FullSQLTextWindow');

        self.winSQLFullText.getFullSQLText(sqlId);
        self.winSQLFullText.show();

    },

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

    executeSQL: function() {
        var self = this;
        var txn_sql_dataset = {};
        var active_txn_dataset = {};

        if (self.txnSQL_Center_Pnl.isLoading || self.txnSQL_ActiveTransaction_Grid.isLoading) {
            return;
        }

        self.setLoadingFlag = false;
        self.loadingMask.show();

        // ==============    초기화 부분   ===

        self.txnSQL_TransactionSQL_Grid.clearRows();
        self.txnSQL_BindValue_Grid.clearRows();
        self.txnSQL_SQL_SetBindSQL_Pnl.clearEditorText();
        self.txnSQL_ActiveTransaction_Grid.clearRows();

        txn_sql_dataset.bind = [];
        active_txn_dataset.bind = [];

        // ==============     값설정 부    ===

        txn_sql_dataset.bind = [{
            name: 'fromtime',
            value: self.datePicker.getFromDateTime(),
            type : SQLBindType.STRING
        }, {
            name: 'totime',
            value: self.datePicker.getToDateTime(),
            type : SQLBindType.STRING
        },{
            name: 'txn_name',
            value: self.txnSQL_edit_txnName.getValue(),
            type : SQLBindType.STRING
        }];
        txn_sql_dataset.replace_string = [{
            name:  'was_id',
            value: self.wasField.getValue()
        },{
            name: 'db_id',
            value: self.dbCombo.getValue(),
            type: 'string'
        }];

        txn_sql_dataset.sql_file = self.sql.txn_sql_value_instance;
        WS.SQLExec(txn_sql_dataset, self.onData, self);

    },

    _rowsBind: function(data, idx){
        var tmp;
        var hiddenIdx;

        if (!data) {
            return;
        }

        for (var ix in data) {
            if (!data[ix]) {
                continue;
            }
            tmp = common.Util.convertBindList(data[ix][idx]);
            var resultTmp = [];

            hiddenIdx = data[ix].length;
            data[ix][hiddenIdx] = data[ix][idx];

            for (var jx in tmp) {
                if (!tmp[jx] && typeof tmp[jx] !== 'number') {
                    continue;
                }
                resultTmp.push(tmp[jx].value);
            }
            data[ix][idx] = resultTmp.join(', ');
        }
    },


    _bindListConvert: function(data) {
        var self = this;
        var tmpBindList;

        if (!data) {
            return;
        }

        for(var ix in data){
            if (!data[ix]) {
                continue;
            }
            tmpBindList = common.Util.convertBindList(data[ix][42]);  // bindList 컬럼
            data[ix][29] = self._CodeBitToMethodType(data[ix][29]);  // methodType 컬럼
            data[ix][14] = Define.threadStateType[data[ix][14]];
            var resultTmp = [];

            for(var jx in tmpBindList){
                if (!tmpBindList[jx] && typeof tmpBindList[jx] !== 'number') {
                    continue;
                }
                resultTmp.push(tmpBindList[jx].value);
            }
            data[ix][42] = resultTmp.join();
        }
    },


    _gridClick: function (grid, idx){
        grid.getView().getSelectionModel().select(idx);
        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
    },

    selectRow : function(adata){
        var self = this;

        if (self.txnSQL_Center_Pnl.isLoading || self.txnSQL_ActiveTransaction_Grid.isLoading) {
            return;
        }

        self.txnSQL_Center_Pnl.loadingMask.show();
        self.txnSQL_ActiveTransaction_Grid.loadingMask.show();

        var txn_id = adata['txn_id'];
        var sql_id = adata['sql_id'];
        var was_id = adata['was_id'];

        self.activeTxnTime = adata['TIME'];  // active 탭 점프에 쓰임

        var fromTime = common.Util.getDate(adata['TIME']),
                toTime   = common.Util.getDate((+new Date(fromTime) + 600000)),
                activeFromTime = fromTime,
                activeToTime   = toTime;

        var txnSQL_bind_dataset = {};
        var txnSQL_active_dataset = {};

        self.bindSQL_id = sql_id; // Editor에 넘겨주기 위해 저장

        if (self.setLoadingFlag) {
            self.txnSQL_Center_Pnl.loadingMask.show();
            self.txnSQL_ActiveTransaction_Grid.loadingMask.show();
        }

        self.txnSQL_BindValue_Grid.clearRows();
        self.txnSQL_SQL_SetBindSQL_Pnl.clearEditorText();
        self.txnSQL_ActiveTransaction_Grid.clearRows();

        txnSQL_bind_dataset.bind = [{
            name: "from_time",
            value: fromTime,
            type : SQLBindType.STRING
        }, {
            name: "to_time",
            value: toTime,
            type : SQLBindType.STRING
        }, {
            name: "sql_id",
            value: sql_id,
            type : SQLBindType.STRING
        }, {
            name: "txn_id",
            value: txn_id,
            type : SQLBindType.STRING
        }];
        txnSQL_bind_dataset.replace_string=[{
            name: "was_id",
            value: was_id
        }];

        txnSQL_bind_dataset.sql_file = self.sql.txn_sql_sql_bind;
        WS.SQLExec(txnSQL_bind_dataset, self.onData, self);


        txnSQL_active_dataset.bind = [{
            name: "from_time",
            value: activeFromTime,
            type : SQLBindType.STRING
        }, {
            name: "to_time",
            value: activeToTime,
            type : SQLBindType.STRING
        }, {
            name: "txn_id",
            value: txn_id,
            type : SQLBindType.STRING
        }];
        txnSQL_active_dataset.replace_string=[{
            name: "was_id",
            value: was_id
        }];

        txnSQL_active_dataset.sql_file = self.sql.txn_sql_active_txn;
        WS.SQLExec(txnSQL_active_dataset, self.onData, self);

    },

    bindSelectRow: function(adata){
        var self = this;
        self.bindSQL_id; // sql_id

        var bindStr = '';
        bindStr = adata['hidden_bind'];

        self.txnSQL_SQL_SetBindSQL_Pnl.getFullSQLText(self.bindSQL_id, bindStr);

    },


    onData: function(aheader, adata) {
        var self = this;

        if (aheader.success === false) {
            self.showMessage(common.Util.TR('ERROR'), aheader.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
////                self.wasField.focus();
            });
            self.txnSQL_ActiveTransaction_Grid.loadingMask.hide();
            self.txnSQL_Center_Pnl.loadingMask.hide();
            self.loadingMask.hide();
            return;
        }


        if (aheader.rows_affected > 0){
            var ix, len;
            if (aheader.command == self.sql.txn_sql_value_instance){

                for (ix = 0, len = adata.rows.length; ix < len; ix++) {
////                    var dataRows = adata.rows[ix];
////                    dataRows[0] = Ext.util.Format.date(dataRows[0], 'Y-m-d H:i:s');
                    self.txnSQL_TransactionSQL_Grid.addRow(adata.rows[ix]);
                }

                self.txnSQL_TransactionSQL_Grid.drawGrid();
                self._gridClick(self.txnSQL_TransactionSQL_Grid.pnlExGrid, 0);
            }

            switch(aheader.command){
                case self.sql.txn_sql_sql_bind:
                    self._rowsBind(adata.rows, 1);

                    for (ix = 0, len = adata.rows.length; ix < len; ix++) {
////                        var dataRows = adata.rows[ix];
////                        dataRows[0] = Ext.util.Format.date(dataRows[0], 'Y-m-d H:i:s');
                        self.txnSQL_BindValue_Grid.addRow(adata.rows[ix]);
                    }

                    self.txnSQL_BindValue_Grid.drawGrid();
                    self._gridClick(self.txnSQL_BindValue_Grid.pnlExGrid, 0);

                    break;


                case self.sql.txn_sql_active_txn:

                    self._bindListConvert(adata.rows);

                    for (ix = 0, len = adata.rows.length; ix < len; ix++) {
                        var dataRows = adata.rows[ix];

                        self.txnSQL_ActiveTransaction_Grid.addRow([
                            dataRows[0]     // time
                            , dataRows[1]     //  was_id
                            , dataRows[2]     //  was_name
                            , dataRows[3]     //  tid
                            , dataRows[4]     //  txn_id
                            , dataRows[5]     //  txn_name
                            , dataRows[28]    //  class_method
                            , dataRows[29]    //  method_type      컨버팅.
                            , dataRows[6]     //  client_ip
                            , dataRows[39]    //  login_name
                            , dataRows[7]     //  start_time
                            , dataRows[8]     //  avg_elapse
                            , dataRows[31]    //  cpu_time
                            , dataRows[38]    //  thread_cpu
                            , dataRows[40]    //  io_read
                            , dataRows[41]    //  io_write
                            , dataRows[33]    //  db_time
                            , dataRows[32]    //  wait_time
                            , dataRows[11]    //  pool_name
                            , dataRows[9]     //  elase_time
                            , dataRows[12]    //  instance_name
                            , dataRows[13]    //  sid
                            , dataRows[14]    //  state            컨버팅
                            , dataRows[42]    //  bind_list        컨버팅
                            , dataRows[16]    //  sql_text_1
                            , dataRows[18]    //  sql_text_2
                            , dataRows[20]    //  sql_text_3
                            , dataRows[22]    //  sql_text_4
                            , dataRows[24]    //  sql_text_5
                            , dataRows[25]    //  sql_exec_count
                            , dataRows[26]    //  fetch_count
                            , dataRows[27]    //  prepare_count
                            , dataRows[34]    //  mem_usage
                            , dataRows[35]    //  logical_reads
                            , dataRows[36]    //  physical_reads
                            , dataRows[37]    //  wait_info
                            , dataRows[10]    //  pool_id
                            , dataRows[15]    //  sql_id1
                            , dataRows[17]    //  sql_id2
                            , dataRows[19]    //  sql_id3
                            , dataRows[21]    //  sql_id4
                            , dataRows[23]    //  sql_id5
                            , dataRows[30]    //  current_crc
                        ]);
                    }

                    self.txnSQL_ActiveTransaction_Grid.drawGrid();
                    self.txnSQL_ActiveTransaction_Grid.loadingMask.hide();
                    self.txnSQL_Center_Pnl.loadingMask.hide();
                    self.loadingMask.hide();
                    self.setLoadingFlag = true;
                    break;
                default : break;
            }
        }

        else {

            if (aheader.command == self.sql.txn_sql_sql_bind) {
                self.txnSQL_SQL_SetBindSQL_Pnl.getFullSQLText(self.bindSQL_id);
            } else {
                self.txnSQL_Center_Pnl.loadingMask.hide();
                self.txnSQL_ActiveTransaction_Grid.loadingMask.hide();
                self.loadingMask.hide();
            }
            console.debug('onData-callback', 'no data');
        }
    },

    _CodeBitToMethodType: function(codeBit) {
        var result = '';

        var h2d = function(val){
            return parseInt(val , 16);
        };

        try {
            if( (codeBit & h2d(1)) > 0)
                result = result + 'loop,';

            if( (codeBit & h2d(2)) > 0)
                result = result + 'synchronized,';

            if( (codeBit & h2d(4)) > 0)
                result = result + 'new alloc,';

            if( (codeBit & h2d(40)) > 0)
                result = result + 'exit,';

            if( (codeBit & h2d(80)) > 0)
                result = result + 'gc,';

            if( (codeBit & h2d(100)) > 0)
                result = result + 'arraycopy,';

            if( (codeBit & h2d(1000)) > 0)
                result = result + 'classloader,';

            if( (codeBit & h2d(2000)) > 0)
                result = result + 'thread,';

            if( (codeBit & h2d(4000)) > 0)
                result = result + 'reflect,';

            if( (codeBit & h2d(8000)) > 0)
                result = result + 'io,';

            if( (codeBit & h2d(10000)) > 0)
                result = result + 'net,';

            if( (codeBit & h2d(20000)) > 0)
                result = result + 'nio,';

            if( (codeBit & h2d(200000)) > 0)
                result = result + 'enumeration,';

            if( (codeBit & h2d(400000)) > 0)
                result = result + 'iterator,';

            if( (codeBit & h2d(800000)) > 0)
                result = result + 'strbuffer,';

            if( (codeBit & h2d(1000000)) > 0)
                result = result + 'strtoken,';

            if( (codeBit & h2d(2000000)) > 0)
                result = result + 'blob,';

            if( (codeBit & h2d(4000000)) > 0)
                result = result + 'clob,';

            if( (codeBit & h2d(8000000)) > 0)
                result = result + 'xml,';
        }

        finally {
            result = result.substring(0, result.length-1);

            return result;
        }

    }

}) ;
