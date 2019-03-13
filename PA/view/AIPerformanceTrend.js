Ext.define('view.AIPerformanceTrend', {
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
            load_was: {
                'Active Transaction Count'     : 'active_txns'  ,
                'JVM CPU Usage (%)'            : 'jvm_cpu_usage',
                'JVM Used Heap (MB)'           : 'jvm_used_heap',
                'Transaction Count'            : 'txn_end_count',
                'Transaction Elapse Time (AVG)': 'txn_elapse'
            },
            load_db: {
                'CPU Usage'            : 'os_cpu'           ,
                'Session Logical Reads': 'logical_read'     ,
                'DB Time'              : 'db_time'          ,
                'Non Idle Wait Time'   : 'nonidle_wait_time',
                'Physical Reads'       : 'physical_read'    ,
                'Physical Writes'      : 'physical_write'   ,
                'Execute Count'        : 'execute_count'    ,
                'Active Sessions'      : 'active_session'   ,
                'Lock Wait Session'    : 'lock_waiting_session'
            },
            load_txn: {
                'Transaction Execution Count' : 'txn_exec_count',
                'Transaction Elapse Time'     : 'txn_elapse'    ,
                'Transaction CPU TIME'        : 'txn_cpu_time'
            },
            load_biz: {
                'Transaction Execution Count' : 'txn_exec_count',
                'Transaction Elapse Time'     : 'txn_elapse'    ,
                'Transaction CPU TIME'        : 'txn_cpu_time'
            },
            ano_was: {
                'Active Transaction Count'     : 'active_txns'  ,
                'JVM CPU Usage (%)'            : 'jvm_cpu_usage',
                'JVM Used Heap (MB)'           : 'jvm_used_heap',
                'Transaction Count'            : 'txn_end_count',
                'Transaction Elapse Time (AVG)': 'txn_elapse'
            },
            ano_db: {
                'CPU Usage'             : 'user_cpu'            ,
                'DB Time'               : 'db_time'             ,
                'Non Idle Wait Time'    : 'non_idle_wait_time'  ,
                'Physical Reads'        : 'physical_reads'      ,
                'Physical Writes'       : 'physical_writes'     ,
                'Execute Count'         : 'execute_count'       ,
                'Active Sessions'       : 'active_session'      ,
                'Lock Wait Session'     : 'lock_waiting_session',
                'Session Logical Reads' : 'session_logical_reads'
            }
        }
    },

    tabList: {
        WAS: {
            load_was: common.Util.TR('Agent Stat'),
            load_db : common.Util.TR('DB Stat'),
            load_txn: common.Util.TR('Transaction Stat'),
            load_biz: common.Util.TR('Business Stat'),
            ano_was : common.Util.TR('Agent Stat'),
            ano_db  : common.Util.TR('DB Stat')
        }
    },

    sql: {
        WAS: {
            load_was: 'IMXPA_All_AITrend_AgentStat_LoadWas.sql',
            load_db: 'IMXPA_All_AITrend_AgentStat_LoadDB.sql',
            load_txn: 'IMXPA_All_AITrend_AgentStat_LoadTxn.sql',
            load_biz: 'IMXPA_All_AITrend_AgentStat_LoadBiz.sql',
            ano_was: 'IMXPA_All_AITrend_AgentStat_AnoWas.sql',
            ano_db: 'IMXPA_All_AITrend_AgentStat_AnoDB.sql'
        }
    },

    initProperty: function() {
        var monitorType = this.monitorType,
            envKey = 'pa_' + monitorType.toLowerCase() + '_performance_trend_all',
            lastType = Comm.web_env_info[envKey + '_last_type'],
            tabs = this.agentStat[monitorType],
            tabKeys = Object.keys(tabs),
            dataSet = {},
            ix, ixLen, tabKey;

        this.stats = {};
        for (ix = 0, ixLen = tabKeys.length; ix < ixLen; ix++) {
            tabKey = tabKeys[ix];
            this.stats[tabKey] = {
                names: Comm.web_env_info[envKey + '_' + tabKey + '_' + lastType],
                statNames: Comm.web_env_info[envKey + '_' + tabKey + '_id_' + lastType],
                sqlKey: tabKey
            };
        }

        this.AIModuleTxnCheck  = [3,6];
        this.isInitLayout = false;
        this.prevServiceType = 1;
        this.agentStatObj = {
            1 : 'load_was',
            2 : 'load_db' ,
            3 : 'load_txn',
            7 : 'load_biz',
            4 : 'ano_was' ,
            5 : 'ano_db'
        };

        dataSet.sql_file = 'IMXRT_Get_TxnNameCombo.sql';
        WS.SQLExec(dataSet, this.setTxnName, this);
    },

    init: function() {
        this.initProperty();

        this.chartList = {};
        this.barChartList = {};
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
                            fromTime = this.datePicker.getFromDateTime() + ':00';
                            toTime = this.datePicker.getToDateTime() + ':00';

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
        statInfo = this.agentStat[this.monitorType][this.agentStatObj[this.prevServiceType]];

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
            chart;

        chart = Ext.create('Exem.chart.CanvasChartLayer', {
            flex: 10,
            title: common.Util.CTR(title),
            statName: statName ? statName : title,
            interval: PlotChart.time.exMin,
            titleHeight: 17 ,
            titleWidth: 170,
            titleFontSize: '12px',
            showTitle: true,
            showLegend: true,
            showXAxis: false,
            legendWidth: (Comm.Lang === 'ko' || window.nation === 'ko') ? 120 : 200,
            legendNameWidth: (Comm.Lang === 'ko' || window.nation === 'ko') ? 90 : 180,
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
            showMultiToolTip: true,
            showBarNotice: false,
            legendColorClickToVisible: true,
            chartProperty: {
                yLabelWidth: 55,
                xLabelFont: { size: 8, color: 'black' },
                yLabelFont: { size: 8, color: 'black' },
                xaxis: false,
                colors: realtime.Colors,
                autoHighlight : false
            },
            xaxisCurrentToTime : true,
            mouseSelect        : this.cbxAIModuleType.getValue() == 1 || this.cbxAIModuleType.getValue() == 2 || this.cbxAIModuleType.getValue() == 4 || this.cbxAIModuleType.getValue() == 5,
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
            plothover: function(event, pos, item, self) {
                if (item) {
                    this.currItem = item;
                } else {
                    this.lastItem = this.currItem;
                    this.currItem = null;
                }
            },
            plotselection: function(event, ranges, maxOffSet) {
                var fromtime = +new Date(Ext.util.Format.date(common.Util.getDate(ranges.xaxis.from), Comm.dateFormat.HM) + ':00');
                var totime   = +new Date(Ext.util.Format.date(common.Util.getDate(ranges.xaxis.to), Comm.dateFormat.HM) + ':00');

                if (totime - fromtime < 20 * 60 * 1000) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please drag more than 20 minutes.'),
                        Ext.Msg.OK, Ext.MessageBox.WARNING, function() {}
                    );
                } else {
                    var causalityAnalysis = Ext.create('Exem.CausalityAnalysis', {
                        wasId : this.wasCombo.getValue(),
                        statId : statName ? statName : title,
                        fromTime: fromtime,
                        toTime: totime
                    });
                    causalityAnalysis.init();
                }

            }.bind(this),
            legendColorClick: function(self) {
                this.onDataBar(self);
            }.bind(this)
        });

        chart.titleLayer.on('render', function(me) {
            me.el.dom.style.cursor = 'pointer';
            me.el.dom.onclick = this.clickTitle.bind(this);
        }, this);

        this.chartList[tabName].push(chart);

        return chart;
    },

    createBarChart: function(tabName, title, statName) {
        var chart = Ext.create('Exem.chart.CanvasChartLayer', {
            title        : common.Util.TR('Accuracy (%)'),
            itemId       : 'accuracy_chart',
            statName     : statName,
            flex         : 1,
            titleHeight  : 17,
            titleFontSize: '12px',
            margin       : '5 0 0 0',
            showTitle    : true,
            chartProperty   : {
                mode: "categories",
                yaxes: [{
                    min : 0,
                    max : 120
                }],
                xLabelFont: { size: 8, color: 'black' },
                yLabelFont: { size: 8, color: 'black' },
                yLabelWidth: 20,
                colors : [realtime.loadPredictChartColor.band, realtime.loadPredictChartColor.predictBand]
            },
            split         : false,
            showTooltip   : true,
            toolTipFormat : '%s: %y',

            showMaxValue  : false,
            showIndicator : false,
            showBaseLine  : true
        });

        chart.addSeries({
            id   : common.Util.TR('Normal'),
            type : PlotChart.type.exBar
        });

        if (this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('ano_') === -1) {
            chart.addSeries({
                id: common.Util.TR('Forecast'),
                type: PlotChart.type.exBar
            });
        }

        this.barChartList[tabName].push(chart);

        return chart;
    },

    addTab: function(tabPanel, tabName, tabInfo) {
        var charts = tabInfo.names,
            statNames = tabInfo.statNames,
            ix, ixLen;

        this.currentTab = Ext.create('Exem.Container', {
            layout: 'vbox',
            title: tabName,
            sqlKey: tabInfo.sqlKey
        });

        if (!this.chartList[tabName]) {
            this.chartList[tabName] = [];
            this.barChartList[tabName] = [];
        }

        var container;
        for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
            container = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                width : '100%',
                flex : 1
            });
            container.add([this.createChart(tabName, charts[ix], statNames[ix]), this.createBarChart(tabName, charts[ix], statNames[ix])]);
            this.currentTab.add(container);
        }

        tabPanel.add(this.currentTab);
        this.prevServiceType = this.cbxAIModuleType.getValue();
    },

    openUserDefineWindow: function() {
        var monitorType = this.monitorType,
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

        data = this.agentStat[monitorType][this.agentStatObj[this.prevServiceType]];
        if (data) {
            visibleList.push('stat');
            keys = Object.keys(data);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                statList.Stat.push({ name: keys[ix], value: data[keys[ix]] });
            }
        }

        this.userDefineWindow = Ext.create('view.PerformanceTrendUserDefined', {
            total_stat_list: statList,
            db_visible: false,
            wait_visible: false,
            gc_visible: false,
            db_id: null,
            visible_stat_list: visibleList,
            view_name: monitorType.toLowerCase() + '_performance_trend_all_' + this.agentStatObj[this.prevServiceType],
            modal: true,
            scope: this
        });

        this.userDefineWindow.init_form();
        this.userDefineWindow.setTitle(common.Util.TR('User Defined'));
        this.userDefineWindow.show();
        this.userDefineWindow.load_list_data();
    },

    createLayout: function() {
        var btnArea;

        this.setWorkAreaLayout('border');

        this.cbxAIModuleType = Ext.create('Exem.ComboBox', {
            x           : 315,
            y           : 5,
            fieldLabel  : common.Util.TR('Service'),
            labelWidth  : 60,
            width       : 230,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            useSelectFirstRow : false,
            itemId      : 'cbo_ai_module',
            listeners   : {
                change : function(me) {
                    var val = +me.getValue(),
                        selectRadioType, selectType;

                    if (this.isInitLayout) {
                        if (val === 1 || val === 4) {
                            selectRadioType = 'WAS';
                            selectType = common.Util.TR('Agent');
                        } else if (val === 2 || val === 5) {
                            selectType = 'DB';
                        } else if (val === 7) {
                            selectType = common.Util.TR('Business');
                        }

                        if ([3,7].indexOf(val) !== -1) {
                            this.datePicker.defaultTimeGap = 6;
                            this.datePicker.initializeDateTime();
                        } else {
                            this.datePicker.defaultTimeGap = 1;
                            this.datePicker.initializeDateTime();
                        }

                        if (this.AIModuleTxnCheck.indexOf(val) !== -1) {
                            this.wasCombo.hide();
                            this.txnName.show();
                        } else {
                            this.txnName.hide();
                            this.wasCombo.show();
                            this.wasCombo.WASDBCombobox.setFieldLabel(selectType);
                            this.wasCombo.selectType = selectType;
                            this.wasCombo.selectRadioType = selectRadioType;
                            this.wasCombo._getServiceInfo();
                        }
                    }
                }.bind(this)
            }
        });

        this.cbxAIModuleType.addItem('1', common.Util.TR('Load Prediction WAS'), 1);
        this.cbxAIModuleType.addItem('2', common.Util.TR('Load Prediction DB'), 2);
        this.cbxAIModuleType.addItem('3', common.Util.TR('Load Prediction Transaction'), 3);
        this.cbxAIModuleType.addItem('7', common.Util.TR('Load Prediction Business'), 7);
        this.cbxAIModuleType.addItem('4', common.Util.TR('Abnormal Detection WAS'), 4);
        this.cbxAIModuleType.addItem('5', common.Util.TR('Abnormal Detection DB'), 5);
        this.cbxAIModuleType.selectRow(0);

        this.txnName = Ext.create('Exem.ComboBox', {
            fieldLabel : '',
            labelAlign : 'right',
            labelWidth : 140,
            allowBlank : false,
            store       : Ext.create('Exem.Store'),
            value      : common.Util.TR('Transaction Name'),
            width      : 200,
            x          : 550,
            y          : 5
        });

        this.txnName.hide();

        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            x: 535,
            y: 5,
            width: 400,
            comboWidth: 200,
            labelWidth: 60,
            comboLabelWidth: 60,
            selectType: common.Util.TR('Agent'),
            addSelectAllItem: false
        });

        btnArea = Ext.create('Exem.Container', {
            layout: 'hbox',
            width: 130,
            height: 20,
            x: 800,
            y: 10
        });

        this.addBtn(btnArea, 'btn_move' , 'moveTimeOFF');
        this.addBtn(btnArea, 'btn_first', 'firstLeftOFF');
        this.addBtn(btnArea, 'btn_prev' , 'leftMoveOFF');
        this.addBtn(btnArea, 'btn_next' , 'rightMoveOFF');
        this.addBtn(btnArea, 'btn_last' , 'firstRightOFF');

        this.labelTime = Ext.create('Ext.form.Label',{
            itemId: 'lbl_time',
            text: this.LABEL_FORMAT,
            x: 950,
            y: 10 ,
            style: {
                fontSize: '16px'
            }
        });

        this.conditionArea.add(this.cbxAIModuleType, this.wasCombo, this.txnName, btnArea, this.labelTime);
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

        this.addTab(this.tabPanel, this.tabList[this.monitorType]['load_was'], this.stats[this.agentStatObj[this.cbxAIModuleType.getValue()]]);

        this.workArea.add(this.tabPanel);
        this.tabPanel.setActiveTab(0);

        this.isInitLayout = true;
    },

    addChartSeries: function(chart, agents) {
        var ix, ixLen,
            serverName, serverId;

        chart.suspendLayouts();

        for (ix = 0, ixLen = agents.length; ix < ixLen; ix++) {
            serverId = agents[ix];
            serverName = this.getSeriesLabel(serverId);

            chart.addSeries({
                id: 0,
                label: serverName,
                color: realtime.loadPredictChartColor.now,
                target: true
            });

            if (this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('ano_') !== -1) {
                chart.addSeries({
                    id: 1,
                    label    : common.Util.TR('Moving Average'),
                    color    : '#4db7ff'
                });

                chart.addSeries({
                    id: 4,
                    label: common.Util.TR('Normal Range'),
                    color: realtime.loadPredictChartColor.band,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 5,
                    label: common.Util.TR('isAnomaly'),
                    anomaly : true,
                    color    : '#d97009'
                });
            } else if (this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('_txn') !== -1 || this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('_biz') !== -1) {
                chart.addSeries({
                    id: 1,
                    label: common.Util.TR('10M Forecast Range'),
                    color: realtime.loadPredictChartColor.predictBand,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 2,
                    label: common.Util.TR('20M Forecast Range'),
                    color: realtime.loadPredictChartColor.predictBand,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 3,
                    label: common.Util.TR('40M Forecast Range'),
                    color: realtime.loadPredictChartColor.predictBand,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 4,
                    label: common.Util.TR('60M Forecast Range'),
                    color: realtime.loadPredictChartColor.predictBand,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 5,
                    label: common.Util.TR('Normal Range'),
                    color: realtime.loadPredictChartColor.band,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 6,
                    label: common.Util.TR('isAnomaly'),
                    anomaly : true,
                    color   : '#d97009'
                });
            } else {
                chart.addSeries({
                    id: 1,
                    label: common.Util.TR('1M Forecast Range'),
                    color: realtime.loadPredictChartColor.predictBand,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 2,
                    label: common.Util.TR('10M Forecast Range'),
                    color: realtime.loadPredictChartColor.predictBand,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 3,
                    label: common.Util.TR('30M Forecast Range'),
                    color: realtime.loadPredictChartColor.predictBand,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 4,
                    label: common.Util.TR('Normal Range'),
                    color: realtime.loadPredictChartColor.band,
                    fill : 0.5,
                    band : true
                });

                chart.addSeries({
                    id: 5,
                    label: common.Util.TR('isAnomaly'),
                    anomaly : true,
                    color   : '#d97009'
                });
            }
        }

        chart.resumeLayouts();
        chart.doLayout();
        chart.plotDraw();
    },

    onData: function(header, data) {
        var charts = this.chartList[this.tabPanel.getActiveTab().title],
            param = header.parameters,
            agents = this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('_txn') !== -1 ? this.txnName.getValue().split(',') : this.wasCombo.getValue().split(','),
            ix, ixLen, jx, jxLen, kx, kxLen, dataIndex,
            chart, queries, queryData, rowData, time, fromTime, toTime;

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

            chart.interval = this.getInterval();

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

                    if (this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('ano_') !== -1) {
                        rowData[dataIndex + 2] = rowData[dataIndex + 2] < 0 ? 0 : rowData[dataIndex + 2];

                        chart.addValue(0, [time, rowData[dataIndex]]); // 현재
                        chart.addValue(1, [time, rowData[dataIndex + 1]]); // 1분 후
                        chart.addValue(2, [time, [rowData[dataIndex + 2], rowData[dataIndex + 3]]]); // 신뢰구간
                        chart.addValue(3, [time, 'false']); // 이상 여부
                    } else if (this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('_txn') !== -1 || this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('_biz') !== -1) {
                        rowData[dataIndex + 1] = rowData[dataIndex + 1] < 0 ? 0 : rowData[dataIndex + 1];
                        rowData[dataIndex + 3] = rowData[dataIndex + 3] < 0 ? 0 : rowData[dataIndex + 3];
                        rowData[dataIndex + 5] = rowData[dataIndex + 5] < 0 ? 0 : rowData[dataIndex + 5];
                        rowData[dataIndex + 7] = rowData[dataIndex + 7] < 0 ? 0 : rowData[dataIndex + 7];
                        rowData[dataIndex + 9] = rowData[dataIndex + 9] < 0 ? 0 : rowData[dataIndex + 9];

                        chart.addValue(0, [time, rowData[dataIndex]]); // 현재
                        chart.addValue(1, [time, [rowData[dataIndex + 1], rowData[dataIndex + 2]]]); // 10분 후
                        chart.addValue(2, [time, [rowData[dataIndex + 3], rowData[dataIndex + 4]]]); // 20분 후
                        chart.addValue(3, [time, [rowData[dataIndex + 5], rowData[dataIndex + 6]]]); // 40분 후
                        chart.addValue(4, [time, [rowData[dataIndex + 7], rowData[dataIndex + 8]]]); // 60분 후
                        chart.addValue(5, [time, [rowData[dataIndex + 9], rowData[dataIndex + 10]]]); // 신뢰구간
                        chart.addValue(6, [time, 'false']); // 이상 여부

                        chart.setSeriesVisible(1, false);
                        chart.setSeriesVisible(2, false);
                        chart.setSeriesVisible(3, false);
                    } else {
                        rowData[dataIndex + 1] = rowData[dataIndex + 1] < 0 ? 0 : rowData[dataIndex + 1];
                        rowData[dataIndex + 3] = rowData[dataIndex + 3] < 0 ? 0 : rowData[dataIndex + 3];
                        rowData[dataIndex + 5] = rowData[dataIndex + 5] < 0 ? 0 : rowData[dataIndex + 5];
                        rowData[dataIndex + 7] = rowData[dataIndex + 7] < 0 ? 0 : rowData[dataIndex + 7];

                        chart.addValue(0, [time, rowData[dataIndex]]); // 현재
                        chart.addValue(1, [time, [rowData[dataIndex + 1], rowData[dataIndex + 2]]]); // 1분 후
                        chart.addValue(2, [time, [rowData[dataIndex + 3], rowData[dataIndex + 4]]]); // 10분 후
                        chart.addValue(3, [time, [rowData[dataIndex + 5], rowData[dataIndex + 6]]]); // 30분 후
                        chart.addValue(4, [time, [rowData[dataIndex + 7], rowData[dataIndex + 8]]]); // 신뢰구간
                        chart.addValue(5, [time, 'false']); // 이상 여부

                        chart.setSeriesVisible(1, false);
                        chart.setSeriesVisible(2, false);
                    }
                }
            }

            var decimal;
            if (chart.statName.indexOf('time') !== -1 || chart.statName === 'txn_elapse') {
                decimal = 3;
            } else {
                decimal = 2;
            }
            chart.toFixedNumber = decimal;

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

        this.onDataBar();
    },

    onDataBar: function(target) {
        var charts    = this.chartList[this.tabPanel.getActiveTab().title],
            barCharts = this.barChartList[this.tabPanel.getActiveTab().title],
            chartIdx;

        if (target) {
            for (chartIdx = 0; chartIdx < charts.length; chartIdx++) {
                if (target.statName === charts[chartIdx].statName) {
                    this.drawBarChart(chartIdx);
                }
            }

        } else {
            for (chartIdx = 0; chartIdx < barCharts.length; chartIdx++) {
                this.drawBarChart(chartIdx);
            }
        }
    },

    drawBarChart: function(idx) {
        var barCharts = this.barChartList[this.tabPanel.getActiveTab().title],
            charts    = this.chartList[this.tabPanel.getActiveTab().title],
            forecastBand = 0, normalBand = 0,
            chartData, barChart,
            ix, ixLen, jx, jxLen,
            firstChartIdx, anomalyData, normalRangeAno, forecastRangeAno, normalAcc, forecastAcc;

        barChart      = barCharts[idx];
        chartData     = charts[idx].plot.getData();
        firstChartIdx = charts[idx].plot.getData()[0].seriesIndex;

        barChart.clearValues();

        for (ix = 0, ixLen = chartData.length; ix < ixLen; ix++) {
            if (chartData[ix].anomaly) {
                anomalyData = chartData[ix];
            }

            if (chartData[ix].band) {
                if (chartData[ix].label === common.Util.TR('Normal Range')) {
                    for (jx = 0, jxLen = chartData[ix].data.length; jx < jxLen; jx++) {
                        if (chartData[ix].data[jx][1] !== null) {
                            normalBand++;
                        }
                    }
                } else {
                    for (jx = 0, jxLen = chartData[ix].data.length; jx < jxLen; jx++) {
                        if (chartData[ix].data[jx][1] !== null) {
                            forecastBand++;
                        }
                    }
                }
            }
        }

        if (anomalyData && firstChartIdx == 0) {
            normalRangeAno   = anomalyData.normalRangeCnt;
            forecastRangeAno = anomalyData.forecastRangeCnt;

            if (normalBand === 0) {
                normalAcc = 0;
            } else if (normalRangeAno === 0) {
                normalAcc = 100;
            } else {
                normalAcc = (normalBand - normalRangeAno) / normalBand * 100;
            }

            if (forecastBand === 0) {
                forecastAcc = 0;
            } else if (forecastRangeAno == 0) {
                forecastAcc = 100;
            } else {
                forecastAcc = (forecastBand - forecastRangeAno) / forecastBand * 100;
            }


            if (this.agentStatObj[this.cbxAIModuleType.getValue()].indexOf('ano_') === -1) {
                barChart.addValue(0, [common.Util.TR('Normal')  , normalAcc], 0);
                barChart.addValue(1, [common.Util.TR('Forecast'), forecastAcc], 1);
            } else {
                barChart.addValue(0, [common.Util.TR('Normal')  , normalAcc], 0);
            }

        }

        barChart.plotDraw();
    },

    executeSQL: function() {
        function replaceAt(string, index, replace) {
            return string.substring(0, index) + replace + string.substring(index + 1);
        }

        var aiModuleVal = this.cbxAIModuleType.getValue(),
            aiModule = this.agentStatObj[aiModuleVal],
            dataSet = {},
            replaceName, replaceValue, fromTime, toTime;

        if (this.prevServiceType != aiModuleVal) {
            this.currentTab.destroy();
            this.addTab(this.tabPanel, this.tabList[this.monitorType][aiModule], this.stats[aiModule]);
            this.tabPanel.setActiveTab(0);
        }

        if (aiModule.indexOf('_db') !== -1) {
            replaceName = 'db_id';
        } else if (aiModule.indexOf('_txn') !== -1) {
            replaceName = 'txn_id';
        } else if (aiModule.indexOf('_biz') !== -1) {
            replaceName = 'biz_id';
        } else {
            replaceName = 'was_id';
        }

        if (aiModule.indexOf('_txn') !== -1) {
            replaceValue = '\'' + this.txnName.getValue() + '\'';
        } else {
            replaceValue = this.wasCombo.getValue();
        }

        if (aiModule.indexOf('_txn') !== -1 || aiModule.indexOf('_biz') !== -1) {
            fromTime = replaceAt(common.Util.getDate(this.datePicker.getFromDateTime()), 15, 0);
            toTime = replaceAt(common.Util.getDate(this.datePicker.getToDateTime()), 15, 0);
        } else {
            fromTime = common.Util.getDate(this.datePicker.getFromDateTime());
            toTime = common.Util.getDate(this.datePicker.getToDateTime());
        }

        dataSet.sql_file = this.sql[this.monitorType][this.tabPanel.getActiveTab().sqlKey];
        dataSet.bind = [{
            name: 'fromtime',
            value: fromTime,
            type: SQLBindType.STRING
        }, {
            name: 'totime',
            value: toTime,
            type: SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: replaceName,
            value: replaceValue
        }];

        WS.SQLExec(dataSet, this.onData, this);
        this.loadingMask.show();
    },

    setTxnName: function(header, data) {
        var ix, ixLen;
        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            this.txnName.addItem(data.rows[ix][0], data.rows[ix][1], ix);
        }

        this.txnName.selectRow(0);
    },

    getInterval: function() {
        var aiModuleVal = this.cbxAIModuleType.getValue(),
            aiModule = this.agentStatObj[aiModuleVal];

        if (aiModule.indexOf('_txn') !== -1 || aiModule.indexOf('_biz') !== -1) {
            return PlotChart.time.exTenMin;
        } else {
            return PlotChart.time.exMin;
        }
    },

    getSeriesLabel: function(serverId) {
        var aiModuleVal = this.cbxAIModuleType.getValue(),
            aiModule = this.agentStatObj[aiModuleVal],
            monitorType = this.monitorType,
            serverName;

        if (aiModule.indexOf('_txn') !== -1) {
            serverName = this.txnName.getRawValue();
        } else if (aiModule.indexOf('_biz') !== -1) {
            serverName = Comm.RTComm.getLearnBizNameById(serverId);
        } else {
            serverName = Comm.RTComm.getServerNameByID(serverId, monitorType);
        }

        return serverName;
    },



});