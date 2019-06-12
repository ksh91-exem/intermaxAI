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

        // 기본페이지를 System Settings로 설정
        var initialTabRecord = {
            data: {
                id: 'config_system_setting',
                text: common.Util.TR('System Settings'),
            }
        }
        
        this.addTab(initialTabRecord);

        // // admin_check 상태에 따라 보여질 화면를 조정한다.
        // switch (Comm.web_env_info['admin_check']) {}
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
