Ext.define('config.config_alert_statalert_form', {

    parent: null,
    mode: '',
    alert_name: '',
    stat_type: '',
    comparison: '',
    repeat: '',
    warning_value: '',
    critical_value: '',
    sms_schedule: '',
    sltInfo: {},

    /**
     * 에이전트 지표 알람의 그래프 표시가 전혀 안되는 지표 목록
     * xapm_was_stat_daily 에 해당 컬럼이 없는 리스트
     * 'Failure Count'
     * 'Failure Ratio (%)'
     * 위 2개의 지표는 mssql에서만 사용하고 있는 지표라고한다.
     *
     *  2016-10-20 변경사항.
     *  현재 JVM GC Time와 JVM GC Count를 각각 gc_time, gc_count 컬럼에 넣어주고 있는데 이를 아래와 같이 변경하기로 한다.
     * 'JVM GC Time'
     * 현재 사용 컬럼 : gc_time
     * 변경 사용 컬럼 : jvm_gc_time
     * 'JVM GC Count'
     * 현재 사용 컬럼 : gc_count
     * 변경 사용 컬럼 : jvm_gc_count
     * 참고로 현재는 jvm_gc_count의 컬럼명이 존재하지 않음.
     * WAS에서만 그래프를 보여주기로 변경.
     */

    typeItems: {
        WAS: {
            wasStatList: [
                'Active Transactions',
                'Concurrent Users',
                'DB Sessions',
                'Active DB Sessions',
                'SQL Exec Count',
                'SQL Prepare Count',
                'SQL Fetch Count',
                'TPS'
            ],
            MSSQL_wasStatList: [
                'Active Transactions',
                'Concurrent Users',
                'DB Sessions',
                'Active DB Sessions',
                'SQL Exec Count',
                'SQL Prepare Count',
                'SQL Fetch Count',
                'TPS',
                //'Active Users',
                'Failure Count',
                'Failure Ratio (%)'
            ],
            osStatList: [
                'OS CPU(%)',
                'OS CPU Sys(%)',
                'OS CPU User(%)',
                'OS CPU IO(%)',
                'OS Memory Usage(%)',
                'OS Free Memory(MB)',
                'OS Total Memory(MB)',
                'OS Send Packets',
                'OS Rcv Packets'
            ],
            jvmStatList: [
                'JVM CPU Usage(%)',
                'JVM Free Heap(MB)',
                'JVM Heap Size(MB)',
                'JVM Heap Usage(%)',
                'JVM Memory Size(MB)',
                'JVM Thread Count',
                'JVM GC Count',
                'JVM GC Time'
            ],
            dotNetStatList: [
                '.NET CPU Usage(%)',
                '.NET Free Heap(MB)',
                '.NET Heap Size(MB)',
                '.NET Heap Usage(%)',
                '.NET Memory Size(MB)',
                '.NET Thread Count',
                '.NET GC Count',
                '.NET GC Time'
            ],
            jvmDotNetStatList: [
                'JVM(.NET) CPU Usage(%)',
                'JVM(.NET) Free Heap(MB)',
                'JVM(.NET) Heap Size(MB)',
                'JVM(.NET) Heap Usage(%)',
                'JVM(.NET) Memory Size(MB)',
                'JVM(.NET) Thread Count',
                'JVM(.NET) GC Count',
                'JVM(.NET) GC Time'
            ],
            jvmStatTranseObj: {
                'JVM(.NET) CPU Usage(%)'    : 'JVM CPU Usage(%)',
                'JVM(.NET) Free Heap(MB)'   : 'JVM Free Heap(MB)',
                'JVM(.NET) Heap Size(MB)'   : 'JVM Heap Size(MB)',
                'JVM(.NET) Heap Usage(%)'   : 'JVM Heap Usage(%)',
                'JVM(.NET) Memory Size(MB)' : 'JVM Memory Size(MB)',
                'JVM(.NET) Thread Count'    : 'JVM Thread Count',
                'JVM(.NET) GC Count'        : 'JVM GC Count',
                'JVM(.NET) GC Time'         : 'JVM GC Time',
                '.NET CPU Usage(%)'         : 'JVM CPU Usage(%)',
                '.NET Free Heap(MB)'        : 'JVM Free Heap(MB)',
                '.NET Heap Size(MB)'        : 'JVM Heap Size(MB)',
                '.NET Heap Usage(%)'        : 'JVM Heap Usage(%)',
                '.NET Memory Size(MB)'      : 'JVM Memory Size(MB)',
                '.NET Thread Count'         : 'JVM Thread Count',
                '.NET GC Count'             : 'JVM GC Count',
                '.NET GC Time'              : 'JVM GC Time'
            }
        },
        DB: {
            osStatList: [
                'OS CPU(%)',
                'OS Free Memory(MB)',
                'OS Memory Usage(%)'
            ],
            dbStatList: [],
            dbWaitList: []
        },
        WS: {
            osStatList: [
                'OS CPU(%)',
                'OS Free Memory(MB)'
            ],
            wsStatList: [
                'Active Transactions',        //'Active Sessions',
                'BRUN',                      //'Keep Alive Sessions',
                'Current Queue (cq)',        //'Current Queue',
                'accumulated queue (aq)',    //'Avg Queue Delay',
                'Client Counts',
                'Service TPS',
                'Service Request Count',
                'Service Response Time'
            ]
        },
        APIM: {
            osStatList: [
                'OS CPU(%)',
                'OS CPU Sys(%)',
                'OS CPU User(%)',
                'OS CPU IO(%)',
                'OS Memory Usage(%)',
                'OS Free Memory(MB)',
                'OS Total Memory(MB)',
                'OS Send Packets',
                'OS Rcv Packets'
            ],
            cStatList: [
                'Response Time',
                'TPS'
            ]
        },
        TP: {
            osStatList: [
                'OS CPU(%)',
                'OS CPU Sys(%)',
                'OS CPU User(%)',
                'OS CPU IO(%)',
                'OS Memory Usage(%)',
                'OS Free Memory(MB)',
                'OS Total Memory(MB)',
                'OS Send Packets',
                'OS Rcv Packets'
            ],
            tpStatList: [
                'AQ Counts',
                'Fail Counts',
                'Error Counts',
                'Response time',
                'TPS',
                'Queuing Counts',
                'Queuing time',
                'Client Counts',
                'Process Counts'
            ]
        }
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(_state_) {
        var self = this;

        this.saving = false;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout      : 'vbox',
            maximizable : false,
            width       : 500,
            height      : 392,
            resizable   : false,
            title       : common.Util.TR('Stat Alert Configuration'),
            bodyStyle   : { background: '#f5f5f5' },
            closeAction : 'destroy'
        });

        if(cfg.alert.sltMode !== 'Agent'){
            form.height = 220;
        }

        var panelA = Ext.create('Ext.panel.Panel', {
            layout      : 'absolute',
            cls         : 'x-config-used-round-panel',
            width       : '100%',
            height      : 150,
            margin      : '4 4 4 4',
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });

        var typeLabel = Ext.create('Ext.form.Label', {
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
                change : function(_this, _newValue) {

                    self.avgValueEdit.setValue( 0 ) ;
                    self.maxValueEdit.setValue( 0 ) ;
                    if (self.mode == 'Edit') {
                        if (self.stat_type == _newValue) {
                            self.typeChange(_newValue, self.sltInfo.sltAppType);
                        }
                    } else if (self.mode == 'Add') {
                        if(_newValue == null){
                            return;
                        }
                        self.typeChange(_newValue, self.sltInfo.sltAppType);
                    }
                }
            }
        });

        switch (cfg.alert.sltMode) {
            case 'Agent' :
                var JVM_STAT;

                if (self.sltInfo.sltAppType == "JVM(.NET)") {
                    JVM_STAT = 'JVM(.NET) STAT';
                } else if (self.sltInfo.sltAppType == "NET") {
                    JVM_STAT = '.NET STAT';
                } else {
                    JVM_STAT = 'JVM STAT';
                }

                this.typeComboBox.addItem('JVM STAT'  , JVM_STAT);
                this.typeComboBox.addItem('OS STAT'   , 'OS STAT');
                this.typeComboBox.addItem('WAS STAT'  , 'WAS STAT');
                break;
            case 'DB' :
                this.typeComboBox.addItem('DB Wait', 'DB Wait');
                this.typeComboBox.addItem('DB STAT', 'DB STAT');
                this.typeComboBox.addItem('OS STAT', 'OS STAT');
                break;
            case 'WS' :
                this.typeComboBox.addItem('WS STAT', 'WS STAT');
                this.typeComboBox.addItem('OS STAT', 'OS STAT');
                break;
            case 'APIM' :
                this.typeComboBox.addItem('C STAT',  'C STAT');
                this.typeComboBox.addItem('OS STAT', 'OS STAT');
                break;
            case 'TP' :
                this.typeComboBox.addItem('TP STAT', 'TP STAT');
                this.typeComboBox.addItem('OS STAT', 'OS STAT');
                break;
            default :
                break;
        }


        this.statListComboBox = Ext.create('Exem.ComboBox', {
            x           : 217,
            y           : 10,
            width       : 243,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            cls         : 'config_tab',
            listeners   : {
                change : function(_this, _newValue) {
                    self.avgValueEdit.setValue( 0 ) ;
                    self.maxValueEdit.setValue( 0 ) ;
                    if(cfg.alert.sltMode === 'Agent'){
                        self.statQueryOpen(_newValue);
                    }
                }
            }
        });

        var comparisonLabel = Ext.create('Ext.form.Label', {
            x           : 0,
            y           : 39,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Comparison') )
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

        var repeatLabel = Ext.create('Ext.form.Label', {
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

        var warningLabel = Ext.create('Ext.form.Label', {
            x           : 250,
            y           : 39,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Warning'))
        });

        this.warningEdit = Ext.create('Ext.form.field.Text', {
            x           : 340,
            y           : 37,
            width       : 120,
            value       : '0',
            enforceMaxLength : true
        });

        var criticalLabel = Ext.create('Ext.form.Label', {
            x           : 250,
            y           : 66,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.CTR('Critical'))
        });

        this.criticalEdit = Ext.create('Ext.form.field.Text', {
            x           : 340,
            y           : 64,
            width       : 120,
            value       : '0',
            enforceMaxLength : true
        });

        var delayTimeLabel = Ext.create('Ext.form.Label', {
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

        var smsScheduleLabel = Ext.create('Ext.form.Label', {
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

        var SMSButton = Ext.create('Ext.button.Button', {
            text        : '...',
            x           : 215,
            y           : 91,
            width       : 25,
            cls         : 'x-btn-config-default',
            margin      : '0 2 0 0',
            listeners   : {
                click : function() {
                    var sms_form = Ext.create('config.config_alert_smsschedulemgr');
                    sms_form.init(self);
                }
            }
        });

        var SMSClearButton = Ext.create('Ext.button.Button', {
            text        : 'Clear SMS',
            x           : 246,
            y           : 91,
            width       : 75,
            cls         : 'x-btn-config-default',
            margin      : '0 2 0 0',
            listeners   : {
                click : function() {
                    self.smsScheduleEdit.setValue('');
                }
            }
        });

        this.threadDumpCheckBox = Ext.create('Ext.form.field.Checkbox', {
            x: 217,
            y: 118,
            boxLabel: common.Util.TR('Full Thread Dump')
        });

        this.scriptCheckBox = Ext.create('Ext.form.field.Checkbox', {
            x: 340,
            y: 118,
            boxLabel: common.Util.TR('Use Script')
        });

        if(cfg.alert.sltMode === 'Agent'){
            panelA.add(typeLabel, this.typeComboBox, this.statListComboBox,
                comparisonLabel, this.comparisonComboBox, warningLabel, this.warningEdit,
                repeatLabel, this.repeatEdit, criticalLabel, this.criticalEdit,
                smsScheduleLabel, this.smsScheduleEdit, SMSButton, SMSClearButton,
                delayTimeLabel, this.delayTimeEdit, this.threadDumpCheckBox, this.scriptCheckBox);
        } else {
            panelA.add(typeLabel, this.typeComboBox, this.statListComboBox,
                comparisonLabel, this.comparisonComboBox, warningLabel, this.warningEdit,
                repeatLabel, this.repeatEdit, criticalLabel, this.criticalEdit,
                smsScheduleLabel, this.smsScheduleEdit, SMSButton, SMSClearButton,
                delayTimeLabel, this.delayTimeEdit);
        }

        var panelB = Ext.create('Ext.panel.Panel', {
            layout      : 'absolute',
            cls         : 'x-config-used-round-panel',
            width       : '100%',
            flex        : 1,
            margin      : '0 4 4 4',
            padding     : '1 1 1 1',
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });

        var avgValueLabel = Ext.create('Ext.form.Label', {
            x           : 0,
            y           : 12,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.TR('Avg. Value'))
        });

        this.avgValueEdit = Ext.create('Ext.form.field.Text', {
            x           : 90,
            y           : 10,
            width       : 120,
            readOnly    : true
        });

        var maxValueLabel = Ext.create('Ext.form.Label', {
            x           : 250,
            y           : 12,
            width       : 80,
            style       : 'text-align:right;',
            html        : Comm.RTComm.setFont(9, common.Util.TR('Max. Value'))
        });

        this.maxValueEdit = Ext.create('Ext.form.field.Text', {
            x           : 340,
            y           : 10,
            width       : 120,
            readOnly    : true
        });

        this.chartPanel = Ext.create('Ext.container.Container', {
            x           : 15,
            y           : 40,
            width       : 445,
            height      : 120,
            style       : { background: '#f7f7f7' }
        });

        panelB.add(avgValueLabel, this.avgValueEdit, maxValueLabel, this.maxValueEdit, this.chartPanel);

        var panelC = Ext.create('Ext.panel.Panel', {
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
                    self.save();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
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

        form.add(panelA);
        if(cfg.alert.sltMode === 'Agent'){
            form.add(panelB);
        }
        form.add(panelC);

        panelC.add(OKButton, this.CancelButton);

        form.show();
        if (this.mode == 'Add') {
            this.typeComboBox.selectRow(0);
            this.statListComboBox.selectRow(0);
        } else {
            this.initEditSetting = true;
            this.typeComboBox.setValue(this.stat_type);
            this.statListComboBox.setValue(this.alert_name);
            this.comparisonComboBox.setValue(this.comparison);
            this.repeatEdit.setValue(this.repeat);
            this.warningEdit.setValue(this.warning_value);
            this.criticalEdit.setValue(this.critical_value);
            this.smsScheduleEdit.setValue(this.sms_schedule);
            this.delayTimeEdit.setValue(this.delay_time);
            if(this.thread_dump === 'Y'){
                this.threadDumpCheckBox.setValue(true);
            }
            if(this.use_script === 'Y'){
                this.scriptCheckBox.setValue(true);
            }

            this.typeComboBox.setDisabled(true);
            this.statListComboBox.setDisabled(true);
        }

        if(cfg.alert.sltMode === 'Agent'){
            this.statQueryOpen();
        }
    },

    valueCheck : function(){
        var warning = parseInt(this.warningEdit.getValue()),
            critical = parseInt(this.criticalEdit.getValue()),
            comparison = this.comparisonComboBox.getValue(),
            delayTime = this.delayTimeEdit.getValue();

        //Type
        if(this.typeComboBox.getValue() === null){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a type.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        //Stat
        if(this.statListComboBox.getValue() === null){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select stat condition'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        //comparison
        if(comparison === null){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a comparison.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        //delayTime
        if (delayTime === null) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            this.delayTimeEdit.focus();
            return false;
        }

        // WARNING
        if (this.warningEdit.getValue() == '' || this.warningEdit.getValue() == null) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter Value.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            this.warningEdit.focus();
            return false;
        }

        // CRITICAL
        if (this.criticalEdit.getValue() == '' || this.criticalEdit.getValue() == null) {
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
        if (comparison == '>=') {
            if (warning > critical) {
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Warning value is greater than critical value.'));
                comparison = null;
                warning  = null;
                critical = null;
                return false;
            }
        } else {
            if (warning < critical) {
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Critical value is greater than warning value.'));
                comparison = null;
                warning  = null;
                critical = null;
                return false;
            }
        }

        return true;
    },

    save: function() {
        var name, server_type, alert_type,
            alert_resource_name, sms, repeat, thread_dump, use_script,
            resource_name = this.statListComboBox.getValue();

        var data = {},
            data_array = [];

        if(!this.valueCheck()){
            return;
        }

        // SMS
        if (this.smsScheduleEdit.getValue() == '') {
            sms = '';
        } else {
            sms = this.smsScheduleEdit.getValue();
        }

        // REPEAT
        if (this.repeatEdit.getValue() == '') {
            repeat = 0;
        } else {
            repeat = Number( this.repeatEdit.getValue() ) ;
        }

        //THREAD_DUMP
        if(this.threadDumpCheckBox.getValue()){
            thread_dump = 'Y';
        } else{
            thread_dump = 'N';
        }

        //USE_SCRIPT
        if(this.scriptCheckBox.getValue()){
            use_script = 'Y';
        } else{
            use_script = 'N';
        }

        if ( cfg.alert.sltExistSub ){
            name = cfg.alert.sltName ;
        }
        else {
            name = cfg.alert.sltId ;
        }

        switch (cfg.alert.sltMode) {
            case 'Agent' :
                server_type = 'WAS';
                alert_type = 'Stat Alert' ;
                alert_resource_name = resource_name ;

                if (this.typeItems.WAS.jvmDotNetStatList.includes(resource_name) || this.typeItems.WAS.dotNetStatList.includes(resource_name)) {
                    alert_resource_name = this.typeItems.WAS.jvmStatTranseObj[resource_name];
                };

                break;
            case 'WS':
                server_type = 'WEBSERVER';
                alert_type = 'Stat Alert' ;
                alert_resource_name = resource_name ;
                break;
            case 'DB' :
                server_type = cfg.alert.sltType ;
                alert_type = 'Stat Alert' ;
                alert_resource_name = resource_name ;
                break;
            case 'APIM' :
                server_type = 'APIM';
                alert_type = 'Stat Alert' ;
                alert_resource_name = resource_name ;
                break;
            case 'TP' :
                server_type = 'TP';
                alert_type = 'Stat Alert' ;
                alert_resource_name = resource_name ;
                break;
            default :
                break;
        }

        data.self                = this;
        data.name                = name;
        data.server_type         = server_type;
        data.alert_type          = alert_type;
        data.alert_resource_name = alert_resource_name;
        data.repeat              = repeat;
        data.sms                 = sms;
        data.thread_dump         = thread_dump;
        data.use_script          = use_script;

        data_array.push(data);

        config.ConfigEnv.group_flag = cfg.alert.sltExistSub ;

        if(!this.saving){
            this.saving = true;
            config.ConfigEnv.delete_config( name, server_type, alert_type, alert_resource_name, this.statDelete, data_array[0] ) ;
        }

        resource_name = null ;
        name = null ;
        server_type = null ;
        alert_type = null ;
        alert_resource_name = null ;
        sms = null ;
    },

    statDelete: function(){
        var set_value = this.set_value;
        var self = set_value.self;

        config.ConfigEnv.insert_tag_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, 'STAT_TYPE'     , self.typeComboBox.getValue() ) ;
        config.ConfigEnv.insert_tag_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, 'COMPARISON'    , self.comparisonComboBox.getValue() ) ;
        config.ConfigEnv.insert_tag_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, 'REPEAT'        , set_value.repeat ) ;
        config.ConfigEnv.insert_tag_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, 'WARNING_VALUE' , self.warningEdit.getValue() ) ;
        config.ConfigEnv.insert_tag_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, 'CRITICAL_VALUE', self.criticalEdit.getValue() ) ;
        config.ConfigEnv.insert_tag_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, 'DELAY_TIME'    , self.delayTimeEdit.getValue() ) ;
        config.ConfigEnv.insert_tag_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, 'USE_SCRIPT'   , set_value.use_script ) ;
        config.ConfigEnv.insert_tag_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, 'THREAD_DUMP'   , set_value.thread_dump ) ;
        config.ConfigEnv.insert_config( set_value.name, set_value.server_type, set_value.alert_type, set_value.alert_resource_name, set_value.sms ) ;

        setTimeout(function() {
            self.parent.onRefresh();
            self.CancelButton.fireHandler('click');
            self.saving = false;
        }, 100);
    },

    typeChange: function(_newValue, appType) {
        var self = this;
        var dataSet = {};
        var data = null;
        var len;
        this.statListComboBox.removeAll();

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        switch (cfg.alert.sltMode) {
            case 'Agent' :
                switch (_newValue) {
                    case 'WAS STAT'  :
                        if(cfg.repository == 'MSSQL'){
                            data = this.typeItems.WAS.MSSQL_wasStatList;
                        } else{
                            data = this.typeItems.WAS.wasStatList;
                        }
                        break;
                    case 'OS STAT'   : data = this.typeItems.WAS.osStatList;
                        break;
                    case 'JVM STAT'  :
                        if(appType == 'JVM(.NET)') {
                            data = this.typeItems.WAS.jvmDotNetStatList;
                        } else if(appType == 'NET') {
                            data = this.typeItems.WAS.dotNetStatList;
                        } else {
                            data = this.typeItems.WAS.jvmStatList;
                        }
                        break;
                    default :
                        break;
                }
                len = data.length;
                /**
                 * SHA Version :  8065ead
                 * 위 수정으로 인해서 cfg.alertWas.regStatList 값이 사용하지 않는 값이 되면서 주석처리.
                 */

                for (var ix = len; ix--;) {
                    this.statListComboBox.addItem(data[ix], data[ix]);
                }

                //for (var ix = len; ix--;) {
                //    if (this.mode == 'Add') {
                //        if (cfg.alertWas.regStatList.indexOf(data[ix]) == -1) {
                //            this.statListComboBox.addItem(data[ix], data[ix]);
                //        }
                //    } else {
                //        this.statListComboBox.addItem(data[ix], data[ix]);
                //    }
                //}
                this.statListComboBox.selectRow(0);
                break;
            // DB 목록에서 Group 기능이 없어졌으므로 cfg.alert.sltExistSub를 제거 16.06.21
            case 'DB' :
                switch (_newValue) {
                    case 'OS STAT' :
                        data = this.typeItems.DB.osStatList;
                        len = data.length;
                        for ( ix = len; ix--;) {
                            this.statListComboBox.addItem(data[ix], data[ix]);
                        }
                        //for ( ix = len; ix--;) {
                        //    if (this.mode == 'Add') {
                        //        if (cfg.alertWas.regStatList.indexOf(data[ix]) == -1) {
                        //            this.statListComboBox.addItem(data[ix], data[ix]);
                        //        }
                        //    } else {
                        //        this.statListComboBox.addItem(data[ix], data[ix]);
                        //    }
                        //}
                        this.statListComboBox.selectRow(0);
                        break;
                    case 'DB STAT' :
                        dataSet.sql_file = 'IMXConfig_Stat_Alert_DB_STAT.sql';

                        dataSet.bind = [{
                            name: 'sltType',
                            value: cfg.alert.sltType,
                            type : SQLBindType.STRING
                        }];

                        dataSet.replace_string = [{
                            name: 'sltId',
                            value: cfg.alert.sltId
                        }];

                        WS.SQLExec(dataSet , function(aheader, adata) {
                            for (var ix = 0; ix < adata.rows.length; ix++) {
                                self.statListComboBox.addItem(adata.rows[ix][0], adata.rows[ix][0]);
                            }
                            if(self.initEditSetting){
                                self.statListComboBox.setValue(self.alert_name);
                                self.initEditSetting = false;
                            } else {
                                self.statListComboBox.selectRow(0);
                            }
                        }, this);
                        break;
                    case 'DB Wait' :
                        dataSet.sql_file = 'IMXConfig_Stat_Alert_DB_Wait.sql';

                        dataSet.bind = [{
                            name: 'sltType',
                            value: cfg.alert.sltType,
                            type : SQLBindType.STRING
                        }];

                        dataSet.replace_string = [{
                            name: 'sltId',
                            value: cfg.alert.sltId
                        }];

                        WS.SQLExec(dataSet , function(aheader, adata) {
                            for (var ix = 0; ix < adata.rows.length; ix++) {
                                this.statListComboBox.addItem(adata.rows[ix][0], adata.rows[ix][0]);
                            }
                            if(self.initEditSetting){
                                self.statListComboBox.setValue(self.alert_name);
                                self.initEditSetting = false;
                            } else {
                                self.statListComboBox.selectRow(0);
                            }
                        }, this);
                        break;
                    default :
                        break;
                }
                break;
            case 'WS' :
                switch (_newValue) {
                    case 'OS STAT' : data = this.typeItems.WS.osStatList;
                        break;
                    case 'WS STAT' : data = this.typeItems.WS.wsStatList;
                        break;
                    default :
                        break;
                }
                len = data.length;
                for ( ix = len; ix--;) {
                    this.statListComboBox.addItem(data[ix], data[ix]);
                }
                //for ( ix = len; ix--;) {
                //    if (this.mode == 'Add') {
                //        if (cfg.alertWas.regStatList.indexOf(data[ix]) == -1) {
                //            this.statListComboBox.addItem(data[ix], data[ix]);
                //        }
                //    } else {
                //        this.statListComboBox.addItem(data[ix], data[ix]);
                //    }
                //}
                this.statListComboBox.selectRow(0);
                break;
            case 'APIM' :
                switch (_newValue) {
                    case 'OS STAT' : data = this.typeItems.APIM.osStatList;
                        break;
                    case 'C STAT' : data = this.typeItems.APIM.cStatList;
                        break;
                    default :
                        break;
                }
                len = data.length;
                for ( ix = len; ix--;) {
                    if(data[ix] === 'Response Time'){
                        this.statListComboBox.addItem(data[ix], data[ix] + ' (' + decodeURI('%C2%B5') + 's)');
                    } else{
                        this.statListComboBox.addItem(data[ix], data[ix]);
                    }
                }
                this.statListComboBox.selectRow(0);
                break;
            case 'TP' :
                switch (_newValue) {
                    case 'OS STAT' : data = this.typeItems.TP.osStatList;
                        break;
                    case 'TP STAT' : data = this.typeItems.TP.tpStatList;
                        break;
                    default :
                        break;
                }
                len = data.length;
                for ( ix = len; ix--;) {
                    this.statListComboBox.addItem(data[ix], data[ix]);
                }
                this.statListComboBox.selectRow(0);
                break;
            default :
                break;
        }
    },

    setSMSScheduleName: function(_sms_) {
        this.smsScheduleEdit.setValue(_sms_);
    },

    statQueryOpen: function() {
        var self = this;
        var dataSet = {};
        var statname = this.statListComboBox.getReplValue();

        if ( this.alert_name != '' ){
            this.statListComboBox.setValue(this.alert_name);
        }

        if (statname == '')
            return;

        var yesterday = this.getYesterday();
        var _yesterday ;
        switch (Comm.currentRepositoryInfo.database_type) {
            case 'Oracle':
            case 'ODBC'  :
                _yesterday = yesterday ;
                yesterday = 'TO_DATE( '+ '\'' + _yesterday  + '\'' + ', \'yyyy-mm-dd hh24:mi:ss\') ';
                break ;
            default : yesterday = '\'' + yesterday + '\'';
                break ;
        }
        _yesterday = null ;

        var avg_fieldname = this.getStatiscticStatName(statname);

        if (avg_fieldname == '') {
            if (this.svgr) {
                this.svgr.remove();
            }
            return;
        }

        var max_fieldname = '';
        var func = this.getStatiscticFunc(statname);

        if(statname.toUpperCase() == 'JVM HEAP USAGE(%)' || statname.toUpperCase() == 'OS MEMORY USAGE(%)'){
            max_fieldname = avg_fieldname + func;
        } else {
            if ( avg_fieldname == 'Concurrent Users' ) {
                avg_fieldname = 'was_sessions';
            }

            max_fieldname = avg_fieldname + '_max' + func;
        }
        avg_fieldname += func;

        if (cfg.alert.sltExistSub) {
            var temp = '';
            for (var ix = 0; ix < cfg.alert.wasIds.length; ix++) {
                if (temp != '') {
                    temp += ', ' + cfg.alert.wasIds[ix];
                } else {
                    temp += cfg.alert.wasIds[ix];
                }
            }
            dataSet.sql_file = 'IMXConfig_Stat_Alert_Group_Chart.sql';
            dataSet.replace_string = [
                {
                    name    :   'avg_fieldname',
                    value   :   avg_fieldname
                }, {
                    name    :   'max_fieldname',
                    value   :   max_fieldname
                }, {
                    name    :   'temp',
                    value   :   temp
                }, {
                    name    :   'yesterday',
                    value   :   yesterday
                }
            ];
        } else {
            dataSet.sql_file = 'IMXConfig_Stat_Alert_Server_Chart.sql';
            dataSet.replace_string = [
                {
                    name    :   'avg_fieldname',
                    value   :   avg_fieldname
                }, {
                    name    :   'max_fieldname',
                    value   :   max_fieldname
                }, {
                    name    :   'sltId',
                    value   :   cfg.alert.sltId
                }, {
                    name    :   'yesterday',
                    value   :   yesterday
                }
            ];
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet , this.createStatChart, this);

        yesterday = this.getYesterday();
        if ( avg_fieldname == 'Concurrent Users' ){
            avg_fieldname = '\'' + avg_fieldname + '\'' ;
            max_fieldname = '\'' + max_fieldname + '\'' ;
        }

        if (cfg.alert.sltExistSub) {
            temp = '';
            for (ix = 0; ix < cfg.alert.wasIds.length; ix++) {
                if (temp != '') {
                    temp += ', ' + cfg.alert.wasIds[ix];
                } else {
                    temp += cfg.alert.wasIds[ix];
                }
            }
            dataSet.sql_file = 'IMXConfig_Stat_Alert_Group_AVG_MAX_Value.sql';
            dataSet.replace_string = [{
                name    :   'avg_fieldname',
                value   :   avg_fieldname
            }, {
                name    :   'max_fieldname',
                value   :   max_fieldname
            }, {
                name    :   'temp',
                value   :   temp
            }];
            dataSet.bind = [{
                name    :   'yesterday',
                value   :   yesterday,
                type : SQLBindType.STRING
            }];
        } else {
            dataSet.sql_file = 'IMXConfig_Stat_Alert_Server_AVG_MAX_Value.sql';
            dataSet.replace_string = [{
                name    :   'avg_fieldname',
                value   :   avg_fieldname
            }, {
                name    :   'max_fieldname',
                value   :   max_fieldname
            }, {
                name    :   'sltId',
                value   :   cfg.alert.sltId
            }];
            dataSet.bind = [{
                name    :   'yesterday',
                value   :   yesterday,
                type : SQLBindType.STRING
            }];
        }

        WS.SQLExec(dataSet , function(aheader, adata) {
            if (adata.rows != undefined) {
                self.avgValueEdit.setValue(adata.rows[0][0]);
                self.maxValueEdit.setValue(adata.rows[0][1]);
            }
        }, this);
    },

    getYesterday : function() {
        var A = new Date(new Date().setSeconds(-86400));
        var y = A.getFullYear();
        var M = A.getMonth() + 1;
        var d = A.getDate();
        var h = A.getHours();

        return '' + y + '-' + (M < 10 ? '0' + M : M) + '-' + (d < 10 ? '0' + d : d) + ' ' + (h < 10 ? '0' + h : h) + ':00:00';
    },

    createStatChart: function(aheader, adata) {

        if (adata.rows == undefined)
            return;

        var avgArr = [];
        var maxArr = [];
        var data = [];
        for (var ix = 0; ix < adata.rows.length; ix++) {
            avgArr.push([adata.rows[ix][0], adata.rows[ix][1]]);
            maxArr.push([adata.rows[ix][0], adata.rows[ix][2]]);
        }
        data.push(avgArr);
        data.push(maxArr);

        var maxvalue = 0;
        for (ix = 0; ix < adata.rows.length; ix++) {
            maxvalue = parseInt(adata.rows[ix][2]) > maxvalue ? adata.rows[ix][2] : maxvalue;
        }

        var target = this.chartPanel;
        var target_width  = target.getWidth();
        var target_height = target.getHeight();

        if (this.svgr) {
            this.svgr.remove();
        }

        // SVG
        this.svgr = d3.select('#' + target.id + '-innerCt').append('svg')
            .attr('width', target_width)
            .attr('height', target_height);

        this.svga = this.svgr.append('g')
            .attr('class', 'rt_service_stat')
            .attr('transform', 'translate(0, 10)');

        if (avgArr.length == 0)
            return;

        var mindate = new Date(avgArr[0][0]).getTime();
        var maxdate = new Date(avgArr[avgArr.length-1][0]).getTime();

        var x = d3.time.scale().domain([mindate, maxdate]).range([60, target_width-30]);
        var y = d3.scale.linear().domain([0, maxvalue*1.5]).range([target_height-30, 10]);

        var yAxis = d3.svg.axis().scale(y).ticks(3).tickSize(1).orient('left');
        var xAxis = d3.svg.axis().scale(x).tickSize(1).orient('bottom').tickFormat(d3.time.format("%d-%H")).ticks(7);

        var line = d3.svg.line()
            .x(function(d) { return x(new Date(d[0]).getTime()); })
            .y(function(d) { return y(d[1]); });

        // 테두리
        this.svgr.selectAll('rect').remove();
        this.svgr.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', target_width)
            .attr('height', 1)
            .style('fill', '#cccccc');
        this.svgr.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', target_height)
            .style('fill', '#cccccc');
        this.svgr.append('rect')
            .attr('x', target_width-1)
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', target_height)
            .style('fill', '#cccccc');
        this.svgr.append('rect')
            .attr('x', 0)
            .attr('y', target_height-1)
            .attr('width', target_width)
            .attr('height', 1)
            .style('fill', '#cccccc');

        // MAX, MIN 안내선
        this.svga.append('rect')
            .attr('x', target_width - 65)
            .attr('y', 2)
            .attr('width', 20)
            .attr('height', 2)
            .style('fill', 'blue');
        this.svga.append('rect')
            .attr('x', target_width - 65)
            .attr('y', 12)
            .attr('width', 20)
            .attr('height', 2)
            .style('fill', 'red');

        // MAX, MIN 텍스트
        this.svga.selectAll('text').remove();
        this.svga.append('text')
            .attr('x', target_width - 20)
            .attr('y', 5)
            .attr("font-family", "imaxval")
            .attr("font-size", "8px")
            .attr("text-anchor", 'end')
            .style('fill', 'blue')
            .text('MAX');
        this.svga.append('text')
            .attr('x', target_width - 20)
            .attr('y', 15)
            .attr("font-family", "imaxval")
            .attr("font-size", "8px")
            .attr("text-anchor", 'end')
            .style('fill', 'red')
            .text('AVG');

        this.svga.select('g.rt_service_stat').remove();
        this.svga.append('g')
            .attr('class', 'rt_service_stat')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis);

        this.svga.select('g.rt_service_stat_x').remove();
        this.svga.append('g')
            .attr('class', 'rt_service_stat')
            .attr('transform', 'translate(0, ' + (target_height-30) + ')')
            .call(xAxis);

        this.svga.selectAll('path.lines').remove();

        for (ix = 0; ix < data.length; ix++) {
            this.svga.append('path')
                .attr('class', 'lines')
                .attr('d', line(data[ix]))
                .style('stroke', this.lineColor(ix))
                .style('fill', 'none')
                .style('stroke-width', 0.65);
        }
    },

    lineColor: function(ix){
        var result = '';
        if (ix == 0) {
            result = 'red';
        } else {
            result = 'blue';
        }
        return result;
    },

    getStatiscticStatName: function(name) {
        var result = '';
        switch (name) {
            case 'Concurrent Users'     : result = 'Concurrent Users';
                break;
            case 'Active Transactions'  : result = 'active_txns';
                break;
            case 'DB Sessions'          : result = 'db_sessions';
                break;
            case 'Active DB Sessions'   : result = 'active_db_sessions';
                break;
            case 'SQL Exec Count'       : result = 'sql_exec_count';
                break;
            case 'SQL Prepare Count'    : result = 'sql_prepare_count';
                break;
            case 'SQL Fetch Count'      : result = 'sql_fetch_count';
                break;
            case 'TPS'                  : result = 'txn_end_count';
                break;
            //case 'Active Users'         : result = 'active_users';
            //    break;
            case '.NET CPU Usage(%)'      :
            case 'JVM(.NET) CPU Usage(%)' :
            case 'JVM CPU Usage(%)'       :
                result = 'jvm_cpu_usage';
                break;
            case 'JVM Free Heap(MB)'    : result = 'jvm_free_heap';
                break;
            case 'JVM Heap Size(MB)'    : result = 'jvm_heap_size';
                break;
            case 'JVM Heap Usage(%)'    : result = 'cast(cast(jvm_free_heap as float)/cast(jvm_heap_size as float)*100 as int)';
                break;
            case 'JVM Memory Size(MB)'  : result = 'jvm_mem_size';
                break;
            case 'JVM Thread Count'     : result = 'jvm_thread_count';
                break;
            case 'JVM GC Count'         : result = 'jvm_gc_count';
                break;
            case 'JVM GC Time'          : result = 'jvm_gc_time';
                break;
            case 'OS CPU(%)'            : result = 'os_cpu';
                break;
            case 'OS CPU Sys(%)'        : result = 'os_cpu_sys';
                break;
            case 'OS CPU User(%)'       : result = 'os_cpu_user';
                break;
            case 'OS CPU IO(%)'         : result = 'os_cpu_io';
                break;
            case 'OS Free Memory(MB)'   : result = 'os_free_memory';
                break;
            case 'OS Total Memory(MB)'  : result = 'os_total_memory';
                break;
            case 'OS Send Packets'      : result = 'os_send_packets';
                break;
            case 'OS Rcv Packets'       : result = 'os_rcv_packets';
                break;
            case 'OS Memory Usage(%)'   : result = 'cast(cast(os_free_memory as float)/cast(os_total_memory as float)*100 as int)';
                break;
            default :
                break;
        }
        return result;
    },

    getStatiscticFunc: function(name) {
        var result = '';
        switch (name) {
            case 'OS CPU(%)'            :
            case 'OS CPU Sys(%)'        :
            case 'OS CPU User(%)'       :
            case 'OS CPU IO(%)'         :
                result = '/10';
                break;
            case 'JVM Free Heap(MB)'    :
            case 'JVM Heap Size(MB)'    :
            case 'JVM Memory Size(MB)'  :
            case 'OS Free Memory(MB)'   :
            case 'OS Total Memory(MB)'  :
                result = '/1024';
                break;
            case '.NET CPU Usage(%)'      :
            case 'JVM(.NET) CPU Usage(%)' :
            case 'JVM CPU Usage(%)'       :
                result = '/100';
                break;
            default :
                break;
        }
        return result;
    }
});
