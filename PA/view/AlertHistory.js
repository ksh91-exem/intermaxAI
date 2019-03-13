Ext.define('view.AlertHistory', {
    extend: 'Exem.FormOnCondition',
    width : '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style : {
        background: '#cccccc'
    },
    sql   : {
        chart_M    : 'IMXPA_AlertHistory_Chart_M.sql' ,
        chart_H    : 'IMXPA_AlertHistory_Chart_H.sql' ,
        grid       : 'IMXPA_AlertHistory_Grid.sql',
        alert_name : 'IMXPA_AlertHistory_AlertName.sql',

        chart_click    : 'IMXPA_AlertHistory_Click.sql',

        AI_chart_M    : 'IMXPA_AlertHistory_AI_Chart_M.sql' ,
        AI_chart_H    : 'IMXPA_AlertHistory_AI_Chart_H.sql' ,
        AI_grid       : 'IMXPA_AlertHistory_AI_Grid.sql',
        AI_alert_name : 'IMXPA_AlertHistory_AI_AlertName.sql',

        AI_chart_click    : 'IMXPA_AlertHistory_AI_Chart_Click.sql'
    },
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    init: function() {
        this.isClickRetrieve = false;
        this.isInitLayout = false;

        this.AIModuleTypeCheck = [3,6,7];

        if (!this.isCallRTM) {
            this.from_time = null;
            this.to_time = null;
            this.was_id = null;
            this.server_type = null;
            this.moduleType = null;
        }

        this.createConditionLayout();
        this.setWorkAreaLayout('border');
        this.createWorkLayout();
        this.setRadioBtn();
    },

    createConditionLayout: function() {
        var flag = {},
            mergeInfoObj = {},
            key, serverType;

        this.cbxWasDBHost = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 260,
            comboLabelWidth : 60,
            comboWidth      : 220,
            fieldLabel      : common.Util.TR('Agent'),
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            x               : 310,
            y               : 5,
            linkMonitorType : this.monitorType
        });

        this.rdoServerTypeField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            labelWidth  : 40,
            x           : 580,
            y           : 5
        });

        this.colVisibleObj = {
            was_name      : false,
            tp_name       : false,
            tux_name      : false,
            ws_name       : false,
            cd_name       : false,
            business_name : false,
            ai_txn_name   : false
        };

        if (this.monitorType === 'WEB') {
            this.colVisibleObj.ws_name = true;

            this.rdoServerTypeField.add([
                this.addRadioBtn('servergroup', 'ws_type', 'WebServer', 90, false, '3', 'server', true)
            ]);
        } else if (this.monitorType === 'CD') {
            this.colVisibleObj.cd_name = true;

            this.rdoServerTypeField.add([
                this.addRadioBtn('servergroup', 'cd_type', 'C_Daemon', 90, false, '15', 'server', true)
            ]);
        } else if (this.monitorType === 'TP') {
            this.colVisibleObj.was_name = true;

            this.rdoServerTypeField.add([
                this.addRadioBtn('servergroup', 'tp_type', 'TP', 90, false, '1', 'server', true)
            ]);
        } else if (this.monitorType === 'TUX') {
            this.colVisibleObj.was_name = true;

            this.rdoServerTypeField.add([
                this.addRadioBtn('servergroup', 'tux_type', 'Tuxedo', 90, false, '1', 'server', true)
            ]);
        } else if (this.monitorType === 'WAS') {
            this.colVisibleObj.was_name = true;

            this.rdoServerTypeField.add([
                this.addRadioBtn('servergroup', 'agent_type', 'Agent', 90, false, '1', 'server'),
                this.addRadioBtn('servergroup', 'db_type',    'DB',    90, false, '2', 'server'),
                this.addRadioBtn('servergroup', 'host_type',  'Host',  90, false, '9', 'server')
            ]);

            if (!common.Menu.categoriesConf['RealtimeAI']) {

                this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'ai_type',  'AI',  60, false, '30', 'server'));
                this.cbxAIModuleType = Ext.create('Exem.ComboBox', {
                    x           : 315,
                    y           : 5,
                    fieldLabel  : common.Util.TR('Service'),
                    labelWidth  : 60,
                    width       : 220,
                    store       : Ext.create('Exem.Store'),
                    editable    : false,
                    useSelectFirstRow : false,
                    itemId      : 'cbo_ai_module',
                    listeners   : {
                        change : function(me) {
                            var selectRadioType, selectType;

                            if (this.isInitLayout) {
                                if (+me.getValue() === 1 || +me.getValue() === 4) {
                                    selectRadioType = 'WAS';
                                    selectType = common.Util.TR('Agent');
                                } else if (+me.getValue() === 2 || +me.getValue() === 5) {
                                    selectType = 'DB';
                                }

                                if (this.AIModuleTypeCheck.indexOf(+me.getValue()) === -1) {
                                    this.cbxWasDBHost.setDisabled(false);
                                    this.cbxWasDBHost.WASDBCombobox.setFieldLabel(selectType);
                                    this.cbxWasDBHost.selectType = selectType;
                                    this.cbxWasDBHost.selectRadioType = selectRadioType;
                                    this.cbxWasDBHost._getServiceInfo();
                                } else {
                                    this.cbxWasDBHost.setDisabled(true);
                                }

                                this.radioChange = true;
                                this.setAlertName(this.rdoServerTypeField.getCheckedValue());
                            }
                        }.bind(this)
                    }
                });

                this.cbxAIModuleType.addItem('1', common.Util.TR('Load Prediction WAS'), 1);
                this.cbxAIModuleType.addItem('2', common.Util.TR('Load Prediction DB'), 2);
                this.cbxAIModuleType.addItem('3', common.Util.TR('Load Prediction Transaction'), 3);
                this.cbxAIModuleType.addItem('7', common.Util.TR('Load Prediction Business'), 7);
                this.cbxAIModuleType.addItem('4', common.Util.TR('Abnormal Detection WAS'), 4);
                this.cbxAIModuleType.addItem('5', common.Util.TR('Abnormal Detection DB'), 5);
                this.cbxAIModuleType.addItem('6', common.Util.TR('Abnormal Detection Transaction'), 6);
                this.cbxAIModuleType.selectRow(0);

                this.cbxAIModuleType.hide();

                this.conditionArea.add(this.cbxAIModuleType);
            }

        } else if (this.monitorType === 'E2E') {
            this.colVisibleObj.was_name = true;

            flag.was = false;
            flag.tp  = false;
            flag.tux = false;
            flag.cd  = false;
            flag.web = false;

            Ext.Object.merge(mergeInfoObj, Comm.wasInfoObj, Comm.oldServerInfo);

            for (key in mergeInfoObj) {
                if (mergeInfoObj.hasOwnProperty(key)) {
                    serverType = mergeInfoObj[key].type;

                    switch (serverType) {
                        case 'WAS':
                            if (!flag.was) {
                                this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'was_type', 'Agent',     90, false, '1', 'server'));
                                flag.was = true;
                            }
                            break;
                        case 'TP':
                            if (!flag.tp) {
                                this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'tp_type',  'TP',        90, false, '1', 'server'));
                                flag.tp = true;
                            }
                            break;
                        case 'TUX':
                            if (!flag.tux) {
                                this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'tux_type',  'Tuxedo',   90, false, '1', 'server'));
                                flag.tux = true;
                            }
                            break;
                        case 'CD':
                            if (!flag.cd) {
                                this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'cd_type',  'C_Daemon',  90, false, '15', 'server'));
                                flag.cd = true;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }

            for (key in Comm.webServersInfo) {
                if (Comm.webServersInfo.hasOwnProperty(key)) {
                    if (!flag.web) {
                        this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'ws_type',  'WebServer', 90, false, '3', 'server'));
                        flag.web = true;
                    }
                }
            }

            if (Comm.activateDB.length) {
                this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'db_type',    'DB',     90, false, '2', 'server'));
            }

            if (Comm.hosts.length) {
                this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'host_type',  'Host',   90, false, '9', 'server'));
            }

            if (Comm.businessRegisterInfo.length) {
                this.rdoServerTypeField.add(this.addRadioBtn('servergroup', 'business_type', 'Business', 90, false, '20', 'server'));
            }
        }


        this.rdoTimeTypeField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            labelWidth  : 40,
            x           : 850,
            y           : 30
        });

        this.rdoTimeTypeField.add([
            this.addRadioBtn('timegroup', 'min_type',  'Minutes', 90, true,  'min',  'time'),
            this.addRadioBtn('timegroup', 'hour_type', 'Hour',    90, false, 'hour', 'time')
        ]);

        this.cbxAlertName = Ext.create('Exem.AjaxComboBox', {
            fieldLabel  : common.Util.TR('Alert Name'),
            labelWidth  : 90,
            width       : 287,
            x           : 0,
            y           : 30,
            data        : [],
            itemId      : 'cbo_alert_name',
            useSelectFirstRow : false,
            enableKeyEvents: true,
            listeners: {
                select: function(cbx) {
                    var idx = cbx.store.findRecord('name', cbx.getValue(), 0, false, false, true );
                    cbx.store.indexOf(idx);
                },
                keydown: function(cbx, e) {
                    var idx;
                    if (e.keyCode === 13) {
                        idx = cbx.store.findRecord('name', cbx.getValue(), 0, false, false, true );
                        cbx.store.indexOf(idx);
                    }
                }
            }
        });

        this.cbxStatus = Ext.create('Exem.ComboBox', {
            fieldLabel  : common.Util.TR('Status'),
            width       : 220,
            labelWidth  : 60,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            useSelectFirstRow : false,
            x           : 315,
            y           : 30,
            itemId      : 'cbo_status'
        });

        this.cbxStatus.addItem('1', 'Warning', 1);
        this.cbxStatus.addItem('2', 'Critical', 2);
        this.cbxStatus.insertAll();
        this.cbxStatus.selectRow(0);

        this.descriptionField = Ext.create('Exem.TextField', {
            itemId: 'descriptionField',
            fieldLabel: common.Util.CTR('Description'),
            labelWidth: 60,
            x: 540,
            y: 30,
            width: 280,
            value: '%',
            maxLength: 300
        });

        this.conditionArea.add([this.cbxWasDBHost, this.rdoServerTypeField,
            this.cbxAlertName, this.cbxStatus, this.descriptionField, this.rdoTimeTypeField]);
    },

    createWorkLayout: function() {
        var pnlChart, pnlGrid,
            pnlAlertDetailGrid, pnlAlertSummaryGrid, wasNameText;

        pnlChart = Ext.create('Exem.Panel', {
            region   : 'north',
            layout   : 'fit',
            height   : '50%',
            split    : true ,
            minHeight: 200,
            style    : 'borderRadius : 6px;'
        });

        pnlGrid = Ext.create('Exem.Panel', {
            region: 'center',
            layout: 'border',
            minHeight: 200,
            bodyStyle:{
                background  : '#E9E9E9'
            }
        });

        pnlAlertDetailGrid = Ext.create('Exem.Panel', {
            region : 'west',
            layout : 'fit' ,
            height : '100%',
            width  : '70%' ,
            split  : true  ,
            minWidth: 400
        });


        pnlAlertSummaryGrid = Ext.create('Exem.Panel', {
            region : 'center',
            layout : 'fit' ,
            height : '100%',
            width  : '30%' ,
            minWidth: 400
        });

        this.alertChart = Ext.create('Exem.chart.CanvasChartLayer', {
            width          : '100%',
            height         : '100%',
            interval       : PlotChart.time.exMin,
            titleHeight    : 17,
            showLegend     : true,
            legendWidth    : 70,
            legendAlign    : 'north',
            legendHeight   : 44,
            legendOrder    : PlotChart.legendOrder.exDesc,
            showTitle      : true,
            showIndicator  : false,
            indicatorLegendFormat: '%x%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip    : true,
            toolTipFormat  : '%s %x[value:%y] ',
            toolTipTimeFormat: '%H:%M',
            showContextMenu: true,
            mouseSelect    : false,
            showMaxValue   : true ,
            chartProperty  :{
                colors : [ '#f6c151', '#e95e5e' ]
            },
            plotclick: function(event, pos, item) {
                if (item) {
                    this.retrieveAlertGridData(item, 'chart_click');
                }
            }.bind(this)
        });

        this.alertChart.addSeries({
            id: 'w_alert',
            label: common.Util.TR('Warning'),
            type: PlotChart.type.exBar,
            stack: true
        });

        this.alertChart.addSeries({
            id: 'c_alert',
            label: common.Util.TR('Critical'),
            type: PlotChart.type.exBar,
            stack: true
        });


        this.alertDetailGrid = Ext.create('Exem.BaseGrid', {
            useDrag: true,
            itemId: 'alert_detail_grid'
        });

        if (this.monitorType === 'TP') {
            wasNameText = common.Util.CTR('TP');
        } else {
            wasNameText = common.Util.CTR('WAS');
        }

        this.alertDetailGrid.addColumn(common.Util.CTR('Time'),          'time',          200, Grid.DateTime, true,  false);
        this.alertDetailGrid.addColumn('SERVER ID',                      'server_id',     100, Grid.Number,   false, true );
        this.alertDetailGrid.addColumn(wasNameText,                      'was_name',      150, Grid.String,   this.colVisibleObj['was_name'],       false);
        this.alertDetailGrid.addColumn(common.Util.CTR('DB'),            'db_name',       150, Grid.String,   false, false);
        this.alertDetailGrid.addColumn(common.Util.CTR('HOST'),          'host_name',     150, Grid.String,   false, false);
        this.alertDetailGrid.addColumn(common.Util.CTR('WebServer'),     'ws_name',       150, Grid.String,   this.colVisibleObj['ws_name'],        false);
        this.alertDetailGrid.addColumn(common.Util.CTR('C Daemon'),      'cd_name',       150, Grid.String,   this.colVisibleObj['cd_name'],        false);
        this.alertDetailGrid.addColumn(common.Util.CTR('Business Name'), 'business_name', 150, Grid.String,   this.colVisibleObj['business_name'],  false);
        this.alertDetailGrid.addColumn(common.Util.CTR('Transaction Name'), 'ai_txn_name', 150, Grid.String,   this.colVisibleObj['ai_txn_name'],  false);
        this.alertDetailGrid.addColumn(common.Util.CTR('Name'),          'name',          200, Grid.String,   true,  false);
        this.alertDetailGrid.addColumn(common.Util.CTR('Description'),   'description',   200, Grid.String,   true,  false);
        this.alertDetailGrid.addColumn(common.Util.CTR('Status'),        'status',        150, Grid.String,   true,  false);
        this.alertDetailGrid.addColumn(common.Util.CTR('Value'),         'value',         100, Grid.Number,   true,  false);
        this.alertDetailGrid.addColumn('TID',                            'tid',           100, Grid.Number,   false, true );
        this.alertDetailGrid.addColumn('START TIME',                     'start_time',    100, Grid.Number,   false, true );
        this.alertDetailGrid.addColumn('ALERT TYPE',                     'alert_type',    100, Grid.Number,   false, true );
        this.alertDetailGrid.addColumn('SERVER TYPE',                    'server_type',   100, Grid.Number,   false, true );

        this.alertDetailGrid.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),
            fn: function() {
                openTxnDetail(this.up().record);
            }
        }, 0);

        this.alertDetailGrid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record) {
            if (+record.data.tid && +record.data.tid !== -1 && this.monitorType !== 'WEB') {
                this.alertDetailGrid.contextMenu.setDisableItem(0, true);
            } else {
                this.alertDetailGrid.contextMenu.setDisableItem(0, false);
            }
        }.bind(this));

        function openTxnDetail(record) {
            var txnView = Ext.create('view.TransactionDetailView',{
                endTime: record.time,
                wasId: record.server_id,
                name: record.was_name,
                txnName: record.txn_name,
                tid: record.tid,
                startTime: record.start_time,
                elapseTime : record.value,
                gid: record.gid,
                socket: WS
            });

            var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTab.add(txnView);
            mainTab.setActiveTab(mainTab.items.length - 1);
            txnView.init();
        }


        this.alertSummaryGrid = Ext.create('Exem.BaseGrid', {
            itemId  : 'alert_summary_grid',
            usePager: false
        });

        this.alertSummaryGrid.addColumn(wasNameText,                      'was_name',      200, Grid.String,   this.colVisibleObj['was_name'], false);
        this.alertSummaryGrid.addColumn(common.Util.CTR('DB'),            'db_name',       200, Grid.String,   false, false);
        this.alertSummaryGrid.addColumn(common.Util.CTR('HOST'),          'host_name',     200, Grid.String,   false, false);
        this.alertSummaryGrid.addColumn(common.Util.CTR('WebServer'),     'ws_name',       200, Grid.String,   this.colVisibleObj['ws_name'],  false);
        this.alertSummaryGrid.addColumn(common.Util.CTR('C Daemon'),      'cd_name',       200, Grid.String,   this.colVisibleObj['cd_name'],  false);
        this.alertSummaryGrid.addColumn(common.Util.CTR('Business Name'), 'business_name', 200, Grid.String,   this.colVisibleObj['business_name'],  false);
        this.alertSummaryGrid.addColumn(common.Util.CTR('Transaction Name'), 'ai_txn_name', 200, Grid.String,   this.colVisibleObj['ai_txn_name'],  false);
        this.alertSummaryGrid.addColumn(common.Util.CTR('Warning') ,      'warning' ,      100, Grid.Number,   true,  false);
        this.alertSummaryGrid.addColumn(common.Util.CTR('Critical'),      'critical',      100, Grid.Number,   true,  false);

        if (this.monitorType === 'WAS') {
            if ( window.isIMXNonDB || !window.isConnectDB) {
                this.rdoServerTypeField.items.items[1].setVisible(false);
            }

            if (Comm.monitoringHosts.length < 1) {
                this.rdoServerTypeField.items.items[2].setVisible(false);
            }
        }

        pnlChart.add(this.alertChart);

        pnlAlertDetailGrid.add(this.alertDetailGrid);
        pnlAlertSummaryGrid.add(this.alertSummaryGrid);

        pnlGrid.add([pnlAlertDetailGrid, pnlAlertSummaryGrid]);
        this.workArea.add([pnlChart, pnlGrid]);

        this.isInitLayout = true;
    },

    setRadioBtn : function() {
        var serverTypeObj = {
                DB       : 'db_type'  ,
                Host     : 'host_type',
                CD       : 'cd_type'  ,
                WEB      : 'ws_type'  ,
                TP       : 'tp_type'  ,
                Business : 'business_type',
                AI       : 'ai_type'
            },
            ix,ixLen;

        ixLen = this.rdoServerTypeField.items.items.length;

        // if isCallRTM else Statement
        if (Comm.wasInfoObj[this.was_id] && Comm.wasInfoObj[this.was_id].type !== 'WAS' ) {
            for ( ix = 0; ix < ixLen; ix++ ) {
                if (this.rdoServerTypeField.items.items[ix].itemId === serverTypeObj[Comm.wasInfoObj[this.was_id].type]) {
                    this.rdoServerTypeField.items.items[ix].setValue(true);
                }
            }

        } else if (this.server_type && this.server_type === 'WebServer') {
            for ( ix = 0; ix < ixLen; ix++ ) {
                if (this.rdoServerTypeField.items.items[ix].itemId === serverTypeObj.WEB) {
                    this.rdoServerTypeField.items.items[ix].setValue(true);
                }
            }

        } else if (this.server_type && ( this.server_type === 'DB' || this.server_type === 'Host' || this.server_type === 'Business' || this.server_type === 'AI') ) {
            for ( ix = 0; ix < ixLen; ix++ ) {
                if (this.rdoServerTypeField.items.items[ix].itemId === serverTypeObj[this.server_type]) {
                    this.rdoServerTypeField.items.items[ix].setValue(true);
                }
            }

        } else {
            this.rdoServerTypeField.items.items[0].setValue(true);
        }

        if (this.server_type === 'AI') {
            this.cbxAIModuleType.selectByValue(this.moduleType);
        }
    },

    executeSQL: function() {
        if (this.isLoading) {
            return;
        }

        this.isClickRetrieve = true;

        if (this.isCallRTM) {
            this.cbxWasDBHost.WASDBCombobox.select(this.cbxWasDBHost.WASDBCombobox.getStore().findRecord('value', this.was_id, 0, false, false, true));
            this.cbxAlertName.select(this.cbxAlertName.getStore().findRecord('value', this.alert_name, 0, false, false, true));
            this.cbxStatus.selectRow(this.alert_level);

            this.server_type = this.rdoServerTypeField.getCheckedValue();
            this.time_group = this.rdoTimeTypeField.getCheckedValue();

            this.retrieveAlertData();
        } else {
            this.server_type = this.rdoServerTypeField.getCheckedValue();
            this.alert_name = this.cbxAlertName.getValue() || null;
            this.time_group = this.rdoTimeTypeField.getCheckedValue();
            this.was_id = this.cbxWasDBHost.getValue();

            this.setAlertName(this.rdoServerTypeField.getCheckedValue());
        }

        this.isCallRTM = false;
    },

    setAlertName: function(serverType) {
        var target = '',
            fromTime, toTime, was_id, ix, ixLen;

        // RTM 화면에서 알람 정보를 선택해서 온 경우에 시간값을 설정하지 않는다.
        if (this.isCallRTM) {
            fromTime = this.from_time;
            toTime   = this.to_time;
            was_id   = this.was_id;
        } else {
            fromTime = common.Util.getDate(this.datePicker.getFromDateTime());
            toTime   = common.Util.getDate(this.datePicker.getToDateTime());
            was_id   = this.cbxWasDBHost.getValue();
        }

        if (+serverType === 30) {
            if (was_id) {
                target = 'AND target in (';
                for (ix = 0, ixLen = was_id.split(',').length; ix < ixLen; ix++) {
                    if (ix === ixLen - 1) {
                        target += '\'' + was_id.split(',')[ix] + '\')';
                    } else {
                        target += '\'' + was_id.split(',')[ix] + '\',';
                    }
                }
            }

            WS.SQLExec({
                sql_file: this.sql.AI_alert_name,
                bind: [{
                    name : 'fromtime', value: fromTime, type : SQLBindType.STRING
                },{
                    name : 'totime', value: toTime, type : SQLBindType.STRING
                }, {
                    name : 'moduleType', value: this.cbxAIModuleType.getValue(), type : SQLBindType.INTEGER
                }],
                replace_string: [{
                    name : 'target', value: target
                }]
            }, this.onAlertNameData, this);
        } else {
            WS.SQLExec({
                sql_file: this.sql.alert_name,
                bind: [{
                    name : 'fromtime', value: fromTime, type : SQLBindType.STRING
                },{
                    name : 'totime', value: toTime, type : SQLBindType.STRING
                },{
                    name : 'server_type', value: serverType, type : SQLBindType.INTEGER
                }],
                replace_string: [{
                    name : 'server_id', value: was_id
                }]
            }, this.onAlertNameData, this);
        }

    },

    onAlertNameData: function(header, data) {

        var comboStore = [],
            ix, ixLen, name;

        if (this.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.warn('AlertHistory-onAlertNameData');
            console.warn(header);
            console.warn(data);
            return;
        }

        this.cbxAlertName.removeAll();

        if (data.rows.length) {
            comboStore.push({ name: '(All)', value: '(All)' });
            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                name = data.rows[ix][0];
                comboStore.push({name: name, value: name});
            }

            this.cbxAlertName.setData(comboStore);
            this.cbxAlertName.setSearchField('name');
            this.cbxAlertName.selectByIndex(0);

            if (!this.isCallRTM && !this.alert_name) {
                this.alert_name = this.cbxAlertName.getValue() || null;
            }


            if (this.alert_name !== '(All)') {
                this.cbxAlertName.select(this.cbxAlertName.getStore().findRecord('value', this.alert_name, 0, false, false, true));
            }
        }



        if (this.radioChange) {
            this.cbxAlertName.selectByIndex(0);
            this.radioChange = false;
        }

        if (this.isClickRetrieve) {
            this.retrieveAlertData();
        }
    },

    retrieveAlertData: function() {
        var target = '',
            alertSQLTxt, statSQLTxt, descriptionTxt, ix, ixLen, moduleType;

        switch (+this.server_type) {
            // WAS
            case 1:
                this.setAlertGridColumn('was_name');
                break;
            // DB
            case 2:
                this.setAlertGridColumn('db_name');
                break;
            // HOST
            case 9:
                this.setAlertGridColumn('host_name');
                break;
            // WebServer
            case 3:
                this.setAlertGridColumn('ws_name');
                break;
            // C_Daemon
            case 15:
                this.setAlertGridColumn('cd_name');
                break;
            // 업무
            case 20:
                this.setAlertGridColumn('business_name');
                break;
            // AI
            case 30:
                moduleType = +this.cbxAIModuleType.getValue();
                if (moduleType === 1 || moduleType === 4) {
                    this.setAlertGridColumn('was_name');
                } else if (moduleType === 2 || moduleType === 5) {
                    this.setAlertGridColumn('db_name');
                } else if (moduleType === 3 || moduleType === 6) {
                    this.setAlertGridColumn('ai_txn_name');
                } else if (moduleType === 7) {
                    this.setAlertGridColumn('business_name');
                }
                break;
            default :
                break;
        }

        // RTM 화면에서 알람 정보를 선택해서 온 경우에 시간값을 설정하지 않는다.
        if (!this.isCallRTM) {
            this.from_time = common.Util.getDate(this.datePicker.getFromDateTime());
            this.to_time   = common.Util.getDate(this.datePicker.getToDateTime());
        } else {
            // RTM에서 넘어온경우에는 달력에 넘어온값으로 세팅!
            this.datePicker.mainFromField.setValue(this.datePicker.dataFormatting(this.from_time, this.datePicker.DisplayTime));
            this.datePicker.mainToField.setValue(this.datePicker.dataFormatting(this.to_time, this.datePicker.DisplayTime));
        }

        this.alertChart.loadingMask.showMask();


        this.alertDetailGrid.clearRows();
        this.alertChart.clearValues();
        this.alertChart.unHighLight();

        alertSQLTxt = this.setAlertQuery(this.alert_name);
        statSQLTxt = this.setStatusQuery(this.cbxStatus.getValue());

        if (this.descriptionField.getValue() !== '%') {
            descriptionTxt = 'AND description LIKE \'' + this.descriptionField.getValue() + '\'';
        } else {
            descriptionTxt = '';
        }

        if (this.time_group === 'min') {
            this.alertChart.interval = PlotChart.time.exMin;
        } else {
            this.alertChart.interval = PlotChart.time.exHour;
        }

        if (+this.server_type === 30) {
            if (this.was_id) {
                target = 'AND target in (';
                for (ix = 0, ixLen = this.was_id.split(',').length; ix < ixLen; ix++) {
                    if (ix === ixLen - 1) {
                        target += '\'' + this.was_id.split(',')[ix] + '\')';
                    } else {
                        target += '\'' + this.was_id.split(',')[ix] + '\',';
                    }
                }
            }

            WS.SQLExec({
                sql_file: this.time_group === 'min' ? this.sql.AI_chart_M : this.sql.AI_chart_H,
                bind: [{
                    name : 'fromtime', value: this.from_time, type : SQLBindType.STRING
                },{
                    name : 'totime', value: this.to_time, type : SQLBindType.STRING
                },{
                    name : 'server_type', value: this.server_type, type : SQLBindType.INTEGER
                }, {
                    name : 'moduleType', value: this.cbxAIModuleType.getValue(), type : SQLBindType.INTEGER
                }],
                replace_string: [{
                    name : 'target', value: target
                },{
                    name : 'alert_name', value: alertSQLTxt
                },{
                    name : 'status_name', value: statSQLTxt
                },{
                    name : 'description', value: descriptionTxt
                }]
            }, this.onChartData, this);
        } else {
            WS.SQLExec({
                sql_file: this.time_group === 'min' ? this.sql.chart_M : this.sql.chart_H,
                bind: [{
                    name : 'fromtime', value: this.from_time, type : SQLBindType.STRING
                },{
                    name : 'totime', value: this.to_time, type : SQLBindType.STRING
                },{
                    name : 'server_type', value: this.server_type, type : SQLBindType.INTEGER
                }],
                replace_string: [{
                    name : 'server_id', value: this.cbxWasDBHost.getValue()
                },{
                    name : 'alert_name', value: alertSQLTxt
                },{
                    name : 'status_name', value: statSQLTxt
                },{
                    name : 'description', value: descriptionTxt
                }]
            }, this.onChartData, this);
        }

        this.isClickRetrieve = false;
    },

    setAlertGridColumn: function(selectType) {
        var ix, ixLen,
            detailGridColList, summaryGridColList,
            hideGridColList;

        detailGridColList = this.alertDetailGrid.pnlExGrid.headerCt.getGridColumns();
        summaryGridColList = this.alertSummaryGrid.pnlExGrid.headerCt.getGridColumns();
        hideGridColList = ['was_name','db_name','host_name','ws_name','cd_name','business_name','ai_txn_name'];


        for (ix = 0, ixLen = detailGridColList.length; ix < ixLen; ix++) {
            if (detailGridColList[ix].dataIndex === selectType) {
                detailGridColList[ix].colvisible = true;
                detailGridColList[ix].setVisible(true);
            } else if (hideGridColList.indexOf(detailGridColList[ix].dataIndex) !== -1) {
                detailGridColList[ix].colvisible = false;
                detailGridColList[ix].setVisible(false);
            }

            if (this.cbxWasDBHost.selectType === 'TP') {
                if (detailGridColList[ix].text === common.Util.CTR('WAS')) {
                    detailGridColList[ix].setText(common.Util.CTR('TP'));
                }
            } else {
                if (detailGridColList[ix].text === common.Util.CTR('TP')) {
                    detailGridColList[ix].setText(common.Util.CTR('WAS'));
                }
            }
        }

        for (ix = 0, ixLen = summaryGridColList.length; ix < ixLen; ix++) {
            if (summaryGridColList[ix].dataIndex === selectType) {
                summaryGridColList[ix].colvisible = true;
                summaryGridColList[ix].setVisible(true);
            } else if (hideGridColList.indexOf(summaryGridColList[ix].dataIndex) !== -1) {
                summaryGridColList[ix].colvisible = false;
                summaryGridColList[ix].setVisible(false);
            }

            if (this.cbxWasDBHost.selectType === 'TP') {
                if (summaryGridColList[ix].text === common.Util.CTR('WAS')) {
                    summaryGridColList[ix].setText(common.Util.CTR('TP'));
                }
            } else {
                if (summaryGridColList[ix].text === common.Util.CTR('TP')) {
                    summaryGridColList[ix].setText(common.Util.CTR('WAS'));
                }
            }
        }
    },

    onChartData: function(header, data) {
        var ix, ixLen,
            reqSQLParam, chartParam, seriesData, dataIndex;

        reqSQLParam = header.parameters;
        chartParam = {};
        seriesData = {};
        dataIndex = 1;


        if (this.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            this.alertChart.loadingMask.hide();
            console.warn('AlertHistory-onChartData');
            console.warn(header);
            console.warn(data);
            return;
        }

        chartParam.from = reqSQLParam.bind[0].value;
        chartParam.to   = reqSQLParam.bind[1].value;
        chartParam.time = 0;
        chartParam.data = data.rows;

        for (ix = 0, ixLen = this.alertChart.serieseList.length; ix < ixLen; ix++) {
            seriesData[ix] = dataIndex++;
        }

        chartParam.series = seriesData;

        this.alertChart.addValues(chartParam);
        this.alertChart.plotDraw();

        this.retrieveAlertGridData(this.alertChart.maxOffSet, 'chart_load');


        this.alertChart.loadingMask.hide();
    },

    retrieveAlertGridData: function(chartItem, callByRetrieve) {
        var target = '',
            alertSQLTxt, statSQLTxt, descriptionTxt,
            fromTime, toTime,
            ix, ixLen,
            serverId, serverType;

        if (callByRetrieve !== 'chart_load') {
            fromTime = common.Util.getDate(chartItem.datapoint[0]);
            if (this.time_group === 'min') {
                toTime = fromTime.substring(0, 16) + ':59';
            } else {
                fromTime = +new Date(chartItem.datapoint[0]) < +new Date(this.from_time) ? this.from_time : common.Util.getDate(chartItem.datapoint[0]);
                toTime = +new Date(this.to_time) < +new Date(fromTime.substring(0, 13) + ':59:59') ? this.to_time : fromTime.substring(0, 13) + ':59:59';
            }
        } else {
            fromTime = this.from_time;
            toTime = this.to_time;
        }

        serverType = this.rdoServerTypeField.getCheckedValue();
        serverId = this.cbxWasDBHost.getValue();

        alertSQLTxt = this.setAlertQuery(this.cbxAlertName.getValue());
        statSQLTxt  = this.setStatusQuery(this.cbxStatus.getValue());

        if (this.descriptionField.getValue() !== '%') {
            descriptionTxt = 'AND description LIKE \'' + this.descriptionField.getValue() + '\'';
        } else {
            descriptionTxt = '';
        }

        this.alertDetailGrid.loadingMask.showMask();
        this.alertSummaryGrid.loadingMask.showMask();

        if (+serverType === 30) {
            if (serverId) {
                target = 'AND target in (';
                for (ix = 0, ixLen = serverId.split(',').length; ix < ixLen; ix++) {
                    if (ix === ixLen - 1) {
                        target += '\'' + serverId.split(',')[ix] + '\')';
                    } else {
                        target += '\'' + serverId.split(',')[ix] + '\',';
                    }
                }
            }

            WS.SQLExec({
                sql_file: this.sql.AI_grid,
                bind: [{
                    name : 'fromtime', value: fromTime, type : SQLBindType.STRING
                },{
                    name : 'totime', value: toTime, type : SQLBindType.STRING
                }, {
                    name : 'moduleType', value: this.cbxAIModuleType.getValue(), type : SQLBindType.INTEGER
                }],
                replace_string: [{
                    name : 'target', value: target
                },{
                    name : 'alert_name', value: alertSQLTxt
                },{
                    name : 'status_name', value: statSQLTxt
                }]
            }, this.onDetailGridData, this);

            WS.SQLExec({
                sql_file: this.sql.AI_chart_click,
                bind: [{
                    name : 'fromtime', value: fromTime, type : SQLBindType.STRING
                },{
                    name : 'totime', value: toTime, type : SQLBindType.STRING
                }, {
                    name : 'moduleType', value: this.cbxAIModuleType.getValue(), type : SQLBindType.INTEGER
                }],
                replace_string: [{
                    name : 'target', value: target
                },{
                    name : 'alert_name', value: alertSQLTxt
                },{
                    name : 'status_name', value: statSQLTxt
                }]
            }, this.onDetailGridData, this);
        } else {
            WS.SQLExec({
                sql_file: this.sql.grid,
                bind: [{
                    name : 'fromtime', value: fromTime, type : SQLBindType.STRING
                },{
                    name : 'totime', value: toTime, type : SQLBindType.STRING
                },{
                    name : 'server_type', value: serverType, type : SQLBindType.INTEGER
                }],
                replace_string: [{
                    name : 'server_id', value: serverId
                },{
                    name : 'alert_name', value: alertSQLTxt
                },{
                    name : 'status_name', value: statSQLTxt
                },{
                    name : 'description', value: descriptionTxt
                }]
            }, this.onDetailGridData, this);

            WS.SQLExec({
                sql_file: this.sql.chart_click,
                bind: [{
                    name : 'fromtime', value: fromTime, type : SQLBindType.STRING
                },{
                    name : 'totime', value: toTime, type : SQLBindType.STRING
                },{
                    name : 'server_type', value: serverType, type : SQLBindType.INTEGER
                }],
                replace_string: [{
                    name : 'server_id', value: serverId
                },{
                    name : 'alert_name', value: alertSQLTxt
                },{
                    name : 'status_name', value: statSQLTxt
                },{
                    name : 'description', value: descriptionTxt
                }]
            }, this.onDetailGridData, this);
        }
    },

    onDetailGridData: function(header, data) {
        if (!common.Util.checkSQLExecValid(header, data)) {
            console.warn('alertHistory-onGrid');
            console.warn(header);
            console.warn(data);

            this.alertDetailGrid.loadingMask.hide();
            this.alertSummaryGrid.loadingMask.hide();

            return;
        }

        switch (header.command) {
            case this.sql.grid:
                this.addRowDetailGrid(data);
                break;
            case this.sql.chart_click:
                this.addRowSummaryGrid(data);
                break;
            case this.sql.AI_chart_click:
                this.addRowAISummaryGrid(data);
                break;
            case this.sql.AI_grid:
                this.addRowAIDetailGrid(data);
                break;
            default:
                break;
        }
    },

    addRowDetailGrid: function(data) {
        var ix, ixLen,
            rowData = data,
            name, description, alert_type, server_type;

        this.alertDetailGrid.clearRows();

        for (ix = 0, ixLen = rowData.rows.length; ix < ixLen; ix++) {

            name        = rowData.rows[ix][ 8];
            description = rowData.rows[ix][ 9];
            alert_type  = rowData.rows[ix][14];
            server_type = rowData.rows[ix][15];

            if (!(name === 'Elapsed Time' || name === 'Process Down' || name === 'Process Boot' || name === 'Queuing Counts' || name === 'AQ Counts' || alert_type === 'Exception Alert' || alert_type === 'SLog Alert' || server_type === 15)) {
                description = '';
            }

            this.alertDetailGrid.addRow([
                rowData.rows[ix][ 0]             // 'time'
                , rowData.rows[ix][ 1]             // 'server_id'
                , rowData.rows[ix][ 2]             // 'was_name'
                , rowData.rows[ix][ 3]             // 'db_name'
                , rowData.rows[ix][ 4]             // 'host_name'
                , rowData.rows[ix][ 5]             // 'ws_name'
                , rowData.rows[ix][ 6]             // 'cd_name'
                , rowData.rows[ix][ 7]             // 'business_name'
                , ''                               // 'ai_txn_name'
                , name                             // 'name'
                , description                      // 'txn_name'
                , rowData.rows[ix][10]             // 'status'
                , rowData.rows[ix][11]             // 'value'
                , rowData.rows[ix][12]             // 'tid'
                , rowData.rows[ix][13]             // 'start_time'
                , alert_type                       // 'alert_type'
                , rowData.rows[ix][15]             // 'server_type'
            ]);
        }

        this.alertDetailGrid.drawGrid();
        this.alertDetailGrid.loadingMask.hide();
    },

    addRowSummaryGrid: function(data) {
        var ix, ixLen,
            rowData = data;

        this.alertSummaryGrid.clearRows();

        for (ix = 0, ixLen = rowData.rows.length; ix < ixLen; ix++) {

            this.alertSummaryGrid.addRow([
                rowData.rows[ix][ 0]             // 'was_name'
                , rowData.rows[ix][ 1]             // 'db_name'
                , rowData.rows[ix][ 2]             // 'host_name'
                , rowData.rows[ix][ 3]             // 'ws_name'
                , rowData.rows[ix][ 4]             // 'cd_name'
                , rowData.rows[ix][ 5]             // 'business_name'
                , ''                               // 'ai_txn_name'
                , rowData.rows[ix][ 6]             // 'warning'
                , rowData.rows[ix][ 7]             // 'critical'
            ]);
        }

        this.alertSummaryGrid.drawGrid();
        this.alertSummaryGrid.loadingMask.hide();
    },

    /**
     * @param data
     *  0  : time
     *  1  ; target
     *  2  : module_type
     *  3  : fcst_was_name
     *  4  : aduma_was_name
     *  5  : fcst_db_name
     *  6  : aduma_db_name
     *  7  : alert_resource_name
     *  8  : description
     *  9  : status
     *  10 : alert_value
     *  11 : occur_time
     *  12 : alert_resource_id
     */
    addRowAIDetailGrid: function(data) {
        var ix, ixLen,
            rowData = data;

        var aiModuleType, aiModuleName, aiWasName, aiDBName, tid, description;

        var predictionTime, diffMinTime, displayPredictionTime, currentTime, alertValue;

        this.alertDetailGrid.clearRows();

        for (ix = 0, ixLen = rowData.rows.length; ix < ixLen; ix++) {
            aiModuleType = rowData.rows[ix][2];
            description = rowData.rows[ix][8];
            currentTime = new Date(rowData.rows[ix][0]);
            alertValue = +rowData.rows[ix][10];

            if (!Number.isInteger(alertValue)) {
                alertValue = alertValue.toFixed(3);
            }

            if (rowData.rows[ix][11]) {
                predictionTime = new Date(rowData.rows[ix][11]);
                diffMinTime = (predictionTime - currentTime) / 60000;

                if (diffMinTime === 0) {
                    displayPredictionTime = common.Util.TR('Current Value');
                } else {
                    displayPredictionTime = Ext.String.format(common.Util.TR('Estimated value after {0} minute'), diffMinTime);
                }
            }

            switch (aiModuleType) {
                case 1:
                    aiModuleName = common.Util.TR('Load Prediction WAS');
                    aiWasName = rowData.rows[ix][ 3];
                    description += aiModuleName + ' (' + displayPredictionTime + ')';
                    break;
                case 2:
                    aiModuleName = common.Util.TR('Load Prediction DB');
                    aiDBName = rowData.rows[ix][ 5];
                    description += aiModuleName + ' (' + displayPredictionTime + ')';
                    break;
                case 3:
                    aiModuleName = common.Util.TR('Load Prediction Transaction');
                    description = aiModuleName + ' (' + displayPredictionTime + ')';
                    break;
                case 4:
                    aiModuleName = common.Util.TR('Abnormal Detection WAS');
                    aiWasName = rowData.rows[ix][ 4];
                    description += aiModuleName;
                    break;
                case 5:
                    aiModuleName = common.Util.TR('Abnormal Detection DB');
                    aiDBName = rowData.rows[ix][ 6];
                    description += aiModuleName;
                    break;
                case 6:
                    aiModuleName = common.Util.TR('Abnormal Detection Transaction');
                    aiWasName = rowData.rows[ix][3];
                    tid = rowData.rows[ix][12];
                    description = aiModuleName;
                    break;
                case 7:
                    aiModuleName = common.Util.TR('Load Prediction Business');
                    description += aiModuleName + ' (' + displayPredictionTime + ')';
                    break;
                default:
                    break;
            }

            this.alertDetailGrid.addRow([
                rowData.rows[ix][0]        // 'time'
                , rowData.rows[ix][1]      // 'server_id' == target
                , aiWasName                // 'was_name'
                , aiDBName                 // 'db_name'
                , null                     // 'host_name'
                , null                     // 'ws_name'
                , null                     // 'cd_name'
                , rowData.rows[ix][13]     // 'business_name'
                , rowData.rows[ix][14]     // 'ai_txn_name'
                , rowData.rows[ix][7]      // 'name'
                , description              // 'description'
                , rowData.rows[ix][9]      // 'status'
                , alertValue               // 'value'
                , tid                      // 'tid'
                , rowData.rows[ix][16]     // 'start_time'
                , null                     // 'alert_type'
                , 30                       // 'server_type'
            ]);
        }

        this.alertDetailGrid.drawGrid();
        this.alertDetailGrid.loadingMask.hide();
    },

    /**
     * @param data
     *  0  ; target
     *  1  : module_type
     *  2  : fcst_was_name
     *  3  : aduma_was_name
     *  4  : fcst_db_name
     *  5  : aduma_db_name
     *  6  : warning
     *  7  : critical
     */
    addRowAISummaryGrid: function(data) {
        var ix, ixLen,
            rowData = data;

        var aiModuleType, aiWasName, aiDBName;

        this.alertSummaryGrid.clearRows();

        for (ix = 0, ixLen = rowData.rows.length; ix < ixLen; ix++) {
            aiModuleType = rowData.rows[ix][1];

            switch (aiModuleType) {
                case 1:
                    aiWasName = rowData.rows[ix][ 2];
                    break;
                case 2:
                    aiDBName = rowData.rows[ix][ 4];
                    break;
                case 4:
                    aiWasName = rowData.rows[ix][ 3];
                    break;
                case 5:
                    aiDBName = rowData.rows[ix][ 5];
                    break;
                default:
                    break;
            }

            this.alertSummaryGrid.addRow([
                aiWasName                   // 'was_name'
                , aiDBName                  // 'db_name'
                , null                      // 'host_name'
                , null                      // 'ws_name'
                , null                      // 'cd_name'
                , rowData.rows[ix][ 8]      // 'business_name'
                , rowData.rows[ix][ 9]      // 'ai_txn_name'
                , rowData.rows[ix][ 6]      // 'warning'
                , rowData.rows[ix][ 7]      // 'critical'
            ]);
        }

        this.alertSummaryGrid.drawGrid();
        this.alertSummaryGrid.loadingMask.hide();
    },

    setAlertQuery: function(alert_name) {
        var result;

        if ((alert_name !== null) && ( alert_name !== '(All)' )) {
            result = 'and alert_resource_name =  \'' + alert_name + '\'';
        } else  {
            result = '';
        }

        return result;
    },

    setStatusQuery: function(status_name) {
        var result;

        if (status_name !== '(All)') {
            result = 'and alert_level = \'' + status_name + '\'';
        } else {
            result = '';
        }

        return result;
    },

    checkValid: function() {
        var serverId,
            msgStr,
            condCbx;

        serverId = this.cbxWasDBHost.getValue();
        condCbx = this.cbxWasDBHost.WASDBCombobox;

        switch (+this.rdoServerTypeField.getCheckedValue()) {
            case 1:
                msgStr = common.Util.TR('Please select WAS.');
                break;
            case 2:
                msgStr = common.Util.TR('Please select Database.');
                break;
            case 9:
                msgStr = common.Util.TR('Please select Host.');
                break;
            case 3:
                msgStr = common.Util.TR('Please select WebServer.');
                break;
            default :
                break;
        }

        if (!this.cbxWasDBHost.disabled && !serverId) {
            this.openAlertPopup(common.Util.TR('ERROR'), msgStr, Ext.MessageBox.ERROR, condCbx);
            condCbx.selectByIndex(0);
            return false;
        }
        return true;
    },

    openAlertPopup: function(msgTitle, msgStr, errType, condCbx) {
        Ext.Msg.show({
            title  : common.Util.TR(msgTitle),
            msg    : msgStr ,
            buttons: Ext.Msg.OK,
            icon   : errType,
            fn     : function(buttonId) {
                if (buttonId === 'ok') {
                    condCbx.focus();
                }
            }
        });
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

    addRadioBtn: function(name, itemId, label, width, checked, typeValue, type, hidden) {
        var radioBtn;

        radioBtn = Ext.create('Ext.form.field.Radio', {
            boxLabel: common.Util.TR(label),
            itemId: itemId,
            width: width,
            name: this.id + '_' + name,
            inputValue : typeValue,
            checked: checked,
            hidden : hidden,
            listeners: {
                change: function(field) {
                    var selectType, selectRadioType;
                    if (type === 'server' && field.getValue()) {

                        if (!common.Menu.categoriesConf['RealtimeAI']) {
                            if (field.boxLabel === 'AI') {
                                this.cbxAIModuleType.setDisabled(false);
                                this.cbxAIModuleType.show();

                                this.cbxWasDBHost.setX(550);

                                this.rdoServerTypeField.setX(865);

                                this.descriptionField.setDisabled(true);
                            } else {
                                if (this.cbxAIModuleType) {
                                    this.cbxAIModuleType.setDisabled(true);
                                    this.cbxAIModuleType.hide();
                                }

                                this.cbxWasDBHost.setX(325);

                                this.rdoServerTypeField.setX(595);

                                this.descriptionField.setDisabled(false);
                            }
                        }


                        if (common.Util.TR(field.boxLabel) === common.Util.TR('Agent')) {
                            selectRadioType = 'WAS';
                            selectType = common.Util.TR('Agent');
                        } else if (common.Util.TR(field.boxLabel) === common.Util.TR('WebServer')) {
                            selectRadioType = 'WEB';
                            selectType = common.Util.TR('WebServer');
                        } else if (common.Util.TR(field.boxLabel) === common.Util.TR('TP')) {
                            selectRadioType = 'TP';
                            selectType = common.Util.TR('TP');
                        } else if (common.Util.TR(field.boxLabel) === common.Util.TR('C_Daemon')) {
                            selectRadioType = 'CD';
                            selectType = common.Util.TR('C_Daemon');
                        } else if (field.boxLabel === 'DB') {
                            selectType = 'DB';
                        } else if (field.boxLabel === 'Host') {
                            selectType = 'Host';
                        } else if (common.Util.TR(field.boxLabel) === common.Util.TR('Business')) {
                            if (Comm.businessRegisterInfo.length) {
                                selectType = common.Util.TR('Business');
                            }
                        } else {
                            if (+this.cbxAIModuleType.getValue() === 1 || +this.cbxAIModuleType.getValue() === 4) {
                                selectRadioType = 'WAS';
                                selectType = common.Util.TR('Agent');
                            } else if (+this.cbxAIModuleType.getValue() === 2 || +this.cbxAIModuleType.getValue() === 5) {
                                selectType = 'DB';
                            }
                        }

                        if (field.boxLabel !== 'AI' || this.AIModuleTypeCheck.indexOf(+this.cbxAIModuleType.getValue()) === -1) {
                            this.cbxWasDBHost.setDisabled(false);
                            this.cbxWasDBHost.WASDBCombobox.setFieldLabel(selectType);
                            this.cbxWasDBHost.selectType = selectType;
                            this.cbxWasDBHost.selectRadioType = selectRadioType;
                            this.cbxWasDBHost._getServiceInfo();
                        } else {
                            this.cbxWasDBHost.setDisabled(true);
                        }

                        this.radioChange = true;
                        this.setAlertName(field.inputValue);
                    }
                }.bind(this)
            }
        });

        return radioBtn;
    }
});