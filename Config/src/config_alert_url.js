Ext.define('config.config_alert_url', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    MODE: '',
    target: null,
    groupSetData: [],
    serverSetData: [],

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function() {
        var self = this;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                id: 'cfg_url_add' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_url_edit' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_url_delete' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Refresh'); }
            }]
        });

        this.target.add(toolbar);

        if (!cfg.alert.sltName) {
            Ext.getCmp('cfg_url_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_url_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_url_delete' + this.MODE).setDisabled(true);
        } else {
            Ext.getCmp('cfg_url_add' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_url_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_url_delete' + this.MODE).setDisabled(true);
        }

        this.urlServerAlertPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            items: [{
                xtype: 'label',
                x: 5,
                y: 4,
                html: Comm.RTComm.setFont(9, common.Util.TR('Server'))
            }],
            bodyStyle: { background: '#dddddd' }
        });
        this.target.add(this.urlServerAlertPanel);

        this.urlServerAlertGrid = Ext.create('Exem.adminGrid', {
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
                var edit = Ext.getCmp('cfg_url_edit' + self.MODE);
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_url_delete' + self.MODE);
                if (del) {
                    del.setDisabled(false);
                }

                edit = null;
                del  = null;
            }
        });
        this.target.add(this.urlServerAlertGrid);

        this.urlServerAlertGrid.beginAddColumns();
        this.urlServerAlertGrid.addColumn({text: common.Util.CTR('WAS ID'),    dataIndex: 'was_id',   width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
        this.urlServerAlertGrid.addColumn({text: common.Util.CTR('WAS Name'),  dataIndex: 'was_name', width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.urlServerAlertGrid.addColumn({text: common.Util.CTR('IP'),        dataIndex: 'ip',       width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.urlServerAlertGrid.addColumn({text: common.Util.CTR('URL'),       dataIndex: 'url',      width: 400, type: Grid.String, alowEdit: false, editMode: false});
        this.urlServerAlertGrid.addColumn({text: common.Util.CTR('Method'),    dataIndex: 'method',   width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.urlServerAlertGrid.addColumn({text: common.Util.CTR('Parameter'), dataIndex: 'param',    width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.urlServerAlertGrid.endAddColumns();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                this.onAdd();
                break;
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

    onAdd: function() {
        var url_form = Ext.create('config.config_alert_url_form');
        url_form.parent = this ;
        url_form.init('Add');
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onEdit: function() {
        if (this.urlServerAlertGrid.getSelectedRow().length == 0)
            return;

        var d = this.urlServerAlertGrid.getSelectedRow()[0].data;

        var url_form     = Ext.create('config.config_alert_url_form');
        url_form.parent  = this ;
        url_form.wasid   = d.was_id;
        url_form.wasname = d.was_name;
        url_form.url     = d.url;
        url_form.ip      = d.ip;
        url_form.method  = d.method;
        url_form.param   = d.param;
        url_form.init('Edit');
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onDelete: function() {
        if (this.urlServerAlertGrid.getSelectedRow().length == 0)
            return;

        var dataSet = {};
        var self = this;
        var d = this.urlServerAlertGrid.getSelectedRow();

        if (d.length > 0) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                if (btn === 'yes') {
                    dataSet.sql_file = 'IMXConfig_Delete_URL.sql' ;
                    dataSet.replace_string = [{
                        name    :   'was_id',
                        value   :   d[0].data.was_id
                    }];
                    //스펙을 정확히 몰라서 일단 url의 중복을 허용하지 않는 것으로 진행.
                    dataSet.bind =[{
                        name    :   'url',
                        value   :   d[0].data.url,
                        type : SQLBindType.STRING
                    }];

                    if(common.Util.isMultiRepository()){
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    WS.SQLExec(dataSet, function() {
                        setTimeout(function() {
                            self.onRefresh();
                        }, 100);
                    }, this);
                }
            });
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onRefresh: function() {
        this.urlQuery();

        var edit = Ext.getCmp('cfg_url_edit' + this.MODE);
        if (edit) {
            edit.setDisabled(true);
        }

        var del = Ext.getCmp('cfg_url_delete' + this.MODE);
        if (del) {
            del.setDisabled(true);
        }

        if (!cfg.alert.sltName) {
            Ext.getCmp('cfg_url_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_url_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_url_delete' + this.MODE).setDisabled(true);
        } else {
            Ext.getCmp('cfg_url_add' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_url_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_url_delete' + this.MODE).setDisabled(true);
        }

        edit = null;
        del  = null;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    urlQuery: function() {
        var dataSet = {};
        var wasId = cfg.alert.sltId;
        var groupName = cfg.alert.sltName ;

        if (!cfg.alert.sltExistSub) {
            dataSet.sql_file = 'IMXConfig_URL_Server_Info.sql';

            dataSet.replace_string = [{
                name    :   'was_id',
                value   :   wasId
            }];
        } else {
            dataSet.sql_file = 'IMXConfig_URL_Group_Info.sql';

            dataSet.bind = [{
                name    :   'group_name',
                value   :   groupName,
                type : SQLBindType.STRING
            }];
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, this.urlQueryResult, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    urlQueryResult: function(aheader, adata) {
        this.urlServerAlertGrid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.urlServerAlertGrid.addRow([
                adata.rows[ix][0],
                adata.rows[ix][1],
                adata.rows[ix][2],
                adata.rows[ix][3],
                adata.rows[ix][4],
                adata.rows[ix][5]
            ]);
        }
        this.urlServerAlertGrid.drawGrid();
    }
});