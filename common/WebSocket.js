Ext.define ('common.WebSocket', {
    singleton: true,

    constructor: function () {

        window.onbeforeunload = function(){
            if (window.isDisableClosingMessage !== true &&
                !sessionStorage.getItem('Intermax_ServiceReconfigure')) {

                return common.Util.TR('');
            }
        };

        // 브라우저 reload 가 일어나기 전 연결된 소켓을 모두 끊는다.
        window.onunload = function() {
            if (realTimeWS && !sessionStorage.getItem('Intermax_ServiceReconfigure')) {
                realTimeWS.workerDestroy();
                if (WS) {
                    WS.close();
                    Ext.Object.clear(WS);
                }
                if (WS2) {
                    WS2.close();
                    Ext.Object.clear(WS2);
                }
                Ext.Object.clear(realTimeWS);
            }
        };

        var address = document.location.host;
        var host    = address.split(':')[0];
        var port    = address.split(':')[1];

        Comm.onActivityTarget = [];
        Comm.onActiveTxnTarget = [];
        Comm.onWasStatTarget = [];
        Comm.onAlarmHistoryTarget = [];
        Comm.onJvmGCStatTarget = [];
        Comm.onJvmGCMaxTarget = [];
        Comm.onDBCPUUsageTarget = [];
        Comm.onDBStatTarget = [];
        Comm.onProcessMonitorTarget = [];
        Comm.onLockInfoTarget = [];
        Comm.onServiceInfoTarget = [];

        Comm.repositoryInfo = [];
        Comm.currentRepositoryInfo = {};

        var myRepo = String(localStorage.getItem('Intermax_MyRepository'));

        WS.onConfig = function(header, data) {
            console.debug('%c [WebSocket]  Execute onconfig.', 'color:blue;');

            console.debug('%c [WebSocket]  Set Excel Export Rows Limit.', 'color:blue;');
            if (!Comm.excelExportLimitRow) {
                Comm.excelExportLimitRow = {};
            }
            Comm.excelExportLimitRow = header.excel_export_maxrows;

            if (Comm.isCompleteRepositoryConfig === true) {
                WS.defaultdb = Comm.currentRepositoryInfo.database_name;
                if (WS2) {
                    WS2.defaultdb = Comm.currentRepositoryInfo.database_name;
                }
                return;
            }
            console.debug('%c [WebSocket]  Repository configuration.', 'color:blue;');

            if (header.command === 'database_list') {
                for (var ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                    Comm.repositoryInfo[ix] = {};
                    Comm.repositoryInfo[ix].database_database     = data[ix].database_database;
                    Comm.repositoryInfo[ix].database_default      = data[ix].database_default;
                    Comm.repositoryInfo[ix].database_description  = data[ix].database_description;
                    Comm.repositoryInfo[ix].database_name         = data[ix].database_name;
                    Comm.repositoryInfo[ix].database_server       = data[ix].database_server;
                    Comm.repositoryInfo[ix].database_type         = data[ix].database_type;
                    Comm.repositoryInfo[ix].database_user         = data[ix].database_user;
                }

                var key;
                if (myRepo !== 'null') {
                    WS.defaultdb = myRepo;
                    for (key in Comm.repositoryInfo) {
                        if(Comm.repositoryInfo.hasOwnProperty(key) && Comm.repositoryInfo[key]['database_name'] === myRepo){
                            Comm.currentRepositoryInfo = Comm.repositoryInfo[key];
                            cfg.repository = Comm.currentRepositoryInfo.database_type;
                            return;
                        }
                    }
                } else {
                    for (key in data) {
                        if(data.hasOwnProperty(key) && data[key]['database_default']){
                            Comm.currentRepositoryInfo = data[key];
                            cfg.repository = Comm.currentRepositoryInfo.database_type;
                            localStorage.setItem('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name);
                            common.WebEnv.Save('Intermax_MyRepository', Comm.currentRepositoryInfo.database_name, null);
                            return;
                        }
                    }
                }

                // MaxGauge 연동에 사용되는 URL 정보 설정
                if (header.urls) {
                    Comm.MFO_URL = header.urls.mfo;
                }
            }
        };

        WS.Host = host;
        WS.Port = port;
        WS.parseJSON = true;
        WS.ExtractHeader = true;
        WS.PushData = false;
        WS.UseType  = 'SQL1';
        WS.Open();

        _.each([WS2], function(clone) {
            clone.onSQLExec = WS.onSQLExec;

            var myRepo = String(localStorage.getItem('Intermax_MyRepository'));
            clone.onConfig = function(header) {
                if (header.command === 'database_list' && myRepo !== 'null')
                    clone.defaultdb = myRepo;
            };
            clone.Host = WS.Host;
            clone.Port = WS.Port;
            clone.parseJSON = true;
            clone.ExtractHeader = true;
            clone.PushData = false;
            clone.UseType  = 'SQL2';
            clone.Open();
        });
    },

    sleep: function(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    }

});
