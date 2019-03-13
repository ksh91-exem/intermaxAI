Ext.define('config.config_trace_list_setting_form', {

    parent: null,


    init: function (_state_) {
        var self = this;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 600,
            height: 600,
            resizable: false,
            title: common.Util.TR('Trace List Add'),
            bodyStyle: {background: '#f5f5f5'},
            closeAction: 'destroy'
        });

        self.form = form;

        var panelB = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '0 4 4 4',
            padding: '1 1 1 1',
            border: false,
            bodyStyle: {background: '#eeeeee'}
        });

        var panelB1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            bodyStyle: {background: '#dddddd'}
        });

        var labelB = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Transaction List'))
        });

        panelB1.add(labelB);

        var panelB2 = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            margin: '2 2 2 2',
            padding: '1 1 1 1',
            flex: 1,
            border: false,
            bodyStyle: {background: '#eeeeee'}
        });

        var panelB21 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: {background: '#eeeeee'},
            items: [{
                xtype: 'label',
                x: 0,
                y: 5,
                width: 90,
                style: 'text-align:right;',
                html: Comm.RTComm.setFont(9, common.Util.TR('Search Txn'))
            }]
        });

        this.searchTxnComboBox = Ext.create('Ext.form.field.Text', {
            x: 100,
            y: 3,
            width : 350,
            data: [],
            enableKeyEvents: true,
            cls: 'config_tab'
        });

        var RetrieveButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Retrieve'),
            cls: 'x-btn-config-default',
            x: 455,
            y: 3,
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function () {
                    self.retrieve();
                }
            }
        });

        panelB21.add(this.searchTxnComboBox);
        panelB21.add(RetrieveButton);

        var panelB22 = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: {background: '#dddddd'}
        });

        this.txn_grid = Ext.create('Exem.adminGrid', {
            width: '100%',
            height: '100%',
            editMode: false,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            multiCheckable: true
        });
        panelB22.add(this.txn_grid);

        this.txn_grid.beginAddColumns();
        this.txn_grid.addColumn({
            text: common.Util.CTR('txn_id'),
            dataIndex: 'txn_id',
            width: 100,
            type: Grid.StringNumber,
            alowEdit: false,
            editMode: false,
            hide: true
        });
        this.txn_grid.addColumn({
            text: common.Util.CTR('Txn Name'),
            dataIndex: 'txn_name',
            width: 470,
            type: Grid.String,
            alowEdit: false,
            editMode: false
        });
        this.txn_grid.endAddColumns();

        panelB2.add(panelB21);
        panelB2.add(panelB22);

        panelB.add(panelB1);
        panelB.add(panelB2);

        var panelC = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 25,
            border: false,
            bodyStyle: {background: '#f5f5f5'}
        });

        var OKButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('OK'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function () {
                    self.fieldCheck();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Cancel'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function () {
                    this.up('.window').close();
                }
            }
        });

        form.add(panelB);
        form.add(panelC);

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.show();
    },

    retrieve: function(){
        var dataSet = {};
        var text = this.searchTxnComboBox.getValue();

        if(text == null){
            text = '';
        }

        dataSet.sql_file = 'IMXConfig_Txn_Search.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        dataSet.replace_string = [{
            name : 'search_text',
            value : text
        }];

        WS.SQLExec(dataSet, function(aheader, adata) {
            if (aheader.success) {
                //ExtJS 프레임워크 layout이벤트 중지
                this.txn_grid.suspendLayouts();
                this.txn_grid.clearRows();
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    this.txn_grid.addRow([
                        adata.rows[ix][2],  // txn_id
                        adata.rows[ix][1]  // txn_name
                    ]);
                }
                // ExtJS 프레임워크 layout이벤트실행
                this.txn_grid.resumeLayouts();
                this.txn_grid.doLayout();
                this.txn_grid.drawGrid();
            }
        }, this);
    },

    fieldCheck: function(){
        var select_count = this.txn_grid.getSelectedRow().length;

        if (select_count == 0) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please, select Transaction'));
            return;
        }
        this.save();
    },
    save: function(){
        var self = this;
        var dataSet = {};
        var user_id = Comm.config.login.user_id;
        var selectList = this.txn_grid.getSelectedRow();
        this.count = 0;

        dataSet.sql_file = 'IMXConfig_Trace_List_Delete.sql';

        for(var ix = 0; ix < selectList.length; ix++) {
            var txnName = selectList[ix].data.txn_name;

            dataSet.replace_string = [{
                name    :   'user_id',
                value   :   user_id
            }];

            dataSet.bind = [{
                name    :   'txn_name',
                value   :   txnName,
                type    :   SQLBindType.STRING
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            self.dataDelete(dataSet);
        }

    },
    dataDelete: function(dataSet){
        var self = this;

        WS.SQLExec(dataSet, function () {
            self.count++;
            if(self.count == this.txn_grid.getSelectedRow().length) {
                setTimeout(function () {
                    self.insertDataInfo();
                }, 30);
            }
        }, this);
    },

    insertDataInfo: function(){
        var self = this;
        var dataSet = {};
        var user_id = Comm.config.login.user_id;
        var selectList = this.txn_grid.getSelectedRow();
        this.count = 0;

        dataSet.sql_file = 'IMXConfig_Trace_List_Insert.sql';

        for(var ix = 0; ix < selectList.length; ix++) {
            var txnName = selectList[ix].data.txn_name;
            var txnId = selectList[ix].data.txn_id;

            dataSet.replace_string = [{
                name    :   'user_id',
                value   :   user_id
            }];

            dataSet.bind = [{
                name    :   'txn_name',
                value   :   txnName,
                type    :   SQLBindType.STRING
            }, {
                name    :   'txn_id',
                value   :   txnId,
                type    :   SQLBindType.STRING
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            self.dataInsert(dataSet);
        }
    },

    dataInsert: function(dataSet){
        var self = this;

        WS.SQLExec(dataSet, function () {
            self.count++;
            if(self.count == this.txn_grid.getSelectedRow().length) {
                setTimeout(function () {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    self.parent.onButtonClick('Refresh');
                    self.CancelButton.fireEvent('click');
                }, 30);
            }
        }, this);
    }
});