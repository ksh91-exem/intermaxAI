/***************************************************************************************************************
 *
 * Global Area *
 *
 ***************************************************************************************************************/
importScripts('../lib/zlib.min.js');
importScripts('../lib/IMXWS.js');
/***************************************************************************************************************
 *
 * Web Worker 통신 정의
 *
 ***************************************************************************************************************/
var COMMAND  = {
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


/**
 * Server Status List
 * ex) Connected, Disconnected, Server Down, Server Boot
 */
var serverStatus = {
    Received : false,
    data: {
        WAS: {},
        DB : {},
        CD : {},
        WebServer: {}
    }
};

var onFunc = function() {
    this.P = true;
};

var offFunc = function() {
    this.P = null;
}

var ImxPacketDebug = {
    Activity:  { P: null, on: onFunc, off: offFunc },
    ActiveTxn: { P: null, on: onFunc, off: offFunc },
    WasStat:   { P: null, on: onFunc, off: offFunc },
    Alarm:     { P: null, on: onFunc, off: offFunc },
    GCStat:    { P: null, on: onFunc, off: offFunc },
    Pool:      { P: null, on: onFunc, off: offFunc },
    DBStat:    { P: null, on: onFunc, off: offFunc },
    SessionCnt:{ P: null, on: onFunc, off: offFunc }
};

/**
 * Expired License WAS List
 */
var expiredServer = [];

var timeZoneOffset   = {};
var timezoneByWas    = {};
var timezoneCheckCnt = 0;
var isTimezoneData   = false;

var option          = {
    useStat: {},
    alarmListInfo : {},
    alarm : {
        range          : 10 * 60 * 1000,     // millisecond(10분)
        interval       : 60 * 1000,
        curStartPoint  : 0,
        curInsertIndex : -1,
        curMaxValue    : 100,
        alarmHistoryFirstTime: new Date().setSeconds(0, 0)
    }
};

/**
 * 알람 패킷 데이터
 */
var alarmStats = [];
var alarmData  = [];

/**
 * 실시간 WAS 지표 패킷 데이터
 */
var wasTrendChartData = {
    timeRecordWasId: null,  // 시간의 기준이 되는 WASID
    timeRecordData: []      // Performance Stat & GC Stat 에서 사용되는 시간 데이터
};

/**
 * 마지막 시간
 */
var wasStatLastestTime = null;

var wasTrendChartLog = {};

/**
 * 실시간 GC 지표 패킷 데이터
 */
var gcTrendChartData = {};

/**
 * 실시간 패킷 데이터를 받을 서버 정보
 */
var packetReceiveServer = {
    WAS: {
        Names: [],
        Connect: []
    },
    DB: [],
    HOST: [],
    WEBSERVER: {
        Names: [],
        Connect: []
    }
};


function init() {

    option.useStat = {};

}

var realTimeWSList = ['Activity', 'ActiveTxn', 'WasStat', 'Alarm', 'Others', 'WWS'];
var realTimeWS = {
    Activity  : new IMXWS(),
    ActiveTxn : new IMXWS(),
    WasStat   : new IMXWS(),
    Alarm     : new IMXWS(),
    Others    : new IMXWS(),
    WWS       : new IMXWS()
};

var realTimeWSStatus = {
    Activity  : true,
    ActiveTxn : true,
    WasStat   : true,
    Alarm     : true,
    Others    : true
};

var platformJSStatus = false;

// worker 에서 데이터 받는 부분
var onmessage = function(e) {
    var packet = e.data;

    switch (packet.command) {
        case COMMAND.WS_INIT :
            realTimeWSInit(packet.data);

            break;

        case COMMAND.ADD_OPTION :
            //WS.AddOption(packet.data)
            break;

        case COMMAND.INIT:
            //init()
            console.debug('WebSocketWorker Onmessage - Init');
            break;

        case COMMAND.WS_CLOSE :
            workerDestroy();
            break;

        case COMMAND.ADD_SERVER:
            if (packet.data.wasNames) {
                addTargetWasServer(packet.data.wasNames);
            }

            if (packet.data.webIdArr) {
                addTargetWebServer(packet.data.webIdArr);
            }

            sendEndConfig();
            break;

        case COMMAND.ADD_WAS:
            if (packet.data.wasNames) {
                addTargetWasServer(packet.data.wasNames);
            }
            sendEndConfig();
            break;

        case COMMAND.ADD_DB:
            if (packet.data.instanceNames) {
                addTargetDbServer(packet.data.instanceNames);
            }
            break;

        case COMMAND.ADD_WS:
            if (packet.data.webIdArr) {
                addTargetWebServer(packet.data.webIdArr);
            }
            sendEndConfig();
            break;

        case COMMAND.ADD_HOST:
            if (packet.data.hostInfos) {
                addTargetHostServer(packet.data.hostInfos);
            }
            break;

        case COMMAND.TIMEZONE:
            if (packet.data.wasIdAddr) {
                getRealTimeTimezone(packet.data.wasIdAddr, packet.data.repository);

                setTimeout(checkRealTimezone, 3000, packet.data.wasIdAddr, packet.data.repository);

            } else if (packet.data === 'TimezoneClear') {
                isTimezoneData = false;
            }
            break;

        case COMMAND.PACKET_ADD:
            console.debug('WebSocketWorker Onmessage - Packet Add');
            imxAddPacket(packet.data.packetNumber);
            break;

        case COMMAND.PACKET_REMOVE:
            console.debug('WebSocketWorker Onmessage - Packet Remove');
            imxRemovePacket(packet.data.packetNumber);
            break;

        case COMMAND.SET_TXN_FILTERS:
            setTransactionFilters(packet.data);
            break;

        case COMMAND.TOPOLOGY:
            getTopologyInfo();
            break;

        default:
            break;
    }

    packet = null;
};

/**
 * 실시간 화면에서 사용하는 Worker 생성.
 *
 * @param {Object} data
 */
function realTimeWSInit(data) {
    var ix, ws;
    for (ix = 0; ix < realTimeWSList.length; ix++) {
        ws = realTimeWSList[ix];
        realTimeWS[ws].close();
    }

    realTimeWS.Activity.onActivityClientIP  = imxwsOnActivity;

    realTimeWS.ActiveTxn.onActiveTXN        = imxwsOnActiveTXN;
    realTimeWS.ActiveTxn.onActivityFilterWS = imxwsOnActivityFilterWS;

    realTimeWS.WasStat.onWasStat            = imxwsOnWasStat;
    realTimeWS.WasStat.onWasSessionCount    = imxwsOnWasSessionCount;
    realTimeWS.WasStat.onWebToBCi           = imxwsOnWebToBCi;
    realTimeWS.WasStat.onWebToBSi           = imxwsOnWebToBSi;

    realTimeWS.WasStat.onTPSvrStat          = imxwsOnTpSvrStat;
    realTimeWS.WasStat.onTPSvrProcStat      = imxwsOnTpSvrProcStat;
    realTimeWS.WasStat.onTPSvcStat          = imxwsOnTpSvcStat;
    realTimeWS.WasStat.onTPClientInfo       = imxwsOnTpClientInfo;

    realTimeWS.WasStat.onTuxStat            = imxwsOnTuxStat;
    realTimeWS.WasStat.onTuxServer          = imxwsOnTuxServer;
    realTimeWS.WasStat.onTuxService         = imxwsOnTuxService;
    realTimeWS.WasStat.onTuxQueue           = imxwsOnTuxQueue;
    realTimeWS.WasStat.onTuxClient          = imxwsOnTuxClient;

    realTimeWS.WasStat.onWebActiveDetail    = imxwsOnWebActiveDetail;
    realTimeWS.WasStat.onOsStatExtended     = imxwsOnOsStatExtended;
    realTimeWS.WasStat.onResponseStatusCode = imxwsOnResponseStatus;

    realTimeWS.WasStat.onAPIMOsStat         = imxwsOnAPIMOsStat;

    realTimeWS.WasStat.onEndBusinessStat        = imxwsOnEndBusinessStat;
    realTimeWS.WasStat.onActivityFilterBusiness = imxwsOnActivityFilterBusiness;
    realTimeWS.WasStat.onEndBusinessVisitor = imxwsOnEndBusinessVisitor;

    realTimeWS.Alarm.onAlarmHistory         = imxwsOnAlarmHistory;

    realTimeWS.Alarm.onJVMGCStat            = imxwsOnJVMGCStat;
    realTimeWS.Alarm.onDBCPUUsage           = imxwsOnDBCPUUsage;
    realTimeWS.Alarm.onDBStat               = imxwsOnDBStat;
    realTimeWS.Alarm.onProcessStatus        = imxwsOnProcessStatus;

    realTimeWS.Others.onTopologyInfo        = imxwsOnTopology;
    realTimeWS.Others.onTopologyCount       = imxwsOnTopologyCount;
    realTimeWS.Others.onProcessMonitor      = imxwsOnProcessMonitor;
    realTimeWS.Others.onLockInfo            = imxwsOnLockInfo;
    realTimeWS.Others.onServiceInfo         = imxwsOnServiceInfo;
    realTimeWS.Others.onPoolMonitor         = imxwsOnPoolMonitor;
    realTimeWS.Others.onWasMonitorDaily     = imxwsOnWasMonitorDaily;
    realTimeWS.Others.onAutoIDStatus        = imxwsOnAutoIdStatus;

    for (ix = 0; ix < realTimeWSList.length; ix++) {
        ws = realTimeWSList[ix];

        realTimeWS[ws].Host          = data.Host;
        realTimeWS[ws].Port          = data.Port;
        realTimeWS[ws].parseJSON     = true;
        realTimeWS[ws].ExtractHeader = true;
        realTimeWS[ws].PushData      = (ws !== 'WWS');
        realTimeWS[ws].allwasservers = false;
        realTimeWS[ws].UseType       = ws;

        if (ws === 'Others') {
            realTimeWS[ws].RemoveReceivePacket(PKT_TOPOLOGY_INFO);
            realTimeWS[ws].RemoveReceivePacket(PKT_TOPOLOGY_COUNT);
            realTimeWS[ws].RemoveReceivePacket(PKT_CLIENT_RES_PROCESS_MONITOR);
        }

        if (ws !== 'WWS') {
            realTimeWS[ws].onclose = imxwsCloseEvent.bind({
                wsName: ws
            });
            realTimeWS[ws].onconnect = imxwsOpenEvent.bind({
                wsName: ws
            });
        }
        realTimeWS[ws].Open();
    }

    data = null;
    ws   = null;
}

/**
 * 서버 Timezone 데이터 유무 체크
 *
 * @param {string} serverId - 서버 ID ex) 10,11,12
 * @param {string} databaseName
 */
function checkRealTimezone(serverId, databaseName) {

    if (!isTimezoneData) {
        getRealTimeTimezone(serverId, databaseName);

        if (timezoneCheckCnt < 3) {
            timezoneCheckCnt++;
            setTimeout(checkRealTimezone, 3000, serverId, databaseName);
        } else {
            console.debug('%c## Delayed get Timezone Data.', 'background:#FFC0C0;color:#000');
            timezoneCheckCnt = 0;
        }
    }
}

/**
 * 서버 Timezone 정보를 가져오기
 *
 * @param {string} serverId - 서버 ID ex) 10,11,12
 * @param {string} databaseName
 */
function getRealTimeTimezone(serverId, databaseName) {
    var ix, ixLen;

    isTimezoneData = false;
    timeZoneOffset   = {};
    timezoneByWas    = {};

    try {
        // 0: was_id, 1: was_name, 2: time_zone
        realTimeWS.WWS.open();
        console.debug(' [Timezone] - Get timezone data by server.');

        realTimeWS.WWS.SQLExec({
            sql_file: '/IMXRT_TimezoneByWAS.sql',
            replace_string: [{
                name: 'wasid', value: serverId
            }],
            database: databaseName
        }, function(aheader, adata) {
            if (adata && adata.rows) {
                console.debug(' [Timezone] - Get timezone data by server... Complete.', 'Server Count: ', adata.rows.length);
                isTimezoneData = true;
                timezoneCheckCnt = 0;

                for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                    if (adata.rows[ix][2] == null || adata.rows[ix][2] === '') {
                        timeZoneOffset[adata.rows[ix][0]] = null;
                    } else {
                        timeZoneOffset[adata.rows[ix][0]] = adata.rows[ix][2];
                    }
                    timezoneByWas[adata.rows[ix][0]] = +new Date(adata.rows[ix][3]);
                }
            }

            console.debug(' [Timezone] - Completed set timezone.');

            this.postMessage({
                command: COMMAND.PARSING_DATA,
                key : COMMAND.TIMEZONE,
                data: {
                    timeZone: timezoneByWas,
                    timeZoneOffset: timeZoneOffset
                }
            });

            realTimeWS.WWS.disconnect();

            initData();

        }.bind(this));
    } catch (e) {
        console.debug('%c' + e, 'background:#FFC0C0;color:#000');
    }
}

