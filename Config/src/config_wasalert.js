Ext.define('config.config_wasalert', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    target: null,
    sql : {
        get_server_set                  :   'IMXConfig_Get_ServerSet.sql',
        get_server_tag_value            :   'IMXConfig_Get_ServerTagValue.sql',
        get_group_set                   :   'IMXConfig_Get_GroupSet.sql',
        get_group_tag_value             :   'IMXConfig_Get_GroupTagValue.sql',
        get_group_tag_value_default     :   'IMXConfig_Get_GroupTagValue_default.sql'
    } ,

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        var self = this;

        this.saving = false;

        this.defaultValue = [
            ['XM_JDBC_CONNECTION_FAIL', 'CRITICAL'],
            ['XM_JDBC_CONN_NOTCLOSED', 'WARNING'],
            ['XM_JDBC_NOT_COMMIT_ROLLBACK', 'WARNING'],
            ['XM_JDBC_NOT_TOOMANYFETCH', 'WARNING'],
            ['XM_JVM_INCOMPATIBLECLASSCHANGEERROR', 'WARNING'],
            ['XM_JVM_OUTOFMEMORYERROR', 'CRITICAL'],
            ['XM_JVM_SOCKETEXCEPTION', 'WARNING'],
            ['XM_JVM_SOCKETTIMEOUTEXCEPTION', 'WARNING']
        ];

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                text: common.Util.TR('Apply'),
                //    id: 'cfg_wasalert_apply',
                cls : 'x-btn-default-toolbar-small',
                style : { backgroundColor: '#fafafa',
                    borderColor : '#bbb'
                },
                scope: this,
                handler: function() { self.apply(); }
            }]
        });

        this.target.add(toolbar);

        this.wasGroupAlertPanel = Ext.create('Ext.panel.Panel', {
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
            html: common.Util.usedFont(9, common.Util.TR('Default'))
        });

        this.defaultLabel = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: common.Util.usedFont(9, common.Util.TR('Group'))
        });

        this.wasGroupAlertPanel.add(this.groupLabel);
        this.wasGroupAlertPanel.add(this.defaultLabel);

        // Default 우선
        this.wasGroupAlertPanel.items.items[1].setVisible(false);
        this.wasGroupAlertPanel.items.items[2].setVisible(true);

        this.target.add(this.wasGroupAlertPanel);

        this.level = [];
        this.level.push({ name: 'WARNING', value: 'WARNING' });
        this.level.push({ name: 'CRITICAL', value: 'CRITICAL' });

        this.sms = [];

        var dataset  = {};
        dataset.sql_file = 'IMXConfig_Schedule.sql';

        WS.SQLExec(dataset, function(aheader, adata) {
            self.sms.length = 0;
            for (var ix = 0; ix < adata.rows.length; ix++) {
                self.sms.push({name: adata.rows[ix][0], value: adata.rows[ix][0]});
            }

            self.statGroupAlertGrid = Ext.create('Exem.adminGrid', {
                height: 250,
                width: '100%',
                border: false,
                editMode: true,
                useCheckBox: false,
                checkMode: Grid.checkMode.SINGLE,
                showHeaderCheckbox: false,
                rowNumber: true,
                localeType: 'H:i:s',
                stripeRows: true,
                defaultHeaderHeight: 26,
                usePager: false,
                defaultbufferSize: 300,
                defaultPageSize: 300
            });

            self.target.add(self.statGroupAlertGrid);

            self.statGroupAlertGrid.beginAddColumns();
            self.statGroupAlertGrid.addColumn({text: common.Util.CTR('Resource Name'), dataIndex: 'wasalert_resource_name', width: 300, type: Grid.String, alowEdit: false, editMode: false});
            self.statGroupAlertGrid.addColumn({text: common.Util.CTR('Level'),         dataIndex: 'wasalert_level',         width: 150, type: Grid.ComboBox, comboData: this.level, alowEdit: true, editMode: true});
            self.statGroupAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),  dataIndex: 'wasalert_sms',           width: 150, type: Grid.ComboBox, comboData: this.sms, alowEdit: true, editMode: true});
            self.statGroupAlertGrid.addColumn({text: common.Util.CTR('graytext'),      dataIndex: 'graytext',               width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
            self.statGroupAlertGrid.endAddColumns();

            self.statGroupAlertGrid.baseGrid.getView().getRowClass = function(record) {
                var cls;
                if (record.get('graytext') == 'gray') {
                    cls = 'grid-gray-text';
                } else {
                    cls = 'grid-normal-text';
                }
                return cls;
            };

            //

            self.wasServerAlertPanel = Ext.create('Ext.panel.Panel', {
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
            self.target.add(self.wasServerAlertPanel);

            self.wasServerAlertGrid = Ext.create('Exem.adminGrid', {
                flex: 1,
                width: '100%',
                border: false,
                editMode: true,
                useCheckBox: false,
                checkMode: Grid.checkMode.SINGLE,
                showHeaderCheckbox: false,
                rowNumber: true,
                localeType: 'H:i:s',
                stripeRows: true,
                defaultHeaderHeight: 26,
                usePager: false,
                defaultbufferSize: 300,
                defaultPageSize: 300
            });
            self.target.add(self.wasServerAlertGrid);

            self.wasServerAlertGrid.beginAddColumns();
            self.wasServerAlertGrid.addColumn({text: common.Util.TR('Server Id'),     dataIndex: 'wasalert_server_id',     width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
            self.wasServerAlertGrid.addColumn({text: common.Util.CTR('Resource Name'), dataIndex: 'wasalert_resource_name', width: 300, type: Grid.String, alowEdit: false, editMode: false});
            self.wasServerAlertGrid.addColumn({text: common.Util.CTR('Level'),         dataIndex: 'wasalert_level',         width: 150, type: Grid.ComboBox, comboData: this.level, alowEdit: false, editMode: true});
            self.wasServerAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),  dataIndex: 'wasalert_sms',           width: 150, type: Grid.ComboBox, comboData: this.sms, alowEdit: true, editMode: true});
            self.wasServerAlertGrid.addColumn({text: common.Util.TR('graytext'),      dataIndex: 'graytext',               width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
            self.wasServerAlertGrid.endAddColumns();

            self.wasServerAlertGrid.baseGrid.getView().getRowClass = function(record) {
                var cls;
                if (record.get('graytext') == 'gray') {
                    cls = 'grid-gray-text';
                } else {
                    cls = 'grid-normal-text';
                }
                return cls;
            };
        }, this);
    },

    onRefresh: function() {
        if (cfg.alert.sltExistSub && !cfg.alert.sltId && cfg.alert.sltGroup == 'Root') {
            // SELECT GROUP
            this.statGroupAlertGrid.setDisabled(false);
            this.wasServerAlertGrid.clearRows();
            this.groupTagValueDefault();
        } else if (!cfg.alert.sltExistSub && cfg.alert.sltId && cfg.alert.sltGroup != 'Root') {
            // SELECT WAS IN GROUP
            this.statGroupAlertGrid.setDisabled(true);
            this.groupTagValueDefault();
            this.serverSetQuery();
        } else if (!cfg.alert.sltExistSub && cfg.alert.sltId && cfg.alert.sltGroup == 'Root') {
            // SELECT WAS IN ROOT
            this.statGroupAlertGrid.clearRows();
            this.serverSetQuery();
        }
    },

    // 16-06-20 수정
    // callback으로 인해서 groupDataDraw나 serverDataDraw로 들어갔을 때 필요한 데이터가 없는 경우가 발생.
    // callback 안으로 함수를 넣고 동작하도록 순서를 정함.
    // group 경우
    // groupTagValueDefault -> groupSetQuery -> groupSetQueryResult -> groupTagValueQuery ->
    // groupTagValueQueryResult -> groupDataDraw 순으로 동작.
    // server 경우
    // serverSetQuery -> serverSetQueryResult -> serverTagValueQuery -> serverTagValueQueryResult ->
    // serverDataDraw 순으로 동작.

    groupTagValueDefault: function() {
        WS.SQLExec({
            sql_file: this.sql.get_group_tag_value_default
        }, function(aheader, adata){
            if (!this.groupDefaultTagValue) {
                this.groupDefaultTagValue = [];
            } else {
                this.groupDefaultTagValue.length = 0;
            }

            for (var ix = 0; ix < adata.rows.length; ix++) {
                this.groupDefaultTagValue.push([adata.rows[ix][0], adata.rows[ix][1]]);
            }
            this.groupSetQuery();
        }, this);
    },

    groupSetQuery: function() {
        var group_name = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;
        WS.SQLExec({
            sql_file: this.sql.get_group_set,
            bind: [  { name: 'group_name' , value: group_name, type : SQLBindType.STRING } ]
        }, this.groupSetQueryResult, this);
    },

    groupSetQueryResult: function(aheader, adata) {
        if (!this.groupSet) {
            this.groupSet = [];
        } else {
            this.groupSet.length = 0;
        }

        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.groupSet.push([adata.rows[ix][0], adata.rows[ix][1]]);
        }
        this.groupTagValueQuery();
    },

    groupTagValueQuery: function() {
        var group_name = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;
        WS.SQLExec({
            sql_file: this.sql.get_group_tag_value,
            bind: [  { name: 'group_name' , value: group_name, type : SQLBindType.STRING } ]
        }, this.groupTagValueQueryResult, this);
    },

    groupTagValueQueryResult: function(aheader, adata) {
        if (!this.groupTagValue) {
            this.groupTagValue = [];
        } else {
            this.groupTagValue.length = 0;
        }

        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.groupTagValue.push([ adata.rows[ix][0], adata.rows[ix][1], adata.rows[ix][2] ]);
        }

        this.groupDataDraw();
    },

    serverSetQuery: function() {
        var server_id = cfg.alert.sltId;
        WS.SQLExec({
            sql_file: this.sql.get_server_set,
            replace_string: [  { name: 'server_id' , value: server_id } ]
        }, this.serverSetQueryResult, this);
    },

    serverSetQueryResult: function(aheader, adata) {
        if (!this.serverSet) {
            this.serverSet = [];
        } else {
            this.serverSet.length = 0;
        }

        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.serverSet.push([adata.rows[ix][0], adata.rows[ix][1]]);
        }
        this.serverTagValueQuery();
    },

    serverTagValueQuery: function() {
        var server_id = cfg.alert.sltId;
        WS.SQLExec({
            sql_file: this.sql.get_server_tag_value,
            replace_string: [  { name: 'server_id' , value: server_id } ]
        }, this.serverTagValueQueryResult, this);
    },

    serverTagValueQueryResult: function(aheader, adata) {
        if (!this.serverTagValue) {
            this.serverTagValue = [];
        } else {
            this.serverTagValue.length = 0;
        }

        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.serverTagValue.push([adata.rows[ix][0], adata.rows[ix][1]]);
        }

        this.serverDataDraw();
    },

    groupDataDraw: function() {
        var ix, jx;
        var def;
        if (!this.groupDs) {
            this.groupDs = [];
        } else {
            this.groupDs.length = 0;
        }

        // GROUP DEFAULT DATA
        for(ix =0; ix < this.groupDefaultTagValue.length; ix++){
            this.groupDs.push([
                this.groupDefaultTagValue[ix][0],
                this.groupDefaultTagValue[ix][1],
                '',
                'gray'
            ]);
        }


        // GROUP DATA (TAG_VALUE)
        if(this.groupTagValue.length > 0) {
            for (ix = 0; ix < this.groupDs.length; ix++) {
                def = this.getDefault(this.groupDs[ix][0]);
                for ( jx = 0; jx < this.groupTagValue.length; jx++) {
                    if (this.groupDs[ix][0] == this.groupTagValue[jx][0]) {
                        this.groupDs[ix][1] = this.groupTagValue[jx][1];  /* alert_tag_value      */
                        this.groupDs[ix][2] = this.groupTagValue[jx][2];  /* sms_schedule_name    */
                        this.groupDs[ix][3] = (def == this.groupTagValue[jx][1]) ? 'gray' : 'black';  /* color    */
                        if (!this.groupDs[ix][3]) {
                            this.groupDs[ix][3] = '';
                        }
                    }
                }
            }
        }

        // GROUP DATA (SMS)
        if (this.groupSet.length > 0) {
            for (ix = 0; ix < this.groupDs.length; ix++) {
                for (jx = 0; jx < this.groupSet.length; jx++) {
                    if (this.groupDs[ix][0] == this.groupSet[jx][0]) {
                        this.groupDs[ix][2] = this.groupSet[jx][1];  /* sms_schedule_name    */
                        if (this.groupSet[jx][1] != 'null' && this.groupSet[jx][1] != '') {
                            this.groupDs[ix][3] = 'black';
                        }
                    }
                }
            }
        }

        // 디폴트 데이터 추가.
        this.statGroupAlertGrid.clearRows();
        for (ix = 0; ix < this.groupDs.length; ix++) {
            if (this.groupDs[ix][2] == 'null') {
                this.groupDs[ix][2] = '';
            }

            this.statGroupAlertGrid.addRow([
                this.groupDs[ix][0],    /* alert_resource_name  */
                this.groupDs[ix][1],    /* alert_tag_value      */
                this.groupDs[ix][2],    /* sms_schedule_name    */
                this.groupDs[ix][3]     /* color                */
            ]);
        }

        this.statGroupAlertGrid.drawGrid();
    },

    serverDataDraw: function() {
        var ix;
        var jx;
        var def;

        if (!this.serverDs) {
            this.serverDs = [];
        } else {
            this.serverDs.length = 0;
        }

        // DEFAULT DATA
        for (ix = 0; ix < this.defaultValue.length; ix++) {
            this.serverDs.push([
                this.defaultValue[ix][0],
                this.defaultValue[ix][1],
                '',
                'gray'
            ]);
        }

        // SERVER DATA (TAG_VALUE)
        if (this.serverTagValue.length > 0) {
            for (ix = 0; ix < this.serverDs.length; ix++) {
                def = this.getDefault(this.serverDs[ix][0]);
                for (jx = 0; jx < this.serverTagValue.length; jx++) {
                    if (this.serverDs[ix][0] == this.serverTagValue[jx][0]) {
                        this.serverDs[ix][1] = this.serverTagValue[jx][1];  /* alert_tag_value      */
                        this.serverDs[ix][2] = this.serverTagValue[jx][2];  /* sms_schedule_name    */
                        this.serverDs[ix][3] = (def == this.serverTagValue[jx][1]) ? 'gray' : 'black';  /* color    */
                        if (!this.serverDs[ix][3]) {
                            this.serverDs[ix][3] = '';
                        }
                    }
                }
            }
        }

        // GROUP DATA (SMS)
        if (this.serverSet.length > 0) {
            for (ix = 0; ix < this.serverDs.length; ix++) {
                for (jx = 0; jx < this.serverSet.length; jx++) {
                    if (this.serverDs[ix][0] == this.serverSet[jx][0]) {
                        this.serverDs[ix][2] = this.serverSet[jx][1];  /* sms_schedule_name    */
                        if (this.serverSet[jx][1] != 'null' && this.serverSet[jx][1] != '') {
                            this.serverDs[ix][3] = 'black';
                        }
                    }
                }
            }
        }

        // 디폴트 데이터 추가
        this.wasServerAlertGrid.clearRows();
        for (ix = 0; ix < this.serverDs.length; ix++) {
            if (this.serverDs[ix][2] == 'null') {
                this.serverDs[ix][2] = '';
            }
            this.wasServerAlertGrid.addRow([
                cfg.alert.sltId,        /* serevr_id            */
                this.serverDs[ix][0],   /* alert_resource_name  */
                this.serverDs[ix][1],   /* alert_tag_value      */
                this.serverDs[ix][2],   /* sms_schedule_name    */
                this.serverDs[ix][3]    /* color                */
            ]);
        }
        this.wasServerAlertGrid.drawGrid();
    },

    apply: function () {
        var modified, modifiedData, name;
        var group_name = cfg.alert.sltGroup == 'Root' ? cfg.alert.sltName : cfg.alert.sltGroup;

        var data = {},
            data_array = [];

        /*
         * SAVE CASE
         * ---------
         *   1. 그룹을 선택한 상태에서 그룹 데이터 수정 후 저장
         *   2. 그룹에 속해있는 WAS를 선택한 상태에서 WAS쪽 데이터를 수정 후 저장
         *   3. 그룹이 아닌 WAS를 선택한 상태에서 WAS쪽 데이터를 수정 후 저장
         */

        if (cfg.alert.sltGroup == 'Root') {
            if (cfg.alert.sltExistSub) {
                modified = this.statGroupAlertGrid.getModified();
            } else {
                modified = this.wasServerAlertGrid.getModified();
            }
        } else {
            modified = this.wasServerAlertGrid.getModified();
        }

        if(!this.saving) {
            this.saving = true;
            this.modifiedCount = 0;
            for (var ix = 0; ix < modified.length; ix++) {
                modifiedData = modified[ix].data;

                if (!modifiedData.wasalert_sms) {
                    modifiedData.wasalert_sms = '';
                }

                if (cfg.alert.sltExistSub) {
                    name = group_name;
                } else {
                    name = modifiedData.wasalert_server_id;
                }

                data.self = this;
                data.modifiedData = modifiedData;
                data.name = name;

                data_array.push(data);

                config.ConfigEnv.group_flag = cfg.alert.sltExistSub;
                config.ConfigEnv.delete_config(name, 'WAS', 'WAS Alert', modifiedData.wasalert_resource_name, this.wasDelete, data_array[0]);

                data = {};
                data_array = [];
            }
        }
    },

    wasDelete : function(){
        var set_value = this.set_value;
        var self = set_value.self;
        var modifiedData = set_value.modifiedData;
        var ix, ixLen, grid;
        var insertCheck = true;
        self.modifiedCount++;

        if (cfg.alert.sltGroup == 'Root') {
            if (cfg.alert.sltExistSub) {
                grid = self.statGroupAlertGrid;
            } else {
                grid = self.wasServerAlertGrid;
            }
        } else {
            grid = self.wasServerAlertGrid;
        }

        var defaultLevel = self.getDefault(modifiedData.wasalert_resource_name);

        for(ix = 0, ixLen = grid.getRowCount(); ix < ixLen; ix++) {
            if(modifiedData.wasalert_resource_name === grid.getRow(ix).data.wasalert_resource_name &&
                grid.getRow(ix).data.wasalert_sms === '' &&
                grid.getRow(ix).data.wasalert_level === defaultLevel){
                insertCheck = false;
            }
        }

        if(insertCheck){
            config.ConfigEnv.insert_tag_config( set_value.name, 'WAS', 'WAS Alert', modifiedData.wasalert_resource_name, 'LEVEL', modifiedData.wasalert_level );
            config.ConfigEnv.insert_config( set_value.name, 'WAS', 'WAS Alert', modifiedData.wasalert_resource_name, modifiedData.wasalert_sms ) ;

            if(self.modifiedCount == grid.getModified().length){
                setTimeout(function() {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    self.onRefresh();
                    self.saving = false;
                }, 100);
            }
        } else{
            if(self.modifiedCount == grid.getModified().length){
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                self.onRefresh();
                self.saving = false;
            }
        }
    },

    getDefault: function(resource_name) {
        var result;

        switch (resource_name) {
            case 'XM_TXN_PLC' :
            case 'XM_JVM_INCOMPATIBLECLASSCHANGEERROR' :
            case 'XM_JVM_SOCKETEXCEPTION' :
            case 'XM_JVM_SOCKETTIMEOUTEXCEPTION' :
            case 'XM_JDBC_CONN_NOTCLOSED' :
            case 'XM_JDBC_NOT_COMMIT_ROLLBACK' :
            case 'XM_JDBC_NOT_TOOMANYFETCH' :
            case 'XM_JDBC_TOOMANYFETCH':
                result = 'WARNING';
                break;
            case 'XM_JVM_OUTOFMEMORYERROR' :
            case 'XM_JDBC_CONNECTION_FAIL' :
                result = 'CRITICAL';
                break;
            default :
                break;
        }

        return result;
    }
});
