Ext.define('config.config_ai_learning_setting', {
    extend: 'Exem.FormOnCondition',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.None,

    sql : {
        learning_info           : 'IMXConfig_AI_Learning_Info.sql',
        learning_check          : 'IMXConfig_AI_Learning_Check.sql',
        learning_update         : 'IMXConfig_AI_Learning_Update.sql',
        learning_insert         : 'IMXConfig_AI_Learning_Insert.sql',
        learning_auto_insert    : 'IMXConfig_AI_Learning_Auto_Insert.sql',
        learning_auto_update    : 'IMXConfig_AI_Learning_Auto_Update.sql',
        learning_auto_info      : 'IMXConfig_AI_Learning_Auto_Info.sql',
        was_list                : 'IMXConfig_AI_Learning_Was.sql',
        db_list                 : 'IMXConfig_AI_Learning_DB.sql',
        txn_list                : 'IMXConfig_AI_Learning_Txn.sql',
        business_list           : 'IMXConfig_AI_Learning_Business.sql'
    },

    init: function(target) {
        this.target = target;
        this.initLayout();
        this.initSetting();
    },


    initLayout: function() {
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            border: false,
            style: { background: '#eeeeee' },
            listeners: {
                beforedestroy: function() {
                    if (this.autoRefresh) {
                        clearInterval(this.autoRefresh);
                    }
                }.bind(this)
            }
        });

        this.createTabPanel();
        this.createToolBar();
        this.createLearningSettingPanel();

        baseCon.add(this.aiTabPanel, this.toolbar, this.learningSettingPanel);

        this.target.add(baseCon);
    },

    createTabPanel: function() {
        this.aiTabPanel = Ext.create('Ext.tab.Panel', {
            width: '100%',
            height: 27,
            border: false,
            activeTab: 'initLearning',
            style: { background: '#e7e7e7' },
            items: [{
                title: common.Util.TR('Initial Learning'),
                itemId: 'initLearning',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }, {
                title: common.Util.TR('Automatic Learning'),
                itemId: 'autoLearning',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }],
            listeners: {
                tabchange: function(tabPanel, newCard) {
                    var ix, ixLen, aiGridColList;

                    aiGridColList = this.aiLearningGrid.baseGrid.headerCt.getGridColumns();

                    for (ix = 0, ixLen = aiGridColList.length; ix < ixLen; ix++) {
                        if (newCard.title === common.Util.TR('Initial Learning') && aiGridColList[ix].dataIndex === 'auto_learn' ||
                            newCard.title === common.Util.TR('Initial Learning') && aiGridColList[ix].dataIndex === 'cycle' ||
                            newCard.title === common.Util.TR('Initial Learning') && aiGridColList[ix].dataIndex === 'range' ||
                            newCard.title === common.Util.TR('Automatic Learning') && aiGridColList[ix].dataIndex === 'result' ||
                            aiGridColList[ix].dataIndex === 'id') {
                            aiGridColList[ix].colvisible = false;
                            aiGridColList[ix].setVisible(false);
                        } else {
                            aiGridColList[ix].colvisible = true;
                            aiGridColList[ix].setVisible(true);
                        }
                    }

                    if (newCard.title === common.Util.TR('Initial Learning')) {
                        this.autoModeComboBox.setVisible(false);
                        this.modeComboBox.setVisible(true);
                    } else {
                        this.autoModeComboBox.setVisible(true);
                        this.modeComboBox.setVisible(false);
                    }

                    this.currentTab = newCard.title;

                    this.onData();
                }.bind(this)
            }
        });


    },

    createToolBar: function() {
        this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                scope: this,
                handler: function() {
                    this.showLearningWindow();
                }.bind(this)
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() {
                    this.onData();
                }.bind(this)
            }, '-', {
                xtype:'checkboxfield',
                boxLabel: common.Util.TR('Auto Refresh (1min)'),
                itemId: 'autoRefreshCheck',
                checked: true,
                margin: '0 0 1 5',
                listeners: {
                    change: function(me) {
                        if (me.getValue()) {
                            this.autoRefresh = setInterval(function() {
                                this.onData();
                            }.bind(this), 60000);
                        } else {
                            if (this.autoRefresh) {
                                clearInterval(this.autoRefresh);
                            }
                        }
                    }.bind(this)
                }
            }]
        });
    },

    createLearningSettingPanel: function() {
        this.learningSettingPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            style: { background: '#eeeeee' }
        });

        this.createSearchCon();
        this.createSettingCon();

        this.learningSettingPanel.add(this.searchCon, this.settingCon);
    },

    createSearchCon: function() {
        this.searchCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            height: 35,
            width: '100%'
        });

        this.createConditionArea();

        this.searchCon.add(this.conditionArea);
    },

    createConditionArea: function() {
        this.conditionArea = Ext.create('Ext.container.Container', {
            xtype: 'container',
            itemId: 'containerArea',
            flex: 1,
            height: '100%',
            border: false,
            layout: 'absolute',
            style: {
                background: '#eeeeee',
                padding: '5px 5px'
            }
        });

        this.modeComboBox = Ext.create('Exem.ComboBox', {
            x           : 10,
            y           : 5,
            fieldLabel  : common.Util.TR('Service'),
            labelWidth  : 40,
            width       : (Comm.Lang === 'ko' || window.nation === 'ko') ? 200 : 250,
            store: Ext.create('Exem.Store'),
            listeners   : {
                scope : this,
                change: function() {
                    this.onData();
                }
            }
        });

        this.modeComboBox.addItem('exem_imx_dbsln_biz' , common.Util.TR('Dynamic Baseline Business'));
        this.modeComboBox.addItem('exem_imx_dbsln_txn' , common.Util.TR('Dynamic Baseline Transaction'));
        this.modeComboBox.addItem('exem_mfo_dbsln_db'  , common.Util.TR('Dynamic Baseline DB'));
        this.modeComboBox.addItem('exem_imx_dbsln_was' , common.Util.TR('Dynamic Baseline WAS'));
        this.modeComboBox.addItem('exem_imx_adclst_txn', common.Util.TR('Abnormal Detection Transaction'));
        this.modeComboBox.addItem('exem_mfo_aduma_db'  , common.Util.TR('Abnormal Detection DB'));
        this.modeComboBox.addItem('exem_imx_aduma_was' , common.Util.TR('Abnormal Detection WAS'));
        this.modeComboBox.addItem('exem_imx_fcst_biz'  , common.Util.TR('Load Prediction Business'));
        this.modeComboBox.addItem('exem_imx_fcst_txn'  , common.Util.TR('Load Prediction Transaction'));
        this.modeComboBox.addItem('exem_mfo_fcst_db'   , common.Util.TR('Load Prediction DB'));
        this.modeComboBox.addItem('exem_imx_fcst_was'  , common.Util.TR('Load Prediction WAS'));

        this.autoModeComboBox = Ext.create('Exem.ComboBox', {
            x           : 10,
            y           : 5,
            fieldLabel  : common.Util.TR('Service'),
            labelWidth  : 40,
            width       : (Comm.Lang === 'ko' || window.nation === 'ko') ? 200 : 250,
            store: Ext.create('Exem.Store'),
            listeners   : {
                scope : this,
                change: function() {
                    this.onData();
                }
            }
        });

        this.autoModeComboBox.addItem('exem_imx_dbsln_biz' , common.Util.TR('Dynamic Baseline Business'));
        this.autoModeComboBox.addItem('exem_imx_dbsln_txn' , common.Util.TR('Dynamic Baseline Transaction'));
        this.autoModeComboBox.addItem('exem_mfo_dbsln_db'  , common.Util.TR('Dynamic Baseline DB'));
        this.autoModeComboBox.addItem('exem_imx_dbsln_was' , common.Util.TR('Dynamic Baseline WAS'));
        this.autoModeComboBox.addItem('exem_imx_adclst_txn', common.Util.TR('Abnormal Detection Transaction'));
        this.autoModeComboBox.addItem('exem_imx_fcst_biz'  , common.Util.TR('Load Prediction Business'));
        this.autoModeComboBox.addItem('exem_imx_fcst_txn'  , common.Util.TR('Load Prediction Transaction'));
        this.autoModeComboBox.addItem('exem_mfo_fcst_db'   , common.Util.TR('Load Prediction DB'));
        this.autoModeComboBox.addItem('exem_imx_fcst_was'  , common.Util.TR('Load Prediction WAS'));

        this.conditionArea.add(this.modeComboBox, this.autoModeComboBox);
    },

    createSettingCon: function() {
        this.settingCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            style: {background: '#eeeeee'}
        });

        this.addGridPanel();

        this.settingCon.add(this.gridPanel);
    },

    addGridPanel: function() {
        var gridTitle;

        this.gridPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            maxWidth: 1410,
            flex: 1,
            border: false,
            split: true,
            margin: '3 3 3 3',
            padding: '2 2 2 2',
            bodyStyle: { background: '#eeeeee' }
        });

        gridTitle = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [{
                xtype: 'label',
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 4',
                html: common.Util.usedFont(9, common.Util.TR('List'))
            }]
        });

        this.createAIGrid();

        this.gridPanel.add(gridTitle, this.aiLearningGrid);
    },

    createAIGrid: function() {
        this.aiLearningGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            flex: 1,
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            multiCheckable: false
        });

        this.aiLearningGrid.beginAddColumns();
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Agent ID'),                   dataIndex: 'id',              width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Name'),                       dataIndex: 'title',           width: 200, type: Grid.String,       alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Automatic Learning'),         dataIndex: 'auto_learn',      width: 130, type: Grid.String,       alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Training Request'),           dataIndex: 'request_state',   width: 130, type: Grid.String,       alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Training Result'),            dataIndex: 'result',          width: 130, type: Grid.String,       alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Start Learning Range'),       dataIndex: 'from_date',       width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('End Learning Range'),         dataIndex: 'to_date',         width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Learning Time (min)'),        dataIndex: 'learning_time',   width: 130, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Learning Request Time'),      dataIndex: 'last_train_time', width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Learning Interval (day)'),    dataIndex: 'cycle',           width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.aiLearningGrid.addColumn({text: common.Util.CTR('Learning Data Range (day)'),  dataIndex: 'range',           width: 170, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.aiLearningGrid.endAddColumns();
    },

    initSetting: function() {
        var ix, ixLen, aiGridColList;

        this.useFieldName = '';
        this.offsetCount = 0;
        this.aiGridList = [];
        this.aiGridLearningList = [];
        this.learningList = [];
        this.sqlRunning = false;

        this.currentTab = common.Util.TR('Initial Learning');

        this.autoRefresh = setInterval(function() {
            this.onData(true);
        }.bind(this), 60000);

        aiGridColList = this.aiLearningGrid.baseGrid.headerCt.getGridColumns();

        for (ix = 0, ixLen = aiGridColList.length; ix < ixLen; ix++) {
            if (aiGridColList[ix].dataIndex === 'auto_learn' || aiGridColList[ix].dataIndex === 'cycle' || aiGridColList[ix].dataIndex === 'range') {
                aiGridColList[ix].colvisible = false;
                aiGridColList[ix].setVisible(false);
            }
        }

        this.autoModeComboBox.setVisible(false);
    },

    showLearningWindow: function() {
        var orderList = [], columnInfoArr = [],
            ix, ixLen;

        var dateLabel, toggleLabel;
        var cycleSetValue, rangeMinValue;
        var topArea, optionArea, searchArea;
        var retrieveButton;

        topArea = Ext.create('Exem.Container', {
            width   : '100%',
            height  : this.currentTab === common.Util.TR('Initial Learning') ? 80 : 40,
            layout  : 'vbox'
        });

        optionArea = Ext.create('Exem.Container', {
            width   : '100%',
            flex : 1,
            layout  : 'hbox'
        });

        if (this.currentTab === common.Util.TR('Initial Learning')) {
            dateLabel = Ext.create('Ext.form.Label', {
                margin     : '13 0 0 10',
                text : common.Util.TR('Learning Data Range')
            });

            this.datePicker = Ext.create('Exem.DatePicker',{
                margin     : '10 0 0 5',
                DisplayTime: this.DisplayTime,
                rangeOneDay: this.rangeOneDay,
                singleField: this.singleField,
                isDiff     : this.isDiff,
                defaultTimeGap : this.defaultTimeGap,
                useRetriveBtn : false,
                useGoDayButton : false
            });

            optionArea.add(dateLabel, this.datePicker);

            searchArea = Ext.create('Exem.Container', {
                width   : '100%',
                flex : 1,
                layout  : 'hbox',
                items: [{
                    xtype: 'label',
                    x: 0,
                    y: 5,
                    width: 80,
                    style: 'text-align:right;',
                    margin : '6 10 0 0',
                    html: Comm.RTComm.setFont(9, common.Util.TR('List Search'))
                }]
            });

            this.searchField = Ext.create('Ext.form.field.Text',{
                x       : 90,
                y       : 3,
                width   : '55%',
                data    : [],
                enableKeyEvents: true,
                cls     : 'config_tab',
                margin : '3 10 0 0',
                listeners: {
                    keypress : function(field, e) {
                        if (e.keyCode === 13) {
                            this.offsetCount = 0;
                            this.getLearningList(0, false, field.getValue());
                        }
                    }.bind(this)
                }
            });

            retrieveButton = Ext.create('Ext.button.Button', {
                text: common.Util.TR('Retrieve'),
                cls: 'x-btn-config-default',
                x: 320,
                y: 3,
                width: 70,
                margin: '3 2 0 0',
                listeners: {
                    click: function() {
                        this.offsetCount = 0;
                        this.getLearningList(0, false, this.searchField.getValue());
                    }.bind(this)
                }
            });

            searchArea.add(this.searchField, retrieveButton);
            topArea.add(optionArea, searchArea);

            columnInfoArr = this.getColumnInfoData();
        } else {
            toggleLabel = Ext.create('Ext.form.Label', {
                margin     : '13 0 0 10',
                text : common.Util.TR('Automatic Learning')
            });

            this.autoLearningToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
                margin     : '10 0 0 10',
                state   : true,
                listeners : {
                    change: function(me) {
                        if (me.state) {
                            this.intervalCycle.setDisabled(false);
                            this.intervalRange.setDisabled(false);
                        } else {
                            this.intervalCycle.setDisabled(true);
                            this.intervalRange.setDisabled(true);
                        }
                    }.bind(this)
                }
            });

            switch (this.autoModeComboBox.getValue()) {
                case 'exem_imx_fcst_was':
                case 'exem_mfo_fcst_db':
                case 'exem_imx_fcst_txn':
                case 'exem_imx_fcst_biz':
                    cycleSetValue = 7;
                    rangeMinValue = 30;
                    break;
                case 'exem_imx_dbsln_was':
                case 'exem_mfo_dbsln_db':
                case 'exem_imx_dbsln_txn':
                case 'exem_imx_dbsln_biz':
                    cycleSetValue = 7;
                    rangeMinValue = 14;
                    break;
                case 'exem_imx_adclst_txn':
                    cycleSetValue = 3;
                    rangeMinValue = 3;
                    break;
                default:
                    break;
            }

            this.intervalCycle = Ext.create('Exem.NumberField', {
                margin     : '10 0 0 10',
                value       : cycleSetValue,
                maxLength   : 2,
                maxValue    : 99,
                minValue    : 1,
                enforceMaxLength: true,
                allowDecimals   : false,
                allowBlank  : false,
                labelAlign  : 'right',
                fieldLabel  : common.Util.TR('Learning Interval (day)'),
                labelWidth  : (Comm.Lang === 'ko' || window.nation === 'ko') ? 80 : 140,
                width       : (Comm.Lang === 'ko' || window.nation === 'ko') ? 140 : 200
            });

            this.intervalRange = Ext.create('Exem.NumberField', {
                margin     : '10 0 0 10',
                value       : rangeMinValue,
                maxLength   : 2,
                maxValue    : 99,
                minValue    : rangeMinValue,
                enforceMaxLength: true,
                allowDecimals   : false,
                allowBlank  : false,
                labelAlign  : 'right',
                fieldLabel  : common.Util.TR('Learning Data Range (day)'),
                labelWidth  : (Comm.Lang === 'ko' || window.nation === 'ko') ? 120 : 160,
                width       : (Comm.Lang === 'ko' || window.nation === 'ko') ? 180 : 220
            });

            optionArea.add(toggleLabel, this.autoLearningToggle, this.intervalCycle, this.intervalRange);

            for (ix = 0, ixLen = this.aiLearningGrid.getRowCount(); ix < ixLen; ix++) {
                if (this.aiLearningGrid.getRow(ix)) {
                    if (this.aiLearningGrid.getRow(ix).data.request_state === common.Util.TR('Complete Training')) {
                        this.aiLearningGrid.getRow(ix).data.state = common.Util.TR('Complete Training');
                    } else {
                        this.aiLearningGrid.getRow(ix).data.state = common.Util.TR('Incomplete Learning');
                    }
                    columnInfoArr.push(this.aiLearningGrid.getRow(ix).data);
                }
            }

            topArea.add(optionArea);
        }

        this.learningWindow = Ext.create('Exem.MoveColumnWindow', {
            type : 'agent',
            width : 800,
            height : 500,
            parent : this,
            title : common.Util.TR('Setting Training Target'),
            columnInfo : columnInfoArr,
            useColumnInfo : orderList,
            orderMode : true,
            useDefaultBtn : false,
            useUpDownBtn : false,
            leftGridTitle : common.Util.TR('All Lists'),
            rightGridTitle : common.Util.TR('Apply List'),
            hideGridHeaders : false,
            sortEnable : true,
            addStateCol : true,
            defaultPageSize: 100,
            addRowBtn: this.currentTab === common.Util.TR('Initial Learning'),
            okFn : this.onButtonClick,
            nextRowData: this.nextRowOffset
        });

        this.learningWindow.topArea = topArea;
        this.learningWindow.initBase();

        if (this.currentTab === common.Util.TR('Initial Learning')) {
            this.getLearningList(0);
        }
    },

    nextRowOffset: function() {
        this.parent.offsetCount += 100;
        this.parent.getLearningList(this.parent.offsetCount, true, this.parent.useFieldName);
    },

    getColumnInfoData: function() {
        var ix, ixLen;
        var columnInfoArr = [];
        var arrSearchIndex;

        for (ix = 0, ixLen = this.learningList.length; ix < ixLen; ix++) {
            if (this.aiGridList.indexOf(this.learningList[ix].id) !== -1) {
                arrSearchIndex = this.aiGridList.indexOf(this.learningList[ix].id);

                if (this.aiGridLearningList[arrSearchIndex] === common.Util.TR('Complete Training')) {
                    this.learningList[ix].state = common.Util.TR('Complete Training');
                }
            }
            columnInfoArr.push(this.learningList[ix]);
        }

        return columnInfoArr;
    },

    onData: function(isRefresh) {
        var self = this;
        var dataSet = {};
        var ix, ixLen;
        var d, type;

        if (this.currentTab === common.Util.TR('Initial Learning')) {
            dataSet.sql_file = this.sql.learning_info;
            type = this.modeComboBox.getValue() || 'exem_imx_fcst_was';
        } else {
            dataSet.sql_file = this.sql.learning_auto_info;
            type = this.autoModeComboBox.getValue() || 'exem_imx_fcst_was';
        }

        switch (type) {
            case 'exem_imx_fcst_was':
            case 'exem_imx_aduma_was':
            case 'exem_imx_dbsln_was':
                dataSet.replace_string = [{
                    name    : 'targetName',
                    value   : 'was_name'
                }, {
                    name    : 'joinTable',
                    value   : 'xapm_was_info b on a.target = b.was_id::varchar'
                }];
                break;
            case 'exem_mfo_fcst_db':
            case 'exem_mfo_aduma_db':
            case 'exem_mfo_dbsln_db':
                dataSet.replace_string = [{
                    name    : 'targetName',
                    value   : 'instance_name'
                }, {
                    name    : 'joinTable',
                    value   : 'xapm_db_info b on a.target = b.db_id::varchar'
                }];
                break;
            case 'exem_imx_fcst_txn':
            case 'exem_imx_adclst_txn':
            case 'exem_imx_dbsln_txn':
                dataSet.replace_string = [{
                    name    : 'targetName',
                    value   : 'txn_name'
                }, {
                    name    : 'joinTable',
                    value   : 'xapm_txn_name b on a.target = b.txn_id'
                }];
                break;
            case 'exem_imx_fcst_biz':
            case 'exem_imx_dbsln_biz':
                dataSet.replace_string = [{
                    name    : 'targetName',
                    value   : 'b.business_name'
                }];

                if (Comm.bizNameInfo.length) {
                    dataSet.replace_string.push({
                        name    : 'joinTable',
                        value   : 'xapm_business_name b on a.target = b.business_id::varchar'
                    });
                } else {
                    dataSet.replace_string.push({
                        name    : 'joinTable',
                        value   : 'xapm_business_info b on a.target = b.business_id::varchar'
                    });
                }
                break;
            default:
                break;
        }

        dataSet.bind = [{
            name    : 'selectModule',
            value   : type,
            type    : SQLBindType.STRING
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            var id, name, from_date, to_date, request_state, result, learning_time, last_train_time, enable, cycle, range;

            if (!common.Util.checkSQLExecValid(header, data)) {
                console.warn('config_ai_learning_setting-onData');
                console.debug(header);
                console.debug(data);
                return;
            }

            this.offsetCount = 0;
            this.aiGridList = [];
            this.aiGridLearningList = [];
            this.targetInfo = {};
            this.aiLearningGrid.clearRows();

            if (this.currentTab === common.Util.TR('Initial Learning')) {
                for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                    d = data.rows[ix];

                    id              = d[0];
                    name            = d[1];
                    request_state   = d[2];
                    result          = d[3];
                    from_date       = d[4].split(' ')[0];
                    to_date         = d[5].split(' ')[0];
                    learning_time   = d[6];
                    last_train_time = d[7];

                    if (request_state === 1) {
                        request_state = common.Util.TR('Complete Request');
                    } else if (request_state === 0) {
                        request_state = common.Util.TR('Before Request');
                    } else if (request_state === -2) {
                        request_state = common.Util.TR('Request Failed');
                    } else {
                        request_state = common.Util.TR('Training Unnecessary');
                    }

                    if (result === 'true') {
                        result = common.Util.TR('Complete Training');
                    } else {
                        result = common.Util.TR('Before Training');
                    }

                    if (learning_time) {
                        learning_time = Math.round(learning_time / 60); // repo 에는 초, grid 표시는 분
                    }

                    this.aiLearningGrid.addRow([
                        id,              // target_id
                        name,            // target_name
                        null,           // auto_learn
                        request_state,   // request_state
                        result,          // result
                        from_date,       // from_date
                        to_date,         // to_date
                        learning_time,   // learning_time
                        last_train_time // last_train_time
                    ]);

                    if (this.modeComboBox.getValue() === 'exem_imx_fcst_txn' ||
                        this.modeComboBox.getValue() === 'exem_imx_adclst_txn' ||
                        this.modeComboBox.getValue() === 'exem_imx_dbsln_txn') {
                        this.aiGridList.push(id);
                    } else {
                        this.aiGridList.push(+id);
                    }

                    this.aiGridLearningList.push(result);

                    this.targetInfo[id] = name;
                }

                if (!isRefresh) {
                    this.getLearningList(0);
                }
            } else {
                for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                    d = data.rows[ix];

                    id              = d[0];
                    name            = d[1];
                    enable          = d[2];
                    request_state   = d[3];
                    from_date       = self.stringToDate(d[4]);
                    to_date         = self.stringToDate(d[5]);
                    learning_time   = d[6];
                    last_train_time = d[7];
                    cycle           = d[8];
                    range           = d[9];

                    switch (enable) {
                        case 1:
                            enable = common.Util.TR('Enable');
                            break;
                        case 0:
                            enable = common.Util.TR('Disable');
                            break;
                        default:
                            break;
                    }

                    switch (request_state) {
                        case 2:
                            request_state = common.Util.TR('Complete Training');
                            break;
                        case 1:
                            request_state = common.Util.TR('Complete Request');
                            break;
                        case 0:
                            request_state = common.Util.TR('Before Request');
                            break;
                        case -1:
                            request_state = common.Util.TR('Error');
                            break;
                        case -2:
                            request_state = common.Util.TR('Request Failed');
                            break;
                        default:
                            break;
                    }

                    if (learning_time) {
                        learning_time = Math.round(learning_time / 60); // repo 에는 초, grid 표시는 분
                    }

                    self.aiLearningGrid.addRow([
                        id,              // was_id
                        name,            // was_name
                        enable,          // auto_learn
                        request_state,   // request_state
                        null,           // result
                        from_date,       // from_date
                        to_date,         // to_date
                        learning_time,   // learning_time
                        last_train_time, // last_train_time
                        cycle,           // cycle
                        range            // range
                    ]);

                    this.targetInfo[id] = name;
                }
            }
            self.aiLearningGrid.drawGrid();
        }, this);
    },

    getLearningList: function(offsetCount, nextRow, fieldName) {
        var dataSet = {};
        var type, searchName;

        if (this.sqlRunning) {
            return;
        }

        this.sqlRunning = true;

        type = this.modeComboBox.getValue() || 'exem_imx_fcst_was';

        switch (type) {
            case 'exem_imx_fcst_was':
            case 'exem_imx_aduma_was':
            case 'exem_imx_dbsln_was':
                dataSet.sql_file = this.sql.was_list;
                break;
            case 'exem_mfo_fcst_db':
            case 'exem_mfo_aduma_db':
            case 'exem_mfo_dbsln_db':
                dataSet.sql_file = this.sql.db_list;
                break;
            case 'exem_imx_fcst_txn':
            case 'exem_imx_adclst_txn':
            case 'exem_imx_dbsln_txn':
                dataSet.sql_file = this.sql.txn_list;
                break;
            case 'exem_imx_fcst_biz':
            case 'exem_imx_dbsln_biz':
                dataSet.sql_file = this.sql.business_list;
                if (Comm.bizNameInfo.length) {
                    dataSet.replace_string = [{
                        name    : 'table',
                        value   : 'xapm_business_name'
                    }];
                } else {
                    dataSet.replace_string = [{
                        name    : 'table',
                        value   : 'xapm_business_info'
                    }];
                }
                break;
            default:
                break;
        }

        if (!fieldName) {
            searchName = '%%';
            this.useFieldName = '';
        } else {
            searchName = '%' + fieldName + '%';
            this.useFieldName = fieldName;
        }

        dataSet.bind = [{
            name: 'offsetCount',
            value: nextRow ? this.offsetCount : offsetCount,
            type: SQLBindType.INTEGER
        }, {
            name: 'searchName',
            value: searchName,
            type: SQLBindType.STRING
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            var ix, ixLen;
            var rowData, id, name, storeData, windowStore, windowDockedItem, windowNextBtn;

            if (!common.Util.checkSQLExecValid(header, data)) {
                console.warn('config_ai_learning_setting-getLearningList');
                console.debug(header);
                console.debug(data);
                return;
            }

            if (!nextRow) {
                this.learningList = [];
            }

            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                rowData  = data.rows[ix];
                id = rowData[0];
                name = rowData[1];

                this.learningList.push({ id: id, title: name, state: common.Util.TR('Incomplete Learning') });
            }

            if (this.learningWindow) {
                windowStore = this.learningWindow.columnListGrid.getStore();
                windowDockedItem = this.learningWindow.columnListGrid.dockedItems.items;

                if (windowStore) {
                    windowStore.removeAll();
                    storeData = this.windowGridStoreList();
                    windowStore.loadData(storeData);
                }

                if (windowDockedItem.length) {
                    windowNextBtn = windowDockedItem[1].down();

                    if (data.rows.length === 100) {
                        windowNextBtn.setDisabled(false);
                    } else {
                        windowNextBtn.setDisabled(true);
                    }
                }
            }

            this.sqlRunning = false;
        }.bind(this));
    },

    windowGridStoreList: function() {
        var ix, ixLen;
        var storeList = [];
        var column, title, dataIdx, state, columnInfoArr;

        columnInfoArr = this.getColumnInfoData();

        for (ix = 0, ixLen = columnInfoArr.length; ix < ixLen; ix++) {
            column = columnInfoArr[ix];

            title = column.title;
            dataIdx = column.id;
            state = column.state;

            storeList.push({title: title, dataIdx: dataIdx, state: state, idx: ix});
        }

        return storeList;
    },

    stringToDate: function(dateString) {
        if (dateString) {
            return dateString.substring(0,4) + '-' + dateString.substring(4,6) + '-' + dateString.substring(6,8);
        } else {
            return null;
        }
    },

    onButtonClick: function(storeData) {
        var checkDataSet = {}, targetList = [],
            tableObj, count, table, target, idStr, fromtime, totime, tableName,
            ix, ixLen;

        var targetArr = [], nonTargetArr = [],
            headerIdStr;

        var self = this.parent;


        self.targetInfo = {};

        fromtime   = Ext.Date.format(new Date(self.datePicker.getFromDateTime()), 'Y-m-d');
        totime     = Ext.Date.format(new Date(self.datePicker.getToDateTime()), 'Y-m-d 23:59:59');

        for (ix = 0, ixLen = storeData.data.items.length; ix < ixLen; ix++) {
            if (targetList.indexOf(storeData.data.items[ix].data.dataIdx) === -1) {
                targetList.push(storeData.data.items[ix].data.dataIdx);
                self.targetInfo[storeData.data.items[ix].data.dataIdx] = storeData.data.items[ix].data.title;
            }
        }

        tableObj = {
            exem_imx_fcst_was   : 'xapm_was_stat_summary',
            exem_mfo_fcst_db    : 'xapm_db_stat',
            exem_imx_fcst_txn   : 'xapm_txn_summary',
            exem_imx_fcst_biz   : 'xapm_txn_summary',
            exem_imx_aduma_was  : null,
            exem_mfo_aduma_db   : null,
            exem_imx_adclst_txn : 'xapm_long_class_method',
            exem_imx_dbsln_was  : 'xapm_was_stat_summary',
            exem_mfo_dbsln_db   : 'xapm_db_stat',
            exem_imx_dbsln_txn  : 'xapm_txn_summary',
            exem_imx_dbsln_biz  : 'xapm_txn_summary'
        };
        table = tableObj[self.modeComboBox.getValue()];

        if (table && self.currentTab === common.Util.TR('Initial Learning')) {
            for (ix = 0, ixLen = targetList.length; ix < ixLen; ix++) {
                count = 0;
                target = targetList[ix];

                if (table === 'xapm_db_stat') {
                    idStr = 'and db_id = ' + target;
                } else if (table === 'xapm_txn_summary' || table === 'xapm_long_class_method') {
                    idStr = 'and txn_id = \'' + target + '\'';
                } else {
                    idStr = 'and was_id = ' + target;
                }

                if (self.modeComboBox.getValue() === 'exem_imx_fcst_biz' || self.modeComboBox.getValue() === 'exem_imx_dbsln_biz') {
                    if (Comm.bizNameInfo.length > 0) {
                        tableName = 'xapm_business_name_id';
                    } else {
                        tableName = 'xapm_txn_name';
                    }

                    idStr = 'and txn_id in ( select txn_id from ' + tableName + ' where business_id = ' + target + ')';
                }

                if (table === 'xapm_long_class_method') {
                    checkDataSet.sql_file = 'IMXConfig_AI_Learning_TableCheck_Adclst_Txn.sql';
                } else {
                    checkDataSet.sql_file = 'IMXConfig_AI_Learning_TableCheck.sql';
                }

                checkDataSet.replace_string = [{
                    name    : 'table',
                    value   : table
                }, {
                    name    : 'idStr',
                    value   : idStr
                }];
                checkDataSet.bind = [{
                    name    : 'fromtime',
                    value   : fromtime,
                    type    : SQLBindType.STRING
                }, {
                    name    : 'totime',
                    value   : totime,
                    type    : SQLBindType.STRING
                }];

                WS.SQLExec(checkDataSet, function(header, data) {
                    if (!common.Util.checkSQLExecValid(header, data)) {
                        console.warn('config_ai_learning_setting-onButtonClick');
                        console.debug(header);
                        console.debug(data);
                        return;
                    }

                    headerIdStr = header.parameters.replace_string[1].value;

                    if (data.rows[0] && +data.rows[0][0] === 1) {
                        targetArr.push(headerIdStr.split('= ')[1].replace(/'/gi, '').replace(/\)/gi, ''));
                    } else {
                        nonTargetArr.push(headerIdStr.split('= ')[1].replace(/'/gi, '').replace(/\)/gi, ''));
                    }

                    count++;

                    if (count === targetList.length) {
                        self.learning_update(targetArr, nonTargetArr);
                    }
                }.bind(this));
            }
        } else {
            self.learning_update(targetList);
        }

        self.learningWindow.close();
    },

    learning_update: function(targetArr, nonTargetArr) {
        var fromtime, dataVersion, totime, module, result, requestState,
            ix, ixLen, targetListStr = [], dataSet = {};

        var autoModule, enable, cycle, range;

        var msg = '';

        for (ix = 0, ixLen = targetArr.length; ix < ixLen; ix++) {
            targetListStr.push('\'' + targetArr[ix] + '\'');
        }

        targetListStr = targetListStr.join(',');
        if (!targetListStr) {
            targetListStr = '\'\'';
        }

        if (this.currentTab === common.Util.TR('Automatic Learning')) {
            autoModule  = this.autoModeComboBox.getValue();
            enable      = this.autoLearningToggle.getValue();
            cycle       = this.intervalCycle.getValue();
            range       = this.intervalRange.getValue();

            dataSet.sql_file = this.sql.learning_auto_update;

            dataSet.replace_string = [{
                name    : 'targetList',
                value   : targetListStr
            }];
            dataSet.bind = [{
                name    : 'module',
                value   : autoModule,
                type    : SQLBindType.STRING
            }, {
                name    : 'enable',
                value   : enable ? 1 : 0,
                type    : SQLBindType.INTEGER
            }, {
                name    : 'cycle',
                value   : cycle,
                type    : SQLBindType.INTEGER
            }, {
                name    : 'range',
                value   : range,
                type    : SQLBindType.INTEGER
            }];

            WS.SQLExec(dataSet, function(header) {
                if (header && header.success === false) {
                    Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Change Failed'));
                } else {
                    Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Change Success'));
                }
                this.onData();
            }, this);

            return;
        }

        fromtime   = Ext.Date.format(new Date(this.datePicker.getFromDateTime()), 'Y-m-d');
        totime     = Ext.Date.format(new Date(this.datePicker.getToDateTime()), 'Y-m-d 23:59:59');
        dataVersion = fromtime.replace(/-/gi, '');
        module     = this.modeComboBox.getValue();

        if (module === 'exem_imx_aduma_was' || module === 'exem_mfo_aduma_db') {
            result = 'true';
            requestState = -1;
        } else {
            result = 'false';
            requestState = 0;
        }

        dataSet.sql_file = this.sql.learning_update;

        dataSet.replace_string = [{
            name    : 'targetList',
            value   : targetListStr
        }];
        dataSet.bind = [{
            name    : 'fromtime',
            value   : fromtime,
            type    : SQLBindType.STRING
        }, {
            name    : 'data_version',
            value   : dataVersion,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'totime',
            value   : totime,
            type    : SQLBindType.STRING
        }, {
            name    : 'module',
            value   : module,
            type    : SQLBindType.STRING
        }, {
            name    : 'requestState',
            value   : requestState,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'result',
            value   : result,
            type    : SQLBindType.STRING
        }];

        if (nonTargetArr && nonTargetArr.length > 0) {
            for (ix = 0, ixLen = nonTargetArr.length; ix < ixLen; ix++) {
                msg += this.targetInfo[nonTargetArr[ix]] + '<br>';

                if (ix === nonTargetArr.length - 1) {
                    msg += common.Util.TR('The target is not registered because there is no data in the learning scope.') + '<br>';
                    msg += common.Util.TR('Do you want to apply?');
                }
            }

            Ext.MessageBox.confirm(common.Util.TR(''), common.Util.TR(msg), function(btn) {
                if (btn === 'yes') {
                    WS.SQLExec(dataSet, function() {
                        this.apply_check(targetArr);
                    }.bind(this));
                }
            }.bind(this));
        } else {
            WS.SQLExec(dataSet, function() {
                this.apply_check(targetArr);
            }.bind(this));
        }
    },

    apply_check: function(targetList) {
        var ix, ixLen, dataSet = {};

        var insertSet = {}, autoInsertSet = {};
        var target_check, target, fromtime, totime, dataVersion, module, result, requestState;

        dataSet.sql_file = this.sql.learning_check;

        for (ix = 0, ixLen = targetList.length; ix < ixLen; ix++) {
            target_check = targetList[ix];
            targetList.push(target_check);

            dataSet.bind = [{
                name    : 'module',
                value   : this.modeComboBox.getValue(),
                type    : SQLBindType.STRING
            }, {
                name    : 'target',
                value   : target_check,
                type    : SQLBindType.STRING
            }];


            WS.SQLExec(dataSet, function(header, data) {
                if (!common.Util.checkSQLExecValid(header, data)) {
                    console.warn('config_ai_learning_setting-apply_check');
                    console.debug(header);
                    console.debug(data);
                    return;
                }

                if (!+data.rows[0]) {
                    insertSet.sql_file = this.sql.learning_insert;

                    target = header.parameters.bind[1].value;
                    fromtime   = this.datePicker.getFromDateTime();
                    dataVersion = fromtime.replace(/-/gi, '');
                    totime     = this.datePicker.getToDateTime();
                    module     = this.modeComboBox.getValue();

                    if (module === 'exem_imx_aduma_was' || module === 'exem_mfo_aduma_db') {
                        result = 'true';
                        requestState = -1;
                    } else {
                        result = 'false';
                        requestState = 0;

                        autoInsertSet.sql_file = this.sql.learning_auto_insert;

                        autoInsertSet.bind = [{
                            name    : 'target',
                            value   : target,
                            type    : SQLBindType.STRING
                        }, {
                            name    : 'module',
                            value   : module,
                            type    : SQLBindType.STRING
                        }, {
                            name    : 'requestState',
                            value   : requestState,
                            type    : SQLBindType.INTEGER
                        }];

                        WS2.SQLExec(autoInsertSet, function() {}.bind(this));
                    }

                    insertSet.bind = [{
                        name    : 'target',
                        value   : target,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'module',
                        value   : module,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'dataVersion',
                        value   : dataVersion,
                        type    : SQLBindType.INTEGER
                    }, {
                        name    : 'fromtime',
                        value   : fromtime,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'totime',
                        value   : totime,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'result',
                        value   : result,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'requestState',
                        value   : requestState,
                        type    : SQLBindType.INTEGER
                    }];

                    WS2.SQLExec(insertSet, function(aheader) {
                        if (aheader && aheader.success === false) {
                            Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Change Failed'));
                        } else {
                            Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Change Success'));
                        }
                        this.onData();
                    }.bind(this));
                } else {
                    if (header && header.success === false) {
                        Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Change Failed'));
                    } else {
                        Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Change Success'));
                    }
                    this.onData();
                }
            }.bind(this));
        }
    }
});
