Ext.define('config.config_alert_disk', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    MODE: '',
    target: null,

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        var self = this;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_diskAlert_edit' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_diskAlert_delete' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Refresh'); }
            }]
        });

        this.target.add(toolbar);

        this.DiskGrid = Ext.create('Exem.adminGrid', {
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
                var edit = Ext.getCmp('cfg_diskAlert_edit' + self.MODE);
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_diskAlert_delete' + self.MODE);
                if (del) {
                    del.setDisabled(false);
                }
            }
        });
        this.target.add(this.DiskGrid);

        this.DiskGrid.beginAddColumns();
        this.DiskGrid.addColumn({text: common.Util.CTR('Mount Name'),        dataIndex: 'mount_name',   width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.DiskGrid.addColumn({text: common.Util.CTR('File System'),       dataIndex: 'file_system',  width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.DiskGrid.addColumn({text: common.Util.CTR('Warning') + '(%)',   dataIndex: 'warning',      width:  80, type: Grid.Number, alowEdit: false, editMode: false});
        this.DiskGrid.addColumn({text: common.Util.CTR('Critical') + '(%)',  dataIndex: 'critical',     width:  80, type: Grid.Number, alowEdit: false, editMode: false});
        this.DiskGrid.addColumn({text: common.Util.CTR('Check Time(m)'),     dataIndex: 'check_time',   width: 120, type: Grid.Number, alowEdit: false, editMode: false});
        this.DiskGrid.addColumn({text: common.Util.CTR('SMS Schedule'),      dataIndex: 'sms',          width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.DiskGrid.endAddColumns();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        switch (cmd) {
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
        var disk_form = Ext.create('config.config_alert_disk_form');
        disk_form.parent = this;
        disk_form.init();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onDelete: function() {
        var self = this;
        var data = this.DiskGrid.getSelectedRow()[0].data;

        if (data !== undefined) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                if (btn === 'yes') {
                    config.ConfigEnv.delete_config( cfg.alert.sltHostId, 'HOST', 'File System Alert', data.mount_name ) ;
                    setTimeout(function() { self.onRefresh(); }, 500);
                }
            });

        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onRefresh: function(save_flag) {
        this.serverSetQuery(save_flag);

        var edit = Ext.getCmp('cfg_diskAlert_edit' + this.MODE);
        if (edit) {
            edit.setDisabled(false);
        }

        var del = Ext.getCmp('cfg_diskAlert_delete' + this.MODE);
        if (del) {
            del.setDisabled(true);
        }

        if (!cfg.alert.sltName) {
            Ext.getCmp('cfg_diskAlert_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_diskAlert_delete' + this.MODE).setDisabled(true);
        } else {
            Ext.getCmp('cfg_diskAlert_edit' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_diskAlert_delete' + this.MODE).setDisabled(true);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    serverSetQuery: function(save_flag) {
        var dataSet = {};
        var self = this;

        dataSet.replace_string = [];

        if (cfg.alert.sltId) {
            dataSet.replace_string.push({
                name: 'host_ip',
                value: cfg.alert.sltId
            });
        }

        dataSet.sql_file = 'IMXConfig_DiskAlert.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.DiskGrid.clearRows();
            var warning, critical,intrerval;
            if (adata && adata.rows) {
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

                    if(adata.rows[ix][4]){
                        intrerval = parseInt(adata.rows[ix][4]);
                    }else{
                        intrerval = adata.rows[ix][4];
                    }
                    self.DiskGrid.addRow([
                        adata.rows[ix][0],  // mount_name
                        adata.rows[ix][1],  // file_system
                        warning,  // warning_value(형변환)
                        critical,  // critical_value(형변환)
                        intrerval,  // interval(형변환)
                        adata.rows[ix][5]   // sms_schedule_name
                    ]);
                }
            }
            self.DiskGrid.drawGrid();

            if ( save_flag ){
                Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Save Success'));
            }

        }, this);

    }
});