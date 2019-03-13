Ext.define('config.config_alert_useralert_form', {
    extend: 'Exem.Window',
    layout: 'vbox',
    maximizable: false,
    width: 500,
    height: (common.Menu.userAlert.isDashBoard) ? 220 : 195,
    resizable: false,
    title: common.Util.TR('User Defined Configuration'),
    bodyStyle: { background: '#f5f5f5' },
    closeAction: 'destroy',

    mode: null,
    serviceList: null,
    userData: null,

    constructor: function() {
        this.callParent(arguments);
    },

    init: function() {
        this.initProperty();

        this.initLayout();

        if (this.mode === 'Edit') {
            this.initSetting();
        }
    },

    initProperty: function(){
        this.saving = false;
    },

    initLayout: function(){
        var userAlertSettingPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: (common.Menu.userAlert.isDashBoard) ? 150 : 125,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });


        this.txnNameLayout(userAlertSettingPanel);
        this.criterionTimeComboBoxLayout(userAlertSettingPanel);
        this.configModeComboBoxLayout(userAlertSettingPanel);
        this.executionCountLayout(userAlertSettingPanel);
        this.comparisonComboBoxLayout(userAlertSettingPanel);
        this.smsScheduleLayout(userAlertSettingPanel);
        if (common.Menu.userAlert.isDashBoard) {
            this.dashBoardCheckBoxLayout(userAlertSettingPanel);
        }

        this.createConfirmButton();

        this.add(userAlertSettingPanel, this.buttonCon);

        this.show();
    },

    txnNameLayout: function(settingPanel) {
        var txnNameLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Txn Name'))
        });

        this.txnNameEdit = Ext.create('Ext.form.field.Text', {
            x: 90,
            y: 11,
            width: 300
        });

        settingPanel.add(txnNameLabel, this.txnNameEdit);
    },

    criterionTimeComboBoxLayout: function(settingPanel) {
        var criterionTimeLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 39,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Criterion Time'))
        });

        this.criterionTimeComboBox = Ext.create('Exem.ComboBox', {
            x: 90,
            y: 38,
            width: 140,
            store: Ext.create('Exem.Store'),
            editable: false,
            cls: 'config_tab'
        });

        this.criterionTimeComboBox.addItem( '120' , '120' );
        this.criterionTimeComboBox.addItem( '60' , '60' );
        this.criterionTimeComboBox.addItem( '30' , '30' );
        this.criterionTimeComboBox.addItem( '10' , '10' );
        this.criterionTimeComboBox.addItem( '1'  , '1'  );

        var criterionTimeUnitLabel = Ext.create('Ext.form.Label', {
            x: 235,
            y: 40,
            width: 20,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(6, common.Util.TR('(min)'))
        });

        settingPanel.add(criterionTimeLabel, this.criterionTimeComboBox, criterionTimeUnitLabel);
    },

    configModeComboBoxLayout: function(settingPanel) {
        var configModeLabel = Ext.create('Ext.form.Label', {
            x: 235,
            y: 39,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Mode'))
        });

        this.configModeComboBox = Ext.create('Exem.ComboBox', {
            x: 325,
            y: 38,
            width: 140,
            store: Ext.create('Exem.Store'),
            editable: false,
            cls: 'config_tab'
        });

        this.configModeComboBox.addItem('WARNING'     , common.Util.TR('Warning') );
        this.configModeComboBox.addItem('CRITICAL'    , common.Util.TR('Critical') );

        settingPanel.add(configModeLabel, this.configModeComboBox);
    },

    executionCountLayout: function(settingPanel) {
        var executionCountLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 65,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Total Execution Count'))
        });

        this.executionCountEdit = Ext.create('Ext.form.field.Number', {
            hideTrigger: true,
            x: 90,
            y: 64,
            width: 140,
            enforceMaxLength : true
        });

        settingPanel.add(executionCountLabel, this.executionCountEdit);
    },

    comparisonComboBoxLayout: function(settingPanel) {
        var comparisonLabel = Ext.create('Ext.form.Label', {
            x: 235,
            y: 65,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Comparison'))
        });

        this.comparisonComboBox = Ext.create('Exem.ComboBox', {
            x: 325,
            y: 64,
            width: 140,
            store: Ext.create('Exem.Store'),
            editable: false,
            cls: 'config_tab'
        });

        this.comparisonComboBox.addItem('<'     , common.Util.TR('<') );
        this.comparisonComboBox.addItem('>'     , common.Util.TR('>') );
        this.comparisonComboBox.addItem('<='     , common.Util.TR('<=') );
        this.comparisonComboBox.addItem('>='     , common.Util.TR('>=') );

        settingPanel.add(comparisonLabel, this.comparisonComboBox);
    },

    smsScheduleLayout: function(settingPanel) {
        var smsScheduleLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 92,
            width: 82,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('SMS Schedule'))
        });

        this.smsScheduleEdit = Ext.create('Ext.form.field.Text', {
            x: 90,
            y: 91,
            width: 140,
            readOnly: true
        });

        var SMSButton = Ext.create('Ext.button.Button', {
            text: '...',
            x: 235,
            y: 91,
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
            y: 91,
            width: 70,
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

    dashBoardCheckBoxLayout: function(settingPanel){

        var dashBoardCheckBoxLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 119,
            width: 82,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('DashBoard Apply'))
        });

        this.dashBoardCheckBox = Ext.create('Ext.form.field.Checkbox',{
            x: 90,
            y: 117
        });

        settingPanel.add( dashBoardCheckBoxLabel, this.dashBoardCheckBox );
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


    initSetting: function(){
        this.txnNameEdit.setValue(this.userData.txn_name);
        this.criterionTimeComboBox.setValue(this.userData.criterion_time);
        this.configModeComboBox.setValue(this.userData.config_mode);
        this.comparisonComboBox.setValue(this.userData.comparison);
        this.executionCountEdit.setValue(this.userData.execution_count);
        this.smsScheduleEdit.setValue(this.userData.sms);
        if (common.Menu.userAlert.isDashBoard) {
            this.dashBoardCheckBox.setValue(this.userData.dash_board);
        }
    },

    save: function() {
        var transactionName = this.txnNameEdit.getValue(),
            resourceName, dashEnable, data;

        if ( !this.valueCheck() ) {
            return;
        }

        //대쉬보드 enable
        if (common.Menu.userAlert.isDashBoard) {
            if ( this.dashBoardCheckBox.getValue() ) {
                dashEnable = 1;
            } else {
                dashEnable = 0;
            }
        }

        if (this.mode === 'Add') {
            resourceName = transactionName;
        } else {
            resourceName = this.userData.txn_name;
        }

        config.ConfigEnv.group_flag = false ;

        data = {
            self: this,
            serverType: 'FAB',
            alertType: 'User Alert',
            alertResourceName: transactionName,
            dashEnable: dashEnable
        };

        if (!this.saving) {
            this.saving = true;
            config.ConfigEnv.delete_config( 0, 'FAB', 'User Alert', resourceName, this.deleteComplete, data );
        }
    },

    deleteComplete: function(){
        var data = this.set_value,
            self = data.self,
            dataSet = {};

        config.ConfigEnv.insert_tag_config( 0, data.serverType, data.alertType, data.alertResourceName, 'INTERVAL'              , self.criterionTimeComboBox.getValue() ) ;
        config.ConfigEnv.insert_tag_config( 0, data.serverType, data.alertType, data.alertResourceName, 'COMPARISON'            , self.comparisonComboBox.getValue() ) ;
        config.ConfigEnv.insert_tag_config( 0, data.serverType, data.alertType, data.alertResourceName, 'CONFIG_MODE'           , self.configModeComboBox.getValue() ) ;
        config.ConfigEnv.insert_tag_config( 0, data.serverType, data.alertType, data.alertResourceName, 'SERVICE_LIST'          , self.serviceList.join(',') ) ;
        config.ConfigEnv.insert_tag_config( 0, data.serverType, data.alertType, data.alertResourceName, 'TOTAL_EXECUTION_VALUE' , self.executionCountEdit.getValue() ) ;
        if (common.Menu.userAlert.isDashBoard) {
            dataSet.sql_file = 'IMXConfig_DashBoard_Server_Insert.sql';

            dataSet.bind = [
                { name: 'server_id'           , value: 0                                , type : SQLBindType.INTEGER },
                { name: 'server_type'         , value: data.serverType                  , type : SQLBindType.STRING  },
                { name: 'alert_type'          , value: data.alertType                   , type : SQLBindType.STRING  },
                { name: 'alert_resource_name' , value: data.alertResourceName           , type : SQLBindType.STRING  },
                { name: 'sms'                 , value: self.smsScheduleEdit.getValue()  , type : SQLBindType.STRING  },
                { name: 'dash_enable'         , value: data.dashEnable                  , type : SQLBindType.INTEGER },
                { name: 'rtm_enable'          , value: 1                                , type : SQLBindType.INTEGER }];


            if ( common.Util.isMultiRepository() ) {
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, function() {}, this);
        } else {
            config.ConfigEnv.insert_config( 0, data.serverType, data.alertType, data.alertResourceName, self.smsScheduleEdit.getValue()) ;
        }

        setTimeout(function() {
            self.parentRefresh();
            self.close();
            self.saving = false;
        }, 100);
    },

    valueCheck: function(){
        var transactionName = this.txnNameEdit.getValue();
        var executionCount  = this.executionCountEdit.getValue();

        if (transactionName === '') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Value.'));
            this.txnNameEdit.focus();
            return false;
        }

        if (executionCount === null) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Value.'));
            this.executionCountEdit.focus();
            return false;
        }

        if (transactionName === '%%') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You Can not Enter its Value.'));
            this.txnNameEdit.focus();
            return false;
        }

        return true;
    },

    setSMSScheduleName: function(sms) {
        this.smsScheduleEdit.setValue(sms);
    }
});
