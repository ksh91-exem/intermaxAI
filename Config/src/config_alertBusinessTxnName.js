Ext.define('config.config_alertBusinessTxnName', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    data: [],
    target: undefined,
    buttons: [common.Util.TR('Add'), common.Util.TR('Save'), common.Util.TR('Delete'), common.Util.TR('Refresh')],
    select_businessid: -1,
    select_businessname: '',

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        var self = this;
        this.target = target;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_biztxnname_edit',
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_biztxnname_delete',
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Refresh'); }
            }]
        });

        var hbar = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 1,
            border: false,
            bodyStyle: {
                background: '#cccccc'
            }
        });

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        //

        var businesslist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var businesslist_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Business'))
            }]
        });

        var businesslist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        businesslist_panel.add(businesslist_panel_title);
        businesslist_panel.add(businesslist_panel_body);

        //

        var jsplist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        var jsplist_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Transaction List'))
            }]
        });

        var jsplist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        jsplist_panel.add(jsplist_panel_title);
        jsplist_panel.add(jsplist_panel_body);

        //

        this._createBusinessGrid(businesslist_panel_body);
        this._createJspGrid(jsplist_panel_body);

        //

        panel.add(businesslist_panel);
        panel.add(jsplist_panel);

        this.target.add(toolbar);
        this.target.add(hbar);
        this.target.add(panel);

        this.refresh_business();
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                this.add_businessTxnName();
                break;
            case 'Edit' :
                this.edit_businessTxnName();
                break;
            case 'Delete' :
                this.delete_businessTxnName();
                break;
            case 'Refresh' :
                this.refresh_business();
                break;
            default :
                break;
        }
    },

    _createBusinessGrid: function(gridpanel) {
        var self = this;
        this.business_grid = Ext.create('Exem.adminGrid', {
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
            defaultbufferSize: 100,
            defaultPageSize: 100,
            itemclick:function(dv, record) {
                self.BusinessClick(record.data);

                var edit = Ext.getCmp('cfg_biztxnname_edit');
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_biztxnname_delete');
                if (del) {
                    del.setDisabled(false);
                }

                edit = null;
                del  = null;
            }
        });
        gridpanel.add(this.business_grid);

        this.business_grid.beginAddColumns();
        this.business_grid.addColumn({text: common.Util.CTR('ID'),            dataIndex: 'business_id',   width: 100, type: Grid.StringNumber, alowEdit: false, editMode: false, hide : true});
        this.business_grid.addColumn({text: common.Util.CTR('Business Name'), dataIndex: 'business_name', width: 300, type: Grid.String, alowEdit: false, editMode: false});
        this.business_grid.endAddColumns();
    },

    _createJspGrid: function(gridpanel) {
        this.jsp_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: true,
            defaultbufferSize: 100,
            defaultPageSize: 100,
            multiCheckable: true
        });
        gridpanel.add(this.jsp_grid);

        this.jsp_grid.beginAddColumns();
        this.jsp_grid.addColumn({text: common.Util.CTR('ID'),       dataIndex: 'business_id', width: 100, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
        this.jsp_grid.addColumn({text: common.Util.CTR('Transaction Name'), dataIndex: 'jsp_name',    width: 400, type: Grid.String, alowEdit: false, editMode: false});
        this.jsp_grid.endAddColumns();

        this.jsp_grid.baseStore.addListener('refresh', function(store){
            var ix, ixLen,
                start, pageTotalCount,
                self = this;

            start = store.lastOptions.start;
            pageTotalCount = (store.getPageSize() * store.currentPage);

            var selectRows = function(gridCount){
                var pageGridData = self.jsp_grid.getRow(gridCount).data;

                if (self.select_businessid == pageGridData.business_id) {
                    self.jsp_grid.selectRow(gridCount, true);
                }
            };

            if(pageTotalCount > store.totalCount){
                for(ix = start, ixLen = store.totalCount; ix < ixLen; ix++){
                    selectRows(ixLen - ix -1);
                }
            } else {
                for (ix = start, ixLen = pageTotalCount; ix < ixLen; ix++) {
                    selectRows(ixLen - ix -1);
                }
            }
        }.bind(this));
    },

    BusinessClick: function(d) {
        this.select_businessid = parseInt(d['business_id']);
        this.select_businessname = d['business_name'];

        this.selectedJspReload();
    },

    selectedJspReload: function() {
        var self = this;
        var ix = 0;
        var dataSet = {};

        this.jsp_grid.unCheckAll();

        dataSet.sql_file = 'IMXConfig_Reload_JSP_Business_Name.sql';

        dataSet.replace_string = [{
            name: 'business_id',
            value: this.select_businessid
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            this.editJSPData = [];
            self.jsp_grid.suspendLayouts();
            self.jsp_grid.clearRows();
            for (ix = 0; ix < adata.rows.length; ix++) {
                self.jsp_grid.addRow([
                    adata.rows[ix][0],  // business_id
                    adata.rows[ix][1]   // txn_name
                ]);
                this.editJSPData.push({ business_id: adata.rows[ix][0], jsp_name: adata.rows[ix][1], business_name: adata.rows[ix][2]});
            }
            self.jsp_grid.resumeLayouts();
            self.jsp_grid.doLayout();
            self.jsp_grid.drawGrid();
        }, this);
    },

    executeSQL_Business: function() {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Txn_Name_Business_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData_Business, this);
    },

    onData_Business: function(header, data) {
        if(!common.Util.checkSQLExecValid(header, data)) {
            return;
        }

        var d = null;

        this.business_grid.suspendLayouts();
        this.business_grid.clearRows();

        for (var ix = 0; ix < data[0].rows.length; ix++) {
            d = data[0].rows[ix];
            this.business_grid.addRow([
                d[0],   // business_id
                d[1]    // business_name
            ]);
        }
        this.business_grid.resumeLayouts();
        this.business_grid.doLayout();
        this.business_grid.drawGrid();
    },

    executeSQL_Jsp: function() {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_JSP_Business_Name_List.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData_Jsp, this);
    },

    onData_Jsp: function(header, data) {
        if(!common.Util.checkSQLExecValid(header, data)) {
            return;
        }

        this.addJSPData = [];
        this.jsp_grid.suspendLayouts();
        this.jsp_grid.clearRows();
        for (var ix = 0; ix < data.rows.length; ix++) {
            this.jsp_grid.addRow([
                data.rows[ix][0],  // business_id
                data.rows[ix][1]   // txn_name
            ]);
            this.addJSPData.push({ business_id: data.rows[ix][0], jsp_name: data.rows[ix][1], business_name: data.rows[ix][2]});
        }
        this.jsp_grid.resumeLayouts();
        this.jsp_grid.doLayout();
        this.jsp_grid.drawGrid();
        this.jsp_grid.unCheckAll();
    },

    add_businessTxnName: function() {
        var businessTxnName_form = Ext.create('config.config_alertBusinessTxnName_form');
        businessTxnName_form.parent = this;
        businessTxnName_form.addJSPData = this.addJSPData;
        businessTxnName_form.keepRowsData = [];
        businessTxnName_form.init('Add');
    },

    edit_businessTxnName: function() {
        var businessTxnName_form = Ext.create('config.config_alertBusinessTxnName_form');
        businessTxnName_form.parent                 = this;
        businessTxnName_form.select_businessid      = this.select_businessid;
        businessTxnName_form.select_businessname    = this.select_businessname;
        businessTxnName_form.editJSPData            = this.editJSPData;
        businessTxnName_form.keepRowsData           = [];
        businessTxnName_form.init('Edit');
    },

    delete_businessTxnName: function() {
        var self = this;
        var dataSet = {};
        var id = parseInt(self.select_businessid);

        Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
            if (btn === 'yes') {
                dataSet.sql_file = 'IMXConfig_Delete_Txn_Name.sql';

                dataSet.replace_string = [{
                    name    :   'business_id',
                    value   :   id
                }];

                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                WS.SQLExec(dataSet, function() {
                    Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Delete succeeded'));
                    setTimeout(function() {
                        self.refresh_business();
                    }, 100);
                }, this);
            }
        });
    },

    refresh_business: function() {
        this.executeSQL_Business();
        this.executeSQL_Jsp();

        var edit = Ext.getCmp('cfg_biztxnname_edit');
        if (edit) {
            edit.setDisabled(true);
        }

        var del = Ext.getCmp('cfg_biztxnname_delete');
        if (del) {
            del.setDisabled(true);
        }
        edit = null;
        del  = null;
    }
});
