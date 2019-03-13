Ext.define('config.config_alert_addgroup', {
    // WAS & WEBSERVER
    MODE: '',
    DB_TYPE: '',
    target: null,
    parent: null,

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        var self = this;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            width: 500,
            height: 450,
            resizable: false,
            title: Comm.RTComm.setFont(9, common.Util.TR('Alert Group Configuration')),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 70,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.groupnameEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10,
            width: 463,
            labelWidth: 75,
            labelAlign: 'right',
            maxLength : 32,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('Group Name')),
            allowBlank: false
        });

        this.descriptionEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 37,
            width: 463,
            labelWidth: 75,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('Description')),
            allowBlank: true
        });

        var panelB = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '0 4 4 4',
            padding: '1 1 1 1',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelC = Ext.create('Ext.panel.Panel', {
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
                    self.save();
                }
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

        var panelB1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        var labelA = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Server List'))
        });

        var panelB2 = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        // Grid
        this.grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            // editMode: true,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            border: false,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });

        this.grid.beginAddColumns();
        this.grid.addColumn({text: common.Util.CTR('Server ID'),        dataIndex: 'server_id',        width: 262, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Server Name'),      dataIndex: 'server_name',      width: 252, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Alert Group Name'), dataIndex: 'alert_group_name', width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.endAddColumns();


        var dataSet = {};
        var whereList = '1=1';
        var orderBy = '';

        switch ( cfg.alert.sltMode ){
            case 'Agent':
                dataSet.sql_file = 'IMXConfig_WasInfo.sql';
                whereList = '(was_name <> \'\' or was_name is not null) ' +
                    'and (type != \'APIM\' or type is null)' +
                    'and (type != \'TP\' or type is null)';
                orderBy = 'order by was_id';
                break;
            case 'DB'   :
                dataSet.sql_file = 'IMXConfig_DBInfo.sql';
                whereList = 'monitorable = \'1\' ';
                break ;
            case 'WS'   :
                dataSet.sql_file = 'IMXConfig_WsInfo.sql';
                break ;
            case 'APIM' :
                dataSet.sql_file = 'IMXConfig_WasInfo.sql';
                whereList = 'type = \'APIM\'';
                orderBy = 'order by was_id';
                break ;
            case 'TP' :
                dataSet.sql_file = 'IMXConfig_WasInfo.sql';
                whereList = 'type = \'TP\'';
                orderBy = 'order by was_id';
                break ;
            default: break ;
        }

        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.wasInfoResult, this);



        form.add(panelA);
        form.add(panelB);
        form.add(panelC);

        panelA.add(this.groupnameEdit);
        panelA.add(this.descriptionEdit);

        panelB.add(panelB1);
        panelB.add(panelB2);

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        panelB1.add(labelA);
        panelB2.add(this.grid);

        form.show();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    wasInfoResult: function(aheader, adata) {
        var dbName;
        var index = 4;
        if (cfg.alert.sltMode === 'WS') {
            index = 5;
        }

        this.grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            // Was -> [0] : was_id, [1] : was_name,      [2] : host_name, [3] : gather_id, [4] : alert_group_name
            // DB  -> [0] : db_id,  [1] : instance_name, [2] : host_name, [3] : char_set,  [4] : alert_group_name, [5] : monitorable
            // WS  -> [0] : ws_id,  [1] : ws_name,       [2] : ws_type,   [3] : host_name, [4] : ip,               [5] : alert_group_name, [6] : gather_id
            dbName = adata.rows[ix][1];

            this.grid.addRow([adata.rows[ix][0], dbName, adata.rows[ix][index]]);
        }
        this.grid.drawGrid();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        if (!this.fieldCheck()) {
            return;
        }

        var dataSet = {};
        var d = this.grid.getSelectedRow();
        var groupName = this.groupnameEdit.getValue();
        var ix ;
        var serverType;
        this.endData = this.grid.getSelectedRow().length;
        this.startData = 0;

        dataSet.sql_file = 'IMXConfig_Null_Was_Group.sql';

        if(this.MODE === 'Agent'){
            serverType = 'and (type != \'APIM\' or type is null)' +
                'and (type != \'TP\' or type is null)';
        } else if (this.MODE === 'APIM'){
            serverType = 'and type = \'APIM\'';
        } else if (this.MODE === 'TP'){
            serverType = 'and type = \'TP\'';
        }

        dataSet.bind = [{
            name: 'groupName',
            value: groupName,
            type : SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'serverType',
            value: serverType
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            for ( ix = 0 ; ix < d.length; ix ++ ) {
                this.updateWasGroup(ix,groupName);
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    updateWasGroup : function(ix,groupName){
        var dataSet = {};
        var d = this.grid.getSelectedRow();
        var serverType;

        dataSet.sql_file = 'IMXConfig_Update_Was_Group.sql';

        if(this.MODE === 'Agent'){
            serverType = 'and (type != \'APIM\' or type is null)' +
                'and (type != \'TP\' or type is null)';
        } else if (this.MODE === 'APIM'){
            serverType = 'and type = \'APIM\'';
        } else if (this.MODE === 'TP'){
            serverType = 'and type = \'TP\'';
        }

        dataSet.bind = [{
            name    :   'groupName',
            value   :   groupName,
            type    :   SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'was_id',
            value: d[ix].data.server_id
        }, {
            name: 'serverType',
            value: serverType
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            this.startData++;
            if(this.startData === this.endData){
                var deleteFlag = false;
                this.insertAlertGroup(groupName,deleteFlag);
            }
        }, this);
    },

    insertAlertGroup : function(groupName,deleteFlag){
        var dataSet = {};

        var serverType = this.MODE ;
        serverType = ('Agent' === serverType) ? 'WAS' : serverType;

        dataSet.bind = [{
            name    :   'groupName',
            value   :   groupName,
            type    :   SQLBindType.STRING
        }, {
            name    :   'description',
            value   :   this.descriptionEdit.getValue(),
            type    :   SQLBindType.STRING
        }, {
            name    :   'serverType',
            value   :   serverType,
            type    :   SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        if(!deleteFlag){
            deleteFlag = true;
            dataSet.sql_file = 'IMXConfig_Delete_Alert_Group.sql';
            WS.SQLExec(dataSet, function() {
                this.insertAlertGroup(groupName,deleteFlag);
            }, this);
        } else{
            dataSet.sql_file = 'IMXConfig_Insert_Alert_Group.sql';

            WS.SQLExec(dataSet, function() {
                var dataSet = {};
                if(this.MODE === 'Agent'){
                    dataSet.sql_file = 'IMXConfig_Was_Tree_Info.sql';
                } else if(this.MODE === 'APIM') {
                    dataSet.sql_file = 'IMXConfig_APIM_Tree_Info.sql';
                } else if(this.MODE === 'TP') {
                    dataSet.sql_file = 'IMXConfig_TP_Tree_Info.sql';
                }
                WS.SQLExec(dataSet, this.noGroupChildTreeDelete, this);
            }, this);
        }
    },

    noGroupChildTreeDelete: function(header, data){
        var ix, ixLen;
        var rowData, groupData;
        if(data[0]){
            groupData = data[0].rows;
            for(ix = 0, ixLen = groupData.length; ix < ixLen; ix++){
                rowData = groupData[ix];
                if(rowData[0] === null || rowData[1] === ''){
                    this.groupInfoDelete(rowData[2]);
                }else{
                    if(ix+1 === ixLen){
                        this.parent.onRefresh();
                        this.CancelButton.fireHandler('click');
                    }
                }
            }
        }
    },

    groupInfoDelete : function(deleteGroupName){
        var dataSet = {};
        var self = this;
        var serverType = this.MODE ;
        serverType = ('Agent' === serverType) ? 'WAS' : serverType;

        dataSet.sql_file = 'IMXConfig_Delete_Alert_Group.sql';

        dataSet.bind = [{
            name: 'groupName',
            value: deleteGroupName,
            type : SQLBindType.STRING
        }, {
            name: 'serverType',
            value: serverType,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function() {
            setTimeout(function() {
                self.parent.onRefresh();
                self.CancelButton.fireHandler('click');
            }, 100);
        }, this);
    },

    load: function(_groupname_) {
        var self = this;
        var d = null;
        var serverType = this.MODE ;
        serverType = ('Agent' === serverType) ? 'WAS' : serverType;

        var dataSet = {};
        var whereList;
        var orderBy = '';


        this.init();


        dataSet.sql_file = 'IMXConfig_AlertGroupInfo.sql';
        whereList = 'group_name = \'' + _groupname_ + '\' and server_type = \'' + serverType + '\' ';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.groupnameEdit.setValue(adata.rows[0][0]);
            self.groupnameEdit.setDisabled(true) ;
            //16.02.22 sql에서 가져오는 데이터 위치가 달라 정상적으로 변경
            self.descriptionEdit.setValue(adata.rows[0][2]);
        }, this);


        if ( cfg.alert.sltMode === 'Agent' || cfg.alert.sltMode === 'APIM' || cfg.alert.sltMode === 'TP') {
            dataSet.sql_file = 'IMXConfig_WasInfo.sql';
            orderBy = 'order by was_id';
        } else if (cfg.alert.sltMode === 'DB') {
            dataSet.sql_file = 'IMXConfig_DBInfo.sql';
        } else {
            dataSet.sql_file = 'IMXConfig_WsInfo.sql';
        }

        if( cfg.repository === 'MSSQL'){
            whereList = 'alert_group_name collate Korean_Wansung_CS_AS = \''+_groupname_+'\' ';
        } else{
            whereList = 'alert_group_name = \''+_groupname_+'\' ';
        }

        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        WS.SQLExec(dataSet, function (aheader, adata) {
            for (var ix = 0; ix < adata.rows.length; ix++) {
                for (var jx = 0; jx < this.grid.getRowCount(); jx++) {
                    d = this.grid.getRow(jx);
                    if (d.data.server_id === adata.rows[ix][0]) {
                        this.grid.selectRow(jx, true);
                    }
                }
            }
        }, this);

    },

    getTextLength : function(str){
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            if (encodeURI(str.charAt(i)).length == 9) {
                //DB가 UTF-8 일경우 한글 byte는 3byte 취급.
                len += 2;
            }
            len++;
        }
        return len;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    fieldCheck: function() {
        var result = true;
        var groupName = this.groupnameEdit.getValue();
        var description = this.descriptionEdit.getValue();
        var select_count = this.grid.getSelectedRow().length;

        // byte check
        var groupNameByteLen = this.getTextLength(groupName);

        if(groupNameByteLen > 32){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.groupnameEdit.focus();
            result = false;
            return result;
        }

        // byte check
        var descriptionByteLen = this.getTextLength(description);

        if(descriptionByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.descriptionEdit.focus();
            result = false;
            return result;
        }

        if (groupName === '') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter group name.'));
            result = false;
            return result;
        }

        if (select_count === 0) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('At least one server must be selected.'));
            result = false;
            return result;
        }

        return result;
    }
});
