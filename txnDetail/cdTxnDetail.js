Ext.define('Exem.cdTxnDetail', {
    extend: 'Exem.txnDetailBaseForm',
    layout: 'fit',
    height: '100%',
    width: '100%',

    addColumnTxnGrid: function() {
        var microElapse = common.Util.CTR('Elapsed Time') + ' (' + decodeURI('%C2%B5') + 's)';
        this.txnDetailGrid.gridName = 'rtm_popup_cd_txndetail_grid';

        this.txnDetailGrid.beginAddColumns();
        this.txnDetailGrid.addColumn(common.Util.CTR('Time'),                   'time',           115, Grid.DateTime, true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Agent'),                  'was_name',       250, Grid.String,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Transaction Name'),       'txn_name',       380, Grid.String,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Transaction Code'),       'txn_code',       200, Grid.String,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Start Time'),             'start_time',     120, Grid.DateTime, true,  false);
        this.txnDetailGrid.addColumn(microElapse,                               'txn_elapse_us',  140, Grid.Number,   true,  false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Exception'),              'exception_type', 250, Grid.String,   true,  false);
        this.txnDetailGrid.addColumn('WAS ID',                                  'was_id',         135, Grid.Number,   false, true);
        this.txnDetailGrid.addColumn('TID',                                     'tid',            155, Grid.String,   false, false);
        this.txnDetailGrid.addColumn('TXN ID',                                  'txn_id',         135, Grid.String,   false, true);
        this.txnDetailGrid.addColumn('Exception Count',                         'EXCEPTION',      65,  Grid.Number,   false, true);
        this.txnDetailGrid.addColumn('GUID',                                    'guid',           155, Grid.Number,   false, false);
        this.txnDetailGrid.endAddColumns();

        this.txnDetailGrid.setOrderAct('txn_elapse_us', 'DESC');
        this.txnDetailGrid.loadLayout(this.txnDetailGrid.gridName);

        this.txnDetailGrid.addRenderer('exception_type', this.exceptionRenderer , RendererType.bar) ;
    },

    executeSQL: function(){
        var dataSet = {};
        var parameter = JSON.parse(localStorage.getItem('InterMax_PopUp_Param')) || null;
        var exception = parameter.exception;
        var txnName, txnCode, tid, gid, businessId;

        this.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(false);
        this.txnDetailGrid.down('#grid_detail_list_fetch_all').setVisible(false);

        if(!parameter){
            console.debug('txnDetail-executeSQL');
            console.debug('does not exist parameter');
            return;
        }

        if (exception !== ''){
            exception = 'AND exception > 0';
        }

        txnName = parameter.txnName;
        txnCode = parameter.txnCode || '';
        if(txnName !== '') {
            txnName =   'AND  txn_id in (SELECT n.txn_id ' +
                'FROM   xapm_txn_name n left outer join  xapm_txn_name_ext e ON  n.business_name = e.txn_name ' +
                'WHERE  lower(n.business_name) LIKE lower(\'%'+ txnName + '%\') OR lower(e.txn_name_ext) LIKE lower(\'%' + txnName + '%\') )';
        }

        if(txnCode !== '') {
            txnCode = 'AND tx_code like \'' + txnCode + '\'';
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

        dataSet.sql_file = 'IMXRT_cdTxnDetail_gridList_paging.sql';
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

        dataSet.replace_string = [{
            name: 'wasId',
            value: parameter.wasId
        }, {
            name: 'tid',
            value: tid
        }, {
            name: 'gid',
            value: gid
        }, {
            name: 'exception',
            value: exception
        }, {
            name: 'txnName',
            value: txnName
        }, {
            name: 'txnCode',
            value: txnCode
        }, {
            name: 'businessId',
            value:  businessId
        }, {
            name: 'offset',
            value:  this.limitData
        }, {
            name: 'offset2',
            value:  (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL')? this.limitFrom : ''
        }];

        WS.SQLExec(dataSet, this.onGridData, this);

        this.txnDetailGrid.loadingMask.show(false, true);
    },


    addRowTxnGridData: function(gridData) {
        var ix, ixLen,
            exceptionType;

        for(ix=0, ixLen=gridData.length; ix < ixLen; ix++){

            exceptionType = this.exceptionTypeProc(gridData[ix]);

            this.txnDetailGrid.addRow([
                gridData[ix][0]                            // 'time'
                ,gridData[ix][1]                            // 'was_name'
                ,gridData[ix][2]                            // 'txn_name'
                ,gridData[ix][10]                           //  'transaction_code' caution index.
                ,gridData[ix][3]                            // 'start_time'
                ,gridData[ix][4]                            // 'txn_elapse_us'
                ,exceptionType
                ,gridData[ix][5]                            // 'was_id'
                ,gridData[ix][6]                            // 'tid'
                ,gridData[ix][7]                            // 'txn_id'
                ,gridData[ix][8]                            // 'exception_count'
                ,gridData[ix][11]                           // 'guid'
            ]);
        }

    },

    exceptionTypeProc: function(data) {
        var retExceptionText = '',
            exceptionCnt = data[8],
            exceptionType = data[9];

        if(exceptionCnt > 0 && exceptionType == '') {
            retExceptionText = 'UnCaught Exception';
        } else {
            retExceptionText = exceptionType;
        }


        return retExceptionText;
    }

});
