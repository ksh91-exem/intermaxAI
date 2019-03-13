Ext.define('rtm.src.rtmCommon', {

    realtime: {
        flags                               : [false, false, false, false, false, false, false, false, false, false, false, false, false,
            false, false, false, false],

        base                                : null,
        self                                : null,
        maintab                             : null,
        RemoteDiff                          : 0,
        currentLanguage                     : '',
        tabTitle                            : '',       /* Service Stat, WAS Stat, GC Stat, Active Transaction */

        lastestTime                         : 0,
        serverLoggingTime                   : 0,

        GroupWasMode                        : false,
        WasMode                             : false,
        WasModeSelected                     : [],       /* Selected list */
        timeRecordWasId                     : null,     /* 시간의 기준이 되는 WASID */
        timeDataEx                          : [],
        timeRecordData                      : [],       /* Performance Stat & GC Stat 에서 사용되는 시간 데이터 */
        /* WAS_STAT 패킷으로 들어오는 가장 큰 시간값을 기준으로 생성(rtmPerformanceStat.js) */

        ServiceStatTimer                    : null,

        /* VIEW */
        ViewMode                            : null,     /* ViewWasMode or ViewGroupMode pointer */
        ViewHost                            : null,
        ViewWasMode                         : null,
        ViewGroupMode                       : null,
        ViewGroupWasMode                    : null,
        ViewDB                              : null,
        ViewTransactionMonitor              : null,
        ViewTransactionscatter              : null,
        ViewServiceStat                     : null,
        ViewGCStat                          : null,
        ViewActiveTransaction               : null,
        ViewLockTree                        : null,
        ViewRemoteTree                      : null,
        ViewAlert                           : null,

        DataWasStat                         : {},       /* 실시간 Was Stat 데이터 */
        DataWasStatArr                      : {},       /* Was Stat 데이터 이력 */
        DataWasExecute                      : {},
        DataGCStat                          : {},       /* 실시간 GC Stat 데이터 */
        DataActiveTransaction               : {},
        DataTransactionRoot                 : {},
        DataLockTree                        : {},
        DataRemoteTree                      : {},
        DataDBCPU                           : {},       /* 실시간 DB CPU 데이터 */
        DataDBStat                          : {},       /* 실시간 DB 상테 데이터 */

        DataAlert                           : {},       /* 실시간 이벤트 데이터 */
        DataAlertHost                       : {},       /* Host 이벤트 발생 상태 */
        DataAlertDB                         : {},       /* DB 이벤트 발생 상태 */

        activeTabTitle                      : '',       /* Transaction, LockTree, RemoteTree */
        activityLimit                       : 0,
        activityInterval                    : 2000,
        txnMonitorLimit                     : 100,      /* Transaction Monitor Y Limit */
        ActiveTxnStateArr                   : [],
        ActiveTxnGrid                       : null,
        ProcessMonitor                      : null,
        allHostWindow                       : null,

        login                               : {},       /* 사용자 로그인 관련 정보 */
        WasNames                            : [],       /* 사용자가 선택한 서비스안의 모든 WASNAME */
        WasNameList                         : [],       /* 모든 WASNAME */
        WasNameColors                       : [],       /* WAS Icon Color */
        SelectedGroupWasNames               : [],       /* 사용자가 선택한 그룹의 모든 WASNAME */
        SelectedGroupName                   : '',       /* 그룹모드에서 사용자가 선택한 그룹명 */
        SelectedGroupWasList                : [],       /* 사용자가 선택한 그룹의 WASID 목록 */
        SelectedGroupWasNameList            : [],       /* 사용자가 선택한 그룹의 WASName 목록 */
        BackupGroupWasList                  : [],       /* 사용자가 선택한 그룹안의 모든 WASID를 백업하는 배열 */
        HostRelWAS                          : [],       /* 전체 호스트-WAS 배열 */
        HostRelWeb                          : [],       /* 전체 호스트-WAS 배열 */
        HostRelServer                       : [],       /* 전체 호스트-Server 배열 */
        TPList                              : [],       /* TP List: [hostname, wasid, tp] */
        TPHostList                          : [],       /* TP Host List */
        TPWasList                           : [],       /* TP WAS List */
        TuxList                             : [],       /* Tuxedo List: [hostname, wasid, tux] */
        TuxHostList                         : [],       /* Tuxedo Host List */
        TuxWasList                          : [],       /* Tuxedo WAS List */
        SelectedGroupHostList               : [],       /* 사용자가 선택한 그룹안의 모든 WASID들이 등록중인 호스트 배열 */
        /* realtime.HostRelWAS 에서 WASID로 검색해서 Host 목록을 받는다 */

        WebList                             : [],       /* WEB List: [hostname, wsid] */
        WebHostList                         : [],       /* WEB Host List */
        WebIdList                           : [],       /* WEB ID List */

        CDList                              : [],       /* C Daemon List: [hostname, serverid] */
        CDHostList                          : [],       /* C Daemon Host List */
        CDIdList                            : [],       /* C Daemon ID List */

        BulletList                          : [],       /* 화면에 표시되고 있는 총알 화면 ID 배열 */

        syntaxEditorList                    : [],
        canvasChartList                     : [],

        psWasStatList                       : [],       /* Performance Stat Variants */

        receiveDBPacket                     : false,    /* DB관련된 패킷이 들어오면 true */

        thrCount                            : {},       /* throughput에서 사용되는 WAS별 ResponseCount 객체 */

        expiredServer                       : [],       /* 라이센스가 만료된 서버 ID */

        selectedTPNames                     : [],       /* 사용자가 선택한 모든 TP NAME */
        selectedTuxNames                    : [],       /* 사용자가 선택한 모든 Tuxedo NAME */
        selectedWebNames                    : [],       /* 사용자가 선택한 모든 WEB NAME */
        selectedCDNames                     : [],       /* 사용자가 선택한 모든 C Daemon NAME */

        eteMonitorServerList                : [],       /* E2E 모니터링 화면에서 보여지는 서버 ID 배열 */
        eteMonitorServerInfo                : [],       /* E2E 모니터링 화면에서 보여지는 서버 정보 */
        eteSelectedServerList               : [],       /* E2E 모니터링 화면에서 선택된 서버 ID 배열 */
        eteSelectedServerNames              : [],       /* E2E 모니터링 화면에서 선택된 서버명 배열 */

        GroupModeSelected: {
            groupname  : '',
            groupindex : 0
        },

        ActiveTxnRefreshCheck: {
            Transaction : true,
            LockTree    : true,
            RemoteTree  : true
        },

        bottomStatArea: {
            width  : 0,
            height : 0
        },

        // 서버 타입 및 ID 별 색상 정보 - key(Server ID), Value(색상)로 구성
        serverColorMap : {
            WAS : {},
            TP  : {},
            TUX : {},
            WEB : {},
            CD  : {},
            E2E : {}
        },

        normalColor   : '#42A5F6',
        warningColor  : '#FF9803',
        criticalColor : '#D7000F',

        defaultFontColor  : '#B0B3B8',
        warningFontColor  : '#FFD300',
        criticalFontColor : '#E42526',

        DefaultColors: [
            '#3ca0ff', '#90db3b', '#00c4c5', '#ffde00', '#ff7781',
            '#8470ff', '#75cd8e', '#48d1cc', '#fec64f', '#fe984f',
            '#0052ff', '#00a48c', '#83cfde', '#dfe32d', '#ff7d40',
            '#99c7ff', '#a5fee3', '#0379c9', '#eef093', '#ffa891',
            '#00c5cd', '#009bc7', '#cacaff', '#ffc125', '#df6264'
        ],

        Colors: [
            '#3ca0ff', '#90db3b', '#00c4c5', '#ffde00', '#ff7781',
            '#8470ff', '#75cd8e', '#48d1cc', '#fec64f', '#fe984f',
            '#0052ff', '#00a48c', '#83cfde', '#dfe32d', '#ff7d40',
            '#99c7ff', '#a5fee3', '#0379c9', '#eef093', '#ffa891',
            '#00c5cd', '#009bc7', '#cacaff', '#ffc125', '#df6264'
        ],

        GroupColors : {
            Base : [
                { id : 'Gray',  baseColor : '#ABAEB5' },
                { id : 'White', baseColor : '#555555' },
                { id : 'Black', baseColor : '#FFFFFF' }
            ],
            Group : ['#3CA0FF', '#90DB3B']
        },

        defaultSumChartColor: '#3ca0ff',

        themeType : {
            WHITE: 'White',
            BLACK: 'Black',
            GRAY : 'Gray'
        },

        barLineChartColor: ['#2b99f0', '#7fcd2a', '#F2C922', '#ea4d44'],

        dbChartColor: {
            down: '#898989'
        },

        lineChartColor: {
            WHITE: {
                label     : '#555555',
                gridLine  : '#F0F0F0',
                border    : '#CCCCCC'
            },
            BLACK: {
                label     : '#FFFFFF',
                gridLine  : '#525359',
                border    : '#81858A'
            },
            GRAY: {
                label     : '#ABAEB5',
                gridLine  : '#525359',
                border    : '#81858A'
            }
        },

        loadPredictChartColor: {
            now          : '#1d8efc',
            band         : '#c4cdd7',
            predictBand  : '#fed245',
            predictValue : '#fe496a',
            anomaly      : '#03c3c4'
        },

        //기본 차트 지표.
        defaultWasStatName: [
            {id: 'ACTIVE_USERS'   ,    name: common.Util.CTR('Active Users')},
            {id: 'ACTIVE_TRANSACTION', name: common.Util.CTR('Active Transactions')},
            {id: 'TPS',                name: common.Util.CTR('TPS')},
            {id: 'JVM_CPU_USAGE',      name: common.Util.CTR('JVM CPU Usage (%)')},
            {id: 'JVM_FREE_HEAP',      name: common.Util.CTR('JVM Free Heap (MB)')},
            {id: 'JVM_HEAP_SIZE',      name: common.Util.CTR('JVM Heap Size (MB)')},

            {id: 'JVM_USED_HEAP'  ,    name: common.Util.CTR('JVM Used Heap (MB)')},
            {id: 'JVM_MEM_SIZE'   ,    name: common.Util.CTR('JVM Memory Size (MB)')},
            {id: 'JVM_HEAP_USAGE' ,    name: common.Util.CTR('JVM Heap Usage (%)')},
            {id: 'ACTIVE_DB_SESSIONS', name: common.Util.CTR('Active DB Connections')},
            {id: 'DB_SESSIONS'    ,    name: common.Util.CTR('Total DB Connections')},
            {id: 'OS_CPU_SYS'     ,    name: common.Util.CTR('OS CPU Sys (%)')},
            {id: 'OS_CPU_USER'    ,    name: common.Util.CTR('OS CPU User (%)')},
            {id: 'OS_CPU_IO'      ,    name: common.Util.CTR('OS CPU IO (%)')},
            {id: 'OS_FREE_MEM'    ,    name: common.Util.CTR('OS Free Memory (MB)')},
            {id: 'OS_TOTAL_MEM'   ,    name: common.Util.CTR('OS Total Memory (MB)')},
            {id: 'TXN_ELAPSE'     ,    name: common.Util.CTR('Transaction Elapse Time (AVG)')}
        ],

        /* 모든 WAS Stat Name 목록. 예) obj = [{id: '', name: ''}] */
        InfoWasStatName: [
            {id: 'ACTIVE_TRANSACTION',  name: common.Util.CTR('Active Transactions')},
            {id: 'ACTIVE_DB_SESSIONS',  name: common.Util.CTR('Active DB Connections')},
            {id: 'ACTIVE_USERS'      ,  name: common.Util.CTR('Active Users')},
            {id: 'APP_SESSION'    ,     name: common.Util.CTR('Queue')},
            {id: 'DB_SESSIONS'    ,     name: common.Util.CTR('Total DB Connections')},
            {id: 'JVM_CPU_USAGE'  ,     name: common.Util.CTR('JVM CPU Usage (%)')},
            {id: 'JVM_FREE_HEAP'  ,     name: common.Util.CTR('JVM Free Heap (MB)')},
            {id: 'JVM_HEAP_SIZE'  ,     name: common.Util.CTR('JVM Heap Size (MB)')},
            {id: 'JVM_HEAP_USAGE' ,     name: common.Util.CTR('JVM Heap Usage (%)')},
            {id: 'JVM_THREAD_COUNT',    name: common.Util.CTR('JVM Thread Count')},
            {id: 'JVM_USED_HEAP'  ,     name: common.Util.CTR('JVM Used Heap (MB)')},
            {id: 'JVM_MEM_SIZE'   ,     name: common.Util.CTR('JVM Memory Size (MB)')},
            {id: 'JVM_GC_COUNT'   ,     name: common.Util.CTR('JVM GC Count')},
            {id: 'JVM_GC_TIME'    ,     name: common.Util.CTR('JVM GC Time (Sec)')},
            {id: 'OS_CPU_SYS'     ,     name: common.Util.CTR('OS CPU Sys (%)')},
            {id: 'OS_CPU_USER'    ,     name: common.Util.CTR('OS CPU User (%)')},
            {id: 'OS_CPU_IO'      ,     name: common.Util.CTR('OS CPU IO (%)')},
            {id: 'OS_FREE_MEM'    ,     name: common.Util.CTR('OS Free Memory (MB)')},
            {id: 'OS_RCV_PACKETS' ,     name: common.Util.CTR('OS Receive Packets')},
            {id: 'OS_SEND_PACKETS',     name: common.Util.CTR('OS Send Packets')},
            {id: 'OS_TOTAL_MEM'   ,     name: common.Util.CTR('OS Total Memory (MB)')},
            {id: 'SQL_FETCH_COUNT',     name: common.Util.CTR('SQL Fetch Count')},
            {id: 'SQL_PREPARE_COUNT',   name: common.Util.CTR('SQL Prepare Count')},
            {id: 'SQL_EXEC_COUNT' ,     name: common.Util.CTR('SQL Exec Count')},
            {id: 'TPS',                 name: common.Util.CTR('TPS')},
            // {id: 'WAS_SESSION'    ,     name: common.Util.CTR('Concurrent Users')},
            {id: 'REQUEST_RATE'   ,     name: common.Util.CTR('TPS(INPUT)')},
            {id: 'TXN_ELAPSE'     ,     name: common.Util.CTR('Transaction Elapse Time (AVG)')},
            {id: 'SQL_ELAPSE'     ,     name: common.Util.CTR('SQL Elapse Time')}
        ],

        defaultTPStatName: [
            // 기본 표시 지표
            {id: 'TP_TPS',             name: common.Util.CTR('TPS')},                     // 초당 처리량
            {id: 'AVERAGE',            name: common.Util.CTR('Response Time')},           // 응답시간
            {id: 'TOTAL_COUNT',        name: common.Util.CTR('proc_cnt')},                // 프로세스 수
            {id: 'CONNECTED_CLIENTS',  name: common.Util.CTR('clients')},                 // 클라이언트 수
            {id: 'QCOUNT',             name: common.Util.CTR('qcount')},                  // 큐잉 건수
            {id: 'Q_AVERAGE',          name: common.Util.CTR('q_avg')}                    // 큐잉시간
        ],

        TPStatName: [
            // 기본 표시 지표
            {id: 'TP_TPS',             name: common.Util.CTR('TPS')},                     // 초당 처리량
            {id: 'AVERAGE',            name: common.Util.CTR('Response Time')},           // 응답시간
            {id: 'TOTAL_COUNT',        name: common.Util.CTR('proc_cnt')},                // 프로세스 수
            {id: 'CONNECTED_CLIENTS',  name: common.Util.CTR('clients')},                 // 클라이언트 수
            {id: 'QCOUNT',             name: common.Util.CTR('qcount')},                  // 큐잉 건수
            {id: 'Q_AVERAGE',          name: common.Util.CTR('q_avg')},                   // 큐잉시간

            // 선택 가능 지표
            {id: 'COUNT',              name: common.Util.CTR('TPS(INPUT)')},         // 처리건수
            {id: 'AQ_COUNT',           name: common.Util.CTR('aq_cnt')},             // aq개수
            {id: 'FAIL_COUNT',         name: common.Util.CTR('fail_cnt')},           // 실패건수
            {id: 'ERROR_COUNT',        name: common.Util.CTR('err_cnt')},            // 에러건수

            {id: 'OS_CPU_SYS'     ,     name: common.Util.CTR('OS CPU Sys (%)')},
            {id: 'OS_CPU_USER'    ,     name: common.Util.CTR('OS CPU User (%)')},
            {id: 'OS_CPU_IO'      ,     name: common.Util.CTR('OS CPU IO (%)')},
            {id: 'OS_FREE_MEM'    ,     name: common.Util.CTR('OS Free Memory (MB)')},
            {id: 'OS_RCV_PACKETS' ,     name: common.Util.CTR('OS Receive Packets')},
            {id: 'OS_SEND_PACKETS',     name: common.Util.CTR('OS Send Packets')},
            {id: 'OS_TOTAL_MEM'   ,     name: common.Util.CTR('OS Total Memory (MB)')}
        ],

        defaultTuxStatName: [
            // 기본 표시 지표
            {id: 'CUR_SERVERS',         name: common.Util.CTR('cur_servers')},
            {id: 'WKQUEUED',            name: common.Util.CTR('wkqueued')},
            {id: 'NUM_TRAN',            name: common.Util.CTR('num_tran')},
            {id: 'REQ',                 name: common.Util.CTR('req')},
            {id: 'CONNECTED_CLIENTS',   name: common.Util.CTR('Client Count')},
            {id: 'WKCOMPLETED',         name: common.Util.CTR('TPS')}
        ],

        TuxStatName: [
            // 기본 표시 지표
            {id: 'CUR_SERVERS',         name: common.Util.CTR('cur_servers')},
            {id: 'WKQUEUED',            name: common.Util.CTR('wkqueued')},
            {id: 'NUM_TRAN',            name: common.Util.CTR('num_tran')},
            {id: 'REQ',                 name: common.Util.CTR('req')},
            {id: 'CONNECTED_CLIENTS',   name: common.Util.CTR('Client Count')},
            {id: 'WKCOMPLETED',         name: common.Util.CTR('TPS')},

            // 선택 가능 지표
            {id: 'CUR_SERVICES',        name: common.Util.CTR('cur_services')},
            {id: 'CUR_REQ_QUEUE',       name: common.Util.CTR('cur_req_queue')},
            {id: 'CUR_GROUPS',          name: common.Util.CTR('cur_groups')},
            {id: 'ENQUEUE',             name: common.Util.CTR('enqueue')},
            {id: 'DEQUEUE',             name: common.Util.CTR('dequeue')},
            {id: 'POST',                name: common.Util.CTR('post')},
            {id: 'NUM_TRAN',            name: common.Util.CTR('num_tran')},
            {id: 'NUM_TRANABT',         name: common.Util.CTR('num_tranabt')},
            {id: 'NUM_TRANCMT',         name: common.Util.CTR('num_trancmt')},
            {id: 'NCOMPLETED',          name: common.Util.CTR('ncompleted')},

            {id: 'REQC',                name: common.Util.CTR('reqc')},
            {id: 'REQD',                name: common.Util.CTR('reqd')},

            {id: 'SERVER_CNT',          name: common.Util.CTR('server_cnt')},
            {id: 'NTOTWKQUEUED',        name: common.Util.CTR('ntotwkqueued')},
            {id: 'NQUEUED',             name: common.Util.CTR('nqueued')},
            {id: 'NUMTRAN',             name: common.Util.CTR('numtran')},
            {id: 'NUMTRANCMT',          name: common.Util.CTR('numtrancmt')},
            {id: 'NUMTRANABT',          name: common.Util.CTR('numtranabt')},
            {id: 'CONNECTED_CLIENTS',   name: common.Util.CTR('connected_clients')},

            {id: 'OS_CPU_SYS'     ,     name: common.Util.CTR('OS CPU Sys (%)')},
            {id: 'OS_CPU_USER'    ,     name: common.Util.CTR('OS CPU User (%)')},
            {id: 'OS_CPU_IO'      ,     name: common.Util.CTR('OS CPU IO (%)')},
            {id: 'OS_FREE_MEM'    ,     name: common.Util.CTR('OS Free Memory (MB)')},
            {id: 'OS_RCV_PACKETS' ,     name: common.Util.CTR('OS Receive Packets')},
            {id: 'OS_SEND_PACKETS',     name: common.Util.CTR('OS Send Packets')},
            {id: 'OS_TOTAL_MEM'   ,     name: common.Util.CTR('OS Total Memory (MB)')}
        ],

        defaultCDStatName: [
            // 기본 표시 지표
            {id: 'TPS',                 name: common.Util.CTR('TPS')},                     // 초당 처리량
            {id: 'TXN_ELAPSE'     ,     name: common.Util.CTR('Response Time') + ' (' + decodeURI('%C2%B5') + 's)'}, // 응답 시간
            {id: 'OS_RCV_PACKETS' ,     name: common.Util.CTR('OS Receive Packets')},      // OS 받은 패킷량
            {id: 'OS_SEND_PACKETS',     name: common.Util.CTR('OS Send Packets')}          // OS 보낸 패킷량
        ],

        CDStatName: [
            {id: 'TPS',                 name: common.Util.CTR('TPS')},                     // 초당 처리량
            {id: 'TXN_ELAPSE'     ,     name: common.Util.CTR('Response Time') + ' (' + decodeURI('%C2%B5') + 's)'}, // 응답 시간
            {id: 'OS_CPU_SYS'     ,     name: common.Util.CTR('OS CPU Sys (%)')},
            {id: 'OS_CPU_USER'    ,     name: common.Util.CTR('OS CPU User (%)')},
            {id: 'OS_CPU_IO'      ,     name: common.Util.CTR('OS CPU IO (%)')},
            {id: 'OS_FREE_MEM'    ,     name: common.Util.CTR('OS Free Memory (MB)')},
            {id: 'OS_RCV_PACKETS' ,     name: common.Util.CTR('OS Receive Packets')},      // OS 받은 패킷량
            {id: 'OS_SEND_PACKETS',     name: common.Util.CTR('OS Send Packets')},         // OS 보낸 패킷량
            {id: 'OS_TOTAL_MEM'   ,     name: common.Util.CTR('OS Total Memory (MB)')}
        ],

        defaultWebStatName: [
            // 기본 표시 지표
            {id: 'TPS',                 name: common.Util.CTR('TPS')},                     // 초당 처리량
            {id: 'AVERAGE',             name: common.Util.CTR('Response Time')},           // 응답시간
            {id: 'COUNT',               name: common.Util.CTR('Execution Count')},         // 실행건수
            {id: 'ERROR_COUNT',         name: common.Util.CTR('err_cnt')}                  // 에러건수
        ],

        defaultWTBStatName: [
            // 기본 표시 지표
            {id: 'TPS',                 name: common.Util.CTR('TPS')},                     // 초당 처리량
            {id: 'AVERAGE',             name: common.Util.CTR('Response Time')},           // 응답시간
            {id: 'CONNECTED_CLIENTS',   name: common.Util.CTR('clients')},                 // 클라이언트 수
            {id: 'QCOUNT',              name: common.Util.CTR('qcount')}                   // 큐잉 건수
        ],

        WebStatName: [
            // 기본 표시 지표
            {id: 'TPS',                 name: common.Util.CTR('TPS')},                     // 초당 처리량
            {id: 'AVERAGE',             name: common.Util.CTR('Response Time')},           // 응답시간
            {id: 'COUNT',               name: common.Util.CTR('Execution Count')},         // 실행건수
            {id: 'ERROR_COUNT',         name: common.Util.CTR('err_cnt')},                 // 에러건수

            // 선택 가능 지표
            {id: 'OS_RCV_PACKETS' ,     name: common.Util.CTR('OS Receive Packets')},      // OS 받은 패킷량
            {id: 'OS_SEND_PACKETS',     name: common.Util.CTR('OS Send Packets')}          // OS 보낸 패킷량
        ],

        WTBStatName: [
            // 기본 표시 지표
            {id: 'TPS',                 name: common.Util.CTR('TPS')},                     // 초당 처리량
            {id: 'AVERAGE',             name: common.Util.CTR('Response Time')},           // 응답시간
            {id: 'CONNECTED_CLIENTS',   name: common.Util.CTR('clients')},                 // 클라이언트 수
            {id: 'QCOUNT',              name: common.Util.CTR('qcount')},                  // 큐잉 건수

            // 선택 가능 지표
            {id: 'AQ_COUNT',            name: common.Util.CTR('qcount(aq)')},              // 큐잉 건수(aq)
            {id: 'COUNT',               name: common.Util.CTR('Execution Count')},         // 실행건수
            {id: 'ERROR_COUNT',         name: common.Util.CTR('err_cnt')},                 // 에러건수
            {id: 'OS_RCV_PACKETS' ,     name: common.Util.CTR('OS Receive Packets')},      // OS 받은 패킷량
            {id: 'OS_SEND_PACKETS',     name: common.Util.CTR('OS Send Packets')}          // OS 보낸 패킷량
        ],

        // 응답 상태 코드 항목 키
        ResponseStatusKeys: [
            // 'CODE_100', 'CODE_200', 'CODE_300',
            'CODE_400', 'CODE_500'
        ],

        // 응답 상태 코드 색상
        ResponseStatusColors: [
            // '#90db3b', '#2b99f0', '#f7dc44',
            '#e7782e', '#e11f2d'
        ],

        // 응답 상태 코드 항목 키 및 명칭
        RespStatusCodeInfo: {
            // 'CODE_100': '1xx',
            // 'CODE_200': '2xx',
            // 'CODE_300': '3xx',
            'CODE_400': '4xx',
            'CODE_500': '5xx'
        },

        InfoSumWasStat: [
            {id: 'REQUEST_RATE'      ,  name: common.Util.CTR('TPS(INPUT) (Sum)')},
            {id: 'ACTIVE_USERS'      ,  name: common.Util.CTR('Active Users (Sum)')},
            {id: 'ACTIVE_TRANSACTION',  name: common.Util.CTR('Active Transactions (Sum)')},
            {id: 'TPS'               ,  name: common.Util.CTR('TPS (Sum)')},
            {id: 'TXN_ELAPSE'        ,  name: common.Util.CTR('Transaction Elapse Time (Avg)')}
        ],

        TierStat: [
            {id: 'TPS'               ,  name: common.Util.CTR('TPS (Sum)')},
            {id: 'TXN_ELAPSE'        ,  name: common.Util.CTR('Transaction Elapse Time (AVG)')},
            {id: 'ERROR_COUNT'       ,  name: common.Util.CTR('Error Count')}
        ],

        TierGroupStat: [
            {id: 'TPS'               ,  name: common.Util.CTR('TPS (Sum)')},
            {id: 'TXN_ELAPSE'        ,  name: common.Util.CTR('Transaction Elapse Time (AVG)')},
            {id: 'ERROR_COUNT'       ,  name: common.Util.CTR('Error Count')},
            {id: 'REQUEST_RATE'      ,  name: common.Util.CTR('TPS(INPUT) (Sum)')},
            {id: 'ACTIVE_USERS'      ,  name: common.Util.CTR('Active Users (Sum)')},
            {id: 'ACTIVE_TRANSACTION',  name: common.Util.CTR('Active Transactions (Sum)')}
        ],

        BizGroupMetricsStat: [
            {id: 'REQUEST_RATE'      ,  name: common.Util.CTR('TPS(INPUT) (Sum)')},
            {id: 'ACTIVE_USERS'      ,  name: common.Util.CTR('Active Users (Sum)')},
            {id: 'ACTIVE_TRANSACTION',  name: common.Util.CTR('Active Transactions (Sum)')},
            {id: 'SESSION_COUNT'     ,  name: common.Util.CTR('Concurrent Users')},
            {id: 'TPS'               ,  name: common.Util.CTR('TPS (Sum)')},
            {id: 'TXN_ELAPSE'        ,  name: common.Util.CTR('Transaction Elapse Time (Avg)')}
        ],

        /* 모든 GC Stat Name 목록.  예) obj = [{id: '', name: ''}] */
        InfoGCStatName: [
            {id: 'EdenUsage',  name: common.Util.TR('Eden (MB)')},
            {id: 'OldUsage',   name: common.Util.TR('Old (MB)')},
            {id: 'PermUsage',  name: common.Util.TR('Perm (MB)')},
            {id: 'GCTime',     name: common.Util.TR('GC Time (Sec)')},
            {id: 'GCCount',    name: common.Util.TR('GC Count')},
            {id: 'ClassCount', name: common.Util.TR('Class Count')}
        ],

        gcStatList : [
            {id: 'EdenUsage',     name: 'Eden (MB)'       },
            {id: 'OldUsage',      name: 'Old (MB)'        },
            {id: 'PermUsage',     name: 'Perm (MB)'       },
            {id: 'GCTime',        name: 'GC Time (Sec)'   },
            {id: 'GCCount',       name: 'GC Count'        },
            {id: 'ClassCount',    name: 'Class Count'     }
        ],

        agentAlarmList: [
            'XM_JDBC_CONNECTION_FAIL',
            'XM_JDBC_CONN_NOTCLOSED',
            'XM_JDBC_NOT_COMMIT_ROLLBACK',
            'XM_JDBC_NOT_TOOMANYFETCH',
            'XM_JVM_INCOMPATIBLECLASSCHANGEERROR',
            'XM_JVM_OUTOFMEMORYERROR',
            'XM_JVM_SOCKETEXCEPTION',
            'XM_JVM_SOCKETTIMEOUTEXCEPTION'
        ],

        txnLinkAlarmList: [
            'XM_JDBC_CONNECTION_FAIL',
            'XM_JDBC_CONN_NOTCLOSED',
            'XM_JDBC_NOT_COMMIT_ROLLBACK',
            'XM_JDBC_NOT_TOOMANYFETCH'
        ],

        percentStatData: [
            'JVM_CPU_USAGE',
            'JVM_HEAP_USAGE',
            'OS_CPU_SYS',
            'OS_CPU_USER',
            'OS_CPU_IO',
            'TXN_ELAPSE',
            'AVERAGE'
        ],

        maxHundredStatData: [
            'JVM_HEAP_USAGE',
            'OS_CPU_SYS',
            'OS_CPU_USER',
            'OS_CPU_IO'
        ],

        serviceStatList : [
            {id: 'concurrent_user',     name: 'Today Concurrent Users'      },
            {id: 'tps',                 name: 'Today TPS'                   },
            {id: 'txn_count',           name: 'Today Execute Count'         },
            {id: 'avgrage_elapse',      name: 'Today Avg Elapse Time(sec)'  },
            {id: 'request_rate',        name: 'Today TPS(INPUT)'  }
        ],

        serviceStatList2 : [
            {id: 'concurrent_user',     name: 'Concurrent Users'      },
            {id: 'tps',                 name: 'TPS'                   },
            {id: 'txn_count',           name: 'Execute Count'         },
            {id: 'avgrage_elapse',      name: 'Avg Elapse Time(sec)'  }
        ],

        bizServiceStatList : [
            {id: 'txn_count',           name: 'Today Transaction Per Hour'          },
            {id: 'tps',                 name: 'Today TPS Per Hour'                  },
            {id: 'response_time',       name: 'Today Response Time Per Hour(ms)'    }
        ],

        loadPredictStatList : [
            { id: 'active_txns',   name: 'Active Transaction Count'      },
            { id: 'jvm_cpu_usage', name: 'JVM CPU Usage (%)'             },
            { id: 'jvm_used_heap', name: 'JVM Used Heap (MB)'            },
            { id: 'txn_end_count', name: 'Transaction Count'             },
            { id: 'txn_elapse',    name: 'Transaction Elapse Time (AVG)' }
        ],

        dashLoadPredictStatList : [
            { id: 'active_txns',   name: 'Active Transaction Count'      }
        ],

        dashDBLoadPredictStatList : [
            { id: 'lock_waiting_session', name: 'Lock Wait Session'     },
            { id: 'os_cpu',               name: 'CPU Usage'             }
        ],

        dashTxnLoadPredictStatList : [
            { id: 'tps',            name: 'TPS'                         },
            { id: 'txn_elapse',     name: 'Transaction Elapse Time'     }
        ],

        loadPredictDBStatList : [
            { id: 'os_cpu',               name: 'CPU Usage'             },
            { id: 'logical_read',         name: 'Session Logical Reads' },
            { id: 'db_time',              name: 'DB Time'               },
            { id: 'nonidle_wait_time',    name: 'Non Idle Wait Time'    },
            { id: 'physical_read',        name: 'Physical Reads'        },
            { id: 'physical_write',       name: 'Physical Writes'       },
            { id: 'execute_count',        name: 'Execute Count'         },
            { id: 'active_session',       name: 'Active Sessions'       },
            { id: 'lock_waiting_session', name: 'Lock Wait Session'     }
        ],

        loadPredictTxnStatList : [
            { id: 'txn_exec_count', name: 'Transaction Execution Count' },
            { id: 'txn_elapse',     name: 'Transaction Elapse Time'     },
            { id: 'txn_cpu_time',   name: 'Transaction CPU TIME'        }
        ],

        anoDetectionStatList : [
            { id: 'tps',           name: 'TPS'                           },
            { id: 'active_txns',   name: 'Active Transaction Count'      },
            { id: 'jvm_cpu_usage', name: 'JVM CPU Usage (%)'             },
            { id: 'jvm_used_heap', name: 'JVM Used Heap (MB)'            },
            { id: 'txn_end_count', name: 'Transaction Count'             },
            { id: 'txn_elapse',    name: 'Transaction Elapse Time (AVG)' }
        ],

        anoDetectionDBStatList : [
            { id: 'user_cpu',              name: 'CPU Usage'             },
            { id: 'active_session',        name: 'Active Sessions'       },
            { id: 'session_logical_reads', name: 'Session Logical Reads' },
            { id: 'execute_count',         name: 'Transaction CPU TIME'  },
            { id: 'lock_waiting_session',  name: 'Lock Wait Session'     },
            { id: 'physical_reads',        name: 'Physical Reads'        },
            { id: 'db_time',               name: 'DB Time'               },
            { id: 'physical_writes',       name: 'Physical Writes'       },
            { id: 'non_idle_wait_time',    name: 'Non Idle Wait Time'    }
        ],

        wooriPocDataFolder : '20190202',

        barStatus : {
            DOWN    : 'DOWN',
            LICENSE : 'LICENSE'
        },

        downAlarms : ['Disconnected', 'Server Down', 'TP Down', 'API Down', 'Server Hang'],

        bootAlarms : ['Connected', 'Server Boot', 'TP Boot', 'API Boot'],

        notAutoClearAlarms : ['Disconnected', 'Server Down', 'TP Down', 'API Down', 'Server Hang', 'XM_JVM_OUTOFMEMORYERROR', 'Gather Disconnected'],

        fixedAlarmList: ['Server Down', 'Disconnected', 'TP Down', 'API Down', 'XM_JVM_OUTOFMEMORYERROR'],

        nonClickAlarms: ['GATHER', 'PlatformJS', 'Gather Disconnected'],

        webProcessAlarm: {
            ACTIVE_DOWN : 'Active Down'
        },

        alarms : {
            DISCONNECTED : 'Disconnected',
            SERVER_DOWN  : 'Server Down',
            SERVER_HANG  : 'Server Hang',
            TP_DOWN      : 'TP Down',
            API_DOWN     : 'API Down',

            CONNECTED    : 'Connected',
            SERVER_BOOT  : 'Server Boot',
            TP_BOOT      : 'TP Boot',
            API_BOOT     : 'API Boot',
            PROCESS_BOOT : 'Process Boot',
            PROCESS_DOWN : 'Process Down',

            LICENSE      : 'License',

            OS_CPU       : 'OS CPU(%)',
            OS_FREE_MEM  : 'OS Free Memory (MB)',
            JVM_CPU      : 'JVM CPU Usage(%)',

            ELAPSED_TIME : 'Elapsed Time',
            TP_ERROR     : 'tp error'
        },

        BulletGrayColors: {
            BASE              : 'rgba(57,60,67,',
            COLOR_INNER       : ['rgba(60,160,255,0.3)',  'rgba(255,222,0,0.3)',  'rgba(255,0,0,0.3)'    ],
            COLOR_OUTER       : ['rgba(60,160,255,0.8)',  'rgba(255,222,0,0.8)',  'rgba(255,0,0,0.8)'    ],
            COLOR_FADE        : ['rgba(60,160,255,',      'rgba(255,222,0,',      'rgba(223,98,100,'     ],
            COLOR_TRAIL       : ['rgba(60,160,255,0.65)', 'rgba(255,222,0,0.65)', 'rgba(223,98,100,0.65)'],
            COLOR_EXPLOTION   : ['rgba(60,160,255,',      'rgba(255,222,0,',      'rgba(223,98,100,'     ],
            COLOR_TEXT        : ['#42A5F6',               '#FF9803',              '#D7000F'           , '#B5B8C1'],
            COLOR_BAR         : ['rgb(60,160,255)',       'rgb(255,222,0)',       'rgb(223,98,100)'      ],
            COLOR_LINE        : 'rgba(100,104,113,'
        },

        BulletBlackColors: {
            BASE              : 'rgba(0,0,0,',
            COLOR_INNER       : ['rgba(60,160,255,0.4)',  'rgba(255,222,0,0.4)',  'rgba(223,98,100,0.4)' ],
            COLOR_OUTER       : ['rgba(60,160,255,0.7)',  'rgba(255,222,0,0.7)',  'rgba(223,98,100,0.7)' ],
            COLOR_FADE        : ['rgba(60,160,255,',      'rgba(255,222,0,',      'rgba(223,98,100,'     ],
            COLOR_TRAIL       : ['rgba(60,160,255,0.65)', 'rgba(255,222,0,0.65)', 'rgba(223,98,100,0.65)'],
            COLOR_EXPLOTION   : ['rgba(60,160,255,',      'rgba(255,222,0,',      'rgba(223,98,100,'     ],
            COLOR_TEXT        : ['#42A5F6',               '#FF9803',              '#D7000F'           , '#FFFFFF'],
            COLOR_BAR         : ['rgb(60,160,255)',       'rgb(255,222,0)',       'rgb(223,98,100)'      ],
            COLOR_LINE        : 'rgba(100,104,113,'
        },

        BulletWhiteColors: {
            BASE              : 'rgba(255,255,255,',
            COLOR_INNER       : ['rgba(66,165,246,0.4)',  'rgba(255,152,3,0.4)',  'rgba(215,0,15,0.4)' ],
            COLOR_OUTER       : ['rgba(66,165,246,0.7)',  'rgba(255,152,3,0.7)',  'rgba(215,0,15,0.7)' ],
            COLOR_FADE        : ['rgba(66,165,246,',      'rgba(255,152,3,',      'rgba(215,0,15,'     ],
            COLOR_TRAIL       : ['rgba(66,165,246,0.65)', 'rgba(255,152,3,0.65)', 'rgba(215,0,15,0.65)'],
            COLOR_EXPLOTION   : ['rgba(66,165,246,',      'rgba(255,152,3,',      'rgba(215,0,15,'     ],
            COLOR_TEXT        : ['#42A5F6',               '#FF9803',              '#D7000F'           , 'dimgrey'],
            COLOR_BAR         : ['rgb(66,165,246)',       'rgb(255,152,3)',       'rgb(215,0,15)'      ],
            COLOR_LINE        : 'rgba(222,228,229,'
        },

        BarChartColor: {
            Gray: {
                BASE          : '#393C43',
                COLOR_TEXT    : ['#42A5F6',       '#FF9803',       '#D7000F'     , '#B5B8C1'],
                COLOR_BAR     : ['#3CA0FF',       '#FFDE00',       '#DF6264'      ]
            },
            White: {
                BASE          : '#FFFFFF',
                COLOR_TEXT    : ['#42A5F6',       '#FF9803',       '#D7000F'     , 'dimgrey'],
                COLOR_BAR     : ['#42A5F6',       '#FF9803',       '#D7000F'      ]
            },
            Black: {
                BASE          : '#000000',
                COLOR_TEXT    : ['#42A5F6',       '#FF9803',       '#D7000F'     , '#FFFFFF'],
                COLOR_BAR     : ['#3CA0FF',       '#FFDE00',       '#DF6264'      ]
            }
        },

        CircleColor: {
            Gray: {
                BASE          : '#393C43',
                COLOR_TEXT    : ['#42A5F6',       '#FF9803',       '#D7000F'     , '#B5B8C1',     '#28DEFF']
            },
            White: {
                BASE          : '#FFFFFF',
                COLOR_TEXT    : ['#42A5F6',       '#FF9803',       '#D7000F'     , '#000000',     '#28DEFF']
            },
            Black: {
                BASE          : '#000000',
                COLOR_TEXT    : ['#42A5F6',       '#FF9803',       '#D7000F'     , '#FFFFFF',     '#28DEFF']
            }
        },

        LicenseType: ['TRIAL', 'UNLIMITED', 'ERROR:1', 'ERROR:2'],

        License: {
            UNLIMITED: 'UNLIMITED',
            EXPIRE   : 'EXPIRE',
            ERROR    : [
                {key: -9 , type: ''},
                {key: -5 , type: ''},
                {key: -4 , type: ''},
                {key: -3 , type: ''},
                {key: -2 , type: ''},
                {key: -1 , type: ''}
            ]
        },

        txnPopupMonitorTimeRange: 120,

        openTxnFilterWasId: null,

        viewOriginalData: {},

        // 실시간 모니터링 화면의 메인 뷰 클래스 명 배열
        rtmViewClassList: ['rtm.view.rtmView', 'rtm.view.rtmTPView', 'rtm.view.rtmTuxView', 'rtm.view.rtmWebView', 'rtm.view.rtmCDView', 'rtm.view.rtmEtoEView', 'rtm.view.rtmBizView'],

        rtmViewClassObj: {
            'rtm.view.rtmView'     : 'WAS',
            'rtm.view.rtmTPView'   : 'TP',
            'rtm.view.rtmTuxView'  : 'TUX',
            'rtm.view.rtmWebView'  : 'WEB',
            'rtm.view.rtmCDView'   : 'CD',
            'rtm.view.rtmEtoEView' : 'E2E'
        },

        // 실시간 토폴로지 뷰에서 표시할 서버 ID를 설정한 목록
        topologyFilterServers: [],

        // 알람 정보를 표시할 때 Description 정보를 보여주는 알람 목록
        displayDescrAlarmList: {
            Name: ['Elapsed Time', 'Process Boot', 'Process Down', 'Queuing Counts', 'AQ Counts'],
            Type: ['Exception Alert', 'SLog Alert']
        },

        MenuTextKeys: {
            RealtimeMonitor  : common.Util.TR('RealTime Monitor (Default)'),
            RealtimeMonitor2 : common.Util.TR('RealTime Monitor (Modified)'),
            RealtimeMonitor3 : common.Util.TR('RealTime Monitor (All)'),
            RealtimeMonitor4 : common.Util.TR('Group Monitoring View'),
            ManagerView      : common.Util.TR('Manager View'),
            MultiInstance    : common.Util.TR('Multiple Instance View'),
            WASDBView        : common.Util.TR('WAS-DB linked View'),
            SysResource      : common.Util.TR('System Resource View'),
            Memory           : common.Util.TR('Memory View'),
            TopologyView     : common.Util.TR('Topology View'),
            TPMonitor        : common.Util.TR('TP Monitor'),
            WebMonitor       : common.Util.TR('Web Monitor'),
            E2EMonitor       : common.Util.TR('EtoE Monitor'),
            TaskMonitor      : common.Util.TR('Business Dashboard(Tier)'),
            TaskMonitor2     : common.Util.TR('Business Dashboard(Group)')
        },

        // 실시간 모니터링 화면의 팝업 리스트
        rtmPopupList         : [],

        // 업무 모니터링 화면이 추가되어 있는지 확인하는 구분값 (true: 추가, false: 미추가)
        isAddRtmBizView      : false
    },

    layoutVersion: {
        WAS3  : 'WASMonitor.170927.01',
        TP    : 'TPMonitor.170407.01',
        Tux   : 'TuxMonitor.170407.02',
        WEB   : 'WebMonitor.170718.01',
        WTB   : 'WebMonitorWebToB.170718.01',
        CD    : 'CDMonitor.170714.01',
        EtoE  : 'E2EMonitor.180305.01',
        BIZ   : 'TaskMonitor.180704.01',
        BIZ2  : 'TaskMonitor2.180704.01',
        AI    : 'AIMonitor.180813.03'
    },

    // 유닉스 타임을 "년월일시분"까지만 숫자로 만들어 리턴하는 함수
    timeToNumber: function(t) {
        var D = new Date(t);
        var y = D.getFullYear();
        var M = D.getMonth() + 1;
        var d = D.getDate();
        var h = D.getHours();
        var m = D.getMinutes();
        var result = '' + y + (M < 10 ? '0' + M : M) + (d < 10 ? '0' + d : d) + (h < 10 ? '0' + h : h) + (m < 10 ? '0' + m : m);

        return Number(result);
    },

    // 그룹에 속한 모든 WASID 반환
    // Comm.wasIdArr 배열에 들어있는 순서대로 넣어서 반환한다.
    WASListInGroup: function(_groupname) {
        var result = [];
        var w = Comm.wasIdArr;
        var b = Comm.bizGroupWasIdPairObj[_groupname];
        var ix, jx;

        if (b !== undefined) {
            for (ix = 0; ix < w.length; ix++) {
                for (jx = 0; jx < b.length; jx++) {
                    if (w[ix] == parseInt(b[jx])) {
                        result.push(w[ix]);
                    }
                }
            }
        }
        w = null;
        b = null;

        return result;
    },

    // 그룹에 속한 모든 Server ID 반환
    // 환경설정에서 설정된 순서대로 넣어서 반환한다.
    ServerListInGroup: function(_groupname) {
        var result = [];
        var w = Comm.wasIdArr;
        var b = Comm.bizGroupWasIdPairObj[_groupname];
        var ix, jx;

        if (b !== undefined) {
            for (ix = 0; ix < w.length; ix++) {
                for (jx = 0; jx < b.length; jx++) {
                    if (w[ix] == parseInt(b[jx])) {
                        result.push(w[ix]);
                    }
                }
            }
        }
        w = null;
        b = null;

        return result;
    },

    // 그룹에 속한 모든 WASNAME
    WASNamesInGroup: function(_groupname) {
        var result = [];
        var n = Comm.bizGroupWasNamePairObj[_groupname];
        var ix = null;

        if (n !== undefined) {
            for (ix = 0; ix < n.length; ix++) {
                result.push(n[ix][1]);
            }
        }

        try {
            return result;
        } finally {
            result = null;
        }

    },

    // 그룹에 속한 WAS들에 등록된 호스트 목록 반환
    HostInGroup: function(_groupname) {
        var result = [];
        var wasid;
        var host;
        var wasids = this.WASListInGroup(_groupname);
        var ix, jx;

        for (ix = 0; ix < wasids.length; ix++) {
            for (jx = 0; jx < realtime.HostRelWAS.length; jx++) {
                host = realtime.HostRelWAS[jx][0];
                wasid = realtime.HostRelWAS[jx][1];
                if (wasids[ix] === wasid && result.indexOf(host) === -1) {
                    result.push(host);
                }
            }
        }

        try {
            return result;
        } finally {
            ix   = null;
            jx   = null;
            host = null;
            wasid  = null;
            wasids = null;
        }
    },


    /**
     * WASID와 연결된 HOST 명 반환
     *
     * @param {number} wasid
     * @return {string} 호스트명
     */
    HostRelWAS: function(wasid) {
        var result, ix, ixLen;
        for (ix = 0, ixLen = realtime.HostRelWAS.length; ix < ixLen; ix++) {
            if (realtime.HostRelWAS[ix][1] == wasid) {
                result = realtime.HostRelWAS[ix][0];
                break;
            }
        }

        // Auto Scale 처리된 서버에 대해서도 체크를 하도록 추가
        if (!result && common.Menu.isAutoIDScaleVersion && Comm.oldServerInfo[wasid]) {
            result = Comm.oldServerInfo[wasid].host;
        }

        return result;
    },

    /**
     * WEBID와 연결된 HOST 명 반환
     *
     * @param {number} serverId
     * @return {string} 호스트명
     */
    HostRelWeb: function(serverId) {
        var result, ix, ixLen;
        for (ix = 0, ixLen = realtime.HostRelWeb.length; ix < ixLen; ix++) {
            if (realtime.HostRelWeb[ix][1] == serverId) {
                result = realtime.HostRelWeb[ix][0];
                break;
            }
        }
        return result;
    },


    /**
     * Server 타입 및 ID와 연결된 HOST 명 반환
     *
     * @param {number} serverId - 서버 ID
     * @return {string} 호스트명
     */
    HostRelServer: function(serverId) {
        var result;

        /*
         * Host 정보
         * [0]: 호스트 명
         * [1]: 서버 ID
         * [2]: 라이센스 상태
         */
        var ix, ixLen;
        for (ix = 0, ixLen = realtime.HostRelServer.length; ix < ixLen; ix++) {
            if (realtime.HostRelServer[ix][1] == serverId) {
                result = realtime.HostRelServer[ix][0];
                break;
            }
        }
        return result;
    },


    // HOST NAME 으로 WASID 목록 반환
    WASListByHostName: function(hostname, isUpper) {
        var result = [];
        var ix, ixLen;

        if (hostname) {
            if (isUpper) {
                for (ix = 0, ixLen = realtime.HostRelWAS.length; ix < ixLen; ix++) {
                    if (realtime.HostRelWAS[ix][0].toUpperCase() == hostname.toUpperCase()) {
                        result[result.length] = realtime.HostRelWAS[ix][1];
                    }
                }
            } else {
                for (ix = 0, ixLen = realtime.HostRelWAS.length; ix < ixLen; ix++) {
                    if (realtime.HostRelWAS[ix][0] == hostname) {
                        result[result.length] = realtime.HostRelWAS[ix][1];
                    }
                }
            }
        }
        return result;
    },

    // HOST NAME 으로 WEBID 목록 반환
    WebListByHostName: function(hostname, isUpper) {
        var result = [];
        var ix, ixLen;

        if (hostname) {
            if (isUpper) {
                for (ix = 0, ixLen = realtime.HostRelWeb.length; ix < ixLen; ix++) {
                    if (realtime.HostRelWeb[ix][0].toUpperCase() == hostname.toUpperCase()) {
                        result[result.length] = realtime.HostRelWeb[ix][1];
                    }
                }
            } else {
                for (ix = 0, ixLen = realtime.HostRelWeb.length; ix < ixLen; ix++) {
                    if (realtime.HostRelWeb[ix][0] == hostname) {
                        result[result.length] = realtime.HostRelWeb[ix][1];
                    }
                }
            }
        }
        return result;
    },

    // HOST NAME 으로 Server ID 목록 반환
    ServerListByHostName: function(hostname, isUpper) {
        var result = [];
        var ix, ixLen;

        if (hostname) {
            if (isUpper) {
                for (ix = 0, ixLen = realtime.HostRelServer.length; ix < ixLen; ix++) {
                    if (realtime.HostRelServer[ix][0].toUpperCase() == hostname.toUpperCase()) {
                        result[result.length] = realtime.HostRelServer[ix][1];
                    }
                }
            } else {
                for (ix = 0, ixLen = realtime.HostRelServer.length; ix < ixLen; ix++) {
                    if (realtime.HostRelServer[ix][0] == hostname) {
                        result[result.length] = realtime.HostRelServer[ix][1];
                    }
                }
            }
        }
        return result;
    },

    // 모든 WAS 목록 반환
    // Comm.wasIdArr 배열에 들어있는 순서대로 넣어서 반환한다.
    WASListAll: function() {
        var result = [],
            ix, ixLen;

        for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
            result.push(Comm.wasIdArr[ix]);
        }

        return result;
    },

    /**
     * WAS ID 목록을 Comm.wasIdArr 배열에 들어있는 순서대로 재구성해서 반환한다.
     *
     * @param {array} idList
     * @return {array} - WAS ID Array
     */
    WASListByID: function(idList) {
        var result = [];
        var wasIdArr = Comm.wasIdArr;
        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = wasIdArr.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = idList.length; jx < jxLen; jx++) {
                if (wasIdArr[ix] === +idList[jx]) {
                    result[result.length] = wasIdArr[ix];
                    break;
                }
            }
        }
        return result;
    },

    /**
     * 서버 ID 및 서버 타입에 해당하는 서버ID를 설정된 순서대로 정렬하여 반환한다.
     *
     * @param {array} idList
     * @param {string} type - 서버 타입 (WAS, TP, WEB)
     * @return {array} - 정렬된 서버 ID 배열
     */
    getSortServerID: function(idList, type) {
        var result = [];
        var serverIdArr   = Comm.RTComm.getServerIdArr(type);

        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = serverIdArr.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = idList.length; jx < jxLen; jx++) {
                if (serverIdArr[ix] === +idList[jx]) {
                    result[result.length] = serverIdArr[ix];
                    break;
                }
            }
        }
        return result;
    },

    /**
     * WAS ID에 해다하는 WAS Name을 Comm.wasIdArr 배열에 들어있는 순서대로 정렬하여 반환한다.
     *
     * @param {array} idList
     * @return {array} - WAS Name Array
     */
    WASNamesByID: function(idList) {
        var result = [];
        var wasIdArr = Comm.wasIdArr;
        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = wasIdArr.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = idList.length; jx < jxLen; jx++) {
                if (wasIdArr[ix] === +idList[jx]) {
                    result[result.length] = Comm.wasNameArr[ix];
                    break;
                }
            }
        }
        return result;
    },

    /**
     * 서버 ID 및 서버 타입에 해당하는 서버명을 설정된 순서대로 정렬하여 반환한다.
     *
     * @param {array} idList
     * @param {string} type - 서버 타입 (WAS, TP, WEB)
     * @return {array} - 정렬된 서버명 배열
     */
    getSortServerNames: function(idList, type) {
        var result = [];
        var serverIdArr   = Comm.RTComm.getServerIdArr(type);
        var serverNameArr = Comm.RTComm.getServerNameArr(type);

        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = serverIdArr.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = idList.length; jx < jxLen; jx++) {
                if (serverIdArr[ix] === +idList[jx]) {
                    result[result.length] = serverNameArr[ix];
                    break;
                }
            }
        }
        return result;
    },


    /**
     * TP ID 에 해당하는 TP명을 설정된 순서대로 정렬하여 반환한다.
     *
     * @param {array} idList - ID 목록
     * @return {array} - 정렬된 서버명 배열
     */
    getSortTPNames: function(idList) {
        return Comm.RTComm.getSortServerNames(idList, 'TP');
    },

    /**
     * 호스트 ID에 해당하는 호스트명 반환
     *
     * @param {string | number} hostId
     * @return {string}
     */
    getHostNameByID: function(hostId) {
        var ix, ixLen;
        var hostName;

        // 0: host name
        // 1: host ip
        // 2: host id
        for (ix = 0, ixLen = Comm.monitoringHosts.length; ix < ixLen; ix++) {
            if (Comm.monitoringHosts[ix][2] == hostId) {
                hostName = Comm.monitoringHosts[ix][0];
                break;
            }
        }
        return hostName;
    },

    /**
     * 호스트명에 해당하는 호스트ID 반환
     *
     * @param {string} hostName
     * @return {string}
     */
    getHostIdByName: function(hostName) {
        var ix, ixLen;
        var hostId;

        // 0: host name
        // 1: host ip
        // 2: host id
        for (ix = 0, ixLen = Comm.monitoringHosts.length; ix < ixLen; ix++) {
            if (Comm.monitoringHosts[ix][0] === hostName) {
                hostId = Comm.monitoringHosts[ix][2];
                break;
            }
        }
        return hostId;
    },


    /**
     * 서버 ID에 해당하는 서버명 반환
     *
     * @param {string} id - 서버 ID
     * @param {string} type - 서버 타입
     * @return {string} 서버명
     */
    getServerNameByID: function(id, type) {
        var name;

        if (type === 'TP' && Comm.tpInfoObj[id]) {
            name = Comm.tpInfoObj[id].name;

        } else if (type === 'TUX' && Comm.tuxInfoObj[id]) {
            name = Comm.tuxInfoObj[id].name;

        } else if (type === 'WEB' && Comm.webServersInfo[id]) {
            name = Comm.webServersInfo[id].name;

        } else if (type === 'CD' && Comm.cdInfoObj[id]) {
            name = Comm.cdInfoObj[id].name;

        } else if (type === 'WAS' || !type) {

            if (Comm.oldServerInfo[id]) {
                name = Comm.oldServerInfo[id].wasName;

            } else if (Comm.wasInfoObj[id]) {
                name = Comm.wasInfoObj[id].wasName;
            }
        }
        return name;
    },

    getEtoEServerNameByID: function(id) {

        var name;

        if (Comm.wasInfoObj[id]) {
            name = Comm.wasInfoObj[id].wasName;
        } else if (Comm.tpInfoObj[id]) {
            name = Comm.tpInfoObj[id].name;
        } else if (Comm.tuxInfoObj[id]) {
            name = Comm.tuxInfoObj[id].name;
        } else if (Comm.cdInfoObj[id]) {
            name = Comm.cdInfoObj[id].name;
        } else if (Comm.webServersInfo[id]) {
            name = Comm.webServersInfo[id].name;
        }

        return name;
    },

    /**
     * 서버 ID에 해당하는 색상 반환
     *
     * @param {string} id - 서버 ID
     * @param {string} type - 서버 타입
     * @return {string} 서버 색상
     */
    getServerColorByID: function(id, type) {
        var color;
        var serverId;
        var ix, ixLen;

        if (type === 'WAS' || !type) {
            color = Comm.wasInfoObj[id].labelColor;

        } else if (type === 'TP') {
            color = Comm.tpInfoObj[id].labelColor;

        } else if (type === 'TUX') {
            color = Comm.tuxInfoObj[id].labelColor;

        } else if (type === 'WEB') {
            color = Comm.webServersInfo[id].labelColor;

        } else if (type === 'E2E') {
            for (ix = 0, ixLen = realtime.eteMonitorServerInfo.length; ix < ixLen; ix++) {
                serverId = realtime.eteMonitorServerInfo[ix].id;
                if (id === serverId) {
                    type = realtime.eteMonitorServerInfo[ix].type;
                    color = Comm.serverInfoObj[type][serverId].labelColor;
                    break;
                }
            }
        }
        return color;
    },

    // 그룹 유형(Host, Business) 및 WASID로 그룹명 반환
    getGroupNameByType: function(type, wasid) {
        var result = '';
        if (+type === 0) {    // Host
            if (Comm.rtmE2EShow) {
                result = Comm.RTComm.HostRelServer(wasid);
            } else {
                result = Comm.RTComm.HostRelWAS(wasid);
            }

        } else if (+type === 1) { // Business
            result = Comm.RTComm.getGroupNameByWasId(wasid);
        }
        return result;
    },

    // 그룹 유형(Host, Business) 및 SERVER ID로 Web 그룹명 반환
    getWebGroupNameByType: function(type, serverId) {
        var result = '';
        if (+type === 0) {    // Host
            result = Comm.RTComm.HostRelWeb(serverId);

        } else if (+type === 1) { // Business
            result = Comm.RTComm.getGroupNameByWasId(serverId);
        }
        return result;
    },

    // WASNAME으로 속해있는 그룹명 반환
    getGroupNameByWasName: function(wasname) {
        var wasid = this.getWASIdbyName(wasname);

        return this.getGroupNameByWasId(wasid);
    },

    // WASID가 속해있는 그룹명 반환
    getGroupNameByWasId: function(wasid) {
        var result = '', bizName;
        var subList;
        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = Comm.bizGroups.length; ix < ixLen; ix++) {
            bizName = Comm.bizGroups[ix];
            subList = Comm.bizGroupWasIdPairObj[bizName];

            for (jx = 0, jxLen = subList.length; jx < jxLen; jx++) {
                if (subList[jx] == wasid && bizName.length > 0) {
                    result = bizName;
                    break;
                }
            }
        }
        if (result === '') {
            result = undefined;
        }
        return result;
    },

    // DB_ID로 DBNAME 반환
    getDBNameById: function(dbid) {
        var result = '';
        var dbKeys = Object.keys(Comm.allDBInfo);
        var key, ix, ixLen;

        for (ix = 0, ixLen = dbKeys.length; ix < ixLen; ix++) {
            key = dbKeys[ix];
            if (key == dbid) {
                result = Comm.allDBInfo[key].instanceName;
                break;
            }
        }
        try {
            return result;
        } finally {
            dbKeys = null;
        }
    },

    // Instance_name로 DB_ID 반환
    getDBIdyName: function(dbName) {
        var result = '';
        var dbKeys = Object.keys(Comm.allDBInfo);
        var key, ix, ixLen;

        for (ix = 0, ixLen = dbKeys.length; ix < ixLen; ix++) {
            key = dbKeys[ix];
            if (Comm.allDBInfo[key].instanceName === dbName) {
                result = key;
                break;
            }
        }
        try {
            return result;
        } finally {
            dbKeys = null;
        }
    },

    // WASNAME으로 WASID 반환
    getWASIdbyName: function(wasname) {
        var result, ix, ixLen;
        for (ix = 0, ixLen = Comm.wasNameArr.length; ix < ixLen; ix++) {
            if (Comm.wasNameArr[ix] == wasname) {
                result = Comm.wasIdArr[ix];
                break;
            }
        }
        return result;
    },

    // WASID로 WASNAME 반환
    getWASNamebyId: function(wasid) {
        var result = '',
            ix, ixLen;
        for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
            if (Comm.wasIdArr[ix] == wasid) {
                result = Comm.wasNameArr[ix];
            }
        }
        return result;
    },

    // TP NAME으로 TP ID 반환
    getTPIdByName: function(name) {
        var result, ix, ixLen;
        for (ix = 0, ixLen = Comm.tpNameArr.length; ix < ixLen; ix++) {
            if (Comm.tpNameArr[ix] === name) {
                result = Comm.tpIdArr[ix];
                break;
            }
        }
        return result;
    },

    // Tuxedo NAME으로 TP ID 반환
    getTuxIdByName: function(name) {
        var result, ix, ixLen;
        for (ix = 0, ixLen = Comm.tuxNameArr.length; ix < ixLen; ix++) {
            if (Comm.tuxNameArr[ix] === name) {
                result = Comm.tuxIdArr[ix];
                break;
            }
        }
        return result;
    },

    // TP ID으로 TP Name 반환
    getTPNameById: function(serverId) {
        var result = '',
            ix, ixLen;
        for (ix = 0, ixLen = Comm.tpIdArr.length; ix < ixLen; ix++) {
            if (Comm.tpIdArr[ix] === serverId) {
                result = Comm.tpNameArr[ix];
            }
        }
        return result;
    },

    // WEB NAME으로 WEB ID 반환
    getWebIdByName: function(name) {
        var result, ix, ixLen;
        for (ix = 0, ixLen = Comm.webNameArr.length; ix < ixLen; ix++) {
            if (Comm.webNameArr[ix] === name) {
                result = Comm.webIdArr[ix];
                break;
            }
        }
        return result;
    },

    // WEB ID으로 WEB Name 반환
    getWebNameById: function(serverId) {
        var result = '',
            ix, ixLen;
        for (ix = 0, ixLen = Comm.webIdArr.length; ix < ixLen; ix++) {
            if (Comm.webIdArr[ix] === serverId) {
                result = Comm.webNameArr[ix];
            }
        }
        return result;
    },

    // C Daemon NAME으로 C Daemon ID 반환
    getCDIdByName: function(name) {
        var result, ix, ixLen;
        for (ix = 0, ixLen = Comm.cdNameArr.length; ix < ixLen; ix++) {
            if (Comm.cdNameArr[ix] === name) {
                result = Comm.cdIdArr[ix];
                break;
            }
        }
        return result;
    },

    // C Daemon ID으로 C Daemon Name 반환
    getCDNameById: function(serverId) {
        var result = '',
            ix, ixLen;
        for (ix = 0, ixLen = Comm.cdIdArr.length; ix < ixLen; ix++) {
            if (Comm.cdIdArr[ix] === serverId) {
                result = Comm.cdNameArr[ix];
            }
        }
        return result;
    },

    // biz Name으로 biz ID 반환
    getBizIdByName: function(name) {
        var result, ix, ixLen;
        var bizInfo = Object.values(Comm.etoeBizInfos);

        for (ix = 0, ixLen = bizInfo.length; ix < ixLen; ix++) {
            if (bizInfo[ix].name === name) {
                result = bizInfo[ix].id;
                break;
            }
        }
        return result;
    },

    // Server Type 및 Name 으로 서버 ID 반환
    getServerIdByName: function(name, type) {
        var result;
        var ix, ixLen;

        if (type === 'WAS' || !type) {
            result = Comm.RTComm.getWASIdbyName(name);

        } else if (type === 'TP') {
            result = Comm.RTComm.getTPIdByName(name);

        } else if (type === 'TUX') {
            result = Comm.RTComm.getTuxIdByName(name);

        } else if (type === 'WEB') {
            result = Comm.RTComm.getWebIdByName(name);

        } else if (type === 'CD') {
            result = Comm.RTComm.getCDIdByName(name);

        } else if (type === 'Business') {
            result = Comm.RTComm.getBizIdByName(name);

        } else if (type === 'E2E') {
            for (ix = 0, ixLen = realtime.eteMonitorServerInfo.length; ix < ixLen; ix++ ) {
                if (realtime.eteMonitorServerInfo[ix].name === name) {
                    result = realtime.eteMonitorServerInfo[ix].id;
                    break;
                }
            }
        }

        return result;
    },

    /**
     * 서버ID에 해당하는 서버타입을 반환
     *
     * @param {number} id - 서버ID
     * @return {string} 서버 타입
     */
    getServerTypeById: function(id) {
        var type;

        if (Comm.webIdArr.indexOf(id) !== -1) {
            type = 'WEB';

        } else if (Comm.cdIdArr.indexOf(id) !== -1) {
            type = 'CD';

        } else if (Comm.tpIdArr.indexOf(id) !== -1) {
            type = 'TP';

        } else if (Comm.tuxIdArr.indexOf(id) !== -1) {
            type = 'TUX';

        } else {
            type = 'WAS';
        }

        return type;
    },


    getActiveTxnState: function(state) {
        var temp = '',
            ix, ixLen;
        for (ix = 0, ixLen = realtime.ActiveTxnStateArr.length; ix < ixLen; ix++) {
            if (realtime.ActiveTxnStateArr[ix][0] == state) {
                temp = realtime.ActiveTxnStateArr[ix][1];
                break;
            }
        }
        return temp;
    },

    // 폰트 적용
    setFont: function(size, text, bold, letterspacing, color) {
        var result;
        var fontsize      = 'font-size:' + size + 'pt;';
        var fontfamily_en = 'font-family:&quot;Droid Sans&quot;;';
        var fontfamily_eb = 'font-family:&quot;Droid Sans Bold&quot;;';
        var fontfamily_hn = 'font-family:NanumGothic;';
        var fontfamily_hb = 'font-family:NanumGothicBold;';
        var color_temp    = 'color:' + color + ';';
        var spacing_temp  = 'letter-spacing:' + letterspacing + 'pt;';

        result  = '<span style="';

        if (Comm.Lang === 'en') {
            if (bold) {
                result += fontfamily_eb;    /* 영문(굵은체) */
            } else {
                result += fontfamily_en;    /* 영문(일반체) */
            }
        } else {
            if (bold) {
                result += fontfamily_hb;    /* 한글(굵은체) */
            } else {
                result += fontfamily_hn;    /* 한글(일반체) */
            }
        }

        result += fontsize;

        if (letterspacing) {
            result += spacing_temp;
        }

        if (color) {
            result += color_temp;
        }

        result += '">' + text + '</span>';

        return result;
    },


    /**
     * 임의의 색상 Hex 코드값을 반환.
     *
     * 입력된 색상 코드값을 기준으로 임의의 색상 코드값을 반환하고,
     * 입력된 값이 없는 경우 임의의 값을 반환한다.
     *
     * 예) decimalToHex('#3ca0ff')
     *
     * @param {String} h
     * @return {String}
     */
    decimalToHex: function(h) {
        if (!h) {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }

        h = h.split('#')[1];
        if (!h || '' === h) {
            return h;
        }
        var d = parseInt(h, 16) + 100;
        var hex = Number(d).toString(16);
        hex = '000000'.substr(0, 6 - hex.length) + hex;

        d = null;

        return '#' + hex;
    },

    getColorByIndex: function(colorIdx) {
        if (colorIdx >= realtime.DefaultColors.length) {
            return Comm.RTComm.decimalToHex(realtime.DefaultColors[colorIdx - realtime.DefaultColors.length + 1]);
        } else {
            return realtime.DefaultColors[colorIdx];
        }
    },

    // STAT ID로 STAT NAME 반환
    getStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.InfoWasStatName.length; ix < ixLen; ix++ ) {
            if (realtime.InfoWasStatName[ix].id == id) {
                result = realtime.InfoWasStatName[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    // STAT ID로 합계 STAT NAME 반환
    getSumStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.InfoSumWasStat.length; ix < ixLen; ix++ ) {
            if (realtime.InfoSumWasStat[ix].id == id) {
                result = realtime.InfoSumWasStat[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    // STAT ID로 구간(Tier) STAT NAME 반환
    getTierStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.TierStat.length; ix < ixLen; ix++ ) {
            if (realtime.TierStat[ix].id == id) {
                result = realtime.TierStat[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    // TP STAT ID로 TP STAT NAME 반환
    getTPStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.TPStatName.length; ix < ixLen; ix++ ) {
            if (realtime.TPStatName[ix].id == id) {
                result = realtime.TPStatName[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    // Tuxedo STAT ID로 TP STAT NAME 반환
    getTuxStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.TuxStatName.length; ix < ixLen; ix++ ) {
            if (realtime.TuxStatName[ix].id == id) {
                result = realtime.TuxStatName[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    // STAT Name으로 구간(Tier) 그룹 STAT ID 반환
    getTierGroupStatIdByName: function(name) {
        var result = null,
            ix, ixLen;

        for (ix = 0, ixLen = realtime.TierGroupStat.length; ix < ixLen; ix++ ) {
            if (realtime.TierGroupStat[ix].name === name) {
                result = realtime.TierGroupStat[ix].id;
                break;
            }
        }
        if (!result) {
            result = name.replace(/ /gi, '_');
        }
        return result;
    },

    // STAT ID로 구간(Tier) 그룹 STAT NAME 반환
    getTierGroupStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.TierGroupStat.length; ix < ixLen; ix++ ) {
            if (realtime.TierGroupStat[ix].id == id) {
                result = realtime.TierGroupStat[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    // C Daemon STAT ID로 TP STAT NAME 반환
    getCDStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.CDStatName.length; ix < ixLen; ix++ ) {
            if (realtime.CDStatName[ix].id == id) {
                result = realtime.CDStatName[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    // WEB STAT ID로 WEB STAT NAME 반환
    getWebStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.WebStatName.length; ix < ixLen; ix++ ) {
            if (realtime.WebStatName[ix].id == id) {
                result = realtime.WebStatName[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    getBizGroupStatNameById: function(id) {
        var result = null,
            ix, ixLen;

        id = id.toUpperCase();

        for (ix = 0, ixLen = realtime.BizGroupMetricsStat.length; ix < ixLen; ix++ ) {
            if (realtime.BizGroupMetricsStat[ix].id == id) {
                result = realtime.BizGroupMetricsStat[ix].name;
                break;
            }
        }
        if (!result) {
            result = id.replace(/_/gi, ' ');
        }
        return result;
    },

    getBizGroupStatIdByName: function(name) {
        var result = null,
            ix, ixLen;

        for (ix = 0, ixLen = realtime.BizGroupMetricsStat.length; ix < ixLen; ix++ ) {
            if (realtime.BizGroupMetricsStat[ix].name === name) {
                result = realtime.BizGroupMetricsStat[ix].id;
                break;
            }
        }
        if (!result) {
            result = name.replace(/ /gi, '_');
        }
        return result;
    },


    // STAT ID로 STAT NAME 반환
    getStatIdByName: function(name) {
        var result = null,
            ix, ixLen;

        for (ix = 0, ixLen = realtime.InfoWasStatName.length; ix < ixLen; ix++ ) {
            if (realtime.InfoWasStatName[ix].name === name) {
                result = realtime.InfoWasStatName[ix].id;
                break;
            }
        }
        if (!result) {
            result = name.replace(/ /gi, '_');
        }
        return result;
    },

    // STAT NAME으로 합계 STAT ID 반환
    getSumStatIdByName: function(name) {
        var result = null,
            ix, ixLen;

        for (ix = 0, ixLen = realtime.InfoSumWasStat.length; ix < ixLen; ix++ ) {
            if (realtime.InfoSumWasStat[ix].name === name) {
                result = realtime.InfoSumWasStat[ix].id;
                break;
            }
        }
        if (!result) {
            result = name.replace(/ /gi, '_');
        }
        return result;
    },

    // TP STAT ID로 TP STAT NAME 반환
    getTPStatIdByName: function(name) {
        var result = null,
            ix, ixLen;

        for (ix = 0, ixLen = realtime.TPStatName.length; ix < ixLen; ix++ ) {
            if (realtime.TPStatName[ix].name === name) {
                result = realtime.TPStatName[ix].id;
                break;
            }
        }
        if (!result) {
            result = name.replace(/ /gi, '_');
        }
        return result;
    },

    // Tuxedo STAT ID로 TP STAT NAME 반환
    getTuxStatIdByName: function(name) {
        var result = null,
            ix, ixLen;

        for (ix = 0, ixLen = realtime.TuxStatName.length; ix < ixLen; ix++ ) {
            if (realtime.TuxStatName[ix].name === name) {
                result = realtime.TuxStatName[ix].id;
                break;
            }
        }
        if (!result) {
            result = name.replace(/ /gi, '_');
        }
        return result;
    },

    // C Daemon STAT ID로 TP STAT NAME 반환
    getCDStatIdByName: function(name) {
        var result = null,
            ix, ixLen;

        for (ix = 0, ixLen = realtime.CDStatName.length; ix < ixLen; ix++ ) {
            if (realtime.CDStatName[ix].name === name) {
                result = realtime.CDStatName[ix].id;
                break;
            }
        }
        if (!result) {
            result = name.replace(/ /gi, '_');
        }
        return result;
    },

    // WEB STAT ID로 WEB STAT NAME 반환
    getWebStatIdByName: function(name) {
        var result = null,
            ix, ixLen;

        for (ix = 0, ixLen = realtime.WebStatName.length; ix < ixLen; ix++ ) {
            if (realtime.WebStatName[ix].name === name) {
                result = realtime.WebStatName[ix].id;
                break;
            }
        }
        if (!result) {
            result = name.replace(/ /gi, '_');
        }
        return result;
    },

    // WAS STAT ID 목록 반환
    getWasStatIdArr: function() {
        var tmpArr = [];
        var key    = null;
        var statKeys = Object.keys(realtime.InfoWasStatName);

        var ix, ixLen;
        for (ix = 0, ixLen = statKeys.length; ix < ixLen; ix++) {
            key = statKeys[ix];
            tmpArr[tmpArr.length] = realtime.InfoWasStatName[key].id;
        }
        try {
            return tmpArr;
        } finally {
            key      = null;
            tmpArr   = null;
            statKeys = null;
        }
    },

    // TP STAT ID 목록 반환
    getTPStatIdArr: function() {
        var tmpArr = [];
        var key    = null;
        var statKeys = Object.keys(realtime.TPStatName);

        var ix, ixLen;
        for (ix = 0, ixLen = statKeys.length; ix < ixLen; ix++) {
            key = statKeys[ix];
            tmpArr[tmpArr.length] = realtime.TPStatName[key].id;
        }
        try {
            return tmpArr;
        } finally {
            key      = null;
            tmpArr   = null;
            statKeys = null;
        }
    },

    // Tuxedo STAT ID 목록 반환
    getTuxStatIdArr: function() {
        var tmpArr = [];
        var key    = null;
        var statKeys = Object.keys(realtime.TuxStatName);

        var ix, ixLen;
        for (ix = 0, ixLen = statKeys.length; ix < ixLen; ix++) {
            key = statKeys[ix];
            tmpArr[tmpArr.length] = realtime.TuxStatName[key].id;
        }
        try {
            return tmpArr;
        } finally {
            key      = null;
            tmpArr   = null;
            statKeys = null;
        }
    },

    // C Daemon STAT ID 목록 반환
    getCDStatIdArr: function() {
        var tmpArr = [];
        var key    = null;
        var statKeys = Object.keys(realtime.CDStatName);

        var ix, ixLen;
        for (ix = 0, ixLen = statKeys.length; ix < ixLen; ix++) {
            key = statKeys[ix];
            tmpArr[tmpArr.length] = realtime.CDStatName[key].id;
        }
        try {
            return tmpArr;
        } finally {
            key      = null;
            tmpArr   = null;
            statKeys = null;
        }
    },

    // WEB STAT ID 목록 반환
    getWebStatIdArr: function() {
        var tmpArr = [];
        var key;
        var statKeys = Object.keys(realtime.WebStatName);

        var ix, ixLen;
        for (ix = 0, ixLen = statKeys.length; ix < ixLen; ix++) {
            key = statKeys[ix];
            tmpArr[tmpArr.length] = realtime.WebStatName[key].id;
        }
        try {
            return tmpArr;
        } finally {
            tmpArr   = null;
            statKeys = null;
        }
    },

    getBooleanValue: function(value) {
        var boolVal = false;

        if (Ext.isBoolean(value)) {
            boolVal = value;
        } else {
            if (Ext.isString(value)) {
                boolVal = (value.toLowerCase() === 'true');
            }
        }
        return boolVal;
    },

    isInteger: function(x) {
        return x % 1 === 0;
    },

    /**
     * 유효한 날짜값인지 체크.
     *
     * @param {...string | ...object}
     * @return {boolean} true: valid, false: invalid
     */
    isValidDate: function() {
        var isDate;
        var ix, ixLen;

        for (ix = 0, ixLen = arguments.length; ix < ixLen; ix++) {
            isDate = !isNaN(Date.parse(arguments[ix]));

            if (!isDate) {
                break;
            }
        }

        return isDate;
    },

    /**
     * WAS 선택 유무 반환
     *
     * @return true: 선택된 WAS 없음, false: 선택된 WAS 있음.
     */
    isSelectedWas: function() {
        return (Comm.wasIdArr.length !== Comm.selectedWasArr.length);
    },

    /**
     * 서버 선택 유무 반환
     *
     * @return true: 선택된 서버 없음, false: 선택된 서버 있음.
     */
    isSelectedServer: function() {
        var isSelected = false,
            idArr, selectedArr;

        if (window.rtmMonitorType === 'WAS' || !window.rtmMonitorType) {
            // Comm.wasIdArr 배열에 WAS 이외에 TP, CD의 ID도 포함이 되어 있어 WAS에 해당하는 값만 체크
            idArr       = Comm.RTComm.getServerIdArr('WAS');
            selectedArr = Comm.RTComm.getServerIdArr('WAS', true);

            isSelected = idArr.length !== selectedArr.length;

        } else if (window.rtmMonitorType === 'TP') {
            isSelected = Comm.tpIdArr.length !== Comm.selectedTpArr.length;

        } else if (window.rtmMonitorType === 'WEB') {
            isSelected = Comm.webIdArr.length !== Comm.selectedWebArr.length;

        } else if (window.rtmMonitorType === 'CD') {
            isSelected = Comm.cdIdArr.length !== Comm.selectedCdArr.length;

        } else if (window.rtmMonitorType === 'E2E') {
            isSelected = realtime.eteMonitorServerList.length !== realtime.eteSelectedServerList.length;
        }

        return isSelected;
    },


    /**
     * 실시간 화면 표시 유무
     *
     * @return {boolean} true: 실시간 화면 표시, false: 실시간 화면 비표시
     */
    isRTMShow: function() {
        return Comm.rtmShow || Comm.rtmTPShow || Comm.rtmWebShow || Comm.rtmCDShow || Comm.rtmE2EShow || Comm.rtmBizShow;
    },


    /**
     * 서버 상태정보를 가지고 있는 객체 유무를 체크.
     *
     * @description 초기 화면 접속 시 알람 패킷 데이터로 해당 정보를 구성하지만
     * 패킷데이터 수신이 지연되는 경우 에러가 발생할 가능성이 있기에
     * 초기 화면 구성시 해당 데이터 구성 유무를 체크, 없는 경우 빈 객체를 생성한다.
     */
    checkServerStatusObject: function() {
        if (Comm.Status == null) {
            Comm.Status = {};
        }

        if (Comm.Status.WAS == null) {
            Comm.Status.WAS = {};
        }

        if (Comm.Status.DB == null) {
            Comm.Status.DB = {};
        }

        if (Comm.Status.WebServer == null) {
            Comm.Status.WebServer = {};
        }

        if (Comm.Status.TP == null) {
            Comm.Status.TP = {};
        }

        if (Comm.Status.TUX == null) {
            Comm.Status.TUX = {};
        }

        if (Comm.Status.CD == null) {
            Comm.Status.CD = {};
        }
    },

    /**
     * 라이센스가 만료된 WAS를 체크해서 목록을 구성.
     */
    initCheckExpiredLicense: function() {
        var wasid;
        var license;
        var ix, jx, ixLen, jxLen;
        var isExpired;

        for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
            wasid = Comm.wasIdArr[ix];
            isExpired = false;

            if (Comm.wasInfoObj[wasid] != null) {

                for (jx = 0, jxLen = realtime.HostRelWAS.length; jx < jxLen; jx++) {
                    if (wasid == realtime.HostRelWAS[jx][1]) {
                        license = realtime.HostRelWAS[jx][2];

                        if (license === realtime.License.EXPIRE ||
                            (!Ext.isEmpty(license) && realtime.LicenseType.indexOf(license) === -1)) {
                            isExpired = true;
                        }
                    }
                    if (isExpired  === true) {
                        break;
                    }
                }

                if (isExpired  === true) {
                    Comm.Status.WAS[wasid] = realtime.alarms.LICENSE;

                    if (realtime.expiredServer.indexOf(wasid) === -1) {
                        realtime.expiredServer.push(wasid);
                    }
                }
            }
        }
    },

    /**
     * 해당 WAS의 라이센스 만료 유무 반환
     *
     * @param {number} wasId
     * @return {boolean} true: Expired, false: valid license
     */
    isExpiredLicense: function(wasId) {
        var isExpired = false;

        if (realtime.expiredServer.indexOf(wasId) !== -1) {
            isExpired = true;
        }
        return isExpired;
    },

    /**
     * 상태값이 다운에 해당하는지 체크.
     *
     * @param {String} status - 서버 상태 값
     * @return {boolean} true: Down Status, false: Boot Status
     */
    isDown: function(status) {
        var isDown;

        switch (status) {
            case realtime.alarms.TP_DOWN :
            case realtime.alarms.API_DOWN :
            case realtime.alarms.SERVER_DOWN :
            case realtime.alarms.SERVER_HANG :
            case realtime.alarms.DISCONNECTED :
                isDown = true;
                break;
            default:
                isDown = false;
                break;
        }
        return isDown;
    },

    /**
     * 해당 WAS의 다운 유무를 반환.
     *
     * @param {Number|string} id - WAS ID
     * @return {boolean} true: WAS Down, false: WAS Boot
     */
    isDownByID: function(id) {
        var isDown;
        var status = Comm.Status.WAS[id];

        switch (status) {
            case realtime.alarms.TP_DOWN :
            case realtime.alarms.API_DOWN :
            case realtime.alarms.SERVER_DOWN :
            case realtime.alarms.SERVER_HANG :
            case realtime.alarms.DISCONNECTED :
                isDown = true;
                break;
            default:
                isDown = false;
                break;
        }
        return isDown;
    },

    /**
     * 해당 서버의 다운 유무를 반환.
     *
     * @param {Number|string} id - Server ID
     * @param {string} serverType - Server Type
     * @return {boolean} true: WAS Down, false: WAS Boot
     */
    isDownByServer: function(serverId, serverType) {
        if (serverType === 'TP' || !serverType) {
            serverType = 'WAS';

        } else if (serverType === 'WEB') {
            serverType = 'WebServer';

        } else if (serverType === 'CD') {
            serverType = 'CD';
        }

        var isDown;
        var status = Comm.Status[serverType][serverId];

        switch (status) {
            case realtime.alarms.TP_DOWN :
            case realtime.alarms.API_DOWN :
            case realtime.alarms.SERVER_DOWN :
            case realtime.alarms.DISCONNECTED :
                isDown = true;
                break;
            default:
                isDown = false;
                break;
        }
        return isDown;
    },


    /**
     * 해당 Host의 다운 유무를 반환.
     *
     * @param {string} hostName - Host Name
     * @return {boolean} true: Down host, false: Live host
     */
    isDownByHostName: function(hostName) {
        var downCount = 0;
        var isHostDown = false;
        var ix, ixLen, status, wasIdArr;

        wasIdArr = Comm.RTComm.WASListByHostName(hostName, true);

        for (ix = 0, ixLen = wasIdArr.length; ix < ixLen; ix++) {
            status = Comm.Status.WAS[wasIdArr[ix]];

            switch (status) {
                case realtime.alarms.TP_DOWN :
                case realtime.alarms.API_DOWN :
                case realtime.alarms.SERVER_DOWN :
                case realtime.alarms.SERVER_HANG :
                case realtime.alarms.DISCONNECTED :
                    downCount++;
                    break;
                default:
                    break;
            }
        }
        isHostDown = wasIdArr.length === downCount;

        return isHostDown;
    },


    /**
     * Get WAS ID List By Status.
     * Status: Server Down, Disconnect
     *
     * @return {Array} WAS ID
     */
    getDownWasIdArr: function() {
        return Comm.RTComm.getWasIdArrByStatus([
            realtime.alarms.SERVER_DOWN,
            realtime.alarms.DISCONNECTED
        ]);
    },


    /**
     * Get Host Names of Down Status.
     *
     * @return {Array} Host Names
     */
    getDownHostNames: function() {
        var downHostNames = [];
        var wasIdArr = Comm.RTComm.getDownWasIdArr();
        var ix, ixLen, hostName;

        for (ix = 0, ixLen = wasIdArr.length; ix < ixLen; ix++) {
            hostName = Comm.RTComm.HostRelWAS(wasIdArr[ix]);

            if (hostName && downHostNames.indexOf(hostName) === -1) {
                downHostNames[downHostNames.length] = hostName;
            }
        }

        try {
            return downHostNames;
        } finally {
            downHostNames = null;
        }
    },


    /**
     * Get WAS ID List By Status.
     *
     * @param {string | Array} status - Server Status
     * @return {Array} WAS ID
     */
    getWasIdArrByStatus: function(status) {
        var wasArr = [];
        var ix, ixLen, wasId;

        for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
            wasId = Comm.wasIdArr[ix];

            if (Array.isArray(status) === true) {
                if (status.indexOf(Comm.Status.WAS[wasId]) !== -1) {
                    wasArr[wasArr.length] = wasId;
                }

            } else {
                if (Comm.Status.WAS[wasId] === status) {
                    wasArr[wasArr.length] = wasId;
                }
            }
        }
        return wasArr;
    },


    /**
     *  서버 ID 배열을 반환
     *
     * @param {string} type - 서버 타입
     * @param {boolean} isSelected - 선택된 서버 유무
     * @return {array} 서버 ID 목록
     */
    getServerIdArr: function(type, isSelected) {
        var idArr = [],
            ix, ixLen;

        if (type === 'WAS' || !type) {
            if (isSelected) {
                idArr = Comm.selectedWasArr.concat();
            } else {
                idArr = Comm.wasIdArr.concat();
            }

            for (ix = 0, ixLen = idArr.length; ix < ixLen;) {
                if (Comm.wasInfoObj[idArr[ix]] && Comm.wasInfoObj[idArr[ix]].type !== 'WAS') {
                    idArr.splice(ix, 1);
                    ix--;
                }
                ix++;
            }

        } else if (type === 'TP') {
            if (isSelected) {
                idArr = Comm.selectedTpArr;
            } else {
                idArr = Comm.tpIdArr;
            }

        } else if (type === 'TUX') {
            if (isSelected) {
                idArr = Comm.selectedTuxArr;
            } else {
                idArr = Comm.tuxIdArr;
            }

        } else if (type === 'WEB') {
            if (isSelected) {
                idArr = Comm.selectedWebArr;
            } else {
                idArr = Comm.webIdArr;
            }

        } else if (type === 'CD') {
            if (isSelected) {
                idArr = Comm.selectedCdArr;
            } else {
                idArr = Comm.cdIdArr;
            }

        } else if (type === 'E2E') {
            if (isSelected) {
                idArr = realtime.eteSelectedServerList;
            } else {
                idArr = realtime.eteMonitorServerList;
            }
        }

        return idArr;
    },


    /**
     * 선택된 서버 ID 배열을 반환
     *
     * @param {string} type - 서버타입
     * @return {array} 서버 ID 배열
     */
    getSelectedIdArr: function(type) {
        return Comm.RTComm.getServerIdArr(type, true);
    },


    /**
     *  지정된 서버 ID 배열을 설정
     *
     * @param {array} list - ID 배열
     * @param {string} type - 서버타입
     */
    setSelectedIdArr: function(list, type) {
        if (!list) {
            return;
        }

        if (type === 'WAS' || !type) {
            Comm.selectedWasArr = list.concat();

        } else if (type === 'TP') {
            Comm.selectedTpArr = list.concat();

        } else if (type === 'CD') {
            Comm.selectedCdArr = list.concat();

        } else if (type === 'WEB') {
            Comm.selectedWebArr = list.concat();
        }

        list = null;
        type = null;
    },


    /**
     * 서버명 배열을 반환
     *
     * @param {string} type - 서버 타입
     * @param {boolean} isSelected - 선택된 서버 유무
     * @return {array} 서버명 배열
     */
    getServerNameArr: function(type, isSelected) {
        var idArr, nameArr, ix, ixLen;

        if (type === 'WAS' || !type) {
            nameArr = [];
            idArr = Comm.RTComm.getServerIdArr(type, isSelected);

            for (ix = 0, ixLen = idArr.length; ix < ixLen;) {
                if (Comm.wasInfoObj[idArr[ix]]) {
                    nameArr.push(Comm.wasInfoObj[idArr[ix]].wasName);
                }
                ix++;
            }

        } else if (type === 'TP') {
            if (isSelected) {
                nameArr = Comm.RTComm.getSelectedTPNames();
            } else {
                nameArr = Comm.tpNameArr;
            }

        } else if (type === 'TUX') {
            if (isSelected) {
                nameArr = Comm.RTComm.getSelectedTuxNames();
            } else {
                nameArr = Comm.tuxNameArr;
            }

        } else if (type === 'WEB') {
            if (isSelected) {
                nameArr = Comm.RTComm.getSelectedWebNames();
            } else {
                nameArr = Comm.webNameArr;
            }

        } else if (type === 'CD') {
            if (isSelected) {
                nameArr = Comm.RTComm.getSelectedCDNames();
            } else {
                nameArr = Comm.cdNameArr;
            }
        }
        return nameArr;
    },

    /**
     * 서버명 배열을 반환
     *
     * @param {boolean} isSelected - 선택된 서버 유무
     * @return {array} 서버명 배열
     */
    getAllServerNameArr: function(isSelected) {
        var ix, ixLen;
        var nameArr = [];

        if (isSelected) {
            nameArr = realtime.eteSelectedServerNames.concat();

        } else {
            for (ix = 0, ixLen = realtime.eteMonitorServerList.length; ix < ixLen; ix++ ) {
                nameArr.push(realtime.eteMonitorServerList[ix].name);
            }
        }
        return nameArr;
    },


    /**
     * 선택된 서버명 배열을 반환
     *
     * @param {string} monitorType - 모니터링 서버 타입
     * @param {string} openViewType - 모너티렁 화면 타입
     * @return {array} - 선택된 서버명 배열
     */
    getSelectedNameArr: function(monitorType, openViewType) {
        if (openViewType === 'E2E') {
            return Comm.RTComm.getAllServerNameArr(true);
        } else {
            return Comm.RTComm.getServerNameArr(monitorType, true);
        }
    },


    /**
     * 선택된 WAS 서버명 배열 반환
     *
     * @return {array}
     */
    getSelectedWASNames: function() {
        var ix, ixLen;
        var nameArr = [];

        if (Comm.wasIdArr.length === Comm.selectedWasArr.length) {
            return nameArr;
        }

        for (ix = 0, ixLen = Comm.selectedWasArr.length; ix < ixLen; ix++ ) {
            nameArr.push(Comm.wasInfoObj[Comm.selectedWasArr[ix]].wasName);
        }
        return nameArr;
    },


    /**
     * 선택된 TP 서버명 배열 반환
     *
     * @return {array}
     */
    getSelectedTPNames: function() {
        var ix, ixLen;
        var nameArr = [];

        if (Comm.tpIdArr.length === Comm.selectedTpArr.length) {
            return nameArr;
        }

        for (ix = 0, ixLen = Comm.selectedTpArr.length; ix < ixLen; ix++ ) {
            nameArr.push(Comm.tpInfoObj[Comm.selectedTpArr[ix]].name);
        }
        return nameArr;
    },

    /**
     * 선택된 TUX 서버명 배열 반환
     *
     * @return {array}
     */
    getSelectedTuxNames: function() {
        var ix, ixLen;
        var nameArr = [];

        if (Comm.tuxIdArr.length === Comm.selectedTuxArr.length) {
            return nameArr;
        }

        for (ix = 0, ixLen = Comm.selectedTuxArr.length; ix < ixLen; ix++ ) {
            nameArr.push(Comm.tuxInfoObj[Comm.selectedTuxArr[ix]].name);
        }
        return nameArr;
    },


    /**
     * 선택된 WEB 서버명 배열 반환
     *
     * @return {array}
     */
    getSelectedWebNames: function() {
        var ix, ixLen;
        var nameArr = [];

        if (Comm.webIdArr.length === Comm.selectedWebArr.length) {
            return nameArr;
        }

        for (ix = 0, ixLen = Comm.selectedWebArr.length; ix < ixLen; ix++ ) {
            nameArr.push(Comm.webServersInfo[Comm.selectedWebArr[ix]].name);
        }
        return nameArr;
    },


    /**
     * 선택된 C Daemon 서버명 배열 반환
     *
     * @return {array}
     */
    getSelectedCDNames: function() {
        var ix, ixLen;
        var nameArr = [];

        if (Comm.cdIdArr.length === Comm.selectedCdArr.length) {
            return nameArr;
        }

        for (ix = 0, ixLen = Comm.selectedCdArr.length; ix < ixLen; ix++ ) {
            nameArr.push(Comm.cdInfoObj[Comm.selectedCdArr[ix]].name);
        }
        return nameArr;
    },


    /**
     * 현재 모니터링하고 있는 화면에서 선택된 서버ID 목록을 반환
     * 예) C Daemon 모니터링 화면을 표시하고 있는 경우
     *     C Daemon 모니터링 화면에서 선택되어 있는 서버ID 목록을 반환.
     *
     * @return {array} 선택된 서버 ID 목록
     */
    getSelectedServerIdArr: function() {
        var openViewType = Comm.RTComm.getCurrentMonitorType();
        var serverIdArr  = Comm.RTComm.getServerIdArr(openViewType, true).concat();

        return serverIdArr;
    },

    /**
     * 서버 타입 및 서버 ID 별로 서버 상태 값을 반환
     *
     * @param {string} serverType
     * @param {number | string} serverId
     * @return {string}
     */
    getServerStatus: function(serverType, serverId) {
        var status = '';

        if (serverType === 'TP') {
            serverType = 'WAS';

        } else if (serverType === 'TUX') {
            serverType = 'TUX';

        } else if (serverType === 'WEB') {
            serverType = 'WebServer';

        } else if (serverType === 'CD') {
            serverType = 'CD';
        }
        if (serverType && serverId) {
            status = Comm.Status[serverType][serverId];
        }

        return status;
    },


    /**
     * 현재 화면의 테마정보를 반환.
     *
     * @return {string} Black, Gray, White
     */
    getCurrentTheme: function() {
        var theme = Comm.web_env_info.Intermax_MyTheme ||
            Comm.beforeTheme ||
            sessionStorage.getItem('Intermax_MyTheme') ||
            realtime.themeType.GRAY;

        if (sessionStorage.getItem('Intermax_MyTheme')) {
            sessionStorage.removeItem('Intermax_MyTheme');
        }

        return theme;
    },

    /**
     * 현재 화면의 테마 정보에 맞는 에디트 테마명을 반환.
     *
     * @return {string} 에디트 테마명
     */
    getEditTheme: function() {
        var editTheme;
        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                editTheme = 'ace/theme/dark_imx';
                break;
            case 'White' :
                editTheme = 'ace/theme/eclipse';
                break;
            default :
                editTheme = 'ace/theme/dark_imx';
                break;
        }
        return editTheme;
    },

    /**
     * 실시간 페킷으로 들어오는 시간의 날짜값을 반환.
     *
     * @return {String} 날짜값
     */
    getRealDate: function() {
        var temp = new Date(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(temp) !== true) {
            console.debug('%cGet Realdate function() - Invalid Date: ' + realtime.lastestTime, 'color:#800000;background-color:silver;font-size:14px;');

            if (realtime.beforeLastestTime == null) {
                realtime.beforeLastestTime = +new Date();
            }
            temp = new Date(realtime.beforeLastestTime);
        } else {
            realtime.beforeLastestTime = realtime.lastestTime;
        }

        return Ext.Date.format(temp, 'Y-m-d');
    },


    /**
     * 타입에 따른 대시보드 화면의 구성 정보를 반환
     *
     * @param {string} type - 뷰 타입
     * @return {string} Componet 구성정보
     */
    getDockLayer: function(type) {
        var layer;

        switch (type) {
            case 'RealtimeMonitor' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":968,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":733,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":405,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":1028,"items":[{"cls":"rtm.src.rtmActivityMonitor","layout":"vbox","flex":208,"items":[],"frameOption":null},{"cls":"rtm.src.rtmActiveTxnCount","layout":"fit","flex":192,"items":[],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmTransactionMonitor","layout":"fit","flex":617,"items":[],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":323,"items":[{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":1028,"items":[],"frameOption":null},{"cls":"rtm.src.rtmServiceStat","layout":"fit","flex":617,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmActiveTxnList","layout":"fit","flex":230,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'ManagerView' :
                layer = '[{"cls":"Ext.container.Container","layout":"hbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":465,"items":[{"cls":"rtm.src.rtmActiveTxnList","layout":"fit","flex":506,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTopTransaction","layout":"fit","flex":318,"items":[],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":658,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":606,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":207,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"rtm.src.rtmActivityMonitor","layout":"vbox","flex":167,"items":[],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":394,"items":[{"cls":"rtm.src.rtmActiveTxnCount","layout":"fit","flex":150,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":239,"items":[{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":350,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62033-cmp"},{"cls":"rtm.src.rtmTransactionMonitor","layout":"fit","flex":303,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmServiceStat","layout":"fit","flex":218,"items":[],"frameOption":null,"componentId":"dash-rtm-servicestat-ext-8065-cmp"}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'MultiInstance' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":789,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":392,"items":[{"cls":"rtm.src.rtmActiveTxnCount","layout":"fit","flex":561,"items":[],"frameOption":null},{"cls":"Exem.TabPanel","layout":"card","flex":562,"items":[{"cls":"rtm.src.rtmServiceStat","layout":"fit","flex":562,"items":[],"frameOption":null,"componentId":"dash-rtm-servicestat-ext-8806-cmp"},{"cls":"rtm.src.rtmConnectionPool","layout":"fit","flex":562,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":392,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62034-cmp"}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'WASDBView' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":789,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":159,"items":[{"cls":"rtm.src.rtmActivityMonitor","layout":"vbox","flex":680,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":443,"items":[{"cls":"rtm.src.rtmDatabase","layout":"fit","flex":218,"items":[],"frameOption":null},{"cls":"rtm.src.rtmConnectionPool","layout":"fit","flex":220,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":625,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":264,"items":[{"cls":"rtm.src.rtmActiveTxnCount","layout":"fit","flex":370,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":753,"items":[{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":527,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62035-cmp"},{"cls":"rtm.src.rtmTransactionMonitor","layout":"fit","flex":221,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":356,"items":[{"cls":"rtm.src.rtmActiveTxnList","layout":"fit","flex":716,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTopSQL","layout":"fit","flex":407,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'DBView' :
                layer = '';
                break;
            case 'SysResource' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":789,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62036-cmp"}],"frameOption":null}]';
                break;
            case 'Memory' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":789,"items":[{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":392,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62037-cmp"},{"cls":"rtm.src.rtmGCStat","layout":"fit","flex":392,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'User' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":789,"items":[{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":561,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62038-cmp"},{"cls":"rtm.src.rtmServiceStat","layout":"fit","flex":562,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'RealtimeMonitor2' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":789,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":492,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":752,"items":[{"cls":"rtm.src.rtmActivityMonitor","layout":"vbox","flex":140,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":347,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":397,"items":[{"cls":"rtm.src.rtmActiveTxnCount","layout":"fit","flex":171,"items":[],"frameOption":null},{"cls":"rtm.src.rtmConnectionPool","layout":"fit","flex":171,"items":[],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":200,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62032-cmp"}],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmTransactionMonitor","layout":"fit","flex":371,"items":[],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":400,"items":[{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":751,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62031-cmp"},{"cls":"rtm.src.rtmServiceStat","layout":"fit","flex":372,"items":[],"frameOption":null,"componentId":"dash-rtm-servicestat-ext-1690-cmp"}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'RealtimeMonitor3' :
                layer = '[{"defaultFrameVersion":"' + this.layoutVersion.WAS3 + '", "cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAgentList","layout":"fit","flex":32,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":886,"items":[{"cls":"rtm.src.rtmActivityMonitor","layout":"vbox","flex":140,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":741,"items":[{"cls":"rtm.src.rtmActiveTxnCount","layout":"fit","flex":120,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":616,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":128,"items":[{"cls":"rtm.src.rtmUsageOSCpu","layout":"fit","flex":467,"items":[],"frameOption":null},{"cls":"rtm.src.rtmUsageJVMCpu","layout":"fit","flex":741,"items":[],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":491,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":248,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":919,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":120,"items":[{"cls":"rtm.src.rtmServiceStatTrend","layout":"fit","flex":453,"items":[],"frameOption":null,"componentId":"dash-rtm-servicestat-ext-81000-cmp"},{"cls":"rtm.src.rtmConcurrentUserStat","layout":"fit","flex":461,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62048-cmp"}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":123,"items":[{"cls":"rtm.src.rtmServiceStatTrend","layout":"fit","flex":453,"items":[],"frameOption":null,"componentId":"dash-rtm-servicestat-ext-81001-cmp"},{"cls":"Ext.container.Container","layout":"hbox","flex":461,"items":[{"cls":"rtm.src.rtmPerformanceTotalStat","layout":"fit","flex":228,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62045-cmp"},{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":228,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62047-cmp"}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmTransactionMonitor","layout":"fit","flex":255,"items":[],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":238,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":117,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":453,"items":[{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":224,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62039-cmp"},{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":224,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62042-cmp"}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":721,"items":[{"cls":"rtm.src.rtmPerformanceTotalStat","layout":"fit","flex":230,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62040-cmp"},{"cls":"Ext.container.Container","layout":"hbox","flex":486,"items":[{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":227,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62041-cmp"},{"cls":"rtm.src.rtmPerformanceStat","layout":"fit","flex":254,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62043-cmp"}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":116,"items":[{"cls":"rtm.src.rtmVisitorCounter","layout":"fit","flex":454,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":720,"items":[{"cls":"rtm.src.rtmTxnExecutionCount","layout":"fit","flex":460,"items":[],"frameOption":null},{"cls":"rtm.src.rtmDatabase","layout":"fit","flex":255,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'RealtimeMonitor4' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":504,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":231,"items":[{"cls":"rtm.src.rtmActivityGroup","layout":"vbox","flex":763,"items":[],"frameOption":null,"componentId":"dash-rtm-activity-group-ext-70101-cmp"},{"cls":"rtm.src.rtmActivityGroup","layout":"vbox","flex":763,"items":[],"frameOption":null,"componentId":"dash-rtm-activity-group-ext-70102-cmp"}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":268,"items":[{"cls":"rtm.src.rtmActivityGroup","layout":"vbox","flex":763,"items":[],"frameOption":null,"componentId":"dash-rtm-activity-group-ext-70103-cmp"},{"cls":"rtm.src.rtmActivityGroup","layout":"vbox","flex":763,"items":[],"frameOption":null,"componentId":"dash-rtm-activity-group-ext-70104-cmp"}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":210,"items":[{"cls":"rtm.src.rtmActivityGroup","layout":"vbox","flex":763,"items":[],"frameOption":null,"componentId":"dash-rtm-activity-group-ext-70105-cmp"},{"cls":"rtm.src.rtmActivityGroup","layout":"vbox","flex":763,"items":[],"frameOption":null,"componentId":"dash-rtm-activity-group-ext-70106-cmp"}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'AIMonitor' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":388,"items":[{"cls":"rtm.src.rtmDashboardAlarm","layout":"fit","flex":632,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":1268,"items":[{"cls":"rtm.src.rtmDashTxnLoadPredict","layout":"fit","flex":192,"items":[],"frameOption":null,"componentId":"rtm-ext-190-cmp"},{"cls":"rtm.src.rtmDashTxnLoadPredict1","layout":"fit","flex":191,"items":[],"frameOption":null,"componentId":"rtm-ext-211-cmp"}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":564,"items":[{"cls":"rtm.src.rtmDashLoadPredictMCA","layout":"fit","flex":631,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":1269,"items":[{"cls":"rtm.src.rtmDashLoadPredictCBS","layout":"fit","flex":633,"items":[],"frameOption":null},{"cls":"rtm.src.rtmDashLoadPredictFEP","layout":"fit","flex":631,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'AIMonitor2' :
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":825,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":334,"items":[{"cls":"rtm.src.rtmDashboardInstanceInfo","layout":"fit","flex":632,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":1268,"items":[{"cls":"rtm.src.rtmDashTxnLoadPredict2","layout":"fit","flex":165,"items":[],"frameOption":null,"componentId":"rtm-ext-190-cmp"},{"cls":"rtm.src.rtmDashTxnLoadPredict3","layout":"fit","flex":164,"items":[],"frameOption":null,"componentId":"rtm-ext-211-cmp"}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":486,"items":[{"cls":"rtm.src.rtmDashAbnormalStatSummary","layout":"fit","flex":631,"items":[],"frameOption":null},{"cls":"rtm.src.rtmDashAbnormalStatInfo","layout":"fit","flex":1269,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmDashAbnormalLogInfo","layout":"fit","flex":127,"items":[],"frameOption":null}],"frameOption":null}]';
                break;
            case 'TopologyView':
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmAlertInfo","layout":"fit","flex":35,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTopologyView","layout":"fit","flex":968,"items":[],"frameOption":null}],"frameOption":null}]';
                break;
            case 'TPMonitor':
                layer = '[{"defaultFrameVersion":"' + this.layoutVersion.TP + '", "cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmTPAgentList","layout":"fit","flex":40,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":908,"items":[{"cls":"rtm.src.rtmTPAlertInfo","layout":"fit","flex":50,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":853,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":705,"items":[{"cls":"rtm.src.rtmTPActivityMonitor","layout":"vbox","flex":140,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":560,"items":[{"cls":"rtm.src.rtmTPActiveTxnCount","layout":"fit","flex":120,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":435,"items":[{"cls":"rtm.src.rtmTPUsageCpu","layout":"fit","flex":120,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":310,"items":[{"cls":"rtm.src.rtmTPTrendStat","layout":"fit","flex":698,"items":[],"frameOption":null,"componentId":"rtm-was-ext-62049-cmp"},{"cls":"Ext.container.Container","layout":"vbox","flex":513,"items":[{"cls":"rtm.src.rtmTPTransactionMonitor","layout":"fit","flex":153,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTPActiveTxnList","layout":"fit","flex":152,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":143,"items":[{"cls":"rtm.src.rtmTPSlog","layout":"fit","flex":700,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTPTmadmin","layout":"fit","flex":511,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'TPtmadminMonitor':
                layer = '[{"cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":333,"items":[{"cls":"rtm.src.rtmTPTmadmin","layout":"fit","flex":823,"items":[],"frameOption":null,"componentId":"dash-rtm-rtmTPTmadmin-ext-70001-cmp"},{"cls":"rtm.src.rtmTPTmadmin","layout":"fit","flex":822,"items":[],"frameOption":null,"componentId":"dash-rtm-rtmTPTmadmin-ext-70002-cmp"}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":520,"items":[{"cls":"rtm.src.rtmTPTmadmin","layout":"fit","flex":823,"items":[],"frameOption":null,"componentId":"dash-rtm-rtmTPTmadmin-ext-70003-cmp"},{"cls":"rtm.src.rtmTPTmadmin","layout":"fit","flex":822,"items":[],"frameOption":null,"componentId":"dash-rtm-rtmTPTmadmin-ext-70004-cmp"}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'WebMonitor':
                layer = '[{"defaultFrameVersion":"' + this.layoutVersion.WEB + '", "cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":310,"items":[{"cls":"rtm.src.rtmWebAgentList","layout":"fit","flex":32,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":273,"items":[{"cls":"rtm.src.rtmWebActivityMonitor","layout":"vbox","flex":143,"items":[],"frameOption":null},{"cls":"rtm.src.rtmWebActiveTxnCount","layout":"fit","flex":125,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":633,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":798,"items":[{"cls":"rtm.src.rtmWebTrendStat","layout":"fit","flex":319,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62050-cmp"},{"cls":"Ext.container.Container","layout":"hbox","flex":309,"items":[{"cls":"rtm.src.rtmWebTrendStat","layout":"fit","flex":396,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62051-cmp"},{"cls":"Ext.container.Container","layout":"vbox","flex":397,"items":[{"cls":"rtm.src.rtmWebResponseStatus","layout":"fit","flex":151,"items":[],"frameOption":null,"componentId":"rtm-ext-3695-cmp"},{"cls":"rtm.src.rtmWebVisitorCounter","layout":"fit","flex":153,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":455,"items":[{"cls":"rtm.src.rtmWebTransactionMonitor","layout":"fit","flex":319,"items":[],"frameOption":null},{"cls":"rtm.src.rtmWebActiveTxnList","layout":"fit","flex":309,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'WebMonitorWebToB':
                layer = '[{"defaultFrameVersion":"' + this.layoutVersion.WTB + '", "cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":304,"items":[{"cls":"rtm.src.rtmWebAgentList","layout":"fit","flex":32,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":267,"items":[{"cls":"rtm.src.rtmWebActivityMonitor","layout":"vbox","flex":140,"items":[],"frameOption":null},{"cls":"rtm.src.rtmWebActiveTxnCount","layout":"fit","flex":122,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":621,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":771,"items":[{"cls":"rtm.src.rtmWebTrendStat","layout":"fit","flex":313,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62050-cmp"},{"cls":"Ext.container.Container","layout":"hbox","flex":303,"items":[{"cls":"rtm.src.rtmWebTrendStat","layout":"fit","flex":382,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62051-cmp"},{"cls":"Ext.container.Container","layout":"vbox","flex":384,"items":[{"cls":"rtm.src.rtmWebResponseStatus","layout":"fit","flex":148,"items":[],"frameOption":null,"componentId":"rtm-ext-3695-cmp"},{"cls":"rtm.src.rtmWebVisitorCounter","layout":"fit","flex":150,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":440,"items":[{"cls":"rtm.src.rtmWebTransactionMonitor","layout":"fit","flex":212,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":404,"items":[{"cls":"Exem.TabPanel","layout":"card","flex":200,"items":[{"cls":"rtm.src.rtmWebActiveTxnList","layout":"fit","flex":440,"items":[],"frameOption":null},{"cls":"rtm.src.rtmWebBlockRun","layout":"fit","flex":440,"items":[],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmWebadmin","layout":"fit","flex":199,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'CDMonitor':
                layer = '[{"defaultFrameVersion":"' + this.layoutVersion.CD + '", "cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":598,"items":[{"cls":"rtm.src.rtmCDAgentList","layout":"fit","flex":32,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":561,"items":[{"cls":"rtm.src.rtmCDActivityMonitor","layout":"vbox","flex":140,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":416,"items":[{"cls":"rtm.src.rtmCDTrendStat","layout":"fit","flex":698,"items":[],"frameOption":null,"componentId":"dash-rtm-was-ext-62052-cmp"},{"cls":"rtm.src.rtmCDTransactionMonitor","layout":"fit","flex":555,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmCDAlertLight","layout":"fit","flex":345,"items":[],"frameOption":null}],"frameOption":null}]';
                break;
            case 'E2EMonitor':
                layer = '[{"defaultFrameVersion":"' + this.layoutVersion.EtoE + '","cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":743,"items":[{"cls":"rtm.src.rtmEtoEAlertInfo","layout":"fit","flex":50,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":688,"items":[{"cls":"rtm.src.rtmTierMetrics","layout":"fit","flex":253,"items":[],"frameOption":null,"componentId":"rtm-was-ext-62037-cmp"},{"cls":"rtm.src.rtmTierGroupTrend","layout":"fit","flex":430,"items":[],"frameOption":null,"componentId":"rtm-ext-690-cmp"}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":255,"items":[{"cls":"rtm.src.rtmEtoETopTransaction","layout":"fit","flex":563,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":1082,"items":[{"cls":"rtm.src.rtmTopSQL","layout":"fit","flex":537,"items":[],"frameOption":null},{"cls":"Exem.TabPanel","layout":"card","flex":540,"items":[{"cls":"rtm.src.rtmEtoEAlertLight","layout":"fit","flex":540,"items":[],"frameOption":null},{"cls":"rtm.src.rtmDatabase","layout":"fit","flex":540,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            case 'TaskMonitor':
                //1번 째 화면
                if (common.Menu.useEtoEChartMonitoring) {
                    layer = '[{"defaultFrameVersion":"' + this.layoutVersion.EtoEBIZ + '","cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmEtoEAlertInfo","layout":"fit","flex":50,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":948,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":148,"items":[{"cls":"rtm.src.rtmCDActivityMonitor","layout":"vbox","flex":935,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTPActivityMonitor","layout":"vbox","flex":934,"items":[],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":795,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":1234,"items":[{"cls":"rtm.src.rtmTrackByTask","layout":"fit","flex":625,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":425,"items":[{"cls":"rtm.src.rtmBizTPSMonitor","layout":"fit","flex":615,"items":[],"frameOption":null,"componentId":"rtm-was-ext-1838-cmp"},{"cls":"rtm.src.rtmBizElapseMonitor","layout":"fit","flex":615,"items":[],"frameOption":null,"componentId":"rtm-was-ext-1384-cmp"}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":635,"items":[{"cls":"rtm.src.rtmEtoETransactionMonitor","layout":"fit","flex":395,"items":[],"frameOption":null},{"cls":"rtm.src.rtmEtoEAlertLight","layout":"fit","flex":395,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                } else {
                    layer = '[{"defaultFrameVersion":"' + this.layoutVersion.BIZ + '","cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmEtoEAlertInfo","layout":"fit","flex":50,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":948,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":148,"items":[{"cls":"rtm.src.rtmActivityMonitor","layout":"vbox","flex":935,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTPActivityMonitor","layout":"vbox","flex":934,"items":[],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":795,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":1234,"items":[{"cls":"rtm.src.rtmTrackByTask","layout":"fit","flex":625,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":425,"items":[{"cls":"rtm.src.rtmBizTPSMonitor","layout":"fit","flex":615,"items":[],"frameOption":null,"componentId":"rtm-was-ext-1838-cmp"},{"cls":"rtm.src.rtmBizElapseMonitor","layout":"fit","flex":615,"items":[],"frameOption":null,"componentId":"rtm-was-ext-1384-cmp"}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":635,"items":[{"cls":"rtm.src.rtmTransactionMonitor","layout":"fit","flex":395,"items":[],"frameOption":null},{"cls":"rtm.src.rtmEtoEAlertLight","layout":"fit","flex":395,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                }
                break;
            case 'TaskMonitor2':
                //2번 째 화면
                layer = '[{"defaultFrameVersion":"' + this.layoutVersion.BIZ2 + '","cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":660,"items":[{"cls":"rtm.src.rtmTrackTaskSummary","layout":"fit","flex":50,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":605,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":605,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":226,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":835,"items":[{"cls":"rtm.src.rtmTrackSingleTask","layout":"fit","flex":411,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-600000-cmp"},{"cls":"rtm.src.rtmTrackSingleTask","layout":"fit","flex":419,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-600001-cmp"}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":1065,"items":[{"cls":"rtm.src.rtmTrackSingleTask","layout":"fit","flex":415,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-600002-cmp"},{"cls":"rtm.src.rtmBizServiceStatTrend","layout":"fit","flex":645,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-610000-cmp"}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":374,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":178,"items":[{"cls":"rtm.src.rtmBizActiveTxnCount","layout":"fit","flex":1256,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-620000-cmp"},{"cls":"rtm.src.rtmBizServiceStatTrend","layout":"fit","flex":644,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-610001-cmp"}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":191,"items":[{"cls":"Ext.container.Container","layout":"hbox","flex":834,"items":[{"cls":"rtm.src.rtmBizActiveTxnCount","layout":"fit","flex":400,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-620001-cmp"},{"cls":"rtm.src.rtmBizActiveTxnCount","layout":"fit","flex":429,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-620002-cmp"}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":1066,"items":[{"cls":"rtm.src.rtmBizActiveTxnCount","layout":"fit","flex":416,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-620003-cmp"},{"cls":"rtm.src.rtmBizServiceStatTrend","layout":"fit","flex":645,"items":[],"frameOption":null, "componentId":"dash-rtm-biz-ext-610002-cmp"}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"rtm.src.rtmAllTaskDetail","layout":"fit","flex":343,"items":[],"frameOption":null}],"frameOption":null}]';
                break;
            case 'TuxMonitor':
                layer = '[{"defaultFrameVersion":"' + this.layoutVersion.Tux + '", "cls":"Ext.container.Container","layout":"vbox","flex":1,"items":[{"cls":"rtm.src.rtmTuxAgentList","layout":"fit","flex":40,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":923,"items":[{"cls":"rtm.src.rtmTuxAlertInfo","layout":"fit","flex":50,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":868,"items":[{"cls":"Ext.container.Container","layout":"vbox","flex":718,"items":[{"cls":"rtm.src.rtmTuxActivityMonitor","layout":"vbox","flex":142,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":571,"items":[{"cls":"rtm.src.rtmTuxActiveTxnCount","layout":"fit","flex":122,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"vbox","flex":444,"items":[{"cls":"rtm.src.rtmTuxUsageCpu","layout":"fit","flex":122,"items":[],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":317,"items":[{"cls":"rtm.src.rtmTuxTrendStat","layout":"fit","flex":948,"items":[],"frameOption":null,"componentId":"rtm-was-ext-62053-cmp"},{"cls":"Ext.container.Container","layout":"vbox","flex":697,"items":[{"cls":"rtm.src.rtmTuxTransactionMonitor","layout":"fit","flex":157,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTuxActiveTxnList","layout":"fit","flex":155,"items":[],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null},{"cls":"Ext.container.Container","layout":"hbox","flex":145,"items":[{"cls":"rtm.src.rtmTuxULOG","layout":"fit","flex":823,"items":[],"frameOption":null},{"cls":"rtm.src.rtmTuxTmadmin","layout":"fit","flex":822,"items":[],"frameOption":null,"componentId":"rtm-ext-1245-cmp"}],"frameOption":null}],"frameOption":null}],"frameOption":null}],"frameOption":null}]';
                break;
            default:
                break;
        }

        return layer;
    },

    /**
     * 대시보드 화면에서 Component ID에 해당하는 성능 지표 정보 반환
     */
    getDashboardWasChartStat: function(id) {
        if (realtime.isDashboardView !== true && Comm.RTComm.getCurrentViewIndex() > 0) {
            return;
        }

        var statInfo = {
            'dash-rtm-was-ext-62031-cmp':'REQUEST_RATE,ACTIVE_TRANSACTION,ACTIVE_DB_SESSIONS,TPS,ACTIVE_USERS,DB_SESSIONS',
            'dash-rtm-was-ext-62032-cmp':'ACTIVE_TRANSACTION',
            'dash-rtm-was-ext-62033-cmp':'ACTIVE_USERS,TPS',
            'dash-rtm-was-ext-62034-cmp':'REQUEST_RATE,ACTIVE_TRANSACTION,ACTIVE_DB_SESSIONS,JVM_CPU_USAGE,TPS,ACTIVE_USERS,DB_SESSIONS,OS_CPU_USER',
            'dash-rtm-was-ext-62035-cmp':'DB_SESSIONS,ACTIVE_DB_SESSIONS,SQL_EXEC_COUNT',
            'dash-rtm-was-ext-62036-cmp':'OS_CPU_USER,OS_CPU_SYS,OS_CPU_IO,JVM_CPU_USAGE,OS_TOTAL_MEM,OS_FREE_MEM,JVM_MEM_SIZE,JVM_USED_HEAP,JVM_FREE_HEAP,JVM_HEAP_SIZE,OS_SEND_PACKETS,OS_RCV_PACKETS',
            'dash-rtm-was-ext-62037-cmp':'JVM_USED_HEAP,JVM_FREE_HEAP,JVM_HEAP_SIZE,OS_TOTAL_MEM,JVM_MEM_SIZE,SQL_FETCH_COUNT',
            'dash-rtm-was-ext-62038-cmp':'WAS_SESSION,TPS,ACTIVE_USERS,ACTIVE_TRANSACTION',
            'dash-rtm-was-ext-62039-cmp':'ACTIVE_DB_SESSIONS',
            'dash-rtm-was-ext-62040-cmp':'TPS',
            'dash-rtm-was-ext-62041-cmp':'TPS',
            'dash-rtm-was-ext-62042-cmp':'DB_SESSIONS',
            'dash-rtm-was-ext-62043-cmp':'JVM_HEAP_USAGE',
            //'dash-rtm-was-ext-62044-cmp':'WAS_SESSION',
            'dash-rtm-was-ext-62045-cmp':'REQUEST_RATE',
            'dash-rtm-was-ext-62046-cmp':'WAS_SESSION',
            'dash-rtm-was-ext-62047-cmp':'REQUEST_RATE',
            'dash-rtm-was-ext-62048-cmp':'WAS_SESSION',
            'dash-rtm-was-ext-62049-cmp':'QCOUNT,COUNT,TP_TPS,TOTAL_COUNT,AQ_COUNT,AVERAGE',
            'dash-rtm-was-ext-62050-cmp': (window.isWebToB) ? 'TPS,AVERAGE,CONNECTED_CLIENTS,QCOUNT' : 'TPS,AVERAGE,COUNT,ERROR_COUNT',
            'dash-rtm-was-ext-62051-cmp':'OS_SEND_PACKETS,OS_RCV_PACKETS',
            'dash-rtm-was-ext-62052-cmp':'TPS,OS_SEND_PACKETS,TXN_ELAPSE,OS_RCV_PACKETS',
            'dash-rtm-was-ext-62053-cmp':'CUR_SERVERS,WKQUEUED,NUM_TRAN,REQ,CONNECTED_CLIENTS,WKCOMPLETED'
        };

        if (realtime.isInitConfiguraionLayout) {
            if (id.indexOf('dash-') === 0) {
                id = id.replace(/dash-/gi, '');
            }
            return statInfo['dash-' + id];
        } else {
            return statInfo[id];
        }
    },

    /**
     * 대시보드 화면에서 Component ID에 해당하는 성능 지표 차트의 옵션정보를 반환
     */
    getDashboardWasChartOption: function(id) {
        if (realtime.isDashboardView !== true &&
            (Comm.RTComm.getCurrentViewIndex() > 0 || (+Comm.RTComm.getCurrentViewIndex() === 0 && Comm.RTComm.isChartOptionByCmpID(id)) ) ) {
            return;
        }

        var optionInfo = {
            'dash-rtm-was-ext-62031-cmp' : { 'defaultLayout':[2,3], 'chartOption'  : {} },
            'dash-rtm-was-ext-62032-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62033-cmp' : { 'defaultLayout':[2,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62034-cmp' : { 'defaultLayout':[2,4], 'chartOption'  : {} },
            'dash-rtm-was-ext-62035-cmp' : { 'defaultLayout':[1,3], 'chartOption'  : {} },
            'dash-rtm-was-ext-62036-cmp' : { 'defaultLayout':[3,4], 'chartOption'  : {} },
            'dash-rtm-was-ext-62037-cmp' : { 'defaultLayout':[2,3], 'chartOption'  : {} },
            'dash-rtm-was-ext-62038-cmp' : { 'defaultLayout':[2,2], 'chartOption'  : {} },
            'dash-rtm-was-ext-62039-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62040-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62041-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62042-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62043-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            //'dash-rtm-was-ext-62044-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62045-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62046-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62047-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62048-cmp' : { 'defaultLayout':[1,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62049-cmp' : { 'defaultLayout':[3,2], 'chartOption'  : {} },
            'dash-rtm-was-ext-62050-cmp' : { 'defaultLayout':[2,2], 'chartOption'  : {} },
            'dash-rtm-was-ext-62051-cmp' : { 'defaultLayout':[2,1], 'chartOption'  : {} },
            'dash-rtm-was-ext-62052-cmp' : { 'defaultLayout':[2,2], 'chartOption'  : {} },
            'dash-rtm-was-ext-62053-cmp' : { 'defaultLayout':[3,2], 'chartOption'  : {} }
        };

        if (realtime.isInitConfiguraionLayout) {
            if (id.indexOf('dash-') === 0) {
                id = id.replace(/dash-/gi, '');
            }
            return optionInfo['dash-' + id];
        } else {
            return optionInfo[id];
        }
    },

    /**
     * 대시보드 화면에서 Component ID에 해당하는 액티비티 그룹의 구성정보를 반환
     */
    getDashboardActiveGroup: function(id) {
        if (realtime.isDashboardView !== true && Comm.RTComm.getCurrentViewIndex() > 0) {
            return;
        }

        var optionInfo = {
            'dash-rtm-activity-group-ext-70101-cmp' : Comm.bizGroups[0] ||  '',
            'dash-rtm-activity-group-ext-70102-cmp' : Comm.bizGroups[1] ||  '',
            'dash-rtm-activity-group-ext-70103-cmp' : Comm.bizGroups[2] ||  '',
            'dash-rtm-activity-group-ext-70104-cmp' : Comm.bizGroups[3] ||  '',
            'dash-rtm-activity-group-ext-70105-cmp' : Comm.bizGroups[4] ||  '',
            'dash-rtm-activity-group-ext-70106-cmp' : Comm.bizGroups[5] ||  ''
        };

        if (realtime.isInitConfiguraionLayout) {
            if (id.indexOf('dash-') === 0) {
                id = id.replace(/dash-/gi, '');
            }
            return optionInfo['dash-' + id];
        } else {
            return optionInfo[id];
        }
    },

    /**
     * 대시보드 화면에서 Component ID에 해당하는 서비스 지표 차트의 구성정보를 반환
     */
    getDashboardServiceStat: function(id) {
        if (realtime.isDashboardView !== true && Comm.RTComm.getCurrentViewIndex() > 0) {
            return;
        }

        var optionInfo = {
            'dash-rtm-servicestat-ext-81000-cmp':'concurrent_user',
            'dash-rtm-servicestat-ext-81001-cmp':'request_rate'
        };

        if (realtime.isInitConfiguraionLayout) {
            if (id.indexOf('dash-') === 0) {
                id = id.replace(/dash-/gi, '');
            }
            return optionInfo['dash-' + id];
        } else {
            return optionInfo[id];
        }
    },


    /////////////////////////////////////////////////////////////////////
    // Component Chart //////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    /**
     * 현재 모니터링 화면 Index 값을 반환.
     *
     * @return {string|number} 현재 화면 인덱스
     */
    getCurrentViewIndex: function() {
        var viewClass;
        var viewType = Comm.RTComm.getCurrentMonitorType();

        if (viewType === 'TP') {
            viewClass = 'rtmTPView';

        } else if (viewType === 'TUX') {
            viewClass = 'rtmTuxView';

        } else if (viewType === 'WEB') {
            viewClass = 'rtmWebView';

        } else if (viewType === 'CD') {
            viewClass = 'rtmCDView';

        } else if (viewType === 'E2E') {
            viewClass = 'rtmEtoEView';

        } else if (viewType === 'AI') {
            viewClass = 'rtmAIView';

        } else {
            viewClass = 'rtmView';
        }

        return Comm.web_env_info['xm-dock-save-rtm.view.' + viewClass];
    },

    /**
     * 실시간 화면별 신규 콤포넌트 ID를 만들어서 반환.
     *
     * @param {string} view - 콤포넌트 클래스 명
     * @return {string} 신규 콤포넌트 ID
     */
    getRtmComponentId: function(view) {
        var cmpId = null;

        switch (view) {
            case 'rtm.src.rtmPerformanceStat' :
            case 'rtm.src.rtmPerformanceTotalStat' :
                cmpId = 'rtm-was-' + Ext.id() + '-cmp';
                break;
            case 'rtm.src.rtmServiceStatTrend':
                cmpId = 'rtm-servicestat-' + Ext.id() + '-cmp';
                break;
            case 'rtm.src.rtmActivityGroup':
                cmpId = 'rtm-activity-group-' + Ext.id() + '-cmp';
                break;
            case 'rtm.src.rtmBizGroupPerformanceMetrics':
                cmpId = 'rtm-bizgroupmetrics-' + Ext.id() + '-cmp';
                break;
            case 'rtm.src.rtmTPTmadmin':
                cmpId = 'rtm-rtmTPTmadmin-' + Ext.id() + '-cmp';
                break;
            default:
                cmpId = 'rtm-' + Ext.id() + '-cmp';
                break;
        }
        return cmpId;
    },

    /**
     * 저장된 차트 콤포넌트인지 확인
     *
     * @param {string} id - 콤포넌트 ID
     * @return {boolean} true: 저장되어 있는 콤포넌트 ID, false: 저장되어 있지 않은 콤포넌트 ID
     */
    isSaveChartCmp: function(id) {
        var isSave;

        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var viewType = Comm.RTComm.getCurrentMonitorType();
        var viewClass, dataIndex;

        if (viewType === 'TP') {
            viewClass = 'rtmTPView';

        } else if (viewType === 'TUX') {
            viewClass = 'rtmTuxView';

        } else if (viewType === 'WEB') {
            viewClass = 'rtmWebView';

        } else if (viewType === 'CD') {
            viewClass = 'rtmCDView';

        } else if (viewType === 'E2E') {
            viewClass = 'rtmEtoEView';

        } else if (viewType === 'AI') {
            viewClass = 'rtmAIView';

        } else {
            viewClass = 'rtmView';
        }

        var data = Comm.web_env_info['xm-dock-position-rtm.view.' + viewClass + '-' + viewIndex];

        if (data != null) {
            dataIndex = data.indexOf(id);
            if (dataIndex <= 0) {
                isSave = false;
            } else {
                isSave = true;
            }
        } else {
            isSave = true;
        }
        data = null;

        return isSave;
    },

    /**
     * 성능 지표 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     *
     * @param {string} viewIndex - 화면 인덱스
     * @return {string}
     */
    getEnvKeyWasChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'WasStatList_View_' + viewIndex;
    },

    /**
     * 서비스 지표 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyServiceChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'ServiceStatList_View_' + viewIndex;
    },

    /**
     * 부하 예측 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyLoadPredictChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'LoadPredictStatList_View_' + viewIndex;
    },

    /**
     * 부하 예측 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyDashLoadPredictChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'DashLoadPredictStatList_View_' + viewIndex;
    },

    /**
     * 부하 예측 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyDashTxnLoadPredictChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'DashTxnLoadPredictStatList_View_' + viewIndex;
    },

    /**
     * 부하 예측 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyDBLoadPredictChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'DBLoadPredictStatList_View_' + viewIndex;
    },

    /**
     * 부하 예측 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyTxnLoadPredictChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'TxnLoadPredictStatList_View_' + viewIndex;
    },

    /**
     * 부하 예측 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyBizLoadPredictChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'BizLoadPredictStatList_View_' + viewIndex;
    },

    /**
     * 부하 예측 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyAnomalyDetectionChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'AnomalyDetectionStatList_View_' + viewIndex;
    },

    /**
     * 부하 예측 차트에 구성되는 지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyAnomalyDetectionDBChart: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }

        var serverType = window.rtmMonitorType || '';
        serverType = serverType.toLowerCase();

        return 'Intermax_RTM_' + serverType + 'AnomalyDetectionDBStatList_View_' + viewIndex;
    },

    /**
     * 업무그룹별 성능지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyTPtmadminGroupList: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }
        return 'Intermax_RTM_TPtmadmin_View_' + viewIndex;
    },

    /**
     * 업무그룹별 성능지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyTuxtmadminGroupList: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }
        return 'Intermax_RTM_Tuxtmadmin_View_' + viewIndex;
    },

    /**
     * 업무그룹별 성능지표 정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyBizGroupList: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }
        return 'Intermax_RTM_BizGroupMetrics_View_' + viewIndex;
    },

    /**
     * 액티브 그룹 화면에 구성되는 그룹정보를 가져오기 위한 키값을 반환.
     */
    getEnvKeyActiveGroup: function(viewIndex) {
        if (viewIndex == null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }
        return 'Intermax_RTM_ActivityGroup_View_' + viewIndex;
    },

    /**
     * 성능 지표 차트에 보여지는 지표를 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveWasStatList: function(id, statList) {
        if (id == null || statList == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyWasChart();

        var saveData;
        var viewData  = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[id] = statList;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data = {};
            viewData.data[id] = statList;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(id);

        saveData = JSON.stringify(viewData);

        if (isSave === true && realtime.isDashboardView !== true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
            realtime.viewOriginalData[saveKey] = Comm.web_env_info[ saveKey ];

        } else {
            if (realtime.viewOriginalData[saveKey] == null) {
                realtime.viewOriginalData[saveKey] = Comm.web_env_info[ saveKey ];
            }
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData  = null;
        statList  = null;
        saveData  = null;
    },

    /**
     * 화면 Index에 따른 AI 차트의 지표 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveAIDBLoadStatByView: function(viewIndex, beforeIndex) {
        var loadKey, viewData;
        var objKeys;
        var isCmp, ix, ixLen;
        var saveKey = Comm.RTComm.getEnvKeyDBLoadPredictChart(viewIndex);

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyDBLoadPredictChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyDBLoadPredictChart(viewIndex);
        }

        viewData = Comm.web_env_info[loadKey];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[loadKey];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[saveKey] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        objKeys = Object.keys(viewData);

        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    /**
     * 화면 Index에 따른 AI 차트의 지표 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveAIAnomalyDetectByView: function(viewIndex, beforeIndex) {
        var loadKey, viewData;
        var objKeys;
        var isCmp, ix, ixLen;
        var saveKey = Comm.RTComm.getEnvKeyAnomalyDetectionChart(viewIndex);

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyAnomalyDetectionChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyAnomalyDetectionChart(viewIndex);
        }

        viewData = Comm.web_env_info[loadKey];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[loadKey];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[saveKey] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        objKeys = Object.keys(viewData);

        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    /**
     * 화면 Index에 따른 AI 차트의 지표 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveAIAnomalyDetectDBByView: function(viewIndex, beforeIndex) {
        var loadKey, viewData;
        var objKeys;
        var isCmp, ix, ixLen;
        var saveKey = Comm.RTComm.getEnvKeyAnomalyDetectionDBChart(viewIndex);

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyAnomalyDetectionDBChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyAnomalyDetectionDBChart(viewIndex);
        }

        viewData = Comm.web_env_info[loadKey];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[loadKey];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[saveKey] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        objKeys = Object.keys(viewData);

        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    /**
     * 화면 Index에 따른 AI 차트의 지표 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveAIBizLoadStatByView: function(viewIndex, beforeIndex) {
        var loadKey, viewData;
        var objKeys;
        var isCmp, ix, ixLen;
        var saveKey = Comm.RTComm.getEnvKeyBizLoadPredictChart(viewIndex);

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyBizLoadPredictChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyBizLoadPredictChart(viewIndex);
        }

        viewData = Comm.web_env_info[loadKey];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[loadKey];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[saveKey] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        objKeys = Object.keys(viewData);

        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    /**
     * 화면 Index에 따른 AI 차트의 지표 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveAITxnLoadStatByView: function(viewIndex, beforeIndex) {
        var loadKey, viewData;
        var objKeys;
        var isCmp, ix, ixLen;
        var saveKey = Comm.RTComm.getEnvKeyTxnLoadPredictChart(viewIndex);

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyTxnLoadPredictChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyTxnLoadPredictChart(viewIndex);
        }

        viewData = Comm.web_env_info[loadKey];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[loadKey];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[saveKey] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        objKeys = Object.keys(viewData);

        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    /**
     * 화면 Index에 따른 AI 차트의 지표 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveDashTxnLoadStatByView: function(viewIndex, beforeIndex) {
        var loadKey, viewData;
        var objKeys;
        var isCmp, ix, ixLen;
        var saveKey = Comm.RTComm.getEnvKeyDashTxnLoadPredictChart(viewIndex);

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyDashTxnLoadPredictChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyDashTxnLoadPredictChart(viewIndex);
        }

        viewData = Comm.web_env_info[loadKey];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[loadKey];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[saveKey] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        objKeys = Object.keys(viewData);

        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    /**
     * 화면 Index에 따른 AI 차트의 지표 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveAILoadStatByView: function(viewIndex, beforeIndex) {
        var loadKey, viewData;
        var objKeys;
        var isCmp, ix, ixLen;
        var saveKey = Comm.RTComm.getEnvKeyLoadPredictChart(viewIndex);

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyLoadPredictChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyLoadPredictChart(viewIndex);
        }

        viewData = Comm.web_env_info[loadKey];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[loadKey];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[saveKey] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        objKeys = Object.keys(viewData);

        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    /**
     * 화면 Index에 따른 성능지표 차트의 지표 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveChartStatByView: function(viewIndex, beforeIndex) {
        var saveKey     = Comm.RTComm.getEnvKeyWasChart(viewIndex);
        var loadKey;

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyWasChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyWasChart(viewIndex);
        }

        var viewData  = Comm.web_env_info[ loadKey ];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[ loadKey ];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[ saveKey ] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        var objKeys = Object.keys(viewData);
        var isCmp, ix, ixLen;
        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    saveBizGroupListByView: function(viewIndex, beforeIndex) {
        var saveKey     = Comm.RTComm.getEnvKeyBizGroupList(viewIndex);
        var loadKey     = null;


        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyBizGroupList(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyBizGroupList(viewIndex);
        }

        var viewData = Comm.web_env_info[ loadKey ];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[ loadKey ];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[ saveKey ] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        var objKeys = Object.keys(viewData);
        var isCmp = false;
        var ix, ixLen;
        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }

        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    saveTPtmadminListByView: function(viewIndex, beforeIndex) {




        var saveKey     = Comm.RTComm.getEnvKeyTPtmadminGroupList(viewIndex);
        var loadKey     = null;

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyTPtmadminGroupList(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyTPtmadminGroupList(viewIndex);
        }

        var viewData = Comm.web_env_info[ loadKey ];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[ loadKey ];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[ saveKey ] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        var objKeys = Object.keys(viewData);
        var isCmp = false;
        var ix, ixLen;
        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }

        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },
    /**
     * 화면 Index에 따른 서비스 지표 정보 저장.
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 현재 화면 Index
     */
    saveServiceStatByView: function(viewIndex, beforeIndex) {
        var saveKey     = Comm.RTComm.getEnvKeyServiceChart(viewIndex);
        var loadKey     = null;

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyServiceChart(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyServiceChart(viewIndex);
        }

        var viewData = Comm.web_env_info[ loadKey ];

        if (Ext.isEmpty(viewData)) {
            delete Comm.web_env_info[ loadKey ];
            return;
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[ saveKey ] = null;
        }

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        var objKeys = Object.keys(viewData);
        var isCmp = false;
        var ix, ixLen;
        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData.data[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },

    /**
     * Component ID에 해당하는 성능지표 차트의 지표 정보 삭제 및 재설정.
     *
     * @param {string} id - 콤포넌트 ID
     */
    deleteWasStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyWasChart();
        var envData = Comm.web_env_info[saveKey];
        var viewData;

        if (envData) {
            if (typeof envData !== 'object') {
                viewData = JSON.parse(envData);
            } else {
                viewData = envData;
            }

            if (viewData.data) {
                delete viewData.data[id];
                Comm.web_env_info[saveKey] = JSON.stringify(viewData);
            }

            envData   = null;
            viewData  = null;
        }
    },

    /**
     * Component ID에 해당하는 서비스 차트의 지표 정보 삭제 및 재설정.
     *
     * @param {string} id - 콤포넌트 ID
     */
    deleteServiceStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyServiceChart();
        var envData = Comm.web_env_info[saveKey];
        var viewData;

        if (envData != null) {

            if (typeof envData !== 'object') {
                viewData = JSON.parse(envData);
            } else {
                viewData = envData;
            }

            if (viewData.data != null) {
                delete viewData.data[id];
                Comm.web_env_info[saveKey] = JSON.stringify(viewData);
            }

            envData   = null;
            viewData  = null;
        }
    },

    /**
     * Key 값에 해당하는 화면 구성 데이터를 삭제.
     *
     * @param {array} data - delete keys
     */
    deleteViewConfig: function(data) {
        var key = null,
            ix, ixLen;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            key = data[ix];
            common.WebEnv.del_config(key);
            delete realtime.viewOriginalData[key];
        }
        key  = null;
        data = null;
    },

    /**
     * 화면 Index에 따른 화면 구성 정보를 저장
     *
     * @param {string} saveIndex - 저장 화면 Index
     * @param {string} currentIndex - 현재 화면 Index
     */
    saveViewConfig: function(saveIndex, currentIndex) {

        Comm.RTComm.saveAIAnomalyDetectByView(saveIndex, currentIndex);
        Comm.RTComm.saveAIAnomalyDetectDBByView(saveIndex, currentIndex);
        Comm.RTComm.saveAIBizLoadStatByView(saveIndex, currentIndex);
        Comm.RTComm.saveAIDBLoadStatByView(saveIndex, currentIndex);
        Comm.RTComm.saveAILoadStatByView(saveIndex, currentIndex);
        Comm.RTComm.saveAITxnLoadStatByView(saveIndex, currentIndex);
        Comm.RTComm.saveDashTxnLoadStatByView(saveIndex, currentIndex);

        realtime.isDashboardView = false;
    },


    /**
     * WAS의 색상 정보를 저장.
     */
    saveWasColor: function(data) {
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        data = Comm.RTComm.changeTempComponentId(data);
        common.WebEnv.Save('rtm_InstanceColors_View_' + viewIndex, data);
    },

    /**
     * 합계 지표 차트의 색상정보 반환
     */
    getSumChartColor: function() {
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        return Comm.web_env_info['rtm_SumChartColor_View_' + viewIndex];
    },

    /**
     * 합계 지표 차트의 색상정보 저장
     */
    saveSumChartColor: function(data) {
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        data = Comm.RTComm.changeTempComponentId(data);
        common.WebEnv.Save('rtm_SumChartColor_View_' + viewIndex, data);
    },

    /**
     * 합계지표 차트 색상 정보를 가져오기 위한 키값 반환.
     *
     * @param {string} viewIndex - 화면 Index
     * @return {string} Index에 해당하는 화면의 합계지표 차트 색상 키.
     */
    getEnvKeySumChartColor: function(viewIndex) {
        if (viewIndex === undefined || viewIndex === null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }
        return 'rtm_SumChartColor_View_' + viewIndex;
    },

    /**
     * 성능지표 차트 옵션 정보를 저장 또는 가져오기 위한 키값 반환.
     *
     * @param {string} viewIndex - 화면 Index
     * @return {string} Index에 해당하는 화면의 성능지표 차트 옵션 키.
     */
    getEnvKeyChartOption: function(viewIndex) {
        if (viewIndex === undefined || viewIndex === null) {
            viewIndex = Comm.RTComm.getCurrentViewIndex();
        }
        if (!Ext.isDefined(viewIndex)) {
            viewIndex = 0;
        }
        return 'rtm_performanceChart_View_' + viewIndex;
    },


    /**
     * 성능지표 차트 옵션 정보가 있는지 체크
     *
     * @param {string} id - 콤포넌트 ID
     * @return {boolean}
     */
    isChartOptionByCmpID: function(id) {
        var isData = false;
        var saveKey = Comm.RTComm.getEnvKeyChartOption();
        var trendChartOption = Comm.web_env_info[saveKey];

        if (trendChartOption) {
            if (typeof trendChartOption !== 'object') {
                trendChartOption = JSON.parse(trendChartOption);
            }
            if (trendChartOption[id]) {
                isData = true;
            }
        }
        return isData;
    },

    /**
     * 성능 지표 차트의 옵션 정보를 저장.
     */
    saveChartOption: function(id, data) {
        var saveKey = Comm.RTComm.getEnvKeyChartOption();
        var optionData = Comm.web_env_info[ saveKey ];
        var saveData;

        if (!Ext.isObject(optionData)) {
            optionData = JSON.parse(optionData);
        }

        if (!Ext.isObject(data)) {
            data = JSON.parse(data);
        }

        optionData[id] = data;

        var isSave = Comm.RTComm.isSaveChartCmp(id);

        saveData = JSON.stringify(optionData);

        if (isSave === true && realtime.isDashboardView !== true) {
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }
        optionData = null;
        saveData = null;
    },

    /**
     * 성능지표 차트의 옵션 정보 설정.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {boolean} isChange - 변경 유무
     */
    getChartOption: function(id, isChange) {
        var ix, ixLen;
        var saveKey = Comm.RTComm.getEnvKeyChartOption();
        var trendChartOption = Comm.web_env_info[saveKey];
        var optionData;
        var saveData;
        var serverNameArr;

        if (Comm.rtmWebShow) {
            serverNameArr = Comm.webNameArr.concat();
        } else {
            serverNameArr = Comm.wasNameArr.concat();
        }

        if (isChange !== true) {
            optionData = Comm.RTComm.getDashboardWasChartOption(id);

            if (optionData) {
                for (ix = 0, ixLen = serverNameArr.length; ix < ixLen; ix++) {
                    optionData.chartOption[serverNameArr[ix]] = { lineWidth: 2 };
                }

                if (trendChartOption != null) {
                    if (!Ext.isObject(trendChartOption) ) {
                        trendChartOption = JSON.parse(trendChartOption);
                    }
                } else {
                    trendChartOption = {};
                }
                trendChartOption[id] = optionData;
            }
        }

        if (optionData == null) {
            trendChartOption = Comm.web_env_info[saveKey];

            if (trendChartOption != null) {
                if (!Ext.isObject(trendChartOption) ) {
                    trendChartOption = JSON.parse(trendChartOption);
                }

                if (!trendChartOption[id]) {
                    trendChartOption[id] = Comm.RTComm.getDashboardWasChartOption('dash-' + id);
                }

                if (trendChartOption[id] == null) {
                    trendChartOption[id] = Comm.RTComm.getDefaultChartOption();
                }

                //이전에 저장되어진 인스턴스 갯수와 현재 선택된 인스턴스가 같은지 비교한다
                for (ix = 0, ixLen = serverNameArr.length; ix < ixLen; ix++) {
                    if (! trendChartOption[id].chartOption[serverNameArr[ix]]) {
                        trendChartOption[id].chartOption[serverNameArr[ix]] = { lineWidth: 2 };
                    }
                }
            } else {
                trendChartOption = {};
                trendChartOption[id] = Comm.RTComm.getDashboardWasChartOption('dash-' + id);

                if (!trendChartOption[id]) {
                    trendChartOption[id] = Comm.RTComm.getDefaultChartOption();
                }
                saveData = JSON.stringify(trendChartOption[id]);
                saveData = Comm.RTComm.changeTempComponentId(saveData);
                common.WebEnv.Save(saveKey, saveData);
            }
        }

        var isSave = Comm.RTComm.isSaveChartCmp(id);
        var envDataStr = JSON.stringify(trendChartOption);
        if (isSave === true) {
            if (envDataStr != Comm.web_env_info[ saveKey ]) {
                envDataStr = Comm.RTComm.changeTempComponentId(envDataStr);
                common.WebEnv.Save(saveKey, envDataStr);
            }
        } else {
            Comm.web_env_info[ saveKey ] = envDataStr;
        }

        try {
            return trendChartOption[id];
        } finally {
            saveData         = null;
            optionData       = null;
            trendChartOption = null;
            envDataStr       = null;
        }
    },

    /**
     * 성능지표 차트의 기본 옵션 정보 가져오기.
     *
     * @return {Object} 옵션 정보
     */
    getDefaultChartOption: function() {
        var wasName;
        var chartOption = {};
        var serverNameArr, ix, ixLen;

        if (Comm.rtmWebShow) {
            serverNameArr = Comm.webNameArr.concat();
        } else {
            serverNameArr = Comm.wasNameArr.concat();
        }

        for (ix = 0, ixLen = serverNameArr.length; ix < ixLen; ix++) {
            wasName = serverNameArr[ix];
            chartOption[wasName] = { lineWidth : 2 };
        }

        var option = {
            defaultLayout : [2, 3],
            defaultStat : [
                {statName: 'WAS_SESSION',         kind : 'stat'},
                {statName: 'ACTIVE_TRANSACTION',  kind : 'stat'},
                {statName: 'TPS',                 kind : 'stat'},
                {statName: 'JVM_CPU_USAGE',       kind : 'stat'},
                {statName: 'JVM_FREE_HEAP',       kind : 'stat'},
                {statName: 'JVM_HEAP_SIZE',       kind : 'stat'}
            ],
            chartOption : chartOption
        };

        try {
            return option;
        } finally {
            option      = null;
            chartOption = null;
        }
    },

    /**
     * 선택된 화면 Index에 따른 차트(합계 지표) 색상 정보를 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 선택 화면 Index
     */
    saveSumChartColorByView: function(viewIndex, beforeIndex) {
        var saveKey = Comm.RTComm.getEnvKeySumChartColor(viewIndex);
        var loadKey;

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[ saveKey ] = null;
            loadKey = Comm.RTComm.getEnvKeySumChartColor(beforeIndex);

        } else {
            loadKey = Comm.RTComm.getEnvKeySumChartColor(viewIndex);
        }

        var viewData = Comm.web_env_info[ loadKey ];

        if (!Ext.isEmpty(viewData)) {
            if (Ext.isObject(viewData)) {
                viewData = JSON.stringify(viewData);
            }
            viewData = Comm.RTComm.changeTempComponentId(viewData);
            common.WebEnv.Save(saveKey, viewData);

            viewData = null;
        }
    },

    /**
     * 선택된 화면 Index에 따른 차트(성능지표) 옵션 정보 저장
     *
     * @param {string} viewIndex - 저장 화면 Index
     * @param {string} beforeIndex - 선택 화면 Index
     */
    saveChartOptionByView: function(viewIndex, beforeIndex) {
        var saveKey     = Comm.RTComm.getEnvKeyChartOption(viewIndex);
        var loadKey;

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[ saveKey ] = null;
            loadKey = Comm.RTComm.getEnvKeyChartOption(beforeIndex);

        } else {
            loadKey = Comm.RTComm.getEnvKeyChartOption(viewIndex);
        }

        var viewData  = Comm.web_env_info[ loadKey ];

        if (!viewData) {
            return;
        }

        if (!Ext.isObject(viewData)) {
            viewData = Comm.RTComm.changeTempComponentId(viewData);
            viewData = JSON.parse(viewData);
        }

        var objKeys = Object.keys(viewData);
        var isCmp, ix, ixLen;

        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);

            if (isCmp !== true) {
                delete viewData[objKeys[ix]];
            }
        }

        if (!Ext.isEmpty(viewData)) {
            if (Ext.isObject(viewData)) {
                viewData = JSON.stringify(viewData);
            }
            viewData = Comm.RTComm.changeTempComponentId(viewData);
            common.WebEnv.Save(saveKey, viewData);
        }
        objKeys  = null;
        viewData = null;
    },

    /**
     * 성능 지표 차트에 보여지는 지표를 재설정.
     *
     * @param {string} id - 콤포넌트 ID
     */
    deleteChartOption: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyChartOption();
        var viewData = Comm.web_env_info[saveKey];

        if (!Ext.isObject(viewData)) {
            viewData = JSON.parse(viewData);
        }

        if (viewData) {
            delete viewData[id];
            Comm.web_env_info[saveKey] = JSON.stringify(viewData);
        }

        viewData  = null;
    },
    /**
     * Component ID에 해당하는 옵션정보 가져오기 TPtmadmin
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getTPtmadminGroupList: function(id) {
        if (id == null) {
            return;
        }

        var saveKey = Comm.RTComm.getEnvKeyTPtmadminGroupList();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },
    /**
     * Component ID에 해당하는 옵션정보 가져오기 TPtmadmin
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getTuxtmadminGroupList: function(id) {
        if (id == null) {
            return;
        }

        var saveKey = Comm.RTComm.getEnvKeyTuxtmadminGroupList();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },
    /**
     * Component ID에 해당하는 서비스 지표 정보 가져오기. 업무 그룹별 성능 지표
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getBizGroupList: function(id) {
        if (id == null) {
            return;
        }

        var saveKey = Comm.RTComm.getEnvKeyBizGroupList();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },


    /**
     * Component ID에 해당하는 서비스 지표 정보 가져오기.
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getServiceStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyServiceChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 가져오기.
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getLoadPredictStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyLoadPredictChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 가져오기.
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getDashLoadPredictStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyDashLoadPredictChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 가져오기.
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getDashTxnLoadPredictStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyDashTxnLoadPredictChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 가져오기.
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getDBLoadPredictStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyDBLoadPredictChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 가져오기.
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getTxnLoadPredictStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyTxnLoadPredictChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 가져오기.
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 서비스 지표 ID
     */
    getBizLoadPredictStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyBizLoadPredictChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    getAnomalyDetectionStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyAnomalyDetectionChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    getAnomalyDetectionDBStatList: function(id) {
        if (id == null) {
            return;
        }
        var saveKey = Comm.RTComm.getEnvKeyAnomalyDetectionDBChart();
        var result  = null;

        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            result = viewData.data[id];
        }
        viewData  = null;

        return result;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveBizGroupList: function(id, statList) {
        if (id == null) {
            return;
        }

        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyBizGroupList();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[id] = statList;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data = {};
            viewData.data[id] = statList;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(id);
        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData  = null;
        statList  = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveTPtmadminGroupList: function(id, statList) {
        if (id == null) {
            return;
        }


        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyTPtmadminGroupList();
        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[id] = statList;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data = {};
            viewData.data[id] = statList;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(id);
        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData  = null;
        statList  = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveTuxtmadminGroupList: function(id, statList) {
        if (id == null) {
            return;
        }


        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyTuxtmadminGroupList();
        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[id] = statList;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data = {};
            viewData.data[id] = statList;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(id);
        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData  = null;
        statList  = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveServiceStatList: function(id, statList) {
        if (id == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyServiceChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[id] = statList;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data = {};
            viewData.data[id] = statList;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(id);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData  = null;
        statList  = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveLoadPredictStatList: function(cmpId, statList, id) {
        if (cmpId == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyLoadPredictChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[cmpId] = {
                stat : '',
                id : ''
            };
            viewData.data[cmpId]['stat'] = statList;
            viewData.data[cmpId]['id']   = id;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data        = {};
            viewData.data[cmpId] = {
                stat : '',
                id : ''
            };
            viewData.data[cmpId].stat = statList;
            viewData.data[cmpId].id   = id;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(cmpId);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData = null;
        statList = null;
        id       = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveDashLoadPredictStatList: function(cmpId, statList) {
        if (cmpId == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyDashLoadPredictChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[cmpId] = {
                stat : ''
            };
            viewData.data[cmpId]['stat'] = statList;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data        = {};
            viewData.data[cmpId] = {
                stat : ''
            };
            viewData.data[cmpId].stat = statList;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(cmpId);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData = null;
        statList = null;
        id       = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveDashTxnLoadPredictStatList: function(cmpId, statList) {
        if (cmpId == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyDashTxnLoadPredictChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[cmpId] = {
                stat : ''
            };
            viewData.data[cmpId]['stat'] = statList;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data        = {};
            viewData.data[cmpId] = {
                stat : ''
            };
            viewData.data[cmpId].stat = statList;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(cmpId);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData = null;
        statList = null;
        id       = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveDBLoadPredictStatList: function(cmpId, statList, id) {
        if (cmpId == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyDBLoadPredictChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[cmpId] = {
                stat : '',
                id : ''
            };
            viewData.data[cmpId]['stat'] = statList;
            viewData.data[cmpId]['id']   = id;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data        = {};
            viewData.data[cmpId] = {
                stat : '',
                id : ''
            };
            viewData.data[cmpId].stat = statList;
            viewData.data[cmpId].id   = id;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(cmpId);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData = null;
        statList = null;
        id       = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveTxnLoadPredictStatList: function(cmpId, statList, id, name) {
        if (cmpId == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyTxnLoadPredictChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[cmpId] = {
                stat : '',
                id : '',
                name : ''
            };
            viewData.data[cmpId]['stat'] = statList;
            viewData.data[cmpId]['id']   = id;
            viewData.data[cmpId]['name'] = name;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data        = {};
            viewData.data[cmpId] = {
                stat : '',
                id : '',
                name : ''
            };
            viewData.data[cmpId].stat = statList;
            viewData.data[cmpId].id   = id;
            viewData.data[cmpId].name = name;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(cmpId);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData = null;
        statList = null;
        id       = null;
        name     = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveBizLoadPredictStatList: function(cmpId, statList, id, name) {
        if (cmpId == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyBizLoadPredictChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[cmpId] = {
                stat : '',
                id : '',
                name : ''
            };
            viewData.data[cmpId]['stat'] = statList;
            viewData.data[cmpId]['id']   = id;
            viewData.data[cmpId]['name'] = name;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data        = {};
            viewData.data[cmpId] = {
                stat : '',
                id : '',
                name : ''
            };
            viewData.data[cmpId].stat = statList;
            viewData.data[cmpId].id   = id;
            viewData.data[cmpId].name = name;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(cmpId);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData = null;
        statList = null;
        id       = null;
        name     = null;
    },

    /**
     * Component ID에 해당하는 서비스 지표 정보 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {array} statList - 지표 목록
     */
    saveAnomalyDetectionStatList: function(cmpId, statList, id) {
        if (cmpId == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyAnomalyDetectionChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[cmpId] = {
                stat : '',
                id : ''
            };
            viewData.data[cmpId]['stat'] = statList;
            viewData.data[cmpId]['id']   = id;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data        = {};
            viewData.data[cmpId] = {
                stat : '',
                id : ''
            };
            viewData.data[cmpId].stat = statList;
            viewData.data[cmpId].id   = id;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(cmpId);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData = null;
        statList = null;
        id       = null;
    },

    saveAnomalyDetectionDBStatList: function(cmpId, statList, id) {
        if (cmpId == null) {
            return;
        }
        var viewIndex = Comm.RTComm.getCurrentViewIndex();
        var saveKey   = Comm.RTComm.getEnvKeyAnomalyDetectionDBChart();

        var saveData;
        var viewData = Comm.web_env_info[ saveKey ];

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData.data[cmpId] = {
                stat : '',
                id : ''
            };
            viewData.data[cmpId]['stat'] = statList;
            viewData.data[cmpId]['id']   = id;
        } else {
            viewData  = {};
            viewData.view = viewIndex;
            viewData.data        = {};
            viewData.data[cmpId] = {
                stat : '',
                id : ''
            };
            viewData.data[cmpId].stat = statList;
            viewData.data[cmpId].id   = id;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(cmpId);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }

        viewData = null;
        statList = null;
        id       = null;
    },

    /**
     * Component ID에 해당하는 Activity 그룹 화면의 그룹명 가져오기.
     *
     * @param {string} id - 콤포넌트 ID
     * @return {string} 그룹명
     */
    getActivityGroupConfig: function(id) {
        var loadKey  = Comm.RTComm.getEnvKeyActiveGroup();
        var viewData = Comm.web_env_info[loadKey];
        var name = null;

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            name = viewData[id];
        }

        return name;
    },


    /**
     * Component ID에 해당하는 Activity 그룹 화면의 그룹명 저장.
     *
     * @param {string} id - 콤포넌트 ID
     * @param {string} data - 그룹명
     */
    saveActivityGroupConfig: function(id, data) {
        var saveKey  = Comm.RTComm.getEnvKeyActiveGroup();
        var viewData = Comm.web_env_info[saveKey];
        var saveData;

        if (viewData != null) {
            if (typeof viewData !== 'object') {
                viewData = JSON.parse(viewData);
            }
            viewData[id] = data;
        } else {
            Comm.web_env_info[saveKey] = JSON.stringify({
                'dash-rtm-activity-group-ext-70101-cmp' : Comm.bizGroups[0] ||  '',
                'dash-rtm-activity-group-ext-70102-cmp' : Comm.bizGroups[1] ||  '',
                'dash-rtm-activity-group-ext-70103-cmp' : Comm.bizGroups[2] ||  '',
                'dash-rtm-activity-group-ext-70104-cmp' : Comm.bizGroups[3] ||  '',
                'dash-rtm-activity-group-ext-70105-cmp' : Comm.bizGroups[4] ||  '',
                'dash-rtm-activity-group-ext-70106-cmp' : Comm.bizGroups[5] ||  ''
            });

            if (typeof Comm.web_env_info[saveKey] !== 'object') {
                viewData = JSON.parse(Comm.web_env_info[saveKey]);
            }

            viewData[id] = data;
        }

        var isSave = Comm.RTComm.isSaveChartCmp(id);

        saveData = JSON.stringify(viewData);
        if (isSave === true) {
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save(saveKey, saveData);
        } else {
            Comm.web_env_info[ saveKey ] = saveData;
        }
        saveData = null;
    },


    /**
     * 화면 Index에 따른 Activity 그룹 화면의 그룹명 재설정.
     *
     * @param {string|number} viewIndex - 저장화면 인덱스
     * @param {string|number} beforeIndex - 선택 화면 인덱스
     */
    saveActivityGroupConfigByView: function(viewIndex, beforeIndex) {
        var saveKey     = Comm.RTComm.getEnvKeyActiveGroup(viewIndex);
        var loadKey;

        if (beforeIndex != viewIndex) {
            loadKey = Comm.RTComm.getEnvKeyActiveGroup(beforeIndex);
        } else {
            loadKey = Comm.RTComm.getEnvKeyActiveGroup(viewIndex);
        }

        var viewData = Comm.web_env_info[loadKey];

        if (Ext.isEmpty(viewData)) {

            Comm.web_env_info[loadKey] = JSON.stringify({
                'dash-rtm-activity-group-ext-70101-cmp' : Comm.bizGroups[0] ||  '',
                'dash-rtm-activity-group-ext-70102-cmp' : Comm.bizGroups[1] ||  '',
                'dash-rtm-activity-group-ext-70103-cmp' : Comm.bizGroups[2] ||  '',
                'dash-rtm-activity-group-ext-70104-cmp' : Comm.bizGroups[3] ||  '',
                'dash-rtm-activity-group-ext-70105-cmp' : Comm.bizGroups[4] ||  '',
                'dash-rtm-activity-group-ext-70106-cmp' : Comm.bizGroups[5] ||  ''
            });

            viewData = Comm.web_env_info[loadKey];
        }

        if (beforeIndex != viewIndex) {
            Comm.web_env_info[ saveKey ] = null;
        }

        if (!Ext.isObject(viewData) && typeof viewData !== 'object') {
            viewData = JSON.parse(viewData);
        }

        var objKeys = Object.keys(viewData);
        var isCmp, ix, ixLen;
        for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
            isCmp = Comm.RTComm.isSaveChartCmp(objKeys[ix]);
            if (isCmp !== true) {
                delete viewData[objKeys[ix]];
            }
        }

        if (Ext.isObject(viewData)) {
            viewData = JSON.stringify(viewData);
        }
        viewData = Comm.RTComm.changeTempComponentId(viewData);
        common.WebEnv.Save(saveKey, viewData);

        objKeys  = null;
        viewData = null;
    },


    /**
     * 모니터링 화면에서 선택된 화면 Index에 따라 서버 색상 정보를 재설정.
     *
     * @param {string|number} index - 화면 인덱스
     */
    loadChartOption: function(index) {
        var wasColors = Comm.web_env_info['rtm_InstanceColors_View_' + index];
        var ix, ixLen;
        var color, customColor;
        var serverType, serverId;
        var colorIdx = 0, randomIdx = 0;

        if (!Ext.isObject(wasColors)) {
            wasColors = null;
        }

        if (wasColors) {
            if (typeof wasColors === 'object') {
                customColor = wasColors;
            } else {
                customColor = JSON.parse(wasColors);
            }
            if (customColor && !Array.isArray(customColor)) {
                realtime.serverColorMap = customColor;
            }
            customColor = null;
            wasColors   = null;
        }

        for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
            serverId   = Comm.wasIdArr[ix];
            serverType = Comm.wasInfoObj[serverId].type;
            color      = realtime.serverColorMap[serverType][serverId];

            // 서버 ID에 해당 하는 정보가 저장되어 있지 않는 경우 색상 코드 목록에서 가져와 설정.
            if (!color) {
                color = realtime.Colors[colorIdx++];
            }

            // 기존 색상 코드 목록보다 서버 갯수가 많은 경우 기존 색상 코드값을 기준으로 랜덤 색상을
            // 생성하여 설정한다.
            if (!color) {
                color = Comm.RTComm.decimalToHex(realtime.DefaultColors[randomIdx++]);
                realtime.Colors[colorIdx - 1] = color;
                realtime.DefaultColors[colorIdx - 1] = color;
            }

            // 서버ID 별 색상 코드 객체에 값을 설정.
            realtime.serverColorMap[serverType][serverId] = color;

            if (!Comm.wasInfoObj[Comm.wasIdArr[ix]].labelColor) {
                Comm.wasInfoObj[Comm.wasIdArr[ix]].labelColor = color;
            }
        }

        var rtmBase = Comm.RTComm.getRtmBaseContainer();
        if (rtmBase) {
            // rtmBase.changeWasColor();
        }

        rtmBase   = null;
        wasColors = null;
    },


    /**
     * WebEnv에 저장되는 화면구성 데이터에서 컴포넌트ID 를 변경하여 반환.
     * 'dash-'로 시작되는 ID는 대시보드에서 사용되는 ID값으로
     * 사용자가 화면 구성을 저장을 하는 경우에는 사용자 화면 구성이기때문에
     * 컴포넌트 ID값에서 'dash-'를 빼서 저장이 되도록 처리함.
     *
     * @param {string} strData
     * @return {string}
     */
    changeTempComponentId: function(strData) {
        var cmpId, ix, ixLen;
        var checkList = [
            'dash-rtm-activity-group-ext-70101-cmp',
            'dash-rtm-activity-group-ext-70102-cmp',
            'dash-rtm-activity-group-ext-70103-cmp',
            'dash-rtm-activity-group-ext-70104-cmp',
            'dash-rtm-activity-group-ext-70105-cmp',
            'dash-rtm-activity-group-ext-70106-cmp',
            'dash-rtm-servicestat-ext-1690-cmp',
            'dash-rtm-servicestat-ext-8065-cmp',
            'dash-rtm-servicestat-ext-8806-cmp',
            'dash-rtm-servicestat-ext-81000-cmp',
            'dash-rtm-servicestat-ext-81001-cmp',
            'dash-rtm-was-ext-62031-cmp',
            'dash-rtm-was-ext-62032-cmp',
            'dash-rtm-was-ext-62033-cmp',
            'dash-rtm-was-ext-62034-cmp',
            'dash-rtm-was-ext-62035-cmp',
            'dash-rtm-was-ext-62036-cmp',
            'dash-rtm-was-ext-62037-cmp',
            'dash-rtm-was-ext-62038-cmp',
            'dash-rtm-was-ext-62039-cmp',
            'dash-rtm-was-ext-62040-cmp',
            'dash-rtm-was-ext-62041-cmp',
            'dash-rtm-was-ext-62042-cmp',
            'dash-rtm-was-ext-62043-cmp',
            //'dash-rtm-was-ext-62044-cmp',
            'dash-rtm-was-ext-62045-cmp',
            'dash-rtm-was-ext-62046-cmp',
            'dash-rtm-was-ext-62047-cmp',
            'dash-rtm-was-ext-62048-cmp',
            'dash-rtm-was-ext-62049-cmp',
            'dash-rtm-was-ext-62050-cmp',
            'dash-rtm-was-ext-62051-cmp',
            'dash-rtm-was-ext-62052-cmp',
            'dash-rtm-was-ext-62053-cmp',
            'dash-rtm-rtmTPTmadmin-ext-70001-cmp',
            'dash-rtm-rtmTPTmadmin-ext-70002-cmp',
            'dash-rtm-rtmTPTmadmin-ext-70003-cmp',
            'dash-rtm-rtmTPTmadmin-ext-70004-cmp'
        ];
        for (ix = 0, ixLen = checkList.length; ix < ixLen; ix++) {
            cmpId = checkList[ix];
            if (strData.indexOf(cmpId) !== -1) {
                strData = strData.replace(/dash-/gi, '');
            }
        }
        return strData;
    },


    /**
     * 메뉴 화면에 보여지는 항목인지 체크
     *
     * Non-DB, 리모트 트리, 웹 서버 등 표시 대상인지 체크하여 메뉴를 표시/숨김 처리한다.
     */
    checkDisplayMenu: function() {
        var displayStatus;
        var ix, ixLen;

        // Non DB 체크
        displayStatus = (window.isIMXNonDB) ? 'none' : 'block';
        for (ix = 0, ixLen = common.Menu.nonDbHiddenMenu.length; ix < ixLen; ix++) {
            $('#' + common.Menu.nonDbHiddenMenu[ix]).css('display', displayStatus);
        }

        // 연결 DB 체크
        displayStatus = (!window.isConnectDB) ? 'none' : 'block';
        for (ix = 0, ixLen = common.Menu.nonDbHiddenMenu.length; ix < ixLen; ix++) {
            $('#' + common.Menu.nonDbHiddenMenu[ix]).css('display', displayStatus);
        }

        // 리모트 트리 체크
        displayStatus = (!window.isRemoteTree) ? 'none' : 'block';
        $('#M_rtmActiveTxnRemoteTree').css('display', displayStatus);

        // 웹 서버 체크
        displayStatus = (!window.isWebserver) ? 'none' : 'block';
        $('#M_WebStat').css('display', displayStatus);

        // 테이블 스페이스 체크
        displayStatus = (!window.isTablespace) ? 'none' : 'block';
        $('#M_rtmTablespaceUsage').css('display', displayStatus);
    },


    /**
     * 기본 화면 구성이 변경되기전 화면 구성인지 체크.
     * 기본 화면 값이 과거의 기본화면 값이면 변경된 구성정보로 설정한다.
     */
    checkChangeDefaultAILayout: function() {
        var currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmAIView-0'];

        // 현재 기본 화면을 구성하는 정보를 가져오기
        var saveData = Comm.RTComm.getDockLayer('AIMonitor');

        // 기본 화면을 구성하는 정보가 없거나 현재 기본 화면과 다른 경우 변경.
        if (!currentDefaultLayout || currentDefaultLayout.indexOf(this.layoutVersion.AI) === -1) {
            realtime.isInitConfiguraionLayout = true;
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save('xm-dock-position-rtm.view.rtmAIView-0', saveData);

        } else {
            realtime.isInitConfiguraionLayout = false;
        }

        // Web Env 테이블에 기본 화면 정보가 없는 경우 저장한다.
        var saveViewIndex = Comm.web_env_info['xm-dock-save-rtm.view.rtmAIView'];
        if (+saveViewIndex !== +Comm.RTComm.getCurrentViewIndex()) {
            common.WebEnv.Save('xm-dock-save-rtm.view.rtmAIView', 0);
        }
        currentDefaultLayout = null;
    },

    /**
     * 기본 화면 구성이 변경되기전 화면 구성인지 체크.
     * 기본 화면 값이 과거의 기본화면 값이면 변경된 구성정보로 설정한다.
     */
    checkChangeDefaultLayout: function() {
        var currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmView-0'];

        // 현재 기본 화면을 구성하는 정보를 가져오기
        var saveData = Comm.RTComm.getDockLayer('AIMonitor');

        // 기본 화면을 구성하는 정보가 없거나 현재 기본 화면과 다른 경우 변경.
        if (!currentDefaultLayout || currentDefaultLayout.indexOf('WASMonitor.170927.01') === -1) {
            realtime.isInitConfiguraionLayout = true;
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save('xm-dock-position-rtm.view.rtmView-0', saveData);

        } else {
            realtime.isInitConfiguraionLayout = false;
        }

        // Web Env 테이블에 기본 화면 정보가 없는 경우 저장한다.
        var saveViewIndex = Comm.web_env_info['xm-dock-save-rtm.view.rtmView'];
        if (+saveViewIndex !== +Comm.RTComm.getCurrentViewIndex()) {
            common.WebEnv.Save('xm-dock-save-rtm.view.rtmView', 0);
        }
        currentDefaultLayout = null;
    },


    /**
     * TP 모니터링 기본 화면 구성이 변경되기전 화면 구성인지 체크.
     * 과거의 기본 화면 구성이면 변경된 구성정보로 설정한다.
     */
    checkChangeDefaultTPLayout: function() {
        var currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmTPView-0'];

        // 현재 기본 화면을 구성하는 정보를 가져오기
        var saveData = Comm.RTComm.getDockLayer('TPMonitor');

        // 기본 화면을 구성하는 정보가 없거나 현재 기본 화면과 다른 경우 변경.
        if (!currentDefaultLayout || currentDefaultLayout.indexOf(this.layoutVersion.TP) === -1) {
            realtime.isInitConfiguraionLayout = true;
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save('xm-dock-position-rtm.view.rtmTPView-0', saveData);

        } else {
            realtime.isInitConfiguraionLayout = false;
        }

        var saveViewIndex = Comm.web_env_info['xm-dock-save-rtm.view.rtmTPView'];
        if (+saveViewIndex !== +Comm.RTComm.getCurrentViewIndex()) {
            common.WebEnv.Save('xm-dock-save-rtm.view.rtmTPView', 0);
        }
        currentDefaultLayout = null;
    },

    /**
     * Tuxedo 모니터링 기본 화면 구성이 변경되기전 화면 구성인지 체크.
     * 과거의 기본 화면 구성이면 변경된 구성정보로 설정한다.
     */
    checkChangeDefaultTuxLayout: function() {
        var currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmTuxView-0'];

        // 현재 기본 화면을 구성하는 정보를 가져오기
        var saveData = Comm.RTComm.getDockLayer('TuxMonitor');

        // 기본 화면을 구성하는 정보가 없거나 현재 기본 화면과 다른 경우 변경.
        if (!currentDefaultLayout || currentDefaultLayout.indexOf(this.layoutVersion.Tux) === -1) {
            realtime.isInitConfiguraionLayout = true;
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save('xm-dock-position-rtm.view.rtmTuxView-0', saveData);

        } else {
            realtime.isInitConfiguraionLayout = false;
        }

        var saveViewIndex = Comm.web_env_info['xm-dock-save-rtm.view.rtmTuxView'];
        if (+saveViewIndex !== +Comm.RTComm.getCurrentViewIndex()) {
            common.WebEnv.Save('xm-dock-save-rtm.view.rtmTuxView', 0);
        }
        currentDefaultLayout = null;
    },


    /**
     * WEB 모니터링 기본 화면 구성이 변경되기전 화면 구성인지 체크.
     * 과거의 기본 화면 구성이면 변경된 구성정보로 설정한다.
     */
    checkChangeDefaultWebLayout: function() {
        var currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmWebView-0'];

        var envKey    = 'WebMonitor';
        var layoutKey = this.layoutVersion.WEB;

        if (window.isWebToB) {
            envKey = 'WebMonitorWebToB';
            layoutKey = this.layoutVersion.WTB;

            realtime.defaultWebStatName = realtime.defaultWTBStatName;
            realtime.WebStatName        = realtime.WTBStatName;
        }
        // 현재 기본 화면을 구성하는 정보를 가져오기
        var saveData = Comm.RTComm.getDockLayer(envKey);

        // 기본 화면을 구성하는 정보가 없거나 현재 기본 화면과 다른 경우 변경.
        if (!currentDefaultLayout || currentDefaultLayout.indexOf(layoutKey) === -1) {
            realtime.isInitConfiguraionLayout = true;
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save('xm-dock-position-rtm.view.rtmWebView-0', saveData);

        } else {
            realtime.isInitConfiguraionLayout = false;
        }

        var saveViewIndex = Comm.web_env_info['xm-dock-save-rtm.view.rtmWebView'];
        if (+saveViewIndex !== +Comm.RTComm.getCurrentViewIndex()) {
            common.WebEnv.Save('xm-dock-save-rtm.view.rtmWebView', 0);
        }
        currentDefaultLayout = null;
    },


    /**
     * C Daemon 모니터링 기본 화면 구성이 변경되기전 화면 구성인지 체크.
     * 과거의 기본 화면 구성이면 변경된 구성정보로 설정한다.
     */
    checkChangeDefaultCDLayout: function() {
        var currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmCDView-0'];

        var envKey    = 'CDMonitor';
        var layoutKey = this.layoutVersion.CD;

        // 현재 기본 화면을 구성하는 정보를 가져오기
        var saveData = Comm.RTComm.getDockLayer(envKey);

        // 기본 화면을 구성하는 정보가 없거나 현재 기본 화면과 다른 경우 변경.
        if (!currentDefaultLayout || currentDefaultLayout.indexOf(layoutKey) === -1) {
            realtime.isInitConfiguraionLayout = true;
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save('xm-dock-position-rtm.view.rtmCDView-0', saveData);

        } else {
            realtime.isInitConfiguraionLayout = false;
        }

        var saveViewIndex = Comm.web_env_info['xm-dock-save-rtm.view.rtmCDView'];
        if (+saveViewIndex !== +Comm.RTComm.getCurrentViewIndex()) {
            common.WebEnv.Save('xm-dock-save-rtm.view.rtmCDView', 0);
        }
        currentDefaultLayout = null;
    },


    /**
     * E2E 모니터링 기본 화면 구성이 변경되기전 화면 구성인지 체크.
     * 과거의 기본 화면 구성이면 변경된 구성정보로 설정한다.
     */
    checkChangeDefaultE2ELayout: function() {
        var currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmEtoEView-0'];

        var saveData = Comm.RTComm.getDockLayer('E2EMonitor');

        if (!currentDefaultLayout || currentDefaultLayout.indexOf(this.layoutVersion.EtoE) === -1) {
            realtime.isInitConfiguraionLayout = true;
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save('xm-dock-position-rtm.view.rtmEtoEView-0', saveData);

        } else {
            realtime.isInitConfiguraionLayout = false;
        }

        var saveViewIndex = Comm.web_env_info['xm-dock-save-rtm.view.rtmEtoEView'];

        if (+saveViewIndex !== +Comm.RTComm.getCurrentViewIndex()) {
            common.WebEnv.Save('xm-dock-save-rtm.view.rtmEtoEView', 0);
        }
        currentDefaultLayout = null;
    },


    /**
     * 업무 모니터링 화면 구성이 변경되기전 화면 구성인지 체크.
     * 과거의 기본 화면 구성이면 변경된 구성정보로 설정한다.
     */
    checkChangeDefaultBizLayout: function(rec) {
        var currentDefaultLayout, envKey, layoutKey, saveData;

        if (rec === 'dashboard.TaskMonitor') {
            currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmBizView-0'];
            envKey    = 'TaskMonitor';

            if (common.Menu.useEtoEChartMonitoring) {
                layoutKey = this.layoutVersion.EtoEBIZ;
            } else {
                layoutKey = this.layoutVersion.BIZ;
            }

            common.WebEnv.Save('xm-dock-save-rtm.view.rtmBizView', 0);
        } else {
            currentDefaultLayout = Comm.web_env_info['xm-dock-position-rtm.view.rtmBizView-1'];
            envKey = 'TaskMonitor2';
            layoutKey = this.layoutVersion.BIZ2;

            common.WebEnv.Save('xm-dock-save-rtm.view.rtmBizView', 1);
        }


        // 현재 기본 화면을 구성하는 정보를 가져오기
        saveData = Comm.RTComm.getDockLayer(envKey);

        // 기본 화면을 구성하는 정보가 없거나 현재 기본 화면과 다른 경우 변경.
        if (!currentDefaultLayout || currentDefaultLayout.indexOf(layoutKey) === -1) {
            realtime.isInitConfiguraionLayout = true;
            saveData = Comm.RTComm.changeTempComponentId(saveData);

            if (rec === 'dashboard.TaskMonitor') {
                common.WebEnv.Save('xm-dock-position-rtm.view.rtmBizView-0', saveData);
            } else {
                common.WebEnv.Save('xm-dock-position-rtm.view.rtmBizView-1', saveData);
            }

        } else {
            realtime.isInitConfiguraionLayout = false;
        }
    },


    /**
     * 지정된 패킷 번호에 해당하는 패킷을 받도록 추가
     *
     * @param {number} pNumber - 패킷 번호
     */
    addReceivePacket: function(pNumber) {
        realTimeWS.send({
            command: COMMAND.PACKET_ADD,
            data: {
                packetNumber: pNumber
            }
        });
    },


    /**
     * 지정된 패킷 번호에 해당하는 패킷을 받지않도록 제거
     *
     * @param {number} pNumber - 패킷 번호
     */
    removeReceivePacket: function(pNumber) {
        realTimeWS.send({
            command: COMMAND.PACKET_REMOVE,
            data: {
                packetNumber: pNumber
            }
        });
    },


    /**
     * 현재 서버 시간 반환
     *
     * @param {number | string} packetTime - 패킷에서 받은 시간
     * @param {number | string | undefined} serverTime - DB에서 가져온 서버 시간
     * @return {object} 서버 시간 반환
     */
    getCurrentServerTime: function(packetTime, serverTime) {
        if (arguments.length <= 1) {
            // xapm_server_time 테이블에서 가져온 서버 시간 설정 (IMXRT_ServerTime.sql 참고)
            serverTime = Comm.lastServerTime;
        }

        if (arguments.length === 0) {
            packetTime = new Date(realtime.lastestTime);
        }

        var diffMin = Ext.Date.diff(+new Date(packetTime) , +new Date(serverTime), Ext.Date.MINUTE);
        if (diffMin > 30) {
            return new Date(serverTime);
        }
        return new Date(packetTime);
    },


    /**
     * 실시간 화면에 서브 제목 설정.
     * 실시간 화면 상단에 표시되는 탭 제목의 하단에 현재 모니터링하고 있는 뷰 명칭을 표시하며
     * 사용자가 저장한 화면 구성을 표시하는 경우에는 저장한 화면명으로 표시한다.
     *
     * @param {string} viewName - 화면명
     */
    setRTMTabSubTitle: function(viewName) {
        if (!viewName) {
            if (window.rtmMonitorType && window.rtmMonitorType === 'WAS') { // WAS만 기본화면 이름부여
                viewName = 'RealTime Monitor (All)';
            } else {
                viewName = 'Default View';
            }
        }

        var tabPanel = window.tabPanel.getActiveTab();

        if (tabPanel.tab) {
            tabPanel.tab.setText(tabPanel.tab.title + '<div style="line-height:16px;">[' + common.Util.TR(viewName) + ']</div>');
            tabPanel.onResize();
        }

        tabPanel = null;
        viewName = null;
    },


    /**
     * 메인 화면의 우측 상단에 표시되는 서버 타입 버튼을 숨김
     */
    hideRtmViewSelectBtn: function() {
        // 초기 실시간 화면 표시 또는 서비스 전환 시 숨김
        $('#MenuServerType #TypeWAS').css('display', 'none');
        $('#MenuServerType #TypeTP' ).css('display', 'none');
        $('#MenuServerType #TypeTUX').css('display', 'none');
        $('#MenuServerType #TypeWEB').css('display', 'none');
        $('#MenuServerType #TypeCD' ).css('display', 'none');
        $('#MenuServerType #TypeE2E').css('display', 'none');
    },


    /**
     * 모니터링 서버 타입에 따른 실시간 모니터링 화면 구성
     */
    setMonitoringView: function() {
        var ix, ixLen;
        var className;
        var rtmPanel;

        var viewList  = [];
        var titleList = [];

        var width = 25;

        realtime.rtmViewList = [];

        Comm.RTComm.hideRtmViewSelectBtn();

        // WAS 모니터링 대상 유무 체크
        var wasIdArr = Comm.RTComm.getServerIdArr('WAS');

        // WAS 모니터링 대상이 없는 경우 우측 상단에 'WAS' 버튼을 숨김 처리
        if (wasIdArr.length > 0) {
            $('#MenuServerType #TypeWAS').css('display', '');
            width += 40;
            realtime.rtmViewList.push('WAS');
        } else {
            $('#MenuServerType #TypeWAS').css('display', 'none');
        }

        // TP 모니터링 대상 유무 체크
        if (Comm.tpIdArr && Comm.tpIdArr.length > 0) {
            viewList[viewList.length]   = 'rtm.view.rtmTPView';
            titleList[titleList.length] = 'TP Monitor';

            $('#MenuServerType #TypeTP' ).css('display', '');
            width += 40;
            realtime.rtmViewList.push('TP');
        }

        // Tuxedo 모니터링 대상 유무 체크
        if (Comm.tuxIdArr && Comm.tuxIdArr.length > 0) {
            viewList[viewList.length]   = 'rtm.view.rtmTuxView';
            titleList[titleList.length] = 'Tuxedo Monitor';

            $('#MenuServerType #TypeTUX').css('display', '');
            width += 60;
            realtime.rtmViewList.push('TUX');
        }

        // Web 모니터링 대상 유무 체크
        if (Comm.webIdArr && Comm.webIdArr.length > 0) {
            viewList[viewList.length]   = 'rtm.view.rtmWebView';
            titleList[titleList.length] = 'Web Monitor';

            $('#MenuServerType #TypeWEB').css('display', '');
            width += 40;
            realtime.rtmViewList.push('WEB');
        }

        // C Daemon 모니터링 대상 유무 체크
        if (Comm.cdIdArr && Comm.cdIdArr.length > 0) {
            viewList[viewList.length]   = 'rtm.view.rtmCDView';
            titleList[titleList.length] = 'C Daemon Monitor';

            $('#MenuServerType #TypeCD').css('display', '');
            width += 80;
            realtime.rtmViewList.push('CD');
        }

        // E2E 모니터링 화면 표시 유무 체크
        if (Comm.webIdArr.length > 0 || Comm.tpIdArr.length > 0 || Comm.cdIdArr.length > 0 || Comm.tuxIdArr.length > 0) {
            Comm.isE2EMonitor = true;

            viewList[viewList.length]   = 'rtm.view.rtmEtoEView';
            titleList[titleList.length] = 'EtoE Monitor';

            $('#MenuServerType #TypeE2E').css('display', '');
            width += 40;
            realtime.rtmViewList.push('E2E');
        }

        for (ix = 0, ixLen = viewList.length; ix < ixLen; ix++) {
            className = viewList[ix];
            rtmPanel = Ext.create(
                className,
                common.Menu.getClassConfig(className.substring(className.lastIndexOf('.') + 1))
            );
            rtmPanel.title = common.Util.TR(titleList[ix]);

            // 탭 패널에서 패널 순서를 변경하지 못하게 고정하는 옵션
            rtmPanel.reorderable = false;

            window.tabPanel.add(rtmPanel);
            rtmPanel.init();
        }

        // WAS 이외의 서버를 모니터링 하는데 WAS 모니터링 대상이 없는 경우,
        // WAS 모니터링 실시간 화면을 표시하지 않게 해달라는 요청이 있어 처리.
        if (wasIdArr.length <= 0) {
            window.tabPanel.setActiveTab(1);
            window.tabPanel.getTabBar().remove(window.tabPanel.getTabBar().items.items[0].id);
            window.tabPanel.updateLayout();
        }

        $('.server-type-info').css('width', width);
    },

    /**
     * 실시간 업무 모니터링 화면을 추가 및 구성
     */
    addBizMonitoringView: function(rec) {
        var className = 'rtm.view.rtmBizView';
        var rtmPanel = Ext.create(
            className,
            common.Menu.getClassConfig(className.substring(className.lastIndexOf('.') + 1))
        );
        rtmPanel.title = common.Util.TR('Business Monitor');
        rtmPanel.rec = rec;

        // 탭 패널에서 패널 순서를 변경하지 못하게 고정하는 옵션
        rtmPanel.reorderable = false;

        window.tabPanel.insert(realtime.rtmViewList.length, rtmPanel);
        window.tabPanel.setActiveTab(realtime.rtmViewList.length);

        rtmPanel.init();
    },

    /**
     * 현재 표시되고 있는 모니터링 화면 구분 값을 설정한다.
     *
     * @param {string} className - 선택된 탭 패널의 클래스 이름
     */
    checkMonitorViewType: function(className) {

        if (className === 'rtm.view.rtmView' || !className || !window.rtmMonitorType) {
            window.rtmMonitorType = 'WAS';
            $('#MenuServerType .active').removeClass('active');
            $('#MenuServerType #TypeWAS').addClass('active');

        } else if (className === 'rtm.view.rtmTPView') {
            window.rtmMonitorType = 'TP';
            $('#MenuServerType .active').removeClass('active');
            $('#MenuServerType #TypeTP').addClass('active');

        } else if (className === 'rtm.view.rtmTuxView') {
            window.rtmMonitorType = 'TUX';
            $('#MenuServerType .active').removeClass('active');
            $('#MenuServerType #TypeTUX').addClass('active');

        } else if (className === 'rtm.view.rtmWebView') {
            window.rtmMonitorType = 'WEB';
            $('#MenuServerType .active').removeClass('active');
            $('#MenuServerType #TypeWEB').addClass('active');

        } else if (className === 'rtm.view.rtmCDView') {
            window.rtmMonitorType = 'CD';
            $('#MenuServerType .active').removeClass('active');
            $('#MenuServerType #TypeCD').addClass('active');

        } else if (className === 'rtm.view.rtmEtoEView' || className === 'rtm.view.rtmBizView') {
            window.rtmMonitorType = 'E2E';
            $('#MenuServerType .active').removeClass('active');
            $('#MenuServerType #TypeE2E').addClass('active');
        }

        // 탭 전환시 표시되어 있는 메뉴 화면 닫기
        $('#MenuClose').removeClass('btnon');

        $('#MenuBorad').removeClass('active');
        $('#descBorad').removeClass('active');

        $('#MenuBorad').slideUp('fast');
        $('#descBorad').slideUp('fast');
    },


    /**
     * 현재 실시간 화면에서 표시되고 있는 모니터링 서버 타입을 반환한다.
     *
     * @return {string} 모니터링 서버 타입
     */
    getCurrentMonitorType: function() {
        return window.rtmMonitorType || 'WAS';
    },


    /**
     * 실시간 화면에 탭 메뉴를 축소/확대 처리
     * WAS 모니터링 화면을 제외한 TP, Web, E2E 모니터링 메뉴를 확장/축소함.
     *
     * @param {boolean} isExpand - true: 확장, false: 축소
     */
    toggleVisibleTab: function(isExpand) {
        var ix, ixLen;
        var rtmTabList = window.tabPanel.getTabBar().getEl().dom.querySelectorAll('.x-tab-top:not(.x-tab-closable)');

        if (rtmTabList && rtmTabList.length > 0) {

            for (ix = 1, ixLen = rtmTabList.length; ix < ixLen; ix++) {
                rtmTabList[ix].style.display = (isExpand) ? 'block' : 'none';
            }
            window.tabPanel.updateLayout();
        }
    },


    /**
     * 테마에 따른 바 차트의 배경 이미지 파일명 반환
     *
     * @param {string} theme - 테마 정보
     * @return {string} 이미지 파일 명
     */
    getBachartBackImage: function(theme) {
        var barImg;

        if (!theme) {
            theme = Comm.RTComm.getCurrentTheme();
        }

        switch (theme) {
            case 'Black' :
                barImg = '../images/EqualTopBlack_3_2Pixel.png';
                break;
            case 'White' :
                barImg = '../images/EqualTopWhite_3_2Pixel.png';
                break;
            default :
                barImg = '../images/EqualTopGray_3_2Pixel.png';
                break;
        }
        return barImg;
    },


    /**
     * 테마에 따른 바 차트의 색상 정보 반환
     *
     * @param {string} theme - 테마 정보
     * @return {object} 색상 정보
     */
    getBachartColors: function(theme) {
        var barColors;

        if (!theme) {
            theme = Comm.RTComm.getCurrentTheme();
        }

        switch (theme) {
            case 'Black' :
                barColors = realtime.BarChartColor.Black;
                break;
            case 'White' :
                barColors = realtime.BarChartColor.White;
                break;
            default :
                barColors = realtime.BarChartColor.Gray;
                break;
        }
        return barColors;
    },


    /**
     * 서버 타입이 현재 모니터링하고 있는 서버 타입인지 체크.
     *
     * @param {string} monitorType - 모니터링 타입
     * @return {boolean}
     */
    isEnableRtmView: function(monitorType) {
        var isDisplayCmp;
        if (monitorType === 'WAS' || !monitorType) {
            isDisplayCmp = Comm.rtmShow;

        } else if (monitorType === 'TP') {
            isDisplayCmp = Comm.rtmTPShow;

        } else if (monitorType === 'TUX') {
            isDisplayCmp = Comm.rtmTuxShow;

        } else if (monitorType === 'WEB') {
            isDisplayCmp = Comm.rtmWebShow;

        } else if (monitorType === 'CD') {
            isDisplayCmp = Comm.rtmCDShow;

        } else if (monitorType === 'E2E') {
            isDisplayCmp = (Comm.rtmE2EShow) ? Comm.rtmE2EShow : Comm.rtmBizShow;

        } else {
            isDisplayCmp = false;
        }
        return isDisplayCmp;
    },


    /**
     * 메인 탭 화면에서 현재 표시하고 있는 모니터링 화면의 순서 반환
     *
     * @return {number}
     */
    getRtmViewIndexByType: function() {
        var index = realtime.rtmViewList.indexOf(window.rtmMonitorType);
        if (index < 0) {
            index = 0;
        }
        return index;
    },


    /**
     * 현재 표시되고 있는 모니터링 화면의 베이스 DockContainer ID를 반환
     *
     * @return {string}
     */
    getBaseDockLayerId: function() {
        var monitorType = window.rtmMonitorType;
        var imxDockId;

        if (monitorType === 'WAS' || !monitorType) {
            imxDockId = window.imxDockLayerBaseId;

        } else if (monitorType === 'TP') {
            imxDockId = window.imxTPDockLayerBaseId;

        } else if (monitorType === 'WEB') {
            imxDockId = window.imxWebDockLayerBaseId;

        } else if (monitorType === 'CD') {
            imxDockId = window.imxCDDockLayerBaseId;

        } else if (monitorType === 'E2E') {
            imxDockId = (Comm.rtmBizShow) ? window.imxBizDockLayerBaseId : window.imxE2EDockLayerBaseId;
        }
        return imxDockId;
    },


    /**
     * 현재 표시되고 있는 모니터링 화면의 베이스 컨테이너 객체를 반환
     *
     * @return {object}
     */
    getRtmBaseContainer: function() {
        var cls;
        if (window.rtmMonitorType === 'TP') {
            cls = ' tp';
        } else if (window.rtmMonitorType === 'TUX') {
            cls = ' tux';
        } else if (window.rtmMonitorType === 'WEB') {
            cls = ' web';
        } else if (window.rtmMonitorType === 'CD') {
            cls = ' cd';
        } else if (window.rtmMonitorType === 'E2E') {
            cls = ' e2e';
        } else {
            cls = '';
        }
        return Ext.ComponentQuery.query('container[cls=rtm-base' + cls + ']')[0];
    },


    /**
     * 하루 24시간 중 현재 시간이 위치하는 순서 값 반환
     *
     * @return {number}
     */
    getCurrentIndexOfDay: function() {
        var dataTime = new Date();
        var newDate  = new Date();
        var min      = newDate.getUTCMinutes();
        var offset   = dataTime.getTimezoneOffset();

        dataTime.setMinutes( offset );
        dataTime.setMinutes( Repository.timeZoneOffset[Repository.trendChartData.timeRecordWasId] || -offset);

        newDate.setMinutes( offset);
        newDate.setMinutes( Repository.timeZoneOffset[Repository.trendChartData.timeRecordWasId] || -offset);

        newDate.setHours(0, 0, 0, 0);
        dataTime.setMinutes(min);

        if (realtime.lastServiceStatTime) {
            dataTime = new Date(realtime.lastServiceStatTime);
        }

        var lastValueIndex = Math.floor( (dataTime - newDate.getTime() ) / 1000 / 60);

        if (lastValueIndex < 0) {
            lastValueIndex = 0;
        }

        dataTime = null;
        newDate  = null;
        min      = null;
        offset   = null;

        return lastValueIndex;
    },

    /**
     * PopupList 객체에 팝업 정보 Add
     *
     * @param {object} Popup Window
     * @param {object} Opener Ext.js this
     */
    addPopupList: function(item, _this) {
        if (this.getPopupList(item.name)) {
            return;
        }

        realtime.rtmPopupList.push({
            name   : item.name,
            obj    : item,
            opener : _this
        });

        item = null;
    },

    /**
     * PopupList 객체에 팝업 정보 Get
     *
     * @param {String} Popup Name
     * @return {object} Popup Info
     */
    getPopupList: function(name) {
        var ix, ixLen;

        for (ix = 0, ixLen = realtime.rtmPopupList.length; ix < ixLen; ix++) {
            if (realtime.rtmPopupList[ix] && realtime.rtmPopupList[ix].name == name) {
                break;
            }
        }

        return realtime.rtmPopupList[ix];
    },

    /**
     * PopupList 객체에 팝업 정보 Delete
     *
     * @param {String} Popup Window
     */
    removePopupList: function(item) {
        var ix, ixLen;

        for (ix = 0, ixLen = realtime.rtmPopupList.length; ix < ixLen; ix++) {
            if (realtime.rtmPopupList[ix] && realtime.rtmPopupList[ix].name == item.name) {
                delete realtime.rtmPopupList[ix];
                realtime.rtmPopupList.splice(ix, 1);
                item = null;
                break;
            }
        }

        item = null;
    },


    /**
     * MaxGauge 연동 기능이 가능한지 확인
     *
     * @return {boolean} true: 연동 가능, false: 연동 불가능
     */
    isMaxGaugeLink: function() {
        var isLink;
        var useMaxGaugeDetail = common.Menu.useExtMaxGaugeDetail;

        if (useMaxGaugeDetail) {
            isLink = true;
        } else {
            isLink = false;
        }
        return isLink;
    },

    /**
     * MFO의 RTM의 Trend View 화면 표시
     *
     * @param {string} dbId
     * @param {string} tid
     * @param {string} sid
     */
    openMaxGaugeTrendView: function(dbId, tid, sid) {

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = '#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_DB_LIST.INSTANCE_ID=' + instanceId +
                '&SSO_PAGE=0' +
                '&SSO_VIEW=TrendView' +
                '&SSO_PARAM.dbId=' + instanceId +
                '&SSO_PARAM.tid='  + tid +
                '&SSO_PARAM.sid='  + sid;

            Comm.RTComm.openMaxGaugeView(params);
        }.bind(this));
    },

    /**
     * MFO의 RTM의 SQL Used 화면 표시
     *
     * @param {string} dbId
     * @param {string} sqlId
     */
    openMaxGaugeSQLUsed: function(dbId, sqlId) {

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = '#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_DB_LIST.INSTANCE_ID=' + instanceId +
                '&SSO_PAGE=0' +
                '&SSO_VIEW=tools.SQLUsed' +
                '&SSO_PARAM.dbId=' + instanceId +
                '&SSO_PARAM.sqlUid=' + sqlId;

            Comm.RTComm.openMaxGaugeView(params);
        }.bind(this));
    },

    /**
     * MFO의 RTM의 Session Detail 화면 표시
     *
     * @param {string} dbId
     * @param {string} sqlId
     * @param {string} sid
     * @param {string} tid
     */
    openMaxGaugeSessionDetail: function(dbId, sqlId, sid, tid) {

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = '#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_DB_LIST.INSTANCE_ID=' + instanceId +
                '&SSO_PAGE=0' +
                '&SSO_VIEW=Frame.SessionDetailWin' +
                '&SSO_PARAM.dbId=' + instanceId +
                '&SSO_PARAM.sqlUid=' + sqlId +
                '&SSO_PARAM.sid=' + sid +
                '&SSO_PARAM.tid=' + tid;

            Comm.RTComm.openMaxGaugeView(params);
        }.bind(this));
    },

    /**
     * MFO의 RTM의 Single View 화면 표시
     *
     * @param {string} dbId
     */
    openMaxGaugeSingleView: function(dbId) {

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = '#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_DB_LIST.INSTANCE_ID=' + instanceId +
                '&SSO_PAGE=0' +
                '&SSO_VIEW=view.SingleView' +
                '&SSO_PARAM.dbId=' + instanceId;

            this.openMaxGaugeView(params);
        }.bind(this));
    },

    /**
     * MFO의 RTM의 Single View Lock Tree 화면 표시
     *
     * @param {string} dbId
     */
    openMaxGaugeLockTreeView: function(dbId) {

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = '#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_DB_LIST.INSTANCE_ID=' + instanceId +
                '&SSO_PAGE=0' +
                '&SSO_DB_LIST.view=view.SingleView' +
                '&SSO_VIEW=Frame.LockTree' +
                '&SSO_PARAM.dbId=' + instanceId;

            this.openMaxGaugeView(params);
        }.bind(this));
    },

    /**
     * MFO의 PA의 Performance Trend 화면 표시
     *
     * @param {} dbId
     * @param {} fromTime
     * @param {} toTime
     */
    openMaxGaugePerformanceTrend: function(dbId, fromTime, toTime) {
        var isDate = Comm.RTComm.isValidDate(fromTime, toTime);

        // 유효한 날짜 정보가 아닌 경우 연동 처리를 하지 않고 메시지를 표시한다.
        if (!isDate) {
            common.Util.showMessage('', common.Util.TR('Date type value is incorrect.'), Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // MFO 연동 조건으로 설정되는 시간값을 MFO에서 조회 시 설정되는 시간 단위에 맞추기 위해
        // 초 단위까지만 설정되게 처리.
        fromTime = common.Util.getDate(fromTime);
        toTime   = common.Util.getDate(toTime);

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = '#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_DB_LIST.INSTANCE_ID=' + instanceId +
                '&SSO_PAGE=1' +
                '&SSO_VIEW=PerformanceTrendView' +
                '&SSO_PARAM.dbId='     + instanceId +
                '&SSO_PARAM.fromTime=' + fromTime +
                '&SSO_PARAM.toTime='   + toTime;

            this.openMaxGaugeView(params);
        }.bind(this));
    },

    /**
     * MFO의 PA의 SQL List 화면 표시
     *
     * @param {} dbId
     * @param {} fromTime
     * @param {} toTime
     * @param {} sqlUid
     * @param {} tid
     */
    openMaxGaugeSQLList: function(dbId, fromTime, toTime, sqlUid, tid) {
        var isDate = Comm.RTComm.isValidDate(fromTime, toTime);

        // 유효한 날짜 정보가 아닌 경우 연동 처리를 하지 않고 메시지를 표시한다.
        if (!isDate) {
            common.Util.showMessage('', common.Util.TR('Date type value is incorrect.'), Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // MFO 연동 조건으로 설정되는 시간값을 MFO에서 조회 시 설정되는 시간 단위에 맞추기 위해
        // 초 단위까지만 설정되게 처리.
        fromTime = common.Util.getDate(fromTime);
        toTime   = common.Util.getDate(toTime);

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = '#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_DB_LIST.INSTANCE_ID=' + instanceId +
                '&SSO_PAGE=1' +
                '&SSO_VIEW=SQLListView' +
                '&SSO_PARAM.dbId='     + instanceId +
                '&SSO_PARAM.sqlUid='   + sqlUid +
                '&SSO_PARAM.tid='      + tid +
                '&SSO_PARAM.fromTime=' + fromTime +
                '&SSO_PARAM.toTime='   + toTime;

            this.openMaxGaugeView(params);
        }.bind(this));
    },

    /**
     * MFO의 Long-Term Trend SQL 화면 표시
     *
     * @param {string} dbId
     * @param {string} fromTime
     * @param {string} toTime
     * @param {string} sqlUid
     */
    openMaxGaugeLongTerm: function(dbId, fromTime, toTime, sqlUid) {
        var isDate = Comm.RTComm.isValidDate(fromTime, toTime);

        // 유효한 날짜 정보가 아닌 경우 연동 처리를 하지 않고 메시지를 표시한다.
        if (!isDate) {
            common.Util.showMessage('', common.Util.TR('Date type value is incorrect.'), Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // MFO 연동 조건으로 설정되는 시간값을 MFO에서 조회 시 설정되는 시간 단위에 맞추기 위해
        // 초 단위까지만 설정되게 처리.
        fromTime = common.Util.getDate(fromTime);
        toTime   = common.Util.getDate(toTime);

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = '#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_DB_LIST.INSTANCE_ID=' + instanceId +
                '&SSO_PAGE=1' +
                '&SSO_VIEW=LongTermTrendSQLView' +
                '&SSO_PARAM.name=1-SQL' +
                '&SSO_PARAM.dbId='     + instanceId +
                '&SSO_PARAM.fromTime=' + fromTime +
                '&SSO_PARAM.toTime='   + toTime +
                '&SSO_PARAM.sqlUid='   + sqlUid;

            this.openMaxGaugeView(params);
        }.bind(this));
    },

    /**
     * MFO의 SQL Plan 화면 팝업 표시
     *
     * @param {string} dbId
     * @param {string} fromTime
     * @param {string} toTime
     * @param {string} sqlUid
     */
    openMaxGaugeSQLPlan: function(dbId, fromTime, toTime, sqlUid) {
        var isDate = Comm.RTComm.isValidDate(fromTime, toTime);

        // 유효한 날짜 정보가 아닌 경우 연동 처리를 하지 않고 메시지를 표시한다.
        if (!isDate) {
            common.Util.showMessage('', common.Util.TR('Date type value is incorrect.'), Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        // MFO 연동 조건으로 설정되는 시간값을 MFO에서 조회 시 설정되는 시간 단위에 맞추기 위해
        // 초 단위까지만 설정되게 처리.
        fromTime = common.Util.getDate(fromTime);
        toTime   = common.Util.getDate(toTime);

        this.getMaxGaugeById(dbId, function(instanceId) {
            var params = 'popup/external.html#' +
                'SSO_AUTH=1' +
                '&SSO_USER=admin' +
                '&SSO_VIEW=Exem.FullSQLTextContainer' +
                '&SSO_PARAM.dbId='     + instanceId +
                '&SSO_PARAM.sqlUid='   + sqlUid +
                '&SSO_PARAM.fromTime=' + fromTime +
                '&SSO_PARAM.toTime='   + toTime;

            this.openMaxGaugePopupWin(params);

        }.bind(this));
    },

    /**
     * MaxGauge 연동에 필요한 URL 및 파라미터 값을 설정하여 접속.
     *
     * @param {string} params
     */
    openMaxGaugeView: function(params) {
        var mxgUrl = common.Menu.useExtMaxGaugeURL;

        var connectUrl = mxgUrl + params;

        var imxOpenLink    = document.createElement('a');
        imxOpenLink.rel    = 'noreferrer';
        imxOpenLink.target = 'MaxGauge_Browser';
        imxOpenLink.href   = connectUrl;
        imxOpenLink.click();
    },

    /**
     * MaxGauge 연동에 필요한 URL 및 파라미터 값을 설정하여 접속.
     *
     * @param {string} params
     */
    openMaxGaugePopupWin: function(params) {
        var mxgUrl = common.Menu.useExtMaxGaugeURL;

        var connectUrl = mxgUrl + params;

        var currentWidth  = 800;
        var currentHeight = 900;
        var popupOptions  = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;

        console.debug('');
        console.debug('');
        console.debug('URL:', connectUrl);
        console.debug('Name:', 'MaxGauge_Browser_popup');
        console.debug('Options:', popupOptions);

        window.open(connectUrl, 'MaxGauge_Browser_popup', popupOptions);
    },


    /**
     * 인터맥스에서 사용하는 DB ID를 가지고 MFO에서 사용하는 DB ID를 가져오기.
     *
     * @param {number | string} dbId - DB ID
     * @param {function} callback
     */
    getMaxGaugeById: function(dbId, callback) {
        WS.PluginFunction({
            'function': 'get_mfj_2_mfo_dbid',
            'options' : {
                'db_id': dbId
            }
        }, function(aheader, adata) {
            if (callback) {
                callback(adata.mfo_db_id);
            }
        }, this);
    },


    /**
     * TID에 해당하는 트랜잭션이 종료된 트랜잭션인지 체크.
     * callback 함수에 TID에 해당하는 트랜잭션 종료 유무 및 해당 서버ID를 전달함.
     *
     * @param {string} tid - TID
     * @param {function} callback - 함수
     */
    checkEndTxn: function(tid, callback) {
        var endTxn   = false;
        var serverId = 0;

        if (!tid) {
            console.debug('%c [Check End Transaction] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'TID, Parameter is undefined.');
            return;
        }

        // WS에서 SQL을 실행하는데 지정된 데이터베이스가 없는 경우 기본 데이터베이스를 지정하여 처리되게함.
        if (!WS.defaultdb) {
            WS.defaultdb = Comm.currentRepositoryInfo.database_name || localStorage.getItem('Intermax_MyRepository');
        }

        WS.SQLExec({
            sql_file: 'IMXRT_Check_Txn.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: tid
            }]
        }, function(aheader, adata) {
            if (aheader && aheader.success === false && !adata) {
                console.debug('%c [Check End Transaction] [ERROR] Failed to retrieve the End Txn Data.', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                return;
            }

            if (adata.rows && adata.rows.length > 0) {
                endTxn   = (adata.rows[0][0] > 0) ? true : false;
                serverId = adata.rows[0][1];
            }

            callback(endTxn, serverId);

        }, this);
    },

    /**
     * EtoE 구성에서 설정된 업무ID에 해당하는 업무명을 반환.
     *
     * @param {string | number} bizId - 업무 ID
     * @returns {string} 업무명
     */
    getBusinessNameById: function(bizId) {
        var bizName, ix, ixLen;

        if (Comm.etoeBizInfos[bizId] && Comm.etoeBizInfos[bizId].name) {
            bizName = Comm.etoeBizInfos[bizId].name;
        } else {
            for (ix = 0, ixLen = Comm.bizInfo.length; ix < ixLen; ix++) {
                if (Comm.bizInfo[ix].bizId == bizId) {
                    bizName = Comm.bizInfo[ix].bizName;
                    break;
                }
            }

        }

        return bizName;
    },

    /**
     * EtoE 구성에서 설정된 업무ID에 해당하는 업무명을 반환.
     *
     * @param {string | number} bizId - 업무 ID
     * @returns {string} 업무명
     */
    getLearnBizNameById: function(bizId) {
        var bizName, ix, ixLen;

        for (ix = 0, ixLen = Comm.learnBizInfo.length; ix < ixLen; ix++) {
            if (Comm.learnBizInfo[ix].bizId == bizId) {
                bizName = Comm.learnBizInfo[ix].bizName;
            }
        }

        return bizName;
    },

    /**
     * EtoE 구성에서 설정된 업무ID에 해당하는 최상위 업무ID를 반환.
     *
     * @param {string | number} id - 업무 ID
     * @returns {string} 업무명
     */
    getParentBusinessIdById: function(id) {
        var ix, ixLen;
        var bizId, topBizId;

        var bizIdArr = Object.keys(Comm.etoeBizMaps);

        for (ix = 0, ixLen = bizIdArr.length; ix < ixLen; ix++) {
            bizId = bizIdArr[ix];

            if (+id === +bizId) {
                topBizId = bizId;
                break;
            }

            if (Comm.etoeBizMaps[bizId].length > 0 && Comm.etoeBizMaps[bizId].indexOf(+id) !== -1) {
                topBizId = bizId;
                break;
            }
        }

        return topBizId;
    },

    /**
     * EtoE 구성에서 설정된 구간ID에 해당하는 구간명을 반환.
     *
     * @param {string | number} id - 구간 ID
     * @returns {string} 구간명
     */
    getTierNameById: function(id) {
        var tierIdArr = Object.keys(Comm.sortTierInfo);
        var ix, ixLen, tierName;

        for (ix = 0, ixLen = tierIdArr.length; ix < ixLen; ix++) {
            if (id === Comm.sortTierInfo[ix].tierId) {
                tierName = Comm.sortTierInfo[ix].tierName;
            }
        }

        return tierName;
    },


    /**
     * 1 LEVEL 업무 ID 배열을 반환
     *
     * @param {Array} bizList - 업무목록 (1 LEVEL, 2 LEVEL)
     * @returns {Array} 업무 ID 목록 (1 LEVEL)
     */
    getBizIdList: function(bizList) {
        if (!bizList) {
            return null;
        }

        var ix, ixLen, bizId = [];

        for (ix = 0, ixLen = bizList.length; ix < ixLen; ix++) {
            bizId.push(bizList[ix].parent['bizId']);
        }

        return bizId;
    },


    /**
     * 1 LEVEL 업무명 배열을 반환
     *
     * @param {Array} bizList - 업무목록 (1 LEVEL, 2 LEVEL)
     * @returns {Array} 업무명 목록 (1 LEVEL)
     */
    getBizNameList: function(bizList) {
        if (!bizList) {
            return null;
        }

        var ix, ixLen, bizName = [];

        for (ix = 0, ixLen = bizList.length; ix < ixLen; ix++) {
            bizName.push(bizList[ix].parent['bizName']);
        }

        return bizName;
    }
});

