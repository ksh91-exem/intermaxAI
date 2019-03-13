Ext.define('config.config_report_user_setting', {
    extend  : 'Exem.Form',
    layout  : { type: 'vbox', align: 'stretch' },
    width   : '100%',
    height  : '100%',

    init: function() {
        var self = this;

        this.refresh_loading = false ;

        var panel = Ext.create('Ext.panel.Panel', {
            layout    : 'hbox',
            width     : '60%',
            flex      : 1,
            border    : false,
            bodyStyle : { background: '#eeeeee' }
        });

        var userListPanel = Ext.create('Ext.panel.Panel', {
            layout    : 'vbox',
            cls       : 'x-config-used-round-panel',
            height    : '100%',
            flex      : 1,
            border    : false,
            split     : true,
            margin    : '3 0 3 6',
            padding   : '2 3 2 3',
            bodyStyle : { background: '#ffffff' }
        });

        var userListPanelTitle = Ext.create('Ext.panel.Panel', {
            layout    : 'hbox',
            width     : '100%',
            height    : 30,
            border    : false,
            bodyStyle : { background: '#eeeeee' },
            items     : [{
                flex      : 1,
                height    : 30,
                border    : false,
                margin    : '4 0 0 0',
                bodyStyle : { background: '#eeeeee' },
                html      : Comm.RTComm.setFont(9, common.Util.TR('User List'))
            }, {
                xtype     : 'toolbar',
                width     : 130,
                height    : 30,
                border    : false,
                items     : [{
                    html      : '<img src="../images/cfg_add.png" width="15" height="15">',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Add'); }
                }, {
                    html      : '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id        : 'cfg_report_user_list_edit',
                    scope     : this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html      : '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id        : 'cfg_report_user_list_delete',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html      : '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var userListPanelBody = Ext.create('Ext.panel.Panel', {
            layout    : 'fit',
            width     : '100%',
            height    : '100%',
            border    : false,
            flex      : 1,
            bodyStyle : { background: '#dddddd' }
        });

        userListPanel.add(userListPanelTitle);
        userListPanel.add(userListPanelBody);

        var gridPanel = Ext.create('Ext.panel.Panel', {
            height    : '100%',
            width     : '100%',
            layout    : 'fit',
            flex      : 1,
            border    : false,
            bodyStyle : {
                background: '#ffffff'
            }
        });

        userListPanelBody.add(gridPanel);
        panel.add(userListPanel);
        this.target.add(panel);

        // adminGrid
        this.userListGrid = Ext.create('Exem.adminGrid', {
            width               : '100%',
            height              : '100%',
            editMode            : false,
            useCheckBox         : false,
            checkMode           : Grid.checkMode.SINGLE,
            showHeaderCheckbox  : false,
            rowNumber           : true,
            localeType          : 'H:i:s',
            stripeRows          : true,
            defaultHeaderHeight : 26,
            usePager            : false,
            defaultbufferSize   : 300,
            defaultPageSize     : 300,
            itemclick           : function() {
                Ext.getCmp('cfg_report_user_list_edit').setDisabled(false);
                Ext.getCmp('cfg_report_user_list_delete').setDisabled(false);
            }
        });
        gridPanel.add(this.userListGrid);

        this.userListGrid.beginAddColumns();
        this.userListGrid.addColumn({text: common.Util.CTR('User ID')  , dataIndex: 'user_id'   , width: 100, type: Grid.Number, alowEdit: false, editMode: false, hide : true });
        this.userListGrid.addColumn({text: common.Util.CTR('User Name'), dataIndex: 'user_name' , width: 200, type: Grid.String, alowEdit: false, editMode: false });
        this.userListGrid.addColumn({text: common.Util.CTR('Email')    , dataIndex: 'user_email', width: 350, type: Grid.String, alowEdit: false, editMode: false });
        this.userListGrid.endAddColumns();

        this.onButtonClick('Refresh');
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        var userForm;
        var data;

        switch (cmd) {
            case 'Add'  :
                userForm = Ext.create('config.config_report_user_setting_form');
                userForm.parent = this;
                userForm.init('Add');
                break;
            case 'Edit' :
                data = this.userListGrid.getSelectedRow()[0].data;
                userForm = Ext.create('config.config_report_user_setting_form');
                userForm.parent     = this;
                userForm.user_id    = data.user_id;
                userForm.user_name  = data.user_name;
                userForm.user_email = data.user_email;
                userForm.init('Edit');
                break;
            case 'Delete' :
                var self = this;
                var dataSet = {};

                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        var rowData =  self.userListGrid.getSelectedRow()[0].data;

                        dataSet.sql_file = 'IMXConfig_Report_User_Delete.sql';
                        dataSet.bind = [{
                            name: 'user_id',
                            value: rowData.user_id,
                            type : SQLBindType.INTEGER
                        }];

                        if(common.Util.isMultiRepository()){
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function() {
                            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                            self.onButtonClick('Refresh');
                        }, this);
                    }
                });
                break;
            case 'Refresh' :
                if ( this.refresh_loading ){
                    return ;
                }

                this.refresh_loading = true ;
                this.userListGrid.clearRows();
                // Get Data
                this.executeSQL();

                Ext.getCmp('cfg_report_user_list_edit').setDisabled(true);
                Ext.getCmp('cfg_report_user_list_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var self = this,
            dataSet = {};

        dataSet.sql_file = 'IMXConfig_Report_User_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if(!common.Util.checkSQLExecValid(aheader, adata)){
                console.info(aheader);
                console.info(adata);
                return;
            }

            if ((adata.rows != undefined) && (adata.rows.length > 0)) {
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    var dataRows = adata.rows[ix];
                    self.userListGrid.addRow([
                        dataRows[0],   //user_id
                        dataRows[1],   //user_name
                        dataRows[2]    //email
                    ]);
                }
            }
            self.userListGrid.drawGrid();
            this.refresh_loading = false ;
        }, this);
    }
});
