Ext.define('config.config_groupwas_ordering', {
    extend: 'Exem.Form',
    layout: {type: 'vbox', align: 'stretch'},
    width: '100%',
    height: '100%',

    target: null,

    sql : {
        agent_order_list : 'IMXConfig_User_Agent_Order.sql',
        group_order_list : 'IMXConfig_User_Group_Order.sql',
        service_list : 'IMXConfig_User_Service_Order.sql'
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(target) {
        var self = this;
        this.target = target;

        var panelText, gridText;

        if(common.Menu.isBusinessPerspectiveMonitoring){
            panelText   = common.Util.TR('Tier List');
            gridText    = common.Util.TR('Tier');
        } else{
            panelText   = common.Util.TR('Business Group List');
            gridText    = common.Util.TR('Business Group');
        }

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false
        });

        this.target.add(toolbar);

        var serviceName = Ext.create('Exem.AjaxComboBox', {
            labelWidth: (Comm.Lang == 'en'? 90: Comm.Lang == 'ja'? 60 : 55),
            width: 200,
            fieldLabel: common.Util.TR('Service Name') + ' :',
            margin: '0 5 0 10',
            forceSelection: true,
            listeners : {
                scope: this,
                select: function(combo, selection) {
                    if (this.service_name == null) {
                        this.service_name = '';
                    }

                    this.service_id = selection.get('value');
                    this.service_name = selection.get('name');
                    this.onRefresh();
                },
                change: function(combo) {
                    if (combo.getValue() == null) {
                        this.service_name = '';
                        combo.reset();
                        this.service_id = null;
                        this.service_name = null;
                        this.onRefresh();
                    } else {
                        this.service_id = combo.getValue();
                        this.service_name = combo.getRawValue();
                        this.onRefresh();
                    }
                }
            }
        });

        self.serviceName = serviceName;

        this.setServiceName(serviceName);

        toolbar.add(serviceName);

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.target.add(panel);

        var groupOrderPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            width: 400,
            border: false,
            split: true,
            margin: '3 3 3 3',
            padding: '2 2 2 2',
            bodyStyle: { background: '#eeeeee' }
        });

        panel.add(groupOrderPanel);

        var groupOrderPanelTitle = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                xtype: 'label',
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 4',
                bodyStyle: { background: '#eeeeee' },
                html: common.Util.usedFont(9, panelText)
            }, {
                xtype: 'toolbar',
                width: 35,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_user_group_ordering_edit',
                    scope: this,
                    handler: function() { self.showOrderingWindow('Group'); }
                }]
            }]
        });

        groupOrderPanel.add(groupOrderPanelTitle);

        this.gridGroup = Ext.create('Exem.adminGrid', {
            width : '100%',
            flex: 1,
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
            multiCheckable: false,
            sortableColumns: false
        });
        groupOrderPanel.add(this.gridGroup);

        this.gridGroup.beginAddColumns();
        this.gridGroup.addColumn({text: gridText, dataIndex: 'order_group', width: 350, type: Grid.String, alowEdit: false, editMode: false});
        this.gridGroup.endAddColumns();

        var wasOrderPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            width: 400,
            border: false,
            split: true,
            margin: '3 3 3 3',
            padding: '2 2 2 2',
            bodyStyle: { background: '#eeeeee' }
        });

        panel.add(wasOrderPanel);

        var wasOrderPanelTitle = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                xtype: 'label',
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 4',
                bodyStyle: { background: '#eeeeee' },
                html: common.Util.usedFont(9, common.Util.TR('Agent List'))
            }, {
                xtype: 'toolbar',
                width: 35,
                height: 30,
                border: false,
                items: [{
                    xtype : 'button',
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_user_agent_ordering_edit',
                    scope: this,
                    handler: function() { self.showOrderingWindow('Agent'); }
                }]
            }]
        });

        wasOrderPanel.add(wasOrderPanelTitle);

        this.gridWas = Ext.create('Exem.adminGrid', {
            width : '100%',
            flex: 1,
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
            multiCheckable: false,
            sortableColumns: false
        });
        wasOrderPanel.add(this.gridWas);

        this.gridWas.beginAddColumns();
        this.gridWas.addColumn({text: common.Util.CTR('Agent ID'),   dataIndex: 'order_wasid', width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
        this.gridWas.addColumn({text: common.Util.CTR('Agent Name'), dataIndex: 'order_was',   width: 350, type: Grid.String, alowEdit: false, editMode: false});
        this.gridWas.endAddColumns();

        var emptyPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 3 3 3',
            padding: '2 2 2 2',
            bodyStyle: { background: '#eeeeee' }
        });

        panel.add(emptyPanel);
    },

    setServiceName: function(combo){
        var self = this;
        var dataset  = {};

        dataset.sql_file = this.sql.service_list;
        dataset.replace_string = [{
            name: "login_id",
            value: '\'' + Comm.config.login.login_id + '\''
        }];

        if(common.Util.isMultiRepository()){
            dataset.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataset, function(aheader, adata){
            var comboValues = [];
            if (adata != null){
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    comboValues.push({ name: adata.rows[ix][1], value: adata.rows[ix][0]});
                }
            }
            combo.setData(comboValues);
            combo.setSearchField('name');
            self.serviceName.selectRow(0);
        },this);
    },

    showOrderingWindow: function(type){
        var orderList, selectedGrid;
        var ix, ixLen;

        if(type == 'Group'){
            selectedGrid = this.gridGroup;
        }
        else if(type == 'Agent'){
            selectedGrid = this.gridWas;
        }
        else {
            return ;
        }

        orderList = [];
        for(ix = 0, ixLen = selectedGrid.getRowCount(); ix < ixLen; ix++){
            orderList.push(selectedGrid.getRow(ix).data);
        }

        var orderingWindow = Ext.create('Exem.MoveColumnWindow', {
            type : type,
            width : 800,
            height : 500,
            parent : this,
            title : common.Util.TR(type + ' Order Settings') + ' ( ' + common.Util.TR('Selected Service') + ' : ' + this.service_name + ' )',
            columnInfo : orderList,
            useDefaultBtn : false,
            leftGridTitle : common.Util.TR('Current Order'),
            rightGridTitle : common.Util.TR('Modified Order'),
            okFn : this.apply
        });

        orderingWindow.initBase();
    },

    onRefresh: function() {
        this.groupRefresh();
        this.wasRefresh();
    },

    groupRefresh: function() {
        var dataSet = {};

        if (!this.service_id)
            return;

        dataSet.sql_file = this.sql.group_order_list;
        dataSet.replace_string = [
            {
                name: "service_id",
                value: this.service_id
            },
            {
                name: "user_id",
                value: Comm.config.login.user_id
            }
        ];
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.groupRefreshResult, this);
    },

    wasRefresh: function() {
        var dataSet = {};

        if (!this.service_id)
            return;

        dataSet.sql_file = this.sql.agent_order_list;
        dataSet.replace_string = [
            {
                name: "service_id",
                value: this.service_id
            },
            {
                name: "user_id",
                value: Comm.config.login.user_id
            }
        ];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.wasRefreshResult, this);
    },

    groupRefreshResult: function(header, data) {
        var ix, ixLen, editBtn;

        editBtn = Ext.getCmp('cfg_user_group_ordering_edit');
        if(!common.Util.checkSQLExecValid(header, data)){
            editBtn.setDisabled(true);

            console.warn('config_groupwas_ordering-groupRefreshResult');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (!this.gmGroup) {
            this.gmGroup = [];
        }

        if (data.rows.length == 0){
            this.gridGroup.clearRows();
        }

        if (data.rows.length > 0) {
            this.gmGroup.length = 0;

            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                this.gmGroup.push(data.rows[ix][0]);
            }

            this.gridGroup.clearRows();
            for (ix = 0; ix < this.gmGroup.length; ix++) {
                this.gridGroup.addRow([
                    this.gmGroup[ix]
                ]);
            }
            this.gridGroup.drawGrid();
            editBtn.setDisabled(false);
        }
        else{
            editBtn.setDisabled(true);
        }
    },

    wasRefreshResult: function(header, data) {
        var ix, ixLen, editBtn;

        editBtn = Ext.getCmp('cfg_user_agent_ordering_edit');
        if(!common.Util.checkSQLExecValid(header, data)){
            editBtn.setDisabled(true);

            console.warn('config_groupwas_ordering-wasRefreshResult');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (data.rows.length == 0){
            this.gridWas.clearRows();
        }

        if (data.rows.length > 0) {
            if (!this.wasData) {
                this.wasData = [];
            } else {
                this.wasData.length = 0;
            }

            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                this.wasData.push([data.rows[ix][0], data.rows[ix][1]]);
            }

            this.gridWas.clearRows();
            for (ix = 0, ixLen = this.wasData.length; ix < ixLen; ix++) {
                this.gridWas.addRow([
                    this.wasData[ix][0],
                    this.wasData[ix][1]
                ]);
            }
            this.gridWas.drawGrid();
            editBtn.setDisabled(false);
        }
        else{
            editBtn.setDisabled(true);
        }
    },

    apply: function(orderStore) {

        var ix, orderLen;
        var orderData, sortType, serviceId, userId;
        var dataSet = {};

        orderLen = orderStore.getCount();
        if (orderLen != this.columnInfo.length) {
            common.Util.showMessage(common.Util.TR('Warning'),  common.Util.TR('Please fill modified order list') , Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }

        if(this.type == 'Group'){
            sortType = 4;
        }
        else{
            sortType = 1;
        }

        userId = Comm.config.login.user_id;
        serviceId = this.parent.service_id;

        dataSet.sql_file = 'IMXConfig_Delete_User_Group_Was_Order.sql';

        dataSet.replace_string = [{
            name    :   'sort_type',
            value   :   sortType
        }, {
            name    :   'user_id',
            value   :   userId
        }, {
            name    :   'service_id',
            value   :   serviceId
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(){
            var dataSet = {};

            for (ix = 0; ix < orderLen; ix++) {
                var d = {};
                orderData = orderStore.getAt(ix).data;
                dataSet.sql_file = 'IMXConfig_Insert_User_Group_Was_Order.sql';
                dataSet.bind = [{
                    name    :   'order_data',
                    value   :   orderData.dataIdx,
                    type : SQLBindType.STRING
                }];

                dataSet.replace_string = [{
                    name    :   'sort_type',
                    value   :   sortType
                }, {
                    name    :   'seq',
                    value   :   ix
                }, {
                    name    :   'user_id',
                    value   :   userId
                }, {
                    name    :   'service_id',
                    value   :   serviceId
                }];

                d.start = ix+1;
                d.end = orderLen;
                d.self = this;

                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }
                this.parent.onUpdateOrder(dataSet,d);
            }
        },this);
    },

    onUpdateOrder: function(dataSet,d){
        var refreshMessage;

        WS.SQLExec(dataSet, function(header, data){
            if(d.start === d.end) {
                if (header.success) {
                    this.onRefresh();
                    d.self.close();

                    refreshMessage = common.Util.TR('Change Success') + '<br>' + common.Util.TR('To apply the changes made, you may need to refresh the browser. Do you want to now refresh?');
                    Ext.Msg.confirm(common.Util.TR(''), refreshMessage, function (choose) {
                        if (choose == 'yes') {
                            window.parent.location.reload();
                        }
                    });
                }
                else {
                    this.self.close();
                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Settings Failed'), Ext.Msg.OK, Ext.MessageBox.ERROR);
                    console.warn('config_groupwas_ordering-onUpdateOrder');
                    console.warn(header);
                    console.warn(data);
                }
            }
        }, this);
    }
});