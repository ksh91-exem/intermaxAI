Ext.define('view.WebResponseInspector', {
    extend: 'Exem.TxnTrendBaseForm',
    title: '',
    sql : {
        elapseTimeScatter     : 'IMXPA_WebResponseInspector_Scatter.sql',
        detailListGrid        : 'IMXPA_WebResponseInspector_GridList_paging.sql',
        detailListGrid_Re     : 'IMXPA_WebResponseInspector_GridList_paging_re.sql',
        detailListGrid_Re_Txn : 'IMXPA_WebResponseInspector_GridList_paging_re_txn.sql',
        txnChart              : 'IMXPA_WebResponseInspector_txn_chart.sql'
    },
    innerInit: function() {

        this.httpStatusList = [
            {value : 100, name : '1XX'},
            {value : 200, name : '2XX'},
            {value : 300, name : '3XX'},
            {value : 400, name : '4XX'},
            {value : 500, name : '5XX'}
        ];

        this.createLayoutDetailCond();
        this.addColumnDetailGrid();
    },

    createLayoutDetailCond: function() {
        var ix, ixLen;

        this.txnNameField = Ext.create('Exem.TextField', {
            itemId     : 'txnNameField',
            fieldLabel : common.Util.CTR('Transaction Name'),
            labelWidth : 120,
            x          : 10,
            y          : 40,
            width      : 350,
            value      : '%',
            maxLength  : 300
        });

        this.ipField = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.CTR('IP'),
            labelWidth : 20,
            x          : 412,
            y          : 40,
            width      : 200,
            value      : '%',
            maxLength  : 41 // %255.255.255.255% or %0000:0000:0000:0000:0000:0000:0000:0000%
        });

        this.cbxHttpStatus = Ext.create('Exem.ComboBox', {
            fieldLabel  : common.Util.TR('Http Status'),
            labelWidth  : 70,
            x           : 747 ,
            y           : 40,
            width       : 200,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            useSelectFirstRow : true,
            multiSelect : true,
            listeners : {
                select: function( combo, records) {
                    var lastSelect = records[records.length-1];
                    if(combo.getValue() !== null){
                        if (lastSelect.data.name === common.Util.TR('(All)')) {
                            combo.reset();
                            combo.setValue( common.Util.TR('(All)') );
                        } else {
                            if (combo.getValue().indexOf( common.Util.TR('(All)') ) !== -1) {
                                combo.reset();
                                combo.setValue(lastSelect.data[1]);
                            }
                        }
                    } else {
                        if (combo.getRawValue().indexOf(common.Util.TR('(All)') ) === -1) {
                            combo.reset();
                            combo.setValue(records);
                        }
                    }
                }
            }
        });

        for(ix=0, ixLen=this.httpStatusList.length; ix<ixLen; ix++) {
            this.cbxHttpStatus.addItem(this.httpStatusList[ix].value, this.httpStatusList[ix].name, ix+1);
        }
        this.cbxHttpStatus.insertAll();
        this.cbxHttpStatus.selectRow();

        this.httpTypeField = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.CTR('Http Type'),
            labelWidth : 70,
            x          : 56,
            y          : 75,
            width      : 220,
            maxLength  : 50,
            value      : '%'
        });


        this.tidField = Ext.create('Exem.TextField', {
            fieldLabel: 'TID',
            labelWidth: 20,
            x: 419,
            y: 75,
            width: 250,
            value: '',
            defaultEmptyText: '',
            maxLength: 300,
            maskRe : /^[0-9]*$/
        });

        this.conditionArea.add([this.txnNameField, this.ipField, this.cbxHttpStatus, this.httpTypeField, this.tidField]);

    },

    addColumnDetailGrid : function() {
        if(!this.detailListGrid) {
            this.detailListGrid = this.addDetailGrid();
            this.detailListGrid.gridName = 'pa_web_trend_detail_gridName';
            this.gridBox.add(this.detailListGrid);
        }

        this.detailListGrid.beginAddColumns();
        this.detailListGrid.addColumn(common.Util.CTR('Time'),             'time',           115, Grid.DateTime, true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('WebServer'),        'ws_name',        150, Grid.String,   true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Transaction Name'), 'txn_name',       410, Grid.String,   true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Status/Type'),      'status_type',    100, Grid.String,   true , false);
        this.detailListGrid.addColumn(common.Util.CTR('Start Time'),       'start_time',     115, Grid.DateTime, true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Elapsed Time'),     'elapse_time',    110, Grid.Float,    true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Client IP'),        'client_ip',      120, Grid.String,   true,  false);
        this.detailListGrid.addColumn('WS ID',                             'ws_id',          135, Grid.Number,   false, true);
        this.detailListGrid.addColumn('TID',                               'tid',            155, Grid.String,   false, false);
        this.detailListGrid.addColumn('TXN ID',                            'txn_id',         155, Grid.String,   false, true);
        this.detailListGrid.addColumn('STATUS',                            'status',         155, Grid.String,   false, true);
        this.detailListGrid.addColumn('RAW TIME',                          'raw_time',       135, Grid.String,   false, true);
        this.detailListGrid.endAddColumns();

        this.detailListGrid.loadLayout(this.detailListGrid.gridName);

        this.detailListGrid.addRenderer('status_type', this.exceptionRenderer.bind(this) , RendererType.bar) ;
        this.detailListGrid.setOrderAct('elapse_time', 'DESC');
    },

    exceptionRenderer: function(value, meta, record) {
        var customCellDOM;

        if (record.data.status >= 400 && meta.column.dataIndex == 'status_type'){
            meta.style="background-color:lightcoral;";
        }

        customCellDOM = '<div data-qtip="' + value + '">'+ value +'</div>';

        return customCellDOM;
    },

    retrieve: function() {
        var self = this,
            maxElapse, tmpTxnName;

        if (this.retrieve_loading) {
            return;
        }

        this.retrieve_loading = true;
        this.detailScatter.retrieveLoading = this.retrieve_loading;

        this.isInit = false;

        this.isNotMoreData = false;
        this.fromRowIndex = 0;
        this.limitData = this.defaultLimitData;
        this.limitFrom = 0;
        this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(true);

        var result =  this.wasField.checkValid() && this.checkValid();

        if (result) {
            this.minElapse = this.minElapseField.getValue()*1000;

            if (this.maxElapseField.getValue() == common.Util.TR('infinite')) {
                maxElapse = 'infinite';
            }
            else {
                maxElapse = this.maxElapseField.getValue()*1000;
            }

            tmpTxnName = this.txnNameField.value ;
            if (tmpTxnName.indexOf(']') > 0) {
                tmpTxnName = tmpTxnName.substr(tmpTxnName.indexOf(']')+2, tmpTxnName.length) ;
            }

            this.setRetrieveRange({
                timeRange   : [new Date(self.datePicker.mainFromField.getValue()), new Date(self.datePicker.mainToField.getValue())],
                elapseRange : [self.minElapseField.getValue()*1000, maxElapse],
                txnName     : [ tmpTxnName ]
            });

            this.init_elapse_min = self.minElapseField.getValue() ;
            this.init_elapse_max = Number(self.maxElapseField.getValue() ) ;

            var txnName = this.txnNameField.getValue(),
                httpType = this.httpTypeField.getValue(),
                chkException = this.exceptionToggle.getValue(),
                clientIp = common.Util.strIpToHex(this.ipField.getValue()),
                tid = this.tidField.getValue();

            if (txnName == '%'){
                this._txnNameRepl = '';
            }
            else {
                this._txnNameRepl = 'AND e.txn_id in (SELECT n.txn_id ' +
                    'FROM   xapm_txn_name n left outer join  xapm_txn_name_ext e ON  n.txn_name = e.txn_name ' +
                    'WHERE   n.txn_name LIKE \''+ txnName + '\' OR e.txn_name_ext LIKE \'' + txnName + '\' )';
            }

            if (clientIp == '%'){
                this._clientIpRepl = '';
            }
            else{
                this._clientIpRepl = 'AND client_ip LIKE \''+clientIp+'\' ';
            }

            if (chkException) {
                this._exceptionRepl = '';
            }
            else {
                this._exceptionRepl = 'AND http_status >= 400 ';
            }

            if (httpType == '%'){
                this._httpTypeRepl = '';
            }
            else {
                this._httpTypeRepl = 'AND http_method LIKE \'' + httpType + '\'';
            }

            if (!tid) {
                this._tidRepl = '';
            }
            else {
                this._tidRepl = 'AND tid = ' + tid;
            }

        }
        else {
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string'){
                console.warn('message :', result);
            }
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;

            return;
        }

        result = this.datePicker.checkValid() ;

        if (!result){
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string') {
                console.warn('');
            }

            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;

        }
        else {
            this.setTitleWithTimeRange();
            this.executeSQL();
        }
    },

    executeSQL: function() {

        this.retrieve_click = true;
        this.init_time = null;
        this.bottomTab.setActiveTab(0);
        this.bottomTab.tabBar.items.items[1].setVisible(false);
        this.completeScatterSqlExec = false;
        this.completeGridListSqlExec = false;

        this.retrieveScatter();

        if(!this.chartToggle.getValue()){
            this.detailListGrid.getEl().dom.style.opacity = '1';
            this.txnGrid.getEl().dom.style.opacity = '1';
            this.detailListGrid.setDisabled(false);
            this.txnGrid.setDisabled(false);

            this.retrieveGrid();
        } else {
            this.detailListGrid.clearRows();
            this.detailListGrid.drawGrid();
            this.txnGrid.clearRows();
            this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
            this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
            this.detailListGrid.getEl().dom.style.opacity = '0.3';
            this.txnGrid.getEl().dom.style.opacity = '0.3';
            this.detailListGrid.setDisabled(true);
            this.txnGrid.setDisabled(true);
        }
    },

    retrieveScatter: function() {
        var time_zone;

        if (!this.detailScatterBox.el) {
            this.isChartDom = false;
            return;
        }

        this.detailScatterBox.loadingMask.showMask();

        this.scatterWidth = this.detailScatterBox.getWidth();
        this.scatterHeight = this.detailScatterBox.getHeight();

        //한국시간 offset값 -3240000이어서 기본값 음수.
        time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        //만약 offset값이 양수일 경우는 문자열 + 를 넣어서 sql상 error가 발생 안하도록 변경.
        if (time_zone > 0) {
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: this.sql.elapseTimeScatter,
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }],
            replace_string: [{
                name: 'wsId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'httpStatus', value: this.getHttpStatusList()
            }, {
                name: 'httpType', value: this._httpTypeRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }]
        }, this.onScatterData, this);
    },

    onScatterData: function(header, data) {
        if(this.isClosed){
            return;
        }

        this.detailScatter.fromTime = new Date(this.fromTime) ;
        this.detailScatter.toTime =   new Date(this.toTime) ;

        this.detailScatter.lastSelectRange = {invMinX : null, invMaxX : null, invMinY : null, invMaxY : null};

        this.isChartDataVisible = (this.detailScatter.target.getWidth() > 0);

        this.detailScatter.draw(data.rows, this.scatterWidth, this.scatterHeight);
        this.detailScatterBox.setLoading(false);
        this.detailScatterBox.loadingMask.hide();

        this.completeScatterSqlExec = true;
        this.selectToFirstRow();

        if(this.chartToggle.getValue()){
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;
        }
    },

    retrieveGrid: function() {
        var time_zone;

        if (!this.isAddGridData) {
            this.detailListGrid.clearRows();
        }

        this.detailListGrid.loadingMask.showMask();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);
        this.isAddGridData = false;

        time_zone = new Date().getTimezoneOffset() * 1000 * 60;
        if(time_zone > 0){
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: this.sql.detailListGrid,
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }],
            replace_string: [{
                name: 'wsId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'httpStatus', value: this.getHttpStatusList()
            }, {
                name: 'httpType', value: this._httpTypeRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value:  this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
            }]
        }, this.onGridData, this);
    },

    retrieveReGrid: function(){
        var time_zone;

        if (this.autoRetrieveRange !== null) {
            this.detailListGrid.setLoading(true);
        }

        this.detailListGrid.loadingMask.showMask();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);


        time_zone = new Date().getTimezoneOffset() * 1000 * 60;
        if(time_zone > 0){
            time_zone = '+' + time_zone;
        }

        this.isNotMoreData = false;
        this.fromRowIndex = 0;
        this.limitData = this.defaultLimitData;
        this.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);

        WS.SQLExec({
            sql_file: this.sql.detailListGrid_Re,
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }],
            replace_string: [{
                name: 'wsId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'httpStatus', value: this.getHttpStatusList()
            }, {
                name: 'httpType', value: this._httpTypeRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value:  this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
            }]
        }, this.onReGridData, this);
    },

    addRowDetailGrid: function(data) {
        var ix, ixLen,
            statusType,
            rowData = data;

        for (ix=0, ixLen=rowData.rows.length; ix<ixLen; ix++){

            statusType = rowData.rows[ix][3] + ' / ' + rowData.rows[ix][4];

            this.detailListGrid.addRow([
                 rowData.rows[ix][ 0]                            // 'time'
                ,rowData.rows[ix][ 1]                            // 'ws_name'
                ,rowData.rows[ix][ 2]                            // 'txn_name'
                ,statusType                                      // 'status/type'
                ,rowData.rows[ix][ 5]                            // 'start_time'
                ,rowData.rows[ix][ 6]                            // 'elapse_time'
                ,common.Util.hexIpToDecStr(rowData.rows[ix][7])  // 'client_ip'
                ,rowData.rows[ix][ 8]                            // 'ws_id'
                ,rowData.rows[ix][ 9]                            // 'tid'
                ,rowData.rows[ix][10]                            // 'txn_id',
                ,rowData.rows[ix][3]                             // 'http_status',
                ,rowData.rows[ix][11]                            // 'raw_time'
            ]);
        }
    },

    setFilterGridData: function(cnt, from, to) {
        var ix, ixLen,
            time, elapse,
            statusType,
            filterCnt;


        filterCnt = cnt;

        for (ix=0, ixLen=this.allDetailGridData.rows.length; ix<ixLen; ix++) {

            time = +new Date(this.allDetailGridData.rows[ix][0]).setMilliseconds(0);
            elapse = this.allDetailGridData.rows[ix][6]*1000;
            statusType = this.allDetailGridData.rows[ix][3] + ' / ' + this.allDetailGridData.rows[ix][4];

            if ((time >= from && time <= to && elapse >=  this.minElapse && elapse <= this.maxElapse)) {
                filterCnt += 1;

                this.detailListGrid.addRow([
                     this.allDetailGridData.rows[ix][ 0]                            // 'time'
                    ,this.allDetailGridData.rows[ix][ 1]                            // 'ws_name'
                    ,this.allDetailGridData.rows[ix][ 2]                            // 'txn_name'
                    ,statusType                                                     // 'status/type'
                    ,this.allDetailGridData.rows[ix][ 5]                            // 'start_time'
                    ,this.allDetailGridData.rows[ix][ 6]                            // 'elapse_time'
                    ,common.Util.hexIpToDecStr(this.allDetailGridData.rows[ix][7])  // 'client_ip'
                    ,this.allDetailGridData.rows[ix][ 8]                            // 'ws_id'
                    ,this.allDetailGridData.rows[ix][ 9]                            // 'tid'
                    ,this.allDetailGridData.rows[ix][10]                            // 'txn_id',
                    ,this.allDetailGridData.rows[ix][3]                             // 'http_status',
                    ,this.allDetailGridData.rows[ix][11]                            // 'raw_time'
                ]);
            }
        }

        return filterCnt;
    },

    addRowTxnGrid: function(data) {
        var ix, ixLen, ws_cnt, ws_avg;

        for(ix=0, ixLen=data.rows.length; ix<ixLen; ix++) {

            ws_cnt = +data.rows[ix][6] || 0.000;
            ws_avg = !ws_cnt ? 0.000 : ((data.rows[ix][4] || 0.000) / ws_cnt) || 0.000;

            this.txnGrid.addRow([
                  data.rows[ix][2]             // txn_name
                , (data.rows[ix][5] || 0.000)  // wsm
                , ws_avg                       // ws_avg
                , (+data.rows[ix][6] || 0.000) // wsc
            ]);
        }

    },

    mergeTxnSummaryData: function(data) {
        var ix, ixLen, jx, jxLen;
        var tempAddData = [];
        var tempData;
        var isContainData;

        for (ix=0, ixLen=this.tempTxnGridRows.length; ix < ixLen; ix++) {
            isContainData = false;
            tempData = this.tempTxnGridRows[ix];

            for (jx=0, jxLen=data.rows.length-1; jx<=jxLen; jx++) {
                if (tempData[2] === data.rows[jx][2]) {
                    isContainData = true;

                    data.rows[jx][4] = +data.rows[jx][4] + +tempData[4];
                    data.rows[jx][5] = Math.max(data.rows[jx][5], tempData[5]);
                    data.rows[jx][6] = +data.rows[jx][6] + +tempData[6];
                }
            }

            if (!isContainData) {
                tempAddData[tempAddData.length] = tempData.concat();
            }
        }
        data.rows = Ext.Array.merge(data.rows, tempAddData);
    },

    retrieveReTxnSummary: function() {
        var time_zone;

        if (this.autoRetrieveRange !== null) {
            this.detailListGrid.setLoading(true);
        }

        this.detailListGrid.loadingMask.showMask();
        this.bottomCont.loadingMask.showMask();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);


        time_zone = new Date().getTimezoneOffset() * 1000 * 60;
        if (time_zone > 0) {
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: this.sql.detailListGrid_Re_Txn,
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }],
            replace_string: [{
                name: 'wsId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'httpStatus', value: this.getHttpStatusList()
            }, {
                name: 'httpType', value: this._httpTypeRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value:  this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
            }]
        }, this.onReGridData, this);
    },

    retrieveTxnChart: function(record){
        if (!record) {
            return;
        }

        var full_from_time,
            full_to_time;

        full_from_time = common.Util.getDateFormat(this.fromTime) + ' 00:00:00';
        full_to_time   = common.Util.getDateFormat(this.fromTime) + ' 23:59:59';


        WS2.SQLExec({
            sql_file: this.sql.txnChart,
            bind    : [
                {name: 'fromtime', value: full_from_time, type: SQLBindType.STRING},
                {name: 'totime'  , value: full_to_time, type: SQLBindType.STRING},
                {name: 'txn_id'  , value: record.raw.txn_id, type: SQLBindType.STRING},
                {name: 'ws_id'  , value: record.raw.ws_id, type: SQLBindType.INTEGER}
            ]
        }, this.onBotData, this);
    },


    addColumnTxnGrid: function() {
        this.txnGrid.gridName = 'pa_web_trend_etoe_gridName';

        this.txnGrid.beginAddColumns();
        this.txnGrid.addColumn(common.Util.CTR('Transaction Name'),  'txn',    300,  Grid.String, true, false);
        this.txnGrid.addColumn(common.Util.CTR('WebServer (MAX)'),   'ws_max', 135,  Grid.Float,  true, false);
        this.txnGrid.addColumn(common.Util.CTR('WebServer (AVG)'),   'ws_avg', 135,  Grid.Float,  true, false);
        this.txnGrid.addColumn(common.Util.CTR('WebServer (Count)'), 'ws_cnt', 135,  Grid.Number, true, false);
        this.txnGrid.endAddColumns() ;

        this.txnGrid.loadLayout(this.txnGrid.gridName);
    },

    setToggleSlide: function(state){
        if(!state) {
            this.txnNameField.setValue('%');
            this.httpTypeField.setValue('%');
            this.cbxHttpStatus.selectRow(0);
            this.tidField.setValue('');
            this.ipField.setValue('%');
            if (!this.exceptionToggle.getValue()){
                this.exceptionToggle.toggle();
            }
        }
    },

    getHttpStatusList: function() {

        var ix,ixLen,
            statusVal = '', tmpStatusArr;


        if(this.cbxHttpStatus.rawValue === common.Util.TR('(All)')) {
            statusVal = '';
        }
        else {
            tmpStatusArr = this.cbxHttpStatus.getValue();
            statusVal += 'and ( ';

            for(ix=0, ixLen=tmpStatusArr.length; ix<ixLen; ix++) {
                statusVal += '(http_status >= ' + tmpStatusArr[ix] + ' and http_status <= ' + (tmpStatusArr[ix]+99)+')';
                if(ix < tmpStatusArr.length -1) {
                    statusVal += ' or ';
                }
            }
            statusVal += ' )';
        }

        return statusVal;
    }
});
