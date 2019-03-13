Ext.define('config.config_blockSettings', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    target: undefined,

    constructor: function() {
        this.superclass.constructor.call(this, config);
    },

    init: function(target) {

        this.target = target;

        this.changeData = [];

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: 900,
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            listeners: {
                scope: this,
                beforedestroy: function() {
                    if (this.validateWindow != null) {
                        this.validateWindow.close();
                    }
                }
            }
        });

        var blockListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var searchBusinessComboBox = Ext.create('Exem.AjaxComboBox',{
            x: 90,
            y: 3,
            width: 250,
            data: [],
            enableKeyEvents: true,
            hideTrigger: true,
            forceSelection: false,
            cls: 'config_tab',
            listeners: {
                scope: this,
                select: function(combo, selection) {
                    this.searchBusinessName = selection.get('value');

                    if (this.searchBusinessName == null) {
                        this.searchBusinessName = '';
                    }
                },
                change: function(combo) {
                    if (combo.getValue() == null) {
                        this.searchBusinessName = '';
                        combo.reset();
                    } else {
                        this.searchBusinessName = combo.getValue();
                    }
                },
                blur: function(combo) {
                    this.searchBusinessName = combo.getValue();
                },
                keydown: function(combo, e) {
                    if (e.keyCode === Ext.event.Event.ENTER) {
                        this.searchBusinessName = combo.getValue();
                        this.executeSQL();
                    }
                }
            }
        });

        var blockListTitlePanel = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                xtype: 'toolbar',
                flex: 1,
                height: 30,
                border: false,
                items: [{
                    xtype: 'label',
                    width: (Comm.Lang == 'en'? 90: Comm.Lang == 'ja'? 60 : 65),
                    style: 'text-align:left;',
                    html: Comm.RTComm.setFont(9, common.Util.TR('Business Name'))
                },
                    searchBusinessComboBox,
                    {
                        xtype: 'button',
                        width: 70,
                        cls: 'x-btn-config-default',
                        itemId: 'cfg_block_search_button',
                        text: Comm.RTComm.setFont(9, common.Util.CTR('Retrieve')),
                        margin: '0 5 0 10',
                        scope: this,
                        handler: function() {
                            this.executeSQL();
                        }
                    }, {
                        xtype: 'checkbox',
                        width: (Comm.Lang == 'en'? 240: Comm.Lang == 'ja'? 180:185),
                        itemId: 'cfg_block_search_option',
                        boxLabelAlign: 'after',
                        boxLabel: Comm.RTComm.setFont(9, common.Util.CTR('Only blocked business info is display')),
                        margin: '0 10 0 5',
                        inputValue: '0',
                        scope: this,
                        listeners: {
                            scope: this,
                            change: function(_this, newVal) {
                                this.searchBlockOnly = newVal;
                                this.executeSQL();
                            }
                        }
                    }, '->', {
                        html: '<img src="../images/cfg_save.png" width="15" height="15">',
                        itemId: 'config-save-button',
                        scope: this,
                        handler: function() {
                            this.applyRejectInfo();
                        }
                    }, {
                        html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                        scope: this,
                        handler: function() {
                            if (!this.isRefreshLoading) {
                                this.executeSQL();
                            }
                        }
                    }]
            }]
        });

        var blockListBodyPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        var gridpanel = Ext.create('Ext.panel.Panel', {
            height: '100%',
            width : '100%',
            layout: 'fit',
            flex: 1,
            border: false,
            bodyStyle: {
                background: '#ffffff'
            }
        });

        blockListPanel.add(blockListTitlePanel, blockListBodyPanel);
        blockListBodyPanel.add(gridpanel);
        panel.add(blockListPanel);

        this.target.add(panel);

        this.gridBlockList = Ext.create('Exem.adminTree', {
            cls: 'xm-config-toggle',
            width : '100%',
            height: '100%',
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: false,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            useEmptyText: true,
            bufferedRenderer: true,
            sortableColumns: false,
            emptyTextMsg: common.Util.TR('No data to display'),
            cellclick:function(thisGrid, td, cellIndex, record) {
                if (cellIndex == 6) {
                    if (record.get('reject_setting') == 0) {
                        record.set('reject_setting', 1);
                        record.set('modify', (record.get('reject_status') != record.get('reject_setting')));

                    } else {
                        record.set('reject_setting', 0);
                        record.set('modify', (record.get('reject_status') != record.get('reject_setting')));
                    }

                    if (record.data.depth > 0) {
                        if (record.hasChildNodes()) {
                            record.cascadeBy(function(n) {
                                if (n.get('reject_setting') != record.get('reject_setting')) {
                                    n.set('reject_setting', record.get('reject_setting'));
                                }
                                n.set('modify', (n.get('reject_status') != n.get('reject_setting')));
                            });
                        }
                        this.setParentState(record, record.get('reject_setting'));
                    }
                }
            },
            configRowClass: function(record){
                if (record.get('reject_status') != record.get('reject_setting')) {
                    if (record.get('reject_setting') == 0) {
                        return 'modify-row allow';
                    } else {
                        return 'modify-row reject';
                    }
                }
            }
        });
        gridpanel.add(this.gridBlockList);

        this.addBlockList();

        this.setBusinessList(searchBusinessComboBox);

        this.initValidateWindow();

        this.executeSQL();
    },

    addBlockList: function(){
        this.gridBlockList.beginAddColumns();
        this.gridBlockList.addColumn({text: common.Util.CTR('Business ID'),      dataIndex: 'business_id',    width:  80, type: Grid.StringNumber,   alowEdit: false, editMode: false, hide: true});
        this.gridBlockList.addColumn({text: common.Util.CTR('Business Name'),    dataIndex: 'business_name',  width: 210, type: Grid.tree  ,   alowEdit: false, editMode: false});
        this.gridBlockList.addColumn({text: common.Util.CTR('URL Pattern'),      dataIndex: 'url_pattern',    width: 210, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridBlockList.addColumn({text: common.Util.CTR('User ID'),          dataIndex: 'user_id',        width:  50, type: Grid.StringNumber,   alowEdit: false, editMode: false, hide: true});
        this.gridBlockList.addColumn({text: common.Util.CTR('Manager'),          dataIndex: 'user_name',      width:  90, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridBlockList.addColumn({text: common.Util.CTR('Reject Status'),    dataIndex: 'reject_status',  width:  90, type: Grid.String,   alowEdit: false, editMode: false,
            renderer: function (value) {
                if (value == 1) {
                    return '<span style="font-weight:bold;color:#e40b0b;">'+common.Util.TR('Reject')+'</span>';
                } else {
                    return '';
                }
            }
        });
        this.gridBlockList.addColumn({text: common.Util.CTR('Reject Settings'),  dataIndex: 'reject_setting', width: 110, type: Grid.String,   alowEdit: false, editMode: false,
            renderer: function(v, m, r) {

                if (r.get('reject_setting') == 0) {
                    return '<div class="x-toggle-slide-container" style="width: 92px;">' +
                        '<div style="left: 0px; z-index: 10000; width: 39px;" class="x-toggle-slide-thumb" ></div><div class="holder">' +
                        '<label class="x-toggle-slide-label-on" style="width: 68.5px; margin-left: -45px;"><span style="font-size:8pt;">'+common.Util.TR('Reject')+'</span></label>' +
                        '<label class="x-toggle-slide-label-off" style="width: 68.5px;"><span><span style="font-size:8pt;">'+common.Util.TR('Allow')+'</span></span></label></div></div>';
                } else {
                    return '<div class="x-toggle-slide-container" style="width: 92px;">' +
                        '<div style="left: 45px; z-index: 10000; width: 39px;" class="x-toggle-slide-thumb" ></div><div class="holder">' +
                        '<label class="x-toggle-slide-label-on" style="width: 68.5px; margin-left: 0px;"><span><span style="font-size:8pt;">'+common.Util.TR('Reject')+'</span></span></label>' +
                        '<label class="x-toggle-slide-label-off" style="width: 68.5px;"><span><span style="font-size:8pt;">'+common.Util.TR('Allow')+'</span></span></label></div></div>';
                }
            }
        });
        this.gridBlockList.addColumn({text: common.Util.CTR(''),  dataIndex: 'parent_id', width: 10, type: Grid.StringNumber,   alowEdit: false, editMode: false, hide: true, hideable: false});
        this.gridBlockList.endAddColumns();

        this.gridBlockList.setParentState = function(node, checkstate) {
            var count = 0;
            var isModify = false;

            node.parentNode.cascadeBy(function(child) {
                if (child.data.reject_setting == checkstate ) {
                    count++;
                }
            });

            if (count == node.data.children.length ) {
                node.set('reject_setting', checkstate);
                isModify = (node.get('reject_status') != node.get('reject_setting'));
                node.set('modify', isModify);

            } else if(count > 0 && node.get('reject_setting') != checkstate) {
                node.set('reject_setting', 0);
                isModify = (node.get('reject_status') != node.get('reject_setting'));
                node.set('modify', isModify);
            }

            if (node.data.depth > 1) {
                this.setParentState(node.parentNode, checkstate);
            }
        };
    },

    /**
     * Setting up business people name to be displayed in the combo box.
     * @private
     */
    setBusinessList: function(combo) {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Business_Name_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            var comboValues = [];
            if (adata != null) {
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    comboValues.push({ name: adata.rows[ix][0], value: adata.rows[ix][0]});
                }
            }
            combo.setData(comboValues);
            combo.setSearchField('name');

        }, this);
    },

    /**
     * Get the business information.
     */
    executeSQL: function() {
        this.isRefreshLoading = true ;

        var rejectStatus = null;

        if (this.searchBusinessName == null) {
            this.searchBusinessName = '';
        }

        if (this.searchBlockOnly) {
            rejectStatus = 'AND reject_status = 1';
        } else {
            rejectStatus = '';
        }

        WS.SQLExec({
            sql_file: 'IMXCFG_BusinessBlockInfo.sql',
            replace_string : [{
                name: 'reject_status',
                value: rejectStatus
            }]
        }, function(aheader, adata) {

            this.gridBlockList.clearNodes();

            this.isRefreshLoading = false;

            if (adata == null || adata.rows == null || adata.rows.length <= 0) {
                this.gridBlockList.showEmptyText();
                return;
            }

            if (!Ext.isEmpty(this.searchBusinessName)) {
                this.converFiltertData(adata);
            }

            if (adata.rows.length <= 0) {
                this.gridBlockList.showEmptyText();
                return;
            }

            var d = null;
            var parentNode = null;

            for (var ix = 0; ix < adata.rows.length; ix++) {
                d = adata.rows[ix];

                // parent_id
                if (d[6] != null) {
                    parentNode = this.gridBlockList.findNode('business_id', d[6]);
                } else {
                    parentNode = null;
                }

                this.gridBlockList.addNode(parentNode, [
                    d[0],          // business_id
                    d[1],          // business_name
                    d[2],          // url_pattern
                    d[3],          // user_id
                    d[4],          // user_name
                    d[5],          // reject_status
                    d[5],          // reject_settings
                    0
                ]);
            }
            this.gridBlockList.drawTree();

            d = null;
            parentNode = null;

        }, this);
    },

    /**
     * Reconfigure tree data
     * @param adata
     */
    converFiltertData: function(adata) {

        var data = null;
        var result = [];
        var businessId;
        var businessIdList = [];

        function getChildData(parentId) {

            for (var ix = 0; ix < adata.rows.length; ix++) {
                data = adata.rows[ix];

                if (data[6] == parentId) {
                    result[result.length] = data;

                    getChildData(data[0]);
                }
            }
        }

        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            if (adata.rows[ix][1].indexOf(this.searchBusinessName) > -1) {
                businessId = adata.rows[ix][0];

                if (businessIdList.indexOf(businessIdList) === -1) {
                    businessIdList[businessIdList.length] = businessId;
                }
                result[result.length] = adata.rows[ix];
            }
        }

        for (ix = 0, ixLen = businessIdList.length; ix < ixLen; ix++) {
            businessId = businessIdList[ix];
            getChildData(businessId);
        }

        adata.rows = result;

        businessIdList = null;
        result = null;
        data = null;
    },

    /**
     * Denied information set displayed in a pop-up window.
     * @private
     */
    applyRejectInfo: function() {
        this.blockUrlPatterns = '';

        var store = this.gridBlockList.baseTree.getStore();
        this.changeData = [];

        store.each(function(record) {
            if (record.get('modify')) {
                this.changeData.push([
                    record.get('business_name'),
                    record.get('url_pattern'),
                    record.get('user_id'),
                    record.get('user_name'),
                    record.get('reject_setting')
                ]);
            }

            if (record.get('reject_setting') == 1) {
                this.blockUrlPatterns += (record.get('url_pattern') + '\n');
            }
        }, this);

        var validateGrid = this.validateWindow.down('#validateList');
        validateGrid.clearRows();

        for (var ix = 0, ixLen = this.changeData.length; ix < ixLen; ix++) {
            validateGrid.addRow([
                this.changeData[ix][0],
                this.changeData[ix][1],
                this.changeData[ix][3],
                this.changeData[ix][4],
                this.changeData[ix][4]
            ]);
        }
        validateGrid.drawGrid();

        if (this.changeData.length > 0) {
            this.validateWindow.down('#okButton').setDisabled(false);
        } else {
            this.validateWindow.down('#okButton').setDisabled(true);
        }

        this.validateWindow.show();

        store = null;
        validateGrid = null;
    },

    /**
     * Popup window to check the changed data and apply.
     * @private
     */
    initValidateWindow: function() {

        var okButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('OK'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            itemId: 'okButton',
            scope: this,
            handler: function() {
                this.executeUpdate(function() {
                    this.validateWindow.close();
                    this.executeSQL();

                }.bind(this));
            }
        });

        var cancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Cancel'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            itemId: 'cancelButton',
            scope: this,
            handler: function() {
                this.changeData = null;
                this.changeData = [];
                this.validateWindow.close();
            }
        });

        this.validateWindow = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 750,
            minWidth: 750,
            height: 300,
            minHeight: 300,
            padding: '10 10 0 10',
            title: Comm.RTComm.setFont(9, common.Util.TR('')),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'hide',
            buttonAlign: 'center',
            buttons: [okButton, cancelButton],
            liseteners: {
                scope: this,
                close: function() {
                    this.changeData = null;
                    this.changeData = [];
                }
            }
        });

        var bottomPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: {
                background: '#fff', textAlign: 'center', paddingTop: '8px', fontSize: '13px'
            },
            html: common.Util.TR('Click OK to apply the changes below.') + ' '+ common.Util.TR('Do you want to change?')
        });

        var centerPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var validateList = Ext.create('Exem.adminGrid', {
            itemId: 'validateList',
            width : '100%',
            height: '100%',
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
            defaultPageSize: 300
        });

        centerPanel.add(validateList);
        this.validateWindow.add(centerPanel, bottomPanel);

        validateList.beginAddColumns();
        validateList.addColumn({text: common.Util.CTR('Business Name'),    dataIndex: 'business_name',   width: 200, type: Grid.String, hideable: false});
        validateList.addColumn({text: common.Util.CTR('URL Pattern'),      dataIndex: 'url_pattern',     width: 200, type: Grid.String, hideable: false});
        validateList.addColumn({text: common.Util.CTR('Manager'),          dataIndex: 'user_name',       width:  90, type: Grid.String, hideable: false});
        validateList.addColumn({text: common.Util.CTR('Current Status'),   dataIndex: 'current_status',  width:  80, type: Grid.String, hideable: false, resizable: false,
            renderer: function (value) {
                if (value == 1) {
                    return '<div class="xm-config-valide-row reject">'+common.Util.TR('Allow')+'</div>';
                } else {
                    return '<div class="xm-config-valide-row allow">'+common.Util.TR('Reject')+'</div>';
                }
            }
        });
        validateList.addColumn({text: common.Util.CTR('Change Status'),    dataIndex: 'change_status',   width:  80, type: Grid.String, hideable: false,
            renderer: function (value, meta, record) {
                if (record.get('current_status') == 1) {
                    return '<div style="font-weight:bold;color:#e40b0b;">'+common.Util.TR('Reject')+'</div>';
                } else {
                    return '<div>'+common.Util.TR('Allow')+'</div>';
                }
            }
        });
        validateList.endAddColumns();
    },

    /**
     * Apply the set reject information to the database.
     * @param {function} callback
     */
    executeUpdate: function(callback) {

        this.updateSQLFormat = 'UPDATE xapm_txn_reject_info SET reject_status = {0} WHERE pattern = \'{1}\';';
        this.insertSQLFormat = 'INSERT into Xapm_txn_reject_history (time, pattern, reject_status, user_id) VALUES (current_timestamp, \'{0}\', {1}, {2} );';

        var executeQuery = '';

        if(Comm.currentRepositoryInfo.database_type === 'MSSQL'){
            executeQuery += 'begin transaction';
            executeQuery += '\n';
        }

        for (var ix = 0, ixLen = this.changeData.length; ix < ixLen; ix++) {
            if (this.changeData[ix][2]) {
                executeQuery += Ext.String.format(this.updateSQLFormat, this.changeData[ix][4], this.changeData[ix][1]);
                executeQuery += '\n';
            }
        }

        for ( ix = 0, ixLen = this.changeData.length; ix < ixLen; ix++) {
            if (this.changeData[ix][2]) {
                executeQuery += Ext.String.format(this.insertSQLFormat, this.changeData[ix][1], this.changeData[ix][4], this.changeData[ix][2]);
                executeQuery += '\n';
            }
        }
        executeQuery += 'commit;';

        this.changeData = null;
        this.changeData = [];

        this.callFn(this.blockUrlPatterns);

        WS.SQLExec({
            sql: executeQuery
        }, function(aheader) {

            if (!aheader.success) {
                console.debug('%c [Business Block Settings] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', aheader.message);
            }
            if (callback != null) {
                callback();
            }
            executeQuery = null;
        }, this);
    },

    /**
     * @param contents
     */
    callFn: function(contents) {
        var send_data = {};
        send_data.dll_name = "IntermaxPlugin.dll";
        send_data.options  = {
            was_id: 0,
            path: '/cfg/jspd.txn.reject',
            file: contents
        };
        send_data['function'] =  'set_server_file';

        WS.PluginFunction( send_data , function() {
        }, this);
    }


});
