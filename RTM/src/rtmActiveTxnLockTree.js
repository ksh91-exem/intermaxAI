Ext.define('rtm.src.rtmActiveTxnLockTree', {
    extend: 'rtm.src.rtmActiveTxn',
    title: common.Util.CTR('Lock Tree'),
    layout: 'fit',

    timerCount: 0,
    timerRunOnce: false,
    timerInc: null,
    refreshTimer: null,

    sqlFullText: null,
    txnDetail: null,

    //화면이 최소화인 경우 보여지는 컬럼 인덱스
    minViewVisibleDataIndex : [
        'sid', 'instance', 'holdlocktype', 'waitlocktype', 'waitobjectid',
        'sqltext1', 'waitinfo', 'wasname', 'transaction', 'state', 'elapsedtime',
        'starttime', 'dbtime', 'waittime', 'clientip', 'pool', 'logicalreads', 'physicalreads', 'pgausage'],

    tempsid: [],
    tempdata: [],

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.LOCKINFO, me);

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

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.isOpenByRTM = Comm.rtmShow;

        this.checkDisplayComponent();

        this.tempsid  = [];
        this.tempdata = [];
        this.typeArr  = ['None', 'Null', 'SS', 'SX', 'Share', 'SSX', 'Exclusive'];

        this.activeLockRefreshCheck = true;

        this.frameTitle.setText(common.Util.CTR('Lock Tree'));

        this.addCls('rtm-txnlocktree-base');

        this.createGrid();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.LOCKINFO, this);
    },


    /**
     * Tree Grid 화면 생성.
     */
    createGrid: function() {
        var self = this;

        var gridName = 'intermax_locktree';

        this.tree = Ext.create('Exem.BaseGrid', {
            gridName      : gridName,
            width         : '100%',
            height        : '100%',
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            gridType      : Grid.exTree,
            localeType    : 'H:i:s',
            borderVisible : true,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            useFindOn     : false,
            columnmove    : function() {
                this.saveLayout(self.grid.name);
            },
            celldblclick: function(thisGrid, td, cellIndex, record) {
                var temp = thisGrid.headerCt.getHeaderAtIndex(cellIndex);
                var sqlid;
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
                    default: sqlid = '';
                        break;
                }

                if (sqlid) {
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

                    if (Ext.isEmpty(record.data.tid) === true || Ext.isEmpty(record.data.wasid) === true) {
                        return;
                    }

                    self.txnDetail = Ext.create('rtm.src.rtmActiveTxnDetail');
                    self.txnDetail.stack_dump = false;
                    self.txnDetail.tid = record.data.tid;
                    self.txnDetail.wasid = record.data.wasid;
                    self.txnDetail.starttime = record.data.starttime;
                    self.txnDetail.current_time = record.data.time;

                    self.txnDetail.initWindow();
                    setTimeout(function() {
                        self.txnDetail.init(record.data);
                    },10);
                }
            }
        });

        this.tree.beginAddColumns();
        this.tree.addColumn(common.Util.CTR('SID'                ), 'sid'             , 100,  Grid.String,   true,  false, 'treecolumn' );
        this.tree.addColumn(common.Util.CTR('DB Instance'        ), 'instance'        , 130,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Hold Lock Type'     ), 'holdlocktype'    , 100,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Hold Mode'          ), 'holdmode'        , 100,  Grid.String,   false,  false);
        this.tree.addColumn(common.Util.CTR('Wait Lock Type'     ), 'waitlocktype'    , 100,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Request Mode'       ), 'requestmode'     , 100,  Grid.String,   false,  false);  // 5
        this.tree.addColumn(common.Util.CTR('Wait Object ID'     ), 'waitobjectid'    , 100,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('SQLID 1'            ), 'sqlid1'          , 100,  Grid.String,   false, true);
        this.tree.addColumn(common.Util.CTR('SQL 1'              ), 'sqltext1'        , 200,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('DB Wait Info'       ), 'waitinfo'        , 500,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Agent'              ), 'wasname'         , 130,  Grid.String,   true,  false);   // 10
        this.tree.addColumn(common.Util.CTR('Transaction'        ), 'transaction'     , 250,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Class Method'       ), 'classmethod'     , 300,  Grid.String,   false,  false);
        this.tree.addColumn(common.Util.CTR('State'              ), 'state'           , 150,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Elapse Time'        ), 'elapsedtime'     , 100,  Grid.Float,    true,  false);
        this.tree.addColumn(common.Util.CTR('Start Time'         ), 'starttime'       , 100,  Grid.DateTime, true,  false);   // 15
        this.tree.addColumn(common.Util.CTR('DB Time'            ), 'dbtime'          ,  80,  Grid.Float,    true,  false);
        this.tree.addColumn(common.Util.CTR('CPU Time'           ), 'cputime'         ,  80,  Grid.Float,    false,  false);
        this.tree.addColumn(common.Util.CTR('DB Wait Time'       ), 'waittime'        ,  80,  Grid.Float,    true,  false);
        this.tree.addColumn(common.Util.CTR('Client IP'          ), 'clientip'        , 120,  Grid.String,   true,  false);
        this.tree.addColumn(common.Util.CTR('Pool'               ), 'pool'            , 130,  Grid.String,   true,  false);   // 20
        this.tree.addColumn(common.Util.CTR('SQL Execution Count'), 'sqlexeccount'    , 130,  Grid.Number,   false,  false);
        this.tree.addColumn(common.Util.CTR('Fetch Count'        ), 'fetchcount'      , 100,  Grid.Number,   false,  false);
        this.tree.addColumn(common.Util.CTR('Prepare Count'      ), 'preparecount'    , 120,  Grid.Number,   false,  false);
        this.tree.addColumn(common.Util.CTR('SQLID 2'            ), 'sqlid2'          , 100,  Grid.String,   false, true);
        this.tree.addColumn(common.Util.CTR('SQL 2'              ), 'sql2'            , 200,  Grid.String,   false,  false);  // 25
        this.tree.addColumn(common.Util.CTR('Logical Reads'      ), 'logicalreads'    , 110,  Grid.Number,   true,  false);
        this.tree.addColumn(common.Util.CTR('Physical Reads'     ), 'physicalreads'   , 110,  Grid.Number,   true,  false);
        this.tree.addColumn(common.Util.CTR('PGA Usage (MB)'     ), 'pgausage'        , 100,  Grid.Float,    true,  false);
        this.tree.addColumn(common.Util.CTR('Login Name'         ), 'loginname'       , 100,  Grid.String,   false,  false);
        this.tree.addColumn(common.Util.CTR('Thread CPU'         ), 'threadcpu'       , 100,  Grid.String,   false,  false);  // 30
        this.tree.addColumn(common.Util.CTR('IO Read'            ), 'ioread'          , 100,  Grid.String,   true,  true);
        this.tree.addColumn(common.Util.CTR('IO Write'           ), 'iowrite'         , 100,  Grid.String,   true,  true);
        this.tree.addColumn(common.Util.CTR('Time'               ), 'time'            , 100,  Grid.DateTime, false, true);
        this.tree.addColumn(common.Util.CTR('TID'                ), 'tid'             , 100,  Grid.String,   false, true);
        this.tree.addColumn(common.Util.CTR('WASID'              ), 'wasid'           , 100,  Grid.String,   false, true);    // 35
        this.tree.endAddColumns();

        var clist = this.tree.pnlExTree.headerCt.getGridColumns();

        for (var ix = 0, ixLen = clist.length; ix < ixLen; ix++) {
            if (this.minViewVisibleDataIndex.indexOf(clist[ix].dataIndex) !== -1) {
                clist[ix].colvisible = true;
                clist[ix].setVisible(true);
            } else {
                clist[ix].colvisible = false;
                clist[ix].setVisible(false);
            }
        }
        clist  = null;

        var gridpanel = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            flex: 1,
            style: { background: '#ffffff' }
        });

        this.tree.loadLayout(gridName);

        try {
            gridpanel.add(this.tree);
            this.tabpanel.add(gridpanel);
        } finally {
            gridpanel = null;
        }
    },


    /**
     * DB SID 값에 해당하는 컬럼 데이터 값을 반환.
     */
    getColumnDataBySID: function(sid) {
        var temp = {};
        var data, txnData;
        var ix, ixLen, jx, jxLen;
        var bind, bindTemp, loginName, browser;

        try {
            txnData = Repository.ActiveTxn;

            for (ix = 0, ixLen = txnData.length; ix < ixLen; ix++) {
                data = txnData[ix];
                if (data[16] === sid) {
                    bind = '';
                    if (data[55] !== '') {
                        bindTemp = common.Util.convertBindList(data[55]);

                        for (jx = 0, jxLen = bindTemp.length; jx < jxLen; jx++) {
                            if (jx > 0) {
                                bind += ',';
                            }
                            bind += bindTemp[jx].value;
                        }
                    }
                    if (data[39] !== '') {
                        loginName = data[39].split(' ')[0];
                        browser   = data[39].split(' ')[1];
                    }
                    temp = {
                        time        : new Date(data[0]),
                        wasname     : data[2],
                        txnname     : data[5],
                        classmethod : data[54],
                        methodtype  : common.Util.codeBitToMethodType(data[41]),
                        state       : Comm.RTComm.getActiveTxnState(data[17]),
                        elapsedtime : data[9] / 1000,
                        starttime   : new Date(parseInt(data[7])),
                        dbtime      : (parseInt(data[10]) + parseInt(data[11]))/1000,
                        waittime    : parseInt(data[11])/1000,
                        cputime     : parseInt(data[10])/1000,
                        elapseratio : 0,
                        clientip    : data[6],
                        poolname    : data[13],
                        instancename: (Comm.dbInfoObj[data[14]] != null)? Comm.dbInfoObj[data[14]].instanceName : data[15],
                        sid         : data[16],
                        sqlid1      : Ext.isEmpty(data[19])? '':data[18],
                        sqltext1    : data[19],
                        bindlist    : bind,
                        sqlexeccount: data[28],
                        preparecount: data[30],
                        fetchcount  : data[29],
                        waitinfo    : data[35],
                        sqlid2      : Ext.isEmpty(data[21])? '':data[20],
                        sqltext2    : data[21],
                        sqlid3      : Ext.isEmpty(data[23])? '':data[22],
                        sqltext3    : data[23],
                        sqlid4      : Ext.isEmpty(data[25])? '':data[24],
                        sqltext4    : data[25],
                        sqlid5      : Ext.isEmpty(data[27])? '':data[26],
                        sqltext5    : data[27],
                        logicalreads: data[33],
                        physicalreads:data[34],
                        pgausage    : data[32],
                        loginname   : loginName,
                        browser     : browser,
                        threadcpu   : data[36],
                        oscode      : data[51],
                        bankcode    : data[52],
                        errorcode   : data[53],
                        tid         : data[3],
                        wasid       : data[1],
                        dest        : (data.length > 56)? data[56] : ''
                    };
                    break;
                }
            }
            return temp;
        } finally {
            temp    = null;
            txnData = null;
            data    = null;
        }
    },


    clear: function() {
        this.tree.clearNodes();
    },


    /**
     * Auto Refresh 설정
     *
     * @param {boolean} val - 체크박스 체크유무
     */
    changeAutoRefresh: function(val) {
        this.activeLockRefreshCheck = val;
    },

    dataCheck: function() {
        if (this.timerInc) {
            clearTimeout(this.timerInc);
        }

        this.checkDisplayComponent();

        if (this.timerCount === 2) {
            if (this.activeLockRefreshCheck && this.isDisplayComponent) {
                this.tree.clearNodes();
            }
            this.timerCount = 0;
        }
        this.timerCount++;

        this.timerInc = setTimeout(this.dataCheck.bind(this), 3000);
    },


    /**
     * Component 화면의 표시 여부
     */
    checkDisplayComponent: function() {
        if (Comm.rtmShow) {
            this.isOpenByRTM = true;
        }
        if ((Comm.rtmShow && this.isOpenByRTM) || (!Comm.rtmShow && !this.isOpenByRTM)) {
            this.isDisplayComponent = true;
        } else {
            this.isDisplayComponent = false;
        }
    },


    /**
     * Lock Info 데이터 표시
     *
     * 0: Time
     * 1: DB_ID
     * 2: Wait_SID
     * 3: Lock_Type
     * 4: Req_Mode
     * 5: Object_ID
     * 6: Holder_DB_ID
     * 7: Holder_SID
     * 8: Holder_Lock_Type
     * 9: Hold_Mode
     */
    onData: function(adata) {
        if (adata === undefined || adata === null) {
            return;
        }

        if (this.activeLockRefreshCheck === false) {
            return;
        }

        if (!this.isDisplayComponent) {
            return;
        }

        var ix, ixlen, jx, len;
        var holder;
        var hi;  // HolderInfo
        var wi;  // WaiterInfo
        var hl = [];    // HolderList

        this.tree.clearNodes();
        this.tree.beginTreeUpdate();

        for (ix = 0, ixlen = adata.rows.length; ix < ixlen; ix++) {
            if (hl.indexOf(adata.rows[ix][7]) === -1) {
                hl[hl.length] = adata.rows[ix][7];
                hi = this.getColumnDataBySID(adata.rows[ix][7]);

                if (hi !== undefined && hi !== null) {
                    holder = this.tree.addNode(
                        null,
                        [
                            adata.rows[ix][7],               // Holder SID
                            hi.instancename,
                            adata.rows[ix][8],               // Hold Lock Type
                            this.typeArr[adata.rows[ix][9]], // Hold Mode
                            '--',                            // Wait Lock Type
                            '--',                            // Request Mode
                            0,                               // Wait Object ID
                            hi.sqlid1,
                            hi.sqltext1,
                            hi.waitinfo,
                            hi.wasname,
                            hi.txnname,
                            hi.classmethod,
                            hi.state,
                            hi.elapsedtime,
                            hi.starttime,
                            hi.dbtime,
                            hi.cputime,
                            hi.waittime,
                            hi.clientip,
                            hi.poolname,
                            hi.sqlexeccount,
                            hi.fetchcount,
                            hi.preparecount,
                            hi.sqlid2,
                            hi.sqltext2,
                            hi.logicalreads,
                            hi.physicalreads,
                            hi.pgausage,
                            hi.loginname,
                            hi.threadcpu,
                            0,
                            0,
                            hi.time,
                            hi.tid,
                            hi.wasid
                        ]
                    );

                    len = adata.rows.length;
                    for (jx = 0; jx < len; jx++) {
                        wi = this.getColumnDataBySID(adata.rows[jx][2]);

                        if (wi && holder.sid === adata.rows[jx][7]) {
                            this.tree.addNode(
                                holder,
                                [
                                    adata.rows[jx][2],               // Holder SID
                                    wi.instancename,
                                    '--',                            // Hold Lock Type
                                    '--',                            // Hold Mode
                                    adata.rows[jx][3],               // Wait Lock Type
                                    this.typeArr[adata.rows[jx][4]], // Request Mode
                                    adata.rows[jx][5],               // Wait Object ID
                                    wi.sqlid1,
                                    wi.sqltext1,
                                    wi.waitinfo,
                                    wi.wasname,
                                    wi.txnname,
                                    wi.classmethod,
                                    wi.state,
                                    wi.elapsedtime,
                                    wi.starttime,
                                    wi.dbtime,
                                    wi.cputime,
                                    wi.waittime,
                                    wi.clientip,
                                    wi.poolname,
                                    wi.sqlexeccount,
                                    wi.fetchcount,
                                    wi.preparecount,
                                    wi.sqlid2,
                                    wi.sqltext2,
                                    wi.logicalreads,
                                    wi.physicalreads,
                                    wi.pgausage,
                                    wi.loginname,
                                    wi.threadcpu,
                                    0,
                                    0,
                                    wi.time,
                                    wi.tid,
                                    wi.wasid
                                ]
                            );
                        }
                    }
                } else {
                    holder = this.tree.addNode(
                        null,
                        [
                            adata.rows[ix][7],                              // Holder SID
                            '--',                                           // Instance
                            adata.rows[ix][8],                              // Hold Lock Type
                            this.typeArr[adata.rows[ix][9]],                // Hold Mode
                            '--',                                           // Wait Lock Type
                            '--',                                           // Request Mode
                            0
                        ]
                    );

                    len = adata.rows.length;
                    for (jx = 0; jx < len; jx++) {
                        wi = this.getColumnDataBySID(adata.rows[jx][2]);
                        if (wi) {
                            if (holder.sid === adata.rows[jx][7]) {
                                this.tree.addNode(
                                    holder,
                                    [
                                        adata.rows[jx][2],                              // Holder SID
                                        wi.instancename,
                                        '--',                                           // Hold Lock Type
                                        '--',                                           // Hold Mode
                                        adata.rows[jx][3],                              // Wait Lock Type
                                        this.typeArr[adata.rows[jx][4]],                // Request Mode
                                        adata.rows[jx][5],                              // Wait Object ID
                                        wi.sqlid1,
                                        wi.sqltext1,
                                        wi.waitinfo,
                                        wi.wasname,
                                        wi.txnname,
                                        wi.classmethod,
                                        wi.state,
                                        wi.elapsedtime,
                                        wi.starttime,
                                        wi.dbtime,
                                        wi.cputime,
                                        wi.waittime,
                                        wi.clientip,
                                        wi.poolname,
                                        wi.sqlexeccount,
                                        wi.fetchcount,
                                        wi.preparecount,
                                        wi.sqlid2,
                                        wi.sqltext2,
                                        wi.logicalreads,
                                        wi.physicalreads,
                                        wi.pgausage,
                                        wi.loginname,
                                        wi.threadcpu,
                                        0,
                                        0,
                                        wi.time,
                                        wi.tid,
                                        wi.wasid
                                    ]
                                );
                            }
                        } else {
                            if (holder.sid === adata.rows[jx][7]) {
                                this.tree.addNode(
                                    holder,
                                    [
                                        adata.rows[jx][2],                              // Holder SID
                                        '--',                                           // Instance
                                        '--',                                           // Hold Lock Type
                                        '--',                                           // Hold Mode
                                        adata.rows[jx][3],                              // Wait Lock Type
                                        this.typeArr[adata.rows[jx][4]],                // Request Mode
                                        adata.rows[jx][5]                               // Wait Object ID
                                    ]
                                );
                            }
                        }
                    }
                }
            }
        }

        this.tree.drawTree();
        this.tree.endTreeUpdate();

        this.timerCount = 0;

        if (!this.timerRunOnce) {
            this.timerRunOnce = true;
            this.dataCheck();
        }

        len = null;
        holder = null;
        hi = null;
        wi = null;
        hl.length = 0;
        hl = null;

        adata = null;
    }

});
