/***************************************************************************************************************
 *
 * Web Worker 통신 정의
 *
 ***************************************************************************************************************/
var COMMAND         = {
    PACKET_DATA         : 0,
    PARSING_DATA        : 1,

    PACKET_ADD          : 5,
    PACKET_REMOVE       : 6,

    DATA                : 10,

    INIT                : 30,
    SET_TREND_CHART     : 31,
    SET_STAT_LIST       : 32,

    ADD_SERVER          : 36,
    ADD_WS              : 37,
    ADD_DB              : 38,
    ADD_WAS             : 39,
    ADD_HOST            : 40,
    ADD_OPTION          : 41,

    WS_INIT             : 42,
    WS_CLOSE            : 43,
    WS_EXCEPTION        : 44,

    PLATFORMJS_STATUS   : 48,

    TIMEZONE            : 50,

    SET_TXN_FILTERS     : 60,

    ACTIVITY            : 'Activity',
    ACTIVETXN           : 'ActiveTxn',
    PROCESS             : 'Process',
    PROCESS_STATUS      : 'ProcessStatus',
    WAS_STAT            : 'WasStat',
    WAS_SESSION_CNT     : 'WasSessionCount',
    DB_CPU              : 'DBCPU',
    DB_STAT             : 'DBStat',
    JVM_GC_STAT         : 'JVMGCStat',
    JVM_GC_MAX          : 'JVMGCMax',
    LOCK                : 'Lock',
    SERVICE             : 'Service',
    CONN_POOL           : 'ConnPool',
    WAS_TPS             : 'TPS',
    ALARM               : 'Alarm',
    AUTO_ID_STATUS      : 'AutoIDStatus',
    WAS_MONITOR         : 'WasMonitor',
    TOPOLOGY            : 'Topology',
    TOPOLOGY_CNT        : 'TopologyCount',
    TP_SVR_STAT         : 'SvrStat',
    TP_SVR_PROC_STAT    : 'SvrProcStat',
    TP_SVC_STAT         : 'SvcStat',
    TP_CLIENT_INFO      : 'ClientInfo',
    TUX_STAT            : 'TuxStat',
    TUX_SERVER          : 'TuxServer',
    TUX_SERVICE         : 'TuxService',
    TUX_QUEUE           : 'TuxQueue',
    TUX_CLIENT          : 'TuxClient',

    WEB_ACTIVE_DETAIL   : 'ActiveDetail',
    WEB_WTB_CMD_SI      : 'WTB_CMD_SI',
    WEB_WTB_CMD_CI      : 'WTB_CMD_CI',
    WEB_OS_STAT_EXTEND  : 'OSStatExtend',
    WEB_RESPONSE_STATUS : 'ResponseStatus',
    WEB_ACTIVITY_FILTER : 'ActivityFilterWS',

    APIM_OS_STAT        : 'APIM_OS_STAT',

    END_BUSINESS_STAT   : 'END_BUSINESS_STAT',
    ACTIVITY_FILTER_BUSINESS: 'ACTIVITY_FILTER_BUSINESS',
    END_BUSINESS_VISITOR: 'END_BUSINESS_VISITOR',

    OTHERS              : 'Others'
};

var PKT_DATA_NUMBER = {
    ALARM               : 200,
    SERVICE_INFO        : 201,
    WAS_STAT            : 203,
    DB_CPU_USAGE        : 204,
    DB_STAT             : 205,
    SQL_ELAPSE          : 206,
    ACTIVE_TXN          : 207,

    POOL_MONITOR        : 208,
    PROCESS_MONITOR     : 210,
    JVM_GC_MAX          : 211,
    JVM_GC_STAT         : 212,
    LOCK_INFO           : 213,
    WS_STAT             : 216,
    WS_OS_STAT          : 217,

    ORACLE_SESSION      : 220,

    AUTO_ID_STATUS      : 50024,
    WAS_MONITOR_DAILY   : 51000,
    PROCESS_STATUS      : 51001,
    ACTIVITY            : 51002,
    TOPOLOGY_INFO       : 51003,
    TOPOLOGY_COUNT      : 51004,
    TP_SVR_STAT         : 51005,
    TP_SVR_PROC_STAT    : 51006,
    TP_SVC_STAT         : 51007,
    TP_CLIENT_INFO      : 51008,
    TUX_STAT            : 51012,
    TUX_SERVER          : 51013,
    TUX_SERVICE         : 51014,
    TUX_QUEUE           : 51015,
    TUX_CLIENT          : 51016,

    WEB_ACTIVE_DETAIL   : 52000,
    WEB_WTB_CMD_SI      : 52001,
    WEB_WTB_CMD_CI      : 52004,
    WEB_OS_STAT_EXTEND  : 52005,
    WEB_RESPONSE_STATUS : 52006,
    WEB_ACTIVITY_FILTER : 52007,

    APIM_OS_STAT        : 52102,

    END_BUSINESS_STAT        : 52200,
    ACTIVITY_FILTER_BUSINESS : 52201,
    END_BUSINESS_VISITOR     : 52202
};

var d = null;

var wasLastTime;
var isWasCheckRun = false;
var wasStat = {
    // 기본적으로 보여지는 항목
    defaultName: [
        'WAS_SESSION', 'ACTIVE_TRANSACTION', 'TPS', 'JVM_CPU_USAGE', 'JVM_FREE_HEAP', 'JVM_HEAP_SIZE'
    ],

    // 전체 지표 항목
    names: [
        'TPS',
        'SQL_FETCH_COUNT',
        'SQL_PREPARE_COUNT',
        'SQL_EXEC_COUNT',
        'OS_RCV_PACKETS',
        'OS_SEND_PACKETS',
        'ACTIVE_TRANSACTION',
        'ACTIVE_DB_SESSIONS',
        'ACTIVE_USERS',
        'DB_SESSIONS',
        'WAS_SESSION',
        'APP_SESSION',
        'JVM_CPU_USAGE',
        'JVM_FREE_HEAP',
        'JVM_HEAP_SIZE',
        'JVM_HEAP_USAGE',
        'JVM_THREAD_COUNT',
        'JVM_USED_HEAP',
        'JVM_MEM_SIZE',
        'JVM_GC_COUNT',
        'JVM_GC_TIME',
        'OS_CPU_SYS',
        'OS_CPU_USER',
        'OS_CPU_IO',
        'OS_FREE_MEM',
        'OS_TOTAL_MEM',
        'REQUEST_RATE',
        'TXN_ELAPSE',
        'SQL_ELAPSE',
        // EtoE 표시 지표
        'ERROR_COUNT'
    ],

    // x축 데이터 갯수
    dataCount: 30
};

var tpStat = {
    dataCount: 30,
    names: [
        'QCOUNT',
        'COUNT',
        'TP_TPS',
        'TOTAL_COUNT',
        'AQ_COUNT',
        'AVERAGE',
        'Q_AVERAGE',
        'FAIL_COUNT',
        'ERROR_COUNT',
        'CONNECTED_CLIENTS',
        // 추가 지표
        'OS_CPU_SYS',
        'OS_CPU_USER',
        'OS_CPU_IO',
        'OS_FREE_MEM',
        'OS_RCV_PACKETS',
        'OS_SEND_PACKETS',
        'OS_TOTAL_MEM'
    ]
};

var tuxStat = {
    dataCount: 30,
    names: [
        // TUX_STAT
        'CUR_SERVERS', 'CUR_SERVICES', 'CUR_REQ_QUEUE', 'CUR_GROUPS', 'DEQUEUE', 'ENQUEUE', 'POST', 'REQ', 'NUM_TRAN', 'NUM_TRANABT', 'NUM_TRANCMT', 'WKCOMPLETED',
        // TUX_SERVER
        'REQC', 'REQD',
        // TUX_SERVICE
        'NCOMPLETED',
        // TUX_QUEUE
        'SERVER_CNT', 'NTOTWKQUEUED', 'NQUEUED', 'WKQUEUED',
        // TUX_CLIENT
        'NUMTRAN', 'NUMTRANCMT', 'NUMTRANABT', 'CONNECTED_CLIENTS',
        // 추가 지표
        'OS_CPU_SYS',
        'OS_CPU_USER',
        'OS_CPU_IO',
        'OS_FREE_MEM',
        'OS_RCV_PACKETS',
        'OS_SEND_PACKETS',
        'OS_TOTAL_MEM'
    ]
};

var statusCodeStat = {
    dataCount: 30,
    names: ['CODE_400', 'CODE_500']
};

var osExtendStat = {
    dataCount: 30,
    names: ['OS_CPU_SYS', 'OS_CPU_USER', 'OS_CPU_IO', 'OS_FREE_MEM', 'OS_TOTAL_MEM', 'OS_RCV_PACKETS', 'OS_SEND_PACKETS']
};

var webTrendStat = {
    dataCount: 30,
    names: [
        'OS_CPU', 'OS_MEM', 'TPS', 'AVERAGE', 'OS_RCV_PACKETS', 'OS_SEND_PACKETS',
        'COUNT', 'ERROR_COUNT', 'CONNECTED_CLIENTS', 'AQ_COUNT', 'QCOUNT'
    ]
};

var cdTrendStat = {
    dataCount: 30,
    names: [
        'TPS',
        'TXN_ELAPSE',
        // 추가 지표
        'OS_CPU_SYS',
        'OS_CPU_USER',
        'OS_CPU_IO',
        'OS_FREE_MEM',
        'OS_RCV_PACKETS',
        'OS_SEND_PACKETS',
        'OS_TOTAL_MEM',
        // EtoE 표시 지표
        'ERROR_COUNT'
    ]
};

var bizTrendStat = {
    dataCount: 30,
    names: ['TPS', 'TXN_ELAPSE']
};

var gcStat = {
    names    : ['EdenUsage', 'OldUsage', 'PermUsage', 'GCTime', 'GCCount', 'ClassCount'],
    YGC      : null,
    FGC      : null,
    YGCT     : null,
    FGCT     : null,
    Loaded   : null,
    UnLoaded : null,
    EU       : null,
    OU       : null,
    PU       : null,

    EdenUsage  : null,
    OldUsage   : null,
    PermUsage  : null,
    GCTime     : null,
    GCCount    : null,
    ClassCount : null
};

function IMXWSWorker(fileName) {

    this.Host = document.location.hostname;
    this.Port = document.location.port;
    this.parseJSON = true;
    this.ExtractHeader = true;
    this.PushData = false;
    this.allwasservers = false;

    if (!window.Worker) {
        fileName = null;
        return;
    }

    if (!fileName) {
        return;
    }

    this.worker = new window.Worker(fileName);

    this.worker.onmessage = this._onmessage.bind(this);

    this.worker.removeEventListener = this.workerDestroy.bind(this);

    // worker 안에서 IMXWS 객체를 생성하라는 신호를 보낸다
    this.send({
        command: COMMAND.WS_INIT,
        data: {
            Host: this.Host,
            Port: this.Port,
            parseJSON: this.parseJSON,
            ExtractHeader: this.ExtractHeader,
            PushData: this.PushData,
            allwasservers: this.allwasservers
        }
    });

    fileName = null;
}

IMXWSWorker.prototype.send = function(data) {
    this.worker.postMessage(data);

    data = null;
};

