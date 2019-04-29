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
        // this.refreshLoading = false;

        this.grid = {};
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

                }.bind(this)
            }
        });

        this.systemTypeCombo.addItem('sys3' , common.Util.TR('SYSTEM3'));
        this.systemTypeCombo.addItem('sys2', common.Util.TR('SYSTEM2'));
        this.systemTypeCombo.addItem('sys1', common.Util.TR('SYSTEM1'));

        var sysListPanel = this.createSysListPanel();

        baseCon.add(this.systemTypeCombo, sysListPanel);
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

        this.createGrid('sys');

        bodyCon.add(this.grid['sys']);
        panel.add(titleCon, bodyCon);

        return panel;
    },

    createGrid: function(key){
        switch (key) {

            case 'sys' :
                this.grid[key] = Ext.create('Exem.adminTree', {
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
                        } else if (cellIndex == 3) {
                            var wasForm = Ext.create('config.config_trainning_progress_form');
                            wasForm.parent = this;
                            wasForm.init('Add');
                        } else {
                            var wasForm = Ext.create('config.config_trainning_history_form');
                            wasForm.parent = this;
                            wasForm.init('Add');
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
                this.grid[key].addColumn({text: common.Util.CTR('Agent Name') ,   dataIndex: 'was_name',    width: 120, type: Grid.tree   ,  alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('학습시작'),   dataIndex: 'start_time'  ,    width: 120, type: Grid.String, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('학습종료'),   dataIndex: 'end_time'  ,    width: 120, type: Grid.String, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('상태')   ,   dataIndex: 'status'  ,    width: 120, type: Grid.String, alowEdit: false, editMode: false});
                this.grid[key].addColumn({text: common.Util.CTR('자동학습'),  dataIndex: 'reject_setting', width: 110, type: Grid.String,   alowEdit: false, editMode: false,
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
                this.grid[key].addColumn({text: common.Util.CTR(''),  dataIndex: 'parent_id', width: 10, type: Grid.StringNumber,   alowEdit: false, editMode: false, hide: true, hideable: false});
                this.grid[key].endAddColumns();

        }


    },

    onButtonClick: function(cmd, key) {
        var self = this,
            dataSet = {},
            wasForm, rowData;

        switch (cmd) {
            case 'Manual' :
                wasForm = Ext.create('config.config_trainning_manual_form');
                wasForm.parent = this;
                wasForm.init('Add');
                break;

            case 'Auto' :
                wasForm = Ext.create('config.config_trainning_auto_form');
                wasForm.parent = this;
                wasForm.init('Add');
                break;

            case 'Refresh' :
                if (this.refreshLoading) {
                    return;
                }

                this.grid[key].clearNodes();
                this.executeSQL(key);

                break;
            default :
                break;
        }
    },

    executeSQL: function(key) {
        var self = this,
            dataSet = {},
            whereList = '1=1',
            orderBy = 'order by was_name';

        dataSet.sql_file = 'IMXConfig_WasInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            var rowData, ix, ixLen;

            if(!common.Util.checkSQLExecValid(header, data)){
                console.debug('config_wasname.js - executeSQL()');
                console.debug(header);
                console.debug(data);
                return;
            }

            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                rowData = data.rows[ix];
                self.grid[key].addNode(null, [
                    'WAS1',
                    "2019-09-06",
                    "2019-09-06",
                    "학습중",
                    0,
                    null
                ]);
            }

            self.grid[key].drawTree();

            if (key != 'sys') {
                self.grid[key].baseGrid.setDisabled(true);
            }

            // this.refreshLoading = false;
        }, this);
    },

    changeWasInfo: function(wasid, wasname, hostname, tierId, key) {
        var ix, ixLen, record;

        for (ix = 0, ixLen = this.grid[key].getRowCount(); ix < ixLen; ix++) {
            if (this.grid[key].getRow(ix).data.was_id == wasid) {
                record = this.grid[key].findRow('was_id', wasid);
                record.set('was_name', wasname);
                record.set('host_name', hostname);
                record.set('tier_id', tierId);
                break;
            }
        }
    },

    insertDeleteAutoId: function(serverId){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Insert_Delete_Auto_Id.sql';
        dataSet.bind = [{
            name    : 'serverId',
            value   : serverId,
            type    : SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {}, this);
    }
});
