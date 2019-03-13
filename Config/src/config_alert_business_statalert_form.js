Ext.define('config.config_alert_business_statalert_form', {
    sql: {
        bizAlertSetInsert       : 'IMXConfig_Business_Alert_Set_Insert.sql',
        bizAlertTagValueInsert  : 'IMXConfig_Business_Alert_Tag_Value_Insert.sql',
        bizAlertDelete          : 'IMXConfig_Business_Alert_Delete.sql'
    },

    typeItems: {
        Business: {
            bizStatList: [
                'TPS',
                'Response Time (AVG)',
                'Active Transactions'
            ]
        }
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(mode) {
        var alertWindow, settingPanel, buttonPanel;

        this.saving = false;
        this.mode = mode;

        alertWindow = Ext.create('Exem.Window', {
            layout      : 'vbox',
            maximizable : false,
            width       : 500,
            height      : 220,
            resizable   : false,
            title       : common.Util.TR('Stat Alert Configuration'),
            bodyStyle   : { background: '#f5f5f5' },
            closeAction : 'destroy'
        });

        settingPanel = this.createSettingPanel();
        buttonPanel = this.createButtonPanel();

        alertWindow.add(settingPanel, buttonPanel);
        alertWindow.show();

        if (this.mode === 'Add') {
            this.typeComboBox.selectRow(0);
            this.statListComboBox.selectRow(0);
        } else {
            this.typeComboBox.setValue(this.stat_type);
            this.statListComboBox.setValue(this.alert_name);
            this.comparisonComboBox.setValue(this.comparison);
            this.repeatEdit.setValue(this.repeat);
            this.warningEdit.setValue(this.warning_value);
            this.criticalEdit.setValue(this.critical_value);
            this.smsScheduleEdit.setValue(this.sms_schedule);
            this.delayTimeEdit.setValue(this.delay_time);

            this.typeComboBox.setDisabled(true);
            this.statListComboBox.setDisabled(true);
        }
    },

    createSettingPanel: function() {
        var settingPanel,
            typeLabel,
            comparisonLabel, warningLabel,
            repeatLabel, criticalLabel,
            smsScheduleLabel, SMSButton, SMSClearButton,
            delayTimeLabel, tierLabel;

        settingPanel = Ext.create('Ext.panel.Panel', {
            layout      : 'absolute',
            cls         : 'x-config-used-round-panel',
            width       : '100%',
            height      : 150,
            margin      : '4 4 4 4',
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });

        typeLabel = Ext.create('Ext.form.Label', {
            x           : 0,
            y           : 12,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Type'))
        });

        this.typeComboBox = Ext.create('Exem.ComboBox', {
            x           : 90,
            y           : 10,
            width       : 120,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            cls         : 'config_tab',
            listeners   : {
                change : function(_this, newValue) {
                    if (this.mode === 'Edit') {
                        if (this.stat_type === newValue) {
                            this.typeChange(newValue);
                        }
                    } else if (this.mode === 'Add') {
                        if (!newValue) {
                            return;
                        }
                        this.typeChange(newValue);
                    }
                }.bind(this)
            }
        });

        this.typeComboBox.addItem('BUSINESS STAT', 'BUSINESS STAT');

        this.statListComboBox = Ext.create('Exem.ComboBox', {
            x           : 217,
            y           : 10,
            width       : 243,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            cls         : 'config_tab',
            listeners   : {
                change : function(me, newValue) {
                    if (newValue === 'Response Time (AVG)') {
                        this.warningUnit.show();
                        this.criticalUnit.show();
                    } else {
                        this.warningUnit.hide();
                        this.criticalUnit.hide();
                    }
                }.bind(this)
            }
        });

        comparisonLabel = Ext.create('Ext.form.Label', {
            x           : 0,
            y           : 39,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Comparison'))
        });

        this.comparisonComboBox = Ext.create('Exem.ComboBox', {
            x           : 90,
            y           : 37,
            width       : 120,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            cls         : 'config_tab'
        });
        this.comparisonComboBox.addItem('<=', '<=');
        this.comparisonComboBox.addItem('>=', '>=');
        this.comparisonComboBox.selectRow(0);

        repeatLabel = Ext.create('Ext.form.Label', {
            x           : 0,
            y           : 66,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Repeat'))
        });

        this.repeatEdit = Ext.create('Ext.form.field.Text', {
            x           : 90,
            y           : 64,
            width       : 120,
            maxLength   : 3,
            value       : '3',
            enforceMaxLength : true
        });

        warningLabel = Ext.create('Ext.form.Label', {
            x           : 250 - 20,
            y           : 39,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Warning'))
        });

        this.warningEdit = Ext.create('Ext.form.field.Text', {
            x           : 340 - 20,
            y           : 37,
            width       : 120,
            value       : '0',
            enforceMaxLength : true
        });

        this.warningUnit = Ext.create('Ext.form.Label', {
            x: 432,
            y: 40,
            width: 40,
            style: 'text-align:right;',
            text: '(ms)'
        });

        criticalLabel = Ext.create('Ext.form.Label', {
            x           : 250 - 20,
            y           : 66,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Critical'))
        });

        this.criticalEdit = Ext.create('Ext.form.field.Text', {
            x           : 340 - 20,
            y           : 64,
            width       : 120,
            value       : '0',
            enforceMaxLength : true
        });

        this.criticalUnit = Ext.create('Ext.form.Label', {
            x: 432,
            y: 68,
            width: 40,
            style: 'text-align:right;',
            text: '(ms)'
        });

        delayTimeLabel = Ext.create('Ext.form.Label', {
            x           : 0,
            y           : 120,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Delay Time'))
        });

        this.delayTimeEdit = Ext.create('Ext.form.field.Number',{
            x           : 90,
            y           : 118,
            width       : 120,
            minValue    : 0,
            maxLength   : 3,
            hideTrigger : true,
            allowBlank  : false,
            value       : 0,
            enforceMaxLength : true
        });

        smsScheduleLabel = Ext.create('Ext.form.Label', {
            x           : 0,
            y           : 93,
            width       : 82,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('SMS Schedule'))
        });

        this.smsScheduleEdit = Ext.create('Ext.form.field.Text', {
            x           : 90,
            y           : 91,
            width       : 120,
            readOnly    : true
        });

        SMSButton = Ext.create('Ext.button.Button', {
            text        : '...',
            x           : 215,
            y           : 91,
            width       : 25,
            cls         : 'x-btn-config-default',
            margin      : '0 2 0 0',
            listeners   : {
                click : function() {
                    var smsForm = Ext.create('config.config_alert_smsschedulemgr');
                    smsForm.init(this);
                }.bind(this)
            }
        });

        SMSClearButton = Ext.create('Ext.button.Button', {
            text        : 'Clear SMS',
            x           : 246,
            y           : 91,
            width       : 75,
            cls         : 'x-btn-config-default',
            margin      : '0 2 0 0',
            listeners   : {
                click : function() {
                    this.smsScheduleEdit.setValue('');
                }.bind(this)
            }
        });

        tierLabel = Ext.create('Ext.form.Label', {
            x           : 250,
            y           : 120,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Tier'))
        });

        this.tierListComboBox = Ext.create('Exem.ComboBox', {
            x           : 340,
            y           : 118,
            width       : 120,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            cls         : 'config_tab'
        });

        this.setTierList(this.tierListComboBox);

        settingPanel.add(typeLabel, this.typeComboBox, this.statListComboBox,
            comparisonLabel, this.comparisonComboBox, warningLabel, this.warningEdit, this.warningUnit,
            repeatLabel, this.repeatEdit, criticalLabel, this.criticalEdit, this.criticalUnit,
            smsScheduleLabel, this.smsScheduleEdit, SMSButton, SMSClearButton,
            delayTimeLabel, this.delayTimeEdit, tierLabel, this.tierListComboBox);

        return settingPanel;
    },

    setTierList: function(comboBox) {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Group_List_Add_Tier_Id.sql';

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            var ix, ixLen, tierId, tierName;

            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                tierId = data.rows[ix][2];
                tierName = data.rows[ix][0];
                comboBox.addItem(tierId, tierName);
            }

            if (this.mode === 'Add') {
                comboBox.selectRow(0);
            } else {
                comboBox.setValue(this.tier_id);
            }
        }, this);
    },


    createButtonPanel: function() {
        var buttonPanel = Ext.create('Ext.panel.Panel', {
            layout      : {
                type        : 'hbox',
                pack        : 'center',
                align       : 'middle'
            },
            width       : '100%',
            height      : 25,
            border      : false,
            bodyStyle   : { background: '#f5f5f5' }
        });

        var OKButton = Ext.create('Ext.button.Button', {
            text        : common.Util.TR('OK'),
            cls         : 'x-btn-config-default',
            width       : 70,
            margin      : '0 2 0 0',
            listeners   : {
                click : function() {
                    if (!this.saving) {
                        this.saving = true;
                        this.save();
                    }
                }.bind(this)
            }
        });

        this.cancelButton = Ext.create('Ext.button.Button', {
            text        : common.Util.TR('Cancel'),
            cls         : 'x-btn-config-default',
            width       : 70,
            margin      : '0 0 0 2',
            listeners   : {
                click : function() {
                    this.up('.window').close();
                }
            }
        });

        buttonPanel.add(OKButton, this.cancelButton);

        return buttonPanel;
    },

    valueCheck : function() {
        var warning = parseInt(this.warningEdit.getValue()),
            critical = parseInt(this.criticalEdit.getValue());

        // Type
        if (!this.typeComboBox.getValue()) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a type.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // Stat
        if (!this.statListComboBox.getValue()) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select stat condition'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // comparison
        if (!this.comparisonComboBox.getValue()) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a comparison.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // delayTime
        if (this.delayTimeEdit.getValue() === null) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            this.delayTimeEdit.focus();
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
        if (warning === critical) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Warning values and severity values should not be the same.'));
            return false;
        }

        // WARNING VALUE 는 CRITICAL VALUE 보다 클 수 없다.
        if (this.comparisonComboBox.getValue() === '>=') {
            if (warning > critical) {
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Warning value is greater than critical value.'));
                return false;
            }
        } else {
            if (warning < critical) {
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Critical value is greater than warning value.'));
                return false;
            }
        }

        return true;
    },

    save: function() {
        var dataSet = {};

        if (!this.valueCheck()) {
            this.saving = false;
            return;
        }

        dataSet.sql_file = 'IMXConfig_Business_Alert_Delete.sql';

        dataSet.bind = [{
            name    : 'business_id',
            value   : cfg.alert.sltId,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'alert_type',
            value   : 'Stat Alert',
            type    : SQLBindType.STRING
        }, {
            name    : 'alert_resource_name',
            value   : this.statListComboBox.getValue(),
            type    : SQLBindType.STRING
        }, {
            name    : 'tier_id',
            value   : (this.mode === 'Add') ? this.tierListComboBox.getValue() : this.tier_id,
            type    : SQLBindType.INTEGER
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            this.bizAlertSetInsert();
        }, this);
    },

    bizAlertSetInsert: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Alert_Set_Insert.sql';

        dataSet.bind = [{
            name    : 'business_id',
            value   : cfg.alert.sltId,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'tier_id',
            value   : this.tierListComboBox.getValue(),
            type    : SQLBindType.INTEGER
        }, {
            name    : 'business_level',
            value   : cfg.alert.sltDepth,
            type    : SQLBindType.INTEGER
        }, {
            name    : 'alert_type',
            value   : 'Stat Alert',
            type    : SQLBindType.STRING
        }, {
            name    : 'alert_resource_name',
            value   : this.statListComboBox.getValue(),
            type    : SQLBindType.STRING
        }, {
            name    : 'sms',
            value   : this.smsScheduleEdit.getValue(),
            type    : SQLBindType.STRING
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            this.bizAlertTagValueInsert();
        }, this);
    },

    bizAlertTagValueInsert: function() {
        var ix, ixLen, tagValue,
            tagNameList = ['STAT_TYPE','COMPARISON','REPEAT','WARNING_VALUE','CRITICAL_VALUE','DELAY_TIME'],
            dataSet = {};

        this.startCount = 0;

        for (ix = 0, ixLen = tagNameList.length; ix < ixLen; ix++) {

            switch (tagNameList[ix]) {
                case 'STAT_TYPE':
                    tagValue = this.typeComboBox.getValue();
                    break;
                case 'COMPARISON':
                    tagValue = this.comparisonComboBox.getValue();
                    break;
                case 'REPEAT':
                    tagValue = (this.repeatEdit.getValue() === '') ? 0 : this.repeatEdit.getValue();
                    break;
                case 'WARNING_VALUE':
                    tagValue = this.warningEdit.getValue();
                    break;
                case 'CRITICAL_VALUE':
                    tagValue = this.criticalEdit.getValue();
                    break;
                case 'DELAY_TIME':
                    tagValue = this.delayTimeEdit.getValue();
                    break;
                default:
                    break;
            }

            dataSet.sql_file = 'IMXConfig_Business_Alert_Tag_Value_Insert.sql';

            dataSet.bind = [{
                name    : 'business_id',
                value   : cfg.alert.sltId,
                type    : SQLBindType.INTEGER
            }, {
                name    : 'tier_id',
                value   : this.tierListComboBox.getValue(),
                type    : SQLBindType.INTEGER
            }, {
                name    : 'alert_type',
                value   : 'Stat Alert',
                type    : SQLBindType.STRING
            }, {
                name    : 'alert_resource_name',
                value   : this.statListComboBox.getValue(),
                type    : SQLBindType.STRING
            }, {
                name    : 'alert_tag_name',
                value   : tagNameList[ix],
                type    : SQLBindType.STRING
            }, {
                name    : 'alert_tag_value',
                value   : tagValue,
                type    : SQLBindType.STRING
            }];

            if (common.Util.isMultiRepository()) {
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            this.insertResult(dataSet, tagNameList.length);
        }
    },

    insertResult: function(dataSet, endCount) {
        WS.SQLExec(dataSet, function() {
            this.startCount++;
            if (this.startCount === endCount) {
                this.parent.onRefresh();
                this.cancelButton.fireHandler('click');
                this.saving = false;
            }
        },this);
    },

    typeChange: function(_newValue) {
        var ix, data;

        if (_newValue === 'BUSINESS STAT') {
            data = this.typeItems.Business.bizStatList;

            this.statListComboBox.removeAll();

            for ( ix = data.length; ix--;) {
                this.statListComboBox.addItem(data[ix], data[ix]);
            }
            this.statListComboBox.selectRow(0);
        }
    },

    setSMSScheduleName: function(_sms_) {
        this.smsScheduleEdit.setValue(_sms_);
    }
});
