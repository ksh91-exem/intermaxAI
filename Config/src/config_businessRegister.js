Ext.define('config.config_businessRegister', {
    extend: 'Exem.Form',

    sql: {
        getBizName          : 'IMXConfig_Get_Business_Name.sql',
        getMaxBizName       : 'IMXConfig_Get_Max_Business_Name_Id.sql',
        bizNameInsert       : 'IMXConfig_Business_Name_Insert.sql',
        bizNameUpdate       : 'IMXConfig_Business_Name_Update.sql',
        bizNameDelete       : 'IMXConfig_Business_Name_Delete.sql',
        bizNameAllDelete    : 'IMXConfig_Business_Name_All_Delete.sql',
        metaDataInsert      : 'IMXConfig_Meta_Data_Insert.sql',
        wasInfo             : 'IMXConfig_WasInfo.sql',
        bizValueInsert      : 'IMXConfig_Business_Value_Insert.sql',
        bizValueDelete      : 'IMXConfig_Business_Value_Delete.sql',
        bizValueSelectList  : 'IMXConfig_Business_Value_Select_List.sql'
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    initProperty: function() {
        this.initFlag = false;
        this.refDisableFlag = false;
        this.radioCheckValue = 'TR';
    },

    init: function(target) {
        this.initProperty();
        this.initLayout(target);
        this.initTreeSetting();
    },

    initLayout: function(target) {
        var panel = Ext.create('Ext.panel.Panel', {
            layout  : 'center',
            width   : 837,
            flex    : 1,
            border  : false
        });

        var vBoxPanel = Ext.create('Ext.panel.Panel', {
            layout  : 'vbox',
            height  : '100%',
            flex    : 1,
            border  : true,
            bodyStyle : { background: '#eeeeee' }
        });

        var hBoxPanel = Ext.create('Ext.panel.Panel', {
            layout  : 'hbox',
            flex    : 1,
            border  : false,
            bodyStyle : { background: '#eeeeee' }
        });

        var toolBar = this.createToolBar();
        var tree = this.createTree();
        var nodeData = this.createNodeData();


        hBoxPanel.add(tree, nodeData);
        vBoxPanel.add(toolBar, hBoxPanel);
        panel.add(vBoxPanel);
        target.add(panel);
    },

    createToolBar: function() {
        var self = this;

        var toolBar = Ext.create('Ext.toolbar.Toolbar', {
            width   : '100%',
            height  : 30,
            border  : false,
            items: [{
                html     : '<img src="../images/cfg_add.png" width="15" height="15">',
                id       : 'cfg_biz_add',
                disabled : true,
                handler  : function() {
                    self.enrollmentWindow(self.currentRecode, 'add');
                }
            }, {
                html     : '<img src="../images/cfg_edit.png" width="15" height="15">',
                id       : 'cfg_biz_edit',
                disabled : true,
                handler  : function() {
                    self.enrollmentWindow(self.currentRecode, 'edit');
                }
            }, {
                html     : '<img src="../images/cfg_delete.png" width="15" height="15">',
                id       : 'cfg_biz_delete',
                disabled : true,
                handler  : function() {
                    Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                        if (btn === 'yes') {
                            self.deleteDataTree(self.currentRecode);
                            Ext.getCmp('cfg_biz_add').setDisabled(true);
                            Ext.getCmp('cfg_biz_edit').setDisabled(true);
                            Ext.getCmp('cfg_biz_delete').setDisabled(true);
                        }
                    });
                }
            }, '-', {
                html     : '<img src="../images/cfg_refresh.png" width="15" height="15">',
                handler  : function() {
                    if (!self.refDisableFlag) {
                        self.refDisableFlag = true;
                        Ext.getCmp('cfg_biz_add').setDisabled(true);
                        Ext.getCmp('cfg_biz_edit').setDisabled(true);
                        Ext.getCmp('cfg_biz_delete').setDisabled(true);
                        self.initTreeSetting();
                        self.setNodeDetailData(self.radioCheckValue, null);
                    }
                }
            }]
        });

        /**
         * 해당 메뉴는 아직 미개발 메뉴(해당 부분을 클릭시 엑셀로 구성된 파일을 읽어서 셋팅을 해줄수 있는 부분)
         * @type {Exem.Button}
         */
        this.bizBatchRegister = Ext.create('Exem.Button', {
            width   : (Comm.Lang === 'ko' || window.nation === 'ko') ? 100 : 150,
            margin  : '0 0 0 15',
            text    : common.Util.usedFont(9, common.Util.TR('Business Batch Register')),
            cls     : 'x-btn-default-small',
            style   : {
                'border-color' : '#bbb'
            }
        });

        this.bizCodeApplyUnits = Ext.create('Exem.FieldContainer', {
            width       : 320,
            defaultType : 'radiofield',
            layout      : 'hbox',
            itemId      : 'bizCodeApplyUnits',
            labelWidth  : 145,
            labelAlign  : 'right',
            margin      : (Comm.Lang === 'ko' || window.nation === 'ko') ? '0 0 0 38' : '0 0 0 10',
            fieldLabel  : common.Util.TR('Business Code Unit'),
            items       : [{
                boxLabel    : common.Util.TR('Transaction'),
                width       : 85,
                itemId      : 'bizCodeTransaction',
                name        : this.id + '_unit',
                checked     : true,
                inputValue  : 'TR',
                listeners   : {
                    change : function(me, newValue) {
                        if (newValue && self.radioCheckValue === 'INST' && self.initFlag) {
                            self.changeEvent('codeApply');
                        }
                    }
                }
            }, {
                boxLabel    : common.Util.TR('Instance'),
                width       : 85,
                itemId      : 'bizCodeInstance',
                name        : this.id + '_unit',
                inputValue  : 'INST',
                listeners   : {
                    change : function(me, newValue) {
                        if (newValue && self.radioCheckValue === 'TR' && self.initFlag) {
                            self.changeEvent('codeApply');
                        }
                    }
                }
            }]
        });

        this.bizCodeRule = Ext.create('Exem.ComboBox', {
            width       : 200,
            labelWidth  : 115,
            labelAlign  : 'right',
            fieldLabel  : common.Util.TR('Business Code Rule') + ' :',
            store       : Ext.create('Exem.Store'),
            editable    : false,
            cls         : 'config_tab',
            listeners   : {
                change : function(me, newValue, oldValue) {
                    if (newValue !== self.chagneValue && self.initFlag) {
                        self.changeEvent('codeRoll', me, newValue, oldValue);
                    }
                }
            }
        });

        this.bizCodeRule.addItem('CO'   , 'contains');
        this.bizCodeRule.addItem('EQ'   , 'equal');
        this.bizCodeRule.addItem('ST'   , 'start with');

        toolBar.add(this.bizBatchRegister, this.bizCodeApplyUnits, this.bizCodeRule);

        return toolBar;
    },

    createTree: function() {
        var self = this;

        var treePanel = Ext.create('Ext.panel.Panel', {
            layout      : 'center',
            cls         : 'x-config-used-round-panel',
            height      : '100%',
            width       : 430,
            border      : false,
            split       : true
        });

        this.bizTree = Ext.create('Exem.BaseGrid',{
            width       : '100%',
            height      : '100%',
            useArrows   : false,
            gridType    : Grid.exTree,
            hideGridHeader  : true,
            cellclick: function(me, td, cellIndex, recode, tr, rowIndex) {
                self.currentRecode = recode;
                Ext.getCmp('cfg_biz_add').setDisabled(false);

                if (!rowIndex) {
                    Ext.getCmp('cfg_biz_edit').setDisabled(true);
                    Ext.getCmp('cfg_biz_delete').setDisabled(true);
                } else {
                    Ext.getCmp('cfg_biz_edit').setDisabled(false);
                    Ext.getCmp('cfg_biz_delete').setDisabled(false);
                }

                if (!cellIndex) {
                    self.setNodeDetailData(self.radioCheckValue, recode.data.bizId);
                }
            }
        });

        this.addTreeColumn(this.bizTree);

        treePanel.add(this.bizTree);

        return treePanel;
    },

    addTreeColumn: function(tree) {
        tree.beginAddColumns();
        tree.addColumn('Name', 'name', 400, Grid.String, true, false, 'treecolumn');
        tree.addColumn('Business ID', 'bizId', 50, Grid.Number, false, true);
        tree.endAddColumns();
    },

    createNodeData: function() {
        var nodeDataPanel = Ext.create('Ext.panel.Panel', {
            layout      : 'vbox',
            cls         : 'x-config-used-round-panel',
            height      : '100%',
            border      : false,
            split       : true,
            flex        : 1
        });

        this.txnDetailPanel = this.txnNodePanel();

        this.instDetailPanel = this.instNodePanel();

        nodeDataPanel.add(this.txnDetailPanel, this.instDetailPanel);

        return nodeDataPanel;
    },

    txnNodePanel: function() {
        var txnPanel = Ext.create('Ext.panel.Panel', {
            layout      : 'vbox',
            cls         : 'x-config-used-round-panel',
            width       : 385,
            height      : '100%',
            margin      : 4,
            flex        : 1,
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });

        var txnLabelPanel = Ext.create('Ext.panel.Panel', {
            layout      : 'absolute',
            width       : '100%',
            height      : 24,
            border      : false,
            bodyStyle   : { background: '#dddddd' }
        });

        var txnLabelText = Ext.create('Ext.form.Label', {
            x       : 5,
            y       : 4,
            text    : common.Util.TR('Transaction')
        });
        this.nodeBizCodeListGrid = Ext.create('Exem.adminGrid', {
            flex        : 1,
            width       : '100%',
            height      : '100%',
            border      : false,
            useCheckBox : false,
            rowNumber   : true,
            usePager    : false
        });

        this.nodeBizCodeListGrid.beginAddColumns();
        this.nodeBizCodeListGrid.addColumn({text: 'bizId',
            dataIndex: 'biz_id',        width: 100, type: Grid.Number,  alowEdit: false,    editMode: false, hide: true});
        this.nodeBizCodeListGrid.addColumn({text: common.Util.TR('Business Code'),
            dataIndex: 'biz_code',      width: 150, type: Grid.String,  alowEdit: false,    editMode: false});
        this.nodeBizCodeListGrid.addColumn({text: common.Util.TR('Rule Target'),
            dataIndex: 'rule_target',   width: 150, type: Grid.String,  alowEdit: false,    editMode: false});
        this.nodeBizCodeListGrid.endAddColumns();

        txnLabelPanel.add(txnLabelText);

        txnPanel.add(txnLabelPanel, this.nodeBizCodeListGrid);

        return txnPanel;
    },

    instNodePanel: function() {
        var instPanel = Ext.create('Ext.panel.Panel', {
            layout      : 'vbox',
            cls         : 'x-config-used-round-panel',
            width       : 385,
            height      : '100%',
            margin      : 4,
            flex        : 1,
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });

        var instLabelPanel = Ext.create('Ext.panel.Panel', {
            layout      : 'absolute',
            width       : '100%',
            height      : 24,
            border      : false,
            bodyStyle   : { background: '#dddddd' }
        });

        var labelText = Ext.create('Ext.form.Label', {
            x       : 5,
            y       : 4,
            text    : common.Util.TR('Instance')
        });

        this.nodeWasGrid = Ext.create('Exem.adminGrid', {
            flex        : 1,
            width       : '100%',
            height      : '100%',
            border      : false,
            useCheckBox : false,
            rowNumber   : true,
            usePager    : false
        });

        this.nodeWasGrid.beginAddColumns();
        this.nodeWasGrid.addColumn({text: common.Util.TR('Agent ID')  ,  dataIndex: 'was_id',   width: 100, type: Grid.Number, alowEdit: false, editMode: false});
        this.nodeWasGrid.addColumn({text: common.Util.TR('Agent Name'),  dataIndex: 'was_name', width: 200, type: Grid.String, alowEdit: false, editMode: false});
        this.nodeWasGrid.endAddColumns();

        instLabelPanel.add(labelText);

        instPanel.add(instLabelPanel, this.nodeWasGrid);

        return instPanel;
    },

    initTreeSetting: function() {
        var dataSet = {};

        this.addRootTree();

        dataSet.sql_file = 'IMXConfig_Get_Business_Name.sql';

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            var ix, ixLen;
            var bizId, bizName, parentId, level;
            var bizNameData = adata[0].rows;
            var bizMeta = adata[1].rows;
            this.upperNodeList = [];

            for (ix = 0, ixLen = bizNameData.length; ix < ixLen; ix++) {
                bizId    = bizNameData[ix][0];
                bizName  = bizNameData[ix][1];
                parentId = bizNameData[ix][2];
                level    = bizNameData[ix][3];
                this.addTreeData(bizId, bizName, parentId, level);
            }
            this.endTree();

            if (bizMeta.length) {
                this.metaDataSetting(bizMeta[0][0], bizMeta[0][1]);
            } else {
                this.initFlag = true;
                this.instDetailPanel.hide();
            }
            this.refDisableFlag = false;
        }, this);
    },

    metaDataSetting: function(type, rule) {
        if (type === 'TR') {
            this.radioCheckValue = 'TR';
            this.bizCodeApplyUnits.items.items[0].setValue(true);
            this.bizCodeRule.selectByName(rule);
            this.instDetailPanel.hide();
        } else if (type === 'INST') {
            this.radioCheckValue = 'INST';
            this.bizCodeApplyUnits.items.items[1].setValue(true);
            this.bizCodeRule.setDisabled(true);
            this.txnDetailPanel.hide();
        }
        this.initFlag = true;
    },

    addRootTree: function() {
        this.bizTree.clearNodes();
        this.bizTree.beginTreeUpdate();

        this.rootNode = this.bizTree.addNode(null, [
            common.Util.TR('Business Register'),
            null
        ]);
    },

    addTreeData: function(bizId, bizName, parentId, level) {
        var ix, ixLen;
        var currentNode, upperBizId;

        if (level === 1) {
            currentNode = this.bizTree.addNode(this.rootNode, [
                bizName,
                bizId
            ]);
            this.upperNodeList.push(currentNode);
        }

        if (parentId) {
            for ( ix = 0, ixLen = this.upperNodeList.length; ix < ixLen; ix++) {
                upperBizId = this.upperNodeList[ix].bizId;

                if (parentId === upperBizId) {
                    currentNode = this.bizTree.addNode(this.upperNodeList[ix], [
                        bizName,
                        bizId
                    ]);
                }
            }
            this.upperNodeList.push(currentNode);
        }
    },

    endTree: function() {
        this.bizTree.endTreeUpdate();
        this.bizTree.drawTree();
    },

    changeEvent: function(area, me, newValue, oldValue) {
        var self = this;

        Ext.MessageBox.confirm(common.Util.TR('Message'), common.Util.TR('If you change a business unit, all existing rules will be deleted. Do you want to change it?'), function(btn) {
            if (btn === 'yes') {
                if (self.radioCheckValue === 'TR' && area === 'codeApply') {
                    self.radioCheckValue = 'INST';
                    self.bizCodeRule.setDisabled(true);
                    self.instDetailPanel.show();
                    self.txnDetailPanel.hide();
                } else if (self.radioCheckValue === 'INST' && area === 'codeApply') {
                    self.radioCheckValue = 'TR';
                    self.bizCodeRule.setDisabled(false);
                    self.txnDetailPanel.show();
                    self.instDetailPanel.hide();
                } else if (area === 'codeRoll') {
                    self.chagneValue = newValue;
                }

                Ext.getCmp('cfg_biz_add').setDisabled(true);
                Ext.getCmp('cfg_biz_edit').setDisabled(true);
                Ext.getCmp('cfg_biz_delete').setDisabled(true);

                self.setNodeDetailData(self.radioCheckValue, null);

                self.allClearBizNodes();

                if (self.bizWindow) {
                    self.bizWindow.destroy();
                }
            }

            if (btn === 'no' ||  btn === 'cancel') {
                if (self.radioCheckValue === 'TR' && area === 'codeApply') {
                    self.radioCheckValue = 'TR';
                    self.bizCodeApplyUnits.items.items[0].setValue(true);
                } else if (self.radioCheckValue === 'INST' && area === 'codeApply') {
                    self.radioCheckValue = 'INST';
                    self.bizCodeApplyUnits.items.items[1].setValue(true);
                } else if (area === 'codeRoll') {
                    self.chagneValue = oldValue;
                    me.setValue(oldValue);
                }
            }
        });
    },

    allClearBizNodes: function() {
        var ix, ixLen;

        var topBizTree = this.bizTree.pnlExTree.getRootNode().childNodes[0];

        for (ix = 0, ixLen = topBizTree.childNodes.length; ix < ixLen; ix++) {
            topBizTree.childNodes[0].remove();
        }

        this.allClearBizData();
    },

    allClearBizData: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Name_All_Delete.sql';

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {}, this);
    },

    setNodeDetailData: function(radioType, bizId) {
        if (bizId) {
            this.bizCodeList(bizId, radioType, 'nodeDetail');
        } else {
            this.bizCodeList(0, radioType, 'nodeDetail');
        }
    },

    enrollmentWindow: function(recode, selectMode) {
        var bodyPanel, selectPanel, buttonCon;

        if (this.bizWindow) {
            this.bizWindow.destroy();
        }

        this.bizWindow = Ext.create('Exem.Window', {
            layout      : 'vbox',
            width       : 402,
            height      : 500,
            resizable   : false,
            maximizable : false,
            title       : (selectMode === 'add') ? common.Util.TR('Business Register') : common.Util.TR('Business Edit'),
            bodyStyle   : { background: '#f5f5f5' },
            closeAction : 'destroy'
        });

        this.bizNameField = Ext.create('Ext.form.field.Text', {
            width       : 380,
            labelWidth  : (Comm.Lang === 'ko' || window.nation === 'ko') ? 63 : 95,
            labelAlign  : 'right',
            maxLength   : 64,
            fieldLabel  : common.Util.TR('Business Name'),
            allowBlank  : false,
            margin      : '3 0 0 0',
            enforceMaxLength : true
        });

        bodyPanel = Ext.create('Ext.panel.Panel',{
            layout      : 'vbox',
            cls         : 'x-config-used-round-panel',
            width       : '100%',
            flex        : 1,
            margin      : 4,
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });


        selectPanel = this.addBodyPanel(bodyPanel, this.radioCheckValue, selectMode, recode.data.bizId);
        buttonCon = this.createButton(recode, selectMode);

        this.bizWindow.add(this.bizNameField, selectPanel, buttonCon);

        if (selectMode === 'add') {
            this.getBizMaxId();
        }

        if (selectMode === 'edit') {
            this.editDataSetting(recode.data.name, this.radioCheckValue, recode.data.bizId);
        }

        this.bizWindow.show();

        this.bizNameField.focus();
    },

    addBodyPanel: function(bodyPanel, radioType, selectMode, selectBizId) {
        var self = this;

        var gridCon, addBizCodeCon, addButton, deleteCon, deleteButton;

        var labelPanel = Ext.create('Ext.panel.Panel', {
            layout      : 'absolute',
            width       : '100%',
            height      : 24,
            border      : false,
            bodyStyle   : { background: '#dddddd' }
        });

        var labelText = Ext.create('Ext.form.Label', {
            x : 5,
            y : 4
        });

        labelPanel.add(labelText);

        gridCon = Ext.create('Exem.Container',{
            width   : '100%',
            flex    : 1
        });

        if (radioType === 'INST') {
            labelText.setText(common.Util.TR('Instance'));

            this.wasGrid = Ext.create('Exem.adminGrid', {
                flex        : 1,
                width       : '100%',
                height      : '100%',
                border      : false,
                checkMode   : Grid.checkMode.SIMPLE,
                rowNumber   : false,
                usePager    : false,
                showHeaderCheckbox: true
            });

            this.wasGrid.beginAddColumns();
            this.wasGrid.addColumn({text: common.Util.TR('Agent ID')  ,  dataIndex: 'was_id',   width: 100, type: Grid.Number, alowEdit: false, editMode: false});
            this.wasGrid.addColumn({text: common.Util.TR('Agent Name'),  dataIndex: 'was_name', width: 200, type: Grid.String, alowEdit: false, editMode: false});
            this.wasGrid.endAddColumns();

            if (selectMode === 'add') {
                this.executeSQLWas('','addWindow');
            }

            gridCon.add(this.wasGrid);
            bodyPanel.add( labelPanel, gridCon );
        } else if (radioType === 'TR') {
            labelText.setText(common.Util.TR('Transaction'));

            addBizCodeCon = Ext.create('Exem.Container',{
                layout  : 'hbox',
                margin  : 4,
                width   : '100%',
                height  : 30,
                border  : false
            });

            this.bizCode = Ext.create('Ext.form.field.Text', {
                width       : 287,
                labelWidth  : (Comm.Lang === 'ko' || window.nation === 'ko') ? 58 : 90,
                labelAlign  : 'right',
                maxLength   : 64,
                fieldLabel  : common.Util.TR('Business Code'),
                allowBlank  : true,
                margin      : '7 10 0 0',
                enforceMaxLength : true
            });

            addButton = Ext.create('Ext.button.Button', {
                text    : common.Util.TR('Add'),
                cls     : 'x-btn-config-default',
                width   : 70,
                margin  : '7 0 0 0',
                listeners: {
                    click: function() {
                        var bizId;
                        var bizCode = self.bizCode.getValue();
                        var codeType = self.bizCodeRuleTarget.getCheckedValue();

                        // bizName을 체크 하지 않고 bizCode의 중복만 체크
                        if (!self.valueCheck(null, bizCode, radioType, 'addBtn')) {
                            return;
                        }

                        if (selectMode === 'add') {
                            bizId = self.maxBizId;
                        } else if (selectMode === 'edit') {
                            bizId = selectBizId;
                        }

                        if (codeType === 'TX') {
                            codeType = common.Util.TR('TX Code Name');
                        } else if (codeType === 'TN') {
                            codeType = common.Util.TR('Transaction');
                        }

                        self.bizCodeListGrid.addRow([
                            bizId,
                            bizCode,
                            codeType
                        ]);

                        self.bizCodeListGrid.drawGrid();
                    }
                }
            });

            addBizCodeCon.add(this.bizCode, addButton);

            this.bizCodeRuleTarget = Ext.create('Exem.FieldContainer', {
                defaultType : 'radiofield',
                layout      : 'hbox',
                itemId      : 'bizCodeRuleTarget',
                labelWidth  : (Comm.Lang === 'ko' || window.nation === 'ko') ? 135 : 153,
                labelAlign  : 'right',
                margin      : '6 0 2 4',
                fieldLabel  : common.Util.TR('Business Code Rule Target'),
                items : [{
                    boxLabel    : common.Util.TR('Transaction'),
                    width       : 85,
                    name        : this.id + '_target',
                    itemId      : 'bizCodeTargetTxn',
                    inputValue  : 'TN',
                    checked     : true
                }, {
                    boxLabel    : common.Util.TR('TX Code Name'),
                    width       : 100,
                    name        : this.id + '_target',
                    itemId      : 'bizCodeTargetTXCode',
                    inputValue  : 'TX'
                }]
            });

            this.bizCodeListGrid = Ext.create('Exem.adminGrid', {
                flex        : 1,
                margin      : '4 4 0 4',
                width       : '100%',
                height      : '100%',
                border      : false,
                checkMode   : Grid.checkMode.SIMPLE,
                rowNumber   : false,
                usePager    : false
            });

            this.bizCodeListGrid.beginAddColumns();
            this.bizCodeListGrid.addColumn({text: 'bizId',
                dataIndex: 'biz_id',        width: 100, type: Grid.Number,  alowEdit: false,    editMode: false, hide: true});
            this.bizCodeListGrid.addColumn({text: common.Util.TR('Business Code'),
                dataIndex: 'biz_code',      width: 150, type: Grid.String,  alowEdit: false,    editMode: false});
            this.bizCodeListGrid.addColumn({text: common.Util.TR('Rule Target'),
                dataIndex: 'rule_target',   width: 150, type: Grid.String,  alowEdit: false,    editMode: false});
            this.bizCodeListGrid.endAddColumns();

            gridCon.add(this.bizCodeListGrid);

            deleteCon = Ext.create('Exem.Container',{
                layout  : {
                    type    : 'hbox',
                    pack    : 'center',
                    align   : 'middle'
                },
                width   : '100%',
                height  : 30,
                border  : false,
                bodyStyle: { background: '#f5f5f5' }
            });

            deleteButton = Ext.create('Ext.button.Button', {
                text    : common.Util.TR('Delete'),
                cls     : 'x-btn-config-default',
                width   : 70,
                listeners: {
                    click: function() {
                        var ix, ixLen;
                        var deleteRowList = self.bizCodeListGrid.getSelectedRow();

                        for (ix = 0, ixLen = deleteRowList.length; ix < ixLen; ix++) {
                            self.bizCodeListGrid.deleteRecords([deleteRowList[ix]]);
                        }
                    }
                }
            });

            deleteCon.add(deleteButton);

            bodyPanel.add(labelPanel, addBizCodeCon, this.bizCodeRuleTarget, this.bizCodeListGrid, deleteCon);
        }

        return bodyPanel;
    },

    createButton: function(recode, selectMode) {
        var self = this;

        var buttonCon = Ext.create('Exem.Container',{
            layout  : {
                type    : 'hbox',
                pack    : 'center',
                align   : 'middle'
            },
            width   : '100%',
            height  : 25,
            border  : false,
            bodyStyle: { background: '#f5f5f5' }
        });

        var saveButton = Ext.create('Ext.button.Button', {
            text    : common.Util.TR('Save'),
            cls     : 'x-btn-config-default',
            width   : 70,
            margin  : '0 2 0 0',
            listeners: {
                click: function() {
                    if (selectMode === 'add') {
                        self.bizInsertData(recode, self.maxBizId);
                    } else if (selectMode === 'edit') {
                        self.bizEditData(recode, self.radioCheckValue);
                    }
                }
            }
        });

        this.cancelButton = Ext.create('Ext.button.Button', {
            text    : common.Util.TR('Cancel'),
            cls     : 'x-btn-config-default',
            width   : 70,
            margin  : '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        buttonCon.add(saveButton, this.cancelButton);

        return buttonCon;
    },

    bizValueInsert: function(currentBizId, selectMode, radioType) {
        var self = this;
        var ix, ixLen, rowData, codeType;
        var deleteDataSet = {}, insertDataSet = {};

        var insertSQL = function(_dataSet) {
            WS.SQLExec(_dataSet, function() {
                var endCount;
                self.startCount++;
                if (radioType === 'TR') {
                    endCount = self.bizCodeListGrid.getRowCount();
                }

                if (radioType === 'INST') {
                    endCount = self.wasGrid.getSelectedRow().length;
                }

                if (self.startCount === endCount) {
                    if (selectMode === 'edit') {
                        self.setNodeDetailData(radioType, currentBizId);
                    }
                    self.cancelButton.fireEvent('click');
                }
            },this);
        };

        this.startCount = 0;

        if (common.Util.isMultiRepository()) {
            deleteDataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        deleteDataSet.sql_file = 'IMXConfig_Business_Value_Delete.sql';
        deleteDataSet.bind = [{
            name    : 'business_id',
            value   : currentBizId,
            type    : SQLBindType.INTEGER
        }];

        WS.SQLExec(deleteDataSet, function() {
            var selectRowCount, bizCode;

            insertDataSet.sql_file = 'IMXConfig_Business_Value_Insert.sql';

            if (common.Util.isMultiRepository()) {
                insertDataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            if (radioType === 'TR') {
                for (ix = 0, ixLen = this.bizCodeListGrid.getRowCount(); ix < ixLen; ix++) {
                    rowData = this.bizCodeListGrid.getRow(ix).data;

                    if (rowData.rule_target === common.Util.TR('TX Code Name')) {
                        codeType = 'TX';
                    } else if (rowData.rule_target === common.Util.TR('Transaction')) {
                        codeType = 'TN';
                    } else {
                        codeType = rowData.rule_target;
                    }

                    insertDataSet.bind = [{
                        name    : 'business_id',
                        value   : currentBizId,
                        type    : SQLBindType.INTEGER
                    }, {
                        name    : 'code_type',
                        value   : codeType,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'business_code',
                        value   : rowData.biz_code,
                        type    : SQLBindType.STRING
                    }];

                    insertSQL(insertDataSet);
                }

                if (!this.bizCodeListGrid.getRowCount()) {
                    self.cancelButton.fireEvent('click');
                }
            }

            if (radioType === 'INST') {
                selectRowCount = this.wasGrid.getSelectedRow().length;

                for ( ix = 0, ixLen = selectRowCount; ix < ixLen; ix++ ) {
                    bizCode = this.wasGrid.getSelectedRow()[ix].data.was_id;

                    insertDataSet.bind = [{
                        name    : 'business_id',
                        value   : currentBizId,
                        type    : SQLBindType.INTEGER
                    }, {
                        name    : 'code_type',
                        value   : 'INST',
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'business_code',
                        value   : bizCode,
                        type    : SQLBindType.STRING
                    }];

                    insertSQL(insertDataSet);
                }

                if (!selectRowCount) {
                    self.cancelButton.fireEvent('click');
                }
            }

        },this);
    },

    bizCodeList: function(bizId, radioType, loadType) {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Value_Select_List.sql';

        dataSet.bind = [{
            name    : 'business_id',
            value   : bizId,
            type    : SQLBindType.INTEGER
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            var ix, ixLen, codeType, grid, dataRows,
                andList, wasList = [];

            if (radioType === 'TR') {
                if (loadType === 'nodeDetail') {
                    grid = this.nodeBizCodeListGrid;
                } else if (loadType === 'editNodeWindow') {
                    grid = this.bizCodeListGrid;
                } else {
                    return;
                }

                grid.clearRows();

                for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                    dataRows = adata.rows[ix];

                    if (dataRows[2] === 'TN') {
                        codeType = common.Util.TR('Transaction');
                    } else if (dataRows[2] === 'TX') {
                        codeType = common.Util.TR('TX Code Name');
                    }

                    grid.addRow([
                        dataRows[0], // business_id
                        dataRows[1], // business_code
                        codeType
                    ]);
                }

                grid.drawGrid();
            }

            if (radioType === 'INST') {
                for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                    wasList.push(adata.rows[ix][1]); // business_code
                }

                if (loadType === 'editNodeWindow') {
                    this.executeSQLWas( '', loadType, wasList);
                } else if (loadType === 'nodeDetail') {
                    wasList = wasList.join();

                    if (!adata.rows.length) {
                        wasList = null;
                    }

                    andList = 'and was_id in (' + wasList + ')';
                    this.executeSQLWas(andList, loadType);
                }
            }

        },this);
    },

    executeSQLWas: function(andList, loadType, selectList) {
        var dataSet = {};
        var whereList = 'was_name is not null ';
        var orderBy = 'order by was_id';

        whereList = whereList + andList;

        dataSet.sql_file = 'IMXConfig_WasInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            var ix, ixLen, jx, jxLen, rowData, grid;

            if (loadType === 'nodeDetail') {
                grid = this.nodeWasGrid;
            } else if (loadType === 'addWindow' || loadType === 'editNodeWindow') {
                grid = this.wasGrid;
            } else {
                return;
            }

            grid.clearRows();

            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                grid.addRow([
                    adata.rows[ix][0],  // Was_ID
                    adata.rows[ix][1]   // Was_Name
                ]);
            }

            grid.drawGrid();

            if (loadType === 'editNodeWindow') {
                for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                    rowData = this.wasGrid.getRow(ix).data;
                    for (jx = 0, jxLen = selectList.length; jx < jxLen; jx++) {
                        if (rowData.was_id === +selectList[jx]) {
                            this.wasGrid.selectRow(ix, true);
                        }
                    }
                }
            }

        }, this);
    },

    getBizMaxId: function() {
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Get_Max_Business_Name_Id.sql';

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.maxBizId = adata.rows[0][0];
        }, this);
    },

    bizInsertData: function(recode, maxBizId) {
        var treeKey = null;
        var bizName = this.bizNameField.getValue();
        var radioType = this.bizCodeApplyUnits.getCheckedValue();
        var treePath = [];

        treePath.push(maxBizId);

        if (!recode.data.bizId) {
            treeKey = treePath.join('-');
        } else {
            treeKey = this.getTreePath(recode, treePath);
        }

        // bizName Check
        if (radioType === 'TR' && !this.valueCheck(bizName, null, radioType)) {
            return;
        }

        // bizName 및 bizCode(그리드 선택하지 않을 경우) 체크
        if (radioType === 'INST' && !this.valueCheck(bizName, this.wasGrid.getSelectedRow().length, radioType)) {
            return;
        }

        this.bizNameInsert(recode, maxBizId, bizName, radioType, treeKey);
    },

    getTreePath: function(recode, treePath) {
        if (!recode.parentNode.data.bizId) {
            treePath.push(recode.data.bizId);
            treePath.reverse();
        } else {
            treePath.push(recode.data.bizId);
            this.getTreePath(recode.parentNode, treePath);
        }

        return treePath.join('-');
    },

    bizNameInsert: function(recode, maxBizId, bizName, radioType, treeKey) {
        var dataSet = {};

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        dataSet.sql_file = 'IMXConfig_Business_Name_Insert.sql';

        dataSet.bind = [{
            name    : 'business_id',
            value   : maxBizId,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'business_name',
            value   : bizName,
            type    : SQLBindType.STRING
        }, {
            name    : 'parent_id',
            value   : recode.data.bizId,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'level',
            value   : recode.data.depth,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'tree_key',
            value   : treeKey,
            type    : SQLBindType.STRING
        }, {
            name    : 'lasted',
            value   : 1,
            type    : SQLBindType.INTEGER
        },{
            name    : 'update_parent_id',
            value   : (recode.data.bizId) ? recode.data.bizId : 0,
            type    : SQLBindType.INTEGER
        }];

        WS.SQLExec(dataSet, function() {
            this.metaDataInsert();
            this.bizValueInsert(maxBizId, 'add', radioType);
            this.addTree(recode, bizName, maxBizId);
        }, this);
    },

    valueCheck: function(bizName, bizCode, radioType, checkType)  {
        var ix, ixLen, rowDataBizCode;

        // addBtn 일 경우, bizName 체크 하지 않음
        if (!bizName && checkType !== 'addBtn') {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter your business name.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            this.bizNameField.focus();
            return false;
        }

        // addBtn 일 경우, bizCode 체크
        if (!bizCode && checkType === 'addBtn') {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter your business code.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            this.bizCode.focus();
            return false;
        }

        // 인스턴스일 경우 체크
        if (!bizCode && radioType === 'INST') {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select instance.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // addBtn 일 경우, 추가 체크
        if (checkType === 'addBtn') {
            for (ix = 0, ixLen = this.bizCodeListGrid.getRowCount(); ix < ixLen; ix++) {
                rowDataBizCode = this.bizCodeListGrid.getRow(ix).data.biz_code;

                if (rowDataBizCode === bizCode) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Duplicate Business Code.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
                    this.bizCode.focus();
                    return false;
                }
            }
        }

        return true;
    },

    metaDataInsert: function() {
        var dataSet = {};
        var rule;
        dataSet.sql_file = 'IMXConfig_Meta_Data_Insert.sql';

        if (this.bizCodeApplyUnits.getCheckedValue() === 'INST') {
            rule = null;
        } else {
            rule = this.bizCodeRule.getValue();
        }

        dataSet.bind = [{
            name    : 'type',
            value   : this.bizCodeApplyUnits.getCheckedValue(),
            type    : SQLBindType.STRING
        }, {
            name    : 'rule',
            value   : rule,
            type    : SQLBindType.STRING
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {}, this);
    },

    addTree: function(node, name, id) {
        node.appendChild({
            name        : name,
            bizId       : id,
            expandable  : false
        });

        if (node.childNodes) {
            node.data.expandable = true;
        }

        this.bizTree.pnlExTree.expandAll();
    },

    editDataSetting: function(bizName, radioType, selectBizId) {
        this.bizNameField.setValue(bizName);

        this.bizCodeList(selectBizId, radioType, 'editNodeWindow');
    },

    bizEditData: function(recode, radioType) {
        var bizName = this.bizNameField.getValue();
        var updateId = recode.data.bizId;

        // bizName Check
        if (radioType === 'TR' && !this.valueCheck(bizName, null, radioType)) {
            return;
        }

        // bizName 및 bizCode(그리드 선택하지 않을 경우) 체크
        if (radioType === 'INST' && !this.valueCheck(bizName, this.wasGrid.getSelectedRow().length, radioType)) {
            return;
        }
        this.bizNameUpdate(recode, updateId, bizName, radioType);
    },

    bizNameUpdate: function(node, updateId, bizName, radioType) {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Name_Update.sql';
        dataSet.bind = [{
            name    : 'bizName',
            value   : bizName,
            type    : SQLBindType.STRING
        }, {
            name    : 'bizId',
            value   : updateId,
            type    : SQLBindType.INTEGER
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            node.set('name', bizName, {'dirty': false});
            this.bizValueInsert(updateId, 'edit', radioType);
        },this);
    },

    deleteDataTree: function(node) {
        var ix, ixLen;
        var deleteList = [];

        for (ix = 0, ixLen = node.childNodes.length; ix < ixLen; ix++) {
            deleteList = this.deleteChildAllList(node.childNodes[ix], deleteList);
        }

        deleteList.push(node.data.bizId);

        this.deleteNodeData(deleteList.join(), node);
    },

    deleteChildAllList: function(childNode, deleteList) {
        var ix, ixLen;
        var childChildNodes = childNode.childNodes;

        deleteList.push(childNode.data.bizId);

        for (ix = 0, ixLen = childChildNodes.length; ix < ixLen; ix++) {
            if (childChildNodes[ix].childNodes.length) {
                this.deleteChildAllList(childChildNodes[ix], deleteList);
            } else {
                deleteList.push(childChildNodes[ix].data.bizId);
            }
        }

        return deleteList;
    },

    deleteNodeData: function(deleteList, node) {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Name_Delete.sql';

        if (node.parentNode.childNodes.length === 1) {
            dataSet.bind = [{
                name    : 'update_parent_id',
                value   : (node.parentNode.data.bizId) ? node.parentNode.data.bizId : 0,
                type    : SQLBindType.INTEGER
            }];
        } else {
            dataSet.bind = [{
                name    : 'update_parent_id',
                value   : -1,
                type    : SQLBindType.INTEGER
            }];
        }

        dataSet.replace_string = [{
            name    : 'business_id',
            value   : deleteList
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            this.deleteTree(node);
        }, this);
    },

    deleteTree: function(node) {
        if (node.parentNode.childNodes.length === 1) {
            node.parentNode.data.expandable = false;
        }

        node.remove();

        this.bizTree.pnlExTree.expandAll();
    }
});