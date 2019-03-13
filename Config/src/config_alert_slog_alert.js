Ext.define('config.config_alert_slog_alert', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    MODE: '',
    target: null,
    groupSetData: [],
    serverSetData: [],
    isSelectGroup: false,

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        var self = this;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                id: 'cfg_slog_add' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_slog_edit' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_slog_delete' + this.MODE,
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
            Ext.getCmp('cfg_slog_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_slog_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_slog_delete' + this.MODE).setDisabled(true);
        } else {
            Ext.getCmp('cfg_slog_add' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_slog_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_slog_delete' + this.MODE).setDisabled(true);
        }

        this.slogGroupAlertPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            items: [{
                xtype: 'label',
                x: 5,
                y: 4,
                html: Comm.RTComm.setFont(9, common.Util.TR('Group'))
            }],
            bodyStyle: { background: '#dddddd' }
        });
        this.target.add(this.slogGroupAlertPanel);

        this.slogGroupAlertGrid = Ext.create('Exem.adminGrid', {
            height: 150,
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
                self.isSelectGroup = true;

                var edit = Ext.getCmp('cfg_slog_edit' + self.MODE);
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_slog_delete' + self.MODE);
                if (del) {
                    del.setDisabled(false);
                }

                if ( cfg.alert.sltGroup == 'Root' ){
                    del.setDisabled( false );
                    edit.setDisabled( false );
                }else{
                    del.setDisabled( true );
                    edit.setDisabled( true );
                }

                edit = null;
                del  = null;
            }
        });
        this.target.add(this.slogGroupAlertGrid);

        this.slogGroupAlertGrid.beginAddColumns();
        this.slogGroupAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),         dataIndex: 'alert_name'     ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogGroupAlertGrid.addColumn({text: common.Util.CTR('Type'),               dataIndex: 'type'           ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogGroupAlertGrid.addColumn({text: common.Util.CTR('Repeat'),             dataIndex: 'repeat'         ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogGroupAlertGrid.addColumn({text: common.Util.CTR('Slog Text Include'),  dataIndex: 'slog_include'   ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogGroupAlertGrid.addColumn({text: common.Util.CTR('Slog Text Exclude'),  dataIndex: 'slog_exclude'   ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogGroupAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),       dataIndex: 'sms'            ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogGroupAlertGrid.addColumn({text: common.Util.CTR('graytext'),           dataIndex: 'graytext'       ,width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.slogGroupAlertGrid.endAddColumns();

        this.slogGroupAlertGrid.baseGrid.getView().getRowClass = function(record) {
            if (record.data.graytext == 'gray') {
                return 'grid-gray-text';
            }
        };

        this.slogServerAlertPanel = Ext.create('Ext.panel.Panel', {
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
        this.target.add(this.slogServerAlertPanel);

        this.slogServerAlertGrid = Ext.create('Exem.adminGrid', {
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
                self.isSelectGroup = false;

                var edit = Ext.getCmp('cfg_slog_edit' + self.MODE);
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_slog_delete' + self.MODE);
                if (del) {
                    del.setDisabled(false);
                }

                edit = null;
                del  = null;
            }
        });
        this.target.add(this.slogServerAlertGrid);

        this.slogServerAlertGrid.beginAddColumns();
        this.slogServerAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),         dataIndex: 'alert_name'     ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogServerAlertGrid.addColumn({text: common.Util.CTR('Type'),               dataIndex: 'type'           ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogServerAlertGrid.addColumn({text: common.Util.CTR('Repeat'),             dataIndex: 'repeat'         ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogServerAlertGrid.addColumn({text: common.Util.CTR('Slog Text Include'),  dataIndex: 'slog_include'   ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogServerAlertGrid.addColumn({text: common.Util.CTR('Slog Text Exclude'),  dataIndex: 'slog_exclude'   ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogServerAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),       dataIndex: 'sms'            ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.slogServerAlertGrid.addColumn({text: common.Util.CTR('graytext'),           dataIndex: 'graytext'       ,width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.slogServerAlertGrid.endAddColumns();
    },

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

    onAdd: function() {
        var slog_form = Ext.create('config.config_alert_slog_alert_form');
        slog_form.parent = this;
        slog_form.init('Add');
    },

    onEdit: function() {
        var d = this.isSelectGroup ? this.slogGroupAlertGrid.getSelectedRow()[0].data : this.slogServerAlertGrid.getSelectedRow()[0].data;

        var slog_form = Ext.create('config.config_alert_slog_alert_form');
        slog_form.parent        = this;
        slog_form.alert_name    = d.alert_name;
        slog_form.type          = d.type;
        slog_form.repeat        = d.repeat;
        slog_form.slog_include  = d.slog_include;
        slog_form.slog_exclude  = d.slog_exclude;
        slog_form.sms_schedule_name = d.sms;
        slog_form.init('Edit');
    },

    onDelete: function() {
        var self = this;
        var dt = this.isSelectGroup ? this.slogGroupAlertGrid.getSelectedRow()[0].data : this.slogServerAlertGrid.getSelectedRow()[0].data;

        config.ConfigEnv.group_flag = cfg.alert.sltExistSub ;

        if (dt != undefined) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                if (btn === 'yes') {
                    if (cfg.alert.sltExistSub > 0) {
                        config.ConfigEnv.delete_config( cfg.alert.sltName, 'TP', 'SLog Alert', dt.alert_name, self.deleteComplete, self ) ;
                    } else {
                        config.ConfigEnv.delete_config( cfg.alert.sltId, 'TP', 'SLog Alert', dt.alert_name, self.deleteComplete, self ) ;
                    }
                }
            });
        }
    },

    deleteComplete: function(){
        var self = this.set_value;
        self.onRefresh();
    },

    onRefresh: function() {
        if (cfg.alert.sltGroup == 'Root') {
            if (cfg.alert.sltExistSub) {
                this.slogGroupAlertGrid.setVisible(true);
                //toolbar 높이 30과 name panel 높이 24로 인한 target 높이 제거
                this.slogGroupAlertGrid.setHeight(this.target.getHeight() - 54);
                this.slogGroupAlertPanel.setVisible(true);

                this.slogServerAlertGrid.setVisible(false);
                this.slogServerAlertPanel.setVisible(false);
            } else {
                this.slogGroupAlertGrid.setVisible(false);
                this.slogGroupAlertPanel.setVisible(false);

                this.slogServerAlertGrid.setVisible(true);
                this.slogServerAlertPanel.setVisible(true);
            }
        } else {
            this.slogGroupAlertPanel.setVisible(true);
            this.slogGroupAlertGrid.setVisible(true);
            this.slogGroupAlertGrid.setHeight(150);

            this.slogServerAlertPanel.setVisible(true);
            this.slogServerAlertGrid.setVisible(true);
        }

        this.groupSetQuery();
        this.serverSetQuery();

        var edit = Ext.getCmp('cfg_slog_edit' + this.MODE);
        if (edit) {
            edit.setDisabled(true);
        }

        var del = Ext.getCmp('cfg_slog_delete' + this.MODE);
        if (del) {
            del.setDisabled(true);
        }

        if (!cfg.alert.sltName) {
            Ext.getCmp('cfg_slog_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_slog_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_slog_delete' + this.MODE).setDisabled(true);
        } else {
            Ext.getCmp('cfg_slog_add' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_slog_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_slog_delete' + this.MODE).setDisabled(true);
        }

        edit = null;
        del  = null;
    },

    groupSetQuery: function() {
        var dataSet = {};
        var serverType = '';
        var groupName = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;

        switch (cfg.alert.sltMode) {
            case 'Agent' :
                serverType = 'and server_type = \'WAS\' ';
                break;
            case 'DB'    :
                if ( cfg.alert.sltType == null || cfg.alert.sltType == undefined ) {
                    serverType = 'and server_type is null ';
                } else {
                    serverType = 'and server_type = \''+cfg.alert.sltType+'\' ';
                }
                break;
            case 'WS'    :
                serverType = 'and server_type = \'WEBSERVER\' ';
                break;
            case 'TP'    :
                serverType = 'and server_type = \'TP\' ';
                break;
            default :
                break;
        }

        var addWhereList = serverType;
        var orderBy = 'order by alert_resource_name ';

        dataSet.sql_file = 'IMXConfig_AlertGroupSet.sql';
        dataSet.bind = [{
            name: 'groupName',
            value: groupName,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'SLog Alert',
            type : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name: 'addWhereList',
            value: addWhereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.groupSetQueryResult, this);
    },

    groupSetQueryResult: function(aheader, adata) {
        this.groupSetData.length = 0;
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.groupSetData.push(adata.rows[ix]);
        }
        this.groupTagValueQuery();
    },

    groupTagValueQuery: function() {
        var server_type = '';
        var group_name = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;

        switch (cfg.alert.sltMode) {
            case 'Agent' : server_type = 'WAS';
                break;
            case 'DB'    : server_type = cfg.alert.sltType;
                break;
            case 'WS'    : server_type = 'WEBSERVER';
                break;
            case 'TP'    : server_type = 'TP';
                break;
            default :
                break;
        }


        var groupNameList = '\'' + group_name + '\' ';

        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_AlertGroupTagValue.sql';
        dataSet.bind = [{
            name: 'serverType',
            value: server_type,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'SLog Alert',
            type : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name: 'groupNameList',
            value: groupNameList
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.groupTagValueQueryResult, this);
    },

    groupTagValueQueryResult: function(aheader, adata) {
        var self = this;
        var A ;
        var data = {};
        var resources = [];
        var textcolor;
        var group_name = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;

        for (var ix = 0; ix < adata.rows.length; ix++) {
            A = adata.rows[ix][3];
            if (resources.indexOf(A) == -1) {
                resources.push(A);
                data[A] = {};
            }
        }

        var setValue = function(_group_name_) {
            var _rows ;
            var _alertname ;
            var _groupsetdata ;
            for (var ix = 0; ix < adata.rows.length; ix++) {
                _rows = adata.rows[ix];
                for (var jx = 0; jx < resources.length; jx++) {
                    _alertname = resources[jx];
                    if (_rows[0] == _group_name_ && _rows[3] == _alertname) {
                        switch (_rows[4]) {
                            case 'CONFIG_MODE'  : data[_alertname].config_mode  = _rows[5];
                                break;
                            case 'SLOG_INCLUDE' : data[_alertname].slog_include = _rows[5];
                                break;
                            case 'SLOG_EXCLUDE' : data[_alertname].slog_exclude = _rows[5];
                                break;
                            case 'REPEAT'       : data[_alertname].repeat       = _rows[5];
                                break;
                            default :
                                break;
                        }
                    }
                    if (_group_name_ != '_default_alert_') {
                        for (var cx = 0; cx < self.groupSetData.length; cx++) {
                            _groupsetdata = self.groupSetData[cx];
                            if (_groupsetdata[0] == _group_name_ && _groupsetdata[1] == 'TP' && _groupsetdata[2] == 'SLog Alert' && _groupsetdata[3] == _alertname) {
                                data[_alertname].sms_schedule = _groupsetdata[4];
                            }
                        }
                    }
                }
            }
        };

        setValue(group_name);

        textcolor = cfg.alert.sltId == undefined ? 'black' : 'gray';

        this.slogGroupAlertGrid.clearRows();
        for (var key in data) {
            if(data.hasOwnProperty(key)){
                this.slogGroupAlertGrid.addRow([
                    key,
                    common.Util.TR(data[key].config_mode),
                    data[key].repeat,
                    data[key].slog_include,
                    data[key].slog_exclude,
                    data[key].sms_schedule,
                    textcolor
                ]);
            }

        }
        this.slogGroupAlertGrid.drawGrid();

        if (cfg.alert.sltId != undefined) {
            this.serverSetQuery();
        }
    },

    serverSetQuery: function() {
        var serverId = cfg.alert.sltId;
        var serverType = '';

        if (serverId == '')
            return;
        if (serverId == undefined)
            return;

        switch (cfg.alert.sltMode) {
            case 'Agent' : serverType = 'WAS';
                break;
            case 'DB'    : serverType = cfg.alert.sltType;
                break;
            case 'WS'    : serverType = 'WEBSERVER';
                break;
            case 'TP'    : serverType = 'TP';
                break;
            default :
                break;
        }

        var dataSet = {};
        var addWhereList = 'and server_type = \'' + serverType + '\' ';
        var orderBy = 'order by alert_resource_name ';
        dataSet.sql_file = 'IMXConfig_AlertServerSet.sql';
        dataSet.bind = [{
            name: 'serverId',
            value: serverId,
            type : SQLBindType.INTEGER
        }, {
            name: 'alertType',
            value: 'SLog Alert',
            type : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name: 'addWhereList',
            value: addWhereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.serverSetQueryResult, this);
    },

    serverSetQueryResult: function(aheader, adata) {
        this.serverSetData.length = 0;
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.serverSetData.push(adata.rows[ix]);
        }
        this.serverTagValueQuery();
    },

    serverTagValueQuery: function() {
        var serverId = cfg.alert.sltId;
        var serverType = '';

        if (serverId == '')
            return;

        switch (cfg.alert.sltMode) {
            case 'Agent' : serverType = 'WAS';
                break;
            case 'DB'    : serverType = cfg.alert.sltType;
                break;
            case 'WS'    : serverType = 'WEBSERVER';
                break;
            case 'TP'    : serverType = 'TP';
                break;
            default :
                break;
        }

        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_AlertServerTagValue.sql';
        dataSet.bind = [{
            name: 'serverId',
            value: serverId,
            type : SQLBindType.INTEGER
        }, {
            name: 'serverType',
            value: serverType,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'SLog Alert',
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.serverTagValueQueryResult, this);
    },

    serverTagValueQueryResult: function(aheader, adata) {
        var self = this;
        var A ;
        var data = {};
        var resources = [];
        var wasid = cfg.alert.sltId;

        for (var ix = 0; ix < adata.rows.length; ix++) {
            A = adata.rows[ix][3];
            if (resources.indexOf(A) == -1) {
                resources.push(A);
                data[A] = {};
            }
        }

        var setValue = function(_wasid_) {
            var _rows ;
            var _alertname ;
            var _serversetdata ;
            for (var ix = 0; ix < adata.rows.length; ix++) {
                _rows = adata.rows[ix];
                for (var jx = 0; jx < resources.length; jx++) {
                    _alertname = resources[jx];
                    if (_rows[0] == _wasid_ && _rows[3] == _alertname) {
                        switch (_rows[4]) {
                            case 'CONFIG_MODE'  : data[_alertname].config_mode  = _rows[5];
                                break;
                            case 'SLOG_INCLUDE' : data[_alertname].slog_include = _rows[5];
                                break;
                            case 'SLOG_EXCLUDE' : data[_alertname].slog_exclude = _rows[5];
                                break;
                            case 'REPEAT'       : data[_alertname].repeat       = _rows[5];
                                break;
                            default :
                                break;
                        }
                    }
                    if (_wasid_ != '_default_alert_') {
                        for (var cx = 0; cx < self.serverSetData.length; cx++) {
                            _serversetdata = self.serverSetData[cx];
                            if (_serversetdata[0] == _wasid_ && _serversetdata[1] == 'TP' && _serversetdata[2] == 'SLog Alert' && _serversetdata[3] == _alertname) {
                                data[_alertname].sms_schedule = _serversetdata[4];
                            }
                        }
                    }
                }
            }
        };

        setValue(wasid);

        this.slogServerAlertGrid.clearRows();
        for (var key in data) {
            if(data.hasOwnProperty(key)) {
                this.slogServerAlertGrid.addRow([
                    key,
                    common.Util.TR(data[key].config_mode),
                    data[key].repeat,
                    data[key].slog_include,
                    data[key].slog_exclude,
                    data[key].sms_schedule,
                    ''
                ]);
            }
        }
        this.slogServerAlertGrid.drawGrid();
    }
});