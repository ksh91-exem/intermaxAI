/**
 * Created by 신정훈 on 2017-01-09.
 */
Ext.define('rtm.src.rtmMemoryLeak', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Memory Leak Trace Realtime Analysis'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    isClosedDockForm: false,
    refreshInterval: 600,

    tid : null,
    wasid : null,
    className : null,
    autoRefreshCheck : false,

    headerCheck : false,

    chartCount : 3,
    chartInfoObj : {},

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
        }
    },

    init: function() {
        this.initLayout();

        this.executeSQL();

    },

    /**
     * 기본 레이어 구성
     */
    initLayout: function() {
        var background;

        background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-tablespace-base'
        });

        this.createTopSummaryLayout(background);
        this.createBottomDetailLayout(background);

        this.createSummaryGrid(this.summaryGridFrame);
        this.createDetailGrid(this.detailGridFrame);

        this.add(background);

    },

    createTopSummaryLayout: function(target) {
        var borderColor,
            theme;

        var topSummaryArea,
            summaryTitle,
            summaryInfoArea,
            summaryGridArea,
            gridConditionArea,
            retrieveButton,
            summaryChartArea;

        topSummaryArea = Ext.create('Exem.Container',{
            width    : '100%',
            height   : '100%',
            minHeight: 150,
            layout   : 'vbox',
            flex     : 0.5,
            margin   : '10 0 0 0'
        });

        summaryTitle = Ext.create('Ext.form.Label',{
            height: 20,
            margin: '0 0 0 10',
            cls   : 'header-title',
            text  : common.Util.CTR('Element storage status trend by collection instance')
        });

        summaryInfoArea = Ext.create('Exem.Container',{
            width : '100%',
            height: '100%',
            layout: 'hbox',
            flex  : 1,
            margin: '10 10 10 5'
        });

        summaryGridArea = Ext.create('Exem.Container',{
            width : '100%',
            height: '100%',
            layout: 'vbox',
            flex    : 0.55,
            margin: '0 10 10 5'
        });

        gridConditionArea = Ext.create('Exem.Container',{
            width : '100%',
            height: 30,
            layout: 'hbox'
        });

        this.wasCombo = Ext.create('Exem.wasDBComboBox',{
            cls             : 'rtm-list-condition',
            selectType      : common.Util.TR('Agent'),
            comboLabelWidth : 50,
            multiSelect     : false,
            addSelectAllItem: false,
            comboWidth      : 200,
            width           : 210,
            wasId           : this.wasid,
            listeners       : {
                afterrender : function(me) {
                    me.selectByValue(me.wasId);
                }
            }
        });

        retrieveButton = Ext.create('Ext.button.Button', {
            text   : common.Util.TR('Retrieve'),
            cls    : 'rtm-button',
            scope  : this,
            width  : 60,
            handler: function() {
                this.executeSQL();
                this.stopRefreshData();
                this.detailChartArea.removeAll();
            }
        });

        this.summaryGridFrame = Ext.create('Exem.Container',{
            width : '100%',
            height: '100%',
            flex  : 1
        });

        summaryChartArea = Ext.create('Exem.Container',{
            width : '100%',
            height: '100%',
            layout: 'hbox',
            flex  : 0.45,
            margin: '5 10 10 10'
        });

        theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                borderColor = '#81858A';
                break;
            case 'White' :
                borderColor = '#CCCCCC';
                break;
            default :
                borderColor = '#81858A';
                break;
        }

        this.pie_InstanceCount = Ext.create('Exem.chart.CanvasChartLayer', {
            layout         : 'fit',
            title          : common.Util.TR('Instance Count') + '&nbsp;',
            titleHeight    : 25,
            titleAlign     : 'center',
            flex           : 1,
            showTitle      : true,
            showHistoryInfo: false,
            toolTipFormat  : '[%s] %y',
            chartProperty  : {
                borderColor: borderColor
            }
        });
        this.pie_InstanceCount._chartContainer.addCls('xm-canvaschart-base');

        this.pie_collectionSize = Ext.create('Exem.chart.CanvasChartLayer', {
            layout         : 'fit',
            title          : common.Util.TR('Element Count') + '&nbsp;',
            titleHeight    : 25,
            titleAlign     : 'center',
            flex           : 1,
            showTitle      : true,
            showHistoryInfo: false,
            toolTipFormat  : '[%s] %y',
            chartProperty  : {
                borderColor: borderColor
            }
        });
        this.pie_collectionSize._chartContainer.addCls('xm-canvaschart-base');


        gridConditionArea.add([this.wasCombo, {xtype: 'tbfill', flex: 1}, retrieveButton]);
        summaryGridArea.add([gridConditionArea, this.summaryGridFrame]);
        summaryChartArea.add([this.pie_InstanceCount, this.pie_collectionSize]);
        summaryInfoArea.add([summaryGridArea, summaryChartArea]);
        topSummaryArea.add(summaryTitle, summaryInfoArea);

        target.add(topSummaryArea);
    },

    createBottomDetailLayout: function(target) {
        var bottomDetailArea, detailTitle, detailInfoArea;

        bottomDetailArea = Ext.create('Exem.Container',{
            width : '100%',
            height: '100%',
            flex  : 0.5,
            layout: 'vbox'
        });


        detailTitle = Ext.create('Ext.form.Label',{
            height: 20,
            margin: '0 0 0 10',
            cls   : 'header-title',
            text  : common.Util.CTR('Collection Detailed List')
        });


        detailInfoArea = Ext.create('Exem.Container',{
            width : '100%',
            height: '100%',
            flex  : 1,
            layout: 'hbox'
        });


        this.detailGridFrame = Ext.create('Exem.Container',{
            width : '100%',
            height: '100%',
            flex  : 0.55,
            margin: '5 10 10 10'
        });


        this.detailChartArea = Ext.create('Exem.Container',{
            width : '100%',
            height: '100%',
            layout: 'vbox',
            flex  : 0.45,
            margin: '5 10 10 10',
            autoScroll : true
        });

        //detailTitleArea.add([detailTitle, {xtype: 'tbfill'}, this.autoRefreshBox, refreshTimeUnit]);
        detailInfoArea.add([this.detailGridFrame, this.detailChartArea]);
        bottomDetailArea.add([detailTitle, detailInfoArea]);

        target.add(bottomDetailArea);
    },


    createSummaryGrid: function (target) {
        var self = this;

        self.activeCollectionGrid = Ext.create('Exem.BaseGrid', {
            usePager     : false,
            borderVisible: true,
            localeType   : 'H:i:s',
            columnLines  : true,
            baseGridCls  : 'baseGridRTM',
            exportFileName: this.title,
            useEmptyText        : true,
            emptyTextMsg        : common.Util.TR('No data to display')
        });

        self.activeCollectionGrid.addEventListener('select',
            function(me, record) {
                var dataSet = {}, fromTime;

                fromTime = self.getCurrentTime();

                dataSet.sql_file = 'IMXRT_Memory_Leak_Detail.sql';

                dataSet.bind = [{
                    name: 'class_name',
                    value: record.data.class_name,
                    type: SQLBindType.STRING
                },{
                    name: 'from_time',
                    value: fromTime,
                    type: SQLBindType.STRING
                },{
                    name: 'was_id',
                    value : self.wasCombo.getValue(),
                    type : SQLBindType.INTEGER
                }];
                self.collectionDetailGrid.loadingMask.show(null, true);

                WS.SQLExec(dataSet, function(header,adata) {
                    var agent,stackConfirm,
                        ix,ixLen;

                    self.collectionDetailGrid.clearRows();
                    self.detailChartArea.removeAll();
                    self.stopRefreshData();

                    if (!common.Util.checkSQLExecValid(header, adata)) {
                        self.collectionDetailGrid.loadingMask.hide();
                        return;
                    }

                    for (ix = 0, ixLen = adata.rows.length ; ix < ixLen; ix++ ) {
                        agent = Comm.RTComm.getWASNamebyId(adata.rows[ix][1]);
                        stackConfirm = adata.rows[ix][7] ? 'Y' : 'N';

                        self.collectionDetailGrid.addRow([
                            adata.rows[ix][0],
                            agent,
                            adata.rows[ix][2],
                            adata.rows[ix][3],
                            adata.rows[ix][4],
                            adata.rows[ix][5],
                            adata.rows[ix][6],
                            stackConfirm,
                            adata.rows[ix][7],
                            adata.rows[ix][8],
                            adata.rows[ix][1]
                        ]);
                    }

                    self.collectionDetailGrid.drawGrid();
                    self.collectionDetailGrid.loadingMask.hide();

                }, self);
            }
        );


        self.activeCollectionGrid.beginAddColumns();
        //this.activeCollectionGrid.addColumn(common.Util.CTR('Type'),          'type',            90,   Grid.String, true,  false)
        self.activeCollectionGrid.addColumn(common.Util.CTR('Collection Class Name'),      'class_name',      200,  Grid.String, true,  false);
        self.activeCollectionGrid.addColumn(common.Util.CTR('Instance Count'),  'instance_count',  125,  Grid.Number, true,  false);
        self.activeCollectionGrid.addColumn(common.Util.CTR('Element Count'),   'collection_size',    120,  Grid.Number, true,  false);
        self.activeCollectionGrid.endAddColumns();

        self.activeCollectionGrid._columnsList[0].minWidth = 100;
        self.activeCollectionGrid._columnsList[0].flex = 1;

        target.add(self.activeCollectionGrid);
    },


    createDetailGrid : function (target) {
        var self = this;

        self.collectionDetailGrid = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            usePager: false,
            borderVisible: true,
            localeType: 'H:i:s',
            columnLines: true,
            baseGridCls: 'baseGridRTM',
            exportFileName: this.title,
            useEmptyText : true,
            emptyTextMsg : common.Util.TR('No data to display'),
            useCheckbox: {
                use : true,
                mode: Grid.checkMode.SIMPLE,
                headerCheck: false,
                checkOnly: true
            }
        });

        self.collectionDetailGrid.beginAddColumns();
        self.collectionDetailGrid.addColumn(common.Util.CTR('Time'),            'time',           150,  Grid.String, false, true);
        self.collectionDetailGrid.addColumn(common.Util.CTR('Agent'),           'agent',          80,   Grid.String, true,  false);
        self.collectionDetailGrid.addColumn(common.Util.CTR('Instance ID'),     'instanceId',     120,  Grid.String, true,  false);
        self.collectionDetailGrid.addColumn(common.Util.CTR('Element Count'),   'collectionSize',   100,   Grid.Number, true,  false);
        self.collectionDetailGrid.addColumn(common.Util.CTR('Limit Exceed Date'),   'createdTime',     150,  Grid.String, true,  false);
        self.collectionDetailGrid.addColumn(common.Util.CTR('Transaction Name'),'txnName',        200,  Grid.String, true,  false);
        self.collectionDetailGrid.addColumn(common.Util.CTR('TID'),             'tid',            170,  Grid.String, false, false);
        self.collectionDetailGrid.addColumn(common.Util.CTR('Has StackTrace'),  'confirm',        80,   Grid.String, true,  false);
        self.collectionDetailGrid.addColumn(common.Util.CTR('StackTrace'),      'stackTrace',     115,  Grid.String, false, true);
        self.collectionDetailGrid.addColumn(common.Util.CTR('Class Name'),      'className',      115,  Grid.String, false, true);
        self.collectionDetailGrid.addColumn(common.Util.CTR('WAS ID'),          'wasId',          115,  Grid.String, false, true);
        self.collectionDetailGrid.endAddColumns();

        self.collectionDetailGrid.addCls('rtm-basegrid-oncheckbox');

        self.collectionDetailGrid._columnsList[7].align = 'center';


        target.add(this.collectionDetailGrid);


        self.collectionDetailGrid.contextMenu.addItem({
            title : common.Util.TR('StackTrace View'),
            fn: function() {
                var record = this.up().record;

                var traceView = Ext.create('Exem.MemoryLeakStackTraceView');
                traceView.addCls('rtm-memoryleak');
                traceView.data = record;
                traceView.init();
                traceView.data = null;
            }
        }, 0);

        self.collectionDetailGrid.contextMenu.addItem({
            title : common.Util.TR('Transaction Detail'),
            itemId: 'txn_detail',
            fn: function() {
                var data = this.up().record;

                self.checkEndTxn(data.tid, data.wasId, function() {
                    self.openTxnDetailWin(data);
                });

            }
        }, 1);

        self.collectionDetailGrid.addEventListener('select',
            function(me, record) {
                var chartLen,
                    trendChart, chartPanel;

                chartLen = me.getSelection().length;
                if(chartLen > self.chartCount) {
                    me.deselect(me.getSelection()[chartLen-1]);
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('You can select up to %1 item(s).', self.chartCount), Ext.Msg.OK, Ext.MessageBox.WARNING);

                    return;
                }

                if(chartLen == 1) {
                    var detailTitleArea = Ext.create('Exem.Container',{
                        width : '100%',
                        height: 20,
                        layout: 'hbox'
                    });


                    self.autoRefreshBox = Ext.create('Ext.form.field.Checkbox', {
                        boxLabel: common.Util.TR('Auto Refresh'),
                        name    : 'autoRefreshCheckbox',
                        margin  : '0 5 0 10',
                        cls     : 'rtm-checkbox-label',
                        checked : true,
                        listeners: {
                            scope: this,
                            change: function(checkbox, newval) {
                                self.autoRefreshCheck = newval;
                            },
                            afterrender: function() {
                                self.autoRefreshCheck = true;
                            }
                        }
                    });

                    var refreshTimeUnit = Ext.create('Ext.form.Label', {
                        width  : 'auto',
                        margin : '4 10 0 0',
                        text   : '(10' + common.Util.TR('Minute') + ')'
                    });
                    detailTitleArea.add([{xtype: 'tbfill'}, self.autoRefreshBox, refreshTimeUnit]);

                    self.detailChartArea.add(detailTitleArea);
                }


                trendChart = Ext.create('rtm.src.rtmMemoryLeakTrendChart');
                trendChart.parent = self;
                trendChart.parentId = self.id;
                trendChart.record = record.data;
                trendChart.setTitle(record.data.className + ' / ' + record.data.instanceId);

                chartPanel = Ext.create('Exem.Container', {
                    width : '100%',
                    flex : 0.5,
                    instanceId : record.data.instanceId
                });

                chartPanel.add(trendChart);
                self.detailChartArea.add(chartPanel);

                trendChart.loadingMask = Ext.create('Exem.LoadingMask', {
                    target: self.detailChartArea,
                    type  : 'small-circleloading'
                });

                trendChart.init();
                self.refreshTraceData();
            }
        );


        self.collectionDetailGrid.addEventListener('deselect',
            function(me, record) {
                var ix, ixLen;

                for(ix=0, ixLen=self.detailChartArea.items.items.length; ix<ixLen; ix++) {
                    if(self.detailChartArea.items.items[ix].instanceId == record.data.instanceId) {
                        self.detailChartArea.remove(self.detailChartArea.items.items[ix]);
                        break;
                    }
                }

                if(self.detailChartArea.items.items.length == 1) {
                    self.detailChartArea.removeAll();
                    self.autoRefreshCheck = false;
                }
            }
        );


        self.collectionDetailGrid.addEventListener('cellcontextmenu',
            function(me, td, cellIndex, record) {
                if (record.data.confirm === 'Y') {
                    self.collectionDetailGrid.contextMenu.setVisibleItem(0, true);
                } else {
                    self.collectionDetailGrid.contextMenu.setVisibleItem(0, false);
                }

                if (record.data.tid == 0) {
                    self.collectionDetailGrid.contextMenu.setVisibleItem(1, false);
                } else {
                    self.collectionDetailGrid.contextMenu.setVisibleItem(1, true);
                }
            }
        );
    },


    /**
     * 트랜잭션 상세화면 표시
     *
     * @param {object} data - 선택한 레코드 데이터
     */
    openTxnDetailWin: function(data) {
        var startTime  = common.Util.getDate(+new Date(data.createdTime) - (1000 * 60 * 10));
        var endTime    = common.Util.getDate(+new Date(data.createdTime) + (1000 * 60 * 10));

        if (this.isEndTxnData) {
            var currentWidth  = 1500;
            var currentHeight = 1000;

            var elapseDistRange = {
                fromTime  : startTime,
                toTime    : endTime,
                minElapse : 0,
                maxElapse : this.endTxnElapse,
                clientIp  : '',
                txnName   : data.txnName,
                exception : '',
                loginName : '',
                wasId     : data.wasId + '',
                tid       : data.tid,
                serverType: this.monitorType
            };

            localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(elapseDistRange));

            var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;
            realtime.txnPopupMonitorWindow = window.open('../txnDetail/txnDetail.html', 'hide_referrer_1', popupOptions);

        } else {
            var txnDetail = Ext.create('rtm.src.rtmActiveTxnDetail');
            txnDetail.stack_dump   = false;
            txnDetail.tid          = data.tid;
            txnDetail.wasid        = data.wasId;
            txnDetail.starttime    = startTime;
            txnDetail.current_time = data.time;

            var record = {
                tid       : data.tid,
                wasid     : data.wasId,
                txnname   : data.txnName,
                starttime : startTime,
                time      : endTime
            };

            txnDetail.initWindow();
            setTimeout(function() {
                txnDetail.init(record);

                txnDetail = null;
                record    = null;
            }, 10);
        }
    },


    /**
     * Check end transaction.
     *
     * @param {string | number} tid
     * @param {string | number} serverId
     */
    checkEndTxn: function(tid, serverId, callback) {
        this.isEndTxnData = false;
        this.endTxnElapse = null;

        if (!tid || !serverId) {
            console.debug('%c [Memory Leak] [WARNING] ',
                'color:#800000;background-color:gold;font-weight:bold;', 'TID, WAS ID Parameter is undefined.');
            return;
        }

        WS.SQLExec({
            sql_file: 'IMXRT_Memory_Leak_EndTxn.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: tid
            }, {
                name: 'wasId',
                type: SQLBindType.INTEGER,
                value: serverId
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm === true) {
                return;

            } else if (aheader && aheader.success === false && !adata) {
                console.debug('%c [Memory Leak] [ERROR] Failed to retrieve the End Txn Data.', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                return;
            }

            if (adata.rows && adata.rows.length > 0 && adata.rows[0][0]) {
                this.isEndTxnData = true;
                this.endTxnElapse = adata.rows[0][0];
            }

            if (callback) {
                callback();
            }

        }, this);
    },

    /**
     * 액티브 컬렉션
     */
    executeSQL: function() {
        var dataSet = {}, fromTime;

        fromTime = this.getCurrentTime();

        dataSet.bind = [{
            name : 'was_id',
            value: this.wasCombo.getValue(),
            type : SQLBindType.INTEGER
        },{
            name : 'from_time',
            value: fromTime,
            type : SQLBindType.STRING
        }];

        dataSet.sql_file = 'IMXRT_Memory_Leak.sql';

        WS.SQLExec(dataSet, this.drawData, this);
    },

    getCurrentTime: function() {
        var lastTime;

        lastTime = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(lastTime) !== true) {
            console.debug('%c [Memory Leak List] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            lastTime = new Date(this.beforeLastestTime);

        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        return Ext.Date.format(Ext.Date.subtract(lastTime, Ext.Date.MINUTE, 10), 'Y-m-d H:i:s.u');
    },

    /**
     * 액티브 컬렉션 데이터
     */
    drawData: function(header, adata) {
        if (this.isClosedDockForm) {
            return;
        }

        this.activeCollectionGrid.loadingMask.show(null, true);

        this.activeCollectionGrid.clearRows();
        this.activeCollectionGrid.showEmptyText();

        this.collectionDetailGrid.clearRows();
        this.collectionDetailGrid.showEmptyText();


        this.pie_InstanceCount.clearValues();
        this.pie_InstanceCount.removeAllSeries();

        this.pie_collectionSize.clearValues();
        this.pie_collectionSize.removeAllSeries();

        if (!common.Util.checkSQLExecValid(header, adata)) {
            this.activeCollectionGrid.loadingMask.hide();
            return;
        }

        var className;
        var instanceCount = 0, collectionSize = 0;

        var theme = Comm.RTComm.getCurrentTheme();
        var strokeColor;

        switch (theme) {
            case 'Black' :
                strokeColor = '#000';
                break;
            case 'White' :
                strokeColor = '#FFF';
                break;
            default :
                strokeColor = '#414755';
                break;
        }


        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++ ) {
            className     = adata.rows[ix][0];
            instanceCount = adata.rows[ix][1];
            collectionSize   = adata.rows[ix][2];

            this.activeCollectionGrid.addRow([
                className,
                instanceCount,
                collectionSize
            ]);

            this.pie_InstanceCount.addSeries({
                label       : className,
                id          : ix,
                type        : PlotChart.type.exPie,
                tilt        : 1,
                pieLable    : true,
                pieCombine  : true,
                options     : {
                    isDisableGradient: true,
                    stroke      : {
                        color: strokeColor,
                        width: 0.5
                    }
                }
            });

            this.pie_collectionSize.addSeries({
                label       : className,
                id          : ix,
                type        : PlotChart.type.exPie,
                tilt        : 1,
                pieLable    : true,
                pieCombine  : true,
                options     : {
                    isDisableGradient: true,
                    stroke      : {
                        color: strokeColor,
                        width: 0.5
                    }
                }
            });

            this.pie_InstanceCount.setLegendValue(ix, instanceCount);
            this.pie_collectionSize.setLegendValue(ix, collectionSize);
            this.pie_InstanceCount.setData(ix, instanceCount);
            this.pie_collectionSize.setData(ix, collectionSize);
        }

        this.activeCollectionGrid.drawGrid();

        // 조회된 데이터가 없거나 최근 데이터가 없는 경우 빈 Pie 차트를 그려서 보여주도록 처리
        if (adata.rows.length <= 0) {
            this.pie_InstanceCount.addSeries({
                label       : '',
                id          : ix,
                type        : PlotChart.type.exPie,
                tilt        : 1,
                pieLable    : true,
                pieCombine  : true,
                options     : {
                    isDisableGradient: true,
                    stroke      : {
                        color: strokeColor,
                        width: 0.5
                    }
                }
            });

            this.pie_collectionSize.addSeries({
                label       : '',
                id          : ix,
                type        : PlotChart.type.exPie,
                tilt        : 1,
                pieLable    : true,
                pieCombine  : true,
                options     : {
                    isDisableGradient: true,
                    stroke      : {
                        color: strokeColor,
                        width: 0.5
                    }
                }
            });
            this.pie_InstanceCount.setLegendValue(ix, instanceCount);
            this.pie_collectionSize.setLegendValue(ix, collectionSize);
            this.pie_InstanceCount.setData(ix, instanceCount);
            this.pie_collectionSize.setData(ix, collectionSize);
        }

        this.pie_InstanceCount.plotDraw();
        this.pie_collectionSize.plotDraw();
        this.activeCollectionGrid.loadingMask.hide();


        if(adata.rows.length) {
            this.activeCollectionGrid.pnlExGrid.getView().getSelectionModel().select(0);
        }
    },


    executeTrendChartRefresh: function() {
        var chartPanels, chartItem,
            ix, ixLen;
        var self = this;

        chartPanels = self.detailChartArea.items.items;

        for(ix=1, ixLen=chartPanels.length; ix<ixLen; ix++) {
            chartItem = chartPanels[ix].items.items[0];

            chartItem.loadingMask.show(null, true);
            chartItem.executeTrendChartSQL(chartItem.record);

        }
    },
    /**
     * 화면에 보여주는 데이터가 있는지 체크
     *
     * @param {string} lastTime
     * @param {string} currentTime
     * @return {boolean}
     */


    stopRefreshData: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },

    refreshTraceData: function() {
        this.stopRefreshData();


        if (Comm.rtmShow && this.autoRefreshCheck) {
            this.executeTrendChartRefresh();
        }

        this.refreshTimer = setTimeout(this.refreshTraceData.bind(this), 1000 * 10 * 60);
    },


    frameRefresh: function() {
        this.refreshTraceData();
    },


    frameStopDraw: function() {
        this.stopRefreshData();
    }

});
