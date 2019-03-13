Ext.define('rtm.src.rtmMemoryLeakList', {
    extend : 'Exem.DockForm',
    title  : common.Util.CTR('Realtime Memory Leak Trace'),
    layout: 'fit',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function(me) {
            me.isClosedDockForm = true;

            me.stopRefreshData();

            me.grid.removeAll();
        }
    },


    initProperty: function() {
        this.monitorType = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.autoRefreshCheck = true;

    },


    init: function() {

        this.initProperty();

        this.initLayout();

        this.frameRefresh();
    },


    /**
     * 기본 레이아웃 구성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-topsql-base'
        });

        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 0 0 0'
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '2 10 0 0',
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
            cls    : 'header-title',
            text   : common.Util.CTR('Realtime Memory Leak Trace')
        });

        this.centerArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 10 10 10'
        });

        this.autoRefreshBox = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Refresh'),
            name    : 'autoRefreshCheckbox',
            margin  : '0 5 0 10',
            cls     : 'rtm-checkbox-label',
            checked : true,
            listeners: {
                scope: this,
                change: function(checkbox, newval) {
                    this.autoRefreshCheck = newval;
                }
            }
        });

        var refreshTimeUnit = Ext.create('Ext.form.Label', {
            width  : 'auto',
            margin : '4 20 0 0',
            text   : '(10' + common.Util.TR('Minute') + ')'
        });

        this.topContentsArea.add([
            this.frameTitle, {xtype: 'tbfill'},
            this.autoRefreshBox,
            refreshTimeUnit,
            this.expendIcon
        ]);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.createGrid();

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },


    /**
     * 그리드 생성
     */
    createGrid: function() {

        this.grid = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            celldblclick: function(me, td, cellIndex, record) {
                this.openMemLeakDetailWin(record.data);
            }.bind(this)
        });

        this.grid.beginAddColumns();
        this.grid.addColumn(common.Util.CTR('Time'            ),    'time',            100,   Grid.DateTime, false, true);
        this.grid.addColumn(common.Util.CTR('Agent'           ),    'agent',           110,   Grid.String  , true,  false);
        this.grid.addColumn(common.Util.CTR('WAS ID'          ),    'wasId',           110,   Grid.String  , false, true);
        this.grid.addColumn(common.Util.CTR('Class Name'      ),    'className',       110,   Grid.String  , true,  false);
        this.grid.addColumn(common.Util.CTR('Instance ID'     ),    'instanceId',      110,   Grid.String  , true,  false);
        this.grid.addColumn(common.Util.CTR('Element Count'   ),    'collectionSize',  110,   Grid.Number  , true,  false);
        this.grid.addColumn(common.Util.CTR('Limit Exceed Date'),    'createdTime',     110,   Grid.DateTime, true,  false);
        this.grid.addColumn(common.Util.CTR('Transaction'     ),    'trancation',      185,   Grid.String  , true,  false);
        this.grid.addColumn(common.Util.CTR('TID'             ),    'tid',             185,   Grid.String  , false, false);
        this.grid.addColumn(common.Util.CTR('Has StackTrace'  ),    'confirm',         80,    Grid.String  , true,  false);
        this.grid.addColumn(common.Util.CTR('StackTrace'      ),    'stackTrace',      100,   Grid.String  , false, true);
        this.grid.endAddColumns();

        this.grid._columnsList[3].flex = 1;
        this.grid._columnsList[3].minWidth = 100;
        this.grid._columnsList[7].flex = 1;
        this.grid._columnsList[7].minWidth = 100;
        this.grid._columnsList[9].align = 'center';

        this.addContextMenu();

        this.centerArea.add(this.grid);
        this.grid.setOrderAct('collectionSize', 'desc');
        this.grid.drawGrid();
    },


    /**
     * 컨텍스트 메뉴 추가
     */
    addContextMenu: function() {

        // 스택 트레이스 상세 화면을 팝업 표시
        this.grid.contextMenu.addItem({
            title : common.Util.TR('StackTrace View'),
            fn: function(me) {
                var record = me.up().record;

                // 스택 트레이스 상세 화면을 표시
                var traceView = Ext.create('Exem.MemoryLeakStackTraceView');
                traceView.addCls('rtm-memoryleak');
                traceView.data = record;
                traceView.init();
                traceView.data = null;

            }.bind(this)
        }, 0);

        // Memory Leak 실시간 분석 화면을 팝업 표시
        this.grid.contextMenu.addItem({
            title : common.Util.TR('Memory Leak Trace'),
            fn: function(me) {
                var record = me.up().record;
                this.openMemLeakDetailWin(record);
            }.bind(this)
        }, 1);

        // 엘리먼트 개수 추이 차트 화면을 팝업 표시
        this.grid.contextMenu.addItem({
            title : common.Util.TR('Element Count Trend Chart'),
            fn: function(me) {
                var record = me.up().record;
                this.openCollectionSizeTrendWin(record);
            }.bind(this)
        }, 2);

        // 액티브 트랜잭션 상세화면을 팝업 표시
        this.grid.contextMenu.addItem({
            title : common.Util.TR('Transaction Detail'),
            fn: function(me) {
                var record = me.up().record;

                this.checkEndTxn(record.tid, record.wasId, function() {
                    this.openTxnDetailWin(record);
                }.bind(this) );
            }.bind(this)
        }, 3);

        // 스택 트레이스 정보가 없는 경우 메뉴 숨김
        this.grid.addEventListener('cellcontextmenu',
            function(grid, td, cellIndex, record) {
                if (record.data.confirm === 'Y') {
                    this.grid.contextMenu.setVisibleItem(0, true);
                } else {
                    this.grid.contextMenu.setVisibleItem(0, false);
                }

                if (record.data.tid == 0) {
                    this.grid.contextMenu.setVisibleItem(3, false);
                } else {
                    this.grid.contextMenu.setVisibleItem(3, true);
                }
            }.bind(this)
        );
    },


    /**
     * 액티브 트랜잭션 상세화면 표시
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
                txnName   : data.trancation,
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
                txnname   : data.trancation,
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
     * Memory Leak 상세 화면을 표시
     *
     * @param {object} record - 선택한 레코드 데이터
     */
    openMemLeakDetailWin: function(record) {
        this.detailWindow = Ext.create('Exem.XMWindow', {
            layout   : 'vbox',
            maximizable: true,
            width    : 1000,
            height   : 650,
            minWidth : 1000,
            minHeight: 650,
            resizable: true,
            closeAction: 'destroy',
            title    : common.Util.TR('Memory Leak Trace Realtime Analysis'),
            cls      : 'xm-dock-window-base rtm-activetxn-detail'
        });
        this.detailWindow.show();

        var loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.detailWindow
        });
        loadingMask.show(true);

        var traceDetail = Ext.create('rtm.src.rtmMemoryLeak');
        this.detailWindow.add(traceDetail);

        traceDetail.tid       = record.tid;
        traceDetail.wasid     = record.wasId;
        traceDetail.className = record.classNamd;

        setTimeout(function() {
            traceDetail.init(record.data);
            loadingMask.hide();

            traceDetail = null;
            loadingMask = null;
        }, 10);
    },


    /**
     * 엘리먼트 개수 추이 차트 화면 표시
     *
     * @param {object} record - 선택한 레코드 데이터
     */
    openCollectionSizeTrendWin: function(record) {
        var trendChartWindow = Ext.create('Exem.XMWindow', {
            layout   : 'fit',
            maximizable: true,
            width    : 500,
            height   : 200,
            minWidth : 300,
            minHeight: 150,
            resizable: true,
            modal    : false,
            closeAction: 'destroy',
            title    : common.Util.TR('Element Count Trend Chart'),
            cls      : 'xm-dock-window-base'
        });

        trendChartWindow.show();

        var chartPanel = Ext.create('Ext.container.Container', {
            layout : 'fit',
            cls    : 'dockform'
        });

        var trendChart = Ext.create('rtm.src.rtmMemoryLeakTrendChart');
        trendChart.parent    = this;
        trendChart.parentId  = this.id;
        trendChart.setTitle(record.className + ' / ' + record.instanceId);

        chartPanel.add(trendChart);
        trendChartWindow.add(chartPanel);

        trendChart.loadingMask = Ext.create('Exem.LoadingMask', {
            target: trendChartWindow
        });
        trendChart.loadingMask.show(null, true);

        trendChart.init();
        trendChart.executeTrendChartSQL(record);

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
            console.debug('%c [Memory Leak List] [WARNING] ',
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
                console.debug('%c [Memory Leak List] [ERROR] Failed to retrieve the End Txn Data.', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                return;
            }

            if (adata.rows && adata.rows.length > 0 && adata.rows[0][0]) {
                this.isEndTxnData = true;
                this.endTxnElapse = adata.rows[0][0];
                console.debug(this.isEndTxnData, this.endTxnElapse, adata.rows[0][0]);
            }

            if (callback) {
                callback();
            }

        }, this);
    },


    /**
     * 데이터 새로고침을 중지.
     */
    stopRefreshData: function(){
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },


    /**
     * 메모리 릭 목록을 일정 주기로 새로 고침
     * 데이터 새로 고침 간격 (10분)
     */
    frameRefresh: function() {
        this.stopRefreshData();

        if ((Comm.rtmShow || this.floatingLayer) && this.autoRefreshCheck) {
            this.executeSQL();
        }
        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 1000 * 60 * 10);
    },

    /**
     * Memory Leak 목록 데이터를 조회하는 쿼리 실행
     */
    executeSQL: function() {

        var lastTime = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(lastTime) !== true) {
            console.debug('%c [Memory Leak List] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            lastTime = new Date(this.beforeLastestTime);

        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        // 조회 범위 설정 - 최근 시간에서 10분 전 데이터 조회
        var fromtime = Ext.Date.format(Ext.Date.subtract(lastTime, Ext.Date.MINUTE, 10), 'Y-m-d H:i:s.u');

        var selectIdArr;

        if (Comm.selectedWasArr.length > 0 && Comm.wasIdArr.length !== Comm.selectedWasArr.length) {
            selectIdArr = Comm.selectedWasArr.join(',');
        } else {
            selectIdArr = Comm.wasIdArr.join(',');
        }

        WS.SQLExec({
            sql_file: 'IMXRT_Memory_Leak_List.sql',
            bind: [{
                name: 'from_time', value: fromtime, type: SQLBindType.STRING
            }],
            replace_string: [{
                name : 'was_id',
                value:  selectIdArr
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm) {
                return;
            }

            var isValid = common.Util.checkSQLExecValid(aheader, adata);

            if (isValid) {
                this.drawData(adata);
            }

        }, this);
    },


    /**
     * Memory Leak 목록 데이터 그리기
     *
     * @param {object} adata - 조회 데이터
     */
    drawData: function(adata) {
        this.grid.clearRows();

        var data;
        var agent, stackConfirm;

        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            data = adata.rows[ix];

            agent = Comm.RTComm.getWASNamebyId(data[1]);

            if (data[8]) {
                stackConfirm = 'Y';
            } else {
                stackConfirm = 'N';
            }

            this.grid.addRow([
                data[0],         // time
                agent,           // agent
                data[1],         // was id
                data[2],         // class Name
                data[3],         // Instance Id
                data[4],         // Object Count
                data[5],         // created time
                data[6],         // transaction
                data[7],         // tid
                stackConfirm,    // has stacktrace
                data[8]          // stacktrace
            ]);
        }

        this.grid.drawGrid();

        adata = null;
    }

});
