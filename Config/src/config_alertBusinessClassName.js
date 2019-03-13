Ext.define('config.config_alertBusinessClassName', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    data: [],
    target: undefined,
    buttons: [common.Util.TR('Add'), common.Util.TR('Save'), common.Util.TR('Delete'), common.Util.TR('Refresh')],
    select_classname: '',
    select_classdesc: '',

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
                id: 'cfg_bizclsname_edit',
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_bizclsname_delete',
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

        var class_list_panel = Ext.create('Ext.panel.Panel', {
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

        var class_list_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Class List'))
            }]
        });

        var class_list_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        class_list_panel.add(class_list_panel_title);
        class_list_panel.add(class_list_panel_body);

        //

        this._createBusinessGrid(businesslist_panel_body);
        this._createJspGrid(class_list_panel_body);

        //

        panel.add(businesslist_panel);
        panel.add(class_list_panel);

        this.target.add(toolbar);
        this.target.add(hbar);
        this.target.add(panel);

        this.refresh_business();
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                this.add_businessClassName();
                break;
            case 'Edit' :
                this.edit_businessClassName();
                break;
            case 'Delete' :
                this.delete_businessClassName();
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
                self.BusinessNameClick(record.data);

                var edit = Ext.getCmp('cfg_bizclsname_edit');
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_bizclsname_delete');
                if (del) {
                    del.setDisabled(false);
                }

                edit = null;
                del  = null;
            }
        });
        gridpanel.add(this.business_grid);

        this.business_grid.beginAddColumns();
        this.business_grid.addColumn({text: common.Util.CTR('Business Name'), dataIndex: 'business_name', width: 300, type: Grid.String, alowEdit: false, editMode: false});
        this.business_grid.endAddColumns();
    },

    _createJspGrid: function(gridpanel) {
        this.class_grid = Ext.create('Exem.adminGrid', {
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
        gridpanel.add(this.class_grid);

        this.class_grid.beginAddColumns();
        this.class_grid.addColumn({text: common.Util.CTR('Class Name'),     dataIndex: 'class_name',    width: 400, type: Grid.String, alowEdit: false, editMode: false});
        this.class_grid.addColumn({text: common.Util.CTR('Business Name'),  dataIndex: 'business_name', width: 100, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.class_grid.endAddColumns();

        this.class_grid.baseStore.addListener('refresh', function(store){
            var ix, ixLen,
                start, pageTotalCount,
                self = this;

            start = store.lastOptions.start;
            pageTotalCount = (store.getPageSize() * store.currentPage);

            var selectRows = function(gridCount){
                var pageGridData = self.class_grid.getRow(gridCount).data;

                if (self.select_businessname == pageGridData.business_name) {
                    self.class_grid.selectRow(gridCount, true);
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

    BusinessNameClick: function(d) {
        this.select_businessname = d['business_name'];
        this.selectedClassReload();
    },

    selectedClassReload: function() {
        var self = this;
        var ix = 0;
        var dataSet = {};

        this.class_grid.unCheckAll();

        dataSet.sql_file = 'IMXConfig_Reload_Class_Name.sql';

        dataSet.bind = [{
            name: 'business_name',
            value: this.select_businessname,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            this.editClassData = [];
            self.class_grid.suspendLayouts();
            self.class_grid.clearRows();
            for (ix = 0; ix < adata.rows.length; ix++) {
                self.class_grid.addRow([
                    adata.rows[ix][0],  // class_name
                    adata.rows[ix][1]   // business_name
                ]);
                this.editClassData.push({ class_name: adata.rows[ix][0], business_name: adata.rows[ix][1] });
            }
            self.class_grid.resumeLayouts();
            self.class_grid.doLayout();
            self.class_grid.drawGrid();
        }, this);
    },

    executeSQL_Business: function() {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Class_Name_Business_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData_Business, this);
    },

    onData_Business: function(aheader, adata) {
        var d = null;

        this.business_grid.suspendLayouts();
        this.business_grid.clearRows();

        for (var ix = 0; ix < adata.rows.length; ix++) {
            d = adata.rows[ix];
            this.business_grid.addRow([
                d[0]    // business_name
            ]);
        }
        this.business_grid.resumeLayouts();
        this.business_grid.doLayout();
        this.business_grid.drawGrid();
    },

    executeSQL_ClassName: function() {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Class_Name_List.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData_ClassName, this);
    },

    onData_ClassName: function(aheader, adata) {
        this.addClassData = [];
        this.class_grid.suspendLayouts();
        this.class_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.class_grid.addRow([
                adata.rows[ix][1],  // class_name
                adata.rows[ix][0]   // business_name
            ]);
            this.addClassData.push({ business_name: adata.rows[ix][0], class_name: adata.rows[ix][1] });
        }
        this.class_grid.resumeLayouts();
        this.class_grid.doLayout();
        this.class_grid.drawGrid();
        this.class_grid.unCheckAll();
    },

    add_businessClassName: function() {
        var businessClassName_form = Ext.create('config.config_alertBusinessClassName_form');
        businessClassName_form.parent = this;
        businessClassName_form.addClassData = this.addClassData;
        businessClassName_form.keepRowsData = [];
        businessClassName_form.init('Add');
    },

    edit_businessClassName: function() {
        var businessClassName_form = Ext.create('config.config_alertBusinessClassName_form');
        businessClassName_form.parent               = this;
        businessClassName_form.select_businessname  = this.select_businessname;
        businessClassName_form.editClassData        = this.editClassData;
        businessClassName_form.keepRowsData = [];
        businessClassName_form.init('Edit');
    },

    delete_businessClassName: function() {
        var self = this;
        var dataSet = {};

        Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
            if (btn === 'yes') {
                dataSet.sql_file = 'IMXConfig_Delete_Class_Name.sql';

                dataSet.bind = [{
                    name    :   'business_name',
                    value   :   self.select_businessname,
                    type    :   SQLBindType.STRING
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
        this.executeSQL_ClassName();

        var edit = Ext.getCmp('cfg_bizclsname_edit');
        if (edit) {
            edit.setDisabled(true);
        }

        var del = Ext.getCmp('cfg_bizclsname_delete');
        if (del) {
            del.setDisabled(true);
        }

        edit = null;
        del  = null;
    }
});
