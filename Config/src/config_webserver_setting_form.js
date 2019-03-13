Ext.define('config.config_webserver_setting_form', {

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
            closeAction: 'destroy'
        });

        if (_state === 'Add') {
            form.setTitle('Add WebServer');
        } else {
            form.setTitle('Edit WebServer');
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

        this.ws_grid = Ext.create('Exem.adminGrid', {
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
            defaultbufferSize  : 300,
            defaultPageSize    : 300,
            itemclick:function(dv, record, item, index) {
                self.wsClick(index, record.data);
            }
        });
        gridPanel.add(this.ws_grid);

        this.ws_grid.beginAddColumns();
        this.ws_grid.addColumn({text: common.Util.CTR('WS ID'),           dataIndex: 'ws_id',        width: 100, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.ws_grid.addColumn({text: common.Util.CTR('Webserver Name'),  dataIndex: 'ws_name',      width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.ws_grid.addColumn({text: common.Util.CTR('Host Name'),       dataIndex: 'host_name',    width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.ws_grid.addColumn({text: common.Util.CTR('IP'),              dataIndex: 'ip',           width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.ws_grid.endAddColumns();

        Panel.add(gridPanel);

        var rightPanel = Ext.create('Ext.panel.Panel', {
            flex: 1,
            height: '100%',
            layout : 'vbox',
            border: false,
            bodyStyle: { background: '#eeeeee' },
            margin : '4 0 0 0'
        });

        this.wsIdEdit = Ext.create('Exem.NumberField', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            minValue : 1,
            hideTrigger: true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('WS ID')),
            allowBlank: true
        });

        this.wsNameEdit = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Webserver Name')),
            allowBlank: true
        });

        this.hostNameEdit = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Host Name')),
            allowBlank: true
        });

        this.ipEdit = Ext.create('Ext.form.field.Text', {
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 32,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('IP')),
            allowBlank: true
        });

        rightPanel.add(this.wsIdEdit);
        rightPanel.add(this.wsNameEdit);
        rightPanel.add(this.hostNameEdit);
        rightPanel.add(this.ipEdit);

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
        this.ws_load();
    } ,

    ws_load: function(){
        var self = this;
        var dataSet = {};
        var whereList = '1=1';
        var orderBy = 'order by ws_id';
        var ix;

        dataSet.sql_file = 'IMXConfig_WsInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];
        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(aheader, adata) {
            if (adata.rows !== undefined) {
                self.ws_grid.clearRows();
                for (ix = 0; ix < adata.rows.length; ix++) {
                    self.ws_grid.addRow([
                        adata.rows[ix][0],  // ws_id
                        adata.rows[ix][1],  // ws_name
                        adata.rows[ix][3],  // host_name
                        adata.rows[ix][4]   // ip
                    ]);
                }
                self.ws_grid.drawGrid();

                switch (this.mode) {
                    case 'Add' :
                        self.wsIdEdit.setDisabled(false);
                        self.wsIdEdit.focus();
                        break;
                    case 'Edit' :
                        self.wsIdEdit.setDisabled(true);

                        self.wsIdEdit.setValue(self.ws_id);
                        self.wsNameEdit.setValue(self.ws_name);
                        self.hostNameEdit.setValue(self.host_name);
                        self.ipEdit.setValue(self.ip);

                        for (ix = 0; ix < self.ws_grid.getRowCount(); ix++) {
                            if (self.ws_grid.getRow(ix).data.ws_id === self.ws_id) {
                                self.ws_grid.selectRow(ix);
                            }
                        }

                        self.wsNameEdit.focus();
                        break;
                    default :
                        break;
                }
            }
        }, this);
    },

    wsClick: function(index, recordData) {
        var self = this;
        self.wsIdEdit.setValue(recordData.ws_id);
        self.wsNameEdit.setValue(recordData.ws_name);
        self.hostNameEdit.setValue(recordData.host_name);
        self.ipEdit.setValue(recordData.ip);
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
        var ix;
        var wsid = this.wsIdEdit.getValue();
        var wsname = this.wsNameEdit.getValue();
        var hostname = this.hostNameEdit.getValue();
        var ip = this.ipEdit.getValue();

        // CHECK: WebServer NAME + Byte Check
        if (wsname === '') {
            Ext.Msg.alert('Error', common.Util.TR('Please enter WebServer name.'));
            this.wsNameEdit.focus();
            return;
        }

        var wsNameByteLen = this.getTextLength(wsname);

        if(wsNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.wsNameEdit.focus();
            return;
        }
        // CHECK: HOST NAME + Byte Check
        if (hostname === '') {
            Ext.Msg.alert('Error', common.Util.TR('Please enter host name.'));
            this.hostNameEdit.focus();
            return;
        }

        var hostNameByteLen = this.getTextLength(hostname);

        if(hostNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.hostNameEdit.focus();
            return;
        }

        // CHECK: IP Byte Check
        var ipByteLen = this.getTextLength(ip);

        if(ipByteLen > 32){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.ipEdit.focus();
            return;
        }

        // CHECK: WebServer ID 중복 체크
        if (this.mode === 'Add') {
            for (ix = 0; ix < self.parent.webServerGrid.getRowCount(); ix++) {
                if (self.parent.webServerGrid.getRow(ix).data.ws_id === wsid) {
                    Ext.Msg.alert('Error', common.Util.TR('WebServer ID is duplicate.'));
                    return;
                }
            }
        }

        // CHECK: WebServer Name 중복 체크
        for (ix = 0; ix < this.parent.webServerGrid.getRowCount(); ix++) {

            if(self.parent.webServerGrid.getRow(ix).data.ws_name === this.ws_name){
                continue;
            }

            if (self.parent.webServerGrid.getRow(ix).data.ws_name === wsname) {
                Ext.Msg.alert('Error', common.Util.TR('WebServer Name is duplicate.'));
                return;
            }
        }

        var whereList, setList;
        var dataSet = {};

        if (this.mode === 'Add') {
            dataSet.sql_file = 'IMXConfig_Insert_WsInfo.sql';
            dataSet.replace_string = [{
                name: 'wsId',
                value: wsid
            }];
            dataSet.bind = [{
                name: 'wsName',
                value: wsname,
                type : SQLBindType.STRING
            }, {
                name: 'hostName',
                value: hostname,
                type : SQLBindType.STRING
            }, {
                name: 'ip',
                value: ip,
                type : SQLBindType.STRING
            }];

        } else if (this.mode === 'Edit') {
            whereList = 'ws_id = ' + wsid;

            setList   = 'ws_name   = \'' + wsname   + '\', ' +
                        'host_name = \'' + hostname + '\', ' +
                        'ip        = \'' + ip    + '\'';

            dataSet.sql_file = 'IMXConfig_Update_WsInfo.sql';
            dataSet.replace_string = [{
                name: 'whereList',
                value: whereList
            }, {
                name: 'setList',
                value: setList
            }];

        } else {
            return;
        }

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            self.CancelButton.fireEvent('click');
        }, this);

    }
});