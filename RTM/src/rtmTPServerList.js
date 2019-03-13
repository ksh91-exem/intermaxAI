Ext.define('rtm.src.rtmTPServerList', {
    extend: 'Exem.XMWindow',
    layout: 'fit',
    maximizable: true,
    width: 900,
    height: 350,
    minWidth : 300,
    minHeight: 200,
    resizable: true,
    closeAction: 'destroy',
    cls      : 'xm-dock-window-base',
    padding: '5 0 0 5',

    listeners: {
        beforedestroy: function(me) {
            this.isWinClosed = true;

            me.grid.removeAll();
        }
    },

    sql: {
        st_p  : 'IMXRT_TP_Svr_Proc_Stat.sql',   // 프로세스 수
        st_v  : 'IMXRT_TP_Svr_Stat.sql',        // 큐잉 건수, 처리 건수
        st_s_x: 'IMXRT_TP_Svc_Stat.sql',        // 큐잉 시간 (응답시간, 큐잉시간, aq 개수, 실패 건수, 에러 건수)
        ci    : 'IMXRT_TP_Client_Info.sql'      // 클라이언트 수
    },

    initProperty: function() {
        this.monitorType = 'TP';

        this.isWinClosed = false;
    },


    initWindow: function() {
        this.show();
        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });
        this.loadingMask.show(true);
    },


    init: function() {

        this.initProperty();

        this.initLayout();

        this.executeSQL();
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
            cls   : 'dockform'
        });

        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 0 0 0'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : Comm.RTComm.getTPStatNameById(this.statName)
        });

        this.centerArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 5 5 5'
        });

        this.limitCombo = Ext.create('Exem.AjaxComboBox',{
            cls    : 'rtm-list-condition',
            width  : 125,
            labelWidth: 65,
            margin : '0 5 0 10',
            fieldLabel: common.Util.TR('Top'),
            enableKeyEvents: false,
            editable: false,
            listeners: {
                scope: this,
                select: function() {
                    this.executeSQL();
                }
            }
        });


        this.topContentsArea.add([
            this.frameTitle, {xtype: 'tbfill'}, this.limitCombo
        ]);

        var limitComboData = [
            { name: 50,  value: 50  },
            { name: 100, value: 100 },
            { name: 200, value: 200 },
            { name: 'ALL', value: 'ALL' }
        ];

        this.limitCombo.setData(limitComboData);
        this.limitCombo.setSearchField('name');

        this.createGrid();

        this.background.add(this.topContentsArea, this.centerArea);
        this.add(this.background);

        if (this.statName === 'TP_TPS' || this.statName === 'QCOUNT' || this.statName === 'Q_AVERAGE' ||
            this.statName === 'FAIL_COUNT' || this.statName === 'AQ_COUNT' || this.statName === 'COUNT') {
            this.setTitle('TP ' + common.Util.TR('Server Info'));

        } else if (this.statName === 'AVERAGE') {
            this.setTitle('TP ' + common.Util.TR('Service Info'));

        } else if (this.statName === 'CONNECTED_CLIENTS') {
            this.setTitle('TP ' + common.Util.TR('Concurrent Info'));

        } else if (this.statName === 'TOTAL_COUNT') {
            this.setTitle('TP ' + common.Util.TR('Process Info'));
        }

        this.loadingMask.hide();
    },


    /**
     * 그리드 생성
     */
    createGrid: function() {

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
            exportFileName: this.statName,
            onSortChange: function(ct, column) {
                this.executeSQL(column);
            }.bind(this)
        });

        this.grid.beginAddColumns();

        if (this.statName === 'TP_TPS' || this.statName === 'QCOUNT' || this.statName === 'Q_AVERAGE' || this.statName === 'COUNT') {
            // SVR_Stat (st -v)
            this.grid.addColumn('time',          'time'        , 100, Grid.DateTime, true,  false);
            this.grid.addColumn('agent',         'was_name'    , 100, Grid.String  , true,  false);
            this.grid.addColumn('clhno',         'clhno'       ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('svrname',       'svrname'     ,  80, Grid.String  , true,  false);
            this.grid.addColumn('status',        'status'      ,  80, Grid.String  , true,  false);
            this.grid.addColumn('svri',          'svri'        ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('count',         'count'       ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('qcount',        'qcount'      ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('emcount',       'emcount'     ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('qpcount',       'qpcount'     ,  80, Grid.Number  , false, false);

        } else if (this.statName === 'AVERAGE' || this.statName === 'AQ_COUNT') {
            // SVC_Stat (st -s -x)
            this.grid.addColumn('time',          'time'        , 100, Grid.DateTime, true,  false);
            this.grid.addColumn('agent',         'was_name'    , 100, Grid.String  , true,  false);
            this.grid.addColumn('clhno',         'clhno'       ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('svcname',       'name'        ,  80, Grid.String  , true,  false);
            this.grid.addColumn('count',         'count'       ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('cq_count',      'cq_count'    ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('aq_count',      'aq_count'    ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('average',       'average'     ,  80, Grid.Float   , true,  false);
            this.grid.addColumn('q_average',     'q_average'   ,  80, Grid.Float   , true,  false);
            this.grid.addColumn('no',            'no'          ,  80, Grid.Number  , false, false);
            this.grid.addColumn('status',        'status'      ,  80, Grid.String  , false, false);
            this.grid.addColumn('usravg',        'usravg'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('usrmin',        'usrmin'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('usrmax',        'usrmax'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('sysavg',        'sysavg'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('sysmin',        'sysmin'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('sysmax',        'sysmax'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('fail_count',    'fail_count'  ,  80, Grid.Number  , false, false);
            this.grid.addColumn('error_count',   'error_count' ,  80, Grid.Number  , false, false);
            this.grid.addColumn('mintime',       'mintime'     ,  80, Grid.Float   , false, false);
            this.grid.addColumn('maxtime',       'maxtime'     ,  80, Grid.Float   , false, false);

        } else if (this.statName === 'FAIL_COUNT') {
            // SVC_Stat (st -s -x)
            this.grid.addColumn('time',          'time'        , 100, Grid.DateTime, true,  false);
            this.grid.addColumn('agent',         'was_name'    , 100, Grid.String  , true,  false);
            this.grid.addColumn('clhno',         'clhno'       ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('svcname',       'name'        ,  80, Grid.String  , true,  false);
            this.grid.addColumn('count',         'count'       ,  80, Grid.Number  , false,  false);
            this.grid.addColumn('cq_count',      'cq_count'    ,  80, Grid.Number  , false,  false);
            this.grid.addColumn('aq_count',      'aq_count'    ,  80, Grid.Number  , false,  false);
            this.grid.addColumn('average',       'average'     ,  80, Grid.Float   , false,  false);
            this.grid.addColumn('q_average',     'q_average'   ,  80, Grid.Float   , false,  false);
            this.grid.addColumn('no',            'no'          ,  80, Grid.Number  , false, false);
            this.grid.addColumn('status',        'status'      ,  80, Grid.String  , false, false);
            this.grid.addColumn('usravg',        'usravg'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('usrmin',        'usrmin'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('usrmax',        'usrmax'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('sysavg',        'sysavg'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('sysmin',        'sysmin'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('sysmax',        'sysmax'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn('fail_count',    'fail_count'  ,  80, Grid.Number  , true, false);
            this.grid.addColumn('error_count',   'error_count' ,  80, Grid.Number  , true, false);
            this.grid.addColumn('mintime',       'mintime'     ,  80, Grid.Float   , false, false);
            this.grid.addColumn('maxtime',       'maxtime'     ,  80, Grid.Float   , false, false);

        } else if (this.statName === 'CONNECTED_CLIENTS') {
            this.grid.addColumn('time',       'time'        , 100, Grid.DateTime, true,  false);
            this.grid.addColumn('agent',      'was_name'    , 110, Grid.String  , true,  false);
            this.grid.addColumn('cli_id',     'cli_id'      ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('clid',       'clid'        ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('status',     'status'      ,  80, Grid.String  , true,  false);
            this.grid.addColumn('count',      'count'       ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('idle',       'idle'        ,  80, Grid.Number  , true,  false);
            this.grid.addColumn('ipaddr',     'ipaddr'      , 110, Grid.String  , true,  false);
            this.grid.addColumn('usrname',    'usrname'     ,  80, Grid.String  , true,  false);

        } else if (this.statName === 'TOTAL_COUNT') {
            this.grid.addColumn('time',          'time'        , 100, Grid.DateTime     , true,  false);
            this.grid.addColumn('agent',         'was_name'    , 110, Grid.String       , true,  false);
            this.grid.addColumn('clhno',         'clhno'       ,  80, Grid.Number       , true,  false);
            this.grid.addColumn('svrname',       'svrname'     , 120, Grid.String       , true,  false);
            this.grid.addColumn('pid',           'pid'         ,  80, Grid.StringNumber , true,  false);
            this.grid.addColumn('status',        'status'      ,  80, Grid.String       , true,  false);
            this.grid.addColumn('count',         'count'       ,  80, Grid.Number       , true,  false);
            this.grid.addColumn('average',       'average'     ,  80, Grid.Float        , true,  false);
            this.grid.addColumn('no',            'no'          ,  80, Grid.Number       , false, false);
            this.grid.addColumn('svgname',       'svgname'     ,  80, Grid.String       , false, false);
            this.grid.addColumn('gid1',          'gid1'        ,  80, Grid.Number       , false, false);
            this.grid.addColumn('gid2',          'gid2'        ,  80, Grid.Number       , false, false);
            this.grid.addColumn('gid_seqno',     'gid_seqno'   ,  80, Grid.Number       , false, false);
            this.grid.addColumn('svcname',       'service'     , 100, Grid.String       , false, false);
            this.grid.addColumn('fail_cnt',      'fail_cnt'    ,  80, Grid.Number       , false, false);
            this.grid.addColumn('err_cnt',       'err_cnt'     ,  80, Grid.Number       , false, false);
            this.grid.addColumn('usravg',        'usravg'      ,  80, Grid.Float        , false, false);
            this.grid.addColumn('usrmin',        'usrmin'      ,  80, Grid.Float        , false, false);
            this.grid.addColumn('usrmax',        'usrmax'      ,  80, Grid.Float        , false, false);
            this.grid.addColumn('sysavg',        'sysavg'      ,  80, Grid.Float        , false, false);
            this.grid.addColumn('sysmin',        'sysmin'      ,  80, Grid.Float        , false, false);
            this.grid.addColumn('sysmax',        'sysmax'      ,  80, Grid.Float        , false, false);
            this.grid.addColumn('mintime',       'mintime'     ,  80, Grid.Float        , false, false);
            this.grid.addColumn('maxtime',       'maxtime'     ,  80, Grid.Float        , false, false);
        }

        if (this.statName === 'TP_TPS' || this.statName === 'CONNECTED_CLIENTS' || this.statName === 'COUNT') {
            this.grid.setOrderAct('count', 'desc');

        } else if (this.statName === 'QCOUNT') {
            this.grid.setOrderAct('qcount', 'desc');

        } else if (this.statName === 'AVERAGE' || this.statName === 'TOTAL_COUNT') {
            this.grid.setOrderAct('average', 'desc');

        } else if (this.statName === 'FAIL_COUNT') {
            this.grid.setOrderAct('fail_count', 'desc');

        } else if (this.statName === 'AQ_COUNT') {
            this.grid.setOrderAct('aq_count', 'desc');

        } else if (this.statName === 'Q_AVERAGE') {
            this.grid.setOrderAct('q_average', 'desc');
        }

        this.grid.endAddColumns();

        this.centerArea.add(this.grid);

        this.grid.drawGrid();

    },


    /**
     * 쿼리 실행
     */
    executeSQL: function(column) {

        // 실행 명령어에 따라 실행되는 쿼리 설정.
        var sqlFile, fromtime, totime, limitString, orderByStr, limitValue;

        if (this.statName === 'TP_TPS' || this.statName === 'QCOUNT' || this.statName === 'Q_AVERAGE' || this.statName === 'COUNT') {
            sqlFile = this.sql.st_v;

        } else if (this.statName === 'AVERAGE' || this.statName === 'FAIL_COUNT' || this.statName === 'AQ_COUNT') {
            sqlFile = this.sql.st_s_x;

        } else if (this.statName === 'CONNECTED_CLIENTS') {
            sqlFile = this.sql.ci;

        } else if (this.statName === 'TOTAL_COUNT') {
            sqlFile = this.sql.st_p;
        }

        fromtime   = Ext.Date.format(Ext.Date.subtract(new Date(this.retrieveTime), Ext.Date.SECOND, 5), 'Y-m-d H:i:s.u');
        totime     = Ext.Date.format(Ext.Date.add(new Date(this.retrieveTime), Ext.Date.SECOND, 5), 'Y-m-d H:i:s.u');
        limitValue = this.limitCombo.getValue();

        if (this.limitCombo.getValue() === 'ALL') {
            limitString = '';
        } else {
            if (Comm.currentRepositoryInfo.database_type == 'PostgreSQL') {
                limitString = 'limit ' + limitValue;
            } else if ( Comm.currentRepositoryInfo.database_type == 'MSSQL' ) {
                limitString = 'top ' + limitValue;
            } else {
                limitString = 'AND ROWNUM <= ' + limitValue;
            }
        }

        if (column && column.dataIndex) {
            orderByStr = 'order by ' + column.dataIndex + ' ' + column.sortState;
        } else {
            orderByStr = '';
        }

        var idArr = Comm.selectedTpArr.join(',');

        WS.SQLExec({
            sql_file: sqlFile,
            bind: [
                { name: 'from_time', value: fromtime, type: SQLBindType.STRING },
                { name: 'to_time',   value: totime,   type: SQLBindType.STRING }
            ],
            replace_string: [{
                name : 'was_id',
                value:  idArr
            }, {
                name : 'limit',
                value: limitString
            }, {
                name : 'orderByStr',
                value : orderByStr
            }]
        }, function(aheader, adata) {
            if (this.isWinClosed) {
                return;
            }

            var isValid = common.Util.checkSQLExecValid(aheader, adata);

            if (isValid) {
                this.drawData(adata);
            }

        }, this);
    },


    /**
     * TP Server 데이터 그리기
     *
     * @param {object} adata - 조회 데이터
     */
    drawData: function(adata) {
        var data, ix, ixLen;

        this.grid.clearRows();

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            data = adata.rows[ix];
            this.grid.addRow(data.concat());
        }

        this.grid.drawGrid();

        adata = null;
        data  = null;
    }


});