IMXWSWorker.prototype._onmessage = function(e) {
    if (e.data == undefined) {
        e = null;
        return;
    }

    d = e.data;
    var command = d.command;
    var key     = d.key;

    var isHeaerDataType, isDown, wasIdArr, statusName,
        ix, ixLen;

    if (d.data.header) {
        isHeaerDataType = d.data.header.datatype != null;
    }

    switch (command) {
        case COMMAND.PACKET_DATA :
            if (key == COMMAND.ALARM) {
                break;
            }

            if (key == COMMAND.WAS_MONITOR) {
                this.convertWasMonitorData(d.data.data);

            } else if (key == COMMAND.AUTO_ID_STATUS) {
                this.catchAutoIdStatus(d.data.data);

            } else if (key == COMMAND.DB_STAT) {
                this.checkDBStat(d.data.data);
                common.RTMDataManager.onDBStatusFrame(d.data.data);

            } else if (key == COMMAND.DB_CPU) {
                this.checkDBCpuLastTime(d.data.data);
                common.RTMDataManager.onDBStatusFrame(d.data.data);

            } else if (key == COMMAND.WAS_STAT) {
                this.convertWasStatData(d.data, isHeaerDataType);

                common.RTMDataManager.onWasStatFrame(d.data.data);

            } else if (key == COMMAND.WAS_SESSION_CNT) {
                this.convertWasSessionCount(d.data, isHeaerDataType);

            } else if (key == COMMAND.JVM_GC_STAT) {
                this.convertGcData(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.ACTIVETXN) {
                this.convertActiveTxnRemoteData(d.data.data);
                common.RTMDataManager.onActiveTxnFrame(d.data.data);

            } else if (key == COMMAND.LOCK) {
                common.RTMDataManager.onLockInforame(d.data.data);

            } else if (key == COMMAND.ACTIVITY) {
                common.RTMDataManager.onActivityFrame(d.data.data, d.data.header);

                for (ix = 0, ixLen = Comm.onActivityTarget.length; ix < ixLen; ix++) {
                    Comm.onActivityTarget[ix].pushData(d.data.header, d.data.data);
                }

                this.convertWebActivity(d.data.data, d.data.header);

            } else if (key == COMMAND.PROCESS) {
                this.convertProcessMonitor(d.data.data);

                for (ix = 0, ixLen = Comm.onProcessMonitorTarget.length; ix < ixLen; ix++) {
                    if (Comm.onProcessMonitorTarget[ix].onData) {
                        Comm.onProcessMonitorTarget[ix].onData(d.data.header, d.data.data);
                    }
                }

            } else if (key == COMMAND.PROCESS_STATUS) {
                this.convertProcessStatus(d.data.data);

            } else if (key == COMMAND.CONN_POOL) {
                common.RTMDataManager.onConnPoolStatusFrame(d.data.data);

            } else if (key == COMMAND.WAS_TPS) {
                common.RTMDataManager.onWasTPSFrame(d.data.data);

            } else if (key == COMMAND.TOPOLOGY) {
                common.RTMDataManager.onTopologyFrame(d.data.data);

            } else if (key == COMMAND.TOPOLOGY_CNT) {
                common.RTMDataManager.onTopologyCountFrame(d.data.data);

            } else if (key == COMMAND.TP_SVR_STAT) {
                this.convertTPSvrStat(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.TP_SVR_PROC_STAT) {
                this.convertTPSvrProcStat(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.TP_SVC_STAT) {
                this.convertTPSvcStat(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.TP_CLIENT_INFO) {
                this.convertTPClientInfo(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.TUX_STAT) {
                this.convertTuxStat(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.TUX_SERVER) {
                this.convertTuxServer(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.TUX_SERVICE) {
                this.convertTuxService(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.TUX_QUEUE) {
                this.convertTuxQueue(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.TUX_CLIENT) {
                this.convertTuxClient(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.WEB_RESPONSE_STATUS) {
                this.convertWebResponseStatus(d.data.data);

            } else if (key == COMMAND.WEB_OS_STAT_EXTEND) {
                this.convertWebOsStatExt(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.WEB_ACTIVITY_FILTER) {
                this.convertWebActivity(d.data.data, d.data.header);

                common.RTMDataManager.onWebActivityFrame(d.data.data, d.data.header);

                for (ix = 0, ixLen = Comm.onActivityTarget.length; ix < ixLen; ix++) {
                    Comm.onActivityTarget[ix].pushData(d.data.header, d.data.data);
                }

            } else if (key == COMMAND.WEB_ACTIVE_DETAIL) {
                //this.convertWebActiveDetail(d.data.data);

                common.RTMDataManager.onWebActiveDetailFrame(d.data.data);

            } else if (key == COMMAND.WEB_WTB_CMD_SI) {
                this.convertWebTobSI(d.data.data);

            } else if (key == COMMAND.WEB_WTB_CMD_CI) {
                this.convertWebTobCI(d.data.data);

            } else if (key == COMMAND.APIM_OS_STAT) {
                this.convertApimOsStat(d.data.data, isHeaerDataType);

            } else if (key == COMMAND.END_BUSINESS_STAT) {
                this.convertBizStatData(d.data.data);

                common.RTMDataManager.onBizActivityFrame(d.data.data);

            } else if (d.data) {
                Repository[key] = {};
                Repository[key] = d.data;

            } else {
                console.error(d);
            }

            break;

        case COMMAND.PARSING_DATA :

            switch (key) {
                case COMMAND.ALARM :

                    if (!Comm.Status) {
                        Comm.Status = d.data.status.data;

                    } else {
                        // .Net인 경우 알람처리를 다르게 진행하도록 구분하여 처리.
                        // .Net인 경우 Server Down 후 Server Boot 가 들어오기 전에는 실시간 데이터가 들어오더라도
                        // Down알람을 유지하고 Server Boot 알람이 들어오면 해제가 되도록 수정함.
                        if (+d.data.alarm[1] === 1 && this.isNetApp(d.data.alarm[2])) {
                            isDown = Comm.RTComm.isDownByID(d.data.alarm[2]);
                            if (isDown && d.data.alarm[4] !== 'Server Boot') {
                                break;
                            }
                        }

                        // TP인 경우 알람처리를 다르게 진행하도록 구분하여 처리.
                        // TP인 경우 Server Down, TP Down, Disconnected 후 다른 알람이 들어오더라도 Down알람 상태를
                        // 유지하고 Server Boot, TP Boot, Connected 알람이 들어오면 해소되게 수정함.
                        if (+d.data.alarm[1] === 1 && this.isTP(d.data.alarm[2])) {
                            isDown = Comm.RTComm.isDownByID(d.data.alarm[2]);
                            if (isDown && d.data.alarm[4] !== 'Server Boot' && d.data.alarm[4] !== 'TP Boot' && d.data.alarm[4] !== 'Connected') {
                                break;
                            }
                        }

                        if (Comm.wasIdArr) {
                            wasIdArr = Comm.wasIdArr.concat();
                        } else {
                            wasIdArr = Object.keys(Comm.Status.WAS);
                        }

                        for (ix = 0, ixLen = wasIdArr.length; ix < ixLen; ix++) {
                            statusName = d.data.status.data.WAS[wasIdArr[ix]];

                            if (this.isNetApp(wasIdArr[ix]) && Comm.RTComm.isDownByID(wasIdArr[ix])) {
                                if (statusName === 'Server Boot') {
                                    Comm.Status.WAS[wasIdArr[ix]] = statusName;
                                }
                            } else if (this.isTP(wasIdArr[ix]) && Comm.RTComm.isDownByID(wasIdArr[ix])) {
                                if (statusName === 'Server Boot' || statusName === 'TP Boot' || statusName === 'Connected') {
                                    Comm.Status.WAS[wasIdArr[ix]] = statusName;
                                }
                            } else if (statusName) {
                                Comm.Status.WAS[wasIdArr[ix]] = statusName;

                            } else if (!Comm.Status.WAS[wasIdArr[ix]]) {
                                Comm.Status.WAS[wasIdArr[ix]] = '';
                            }
                        }

                        if (wasIdArr.length <= 0) {
                            Comm.Status.WAS = d.data.status.data.WAS;
                        }
                    }

                    Comm.Status.DB        = d.data.status.data.DB;
                    Comm.Status.WebServer = d.data.status.data.WebServer;
                    Comm.Status.CD        = d.data.status.data.CD;
                    Comm.Status.Received  = d.data.status.Received;

                    this.checkExpiredLicense(d.data.alarm);

                    this.setAlarmInfo(d.data.alarm);

                    common.RTMDataManager.onAlarmFrame(d.data.alarm);

                    break;

                case COMMAND.TIMEZONE :
                    Repository.time_zone = d.data.timeZone;
                    Repository.timeZoneOffset = d.data.timeZoneOffset;

                    break;

                case COMMAND.PLATFORMJS_STATUS :
                    if (d.data == 0 && ! this.isPlatFormDisconnected) {
                        this.isPlatFormDisconnected = true;
                        common.RTMDataManager.onAlarmFrame([Date.now(), 0, 0, 'PlatformJS', 'Disconnected', 0, 2, 0, 'PlatformJS Alert', '']);

                    } else if (d.data == 1) {
                        this.isPlatFormDisconnected = false;
                        common.RTMDataManager.onAlarmFrame([Date.now(), 0, 0, 'PlatformJS', 'Disconnected', 0, 0, 0, 'PlatformJS Alert', '']);
                    }
                    break;

                default:
                    break;
            }
            break;

        default:
            break;
    }

    ix     = null;
    ixLen  = null;
    d.data = null;
    d      = null;
    e.data = null;
    e      = null;
};

/**
 * Check Alarm
 */
IMXWSWorker.prototype.setAlarmInfo = function(aData) {

    /*
     * 0: time
     * 1: server_type  (1: WAS, 2: DB, 3:WebServer, 15: APIM, 20: BIZ)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type
     * 9: descr
     * 10: alert_resource_id
     * 11: tier_id
     * 12: business_id
     * 13: warning
     * 14: critical
     * 15: customData
     * */

    var alarmList, typeName;
    var isContain = false;

    var alarmTime  = aData[0];
    var serverType = aData[1];
    var wasId      = aData[2];
    var alertName  = aData[4];
    var alertValue = aData[5];
    var alertLevel = aData[6];
    var alertType  = aData[8];
    var alertDescr = aData[9];
    var tierId     = aData[11];
    var businessId = aData[12];
    var warning    = aData[13];
    var critical   = aData[14];
    var customData = aData[15];
    var isBootAlarm = false;

    // 라이선스 알람을 체크할 때 알람 값이 0 이상인 경우 정상으로 체크한다.
    // description 항목 값이 'UNLIMITED' 인 경우 정상으로 체크해도 되지만 빈 값으로 오는 경우가 있어서
    // 알람값으로 체크를 하게 변경, 화면에서 필터 처리를 함.
    if (alertName.toLocaleLowerCase() === 'license' && alertLevel > 0 && alertValue >= 0) {
        alertLevel = 0;
    }

    switch (serverType) {
        case 1:
            typeName = 'WAS';
            break;
        case 2:
            typeName = 'DB';
            break;
        case 3:
            typeName = 'WebServer';
            break;
        case 15:
            typeName = 'CD';
            break;
        case 20:
            typeName = 'BIZ';
            break;
        default:
            break;
    }

    if (!typeName) {
        return;
    }

    if (Repository.alarmListInfo[typeName] == null) {
        Repository.alarmListInfo[typeName] = {};
    }
    if (Repository.alarmListInfo[typeName][wasId] == null) {
        Repository.alarmListInfo[typeName][wasId] = [];
    }
    alarmList = Repository.alarmListInfo[typeName][wasId];

    if (window.realtime &&
        (alertName === window.realtime.alarms.SERVER_BOOT ||
         alertName === window.realtime.alarms.API_BOOT    ||
         alertName === window.realtime.alarms.TP_BOOT     ||
         alertName === window.realtime.alarms.CONNECTED)) {
        isBootAlarm = true;
        alertLevel = 0;
    }

    var ix;
    if (alarmList.length > 0) {
        for (ix = 0; ix < alarmList.length; ) {
            if (isBootAlarm && window.realtime &&
                (alarmList[ix].name === window.realtime.alarms.SERVER_DOWN ||
                 alarmList[ix].name === window.realtime.alarms.API_DOWN    ||
                 alarmList[ix].name === window.realtime.alarms.TP_DOWN     ||
                 alarmList[ix].name === window.realtime.alarms.DISCONNECTED)) {

                isContain = true;
                alarmList.splice(ix, 1);
                ix--;
            } else if (alarmList[ix].name === alertName) {
                isContain = true;
                alarmList[ix].lastTime   = Date.now();
                alarmList[ix].alarmTime  = alarmTime;
                alarmList[ix].level      = alertLevel;
                alarmList[ix].alertType  = alertType;
                alarmList[ix].serverType = serverType;
                alarmList[ix].value      = alertValue;
                alarmList[ix].descr      = alertDescr;
                alarmList[ix].tierId     = tierId;
                alarmList[ix].businessId = businessId;
                alarmList[ix].warning    = warning;
                alarmList[ix].critical   = critical;
                alarmList[ix].customData = customData;
            }
            ix++;
        }
    }

    if (!isContain && !isBootAlarm) {
        alarmList.push({
            lastTime  : Date.now(),
            alarmTime : alarmTime,
            name      : alertName,
            value     : alertValue,
            level     : alertLevel,
            alertType : alertType,
            serverType: serverType,
            descr     : alertDescr,
            tierId    : tierId,
            businessId: businessId,
            warning   : warning,
            critical  : critical,
            customData: customData
        });
    }

    var statusArr;
    if (serverType === 3 && alertDescr &&
        window.realtime && window.realtime.webProcessAlarm.ACTIVE_DOWN === alertName) {

        // Active Down 알람인 경우 description 데이터 구조
        // 예) 2/1 --> alive 2개, down 1개
        statusArr = alertDescr.split('/');

        // 다운된 프로세스가 없는 경우(건수가 0인 경우) 표시를 하지 않는다.
        if (+statusArr[0] === 0 && +statusArr[1] > 0) {
            Comm.Status.WebServer[wasId] = 'Server Down';
        }
    }

    alarmList = null;
};


IMXWSWorker.prototype.workerDestroy = function() {
    this.send({
        command: COMMAND.WS_CLOSE
    });

    this.worker.terminate();
    this.worker = null;
};


IMXWSWorker.prototype.checkDBCpuLastTime = function(adata) {
    var dbId, ix, ixLen;

    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
        dbId = adata.rows[ix][1];
        Repository.DBCpuLastTime[dbId] = +new Date();
    }
    dbId = null;
};

IMXWSWorker.prototype.checkDBStat = function(adata) {
    var dbId, statName, statValue, ix, ixLen;

    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
        dbId      = adata.rows[ix][1];
        statName  = adata.rows[ix][4];
        statValue = Number(adata.rows[ix][5]);

        Repository.DBStatLastTime[dbId] = +new Date();

        if (!Repository.DBStat[dbId]) {
            Repository.DBStat[dbId] = {
                active: 0,
                lock  : 0
            };
        }

        if (statName === 'lock waiting sessions') {
            Repository.DBStat[dbId].lock = statValue;

        } else if (statName === 'active sessions') {
            Repository.DBStat[dbId].active = statValue;
        }

    }
    dbId = null;
};

IMXWSWorker.prototype.convertGcData = function(adata, isDataType) {
    var kx, kxLen, ix, ixLen, jx, jxLen;
    var wasid;
    var jvmGCStat;
    var isDown;

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++ ) {
        wasid = adata.rows[kx][1];

        if (!Repository.JVMGCStat[wasid]) {
            Repository.JVMGCStat[wasid] = {};
        }

        jvmGCStat = Repository.JVMGCStat[wasid];

        isDown = isDataType ? Comm.RTComm.isDownByServer(wasid) : false;

        if (!jvmGCStat['TIME']) {
            jvmGCStat.TIME = [];

            for (ix = 0; ix < 30; ix++) {
                jvmGCStat.TIME.push(0);
            }
        }

        jvmGCStat.TIME.shift();
        jvmGCStat.TIME.push(adata.rows[kx][0]);

        for (ix = 0, ixLen = gcStat.names.length; ix < ixLen; ix++) {
            if (!jvmGCStat[gcStat.names[ix]]) {
                jvmGCStat[gcStat.names[ix]] = [];

                for (jx = 0, jxLen = 30; jx < jxLen; jx++) {
                    jvmGCStat[gcStat.names[ix]].push(null);
                }
            }
        }

        gcStat.YGC      = +adata.rows[kx][2];
        gcStat.FGC      = +adata.rows[kx][3];
        gcStat.YGCT     = +adata.rows[kx][4];
        gcStat.FGCT     = +adata.rows[kx][5];
        gcStat.Loaded   = +adata.rows[kx][10];
        gcStat.UnLoaded = +adata.rows[kx][11];
        gcStat.EU       = +adata.rows[kx][12];
        gcStat.OU       = +adata.rows[kx][15];
        gcStat.PU       = +adata.rows[kx][18];

        if (isDown) {
            gcStat.EdenUsage  = null;
            gcStat.OldUsage   = null;
            gcStat.PermUsage  = null;
            gcStat.GCTime     = null;
            gcStat.GCCount    = null;
            gcStat.ClassCount = null;

        } else {
            gcStat.EdenUsage  = Math.round(gcStat.EU / 1024 / 1024);
            gcStat.OldUsage   = Math.round(gcStat.OU / 1024 / 1024);
            gcStat.PermUsage  = Math.round(gcStat.PU / 1024 / 1024);
            gcStat.GCTime     = parseFloat((gcStat.YGCT + gcStat.FGCT) / 1000);
            gcStat.GCCount    = gcStat.YGC + gcStat.FGC;
            gcStat.ClassCount = gcStat.Loaded - gcStat.UnLoaded;
        }

        jvmGCStat[gcStat.names[0]].shift();
        jvmGCStat[gcStat.names[1]].shift();
        jvmGCStat[gcStat.names[2]].shift();
        jvmGCStat[gcStat.names[3]].shift();
        jvmGCStat[gcStat.names[4]].shift();
        jvmGCStat[gcStat.names[5]].shift();

        jvmGCStat[gcStat.names[0]].push(gcStat.EdenUsage);
        jvmGCStat[gcStat.names[1]].push(gcStat.OldUsage);
        jvmGCStat[gcStat.names[2]].push(gcStat.PermUsage);
        jvmGCStat[gcStat.names[3]].push(gcStat.GCTime);
        jvmGCStat[gcStat.names[4]].push(gcStat.GCCount);
        jvmGCStat[gcStat.names[5]].push(gcStat.ClassCount);
    }

    adata = null;
    jvmGCStat = null;
};


IMXWSWorker.prototype.convertWasStatData = function(data, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var wasid;
    var statData;
    var jvmHeapUsage;
    var txnEndCount;
    var trendData;
    var trendDataLog;
    var date;
    var isDown;

    for (kx = 0, kxLen = data.data.rows.length; kx < kxLen; kx++ ) {
        statData = data.data.rows[kx];
        wasid = statData[1];

        if (!Repository.trendChartData[wasid]) {
            Repository.trendChartData[wasid] = {};
        }

        jvmHeapUsage =  0;
        txnEndCount  = +statData[27];
        if ((parseInt(statData[14]) !== 0) && (parseInt(statData[14]) - parseInt(statData[13])) >= 0) {
            jvmHeapUsage = Math.ceil((parseInt(statData[14]) - parseInt(statData[13])) / parseInt(statData[14]) * 100);
        }

        if (Repository.trendChartData[wasid] == null) {
            Repository.trendChartData[wasid] = {};
        }

        trendData = Repository.trendChartData[wasid];

        isDown = isDataType ? Comm.RTComm.isDownByServer(wasid) : false;

        trendData.TIME               = statData[0];
        trendData.WAS_SESSION        = null;
        trendData.APP_SESSION        = null;
        trendData.ACTIVE_TRANSACTION = null;
        trendData.DB_SESSIONS        = null;
        trendData.ACTIVE_DB_SESSIONS = null;
        trendData.SQL_EXEC_COUNT     = null;
        trendData.SQL_PREPARE_COUNT  = null;
        trendData.SQL_FETCH_COUNT    = null;
        trendData.JVM_CPU_USAGE      = null;
        trendData.JVM_FREE_HEAP      = null;
        trendData.JVM_HEAP_SIZE      = null;
        trendData.JVM_HEAP_USAGE     = null;
        trendData.JVM_THREAD_COUNT   = null;
        trendData.JVM_USED_HEAP      = null;
        trendData.JVM_MEM_SIZE       = null;
        trendData.JVM_GC_COUNT       = null;
        trendData.JVM_GC_TIME        = null;
        trendData.OS_CPU_SYS         = null;
        trendData.OS_CPU_USER        = null;
        trendData.OS_CPU_IO          = null;
        trendData.OS_FREE_MEM        = null;
        trendData.OS_TOTAL_MEM       = null;
        trendData.OS_SEND_PACKETS    = null;
        trendData.OS_RCV_PACKETS     = null;
        trendData.TPS                = null;
        trendData.ACTIVE_USERS       = null;
        trendData.TXN_ELAPSE         = null;
        trendData.SQL_ELAPSE         = null;
        trendData.REQUEST_RATE       = null;
        trendData.ERROR_COUNT        = null;

        if (!isDown) {
            trendData.TIME               = statData[0];
            trendData.WAS_SESSION        = statData[4];
            trendData.APP_SESSION        = statData[5];
            trendData.ACTIVE_TRANSACTION = statData[6];
            trendData.DB_SESSIONS        = statData[7];
            trendData.ACTIVE_DB_SESSIONS = statData[8];
            trendData.SQL_EXEC_COUNT     = +statData[9] < 0 ? 0 : +statData[9];
            trendData.SQL_PREPARE_COUNT  = parseInt(statData[10]) < 0 ? 0 : parseInt(statData[10]);
            trendData.SQL_FETCH_COUNT    = parseInt(statData[11]) < 0 ? 0 : parseInt(statData[11]);
            trendData.JVM_CPU_USAGE      = Math.ceil(parseInt(statData[12]) / 100);
            trendData.JVM_FREE_HEAP      = Math.ceil(parseInt(statData[13]) / 1024);
            trendData.JVM_HEAP_SIZE      = Math.ceil(parseInt(statData[14]) / 1024);
            trendData.JVM_HEAP_USAGE     = jvmHeapUsage;
            trendData.JVM_THREAD_COUNT   = statData[15];
            trendData.JVM_USED_HEAP      = (parseInt(statData[14]) - parseInt(statData[13])) < 0 ? 0 : Math.ceil(parseInt(statData[14]) - parseInt(statData[13])) / 1024;
            trendData.JVM_MEM_SIZE       = Math.ceil(parseInt(statData[28]) / 1024);
            trendData.JVM_GC_COUNT       = parseInt(statData[16]) + parseInt(statData[17]);
            trendData.JVM_GC_TIME        = (parseInt(statData[18]) + parseInt(statData[19])) / 1000;
            trendData.OS_CPU_SYS         = Math.round(parseInt(statData[20]) / 10);
            trendData.OS_CPU_USER        = Math.round(parseInt(statData[21]) / 10);
            trendData.OS_CPU_IO          = Math.round(parseInt(statData[22]) / 10);
            trendData.OS_FREE_MEM        = Math.ceil(parseInt(statData[23]) / 1024);
            trendData.OS_TOTAL_MEM       = Math.ceil(parseInt(statData[24]) / 1024);
            trendData.OS_SEND_PACKETS    = parseInt(statData[25]) < 0 ? 0 : parseInt(statData[25]);
            trendData.OS_RCV_PACKETS     = parseInt(statData[26]) < 0 ? 0 : parseInt(statData[26]);
            trendData.TPS                = Math.ceil(parseInt(statData[27]) / 3);
            trendData.ACTIVE_USERS       = parseInt(statData[29]);
            trendData.TXN_ELAPSE         = (txnEndCount === 0) ? 0 : parseFloat(statData[30] / txnEndCount / 1000);
            trendData.SQL_ELAPSE         = parseFloat(statData[31] / 1000);
            trendData.REQUEST_RATE       = parseFloat(statData[32]);

            // EtoE 화면에 성능지표 차트에 에러 건수를 표시하기 위해 설정
            trendData.ERROR_COUNT        = Repository.txnError[wasid] || 0;
            Repository.txnError[wasid]   = 0;
        }

        if (!Repository.lastestTime || +new Date(Repository.lastestTime) < +statData[0]) {
            Repository.lastestTime = common.Util.getDate(statData[0]);
        }

        if (typeof window.realtime !== 'undefined') {
            window.realtime.lastestTime = Repository.lastestTime;
        }

        // 패킷 데이터를 받을 시 기준이 되는 타임 레코드를 설정. (최초 1회만 실행)
        // 해당 부분도 추후에 수정될 가능성이 있음.
        if (Repository.trendChartData.timeRecordWasId == undefined) {
            Repository.trendChartData.timeRecordData = [];

            if (statData[0] > 0) {
                Repository.trendChartData.timeRecordWasId = wasid;

                for (ix = 0, ixLen = wasStat.dataCount; ix < ixLen; ix++) {
                    // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                    date = new Date(statData[0] - (ix * 3000));
                    Repository.trendChartData.timeRecordData.unshift(date.getTime());
                }
                date = null;
                ix   = null;
            }
        } else {
            if (Ext.isDefined(Comm.wasIdArr) &&
                Repository.trendDataLog &&
                Repository.trendDataLog[Repository.trendChartData.timeRecordWasId]) {
                // 실시간 데이터가 들어오는지 체크, 데이터가 들어오지 않는 경우 기준이 되는 WAS를 변경.
                wasLastTime = Repository.trendDataLog[Repository.trendChartData.timeRecordWasId].TIME[29];

                // 기준이 되는 WAS의 마지막 시간과 들어온 시간차이를 비교 설정된 시간보다 큰 경우 재설정하며
                // 12초 차이가 나면 변경한다.
                if (statData[0] > (wasLastTime + 12000) &&
                    (isWasCheckRun == undefined || isWasCheckRun === false) ) {
                    isWasCheckRun = true;

                    for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                        if (Repository.trendDataLog[Comm.wasIdArr[ix]] != undefined) {
                            wasLastTime = Repository.trendDataLog[Comm.wasIdArr[ix]].TIME[29];

                            if (statData[0] < (wasLastTime + 12000)) {
                                Repository.trendChartData.timeRecordWasId = Comm.wasIdArr[ix];
                                break;
                            }
                        }
                    }
                    isWasCheckRun = false;
                }
            }
        }

        // 기준이 되는 WAS에 해당하는 경우 타임 레코드 정보를 갱신한다.
        if (Repository.trendChartData.timeRecordWasId == wasid) {
            Repository.trendChartData.timeRecordData.shift();
            Repository.trendChartData.timeRecordData.push(statData[0]);
        }

        // WAS Stat Data Log
        if (!Repository.trendDataLog[wasid]) {
            Repository.trendDataLog[wasid] = {};
        }

        trendDataLog = Repository.trendDataLog[wasid];

        if (!trendDataLog['TIME']) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = wasStat.dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }
        trendDataLog.TIME.shift();
        trendDataLog.TIME.push(statData[0]);

        for (ix = 0, ixLen = wasStat.names.length; ix < ixLen; ix++) {
            if (!trendDataLog[wasStat.names[ix]]) {
                trendDataLog[wasStat.names[ix]] = [];

                for (jx = 0, jxLen = wasStat.dataCount; jx < jxLen; jx++) {
                    trendDataLog[wasStat.names[ix]].push(null);
                }
            }
            trendDataLog[wasStat.names[ix]].shift();
            trendDataLog[wasStat.names[ix]].push(Repository.trendChartData[wasid][wasStat.names[ix]]);
        }

        // TP 모니터링 대상이 있는 경우 TP 지표 레파지토리에 OS 관련 지표값을 설정한다.
        // OS 관련 지표는 WAS STAT 지표에 들어오고 있어서 해당 데이터로 설정하여 보여준다.
        if (Comm.tpIdArr && Comm.tpIdArr.length > 0) {
            this.iniTPTrendData(wasid, 'OS_CPU_SYS',      trendData.OS_CPU_SYS);
            this.iniTPTrendData(wasid, 'OS_CPU_USER',     trendData.OS_CPU_USER);
            this.iniTPTrendData(wasid, 'OS_CPU_IO',       trendData.OS_CPU_IO);
            this.iniTPTrendData(wasid, 'OS_FREE_MEM',     trendData.OS_FREE_MEM);
            this.iniTPTrendData(wasid, 'OS_TOTAL_MEM',    trendData.OS_TOTAL_MEM);
            this.iniTPTrendData(wasid, 'OS_SEND_PACKETS', trendData.OS_SEND_PACKETS);
            this.iniTPTrendData(wasid, 'OS_RCV_PACKETS',  trendData.OS_RCV_PACKETS);

            this.initTP3SecTrendData(wasid, trendData.TIME);
        }

        // Tuxedo 모니터링 대상이 있는 경우 Tuxedo 지표 레파지토리에 OS 관련 지표값을 설정한다.
        // OS 관련 지표는 WAS STAT 지표에 들어오고 있어서 해당 데이터로 설정하여 보여준다.
        if (Comm.tuxIdArr && Comm.tuxIdArr.length > 0) {
            this.iniTuxTrendData(wasid, 'OS_CPU_SYS',      trendData.OS_CPU_SYS);
            this.iniTuxTrendData(wasid, 'OS_CPU_USER',     trendData.OS_CPU_USER);
            this.iniTuxTrendData(wasid, 'OS_CPU_IO',       trendData.OS_CPU_IO);
            this.iniTuxTrendData(wasid, 'OS_FREE_MEM',     trendData.OS_FREE_MEM);
            this.iniTuxTrendData(wasid, 'OS_TOTAL_MEM',    trendData.OS_TOTAL_MEM);
            this.iniTuxTrendData(wasid, 'OS_SEND_PACKETS', trendData.OS_SEND_PACKETS);
            this.iniTuxTrendData(wasid, 'OS_RCV_PACKETS',  trendData.OS_RCV_PACKETS);
        }

    }

    wasid    = null;
    data     = null;
    statData = null;
    trendDataLog = null;
};


IMXWSWorker.prototype.convertWasSessionCount = function(data, isDataType) {
    var ix, ixLen, kx, kxLen;
    var wasid;
    var statData;
    var trendData;
    var trendDataLog;
    var date;
    var dataCount = 60;
    var timeRecordID;
    var isDown;

    for (kx = 0, kxLen = data.data.rows.length; kx < kxLen; kx++ ) {
        statData = data.data.rows[kx];
        wasid    = statData[1];

        if (!Repository.WasSessionData[wasid]) {
            Repository.WasSessionData[wasid] = {};
        }

        isDown = isDataType ? Comm.RTComm.isDownByServer(wasid) : false;

        trendData = Repository.WasSessionData[wasid];

        trendData.TIME          = statData[0];
        trendData.SESSION_COUNT = isDown ? null : statData[4];

        // 패킷 데이터를 받을 시 기준이 되는 타임 레코드를 설정. (최초 1회만 실행)
        // 해당 부분도 추후에 수정될 가능성이 있음.
        if (Repository.WasSessionData.timeRecordWasId == null) {
            Repository.WasSessionData.timeRecordData = [];

            if (statData[0] > 0) {
                Repository.WasSessionData.timeRecordWasId = wasid;

                for (ix = 0, ixLen = dataCount; ix < ixLen; ix++) {
                    // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                    // 1분 단위로 설정
                    date = new Date(statData[0] - (ix * 1000 * 60));
                    Repository.WasSessionData.timeRecordData.unshift(date.getTime());
                }
                date = null;
                ix   = null;
            }
        } else if (Ext.isDefined(Comm.wasIdArr)) {
            timeRecordID = Repository.WasSessionData.timeRecordWasId;

            if (timeRecordID <= 0) {
                timeRecordID = Repository.trendChartData.timeRecordWasId;
                Repository.WasSessionData.timeRecordWasId = timeRecordID;
            }

            if (!Repository.WasSessionDataLog[timeRecordID]) {
                Repository.WasSessionDataLog[timeRecordID] = {};
            }
            trendDataLog = Repository.WasSessionDataLog[timeRecordID];

            if (!trendDataLog.TIME) {
                trendDataLog.TIME = [];

                for (ix = 0, ixLen = dataCount; ix < ixLen; ix++) {
                    trendDataLog.TIME.push(0);
                }
            }

            // 실시간 데이터가 들어오는지 체크, 데이터가 들어오지 않는 경우 기준이 되는 WAS를 변경.
            wasLastTime = trendDataLog.TIME[59];

            // 기준이 되는 WAS의 마지막 시간과 들어온 시간차이를 비교 설정된 시간보다 큰 경우 재설정하며
            // 2분 차이가 나면 변경한다.
            if (statData[0] > (wasLastTime + (120 * 1000)) &&
                (isWasCheckRun == null || isWasCheckRun === false) ) {
                isWasCheckRun = true;

                for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                    if (Repository.WasSessionDataLog[Comm.wasIdArr[ix]] != null && Repository.WasSessionDataLog[Comm.wasIdArr[ix]].TIME) {
                        wasLastTime = Repository.WasSessionDataLog[Comm.wasIdArr[ix]].TIME[29];

                        if (statData[0] < (wasLastTime + 12000)) {
                            Repository.WasSessionData.timeRecordWasId = Comm.wasIdArr[ix];
                            break;
                        }
                    }
                }
                isWasCheckRun = false;
            }
        }

        // 기준이 되는 WAS에 해당하는 경우 타임 레코드 정보를 갱신한다.
        if (Repository.WasSessionData.timeRecordWasId == wasid) {
            Repository.WasSessionData.timeRecordData.shift();
            Repository.WasSessionData.timeRecordData.push(statData[0]);
        }

        // WAS Stat Data Log
        if (!Repository.WasSessionDataLog[wasid]) {
            Repository.WasSessionDataLog[wasid] = {};
        }

        trendDataLog = Repository.WasSessionDataLog[wasid];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }
        trendDataLog.TIME.shift();
        trendDataLog.TIME.push(statData[0]);

        if (!trendDataLog.SESSION_COUNT) {
            trendDataLog.SESSION_COUNT = [];

            for (ix = 0, ixLen = dataCount; ix < ixLen; ix++) {
                trendDataLog.SESSION_COUNT.push(null);
            }
        }
        trendDataLog.SESSION_COUNT.shift();
        trendDataLog.SESSION_COUNT.push(Repository.WasSessionData[wasid].SESSION_COUNT);
    }

    wasid    = null;
    data     = null;
    statData = null;
    trendDataLog = null;
};


IMXWSWorker.prototype.catchAutoIdStatus = function(adata) {

    /*
     * [0]: count
     * [1]: platform_type (1: openshift, 2: AWS)
     * [2]: server_type (1: WAS)
     * [3]: server_id
     * [4]: status
     * [5]: uniq_count
     */

    console.debug(' [Auto Scale] Receive Auto Scale WAS ID.');

    var ix, ixLen;
    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
        console.debug('%c [Auto Scale] WAS Info.', 'color:#800000;background-color:gold;font-weight:bold;',
            ' Type: ', adata.rows[ix][1],
            ' WAS ID: ', adata.rows[ix][3],
            ' Status: ', adata.rows[ix][4]
        );
    }

    if (adata.rows && adata.rows.length > 0 &&
        common.ServerScale && common.ServerScale.autoScale) {

        console.debug(' [Auto Scale] Execute WAS ID Auto Scale');

        common.ServerScale.autoScale();
    }

};

IMXWSWorker.prototype.convertWasMonitorData = function(adata) {
    var wasId, currentUsers, executeCount, visitor,
        ix, ixLen;

    /*
     * [0]: Was_ID
     * [1]: Time
     * [2]: Concurrent_Users
     * [3]: Execute_Count
     * [4]: Visitor
     */
    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
        wasId = adata.rows[ix][0];

        if (wasId == null) {
            continue;
        }

        currentUsers = adata.rows[ix][2];
        executeCount = adata.rows[ix][3];
        visitor = adata.rows[ix][4];

        Repository.WasMonitorDaily[wasId] = {
            current_users: currentUsers,
            execute_count: executeCount,
            visitor      : visitor
        };
    }
    wasId   = null;
    currentUsers = null;
    executeCount = null;
    visitor = null;
};

IMXWSWorker.prototype.convertProcessMonitor = function(adata) {
    var hostName, ix, ixLen;

    /*
     * 0: "Time"
     * 1: "Host_id"
     * 2: "Host_Name"
     * 3: "PID"
     * 4: "User_Name"
     * 5: "CPU"
     * 6: "VSZ"
     * 7: "RSS"
     * 8: "ARGs"
     */
    Repository.processMonitor = {};

    if (Repository.processMonitor.updateTime === undefined) {
        Repository.processMonitor.updateTime = {};
    }

    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
        hostName = adata.rows[ix][2];

        if (!Repository.processMonitor[hostName]) {
            Repository.processMonitor[hostName] = [];
        }

        Repository.processMonitor[hostName].push(adata.rows[ix].concat());
        Repository.processMonitor.updateTime[hostName] = new Date();
    }
    adata = null;
};

IMXWSWorker.prototype.convertProcessStatus = function(adata) {
    var hostName, ix, ixLen;

    /*
     * 0: "Time"
     * 1: "Host_id"
     * 2: "Host_Name"
     * 3: "PID"
     * 4: "User_Name"
     * 5: "CPU"
     * 6: "VSZ"
     * 7: "RSS"
     * 8: "ARGs"
     */
    if (Repository.processStatus.updateTime === undefined) {
        Repository.processStatus.updateTime = {};
    }

    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
        hostName = adata.rows[ix][2];
        Repository.processStatus[hostName] = adata.rows.concat();
        Repository.processStatus.updateTime[hostName] = new Date();
    }
    adata = null;
};

