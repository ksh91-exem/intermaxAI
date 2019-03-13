Ext.define('config.config_service', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    data: [],
    target: undefined,
    buttons: [common.Util.TR('Add'), common.Util.TR('Save'), common.Util.TR('Delete'), common.Util.TR('Refresh')],
    select_serviceid: -1,
    select_servicename: '',
    select_description: '',
    serviceGroupArr: [],

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        var self = this;
        this.target = target;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        //

        var servicelist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var servicelist_panel_title = Ext.create('Ext.panel.Panel', {
            layout    : 'hbox',
            width     : '100%',
            height    : 30,
            border    : false,
            bodyStyle : { background: '#eeeeee' },
            items     : [{
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Service List'))
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
                    id: 'cfg_service_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_service_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var servicelist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        servicelist_panel.add(servicelist_panel_title);
        servicelist_panel.add(servicelist_panel_body);

        //

        var waslist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        var waslist_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Agent List'))
            }]
        });

        var waslist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        waslist_panel.add(waslist_panel_title);
        waslist_panel.add(waslist_panel_body);

        //

        var webserverlist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'east',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 5 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        var webserverlist_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Webserver List'))
            }]
        });

        var webserverlist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        webserverlist_panel.add(webserverlist_panel_title);
        webserverlist_panel.add(webserverlist_panel_body);

        this._createServiceGrid(servicelist_panel_body);
        this._createWasGrid(waslist_panel_body);
        this._createWebServerGird(webserverlist_panel_body);

        panel.add(servicelist_panel);
        panel.add(waslist_panel);
        panel.add(webserverlist_panel);

        this.target.add(panel);

        this.onButtonClick('Refresh');
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                var service_form = Ext.create('config.config_service_form');
                service_form.parent = this;
                service_form.init('Add');
                break;
            case 'Edit' :
                service_form = Ext.create('config.config_service_form');
                service_form.select_serviceid = this.select_serviceid;
                service_form.select_servicename = this.select_servicename;
                service_form.select_description = this.select_description;
                service_form.serviceGroupArr = this.serviceGroupArr;
                service_form.parent = this;
                service_form.init('Edit');
                break;
            case 'Delete' :
                var self = this;
                var dataSetDefault = {};
                var dataSetMaster = {};

                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        var id = parseInt(self.select_serviceid);
                        if ( Number(localStorage.getItem('SelectedServiceId')) == id ) {
                            Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Current service can not be deleted.'));
                            return ;
                        }

                        dataSetDefault.sql_file = 'IMXConfig_Delete_Service_Procedure.sql';
                        dataSetDefault.bind = [{
                            name: 'serviceId',
                            value: id,
                            type : SQLBindType.INTEGER
                        }];

                        if(common.Util.isMultiRepository()){
                            dataSetDefault.database = cfg.repositoryInfo.currentRepoName;
                            dataSetMaster.sql_file = 'IMXConfig_Delete_Service_Procedure.sql';
                            dataSetMaster.bind = [{
                                name: 'serviceId',
                                value: id,
                                type : SQLBindType.INTEGER
                            }];
                            dataSetMaster.database = cfg.repositoryInfo.master.database_name;
                            WS.SQLExec(dataSetMaster,{},this);
                        }

                        WS.SQLExec(dataSetDefault, function (aheader) {
                            if( aheader.success ) {
                                Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Delete succeeded'));
                                self.onButtonClick('Refresh');
                            }
                        }, this);
                    }
                    Ext.getCmp('cfg_service_delete').blur();
                });
                break;
            case 'Refresh' :
                this.executeSQL_Service();
                this.executeSQL_Was();
                this.executeSQL_WebServer();
                this.executeSQL_serviceGroup();

                Ext.getCmp('cfg_service_edit').setDisabled(true);
                Ext.getCmp('cfg_service_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    _createServiceGrid: function(gridpanel) {
        var self = this;
        this.waslist_grid = Ext.create('Exem.adminGrid', {
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
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function(dv, record) {
                self.serviceClick(record.data);

                var edit = Ext.getCmp('cfg_service_edit');
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_service_delete');
                if (del) {
                    del.setDisabled(false);
                }
            }
        });
        gridpanel.add(this.waslist_grid);

        this.waslist_grid.beginAddColumns();
        this.waslist_grid.addColumn({text: common.Util.CTR('Service ID'),    dataIndex: 'service_id',    width: 100,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.waslist_grid.addColumn({text: common.Util.CTR('Service Name'),  dataIndex: 'service_name',  width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.waslist_grid.addColumn({text: common.Util.CTR('Description'),   dataIndex: 'description',   width: 250, type: Grid.String, alowEdit: false, editMode: false, hide:true});
        this.waslist_grid.endAddColumns();
    },

    serviceClick: function(d) {
        this.select_serviceid = parseInt(d['service_id']);
        this.select_servicename = d['service_name'];
        this.select_description = d['description'];

        this.checked_was_ws();
    },

    find_was: function(wid) {
        var result = false;
        var d;
        for (var ix = 0; ix < this.serviceGroupArr.length; ix++) {
            d = this.serviceGroupArr[ix];
            if (d[0] == this.select_serviceid && d[1] == 'WAS' && d[2] == wid) {
                result = true;
                break;
            }
        }
        return result;
    },

    find_webserver: function(wid) {
        var result = false;
        var d;
        for (var ix = 0; ix < this.serviceGroupArr.length; ix++) {
            d = this.serviceGroupArr[ix];
            if (d[0] == this.select_serviceid && d[1] == 'WS' && d[2] == wid) {
                result = true;
                break;
            }
        }
        return result;
    },

    checked_was_ws: function() {
        var d;
        var ix;

        this.was_grid.unCheckAll();
        this.webserver_grid.unCheckAll();

        // Agent
        for (ix = 0; ix < this.was_grid.getRowCount(); ix++) {
            d = this.was_grid.getRow(ix).data;
            if (this.find_was(d['was_id'])) {
                this.was_grid.selectRow(ix, true);
            }
        }

        // WebServer
        for (ix = 0; ix < this.webserver_grid.getRowCount(); ix++) {
            d = this.webserver_grid.getRow(ix).data;
            if (this.find_webserver(d['webserver_id'])) {
                this.webserver_grid.selectRow(ix, true);
            }
        }
    },

    executeSQL_serviceGroup: function() {
        var dataSet= {};
        dataSet.sql_file = 'IMXConfig_Service_Group.sql';
        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, this.onData_serviceGroupReload, this);
    },

    onData_serviceGroupReload: function(aheader, adata) {
        var d;

        this.serviceGroupArr.length = 0;
        this.serviceGroupArr = [];

        for (var ix = 0; ix < adata.rows.length; ix++) {
            d = adata.rows[ix];
            this.serviceGroupArr.push([
                d[0],   // service_id
                d[1],   // server_type
                d[2]    // server_id
            ]);
        }
    },

    _createWasGrid: function(gridpanel) {
        this.was_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            multiCheckable: true
        });
        gridpanel.add(this.was_grid);

        this.was_grid.beginAddColumns();
        this.was_grid.addColumn({text: common.Util.CTR('Agent ID'),   dataIndex: 'was_id',   width: 100,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.was_grid.addColumn({text: common.Util.CTR('Agent Name'), dataIndex: 'was_name', width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.was_grid.endAddColumns();
    },

    _createWebServerGird: function(gridpanel) {
        this.webserver_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            multiCheckable: true
        });
        gridpanel.add(this.webserver_grid);

        this.webserver_grid.beginAddColumns();
        this.webserver_grid.addColumn({text: common.Util.CTR('Webserver ID'),   dataIndex: 'webserver_id',   width: 105, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.webserver_grid.addColumn({text: common.Util.CTR('Webserver Name'), dataIndex: 'webserver_name', width: 200, type: Grid.String, alowEdit: false, editMode: false});
        this.webserver_grid.endAddColumns();
    },

    executeSQL_Service: function() {
        var dataSet = {};
        var whereList = '1=1 ';

        dataSet.sql_file = 'IMXConfig_ServiceInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }];
        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, this.onData_Service, this);
    },

    onData_Service: function(aheader, adata) {
        this.waslist_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.waslist_grid.addRow([
                adata.rows[ix][0],      // Service_ID
                adata.rows[ix][1],      // Service_Name
                adata.rows[ix][2]       // Description
            ]);
        }
        this.waslist_grid.drawGrid();
    },

    executeSQL_Was: function() {
        var dataSet = {};
        var whereList = 'was_name is not null';
        var orderBy = 'order by was_name';

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
        WS.SQLExec(dataSet, this.onData_Was, this);
    },

    onData_Was: function(aheader, adata) {
        this.was_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.was_grid.addRow([
                adata.rows[ix][0],  // Was_ID
                adata.rows[ix][1]   // Was_Name
            ]);
        }
        this.was_grid.drawGrid();
    },

    executeSQL_WebServer: function() {
        var dataSet = {};
        var whereList = '1=1';
        var orderBy = 'order by ws_name';

        dataSet.sql_file = 'IMXConfig_WsInfo.sql';
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
        WS.SQLExec(dataSet, this.onData_WebServer, this);
    },

    onData_WebServer: function(aheader, adata) {
        this.webserver_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.webserver_grid.addRow([
                adata.rows[ix][0],  // WebServer_ID
                adata.rows[ix][1]   // WebServer_Name
            ]);
        }
        this.webserver_grid.drawGrid();
    }
});
