/**
 * Created by jykim on 2017-04-03.
 */
Ext.define('view.CDTrend', {
    extend: 'Exem.PerformanceTrend',

    midTabInfos: [{
        title: common.Util.TR('Agent Stat'),
        envKey: 'pa_cd_performance_trend_stat',
        type: 'chart',
        charts: [],
        alias: []
    }, {
        title: common.Util.TR('Agent OS Stat'),
        type: 'chart',
        charts: ['OS CPU (%)', 'OS Memory (MB)']
    }],

    wasStat: {
        'OS CPU (%)': 'os_cpu',
        'TPS': 'tps',
        'OS CPU Sys (%)': 'os_cpu_sys',
        'OS CPU User (%)': 'os_cpu_user',
        'OS CPU IO (%)': 'os_cpu_io',
        'OS Free Memory (MB)': 'os_free_memory',
        'OS Total Memory (MB)': 'os_total_memory',
        'OS Send Packets': 'os_send_packet',
        'OS Rcv Packets': 'os_rcv_packet'
    },

    statRelSql: {
        mid_was: ['os_cpu', 'os_cpu_sys', 'os_cpu_user', 'os_cpu_io',
            'os_free_memory', 'os_total_memory', 'os_send_packet', 'os_rcv_packet', 'tps', 'elapse_time']
    },

    responseStatusColors: [
        '#90db3b', '#2b99f0', '#f7dc44', '#e7782e', '#e11f2d'
    ],

    useDbCombo: false,
    gridEnvKey: 'pa_cd_performance_trend',

    initProperty: function() {
        var ix, ixLen,
            tabInfo, lastType, microElapse;

        // microsign으로 인해 따로 처리
        microElapse = 'Elapse Time (' + decodeURI('%C2%B5') + 's)';
        this.wasStat[microElapse] = 'elapse_time';

        lastType = Comm.web_env_info['pa_cd_performance_trend_last_type'];
        for (ix = 0, ixLen = this.midTabInfos.length; ix < ixLen; ix++) {
            tabInfo = this.midTabInfos[ix];
            if (tabInfo.envKey) {
                tabInfo.charts = Comm.web_env_info[tabInfo.envKey + '_' + lastType];
                if (tabInfo.title === common.Util.TR('Agent Stat')) {
                    tabInfo.alias = Comm.web_env_info[tabInfo.envKey + '_id_' + lastType];
                }
            }
        }

        this.sql.top_active     = 'IMXPA_CDTrend_Top_Active.sql';

        this.sql.mid_was        = 'IMXPA_CDTrend_Mid_Was.sql';   //agent 지표
        this.sql.mid_os         = 'IMXPA_CDTrend_Mid_Os.sql';   // agent os 지표
    },

    init: function() {
        this.initProperty();
        this.callParent();

        this.secFrames.brun = [];
        this.existSecTimes.brun = [];

        this.botPanel.items.items[0].tab.setVisible(false);
        this.botPanel.items.items[2].tab.setVisible(false);
        this.botPanel.setActiveTab(1);
    },

    comboSelectFn: function(value) {
        // Dummy Function
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


            for (jx = 0, jxLen = data.rows.length; jx < jxLen; jx++) {
                if (dataIndex === -1) {
                    continue;
                }

                rowData = data.rows[jx];
                time = +new Date(rowData[0]);

                chart.addValue(0, [time, rowData[dataIndex]]);
                chart.addValue(1, [time, rowData[dataIndex + 1]]);

            }

            chart.setFillData(null);

            chart.prevZoomFrom = +new Date(this.datePicker.getFromDateTime());
            chart.prevZoomTo = +new Date(this.datePicker.getToDateTime());
            chart.zoomIn(+new Date(this.zoomFrom), +new Date(this.zoomTo));

            chart.plotReSize();
        }
    },

    setWebToBData: function(header, data) {
    },

    onMidData: function(header, data) {
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

            case this.sql.bot_process:
                this.setProcessGrid(data);
                isLoadingMaskHide = true;
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

        if (type === 'process') {
            dataSet.bind.push({
                name: 'was_id',
                value: this.wasCombo.getValue(),
                type: SQLBindType.INTEGER
            });

            dataSet.bind.push({
                name: 'server_type',
                value: 15,
                type: SQLBindType.INTEGER
            });
        }

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onData, this);
        this.executeCount++;
    },

    executeBotSQL: function() {
        var tab = this.botPanel.getActiveTab(),
            tabName = tab.title;

        switch (tabName) {
            case common.Util.TR('Process'):
                this.executeActive(this.sql.bot_process, 'process');
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
            DB  : [],
            Wait: [],
            GC  : [],
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
            view_name: 'cd_performance_trend',
            modal: true,
            scope: this
        });

        this.userDefineWindow.init_form();
        this.userDefineWindow.setTitle(common.Util.TR('User Defined'));
        this.userDefineWindow.show();
        this.userDefineWindow.load_list_data();
    }
});