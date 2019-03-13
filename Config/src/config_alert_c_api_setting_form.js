Ext.define('config.config_alert_c_api_setting_form', {

    parent: null,
    mode: '',
    exception_mode: '',
    transaction_name: '',
    exception_name: '',
    sms_schedule_name: '',

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        this.form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 500,
            height: 191,
            resizable: false,
            title: common.Util.TR('C API Alert Configuration'),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 125,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var alertLevelLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Alert Level'))
        });

        this.levelComboBox = Ext.create('Exem.ComboBox', {
            x       : 120,
            y       : 10,
            width   : 120,
            store   : Ext.create('Exem.Store'),
            editable: false,
            cls     : 'config_tab'
        });
        this.levelComboBox.addItem('WARNING' , common.Util.CTR('WARNING') );
        this.levelComboBox.addItem('CRITICAL', common.Util.CTR('CRITICAL') );

        //

        var alertNameLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 39,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('Alert Name'))
        });

        this.alertNameEdit = Ext.create('Ext.form.field.Text', {
            x: 120,
            y: 37,
            width: 340,
            allowBlank: false
        });

        //

        var alertDescriptionLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 66,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('Alert Description'))
        });

        this.alertDescriptionEdit = Ext.create('Ext.form.field.Text', {
            x: 120,
            y: 64,
            width: 340,
            allowBlank: false
        });

        //

        var smsScheduleLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 93,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('SMS Schedule'))
        });

        this.smsScheduleEdit = Ext.create('Ext.form.field.Text', {
            x: 120,
            y: 91,
            width: 235,
            readOnly: true
        });

        var SMSButton = Ext.create('Ext.button.Button', {
            text: '...',
            x: 357,
            y: 90,
            width: 25,
            cls: 'x-btn-config-default',
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    var sms_form = Ext.create('config.config_alert_smsschedulemgr');
                    sms_form.init(self);
                }
            }
        });

        var SMSClearButton = Ext.create('Ext.button.Button', {
            text: 'Clear SMS',
            x: 385,
            y: 90,
            width: 75,
            cls: 'x-btn-config-default',
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.smsScheduleEdit.setValue('');
                }
            }
        });

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
            text: 'OK',
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

        panel.add(alertLevelLabel);
        panel.add(this.levelComboBox);
        panel.add(alertNameLabel);
        panel.add(this.alertNameEdit);
        panel.add(alertDescriptionLabel);
        panel.add(this.alertDescriptionEdit);
        panel.add(smsScheduleLabel);
        panel.add(this.smsScheduleEdit);
        panel.add(SMSButton);
        panel.add(SMSClearButton);

        this.form.add(panel);
        this.form.add(buttonPanel);

        buttonPanel.add(OKButton);
        buttonPanel.add(this.CancelButton);

        this.form.show();

        switch (this.mode) {
            case 'Add' :
                this.levelComboBox.selectRow(0);
                break;
            case 'Edit' :
                this.levelComboBox.setValue(this.alert_level);
                this.alertNameEdit.setValue(this.alert_name);
                this.alertDescriptionEdit.setValue(this.alert_description);
                this.smsScheduleEdit.setValue(this.sms_schedule_name);
                break;
            default :
                break;
        }
    },

    setSMSScheduleName: function(_sms_) {
        this.smsScheduleEdit.setValue(_sms_);
    },

    save: function() {
        var data = [], parentAlertName = this.alertNameList,
            alertName = this.alertNameEdit.getValue(),
            alertDescription = this.alertDescriptionEdit.getValue(),
            alertType = this.levelComboBox.getValue();

        if(alertType === null){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a type.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }

        if(alertType === common.Util.CTR('CRITICAL')){
            alertType = 'CRITICAL';
        } else if (alertType === common.Util.CTR('WARNING')){
            alertType = 'WARNING';
        }

        var ix,ixLen;
        for(ix = 0, ixLen = parentAlertName.length; ix < ixLen; ix++){
            if(parentAlertName[ix] == alertName){
                Ext.Msg.alert('Error', common.Util.TR('Already exists'));
                this.alertNameEdit.focus();
                return;
            }
        }

        if(!alertName){
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.alertNameEdit.focus();
            return;
        }

        config.ConfigEnv.group_flag = cfg.alert.sltExistSub ;


        data.alertType = alertType;
        data.alertDescription = alertDescription;
        data.alertName = alertName;
        data.this = this;

        if(this.mode == 'Edit'){
            alertName = this.alert_name;
        }

        if (cfg.alert.sltExistSub) {
            config.ConfigEnv.delete_config( cfg.alert.sltName, 'APIM', 'C API', alertName, this.deleteComplete, data ) ;
        } else {
            config.ConfigEnv.delete_config( cfg.alert.sltId, 'APIM', 'C API', alertName, this.deleteComplete, data ) ;
        }
        this.form.close();
    },

    deleteComplete : function(){
        var data = this.set_value;
        var slt;
        if(cfg.alert.sltExistSub){
            slt = cfg.alert.sltName;
        } else {
            slt = cfg.alert.sltId;
        }

        config.ConfigEnv.insert_config( slt, 'APIM', 'C API', data.alertName, data.this.smsScheduleEdit.getValue(), data.alertDescription ) ;
        config.ConfigEnv.insert_tag_config( slt, 'APIM', 'C API', data.alertName, 'LEVEL', data.alertType ) ;

        setTimeout(function() {
            data.this.parent.onRefresh();
        }, 100);
    }
});