IMXWSWorker.prototype.convertActiveTxnRemoteData = function(adata) {
    var ix, ixLen;
    var guidDest, guid, dest, splitIdx;

    if (adata && adata.rows && adata.rows.length > 0) {

        Repository.ActiveTxn = adata.rows.concat();
        Repository.ActiveTxnRemote = [];

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            if (+adata.rows[ix][43] === 0 && +adata.rows[ix][44] === 0 &&
                +adata.rows[ix][45] === 0 && +adata.rows[ix][46] === 0 &&
                +adata.rows[ix][47] === 0 && +adata.rows[ix][48] === 0) {
                continue;
            }

            guidDest = adata.rows[ix][56];

            // dest 데이터에 '^'문자가 들어오는 경우 해당 문자앞에 데이터는 사용되지 않는 데이터이므로 버림.
            if (guidDest.indexOf('^') !== -1) {
                guidDest = guidDest.substring(guidDest.indexOf('^') + 1);
            }

            splitIdx = guidDest.indexOf('|');

            if (splitIdx !== -1) {
                guid = guidDest.substring(0, splitIdx);
                guid = guid.toLowerCase();
                dest = guidDest.substring(splitIdx + 1);
            } else {
                guid = '';
                dest = guidDest;
            }

            Repository.ActiveTxnRemote[Repository.ActiveTxnRemote.length] = [
                adata.rows[ix][1],         // Was_ID
                adata.rows[ix][2],         // Was_Name
                adata.rows[ix][3],         // TID
                adata.rows[ix][5],         // TXN_Name
                adata.rows[ix][9] / 1000,  // Elapsed_Time
                adata.rows[ix][15],        // Instance_Name
                adata.rows[ix][17],        // State
                adata.rows[ix][18],        // SQL_ID1
                adata.rows[ix][28],        // SQL_Exec_Count
                adata.rows[ix][42],        // Remote_Type
                adata.rows[ix][55],        // Bind_List
                dest,                      // Dest
                guid                       // guid
            ];
        }
    }
};


