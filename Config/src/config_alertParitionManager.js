Ext.define('config.config_alertParitionManager', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    data: [],
    target: undefined,
    buttons: [common.Util.TR('Add'), common.Util.TR('Save'), common.Util.TR('Delete'), common.Util.TR('Refresh')],
    select_tablename: '',
    select_retentionday: '',

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
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_partitionmgr_edit',
                scope: this,
                handler: function() { self.onButtonClick('Edit RetentionDay'); }
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

        var partition_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var partition_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Partition Retention Period Settings'))
            }]
        });

        var partition_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        partition_panel.add(partition_panel_title);
        partition_panel.add(partition_panel_body);

        //

        this._createBusinessGrid(partition_panel_body);

        //

        panel.add(partition_panel);

        this.target.add(toolbar);
        this.target.add(hbar);
        this.target.add(panel);

        this.refresh_PartitionManage();
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Edit RetentionDay' :
                if (this.partition_grid.getSelectedRow().length == 0) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please select Parition table.'));
                    return;
                }
                this.edit_PartitionManage();
                break;
            case 'Refresh' :
                this.refresh_PartitionManage();
                break;
            default :
                break;
        }
    },

    _createBusinessGrid: function(gridpanel) {
        var self = this;
        this.partition_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: false,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function(dv, record) {
                self.TablenameClick(record.data);

                var edit = Ext.getCmp('cfg_partitionmgr_edit');
                if (edit) {
                    edit.setDisabled(false);
                }

                edit = null;
            }
        });
        gridpanel.add(this.partition_grid);

        this.partition_grid.beginAddColumns();
        this.partition_grid.addColumn({text: common.Util.CTR('Table Name'),    dataIndex: 'table_name',   width: 400, type: Grid.String, alowEdit: false, editMode: false});
        this.partition_grid.addColumn({text: common.Util.CTR('Retention Period'), dataIndex: 'retentionday', width: 150, type: Grid.Number, alowEdit: false, editMode: false});
        this.partition_grid.endAddColumns();
    },

    TablenameClick: function(d) {
        this.select_tablename = d['table_name'];
        this.select_retentionday = d['retentionday'];
    },

    executeSQL_ParitionManage: function() {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Partition_Manage.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData_PartitionManage, this);
    },

    onData_PartitionManage: function(aheader, adata) {
        var d = null;

        this.partition_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            d = adata.rows[ix];
            this.partition_grid.addRow([
                // tablename
                d[0],
                // retention days
                d[1]
            ]);
        }
        this.partition_grid.drawGrid();
    },

    edit_PartitionManage: function() {
        var partition_form = Ext.create('config.config_alertParitionManager_form');
        partition_form.parent = this;
        partition_form.init('Edit');
    },

    refresh_PartitionManage: function() {
        this.executeSQL_ParitionManage();

        var edit = Ext.getCmp('cfg_partitionmgr_edit');
        if (edit) {
            edit.setDisabled(false);
        }

        edit = null;
    }
});
