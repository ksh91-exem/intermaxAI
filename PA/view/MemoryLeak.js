/**
 * Created by jykim on 2017-03-06.
 */
Ext.define('view.MemoryLeak', {
    extend: 'Exem.FormOnCondition',
    width: '100%',
    height: '100%',

    DisplayTime: DisplayTimeMode.HM,

    style: {
        background: '#cccccc'
    },

    sql: {
        chart: 'IMXPA_Memory_Leak_Chart.sql',
        collection: 'IMXPA_Memory_Leak_Collection.sql',
        session: 'IMXPA_Memory_Leak_Session.sql'
    },

    initProperty: function () {
        this.chartDatas = [];
        this.chartList = [];
        this.conditionInfo = {};

        this.indicatorTime = 0;
        this.selectedSqlId = '';
    },

    init: function () {
        this.initProperty();

        this.createTopLayout();
        this.createMidLayout();
        this.createBotLayout();
    },

    createTopLayout: function () {
        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            itemId: 'wasCombo',
            width: 300,
            comboWidth: 200,
            comboLabelWidth: 60,
            addSelectAllItem: false,
            selectType: common.Util.TR('Agent'),
            x: 380,
            y: 5
        });

        this.className = Ext.create('Exem.TextField', {
            fieldLabel: common.Util.TR('Class Name'),
            labelAlign: 'right',
            labelWidth: 150,
            allowBlank: false,
            value: '%',
            width: 450,
            x: 590,
            y: 5
        });

        this.elementCount = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Element Count >='),
            labelAlign: 'right',
            labelWidth: 150,
            labelSeparator: '',
            allowBlank: false,
            value: 200,
            width: 232,
            x: 1040,
            y: 5,
            maxLength: 10,
            maxValue: 2147483647,
            minValue: 0,
            enforceMaxLength: true,
            enableKeyEvents: true
        });

        this.conditionArea.add(this.wasCombo, this.className, this.elementCount);
    },

    createMidLayout: function () {
        this.setWorkAreaLayout('border');

        this.midPanel = Ext.create('Exem.Panel', {
            title: common.Util.TR('Element Count Trend'),
            region: 'center',
            layout: 'vbox',
            flex: 1,
            split: true,
            style: 'borderRadius : 6px;',
            autoScroll: true
        });

        this.workArea.add(this.midPanel);
    },

    checkSessionGrid: function(record, grid, cellIndex) {
        var curColumn = grid.headerCt.gridDataColumns[cellIndex].dataIndex,
            baseGrid = this.sessionGrid,
            sqlId;

        switch (curColumn){
            case 'sql_text1':
                sqlId = record['sql_id1'];
                break;

            case 'sql_text2':
                sqlId = record['sql_id2'];
                break;

            case 'sql_text3':
                sqlId = record['sql_id3'];
                break;

            case 'sql_text4':
                sqlId = record['sql_id4'];
                break;

            case 'sql_text5':
                sqlId = record['sql_id5'];
                break;

            default :
                sqlId = '';
                break;
        }

        this.selectedSqlId = sqlId;

        if(sqlId) {
            baseGrid.contextMenu.setDisableItem(2, true);
            baseGrid.contextMenu.setDisableItem(3, true);
        }
        else {
            baseGrid.contextMenu.setDisableItem(2, false);
            baseGrid.contextMenu.setDisableItem(3, false);
        }

        if(record['tid'] && record['txn_name']){
            baseGrid.contextMenu.setDisableItem(0, true);
            baseGrid.contextMenu.setDisableItem(1, true);
        }
        else {
            baseGrid.contextMenu.setDisableItem(0, false);
            baseGrid.contextMenu.setDisableItem(1, false);
        }
    },

    checkCollectionGrid: function(record) {
        var grid = this.collectionGrid;

        if(record['tid'] && record['txn_name']){
            grid.contextMenu.setDisableItem(0, true);
        }
        else {
            grid.contextMenu.setDisableItem(0, false);
        }

        if(record['confirm'] === 'Y') {
            grid.contextMenu.setDisableItem(1, true);
        }
        else {
            grid.contextMenu.setDisableItem(1, false);
        }
    },

    openTxnDetail: function(record) {
        var txnView = Ext.create('view.TransactionDetailView',{
            startTime : record['start_time_temp'],
            endTime: common.Util.getDate(record['end_time']),
            wasId: record['was_id'],
            name: record['agent'],
            txnName: record['txn_name'],
            tid: record['tid'],
            elapseTime: record['elapse_time'],
            socket: WS
        });

        var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
        mainTab.add(txnView);
        mainTab.setActiveTab(mainTab.items.length - 1);
        txnView.init();
    },

    openTxnHistory: function(record) {
        var txnHistory = common.OpenView.open('TxnHistory', {
            fromTime:  Ext.util.Format.date(record['end_time'], Comm.dateFormat.HM),
            toTime:  Ext.util.Format.date(common.Util.getDate(+new Date(record['end_time']) + 600000), Comm.dateFormat.HM), //+10M
            transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name']),
            wasId: record['was_id']
        });

        setTimeout(function (){
            txnHistory.executeSQL();
        }, 300);
    },

    openSQLHistory: function(record) {
        var sqlHistory = common.OpenView.open('SQLHistory', {
            isWindow: false,
            width: 1200,
            height: 800,
            fromTime: this.conditionInfo.fromTime,
            toTime: this.conditionInfo.toTime,
            transactionNameTF: common.Util.cutOffTxnExtName(record['txn_name']),
            sqlIdTF: this.selectedSqlId,
            wasId : record['was_id']
        });

        setTimeout(function(){
            sqlHistory.executeSQL();
        }, 300);
    },

    openFullText: function(record) {
        var sqlTextWindow = Ext.create('view.FullSQLText_TOP10');

        sqlTextWindow.arr_dt['sql_id']    = this.selectedSqlId;
        sqlTextWindow.arr_dt['txn_id']    = record['txn_id'];
        sqlTextWindow.arr_dt['was_id']    = record['was_id'];
        sqlTextWindow.arr_dt['from_time'] = Ext.util.Format.date(this.conditionInfo.fromTime, 'Y-m-d H:i') + ':00';
        sqlTextWindow.arr_dt['to_time']   = Ext.util.Format.date(this.conditionInfo.toTime, 'Y-m-d H:i') + ':59';
        sqlTextWindow.loading_grd         = this.sessionGrid;
        sqlTextWindow.init();
    },

    openStackTrace: function(record) {
        var traceView = Ext.create('Exem.MemoryLeakStackTraceView');

        traceView.data = record;
        traceView.init();
    },

    addGrid: function (tabPanel, title) {
        var self = this,
            panel, grid;
        panel = Ext.create('Exem.Panel', {
            title: title,
            layout: 'vbox',
            width: '100%',
            flex: 1,
            isInit: false
        });

        grid = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            width: '100%',
            height: '100%'
        });

        grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),
            fn: function(){
                self.openTxnDetail(this.up().record);
            }
        }, 0);

        if(title === common.Util.TR('Active Session')) {
            grid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record) {
                this.checkSessionGrid(record.data, me, cellIndex);
            }.bind(this));

            grid.contextMenu.addItem({
                title: common.Util.TR('Transaction Summary'),
                fn: function(){
                    self.openTxnHistory(this.up().record);
                }
            }, 1);

            grid.contextMenu.addItem({
                title: common.Util.TR('SQL Summary'),
                fn: function(){
                    self.openSQLHistory(this.up().record);
                }
            }, 2);

            grid.contextMenu.addItem({
                title: common.Util.TR('Full SQL Text'),
                fn: function(){
                    self.openFullText(this.up().record);
                }
            }, 3);
        }
        else {
            grid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record) {
                this.checkCollectionGrid(record.data);
            }.bind(this));

            grid.contextMenu.addItem({
                title : common.Util.TR('StackTrace View'),
                fn: function(){
                    self.openStackTrace(this.up().record);
                }
            }, 1);
        }

        panel.add(grid);
        tabPanel.add(panel);

        return grid;
    },

    addCollectionColumn: function () {
        this.collectionGrid.beginAddColumns();
        this.collectionGrid.addColumn(common.Util.CTR('Agent'), 'agent', 100, Grid.String, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('Class Name'), 'className', 200, Grid.String, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('Instance ID'), 'instanceId', 150, Grid.String, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('Element Count'), 'collectionSize', 100, Grid.Number, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('Limit Exceed Date'), 'createdTime', 150, Grid.DateTime, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('Exceeded Transaction'), 'txn_name', 200, Grid.String, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('Exceeded TID'), 'tid', 100, Grid.String, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('Has Exceeded StackTrace'), 'confirm', 120, Grid.String, true, false);
        this.collectionGrid.addColumn('StackTrace', 'stackTrace', 115, Grid.String, false, true);
        this.collectionGrid.addColumn('Time', 'time', 200, Grid.String, false, true);
        this.collectionGrid.addColumn('Agent ID', 'was_id', 200, Grid.String, false, true);
        this.collectionGrid.addColumn(common.Util.CTR('Start Time'), 'start_time_temp', 200, Grid.String, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('End Time'), 'end_time', 200, Grid.DateTime, true, false);
        this.collectionGrid.addColumn(common.Util.CTR('Elapse Time'), 'elapse_time', 70, Grid.Float, true, false);
        this.collectionGrid.endAddColumns();
    },

    addActiveSessionColumn: function () {
        this.sessionGrid.beginAddColumns();
        this.sessionGrid.addColumn('End Time', 'end_time', 170, Grid.DateTime, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('Agent'), 'agent', 100, Grid.String, true, false);
        this.sessionGrid.addColumn('WAS ID', 'was_id', 100, Grid.String, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('Transaction'), 'txn_name', 150, Grid.String, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Class Method'), 'class_method', 170, Grid.String, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Method Type'), 'method_type', 100, Grid.String, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Client IP'), 'client_ip', 130, Grid.String, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Login Name'), 'login_name', 70, Grid.String, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Start Time'), 'start_time', 70, Grid.String, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Elapse Time (AVG)'), 'avg_elapse', 70, Grid.Float, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('Transaction CPU TIME'), 'txn_cpu_time', 100, Grid.Float, true, false);//10
        this.sessionGrid.addColumn(common.Util.CTR('CPU Time'), 'cpu_time', 70, Grid.Float, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Thread CPU'), 'thread_cpu', 70, Grid.Float, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('IO Read'), 'io_read', 70, Grid.Number, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('IO Write'), 'io_write', 70, Grid.Number, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('DB Time'), 'db_time', 70, Grid.Float, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Wait Time'), 'wait_time', 70, Grid.Float, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('Pool'), 'pool_name', 70, Grid.String, true, false);
        this.sessionGrid.addColumn('Pool ID', 'pool_id', 100, Grid.String, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('Elapse Time'), 'elapse_time', 70, Grid.Float, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Instance Name'), 'instance_name', 70, Grid.String, true, false);//20
        this.sessionGrid.addColumn(common.Util.CTR('SID'), 'sid', 100, Grid.StringNumber, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('State'), 'state', 100, Grid.String, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Bind Value'), 'bind_list', 200, Grid.String, true, false);
        this.sessionGrid.addColumn('SQL ID1', 'sql_id1', 500, Grid.String, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('SQL 1'), 'sql_text1', 70, Grid.String, true, false);
        this.sessionGrid.addColumn('SQL ID2', 'sql_id2', 100, Grid.String, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('SQL 2'), 'sql_text2', 70, Grid.String, true, false);
        this.sessionGrid.addColumn('SQL ID3', 'sql_id3', 100, Grid.String, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('SQL 3'), 'sql_text3', 70, Grid.String, true, false);
        this.sessionGrid.addColumn('SQL ID4', 'sql_id4', 100, Grid.String, false, true);//30
        this.sessionGrid.addColumn(common.Util.CTR('SQL 4'), 'sql_text4', 70, Grid.String, true, false);
        this.sessionGrid.addColumn('SQL ID5', 'sql_id5', 100, Grid.String, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('SQL 5'), 'sql_text5', 70, Grid.String, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('SQL Execution Count'), 'sql_exec_count', 105, Grid.Number, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Fetch Count'), 'fetch_count', 70, Grid.Number, true, false);
        this.sessionGrid.addColumn('Current CRC', 'current_crc', 70, Grid.Number, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('Prepare Count'), 'prepare_count', 70, Grid.Number, true, false);
        this.sessionGrid.addColumn('Transaction ID', 'txn_id', 70, Grid.String, false, true);
        this.sessionGrid.addColumn(common.Util.CTR('PGA Usage (MB)'), 'mem_usage', 100, Grid.Float, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Logical Reads'), 'logical_reads', 100, Grid.Number, true, false);//40
        this.sessionGrid.addColumn(common.Util.CTR('Physical Reads'), 'physical_reads', 100, Grid.Number, true, false);
        this.sessionGrid.addColumn(common.Util.CTR('Wait Info'), 'wait_info', 100, Grid.String, true, false);
        this.sessionGrid.addColumn('TID', 'tid', 100, Grid.String, true, false);
        this.sessionGrid.addColumn('Start Time Temp', 'start_time_temp', 70, Grid.String, false, true);
        this.sessionGrid.endAddColumns();
    },

    createBotLayout: function () {
        this.botPanel = Ext.create('Exem.TabPanel', {
            region: 'south',
            layout: 'vbox',
            height: 300,
            split: true,
            activeTab: 0,
            header: false,
            collapsible: true,
            collapsed: false,
            collapseMode: 'mini',
            style: 'borderRadius : 6px;',
            listeners: {
                scope: this,
                tabchange: function (tabPanel, newCard) {
                    if (!newCard.isInit) {
                        if (newCard.title == common.Util.TR('Active Session')) {
                            this.addActiveSessionColumn();
                        }
                        else {
                            this.addCollectionColumn();
                        }

                        newCard.isInit = true;
                    }

                    if(this.chartList.length){
                        this.executeBottomQuery();
                    }
                }
            }
        });

        this.collectionGrid = this.addGrid(this.botPanel, common.Util.TR('Collection Instances Exceeded Threshold'));
        this.sessionGrid = this.addGrid(this.botPanel, common.Util.TR('Active Session'));

        this.botPanel.setActiveTab(0);

        this.workArea.add(this.botPanel);
    },

    addChart: function (chartData) {
        var self = this,
            ix, ixLen, chart;

        chart = Ext.create('Exem.chart.CanvasChartLayer', {
            minHeight: 100,
            title: chartData.className + ' / ' + chartData.instId,
            interval: PlotChart.time.exTenMin,
            titleHeight: 17,
            titleWidth: 170,
            titleFontSize: '12px',
            showTitle: true,
            showLegend: true,
            showIndicator: true,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip: true,
            toolTipFormat: '%x [value:%y] ',
            toolTipTimeFormat: '%H:%M',
            fillIntervalValue: true,
            chartProperty: {
                yLabelWidth: 55,
                xLabelFont: {size: 8, color: 'black'},
                yLabelFont: {size: 8, color: 'black'},
                xaxis: true
            },
            historyInfoDblClick: function (chart, record) {
                var historyTime;

                historyTime = +new Date(record.data['TIME']);

                self.setIndicatorTIme(historyTime);
                self.moveIndicator();
            },
            plotdblclick: function (event, pos, item, xAxis) {
                if ((pos.x < 0)) {
                    return;
                }

                if (common.Util.getDate(pos.x) < +new Date(self.datePicker.getFromDateTime())
                    ||   common.Util.getDate(pos.x) > +new Date(self.datePicker.getToDateTime())) {
                    return;
                }

                self.setIndicatorTIme(xAxis.x);
                self.moveIndicator();
            }
        });

        chart.addSeries({
            label: common.Util.CTR('Element Count'),
            id: 'collectionSize',
            type: PlotChart.type.exLine,
            point : true
        });

        this.midPanel.add(chart);
        this.chartList.push(chart);

        chart.setChartRange(+new Date(this.conditionInfo.fromTime + ':00'), +new Date(this.conditionInfo.toTime + ':00'));

        for (ix = 0, ixLen = chartData.data.length; ix < ixLen; ix++) {
            chart.addValue(0, chartData.data[ix]);
        }

        chart.setFillData(null);
        chart.plotDraw();
    },

    setChartData: function (data) {
        var ix, ixLen, curClassName, curInstId, rowData, tempData;

        this.chartDatas = [];

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            rowData = data[ix];

            if (ix == 0) {
                curClassName = rowData[2];
                curInstId = rowData[3];

                tempData = {};
                tempData.className = curClassName;
                tempData.instId = curInstId;
                tempData.data = [];
            }

            if (curClassName != rowData[2] || curInstId != rowData[3]) {
                this.chartDatas.push(tempData);

                curClassName = rowData[2];
                curInstId = rowData[3];

                tempData = {};
                tempData.className = curClassName;
                tempData.instId = curInstId;
                tempData.data = [];
            }

            tempData.data.push([+new Date(rowData[0]), +rowData[1]]);
        }

        if (tempData) {
            this.chartDatas.push(tempData);
        }
    },

    setIndicatorTIme: function(time) {
        var firstChart = this.chartList[0];

        if(!firstChart){
            return ;
        }

        if(time) {
            this.indicatorTime = time;
        }
        else {
            if(!this.indicatorTime && firstChart.maxOffSet.x == -1) {
                this.indicatorTime = +new Date(this.conditionInfo.fromTime + ':00');
            }
            else {
                this.indicatorTime = +new Date(firstChart.maxOffSet.x);
            }
        }
    },

    executeBottomQuery: function() {
        var dataSet = {},
            title, fromTime;

        title = this.botPanel.getActiveTab().title;
        if(title === common.Util.TR('Active Session')) {
            dataSet.sql_file = this.sql.session;
        }
        else {
            dataSet.sql_file = this.sql.collection;
        }

        fromTime = Ext.util.Format.date(new Date(this.indicatorTime), 'Y-m-d H:i');

        dataSet.bind = [
            {
                name: 'was_id',
                type: SQLBindType.INTEGER,
                value: this.conditionInfo.wasId
            }, {
                name: 'class_name',
                type: SQLBindType.STRING,
                value: this.conditionInfo.className
            }, {
                name: 'element_size',
                type: SQLBindType.INTEGER,
                value: this.conditionInfo.elementSize
            }, {
                name: 'from_time',
                type: SQLBindType.STRING,
                value: fromTime + ':00'
            }, {
                name: 'to_time',
                type: SQLBindType.STRING,
                value: fromTime + ':59'
            }
        ];

        WS.SQLExec(dataSet, this.onData, this);
        this.botPanel.loadingMask.show();
    },

    moveIndicator: function() {
        var ix, ixLen, indicatorPos, chart;

        indicatorPos = {
            x: this.indicatorTime,
            y: null
        };

        for(ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++){
            chart = this.chartList[ix];
            chart.drawIndicator(indicatorPos);
        }

        if(!this.botPanel.collapsed){
            this.executeBottomQuery();
        }
    },

    setChart: function (data) {
        var ix, ixLen;

        this.midPanel.removeAll();
        this.chartList = [];

        this.setChartData(data);

        for (ix = 0, ixLen = this.chartDatas.length; ix < ixLen; ix++) {
            this.addChart(this.chartDatas[ix]);
        }

        this.setIndicatorTIme();
        this.moveIndicator();
    },

    setCollectionData: function(data) {
        var ix, ixLen, rowData, serverName;

        this.collectionGrid.clearRows();

        for(ix = 0, ixLen = data.length; ix < ixLen; ix++){
            rowData = data[ix];
            serverName = Comm.RTComm.getServerNameByID(rowData[0]);

            this.collectionGrid.addRow([
                serverName, //was_name
                rowData[1], //class_name
                rowData[2], //instandId
                rowData[3], //element_count
                rowData[4], //limit_exceed_date
                rowData[8], //txn_name
                rowData[5], //tid
                rowData[6] ? 'Y' : 'N', //confirm
                rowData[6], //stackTrace
                rowData[7], //time
                rowData[0], //was_id
                rowData[9], //start_time_temp
                rowData[10], //end_time
                rowData[11] //elapse_time
            ]);
        }

        this.collectionGrid.drawGrid();
    },

    setActiveSessionData: function(data) {
        var ix, ixLen, jx, jxLen,
            rowData, binds, bindValues, bindStr,
            startTime, state, tempTime, latestTime;

        this.sessionGrid.clearRows();

        for(ix = 0, ixLen = data.length; ix < ixLen; ix++){
            rowData = data[ix];

            if(ix == 0){
                latestTime = rowData[0];
            }
            else {
                if(latestTime != rowData[0]){
                    break;
                }
            }

            bindValues = [];
            binds = common.Util.convertBindList(rowData[23]);
            for(jx = 0, jxLen = binds.length; jx < jxLen; jx++){
                bindValues.push(binds[jx].value);
            }

            bindStr = bindValues.join(', ');

            tempTime = new Date(rowData[8]);
            startTime = ("0" + tempTime.getHours()).slice(-2) + ":" +
                ("0" + tempTime.getMinutes()).slice(-2) + ":" +
                ("0" + tempTime.getSeconds()).slice(-2);

            state = common.DataModule.threadStateType[rowData[22]];

            this.sessionGrid.addRow([
                rowData[0],   //time
                rowData[1],   //was_name
                rowData[2],   //was_id
                rowData[3],   //txn_name
                rowData[4],   //class_method
                common.Util.codeBitToMethodType(rowData[ 5]), //method_type
                rowData[6],   //client_ip
                rowData[7],   //login_name
                startTime,    //start_time
                rowData[9],   //avg_elapse
                rowData[10],  //txn_cpu_time
                rowData[11],  //cpu_time
                rowData[12],  //thread_cpu
                rowData[13],  //io_read
                rowData[14],  //io_write
                rowData[15],  //db_time
                rowData[16],  //wait_time
                rowData[17],  //pool
                rowData[18],  //pool_id
                rowData[19],  //elapse_time
                rowData[20],  //instance_name
                rowData[21],  //sid
                state,        //state
                bindStr,      //bind_list
                rowData[24],  //sql_id1
                rowData[25],  //sql_text1
                rowData[26],  //2
                rowData[27],  //text2
                rowData[28],  //3
                rowData[29],  //text3
                rowData[30],  //4
                rowData[31],  //text4
                rowData[32],  //5
                rowData[33],  //text5
                rowData[34],  //sql_exec_count
                rowData[35],  //fetch_count
                rowData[36],  //current_crc
                rowData[37],  //prepare_cnt
                rowData[38],  //txn_id
                rowData[39],
                rowData[40],
                rowData[41],
                rowData[42],  //wait_info
                rowData[43],  //tid
                rowData[44]   //start time tmp
            ]);
        }

        this.sessionGrid.drawGrid();
    },

    onData: function (header, data) {
        var command = header.command,
            loadingMask;

        if(command === this.sql.chart) {
            loadingMask = this.loadingMask;
        }
        else {
            loadingMask = this.botPanel.loadingMask;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            loadingMask.hide();
            console.debug('MemoryLeak-onData');
            console.debug(header);
            console.debug(data);
            return;
        }

        switch (command) {
            case this.sql.chart:
                this.setChart(data.rows);
                break;
            case this.sql.collection:
                this.setCollectionData(data.rows);
                break;
            case this.sql.session:
                this.setActiveSessionData(data.rows);
                break;
            default :
                break;
        }

        loadingMask.hide();
    },

    executeSQL: function () {
        var dataSet = {};

        this.conditionInfo = {};
        this.conditionInfo.fromTime = this.datePicker.getFromDateTime();
        this.conditionInfo.toTime = this.datePicker.getToDateTime();
        this.conditionInfo.wasId = this.wasCombo.getValue();
        this.conditionInfo.className = this.className.getRawValue();
        this.conditionInfo.elementSize = this.elementCount.getValue();

        dataSet.sql_file = this.sql.chart;
        dataSet.bind = [
            {
                name: 'was_id',
                type: SQLBindType.INTEGER,
                value: this.conditionInfo.wasId
            }, {
                name: 'class_name',
                type: SQLBindType.STRING,
                value: this.conditionInfo.className
            }, {
                name: 'element_size',
                type: SQLBindType.INTEGER,
                value: this.conditionInfo.elementSize
            }, {
                name: 'from_time',
                type: SQLBindType.STRING,
                value: this.conditionInfo.fromTime + ':00'
            }, {
                name: 'to_time',
                type: SQLBindType.STRING,
                value: this.conditionInfo.toTime + ':00'
            }
        ];

        WS.SQLExec(dataSet, this.onData, this);
        this.loadingMask.show();
    }
});