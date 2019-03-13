Ext.define('config.config_alert_c_api_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    groupSetData : [],
    serverSetData : [],

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
                id: 'cfg_c_api_alert_add' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_c_api_alert_edit' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_c_api_alert_delete' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Refresh'); }
            }]
        });

        this.target.add(toolbar);

        this.C_API_GroupAlertPanel = Ext.create('Ext.panel.Panel', {
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
        this.target.add(this.C_API_GroupAlertPanel);

        this.C_API_GroupAlertGrid = Ext.create('Exem.adminGrid', {
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
                var edit = Ext.getCmp('cfg_c_api_alert_edit' + self.MODE);
                var del = Ext.getCmp('cfg_c_api_alert_delete' + self.MODE);

                if ( cfg.alert.sltGroup == 'Root' ){
                    del.setDisabled( false );
                    edit.setDisabled( false );
                } else {
                    del.setDisabled( true );
                    edit.setDisabled( true );
                }

                edit = null;
                del  = null;
            }
        });
        this.target.add(this.C_API_GroupAlertGrid);

        this.C_API_GroupAlertGrid.beginAddColumns();
        this.C_API_GroupAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),        dataIndex: 'alert_name',        width: 240, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_GroupAlertGrid.addColumn({text: common.Util.CTR('Stat Name'),         dataIndex: 'stat_name',         width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_GroupAlertGrid.addColumn({text: common.Util.CTR('Alert Level'),       dataIndex: 'alert_level',       width: 100, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_GroupAlertGrid.addColumn({text: common.Util.CTR('Alert Description'), dataIndex: 'alert_description', width: 240, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_GroupAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),      dataIndex: 'sms',               width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_GroupAlertGrid.addColumn({text: common.Util.CTR('graytext'),          dataIndex: 'graytext',          width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.C_API_GroupAlertGrid.endAddColumns();

        this.C_API_GroupAlertGrid.baseGrid.getView().getRowClass = function(record) {
            if (record.data.graytext == 'gray') {
                return 'grid-gray-text';
            }
        };

        this.C_API_ServerAlertPanel = Ext.create('Ext.panel.Panel', {
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
        this.target.add(this.C_API_ServerAlertPanel);

        this.C_API_ServerAlertGrid = Ext.create('Exem.adminGrid', {
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
                var edit = Ext.getCmp('cfg_c_api_alert_edit' + self.MODE);
                var del = Ext.getCmp('cfg_c_api_alert_delete' + self.MODE);

                edit.setDisabled(false);
                del.setDisabled(false);

                edit = null;
                del  = null;
            }
        });
        this.target.add(this.C_API_ServerAlertGrid);

        this.C_API_ServerAlertGrid.beginAddColumns();
        this.C_API_ServerAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),        dataIndex: 'alert_name',        width: 240, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_ServerAlertGrid.addColumn({text: common.Util.CTR('Stat Name'),         dataIndex: 'stat_name',         width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_ServerAlertGrid.addColumn({text: common.Util.CTR('Alert Level'),       dataIndex: 'alert_level',       width: 100, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_ServerAlertGrid.addColumn({text: common.Util.CTR('Alert Description'), dataIndex: 'alert_description', width: 240, type: Grid.String, alowEdit: true,  editMode: true});
        this.C_API_ServerAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),      dataIndex: 'sms',               width: 150, type: Grid.String, alowEdit: true,  editMode: true});

        this.C_API_ServerAlertGrid.endAddColumns();
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
        var ix, count, alertNameList = [];


        if(cfg.alert.sltExistSub){
            count = this.C_API_GroupAlertGrid.getRowCount();
            for(ix = 0; ix < count; ix++){
                alertNameList.push(this.C_API_GroupAlertGrid.getRow(ix).data.alert_name);
            }
        } else {
            count = this.C_API_ServerAlertGrid.getRowCount();
            for(ix = 0; ix < count; ix++){
                alertNameList.push(this.C_API_ServerAlertGrid.getRow(ix).data.alert_name);
            }
        }

        var sessionAlertForm = Ext.create('config.config_alert_c_api_setting_form');
        sessionAlertForm.parent         = this;
        sessionAlertForm.alertNameList  = alertNameList;
        sessionAlertForm.init('Add');
    },

    onEdit: function() {
        var data, count, ix, alertNameList = [],
            sessionAlertForm = Ext.create('config.config_alert_c_api_setting_form');

        if(cfg.alert.sltExistSub){
            data = this.C_API_GroupAlertGrid.getSelectedRow()[0].data;
            count = this.C_API_GroupAlertGrid.getRowCount();
            for(ix = 0; ix < count; ix++){
                if(this.C_API_GroupAlertGrid.getRow(ix).data.alert_name === data.alert_name){
                    continue;
                }
                alertNameList.push(this.C_API_GroupAlertGrid.getRow(ix).data.alert_name);
            }
        } else {
            data = this.C_API_ServerAlertGrid.getSelectedRow()[0].data;
            count = this.C_API_ServerAlertGrid.getRowCount();
            for(ix = 0; ix < count; ix++){
                if(this.C_API_ServerAlertGrid.getRow(ix).data.alert_name === data.alert_name){
                    continue;
                }
                alertNameList.push(this.C_API_ServerAlertGrid.getRow(ix).data.alert_name);
            }
        }

        sessionAlertForm.parent            = this;
        sessionAlertForm.alert_name        = data.alert_name;
        sessionAlertForm.alertNameList     = alertNameList;
        sessionAlertForm.alert_level       = data.alert_level;
        sessionAlertForm.sms_schedule_name = data.sms;
        sessionAlertForm.alert_description = data.alert_description;
        sessionAlertForm.init('Edit');
    },

    onDelete: function() {
        var self = this;
        var d = cfg.alert.sltExistSub ? this.C_API_GroupAlertGrid.getSelectedRow()[0].data : this.C_API_ServerAlertGrid.getSelectedRow()[0].data;

        if (d != undefined) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                if (btn === 'yes') {

                    var name, server_type, alert_type, alert_resource_name ;

                    if (cfg.alert.sltExistSub) {
                        name = cfg.alert.sltName;
                    }else {
                        name = cfg.alert.sltId;
                    }

                    server_type = 'APIM';
                    alert_type = 'C API';
                    alert_resource_name = d.alert_name;

                    config.ConfigEnv.group_flag = cfg.alert.sltExistSub ;
                    config.ConfigEnv.delete_config( name, server_type, alert_type, alert_resource_name ) ;

                    setTimeout(function() {
                        self.onRefresh();
                    }, 100);
                }
            });
        }
    },

    onRefresh: function() {
        var groupPanel = this.C_API_GroupAlertPanel,
            groupGrid = this.C_API_GroupAlertGrid,
            serverPanel = this.C_API_ServerAlertPanel,
            serverGrid = this.C_API_ServerAlertGrid;

        if (cfg.alert.sltGroup == 'Root') {
            if (cfg.alert.sltExistSub) {
                //Group Only
                groupPanel.setVisible(true);
                groupGrid.setVisible(true);
                //toolbar 높이 30과 name panel 높이 24로 인한 target 높이 제거
                groupGrid.setHeight(this.target.getHeight() - 54);

                serverPanel.setVisible(false);
                serverGrid.setVisible(false);
            } else {
                //Server Only
                serverPanel.setVisible(true);
                serverGrid.setVisible(true);

                groupPanel.setVisible(false);
                groupGrid.setVisible(false);
            }
        } else {
            //both
            groupPanel.setVisible(true);
            groupGrid.setVisible(true);
            groupGrid.setHeight(150);

            serverPanel.setVisible(true);
            serverGrid.setVisible(true);
        }

        this.groupSetQuery();

        Ext.getCmp('cfg_c_api_alert_add' + this.MODE).setDisabled(false);
        Ext.getCmp('cfg_c_api_alert_edit' + this.MODE).setDisabled(true);
        Ext.getCmp('cfg_c_api_alert_delete' + this.MODE).setDisabled(true);
    },

    groupSetQuery: function() {
        var dataSet = {},
            groupName = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup,
            addWhereList = 'and server_type = \'APIM\' ',
            orderBy = 'order by alert_resource_name ';

        dataSet.sql_file = 'IMXConfig_AlertGroupSet.sql';
        dataSet.bind = [{
            name: 'groupName',
            value: groupName,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'C API',
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
        var ix,ixLen;
        if (adata.rows == undefined){
            return;
        }

        this.groupSetData.length = 0;
        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            this.groupSetData.push(adata.rows[ix]);
        }
        this.groupTagValueQuery();
    },

    groupTagValueQuery: function() {
        var dataSet = {},
            groupName = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup,
            groupNameList = '\'' + groupName + '\' ';

        dataSet.sql_file = 'IMXConfig_AlertGroupTagValue.sql';
        dataSet.bind = [{
            name: 'serverType',
            value: 'APIM',
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'C API',
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
        var self = this,
            ix, ixLen,
            textColor,
            resourcesName, resourcesList = [], groupData = {},
            groupName = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            resourcesName = adata.rows[ix][3];
            if (resourcesList.indexOf(resourcesName) == -1) {
                resourcesList.push(resourcesName);
                groupData[resourcesName] = {};
            }
        }

        var setValue = function(groupName) {
            var ix, ixLen, jx, jxLen, kx, kxLen,
                dataRows, alertResourceName, groupSetData;

            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                dataRows = adata.rows[ix];

                for (jx = 0, jxLen = resourcesList.length; jx < jxLen ; jx++) {
                    alertResourceName = resourcesList[jx];
                    if (dataRows[0] == groupName && dataRows[3] == alertResourceName) {
                        switch (dataRows[4]) {
                            case 'LEVEL' :
                                groupData[alertResourceName].alert_level = common.Util.CTR(dataRows[5]);
                                break;
                            default :
                                break;
                        }
                    }

                    for (kx = 0, kxLen = self.groupSetData.length; kx < kxLen; kx++) {
                        groupSetData = self.groupSetData[kx];
                        if (groupSetData[0] == groupName &&
                            groupSetData[1] == 'APIM' &&
                            groupSetData[2] == 'C API' &&
                            groupSetData[3] == alertResourceName)
                        {
                            groupData[alertResourceName].sms_schedule = groupSetData[4];
                            groupData[alertResourceName].alert_description = groupSetData[5];
                        }
                    }

                }
            }
        };

        setValue(groupName);

        textColor = cfg.alert.sltId == undefined ? 'black' : 'gray';

        this.C_API_GroupAlertGrid.clearRows();
        for (var resourceNameKey in groupData) {
            if(groupData.hasOwnProperty(resourceNameKey)){
                this.C_API_GroupAlertGrid.addRow([
                    resourceNameKey,
                    'C API',
                    groupData[resourceNameKey].alert_level,
                    groupData[resourceNameKey].alert_description,
                    groupData[resourceNameKey].sms_schedule,
                    textColor
                ]);
            }
        }
        this.C_API_GroupAlertGrid.drawGrid();

        this.serverSetQuery();
    },

    serverSetQuery: function() {
        var serverId = cfg.alert.sltId;

        if (!serverId){
            return;
        }

        var dataSet = {};
        var addWhereList = 'and server_type = \'APIM\'';
        var orderBy = 'order by alert_resource_name';
        dataSet.sql_file = 'IMXConfig_AlertServerSet.sql';
        dataSet.bind = [{
            name: 'serverId',
            value: serverId,
            type : SQLBindType.INTEGER
        }, {
            name: 'alertType',
            value: 'C API',
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
        var ix,ixLen;
        if (adata.rows == undefined){
            return;
        }

        this.serverSetData.length = 0;
        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            this.serverSetData.push(adata.rows[ix]);
        }
        this.serverTagValueQuery();
    },

    serverTagValueQuery: function() {
        var dataSet = {},
            serverId = cfg.alert.sltId;

        dataSet.sql_file = 'IMXConfig_AlertServerTagValue.sql';
        dataSet.bind = [{
            name: 'serverId',
            value: serverId,
            type : SQLBindType.INTEGER
        }, {
            name: 'serverType',
            value: 'APIM',
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'C API',
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.serverTagValueQueryResult, this);
    },

    serverTagValueQueryResult: function(aheader, adata) {
        if (adata.rows == undefined){
            return;
        }

        var self = this,
            ix, ixLen,
            resourcesName, resourcesList = [], serverData = {},
            serverId = cfg.alert.sltId;

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            resourcesName = adata.rows[ix][3];
            if (resourcesList.indexOf(resourcesName) == -1) {
                resourcesList.push(resourcesName);
                serverData[resourcesName] = {};
            }
        }

        var setValue = function(serverId) {
            var ix, ixLen, jx, jxLen, kx, kxLen,
                dataRows, alertResourceName, serverSetData;

            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                dataRows = adata.rows[ix];

                for (jx = 0, jxLen = resourcesList.length; jx < jxLen ; jx++) {
                    alertResourceName = resourcesList[jx];
                    if (dataRows[0] == serverId && dataRows[3] == alertResourceName) {
                        switch (dataRows[4]) {
                            case 'LEVEL' :
                                serverData[alertResourceName].alert_level = common.Util.CTR(dataRows[5]);
                                break;
                            default :
                                break;
                        }
                    }


                    for (kx = 0, kxLen = self.serverSetData.length; kx < kxLen; kx++) {
                        serverSetData = self.serverSetData[kx];
                        if (serverSetData[0]  == serverId &&
                            serverSetData[1] == 'APIM' &&
                            serverSetData[2] == 'C API' &&
                            serverSetData[3] == alertResourceName)
                        {
                            serverData[alertResourceName].sms_schedule = serverSetData[4];
                            serverData[alertResourceName].alert_description = serverSetData[5];
                        }
                    }
                }
            }
        };

        setValue(serverId);

        this.C_API_ServerAlertGrid.clearRows();
        for (var resourceNameKey in serverData) {
            if(serverData.hasOwnProperty(resourceNameKey)){
                this.C_API_ServerAlertGrid.addRow([
                    resourceNameKey,
                    'C API',
                    serverData[resourceNameKey].alert_level,
                    serverData[resourceNameKey].alert_description,
                    serverData[resourceNameKey].sms_schedule
                ]);
            }
        }
        this.C_API_ServerAlertGrid.drawGrid();
    }
});
