Ext.define('config.config_tier_code_enrollment_form', {
    sql: {
        tier_code_insert : 'IMXConfig_Tier_Code_Insert.sql',
        tier_code_update : 'IMXConfig_Tier_Code_Update.sql'
    },

    init: function(state) {
        var self = this;
        var title;

        this.mode = state;

        if (state === 'Add' && this.codeType === 'id'){
            title = common.Util.TR('Add Tier ID');
        } else if (state === 'Add' && this.codeType === 'type'){
            title = common.Util.TR('Add Tier Type');
        } else if (state === 'Edit' && this.codeType === 'id'){
            title = common.Util.TR('Edit Tier ID');
        } else if (state === 'Edit' && this.codeType === 'type'){
            title = common.Util.TR('Edit Tier Type');
        }

        var form = Ext.create('Exem.Window', {
            layout      : 'vbox',
            maximizable : false,
            width       : 320,
            height      : 115,
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

        this.codeNameField = Ext.create('Ext.form.field.Text', {
            x                : 10,
            y                : 12,
            width            : 260,
            labelWidth       : 70,
            labelAlign       : 'right',
            maxLength        : 20,
            enforceMaxLength : true,
            fieldLabel       : (this.codeType === 'id') ? common.Util.TR('Tier ID') : common.Util.TR('Tier Type'),
            allowBlank       : false
        });

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
                }
            }
        });

        bodyPanel.add(this.codeNameField);
        buttonPanel.add(OKButton, this.CancelButton);

        form.add(bodyPanel, buttonPanel);

        form.show();

        if (state === 'Edit' && this.codeType === 'id') {
            this.codeNameField.setValue(this.tier_id);
        } else if(state === 'Edit' && this.codeType === 'type'){
            this.codeNameField.setValue(this.tier_type);
        }

        this.codeNameField.focus();
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
            codeName  = this.codeNameField.getValue();

        dataSet.bind = [{
            name    : 'codeName',
            value   : codeName,
            type    : SQLBindType.STRING
        }, {
            name    : 'codeType',
            value   : this.codeType,
            type    : SQLBindType.STRING
        }];

        if(this.mode === 'Add'){
            dataSet.sql_file = this.sql.tier_code_insert;
        } else if(this.mode === 'Edit'){
            dataSet.sql_file = this.sql.tier_code_update;
            dataSet.bind.push({
                name: 'codeId',
                value: this.code_id,
                type: SQLBindType.INTEGER
            });
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            self.CancelButton.fireEvent('click');
            self.parent.onButtonClick('bothRefresh');
        }, this);
    },

    fieldCheck : function(){
        var codeName    = this.codeNameField.getValue();

        // 사용자명이 입력안되었을 때 예외처리
        if (codeName == '' && this.codeType === 'id') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter tier id.'));
            this.codeNameField.focus();
            return false;
        } else if(codeName == '' && this.codeType === 'type'){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter tier type.'));
            this.codeNameField.focus();
            return false;
        }

        // byte check
        var codeNameByteLen = this.getTextLength(codeName);

        if(codeNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.codeNameField.focus();
            return false;
        }

        //중복체크
        if(this.codeType === 'id'){
            if ( this.tier_id != codeName && this.parent.tierIdGrid.findRow('tier_id', codeName) !== null) {
                Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Tier id is duplicated.'));
                this.codeNameField.focus();
                return false;
            }
        } else if(this.codeType === 'type'){
            if ( this.tier_type != codeName && this.parent.tierTypeGrid.findRow('tier_type', codeName) !== null) {
                Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Tier type is duplicated.'));
                this.codeNameField.focus();
                return false;
            }
        }

        return true;
    }
});
