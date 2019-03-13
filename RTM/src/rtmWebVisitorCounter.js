Ext.define('rtm.src.rtmWebVisitorCounter', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Today Visitor Count'),
    layout: 'fit',

    isFirstLoad: true,
    isClosedDockForm: false,

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

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
        this.monitorType  = 'WEB';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);
    },

    init: function() {
        this.initProperty();

        this.initLayout();

        this.refreshChartData();
    },


    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-visitorcount-base'
        });

        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '6 0 0 0'
        });

        this.chartLegend = Ext.create('Ext.container.Container',{
            width : 150,
            margin: '2 0 0 0',
            cls   : 'legendLabel ',
            html  : '<div class="todayIcon"></div><div class="label">'    + common.Util.TR('Today') +'</div>'+
                    '<div class="yesterdayIcon"></div><div class="label">'+ common.Util.TR('Yesterday')+'</div>'
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '1 10 0 0',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function(){
                        this.dockContainer.toggleExpand(this);
                    }, this);
                }
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            padding: '0 0 0 0',
            cls    : 'header-title',
            text   : common.Util.CTR('Today Visitor Count')
        });

        this.chartFrame = Ext.create('Exem.Container',{
            width   : '100%',
            height  : '100%',
            layout  : 'fit',
            padding : '0 10 0 0',
            flex    : 1,
            listeners: {
                scope: this,
                resize : function(){
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

        this.topContentsArea.add([this.frameTitle, {xtype: 'tbfill'}, this.chartLegend, this.expendIcon]);

        this.background.add([this.topContentsArea, this.chartFrame]);

        this.add(this.background);

        this.createChart(this.chartFrame);

        this._addChartSeries(this.chart);

        this.chart.plotDraw();

        if (this.floatingLayer === true) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },


    createChart: function(target) {
        var fontColor, borderColor, barColor;

        var theme = Comm.RTComm.getCurrentTheme();

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
            toFixedNumber       : 0,
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

        var isContain = Ext.Array.contains(realtime.canvasChartList, this.chart.id);

        if (isContain !== true) {
            realtime.canvasChartList[realtime.canvasChartList.length] = this.chart.id;
        }
    },


    _addChartSeries: function(targetChart) {
        targetChart.addSeries({
            id    : 'todayCnt',
            label : common.Util.TR('Today'),
            type  : PlotChart.type.exBar,
            bars: {},
            stack : false,
            cursor: false
        });

        targetChart.addSeries({
            id    : 'yesterdayCnt',
            label : common.Util.TR('Yesterday'),
            type  : PlotChart.type.exLine,
            yaxis : 1,
            lines : { show: true },
            points: { show: true },
            cursor: false
        });
        targetChart.setLineWidth(0, 2);
        targetChart.setLineWidth(1, 1);
    },


    stopRefreshData: function(){
        if (this.refreshTimer != null) {
            clearTimeout(this.refreshTimer);
        }
    },


    refreshChartData: function() {
        this.stopRefreshData();

        this.drawChartData();

        this.refreshTimer = setTimeout(this.refreshChartData.bind(this), 1000 * 60 * 5);
    },


    frameChange: function(serverNameList) {
        var serverIdArr = [];
        var idx, serverName;

        if (serverNameList) {
            for (var i = 0, icnt = serverNameList.length; i < icnt; ++i) {
                serverName = serverNameList[i];
                idx = this.serverNameArr.indexOf(serverName) ;

                if (idx === -1 ) {
                    continue;
                }
                serverIdArr[serverIdArr.length] = +this.serverIdArr[idx];
            }
        }

        if (serverIdArr.length <= 0) {
            serverIdArr = this.serverIdArr.concat();
        }

        this.selectedServerIdArr = serverIdArr;

        serverIdArr    = null;
        serverNameList = null;

        this.refreshChartData();
    },


    frameRefresh: function(){
        this.refreshChartData();
    },


    frameStopDraw: function(){
        this.stopRefreshData();
    },


    /**
     * Draw chart
     * Refresh Time: 5 miniute
     */
    drawChartData: function() {
        var temp = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if (Comm.RTComm.isValidDate(temp) !== true) {
            console.debug('%c [Visitor Count] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (this.beforeLastestTime == null) {
                this.beforeLastestTime = +new Date();
            }
            temp = new Date(this.beforeLastestTime);
        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        var fromtime = Ext.Date.format(Ext.Date.subtract(temp, Ext.Date.DAY, 1), 'Y-m-d 00:00:00.000');
        var totime   = Ext.Date.format(temp, 'Y-m-d 23:59:00.000');

        var value;
        if (this.selectedServerIdArr.length <= 0) {
            value = -1;
        } else {
            value = this.selectedServerIdArr.join(',');
        }

        WS.SQLExec({
            sql_file: 'IMXRT_Web_ServiceStat_Visitor.sql',
            bind: [{
                name: 'fromtime', value: fromtime, type: SQLBindType.STRING
            }, {
                name: 'totime',   value: totime, type: SQLBindType.STRING
            }],
            replace_string: [{
                name: 'ws_id',   value: value
            }]
        }, function(aheader, adata) {

            if (this.isClosedDockForm === true) {
                return;
            }

            var isValidate = common.Util.checkSQLExecValid(aheader, adata);

            if (!isValidate) {
                return;
            }

            this.chart.clearValues();

            var xAxis, yAxis;

            for (var ix = 0, len = adata.rows.length; ix < len; ix++) {
                xAxis = Number(adata.rows[ix][0].substr(11));
                yAxis = adata.rows[ix][1];

                if ( ix <= 23 ) {
                    this.chart.addValue(1, [xAxis,  yAxis ]);
                } else {
                    this.chart.addValue(0, [xAxis,  yAxis ]);
                }
            }
            this.chart.plotDraw();

            adata = null;
        }, this);
    }

});
