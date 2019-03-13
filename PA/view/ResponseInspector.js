Ext.define('view.ResponseInspector', {
    extend: 'Exem.Form',
    layout: 'vbox',
    minWidth: 1080,
    width: '100%',
    title: '',
    isInitResize: true,
    isInitActivate: true,

    layoutType: 'withLive', // withLive or withoutLive
    parentScatter: null,    // withLive일 경우 필수
    detailScatterYRange: 'dataSensitive',  // fixed or dataSensitive
    isStandAlone: false,
    isExtBankMode: false,
    isAllWasRetrieve: false,
    autoRetrieveRange: null,
    retrRangeBeforeDragDetail: null,
    tid: null,  // RTM ALERT 에서 넘여주는 프로퍼티값
    isChartDataVisible : true,
    isChartDom  : true,
    isRTM       : false,

    cls : 'list-condition Exem-FormOnCondition',

    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        },

        afterlayout: function() {
            if (!this.isChartDom) {
                this.retrieveScatter();
                this.isChartDom = true;
            }
        },
        activate: function() {
            if (!this.isChartDataVisible) {
                this.detailScatter.fireEvent('resize');
                this.isChartDataVisible = true;
            }
            this.isInitActivate = false;
        }
    },

    init: function() {
        var me = this,
            prevBtn;

        this.retrieve_loading = false;

        //그리드 클릭한 로우 인덱스 담는 변수.
        this.select_idx         = null;
        this.select_idx_cht     = null;
        this.select_idx_tree    = null;
        this.select_idx_browser = null;

        this.allDetailGridData = null;
        this.retrieve_click    = false;

        // 2016.09.09 점차트 범위 이외 그리드 출력 제거를 위한 변수
        this.tmpMinElapse = 0;
        this.tmpMaxElapse = 0;
        this.tmpFromVal = '';
        this.tmpToVal = '';
        this.isInit = false;                // tmpMinElapse, tmpMaxElapse가 잡히고 난 이후에는 retrieve 버튼을 누르기 전까지 true로 고정
        this.isInit_browser_time = true;    // detailListGrid row select때 로딩을 제외하기 위한 변수


        this.conditionBox = Ext.create('Exem.Container', {
            width: '100%',
            height: 39,
            layout: 'hbox',
            style : {
                background: '#ffffff',
                borderRadius: '6px'
            }
        });

        var conditionArea = Ext.create('Ext.container.Container', {
            flex: 1,
            height: '100%',
            layout: 'absolute'
        });
        this.conditionArea = conditionArea;

        if (Comm.isBGF) {
            prevBtn = document.createElement('img');
            prevBtn.style.opacity = 0.5;
            prevBtn.src = '../images/LeftArrow_White_On.png';
            prevBtn.style.position = 'absolute';
            prevBtn.style.top = '0px';
            prevBtn.style.left = '10px';
            prevBtn.style.cursor = 'pointer';
            prevBtn.onclick = function() {
                me.destroy();
            };
            prevBtn.onmouseover = function() {
                this.style.opacity = 1;
            };
            prevBtn.onmouseout = function() {
                this.style.opacity = 0.5;
            };
            setTimeout(function() {
                conditionArea.getEl().appendChild(prevBtn);
            }, 10);
        }

        this.datePicker = Ext.create('Exem.DatePicker', {
            width: 110,
            x: 32,
            y: 5,
            executeSQL: this.executeSQL,
            executeScope: this,
            rangeOneDay: true
        });


        var fDate = new Date((new Date()) - 20 * 60 * 1000);
        var tDate = new Date();

        fDate.setSeconds(0);
        fDate.setMilliseconds(0);

        tDate.setSeconds(0);
        tDate.setMilliseconds(0);

        this.datePicker.mainFromField.setValue( this.datePicker.dataFormatting(fDate, this.datePicker.DisplayTime));
        this.datePicker.mainToField.setValue( this.datePicker.dataFormatting(tDate, this.datePicker.DisplayTime));


        this.wasField = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 300,
            comboLabelWidth : 60,
            comboWidth      : 260,
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            x               : 400,
            y               : 5,
            linkMonitorType : 'WAS'
        });

        this.minElapseField = Ext.create('Exem.NumberField', {
            x: 715,
            y: 5,
            width: 145,
            fieldLabel: common.Util.CTR('Elapsed Time'),
            labelWidth: 90,
            fieldStyle: 'text-align: right;',
            value: 1,
            maxLength: 9,
            hideTrigger: true,
            decimalPrecision: 3,
            allowExponential: false
        });
        var elapseTideLabel = Ext.create('Ext.form.Label', {
            x: 861,
            y: 10,
            text : '~'
        });
        this.maxElapseField = Ext.create('Exem.TextField', {
            x: 870,
            y: 5,
            width: 50,
            labelWidth: 0,
            fieldStyle: 'text-align: right;',
            value: common.Util.CTR('infinite'),
            maxLength: 9
        });
        var infinityBtn = Ext.create('Exem.Container', {
            x: 923,
            y: 10,
            width: 18,
            height: 13,
            html: '<img src="../images/infinity.png" class="res-inspector-infinity-btn"/>',
            listeners: {
                render: function() {
                    this.getEl().addListener('click', function() {
                        me.maxElapseField.setValue(common.Util.TR('infinite'));
                        me.detailScatter.detailScatterYRange = 'dataSensitive';
                    });
                }
            }
        });
        this.chartToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x       : 1000,
            y       : 10,
            onText  : common.Util.TR('Chart Retrieve'),
            offText : common.Util.TR('All Retrieve'),
            state   : this.chartToggleValue(),
            hidden  : !common.Menu.useTxnResponseChart
        });
        conditionArea.add([this.datePicker, this.wasField,
            this.minElapseField, elapseTideLabel, this.maxElapseField, infinityBtn, this.chartToggle]);

        this.txnNameField = Ext.create('Exem.TextField', {
            itemId: 'txnNameField',
            fieldLabel: common.Util.CTR('Transaction Name'),
            labelWidth: 120,
            x: 10,
            y: 40,
            width: 410,
            value: '%',
            maxLength: 300
        });
        this.ipField = Ext.create('Exem.TextField', {
            fieldLabel: 'IP',
            labelWidth: 20,
            x: 495,
            y: 40,
            width: 170,
            value: '%',
            maxLength: 20
        });
        this.loginNameField = Ext.create('Exem.TextField', {
            fieldLabel: common.Util.CTR('Login Name'),
            labelWidth: 80,
            x: 725,
            y: 40,
            width: 195,
            value: '%',
            maxLength: 50
        });


        this.fetchCntField = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.CTR('Fetch Count >= '),
            labelWidth: 100,
            x: 55,
            y: 70,
            value: 0,
            width: 165,
            // fieldStyle: 'text-align: right;',
            maxLength: 7,
            step: 100,
            allowExponential: false
        });


        this.sqlElapseField = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.CTR('SQL Elapse Time >= '),
            labelWidth: 130,
            // fieldStyle: 'text-align: right;',
            x: 233,
            y: 70,
            value: 0,
            width: 187,
            maxLength: 9,
            step: 0.1,
            decimalPrecision: 3,
            allowExponential: false
        });


        this.sqlExecField = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.CTR('SQL Executions >= '),
            labelWidth: 120,
            // fieldStyle: 'text-align: right;',
            x: 485,
            y: 70,
            width: 180,
            value: 0,
            minValue: 0,
            maxLength: 7,
            allowExponential: false
        });


        this.gidField = Ext.create('Exem.TextField', {
            fieldLabel: 'GUID',
            labelWidth: 80,
            x: 725,
            y: 70,
            width: 195,
            value: '%',
            maxLength: 300
        });

        this.tidField = Ext.create('Exem.TextField', {
            fieldLabel: 'TID',
            labelWidth: 80,
            x: 935,
            y: 70,
            width: 195,
            value: '',
            defaultEmptyText: '',
            maxLength: 300,
            maskRe :  /^[-]?[0-9]*$/
        });

        this.pcidField = Ext.create('Exem.TextField', {
            fieldLabel: 'PCID',
            labelWidth: 80,
            x: 935,
            y: 40,
            width: 195,
            value: '',
            defaultEmptyText: '',
            maxLength: 300
        });

        if (common.Menu.usePcidFilter) {
            conditionArea.add([
                this.txnNameField, this.ipField, this.loginNameField, this.pcidField,
                this.fetchCntField, this.sqlElapseField,
                this.sqlExecField, this.gidField, this.tidField
            ]);
        } else {
            conditionArea.add([
                this.txnNameField, this.ipField, this.loginNameField,
                this.fetchCntField, this.sqlElapseField,
                this.sqlExecField, this.gidField, this.tidField
            ]);
        }

        if (this.isExtBankMode) {
            this.extBankField = Ext.create('Exem.TextField', {
                x: 280,
                y: 100,
                width: 215,
                fieldLabel: common.Util.TR('Ext Bank Code'),
                labelWidth: 150,
                fieldStyle: 'text-align: right;'
            });
            this.extBankField.setValue(window.selectedBank);
            conditionArea.add(this.extBankField);
        }


        var retrieveArea = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: 180,
            height: '100%'
        });

        this.detailToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x: -20,
            y: 10,
            width: 95,
            onText: common.Util.TR('Detail'),
            offText: common.Util.TR('Common'),
            resizeHandle: false,
            state: false,
            listeners: {
                change: function(toggle, state) {
                    me.toggle_slide(state);
                }
            }
        });
        var retrieveBtn = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Retrieve'),
            x: 80,
            y: 8,
            width: 90,
            height: 25,
            cls: 'retrieve-btn',
            handler: function() {
                me.autoRetrieveRange = null;
                me.tid = '';
                me.retrieve();
            }
        });

        this.exceptionToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x: -20,
            y: 40,
            width: 110,
            onText: common.Util.TR('All'),
            offText: common.Util.TR('Exception'),
            state: true
        });
        retrieveArea.add([this.detailToggle, retrieveBtn, this.exceptionToggle]);

        this.conditionBox.add([conditionArea, retrieveArea]);




        //****************************************************************************************
        //****************************************************************************************
        //********** condition. retrieve btn제외한 하단영역은 따로 (min) ***************************
        //****************************************************************************************
        //****************************************************************************************
        this.workArea = Ext.create('Ext.container.Container', {
            width : '100%',
            height: '100%',
            flex  : 1,
            layout: 'border',
            border: false,
            cls   : 'Exem-Form-workArea',
            style : {
                borderRadius: '6px'
            }
        });


        this.left_pnl = Ext.create('Exem.Container',{
            region: 'west',
            layout: 'fit',
            width : '40%',
            heigth: '100%',
            split : true,
            border: false,
            listeners: {
                resize: function() {
                    if (!me.isInitResize) {
                        setTimeout(function() {
                            me.detailScatter.fireEvent('resize');
                        }, 10);
                    }
                    me.isInitResize = false;
                }
            }
        });


        this.right_pnl = Ext.create('Exem.Container',{
            region: 'center',
            layout: 'fit' ,
            width : '60%',
            heigth: '100%'
        });



        var scatterBox, gridBox;

        if (this.layoutType == 'withLive') {
            scatterBox = Ext.create('Ext.panel.Panel', {
                layout: 'vbox',
                flex  : 4,
                height: '100%',
                border: 1,
                split : true ,
                region: 'west'
            });

            gridBox = Ext.create('Ext.panel.Panel', {
                layout: 'vbox',
                flex  : 6,
                height: '100%',
                border: 1,
                split : true ,
                region: 'center'
            });
        } else if (this.layoutType == 'withoutLive') {
            scatterBox = Ext.create('Ext.panel.Panel', {
                layout: 'vbox',
                flex: 3,
                width: '100%',
                border: 1
            });

            gridBox = Ext.create('Ext.panel.Panel', {
                layout: 'vbox',
                flex: 7,
                width: '100%',
                border: 1
            });
        }

        var detailScatterBox = Ext.create('Exem.Panel', {
            layout: 'fit',
            flex: 1,
            width: '100%',
            minHeight: 200,
            border: 0,
            margin: '0 20 20 20',
            listeners: {
                afterrender: function() {
                    if (me.autoRetrieveRange !== null) {
                        this.setLoading(true);
                    }
                }
            }
        });
        this.detailScatterBox = detailScatterBox;

        var detailScatterWrap = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            flex: 1,
            width: '100%',
            minHeight: 265,
            border: 1
        });

        this.detailScatter = Ext.create('Exem.chart.D3ScatterSelectable', {
            type: 'detail',
            target: detailScatterBox,
            parentView: me
        });
        this.detailScatter.detailScatterYRange = this.detailScatterYRange;

        if (this.layoutType == 'withLive') {
            this.bottom_cont = Ext.create('Exem.Panel', {
                layout: 'fit',
                flex: 1,
                width: '100%',
                heigth: '100%',
                minHeight: 260,
                border: 1
            });

            //transaction summary grid
            //transcation chart
            //call tree
            this.bottom_tab = Ext.create('Exem.TabPanel',{
                width : '100%',
                heigth: '100%',
                flex  : 1,
                layout: 'fit',
                itemId: 'bottom_tab',
                // activeTab: 0,
                items : [{
                    title: common.Util.TR('Transaction Summary'), layout: 'fit', tab_idx: 0, itemId: 'tab_txn'     , border: 0
                }, {
                    title: common.Util.TR('Transaction Chart')  , layout: 'fit', tab_idx: 1, itemId: 'tab_txnchart', border: 0
                }, {
                    title: common.Util.TR('Call Tree')          , layout: 'fit', tab_idx: 2, itemId: 'tab_calltree', border: 0
                }, {
                    title: common.Util.TR('Browser Time')       , layout: 'fit', tab_idx: 3, itemId: 'tab_browsertime', border: 0
                }],
                listeners:{
                    scope: this,
                    tabchange: function(tabPanel, newCard) {
                        var self = this;

                        //validation
                        if ( newCard.title !== common.Util.TR('Transaction Chart')
                          && newCard.title !== common.Util.TR('Call Tree')
                          && newCard.title !== common.Util.TR('Browser Time')
                        ) {
                            return;
                        }

                        self._call_item_click();
                    }
                }
            });


            //transaction summary grid
            this._create_txn_grid();
            //transcation chart
            this._create_txn_chart();
            //call tree
            this._create_call_tree();
            //browser time
            this._create_browser_time();

            this.bottom_cont.add(this.bottom_tab);
            //1,2번째탭은 visible = false
            //retrieve클릭후 데이터가 하나라도있는경우에만 visible = true
            this.bottom_tab.tabBar.items.items[1].setVisible(false);
            this.bottom_tab.tabBar.items.items[2].setVisible(false);
            this.bottom_tab.tabBar.items.items[3].setVisible(false);
        }

        this.detailListGrid = Ext.create('Exem.BaseGrid', {
            itemId      : 'txnDetailGrid',
            gridName    : 'pa_txn_trend_detail_gridName',
            minHeight   : 500,
            margin      : '0 0 0 0',
            border      : 0,
            usePager    : true,
            defaultPageSize: 1000,
            defaultbufferSize   : 0,
            localeType  : 'd H:i:s.u',
            scope       : this ,
            itemSelect   : function(dv, record, index) {
                //flag check
                if ( index == undefined ) {
                    index = this.scope.select_idx;
                } else {
                    this.scope.select_idx = index;
                }

                switch ( this.scope.bottom_tab.getActiveTab().tab_idx ) {
                    case 1:

                        if ( this.scope.select_idx_cht == index ) {
                            return;
                        }

                        this.scope.retrieve_txn_chart(record);
                        this.scope.select_idx_cht = index;

                        break;

                    case 2:

                        if ( this.scope.select_idx_tree == index ) {
                            return;
                        }

                        this.scope.retrieve_call_tree(record);
                        this.scope.select_idx_tree = index;

                        break;

                    case 3:

                        if ( this.scope.select_idx_browser == index || !this.scope.isInit_browser_time) {
                            return;
                        }

                        this.scope.retrieve_browser_time(record);
                        this.scope.select_idx_browser = index;

                        break;
                    default :
                        break;
                }
            },
            cellclick: function(thisGrid, td, cellIndex, record) {
                if ( thisGrid.getHeaderCt().getHeaderAtIndex(cellIndex).dataIndex !== 'exception_type') {
                    return;
                }

                if ( record.data.exception_type == '' || record.data.exception_type == undefined ) {
                    return;
                }

                var excepHistory;

                if (record.data.exception_type == 'UnCaught Exception') {
                    openTxnDetail(record.data);
                } else {
                    excepHistory = common.OpenView.open('ExceptionHistory', {
                        fromTime: Ext.util.Format.date(new Date(+new Date(record.data.time) - 1200000), Comm.dateFormat.HM),
                        toTime  : Ext.util.Format.date(new Date(+new Date(record.data.time) + 600000), Comm.dateFormat.HM), // 10분 더하기
                        wasId   : record.data.was_id,
                        exceptionName_TF: record.data.exception_type
                    });

                    setTimeout(function() {
                        excepHistory.executeSQL();
                    }, 300);
                }
            },
            itemdblclick: function(_this, record) {
                openTxnDetail(record.data);
            }
        });

        this.fromRowIndex = 0;
        this.loadDataRow  = 10000;
        this.maxLoadCount = Comm.excelExportLimitRow || 50000;
        this.limitData = 0;
        this.limitFrom = 0;

        if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
            this.defaultLimitData = this.loadDataRow;
        } else {
            this.defaultLimitData = 'LIMIT ' + this.loadDataRow;
        }

        this.detailListGrid.pnlExGridPager.add({
            xtype: 'button',
            itemId: 'grid_detail_list_more_btn',
            text: common.Util.TR('More Load'),
            margin: '0 0 0 10',
            border: true,
            handler: function() {
                if (!me.isNotMoreData) {
                    me.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
                    me.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);
                    me.fromRowIndex += me.loadDataRow;
                    me.isAddGridData = true;
                    me.isAddTxnGridData = true;
                    if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
                        me.limitData = me.defaultLimitData +  me.fromRowIndex;
                        me.limitFrom = me.fromRowIndex;
                    } else {
                        me.limitData = me.defaultLimitData + ' OFFSET ' + me.fromRowIndex;
                    }
                    me.retrieveGrid();
                }
            }
        },{
            xtype: 'button',
            itemId: 'grid_detail_list_fetch_all',
            text: common.Util.TR('Fetch All'),
            margin: '0 0 0 10',
            border: true,
            handler: function() {
                this.setVisible(false);
                me.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
                me.isAddGridData = false;
                me.isAddTxnGridData = false;
                if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
                    me.limitData = me.maxLoadCount;
                    me.limitFrom = 0;
                } else {
                    me.limitData = 'LIMIT ' + me.maxLoadCount;
                }
                me.retrieveGrid();
            }
        });

        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);

        this.detailListGrid.on('afterrender', function() {
            if (me.autoRetrieveRange !== null) {
                this.setLoading(true);
            }
        });

        function openTxnDetail(record) {
            var txnView = Ext.create('view.TransactionDetailView',{
                endTime: record.time,
                wasId: record.was_id,
                name: record.was_name,
                txnName: record.txn_name,
                tid: record.tid,
                startTime: record.start_time,
                elapseTime : record.txn_elapse,
                gid: record.gid,
                socket: WS
            });

            var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTab.add(txnView);
            mainTab.setActiveTab(mainTab.items.length - 1);
            txnView.init();

            txnView = null;
            mainTab = null;
        }


        this.detailListGrid.pnlExGrid.on('select', function(scope, record) {
            me.detailScatter.setFocus(record.data['time'], record.data['txn_elapse']);
        });


        this.detailListGrid.pnlExGrid.on('cellclick', function(view, td) {
            common.Util.setClipboard(td.children[0].innerHTML);
        });


        function exceptionRenderer(value, meta, record) {
            if (record.data.EXCEPTION > 0 && meta.column.dataIndex === 'exception_type') {
                meta.style = 'background-color:lightcoral;';
            }

            return value;

        }

        this.detailListGrid.beginAddColumns();
        this.detailListGrid.addColumn(common.Util.CTR('Time'),                   'time'          , 115 , Grid.DateTime, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Agent'),                  'was_name'      , 150, Grid.String, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Transaction'),            'txn_name'      , 250, Grid.String, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Start Time'),             'start_time'    , 115, Grid.DateTime, true , false);
        this.detailListGrid.addColumn(common.Util.CTR('Elapse Time'),            'txn_elapse'    , 90 , Grid.Float , true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Exception'),              'exception_type', 90 , Grid.String, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Client IP'),              'client_ip'     , 110, Grid.String, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Transaction CPU TIME'),   'txn_cpu_time',   90,  Grid.Float,    true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('SQL Elapse Time'),        'sql_elapse'    , 75 , Grid.Float , true, false);
        this.detailListGrid.addColumn(common.Util.CTR('SQL Execution Count'),    'sql_exec_count', 75 , Grid.Number, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('SQL Fetch Count'),        'fetch_count'   , 75 , Grid.Number, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('SQL Fetch Time'),         'fetch_time'    , 80, Grid.Float,  true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Remote Elapse Time'),     'remote_elapse' , 95 , Grid.Float , true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Remote Execution Count'), 'remote_count'  , 95 , Grid.Number, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Login Name'),             'login_name'    , 110, Grid.String, true, false);
        this.detailListGrid.addColumn(common.Util.CTR('Browser'),                'browser'       , 70 , Grid.String, false, false);
        this.detailListGrid.addColumn('TID',                                     'tid'           , 155, Grid.String, false, false);
        this.detailListGrid.addColumn('WAS ID',                                  'was_id'        , 135, Grid.Number, false, false);
        this.detailListGrid.addColumn('RAW TIME',                                'raw_time'      , 135, Grid.String, false, true);
        this.detailListGrid.addColumn('TXN ID',                                  'txn_id'        , 135, Grid.String, false, true);
        this.detailListGrid.addColumn('SQL Elapse(AVG)',                         'sql_elapse_avg', 135, Grid.Float , false, true);
        this.detailListGrid.addColumn('Exception Count',                         'EXCEPTION'     , 65 , Grid.Number, false, false);
        this.detailListGrid.addColumn(common.Util.CTR('FSID'),                   'fsid'          , 155, Grid.String, false, false);
        this.detailListGrid.addColumn(common.Util.CTR('PCID'),                   'pcid'          , 155, Grid.String, false, false);
        this.detailListGrid.addColumn(common.Util.CTR('GUID'),                   'guid'          , 155, Grid.String, false, false);
        this.detailListGrid.addColumn(common.Util.CTR('Transaction Code'),       'tx_code'       , 110, Grid.String, true, false);
        ///this.detailListGrid.addColumn(common.Util.CTR('URL'),                   'url'           , 200, Grid.String, false, false);
        this.detailListGrid.endAddColumns();

        this.detailListGrid.loadLayout(this.detailListGrid.gridName);

        this.detailListGrid.addRenderer('exception_type', exceptionRenderer , RendererType.bar);
        this.detailListGrid.setOrderAct('txn_elapse', 'DESC');

        this.detailListGrid.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),
            fn: function() {
                openTxnDetail(this.up().record);
            }
        }, 0);

        if (!this.isStandAlone) {
            if (!Comm.isBGF) {
                this.detailListGrid.contextMenu.addItem({
                    title: common.Util.TR('Transaction Summary'),
                    fn: function() {
                        var record = this.up().record;
                        var txnHistory = common.OpenView.open('TxnHistory', {
                            fromTime: Ext.util.Format.date(new Date(+new Date(record['time']) - 1200000), Comm.dateFormat.HM),
                            toTime  : Ext.util.Format.date(new Date(+new Date(record['time']) + 600000), Comm.dateFormat.HM), // 10분 더하기
                            wasId: record['was_id'],
                            transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name'])
                        });

                        setTimeout(function() {
                            txnHistory.executeSQL();
                        }, 300);
                    }
                }, 1);
            }

            this.detailListGrid.addEventListener('cellcontextmenu',
                function(grid, td, cellIndex, record) {
                    if (record.data['exception_type'] == '') {
                        me.detailListGrid.contextMenu.setVisibleItem(2, false);
                    } else {
                        me.detailListGrid.contextMenu.setVisibleItem(2, true);
                    }
                }
            );
        }



        if (this.layoutType == 'withLive') {
            var detailScatterTitle = Ext.create('Ext.panel.Panel', {
                html: '<p class="res-inspector-title">' + common.Util.TR('Response Time Chart') + '</p>',
                width: '100%',
                height: 30,
                margin: '15 0 0 30',
                border: 0
            });

            detailScatterWrap.add(detailScatterTitle);
            scatterBox.add(this.bottom_cont);
        }
        detailScatterWrap.add(detailScatterBox);
        scatterBox.insert(0, detailScatterWrap);

        gridBox.add(this.detailListGrid);

        this.add([this.conditionBox, { xtype: 'tbspacer', itemId: 'spacer', height:10, width: '100%', background: '#e9e9e9'}, this.workArea]);
        this.left_pnl.add( scatterBox );
        this.right_pnl.add( gridBox );
        this.workArea.add( this.left_pnl, this.right_pnl);


        if (this.autoRetrieveRange !== null) {
            this.setRetrieveRange(this.autoRetrieveRange);

            if (this.autoRetrieveRange.wasName) {
                if (this.autoRetrieveRange.wasName == 'All') {
                    this.wasField.selectByIndex(0);
                } else {
                    this.wasField.selectByValues(this.autoRetrieveRange.wasName);
                }
            }

            //rtm에서 넘어오는 ip가 하나면 그냥 하나.
            //여러개면 맨첫배열에 있는 *있는 값으로 set.
            if ( this.autoRetrieveRange.ip && this.autoRetrieveRange.ip != '%') {
                if ( this.autoRetrieveRange.ip[0] == this.autoRetrieveRange.ip[0].replace('*', '%') ){
                    this.ipField.setValue(this.autoRetrieveRange.ip[0]);
                }

                this.toggle_slide(true);
            }
            this.retrieve();
        }
        this.isAllWasRetrieve = false;
    },

    toggle_slide: function(state) {
        if (state) {
            this.conditionBox.setHeight(105);
        } else {
            this.conditionBox.setHeight(39);

            this.txnNameField.setValue('%');
            this.ipField.setValue('%');
            this.gidField.setValue('%');
            this.tidField.setValue('');
            this.pcidField.setValue('');
            this.loginNameField.setValue('%');
            this.sqlElapseField.setValue(0);
            this.sqlExecField.setValue(0);
            this.fetchCntField.setValue(0);
            if (!this.exceptionToggle.getValue()) {
                this.exceptionToggle.toggle();
            }
        }
    } ,

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

    setRetrieveRange: function(retrieveRange, fromDetail) {
        if (!fromDetail) {
            this.retrRangeBeforeDragDetail = retrieveRange;
        }
        this.fromTime = Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s' );
        this.toTime   = Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s' );

        this.msFromTime = Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s.u' );
        this.msToTime   = Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s.u' );
        this.minElapse= parseFloat(retrieveRange.elapseRange[0]);


        var tmp = retrieveRange.txnName;
        if ( tmp == undefined ) {
            tmp = '%';
        }

        if (!fromDetail) {
            this.txnNameField.setValue( tmp );
        }

        if (retrieveRange.elapseRange[1] !== 'infinite') {
            this.maxElapse = parseFloat(retrieveRange.elapseRange[1]);
        } else {
            this.maxElapse = 100000000;
            this.init_elapse_max = this.maxElapse;
        }

        if ( this.init_time == undefined || this.init_time == null ){
            this.init_time = [];
            this.init_time[0] = this.fromTime;
            this.init_time[1] = this.toTime;
        }

        this.datePicker.mainFromField.setValue( this.datePicker.dataFormatting(retrieveRange.timeRange[0], this.datePicker.DisplayTime));
        this.datePicker.mainToField.setValue( this.datePicker.dataFormatting(retrieveRange.timeRange[1], this.datePicker.DisplayTime));

        if (retrieveRange.isExceptoin) {
            this.detailToggle.toggle();
            this.exceptionToggle.toggle();
        }

        if (retrieveRange.tid > 0) {
            this.detailToggle.toggle();
            this.tidField.setValue(retrieveRange.tid);
        }

        if (!this.isInit) {
            this.tmpMaxElapse = this.maxElapse / 1000;
            this.tmpMinElapse = this.minElapse / 1000;
            this.tmpFromVal = this.datePicker.mainFromField.getValue();
            this.tmpToVal = this.datePicker.mainToField.getValue();
            this.isInit = true;
        }


        this.detailScatter.yRange = [this.minElapse/1000, this.maxElapse/1000];
        this._updateElapseRangeField();
    },

    filterGrid: function(elapse_value, all_data) {
        if ( all_data ) {
            if (this.chartToggle.getValue()) {
                this.detailListGrid.clearRows();
                this.detailListGrid.drawGrid();
                this.grd_txn.clearRows();
                this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
                this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);

                this.select_idx_cht     = null;
                this.select_idx_tree    = null;
                this.select_idx_browser = null;

                this.bottom_tab.setActiveTab(0);

                this.bottom_tab.tabBar.items.items[1].setVisible(false);
                this.bottom_tab.tabBar.items.items[2].setVisible(false);
                this.bottom_tab.tabBar.items.items[3].setVisible(false);
                this.detailListGrid.getEl().dom.style.opacity = '0.3';
                this.grd_txn.getEl().dom.style.opacity = '0.3';
                this.detailListGrid.setDisabled(true);
                this.grd_txn.setDisabled(true);
                return;
            }

            if (!this.allDetailGridData) {
                this.detailListGrid.getEl().dom.style.opacity = '1';
                this.grd_txn.getEl().dom.style.opacity = '1';
                this.detailListGrid.setDisabled(false);
                this.grd_txn.setDisabled(false);
                this.retrieveGrid();
            } else {
                this.allData = true;

                var me = this;

                if ( isNaN(this.init_elapse_max) ){
                    this.init_elapse_max = 100000000;
                }

                this.minElapse = this.init_elapse_min*1000;
                this.minElapseField.setValue( this.minElapse/1000 );
                this.maxElapse = this.init_elapse_max*1000;

                this.fromTime = this.init_time[0];
                this.toTime = this.init_time[1];


                var cnt = 0;
                me.loadingMask.show();


                var from = +new Date(me.fromTime);
                var to = +new Date(me.toTime);

                this.detailListGrid.clearRows();

                if (this.allDetailGridData.rows.length < this.loadDataRow) {
                    this.isNotMoreData = true;
                    this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
                    this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
                } else {
                    this.isNotMoreData = false;
                    this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(true);
                    this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(true);
                }

                this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
                this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);

                for ( var ix = 0; ix < this.allDetailGridData.rows.length; ix++ ) {

                    var time, elapse;

                    time = +new Date(this.allDetailGridData.rows[ix][0]).setMilliseconds(0);
                    elapse = this.allDetailGridData.rows[ix][4] * 1000;

                    var exceptionType = this.exceptionTypeProc(this.allDetailGridData.rows[ix]);

                    if ((time >= from && time <= to && elapse >=  me.minElapse && elapse <= me.maxElapse)) {
                        cnt += 1;

                        this.detailListGrid.addRow([this.allDetailGridData.rows[ix][ 0]   // 'time'
                            ,this.allDetailGridData.rows[ix][ 1]                          // 'was_name'
                            ,this.allDetailGridData.rows[ix][ 2]                          // 'txn_name'
                            ,this.allDetailGridData.rows[ix][ 3]                          // 'start_time'
                            ,this.allDetailGridData.rows[ix][ 4]                          // 'txn_elapse'
                            //,this.allDetailGridData.rows[ix][ 5]                          // 'exception_type'
                            ,exceptionType
                            ,common.Util.hexIpToDecStr(this.allDetailGridData.rows[ix][ 6]) // 'client_ip'
                            ,this.allDetailGridData.rows[ix][24]                          // 'txn_cpu_time'
                            ,this.allDetailGridData.rows[ix][ 7]                          // 'sql_elapse'
                            ,this.allDetailGridData.rows[ix][ 8]                          // 'sql_exec_count'
                            ,this.allDetailGridData.rows[ix][ 9]                          // 'fetch_count'
                            ,this.allDetailGridData.rows[ix][23]                          // 'fetch_time'
                            ,this.allDetailGridData.rows[ix][10]                          // 'remote_elapse'
                            ,this.allDetailGridData.rows[ix][11]                          // 'remote_count'
                            ,this.allDetailGridData.rows[ix][12]                          // 'login_name'
                            ,this.allDetailGridData.rows[ix][13]                          // 'browser'
                            ,this.allDetailGridData.rows[ix][14]                          // 'tid'
                            ,this.allDetailGridData.rows[ix][15]                          // 'was_id'
                            ,this.allDetailGridData.rows[ix][16]                          // 'raw_time'
                            ,this.allDetailGridData.rows[ix][17]                          // 'txn_id'
                            ,this.allDetailGridData.rows[ix][18]                          // 'sql_elapse_avg'
                            ,this.allDetailGridData.rows[ix][19]                          // 'EXCEPTION'
                            ,this.allDetailGridData.rows[ix][20]                          // 'fsid'
                            ,this.allDetailGridData.rows[ix][21]                          // 'pcid'
                            ,this.allDetailGridData.rows[ix][22]                          // 'guid'
                            ,this.allDetailGridData.rows[ix][25]                          // 'tx_code'
                        ]);
                    }
                }

                setTimeout(function(){
                    if ( cnt == 0 ){
                        //me.retrieve_re_grid();
                    }else{
                        me.detailListGrid.drawGrid();
                        me.retrieve_re_txn_summary();
                    }
                    me.loadingMask.hide();
                },500);
            }
        } else {
            this.allData = false;

            this.detailListGrid.getEl().dom.style.opacity = '1';
            this.grd_txn.getEl().dom.style.opacity = '1';

            this.detailListGrid.setDisabled(false);
            this.grd_txn.setDisabled(false);

            this.retrieve_re_grid();
            this.retrieve_re_txn_summary();

        }
    },

    clearFilterGrid: function() {
        this.detailListGrid.pnlExGrid.getStore().clearFilter();
    },

    _updateElapseRangeField: function() {
        this.minElapseField.setValue(this.minElapse / 1000);
        if (this.maxElapse == 100000000) {
            this.maxElapseField.setValue(common.Util.TR('infinite'));
        } else {
            this.maxElapseField.setValue((this.maxElapse / 1000).toFixed(3));
        }
    },

    _getWasList: function() {
        if (this.isAllWasRetrieve) {
            if (this.isStandAlone){
                //return 'select was_id from xapm_was_info';
                return ' SELECT was_id FROM xapm_was_info' +
                       ' UNION' +
                       ' SELECT server_id as was_id' +
                       ' FROM xapm_auto_id_history' +
                       ' WHERE unm3 is not null';
            }
            else{
                return Comm.selectedWasArr.join(',');
            }
        }
        else{
            return this.wasField.getValue();
        }
    },

    retrieveScatter: function() {
        if (!this.detailScatterBox.el) {
            this.isChartDom = false;
            return;
        }
        this.detailScatterBox.loadingMask.showMask();

        this.scatterWidth = this.detailScatterBox.getWidth();
        this.scatterHeight = this.detailScatterBox.getHeight();

        var bankCode;
        if (this.isExtBankMode) {
            bankCode = 'AND BANK_CODE=\'' + this.extBankField.getValue() + '\'';
        } else {
            bankCode = '';
        }

        //한국시간 offset값 -3240000이어서 기본값 음수.
        var time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        //만약 offset값이 양수일 경우는 문자열 + 를 넣어서 sql상 error가 발생 안하도록 변경.
        if (time_zone > 0) {
            //양수일 경우
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: 'IMXPA_ResponseInspector_Scatter.sql',
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }, {
                name: 'sqlElapse', value: this.sqlElapseField.getValue() * 1000, type: SQLBindType.INTEGER
            }, {
                name: 'sqlExecCount', value: this.sqlExecField.getValue(), type: SQLBindType.INTEGER
            }, {
                name: 'fetchCount', value: this.fetchCntField.getValue(), type: SQLBindType.INTEGER
            }],
            replace_string: [{
                name: 'wasId', value: this._getWasList()
            }, {
                name: 'bankCode', value: bankCode
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'loginName', value: this._loginNameRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'pcid', value: this._pcidRepl
            }, {
                name: 'time_zone', value: time_zone
            }]
        }, this._onScatterData, this);

    },

    _onScatterData: function(header, data) {
        if (this.isClosed) {
            return;
        }

        this.detailScatter.fromTime = new Date(this.fromTime);
        this.detailScatter.toTime =   new Date(this.toTime);

        this.detailScatter.lastSelectRange = {invMinX : null, invMaxX : null, invMinY : null, invMaxY : null};

        this.isChartDataVisible = (this.detailScatter.target.getWidth() > 0);

        this.detailScatter.draw(data.rows, this.scatterWidth, this.scatterHeight);
        this.detailScatterBox.setLoading(false);
        this.detailScatterBox.loadingMask.hide();

        this.completeScatterSqlExec = true;
        this.selectToFirstRow();

        if(this.chartToggle.getValue()){
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;
        }
    },

    retrieveGrid: function() {
        if (!this.isAddGridData) {
            this.detailListGrid.clearRows();
        }
        this.detailListGrid.loadingMask.showMask();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);
        this.isAddGridData = false;

        var bankCode;
        if (this.isExtBankMode) {
            bankCode = 'AND BANK_CODE=\'' + this.extBankField.getValue() + '\'';
        } else {
            bankCode = '';
        }

        var time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        if(time_zone > 0){
            //양수일 경우
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: 'IMXPA_ResponseInspector_GridList_paging.sql',
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }, {
                name: 'sqlElapse', value: this.sqlElapseField.getValue()*1000, type: SQLBindType.FLOAT
            }, {
                name: 'sqlExecCount', value: this.sqlExecField.getValue(), type: SQLBindType.INTEGER
            }, {
                name: 'fetchCount', value: this.fetchCntField.getValue(), type: SQLBindType.INTEGER
            }],
            replace_string: [{
                name: 'wasId', value: this._getWasList()
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'pcid', value: this._pcidRepl
            }, {
                name: 'bankCode', value: bankCode
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'loginName', value: this._loginNameRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value:  this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL')? this.limitFrom : ''
            }]
        }, this._onGridData, this);
    },


    _onGridData: function(header, data) {
        var self = this;
        var ix, ixLen;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)) {
            this.detailListGrid.setLoading(false);
            this.detailListGrid.loadingMask.hide();
            this.bottom_cont.loadingMask.hide();
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;
            this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);
            return;
        }

        this.detailListGrid.setLoading(false);

        if ( this.allDetailGridData == undefined || this.allDetailGridData.rows.length == 0 ) {
            this.allDetailGridData = data[0];
        }

        if ( this.retrieve_click ) {
            if ( this.init_time == null ) {
                this.init_time = [];
            }
            this.init_time[0] = common.Util.getDate(this.datePicker.getFromDateTime());
            this.init_time[1] = common.Util.getDate(this.datePicker.getToDateTime());
            this.allDetailGridData = data[0];
        }

        var elapse = this.maxElapse / 1000;
        for ( ix = 0, ixLen = data[0].rows.length; ix < ixLen; ix++ ) {
            if ( elapse < data[0].rows[ix][4] ) {
                continue;
            }

            var exceptionType = this.exceptionTypeProc(data[0].rows[ix]);

            this.detailListGrid.addRow([data[0].rows[ix][ 0]        // 'time'
                ,data[0].rows[ix][ 1]                                // 'was_name'
                ,data[0].rows[ix][ 2]                                // 'txn_name'
                ,data[0].rows[ix][ 3]                                // 'start_time'
                ,data[0].rows[ix][ 4]                                // 'txn_elapse'
                //,data[0].rows[ix][ 5]                              // 'exception_type'
                ,exceptionType
                ,common.Util.hexIpToDecStr(data[0].rows[ix][ 6])     //client_ip
                ,data[0].rows[ix][24]                                // txn_cpu_time
                ,data[0].rows[ix][ 7]                                // 'sql_elapse'
                ,data[0].rows[ix][ 8]                                // 'sql_exec_count'
                ,data[0].rows[ix][ 9]                                // 'fetch_count'
                ,data[0].rows[ix][23]                                // 'fetch_time'
                ,data[0].rows[ix][10]                                // 'remote_elapse'
                ,data[0].rows[ix][11]                                // 'remote_count'
                ,data[0].rows[ix][12]                                // 'login_name'
                ,data[0].rows[ix][13]                                // 'browser'
                ,data[0].rows[ix][14]                                // 'tid'
                ,data[0].rows[ix][15]                                // 'was_id'
                ,data[0].rows[ix][16]                                // 'raw_time'
                ,data[0].rows[ix][17]                                // 'txn_id'
                ,data[0].rows[ix][18]                                // 'sql_elapse_avg'
                ,data[0].rows[ix][19]                                // 'EXCEPTION'
                ,data[0].rows[ix][20]                                // 'fsid'
                ,data[0].rows[ix][21]                                // 'pcid'
                ,data[0].rows[ix][22]                                // 'guid'
                ,data[0].rows[ix][25]                                // 'tx_code'
            ]);
        }

        if (ixLen < this.loadDataRow) {
            this.isNotMoreData = true;
            this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
        }

        this.detailListGrid.drawGrid();
        this.retrieve_click = false;

        self.detailListGrid.loadingMask.hide();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);

        self.grd_txn.clearRows();
        if ( data[0].rows.length > 0 ) {
            if ( data[1] !== undefined ) {

                if (self.isAddTxnGridData) {
                    self.isAddTxnGridData = false;
                    self.mergeTxnSummaryData(data[1]);
                }

                self.retrieve_txn_summary( data[1] );

                self.bottom_tab.tabBar.items.items[1].setVisible( true );
                self.bottom_tab.tabBar.items.items[2].setVisible( true );
                if (common.Menu.useTxnDetailBrowserTimeTab) {
                    self.bottom_tab.tabBar.items.items[3].setVisible( true );
                } else {
                    self.bottom_tab.tabBar.items.items[3].setVisible( false );
                }
            }
        } else {
            self.bottom_cont.loadingMask.hide();
        }

        this.completeGridListSqlExec = true;
        this.selectToFirstRow();
        this.retrieve_loading = false;
        this.detailScatter.retrieveLoading = this.retrieve_loading;
    },

    selectToFirstRow: function(){
        if(this.completeGridListSqlExec && this.completeScatterSqlExec){
            this.detailListGrid.pnlExGrid.getView().getSelectionModel().select(0);
        }
    },

    _onReGridData: function(header, data) {
        var command = header.command;
        var ix, ixLen;

        if (this.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            this.detailListGrid.setLoading(false);
            this.detailListGrid.loadingMask.hide();
            this.bottom_cont.loadingMask.hide();

            this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);
            return;
        }

        this.detailListGrid.setLoading(false);

        if(command == 'IMXPA_ResponseInspector_GridList_paging_re.sql'){
            if (data.rows.length < this.loadDataRow) {
                this.isNotMoreData = true;
                this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
                this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
            } else {
                this.isNotMoreData = false;
                this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(true);
                this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(true);
            }

            this.detailListGrid.clearRows();

            for ( ix = 0, ixLen =  data.rows.length; ix < ixLen; ix++ ){
                var exceptionType = this.exceptionTypeProc(data.rows[ix]);

                this.detailListGrid.addRow([data.rows[ix][ 0]   // 'time'
                    ,data.rows[ix][ 1]                          // 'was_name'
                    ,data.rows[ix][ 2]                          // 'txn_name'
                    ,data.rows[ix][ 3]                          // 'start_time'
                    ,data.rows[ix][ 4]                          // 'txn_elapse'
                    //,data.rows[ix][ 5]                          // 'exception_type'
                    ,exceptionType
                    ,common.Util.hexIpToDecStr(data.rows[ix][ 6])  // 'client_ip'
                    ,data.rows[ix][24]                          // 'txn_cpu_time'
                    ,data.rows[ix][ 7]                          // 'sql_elapse'
                    ,data.rows[ix][ 8]                          // 'sql_exec_count'
                    ,data.rows[ix][ 9]                          // 'fetch_count'
                    ,data.rows[ix][23]                          // 'fetch_time'
                    ,data.rows[ix][10]                          // 'remote_elapse'
                    ,data.rows[ix][11]                          // 'remote_count'
                    ,data.rows[ix][12]                          // 'login_name'
                    ,data.rows[ix][13]                          // 'browser'
                    ,data.rows[ix][14]                          // 'tid'
                    ,data.rows[ix][15]                          // 'was_id'
                    ,data.rows[ix][16]                          // 'raw_time'
                    ,data.rows[ix][17]                          // 'txn_id'
                    ,data.rows[ix][18]                          // 'sql_elapse_avg'
                    ,data.rows[ix][19]                          // 'EXCEPTION'
                    ,data.rows[ix][20]                          // 'fsid'
                    ,data.rows[ix][21]                          // 'pcid'
                    ,data.rows[ix][22]                          // 'guid'
                    ,data.rows[ix][25]                          // 'tx_code'
                ]);
            }

            this.detailListGrid.drawGrid();

            this.detailListGrid.pnlExGrid.getView().getSelectionModel().select(0);
            this.detailListGrid.loadingMask.hide();
            this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);
        } else if (command == 'IMXPA_ResponseInspector_GridList_paging_re_txn.sql') {
            this.grd_txn.clearRows();
            if (data.rows.length > 0) {
                this.retrieve_txn_summary(data);

                this.bottom_tab.tabBar.items.items[1].setVisible( true );
                this.bottom_tab.tabBar.items.items[2].setVisible( true );
                if (common.Menu.useTxnDetailBrowserTimeTab) {
                    this.bottom_tab.tabBar.items.items[3].setVisible( true );
                } else {
                    this.bottom_tab.tabBar.items.items[3].setVisible( false );
                }
            } else {
                this.bottom_cont.loadingMask.hide();
            }
        }

        if (this.allData) {
            this.detailListGrid.pnlExGrid.getView().getSelectionModel().select( 0);
            this.detailListGrid.loadingMask.hide();
            this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(false);
        }
    },

    retrieve_re_grid: function(){
        if (this.autoRetrieveRange !== null) {
            this.detailListGrid.setLoading(true);
        }

        this.detailListGrid.loadingMask.showMask();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);

        var bankCode;
        if (this.isExtBankMode) {
            bankCode = 'AND BANK_CODE=\'' + this.extBankField.getValue() + '\'';
        } else {
            bankCode = '';
        }

        var time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        if(time_zone > 0){
            //양수일 경우
            time_zone = '+' + time_zone;
        }

        this.isNotMoreData = false;
        this.fromRowIndex = 0;
        this.limitData = this.defaultLimitData;
        this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);

        WS.SQLExec({
            sql_file: 'IMXPA_ResponseInspector_GridList_paging_re.sql',
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }, {
                name: 'sqlElapse', value: this.sqlElapseField.getValue()*1000, type: SQLBindType.FLOAT
            }, {
                name: 'sqlExecCount', value: this.sqlExecField.getValue(), type: SQLBindType.INTEGER
            }, {
                name: 'fetchCount', value: this.fetchCntField.getValue(), type: SQLBindType.INTEGER
            }, {
                name: 'msFromTime', value: this.msFromTime, type: SQLBindType.STRING
            }, {
                name: 'msToTime', value: this.msToTime, type: SQLBindType.STRING
            }],
            replace_string: [{
                name: 'wasId', value: this._getWasList()
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'pcid', value: this._pcidRepl
            }, {
                name: 'bankCode', value: bankCode
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'loginName', value: this._loginNameRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value: this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL')? this.limitFrom:''
            }]
        }, this._onReGridData, this);
    },

    retrieve_re_txn_summary: function() {
        if (this.autoRetrieveRange !== null) {
            this.detailListGrid.setLoading(true);
        }

        this.detailListGrid.loadingMask.showMask();
        this.bottom_cont.loadingMask.showMask();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);

        var bankCode;
        if (this.isExtBankMode) {
            bankCode = 'AND BANK_CODE=\'' + this.extBankField.getValue() + '\'';
        } else {
            bankCode = '';
        }

        var file = 'IMXPA_ResponseInspector_GridList_paging_re_txn.sql';
        var time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        if (time_zone > 0) {
            //양수일 경우
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: file,
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }, {
                name: 'sqlElapse', value: this.sqlElapseField.getValue()*1000, type: SQLBindType.FLOAT
            }, {
                name: 'sqlExecCount', value: this.sqlExecField.getValue(), type: SQLBindType.INTEGER
            }, {
                name: 'fetchCount', value: this.fetchCntField.getValue(), type: SQLBindType.INTEGER
            }, {
                name: 'msFromTime', value: this.msFromTime, type: SQLBindType.STRING
            }, {
                name: 'msToTime', value: this.msToTime, type: SQLBindType.STRING
            }],
            replace_string: [{
                name: 'wasId', value: this._getWasList()
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'pcid', value: this._pcidRepl
            }, {
                name: 'bankCode', value: bankCode
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'loginName', value: this._loginNameRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value: this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL')? this.limitFrom:''
            }]
        }, this._onReGridData, this);

        file = null;
    } ,


    retrieve_txn_summary: function( _data ) {
        var total_time, retText,
            was_avg, remote_avg, db_avg, was_cnt, remote_cnt, db_cnt,
            was_ratio, remote_ratio, db_ratio,
            ix, ixLen;

        this.bottom_tab.tabBar.items.items[1].setVisible( false );
        this.bottom_tab.tabBar.items.items[2].setVisible( false );
        this.bottom_tab.tabBar.items.items[3].setVisible( false );

        this.isInit_browser_time = true;
        this.select_idx_cht      = null;
        this.select_idx_tree     = null;
        this.select_idx_browser  = null;

        this.bottom_tab.setActiveTab(0);

        for (ix = 0, ixLen = _data.rows.length; ix < ixLen; ix++) {

            was_cnt    = +_data.rows[ix][6] || 0.000;
            remote_cnt = _data.rows[ix][9] || 0.000;
            db_cnt     = _data.rows[ix][12] || 0.000;

            was_avg    = !was_cnt ? 0.000 : ((_data.rows[ix][4] || 0.000) / was_cnt) || 0.000;
            remote_avg = !remote_cnt ? 0.000 : ((_data.rows[ix][7] || 0.000) / remote_cnt) || 0.000;
            db_avg     = !db_cnt ? 0.000 : ((_data.rows[ix][10] || 0.000) / db_cnt) || 0.000;

            was_ratio    = was_avg - (remote_avg + db_avg) < 0 ? 0.000 : was_avg - (remote_avg + db_avg);
            remote_ratio = remote_avg < 0 ? 0.000 : remote_avg;
            db_ratio     = db_avg < 0 ? 0.000 : db_avg;

            total_time = was_ratio + remote_ratio + db_ratio;

            was_ratio    = total_time > 0 ? ((was_ratio / total_time) * 100).toFixed(3) : 0.000;
            remote_ratio = total_time > 0 ? ((remote_ratio / total_time) * 100).toFixed(3) : 0.000;
            db_ratio     = total_time > 0 ? ((db_ratio / total_time) * 100).toFixed(3) : 0.000;

            retText = was_ratio + '/' + remote_ratio + '/' + db_ratio;

            this.grd_txn.addRow([
                (_data.rows[ix][2] || 0.000)     //'txn'
                , retText                        //'chart'
                , (_data.rows[ix][5] || 0.000)   //'wasm'
                , was_avg                        //'was avg'
                , (_data.rows[ix][6] || 0.000)   //'wasc'
                , (_data.rows[ix][8] || 0.000)   //'rm'
                , remote_avg                     //'r avg'
                , (_data.rows[ix][9] || 0.000)   //'rc'
                , (_data.rows[ix][11] || 0.000)  //'sm'
                , db_avg                         //'s avg'
                , (_data.rows[ix][12] || 0.000)  //'sc'
            ]);
        }

        this.tempTxnGridRows = _data.rows.concat();

        this.grd_txn.drawGrid();
        this.bottom_cont.loadingMask.hide();
    },

    /**
     * Merge Txn Grid Data
     * @param {object} _data - txn grid data
     *
     * Txn Data
     * 0 : was_id
     * 1 : was_name
     * 2 : txn_name
     * 3 : txn_id
     * 4 : txn_elapse_sum
     * 5 : txn_elapse_max
     * 6 : txn_count_sum
     * 7 : remote_elpase_sum
     * 8 : remote_elpase_max
     * 9 : remote_count_sum
     * 10: sql_elpase_sum
     * 11: sql_elpase_max
     * 12: sql_exec_count_sum
     */
    mergeTxnSummaryData: function( _data ) {
        var ix, ixLen, jx, jxLen;
        var tempAddData = [];
        var tempData;
        var isContainData;

        for (jx = 0, jxLen = this.tempTxnGridRows.length; jx < jxLen; jx++) {
            isContainData = false;
            tempData = this.tempTxnGridRows[jx];

            for (ix = 0, ixLen = _data.rows.length - 1; ix <= ixLen; ix++) {
                if (tempData[2] === _data.rows[ix][2]) {
                    isContainData = true;
                    // txn_elapse
                    _data.rows[ix][4] = +_data.rows[ix][4] + +tempData[4];
                    _data.rows[ix][5] = Math.max(_data.rows[ix][5], tempData[5]);
                    _data.rows[ix][6] = +_data.rows[ix][6] + +tempData[6];

                    // remote_elapse
                    _data.rows[ix][7] = +_data.rows[ix][7] + +tempData[7];
                    _data.rows[ix][8] = Math.max(_data.rows[ix][8], tempData[8]);
                    _data.rows[ix][9] = +_data.rows[ix][9] + +tempData[9];

                    //sql_elapse
                    _data.rows[ix][10] = +_data.rows[ix][10] + +tempData[10];
                    _data.rows[ix][11] = Math.max(_data.rows[ix][11], tempData[11]);
                    _data.rows[ix][12] = +_data.rows[ix][12] + +tempData[12];
                }
            }

            if (!isContainData) {
                tempAddData[tempAddData.length] = tempData.concat();
            }
        }
        _data.rows = Ext.Array.merge(_data.rows, tempAddData);

        tempData = null;
        tempAddData = null;
    },


    _call_item_click: function(){

        var grid = this.detailListGrid.pnlExGrid;
        var idx;

        if ( this.select_idx == null ) {
            this.select_idx = 0;
        }

        switch ( this.bottom_tab.getActiveTab().tab_idx ) {
            case 1:
                if ( this.select_idx_cht == undefined ) {
                    idx = this.select_idx;
                } else {
                    idx = this.select_idx;
                }
                break;

            case 2:
                if ( this.select_idx_tree == undefined ) {
                    idx = this.select_idx;
                } else {
                    idx = this.select_idx;
                }
                break;

            case 3:
                if ( this.select_idx_browser == undefined ) {
                    idx = this.select_idx;
                } else {
                    idx = this.select_idx;
                }
                break;
            default :
                break;
        }

        grid.getView().getSelectionModel().select( idx );
        grid.fireEvent('beforeselect', grid, grid.getSelectionModel().getLastSelected(),  idx);


        grid = null;
        idx = null;
    },


    retrieve_txn_chart: function( _record ){
        if (!_record) {
            return;
        }

        var full_from_time,
            full_to_time;

        full_from_time = common.Util.getDateFormat(this.fromTime) + ' 00:00:00';
        full_to_time   = common.Util.getDateFormat(this.fromTime) + ' 23:59:59';


        WS2.SQLExec({
            sql_file: 'IMXPA_ResponseInspector_txn_chart.sql',
            bind    : [
                {name: 'fromtime', value: full_from_time, type: SQLBindType.STRING},
                {name: 'totime'  , value: full_to_time, type: SQLBindType.STRING},
                {name: 'txn_id'  , value: _record.raw.txn_id, type: SQLBindType.STRING },
                {name: 'was_id'  , value: _record.raw.was_id, type: SQLBindType.INTEGER}
            ]
        }, this._on_bot_data, this );
    },


    retrieve_call_tree: function(_record) {
        if (!_record) {
            return;
        }
        this.bottom_cont.loadingMask.show();

        WS2.StoredProcExec({
            stored_proc: 'txn_detail',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: _record.raw.tid
            },{
                name: 'start_time',
                type: SQLBindType.STRING,
                value: Ext.Date.format(new Date(_record.raw.start_time), 'Y-m-d H:i:s')
            },{
                name: 'end_time',
                type: SQLBindType.STRING,
                value: Ext.Date.format(new Date(_record.raw.time), 'Y-m-d H:i:s')
            }]
        }, this._on_bot_data, this);
    },

    retrieve_browser_time: function(_record) {
        if (!_record) {
            return;
        }

        if(!this.isInit_browser_time) {
            return;
        }

        this.bottom_cont.loadingMask.show();

        var bankCode;
        if (this.isExtBankMode) {
            bankCode = 'AND BANK_CODE=\'' + this.extBankField.getValue() + '\'';
        } else {
            bankCode = '';
        }

        var time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        if (time_zone > 0) {
            //양수일 경우
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: 'IMXPA_ResponseInspector_Browser_Time.sql',
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }, {
                name: 'sqlElapse', value: this.sqlElapseField.getValue() * 1000, type: SQLBindType.FLOAT
            }, {
                name: 'sqlExecCount', value: this.sqlExecField.getValue(), type: SQLBindType.INTEGER
            }, {
                name: 'fetchCount', value: this.fetchCntField.getValue(), type: SQLBindType.INTEGER
            }],
            replace_string: [{
                name: 'wasId', value: this._getWasList()
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'pcid', value: this._pcidRepl
            }, {
                name: 'bankCode', value: bankCode
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'loginName', value: this._loginNameRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value:  this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL')? this.limitFrom : ''
            }]
        }, this._on_bot_data, this);

    },

    _on_bot_data: function( header, data ) {
        var ix;

        if (this.isClosed) {
            return;
        }

        this.bottom_cont.loadingMask.show();

        switch ( header.command ) {

            case 'IMXPA_ResponseInspector_txn_chart.sql':
                var param = header.parameters;

                for ( ix = 0; ix < data.rows.length; ix++ ){
                    this.txn_chart.addValues({
                        from: param.bind[0].value,
                        to  : param.bind[1].value,
                        time: 0,
                        data: data.rows,
                        series: {
                            'cht1': 2,
                            'cht2': 3,
                            'cht3': 4
                        }
                    });
                }
                this.txn_chart.plotDraw();
                break;

            case 'txn_detail':
                var calling_method_id, parent_node, calling_crc;

                this.call_tree.clearNodes();
                this.call_tree.beginTreeUpdate();

                //1412.24 oracle procedure는 데이터가 없으면 null로 리턴.
                if ( data == null ) {
                    this.call_tree.endTreeUpdate();
                    this.bottom_cont.loadingMask.hide();
                    return;
                }

                if ( data.length == undefined ) {
                    data[0] = data;
                } else {
                    if ( data[0].columns.length == 8 ) {
                        this.call_tree.endTreeUpdate();
                        this.bottom_cont.loadingMask.hide();
                        return;
                    }
                }

                for ( ix = 0; ix < data[0].rows.length; ix++ ){

                    if ( ( data[0].rows[ix][7] == '' || data[0].rows[ix][7] == null ) &&
                        ( data[0].rows[ix][8] == 0 || data[0].rows[ix][8] == null ) ) {

                        this._add_call_tree( null, data[0].rows[ix] );

                    } else {

                        calling_method_id = data[0].rows[ix][7]; //calling_method_id
                        calling_crc = data[0].rows[ix][8];

                        parent_node = this.call_tree.MultifindNode( 'method_id', 'crc', calling_method_id, calling_crc );
                        if ( parent_node == null ) {
                            continue;
                        }

                        this._add_call_tree( parent_node, data[0].rows[ix] );
                    }

                }
                this.call_tree.endTreeUpdate();
                this.call_tree.drawTree();

                this.bottom_cont.loadingMask.hide();

                calling_method_id = null;
                calling_crc = null;
                parent_node = null;
                break;

            case 'IMXPA_ResponseInspector_Browser_Time.sql':
                var transmitting, reception, network, server, retText,
                    ix, ixLen;

                this.grd_browser.clearRows();
                this.remove_tip();

                for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {

                    transmitting = data.rows[ix][4] || 0.000;
                    reception    = data.rows[ix][5] || 0.000;
                    network      = data.rows[ix][6] || 0.000;
                    server       = data.rows[ix][7] || 0.000;

                    retText = data.rows[ix][4] + '/' + data.rows[ix][5] + '/' + data.rows[ix][6] + '/' + data.rows[ix][7];

                    this.grd_browser.addRow([
                        (data.rows[ix][2] || 0.000)   //'txn'
                        , retText                     //'chart'
                        , transmitting                //'송신'
                        , reception                   //'수신'
                        , network                     //'네트워크'
                        , server                      //'서버시간'
                    ]);
                }

                this.tempTxnGridRows = data.rows.concat();

                this.grd_browser.drawGrid();
                this.bottom_cont.loadingMask.hide();
                this.isInit_browser_time = false;

            default :
                break;
        }
        ix = null;
        this.bottom_cont.loadingMask.hide();

    } ,

    remove_tip: function() {
        if ( this.tip ) {
            if ( this.tip.parentNode == undefined ) {
                this.tip.remove();
            } else {
                this.tip.parentNode.removeChild(this.tip);
            }
        }
    },


    _add_call_tree: function(parent, _data) {
        this.call_tree.addNode( parent,[ _data[ 0]        //lvl
            ,_data[ 1]       //was_id
            ,_data[ 2]       //was_name
            ,_data[ 3]       //method_id
            ,_data[ 4]       //crc
            ,_data[ 5]       //class_name
            ,_data[ 6]       //method_name
            ,_data[ 7]       //calling_method_id
            ,_data[ 8]       //calling_crc
            ,_data[10]       //exec_count
            ,_data[11]       //elase_time
            ,_data[ 9]       //err_count
            ,_data[12]       //elapse_ratio
            ,Common.fn.codeBitToMethodType(_data[13])  //method_type
            ,_data[14]       //seq
            ,_data[15]       //level_id
            ,_data[16]       //host_name
            ,_data[17]       //tid
            ,_data[18]       //cpu_time
        ]);
    } ,

    checkValid: function() {
        var minElapse = this.minElapseField.getValue(),
            maxElapse = this.maxElapseField.getValue();

        if (isNaN(minElapse)) {
            this.minElapseField.setValue(0);
        }

        if (isNaN(maxElapse)) {
            this.maxElapseField.setValue(common.Util.TR('infinite'));
            maxElapse = 99999999999;
        }

        if (minElapse > maxElapse) {
            this.minElapseField.markInvalid('');
            this.maxElapseField.markInvalid('');
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Minimum elapse time cannot be greater than maximum elapse time.'));
            return false;
        }
        return true;
    },

    executeSQL: function() {
        var self = this;

        this.retrieve_click     = true;
        this.init_time          = null;

        this.select_idx_cht     = null;
        this.select_idx_tree    = null;
        this.select_idx_browser = null;

        this.bottom_tab.tabBar.items.items[1].setVisible(false);
        this.bottom_tab.tabBar.items.items[2].setVisible(false);
        this.bottom_tab.tabBar.items.items[3].setVisible(false);

        this.completeScatterSqlExec = false;
        this.completeGridListSqlExec = false;

        this.retrieveScatter();
        if (!this.chartToggle.getValue()) {
            this.detailListGrid.getEl().dom.style.opacity = '1';
            this.grd_txn.getEl().dom.style.opacity = '1';
            this.detailListGrid.setDisabled(false);
            this.grd_txn.setDisabled(false);
            this.retrieveGrid();
        } else {
            this.detailListGrid.clearRows();
            this.detailListGrid.drawGrid();
            this.grd_txn.clearRows();
            this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
            this.detailListGrid.getEl().dom.style.opacity = '0.3';
            this.grd_txn.getEl().dom.style.opacity = '0.3';
            this.detailListGrid.setDisabled(true);
            this.grd_txn.setDisabled(true);
        }

        setTimeout(function() {
            if (self.autoRetrieveRange == null) {
                self = null;
                return;
            }

            if ( self.autoRetrieveRange.wasName == 'All' ) {
                self.wasField.selectByIndex(0);
            } else {
                self.wasField.selectByValues(self.autoRetrieveRange.wasName);
            }
            self = null;
        },500);
    },

    retrieve: function() {
        if (this.retrieve_loading) {
            return;
        }

        this.retrieve_loading = true;
        this.detailScatter.retrieveLoading = this.retrieve_loading;
        var me = this;
        this.isInit = false;

        this.isNotMoreData = false;
        this.fromRowIndex = 0;
        this.limitData = this.defaultLimitData;
        this.limitFrom = 0;
        this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(true);

        var result =  this.wasField.checkValid() && this.checkValid();

        if (result) {
            me.minElapse = me.minElapseField.getValue() * 1000;
            var maxElapse = 0;

            if (me.maxElapseField.getValue() == common.Util.TR('infinite')){
                maxElapse = 'infinite';
            } else {
                maxElapse = me.maxElapseField.getValue() * 1000;
            }

            var tmp = me.txnNameField.value;
            if ( tmp.indexOf(']') > 0 ) {
                tmp = tmp.substr(tmp.indexOf(']') + 2, tmp.length);
            }

            me.setRetrieveRange({
                timeRange  : [new Date(me.datePicker.mainFromField.getValue()),
                    new Date(me.datePicker.mainToField.getValue())],
                elapseRange: [me.minElapseField.getValue()*1000, maxElapse],
                txnName: [ tmp ]/*,
                 wasName : [ me.wasField.getValue() ]*/
            });

            this.init_elapse_min = me.minElapseField.getValue();
            this.init_elapse_max = Number(me.maxElapseField.getValue() );

            if (typeof this.liveScatter !== 'undefined') {
                this.liveScatter.lastRetrievedRange = null;
            }

            var txnName = this.txnNameField.getValue(),
                clientIp = common.Util.strIpToHex(this.ipField.getValue()),
                gid = this.gidField.getValue(),
                tid = this.tidField.getValue(),
                pcid = this.pcidField.getValue(),
                notOnlyException = this.exceptionToggle.getValue(),
                loginName = this.loginNameField.getValue();

            if (txnName == '%') {
                this._txnNameRepl = '';
            } else {
                this._txnNameRepl = 'AND e.txn_id in (SELECT n.txn_id ' +
                    'FROM   xapm_txn_name n left outer join  xapm_txn_name_ext e ON  n.txn_name = e.txn_name ' +
                    'WHERE   n.txn_name LIKE \'' + txnName + '\' OR e.txn_name_ext LIKE \'' + txnName + '\' )';
            }

            if (clientIp == '%') {
                this._clientIpRepl = '';
            } else {
                this._clientIpRepl = 'AND client_ip LIKE \'' + clientIp + '\' ';
            }

            if (gid == '%') {
                this._gidRepl = '';
            } else {
                this._gidRepl = 'AND guid LIKE \'' + gid + '\'';
            }

            if (!tid) {
                this._tidRepl = '';
            } else {
                this._tidRepl = 'AND e.tid = ' + tid;
            }

            if (!pcid) {
                this._pcidRepl = '';
            } else {
                this._pcidRepl = 'AND c.data = \'' + pcid + '\'';
            }


            if (notOnlyException) {
                this._exceptionRepl = '';
            } else {
                this._exceptionRepl = 'AND exception > 0 ';
            }

            if (loginName == '%') {
                this._loginNameRepl = '';
            } else {
                this._loginNameRepl = 'AND login_name LIKE \'' + loginName + '\' ';
            }
        } else {
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string') {
                console.warn('message :', result);
            }
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;
            return;
        }

        result = null;


        result = this.datePicker.checkValid();
        if (!result) {
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string') {
                console.warn('');
            }
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;
        } else {
            this.setTitleWithTimeRange();
            this.executeSQL();
        }
    },

    setTitleWithTimeRange: function() {
        if (this.tab) {

            var fromTime = this.datePicker.getFromDateTime();
            var toTime = this.datePicker.getToDateTime();

            if (fromTime.length == 13) {
                fromTime += ':00';
            } else if (fromTime.length == 10) {
                fromTime += ' 00:00';
            }

            if (toTime.length == 13) {
                toTime += ':00';
            } else if(toTime.length == 10) {
                toTime += ' 00:00';
            }

            common.DataModule.timeInfo.lastFromTime = fromTime;
            common.DataModule.timeInfo.lastToTime   = toTime;


            var findComponent = this.conditionArea.getComponent('wasCombo');

            if (findComponent == 'undefined' || findComponent == null) {
                findComponent = this.conditionArea.getComponent('dbCombo');
            }


            if (findComponent == 'undefined' || findComponent == null) {
                this.tab.setText(this.title + '<div>[' +
                    Ext.util.Format.date(fromTime, 'H:i~') +
                    Ext.util.Format.date(toTime, 'H:i]</div>'));
            } else {
                var instanceName = findComponent.WASDBCombobox.getRawValue() + ' : ';

                if (instanceName.length > 25) {
                    instanceName = instanceName.substr(0, 20) + '... : ';
                }

                if ( this.isDaily === true ) {
                    this.tab.setText(this.title + '<div>[' + instanceName +
                        Ext.util.Format.date(fromTime, 'm-d~') +
                        Ext.util.Format.date(toTime, 'm-d]</div>'));

                } else if (this.DisplayTime == DisplayTimeMode.None || this.singleField === true) {
                    this.tab.setText(this.title + '<div>[' + instanceName + Ext.util.Format.date(fromTime, 'Y-m-d]</div>'));
                } else {
                    this.tab.setText(this.title + '<div>[' + instanceName +
                        Ext.util.Format.date(fromTime, 'H:i~') +
                        Ext.util.Format.date(toTime, 'H:i]</div>'));
                }
            }
            window.tabPanel.setRightScrollPosition();
        }
    },

    _create_txn_grid: function() {


        var _draw_chart = function(value, meta, record) {
            if (record.data) {

                //140609 마지막 avg로 나눠주는것 삭제(백분률을 위한 계산값임 - avg로 나눠주려면 *100도 함께 해주어야함.)_min

                //레코드 한줄 들어오면 그 record 내에서 계산하여 퍼센트 주고 차트 그려준다. - 이미 그리드 row에는  avg 값으로 들어있다. -JH
                var total_time = 0;

                var was_avg    = +record.data['was'];
                var remote_avg = +record.data['r'];
                var db_avg     = +record.data['s'];

                was_avg    = (was_avg - (remote_avg + db_avg)); /// was_avg;
                remote_avg = remote_avg; /// was_avg;
                db_avg     = db_avg; ///  was_avg;



                // 음수가 발생할 경우에는 0 처리
                if (was_avg < 0) {
                    was_avg = 0;
                }

                if (remote_avg < 0) {
                    remote_avg = 0;
                }

                if (db_avg < 0) {
                    db_avg = 0;
                }

                total_time = was_avg + remote_avg + db_avg;

                was_avg    = ((was_avg / total_time) * 100).toFixed(3);
                remote_avg = ((remote_avg / total_time) * 100).toFixed(3);
                db_avg     = ((db_avg / total_time) * 100).toFixed(3);


                var BarChart = '<div style="position:relative; width:100%; height:13px">'
                    + '<div data-qtip="' + 'Agent: ' + was_avg + '%' + '" style="float:left; background-color:#D1D21F;background: #D1D21F;height:100%;width:' + was_avg + '%;"></div>'
                    + '<div data-qtip="' + 'Remote: ' + remote_avg + '%' + '" style="float:left; background-color:#6EBDE8;background: #6EBDE8;height:100%;width:' + remote_avg + '%;"></div>'
                    + '<div data-qtip="' + 'DB: ' + db_avg+'%' + '" style="float:left; background-color:#929D9E;background: #929D9E;height:100%;width:' + db_avg + '%;"></div>'
                    + '</div>';

                return BarChart;
            }
        };



        this.grd_txn = Ext.create('Exem.BaseGrid',{
            itemId  : 'grd_txn',
            gridName: 'pa_txn_trend_etoe_gridName',
            width   : '100%',
            usePager: false,
            adjustGrid: false
        });
        this.grd_txn.beginAddColumns();
        this.grd_txn.addColumn( common.Util.CTR('Transaction'   ), 'txn'  , 150, Grid.String, true, false );
        this.grd_txn.addColumn( common.Util.CTR('Ratio (%)'     ), 'chart', 90 , Grid.String, true, false );
        this.grd_txn.addColumn( common.Util.CTR('Agent (MAX)'   ), 'wasm' , 70 , Grid.Float , true, false );
        this.grd_txn.addColumn( common.Util.CTR('Agent (AVG)'   ), 'was'  , 70 , Grid.Float , true, false );
        this.grd_txn.addColumn( common.Util.CTR('Agent (Count)' ), 'wasc' , 70 , Grid.Number, true, false );
        this.grd_txn.addColumn( common.Util.CTR('Remote (MAX)'  ), 'rm'   , 70 , Grid.Float , true, false );
        this.grd_txn.addColumn( common.Util.CTR('Remote (AVG)'  ), 'r'    , 70 , Grid.Float , true, false );
        this.grd_txn.addColumn( common.Util.CTR('Remote (Count)'), 'rc'   , 70 , Grid.Number, true, false );
        this.grd_txn.addColumn( common.Util.CTR('SQL (MAX)'     ), 'sm'   , 60 , Grid.Float , true, false );
        this.grd_txn.addColumn( common.Util.CTR('SQL (AVG)'     ), 's'    , 60 , Grid.Float , true, false );
        this.grd_txn.addColumn( common.Util.CTR('SQL (Count)'   ), 'sc'   , 60 , Grid.Number, true, false );
        this.grd_txn.endAddColumns();

        this.bottom_tab.items.items[0].add(this.grd_txn);
        this.grd_txn.loadLayout(this.grd_txn.gridName);
        this.grd_txn.addRenderer('chart', _draw_chart, RendererType.bar);

    },

    _create_txn_chart: function(){
        this.txn_chart = Ext.create('Exem.chart.CanvasChartLayer', {
            itemId             : 'txn_chart',
            interval           : PlotChart.time.exHour,
            width              : '100%',
            height             : 370 ,
            flex               : 1 ,
            showLegend         : true,
            legendTextAlign    : 'east',
            legendAlign        : 'south',
            legendVH           : 'hbox',
            legendHeight       : 30,
            legendContentAlign : 'center',
            mouseSelect        : false,
            mouseSelectMode    : 'x',
            showIndicator      : true ,
            showTitle          : false,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip        : true,
            toolTipFormat      : '%x [value:%y] ',
            toolTipTimeFormat  : '%H:%M',
            toFixedNumber      : 3,
            yLabelWidth        : 100 ,
            chartProperty      : {
                axislabels : true,
                yLabelWidth: 80,
                xLabelFont : {size: 8, color: 'black'},
                yLabelFont : {size: 8, color: 'black'},
                timeformat : '%h:%M',
                yaxes              : [{
                    position       : 'left',
                    axisLabel      : common.Util.TR('Executions')
                },{
                    position       : 'right',
                    axisLabel      : common.Util.TR('Time/exec (sec)')
                }]
            },
            xaxisCurrentToTime : true,
            showDayLine : false,
            selectionZoom: false
        });

        this.txn_chart.addSeries({
            label: 'Executions',
            id   : 'cht1',
            type : PlotChart.type.exBar
        });

        this.txn_chart.addSeries({
            label: common.Util.TR('Response Time/exec'),
            id   : 'cht2',
            type : PlotChart.type.exLine,
            point: true,
            yaxis: 2 ,
            color: '#F76211',
            lineWidth: 3
        });

        this.txn_chart.addSeries({
            label: common.Util.CTR('SQL Time/exec'),
            id   : 'cht3',
            type : PlotChart.type.exLine,
            point: true,
            yaxis: 2,
            color: '#00E03C',
            lineWidth: 3
        });


        this.bottom_tab.items.items[1].add(this.txn_chart);
    },

    _create_call_tree: function() {
        this.call_tree = Ext.create('Exem.BaseGrid',{
            itemId  : 'call_tree',
            //gridName: 'pa_txn_trend_calltree_gridName',
            gridType: Grid.exTree,
            cls :'left-condition-tree',
            useArrows : false,
            height  : 500,
            width   : '100%',
            flex    : 1
        });
        this.bottom_tab.items.items[2].add( this.call_tree );

        this.call_tree.beginAddColumns();
        this.call_tree.addColumn( 'Level'                              , 'LVL'              , 100, Grid.String, false, true  );
        this.call_tree.addColumn( 'WASID'                              , 'was_id'           , 30 , Grid.String, false, true  );
        this.call_tree.addColumn( 'WAS Name'                           , 'WAS_NAME'         , 50 , Grid.String, false, true  );
        this.call_tree.addColumn( 'Method ID'                          , 'method_id'        , 100, Grid.String, false, false );
        this.call_tree.addColumn( 'CRC'                                , 'crc'              , 50 , Grid.Number, false, true  );
        this.call_tree.addColumn( common.Util.CTR( 'Class'            ), 'class_name'       , 150, Grid.String, true , false, 'treecolumn' );
        this.call_tree.addColumn( common.Util.CTR( 'Method'           ), 'method_name'      , 150, Grid.String, true , false );
        this.call_tree.addColumn( 'Calling Method ID'                  , 'calling_methid_id', 50 , Grid.String, false, true  );
        this.call_tree.addColumn( 'Calling CRC'                        , 'calling_crc'      , 50 , Grid.String, false, true  );
        this.call_tree.addColumn( common.Util.CTR( 'Execute Count'    ), 'exec_count'       , 100, Grid.Number, true , false );
        this.call_tree.addColumn( common.Util.CTR( 'Elapsed Time'     ), 'elapsed_time'     , 100, Grid.Float , true, false );
        this.call_tree.addColumn( common.Util.CTR( 'Exception Count'  ), 'err_count'        , 100, Grid.Number, true , false );
        this.call_tree.addColumn( common.Util.CTR( 'Elapse Time Ratio'), 'elapse_ratio'     , 100, Grid.Number, true , false );
        this.call_tree.addColumn( common.Util.CTR( 'Method Type'      ), 'method_type'      , 150, Grid.String, true , false );
        this.call_tree.addColumn( 'SEQ'                                , 'methid_seq'       , 30 , Grid.Number, false, false );
        this.call_tree.addColumn( 'Level ID'                           , 'level_id'         , 30 , Grid.Number, false, false );
        this.call_tree.addColumn( 'HOST NAME'                          , 'HOST_NAME'        , 30 , Grid.String, false, true  );
        this.call_tree.addColumn( 'TID'                                , 'tid'              , 50 , Grid.String, false, false );
        this.call_tree.addColumn( common.Util.CTR('CPU TIME')          , 'cpu_time'         , 50 , Grid.Float , false , true );

        var ratio_render = function(value) {
            return '<div style="position:relative; width:100%; height:13px">' +
                '<div data-qtip="' + value + '%' + '" style="float:left; background-color:#5898E9;height:100%;width:' + value + '%;"></div>' +
                '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(1) + '%</div>' +
                '</div>';
        };

        this.call_tree.addRenderer('elapse_ratio', ratio_render, RendererType.bar);
        this.call_tree.endAddColumns();

    },

    _create_browser_time: function() {

        var self = this;

        var _draw_chart = function(value, meta, record) {
            if (record.data) {
                var transmitting = parseFloat(record.data['transmitting']);
                var reception    = parseFloat(record.data['reception']);
                var network      = parseFloat(record.data['network']);
                var server       = parseFloat(record.data['server']);
                var total        = transmitting + reception + network + server;

                transmitting = ((transmitting / total) * 100).toFixed(3);
                reception    = ((reception    / total) * 100).toFixed(3);
                network      = ((network      / total) * 100).toFixed(3);
                server       = ((server       / total) * 100).toFixed(3);


                var BarChart = '<div style="position:relative; width:100%; height:13px">'
                    + '<div data-qtip="' + common.Util.CTR('Transmitting Time') + ': ' + transmitting + '%' + '" style="float:left; background-color:#FFE699;background:#FFE699;height:100%;width:' + transmitting + '%;"></div>'
                    + '<div data-qtip="' + common.Util.CTR('Reception Time')    + ': ' + reception    + '%' + '" style="float:left; background-color:#F4B183;background:#F4B183;height:100%;width:' + reception    + '%;"></div>'
                    + '<div data-qtip="' + common.Util.CTR('Network Time')      + ': ' + network      + '%' + '" style="float:left; background-color:#1F4E79;background:#1F4E79;height:100%;width:' + network      + '%;"></div>'
                    + '<div data-qtip="' + common.Util.CTR('Server Time')       + ': ' + server       + '%' + '" style="float:left; background-color:#A9D18E;background:#A9D18E;height:100%;width:' + server       + '%;"></div>'
                    + '</div>';

                // return BarChart;
                meta.tdCls = meta.tdCls + ' customContentCell';
                return '';
            }
        };



        this.grd_browser = Ext.create('Exem.BaseGrid',{
            itemId  : 'browser_time',
            gridName: 'pa_browser_time_gridName',
            width   : '100%',
            usePager: false,
            adjustGrid: false
        });
        this.grd_browser.beginAddColumns();
        this.grd_browser.addColumn( common.Util.CTR('Transaction'   )   , 'txn'         , 150, Grid.String, true, false );
        this.grd_browser.addColumn( common.Util.CTR('Ratio (%)'     )   , 'chart'       , 120, Grid.String, true, false );
        this.grd_browser.addColumn( common.Util.CTR('Transmitting Time'), 'transmitting', 90 , Grid.Float , true, false );
        this.grd_browser.addColumn( common.Util.CTR('Reception Time')   , 'reception'   , 90 , Grid.Float , true, false );
        this.grd_browser.addColumn( common.Util.CTR('Network Time')     , 'network'     , 140, Grid.Number, true, false );
        this.grd_browser.addColumn( common.Util.CTR('Server Time')      , 'server'      , 90 , Grid.Float , true, false );
        this.grd_browser.endAddColumns();

        this.bottom_tab.items.items[3].add( this.grd_browser );
        this.grd_browser.loadLayout(this.grd_browser.gridName);
        this.grd_browser.addRenderer('chart', _draw_chart, RendererType.bar);

        this.grd_browser.pnlExGrid.getView().on('refresh', function() {

            var recordIdx, record;

            this.starttime = null;

            for (recordIdx = 0; recordIdx < this.grd_browser.pnlExGrid.store.getCount(); recordIdx++) {
                record = this.grd_browser.pnlExGrid.store.getAt(recordIdx);

                if ( Number(record.data.tid) == 0 ) {
                    this.starttime = record.data.start_time;
                }

                var grid_row = this.grd_browser.pnlExGrid.view.getNode(record);
                if ( grid_row && Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0] ) {
                    var el = Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0].children;
                } else {
                    return;
                }

                if ( el[0].getElementsByClassName('quick-tip').length > 0 ) {
                    return;
                }

                // maxtime 사용자체감시간
                var tran     = parseFloat(record.data['transmitting']);
                var recive   = parseFloat(record.data['reception']);
                var net_time = parseFloat(record.data['network']);
                var ser_time = parseFloat(record.data['server']);
                var total    = tran + recive + net_time + ser_time;

                tran     = (( tran / total )     * 100).toFixed(3) || 0;
                recive   = (( recive / total )   * 100).toFixed(3) || 0;
                net_time = (( net_time / total ) * 100).toFixed(3) || 0;
                ser_time = (( ser_time / total ) * 100).toFixed(3) || 0;

                var bg  = document.createElement('div');
                var tra = document.createElement('div');
                var rec = document.createElement('div');
                var net = document.createElement('div');
                var ser = document.createElement('div');

                tra.setAttribute('class', 'quick-tip');
                rec.setAttribute('class', 'quick-tip');
                net.setAttribute('class', 'quick-tip');
                ser.setAttribute('class', 'quick-tip');
                tra.setAttribute('data-tab', self.id);
                rec.setAttribute('data-tab', self.id);
                net.setAttribute('data-tab', self.id);
                ser.setAttribute('data-tab', self.id);

                bg.style.width = '100%';
                bg.style.height = '100%';
                bg.style.marginTop = '-12px';

                tra.style.width = tran + '%';
                tra.style.height = '10px';
                tra.style.backgroundColor = '#FFE699';
                tra.style.float = 'left';

                rec.style.width = recive + '%';
                rec.style.height = '10px';
                rec.style.backgroundColor = '#F4B183';
                rec.style.float = 'left';

                net.style.width = net_time + '%';
                net.style.height = '10px';
                net.style.backgroundColor = '#1F4E79';
                net.style.float = 'left';

                ser.style.width = ser_time + '%';
                ser.style.height = '10px';
                ser.style.backgroundColor = '#A9D18E';
                ser.style.float = 'left';

                el[0].appendChild( bg );

                bg.appendChild( tra );
                bg.appendChild( rec );
                bg.appendChild( net );
                bg.appendChild( ser );

                bg = null;
                tra = null;
                rec = null;
                net = null;
                ser = null;
                tran  = null;
                recive  = null;
                net_time  = null;
                ser_time  = null;

                self.create_tooltip(record);
            }
        }.bind(this));

    },

    create_tooltip: function(record){

        var self = this;

        //<div class="quick-tip" data-tip="THIS IS THE TIP! change elements 'data-tip' to change." data-tip-on="false">?</div>

        /*
         * 0,1 -> 0
         * 2,3 -> 1
         * 4,5 -> 2
         * 6,7 -> 3
         * .
         * .
         * */

        this.tip      = document.createElement('div');
        this.bodytime = document.createElement('div');

        this.tra_name = document.createElement('div');
        this.tra_rec  = document.createElement('div');

        this.rec_name  = document.createElement('div');
        this.rec_rec   = document.createElement('div');

        this.net_name  = document.createElement('div');
        this.net_rec   = document.createElement('div');

        this.ser_name  = document.createElement('div');
        this.ser_rec   = document.createElement('div');



        if ( self.tip.getAttribute('data-tab') == null ) {
            self.tip.setAttribute('data-tab', self.id);
        }

        var elems_arr = [];

        var elems = document.getElementsByClassName('quick-tip'),
            ix, ixLen;
        for (ix = 0, ixLen = elems.length; ix < ixLen; ix++) {
            if ( (elems[ix].getAttribute('data-tab') !== self.id) || (elems[ix].getAttribute('data-tool-tip') !== null) ) {
                continue;
            }

            elems[ix].setAttribute('data-tool-tip', true);
            elems_arr.push( elems[ix] );
        }

        for ( ix = 0, ixLen = elems_arr.length; ix < ixLen; ix++ ) {
            elems_arr[ix].addEventListener('mouseover', doTip.bind(record), false);
            elems_arr[ix].addEventListener('mouseout' , doTip.bind(record), true);
        }

        ix = null;
        elems_arr = null;


        function doTip(e) {
            var elem = e.toElement;
            if ( self.tip.getAttribute('data-tip-on') === null ) {
                self.tip.setAttribute('data-tip-on', 'false');
            }

            if ( self.tip.getAttribute('data-tab') !== self.id ) {
                return;
            }

            if ( self.tip.getAttribute('data-tip-on')  === 'false' ) {

                self.tip.setAttribute('data-tip-on', 'true');

                var rect = elem.parentNode.getBoundingClientRect();
                var left_loc = rect.left;
                var bottom_loc = rect.bottom;

                if (bottom_loc > 723) {

                    bottom_loc =  bottom_loc - 140;
                }

                self.tip.innerHTML = elem.getAttribute('data-tip');
                self.tip.style.top =  bottom_loc  + 'px';
                self.tip.style.left = (left_loc) + 'px';
                self.tip.style.height = 120 + 'px';
                self.tip.style.border = 1;

                self.tip.style.zIndex = 100;

                self.tip.setAttribute('class','tip-box');

                var total    = record.data['transmitting'] + record.data['reception'] + record.data['network'] + record.data['server'];

                self.bodytime.innerHTML = common.Util.TR('Feeling Time') + ' : ' + total.toFixed(3);
                self.bodytime.style.top = rect.bottom + 10 + 'px';
                self.bodytime.style.fontWeight = 'bold';
                self.bodytime.style.size = '13px';
                self.bodytime.setAttribute('class','tip-title');

                self.tra_name.setAttribute('class','tip-title');
                self.tra_rec.setAttribute('class','tip-tra-rec');
                self.tra_name.innerHTML = common.Util.TR('Transmitting Time') + ' : ' + record.data['transmitting'].toFixed(3);

                self.rec_name.setAttribute('class','tip-title');
                self.rec_rec.setAttribute('class','tip-rec-rec');
                self.rec_name.innerHTML = common.Util.TR('Reception Time') + ' : ' +  record.data['reception'].toFixed(3);

                self.net_name.setAttribute('class','tip-title');
                self.net_rec.setAttribute('class','tip-net-rec');
                self.net_name.innerHTML = common.Util.TR('Network Time') + ' : ' + record.data['network'].toFixed(3);

                self.ser_name.setAttribute('class','tip-title');
                self.ser_rec.setAttribute('class','tip-ser-rec');
                self.ser_name.innerHTML = common.Util.TR('Server Time') + ' : ' + record.data['server'].toFixed(3);

                self.tip.appendChild( self.bodytime );

                self.tip.appendChild( self.tra_rec );
                self.tip.appendChild( self.tra_name );

                self.tip.appendChild( self.rec_rec );
                self.tip.appendChild( self.rec_name );

                self.tip.appendChild( self.net_rec );
                self.tip.appendChild( self.net_name );

                self.tip.appendChild( self.ser_rec );
                self.tip.appendChild( self.ser_name );

                document.body.appendChild(self.tip);

            } else {

                self.tip.setAttribute('data-tip-on', 'false');

                if ( self.tip.parentNode == undefined ) {
                    self.tip.remove();
                } else {
                    self.tip.parentNode.removeChild(self.tip);
                }
            }
        }

        ix = null;
        elems = null;

    } ,

    /*
     * Exception Type 처리 함수
     * txn_detail에 데이터가 존재하나 class_method_exception이 없을 경우를 처리
     * */
    exceptionTypeProc: function(data) {
        var retExceptionText = '',
            exceptionCnt = data[19],
            exceptionType = data[5];

        if (exceptionCnt > 0 && exceptionType == '') {
            retExceptionText = 'UnCaught Exception';
        } else {
            retExceptionText = exceptionType;
        }


        return retExceptionText;
    },

    chartToggleValue: function() {
        var state;

        if (common.Menu.useTxnResponseChart) {
            state = true;
            if (this.isRTM) {
                state = false;
            }
        } else {
            state = false;
        }

        return state;
    }
});
