/**
 * Created by 신정훈 on 2017-06-08.
 */
Ext.define('config.config_user_access_ip_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function() {
        this.superclass.constructor.call(this, config);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function(target) {
        var self = this;
        this.target = target;

        this.refresh_loading = false ;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: 600,
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var userIPListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var userIPListPanelTitle = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('User Access IP List'))
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

        var userIPListPanelBody = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        userIPListPanel.add(userIPListPanelTitle);
        userIPListPanel.add(userIPListPanelBody);

        var gridPanel = Ext.create('Ext.panel.Panel', {
            height: '100%',
            width : '100%',
            layout: 'fit',
            flex: 1,
            border: false,
            bodyStyle: {
                background: '#ffffff'
            }
        });

        userIPListPanelBody.add(gridPanel);
        panel.add(userIPListPanel);
        this.target.add(panel);

        // adminGrid
        this.gridUserIPList = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });
        gridPanel.add(this.gridUserIPList);

        this.gridUserIPList.beginAddColumns();
        this.gridUserIPList.addColumn({text: common.Util.CTR('User ID'),    dataIndex: 'user_id',        width: 140, type: Grid.StringNumber,   alowEdit: false, editMode: false, hide: true});
        this.gridUserIPList.addColumn({text: common.Util.CTR('User ID'),    dataIndex: 'login_id',       width: 140, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridUserIPList.addColumn({text: common.Util.CTR('User Name'),  dataIndex: 'user_name',      width: 140, type: Grid.String,   alowEdit: false, editMode: false});
        this.gridUserIPList.addColumn({text: common.Util.CTR('IP Address'), dataIndex: 'ip_address',     width: 140, type: Grid.String,   alowEdit: true, editMode: true});
        this.gridUserIPList.endAddColumns();

        this.onButtonClick('Refresh');

        this.gridUserIPList.baseStore.addListener('update',function(){
            var ix, ixLen, data,
                modified = self.gridUserIPList.getModified(),
                ipAddressCheck = /^(([*]|[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([*]|[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

            for(ix = 0,ixLen = modified.length; ix <ixLen; ix++) {
                data = modified[ix].data;
                if(data.ip_address.length > 15 || !ipAddressCheck.test(data.ip_address)){
                    //공백문자 체크 안함
                    if(data.ip_address == ''){
                        continue;
                    }
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Invalid IP Address.'));
                }
            }
        });
    },

    onButtonClick: function(cmd) {
        var ix, ixLen, data, endCount,
            modified = this.gridUserIPList.getModified(),
            dataSet = {};

        switch (cmd) {
            case 'Save' :
                if(this.checkIPAddress()){
                    this.count = 0;

                    for(ix = 0,ixLen = modified.length; ix <ixLen; ix++){
                        data = modified[ix].data;

                        dataSet.sql_file = 'IMXConfig_Update_User_IP_Address.sql';

                        dataSet.bind = [{
                            name: 'ip_address',
                            value: data.ip_address,
                            type : SQLBindType.STRING
                        },{
                            name: 'user_id',
                            value: data.user_id,
                            type : SQLBindType.INTEGER
                        }];

                        endCount = modified.length;

                        this.updateUserIPAddress(dataSet,endCount);
                    }
                }
                break;
            case 'Refresh' :
                if ( this.refresh_loading ){
                    return ;
                }

                this.refresh_loading = true ;
                // Get Data
                this.executeSQL();
                break;
            default :
                break;
        }
    },

    updateUserIPAddress : function(dataSet,endCount){
        if(common.Util.isMultiRepository()){
            cfg.setConfigToRepo(dataSet, function(){}, this);
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }
        WS.SQLExec(dataSet, function() {
            this.count++;
            if(this.count === endCount){
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                this.onButtonClick('Refresh');
            }
        }, this);
    },

    executeSQL: function() {
        var ix, ixLen,
            dataSet = {};

        dataSet.sql_file = 'IMXConfig_User_IP_Info.sql';

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.master.database_name;
        }

        this.gridUserIPList.clearRows();

        WS.SQLExec(dataSet, function(header, data) {
            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                this.gridUserIPList.addRow([
                    data.rows[ix][0],                       // user_id
                    data.rows[ix][1],                       // login_id
                    data.rows[ix][2],                       // user_name
                    data.rows[ix][3]                        // ip_address
                ]);
            }
            this.gridUserIPList.drawGrid();
            this.refresh_loading = false ;
        }, this);
    },

    checkIPAddress: function(){
        var ix, ixLen, data,
            modified = this.gridUserIPList.getModified(),
            ipAddressCheck = /^(([*]|[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([*]|[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

        for(ix = 0,ixLen = modified.length; ix <ixLen; ix++) {
            data = modified[ix].data;
            if(data.ip_address.length > 15 || !ipAddressCheck.test(data.ip_address)){
                //공백문자 체크 안함
                if(data.ip_address == ''){
                    continue;
                }
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Invalid IP Address.'));
                return false;
            }
        }
        return true;
    }
});
