var Comm = {};

window.requestAnimFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };

window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

/**
 * @note 상위( 로그인 ) 화면에서 받은 정보를 셋팅한다.
 */
// 정상 로그인 이후
var cfg, info, myLang;
if ( (window.parent.mainApp && window.parent.mainApp.getConfig) || (window.opener && window.opener.mainApp) ) {
    if (window.parent.mainApp && window.parent.mainApp.getConfig) {
        Comm.pMainApp = window.parent.mainApp;
    } else {
        Comm.pMainApp = window.opener.mainApp;
    }
    info = Comm.pMainApp.getConfig();

    cfg = {
        login : info.config.login
    };

    Comm.config = cfg;

    myLang = String(localStorage.getItem('Intermax_MyLanguage'));
    if (myLang === 'null') {
        myLang = null;
    }
    window.nation = myLang || window.parent.nation;

    // 국가별 스타일 추가 설정
    switch (window.nation) {
        case 'en'       :
            document.body.setAttribute('lang', 'en');
            break;
        case 'ko'       :
            document.body.setAttribute('lang', 'ko');
            break;
        case 'ja'       :
            document.body.className += ' ja';
            document.body.setAttribute('lang', 'ja');
            break;
        case 'zh-CN'    : break;
        default         : break;
    }

} else {
    if (!Comm.config) {
        Comm.config = {};
    }
    if (!cfg) {
        cfg = Comm.config;
        cfg.login = {};
        cfg.login.permission = {};
        cfg.login.user_id = '';
        cfg.login.login_id = '';
        cfg.login.password = '';
        cfg.login.user_name = '';
        cfg.login.admin_check = -1;
        cfg.login.permission.kill_thread = -1;
        cfg.login.permission.system_dump = -1;
        cfg.login.permission.memory_leak = -1;
        cfg.login.permission.property_load = -1;
        cfg.login.permission.bind = -1;
        cfg.login.wasInfoObj = {};   //1506.8 add (min)
    }
}

var Repository = {
    instances         : [],    // 인스턴스 이름
    sgaframes         : [],    // RealTime sgaStatus Frames
    activeSessionFrame: [],    // session Frames
    onProcessListDraw : null,  // Process list draw event
    racGroup          : {},
    reqSocketCount    : 0,
    onFrameDraw       : null,

    alarmListInfo     : {},
    alarmStatsData    : {},
    alarmServers      : [],
    trendChartData    : {},
    trendDataLog      : {},
    statListData      : {},     // trendchart 의 statlist 에 필요한 데이터

    tmadminChartData  : {},
    tmadminDataLog    : {},

    TP3SecTrendData   : {},
    TP3SecTrendLog    : {},

    TuxTrendData      : {},
    TuxTrendDataLog   : {},

    responseStatus    : {},
    responseStatusLog : {},

    WasSessionData    : {},
    WasSessionDataLog : {},

    OsStatExtend      : {},
    OsStatExtendLog   : {},

    WebToBSIData      : {},
    WebToBSIDataLog   : {},

    WebToBCIData      : {},
    WebToBCIDataLOg   : {},

    WebTrendData      : {},
    WebTrendDataLog   : {},

    CDTrendData       : {},
    CDTrendDataLog    : {},

    BizData           : {},     // 업무 관점 패킷 데이터
    BizTrendData      : {},     // 업무 관점 패킷 데이터 (성능 지표 차트)
    BizTrendDataLog   : {},     // 업무 관점 패킷 데이터 (성능 지표 차트 로그)

    Activity          : {},     // 실시간 패킷 데이터
    ActiveTxn         : {},
    WasStat           : {},     // 실시간 패킷 데이터
    WasStatChart      : {},
    WasMonitorDaily   : {},
    DBCPU             : {},     // 실시간 패킷 데이터
    DBCpuLastTime     : {},     // DB CPU 패킷 마지막 시간
    DBStat            : {},     // 실시간 패킷 데이터
    DBStatLastTime    : {},     // DB Stat 패킷 마지막 시간
    JVMGCStat         : {},
    JVMGCStatChart    : {},
    JVMGCMax          : {},
    Lock              : {},
    Service           : {},
    Alarm             : {},     // 실시간 알람 데이터
    processStatus     : {},
    processMonitor    : {},
    Others            : {},

    txnError          : {},

    ActivityServerIP  : [],     // 실시간 패킷 데이터 Activitiy Server IP
    ActivityIPAddTime : [],     // Activitiy IP 시간

    AILoadPredict     : {}
};

Repository.trendChartData.timeRecordData   = [];
Repository.tmadminChartData.timeRecordData = [];
Repository.TuxTrendData.timeRecordData     = [];
Repository.responseStatus.timeRecordData   = [];
Repository.OsStatExtend.timeRecordData     = [];
Repository.WebTrendData.timeRecordData     = [];
Repository.CDTrendData.timeRecordData      = [];


////////////////////////////////////////////////////////////////////////////////
if (window.realTimeWS) {
    window.realTimeWS.workerDestroy();
}

var WS = new IMXWS();
var WS2 = new IMXWS();
var realTimeWS = null;

if (window.maxgaugeType === 'RTM') {
    var imxwsWorkerPath = '../common/WebSocketWorker.js';

    realTimeWS = new IMXWSWorker(imxwsWorkerPath);
}

//////////////////////////////////////////////////////////////////////////////

/**
 * @note 각 index.html 의 header 영역의 script 에 타입이 설정되어 있다
 */

/** 현재 사용하지않는 코드 주석
var Maxgauge = {
    PA      : 'PA',
    RTM     : 'RTM',
    CONFIG  : 'CONFIG',
    POPUP   : 'POPUP'
};
 */

/**
 * @note cross browsing
 *
 * ie 에서 new Date('2014-11-24 00:00:00') 동작이 안됨( - 가 / 로 변경되어야 함)
 **/
var nDate;
if (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') === -1) {
    // etc
} else {
    // ie

    // 기존 Date 객체 복사
    nDate = Date;

    window.Date = function(a, b, c, d, e, f) {
        if (arguments.length === 0) {
            return new nDate();

        } else if (arguments.length > 1) {
            return new nDate(a, b || null, c || null, d || null, e || null, f || null);

        } else {
            if (arguments[0] && arguments[0].indexOf && arguments[0].indexOf('-')) {
                arguments[0] = arguments[0].replace(/-/g, '/');
            }
            return new nDate(arguments[0]);
        }
    };

    Date.now = nDate.now;
    Date.parse = nDate.parse;
    Date.UTC = nDate.UTC;

    Number.prototype.isInteger = function() {
        return (this ^ 0) === +this;
    };
}

Comm.timeZoneOffset = new Date().getTimezoneOffset();

