/**
 * Created by jykim on 2017-04-03.
 */
Ext.define('view.WebTrend', {
    extend: 'Exem.PerformanceTrend',

    midTabInfos: [{
        title: common.Util.TR('Agent Stat'),
        envKey: 'pa_web_performance_trend_stat',
        type: 'chart',
        charts: [],
        alias: []
    }, {
        title: common.Util.TR('Agent OS Stat'),
        type: 'chart',
        charts: ['OS CPU (%)', 'OS Memory (MB)']
    }, {
        title: common.Util.TR('WebToB'),
        type: 'chart',
        charts: ['BlockRun', 'Client Count', 'Queuing Count', 'Queuing Count(aq)'],
        alias: ['brun_cnt', 'client_cnt', 'cqcnt', 'aqcnt']
    }],

    wasStat: {
        'Active Transactions': 'active_txns',
        'OS CPU (%)': 'os_cpu',
        'TPS': 'tps',
        'OS CPU Sys (%)': 'os_cpu_sys',
        'OS CPU User (%)': 'os_cpu_user',
        'OS CPU IO (%)': 'os_cpu_io',
        'OS Free Memory (MB)': 'os_free_memory',
        'OS Total Memory (MB)': 'os_total_memory',
        'OS Send Packets': 'os_send_packet',
        'OS Rcv Packets': 'os_rcv_packet',
        'Elapse Time': 'elapse_time',
        'Response Code Status': 'response_code'
    },

    statRelSql: {
        mid_was_os: ['active_txns', 'os_cpu', 'tps', 'os_cpu_sys', 'os_cpu_user', 'os_cpu_io',
            'os_free_memory', 'os_total_memory', 'os_send_packet', 'os_rcv_packet'],
        mid_was_summary: ['elapse_time', 'response_code'],
        mid_webtob: ['brun_cnt', 'client_cnt', 'cqcnt', 'aqcnt']
    },

    responseStatusColors: [
        '#90db3b', '#2b99f0', '#f7dc44', '#e7782e', '#e11f2d'
    ],

    useDbCombo: false,
    gridEnvKey: 'pa_web_performance_trend',

    initProperty: function() {
        var ix, ixLen,
            tabInfo, lastType;

        lastType = Comm.web_env_info['pa_web_performance_trend_last_type'];
        for (ix = 0, ixLen = this.midTabInfos.length; ix < ixLen; ix++) {
            tabInfo = this.midTabInfos[ix];
            if (tabInfo.envKey) {
                tabInfo.charts = Comm.web_env_info[tabInfo.envKey + '_' + lastType];
                if (tabInfo.title === common.Util.TR('Agent Stat')) {
                    tabInfo.alias = Comm.web_env_info[tabInfo.envKey + '_id_' + lastType];
                }
            }
        }

        this.sql.top_active = 'IMXPA_WebTrend_Top_Active.sql';

        this.sql.mid_os = 'IMXPA_WebTrend_Mid_Os.sql';
        this.sql.mid_was_os = 'IMXPA_WebTrend_Mid_Was_Os.sql';
        this.sql.mid_was_summary = 'IMXPA_WebTrend_Mid_Was_Summary.sql';
        this.sql.mid_webtob = 'IMXPA_WebTrend_Mid_WebToB.sql';

        this.sql.bot_active = 'IMXPA_WebTrend_Bot_Active.sql';
        this.sql.bot_brun = 'IMXPA_WebTrend_Bot_Brun.sql';
        this.sql.bot_sec_active = 'IMXPA_WebTrend_Bot_Sec_Active.sql';
        this.sql.bot_sec_brun = 'IMXPA_WebTrend_Bot_Sec_Brun.sql';
    },

    init: function() {
        this.initProperty();
        this.callParent();

        this.secFrames.brun = [];
        this.existSecTimes.brun = [];

        this.addTab(this.botPanel, {
            title: common.Util.TR('BlockRun'),
            type: 'grid',
            name: 'brun',
            addColumns: this.addBrunColumns
        });

        this.botPanel.items.items[2].tab.setVisible(false);
        if (!Comm.webServersInfo[this.wasCombo.getValue()].isWTB) {
            this.midPanel.items.items[2].tab.setVisible(false);
            this.botPanel.items.items[3].tab.setVisible(false);
        }
    },

    comboSelectFn: function(value) {
        if (!Comm.webServersInfo[value].isWTB) {
            this.midPanel.items.items[2].tab.setVisible(false);
            this.botPanel.items.items[3].tab.setVisible(false);
        } else {
            this.midPanel.items.items[2].tab.setVisible(true);
            this.botPanel.items.items[3].tab.setVisible(true);
        }
    },

    addBrunColumns: function(grid) {
        grid.beginAddColumns();
        grid.addColumn('time',          'time'        , 100, Grid.String       , true,  false);
        grid.addColumn('agent',         'agent'       , 110, Grid.String       , true,  false);
        grid.addColumn('svr_name',      'svrname'     , 120, Grid.String       , true,  false);
        grid.addColumn('svgname',       'svgname'     ,  80, Grid.String       , true,  false);
        grid.addColumn('spr_no',        'spr_no'      ,  80, Grid.Number       , true,  false);
        grid.addColumn('pid',           'pid'         ,  80, Grid.Number       , true,  false);
        grid.addColumn('status',        'status'      ,  80, Grid.String       , true,  false);
        grid.addColumn('count',         'count'       ,  80, Grid.Number       , true,  false);
        grid.addColumn('avg(rt)',       'average'     ,  80, Grid.Float        , true,  false);
        grid.addColumn('clid',          'clid'        ,  80, Grid.Number       , true,  false);
        grid.addColumn('svc',           'svc'         ,  80, Grid.String       , true,  false);
        grid.addColumn('wsid',          'wsid'        ,  40, Grid.Number       , false, true );
        grid.endAddColumns();
        grid.loadLayout(grid.gridName);
    },

    addActiveColumns: function(grid) {
        grid.beginAddColumns();
        grid.addColumn(common.Util.CTR('Time'              ), 'time'          ,  70, Grid.DateTime  , false, true);
        grid.addColumn(common.Util.CTR('Server ID'         ), 'serverid'      , 100, Grid.Number    , false, true);
        grid.addColumn(common.Util.CTR('Server Name'       ), 'servername'    , 110, Grid.String    , false, false);
        grid.addColumn(common.Util.CTR('URL'               ), 'url'           , 250, Grid.String    , true,  false);
        grid.addColumn(common.Util.CTR('Status'            ), 'status'        ,  80, Grid.String    , false,  true);
        grid.addColumn(common.Util.CTR('Type'              ), 'type'          ,  80, Grid.String    , true,  false);
        grid.addColumn(common.Util.CTR('Start Time'        ), 'starttime'     , 110, Grid.String    , true,  false);
        grid.addColumn(common.Util.CTR('Elapsed Time'      ), 'elapsedtime'   ,  90, Grid.Float     , true,  false);
        grid.addColumn(common.Util.CTR('User IP'           ), 'userip'        , 110, Grid.String    , true,  false);
        grid.addColumn(common.Util.CTR('TID'               ), 'tid'           , 110, Grid.String    , false,  true);
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
            maxLiteral,
            ix, ixLen, jx, jxLen, chart, dataIndex,
            rowData, time, sqlFile;

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            maxLiteral = '_max';

            chart = charts[ix];
            sqlFile = this.getSqlFileByAlias(chart.alias);
            if (sqlFile !== command) {
                continue;
            }

            chart.clearValues();
            chart.setChartRange(+new Date(param.bind[0].value) , +new Date(param.bind[1].value));

            dataIndex = data.columns.indexOf(chart.alias + maxLiteral);

            if (chart.title === common.Util.TR('Response Code Status')) {
                chart.setChartRange(+new Date(param.bind[0].value) , +new Date(this.datePicker.getToDateTime()));

                if (chart.serieseList.length < 5) {
                    for (jx = 0, jxLen = chart.serieseList.length; jx < jxLen; jx++) {
                        chart.setLegendText(jx, (jx + 1) + 'xx');
                    }

                    for (jx = chart.serieseList.length, jxLen = 5; jx < jxLen; jx++) {
                        chart.addSeries({
                            label: (jx + 1) + 'xx',
                            id   : 'code_' + (jx + 1) + '00',
                            type : PlotChart.type.exLine,
                            color: this.responseStatusColors[jx]
                        });
                    }
                }

                dataIndex = 1;
            } else {
                if (chart.serieseList.length > 2) {
                    for (jx = 2, jxLen = chart.serieseList.length; jx < jxLen; jx++) {
                        chart.removeSeries(2);
                    }
                }

                if (chart.title === common.Util.TR('OS Free Memory (MB)')) {
                    chart.setLegendText(0, common.Util.CTR('AVG'));
                    chart.setLegendText(1, common.Util.CTR('MIN'));
                    maxLiteral = '_avg';
                    dataIndex = data.columns.indexOf(chart.alias + maxLiteral);
                } else {
                    chart.setLegendText(0, common.Util.CTR('MAX'));
                    chart.setLegendText(1, common.Util.CTR('AVG'));
                }
            }

            for (jx = 0, jxLen = data.rows.length; jx < jxLen; jx++) {
                if (dataIndex === -1) {
                    continue;
                }

                rowData = data.rows[jx];
                time = +new Date(rowData[0]);

                chart.addValue(0, [time, rowData[dataIndex]]);
                chart.addValue(1, [time, rowData[dataIndex + 1]]);

                if (chart.title === common.Util.TR('Response Code Status')) {
                    chart.addValue(2, [time, rowData[dataIndex + 2]]);
                    chart.addValue(3, [time, rowData[dataIndex + 3]]);
                    chart.addValue(4, [time, rowData[dataIndex + 4]]);
                }
            }

            chart.setFillData(null);

            chart.prevZoomFrom = +new Date(this.datePicker.getFromDateTime());
            chart.prevZoomTo = +new Date(this.datePicker.getToDateTime());
            chart.zoomIn(+new Date(this.zoomFrom), +new Date(this.zoomTo));

            chart.plotReSize();
        }
    },

    setWebToBData: function(header, data) {
        var charts = this.chartList[this.midPanel.getActiveTab().title],
            param = header.parameters,
            maxLiteral = '_max',
            ix, ixLen, jx, jxLen, chart, chartData, dataIndex,
            rowData, time;

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            chart = charts[ix];
            if (chart.title === common.Util.TR('BlockRun')) {
                chartData = data[0];
            } else if (chart.title === common.Util.TR('Client Count')) {
                chartData = data[1];
            } else {
                chartData = data[2];
            }

            chart.clearValues();
            chart.setChartRange(+new Date(param.bind[0].value) , +new Date(param.bind[1].value));

            dataIndex = chartData.columns.indexOf(chart.alias + maxLiteral);
            if (chart.title === common.Util.TR('BlockRun')) {
                dataIndex = 1;
            }

            for (jx = 0, jxLen = chartData.rows.length; jx < jxLen; jx++) {
                if (dataIndex === -1) {
                    continue;
                }

                rowData = chartData.rows[jx];
                time = +new Date(rowData[0]);

                chart.addValue(0, [time, rowData[dataIndex]]);

                if (chart.title !== common.Util.TR('BlockRun')) {
                    chart.addValue(1, [time, rowData[dataIndex + 1]]);
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
        var ix, ixLen;

        this.executeCount--;

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.error('PerformaceTrend-onMidData');
            console.error(header);
            console.error(data);
            this.loadingMask.hide();
            return;
        }

        if (Comm.currentRepositoryInfo.database_type === 'Oracle' || Comm.currentRepositoryInfo.database_type === 'MSSQL') {
            if (data.length) {
                for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                    data[ix].columns = common.Util.toLowerCaseArray(data[ix].columns);
                }
            } else {
                data.columns = common.Util.toLowerCaseArray(data.columns);
            }
        }


        switch (header.command) {
            case this.sql.mid_was_os:
            case this.sql.mid_was_summary:
                this.setWasData(header, data);
                break;

            case this.sql.mid_os:
                this.setOsData(header, data);
                break;

            case this.sql.mid_webtob:
                this.setWebToBData(header, data);
                break;

            default:
                break;
        }

        if (!this.executeCount) {
            this.moveIndicator();
        }
    },

    setSessionGrid: function(data) {
        var grid = this.gridList[common.Util.TR('Active Session')],
            rowData, time, startTime, wsName, wsId,
            ix, ixLen;

        grid.clearRows();

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            rowData = data.rows[ix];
            time = new Date(rowData[0]);
            wsId = rowData[1];
            startTime = this.getConvertTime(new Date(rowData[5]), 'hms');

            if (Comm.webServersInfo[wsId]) {
                wsName = Comm.webServersInfo[wsId].name;
            } else {
                wsName = '';
            }

            grid.addRow([
                time,       // time
                wsId,       // server id
                wsName,     // server name
                rowData[2], //url
                rowData[3], //status
                rowData[4], //type
                startTime,  //start_time
                rowData[6], //elapse_time
                common.Util.hexIpToDecStr(rowData[7]),  //user_ip
                rowData[8]  //tid
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
                this.getConvertTime(new Date(rowData[0]), 'hms')    // time
                ,rowData[1]     // user_name
                ,rowData[2]     // pid
                ,rowData[3]     // cpu
                ,rowData[4]     // vsz
                ,rowData[5]     // rss
                ,rowData[6]     // args
            ]);
        }

        grid.drawGrid();
    },

    setBrunGrid: function(data) {
        var grid = this.gridList[common.Util.TR('BlockRun')],
            ix, ixLen, rowData, wsId, wsName, time;

        grid.clearRows();

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            rowData = data.rows[ix];
            wsId = rowData[1];
            time = this.getConvertTime(new Date(rowData[0]), 'hms');

            if (Comm.webServersInfo[wsId]) {
                wsName = Comm.webServersInfo[wsId].name;
            } else {
                wsName = '';
            }

            grid.addRow([
                time            // time
                , wsName        // agent
                , rowData[2]    // svrname
                , rowData[3]    // svgname
                , rowData[4]    // spr_no
                , rowData[5]    // pid
                , rowData[6]    // status
                , rowData[7]    // count
                , rowData[8]    // average
                , rowData[9]    // clid
                , rowData[10]   // svc
                , wsId          // wsid
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

            case this.sql.bot_brun:
                this.setBrunGrid(data);
                isLoadingMaskHide = true;
                break;

            case this.sql.bot_sec_active:
                this.setSec(data.rows, 'active');
                this.executeActive(this.sql.bot_active, 'active');
                break;

            case this.sql.bot_sec_brun:
                this.setSec(data.rows, 'brun');
                this.executeActive(this.sql.bot_brun, 'brun');
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
            name : 'ws_id',
            type : SQLBindType.INTEGER,
            value: this.wasCombo.getValue()
        }];

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onData, this);
        this.executeCount++;
    },

    executeStat: function(sqlFile, maxTime) {
        var dataSet = {};

        dataSet.sql_file = sqlFile;
        dataSet.bind = [{
            name: 'fromtime',
            value: common.Util.getDate(this.datePicker.getFromDateTime()),
            type: SQLBindType.STRING
        }, {
            name: 'totime',
            value: maxTime ? maxTime : common.Util.getDate(this.datePicker.getToDateTime()),
            type: SQLBindType.STRING
        }, {
            name: 'ws_id',
            value: this.wasCombo.getValue(),
            type: SQLBindType.INTEGER
        }];

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onMidData, this);
        this.executeCount++;
    },

    getSqlFileByAlias: function(alias) {
        var ix, ixLen, keys, sqlFile;

        keys = Object.keys(this.statRelSql);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            if (this.statRelSql[keys[ix]].indexOf(alias) !== -1) {
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

            case common.Util.TR('WebToB'):
                this.executeStat(this.sql.mid_webtob);
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
        }];

        if (type !== 'process') {
            dataSet.bind.push({
                name: 'totime',
                value: currTime + ':59',
                type: SQLBindType.STRING
            });

            dataSet.bind.push({
                name: 'ws_id',
                value: this.wasCombo.getValue(),
                type: SQLBindType.INTEGER
            });

            if (type === 'active' || type === 'brun') {
                dataSet.bind.push({
                    name: 'currtime',
                    value: this.indicatorTime,
                    type: SQLBindType.STRING
                });
            }
        } else {
            dataSet.bind.push({
                name: 'was_id',
                value: this.wasCombo.getValue(),
                type: SQLBindType.INTEGER
            });

            dataSet.bind.push({
                name: 'server_type',
                value: 3,
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
                    this.executeSecFrame(this.sql.bot_sec_active, 'active');
                } else {
                    this.executeActive(this.sql.bot_active, 'active');
                }
                break;

            case common.Util.TR('Process'):
                this.executeActive(this.sql.bot_process, 'process');
                break;

            case common.Util.TR('BlockRun'):
                lastTime = this.getConvertTime(tab.lastTime, 'hm');
                indicatorTime = this.getConvertTime(this.indicatorTime, 'hm');

                if (lastTime !== indicatorTime) {
                    this.executeSecFrame(this.sql.bot_sec_brun, 'brun');
                } else {
                    this.executeActive(this.sql.bot_active, 'brun');
                }
                break;

            default:
                break;
        }
    },

    clickTitle: function(event) {
        var statList, tabName, chartTitle,
            ix, ixLen, keys, data, charts, chart;

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
            okFn: function(type, name, id, me){
                console.info('선택된 타입??', type);
                console.info('선택된 이름??', name);
                console.info('선택된 아이디??', id);

                me.connectChart.setTitle(common.Util.TR(name));
                me.connectChart.alias = id;
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
            view_name: 'web_performance_trend',
            modal: true,
            scope: this
        });

        this.userDefineWindow.init_form();
        this.userDefineWindow.setTitle(common.Util.TR('User Defined'));
        this.userDefineWindow.show();
        this.userDefineWindow.load_list_data();
    }
});