Ext.define('config.config_alert_useralert', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        this.initLayout();
    },

    initLayout: function(){
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.createServiceList();
        this.createUserAlert();

        baseCon.add(this.serviceListPanel, this.userAlertPanel);

        this.target.add(baseCon);
    },

    createServiceList: function(){
        this.serviceListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            width: 250,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#eeeeee' }
        });

        var serviceListTitle = Ext.create('Ext.container.Container', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Service List'))
            }]
        });

        var serviceListBody = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createServiceGrid(serviceListBody);

        this.serviceListPanel.add(serviceListTitle, serviceListBody);
    },

    createUserAlert: function(){
        this.userAlertPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        this.userAlertToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_useralert_edit' + this.MODE,
                scope: this,
                handler: function() { this.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_useralert_delete' + this.MODE,
                scope: this,
                handler: function() { this.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh'); }
            }]
        });

        var userAlertBody = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createUserAlertGrid(userAlertBody);

        this.userAlertPanel.add(this.userAlertToolbar, userAlertBody);
    },

    createServiceGrid: function(gridCon) {
        this.serviceListGrid = Ext.create('Exem.adminGrid', {
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

        gridCon.add(this.serviceListGrid);

        this.serviceListGrid.beginAddColumns();
        this.serviceListGrid.addColumn({text: common.Util.CTR('Service Name'),  dataIndex: 'service_name',  width: 135, type: Grid.String, alowEdit: false, editMode: false});
        this.serviceListGrid.endAddColumns();
    },

    createUserAlertGrid: function(gridCon){
        this.userAlertGrid = Ext.create('Exem.adminGrid', {
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
                this.selectServiceList();

                this.userAlertToolbar.getComponent('cfg_useralert_edit' + this.MODE).setDisabled(false);
                this.userAlertToolbar.getComponent('cfg_useralert_delete' + this.MODE).setDisabled(false);
            }.bind(this)
        });

        gridCon.add(this.userAlertGrid);

        this.userAlertGrid.beginAddColumns();
        this.userAlertGrid.addColumn({text: common.Util.CTR('Service List'),    dataIndex: 'service_list',    width: 200, type: Grid.String,    alowEdit: true, editMode: true});
        this.userAlertGrid.addColumn({text: common.Util.CTR('Transaction Name'),dataIndex: 'txn_name',        width: 250, type: Grid.String,    alowEdit: true, editMode: true});
        this.userAlertGrid.addColumn({text: common.Util.CTR('Criterion Time'),  dataIndex: 'criterion_time',  width: 100, type: Grid.Number,    alowEdit: true, editMode: true});
        this.userAlertGrid.addColumn({text: common.Util.CTR('Execution count'), dataIndex: 'execution_count', width: 100, type: Grid.Number,    alowEdit: true, editMode: true});
        this.userAlertGrid.addColumn({text: common.Util.CTR('Comparison'),      dataIndex: 'comparison',      width: 100, type: Grid.String,    alowEdit: true, editMode: true});
        this.userAlertGrid.addColumn({text: common.Util.CTR('Mode'),            dataIndex: 'config_mode',     width: 100, type: Grid.String,    alowEdit: true, editMode: true});
        this.userAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),    dataIndex: 'sms',             width: 150, type: Grid.String,    alowEdit: true, editMode: true});
        if (common.Menu.userAlert.isDashBoard) {
            this.userAlertGrid.addColumn({text: common.Util.CTR('DashBoard Apply'), dataIndex: 'dash_board',      width: 150, type: Grid.CheckBox,  alowEdit: false, editMode: false});
        }
        this.userAlertGrid.endAddColumns();
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
        var selectServiceData = this.serviceListGrid.getSelectedRow(),
            serviceList = [],
            ix, ixLen, userAlertForm;

        if (selectServiceData.length) {
            for( ix = 0, ixLen = selectServiceData.length; ix< ixLen; ix++ ){
                serviceList.push(selectServiceData[ix].data.service_name);
            }

            userAlertForm = Ext.create('config.config_alert_useralert_form', {
                mode: 'Add',
                serviceList: serviceList,
                parentRefresh: this.onRefresh.bind(this)
            });

            userAlertForm.init();
        } else {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please select one or more service names.'));
        }
    },

    onEdit: function() {
        var selectServiceData = this.serviceListGrid.getSelectedRow(),
            serviceList = [],
            ix, ixLen, selectData, userAlertForm;

        if (selectServiceData.length) {
            selectData = this.userAlertGrid.getSelectedRow()[0].data;

            for ( ix = 0, ixLen = selectServiceData.length; ix< ixLen; ix++ ) {
                serviceList.push(selectServiceData[ix].data.service_name);
            }

            userAlertForm = Ext.create('config.config_alert_useralert_form', {
                mode: 'Edit',
                serviceList: serviceList,
                userData: selectData,
                parentRefresh: this.onRefresh.bind(this)
            });

            userAlertForm.init();
        } else {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please select one or more service names.'));
        }
    },

    onDelete: function() {
        var selectData = this.userAlertGrid.getSelectedRow()[0].data;

        if (selectData) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                var serverType, alertType, alertResourceName;

                if (btn === 'yes') {
                    serverType = 'FAB';
                    alertType = 'User Alert';
                    alertResourceName = selectData.txn_name;

                    config.ConfigEnv.group_flag = false;
                    config.ConfigEnv.delete_config( 0, serverType, alertType, alertResourceName );
                }

                setTimeout(function() {
                    this.onRefresh();
                }.bind(this), 100);

            }.bind(this));
        }
    },

    onRefresh: function() {
        this.getServiceInfo();
        this.serverSetQuery();

        this.userAlertToolbar.getComponent('cfg_useralert_edit' + this.MODE).setDisabled(true);
        this.userAlertToolbar.getComponent('cfg_useralert_delete' + this.MODE).setDisabled(true);
    },

    getServiceInfo: function() {
        var dataSet = {},
            whereList = '1=1';

        dataSet.sql_file = 'IMXConfig_ServiceInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }];

        if ( common.Util.isMultiRepository() ) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.drawServiceList, this);
    },

    drawServiceList: function(header, data) {
        var ix, ixLen;

        if ( !common.Util.checkSQLExecValid(header, data) ) {
            console.debug('config_alert_useralert - drawServiceList');
            console.debug(header);
            console.debug(data);
            return;
        }

        this.serviceListGrid.clearRows();
        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            this.serviceListGrid.addRow([
                data.rows[ix][1]       // Service_Name
            ]);
        }
        this.serviceListGrid.drawGrid();
    },

    serverSetQuery: function() {
        var dataSet = {},
            addWhereList = 'and server_type = \'FAB\'',
            orderBy = 'order by alert_resource_name';

        if (common.Menu.userAlert.isDashBoard) {
            dataSet.sql_file = 'IMXConfig_DashBoard_AlertServerSet.sql';
        } else {
            dataSet.sql_file = 'IMXConfig_AlertServerSet.sql';
        }

        dataSet.bind = [{
            name    : 'serverId',
            value   : 0,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'alertType',
            value   : 'User Alert',
            type    : SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name    : 'addWhereList',
            value   : addWhereList
        }, {
            name    : 'orderBy',
            value   : orderBy
        }];

        if ( common.Util.isMultiRepository() ) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.serverSetQueryResult, this);
    },

    serverSetQueryResult: function(header, data) {
        var ix, ixLen;

        if ( !common.Util.checkSQLExecValid(header, data) ) {
            console.debug('config_alert_useralert - serverSetQueryResult');
            console.debug(header);
            console.debug(data);
            return;
        }

        this.serverSetData = [];
        for ( ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
            this.serverSetData.push(data.rows[ix]);
        }
        this.serverTagValueQuery();
    },

    serverTagValueQuery: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_AlertServerTagValue.sql';
        dataSet.bind = [{
            name: 'serverId',
            value: 0,
            type : SQLBindType.INTEGER
        }, {
            name: 'serverType',
            value: 'FAB',
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'User Alert',
            type : SQLBindType.STRING
        }];

        if ( common.Util.isMultiRepository() ) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.serverTagValueQueryResult, this);
    },

    serverTagValueQueryResult: function(header, data) {
        if ( !common.Util.checkSQLExecValid(header, data) ) {
            console.debug('config_alert_useralert - serverTagValueQueryResult');
            console.debug(header);
            console.debug(data);
            return;
        }

        this.setUserAlertDataObj(data);
    },

    setUserAlertDataObj: function(serverTagValueData) {
        var resourceNameList = [],
            userAlertData = {},
            ix, ixLen, alertResourceName;

        for ( ix = 0, ixLen = serverTagValueData.rows.length; ix < ixLen; ix++ ) {
            alertResourceName = serverTagValueData.rows[ix][3];
            if (resourceNameList.indexOf(alertResourceName) === -1) {
                resourceNameList.push(alertResourceName);
                userAlertData[alertResourceName] = {};
            }
        }

        this.setUserAlertData(0, serverTagValueData, resourceNameList, userAlertData);
    },

    setUserAlertData: function(serverId, serverTagValueData, resourceNameList, userAlertData) {
        var ix, ixLen, jx, jxLen, kx, kxLen,
            rows, alertResourceName, serverSetData;

        for ( ix = 0, ixLen = serverTagValueData.rows.length; ix < ixLen; ix++) {
            rows = serverTagValueData.rows[ix];
            for ( jx = 0, jxLen = resourceNameList.length; jx < jxLen; jx++) {
                alertResourceName = resourceNameList[jx];

                if (rows[0] === serverId && rows[3] === alertResourceName) {
                    switch (rows[4]) {
                        case 'INTERVAL':
                            userAlertData[alertResourceName].interval = rows[5];
                            break;
                        case 'TOTAL_EXECUTION_VALUE':
                            userAlertData[alertResourceName].totalExecutionValue = rows[5];
                            break;
                        case 'COMPARISON':
                            userAlertData[alertResourceName].comparison = rows[5];
                            break;
                        case 'CONFIG_MODE':
                            userAlertData[alertResourceName].configMode = rows[5];
                            break;
                        case 'SERVICE_LIST':
                            userAlertData[alertResourceName].serviceList = rows[5];
                            break;
                        default :
                            break;
                    }
                }

                for ( kx = 0, kxLen = this.serverSetData.length; kx < kxLen; kx++) {
                    serverSetData = this.serverSetData[kx];
                    if ( serverSetData[0] === serverId
                        && serverSetData[1] === 'FAB'
                        && serverSetData[2] === 'User Alert'
                        && serverSetData[3] === alertResourceName )
                    {
                        userAlertData[alertResourceName].txnName = serverSetData[3];
                        userAlertData[alertResourceName].smsSchedule = serverSetData[4];
                        userAlertData[alertResourceName].dashBoard = serverSetData[6];
                    }
                }
            }
        }

        this.drawUserAlertData(userAlertData);
    },

    drawUserAlertData: function(userAlertData) {
        var alertResourceName = Object.keys(userAlertData),
            ix, ixLen;

        this.userAlertGrid.clearRows();

        for ( ix = 0, ixLen = alertResourceName.length; ix < ixLen; ix++ ) {
            this.userAlertGrid.addRow([
                userAlertData[alertResourceName[ix]].serviceList,
                userAlertData[alertResourceName[ix]].txnName,
                userAlertData[alertResourceName[ix]].interval,
                userAlertData[alertResourceName[ix]].totalExecutionValue,
                userAlertData[alertResourceName[ix]].comparison,
                userAlertData[alertResourceName[ix]].configMode,
                userAlertData[alertResourceName[ix]].smsSchedule,
                userAlertData[alertResourceName[ix]].dashBoard
            ]);
        }
        this.userAlertGrid.drawGrid();
    },

    selectServiceList: function() {
        var ix, ixLen, jx, jxLen,
            serviceData, serviceDataList;

        this.serviceListGrid.unCheckAll();

        serviceDataList = this.userAlertGrid.getSelectedRow()[0].data.service_list.split(',');

        for(ix = 0, ixLen = this.serviceListGrid.getRowCount(); ix < ixLen; ix++){
            serviceData = this.serviceListGrid.getRow(ix).data.service_name;
            for(jx = 0, jxLen = serviceDataList.length; jx < jxLen; jx++){
                if (serviceData == serviceDataList[jx]) {
                    this.serviceListGrid.selectRow(ix, true);
                }
            }
        }
    }
});
