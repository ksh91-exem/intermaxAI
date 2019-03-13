Ext.define('Exem.etoeTxnDetail', {
    extend: 'Exem.txnDetailBaseForm',
    layout: 'fit',
    height: '100%',
    width: '100%',

    addColumnTxnGrid: function() {
        this.txnDetailGrid.gridName = 'rtm_popup_etoe_txndetail_grid';

        this.txnDetailGrid.beginAddColumns();
        this.txnDetailGrid.addColumn(common.Util.CTR('Time'),                             'time'            , 115,  Grid.DateTime, true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Agent'),                            'was_name'        , 130,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Business'),                         'business_name'   , 130,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Transaction'),                      'txn_name'        , 220,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Terminal IP'),                      'client_ip'       , 115,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Bank Code'),                        'tx_code'         , 220,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Start Time'),                       'start_time'      , 115,  Grid.DateTime, true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Terminal Response Time') + ' (ms)', 'elapse_time'     , 135 , Grid.Float ,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Turn Around Time') + ' (ms)',       'turn_around_time', 135,  Grid.Float,    true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Exception'),                        'exception_type'  , 150 , Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Gap Time (ms)'),                    'gap_time'        , 100 , Grid.Number,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Push ID'),                          'push_id'         , 100 , Grid.String,   true, false);
        this.txnDetailGrid.addColumn('TID',                                               'tid'             , 155,  Grid.String,   false, false);
        this.txnDetailGrid.addColumn('TXN ID',                                            'txn_id'          , 135,  Grid.String,   false, true);
        this.txnDetailGrid.addColumn('Exception Count',                                   'EXCEPTION'       , 65 ,  Grid.Number,   false, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('GUID'),                             'guid'            , 155,  Grid.String,   true, false);
        this.txnDetailGrid.endAddColumns();

        this.txnDetailGrid.setOrderAct('turn_around_time', 'DESC');
        this.txnDetailGrid.loadLayout(this.txnDetailGrid.gridName);

        this.txnDetailGrid.addRenderer('exception_type', this.exceptionRenderer , RendererType.bar);

    },

    executeSQL: function() {
        var dataSet = {};
        var clientIp, txnName, exception, tid, gid, txCode, businessId;

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

        txnName = parameter.txnName;
        if (txnName !== '') {
            txnName =   'AND  e.txn_id in (SELECT n.txn_id ' +
                'FROM   xapm_txn_name n left outer join  xapm_txn_name_ext e ON  n.business_name = e.txn_name ' +
                'WHERE  lower(n.business_name) LIKE lower(\'%' + txnName + '%\') OR lower(e.txn_name_ext) LIKE lower(\'%' + txnName + '%\') )';
        }

        exception = parameter.exception;
        if (exception !== '') {
            exception = 'AND exception_count > 0';
        }

        txCode = parameter.txCode;
        if (txCode !== '') {
            txCode = 'AND e.tx_code LIKE \'' + txCode + '\'';
        }

        tid = parameter.tid || '';
        if (tid !== '') {
            tid = 'AND e.tid = ' + tid;
        }

        gid = parameter.gid || '';
        if (gid !== '') {
            gid = 'AND guid LIKE \'' + gid + '\'';
        }

        businessId = parameter.businessId || '';
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

        dataSet.sql_file = 'IMXRT_etoeTxnDetail_gridList_paging.sql';

        dataSet.replace_string = [{
            name: 'wasId',
            value: parameter.wasId
        }, {
            name: 'txCode',
            value: txCode
        }, {
            name: 'txnName',
            value: txnName
        }, {
            name: 'clientIp',
            value: clientIp
        }, {
            name: 'gid',
            value: gid
        }, {
            name: 'exception',
            value: exception
        }, {
            name: 'tid',
            value: tid
        }, {
            name: 'offset',
            value:  this.limitData
        }, {
            name: 'offset2',
            value:  (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
        }, {
            name: 'businessId',
            value:  businessId
        }];

        WS.SQLExec(dataSet, this.onGridData, this);

        this.txnDetailGrid.loadingMask.show(false, true);
    },


    addRowTxnGridData: function(gridData) {
        var ix, ixLen,
            exceptionCount, exceptionType;

        for (ix = 0, ixLen = gridData.length; ix < ixLen; ix++) {
            exceptionCount = gridData[ix][12];
            exceptionType = gridData[ix][9];

            exceptionType = this.exceptionTypeProc(exceptionCount, exceptionType);

            this.txnDetailGrid.addRow([
                gridData[ix][ 0]                           // 'time'
                ,gridData[ix][ 1]                          // 'was_name'
                ,gridData[ix][ 2]                          // 'business_name'
                ,gridData[ix][ 3]                          // 'txn_name'
                ,common.Util.hexIpToDecStr(gridData[ix][ 4]) // 'client_ip'
                ,gridData[ix][ 5]                          // 'tx_code'
                ,gridData[ix][ 6]                          // 'start_time'
                ,gridData[ix][ 7]                          // 'elapse_time'
                ,gridData[ix][ 8]                          // 'turn_around_time'
                ,exceptionType
                ,gridData[ix][14]                          // 'gap_time'
                ,gridData[ix][15]                          // 'push_id'
                ,gridData[ix][10]                          // 'tid'
                ,gridData[ix][11]                          // 'txn_id'
                ,exceptionCount                            // 'EXCEPTION'
                ,gridData[ix][13]                          // 'guid'
            ]);
        }

    }
});
