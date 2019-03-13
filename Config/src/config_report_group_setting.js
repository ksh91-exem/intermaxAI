Ext.define('config.config_report_group_setting', {
    extend  : 'Exem.Form',
    layout  : { type: 'vbox', align: 'stretch' },
    width   : '100%',
    height  : '100%',

    init: function() {
        var self = this;

        this.refresh_loading = false ;

        var panel = Ext.create('Ext.panel.Panel', {
            layout    : 'hbox',
            width     : '60%',
            flex      : 1,
            border    : false,
            bodyStyle : { background: '#eeeeee' }
        });

        var groupListPanel = Ext.create('Ext.panel.Panel', {
            layout    : 'vbox',
            cls       : 'x-config-used-round-panel',
            height    : '100%',
            flex      : 1,
            border    : false,
            split     : true,
            margin    : '3 0 3 6',
            padding   : '2 3 2 3',
            bodyStyle : { background: '#ffffff' }
        });

        var groupListPanelTitle = Ext.create('Ext.panel.Panel', {
            layout    : 'hbox',
            width     : '100%',
            height    : 30,
            border    : false,
            bodyStyle : { background: '#eeeeee' },
            items     : [{
                flex      : 1,
                height    : 30,
                border    : false,
                margin    : '4 0 0 0',
                bodyStyle : { background: '#eeeeee' },
                html      : Comm.RTComm.setFont(9, common.Util.TR('Group List'))
            }, {
                xtype     : 'toolbar',
                width     : 130,
                height    : 30,
                border    : false,
                items     : [{
                    html      : '<img src="../images/cfg_add.png" width="15" height="15">',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Add'); }
                }, {
                    html      : '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id        : 'cfg_report_group_list_edit',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Edit'); }
                }, {
                    html      : '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id        : 'cfg_report_group_list_delete',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html      : '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope     : this,
                    handler   : function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var groupListPanelBody = Ext.create('Ext.panel.Panel', {
            layout    : 'fit',
            width     : '100%',
            height    : '100%',
            border    : false,
            flex      : 1,
            bodyStyle : { background: '#dddddd' }
        });

        groupListPanel.add(groupListPanelTitle);
        groupListPanel.add(groupListPanelBody);

        var groupTreePanel = Ext.create('Ext.panel.Panel', {
            height    : '100%',
            width     : '100%',
            layout    : 'fit',
            flex      : 1,
            border    : false,
            bodyStyle : {
                background: '#ffffff'
            }
        });

        groupListPanelBody.add(groupTreePanel);
        panel.add(groupListPanel);
        this.target.add(panel);

        this.groupUserTree = Ext.create('Exem.BaseGrid', {
            width               : '100%',
            height              : '100%',
            editMode            : false,
            gridType            : Grid.exTree,
            useCheckBox         : false,
            checkMode           : Grid.checkMode.SINGLE,
            showHeaderCheckbox  : false,
            rowNumber           : false,
            localeType          : 'H:i:s',
            stripeRows          : true,
            defaultHeaderHeight : 26,
            usePager            : false,
            defaultbufferSize   : 300,
            defaultPageSize     : 300,
            itemclick           : function() {
                Ext.getCmp('cfg_report_group_list_edit').setDisabled(false);
                Ext.getCmp('cfg_report_group_list_delete').setDisabled(false);
            }
        });

        groupTreePanel.add(this.groupUserTree);

        this.groupUserTree.beginAddColumns();
        this.groupUserTree.addColumn(common.Util.CTR('Group ID')  , 'group_id'        , 150, Grid.Number, false, true);
        this.groupUserTree.addColumn(common.Util.CTR('Group Name'), 'group_name'      , 150, Grid.String, true, false, 'exemtreecolumn');
        this.groupUserTree.addColumn(common.Util.CTR('User ID')   , 'group_user_id'   , 150, Grid.Number, false, true);
        this.groupUserTree.addColumn(common.Util.CTR('User Name') , 'group_user_name' , 150, Grid.String, true, false);
        this.groupUserTree.addColumn(common.Util.CTR('Email')     , 'group_user_email', 300, Grid.String, true, false);
        this.groupUserTree.endAddColumns();

        this.onButtonClick('Refresh');
    },

    onButtonClick: function(cmd) {
        var userForm;
        var data;

        switch (cmd) {
            case 'Add' :
                userForm = Ext.create('config.config_report_group_setting_form');
                userForm.parent = this;
                userForm.init('Add');
                break;
            case 'Edit' :
                data = this.groupUserTree.getSelectedRow()[0].data;
                userForm = Ext.create('config.config_report_group_setting_form');
                userForm.parent        = this;
                userForm.group_id      = data.group_id;
                if(!data.group_name){
                    data.group_name = data.parentNode[0].group_name;
                }
                userForm.group_name    = data.group_name;
                userForm.init('Edit');
                break;
            case 'Delete' :
                var self = this;
                var dataSet = {};

                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        var rowData =  self.groupUserTree.getSelectedRow()[0].data;

                        dataSet.sql_file = 'IMXConfig_Report_Group_Delete.sql';
                        dataSet.bind = [{
                            name    : 'group_id',
                            value   : rowData.group_id,
                            type    : SQLBindType.INTEGER
                        }];

                        if(common.Util.isMultiRepository()){
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function() {
                            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                            self.onButtonClick('Refresh');
                        }, this);
                    }
                });
                break;
            case 'Refresh' :
                if ( this.refresh_loading ){
                    return ;
                }

                this.refresh_loading = true ;
                this.groupUserTree.clearNodes();
                // Get Data
                this.executeSQL();

                Ext.getCmp('cfg_report_group_list_edit').setDisabled(true);
                Ext.getCmp('cfg_report_group_list_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Report_Group_User_Tree_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            if(!common.Util.checkSQLExecValid(aheader, adata)){
                console.info(aheader);
                console.info(adata);
                return;
            }

            this.groupUserTree.beginTreeUpdate();
            this.setTreeNode(adata);
            this.groupUserTree.drawTree();
            this.groupUserTree.endTreeUpdate();

            this.refresh_loading = false ;
        }, this);
    },

    setTreeNode : function(data){
        var ix,ixLen,
            rowData, rootNode,
            groupData       = data[0].rows,
            groupUserData   = data[1].rows;

        //group_info
        for (ix = 0,ixLen = groupData.length; ix < ixLen; ix++) {
            rowData = groupData[ix];

            rootNode = this.groupUserTree.addNode(null, [
                rowData[0],      //group_id
                rowData[1],      //group_name
                null,
                null,
                null
            ]);
            this.addChildNode(rootNode, rowData[0], groupUserData);
        }
    },

    addChildNode : function(parentNode, groupId, groupUserData){
        var ix, ixLen;

        //group_user_info
        for(ix = 0, ixLen = groupUserData.length; ix < ixLen; ix++){
            if(groupUserData[ix][0] == groupId){
                this.groupUserTree.addNode(parentNode, [
                    groupUserData[ix][0],
                    null,
                    groupUserData[ix][2],     //user_seq
                    groupUserData[ix][3],     //user_name
                    groupUserData[ix][4]      //Email
                ]);
            }
        }
    }
});
