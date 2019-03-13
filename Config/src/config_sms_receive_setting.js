Ext.define('config.config_sms_receive_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    data: [],
    target: undefined,

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function() {
        this.superclass.constructor.call(this, config);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function(target) {
        var self = this;
        this.target = target;

        //1508.26 refresh를 두번누르면 두번데이터가 그려지는 현상때문에 전역변수 추가.
        this.refresh_loading = false ;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: 1150,
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var sms_user_list_panel = Ext.create('Ext.panel.Panel', {
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

        var sms_user_list_panel_title = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('SMS Receive List'))
            }, {
                xtype: 'toolbar',
                width: 130,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_add.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Add'); }
                }, {
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_sms_user_list_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_sms_user_list_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var sms_user_list_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        sms_user_list_panel.add(sms_user_list_panel_title);
        sms_user_list_panel.add(sms_user_list_panel_body);

        var gridPanel = Ext.create('Ext.panel.Panel', {
            height: '100%',
            width : '100%',
            layout: 'fit',
            flex: 1,
            border: false,
            bodyStyle: {
                background: '#ffffff'
            }
        });

        sms_user_list_panel_body.add(gridPanel);
        panel.add(sms_user_list_panel);
        this.target.add(panel);

        // adminGrid
        this.gridSMSUserList = Ext.create('Exem.adminGrid', {
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
            defaultPageSize: 300,
            itemclick:function() {
                Ext.getCmp('cfg_sms_user_list_edit').setDisabled(false);
                Ext.getCmp('cfg_sms_user_list_delete').setDisabled(false);
            }
        });
        gridPanel.add(this.gridSMSUserList);

        this.gridSMSUserList.beginAddColumns();
        this.gridSMSUserList.addColumn({text: common.Util.CTR('SMS User ID'),   dataIndex: 'sms_user_id',       width: 110, type: Grid.StringNumber,    alowEdit: false, editMode: false});
        this.gridSMSUserList.addColumn({text: common.Util.CTR('Employee ID'),   dataIndex: 'employee_id',       width: 100, type: Grid.String,          alowEdit: false, editMode: false});
        this.gridSMSUserList.addColumn({text: common.Util.CTR('User Name'),     dataIndex: 'sms_user_name',     width: 120, type: Grid.String,          alowEdit: false, editMode: false});
        this.gridSMSUserList.addColumn({text: common.Util.CTR('Department'),    dataIndex: 'sms_business_name', width: 150, type: Grid.String,          alowEdit: false, editMode: false});
        this.gridSMSUserList.addColumn({text: common.Util.CTR('Mobile'),        dataIndex: 'phone_number',      width: 120, type: Grid.String,          alowEdit: false, editMode: false});
        this.gridSMSUserList.addColumn({text: common.Util.CTR('Email'),         dataIndex: 'sms_user_email',    width: 250, type: Grid.String,          alowEdit: false, editMode: false});
        this.gridSMSUserList.addColumn({text: common.Util.CTR('SMS Enable'),    dataIndex: 'sms_enable',        width: 100, type: Grid.CheckBox,        alowEdit: false, editMode: false});
        this.gridSMSUserList.addColumn({text: common.Util.CTR('Business ID'),   dataIndex: 'sms_business_id',   width: 150, type: Grid.String,          alowEdit: false, editMode: false, hide:true});
        this.gridSMSUserList.addColumn({text: common.Util.CTR('Mail Enable'),   dataIndex: 'mail_enable',       width: 100, type: Grid.CheckBox,        alowEdit: false, editMode: false});
        this.gridSMSUserList.endAddColumns();

        this.onButtonClick('Refresh');
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        var userForm;
        var data;

        switch (cmd) {
            case 'Add' :
                userForm = Ext.create('config.config_sms_receive_setting_form');
                userForm.parent = this;
                userForm.init('Add');
                break;
            case 'Edit' :
                data = this.gridSMSUserList.getSelectedRow()[0].data;
                userForm = Ext.create('config.config_sms_receive_setting_form');
                userForm.parent             = this;
                userForm.sms_user_id        = data.sms_user_id;
                userForm.sms_user_name      = data.sms_user_name;
                userForm.phone_number       = data.phone_number;
                userForm.sms_enable         = data.sms_enable;
                userForm.employee_id        = data.employee_id;
                userForm.sms_business_name  = data.sms_business_name;
                userForm.sms_user_email     = data.sms_user_email;
                userForm.sms_business_id    = data.sms_business_id;
                userForm.mail_enable        = data.mail_enable;
                userForm.init('Edit');
                break;
            case 'Delete' :
                var self = this;
                var dataSet = {};

                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        var rowData =  self.gridSMSUserList.getSelectedRow()[0].data;

                        dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Business_ID_Count.sql';
                        dataSet.bind = [{
                            name: 'sms_business_id',
                            value: rowData.sms_business_id,
                            type : SQLBindType.INTEGER
                        }];

                        if(common.Util.isMultiRepository()){
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function(header,data) {
                            if(data.rows[0][0] == 1){
                                dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Delete.sql';

                                dataSet.bind = [{
                                    name: 'sms_user_id',
                                    value: rowData.sms_user_id,
                                    type : SQLBindType.INTEGER
                                }, {
                                    name: 'sms_business_id',
                                    value: rowData.sms_business_id,
                                    type : SQLBindType.INTEGER
                                }];
                            } else{
                                dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Delete_no_Business_Delete.sql';

                                dataSet.bind = [{
                                    name: 'sms_user_id',
                                    value: rowData.sms_user_id,
                                    type : SQLBindType.INTEGER
                                }];
                            }


                            if(common.Util.isMultiRepository()){
                                dataSet.database = cfg.repositoryInfo.currentRepoName;
                            }

                            WS.SQLExec(dataSet, function() {
                                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                self.onButtonClick('Refresh');
                            }, this);
                        }, this);
                    }
                });
                break;
            case 'Refresh' :
                if ( this.refresh_loading )
                    return ;

                this.refresh_loading = true ;
                this.gridSMSUserList.clearRows();
                // Get Data
                this.executeSQL();

                Ext.getCmp('cfg_sms_user_list_edit').setDisabled(true);
                Ext.getCmp('cfg_sms_user_list_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var self = this,
            dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if (adata == null){
                return;
            }

            if ((adata.rows != undefined) && (adata.rows.length > 0)) {
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    var dataRows = adata.rows[ix];
                    self.gridSMSUserList.addRow([
                        +dataRows[0],    //sms_user_id
                        dataRows[1],    //sms_business_name
                        dataRows[2],    //sms_user_name
                        dataRows[3],    //부서
                        dataRows[4],    //phone_number
                        dataRows[5],    //email
                        dataRows[6],    //sms_enable
                        dataRows[7],    //sms_business_id
                        dataRows[9]    //mail_enable
                    ]);
                }
            }
            self.gridSMSUserList.drawGrid();
            this.refresh_loading = false ;
        }, this);
    }
});
