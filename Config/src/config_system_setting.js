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

        this.isInit = true;
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

        baseCon.add(vboxCon2, { xtype : 'splitter', style : 'background:#cccccc80;margin:3px' }, e2eListPanel);
        this.target.add(baseCon);
    },

    initDataSetting: function(){
        this.onButtonClick('Refresh', 'sys');
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
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'sys'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_sys_name_delete',
                disabled: true,
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
                id: 'cfg_svr_name_add',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Add', 'svr', this.grid['sys'].getSelectedRow()[0].data.sys_id); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_svr_name_edit',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'svr', this.grid['sys'].getSelectedRow()[0].data.sys_id); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_svr_name_delete',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'svr'); }
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
                id: 'cfg_ins_name_add',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Add', 'ins', this.grid['sys'].getSelectedRow()[0].data.sys_id); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_ins_name_edit',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'ins', this.grid['sys'].getSelectedRow()[0].data.sys_id); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_ins_name_delete',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'ins'); }
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
                id: 'cfg_tier_name_add',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Add', 'tier', this.grid['sys'].getSelectedRow()[0].data.sys_id); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_tier_name_edit',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'tier', this.grid['sys'].getSelectedRow()[0].data.sys_id); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_tier_name_delete',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Delete', 'tier'); }
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
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Edit', 'tierMapping', this.grid['sys'].getSelectedRow()[0].data.sys_id, this.grid['tier'].getSelectedRow()[0].data.tier_id); }
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
                    itemclick: function(dv, record, item, index) {
                        self.sysNameToolbar.getComponent('cfg_sys_name_edit').setDisabled(false);
                        self.sysNameToolbar.getComponent('cfg_sys_name_delete').setDisabled(false);

                        self.grid['tierMapping'].clearRows();
                        self.onButtonClick('Refresh', 'svr', record.raw.sys_id);
                        self.onButtonClick('Refresh', 'ins', record.raw.sys_id);
                        self.onButtonClick('Refresh', 'tier', record.raw.sys_id);
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
                    itemclick: function(dv, record, item, index) {
                        self.svrNameToolbar.getComponent('cfg_svr_name_edit').setDisabled(false);
                        self.svrNameToolbar.getComponent('cfg_svr_name_delete').setDisabled(false);
                    }
                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: 'sys_id'                             , dataIndex: 'sys_id'       , width: 80, type: Grid.String      , alowEdit: false, editMode: false, hide: true});
                this.grid[key].addColumn({text: common.Util.CTR('Instance ID')       , dataIndex: 'inst_id'      , width: 80, type: Grid.String      , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Host Name')         , dataIndex: 'host_name'    , width: 80, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('address')           , dataIndex: 'addr'         , width: 80, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Name')              , dataIndex: 'name'         , width: 80, type: Grid.String      , alowEdit: false, editMode: false, hide: true});
                this.grid[key].addColumn({text: common.Util.CTR('Description')       , dataIndex: 'desc'         , width: 80, type: Grid.StringNumber, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('isEnabled')         , dataIndex: 'enable'       , width: 80, type: Grid.String      , alowEdit: false, editMode: false, hide: true})
                this.grid[key].addColumn({text: common.Util.CTR('Automatic Learning'), dataIndex: 'auto_training', width: 80, type: Grid.String      , alowEdit: false, editMode: false, hide: true})
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
                    itemclick: function(dv, record, item, index) {
                        self.insNameToolbar.getComponent('cfg_ins_name_edit').setDisabled(false);
                        self.insNameToolbar.getComponent('cfg_ins_name_delete').setDisabled(false);
                    },
                    cellclick:function(thisGrid, td, cellIndex, record) {
                        if (cellIndex == 6) {
                            if (record.get('enable') == 0) {
                                record.set('enable', 1);

                            } else {
                                record.set('enable', 0);
                            }

                            self.enableInstance(record.data);
                        }
                    },
                    configRowClass: function(record){
                        if (record.get('enable') != record.get('enable')) {
                            if (record.get('enable') == 0) {
                                return 'modify-row allow';
                            } else {
                                return 'modify-row reject';
                            }
                        }
                    }
                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: 'sys_id'                      ,   dataIndex: 'sys_id' , width: 80 , type: Grid.String, alowEdit: false, editMode: false, hide: true});
                this.grid[key].addColumn({text: common.Util.CTR('Instance ID'),   dataIndex: 'inst_id', width: 80 , type: Grid.String, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Type')       ,   dataIndex: 'type'   , width: 80 , type: Grid.String, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Name')       ,   dataIndex: 'name'   , width: 80 , type: Grid.String, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Description'),   dataIndex: 'desc'   , width: 80 , type: Grid.String, alowEdit: false, editMode: false, hide: true});
                this.grid[key].addColumn({text: common.Util.CTR('isEnabled')  ,   dataIndex: 'enable' , width: 110, type: Grid.String, alowEdit: false, editMode: false,
                    renderer: function(v, m, r) {
                        if (r.get('enable') == 0) {
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
                    itemclick: function(dv, record, eOpts) {
                        self.tierNameToolbar.getComponent('cfg_tier_name_edit').setDisabled(false);
                        self.tierNameToolbar.getComponent('cfg_tier_name_delete').setDisabled(false);

                        self.onButtonClick('Refresh', 'tierMapping', record.raw.sys_id, record.raw.tier_id);
                    }
                });

                this.grid[key].beginAddColumns();
                this.grid[key].addColumn({text: 'sys_id'                      , dataIndex: 'sys_id' , width: 120, type: Grid.String, alowEdit: false, editMode: false, hide: true});
                this.grid[key].addColumn({text: 'tier_id'                     , dataIndex: 'tier_id', width: 120, type: Grid.String, alowEdit: false, editMode: false, hide: true});
                this.grid[key].addColumn({text: common.Util.CTR('Name')       , dataIndex: 'name'   , width: 120, type: Grid.tree  , alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Tier Type')  , dataIndex: 'type'   , width: 120, type: Grid.String, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Description'), dataIndex: 'desc'   , width: 120, type: Grid.String, alowEdit: false, editMode: false});
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
                this.grid[key].addColumn({text: 'sys_id'                      ,   dataIndex: 'sys_id', width: 120, type: Grid.String, alowEdit: false, editMode: false, hide: true});
                this.grid[key].addColumn({text: common.Util.CTR('Instance ID'),   dataIndex: 'inst_id' , width: 120, type: Grid.String, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('Description'),   dataIndex: 'desc'  , width: 120, type: Grid.String, alowEdit: false, editMode: false});
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

    onButtonClick: function(cmd, key, id, id2) {
        var self = this,
            wasForm, rowData, systemID, instID, tierID;

        switch (cmd) {
            case 'Add' :
                if (key == 'sys') {
                    wasForm = Ext.create('config.config_sysname_form');
                } else if (key == 'svr') {
                    wasForm = Ext.create('config.config_svrname_form');
                    wasForm.systemID = id;
                } else if (key == 'ins') {
                    wasForm = Ext.create('config.config_insname_form');
                    wasForm.systemID = id;
                } else if (key == 'tier') {
                    wasForm = Ext.create('config.config_tiername_form');
                    wasForm.systemID = id;
                } else if (key == 'e2e') {
                    wasForm = Ext.create('config.config_e2ename_form');
                }

                wasForm.parent = this;
                wasForm.init('Add');

                break;

            case 'Edit' :
                if (key == 'tierMapping') {
                    this.showOrderingWindow();
                } else {
                    rowData = this.grid[key].getSelectedRow()[0].data;

                    if (key == 'sys') {
                        wasForm = Ext.create('config.config_sysname_form');
                        wasForm.systemID = rowData.sys_id;
                        wasForm.name  = rowData.name;
                        wasForm.desc  = rowData.desc;

                    } else if (key == 'svr') {
                        wasForm = Ext.create('config.config_svrname_form');
                        wasForm.systemID = rowData.sys_id;
                        wasForm.instID   = rowData.inst_id;
                        wasForm.hostName = rowData.host_name;
                        wasForm.addr     = rowData.addr;
                        wasForm.name     = rowData.name;
                        wasForm.desc     = rowData.desc;
                        wasForm.enable   = rowData.enable;
                        wasForm.autoTraining = rowData.auto_training;

                    } else if (key == 'ins') {
                        wasForm = Ext.create('config.config_insname_form');
                        wasForm.systemID = rowData.sys_id;
                        wasForm.instID   = rowData.inst_id;
                        wasForm.type     = rowData.type;
                        wasForm.name     = rowData.name;
                        wasForm.desc     = rowData.desc;

                    } else if (key == 'tier') {
                        wasForm = Ext.create('config.config_tiername_form');
                        wasForm.systemID = rowData.sys_id;
                        wasForm.tierID   = rowData.tier_id;
                        wasForm.name     = rowData.name;
                        wasForm.type     = rowData.type;
                        wasForm.desc     = rowData.desc;

                    } else if (key == 'e2e') {
                        wasForm = Ext.create('config.config_e2ename_form');
                    }

                    wasForm.parent = this;
                    wasForm.init('Edit');
                }

                break;

            case 'Delete' :
                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        if (key == 'sys') {
                            rowData = self.grid[key].getSelectedRow()[0].data;
                            systemID = rowData['sys_id'];

                            Ext.Ajax.request({
                                url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID,
                                method : 'DELETE',
                                success : function(response) {
                                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                    self.onButtonClick('Refresh', 'sys');
                                },
                                failure : function(){}
                            });

                        } else if (key == 'svr') {
                            rowData = self.grid[key].getSelectedRow()[0].data;
                            systemID = rowData['sys_id'];
                            instID = rowData['inst_id'];

                            Ext.Ajax.request({
                                url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/os/' + instID,
                                method : 'DELETE',
                                success : function(response) {
                                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                    self.onButtonClick('Refresh', 'svr', systemID);
                                    self.onButtonClick('Refresh', 'ins', systemID);
                                },
                                failure : function(){}
                            });
                        } else if (key == 'ins') {
                            rowData = self.grid[key].getSelectedRow()[0].data;
                            systemID = rowData['sys_id'];
                            instID = rowData['inst_id'];

                            Ext.Ajax.request({
                                url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/instance/' + instID,
                                method : 'DELETE',
                                success : function(response) {
                                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                    self.onButtonClick('Refresh', 'svr', systemID);
                                    self.onButtonClick('Refresh', 'ins', systemID);
                                },
                                failure : function(){}
                            });
                        } else if (key == 'tier') {
                            rowData = self.grid[key].getSelectedRow()[0].data;
                            systemID = rowData['sys_id'];
                            tierID = rowData['tier_id'];

                            Ext.Ajax.request({
                                url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/tier/' + tierID,
                                method : 'DELETE',
                                success : function(response) {
                                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                    self.onButtonClick('Refresh', 'tier', systemID);
                                },
                                failure : function(){}
                            });
                        }

                    }
                });
                break;
            case 'Refresh' :
                if (key == 'tier') {
                    this.grid[key].clearNodes();
                } else {
                    this.grid[key].clearRows();
                }

                this.executeSQL(key, id, id2);

                break;

            default:
                break;
        }
    },

    executeSQL: function(key, id, id2) {
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
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + id + '/os',
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.success === 'true') {
                            data = result.data;
                            self.grid[key].clearRows();

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.grid[key].addRow([data[ix].sys_id, data[ix].inst_id, data[ix].host_name, data[ix].addr, data[ix].name, data[ix].desc, data[ix].enable, data[ix].auto_training]);
                            }

                            self.grid[key].drawGrid();
                            self.svrNameToolbar.getComponent('cfg_svr_name_add').setDisabled(false);
                            self.grid[key].baseGrid.setDisabled(false);
                        }
                    },
                    failure : function(){}
                });

                break;
            case 'ins' :
                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + id + '/instance',
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.success === 'true') {
                            data = result.data;
                            self.grid[key].clearRows();

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.grid[key].addRow([data[ix].sys_id, data[ix].inst_id, data[ix].type, data[ix].name, data[ix].desc, data[ix].enable]);
                            }

                            self.grid[key].drawGrid();
                            self.insNameToolbar.getComponent('cfg_ins_name_add').setDisabled(false);
                            self.grid[key].baseGrid.setDisabled(false);
                        }
                    },
                    failure : function(){}
                });

                break;
            case 'tier' :
                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + id + '/tier',
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);
                        var treeObj = {};

                        if (result.success === 'true') {
                            data = result.data;
                            self.grid[key].clearNodes();

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                if (data[ix].parent_id == 0) {
                                    treeObj[data[ix].tier_id] = self.grid[key].addNode(null, [data[ix].sys_id, data[ix].tier_id, data[ix].name, data[ix].type, data[ix].desc]);
                                } else {
                                    treeObj[data[ix].tier_id] = self.grid[key].addNode(treeObj[data[ix].parent_id], [data[ix].sys_id, data[ix].tier_id, data[ix].name, data[ix].type, data[ix].desc]);
                                }
                            }

                            self.grid[key].drawTree();
                            self.tierNameToolbar.getComponent('cfg_tier_name_add').setDisabled(false);
                            self.grid[key].baseTree.setDisabled(false);

                            self.grid[key].baseTree.getView().getSelectionModel().select(0);
                            self.grid[key].baseTree.fireEvent('itemclick', self.grid[key].baseTree, self.grid[key].baseTree.getSelectionModel().getLastSelected());
                        }
                    },
                    failure : function(){}
                });

                break;
            case 'tierMapping' :
                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + id + '/tiermap/' + id2,
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);

                        if (result.success === 'true') {
                            data = result.data;
                            self.grid[key].clearRows();

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.grid[key].addRow([data[ix].sys_id, data[ix].inst_id, data[ix].desc]);
                            }

                            self.grid[key].drawGrid();
                            self.tierMappingToolbar.getComponent('cfg_tier_mapping_edit').setDisabled(false);
                            self.grid[key].baseGrid.setDisabled(false);
                        }
                    },
                    failure : function(){}
                });

                break;
            case 'e2e' :
                Ext.Ajax.request({
                    url : common.Menu.useGoogleCloudURL + '/admin/system/' + id + '/e2e',
                    method : 'GET',
                    success : function(response) {
                        var result = Ext.JSON.decode(response.responseText);

                        if (result.success === 'true') {
                            data = result.data;
                            self.grid[key].clearRows();

                            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                                self.grid[key].addRow([data[ix].sys_id, data[ix].inst_id, data[ix].desc]);
                            }

                            self.grid[key].drawGrid();
                            self.e2eToolbar.getComponent('cfg_e2e_name_edit').setDisabled(false);
                            self.grid[key].baseGrid.setDisabled(false);
                        }
                    },
                    failure : function(){}
                });

                break;
        }

        if (this.isInit) {
            if (key == 'tier') {
                self.grid[key].baseTree.setDisabled(true);
            } else {
                this.grid['svr'].baseGrid.setDisabled(true);
                this.grid['ins'].baseGrid.setDisabled(true);
                this.grid['tier'].baseTree.setDisabled(true);
                this.grid['tierMapping'].baseGrid.setDisabled(true);
                this.grid['e2e'].baseGrid.setDisabled(true);
            }

            this.isInit = false;
        }

    },

    showOrderingWindow: function(){
        var mappingList = [], instList = [],
            instGrid, mappingGrid;
        var ix, ixLen;

        instGrid    = this.grid['ins'];
        mappingGrid = this.grid['tierMapping'];

        for (ix = 0, ixLen = mappingGrid.getRowCount(); ix < ixLen; ix++) {
            mappingGrid.getRow(ix).data.title = mappingGrid.getRow(ix).data.inst_id;
            mappingList.push(mappingGrid.getRow(ix).data);
        }

        for (ix = 0, ixLen = instGrid.getRowCount(); ix < ixLen; ix++) {
            instGrid.getRow(ix).data.title = instGrid.getRow(ix).data.inst_id;
            instList.push(instGrid.getRow(ix).data);
        }

        for (ix = 0, ixLen = mappingGrid.getRowCount(); ix < ixLen; ix++) {
            var idx = instList.findIndex(function(item) {
                return item.title == mappingGrid.getRow(ix).data.inst_id;
            });

            if (idx > -1) {
                instList.splice(idx, 1);
            }
        }

        var mappingWindow = Ext.create('Exem.MoveColumnWindow', {
            width : 800,
            height : 500,
            parent : this,
            title : common.Util.TR('Tier Mapping Settings'),
            columnInfo    : instList,
            useColumnInfo : mappingList,
            useDefaultBtn : false,
            orderMode : true,
            leftGridTitle : common.Util.TR('Current Mapping'),
            rightGridTitle : common.Util.TR('Modified Mapping'),
            okFn : this.apply
        });

        mappingWindow.initBase();
    },

    apply: function(mappingStroe, instanceStore) {
        var ix, ixLen,
            mappingData = [],
            tierGrid = this.parent.grid['tier'];

        var tier_id = tierGrid.getSelectedRow()[0].data.tier_id;
        var sys_id = tierGrid.getSelectedRow()[0].data.sys_id;
        for (ix = 0, ixLen = mappingStroe.data.items.length; ix < ixLen; ix++) {
            mappingData.push(mappingStroe.data.items[ix].data.title);
        }

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + sys_id + '/tiermap/' + tier_id,
            method : 'POST',
            jsonData : {
                inst_ids : mappingData
            },
            success : function(response) {
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                tierGrid.baseTree.fireEvent('itemclick', tierGrid.baseTree, tierGrid.baseTree.getSelectionModel().getLastSelected());
                this.close();
            }.bind(this),
            failure : function(){}
        });
    },

    enableInstance: function(data) {
        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + data.sys_id + '/instance/' + data.inst_id + '/enable',
            method : 'PUT',
            params : JSON.stringify({
                enable   : data.enable
            }),
            success : function(response) {
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                this.onButtonClick('Refresh', 'svr', data.sys_id);
                this.onButtonClick('Refresh', 'ins', data.sys_id);
            }.bind(this),
            failure : function(){}
        });
    }

});
