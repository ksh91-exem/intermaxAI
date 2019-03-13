Ext.application({
    name: 'IntermaxTransactionDetailForMXG',
    appFolder: location.pathname.split('/')[1],

    initProperty: function(){
        window.msgMap = opener.msgMap;
        window.Comm   = opener.Comm;
        window.common = opener.common;

        window.WS = opener.WS;
        window.WS2 = opener.WS2;
    },

    launch: function() {
        this.initProperty();

        this.createLayout();

        this.getTxnData(this.executeSQL.bind(this));

        this.addWindowEvents();
    },

    createLayout: function(){
        var baseFrameDiv = document.createElement('div');

        baseFrameDiv.className = 'rtm-base';
        baseFrameDiv.id = 'baseFrame';
        baseFrameDiv.style.position = 'absolute';
        baseFrameDiv.style.top = '0px';
        baseFrameDiv.style.left = '0px';
        baseFrameDiv.style.bottom = '0px';
        baseFrameDiv.style.width = '100%';
        baseFrameDiv.style.height = '100%';
        baseFrameDiv.style.minWidth = '700px';
        baseFrameDiv.style.minHeight = '400px';

        document.body.appendChild(baseFrameDiv);

        var theme = opener.Comm.RTComm.getCurrentTheme();
        switch (theme) {
            case 'Black' :
                document.body.className = 'mx-theme-black';
                break;
            case 'Gray' :
                document.body.className = 'mx-theme-gray';
                break;
            default :
                break;
        }

        if (opener.window.nation === 'ja') {
            document.body.classList.add('ja');
        } else {
            document.body.classList.remove('ja');
        }

        this.baseFrame = Ext.create('Ext.container.Container', {
            layout: 'border',
            width: '100%',
            height: '100%',
            minWidth: 700,
            minHeight: 400,
            padding: '8 8 8 8',
            cls: 'rtm-txn-grid-n-detail',
            renderTo: Ext.get('baseFrame')
        });

        var saveGridName = 'rtm_popup_txndetail_grid';
        this.txnDetailGrid = Ext.create('Exem.BaseGrid', {
            gridName: saveGridName,
            region: 'north',
            height: 150,
            itemId: 'txnDetailGrid',
            usePager: true,
            defaultPageSize: 100,
            split: true,
            defaultbufferSize : 0,
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            localeType: 'd H:i:s',
            exportFileName: common.Util.TR('Transaction Detail List'),
            columnmove: function() {
                this.saveLayout(this.name);
            },
            itemclick: function(_this, record) {
                this.createTxnDetail(record.data);
            }.bind(this)
        });

        this.fromRowIndex = 0;
        this.loadDataRow = 10000;
        this.maxLoadCount = Comm.excelExportLimitRow || 50000;
        this.limitData = 0;
        this.limitFrom = 0;

        if (Comm.currentRepositoryInfo.database_type === 'Oracle') {
            this.defaultLimitData = this.loadDataRow;
        } else {
            this.defaultLimitData = 'LIMIT ' + this.loadDataRow;
        }

        this.isAddGridData = false;
        this.limitData = this.defaultLimitData;

        var me = this;
        this.txnDetailGrid.pnlExGridPager.add({
            xtype: 'button',
            cls  : 'rtm-button',
            itemId: 'grid_detail_list_more_btn',
            text: common.Util.TR('More Load'),
            margin: '0 0 0 10',
            border: true,
            handler: function() {
                me.fromRowIndex += me.loadDataRow;
                me.isAddGridData = true;

                if (Comm.currentRepositoryInfo.database_type === 'Oracle') {
                    me.limitData = me.defaultLimitData +  me.fromRowIndex;
                    me.limitFrom = me.fromRowIndex;
                } else {
                    me.limitData = me.defaultLimitData + ' OFFSET ' + me.fromRowIndex;
                }
                me.executeSQL();
            }
        },{
            xtype: 'button',
            cls  : 'rtm-button',
            itemId: 'grid_detail_list_fetch_all',
            text: common.Util.TR('Fetch All'),
            margin: '0 0 0 10',
            border: true,
            handler: function() {
                this.setVisible(false);
                me.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(false);
                me.isAddGridData = false;

                if (Comm.currentRepositoryInfo.database_type === 'Oracle') {
                    me.limitData = me.maxLoadCount;
                    me.limitFrom = 0;
                } else {
                    me.limitData = 'LIMIT ' + me.maxLoadCount;
                }
                me.executeSQL();
            }
        });

        this.txnPathLayer = Ext.create('Ext.container.Container', {
            region: 'center',
            layout: 'fit',
            width: '100%',
            flex: 3,
            margin: '5 0 0 0'
        });

        this.txnDetailGrid.beginAddColumns();
        this.txnDetailGrid.addColumn(common.Util.CTR('Time'),                   'time'          , 90 ,  Grid.DateTime, true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Agent'),                  'was_name'      , 150,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Transaction'),            'txn_name'      , 250,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Start Time'),             'start_time'    , 135,  Grid.DateTime, true , false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Elapse Time'),            'txn_elapse'    , 90 ,  Grid.Float ,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Exception'),              'exception_type', 90 ,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('Client IP'),              'client_ip'     , 110,  Grid.String,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Elapse Time'),        'sql_elapse'    , 120 , Grid.Float ,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Execution Count'),    'sql_exec_count', 120 , Grid.Number,   true, false);
        this.txnDetailGrid.addColumn(common.Util.CTR('SQL Fetch Count'),        'fetch_count'   , 120 , Grid.Number,   true, false);
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
        ///this.txnDetailGrid.addColumn(common.Util.CTR('URL'),                   'url'           , 200, Grid.String, false, false);
        this.txnDetailGrid.endAddColumns();

        this.txnDetailGrid.setOrderAct('txn_elapse', 'DESC');
        this.txnDetailGrid.loadLayout(saveGridName);
        
        this.txnDetailGrid.addRenderer('exception_type', this.exceptionRenderer , RendererType.bar) ;

        this.baseFrame.add(this.txnDetailGrid, this.txnPathLayer);

        window.addEventListener('resize', function() {
            this.baseFrame.setSize(window.innerWidth, window.innerHeight);
        }.bind(this));
    },


    exceptionRenderer: function(value, meta, record, r, c, store, view) {
        if (record.data.EXCEPTION > 0 ){
            setTimeout(function () {
                var row = view.getNode(record);
                if (row) {
                    var el = Ext.get(row).dom.getElementsByClassName('x-grid-cell')[c] ;
                    el.classList.add('exception-cell');
                }
            }.bind(this), 5);
        }
        return value ;
    },


    onGridData: function(header, data){
        var ix, ixLen,
            gridComponent;

        if (!data || !this.txnDetailGrid) {
            console.debug('[MxgTxnDetail] Get Transaction Grid Data...Complete. But Is not object.');
            this.txnDetailGrid.loadingMask.hide();
            return;
        }
        var gridData = data.rows;

        console.debug('[MxgTxnDetail] Get Transaction Grid Data...Complete. Data Length:', gridData.length);

        if(!common || !common.Util.checkSQLExecValid(header, data)){
            this.txnDetailGrid.loadingMask.hide();

            console.debug('txnDetail-onGridData');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (!this.isAddGridData) {
            this.txnDetailGrid.clearRows();
        }

        var exceptionType;

        for(ix = 0, ixLen = gridData.length; ix < ixLen; ix++){
            exceptionType = this.exceptionTypeProc(gridData[ix][19], gridData[ix][5]);

            this.txnDetailGrid.addRow([
                gridData[ix][ 0]                           // 'time'
                ,gridData[ix][ 1]                          // 'was_name'
                ,gridData[ix][ 2]                          // 'txn_name'
                ,common.Util.getDate(gridData[ix][ 3])     // 'start_time'
                ,gridData[ix][ 4]                          // 'txn_elapse'
                //,gridData[ix][ 5]                        // 'exception_type'
                ,exceptionType
                ,common.Util.hexIpToDecStr(gridData[ix][ 6]) // 'client_ip'
                ,gridData[ix][ 7]                          // 'sql_elapse'
                ,gridData[ix][ 8]                          // 'sql_exec_count'
                ,gridData[ix][ 9]                          // 'fetch_count'
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
            ]);
        }

        if (ixLen < this.loadDataRow) {
            this.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(false);
            this.txnDetailGrid.down('#grid_detail_list_fetch_all').setVisible(false);
        } else {
            this.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(true);
            this.txnDetailGrid.down('#grid_detail_list_fetch_all').setVisible(true);
        }

        this.txnDetailGrid.drawGrid();
        this.txnDetailGrid.loadingMask.hide();

        if(gridData.length > 0){
            gridComponent = this.txnDetailGrid.pnlExGrid;

            gridComponent.getView().getSelectionModel().select(0);
            gridComponent.fireEvent('itemclick', gridComponent, gridComponent.getSelectionModel().getLastSelected());
        }
    },

    executeSQL: function() {
        console.debug('[MxgTxnDetail] Get Transaction Grid Data...');

        var dataSet = {};
        var clientIp, txnName, exception, loginName, tid, gid,
            fetchCnt, sqlElapseTime, sqlExecCnt;
        var parameter = JSON.parse(localStorage.getItem('InterMax_PopUp_Param') || null);

        this.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(false);
        this.txnDetailGrid.down('#grid_detail_list_fetch_all').setVisible(false);

        if(!parameter){
            console.debug('txnDetail-executeSQL');
            console.debug('does not exist parameter');
            return;
        }

        console.debug('[MxgTxnDetail] Get Transaction Grid Data... Parameter:', parameter);

        clientIp = parameter.clientIp;
        if (clientIp !== ''){
            clientIp = 'AND client_ip LIKE \'' + clientIp + '\'';
        }

        txnName = parameter.txnName;
        if (txnName !== ''){
            txnName =   'AND  txn_id in (SELECT n.txn_id ' +
                        'FROM   xapm_txn_name n left outer join  xapm_txn_name_ext e ON  n.business_name = e.txn_name ' +
                        'WHERE  lower(n.business_name) LIKE lower(\'%'+ txnName + '%\') OR lower(e.txn_name_ext) LIKE lower(\'%' + txnName + '%\') )';
        }

        exception = parameter.exception;
        if (exception !== ''){
            exception = 'AND exception > 0';
        }

        loginName = parameter.loginName;
        if (loginName !== '') {
            if (loginName === '%') {
                loginName = '';
            } else {
                loginName = 'AND lower(login_name) LIKE lower(\''+loginName+'\') ';
            }
        }

        tid = parameter.tid || '';
        if (tid !== '') {
            tid = 'AND tid = ' + tid;
        }

        gid = parameter.gid || '';
        if(gid !== '') {
            gid = 'AND EXISTS ( SELECT * FROM XAPM_REMOTE_CALL r ' +
                'WHERE e.TID = r.TID AND r.GID = \''+gid+'\') ';
        }

        fetchCnt = parameter.fetchCnt || 0;
        sqlElapseTime = parameter.sqlElapseTime || 0;
        sqlExecCnt = parameter.sqlExecCnt || 0;


        dataSet.sql_file = 'IMXRT_txnDetail_gridList_paging.sql';
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

        dataSet.replace_string = [{
            name: 'wasId',
            value: parameter.wasId
        }, {
            name: 'tid',
            value: tid
        }, {
            name: 'txCode',
            value: ''
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
            name: 'loginName',
            value: loginName
        }, {
            name: 'offset',
            value:  this.limitData
        }, {
            name: 'offset2',
            value:  (Comm.currentRepositoryInfo.database_type === 'Oracle')? this.limitFrom : ''
        }];

        WS.SQLExec(dataSet, this.onGridData, this);

        this.txnDetailGrid.loadingMask.show(false, true);
    },


    /**
     *  Exception Type 처리 함수
     * txn_detail에 데이터가 존재하나 class_method_exception이 없을 경우를 처리
     *
     * @param {number | string} exceptionCnt
     * @param {string} exceptionType
     * @return {string} exception type string
     */
    exceptionTypeProc: function(exceptionCnt, exceptionType) {
        var retExceptionText;

        if (exceptionCnt > 0 && exceptionType == '') {
            retExceptionText = 'UnCaught Exception';
        } else {
            retExceptionText = exceptionType;
        }
        return retExceptionText;
    },

    /**
     * Configuraion Transaction Detail View
     *
     * @param {object} record - selected data
     */
    createTxnDetail: function(record) {
        this.txnPathLayer.removeAll();

        this.txnDetailView = Ext.create('view.TransactionDetailView',{
            themeType: Comm.RTComm.getCurrentTheme(),
            autoScroll: true,
            endTime: record.time,
            wasId: record.was_id,
            name: record.was_name,
            txnName: record.txn_name,
            tid: record.tid,
            startTime: record.start_time,
            elapseTime : record.txn_elapse,
            gid: record.gid,
            socket: WS,
            isCenterSizeMin: true
        });

        this.txnPathLayer.add(this.txnDetailView);
        this.txnDetailView.init();
    },


    getTxnData: function(callback) {
        var parameter = JSON.parse(localStorage.getItem('InterMax_PopUp_Param') || null);
        var key;
        var dbInfo;
        var dbKeys = Object.keys(Comm.dbInfoObj);
        var dbId = 0;

        for (var ix = 0; ix < dbKeys.length; ix++) {
            key = dbKeys[ix];
            dbInfo = Comm.dbInfoObj[key];

            if (dbInfo.host_ip === parameter.ip &&
                dbInfo.port === parameter.port &&
                dbInfo.sid === parameter.sid) {
                dbId = key;
                break;
            }
        }

        var dataSet = {};
        dataSet.sql_file = 'IMXRT_TxnData_SqlId.sql';
        dataSet.bind = [{
            name: 'fromTime',
            value: parameter.fromTime,
            type: SQLBindType.STRING
        }, {
            name: 'toTime',
            value: parameter.toTime,
            type: SQLBindType.STRING
        }, {
            name: 'sql_id',
            value: parameter.sql_id,
            type: SQLBindType.STRING
        }, {
            name: 'db_id',
            value: dbId,
            type: SQLBindType.STRING
        }, {
            name: 'sid',
            value: parameter.sessionid,
            type: SQLBindType.INTEGER
        }];

        this.txnDetailGrid.loadingMask.show(false, true);

        console.debug('[MxgTxnDetail] Get TID, WAS ID By SQLID...');
        WS.SQLExec(dataSet, function(header, data) {
            var txnData = data.rows;

            console.debug('[MxgTxnDetail] Get TID, WAS ID By SQLID...Complete. Data Length:', txnData.length);

            if (!window || txnData.length <= 0) {
                this.txnDetailGrid.loadingMask.hide();

                Ext.MessageBox.show({
                    title   : '',
                    icon    : Ext.MessageBox.INFO,
                    message : common.Util.TR('There are no results to display.'),
                    modal   : true,
                    buttons : Ext.Msg.OK
                });
                return;
            }

            var parameter = JSON.parse(localStorage.getItem('InterMax_PopUp_Param') || null);
            var wasIdArr  = '';

            for (var ix = 0, ixLen = txnData.length; ix < ixLen; ix++) {
                if (ix !== 0) {
                    wasIdArr += ',';
                }
                wasIdArr += txnData[ix][0];    // WAS ID
                parameter.maxElapse = Math.max(parameter.maxElapse, txnData[ix][1])  // Elapsed Time
            }
            parameter.wasId = wasIdArr; 

            localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(parameter) );

            if (callback) {
                callback();
            }

        }.bind(this), this);
    },


    addWindowEvents: function() {
        window.onbeforeunload = function() {
            window.msgMap = null;
            window.Comm   = null;
            window.common = null;
        };

        opener.window.addEventListener('beforeunload', function() {
            if (window) {
                window.msgMap = null;
            }
            window.Comm = null;
            window.common = null;

            if (window) {
                window.close();
            }
        });
    }

});