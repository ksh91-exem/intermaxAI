Ext.define('config.config_userpermission', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    data: [],
    target: undefined,

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function() {
        this.callParent();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function(target) {
        var self = this;
        this.target = target;

        if (!this.modifylist) {
            this.modifylist = [];
        }

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: 785,
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var waslist_panel = Ext.create('Ext.panel.Panel', {
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

        var waslist_panel_title = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('User Privileges'))
            }, {
                xtype: 'toolbar',
                width: 70,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_save.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Save'); }
                }, {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var waslist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        waslist_panel.add(waslist_panel_title);
        waslist_panel.add(waslist_panel_body);

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

        waslist_panel_body.add(gridpanel);
        panel.add(waslist_panel);
        this.target.add(panel);

        // adminGrid
        this.userpermission_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });
        gridpanel.add(this.userpermission_grid);

        this.userpermission_grid.beginAddColumns();
        this.userpermission_grid.addColumn({text: common.Util.CTR('User ID'),              dataIndex: 'user_id',       width: 140, type: Grid.StringNumber,   alowEdit: false, editMode: false, hide: true});
        this.userpermission_grid.addColumn({text: common.Util.CTR('User ID'),              dataIndex: 'login_id',      width: 140, type: Grid.String,   alowEdit: false, editMode: false});
        this.userpermission_grid.addColumn({text: common.Util.CTR('User Name'),            dataIndex: 'user_name',     width: 100, type: Grid.String,   alowEdit: false, editMode: false});
        this.userpermission_grid.addColumn({text: common.Util.CTR('Kill Thread'),          dataIndex: 'kill_thread',   width: 100, type: Grid.CheckBox, alowEdit: true,  editMode: true, renderer: this.userPrivilege});
        this.userpermission_grid.addColumn({text: common.Util.CTR('System Dump'),          dataIndex: 'system_dump',   width: 100, type: Grid.CheckBox, alowEdit: true,  editMode: true, renderer: this.userPrivilege});
        this.userpermission_grid.addColumn({text: common.Util.CTR('JSPD Property Change'), dataIndex: 'property_load', width: 150, type: Grid.CheckBox, alowEdit: true,  editMode: true, renderer: this.userPrivilege});
        this.userpermission_grid.addColumn({text: common.Util.CTR('Show Bind Variable')  , dataIndex: 'bind'         , width: 150, type: Grid.CheckBox, alowEdit: true,  editMode: true, renderer: this.bindPrivilege});
        this.userpermission_grid.addColumn({text: common.Util.CTR('Admin Check'),          dataIndex: 'admin_check',   width: 140, type: Grid.CheckBox,   alowEdit: true, editMode: true, renderer : this.userPrivilege, hide : true});
        this.userpermission_grid.endAddColumns();

        this.userpermission_grid.down('[dataIndex= kill_thread]').addListener('beforecheckchange', this.beforCheckFn);
        this.userpermission_grid.down('[dataIndex= system_dump]').addListener('beforecheckchange', this.beforCheckFn);
        this.userpermission_grid.down('[dataIndex= property_load]').addListener('beforecheckchange', this.beforCheckFn);
        this.userpermission_grid.down('[dataIndex= bind]').addListener('beforecheckchange', this.beforCheckFn);
        this.userpermission_grid.down('[dataIndex= admin_check]').addListener('beforecheckchange', this.beforCheckFn);

        // Get Data
        this.executeSQL();
    },

    beforCheckFn: function(coluheckcmn, rowIndex) {
        var row = this.getView().getRow(rowIndex);
        var record = this.getView().getRecord(row);
        var state = null;

        if (coluheckcmn.dataIndex == 'bind') {
            if (record.data.login_id === 'intermax' && !record.dirty) {
                state = false;
            } else {
                state = true;
            }
            //16.02.22 관리자 권한으로 되어 있는 사용자는 쓰레드 종료, 시스템 덤프, JSPD 속성이 변경되지 않도록 변경
        } else {
            if (record.data.admin_check == 1) {
                state = false;
            }
            else {
                state = true;
            }
        }
        return state;
    },


    userPrivilege: function(value, meta, record) {
            var cssPrefix = Ext.baseCSSPrefix,
                cls = cssPrefix + 'grid-checkcolumn';

            if(record.data.admin_check == 1) {
                meta.tdCls += ' ' + 'x-item-disabled';
            }

            if (value) {
                cls += ' ' + cssPrefix + 'grid-checkcolumn-checked';
            }

            return '<img class="' + cls + '" src="' + Ext.BLANK_IMAGE_URL + '"/>';
    },

    bindPrivilege: function(value, meta, record) {
        var cssPrefix = Ext.baseCSSPrefix;
        var cls = cssPrefix + 'grid-checkcolumn';

        if (record.data.login_id === 'intermax' && !record.dirty) {
            meta.tdCls += ' ' + 'x-item-disabled';
        }

        if (value) {
            cls += ' ' + cssPrefix + 'grid-checkcolumn-checked';
        }

        return '<img class="' + cls + '" src="' + Ext.BLANK_IMAGE_URL + '"/>';
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Save' :
                this.ModifiedSelect();
                this.dataUpdate();
                break;
            case 'Refresh' :
                this.refresh_userlist();
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var dataSetMaster = {};
        dataSetMaster.sql_file = 'IMXCFG_getUserPermission.sql';
        if(common.Util.isMultiRepository()){
            dataSetMaster.database = cfg.repositoryInfo.master.database_name;
        }
        WS.SQLExec(dataSetMaster, function(aheader, adata) {
            if ((adata.rows != null) && (adata.rows.length > 0)) {
                var d = null;
                this.userpermission_grid.clearRows();
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    d = adata.rows[ix];
                    this.userpermission_grid.addRow([
                        d[0],     // user_id
                        d[1],     // login_id
                        d[2],     // user_name
                        d[3],     // kill_thread
                        d[4],     // system_dump
                        //d[5],     // memory_leak
                        d[6],     // property_load
                        d[7],      // bind
                        d[8]       // admin_check
                    ]);
                }
                this.userpermission_grid.drawGrid();
            }
        }, this);

    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ModifiedSelect: function() {
        this.modifylist = this.userpermission_grid.getModified();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    dataUpdate: function() {
        var d = null;

        var dataSet = {};

        for (var ix = 0; ix < this.modifylist.length; ix++) {
            d = this.modifylist[ix].data;

            var _kill_thread = 0;
            var _system_dump = 0;
            var _property_load = 0;
            var _bind = 0;

            /**
            var _memory_leak = 0;
            if (d.memory_leak ) { _memory_leak = 1; }
             **/

            if (d.kill_thread ) {
                _kill_thread   = 1;
            }
            if (d.system_dump ) {
                _system_dump   = 1;
            }
            if (d.property_load ) {
                _property_load = 1;
            }
            if (d.bind ) {
                _bind = 1;
            }
            dataSet.sql_file = 'IMXConfig_Update_User_Permission.sql';
            dataSet.replace_string = [{
                name    :   'kill_thread',
                value   :   _kill_thread
            }, {
                name    :   'system_dump',
                value   :   _system_dump
            }, {
                name    :   'property_load',
                value   :   _property_load
            }, {
                name    :   'bind',
                value   :   _bind
            }, {
                name    :   'user_id',
                value   :   d.user_id
            }];

            d.start = ix +1;
            d.end = this.modifylist.length;

            this.updateUserPermission(dataSet,d);
        }
    },

    updateUserPermission : function(dataSet,data){
        if(common.Util.isMultiRepository()){
            cfg.setConfigToRepo(dataSet, function(){}, this);
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }
        WS.SQLExec(dataSet, function() {
            if(data.start === data.end){
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                this.onButtonClick('Refresh');
                this.refresh_userlist();
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    refresh_userlist: function() {
        this.userpermission_grid.clearRows();
        this.executeSQL();
    }
});
