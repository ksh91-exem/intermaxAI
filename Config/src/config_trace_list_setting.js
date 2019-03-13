Ext.define('config.config_trace_list_setting', {
    extend: 'Exem.Form',
    layout: {type: 'vbox', align: 'stretch'},
    width: '100%',
    height: '100%',

    target: null,

    sql: {
        agent_order_list: 'IMXConfig_User_Agent_Order.sql',
        group_order_list: 'IMXConfig_User_Group_Order.sql',
        service_list: 'IMXConfig_User_Service_Order.sql'
    },

    constructor: function (config) {
        this.superclass.constructor.call(this, config);
    },

    init: function (target) {
        var self = this;
        this.target = target;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: {background: '#eeeeee'}
        });

        this.target.add(panel);

        var traceListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            width: 400,
            border: false,
            split: true,
            margin: '3 3 3 3',
            padding: '2 2 2 2',
            bodyStyle: {background: '#eeeeee'}
        });

        panel.add(traceListPanel);

        var traceListPanelTitle = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: {background: '#eeeeee'},
            items: [{
                xtype: 'label',
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 4',
                bodyStyle: {background: '#eeeeee'},
                html: common.Util.usedFont(9, common.Util.TR('Trace List'))
            }, {
                xtype: 'toolbar',
                width: 95,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_add.png" width="15" height="15">',
                    id: 'cfg_trace_list_add',
                    scope: this,
                    handler: function () { self.onButtonClick('Add'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_trace_list_delete',
                    scope: this,
                    handler: function () { self.onButtonClick('Delete'); }
                }, {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    id: 'cfg_trace_list_refresh',
                    scope: this,
                    handler: function () { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        traceListPanel.add(traceListPanelTitle);

        this.gridTxnName = Ext.create('Exem.adminGrid', {
            width: '100%',
            flex: 1,
            editMode: false,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            multiCheckable: false,
            sortableColumns: false
        });
        traceListPanel.add(this.gridTxnName);

        this.gridTxnName.beginAddColumns();
        this.gridTxnName.addColumn({
            text: common.Util.CTR('Txn Name'),
            dataIndex: 'txn_name',
            width: 300,
            type: Grid.String,
            alowEdit: false,
            editMode: false
        });
        this.gridTxnName.endAddColumns();

        this.onRefresh();
    },

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
    onAdd: function(){
        var list_from = Ext.create('config.config_trace_list_setting_form');
        list_from.parent = this ;
        list_from.init('Add');
    },

    onDelete: function(){
        var self = this;
        var dataSet = {};
        var user_id = Comm.config.login.user_id;
        var txnNameList = this.gridTxnName.getSelectedRow();
        this.count = 0;

        if(txnNameList.length == 0){
            return;
        }

        Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
            if (btn === 'yes') {
                for(var ix = 0; ix < txnNameList.length; ix++) {
                    var txnName = txnNameList[ix].data.txn_name;
                    dataSet.sql_file = 'IMXConfig_Trace_List_Delete.sql';

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

                    self.txnDelete(dataSet);
                }
            }
        });
    },

    txnDelete: function(dataSet){
        var self = this;

        WS.SQLExec(dataSet, function () {
            self.count++;
            if(self.count == this.gridTxnName.getSelectedRow().length) {
                setTimeout(function () {
                    self.onRefresh();
                }, 100);
            }
        }, this);
    },

    onRefresh: function(){
        var dataSet = {};
        var self = this;
        var user_id = Comm.config.login.user_id;

        dataSet.sql_file = 'IMXConfig_Trace_List_Info.sql';

        dataSet.replace_string = [{
            name    :   'user_id',
            value   :   user_id
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(aheader, adata){
            if(aheader.success){
                self.gridTxnName.clearRows();
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    var dataRows = adata.rows[ix];
                    self.gridTxnName.addRow([
                        dataRows[1]    //txn_txn_name
                    ]);
                }
                self.gridTxnName.drawGrid();
            }
        }, this);
    }
});