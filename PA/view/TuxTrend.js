Ext.define('view.TuxTrend', {
    extend: 'Exem.PerformanceTrend',

    midTabInfos: [{
        title: common.Util.TR('Agent Stat'),
        envKey: 'pa_tux_performance_trend_stat',
        type: 'chart',
        charts: [],
        alias: []
    }, {
        title: common.Util.TR('Agent OS Stat'),
        type: 'chart',
        charts: ['OS CPU (%)', 'OS Memory (MB)']
    }],

    wasStat: {
        'cur_servers': 'cur_servers',
        'cur_services': 'cur_services',
        'cur_req_queue': 'cur_req_queue',
        'cur_groups': 'cur_groups',
        'dequeue': 'dequeue',
        'enqueue': 'enqueue',
        'post': 'post',
        'req': 'req',
        'num_tran': 'num_tran',
        'num_tranabt': 'num_tranabt',
        'num_trancmt': 'num_trancmt',
        'wkcompleted': 'wkcompleted',
        'ncompleted' : 'ncompleted',
        'reqc' : 'reqc',
        'reqd' : 'reqd',
        'server_cnt' : 'server_cnt',
        'ntotwkqueued' : 'ntotwkqueued',
        'nqueued' : 'nqueued',
        'wkqueued' : 'wkqueued',
        'numtran': 'numtran',
        'numtranabt': 'numtranabt',
        'numtrancmt': 'numtrancmt',
        'OS CPU Sys (%)': 'os_cpu_sys',
        'OS CPU User (%)': 'os_cpu_user',
        'OS CPU IO (%)': 'os_cpu_io',
        'OS Free Memory (MB)': 'os_free_memory',
        'OS Total Memory (MB)': 'os_total_memory',
        'OS Send Packets': 'os_send_packet',
        'OS Rcv Packets': 'os_rcv_packet'
    },

    wasStatRelSql: {
        mid_was:  ['os_cpu_sys', 'os_cpu_user', 'os_cpu_io', 'os_free_memory', 'os_total_memory', 'os_send_packet', 'os_rcv_packet', 'active_txns'],
        mid_stat: ['cur_servers', 'cur_services', 'cur_req_queue', 'cur_groups', 'dequeue', 'enqueue', 'post', 'req', 'num_tran', 'num_tranabt', 'num_trancmt', 'wkcompleted'],
        mid_svc:  ['ncompleted'],
        mid_svr:  ['reqc', 'reqd'],
        mid_que:  ['server_cnt' , 'ntotwkqueued', 'nqueued', 'wkqueued'],
        mid_client:  ['numtran', 'numtrancmt', 'numtranabt']
    },

    useDbCombo: false,
    gridEnvKey: 'pa_tux_performance_trend',

    initProperty: function() {
        var ix, ixLen,
            tabInfo, lastType;

        lastType = Comm.web_env_info['pa_tux_performance_trend_last_type'];
        for (ix = 0, ixLen = this.midTabInfos.length; ix < ixLen; ix++) {
            tabInfo = this.midTabInfos[ix];

            if (tabInfo.envKey) {
                tabInfo.charts = Comm.web_env_info[tabInfo.envKey + '_' + lastType];
                if (tabInfo.title === common.Util.TR('Agent Stat')) {
                    tabInfo.alias = Comm.web_env_info[tabInfo.envKey + '_id_' + lastType];
                }
            }
        }

        this.sql.mid_was  = 'IMXPA_TuxTrend_Mid_WAS.sql';
        this.sql.mid_stat = 'IMXPA_TuxTrend_Mid_Stat.sql';
        this.sql.mid_svr  = 'IMXPA_TuxTrend_Mid_SVR.sql';
        this.sql.mid_svc  = 'IMXPA_TuxTrend_Mid_SVC.sql';
        this.sql.mid_que  = 'IMXPA_TuxTrend_Mid_Queue.sql';
        this.sql.mid_client = 'IMXPA_TuxTrend_Mid_Client.sql';
        this.sql.bot_active = 'IMXPA_TuxTrend_Bot_Active.sql';
    },

    init: function() {
        this.initProperty();
        this.callParent();
    },

    addActiveColumns: function(grid) {
        grid.beginAddColumns();
        grid.addColumn(common.Util.CTR('Agent'              )  , 'was_name'      , 100, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Transaction'        )  , 'txn_name'      , 150, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Server Name'        )  , 'svr_name'      , 100, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Transaction CPU TIME') , 'txn_cpu_time'  , 70 , Grid.Float        , true , false);
        grid.addColumn(common.Util.CTR('Start Time'         )  , 'start_time'    , 200, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Elapse Time'        )  , 'elapse_time'   , 90 , Grid.Float        , true , false);
        grid.addColumn(common.Util.CTR('Host Name'          )  , 'host_name'     , 100, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Client IP'          )  , 'client_ip'     , 130, Grid.String       , true , false);
        grid.addColumn('SQL ID1'                               , 'sql_id1'       , 500, Grid.String       , false, true);
        grid.addColumn(common.Util.CTR('SQL 1'              )  , 'sql_text1'     , 70 , Grid.String       , true , false);
        grid.addColumn('SQL ID2'                               , 'sql_id2'       , 100, Grid.String       , false, true);
        grid.addColumn(common.Util.CTR('SQL 2'              )  , 'sql_text2'     , 70 , Grid.String       , true , false);
        grid.addColumn('SQL ID3'                               , 'sql_id3'       , 100, Grid.String       , false, true);
        grid.addColumn(common.Util.CTR('SQL 3'              )  , 'sql_text3'     , 70 , Grid.String       , true , false);
        grid.addColumn('SQL ID4'                               , 'sql_id4'       , 100, Grid.String       , false, true);
        grid.addColumn(common.Util.CTR('SQL 4'              )  , 'sql_text4'     , 70 , Grid.String       , true , false);
        grid.addColumn('SQL ID5'                               , 'sql_id5'       , 100, Grid.String       , false, true);
        grid.addColumn(common.Util.CTR('SQL 5'              )  , 'sql_text5'     , 70 , Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('SQL Execution Count')  , 'sql_exec_count', 105, Grid.Number       , true , false);
        grid.addColumn(common.Util.CTR('Fetch Count'        )  , 'fetch_count'   , 70 , Grid.Number       , true , false);
        grid.addColumn('Time'                                  , 'end_time'      , 170, Grid.DateTime     , false, true);
        grid.addColumn('Start Time Temp'                       , 'start_time_temp',70 , Grid.String       , false, true);
        grid.addColumn('WAS ID'                                , 'was_id'        , 100, Grid.String       , false, true);
        grid.addColumn('TID'                                   , 'tid'           , 100, Grid.String       , true , false);
        grid.addColumn('Transaction ID'                        , 'txn_id'        , 70 , Grid.String       , false, true);
        grid.addColumn(common.Util.CTR('Trace')                , 'class_method'  , 100, Grid.String       , true , false);
        grid.endAddColumns();
        grid.loadLayout(grid.gridName);
    },

    setActiveTxnData: function(header, data) {
        var chart = this.activeTxnChart,
            param = header.parameters,
            parameter = {},
            seriesIndexes = {},
            index = 1,
            ix, ixLen;

        chart.clearValues();

        if (data.length != 0) {
            parameter.from = param.bind[0].value;
            parameter.to  = param.bind[1].value;
            parameter.time = 0;
            parameter.data = data.rows;

            for (ix = 0, ixLen = chart.serieseList.length; ix < ixLen; ix++) {
                seriesIndexes[ix] = index++;
            }

            parameter.series = seriesIndexes;

            chart.addValues(parameter);

            this.zoomBrushFrame.show();
        } else {
            this.zoomBrushFrame.hide();
        }

        chart.plotDraw();

        if (chart.maxOffSet.seriesIndex !== undefined) {
            this.setIndicatorTime();
        }

        this.executeMidSQL();
    },

    setOsData: function(header, data) {
        var charts = this.chartList[this.midPanel.getActiveTab().title],
            param = header.parameters,
            dataIndex = 1,
            ix, ixLen, jx, jxLen, chart, parameter, seriesIndexes;

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            chart = charts[ix];
            chart.clearValues();

            if (data.length != 0) {
                parameter = {};
                seriesIndexes = {};

                parameter.from = param.bind[0].value;
                parameter.to  = param.bind[1].value;
                parameter.time = 0;
                parameter.data = data.rows;

                for (jx = 0, jxLen = chart.serieseList.length; jx < jxLen; jx++) {
                    seriesIndexes[jx] = dataIndex++;
                }

                parameter.series = seriesIndexes;

                chart.addValues(parameter);
            }

            chart.prevZoomFrom = +new Date(this.datePicker.getFromDateTime());
            chart.prevZoomTo = +new Date(this.datePicker.getToDateTime());
            chart.zoomIn(+new Date(this.zoomFrom), +new Date(this.zoomTo));

            chart.plotReSize();
        }
    },

    setWasData: function(header, data) {
        var charts = this.chartList[this.midPanel.getActiveTab().title],
            param = header.parameters,
            command = header.command,
            maxLiteral = '_max',
            ix, ixLen, jx, jxLen, chart, dataIndex, dataSumIndex,
            rowData, time, sqlFile;

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            chart = charts[ix];
            sqlFile = this.getSqlFileByAlias(chart.alias);
            if (sqlFile !== command) {
                continue;
            }

            chart.clearValues();
            chart.setChartRange(+new Date(param.bind[0].value) , +new Date(param.bind[1].value));

            dataIndex = data.columns.indexOf(chart.alias + maxLiteral);
            dataSumIndex = data.columns.indexOf(chart.alias);
            for (jx = 0, jxLen = data.rows.length; jx < jxLen; jx++) {
                if (dataIndex === -1 && dataSumIndex === -1) {
                    continue;
                }

                rowData = data.rows[jx];
                time = +new Date(rowData[0]);

                if (dataIndex !== -1) {
                    chart.addValue(0, [time, rowData[dataIndex]]);
                    chart.addValue(1, [time, rowData[dataIndex + 1]]);
                } else {
                    chart.addValue(0, [time, rowData[dataSumIndex]]);
                }
            }

            chart.setFillData(null);

            chart.prevZoomFrom = +new Date(this.datePicker.getFromDateTime());
            chart.prevZoomTo = +new Date(this.datePicker.getToDateTime());
            chart.zoomIn(+new Date(this.zoomFrom), +new Date(this.zoomTo));

            chart.plotReSize();
        }
    },

    onMidData: function(header, data) {
        var isLockTree = false;

        this.executeCount--;

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.error('PerformaceTrend-onMidData');
            console.error(header);
            console.error(data);
            this.loadingMask.hide();
            return;
        }

        if ( Comm.currentRepositoryInfo.database_type === 'Oracle' || Comm.currentRepositoryInfo.database_type === 'MSSQL') {
            data.columns = common.Util.toLowerCaseArray(data.columns);
        }

        switch (header.command) {
            case this.sql.mid_was:
            case this.sql.mid_stat:
            case this.sql.mid_svr:
            case this.sql.mid_svc:
            case this.sql.mid_que:
            case this.sql.mid_client:
                this.setWasData(header, data);
                break;

            case this.sql.mid_os:
                this.setOsData(header, data);
                break;

            default:
                break;
        }

        if (!this.executeCount && !isLockTree) {
            this.moveIndicator();
        }
    },

    setSessionGrid: function(data) {
        var grid = this.gridList[common.Util.TR('Active Session')],
            rowData, startTime, hostName, wasId,
            ix, ixLen;

        grid.clearRows();
        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            rowData = data.rows[ix];
            wasId = rowData[21];
            hostName = Comm.tuxInfoObj[wasId].host;
            startTime = this.getConvertTime(new Date(rowData[4]), 'hms');

            grid.addRow([
                rowData[0],     //was_name
                rowData[1],     //txn_name
                rowData[2],     //svr_name
                rowData[3],     //txn_cpu_time
                startTime,      //start_time
                rowData[5],     //elapse_time
                hostName,       //host_name
                rowData[6],     //client_ip
                rowData[7],     //sql_id1
                rowData[8],     //sql_text1
                rowData[9],     //2
                rowData[10],    //text2
                rowData[11],    //3
                rowData[12],    //text3
                rowData[13],    //4
                rowData[14],    //text4
                rowData[15],    //5
                rowData[16],    //text5
                rowData[17],    //sql_exec_count
                rowData[18],    //fetch_count
                rowData[19],    //time
                rowData[20],    //start time tmp
                wasId,          //was_id
                rowData[22],    //tid
                rowData[23],    //txn_id
                rowData[24]     //class_method
            ]);
        }

        grid.drawGrid();
    },

    setSessionSumGrid: function(data) {
        var grid = this.gridList[common.Util.TR('Active Session (SUM)')],
            state_val,
            ix, ixLen;

        grid.clearRows();
        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            state_val = common.DataModule.threadStateType[data.rows[ix][14]];

            grid.addRow([
                data.rows[ix][ 0]
                ,data.rows[ix][ 1]
                ,data.rows[ix][ 2]
                ,data.rows[ix][ 4]
                ,data.rows[ix][ 5]
                ,data.rows[ix][ 6]
                ,data.rows[ix][ 7]
                ,data.rows[ix][ 8]
                ,data.rows[ix][ 9]
                ,data.rows[ix][10]
                ,data.rows[ix][11]
                ,data.rows[ix][12]
                ,data.rows[ix][13] //sid
                ,state_val         //state
                ,data.rows[ix][15]
                ,data.rows[ix][16]
                ,data.rows[ix][17]
                ,data.rows[ix][18]
                ,data.rows[ix][19]
                ,data.rows[ix][20]
                ,data.rows[ix][21]
                ,data.rows[ix][22]
                ,data.rows[ix][23]
                ,data.rows[ix][ 3] //tid
            ]);
        }

        grid.drawGrid();
    },

    setProcessGrid: function(data) {
        var grid = this.gridList[common.Util.TR('Process')],
            ix, ixLen, rowData;

        grid.clearRows();

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            rowData = data.rows[ix];

            grid.addRow([
                this.getConvertTime(new Date(rowData[0]), 'hms')
                ,rowData[1]
                ,rowData[2]
                ,rowData[3]
                ,rowData[4]
                ,rowData[5]
                ,rowData[6]
            ]);
        }

        grid.drawGrid();
    },

    onData: function(header, data) {
        var command = header.command,
            isLoadingMaskHide = false;

        this.executeCount--;

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.error('PerformaceTrend-onData');
            console.error(header);
            console.error(data);
            this.loadingMask.hide();
            return;
        }

        switch (command) {
            case this.sql.top_active:
                this.setActiveTxnData(header, data);
                break;

            case this.sql.bot_active:
                this.setSessionGrid(data);
                isLoadingMaskHide = true;
                break;

            case this.sql.bot_process:
                this.setProcessGrid(data);
                isLoadingMaskHide = true;
                break;

            case this.sql.bot_active_sum:
                this.setSessionSumGrid(data);
                isLoadingMaskHide = true;
                break;

            case this.sql.bot_sec:
                this.setSec(data.rows, 'active');
                this.executeActive(this.sql.bot_active, 'active');
                break;

            default:
                break;
        }

        if (!this.executeCount && isLoadingMaskHide) {
            this.loadingMask.hide();
        }
    },

    executeTopSQL: function() {
        var dataSet = {};

        dataSet.sql_file = this.sql.top_active;
        dataSet.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getFromDateTime())
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getToDateTime())
        },{
            name : 'was_id',
            type : SQLBindType.INTEGER,
            value: this.wasCombo.getValue()
        }];

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onData, this);
        this.executeCount++;
    },

    executeStat: function(sqlFile) {
        var dataSet = {};

        dataSet.sql_file = sqlFile;
        dataSet.bind = [{
            name: 'fromtime',
            value: common.Util.getDate(this.datePicker.getFromDateTime()),
            type: SQLBindType.STRING
        }, {
            name: 'totime',
            value: common.Util.getDate(this.datePicker.getToDateTime()),
            type: SQLBindType.STRING
        }, {
            name: 'was_id',
            value: this.wasCombo.getValue(),
            type: SQLBindType.INTEGER
        }];

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onMidData, this);
        this.executeCount++;
    },

    getSqlFileByAlias: function(alias) {
        var ix, ixLen, keys, sqlFile;

        keys = Object.keys(this.wasStatRelSql);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            if (this.wasStatRelSql[keys[ix]].indexOf(alias) !== -1) {
                sqlFile = this.sql[keys[ix]];
                break;
            }
        }

        return sqlFile;
    },

    requestWasStat: function(charts) {
        var sqlFiles = [],
            ix, ixLen, sqlFile;

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            sqlFile = this.getSqlFileByAlias(charts[ix].alias);
            if (sqlFiles.indexOf(sqlFile) === -1) {
                sqlFiles.push(sqlFile);
            }
        }

        for (ix = 0, ixLen = sqlFiles.length; ix < ixLen; ix++) {
            this.executeStat(sqlFiles[ix]);
        }
    },

    executeMidSQL: function() {
        var tab = this.midPanel.getActiveTab(),
            tabName = tab.title;

        switch (tabName) {
            case common.Util.TR('Agent Stat'):
                this.requestWasStat(this.chartList[tabName]);
                break;

            case common.Util.TR('Agent OS Stat'):
                this.executeStat(this.sql.mid_os);
                break;

            default :
                break;
        }
    },

    executeActive: function(sqlFile, type) {
        var dataSet = {},
            currTime = this.getConvertTime(this.indicatorTime);

        dataSet.sql_file = sqlFile;
        dataSet.bind = [{
            name: 'fromtime',
            value: currTime + ':00',
            type: SQLBindType.STRING
        }, {
            name: 'was_id',
            value: this.wasCombo.getValue(),
            type: SQLBindType.INTEGER
        }];

        if (type !== 'process') {
            dataSet.bind.push({
                name: 'totime',
                value: currTime + ':59',
                type: SQLBindType.STRING
            });

            if (type === 'active') {
                dataSet.bind.push({
                    name: 'current_time',
                    value: this.indicatorTime,
                    type: SQLBindType.STRING
                });
            }
        } else {
            dataSet.bind.push({
                name: 'server_type',
                value: 1,
                type: SQLBindType.INTEGER
            });
        }

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onData, this);
        this.executeCount++;
    },

    executeBotSQL: function() {
        var tab = this.botPanel.getActiveTab(),
            tabName = tab.title,
            lastTime, indicatorTime;

        switch (tabName) {
            case common.Util.TR('Active Session'):
                lastTime = this.getConvertTime(tab.lastTime, 'hm');
                indicatorTime = this.getConvertTime(this.indicatorTime, 'hm');

                if (lastTime !== indicatorTime) {
                    this.executeSecFrame(this.sql.bot_sec, 'active');
                } else {
                    this.executeActive(this.sql.bot_active, 'active');
                }
                break;

            case common.Util.TR('Process'):
                this.executeActive(this.sql.bot_process, 'process');
                break;

            case common.Util.TR('Active Session (SUM)'):
                this.executeActive(this.sql.bot_active_sum, 'active');
                break;

            default:
                break;
        }
    },

    clickTitle: function(event) {
        var statList, tabName, chartTitle,
            ix, ixLen, keys, data, charts, chart, sumLiteral;

        if (this.indicatorTime === undefined) {
            return;
        }

        if (this.statChangeWindow) {
            this.statChangeWindow.removeAll();
        }

        chartTitle = event.currentTarget.textContent;
        tabName = this.midPanel.getActiveTab().title;
        statList = {
            Stat: [] ,
            DB:  [],
            Wait: [],
            GC : [],
            Pool: []
        };

        charts = this.chartList[tabName];
        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            if (charts[ix].title === chartTitle) {
                chart = charts[ix];
                break;
            }
        }

        data = this.wasStat;
        keys = Object.keys(data);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            statList.Stat.push({ name: keys[ix], value: data[keys[ix]] });
        }

        this.statChangeWindow = Ext.create('view.PerformanceTrendStatChangeWindow',{
            instanceId: this.useDbCombo ? this.dbCombo.getValue() : null,
            was_id: this.wasCombo.getValue(),
            stat_data: statList,
            connectChart: chart,
            modal: true,
            useTab: {
                stat : true,
                db   : false,
                wait : false,
                gc   : false,
                pool : false
            },
            okFn: function(type, name, id, me) {
                console.info('선택된 타입??', type);
                console.info('선택된 이름??', name);
                console.info('선택된 아이디??', id);

                me.connectChart.setTitle(common.Util.TR(name));
                me.connectChart.alias = id;

                me.connectChart.removeAllSeries();

                sumLiteral = '_sum';

                if (id.indexOf(sumLiteral) === -1) {
                    me.connectChart.addSeries({
                        label: common.Util.CTR('MAX'),
                        id   : 'max',
                        type : PlotChart.type.exLine
                    });

                    me.connectChart.addSeries({
                        label: common.Util.CTR('AVG'),
                        id   : 'avg',
                        type : PlotChart.type.exLine
                    });
                } else {
                    chart.addSeries({
                        label: common.Util.CTR('SUM'),
                        id   : 'sum',
                        type : PlotChart.type.exLine
                    });
                }

                this.executeMidSQL();
            }.bind(this)
        });

        this.statChangeWindow.init();
        this.statChangeWindow.selectValue(0, chartTitle);
    },

    openUserDefineWindow: function() {
        var statList, data, keys,
            ix, ixLen;

        if (this.userDefineWindow) {
            this.userDefineWindow.removeAll();
        }

        statList = {
            Stat: [],
            DB: [],
            Wait: [],
            GC: [],
            Pool: []
        };

        data = this.wasStat;
        keys = Object.keys(data);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            statList.Stat.push({ name: keys[ix], value: data[keys[ix]] });
        }

        this.userDefineWindow = Ext.create('view.PerformanceTrendUserDefined', {
            total_stat_list: statList,
            db_visible: false,
            wait_visible: false,
            gc_visible: false,
            db_id: null,
            visible_stat_list: ['stat'],
            view_name: 'tux_performance_trend',
            modal: true,
            scope: this
        });

        this.userDefineWindow.init_form();
        this.userDefineWindow.setTitle(common.Util.TR('User Defined'));
        this.userDefineWindow.show();
        this.userDefineWindow.load_list_data();
    }
});