/**
 * st -v(si)
 * 큐잉 건수, 처리건수, 초당 처리량
 *
 * [0] time
 * [1] server_id
 * [2] clhno
 * [3] svrname
 * [4] status
 * [5] svri
 * [6] qcount
 * [7] qpcount
 * [8] emcount
 * [9] count
 *
 * @param {} adata
 */
IMXWSWorker.prototype.convertTPSvrStat = function(adata, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var serverId;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    var isDown;
    var tempData = {};

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++ ) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (!Repository.tmadminChartData[serverId]) {
            Repository.tmadminChartData[serverId] = {};
        }

        if (!tempData[serverId]) {
            tempData[serverId] = {
                TIME       : 0,
                QCOUNT     : 0,
                COUNT      : 0,
                TP_TPS     : 0,
                DataCount  : 0
            };
        }

        tempData[serverId].TIME         =  statData[0];
        tempData[serverId].QCOUNT       += statData[6];
        tempData[serverId].COUNT        += statData[9];
        tempData[serverId].TP_TPS       += statData[9];
        tempData[serverId].DataCount    += 1;

    }

    var serverIdList = Object.keys(tempData);

    for (kx = 0; kx < serverIdList.length; kx++) {
        serverId = serverIdList[kx];

        trendData = Repository.tmadminChartData[serverId];

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        trendData.TIME        = tempData[serverId].TIME;
        trendData.QCOUNT      = null;
        trendData.COUNT       = null;
        trendData.TP_TPS      = null;

        trendData.OS_CPU_SYS      = null;
        trendData.OS_CPU_USER     = null;
        trendData.OS_CPU_IO       = null;
        trendData.OS_FREE_MEM     = null;
        trendData.OS_TOTAL_MEM    = null;
        trendData.OS_SEND_PACKETS = null;
        trendData.OS_RCV_PACKETS  = null;

        if (!isDown) {
            trendData.QCOUNT      = tempData[serverId].QCOUNT;
            trendData.COUNT       = tempData[serverId].COUNT;
            trendData.TP_TPS      = tempData[serverId].COUNT / 10;
        }

        // TP Stat Data Log
        if (!Repository.tmadminDataLog[serverId]) {
            Repository.tmadminDataLog[serverId] = {};
        }

        trendDataLog = Repository.tmadminDataLog[serverId];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = tpStat.dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }

        //trendDataLog.TIME.shift();
        //trendDataLog.TIME.push(trendData.TIME);

        if (!trendDataLog.QCOUNT) {
            trendDataLog.QCOUNT = [];
            trendDataLog.COUNT  = [];
            trendDataLog.TP_TPS = [];

            for (jx = 0, jxLen = tpStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.QCOUNT.push(null);
                trendDataLog.COUNT.push(null);
                trendDataLog.TP_TPS.push(null);
            }
        }

        // OS 관련 지표가 설정되어 있는지 체크
        if (!trendDataLog.OS_CPU_SYS) {
            trendDataLog.OS_CPU_SYS      = [];
            trendDataLog.OS_CPU_USER     = [];
            trendDataLog.OS_CPU_IO       = [];
            trendDataLog.OS_FREE_MEM     = [];
            trendDataLog.OS_TOTAL_MEM    = [];
            trendDataLog.OS_SEND_PACKETS = [];
            trendDataLog.OS_RCV_PACKETS  = [];

            for (jx = 0, jxLen = tpStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.OS_CPU_SYS.push(null);
                trendDataLog.OS_CPU_USER.push(null);
                trendDataLog.OS_CPU_IO.push(null);
                trendDataLog.OS_FREE_MEM.push(null);
                trendDataLog.OS_TOTAL_MEM.push(null);
                trendDataLog.OS_SEND_PACKETS.push(null);
                trendDataLog.OS_RCV_PACKETS.push(null);
            }
        }

        trendDataLog.QCOUNT.shift();
        trendDataLog.QCOUNT.push(Repository.tmadminChartData[serverId].QCOUNT);

        trendDataLog.COUNT.shift();
        trendDataLog.COUNT.push(Repository.tmadminChartData[serverId].COUNT);

        trendDataLog.TP_TPS.shift();
        trendDataLog.TP_TPS.push(Repository.tmadminChartData[serverId].TP_TPS);
    }
};


/**
 * st -p -x
 * 프로세스 수 구하기
 *
 * 값을 1000으로 나눠서 처리해야되는 항목
 * usravg /usrmin /usrmax /sysavg /sysmin /sysmax /mintime /maxtime
 *
 * [0] time
 * [1] server_id
 * [2] total_count
 * [3] total_avg
 * [4] total_running_count
 * [5] Array
 *    [0 ] : clhno_no
 *    [1 ] : pid
 *    [2 ] : svrname
 *    [3 ] : svgname
 *    [4 ] : status
 *    [5 ] : gid1
 *    [6 ] : gid2
 *    [7 ] : gid_seqno
 *    [8 ] : count
 *    [9 ] : average
 *    [10] : service
 *    [11] : fail_cnt
 *    [12] : err_cnt
 *    [13] : usravg
 *    [14] : usrmin
 *    [15] : usrmax
 *    [16] : sysavg
 *    [17] : sysmin
 *    [18] : sysmax
 *    [19] : mintime
 *    [20] : maxtime
 * @param {} adata
 */
IMXWSWorker.prototype.convertTPSvrProcStat = function(adata, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var serverId, processCnt;
    var clhnoNo, pid, pidList;
    var isDown;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++ ) {
        statData = adata.rows[kx];
        serverId = statData[1];
        pidList  = [];

        if (!Repository.tmadminChartData[serverId]) {
            Repository.tmadminChartData[serverId] = {};
        }
        trendData = Repository.tmadminChartData[serverId];

        // 플랫폼JS에서 프로세스 수를 계산하여 보내주는 경우 해당 값으로 설정한다.
        if (statData.length > 6) {
            processCnt = +statData[6];

        } else {
            /*
             * 프로세스 수 구하기
             * TP 프로세스 COUNT 기준
             * st -p -x 결과 clh 0 에 해당하는 레코드를 PID 기준으로 DISTINCT 한 개수.
             * 같은 서버에서 동일한 PID에 대해서는 카운트 체크를 하지 않는다.
             */
            for (ix = 0, ixLen = statData[5].length; ix < ixLen; ix++) {
                clhnoNo = statData[5][ix][0];
                pid     = statData[5][ix][1];

                if (clhnoNo == 0 && pidList.indexOf(pid) === -1) {
                    pidList.push(pid);
                }
            }
            processCnt = pidList.length;
        }

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        trendData.TIME         = statData[0];
        trendData.TOTAL_COUNT  = isDown ? null : processCnt;

        // TP Stat Data Log
        if (!Repository.tmadminDataLog[serverId]) {
            Repository.tmadminDataLog[serverId] = {};
        }

        trendDataLog = Repository.tmadminDataLog[serverId];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = tpStat.dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }

        if (!trendDataLog.TOTAL_COUNT) {
            trendDataLog.TOTAL_COUNT = [];

            for (jx = 0, jxLen = tpStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.TOTAL_COUNT.push(null);
            }
        }
        trendDataLog.TOTAL_COUNT.shift();
        trendDataLog.TOTAL_COUNT.push(Repository.tmadminChartData[serverId].TOTAL_COUNT);
    }
};

/**
 * st -s -x
 * 응답시간, 큐잉시간, aq개수, 실패건수, 에러건수 구하기
 *
 * 값을 1000으로 나눠서 처리해야되는 항목
 * usravg /usrmin /usrmax /sysavg /sysmin /sysmax /mintime /maxtime
 *
 * [0]  time
 * [1]  server_id
 * [2]  clhno
 * [3]  no
 * [4]  count
 * [5]  cq_count
 * [6]  aq_count
 * [7]  average
 * [8]  q_average
 * [9]  name
 * [10] status
 * [11] usravg
 * [12] usrmin
 * [13] usrmax
 * [14] sysavg
 * [15] sysmin
 * [16] sysmax
 * [17] fail_count
 * [18] error_count
 * [19] mintime
 * [20] maxtime
 *
 * @param {} adata
 */
IMXWSWorker.prototype.convertTPSvcStat = function(adata, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var serverId;
    var isDown;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    var tempData = {};

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++ ) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (!Repository.tmadminChartData[serverId]) {
            Repository.tmadminChartData[serverId] = {};
        }

        if (!tempData[serverId]) {
            tempData[serverId] = {
                TIME         : 0,
                AQ_COUNT     : 0,
                AVERAGE      : 0,
                Q_AVERAGE    : 0,
                FAIL_COUNT   : 0,
                ERROR_COUNT  : 0,
                DataCount    : 0
            };
        }

        tempData[serverId].TIME            =  statData[0];
        tempData[serverId].AQ_COUNT        += statData[6];
        tempData[serverId].AVERAGE         += statData[7];
        tempData[serverId].Q_AVERAGE       += statData[8];
        tempData[serverId].FAIL_COUNT      += statData[17];
        tempData[serverId].ERROR_COUNT     += statData[18];
        tempData[serverId].DataCount       += 1;

    }

    var serverIdList = Object.keys(tempData);

    for (ix = 0, ixLen = serverIdList.length; ix < ixLen; ix++) {
        serverId = serverIdList[ix];

        trendData = Repository.tmadminChartData[serverId];

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        trendData.TIME            = tempData[serverId].TIME;

        trendData.AQ_COUNT        = null;
        trendData.AVERAGE         = null;
        trendData.Q_AVERAGE       = null;
        trendData.FAIL_COUNT      = null;
        trendData.ERROR_COUNT     = null;

        if (!isDown) {
            trendData.AQ_COUNT        = tempData[serverId].AQ_COUNT;
            trendData.AVERAGE         = parseFloat(tempData[serverId].AVERAGE / tempData[serverId].DataCount);
            trendData.Q_AVERAGE       = parseFloat(tempData[serverId].Q_AVERAGE / tempData[serverId].DataCount);
            trendData.FAIL_COUNT      = tempData[serverId].FAIL_COUNT;
            trendData.ERROR_COUNT     = tempData[serverId].ERROR_COUNT;
        }


        // TP Stat Data Log
        if (!Repository.tmadminDataLog[serverId]) {
            Repository.tmadminDataLog[serverId] = {};
        }

        trendDataLog = Repository.tmadminDataLog[serverId];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (kx = 0, kxLen = tpStat.dataCount; kx < kxLen; kx++) {
                trendDataLog.TIME.push(0);
            }
        }

        if (!trendDataLog.AQ_COUNT) {
            trendDataLog.AQ_COUNT    = [];
            trendDataLog.AVERAGE     = [];
            trendDataLog.Q_AVERAGE   = [];
            trendDataLog.FAIL_COUNT  = [];
            trendDataLog.ERROR_COUNT = [];

            for (jx = 0, jxLen = tpStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.AQ_COUNT.push(0);
                trendDataLog.AVERAGE.push(0);
                trendDataLog.Q_AVERAGE.push(0);
                trendDataLog.FAIL_COUNT.push(0);
                trendDataLog.ERROR_COUNT.push(0);
            }
        }

        trendDataLog.AQ_COUNT.shift();
        trendDataLog.AQ_COUNT.push(trendData.AQ_COUNT);

        trendDataLog.AVERAGE.shift();
        trendDataLog.AVERAGE.push(trendData.AVERAGE);

        trendDataLog.Q_AVERAGE.shift();
        trendDataLog.Q_AVERAGE.push(trendData.Q_AVERAGE);

        trendDataLog.FAIL_COUNT.shift();
        trendDataLog.FAIL_COUNT.push(trendData.FAIL_COUNT);

        trendDataLog.ERROR_COUNT.shift();
        trendDataLog.ERROR_COUNT.push(trendData.ERROR_COUNT);

    }

};

/**
 * ci
 * 클라이언트 수 구하기
 *
 * @param {object} adata
 * [0] time
 * [1] server_id
 * [2] total_connected_clients
 * [3] array
 *    [0] cli_id
 *    [1] clid
 *    [2] status
 *    [3] count
 *    [4] idle
 *    [5] ipaddr
 *    [6] usrname
 * [4] array_length -> PJS에서 추가한 항목으로 PJS에서 array 길이를 구하여 보내줌.
 */
IMXWSWorker.prototype.convertTPClientInfo = function(adata, isDataType) {
    var kx, kxLen;
    var statData;
    var time, serverId, clients;
    var isDown;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++ ) {
        statData = adata.rows[kx];
        serverId = statData[1];

        // 서버 다운 상태를 체크
        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        time = statData[0];

        // 플랫폼JS에서 arry의 길이를 계산해서 보내주는 것으로 사용을 하였으나
        // 다른 데이터라고 하여 다시 total_connected_clients 값으로 보여주게 변경함.
        clients  = isDown ? null : +statData[2];

        // TP 실시간 지표 데이터 설정
        this.iniTPTrendData(serverId, 'TIME',              time);
        this.iniTPTrendData(serverId, 'CONNECTED_CLIENTS', clients);
    }
};

