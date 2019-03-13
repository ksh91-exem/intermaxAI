Ext.define('rtm.src.rtmActiveTxnRemoteTree', {
    extend : 'rtm.src.rtmActiveTxn',
    title: common.Util.CTR('Remote Tree'),
    layout : 'fit',
    width  : '100%',
    height: '100%',
    allCheckBox: false,

    dataIndex: [],
    NODE: [],
    MNODE: [],
    CNODE: [],
    CNodeRunOnce: false,

    timerCount: 0,
    timerRunOnce: false,
    alertState: '',
    MNODECount: 0,
    CNODECount: 0,

    timerInc: null,
    refreshTimer: null,

    sqlFullText: null,
    txnDetail: null,

    //데이터 새로고침 간격.
    intervalTime: 3000,

    //화면이 최소화인 경우 보여지는 컬럼 인덱스
    minViewVisibleDataIndex: ['time', 'wasname', 'transaction', 'elapsetime', 'dbtime', 'sid', 'state', 'sql1'],

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ACTIVETXN, me);

            if (this.timerInc) {
                clearTimeout(this.timerInc);
                this.timerInc = null;
            }
        }
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        this.callParent();

        this.initProperty();

        this.activeRemoteRefreshCheck = true;

        this.frameTitle.setText(common.Util.CTR('Remote Tree'));

        this.addCls('rtm-txnremote-base');

        this.createGrid();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ACTIVETXN, this);
    },

    initProperty: function() {
        this.monitorType = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        // 리모트 트리 목록에서 색상을 구분하여 보여줄지 정하는 구분 값
        this.isUseRowColor = common.Menu.useRemoteTreeColor;

        this.isRowColorByTxn = common.Menu.useRowColorByTxn;
    },

    createGrid: function() {
        var self = this;

        var gridName = 'intermax_remotetree';

        this.tree = Ext.create('Exem.BaseGrid', {
            gridName       : gridName,
            width          : '100%',
            gridType       : Grid.exTree,
            localeType     : 'H:i:s',
            borderVisible  : true,
            baseGridCls    : 'baseGridRTM',
            contextBaseCls : 'rtm-context-base',
            exportFileName : this.title,
            useFindOn      : false,
            columnmove     : function() {
                this.saveLayout(self.grid.name);
            },
            celldblclick: function(thisGrid, td, cellIndex, record) {
                var temp = thisGrid.headerCt.getHeaderAtIndex(cellIndex);
                var sqlid = '';
                if (self.sqlFullText) {
                    self.sqlFullText.destroy();
                    self.sqlFullText = null;
                }
                self.sqlFullText = Ext.create('Exem.FullSQLTextWindow',{
                    cls: 'rtm-sqlview'
                });

                switch (temp.text) {
                    case 'SQL 1' : sqlid = record.data.sqlid1;
                        break;
                    case 'SQL 2' : sqlid = record.data.sqlid2;
                        break;
                    default:
                        break;
                }

                if (sqlid !== '') {
                    self.sqlFullText.getFullSQLText(sqlid, record.data.bind_list);

                    var theme = Comm.RTComm.getCurrentTheme();
                    var editTheme;
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
                    self.sqlFullText.addCls('xm-dock-window-base');
                    self.sqlFullText.BaseFrame.sqlEditor.editTheme = editTheme;
                    self.sqlFullText.show();
                } else {
                    self.sqlFullText.destroy();
                    self.sqlFullText = null;

                    if (record.data.tid == undefined || record.data.wasid == undefined) {
                        return;
                    }

                    var selectServerType = Comm.wasInfoObj[record.data.wasid].type || 'WAS';

                    self.txnDetail = Ext.create('rtm.src.rtmActiveTxnDetail');
                    self.txnDetail.stack_dump   = false;
                    self.txnDetail.tid          = record.data.tid;
                    self.txnDetail.wasid        = record.data.wasid;
                    self.txnDetail.starttime    = record.data.starttime;
                    self.txnDetail.current_time = record.data.time;
                    self.txnDetail.monitorType  = selectServerType;

                    self.txnDetail.initWindow();
                    setTimeout(function() {
                        self.txnDetail.init(record.data);
                    },10);
                }
            }
        });

        this.tree.beginAddColumns();
        this.tree.addColumn(common.Util.CTR('Transaction'        ), 'transaction'     , 250,  Grid.String,   true,  false, 'treecolumn');
        this.tree.addColumn(common.Util.CTR('Remote Type'        ), 'remotetype'      , 100,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('TID'                ), 'tid'             , 150,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('Key 1'              ), 'key1'            , 150,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('Key 2'              ), 'key2'            , 150,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('Key 3'              ), 'key3'            , 150,  Grid.String,   false, false); // 5
        this.tree.addColumn(common.Util.CTR('Key 4'              ), 'key4'            , 150,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('Key 5'              ), 'key5'            , 150,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('Key6'               ), 'key6'            , 150,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('WAS'                ), 'wasid'           , 100,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('Agent'              ), 'wasname'         , 130,  Grid.String,   true,  false); // 10
        this.tree.addColumn(common.Util.CTR('Class Method'       ), 'classmethod'     , 300,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Method Type'        ), 'methodtype'      , 100,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Time'               ), 'time'            , 100,  Grid.DateTime, true,  false);
        this.tree.addColumn(common.Util.CTR('Client IP'          ), 'clientip'        , 120,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Start Time'         ), 'starttime'       , 100,  Grid.String,   true,  false); // 15
        this.tree.addColumn(common.Util.CTR('CPU Time'           ), 'cputime'         ,  80,  Grid.Float,    true,  false);
        this.tree.addColumn(common.Util.CTR('Elapse Time'        ), 'elapsetime'      , 100,  Grid.Float,    true,  false);
        this.tree.addColumn(common.Util.CTR('Login Name'         ), 'loginname'       , 100,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Browser'            ), 'browser'         , 100,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('DB Time'            ), 'dbtime'          ,  80,  Grid.Float,    true,  false); // 20
        this.tree.addColumn(common.Util.CTR('Wait Time'          ), 'waittime'        ,  80,  Grid.Float,    true,  false);
        this.tree.addColumn(common.Util.CTR('Pool'               ), 'pool'            , 130,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Instance'           ), 'instance'        , 130,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('SID'                ), 'sid'             , 100,  Grid.Number,   true,  false);
        this.tree.addColumn(common.Util.CTR('State'              ), 'state'           , 150,  Grid.String,   true,  false); // 25
        this.tree.addColumn(common.Util.CTR('Bind Value'         ), 'bindlist'        , 150,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('SQLID 1'            ), 'sqlid1'          , 100,  Grid.String,   false, true );
        this.tree.addColumn(common.Util.CTR('SQL 1'              ), 'sql1'            , 200,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('SQLID 2'            ), 'sqlid2'          , 100,  Grid.String,   false, true );
        this.tree.addColumn(common.Util.CTR('SQL 2'              ), 'sql2'            , 200,  Grid.String,   true,  false); // 30
        this.tree.addColumn(common.Util.CTR('SQL Execution Count'), 'sqlexecutecount' , 120,  Grid.Number,   true,  false);
        this.tree.addColumn(common.Util.CTR('Fetch Count'        ), 'fetchcount'      , 100,  Grid.Number,   true,  false);
        this.tree.addColumn(common.Util.CTR('Prepare Count'      ), 'preparecount'    , 120,  Grid.Number,   true,  false);
        this.tree.addColumn(common.Util.CTR('PGA Usage (MB)'     ), 'pgausage'        , 100,  Grid.Float,    true,  false);
        this.tree.addColumn(common.Util.CTR('Logical Reads'      ), 'logicalreads'    , 110,  Grid.Number,   true,  false); // 35
        this.tree.addColumn(common.Util.CTR('Physical Reads'     ), 'physicalreads'   , 110,  Grid.Number,   true,  false);
        this.tree.addColumn(common.Util.CTR('Wait Info'          ), 'waitinfo'        , 500,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Moved'              ), 'moved'           , 100,  Grid.Number,   false, false);
        this.tree.addColumn(common.Util.CTR('Dest'               ), 'dest'            , 100,  Grid.String,   false, false);
        this.tree.addColumn(common.Util.CTR('GUID'               ), 'guid'            ,  80,  Grid.String,   false, false);
        this.tree.endAddColumns();

        /*
         * 리모트 행의 색상을 구분하는 기준 항목이 Key인지 GUID인지 체크하여 설정한다.
         * Dest 컬럼에 있는 GUID 값으로 구분하여 처리하는 것으로 정해졌으나
         * GUID 값이 없을 수 있는 경우 Key 항목으로 표시할 수 있게 처리함.
         * 기본으로는 GUID 항목으로 구분하여 설정한다.
         */
        if (this.isRowColorByTxn) {
            this.setRowColorByRootTxn();

        } else {
            this.setRowColorByGUID();
        }

        if (!this.floatingLayer) {
            var clist = this.tree.pnlExTree.headerCt.getGridColumns();

            for (var ix = 0; ix < clist.length; ix++) {
                if (this.minViewVisibleDataIndex.indexOf(clist[ix].dataIndex) !== -1) {
                    clist[ix].colvisible = true;
                    clist[ix].setVisible(true);
                } else {
                    clist[ix].colvisible = false;
                    clist[ix].setVisible(false);
                }
            }
            clist = null;
        }

        //NonDB 인 경우 특정 컬럼 숨김 처리
        if (window.isIMXNonDB) {
            common.WebEnv.setVisibleGridColumn(
                this.tree,
                ['waittime', 'cputime', 'waitinfo', 'logicalreads', 'physicalreads', 'pgausage'],
                true
            );
        }

        // 로그인 사용자가 Bind 권한이 없는 경우 숨김 처리
        if (Comm.config.login.permission.bind !== 1) {
            common.WebEnv.setVisibleGridColumn(this.tree, ['bindlist'], true);
        }

        var gridpanel = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width : '100%',
            flex  : 1,
            style : { background: '#ffffff' }
        });

        this.tree.loadLayout(gridName);

        try {
            gridpanel.add(this.tree);
            this.tabpanel.add(gridpanel);
        } finally {
            gridpanel = null;
        }
    },

    Comparator: function(a, b) {
        if (a[9] > b[9]) {
            return -1;
        }
        if (a[9] < b[9]) {
            return 1;
        }
        return 0;
    },

    getDate: function(time) {
        var date = new Date(time);
        var h = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds();
        return '' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    },


    /**
     * @override DockForm.js의 attachMoveDirection() 함수 Override.
     * Dock Container 에 창을 설정시 실행되어야 하는 내용 .
     */
    attachMoveDirection: function() {
        if (this.tree) {
            var clist = this.tree.pnlExTree.headerCt.getGridColumns();

            for (var i = 0; i < clist.length; i++) {
                if (this.minViewVisibleDataIndex.indexOf(clist[i].dataIndex) !== -1) {
                    clist[i].colvisible = true;
                    clist[i].setVisible(true);
                } else {
                    clist[i].colvisible = false;
                    clist[i].setVisible(false);
                }
            }
            clist = null;
        }
        this.callParent();
    },


    /**
     * Auto Refresh 설정
     * rtmActiveTxn.js의 changeAutoRefresh 함수
     */
    changeAutoRefresh: function(val) {
        this.activeRemoteRefreshCheck = val;
    },


    /**
     * Transaction Remote Tree 데이터 로드
     */
    onData: function(adata) {

        // 새로고침이 체크되어 있는지 확인
        if (!this.activeRemoteRefreshCheck) {
            adata = null;
            return;
        }

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (!isDisplayCmp && !this.floatingLayer) {
            return;
        }

        this.data = Ext.clone(adata);

        if (this.data && this.data.rows && this.data.rows.length > 0 && this.activeRemoteRefreshCheck) {
            this.CNodeRunOnce = false;

            this.MNODECount = 0;
            this.CNODECount = 0;

            this.tree.clearNodes();
            this.Add_PNode();

            this.timerCount = 0;

            if (!this.timerRunOnce) {
                this.timerRunOnce = true;
                this.dataCheck();
            }
        }
        adata = null;
    },

    Add_PNode: function() {
        var ix, jx;
        var node = [];
        var bind = '';
        var temp;
        var classMethod;
        var guidDest, guid, dest, splitIdx;

        var rows = this.data.rows;

        for (ix = 0; ix < rows.length; ix++) {
            if (parseInt(rows[ix][42]) === 80) {
                rows[ix][42] = 'P';
                node[node.length] = rows[ix];
            }
        }

        node = node.sort(this.Comparator);

        for (ix = 0; ix < node.length; ix++) {
            if (node[ix][55] !== '') {
                bind = '';
                temp = common.Util.convertBindList(node[ix][55]);
                for (jx = 0; jx < temp.length; jx++) {
                    if (jx === 0) {
                        bind += ',';
                    }
                    bind += temp[jx].value;
                }
            }

            if (parseInt(node[ix][43]) === 0 &&
                parseInt(node[ix][44]) === 0 &&
                parseInt(node[ix][45]) === 0 &&
                parseInt(node[ix][46]) === 0 &&
                parseInt(node[ix][47]) === 0 &&
                parseInt(node[ix][48]) === 0) {
                continue;
            }

            if (Comm.wasInfoObj[+node[ix][1]] && Comm.wasInfoObj[+node[ix][1]].type === 'TP') {
                classMethod = '';
            } else {
                classMethod = node[ix][54];
            }

            guidDest = node[ix][56];
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

            this.tree.addNode(
                null,
                [
                    node[ix][5],                                                // TXN Name
                    node[ix][42],                                               // Remote Type
                    node[ix][3],                                                // TID
                    node[ix][43],                                               // Key1
                    node[ix][44],                                               // Key2
                    node[ix][45],                                               // Key3
                    node[ix][46],                                               // Key4
                    node[ix][47],                                               // Key5
                    node[ix][48],                                               // Key6
                    node[ix][1],                                                // WAS Id
                    node[ix][2],                                                // WAS Name
                    classMethod,                                                // Class Method
                    common.Util.codeBitToMethodType(node[ix][41]),              // Method Type
                    common.Util.getDate(node[ix][0]),                           // Time
                    node[ix][6],                                                // Client IP
                    common.Util.getDate(parseInt(node[ix][7])),                 // Start Time
                    node[ix][10] / 1000,                                        // CPU_Time
                    node[ix][9] / 1000,                                         // Elapsed_Time
                    node[ix][39],                                               // Login_Name
                    '',                                                         // Browser
                    (node[ix][10] / 1000)+(node[ix][11] / 1000),                // DB Time
                    node[ix][11] / 1000,                                        // Wait_Time
                    node[ix][13],                                               // Pool
                    node[ix][15],                                               // Instance
                    node[ix][16],                                               // SID
                    Comm.RTComm.getActiveTxnState(node[ix][17]),                // State
                    bind,                                                       // Bind_List
                    node[ix][18],                                               // SQLID 1
                    node[ix][19],                                               // SQL_Text_1
                    node[ix][20],                                               // SQLID 2
                    node[ix][21],                                               // SQL_Text_2
                    node[ix][28],                                               // SQL Execute Count
                    node[ix][29],                                               // Fetch_Count
                    node[ix][30],                                               // Prepare_Count
                    '',                                                         // pga usage (mb)
                    node[ix][33],                                               // Logical_Reads
                    node[ix][34],                                               // Physical_Reads
                    node[ix][35],                                               // Wait_Info
                    1,                                                          // Moved
                    dest,                                                       // Dest
                    guid                                                        // guid
                ]
            );
        }

        try {
            this.Add_MCNode(rows, 'M');
        } finally {
            ix   = null;
            node = null;
            bind = null;
            temp = null;
            rows = null;
        }
    },

    Add_MCNode: function(rows, type) {
        var ix;
        var compare = type === 'M' ? 77 : 67;
        var bind = '';
        var temp;
        var classMethod;
        var guidDest, guid, dest, splitIdx;

        for (ix = 0; ix < rows.length; ix++) {

            guidDest = rows[ix][56];
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

            if (compare === 67 && rows[ix][42] == 0) {

                if (parseInt(rows[ix][43]) === 0 &&
                    parseInt(rows[ix][44]) === 0 &&
                    parseInt(rows[ix][45]) === 0 &&
                    parseInt(rows[ix][46]) === 0 &&
                    parseInt(rows[ix][47]) === 0 &&
                    parseInt(rows[ix][48]) === 0) {
                    continue;
                }

                if (Comm.wasInfoObj[+rows[ix][1]].type === 'TP') {
                    classMethod = '';
                } else {
                    classMethod = rows[ix][54];
                }

                this.tree.addNode(
                    null,
                    [
                        rows[ix][5],                                          // TXN_Name
                        rows[ix][42],                                         // Remote_Type
                        rows[ix][3],                                          // TID
                        rows[ix][43],                                         // Key1
                        rows[ix][44],                                         // Key2
                        rows[ix][45],                                         // Key3
                        rows[ix][46],                                         // Key4
                        rows[ix][47],                                         // Key5
                        rows[ix][48],                                         // Key6
                        rows[ix][1],                                          // Was_ID
                        rows[ix][2],                                          // Was_Name
                        classMethod,                                          // Class_Method
                        common.Util.codeBitToMethodType(rows[ix][41]),        // Method_Type
                        common.Util.getDate(rows[ix][ 0]),                    // Time
                        rows[ix][6],                                          // Client_IP
                        common.Util.getDate(parseInt(rows[ix][7])),           // Start_Time
                        rows[ix][10] / 1000,                                  // CPU_Time
                        rows[ix][9] / 1000,                                   // Elapsed_Time
                        rows[ix][39],                                         // Login_Name
                        '',                                                   // Browser
                        (rows[ix][10] / 1000)+(rows[ix][11] / 1000),          // DB Time
                        rows[ix][11] / 1000,                                  // Wait_Time
                        rows[ix][13],                                         // Pool
                        rows[ix][15],                                         // Instance
                        rows[ix][16],                                         // SID
                        Comm.RTComm.getActiveTxnState(rows[ix][17]),          // State
                        bind,                                                 // Bind_List
                        rows[ix][18],                                         // SQLID 1
                        rows[ix][19],                                         // SQL_Text_1
                        rows[ix][20],                                         // SQLID 2
                        rows[ix][21],                                         // SQL_Text_2
                        rows[ix][28],                                         // SQL Execute Count
                        rows[ix][29],                                         // Fetch_Count
                        rows[ix][30],                                         // Prepare_Count
                        '',                                                   // pga usage (mb)
                        rows[ix][33],                                         // Logical_Reads
                        rows[ix][34],                                         // Physical_Reads
                        rows[ix][35],                                         // Wait_Info
                        0,                                                    // Moved
                        dest,                                                 // Dest
                        guid                                                  // guid
                    ]
                );
            }

            if (rows[ix][42] == compare) {
                rows[ix][42] = type;

                bind = '';
                if (rows[ix][55] !== '') {
                    temp = common.Util.convertBindList(rows[ix][55]);
                    for (var jx = 0; jx < temp.length; jx++) {
                        if (jx === 0) {
                            bind += ',';
                        }
                        bind += temp[jx].value;
                    }
                }

                if (parseInt(rows[ix][43]) === 0 &&
                    parseInt(rows[ix][44]) === 0 &&
                    parseInt(rows[ix][45]) === 0 &&
                    parseInt(rows[ix][46]) === 0 &&
                    parseInt(rows[ix][47]) === 0 &&
                    parseInt(rows[ix][48]) === 0) {
                    continue;
                }

                this.tree.addNode(
                    null,
                    [
                        rows[ix][5],                                          // TXN_Name
                        rows[ix][42],                                         // Remote_Type
                        rows[ix][3],                                          // TID
                        rows[ix][43],                                         // Key1
                        rows[ix][44],                                         // Key2
                        rows[ix][45],                                         // Key3
                        rows[ix][46],                                         // Key4
                        rows[ix][47],                                         // Key5
                        rows[ix][48],                                         // Key6
                        rows[ix][1],                                          // Was_ID
                        rows[ix][2],                                          // Was_Name
                        classMethod,                                          // Class_Method
                        common.Util.codeBitToMethodType(rows[ix][41]),        // Method_Type
                        common.Util.getDate(rows[ix][ 0]),                    // Time
                        rows[ix][6],                                          // Client_IP
                        common.Util.getDate(parseInt(rows[ix][7])),           // Start_Time
                        rows[ix][10] / 1000,                                  // CPU_Time
                        rows[ix][9] / 1000,                                   // Elapsed_Time
                        rows[ix][39],                                         // Login_Name
                        '',                                                   // Browser
                        (rows[ix][10] / 1000)+(rows[ix][11] / 1000),          // DB Time
                        rows[ix][11] / 1000,                                  // Wait_Time
                        rows[ix][13],                                         // Pool
                        rows[ix][15],                                         // Instance
                        rows[ix][16],                                         // SID
                        Comm.RTComm.getActiveTxnState(rows[ix][17]),          // State
                        bind,                                                 // Bind_List
                        rows[ix][18],                                         // SQLID 1
                        rows[ix][19],                                         // SQL_Text_1
                        rows[ix][20],                                         // SQLID 2
                        rows[ix][21],                                         // SQL_Text_2
                        rows[ix][28],                                         // SQL Execute Count
                        rows[ix][29],                                         // Fetch_Count
                        rows[ix][30],                                         // Prepare_Count
                        '',                                                   // pga usage (mb)
                        rows[ix][33],                                         // Logical_Reads
                        rows[ix][34],                                         // Physical_Reads
                        rows[ix][35],                                         // Wait_Info
                        0,                                                    // Moved
                        dest,                                                 // Dest
                        guid                                                  // guid
                    ]
                );

                /* //this.NODE[this.NODE.length] = N; */

                switch (type) {
                    case 'M' : this.MNODECount++;
                        break;
                    case 'C' : this.CNODECount++;
                        break;
                    default:
                        break;
                }
            }
        }

        if (!this.CNodeRunOnce) {
            this.CNodeRunOnce = true;
            this.Add_MCNode(rows, 'C');
        }

        if (type == 'C') {
            this.moveMNode();
        }

        ix  = null;
        compare = null;
        bind = null;
        temp = null;
    },

    moveMNode: function() {
        var ix = 0;
        var node = null;
        var temp = null;
        var count = this.MNODECount + this.CNODECount;

        for (ix = 0; ix < count; ix++) {
            temp = this.getNode();
            if (temp != null) {
                node = this.findNode(temp, this.tree._jsonData);
                if (node) {
                    this.tree.moveNode(temp, node);
                    temp.moved = 1;
                } else {
                    temp.moved = 1;
                }
            }
        }

        this.moveByGuid();

        try {
            this.tree.drawTree();
        } finally {
            ix = null;
            node = null;
            temp = null;
            count = null;
        }
    },

    getNode: function() {
        var node = this.tree._jsonData.childNodes;

        var searchNode = function(node) {
            var ix = 0;
            var result = null;
            try {
                for (ix = 0; ix < node.length; ix++) {
                    if (node[ix].remotetype != 'P') {
                        if (node[ix].childNodes.length > 0) {
                            result = searchNode(node[ix]);
                        } else {
                            if (node[ix].moved == 0) {
                                result = node[ix];
                                break;
                            }
                        }
                    }
                }
                ix = null;
                return result;
            } finally {
                result = null;
            }
        };

        return searchNode(node);
    },

    findNode: function(node, rootnode) {
        var searchNode = function(was, key1 , key2, key3, _rootnode) {
            var ix;
            var result = null;
            var data;
            var temp;
            var isOk;

            try {
                for (ix = 0; ix < _rootnode.childNodes.length; ix++) {
                    data = _rootnode.childNodes[ix];
                    if (data && data.wasid != undefined) {

                        // TP 일 경우에는 동일한 WAS ID인 경우에도 처리가 가능하게 한다.
                        if (Comm.wasInfoObj[+data.wasid] && Comm.wasInfoObj[+data.wasid].type === 'TP') {
                            isOk = true;
                        } else {
                            isOk = (was != data.wasid);
                        }

                        if (isOk && key1 == data.key4 && key3 == data.key6) {
                            temp = Math.abs(Number(data.key5) - Number(key2));

                            if (temp < realtime.RemoteDiff) {
                                result = _rootnode.childNodes[ix];
                                break;
                            }
                        } else {
                            if (_rootnode.childNodes[ix].childNodes.length > 0) {
                                result = searchNode(was, key1, key2, key3, _rootnode.childNodes[ix]);
                                if (result) {
                                    break;
                                }
                            }
                        }
                    }
                }
                return result;
            } finally {
                ix = null;
                data = null;
                temp = null;
                result = null;
            }
        };
        return searchNode(node.wasid, node.key1, node.key2, node.key3, rootnode);
    },

    moveByGuid: function() {
        var temp;
        var nodeGuidMap = {};
        var nodeList = this.tree._jsonData.childNodes;

        for (var ix = 0; ix < nodeList.length; ix++) {
            temp = nodeList[ix];

            if (!temp.guid) {
                continue;
            }

            if (nodeGuidMap[temp.guid] >= 0 && nodeGuidMap[temp.guid] < ix + 1) {
                this.tree.moveNode(temp, nodeList[nodeGuidMap[temp.guid]]);
                this.moveByGuid();
                break;

            } else {
                nodeGuidMap[temp.guid] = ix;
            }
        }
    },


    dataCheck: function() {
        // 패킷이 들어오지 않을 때, 화면을 지워주는 부분.
        var self = this;
        if (this.timerInc) {
            clearTimeout(this.timerInc);
        }
        this.timerInc = setTimeout(function() {
            try {
                if (self.timerCount == 2) {
                    if (self.activeRemoteRefreshCheck) {
                        self.tree.clearNodes();
                    }
                    self.timerCount = 0;
                }
                self.timerCount++;
                self.dataCheck();
            } finally {
                self = null;
            }
        }, self.intervalTime);
    },


    /**
     * 메인 트랜잭션 단위별로 행의 색상을 설정.
     */
    setRowColorByRootTxn: function() {
        this.tree.pnlExTree.getView().getRowClass = function(record, index) {

            if (!this.isUseRowColor) {
                return;
            }

            if (index === 0) {
                this.rowColorClass = '';
            }

            if (record.data.parentId === 'root') {
                if (this.rowColorClass === '') {
                    if (record.data.childNodes.length > 0) {
                        this.rowColorClass = 'rtm-remotetree-multi-row-color';
                    } else {
                        this.rowColorClass = 'rtm-remotetree-single-row-color';
                    }
                } else {
                    this.rowColorClass = '';
                }
            }

            return this.rowColorClass;
        }.bind(this);
    },


    /**
     * GUID 단위별로 행의 색상을 설정.
     */
    setRowColorByGUID: function() {
        this.tree.pnlExTree.getView().getRowClass = function(record, index) {

            if (!this.isUseRowColor) {
                return;
            }

            if (index === 0) {
                this.rowColorClass  = '';
                this.beforeRowClass = '';
                this.beforeGuid     = null;
            }

            if (record.data.guid === this.beforeGuid) {
                this.rowColorClass = this.beforeRowClass;

            } else {
                if (this.rowColorClass === '' || this.rowColorClass === 'rtm-remotetree-single-row-color') {
                    this.rowColorClass = 'rtm-remotetree-multi-row-color';
                } else {
                    this.rowColorClass = 'rtm-remotetree-single-row-color';
                }
                this.beforeRowClass = this.rowColorClass;
                this.beforeGuid = record.data.guid;
            }

            return this.rowColorClass;
        }.bind(this);
    }

});
