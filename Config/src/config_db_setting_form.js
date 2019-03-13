Ext.define('config.config_db_setting_form', {

    init: function(_state){
        var self = this;
        this.mode = _state ;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 600,
            height: 500,
            resizable: false,
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy',
            cls: 'config_tab'
        });

        self.form = form;

        if (_state === 'Add') {
            form.setTitle('Add DB');
        } else {
            form.setTitle('Edit DB');
        }

        var Panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var gridPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            flex: 1,
            height: '100%',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.DB_grid = Ext.create('Exem.adminGrid', {
            width              : '100%',
            height             : '100%',
            editMode           : false,
            useCheckBox        : false,
            checkMode          : Grid.checkMode.SIMPLE,
            showHeaderCheckbox : false,
            rowNumber          : true,
            localeType         : 'H:i:s',
            stripeRows         : true,
            defaultHeaderHeight: 26,
            usePager           : false,
            itemclick:function(dv, record, item, index) {
                self.DBClick(index, record.data);
            }
        });
        gridPanel.add(this.DB_grid);

        this.DB_grid.beginAddColumns();
        this.DB_grid.addColumn({text: common.Util.CTR('DB ID'),            dataIndex: 'db_id',         width: 80,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.DB_grid.addColumn({text: common.Util.CTR('DB Name'),          dataIndex: 'db_name',       width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.DB_grid.addColumn({text: common.Util.CTR('Host IP'),          dataIndex: 'host_ip',       width: 150, type: Grid.String, alowEdit: false, editMode: false, hide : true});
        this.DB_grid.addColumn({text: common.Util.CTR('SID'),              dataIndex: 'sid',           width: 150, type: Grid.String, alowEdit: false, editMode: false, hide : true});
        this.DB_grid.addColumn({text: common.Util.CTR('Listener Port'),    dataIndex: 'listener_port', width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide : true});
        this.DB_grid.addColumn({text: common.Util.CTR('DB User'),          dataIndex: 'db_user',       width: 150, type: Grid.String, alowEdit: false, editMode: false, hide : true});
        this.DB_grid.addColumn({text: common.Util.CTR('DB Password'),      dataIndex: 'db_password',   width: 150, type: Grid.String, alowEdit: false, editMode: false, hide : true});
        this.DB_grid.addColumn({text: common.Util.CTR('Table Space Usage Status of Collection'),   dataIndex: 'table_space_usage',   width: 150, type: Grid.String, alowEdit: false, editMode: false, hide : true});
        this.DB_grid.endAddColumns();

        Panel.add(gridPanel);

        var rightPanel = Ext.create('Ext.panel.Panel', {
            flex: 1,
            height: '100%',
            layout : 'vbox',
            border: false,
            bodyStyle: { background: '#eeeeee' },
            margin : '4 0 0 0'
        });

        this.DBIdEdit = Ext.create('Exem.NumberField', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            minValue : 1,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('DB ID')),
            allowBlank: true
        });

        this.DBNameEdit = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('DB Name')),
            allowBlank: true
        });

        this.hostIpEdit = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 16,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('Host IP')),
            allowBlank: true
        });

        this.SIDEdit = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('SID')),
            allowBlank: true
        });

        this.ListenerPortEdit = Ext.create('Ext.form.field.Number', {
            hideTrigger:true,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            minValue : 1,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('Listener Port')),
            allowBlank: true
        });

        this.DBUserEdit = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('DB User')),
            allowBlank: true
        });

        this.DBPassWordEdit = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            inputType: 'password',
            cls: 'login_area_idpweditbox',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('DB Password')),
            allowBlank: true
        });

        var choice = Ext.create('Ext.data.Store', {
            fields: 'name',
            data : [
                {"name":"Y"},
                {"name":"N"}
            ]
        });

        this.downloadTableSpaceEdit = Ext.create('Exem.ComboBox', {
            width: 270,
            labelWidth: 200,
            labelAlign: 'right',
            fieldLabel: Comm.RTComm.setFont(9, common.Util.TR('Table Space Usage Status of Collection')) + ':',
            store: choice,
            displayField: 'name',
            editable : false
        });

        rightPanel.add(this.DBIdEdit);
        rightPanel.add(this.DBNameEdit);
        rightPanel.add(this.hostIpEdit);
        rightPanel.add(this.SIDEdit);
        rightPanel.add(this.ListenerPortEdit);
        rightPanel.add(this.DBUserEdit);
        rightPanel.add(this.DBPassWordEdit);
        rightPanel.add(this.downloadTableSpaceEdit);

        Panel.add(rightPanel);

        var buttonPanel = Ext.create('Ext.panel.Panel', {
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
            text: common.Util.TR('Save'),
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
            text: common.Util.TR('Close'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                    self.parent.onButtonClick('Refresh');
                }
            }
        });

        buttonPanel.add(OKButton);
        buttonPanel.add(this.CancelButton);

        form.add(Panel);
        form.add(buttonPanel);

        form.show();
        this.DB_load();
    },

    DB_load : function(){
        var self = this;
        var dataSet = {};
        var dataRows;

        dataSet.sql_file = 'IMXConfig_DB_Setting_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if (adata.rows !== undefined && adata.rows.length > 0) {

                for (var ix = 0; ix < adata.rows.length; ix++) {
                    dataRows = adata.rows[ix];
                    self.DB_grid.addRow([
                        dataRows[0],    //db_id
                        dataRows[1],    //instance_name
                        dataRows[2],    //host_ip
                        dataRows[3],    //sid
                        dataRows[4],    //lsnr_port
                        dataRows[5],    //db_user
                        dataRows[7],    //db_password
                        dataRows[6]     //download_tablespace
                    ]);
                }
                self.DB_grid.drawGrid();

                if(this.mode === 'Edit'){
                    self.DBIdEdit.setDisabled(true);
                    self.DBNameEdit.setDisabled(true);

                    self.DBIdEdit.setValue(self.db_id);
                    self.DBNameEdit.setValue(self.db_name);
                    self.hostIpEdit.setValue(self.host_ip);
                    self.SIDEdit.setValue(self.sid);
                    self.ListenerPortEdit.setValue(self.listener_port);
                    self.DBUserEdit.setValue(self.db_user);
                    self.downloadTableSpaceEdit.setValue(self.table_space_usage);

                    for (ix = 0; ix < self.DB_grid.getRowCount(); ix++) {
                        if (self.DB_grid.getRow(ix).data.db_id === self.db_id) {
                            self.DB_grid.selectRow(ix);
                            /**
                             //self.DBPassWordEdit.setValue(self.DB_grid.getRow(ix).data.db_password);
                             **/
                        }
                    }
                    self.DBIdEdit.focus();
                }
            }
        }, this);
    },

    DBClick: function(index, recordData) {
        var self = this;
        self.DBIdEdit.setValue(recordData.db_id);
        self.DBNameEdit.setValue(recordData.db_name);
        self.hostIpEdit.setValue(recordData.host_ip);
        self.SIDEdit.setValue(recordData.sid);
        self.ListenerPortEdit.setValue(recordData.listener_port);
        self.DBUserEdit.setValue(recordData.db_user);
        self.downloadTableSpaceEdit.setValue(recordData.table_space_usage);
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

    save: function() {
        var self = this;
        var dataSet = {};
        var DBId = this.DBIdEdit.getValue();
        var hostIp = this.hostIpEdit.getValue();
        var SID = this.SIDEdit.getValue();
        var ListenerPort = this.ListenerPortEdit.getValue();
        var DBUser = this.DBUserEdit.getValue();
        var DBPassWord = this.DBPassWordEdit.getValue();
        var downloadTableSpace = this.downloadTableSpaceEdit.rawValue;

        // CHECK: Host Ip + Byte Check
        if (hostIp === '') {
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.hostIpEdit.focus();
            return;
        }

        var hostIpByteLen = this.getTextLength(hostIp);

        if(hostIpByteLen > 16){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.hostIpEdit.focus();
            return;
        }

        // CHECK: SID + Byte Check
        if (SID === '') {
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.SIDEdit.focus();
            return;
        }

        var SIDByteLen = this.getTextLength(SID);

        if(SIDByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.SIDEdit.focus();
            return;
        }
        // CHECK: Listener Port
        if (ListenerPort === null) {
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.ListenerPortEdit.focus();
            return;
        }

        // CHECK: DB User + Byte Check
        if (DBUser === '') {
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.DBUserEdit.focus();
            return;
        }

        var DBUserByteLen = this.getTextLength(DBUser);

        if(DBUserByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.DBUserEdit.focus();
            return;
        }
        // CHECK: DB Pass Word
        if (DBPassWord === '') {
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            this.DBPassWordEdit.focus();
            return;
        }
        // CHECK: Download Table Space
        if (downloadTableSpace === '') {
            Ext.Msg.alert('Error', common.Util.TR('Please enter Value.'));
            return;
        }

        //update
        dataSet.sql_file = 'IMXConfig_DBInfo_Update.sql';
        dataSet.bind = [{
            name: 'DBId',
            value: DBId,
            type : SQLBindType.INTEGER
        }, {
            name: 'hostIp',
            value: hostIp,
            type : SQLBindType.STRING
        }, {
            name: 'SID',
            value: SID,
            type : SQLBindType.STRING
        }, {
            name: 'DBUser',
            value: DBUser,
            type : SQLBindType.STRING
        }, {
            name: 'DBPassWord',
            value: DBPassWord,
            encrypt : true,
            type : SQLBindType.STRING
        }, {
            name: 'downloadTableSpace',
            value: downloadTableSpace,
            type : SQLBindType.STRING
        }, {
            name: 'listenerPort',
            value: ListenerPort,
            type : SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            self.CancelButton.fireEvent('click');
        }, this);
    }
});