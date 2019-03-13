Ext.define('config.config_userlist', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    data: [],
    userlist: [],
    modifylist: null,
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
            width: 900,
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var userlist_panel = Ext.create('Ext.panel.Panel', {
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

        var userlist_panel_title = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('User List'))
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
                    id: 'cfg_userlist_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_userlist_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var userlist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        userlist_panel.add(userlist_panel_title);
        userlist_panel.add(userlist_panel_body);

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

        userlist_panel_body.add(gridpanel);
        panel.add(userlist_panel);
        this.target.add(panel);

        // adminGrid
        this.gridUserList = Ext.create('Exem.adminGrid', {
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
                Ext.getCmp('cfg_userlist_edit').setDisabled(false);
                Ext.getCmp('cfg_userlist_delete').setDisabled(false);
            }
        });
        gridpanel.add(this.gridUserList);

        this.gridUserList.beginAddColumns();
        this.gridUserList.addColumn({text: common.Util.CTR('User ID'),    dataIndex: 'user_id',        width: 140, type: Grid.StringNumber,   alowEdit: false, editMode: false, hide: true});
        this.gridUserList.addColumn({text: common.Util.CTR('User ID'),    dataIndex: 'login_id',       width: 140, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridUserList.addColumn({text: common.Util.CTR('User Name'),  dataIndex: 'user_name',      width: 100, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridUserList.addColumn({text: common.Util.CTR('Admin'),      dataIndex: 'admin_check',    width:  70, type: Grid.CheckBox, alowEdit: false, editMode: false});
        this.gridUserList.addColumn({text: common.Util.CTR('Department'), dataIndex: 'user_dept',      width: 150, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridUserList.addColumn({text: common.Util.CTR('Mobile'),     dataIndex: 'user_hp',        width: 120, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridUserList.addColumn({text: common.Util.CTR('Email'),      dataIndex: 'user_email',     width: 250, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridUserList.endAddColumns();

        this.onButtonClick('Refresh');
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    adminCheck: function(d) {
        var result = false;
        if (d != 0) {
            result = true;
        }
        return result;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        var d = null;
        var userform = null;

        switch (cmd) {
            case 'Add' :
                userform = Ext.create('config.config_userlist_form');
                userform.parent = this;
                userform.init('Add');
                break;
            case 'Edit' :
                d = this.gridUserList.getSelectedRow()[0];
                if (d.data.login_id == 'intermax') {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('you cannot delete or edit admin account.'));
                    return;
                }

                userform = Ext.create('config.config_userlist_form');
                userform.parent = this;
                userform.userid = d.data.user_id;
                userform.loginid = d.data.login_id;
                userform.username = d.data.user_name;
                userform.admin = d.data.admin_check;
                userform.department = d.data.user_dept;
                userform.mobile = d.data.user_hp;
                userform.email = d.data.user_email;
                userform.init('Edit');
                break;
            case 'Delete' :
                var self = this;
                d = this.gridUserList.getSelectedRow()[0];

                if (d.data.login_id == 'intermax') {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('you cannot delete or edit admin account.'));
                    return;
                }

                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        var dataSet = {};
                        dataSet.sql_file = 'IMXConfig_Delete_User_Procedure.sql';
                        dataSet.bind = [{
                            name: 'userId',
                            value: d.data['user_id'],
                            type : SQLBindType.INTEGER
                        }];
                        if(common.Util.isMultiRepository()){
                            cfg.setConfigToRepo(dataSet, function(){}, this);
                            dataSet.database = cfg.repositoryInfo.master.database_name;
                        }
                        WS.SQLExec(dataSet, function() {}, this);
                        setTimeout(function() { self.onButtonClick('Refresh'); }, 500);
                    }
                });
                break;
            case 'Refresh' :
                if ( this.refresh_loading )
                    return ;

                this.refresh_loading = true ;
                this.gridUserList.clearRows();
                // Get Data
                this.executeSQL();

                Ext.getCmp('cfg_userlist_edit').setDisabled(true);
                Ext.getCmp('cfg_userlist_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var self = this,
            dataSet = {};


        dataSet.sql_file = 'IMXCFG_getUserList.sql';

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if (adata == null)
                return;
            if ((adata.rows != undefined) && (adata.rows.length > 0)) {
                    var d = null;
                    for (var ix = 0; ix < adata.rows.length; ix++) {
                        d = adata.rows[ix];
                        self.gridUserList.addRow([
                            d[0],                       // user_id
                            d[1],                       // login_id
                            d[2],                       // admin_check
                            this.adminCheck(d[3]),      // user_name
                            d[4],                       // user_dept
                            d[5],                       // user_mobile
                            d[6]                        // user_email
                        ]);
                    }
                    self.gridUserList.drawGrid();
            }

            self.checkOtherTab();
            this.refresh_loading = false ;
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    checkOtherTab: function() {
        // 사용자별 권한 설정 및 서비스별 사용자 설정 탭이 열려 있으면 강제로 Refresh 처리한다.
        // 새로운 사용자 등록 및 수정된 내용을 반영하기 위해(수정은 이름이 변경되지 않는한 필요치 않지만..)
        var tab = cfg.tabpanel.items.items;
        for (var ix = 0; ix < tab.length; ix++) {
            if (tab[ix].id == 'config_userservice_panel') {
                cfg.user_service_view.refresh_userService();
            } else if (tab[ix].id == 'config_userpermission_panel') {
                cfg.user_permission_view.refresh_userlist();
            }
        }
    }
});