/**
 * @param {object} adata
 * [0]  'time'
 * [1]  'server_id'
 * [2]  'bbs_cur_servers'
 * [3]  'bbs_cur_services'
 * [4]  'bbs_cur_req_queue'
 * [5]  'bbs_cur_groups'
 * [6]  'num_dequeue'
 * [7]  'num_enqueue'
 * [8]  'num_post'
 * [9]  'num_req'
 * [10] 'num_tran'
 * [11] 'num_tranabt'
 * [12] 'num_trancmt'
 * [13] 'wkcompleted'
 */
IMXWSWorker.prototype.convertTuxStat = function(adata, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var serverId;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    var isDown;
    var tempData = {};

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (!Repository.TuxTrendData[serverId]) {
            Repository.TuxTrendData[serverId] = {};
        }

        if (!tempData[serverId]) {
            tempData[serverId] = {
                TIME              : 0,
                CUR_SERVERS       : 0,
                CUR_SERVICES      : 0,
                CUR_REQ_QUEUE     : 0,
                CUR_GROUPS        : 0,
                DEQUEUE           : 0,
                ENQUEUE           : 0,
                POST              : 0,
                REQ               : 0,
                NUM_TRAN          : 0,
                NUM_TRANABT       : 0,
                NUM_TRANCMT       : 0,
                WKCOMPLETED       : 0,
                DataCount         : 0
            };
        }

        tempData[serverId].TIME          =  statData[0];
        tempData[serverId].CUR_SERVERS   += statData[2];
        tempData[serverId].CUR_SERVICES  += statData[3];
        tempData[serverId].CUR_REQ_QUEUE += statData[4];
        tempData[serverId].CUR_GROUPS    += statData[5];
        tempData[serverId].DEQUEUE       += statData[6];
        tempData[serverId].ENQUEUE       += statData[7];
        tempData[serverId].POST          += statData[8];
        tempData[serverId].REQ           += statData[9];
        tempData[serverId].NUM_TRAN      += statData[10];
        tempData[serverId].NUM_TRANABT   += statData[11];
        tempData[serverId].NUM_TRANCMT   += statData[12];
        tempData[serverId].WKCOMPLETED   += Math.ceil(parseInt(statData[13]) / 10);
        tempData[serverId].DataCount     += 1;
    }

    var serverIdList = Object.keys(tempData);

    for (kx = 0; kx < serverIdList.length; kx++) {
        serverId = serverIdList[kx];

        trendData = Repository.TuxTrendData[serverId];

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        trendData.TIME = tempData[serverId].TIME;
        trendData.CUR_SERVERS   = null;
        trendData.CUR_SERVICES  = null;
        trendData.CUR_REQ_QUEUE = null;
        trendData.CUR_GROUPS    = null;
        trendData.DEQUEUE       = null;
        trendData.ENQUEUE       = null;
        trendData.POST          = null;
        trendData.REQ           = null;
        trendData.NUM_TRAN      = null;
        trendData.NUM_TRANABT   = null;
        trendData.NUM_TRANCMT   = null;
        trendData.WKCOMPLETED   = null;

        trendData.OS_CPU_SYS    = null;
        trendData.OS_CPU_USER   = null;
        trendData.OS_CPU_IO     = null;
        trendData.OS_FREE_MEM   = null;
        trendData.OS_TOTAL_MEM  = null;
        trendData.OS_SEND_PACKETS = null;
        trendData.OS_RCV_PACKETS  = null;

        if (!isDown) {
            trendData.CUR_SERVERS  = tempData[serverId].CUR_SERVERS;
            trendData.CUR_SERVICES = tempData[serverId].CUR_SERVICES;
            trendData.CUR_REQ_QUEUE = tempData[serverId].CUR_REQ_QUEUE;
            trendData.CUR_GROUPS  = tempData[serverId].CUR_GROUPS;
            trendData.DEQUEUE     = tempData[serverId].DEQUEUE;
            trendData.ENQUEUE     = tempData[serverId].ENQUEUE;
            trendData.POST        = tempData[serverId].POST;
            trendData.REQ         = tempData[serverId].REQ;
            trendData.NUM_TRAN    = tempData[serverId].NUM_TRAN;
            trendData.NUM_TRANABT = tempData[serverId].NUM_TRANABT;
            trendData.NUM_TRANCMT = tempData[serverId].NUM_TRANCMT;
            trendData.WKCOMPLETED = tempData[serverId].WKCOMPLETED;
        }

        // Tux Stat Data Log
        if (!Repository.TuxTrendDataLog[serverId]) {
            Repository.TuxTrendDataLog[serverId] = {};
        }

        trendDataLog = Repository.TuxTrendDataLog[serverId];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = tuxStat.dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }

        if (!trendDataLog.CUR_SERVERS) {
            trendDataLog.CUR_SERVERS   = [];
            trendDataLog.CUR_SERVICES  = [];
            trendDataLog.CUR_REQ_QUEUE = [];
            trendDataLog.CUR_GROUPS    = [];
            trendDataLog.DEQUEUE       = [];
            trendDataLog.ENQUEUE       = [];
            trendDataLog.POST          = [];
            trendDataLog.REQ           = [];
            trendDataLog.NUM_TRAN      = [];
            trendDataLog.NUM_TRANABT   = [];
            trendDataLog.NUM_TRANCMT   = [];
            trendDataLog.WKCOMPLETED   = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.CUR_SERVERS.push(null);
                trendDataLog.CUR_SERVICES.push(null);
                trendDataLog.CUR_REQ_QUEUE.push(null);
                trendDataLog.CUR_GROUPS.push(null);
                trendDataLog.DEQUEUE.push(null);
                trendDataLog.ENQUEUE.push(null);
                trendDataLog.POST.push(null);
                trendDataLog.REQ.push(null);
                trendDataLog.NUM_TRAN.push(null);
                trendDataLog.NUM_TRANABT.push(null);
                trendDataLog.NUM_TRANCMT.push(null);
                trendDataLog.WKCOMPLETED.push(null);
            }
        }

        // OS 관련 지표가 설정되어 있는지 체크
        if (!trendDataLog.OS_CPU_SYS) {
            trendDataLog.OS_CPU_SYS = [];
            trendDataLog.OS_CPU_USER = [];
            trendDataLog.OS_CPU_IO = [];
            trendDataLog.OS_FREE_MEM = [];
            trendDataLog.OS_TOTAL_MEM = [];
            trendDataLog.OS_SEND_PACKETS = [];
            trendDataLog.OS_RCV_PACKETS = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.OS_CPU_SYS.push(null);
                trendDataLog.OS_CPU_USER.push(null);
                trendDataLog.OS_CPU_IO.push(null);
                trendDataLog.OS_FREE_MEM.push(null);
                trendDataLog.OS_TOTAL_MEM.push(null);
                trendDataLog.OS_SEND_PACKETS.push(null);
                trendDataLog.OS_RCV_PACKETS.push(null);
            }
        }

        trendDataLog.CUR_SERVERS.shift();
        trendDataLog.CUR_SERVERS.push(Repository.TuxTrendData[serverId].CUR_SERVERS);

        trendDataLog.CUR_SERVICES.shift();
        trendDataLog.CUR_SERVICES.push(Repository.TuxTrendData[serverId].CUR_SERVICES);

        trendDataLog.CUR_REQ_QUEUE.shift();
        trendDataLog.CUR_REQ_QUEUE.push(Repository.TuxTrendData[serverId].CUR_REQ_QUEUE);

        trendDataLog.CUR_GROUPS.shift();
        trendDataLog.CUR_GROUPS.push(Repository.TuxTrendData[serverId].CUR_GROUPS);

        trendDataLog.DEQUEUE.shift();
        trendDataLog.DEQUEUE.push(Repository.TuxTrendData[serverId].DEQUEUE);

        trendDataLog.ENQUEUE.shift();
        trendDataLog.ENQUEUE.push(Repository.TuxTrendData[serverId].ENQUEUE);

        trendDataLog.POST.shift();
        trendDataLog.POST.push(Repository.TuxTrendData[serverId].POST);

        trendDataLog.REQ.shift();
        trendDataLog.REQ.push(Repository.TuxTrendData[serverId].REQ);

        trendDataLog.NUM_TRAN.shift();
        trendDataLog.NUM_TRAN.push(Repository.TuxTrendData[serverId].NUM_TRAN);

        trendDataLog.NUM_TRANABT.shift();
        trendDataLog.NUM_TRANABT.push(Repository.TuxTrendData[serverId].NUM_TRANABT);

        trendDataLog.NUM_TRANCMT.shift();
        trendDataLog.NUM_TRANCMT.push(Repository.TuxTrendData[serverId].NUM_TRANCMT);

        trendDataLog.WKCOMPLETED.shift();
        trendDataLog.WKCOMPLETED.push(Repository.TuxTrendData[serverId].WKCOMPLETED);
    }
};

/**
 * @param {object} adata
 * [0]  'time'
 * [1]  'server_id'
 * [2]  'name'
 * [3]  'qname'
 * [4]  'grpname'
 * [5]  'svrid'
 * [6]  'reqc'
 * [7]  'reqd'
 * [8]  'currservice'
 */
IMXWSWorker.prototype.convertTuxServer = function(adata, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var serverId;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    var isDown;
    var tempData = {};

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (!Repository.TuxTrendData[serverId]) {
            Repository.TuxTrendData[serverId] = {};
        }

        if (!tempData[serverId]) {
            tempData[serverId] = {
                TIME : 0,
                REQC : 0,
                REQD : 0
            };
        }

        tempData[serverId].TIME      = statData [0];
        tempData[serverId].REQC      += statData[6];
        tempData[serverId].REQD      += statData[7];
        tempData[serverId].DataCount += 1;
    }

    var serverIdList = Object.keys(tempData);

    for (kx = 0; kx < serverIdList.length; kx++) {
        serverId = serverIdList[kx];

        trendData = Repository.TuxTrendData[serverId];

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        trendData.TIME = tempData[serverId].TIME;
        trendData.REQC = null;
        trendData.REQD = null;

        trendData.OS_CPU_SYS = null;
        trendData.OS_CPU_USER = null;
        trendData.OS_CPU_IO = null;
        trendData.OS_FREE_MEM = null;
        trendData.OS_TOTAL_MEM = null;
        trendData.OS_SEND_PACKETS = null;
        trendData.OS_RCV_PACKETS = null;

        if (!isDown) {
            trendData.REQC = tempData[serverId].REQC;
            trendData.REQD = tempData[serverId].REQD;
        }

        // Tuxedo Stat Data Log
        if (!Repository.TuxTrendDataLog[serverId]) {
            Repository.TuxTrendDataLog[serverId] = {};
        }

        trendDataLog = Repository.TuxTrendDataLog[serverId];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = tuxStat.dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }

        if (!trendDataLog.REQC) {
            trendDataLog.REQC = [];
            trendDataLog.REQD = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.REQC.push(null);
                trendDataLog.REQD.push(null);
            }
        }

        // OS 관련 지표가 설정되어 있는지 체크
        if (!trendDataLog.OS_CPU_SYS) {
            trendDataLog.OS_CPU_SYS = [];
            trendDataLog.OS_CPU_USER = [];
            trendDataLog.OS_CPU_IO = [];
            trendDataLog.OS_FREE_MEM = [];
            trendDataLog.OS_TOTAL_MEM = [];
            trendDataLog.OS_SEND_PACKETS = [];
            trendDataLog.OS_RCV_PACKETS = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.OS_CPU_SYS.push(null);
                trendDataLog.OS_CPU_USER.push(null);
                trendDataLog.OS_CPU_IO.push(null);
                trendDataLog.OS_FREE_MEM.push(null);
                trendDataLog.OS_TOTAL_MEM.push(null);
                trendDataLog.OS_SEND_PACKETS.push(null);
                trendDataLog.OS_RCV_PACKETS.push(null);
            }
        }

        trendDataLog.REQC.shift();
        trendDataLog.REQC.push(Repository.TuxTrendData[serverId].REQC);

        trendDataLog.REQD.shift();
        trendDataLog.REQD.push(Repository.TuxTrendData[serverId].REQD);
    }
};

/**
 * [0]  'time'
 * [1]  'server_id'
 * [2]  'svcname'
 * [3]  'srvgrp'
 * [4]  'progname'
 * [5]  'status'
 * [6]  'lmid'
 * [7]  'srvid'
 * [8]  'svcrnam'
 * [9]  'ncompleted'
 */
IMXWSWorker.prototype.convertTuxService = function(adata, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var serverId;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    var isDown;
    var tempData = {};

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (!Repository.TuxTrendData[serverId]) {
            Repository.TuxTrendData[serverId] = {};
        }

        if (!tempData[serverId]) {
            tempData[serverId] = {
                TIME       : 0,
                NCOMPLETED : 0
            };
        }

        tempData[serverId].TIME        = statData[0];
        tempData[serverId].NCOMPLETED += statData[9];
        tempData[serverId].DataCount  += 1;
    }

    var serverIdList = Object.keys(tempData);

    for (kx = 0; kx < serverIdList.length; kx++) {
        serverId = serverIdList[kx];

        trendData = Repository.TuxTrendData[serverId];

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        trendData.TIME       = tempData[serverId].TIME;
        trendData.NCOMPLETED = null;

        trendData.OS_CPU_SYS = null;
        trendData.OS_CPU_USER = null;
        trendData.OS_CPU_IO = null;
        trendData.OS_FREE_MEM = null;
        trendData.OS_TOTAL_MEM = null;
        trendData.OS_SEND_PACKETS = null;
        trendData.OS_RCV_PACKETS = null;

        if (!isDown) {
            trendData.NCOMPLETED = tempData[serverId].NCOMPLETED;
        }

        // Tuxedo Stat Data Log
        if (!Repository.TuxTrendDataLog[serverId]) {
            Repository.TuxTrendDataLog[serverId] = {};
        }

        trendDataLog = Repository.TuxTrendDataLog[serverId];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = tuxStat.dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }

        if (!trendDataLog.NCOMPLETED) {
            trendDataLog.NCOMPLETED = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.NCOMPLETED.push(null);
            }
        }

        // OS 관련 지표가 설정되어 있는지 체크
        if (!trendDataLog.OS_CPU_SYS) {
            trendDataLog.OS_CPU_SYS = [];
            trendDataLog.OS_CPU_USER = [];
            trendDataLog.OS_CPU_IO = [];
            trendDataLog.OS_FREE_MEM = [];
            trendDataLog.OS_TOTAL_MEM = [];
            trendDataLog.OS_SEND_PACKETS = [];
            trendDataLog.OS_RCV_PACKETS = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.OS_CPU_SYS.push(null);
                trendDataLog.OS_CPU_USER.push(null);
                trendDataLog.OS_CPU_IO.push(null);
                trendDataLog.OS_FREE_MEM.push(null);
                trendDataLog.OS_TOTAL_MEM.push(null);
                trendDataLog.OS_SEND_PACKETS.push(null);
                trendDataLog.OS_RCV_PACKETS.push(null);
            }
        }

        trendDataLog.NCOMPLETED.shift();
        trendDataLog.NCOMPLETED.push(Repository.TuxTrendData[serverId].NCOMPLETED);
    }
};

/**
 * [0]  'time'
 * [1]  'server_id'
 * [2]  'servername'
 * [3]  'rqaddr'
 * [4]  'servercnt'
 * [5]  'ntotwkqueued'
 * [6]  'equeued'
 * [7]  'lmid'
 * [8]  'wkqueued'
 */
