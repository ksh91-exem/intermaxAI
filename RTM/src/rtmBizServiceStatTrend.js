Ext.define('rtm.src.rtmBizServiceStatTrend', {
    extend: 'Exem.DockForm',
    layout: 'fit',
    width : '100%',
    height: '100%',

    isFirstLoad: true,
    isClosedDockForm: false,

    sql: {
        executionCount  : 'IMXRT_BizStat_ExecutionCount.sql',
        tps             : 'IMXRT_BizStat_TPS.sql',
        responseTime    : 'IMXRT_BizStat_ResponseTime.sql'
    },

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;
            this.refreshTimer = null;

            this.stopRefreshData();

            Ext.Array.remove(realtime.canvasChartList, this.chart.id);
        },
        activate: function() {
            if (!this.isFirstLoad) {
                this.chart.plotReSize();
            }
            this.isFirstLoad = false;
        }
    },

    initProperty: function() {
        var today = new Date();

        this.monitorType    = 'Business';
        this.openViewType   = Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr    = Comm.RTComm.getBizIdList(Comm.businessRegisterInfo);
        this.serverNameArr  = Comm.RTComm.getBizNameList(Comm.businessRegisterInfo);

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.diffDay = today.setDate(today.getDate() - 1);

        this.webEnvKey =  this.componentId + '_rtmBizServiceStatTrendStat';

        if (Comm.web_env_info[this.webEnvKey]) {
            if (typeof Comm.web_env_info[this.webEnvKey] === 'string') {
                this.webEnvData = JSON.parse(Comm.web_env_info[this.webEnvKey]);
            } else {
                this.webEnvData = Comm.web_env_info[this.webEnvKey];
            }
        }

        if (this.webEnvData) {
            this.statId   = this.webEnvData.statId;
            this.bizId    = this.webEnvData.bizId;
            this.statName = this.webEnvData.statName;
            this.bizName  = this.webEnvData.bizName;
            this.isTotal  = this.webEnvData.isTotal;
        } else {
            this.statId     = 'txn_count';
            this.bizId      = this.serverIdArr;
            this.statName   = common.Util.CTR('Today Transaction Execution Count');
            this.bizName    = 'All';
            this.isTotal    = true;
        }
    },

    init: function() {
        this.initProperty();

        this.initLayout();

        this.initSetting();

        this.refreshChartData();
    },


    initLayout: function() {
        var baseCon = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-execution-count-base'
        });

        this.createTopCon();

        this.createChartCon();

        baseCon.add(this.topCon, this.chartCon);

        this.add(baseCon);
    },

    initSetting: function() {
        this.chart.plotDraw();

        this.setFrameText(this.statName, this.bizName);
    },

    createTopCon: function() {
        var yesterday = new Date(this.diffDay);

        this.topCon  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '6 0 0 0'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            padding: '0 0 0 0',
            cls    : 'header-title',
            style  : {
                cursor : 'pointer'
            },
            listeners: {
                scope: this,
                render: function(me) {
                    me.el.on( 'click', function() {
                        this.openStatList();
                    }, this);
                }
            }
        });

        this.datePicker = Ext.create('Exem.DatePicker',{
            width           : 110,
            DisplayTime     : DisplayTimeMode.None,
            cls             : 'Exem-DatePicker',
            singleField     : true,
            comparisionMode : true,
            setRightCalPos  : true,
            onCalenderValidFn : function() {
                this.diffDay = this.datePicker.pickerUI.dateField.mainFromField.getValue();
                this.refreshChartData();
            }.bind(this)
        });

        this.datePicker.hideRetriveBtn(true);

        this.diffDay = Ext.Date.format(yesterday, Comm.dateFormat.NONE);
        this.datePicker.mainFromField.setValue(this.diffDay);

        this.chartLegend = Ext.create('Ext.container.Container',{
            width : (Comm.Lang === 'ko' || window.nation === 'ko') ? 130 : 182,
            margin: '2 0 0 0',
            cls   : 'legendLabel ',
            html  : '<div class="todayIcon"></div><div class="label">' + common.Util.TR('Today') + '</div>' +
            '<div class="yesterdayIcon"></div><div class="label">' + common.Util.TR('Comparison Date') + '</div>'
        });

        this.topCon.add([this.frameTitle, {xtype: 'tbfill'}, this.chartLegend, this.datePicker]);
    },

    createChartCon: function() {
        this.chartCon = Ext.create('Exem.Container',{
            width   : '100%',
            height  : '100%',
            layout  : 'fit',
            padding : '0 10 0 0',
            flex    : 1,
            listeners: {
                scope: this,
                resize : function() {
                    if (this.chart) {

                        if (this.getWidth() <= 420) {
                            this.chart._chartOption.xaxis.mode  = null;
                        } else {
                            this.chart._chartOption.xaxis.mode  = 'categories';
                        }

                        this.chart.plotReSize();
                    }
                }
            }
        });

        this.createChart(this.chartCon);
    },

    openStatList: function() {
        this.listWindow = Ext.create('rtm.src.rtmBizStatListChange', {
            statId: this.statId,
            bizId: this.isTotal ? 'All' : this.bizId,
            save: this.childSave.bind(this)
        });

        this.listWindow.init();
        this.listWindow.show();
    },

    childSave: function(statName, bizName, statId, bizId) {
        var allBizId = [],
            ix, ixLen, dataObj;


        this.setFrameText(statName, bizName);

        this.statId = statId;

        if (bizId === 'All') {
            this.isTotal = true;

            for ( ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++ ) {
                allBizId.push(Comm.businessRegisterInfo[ix].parent['bizId']);
            }
        } else {
            this.isTotal = false;

            allBizId.push(bizId);
        }

        this.bizId = allBizId;

        this.frameRefresh();

        dataObj = {
            statId      : statId,
            bizId       : this.bizId,
            statName    : statName,
            bizName     : bizName,
            isTotal     : this.isTotal
        };

        common.WebEnv.Save(this.webEnvKey, dataObj);
    },

    createChart: function(target) {
        var theme = Comm.RTComm.getCurrentTheme(),
            isContain, fontColor, borderColor, barColor;

        switch (theme) {
            case 'Black' :
                fontColor   = '#FFFFFF';
                borderColor = '#81858A';
                break;
            case 'White' :
                fontColor   = '#555555';
                borderColor = '#CCCCCC';
                break;
            default :
                fontColor   = '#ABAEB5';
                borderColor = '#81858A';
                break;
        }

        barColor = [].concat(realtime.barLineChartColor);

        this.chart = Ext.create('Exem.chart.CanvasChartLayer', {
            width               : '100%',
            flex                : 1,
            legendVH            : 'hbox',
            legendAlign         : 'north',
            legendContentAlign  : 'end',
            legendHeight        : 30,
            legendWidth         : 80,
            toFixedNumber       : 2,
            showLegend          : false,
            showTooltip         : true,
            showHistoryInfo     : false,
            showMaxValue        : false,
            showMultiToolTip    : true,
            toolTipTimeFormat   : null,
            legendColorClickToVisible: true,
            legendBackgroundColor: 'transparent',
            BackgroundColor: 'transparent',
            chartProperty  : {
                mode   : 'categories',
                colors : barColor,
                borderColor : borderColor,
                axislabels : true,
                yLabelWidth: 35,
                xLabelFont : {size: 12, color: fontColor},
                yLabelFont : {size: 12, color: fontColor}
            }
        });
        this.chart.chartLayer.margin = '0 0 0 0';
        this.chart._chartContainer.addCls('xm-canvaschart-base');

        target.add(this.chart);

        isContain = Ext.Array.contains(realtime.canvasChartList, this.chart.id);

        if (!isContain) {
            realtime.canvasChartList[realtime.canvasChartList.length] = this.chart.id;
        }

        this.addChartSeries(this.chart);
    },


    addChartSeries: function(targetChart) {
        targetChart.addSeries({
            id    : 'todayCnt',
            label : common.Util.TR('Today'),
            type  : PlotChart.type.exBar,
            stack : false,
            cursor: false
        });

        targetChart.addSeries({
            id    : 'yesterdayCnt',
            label : common.Util.TR('Comparison Date'),
            type  : PlotChart.type.exLine,
            yaxis : 1,
            lines : { show: true },
            points: { show: true },
            cursor: false
        });
        targetChart.setLineWidth(0, 2);
        targetChart.setLineWidth(1, 1);
    },


    stopRefreshData: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },


    refreshChartData: function() {
        this.stopRefreshData();

        this.drawChartData();

        this.refreshTimer = setTimeout(this.refreshChartData.bind(this), 1000 * 60 * 10);
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getBizIdList(Comm.businessRegisterInfo);
        this.serverNameArr = Comm.RTComm.getBizNameList(Comm.businessRegisterInfo);

        this.refreshChartData();
    },


    frameRefresh: function() {
        this.refreshChartData();
    },


    frameStopDraw: function() {
        this.stopRefreshData();
    },


    drawChartData: function() {
        var temp = Comm.RTComm.getCurrentServerTime(realtime.lastestTime),
            diffTemp = new Date(this.diffDay),
            subBizIdList = [], childBizIdList = [],
            ix, ixLen, jx, jxLen,
            todayFromTime, todayToTime, diffFromTime, diffToTime, sqlFile;

        if ( !Comm.RTComm.isValidDate(temp) ) {
            console.debug('%cExecution Count - Invalid Date: ' + realtime.lastestTime, 'color:#800000;background-color:silver;font-size:14px;');

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            temp = new Date(this.beforeLastestTime);
        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }
        todayFromTime = Ext.Date.format(temp, 'Y-m-d 00:00:00.000');
        todayToTime   = Ext.Date.format(temp, 'Y-m-d 23:59:00.000');

        diffFromTime = Ext.Date.format(diffTemp, 'Y-m-d 00:00:00.000');
        diffToTime = Ext.Date.format(diffTemp, 'Y-m-d 23:59:00.000');

        switch (this.statId) {
            case 'txn_count':
                sqlFile = this.sql.executionCount;
                break;
            case 'tps':
                sqlFile = this.sql.tps;
                break;
            case 'response_time':
                sqlFile = this.sql.responseTime;
                break;
            default:
                sqlFile = this.sql.executionCount;
                break;
        }

        if (this.bizId) {
            this.allBizIdList = [];

            for (ix = 0, ixLen = this.bizId.length; ix < ixLen; ix++) {
                subBizIdList = common.Util.getAllBizList(this.bizId[ix]);
                childBizIdList.push(subBizIdList);
            }

            for (ix = 0, ixLen = childBizIdList.length; ix < ixLen; ix++) {
                for (jx = 0, jxLen = childBizIdList[ix].length; jx < jxLen; jx++) {
                    this.allBizIdList.push(childBizIdList[ix][jx]);
                }
            }
        }

        WS.SQLExec({
            sql_file: sqlFile,
            bind: [{
                name: 'todayFromTime', value: todayFromTime, type: SQLBindType.STRING
            }, {
                name: 'todayToTime',   value: todayToTime, type: SQLBindType.STRING
            }, {
                name: 'diffFromTime',   value: diffFromTime, type: SQLBindType.STRING
            }, {
                name: 'diffToTime',   value: diffToTime, type: SQLBindType.STRING
            }],
            replace_string: [{
                name: 'businessId', value: this.allBizIdList.join()
            }]
        }, function(header, data) {
            var ix, ixLen, xAxis, yAxis;

            if (this.isClosedDockForm) {
                return;
            }

            if (!common.Menu.isBusinessPerspectiveMonitoring) {
                console.warn('option.conf 를 확인해주세요.');
                return;
            }

            this.chart.clearValues();

            for ( ix = 0, ixLen = data[0].rows.length; ix < ixLen; ix++) {
                xAxis = Number(data[0].rows[ix][0].substr(11));

                yAxis = data[0].rows[ix][1];

                this.decimalPointSetting(header.command);

                this.chart.addValue(0, [xAxis,  yAxis]);
            }

            for (ix = 0, ixLen = data[1].rows.length; ix < ixLen; ix++) {
                xAxis = Number(data[1].rows[ix][0].substr(11));

                yAxis = data[1].rows[ix][1];

                this.decimalPointSetting(header.command);

                this.chart.addValue(1, [xAxis,  yAxis]);
            }

            this.chart.plotDraw();

        }, this);
    },

    decimalPointSetting: function(executionSQL) {
        switch (executionSQL) {
            case this.sql.executionCount:
                this.chart.toFixedNumber = 0;
                break;
            case this.sql.tps:
            case this.sql.responseTime:
                this.chart.toFixedNumber = 3;
                break;
            default:
                console.warn('실행한 SQL가 없습니다.');
                break;
        }
    },

    setFrameText: function(statName, bizName) {
        this.frameTitle.setText(statName + ' (' + bizName + ')');
    }
});