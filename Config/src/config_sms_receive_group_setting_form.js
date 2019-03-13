/**
 * Created by 신정훈 on 2016-11-01.
 */
Ext.define('config.config_sms_receive_group_setting_form', {

    smsList: [],
    sql: {
        smsList             :   'IMXConfig_SMS_Receive_Setting_Info.sql',
        smsGroupList        :   'IMXConfig_SMS_Receive_Group_Info.sql',
        smsGroupInsert      :   'IMXConfig_SMS_Receive_Group_Insert.sql',
        smsGroupCheck       :   'IMXConfig_SMS_Receive_Group_Check.sql',
        smsGroupUpdate      :   'IMXConfig_SMS_Receive_Group_Update.sql',
        smsGroupNameUpdate  :   'IMXConfig_SMS_Receive_Group_Name_Update.sql',
        mappingDelete       :   'IMXConfig_SMS_Receive_Group_Mapping_Delete.sql',
        mappingInfo         :   'IMXConfig_SMS_Receive_Group_Mapping_Info.sql',
        mappingInsert       :   'IMXConfig_SMS_Mapping_Insert.sql'
    },

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 400,
            height: 500,
            resizable: false,
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 70,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.groupIdEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10,
            width: 370,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Group ID')),
            allowBlank: true
        });

        this.groupNameEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 37,
            width: 370,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 20,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Group Name')),
            allowBlank: true
        });

        panelA1.add(this.groupIdEdit);
        panelA1.add(this.groupNameEdit);

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.sms_grid = Ext.create('Exem.adminGrid', {
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
            defaultPageSize: 300
        });
        panelA2.add(this.sms_grid);

        this.sms_grid.beginAddColumns();
        this.sms_grid.addColumn({text: common.Util.CTR('SMS User ID')   , dataIndex: 'sms_user_id',     width: 110,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.sms_grid.addColumn({text: common.Util.CTR('User Name')     , dataIndex: 'sms_user_name',   width: 150,  type: Grid.String, alowEdit: false, editMode: false});
        this.sms_grid.endAddColumns();

        panelA.add(panelA1);
        panelA.add(panelA2);

        var panelC = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 25,
            border: false,
            bodyStyle: { background: '#f5f5f5' }
        });

        self.OKButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Save'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.OKButton.setDisabled(true);
                    self.fieldCheck() ;
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Cancel'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        panelC.add(self.OKButton);
        panelC.add(this.CancelButton);

        form.add(panelA);
        form.add(panelC);

        if (this.mode == 'Add') {
            form.setTitle(common.Util.TR('Add SMS Group'));
            this.smsGroupSeq();
        } else {
            form.setTitle(common.Util.TR('Edit SMS Group'));
        }

        form.show();
        this.groupIdEdit.setDisabled(true);
        this.groupNameEdit.focus();

        this.smsLoad();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    smsGroupSeq : function(){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_SMS_Group_Id_Seq.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(header,data) {
            this.groupIdEdit.setValue(data.rows[0][0]);
        }, this);
    },


    editSMSLoad: function() {
        var ix,parentGrid
            ,parentGroupIdList,parentGroupIds;
        this.groupIdEdit.setValue(this.sms_group_id);
        this.groupNameEdit.setValue(this.sms_group_name);

        parentGrid = this.parent.smsListGrid;
        for (ix = 0; ix < parentGrid.getRowCount(); ix++) {
            parentGroupIdList = parentGrid.getRow(ix).data.sms_group_id_list;
            parentGroupIds = parentGroupIdList.split(',');
            if(parentGroupIds.indexOf(this.groupIdEdit.getValue()) != -1){
                this.sms_grid.selectByValue('sms_user_id', parentGrid.getRow(ix).data.sms_user_id, true);
            }
        }
        this.smsList.length = 0;

        this.smsList.push(this.sms_grid.getSelectedRow());
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    smsLoad: function() {
        var self = this;
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.sms_grid.clearRows();
            if (adata.rows != undefined) {
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    var dataRows = adata.rows[ix];
                    self.sms_grid.addRow([
                        +dataRows[0],    //sms_user_id
                        dataRows[2]    //sms_user_name
                    ]);
                }
                self.sms_grid.drawGrid();

                if (self.mode == 'Edit') {
                    self.editSMSLoad();
                }
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    fieldCheck: function() {

        var self = this ;
        var parentGroupName = this.sms_group_name;
        var groupName = this.groupNameEdit.getValue();
        var select_count = this.sms_grid.getSelectedRow().length;
        var dataSet = {};

        if (groupName == '') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter group name'));
            this.groupNameEdit.focus() ;
            self.OKButton.setDisabled(false);
            return ;
        }


        if (select_count == 0) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please select SMS User.'));
            self.OKButton.setDisabled(false);
            return ;
        }

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            var ix;
            for ( ix = 0; ix < adata.rows.length; ix++ ){
                //자기 자신은 제외.(edit 처리)
                if( adata.rows[ix][1] === parentGroupName ){
                    continue;
                }
                if ( adata.rows[ix][1] == groupName ) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Group name is already registered.'));
                    self.OKButton.setDisabled(false);
                    return;
                }
            }
            if (this.mode == 'Add') {
                this.save();
            } else {
                this.update();
            }

            groupName = null ;
            select_count = null ;

        }, this);
    },

    getTextLength : function(str){
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            if (encodeURI(str.charAt(i)).length == 9) {
                //DB가 UTF-8 일경우 한글 byte는 3byte 취급.
                len += 2;
            }
            len++;
        }
        return len;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        var ix, ixLen,
            dataSet     =   {},
            smsIdArr    =   [],
            groupID   =   this.groupIdEdit.getValue(),
            groupName   =   this.groupNameEdit.getValue();

        //byte check
        var groupNameByteLen = this.getTextLength(groupName);

        if(groupNameByteLen > 255){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.groupNameEdit.focus();
            this.OKButton.setDisabled(false);
            return;
        }

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Insert.sql';
        dataSet.bind = [{
            name    :   'sms_group_id',
            value   :   groupID,
            type    :   SQLBindType.INTEGER
        },{
            name    :   'sms_group_name',
            value   :   groupName,
            type    :   SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function() {
            dataSet     =   {};

            for (ix = 0, ixLen = this.sms_grid.getSelectedRow().length; ix < ixLen; ix++) {
                var d = this.sms_grid.getSelectedRow()[ix].data;
                smsIdArr.push(d['sms_user_id']);
            }

            dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Check.sql';
            dataSet.replace_string = [{
                name    :   'sms_user_id',
                value   :   smsIdArr.join(',')
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }
            WS.SQLExec(dataSet, function(aheder, adata) {
                var group_id = adata[1].rows[0][0];
                var userList = adata[0].rows,
                    userIds, userId, groupIdList;

                for (var ix = 0; ix < userList.length; ix++) {
                    userIds = [];
                    userId = userList[ix][0];
                    groupIdList = userList[ix][1];

                    if (!groupIdList) {
                        userIds.push(group_id);
                    } else {
                        userIds = groupIdList.split(',');
                        userIds.push(group_id);
                    }

                    this.smsGroupIdListUpdate(userIds, userId);
                }
            },this);
        },this);
    },

    smsGroupIdListUpdate : function(idList, smsId){
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Update.sql';

        dataSet.bind = [{
            name    :   'sms_group_id_list',
            value   :   idList.join(','),
            type : SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name    :   'sms_user_id',
            value   :   smsId
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            var self = this;
            setTimeout(function() {
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                self.parent.onButtonClick('Refresh');
                self.CancelButton.fireHandler('click');
            }, 100);
        }, this);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    update: function(){
        var dataSet     =   {};
        var groupName   =   this.groupNameEdit.getValue();
        var groupId = this.groupIdEdit.getValue();

        //byte check
        var groupNameByteLen = this.getTextLength(groupName);

        if(groupNameByteLen > 255){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.groupNameEdit.focus();
            this.OKButton.setDisabled(false);
            return;
        }

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Name_Update.sql';
        dataSet.bind = [{
            name    :   'sms_group_name',
            value   :   groupName,
            type    :   SQLBindType.STRING
        }, {
            name    :   'sms_group_id',
            value   :   groupId,
            type    :   SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            var ix, ixLen,
                userGrid, rowData,
                dataSet = {},
                smsIdArr = [];

            userGrid = this.parent.smsListGrid;
            for (ix = 0, ixLen = userGrid.getRowCount(); ix < ixLen; ix++) {
                rowData = userGrid.getRow(ix).data;
                smsIdArr.push(rowData['sms_user_id']);
            }

            dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Check.sql';
            dataSet.replace_string = [{
                name    :   'sms_user_id',
                value   :   smsIdArr.join(',')
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }
            WS.SQLExec(dataSet, function(aheder, adata) {
                var self = this,
                    orgList, changeList,
                    deleteList, insertList,
                    groupId = self.groupIdEdit.getValue(),
                    userList = adata[0].rows;

                orgList = this.smsList[0];
                changeList = this.sms_grid.getSelectedRow();

                deleteList = self.getChangeList(changeList, orgList);
                insertList = self.getChangeList(orgList, changeList);

                //Update 할 때 delete 데이터가 있으면 Mapping 데이터 삭제
                if(deleteList.length){
                    var ix,ixLen,userIdList,
                        userId = [];

                    for(ix = 0, ixLen = deleteList.length; ix < ixLen; ix++){
                        userId.push(deleteList[ix]);
                        userIdList = deleteList.join();
                    }

                    dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Mapping_Delete.sql';
                    dataSet.replace_string = [{
                        name: 'sms_user_id' ,
                        value: userIdList
                    }];
                    dataSet.bind = [{
                        name: 'sms_group_id' ,
                        value: groupId,
                        type: SQLBindType.INTEGER
                    }];

                    if(common.Util.isMultiRepository()){
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    WS.SQLExec(dataSet, function() {},this);
                }

                //Update 할 때 Insert 데이터가 있으면 Mapping 데이터 추가.
                if(insertList.length){
                    dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Mapping_Info.sql';
                    dataSet.bind = [{
                        name: 'sms_group_id' ,
                        value: groupId,
                        type: SQLBindType.INTEGER
                    }];

                    if(common.Util.isMultiRepository()){
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    //mapping 에 Group Data 가 있을 경우만 Update 시 data 추가.
                    WS.SQLExec(dataSet, function(header,data) {
                        var self = this,
                            ix,ixLen,jx,jxLen,
                            rowData,serverId,serverType,
                            groupId = self.groupIdEdit.getValue();

                        for(ix = 0, ixLen = data.rows.length; ix < ixLen; ix++){
                            rowData = data.rows[ix];
                            serverId = rowData[0];
                            serverType = rowData[1];

                            for(jx = 0, jxLen = insertList.length; jx < jxLen; jx++){

                                dataSet.sql_file = 'IMXConfig_SMS_Mapping_Insert.sql';
                                dataSet.bind = [{
                                    name: 'sms_user_id',
                                    value: insertList[jx],
                                    type : SQLBindType.INTEGER
                                }, {
                                    name: 'server_type',
                                    value: serverType,
                                    type : SQLBindType.INTEGER
                                }, {
                                    name: 'server_id',
                                    value: serverId,
                                    type : SQLBindType.INTEGER
                                }, {
                                    name: 'sms_group_id',
                                    value: groupId,
                                    type : SQLBindType.INTEGER
                                }];

                                if(common.Util.isMultiRepository()){
                                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                                }

                                self.SMSInsert(dataSet);
                            }
                        }
                    },this);
                }

                if(!deleteList.length && !insertList.length){
                    setTimeout(function() {
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                        self.parent.onButtonClick('Refresh');
                        self.CancelButton.fireHandler('click');
                    }, 100);
                } else{
                    self.setDataUpdate(userList, deleteList, groupId, false);
                    self.setDataUpdate(userList, insertList, groupId, true);
                }
            },this);
        },this);
    },

    setDataUpdate: function(orgList, changeList, groupId, isInsert){
        var ix, ixLen, jx, jxLen,
            index, groupIds, userId, groupIdList;

        for(ix = 0, ixLen = changeList.length; ix < ixLen; ix++){
            for(jx = 0, jxLen = orgList.length; jx < jxLen; jx++){
                groupIds = [];
                userId = orgList[jx][0];
                groupIdList = orgList[jx][1];
                if(changeList[ix] != userId){
                    continue;
                }

                if(isInsert){
                    if (!groupIdList) {
                        groupIds.push(groupId);
                    } else {
                        groupIds = groupIdList.split(',');
                        if(groupIds.indexOf(groupId) == -1){
                            groupIds.push(groupId);
                        }
                    }
                    this.smsGroupIdListUpdate(groupIds, userId);
                }
                else{
                    if (groupIdList) {
                        groupIds = groupIdList.split(',');
                        index = groupIds.indexOf(groupId);
                        if(index != -1){
                            groupIds.splice(index, 1);
                            this.smsGroupIdListUpdate(groupIds, userId);
                        }
                    }
                }
            }
        }
    },

    getChangeList: function(firstList, secondList){
        var ix, ixLen, jx, jxLen,
            changeUserId, isChange,
            changeList = [];

        for(ix = 0, ixLen = secondList.length; ix < ixLen; ix++){
            isChange = true;
            changeUserId = secondList[ix].data['sms_user_id'];
            for(jx = 0, jxLen = firstList.length; jx < jxLen; jx++){
                if(changeUserId == firstList[jx].data['sms_user_id']){
                    isChange = false;
                    break;
                }
            }

            if(isChange){
                changeList.push(changeUserId);
            }
        }

        return changeList;
    },

    SMSInsert : function(dataSet){
        WS.SQLExec(dataSet, function() {},this);
    }
});
