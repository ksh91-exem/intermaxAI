Ext.define('config.config_alert_sessionalert', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.groupSetData = [];
        this.serverSetData = [];
    },

    initLayout: function() {
        this.createToolBar();
        this.createGroupLabel();
        this.createGroupGrid();
        this.createServerLabel();
        this.createServerGrid();

        this.target.add(this.toolBar, this.sessionGroupAlertCon, this.sessionGroupAlertGrid,
            this.sessionServerAlertCon, this.sessionServerAlertGrid);
    },

    createToolBar: function() {
        this.toolBar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                id: 'cfg_sessionalert_add' + this.MODE,
                scope: this,
                handler: function() {
                    this.onButtonClick('Add');
                }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_sessionalert_edit' + this.MODE,
                scope: this,
                handler: function() {
                    this.onButtonClick('Edit');
                }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_sessionalert_delete' + this.MODE,
                scope: this,
                handler: function() {
                    this.onButtonClick('Delete');
                }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() {
                    this.onButtonClick('Refresh');
                }
            }]
        });
    },

    createGroupLabel: function() {
        this.sessionGroupAlertCon = Ext.create('Ext.container.Container', {
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
            style: { background: '#dddddd' }
        });
    },

    createGroupGrid: function() {
        this.sessionGroupAlertGrid = Ext.create('Exem.adminGrid', {
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
            itemclick: function() {
                var edit = this.toolBar.getComponent('cfg_sessionalert_edit' + this.MODE),
                    del = this.toolBar.getComponent('cfg_sessionalert_delete' + this.MODE);

                if ( cfg.alert.sltGroup === 'Root' ) {
                    edit.setDisabled( false );
                    del.setDisabled( false );
                } else {
                    edit.setDisabled( true );
                    del.setDisabled( true );
                }
            }.bind(this)
        });

        this.sessionGroupAlertGrid.beginAddColumns();
        this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),      dataIndex: 'alert_name',      width: 250, type: Grid.String, alowEdit: true, editMode: true});
        this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('Stat Name'),       dataIndex: 'stat_name',       width: 150, type: Grid.String, alowEdit: true, editMode: true});
        this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('Scope Type'),      dataIndex: 'scope_type',      width: 100, type: Grid.String, alowEdit: true, editMode: true});
        this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('Scope'),           dataIndex: 'scope_value',     width: 100, type: Grid.String, alowEdit: true, editMode: true});
        if (cfg.repository === 'MSSQL' && cfg.alert.sltMode === 'Agent') {
            this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('Exception Type'),  dataIndex: 'exception_type',  width: 105, type: Grid.String, alowEdit: true, editMode: true});
            this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('Exception Value'), dataIndex: 'exception_value', width: 110, type: Grid.String, alowEdit: true, editMode: true});
        }
        this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('Warning'),         dataIndex: 'warning',         width:  80, type: Grid.Number, alowEdit: true, editMode: true});
        this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('Critical'),        dataIndex: 'critical',        width:  80, type: Grid.Number, alowEdit: true, editMode: true});
        this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),    dataIndex: 'sms',             width: 150, type: Grid.String, alowEdit: true, editMode: true});
        this.sessionGroupAlertGrid.addColumn({text: common.Util.CTR('graytext'),        dataIndex: 'graytext',        width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.sessionGroupAlertGrid.addColumn({text: 'Stat Name Temp',                   dataIndex: 'stat_name_en',    width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.sessionGroupAlertGrid.addColumn({text: 'Scope Type Temp',                  dataIndex: 'scope_type_en',   width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.sessionGroupAlertGrid.addColumn({text: 'Alert Name Temp',                  dataIndex: 'alert_name_en',   width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.sessionGroupAlertGrid.endAddColumns();

        this.sessionGroupAlertGrid.baseGrid.getView().getRowClass = function(record) {
            if ( record.data.graytext ) {
                return 'grid-gray-text';
            }
        };
    },

    createServerLabel: function() {
        this.sessionServerAlertCon = Ext.create('Ext.container.Container', {
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
            style: { background: '#dddddd' }
        });
    },

    createServerGrid: function() {
        this.sessionServerAlertGrid = Ext.create('Exem.adminGrid', {
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
            itemclick: function() {
                var edit = this.toolBar.getComponent('cfg_sessionalert_edit' + this.MODE),
                    del = this.toolBar.getComponent('cfg_sessionalert_delete' + this.MODE);

                edit.setDisabled(false);
                del.setDisabled(false);
            }.bind(this)
        });

        this.sessionServerAlertGrid.beginAddColumns();
        this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),      dataIndex: 'alert_name',      width: 250, type: Grid.String, alowEdit: true, editMode: true});
        this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('Stat Name'),       dataIndex: 'stat_name',       width: 150, type: Grid.String, alowEdit: true, editMode: true});
        this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('Scope Type'),      dataIndex: 'scope_type',      width: 100, type: Grid.String, alowEdit: true, editMode: true});
        this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('Scope'),           dataIndex: 'scope_value',     width: 100, type: Grid.String, alowEdit: true, editMode: true});
        if (cfg.repository === 'MSSQL' && cfg.alert.sltMode === 'Agent') {
            this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('Exception Type'),  dataIndex: 'exception_type',  width: 105, type: Grid.String, alowEdit: true, editMode: true});
            this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('Exception Value'), dataIndex: 'exception_value', width: 110, type: Grid.String, alowEdit: true, editMode: true});
        }
        this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('Warning'),         dataIndex: 'warning',         width:  80, type: Grid.Number, alowEdit: true, editMode: true});
        this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('Critical'),        dataIndex: 'critical',        width:  80, type: Grid.Number, alowEdit: true, editMode: true});
        this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),    dataIndex: 'sms',             width: 150, type: Grid.String, alowEdit: true, editMode: true});
        this.sessionServerAlertGrid.addColumn({text: common.Util.CTR('graytext'),        dataIndex: 'graytext',        width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.sessionServerAlertGrid.addColumn({text: 'Stat Name Temp',                   dataIndex: 'stat_name_en',    width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.sessionServerAlertGrid.addColumn({text: 'Scope Type Temp',                  dataIndex: 'scope_type_en',   width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.sessionServerAlertGrid.addColumn({text: 'Alert Name Temp',                  dataIndex: 'alert_name_en',   width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});

        this.sessionServerAlertGrid.endAddColumns();
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
        var sessionAlertForm = Ext.create('config.config_alert_sessionalert_form', {
            mode: 'Add',
            parentRefresh: this.onRefresh.bind(this),
            parentSelectGrid: this.selectGrid.bind(this)
        });

        sessionAlertForm.init();
    },

    onEdit: function() {
        var sessionAlertForm = Ext.create('config.config_alert_sessionalert_form', {
            mode: 'Edit',
            parentRefresh: this.onRefresh.bind(this),
            parentSelectGrid: this.selectGrid.bind(this)
        });

        sessionAlertForm.init();
    },

    onDelete: function() {
        var selectGrid = this.selectGrid(),
            name, serverType, alertType, alertResourceName,
            selectRowData;

        Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
            if (btn === 'yes') {
                selectRowData = selectGrid.getSelectedRow()[0].data;
                alertType = 'Session Alert';
                alertResourceName = selectRowData.alert_name_en;

                switch (cfg.alert.sltMode) {
                    case 'Agent' :
                        serverType = 'WAS';
                        break;
                    case 'WS' :
                        serverType = 'WEBSERVER';
                        break;
                    case 'DB' :
                        serverType = cfg.alert.sltType;
                        break;
                    case 'APIM' :
                        serverType = 'APIM';
                        break;
                    case 'TP' :
                        serverType = 'TP';
                        break;
                    default :
                        break;
                }

                if (cfg.alert.sltExistSub) {
                    name = cfg.alert.sltName;
                } else {
                    name = cfg.alert.sltId;
                }

                config.ConfigEnv.group_flag = cfg.alert.sltExistSub;

                config.ConfigEnv.delete_config( name, serverType, alertType, alertResourceName );

                setTimeout(function() {
                    this.onRefresh();
                }.bind(this), 100);
            }
        }.bind(this));
    },

    selectGrid: function() {
        return cfg.alert.sltExistSub ? this.sessionGroupAlertGrid : this.sessionServerAlertGrid;
    },

    onRefresh: function() {
        var add = this.toolBar.getComponent('cfg_sessionalert_add' + this.MODE),
            edit = this.toolBar.getComponent('cfg_sessionalert_edit' + this.MODE),
            del = this.toolBar.getComponent('cfg_sessionalert_delete' + this.MODE);

        if (cfg.alert.sltGroup === 'Root') {
            if (cfg.alert.sltExistSub) { // Group
                this.sessionGroupAlertGrid.setVisible(true);
                // toolbar 높이 30과 name panel 높이 24로 인한 target 높이 제거
                this.sessionGroupAlertCon.setVisible(true);
                this.sessionGroupAlertGrid.setHeight(this.target.getHeight() - 54);
                this.sessionServerAlertCon.setVisible(false);
                this.sessionServerAlertGrid.setVisible(false);
                this.alertSetQuery('group');
            } else { // Server
                this.sessionGroupAlertCon.setVisible(false);
                this.sessionGroupAlertGrid.setVisible(false);
                this.sessionServerAlertCon.setVisible(true);
                this.sessionServerAlertGrid.setVisible(true);
                this.alertSetQuery('server');
            }
        } else { // Group & Server
            this.sessionGroupAlertCon.setVisible(true);
            this.sessionGroupAlertGrid.setVisible(true);
            this.sessionGroupAlertGrid.setHeight(150);
            this.sessionServerAlertCon.setVisible(true);
            this.sessionServerAlertGrid.setVisible(true);
            this.alertSetQuery('group');
            this.alertSetQuery('server');
        }

        if (!cfg.alert.sltName) {
            add.setDisabled(true);
        } else {
            add.setDisabled(false);
        }
        edit.setDisabled(true);
        del.setDisabled(true);
    },

    alertSetQuery: function(type) {
        var dataSet = {},
            serverType, addWhereList, orderBy;

        if (cfg.alert.sltMode === 'Agent') {
            serverType = 'WAS';
        } else if (cfg.alert.sltMode === 'DB') {
            serverType = cfg.alert.sltType;
        } else if (cfg.alert.sltMode === 'WS') {
            serverType = 'WEBSERVER';
        } else {
            serverType = cfg.alert.sltMode;
        }

        addWhereList = 'and server_type = \'' + serverType + '\'';
        orderBy = 'order by alert_resource_name';

        dataSet.bind = [{
            name: 'alertType',
            value: 'Session Alert',
            type : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name: 'addWhereList',
            value: addWhereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if (type === 'group') {
            dataSet.sql_file = 'IMXConfig_AlertGroupSet.sql';
            dataSet.bind.push({
                name: 'groupName',
                value: cfg.alert.sltGroup === 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup,
                type: SQLBindType.STRING
            });
        } else {
            dataSet.sql_file = 'IMXConfig_AlertServerSet.sql';
            dataSet.bind.push({
                name: 'serverId',
                value: cfg.alert.sltId,
                type: SQLBindType.INTEGER
            });
        }

        if ( common.Util.isMultiRepository() ) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.alertSetQueryResult, this);
    },

    alertSetQueryResult: function(header, data) {
        var ix, ixLen;

        if ( !common.Util.checkSQLExecValid(header, data) ) {
            console.debug('config_alert_sessionalert - alertSetQueryResult');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (header.command === 'IMXConfig_AlertServerSet.sql') {
            this.serverSetData = [];
            for ( ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
                this.serverSetData.push(data.rows[ix]);
            }
            this.alertTagValueQuery('server');
        } else {
            this.groupSetData = [];
            for ( ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
                this.groupSetData.push(data.rows[ix]);
            }
            this.alertTagValueQuery('group');
        }
    },

    alertTagValueQuery: function(type) {
        var dataSet = {},
            serverType, groupName, groupNameList;

        if (cfg.alert.sltMode === 'Agent') {
            serverType = 'WAS';
        } else if (cfg.alert.sltMode === 'DB') {
            serverType = cfg.alert.sltType;
        } else if (cfg.alert.sltMode === 'WS') {
            serverType = 'WEBSERVER';
        } else {
            serverType = cfg.alert.sltMode;
        }

        dataSet.bind = [{
            name: 'serverType',
            value: serverType,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'Session Alert',
            type : SQLBindType.STRING
        }];

        if (type === 'group') {
            groupName = cfg.alert.sltGroup === 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;
            groupNameList = '\'' + groupName + '\'';
            dataSet.sql_file = 'IMXConfig_AlertGroupTagValue.sql';
            dataSet.replace_string = [{
                name: 'groupNameList',
                value: groupNameList
            }];
        } else {
            dataSet.sql_file = 'IMXConfig_AlertServerTagValue.sql';
            dataSet.bind.push({
                name: 'serverId',
                value: cfg.alert.sltId,
                type : SQLBindType.INTEGER
            });
        }

        if ( common.Util.isMultiRepository() ) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.alertTagValueQueryResult, this);
    },

    alertTagValueQueryResult: function(header, data) {
        if ( !common.Util.checkSQLExecValid(header, data) ) {
            console.debug('config_alert_sessionalert - alertTagValueQueryResult');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (header.command === 'IMXConfig_AlertServerTagValue.sql') {
            this.setSessionAlertDataObj(data.rows, 'server');
        } else {
            this.setSessionAlertDataObj(data.rows, 'group');
        }
    },

    setSessionAlertDataObj: function(tagValueData, type) {
        var resourceNameList = [],
            sessionAlertData = {},
            ix, ixLen, alertResourceName, groupName;

        for ( ix = 0, ixLen = tagValueData.length; ix < ixLen; ix++ ) {
            alertResourceName = tagValueData[ix][3];
            if (resourceNameList.indexOf(alertResourceName) === -1) {
                resourceNameList.push(alertResourceName);
                sessionAlertData[alertResourceName] = {};
            }
        }

        if (type === 'server') {
            this.setSessionAlertData(cfg.alert.sltId, tagValueData, resourceNameList, sessionAlertData, type);
        } else {
            groupName = cfg.alert.sltGroup === 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;
            this.setSessionAlertData(groupName, tagValueData, resourceNameList, sessionAlertData, type);
        }
    },

    setSessionAlertData: function(currentKey, tagValueData, resourceNameList, sessionAlertData, type) {
        var sqlSetData = type === 'server' ? this.serverSetData : this.groupSetData,
            ix, ixLen, jx, jxLen, kx, kxLen,
            rows, alertResourceName, setData;

        for ( ix = 0, ixLen = tagValueData.length; ix < ixLen; ix++) {
            rows = tagValueData[ix];
            for ( jx = 0, jxLen = resourceNameList.length; jx < jxLen; jx++) {
                alertResourceName = resourceNameList[jx];

                if (rows[0] === currentKey && rows[3] === alertResourceName) {
                    sessionAlertData[alertResourceName][rows[4]] = rows[5];
                }

                for ( kx = 0, kxLen = sqlSetData.length; kx < kxLen; kx++ ) {
                    setData = sqlSetData[kx];
                    if ( setData[0] === currentKey  && setData[2] === 'Session Alert' && setData[3] === alertResourceName ) {
                        sessionAlertData[alertResourceName]['SMS_SCHEDULE'] = setData[4];
                    }
                }
            }
        }

        this.drawSessionAlertData(sessionAlertData, type);
    },

    drawSessionAlertData: function(sessionAlertData, type) {
        var sessionGrid = type === 'server' ? this.sessionServerAlertGrid : this.sessionGroupAlertGrid,
            alertResourceName = Object.keys(sessionAlertData),
            ix, ixLen,
            sessionData, sessionAlertName;

        sessionGrid.clearRows();

        for ( ix = 0, ixLen = alertResourceName.length; ix < ixLen; ix++ ) {
            sessionData = sessionAlertData[alertResourceName[ix]];
            sessionAlertName = common.Util.CTR(sessionData['STAT_NAME']) + ':' + common.Util.CTR(sessionData['SCOPE_TYPE'].replace('_',' ')) + ':' + sessionData['SCOPE_VALUE'];

            if (cfg.repository === 'MSSQL' && cfg.alert.sltMode === 'Agent') {
                sessionGrid.addRow([
                    sessionAlertName,
                    common.Util.CTR(sessionData['STAT_NAME']),
                    common.Util.CTR(sessionData['SCOPE_TYPE'].replace('_',' ')),
                    sessionData['SCOPE_VALUE'],
                    sessionData['EXCEPTION_TYPE'],
                    sessionData['EXCEPTION_VALUE'],
                    +sessionData['WARNING_VALUE'],
                    +sessionData['CRITICAL_VALUE'],
                    sessionData['SMS_SCHEDULE'],
                    cfg.alert.sltId,
                    sessionData['STAT_NAME'],
                    sessionData['SCOPE_TYPE'],
                    alertResourceName[ix]
                ]);
            } else {
                sessionGrid.addRow([
                    sessionAlertName,
                    common.Util.CTR(sessionData['STAT_NAME']),
                    common.Util.CTR(sessionData['SCOPE_TYPE'].replace('_',' ')),
                    sessionData['SCOPE_VALUE'],
                    +sessionData['WARNING_VALUE'],
                    +sessionData['CRITICAL_VALUE'],
                    sessionData['SMS_SCHEDULE'],
                    cfg.alert.sltId,
                    sessionData['STAT_NAME'],
                    sessionData['SCOPE_TYPE'],
                    alertResourceName[ix]
                ]);
            }
        }

        sessionGrid.drawGrid();
    }
});
