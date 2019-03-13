Ext.define('config.config_report_group_setting_form', {
    extend  : 'Exem.Form',

    init : function(state) {
        var title,
            dataSet = {};

        this.mode = state;

        if(state == 'Add'){
            this.reportGroupSeq();
            dataSet = {};

            dataSet.sql_file = 'IMXConfig_Report_User_Info.sql';

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, function(header, data) {
                if (!common.Util.checkSQLExecValid(header, data)) {
                    console.info(header);
                    console.info(data);
                    return;
                }
                var ix,ixLen,
                    unassignedUser = [],
                    userData = data.rows;
                for(ix = 0, ixLen = userData.length; ix < ixLen; ix++){
                    unassignedUser.push({id : userData[ix][0], name : userData[ix][1], title : userData[ix][1]});
                }
                title = common.Util.TR('Add Group');
                this.groupUserWindow(title, null, unassignedUser);
            },this);
        } else if (state == 'Edit') {
            dataSet = {};

            dataSet.sql_file = 'IMXConfig_Report_Group_User_Info.sql';

            dataSet.bind = [{
                name    : 'group_id',
                value   : this.group_id,
                type    : SQLBindType.INTEGER
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }
            WS.SQLExec(dataSet, function(header, data) {
                if (!common.Util.checkSQLExecValid(header, data)) {
                    console.info(header);
                    console.info(data);
                    return;
                }
                var ix, ixLen,
                    groupedUserData    = data[0].rows,
                    unassignedUserData = data[1].rows,
                    groupedUser        = [],
                    unassignedUser     = [];

                for(ix = 0, ixLen = groupedUserData.length; ix < ixLen; ix++){
                    groupedUser.push({id : groupedUserData[ix][0], name : groupedUserData[ix][1], title : groupedUserData[ix][1]});
                }

                for( ix = 0, ixLen = unassignedUserData.length; ix < ixLen; ix++){
                    unassignedUser.push({id : unassignedUserData[ix][0], name : unassignedUserData[ix][1], title : unassignedUserData[ix][1]});
                }

                title = common.Util.TR('Edit Group') + ' ( ' + common.Util.TR('Selected Group Name') + ' : '  + this.group_name + ' )';


                this.groupUserWindow(title, this.group_name, unassignedUser, groupedUser);
            },this);
        }
    },

    groupUserWindow : function(title, groupName, unassignedUser, groupedUser){
        var topTextArea = Ext.create('Exem.Container', {
            width   : '100%',
            height  : 40,
            layout  : 'vbox'
        });

        this.topTextField = Ext.create('Ext.form.field.Text', {
            width            : '95%',
            labelWidth       : ((window.nation === 'ko') ? 60:100),
            labelAlign       : 'right',
            maxLength        : 64,
            margin           : '10 0 0 0',
            enforceMaxLength : true,
            fieldLabel       : Comm.RTComm.setFont(9, common.Util.CTR('Group Name')),
            allowBlank       : false
        });
        topTextArea.add(this.topTextField);


        this.groupWindow = Ext.create('Exem.MoveColumnWindow', {
            width            : 800,
            height           : 500,
            parent           : this,
            title            : title,
            columnInfo       : unassignedUser,
            useColumnInfo    : groupedUser,
            orderMode        : true,
            useDefaultBtn    : false,
            leftGridTitle    : common.Util.TR('Unassigned User List'),
            rightGridTitle   : common.Util.TR('Grouped User List'),
            okFn             : this.apply
        });

        this.groupWindow.topArea = topTextArea;
        this.groupWindow.initBase();

        this.topTextField.setValue(groupName);
    },

    reportGroupSeq : function(){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Report_Group_Seq.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(header,data) {
            this.group_id = data.rows[0][0];
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

    apply: function(storeData) {
        var self = this.parent,
            dataSet = {};

        if(!self.fieldCheck(storeData)){
            return;
        }

        if(self.mode === 'Add'){
            self.save(storeData);
        } else if(self.mode === 'Edit'){
            dataSet.sql_file = 'IMXConfig_Report_Group_Delete.sql';
            dataSet.bind = [{
                name    : 'group_id',
                value   : self.group_id,
                type    : SQLBindType.INTEGER
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, function() {
                self.save(storeData);
            }, this);
        }
    },

    fieldCheck : function(storeData){
        var groupName = this.topTextField.getValue();

        // 사용자명이 입력안되었을 때 예외처리
        if (groupName == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter User name.'));
            this.topTextField.focus();
            return false;
        }

        // byte check
        var groupNameByteLen = this.getTextLength(groupName);

        if(groupNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.topTextField.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( groupName.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.topTextField.focus();
            return false;
        }

        //그룹 리스트 check
        if (!storeData.count()) {
            common.Util.showMessage(common.Util.TR('Warning'),  common.Util.TR('Please move to more than one grouped user list.') , Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        //중복체크
        if ( this.group_name != groupName && this.parent.groupUserTree.pnlExTree.getStore().findRecord('group_name',groupName) !== null) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Group name is duplicated.'));
            this.topTextField.focus();
            return false;
        }

        return true;
    },

    save: function(storeData){
        var self = this,
            dataSet = {},
            ix, ixLen, userData;

        dataSet.sql_file = 'IMXConfig_Report_Group_Add.sql';
        dataSet.bind = [{
            name    : 'group_id',
            value   : self.group_id,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'group_name',
            value   : self.topTextField.getValue(),
            type    : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {}, this);

        this.count = 0;
        for( ix = 0, ixLen = storeData.getCount(); ix < ixLen; ix++){
            userData = storeData.getAt(ix).data;
            dataSet.sql_file = 'IMXConfig_Report_Group_User_Add.sql';
            dataSet.bind = [{
                name    : 'group_id',
                value   : self.group_id,
                type    : SQLBindType.INTEGER
            }, {
                name    : 'user_id',
                value   : userData.dataIdx,
                type    : SQLBindType.INTEGER
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, function() {
                this.count++;
                if(this.count == storeData.getCount()){
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    self.parent.onButtonClick('Refresh');
                    self.groupWindow.close();
                }
            }, this);
        }
    }
});