var data_time;

function setTimezoneByWasId(time, was_id) {
    if (was_id === null || was_id  === undefined || timeZoneOffset[was_id] == null) {
        return time;
    }
    time = Number(time);
    data_time = +new Date(time + (new Date(timezoneByWas[was_id]).getTimezoneOffset() + timeZoneOffset[was_id]) * 1000 * 60);

    return data_time;
}

// 웹소켓으로 데이터를 받을 WAS 서버 설정
function addTargetWasServer(wasNames) {

    console.debug(' [Add Target] - Start set target server.');

    var nameArr = wasNames.split(',');
    var oldWasNames = packetReceiveServer.WAS.Names;
    packetReceiveServer.WAS.Names = [];
    packetReceiveServer.WAS.Connect = [];

    var ix, ixLen;

    for (ix = 0, ixLen = oldWasNames.length; ix < ixLen; ix++) {
        realTimeWS.Activity.RemoveWasServer(oldWasNames[ix]);
        realTimeWS.ActiveTxn.RemoveWasServer(oldWasNames[ix]);
        realTimeWS.WasStat.RemoveWasServer(oldWasNames[ix]);
        realTimeWS.Alarm.RemoveWasServer(oldWasNames[ix]);
        realTimeWS.Others.RemoveWasServer(oldWasNames[ix]);
    }

    removeTargetWebServer();

    for (ix = 0; ix < nameArr.length; ix++) {

        if (packetReceiveServer.WAS.Names.indexOf(nameArr[ix]) === -1) {
            packetReceiveServer.WAS.Names[ix] = nameArr[ix];
            packetReceiveServer.WAS.Connect[ix] = {};
            packetReceiveServer.WAS.Connect[ix]._Name = nameArr[ix];
        }

        packetReceiveServer.WAS.Connect[ix].Activity  = realTimeWS.Activity.AddWasServer(nameArr[ix]);
        packetReceiveServer.WAS.Connect[ix].ActiveTxn = realTimeWS.ActiveTxn.AddWasServer(nameArr[ix]);
        packetReceiveServer.WAS.Connect[ix].WasStat   = realTimeWS.WasStat.AddWasServer(nameArr[ix]);
        packetReceiveServer.WAS.Connect[ix].Alarm     = realTimeWS.Alarm.AddWasServer(nameArr[ix]);
        packetReceiveServer.WAS.Connect[ix].Others    = realTimeWS.Others.AddWasServer(nameArr[ix]);
    }
    nameArr = null;

    console.debug(' [Add Target] - End set target server.');
}

