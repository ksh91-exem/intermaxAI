Ext.define('config.config_alert_slog_alert_form', {
    mode: '',

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout      : 'vbox',
            maximizable : false,
            width       : 400,
            height      : 191 + 50,
            resizable   : false,
            title       : common.Util.TR('Exception Alert Configuration'),
            bodyStyle   : { background: '#f5f5f5' },
            closeAction : 'destroy'
        });

        self.form = form;

        var panelA = Ext.create('Ext.panel.Panel', {
            layout      : 'absolute',
            cls         : 'x-config-used-round-panel',
            width       : '100%',
            height      : 175,
            margin      : '4 4 4 4',
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });

        //

        var alertNameLabel = Ext.create('Ext.form.Label', {
            x       : 0,
            y       : 12,
            width   : 110,
            style   : 'text-align:right;',
            html    : Comm.RTComm.setFont(9, common.Util.CTR('Alert Name'))
        });

        this.alertNameEdit = Ext.create('Ext.form.field.Text', {
            x       : 120,
            y       : 10,
            width   : 240,
            allowBlank: false
        });

        //

        var typeLabel = Ext.create('Ext.form.Label', {
            x       : 0,
            y       : 39,
            width   : 110,
            style   : 'text-align:right;',
            html    : Comm.RTComm.setFont(9, common.Util.TR('Type'))
        });

        this.typeComboBox = Ext.create('Exem.ComboBox', {
            x       : 120,
            y       : 37,
            width   : 135,
            store   : Ext.create('Exem.Store'),
            editable: false,
            cls     : 'config_tab'
        });
        this.typeComboBox.addItem('CRITICAL', common.Util.CTR('CRITICAL') );
        this.typeComboBox.addItem('WARNING' , common.Util.CTR('WARNING') );

        //

        var repeatLabel = Ext.create('Ext.form.Label', {
            x       : 0,
            y       : 66,
            width   : 110,
            style   : 'text-align:right;',
            html    : Comm.RTComm.setFont(9, common.Util.CTR('Repeat'))
        });

        this.repeatEdit = Ext.create('Ext.form.field.Number', {
            x           : 120,
            y           : 64,
            width       : 240,
            minValue    : 1,
            maxLength   : 3,
            hideTrigger : true,
            allowBlank  : false,
            value       : 1,
            enforceMaxLength : true
        });

        //

        var slogIncludeLabel = Ext.create('Ext.form.Label', {
            x       : 0,
            y       : 93,
            width   : 110,
            style   : 'text-align:right;',
            html    : Comm.RTComm.setFont(9, common.Util.CTR('Slog Text Include'))
        });

        this.slogIncludeEdit = Ext.create('Ext.form.field.Text', {
            x       : 120,
            y       : 91,
            width   : 240
        });

        //

        var slogExcludeLabel = Ext.create('Ext.form.Label', {
            x       : 0,
            y       : 120,
            width   : 110,
            style   : 'text-align:right;',
            html    : Comm.RTComm.setFont(9, common.Util.CTR('Slog Text Exclude'))
        });

        this.slogExcludeEdit = Ext.create('Ext.form.field.Text', {
            x       : 120,
            y       : 118,
            width   : 240
        });

        //

        var smsScheduleLabel = Ext.create('Ext.form.Label', {
            x       : 0,
            y       : 147,
            width   : 110,
            style   : 'text-align:right;',
            html    : Comm.RTComm.setFont(9, common.Util.CTR('SMS Schedule'))
        });

        this.smsScheduleEdit = Ext.create('Ext.form.field.Text', {
            x       : 120,
            y       : 145,
            width   : 135,
            readOnly: true
        });

        var SMSButton = Ext.create('Ext.button.Button', {
            text    : '...',
            x       : 257,
            y       : 144,
            width   : 25,
            cls     : 'x-btn-config-default',
            margin  : '0 2 0 0',
            listeners: {
                click: function() {
                    var sms_form = Ext.create('config.config_alert_smsschedulemgr');
                    sms_form.init(self);
                }
            }
        });

        var SMSClearButton = Ext.create('Ext.button.Button', {
            text    : 'Clear SMS',
            x       : 285,
            y       : 144,
            width   : 75,
            cls     : 'x-btn-config-default',
            margin  : '0 2 0 0',
            listeners: {
                click: function() {
                    self.smsScheduleEdit.setValue('');
                }
            }
        });

        var panelC = Ext.create('Ext.panel.Panel', {
            layout  : {
                type    : 'hbox',
                pack    : 'center',
                align   : 'middle'
            },
            width   : '100%',
            height  : 25,
            border  : false,
            bodyStyle: { background: '#f5f5f5' }
        });

        var OKButton = Ext.create('Ext.button.Button', {
            text    : 'OK',
            cls     : 'x-btn-config-default',
            width   : 70,
            margin  : '0 2 0 0',
            listeners: {
                click: function() {
                    self.save();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text    : common.Util.TR('Cancel'),
            cls     : 'x-btn-config-default',
            width   : 70,
            margin  : '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        //
        panelA.add(alertNameLabel);
        panelA.add(this.alertNameEdit);
        panelA.add(typeLabel);
        panelA.add(this.typeComboBox);
        panelA.add(repeatLabel);
        panelA.add(this.repeatEdit);
        panelA.add(slogIncludeLabel);
        panelA.add(this.slogIncludeEdit);
        panelA.add(slogExcludeLabel);
        panelA.add(this.slogExcludeEdit);
        panelA.add(smsScheduleLabel);
        panelA.add(this.smsScheduleEdit);
        panelA.add(SMSButton);
        panelA.add(SMSClearButton);

        form.add(panelA);
        form.add(panelC);

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.show();

        switch (this.mode) {
            case 'Add' :
                this.typeComboBox.selectRow(0);
                break;
            case 'Edit' :
                this.alertNameEdit.setValue(this.alert_name);
                this.typeComboBox.setValue(this.type);
                this.repeatEdit.setValue(this.repeat);
                this.slogIncludeEdit.setValue(this.slog_include);
                this.slogExcludeEdit.setValue(this.slog_exclude);
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
        var self = this;
        var ix;

        var alertName = this.alertNameEdit.getValue();
        var alertType = this.typeComboBox.getValue();
        var repeat = this.repeatEdit.getValue();
        var slogIncludeText = this.slogIncludeEdit.getValue();
        var slogExcludeText = this.slogExcludeEdit.getValue();
        var parentAlertName = this.alert_name;

        var alertResourceName = '';
        var data = [];
        var parentData;

        if(this.mode === 'Edit'){
            alertResourceName = parentAlertName;
        }

        if(!alertName){
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.alertNameEdit.focus();
            return;
        }

        if(alertType === null){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a type.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }

        if(!slogIncludeText && !slogExcludeText){
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please input Either way include or exclude.'));
            return;
        }

        if(alertType === common.Util.CTR('CRITICAL')){
            alertType = 'CRITICAL';
        } else if (alertType === common.Util.CTR('WARNING')){
            alertType = 'WARNING';
        }

        if(!repeat){
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.repeatEdit.focus();
            return;
        }

        if(cfg.alert.sltExistSub){
            for ( ix = 0; ix < this.parent.slogGroupAlertGrid.getRowCount(); ix++ ) {
                parentData = this.parent.slogGroupAlertGrid.getRow(ix).data;

                if( parentData.alert_name === alertName ){
                    if( parentData.alert_name === parentAlertName ){
                        continue;
                    }
                    Ext.Msg.alert('Error', common.Util.TR('The SLog Alert already exists.'));
                    return ;
                }
            }
        } else {
            for ( ix = 0; ix < this.parent.slogServerAlertGrid.getRowCount(); ix++ ) {
                parentData = this.parent.slogServerAlertGrid.getRow(ix).data;

                if( parentData.alert_name === alertName ){
                    if( parentData.alert_name === parentAlertName ){
                        continue;
                    }
                    Ext.Msg.alert('Error', common.Util.TR('The SLog Alert already exists.'));
                    return ;
                }
            }
        }

        config.ConfigEnv.group_flag = cfg.alert.sltExistSub ;

        data.self       = self;
        data.alertName  = alertName;
        data.alertType  = alertType;
        data.repeat     = repeat;
        data.slogIncludeText = slogIncludeText;
        data.slogExcludeText = slogExcludeText;


        if (cfg.alert.sltExistSub) {
            config.ConfigEnv.delete_config( cfg.alert.sltName, 'TP', 'SLog Alert', alertResourceName, this.deleteComplete, data ) ;
        } else {
            config.ConfigEnv.delete_config( cfg.alert.sltId, 'TP', 'SLog Alert', alertResourceName, this.deleteComplete, data ) ;
        }
        self.form.close();
    },

    deleteComplete : function(){
        var data = this.set_value;
        var slt;
        if(cfg.alert.sltExistSub){
            slt = cfg.alert.sltName;
        } else {
            slt = cfg.alert.sltId;
        }
        config.ConfigEnv.insert_config( slt, 'TP', 'SLog Alert', data.alertName, data.self.smsScheduleEdit.getValue() ) ;
        config.ConfigEnv.insert_tag_config( slt, 'TP', 'SLog Alert', data.alertName, 'CONFIG_MODE', data.alertType ) ;
        config.ConfigEnv.insert_tag_config( slt, 'TP', 'SLog Alert', data.alertName, 'REPEAT', data.repeat ) ;
        config.ConfigEnv.insert_tag_config( slt, 'TP', 'SLog Alert', data.alertName, 'SLOG_INCLUDE', data.slogIncludeText ) ;
        config.ConfigEnv.insert_tag_config( slt, 'TP', 'SLog Alert', data.alertName, 'SLOG_EXCLUDE', data.slogExcludeText ) ;

        setTimeout(function() {
            data.self.parent.onRefresh();
        }, 100);
    }
});
