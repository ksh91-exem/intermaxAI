Ext.define('config.config_tier_information', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    bodyStyle: {
        background: '#eeeeee'
    },

    sql: {
        tier_info   : 'IMXConfig_Tier_Info.sql',
        tier_delete : 'IMXConfig_Tier_Delete.sql'
    },

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        var self = this;
        this.target = target;

        this.refresh_loading = false ;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: 700,
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var tierInfoPanel = Ext.create('Ext.panel.Panel', {
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

        var tierInfoPanelTitle = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('Tier Meta Information'))
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
                    id: 'cfg_tier_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_tier_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var tierInfoPanelBody = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        tierInfoPanel.add(tierInfoPanelTitle, tierInfoPanelBody);

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

        tierInfoPanelBody.add(gridPanel);
        panel.add(tierInfoPanel);
        this.target.add(panel);

        // adminGrid
        this.tierInfoGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function() {
                Ext.getCmp('cfg_tier_edit').setDisabled(false);
                Ext.getCmp('cfg_tier_delete').setDisabled(false);
            }
        });
        gridPanel.add(this.tierInfoGrid);

        this.tierInfoGrid.beginAddColumns();
        this.tierInfoGrid.addColumn({text: common.Util.CTR('ID'),         dataIndex: 'tier_id',       width: 150, type: Grid.String, alowEdit: false, editMode: false, hide:true});
        this.tierInfoGrid.addColumn({text: common.Util.CTR('Tier ID'),    dataIndex: 'tier_id_key',       width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.tierInfoGrid.addColumn({text: common.Util.CTR('Tier Name'),  dataIndex: 'tier_name',     width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.tierInfoGrid.addColumn({text: common.Util.CTR('Tier Type'),  dataIndex: 'tier_type_key',     width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.tierInfoGrid.endAddColumns();

        // Get Data
        this.onButtonClick('Refresh');

    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        var self = this;
        var data;
        var tierInfo = Ext.create('config.config_tier_information_form');
        var dataSet = {};

        switch (cmd) {
            case 'Add' :
                tierInfo.parent = this;
                tierInfo.init('Add');
                break;
            case 'Edit' :
                data = this.tierInfoGrid.getSelectedRow()[0].data;
                tierInfo.parent         = this;
                tierInfo.tier_id        = data.tier_id;
                tierInfo.tier_id_key    = data.tier_id_key;
                tierInfo.tier_name      = data.tier_name;
                tierInfo.tier_type_key  = data.tier_type_key;
                tierInfo.init('Edit');
                break;
            case 'Delete' :
                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        data = self.tierInfoGrid.getSelectedRow()[0].data;
                        dataSet.sql_file = self.sql.tier_delete;
                        dataSet.bind = [{
                            name: 'tierId',
                            value: data.tier_id,
                            type : SQLBindType.INTEGER
                        }];

                        if(common.Util.isMultiRepository()) {
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
                this.tierInfoGrid.clearRows();
                this.executeSQL();

                Ext.getCmp('cfg_tier_edit').setDisabled(true);
                Ext.getCmp('cfg_tier_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var self = this;
        var ix,ixLen;
        var dataSet = {};

        dataSet.sql_file = this.sql.tier_info;

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if(!common.Util.checkSQLExecValid(aheader, adata)){
                console.debug('config_tier_information - executeSQL');
                console.debug(aheader);
                console.debug(adata);
                return;
            }


            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                self.tierInfoGrid.addRow([
                    adata.rows[ix][0],  // tier_id
                    adata.rows[ix][1],  // tier_id_key
                    adata.rows[ix][2],  // tier_name
                    adata.rows[ix][3]   // tier_type_key
                ]);
            }
            self.tierInfoGrid.drawGrid();

            this.refresh_loading = false ;
        }, this);
    }
});
