Ext.define('config.config_report_smtp_setting', {
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

        var smtpListPanel = Ext.create('Ext.panel.Panel', {
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

        var smtpListPanelTitle = Ext.create('Ext.panel.Panel', {
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
                html      : Comm.RTComm.setFont(9, common.Util.TR('SMTP List'))
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
                    id        : 'cfg_report_smtp_list_edit',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Edit'); }
                }, {
                    html      : '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id        : 'cfg_report_smtp_list_delete',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html      : '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var smtpListPanelBody = Ext.create('Ext.panel.Panel', {
            layout    : 'fit',
            width     : '100%',
            height    : '100%',
            border    : false,
            flex      : 1,
            bodyStyle : { background: '#dddddd' }
        });

        smtpListPanel.add(smtpListPanelTitle);
        smtpListPanel.add(smtpListPanelBody);

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

        smtpListPanelBody.add(gridPanel);
        panel.add(smtpListPanel);
        this.target.add(panel);

        // adminGrid
        this.smtpListGrid = Ext.create('Exem.adminGrid', {
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
                Ext.getCmp('cfg_report_smtp_list_edit').setDisabled(false);
                Ext.getCmp('cfg_report_smtp_list_delete').setDisabled(false);
            }
        });
        gridPanel.add(this.smtpListGrid);

        this.smtpListGrid.beginAddColumns();
        this.smtpListGrid.addColumn({text: common.Util.CTR('SMTP ID')    , dataIndex: 'smtp_id'       , width: 100, type: Grid.Number,  alowEdit: false, editMode: false, hide: true });
        this.smtpListGrid.addColumn({text: common.Util.CTR('Host')       , dataIndex: 'host'          , width: 200, type: Grid.String,  alowEdit: false, editMode: false });
        this.smtpListGrid.addColumn({text: common.Util.CTR('Port')       , dataIndex: 'smtp_port'     , width: 100, type: Grid.Number,  alowEdit: false, editMode: false });
        this.smtpListGrid.addColumn({text: common.Util.CTR('Email')      , dataIndex: 'email'         , width: 200, type: Grid.String,  alowEdit: false, editMode: false });
        this.smtpListGrid.addColumn({text: common.Util.CTR('User Name')  , dataIndex: 'smtp_user_name', width: 150, type: Grid.String,  alowEdit: false, editMode: false });
        this.smtpListGrid.addColumn({text: common.Util.CTR('Password')   , dataIndex: 'password'      , width: 0  , type: Grid.String,  alowEdit: false, editMode: false, hide: true, hideable:false });
        this.smtpListGrid.addColumn({text: common.Util.CTR('Auth')       , dataIndex: 'auth'          , width: 100, type: Grid.CheckBox,alowEdit: false, editMode: false});
        this.smtpListGrid.addColumn({text: common.Util.CTR('SSL')        , dataIndex: 'ssl'           , width: 100, type: Grid.CheckBox,alowEdit: false, editMode: false});
        this.smtpListGrid.endAddColumns();

        this.onButtonClick('Refresh');
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        var userForm;
        var data;

        switch (cmd) {
            case 'Add' :
                userForm = Ext.create('config.config_report_smtp_setting_form');
                userForm.parent = this;
                userForm.init('Add');
                break;
            case 'Edit' :
                data = this.smtpListGrid.getSelectedRow()[0].data;
                userForm = Ext.create('config.config_report_smtp_setting_form');
                userForm.parent         = this;
                userForm.smtp_id        = data.smtp_id;
                userForm.host           = data.host;
                userForm.smtp_port      = data.smtp_port;
                userForm.email          = data.email;
                userForm.smtp_user_name = data.smtp_user_name;
                userForm.auth           = (!!data.auth);
                userForm.ssl            = (!!data.ssl);
                userForm.init('Edit');
                break;
            case 'Delete' :
                var self = this;
                var dataSet = {};

                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        var rowData =  self.smtpListGrid.getSelectedRow()[0].data;

                        dataSet.sql_file = 'IMXConfig_Report_SMTP_Delete.sql';
                        dataSet.bind = [{
                            name    : 'smtp_id',
                            value   : rowData.smtp_id,
                            type    : SQLBindType.INTEGER
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
                this.smtpListGrid.clearRows();
                // Get Data
                this.executeSQL();

                Ext.getCmp('cfg_report_smtp_list_edit').setDisabled(true);
                Ext.getCmp('cfg_report_smtp_list_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var self = this,
            dataSet = {};

        dataSet.sql_file = 'IMXConfig_Report_SMTP_Info.sql';

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
                    self.smtpListGrid.addRow([
                        dataRows[0],    //SMTP ID(stmp_seq)
                        dataRows[1],    //Host
                        dataRows[2],    //Port
                        dataRows[3],    //Email
                        dataRows[4],    //SMTP User Name(user_id)
                        dataRows[5],    //password
                        dataRows[6],    //auth
                        +dataRows[7]    //ssl
                    ]);
                }
            }
            self.smtpListGrid.drawGrid();
            this.refresh_loading = false ;
        }, this);
    }
});
