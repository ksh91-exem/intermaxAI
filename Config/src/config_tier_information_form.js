Ext.define('config.config_tier_information_form', {

    sql: {
        tier_code_info: 'IMXConfig_Tier_Code_Info.sql',
        tier_insert: 'IMXConfig_Tier_Insert.sql',
        tier_update: 'IMXConfig_Tier_Update.sql'
    },

    init: function(state){
        var self = this;
        var title;
        this.mode = state ;

        if (state === 'Add') {
            title = common.Util.TR('Add Tier Information');
        } else {
            title = common.Util.TR('Edit Tier Information');
        }

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 320,
            height: 150,
            resizable: false,
            title   : title,
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var bodyPanel = Ext.create('Ext.panel.Panel', {
            flex    : 1,
            width   : '100%',
            height  : '100%',
            layout  : 'vbox',
            border  : false,
            bodyStyle: { background: '#eeeeee' },
            margin  : '4 4 4 4',
            cls         : 'x-config-used-round-panel'
        });

        this.tierIdComboBox = Ext.create('Exem.ComboBox', {
            width       : 270,
            labelWidth  : 80,
            labelAlign  : 'right',
            store       : Ext.create('Exem.Store'),
            editable    : false,
            fieldLabel  : Comm.RTComm.setFont(9, common.Util.CTR('Tier ID')) + ':',
            margin      : '4 0 0 0',
            cls         : 'config_tab'
        });

        this.setTierComboBox(this.tierIdComboBox,'id',state);

        this.tierNameFiled = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Tier Name')),
            margin  : '4 0 0 0',
            allowBlank: true
        });

        this.tierTypeComboBox = Ext.create('Exem.ComboBox', {
            width       : 270,
            labelWidth  : 80,
            labelAlign  : 'right',
            store       : Ext.create('Exem.Store'),
            editable    : false,
            fieldLabel  : Comm.RTComm.setFont(9, common.Util.CTR('Tier Type')) + ':',
            margin  : '4 0 0 0',
            cls         : 'config_tab'
        });

        this.setTierComboBox(this.tierTypeComboBox,'type',state);

        bodyPanel.add(this.tierIdComboBox, this.tierNameFiled, this.tierTypeComboBox);

        var buttonPanel = Ext.create('Ext.panel.Panel', {
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
                    self.save();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Close'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        buttonPanel.add(OKButton, this.CancelButton);

        form.add(bodyPanel,buttonPanel);

        form.show();

        if(state === 'Edit'){
            this.tierNameFiled.setValue(this.tier_name);
        }
    },

    setTierComboBox: function(comboBox, codeType, state){
        var dataSet = {};
        var ix;

        dataSet.sql_file = this.sql.tier_code_info;

        dataSet.bind = [{
            name: 'codeType',
            value: codeType,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataset.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if(!common.Util.checkSQLExecValid(aheader, adata)){
                console.debug('config_tier_information_form - setTierComboBox');
                console.debug(aheader);
                console.debug(adata);
                return;
            }

            for (ix = adata.rows.length; ix--;) {
                comboBox.addItem(adata.rows[ix][0],adata.rows[ix][1]);
            }
            if (state === 'Add'){
                comboBox.selectRow(0);
            } else if(state === 'Edit') {
                if(codeType === 'id'){
                    comboBox.selectByName(this.tier_id_key);
                } else if(codeType === 'type'){
                    comboBox.selectByName(this.tier_type_key);
                }
            }
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
            dataSet   = {};

        dataSet.bind = [{
            name    : 'tier_name',
            value   : this.tierNameFiled.getValue(),
            type    : SQLBindType.STRING
        }, {
            name    : 'tier_id_key',
            value   : this.tierIdComboBox.getValue(),
            type    : SQLBindType.INTEGER
        }, {
            name    : 'tier_type_key',
            value   : this.tierTypeComboBox.getValue(),
            type    : SQLBindType.INTEGER
        }];

        if(this.mode === 'Add'){
            dataSet.sql_file = this.sql.tier_insert;
        } else if(this.mode === 'Edit'){
            dataSet.sql_file = this.sql.tier_update;
            dataSet.bind.push({
                name: 'tier_id',
                value: this.tier_id,
                type: SQLBindType.INTEGER
            });
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            self.CancelButton.fireEvent('click');
            self.parent.onButtonClick('Refresh');
        }, this);
    },

    fieldCheck : function(){
        var tierId = this.tierIdComboBox.getValue();
        var tierIdTextValue = this.tierIdComboBox.getSelectedRecord().data[2];
        var tierName = this.tierNameFiled.getValue();
        var tierType = this.tierTypeComboBox.getValue();

        // CHECK: Tier ID
        if (tierId === null) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please select a Tier ID.'));
            return false;
        }

        // CHECK: Tier ID 중복 체크
        if ( this.tier_id_key != tierIdTextValue && this.parent.tierInfoGrid.findRow('tier_id_key', tierIdTextValue) !== null) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Tier id is duplicated.'));
            return false;
        }

        // CHECK: Tier Name + Byte Check
        if (tierName === '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please enter Tier Name'));
            this.tierNameFiled.focus();
            return false;
        }

        var tierNameByteLen = this.getTextLength(tierName);

        if(tierNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.hostNameEdit.focus();
            return false;
        }

        // CHECK: Tier Type
        if (tierType === null) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please select a Tier Type.'));
            return false;
        }

        // CHECK: Tier Name 중복 체크
        if ( this.tier_name != tierName && this.parent.tierInfoGrid.findRow('tier_name', tierName) !== null) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Tier Name is duplicated.'));
            this.tierNameFiled.focus();
            return false;
        }

        return true;
    }
});