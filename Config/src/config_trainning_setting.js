Ext.define('config.config_trainning_setting', {
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

    },

    initLayout: function(){
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: '100%',
            height: '100%',
            flex: 1,
            margin: '3 5 3 0',
            border: false,
            style: { background: '#ffffff' }
        });

        this.systemTypeCombo = Ext.create('Exem.ComboBox', {
            store: Ext.create('Exem.Store'),
            width   : 118,
            margin: '3 5 3 6',
            listeners   : {
                change: function(me) {
                    this.executeSQL();
                }.bind(this)
            }
        });

        var sysListPanel = this.createSysListPanel();

        baseCon.add(this.systemTypeCombo, sysListPanel);
        this.target.add(baseCon);
    },

    initDataSetting: function(){
        this.setSystemCombo();
    },

    createSysListPanel: function(){
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

        this.sysNameToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 180,
            height: 30,
            border: false,
            items: [{
                html: '수동학습',
                scope: this,
                handler: function() { this.onButtonClick('Manual'); }
            }, {
                html: '자동학습 설정',
                scope: this,
                handler: function() { this.onButtonClick('Auto'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh'); }
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
                    html: Comm.RTComm.setFont(9, common.Util.TR('Trainning List'))
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

        this.createGrid();

        bodyCon.add(this.grid);
        panel.add(titleCon, bodyCon);

        return panel;
    },

    createGrid: function(){
        var self = this;

        this.grid = Ext.create('Exem.adminTree', {
            cls: 'xm-config-toggle',
            width : '100%',
            height: '100%',
            editMode: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: true,
            localeType: 'H:i:s',
            defaultHeaderHeight: 26,
            usePager: false,
            useEmptyText: true,
            bufferedRenderer: true,
            sortableColumns: false,
            emptyTextMsg: common.Util.TR('No data to display'),
            cellclick:function(thisGrid, td, cellIndex, record) {
                if (cellIndex == 7) {
                    if (record.get('auto_training') == 0) {
                        record.set('auto_training', 1);

                    } else {
                        record.set('auto_training', 0);
                    }

                    if (record.data.depth > 0) {
                        if (record.hasChildNodes()) {
                            record.cascadeBy(function(n) {
                                if (n.get('auto_training') != record.get('auto_training')) {
                                    n.set('auto_training', record.get('auto_training'));
                                }
                            });
                        }
                    }

                    self.autoTrainInstance(record.data);
                } else if (cellIndex == 6) {
                    var wasForm = Ext.create('config.config_trainning_progress_form');
                    wasForm.parent = this;
                    wasForm.systemID = record.data.sys_id;
                    wasForm.instID = record.data.inst_id;
                    wasForm.init();
                } else if (cellIndex == 3) {

                } else {
                    var wasForm = Ext.create('config.config_trainning_history_form');
                    wasForm.parent = this;
                    wasForm.systemID = record.data.sys_id;
                    wasForm.instID = record.data.inst_id;
                    wasForm.init();
                }
            },
            configRowClass: function(record){
                if (record.get('auto_training') != record.get('auto_training')) {
                    if (record.get('auto_training') == 0) {
                        return 'modify-row allow';
                    } else {
                        return 'modify-row reject';
                    }
                }
            }
        });

        this.grid.beginAddColumns();
        this.grid.addColumn({text: 'sys_id'                              , dataIndex: 'sys_id'       , width: 120, type: Grid.tree  , alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: 'inst_id'                             , dataIndex: 'inst_id'      , width: 120, type: Grid.tree  , alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: 'desc'                                , dataIndex: 'desc'         , width: 120, type: Grid.tree  , alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Name')               , dataIndex: 'name'         , width: 120, type: Grid.tree  , alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Start Training Date'), dataIndex: 'start_time'   , width: 140, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('End Training Date')  , dataIndex: 'end_time'     , width: 140, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Status')             , dataIndex: 'status'       , width: 120, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Automatic Learning') , dataIndex: 'auto_training', width: 110, type: Grid.String, alowEdit: false, editMode: false,
            renderer: function(v, m, r) {
                if (r.get('auto_training') == 0) {
                    return '<div class="x-toggle-slide-container" style="width: 92px;">' +
                    '<div style="left: 45px; z-index: 10000; width: 39px;" class="x-toggle-slide-thumb" ></div><div class="holder">' +
                    '<label class="x-toggle-slide-label-on" style="width: 68.5px; margin-left: 0px;"><span><span style="font-size:8pt;">'+common.Util.TR('Reject')+'</span></span></label>' +
                    '<label class="x-toggle-slide-label-off" style="width: 68.5px;"><span><span style="font-size:8pt;">'+common.Util.TR('Allow')+'</span></span></label></div></div>';
                } else {
                    return '<div class="x-toggle-slide-container" style="width: 92px;">' +
                    '<div style="left: 0px; z-index: 10000; width: 39px;" class="x-toggle-slide-thumb" ></div><div class="holder">' +
                    '<label class="x-toggle-slide-label-on" style="width: 68.5px; margin-left: -45px;"><span style="font-size:8pt;">'+common.Util.TR('Reject')+'</span></label>' +
                    '<label class="x-toggle-slide-label-off" style="width: 68.5px;"><span><span style="font-size:8pt;">'+common.Util.TR('Allow')+'</span></span></label></div></div>';
                }
            }
        });
        this.grid.addColumn({text: common.Util.CTR(''),  dataIndex: 'parent_id', width: 10, type: Grid.StringNumber,   alowEdit: false, editMode: false, hide: true});
        this.grid.endAddColumns();
    },

    onButtonClick: function(cmd) {
        var wasForm;

        switch (cmd) {
            case 'Manual' :
                wasForm = Ext.create('config.config_trainning_manual_form');
                wasForm.data = this.grid.getCheckedRows();
                wasForm.parent = this;
                wasForm.init();
                break;

            case 'Auto' :
                wasForm = Ext.create('config.config_trainning_auto_form');
                wasForm.parent   = this;
                wasForm.systemID = this.systemTypeCombo.getValue();
                wasForm.init();
                break;

            case 'Refresh' :
                if (this.refreshLoading) {
                    return;
                }

                this.executeSQL();

                break;
            default :
                break;
        }
    },

    executeSQL: function() {
        var self = this,
            data, systemID, status,
            ix, ixLen;

        systemID = this.systemTypeCombo.getValue();

        if (!systemID) {
            return;
        }

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/train',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    self.grid.clearNodes();

                    data = result.data;

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {

                        if (data[ix].status == 0) {
                            status = common.Util.TR('Before Training');
                        } else if (data[ix].status == 1) {
                            status = common.Util.TR('Training Request');
                        } else if (data[ix].status == 2) {
                            status = common.Util.TR('Trainning in Progress');
                        } else if (data[ix].status == 3) {
                            status = common.Util.TR('Complete Training');
                        } else if (data[ix].status == 4) {
                            status = common.Util.TR('Trainning Error');
                        }

                        self.grid.addNode(null, [
                            data[ix].sys_id
                            , data[ix].inst_id
                            , data[ix].desc
                            , data[ix].name
                            , data[ix].start_time
                            , data[ix].end_time
                            , status
                            , data[ix].auto_training
                            , null
                        ]);
                    }

                    self.grid.drawTree();
                }
            }.bind(this),
            failure : function(){}
        });
    },

    setSystemCombo: function() {
        var data,
            ix, ixLen;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    data = result.data;

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        this.systemTypeCombo.addItem(data[ix].sys_id, data[ix].name);
                    }

                    this.systemTypeCombo.selectRow(0);
                }
            }.bind(this),
            failure : function(){}
        });
    },

    autoTrainInstance: function(data) {
        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + data.sys_id + '/instance/' + data.inst_id + '/training',
            method : 'PUT',
            params : JSON.stringify({
                auto_training   : data.auto_training
            }),
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);

                if (result.success === true) {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    this.executeSQL();
                } else {
                    console.error(result.message);
                }
            }.bind(this),
            failure : function(){}
        });
    }
});
