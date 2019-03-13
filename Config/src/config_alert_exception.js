Ext.define('config.config_alert_exception', {
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

        this.target.add(this.toolBar, this.exceptionGroupAlertPanel, this.exceptionGroupAlertGrid,
            this.exceptionServerAlertPanel, this.exceptionServerAlertGrid);
    },

    createToolBar: function() {
        this.toolBar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                id: 'cfg_exception_add' + this.MODE,
                scope: this,
                handler: function() {
                    this.onButtonClick('Add');
                }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_exception_edit' + this.MODE,
                scope: this,
                handler: function() {
                    this.onButtonClick('Edit');
                }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_exception_delete' + this.MODE,
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
        this.exceptionGroupAlertPanel = Ext.create('Ext.panel.Panel', {
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
    },

    createGroupGrid: function() {
        this.exceptionGroupAlertGrid = Ext.create('Exem.adminGrid', {
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
                var edit = this.toolBar.getComponent('cfg_exception_edit' + this.MODE),
                    del = this.toolBar.getComponent('cfg_exception_delete' + this.MODE);

                if ( cfg.alert.sltGroup === 'Root' ) {
                    edit.setDisabled( false );
                    del.setDisabled( false );
                } else {
                    edit.setDisabled( true );
                    del.setDisabled( true );
                }
            }.bind(this)
        });

        this.exceptionGroupAlertGrid.beginAddColumns();
        this.exceptionGroupAlertGrid.addColumn({text: common.Util.CTR('Type'),                      dataIndex: 'type'               ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionGroupAlertGrid.addColumn({text: common.Util.CTR('Transaction'),               dataIndex: 'txn_name'           ,width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionGroupAlertGrid.addColumn({text: common.Util.CTR('Exception Name'),            dataIndex: 'exception_name'     ,width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionGroupAlertGrid.addColumn({text: common.Util.CTR('Exception Name(Exclusion)'), dataIndex: 'exclusion_name'     ,width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionGroupAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),              dataIndex: 'sms'                ,width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionGroupAlertGrid.addColumn({text: common.Util.CTR('graytext'),                  dataIndex: 'graytext'           ,width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.exceptionGroupAlertGrid.endAddColumns();

        this.exceptionGroupAlertGrid.baseGrid.getView().getRowClass = function(record) {
            if ( record.data.graytext ) {
                return 'grid-gray-text';
            }
        };
    },

    createServerLabel: function() {
        this.exceptionServerAlertPanel = Ext.create('Ext.panel.Panel', {
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
    },

    createServerGrid: function() {
        this.exceptionServerAlertGrid = Ext.create('Exem.adminGrid', {
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
                var edit = this.toolBar.getComponent('cfg_exception_edit' + this.MODE),
                    del = this.toolBar.getComponent('cfg_exception_delete' + this.MODE);

                edit.setDisabled(false);
                del.setDisabled(false);
            }.bind(this)
        });

        this.exceptionServerAlertGrid.beginAddColumns();
        this.exceptionServerAlertGrid.addColumn({text: common.Util.CTR('Type'),                      dataIndex: 'type',                 width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionServerAlertGrid.addColumn({text: common.Util.CTR('Transaction'),               dataIndex: 'txn_name',             width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionServerAlertGrid.addColumn({text: common.Util.CTR('Exception Name'),            dataIndex: 'exception_name',       width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionServerAlertGrid.addColumn({text: common.Util.CTR('Exception Name(Exclusion)'), dataIndex: 'exclusion_name',       width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionServerAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),              dataIndex: 'sms',                  width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.exceptionServerAlertGrid.endAddColumns();
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
        var exceptionForm;

        exceptionForm = Ext.create('config.config_alert_exception_form', {
            mode: 'Add',
            parentRefresh: this.onRefresh.bind(this),
            parentSelectGrid: this.selectGrid.bind(this)
        });

        exceptionForm.init();
    },

    onEdit: function() {
        var exceptionForm;

        exceptionForm = Ext.create('config.config_alert_exception_form', {
            mode: 'Edit',
            parentRefresh: this.onRefresh.bind(this),
            parentSelectGrid: this.selectGrid.bind(this)
        });

        exceptionForm.init();
    },

    onDelete: function() {
        var currentMode, currentKey, selectRowData;

        if (cfg.alert.sltMode === 'Agent') {
            currentMode = 'WAS';
        } else {
            currentMode = cfg.alert.sltMode;
        }


        if (cfg.alert.sltExistSub) {
            currentKey = cfg.alert.sltName;
            selectRowData = this.exceptionGroupAlertGrid.getSelectedRow()[0].data;
        } else {
            currentKey = cfg.alert.sltId;
            selectRowData = this.exceptionServerAlertGrid.getSelectedRow()[0].data;
        }

        config.ConfigEnv.group_flag = cfg.alert.sltExistSub;

        if ( selectRowData ) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                if ( btn === 'yes' ) {
                    config.ConfigEnv.delete_config( currentKey, currentMode, 'Exception Alert', selectRowData.exception_name );
                    setTimeout(function() {
                        this.onRefresh();
                    }.bind(this), 100);
                }
            }.bind(this));
        }
    },

    selectGrid: function() {
        return cfg.alert.sltExistSub ? this.exceptionGroupAlertGrid : this.exceptionServerAlertGrid;
    },

    onRefresh: function() {
        var add = this.toolBar.getComponent('cfg_exception_add' + this.MODE),
            edit = this.toolBar.getComponent('cfg_exception_edit' + this.MODE),
            del = this.toolBar.getComponent('cfg_exception_delete' + this.MODE);

        if ( cfg.alert.sltGroup === 'Root' ) {
            if ( cfg.alert.sltExistSub ) {
                this.exceptionGroupAlertGrid.setVisible(true);
                // toolbar 높이 30과 name panel 높이 24로 인한 target 높이 제거
                this.exceptionGroupAlertGrid.setHeight(this.target.getHeight() - 54);
                this.exceptionGroupAlertPanel.setVisible(true);

                this.exceptionServerAlertGrid.setVisible(false);
                this.exceptionServerAlertPanel.setVisible(false);
            } else {
                this.exceptionGroupAlertGrid.setVisible(false);
                this.exceptionGroupAlertPanel.setVisible(false);

                this.exceptionServerAlertGrid.setVisible(true);
                this.exceptionServerAlertPanel.setVisible(true);
            }
        } else {
            this.exceptionGroupAlertPanel.setVisible(true);
            this.exceptionGroupAlertGrid.setVisible(true);
            this.exceptionGroupAlertGrid.setHeight(150);

            this.exceptionServerAlertPanel.setVisible(true);
            this.exceptionServerAlertGrid.setVisible(true);
        }

        if ( !cfg.alert.sltName ) {
            add.setDisabled(true);
        } else {
            add.setDisabled(false);
        }
        edit.setDisabled(true);
        del.setDisabled(true);

        // 그룹 SQL
        if (cfg.alert.sltExistSub) {
            this.alertSetQuery('group');
        }

        // 서버 SQL
        if (!cfg.alert.sltExistSub && cfg.alert.sltGroup === 'Root') {
            this.alertSetQuery('server');
        }

        // 그룹 안에 있는 서버 SQL
        if (!cfg.alert.sltExistSub && cfg.alert.sltGroup !== 'Root') {
            this.alertSetQuery('group');
            this.alertSetQuery('server');
        }
    },

    alertSetQuery: function(type) {
        var groupName = cfg.alert.sltGroup === 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup,
            dataSet = {},
            serverType, addWhereList, orderBy;

        if (cfg.alert.sltMode === 'Agent') {
            serverType = 'WAS';
        } else {
            serverType = cfg.alert.sltMode;
        }

        addWhereList = 'and server_type = \'' + serverType + '\'';
        orderBy = 'order by alert_resource_name';

        dataSet.bind = [{
            name: 'alertType',
            value: 'Exception Alert',
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
                value: groupName,
                type : SQLBindType.STRING
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
            console.debug('config_alert_exception - alertSetQueryResult');
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
        var groupName = cfg.alert.sltGroup === 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup,
            dataSet = {},
            serverType, groupNameList;

        if (cfg.alert.sltMode === 'Agent') {
            serverType = 'WAS';
        } else {
            serverType = cfg.alert.sltMode;
        }

        dataSet.bind = [{
            name: 'serverType',
            value: serverType,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'Exception Alert',
            type : SQLBindType.STRING
        }];

        if (type === 'group') {
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
            console.debug('config_alert_exception - alertTagValueQueryResult');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (header.command === 'IMXConfig_AlertServerTagValue.sql') {
            this.setExceptionAlertDataObj(data.rows, 'server');
        } else {
            this.setExceptionAlertDataObj(data.rows, 'group');
        }
    },

    setExceptionAlertDataObj: function(tagValueData, type) {
        var groupName = cfg.alert.sltGroup === 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup,
            resourceNameList = [],
            exceptionAlertData = {},
            ix, ixLen, alertResourceName;

        for ( ix = 0, ixLen = tagValueData.length; ix < ixLen; ix++ ) {
            alertResourceName = tagValueData[ix][3];
            if (resourceNameList.indexOf(alertResourceName) === -1) {
                resourceNameList.push(alertResourceName);
                exceptionAlertData[alertResourceName] = {};
            }
        }

        if (type === 'server') {
            this.setExceptionAlertData(cfg.alert.sltId, tagValueData, resourceNameList, exceptionAlertData, type);
        } else {
            this.setExceptionAlertData(groupName, tagValueData, resourceNameList, exceptionAlertData, type);
        }
    },

    setExceptionAlertData: function(currentKey, tagValueData, resourceNameList, exceptionAlertData, type) {
        var sqlSetData = type === 'server' ? this.serverSetData : this.groupSetData,
            ix, ixLen, jx, jxLen, kx, kxLen,
            rows, alertResourceName, setData;

        for ( ix = 0, ixLen = tagValueData.length; ix < ixLen; ix++) {
            rows = tagValueData[ix];
            for ( jx = 0, jxLen = resourceNameList.length; jx < jxLen; jx++) {
                alertResourceName = resourceNameList[jx];

                if (rows[0] === currentKey && rows[3] === alertResourceName) {
                    exceptionAlertData[alertResourceName][rows[4]] = rows[5];
                }

                for ( kx = 0, kxLen = sqlSetData.length; kx < kxLen; kx++ ) {
                    setData = sqlSetData[kx];
                    if ( setData[0] === currentKey  && setData[2] === 'Exception Alert' && setData[3] === alertResourceName ) {
                        exceptionAlertData[alertResourceName]['SMS_SCHEDULE'] = setData[4];
                    }
                }
            }
        }

        this.drawExceptionAlertData(exceptionAlertData, type);
    },

    drawExceptionAlertData: function(exceptionAlertData, type) {
        var exceptionGrid = type === 'server' ? this.exceptionServerAlertGrid : this.exceptionGroupAlertGrid,
            alertResourceName = Object.keys(exceptionAlertData),
            ix, ixLen;

        exceptionGrid.clearRows();

        for ( ix = 0, ixLen = alertResourceName.length; ix < ixLen; ix++ ) {
            exceptionGrid.addRow([
                common.Util.TR(exceptionAlertData[alertResourceName[ix]]['CONFIG_MODE']),
                exceptionAlertData[alertResourceName[ix]]['TXN_NAME'],
                exceptionAlertData[alertResourceName[ix]]['EXCEPTION_NAME'],
                exceptionAlertData[alertResourceName[ix]]['EXCLUSION'],
                exceptionAlertData[alertResourceName[ix]]['SMS_SCHEDULE'],
                cfg.alert.sltId
            ]);
        }

        exceptionGrid.drawGrid();
    }
});