Ext.define('config.config_alert_treemenu', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    group: [],
    // Agent & DB & WEBSERVER
    MODE: '',
    DB_TYPE: '',
    target: null,
    sql : {
        Delete_AlertGroup_Procedure : 'IMXConfig_Delete_AlertGroup_Procedure.sql',
        Update_WasInfo      : 'IMXConfig_Null_Was_Group.sql',
        WasInfo             : 'IMXConfig_Was_Tree_Info.sql',
        DBInfo              : 'IMXConfig_DB_Tree_Info.sql',
        WsInfo              : 'IMXConfig_Ws_Tree_Info.sql',
        HostInfo            : 'IMXConfig_Host_Tree_Info.sql',
        SMSInfo             : 'IMXConfig_SMS_Tree_Info.sql',
        SMSBusinessInfo     : 'IMXConfig_SMS_Business_Tree_Info.sql',
        APIMInfo            : 'IMXConfig_APIM_Tree_Info.sql',
        TPInfo              : 'IMXConfig_TP_Tree_Info.sql',
        BusinessInfo        : 'IMXConfig_Business_Tree_Info.sql',
        Get_DBType          : 'IMXConfig_Get_DBType.sql'
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function() {
        var self = this;
        var disable = cfg.alert.sltMode == 'Agent' || cfg.alert.sltMode == 'APIM' || cfg.alert.sltMode == 'TP';

        var gridText, slideText;

        if(common.Menu.isBusinessPerspectiveMonitoring){
            slideText   = common.Util.TR('Tier');
            gridText    = common.Util.TR('Tier and Agent List');
        } else{
            slideText   = common.Util.TR('Business Group');
            gridText    = common.Util.TR('Business Group and Agent List');
        }

        var groupTypeToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            onText  : slideText,
            offText : common.Util.TR('Alert Group'),
            margin  : (window.nation === 'ko') ? '0 0 0 75':'0 0 0 27',
            hidden  : (this.MODE !== 'SMS'),
            state   : false,
            listeners : {
                change: function() {
                    var ix, ixLen,
                        gridColumns = self.treepanel.pnlExTree.headerCt.getGridColumns();

                    for( ix = 0, ixLen = gridColumns.length; ix< ixLen; ix++ ){
                        if(this.state && gridColumns[ix].dataIndex === 'tree_text'){
                            gridColumns[ix].setText(gridText);
                            self.MODE = 'SMS_Business';
                        } else if (!this.state && gridColumns[ix].dataIndex === 'tree_text'){
                            gridColumns[ix].setText(common.Util.TR('Alert Group and Agent List'));
                            self.MODE = 'SMS';
                        }
                    }
                    self.onRefresh();
                }
            }
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                id: 'cfg_treemenu_add' + this.MODE,
                scope: this,
                hidden : !disable,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_treemenu_edit' + this.MODE,
                scope: this,
                hidden : !disable,
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_treemenu_delete' + this.MODE,
                scope: this,
                hidden : !disable,
                handler: function() { self.onButtonClick('Delete'); }
            }, {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                id: 'cfg_treemenu_refresh' + this.MODE,
                scope: this,
                handler: function() { self.onButtonClick('Refresh'); }
            }, groupTypeToggle
            ]
        });

        this.treepanel = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            border: false,
            width: '100%',
            useArrows : false,
            flex: 1,
            gridName:'config_tree',
            gridType : Grid.exTree,
            itemclick: function(_this, _record) {
                self.treeMenuClick(_this, _record);
            }

        });

        this.addColumn();

        this.target.add(toolbar);
        this.target.add(this.treepanel);

        this.onButtonClick('Refresh');
    },

    addColumn: function(){
        this.treepanel.beginAddColumns();
        this.treepanel.addColumn(common.Util.CTR('was_id'), 'tree_id',  120,    Grid.StringNumber, false, true);
        switch (this.MODE) {
            case 'Agent' :
                this.treepanel.addColumn(common.Util.CTR('Agent List'),             'tree_text',    220,    Grid.String, true , false, 'exemtreecolumn');
                this.treepanel.addColumn('APP TYPE',                                'app_type' ,    220,    Grid.String, false, true);
                break;
            case 'TabDB' :
            case 'DB'  :
                this.treepanel.addColumn(common.Util.CTR('DB List'),                'tree_text',    220,    Grid.String, true, false, 'exemtreecolumn');
                break;
            case 'WS'  :
                this.treepanel.addColumn(common.Util.CTR('Webserver List'),         'tree_text',    220,    Grid.String, true, false, 'exemtreecolumn');
                break;
            case 'Host' :
                this.treepanel.addColumn(common.Util.CTR('Host List'),              'tree_text',    220,    Grid.String, true, false, 'exemtreecolumn');
                this.treepanel.addColumn(common.Util.CTR('Host ID'),                'host_id',      220,    Grid.String, false, true, 'exemtreecolumn');
                break;
            case 'SMS' :
                this.treepanel.addColumn(common.Util.CTR('Alert Group and Agent List'),   'tree_text',    220,    Grid.String, true, false, 'exemtreecolumn');
                break;
            case 'APIM' :
                this.treepanel.addColumn(common.Util.CTR('APIM List'),              'tree_text',    220,    Grid.String, true, false, 'exemtreecolumn');
                break;
            case 'TP' :
                this.treepanel.addColumn(common.Util.CTR('TP List'),                'tree_text',    220,    Grid.String, true, false, 'exemtreecolumn');
                break;
            case 'Business' :
                this.treepanel.addColumn(common.Util.CTR('Business List'),          'tree_text',    220,    Grid.String, true, false, 'exemtreecolumn');
                break;
            default :
                break;
        }
        this.treepanel.endAddColumns();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onButtonClick: function(cmd) {
        var self = this;
        var groupmgr = null;

        switch (cmd) {
            case 'Add' :
                groupmgr = Ext.create('config.config_alert_addgroup');
                groupmgr.MODE = this.MODE;
                groupmgr.DB_TYPE = 'ORACLE';
                groupmgr.parent = this;
                groupmgr.init();
                break;
            case 'Edit' :
                if (cfg.alert.sltExistSub) {
                    groupmgr = Ext.create('config.config_alert_addgroup');
                    groupmgr.MODE = this.MODE;
                    groupmgr.DB_TYPE = cfg.alertDB.selectQtip;
                    groupmgr.parent = this;
                    groupmgr.load(cfg.alert.sltName);
                }
                break;
            case 'Delete' :
                // 그룹만 삭제한다.
                if (cfg.alert.sltExistSub) {
                    Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                        if (btn === 'yes') {
                            var dataSet = {};
                            var serverType;

                            dataSet.sql_file = 'IMXConfig_Null_Was_Group.sql';

                            if(this.MODE === 'Agent'){
                                serverType = 'and (type != \'APIM\' or type is null)' +
                                    'and (type != \'TP\' or type is null)';
                            } else if (this.MODE === 'APIM'){
                                serverType = 'and type = \'APIM\'';
                            } else if (this.MODE === 'TP'){
                                serverType = 'and type = \'TP\'';
                            }

                            dataSet.bind = [{
                                name    :   'groupName',
                                value   :   cfg.alert.sltName,
                                type    :   SQLBindType.STRING
                            }];

                            dataSet.replace_string = [{
                                name: 'serverType',
                                value: serverType
                            }];

                            if(common.Util.isMultiRepository()){
                                dataSet.database = cfg.repositoryInfo.currentRepoName;
                            }

                            WS.SQLExec(dataSet, function() {}, this);

                            //

                            dataSet.sql_file = 'IMXConfig_Delete_AlertGroup_Procedure.sql';

                            serverType = this.MODE ;
                            serverType = ('Agent' === serverType) ? 'WAS' : serverType;

                            dataSet.bind = [{
                                name: 'groupName',
                                value: cfg.alert.sltName,
                                type : SQLBindType.STRING
                            }, {
                                name: 'serverType',
                                value: serverType,
                                type : SQLBindType.STRING
                            }];

                            WS.SQLExec(dataSet, function() {
                                setTimeout(function() {
                                    self.onRefresh();
                                }, 300);
                            }, this);
                        }
                    },this);
                }
                break;
            case 'Refresh' :
                Ext.getCmp('cfg_treemenu_refresh' + this.MODE).setDisabled(true);

                this.onRefresh();

                var edit = Ext.getCmp('cfg_treemenu_edit' + self.MODE);
                if (edit) {
                    edit.setDisabled(true);
                }

                var del = Ext.getCmp('cfg_treemenu_delete' + self.MODE);
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    treeMenuClick: function(_this, rec) {

        cfg.alert.sltName       = rec.data.tree_text;
        cfg.alert.sltId         = rec.data.tree_id;
        cfg.alert.sltGroup      = rec.parentNode.data.tree_text;
        cfg.alert.sltExistSub   = false;
        cfg.alert.sltFirstChild = undefined;
        cfg.alert.sltHostId     = rec.data.host_id;
        //SMS 매핑연동 전용
        cfg.alert.tabMode       = this.MODE;
        //Business 알람 전용
        cfg.alert.sltDepth      = rec.data.depth;
        cfg.alert.sltAppType    = rec.data.app_type;

        if ( this.MODE !== 'SMS' && this.MODE !== 'SMS_Business') {
            Ext.getCmp('cfg_treemenu_add' + this.MODE).setDisabled( false ) ;
            Ext.getCmp('cfg_treemenu_edit' + this.MODE).setDisabled( false ) ;
            Ext.getCmp('cfg_treemenu_delete' + this.MODE).setDisabled( false ) ;
        }

        if(cfg.alert.sltGroup == undefined){
            cfg.alert.sltGroup = 'Root';
        }

        if (rec.childNodes.length > 0) {
            cfg.alert.sltExistSub = true;
            cfg.alert.sltFirstChild = rec.childNodes[0].data;
            cfg.alert.wasIds.length = 0;
            var isDotNet = false, isJava = false;
            for (var ix = 0; ix < rec.childNodes.length; ix++) {
                cfg.alert.wasIds.push(rec.childNodes[ix].data.tree_id);
                if (rec.childNodes[ix].data.app_type == 'NET') {
                    isDotNet = true;
                } else {
                    isJava = true;
                }
            }

            if( isDotNet && isJava ) {
                cfg.alert.sltAppType = 'JVM(.NET)';
            } else if ( isDotNet && !isJava ) {
                cfg.alert.sltAppType = 'NET';
            } else if ( !isDotNet && isJava ) {
                cfg.alert.sltAppType = 'JVM';
            }

        } else {
            //자식없는 그룹인 케이스
            if ( cfg.alert.sltGroup == 'Root' && cfg.alert.sltId == undefined ){
                cfg.alert.sltExistSub = false;
                cfg.alert.wasIds.length = 0;
            }
        }

        if (cfg.alert.sltExistSub && this.MODE !== 'Business') {
            cfg.alert.sltId = undefined;
            this.getDBType(cfg.alert.sltName);
        }

        switch (cfg.alert.sltMode) {
            case 'TabDB' :
            case 'DB' : this.getDBType(cfg.alert.sltName);
                break;
            case 'WS' : cfg.alert.sltType = 'WEBSERVER';
                break;
            default :
                break;
        }

        switch (this.MODE){
            case 'Agent' :
                Ext.getCmp('wasalert_panel_tabpanel').setActiveTab(0);
                break;
            case 'DB'  :
                Ext.getCmp('dbalert_panel_tabpanel').setActiveTab(0);
                break;
            case 'WS'  :
                Ext.getCmp('ws_alert_panel_tabpanel').setActiveTab(0);
                break;
            case 'Host' :
                Ext.getCmp('HostAlert_panel_TabPanel').setActiveTab(0);
                break;
            case 'TabDB' :
            case 'SMS' :
            case 'SMS_Business' :
                Ext.getCmp('SMS_Alert_panel_TabPanel').setActiveTab(0);
                break;
            case 'APIM' :
                Ext.getCmp('apim_alert_panel_tab_panel').setActiveTab(0);
                break;
            case 'TP' :
                Ext.getCmp('tp_alert_panel_tab_panel').setActiveTab(0);
                break;
            case 'Business' :
                Ext.getCmp('business_alert_panel_tab_panel').setActiveTab(0);
                break;
            default :
                break;
        }

        if(this.MODE != 'TabDB' && this.MODE != 'SMS' && this.MODE != 'SMS_Business'){
            if (cfg.frames.activeTab != '') {
                cfg.frames[common.Util.TR(cfg.frames.activeTab)].onRefresh();
            }
        } else {
            cfg.frames[common.Util.TR('SMS Mapping')].onRefresh();
        }

        console.debug('%c Configuration TreeMenu Clicked: ', 'color:#3191C8;', cfg.alert);
        if(this.MODE === 'SMS_Business'){
            Ext.getCmp('cfg_treemenu_refreshSMS').setDisabled(false);
        } else {
            Ext.getCmp('cfg_treemenu_refresh' + this.MODE).setDisabled(false);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onRefresh: function() {
        var dataSet = {};

        switch (this.MODE) {
            case 'Agent' :
                dataSet.sql_file = 'IMXConfig_Was_Tree_Info.sql';
                break;
            case 'TabDB' :
            case 'DB'  :
                dataSet.sql_file = 'IMXConfig_DB_Tree_Info.sql';
                break;
            case 'WS'  :
                dataSet.sql_file = 'IMXConfig_Ws_Tree_Info.sql';
                break;
            case 'Host' :
                dataSet.sql_file = 'IMXConfig_Host_Tree_Info.sql';
                break;
            case 'SMS' :
                dataSet.sql_file = 'IMXConfig_SMS_Tree_Info.sql';
                break;
            case 'SMS_Business' :
                dataSet.sql_file = 'IMXConfig_SMS_Business_Tree_Info.sql';
                break;
            case 'APIM' :
                dataSet.sql_file = 'IMXConfig_APIM_Tree_Info.sql';
                break;
            case 'TP' :
                dataSet.sql_file = 'IMXConfig_TP_Tree_Info.sql';
                break;
            case 'Business' :
                dataSet.sql_file = 'IMXConfig_Business_Tree_Info.sql';
                break;
            default :
                break;
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onRefreshTree, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onRefreshTree: function(aheader, adata) {
        if(aheader.command == 'IMXConfig_Was_Tree_Info.sql' ||
            aheader.command == 'IMXConfig_SMS_Tree_Info.sql' ||
            aheader.command == 'IMXConfig_APIM_Tree_Info.sql' ||
            aheader.command == 'IMXConfig_TP_Tree_Info.sql' ||
            aheader.command == 'IMXConfig_SMS_Business_Tree_Info.sql'){
            //adata[0] = group, adata[1] = noGroup
            if(!adata[0].rows.length && !adata[1].rows.length){
                return;
            }
        } else {
            if(!adata.rows.length) {
                return;
            }
        }

        this.treepanel.clearNodes();

        this.treepanel.beginTreeUpdate();
        this.setTreeNode(adata);
        this.treepanel.endTreeUpdate();

        this.treepanel.drawTree();

        var tree = this.treepanel.pnlExTree;

        tree.getView().getSelectionModel().select(0);
        tree.fireEvent('itemclick', tree, tree.getSelectionModel().getLastSelected());
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setTreeNode: function(data){
        var ix, ixLen;
        var rowData, treeData, nextRowData;
        var rootNode;
        var oneGroup = false;

        if(this.MODE === 'Business'){
            var self = this;
            var bizData = data.rows;
            this.upperNodeList = [];

            var addTreeData = function (bizId, bizName, parentId){
                var ix, ixLen;
                var currentNode, upperBizId;

                if(!parentId){
                    currentNode = self.treepanel.addNode(null, [
                        bizId,
                        bizName
                    ]);
                    self.upperNodeList.push(currentNode);
                }

                if(parentId){
                    for ( ix = 0, ixLen = self.upperNodeList.length; ix < ixLen; ix++) {
                        upperBizId = self.upperNodeList[ix].tree_id;

                        if(parentId === upperBizId){
                            currentNode = self.treepanel.addNode(self.upperNodeList[ix], [
                                bizId,
                                bizName
                            ]);
                        }
                    }
                    self.upperNodeList.push(currentNode);
                }
            };

            for ( ix = 0, ixLen = bizData.length; ix < ixLen; ix++) {
                var bizId    = bizData[ix][0];
                var bizName  = bizData[ix][1];
                var parentId = bizData[ix][2];

                addTreeData(bizId, bizName, parentId);
            }
        } else{
            //group Data
            if(data[0]){
                treeData = data[0].rows;

                for (ix = 0, ixLen = treeData.length; ix < ixLen; ix++) {
                    rowData = treeData[ix];
                    nextRowData = treeData[ix+1];

                    if(nextRowData == undefined){
                        //마지막 데이터의 이전값
                        nextRowData = treeData[ix-1];
                        //데이터가 1개일 경우
                        if(nextRowData == undefined){
                            nextRowData = treeData[ix];
                        }
                        //데이터가 여러개 그룹명이 1개일 경우
                        if(rowData[2] == nextRowData[2]){
                            oneGroup = true;
                        }
                    }

                    //group_name 이 다를 경우 rootNode 를 그림.(group 데이터)
                    //데이터가 여러개 그룹명이 1개일 경우. 또는 데이터가 1개일 경우.
                    if(rowData[2] != nextRowData[2] || treeData.length ==1 || oneGroup){
                        rootNode = this.treepanel.addNode(null, [
                            rowData[0],     //was_id
                            rowData[2]      //group_name
                        ]);
                        this.addChildNode(rootNode, rowData[2], data);
                    }
                }
            }

            //no Group Data
            if(data || data[1]) {

                if(data[1]){
                    var noGroupTreeData = data[1].rows;
                } else{
                    noGroupTreeData = data.rows;
                }

                for(ix = 0, ixLen = noGroupTreeData.length; ix < ixLen; ix++ ){
                    rowData = noGroupTreeData[ix];
                    if (this.MODE == 'Host') {
                        this.treepanel.addNode(null, [
                            rowData[0],     //host_ip
                            rowData[1],     //host_name
                            rowData[2]      //host_id
                        ]);
                    } else if (this.MODE == 'Agent') {
                        this.treepanel.addNode(null, [
                            rowData[0],     //id
                            rowData[1],     //name
                            rowData[5]      //app_type
                        ]);
                    } else {
                        this.treepanel.addNode(null, [
                            rowData[0],     //id
                            rowData[1]      //name
                        ]);
                    }
                }
            }
        }
    },

    addChildNode: function(parentNode,groupName,data){
        var ix, ixLen;
        var rowData, treeData;

        //group Child Data
        treeData = data[0].rows;

        for(ix = 0, ixLen = treeData.length; ix < ixLen; ix++){
            rowData = treeData[ix];
            //그룹명이 일치하면
            if(rowData[2] == groupName){
                //그룹의 자식 노드 데이터 입력
                this.treepanel.addNode(parentNode, [
                    rowData[0],      //was_id
                    rowData[1],      //was_name
                    rowData[3]       //app_type
                ]);
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    getDBType: function(groupName) {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Get_DBType.sql';
        dataSet.bind = [{
            name: 'groupName',
            value: groupName,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.getDBTypeResult, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getDBTypeResult: function(aheader, adata) {
        if (adata.rows.length > 0) {
            cfg.alert.sltType = adata.rows[0][0];
        }
    }
});