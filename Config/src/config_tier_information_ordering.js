Ext.define('config.config_tier_information_ordering', {
    extend: 'Exem.Form',
    layout: {type: 'vbox', align: 'stretch'},
    width: '100%',
    height: '100%',

    sql : {
        tier_order_list : 'IMXConfig_Tier_Order.sql',
        delete_sort_key : 'IMXConfig_Delete_Sort_Key.sql',
        insert_sort_key : 'IMXConfig_Insert_Sort_Key.sql'
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(target) {
        var self = this;
        this.target = target;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.target.add(panel);

        var tierOrderPanel = Ext.create('Ext.panel.Panel', {
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

        panel.add(tierOrderPanel);

        var tierOrderPanelTitle = Ext.create('Ext.panel.Panel', {
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
                html: common.Util.usedFont(9, common.Util.TR('Tier Information List'))
            }, {
                xtype: 'toolbar',
                width: 35,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_tier_ordering_edit',
                    scope: this,
                    handler: function() { self.showOrderingWindow('Tier'); }
                }]
            }]
        });

        tierOrderPanel.add(tierOrderPanelTitle);

        this.gridTierIdList = Ext.create('Exem.adminGrid', {
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
        tierOrderPanel.add(this.gridTierIdList);

        this.gridTierIdList.beginAddColumns();
        this.gridTierIdList.addColumn({text: common.Util.CTR('Tier ID Key'), dataIndex: 'tier_id_key', width: 250, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.gridTierIdList.addColumn({text: common.Util.CTR('Tier ID'), dataIndex: 'tier_id', width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.gridTierIdList.endAddColumns();

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

        this.onRefresh();
    },

    showOrderingWindow: function(type){
        var orderList, selectedGrid;
        var ix, ixLen;

        if(!type){
            return;
        }

        selectedGrid = this.gridTierIdList;

        orderList = [];
        for(ix = 0, ixLen = selectedGrid.getRowCount(); ix < ixLen; ix++){
            orderList.push(selectedGrid.getRow(ix).data);
        }

        var orderingWindow = Ext.create('Exem.MoveColumnWindow', {
            type : type,
            width : 800,
            height : 500,
            parent : this,
            title : common.Util.TR(type + ' Order Settings'),
            columnInfo : orderList,
            useDefaultBtn : false,
            leftGridTitle : common.Util.TR('Current Order'),
            rightGridTitle : common.Util.TR('Modified Order'),
            okFn : this.apply
        });

        orderingWindow.initBase();
    },

    onRefresh: function() {
        var dataSet = {};

        dataSet.sql_file = this.sql.tier_order_list;

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }
        WS.SQLExec(dataSet, this.onRefreshResult, this);
    },

    onRefreshResult: function(header, data) {
        var ix, ixLen, editBtn, tempData;

        editBtn = Ext.getCmp('cfg_tier_ordering_edit');
        if(!common.Util.checkSQLExecValid(header, data)){
            editBtn.setDisabled(true);

            console.warn('config_tier_information_ordering-onRefreshResult');
            console.warn(header);
            console.warn(data);
            return;
        }

        if (data.rows.length > 0) {
            tempData = [];

            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                tempData.push([data.rows[ix][0], data.rows[ix][1]]);
            }

            this.gridTierIdList.clearRows();
            for (ix = 0, ixLen = tempData.length; ix < ixLen; ix++) {
                this.gridTierIdList.addRow([
                    tempData[ix][0],
                    tempData[ix][1]
                ]);
            }

            this.gridTierIdList.drawGrid();
            editBtn.setDisabled(false);
        }
        else{
            editBtn.setDisabled(true);
        }
    },

    apply: function(orderStore) {
        var ix, orderLen;
        var orderData;
        var dataSet = {};

        orderLen = orderStore.getCount();
        if (orderLen != this.columnInfo.length) {
            common.Util.showMessage(common.Util.TR('Warning'),  common.Util.TR('Please fill modified order list') , Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }

        dataSet.sql_file = this.parent.sql.delete_sort_key;

        dataSet.bind = [{
            name    :   'sort_type',
            value   :   7,
            type    :   SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }

        WS.SQLExec(dataSet, function(){
            var dataSet = {};
            for (ix = 0; ix < orderLen; ix++) {
                orderData = orderStore.getAt(ix).data;
                dataSet.sql_file = this.parent.sql.insert_sort_key;
                dataSet.bind = [{
                    name    :   'data_idx',
                    value   :   orderData.dataIdx,
                    type    :   SQLBindType.STRING
                }, {
                    name    :   'sort_type',
                    value   :   7,
                    type    :   SQLBindType.INTEGER
                }];
                dataSet.replace_string = [{
                    name    :   'seq',
                    value   :   ix
                }];

                orderData.start = ix + 1;
                orderData.end = orderLen;
                orderData.self = this;
                this.parent.insertSortKey(dataSet,orderData);
            }
        }, this);
    },

    insertSortKey : function(dataSet, data){
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }
        WS.SQLExec(dataSet, function(aheader,adata){
            if(data.start === data.end){
                var refreshMessage;

                if(aheader.success){
                    this.onRefresh();
                    data.self.close();

                    refreshMessage = common.Util.TR('Change Success') +'<br>'+common.Util.TR('To apply the changes made, you may need to refresh the browser. Do you want to now refresh?');
                    Ext.Msg.confirm(common.Util.TR(''), refreshMessage, function(choose) {
                        if (choose == 'yes') {
                            window.parent.location.reload();
                        }
                    });
                }
                else{
                    data.self.close();
                    common.Util.showMessage(common.Util.TR('Error'),  common.Util.TR('Settings Failed') , Ext.Msg.OK, Ext.MessageBox.ERROR);
                    console.warn('config_tier_information_ordering - onUpdateOrder');
                    console.warn(aheader);
                    console.warn(adata);
                }
            }
        }, this);
    }
});