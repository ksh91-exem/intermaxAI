Ext.define('view.CDResponseInspector', {
    extend: 'Exem.TxnTrendBaseForm',
    title: '',
    sql : {
        elapseTimeScatter     : 'IMXPA_CDResponseInspector_Scatter.sql',
        detailListGrid        : 'IMXPA_CDResponseInspector_GridList_paging.sql',
        detailListGrid_Re     : 'IMXPA_CDResponseInspector_GridList_paging_re.sql',
        detailListGrid_Re_Txn : 'IMXPA_CDResponseInspector_GridList_paging_re_txn.sql',
        txnChart              : 'IMXPA_CDResponseInspector_txn_chart.sql'
    },
    innerInit: function() {
        this.createLayoutDetailCond();
        this.addColumnDetailGrid();
        this.setContextMenuDetailGrid();
    },

    createLayoutDetailCond: function() {
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

        this.tidField = Ext.create('Exem.TextField', {
            fieldLabel: 'TID',
            labelWidth: 80,
            x: 415,
            y: 40,
            width: 250,
            value: '',
            defaultEmptyText: '',
            maxLength: 300,
            maskRe :  /^[-]?[0-9]*$/
        });

        this.txnCodeField = Ext.create('Exem.TextField', {
            itemId     : 'txnCodeField',
            fieldLabel : common.Util.CTR('Transaction Code'),
            labelWidth : 120,
            x          : 671,
            y          : 40,
            width      : 280,
            value      : '%',
            maxLength  : 300
        });

        this.gidField = Ext.create('Exem.TextField', {
            fieldLabel: 'GUID',
            labelWidth: 80,
            x: 960,
            y: 40,
            width: 195,
            value: '%',
            maxLength: 300
        });
        this.conditionArea.add([this.txnNameField, this.tidField, this.txnCodeField,this.gidField]);

    },

    addColumnDetailGrid : function() {
        if (!this.detailListGrid) {
            this.detailListGrid = this.addDetailGrid();
            this.detailListGrid.gridName = 'pa_cd_trend_detail_gridName';
            this.gridBox.add(this.detailListGrid);
        }

        var microElapse = common.Util.CTR('Elapsed Time') + ' (' + decodeURI('%C2%B5') + 's)';

        this.detailListGrid.beginAddColumns();
        this.detailListGrid.addColumn(common.Util.CTR('Time'),                   'time',           115, Grid.DateTime, true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Agent'),                  'was_name',       130, Grid.String,   true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Transaction Name'),       'txn_name',       300, Grid.String,   true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Transaction Code'),       'txn_code',       150, Grid.String,   true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Start Time'),             'start_time',     120, Grid.DateTime, true,  false);
        this.detailListGrid.addColumn(microElapse,                               'txn_elapse_us',  140, Grid.Number,   true,  false);
        this.detailListGrid.addColumn(common.Util.CTR('Exception'),              'exception_type', 150, Grid.String,   true,  false);
        this.detailListGrid.addColumn('WAS ID',                                  'was_id',         135, Grid.Number,   false, true);
        this.detailListGrid.addColumn('TID',                                     'tid',            155, Grid.String,   false, false);
        this.detailListGrid.addColumn('TXN ID',                                  'txn_id',         135, Grid.String,   false, true);
        this.detailListGrid.addColumn('Exception Count',                         'exception',      65,  Grid.Number,   false, true);
        this.detailListGrid.addColumn(common.Util.CTR('GUID'),                   'guid',           155, Grid.String,   true, false);
        this.detailListGrid.endAddColumns();

        this.detailListGrid.loadLayout(this.detailListGrid.gridName);

        this.detailListGrid.addRenderer('exception_type', this.exceptionRenderer.bind(this) , RendererType.bar);
        this.detailListGrid.setOrderAct('txn_elapse_us', 'DESC');
    },

    exceptionRenderer: function(value, meta, record) {
        var customCellDOM;

        if (record.data.exception > 0 && meta.column.dataIndex == 'exception_type') {
            meta.style = 'background-color:lightcoral;';
        }

        customCellDOM = '<div data-qtip="' + value + '">' + value + '</div>';

        return customCellDOM;
    },

    setContextMenuDetailGrid : function() {
        var self = this;

        this.detailListGrid.itemdblclick = function(_this, record) {
            self.openTxnDetail(record.data);
        };

        this.detailListGrid.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),
            fn: function() {
                self.openTxnDetail(this.up().record);
            }
        }, 0);
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
            this.minElapse = this.minElapseField.getValue();

            if (this.maxElapseField.getValue() == common.Util.TR('infinite')) {
                maxElapse = 'infinite';
            } else {
                maxElapse = this.maxElapseField.getValue();
            }

            tmpTxnName = this.txnNameField.value;
            if (tmpTxnName.indexOf(']') > 0) {
                tmpTxnName = tmpTxnName.substr(tmpTxnName.indexOf(']') + 2, tmpTxnName.length);
            }

            this.setRetrieveRange({
                timeRange   : [new Date(self.datePicker.mainFromField.getValue()), new Date(self.datePicker.mainToField.getValue())],
                elapseRange : [self.minElapseField.getValue(), maxElapse],
                txnName     : [ tmpTxnName ]
            });

            this.init_elapse_min = self.minElapseField.getValue();
            this.init_elapse_max = Number(self.maxElapseField.getValue() );

            if (typeof this.liveScatter !== 'undefined') {
                this.liveScatter.lastRetrievedRange = null;
            }

            var txnName = this.txnNameField.getValue(),
                chkException = this.exceptionToggle.getValue(),
                gid = this.gidField.getValue(),
                tid = this.tidField.getValue(),
                txnCode = this.txnCodeField.getValue();


            if (txnName == '%') {
                this._txnNameRepl = '';
            } else {
                this._txnNameRepl = 'AND e.txn_id in (SELECT n.txn_id ' +
                    'FROM   xapm_txn_name n left outer join  xapm_txn_name_ext e ON  n.txn_name = e.txn_name ' +
                    'WHERE   n.txn_name LIKE \'' + txnName + '\' OR e.txn_name_ext LIKE \'' + txnName + '\' )';
            }

            if (chkException) {
                this._exceptionRepl = '';
            } else {
                this._exceptionRepl = 'AND exception > 0 ';
            }

            if (gid == '%') {
                this._gidRepl = '';
            } else {
                this._gidRepl = 'AND guid LIKE \'' + gid + '\'';
            }
            if (!tid) {
                this._tidRepl = '';
            } else {
                this._tidRepl = 'AND e.tid = ' + tid;
            }

            if (txnCode == '%') {
                this._txnCodeRepl = '';
            } else {
                this._txnCodeRepl = 'AND tx_code like \'' + txnCode + '\'';
            }
        } else {
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string') {
                console.warn('message :', result);
            }
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;

            return;
        }

        result = this.datePicker.checkValid();

        if (!result) {
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string') {
                console.warn('');
            }

            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;

        } else {
            this.setTitleWithTimeRange();
            this.executeSQL();
        }
    },

    executeSQL: function() {
        var self = this;

        this.retrieve_click = true;
        this.init_time = null;
        this.bottomTab.setActiveTab(0);
        this.bottomTab.tabBar.items.items[1].setVisible(false);
        this.bottomTab.tabBar.items.items[2].setVisible(false);
        this.completeScatterSqlExec = false;
        this.completeGridListSqlExec = false;

        this.retrieveScatter();

        if (!this.chartToggle.getValue()) {
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

        setTimeout(function() {
            if (self.autoRetrieveRange == null) {
                return;
            }

            if (self.autoRetrieveRange.wasName == 'All') {
                self.wasField.selectByIndex(0);
            } else {
                self.wasField.selectByValues(self.autoRetrieveRange.wasName);
            }
        },500);
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
                name: 'wasId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            },{
                name: 'gid', value: this._gidRepl
            },{
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'txnCode', value: this._txnCodeRepl
            }]
        }, this.onScatterData, this);
    },

    onScatterData: function(header, data) {
        if (this.isClosed) {
            return;
        }

        this.detailScatter.fromTime = new Date(this.fromTime);
        this.detailScatter.toTime =   new Date(this.toTime);

        this.detailScatter.lastSelectRange = {invMinX : null, invMaxX : null, invMinY : null, invMaxY : null};

        this.isChartDataVisible = (this.detailScatter.target.getWidth() > 0);

        this.detailScatter.draw(data.rows, this.scatterWidth, this.scatterHeight);
        this.detailScatterBox.setLoading(false);
        this.detailScatterBox.loadingMask.hide();

        this.completeScatterSqlExec = true;
        this.selectToFirstRow();

        if (this.chartToggle.getValue()) {
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
        if (time_zone > 0) {
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
                name: 'wasId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value:  this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
            }, {
                name: 'txnCode', value: this._txnCodeRepl
            }]
        }, this.onGridData, this);
    },

    retrieveReGrid: function() {
        var time_zone;

        if (this.autoRetrieveRange !== null) {
            this.detailListGrid.setLoading(true);
        }

        this.detailListGrid.loadingMask.showMask();
        this.detailListGrid.down('#grid_detail_list_more_btn').setDisabled(true);
        this.detailListGrid.down('#grid_detail_list_fetch_all').setDisabled(true);


        time_zone = new Date().getTimezoneOffset() * 1000 * 60;
        if (time_zone > 0) {
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
            }, {
                name: 'msFromTime', value: this.msFromTime, type: SQLBindType.STRING
            }, {
                name: 'msToTime', value: this.msToTime, type: SQLBindType.STRING
            }],
            replace_string: [{
                name: 'wasId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'offset', value:  this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
            }, {
                name: 'txnCode', value: this._txnCodeRepl
            }]
        }, this.onReGridData, this);
    },

    addRowDetailGrid: function(data) {
        var ix, ixLen,
            exceptionType,
            rowData = data;

        for (ix = 0, ixLen = rowData.rows.length; ix < ixLen; ix++) {

            exceptionType = this.exceptionTypeProc(rowData.rows[ix]);

            this.detailListGrid.addRow([
                rowData.rows[ix][0]                            // 'time'
                ,rowData.rows[ix][1]                            // 'was_name'
                ,rowData.rows[ix][2]                            // 'txn_name'
                ,rowData.rows[ix][10]                           //  'transaction_code' caution index.
                ,rowData.rows[ix][3]                            // 'start_time'
                ,rowData.rows[ix][4]                            // 'txn_elapse_us'
                ,exceptionType
                ,rowData.rows[ix][5]                            // 'was_id'
                ,rowData.rows[ix][6]                            // 'tid'
                ,rowData.rows[ix][7]                            // 'txn_id'
                ,rowData.rows[ix][8]                            // 'exception_count'
                ,rowData.rows[ix][11]                            // 'guid'

            ]);
        }
    },

    setFilterGridData: function(cnt, from, to) {
        var ix, ixLen,
            time, elapse,
            exceptionType,
            filterCnt;


        filterCnt = cnt;

        for (ix = 0, ixLen = this.allDetailGridData.rows.length; ix < ixLen; ix++) {

            exceptionType = this.exceptionTypeProc(this.allDetailGridData.rows[ix]);
            time = +new Date(this.allDetailGridData.rows[ix][0]).setMilliseconds(0);
            elapse = this.allDetailGridData.rows[ix][4];

            if ((time >= from && time <= to && elapse >=  this.minElapse && elapse <= this.maxElapse)) {
                filterCnt += 1;

                this.detailListGrid.addRow([
                    this.allDetailGridData.rows[ix][0]                            // 'time'
                    ,this.allDetailGridData.rows[ix][1]                            // 'was_name'
                    ,this.allDetailGridData.rows[ix][2]                            // 'txn_name'
                    ,this.allDetailGridData.rows[ix][10]                           //  'transaction_code' caution index.
                    ,this.allDetailGridData.rows[ix][3]                            // 'start_time'
                    ,this.allDetailGridData.rows[ix][4]                            // 'txn_elapse_us'
                    ,exceptionType
                    ,this.allDetailGridData.rows[ix][5]                            // 'was_id'
                    ,this.allDetailGridData.rows[ix][6]                            // 'tid'
                    ,this.allDetailGridData.rows[ix][7]                            // 'txn_id'
                    ,this.allDetailGridData.rows[ix][8]                            // 'exception_count'
                    ,this.allDetailGridData.rows[ix][11]                            // 'guid'

                ]);
            }
        }

        return filterCnt;
    },



    addRowTxnGrid: function(data) {
        var ix, ixLen, was_cnt, was_avg;

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {

            was_cnt = +data.rows[ix][6] || 0.000;
            was_avg = !was_cnt ? 0.000 : ((data.rows[ix][4] || 0.000) / was_cnt) || 0.000;

            this.txnGrid.addRow([
                data.rows[ix][2]             // txn_name
                , (+data.rows[ix][5] || 0.000)  // wsm
                , was_avg                       // ws_avg
                , (+data.rows[ix][6] || 0.000) // wsc
            ]);
        }
        // C deamon에서 스펙상 비율 필요없어서 일단 주석으로 해놓음  PJY
    /*     var total_time, retText,
            was_avg, remote_avg, db_avg, was_cnt, remote_cnt, db_cnt,
            was_ratio, remote_ratio, db_ratio,
            ix, ixLen;

        for(ix=0, ixLen=_data.rows.length; ix<ixLen; ix++) {

            was_cnt    = +_data.rows[ix][6] || 0.000;
            remote_cnt = _data.rows[ix][9]  || 0.000;
            // db_cnt     = _data.rows[ix][12] || 0.000;

            was_avg    = !was_cnt ? 0.000 : ((_data.rows[ix][4] || 0.000) / was_cnt) || 0.000;
            remote_avg = !remote_cnt ? 0.000 : ((_data.rows[ix][7] || 0.000) / remote_cnt) || 0.000;
            // db_avg     = !db_cnt ? 0.000 : ((_data.rows[ix][10] || 0.000) / db_cnt) || 0.000;

            was_ratio    = was_avg - (remote_avg + db_avg) < 0 ? 0.000 : was_avg - (remote_avg + db_avg);
            remote_ratio = remote_avg < 0 ? 0.000 : remote_avg;
            // db_ratio     = db_avg < 0 ? 0.000 : db_avg;

            total_time = was_ratio + remote_ratio // + db_ratio ;

            was_ratio    = total_time > 0 ? ((was_ratio / total_time) * 100).toFixed(3) : 0.000;
            remote_ratio = total_time > 0 ? ((remote_ratio / total_time) * 100).toFixed(3) : 0.000;
            // db_ratio     = total_time > 0 ? ((db_ratio / total_time) * 100).toFixed(3) : 0.000;

            retText = was_ratio + '/' + remote_ratio // + '/' + db_ratio;

            this.txnGrid.addRow([
                (_data.rows[ix][2] || 0.000)   //'txn'
                , retText                        //'chart'
                , (_data.rows[ix][5] || 0.000)   //'wasm'
                , was_avg                        //'was avg'
                , (_data.rows[ix][6] || 0.000)   //'wasc'
                , (_data.rows[ix][8] || 0.000)   //'rm'
                , remote_avg                     //'r avg'
                , (_data.rows[ix][9] || 0.000)   //'rc'

            ]) ;

*/

    },

    mergeTxnSummaryData: function(data) {
        var ix, ixLen, jx, jxLen;
        var tempAddData = [];
        var tempData;
        var isContainData;

        for (ix = 0, ixLen = this.tempTxnGridRows.length; ix < ixLen; ix++) {
            isContainData = false;
            tempData = this.tempTxnGridRows[ix];

            for (jx = 0, jxLen = data.rows.length - 1; jx <= jxLen; jx++) {
                if (tempData[2] === data.rows[jx][2]) {
                    isContainData = true;
                    // txn_elapse
                    data.rows[jx][4] = +data.rows[jx][4] + +tempData[4];
                    data.rows[jx][5] = Math.max(data.rows[jx][5], tempData[5]);
                    data.rows[jx][6] = +data.rows[jx][6] + +tempData[6];

                    // sql_elapse
                    data.rows[jx][7] = +data.rows[jx][7] + +tempData[7];
                    data.rows[jx][8] = Math.max(data.rows[jx][8], tempData[8]);
                    data.rows[jx][9] = +data.rows[jx][9] + +tempData[9];

                    // txn_cpu_time
                    data.rows[jx][10] = +data.rows[jx][10] + +tempData[10];
                    data.rows[jx][11] = Math.max(data.rows[jx][11], tempData[11]);
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
            }, {
                name: 'msFromTime', value: this.msFromTime, type: SQLBindType.STRING
            }, {
                name: 'msToTime', value: this.msToTime, type: SQLBindType.STRING
            }],
            replace_string: [{
                name: 'wasId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'offset', value:  this.limitData
            }, {
                name: 'offset2', value: (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') ? this.limitFrom : ''
            }, {
                name: 'txnCode', value: this._txnCodeRepl
            }]
        }, this.onReGridData, this);
    },

    retrieveTxnChart: function(record) {
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
                {name: 'was_id'  , value: record.raw.was_id, type: SQLBindType.INTEGER}
            ]
        }, this.onBotData, this);
    },

    retrieveCallTree: function(record) {
        if (!record) {
            return;
        }

        this.bottomCont.loadingMask.show();

        WS2.StoredProcExec({
            stored_proc: 'txn_detail',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: record.raw.tid
            },{
                name: 'start_time',
                type: SQLBindType.STRING,
                value: Ext.Date.format(new Date(record.raw.start_time), 'Y-m-d H:i:s')
            },{
                name: 'end_time',
                type: SQLBindType.STRING,
                value: Ext.Date.format(new Date(record.raw.time), 'Y-m-d H:i:s')
            }]
        }, this.onBotData, this);
    },

    addColumnTxnGrid: function() {
        this.txnGrid.gridName = 'pa_tp_trend_etoe_gridName';

        this.txnGrid.beginAddColumns();
        this.txnGrid.addColumn(common.Util.CTR('Transaction'),       'txn',        300, Grid.String, true, false);
        this.txnGrid.addColumn(common.Util.CTR('Agent (MAX)'),       'agent_max',  135, Grid.Number, true, false);
        this.txnGrid.addColumn(common.Util.CTR('Agent (AVG)'),       'agent_avg',  135, Grid.Float,  true, false);
        this.txnGrid.addColumn(common.Util.CTR('Agent (Count)'),     'agent_cnt',  135, Grid.Number, true, false);

        this.txnGrid.endAddColumns();

        this.txnGrid.loadLayout(this.txnGrid.gridName);
    },

    addColumnCallTree: function() {
        var microElapse = common.Util.CTR('Elapsed Time') + ' (' + decodeURI('%C2%B5') + 's)';

        this.callTree.beginAddColumns();
        this.callTree.addColumn('Level',                                   'lvl',               100, Grid.String,   false, true );
        this.callTree.addColumn('WASID',                                   'was_id',            30,  Grid.String,   false, true );
        this.callTree.addColumn('WAS Name',                                'was_name',          50,  Grid.String,   false, true );
        this.callTree.addColumn('Method ID',                               'method_id',         100, Grid.String,   false, false);
        this.callTree.addColumn('CRC',                                     'crc',               50,  Grid.Number,   false, true );
        this.callTree.addColumn(common.Util.CTR('Trace'),                  'trace',             200, Grid.String,   true , false, 'treecolumn');
        this.callTree.addColumn('Calling Method ID',                       'calling_methid_id', 50,  Grid.String,   false, true );
        this.callTree.addColumn('Calling CRC',                             'calling_crc',       50,  Grid.String,   false, true );
        this.callTree.addColumn(common.Util.CTR('Execute Count'),          'exec_count',        100, Grid.Number,   true,  false);
        this.callTree.addColumn(microElapse,                               'elapsed_time',      100, Grid.Number,   true,  false);
        this.callTree.addColumn(common.Util.CTR('Exception Count'),        'err_count',         100, Grid.Number,   true,  false);
        this.callTree.addColumn(common.Util.CTR('Elapse Time Ratio'),      'elapse_ratio',      100, Grid.Number,   true,  false);
        this.callTree.addColumn(common.Util.CTR('Method Type'),            'method_type',       150, Grid.String,   true,  false);
        this.callTree.addColumn('SEQ',                                     'methid_seq',        30,  Grid.Number,   false, false);
        this.callTree.addColumn('Level ID',                                'level_id',          30,  Grid.Number,   false, false);
        this.callTree.addColumn('HOST NAME',                               'host_name',         30,  Grid.String,   false, true );
        this.callTree.addColumn('TID',                                     'tid',               50,  Grid.String,   false, false);
        this.callTree.addColumn(common.Util.CTR('CPU TIME'),               'cpu_time',          50,  Grid.Float,    true,  false);
        this.callTree.addColumn('time',                                    'time',              50,  Grid.DateTime, false, true );

        this.callTree.addRenderer('elapse_ratio', this.callTreeRenderer.bind(this), RendererType.bar);
        this.callTree.endAddColumns();
    },

    addRowCallTree: function(parent, data) {
        this.callTree.addNode( parent,
            [   data[ 0]       //lvl
                ,data[ 1]       //was_id
                ,data[ 2]       //was_name
                ,data[ 3]       //method_id
                ,data[ 4]       //crc
                ,data[ 6]       //trace
                ,data[ 7]       //calling_method_id
                ,data[ 8]       //calling_crc
                ,data[10]       //exec_count
                ,data[21]       //elase_time
                ,data[ 9]       //err_count
                ,data[22]       //elapse_ratio
                ,Common.fn.codeBitToMethodTypeCD(data[13])  //method_type
                ,data[14]       //seq
                ,data[15]       //level_id
                ,data[16]       //host_name
                ,data[17]       //tid
                ,data[18]       //cpu_time
                ,data[20]       //time
            ]);
    },

    setToggleSlide: function(state) {
        if (!state) {
            this.txnNameField.setValue('%');
            this.tidField.setValue('');
            if (!this.exceptionToggle.getValue()) {
                this.exceptionToggle.toggle();
            }
        }
    },

    openTxnDetail: function(record) {
        var txnView = Ext.create('view.TransactionDetailView',{
            title : 'CD' + common.Util.TR('Transaction Detail'),
            endTime: record.time,
            wasId: record.was_id,
            name: record.was_name,
            txnName: record.txn_name,
            tid: record.tid,
            startTime: record.start_time,
            elapseTime : record.txn_elapse_us,
            gid: record.gid,
            monitorType : this.monitorType,
            socket: WS
        });

        var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
        mainTab.add(txnView);
        mainTab.setActiveTab(mainTab.items.length - 1);
        txnView.init();
    },

    exceptionTypeProc: function(data) {
        var retExceptionText = '',
            exceptionCnt = data[8],
            exceptionType = data[9];

        if (exceptionCnt > 0 && exceptionType == '') {
            retExceptionText = 'UnCaught Exception';
        } else {
            retExceptionText = exceptionType;
        }


        return retExceptionText;
    }


});
