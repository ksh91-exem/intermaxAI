Ext.define('config.config_alert_sessionalert_form', {
    extend: 'Exem.Window',
    layout: 'vbox',
    maximizable: false,
    width: 515,
    height: 285,
    resizable: false,
    title: common.Util.TR('Session Alert Configuration'),
    bodyStyle: { background: '#f5f5f5' },
    closeAction: 'destroy',

    mode: null,

    constructor: function() {
        this.callParent(arguments);
    },

    init: function() {
        this.initProperty();
        this.initLayout();
        this.initDataSetting();
    },

    initProperty: function() {
        this.saving = false;
    },

    initLayout: function() {
        this.createAlertPanel();
        this.createScopePanel();
        this.createButtonCon();

        this.add(this.alertPanel, this.scopePanel, this.buttonCon);

        this.show();
    },

    createAlertPanel: function() {
        this.alertPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 120,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var alertTitleCon = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            style: { background: '#dddddd' }
        });

        var alertTitle = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            text : common.Util.TR('Alert Setup')
        });

        alertTitleCon.add(alertTitle);

        var alertSettingCon = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: '100%',
            flex: 1,
            border: false,
            style: { background: '#eeeeee' }
        });

        this.statNameComboBoxLayout(alertSettingCon);
        this.warningLayout(alertSettingCon);
        this.criticalLayout(alertSettingCon);
        this.smsScheduleLayout(alertSettingCon);

        this.alertPanel.add(alertTitleCon, alertSettingCon);
    },

    statNameComboBoxLayout: function(alertSettingCon) {
        var statNameLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 80,
            style: 'text-align:right;',
            text : common.Util.TR('Stat Name')
        });

        this.statNameComboBox = Ext.create('Exem.ComboBox', {
            x: 90,
            y: 10,
            width: 140,
            store: Ext.create('Exem.Store'),
            editable: false,
            cls: 'config_tab',
            listeners: {
                change: function(me, newValue) {
                    this.statNameChange(newValue);
                }.bind(this)
            }
        });

        if (cfg.alert.sltMode === 'Agent') {
            this.statNameComboBox.addItem('Elapsed Time'     , common.Util.CTR('Elapsed Time') );
            this.statNameComboBox.addItem('Thread CPU'       , common.Util.CTR('Thread CPU') );
            this.statNameComboBox.addItem('SQL Exec Count'   , common.Util.CTR('SQL Exec Count') );
            this.statNameComboBox.addItem('Fetch Count'      , common.Util.CTR('Fetch Count') );
            this.statNameComboBox.addItem('Prepare Count'    , common.Util.CTR('Prepare Count') );
            this.statNameComboBox.addItem('DB CPU Time'      , common.Util.CTR('DB CPU Time') );
            this.statNameComboBox.addItem('DB Wait Time'     , common.Util.CTR('DB Wait Time') );
            this.statNameComboBox.addItem('Logical Reads'    , common.Util.CTR('Logical Reads') );
            this.statNameComboBox.addItem('Physical Reads'   , common.Util.CTR('Physical Reads') );
            // redmine #3578 mssql에서만 사용함.
            if (cfg.repository === 'MSSQL') {
                this.statNameComboBox.addItem('Failure Count'    , common.Util.TR('Failure Count') );
                this.statNameComboBox.addItem('Failure Ratio (%)', common.Util.TR('Failure Ratio (%)') );
            }
        } else if (cfg.alert.sltMode === 'DB') {
            switch (cfg.alert.sltType) {
                case 'ORACLE' :
                    this.statNameComboBox.addItem('Logical Reads'   , common.Util.CTR('Logical Reads'));
                    this.statNameComboBox.addItem('Physical Reads'  , common.Util.CTR('Physical Reads'));
                    this.statNameComboBox.addItem('Execute Count'   , common.Util.CTR('Execute Count'));
                    this.statNameComboBox.addItem('Elapsed Time'    , common.Util.CTR('Elapse Time'));
                    this.statNameComboBox.addItem('Block Changes'   , common.Util.CTR('Block Changes'));
                    this.statNameComboBox.addItem('Hard Parse Count', common.Util.CTR('Hard Parse Count'));
                    // this.statNameComboBox.addItem('Session Count'   , common.Util.TR('Session Count'));
                    break;
                case 'DB2' :
                    this.statNameComboBox.addItem(common.Util.CTR('Agent User CPU Time'         ), 'Agent User CPU Time');
                    this.statNameComboBox.addItem(common.Util.CTR('Agent Sys CPU Time'          ), 'Agent Sys CPU Time');
                    this.statNameComboBox.addItem(common.Util.CTR('UOW Elapsed Time'            ), 'UOW Elapse Time');
                    this.statNameComboBox.addItem(common.Util.CTR('Rows Read'                   ), 'Rows Read');
                    this.statNameComboBox.addItem(common.Util.CTR('Rows Written'                ), 'Rows Written');
                    this.statNameComboBox.addItem(common.Util.CTR('Rows Changed'                ), 'Rows Changed');
                    this.statNameComboBox.addItem(common.Util.CTR('Total Sort'                  ), 'Total Sort');
                    this.statNameComboBox.addItem(common.Util.CTR('Sort Overflows'              ), 'Sort Overflows');
                    this.statNameComboBox.addItem(common.Util.CTR('Logical Reads'               ), 'Logical Reads');
                    this.statNameComboBox.addItem(common.Util.CTR('Physical Reads'              ), 'Physical Reads');
                    this.statNameComboBox.addItem(common.Util.CTR('Pool Temp Data Logical Reads'), 'Pool Temp Data Logical Reads');
                    this.statNameComboBox.addItem(common.Util.CTR('Direct Reads'                ), 'Direct Reads');
                    this.statNameComboBox.addItem(common.Util.CTR('Total Hash Joins'            ), 'Total Hash Joins');
                    this.statNameComboBox.addItem(common.Util.CTR('Session CPU'                 ), 'Session CPU');
                    break;
                default :
                    break;
            }
        } else if (cfg.alert.sltMode === 'WS' || cfg.alert.sltMode === 'TP' || cfg.alert.sltMode === 'APIM') {
            this.statNameComboBox.addItem('Elapsed Time', common.Util.CTR('Elapsed Time') );
        }

        alertSettingCon.add(statNameLabel, this.statNameComboBox);
    },

    warningLayout: function(alertSettingCon) {
        var unit = this.getCurrentUnit();

        var warningLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 39,
            width: 80,
            style: 'text-align:right;',
            text: common.Util.CTR('Warning')
        });

        this.warningEdit = Ext.create('Ext.form.field.Text', {
            x: 90,
            y: 37,
            width: 140,
            enforceMaxLength : true,
            value: '0'
        });

        this.warningUnit = Ext.create('Ext.form.Label', {
            x: 180,
            y: 39,
            width: 80,
            style: 'text-align:right;',
            text: unit
        });

        alertSettingCon.add(warningLabel, this.warningEdit, this.warningUnit);
    },

    criticalLayout: function(alertSettingCon) {
        var unit = this.getCurrentUnit();

        var criticalLabel = Ext.create('Ext.form.Label', {
            x: 225,
            y: 39,
            width: 80,
            style: 'text-align:right;',
            text: common.Util.CTR('Critical')
        });

        this.criticalEdit = Ext.create('Ext.form.field.Text', {
            x: 315,
            y: 37,
            width: 140,
            enforceMaxLength : true,
            value: '0'
        });

        this.criticalUnit = Ext.create('Ext.form.Label', {
            x: 405,
            y: 39,
            width: 80,
            style: 'text-align:right;',
            text: unit
        });

        alertSettingCon.add(criticalLabel, this.criticalEdit, this.criticalUnit);
    },

    smsScheduleLayout: function(alertSettingCon) {
        var smsScheduleLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 66,
            width: 82,
            style: 'text-align:right;',
            text : common.Util.CTR('SMS Schedule')
        });

        this.smsScheduleEdit = Ext.create('Ext.form.field.Text', {
            x: 90,
            y: 64,
            width: 140,
            readOnly: true
        });

        var SMSButton = Ext.create('Ext.button.Button', {
            text: '...',
            x: 235,
            y: 64,
            width: 25,
            cls: 'x-btn-config-default',
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    var smsForm = Ext.create('config.config_alert_smsschedulemgr');
                    smsForm.init(this);
                }.bind(this)
            }
        });

        var SMSClearButton = Ext.create('Ext.button.Button', {
            text: 'Clear SMS',
            x: 260,
            y: 64,
            width: 75,
            cls: 'x-btn-config-default',
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    this.smsScheduleEdit.setValue('');
                }.bind(this)
            }
        });

        alertSettingCon.add(smsScheduleLabel, this.smsScheduleEdit, SMSButton, SMSClearButton);
    },

    createScopePanel: function() {
        this.scopePanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '0 4 4 4',
            padding: '1 1 1 1',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var scopeTitleCon = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            style: { background: '#dddddd' }
        });

        var scopeTitle = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            text : common.Util.TR('Scope Settings')
        });

        scopeTitleCon.add(scopeTitle);

        var scopeSettingCon = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: '100%',
            flex: 1,
            border: false,
            style: { background: '#eeeeee' }
        });

        this.scopeTypeComboBoxLayout(scopeSettingCon);

        if (cfg.repository === 'MSSQL' && cfg.alert.sltMode === 'Agent') {
            this.exceptionComboBoxLayout(scopeSettingCon);
        }

        this.scopePanel.add(scopeTitleCon, scopeSettingCon);
    },

    scopeTypeComboBoxLayout: function(scopeSettingCon) {
        var typeLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 80,
            style: 'text-align:right;',
            text : common.Util.CTR('Type')
        });

        this.scopeTypeComboBox = Ext.create('Exem.ComboBox', {
            x       : 90,
            y       : 10,
            width   : 140,
            store   : Ext.create('Exem.Store'),
            editable: false,
            cls     : 'config_tab'
        });

        if (cfg.alert.sltMode === 'Agent') {
            this.scopeTypeComboBox.addItem('TXN_NAME', common.Util.CTR('Transaction'));
            this.scopeTypeComboBox.addItem('BUSINESS_NAME', common.Util.CTR('Business Name'));
        } else if (cfg.alert.sltMode === 'DB') {
            switch (cfg.alert.sltType) {
                case 'ORACLE' :
                    this.scopeTypeComboBox.addItem('SCHEMA' , common.Util.CTR('SCHEMA') );
                    this.scopeTypeComboBox.addItem('PROGRAM', common.Util.CTR('PROGRAM'));
                    this.scopeTypeComboBox.addItem('MODULE' , common.Util.CTR('MODULE'));
                    break;
                case 'DB2' :
                    this.scopeTypeComboBox.addItem('PRIMARY AUTH ID', common.Util.CTR('PRIMARY AUTH ID'));
                    this.scopeTypeComboBox.addItem('EXECUTION ID'   , common.Util.CTR('EXECUTION ID')   );
                    this.scopeTypeComboBox.addItem('APPL ID'        , common.Util.CTR('APPL ID')        );
                    break;
                default :
                    break;
            }
        } else if (cfg.alert.sltMode === 'WS') {
            this.scopeTypeComboBox.addItem('TXN_NAME', common.Util.CTR('Transaction'));
        } else if (cfg.alert.sltMode === 'TP' || cfg.alert.sltMode === 'APIM') {
            this.scopeTypeComboBox.addItem('TX_CODE', common.Util.CTR('TX Code'));
            this.scopeTypeComboBox.addItem('TXN_NAME', common.Util.CTR('Transaction'));
        }

        this.scopeValueEdit = Ext.create('Ext.form.field.Text', {
            x: 235,
            y: 10,
            width: 230,
            value: '%'
        });

        scopeSettingCon.add(typeLabel, this.scopeTypeComboBox, this.scopeValueEdit);
    },

    exceptionComboBoxLayout: function(scopeSettingCon) {
        var msTypeLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 39,
            width: 80,
            style: 'text-align:right;',
            text : common.Util.CTR('Type')
        });

        this.exceptionTypeComboBox = Ext.create('Exem.ComboBox', {
            x: 90,
            y: 37,
            width: 140,
            store: Ext.create('Exem.Store'),
            editable: false,
            cls: 'config_tab'
        });

        this.exceptionTypeComboBox.addItem('EXCEPTION', common.Util.CTR('EXCEPTION'));
        this.exceptionTypeComboBox.selectRow(0);

        this.exceptionValueEdit = Ext.create('Ext.form.field.Text', {
            x: 235,
            y: 37,
            width: 230,
            value: '%',
            disabled: true
        });

        scopeSettingCon.add(msTypeLabel, this.exceptionTypeComboBox, this.exceptionValueEdit);
    },

    createButtonCon: function() {
        this.buttonCon = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 25,
            border: false,
            style: { background: '#f5f5f5' }
        });

        var OKButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('OK'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    this.save();
                }.bind(this)
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

        this.buttonCon.add( OKButton, this.CancelButton );
    },

    initDataSetting: function() {
        var selectGrid, gridRowData;

        if (this.mode === 'Add') {
            this.statNameComboBox.selectRow(0);
            this.scopeTypeComboBox.selectRow(0);
        } else {
            selectGrid = this.parentSelectGrid();
            gridRowData = selectGrid.getSelectedRow()[0].data;

            this.statNameComboBox.selectByName(common.Util.CTR(gridRowData.stat_name));
            this.warningEdit.setValue(gridRowData.warning);
            this.criticalEdit.setValue(gridRowData.critical);
            this.smsScheduleEdit.setValue(gridRowData.sms);
            this.scopeTypeComboBox.setValue(common.Util.CTR(gridRowData.scope_type));
            this.scopeValueEdit.setValue(gridRowData.scope_value);
            if (cfg.repository === 'MSSQL') {
                this.exceptionTypeComboBox.setValue(gridRowData.exception_type);
                this.exceptionValueEdit.setValue(gridRowData.exception_value);
            }
        }
    },

    getCurrentUnit: function() {
        var unit;

        if (cfg.alert.sltMode === 'TP') {
            unit = '(ms)';
        } else if (cfg.alert.sltMode === 'APIM') {
            unit = '(' + decodeURI('%C2%B5') + 's)';
        } else if (cfg.alert.sltMode === 'WS') {
            unit = '(sec)';
        } else {
            unit = '';
        }

        return unit;
    },

    statNameChange: function(newValue) {
        if (cfg.alert.sltMode === 'Agent') {
            if (newValue === 'Failure Count') {
                this.exceptionTypeComboBox.setDisabled(false);
                this.exceptionValueEdit.setDisabled(false);
            } else {
                if (this.exceptionTypeComboBox) {
                    this.exceptionTypeComboBox.setDisabled(true);
                    this.exceptionValueEdit.setDisabled(true);
                }
            }
        }

        if (cfg.alert.sltMode === 'Agent' || cfg.alert.sltMode === 'DB' || cfg.alert.sltMode === 'WS') {
            if (newValue === 'Elapsed Time') {
                this.warningUnit.setText('(sec)');
                this.criticalUnit.setText('(sec)');
            } else {
                this.warningUnit.setText('');
                this.criticalUnit.setText('');
            }
        }
    },

    valueCheck : function() {
        var warning = this.warningEdit.getValue(),
            critical = this.criticalEdit.getValue();

        // statName
        if (!this.statNameComboBox.getValue()) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select stat condition'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // type
        if (!this.scopeTypeComboBox.getValue()) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a type.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // WARNING
        if (!this.warningEdit.getValue()) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            this.warningEdit.focus();
            return false;
        }

        // CRITICAL
        if (!this.criticalEdit.getValue()) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            this.criticalEdit.focus();
            return false;
        }

        // WARNING VALUE 와 CRITICAL VALUE 값이 같은 경우
        if (+warning === +critical) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Warning values and severity values should not be the same.'));
            return false;
        }

        if (+warning > +critical) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Warning value is greater than critical value.'));
            return false;
        }

        return true;
    },

    save: function() {
        var name = cfg.alert.sltExistSub ? cfg.alert.sltName : cfg.alert.sltId,
            alertType = 'Session Alert',
            alertResourceName = null,
            data, serverType,  selectGrid, gridRowData;

        if (!this.valueCheck()) {
            return;
        }

        if (cfg.alert.sltMode === 'Agent') {
            serverType = 'WAS';
        } else if (cfg.alert.sltMode === 'DB') {
            serverType = cfg.alert.sltType;
        } else if (cfg.alert.sltMode === 'WS') {
            serverType = 'WEBSERVER';
        } else {
            serverType = cfg.alert.sltMode;
        }

        if (this.mode === 'Edit') {
            selectGrid = this.parentSelectGrid();
            gridRowData = selectGrid.getSelectedRow()[0].data;
            alertResourceName = gridRowData.alert_name_en;
        }

        config.ConfigEnv.group_flag = cfg.alert.sltExistSub;

        data = {
            self: this,
            name: name,
            serverType: serverType,
            alertType: alertType,
            alertResourceName: this.statNameComboBox.getValue() + ':' + this.scopeTypeComboBox.getValue() + ':' + this.scopeValueEdit.getValue()
        };

        if (!this.saving) {
            this.saving = true;
            config.ConfigEnv.delete_config(name, serverType, alertType, alertResourceName, this.sessionDelete, data);
        }
    },

    sessionDelete : function() {
        var data = this.set_value,
            self = data.self;

        config.ConfigEnv.insert_config( data.name, data.serverType, data.alertType, data.alertResourceName, self.smsScheduleEdit.getValue());
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'CRITICAL_VALUE' , self.criticalEdit.getValue() );
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'WARNING_VALUE'  , self.warningEdit.getValue() );
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'SCOPE_TYPE'     , self.scopeTypeComboBox.getValue() );
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'SCOPE_VALUE'    , self.scopeValueEdit.getValue() );
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'STAT_NAME'      , self.statNameComboBox.getValue() );

        setTimeout(function() {
            self.parentRefresh();
            self.close();
            self.saving = false;
        }, 100);
    },

    setSMSScheduleName: function(sms) {
        this.smsScheduleEdit.setValue(sms);
    }
});
