Ext.define('config.config_tier_code_enrollment', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    bodyStyle: {
        background: '#eeeeee'
    },

    sql: {
        tier_code_delete : 'IMXConfig_Tier_Code_Delete.sql',
        tier_code_info : 'IMXConfig_Tier_Code_Info.sql'
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

        var tierIdPanel = Ext.create('Ext.panel.Panel', {
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

        var tierIdPanelTitle = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('Tier ID List'))
            }, {
                xtype: 'toolbar',
                width: 130,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_add.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Add','id'); }
                }, {
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_tier_id_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit','id'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_tier_id_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete','id'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh','id'); }
                }]
            }]
        });

        var tierIdPanelBody = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        tierIdPanel.add(tierIdPanelTitle, tierIdPanelBody);

        var tierTypePanel = Ext.create('Ext.panel.Panel', {
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

        var tierTypePanelTitle = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('Tier Type List'))
            }, {
                xtype: 'toolbar',
                width: 130,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_add.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Add','type'); }
                }, {
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_tier_type_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit','type'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_tier_type_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete','type'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh','type'); }
                }]
            }]
        });

        var tierTypePanelBody = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        tierTypePanel.add(tierTypePanelTitle, tierTypePanelBody);

        this.createTierIdGrid(tierIdPanelBody);
        this.createTierTypeGrid(tierTypePanelBody);


        panel.add(tierIdPanel);
        panel.add(tierTypePanel);
        this.target.add(panel);

        // Get Data
        this.onButtonClick('bothRefresh');
    },

    createTierIdGrid: function(gridPanel){
        this.tierIdGrid = Ext.create('Exem.adminGrid', {
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
                Ext.getCmp('cfg_tier_id_edit').setDisabled(false);
                Ext.getCmp('cfg_tier_id_delete').setDisabled(false);
            }
        });
        gridPanel.add(this.tierIdGrid);

        this.tierIdGrid.beginAddColumns();
        this.tierIdGrid.addColumn({text: common.Util.CTR('Code ID'),  dataIndex: 'code_id',     width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.tierIdGrid.addColumn({text: common.Util.CTR('Tier ID'),  dataIndex: 'tier_id',     width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.tierIdGrid.endAddColumns();
    },

    createTierTypeGrid: function(gridPanel){
        this.tierTypeGrid = Ext.create('Exem.adminGrid', {
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
                Ext.getCmp('cfg_tier_type_edit').setDisabled(false);
                Ext.getCmp('cfg_tier_type_delete').setDisabled(false);
            }
        });
        gridPanel.add(this.tierTypeGrid);

        this.tierTypeGrid.beginAddColumns();
        this.tierTypeGrid.addColumn({text: common.Util.CTR('Code ID'),    dataIndex: 'code_id',       width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.tierTypeGrid.addColumn({text: common.Util.CTR('Tier Type'),  dataIndex: 'tier_type',     width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.tierTypeGrid.endAddColumns();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd, codeType) {
        var self = this;
        var data;
        var dataSet = {};
        var tierCode = Ext.create('config.config_tier_code_enrollment_form');
        var codeId;

        switch (cmd) {
            case 'Add' :
                tierCode.parent     = this;
                tierCode.codeType   = codeType;
                tierCode.init('Add');
                break;
            case 'Edit' :
                if(codeType === 'id'){
                    data = this.tierIdGrid.getSelectedRow()[0].data;
                    tierCode.tier_id    = data.tier_id;
                } else if(codeType === 'type'){
                    data = this.tierTypeGrid.getSelectedRow()[0].data;
                    tierCode.tier_type  = data.tier_type;
                }

                tierCode.parent     = this;
                tierCode.codeType   = codeType;
                tierCode.code_id    = data.code_id;
                tierCode.init('Edit');
                break;
            case 'Delete' :
                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {

                        if(codeType === 'id'){
                            codeId = self.tierIdGrid.getSelectedRow()[0].data.code_id;
                        } else if(codeType === 'type'){
                            codeId = self.tierTypeGrid.getSelectedRow()[0].data.code_id;
                        }

                        dataSet.sql_file = self.sql.tier_code_delete;

                        dataSet.bind = [{
                            name: 'codeType',
                            value: codeType,
                            type : SQLBindType.STRING
                        },{
                            name: 'codeId',
                            value: codeId,
                            type : SQLBindType.INTEGER
                        }];

                        if(common.Util.isMultiRepository()) {
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function() {
                            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                            self.onButtonClick('Refresh',codeType);
                        }, this);
                    }
                });
                break;
            case 'Refresh' :
                if ( this.refresh_loading ){
                    return ;
                }

                this.refresh_loading = true ;

                if(codeType === 'id'){
                    this.executeSQL(this.tierIdGrid, codeType);
                } else if(codeType === 'type'){
                    this.executeSQL(this.tierTypeGrid, codeType);
                }
                break;
            case 'bothRefresh' :
                this.executeSQL(this.tierIdGrid,'id');
                this.executeSQL(this.tierTypeGrid,'type');
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function(grid, codeType) {
        var ix, ixLen;
        var dataSet = {};

        if(codeType === 'id'){
            Ext.getCmp('cfg_tier_id_edit').setDisabled(true);
            Ext.getCmp('cfg_tier_id_delete').setDisabled(true);
        } else if(codeType === 'type'){
            Ext.getCmp('cfg_tier_type_edit').setDisabled(true);
            Ext.getCmp('cfg_tier_type_delete').setDisabled(true);
        }

        dataSet.sql_file = this.sql.tier_code_info;

        dataSet.bind = [{
            name: 'codeType',
            value: codeType,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if(!common.Util.checkSQLExecValid(aheader, adata)){
                console.debug('config_tier_code_enrollment - executeSQL');
                console.debug(aheader);
                console.debug(adata);
                return;
            }

            grid.clearRows();
            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                grid.addRow([
                    adata.rows[ix][0],   //code_id
                    adata.rows[ix][1]    //code_name
                ]);
            }
            grid.drawGrid();

            this.refresh_loading = false ;
        }, this);
    }
});
