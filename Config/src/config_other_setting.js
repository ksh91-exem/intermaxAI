Ext.define('config.config_other_setting', {
    extend  : 'Exem.Form',
    layout  : {type: 'vbox', align: 'stretch'},
    width   : '100%',
    height  : '100%',

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        this.target = target;

        this.initProperty();

        this.initLayout();
    },

    initProperty: function() {
        if (Comm.web_env_info['ACTTIME_LEVEL(MS)']) {
            this.warningValue  = Comm.web_env_info['ACTTIME_LEVEL(MS)'].split(',')[0];
            this.criticalValue = Comm.web_env_info['ACTTIME_LEVEL(MS)'].split(',')[1];
        } else if (Comm.web_env_info['WEB_ACTTIME_LEVEL(MS)']) {
            this.warningValue  = Comm.web_env_info['WEB_ACTTIME_LEVEL(MS)'].split(',')[0];
            this.criticalValue = Comm.web_env_info['WEB_ACTTIME_LEVEL(MS)'].split(',')[1];
        } else if (Comm.web_env_info['APIM_ACTTIME_LEVEL(US)']) {
            this.warningValue  = Comm.web_env_info['APIM_ACTTIME_LEVEL(US)'].split(',')[0];
            this.criticalValue = Comm.web_env_info['APIM_ACTTIME_LEVEL(US)'].split(',')[1];
        } else {
            this.warningValue = 3000;
            this.criticalValue = 7000;
        }
    },

    initLayout: function() {
        var baseCon = Ext.create('Ext.container.Container', {
            layout  : 'border',
            width   : '100%',
            height  : '100%',
            flex    : 1,
            border  : false,
            style: { background: '#ffffff' }
        });

        this.createColorCriteriaPanel();

        this.createColorDisplayPanel();

        baseCon.add(this.colorCriteriaPanel, this.colorDisplayPanel);
        this.target.add(baseCon);
    },

    createColorCriteriaPanel: function() {
        this.colorCriteriaPanel = Ext.create('Ext.panel.Panel', {
            layout  : 'vbox',
            cls     : 'x-config-used-round-panel',
            region  : 'north',
            width   : '100%',
            height  : 157,
            border  : false,
            split   : true,
            margin  : '3 6 3 6',
            padding : '1 1 1 1',
            bodyStyle : {background: '#f1f1f1'},
            items   : [{
                xtype   : 'container',
                html    : common.Util.usedFont(9, common.Util.TR('Activity Monitor Color Indication Criteria')),
                width   : '100%',
                padding : '3 0 0 10',
                height  : 25,
                style   : {background: '#d1d1d1'}
            }, {
                xtype   : 'container',
                itemId  : 'colorCriteriaPanelBody',
                layout  : 'hbox',
                width   : '100%',
                flex    : 1
            }]
        });

        this.colorCriteriaSetLayout(this.colorCriteriaPanel.getComponent('colorCriteriaPanelBody'));
    },

    createColorDisplayPanel: function() {
        this.colorDisplayPanel = Ext.create('Ext.panel.Panel', {
            layout  : 'vbox',
            cls     : 'x-config-used-round-panel',
            region  : 'north',
            width   : '100%',
            height  : 80,
            border  : false,
            split   : true,
            margin  : '3 6 3 6',
            padding : '1 1 1 1',
            bodyStyle : {background: '#f1f1f1'},
            items   : [{
                xtype   : 'container',
                layout  : 'absolute',
                html    : common.Util.usedFont(9, common.Util.TR('Active Transaction Elapse Time Color Display')),
                width   : '100%',
                padding : '3 0 0 10',
                height  : 25,
                style   : {background: '#d1d1d1'}
            }, {
                xtype   : 'container',
                itemId  : 'colorDisplayPanelBody',
                layout  : 'hbox',
                width   : '100%',
                flex    : 1,
                style   : {background: '#ffffff'}
            }]
        });

        this.colorDisplaySetLayout(this.colorDisplayPanel.getComponent('colorDisplayPanelBody'));
    },

    colorCriteriaSetLayout: function(target) {
        target.add({
            xtype   : 'container',
            layout  : 'absolute',
            itemId  : 'colorCriteriaSettingTitle',
            width   : 200,
            height  : '100%',
            style   : { background: '#eeeeee' }
        }, {
            xtype   : 'container',
            layout  : 'absolute',
            itemId  : 'colorCriteriaSettingBody',
            width   : (Comm.Lang === 'ko' || window.nation === 'ko') ? 250 : 275,
            height  : '100%',
            style   : { background: '#ffffff' }
        }, {
            xtype   : 'container',
            layout  : 'absolute',
            itemId  : 'colorCriteriaSettingDescription',
            flex    : 1,
            height  : '100%',
            style   : { background: '#ffffff' }
        });

        this.setTitleArea(target.getComponent('colorCriteriaSettingTitle'));

        this.setBodyArea(target.getComponent('colorCriteriaSettingBody'));

        this.setDescriptionAreaArea(target.getComponent('colorCriteriaSettingDescription'));
    },

    setTitleArea: function(titleArea) {
        titleArea.add({
            x       : 0,
            y       : 10,
            xtype   : 'label',
            width   : 180,
            style   : 'text-align:right;',
            html    : common.Util.usedFont(9, common.Util.TR('Monitoring Type'))
        }, {
            x       : 0,
            y       : 37,
            xtype   : 'label',
            width   : 180,
            style   : 'text-align:right;',
            html    : common.Util.usedFont(9, common.Util.TR('Warning'))
        }, {
            x       : 0,
            y       : 64,
            xtype   : 'label',
            width   : 180,
            style   : 'text-align:right;',
            html    : common.Util.usedFont(9, common.Util.TR('Critical'))
        });
    },

    setBodyArea: function(bodyArea) {
        this.createMonitorTypeCombo();

        this.createWarningField();

        this.createCriticalField();

        this.createSaveButton();

        bodyArea.add(this.monitorTypeCombo, this.warningField, this.criticalField, this.saveButton);
    },

    createMonitorTypeCombo: function() {
        this.monitorTypeCombo = Ext.create('Exem.ComboBox', {
            store: Ext.create('Exem.Store'),
            x       : 15,
            y       : 8,
            width   : 118,
            listeners   : {
                change: function(me) {
                    if (me.getValue() === 'was') {
                        this.typeComboChange(
                            'was',
                            Comm.web_env_info['ACTTIME_LEVEL(MS)'],
                            Comm.RTComm.getBooleanValue(Comm.web_env_info['useActiveTimeColor'])
                        );
                    } else if (me.getValue() === 'web') {
                        this.typeComboChange(
                            'web',
                            Comm.web_env_info['WEB_ACTTIME_LEVEL(MS)'],
                            Comm.RTComm.getBooleanValue(Comm.web_env_info['WEBuseActiveTimeColor'])
                        );
                    } else if (me.getValue() === 'cd') {
                        this.typeComboChange(
                            'cd',
                            Comm.web_env_info['APIM_ACTTIME_LEVEL(US)'],
                            Comm.RTComm.getBooleanValue(Comm.web_env_info['APIMuseActiveTimeColor'])
                        );
                    }

                    this.warningNumber.setValue(this.warningValue);
                    this.criticalNumber.setValue(this.criticalValue);

                    this.validateWarning(+this.criticalValue, +this.warningValue, me.getValue());
                }.bind(this)
            }
        });

        this.monitorTypeCombo.addItem('cd' , common.Util.TR('C Daemon'));
        this.monitorTypeCombo.addItem('web', common.Util.TR('WEB'));
        this.monitorTypeCombo.addItem('was', common.Util.TR('WAS'));
    },

    createWarningField: function() {
        this.warningNumber = Ext.create('Ext.form.field.Number',{
            width       : 118,
            minValue    : 1,
            maxLength   : 5,
            hideTrigger : true,
            allowBlank  : false,
            value       : this.warningValue,
            enforceMaxLength : true,
            listeners   : {
                blur: function(me) {
                    if (me.value <= 0) {
                        me.setValue(1);
                    } else if (me.value >= 100000) {
                        me.setValue(99999);
                    }

                    this.validateWarning(this.criticalNumber.getValue(), me.value);
                }.bind(this)
            }
        });

        this.warningField = Ext.create('Ext.form.FieldSet',{
            x       : 5,
            y       : 35,
            border  : false,
            items   : [{
                xtype   : 'fieldcontainer',
                layout  : 'hbox',
                items   : [this.warningNumber,{
                    xtype   : 'label',
                    margin  : '4 0 0 10',
                    width   : (Comm.Lang === 'ko' || window.nation === 'ko') ? 100 : 130,
                    id      : 'warningMoreText',
                    text    : common.Util.TR('More than millisecond')
                }]
            }]
        });
    },

    createCriticalField: function() {
        this.criticalNumber = Ext.create('Ext.form.field.Number',{
            width       : 118,
            minValue    : 1,
            maxLength   : 5,
            hideTrigger : true,
            allowBlank  : false,
            value       : this.criticalValue,
            enforceMaxLength : true,
            listeners   : {
                blur: function(me) {
                    if (me.value <= 0) {
                        me.setValue(1);
                    } else if (me.value >= 100000) {
                        me.setValue(99999);
                    }

                    this.validateWarning(me.value, this.warningNumber.getValue());
                }.bind(this)
            }
        });

        this.criticalField = Ext.create('Ext.form.FieldSet',{
            x       : 5,
            y       : 63,
            border  : false,
            items   : [{
                xtype   : 'fieldcontainer',
                layout  : 'hbox',
                items   : [this.criticalNumber,{
                    xtype   : 'label',
                    margin  : '4 0 0 10',
                    width   : (Comm.Lang === 'ko' || window.nation === 'ko') ? 100 : 130,
                    id      : 'criticalMoreText',
                    text    : common.Util.TR('More than millisecond')
                }]
            }]
        });
    },

    createSaveButton: function() {
        this.saveButton = Ext.create('Exem.Button', {
            x       : 13,
            y       : 89,
            width   : 118,
            height  : 22,
            text    : common.Util.usedFont(9, common.Util.TR('Apply')),
            cls     : 'x-btn-config-default',
            handler: function() {
                Ext.Msg.confirm(common.Util.TR('Message'), common.Util.TR('Do you want to change?'), function(choose) {
                    if (choose === 'yes') {
                        if (this.warningNumber.getValue() < this.criticalNumber.getValue()) {
                            if (this.monitorTypeCombo.getValue() === 'was') {
                                common.WebEnv.SaveByUserID('ACTTIME_LEVEL(MS)', this.warningNumber.getValue() + ',' + this.criticalNumber.getValue(), '-1', null);
                            } else if (this.monitorTypeCombo.getValue() === 'web') {
                                common.WebEnv.SaveByUserID('WEB_ACTTIME_LEVEL(MS)', this.warningNumber.getValue() + ',' + this.criticalNumber.getValue(), '-1', null);
                            } else if (this.monitorTypeCombo.getValue() === 'cd') {
                                common.WebEnv.SaveByUserID('APIM_ACTTIME_LEVEL(US)', this.warningNumber.getValue() + ',' + this.criticalNumber.getValue(), '-1', null);
                            }
                            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                        } else {
                            Ext.MessageBox.show({
                                title   : common.Util.TR('Error'),
                                icon    : Ext.MessageBox.ERROR,
                                message : common.Util.TR('Warning value is greater than critical value.'),
                                modal   : true,
                                cls     : 'popup-message',
                                buttons : Ext.Msg.OK
                            });
                        }
                    }
                }.bind(this));
            }
        });
    },

    setDescriptionAreaArea: function(descriptionArea) {
        var normal = Ext.String.format(common.Util.TR('{0} MilliSec and over under {1} MilliSec'), 0, this.warningValue),
            warning = Ext.String.format(common.Util.TR('{0} MilliSec and over under {1} MilliSec'), this.warningValue, this.criticalValue),
            critical = Ext.String.format(common.Util.TR('{0} MilliSec and over'), this.criticalValue);

        var blue = Ext.create('Ext.container.Container', {
            width   : 12,
            cls     : 'circle-blue',
            margin  : '10 0 0 0'
        });

        var yellow = Ext.create('Ext.container.Container', {
            width   : 12,
            cls     : 'circle-yellow',
            margin  : '5 0 0 0'
        });

        var red = Ext.create('Ext.container.Container', {
            width   : 12,
            cls     : 'circle-red',
            margin  : '5 0 0 0'
        });

        this.descriptionField = Ext.create('Ext.form.FieldSet',{
            x       : 5,
            y       : 5,
            width   : (Comm.Lang === 'ko' || window.nation === 'ko') ? 270 : 350,
            height  : 90,
            layout  : 'vbox',
            items: [{
                xtype   : 'fieldcontainer',
                layout  : 'hbox',
                items   : [blue,{
                    xtype   : 'label',
                    margin  : '10 0 0 10',
                    width   : (Comm.Lang === 'ko' || window.nation === 'ko') ? 220 : 300,
                    id      : 'normalText',
                    text    : common.Util.TR('Normal') + ' : ' + normal
                }]
            }, {
                xtype   : 'fieldcontainer',
                layout  : 'hbox',
                items   : [yellow,{
                    xtype   : 'label',
                    margin  : '5 0 0 10',
                    width   : (Comm.Lang === 'ko' || window.nation === 'ko') ? 220 : 300,
                    id      : 'warningText',
                    text    : common.Util.TR('Warning') + ' : ' + warning
                }]
            }, {
                xtype   : 'fieldcontainer',
                layout  : 'hbox',
                items   : [red,{
                    xtype   : 'label',
                    margin  : '5 0 0 10',
                    width   : (Comm.Lang === 'ko' || window.nation === 'ko') ? 220 : 300,
                    id      : 'criticalText',
                    text    : common.Util.TR('Critical') + ' : ' + critical
                }]
            }]
        });

        descriptionArea.add(this.descriptionField);
    },

    colorDisplaySetLayout: function(target) {
        var titleArea = Ext.create('Ext.container.Container', {
            layout  : 'absolute',
            width   : 200,
            height  : '100%',
            style   : { background: '#eeeeee' },
            items   : [{
                x       : 0,
                y       : 15,
                xtype   : 'label',
                width   : 180,
                style   : 'text-align:right;',
                html    : common.Util.usedFont(9, common.Util.TR('Use Status'))
            }]
        });

        var bodyArea = Ext.create('Ext.container.Container', {
            layout  : 'absolute',
            height  : '100%',
            style   : { background: '#ffffff' }
        });

        this.toggleAllOnOff = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x       : 15,
            y       : 15,
            width   : 100,
            onText  : common.Util.TR('Apply'),
            offText : common.Util.TR('Unapplied'),
            state   : Comm.RTComm.getBooleanValue(Comm.web_env_info.useActiveTimeColor),
            listeners : {
                change: function(me) {
                    if (this.monitorTypeCombo.getValue() === 'was') {
                        this.toggleChange('useActiveTimeColor', me.getValue());
                    } else if (this.monitorTypeCombo.getValue() === 'web') {
                        this.toggleChange('WEBuseActiveTimeColor', me.getValue());
                    } else if (this.monitorTypeCombo.getValue() === 'cd') {
                        this.toggleChange('APIMuseActiveTimeColor', me.getValue());
                    }
                }.bind(this)
            }
        });

        bodyArea.add(this.toggleAllOnOff);
        target.add(titleArea, bodyArea);
    },

    typeComboChange: function(monitorType, level, isMonitorType) {
        if (monitorType === 'cd') {
            this.warningField.items.items[0].getComponent('warningMoreText').setText(common.Util.TR('More than microsecond'));
            this.criticalField.items.items[0].getComponent('criticalMoreText').setText(common.Util.TR('More than microsecond'));
        } else {
            this.warningField.items.items[0].getComponent('warningMoreText').setText(common.Util.TR('More than millisecond'));
            this.criticalField.items.items[0].getComponent('criticalMoreText').setText(common.Util.TR('More than millisecond'));
        }

        if (level) {
            this.warningValue  = level.split(',')[0];
            this.criticalValue = level.split(',')[1];
        }

        if (this.toggleAllOnOff.state !== isMonitorType) {
            this.toggleAllOnOff.toggle();
        }
    },

    toggleChange: function(monitorTypeKey, toggleValue) {
        if (this.toggleAllOnOff.state !== Comm.RTComm.getBooleanValue(Comm.web_env_info[monitorTypeKey])) {
            common.WebEnv.Save(monitorTypeKey, toggleValue, null);
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
        }
    },

    validateWarning: function(criticalVal, warningVal, monitorType) {
        var normalText, warningText, criticalText,
            normalTextField, warningTextField, criticalTextField;

        if (criticalVal <= warningVal) {
            Ext.MessageBox.show({
                title   : common.Util.TR('Warning'),
                icon    : Ext.MessageBox.WARNING,
                message : common.Util.TR('Warning value is greater than critical value.'),
                modal   : true,
                cls     : 'popup-message',
                buttons : Ext.Msg.OK
            });
        } else {
            normalTextField     = this.descriptionField.items.items[0].getComponent('normalText');
            warningTextField    = this.descriptionField.items.items[1].getComponent('warningText');
            criticalTextField   = this.descriptionField.items.items[2].getComponent('criticalText');

            if ( monitorType === 'cd' ) {
                normalText   = Ext.String.format(common.Util.TR('{0} MicroSec and over under {1} MicroSec'), 0, warningVal);
                warningText  = Ext.String.format(common.Util.TR('{0} MicroSec and over under {1} MicroSec'), warningVal, criticalVal);
                criticalText = Ext.String.format(common.Util.TR('{0} MicroSec and over'), criticalVal);
            } else {
                normalText   = Ext.String.format(common.Util.TR('{0} MilliSec and over under {1} MilliSec'), 0, warningVal);
                warningText  = Ext.String.format(common.Util.TR('{0} MilliSec and over under {1} MilliSec'), warningVal, criticalVal);
                criticalText = Ext.String.format(common.Util.TR('{0} MilliSec and over'), criticalVal);
            }

            normalTextField.setText(common.Util.TR('Normal') + ' : ' + normalText);
            warningTextField.setText(common.Util.TR('Warning') + ' : ' + warningText);
            criticalTextField.setText(common.Util.TR('Critical') + ' : ' + criticalText);
        }
    }
});