IMXWSWorker.prototype.convertTuxQueue = function(adata, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var serverId;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    var isDown;
    var tempData = {};

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (!Repository.TuxTrendData[serverId]) {
            Repository.TuxTrendData[serverId] = {};
        }

        if (!tempData[serverId]) {
            tempData[serverId] = {
                TIME         : statData[0],
                SERVER_CNT   : statData[4],
                NTOTWKQUEUED : statData[5],
                NQUEUED      : statData[6],
                WKQUEUED     : statData[8]
            };
        }

        tempData[serverId].TIME          = statData[0];
        tempData[serverId].SERVER_CNT   += statData[4];
        tempData[serverId].NTOTWKQUEUED += statData[5];
        tempData[serverId].NQUEUED      += statData[6];
        tempData[serverId].WKQUEUED     += statData[8];
        tempData[serverId].DataCount    += 1;
    }

    var serverIdList = Object.keys(tempData);

    for (kx = 0; kx < serverIdList.length; kx++) {
        serverId = serverIdList[kx];

        trendData = Repository.TuxTrendData[serverId];

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        trendData.TIME = tempData[serverId].TIME;
        trendData.SERVER_CNT   = null;
        trendData.NTOTWKQUEUED = null;
        trendData.NQUEUED      = null;
        trendData.WKQUEUED     = null;

        trendData.OS_CPU_SYS = null;
        trendData.OS_CPU_USER = null;
        trendData.OS_CPU_IO = null;
        trendData.OS_FREE_MEM = null;
        trendData.OS_TOTAL_MEM = null;
        trendData.OS_SEND_PACKETS = null;
        trendData.OS_RCV_PACKETS = null;

        if (!isDown) {
            trendData.SERVER_CNT   = tempData[serverId].SERVER_CNT;
            trendData.NTOTWKQUEUED = tempData[serverId].NTOTWKQUEUED;
            trendData.NQUEUED      = tempData[serverId].NQUEUED;
            trendData.WKQUEUED     = tempData[serverId].WKQUEUED;
        }

        // Tuxedo Stat Data Log
        if (!Repository.TuxTrendDataLog[serverId]) {
            Repository.TuxTrendDataLog[serverId] = {};
        }

        trendDataLog = Repository.TuxTrendDataLog[serverId];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = tuxStat.dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }

        if (!trendDataLog.SERVER_CNT) {
            trendDataLog.SERVER_CNT   = [];
            trendDataLog.NTOTWKQUEUED = [];
            trendDataLog.NQUEUED      = [];
            trendDataLog.WKQUEUED     = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.SERVER_CNT  .push(null);
                trendDataLog.NTOTWKQUEUED.push(null);
                trendDataLog.NQUEUED     .push(null);
                trendDataLog.WKQUEUED    .push(null);
            }
        }

        // OS 관련 지표가 설정되어 있는지 체크
        if (!trendDataLog.OS_CPU_SYS) {
            trendDataLog.OS_CPU_SYS = [];
            trendDataLog.OS_CPU_USER = [];
            trendDataLog.OS_CPU_IO = [];
            trendDataLog.OS_FREE_MEM = [];
            trendDataLog.OS_TOTAL_MEM = [];
            trendDataLog.OS_SEND_PACKETS = [];
            trendDataLog.OS_RCV_PACKETS = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.OS_CPU_SYS.push(null);
                trendDataLog.OS_CPU_USER.push(null);
                trendDataLog.OS_CPU_IO.push(null);
                trendDataLog.OS_FREE_MEM.push(null);
                trendDataLog.OS_TOTAL_MEM.push(null);
                trendDataLog.OS_SEND_PACKETS.push(null);
                trendDataLog.OS_RCV_PACKETS.push(null);
            }
        }

        trendDataLog.TIME.shift();
        trendDataLog.TIME.push(Repository.TuxTrendData[serverId].TIME);

        trendDataLog.SERVER_CNT.shift();
        trendDataLog.SERVER_CNT.push(Repository.TuxTrendData[serverId].SERVER_CNT);

        trendDataLog.NTOTWKQUEUED.shift();
        trendDataLog.NTOTWKQUEUED.push(Repository.TuxTrendData[serverId].NTOTWKQUEUED);

        trendDataLog.NQUEUED.shift();
        trendDataLog.NQUEUED.push(Repository.TuxTrendData[serverId].NQUEUED);

        trendDataLog.WKQUEUED.shift();
        trendDataLog.WKQUEUED.push(Repository.TuxTrendData[serverId].WKQUEUED);
    }
};

/**
 * [0]  'time'
 * [1]  'server_id'
 * [2]  'pid'
 * [3]  'lmid'
 * [4]  'username'
 * [5]  'cltname'
 * [6]  'starttime'
 * [7]  'state'
 * [8]  'numtran'
 * [9]  'numtrancmt'
 * [10] 'numtranabt'
 * [11] 'connected_clients'CONNECTED_CLIENTS
 */
IMXWSWorker.prototype.convertTuxClient = function(adata, isDataType) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var serverId;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    var isDown;
    var tempData = {};

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (!Repository.TuxTrendData[serverId]) {
            Repository.TuxTrendData[serverId] = {};
        }

        if (!tempData[serverId]) {
            tempData[serverId] = {
                TIME       : 0,
                NUMTRAN    : 0,
                NUMTRANCMT : 0,
                NUMTRANABT : 0,
                DataCount  : 0
            };
        }

        tempData[serverId].TIME       =  statData[0];
        tempData[serverId].NUMTRAN    += statData[8];
        tempData[serverId].NUMTRANCMT += statData[9];
        tempData[serverId].NUMTRANABT += statData[10];
        tempData[serverId].DataCount  += 1;
    }

    var serverIdList = Object.keys(tempData);

    for (kx = 0; kx < serverIdList.length; kx++) {
        serverId = serverIdList[kx];

        trendData = Repository.TuxTrendData[serverId];

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId) : false;

        trendData.TIME = tempData[serverId].TIME;
        trendData.NUMTRAN           = null;
        trendData.NUMTRANCMT        = null;
        trendData.NUMTRANABT        = null;
        trendData.CONNECTED_CLIENTS = null;

        trendData.OS_CPU_SYS = null;
        trendData.OS_CPU_USER = null;
        trendData.OS_CPU_IO = null;
        trendData.OS_FREE_MEM = null;
        trendData.OS_TOTAL_MEM = null;
        trendData.OS_SEND_PACKETS = null;
        trendData.OS_RCV_PACKETS = null;

        if (!isDown) {
            trendData.NUMTRAN           = tempData[serverId].NUMTRAN;
            trendData.NUMTRANCMT        = tempData[serverId].NUMTRANCMT;
            trendData.NUMTRANABT        = tempData[serverId].NUMTRANABT;
            trendData.CONNECTED_CLIENTS = tempData[serverId].DataCount;
        }

        // Tuxedo Stat Data Log
        if (!Repository.TuxTrendDataLog[serverId]) {
            Repository.TuxTrendDataLog[serverId] = {};
        }

        trendDataLog = Repository.TuxTrendDataLog[serverId];

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (ix = 0, ixLen = tuxStat.dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }
        }

        if (!trendDataLog.NUMTRAN) {
            trendDataLog.NUMTRAN           = [];
            trendDataLog.NUMTRANCMT        = [];
            trendDataLog.NUMTRANABT        = [];
            trendDataLog.CONNECTED_CLIENTS = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.NUMTRAN          .push(null);
                trendDataLog.NUMTRANCMT       .push(null);
                trendDataLog.NUMTRANABT       .push(null);
                trendDataLog.CONNECTED_CLIENTS.push(null);
            }
        }

        // OS 관련 지표가 설정되어 있는지 체크
        if (!trendDataLog.OS_CPU_SYS) {
            trendDataLog.OS_CPU_SYS = [];
            trendDataLog.OS_CPU_USER = [];
            trendDataLog.OS_CPU_IO = [];
            trendDataLog.OS_FREE_MEM = [];
            trendDataLog.OS_TOTAL_MEM = [];
            trendDataLog.OS_SEND_PACKETS = [];
            trendDataLog.OS_RCV_PACKETS = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendDataLog.OS_CPU_SYS.push(null);
                trendDataLog.OS_CPU_USER.push(null);
                trendDataLog.OS_CPU_IO.push(null);
                trendDataLog.OS_FREE_MEM.push(null);
                trendDataLog.OS_TOTAL_MEM.push(null);
                trendDataLog.OS_SEND_PACKETS.push(null);
                trendDataLog.OS_RCV_PACKETS.push(null);
            }
        }

        trendDataLog.TIME.shift();
        trendDataLog.TIME.push(Repository.TuxTrendData[serverId].TIME);

        trendDataLog.NUMTRAN.shift();
        trendDataLog.NUMTRAN.push(Repository.TuxTrendData[serverId].NUMTRAN);

        trendDataLog.NUMTRANCMT.shift();
        trendDataLog.NUMTRANCMT.push(Repository.TuxTrendData[serverId].NUMTRANCMT);

        trendDataLog.NUMTRANABT.shift();
        trendDataLog.NUMTRANABT.push(Repository.TuxTrendData[serverId].NUMTRANABT);

        trendDataLog.CONNECTED_CLIENTS.shift();
        trendDataLog.CONNECTED_CLIENTS.push(Repository.TuxTrendData[serverId].CONNECTED_CLIENTS);
    }
};

/**
 * Web Packet Data - 웹 Activity 패킷 데이터
 *
 * @param {object} adata
 * [0] time
 * [1] server_id
 * [2] path_list
 * [3] server_name
 * [4] host_name
 * [5] active_count1
 * [6] active_count2
 * [7] active_count3
 * [8] active_count4
 * [9] active_count5
 * [10] active_count6
 * [11] active_count7
 * [11] active_count8
 */
IMXWSWorker.prototype.convertWebActivity = function(adata, aheader) {
    var ix, ixLen, jx, jxLen;
    var time, serverId, endCount, endTxnList, txnData, elapsedTime, sumElapse, requestCnt;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    if (aheader.datatype == 1) {
        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++ ) {
            txnData = adata.rows[ix];

            time       = txnData[0];
            requestCnt = txnData[1];
            serverId   = txnData[3];

            this.initWebTrendData(serverId, 'TIME'     , time);
            this.initWebTrendData(serverId, 'COUNT'    , requestCnt);
        }

    } else if (aheader.datatype == 2) {
        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++ ) {
            txnData = adata.rows[ix];

            time      = txnData[0];
            serverId  = txnData[3];
            sumElapse = 0;

            if (Comm.webIdArr.indexOf(serverId) === -1) {
                continue;
            }

            if (isNaN(new Date(txnData[0]))) {
                continue;
            }

            endCount = txnData[2].length;
            endTxnList = txnData[2];

            for (jx = 0, jxLen = endTxnList.length; jx < jxLen; ++jx) {
                elapsedTime = endTxnList[jx][0];

                if (elapsedTime < 0) {
                    elapsedTime = elapsedTime * -1;
                }

                sumElapse += elapsedTime;
            }

            this.initWebTrendData(serverId, 'TIME'     , time);
            this.initWebTrendData(serverId, 'AVERAGE'  , Math.ceil(parseInt(sumElapse) / endCount) / 1000 );
            this.initWebTrendData(serverId, 'TPS'      , Math.ceil(endCount / 3) );
        }
    }

    adata    = null;
};


/**
 * Web Packet Data - Response Status Code
 * 응답 상태 코드
 *
 * @param {array} adata
 * [0] time
 * [1] server_id
 * [2] code_100
 * [3] code_200
 * [4] code_300
 * [5] code_400
 * [6] code_500
 */
IMXWSWorker.prototype.convertWebResponseStatus = function(adata) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var pktData, trendData, statusLog;
    var serverId;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++ ) {
        pktData  = adata.rows[kx];
        serverId = pktData[1];

        if (!Repository.responseStatus[serverId]) {
            Repository.responseStatus[serverId] = {};
        }

        trendData = Repository.responseStatus[serverId];

        trendData.TIME      = pktData[0];
        //trendData.CODE_100  = pktData[2];
        //trendData.CODE_200  = pktData[3];
        //trendData.CODE_300  = pktData[4];
        trendData.CODE_400  = pktData[5];
        trendData.CODE_500  = pktData[6];
        trendData.ERR_CNT   = trendData.CODE_400 + trendData.CODE_500;

        this.initWebTrendData(serverId, 'TIME'        , trendData.TIME);
        this.initWebTrendData(serverId, 'ERROR_COUNT' , trendData.ERR_CNT);

        // Response Status Code - Log Data
        if (!Repository.responseStatusLog[serverId]) {
            Repository.responseStatusLog[serverId] = {};
        }

        statusLog = Repository.responseStatusLog[serverId];

        if (!statusLog.TIME) {
            statusLog.TIME = [];

            for (ix = 0, ixLen = statusCodeStat.dataCount; ix < ixLen; ix++) {
                statusLog.TIME.push(0);
            }
        }

        for (ix = 0, ixLen = statusCodeStat.names.length; ix < ixLen; ix++) {
            if (!statusLog[statusCodeStat.names[ix]]) {
                statusLog[statusCodeStat.names[ix]] = [];

                for (jx = 0, jxLen = statusCodeStat.dataCount; jx < jxLen; jx++) {
                    statusLog[statusCodeStat.names[ix]].push(0);
                }
            }
            statusLog[statusCodeStat.names[ix]].shift();
            statusLog[statusCodeStat.names[ix]].push(Repository.responseStatus[serverId][statusCodeStat.names[ix]]);
        }

        if (Repository.responseStatus.timeRecordWasId == null) {
            Repository.responseStatus.timeRecordData = [];

            if (trendData.TIME > 0) {
                Repository.responseStatus.timeRecordWasId = serverId;

                for (ix = 0, ixLen = statusCodeStat.dataCount; ix < ixLen; ix++) {
                    // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                    date = new Date(trendData.TIME - (ix * 1000 * 3));
                    Repository.responseStatus.timeRecordData.unshift(date.getTime());
                }
                date = null;
                ix   = null;
            }
        }

        // 기준이 되는 WAS에 해당하는 경우 타임 레코드 정보를 갱신한다.
        if (Repository.responseStatus.timeRecordWasId == serverId) {
            Repository.responseStatus.timeRecordData.shift();
            Repository.responseStatus.timeRecordData.push(trendData.TIME);
        }
    }
    pktData   = null;
    trendData = null;
    statusLog = null;
};


/**
 * Web Packet Data - OS STAT EXTENDED
 * CPU, Memory, OS보낸 패킷량, OS받은 패킷량
 *
 * @param {array} adata
 * [0] time
 * [1] server_id
 * [2] os_cpu_sys
 * [3] os_cpu_user
 * [4] os_cpu_io
 * [5] os_free_memory
 * [6] os_total_memory
 * [7] os_send_packet
 * [8] os_rcv_packet
 */
