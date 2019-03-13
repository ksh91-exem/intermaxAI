Ext.define('Exem.txnDetailBaseForm', {
    extend: 'Exem.Container',
    layout: 'fit',
    height: '100%',
    width: '100%',

    constructor: function() {
        this.callParent(arguments);
    },

    init: function() {

        this.monitorType = !this.monitorType ? window.rtmMonitorType : this.monitorType;
        window.realtime = opener.realtime;

        this.createBaseLayout();
        this.createTopGridLayout();
        this.createBotDetailLayout();

        this.executeSQL();

        this.addWindowEvents();
    },

    createBaseLayout: function() {

        this.background = Ext.create('Exem.Container', {
            layout: 'vbox',
            width: '100%',
            height: '100%',
            minWidth: 700,
            minHeight: 400,
            padding: '8 8 8 8',
            cls: 'rtm-txn-grid-n-detail'
        });

        this.add(this.background);

        window.addEventListener('resize', function() {
            this.background.setSize(window.innerWidth, window.innerHeight);
        }.bind(this));
    },

    createTopGridLayout: function() {
        var self = this;

        this.txnDetailGrid = Ext.create('Exem.BaseGrid', {
            height              : 200,
            itemId              : 'txnDetailGrid',
            usePager            : true,
            defaultPageSize     : 100,
            split               : true,
            defaultbufferSize   : 0,
            baseGridCls         : 'baseGridRTM',
            contextBaseCls      : 'rtm-context-base',
            localeType          : 'd H:i:s.u',
            exportFileName      : common.Util.TR('Transaction Detail List'),
            columnmove: function() {
                this.saveLayout(this.name);
            },
            itemclick: function(_this, record) {
                self.createTxnDetail(record.data);
            }
        });

        this.fromRowIndex = 0;
        this.loadDataRow = 10000;
        this.maxLoadCount = Comm.excelExportLimitRow || 50000;
        this.limitData = 0;
        this.limitFrom = 0;

        if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
            this.defaultLimitData = this.loadDataRow;
        } else {
            this.defaultLimitData = 'LIMIT ' + this.loadDataRow;
        }

        this.isAddGridData = false;
        this.limitData = this.defaultLimitData;

        this.txnDetailGrid.pnlExGridPager.add({
            xtype: 'button',
            cls  : 'rtm-button',
            itemId: 'grid_detail_list_more_btn',
            text: common.Util.TR('More Load'),
            margin: '0 0 0 10',
            border: true,
            handler: function() {
                self.fromRowIndex += self.loadDataRow;
                self.isAddGridData = true;

                if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
                    self.limitData = self.defaultLimitData +  self.fromRowIndex;
                    self.limitFrom = self.fromRowIndex;
                } else {
                    self.limitData = self.defaultLimitData + ' OFFSET ' + self.fromRowIndex;
                }
                self.executeSQL();
            }
        },{
            xtype: 'button',
            cls  : 'rtm-button',
            itemId: 'grid_detail_list_fetch_all',
            text: common.Util.TR('Fetch All'),
            margin: '0 0 0 10',
            border: true,
            handler: function() {
                this.setVisible(false);
                self.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(false);
                self.isAddGridData = false;

                if (Comm.currentRepositoryInfo.database_type !== 'PostgreSQL') {
                    self.limitData = self.maxLoadCount;
                    self.limitFrom = 0;
                } else {
                    self.limitData = 'LIMIT ' + self.maxLoadCount;
                }
                self.executeSQL();
            }
        });

        this.addColumnTxnGrid();
        this.background.add(this.txnDetailGrid);
    },

    createBotDetailLayout: function() {

        this.txnDetailInfoLayer = Ext.create('Ext.container.Container', {
            region: 'center',
            layout: 'fit',
            width: '100%',
            flex: 1.6,
            margin: '5 0 0 0'
        });

        this.background.add(this.txnDetailInfoLayer);
    },

    createTxnDetail: function(record) {
        var txnDetailView;
        var elpase;

        if(this.monitorType === 'CD') {
            elpase = record.txn_elapse_us;
        } else if (this.monitorType === 'E2E') {
            elpase = record.elapse_time;
        } else {
            elpase = record.txn_elapse;
        }

        this.txnDetailInfoLayer.removeAll();

        txnDetailView = Ext.create('view.TransactionDetailView',{
            themeType: Comm.RTComm.getCurrentTheme(),
            autoScroll: true,
            endTime: record.time,
            wasId: record.was_id,
            name: record.was_name,
            txnName: record.txn_name,
            tid: record.tid,
            startTime: record.start_time,
            elapseTime : elpase,
            gid: record.gid,
            monitorType : this.monitorType,
            socket: WS,
            isCenterSizeMin: true,
            isRTM : true
        });

        this.txnDetailInfoLayer.add(txnDetailView);
        txnDetailView.init();
    },

    onGridData: function(header, data){
        var gridComponent;

        if (!data || !this.txnDetailGrid) {
            return;
        }

        if(!common || !common.Util.checkSQLExecValid(header, data)){
            this.txnDetailGrid.loadingMask.hide();

            console.debug('txnDetail-onGridData');
            console.debug(header);
            console.debug(data);
            return;
        }

        if (!this.isAddGridData) {
            this.txnDetailGrid.clearRows();
        }

        this.addRowTxnGridData(data.rows);

        if (data.rows.length < this.loadDataRow) {
            this.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(false);
            this.txnDetailGrid.down('#grid_detail_list_fetch_all').setVisible(false);
        } else {
            this.txnDetailGrid.down('#grid_detail_list_more_btn').setVisible(true);
            this.txnDetailGrid.down('#grid_detail_list_fetch_all').setVisible(true);
        }

        this.txnDetailGrid.drawGrid();
        this.txnDetailGrid.loadingMask.hide();

        if(data.rows.length > 0){
            gridComponent = this.txnDetailGrid.pnlExGrid;

            gridComponent.getView().getSelectionModel().select(0);
            gridComponent.fireEvent('itemclick', gridComponent, gridComponent.getSelectionModel().getLastSelected());
        }
    },


    addWindowEvents: function() {
        window.onbeforeunload = function() {
            window.msgMap = null;
            window.Comm   = null;
            window.common = null;

            opener.window.removeEventListener('beforeunload', unloadHandler);
        };

        var unloadHandler = function() {
            if (window) {
                window.msgMap = null;
            }
            window.Comm = null;
            window.common = null;

            if (window) {
                window.close();
            }
        };

        opener.window.addEventListener('beforeunload', unloadHandler);
    },

    exceptionTypeProc: function(exceptionCnt, exceptionType) {
        var retExceptionText;

        if (exceptionCnt > 0 && exceptionType == '') {
            retExceptionText = 'UnCaught Exception';
        } else {
            retExceptionText = exceptionType;
        }
        return retExceptionText;
    },

    exceptionRenderer: function(value, meta, record, r, c, store, view) {
        if (record.data.EXCEPTION > 0 ){
            setTimeout(function () {
                var row = view.getNode(record);
                if (row) {
                    var el = Ext.get(row).dom.getElementsByClassName('x-grid-cell')[c] ;
                    el.classList.add('exception-cell');
                }
            }.bind(this), 5);
        }
        return value ;
    }
});
