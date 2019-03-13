/**
 * Created by jykim on 2017-03-14.
 */
Ext.define('view.WasTrend', {
    extend: 'Exem.PerformanceTrend',

    midTabInfos: [{
        title: common.Util.TR('Agent Stat'),
        envKey: 'pa_performance_trend_stat',
        type: 'chart',
        charts: [],
        alias: []
    }, {
        title: common.Util.TR('DB Stat'),
        envKey: 'pa_performance_trend_db',
        type: 'chart',
        charts: []
    }, {
        title: common.Util.TR('DB Wait Stat'),
        envKey: 'pa_performance_trend_wait',
        type: 'chart',
        charts: []
    }, {
        title: common.Util.TR('Agent OS Stat'),
        type: 'chart',
        charts: ['OS CPU (%)', 'OS Memory (MB)']
    }, {
        title: common.Util.TR('Lock Tree'),
        type: 'grid'
    }, {
        title: common.Util.TR('GC Stat'),
        envKey: 'pa_performance_trend_gc',
        type: 'chart',
        charts: [],
        alias: []
    }],

    gridEnvKey: 'pa_performance_trend',

    wasStat: {
        'Concurrent Users': 'was_sessions',
        'Queue': 'app_sessions',
        'Active Transactions': 'active_txns',
        'Total DB Connections': 'db_sessions',
        'Active DB Connections': 'active_db_sessions',
        'SQL Elapse Time': 'sql_elapse',
        'SQL Execute Count': 'sql_exec_count',
        'SQL Prepare Count': 'sql_prepare_count',
        'SQL Fetch Count': 'sql_fetch_count',
        'JVM CPU Usage (%)': 'jvm_cpu_usage',
        'JVM Free Heap (MB)': 'jvm_free_heap',
        'JVM Heap Size (MB)': 'jvm_heap_size',
        'JVM Used Heap (MB)': 'jvm_used_heap',
        'JVM Memory Size (MB)': 'jvm_mem_size',
        'JVM Thread Count': 'jvm_thread_count',
        'OS CPU (%)': 'os_cpu',
        'TPS': 'tps',
        'OS CPU Sys (%)': 'os_cpu_sys',
        'OS CPU User (%)': 'os_cpu_user',
        'OS CPU IO (%)': 'os_cpu_io',
        'OS Free Memory (MB)': 'os_free_memory',
        'OS Total Memory (MB)': 'os_total_memory',
        'OS Send Packets': 'os_send_packets',
        'OS Rcv Packets': 'os_rcv_packets',
        'Active Users': 'active_client_ip',
        'Elapse Time': 'txn_elapse'
    },

    gcStat: {
        'Compile Count': 'compiles',
        'Compile Time (Sec)': 'compile_time',
        'Class Loaded Count': 'loaded',
        'Class Count': 'class_count',
        'Class Loader Time (Sec)': 'class_loader_time',
        'Eden Space Maximum Size (MB)': 'eden_size',
        'Eden Current Size (MB)': 'eden_capacity',
        'Eden Used Size (MB)': 'eden_used',
        'Full GC Count': 'fgc',
        'Full GC Time (Sec)': 'old_gc_time',
        'Old Current Size (MB)': 'old_capacity',
        'Old Maximum Size (MB)': 'old_size',
        'Old Used Size (MB)': 'old_used',
        'Perm Space Current Size (MB)': 'perm_capacity',
        'Perm Space Maximum Size (MB)': 'perm_size',
        'Perm Space Used Size (MB)': 'perm_used',
        'Survivor 0 Current Size (MB)': 's0_capacity',
        'Survivor 0 Maximum Size (MB)': 's0_size',
        'Survivor 0 Used Size (MB)': 's0_used',
        'Survivor 1 Current Size (MB)': 's1_capacity',
        'Survivor 1 Maximum Size (MB)': 's1_size',
        'Survivor 1 Used Size (MB)': 's1_used',
        'Total GC Count': 'jvm_gc_count',
        'Total GC Time (Sec)': 'jvm_gc_time',
        'Young GC Count': 'ygc',
        'Young GC Time (Sec)': 'eden_gc_time'
    },

    initProperty: function() {
        var ix, ixLen,
            tabInfo, lastType;

        lastType = Comm.web_env_info['pa_performance_trend_last_type'];
        for (ix = 0, ixLen = this.midTabInfos.length; ix < ixLen; ix++) {
            tabInfo = this.midTabInfos[ix];
            if (tabInfo.envKey) {
                tabInfo.charts = Comm.web_env_info[tabInfo.envKey + '_' + lastType];
                if (tabInfo.title === common.Util.TR('Agent Stat') || tabInfo.title === common.Util.TR('GC Stat')) {
                    tabInfo.alias = Comm.web_env_info[tabInfo.envKey + '_id_' + lastType];
                }
            }
        }
    },

    init: function() {
        this.initProperty();
        this.callParent();
    },

    setDbList: function(data) {
        var dbList = [],
            ix, ixLen, rowData, sessionGrid;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            rowData = data[ix];
            dbList.push({
                name: rowData[0],
                value: rowData[1]
            });
        }

        this.dbCombo.setData(dbList);
        this.dbCombo.setSearchField('name');

        if (dbList.length > 0) {
            this.dbCombo.setValue(dbList[0].value);
            this.dbCombo.enable();

            sessionGrid = this.gridList[common.Util.TR('Active Sesstion')];
            if (sessionGrid) {
                sessionGrid.down('[dataIndex = cpu_time]').show();
                sessionGrid.down('[dataIndex = wait_time]').show();
                sessionGrid.down('[dataIndex = logical_reads]').show();
                sessionGrid.down('[dataIndex = physical_reads]').show();
                sessionGrid.down('[dataIndex = wait_info]').show();
                sessionGrid.down('[dataIndex = mem_usage]').show();
            }

        } else {
            this.dbCombo.setValue('');
            this.dbCombo.disable();

            this.midPanel.items.items[1].tab.setVisible(false);
            this.midPanel.items.items[2].tab.setVisible(false);
            this.midPanel.items.items[4].tab.setVisible(false);

            sessionGrid = this.gridList[common.Util.TR('Active Session')];
            if (sessionGrid) {
                sessionGrid.down('[dataIndex = cpu_time]').hide();
                sessionGrid.down('[dataIndex = wait_time]').hide();
                sessionGrid.down('[dataIndex = logical_reads]').hide();
                sessionGrid.down('[dataIndex = physical_reads]').hide();
                sessionGrid.down('[dataIndex = wait_info]').hide();
                sessionGrid.down('[dataIndex = mem_usage]').hide();
            }
        }
    },

    addLockTreeColumns: function(grid) {
        grid.beginAddColumns();
        grid.addColumn(common.Util.CTR('SID'             ) , 'hold_sid'          , 100, Grid.String, true , false , 'treecolumn');
        grid.addColumn(common.Util.CTR('Hold Lock Type'  ) , 'hold_lock_type'    , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Hold Mode'       ) , 'hold_mode'         , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Wait Lock Type'  ) , 'wait_lock_type'    , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Request Mode'    ) , 'req_mode'          , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Wait Object ID'  ) , 'object_id'         , 100, Grid.String, true , false );
        grid.addColumn('Hold DB ID'        , 'hold_db_id'        , 100, Grid.String, false , true );
        grid.addColumn('Wait DB ID'        , 'wait_db_id'        , 100, Grid.String, false , true );
        grid.addColumn('Dead Lock'          , 'dead_lock'         , 100, Grid.String, false, true  );
        grid.addColumn(common.Util.CTR('Agent'             ) , 'was_name'          , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Transaction'     ) , 'txn_name'          , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Class Method'    ) , 'class_method'      , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Client IP'       ) , 'client_ip'         , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Login Name'      ) , 'login_name'        , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Start Time'      ) , 'start_time'        , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('CPU Time'        ) , 'cpu_time'          , 100, Grid.String, true , false );
        grid.addColumn('Elapse Time (AVG)'                 , 'avg_elapse'        , 100, Grid.String, false, true  );
        grid.addColumn(common.Util.CTR('Elapse Time'     ) , 'elapse_time'       , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Thread CPU'      ) , 'thread_cpu'        , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('IO Read'         ) , 'io_read'           , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('IO Write'        ) , 'io_write'          , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('DB Time'         ) , 'db_time'           , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Wait Time'       ) , 'wait_time'         , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Pool'            ) , 'pool_name'         , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Instance'        ) , 'instance_name'     , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('State'           ) , 'state'             , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('SQL 1'           ) , 'sql1'              , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('SQL 2'           ) , 'sql2'              , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('SQL 3'           ) , 'sql3'              , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('SQL 4'           ) , 'sql4'              , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('SQL 5'           ) , 'sql5'              , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('SQL Execution Count') , 'sql_execute_count' , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Fetch Count'     ) , 'fetch_count'       , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Prepare Count'   ) , 'prepare_count'     , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('PGA Usage (MB)'   ) , 'pga'               , 100, Grid.Float, true , false );
        grid.addColumn(common.Util.CTR('Logical Reads'   ) , 'logical_reads'     , 100, Grid.String, true , false );
        grid.addColumn(common.Util.CTR('Physical Reads'  ) , 'physical_reads'    , 100, Grid.String, true , false );
        grid.addColumn('WAS ID'            , 'was_id'            , 100, Grid.String, false, true  );
        grid.addColumn(common.Util.CTR('Wait Info'       ) , 'wait_info'         , 100, Grid.String, true , false );
        grid.addColumn('TID'               , 'tid'               , 100, Grid.String, false, true  );
        grid.addColumn('Current CRC'       , 'current_crc'       , 100, Grid.String, false, true  );
        grid.addColumn('SQL ID1'           , 'sql_id1'           , 100, Grid.String, false, true  );
        grid.addColumn('SQL ID2'           , 'sql_id2'           , 100, Grid.String, false, true  );
        grid.addColumn('SQL ID3'           , 'sql_id3'           , 100, Grid.String, false, true  );
        grid.addColumn('SQL ID4'           , 'sql_id4'           , 100, Grid.String, false, true  );
        grid.addColumn('SQL ID5'           , 'sql_id5'           , 100, Grid.String, false, true  );
        grid.addColumn('Transaction ID'    , 'txn_id'            , 100, Grid.String, false, true  );
        grid.addColumn('Pool ID'           , 'pool_id'           , 100, Grid.String, false, true  );
        grid.addColumn('Time'              , 'time'              , 100, Grid.String, false, true  );
        grid.endAddColumns();
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

    setWasNGcData: function(header, data) {
        var charts = this.chartList[this.midPanel.getActiveTab().title],
            param = header.parameters,
            ix, ixLen, jx, jxLen, chart, maxLiteral, dataIndex, rowData, tempSeries, time;

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            chart = charts[ix];
            chart.clearValues();

            if (chart.title === common.Util.TR( 'Elapse Time' )) {
                tempSeries = chart.getSeries(0);
                tempSeries.hideLegend = true;
                tempSeries.labelObj.hidden = false;

                chart.setSeriesVisible(0, false);
                chart.setSeriesLegendVisible(0, false);
            }

            if (chart.title === common.Util.TR( 'JVM Free Heap (MB)' ) && chart.title === common.Util.TR('OS Free Memory (MB)')) {
                chart.setLegendText(0, common.Util.CTR('AVG'));
                chart.setLegendText(1, common.Util.CTR('MIN'));
                maxLiteral = '_avg';
            } else {
                chart.setLegendText(0, common.Util.CTR('MAX'));
                chart.setLegendText(1, common.Util.CTR('AVG'));
                maxLiteral = '_max';
            }

            chart.setChartRange(+new Date(param.bind[0].value) , +new Date(param.bind[1].value));

            dataIndex = data.columns.indexOf(chart.alias + maxLiteral);
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

    setDbNWaitData: function(header, data, statName) {
        var charts = this.chartList[this.midPanel.getActiveTab().title],
            param = header.parameters,
            ix, ixLen, jx, jxLen, chart, rowData, time;

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            chart = charts[ix];

            if (statName) {
                if (chart.alias !== statName) {
                    continue;
                }
            } else {
                if (chart.title === 'CPU Usage' || chart.title === 'Latch Wait Time (Total)') {
                    continue;
                }
            }

            chart.clearValues();

            chart.setLegendText(0, chart.title);
            chart.setChartRange(+new Date(param.bind[0].value), +new Date(param.bind[1].value));

            for (jx = 0, jxLen = data.rows.length; jx < jxLen; jx++) {
                rowData = data.rows[jx];
                time = +new Date(rowData[0]);

                if (chart.title === 'CPU Usage') {
                    chart.addValue(0, [time, rowData[2]]);
                } else if (chart.title === 'Latch Wait Time (Total)') {
                    chart.addValue(0, [time, rowData[3]]);
                } else {
                    if (rowData[2] === chart.title) {
                        chart.addValue(0, [time, rowData[3]]);
                    }
                }
            }

            chart.setFillData(null);

            chart.prevZoomFrom = +new Date(this.datePicker.getFromDateTime());
            chart.prevZoomTo = +new Date(this.datePicker.getToDateTime());
            chart.zoomIn(+new Date(this.zoomFrom), +new Date(this.zoomTo));

            chart.plotReSize();
        }
    },

    getTreeData: function(data, type) {
        var isHoldSid = false,
            mode = common.DataModule.referenceToDB.lockType[data[3]],
            treeData;

        if (type === 'hold_sid') {
            isHoldSid = true;
        }

        treeData = [
            isHoldSid ? data[1] : data[9]   //hold_sid
            ,isHoldSid ? data[2] : '--'     //hold_lock_type
            ,isHoldSid ? mode : '--'        //hold_mode
            ,isHoldSid ? '--' : data[4]     //wait_lock_type
            ,isHoldSid ? '--' : mode        //req_mode
            ,isHoldSid ? '0' : data[6]      //object_id
            ,isHoldSid ? data[7] : ''       //hold_db_id
            ,isHoldSid ? '' : data[8]       //wait_db_id
            ,''        //'dead_lock'
            ,''        //'was_name'
            ,''        //'txn_name'
            ,''        //'class_method'
            ,''        //'client_ip'
            ,''        //'login_name'
            ,''        //'start_time'
            ,''        //'cpu_time'
            ,''        //'avg_elapse'
            ,''        //'elapse_time'
            ,''        //'thread_cpu'
            ,''        //'io_read'
            ,''        //'io_write'
            ,''        //'db_time'
            ,''        //'wait_time'
            ,''        //'pool_name'
            ,''        //'instance_name'
            ,''        //'state'
            ,''        //'sql1'
            ,''        //'sql2'
            ,''        //'sql3'
            ,''        //'sql4'
            ,''        //'sql5'
            ,''        //'sql_execute_count'
            ,''        //'fetch_count'
            ,''        //'prepare_count'
            ,''        //'pga'
            ,''        //'logical_reads'
            ,''        //'physical_reads'
            ,''        //'was_id'
            ,''        //'wait_info'
            ,''        //'tid'
            ,''        //'current_crc'
            ,''        //'sql_id1'
            ,''        //'sql_id2'
            ,''        //'sql_id3'
            ,''        //'sql_id4'
            ,''        //'sql_id5'
            ,''        //'txn_id'
            ,''        //'pool_id'
            ,''        //'time'
        ];

        return treeData;
    },

    setActiveToLockTree: function() {
        var lockTree = this.gridList[common.Util.TR('Lock Tree')],
            activeSessionGrid = this.gridList[common.Util.TR('Active Session')],
            ix, ixLen, jx, jxLen, treeData, gridData, sid, rowData, node;

        if (activeSessionGrid.gridStore.getCount() === 0) {
            return;
        }

        treeData = lockTree.getTreeDataList();
        gridData = activeSessionGrid.gridStore.data.items;

        for (ix = 0, ixLen = treeData.length; ix < ixLen; ix++) {
            sid = treeData[ix].data.hold_sid;

            lockTree.beginTreeUpdate();

            for (jx = 0, jxLen = gridData.length; jx < jxLen; jx++) {
                rowData = gridData[jx];

                if (sid === +rowData.data.sid) {
                    node = lockTree.findNode('hold_sid', sid);
                    node.dead_lock =  1;
                    node.was_name      =  rowData.data.was_name;
                    node.txn_name      =  rowData.data.txn_name;
                    node.class_method  =  rowData.data.class_method;
                    node.client_ip     =  rowData.data.client_ip;
                    node.login_name    =  rowData.data.login_name;
                    node.start_time    =  rowData.data.start_time;
                    node.cpu_time      =  rowData.data.cpu_time;
                    node.avg_elapse    =  rowData.data.avg_elapse;
                    node.elapse_time   =  rowData.data.elapse_time;
                    node.thread_cpu    =  rowData.data.thread_cpu;
                    node.io_read       =  rowData.data.io_read;
                    node.io_write      =  rowData.data.io_write;
                    node.db_time       =  rowData.data.db_time;
                    node.wait_time     =  rowData.data.wait_time;
                    node.pool_name     =  rowData.data.pool_name;
                    node.instance_name =  rowData.data.instance_name;
                    node.state         =  rowData.data.state;
                    node.sql1          =  rowData.data.sql_text1;
                    node.sql2          =  rowData.data.sql_text2;
                    node.sql3          =  rowData.data.sql_text3;
                    node.sql4          =  rowData.data.sql_text4;
                    node.sql5          =  rowData.data.sql_text5;
                    node.sql_execute_count =  rowData.data.sql_execute_count;
                    node.fetch_count       =  rowData.data.fetch_count;
                    node.prepare_count     =  rowData.data.prepare_count;
                    node.pga               =  rowData.data.mem_usage;
                    node.logical_reads     =  rowData.data.logical_reads;
                    node.physical_reads    =  rowData.data.physical_reads;
                    node.was_id            =  rowData.data.was_id;
                    node.wait_info         =  rowData.data.wait_info;
                    node.tid               =  rowData.data.tid;
                    node.current_crc       =  rowData.data.current_crc;
                    node.sql_id1           =  rowData.data.sql_id1;
                    node.sql_id2           =  rowData.data.sql_id2;
                    node.sql_id3           =  rowData.data.sql_id3;
                    node.sql_id4           =  rowData.data.sql_id4;
                    node.sql_id5           =  rowData.data.sql_id5;
                    node.txn_id            =  rowData.data.txn_id;
                    node.pool_id           =  rowData.data.pool_id;
                    node.time              =  rowData.data.end_time;
                }
            }

            lockTree.drawTree();
            lockTree.endTreeUpdate();
        }
    },

    setLockTreeData: function(data) {
        var lockTree = this.gridList[common.Util.TR('Lock Tree')],
            ix, ixLen, rowData, hSid, wSid, holdNode, waitNode, deadLockNode;

        lockTree.clearNodes();
        lockTree.beginTreeUpdate();

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            rowData = data.rows[ix];

            hSid = rowData[1];
            wSid = rowData[9];

            holdNode = lockTree.findNode('hold_sid', hSid);
            if (!holdNode) {
                holdNode = lockTree.addNode(null, this.getTreeData(rowData, 'hold_sid'));
            }

            waitNode = lockTree.findNode('wait_sid', wSid);
            if (!waitNode) {
                waitNode = lockTree.addNode(holdNode, this.getTreeData(rowData, 'wait_sid'));
            } else {
                deadLockNode = lockTree.findNode('hold_sid', hSid);
                if (!deadLockNode) {
                    lockTree.moveNode(holdNode, waitNode);
                } else {
                    lockTree.addNode(waitNode, this.getTreeData(rowData, 'wait_sid'));
                }
            }
        }

        lockTree.drawTree();
        lockTree.endTreeUpdate();

        this.setActiveToLockTree();
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

        if (Comm.currentRepositoryInfo.database_type === 'Oracle' || Comm.currentRepositoryInfo.database_type === 'MSSQL') {
            data.columns = common.Util.toLowerCaseArray(data.columns);
        }

        switch (header.command) {
            case this.sql.mid_was:
                this.setWasNGcData(header, data);
                break;

            case this.sql.mid_os:
                this.setOsData(header, data);
                break;

            case this.sql.mid_db:
                this.setDbNWaitData(header, data);
                break;

            case this.sql.mid_db_os:
                this.setDbNWaitData(header, data, 'CPU Usage');
                break;

            case this.sql.mid_wait:
                this.setDbNWaitData(header, data);
                break;

            case this.sql.mid_wait_latch:
                this.setDbNWaitData(header, data, 'Latch Wait Time (Total)');
                break;

            case this.sql.mid_gc:
                this.setWasNGcData(header, data);
                break;

            case this.sql.mid_lock:
                this.setLockTreeData(data);
                isLockTree = true;
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
            rowData, bindValues, binds, bindStr, startTime, state,
            ix, ixLen, jx, jxLen;

        grid.clearRows();
        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            rowData = data.rows[ix];

            bindValues = [];
            binds = common.Util.convertBindList(rowData[23]);
            for (jx = 0, jxLen = binds.length; jx < jxLen; jx++) {
                bindValues.push(binds[jx].value);
            }

            bindStr = bindValues.join(', ');
            startTime = this.getConvertTime(new Date(rowData[8]), 'hms');
            state = common.DataModule.threadStateType[rowData[22]];

            grid.addRow([
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

        grid.drawGrid();

        //this.labelTime.setText(this.indicatorTime);
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

    setSessionSummaryGrid: function(data) {
        var grid = this.gridList[common.Util.TR('Active Session (SUM)')],
            ix, ixLen, rowData;

        grid.clearRows();

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            rowData = data.rows[ix];

            grid.addRow([
                rowData[0]
                ,rowData[1]
                ,rowData[2]
                ,rowData[4]
                ,rowData[5]
                ,rowData[6]
                ,rowData[7]
                ,rowData[8]
                ,rowData[9]
                ,rowData[10]
                ,rowData[11]
                ,rowData[12]
                ,rowData[13]
                ,common.DataModule.threadStateType[rowData[14]]
                ,rowData[15]
                ,rowData[16]
                ,rowData[17]
                ,rowData[18]
                ,rowData[19]
                ,rowData[20]
                ,rowData[21]
                ,rowData[22]
                ,rowData[23]
                ,rowData[3]
            ]);
        }

        grid.drawGrid();
    },

    onBotData: function(header, data) {
        this.executeCount--;

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.error('PerformaceTrend-onBotData');
            console.error(header);
            console.error(data);
            this.loadingMask.hide();
            return;
        }

        switch (header.command) {
            case this.sql.bot_active:
                this.setSessionGrid(data);
                this.setActiveToLockTree();
                break;

            case this.sql.bot_process:
                this.setProcessGrid(data);
                break;

            case this.sql.bot_active_sum:
                this.setSessionSummaryGrid(data);
                break;

            default:
                break;
        }

        if (!this.executeCount) {
            this.loadingMask.hide();
        }
    },

    onData: function(header, data) {
        this.executeCount--;

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.error('PerformaceTrend-onData');
            console.error(header);
            console.error(data);
            this.loadingMask.hide();
            return;
        }

        switch (header.command) {
            case this.sql.set_db:
                this.setDbList(data.rows);
                break;

            case this.sql.set_pool:
                break;

            case this.sql.top_active:
                this.setActiveTxnData(header, data);
                break;

            case this.sql.mid_sec:
                this.setSec(data.rows, 'lockTree');
                this.executeLockTree(this.sql.mid_lock);
                this.executeActive(this.sql.bot_active, 'active');
                break;

            case this.sql.bot_sec:
                this.setSec(data.rows, 'active');
                this.executeActive(this.sql.bot_active, 'active');
                break;

            default:
                break;
        }
    },

    getDbValue: function(value) {
        if (!value) {
            value = this.wasCombo.getValue();
        }

        if (WS.connect_state == 1) {
            WS.SQLExec({
                sql_file: this.sql.set_pool,
                replace_string: [{ name: 'was_id', value: value }]
            }, this.onData, this);
            this.executeCount++;

            WS.SQLExec({
                sql_file: this.sql.set_db,
                bind: [{ name: 'was_id', value: value, type: SQLBindType.INTEGER }]
            }, this.onData, this);
            this.executeCount++;
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

    checkStat: function(charts, statName) {
        var ix, ixLen,
            isExist = false;

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            if (charts[ix].alias === statName) {
                isExist = true;
                break;
            }
        }

        return isExist;
    },

    executeDbStat: function(sqlFile, type, tabName) {
        var dataSet = {},
            ix, ixLen, statNames, charts;

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
            name: 'db_id',
            value: !this.dbCombo.getValue() ? -1 : this.dbCombo.getValue(),
            type: SQLBindType.INTEGER
        }, {
            name: 'fromdate',
            value: common.Util.getDateFormat(this.datePicker.getFromDateTime()),
            type: SQLBindType.STRING
        }, {
            name: 'todate',
            value: common.Util.getDateFormat(this.datePicker.getToDateTime()),
            type: SQLBindType.STRING
        }];

        if (type === 'db' || type === 'wait') {
            charts = this.chartList[tabName];
            statNames = [];
            for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
                statNames.push(charts[ix].alias);
            }

            dataSet.replace_string = [{
                name: type === 'db' ? 'stat_name' : 'event_name',
                value: '\'' + statNames.join('\',\'') + '\''
            }];
        }

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onMidData, this);
        this.executeCount++;
    },

    executeLockTree: function(sqlFile) {
        if (!this.dbCombo.getValue()) {
            return;
        }

        var dataSet = {},
            time = this.indicatorTime,
            to = new Date(time),
            to2  = new Date(time) ,
            to_time = to2.setSeconds(to.getSeconds() + 1);

        dataSet.sql_file = sqlFile;
        dataSet.bind = [{
            name: 'fromtime',
            value: time,
            type: SQLBindType.STRING
        }, {
            name: 'totime'  ,
            value: common.Util.getDate(to_time),
            type: SQLBindType.STRING
        }, {
            name: 'db_id'   ,
            value: this.dbCombo.getValue(),
            type: SQLBindType.INTEGER
        }];

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onMidData, this);
        this.executeCount++;
    },

    executeMidSQL: function() {
        var tab = this.midPanel.getActiveTab(),
            tabName = tab.title,
            lastTime, indicatorTime;

        switch (tabName) {
            case common.Util.TR('Agent Stat'):
                this.executeStat(this.sql.mid_was);
                break;

            case common.Util.TR('DB Stat'):
                this.executeDbStat(this.sql.mid_db, 'db', tabName);
                if (this.checkStat(this.chartList[tabName], 'CPU Usage') || this.checkStat(this.chartList[tabName], 'free memory')) {
                    this.executeDbStat(this.sql.mid_db_os, 'os');
                }
                break;

            case common.Util.TR('DB Wait Stat'):
                this.executeDbStat(this.sql.mid_wait, 'wait', tabName);
                if (this.checkStat(this.chartList[tabName], 'Latch Wait Time (Total)')) {
                    this.executeDbStat(this.sql.mid_wait_latch, 'latch');
                }
                break;

            case common.Util.TR('Agent OS Stat'):
                this.executeStat(this.sql.mid_os);
                break;

            case common.Util.TR('Lock Tree'):
                lastTime = this.getConvertTime(tab.lastTime, 'hm');
                indicatorTime = this.getConvertTime(this.indicatorTime, 'hm');

                if (lastTime !== indicatorTime) {
                    this.executeSecFrame(this.sql.mid_sec, 'lockTree');
                    tab.lastTime = this.indicatorTime;
                } else {
                    this.executeLockTree(this.sql.mid_lock);
                }

                break;

            case common.Util.TR('GC Stat'):
                this.executeStat(this.sql.mid_gc);
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

        WS.SQLExec(dataSet, this.onBotData, this);
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
                this.executeActive(this.sql.bot_active_sum, 'summary');
                break;

            default:
                break;
        }
    },

    setStatList: function(data, tabName) {
        var srcList, destList,
            ix, ixLen, keys;

        if (tabName == common.Util.TR('Agent Stat')) {
            destList = data.Stat;
            srcList = this.wasStat;
        } else if (tabName == common.Util.TR('GC Stat')) {
            destList = data.GC;
            srcList = this.gcStat;
        } else {
            return;
        }

        keys = Object.keys(srcList);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            destList.push({ name: keys[ix], value: srcList[keys[ix]] });
        }
    },

    clickTitle: function(event) {
        var isDB = false, isWait = false, isPool = false,
            statList, tabName, chartTitle,
            ix, ixLen, charts, chart;

        if (this.indicatorTime === undefined) {
            return;
        }

        if (this.statChangeWindow) {
            this.statChangeWindow.removeAll();
        }

        chartTitle = event.currentTarget.textContent;
        tabName = this.midPanel.getActiveTab().title;
        statList = {
            Stat: [],
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

        this.setStatList(statList, tabName);
        if (tabName === common.Util.TR('DB Stat')) {
            isDB = true;
        } else if (tabName === common.Util.TR('DB Wait Stat')) {
            isWait = true;
        }

        this.statChangeWindow = Ext.create('view.PerformanceTrendStatChangeWindow',{
            instanceId: this.useDbCombo ? this.dbCombo.getValue() : null,
            was_id: this.wasCombo.getValue(),
            stat_data: statList,
            connectChart: chart,
            modal: true,
            useTab: {
                stat : statList.Stat.length > 0,
                db   : isDB,
                wait : isWait,
                gc   : statList.GC.length > 0,
                pool : isPool
            },
            callbackFn: function() {
                this.statChangeWindow.selectValueByName(chartTitle);
            }.bind(this),
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
    }
});