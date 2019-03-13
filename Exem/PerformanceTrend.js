/**
 * Created by jykim on 2017-03-13.
 */
Ext.define('Exem.PerformanceTrend', {
    extend: 'Exem.FormOnCondition',
    width: '100%',
    height: '100%',
    rangeOnly  : true,
    singeField : false,
    useDbCombo: true,
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },

    sql: {
        set_db: 'IMXPA_PerformanceTrend_Set_DB.sql',
        set_pool: 'IMXPA_PerformanceTrend_StatChange_pool.sql',
        stat_change_s: 'IMXPA_DBTrend_StatChange_s.sql',
        stat_change_w: 'IMXPA_DBTrend_StatChange_w.sql',

        top_active: 'IMXPA_PerformanceTrend_Top_Active.sql',

        mid_was: 'IMXPA_PerformanceTrend_Mid_WAS.sql',
        mid_db: 'IMXPA_PerformanceTrend_Mid_DB.sql',
        mid_db_os: 'IMXPA_PerformanceTrend_Mid_DB_OS.sql',
        mid_wait: 'IMXPA_PerformanceTrend_Mid_WAIT.sql',
        mid_wait_latch: 'IMXPA_PerformanceTrend_Mid_WAIT_Latch.sql',
        mid_os: 'IMXPA_PerformanceTrend_Mid_OS.sql',
        mid_lock: 'IMXPA_PerformanceTrend_Mid_Lock.sql',
        mid_gc: 'IMXPA_PerformanceTrend_Mid_GC.sql',
        mid_pool: 'IMXPA_PerformanceTrend_PoolInfo.sql',

        bot_active: 'IMXPA_PerformanceTrend_Bot_Active.sql',
        bot_process: 'IMXPA_PerformanceTrend_Bot_Process.sql',
        bot_active_sum: 'IMXPA_PerformanceTrend_Bot_Active_Sum.sql',

        mid_sec: 'IMXPA_PerformanceTrend_Sec_Lock.sql',
        bot_sec: 'IMXPA_PerformanceTrend_Sec_Active.sql'
    },

    init: function() {
        switch (nation) {
            case 'ko' :
                self.LABEL_FORMAT = '____-__-__ __:__:__';
                break;
            case 'zh-CN':
            case 'ja' :
                self.LABEL_FORMAT = '____/__/__ __:__:__';
                break;
            case 'en' :
                self.LABEL_FORMAT = '__/__/____ __:__:__';
                break;
            default:
                break;
        }

        this.zoomFrom = null;
        this.zoomTo = null;

        this.chartList = {};
        this.gridList = {};
        this.secFrames = {
            active: [],
            lockTree: []
        };

        this.existSecTimes = {
            active: [],
            lockTree: []
        };

        this.selectedSecTime = 0;

        this.createSearchLayout();
        this.createTopLayout();
        this.createMidLayout();
        this.createBotLayout();

        this.isEndInitLoad = true;
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

    addBtn: function(target, itemId, cls, useSeparator, pos) {
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
                            moveTimeWindow, currTime, moveTime, secIndex, maxSec, minSec,
                            secFrames, existSecTimes;

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
                            if (!this.zoomFrom) {
                                this.zoomFrom = common.Util.getDate(this.datePicker.getFromDateTime() + ':00');
                                this.zoomTo = common.Util.getDate(this.datePicker.getToDateTime() + ':00');
                            }

                            if (pos === 'top') {
                                currTime = this.indicatorTime;
                                moveTime = new Date(currTime);
                            } else {
                                currTime = this.selectedSecTime;
                                moveTime = new Date(this.indicatorTime);
                                secFrames = this.secFrames.active;
                                existSecTimes = this.existSecTimes.active;
                                if (this.botPanel.getActiveTab().title === common.Util.TR('BRUN')) {
                                    secFrames = this.secFrames.brun;
                                    existSecTimes = this.existSecTimes.brun;
                                }
                            }

                            switch (itemId) {
                                case 'btn_prev':
                                    if (currTime <= this.zoomFrom) {
                                        return;
                                    }

                                    moveTime = common.Util.getDate(moveTime.setMinutes(moveTime.getMinutes() - 1));
                                    break;

                                case 'btn_next':
                                    if (currTime >= this.zoomTo) {
                                        return;
                                    }

                                    moveTime = common.Util.getDate(moveTime.setMinutes(moveTime.getMinutes() + 1));
                                    break;

                                case 'btn_first':
                                    if (currTime <= this.zoomFrom) {
                                        return;
                                    }

                                    moveTime = this.zoomFrom;
                                    break;

                                case 'btn_last':
                                    if (currTime >= this.zoomTo) {
                                        return;
                                    }

                                    moveTime = this.zoomTo;
                                    break;

                                case 'btn_sec_prev':
                                    secIndex = existSecTimes.indexOf(currTime) - 1;
                                    if (currTime <= 0 || secIndex < 0) {
                                        return;
                                    }

                                    moveTime = existSecTimes[secIndex];
                                    break;

                                case 'btn_sec_next':
                                    secIndex = existSecTimes.indexOf(currTime) + 1;
                                    if (currTime >= 59 || secIndex > existSecTimes.length - 1) {
                                        return;
                                    }

                                    moveTime = existSecTimes[secIndex];
                                    break;

                                case 'btn_sec_first':
                                    minSec = existSecTimes[0];
                                    if (minSec === undefined || currTime <= minSec) {
                                        return;
                                    }

                                    moveTime = minSec;
                                    break;

                                case 'btn_sec_last':
                                    maxSec = existSecTimes[existSecTimes.length - 1];
                                    if (maxSec === undefined || currTime >= maxSec) {
                                        return;
                                    }

                                    moveTime = maxSec;
                                    break;

                                default :
                                    break;
                            }

                            if (pos === 'top') {
                                this.setIndicatorTime(moveTime);
                                this.moveIndicator();
                            } else {
                                secFrames[moveTime].el.dom.click();
                            }
                        }
                    }.bind(this));
                }
            }
        });

        if (useSeparator) {
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
        } else {
            target.add(btn);
        }
    },

    createSearchLayout: function() {
        var btnArea;

        this.wasCombo = Ext.create('Exem.wasDBComboBox',{
            x: 350,
            y: 5,
            labelWidth: 60,
            comboLabelWidth: 60,
            width: 400,
            comboWidth: 210,
            selectType: common.Util.TR('Agent'),
            multiSelect: false,
            addSelectAllItem: false,
            itemId: 'wasCombo',
            listeners: {
                scope: this,
                afterrender: function(me) {
                    me.WASDBCombobox.addListener('select', function() {
                        if (this.useDbCombo) {
                            this.getDbValue(me.getValue());
                        }

                        if (this.comboSelectFn) {
                            this.comboSelectFn(me.getValue());
                        }
                    }.bind(this));
                },
                render: function(me) {
                    if (this.useDbCombo) {
                        this.getDbValue(me.getValue());
                    }
                }
            }
        });

        this.dbCombo = Ext.create('Exem.AjaxComboBox',{
            fieldLabel: common.Util.TR('DB'),
            width: 200,
            labelWidth: 14,
            multiSelect: false,
            forceSelection: true,
            x: 570,
            y: 5,
            data: [],
            enableKeyEvents: true,
            listeners: {
                scope: this,
                blur: function(me) {
                    var dbDatas = this.dbCombo.data,
                        isFind = false,
                        ix, ixLen;

                    for (ix = 0, ixLen = dbDatas.length; ix < ixLen; ix++) {
                        if (dbDatas[ix].name == this.dbCombo.getRawValue()) {
                            isFind = true;
                        }
                    }

                    if (!isFind) {
                        this.showMessage(
                            common.Util.TR('ERROR'),
                            common.Util.TR('The %1 name is invalid', me.fieldLabel),
                            Ext.Msg.OK,
                            Ext.MessageBox.ERROR,
                            null
                        );
                    }
                },
                change: function() {
                    if (this.dbCombo.getRawValue() == '' && this.dbCombo.data.length == 1) {
                        this.dbCombo.setRawValue(this.dbCombo.data[0].name);
                    }
                }
            }
        });

        btnArea = Ext.create('Exem.Container', {
            layout: 'hbox',
            width: 130,
            height: 20,
            x: 800,
            y: 10
        });

        this.addBtn(btnArea, 'btn_move', 'moveTimeOFF', true, 'top');
        this.addBtn(btnArea, 'btn_first', 'firstLeftOFF', true, 'top');
        this.addBtn(btnArea, 'btn_prev', 'leftMoveOFF', true, 'top');
        this.addBtn(btnArea, 'btn_next', 'rightMoveOFF', true, 'top');
        this.addBtn(btnArea, 'btn_last', 'firstRightOFF', true, 'top');

        this.labelTime = Ext.create('Ext.form.Label',{
            itemId: 'lbl_time',
            text: self.LABEL_FORMAT,
            x: 950,
            y: 10 ,
            style: {
                fontSize: '16px'
            }
        });

        if (this.useDbCombo) {
            this.conditionArea.add(this.wasCombo, this.dbCombo, btnArea, this.labelTime);
        } else {
            this.conditionArea.add(this.wasCombo, btnArea, this.labelTime);
        }

        this.wasCombo.init();
    },

    setZoomInfo: function(from, to, maxOffSet) {
        var currFrom = +new Date(this.zoomFrom),
            currTo = +new Date(this.zoomTo);

        if (maxOffSet.seriesIndex === undefined || (currFrom === from && currTo === to)) {
            return;
        }

        this.setIndicatorTime(common.Util.getDate(maxOffSet.x));
        this.moveIndicator();

        common.DataModule.lastZoomFromTime = new Date(from);
        common.DataModule.lastZoomToTime = new Date(to);

        this.zoomFrom = common.Util.getDate(from);
        this.zoomTo = common.Util.getDate(to);
    },

    createTopLayout: function() {
        var self = this;

        this.setWorkAreaLayout('border');

        this.topPanel = Ext.create('Exem.Container',{
            region : 'north',
            layout : 'vbox',
            split  : true ,
            height : '17%',
            itemId : 'top_main_pnl',
            style  : {
                borderRadius: '0px 0px 6px 6px'
            }
        });

        this.activeTxnChart = Ext.create('Exem.chart.CanvasChartLayer', {
            width: '100%',
            height: '100%',
            itemId: 'top_active_chart' ,
            title: this.monitorType == 'CD' ? common.Util.TR('TPS') : 'Active Transaction',
            titleHeight: 17 ,
            titleFontSize: '12px',
            interval: PlotChart.time.exMin,
            showLegend: true,
            legendWidth: 170,
            legendTextAlign: 'east',
            mouseSelect: true,
            mouseSelectMode: 'x',
            showIndicator: true ,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip: true,
            showTitle: true ,
            toolTipFormat: '%x [value:%y] ',
            toolTipTimeFormat: '%H:%M',
            chartProperty: {
                yLabelWidth: 55,
                xLabelFont: {size: 8, color: 'black'},
                yLabelFont: {size: 8, color: 'black'},
                xaxis: true
            },
            xaxisCurrentToTime : true,
            selectionZoom: true,
            historyInfoDblClick: function(chart, record) {
                self.setIndicatorTime(common.Util.getDate(record.data['TIME']));
                self.moveIndicator();
            },
            plotdblclick : function(event, pos, item, xAxis) {
                var fromTime, toTime;

                if (pos.x < 0) {
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
            plotselection: function() {

            },
            afterZoomEvent: self.setZoomInfo.bind(self)
        });


        if (this.monitorType == 'CD') {
            this.activeTxnChart.addSeries({
                label: common.Util.TR('AVG'),
                id   : 'tps_avg',
                type : PlotChart.type.exLine,
                stack: true
            });
        } else {
            this.activeTxnChart.addSeries({
                label: common.Util.TR('Normal'),
                id   : 'normal_avg',
                type : PlotChart.type.exLine,
                stack: true
            });

            this.activeTxnChart.addSeries({
                label: common.Util.TR('Warning'),
                id   : 'warning_avg',
                type : PlotChart.type.exLine,
                stack: true
            });

            this.activeTxnChart.addSeries({
                label: common.Util.TR('Critical'),
                id   : 'critical_avg',
                type : PlotChart.type.exLine,
                stack: true
            });
        }

        this.zoomBrushFrame = Ext.create('Exem.Panel', {
            layout : 'fit',
            height: 20,
            width: '100%',
            border: 1,
            hidden: true,
            itemId: 'chart_brushFrame',
            listeners: {
                scope: this,
                changetimerange: function(from, to) {
                    if (!this.activeTxnChart) {
                        return;
                    }

                    if (this.zoomBrush.fromTime == from && this.zoomBrush.toTime == to) {
                        this.activeTxnChart.setZoomStatus(false);
                    }

                    this.activeTxnChart.dependentChartZoomIn(from, to);
                }
            }
        });

        this.zoomBrush = Ext.create('Exem.TimeBrush', {
            target: this.zoomBrushFrame,
            marginLeft: 75,
            marginRight: 200,
            jumpVisible: false
        });

        this.activeTxnChart.timeBrush = this.zoomBrush;

        this.topPanel.add(this.activeTxnChart, this.zoomBrushFrame);
        this.workArea.add(this.topPanel);
    },

    createChart: function(title, tabName, alias) {
        var self = this,
            sumLiteral = '_sum',
            chart;

        chart = Ext.create('Exem.chart.CanvasChartLayer', {
            height: 50,
            title: title,
            alias: alias ? alias : title,
            interval: PlotChart.time.exMin,
            titleHeight: 17 ,
            titleWidth: 170,
            titleFontSize: '12px',
            showTitle: true ,
            showLegend: true,
            showXAxis: false,
            legendWidth: 170,
            legendNameWidth: 150,
            legendTextAlign: 'east',
            showIndicator: true ,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip: true,
            toolTipFormat: '%x [value:%y] ',
            toolTipTimeFormat: '%H:%M',
            mouseSelect: true,
            fillIntervalValue: true,
            cls: 'TPTrend-MidChart',
            chartProperty: {
                yLabelWidth: 55,
                xLabelFont : {size: 8, color: 'black'},
                yLabelFont : {size: 8, color: 'black'},
                xaxis      : true
            },
            xaxisCurrentToTime : true,
            selectionZoom: true,
            historyInfoDblClick: function(chart, record) {
                self.setIndicatorTime(common.Util.getDate(record.data['TIME']));
                self.moveIndicator();
            },
            plotdblclick : function(event, pos, item, xAxis) {
                var fromTime, toTime;

                if (pos.x < 0) {
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
            plotselection: function() {

            },
            afterZoomEvent: self.setZoomInfo.bind(self)
        });

        if (tabName === common.Util.TR('DB Stat') || tabName === common.Util.TR('DB Wait Stat')) {
            chart.addSeries({
                label: title,
                id   : 'dbStatName',
                type : PlotChart.type.exLine
            });

            chart.titleLayer.on('render', function(me) {
                me.el.dom.style.cursor = 'pointer';
                me.el.dom.onclick = this.clickTitle.bind(this);
            }, this);
        } else if (tabName === common.Util.TR('Agent OS Stat')) {
            if (title === common.Util.TR('OS CPU (%)')) {
                chart.addSeries({
                    label: 'CPU SYS',
                    id   : 'cpuSys',
                    type : PlotChart.type.exLine
                });
                chart.addSeries({
                    label: 'CPU USER',
                    id   : 'cpuUser',
                    type : PlotChart.type.exLine
                });
                chart.addSeries({
                    label: 'CPU IO',
                    id   : 'cpuIO',
                    type : PlotChart.type.exLine
                });
            } else if (title === common.Util.TR('OS Memory (MB)')) {
                chart.addSeries({
                    label: common.Util.TR('Free Memory'),
                    id   : 'freeMemory',
                    type : PlotChart.type.exLine
                });
                chart.addSeries({
                    label: common.Util.TR('Total Memory'),
                    id   : 'totalMemory',
                    type : PlotChart.type.exLine
                });
            }
        } else if (tabName === common.Util.TR('WebToB')) {
            if (title === common.Util.TR('BlockRun')) {
                chart.addSeries({
                    label: title,
                    id   : 'brun',
                    type : PlotChart.type.exLine
                });
            } else {
                chart.addSeries({
                    label: common.Util.CTR('MAX'),
                    id   : 'max',
                    type : PlotChart.type.exLine
                });

                chart.addSeries({
                    label: common.Util.CTR('AVG'),
                    id   : 'avg',
                    type : PlotChart.type.exLine
                });
            }
        } else {
            if (title === common.Util.TR('Response Code Status')) {
                chart.addSeries({
                    label: common.Util.TR('1xx'),
                    id   : 'code_100',
                    type : PlotChart.type.exLine
                    //color: this.responseStatusColors[0]
                });
                chart.addSeries({
                    label: common.Util.TR('2xx'),
                    id   : 'code_200',
                    type : PlotChart.type.exLine
                    //color: this.responseStatusColors[1]
                });
                chart.addSeries({
                    label: common.Util.TR('3xx'),
                    id   : 'code_300',
                    type : PlotChart.type.exLine,
                    color: this.responseStatusColors[2]
                });
                chart.addSeries({
                    label: common.Util.TR('4xx'),
                    id   : 'code_400',
                    type : PlotChart.type.exLine,
                    color: this.responseStatusColors[3]
                });
                chart.addSeries({
                    label: common.Util.TR('5xx'),
                    id   : 'code_500',
                    type : PlotChart.type.exLine,
                    color: this.responseStatusColors[4]
                });
            } else {
                if (alias.indexOf(sumLiteral) === -1) {
                    chart.addSeries({
                        label: common.Util.CTR('MAX'),
                        id   : 'max',
                        type : PlotChart.type.exLine
                    });

                    chart.addSeries({
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
            }

            chart.titleLayer.on('render', function(me) {
                me.el.dom.style.cursor = 'pointer';
                me.el.dom.onclick = this.clickTitle.bind(this);
            }, this);
        }

        this.chartList[tabName].push(chart);

        return chart;
    },

    checkSessionGrid: function(record, grid, cellIndex) {
        var curColumn = grid.headerCt.gridDataColumns[cellIndex].dataIndex,
            baseGrid = this.gridList[common.Util.TR('Active Session')],
            sqlId;

        switch (curColumn) {
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

        if (sqlId) {
            baseGrid.contextMenu.setDisableItem(2, true);
            baseGrid.contextMenu.setDisableItem(3, true);
        } else {
            baseGrid.contextMenu.setDisableItem(2, false);
            baseGrid.contextMenu.setDisableItem(3, false);
        }

        if (record['tid'] && record['txn_name']) {
            baseGrid.contextMenu.setDisableItem(0, true);
            baseGrid.contextMenu.setDisableItem(1, true);
        } else {
            baseGrid.contextMenu.setDisableItem(0, false);
            baseGrid.contextMenu.setDisableItem(1, false);
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

        setTimeout(function() {
            txnHistory.executeSQL();
        }, 300);
    },

    openSQLHistory: function(record) {
        var sqlHistory = common.OpenView.open('SQLHistory', {
            isWindow: false,
            width: 1200,
            height: 800,
            fromTime: this.datePicker.getFromDateTime(),
            toTime: this.datePicker.getToDateTime(),
            transactionNameTF: common.Util.cutOffTxnExtName(record['txn_name']),
            sqlIdTF: this.selectedSqlId,
            wasId : record['was_id']
        });

        setTimeout(function() {
            sqlHistory.executeSQL();
        }, 300);
    },

    openFullText: function(record, grid) {
        var sqlTextWindow = Ext.create('view.FullSQLText_TOP10');

        sqlTextWindow.arr_dt['sql_id']    = this.selectedSqlId;
        sqlTextWindow.arr_dt['txn_id']    = record['txn_id'];
        sqlTextWindow.arr_dt['was_id']    = record['was_id'];
        sqlTextWindow.arr_dt['from_time'] = Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00';
        sqlTextWindow.arr_dt['to_time']   = Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59';
        sqlTextWindow.loading_grd         = grid;
        sqlTextWindow.init();
    },

    createGrid: function(tabName, gridName) {
        var self = this,
            grid;

        grid = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            gridType: tabName === common.Util.TR('Lock Tree') ? Grid.exTree : Grid.exGrid,
            gridName: this.gridEnvKey + gridName
        });

        if (tabName === common.Util.TR('Active Session')) {
            if (this.monitorType === 'WAS') {
                grid.contextMenu.addItem({
                    title: common.Util.TR('Transaction Summary'),
                    fn: function() {
                        self.openTxnHistory(this.up().record);
                    }
                }, 1);

                grid.contextMenu.addItem({
                    title: common.Util.TR('SQL Summary'),
                    fn: function() {
                        self.openSQLHistory(this.up().record);
                    }
                }, 2);
            }

            if (this.monitorType !== 'WEB') {
                grid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record) {
                    this.checkSessionGrid(record.data, me, cellIndex);
                }.bind(this));

                grid.contextMenu.addItem({
                    title: common.Util.TR('Transaction Detail'),
                    fn: function() {
                        self.openTxnDetail(this.up().record);
                    }
                }, 0);

                grid.contextMenu.addItem({
                    title: common.Util.TR('Full SQL Text'),
                    fn: function() {
                        self.openFullText(this.up().record, this);
                    }
                }, 3);
            }
        }

        return grid;
    },

    addTab: function(tabPanel, tabInfo) {
        var tab, grid, charts, tabName, alias, title,
            ix, ixLen;

        tabName = tabInfo.title;
        tab = Ext.create('Exem.Container', {
            layout: 'vbox',
            title : tabName
        });

        if (tabInfo.type === 'grid') {
            grid = this.createGrid(tabName, tabInfo.name);

            this.gridList[tabName] = grid;

            tab.add(grid);

            if (tabName === common.Util.TR('Active Session')) {
                this.createSecFrame(tab, 'active');
            } else if (tabName === common.Util.TR('Lock Tree')) {
                this.createSecFrame(tab, 'lockTree');
            } else if (tabName === common.Util.TR('BlockRun')) {
                this.createSecFrame(tab, 'brun');
            }

            tab.addColumns = tabInfo.addColumns;
            tab.isInit = false;
        } else {
            this.chartList[tabName] = [];

            charts = tabInfo.charts;
            for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
                if (tabInfo.alias) {
                    alias = tabInfo.alias[ix];
                }

                if (tabName === common.Util.TR('DB Stat') || tabName === common.Util.TR('DB Wait Stat')) {
                    title = charts[ix];
                } else {
                    title = common.Util.TR(charts[ix]);
                }

                tab.add(this.createChart(title, tabName, alias));
            }
        }

        tabPanel.add(tab);
    },

    moveIndicator: function() {
        var ix, ixLen, indicatorPos, chart,
            tabName, charts;

        tabName = this.midPanel.getActiveTab().title;
        charts = this.chartList[tabName];

        indicatorPos = {
            x: +new Date(this.indicatorTime),
            y: null
        };

        this.activeTxnChart.drawIndicator(indicatorPos);

        if (tabName === common.Util.TR('Lock Tree')) {
            this.executeMidSQL();
        } else {
            for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
                chart = charts[ix];
                chart.drawIndicator(indicatorPos);
            }
        }

        if (this.botPanel && !this.botPanel.collapsed) {
            this.executeBotSQL();
        } else {
            this.loadingMask.hide();
        }
    },

    setIndicatorTime: function(time) {
        var chart = this.activeTxnChart;

        if (time) {
            this.indicatorTime = time;
        } else {
            if (chart.maxOffSet.x == -1 ) {
                this.indicatorTime = common.Util.getDate(this.datePicker.getFromDateTime() + ':00');
            } else {
                this.indicatorTime = common.Util.getDate(chart.maxOffSet.x);
            }
        }

        this.labelTime.setText(Ext.util.Format.date(this.indicatorTime, Comm.dateFormat.HMS));
    },

    setDependentChart: function() {
        var ix, ixLen, keys;

        keys = Object.keys(this.chartList);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            this.activeTxnChart.addDependentChart(this.chartList[keys[ix]]);
        }

        this.activeTxnChart.setZoomStatus(false);
    },

    createMidLayout: function() {
        var ix, ixLen, statChangeBtn;

        this.midPanel = Ext.create('Exem.TabPanel', {
            region   : 'center' ,
            layout   : 'vbox' ,
            height   : '40%' ,
            split    : true ,
            itemId   : 'mid_pnl',
            activeTab: 0,
            style    : 'borderRadius : 6px;',
            listeners: {
                scope: this,
                tabchange: function(me, newCard) {
                    if (newCard.title === common.Util.TR('Lock Tree') && !newCard.isInit) {
                        this.addLockTreeColumns(this.gridList[common.Util.TR('Lock Tree')]);
                        newCard.isInit = true;
                    }

                    if (this.activeTxnChart.maxOffSet.seriesIndex !== undefined) {
                        if (newCard.lastTime !== this.indicatorTime) {
                            this.executeMidSQL();
                            newCard.lastTime = this.indicatorTime;
                        }
                    }
                }
            }
        });

        for (ix = 0, ixLen = this.midTabInfos.length; ix < ixLen; ix++) {
            this.addTab(this.midPanel, this.midTabInfos[ix]);
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

        this.midPanel.getTabBar().add({xtype: 'tbspacer', flex: 8}, statChangeBtn);
        this.workArea.add(this.midPanel);

        this.midPanel.setActiveTab(0);

        this.setDependentChart();
    },

    addActiveColumns: function(grid) {
        grid.beginAddColumns();
        grid.addColumn('Time'                                  , 'end_time'      , 170, Grid.DateTime , false, true);
        grid.addColumn(common.Util.CTR('Agent'              )  , 'was_name'      , 100, Grid.String       , true , false);
        grid.addColumn('WAS ID'                                , 'was_id'        , 100, Grid.String       , false, true);
        grid.addColumn(common.Util.CTR('Transaction'        )  , 'txn_name'      , 150, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Class Method'       )  , 'class_method'  , 170, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Method Type'        )  , 'method_type'   , 100, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Client IP'          )  , 'client_ip'     , 130, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Login Name'         )  , 'login_name'    , 70 , Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Start Time'         )  , 'start_time'    , 70 , Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Elapse Time (AVG)'  )  , 'avg_elapse'    , 70 , Grid.Float        , false, true );
        grid.addColumn(common.Util.CTR('Transaction CPU TIME') , 'txn_cpu_time'  , 100, Grid.Float        , true , false);//10
        grid.addColumn(common.Util.CTR('CPU Time'           )  , 'cpu_time'      , 70 , Grid.Float        , true , false);
        grid.addColumn(common.Util.CTR('Thread CPU'         )  , 'thread_cpu'    , 70 , Grid.Float        , false , true);
        grid.addColumn(common.Util.CTR('IO Read'            )  , 'io_read'       , 70 , Grid.Number       , true , false);
        grid.addColumn(common.Util.CTR('IO Write'           )  , 'io_write'      , 70 , Grid.Number       , true , false);
        grid.addColumn(common.Util.CTR('DB Time'            )  , 'db_time'       , 70 , Grid.Float        , true , false);
        grid.addColumn(common.Util.CTR('Wait Time'          )  , 'wait_time'     , 70 , Grid.Float        , false, true );
        grid.addColumn(common.Util.CTR('Pool'               )  , 'pool_name'     , 70 , Grid.String       , true , false);
        grid.addColumn('Pool ID'                               , 'pool_id'       , 100, Grid.String       , false, true );
        grid.addColumn(common.Util.CTR('Elapse Time'        )  , 'elapse_time'   , 70 , Grid.Float        , true , false);
        grid.addColumn(common.Util.CTR('Instance Name'      )  , 'instance_name' , 70 , Grid.String       , true , false);//20
        grid.addColumn(common.Util.CTR('SID'                )  , 'sid'           , 100, Grid.StringNumber , true , false);
        grid.addColumn(common.Util.CTR('State'              )  , 'state'         , 100, Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('Bind Value'         )  , 'bind_list'     , 200, Grid.String       , true , false);
        grid.addColumn('SQL ID1'                               , 'sql_id1'       , 500, Grid.String       , false, true );
        grid.addColumn(common.Util.CTR('SQL 1'              )  , 'sql_text1'     , 70 , Grid.String       , true , false);
        grid.addColumn('SQL ID2'                               , 'sql_id2'       , 100, Grid.String       , false, true );
        grid.addColumn(common.Util.CTR('SQL 2'              )  , 'sql_text2'     , 70 , Grid.String       , true , false);
        grid.addColumn('SQL ID3'                               , 'sql_id3'       , 100, Grid.String       , false, true );
        grid.addColumn(common.Util.CTR('SQL 3'              )  , 'sql_text3'     , 70 , Grid.String       , true , false);
        grid.addColumn('SQL ID4'                               , 'sql_id4'       , 100, Grid.String       , false, true );//30
        grid.addColumn(common.Util.CTR('SQL 4'              )  , 'sql_text4'     , 70 , Grid.String       , true , false);
        grid.addColumn('SQL ID5'                               , 'sql_id5'       , 100, Grid.String       , false, true );
        grid.addColumn(common.Util.CTR('SQL 5'              )  , 'sql_text5'     , 70 , Grid.String       , true , false);
        grid.addColumn(common.Util.CTR('SQL Execution Count')  , 'sql_exec_count', 105, Grid.Number       , true , false);
        grid.addColumn(common.Util.CTR('Fetch Count'        )  , 'fetch_count'   , 70 , Grid.Number       , true , false);
        grid.addColumn('Current CRC'                           , 'current_crc'   , 70 , Grid.Number       , false , true);
        grid.addColumn(common.Util.CTR('Prepare Count'      )  , 'prepare_count' , 70 , Grid.Number       , true , false);
        grid.addColumn('Transaction ID'                        , 'txn_id'        , 70 , Grid.String       , false, true );
        grid.addColumn(common.Util.CTR('PGA Usage (MB)'     )  , 'mem_usage'     , 100, Grid.Float        , true , false);
        grid.addColumn(common.Util.CTR('Logical Reads'      )  , 'logical_reads' , 100, Grid.Number       , true , false);//40
        grid.addColumn(common.Util.CTR('Physical Reads'     )  , 'physical_reads', 100, Grid.Number       , true , false);
        grid.addColumn(common.Util.CTR('Wait Info'          )  , 'wait_info'     , 100, Grid.String       , true , false);
        grid.addColumn('TID'                                   , 'tid'           , 100, Grid.String       , true, false );
        grid.addColumn('Start Time Temp'                       , 'start_time_temp', 70 , Grid.String      , false, true );
        grid.endAddColumns();
        grid.loadLayout(grid.gridName);

        common.WebEnv.setVisibleGridColumn(grid, ['bind_list'], Comm.config.login.permission.bind !== 1 ? true : false );
    },

    addActiveProcessColumns: function(grid) {
        grid.beginAddColumns();
        grid.addColumn(common.Util.CTR('Time'              ) , 'time'      , 100, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('User Name'         ) , 'user_name' , 100, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('PID'               ) , 'pid'       , 100, Grid.StringNumber, true , false);
        grid.addColumn(common.Util.CTR('CPU'               ) , 'cpu'       , 100, Grid.Number      , true , false);
        grid.addColumn(common.Util.CTR('Virtual Memory (MB)'), 'vsz'       , 100, Grid.Float       , true , false);
        grid.addColumn(common.Util.CTR('Real Memory (MB)'  ) , 'rss'       , 100, Grid.Float       , true , false);
        grid.addColumn(common.Util.CTR('Argument'          ) , 'args'      , 500, Grid.String      , true , false);
        grid.endAddColumns();
        grid.loadLayout(grid.gridName);
    },

    addActiveSumColumns: function(grid) {
        grid.beginAddColumns();
        grid.addColumn(common.Util.CTR('Time'         )         , 'time'              , 130, Grid.DateTime    , true , false);
        grid.addColumn('WAS ID'                                 , 'was_id'            , 100, Grid.String      , false, true);
        grid.addColumn(common.Util.CTR('Agent'          )       , 'was_name'          , 100, Grid.String      , true , false);
        grid.addColumn('TXN ID'                                 , 'txn_id'            , 100, Grid.String      , false, true);
        grid.addColumn(common.Util.CTR('Transaction'  )         , 'txn_name'          , 250, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('Current Method')        , 'class_method'      , 250, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('Client IP'    )         , 'client_ip'         , 100, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('Start Time'   )         , 'start_time'        , 130, Grid.DateTime    , true , false);
        grid.addColumn(common.Util.CTR('Elapse Time'  )         , 'elapse_time'       , 100, Grid.Float       , true , false);
        grid.addColumn(common.Util.CTR('CPU Time'     )         , 'cpu_time'          , 100, Grid.Float       , true , false);
        grid.addColumn(common.Util.CTR('Wait Time'    )         , 'wait_time'         , 100, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('Instance Name')         , 'instance_name'     , 100, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('SID'          )         , 'sid'               , 100, Grid.StringNumber, true , false);
        grid.addColumn(common.Util.CTR('State'        )         , 'state'             , 100, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('SQL Execution Count')   , 'sql_exec_count'    , 100, Grid.Float       , true , false);
        grid.addColumn(common.Util.CTR('Prepare Count')         , 'prepare_count'     , 100, Grid.Float       , true , false);
        grid.addColumn(common.Util.CTR('Fetch Count'  )         , 'fetch_count'       , 100, Grid.Float       , true , false);
        grid.addColumn(common.Util.CTR('PGA Usage (MB)')        , 'mem_usage'         , 100, Grid.Float       , true , false);
        grid.addColumn(common.Util.CTR('Logical Reads')         , 'logical_reads'     , 100, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('Physical Reads')        , 'physical_reads'    , 100, Grid.String      , true , false);
        grid.addColumn(common.Util.CTR('Wait Info'    )         , 'wait_info'         , 100, Grid.String      , true , false);
        grid.addColumn('Current CRC'                            , 'current_crc'       , 100, Grid.String      , false, true);
        grid.addColumn('Pool ID'                                , 'pool_id'           , 100, Grid.String      , false, true);
        grid.addColumn('TID'                                    , 'tid'               , 100, Grid.String      , true, false);
        grid.endAddColumns();
        grid.loadLayout(grid.gridName);
    },

    changeSecFrame: function(type, sec) {
        var secFrames = this.secFrames[type],
            secFrame, selectedSecFrame, changeClassName, selectedClassName, existSecTimes;

        secFrame = secFrames[sec];
        selectedSecFrame = secFrames[this.selectedSecTime];
        changeClassName = secFrame.el.dom.className;
        selectedClassName = selectedSecFrame.el.dom.className;

        if (changeClassName.indexOf('active') === -1) {
            secFrame.el.dom.className += ' selected';
        } else if (changeClassName.indexOf('active') !== -1) {
            secFrame.el.dom.className = secFrame.el.dom.className.replace(/active/gi, 'selected');
        }

        if (selectedClassName.indexOf('selected') !== -1) {
            existSecTimes = this.existSecTimes[type];
            if (existSecTimes.indexOf(this.selectedSecTime) === -1) {
                selectedSecFrame.el.dom.className = selectedSecFrame.el.dom.className.replace(/selected/gi, '');
            } else {
                selectedSecFrame.el.dom.className = selectedSecFrame.el.dom.className.replace(/selected/gi, 'active');
            }
        }
    },

    createSecFrame: function(target, type) {
        var ix, secFrame, width, secCon, secFrames, time;

        secFrames = this.secFrames[type];
        if (type === 'lockTree') {
            width = 1200;
        } else {
            width = 1310;
        }

        secCon = Ext.create('Exem.Container', {
            layout: 'hbox',
            align: 'stretch',
            height: 15,
            width: width
        });

        for (ix = 0; ix <= 59; ix++) {
            if (ix == 0)  {
                time = '00';
            } else {
                if (ix < 10) {
                    time = '0' + ix;
                } else {
                    time = ix;
                }
            }

            secFrame = Ext.create('Exem.Container', {
                flex: 1,
                html: time,
                type: type,
                disabled: true,
                cls: 'PerformanceTrend-secFrame',
                listeners: {
                    scope: this,
                    render: function(me) {
                        me.el.dom.onclick = function(event) {
                            var sec, target, existSecTimes, currTime;

                            target = event.currentTarget;
                            sec = +target.textContent;
                            existSecTimes = this.existSecTimes[me.type];
                            currTime = new Date(this.indicatorTime);

                            if (sec !== this.selectedSecTime && existSecTimes.indexOf(sec) !== -1) {
                                this.setIndicatorTime(common.Util.getDate(currTime.setSeconds(sec)));

                                if (me.type === 'active' || me.type === 'brun') {
                                    this.executeBotSQL();
                                    this.changeSecFrame(me.type, sec);

                                    if (this.midPanel.getActiveTab().title === common.Util.TR('Lock Tree')) {
                                        this.executeMidSQL();
                                        this.changeSecFrame('lockTree', sec);
                                    }
                                } else {
                                    if (this.botPanel.getActiveTab().title === common.Util.TR('Active Session')) {
                                        this.executeBotSQL();
                                        this.changeSecFrame('active', sec);
                                    }

                                    this.executeMidSQL();
                                    this.changeSecFrame(me.type, sec);
                                }

                                this.selectedSecTime = sec;
                            }
                        }.bind(this);
                    }
                }
            });

            secFrames.push(secFrame);
        }

        secCon.add(secFrames);

        if (type === 'active') {
            secCon.add({ xtype: 'tbspacer', flex: 1 });
            this.addBtn(secCon, 'btn_sec_first', 'firstLeftOFF' , true , 'bottom');
            this.addBtn(secCon, 'btn_sec_prev' , 'leftMoveOFF'  , true , 'bottom');
            this.addBtn(secCon, 'btn_sec_next' , 'rightMoveOFF' , true , 'bottom');
            this.addBtn(secCon, 'btn_sec_last' , 'firstRightOFF', false, 'bottom');
        }

        target.add(secCon);
    } ,

    createBotLayout: function() {
        this.botPanel = Ext.create('Exem.TabPanel', {
            region: 'south' ,
            layout: 'vbox' ,
            height: '33%' ,
            split: true ,
            activeTab: 0,
            collapsible: true,
            collapsed: false,
            collapseMode:'header',
            style: 'borderRadius : 6px;',
            listeners: {
                scope: this,
                collapse: function() {
                    var collapseEl = this.workArea.el.dom.getElementsByClassName('x-title-text')[1];

                    collapseEl.style.paddingLeft = '47%';
                    collapseEl.style.cursor      = 'pointer';

                    collapseEl.addEventListener('mouseover', function(event) {
                        event.target.style.color = '#379df0';
                    });

                    collapseEl.addEventListener('mouseleave', function(event) {
                        event.target.style.color = 'black';
                    });

                    collapseEl.onclick = function() {
                        this.botPanel.expand();
                    }.bind(this);

                    collapseEl.innerHTML = common.Util.TR('Show Active Transaction');
                },
                expand: function(me) {
                    if (this.indicatorTime === me.lastTime) {
                        return;
                    }

                    me.lasTime = this.indicatorTime;
                    this.executeBotSQL();
                },
                tabchange: function(tabPanel, newCard) {
                    if (!newCard.isInit) {
                        newCard.addColumns(this.gridList[newCard.title]);
                        newCard.isInit = true;
                    }

                    if (this.activeTxnChart.maxOffSet.seriesIndex !== undefined) {
                        if (newCard.lastTime !== this.indicatorTime) {
                            this.executeBotSQL();
                            newCard.lastTime = this.indicatorTime;
                        }
                    }
                }
            }
        });

        this.addTab(this.botPanel, {
            title: common.Util.TR('Active Session'),
            type: 'grid',
            name: 'active',
            addColumns: this.addActiveColumns
        });

        this.addTab(this.botPanel, {
            title: common.Util.TR('Process'),
            type: 'grid',
            name: 'process',
            addColumns: this.addActiveProcessColumns
        });

        this.addTab(this.botPanel, {
            title: common.Util.TR('Active Session (SUM)'),
            type: 'grid',
            name: 'summary',
            addColumns: this.addActiveSumColumns
        });

        this.workArea.add(this.botPanel);

        this.botPanel.getHeader().setVisible(false);
        this.botPanel.setActiveTab(0);
    },

    executeSQL: function() {
        this.zoomFrom = null;
        this.zoomTo = null;

        this.existSecTimes = {
            active: [],
            lockTree: []
        };

        this.selectedSecTime = 0;
        this.executeCount = 0;

        this.activeTxnChart.setZoomStatus(false);

        this.executeTopSQL();

        this.loadingMask.show();
    },

    executeSecFrame: function(sqlFile, type) {
        var dataSet = {},
            currTime = this.getConvertTime(this.indicatorTime),
            bindName, bindValue;

        if (type === 'lockTree' && !this.dbCombo.getValue()) {
            return;
        }

        if (type === 'lockTree') {
            bindName = 'db_id';
            bindValue = this.dbCombo.getValue();
            this.existSecTimes.lockTree = [];
        } else {
            bindName = 'was_id';
            bindValue = this.wasCombo.getValue();
            if (this.monitorType === 'WEB') {
                bindName = 'ws_id';
            }

            if (type === 'brun') {
                this.existSecTimes.brun = [];
            } else {
                this.existSecTimes.active = [];
            }
        }

        dataSet.sql_file = sqlFile;
        dataSet.bind = [{
            name: 'fromtime',
            value: currTime + ':00',
            type: SQLBindType.STRING
        }, {
            name: 'totime',
            value: currTime + ':59',
            type: SQLBindType.STRING
        }, {
            name: bindName,
            value: bindValue,
            type: SQLBindType.INTEGER
        }];

        dataSet.serializable_query = true;

        WS.SQLExec(dataSet, this.onData, this);
        this.executeCount++;
    },

    setSec: function(data, type) {
        var secFrames = this.secFrames[type],
            existSecTimes = this.existSecTimes[type],
            currTime = new Date(this.indicatorTime),
            botTab = this.botPanel.getActiveTab(),
            midTab = this.midPanel.getActiveTab(),
            isActiveLockTree = midTab.title === common.Util.TR('Lock Tree'),
            isActiveSession = botTab.title === common.Util.TR('Active Session'),
            connectSec = -1,
            ix, ixLen, sec, secFrame, addClassName;

        for (ix = 0, ixLen = secFrames.length; ix < ixLen; ix++) {
            secFrame = secFrames[ix];
            secFrame.el.dom.className = secFrame.el.dom.className.replace(/selected|active/gi, '');
        }

        if (type === 'lockTree' && isActiveLockTree && isActiveSession) {
            if (botTab.lastTime === this.indicatorTime && data[0]) {
                this.changeSecFrame('active', +data[0]);
            }
        } else {
            if (data.length > 0 && (type === 'lockTree' && isActiveSession || type === 'active' && isActiveLockTree)) {
                connectSec = currTime.getSeconds();
                secFrame = secFrames[connectSec];

                secFrame.enable();
                secFrame.el.dom.className += ' selected';
            }
        }

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            sec = +data[ix];
            secFrame = secFrames[sec];
            existSecTimes.push(sec);

            if (ix === 0 && connectSec === -1) {
                addClassName = ' selected';
                this.selectedSecTime = sec;
                this.setIndicatorTime(common.Util.getDate(currTime.setSeconds(sec)));
            } else {
                addClassName = ' active';
            }

            if (sec !== connectSec) {
                secFrame.enable();
                secFrame.el.dom.className += addClassName;
            }
        }

        if (type === 'lockTree') {
            midTab.lastTime = this.indicatorTime;
        } else {
            botTab.lastTime = this.indicatorTime;
        }
    }
});