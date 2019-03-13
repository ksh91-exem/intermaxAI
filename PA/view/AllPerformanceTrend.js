/**
 * Created by jykim on 2017-09-12.
 */
Ext.define('view.AllPerformanceTrend', {
    extend: 'Exem.FormOnCondition',
    width: '100%',
    height: '100%',
    rangeOnly: true,
    singeField: false,
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },

    agentStat: {
        WAS: {
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
        TP: {
            'Active Transactions': 'active_txns',
            'TPS': 'tps',
            'Transaction Count': 'txn_cnt',
            'Transaction Count (SUM)': 'txn_cnt_sum',
            'Elapse Time': 'elapse',
            'Process Count': 'proc_cnt',
            'Client Count': 'client_cnt',
            'Queuing Count': 'q_cnt',
            'Queuing Count (SUM)': 'q_cnt_sum',
            'Queuing Time': 'q_time',
            'AQ Count': 'aq_cnt',
            'AQ Count (SUM)': 'aq_cnt_sum',
            'Failure Count': 'fail_cnt',
            'Failure Count (SUM)': 'fail_cnt_sum',
            'Error Count' : 'err_cnt',
            'Error Count (SUM)': 'err_cnt_sum',
            'Emit Count (SUM)': 'em_cnt_sum',
            'Queue Purge Count (SUM)': 'qp_cnt_sum',
            'OS CPU Sys (%)': 'os_cpu_sys',
            'OS CPU User (%)': 'os_cpu_user',
            'OS CPU IO (%)': 'os_cpu_io',
            'OS Free Memory (MB)': 'os_free_memory',
            'OS Total Memory (MB)': 'os_total_memory',
            'OS Send Packets': 'os_send_packet',
            'OS Rcv Packets': 'os_rcv_packet'
        },
        TUX: {
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
        WEB: {
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
            'Elapse Time': 'elapse_time'
        },
        CD: {
            'OS CPU (%)': 'os_cpu',
            'TPS': 'tps',
            'OS CPU Sys (%)': 'os_cpu_sys',
            'OS CPU User (%)': 'os_cpu_user',
            'OS CPU IO (%)': 'os_cpu_io',
            'OS Free Memory (MB)': 'os_free_memory',
            'OS Total Memory (MB)': 'os_total_memory',
            'OS Send Packets': 'os_send_packet',
            'OS Rcv Packets': 'os_rcv_packet'
        }
    },

    gcStat: {
        WAS: {
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
        }
    },

    tabList: {
        WAS: {
            stat: common.Util.TR('Agent Stat'),
            gc: common.Util.TR('GC Stat')
        },
        TP: {
            stat: common.Util.TR('Agent Stat')
        },
        TUX: {
            stat: common.Util.TR('Agent Stat')
        },
        WEB: {
            stat: common.Util.TR('Agent Stat')
        },
        CD: {
            stat: common.Util.TR('Agent Stat')
        }
    },

    sql: {
        WAS: {
            stat: 'IMXPA_All_WasTrend_AgentStat.sql',
            gc: 'IMXPA_All_WasTrend_GCStat.sql'
        },
        TP: {
            stat: 'IMXPA_All_TPTrend_AgentStat.sql'
        },
        TUX: {
            stat: 'IMXPA_All_TuxTrend_AgentStat.sql'
        },
        WEB: {
            stat: 'IMXPA_All_WebTrend_AgentStat.sql'
        },
        CD: {
            stat: 'IMXPA_All_CDTrend_AgentStat.sql'
        }
    },

    initProperty: function() {
        var monitorType = this.monitorType,
            envKey = 'pa_' + monitorType.toLowerCase() + '_performance_trend_all',
            lastType = Comm.web_env_info[envKey + '_last_type'],
            tabs = this.tabList[monitorType],
            tabKeys = Object.keys(tabs),
            ix, ixLen, tabKey;

        this.stats = {};
        for (ix = 0, ixLen = tabKeys.length; ix < ixLen; ix++) {
            tabKey = tabKeys[ix];
            this.stats[tabs[tabKey]] = {
                names: Comm.web_env_info[envKey + '_' + tabKey + '_' + lastType],
                statNames: Comm.web_env_info[envKey + '_' + tabKey + '_id_' + lastType],
                sqlKey: tabKey
            };
        }
    },

    init: function() {
        this.initProperty();

        this.chartList = {};
        this.isChangeStat = false;

        switch (nation) {
            case 'ko' :
                this.LABEL_FORMAT = '____-__-__ __:__:__';
                break;
            case 'zh-CN':
            case 'ja' :
                this.LABEL_FORMAT = '____/__/__ __:__:__';
                break;
            case 'en' :
                this.LABEL_FORMAT = '__/__/____ __:__:__';
                break;
            default:
                break;
        }

        this.createLayout();
    },

    getConvertTime: function(time, type) {
        var tempTime, tempStr;

        tempTime = new Date(time);
        if (type === 'hm') {
            tempStr = ('0' + tempTime.getHours()).slice(-2) + ':' +
                ('0' + tempTime.getMinutes()).slice(-2);
        } else if (type === 'hms') {
            tempStr = ('0' + time.getHours()).slice(-2) + ':' +
                ('0' + time.getMinutes()).slice(-2) + ':' +
                ('0' + time.getSeconds()).slice(-2);
        } else if (type === 'ymd') {
            tempStr = (tempTime.getFullYear() + '-' +
            ('0' + (tempTime.getMonth() + 1)).slice(-2) + '-' +
            ('0' + tempTime.getDate()).slice(-2));
        } else {
            tempStr = (tempTime.getFullYear() + '-' +
            ('0' + (tempTime.getMonth() + 1)).slice(-2) + '-' +
            ('0' + tempTime.getDate()).slice(-2) + ' ' +
            ('0' + tempTime.getHours()).slice(-2) + ':' +
            ('0' + tempTime.getMinutes()).slice(-2));
        }

        return tempStr;
    },

    addBtn: function(target, itemId, cls) {
        var btn, separator;

        btn = Ext.create('Ext.container.Container',{
            itemId: itemId,
            width : itemId === 'btn_move' ? 31 : 21,
            height: 18,
            cls   : cls,
            listeners:{
                scope: this,
                render: function(me) {
                    me.getEl().on('click', function() {
                        var itemId = me.itemId,
                            moveTimeWindow, currTime, moveTime, fromTime, toTime;

                        if (itemId === 'btn_move') {
                            moveTimeWindow = Ext.create('view.PerformanceTrendMoveTime', {
                                parent: this,
                                was_name: this.wasCombo.WASDBCombobox.rawValue,
                                db_name: null,
                                isTpMode: true,
                                log_date: this.getConvertTime(this.indicatorTime, 'ymd')
                            });

                            moveTimeWindow.init(this.getConvertTime(this.indicatorTime, 'hm'));
                        } else {
                            fromTime = common.Util.getDate(this.datePicker.getFromDateTime() + ':00');
                            toTime = common.Util.getDate(this.datePicker.getToDateTime() + ':00');

                            currTime = this.indicatorTime;
                            moveTime = new Date(currTime);

                            switch (itemId) {
                                case 'btn_prev':
                                    if (currTime <= fromTime) {
                                        return;
                                    }

                                    moveTime = common.Util.getDate(moveTime.setMinutes(moveTime.getMinutes() - 1));
                                    break;

                                case 'btn_next':
                                    if (currTime >= toTime) {
                                        return;
                                    }

                                    moveTime = common.Util.getDate(moveTime.setMinutes(moveTime.getMinutes() + 1));
                                    break;

                                case 'btn_first':
                                    if (currTime <= fromTime) {
                                        return;
                                    }

                                    moveTime = fromTime;
                                    break;

                                case 'btn_last':
                                    if (currTime >= toTime) {
                                        return;
                                    }

                                    moveTime = toTime;
                                    break;

                                default :
                                    break;
                            }

                            this.setIndicatorTime(moveTime);
                            this.moveIndicator();
                        }
                    }.bind(this));
                }
            }
        });

        separator = Ext.create('Ext.container.Container',{
            width: 1,
            height: '100%',
            x: 1020,
            margin: '4 0 4 0',
            style: {
                background: '#E3E3E3'
            }
        });

        target.add(btn, separator);
    },

    moveIndicator: function() {
        var ix, ixLen, indicatorPos, chart,
            tabName, charts;

        tabName = this.tabPanel.getActiveTab().title;
        charts = this.chartList[tabName];

        indicatorPos = {
            x: +new Date(this.indicatorTime),
            y: null
        };

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            chart = charts[ix];
            chart.drawIndicator(indicatorPos);
        }
    },

    setIndicatorTime: function(time) {
        if (time) {
            this.indicatorTime = time;
        } else {
            this.indicatorTime = this.datePicker.getFromDateTime() + ':00';
        }

        this.labelTime.setText(Ext.util.Format.date(this.indicatorTime, Comm.dateFormat.HMS));
    },

    selectedStat: function(selectedStat, window, chart) {
        var statInfo = selectedStat[0].data;

        chart.setTitle(statInfo.dispName);
        chart.statName = statInfo.statName;

        this.executeSQL();
        window.close();
    },

    clickTitle: function(event) {
        var chartTitle, tabName, statInfo, displayNames, tabInfo,
            charts, chart,
            ix, ixLen;

        if (this.indicatorTime === undefined) {
            return;
        }

        if (this.statChangeWindow) {
            this.statChangeWindow.removeAll();
        }

        chartTitle = event.currentTarget.textContent;
        tabName = this.tabPanel.getActiveTab().title;
        statInfo = this.agentStat[this.monitorType];
        if (tabName === common.Util.TR('GC Stat')) {
            statInfo = this.gcStat[this.monitorType];
        }

        displayNames = Object.keys(statInfo);
        tabInfo = {};

        function addColumns(grid) {
            grid.beginAddColumns();
            grid.addColumn(common.Util.CTR('Display Name'), 'dispName', 400, Grid.String, true , false);
            grid.addColumn(common.Util.CTR('Stat Name'), 'statName', 10, Grid.String, false, true);
            grid.endAddColumns();
        }

        charts = this.chartList[tabName];
        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            if (charts[ix].title === chartTitle) {
                chart = charts[ix];
                break;
            }
        }

        tabInfo[tabName] = [];
        for (ix = 0, ixLen = displayNames.length; ix < ixLen; ix++) {
            tabInfo[tabName].push([common.Util.CTR(displayNames[ix]), statInfo[displayNames[ix]]]);
        }

        this.statChangeWindow = Ext.create('Exem.CommonStatWindow', {
            width : 415,
            height: 545,
            okFn: this.selectedStat.bind(this),
            addColumns: addColumns,
            usePager: false,
            hideGridHeader: true,
            connectChart: chart,
            tabInfo: tabInfo,
            activeTabIndex: 0,
            comboDataIndex: 0,
            comboDataField: 'name',
            selectedList: {
                dataIndex: 'dispName',
                value: chartTitle
            }
        });

        this.statChangeWindow.init();
        this.statChangeWindow.show();
    },

    createChart: function(tabName, title, statName) {
        var self = this,
            monitorType = this.monitorType,
            chart;

        chart = Ext.create('Exem.chart.CanvasChartLayer', {
            height: 50,
            title: common.Util.CTR(title),
            statName: statName ? statName : title,
            interval: PlotChart.time.exMin,
            titleHeight: 17 ,
            titleWidth: 170,
            titleFontSize: '12px',
            showTitle: true,
            showLegend: true,
            showXAxis: false,
            legendWidth: 170,
            legendNameWidth: 150,
            legendTextAlign: 'east',
            showIndicator: true ,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip: true,
            toolTipFormat: '[%s] %x [value:%y]',
            toolTipTimeFormat: '%H:%M',
            fillIntervalValue: true,
            useCustomContextMenu: true,
            cls: 'PerformanceTrend-MidChart',
            chartProperty: {
                yLabelWidth: 55,
                xLabelFont: {size: 8, color: 'black'},
                yLabelFont: {size: 8, color: 'black'},
                xaxis: true,
                colors: realtime.Colors
            },
            xaxisCurrentToTime : true,
            historyInfoDblClick: function(chart, record) {
                self.setIndicatorTime(common.Util.getDate(record.data['TIME']));
                self.moveIndicator();
            },
            plotdblclick : function(event, pos, item, xAxis) {
                var fromTime, toTime;

                if (pos.x < 0 || !xAxis) {
                    return;
                }

                fromTime = +new Date(self.datePicker.getFromDateTime());
                toTime = +new Date(self.datePicker.getToDateTime());

                if (pos.x < fromTime || pos.x > toTime) {
                    return;
                }

                self.setIndicatorTime(common.Util.getDate(xAxis.x));
                self.moveIndicator();
            },
            plothover: function(event, pos, item) {
                if (item) {
                    this.currItem = item;
                } else {
                    this.lastItem = this.currItem;
                    this.currItem = null;
                }
            }
        });

        chart._addSubMenu(chart.contextMenu, common.Util.TR('Performance Trend'), function() {
            var performanceTrend, item, srcName;

            function initCheck() {
                if (performanceTrend.isEndInitLoad) {
                    performanceTrend.executeSQL();
                } else {
                    setTimeout(initCheck, 10);
                }
            }

            if (this.lastItem) {
                srcName = 'PerformanceTrend';
                if (monitorType === 'TP') {
                    srcName = 'TPTrend';
                } else if (monitorType === 'TUX') {
                    srcName = 'TuxTrend';
                } else if (monitorType === 'WEB') {
                    srcName = 'WebTrend';
                } else if (monitorType === 'CD') {
                    srcName = 'CDTrend';
                }

                item = this.lastItem.series;
                performanceTrend = common.OpenView.open(srcName, {
                    fromTime: Ext.util.Format.date(new Date(item.xaxis.min), Comm.dateFormat.HM),
                    toTime: Ext.util.Format.date(new Date(item.xaxis.max), Comm.dateFormat.HM),
                    wasId: item.id
                });

                setTimeout(initCheck, 10);
            }
        }.bind(chart));

        chart.titleLayer.on('render', function(me) {
            me.el.dom.style.cursor = 'pointer';
            me.el.dom.onclick = this.clickTitle.bind(this);
        }, this);

        this.chartList[tabName].push(chart);

        return chart;
    },

    addTab: function(tabPanel, tabName, tabInfo) {
        var charts = tabInfo.names,
            statNames = tabInfo.statNames,
            ix, ixLen, tab;

        tab = Ext.create('Exem.Container', {
            layout: 'vbox',
            title: tabName,
            sqlKey: tabInfo.sqlKey
        });

        if (!this.chartList[tabName]) {
            this.chartList[tabName] = [];
        }

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            tab.add(this.createChart(tabName, charts[ix], statNames[ix]));
        }

        tabPanel.add(tab);
    },

    openUserDefineWindow: function() {
        var  monitorType = this.monitorType,
            statList, visibleList, data, keys,
            ix, ixLen;

        if (this.userDefineWindow) {
            this.userDefineWindow.removeAll();
        }

        visibleList = [];
        statList = {
            Stat: [],
            DB  : [],
            Wait: [],
            GC  : [],
            Pool: []
        };

        data = this.agentStat[monitorType];
        if (data) {
            visibleList.push('stat');
            keys = Object.keys(data);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                statList.Stat.push({ name: keys[ix], value: data[keys[ix]] });
            }
        }

        data = this.gcStat[monitorType];
        if (data) {
            visibleList.push('gc');
            keys = Object.keys(data);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                statList.GC.push({ name: keys[ix], value: data[keys[ix]] });
            }
        }

        this.userDefineWindow = Ext.create('view.PerformanceTrendUserDefined', {
            total_stat_list: statList,
            db_visible: false,
            wait_visible: false,
            gc_visible: !!statList.GC.length,
            db_id: null,
            visible_stat_list: visibleList,
            view_name: monitorType.toLowerCase() + '_performance_trend_all',
            modal: true,
            scope: this
        });

        this.userDefineWindow.init_form();
        this.userDefineWindow.setTitle(common.Util.TR('User Defined'));
        this.userDefineWindow.show();
        this.userDefineWindow.load_list_data();
    },

    createLayout: function() {
        var ix, ixLen, tabNames, tabName, statChangeBtn, btnArea;

        this.setWorkAreaLayout('border');

        this.wasCombo = Ext.create('Exem.wasDBComboBox',{
            x: 350,
            y: 5,
            width: 400,
            comboWidth: 210,
            labelWidth: 60,
            comboLabelWidth: 60,
            selectType: common.Util.TR('Agent'),
            multiSelect: true
        });

        btnArea = Ext.create('Exem.Container', {
            layout: 'hbox',
            width: 130,
            height: 20,
            x: 800,
            y: 10
        });

        this.addBtn(btnArea, 'btn_move', 'moveTimeOFF');
        this.addBtn(btnArea, 'btn_first', 'firstLeftOFF');
        this.addBtn(btnArea, 'btn_prev', 'leftMoveOFF');
        this.addBtn(btnArea, 'btn_next', 'rightMoveOFF');
        this.addBtn(btnArea, 'btn_last', 'firstRightOFF');

        this.labelTime = Ext.create('Ext.form.Label',{
            itemId: 'lbl_time',
            text: this.LABEL_FORMAT,
            x: 950,
            y: 10 ,
            style: {
                fontSize: '16px'
            }
        });

        this.conditionArea.add(this.wasCombo, btnArea, this.labelTime);
        this.wasCombo.init();

        this.tabPanel = Ext.create('Exem.TabPanel', {
            region   : 'center' ,
            layout   : 'vbox' ,
            height   : '40%' ,
            split    : true ,
            activeTab: 0,
            style    : 'borderRadius : 6px;',
            listeners: {
                scope: this,
                tabchange: function(me, newCard) {
                    if (newCard.lastTime !== this.indicatorTime || this.isChangeStat) {
                        this.executeSQL();
                        newCard.lastTime = this.indicatorTime;
                        this.isChangeStat = false;
                    }
                }
            }
        });

        tabNames = Object.keys(this.stats);
        for (ix = 0, ixLen = tabNames.length; ix < ixLen; ix++) {
            tabName = tabNames[ix];
            this.addTab(this.tabPanel, tabName, this.stats[tabName]);
        }

        statChangeBtn = Ext.create('Ext.button.Button',{
            text: common.Util.TR('User Defined'),
            margin: '2 5 2 0',
            style: {
                cursor: 'pointer',
                lineHeight: '18px'
            },
            listeners: {
                scope: this,
                click: function() {
                    this.openUserDefineWindow();
                }
            }
        });

        this.tabPanel.getTabBar().add({xtype: 'tbspacer', flex: 8}, statChangeBtn);

        this.workArea.add(this.tabPanel);
        this.tabPanel.setActiveTab(0);
    },

    addChartSeries: function(chart, agents) {
        var monitorType = this.monitorType,
            ix, ixLen,
            serverName, serverId;

        chart.suspendLayouts();

        for (ix = 0, ixLen = agents.length; ix < ixLen; ix++) {
            serverId = agents[ix];
            serverName = Comm.RTComm.getServerNameByID(serverId, monitorType);
            chart.addSeries({
                id: serverId,
                label: serverName,
                type : PlotChart.type.exLine
            });
        }

        chart.resumeLayouts();
        chart.doLayout();
        chart.plotDraw();
    },

    onData: function(header, data) {
        var charts = this.chartList[this.tabPanel.getActiveTab().title],
            param = header.parameters,
            agents = this.wasCombo.getValue().split(','),
            ix, ixLen, jx, jxLen, kx, kxLen, dataIndex, seriesIndex,
            chart, queries, queryData, rowData, time, wasId, fromTime, toTime;

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.error('AllPerformanceTrend-onData');
            console.error(header);
            console.error(data);
            this.loadingMask.hide();
            return;
        }

        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            chart = charts[ix];

            chart.clearValues();
            chart.clearAllSeires();
            chart.removeAllSeries();
            chart.labelLayer.removeAll();

            this.addChartSeries(chart, agents);
            chart.setChartRange(+new Date(param.bind[0].value) , +new Date(param.bind[1].value));


            if (data.length) {
                queries = data;
            } else {
                queries = [data];
            }

            for (jx = 0, jxLen = queries.length; jx < jxLen; jx++) {
                queryData = queries[jx];

                dataIndex = queryData.columns.findIndex(function(columns) {
                    return columns.toLowerCase() === chart.statName;
                });
                for (kx = 0, kxLen = queryData.rows.length; kx < kxLen; kx++) {
                    if (dataIndex === -1) {
                        continue;
                    }

                    rowData = queryData.rows[kx];
                    time = +new Date(rowData[1]);
                    wasId = rowData[0] + '';
                    seriesIndex = chart.getSeries(wasId).seriesIndex;

                    chart.addValue(seriesIndex, [time, rowData[dataIndex]]);
                }
            }

            chart.setFillData(null);
            chart.plotDraw();
        }

        fromTime = +new Date(this.datePicker.getFromDateTime());
        toTime = +new Date(this.datePicker.getToDateTime());
        time = +new Date(this.indicatorTime);

        if (!this.indicatorTime || time < fromTime || time > toTime) {
            this.setIndicatorTime();
        }

        this.moveIndicator();
        this.loadingMask.hide();
    },

    executeSQL: function() {
        var dataSet = {},
            replaceName = this.monitorType === 'WEB' ? 'ws_id' : 'was_id';

        dataSet.sql_file = this.sql[this.monitorType][this.tabPanel.getActiveTab().sqlKey];
        dataSet.bind = [{
            name: 'fromtime',
            value: common.Util.getDate(this.datePicker.getFromDateTime()),
            type: SQLBindType.STRING
        }, {
            name: 'totime',
            value: common.Util.getDate(this.datePicker.getToDateTime()),
            type: SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: replaceName,
            value: this.wasCombo.getValue()
        }];

        WS.SQLExec(dataSet, this.onData, this);
        this.loadingMask.show();
    }
});