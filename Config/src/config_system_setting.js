Ext.define('config.config_system_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    bodyStyle: {
        background: '#eeeeee'
    },

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        this.target = target;

        this.initProperty();
        this.initLayout();
        this.initDataSetting();
    },

    initProperty: function(){
        this.grid = {};
    },

    initLayout: function(){
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: '100%',
            flex: 1,
            margin: '3 5 3 0',
            border: false,
            style: { background: '#ffffff' }
        });

        var vboxCon = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            style: { background: '#ffffff' }
        });

        var sysListPanel = this.createSysListPanel();
        var svrListPanel = this.createSvrListPanel();

        vboxCon.add([sysListPanel, Ext.create('Ext.container.Container', {
            width : '100%',
            margin : '0 0 0 5',
            layout: { type: 'hbox', pack: 'center', align: 'middle' },
            items: [{
                html: '<img src="../PA/images/arrow-down.png" width="15" height="15">',
                border : false
            }]
        }), svrListPanel]);

        var insListPanel = this.createInsListPanel();

        baseCon.add(vboxCon, Ext.create('Ext.container.Container', {
            height : '100%',
            margin : '0 0 0 5',
            layout: { type: 'hbox', pack: 'center', align: 'middle' },
            items: [{
                html: '<img src="../PA/images/arrow-right.png" width="15" height="15">',
                border : false
            }]
        }));

        baseCon.add(insListPanel, Ext.create('Ext.container.Container', {
            height : '100%',
            margin : '0 0 0 5',
            layout: { type: 'hbox', pack: 'center', align: 'middle' },
            items: [{
                html: '<img src="../PA/images/arrow-right.png" width="15" height="15">',
                border : false
            }]
        }));

        var vboxCon2 = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: '100%',
            height: '100%',
            flex: 1,
            margin: '3 5 3 0',
            border: false,
            style: { background: '#ffffff' }
        });

        var tierListPanel = this.createTierListPanel();
        var tierMappingPanel = this.createTierMappingPanel();

        vboxCon2.add([tierListPanel, Ext.create('Ext.container.Container', {
            width : '100%',
            margin : '0 0 0 5',
            layout: { type: 'hbox', pack: 'center', align: 'middle' },
            items: [{
                html: '<img src="../PA/images/arrow-down.png" width="15" height="15">',
                border : false
            }]
        }), tierMappingPanel]);

        var e2eListPanel = this.createE2EListPanel();

        baseCon.add(vboxCon2, { xtype : 'splitter', style : 'background:#cccccc80;margin:3px'}, e2eListPanel);
        this.target.add(baseCon);
    },

    initDataSetting: function(){
        this.onButtonClick('Refresh', 'sys');
        // this.onButtonClick('Refresh', 'svr');
        // this.onButtonClick('Refresh', 'ins');
        // this.onButtonClick('Refresh', 'tier');
        // this.onButtonClick('Refresh', 'tierMapping');
        // this.onButtonClick('Refresh', 'e2e');
    },

    createSysListPanel: function(){
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: '50%',
            flex: 1,
            border: false,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.sysNameToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 130,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Add', 'sys'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_sys_name_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'sys'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_sys_name_delete',
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'sys'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'sys'); }
            }]
        });

        var titleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('System List'))
                },
                this.sysNameToolbar
            ]
        });

        var bodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createGrid('sys');

        bodyCon.add(this.grid['sys']);
        panel.add(titleCon, bodyCon);

        return panel;
    },

    createSvrListPanel: function(){
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: '50%',
            flex: 1,
            border: false,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.svrNameToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 130,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Add', 'svr'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_svr_name_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'svr'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_svr_name_delete',
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'svr'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'svr'); }
            }]
        });

        var titleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('Server List'))
                },
                this.svrNameToolbar
            ]
        });

        var bodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createGrid('svr');

        bodyCon.add(this.grid['svr']);
        panel.add(titleCon, bodyCon);

        return panel;
    },

    createInsListPanel: function(){
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            flex: 1,
            border: false,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.insNameToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 130,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Add', 'ins'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_ins_name_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'ins'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_ins_name_delete',
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'ins'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'ins'); }
            }]
        });

        var titleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('Instance List'))
                },
                this.insNameToolbar
            ]
        });

        var bodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createGrid('ins');

        bodyCon.add(this.grid['ins']);
        panel.add(titleCon, bodyCon);

        return panel;
    },

    createTierListPanel: function(){
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: '50%',
            flex: 1,
            border: false,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.tierNameToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 130,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Add', 'tier'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_tier_name_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'tier'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_tier_name_delete',
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'tier'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'tier'); }
            }]
        });

        var titleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('Tier List'))
                },
                this.tierNameToolbar
            ]
        });

        var bodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createGrid('tier');

        bodyCon.add(this.grid['tier']);
        panel.add(titleCon, bodyCon);

        return panel;
    },

    createTierMappingPanel: function(){
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: '50%',
            flex: 1,
            border: false,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.tierMappingToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 70,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_tier_mapping_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'tierMapping'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'tierMapping'); }
            }]
        });

        var titleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('Instance <-> Tier'))
                },
                this.tierMappingToolbar
            ]
        });

        var bodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createGrid('tierMapping');

        bodyCon.add(this.grid['tierMapping']);
        panel.add(titleCon, bodyCon);

        return panel;
    },

    createE2EListPanel: function(){
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.e2eToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 130,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Add', 'e2e'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_e2e_name_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'e2e'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_e2e_name_delete',
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'e2e'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh', 'e2e'); }
            }]
        });

        var titleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('E2E 설정'))
                },
                this.e2eToolbar
            ]
        });

        var bodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createGrid('e2e');

        bodyCon.add(this.grid['e2e']);
        panel.add(titleCon, bodyCon);

        return panel;
    },

    createGrid: function(key){
        var self = this;

        switch (key) {
            case 'sys' :

                this.grid[key] = Ext.create('Exem.adminGrid', {
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
                        self.sysNameToolbar.getComponent('cfg_sys_name_edit').setDisabled(false);
                        self.sysNameToolbar.getComponent('cfg_sys_name_delete').setDisabled(false);
                    }

                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: 'sys_id'                      ,   dataIndex: 'sys_id',    width: 120, type: Grid.Number      , alowEdit: false, editMode: false, hide: true});
                this.grid[key].addColumn({text: common.Util.CTR('Name')       ,   dataIndex: 'name'  ,    width: 120, type: Grid.String      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Description'),   dataIndex: 'desc'  ,    width: 120, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].endAddColumns();

                break;
            case 'svr' :

                this.grid[key] = Ext.create('Exem.adminGrid', {
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
                        self.svrNameToolbar.getComponent('cfg_svr_name_edit').setDisabled(false);
                        self.svrNameToolbar.getComponent('cfg_svr_name_delete').setDisabled(false);
                    }
                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: common.Util.CTR('ID') ,         dataIndex: 'server_id', width: 80, type: Grid.String      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('HOST'),        dataIndex: 'host'  ,    width: 80, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('ADDR'),        dataIndex: 'addr'  ,    width: 80, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Description'), dataIndex: 'desc'  ,    width: 80, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].endAddColumns();

                break;
            case 'ins' :

                this.grid[key] = Ext.create('Exem.adminGrid', {
                    cls: 'xm-config-toggle',
                    width : '100%',
                    height: '100%',
                    editMode: false,
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
                        self.insNameToolbar.getComponent('cfg_ins_name_edit').setDisabled(false);
                        self.insNameToolbar.getComponent('cfg_ins_name_delete').setDisabled(false);
                    },
                    cellclick:function(thisGrid, td, cellIndex, record) {
                        if (cellIndex == 4) {
                            if (record.get('reject_setting') == 0) {
                                record.set('reject_setting', 1);
                                record.set('modify', (record.get('reject_status') != record.get('reject_setting')));

                            } else {
                                record.set('reject_setting', 0);
                                record.set('modify', (record.get('reject_status') != record.get('reject_setting')));
                            }

                            if (record.data.depth > 0) {
                                if (record.hasChildNodes()) {
                                    record.cascadeBy(function(n) {
                                        if (n.get('reject_setting') != record.get('reject_setting')) {
                                            n.set('reject_setting', record.get('reject_setting'));
                                        }
                                        n.set('modify', (n.get('reject_status') != n.get('reject_setting')));
                                    });
                                }
                                this.setParentState(record, record.get('reject_setting'));
                            }
                        }
                    },
                    configRowClass: function(record){
                        if (record.get('reject_status') != record.get('reject_setting')) {
                            if (record.get('reject_setting') == 0) {
                                return 'modify-row allow';
                            } else {
                                return 'modify-row reject';
                            }
                        }
                    }
                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: common.Util.CTR('Instance ID'),   dataIndex: 'inst_id' ,    width: 80, type: Grid.String      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Type')       ,   dataIndex: 'type'    ,    width: 80, type: Grid.String      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Name')       ,   dataIndex: 'name'    ,    width: 80, type: Grid.String      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('사용여부')     ,  dataIndex: 'reject_setting', width: 110, type: Grid.String,   alowEdit: false, editMode: false,
                    renderer: function(v, m, r) {

                        if (r.get('reject_setting') == 0) {
                            return '<div class="x-toggle-slide-container" style="width: 92px;">' +
                                '<div style="left: 0px; z-index: 10000; width: 39px;" class="x-toggle-slide-thumb" ></div><div class="holder">' +
                                '<label class="x-toggle-slide-label-on" style="width: 68.5px; margin-left: -45px;"><span style="font-size:8pt;">'+common.Util.TR('Reject')+'</span></label>' +
                                '<label class="x-toggle-slide-label-off" style="width: 68.5px;"><span><span style="font-size:8pt;">'+common.Util.TR('Allow')+'</span></span></label></div></div>';
                        } else {
                            return '<div class="x-toggle-slide-container" style="width: 92px;">' +
                                '<div style="left: 45px; z-index: 10000; width: 39px;" class="x-toggle-slide-thumb" ></div><div class="holder">' +
                                '<label class="x-toggle-slide-label-on" style="width: 68.5px; margin-left: 0px;"><span><span style="font-size:8pt;">'+common.Util.TR('Reject')+'</span></span></label>' +
                                '<label class="x-toggle-slide-label-off" style="width: 68.5px;"><span><span style="font-size:8pt;">'+common.Util.TR('Allow')+'</span></span></label></div></div>';
                        }
                    }
                });
                this.grid[key].endAddColumns();

                break;
            case 'tier' :

                this.grid[key] = Ext.create('Exem.adminTree', {
                    width : '100%',
                    height: '100%',
                    editMode: false,
                    useCheckBox: false,
                    checkMode: Grid.checkMode.MULTI,
                    showHeaderCheckbox: false,
                    localeType: 'H:i:s',
                    defaultHeaderHeight: 26,
                    usePager: false,
                    useEmptyText: true,
                    bufferedRenderer: true,
                    sortableColumns: false,
                    emptyTextMsg: common.Util.TR('No data to display'),
                    itemclick:function() {
                        self.tierNameToolbar.getComponent('cfg_tier_name_edit').setDisabled(false);
                        self.tierNameToolbar.getComponent('cfg_tier_name_delete').setDisabled(false);
                    }
                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: common.Util.CTR('Name') ,         dataIndex: 'tier_name',    width: 120, type: Grid.tree      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Tier Type'),     dataIndex: 'tier_type',    width: 120, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Description'),   dataIndex: 'desc'     ,    width: 120, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].endAddColumns();

                break;
            case 'tierMapping' :

                this.grid[key] = Ext.create('Exem.adminGrid', {
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
                    defaultPageSize: 300
                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: common.Util.CTR('Agent Name') ,   dataIndex: 'tier_id',    width: 120, type: Grid.String      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Description'),   dataIndex: 'desc'  ,    width: 120, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].endAddColumns();

                break;
            case 'e2e' :

                this.grid[key] = Ext.create('Exem.adminGrid', {
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
                        self.e2eToolbar.getComponent('cfg_e2e_name_edit').setDisabled(false);
                        self.e2eToolbar.getComponent('cfg_e2e_name_delete').setDisabled(false);
                    }
                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: common.Util.CTR('Name') ,   dataIndex: 'name',    width: 120, type: Grid.String      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Description'),   dataIndex: 'desc'  ,    width: 120, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].endAddColumns();

                break;
        }


    },

    onButtonClick: function(cmd, key) {
        var self = this,
            wasForm, rowData, systemID;

        if (key == 'sys') {
            wasForm = Ext.create('config.config_sysname_form');
        } else if (key == 'svr') {
            wasForm = Ext.create('config.config_svrname_form');
        } else if (key == 'ins') {
            wasForm = Ext.create('config.config_insname_form');
        } else if (key == 'tier') {
            wasForm = Ext.create('config.config_tiername_form');
        } else if (key == 'e2e') {
            wasForm = Ext.create('config.config_e2ename_form');
        }

        switch (cmd) {
            case 'Add' :
                wasForm.parent = this;
                wasForm.init('Add');
                break;
            case 'Edit' :
                if (key == 'tierMapping') {
                    this.showOrderingWindow();

                } else {
                    rowData = this.grid[key].getSelectedRow()[0].data;
                    wasForm.parent = this;
                    wasForm.systemID = rowData.sys_id;
                    wasForm.name  = rowData.name;
                    wasForm.desc  = rowData.desc;
                    wasForm.init('Edit');
                }

                break;
            case 'Delete' :
                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        rowData = self.grid[key].getSelectedRow()[0].data;
                        systemID = rowData['sys_id'];

                        Ext.Ajax.request({
                            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID,
                            method : 'DELETE',
                            success : function(response) {
                                console.log(response);
                                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                self.onButtonClick('Refresh', 'sys');
                            },
                            failure : function(){}
                        });
                    }
                });
                break;
            case 'Refresh' :
                if (this.refreshLoading) {
                    return;
                }

                if (key == 'tier') {
                    this.grid[key].clearNodes();
                } else {
                    this.grid[key].clearRows();
                }

                this.executeSQL(key);

                this.sysNameToolbar.getComponent('cfg_sys_name_edit').setDisabled(true);
                this.sysNameToolbar.getComponent('cfg_sys_name_delete').setDisabled(true);

                this.svrNameToolbar.getComponent('cfg_svr_name_edit').setDisabled(true);
                this.svrNameToolbar.getComponent('cfg_svr_name_delete').setDisabled(true);

                this.insNameToolbar.getComponent('cfg_ins_name_edit').setDisabled(true);
                this.insNameToolbar.getComponent('cfg_ins_name_delete').setDisabled(true);

                this.tierNameToolbar.getComponent('cfg_tier_name_edit').setDisabled(true);
                this.tierNameToolbar.getComponent('cfg_tier_name_delete').setDisabled(true);

                this.e2eToolbar.getComponent('cfg_e2e_name_edit').setDisabled(true);
                this.e2eToolbar.getComponent('cfg_e2e_name_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    executeSQL: function(key) {
        var self = this,
            ix, ixLen, data;

        switch (key) {
            case 'sys' :
                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system',
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.success === 'true') {
                            data = result.data;
                            self.grid[key].clearRows();

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.grid[key].addRow([data[ix].sys_id, data[ix].name, data[ix].desc]);
                            }

                            self.grid[key].drawGrid();
                        }
                    },
                    failure : function(){}
                });

                break;
            case 'svr' :
                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/',
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.success === 'true') {
                            data = result.data;
                            self.grid[key].clearRows();

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.grid[key].addRow([data[ix].sys_id, data[ix].name, data[ix].desc]);
                            }

                            self.grid[key].drawGrid();
                        }
                    },
                    failure : function(){}
                });

                self.grid[key].addRow(['WAS1', 'DESC']);
                self.grid[key].addRow(['WAS1', 'DESC']);
                self.grid[key].addRow(['WAS1', 'DESC']);

                break;
            case 'ins' :
                self.grid[key].addRow(['DB1', "DB", "Oracle", 0]);
                self.grid[key].addRow(['DB1', "DB", "Oracle", 0]);
                self.grid[key].addRow(['DB1', "DB", "Oracle", 0]);

                break;
            case 'tier' :
                var tier = self.grid[key].addNode(null, ['Tier Name1', 'TYPE', 'DESC']);
                self.grid[key].addNode(tier, ['Tier Name2', 'TYPE', 'DESC']);
                self.grid[key].addNode(tier, ['Tier Name3', 'TYPE', 'DESC']);

                break;
            case 'tierMapping' :
                self.grid[key].addRow(['WAS1', 'DESC']);
                self.grid[key].addRow(['WAS1', 'DESC']);
                self.grid[key].addRow(['WAS1', 'DESC']);

                break;
            case 'e2e' :
                self.grid[key].addRow(['WAS1', 'DESC']);
                self.grid[key].addRow(['WAS1', 'DESC']);
                self.grid[key].addRow(['WAS1', 'DESC']);

                break;
        }

        if (key == 'tier') {
            self.grid[key].drawTree();
            self.grid[key].baseTree.setDisabled(true);
        } else {
            self.grid[key].drawGrid();
            if (key != 'sys') {
                self.grid[key].baseGrid.setDisabled(true);
            }
        }

        this.refreshLoading = false;
    },

    changeWasInfo: function(systemID, name, desc, key) {
        var ix, ixLen, record;

        for (ix = 0, ixLen = this.grid[key].getRowCount(); ix < ixLen; ix++) {
            if (this.grid[key].getRow(ix).data.sys_id == systemID) {
                record = this.grid[key].findRow('sys_id', systemID);
                record.set('name', name);
                record.set('desc', desc);
                break;
            }
        }
    },

    showOrderingWindow: function(){
        var orderList, selectedGrid;
        var ix, ixLen;

        selectedGrid = this.grid['tierMapping'];

        orderList = [];
        for(ix = 0, ixLen = selectedGrid.getRowCount(); ix < ixLen; ix++){
            orderList.push(selectedGrid.getRow(ix).data);
        }

        console.log(orderList);

        var orderingWindow = Ext.create('Exem.MoveColumnWindow', {
            type : 'Tier',
            width : 800,
            height : 500,
            parent : this,
            title : common.Util.TR('Tier Order Settings'),
            columnInfo : orderList,
            useDefaultBtn : false,
            leftGridTitle : common.Util.TR('Current Order'),
            rightGridTitle : common.Util.TR('Modified Order'),
            okFn : this.apply
        });

        orderingWindow.initBase();
    },
});