function retryTargetWasServer(data) {
    var serverType, wasId, wasName, index,
        ix, ixLen;

    for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
        serverType = data.rows[ix][0];
        wasId   = data.rows[ix][1];
        wasName = data.rows[ix][2];

        if (+serverType !== 1 || wasId <= 0) {
            continue;
        }

        index = packetReceiveServer.WAS.Names.indexOf(wasName);

        if (index !== -1) {
            realTimeWS.Activity.RemoveWasServer(wasName);
            packetReceiveServer.WAS.Connect[index].Activity = realTimeWS.Activity.AddWasServer(wasName);

            realTimeWS.ActiveTxn.RemoveWasServer(wasName);
            packetReceiveServer.WAS.Connect[index].ActiveTxn = realTimeWS.ActiveTxn.AddWasServer(wasName);

            realTimeWS.WasStat.RemoveWasServer(wasName);
            packetReceiveServer.WAS.Connect[index].WasStat = realTimeWS.WasStat.AddWasServer(wasName);

            realTimeWS.Alarm.RemoveWasServer(wasName);
            packetReceiveServer.WAS.Connect[index].Alarm = realTimeWS.Alarm.AddWasServer(wasName);

            realTimeWS.Others.RemoveWasServer(wasName);
            packetReceiveServer.WAS.Connect[index].Others = realTimeWS.Others.AddWasServer(wasName);
        }
    }

}

function addTargetDbServer(instanceNames) {
    var nameArr = instanceNames.split(','),
        ix, ixLen;

    for (ix = 0, ixLen = nameArr.length; ix < ixLen; ix++) {
        realTimeWS.Activity.AddDBServer(nameArr[ix]);
        realTimeWS.ActiveTxn.AddDBServer(nameArr[ix]);
        realTimeWS.WasStat.AddDBServer(nameArr[ix]);
        realTimeWS.Alarm.AddDBServer(nameArr[ix]);
        realTimeWS.Others.AddDBServer(nameArr[ix]);
    }
    nameArr = null;
}

// 웹 소켓으로 데이터를 받을 WebServer 설정
function addTargetWebServer(wsIds) {
    var wsIdArr = wsIds.split(',');
    var oldWsIdArr = packetReceiveServer.WEBSERVER.Names;

    packetReceiveServer.WEBSERVER.Names = [];
    packetReceiveServer.WEBSERVER.Connect = [];

    var ix, ixLen;

    for (ix = 0, ixLen = oldWsIdArr.length; ix < ixLen; ix++) {
        realTimeWS.Activity.RemoveWasServer(oldWsIdArr[ix]);
        realTimeWS.ActiveTxn.RemoveWasServer(oldWsIdArr[ix]);
        realTimeWS.WasStat.RemoveWasServer(oldWsIdArr[ix]);
        realTimeWS.Alarm.RemoveWasServer(oldWsIdArr[ix]);
        realTimeWS.Others.RemoveWasServer(oldWsIdArr[ix]);
    }

    for (ix = 0; ix < wsIdArr.length; ix++) {

        if (packetReceiveServer.WEBSERVER.Names.indexOf(wsIdArr[ix]) === -1) {
            packetReceiveServer.WEBSERVER.Names[ix] = wsIdArr[ix];
            packetReceiveServer.WEBSERVER.Connect[ix] = {};
            packetReceiveServer.WEBSERVER.Connect[ix]._Name = wsIdArr[ix];
        }

        packetReceiveServer.WEBSERVER.Connect[ix].Activity  = realTimeWS.Activity.AddWasServer(wsIdArr[ix]);
        packetReceiveServer.WEBSERVER.Connect[ix].ActiveTxn = realTimeWS.ActiveTxn.AddWasServer(wsIdArr[ix]);
        packetReceiveServer.WEBSERVER.Connect[ix].WasStat   = realTimeWS.WasStat.AddWasServer(wsIdArr[ix]);
        packetReceiveServer.WEBSERVER.Connect[ix].Alarm     = realTimeWS.Alarm.AddWasServer(wsIdArr[ix]);
        packetReceiveServer.WEBSERVER.Connect[ix].Others    = realTimeWS.Others.AddWasServer(wsIdArr[ix]);
    }
    wsIdArr = null;
}

