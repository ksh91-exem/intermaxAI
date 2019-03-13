Ext.define('Exem.tpTxnDetail', {
    extend: 'Exem.txnDetailBaseForm',
    layout: 'fit',
    height: '100%',
    width: '100%',

    addColumnTxnGrid: function() {
        this.txnDetailGrid.gridName = 'rtm_popup_tp_txndetail_grid';

        this.txnDetailGrid.beginAddColumns();
        this.txnDetailGrid.addColumn(common.Util.CTR('Time'),                'time',           115, Grid.DateTime, true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Agent'),               'was_name',       130, Grid.String,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Transaction Name'),    'txn_name',       220, Grid.String,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Bank Code'),           'tx_code',        75,  Grid.String,   true , false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Server Name'),         'server_name',    120, Grid.String ,  true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Transaction CPU TIME'),'txn_cpu_time',   90,  Grid.Float,    true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Start Time'),          'start_time',     115, Grid.DateTime, true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Elapsed Time'),        'txn_elapse',     90,  Grid.Float,    true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Exception'),           'exception_type', 90 , Grid.String,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Elapse Time'),     'sql_elapse',     95,  Grid.Float,    true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Host Name'),           'host_name',      120, Grid.String,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Client IP'),           'client_ip',      95,  Grid.String,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Execution Count'), 'sql_exec_count', 120, Grid.Number,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Fetch Count'),     'fetch_count',    120, Grid.Number,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Fetch Time'),      'fetch_time',     120, Grid.Float,    true,  false);
        this.txnDetailGrid.addColumn('WAS ID',                               'was_id',         135, Grid.Number,   false, true);
        this.txnDetailGrid.addColumn('TID',                                  'tid',            155, Grid.String,   false, false);
        this.txnDetailGrid.addColumn('TXN ID',                               'txn_id',         135, Grid.String,   false, true);
        this.txnDetailGrid.addColumn('RAW TIME',                             'raw_time',       135, Grid.String,   false, true);
        this.txnDetailGrid.addColumn('Exception Count',                      'EXCEPTION',      65,  Grid.Number,   false, true);
        this.txnDetailGrid.addColumn('GUID',                                 'guid',           155, Grid.Number,   false, false);
        this.txnDetailGrid.endAddColumns();

        this.txnDetailGrid.setOrderAct('txn_elapse', 'DESC');
        this.txnDetailGrid.loadLayout(this.txnDetailGrid.gridName);

        this.txnDetailGrid.addRenderer('exception_type', this.exceptionRenderer , RendererType.bar);
    },

    executeSQL: function() {
        var dataSet = {};
        var parameter  = JSON.parse(localStorage.getItem('InterMax_PopUp_Param')) || null;
        var clientIp   = parameter.clientIp,
            loginName  = parameter.loginName,
            txnName    = parameter.txnName,
            txCode     = parameter.txCode || '',
            serverName = parameter.serverName || '',
            exception  = parameter.exception,
            tid        = parameter.tid || '',
            gid        = parameter.gid || '',
            businessId = parameter.businessId || '';

        this.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(false);
        this.txnDetailGrid.down('#grid_detail_list_fetch_all').setVisible(false);

        if (!parameter) {
            console.debug('txnDetail-executeSQL');
            console.debug('does not exist parameter');
            return;
        }

        if (clientIp !== '') {
            clientIp = 'AND client_ip LIKE \'' + clientIp + '\'';
        }

        if (txnName !== '') {
            txnName = 'AND business_name LIKE \'' + txnName + '\'';
        }

        if (txCode !== '') {
            txCode = 'AND tx_code LIKE \'' +  txCode + '\'';
        }

        if (loginName !== '') {
            if (loginName === '%') {
                loginName = '';
            } else {
                loginName = 'AND lower(login_name) LIKE lower(\'' + loginName + '\') ';
            }
        }

        if (serverName !== '') {
            serverName = 'AND s.svr_name LIKE \'' + serverName + '\'';
        }

        if (exception !== '') {
            exception = 'AND exception > 0';
        }

        if (tid !== '') {
            tid = 'AND e.tid = ' + tid;
        }

        if (gid !== '') {
            gid = 'AND guid LIKE \'' + gid + '\'';
        }

        if (businessId !== '') {
            businessId = 'AND e.business_id in (' + businessId + ')';
        }

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
            name: 'time_zone',
            value: new Date().getTimezoneOffset() * 1000 * 60 * -1,
            type: SQLBindType.INTEGER
        }];

        if (parameter.msFromTime && parameter.msToTime) {
            dataSet.sql_file = 'IMXRT_tpTxnDetail_gridList_paging_ms.sql';
            dataSet.bind.push(
                {name : 'msFromTime', value : parameter.msFromTime, type : SQLBindType.STRING},
                {name : 'msToTime', value : parameter.msToTime, type : SQLBindType.STRING}
            );
        } else {
            dataSet.sql_file = 'IMXRT_tpTxnDetail_gridList_paging.sql';
        }


        dataSet.replace_string = [{
            name: 'wasId',
            value: parameter.wasId
        }, {
            name: 'clientIp',
            value: clientIp
        }, {
            name: 'loginName',
            value: loginName
        }, {
            name: 'txnName',
            value: txnName
        }, {
            name: 'txCode',
            value: txCode
        }, {
            name: 'serverName',
            value: serverName
        }, {
            name: 'exception',
            value: exception
        }, {
            name: 'tid',
            value: tid
        }, {
            name: 'gid',
            value: gid
        }, {
            name: 'businessId',
            value:  businessId
        }, {
            name: 'offset',
            value:  this.limitData
        }, {
            name: 'offset2',
            value:  (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
        }];

        WS.SQLExec(dataSet, this.onGridData, this);

        this.txnDetailGrid.loadingMask.show(false, true);
    },


    addRowTxnGridData: function(gridData) {
        var ix, ixLen,
            exceptionType;

        for (ix = 0, ixLen = gridData.length; ix < ixLen; ix++) {

            exceptionType = this.exceptionTypeProc(gridData[ix][19], gridData[ix][20]);

            this.txnDetailGrid.addRow([
                gridData[ix][ 0]                              // 'time'
                ,gridData[ix][ 1]                             // 'was_name'
                ,gridData[ix][ 2]                             // 'txn_name'
                ,gridData[ix][ 3]                             // 'tx_code'
                ,gridData[ix][ 4]                             // 'server_name'
                ,gridData[ix][ 5]                             // 'cpu'
                ,gridData[ix][ 6]                             // 'start_time'
                ,gridData[ix][ 7]                             // 'txn_elapse'
                ,exceptionType                                // 'exception_type'
                ,gridData[ix][ 8]                             // 'sql_elapse'
                ,gridData[ix][ 9]                             // 'host_name'
                ,common.Util.hexIpToDecStr(gridData[ix][10])  // 'client_ip'
                ,gridData[ix][11]                             // 'sql_exec_count'
                ,gridData[ix][12]                             // 'fetch_count'
                ,gridData[ix][13]                             // 'fetch_time'
                ,gridData[ix][15]                             // 'was_id'
                ,gridData[ix][16]                             // 'tid'
                ,gridData[ix][17]                             // 'txn_id'
                ,gridData[ix][18]                             // 'raw_time'
                ,gridData[ix][19]                             // 'exception_count'
                ,gridData[ix][21]                             // 'guid'
            ]);
        }

    }

});
