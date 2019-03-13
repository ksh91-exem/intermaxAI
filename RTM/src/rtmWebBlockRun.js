Ext.define('rtm.src.rtmWebBlockRun', {
    extend : 'Exem.DockForm',
    title  : common.Util.CTR('BlockRun'),
    layout: 'fit',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function(me) {
            me.isClosedDockForm = true;

            me.stopRefreshData();

            me.grid.removeAll();
        }
    },

    sql: {
        // wsadmin(st -p) : WebtoB 프로세스의 상태를 표시한다. 주로 JEUS-WebtoB간 연동 상태를 확인할 때 사용.
        st_p  : 'IMXRT_Web_BlockRun.sql'
    },

    initProperty: function() {
        this.monitorType  = 'WEB';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.monitorType);
        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.intervalTime = 10;
    },


    /*
     * [스펙 사항 #1]
     * BlockRun 화면은 Webserver가 WebToB 일 경우에만 표시되는 것이 스펙이므로
     * 메뉴 화면에서 WebToB 인지 체크해서 BlockRun 메뉴를 표시/숨김 처리한다.
     *
     * [스펙 사항 #2]
     * BlockRun 데이터는 WebToB 콘솔 관리자 (Wsadmin)에서 st -p 명령어로 확인 시
     * html 서버의 Status가 BRUN 상태인 데이터.
     * BRUN((BlockRun): 서비스 지연 현상
     */

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
            text   : common.Util.CTR('BlockRun')
        });

        this.centerArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 10 10 10'
        });

        this.topContentsArea.add([
            this.frameTitle, {xtype: 'tbfill'},
            this.expendIcon
        ]);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.createGrid();

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },


    /**
     * 그리드 생성
     */
    createGrid: function() {

        // st -p (WebtoB 프로세스의 상태를 표시)
        this.grid = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title
        });

        // Webadmin 컬럼명은 한글로 변경하지 않고 영문 그대로 표시되도록 설정.
        this.grid.beginAddColumns();
        this.grid.addColumn('time',          'time'        , 100, Grid.DateTime     , true,  false);
        this.grid.addColumn('agent',         'agent'       , 110, Grid.String       , true,  false);
        this.grid.addColumn('svr_name',      'svrname'     , 120, Grid.String       , true,  false);
        this.grid.addColumn('svgname',       'svgname'     ,  80, Grid.String       , true,  false);
        this.grid.addColumn('spr_no',        'spr_no'      ,  80, Grid.Number       , true,  false);
        this.grid.addColumn('pid',           'pid'         ,  80, Grid.Number       , true,  false);
        this.grid.addColumn('status',        'status'      ,  80, Grid.String       , true,  false);
        this.grid.addColumn('count',         'count'       ,  80, Grid.Number       , true,  false);
        this.grid.addColumn('avg(rt)',       'average'     ,  80, Grid.Float        , true,  false);
        this.grid.addColumn('clid',          'clid'        ,  80, Grid.Number       , true,  false);
        this.grid.addColumn('svc',           'svc'         ,  80, Grid.String       , true,  false);
        this.grid.addColumn('wsid',          'wsid'         ,  40, Grid.Number      , false, true );

        this.grid.endAddColumns();

        this.centerArea.add(this.grid);
        this.grid.drawGrid();
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
     * Webadmin (st -p) 데이터 로드
     * 데이터 새로 고침 간격은 설정된 간격으로 실행한다.
     * 새로고침 간격: 10초
     */
    frameRefresh: function() {
        this.stopRefreshData();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp) {
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
            console.debug('%c [BlockRun] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            lastTime = new Date(this.beforeLastestTime);

        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        var sqlFile = this.sql.st_p;

        var fromtime = Ext.Date.format(Ext.Date.subtract(lastTime, Ext.Date.SECOND, this.intervalTime), 'Y-m-d H:i:s.u');
        var totime   = Ext.Date.format(lastTime, 'Y-m-d H:i:s.u');
        var wsIdArr  = this.selectedServerIdArr.join(',');

        WS.SQLExec({
            sql_file: sqlFile,
            bind: [{ name: 'from_time', value: fromtime, type: SQLBindType.STRING },
                   { name: 'to_time',   value: totime,   type: SQLBindType.STRING }
            ],
            replace_string: [{
                name  : 'ws_id',
                value :  wsIdArr
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm) {
                return;
            }

            var isValid = common.Util.checkSQLExecValid(aheader, adata);

            if (isValid) {
                this.drawData(adata);
            }

        }, this);
    },


    /**
     * BRUN 데이터 그리기
     *
     * @param {object} adata - 조회 데이터
     */
    drawData: function(adata) {
        var data;

        this.grid.clearRows();

        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            data = adata.rows[ix];
            this.grid.addRow([
                data[0],       // time
                data[2],       // agent
                data[3],       // svr_name
                data[4],       // svcname
                data[5],       // spr_no
                data[6],       // pid
                data[7],       // status
                data[8],       // count
                data[9],       // average
                data[11],      // clid
                data[12],      // svc
                data[1]        // ws_id
            ]);
        }

        this.grid.drawGrid();

        adata = null;
        data  = null;
    }


});