// 실시간 패킷 데이터를 받는 목록에서 WebServer 를 삭제
function removeTargetWebServer() {
    var ix, ixLen;
    var oldWsIdArr = packetReceiveServer.WEBSERVER.Names;

    packetReceiveServer.WEBSERVER.Names   = [];
    packetReceiveServer.WEBSERVER.Connect = [];

    for (ix = 0, ixLen = oldWsIdArr.length; ix < ixLen; ix++) {
        realTimeWS.Activity.RemoveWasServer(oldWsIdArr[ix]);
        realTimeWS.ActiveTxn.RemoveWasServer(oldWsIdArr[ix]);
        realTimeWS.WasStat.RemoveWasServer(oldWsIdArr[ix]);
        realTimeWS.Alarm.RemoveWasServer(oldWsIdArr[ix]);
        realTimeWS.Others.RemoveWasServer(oldWsIdArr[ix]);
    }
}

/**
 * Add Receive Target Host
 *
 * @param {array} hostInfos
 */
function addTargetHostServer(hostInfos) {
    var ix, ixLen;
    var hostId;

    var oldHostNames = packetReceiveServer.HOST;
    packetReceiveServer.HOST = [];

    for (ix = 0, ixLen = oldHostNames.length; ix < ixLen; ix++) {
        realTimeWS.Alarm.RemoveHostServer(oldHostNames[ix]);
    }

    // 0: Host Name, 1: Host IP, 2: Host ID
    for (ix = 0, ixLen = hostInfos.length; ix < ixLen; ix++) {
        hostId   = hostInfos[ix][2] + '';

        realTimeWS.Alarm.AddHostServer(hostId);

        if (packetReceiveServer.HOST.indexOf(hostId) === -1) {
            packetReceiveServer.HOST.push(hostId);
        }
    }
}

// 웹소켓으로 데이터 받고 메인 으로 데이터 넘겨주는 부분

function imxwsOnWasStat(header, data) {
    var ix, ixLen;
    // Debug Code
    if (ImxPacketDebug.WasStat.P === true) {
        try {
            for (ix = 0; ix < data.rows.length; ix++) {
                console.debug(data.rows[ix]);
            }
        } catch (e) {
            console.debug('%c' + e.message, 'color:red;');
        }
    }

    for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
        if (typeof data.rows[ix][0] === 'number' && isFinite(data.rows[ix][0])) {
            data.rows[ix][0] = setTimezoneByWasId(data.rows[ix][0], data.rows[ix][1]);
        }
    }

    if (isTimezoneData !== true) {
        return;
    }

    var d = data.rows[0];
    if (!d || d.length <= 0) {
        return;
    }
    var wasid = d[1];

    if (wasStatLastestTime === undefined || wasStatLastestTime === null) {
        wasStatLastestTime = d[0];
    }

    // 실시간 마지막 시간을 저장
    if (new Date(wasStatLastestTime).getTime() < d[0]) {
        wasStatLastestTime = d[0];
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WAS_STAT,
        data: {
            header      : header,
            data        : data,
            wasid       : wasid,
            lastestTime : wasStatLastestTime
        }
    });

    ix     = null;
    ixLen  = null;
    header = null;
    data   = null;
    d      = null;
}

function imxwsOnWasSessionCount(header, data) {
    var ix, ixLen;

    if (ImxPacketDebug.SessionCnt.P === true) {
        try {
            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                console.debug(data.rows[ix]);
            }
        } catch (e) {
            console.debug('%c' + e.message, 'color:red;');
        }
    }

    for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
        if (typeof data.rows[ix][0] === 'number' && isFinite(data.rows[ix][0])) {
            data.rows[ix][0] = setTimezoneByWasId(data.rows[ix][0], data.rows[ix][1]);
        }
    }

    if (isTimezoneData !== true) {
        return;
    }

    var d = data.rows[0];
    if (!d || d.length <= 0) {
        return;
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WAS_SESSION_CNT,
        data: {
            header      : header,
            data        : data
        }
    });

    ix     = null;
    ixLen  = null;
    header = null;
    data   = null;
    d      = null;
}

function imxwsOnActiveTXN(header, data) {

    var ix, ixLen;
    // Debug Code
    if (ImxPacketDebug.ActiveTxn.P === true) {
        try {
            for (ix = 0; ix < data.rows.length; ix++) {
                console.debug(data.rows[ix]);
            }
        } catch (e) {
            console.debug('%c' + e.message, 'color:red;');
        }
    }

    for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {

        if (typeof data.rows[ix][0] === 'number' && isFinite(data.rows[ix][0])) {
            data.rows[ix][0]  = setTimezoneByWasId(data.rows[ix][0],  data.rows[ix][1]);
            data.rows[ix][7]  = setTimezoneByWasId(data.rows[ix][7],  data.rows[ix][1]);
            data.rows[ix][50] = setTimezoneByWasId(data.rows[ix][50], data.rows[ix][1]);
        }
    }

    if (isTimezoneData !== true) {
        return;
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.ACTIVETXN,
        data: {
            header: header,
            data: data
        }
    });

    ix     = null;
    ixLen  = null;
    header = null;
    data   = null;
}

function imxwsOnActivity(header, data) {
    var ix, ixLen;
    // Debug Code
    if (ImxPacketDebug.Activity.P === true) {
        try {
            for (ix = 0; ix < data.rows.length; ix++) {
                console.debug(data.rows[ix]);
            }
        } catch (e) {
            console.debug('%c' + e.message, 'color:red;');
        }
    }

    for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
        data.rows[ix][0] = setTimezoneByWasId(data.rows[ix][0], data.rows[ix][3]);
    }

    if (isTimezoneData !== true) {
        return;
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.ACTIVITY,
        data: {
            header: header,
            data: data
        }
    });

    ix     = null;
    ixLen  = null;
    header = null;
    data = null;
}