IMXWSWorker.prototype.convertWebOsStatExt = function(adata, isDataType) {
    var kx, kxLen, ix, ixLen, jx, jxLen;
    var serverId, statData, statusLog, trendData;
    var isDown;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (Comm.webIdArr && Comm.webIdArr.indexOf(serverId) === -1) {
            continue;
        }

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId, 'WebServer') : false;

        if (!Repository.OsStatExtend[serverId]) {
            Repository.OsStatExtend[serverId] = {};
        }
        trendData = Repository.OsStatExtend[serverId];

        trendData.TIME              = statData[0];
        trendData.OS_CPU_SYS        = null;
        trendData.OS_CPU_USER       = null;
        trendData.OS_CPU_IO         = null;
        trendData.OS_FREE_MEM       = null;
        trendData.OS_TOTAL_MEM      = null;
        trendData.OS_CPU            = null;
        trendData.OS_MEM            = null;
        trendData.OS_SEND_PACKETS   = null;
        trendData.OS_RCV_PACKETS    = null;

        if (!isDown) {
            trendData.OS_CPU_SYS        = Math.floor(parseInt(statData[2]) / 10);
            trendData.OS_CPU_USER       = Math.floor(parseInt(statData[3]) / 10);
            trendData.OS_CPU_IO         = Math.floor(parseInt(statData[4]) / 10);
            trendData.OS_FREE_MEM       = Math.ceil(parseInt(statData[5]) / 1024);
            trendData.OS_TOTAL_MEM      = Math.ceil(parseInt(statData[6]) / 1024);
            trendData.OS_CPU            = trendData.OS_CPU_SYS + trendData.OS_CPU_USER + trendData.OS_CPU_IO;
            trendData.OS_MEM            = (trendData.OS_TOTAL_MEM === 0) ? 0 : 100 - Math.floor((trendData.OS_FREE_MEM / trendData.OS_TOTAL_MEM) * 100);
            trendData.OS_SEND_PACKETS   = parseInt(statData[7]) < 0 ? 0 : parseInt(statData[7]);
            trendData.OS_RCV_PACKETS    = parseInt(statData[8]) < 0 ? 0 : parseInt(statData[8]);
        }

        this.initWebTrendData(serverId, 'TIME'           , trendData.TIME);
        this.initWebTrendData(serverId, 'OS_CPU'         , trendData.OS_CPU);
        this.initWebTrendData(serverId, 'OS_MEM'         , trendData.OS_MEM);
        this.initWebTrendData(serverId, 'OS_SEND_PACKETS', trendData.OS_SEND_PACKETS);
        this.initWebTrendData(serverId, 'OS_RCV_PACKETS' , trendData.OS_RCV_PACKETS);

        // OS Stat Extended - Log Data
        if (!Repository.OsStatExtendLog[serverId]) {
            Repository.OsStatExtendLog[serverId] = {};
        }

        statusLog = Repository.OsStatExtendLog[serverId];

        if (!statusLog.TIME) {
            statusLog.TIME = [];

            for (ix = 0, ixLen = osExtendStat.dataCount; ix < ixLen; ix++) {
                statusLog.TIME.push(0);
            }
        }

        for (ix = 0, ixLen = osExtendStat.names.length; ix < ixLen; ix++) {
            if (!statusLog[osExtendStat.names[ix]]) {
                statusLog[osExtendStat.names[ix]] = [];

                for (jx = 0, jxLen = osExtendStat.dataCount; jx < jxLen; jx++) {
                    statusLog[osExtendStat.names[ix]].push(0);
                }
            }
            statusLog[osExtendStat.names[ix]].shift();
            statusLog[osExtendStat.names[ix]].push(Repository.OsStatExtend[serverId][osExtendStat.names[ix]]);
        }

        if (Repository.OsStatExtend.timeRecordWasId == null) {
            Repository.OsStatExtend.timeRecordData = [];

            if (trendData.TIME > 0) {
                Repository.OsStatExtend.timeRecordWasId = serverId;

                for (ix = 0, ixLen = osExtendStat.dataCount; ix < ixLen; ix++) {
                    // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                    date = new Date(trendData.TIME - (ix * 1000 * 3));
                    Repository.OsStatExtend.timeRecordData.unshift(date.getTime());
                }
                date  = null;
                ix    = null;
                ixLen = null;
            }
        }

        // 기준이 되는 서버에 해당하는 경우 타임 레코드 정보를 갱신한다.
        if (Repository.OsStatExtend.timeRecordWasId == serverId) {
            Repository.OsStatExtend.timeRecordData.shift();
            Repository.OsStatExtend.timeRecordData.push(trendData.TIME);
        }
    }
    statData  = null;
    statusLog = null;
    trendData = null;
};


/**
 * Packet Data - WTB_CMD_SI (서버 정보)
 *
 * @param {array} adata
 * [0] time
 * [1] server_id
 * [2] array
 *    [0] hth
 *    [1] svrname
 *    [2] svri
 *    [3] status
 *    [4] reqs
 *    [5] proc_count
 *    [6] cqcnt
 *    [7] aqcnt
 *    [8] qpcnt
 *    [9] emcnt
 *    [10] rscnt
 *    [11] rbcnt
 */
IMXWSWorker.prototype.convertWebTobSI = function(adata, isDataType) {
    var kx, kxLen, ix, ixLen;
    var serverId, statData, arrData;
    var count, aqcount, time;
    var isDown;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++) {
        statData = adata.rows[kx];

        time     = statData[0];
        serverId = statData[1];
        arrData  = statData[2];
        count    = null;
        aqcount  = null;

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId, 'WebServer') : false;

        if (!isDown) {
            for (ix = 0, ixLen = arrData.length; ix < ixLen; ix++) {
                count   += +arrData[ix][6];
                aqcount += +arrData[ix][7];
            }
        }

        this.initWebTrendData(serverId, 'TIME'     , time);
        this.initWebTrendData(serverId, 'QCOUNT'   , count);
        this.initWebTrendData(serverId, 'AQ_COUNT' , aqcount);
    }

    statData  = null;
    statusLog = null;
    trendData = null;
};


/**
 * Packet Data - WTB_CMD_CI (접속 웹 브라우저 정보)
 *
 * @param {array} adata
 * [0] time
 * [1] server_id
 * [2] total_rdy
 * [3] total_qed
 * [4] total_run
 * [5] total_etc
 * [6] total_total
 * [7] array
 *    [0] hth
 *    [1] rdy
 *    [2] qed
 *    [3] run
 *    [4] etc
 *    [5] total
 *    [6] array
 */
IMXWSWorker.prototype.convertWebTobCI = function(adata, isDataType) {
    var ix, ixLen;
    var time, serverId, clients;
    var isDown;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++ ) {
        time     = adata.rows[ix][0];
        serverId = adata.rows[ix][1];
        clients  = Math.ceil(adata.rows[ix][6]);

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId, 'WebServer') : false;

        if (isDown) {
            clients = null;
        }

        this.initWebTrendData(serverId, 'TIME'              , time);
        this.initWebTrendData(serverId, 'CONNECTED_CLIENTS' , clients);
    }

    adata = null;
};


IMXWSWorker.prototype.initWebTrendData = function(serverId, column, value) {
    var ix, ixLen, jx, jxLen;
    var trendData, trendLog;

    if (!Repository.WebTrendData[serverId]) {
        Repository.WebTrendData[serverId] = {};
    }

    if (!Repository.WebTrendDataLog[serverId]) {
        Repository.WebTrendDataLog[serverId] = {};
    }

    trendData = Repository.WebTrendData[serverId];
    trendLog  = Repository.WebTrendDataLog[serverId];

    if (column === 'TIME') {
        if (!trendData[column] || trendData[column] < value) {
            trendData[column] = value;
        }

    } else {
        trendData[column] = value;
    }

    if (!trendLog.TIME) {
        trendLog.TIME = [];

        for (ix = 0, ixLen = webTrendStat.dataCount; ix < ixLen; ix++) {
            trendLog.TIME.push(0);
        }
    }

    //if (!trendLog.isInit) {
    for (ix = 0, ixLen = webTrendStat.names.length; ix < ixLen; ix++) {
        if (!trendLog[webTrendStat.names[ix]]) {
            trendLog[webTrendStat.names[ix]] = [];

            for (jx = 0, jxLen = webTrendStat.dataCount; jx < jxLen; jx++) {
                trendLog[webTrendStat.names[ix]].push(0);
            }
        }
    }
    //}
    //trendLog.isInit = true;

    if (column === 'TIME') {
        if (trendLog[column] && trendLog[column].indexOf(value) === -1) {
            trendLog[column].shift();
            trendLog[column].push(value);
        }
    } else {
        trendLog[column].shift();
        trendLog[column].push(value);
    }

    if (Repository.WebTrendData.timeRecordWasId == null) {
        Repository.WebTrendData.timeRecordData = [];

        if (trendData.TIME > 0) {
            Repository.WebTrendData.timeRecordWasId = serverId;

            for (ix = 0, ixLen = webTrendStat.dataCount; ix < ixLen; ix++) {
                // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                date = new Date(trendData.TIME - (ix * 1000 * 3));
                Repository.WebTrendData.timeRecordData.unshift(date.getTime());
            }

            date  = null;
            ix    = null;
            ixLen = null;
        }
    }

    // 기준이 되는 Server에 해당하는 경우 타임 레코드 정보를 갱신한다.
    if (Repository.WebTrendData.timeRecordWasId == serverId &&
        Repository.WebTrendData.timeRecordData.indexOf(trendData.TIME) == -1) {

        Repository.WebTrendData.timeRecordData.shift();
        Repository.WebTrendData.timeRecordData.push(trendData.TIME);
    }

};


/**
 * APIM Packet Data - APIM OS STAT
 * CPU, Memory, OS보낸 패킷량, OS받은 패킷량, 수행시간, 수행건수
 *
 * @param {array} adata
 * [0] time
 * [1] server_id
 * [2] os_cpu_sys
 * [3] os_cpu_user
 * [4] os_cpu_io
 * [5] os_free_memory
 * [6] os_total_memory
 * [7] os_send_packet
 * [8] os_rcv_packet
 * [9] sum_elapsed_time
 * [10] count
 */
IMXWSWorker.prototype.convertApimOsStat = function(adata, isDataType) {
    var kx, kxLen, ix, ixLen, jx, jxLen;
    var serverId, statData, statusLog, trendData;
    var isDown;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    for (kx = 0, kxLen = adata.rows.length; kx < kxLen; kx++) {
        statData = adata.rows[kx];
        serverId = statData[1];

        if (Comm.cdIdArr && Comm.cdIdArr.indexOf(serverId) === -1) {
            continue;
        }

        isDown = isDataType ? Comm.RTComm.isDownByServer(serverId, 'CD') : false;

        if (!Repository.CDTrendData[serverId]) {
            Repository.CDTrendData[serverId] = {};
        }
        trendData = Repository.CDTrendData[serverId];

        trendData.TIME              = statData[0];

        trendData.OS_CPU_SYS        = null;
        trendData.OS_CPU_USER       = null;
        trendData.OS_CPU_IO         = null;
        trendData.OS_FREE_MEM       = null;
        trendData.OS_TOTAL_MEM      = null;
        trendData.OS_CPU            = null;
        trendData.OS_MEM            = null;
        trendData.OS_SEND_PACKETS   = null;
        trendData.OS_RCV_PACKETS    = null;
        trendData.TXN_ELAPSE        = null;
        trendData.TPS               = null;

        if (!isDown) {
            trendData.OS_CPU_SYS        = Math.floor(parseInt(statData[2]) / 10);
            trendData.OS_CPU_USER       = Math.floor(parseInt(statData[3]) / 10);
            trendData.OS_CPU_IO         = Math.floor(parseInt(statData[4]) / 10);
            trendData.OS_FREE_MEM       = Math.ceil(parseInt(statData[5]) / 1024);
            trendData.OS_TOTAL_MEM      = Math.ceil(parseInt(statData[6]) / 1024);
            trendData.OS_CPU            = trendData.OS_CPU_SYS + trendData.OS_CPU_USER + trendData.OS_CPU_IO;
            trendData.OS_MEM            = (trendData.OS_TOTAL_MEM === 0) ? 0 : 100 - Math.floor((trendData.OS_FREE_MEM / trendData.OS_TOTAL_MEM) * 100);
            trendData.OS_SEND_PACKETS   = parseInt(statData[7]) < 0 ? 0 : parseInt(statData[7]);
            trendData.OS_RCV_PACKETS    = parseInt(statData[8]) < 0 ? 0 : parseInt(statData[8]);
            trendData.TXN_ELAPSE        = +statData[10] <= 0 ? 0 : parseFloat(+statData[9] / +statData[10]);
            trendData.TPS               = Math.ceil(parseInt(statData[10]) / 3);

            // EtoE 화면에 성능지표 차트에 에러 건수를 표시하기 위해 설정
            trendData.ERROR_COUNT       = Repository.txnError[serverId] || 0;
            Repository.txnError[serverId]  = 0;
        }

        // APIM OS Stat - Log Data
        if (!Repository.CDTrendDataLog[serverId]) {
            Repository.CDTrendDataLog[serverId] = {};
        }

        statusLog = Repository.CDTrendDataLog[serverId];

        if (!statusLog.TIME) {
            statusLog.TIME = [];

            for (ix = 0, ixLen = cdTrendStat.dataCount; ix < ixLen; ix++) {
                statusLog.TIME.push(0);
            }
        }
        statusLog.TIME.shift();
        statusLog.TIME.push(statData[0]);

        for (ix = 0, ixLen = cdTrendStat.names.length; ix < ixLen; ix++) {
            if (!statusLog[cdTrendStat.names[ix]]) {
                statusLog[cdTrendStat.names[ix]] = [];

                for (jx = 0, jxLen = cdTrendStat.dataCount; jx < jxLen; jx++) {
                    statusLog[cdTrendStat.names[ix]].push(null);
                }
            }
            statusLog[cdTrendStat.names[ix]].shift();
            statusLog[cdTrendStat.names[ix]].push(Repository.CDTrendData[serverId][cdTrendStat.names[ix]]);
        }

        if (Repository.CDTrendData.timeRecordWasId == null) {
            Repository.CDTrendData.timeRecordData = [];

            if (trendData.TIME > 0) {
                Repository.CDTrendData.timeRecordWasId = serverId;

                for (ix = 0, ixLen = cdTrendStat.dataCount; ix < ixLen; ix++) {
                    // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                    date = new Date(trendData.TIME - (ix * 1000 * 3));
                    Repository.CDTrendData.timeRecordData.unshift(date.getTime());
                }
                date  = null;
                ix    = null;
                ixLen = null;
            }
        }

        // 기준이 되는 서버에 해당하는 경우 타임 레코드 정보를 갱신한다.
        if (Repository.CDTrendData.timeRecordWasId == serverId) {
            Repository.CDTrendData.timeRecordData.shift();
            Repository.CDTrendData.timeRecordData.push(trendData.TIME);
        }
    }
    statData  = null;
    statusLog = null;
    trendData = null;
};


/**
 * Business Stat Packet Data
 *
 * @param {array} adata
 * [0] time
 * [1] tier_id
 * [2] business_id
 * [3] parent_id
 * [4] active_txn_count
 * [5] elapse_time
 * [6] end_txn_count
 * [7] exception_count
 * [8] tree_key
 * [9] active_blue_count
 * [10] active_yellow_count
 * [11] active_red_count
 */
