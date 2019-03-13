Ext.define('rtm.src.rtmActiveTxnDetail', {
    extend: 'Exem.Form',
    layout: 'vbox',
    maximizable: false,
    width: 1000,
    height: 650,
    resizable: false,
    closeAction: 'destroy',
    title: common.Util.TR('Active Transaction Detail'),
    padding: '5 5 5 5',

    listeners: {
        close: function() {
            /* 사용한 자원은 여기서 해제한다. */
        }
    },

    txninfo_field_arr: [],
    tid: '',
    wasid: '',
    starttime: '',
    current_time: '',
    stack_dump: false,
    stack_dump_data: null,
    cpu_chart_data: [],
    mem_chart_data: [],
    ratioZeroCheck: true,

    isWinClosed  : false,

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initWindow: function() {
        this.form = Ext.create('Exem.XMWindow', {
            layout       : 'vbox',
            maximizable  : true,
            width        : 1000,
            height       : 650,
            minWidth     : 1000,
            minHeight    : 650,
            resizable    : true,
            closeAction  : 'destroy',
            title        : common.Util.TR('Active Transaction Detail'),
            cls          : 'xm-dock-window-base rtm-activetxn-detail',
            openViewType : Comm.RTComm.getCurrentMonitorType(),
            listeners: {
                scope: this,
                beforeclose: function() {
                    this.stopRefreshCallTree();
                    this.isClosed = true;
                    this.isWinClosed = true;

                    if (this.checkThreadDumpTimerId) {
                        clearTimeout(this.checkThreadDumpTimerId);
                    }

                    Ext.Array.remove(realtime.syntaxEditorList, this.stackDumpEditor.id);
                    Ext.Array.remove(realtime.syntaxEditorList, this.bindList.id);
                },
                close: function() {
                }
            }
        });
        this.form.show();
        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.form
        });
        this.loadingMask.show(true);
    },


    /**
     * 윈도우 모드가 아닌 경우 액티브 트랜잭션 화면을 표시할 때 사용되는 레이아웃
     * (예 URL 연계를 통한 화면 표시)
     */
    initBaseFrame: function() {
        this.form = Ext.create('Exem.Container', {
            layout   : 'vbox',
            cls: 'xm-dock-window-base rtm-activetxn-detail',
            flex: 1,
            style: 'border:0px !important'
        });
        this.padding = '0 0 0 0';
        this.add(this.form);
    },

    initProperty: function() {
        this.isDisableThread = this.monitorType !== 'TP' && this.monitorType !== 'TUX';
    },


    init: function(record) {
        var self = this;
        this.record = record;

        this.initProperty();

        console.debug('%c [Transaction Detail] Call Parameters - TID / WASID / StartTime: ', 'color:#3191C8;', record.tid + ' / ' + record.wasid + ' / ' + common.Util.getDate(record.starttime));

        // 중단 탭 영역
        var panelB = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: 400,
            margin: '4 4 4 4',
            border: false
        });

        // 좌측 탭 영역
        var panelB_left = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            region: 'center',
            flex: 1,
            height: '100%',
            margin: '1 1 1 1',
            split: true,
            border: false
        });

        var isChecked = Comm.RTComm.getBooleanValue(Comm.web_env_info.rtm_txndetail_calltree_checked);

        this.ratioZeroCheck = isChecked;

        var tabPanel = Ext.create('Exem.TabPanel', {
            plugins: Ext.create('Ext.ux.TabReorderer'),
            layout: 'fit',
            flex: 1,
            width: '100%',
            id: 'txndetail_tabpanel' + this.id,
            border: false,
            activeTab: 0,
            items: [{
                title: common.Util.TR('Transaction Info'),
                layout: 'hbox',
                id: 'txndetail_txninfo' + this.id,
                border: false,
                bodyStyle: { background: 'transpert' }
            }, {
                title: common.Util.TR('Current Call Tree'),
                layout: 'vbox',
                id: 'txndetail_calltree' + this.id,
                border: false,
                tbar: [{
                    xtype: 'tbspacer',
                    flex: 1
                },{
                    xtype     : 'checkbox',
                    checked   : isChecked,
                    margin    : '0 5 0 0',
                    listeners : {
                        change: function() {
                            common.WebEnv.Save('rtm_txndetail_calltree_checked', this.getValue());
                            self.excludeZeroRatio(this.getValue());
                        }
                    }
                },{
                    xtype: 'tbtext',
                    text : common.Util.TR('Exclude 0% Elapse Time'),
                    cls  : 'checkbox-exclude-label'
                }]
            }, {
                title: common.Util.TR('Thread Dump'),
                layout: 'vbox',
                id: 'txndetail_stackdump' + this.id,
                border: false,
                bodyStyle: { background: 'transpert' }
            }]
        });

        // Stack Dump
        this.stackDumpEditor = Ext.create('Exem.SyntaxEditor', {
            mode: 'jade',
            width: '100%',
            height: '100%',
            flex: 1,
            readOnly: true,
            autoScroll: true
        });

        // 탭 영역 하단의 버튼 영역(Kill Thread)
        var panelB_bottom = Ext.create('Ext.panel.Panel', {
            layout: { type: 'hbox', pack: 'start', align: 'middle' },
            width : '100%',
            height: 30,
            margin: '1 1 1 1',
            border: false,
            cls   : 'button-panel'
        });

        // kill Thread Button
        var panelA_killthread_button = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Kill Thread'),
            id: 'rtm_txndetail_killthread_button' + this.id,
            cls: 'rtm-btn killthread-btn', //'x-btn-config-default',
            width: 100,
            margin: '0 2 0 4',
            listeners: {
                click: self.executeKillThread.bind(this)
            }
        });

        // Suspend Button
        this.panelA_suspend_button = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Suspend'),
            id: 'rtm_txndetail_suspend_button' + this.id,
            cls: 'rtm-btn suspend-btn',
            margin: '0 2 0 2',
            listeners: {
                click: self.executeSuspendThread.bind(this)
            }
        });

        // 우측 그리드 영역
        var panelB_right = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            region: 'east',
            width: 300,
            height: '100%',
            margin: '1 1 1 1',
            split: true,
            border: false
        });

        var panelB_right_middle = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            margin: '2 1 1 1',
            border: false,
            bodyStyle: { background: 'transpert' }
        });

        var editTheme;
        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                editTheme = 'ace/theme/dark_imx';
                break;
            case 'White' :
                editTheme = 'ace/theme/eclipse';
                break;
            default :
                editTheme = 'ace/theme/dark_imx';
                break;
        }

        // Bind List
        if (+Comm.config.login.permission.bind === 1 ) {
            this.bindList = Ext.create('Exem.SyntaxEditor', {
                mode  : 'jade',
                width : '100%',
                height: '100%',
                flex  : 1,
                cls   : 'rtm-activetxn-detail-bindlist',
                readOnly: true,
                autoScroll: true,
                editTheme: editTheme
            });
        } else {
            this.bindList = Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                width : '100%',
                height: '100%',
                flex  : 1,
                cls   : 'rtm-activetxn-detail-bindlist emptyBox',
                html  : common.Util.TR('You do not have enough privilege to view bind variables')
            });
        }

        var panelB_right_middle_title = Ext.create('Ext.panel.Panel', {
            layout: { type: 'hbox', pack: 'start', align: 'middle' },
            width : '100%',
            height: 20,
            border: false,
            cls   : 'txndetail-panel',
            items: [{
                xtype: 'label',
                margin: '0 0 0 5',
                html: common.Util.usedFont(9, common.Util.TR('Bind Value List'))
            }]
        });

        panelB_right_middle.add(panelB_right_middle_title, this.bindList);

        if (!realtime.syntaxEditorList) {
            realtime.syntaxEditorList = [];
        }

        var isContain;
        if (+Comm.config.login.permission.bind === 1 ) {
            isContain = Ext.Array.contains(realtime.syntaxEditorList, this.bindList.id);
            if (!isContain) {
                realtime.syntaxEditorList[realtime.syntaxEditorList.length] = this.bindList.id;
            }
        }

        var panelB_right_bottom = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            margin: '2 1 1 1',
            border: false,
            bodyStyle: { background: 'transpert' }
        });

        // SQL List
        var panelB_right_bottom_title = Ext.create('Ext.panel.Panel', {
            layout: { type: 'hbox', pack: 'start', align: 'middle' },
            width : '100%',
            height: 20,
            border: false,
            cls   : 'txndetail-panel',
            items: [{
                xtype: 'label',
                margin: '0 0 0 5',
                html: common.Util.usedFont(9, common.Util.TR('SQL List'))
            }]
        });

        // SQL List Grid
        this.gridSQLList = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            usePager: false,
            borderVisible: true,
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName : common.Util.TR('SQL List'),
            useEmptyText: true,
            emptyTextMsg: common.Util.TR('No data to display'),
            flex: 1,
            itemclick: function(dv, record) {
                if (+Comm.config.login.permission.bind === 1 ) {
                    self.convertBind(record.data.bind);
                }
            },
            itemdblclick: function(dv, record) {
                var dbId, mxgParams, sqlFullText, theme, editTheme;

                if (record.data.sqltext !== '') {
                    // MFO 화면 연동에 필요한 파라미터 값을 설정함.
                    dbId = Comm.RTComm.getDBIdyName(self.record.instancename);
                    mxgParams = {
                        dbId    : dbId,
                        sqlUid  : record.data.sqlid,
                        sid     : self.record.sid,
                        tid     : self.record.tid,
                        viewType: 'SessionDetail'
                    };

                    sqlFullText = Ext.create('Exem.FullSQLTextWindow', {
                        cls: 'rtm-sqlview',
                        mxgParams : mxgParams
                    });
                    sqlFullText.getFullSQLText(record.data.sqlid, record.data.bind);

                    theme = Comm.RTComm.getCurrentTheme();
                    switch (theme) {
                        case 'Black' :
                            editTheme = 'ace/theme/dark_imx';
                            break;
                        case 'White' :
                            editTheme = 'ace/theme/eclipse';
                            break;
                        default :
                            editTheme = 'ace/theme/dark_imx';
                            break;
                    }
                    sqlFullText.addCls('xm-dock-window-base');
                    sqlFullText.BaseFrame.sqlEditor.editTheme = editTheme;
                    sqlFullText.BaseFrame.bindEditor.editTheme = editTheme;

                    sqlFullText.show();
                }
            }
        });

        panelB_right_bottom.add(panelB_right_bottom_title, this.gridSQLList);
        this.sqllist_grid_addcolumn();

        panelB_right.add(panelB_right_middle, panelB_right_bottom);

        //suspend 기능 실행 시 Server Agent에서는 지원하지 않기 때문에 RTM에서 suspend 버튼 제거 (MFJ-181)
        // 16-01-28 미래에셋생명 요청으로 Suspend 기능 활성화
        panelB_bottom.add(panelA_killthread_button, this.panelA_suspend_button);

        panelB_left.add(tabPanel, panelB_bottom);
        panelB.add(panelB_left, panelB_right);


        // 하단 그리드 영역
        var panelC = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            //cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            listeners: {
                afterRender: function() {
                }
            }
        });

        // 그리드 영역 타이틀
        var panelC_title = Ext.create('Ext.panel.Panel', {
            layout: { type: 'hbox', pack: 'start', align: 'middle' },
            width : '100%',
            height: 24,
            border: false,
            cls   : 'txndetail-panel',
            items: [{
                xtype: 'label',
                margin: '10 0 0 5',
                html: common.Util.TR('Active Transaction')
            }]
        });

        // 그리드 본체 영역
        this.panelC_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: 'transpert' }
        });

        this.gridCallTree_AddColumn();

        panelC.add(panelC_title, this.panelC_body);

        this.form.add(panelB, panelC);

        // Stack Dump 탭은 Hide 상태로 시작한다.
        var stack_dump_tab = Ext.getCmp('txndetail_tabpanel' + this.id);
        if (!this.stack_dump) {
            stack_dump_tab.getTabBar().items.items[2].hide();
        } else {
            stack_dump_tab.getTabBar().items.items[2].show();
        }

        // 권한에 따라 버튼 속성 설정
        Ext.getCmp('rtm_txndetail_killthread_button' + this.id).setDisabled(false);

        if (+cfg.login.permission.kill_thread !== 1) {
            Ext.getCmp('rtm_txndetail_killthread_button' + this.id).setDisabled(true);

            Ext.getCmp('rtm_txndetail_killthread_button' + this.id).setVisible(false);
        }

        if (Ext.isEmpty(this.record.tid) === true || Ext.isEmpty(this.record.wasid) === true) {
            Ext.getCmp('rtm_txndetail_killthread_button' + this.id).setDisabled(true);
            Ext.getCmp('rtm_txndetail_killthread_button' + this.id).setVisible(false);
        }

        setTimeout(function() {
            if (this.isWinClosed === true) {
                return;
            }
            this.sendInfo();
        }.bind(this), 5);

        setTimeout(function() {
            if (this.isWinClosed === true) {
                return;
            }
            this.create_txninfo();
            this.currentCallTree();
        }.bind(this), 5);

        setTimeout(function() {
            if (this.isWinClosed === true) {
                return;
            }
            this.gridActiveTxn_AddColumn();
            this.ActiveTxn();
        }.bind(this), 5);
    },

    /**
     * Kill Thread
     */
    executeKillThread: function() {
        var self = this;
        this.checkCloseTxn(function() {
            var AJSON = {}, opts;
            Ext.MessageBox.show({
                title: '',
                message: common.Util.TR('Warning!! System could be changed to unstable by killing thread.'),
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.WARNING,
                fn: function(btnId) {
                    if (btnId === 'yes') {
                        opts = {
                            was_id: self.record.wasid,
                            tid   : self.record.tid,
                            type  : '1',
                            dbname: Comm.web_env_info.Intermax_MyRepository
                        };

                        AJSON.dll_name = 'IntermaxPlugin.dll';
                        AJSON.options  = opts;
                        AJSON.function =  'kill_thread';

                        console.debug('%c [Transaction Detail] Kill Thread - TID / WASID: ', 'color:#3191C8;', AJSON.options.tid + ' / ' + AJSON.options.was_id);

                        WS.PluginFunction(AJSON, function(aheader, adata) {
                            if (adata == null) {
                                Ext.Msg.alert(common.Util.TR('Failure'), common.Util.TR('Failure kill thread') + '\r\r' + 'WAS: ' + Comm.RTComm.getWASNamebyId(self.record.wasid) + '\n' + 'Transaction Name: ' + self.record.txnname);
                            } else {
                                if (Ext.isEmpty(adata.Value) !== true) {
                                    Ext.Msg.alert(common.Util.TR('Successful'), common.Util.TR('Successful kill thread') + '\r\r' + 'WAS: ' + Comm.RTComm.getWASNamebyId(self.record.wasid) + '\n' + 'Transaction Name: ' + self.record.txnname);
                                } else {
                                    Ext.Msg.alert(common.Util.TR('Failure'), common.Util.TR('Failure kill thread') + '\r\r' + 'WAS: ' + Comm.RTComm.getWASNamebyId(self.record.wasid) + '\n' + 'Transaction Name: ' + self.record.txnname);
                                }
                            }
                        }, this );
                    }
                }
            });
        });
    },


    /**
     * Suspend/Resume Thread
     */
    executeSuspendThread: function(_this) {
        var self = this;
        this.checkCloseTxn(function() {
            var AJSON = {}, opts;
            if (_this.text === common.Util.TR('Suspend')) {
                Ext.MessageBox.show({
                    title: '',
                    message: common.Util.TR('Warning!! System could be changed to unstable by suspending thread.'),
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.MessageBox.WARNING,
                    fn: function(btnId) {
                        if (btnId === 'yes') {
                            opts = {
                                was_id: self.record.wasid,
                                tid: self.record.tid,
                                type: '2',
                                dbname: Comm.web_env_info.Intermax_MyRepository
                            };

                            AJSON.dll_name = 'IntermaxPlugin.dll';
                            AJSON.options  = opts;
                            AJSON.function =  'kill_thread';

                            console.debug('%c [Transaction Detail] Thread Suspend - TID / WASID: ', 'color:#3191C8;', AJSON.options.tid + ' / ' + AJSON.options.was_id);

                            WS.PluginFunction( AJSON, function(aheader, adata) {
                                if (adata == null) {
                                    Ext.Msg.alert(common.Util.TR('Failure'), common.Util.TR('Failure suspend thread') + '\r\r' + 'WAS: ' + self.record.wasid + '\n' + 'Transaction Name: ' + self.record.txnname);
                                }
                                if (Ext.isEmpty(adata.Value) !== true) {
                                    Ext.Msg.alert(common.Util.TR('Successful'), common.Util.TR('Successful suspend thread') + '\r\r' + 'WAS: ' + self.record.wasid + '\n' + 'Transaction Name: ' + self.record.txnname);
                                    self.panelA_suspend_button.setText(common.Util.TR('Resume'));
                                } else {
                                    Ext.Msg.alert(common.Util.TR('Failure'), common.Util.TR('Failure suspend thread') + '\r\r' + 'WAS: ' + self.record.wasid + '\n' + 'Transaction Name: ' + self.record.txnname);
                                }
                            }, this );
                        }
                    }
                });
            } else if (_this.text === common.Util.TR('Resume')) {
                opts = {
                    was_id: self.record.wasid,
                    tid: self.record.tid,
                    type: '3',
                    dbname: Comm.web_env_info.Intermax_MyRepository
                };

                AJSON.dll_name = 'IntermaxPlugin.dll';
                AJSON.options  = opts;
                AJSON.function =  'kill_thread';

                console.debug('%c [Transaction Detail] Thread Resume - TID / WASID: ', 'color:#3191C8;', AJSON.options.tid + ' / ' + AJSON.options.was_id);

                WS.PluginFunction( AJSON, function(aheader, adata) {
                    if (adata == null) {
                        Ext.Msg.alert(common.Util.TR('Failure'), common.Util.TR('Failure resume thread') + '\r\r' + 'WAS: ' + self.record.wasid + '\n' + 'Transaction Name: ' + self.record.txnname);
                    }

                    if (Ext.isEmpty(adata.Value) !== true) {
                        Ext.Msg.alert(common.Util.TR('Successful'), common.Util.TR('Successful resume thread') + '\r\r' + 'WAS: ' + self.record.wasid + '\n' + 'Transaction Name: ' + self.record.txnname);
                        self.panelA_suspend_button.setText(common.Util.TR('Suspend'));
                    } else {
                        Ext.Msg.alert(common.Util.TR('Failure'), common.Util.TR('Failure resume thread') + '\r\r' + 'WAS: ' + self.record.wasid + '\n' + 'Transaction Name: ' + self.record.txnname);
                    }
                }, this );
            }

        });
    },


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    convertBind: function(bind) {
        var tmp = common.Util.convertBindList(bind);
        var result = '',
            ix, ixLen;

        try {
            for (ix = 0, ixLen = tmp.length; ix < ixLen; ix++) {
                result += tmp[ix].code + '=' + tmp[ix].value + '\n';
            }
            this.bindList.setText(result);
        } finally {
            tmp = null;
            result = null;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    gridActiveTxn_AddColumn: function() {
        var self = this;

        this.gridActiveTxn = Ext.create('Exem.BaseGrid', {
            layout        : 'fit',
            usePager      : false,
            borderVisible : true,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: common.Util.TR('Active Transaction'),
            gridName      : 'TxnDetail_ActiveTxn',
            celldblclick: function(thisGrid, td, cellIndex, record, tr, rowIndex, e) {
                var isShow;
                var dataIndex = e.position.column.dataIndex;

                switch (dataIndex) {
                    case 'sql_text1':
                    case 'sql_text2':
                    case 'sql_text3':
                    case 'sql_text4':
                    case 'sql_text5':
                        isShow = true;
                        break;
                    default:
                        isShow = false;
                        break;
                }
                if (!isShow) {
                    return;
                }

                var sqlid;
                var temp = thisGrid.headerCt.getHeaderAtIndex(cellIndex);
                switch (temp.text) {
                    case 'SQL 1' : sqlid = record.data.sqlid1;
                        break;
                    case 'SQL 2' : sqlid = record.data.sqlid2;
                        break;
                    case 'SQL 3' : sqlid = record.data.sqlid3;
                        break;
                    case 'SQL 4' : sqlid = record.data.sqlid4;
                        break;
                    case 'SQL 5' : sqlid = record.data.sqlid5;
                        break;
                    default:
                        sqlid = '';
                        break;
                }

                // MFO 화면 연동에 필요한 파라미터 값을 설정함.
                var dbId = Comm.RTComm.getDBIdyName(self.record.instancename);
                var mxgParams = {
                    dbId    : dbId,
                    sqlUid  : sqlid,
                    sid     : self.record.sid,
                    tid     : self.record.tid,
                    viewType: 'SessionDetail'
                };

                var sqlFullText = Ext.create('Exem.FullSQLTextWindow',{
                    cls: 'rtm-sqlview',
                    mxgParams: mxgParams
                });

                sqlFullText.getFullSQLText(sqlid, record.data.bind_code);

                var theme = Comm.RTComm.getCurrentTheme();
                var editTheme;
                switch (theme) {
                    case 'Black' :
                        editTheme = 'ace/theme/dark_imx';
                        break;
                    case 'White' :
                        editTheme = 'ace/theme/eclipse';
                        break;
                    default :
                        editTheme = 'ace/theme/dark_imx';
                        break;
                }
                sqlFullText.addCls('xm-dock-window-base');
                sqlFullText.BaseFrame.sqlEditor.editTheme = editTheme;
                sqlFullText.BaseFrame.bindEditor.editTheme = editTheme;

                sqlFullText.show();
            }
        });
        this.panelC_body.add(this.gridActiveTxn);

        this.gridActiveTxn.beginAddColumns();
        this.gridActiveTxn.addColumn(common.Util.CTR('Time'                    ), 'time'          , 100,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Agent'                   ), 'was_name'      , 100,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Transaction'             ), 'txn_name'      , 200,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Class Method'            ), 'class_method'  , 300,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Method Type'             ), 'method_type'   , 100,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Client IP'               ), 'client_ip'     , 120,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Login Name'              ), 'login_name'    , 100,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Browser'                 ), 'browser'       , 100,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Elapse Time'             ), 'elapse_time'   , 150,  Grid.Float,  true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Start Time'              ), 'start_time'    , 140,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('DB Time'                 ), 'db_time'       ,  90,  Grid.Float,  true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('CPU Time'                ), 'cpu_time'      ,  90,  Grid.Float,  true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Wait Time'               ), 'wait_time'     ,  90,  Grid.Float,  true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Pool'                    ), 'pool_name'     , 150,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Instance Name'           ), 'inctance_name' , 110,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SID'                     ), 'sid'           , 100,  Grid.Number, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('State'                   ), 'state'         , 150,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Bind Value'              ), 'bind_list'     , 200,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Bind'                    ), 'bind_code'     ,  10,  Grid.String, false, true);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQLID 1'                 ), 'sqlid1'        , 100,  Grid.String, false, false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQL 1'                   ), 'sql_text1'     , 200,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQLID 2'                 ), 'sqlid2'        , 100,  Grid.String, false, false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQL 2'                   ), 'sql_text2'     , 200,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQLID 3'                 ), 'sqlid3'        , 100,  Grid.String, false, false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQL 3'                   ), 'sql_text3'     , 200,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQLID 4'                 ), 'sqlid4'        , 100,  Grid.String, false, false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQL 4'                   ), 'sql_text4'     , 200,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQLID 5'                 ), 'sqlid5'        , 100,  Grid.String, false, false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQL 5'                   ), 'sql_text5'     , 200,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('SQL Execution Count'     ), 'sql_exec_count', 150,  Grid.Number, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Fetch Count'             ), 'fetch_count'   , 120,  Grid.Number, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Prepare Count'           ), 'prepare_count' , 120,  Grid.Number, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('PGA Usage'               ), 'pgausage'      , 100,  Grid.Float,  true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Logical Reads'           ), 'logical_reads' , 120,  Grid.Number, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Physical Reads'          ), 'phsycal_reads' , 120,  Grid.Number, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Transaction CPU TIME'    ), 'txn_cpu_time'  , 130,  Grid.Float,  true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Thread CPU'              ), 'thread_cpu'    ,  90,  Grid.Float,  false, true);
        this.gridActiveTxn.addColumn(common.Util.CTR('Thread Memory Usage (MB)'), 'thread_memory' ,  90,  Grid.Float,  true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Wait Info'               ), 'wait_info'     , 200,  Grid.String, true,  false);
        this.gridActiveTxn.addColumn(common.Util.CTR('Elapse Time (AVG)'       ), 'avg_elapse'    , 150,  Grid.Float,  false, false);
        this.gridActiveTxn.addColumn(common.Util.CTR('IO Read'                 ), 'io_read'       ,  90,  Grid.Number, false, false);
        this.gridActiveTxn.addColumn(common.Util.CTR('IO Write'                ), 'io_write'      ,  90,  Grid.Number, false, false);
        this.gridActiveTxn.endAddColumns();

        if (this.monitorType !== 'TP' && this.monitorType !== 'TUX') {
            this.gridActiveTxn.contextMenu.addItem({
                title : common.Util.TR('Class Java Source'),
                itemId: 'class_java_source',
                fn: function() {
                    var r = this.up().record;
                    var classview = Ext.create('Exem.ClassView');
                    var index = r.class_method.indexOf('.');
                    classview.classmethod = r.class_method.substr(0, index) + '.class';
                    classview.wasid = Comm.RTComm.getWASIdbyName(r.was_name);
                    classview.init();
                }
            }, 0);

            this.gridActiveTxn.pnlExGrid.addListener('beforecellcontextmenu', function() {
                var serverId = this.record.wasid;

                // .Net 에이전트인 경우 클래스 자바소스, 트랜잭션 자바소스 메뉴를 비활성화 처리한다.
                if (Comm.wasInfoObj[serverId] && Comm.wasInfoObj[serverId].isDotNet) {
                    this.gridActiveTxn.contextMenu.setDisableItem('class_java_source', false);
                }
            }, this);
        }


        // MaxGauge 연계 기능 체크. 사용하는 경우 Context Menu 에 연계 메뉴를 추가함.
        var isEnableMaxGaugeLink = Comm.RTComm.isMaxGaugeLink();

        if (isEnableMaxGaugeLink) {
            // MaxGauge - Session Detail 화면 연계
            this.gridActiveTxn.contextMenu.addItem({
                title : 'DB ' + common.Util.TR('Session Detail'),
                itemId: 'session_detail',
                fn: function() {
                    var r = this.up().record;
                    if (!r.sqlid1) {
                        return;
                    }

                    var dbId  = Comm.RTComm.getDBIdyName(self.record.instancename);
                    var sid   = self.record.sid;
                    var tid   = self.record.tid;

                    Comm.RTComm.openMaxGaugeSessionDetail(dbId, r.sqlid1, sid, tid);
                }
            }, 0);
        }


        if (this.monitorType === 'TP' || this.monitorType === 'TUX') {
            common.WebEnv.setVisibleGridColumn(this.gridActiveTxn, ['class_method', 'method_type'], true);
        }

        //NonDB 인 경우 특정 컬럼 숨김 처리
        if (window.isIMXNonDB === true) {
            common.WebEnv.setVisibleGridColumn(
                this.gridActiveTxn,
                ['cpu_time', 'wait_time', 'pgausage', 'logical_reads', 'phsycal_reads', 'wait_info'],
                true
            );
        }

        // 로그인 사용자가 Bind 권한이 없는 경우 숨김 처리
        if (+Comm.config.login.permission.bind !== 1) {
            common.WebEnv.setVisibleGridColumn(this.gridActiveTxn, ['bind_list'], true);
        }

    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    gridCallTree_AddColumn: function() {
        this.treeCallTree = Ext.create('Exem.BaseGrid', {
            itemId: 'grd_calltree',
            width: '100%',
            flex: 1,
            gridName: 'TxnDetail_CallTree',
            gridType: Grid.exTree,
            borderVisible: true,
            useFindOn    : false,
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: common.Util.TR('Call Tree'),
            usePager: false,
            useEmptyText: true,
            emptyTextMsg: common.Util.TR('No data to display')
        });

        this.treeCallTree.beginAddColumns();
        this.treeCallTree.addColumn(common.Util.CTR('LVL'              ), 'lvl'             ,  100, Grid.String,  false,  true);
        this.treeCallTree.addColumn(common.Util.CTR('WAS ID'           ), 'was_id'          ,  100, Grid.String,  false,  true);
        this.treeCallTree.addColumn(common.Util.CTR('WAS Name'         ), 'was_name'        ,  100, Grid.String,  false,  true);
        this.treeCallTree.addColumn(common.Util.CTR('Method ID'        ), 'method_id'       ,  100, Grid.String,  false,  true);
        this.treeCallTree.addColumn(common.Util.CTR('CRC'              ), 'crc'             ,  100, Grid.String,  false,  true);

        if (this.monitorType === 'TP' || this.monitorType === 'TUX') {
            this.treeCallTree.addColumn(common.Util.CTR('Class'            ), 'class_name'      ,  300, Grid.String,  false,  true);
            this.treeCallTree.addColumn(common.Util.CTR('Trace'            ), 'method_name'     ,  200, Grid.String,  true,   false, 'treecolumn');
        } else {
            this.treeCallTree.addColumn(common.Util.CTR('Class'            ), 'class_name'      ,  300, Grid.String,  true,   false, 'treecolumn');
            this.treeCallTree.addColumn(common.Util.CTR('Method'           ), 'method_name'     ,  200, Grid.String,  true,   false);
        }

        this.treeCallTree.addColumn(common.Util.CTR('Calling Method ID'), 'calling_method_id', 100, Grid.String,  false,  true);
        this.treeCallTree.addColumn(common.Util.CTR('Calling CRC'      ), 'calling_crc'     ,  100, Grid.String,  false,  true);
        this.treeCallTree.addColumn(common.Util.CTR('Exception Count'  ), 'err_count'       ,   80, Grid.Number,  true,   false);
        this.treeCallTree.addColumn(common.Util.CTR('Execute Count'    ), 'exec_count'      ,   80, Grid.Number,  true,   false);
        this.treeCallTree.addColumn(common.Util.CTR('Elapse Time'      ), 'elapse_time'     ,   80, Grid.Float,   true,   false);
        this.treeCallTree.addColumn(common.Util.CTR('Elapse Time Ratio'), 'elapse_ratio'    ,   90, Grid.Float,   true,   false);

        if (this.monitorType === 'TP' || this.monitorType === 'TUX') {
            this.treeCallTree.addColumn(common.Util.CTR('Method Type'      ), 'method_type'     ,  100, Grid.String,  false,   true);
        } else {
            this.treeCallTree.addColumn(common.Util.CTR('Method Type'      ), 'method_type'     ,  100, Grid.String,  true,   false);
        }
        this.treeCallTree.addColumn(common.Util.CTR('Method SEQ'       ), 'method_seq'      ,  100, Grid.String,  false,  true);
        this.treeCallTree.addColumn('level_id'                          , 'level_id'        ,  100, Grid.String,  false,  true);
        this.treeCallTree.addColumn(common.Util.CTR('Thread CPU'       ), 'cpu_time'        ,   80, Grid.Float,   false,  true);

        this.treeCallTree.addRenderer('elapse_ratio', this.gridBarRenderer.bind(this), RendererType.bar);
        this.treeCallTree.endAddColumns();
        this.treeCallTree.drawTree();

        this.treeCallTree.pnlExTree.on({
            scope: this,
            columnresize: function(me, column) {
                if (column.dataIndex === 'elapse_ratio') {
                    this.progressFillWidth = arguments[1].getWidth();
                    if (this.progressFillWidth) {
                        $('#' + this.treeCallTree.id + ' .progress-fill-text').css('width', this.progressFillWidth);
                    }
                }
            }
        });

        if (this.monitorType !== 'TP' && this.monitorType !== 'TUX') {
            this.treeCallTree.contextMenu.addItem({
                title : common.Util.TR('Class Java Source'),
                itemId: 'class_java_source',
                fn: function() {
                    var r = this.up().record;
                    var classview = Ext.create('Exem.ClassView');
                    classview.classmethod = r.class_name + '.class';
                    classview.wasid = r.was_id;
                    classview.init();
                }
            }, 0);

            this.treeCallTree.pnlExTree.addListener('beforecellcontextmenu', function(thisGrid, td, cellIndex, record) {
                var serverId = record.data.was_id;

                // .Net 에이전트인 경우 클래스 자바소스, 트랜잭션 자바소스 메뉴를 비활성화 처리한다.
                if (Comm.wasInfoObj[serverId] && Comm.wasInfoObj[serverId].isDotNet) {
                    this.treeCallTree.contextMenu.setDisableItem('class_java_source', false);
                }
            }, this);
        }
    },

    /**
     *  그리드에 보여지는 막대 그래프 설정.
     *
     * arguments: value, metaData, record, rowIndex, colIndex, store, view
     *
     * @param {string} value - elapse_ratio
     * @return {string}
     */
    gridBarRenderer: function(value) {
        var htmlStr, displayValue;
        var barWidth = value;

        if (value > 0) {
            displayValue = (+value === 100) ? value : value.toFixed(3);

            if (!this.progressFillWidth) {
                this.progressFillWidth = 82;
            }
            htmlStr =
                '<div class="progress-bar" style="border: 0px solid #666; height:13px; width: 100%;position:relative; text-align:center;">' +
                    '<div class="progress-fill" style="width:' + barWidth + '%;">' +
                        '<div class="progress-fill-text" style="width:' + this.progressFillWidth + 'px">' + displayValue + '%</div>' +
                    '</div>' + displayValue + '%' +
                '</div>';
        } else {
            htmlStr =  '<div data-qtip="" style="text-align:center;">' + '0%' + '</div>';
        }

        return htmlStr;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    sqllist_grid_addcolumn: function() {
        var self = this;

        this.gridSQLList.beginAddColumns();
        this.gridSQLList.addColumn(common.Util.CTR('SQL Text'), 'sqltext', 280, Grid.String, true,  false);
        this.gridSQLList.addColumn('SQL Id',                    'sqlid',   100, Grid.String, false, false);
        this.gridSQLList.addColumn('Bind',                      'bind',    100, Grid.String, false, false);
        this.gridSQLList.endAddColumns();

        this.gridSQLList._columnsList[0].flex = 1;

        this.gridSQLList.contextMenu.addItem({
            title : common.Util.TR('Full SQL Text'),
            fn: function() {
                var dbId, sqlId, mxgParams, sqlFullText, theme, editTheme;

                if (this.up().record.sqltext !== '') {
                    // MFO 화면 연동에 필요한 파라미터 값을 설정함.
                    dbId  = Comm.RTComm.getDBIdyName(self.record.instancename);
                    sqlId = this.up().record.sqlid;
                    mxgParams = {
                        dbId    : dbId,
                        sqlUid  : sqlId,
                        sid     : self.record.sid,
                        tid     : self.record.tid,
                        viewType: 'SessionDetail'
                    };
                    sqlFullText = Ext.create('Exem.FullSQLTextWindow', {
                        cls: 'rtm-sqlview',
                        mxgParams: mxgParams
                    });
                    sqlFullText.getFullSQLText(this.up().record.sqlid, this.up().record.bind);

                    theme = Comm.RTComm.getCurrentTheme();
                    switch (theme) {
                        case 'Black' :
                            editTheme = 'ace/theme/dark_imx';
                            break;
                        case 'White' :
                            editTheme = 'ace/theme/eclipse';
                            break;
                        default :
                            editTheme = 'ace/theme/dark_imx';
                            break;
                    }
                    sqlFullText.addCls('xm-dock-window-base');
                    sqlFullText.BaseFrame.sqlEditor.editTheme = editTheme;
                    sqlFullText.BaseFrame.bindEditor.editTheme = editTheme;
                    sqlFullText.show();
                }
            }
        }, 0);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    currentCallTree: function() {
        Ext.getCmp('txndetail_calltree' + this.id).add(this.treeCallTree);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    create_txninfo: function() {

        var valuefield, ix, ixLen;
        var labels = [
            this.monitorType === 'TP' ? 'TP Name' : 'WAS NAME',
            'TID',
            'Transaction Name',
            'Start Time',
            'Elapse Time',
            'Client IP',
            'Instance Name',
            'SID',
            'SQL Execution Count',
            'Fetch Count',
            'Prepare Count',
            'Logical Reads',
            'Physical Reads',
            'Wait Info'
        ];

        // NonDB인 경우 숨김 항목
        var hideLabels = [
            'Logical Reads',
            'Physical Reads',
            'Wait Info'
        ];

        var tab = Ext.getCmp('txndetail_txninfo' + this.id);
        var label_area = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: 150,
            height: '100%'
        });
        var value_area = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            flex: 1,
            height: '100%'
        });

        tab.add(label_area, value_area);

        this.txninfo_field_arr.length = 0;
        for (ix = 0, ixLen = labels.length; ix < ixLen; ix++) {
            // NonDB 인 경우 'Wait Info' 컬럼 숨김 처리
            if (window.isIMXNonDB && hideLabels.indexOf(labels[ix]) !== -1) {
                continue;
            }
            label_area.add({
                xtype: 'label',
                margin: '5 0 0 0',
                width: '100%',
                html: common.Util.usedFont(9, common.Util.TR(labels[ix]) + ' :'),
                style: { 'text-align': 'right' }
            });
            valuefield = Ext.create('Ext.form.Label',{
                margin: '5 0 0 10',
                width: '100%',
                html: '',
                style: {
                    '-webkit-user-select': 'text',
                    '-moz-user-select': 'text',
                    '-ms-user-select': 'text',
                    'user-select': 'text'
                }
            });
            this.txninfo_field_arr.push(valuefield);
            value_area.add(valuefield);
        }

        try {
            this.refresh_click();
        } finally {
            ix = null;
            tab = null;
            valuefield = null;
            label_area = null;
            value_area = null;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    refresh_click: function() {

        this.checkTxnInfoCount = 0;

        this.TxnInfo();
        this.SQLList();

        if (!this.CallTreeLoadingMask) {
            this.CallTreeLoadingMask = Ext.create('Exem.LoadingMask', {
                target: Ext.getCmp('txndetail_calltree' + this.id)
            });
        }
        this.CallTreeLoadingMask.show(null, true);

        if (Ext.isDefined(this.record.tid)) {
            setTimeout(function() {
                this.CallTree(this.record.tid);
                this.refreshCallTree();
            }.bind(this), 500);
        }
    },

    stopRefreshCallTree: function() {
        if (this.timerIncChart) {
            clearTimeout(this.timerIncChart);
            this.timerIncChart = null;
        }
    },

    refreshCallTree: function() {
        this.stopRefreshCallTree();

        var diff = 0;

        if (this.isClosed) {
            return;
        }

        if (!this.isEndCallTreeProc) {
            this.timerIncChart = setTimeout(this.refreshCallTree.bind(this), 1000);

        } else if (!this.isCallTreeData) {
            if (!this.firstTime) {
                this.firstTime = new Date();
            } else {
                diff = Ext.Date.diff(this.firstTime, new Date(), Ext.Date.SECOND);
            }

            if (diff > 10) {
                this.firstTime = null;
                if (this.CallTreeLoadingMask) {
                    this.CallTreeLoadingMask.hide();
                }

                if (this.monitorType !== 'TP' && this.monitorType !== 'TUX' && this.isContainEmptyData) {
                    this.showEmptyDataMessage();
                }

            } else {
                this.isEndCallTreeProc = false;
                this.CallTree(this.record.tid);
                this.timerIncChart = setTimeout(this.refreshCallTree.bind(this), 1000);
            }
        } else if (this.monitorType !== 'TP' && this.monitorType !== 'TUX' && this.isContainEmptyData) {
            this.showEmptyDataMessage();
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    hideTxnLoadingMask: function() {
        if (!this.isExecThreadDump) {
            this.loadingMask.hide();
        }
    },

    TxnInfo: function() {
        if (!Ext.isDefined(this.tid) && !Ext.isDefined(this.wasid)) {
            this.hideTxnLoadingMask();
            return;
        }

        console.debug('%c [Transaction Detail] Transaction Info - TID', 'color:#3191C8;', this.tid);

        WS.SQLExec({
            sql_file: 'IMXRT_TxnDetail_TxnInfo.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: this.tid
            }, {
                name: 'wasid',
                type: SQLBindType.INTEGER,
                value: this.wasid
            }, {
                name: 'fromtime',
                type: SQLBindType.STRING,
                value: common.Util.getDate(+new Date(this.record.starttime))
            }, {
                name: 'totime',
                type: SQLBindType.STRING,
                value: common.Util.getDate(+new Date(this.record.time))
            }]
        }, function(aheader, adata) {
            if (this.isWinClosed === true) {
                return;
            }

            var isValidate = common.Util.checkSQLExecValid(aheader, adata);

            if (!isValidate) {
                this.hideTxnLoadingMask();

                if (aheader != null && aheader.error_message != null) {
                    console.debug('%c [Transaction Detail] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                }
                return;
            }

            if (adata.rows.length === 0) {
                if (this.checkTxnInfoCount < 10) {
                    this.loadingMask.show(null, true);
                    this.checkTxnInfoCount++;
                    setTimeout(this.TxnInfo.bind(this), 1000);
                    return;
                }
                this.checkTxnInfoCount = 0;
                this.hideTxnLoadingMask();
                return;
            }

            this.record.wasname       = adata.rows[0][18];
            this.record.tid           = adata.rows[0][19];
            this.record.txnname       = adata.rows[0][21];
            this.record.starttime     = adata.rows[0][22];
            this.record.elapsedtime   = adata.rows[0][23];
            this.record.clientip      = adata.rows[0][24];
            this.record.instancename  = adata.rows[0][25];
            this.record.sid           = adata.rows[0][26];
            this.record.sqlexeccount  = adata.rows[0][27];
            this.record.fetchcount    = adata.rows[0][28];
            this.record.preparecount  = adata.rows[0][29];
            this.record.logicalreads  = adata.rows[0][30];
            this.record.physicalreads = adata.rows[0][31];
            this.record.waitinfo      = adata.rows[0][32];

            this.txninfo_field_arr[ 0].update(common.Util.usedFont(9, this.record.wasname) + ' ');
            this.txninfo_field_arr[ 1].update(common.Util.usedFont(9, this.record.tid) + ' ');
            this.txninfo_field_arr[ 2].update(common.Util.usedFont(9, this.record.txnname) + ' ');
            this.txninfo_field_arr[ 3].update(common.Util.usedFont(9, common.Util.getDate(this.record.starttime)) + ' ');
            this.txninfo_field_arr[ 4].update(common.Util.usedFont(9, this.record.elapsedtime) + ' ');
            this.txninfo_field_arr[ 5].update(common.Util.usedFont(9, this.record.clientip) + ' ');
            this.txninfo_field_arr[ 6].update(common.Util.usedFont(9, this.record.instancename) + '&nbsp');
            this.txninfo_field_arr[ 7].update(common.Util.usedFont(9, this.record.sid.toString()) + ' ');
            this.txninfo_field_arr[ 8].update(common.Util.usedFont(9, this.record.sqlexeccount) + ' ');
            this.txninfo_field_arr[ 9].update(common.Util.usedFont(9, this.record.fetchcount.toString()) + ' ');
            this.txninfo_field_arr[10].update(common.Util.usedFont(9, this.record.preparecount) + ' ');

            if (!window.isIMXNonDB) {
                this.txninfo_field_arr[11].update(common.Util.usedFont(9, this.record.logicalreads) + ' ');
                this.txninfo_field_arr[12].update(common.Util.usedFont(9, this.record.physicalreads) + ' ');
                this.txninfo_field_arr[13].update(common.Util.usedFont(9, this.record.waitinfo) + ' ');
            }

            this.hideTxnLoadingMask();
        }.bind(this), this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ActiveTxn: function() {
        if (!Ext.isDefined(this.record.tid) && !Ext.isDefined(this.record.wasid)) {
            return;
        }
        var self = this;
        var limitString;

        if (common.Menu.useActiveTxnTableLimit) {
            if (Comm.currentRepositoryInfo.database_type == 'PostgreSQL') {
                limitString = 'limit 500';
            } else if ( Comm.currentRepositoryInfo.database_type == 'MSSQL' ) {
                limitString = 'top 500';
            } else {
                limitString = 'WHERE ROWNUM <= 500' ;
            }
        } else {
            limitString = '';
        }

        WS.SQLExec({
            sql_file: 'IMXRT_TxnDetail_ActiveTxn.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: this.record.tid
            }, {
                name: 'wasid',
                type: SQLBindType.INTEGER,
                value: this.record.wasid
            }, {
                name: 'fromtime',
                type: SQLBindType.STRING,
                value: common.Util.getDate(+new Date(this.record.starttime))
            }, {
                name: 'totime',
                type: SQLBindType.STRING,
                value: common.Util.getDate(+new Date(this.record.time))
            }],
            replace_string: [{
                name    : 'limit',
                value   : limitString
            }]
        }, function(aheader, adata) {
            if (!adata || !adata.rows || adata.rows.length === 0) {
                return;
            }

            if (this.isWinClosed === true) {
                return;
            }

            var temp;
            var bind;
            var browser, loginname, methodtype, state,
                ix, ixLen, jx, jxLen;

            self.gridActiveTxn.clearRows();
            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                if (adata.rows[ix][43] !== '') {
                    bind = '';
                    temp = common.Util.convertBindList(adata.rows[ix][43]);
                    for (jx = 0, jxLen = temp.length; jx < jxLen; jx++) {
                        if (jx > 0) {
                            bind += ',';
                        }
                        bind += temp[jx].value;
                    }

                }
                browser = '';
                loginname = '';
                if (adata.rows[ix][40] !== '') {
                    browser   = adata.rows[ix][40].split(' ')[1] || '';
                    loginname = adata.rows[ix][40].split(' ')[0] || '';
                }

                methodtype = common.Util.codeBitToMethodType(adata.rows[ix][29]);
                state      = common.DataModule.threadStateType[adata.rows[ix][14]];

                this.gridActiveTxn.addRow([
                    adata.rows[ix][ 0], // TIME1
                    adata.rows[ix][ 2], // WAS NAME
                    adata.rows[ix][ 5], // Transaction
                    adata.rows[ix][28], // Class Method
                    methodtype,         // Method Type
                    adata.rows[ix][ 6], // Client IP
                    loginname,          // Login Name
                    browser,            // Browser
                    adata.rows[ix][ 9], // Elapse Time
                    adata.rows[ix][ 7], // Start Time
                    adata.rows[ix][34], // DB Time
                    adata.rows[ix][31], // CPU Time
                    adata.rows[ix][33], // Wait Time
                    adata.rows[ix][11], // Pool Name
                    adata.rows[ix][12], // Instance Name
                    adata.rows[ix][13], // SID
                    state,              // State
                    bind,               // Bind List
                    adata.rows[ix][43], // Bind List (Hidden Value)
                    adata.rows[ix][15], // SQL1 id
                    adata.rows[ix][16], // SQL1
                    adata.rows[ix][17], // SQL2 id
                    adata.rows[ix][18], // SQL2
                    adata.rows[ix][19], // SQL3 id
                    adata.rows[ix][20], // SQL3
                    adata.rows[ix][21], // SQL4 id
                    adata.rows[ix][22], // SQL4
                    adata.rows[ix][23], // SQL5 id
                    adata.rows[ix][24], // SQL5
                    adata.rows[ix][25], // SQL Execute Count
                    adata.rows[ix][26], // Fetch Count
                    adata.rows[ix][27], // Prepare Count
                    adata.rows[ix][35], // Mem Usage
                    adata.rows[ix][36], // Logical Reads
                    adata.rows[ix][37], // Physical Reads
                    adata.rows[ix][32], // Transaction CPU Time
                    adata.rows[ix][39], // Thread Time
                    adata.rows[ix][44], // Thread Memory Usage
                    adata.rows[ix][38], // Wait Info
                    adata.rows[ix][ 8], // Elapse Time (avg)
                    adata.rows[ix][41], // IO Read
                    adata.rows[ix][42]  // IO Write
                ]);
            }
            self.gridActiveTxn.drawGrid();
        }, this);
    },


    /**
     * 종료된 트랜잭션인지 체크
     */
    checkCloseTxn: function(callback) {
        var self = this;

        WS.SQLExec({
            sql_file: 'IMXRT_ActiveTxn_Close.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: this.record.tid
            }, {
                name: 'wasid',
                type: SQLBindType.INTEGER,
                value: this.record.wasid
            }, {
                name: 'fromtime',
                type: SQLBindType.STRING,
                value: common.Util.getDate(+new Date(this.record.starttime))
            }, {
                name: 'totime',
                type: SQLBindType.STRING,
                value: common.Util.getDate(+new Date(this.record.time))
            }]
        }, function(aheader, adata) {
            if (adata.rows && adata.rows.length > 0) {
                self.isCheckCloseTxn = true;

                Ext.MessageBox.show({
                    title    : common.Util.TR(''),
                    msg      : common.Util.TR('Closed Transaction.'),
                    icon     : Ext.MessageBox.INFO,
                    buttons  : Ext.MessageBox.OK,
                    multiline: false
                });
            } else {
                if (callback) {
                    callback();
                }
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    SQLList: function() {
        if (!Ext.isDefined(this.record.tid) && !Ext.isDefined(this.record.wasid)) {
            return;
        }
        WS.SQLExec({
            sql_file: 'IMXRT_TxnDetail_SQLList.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: this.record.tid
            }, {
                name: 'wasid',
                type: SQLBindType.INTEGER,
                value: this.record.wasid
            }, {
                name: 'starttime',
                type: SQLBindType.STRING,
                value: common.Util.getDate(this.record.starttime)
            }]
        }, function(aheader, adata) {
            if (this.isWinClosed === true) {
                return;
            }

            this.gridSQLList.clearRows();
            this.gridSQLList.showEmptyText();

            var ix, ixLen;
            if (adata.rows) {
                for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                    if (!Ext.isEmpty(adata.rows[ix][1])) {
                        this.gridSQLList.addRow([adata.rows[ix][1], adata.rows[ix][0], adata.rows[ix][10]]);
                    }
                    if (!Ext.isEmpty(adata.rows[ix][3])) {
                        this.gridSQLList.addRow([adata.rows[ix][3], adata.rows[ix][2], adata.rows[ix][11]]);
                    }
                    if (!Ext.isEmpty(adata.rows[ix][5])) {
                        this.gridSQLList.addRow([adata.rows[ix][5], adata.rows[ix][4], adata.rows[ix][12]]);
                    }
                    if (!Ext.isEmpty(adata.rows[ix][7])) {
                        this.gridSQLList.addRow([adata.rows[ix][7], adata.rows[ix][6], adata.rows[ix][13]]);
                    }
                    if (!Ext.isEmpty(adata.rows[ix][9])) {
                        this.gridSQLList.addRow([adata.rows[ix][9], adata.rows[ix][8], adata.rows[ix][14]]);
                    }
                }
                this.gridSQLList.drawGrid();
            }

        }, this);
    },


    /**
     * 트랜잭션 상세 콜트리 그리기
     *
     * @param {string} tid - 트랜잭션 ID
     */
    CallTree: function(tid) {
        console.debug('%c [Transaction Detail] Exec Proc - TID', 'color:#3191C8;', tid);

        var self = this;

        this.isContainEmptyData = false;

        if (this.isWinClosed === true) {
            if (this.CallTreeLoadingMask) {
                this.CallTreeLoadingMask.hide();
            }
            return;
        }

        if (!this.CallTreeLoadingMask) {
            this.CallTreeLoadingMask = Ext.create('Exem.LoadingMask', {
                target: Ext.getCmp('txndetail_calltree' + this.id)
            });
        }
        this.CallTreeLoadingMask.show(null, true);

        WS.StoredProcExec({
            stored_proc: 'rt_txn_detail',
            bind: [{
                name : 'tid',
                value: tid
            }]
        }, function(aheader, adata) {
            if (this.isWinClosed === true) {
                return;
            }
            self.isEndCallTreeProc = true;
            self.treeCallTree.showEmptyText();

            if (self.isRatioZeroCheck) {
                self.isRatioZeroCheck = false;
                self.CallTreeLoadingMask.hide();
            }

            if (!aheader || !adata || !adata.rows) {
                return;
            }

            if (adata.rows.length === 0) {
                self.isDisplayData = true;
                return;
            }

            self.isCallTreeData = true;

            if (self.CallTreeLoadingMask) {
                self.CallTreeLoadingMask.hide();
            }

            var calling_method_id, calling_crc, parent_node,
                ix, ixLen;

            if (aheader.rows_affected > 0) {
                self.treeCallTree.clearNodes();
                self.treeCallTree.beginTreeUpdate();

                for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {

                    if (this.ratioZeroCheck && (adata.rows[ix][11] <= 0 || !adata.rows[ix][12] || adata.rows[ix][12] <= 0)) {
                        continue;
                    }

                    if (!adata.rows[ix][7] && +adata.rows[ix][8] === 0 ) {
                        this._add_call_tree(null, adata.rows[ix] );

                    } else {
                        calling_method_id = adata.rows[ix][7];
                        calling_crc       = adata.rows[ix][8];

                        parent_node = self.treeCallTree.MultifindNode('method_id', 'crc', calling_method_id, calling_crc);

                        if (parent_node) {
                            this._add_call_tree(parent_node, adata.rows[ix]);
                        }
                    }
                }

                self.treeCallTree.endTreeUpdate();
                self.treeCallTree.drawTree();

                calling_method_id = null;
                calling_crc       = null;
                parent_node       = null;
            }
        }, this);
    },

    _add_call_tree: function( parent, _data ) {

        this.treeCallTree.addNode(parent, [
            _data[ 0]       //lvl
            ,_data[ 1]       //was_id
            ,_data[ 2]       //was_name
            ,_data[ 3]       //method_id
            ,_data[ 4]       //crc
            ,_data[ 5]       //class_name
            ,_data[ 6]       //method_name
            ,_data[ 7]       //calling_method_id
            ,_data[ 8]       //calling_crc
            ,_data[ 9]       //err_count
            ,_data[10]       //exec_count
            ,_data[11]       //elase_time
            ,_data[12]       //elapse_ratio
            ,common.Util.codeBitToMethodType(_data[13])  //method_type
            ,_data[14]       //seq
            ,_data[15]       //level_id
            ,_data[16]       //host_name
        ]);

        this.checkEmptyClassData(_data[5]);
    },


    /**
     * Check Empty Class Name
     *
     * @param {string | object} className
     */
    checkEmptyClassData: function(className) {
        if (!this.isContainEmptyData && (!className || className.trim().length <= 0)) {
            this.isContainEmptyData = true;
        }
    },


    /**
     * Show Empty Class Info Message
     */
    showEmptyDataMessage: function() {
        Ext.MessageBox.show({
            title    : common.Util.TR(''),
            msg      : common.Util.TR('It contains the data of the empty class in the call tree list. Do you want to reload the data?'),
            icon     : Ext.MessageBox.QUESTION,
            buttons  : Ext.MessageBox.YESNO,
            multiline: false,
            fn       : function(btnId) {
                if (btnId === 'yes') {
                    this.CallTree(this.tid);
                    this.refreshCallTree();
                }
            },
            scope   : this
        });
    },


    /**
     * 수행시간 비율이 0% 인 데이터 표시/비표시 전환
     */
    excludeZeroRatio: function() {
        this.ratioZeroCheck = !this.ratioZeroCheck;
        this.isRatioZeroCheck = true;
        this.CallTree(this.tid);
    },


    /**
     * Display Thread dump data on the view.
     */
    setThreadDumpValue: function() {
        Ext.getCmp('txndetail_tabpanel' + this.id).setActiveTab(2);

        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                this.stackDumpEditor.editTheme = 'ace/theme/dark_imx';
                break;
            case 'White' :
                this.stackDumpEditor.editTheme = 'ace/theme/eclipse';
                break;
            default :
                this.stackDumpEditor.editTheme = 'ace/theme/dark_imx';
                break;
        }

        var stackdump = Ext.getCmp('txndetail_stackdump' + this.id);
        stackdump.add(this.stackDumpEditor);

        if (!realtime.syntaxEditorList) {
            realtime.syntaxEditorList = [];
        }
        var isContain = Ext.Array.contains(realtime.syntaxEditorList, this.stackDumpEditor.id);
        if (!isContain) {
            realtime.syntaxEditorList[realtime.syntaxEditorList.length] = this.stackDumpEditor.id;
        }

        this.loadingMask.hide();
        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: stackdump,
            type: 'small-circleloading'
        });
        this.loadingMask.show(true);

        this.checkThreadDumpCount = 0;

        this.getThreadDumpInfo();
    },


    /**
     * Get Thread Dump Data.
     */
    getThreadDumpInfo: function() {
        console.debug('Thread Dump Data Check Count:', this.checkThreadDumpCount + 1);

        var ds = {};
        ds.bind = [{
            name: 'was_id',
            type: SQLBindType.INTEGER,
            value: this.wasid
        }, {
            name: 'from_time',
            type: SQLBindType.STRING,
            value: common.Util.getDate(this.current_time)
        }];
        ds.sql_file = 'IMXRT_ThreadDump_Result.sql';

        WS.SQLExec(ds, function(aheader, adata) {
            if (adata && adata.rows) {

                if (adata.rows.length <= 0) {
                    if ( this.checkThreadDumpCount < 5) {
                        this.checkThreadDumpCount++;
                        this.checkThreadDumpTimerId = setTimeout(this.getThreadDumpInfo.bind(this), 2000);

                    } else {
                        this.stackDumpEditor.setText(common.Util.TR('There are no results to display.'));
                        console.debug('Thread Dump Data - No Data.');
                        this.loadingMask.hide();
                    }
                } else {
                    this.stackDumpEditor.setText(adata.rows[adata.rows.length - 1][4] + '\n\n');
                    this.loadingMask.hide();
                }
            }
        }, this);
    },

    sendInfo: function() {
        // DLL을 통해 게더로 WASID, TID 정보를 보낸다.
        // 파라미터에서 사용되는 쿼리가 xapm_long_class_method_temp 테이블을 참조하는데
        // 이 호출을 통해서 해당 테이블에 데이터가 들어가게 된다.

        var obj = {};
        obj.dll_name = 'IntermaxPlugin.dll';
        obj.options  = {
            was_id: this.wasid,
            tid: this.tid
        };
        obj['function'] = 'get_longClassMethod';

        WS.PluginFunction(obj, function(aheader, adata) {
            console.debug('%c [Transaction Detail] get_longClassMethod Result:', 'color:#3191C8;', adata.result);
        }, this);
    }
});