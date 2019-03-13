Ext.define('config.config_alert_poolalert', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    MODE: '',
    target: null,
    groupSetData: [],
    serverSetData: [],

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function() {
        var self = this;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                id: 'cfg_poolalert_add' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_poolalert_edit' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_poolalert_delete' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Refresh'); }
            }]
        });

        this.target.add(toolbar);

        if (!cfg.alert.sltName) {
            Ext.getCmp('cfg_poolalert_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_poolalert_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_poolalert_delete' + this.MODE).setDisabled(true);
        } else {
            Ext.getCmp('cfg_poolalert_add' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_poolalert_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_poolalert_delete' + this.MODE).setDisabled(true);
        }

        this.poolGrid = Ext.create('Exem.adminGrid', {
            flex: 1,
            width: '100%',
            border: false,
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
                var edit = Ext.getCmp('cfg_poolalert_edit' + self.MODE);
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_poolalert_delete' + self.MODE);
                if (del) {
                    del.setDisabled(false);
                }

                edit = null;
                del  = null;
            }
        });
        this.target.add(this.poolGrid);

        this.poolGrid.beginAddColumns();
        this.poolGrid.addColumn({text: common.Util.CTR('Agent ID'),          dataIndex: 'was_id',               width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
        this.poolGrid.addColumn({text: common.Util.CTR('Agent Name'),        dataIndex: 'was_name',             width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.poolGrid.addColumn({text: common.Util.CTR('Connect Pool Name'), dataIndex: 'connection_pool_name', width: 400, type: Grid.String, alowEdit: false, editMode: false});
        this.poolGrid.addColumn({text: common.Util.CTR('Warning'),           dataIndex: 'warning',              width:  80, type: Grid.Number, alowEdit: false, editMode: false});
        this.poolGrid.addColumn({text: common.Util.CTR('Critical'),          dataIndex: 'critical',             width:  80, type: Grid.Number, alowEdit: false, editMode: false});
        this.poolGrid.addColumn({text: common.Util.CTR('Max Conn'),          dataIndex: 'maxconn',              width:  80, type: Grid.Number, alowEdit: false, editMode: false});
        this.poolGrid.addColumn({text: common.Util.CTR('SMS Schedule'),      dataIndex: 'sms',                  width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.poolGrid.endAddColumns();
    },


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                this.onAdd();
                break;
            case 'Edit' :
                this.onEdit();
                break;
            case 'Delete' :
                this.onDelete();
                break;
            case 'Refresh' :
                this.onRefresh();
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onEdit: function() {
        var pool_form = Ext.create('config.config_alert_poolalert_form');
        pool_form.parent = this;
        pool_form.init('Edit');
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onDelete: function() {
        var self = this;
        var d = this.poolGrid.getSelectedRow()[0].data;

        config.ConfigEnv.group_flag = false ;

        if (d != undefined) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                if (btn === 'yes') {
                    config.ConfigEnv.delete_config(d.was_id, 'WAS', 'Connection Pool', d.connection_pool_name );

                    setTimeout(function() { self.onRefresh(); }, 500);
                }
            });
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onRefresh: function(save_flag) {
        this.serverSetQuery(save_flag);

        var edit = Ext.getCmp('cfg_poolalert_edit' + this.MODE);
        if (edit) {
            edit.setDisabled(false);
        }

        var del = Ext.getCmp('cfg_poolalert_delete' + this.MODE);
        if (del) {
            del.setDisabled(true);
        }

        if (!cfg.alert.sltName) {
            Ext.getCmp('cfg_poolalert_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_poolalert_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_poolalert_delete' + this.MODE).setDisabled(true);
        } else {
            Ext.getCmp('cfg_poolalert_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_poolalert_edit' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_poolalert_delete' + this.MODE).setDisabled(true);
        }

        edit = null;
        del  = null;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    serverSetQuery: function(save_flag) {
        var ds = {};
        var self = this;

        ds.bind = [{
            name: 'fromtime',
            value: common.Util.getDate(new Date()).substr(0, 11) + '00:00:00',
            type : SQLBindType.STRING
        }];
        ds.replace_string = [];

        if (cfg.alert.sltId) {
            ds.replace_string.push({
                name: 'server_id',
                value: cfg.alert.sltId
            });
        } else {
            ds.replace_string.push({
                name: 'server_id',
                value: cfg.alert.wasIds.join(',')
            });
        }

        ds.sql_file = 'IMXCFG_PoolAlert.sql';

        if(common.Util.isMultiRepository()){
            ds.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(ds, function(aheader, adata) {
            self.poolGrid.clearRows();
            var warning, critical;
            if (adata.rows !== undefined && adata.rows !== null) {
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    //데이터가 없을 경우의 예외 처리
                    if(adata.rows[ix][2]){
                        warning = parseInt(adata.rows[ix][2]);
                    }else{
                        warning = adata.rows[ix][2];
                    }
                    if(adata.rows[ix][3]){
                        critical = parseInt(adata.rows[ix][3]);
                    }else{
                        critical = adata.rows[ix][3];
                    }
                    self.poolGrid.addRow([
                        adata.rows[ix][6],  // WAS_ID
                        adata.rows[ix][5],  // WAS_NAME
                        adata.rows[ix][1],  // POOL_NAME
                        warning,  // WARNING(형변환)
                        critical,  // CRITICAL(형변환)
                        adata.rows[ix][7],  // MAXCONN
                        adata.rows[ix][4]   // SMS
                    ]);
                }
            }
            self.poolGrid.drawGrid();

            if ( save_flag ){
                Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Save Success'));
            }

        }, this);

        ds = null;

    }
});