IMXWSWorker.prototype.convertBizStatData = function(adata) {
    var ix, ixLen, jx, jxLen, kx, kxLen;
    var statData, trendData, trendDataLog;
    var businessId, tierId, endTxnCount, elapseTime;

    if (!adata || !adata.rows || adata.rows.length <= 0) {
        return;
    }

    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
        statData = adata.rows[ix];

        tierId     = statData[1];
        businessId = statData[2];
        elapseTime = statData[5]; // Elapsed Time 값은 WebSocketWorker에서 1000 으로 나누어서 보내지고 있음.
        endTxnCount= statData[6];

        // 업무 관점 데이터 설정
        if (!Repository.BizData[businessId]) {
            Repository.BizData[businessId] = {};
        }

        if (!Repository.BizData[businessId][tierId]) {
            Repository.BizData[businessId][tierId] = {};
        }

        Repository.BizData[businessId][tierId] = {
            TIME              : statData[0],
            TXN_ELAPSE        : (endTxnCount === 0) ? 0 : parseFloat(elapseTime / endTxnCount),
            TPS               : Math.ceil(statData[6] / 3),
            EXCEPTION_COUNT   : statData[7],
            ACTIVE_TXN_COUNT  : statData[4],
            ACTIVE_NORMAL     : statData[9],
            ACTIVE_WARNING    : statData[10],
            ACTIVE_CRITICAL   : statData[11],
            TREE_KEY          : statData[8],
            PAREND_ID         : statData[3],
            LAST_TIME         : Date.now()
        };


        // 업무 관점 성능 지표 차트 데이터 설정
        if (!Repository.BizTrendData[businessId]) {
            Repository.BizTrendData[businessId] = {};
        }

        if (!Repository.BizTrendData[businessId][tierId]) {
            Repository.BizTrendData[businessId][tierId] = {};
        }

        if (!Repository.BizTrendDataLog[businessId]) {
            Repository.BizTrendDataLog[businessId] = {};
        }

        if (!Repository.BizTrendDataLog[businessId][tierId]) {
            Repository.BizTrendDataLog[businessId][tierId] = {};
        }

        trendData = Repository.BizTrendData[businessId][tierId];

        trendData.TIME        = statData[0];
        trendData.TXN_ELAPSE  = (endTxnCount === 0) ? 0 : parseFloat(elapseTime / endTxnCount);
        trendData.TPS         = Math.ceil(statData[6] / 3);

        trendDataLog = Repository.BizTrendDataLog[businessId][tierId];

        if (!trendDataLog.TREE_KEY) {
            trendDataLog.TREE_KEY = statData[8];
        }

        if (!trendDataLog.TIME) {
            trendDataLog.TIME = [];

            for (kx = 0, kxLen = 30; kx < kxLen; kx++) {
                trendDataLog.TIME.push(0);
            }
        }
        trendDataLog.TIME.shift();
        trendDataLog.TIME.push(statData[0]);
        trendDataLog.LAST_TIME = Date.now();

        for (kx = 0, kxLen = bizTrendStat.names.length; kx < kxLen; kx++) {
            if (!trendDataLog[bizTrendStat.names[kx]]) {
                trendDataLog[bizTrendStat.names[kx]] = [];

                for (jx = 0, jxLen = bizTrendStat.dataCount; jx < jxLen; jx++) {
                    trendDataLog[bizTrendStat.names[kx]].push(0);
                }
            }
            trendDataLog[bizTrendStat.names[kx]].shift();
            trendDataLog[bizTrendStat.names[kx]].push(Repository.BizTrendData[businessId][tierId][bizTrendStat.names[kx]]);
        }

        if (!Repository.BizTrendData.timeRecordData || Repository.BizTrendData.timeRecordData.length <= 0) {
            Repository.BizTrendData.timeRecordData = [];

            if (trendData.TIME > 0) {

                for (kx = 0, kxLen = bizTrendStat.dataCount; kx < kxLen; kx++) {
                    // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                    date = new Date(trendData.TIME - (kx * 1000 * 3));
                    Repository.BizTrendData.timeRecordData.unshift(date.getTime());
                }
                date  = null;
            }
        }
    }

    if (trendData && trendData.TIME > 0) {
        // 기준이 되는 서버에 해당하는 경우 타임 레코드 정보를 갱신한다.
        Repository.BizTrendData.timeRecordData.shift();
        Repository.BizTrendData.timeRecordData.push(trendData.TIME);
    }

    // 일정 시간동안 들어오지 않는 데이터 삭제 처리.
    var diffSec;
    var bizData, tierDataKeys, bizDataKeys;

    bizDataKeys = Object.keys(Repository.BizData);

    for (ix = 0, ixLen = bizDataKeys.length; ix < ixLen; ix++) {
        bizData = Repository.BizData[bizDataKeys[ix]];
        tierDataKeys = Object.keys(bizData);

        for (jx = 0, jxLen = tierDataKeys.length; jx < jxLen; jx++) {
            diffSec = Ext.Date.diff(bizData[tierDataKeys[jx]].LAST_TIME , Date.now(), Ext.Date.SECOND);

            if (diffSec > 6) {
                delete bizData[tierDataKeys[jx]];
            }
        }
    }

    bizDataKeys = Object.keys(Repository.BizTrendDataLog);

    for (ix = 0, ixLen = bizDataKeys.length; ix < ixLen; ix++) {
        bizData = Repository.BizTrendDataLog[bizDataKeys[ix]];
        tierDataKeys = Object.keys(bizData);

        for (jx = 0, jxLen = tierDataKeys.length; jx < jxLen; jx++) {

            diffSec = Ext.Date.diff(bizData[tierDataKeys[jx]].LAST_TIME , Date.now(), Ext.Date.SECOND);

            if (diffSec > 6) {
                bizData[tierDataKeys[jx]].TPS.shift();
                bizData[tierDataKeys[jx]].TXN_ELAPSE.shift();
                bizData[tierDataKeys[jx]].TPS.push(null);
                bizData[tierDataKeys[jx]].TXN_ELAPSE.push(null);
            }
        }
    }

    statData  = null;
    trendData = null;
    trendDataLog = null;
};


/**
 * TP 성능지표 추이 데이터 설정
 *
 * @param {number} serverId - 서버ID
 * @param {string} column - 지표명
 * @param {string | number} value - 지표값
 */
IMXWSWorker.prototype.iniTPTrendData = function(serverId, column, value) {
    var ix, ixLen, jx, jxLen;
    var trendData, trendLog, logTime, isContain;

    // TP에 해당하는 정보만 처리를 한다.
    if (!Comm.tpIdArr || Comm.tpIdArr.indexOf(serverId) === -1) {
        return;
    }

    if (!Repository.tmadminChartData[serverId]) {
        Repository.tmadminChartData[serverId] = {};
    }

    // TP Stat Data Log
    if (!Repository.tmadminDataLog[serverId]) {
        Repository.tmadminDataLog[serverId] = {};
    }

    trendData = Repository.tmadminChartData[serverId];
    trendLog  = Repository.tmadminDataLog[serverId];

    if (column === 'TIME') {
        if (trendData[column] < value) {
            trendData[column] = value;
        }

    } else {
        trendData[column] = value;
    }

    if (!trendLog.TIME) {
        trendLog.TIME = [];

        for (ix = 0, ixLen = tpStat.dataCount; ix < ixLen; ix++) {
            trendLog.TIME.push(0);
        }
    }

    for (ix = 0, ixLen = tpStat.names.length; ix < ixLen; ix++) {
        if (!trendLog[tpStat.names[ix]]) {
            trendLog[tpStat.names[ix]] = [];

            for (jx = 0, jxLen = tpStat.dataCount; jx < jxLen; jx++) {
                trendLog[tpStat.names[ix]].push(null);
            }
        }
    }

    if (column === 'TIME') {
        if (trendLog[column] && trendLog[column].indexOf(value) === -1) {
            trendLog[column].shift();
            trendLog[column].push(value);
        }
    } else {
        trendLog[column].shift();
        trendLog[column].push(value);
    }

    if (Repository.tmadminChartData.timeRecordWasId == null) {
        Repository.tmadminChartData.timeRecordData = [];

        if (trendData.TIME > 0) {
            Repository.tmadminChartData.timeRecordWasId = serverId;

            for (ix = 0, ixLen = webTrendStat.dataCount; ix < ixLen; ix++) {
                // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                // TP 데이터는 10초 단위로 들어오기때문에 timerecord 는 10초 단위로 구성함.
                date = new Date(trendData.TIME - (ix * 1000 * 10));
                Repository.tmadminChartData.timeRecordData.unshift(date.getTime());
            }

            date  = null;
        }

    } else if (Repository.tmadminChartData.timeRecordWasId == serverId) {

        // 동일한 시간이 아닌 경우 시간 데이터를 설정하게 처리하였었는데 초까지는 같지만 밀리세컨드 단위가 다른 경우
        // timerecord에 데이터가 추가되면 문제가 확인되어 초 단위까지만 비교하여 같지 않은 경우만 등록이 되게 처리함.
        // 참고) 데이터를 보내줄 때 TP 관련 패킷 데이터를 하나로 묶어서 보내주면 관련 처리가 필요없음.
        for (ix = 0, ixLen = Repository.tmadminChartData.timeRecordData.length; ix < ixLen; ix++) {
            logTime   = Repository.tmadminChartData.timeRecordData[ix];
            isContain = (logTime + '').substr(0, 10) === (trendData.TIME + '').substr(0, 10);

            if (isContain) {
                break;
            }
        }

        if (!isContain) {
            Repository.tmadminChartData.timeRecordData.shift();
            Repository.tmadminChartData.timeRecordData.push(trendData.TIME);
        }
    }

};

/**
 * Tux 성능지표 추이 데이터 설정
 *
 * @param {number} serverId - 서버ID
 * @param {string} column - 지표명
 * @param {string | number} value - 지표값
 */
IMXWSWorker.prototype.iniTuxTrendData = function(serverId, column, value) {
    var ix, ixLen, jx, jxLen;
    var trendData, trendLog, logTime, isContain;

    // TP에 해당하는 정보만 처리를 한다.
    if (!Comm.tuxIdArr || Comm.tuxIdArr.indexOf(serverId) === -1) {
        return;
    }

    // Tux Stat Data Log
    if (!Repository.TuxTrendData[serverId]) {
        Repository.TuxTrendData[serverId] = {};
    }

    if (!Repository.TuxTrendDataLog[serverId]) {
        Repository.TuxTrendDataLog[serverId] = {};
    }

    trendData = Repository.TuxTrendData[serverId];
    trendLog  = Repository.TuxTrendDataLog[serverId];

    if (column === 'TIME') {
        if (trendData[column] < value) {
            trendData[column] = value;
        }

    } else {
        trendData[column] = value;
    }

    if (!trendLog.TIME) {
        trendLog.TIME = [];

        for (ix = 0, ixLen = tuxStat.dataCount; ix < ixLen; ix++) {
            trendLog.TIME.push(0);
        }
    }

    for (ix = 0, ixLen = tuxStat.names.length; ix < ixLen; ix++) {
        if (!trendLog[tuxStat.names[ix]]) {
            trendLog[tuxStat.names[ix]] = [];

            for (jx = 0, jxLen = tuxStat.dataCount; jx < jxLen; jx++) {
                trendLog[tuxStat.names[ix]].push(null);
            }
        }
    }

    if (column === 'TIME') {
        if (trendLog[column] && trendLog[column].indexOf(value) === -1) {
            trendLog[column].shift();
            trendLog[column].push(value);
        }
    } else {
        trendLog[column].shift();
        trendLog[column].push(value);
    }

    if (Repository.TuxTrendData.timeRecordWasId == null) {
        Repository.TuxTrendData.timeRecordData = [];

        if (trendData.TIME > 0) {
            Repository.TuxTrendData.timeRecordWasId = serverId;

            for (ix = 0, ixLen = tuxStat.dataCount; ix < ixLen; ix++) {
                // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정.
                // TP 데이터는 10초 단위로 들어오기때문에 timerecord 는 10초 단위로 구성함.
                date = new Date(trendData.TIME - (ix * 1000 * 10));
                Repository.TuxTrendData.timeRecordData.unshift(date.getTime());
            }

            date  = null;
        }

    } else if (Repository.TuxTrendData.timeRecordWasId == serverId) {

        // 동일한 시간이 아닌 경우 시간 데이터를 설정하게 처리하였었는데 초까지는 같지만 밀리세컨드 단위가 다른 경우
        // timerecord에 데이터가 추가되면 문제가 확인되어 초 단위까지만 비교하여 같지 않은 경우만 등록이 되게 처리함.
        // 참고) 데이터를 보내줄 때 TP 관련 패킷 데이터를 하나로 묶어서 보내주면 관련 처리가 필요없음.
        for (ix = 0, ixLen = Repository.TuxTrendData.timeRecordData.length; ix < ixLen; ix++) {
            logTime   = Repository.TuxTrendData.timeRecordData[ix];
            isContain = (logTime + '').substr(0, 10) === (trendData.TIME + '').substr(0, 10);

            if (isContain) {
                break;
            }
        }

        if (!isContain) {
            Repository.TuxTrendData.timeRecordData.shift();
            Repository.TuxTrendData.timeRecordData.push(trendData.TIME);
        }
    }

};

/**
 * TP 성능지표 추이 데이터 설정 (3초 주기)
 *
 * @param {number} serverId - 서버ID
 * @param {string | number} value - 시간
 */
IMXWSWorker.prototype.initTP3SecTrendData = function(serverId, value) {
    var ix, ixLen, jx, jxLen;
    var trendData, trendLog, trendValue, logTime, tpData;

    // TP에 해당하는 정보만 처리를 한다.
    if (Comm.tpIdArr.indexOf(serverId) === -1) {
        return;
    }

    if (!Repository.TP3SecTrendData[serverId]) {
        Repository.TP3SecTrendData[serverId] = {};
    }

    if (!Repository.TP3SecTrendLog[serverId]) {
        Repository.TP3SecTrendLog[serverId] = {};
    }

    tpData    = Repository.tmadminChartData[serverId];
    trendData = Repository.TP3SecTrendData[serverId];
    trendLog  = Repository.TP3SecTrendLog[serverId];


    if (!trendData.TIME || trendData.TIME < value) {
        trendData.TIME = value;
    }

    for (ix = 0, ixLen = tpStat.names.length; ix < ixLen; ix++) {
        trendValue = tpData ? tpData[tpStat.names[ix]] : null;
        trendData[tpStat.names[ix]] = trendValue;
    }

    // TP 추이 데이터를 관리하는 개체 설정
    if (!trendLog.TIME) {
        trendLog.TIME = [];

        for (ix = 0, ixLen = tpStat.dataCount; ix < ixLen; ix++) {
            trendLog.TIME.push(0);
        }
    }

    for (ix = 0, ixLen = tpStat.names.length; ix < ixLen; ix++) {
        if (!trendLog[tpStat.names[ix]]) {
            trendLog[tpStat.names[ix]] = [];

            for (jx = 0, jxLen = tpStat.dataCount; jx < jxLen; jx++) {
                trendLog[tpStat.names[ix]].push(null);
            }
        }
    }

    // 값 설정
    if (trendLog.TIME && trendLog.TIME.indexOf(value) === -1) {
        trendLog.TIME.shift();
        trendLog.TIME.push(value);
    }

    for (ix = 0, ixLen = tpStat.names.length; ix < ixLen; ix++) {
        trendValue = tpData ? tpData[tpStat.names[ix]] : null;

        trendLog[tpStat.names[ix]].shift();
        trendLog[tpStat.names[ix]].push(trendValue);
    }

    // Timerecord Data
    if (!Repository.TP3SecTrendData.timeRecordWasId) {
        Repository.TP3SecTrendData.timeRecordData = [];

        if (trendData.TIME > 0) {
            Repository.TP3SecTrendData.timeRecordWasId = serverId;

            for (ix = 0, ixLen = tpStat.dataCount; ix < ixLen; ix++) {
                // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정하며 timerecord 는 3초 단위로 구성함.
                logTime = new Date(trendData.TIME - (ix * 1000 * 3));
                Repository.TP3SecTrendData.timeRecordData.unshift(logTime.getTime());
            }
        }

    } else if (Repository.TP3SecTrendData.timeRecordWasId == serverId) {
        Repository.TP3SecTrendData.timeRecordData.shift();
        Repository.TP3SecTrendData.timeRecordData.push(trendData.TIME);
    }

};



IMXWSWorker.prototype.checkExpiredLicense = function(data) {

    if (typeof window.realtime === 'undefined') {
        return;
    }

    /*
     * 0: time
     * 1: server_type  (1: WAS, 2: DB, 3:WebServer)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type
     * 9: descr
     * */
    var isExpired = false;
    var idx;
    if (+data[1] === 1 && (data[4] === 'License' || data[4] === 'Server Boot')) {

        if (+data[5] < 0) {
            isExpired = true;
        }

        idx = realtime.expiredServer.indexOf(data[2]);

        if (isExpired === true) {
            if (idx === -1) {
                realtime.expiredServer.push(data[2]);
            }
        } else {
            if (idx !== -1) {
                realtime.expiredServer.splice(idx, 1);
            }
        }
    }

};

/**
 * .NET Application 여부를 체크한다.
 *
 * @param {string} wasId
 * @return {Boolean}
 */
IMXWSWorker.prototype.isNetApp = function(wasId) {
    if (typeof window.Comm === 'undefined') {
        return false;
    }

    return (Comm.wasAppType && Comm.wasAppType[wasId] && Comm.wasAppType[wasId].toLocaleLowerCase() === 'net' );
};

/**
 * TP 서버인지 체크한다.
 *
 * @param {string} wasId
 * @return {Boolean}
 */
IMXWSWorker.prototype.isTP = function(serverId) {
    if (typeof window.Comm === 'undefined' || !Comm.wasInfoObj[serverId]) {
        return false;
    }

    return Comm.wasInfoObj[serverId].type === 'TP';
};

