Ext.define('config.config', {
    extend: 'config.config_ui',
    width: '100%',
    height: '100%',

    config_page: {},

    init: function() {
        this.callParent();

        cfg.frames                              = {};
        cfg.frames.activeTab                    = '';
        cfg.frames.statAlert                    = null;
        cfg.frames.sessionAlert                 = null;
        cfg.frames.scriptAlert                  = null;
        cfg.frames.logFilter                    = null;
        cfg.frames.fileSystem                   = null;
        cfg.frames.url                          = null;
        cfg.frames.exception                    = null;
        cfg.frames.poolalert                    = null;
        cfg.frames.dbwarning                    = null;
        cfg.frames.tablespace                   = null;

        cfg.frames.db_statAlert                 = null;
        cfg.frames.db_sessionAlert              = null;
        cfg.frames.db_scriptAlert               = null;
        cfg.frames.db_logFilter                 = null;
        cfg.frames.db_fileSystem                = null;
        cfg.frames.db_dbwarning                 = null;
        cfg.frames.db_tablespace                = null;

        cfg.alertWas                            = {};
        cfg.alertWas.selectWas                  = '';
        cfg.alertWas.selectWasId                = '';
        cfg.alertWas.selectWasIds               = [];
        cfg.alertWas.selectGroup                = '';
        cfg.alertWas.selectSub                  = '';
        cfg.alertWas.selectWasFirstChild        = undefined;

        cfg.alertDB                             = {};
        cfg.alertDB.selectDB                    = '';
        cfg.alertDB.selectDBId                  = '';
        cfg.alertDB.selectGroup                 = '';
        cfg.alertDB.selectSub                   = '';
        cfg.alertDB.selectQtip                  = '';
        cfg.alertDB.selectDBFirstChild          = undefined;
        cfg.alertDB.selectDBType                = '';

        cfg.alertWS                             = {};
        cfg.alertWS.selectWs                    = '';
        cfg.alertWS.selectWsId                  = '';
        cfg.alertWS.selectGroup                 = '';
        cfg.alertWS.selectSub                   = '';
        cfg.alertWS.selectWsFirstChild          = undefined;

        cfg.alertHost                           = {};
        cfg.alertHost.selectHost                  = '';
        cfg.alertHost.selectHostId                = '';
        cfg.alertHost.selectTreeHostId            = '';
        cfg.alertHost.selectGroup                 = '';
        cfg.alertHost.selectSub                   = '';
        cfg.alertHost.selectHostFirstChild        = undefined;

        // SMS 알람 추가로 인한 필요한 데이터
        cfg.alertSMS                            = {};
        cfg.alertSMS.selectWas                  = '';
        cfg.alertSMS.selectWasId                = '';
        cfg.alertSMS.selectWasIds               = [];
        cfg.alertSMS.selectGroup                = '';
        cfg.alertSMS.selectSub                  = '';
        cfg.alertSMS.selectTreeTab              = '';

        cfg.alertAPIM                            = {};
        cfg.alertAPIM.selectWas                  = '';
        cfg.alertAPIM.selectWasId                = '';
        cfg.alertAPIM.selectWasIds               = [];
        cfg.alertAPIM.selectGroup                = '';
        cfg.alertAPIM.selectSub                  = '';
        cfg.alertAPIM.selectWasFirstChild        = undefined;

        cfg.alertTP                            = {};
        cfg.alertTP.selectWas                  = '';
        cfg.alertTP.selectWasId                = '';
        cfg.alertTP.selectWasIds               = [];
        cfg.alertTP.selectGroup                = '';
        cfg.alertTP.selectSub                  = '';
        cfg.alertTP.selectWasFirstChild        = undefined;

        cfg.alertBusiness                            = {};
        cfg.alertBusiness.selectWas                  = '';
        cfg.alertBusiness.selectWasId                = '';
        cfg.alertBusiness.selectWasIds               = [];
        cfg.alertBusiness.selectGroup                = '';
        cfg.alertBusiness.selectSub                  = '';
        cfg.alertBusiness.selectWasFirstChild        = undefined;

        cfg.alert                               = {};
        // 선택한 그룹 또는 WAS,DB,WebServer
        cfg.alert.sltName                       = '';
        // 선택한 WAS,DB,WebServer의 ID, 그룹이 선택되면 undefined
        cfg.alert.sltId                         = '';
        // WAS,DB,WebServer 선택시 상위 그룹명, 그룹이 없거나 그룹이 선택되면 undefined
        cfg.alert.sltGroup                      = '';
        // 하위 노드가 있으면 true
        cfg.alert.sltExistSub                   = false;
        // 그룹 선택시 하위 노드의 첫번째 data
        cfg.alert.sltFirstChild                 = '';
        // TYPE(Oracle,DB2)
        cfg.alert.sltType                       = '';
        // MODE(WAS,DB,WebServer)
        cfg.alert.sltMode                       = '';
        cfg.alert.sltAppType                    = '';
        // 그룹에 속해있는 WASID 목록
        cfg.alert.wasIds                        = [];

        cfg.alertWas.regStatList                = [];

        cfg.repositoryInfo                      = {};
        // host 알람 추가로 인한 전용 hostId값.
        cfg.alert.sltHostId                     = '';

        cfg.setConfigToRepo = function(dataSet, callBackFunc, scope, type){
            var tempDataSet, dbName, keys,
                ix, ixLen, jx, jxLen;

            for(ix = 0, ixLen = cfg.repositoryInfo.other.length; ix < ixLen; ix++){
                tempDataSet = {};
                dbName = cfg.repositoryInfo.other[ix].database_name;

                keys = Object.keys(dataSet);
                for(jx = 0, jxLen = keys.length; jx < jxLen; jx++){
                    tempDataSet[keys[jx]] = dataSet[keys[jx]];
                }

                if(!type && type !== 'function'){
                    tempDataSet.database = dbName;
                    WS.SQLExec(tempDataSet, callBackFunc, scope);
                }
                else{
                    tempDataSet.options.dbname = dbName;
                    WS.PluginFunction(tempDataSet, callBackFunc, scope);
                }
            }
        };

        cfg.tabpanel = Ext.getCmp('cfg_tab_panel');

        this.area.setVisible(true);
        this.setRepositoryInfo();

        // "My View" 페이지가 기본 페이지로 나오게 하는 부분
        var defaultTab = Ext.create('config.config_myview');

        var panel = Ext.create('Ext.panel.Panel', {
            layout  : 'vbox',
            id      : 'config_myview_panel',
            width   : '100%',
            height  : '100%',
            flex    : 1,
            title   : common.Util.TR('My Configuration'),
            closable: false,
            border  : false
        });

        cfg.tabpanel.add(panel);
        try {
            cfg.tabpanel.setActiveTab(0);
        } catch(e) {
            cfg.tabpanel.setActiveTab(0);
        }

        cfg.tabpanel.items.items[0].id = 'config_myview_panel';
        cfg.tabpanel.items.items[0].setTitle(common.Util.TR('My Configuration'));

        defaultTab.init(panel);

        // admin_check 상태에 따라 보여질 화면를 조정한다.
        switch (Comm.web_env_info['admin_check']) {
            // 일반 모드
            case 0 :
                // Repository Configuration
                Ext.getCmp('config-myview-repoPanel').setVisible(false);
                // Configuration
                Ext.getCmp('cfg_menu_configuration').setVisible(false);
                // Alert Configuration
                Ext.getCmp('cfg_menu_alertconfiguration').setVisible(false);
                // Business Configuration
                Ext.getCmp('cfg_menu_businessconfiguration').setVisible(false);
                // Repository Configuration
                Ext.getCmp('cfg_menu_repositoryconfiguration').setVisible(false);
                // Property Configuration
                Ext.getCmp('cfg_menu_propertyconfiguration').setVisible(false);
                // Sender History
                Ext.getCmp('cfg_menu_senderHistory').setVisible(false);
                // ETE Configuration
                Ext.getCmp('cfg_menu_eteconfiguration').setVisible(false);
                // AI Configuration
                Ext.getCmp('cfg_menu_trainningAI').setVisible(false);
                Ext.getCmp('cfg_menu_userconfiguration').expand();

                this.treeUserPanel.getRootNode().appendChild({ text: common.Util.TR('My Configuration'), id: 'config_myview', leaf: true });
                if (Comm.web_env_info['property_load'] === 1) {
                    this.treeUserPanel.getRootNode().appendChild({ text: common.Util.TR('JSPD Property Configuration'), id: 'config_propertyconfig', leaf: true });
                }
                break;
            // 관리자 모드
            case 1 :
                var rootnode = this.treeUserPanel.getRootNode();
                rootnode.appendChild({ text: common.Util.TR('My Configuration'),            id: 'config_myview',                    leaf: true });
                rootnode.appendChild({ text: common.Util.TR('User Accounts'),               id: 'config_userlist',                  leaf: true });
                rootnode.appendChild({ text: common.Util.TR('User Privileges'),             id: 'config_userpermission',            leaf: true });
                rootnode.appendChild({ text: common.Util.TR('User Access IP Settings'),     id: 'config_user_access_ip_setting',    leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Service Privileges'),          id: 'config_userservice',               leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Service Order Settings'),      id: 'config_user_service_ordering',     leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Group/Agent Order Settings'),  id: 'config_groupwas_ordering',         leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Trace Setting'),               id: 'config_trace_list_setting',        leaf: true });
                rootnode.appendChild({ text: common.Util.TR('SMS Receive Setting'),         id: 'config_sms_receive_setting',       leaf: true });
                rootnode.appendChild({ text: common.Util.TR('SMS Receive Group Setting'),   id: 'config_sms_receive_group_setting', leaf: true });
                rootnode.appendChild({ text: common.Util.TR('SMS Destination Agent Settings'),  id: 'config_sms_destination_agent_setting', leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Report Setting'),              id: 'config_report_setting',            leaf: true });

                rootnode = this.treeAlertPanel.getRootNode();
                rootnode.appendChild({ text: common.Util.TR('WAS Agent List'),                  id: 'config_alertWAS',               leaf: true });
                if ( !window.isIMXNonDB ){
                    rootnode.appendChild({ text: common.Util.TR('DB List'),                     id: 'config_alertDB',                leaf: true });
                }
                rootnode.appendChild({ text: common.Util.TR('Host List'),                   id: 'config_alertHost',              leaf: true});
                rootnode.appendChild({ text: common.Util.TR('SMS Mapping'),                 id: 'config_alertSMS',               leaf: true});
                rootnode.appendChild({ text: common.Util.TR('APIM Agent List'),             id: 'config_alertAPIM',              leaf: true});
                rootnode.appendChild({ text: common.Util.TR('TP Agent List'),               id: 'config_alertTP',                leaf: true});
                rootnode.appendChild({ text: common.Util.TR('Business List'),               id: 'config_alertBusiness',          leaf: true});

                rootnode = this.treeBusinessPanel.getRootNode();
                rootnode.appendChild({ text: common.Util.TR('Business Transaction Name'),   id: 'config_alertBusinessTxnName',   leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Business Class Name'),         id: 'config_alertBusinessClassName', leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Business Block Settings'),     id: 'config_blockSettings',          leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Business Block History'),      id: 'config_blockListHistory',       leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Business Register'),           id: 'config_businessRegister',       leaf: true });
                rootnode.appendChild({ text: common.Util.TR('Business Tier Exclusion Register'), id: 'config_businessTierExclusionRegister', leaf: true });

                rootnode = this.treeRepositoryPanel.getRootNode();
                rootnode.appendChild({ text: common.Util.TR('Partition Manager'),           id: 'config_alertParitionManager',   leaf: true });

                rootnode = this.treePropertyPanel.getRootNode();
                rootnode.appendChild({ text: common.Util.TR('JSPD Property Configuration'), id: 'config_propertyconfig',         leaf: true });

                rootnode = this.treeSenderHistoryPanel.getRootNode();
                rootnode.appendChild({text: common.Util.TR('Sender History'),               id: 'config_senderHistory',          leaf: true});

                rootnode = this.treeETEPanel.getRootNode();
                rootnode.appendChild({text: common.Util.TR('Tier Code Enrollment'),             id: 'config_tier_code_enrollment',      leaf: true});
                rootnode.appendChild({text: common.Util.TR('Tier Information Management'),      id: 'config_tier_information',          leaf: true});
                rootnode.appendChild({text: common.Util.TR('Tier Information Order Settings'),  id: 'config_tier_information_ordering', leaf: true});
                //rootnode.appendChild({text: common.Util.TR('SLA Settings Management'),          id: 'config_SLA_settings',              leaf: true});

                rootnode = this.treeAIPanel.getRootNode();
                rootnode.appendChild({text: common.Util.TR('AI Learning Setting'),             id: 'config_ai_learning_setting',      leaf: true});
                break;
            default :
                break;
        }

        Ext.getCmp('config_execute_rtm').setVisible(false);
        Ext.getCmp('config_execute_pa').setVisible(false);

        var url = document.URL.split('/');
        for (var ix = 0; ix < url.length; ix++) {
            if (url[4].toUpperCase() === 'CONFIG') {
                Ext.getCmp('config_execute_rtm').setVisible(true);
                Ext.getCmp('config_execute_pa').setVisible(false);
                break;
            }
        }



        //1506.25 webserver는 설정된 값이 없으면 아예 패널조차 보이게 하지않도록 by정과장님 min.
        var self = this ;
        var dataSet = {};


        dataSet.sql_file = 'IMXConfig_WsInfo_Count.sql' ;
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function( header, data ){

            var root_node = self.treeAlertPanel.getRootNode();

            if ( data.rows[0][0] != '0' ){
                root_node.appendChild({ text: common.Util.TR('Webserver List'),  id: 'config_alertWebServer', leaf: true });
            }

            dataSet.sql_file = null;
            self = null ;

        }) ;
    },

    menuClick: function(s, r) {
        var tabExist = function(s, r) {
            var result = -1;

            if (cfg.tabpanel.items.items.length === 0) {
                result = -1;
            } else {
                for (var ix = 0; ix < cfg.tabpanel.items.items.length; ix++) {
                    if (cfg.tabpanel.items.items[ix].id === r.data.id + '_panel') {
                        result = 0;
                        break;
                    }
                }
            }
            return result;
        };

        if (tabExist(s, r) === -1) {
            this.addTab(r);
        } else {
            var index = cfg.tabpanel.items.findIndex('id', r.data.id);
            cfg.tabpanel.setActiveTab(index);
        }
    },

    addTab: function(r) {
        var pageId = r.data.id;
        this.config_page[pageId] = Ext.create('config.' + pageId);

        if (pageId === 'config_userpermission') {
            cfg.user_permission_view = this.config_page[pageId];
        } else if (pageId === 'config_userservice') {
            cfg.user_service_view = this.config_page[pageId];
        }

        var panel = Ext.create('Exem.Panel', {
            layout: 'vbox',
            id: pageId + '_panel',
            width: '100%',
            height: '100%',
            title: r.data.text,
            closable: true,
            border: false
        });

        cfg.tabpanel.add(panel);

        this.config_page[pageId].init(panel);

        var index = cfg.tabpanel.items.findIndex('id', r.data.id);
        cfg.tabpanel.setActiveTab(index);
    },

    setRepositoryInfo: function(){
        var allRepoInfo = Comm.repositoryInfo,
            tempRepoInfo, repoInfo,
            ix, ixLen;

        tempRepoInfo = {};
        tempRepoInfo.other = [];


        for(ix = 0, ixLen = allRepoInfo.length; ix < ixLen; ix++){
            repoInfo = allRepoInfo[ix];
            if(repoInfo.database_default && common.Util.isMultiRepository()){
                tempRepoInfo.master = repoInfo;
            }
            else{
                if(repoInfo.database_name === 'memory'){
                    continue;
                }
                else{
                    tempRepoInfo.other.push(repoInfo);
                }
            }
        }

        cfg.repositoryInfo = tempRepoInfo;
        cfg.repositoryInfo.currentRepoName = tempRepoInfo.other[0].database_name;
    }
});
