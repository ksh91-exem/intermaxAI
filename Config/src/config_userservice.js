Ext.define('config.config_userservice', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    data: [],
    target: undefined,
    buttons: [common.Util.TR('Add'), common.Util.TR('Save'), common.Util.TR('Delete'), common.Util.TR('Refresh')],
    select_userid: '',
    select_username: '',
    userServiceList: [],

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function() {
        this.callParent();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function(target) {
        var self = this;
        this.target = target;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        //

        var servicelist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            width: 312,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        var servicelist_panel_title = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Service List'))
            }, {
                xtype: 'toolbar',
                width: 70,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_save.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Save'); }
                }, {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var servicelist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        servicelist_panel.add(servicelist_panel_title);
        servicelist_panel.add(servicelist_panel_body);

        //

        var userlist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var userlist_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('User List'))
            }]
        });

        var userlist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        userlist_panel.add(userlist_panel_title);
        userlist_panel.add(userlist_panel_body);

        //

        this._createServiceGrid(servicelist_panel_body);
        this._createUserListGrid(userlist_panel_body);

        //

        panel.add(servicelist_panel);
        panel.add(userlist_panel);

        this.target.add(panel);

        this.refresh_userService();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Save' :
                this.save_userService();
                break;
            case 'Refresh' :
                this.refresh_userService();
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    _createServiceGrid: function(gridpanel) {
        var self = this;
        this.gridServiceList = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: true,
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
            itemclick: function(dv, record) {
                self.serviceClick(record.data.service_id);
            }
        });
        gridpanel.add(this.gridServiceList);

        this.gridServiceList.beginAddColumns();
        this.gridServiceList.addColumn({text: common.Util.CTR('Service ID'),   dataIndex: 'service_id',   width: 85,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.gridServiceList.addColumn({text: common.Util.CTR('Service Name'), dataIndex: 'service_name', width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.gridServiceList.endAddColumns();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    _createUserListGrid: function(gridpanel) {
        this.gridUserList = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
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
            multiCheckable: true
        });
        gridpanel.add(this.gridUserList);

        this.gridUserList.beginAddColumns();
        this.gridUserList.addColumn({text: common.Util.CTR('User ID'),   dataIndex: 'user_id',   width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
        this.gridUserList.addColumn({text: common.Util.CTR('User ID'),   dataIndex: 'login_id',  width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.gridUserList.addColumn({text: common.Util.CTR('Uesr Name'), dataIndex: 'user_name', width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.gridUserList.endAddColumns();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    serviceClick: function(id) {
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Service_Click.sql';
        dataSet.replace_string = [{
            name: 'service_id' ,
            value: id
        }];
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(aheader, adata) {
            self.gridUserList.unCheckAll();
            for (var ix = 0; ix < adata.rows.length; ix++) {
                for (var jx = 0; jx < self.gridUserList.getRowCount(); jx++) {
                    if (adata.rows[ix][0] == self.gridUserList.getRow(jx).data.user_id) {
                        self.gridUserList.selectRow(jx, true);
                    }
                }
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL_UserList: function() {
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Service_User_List.sql';
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }
        WS.SQLExec(dataSet, function(aheader, adata) {
            self.gridUserList.clearRows();
            for (var ix = 0; ix < adata.rows.length; ix++) {
                self.gridUserList.addRow([
                    adata.rows[ix][0],      // user_id
                    adata.rows[ix][1],      // login_id
                    adata.rows[ix][2]       // user_name
                ]);
            }
            self.gridUserList.drawGrid();
        }, this);
    },

    executeSQL_ServiceList: function() {
        var dataSet = {};
        var whereList = '1=1 ';

        dataSet.sql_file = 'IMXConfig_ServiceInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }];
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, this.onData_Was, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onData_Was: function(aheader, adata) {
        this.gridServiceList.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.gridServiceList.addRow([
                adata.rows[ix][0],  // Service_ID
                adata.rows[ix][1]   // Service_Name
            ]);
        }
        this.gridServiceList.drawGrid();
    },

    save_userService: function() {
        if (this.gridServiceList.getSelectedRow().length <= 0) {
            return;
        }

        this.delete_userService();
    },

    onDelete: function(){
        var data, selectedUserList, serviceId,
            ix, ixLen;

        this.executeCount--;

        serviceId = this.gridServiceList.getSelectedRow()[0].data.service_id;
        selectedUserList = this.gridUserList.getSelectedRow();
        if( selectedUserList.length === 0 ){
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            this.refresh_userService();
        }

        if(!this.executeCount){
            for (ix = 0, ixLen = selectedUserList.length; ix < ixLen; ix++) {
                data = {};
                data.id = selectedUserList[ix].data.user_id;
                data.service = serviceId;

                this.insert_userService(data);
            }
        }
    },

    delete_userService : function(){
        var service_id = this.gridServiceList.getSelectedRow()[0].data.service_id;
        var dataSet = {};

        this.executeCount = 0;

        dataSet.sql_file = 'IMXConfig_Service_Delete.sql';
        dataSet.replace_string = [{
            name    :   'service_id',
            value   :   service_id
        }];

        if(common.Util.isMultiRepository()){
            cfg.setConfigToRepo(dataSet, this.onDelete, this);
            this.executeCount += cfg.repositoryInfo.other.length;

            dataSet.database = cfg.repositoryInfo.master.database_name;
        }

        WS.SQLExec( dataSet, this.onDelete, this);
        this.executeCount++;
    },

    onInsert: function(){
        this.executeCount--;
        if(!this.executeCount){
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            this.refresh_userService();
        }
    },

    insert_userService : function(data){
        var dataSet = {};

        this.executeCount = 0;

        dataSet.sql_file = 'IMXConfig_Service_Insert.sql';
        dataSet.replace_string = [{
            name    :   'user_id',
            value   :   data.id
        }, {
            name    :   'service_id',
            value   :   data.service
        }];

        if(common.Util.isMultiRepository()){
            cfg.setConfigToRepo(dataSet, this.onInsert, this);
            this.executeCount += cfg.repositoryInfo.other.length;

            dataSet.database = cfg.repositoryInfo.master.database_name;
        }
        WS.SQLExec( dataSet, this.onInsert, this);
        this.executeCount++;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    refresh_userService: function() {
        this.executeSQL_UserList();
        this.executeSQL_ServiceList();
    }

});























