Ext.define('config.config_alert_statalert', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    MODE: '',
    target: null,
    groupSetData: [],
    serverSetData: [],

    grpSetData: {},
    svrSetData: {},

    randomAddSeq: 0,
    randomEdtSeq: 0,
    randomDelSeq: 0,

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
                id: 'cfg_statalert_add' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_statalert_edit' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_statalert_delete' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Refresh'); }
            }]
        });

        this.target.add(toolbar);

        this.statGroupAlertPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            items: [{
                xtype: 'label',
                x: 5,
                y: 4,
                html: ''
            }],
            bodyStyle: { background: '#dddddd' }
        });

        this.groupLabel = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Default'))
        });

        this.defaultLabel = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Group'))
        });

        this.statGroupAlertPanel.add(this.groupLabel);
        this.statGroupAlertPanel.add(this.defaultLabel);

        // Default 우선
        this.statGroupAlertPanel.items.items[1].setVisible(true);
        this.statGroupAlertPanel.items.items[2].setVisible(false);

        this.target.add(this.statGroupAlertPanel);

        this.statGroupAlertGrid = Ext.create('Exem.adminGrid', {
            height: 150,
            width: '100%',
            border: false,
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function(dv, record) {
                var edit = Ext.getCmp('cfg_statalert_edit' + self.MODE);
                if (edit) {
                    if (record.get('graytext') == 'gray') {
                        edit.setDisabled(true);
                    } else {
                        //그룹일때만 편집이 가능하도록. 1503.25 min by정과장님
                        if ( cfg.alert.sltGroup == 'Root' && cfg.alert.sltExistSub ){
                            edit.setDisabled( false );
                        }else{
                            edit.setDisabled( true );
                        }

                    }
                }

                var del = Ext.getCmp('cfg_statalert_delete' + self.MODE);
                if (del) {
                    if (record.get('graytext') == 'gray') {
                        del.setDisabled(true);
                    } else {
                        //그룹일때만 삭제가 가능하도록. 1503.25 min by정과장님
                        if ( cfg.alert.sltGroup == 'Root' && cfg.alert.sltExistSub ){
                            del.setDisabled( false );
                        }else{
                            del.setDisabled( true );
                        }
                    }
                }

                edit = null;
                del  = null;
            }
        });
        this.target.add(this.statGroupAlertGrid);

        this.statGroupAlertGrid.beginAddColumns();
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),       dataIndex: 'alert_name', width: 200, type: Grid.String, alowEdit: true,  editMode: true});
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Stat Type'),        dataIndex: 'stat_type',  width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Comparison'),       dataIndex: 'comparison', width: 100, type: Grid.String, alowEdit: true,  editMode: true});
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Warning'),          dataIndex: 'warning',    width:  80, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Critical'),         dataIndex: 'critical',   width:  80, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Repeat'),           dataIndex: 'repeat',     width: 100, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),     dataIndex: 'sms',        width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Delay Time'),       dataIndex: 'delay_time', width: 100, type: Grid.Number, alowEdit: true,  editMode: true});
        if(cfg.alert.sltMode === 'Agent'){
            this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Full Thread Dump'), dataIndex: 'thread_dump',width: 150, type: Grid.String, alowEdit: true,  editMode: true});
            this.statGroupAlertGrid.addColumn({text: common.Util.CTR('Use Script'),       dataIndex: 'use_script', width: 100, type: Grid.String, alowEdit: true,  editMode: true});
        }
        this.statGroupAlertGrid.addColumn({text: common.Util.CTR('graytext'),         dataIndex: 'graytext',   width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.statGroupAlertGrid.endAddColumns();

        this.statGroupAlertGrid.baseGrid.getView().getRowClass = function(record) {
            var cls = '';
            if (record.get('graytext') == 'gray') {
                cls = 'grid-gray-text';
            } else {
                cls = 'grid-normal-text';
            }
            return cls;
        };

        this.statServerAlertPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            items: [{
                xtype: 'label',
                x: 5,
                y: 4,
                html: common.Util.usedFont(9, common.Util.TR('Server'))
            }],
            bodyStyle: { background: '#dddddd' }
        });
        this.target.add(this.statServerAlertPanel);

        this.statServerAlertGrid = Ext.create('Exem.adminGrid', {
            flex: 1,
            width: '100%',
            border: false,
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function() {
                var edit = Ext.getCmp('cfg_statalert_edit' + self.MODE);
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_statalert_delete' + self.MODE);
                if (del) {
                    del.setDisabled(false);
                }

                edit = null;
                del  = null;
            }
        });
        this.target.add(this.statServerAlertGrid);

        this.statServerAlertGrid.beginAddColumns();
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),       dataIndex: 'alert_name', width: 200, type: Grid.String, alowEdit: true,  editMode: true});
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('Stat Type'),        dataIndex: 'stat_type',  width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('Comparison'),       dataIndex: 'comparison', width: 100, type: Grid.String, alowEdit: true,  editMode: true});
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('Warning'),          dataIndex: 'warning',    width:  80, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('Critical'),         dataIndex: 'critical',   width:  80, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('Repeat'),           dataIndex: 'repeat',     width: 100, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),     dataIndex: 'sms',        width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('Delay Time'),       dataIndex: 'delay_time', width: 100, type: Grid.Number, alowEdit: true,  editMode: true});
        if(cfg.alert.sltMode === 'Agent'){
            this.statServerAlertGrid.addColumn({text: common.Util.CTR('Full Thread Dump'), dataIndex: 'thread_dump',width: 150, type: Grid.String, alowEdit: true,  editMode: true});
            this.statServerAlertGrid.addColumn({text: common.Util.CTR('Use Script'),       dataIndex: 'use_script', width: 100, type: Grid.String, alowEdit: true,  editMode: true});
        }
        this.statServerAlertGrid.addColumn({text: common.Util.CTR('graytext'),         dataIndex: 'graytext',   width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.statServerAlertGrid.endAddColumns();
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                this.onAdd();
                break;
            case 'Edit' :
                this.onEdit();
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

    onAdd: function() {
        //this.refreshGroupRegStatList();

        var statalert_form = Ext.create('config.config_alert_statalert_form');
        statalert_form.parent = this;
        statalert_form.sltInfo = cfg.alert;
        statalert_form.init('Add');
    },

    onEdit: function() {
        var d = null;

        if (cfg.alert.sltExistSub) {
            d = this.statGroupAlertGrid.getSelectedRow()[0].data;
        } else {
            d = this.statServerAlertGrid.getSelectedRow()[0].data;
        }

        if(d.alert_name === ('Response Time' + ' (' + decodeURI('%C2%B5') + 's)')){
            d.alert_name = 'Response Time';
        }

        var statalert_form = Ext.create('config.config_alert_statalert_form');
        statalert_form.parent         = this;
        statalert_form.stat_type      = d.stat_type;
        statalert_form.alert_name     = d.alert_name;
        statalert_form.comparison     = d.comparison;
        statalert_form.repeat         = d.repeat;
        statalert_form.warning_value  = d.warning;
        statalert_form.critical_value = d.critical;
        statalert_form.sms_schedule   = d.sms;
        statalert_form.delay_time     = d.delay_time;
        statalert_form.thread_dump    = d.thread_dump;
        statalert_form.use_script     = d.use_script;
        statalert_form.init('Edit');
    },

    onDelete: function() {
        var self = this;
        var d = null;

        if (cfg.alert.sltExistSub) {
            d = this.statGroupAlertGrid.getSelectedRow()[0].data;
        } else {
            d = this.statServerAlertGrid.getSelectedRow()[0].data;
        }


        if (d != undefined) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                if (btn === 'yes') {
                    var name, server_type, alert_type, alert_resource_name ;

                    if (cfg.alert.sltExistSub) {
                        name = cfg.alert.sltName;
                    }else {
                        name = cfg.alert.sltId;
                    }

                    switch (cfg.alert.sltMode) {
                        case 'Agent' :
                            server_type = 'WAS';
                            alert_type = 'Stat Alert';
                            alert_resource_name = d.alert_name;

                            var dotNetStatList = [
                                '.NET CPU Usage(%)',
                                '.NET Free Heap(MB)',
                                '.NET.NET Heap Size(MB)',
                                '.NET Heap Usage(%)',
                                '.NET Memory Size(MB)',
                                '.NET Thread Count',
                                '.NET GC Count',
                                '.NET GC Time'
                            ];

                            var jvmDotNetStatList = [
                                'JVM(.NET) CPU Usage(%)',
                                'JVM(.NET) Free Heap(MB)',
                                'JVM(.NET) Heap Size(MB)',
                                'JVM(.NET) Heap Usage(%)',
                                'JVM(.NET) Memory Size(MB)',
                                'JVM(.NET) Thread Count',
                                'JVM(.NET) GC Count',
                                'JVM(.NET) GC Time'
                            ];

                            var jvmStatTranseObj = {
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
                            };

                            if (jvmDotNetStatList.includes(d.alert_name) || dotNetStatList.includes(d.alert_name)) {
                                alert_resource_name = jvmStatTranseObj[d.alert_name];
                            }
                            break ;
                        case 'WS' :
                            server_type = 'WEBSERVER';
                            alert_type = 'Stat Alert';
                            alert_resource_name = d.alert_name;
                            break ;
                        case 'DB' :
                            server_type = cfg.alert.sltType;
                            alert_type = 'Stat Alert';
                            alert_resource_name = d.alert_name;
                            break;
                        case 'APIM' :
                            server_type = 'APIM';
                            alert_type = 'Stat Alert';
                            alert_resource_name = d.alert_name;
                            break ;
                        case 'TP' :
                            server_type = 'TP';
                            alert_type = 'Stat Alert';
                            alert_resource_name = d.alert_name;
                            break ;
                        default :
                            break;
                    } // end_switch

                    config.ConfigEnv.group_flag = cfg.alert.sltExistSub ;
                    config.ConfigEnv.delete_config( name, server_type, alert_type, alert_resource_name, self.deleteComplete, self );
                }

                self = null ;
                name = null ;
                server_type = null ;
                alert_type = null ;
            });
        }
    },

    deleteComplete: function(){
        var self = this.set_value;
        self.onRefresh();
    },

    onRefresh: function() {
        this.statGroupAlertPanel.setVisible(true);
        this.statGroupAlertGrid.setVisible(true);
        this.statGroupAlertGrid.setHeight(150);

        this.statServerAlertPanel.setVisible(true);
        this.statServerAlertGrid.setVisible(true);

        // Default 우선
        this.statGroupAlertPanel.items.items[1].setVisible(true);
        this.statGroupAlertPanel.items.items[2].setVisible(false);

        if (!cfg.alert.sltExistSub && cfg.alert.sltGroup == 'Root' && cfg.alert.sltFirstChild == undefined) {
            if (this.statGroupAlertPanel.items.items[1]) {
                this.statGroupAlertPanel.items.items[1].setVisible(true);
            }
            if (this.statGroupAlertPanel.items.items[2]) {
                this.statGroupAlertPanel.items.items[2].setVisible(false);
            }
        } else {
            if (this.statGroupAlertPanel.items.items[1]) {
                this.statGroupAlertPanel.items.items[1].setVisible(false);
            }
            if (this.statGroupAlertPanel.items.items[2]) {
                this.statGroupAlertPanel.items.items[2].setVisible(true);

                if (cfg.alert.sltGroup == 'Root' && cfg.alert.sltExistSub) {
                    this.statGroupAlertPanel.items.items[2].update(common.Util.usedFont(9, common.Util.TR('Group')) + ' (' + cfg.alert.sltName + ')');
                } else {
                    this.statGroupAlertPanel.items.items[2].update(common.Util.usedFont(9, common.Util.TR('Group')) + ' (' + cfg.alert.sltGroup + ')');
                }
            }
        }

        if (cfg.alert.sltGroup == 'Root' && !cfg.alert.sltExistSub) {
            this.statServerAlertPanel.items.items[0].update(common.Util.usedFont(9, common.Util.TR('Server')) + ' (' + cfg.alert.sltName + ')');
        }

        if (cfg.alert.sltGroup != 'Root' && !cfg.alert.sltExistSub) {
            this.statServerAlertPanel.items.items[0].update(common.Util.usedFont(9, common.Util.TR('Server')) + ' (' + cfg.alert.sltName + ')');
        }

        if (cfg.alert.sltGroup == 'Root' && cfg.alert.sltExistSub) {
            this.statServerAlertPanel.items.items[0].update(common.Util.usedFont(9, common.Util.TR('Server')) );
        }

        if (cfg.alert.sltExistSub) {
            this.groupSetQuery();
            this.statServerAlertGrid.clearRows();
        } else {
            this.groupSetQuery();
        }
        //this.refreshGroupRegStatList();

        var edit = Ext.getCmp('cfg_statalert_edit' + this.MODE);
        if (edit) {
            edit.setDisabled(true);
        }

        var del = Ext.getCmp('cfg_statalert_delete' + this.MODE);
        if (del) {
            del.setDisabled(true);
        }

        if (cfg.alert.sltName) {

            Ext.getCmp('cfg_statalert_add' + this.MODE).setDisabled(false);
            Ext.getCmp('cfg_statalert_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_statalert_delete' + this.MODE).setDisabled(true);

            /**
             //1509.23 -> 자식없는 그룹은 Alert설정하는 추가, 편집기능 모두 disabled로 변경(min)

             if ( !cfg.alert.sltExistSub ){
                Ext.getCmp('cfg_statalert_add' + this.MODE).setDisabled(true);
            }
             **/

        } else {
            Ext.getCmp('cfg_statalert_add' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_statalert_edit' + this.MODE).setDisabled(true);
            Ext.getCmp('cfg_statalert_delete' + this.MODE).setDisabled(true);
        }

        edit = null;
        del  = null;
    },

    groupSetQuery: function() {
        var serverType = '';
        var groupName = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;

        switch (cfg.alert.sltMode) {
            case 'Agent' : serverType += 'and server_type = \'WAS\' ';
                break;
            case 'DB'    :
                if ( cfg.alert.sltType == null || cfg.alert.sltType == undefined ) {
                    serverType += 'and server_type is null ';
                } else {
                    serverType += 'and server_type = \''+cfg.alert.sltType+'\' ';
                }
                break;
            case 'WS'    : serverType += 'and server_type = \'WEBSERVER\' ';
                break;
            case 'APIM'  : serverType += 'and server_type = \'APIM\' ';
                break;
            case 'TP'    : serverType += 'and server_type = \'TP\' ';
                break;
            default :
                break;
        }

        var dataSet = {};

        var addWhereList = serverType;
        var orderBy = 'order by alert_resource_name ';

        dataSet.sql_file = 'IMXConfig_AlertGroupSet.sql';
        dataSet.bind = [{
            name: 'groupName',
            value: groupName,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'Stat Alert',
            type : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name: 'addWhereList',
            value: addWhereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.groupSetQueryResult, this);
    },

    groupSetQueryResult: function(aheader, adata) {
        this.groupSetData.length = 0;
        for (var ix = 0; ix < adata.rows.length; ix++) {
            if ( adata.rows[ix][1] == 'WAS' ){
                adata.rows[ix][1] = 'Agent' ;
            }
            this.groupSetData.push(adata.rows[ix]);
        }
        ix = null ;
        this.groupTagValueQuery();
    },

    groupTagValueQuery: function() {
        var serverType = '';
        var group_name = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;

        switch (cfg.alert.sltMode) {
            case 'Agent' : serverType = 'WAS';
                break;
            case 'DB'    : serverType = cfg.alert.sltType;
                break;
            case 'WS'    : serverType = 'WEBSERVER';
                break;
            case 'APIM'    : serverType = 'APIM';
                break;
            case 'TP'    : serverType = 'TP';
                break;
            default :
                break;
        }

        var groupNameList = '\'_default_alert_\', \'' + group_name + '\' ';

        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_AlertGroupTagValue.sql';
        dataSet.bind = [{
            name: 'serverType',
            value: serverType,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'Stat Alert',
            type : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name: 'groupNameList',
            value: groupNameList
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.groupTagValueQueryResult, this);
    },

    groupTagValueQueryResult: function(aheader, adata) {
        var self = this;
        var A = '';
        var d = null;
        var gray = '';
        var resources = [];
        var group_name = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;

        this.grpSetData = null;
        this.grpSetData = {};

        for (var ix = 0; ix < adata.rows.length; ix++) {
            A = adata.rows[ix][3];
            if (resources.indexOf(A) == -1) {
                resources.push(A);
                this.grpSetData[A] = {};
            }
        }

        var setValue = function(_group_name_) {
            var _rows = null;
            var _alertname = '';
            var _groupsetdata = null;
            for (var ix = 0; ix < adata.rows.length; ix++) {
                _rows = adata.rows[ix];
                for (var jx = 0; jx < resources.length; jx++) {
                    _alertname = resources[jx];
                    if (_rows[0] == _group_name_ && _rows[3] == _alertname) {
                        switch (_rows[4]) {
                            case 'COMPARISON'     : self.grpSetData[_alertname].comparison     = _rows[5];
                                break;
                            case 'CRITICAL_VALUE' : self.grpSetData[_alertname].critical_value = _rows[5];
                                break;
                            case 'REPEAT'         : self.grpSetData[_alertname].repeat         = _rows[5];
                                break;
                            case 'STAT_TYPE'      : self.grpSetData[_alertname].stat_type      = _rows[5];
                                break;
                            case 'WARNING_VALUE'  : self.grpSetData[_alertname].warning_value  = _rows[5];
                                break;
                            case 'DELAY_TIME'     : self.grpSetData[_alertname].delay_time     = _rows[5];
                                break;
                            case 'THREAD_DUMP'    : self.grpSetData[_alertname].thread_dump    = _rows[5];
                                break;
                            case 'USE_SCRIPT'     : self.grpSetData[_alertname].use_script     = _rows[5];
                                break;
                            default :
                                break;
                        }
                    }
                    if (_group_name_ != '_default_alert_') {
                        for (var cx = 0; cx < self.groupSetData.length; cx++) {
                            _groupsetdata = self.groupSetData[cx];
                            if (_groupsetdata[0] == _group_name_ && _groupsetdata[1] == cfg.alert.sltMode && _groupsetdata[2] == 'Stat Alert' && _groupsetdata[3] == _alertname) {
                                self.grpSetData[_alertname].sms_schedule = _groupsetdata[4];
                            }
                        }
                    }
                }
            }
        };

        setValue('_default_alert_');
        setValue(group_name);

        this.statGroupAlertGrid.clearRows();

        for (var key in this.grpSetData) {
            if(this.grpSetData.hasOwnProperty(key)){
                d = this.grpSetData[key];
                gray = 'notgray';
                if (cfg.alert.sltMode == 'Agent') {
                    switch (key) {
                        case 'Active Transactions' :
                            if(d.stat_type == 'WAS STAT' && d.comparison == '>=' && d.warning_value == '20'  && d.critical_value == '30' && d.repeat == '1')
                                gray = 'gray';
                            break;
                        case 'OS CPU(%)' :
                            if(d.stat_type == 'OS STAT'    && d.comparison == '>=' && d.warning_value == '80' && d.critical_value == '90' && d.repeat == '1')
                                gray = 'gray';
                            break;
                        case 'JVM CPU Usage(%)' :
                            if(d.stat_type == 'JVM STAT'   && d.comparison == '>=' && d.warning_value == '80' && d.critical_value == '90' && d.repeat == '1')
                                gray = 'gray';
                            break;
                        default :
                            gray = 'group';
                            break;
                    }
                } else if (cfg.alert.sltMode == 'DB' || cfg.alert.sltMode == 'WS') {
                    switch (key) {
                        case 'OS CPU(%)' :
                            if(d.stat_type == 'OS STAT'    && d.comparison == '>=' && d.warning_value == '80' && d.critical_value == '90' && d.repeat == '1')
                                gray = 'gray';
                            break;
                        default :
                            gray = 'group';
                            break;
                    }
                }

                if(key === 'Response Time' && cfg.alert.sltMode === 'APIM') {
                    this.statGroupAlertGrid.addRow([
                        key + ' (' + decodeURI('%C2%B5') + 's)',
                        this.grpSetData[key].stat_type,
                        this.grpSetData[key].comparison,
                        parseInt(this.grpSetData[key].warning_value),
                        parseInt(this.grpSetData[key].critical_value),
                        parseInt(this.grpSetData[key].repeat),
                        this.grpSetData[key].sms_schedule,
                        this.grpSetData[key].delay_time ? parseInt(this.grpSetData[key].delay_time) : 0,
                        this.grpSetData[key].thread_dump,
                        this.grpSetData[key].use_script,
                        gray
                    ]);
                } else{
                    var dotNetStatListObj = {
                        'JVM CPU Usage(%)'  : '.NET CPU Usage(%)',
                        'JVM Free Heap(MB)' : '.NET Free Heap(MB)',
                        'JVM Heap Size(MB)' : '.NET Heap Size(MB)',
                        'JVM Heap Usage(%)' : '.NET Heap Usage(%)',
                        'JVM Memory Size(MB)' : '.NET Memory Size(MB)',
                        'JVM Thread Count' : '.NET Thread Count',
                        'JVM GC Count' : '.NET GC Count',
                        'JVM GC Time' : '.NET GC Time'
                    };

                    var jvmDotNetStatListObj = {
                        'JVM CPU Usage(%)'  : 'JVM(.NET) CPU Usage(%)',
                        'JVM Free Heap(MB)' : 'JVM(.NET) Free Heap(MB)',
                        'JVM Heap Size(MB)' : 'JVM(.NET) Heap Size(MB)',
                        'JVM Heap Usage(%)' : 'JVM(.NET) Heap Usage(%)',
                        'JVM Memory Size(MB)' : 'JVM(.NET) Memory Size(MB)',
                        'JVM Thread Count' : 'JVM(.NET) Thread Count',
                        'JVM GC Count' : 'JVM(.NET) GC Count',
                        'JVM GC Time' : 'JVM(.NET) GC Time'
                    };

                    var resource_name, stat_type;

                    if (this.grpSetData[key].stat_type == 'JVM STAT') {
                        if (cfg.alert.sltAppType == 'JVM(.NET)') {
                            resource_name = jvmDotNetStatListObj[key];
                            stat_type = 'JVM(.NET) STAT';
                        } else if (cfg.alert.sltAppType == 'NET') {
                            resource_name = dotNetStatListObj[key];
                            stat_type = '.NET STAT';
                        } else {
                            resource_name = key;
                            stat_type = this.grpSetData[key].stat_type;
                        }
                    } else {
                        resource_name = key;
                        stat_type = this.grpSetData[key].stat_type;
                    }

                    this.statGroupAlertGrid.addRow([
                        resource_name,
                        stat_type,
                        this.grpSetData[key].comparison,
                        parseInt(this.grpSetData[key].warning_value),
                        parseInt(this.grpSetData[key].critical_value),
                        parseInt(this.grpSetData[key].repeat),
                        this.grpSetData[key].sms_schedule,
                        this.grpSetData[key].delay_time ? parseInt(this.grpSetData[key].delay_time) : 0,
                        this.grpSetData[key].thread_dump,
                        this.grpSetData[key].use_script,
                        gray
                    ]);
                }

            }
        }

        this.grpSetData = null;
        this.statGroupAlertGrid.drawGrid();

        this.serverSetQuery();
    },

    serverSetQuery: function() {
        var serverId = cfg.alert.sltId;
        var serverType = '';

        if (!serverId)
            return;
        if (serverId == '')
            return;

        if (Comm.RTComm.isInteger(serverId)) {
            switch (cfg.alert.sltMode) {
                case 'Agent' :
                    serverType = 'WAS';
                    break;
                case 'DB'  :
                    serverType = cfg.alert.sltType;
                    break;
                case 'WS'  :
                    serverType = 'WEBSERVER';
                    break;
                case 'APIM'  :
                    serverType = 'APIM';
                    break;
                case 'TP'  :
                    serverType = 'TP';
                    break;
                default :
                    break;
            }

            var dataSet = {};
            var addWhereList = 'and server_type = \'' + serverType + '\' ';
            var orderBy = 'order by alert_resource_name ';
            dataSet.sql_file = 'IMXConfig_AlertServerSet.sql';
            dataSet.bind = [{
                name: 'serverId',
                value: serverId,
                type : SQLBindType.INTEGER
            }, {
                name: 'alertType',
                value: 'Stat Alert',
                type : SQLBindType.STRING
            }];
            dataSet.replace_string = [{
                name: 'addWhereList',
                value: addWhereList
            }, {
                name: 'orderBy',
                value: orderBy
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, this.serverSetQueryResult, this);
        }
    },

    serverSetQueryResult: function(aheader, adata) {
        this.serverSetData.length = 0;
        for (var ix = 0; ix < adata.rows.length; ix++) {
            if ( adata.rows[ix][1] == 'WAS' ){
                adata.rows[ix][1] = 'Agent' ;
            }
            this.serverSetData.push(adata.rows[ix]);
        }
        this.serverTagValueQuery();
    },

    serverTagValueQuery: function() {
        var serverId = cfg.alert.sltId;
        var serverType = '';

        if (serverId == '' || !serverId)
            return;

        switch (cfg.alert.sltMode) {
            case 'Agent' : serverType = 'WAS';
                break;
            case 'DB'    : serverType = cfg.alert.sltType;
                break;
            case 'WS'    : serverType = 'WEBSERVER';
                break;
            case 'APIM'    : serverType = 'APIM';
                break;
            case 'TP'    : serverType = 'TP';
                break;
            default :
                break;
        }

        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_AlertServerTagValue.sql';
        dataSet.bind = [{
            name: 'serverId',
            value: serverId,
            type : SQLBindType.INTEGER
        }, {
            name: 'serverType',
            value: serverType,
            type : SQLBindType.STRING
        }, {
            name: 'alertType',
            value: 'Stat Alert'
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.serverTagValueQueryResult, this);
    },

    serverTagValueQueryResult: function(aheader, adata) {
        var self = this;
        var A = '';
        var resources = [];
        var id = cfg.alert.sltId;
        var ix = 0;
        var d = null;
        var D = null;

        this.svrSetData = null;
        this.svrSetData = {};

        for ( ix = 0; ix < adata.rows.length; ix++) {
            A = adata.rows[ix][3];
            if (resources.indexOf(A) == -1) {
                resources.push(A);
                this.svrSetData[A] = {};
            }
        }

        var _rows = null;
        var _alertname = '';
        var _serversetdata = null;
        for (ix = 0; ix < adata.rows.length; ix++) {
            _rows = adata.rows[ix];
            for (var jx = 0; jx < resources.length; jx++) {
                _alertname = resources[jx];
                if (_rows[0] == id && _rows[3] == _alertname) {
                    switch (_rows[4]) {
                        case 'COMPARISON'     : self.svrSetData[_alertname].comparison     = _rows[5];
                            break;
                        case 'CRITICAL_VALUE' : self.svrSetData[_alertname].critical_value = _rows[5];
                            break;
                        case 'REPEAT'         : self.svrSetData[_alertname].repeat         = _rows[5];
                            break;
                        case 'STAT_TYPE'      : self.svrSetData[_alertname].stat_type      = _rows[5];
                            break;
                        case 'WARNING_VALUE'  : self.svrSetData[_alertname].warning_value  = _rows[5];
                            break;
                        case 'DELAY_TIME'     : self.svrSetData[_alertname].delay_time     = _rows[5];
                            break;
                        case 'THREAD_DUMP'    : self.svrSetData[_alertname].thread_dump    = _rows[5];
                            break;
                        case 'USE_SCRIPT'     : self.svrSetData[_alertname].use_script    = _rows[5];
                            break;
                        default :
                            break;
                    }
                }
                if (id != '_default_alert_') {
                    for (var cx = 0; cx < self.serverSetData.length; cx++) {
                        _serversetdata = self.serverSetData[cx];
                        if (_serversetdata[0] == id && (_serversetdata[1] == cfg.alert.sltMode || _serversetdata[1] == cfg.alert.sltType) && _serversetdata[2] == 'Stat Alert' && _serversetdata[3] == _alertname) {
                            self.svrSetData[_alertname].sms_schedule = _serversetdata[4];
                        }
                    }
                }
            }
        }

        try {
            this.statServerAlertGrid.clearRows();
            for (var key in this.svrSetData) {
                if(this.svrSetData.hasOwnProperty(key)){
                    if(key === 'Response Time' && cfg.alert.sltMode === 'APIM') {
                        this.statServerAlertGrid.addRow([
                            key + ' (' + decodeURI('%C2%B5') + 's)',
                            this.svrSetData[key].stat_type,
                            this.svrSetData[key].comparison,
                            parseInt(this.svrSetData[key].warning_value),
                            parseInt(this.svrSetData[key].critical_value),
                            parseInt(this.svrSetData[key].repeat),
                            this.svrSetData[key].sms_schedule,
                            this.svrSetData[key].delay_time ? parseInt(this.svrSetData[key].delay_time) : 0,
                            this.svrSetData[key].thread_dump,
                            this.svrSetData[key].use_script,
                            ''
                        ]);
                    } else {
                        var dotNetStatListObj = {
                            'JVM CPU Usage(%)'  : '.NET CPU Usage(%)',
                            'JVM Free Heap(MB)' : '.NET Free Heap(MB)',
                            'JVM Heap Size(MB)' : '.NET Heap Size(MB)',
                            'JVM Heap Usage(%)' : '.NET Heap Usage(%)',
                            'JVM Memory Size(MB)' : '.NET Memory Size(MB)',
                            'JVM Thread Count' : '.NET Thread Count',
                            'JVM GC Count' : '.NET GC Count',
                            'JVM GC Time' : '.NET GC Time'
                        };

                        var jvmDotNetStatListObj = {
                            'JVM CPU Usage(%)'  : 'JVM(.NET) CPU Usage(%)',
                            'JVM Free Heap(MB)' : 'JVM(.NET) Free Heap(MB)',
                            'JVM Heap Size(MB)' : 'JVM(.NET) Heap Size(MB)',
                            'JVM Heap Usage(%)' : 'JVM(.NET) Heap Usage(%)',
                            'JVM Memory Size(MB)' : 'JVM(.NET) Memory Size(MB)',
                            'JVM Thread Count' : 'JVM(.NET) Thread Count',
                            'JVM GC Count' : 'JVM(.NET) GC Count',
                            'JVM GC Time' : 'JVM(.NET) GC Time'
                        };

                        var resource_name, stat_type;

                        if (this.svrSetData[key].stat_type == 'JVM STAT') {
                            if (cfg.alert.sltAppType == 'JVM(.NET)') {
                                resource_name = jvmDotNetStatListObj[key];
                                stat_type = 'JVM(.NET) STAT';
                            } else if (cfg.alert.sltAppType == 'NET') {
                                resource_name = dotNetStatListObj[key];
                                stat_type = '.NET STAT';
                            } else {
                                resource_name = key;
                                stat_type = this.svrSetData[key].stat_type;
                            }
                        } else {
                            resource_name = key;
                            stat_type = this.svrSetData[key].stat_type;
                        }

                        this.statServerAlertGrid.addRow([
                            resource_name,
                            stat_type,
                            this.svrSetData[key].comparison,
                            parseInt(this.svrSetData[key].warning_value),
                            parseInt(this.svrSetData[key].critical_value),
                            parseInt(this.svrSetData[key].repeat),
                            this.svrSetData[key].sms_schedule,
                            this.svrSetData[key].delay_time ? parseInt(this.svrSetData[key].delay_time) : 0,
                            this.svrSetData[key].thread_dump,
                            this.svrSetData[key].use_script,
                            ''
                        ]);
                    }
                }
            }
        } finally {
            this.statServerAlertGrid.drawGrid();
            this.svrSetData = null;
        }

        // DEFAULT 검사
        for (ix = self.statGroupAlertGrid.getRowCount()-1; ix >= 0 ; ix--) {
            d = self.statGroupAlertGrid.getRow(ix).data;
            for (jx = 0; jx < self.statServerAlertGrid.getRowCount(); jx++) {
                D = self.statServerAlertGrid.getRow(jx).data;
                if (d.alert_name == D.alert_name) {
                    self.statGroupAlertGrid.deleteRow(ix);
                }
            }
        }
    },

    refreshGroupRegStatList: function() {
        var dataSet = {};
        var groupOrServerId = cfg.alert.sltId;
        var serverType = '';

        switch (cfg.alert.sltMode) {
            case 'Agent' : serverType = 'WAS';
                break;
            case 'DB'    : serverType = cfg.alert.sltType;
                break;
            case 'WS'    : serverType = 'WEBSERVER';
                break;
            default :
                break;
        }
        //16.02.23 sql Opening error 수정 sltName 에서 waslds.join(',')으로 변경 그에 따라 " = -> in ()" 으로 변경
        if (cfg.alert.sltExistSub) {
            groupOrServerId = cfg.alert.wasIds.join(',');
        } else {
            if ( groupOrServerId == '' || !groupOrServerId || serverType == '' || !serverType )
                return;
        }

        dataSet.sql_file = 'IMXConfig_Stat_Alert_List.sql';
        dataSet.bind = [{
            name    :   'serverType',
            value   :   serverType,
            type : SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name    :   'groupOrServerId',
            value   :   groupOrServerId
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet , this.refreshGroupRegStatListResult, this);
    },

    refreshGroupRegStatListResult: function(aheader, adata) {
        cfg.alertWas.regStatList.length = 0;
        if (adata.rows) {
            for (var ix = 0; ix < adata.rows.length; ix++) {
                cfg.alertWas.regStatList.push(adata.rows[ix][0]);
            }
        }
    }
});