function imxwsOnAlarmHistory(header, data) {
    var ix, ixLen;
    // Debug Code
    if (ImxPacketDebug.Alarm.P === true) {
        try {
            for (ix = 0; ix < data.rows.length; ix++) {
                console.debug(data.rows[ix]);
            }
        } catch (e) {
            console.debug(header,'color:red;');
            console.debug('%c' + e.message, 'color:red;');
        }
    }

    for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
        if (typeof data.rows[ix][0] === 'number' && isFinite(data.rows[ix][0])) {
            data.rows[ix][0]  = setTimezoneByWasId(data.rows[ix][0],  data.rows[ix][3]);
        }
    }

    onAlarm(data);

    ix     = null;
    ixLen  = null;
    data   = null;
}

function imxwsOnJVMGCStat(header, data) {
    var ix, ixLen;
    for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
        if (typeof data.rows[ix][0] === 'number' && isFinite(data.rows[ix][0])) {
            data.rows[ix][0] = setTimezoneByWasId(data.rows[ix][0], data.rows[ix][1]);
        }
    }

    if (isTimezoneData !== true) {
        return;
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.JVM_GC_STAT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * Current Not Used
 *
 * @param header
 * @param data
 */

/** 현재 사용하지 않는 함수 주석처리.
function imxwsOnJVMGCMax(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.JVM_GC_MAX,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}
 */

function imxwsOnDBCPUUsage(header, data) {
    if (typeof data.rows[0][0] === 'number' && isFinite(data.rows[0][0])) {
        data.rows[0][0]  = setTimezoneByWasId(data.rows[0][0],  data.rows[0][1]);
    }

    if (isTimezoneData !== true) {
        return;
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.DB_CPU,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

function imxwsOnDBStat(header, data) {
    // Debug Code
    var ix;
    if (ImxPacketDebug.DBStat.P === true) {
        try {
            for (ix = 0; ix < data.rows.length; ix++) {
                console.debug(data.rows[ix]);
            }
        } catch (e) {
            console.debug('%c' + e.message, 'color:red;');
        }
    }

    if (typeof data.rows[0][0] === 'number' && isFinite(data.rows[0][0])) {
        data.rows[0][0]  = setTimezoneByWasId(data.rows[0][0],  data.rows[0][1]);
    }

    if (isTimezoneData !== true) {
        return;
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.DB_STAT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 프로세스 모니터 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnProcessMonitor(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.PROCESS,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 프로세스 감시 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnProcessStatus(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.PROCESS_STATUS,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 락 정보 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnLockInfo(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.LOCK,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * Packet Data Columns
 * 0: "server_type"
 * 1: "Was_ID"
 * 2: "Was_Name"
 * 3: "Region"
 * 4: "Group_Name"
 * 5: "Sub_Group_Name"
 *
 * ex)
 * [1, 243, "UNDEFINED", "", "", ""]
 * [1, 113, "L113", "", "", ""]
 */
function imxwsOnServiceInfo(header, data) {

    console.debug('%cExecute OnServiceInfo', 'color:blud;');
    console.debug(data);

    retryTargetWasServer(data);

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.SERVICE,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * WAS Connection Pool 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnPoolMonitor(header, data) {
    // Debug Code
    var ix;
    if (ImxPacketDebug.Pool.P === true) {
        try {
            for (ix = 0; ix < data.rows.length; ix++) {
                console.debug(data.rows[ix]);
            }
        } catch (e) {
            console.debug('%c' + e.message, 'color:red;');
        }
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.CONN_POOL,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/** 현재 사용하지 않는 함수 주석처리.
function imxwsOnWasTPS(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WAS_TPS,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}
 */

/**
 * WAS ID 발급/회수 상태를 보내주는 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnAutoIdStatus(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.AUTO_ID_STATUS,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * WAS 일일 정보(방문자, 실행건수, 동시접속자 수)를 보내주는 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnWasMonitorDaily(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WAS_MONITOR,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 토폴로지 뷰에서 토폴로지 화면 구성을 하는 토폴로지 정보 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTopology(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TOPOLOGY,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 토폴로지 뷰에서 3초 단위로 보여지는 토폴로지 카운트 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTopologyCount(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TOPOLOGY_CNT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * TP 모니터링 - TP SVT 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTpSvrStat(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TP_SVR_STAT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * TP 모니터링 - TP SVR Proc 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTpSvrProcStat(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TP_SVR_PROC_STAT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * TP 모니터링 - TP SVC Stat 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTpSvcStat(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TP_SVC_STAT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * TP 모니터링 - TP 클라이언트 정보 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTpClientInfo(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TP_CLIENT_INFO,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * Tuxedo 모니터링 - Tux Stat 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTuxStat(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TUX_STAT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * Tuxedo 모니터링 - Tux Server 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTuxServer(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TUX_SERVER,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * Tuxedo 모니터링 - Tux Service 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTuxService(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TUX_SERVICE,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * Tuxedo 모니터링 - Tux QUEUE 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTuxQueue(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TUX_QUEUE,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * Tuxedo 모니터링 - Tux Client 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnTuxClient(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.TUX_CLIENT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 웹 모니터링 - WebToB SI 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnWebToBSi(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WEB_WTB_CMD_SI,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 웹 모니터링 - WebToB CI 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnWebToBCi(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WEB_WTB_CMD_CI,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 웹 모니터링 - 웹 액티브 트랜잭션 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnWebActiveDetail(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WEB_ACTIVE_DETAIL,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 웹 모니터링 - OS CPU, Memory 지표 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnOsStatExtended(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WEB_OS_STAT_EXTEND,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 웹 모니터링 - 응답 상태 코드 현황 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnResponseStatus(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WEB_RESPONSE_STATUS,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 웹 모니터링 - 웹 Activity 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnActivityFilterWS(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.WEB_ACTIVITY_FILTER,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * C Daemon 모니터링 - APIM OS STAT 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnAPIMOsStat(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.APIM_OS_STAT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 업무 모니터링 - 업무관점 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnEndBusinessStat(header, data) {
    var ix, ixLen, elapseTime;

    //게더에서 단위를 us로 주고 화면에서는 ms로 사용해야 해서 변환작업 추가.
    for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
        elapseTime = data.rows[ix][5] / 1000;

        data.rows[ix][5] = elapseTime;
    }

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.END_BUSINESS_STAT,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 업무 모니터링 - 업무관점 Activity 패킷 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnActivityFilterBusiness(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.ACTIVITY_FILTER_BUSINESS,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}

/**
 * 업무 모니터링 - 업무관점 방문자 수 데이터
 *
 * @param {object} header
 * @param {object} data
 */
function imxwsOnEndBusinessVisitor(header, data) {

    this.postMessage({
        command: COMMAND.PACKET_DATA,
        key : COMMAND.END_BUSINESS_VISITOR,
        data: {
            header: header,
            data: data
        }
    });
    header = null;
    data = null;
}


function workerDestroy() {
    var ws, ix;
    if (realTimeWS) {
        for (ix = 0; ix < realTimeWSList.length; ix++) {
            ws = realTimeWSList[ix];
            realTimeWS[ws].close();
            delete realTimeWS[ws];
        }
    }

    delete this.alarmStats;
    delete this.alarmData;
    delete this.wasTrendChartData;
    delete this.wasTrendChartLog;
    delete this.gcTrendChartData;
    delete this.option;
    delete this.serverStatus;

    this.close();
}

function initData() {
    this.alarmStats = [];
    this.alarmData  = [];

    deepDelete(this.wasTrendChartData);
    this.wasTrendChartData = {
        timeRecordWasId: null,
        timeRecordData: []
    };

    deepDelete(this.wasTrendChartLog);
    this.wasTrendChartLog = {};

    deepDelete(this.gcTrendChartData);
    this.gcTrendChartData = {};

    deepDelete(this.option);
    this.option = {
        useStat: {},
        alarmListInfo : {},
        alarm : {
            range          : 10 * 60 * 1000,
            interval       : 60 * 1000,
            curStartPoint  : 0,
            curInsertIndex : -1,
            curMaxValue    : 100,
            alarmHistoryFirstTime: new Date().setSeconds(0, 0)
        }
    };

    deepDelete(this.serverStatus);
    this.serverStatus = {
        Received : false,
        data: {
            WAS: {},
            DB : {},
            CD : {},
            WebServer: {}
        }
    };
}


function deepDelete(target) {
    if (!target) {
        return;
    }

    var keys, variableKey, ix, ixLen;

    keys = Object.keys(target);
    for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
        variableKey = keys[ix];

        if (target.hasOwnProperty(variableKey)) {
            delete target[variableKey];
        }
    }
}


/**
 * 알람 데이터를 파싱해서 전송
 *
 * 알람 데이터 항목
 *    0: "Time"
 *    1: "Server_Type"
 *    2: "Server_Type_Name"
 *    3: "Server_ID"
 *    4: "Server_Name"
 *    5: "Alert_Type"
 *    6: "Alert_Level"
 *    7: "Alert_Resource_Name"
 *    8: "Alert_Resource_ID"
 *    9: "Alert_Value"
 *    10: "Alert_Object_ID"
 *    11: "Description"
 *    12: "tier_id"
 *    13: "business_id"
 *    14: "warning"
 *    15: "critical"
 *    16: "customData"
 *
 * AI 알람 데이터 항목 (참고)
 *    3: "Server_ID" --> 모듈 타입으로 표현
 *    (FCST_WAS = 1, FCST_DB = 2, FCST_TXN = 3, ADUMA_WAS = 4, ADUMA_DB = 5, ADCLST_TXN = 6, FCST_BIZ = 7)
 *    4: "Server_Name" --> (PJS 에서 server_id 값을 통해서 처리해주는 값이라 데이터가 의미가 없음.)
 *    8: "Alert_Resource_ID" --> (ADCLST_TXN = 6 인 경우, tid값이 들어옴.)
 *    10: "Alert_Object_ID" --> 타겟(모듈 타입)에 따른 id값으로 들어옴.
 *    (WAS인 경우 was_id, DB인 경우 db_id, TXN인 경우 txn_id, BIZ인 경우 biz_id)
 *    11: "Description" --> (ADCLST_TXN = 6 인 경우, 알람이 발생한 메소드명이 들어옴.)
 *    14: "warning" --> FCST(부하예측)인 경우 알람이 발생한 지표의 lower값이 들어옴.
 *    15: "critical" --> FCST(부하예측)인 경우 알람이 발생한 지표의 upper값이 들어옴.
 *    16: "customData" --> FCST(부하예측)인 경우 예측 시간값이 들어옴.
 *
 * @param {Object} adata
 */
function onAlarm(adata) {

    var d;
    var time;
    var server_type;
    var server_id;
    var server_name;
    var alert_type;
    var alert_level;
    var alert_resource_name;
    var alert_resource_ID;
    var value;
    var target_id;
    var descr;
    var tier_id, business_id, warning, critical, customData;

    var levelType = null;
    var result    = [];

    var ix, ixLen;

    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
        d = adata.rows[ix];

        time                = d[0];
        server_type         = d[1]; // 1:WAS, 2:DB, 3:WebServer, 9: Host, 15: APIM, 20: BIZ, 30: AI
        server_id           = d[3];
        server_name         = d[4];
        alert_type          = d[5];
        alert_level         = d[6];
        alert_resource_name = d[7];
        alert_resource_ID   = d[8];
        value               = d[9];
        descr               = d[11];

        if (d.length > 12) {
            tier_id     = d[12];
            business_id = d[13];
            warning     = d[14];
            critical    = d[15];
            customData  = d[16];
        }

        // 0 - normal, 1 - warning, 2 - critical
        switch (alert_level) {
            case 0:
                levelType = 'Normal';
                break;
            case 1:
                levelType = 'Warning';
                break;
            case 2:
                levelType = 'Critical';
                break;
            default:
                break;
        }

        if (server_type === 30) {
            target_id = d[10];
            result[result.length] = [
                time,                   // 0
                server_type,            // 1
                target_id,              // 2
                server_id,              // 3
                alert_resource_name,    // 4
                value,                  // 5
                alert_level,            // 6
                levelType,              // 7
                alert_type,             // 8
                descr,                  // 9
                alert_resource_ID,      // 10
                tier_id,                // 11
                business_id,            // 12
                warning,                // 13
                critical,               // 14
                customData              // 15
            ];
        } else {
            result[result.length] = [
                time,                   // 0
                server_type,            // 1
                server_id,              // 2
                server_name,            // 3
                alert_resource_name,    // 4
                value,                  // 5
                alert_level,            // 6
                levelType,              // 7
                alert_type,             // 8
                descr,                  // 9
                alert_resource_ID,      // 10
                tier_id,                // 11
                business_id,            // 12
                warning,                // 13
                critical,               // 14
                customData              // 15
            ];
        }

    }

    serverStatus.Received = true;

    var idx;
    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {

        d = null;
        d = adata.rows[ix];

        // SERVER TYPE: 1: WAS, 2: DB, 3:WEB-SERVER, 9: HOST, 15: APIM

        switch (d[1]) {
            case 1: // WAS
                if (!serverStatus.data['WAS']) {
                    serverStatus.data['WAS'] = {};
                }
                if ((d[7] === 'License' && +d[9] < 0) ||
                    (d[7] === 'Server Boot' && +d[9] < 0)) {
                    serverStatus.data['WAS'][d[3]] = 'License';

                    idx = expiredServer.indexOf(d[3]);
                    if (idx === -1) {
                        expiredServer.push(d[3]);
                    }
                } else if (d[7] === 'License' && +d[9] >= 0) {
                    idx = expiredServer.indexOf(d[3]);
                    if (idx !== -1) {
                        expiredServer.splice(idx, 1);
                    }
                    if (serverStatus.data['WAS'][d[3]] !== 'Disconnected' &&
                        serverStatus.data['WAS'][d[3]] !== 'Server Down' ) {
                        serverStatus.data['WAS'][d[3]] = 'Connected';
                    }

                } else if (d[7] === 'Server Boot' && +d[9] >= 0) {
                    idx = expiredServer.indexOf(d[3]);
                    if (idx !== -1) {
                        expiredServer.splice(idx, 1);
                    }
                    serverStatus.data['WAS'][d[3]] = d[7];

                } else {
                    idx = expiredServer.indexOf(d[3]);
                    if (idx !== -1) {
                        if (d[7] === 'Disconnected' || d[7] === 'Server Down' ) {
                            serverStatus.data['WAS'][d[3]] = d[7];
                        }
                    } else {
                        serverStatus.data['WAS'][d[3]] = d[7];
                    }
                }
                break;

            case 2: // DB
                if (!serverStatus.data['DB']) {
                    serverStatus.data['DB'] = {};
                }
                serverStatus.data['DB'][d[3]] = d[7];
                break;

            case 3: // WEB-SERVER
                if (!serverStatus.data['WebServer']) {
                    serverStatus.data['WebServer'] = {};
                }
                serverStatus.data['WebServer'][d[3]] = d[7];
                break;

            case 15: // APIM
                if (!serverStatus.data['CD']) {
                    serverStatus.data['CD'] = {};
                }
                serverStatus.data['CD'][d[3]] = d[7];
                break;

            default:
                break;
        }
    }

    if (result.length > 0) {
        for (ix = 0, ixLen = result.length; ix < ixLen; ix++) {
            this.postMessage({
                command: COMMAND.PARSING_DATA,
                key: COMMAND.ALARM,
                data: {
                    alarm   : result[ix],                      // 가공한 알람
                    status  : serverStatus                     // 서버 상태 정보
                }
            });
        }
    }

    d            = null;
    adata        = null;
    time         = null;
    server_type  = null;
    server_id    = null;
    server_name  = null;
    alert_type   = null;
    alert_level  = null;
    alert_resource_name = null;
    alert_resource_ID   = null;
    value      = null;
    descr      = null;
    levelType  = null;
    result     = null;

}

/**
 * 0: "server_type"
 * 1: "Was_ID"
 * 2: "Was_Name"
 * 3: "Region"
 * 4: "Group_Name"
 * 5: "Sub_Group_Name"
 */

/** 현재 사용하지않는 함수 주석처리.
function imxwsServiceInfo() {
    realTimeWS.Activity.ServiceInfo( function (AHeader, AData) {
        var result, logData;
        if (AData !== undefined && AData !== null) {
            if (typeof AData === "string") {
                var AJSONData = JSON.parse(AData);
                result = AJSONData.rows;
                AJSONData = null;
            } else {
                result = AData.rows;
            }
            logData = [];
            for (var ix = 0, ixLen = result.length; ix < ixLen; ix++) {
                logData[logData.length] = {
                    'Server Type' : result[ix][0],
                    'WAS ID' : result[ix][1],
                    'WAS Name' : result[ix][2],
                    'Region' : result[ix][3],
                    'Group Name' : result[ix][4]
                };
            }
            if (logData.length > 0) {
                console.groupCollapsed('%c = IMXWS Service Info = ', 'background:black;color:white;');
                console.table(logData);
                console.groupEnd();
            }
        }

        logData = null;
        result = null;
        AData = null;
    });
}
 */

/**
 * 0: "Time"
 * 1: "Server_Type"
 * 2: "Server_Type_Name"
 * 3: "Server_ID"
 * 4: "Server_Name"
 * 5: "Alert_Type"
 * 6: "Alert_Level"
 * 7: "Alert_Resource_Name"
 * 8: "Alert_Resource_ID"
 * 9: "Alert_Value"
 * 10: "Alert_Object_ID"
 * 11: "Description"
 */

/** 현재 사용하지 않는 함수 주석처리.
function imxwsAlarmHistory() {

    realTimeWS.Activity.AlarmHistory( function (AHeader, AData) {
        var result, logData, time;
        if (AData !== undefined && AData !== null) {
            if (typeof AData === "string") {
                var AJSONData = JSON.parse(AData);
                result = AJSONData.rows;
                AJSONData = null;
            } else {
                result = AData.rows;
            }
            logData = [];
            for (var ix = 0, ixLen = result.length; ix < ixLen; ix++) {
                time = new Date(result[ix][0]);
                logData[logData.length] = {
                    'Time' : time.getFullYear()+'-'+time.getMonth() +'-'+time.getDate()+' '+
                             time.getHours()+':'+time.getMinutes()+':'+time.getSeconds(),
                    'Server Type' : result[ix][1],
                    'Server Type Name' : result[ix][2],
                    'Server ID' : result[ix][3],
                    'Server Name' : result[ix][4],
                    'Alert Type' : result[ix][5],
                    'Alert Level' : result[ix][6],
                    'Alert Name' : result[ix][7],
                    'Alert Value' : result[ix][9],
                    'Description' : result[ix][11]
                };
            }
            if (logData.length > 0) {
                console.groupCollapsed('%c = IMXWS Alarm History = ', 'background:black;color:white;');
                console.table(logData);
                console.groupEnd();
            }
        }

        time = null;
        logData = null;
        result = null;
        AData = null;
    });
}
 */

/**
 * 0: "Region"
 * 1: "Group_Name"
 * 2: "Sub_Group_Name"
 * 3: "Group_ID"
 */

// host group info 를 가져오는 함수.
/** 현재 사용하지 않는 함수 주석처리.
function imxwsHostGroupInfo() {

    realTimeWS.Activity.HostGroupInfo( function (AHeader, AData) {
        var result;

        if (!AData) {
            if (typeof AData === "string") {
                var AJSONData = JSON.parse(AData);
                result = AJSONData.rows;
                AJSONData = null;
            } else {
                result = AData.rows;
            }

            for (var ix = 0, ixLen = result.length; ix < ixLen; ix++) {
                console.debug(result[ix]);
            }
        }

        result = null;
        AData = null;
    });
}
 */

function imxAddPacket(pktNumber) {
    switch (pktNumber) {
        case PKT_CLIENT_RES_ACTIVITY_CLIENT_IP:
            realTimeWS.Activity.AddReceivePacket(pktNumber);
            break;
        case PKT_CLIENT_RES_PROCESS_MONITOR:
        case PKT_TOPOLOGY_INFO:
        case PKT_TOPOLOGY_COUNT:
            realTimeWS.Others.AddReceivePacket(pktNumber);
            break;
        default:
            break;
    }
}

function imxRemovePacket(pktNumber) {
    switch (pktNumber) {
        case PKT_CLIENT_RES_ACTIVITY_CLIENT_IP:
            realTimeWS.Activity.RemoveReceivePacket(pktNumber);
            break;
        case PKT_CLIENT_RES_PROCESS_MONITOR:
        case PKT_TOPOLOGY_INFO:
        case PKT_TOPOLOGY_COUNT:
            realTimeWS.Others.RemoveReceivePacket(pktNumber);
            break;
        default:
            break;
    }
}

/** 현재 사용하지 않는 함수 주석처리.
function checkReceiveServerInfo() {
    var infoData = [];

    for (var ix = 0, ixLen = packetReceiveServer.WAS.Connect.length; ix < ixLen; ix++) {
        infoData.push({
            'Name'     : packetReceiveServer.WAS.Connect[ix]._Name,
            'Activity' : packetReceiveServer.WAS.Connect[ix].Activity,
            'ActiveTxn': packetReceiveServer.WAS.Connect[ix].ActiveTxn,
            'WasStat'  : packetReceiveServer.WAS.Connect[ix].WasStat,
            'Alarm'    : packetReceiveServer.WAS.Connect[ix].Alarm,
            'Others'   : packetReceiveServer.WAS.Connect[ix].Others
        });
    }
    if (ixLen > 0) {
        console.table(infoData);
    }
    infoData = null;
}
 */

function setTransactionFilters(filterData) {
    realTimeWS.Activity.RunJSONObject(filterData, function(header, data) {
        console.debug(data);
    });
}


function getTopologyInfo() {
    realTimeWS.Others.RunJSONObject({
        'type': 'function',
        'command': 'get_topology_info',
        'value': ''
    }, function() {
    });
}

function sendEndConfig() {
    var ws, ix, ixLen;
    for (ix = 0, ixLen = realTimeWSList.length; ix < ixLen; ix++) {
        ws = realTimeWSList[ix];

        if (ws !== 'WWS') {
            realTimeWS[ws].RunJSONObject({
                'type': 'config',
                'command': 'set_end_was_info'
            });
        }
    }
}


/**
 * 실시간 Packet의 어떤 항목을 처리하기 위한 소켓인지 서버에 전송
 */

/** 현재 사용하지 않는 함수 주석처리.
function setPacketProcessItems() {

    realTimeWS.Activity.RunJSONObject({
        type   : 'config',
        command: 'set_ws_name',
        value  : 'Activity'
    }, function() {
    });

    realTimeWS.ActiveTxn.RunJSONObject({
        type   : 'config',
        command: 'set_ws_name',
        value  : 'ActiveTransaction'
    }, function() { });

    realTimeWS.WasStat.RunJSONObject({
        type   : 'config',
        command: 'set_ws_name',
        value  : 'WasStat'
    }, function() { });

    realTimeWS.Alarm.RunJSONObject({
        type   : 'config',
        command: 'set_ws_name',
        value  : 'Alarm,JVMGC,DBCPUUsage,DBStat,ProcessStatus'
    }, function() { });

    realTimeWS.Others.RunJSONObject({
        type   : 'config',
        command: 'set_ws_name',
        value  : 'ProcessMonitor,LockInfo,ServiceInfo,PoolMonitor,WasMonitorDaily'
    }, function() { });
}
 */

/**
 * @note IMXWS (Web Socekt) Open Event
 * 연결된 실시간 소켓의 상태로 체크. 실시간 소켓 모두 open 되어 있으면 Plotform.JS 정상이라고 판단
 * @constructor
 */
function imxwsOpenEvent() {
    realTimeWSStatus[this.wsName] = true;
    var cnt = 0;
    var wsList = Object.keys(realTimeWSStatus);
    var ix, ixLen;

    for (ix = 0, ixLen = wsList.length; ix < ixLen; ix++) {
        if (realTimeWSStatus[wsList[ix]]) {
            cnt++;
        }
    }

    // 소켓이 모두 open 상태이고 platform js 가 다운상태일 경우
    if (cnt === wsList.length && ! platformJSStatus) {
        postMessage({
            command: COMMAND.PARSING_DATA,
            key: COMMAND.PLATFORMJS_STATUS,
            data: 1
        });

        platformJSStatus = true;
    }
}

/**
 * @note IMXWS (Web Socekt) Close Event
 * 연결된 실시간 소켓의 상태로 체크. 실시간 소켓 갯수 -1 만큼 close 되면 Plotform.JS 다운이라고 판단
 * @constructor
 */
function imxwsCloseEvent() {
    realTimeWSStatus[this.wsName] = false;
    var cnt = 0;
    var wsList = Object.keys(realTimeWSStatus);
    var ix, ixLen;

    for (ix = 0, ixLen = wsList.length; ix < ixLen; ix++) {
        if (! realTimeWSStatus[wsList[ix]]) {
            cnt++;
        }
    }

    if (cnt >= wsList.length - 1 && platformJSStatus) {
        postMessage({
            command: COMMAND.PARSING_DATA,
            key: COMMAND.PLATFORMJS_STATUS,
            data: 0
        });

        platformJSStatus = false;
    }
}