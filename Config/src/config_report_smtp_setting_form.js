Ext.define('config.config_report_smtp_setting_form', {
    extend  : 'Exem.Form',

    init: function(state) {
        var self = this;
        var title;

        this.mode = state;

        if (state == 'Add'){
            title = common.Util.TR('Add SMTP');
        } else{
            title = common.Util.TR('Edit SMTP');
        }

        var form = Ext.create('Exem.Window', {
            layout      : 'vbox',
            maximizable : false,
            width       : 350,
            height      : 295,
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

        this.hostEdit = Ext.create('Ext.form.field.Text', {
            x                : 10,
            y                : 15,
            width            : 300,
            labelWidth       : 80,
            labelAlign       : 'right',
            maxLength        : 64,
            enforceMaxLength : true,
            fieldLabel       : Comm.RTComm.setFont(9, common.Util.CTR('Host')),
            allowBlank       : false
        });

        this.portEdit = Ext.create('Ext.form.field.Text', {
            x                : 10,
            y                : 15+35,
            width            : 300,
            labelWidth       : 80,
            labelAlign       : 'right',
            maxLength        : 5,
            enforceMaxLength : true,
            fieldLabel       : Comm.RTComm.setFont(9, common.Util.CTR('Port')),
            value            : 25
        });

        this.emailEdit = Ext.create('Ext.form.field.Text', {
            x                : 10,
            y                : 15+35+35,
            width            : 300,
            labelWidth       : 80,
            labelAlign       : 'right',
            maxLength        : 64,
            enforceMaxLength : true,
            fieldLabel       : Comm.RTComm.setFont(9, common.Util.CTR('Email')),
            allowBlank       : false
        });

        this.authCheckBox = Ext.create('Ext.form.field.Checkbox',{
            x                : 96,
            y                : 15+35+35+35,
            checked          : true,
            boxLabel       : Comm.RTComm.setFont(9, common.Util.CTR('Auth')),
            listeners : {
                change : function() {
                    if(this.checked){
                        self.userNameEdit.setDisabled(false);
                        self.passwordEdit.setDisabled(false);
                        self.SSLCheckBox.setDisabled(false);
                    } else{
                        self.userNameEdit.setDisabled(true);
                        self.userNameEdit.setValue('');
                        self.passwordEdit.setDisabled(true);
                        self.passwordEdit.setValue('');
                        self.SSLCheckBox.setDisabled(true);
                        self.SSLCheckBox.setValue(false);
                    }
                }
            }
        });

        this.SSLCheckBox = Ext.create('Ext.form.field.Checkbox',{
            x           : 192,
            y           : 15+35+35+35,
            checked     : false,
            boxLabel    : Comm.RTComm.setFont(9, common.Util.CTR('SSL'))
        });

        this.userNameEdit = Ext.create('Ext.form.field.Text', {
            x                : 10,
            y                : 15+35+35+35+35,
            width            : 300,
            labelWidth       : 80,
            labelAlign       : 'right',
            maxLength        : 50,
            enforceMaxLength : true,
            fieldLabel       : Comm.RTComm.setFont(9, common.Util.CTR('User Name'))
        });

        this.passwordEdit = Ext.create('Ext.form.field.Text', {
            x                : 10,
            y                : 15+35+35+35+35+35,
            width            : 300,
            labelWidth       : 80,
            labelAlign       : 'right',
            inputType        : 'password',
            cls              : 'login_area_idpweditbox',
            maxLength        : 256,
            enforceMaxLength : true,
            fieldLabel       : Comm.RTComm.setFont(9, common.Util.CTR('Password'))
        });
        bodyPanel.add(this.hostEdit, this.portEdit, this.emailEdit, this.authCheckBox, this.SSLCheckBox, this.userNameEdit, this.passwordEdit);

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

        if(state == 'Add') {
            this.smtpSeq();
            this.hostEdit.focus();
        }

        if (state == 'Edit') {
            this.hostEdit.setValue(this.host);
            this.portEdit.setValue(this.smtp_port);
            this.emailEdit.setValue(this.email);
            this.userNameEdit.setValue(this.smtp_user_name);
            this.authCheckBox.setValue(this.auth);
            this.SSLCheckBox.setValue(this.ssl);
            this.hostEdit.focus();
        }
    },

    smtpSeq : function(){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Report_SMTP_Seq.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(header,data) {
            if(!common.Util.checkSQLExecValid(header, data)){
                console.info(header);
                console.info(data);
                return;
            }
            this.smtp_id = data.rows[0][0];
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

        var self = this,
            dataSet     = {},
            host        = this.hostEdit.getValue(),
            port        = this.portEdit.getValue(),
            email       = this.emailEdit.getValue(),
            userName    = this.userNameEdit.getValue(),
            password    = this.passwordEdit.getValue(),
            auth        = this.authCheckBox.getValue(),
            ssl         = this.SSLCheckBox.getValue();

        if(self.mode == 'Add'){
            dataSet.sql_file = 'IMXConfig_Report_SMTP_Add.sql';
        } else if(self.mode == 'Edit'){
            dataSet.sql_file = 'IMXConfig_Report_SMTP_Edit.sql';
        }

        if(auth){
            auth = 1;
        } else {
            auth = 0;
        }

        if(ssl){
            ssl = 1;
        } else {
            ssl = 0;
        }

        dataSet.bind = [{
            name    : 'smtp_id',
            value   : this.smtp_id,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'host',
            value   : host,
            type    : SQLBindType.STRING
        }, {
            name    : 'port',
            value   : port,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'user_name',
            value   : userName,
            type    : SQLBindType.STRING
        }, {
            name    : 'password',
            value   : password,
            type    : SQLBindType.STRING
        }, {
            name    : 'auth',
            value   : auth,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'ssl',
            value   : ssl,
            type    : SQLBindType.INTEGER
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
        var host        = this.hostEdit.getValue(),
            port        = this.portEdit.getValue(),
            email       = this.emailEdit.getValue(),
            userName    = this.userNameEdit.getValue(),
            password    = this.passwordEdit.getValue();

        // host가 입력안되었을 때 예외처리
        if ( host == '' || host == null ) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter Host'));
            this.hostEdit.focus();
            return false;
        }

        // byte check
        var hostByteLen = this.getTextLength(host);

        if(hostByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.hostEdit.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( host.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.hostEdit.focus();
            return false;
        }

        //중복체크
        if ( this.host != host && this.parent.smtpListGrid.findRow('host', host) !== null) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Host is duplicated.'));
            this.hostEdit.focus();
            return false;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // port가 입력안되었을 때 예외처리
        if (port == '' || port == null) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter User name.'));
            this.portEdit.focus();
            return false;
        }

        //공백 문자 예외 처리
        if ( port.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Blank Character is not allowed'));
            this.portEdit.focus();
            return false;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // email가 입력안되었을 때 예외처리
        if ( email == '' || email == null ) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter Email'));
            this.emailEdit.focus();
            return false;
        }

        // byte check
        var emailByteLen = this.getTextLength(email);

        if(emailByteLen > 64){
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

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if(this.authCheckBox.getValue()){
            // 사용자명이 입력안되었을 때 예외처리
            if (userName == '' || userName == null) {
                Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter User name.'));
                this.userNameEdit.focus();
                return false;
            }

            // byte check
            var userNameByteLen = this.getTextLength(userName);

            if(userNameByteLen > 50){
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
            if ( this.smtp_user_name != userName && this.parent.smtpListGrid.findRow('smtp_user_name', userName) !== null) {
                Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('User name is duplicated.'));
                this.userNameEdit.focus();
                return false;
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //password 예외처리 추가.
            if (password == '' || password == null) {
                Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter a password'));
                this.passwordEdit.focus();
                return false;
            }

            // byte check
            var passwordByteLen = this.getTextLength(password);

            if(passwordByteLen > 256){
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
                this.passwordEdit.focus();
                return false;
            }
        }

        return true;
    }
});
