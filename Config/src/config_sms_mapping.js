Ext.define('config.config_sms_mapping', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    MODE: '',
    target: null,

    sql: {
        smsUserList     : 'IMXConfig_SMS_Mapping_Info_User.sql',
        agentGroupClick : 'IMXConfig_SMS_Agent_Click.sql',
        mappingDelete   : 'IMXConfig_SMS_Mapping_Delete.sql',
        mappingInsert   : 'IMXConfig_SMS_Mapping_Insert.sql'
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        var self = this;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
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
            //region: 'west',
            height: '100%',
            width: '100%',
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        var servicelist_panel_title = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                flex: 1,
                height: 30,
                border: false,
                margin: '6 0 0 6',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('User List'))
            }, {
                xtype: 'toolbar',
                width: 70,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_save.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Save'); }
                }, {
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

        this._createSMSGrid(servicelist_panel_body);

        panel.add(servicelist_panel);

        this.target.add(panel);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Save' :
                this.SMSSave();
                break;
            case 'Refresh' :
                this.onRefresh();
                break;
            default :
                break;
        }
    },

    onRefresh : function(){
        var self = this;
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Mapping_Info_User.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        if(cfg.alert.wasIds.length == 0 && cfg.alert.sltId == '') {
            return;
        }

        WS.SQLExec(dataSet, function(header, data) {
            self.setUserGroupData(data[0].rows, data[1].rows);
        },this);

    },

    setUserGroupData: function(groupData, userData){
        var ix, ixLen, jx, jxLen,
            groupId, groupName,
            groupIdList;

        this.smsGroupMap = {};
        this.smsUserList = {};

        for(ix = 0, ixLen = groupData.length; ix < ixLen; ix++){
            groupId = groupData[ix][0];
            groupName = groupData[ix][1];

            this.smsGroupMap[groupId] = groupName;
        }

        for(ix = 0, ixLen = userData.length; ix < ixLen; ix++){
            groupIdList = userData[ix][3].split(',');
            for(jx = 0, jxLen = groupIdList.length; jx < jxLen; jx++){
                groupName = this.smsGroupMap[groupIdList[jx]] || '';
                if (!this.smsUserList[groupName]){
                    this.smsUserList[groupName] = [];
                }

                this.smsUserList[groupName].push(userData[ix]);
            }
        }

        this.setUserGroupGrid(this.smsUserList);
    },

    setUserGroupGrid: function(data){
        this.mappingList.clearRows();

        var ix, ixLen, jx, jxLen,
            keys,groupListKeys,
            rowData;

        keys = Object.keys(data);
        groupListKeys = Object.keys(this.smsGroupMap);

        for(ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            rowData = data[keys[ix]];
            if(rowData[0][3] === ''){
                for (jx = 0, jxLen = rowData.length; jx < jxLen; jx++) {
                    this.mappingList.addRow([
                        rowData[jx][0],   //sms_user_id
                        rowData[jx][1],   //sms_user_name
                        rowData[jx][2],   //employee_id
                        rowData[jx][4]    //business_name
                    ]);
                }
            }
        }

        for (ix = 0, ixLen = groupListKeys.length; ix < ixLen; ix++) {
            this.mappingList.addRow([
                groupListKeys[ix],                      //group_id
                this.smsGroupMap[groupListKeys[ix]],    //group_name
                '',
                '',
                true
            ]);
        }
        this.mappingList.drawGrid();

        if(cfg.alert.sltGroup == 'Root'){
            if(cfg.alert.sltExistSub){
                this.treeClick(cfg.alert.wasIds);
            } else {
                this.treeClick(cfg.alert.sltId);
            }
        } else{
            this.treeClick(cfg.alert.sltId);
        }
    },

    treeClick: function(was_id) {
        var self = this;
        var dataSet = {};

        if(was_id.length){
            var ix;
            var wasIds = [];
            var server_id;
            for (ix = 0; ix < was_id.length; ix++) {
                wasIds.push(was_id[ix]);
                server_id = wasIds.join();
            }
        } else{
            server_id = was_id;
        }

        dataSet.sql_file = 'IMXConfig_SMS_Agent_Click.sql';
        dataSet.replace_string = [{
            name: 'server_id' ,
            value: server_id
        }];
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(aheader, adata) {
            self.mappingList.unCheckAll();
            for (var ix = 0; ix < adata.rows.length; ix++) {
                for (var jx = 0; jx < self.mappingList.getRowCount(); jx++) {
                    //sms_group_id check
                    if(adata.rows[ix][3]){
                        var groupIdCheck = self.mappingList.getRow(jx).data.sms_user_id;
                        var group_check = self.mappingList.getRow(jx).data.group_check;
                        // 그룹인지 아닌지 1번더 체크(group_id 부분과 user_id가 같을 수 있으므로)
                        if (group_check && adata.rows[ix][3] == groupIdCheck) {
                            self.mappingList.selectRow(jx, true);
                        }
                    } else{
                        //sms_user_id check
                        var userIdCheck = self.mappingList.getRow(jx).data.sms_user_id;
                        group_check = self.mappingList.getRow(jx).data.group_check;
                        // 그룹인지 아닌지 1번더 체크(group_id 부분과 user_id가 같을 수 있으므로)
                        if (!group_check && adata.rows[ix][0] == userIdCheck) {
                            self.mappingList.selectRow(jx, true);
                        }
                    }
                }
            }
        }, this);
    },

    SMSSave : function(){
        if(cfg.alert.sltGroup == 'Root'){
            if(cfg.alert.sltExistSub){
                this.SMSDeleteData(cfg.alert.wasIds);
            } else {
                this.SMSDeleteData(cfg.alert.sltId);
            }
        } else{
            this.SMSDeleteData(cfg.alert.sltId);
        }
    },

    SMSDeleteData : function(was_id){
        var self = this;
        var dataSet = {};
        var user_id, selectData;
        var mappingList = self.mappingList;

        if(was_id.length){
            var ix;
            var wasIds = [];
            var server_id;
            for (ix = 0; ix < was_id.length; ix++) {
                wasIds.push(was_id[ix]);
                server_id = wasIds.join();
            }
        } else{
            server_id = was_id;
        }

        dataSet.sql_file = 'IMXConfig_SMS_Mapping_Delete.sql';
        if(cfg.alert.tabMode == 'SMS' || cfg.alert.tabMode == 'SMS_Business'){
            var server_type = 1;
        } else if (cfg.alert.tabMode == 'TabDB'){
            server_type = 2;
        }


        if(mappingList.getSelectedRow().length == 0){
            dataSet.replace_string = [{
                name    : 'server_id' ,
                value   : server_id
            }, {
                name    : 'server_type' ,
                value   : server_type
            }];
            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }
            this.SMSDelete(dataSet);
            return;
        }

        for (ix = 0; ix < mappingList.getSelectedRow().length; ix++) {
            //여기서 user_id값이 group_id값인지 user_id값인지 판단
            //user_id일 경우는 그냥 통과
            //group_id일 경우 user_id_list를 만들어서 넘길 필요가 있음.
            selectData = mappingList.getSelectedRow()[ix].data;
            user_id = parseInt(selectData.sms_user_id);
            if(selectData.business_name && selectData.employee_id || !selectData.group_check){

                dataSet.replace_string = [{
                    name    : 'server_id' ,
                    value   : server_id
                }, {
                    name    : 'server_type' ,
                    value   : server_type
                }];
                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }
                this.SMSDelete(dataSet,user_id,server_id,ix);
            } else {
                var group_id = parseInt(selectData.sms_user_id);
                var groupName = this.smsGroupMap[group_id];
                var user_id_list = this.smsUserList[groupName];
                var jx,jxLen;

                for(jx = 0, jxLen = user_id_list.length; jx < jxLen; jx++){
                    user_id = user_id_list[jx][0];
                    dataSet.replace_string = [{
                        name    : 'server_id' ,
                        value   : server_id
                    }, {
                        name    : 'server_type' ,
                        value   : server_type
                    }];
                    if(common.Util.isMultiRepository()){
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }
                    this.SMSDelete(dataSet,user_id,server_id,ix,group_id);
                }
            }
        }
    },

    SMSDelete : function(dataSet,user_id,server_id,count,group_id){
        var self = this;

        WS.SQLExec(dataSet, function() {
            self.SMSInsertData(user_id,server_id,count,group_id);
        }, this);
    },

    SMSInsertData : function(user_id,server_id,count,group_id){
        var self = this;
        var dataSet = {};

        if(!user_id){
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            this.onRefresh();
            return;
        }

        if(!group_id){
            group_id = null;
        }

        dataSet.sql_file = 'IMXConfig_SMS_Mapping_Insert.sql';

        if(cfg.alert.tabMode == 'SMS' || cfg.alert.tabMode == 'SMS_Business'){
            var server_type = 1;
        } else if (cfg.alert.tabMode == 'TabDB'){
            server_type = 2;
        }

        if(cfg.alert.sltGroup == 'Root'){
            if(cfg.alert.sltExistSub){
                for(var ix = 0; ix < server_id.split(',').length ; ix++){
                    dataSet.bind = [{
                        name: 'sms_user_id' ,
                        value: user_id,
                        type : SQLBindType.INTEGER
                    }, {
                        name: 'server_id' ,
                        value: server_id.split(',')[ix],
                        type : SQLBindType.INTEGER
                    }, {
                        name: 'server_type',
                        value: server_type,
                        type : SQLBindType.INTEGER
                    }, {
                        name: 'sms_group_id',
                        value: group_id,
                        type : SQLBindType.INTEGER
                    }];

                    if(common.Util.isMultiRepository()){
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    self.SMSGroupInsert(dataSet,count,server_id,ix);
                }
            } else {
                dataSet.bind = [{
                    name: 'sms_user_id' ,
                    value: user_id,
                    type : SQLBindType.INTEGER
                }, {
                    name: 'server_id' ,
                    value: server_id,
                    type : SQLBindType.INTEGER
                }, {
                    name: 'server_type',
                    value: server_type,
                    type : SQLBindType.INTEGER
                }, {
                    name: 'sms_group_id',
                    value: group_id,
                    type : SQLBindType.INTEGER
                }];

                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                self.SMSInsert(dataSet,count);
            }
        } else{
            dataSet.bind = [{
                name: 'sms_user_id' ,
                value: user_id,
                type : SQLBindType.INTEGER
            }, {
                name: 'server_id' ,
                value: server_id,
                type : SQLBindType.INTEGER
            }, {
                name: 'server_type',
                value: server_type,
                type : SQLBindType.INTEGER
            }, {
                name: 'sms_group_id',
                value: group_id,
                type : SQLBindType.INTEGER
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            self.SMSInsert(dataSet,count);
        }
    },

    SMSInsert : function(dataSet,count){
        var self = this;

        WS.SQLExec(dataSet, function() {
            if(self.mappingList.getSelectedRow().length == count+1){
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                this.onRefresh();
            }
        }, this);
    },

    SMSGroupInsert : function(dataSet,count,server_id,serverCount){
        var self = this;

        WS.SQLExec(dataSet, function() {
            if(self.mappingList.getSelectedRow().length == count+1 && server_id.split(',').length == serverCount+1 ){
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                this.onRefresh();
            }
        }, this);
    },

    _createSMSGrid : function(grid_panel){
        this.mappingList = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: false,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 32,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            multiCheckable: true
        });
        grid_panel.add(this.mappingList);

        this.mappingList.beginAddColumns();
        this.mappingList.addColumn({text: common.Util.CTR('User ID / Group ID'), dataIndex: 'sms_user_id', width: 75, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.mappingList.addColumn({text: common.Util.CTR('User Name / Group Name'), dataIndex: 'user_name', width: 115, type: Grid.String, alowEdit: false, editMode: false});
        this.mappingList.addColumn({text: common.Util.CTR('Employee ID'), dataIndex: 'employee_id', width: 115, type: Grid.String, alowEdit: false, editMode: false});
        this.mappingList.addColumn({text: common.Util.CTR('Department'), dataIndex: 'business_name', width: 115, type: Grid.String, alowEdit: false, editMode: false});
        this.mappingList.addColumn({text: common.Util.CTR('Group Check'), dataIndex: 'group_check', width: 115, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.mappingList.endAddColumns();
    }

});