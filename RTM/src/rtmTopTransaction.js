Ext.define('rtm.src.rtmTopTransaction', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Realtime TOP Transaction'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    isRefreshTop: false,
    isClosedDockForm: false,

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            this.removeTooltip();

            $(this.el.dom).off('mouseover', '.'+this.cellEventCls);
            $(this.el.dom).off('mouseout', '.'+this.cellEventCls);
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.txnHistoryClass = 'TxnHistory';
    },

    init: function() {
        this.initProperty();

        this.initLayout();

        this.addContextMenu(this.toptxnGrid);

        this.drawTopTxnData();

        this.frameRefresh();
    },


    /**
     * 기본 레이어 구성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-toptransaction-base'
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
                render: function(me) {
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
            text   : this.title
        });

        this.gridFrame = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 10 10 10'
        });

        this.limitCombo = Ext.create('Ext.form.field.Number',{
            cls            : 'rtm-list-condition',
            margin         : '0 10 0 0',
            width          : 40,
            allowBlank     : false,
            maxLength      : 2,
            maxValue       : 20,
            minValue       : 1,
            enableKeyEvents: false,
            value          : 10,
            oldValue       : 10,
            listeners: {
                scope: this,
                blur: function(me) {
                    if (me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value > 20) {
                            me.setValue(20);
                        }
                        me.oldValue = me.value;

                        this.drawTopTxnData();
                    }
                },
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
                        var check = /^([0-9]|[1-9][0-9]+)$/;

                        if (!check.test(me.value)) {
                            me.setValue(me.oldValue);
                            return false;
                        }
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value > 20) {
                            me.setValue(20);
                        }
                        me.oldValue = me.value;

                        this.drawTopTxnData();
                    }
                }
            }
        });

        this.topContentsArea.add([this.frameTitle, {xtype: 'tbfill'}, this.limitCombo, this.expendIcon]);

        this.background.add([this.topContentsArea, this.gridFrame]);

        this.add(this.background);

        this.createGrid(this.gridFrame);

        this.createTooltip();

        if (this.floatingLayer === true) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },


    /**
     * Grid 생성
     */
    createGrid: function (target) {
        var self = this;

        this.toptxnGrid = Ext.create('Exem.BaseGrid', {
            layout       : 'fit',
            usePager     : false,
            autoScroll   : false,
            borderVisible: true,
            localeType   : 'H:i:s',
            baseGridCls  : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            style: {
                'overflow-x': 'hidden'
            }
        });

        this.toptxnGrid.beginAddColumns();
        this.toptxnGrid.addColumn('TxnID',                                   'txnid',   100, Grid.String, false, false); // Hidden Column
        this.toptxnGrid.addColumn(common.Util.CTR('Transaction'),            'txn',     250, Grid.String, true,  false);
        this.toptxnGrid.addColumn(common.Util.CTR('Elapse Avg (sec)'),       'avg',     73,  Grid.Float,  true,  false);
        this.toptxnGrid.addColumn(common.Util.CTR('Elapse Time Ratio (%)'),  'ratio',   85,  Grid.Float,  true,  false);
        this.toptxnGrid.addColumn(common.Util.CTR('DB Time'),                'dbtime',  73,  Grid.Float,  false, false);
        this.toptxnGrid.addColumn(common.Util.CTR('Exec (count)'),           'cnt',     75,  Grid.Number, true,  false);
        this.toptxnGrid.addColumn('WAS_ID',                                  'was_id',  75,  Grid.Number, false, true);
        this.toptxnGrid.endAddColumns();
        target.add(this.toptxnGrid);

        this.toptxnGrid._columnsList[1].flex = 1;

        this.toptxnGrid.addRenderer('ratio', this.gridStackRenderer.bind(this));

        this.cellEventCls = this.id+'_grid_ratio';

        $(this.el.dom).on('mouseenter', '.' + this.cellEventCls, function() {
            var etime = $(this).attr('etime');
            var dtime = $(this).attr('dtime');
            var dPercent = (etime > 0)? Math.round(dtime / etime * 100) : 0;
            var ePercent = 100 - dPercent;

            $(self.transactionTooltip).css({'display': 'block'});
            $(self.transactionTooltip).find('.elapsetimeValue').text(ePercent+'%');
            $(self.transactionTooltip).find('.dbtimeValue').text(dPercent+'%');

            var posY = window.event.pageY;
            var posX = window.event.pageX;

            if (posY + 90 > window.innerHeight) {
                posY = window.innerHeight - 90;
            }
            if (posX + ($(self.transactionTooltip).width()) + 50 > window.innerWidth) {
                posX = window.innerWidth - (($(self.transactionTooltip).width()) + 50);
            }
            $(self.transactionTooltip).css({top: posY + 10, left: posX + 10});

            if (self.tooltipTimer) {
                clearTimeout(self.tooltipTimer);
            }
            self.tooltipTimer = setTimeout(function() {
                $(self.transactionTooltip).css('display', 'none');
            }.bind(self), 2000);
        });

        $(this.el.dom).on('mouseout', '.'+this.cellEventCls, function() {
            $(self.transactionTooltip).css('display', 'none');
        });
    },


    /**
     * 수행시간 비율 컬럼에 표시될 바 그래프 구성.
     *
     * @param {string | number} value
     * @param {object} metaData
     * @param {object} record
     *
     * @return {String} html string
     */
    gridStackRenderer: function(value, metaData, record) {
        var ewidth;
        var dwidth;

        var etime = record.get('avg');
        var dtime = record.get('dbtime');

        var barWidth = 100;
        var bars     = '<div class="'+this.cellEventCls+'" etime="'+etime+'" dtime="'+dtime+'" style=" display: block; position: relative; width:'+barWidth+'%; height: 13px;">';

        // 그리는 부분은 아직
        dwidth = (etime > 0)? Math.round(dtime / etime * barWidth) : 0;
        ewidth = barWidth - dwidth;

        bars += '<div style="display: inline-block; background: #098FFF;width:'+ewidth + '%; height: 13px; float: left;"></div>';
        bars += '<div style="display: inline-block; background: #09FFC3;width:'+dwidth + '%; height: 13px; float: left;"></div>';

        return bars;
    },


    /**
     * 툴팁 생성
     */
    createTooltip: function() {
        this.removeTooltip();

        this.transactionTooltip = $('<div class="toptransaction-tool-tip"></div>').css({
            'position': 'absolute',
            'display': 'none',
            'z-index': 100000,
            'color': '#000',
            'background-color': '#fff',
            'padding': '8px 8px 8px 10px',
            'border': '1px solid #D8D8D8',
            'border-radius': '4px'
        });

        this.transactionTooltip.prepend('<div class="time" style="font-size: 14px;margin-bottom:6px;padding-bottom: 2px;border-bottom: 1px solid #D2D2D2;">'+common.Util.TR('Elapse Time Ratio')+'</div>');
        var $nameArea = $('<div style="float:left"></div>');
        var $valueArea = $('<div style="float:left;margin-left: 4px;"></div>');

        this.transactionTooltip.append($nameArea);
        this.transactionTooltip.append($valueArea);

        $nameArea.append( '<div class="elapsetimeLabel" style="font-size: 14px;color:#098FFF;margin-bottom: 1px;">'+common.Util.TR('Elapse Time')+'<span style="float:right;margin-left:2px;"> : </span></div>');
        $valueArea.append('<div class="elapsetimeValue" style="font-size: 14px;margin-bottom: 1px;text-align: right;"></div>');
        $nameArea.append( '<div class="dbtimeLabel" style="font-size: 14px;color:#09FFC3;margin-bottom: 1px;">'+common.Util.TR('DB Time')+'<span style="float:right;margin-left:2px;"> : </span></div>');
        $valueArea.append('<div class="dbtimeValue" style="font-size: 14px;margin-bottom: 1px;text-align: right;"></div>');

        $('body').append(this.transactionTooltip);
    },


    /**
     * 툴팁 삭제
     */
    removeTooltip: function() {
        if (this.transactionTooltip != null) {
            this.transactionTooltip.remove();
            this.transactionTooltip = null;
        }
    },


    /**
     * Grid 목록에 Context Menu 메뉴를 추가.
     *
     * @param {object} grid
     */
    addContextMenu: function(grid) {
        var self = this;

        if (!self.txnHistoryClass) {
            return;
        }

        grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Summary'),
            fn: function() {
                var record = this.up().record;
                var lastTime = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);
                var selectedWasId = '';
                var key, WasListData = [];

                var monitorType = self.monitorType;
                var txnHistoryClass = self.txnHistoryClass;

                if (self.serverIdArr.length !== self.selectedServerIdArr.length) {
                    selectedWasId = self.selectedServerIdArr.join(',');
                }

                if (self.monitorType === 'E2E') {

                    if ( Comm.tpIdArr && Comm.tpIdArr.indexOf(record.was_id) !== -1 ) {
                        monitorType     = 'TP';
                        txnHistoryClass = 'TPTxnHistory';

                    } else if ( Comm.webIdArr && Comm.webIdArr.indexOf(record.was_id) !== -1 ) {
                        monitorType     = 'Web';
                        txnHistoryClass = 'WebTxnHistory';

                    } else if ( Comm.cdIdArr && Comm.cdIdArr.indexOf(record.was_id) !== -1 ) {
                        monitorType     = 'CD';
                        txnHistoryClass = 'CDTxnHistory';

                    } else {
                        monitorType     = 'WAS';
                        txnHistoryClass = 'TxnHistory';

                        for (key in Comm.wasInfoObj) {
                            if (Comm.wasInfoObj[key].type === 'WAS') {
                                WasListData.push(key);
                            }
                        }

                        selectedWasId = WasListData.join(',');
                    }

                }

                var txnHistory = common.OpenView.open(txnHistoryClass, {
                    monitorType  : monitorType,
                    toTime       : Ext.util.Format.date(common.Util.getDate(lastTime), Comm.dateFormat.HM),
                    fromTime     : Ext.util.Format.date(common.Util.getDate(+new Date(common.Util.getDate(lastTime)) - 3600000), Comm.dateFormat.HM),
                    transactionTF: '%' + common.Util.cutOffTxnExtName(record.txn),
                    wasId        : selectedWasId
                });

                setTimeout(function () {
                    txnHistory.retrieve();
                    record = null;
                }, 300);
            }
        }, 0);
    },


    /**
     * 데이터 새로고침을 중지.
     */
    stopRefreshData: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },


    /**
     * 데이터 새로 고침.
     */
    frameRefresh: function() {
        this.stopRefreshData();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp || this.floatingLayer) {
            this.isRefreshTop = common.RTMDataManager.checkThroughputTime();

            if (this.isRefreshTop === true) {
                this.drawTopTxnData();
            }
        }
        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 3000);
    },


    /**
     * Top Transaction 조회
     */
    drawTopTxnData: function() {

        var limitCnt = this.limitCombo.value;

        var values;
        if (this.selectedServerIdArr.length <= 0) {
            values = -1;

        } else {
            // 선택된 서버ID 배열이 컴포넌트에서 표시가 가능한 서버ID 인지 비교하여 표시가 가능한 서버ID만
            // 조회가 되도록 검색 조건을 설정함
            values = Ext.Array.intersect(this.serverIdArr, this.selectedServerIdArr).join(',');
        }

        WS.SQLExec({
            sql_file: 'IMXRT_TopTransaction.sql',
            bind: [{
                name: 'fromtime',
                type: SQLBindType.STRING,
                value: common.Util.getDate(realtime.lastestTime)
            }],
            replace_string: [{
                name : 'wasid',
                value: values
            },{
                name : 'limitCnt',
                value:  limitCnt
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm === true) {
                return;
            }
            this.toptxnGrid.clearRows();
            var ratio;

            for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                ratio = 0;
                if (adata.rows[ix][2] > 0) {
                    ratio = Math.round(adata.rows[ix][4] / adata.rows[ix][2] * 100);
                }
                this.toptxnGrid.addRow([
                    adata.rows[ix][0],          // TXN_ID
                    adata.rows[ix][1],          // TXN_NAME
                    adata.rows[ix][2],          // TXN_ELAPSE_AVG
                    100 - ratio,                // TXN_ELAPSE_TIME_RATIO
                    adata.rows[ix][4],          // SQL_ELAPSE_AVG
                    Number(adata.rows[ix][3]),  // TXN_EXEC_COUNT
                    adata.rows[ix][5]           // WAS_ID
                ]);
            }

            this.toptxnGrid.drawGrid();

            values   = null;
            limitCnt = null;
            adata    = null;

        }.bind(this), this);
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * 화면에서 WAS 또는 그룹(Host, Business)을 선택하는 경우 호출.
     */
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

        this.drawTopTxnData();
    }

});
