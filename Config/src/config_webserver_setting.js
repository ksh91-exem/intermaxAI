Ext.define('config.config_webserver_setting', {
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
            width: 580,
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var weblist_panel = Ext.create('Ext.panel.Panel', {
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

        var weblist_panel_title = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('Webserver List'))
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
                    id: 'cfg_web_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_web_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var weblist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        weblist_panel.add(weblist_panel_title);
        weblist_panel.add(weblist_panel_body);

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

        weblist_panel_body.add(grid_panel);
        panel.add(weblist_panel);
        this.target.add(panel);

        // adminGrid
        this.webServerGrid = Ext.create('Exem.adminGrid', {
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
                Ext.getCmp('cfg_web_edit').setDisabled(false);
                Ext.getCmp('cfg_web_delete').setDisabled(false);
            }
        });
        grid_panel.add(this.webServerGrid);

        this.webServerGrid.beginAddColumns();
        this.webServerGrid.addColumn({text: common.Util.CTR('WS ID'),            dataIndex: 'ws_id',     width: 80,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.webServerGrid.addColumn({text: common.Util.CTR('Webserver Name'),   dataIndex: 'ws_name',  width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.webServerGrid.addColumn({text: common.Util.CTR('Host Name'),        dataIndex: 'host_name', width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.webServerGrid.addColumn({text: common.Util.CTR('IP'),               dataIndex: 'ip',        width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.webServerGrid.endAddColumns();

        // Get Data
        this.onButtonClick('Refresh');

    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        var self = this;
        var data = null;
        var webserver;

        switch (cmd) {
            case 'Add' :
                webserver = Ext.create('config.config_webserver_setting_form');
                webserver.parent = this;
                webserver.init('Add');
                break;
            case 'Edit' :
                data = this.webServerGrid.getSelectedRow()[0].data;
                webserver = Ext.create('config.config_webserver_setting_form');
                webserver.parent = this;
                webserver.ws_id = data.ws_id;
                webserver.ws_name = data.ws_name;
                webserver.host_name = data.host_name;
                webserver.ip = data.ip;
                webserver.init('Edit');
                break;
            case 'Delete' :
                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        data = self.webServerGrid.getSelectedRow()[0].data;
                        var dataSet = {};
                        dataSet.sql_file = 'IMXConfig_Delete_WsInfo.sql';
                        dataSet.bind = [{
                            name: 'wsId',
                            value: data.ws_id,
                            type : SQLBindType.INTEGER
                        }];
                        if(common.Util.isMultiRepository()) {
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function() {
                            self.webServerGrid.deleteRecords([data]);
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
                this.webServerGrid.clearRows();
                this.executeSQL();

                Ext.getCmp('cfg_web_edit').setDisabled(true);
                Ext.getCmp('cfg_web_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var self = this;
        var dataRows;
        var dataSet = {};
        var whereList = '1=1';
        var orderBy = '';

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
        WS.SQLExec(dataSet, function(aheader, adata) {
            if (adata.rows != null && adata.rows.length > 0) {
                    for (var ix = 0; ix < adata.rows.length; ix++) {

                        dataRows = adata.rows[ix];
                        self.webServerGrid.addRow([
                            dataRows[0],    //WS_id
                            dataRows[1],    //WS_name
                            dataRows[3],    //host_name
                            dataRows[4]    //IP
                        ]);
                    }
                    self.webServerGrid.drawGrid();
            }
            this.refresh_loading = false ;
        }, this);
    }
});
