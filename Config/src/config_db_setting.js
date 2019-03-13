Ext.define('config.config_db_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    bodyStyle: {
        background: '#eeeeee'
    },

    target: undefined,

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        var self = this;
        this.target = target;

        this.refresh_loading = false ;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: 1000,
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var db_list_panel = Ext.create('Ext.panel.Panel', {
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

        var db_panel_title = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('DB List'))
            }, {
                xtype: 'toolbar',
                width: 100,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_db_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_db_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var db_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        db_list_panel.add(db_panel_title);
        db_list_panel.add(db_panel_body);

        var grid_panel = Ext.create('Ext.panel.Panel', {
            height: '100%',
            width : '100%',
            layout: 'fit',
            flex: 1,
            border: false,
            bodyStyle: {
                background: '#ffffff'
            }
        });

        db_panel_body.add(grid_panel);
        panel.add(db_list_panel);
        this.target.add(panel);

        // adminGrid
        this.DBGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            itemclick:function() {
                Ext.getCmp('cfg_db_edit').setDisabled(false);
                Ext.getCmp('cfg_db_delete').setDisabled(false);
            }
        });
        grid_panel.add(this.DBGrid);

        this.DBGrid.beginAddColumns();
        this.DBGrid.addColumn({text: common.Util.CTR('DB ID'),            dataIndex: 'db_id',         width: 80,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.DBGrid.addColumn({text: common.Util.CTR('DB Name'),          dataIndex: 'db_name',       width: 200, type: Grid.String, alowEdit: false, editMode: false});
        this.DBGrid.addColumn({text: common.Util.CTR('Host IP'),          dataIndex: 'host_ip',       width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.DBGrid.addColumn({text: common.Util.CTR('SID'),              dataIndex: 'sid',           width: 90, type: Grid.String, alowEdit: false, editMode: false});
        this.DBGrid.addColumn({text: common.Util.CTR('Listener Port'),    dataIndex: 'listener_port', width: 110, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.DBGrid.addColumn({text: common.Util.CTR('DB User'),          dataIndex: 'db_user',       width: 90, type: Grid.String, alowEdit: false, editMode: false});
        this.DBGrid.addColumn({text: common.Util.CTR('Table Space Usage Status of Collection'),   dataIndex: 'table_space_usage',   width: 200, type: Grid.ComboBox, alowEdit: false, editMode: false});
        this.DBGrid.endAddColumns();

        // Get Data
        this.onButtonClick('Refresh');

    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        var self = this;
        var data;
        var DBForm;

        switch (cmd) {
            case 'Edit' :
                data = this.DBGrid.getSelectedRow()[0].data;
                DBForm = Ext.create('config.config_db_setting_form');
                DBForm.parent = this;
                DBForm.db_id                = data.db_id;
                DBForm.db_name              = data.db_name;
                DBForm.host_ip              = data.host_ip;
                DBForm.sid                  = data.sid;
                DBForm.listener_port        = data.listener_port;
                DBForm.db_user              = data.db_user;
                DBForm.table_space_usage    = data.table_space_usage;
                DBForm.init('Edit');
                break;
            case 'Delete' :
                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        var data = self.DBGrid.getSelectedRow()[0].data;
                        var dataSet = {};
                        dataSet.sql_file = 'IMXConfig_Delete_DBInfo.sql';
                        dataSet.bind = [{
                            name: 'DBId',
                            value: data.db_id,
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
                if ( this.refresh_loading )
                    return ;

                this.refresh_loading = true ;
                this.DBGrid.clearRows();
                this.executeSQL();

                Ext.getCmp('cfg_db_edit').setDisabled(true);
                Ext.getCmp('cfg_db_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var self = this;
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_DB_Setting_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if (adata.rows != null && adata.rows.length > 0) {
                var dataRows;
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    dataRows = adata.rows[ix];
                    self.DBGrid.addRow([
                        dataRows[0],    //db_id
                        dataRows[1],    //instance_name
                        dataRows[2],    //host_ip
                        dataRows[3],    //sid
                        dataRows[4],    //lsnr_port
                        dataRows[5],    //db_user
                        dataRows[6]     //download_tablespace
                    ]);
                }
                self.DBGrid.drawGrid();
            }
            this.refresh_loading = false ;
        }, this);
    }
});
