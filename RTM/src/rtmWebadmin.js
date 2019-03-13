Ext.define('rtm.src.rtmWebadmin', {
    extend : 'Exem.DockForm',
    title  : common.Util.CTR('wsadmin'),
    layout: 'fit',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function(me) {
            me.isClosedDockForm = true;

            me.stopRefreshData();

            me.gridProcStat.removeAll();
            me.gridSvcStat.removeAll();
            me.gridSvrInfo.removeAll();
            me.gridClientInfo.removeAll();
        }
    },

    sql: {
        st_p  : 'IMXRT_Web_Svr_Proc_Stat.sql',   // WebtoB 프로세스의 상태를 표시. server 프로세스별 상태.
        st_s  : 'IMXRT_Web_Svc_Stat.sql',        // 서비스별 상태.
        si    : 'IMXRT_Web_Svr_Info.sql',        // server 상태 정보. 웹서버 환경설정 파일에서 *SERVER 절에 선언한 서버들의 수행정보를 보여준다.
        ci    : 'IMXRT_Web_Client_Info.sql'      // 현재 클라이언트 정보.
    },

    initProperty: function() {
        this.monitorType  = 'WEB';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.autoRefreshCheck = true;

        this.intervalTime = 60;
    },


    init: function() {

        this.initProperty();

        this.initLayout();

        this.frameRefresh();
    },


    /**
     * 기본 레이아웃 구성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-topsql-base'
        });

        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 0 0 0'
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '2 10 0 0',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function(){
                        this.dockContainer.toggleExpand(this);
                    }, this);
                }
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : common.Util.CTR('wsadmin')
        });

        this.centerArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 10 10 10'
        });

        this.commandNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls    : 'rtm-list-condition',
            width  : 145,
            labelWidth: 65,
            margin : '0 5 0 10',
            fieldLabel: common.Util.TR('Command'),
            enableKeyEvents: false,
            editable: false,
            listeners: {
                scope: this,
                select: function() {
                    this.executeSQL();
                }
            }
        });

        this.executeIntervalCombo = Ext.create('Exem.AjaxComboBox',{
            cls    : 'rtm-list-condition',
            width  : 140,
            labelWidth: 75,
            margin : '0 5 0 5',
            fieldLabel: common.Util.TR('Interval (Sec)'),
            enableKeyEvents: false,
            editable: false,
            listeners: {
                scope: this,
                select: function() {
                    this.executeSQL();
                }
            }
        });

        this.autoRefreshBox = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Refresh'),
            name    : 'autoRefreshCheckbox',
            margin  : '0 20 0 10',
            cls     : 'rtm-checkbox-label',
            checked : true,
            listeners: {
                scope: this,
                change: function(checkbox, val) {
                    this.autoRefreshCheck = val;
                }
            }
        });

        this.topContentsArea.add([
            this.frameTitle, {xtype: 'tbfill'},
            this.commandNameCombo,
            this.executeIntervalCombo,
            this.autoRefreshBox,
            this.expendIcon
        ]);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.setComboBoxData();

        this.createGrid();

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },


    /**
     * 에러 레벨 콤보박스에 보여지는 데이터 설정
     */
    setComboBoxData: function() {
        var commandComboData = [
            {name: 'st -p',    value: 'st_p'  },
            {name: 'st -s',    value: 'st_s'  },
            {name: 'si',       value: 'si'    },
            {name: 'ci',       value: 'ci'    }
        ];

        this.commandNameCombo.setData(commandComboData);
        this.commandNameCombo.setSearchField( 'name' );

        var intervalComboData = [
            {name: 10,    value: 10  },
            {name: 30,    value: 30  },
            {name: 60,    value: 60  }
        ];

        this.executeIntervalCombo.setData(intervalComboData);
        this.executeIntervalCombo.setSearchField('name');
    },


    /**
     * 그리드 생성
     */
    createGrid: function() {

        // WEB_SVR_PROC_Stat (st -p)
        this.gridProcStat = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            hidden        : false,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title
        });

        // st -p 명령어 컬럼
        this.gridProcStat.beginAddColumns();
        this.gridProcStat.addColumn('time',         'time'        , 100, Grid.DateTime     , true,  false);
        this.gridProcStat.addColumn('agentid',      'agentid'     , 110, Grid.Number       , false, true);
        this.gridProcStat.addColumn('agent',        'agent'       , 110, Grid.String       , true,  false);
        this.gridProcStat.addColumn('svr_name',     'svr_name'    ,  80, Grid.String       , true,  false);
        this.gridProcStat.addColumn('svgname',      'svgname'     ,  80, Grid.String       , true,  false);
        this.gridProcStat.addColumn('spr_no',       'spr_no'      ,  80, Grid.StringNumber , true,  false);
        this.gridProcStat.addColumn('pid',          'pid'         ,  80, Grid.StringNumber , true,  false);
        this.gridProcStat.addColumn('status',       'status'      ,  80, Grid.String       , true,  false);
        this.gridProcStat.addColumn('reqs',         'reqs'        ,  80, Grid.Number       , false, true);
        this.gridProcStat.addColumn('count',        'count'       ,  80, Grid.Number       , true,  false);
        this.gridProcStat.addColumn('count(sigma)', 'sigma_count' ,  90, Grid.Number       , true,  false);
        this.gridProcStat.addColumn('avg',          'avg'         ,  80, Grid.Float        , true,  false);
        this.gridProcStat.addColumn('rt',           'rt'          ,  80, Grid.Number       , true,  false);
        this.gridProcStat.addColumn('clid',         'clid'        ,  80, Grid.StringNumber , true,  false);
        this.gridProcStat.addColumn('svc',          'svc'         ,  80, Grid.String       , true,  false);
        this.gridProcStat.endAddColumns();

        // WEB_SVC_Stat (st -s)
         this.gridSvcStat = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            hidden        : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title
        });

        // st -s 명령어 컬럼
        this.gridSvcStat.beginAddColumns();
        this.gridSvcStat.addColumn('time',          'time'         ,   100, Grid.DateTime, true,  false);
        this.gridSvcStat.addColumn('agentid',       'agentid'      ,   110, Grid.Number  , false, true);
        this.gridSvcStat.addColumn('agent',         'agent'        ,   110, Grid.String  , true,  false);
        this.gridSvcStat.addColumn('svc_name',      'svc_name'     ,    80, Grid.String  , true,  false);
        this.gridSvcStat.addColumn('count',         'count'        ,    80, Grid.Number  , true,  false);
        this.gridSvcStat.addColumn('count(sigma)',  'sigma_count'  ,    90, Grid.Number  , true,  false);
        this.gridSvcStat.addColumn('avg',           'avg'          ,    80, Grid.Float   , true,  false);
        this.gridSvcStat.addColumn('cq_count',      'cq_count'     ,    80, Grid.Number  , true,  false);
        this.gridSvcStat.addColumn('ap_count',      'ap_count'     ,    80, Grid.Number  , true,  false);
        this.gridSvcStat.addColumn('q_avg',         'q_avg'        ,    80, Grid.Float   , true,  false);
        this.gridSvcStat.addColumn('status',        'status'       ,    80, Grid.String  , true,  false);
        this.gridSvcStat.endAddColumns();

        // WEB_SVR_Info (si)
         this.gridSvrInfo = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            hidden        : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title
        });

        // si 명령어 컬럼
        this.gridSvrInfo.beginAddColumns();
        this.gridSvrInfo.addColumn('time',          'time'          , 100, Grid.DateTime        , true,  false);
        this.gridSvrInfo.addColumn('agentid',       'agentid'       , 110, Grid.Number          , false, true);
        this.gridSvrInfo.addColumn('agent',         'agent'         , 110, Grid.String          , true,  false);
        this.gridSvrInfo.addColumn('hth',           'hth'           ,  80, Grid.Number          , true,  false);
        this.gridSvrInfo.addColumn('svrname',       'svrname'       ,  80, Grid.String          , true,  false);
        this.gridSvrInfo.addColumn('svri',          'svri'          ,  80, Grid.StringNumber    , true,  false);
        this.gridSvrInfo.addColumn('status',        'status'        ,  80, Grid.String          , true,  false);
        this.gridSvrInfo.addColumn('reqs',          'reqs'          ,  80, Grid.Number          , false, true);
        this.gridSvrInfo.addColumn('count',         'count'         ,  80, Grid.Number          , true,  false);
        this.gridSvrInfo.addColumn('count(sigma)',  'sigma_count'   ,  90, Grid.Number          , true,  false);
        this.gridSvrInfo.addColumn('cqcnt',         'cqcnt'         ,  80, Grid.Number          , true,  false);
        this.gridSvrInfo.addColumn('aqcnt',         'aqcnt'         ,  80, Grid.Number          , true,  false);
        this.gridSvrInfo.addColumn('qpcnt',         'qpcnt'         ,  80, Grid.Number          , true,  false);
        this.gridSvrInfo.addColumn('emcnt',         'emcnt'         ,  80, Grid.Number          , true,  false);
        this.gridSvrInfo.addColumn('rscnt',         'rscnt'         ,  80, Grid.Number          , true,  false);
        this.gridSvrInfo.addColumn('rbcnt',         'rbcnt'         ,  80, Grid.Number          , true,  false);
        this.gridSvrInfo.endAddColumns();

        // WEB_Client Info (ci)
         this.gridClientInfo = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            hidden        : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title
        });

        // ci 명령어 컬럼
        this.gridClientInfo.beginAddColumns();
        this.gridClientInfo.addColumn('time',               'time'               , 100, Grid.DateTime      , true,  false);
        this.gridClientInfo.addColumn('agentid',            'agentid'            , 110, Grid.Number        , false, true);
        this.gridClientInfo.addColumn('agent',              'agent'              , 110, Grid.String        , true,  false);
        this.gridClientInfo.addColumn('no',                 'no'                 ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('status',             'status'             ,  80, Grid.String        , true,  false);
        this.gridClientInfo.addColumn('count',              'count'              ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('idle',               'idle'               ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('local_ipaddr:port',  'local_ipaddr_port'  , 120, Grid.String        , true,  false);
        this.gridClientInfo.addColumn('remote_ipaddr:port', 'remote_ipaddr_port' , 130, Grid.String        , true,  false);
        this.gridClientInfo.addColumn('spir',               'spri'               ,  90, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('user',               'user'               ,  90, Grid.String        , true,  false);
        this.gridClientInfo.addColumn('HTH',                'hth'                ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('RDY',                'rdy'                ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('QED',                'qed'                ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('RUN',                'run'                ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('ETC',                'etc'                ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.addColumn('total',              'total'              ,  80, Grid.Number        , true,  false);
        this.gridClientInfo.endAddColumns();

        this.centerArea.add(this.gridProcStat, this.gridSvcStat, this.gridSvrInfo, this.gridClientInfo);

        this.gridProcStat.drawGrid();
    },


    /**
     * 데이터 새로고침을 중지.
     */
    stopRefreshData: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },


    /**
     * Webadmin 데이터 로드
     * 데이터 새로 고침 간격은 설정된 간격으로 실행한다.
     */
    frameRefresh: function() {
        this.stopRefreshData();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp && this.autoRefreshCheck) {
            this.executeSQL();
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 1000 * this.intervalTime);
    },


    /**
     * 쿼리 실행
     */
    executeSQL: function() {

        var lastTime = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if (Comm.RTComm.isValidDate(lastTime) !== true) {
            console.debug('%c [Webadmin] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            lastTime = new Date(this.beforeLastestTime);

        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        // 조회 대상이 되는 실행 명령어
        var commandValue = this.commandNameCombo.value;

        // 실행 명령어에 따라 실행되는 쿼리 설정.
        var sqlFile = this.sql[commandValue];

        // 조회 범위 설정 - 최근 시간에서 설정된 실행 간격의 전 데이터 조회
        this.intervalTime = this.executeIntervalCombo.value;

        var fromtime = Ext.Date.format(Ext.Date.subtract(lastTime, Ext.Date.SECOND, this.intervalTime), 'Y-m-d H:i:s.u');
        var totime   = Ext.Date.format(lastTime, 'Y-m-d H:i:s.u');

        var idArr;
        if (this.selectedServerIdArr.length <= 0) {
            idArr = -1;
        } else {
            idArr = this.selectedServerIdArr.join(',');
        }

        WS.SQLExec({
            sql_file: sqlFile,
            bind: [{ name: 'from_time', value: fromtime, type: SQLBindType.STRING },
                   { name: 'to_time',   value: totime,   type: SQLBindType.STRING }
            ],
            replace_string: [{
                name : 'ws_id',
                value:  idArr
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm) {
                return;
            }

            var isValid = common.Util.checkSQLExecValid(aheader, adata);

            if (isValid) {
                this.drawData(adata, aheader.command);
            }

        }, this);
    },


    /**
     * Webadmin 데이터 그리기
     *
     * @param {object} adata - 조회 데이터
     */
    drawData: function(adata, sqlCommand) {
        var data;
        var isChangeCmd = false;

        if (!this.displayGrid) {
            this.displayGrid = this.gridProcStat;
        }

        if (this.beforeSqlCommand !== sqlCommand) {
            isChangeCmd = true;
        }

        if (this.sql.st_p === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridProcStat;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('count', 'desc');  // st -p
            }

        } else if (this.sql.st_s === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridSvcStat;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('cq_count', 'desc');  // st -s
            }

        } else if (this.sql.si === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridSvrInfo;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('qcount', 'desc');  // si
            }

        } else if (this.sql.ci === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridClientInfo;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('run', 'desc');  // ci
            }
        }

        this.beforeSqlCommand = sqlCommand;

        if (this.displayGrid) {
            this.displayGrid.clearRows();

            for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                data = adata.rows[ix];
                this.displayGrid.addRow(data.concat());
            }

            this.displayGrid.drawGrid();
        }

        adata = null;
        data  = null;
    },


    /**
     * 모니터링 Web 서버 목록을 변경(선택)된 WAS 목록으로 재설정.
     * 화면에서 Web 서버 또는 그룹(Host, Business)을 선택하는 경우 호출.
     *
     * @param {string[]} serverList - 서버 명 배열
     */
    frameChange: function(serverNameList) {
        var serverIdArr = [];
        var idx, serverName;

        if (serverNameList) {
            for (var i = 0, icnt = serverNameList.length; i < icnt; ++i) {
                serverName = serverNameList[i];
                idx = this.serverNameArr.indexOf(serverName) ;

                if (idx === -1 ) {
                    continue;
                }
                serverIdArr[serverIdArr.length] = +this.serverIdArr[idx];
            }
        }

        if (serverIdArr.length <= 0) {
            serverIdArr = this.serverIdArr.concat();
        }

        this.selectedServerIdArr = serverIdArr;

        serverIdArr    = null;
        serverNameList = null;

        this.frameRefresh();
    }


});
