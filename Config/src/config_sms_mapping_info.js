/**
 * Created by jykim on 2016-10-31.
 */
Ext.define('config.config_sms_mapping_info', {
    extend: 'Ext.panel.Panel',

    sql: {
        sms_user_list : 'IMXConfig_SMS_Mapping_Info_User.sql',
        group_n_agent_mapping_list : 'IMXConfig_SMS_Mapping_Info_Group.sql',
        group_n_agent_mapping_business_list : 'IMXConfig_SMS_Mapping_Info_Business_Group.sql'
    },

    initProperty: function(){
        this.smsGroupMap = {};
        this.smsUserList = {};
    },

    init: function(){
        this.initProperty();
        this.createLayout();
    },

    createLayout: function(){
        var userSearchPanel, mappingListPanel;

        userSearchPanel = Ext.create('Ext.tab.Panel', {
            layout: 'fit',
            flex: 1,
            //width: 465,
            width: '100%',
            height: '100%',
            border: false,
            style: { background: '#e7e7e7' }
        });

        mappingListPanel = Ext.create('Ext.tab.Panel', {
            layout: 'fit',
            flex: 1,
            //width: 465,
            width: '100%',
            height: '100%',
            border: false,
            style: { background: '#e7e7e7' }
        });

        this.createChildLayout(userSearchPanel, common.Util.TR('SMS Mapping Info'), true);
        this.createChildLayout(mappingListPanel, common.Util.TR('Agent List'), false);

        this.add(userSearchPanel, {xtype:'splitter', width : 10}, mappingListPanel);

        userSearchPanel.setActiveTab(0);
        mappingListPanel.setActiveTab(0);
    },

    createChildLayout: function(target, tabTitle, isExistHeader){
        var background, panel, title, body, toolbar,
            self = this;

        background = Ext.create('Ext.panel.Panel', {
            title: tabTitle,
            layout: 'fit',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            //region: 'west',
            height: '100%',
            width: '100%',
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        if(isExistHeader){
            this.searchField = Ext.create('Exem.TextField', {
                width: 200,
                margin: '0 0 0 10',
                enableKeyEvents: true,
                listeners: {
                    keydown: function(me, event){
                        if(event.keyCode === 13){
                            self.searchUser(this.getValue());
                        }
                    }
                }
            });

            toolbar = Ext.create('Exem.Container', {
                width: 270,
                layout : {
                    type : 'hbox',
                    align : 'middle',
                    pack : 'end'
                },
                items:[
                    this.searchField,
                    {
                        xtype: 'toolbar',
                        width: 64,
                        height: 30,
                        border: false,
                        items: [
                            {
                                html: '<img src="../images/wasForm.png" width="15" height="15">',
                                scope: this,
                                handler: function() {
                                    self.searchUser(self.searchField.getValue());
                                }
                            }, {
                                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                                scope: this,
                                handler: function() { self.executeUserData(); }
                            }
                        ]
                    }
                ]
            });

            title = Ext.create('Ext.panel.Panel', {
                layout: 'hbox',
                width: '100%',
                height: 30,
                border: false,
                bodyStyle: { background: '#eeeeee' },
                items: [{
                    flex: 4,
                    height: 30,
                    border: false,
                    margin: '6 0 0 6',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('User List'))
                    },
                    toolbar
                ]
            });

            body = Ext.create('Ext.panel.Panel', {
                layout: 'fit',
                width: '100%',
                height: '100%',
                border: false,
                flex: 1,
                bodyStyle: { background: '#dddddd' }
            });

            panel.add(title);
            panel.add(body);

            this.createUserGrid(body);
        }
        else{
            this.createListGrid(panel);
        }


        background.add(panel);
        target.add(background);
    },

    createUserGrid: function(target){
        var self = this;

        this.userTree = Ext.create('Exem.BaseGrid',{
            useArrows: false,
            baseGridCls: 'baseGridRTM call-tree-node-style',
            cls        : 'call-tree',
            gridType   : Grid.exTree,
            defaultbufferSize : 2000,
            itemclick: function(me, record) {
                var ix, ixLen,
                    childNodes, userIds = [];

                if(record.childNodes.length){
                    childNodes = record.childNodes;
                    for(ix = 0, ixLen = childNodes.length; ix < ixLen; ix++){
                        userIds.push(childNodes[ix].data.user_id);
                    }
                }
                else {
                    userIds.push(record.data.user_id);
                }

                self.executeListData(userIds);
            }
        });

        this.userTree.beginAddColumns();
        this.userTree.addColumn(common.Util.CTR('User ID'),     'user_id',      100,    Grid.String, true, false, 'exemtreecolumn');
        this.userTree.addColumn(common.Util.CTR('User Name'),   'user_name',    150,    Grid.String, true, false);
        this.userTree.addColumn(common.Util.CTR('Employee ID'), 'employee_id',  150,    Grid.String, true, false);
        this.userTree.endAddColumns();

        target.add(this.userTree);

        this.executeUserData();
    },

    createListGrid: function(target){
        this.listTree = Ext.create('Exem.BaseGrid',{
            useArrows: false,
            baseGridCls: 'baseGridRTM call-tree-node-style',
            cls        : 'call-tree',
            gridType   : Grid.exTree,
            defaultbufferSize : 2000
        });


        this.listTree.beginAddColumns();
        this.listTree.addColumn(common.Util.CTR('Alert Group and Agent List'),    'tree_text',    290,    Grid.String,        true,   false, 'exemtreecolumn');
        this.listTree.endAddColumns();

        target.add(this.listTree);
    },

    executeUserData: function(){
        var dataSet = {};

        dataSet.sql_file = this.sql.sms_user_list;

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData, this);
    },

    executeListData: function(smsUserId){
        var dataSet = {}, ix,ixLen, gridText,
        gridColumns = this.listTree.pnlExTree.headerCt.getGridColumns();

        if(common.Menu.isBusinessPerspectiveMonitoring){
            gridText    = common.Util.TR('Tier and Agent List');
        } else{
            gridText    = common.Util.TR('Business Group and Agent List');
        }

        for( ix = 0, ixLen = gridColumns.length; ix< ixLen; ix++ ){
            if(cfg.alert.tabMode === 'SMS_Business' && gridColumns[ix].dataIndex === 'tree_text'){
                dataSet.sql_file = this.sql.group_n_agent_mapping_business_list;
                gridColumns[ix].setText(gridText);
            } else if (cfg.alert.tabMode === 'SMS' && gridColumns[ix].dataIndex === 'tree_text'){
                dataSet.sql_file = this.sql.group_n_agent_mapping_list;
                gridColumns[ix].setText(common.Util.TR('Alert Group and Agent List'));
            }
        }
        dataSet.replace_string = [{
            name: 'sms_user_id',
            value: smsUserId.join()
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onData, this);
    },

    onData: function(header, data){
        var command = header.command;

        if(!common.Util.checkSQLExecValid(header, data)){
            console.warn('sms_mapping_info-onData');
            console.warn(header);
            console.warn(data);
            return;
        }

        if(command == this.sql.sms_user_list){
            this.setUserData(data[0].rows, data[1].rows);
        }
        else if(command == this.sql.group_n_agent_mapping_list || command == this.sql.group_n_agent_mapping_business_list){
            this.setListTree(data.rows);
        }
    },

    setUserData: function(groupData, userData){
        var ix, ixLen, jx, jxLen,
            groupId, groupName,
            groupIdList;

        this.smsUserList[''] = [];

        for(ix = 0, ixLen = groupData.length; ix < ixLen; ix++){
            groupId = groupData[ix][0];
            groupName = groupData[ix][1];
            this.smsGroupMap[groupId] = groupName;
            this.smsUserList[groupName] = [];
        }

        for(ix = 0, ixLen = userData.length; ix < ixLen; ix++){
            groupIdList = userData[ix][3].split(',');
            for(jx = 0, jxLen = groupIdList.length; jx < jxLen; jx++){
                groupName = this.smsGroupMap[groupIdList[jx]] || '';
                if (!this.smsUserList[groupName]){
                    this.smsUserList[groupName] = [];
                }

                this.smsUserList[groupName].push(userData[ix]);
            }
        }

        this.setUserTree(this.smsUserList);
    },

    setUserTree: function(data){
        var ix, ixLen, jx, jxLen,
            keys, parentNode, rowData,
            tree = this.userTree;

        tree.clearNodes();
        tree.beginTreeUpdate();

        keys = Object.keys(data);
        for(ix = 0, ixLen = keys.length; ix < ixLen; ix++){
            rowData = data[keys[ix]];
            if(keys[ix] == ''){
                parentNode = null;
            }
            else{
                parentNode = tree.addNode(null, [
                    keys[ix],
                    null,
                    null
                ]);
            }

            for(jx = 0, jxLen = rowData.length; jx < jxLen; jx++){
                tree.addNode(parentNode, [
                    rowData[jx][0],
                    rowData[jx][1],
                    rowData[jx][2]
                ]);
            }
        }

        tree.endTreeUpdate();
        tree.drawTree();
    },

    setListTree: function(listData){
        var ix, ixLen,
            rowData, currentGroupName,
            parentNode,
            tree = this.listTree;

        tree.clearNodes();
        tree.beginTreeUpdate();

        for(ix = 0, ixLen = listData.length; ix < ixLen; ix++){
            rowData = listData[ix];

            if(ix == 0){
                currentGroupName = rowData[1];
                if(currentGroupName){
                    parentNode = tree.addNode(null, [
                        currentGroupName
                    ]);
                }
            }

            if(rowData[1] != currentGroupName && rowData[1] !== ''){
                currentGroupName = rowData[1];
                parentNode = tree.addNode(null, [
                    currentGroupName
                ]);
            }

            if(rowData[1] == ''){
                tree.addNode(null, [
                    rowData[0]
                ]);
            }
            else {
                tree.addNode(parentNode, [
                    rowData[0]
                ]);
            }
        }

        tree.endTreeUpdate();
        tree.drawTree();
    },

    searchUser: function(searchStr){
        var ix, ixLen, jx, jxLen,
            rowData,
            userList = this.smsUserList,
            groupList = Object.keys(userList),
            searchList = {};

        for(ix = 0, ixLen = groupList.length; ix < ixLen; ix++){
            if(groupList[ix].indexOf(searchStr) != -1){
                searchList[groupList[ix]] = userList[groupList[ix]];
            }
            else{
                for(jx = 0, jxLen = userList[groupList[ix]].length; jx < jxLen; jx++){
                    rowData = userList[groupList[ix]][jx];
                    if(rowData[1].indexOf(searchStr) != -1){
                        if(!searchList[groupList[ix]]){
                            searchList[groupList[ix]] = [];
                        }

                        if(searchList[groupList[ix]].indexOf(rowData) == -1){
                            searchList[groupList[ix]].push(rowData);
                        }
                    }
                }
            }
        }

        this.setUserTree(searchList);
        this.setListTree([]);
    }
});