Ext.define('config.config_alert_exception_form', {
    extend: 'Exem.Window',
    layout: 'vbox',
    maximizable: false,
    width: 500,
    height: 217,
    resizable: false,
    title: common.Util.TR('Exception Alert Configuration'),
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

    initProperty: function(){
        this.saving = false;
    },

    initLayout: function(){
        var settingPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 150,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.levelComboBoxLayout(settingPanel);
        this.txnLayout(settingPanel);
        this.exceptionLayout(settingPanel);
        this.exclusionLayout(settingPanel);
        this.smsScheduleLayout(settingPanel);

        this.createConfirmButton();

        this.add(settingPanel, this.buttonCon);

        this.show();
    },

    levelComboBoxLayout: function(settingPanel){
        var typeLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Type'))
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

        settingPanel.add(typeLabel, this.levelComboBox);
    },

    txnLayout: function(settingPanel){
        var txnNameLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 39,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('Transaction Name'))
        });

        this.txnNameEdit = Ext.create('Ext.form.field.Text', {
            x: 120,
            y: 37,
            width: 340,
            allowBlank: false
        });

        settingPanel.add(txnNameLabel, this.txnNameEdit);
    },

    exceptionLayout: function(settingPanel){
        var exceptionNameLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 66,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('Exception Name'))
        });

        this.exceptionNameEdit = Ext.create('Ext.form.field.Text', {
            x: 120,
            y: 64,
            width: 340,
            allowBlank: false
        });

        settingPanel.add(exceptionNameLabel, this.exceptionNameEdit);
    },

    exclusionLayout: function(settingPanel){
        var exclusionLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 93,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('Exception Name(Exclusion)'))
        });

        this.exclusionEdit = Ext.create('Ext.form.field.Text', {
            x: 120,
            y: 91,
            width: 340
        });

        settingPanel.add(exclusionLabel, this.exclusionEdit);
    },

    smsScheduleLayout: function(settingPanel){
        var smsScheduleLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 120,
            width: 110,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('SMS Schedule'))
        });

        this.smsScheduleEdit = Ext.create('Ext.form.field.Text', {
            x: 120,
            y: 118,
            width: 235,
            readOnly: true
        });

        var SMSButton = Ext.create('Ext.button.Button', {
            text: '...',
            x: 357,
            y: 118,
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
            x: 385,
            y: 118,
            width: 75,
            cls: 'x-btn-config-default',
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    this.smsScheduleEdit.setValue('');
                }.bind(this)
            }
        });

        settingPanel.add(smsScheduleLabel, this.smsScheduleEdit, SMSButton, SMSClearButton);
    },

    createConfirmButton: function(){
        this.buttonCon = Ext.create('Ext.container.Container', {
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

        var cancelButton = Ext.create('Ext.button.Button', {
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

        this.buttonCon.add(OKButton, cancelButton);
    },

    initDataSetting: function(){
        var selectGrid, gridRowData;
        switch (this.mode) {
            case 'Add' :
                this.levelComboBox.selectRow(0);
                break;
            case 'Edit' :
                selectGrid = this.parentSelectGrid();
                gridRowData = selectGrid.getSelectedRow()[0].data;
                this.levelComboBox.setValue(gridRowData.type, true);
                this.txnNameEdit.setValue(gridRowData.txn_name);
                this.exceptionNameEdit.setValue(gridRowData.exception_name);
                this.exclusionEdit.setValue(gridRowData.exclusion_name);
                this.smsScheduleEdit.setValue(gridRowData.sms);
                break;
            default :
                break;
        }
    },

    setSMSScheduleName: function(sms) {
        this.smsScheduleEdit.setValue(sms);
    },

    checkValue: function(){
        var exceptionName = this.exceptionNameEdit.getValue(),
            txnName = this.txnNameEdit.getValue(),
            levelType = this.levelComboBox.getValue(),
            selectGrid = this.parentSelectGrid(),
            ix, ixLen, parentData;

        if (!levelType) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a type.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        if (!exceptionName) {
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.exceptionNameEdit.focus();
            return false;
        }

        if (!txnName) {
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.txnNameEdit.focus();
            return false;
        }

        if (exceptionName === '%%') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You Can not Enter its Value.'));
            this.exceptionNameEdit.focus();
            return false;
        }

        if (txnName === '%%') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You Can not Enter its Value.'));
            this.txnNameEdit.focus();
            return false;
        }

        for ( ix = 0, ixLen = selectGrid.getRowCount(); ix <  ixLen; ix++ ) {
            parentData = selectGrid.getRow(ix).data;

            if ( parentData.exception_name === exceptionName ) {
                if ( selectGrid.getSelectedRow().length && parentData.exception_name === selectGrid.getSelectedRow()[0].data.exception_name ) {
                    continue;
                }
                Ext.Msg.alert('Error', common.Util.TR('The exception name already exists.'));
                return false;
            }
        }

        return true;
    },

    save: function() {
        var exceptionName = this.exceptionNameEdit.getValue(),
            exclusionName = this.exclusionEdit.getValue(),
            txnName = this.txnNameEdit.getValue(),
            selectLevel = this.levelComboBox.getValue(),
            alertType = 'Exception Alert',
            alertResourceName = null,
            name = cfg.alert.sltExistSub ? cfg.alert.sltName : cfg.alert.sltId,
            data, serverType, selectGrid, gridRowData;

        if ( !this.checkValue() ) {
            return;
        }

        if (cfg.alert.sltMode === 'Agent') {
            serverType = 'WAS';
        } else {
            serverType = cfg.alert.sltMode;
        }

        if (this.mode === 'Edit') {
            selectGrid = this.parentSelectGrid();
            gridRowData = selectGrid.getSelectedRow()[0].data;
            alertResourceName = gridRowData.exception_name;
        }

        config.ConfigEnv.group_flag = cfg.alert.sltExistSub;

        data = {
            self: this,
            txnName: txnName,
            level: selectLevel,
            name: name,
            serverType: serverType,
            alertType: alertType,
            alertResourceName: exceptionName,
            exceptionName: exceptionName,
            exclusionName: exclusionName
        };

        if (!this.saving) {
            this.saving = true;
            config.ConfigEnv.delete_config( name, serverType, alertType, alertResourceName, this.exceptionDelete, data );
        }
    },

    exceptionDelete : function(){
        var data = this.set_value,
            self = data.self;

        config.ConfigEnv.insert_config( data.name, data.serverType, data.alertType, data.alertResourceName, self.smsScheduleEdit.getValue() );
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'CONFIG_MODE', data.level );
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'EXCEPTION_NAME', data.exceptionName );
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'TXN_NAME', data.txnName );
        config.ConfigEnv.insert_tag_config( data.name, data.serverType, data.alertType, data.alertResourceName, 'EXCLUSION', data.exclusionName );

        setTimeout(function() {
            self.parentRefresh();
            self.close();
            self.saving = false;
        }, 100);
    }
});
