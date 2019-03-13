Ext.define('view.TuxSQLHistory', {
    extend: 'Exem.FormOnCondition',
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        txn_sql_first       : 'IMXPA_SQLHistory_Txn_First.sql',
        txn_sql_first_text  : 'IMXPA_SQLHistory_Txn_First_text.sql',
        summary_first       : 'IMXPA_SQLHistory_Summary_First.sql',
        summary_first_text  : 'IMXPA_SQLHistory_Summary_First_text.sql',
        txn_sql_second      : 'IMXPA_SQLHistory_Txn_Second.sql',
        summary_second      : 'IMXPA_SQLHistory_Summary_Second.sql',
        txn_bind            : 'IMXPA_SQLHistory_Txn_Bind.sql',
        summary_bind        : 'IMXPA_SQLHistory_Summary_Bind.sql',
        activeTxn           : 'IMXPA_SQLHistory_Active_Transaction.sql'

    },
    listeners: {
        beforedestroy: function() {
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

    checkValid: function() {
        var self = this;

        if (!self.wasField.checkValid()) {
            return false;
        }

        if (self.sqlId_TF.getValue().trim().length < 1) {
            self.sqlId_TF.setValue('%');
        }

        if ((self.elapseTime_TF.getValue() < 0) || self.elapseTime_TF.getValue() == null) {
            self.elapseTime_TF.setValue(0);
        }

        if (self.elapseTime_TF.getValue() > 2147483648) {
            self.showMessage(common.Util.TR('ERROR'), common.Util.TR('Input value is out of range.') +
                '<br>' + '<font-size = "2">' + common.Util.TR('Search Range') + ': 0~2147483647</font-size>',

            Ext.Msg.OK, Ext.MessageBox.ERROR, function() {
                self.elapseTime_TF.focus();
            });
            return false;
        }

        if ((self.maxElapseTime.getValue() < 0) || self.maxElapseTime.getValue() == null) {
            self.maxElapseTime.setValue(0);
        }

        if (self.maxElapseTime.getValue() > 2147483648) {
            self.showMessage(common.Util.TR('ERROR'), common.Util.TR('Input value is out of range.') +
                '<br>' + '<font-size = "2">' + common.Util.TR('Search Range') + ': 0~2147483647</font-size>',

            Ext.Msg.OK, Ext.MessageBox.ERROR, function() {
                self.maxElapseTime.focus();
            });
            return false;
        }


        return true;

    },

    init: function() {


        var self = this;
        self.retrieveFlag   = false;
        self.setLoadingFlag = false;
        self.activeTxnFirstFlag  = true;
        self.secondSummaryFlag   = true;

        self.setWorkAreaLayout('border');

        /**************************** Condition Area *****************************/
        // WAS list
        self.wasField = Ext.create('Exem.wasDBComboBox', {
            width           : 280,
            comboLabelWidth : 60,
            comboWidth      : 230,
            selectType      : common.Util.TR('Agent'),
            itemId          : 'wasCombo',
            multiSelect     : true,
            x               : 280,
            y               : 5
        });


        // Elapse Time TextField
        self.elapseTime_TF = Ext.create('Exem.NumberField', {
            fieldLabel      : common.Util.TR('Elapse Time (AVG) >='),
            itemId          : 'elapseTimeTF',
            labelAlign      : 'right',
            labelWidth      : 130,
            labelSeparator  : '',
            allowBlank      : false,
            value           : 0,
            width           : 227,
            maxLength       : 10,
            maxValue        : 2147483647,
            minValue        : 0,
            enforceMaxLength: true,
            enableKeyEvents : true,
            x               : 535,
            y               : 5,
            listeners: {
                blur: function(numField) {
                    if (numField.getValue() == null) {
                        numField.setValue(0);
                    }
                }
            }
        });



        self.rdo_sql = Ext.create('Exem.FieldContainer',{
            itemId     : 'rdo_sql',
            layout     : 'hbox' ,
            width      : 150,
            defaultType: 'radiofield' ,
            defaults   : { flex: 1 },
            x          : 350,
            y          : 30 ,
            items      : [
                {
                    boxLabel    : common.Util.TR('SQL ID')
                    , inputValue: 0
                    , name      : self.id + '_sql_type'
                    , itemId    : 'sql_id'
                    , checked   : true
                    , listeners : {
                        change: function() {
                            if (this.getValue()) {
                                self.sqlId_TF.setVisible(true);
                                self.sql_text.setVisible(false);
                            }
                        }
                    }
                },{
                    boxLabel    : common.Util.TR('SQL Text')
                    , inputValue: 1
                    , name      : self.id + '_sql_type'
                    , itemId    : 'sql_text'
                    , check     : true
                    , listeners : {
                        change: function() {
                            if (this.getValue()) {
                                self.sqlId_TF.setVisible(false);
                                self.sql_text.setVisible(true);
                            }
                        }
                    }
                }
            ]
        });

        // SQL ID TextField
        self.sqlId_TF = Ext.create('Exem.TextField', {
            fieldLabel      : '' ,
            labelAlign      : 'right',
            allowBlank      : false,
            value           : common.Util.TR('SQL ID'), //'%',
            itemId          : 'sqlIdTF',
            labelWidth      : 45,
            maxLength       : 40,
            enforceMaxLength: true,
            width           : 235,
            x               : 573,
            y               : 30,
            listeners: {
                focus: function() {
                    if (this.getValue() == '%' || this.getValue() == 'SQL ID') {
                        this.setValue('%');
                    }
                },
                blur: function() {
                    if (this.getValue() == '%') {
                        this.setValue('SQL ID');
                    }
                }
            }
        });


        self.sql_text = Ext.create('Exem.TextField', {
            fieldLabel      : '',
            labelAlign      : 'right',
            allowBlank      : false,
            value           : common.Util.TR('SQL Text'), //'%',
            itemId          : 'sql_text',
            labelWidth      : 45,
            maxLength       : 40,
            enforceMaxLength: true,
            width           : 235,
            x               : 573,
            y               : 30,
            listeners: {
                focus: function() {
                    if (this.getValue() == '%' || this.getValue() == 'SQL Text') {
                        this.setValue('%');
                    }
                },
                blur: function() {
                    if (this.getValue() == '%') {
                        this.setValue('SQL Text');
                    }
                }
            }
        });


        // Elapse Time TextField
        self.maxElapseTime = Ext.create('Exem.NumberField', {
            fieldLabel      : common.Util.TR('Elapse Time (MAX) >='),
            itemId          : 'maxElapseTime',
            labelAlign      : 'right',
            labelWidth      : 130,
            labelSeparator  : '',
            allowBlank      : false,
            value           : 0,
            width           : 227,
            maxLength       : 10,
            maxValue        : 2147483647,
            minValue        : 0,
            enforceMaxLength: true,
            enableKeyEvents : true,
            x               : 803,
            y               : 5,
            listeners: {
                blur: function(numField) {
                    if (numField.getValue() == null) {
                        numField.setValue(0);
                    }
                }
            }
        });


        var valueArr = [];
        valueArr.push({ 'idx': 0, 'name': common.Util.TR('Elapse Time (AVG)') });
        valueArr.push({ 'idx': 1, 'name': common.Util.TR('Elapse Time (MAX)') });
        valueArr.push({ 'idx': 2, 'name': common.Util.TR('Execute Count') });

        var orderStore = Ext.create('Ext.data.Store', {
            fields: ['idx', 'name'],
            data  : valueArr
        });

        this.orderCombo = Ext.create('Exem.ComboBox', {
            x           : 830,
            y           : 30,
            fieldLabel  : common.Util.TR('Order by'),
            labelWidth  : 60,
            width       : 200,
            store       : orderStore,
            itemId      : 'orderCombo',
            valueField  : 'idx',
            displayField: 'name'
        });
        this.orderCombo.setValue(orderStore.getAt('0'));

        var toggleArea = Ext.create('Exem.Container', {
            width : (window.nation === 'ja' ? 90 : 85),
            height: 23,
            x     : 1065,
            y     : 7
        });

        this.topAllToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width      : 83,
            height     : 22,
            offLabelCls:'x-toggle-slide-label-off2',
            onText     : common.Util.CTR('TOP 100'),
            offText    : common.Util.CTR('ALL'),
            state      : true
        });
        toggleArea.add(this.topAllToggle);

        // 상단 Area 설정 --- TF 는 TextField의 약자
        self.conditionArea.add(self.wasField, self.elapseTime_TF,
            self.rdo_sql, self.sqlId_TF, self.sql_text, self.maxElapseTime,
            this.orderCombo, toggleArea);

        self.wasField.init();

        self.sql_text.setVisible(false);

        /**************************** Work Area **********************************/
        // TabPanel 기본
        var Tabpnl = Ext.create('Exem.TabPanel', {
            layout : 'fit',
            itemId : 'Tabpnl',
            region : 'center',
            split  : true
        });
        self.Tabpnl = Tabpnl;

        var txn_pnl = Ext.create('Exem.Panel', {
            title    : common.Util.TR('Transaction SQL'),
            layout   : 'border',
            itemId   : 'txn_Tab',
            listeners: {
                activate: function() {
                    self.condition_execute();
                }
            }
        });
        self.txn_pnl = txn_pnl;

        var txn_grd_first = Ext.create('Exem.Panel', {
            layout   : 'fit',
            itemId   : 'txn_grd_first',
            region   : 'north',
            split    : true,
            minHeight: 150,
            height   : '30%'
        });


        self.txn_second_tabpanel = Ext.create('Exem.TabPanel', {
            layout   : 'fit',
            itemId   : 'txn_second_tabpnl',
            region   : 'center',
            minHeight: 150,
            listeners: {
                tabchange: function(tabpnl, nv) {
                    if (!self.selectTime) {
                        return;
                    }

                    var dataset = {};
                    if (!self.activeTxnFirstFlag && nv.itemId == 'activeTxnGrid') {
                        dataset.bind = [{
                            name: 'from_time',
                            type: SQLBindType.STRING,
                            value: self.fromTime
                        }, {
                            name: 'to_time',
                            type: SQLBindType.STRING,
                            value: self.toTime
                        }, {
                            name : 'sql_id',
                            type: SQLBindType.STRING,
                            value: self.bindSQL_id
                        }, {
                            name: 'txn_id',
                            type: SQLBindType.STRING,
                            value: self.txn_id == undefined ? null : self.txn_id
                        }];
                        dataset.replace_string = [{
                            name: 'was_id',
                            value: self.was_id
                        }];
                        dataset.sql_file = self.sql.activeTxn;
                        WS.SQLExec(dataset, self.onData, self);

                        self.activeTxnFirstFlag = true;

                        self.txn_second_tabpanel.loadingMask.showMask();

                    } else if (!self.secondSummaryFlag && nv.itemId == 'secondSummary') {
                        dataset.bind = [{
                            name: 'from_time',
                            value: self.fromTime,
                            type: SQLBindType.STRING
                        }, {
                            name: 'to_time',
                            value: self.toTime,
                            type: SQLBindType.STRING
                        }, {
                            name: 'txn_id',
                            value: self.txn_id,
                            type: SQLBindType.STRING
                        }];
                        dataset.replace_string = [{
                            name: 'was_id',
                            value: self.wasField.getValue()
                        }];
                        dataset.sql_file = self.sql.txn_sql_second;
                        WS.SQLExec(dataset, self.onData, self);

                        self.secondSummaryFlag = true;
                        self.txn_second_tabpanel.loadingMask.showMask();
                    }
                }
            }
        });


        var txn_second_txnSummaryArea = Ext.create('Exem.Container', {
            title  : common.Util.TR('SQL Transaction Summary'),
            itemId : 'secondSummary'
        });

        var txn_second_activeTxnArea = Ext.create('Exem.Container', {
            title  : common.Util.TR('Active Transaction'),
            itemId : 'activeTxnGrid'
        });

        self.txn_second_tabpanel.add(txn_second_txnSummaryArea, txn_second_activeTxnArea);

        var txn_south_pnl = Ext.create('Exem.Panel', {
            layout   : 'border',
            height   : '40%',
            region   : 'south',
            minHeight: 150,
            split    : true,
            itemId   : 'south_pnl'
        });

        self.txn_south_pnl = txn_south_pnl;
        var txn_bind_pnl = Ext.create('Exem.Panel', {
            layout  : 'fit',
            itemId  : 'bind_pnl',
            title   : common.Util.TR('Bind Value'),
            region  : 'west',
            split   : true,
            minWidth: 400,
            width   : '50%'
        });

        self.txn_SQL_Tabpnl = Ext.create('Exem.SQLEditorBaseFrame', {
            layout      : 'fit',
            itemId      : 'SQL_pnl',
            region      : 'center',
            useFormatBtn: true,
            minWidth    : 400
        });

        txn_south_pnl.add(txn_bind_pnl);
        txn_south_pnl.add(self.txn_SQL_Tabpnl);
        txn_pnl.add(txn_grd_first);
        txn_pnl.add(self.txn_second_tabpanel);
        txn_pnl.add(txn_south_pnl);
        Tabpnl.add(txn_pnl);

        var summary_pnl = Ext.create('Exem.Panel', {
            title  : common.Util.TR('Summary'),
            itemId : 'summary_Tab',
            layout: 'border',
            listeners: {
                activate: function() {
                    self.condition_execute();
                }
            }
        });
        self.summary_pnl = summary_pnl;


        var summary_grd = Ext.create('Exem.Panel', {
            layout : 'fit',
            itemId : 'summary_grd_first',
            height : '30%',
            region : 'north',
            split  : true
        });

        var summary_center = Ext.create('Exem.Panel', {
            layout : 'fit',
            itemId : 'center_pnl',
            title  : common.Util.TR('SQL Transaction'),
            region : 'center'
        });
        self.summary_center = summary_center;

        var summary_south = Ext.create('Exem.Panel', {
            layout : 'border',
            itemId : 'south_pnl',
            height : '45%',
            split  : true,
            region : 'south'
        });
        self.summary_south = summary_south;

        var summary_bind_pnl = Ext.create('Exem.Panel', {
            layout : 'fit',
            itemId : 'bind_pnl',
            title  : common.Util.TR('Bind Value'),
            region : 'west',
            split  : true,
            minWidth : 400,
            width  : '50%'
        });


        self.summary_SQL_Tabpnl = Ext.create('Exem.SQLEditorBaseFrame', {
            layout : 'fit',
            itemId : 'SQL_pnl',
            region : 'center',
            useFormatBtn: true,
            minWidth: 400
        });

        summary_south.add(self.summary_SQL_Tabpnl, summary_bind_pnl);
        summary_pnl.add(summary_grd, summary_center, summary_south);
        Tabpnl.add(summary_pnl);

        // base layout인 borderlayout 에 각각 배치한다.
        self.workArea.add(Tabpnl);


        // ============================ Grid 영역 ============================//

        self.txn_TabGrid = Ext.create('Exem.BaseGrid', {
            localeType : 'd H:i',
            gridName   : 'pa_sql_history_txn1_gridName',
            itemclick: function(dv, record) {
                self.selectRows(record.data);
            }
        });

        txn_grd_first.add(self.txn_TabGrid);
        /*
         addColumn(TEXT, dataINdex, width, dataType, colume표시여부(true=표시), list 숨김여부(false=표시)
         */
        self.txn_TabGrid.beginAddColumns();
        self.txn_TabGrid.addColumn(common.Util.CTR('Time'),                'TIME',           80 , Grid.DateTime, true , false);
        self.txn_TabGrid.addColumn('WAS_ID',                               'was_id',         100, Grid.StringNumber  , false, true );
        self.txn_TabGrid.addColumn('Agent',                                'was_name',       100, Grid.String  , false, true );
        self.txn_TabGrid.addColumn('TXN ID',                               'txn_id',         100, Grid.String  , false, true );
        self.txn_TabGrid.addColumn(common.Util.CTR('Transaction'),         'txn_name',       200, Grid.String  , true , false);

        self.txn_TabGrid.addColumn(common.Util.CTR('SQL'),                 'sql_text',       300, Grid.String  , true , false);
        self.txn_TabGrid.addColumn(common.Util.CTR('Instance'),            'instance_name',  150, Grid.String  , true , false);

        self.txn_TabGrid.addColumn('DB_ID',                                'db_id',          100, Grid.StringNumber  , false, true );
        self.txn_TabGrid.addColumn('SQL_ID',                               'sql_id',         100, Grid.String  , false, true );
        self.txn_TabGrid.addColumn(common.Util.CTR('SQL Execution Count'), 'sql_exec_count', 120, Grid.Number  , true , false);
        self.txn_TabGrid.addColumn(common.Util.CTR('SQL Elapse (MAX)'),    'sql_elapse_max', 120, Grid.Float   , true , false);
        self.txn_TabGrid.addColumn(common.Util.CTR('SQL Elapse (AVG)'),    'sql_elapse_avg', 120, Grid.Float   , true , false);
        self.txn_TabGrid.addColumn(common.Util.CTR('CPU Time'),            'cpu_time',       100, Grid.Float   , true , false);
        self.txn_TabGrid.addColumn(common.Util.CTR('Wait Time'),           'wait_time',      100, Grid.Float   , true , false);
        self.txn_TabGrid.addColumn(common.Util.CTR('Logical Reads'),       'logical_reads',  100, Grid.Number  , true , false);
        self.txn_TabGrid.addColumn(common.Util.CTR('Physical Reads'),      'physical_reads', 100, Grid.Number  , true , false);
        self.txn_TabGrid.endAddColumns();


        common.WebEnv.set_nondb(self.txn_TabGrid, false);
        self.txn_TabGrid.loadLayout(self.txn_TabGrid.gridName);

        self.txn_TabGrid.contextMenu.addItem({
            title : common.Util.TR('SQL Summary') ,
            fn: function() {
                var record = this.up().record;
                var sqlHistory = common.OpenView.open('TPSQLHistory', {
                    monitorType  : 'TP',
                    fromTime : Ext.util.Format.date(record['TIME'], Comm.dateFormat.HM),
                    toTime   : Ext.util.Format.date(new Date(+new Date(record['TIME']) + 600000), Comm.dateFormat.HM),
                    wasId    : record['was_id'] ,
                    sqlIdTF  : record['sql_id']
                });
                setTimeout(function() {
                    sqlHistory.orderCombo.setValue(orderStore.getAt('0'));
                    sqlHistory.retrieve();
                }, 300);
            }
        }, 0);



        self.txn_second_Grid = Ext.create('Exem.BaseGrid', {
            localeType : 'Y-m-d H:i',
            gridName   : 'pa_sql_history_txn2_gridName'
            // usePager : false
        });

        txn_second_txnSummaryArea.add(self.txn_second_Grid);
        self.txn_second_Grid.beginAddColumns();
        self.txn_second_Grid.addColumn(common.Util.CTR('Time'),                         'TIME',           120, Grid.DateTime,true, false);
        self.txn_second_Grid.addColumn('WAS ID',                                        'was_id',         200, Grid.StringNumber,false, true);
        self.txn_second_Grid.addColumn(common.Util.CTR('Agent'),                        'was_name',       200, Grid.String,true, false);
        self.txn_second_Grid.addColumn('Transaction ID',                                'txn_id',         200, Grid.String,false, true);
        self.txn_second_Grid.addColumn(common.Util.CTR('Transaction'),                  'txn_name',       200, Grid.String,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Transaction Execution Count'),  'txn_exec_count', 120, Grid.Number,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Transaction Elapse Time'),      'txn_elapse',     100, Grid.Float,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Elapse Time (MAX)'),            'max_txn_elapse', 120, Grid.Float,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Elapse Time (AVG)'),            'avg_txn_elapse', 120, Grid.Float,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('SQL Execution Count'),          'sql_exec_count', 120, Grid.Number,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('SQL Elapse Time'),              'sql_elapse',     120, Grid.Float,false, true);
        self.txn_second_Grid.addColumn(common.Util.CTR('SQL Elapse Time (MAX)'),        'max_sql_elapse', 120, Grid.Float,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('SQL Elapse Time (AVG)'),        'avg_sql_elapse', 120, Grid.Float,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Prepare Count'),                'prepare_count',  100, Grid.Number,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Fetch Count'),                  'fetch_count',    100, Grid.Number,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Open Conn'),                    'open_conn',      100, Grid.Number,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Close Conn'),                   'close_conn',     100, Grid.Number,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Open Stmt'),                    'open_stmt',      100, Grid.Number,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Close Stmt'),                   'close_stmt',     100, Grid.Number,true, false);
        self.txn_second_Grid.addColumn(common.Util.CTR('Open RS'),                      'open_rs',        100, Grid.Number,false, true);
        self.txn_second_Grid.addColumn(common.Util.CTR('Close RS'),                     'close_rs',       100, Grid.Number,false, true);
        self.txn_second_Grid.addColumn(common.Util.CTR('Open Object'),                  'open_object',    100, Grid.Number,false, true);
        self.txn_second_Grid.addColumn(common.Util.CTR('Close Object'),                 'close_object',   100, Grid.Number,false, true);
        self.txn_second_Grid.addColumn('Exception',                                     'EXCEPTION',      100, Grid.Number,false, true);
        self.txn_second_Grid.endAddColumns();

        self.txn_second_Grid.loadLayout(self.txn_second_Grid.gridName);

        self.txn_second_Grid.contextMenu.addItem({
            title : common.Util.TR('Transaction Summary'),
            fn: function() {
                var record = this.up().record;
                var txnHistory = common.OpenView.open('TPTxnHistory', {
                    monitorType  : 'TP',
                    fromTime      : Ext.util.Format.date(record['TIME'], Comm.dateFormat.HM),
                    toTime        : Ext.util.Format.date(new Date(+new Date(record['TIME']) + 600000), Comm.dateFormat.HM),
                    transactionTF : '%' + common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId : record['was_id']
                });
                setTimeout(function() {
                    txnHistory.retrieve();
                }, 300);
            }
        }, 0);

        //==================== Active Txn Grid Start ============================

        self.activeTransaction_Grid = Ext.create('Exem.BaseGrid', {
            usePager  : true,
            gridName  : 'pa_sql_history_activeTxn_gridName',
            localeType: 'y-m-d H:i:s'
        });


        self.activeTransaction_Grid.addEventListener('celldblclick', function(me, td, cellIndex, record, tr, rowIndex) {
            var dataRows, dataIndex, txnView, mainTab;
            /*
             SQL1 ~ SQL5 면 해당 SQL iD 를 저장한다음 FullText를 실행하고
             그 외의 cellIndex면 detailView를 Open.
             */
            dataIndex = me.headerCt.gridDataColumns[cellIndex].dataIndex;
            if (rowIndex != undefined) {
                dataRows = record.data;
                switch (dataIndex) {
                    case 'sql_text_1':
                        if (dataRows['sql_text_1'] == '') {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id1']);
                        break;
                    case 'sql_text_2':
                        if (dataRows['sql_text_2'] == '') {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id2']);
                        break;
                    case 'sql_text_3':
                        if (dataRows['sql_text_3'] == '') {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id3']);
                        break;
                    case 'sql_text_4':
                        if (dataRows['sql_text_4'] == '') {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id4']);
                        break;
                    case 'sql_text_5':
                        if (dataRows['sql_text_5'] == '') {
                            return;
                        }
                        self._fullTextCreate(dataRows['sql_id5']);
                        break;

                    default:
                        txnView = Ext.create('view.TransactionDetailView',{
                            startTime  : Ext.util.Format.date(dataRows['start_time'], Comm.dateFormat.HMS),
                            endTime    : Ext.util.Format.date(dataRows['time'], Comm.dateFormat.HMS),
                            wasId      : dataRows['was_id'],
                            name       : dataRows['was_name'],
                            txnName    : common.Util.cutOffTxnExtName(dataRows['txn_name']),
                            tid        : dataRows['tid'],
                            elapseTime : dataRows['elapse_time'],
                            socket     : WS
                        });

                        mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                        mainTab.add(txnView);
                        mainTab.setActiveTab(mainTab.items.length - 1);
                        txnView.init();

                        txnView = null;
                        mainTab = null;

                        break;
                }
            }

        }, this);


        self.activeTransaction_Grid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record, tr, rowIndex) {
            // 활성화 비활성화 할 context Menu Index  = 3
            self.activeTransaction_Grid.contextMenu.setDisableItem(3, false);
            self.activeTransaction_Grid.contextMenu.setDisableItem(4, false);

            // 클릭한 곳에 cellIndex 에 맞는 record "" 이 아니면 visible을 true 로 바꿔주고
            // cellIndex에 따라 sql id 를 넘겨줌
            // cellIndex 가 20~24 이면서 20이면 sql_id1 , ~24면 sql_id5 를 넘겨줌 점프로직에 ..
            var dataRows;
            var dataIndex;
            if (rowIndex != undefined) {
                dataRows = record.data;
                dataIndex = me.headerCt.gridDataColumns[cellIndex].dataIndex;
                switch (dataIndex) {
                    case 'sql_text_1':
                        if (dataRows['sql_text_1'] == '') {
                            return;
                        }
                        self.activeTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.activeTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id1'];
                        break;
                    case 'sql_text_2':
                        if (dataRows['sql_text_2'] == '') {
                            return;
                        }
                        self.activeTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.activeTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id2'];
                        break;
                    case 'sql_text_3':
                        if (dataRows['sql_text_3'] == '') {
                            return;
                        }
                        self.activeTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.activeTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id3'];
                        break;
                    case 'sql_text_4':
                        if (dataRows['sql_text_4'] == '') {
                            return;
                        }
                        self.activeTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.activeTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id4'];
                        break;
                    case 'sql_text_5':
                        if (dataRows['sql_text_5'] == '') {
                            return;
                        }
                        self.activeTransaction_Grid.contextMenu.setDisableItem(3, true);
                        self.activeTransaction_Grid.contextMenu.setDisableItem(4, true);
                        self.activeSqlId = dataRows['sql_id5'];
                        break;

                    default: break;
                }
            }

        }, this);

        txn_second_activeTxnArea.add(self.activeTransaction_Grid);
        self.activeTransaction_Grid.beginAddColumns();
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Time')              , 'time',           120, Grid.DateTime, true, false);
        self.activeTransaction_Grid.addColumn('WAS ID'                             , 'was_id',         100, Grid.StringNumber, false, true);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Agent')             , 'was_name',        80, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn('tid'                                , 'tid',            100, Grid.StringNumber, false, true);
        self.activeTransaction_Grid.addColumn('Transaction ID'                     , 'txn_id',         100, Grid.String, false, true);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Transaction')       , 'txn_name',       200, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Current Method')    , 'class_method',   100, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Method Type')       , 'method_type',    100, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Client IP')         , 'client_ip',      120, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Login Name')        , 'login_name',     100, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Start Time')        , 'start_time',     120, Grid.DateTime, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('CPU Time')          , 'cpu_time',       80, Grid.Float,  true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Thread CPU')        , 'thread_cpu',     80, Grid.Float,  true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('IO Read')           , 'io_read',        80, Grid.Number, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('IO Write')          , 'io_write',       80, Grid.Number, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('DB Time')           , 'db_time',        80, Grid.Float,  true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Wait Time')         , 'wait_time',      80, Grid.Float,  true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Pool')              , 'pool_name',      100, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Elapse Time')       , 'elapse_time',    100, Grid.Float,  true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Instance Name')     , 'instance_name',  130, Grid.String, true, false);

        self.activeTransaction_Grid.addColumn(common.Util.CTR('SID')               , 'sid',            80, Grid.StringNumber, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('State')             , 'state',          120, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Bind Value')         , 'bind_list',      150, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('SQL 1')             , 'sql_text_1',     120, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('SQL 2')             , 'sql_text_2',     120, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('SQL 3')             , 'sql_text_3',     120, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('SQL 4')             , 'sql_text_4',     120, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('SQL 5')             , 'sql_text_5',     120, Grid.String, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('SQL Execution Count') , 'sql_exec_count', 110, Grid.Number, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Fetch Count')       , 'fetch_count',    100, Grid.Number, true, false);

        self.activeTransaction_Grid.addColumn(common.Util.CTR('Prepare Count')     , 'prepare_count',  100, Grid.Number, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('PGA Usage(MB)')     , 'mem_usage',      100, Grid.Float,  true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Logical Reads')     , 'logical_reads',  100, Grid.Number, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Physical Reads')    , 'physical_reads', 100, Grid.Number, true, false);
        self.activeTransaction_Grid.addColumn(common.Util.CTR('Wait Info')         , 'wait_info',      150, Grid.String, true, false);

        self.activeTransaction_Grid.addColumn('Pool ID'               , 'pool_id',    100, Grid.StringNumber, false, true);
        self.activeTransaction_Grid.addColumn('SQL1 ID'               , 'sql_id1',    100, Grid.String, false, true);
        self.activeTransaction_Grid.addColumn('SQL2 ID'               , 'sql_id2',    100, Grid.String, false, true);
        self.activeTransaction_Grid.addColumn('SQL3 ID'               , 'sql_id3',    100, Grid.String, false, true);
        self.activeTransaction_Grid.addColumn('SQL4 ID'               , 'sql_id4',    100, Grid.String, false, true);
        self.activeTransaction_Grid.addColumn('SQL5 ID'               , 'sql_id5',    100, Grid.String, false, true);
        self.activeTransaction_Grid.addColumn('Current CRC ID'        , 'current_crc',100, Grid.StringNumber, false, true);

        self.activeTransaction_Grid.endAddColumns();

        common.WebEnv.set_nondb(self.activeTransaction_Grid, true);
        self.activeTransaction_Grid.loadLayout(self.activeTransaction_Grid.gridName);

        common.WebEnv.setVisibleGridColumn(self.activeTransaction_Grid, ['bind_list'], Comm.config.login.permission.bind !== 1);

        self.activeTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),

            fn: function() {
                var record = this.up().record;

                var txnView = Ext.create('view.TransactionDetailView', {
                    startTime  : Ext.util.Format.date(record['start_time'], Comm.dateFormat.HMS),
                    endTime    : Ext.util.Format.date(record['time'], Comm.dateFormat.HMS),
                    wasId      : record['was_id'],
                    name       : record['was_name'],
                    txnName    : common.Util.cutOffTxnExtName(record['txn_name']),
                    tid        : record['tid'],
                    elapseTime : record['elapse_time'],
                    socket     : WS
                });

                var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.add(txnView);
                mainTab.setActiveTab(mainTab.items.length - 1);
                txnView.init();

                txnView = null;
                mainTab = null;
            }

        }, 0);

        self.activeTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Summary'),
            fn: function() {
                var record = this.up().record;
                var txnHistory = common.OpenView.open('TPTxnHistory', {
                    monitorType  : 'TP',
                    fromTime     : Ext.util.Format.date(common.Util.getDate(self.selectTime), Comm.dateFormat.HM),
                    toTime       : Ext.util.Format.date(common.Util.getDate(self.selectTime + 1200000), Comm.dateFormat.HM),
                    transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId        : record['was_id']
                });
                setTimeout(function() {
                    txnHistory.retrieve();
                }, 300);
            }
        }, 1);

        self.activeTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('SQL Summary'),
            fn : function() {
                var record = this.up().record;
                var sqlHistory = common.OpenView.open('TPSQLHistory', {
                    monitorType  : 'TP',
                    fromTime : self.datePicker.getFromDateTime(),
                    toTime   : self.datePicker.getToDateTime(),
                    sqlIdTF  : self.activeSqlId,
                    wasId    : record['was_id']

                });
                setTimeout(function() {
                    sqlHistory.retrieve();
                }, 300);
            }
        } , 3);

        self.activeTransaction_Grid.contextMenu.addItem({
            title: common.Util.TR('Full SQL Text'),
            fn : function() {
                self._fullTextCreate(self.activeSqlId);
            }
        }, 4);




        //===================== Active Txn Grid End ==============================


        self.txn_bind_Grid = Ext.create('Exem.BaseGrid', {
            // usePager : false,
            gridName   : 'pa_sql_history_txnBind_gridName',
            localeType : 'd H:i:s',
            itemclick: function(dv, record) {
                self.bindSelectRow(record.data);
            }
        });
        txn_bind_pnl.add(self.txn_bind_Grid);
        self.txn_bind_Grid.beginAddColumns();
        self.txn_bind_Grid.addColumn(common.Util.CTR('Time'),        'TIME',        80,  Grid.DateTime, true, false);
        self.txn_bind_Grid.addColumn(common.Util.CTR('Bind Value'),   'bind_list',   250, Grid.String, true, false);
        self.txn_bind_Grid.addColumn(common.Util.CTR('Elapse Time'), 'elapse_time', 100, Grid.Float,  true, false);
        self.txn_bind_Grid.addColumn('Hidden_Bind', 'hidden_bind', 100, Grid.String, false, true);
        self.txn_bind_Grid.endAddColumns();

        common.WebEnv.setVisibleGridColumn(self.txn_bind_Grid, ['bind_list'], Comm.config.login.permission.bind !== 1);
        self.txn_bind_Grid.loadLayout(self.txn_bind_Grid.gridName);
        //========================================================================

        self.summary_TabGrid = Ext.create('Exem.BaseGrid', {
            // usePager : false,
            localeType : 'd H:i',
            gridName : 'pa_sql_history_sum_gridName',
            itemclick: function(dv, record) {
                self.selectRows(record.data);
            }
        });
        summary_grd.add(self.summary_TabGrid);

        self.summary_TabGrid.beginAddColumns();
        self.summary_TabGrid.addColumn('SQL ID',            'sql_id',        100, Grid.String,false, true);
        self.summary_TabGrid.addColumn('WAS ID',            'was_id',        100, Grid.StringNumber,false, true);
        self.summary_TabGrid.addColumn('DB ID',             'db_id',         100, Grid.StringNumber,false, true);

        self.summary_TabGrid.addColumn(common.Util.CTR('Time'),              'TIME',          100, Grid.DateTime,true, false);
        self.summary_TabGrid.addColumn(common.Util.CTR('SQL Text'),          'sql_text',      250, Grid.String, true, false);
        self.summary_TabGrid.addColumn(common.Util.CTR('Execute Count'),     'sql_exec_count',100, Grid.Number, true, false);
        self.summary_TabGrid.addColumn(common.Util.CTR('Elapse Time (MAX)'), 'sql_elapse_max',    120, Grid.Float, true, false);
        self.summary_TabGrid.addColumn(common.Util.CTR('Elapse Time (AVG)'), 'sql_elapse_avg',    120, Grid.Float, true, false);
        self.summary_TabGrid.addColumn(common.Util.CTR('CPU Time'),          'cpu_time',      100, Grid.Float, true, false);
        self.summary_TabGrid.addColumn(common.Util.CTR('Wait Time'),         'wait_time',     100, Grid.Float, true, false);
        self.summary_TabGrid.addColumn(common.Util.CTR('Logical Reads'),     'logical_reads', 100, Grid.Number, true, false);
        self.summary_TabGrid.addColumn(common.Util.CTR('Physical Reads'),    'physical_reads',100, Grid.Number, true, false);
        self.summary_TabGrid.endAddColumns();

        common.WebEnv.set_nondb(self.summary_TabGrid, false);
        self.summary_TabGrid.loadLayout(self.summary_TabGrid.gridName);



        self.summary_TabGrid.contextMenu.addItem({
            title: common.Util.TR('SQL Summary'),
            fn: function() {
                var record = this.up().record;
                var sqlHistory = common.OpenView.open('TPSQLHistory', {
                    monitorType  : 'TP',
                    fromTime : self.datePicker.getFromDateTime(),
                    toTime   : self.datePicker.getToDateTime(),
                    // dbName   : record['instance_name'],
                    // dbId     : record['db_id'],
                    sqlIdTF  : record['sql_id']
                });
                setTimeout(function() {
                    sqlHistory.retrieve();
                }, 300);
            }
        }, 0);

        self.summary_second_Grid = Ext.create('Exem.BaseGrid', {
            // usePager : false,
            gridName : 'pa_sql_history_sum2_gridName',
            itemclick: function(dv, record) {
                self.secondSelectRow(record.data);
            }
        });

        self.summary_second_Grid.beginAddColumns();
        self.summary_second_Grid.addColumn('TXN ID',            'txn_id',        100, Grid.String,false, true);
        self.summary_second_Grid.addColumn('DB ID',             'db_id',         100, Grid.Number,false, true);
        self.summary_second_Grid.addColumn(common.Util.CTR('Transaction'),       'txn_name',      180, Grid.String, true, false);
        self.summary_second_Grid.addColumn(common.Util.CTR('Execute Count'),     'sql_exec_count',100, Grid.StringNumber, true, false);
        self.summary_second_Grid.addColumn(common.Util.CTR('Elapse Time (MAX)'), 'max_elapse',    120, Grid.Float, true, false);
        self.summary_second_Grid.addColumn(common.Util.CTR('Elapse Time (AVG)'), 'avg_elapse',    120, Grid.Float, true, false);
        self.summary_second_Grid.addColumn(common.Util.CTR('CPU Time'),          'cpu_time',      100, Grid.Float, true, false);
        self.summary_second_Grid.addColumn(common.Util.CTR('Wait Time'),         'wait_time',     100, Grid.Float, true, false);
        self.summary_second_Grid.addColumn(common.Util.CTR('Logical Reads'),     'logical_reads', 100, Grid.Number, true, false);
        self.summary_second_Grid.addColumn(common.Util.CTR('Physical Reads'),    'physical_reads',100, Grid.Number, true, false);
        self.summary_second_Grid.endAddColumns();

        self.summary_second_Grid.loadLayout(self.summary_second_Grid.gridName);

        summary_center.add(self.summary_second_Grid);


        self.summary_bind_Grid = Ext.create('Exem.BaseGrid', {
            // usePager : false,
            gridName   : 'pa_sql_history_sumBind_gridName',
            localeType : 'd H:i:s',
            itemclick: function(dv, record) {
                self.bindSelectRow(record.data);
            }
        });
        summary_bind_pnl.add(self.summary_bind_Grid);

        self.summary_bind_Grid.beginAddColumns();
        self.summary_bind_Grid.addColumn(common.Util.CTR('Time'),        'TIME',        80, Grid.DateTime, true, false);
        self.summary_bind_Grid.addColumn(common.Util.CTR('Bind Value'),   'bind_list',   250, Grid.String, true, false);
        self.summary_bind_Grid.addColumn(common.Util.CTR('Elapse Time'), 'elapse_time', 100, Grid.Float, true, false);
        self.summary_bind_Grid.addColumn('Hidden_Bind', 'hidden_bind', 100, Grid.String, false, true);
        self.summary_bind_Grid.endAddColumns();

        self.summary_bind_Grid.loadLayout(self.summary_bind_Grid.gridName);
        common.WebEnv.setVisibleGridColumn(self.summary_bind_Grid, ['bind_list'], Comm.config.login.permission.bind !== 1);
    },

    _fullTextCreate: function(sqlId) {
        var self = this;

        self.winSQLFullText = Ext.create('Exem.FullSQLTextWindow');

        self.winSQLFullText.getFullSQLText(sqlId);
        self.winSQLFullText.show();

    },

    condition_execute: function() {
        var self = this;
        var dataset = {};
        var search_sql,
            sql_txn, sql_summary;

        if (!self.retrieveFlag) {
            return;
        }

        var orderString = 'sql_elapse_avg';
        switch (this.orderCombo.getValue()) {
            case 0:
                orderString = 'sql_elapse_avg';
                this.txn_TabGrid.setOrderAct('sql_elapse_avg', 'desc');
                break;
            case 1:
                orderString = 'sql_elapse_max';
                this.txn_TabGrid.setOrderAct('sql_elapse_max', 'desc');
                break;
            case 2:
                orderString = 'sql_exec_count';
                this.txn_TabGrid.setOrderAct('sql_exec_count', 'desc');
                break;
            default :
                break;
        }

        var limitString = '';
        if (this.topAllToggle.state) {
            if (Comm.currentRepositoryInfo.database_type == 'PostgreSQL') {
                limitString = 'limit 100';
            } else if ( Comm.currentRepositoryInfo.database_type == 'MSSQL' ) {
                limitString = 'top 100';
            } else {
                limitString = 'WHERE ROWNUM <= 100';
            }
        }

        if (self.rdo_sql.getCheckedValue() == 0) {

            search_sql  = self.sqlId_TF.getValue();
            sql_summary = self.sql.summary_first;
            sql_txn     = self.sql.txn_sql_first;
            if (search_sql.toLowerCase() == 'sql id') {
                search_sql = '%';
            }

        } else {
            search_sql  = self.sql_text.getValue();
            sql_summary = self.sql.summary_first_text;
            sql_txn     = self.sql.txn_sql_first_text;
            if (search_sql.toLowerCase() == 'sql text') {
                search_sql = '%';
            }

        }


        dataset.bind = [{
            name: 'FELAPSE',
            value: self.elapseTime_TF.getValue(),
            type: SQLBindType.INTEGER
        }, {
            name: 'max_elapse',
            value: this.maxElapseTime.getValue(),
            type: SQLBindType.INTEGER
        }, {
            name: 'from_time',
            value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type: SQLBindType.STRING
        }, {
            name: 'to_time',
            value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type: SQLBindType.STRING
        }, {
            name: 'sql_id',
            value: search_sql,
            type: SQLBindType.STRING
        }];
        dataset.replace_string = [{
            name: 'was_id',
            value: self.wasField.getValue()
        },{
            name : 'order',
            value: orderString
        }, {
            name : 'limit',
            value: limitString
        }];

        if (self.Tabpnl.getActiveTab().itemId == 'txn_Tab') {

            self.loadingMask.showMask();
            self.txn_TabGrid.clearRows();
            self.txn_second_Grid.clearRows();
            self.txn_bind_Grid.clearRows();
            self.txn_SQL_Tabpnl.clearEditorText();

            dataset.sql_file = sql_txn;
            WS.SQLExec(dataset, self.onData, self);

        } else if (self.Tabpnl.getActiveTab().itemId == 'summary_Tab') {

            self.retrieveFlag = false;
            self.loadingMask.showMask();

            self.summary_TabGrid.clearRows();
            self.summary_second_Grid.clearRows();
            self.summary_bind_Grid.clearRows();
            self.summary_SQL_Tabpnl.clearEditorText();

            dataset.sql_file = sql_summary;
            WS.SQLExec(dataset, self.onData, self);
        }

    },

    executeSQL: function() {
        var self = this;

        var setFromTime = Ext.util.Format.date(this.datePicker.getFromDateTime(), Comm.dateFormat.HM);
        var setToTime   = Ext.util.Format.date(this.datePicker.getToDateTime(), Comm.dateFormat.HM);

        setFromTime = setFromTime.substr(0, setFromTime.length - 1) + '0';
        setToTime   = setToTime.substr(0, setToTime.length - 1) + '0';

        this.datePicker.mainFromField.setValue(setFromTime);
        this.datePicker.mainToField.setValue(setToTime);

        setFromTime = null;
        setToTime = null;

        self.Tabpnl.setActiveTab(0);
        self.txn_second_tabpanel.setActiveTab(0);
        self.retrieveFlag = true;
        self.setLoadingFlag = false;
        self.activeTxnFirstFlag = false;
        self.secondSummaryFlag = false;
        self.condition_execute();
    },

    // blogFlag가 true면 txn 관련, false면 summary 관련
    selectRows: function(adata) {
        var self = this;

        var txn_second_dataset = {}, txn_bind_dataset = {}, activeDataset = {}, summary_second_dataset = {};
        var txn_id = adata['txn_id'],
            sql_id = adata['sql_id'],
            was_id = adata['was_id'];
        var tmpTime = +new Date(adata['TIME']);
        var time = common.Util.getDate(tmpTime);
        var toTime = common.Util.getDate(tmpTime + 600000);
        self.selectTime = tmpTime;
        self.fromTime = time;
        self.toTime   = toTime;
        self.txn_id   = txn_id;
        self.was_id   = was_id;
        self.bindSQL_id = sql_id;

        if (self.Tabpnl.getActiveTab().itemId == 'txn_Tab') {

            if (self.txn_second_Grid.isLoading || self.txn_south_pnl.isLoading) {
                return;
            }

            self.activeTxnFirstFlag = false;
            self.secondSummaryFlag = false;

            if (!self.isLoading) {
                self.txn_second_tabpanel.loadingMask.showMask();
                self.txn_south_pnl.loadingMask.showMask();
            }

            self.txn_SQL_Tabpnl.clearEditorText();
            self.txn_second_Grid.clearRows();
            self.activeTransaction_Grid.clearRows();
            self.txn_bind_Grid.clearRows();

            if (self.txn_second_tabpanel.getActiveTab().itemId == 'activeTxnGrid') {
                activeDataset.bind = [{
                    name: 'from_time',
                    type: SQLBindType.STRING,
                    value: self.fromTime
                }, {
                    name: 'to_time',
                    type: SQLBindType.STRING,
                    value: self.toTime
                }, {
                    name: 'txn_id',
                    type: SQLBindType.STRING,
                    value: self.txn_id
                }, {
                    name: 'sql_id',
                    type: SQLBindType.STRING,
                    value: self.bindSQL_id
                }];
                activeDataset.replace_string = [{
                    name: 'was_id',
                    value: self.was_id
                }];
                activeDataset.sql_file = self.sql.activeTxn;
                WS2.SQLExec(activeDataset, self.onData, self);

                self.activeTxnFirstFlag = true;

            } else {
                txn_second_dataset.bind = [{
                    name: 'from_time',
                    value: time,
                    type: SQLBindType.STRING
                }, {
                    name: 'to_time',
                    value: toTime,
                    type: SQLBindType.STRING
                }, {
                    name: 'txn_id',
                    value: txn_id,
                    type: SQLBindType.STRING
                }];
                txn_second_dataset.replace_string = [{
                    name: 'was_id',
                    value: self.wasField.getValue()
                }];
                txn_second_dataset.sql_file = self.sql.txn_sql_second;
                WS2.SQLExec(txn_second_dataset, self.onData, self);

                self.secondSummaryFlag = true;
            }

            txn_bind_dataset.bind = [{
                name: 'from_time',
                value: time,
                type: SQLBindType.STRING
            }, {
                name: 'to_time',
                value: toTime,
                type: SQLBindType.STRING
            }, {
                name: 'sql_id',
                value: sql_id,
                type: SQLBindType.STRING
            }, {
                name: 'txn_id',
                value: txn_id,
                type: SQLBindType.STRING
            }, {
                name: 'was_id',
                value: was_id,
                type: SQLBindType.INTEGER
            }];
            txn_bind_dataset.sql_file = self.sql.txn_bind;
            WS.SQLExec(txn_bind_dataset, self.onData, self);



        } else if (self.Tabpnl.getActiveTab().itemId == 'summary_Tab') {

            if (self.summary_center.isLoading) {
                return;
            }

            self.summary_center.loadingMask.showMask();
            self.summary_south.loadingMask.showMask();
            self.summary_bind_Grid.clearRows();
            self.summary_second_Grid.clearRows();
            self.summary_SQL_Tabpnl.clearEditorText();

            summary_second_dataset.bind = [{
                name : 'sql_id',
                type: SQLBindType.STRING,
                value: sql_id
            }, {
                name : 'from_time',
                type: SQLBindType.STRING,
                value: time
            }, {
                name : 'to_time',
                type: SQLBindType.STRING,
                value: toTime
            }, {
                name : 'was_id',
                type: SQLBindType.INTEGER,
                value: was_id
            }];

            summary_second_dataset.sql_file = self.sql.summary_second;
            WS.SQLExec(summary_second_dataset, self.onData, self);

        }
    },

    secondSelectRow: function(adata) {
        var self = this;

        self.summary_bind_Grid.clearRows();

        var txn_id = adata['txn_id'];

        var summary_bind_dataset = {};
        summary_bind_dataset.bind = [{
            name: 'sql_id',
            type: SQLBindType.STRING,
            value: self.bindSQL_id
        }, {
            name: 'from_time',
            type: SQLBindType.STRING,
            value: self.fromTime
        }, {
            name: 'to_time',
            type: SQLBindType.STRING,
            value: self.toTime
        }, {
            name: 'was_id',
            type: SQLBindType.INTEGER,
            value: self.was_id
        }, {
            name: 'txn_id',
            type: SQLBindType.STRING,
            value: txn_id
        }];
        summary_bind_dataset.sql_file = self.sql.summary_bind;
        WS.SQLExec(summary_bind_dataset, self.onData, self);
    },

    _rowsBind: function(data, idx) {
        var tmp = [], resultTmp, hiddenIdx, dataKeys, tmpKeys, ix, ixLen, jx, jxLen;
        if (!(data == undefined || data == null)) {
            dataKeys = Object.keys(data);
            for (ix = 0, ixLen = dataKeys.length; ix < ixLen; ix++) {
                tmp = common.Util.convertBindList(data[dataKeys[ix]][idx]);
                resultTmp = [];

                hiddenIdx = data[dataKeys[ix]].length;
                data[ix][hiddenIdx] = data[dataKeys[ix]][idx];

                tmpKeys = Object.keys(tmp);
                for (jx = 0, jxLen = tmpKeys.length; jx < jxLen; jx++) {
                    resultTmp.push(tmp[tmpKeys[jx]].value);
                }

                data[ix][idx] = resultTmp.join(', ');
            }
        }
    },

    bindSelectRow: function(adata) {
        var self = this,
            bindStr;

        bindStr = adata['hidden_bind'];

        self.txn_SQL_Tabpnl.getFullSQLText(self.bindSQL_id, bindStr);
        self.summary_SQL_Tabpnl.getFullSQLText(self.bindSQL_id, bindStr);
    },

    _drawGrid: function(data, target) {
        var ix, ixLen;
        var dataRows;

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            dataRows = data.rows[ix];
            target.addRow(dataRows);
        }

        target.drawGrid();
    },

    _gridClick: function(grid, idx) {
        grid.getView().getSelectionModel().select(idx);
        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
    },

    _bindListConvert: function(data) {
        var tmpBindList = [], resultTmp;
        var dataKeys, tmpKeys, ix, ixLen, jx, jxLen;


        if (!(data == undefined || data == null)) {
            dataKeys = Object.keys(data);
            for (ix = 0, ixLen = dataKeys.length; ix < ixLen; ix++) {
                // bindList 컬럼
                tmpBindList = common.Util.convertBindList(data[dataKeys[ix]][41]);
                // methodType 컬럼
                data[dataKeys[ix]][28] = common.Util.codeBitToMethodType(data[dataKeys[ix]][28]);
                data[dataKeys[ix]][13] = Define.threadStateType[data[dataKeys[ix]][13]];

                resultTmp = [];
                tmpKeys = Object.keys(tmpBindList);
                for (jx = 0, jxLen = tmpKeys.length; jx < jxLen; jx++) {
                    resultTmp.push(tmpBindList[tmpKeys[jx]].value);
                }

                data[ix][42] = resultTmp.join();
            }
        }
    },


    onData: function(aheader, adata) {
        var self = this, resultTmp = [];
        var grid, dataRows, tmpKeys, tmp, loginName, bind_val,
            ix, ixLen, jx, jxLen;

        var command = aheader.command;

        if (self.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(aheader, adata)) {
            self.showMessage(common.Util.TR('ERROR'), aheader.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function() {});
            self.loadingMask.hide();
            self.txn_second_tabpanel.loadingMask.hide();
            self.txn_south_pnl.loadingMask.hide();
            self.summary_center.loadingMask.hide();

            console.warn('SQLHistory-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        if (adata.rows.length > 0) {
            switch (command) {
                case self.sql.txn_sql_first:
                case self.sql.txn_sql_first_text:
                    grid = self.txn_TabGrid.pnlExGrid;

                    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                        dataRows = adata.rows[ix];
                        self.txn_TabGrid.addRow([
                            dataRows[0]    // TIME
                            ,dataRows[1]    // was_id
                            ,dataRows[2]    // was_name
                            ,dataRows[3]    // txn_id
                            ,dataRows[4]    // txn_name
                            ,dataRows[5]    // sql_text
                            ,dataRows[6]    // instance_name
                            ,dataRows[7]    // db_id
                            ,dataRows[8]    // sql_id
                            ,dataRows[9]    // sql_exec_count
                            ,dataRows[10]   // sql_elapse_max
                            ,dataRows[11]   // sql_elapse_avg
                            ,dataRows[12] < 0 ? 0 : dataRows[12] // cpu_time
                            ,dataRows[13]   // wait_time
                            ,dataRows[14]   // logical_reads
                            ,dataRows[15]   // physical_reads
                        ]);
                        // 14-05-28 쿼리변경으로인한 INDEX 변경 - HONGKYUN
                    }

                    self.txn_TabGrid.drawGrid();
                    self._gridClick(grid, 0);
                    break;

                case self.sql.summary_first:
                case self.sql.summary_first_text:
                    grid = self.summary_TabGrid.pnlExGrid;
                    self._drawGrid(adata, self.summary_TabGrid, '');
                    self._gridClick(grid, 0);
                    self.loadingMask.hide();
                    break;

                case self.sql.txn_sql_second:
                    self._drawGrid(adata, self.txn_second_Grid);
                    self.txn_second_tabpanel.loadingMask.hide();
                    break;

                case self.sql.txn_bind:
                    grid = self.txn_bind_Grid.pnlExGrid;
                    self._rowsBind(adata.rows, 1);
                    self._drawGrid(adata, self.txn_bind_Grid);
                    self._gridClick(grid, 0);

                    self.loadingMask.hide();
                    self.txn_south_pnl.loadingMask.hide();

                    self.setLoadingFlag = true;
                    break;

                case self.sql.summary_second:
                    grid = self.summary_second_Grid.pnlExGrid;
                    self._drawGrid(adata, self.summary_second_Grid);
                    self._gridClick(grid, 0);

                    self.summary_center.loadingMask.hide();
                    break;
                case self.sql.summary_bind:
                    grid = self.summary_bind_Grid.pnlExGrid;

                    self._rowsBind(adata.rows, 1);
                    self._drawGrid(adata, self.summary_bind_Grid);
                    self._gridClick(grid, 0);

                    self.summary_south.loadingMask.hide();
                    break;

                case self.sql.activeTxn:
                    self._bindListConvert(adata.rows);

                    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                        dataRows = adata.rows[ix];
                        tmp = common.Util.convertBindList(dataRows[41]);
                        loginName = dataRows[38].split(' ')[0];

                        tmpKeys = Object.keys(tmp);
                        for (jx = 0, jxLen = tmpKeys.length; jx < jxLen; jx++) {
                            resultTmp.push(tmp[tmpKeys[jx]].value);
                        }

                        bind_val = resultTmp.join(', ');

                        self.activeTransaction_Grid.addRow([
                            dataRows[0]     // time
                            , dataRows[1]     //  was_id
                            , dataRows[2]     //  was_name
                            , dataRows[3]     //  tid
                            , dataRows[4]     //  txn_id
                            , dataRows[5]     //  txn_name
                            , dataRows[27]    //  class_method
                            , dataRows[28]    //  method_type(컨버팅)
                            , dataRows[6]     //  client_ip
                            , loginName       //  login_name
                            , dataRows[7]     //  start_time
                            , dataRows[30] < 0 ? 0 : dataRows[30] // cpu_time
                            , dataRows[37]    //  thread_cpu
                            , dataRows[39]    //  io_read
                            , dataRows[40]    //  io_write
                            , dataRows[32]    //  db_time
                            , dataRows[31]    //  wait_time
                            , dataRows[10]    //  pool_name
                            , dataRows[8]     //  elase_time
                            , dataRows[11]    //  instance_name
                            , dataRows[12]    //  sid
                            , dataRows[13]    //  state(컨버팅)
                            , bind_val    //  bind_list(컨버팅)
                            , dataRows[15]    //  sql_text_1
                            , dataRows[17]    //  sql_text_2
                            , dataRows[19]    //  sql_text_3
                            , dataRows[21]    //  sql_text_4
                            , dataRows[23]    //  sql_text_5
                            , dataRows[24]    //  sql_exec_count
                            , dataRows[25]    //  fetch_count
                            , dataRows[26]    //  prepare_count
                            , dataRows[33]    //  mem_usage
                            , dataRows[34]    //  logical_reads
                            , dataRows[35]    //  physical_reads
                            , dataRows[36]    //  wait_info
                            , dataRows[9]    //  pool_id
                            , dataRows[14]    //  sql_id1
                            , dataRows[16]    //  sql_id2
                            , dataRows[18]    //  sql_id3
                            , dataRows[20]    //  sql_id4
                            , dataRows[22]    //  sql_id5
                            , dataRows[29]    //  current_crc
                        ]);
                    }

                    self.activeTransaction_Grid.drawGrid();
                    self.txn_second_tabpanel.loadingMask.hide();
                    break;

                default : break;
            }
        } else if (command == self.sql.txn_bind) {
            self.txn_SQL_Tabpnl.getFullSQLText(self.bindSQL_id);
            self.txn_south_pnl.loadingMask.hide();
            self.loadingMask.hide();
        } else if (command == self.sql.summary_second || command == self.sql.activeTxn || command == self.sql.txn_sql_second) {
            self.txn_second_tabpanel.loadingMask.hide();
            self.loadingMask.hide();
        } else if (command == self.sql.summary_bind) {
            self.summary_SQL_Tabpnl.getFullSQLText(self.bindSQL_id);
            self.summary_south.loadingMask.hide();
            self.loadingMask.hide();
        } else {
            self.txn_id   = 0;
            self.was_id   = 0;
            self.bindSQL_id = 0;
            self.txn_SQL_Tabpnl.clearEditorText();
            self.txn_second_Grid.clearRows();
            self.activeTransaction_Grid.clearRows();
            self.txn_bind_Grid.clearRows();
            self.loadingMask.hide();

            console.info('Ondata-callback', 'no data');
        }
    }
});