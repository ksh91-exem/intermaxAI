Ext.define('config.config_alert_process', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    MODE: '',
    target: null,

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        var self = this;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                id: 'cfg_process_alert_add' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_process_alert_delete' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Refresh'); }
            }, '-'
            ]
        });

        this.target.add(toolbar);

        var process_period = Ext.create('Exem.NumberField', {
            labelWidth : (window.nation === 'ja' ? 180 : 130),
            width : (window.nation === 'ja' ? 240 : 180),
            margin: '0 5 0 10',
            fieldLabel : Comm.RTComm.setFont(9, common.Util.TR('Process Observer Period(min)')),
            maxLength : 2,
            minValue : 1,
            enforceMaxLength : true
        });

        toolbar.add(process_period);

        self.process_period = process_period;

        var sms_schedule = Ext.create('Exem.AjaxComboBox', {
            labelWidth: (window.nation === 'ja' ? 100 : 80),
            width: (window.nation === 'ja' ? 230 : 200),
            useSelectFirstRow : false,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('SMS Schedule') + ' :'),
            margin: '0 5 0 10',
            forceSelection: true,
            listeners : {
                scope: this,
                select: function(combo, selection) {
                    this.ScheduleName = selection.get('value');

                    if (this.ScheduleName == null) {
                        this.ScheduleName = '';
                    }
                },
                change: function(combo) {
                    if (combo.getValue() == null) {
                        this.ScheduleName = '';
                        combo.reset();
                    } else {
                        this.ScheduleName = combo.getValue();
                    }
                }
            }
        });

        self.sms_schedule = sms_schedule;

        this.setSchedule(sms_schedule);

        toolbar.add(sms_schedule);

        var ApplyButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Apply'),
            cls : 'x-btn-default-toolbar-small',
            style : {
                backgroundColor: '#fafafa',
                borderColor : '#bbb',
                marginLeft : '6px'
            },
            scope: this,
            handler: function() {
                self.applyButton();
            }
        });

        toolbar.add(ApplyButton);

        this.ProcessGrid = Ext.create('Exem.adminGrid', {
            flex: 1,
            width: '100%',
            border: false,
            editMode: true,
            useCheckBox: false,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function() {
                var del = Ext.getCmp('cfg_process_alert_delete' + self.MODE);
                if (del) {
                    del.setDisabled(false);
                }
                return null;
            }
        });
        this.target.add(this.ProcessGrid);
        this.ProcessGrid.beginAddColumns();
        this.ProcessGrid.addColumn({text: common.Util.CTR('Observed Process Name'), dataIndex: 'process_name',  width: 200, type: Grid.String,   alowEdit: true, editMode: true});
        this.ProcessGrid.addColumn({text: common.Util.CTR('HOST IP'),           dataIndex: 'host_ip',       width: 100, type: Grid.String, hide : true});
        this.ProcessGrid.addColumn({text: 'insert Flag',                        dataIndex: 'insert_flag',   width: 100, type: Grid.String, hide : true});
        this.ProcessGrid.addColumn({text: common.Util.CTR('interval'),          dataIndex: 'interval',      width: 100, type: Grid.Number, hide : true});
        this.ProcessGrid.endAddColumns();
    },



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setSchedule : function(combo){
        var dataset  = {};
        dataset.sql_file = 'IMXConfig_Schedule.sql';

        if(common.Util.isMultiRepository()){
            dataset.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataset, function(aheader, adata){
            var comboValues = [];
            if (adata != null){
                for (var ix = 0; ix < adata.rows.length; ix++) {

                    comboValues.push({ name: adata.rows[ix][0], value: adata.rows[ix][0]});
                }
            }
            combo.setData(comboValues);

            combo.setSearchField('name');

        },this);
    },




    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setScheduleValue:function(){
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Process_SMS_Schedule.sql';
        dataSet.bind = [{
            name: 'host_ip',
            value: cfg.alert.sltId,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.sms_schedule.setValue(null);
            if(adata.rows.length !== 0){
                self.sms_schedule.setValue(adata.rows[0][0]);
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setProcessValue:function(){
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Process_Period.sql';
        dataSet.bind = [{
            name: 'host_ip',
            value: cfg.alert.sltId,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.process_period.setValue(null);
            if(adata.rows.length !== 0) {
                self.process_period.setValue(adata.rows[0][0]);
            }
        }, this);
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                this.onAdd();
                break;
            case 'Delete' :
                this.onDelete();
                break;
            case 'Refresh' :
                this.onRefresh();
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onAdd: function() {
        var hostIp = '';


        if (cfg.alert.sltId) {
            hostIp = cfg.alert.sltId;
        }

        this.ProcessGrid.addRow([
            '',
            hostIp,
            'need to insert'
        ]);

        this.ProcessGrid.drawGrid();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onDelete: function() {
        var self = this;
        var selectedRow;
        var ix, ixLen;
        var rowData;
        var processList = [];
        var recode;

        selectedRow = self.ProcessGrid.getSelectedRow();
        if(selectedRow.length < 1){
            return;
        }

        for(ix = 0, ixLen = self.ProcessGrid.getRowCount(); ix < ixLen; ix++){
            rowData = self.ProcessGrid.getRow(ix).data;

            if(rowData.process_name === selectedRow[0].data.process_name){
                recode = self.ProcessGrid.getRow(ix);
            }
            else{
                if(rowData.process_name !== ''){
                    processList.push(rowData.process_name);
                }
            }
        }

        // new 플랫폼에 대한 bind값 대처
        if(self.ScheduleName === undefined){
            self.ScheduleName = '';
        }

        self.ProcessGrid.deleteRecords([recode]);

        if(rowData.insert_flag === 'already insert'){
            config.ConfigEnv.delete_config( 0, 'HOST', 'Process Status', rowData.host_ip);
            if(self.ProcessGrid.getRowCount() !== 0){
                config.ConfigEnv.insert_config( 0 , 'HOST', 'Process Status', rowData.host_ip, self.ScheduleName) ;
                config.ConfigEnv.insert_tag_config( 0 , 'HOST', 'Process Status', rowData.host_ip , 'PROCESS_NAME', processList.join(',')) ;
                config.ConfigEnv.insert_tag_config( 0 , 'HOST', 'Process Status', rowData.host_ip , 'INTERVAL',self.process_period.lastValue * 60) ;
            }
            if(self.ProcessGrid.getRowCount() === 0){
                setTimeout(function() {
                    self.onRefresh();
                }, 300);
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onRefresh: function(save_flag) {
        this.serverSetQuery(save_flag);
        this.setProcessValue();
        this.setScheduleValue();

        var del = Ext.getCmp('cfg_process_alert_delete' + this.MODE);
        if (del) {
            del.setDisabled(true);
        }

        if (!cfg.alert.sltName) {
            Ext.getCmp('cfg_process_alert_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_process_alert_delete' + this.MODE).setDisabled(true);
        } else {
            Ext.getCmp('cfg_process_alert_add' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_process_alert_delete' + this.MODE).setDisabled(true);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    serverSetQuery: function(save_flag) {
        var dataSet = {};
        var self = this;

        if(!cfg.alert.sltId){
            return;
        }

        dataSet.bind = [{
            name: 'host_ip',
            value: cfg.alert.sltId,
            type : SQLBindType.STRING
        }];

        dataSet.sql_file = 'IMXConfig_Process_Observer.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.ProcessGrid.clearRows();
            if (adata && adata.rows) {
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    self.ProcessGrid.addRow([
                        adata.rows[ix][0],  // process_list
                        adata.rows[ix][1],  // host_ip
                        'already insert',
                        adata.rows[ix][2]  // interval
                    ]);
                }
            }
            self.ProcessGrid.drawGrid();

            if ( save_flag ){
                Ext.Msg.alert(common.Util.TR('Result'), common.Util.TR('Save Success'));
            }

        }, this);

    },

    applyButton : function(){
        var self = this;
        var ix, ixLen, jx, jxLen;
        var rowData;
        var processList = [];

        //주기 값이 0인 경우
        if(self.process_period.lastValue === 0){
            Ext.Msg.alert('Error', common.Util.TR('Process Observer Period Value can not be zero.'));
            return;
        }

        //그리드가 없을 경우
        if(self.ProcessGrid.getRowCount() === 0){
            return;
        }

        for(ix = 0, ixLen = self.ProcessGrid.getRowCount(); ix < ixLen; ix++){
            rowData = self.ProcessGrid.getRow(ix).data;
            rowData.self = self;

            if(rowData.process_name === ''){
                continue;
            }
            //중복 체크
            for(jx = 0, jxLen = processList.length; jx <jxLen; jx++){
                if(rowData.process_name == processList[jx]){
                    Ext.Msg.alert('Error', common.Util.TR('Duplicate Observed Process Name'));
                    return;
                }
            }

            processList.push(rowData.process_name);
        }

        //그리드가 추가되고 아무런 값이 없을 경우
       if(processList.length === 0){
            Ext.Msg.alert('Error', common.Util.TR('Please enter the Observed Process Name.'));
            return;
        }

        // new 플랫폼에 대한 bind값 대처
        if(self.ScheduleName === undefined){
            self.ScheduleName = '';
        }

        rowData.processList = processList;

        config.ConfigEnv.delete_config( 0, 'HOST', 'Process Status', rowData.host_ip, this.processDelete, rowData);
    },

    processDelete : function(){
        var set_value = this.set_value;
        var process_period = set_value.self.process_period.lastValue;
        config.ConfigEnv.insert_config( 0 , 'HOST', 'Process Status', set_value.host_ip, set_value.self.ScheduleName);
        config.ConfigEnv.insert_tag_config( 0 , 'HOST', 'Process Status', set_value.host_ip , 'PROCESS_NAME', set_value.processList.join(','));

        if(process_period === null){
            config.ConfigEnv.insert_tag_config( 0, 'HOST', 'Process Status', set_value.host_ip, 'INTERVAL', 300);
        } else {
            config.ConfigEnv.insert_tag_config( 0, 'HOST', 'Process Status', set_value.host_ip, 'INTERVAL', process_period * 60);
        }

        setTimeout(function(){
            set_value.self.onRefresh(true);
        },100);
    }
});