/**
 * Created by 신정훈 on 2016-10-31.
 */
Ext.define('config.config_sms_receive_group_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    grouplist: [],
    sql: {
        smsGroupDelete    : 'IMXConfig_SMS_Receive_Only_Group_Delete.sql',
        smsGroupAllDelete : 'IMXConfig_SMS_Receive_Group_Delete.sql',
        smsGroupUpdate    : 'IMXConfig_SMS_Receive_Group_Update.sql',
        smsGroupInfo      : 'IMXConfig_SMS_Receive_Group_Info.sql',
        smsList           : 'IMXConfig_SMS_Receive_Setting_Info.sql'
    },

    constructor: function() {
        this.callParent();
    },

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

        var grouplist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            width: 390,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var grouplist_panel_title = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, common.Util.TR('SMS Receive Group List'))
            }, {
                xtype: 'toolbar',
                width: 130,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_add.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Add'); }
                }, {
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_sms_receive_group_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_sms_receive_group_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var grouplist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        grouplist_panel.add(grouplist_panel_title);
        grouplist_panel.add(grouplist_panel_body);

        //

        var sms_receive_list_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        var sms_receive_list_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('SMS Receive List'))
            }]
        });

        var sms_receive_list_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        sms_receive_list_panel.add(sms_receive_list_panel_title);
        sms_receive_list_panel.add(sms_receive_list_panel_body);

        //

        this._createServiceGrid(grouplist_panel_body);
        this._createWasGrid(sms_receive_list_panel_body);

        //

        panel.add(grouplist_panel);
        panel.add(sms_receive_list_panel);

        this.target.add(panel);

        this.onButtonClick('Refresh');
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                var smsReceiveGroupForm = Ext.create('config.config_sms_receive_group_setting_form');
                smsReceiveGroupForm.parent = this;
                smsReceiveGroupForm.init('Add');
                break;
            case 'Edit' :
                smsReceiveGroupForm = Ext.create('config.config_sms_receive_group_setting_form');
                smsReceiveGroupForm.parent = this;
                smsReceiveGroupForm.sms_group_id    = this.group_grid.getSelectedRow()[0].data.sms_group_id;
                smsReceiveGroupForm.sms_group_name = this.group_grid.getSelectedRow()[0].data.sms_group_name;

                smsReceiveGroupForm.init('Edit');
                break;
            case 'Delete' :
                var self = this,
                    dataSet = {},
                    smsIdArr = [],
                    ix, ixLen, d;

                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {

                        for (ix = 0, ixLen = self.smsListGrid.getSelectedRow().length; ix < ixLen; ix++) {
                            d = self.smsListGrid.getSelectedRow()[ix].data;
                            smsIdArr.push(d['sms_user_id']);
                        }

                        if(smsIdArr.length === 0){
                            dataSet.sql_file = 'IMXConfig_SMS_Receive_Only_Group_Delete.sql';

                            dataSet.bind = [{
                                name    :   'sms_group_id',
                                value   :   self.select_groupid,
                                type : SQLBindType.INTEGER
                            }];
                        } else{
                            dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Delete.sql';

                            dataSet.bind = [{
                                name    :   'sms_group_id',
                                value   :   self.select_groupid,
                                type : SQLBindType.INTEGER
                            }];

                            dataSet.replace_string = [{
                                name    :   'sms_user_id',
                                value   :   smsIdArr.join(',')
                            }];
                        }

                        if(common.Util.isMultiRepository()){
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function() {
                            var self = this;
                            var idListArr = [];
                            var smsIdArr = [];
                            var smsList = self.smsListGrid.getSelectedRow();
                            var ix,ixLen, jx,jxLen;

                            if( smsList.length === 0 ){
                                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                self.onButtonClick('Refresh');
                                return;
                            }

                            for (ix = 0, ixLen = smsList.length; ix < ixLen; ix++) {
                                var d = self.smsListGrid.getSelectedRow()[ix].data;
                                var groupIdArr = d['sms_group_id_list'].split(',');
                                smsIdArr.push(d['sms_user_id']);
                                for(jx = 0, jxLen = groupIdArr.length; jx < jxLen; jx++){
                                    if (groupIdArr[jx] != self.select_groupid) {
                                        idListArr.push(groupIdArr[jx]);
                                    }
                                }
                                self.deleteUpdateSMS(idListArr,smsIdArr);
                                idListArr = [];
                                smsIdArr = [];
                            }
                        }, self);
                    }
                });
                break;
            case 'Refresh' :
                this.executeSQL_Group();
                this.executeSQL_SMSList();

                var edit = Ext.getCmp('cfg_sms_receive_group_edit');
                if (edit) {
                    edit.setDisabled(true);
                }

                var del = Ext.getCmp('cfg_sms_receive_group_delete');
                if (del) {
                    del.setDisabled(true);
                }

                edit = null;
                del  = null;
                break;
            default :
                break;
        }
    },

    deleteUpdateSMS:function(idList,smsIdArr){
        var dataSet = {};
        var groupIDList;
        var self = this;

        if(idList.length === 0){
            setTimeout(function() {
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                self.onButtonClick('Refresh');
            }, 100);
            return;
        } else{
            groupIDList = idList.join(',');
        }

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Update.sql';

        dataSet.bind = [{
            name    :   'sms_group_id_list',
            value   :   groupIDList,
            type : SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name    :   'sms_user_id',
            value   :   smsIdArr.join(',')
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            var self = this;
            setTimeout(function() {
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                self.onButtonClick('Refresh');
            }, 100);
        },this);
    },

    _createServiceGrid: function(grid_panel) {
        var self = this;
        this.group_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            useCheckBox: false,
            localeType: 'H:i:s',
            defaultHeaderHeight: 26,
            usePager: false,
            itemclick:function(dv, record) {
                self.groupClick(record.data);

                var edit = Ext.getCmp('cfg_sms_receive_group_edit');
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_sms_receive_group_delete');
                if (del) {
                    del.setDisabled(false);
                }

                edit = null;
                del  = null;
            }
        });
        grid_panel.add(this.group_grid);

        this.group_grid.beginAddColumns();
        this.group_grid.addColumn({text: common.Util.CTR('Group ID'), dataIndex: 'sms_group_id', width: 100, type: Grid.Number, alowEdit: true, editMode: true});
        this.group_grid.addColumn({text: common.Util.CTR('Group Name'), dataIndex: 'sms_group_name', width: 150, type: Grid.String, alowEdit: true, editMode: true});
        this.group_grid.endAddColumns();
    },

    _createWasGrid: function(grid_panel) {
        this.smsListGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            useCheckBox: false,
            checkMode: Grid.checkMode.SIMPLE,
            rowNumber: true,
            localeType: 'H:i:s',
            defaultHeaderHeight: 26,
            usePager: false,
            multiCheckable: true
        });
        grid_panel.add(this.smsListGrid);

        this.smsListGrid.beginAddColumns();
        this.smsListGrid.addColumn({text: common.Util.CTR('SMS User ID'),   dataIndex: 'sms_user_id',       width: 110, type: Grid.StringNumber, alowEdit: false, editMode: false, hide:false});
        this.smsListGrid.addColumn({text: common.Util.CTR('Employee ID'),   dataIndex: 'employee_id',       width: 120, type: Grid.String,       alowEdit: false, editMode: false});
        this.smsListGrid.addColumn({text: common.Util.CTR('User Name'),     dataIndex: 'sms_user_name',     width: 120, type: Grid.String,       alowEdit: false, editMode: false});
        this.smsListGrid.addColumn({text: common.Util.CTR('Department'),    dataIndex: 'business_name',     width: 150, type: Grid.String,       alowEdit: false, editMode: false});
        this.smsListGrid.addColumn({text: common.Util.CTR('Mobile'),        dataIndex: 'phone_number',      width: 120, type: Grid.String,       alowEdit: false, editMode: false});
        this.smsListGrid.addColumn({text: common.Util.CTR('Email'),         dataIndex: 'sms_user_email',    width: 250, type: Grid.String,       alowEdit: false, editMode: false});
        this.smsListGrid.addColumn({text: common.Util.CTR('SMS Enable'),    dataIndex: 'sms_enable',        width: 100, type: Grid.CheckBox,     alowEdit: false, editMode: false});
        this.smsListGrid.addColumn({text: common.Util.CTR('Group ID List'), dataIndex: 'sms_group_id_list', width: 100, type: Grid.String,       alowEdit: false, editMode: false, hide:true});
        this.smsListGrid.addColumn({text: common.Util.CTR('Mail Enable'),   dataIndex: 'mail_enable',       width: 100, type: Grid.CheckBox,     alowEdit: false, editMode: false});
        this.smsListGrid.endAddColumns();
    },

    groupClick: function(d) {
        this.select_groupid   = d['sms_group_id'];
        this.select_groupname = d['sms_group_name'];
        this.checked_sms_list();
    },

    checked_sms_list: function() {
        var d = null;

        this.smsListGrid.unCheckAll();

        for (var ix = 0; ix < this.smsListGrid.getRowCount(); ix++) {
            d = this.smsListGrid.getRow(ix).data;
            var idArr = d['sms_group_id_list'].split(',');
            for(var jx = 0; jx < idArr.length; jx++){
                if (this.find_sms(idArr[jx])) {
                    this.smsListGrid.selectRow(ix, true);
                }
            }
        }
    },

    find_sms: function(groupId) {
        var result = false;
        var ix, ixLen, data;

        for (ix = 0, ixLen = this.group_grid.getRowCount(); ix < ixLen; ix++) {
            data = this.group_grid.getRow(ix).data;
            if (data.sms_group_id == groupId && this.select_groupid == groupId) {
                result = true;
                break;
            }
        }
        return result;
    },

    executeSQL_Group: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Group_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData_Group, this);
    },

    onData_Group: function(aheader, adata) {
        this.group_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.group_grid.addRow([
                adata.rows[ix][0],      // Group_ID
                adata.rows[ix][1]       // Group_Name
            ]);
        }
        this.group_grid.drawGrid();
    },

    executeSQL_SMSList: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Receive_Setting_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData_SMSList, this);
    },

    onData_SMSList: function(aheader, adata) {
        this.smsListGrid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            var dataRows = adata.rows[ix];
            this.smsListGrid.addRow([
                +dataRows[0],    //sms_user_id
                dataRows[1],    //sms_business_name
                dataRows[2],    //sms_user_name
                dataRows[3],    //부서
                dataRows[4],    //phone_number
                dataRows[5],    //email
                dataRows[6],    //sms_enable
                dataRows[8],    //sms_group_id_list
                dataRows[9]     //mail_enable
            ]);
        }
        this.smsListGrid.drawGrid();
    }
});
