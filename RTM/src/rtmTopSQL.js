Ext.define('rtm.src.rtmTopSQL', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Realtime TOP SQL'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            this.removeTooltip();
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.sqlGridName = 'intermax_rtm_topsql';

        this.sqlHistoryClass = 'SQLHistory';
    },

    init: function() {
        this.initProperty();

        this.initLayout();

        this.addContextMenu(this.topSqlGrid);

        this.createTooltip();

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
            text   : this.title
        });

        this.centerArea = Ext.create('Exem.Container',{
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
            enforceMaxLength: true,
            allowExponential: false,
            allowDecimals   : false,
            value          : 5,
            oldValue       : 5,
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
                        this.frameRefresh();
                    }
                },
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value > 20) {
                            me.setValue(20);
                        }
                        me.oldValue = me.value;
                        this.frameRefresh();
                    }
                }
            }
        });

        this.limitOldCount = this.limitCombo.value;

        this.topContentsArea.add([this.frameTitle, {xtype: 'tbfill'}, this.limitCombo, this.expendIcon]);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.createGrid(this.centerArea);

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },


    /**
     * Grid 생성
     */
    createGrid: function (target) {
        this.topSqlGrid = Ext.create('Exem.BaseGrid', {
            gridName     : this.sqlGridName,
            layout       : 'fit',
            usePager     : false,
            autoScroll   : false,
            borderVisible: true,
            localeType   : 'H:i:s',
            columnLines  : true,
            baseGridCls  : 'baseGridRTM',
            exportFileName: this.title,
            style: {
                'overflow-x': 'hidden'
            }
        });

        this.topSqlGrid.beginAddColumns();
        this.topSqlGrid.addColumn(common.Util.CTR('SQL'),               'sql',            75,  Grid.String, true,  false);
        this.topSqlGrid.addColumn(common.Util.CTR('Elapse Time (AVG)'), 'elapsetime',     95,  Grid.Float,  true,  false);
        this.topSqlGrid.addColumn(common.Util.CTR('Ratio'),             'ratio',          95,  Grid.Float,  true,  false);
        this.topSqlGrid.addColumn(common.Util.CTR('Max Elapse Time'),   'maxElapsetime',  95,  Grid.Float,  false, false);
        this.topSqlGrid.addColumn(common.Util.CTR('Execution Count'),   'count',          95,  Grid.Number, true,  false);
        this.topSqlGrid.addColumn(common.Util.CTR('SQL ID'),            'sqlid',          25,  Grid.Number, false,  true);
        this.topSqlGrid.addColumn('WAS_ID',                             'was_id',         75,  Grid.Number, false,  true);
        this.topSqlGrid.endAddColumns();

        this.topSqlGrid.addRenderer('ratio', this.gridBarRenderer.bind(this), RendererType.bar);

        this.topSqlGrid._columnsList[2].on({
            scope: this,
            resize: function() {
                this.progressFillWidth = $('#'+this.id+' .progress-bar').width();
                if (this.progressFillWidth) {
                    $('#'+this.id+' .progress-fill-text').css('width', this.progressFillWidth);
                }
            }
        });

        target.add(this.topSqlGrid);

        this.topSqlGrid._columnsList[0].minWidth = 150;
        this.topSqlGrid._columnsList[0].flex = 1;
    },


    /**
     * 그리드에 보여지는 막대 그래프 설정.
     */
    gridBarRenderer: function(value) {
        var htmlStr;
        var barWidth;

        barWidth     = value;
        if (value > 0) {
            if (!this.progressFillWidth) {
                this.progressFillWidth = 83;
            }
            htmlStr =
                '<div class="progress-bar" style="border: 0px solid #666; height:13px; width: 100%;position:relative; text-align:center;">'+
                    '<div class="progress-fill" style="width:' + barWidth + '%;">'+
                        '<div class="progress-fill-text" style="width:'+this.progressFillWidth+'px">'+value+'%</div>'+
                    '</div>'+ value + '%' +
                '</div>';
        } else {
            htmlStr =  '<div data-qtip="" style="text-align:center;">'+'0%'+'</div>';
        }

        return htmlStr;
    },


    /**
     * 그리드 바에 마우스 오버시 표시되는 툴팁 레이아웃 생성.
     */
    createTooltip: function() {
        this.removeTooltip();

        this.topSqlTooltip = $('<div class="topsqltext-tool-tip"></div>').css({
            'position': 'absolute',
            'display': 'none',
            'z-index': 100000,
            'color': '#000',
            'background-color': '#fff',
            'padding': '8px 8px 8px 10px',
            'border': '1px solid #D8D8D8',
            'border-radius': '4px',
            'max-width': '500px'
        });

        this.topSqlTooltip.prepend('<div class="elapsetime" style="margin-bottom:2px;border-bottom: 1px solid #D2D2D2;"></div>');
        var $valueArea = $('<div style="float:left;margin-left: 3px;"></div>');

        this.topSqlTooltip.append($valueArea);

        $valueArea.append('<div class="sqltext" style="margin-bottom: 1px;"></div>');

        $('body').append(this.topSqlTooltip);
    },


    /**
     * 툴팁 삭제.
     */
    removeTooltip: function() {
        if (this.topSqlTooltip) {
            this.topSqlTooltip.remove();
            this.topSqlTooltip = null;
        }
    },


    /**
     * Grid 목록에 Context Menu 메뉴를 추가.
     *
     * @param {object} grid
     */
    addContextMenu: function(grid) {
        var self = this;

        if (!self.sqlHistoryClass) {
            return;
        }

        grid.contextMenu.addItem({
            title: common.Util.TR('SQL Summary'),
            fn: function() {
                var record = this.up().record;
                var lastTime = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);
                var selectedWasId = '';
                var key, WasListData = [];

                if (self.serverIdArr.length !== self.selectedServerIdArr.length) {

                    selectedWasId = self.selectedServerIdArr.join(',');

                }

                if (self.openViewType === 'E2E') {

                    if ( Comm.tpIdArr && Comm.tpIdArr.indexOf(record.was_id) !== -1 ) {
                        self.monitorType     = 'TP';
                        self.sqlHistoryClass = 'TPSQLHistory';
                    }

                    else {
                        self.monitorType     = 'WAS';
                        self.sqlHistoryClass = 'SQLHistory';

                        for (key in Comm.wasInfoObj) {
                            if(Comm.wasInfoObj[key].type === 'WAS'){
                                WasListData.push(key);
                            }
                        }

                        selectedWasId = WasListData.join(',');
                    }

                }

                var sqlHistory = common.OpenView.open(self.sqlHistoryClass, {
                    monitorType  : self.monitorType,
                    toTime       : Ext.util.Format.date(common.Util.getDate(lastTime), Comm.dateFormat.HM),
                    fromTime     : Ext.util.Format.date(common.Util.getDate(+new Date(common.Util.getDate(lastTime)) - 3600000), Comm.dateFormat.HM),
                    sqlIdTF      : record.sqlid,
                    elapseTimeTF : Math.trunc(record.elapsetime),
                    wasId        : selectedWasId
                });
                setTimeout(function (){
                    sqlHistory.retrieve();
                    record = null;
                }, 300);
            }
        }, 0);
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
     * 데이터 새로 고침.
     * 새로고침 간격 (10분)
     */
    frameRefresh: function() {
        this.stopRefreshData();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp || this.floatingLayer) {
            this.topSQLQuery();
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), PlotChart.time.exMin * 10);
    },


    /**
     * 일일 처리 건수 조회
     */
    topSQLQuery: function() {

        if (!this.limitCombo) {
            return;
        }

        var lastTime = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(lastTime) !== true) {
            console.debug('%c [Top SQL] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (this.beforeLastestTime == null) {
                this.beforeLastestTime = +new Date();
            }
            lastTime = new Date(this.beforeLastestTime);
        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        var fromtime = Ext.Date.format(Ext.Date.subtract(lastTime, Ext.Date.HOUR, 1), 'Y-m-d H:i:s.u');
        var totime   = Ext.Date.format(lastTime, 'Y-m-d H:i:s.u');
        var limitCnt = this.limitCombo.value;

        var values;
        if (this.selectedServerIdArr.length <= 0) {
            values = -1;
        } else if (this.openViewType === 'E2E') {
            values = Comm.wasIdArr.concat(Comm.cdIdArr)
                                  .concat(Comm.tpIdArr)
                                  .concat(Comm.webIdArr).join(',');
        } else {
            values = this.selectedServerIdArr.join(',');
        }

        WS.SQLExec({
            sql_file: 'IMXRT_TopSQL_elapse.sql',
            bind: [{ name: 'from_time', value: fromtime, type: SQLBindType.STRING },
                   { name: 'to_time',   value: totime, type: SQLBindType.STRING }
            ],
            replace_string: [{
                name : 'was_id',
                value:  values
            },{
                name : 'limitCnt',
                value:  limitCnt
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm === true) {
                return;
            }

            this.drawData(adata);

            adata    = null;
            values   = null;
            lastTime = null;
            fromtime = null;
            totime   = null;
        }, this);
    },


    /**
     * Draw Grid - Top SQL
     */
    drawData: function(adata) {
        this.topSqlGrid.clearRows();

        if (this.topSqlGrid.pnlExGrid.headerCt == null) {
            return;
        }

        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            this.topSqlGrid.addRow([
                adata.rows[ix][0],          // "sql_text"
                adata.rows[ix][3],          // "avg_elapse"
                adata.rows[ix][2],          // "elapsed_time_ratio"
                adata.rows[ix][4],          // "max_elapse"
                Number(adata.rows[ix][5]),  // "sql_exec_count"
                adata.rows[ix][6] || '',    // "sql_id",
                adata.rows[ix][7]           // "was_id"
            ]);
        }

        this.topSqlGrid.drawGrid();

        adata = null;
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

        this.frameRefresh();
    }

});
