Ext.define('Exem.wasTxnDetail', {
    extend: 'Exem.txnDetailBaseForm',
    layout: 'fit',
    height: '100%',
    width: '100%',

    addColumnTxnGrid: function() {
        this.txnDetailGrid.gridName = 'rtm_popup_txndetail_grid';

        this.txnDetailGrid.beginAddColumns();
        this.txnDetailGrid.addColumn(common.Util.CTR('Time'),                   'time'          , 115 ,  Grid.DateTime, true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Agent'),                  'was_name'      , 150,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Transaction'),            'txn_name'      , 250,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Start Time'),             'start_time'    , 115,  Grid.DateTime, true , false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Elapse Time'),            'txn_elapse'    , 90 ,  Grid.Float ,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Exception'),              'exception_type', 90 ,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Client IP'),              'client_ip'     , 110,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Transaction CPU TIME'),   'txn_cpu_time',   90,  Grid.Float,    true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Elapse Time'),        'sql_elapse'    , 120 , Grid.Float ,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Execution Count'),    'sql_exec_count', 120 , Grid.Number,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Fetch Count'),        'fetch_count'   , 120 , Grid.Number,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Fetch Time'),         'fetch_time'    , 100 , Grid.Float,    true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Remote Elapse Time'),     'remote_elapse' , 120 , Grid.Float ,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Remote Execution Count'), 'remote_count'  , 120 , Grid.Number,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Login Name'),             'login_name'    , 110,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Browser'),                'browser'       , 70 ,  Grid.String,   false, false);
        this.txnDetailGrid.addColumn('TID',                                     'tid'           , 155,  Grid.String,   false, false);
        this.txnDetailGrid.addColumn('WAS ID',                                  'was_id'        , 135,  Grid.Number,   false, false);
        this.txnDetailGrid.addColumn('RAW TIME',                                'raw_time'      , 135,  Grid.String,   false, true);
        this.txnDetailGrid.addColumn('TXN ID',                                  'txn_id'        , 135,  Grid.String,   false, true);
        this.txnDetailGrid.addColumn('SQL Elapse(AVG)',                         'sql_elapse_avg', 135,  Grid.Float ,   false, true);
        this.txnDetailGrid.addColumn('Exception Count',                         'EXCEPTION'     , 65 ,  Grid.Number,   false, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('FSID'),                   'fsid'          , 155,  Grid.String,   false, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('PCID'),                   'pcid'          , 155,  Grid.String,   false, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('GUID'),                   'guid'          , 155,  Grid.String,   false, false);
        ///this.txnDetailGrid.addColumn(common.Util.CTR('URL'),                   'url'           , 200, Grid.String, false, false);
        this.txnDetailGrid.endAddColumns();

        this.txnDetailGrid.setOrderAct('txn_elapse', 'DESC');
        this.txnDetailGrid.loadLayout(this.txnDetailGrid.gridName);

        this.txnDetailGrid.addRenderer('exception_type', this.exceptionRenderer , RendererType.bar);

    },

    executeSQL: function() {
        var dataSet = {};
        var clientIp, txnName, exception, loginName, tid, gid, pcid,
            fetchCnt, sqlElapseTime, sqlExecCnt, bizId = '';
        var parameter = JSON.parse(localStorage.getItem('InterMax_PopUp_Param') || null);

        this.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(false);
        this.txnDetailGrid.down('#grid_detail_list_fetch_all').setVisible(false);

        if (!parameter) {
            console.debug('txnDetail-executeSQL');
            console.debug('does not exist parameter');
            return;
        }

        clientIp = parameter.clientIp;
        if (clientIp !== '') {
            clientIp = 'AND client_ip LIKE \'' + clientIp + '\'';
        }


        var bizIdList = parameter.businessId || '';
        if (bizIdList !== '') {
            bizId = 'AND business_id in (' + bizIdList + ')';
        }

        txnName = parameter.txnName;
        if (txnName !== '') {
            txnName =   'AND  e.txn_id in (SELECT n.txn_id ' +
                'FROM   xapm_txn_name n left outer join  xapm_txn_name_ext e ON  n.business_name = e.txn_name ' +
                'WHERE  lower(n.business_name) LIKE lower(\'%' + txnName + '%\') OR lower(e.txn_name_ext) LIKE lower(\'%' + txnName + '%\') )';
        }

        exception = parameter.exception;
        if (exception !== '') {
            exception = 'AND exception > 0';
        }

        loginName = parameter.loginName;
        if (loginName !== '') {
            if (loginName === '%') {
                loginName = '';
            } else {
                loginName = 'AND lower(login_name) LIKE lower(\'' + loginName + '\') ';
            }
        }

        tid = parameter.tid || '';
        if (tid !== '') {
            tid = 'AND e.tid = ' + tid;
        }

        gid = parameter.gid || '';
        if (gid !== '') {
            gid = 'AND guid LIKE \'' + gid + '\'';
        }

        pcid = parameter.pcid || '';
        if (pcid !== '' && common.Menu.usePcidFilter) {
            pcid = 'AND c.data = \'' + pcid + '\'';
        }

        fetchCnt = parameter.fetchCnt || 0;
        sqlElapseTime = parameter.sqlElapseTime || 0;
        sqlExecCnt = parameter.sqlExecCnt || 0;

        dataSet.bind = [{
            name: 'fromTime',
            value: parameter.fromTime,
            type: SQLBindType.STRING
        }, {
            name: 'toTime',
            value: parameter.toTime,
            type: SQLBindType.STRING
        }, {
            name: 'minElapse',
            value: parameter.minElapse,
            type: SQLBindType.FLOAT
        }, {
            name: 'maxElapse',
            value: parameter.maxElapse,
            type: SQLBindType.FLOAT
        }, {
            name: 'sqlElapse',
            value: sqlElapseTime,
            type: SQLBindType.FLOAT
        }, {
            name: 'sqlExecCount',
            value: sqlExecCnt,
            type: SQLBindType.INTEGER
        }, {
            name: 'fetchCount',
            value: fetchCnt,
            type: SQLBindType.INTEGER
        }, {
            name: 'time_zone',
            value: new Date().getTimezoneOffset() * 1000 * 60 * -1,
            type: SQLBindType.INTEGER
        }];

        if (parameter.msFromTime && parameter.msToTime) {
            dataSet.sql_file = 'IMXRT_txnDetail_gridList_paging_ms.sql';
            dataSet.bind.push(
                {name : 'msFromTime', value : parameter.msFromTime, type : SQLBindType.STRING},
                {name : 'msToTime', value : parameter.msToTime, type : SQLBindType.STRING}
            );
        } else {
            dataSet.sql_file = 'IMXRT_txnDetail_gridList_paging.sql';
        }

        dataSet.replace_string = [{
            name: 'wasId',
            value: parameter.wasId
        }, {
            name: 'tid',
            value: tid
        }, {
            name: 'bankCode',
            value: ''
        }, {
            name: 'txnName',
            value: txnName
        }, {
            name: 'clientIp',
            value: clientIp
        }, {
            name: 'pcid',
            value: pcid
        }, {
            name: 'gid',
            value: gid
        }, {
            name: 'exception',
            value: exception
        }, {
            name: 'loginName',
            value: loginName
        }, {
            name: 'offset',
            value:  this.limitData
        }, {
            name: 'offset2',
            value:  (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
        }, {
            name: 'businessId',
            value:  bizId
        }];

        WS.SQLExec(dataSet, this.onGridData, this);

        this.txnDetailGrid.loadingMask.show(false, true);
    },


    addRowTxnGridData: function(gridData) {
        var ix, ixLen,
            exceptionType;

        for (ix = 0, ixLen = gridData.length; ix < ixLen; ix++) {
            exceptionType = this.exceptionTypeProc(gridData[ix][19], gridData[ix][5]);

            this.txnDetailGrid.addRow([
                gridData[ix][ 0]                           // 'time'
                ,gridData[ix][ 1]                          // 'was_name'
                ,gridData[ix][ 2]                          // 'txn_name'
                ,gridData[ix][ 3]                          // 'start_time'
                ,gridData[ix][ 4]                          // 'txn_elapse'
                //,gridData[ix][ 5]                        // 'exception_type'
                ,exceptionType
                ,common.Util.hexIpToDecStr(gridData[ix][ 6]) // 'client_ip'
                ,gridData[ix][24]                          // 'txn_cpu_time'
                ,gridData[ix][ 7]                          // 'sql_elapse'
                ,gridData[ix][ 8]                          // 'sql_exec_count'
                ,gridData[ix][ 9]                          // 'fetch_count'
                ,gridData[ix][23]                          // 'fetch_time'
                ,gridData[ix][10]                          // 'remote_elapse'
                ,gridData[ix][11]                          // 'remote_count'
                ,gridData[ix][12]                          // 'login_name'
                ,gridData[ix][13]                          // 'browser'
                ,gridData[ix][14]                          // 'tid'
                ,gridData[ix][15]                          // 'was_id'
                ,gridData[ix][16]                          // 'raw_time'
                ,gridData[ix][17]                          // 'txn_id'
                ,gridData[ix][18]                          // 'sql_elapse_avg'
                ,gridData[ix][19]                          // 'EXCEPTION'
                ,gridData[ix][20]                          // 'fsid'
                ,gridData[ix][21]                          // 'pcid'
                ,gridData[ix][22]                          // 'guid'
            ]);
        }

    }
});
