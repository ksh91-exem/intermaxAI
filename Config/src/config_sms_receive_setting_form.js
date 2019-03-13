Ext.define('config.config_sms_receive_setting_form', {
    extend: 'Exem.Form',

    init: function(state) {
        var self = this;
        this.mode = state;

        var title = common.Util.TR('SMS Receive Add');
        if (state == 'Edit')
            title = common.Util.TR('SMS Receive Edit');

        var usefont = function(size, text) {
            return '<span style="padding-left: 0px; padding-top: 0px; font-family: Roboto Condensed; font-size: ' + size + 'px">' + text + '</span>';
        };

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 400,
            height: 300,
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
            width: 300,
            labelWidth: 80,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('SMS User ID')),
            allowBlank: false,
            disabled:true
        });

        this.employeeIdEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 37,
            width: 300,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 256,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Employee ID')),
            allowBlank: false
        });

        this.userNameEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 37+27,
            width: 300,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 20,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('User Name')),
            allowBlank: false
        });

        this.businessNameEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 37+27+27,
            width: 300,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 256,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Department')),
            allowBlank: false
        });

        this.mobileEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 64+27+27,
            width: 300,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 20,
            allowBlank: false,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Mobile')),
            maskRe: /^[0-9]*$/,
            listeners: {
                change: function(me, nval, oval) {
                    var check = /^[0-9]*$/;
                    if (!check.test(nval)) {
                        me.setValue(oval);
                    }
                }
            }
        });

        var tipLabel = Ext.create('Ext.form.Label', {
            x: 100,
            y: 90+27+27,
            html: Comm.RTComm.setFont(8, common.Util.CTR('(numbers only without input)'))
        });

        this.emailEdit = Ext.create('Ext.form.field.Text', {
            x: 20,
            y: 90+27+27+25,
            width: 300,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 256,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Email')),
            vtype: 'email', // applies email validation rules to this field
            listeners: {
                blur: function() {
                     var check = /^((([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z\s?]{2,5}){1,25})*(\s*?;\s*?)*)*$/;
                    if (!Ext.isEmpty(this.getValue()) && !check.test(this.getValue())) {
                        Ext.Msg.alert(common.Util.TR('Message'), Ext.form.field.VTypes.emailText);
                        return false;
                    }
                }
            }
        });

        this.smsCheckBox = Ext.create('Ext.form.field.Checkbox', {
            x: 20,
            y: 105+27+27+27+10,
            labelWidth: 80,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('SMS Enable'))
        });

        this.mailCheckBox = Ext.create('Ext.form.field.Checkbox', {
            x: 220,
            y: 105+27+27+27+10,
            labelWidth: 80,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Mail Enable'))
        });

        panelA.add(this.userIdEdit);
        panelA.add(this.employeeIdEdit);
        panelA.add(this.userNameEdit);
        panelA.add(this.businessNameEdit);
        panelA.add(this.mobileEdit);
        panelA.add(tipLabel);
        panelA.add(this.emailEdit);
        panelA.add(this.smsCheckBox);
        panelA.add(this.mailCheckBox);


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
                click: function() {
                    if(self.mode == 'Add'){
                        self.save();
                    } else {
                        self.update();
                    }
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
                    self.parent.onButtonClick('Refresh');
                }
            }
        });

        form.add(panelA);
        form.add(panelC);

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.show();

        if(state == 'Add'){
            this.smsUserSeq();
        }

        if (state == 'Edit') {
            this.userIdEdit.setValue(this.sms_user_id);
            this.employeeIdEdit.setValue(this.employee_id);
            this.userNameEdit.setValue(this.sms_user_name);
            this.businessNameEdit.setValue(this.sms_business_name);
            this.mobileEdit.setValue(this.phone_number);
            this.emailEdit.setValue(this.sms_user_email);
            this.smsCheckBox.setValue(this.sms_enable);
            this.mailCheckBox.setValue(this.mail_enable);

            this.userIdEdit.setDisabled(true);
            this.userNameEdit.focus();
        }
    },

    smsUserSeq : function(){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_SMS_User_Id_Seq.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(header,data) {
            this.userIdEdit.setValue(data.rows[0][0]);
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
        if(!this.fieldCheck()){
            return;
        }

        var self = this,
            dataSet = {}, insertDataSet = {},
            userIdEdit          = this.userIdEdit.getValue(),
            userNameEdit        = this.userNameEdit.getValue(),
            mobileEdit          = this.mobileEdit.getValue(),
            employeeIdEdit      = this.employeeIdEdit.getValue(),
            businessNameEdit    = this.businessNameEdit.getValue(),
            emailEdit           = this.emailEdit.getValue(),
            smsCheckBoxValue    = this.smsCheckBox.getValue(),
            mailCheckBoxValue   = this.mailCheckBox.getValue(),
            smsBusinessId;

        if(smsCheckBoxValue){
            smsCheckBoxValue = 1;
        } else{
            smsCheckBoxValue = 0;
        }

        if(mailCheckBoxValue){
            mailCheckBoxValue = 1;
        } else{
            mailCheckBoxValue = 0;
        }

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Business_Name_Check.sql';
        dataSet.bind = [{
            name: 'sms_business_name',
            value: businessNameEdit,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header,data) {
            dataSet = {};

            insertDataSet.bind = [{
                name: 'sms_user_id',
                value: userIdEdit,
                type : SQLBindType.INTEGER
            }, {
                name: 'sms_user_name',
                value: userNameEdit,
                type : SQLBindType.STRING
            }, {
                name: 'phone_number',
                value: mobileEdit,
                type : SQLBindType.STRING
            }, {
                name: 'employee_id',
                value: employeeIdEdit,
                type : SQLBindType.STRING
            }, {
                name: 'sms_user_email',
                value: emailEdit,
                type : SQLBindType.STRING
            }, {
                name: 'sms_enable',
                value: smsCheckBoxValue,
                type : SQLBindType.INTEGER
            }, {
                name: 'mail_enable',
                value: mailCheckBoxValue,
                type : SQLBindType.INTEGER
            }];

            if(data.rows.length){
                smsBusinessId = data.rows[0][0];
                insertDataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Insert_no_Business_Insert.sql';

                insertDataSet.bind.push({
                    name: 'sms_business_id',
                    value: smsBusinessId,
                    type : SQLBindType.INTEGER
                });

                if(common.Util.isMultiRepository()){
                    insertDataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                WS.SQLExec(insertDataSet, function() {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    self.CancelButton.fireEvent('click');
                }, this);

            } else {
                dataSet.sql_file = 'IMXConfig_SMS_Business_Id_Seq.sql';

                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                WS.SQLExec(dataSet, function(aheader, adata) {
                    smsBusinessId = adata.rows[0][0];
                    insertDataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Insert.sql';

                    insertDataSet.bind.push({
                        name: 'sms_business_id',
                        value: smsBusinessId,
                        type : SQLBindType.INTEGER
                    });

                    insertDataSet.bind.push({
                        name: 'sms_business_name',
                        value: businessNameEdit,
                        type : SQLBindType.STRING
                    });

                    if(common.Util.isMultiRepository()){
                        insertDataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    WS.SQLExec(insertDataSet, function() {
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                        self.CancelButton.fireEvent('click');
                    }, this);
                });
            }
        }, this);
    },

    update : function(){
        if(!this.fieldCheck()){
            return;
        }

        var self = this,
            dataSet = {}, updateDataSet = {},
            userIdEdit          = this.userIdEdit.getValue(),
            userNameEdit        = this.userNameEdit.getValue(),
            mobileEdit          = this.mobileEdit.getValue(),
            employeeIdEdit      = this.employeeIdEdit.getValue(),
            businessNameEdit    = this.businessNameEdit.getValue(),
            emailEdit           = this.emailEdit.getValue(),
            smsCheckBoxValue    = this.smsCheckBox.getValue(),
            mailCheckBoxValue   = this.mailCheckBox.getValue(),
            smsBusinessId;

        if(smsCheckBoxValue){
            smsCheckBoxValue = 1;
        } else{
            smsCheckBoxValue = 0;
        }

        if(mailCheckBoxValue){
            mailCheckBoxValue = 1;
        } else{
            mailCheckBoxValue = 0;
        }

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Business_Name_Check.sql';
        dataSet.bind = [{
            name: 'sms_business_name',
            value: businessNameEdit,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header,data) {
            dataSet = {};

            updateDataSet.bind = [{
                name: 'sms_user_name',
                value: userNameEdit,
                type : SQLBindType.STRING
            }, {
                name: 'phone_number',
                value: mobileEdit,
                type : SQLBindType.STRING
            }, {
                name: 'employee_id',
                value: employeeIdEdit,
                type : SQLBindType.STRING
            }, {
                name: 'sms_user_email',
                value: emailEdit,
                type : SQLBindType.STRING
            }, {
                name: 'sms_enable',
                value: smsCheckBoxValue,
                type : SQLBindType.INTEGER
            }, {
                name: 'sms_user_id',
                value: userIdEdit,
                type : SQLBindType.INTEGER
            }, {
                name: 'mail_enable',
                value: mailCheckBoxValue,
                type : SQLBindType.INTEGER
            }];

            if(data.rows.length){
                //수정시 이미 존재하는 부서일 경우.
                smsBusinessId = data.rows[0][0];
                updateDataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Update.sql';

                updateDataSet.bind.push({
                    name: 'sms_business_id',
                    value: smsBusinessId,
                    type : SQLBindType.INTEGER
                });

                if(common.Util.isMultiRepository()){
                    updateDataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                WS.SQLExec(updateDataSet, function(){
                    self.useBusinessCheck();
                }, this);
            } else {
                //없는 부서일 경우.
                dataSet.sql_file = 'IMXConfig_SMS_Business_Id_Seq.sql';

                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                WS.SQLExec(dataSet, function(aheader, adata) {
                    smsBusinessId = adata.rows[0][0];
                    updateDataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Update_No_Business_Name.sql';

                    updateDataSet.bind.push({
                        name: 'sms_business_id',
                        value: smsBusinessId,
                        type : SQLBindType.INTEGER
                    });

                    updateDataSet.bind.push({
                        name: 'sms_business_name',
                        value: businessNameEdit,
                        type : SQLBindType.STRING
                    });

                    if(common.Util.isMultiRepository()){
                        updateDataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    WS.SQLExec(updateDataSet, function(){
                        self.useBusinessCheck();
                    }, this);

                },this);
            }
        }, this);
    },

    useBusinessCheck : function(){
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Use_Business_Check.sql';

        dataSet.bind = [{
            name: 'sms_business_id',
            value: self.sms_business_id,
            type : SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            if(!data.rows.length){
                //사용하는 부서명이 없으면 삭제
                dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Delete_Business_info.sql';

                dataSet.bind = [{
                    name: 'sms_business_id',
                    value: self.sms_business_id,
                    type : SQLBindType.INTEGER
                }];

                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                WS.SQLExec(dataSet, function() {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    self.CancelButton.fireEvent('click');
                },this);
            } else{
                // 아니면 유지
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                self.CancelButton.fireEvent('click');
            }
        },this);
    },

    fieldCheck : function(){
        var userNameEdit            = this.userNameEdit.getValue(),
            mobileEdit              = this.mobileEdit.getValue(),
            employeeIdEdit          = this.employeeIdEdit.getValue(),
            businessNameEdit        = this.businessNameEdit.getValue(),
            emailEdit               = this.emailEdit.getValue();

        //사번 예외처리 추가.
        if (employeeIdEdit == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'));
            this.employeeIdEdit.focus();
            return false;
        }

        for(var ix =0; ix < this.parent.gridSMSUserList.getRowCount(); ix++){
            //edit일 경우
            if (employeeIdEdit == this.employee_id) {
                continue;
            }
            var parentData = this.parent.gridSMSUserList.getRow(ix).data.employee_id;
            //기본 부모 데이터와 편집 데이터 비교
            if(parentData == employeeIdEdit){
                Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('EmployeeId Duplicate.'));
                this.employeeIdEdit.focus();
                return false;
            }
        }

        // byte check
        var employeeIdByteLen = this.getTextLength(employeeIdEdit);

        if(employeeIdByteLen > 256){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.employeeIdEdit.focus();
            return false;
        }

        if ( employeeIdEdit.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.employeeIdEdit.focus();
            return false;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 사용자명이 입력안되었을 때 예외처리
        if (userNameEdit == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter User name.'));
            this.userNameEdit.focus();
            return false;
        }

        // byte check
        var userNameByteLen = this.getTextLength(userNameEdit);

        if(userNameByteLen > 20){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.userNameEdit.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( userNameEdit.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.userNameEdit.focus();
            return false;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //부서 예외처리 추가.
        if (businessNameEdit == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'));
            this.businessNameEdit.focus();
            return false;
        }

        // byte check
        var departmentByteLen = this.getTextLength(businessNameEdit);

        if(departmentByteLen > 256){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.businessNameEdit.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( businessNameEdit.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.businessNameEdit.focus();
            return false;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 연락처가 입력안되었을 때 예외처리
        if ( mobileEdit == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please Enter Mobile.'));
            this.mobileEdit.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( mobileEdit.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.mobileEdit.focus();
            return false;
        }

        //숫자 입력만 받도록 예외처리.
        var num_check=/^[0-9]*$/;
        if(!num_check.test(mobileEdit)){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter only the numbers'));
            this.mobileEdit.focus();
            return false;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //email 예외처리 추가.
        if (emailEdit == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'));
            this.emailEdit.focus();
            return false;
        }

        // byte check
        var emailByteLen = this.getTextLength(emailEdit);

        if(emailByteLen > 256){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.emailEdit.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( emailEdit.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.emailEdit.focus();
            return false;
        }

        return true;
    }
});
