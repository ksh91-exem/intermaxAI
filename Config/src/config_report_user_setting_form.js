Ext.define('config.config_report_user_setting_form', {
    extend: 'Exem.Form',

    init: function(state) {
        var self = this;
        var title;

        this.mode = state;

        if (state == 'Add'){
            title = common.Util.TR('Add User');
        } else{
            title = common.Util.TR('Edit User');
        }

        var form = Ext.create('Exem.Window', {
            layout      : 'vbox',
            maximizable : false,
            width       : 320,
            height      : 150,
            resizable   : false,
            title       : title,
            bodyStyle   : { background: '#f5f5f5' },
            closeAction : 'destroy'
        });

        var bodyPanel = Ext.create('Ext.panel.Panel', {
            layout      : 'absolute',
            cls         : 'x-config-used-round-panel',
            width       : '100%',
            flex        : 1,
            margin      : '4 4 4 4',
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });

        this.userNameEdit = Ext.create('Ext.form.field.Text', {
            x                : 10,
            y                : 12,
            width            : 260,
            labelWidth       : 70,
            labelAlign       : 'right',
            maxLength        : 20,
            enforceMaxLength : true,
            fieldLabel       : Comm.RTComm.setFont(9, common.Util.CTR('User Name')),
            allowBlank       : false
        });

        this.emailEdit = Ext.create('Ext.form.field.Text', {
            x                : 10,
            y                : 47,
            width            : 260,
            labelWidth       : 70,
            labelAlign       : 'right',
            maxLength        : 64,
            enforceMaxLength : true,
            fieldLabel       : Comm.RTComm.setFont(9, common.Util.CTR('Email')),
            vtype            : 'email', // applies email validation rules to this field
            listeners        : {
                blur : function() {
                    var check = /^((([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z\s?]{2,5}){1,25})*(\s*?;\s*?)*)*$/;
                    if (!Ext.isEmpty(this.getValue()) && !check.test(this.getValue())) {
                        Ext.Msg.alert(common.Util.TR('Message'), Ext.form.field.VTypes.emailText);
                        return false;
                    }
                }
            }
        });
        bodyPanel.add(this.userNameEdit);
        bodyPanel.add(this.emailEdit);

        var buttonPanel = Ext.create('Ext.panel.Panel', {
            layout    : {
                type      : 'hbox',
                pack      : 'center',
                align     : 'middle'
            },
            width     : '100%',
            height    : 25,
            border    : false,
            bodyStyle : { background: '#f5f5f5' }
        });

        var OKButton = Ext.create('Ext.button.Button', {
            text      : common.Util.TR('Save'),
            cls       : 'x-btn-config-default',
            width     : 70,
            margin    : '0 2 0 0',
            listeners : {
                click : function() {
                    self.save();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text      : common.Util.TR('Cancel'),
            cls       : 'x-btn-config-default',
            width     : 70,
            margin    : '0 0 0 2',
            listeners : {
                click : function() {
                    this.up('.window').close();
                    self.parent.onButtonClick('Refresh');
                }
            }
        });
        buttonPanel.add(OKButton);
        buttonPanel.add(this.CancelButton);

        form.add(bodyPanel);
        form.add(buttonPanel);

        form.show();

        if(state == 'Add'){
            this.userSeq();
            this.userNameEdit.focus();
        }

        if (state == 'Edit') {
            this.userNameEdit.setValue(this.user_name);
            this.emailEdit.setValue(this.user_email);
            this.userNameEdit.focus();
        }
    },

    userSeq : function(){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Report_User_Seq.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(header,data) {
            if(!common.Util.checkSQLExecValid(header, data)){
                console.info(header);
                console.info(data);
                return;
            }
            this.user_id = data.rows[0][0];
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

    save: function() {
        if(!this.fieldCheck()){
            return;
        }

        var self     = this,
            dataSet   = {},
            userName  = this.userNameEdit.getValue(),
            email     = this.emailEdit.getValue();

        if(self.mode == 'Add'){
            dataSet.sql_file = 'IMXConfig_Report_User_Add.sql';
        } else if(self.mode == 'Edit'){
            dataSet.sql_file = 'IMXConfig_Report_User_Edit.sql';
        }

        dataSet.bind = [{
            name    : 'user_id',
            value   : this.user_id,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'user_name',
            value   : userName,
            type    : SQLBindType.STRING
        }, {
            name    : 'email',
            value   : email,
            type    : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            self.CancelButton.fireEvent('click');
        }, this);
    },

    fieldCheck : function(){
        var userName    = this.userNameEdit.getValue(),
            email       = this.emailEdit.getValue();

        // 사용자명이 입력안되었을 때 예외처리
        if (userName == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter User name.'));
            this.userNameEdit.focus();
            return false;
        }

        // byte check
        var userNameByteLen = this.getTextLength(userName);

        if(userNameByteLen > 20){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.userNameEdit.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( userName.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.userNameEdit.focus();
            return false;
        }

        //중복체크
        if ( this.user_name != userName && this.parent.userListGrid.findRow('user_name', userName) !== null) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('User name is duplicated.'));
            this.userNameEdit.focus();
            return false;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //email 예외처리 추가.
        if (email == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'));
            this.emailEdit.focus();
            return false;
        }

        // byte check
        var emailByteLen = this.getTextLength(email);

        if(emailByteLen > 256){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.emailEdit.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( email.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.emailEdit.focus();
            return false;
        }

        return true;
    }
});
