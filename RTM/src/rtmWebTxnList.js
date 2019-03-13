Ext.define('rtm.src.rtmWebTxnList', {
    extend: 'Exem.XMWindow',
    layout: 'fit',
    maximizable: true,
    width    : 900,
    height   : 350,
    minWidth : 300,
    minHeight: 200,
    resizable: true,
    closeAction: 'destroy',
    cls      : 'xm-dock-window-base',

    listeners: {
        beforedestroy: function(me) {
            this.isWinClosed = true;

            me.grid.removeAll();
        }
    },

    sql: 'IMXRT_Web_Txn_List.sql',

    initProperty: function() {
        this.monitorType  = 'WEB';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        var serverNameList = this.filters.idList.split(',');

        this.serverIdList = serverNameList.map(function (name) {
            return Comm.RTComm.getServerIdByName(name, 'WEB');
        });

        this.isWinClosed = false;
    },


    initWindow: function() {
        this.show();
        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });
        this.loadingMask.show(true);
    },


    init: function() {

        this.initProperty();

        this.initLayout();

        this.executeSQL();
    },


    /**
     * 기본 레이아웃 구성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'fit',
            border: 1,
            cls   : 'dockform'
        });

        this.centerArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 5 5 5'
        });

        this.setTitle(common.Util.TR('Transaction List'));

        this.createGrid();

        this.addContextMenu();

        this.background.add(this.centerArea);
        this.add(this.background);

        this.loadingMask.hide();
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
            exportFileName: this.title
        });

        this.grid.beginAddColumns();

        this.grid.addColumn(common.Util.TR('Time'),               'time'          , 100,  Grid.DateTime      , true,  false);
        this.grid.addColumn(common.Util.TR('Agent'),              'agent'         , 100,  Grid.String        , true,  false);
        this.grid.addColumn(common.Util.TR('Transaction Name'),   'txn_name'           , 170,  Grid.String        , true,  false);
        this.grid.addColumn(common.Util.TR('Status/Type'),        'statustype'    , 100,  Grid.String        , true,  false);
        this.grid.addColumn(common.Util.TR('Start Time'),         'starttime'     , 110,  Grid.DateTime      , false, true);
        this.grid.addColumn(common.Util.TR('Elapse Time (sec)'),  'elapsed'       ,  90,  Grid.Float         , true,  false);
        this.grid.addColumn(common.Util.TR('User IP'),            'userip'        , 120,  Grid.String        , true,  false);
        this.grid.addColumn(common.Util.TR('TID'),                'tid'           , 150,  Grid.StringNumber  , true,  false);
        this.grid.addColumn(common.Util.TR('ServerID'),           'serverid'      ,  80,  Grid.Number        , false, true );
        this.grid.addColumn(common.Util.TR('STATUS'),             'status'        ,  80,  Grid.Number        , false, true );

        this.grid.addRenderer('statustype', this.exceptionRenderer.bind(this) , RendererType.bar) ;
        this.grid.setOrderAct('elapsed', 'desc');

        this.grid.endAddColumns();

        this.centerArea.add(this.grid);

        this.grid.drawGrid();

    },


    /**
     * 목록에 컨텍스트 메뉴 추가
     */
    addContextMenu: function() {

        this.grid.contextMenu.addItem({
            title : 'WAS ' + common.Util.TR('Transaction Trend'),
            itemId: 'transaction_trend',
            fn: function() {
                var r = this.up().record;

                if (r.tid <= 0) {
                    return;
                }

                var fromTime  = common.Util.getDate(+new Date(r.time) - 300000);
                var toTime    = common.Util.getDate(+new Date(r.time) + 300000);

                // Transaction Trend Data
                console.debug('%c [Web Txn List] Execute Transaction Trend - TID / From Time / To Time: ', 'color:#3191C8;', r.tid + ' / ' + fromTime + ' / ' + toTime);

                var paView = Ext.create('view.ResponseInspector', {
                    title    : common.Util.TR('Transaction Trend'),
                    closable : true,
                    isAllWasRetrieve: false,
                    detailScatterYRange: 'fixed',
                    autoRetrieveRange: {
                        timeRange: [
                            fromTime,
                            toTime
                        ],
                        elapseRange: [0],
                        wasName    : 'All',
                        tid: r.tid
                    }
                });

                var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.setActiveTab(0);
                mainTab.add(paView);
                mainTab.setActiveTab(mainTab.items.length - 1);

                var loadingMask = Ext.create('Exem.LoadingMask', {
                    target: paView,
                    type  : 'large-whirlpool'
                });
                loadingMask.showMask();

                setTimeout(function() {
                    loadingMask.hide();
                    paView.loadingMask.hide() ;
                    paView.init();

                    loadingMask = null;
                    paView  = null ;
                    mainTab = null ;
                }, 10);

            }
        }, 0);

        this.grid.pnlExGrid.addListener('beforecellcontextmenu', function(thisGrid, td, cellIndex, record) {
            var tid  = record.data.tid;

            if (tid > 0) {
                this.grid.contextMenu.setDisableItem('transaction_trend', true);
            } else {
                this.grid.contextMenu.setDisableItem('transaction_trend', false);
            }
        }, this);

    },


    /**
     * 쿼리 실행
     */
    executeSQL: function() {

        // 실행 명령어에 따라 실행되는 쿼리 설정.
        var sqlFile = this.sql;

        // 조회 조건
        var fromtime  = Ext.Date.format(new Date(this.filters.fromTime), 'Y-m-d H:i:s.u');
        var totime    = Ext.Date.format(new Date(this.filters.toTime),   'Y-m-d H:i:s.u');
        var minElapse = '';
        var maxElapse = '';
        var idArr     = this.serverIdList.join(',');
        var exception = '';

        if (this.filters.minElapse) {
            minElapse = 'AND s.elapse_time >= ' + this.filters.minElapse;
        }
        if (this.filters.maxElapse) {
            maxElapse = 'AND s.elapse_time <= ' + this.filters.maxElapse;
        }

        if (this.filters.isException) {
            exception = 'AND s.http_status >= 400';
        }

        WS.SQLExec({
            sql_file: sqlFile,
            bind: [{ name: 'fromTime',  value: fromtime,  type: SQLBindType.STRING  },
                   { name: 'toTime',    value: totime,    type: SQLBindType.STRING  }
            ],
            replace_string: [{
                name  : 'wsId',
                value :  idArr
            }, { name : 'minElapse',
                value : minElapse
            }, { name : 'maxElapse',
                value : maxElapse
            }, { name : 'exception',
                value : exception
            }]
        }, function(aheader, adata) {
            if (this.isWinClosed) {
                return;
            }

            var isValid = common.Util.checkSQLExecValid(aheader, adata);

            if (isValid) {
                this.drawData(adata);
            }

        }, this);
    },


    /**
     * 트랜잭션 리스트 그리기
     *
     * @param {object} adata - 조회 데이터
     */
    drawData: function(adata) {
        var data;
        var statusType,
            clientIp;

        this.grid.clearRows();

        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            data = adata.rows[ix];

            statusType = data[4] + ' / ' + data[5];
            clientIp = common.Util.hexIpToDecStr(data[8]);

            this.grid.addRow([
                data[0],       // TIME
                data[2],       // AGENT
                data[3],       // TXN_NAME
                statusType,    // Status/Type
                data[6],       // Start Time
                data[7],       // Elapsed Time
                clientIp,      // User IP
                data[9],       // TID
                data[1],       // SERVER ID
                data[4]        // STATUS
            ]);
        }

        this.grid.drawGrid();

        adata = null;
        data  = null;
    },

    /**
     * 400 이상 오류건에 대한 Renderer
     *
     * @param record - 그리드 row 데이터
     */
    exceptionRenderer: function(value, meta, record, r, c, store, view) {
        var customCellDOM;

        if (record.data.status >= 400 && meta.column.dataIndex == 'statustype' ){
            setTimeout(function () {
                var row = view.getNode(record);
                if (row) {
                    var el = Ext.get(row).dom.getElementsByClassName('x-grid-cell')[c] ;
                    el.classList.add('exception-cell');
                }
            }.bind(this), 5);
        }

        customCellDOM = '<div data-qtip="' + value + '">'+ value +'</div>';

        return customCellDOM;
    }

});
