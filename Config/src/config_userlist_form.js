Ext.define('config.config_userlist_form', {
    extend: 'Exem.Form',
    mode: '',
    parent: null,
    userid: 0,
    loginid: '',
    username: '',
    userpw: '',
    admin: -1,
    department: '',
    mobile: '',
    email: '',

    init: function(state) {
        var self = this;
        this.mode = state;

        var title = common.Util.TR('Add User');
        if (state == 'Edit')
            title = common.Util.TR('Edit User');

        var usefont = function(size, text) {
            return '<span style="padding-left: 0px; padding-top: 0px; font-family: Roboto Condensed; font-size: ' + size + 'px">' + text + '</span>';
        };

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 500,
            height: 297,
            resizable: false,
            title: usefont(12, common.Util.TR(title)),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        //

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.userIdEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 10,
            width: 440,
            labelWidth: 105,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('ID')),
            allowBlank: false
        });

        this.userNameEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 37,
            width: 440,
            labelWidth: 105,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('User Name')),
            allowBlank: false
        });

        this.userPasswordEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 64,
            width: 440,
            labelWidth: 105,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('User Password')),
            inputType: 'password',
            allowBlank: false
        });

        this.userPasswordConfirmEdit = Ext.create('Ext.form.field.Text', {
            x: 10,
            y: 90,
            width: 450,
            labelWidth: 115,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Confirm Password')),
            inputType: 'password',
            allowBlank: false
        });

        this.adminCheckCheckBox = Ext.create('Ext.form.field.Checkbox', {
            x: 130,
            y: 118,
            boxLabelAlign: 'after',
            boxLabel: Comm.RTComm.setFont(9, common.Util.CTR('Admin Check')),
            name: 'admincheck',
            inputValue: '1'
        });

        this.departmentEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 145,
            width: 440,
            labelWidth: 105,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Department'))
        });

        this.mobileEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 172,
            width: 440,
            labelWidth: 105,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Mobile'))
        });

        this.emailEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 199,
            width: 440,
            labelWidth: 105,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('EMail'))
        });

        panelA.add(this.userIdEdit);
        panelA.add(this.userNameEdit);
        panelA.add(this.userPasswordEdit);
        panelA.add(this.userPasswordConfirmEdit);
        panelA.add(this.adminCheckCheckBox);
        panelA.add(this.departmentEdit);
        panelA.add(this.mobileEdit);
        panelA.add(this.emailEdit);

        //

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

        var OKButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Save'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function(_this) {
                    self.okButtonId = _this.id;
                    self.closed = this.up('.window');
                    self.save();
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

        form.add(panelA);
        form.add(panelC);

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.show();

        if (state == 'Edit') {
            var admin = this.admin == 1;
            this.userIdEdit.setValue(this.loginid);
            this.userNameEdit.setValue(this.username);
            this.adminCheckCheckBox.setValue(admin);
            this.departmentEdit.setValue(this.department);
            this.mobileEdit.setValue(this.mobile);
            this.emailEdit.setValue(this.email);

            this.userIdEdit.setDisabled(true);
            this.userNameEdit.focus();
        } else {
            this.userIdEdit.focus();
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        var self = this;

        var userIdEdit = self.userIdEdit;
        var userNameEdit = self.userNameEdit;
        var userPasswordEdit = self.userPasswordEdit;
        var userPasswordConfirmEdit = self.userPasswordConfirmEdit;
        var adminCheckCheckBox = self.adminCheckCheckBox;
        var adminCheckCheckBoxValue = self.adminCheckCheckBox.getValue() ? 1 : 0;
        var departmentEdit = self.departmentEdit;
        var mobileEdit     = self.mobileEdit;
        var emailEdit      = self.emailEdit;

        if (self.mode == 'Add') {
            if (!self.checkUserId()) {
                Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('User ID is already registered.'));
                return;
            }
        }

        if (userIdEdit.getValue() == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Invalid input'));
            return userIdEdit.focus();
        }

        if ( userIdEdit.getValue().indexOf(' ') > -1 ){
            Ext.Msg.alert('ERROR', common.Util.TR('Blank Character is not allowed'));
            return userIdEdit.focus();
        }

        if (userNameEdit.getValue().trim() == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter User name.'));
            return userNameEdit.focus();
        }

        if (userPasswordEdit.getValue() == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter password.'));
            return userPasswordEdit.focus();
        }

        if ( userPasswordEdit.getValue().indexOf(' ') > -1 ){
            Ext.Msg.alert('ERROR', common.Util.TR('Blank Character is not allowed'));
            return userPasswordEdit.focus();
        }

        if (userPasswordConfirmEdit.getValue() == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter password.'));
            return userPasswordConfirmEdit.focus();
        }

        if ( userPasswordConfirmEdit.getValue().indexOf(' ') > -1 ){
            Ext.Msg.alert('ERROR', common.Util.TR('Blank Character is not allowed'));
            return userPasswordConfirmEdit.focus();
        }

        if (userPasswordEdit.getValue().trim() != userPasswordConfirmEdit.getValue().trim()) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Sorry, your password is incorrect. Please try again.'));
            return userPasswordConfirmEdit.focus();
        }

        Ext.getCmp(self.okButtonId).setDisabled(true);

        if (self.mode == 'Add') {
            self.saveApply(userIdEdit.getValue(), userPasswordEdit.getValue(), userNameEdit.getValue(), departmentEdit.getValue(), mobileEdit.getValue(), emailEdit.getValue(), adminCheckCheckBoxValue);
        } else {

            var dataSet = {},
                bindList;

            bindList = [{
                name: 'id',
                value: this.userid,
                type : SQLBindType.INTEGER
            }, {
                name: 'username',
                value: userNameEdit.getValue(),
                type : SQLBindType.STRING
            }, {
                name: 'dept',
                value: departmentEdit.getValue(),
                type : SQLBindType.STRING
            }, {
                name: 'hp',
                value: mobileEdit.getValue(),
                type : SQLBindType.STRING
            }, {
                name: 'email',
                value: emailEdit.getValue(),
                type : SQLBindType.STRING
            }, {
                name: 'admin',
                value: adminCheckCheckBoxValue,
                type : SQLBindType.INTEGER
            }];

            dataSet.sql_file = 'IMXCFG_updateUser.sql';
            dataSet.bind = bindList;

            if(common.Util.isMultiRepository()){
                cfg.setConfigToRepo(dataSet, function(){}, this);
                dataSet.database = cfg.repositoryInfo.master.database_name;
            }
            WS.SQLExec(dataSet, function() {
                var dataSet = {};

                if ( adminCheckCheckBox.getValue() ){
                    dataSet.replace_string = [
                        {   name    :   'kill_thread',      value   :   1   },
                        {   name    :   'system_dump',      value   :   1   },
                        {   name    :   'property_load',    value   :   1   },
                        {   name    :   'bind',             value   :   1   },
                        {   name    :   'user_id',          value   :   this.userid }
                    ];
                }else{
                    dataSet.replace_string = [
                        {   name    :   'kill_thread',      value   :   0   },
                        {   name    :   'system_dump',      value   :   0   },
                        {   name    :   'property_load',    value   :   0   },
                        {   name    :   'bind',             value   :   0   },
                        {   name    :   'user_id',          value   :   this.userid }
                    ];
                }

                dataSet.sql_file = 'IMXConfig_Update_User_Permission.sql';
                if(common.Util.isMultiRepository()){
                    cfg.setConfigToRepo(dataSet, function(){}, this);

                    dataSet.database = cfg.repositoryInfo.master.database_name;
                }

                WS.SQLExec(dataSet, function() {
                    var optionList;

                    optionList = {
                        type        : 'update',
                        login_id    : self.loginid,
                        user_id     : self.userId,
                        password    : self.userPasswordEdit.getValue()
                    };

                    dataSet = {};

                    dataSet.dll_name = 'IntermaxPlugin.dll';
                    dataSet.options  = optionList;
                    dataSet['function'] = 'checkLogin';

                    if(common.Util.isMultiRepository()){
                        cfg.setConfigToRepo(dataSet, null, null, 'function');
                        dataSet.options.dbname = cfg.repositoryInfo.master.database_name;
                    } else {
                        dataSet.options.dbname = cfg.repositoryInfo.currentRepoName;
                    }
                    WS.PluginFunction(dataSet, function() {
                        self.parent.onButtonClick('Refresh');

                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                        self.closed.close();
                    }, this);
                }, this);
            }, this);

        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    addUser: function(userInfo){
        var self = this,
            dataSet = {},
            optionList, loginId = userInfo.userLoginId;

        optionList = {
            type        : 'insert',
            login_id    : loginId,
            user_id     : userInfo.userId,
            password    : userInfo.userPassword,
            user_name   : userInfo.userName,
            user_desc   : '',
            user_dept   : userInfo.userDept,
            user_hp     : userInfo.userMobile,
            user_email  : userInfo.userEmail,
            admin_check : userInfo.isAdmin
        };

        dataSet.dll_name = 'IntermaxPlugin.dll';
        dataSet.options  = optionList;
        dataSet['function'] = 'checkLogin';

        if(common.Util.isMultiRepository()){
            cfg.setConfigToRepo(dataSet, null, null, 'function');
            dataSet.options.dbname = cfg.repositoryInfo.master.database_name;
        } else {
            //Comm.currentRepositoryInfo.database_name (이전 코드상의 dbname 값)
            dataSet.options.dbname = cfg.repositoryInfo.currentRepoName;
        }

        WS.PluginFunction(dataSet, function(aheader, adata) {
            // Repository에 데이터는 저장했지만 결과값으로 null이 넘어오는 경우
            // 입력한 사용자가 테이블에 정상적으로 들어갔는지 확인하고, Insert가 되어 있으면
            // xapm_user_permission 테이블에도 사용자 권한을 위해 Insert 해준다.
            // 간혹 이런 현상이 발생한다.
            var dataSet = {};

            dataSet.sql_file = 'IMXConfig_User_Auth_Check.sql';
            dataSet.bind = [{
                name    :   'login_id',
                value   :   loginId,
                type : SQLBindType.STRING
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.master.database_name;
            }
            if (!adata) {
                WS.SQLExec(dataSet, function(aheader, adata) {
                    if (adata && adata.rows.length > 0) {
                        var dataSet = {};
                        dataSet.sql_file = 'IMXCFG_GetUserID.sql';
                        dataSet.bind = [{
                            name: 'id',
                            value: loginId,
                            type : SQLBindType.STRING
                        }];
                        if(common.Util.isMultiRepository()){
                            dataSet.database = cfg.repositoryInfo.master.database_name;
                        }
                        WS.SQLExec(dataSet, function(aheader, adata) {
                            var dataSet = {};

                            self.userid = adata.rows[0][0];

                            if ( self.adminCheckCheckBox.getValue() ){
                                dataSet.replace_string = [
                                    {   name    :   'kill_thread',      value   :   1   },
                                    {   name    :   'system_dump',      value   :   1   },
                                    {   name    :   'memory_leak',      value   :   1   },
                                    {   name    :   'property_load',    value   :   1   },
                                    {   name    :   'bind',             value   :   1   },
                                    {   name    :   'user_id',          value   :   self.userid }
                                ];
                            }else{
                                dataSet.replace_string = [
                                    {   name    :   'kill_thread',      value   :   0   },
                                    {   name    :   'system_dump',      value   :   0   },
                                    {   name    :   'memory_leak',      value   :   0   },
                                    {   name    :   'property_load',    value   :   0   },
                                    {   name    :   'bind',             value   :   0   },
                                    {   name    :   'user_id',          value   :   self.userid }
                                ];
                            }
                            dataSet.sql_file = 'IMXConfig_Insert_User_Permission.sql';
                            if(common.Util.isMultiRepository()){
                                cfg.setConfigToRepo(dataSet, function(){}, this);
                                dataSet.database = cfg.repositoryInfo.master.database_name;
                            }
                            WS.SQLExec(dataSet, function() {}, this);

                            //USER IP LIST 추가
                            dataSet = {};

                            dataSet.sql_file = 'IMXConfig_Insert_User_IP.sql';

                            dataSet.bind = [{
                                name: 'user_id',
                                value: self.userid,
                                type : SQLBindType.INTEGER
                            }];

                            if(common.Util.isMultiRepository()){
                                cfg.setConfigToRepo(dataSet, function(){}, this);
                                dataSet.database = cfg.repositoryInfo.master.database_name;
                            }

                            WS.SQLExec(dataSet, function() {
                                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                                self.parent.onButtonClick('Refresh');
                                self.closed.close();
                            }, this);
                        }, this);
                    }
                }, this);
            } else if (adata.result == 'true') {
                dataSet = {};
                dataSet.sql_file = 'IMXCFG_GetUserID.sql';
                dataSet.bind = [{
                    name: 'id',
                    value: loginId,
                    type : SQLBindType.STRING
                }];
                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.master.database_name;
                }
                WS.SQLExec(dataSet, function(aheader, adata) {
                    var dataSet = {};

                    self.userid = adata.rows[0][0];
                    if ( self.adminCheckCheckBox.getValue() ){
                        dataSet.replace_string = [
                            {   name    :   'kill_thread',      value   :   1   },
                            {   name    :   'system_dump',      value   :   1   },
                            {   name    :   'memory_leak',      value   :   1   },
                            {   name    :   'property_load',    value   :   1   },
                            {   name    :   'bind',             value   :   1   },
                            {   name    :   'user_id',          value   :   self.userid }
                        ];
                    }else{
                        dataSet.replace_string = [
                            {   name    :   'kill_thread',      value   :   0   },
                            {   name    :   'system_dump',      value   :   0   },
                            {   name    :   'memory_leak',      value   :   0   },
                            {   name    :   'property_load',    value   :   0   },
                            {   name    :   'bind',             value   :   0   },
                            {   name    :   'user_id',          value   :   self.userid }
                        ];
                    }

                    dataSet.sql_file = 'IMXConfig_Insert_User_Permission.sql';
                    if(common.Util.isMultiRepository()){
                        cfg.setConfigToRepo(dataSet, function(){}, this);
                        dataSet.database = cfg.repositoryInfo.master.database_name;
                    }

                    WS.SQLExec(dataSet, function() {}, this);

                    //USER IP LIST 추가
                    dataSet = {};

                    dataSet.sql_file = 'IMXConfig_Insert_User_IP.sql';

                    dataSet.bind = [{
                        name: 'user_id',
                        value: self.userid,
                        type : SQLBindType.INTEGER
                    }];

                    if(common.Util.isMultiRepository()){
                        cfg.setConfigToRepo(dataSet, function(){}, this);
                        dataSet.database = cfg.repositoryInfo.master.database_name;
                    }

                    WS.SQLExec(dataSet, function() {
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                        self.parent.onButtonClick('Refresh');
                        self.closed.close();
                    }, this);
                }, this);
            } else {
                Ext.getCmp(self.okButtonId).setDisabled(false);
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('User information is not valid.'));
            }
        }, this);
    },

    saveApply: function(userLoginId, userPassword, userName, userDept, userMobile, userEmail, isAdmin) {
        var dataSet = {},
            userInfo = {
                userLoginId : userLoginId,
                userPassword : userPassword,
                userName : userName,
                userDept : userDept,
                userMobile : userMobile,
                userEmail : userEmail,
                isAdmin : isAdmin
            };

        dataSet.sql_file = 'IMXConfig_GetSeq.sql';
        WS.SQLExec(dataSet, function(header, data){
            if(!common.Util.checkSQLExecValid(header, data)){
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('sequence data does not exist.'));
                console.error(header);
                console.error(data);
                return;
            }

            userInfo.userId = data.rows[0][0];
            this.addUser(userInfo);
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    checkUserId: function() {
        // 사용자를 등록할 때, 기존 사용자 아이디와 중복되는지 체크한다.
        var result = true,
            loginId = this.userIdEdit.getValue(),
            row;

        for (var ix = 0; ix < this.parent.gridUserList.getRowCount(); ix++) {
            row = this.parent.gridUserList.getRow(ix);
            if (row.data.login_id == loginId) {
                result = false;
            }
        }
    /**기존 사용자 중복 체크 코드
     * 멀티 repo에 의해서 check방식이 달라짐.
        //var userList, ix, ixLen;
        //userList = this.parent.userlist;
        //for(ix = 0, ixLen = userList.length; ix < ixLen; ix++){
        //    if(userList[ix] == loginId){
        //        result = false;
        //    }
        //}
    **/
        return result;
    }
    /**사용하지않는 코드 주석처리
    checkOtherTab: function() {
        // 사용자별 권한 설정 및 서비스별 사용자 설정 탭이 열려 있으면 강제로 Refresh 처리한다.
        // 새로운 사용자 등록 및 수정된 내용을 반영하기 위해(수정은 이름이 변경되지 않는한 필요치 않지만..)
        var tab = cfg.tabpanel.items.items;
        for (var ix = 0; ix < tab.length; ix++) {
            if (tab[ix].id == 'config_userservice_panel') {
                cfg.user_service_view.refresh_userService();
            } else if (tab[ix].id == 'config_userpermission_panel') {
                cfg.user_permission_view.refresh_userlist();
            }
        }
    }
    **/
});
