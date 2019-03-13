Ext.define('rtm.src.rtmActiveTxnList', {
    extend : 'rtm.src.rtmActiveTxn',
    title  : common.Util.CTR('Active Transaction'),
    layout : 'fit',

    isOption: true,

    // 액티브 트랜젹션 목록에 필터된 업무 ID
    filterBusinessId: null,

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ACTIVETXN, me);

            this.removeTooltip();

            $(this.el.dom).off('mouseover', '.' + this.cellEventCls);
            $(this.el.dom).off('mouseout', '.' + this.cellEventCls);

            this.stopTxnCheckRefresh();
            this.refreshTimer = null;

            me.grid.removeAll();

            realtime.ActiveTxnGrid = null;

            if (realtime.topologyTxnViewList) {
                delete realtime.topologyTxnViewList[this.id];
            }
        }
    },


    init: function() {
        this.callParent();

        this.initProperty();

        this.frameTitle.setText(this.title);

        this.createGrid();

        this.createTooltip();

        this.checkFilterWas();

        this.startTxnCheckRefresh();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ACTIVETXN, this);

        if (this.optionBtn) {
            this.optionBtn.optionView = this.createOptionWindow();
        }

    },


    /**
     * Init Property Parameters
     */
    initProperty: function() {
        this.monitorType = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        // 그리드 정보를 저장하는 키 값
        this.saveGridName = 'rtm_grid_activetxn';

        // 목록에 표시하지 않을 컬럼의 데이터 인덱스
        this.hideDataIndex = ['bankcode'];

        // 관리자 권한인 경우에 대해서만 옵션 창을 볼 수 있게 설정
        if (cfg.login.admin_check !== 1 && this.optionBtn) {
            this.optionBtn.setVisible(false);
        }

        this.timerCount   = 0;
        this.refreshTimer = null;
        this.sqlFullText  = null;

        // 그리드 목록에서 클래스 자바 소스 및 트랜잭션 자보 소스를 볼 수 있는 메뉴 표시
        // TP, WEB 인 경우에는 false 로 설정되어 소스보기 메뉴가 표시되지 않는다.
        this.enableClassView  = true;
        this.enableThreadDump = true;

        this.activeTxnRefreshCheck = true;
        this.useActiveTimeColor = Comm.RTComm.getBooleanValue(Comm.web_env_info.useActiveTimeColor);

        // 기본 값
        this.warningTime  = 3000;
        this.criticalTime = 7000;

        var activeLevel = Comm.web_env_info['ACTTIME_LEVEL(MS)'];

        if (activeLevel) {
            this.warningTime  = activeLevel.split(',')[0];
            this.criticalTime = activeLevel.split(',')[1];
        }

        this.formatLabel = {
            over   : common.Util.TR('{0} MilliSec and over'),
            between: common.Util.TR('{0} MilliSec and over under {1} MilliSec')
        };
    },


    /**
     * 다른 화면과 연계되어 보여질 때 필터 처리할 WAS 정보를 체크.
     */
    checkFilterWas: function() {
        var wasName = [];
        var serverName;
        var ix;

        var filterToServerID    = realtime.openTxnFilterToServerId;
        var filterToServerType  = realtime.openTxnFilterToServerType;
        var fromServerName      = realtime.openTxnFilterFromServerName;
        var toServerName        = realtime.openTxnFilterToServerName;
        this.popupFilterWasId   = realtime.openTxnFilterWasId;
        this.popupFilterDestKey = realtime.openTxnFilterDestKey;

        realtime.openTxnFilterWasId = null;
        realtime.openTxnFilterDestKey = null;
        realtime.openTxnFilterToServerId = null;
        realtime.openTxnFilterToServerType = null;
        realtime.openTxnFilterToServerName = null;
        realtime.openTxnFilterFromServerName = null;

        // 특정 WAS를 보기 위해서 실행되었는지 체크,
        // 지정된 WAS ID가 있으면 해당되는 WAS 정보만 보여준다.
        if (this.popupFilterWasId) {
            this.wasList.length = 0;

            if (filterToServerID && !toServerName) {
                if (filterToServerType === 'DB') {
                    toServerName = Comm.RTComm.getDBNameById(filterToServerID);
                } else {

                    toServerName = Comm.RTComm.getServerNameByID(filterToServerID, this.monitorType);
                }
            }

            if (Number.isInteger(this.popupFilterWasId)) {
                this.wasList[0] = this.popupFilterWasId;

                serverName = Comm.RTComm.getServerNameByID(this.popupFilterWasId, this.monitorType);

                // 서버명이 있는 경우만 설정을 한다.
                if (serverName) {
                    wasName.push(serverName);
                }

            } else {
                this.wasList = this.popupFilterWasId.split(',');

                for (ix = 0; ix < this.wasList.length; ix++) {
                    this.wasList[ix] = +this.wasList[ix];

                    serverName = Comm.RTComm.getServerNameByID(this.wasList[ix], this.monitorType);

                    // 서버명이 있는 경우만 설정을 한다.
                    if (serverName) {
                        wasName.push(serverName);
                    }
                }
            }
            wasName = wasName.join();

            if (toServerName) {
                this.isFromToRemoteList = true;
                this.up().setTitle(this.title + ' (' + fromServerName + ' &#10230; ' + toServerName + ')');
            } else {
                this.isFromToRemoteList = false;
                this.up().setTitle(this.title + ' (' + (fromServerName || wasName) + ')');
            }

            // 메인 화면 좌측 메뉴에서 WAS를 선택하는 경우에 표시되는 WAS가 변경되지 않도록
            // 관련 함수를 null 처리.
            this.frameChange = null;
        }

        if (toServerName) {
            this.isOpenerTopology = true;
            realtime.isOpenerTopology = null;
        } else {
            this.isOpenerTopology = false;
        }

        // 필터된 업무 ID가 있는 경우 메인 화면 좌측 메뉴에서 서버를 선택해도 변경되지 않도록 관련 함수를 null 처리함.
        if (this.filterBusinessId) {
            this.frameChange = null;
        }

    },


    /**
     * 그리드 생성
     */
    createGrid: function() {
        var self = this;

        this.grid = Ext.create('Exem.BaseGrid', {
            gridName      : this.saveGridName,
            width         : '100%',
            height        : '100%',
            localeType    : 'H:i:s',
            usePager      : false,
            borderVisible : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            columnmove: function() {
                this.saveLayout(this.name);
            },
            cellclick: function(thisGrid, td, cellIndex, record) {
                var temp  = thisGrid.headerCt.getHeaderAtIndex(cellIndex),
                    popupOption = 'width=1280, height=1024',
                    guid, time, logDay, logTime, url;

                if (!record.data.guid) {
                    return;
                }

                if (temp.text === common.Util.CTR('GUID') && common.Menu.linkPopup.isUsed) {
                    guid = record.data.guid;
                    time = record.data.time;
                    logDay = Ext.Date.format(time, 'Ymd');
                    logTime = Ext.Date.format(time, 'His');

                    url = common.Menu.linkPopup.url + '?gid=' + guid + '&logday=' + logDay + '&logtm=' + logTime;

                    window.open(url, 'link_popup', popupOption);
                }
            },
            celldblclick: function(thisGrid, td, cellIndex, record) {
                var temp  = thisGrid.headerCt.getHeaderAtIndex(cellIndex);
                var sqlid;
                var fromTime, toTime, dbId, mxgParams, editTheme, theme;
                var txnDetail;

                if (self.isOpenerTopology && realtime.openTxnPathWinShow) {
                    realtime.openTxnPathWinShow(record.data);

                } else {
                    if (self.sqlFullText) {
                        self.sqlFullText.destroy();
                        self.sqlFullText = null;
                    }

                    switch (temp.text) {
                        case 'SQL 1' : sqlid = record.data.sqlid1;
                            break;
                        case 'SQL 2' : sqlid = record.data.sqlid2;
                            break;
                        case 'SQL 3' : sqlid = record.data.sqlid3;
                            break;
                        case 'SQL 4' : sqlid = record.data.sqlid4;
                            break;
                        case 'SQL 5' : sqlid = record.data.sqlid5;
                            break;
                        default:
                            sqlid = '';
                            break;
                    }

                    if (sqlid !== '') {

                        fromTime = Ext.Date.format(new Date(record.data.starttime), 'Y-m-d H:i:s.u');
                        toTime   = Ext.Date.format(Ext.Date.add(new Date(record.data.starttime), Ext.Date.MINUTE, 30), 'Y-m-d H:i:s.u');
                        dbId     = Comm.RTComm.getDBIdyName(record.data.instancename);

                        // MFO 화면 연동에 필요한 파라미터 값을 설정함.
                        mxgParams = {
                            dbId    : dbId,
                            sqlUid  : sqlid,
                            tid     : record.data.tid,
                            sid     : record.data.sid,
                            fromTime: fromTime,
                            toTime  : toTime,
                            viewType: 'SessionDetail'
                        };
                        self.sqlFullText = Ext.create('Exem.FullSQLTextWindow',{
                            cls: 'rtm-sqlview',
                            mxgParams: mxgParams
                        });
                        self.sqlFullText.getFullSQLText(sqlid, record.data.bind_list);

                        theme = Comm.RTComm.getCurrentTheme();
                        switch (theme) {
                            case 'Black' :
                                editTheme = 'ace/theme/dark_imx';
                                break;
                            case 'White' :
                                editTheme = 'ace/theme/eclipse';
                                break;
                            default :
                                editTheme = 'ace/theme/dark_imx';
                                break;
                        }
                        self.sqlFullText.addCls('xm-dock-window-base');
                        self.sqlFullText.BaseFrame.sqlEditor.editTheme  = editTheme;
                        self.sqlFullText.BaseFrame.bindEditor.editTheme = editTheme;

                        self.sqlFullText.show();

                    } else {
                        txnDetail = Ext.create('rtm.src.rtmActiveTxnDetail');
                        txnDetail.stack_dump   = false;
                        txnDetail.tid          = record.data.tid;
                        txnDetail.wasid        = record.data.wasid;
                        txnDetail.starttime    = record.data.starttime;
                        txnDetail.current_time = record.data.time;
                        txnDetail.monitorType  = self.monitorType;

                        txnDetail.initWindow();
                        setTimeout(function() {
                            txnDetail.init(record.data);
                            txnDetail = null;
                        },10);
                    }
                }

                temp  = null;
                sqlid = null;
            }
        });

        this.grid.beginAddColumns();

        try {
            this.grid.addColumn(common.Util.CTR('Time'                    ), 'time'          ,  70, Grid.DateTime, true,  true);
            this.grid.addColumn(common.Util.CTR('Agent'                   ), 'wasname'       , 110, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('Full Transaction'        ), 'txnname'       , 250, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('Transaction'             ), 'txninfo'       , 150, Grid.String  , false,  false);
            this.grid.addColumn(common.Util.CTR('Business Transaction'    ), 'biztxn'        , 110, Grid.String  , false,  false);
            this.grid.addColumn(common.Util.CTR('Parameter'               ), 'param'         , 100, Grid.String  , false,  false);
            this.grid.addColumn(common.Util.CTR('Class Method'            ), 'classmethod'   , 350, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('Method Type'             ), 'methodtype'    , 130, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('State'                   ), 'state'         , 130, Grid.String  , true,  false);    // 5
            this.grid.addColumn(common.Util.CTR('Elapse Time'             ), 'elapsedtime'   , 100, Grid.Float   , true,  false);
            this.grid.addColumn(common.Util.CTR('Start Time'              ), 'starttime'     , 100, Grid.DateTime, true,  false);
            this.grid.addColumn(common.Util.CTR('DB Time'                 ), 'dbtime'        ,  80, Grid.Float   , true,  false);
            this.grid.addColumn(common.Util.CTR('DB Wait Time'            ), 'waittime'      ,  80, Grid.Float   , false, false);
            this.grid.addColumn(common.Util.CTR('CPU Time'                ), 'cputime'       ,  80, Grid.Float   , true,  false);    // 10
            this.grid.addColumn(common.Util.CTR('Elapse Time Ratio (%)'   ), 'elapseratio'   ,  90, Grid.Float   , true,  false);
            this.grid.addColumn(common.Util.CTR('Thread Memory Usage (MB)'), 'threadmemory'  ,  90, Grid.Float   , true,  false);
            this.grid.addColumn(common.Util.CTR('Client IP'               ), 'clientip'      , 110, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('Pool'                    ), 'poolname'      , 130, Grid.String  , false, false);
            this.grid.addColumn(common.Util.CTR('DB Instance'             ), 'instancename'  , 130, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('DB ID'                   ), 'dbId'          ,  50, Grid.String  , false,  true);
            this.grid.addColumn(common.Util.CTR('SID'                     ), 'sid'           ,  80, Grid.Number  , false, false);    // 15
            this.grid.addColumn(common.Util.CTR('SQLID 1'                 ), 'sqlid1'        , 250, Grid.String  , false, true);
            this.grid.addColumn(common.Util.CTR('SQL 1'                   ), 'sqltext1'      , 250, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('Bind Value'              ), 'bindlist'      , 150, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('SQL Execution Count'     ), 'sqlexeccount'  , 100, Grid.Number  , false, false);
            this.grid.addColumn(common.Util.CTR('Prepare Count'           ), 'preparecount'  , 100, Grid.Number  , false, false);    // 20
            this.grid.addColumn(common.Util.CTR('Fetch Count'             ), 'fetchcount'    , 100, Grid.Number  , true,  false);
            this.grid.addColumn(common.Util.CTR('DB Wait Info'            ), 'waitinfo'      , 500, Grid.String  , false, false);
            this.grid.addColumn(common.Util.CTR('SQLID 2'                 ), 'sqlid2'        , 250, Grid.String  , false, true);
            this.grid.addColumn(common.Util.CTR('SQL 2'                   ), 'sqltext2'      , 250, Grid.String  , false, false);
            this.grid.addColumn(common.Util.CTR('SQLID 3'                 ), 'sqlid3'        , 250, Grid.String  , false, true);     // 25
            this.grid.addColumn(common.Util.CTR('SQL 3'                   ), 'sqltext3'      , 100, Grid.String  , false, false);
            this.grid.addColumn(common.Util.CTR('SQLID 4'                 ), 'sqlid4'        , 250, Grid.String  , false, true);
            this.grid.addColumn(common.Util.CTR('SQL 4'                   ), 'sqltext4'      , 100, Grid.String  , false, false);
            this.grid.addColumn(common.Util.CTR('SQLID 5'                 ), 'sqlid5'        , 250, Grid.String  , false, true);
            this.grid.addColumn(common.Util.CTR('SQL 5'                   ), 'sqltext5'      , 100, Grid.String  , false, false);    // 30
            this.grid.addColumn(common.Util.CTR('Logical Reads'           ), 'logicalreads'  , 100, Grid.Number  , false, false);
            this.grid.addColumn(common.Util.CTR('Physical Reads'          ), 'physicalreads' , 100, Grid.Number  , false, false);
            this.grid.addColumn(common.Util.CTR('PGA Usage'               ), 'pgausage'      , 100, Grid.Float   , false, false);
            this.grid.addColumn(common.Util.CTR('Login Name'              ), 'loginname'     , 100, Grid.String  , false, false);
            this.grid.addColumn(common.Util.CTR('Browser'                 ), 'browser'       , 100, Grid.String  , false, false);    // 35
            this.grid.addColumn(common.Util.CTR('Transaction CPU TIME'    ), 'txncputime'    , 100, Grid.Float   , false, false);
            this.grid.addColumn(common.Util.CTR('OS Code'                 ), 'oscode'        , 100, Grid.String  , false, true);
            this.grid.addColumn(common.Util.CTR('Bank Code'               ), 'bankcode'      , 100, Grid.String  , true,  false);
            this.grid.addColumn(common.Util.CTR('Error Code'              ), 'errorcode'     , 100, Grid.String  , false, true);

            // 아래 두 필드는 보여주진 않지만 필요한 필드
            this.grid.addColumn(common.Util.CTR('TID'                     ), 'tid'           , 100, Grid.String  , false,  true);
            this.grid.addColumn(common.Util.CTR('Was ID'                  ), 'wasid'         , 100, Grid.String  , false,  true);
            this.grid.addColumn(common.Util.CTR('Dest'                    ), 'dest'          , 100, Grid.String  , false,  false);
            this.grid.addColumn(common.Util.CTR('Dest Hash ID'            ), 'destHash'      , 100, Grid.String  , false,  true);
            this.grid.addColumn(common.Util.CTR('GUID'                    ), 'guid'          , 100, Grid.String  , false,  false);
            this.grid.addColumn(common.Util.CTR('Business ID'             ), 'businessId'    , 100, Grid.String  , false,  false);
        } finally {
            this.grid.setOrderAct('elapsedtime', 'desc');
            this.grid.endAddColumns();
        }

        this.setRowClassByElapseTime();

        if (this.hideDataIndex.length > 0) {
            common.WebEnv.setVisibleGridColumn(this.grid, this.hideDataIndex, true);
        }

        // NonDB 인 경우 특정 컬럼 숨김 처리
        if (window.isIMXNonDB === true) {
            common.WebEnv.setVisibleGridColumn(
                this.grid,
                ['waittime', 'cputime', 'waitinfo', 'logicalreads', 'physicalreads', 'pgausage'],
                true
            );
        }

        // 로그인 사용자가 Bind 권한이 없는 경우 숨김 처리
        if (Comm.config.login.permission.bind !== 1) {
            common.WebEnv.setVisibleGridColumn(this.grid, ['bindlist'], true);
        }

        this.grid.loadLayout(this.saveGridName);

        if (common.Menu.linkPopup.isUsed) {
            this.grid.addRenderer('guid', this.cellAddClass.bind(this));
        }
        this.grid.addRenderer('elapseratio', this.gridStackRenderer.bind(this));

        this.cellEventCls = this.id + '_grid_ratio';

        $(this.el.dom).on('mouseenter', '.' + this.cellEventCls, function() {
            var etime = $(this).attr('etime');
            var dtime = $(this).attr('dtime');
            var dPercent = (+etime === 0) ? 0 : Math.round(dtime / etime * 100);
            var ePercent = 100 - dPercent;

            $(self.transactionListTooltip).css({'display': 'block'});
            $(self.transactionListTooltip).find('.elapsetimeValue').text(ePercent + '%');
            $(self.transactionListTooltip).find('.dbtimeValue').text(dPercent + '%');

            var posY = window.event.pageY;
            var posX = window.event.pageX;

            if (posY + 90 > window.innerHeight) {
                posY = window.innerHeight - 90;
            }
            if (posX + ($(self.transactionListTooltip).width()) + 50 > window.innerWidth) {
                posX = window.innerWidth - (($(self.transactionListTooltip).width()) + 50);
            }
            $(self.transactionListTooltip).css({top: posY + 10, left: posX + 10});

            if (self.tooltipTimer) {
                clearTimeout(self.tooltipTimer);
            }
            self.tooltipTimer = setTimeout(function() {
                self.hideTooltip();
            }.bind(self), 2000);
        });

        $(this.el.dom).on('mouseout', '.' + this.cellEventCls, function() {
            $(self.transactionListTooltip).css('display', 'none');
        });

        this.tabpanel.add(this.grid);

        this.addContextMenu();
        this.grid.drawGrid();
    },

    cellAddClass: function(value, metaData) {
        metaData.tdCls  = 'linkPoint';

        return value;
    },


    /**
     * '수행 시간 비율(%)' 컬럼에 보여지는 스택 바 처리
     *
     * @param {string | number} value
     * @param {object} metaData
     * @param {object} record
     *
     * @return {string}
     */
    gridStackRenderer: function(value, metaData, record) {
        var ewidth, dwidth;

        var etime = record.get('elapsedtime');
        var dtime = record.get('dbtime');

        var barWidth = 100;
        var bars     = '<div class="' + this.cellEventCls + '" etime="' + etime + '" dtime="' + dtime + '" style=" display: block; position: relative; width:' + barWidth + '%; height: 13px;">';

        dwidth = (+etime === 0) ? 0 : Math.round(dtime / etime * barWidth);
        if (dwidth > 100) {
            dwidth = 100;
        }
        ewidth = barWidth - dwidth;

        bars += '<div style="display: inline-block; background: #098FFF;width:' + ewidth + '%; height: 13px; float: left;"></div>';
        bars += '<div style="display: inline-block; background: #09FFC3;width:' + dwidth + '%; height: 13px; float: left;"></div>';

        return bars;
    },


    /**
     * 툴팁 생성
     */
    createTooltip: function() {
        this.removeTooltip();

        this.transactionListTooltip = $('<div class="txnlist-tool-tip"></div>').css({
            'position': 'absolute',
            'display': 'none',
            'z-index': 20000,
            'color': '#000',
            'background-color': '#fff',
            'padding': '8px 8px 8px 10px',
            'border': '1px solid #D8D8D8',
            'border-radius': '4px'
        });

        this.transactionListTooltip.prepend('<div class="time" style="font-size: 14px;margin-bottom:6px;padding-bottom: 2px;border-bottom: 1px solid #D2D2D2;">' + common.Util.TR('Elapse Time Ratio') + '</div>');
        var $nameArea = $('<div style="float:left"></div>');
        var $valueArea = $('<div style="float:left;margin-left: 4px;"></div>');

        this.transactionListTooltip.append($nameArea);
        this.transactionListTooltip.append($valueArea);

        if (!this.wasTimeLabel) {
            if (this.monitorType === 'TP') {
                this.wasTimeLabel = common.Util.TR('TP Time');
            } else {
                this.wasTimeLabel = common.Util.TR('WAS Time');
            }
        }
        if (!this.dbTimeLabel) {
            this.dbTimeLabel = common.Util.TR('DB Time');
        }

        $nameArea.append( '<div class="elapsetimeLabel" style="font-size: 14px;color:#098FFF;margin-bottom: 1px;">' + this.wasTimeLabel + '<span style="float:right;margin-left:2px;"> : </span></div>');
        $valueArea.append('<div class="elapsetimeValue" style="font-size: 14px;margin-bottom: 1px;text-align: right;"></div>');
        $nameArea.append( '<div class="dbtimeLabel" style="font-size: 14px;color:#09FFC3;margin-bottom: 1px;">' + this.dbTimeLabel + '<span style="float:right;margin-left:2px;"> : </span></div>');
        $valueArea.append('<div class="dbtimeValue" style="font-size: 14px;margin-bottom: 1px;text-align: right;"></div>');

        $('body').append(this.transactionListTooltip);
    },


    /**
     * 툴팁 제거
     */
    removeTooltip: function() {
        if (this.transactionListTooltip) {
            this.transactionListTooltip.remove();
            this.transactionListTooltip = null;
        }
    },


    /**
     * 툴팁 숨김
     */
    hideTooltip: function() {
        if (this.transactionListTooltip && $(this.transactionListTooltip)[0].style.display !== 'none') {
            $(this.transactionListTooltip).css('display', 'none');
        }
    },


    /**
     * 목록에 컨텍스트 메뉴 추가
     */
    addContextMenu: function() {
        var self = this;
        if (this.enableThreadDump) {
            this.grid.contextMenu.addItem({
                title : common.Util.TR('Thread Dump'),
                itemId: 'stack_dump',
                fn: function() {
                    var r = this.up().record;
                    var AJSON = {};

                    AJSON.dll_name = 'IntermaxPlugin.dll';
                    AJSON.options  = {
                        was_id    : r.wasid,
                        tid       : r.tid,
                        dbname    : Comm.web_env_info.Intermax_MyRepository
                    };
                    AJSON['function'] =  'stack_dump';

                    console.debug('%c Execute Thread Dump - TID / WASID / DB: ', 'color:#3191C8;', AJSON.options.tid + ' / ' + AJSON.options.was_id + ' / ' + AJSON.options.dbname);

                    WS.PluginFunction( AJSON , function(aheader, adata) {
                        console.debug('%c Result Thread Dump - TID / WASID / DB: ', 'color:#3191C8;', AJSON.options.tid + ' / ' + AJSON.options.was_id + ' / ' + AJSON.options.dbname);
                        console.debug(aheader, adata);
                    } , this );

                    var txndetail = Ext.create('rtm.src.rtmActiveTxnDetail');
                    txndetail.stack_dump   = true;
                    txndetail.tid          = r.tid;
                    txndetail.wasid        = r.wasid;
                    txndetail.starttime    = r.starttime;
                    txndetail.current_time = r.time;

                    txndetail.initWindow();
                    setTimeout(function() {
                        txndetail.isExecThreadDump = true;
                        txndetail.init(r);
                        txndetail.setThreadDumpValue();
                        txndetail = null;
                    },10);
                }
            }, 0);

            this.grid.contextMenu.setDisableItem(0, cfg.login.permission.system_dump);
        }

        if (this.enableClassView) {
            this.grid.contextMenu.addItem({
                title : common.Util.TR('Transaction Java Source'),
                itemId: 'txn_java_source',
                fn: function() {
                    var r = this.up().record;
                    var classview = Ext.create('Exem.ClassView');
                    classview.classmethod = r.txnname;
                    classview.wasid = r.wasid;
                    classview.init();
                }
            }, 0);

            this.grid.contextMenu.addItem({
                title : common.Util.TR('Class Java Source'),
                itemId: 'class_java_source',
                fn: function() {
                    var r = this.up().record;
                    var classview = Ext.create('Exem.ClassView');
                    var index = r.classmethod.indexOf('.');
                    classview.classmethod = r.classmethod.substr(0, index) + '.class';
                    classview.wasid = r.wasid;
                    classview.init();
                }
            }, 0);

            this.grid.contextMenu.addItem({
                title : common.Util.TR('Transaction Summary'),
                itemId: 'txn_history',
                fn: function() {
                    var record = this.up().record;
                    var txnHistory = common.OpenView.open('TxnHistory', {
                        monitorType  : self.monitorType,
                        fromTime     : common.Util.getDate(record.time - 600000),
                        toTime       : common.Util.getDate(+new Date(record.time) + 1200000 ),
                        transactionTF: '%' + common.Util.cutOffTxnExtName(record.txnname),
                        wasId        : record.wasid
                    });
                    setTimeout(function() {
                        txnHistory.executeSQL();
                        txnHistory = null;
                    }, 300);
                }
            }, 0);
        }

        this.grid.contextMenu.addItem({
            title : common.Util.TR('Transaction Detail'),
            itemId: 'txn_detail',
            fn: function() {
                var r = this.up().record;
                var txndetail = Ext.create('rtm.src.rtmActiveTxnDetail');
                txndetail.stack_dump = false;
                txndetail.tid = r.tid;
                txndetail.wasid = r.wasid;
                txndetail.starttime = r.starttime;
                txndetail.current_time = r.time;
                txndetail.monitorType  = self.monitorType;

                txndetail.initWindow();
                setTimeout(function() {
                    txndetail.init(r);
                    txndetail = null;
                },10);
            }
        }, 0);

        // MaxGauge 연계 기능 체크. 사용하는 경우 Context Menu 에 연계 메뉴를 추가함.
        var isEnableMaxGaugeLink = Comm.RTComm.isMaxGaugeLink();

        if (isEnableMaxGaugeLink) {

            // MaxGauge - Session Detail 화면 연계
            this.grid.contextMenu.addItem({
                title : 'DB ' + common.Util.TR('Session Detail'),
                itemId: 'session_detail',
                fn: function() {
                    var r = this.up().record;
                    if (!r.sqlid1) {
                        return;
                    }

                    var dbId = Comm.RTComm.getDBIdyName(r.instancename);

                    Comm.RTComm.openMaxGaugeSessionDetail(dbId, r.sqlid1, r.sid, r.tid);
                }
            }, 0);
        }

        this.grid.pnlExGrid.addListener('beforecellcontextmenu', function(thisGrid, td, cellIndex, record) {
            var serverId = record.data.wasid;
            var sqlid    = record.data.sqlid1;

            if (isEnableMaxGaugeLink) {
                if (!sqlid) {
                    this.grid.contextMenu.setDisableItem('session_detail', false);
                } else {
                    this.grid.contextMenu.setDisableItem('session_detail', true);
                }
            }

            // .Net 에이전트인 경우 클래스 자바소스, 트랜잭션 자바소스 메뉴를 비활성화 처리한다.
            if (Comm.wasInfoObj[serverId] && Comm.wasInfoObj[serverId].isDotNet) {
                this.grid.contextMenu.setDisableItem('class_java_source', false);
                this.grid.contextMenu.setDisableItem('txn_java_source', false);
            }
        }, this);

    },


    /**
     * 액티브 트랜잭션 옵션창 생성
     */
    createOptionWindow: function() {

        var optionPanel = Ext.create('Ext.panel.Panel', {
            layout : 'vbox',
            width  : '100%',
            height : 120,
            border : false,
            split  : true,
            margin : '3 0 3 0',
            padding: '2 2 2 2',
            items: [{
                xtype : 'container',
                layout: 'absolute',
                cls   : 'rtm-activetxn-option',
                itemId: 'optionPanelLeft',
                width : '100%',
                flex  : 1
            }]
        });

        var firstOption = Ext.create('Ext.form.FieldSet',{
            width : 395,
            height: 140,
            layout: {
                type :'absolute'
            },
            title: common.Util.TR('Activity Monitor Color Indication Criteria'),
            x: 10,
            y: 12
        });

        var warningValue, criticalValue;

        warningValue = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Warning'),
            labelAlign: 'left',
            allowBlank: false,
            width     : 120,
            labelWidth: 55,
            maxLength : 5,
            value     : this.warningTime,
            oldValue  : this.warningTime,
            x         : 20,
            y         : 2,
            allowExponential: false,
            allowDecimals   : false,
            enforceMaxLength: true,
            enableKeyEvents : true,
            hideTrigger     : true,
            cls : 'rtm-list-condition',
            listeners: {
                scope: this,
                blur: function(me) {
                    if (me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value >= 100000) {
                            me.setValue(99999);
                        }

                        if (this.validateOptionWarning(criticalValue.getValue(), me.value)) {
                            me.setValue(me.oldValue);
                            return;
                        }

                        me.oldValue = me.value;
                    }
                },
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value >= 100000) {
                            me.setValue(99999);
                        }

                        if (this.validateOptionWarning(criticalValue.getValue(), me.value)) {
                            me.setValue(me.oldValue);
                            return;
                        }

                        me.oldValue = me.value;
                    }
                }
            }
        });

        var warningLabel = Ext.create('Ext.form.Label', {
            x   : 145,
            y   : 8,
            html: '<span>' + common.Util.TR('MilliSec and over') + '</span>'
        });

        criticalValue = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Critical'),
            labelAlign: 'left',
            allowBlank: false,
            width     : 120,
            labelWidth: 55,
            maxLength : 5,
            value     : this.criticalTime,
            oldValue  : this.criticalTime,
            x         : 20,
            y         : 22,
            allowExponential: false,
            allowDecimals   : false,
            enforceMaxLength: true,
            enableKeyEvents : true,
            hideTrigger     : true,
            cls : 'rtm-list-condition',
            listeners: {
                scope: this,
                blur: function(me) {
                    if (me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value >= 100000) {
                            me.setValue(99999);
                        }

                        if (this.validateOptionCritical(me.value, warningValue.getValue())) {
                            me.setValue(me.oldValue);
                            return;
                        }
                        me.oldValue = me.value;
                    }
                },
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value >= 100000) {
                            me.setValue(99999);
                        }

                        if (this.validateOptionCritical(me.value, warningValue.getValue())) {
                            me.setValue(me.oldValue);
                            return;
                        }
                        me.oldValue = me.value;
                    }
                }
            }
        });

        var criticalLabel = Ext.create('Ext.form.Label', {
            x   : 145,
            y   : 27,
            html: '<span>' + common.Util.TR('MilliSec and over') + '</span>'
        });

        firstOption.add(warningLabel, warningValue, criticalLabel, criticalValue);

        this.setGuideInfo(firstOption);

        this.descrRangeNormal.text = Ext.String.format(this.formatLabel.between, 0, this.warningTime);
        this.descrRangeWarning.text = Ext.String.format(this.formatLabel.between, this.warningTime, this.criticalTime);
        this.descrRangeCritical.text = Ext.String.format(this.formatLabel.over, this.criticalTime);

        var secondOption = Ext.create('Ext.form.FieldSet',{
            width : 395,
            height: 60,
            layout: {
                type :'absolute'
            },
            title: common.Util.TR('Active Transaction Elapse Time Color Display'),
            x: 10,
            y: 165
        });

        var useStatusLabel = Ext.create('Ext.form.Label', {
            x   : 20,
            y   : 10,
            html: '<span>' + common.Util.TR('Use Status') + '</span>'
        });

        var toggleOnOff = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width  : 100,
            margin: '10 0 0 100',
            onText : common.Util.TR('Apply'),
            offText: common.Util.TR('Unapplied'),
            state  : this.useActiveTimeColor
        });

        secondOption.add(useStatusLabel, toggleOnOff);

        optionPanel.getComponent('optionPanelLeft').add(firstOption, secondOption);

        var bottomArea =  Ext.create('Exem.Container', {
            cls    : 'rtm-activetxn-option-bottom',
            layout : {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            margin: '0 0 0 0',
            width : '100%',
            height: 38,
            items: [{
                xtype: 'button',
                cls : 'rtm-btn',
                text: common.Util.TR('OK'),
                width : 60,
                height: 20,
                listeners: {
                    scope: this,
                    click: function(me) {
                        this.useActiveTimeColor = toggleOnOff.getValue();
                        this.warningTime = warningValue.getValue();
                        this.criticalTime = criticalValue.getValue();

                        // 색상 사용유무를 저장
                        if (this.monitorType === 'TP') {
                            common.WebEnv.Save('TPuseActiveTimeColor', this.useActiveTimeColor);
                        } else if (this.monitorType === 'WEB') {
                            common.WebEnv.Save('WEBuseActiveTimeColor', this.useActiveTimeColor);
                        } else {
                            common.WebEnv.Save('useActiveTimeColor', this.useActiveTimeColor);
                        }

                        // 공통 데이터라서 사용자 ID를 -1로 설정
                        var actTimeLevel = this.warningTime + ',' + this.criticalTime;
                        if (this.monitorType === 'TP') {
                            common.WebEnv.SaveByUserID('TP_ACTTIME_LEVEL(MS)', actTimeLevel, -1);
                        } else if (this.monitorType === 'WEB') {
                            common.WebEnv.SaveByUserID('WEB_ACTTIME_LEVEL(MS)', actTimeLevel, -1);
                        } else {
                            common.WebEnv.SaveByUserID('ACTTIME_LEVEL(MS)', actTimeLevel, -1);
                        }

                        me.up('.window').close();
                    }
                }
            },{
                xtype : 'button',
                cls   : 'rtm-btn',
                text  : common.Util.TR('Cancel'),
                margin: '0 0 0 15',
                height: 20,
                listeners: {
                    scope: this,
                    click: function(me) {
                        this.changeLvWas = null;
                        this.changeTxnLv = '';
                        me.up('.window').close();
                    }
                }
            }]
        });

        optionPanel.add(bottomArea);

        var optionWin =  Ext.create('Exem.XMWindow', {
            layout  : 'fit',
            title   : common.Util.TR('Active Transaction Option'),
            cls     : 'xm-dock-window-base',
            width   : 440,
            height  : 340,
            modal   : true,
            resizable  : false,
            maximizable: false,
            closeAction: 'hide',
            listeners: {
                scope: this,
                beforeshow: function() {
                    if (toggleOnOff.state !== this.useActiveTimeColor) {
                        toggleOnOff.toggle();
                    }
                    warningValue.setValue(this.warningTime);
                    criticalValue.setValue(this.criticalTime);

                    this.descrRangeNormal.setText(Ext.String.format(this.formatLabel.between, 0, this.warningTime));
                    this.descrRangeWarning.setText(Ext.String.format(this.formatLabel.between, this.warningTime, this.criticalTime));
                    this.descrRangeCritical.setText(Ext.String.format(this.formatLabel.over, this.criticalTime));
                }
            }
        });
        optionWin.add(optionPanel);

        return optionWin;
    },


    /**
     * 경고 항목에 입력된 값을 검증.
     *
     * @param {number} cVal - Critical Value
     * @param {number} wVal - Warning Value
     * @return {boolean}
     */
    validateOptionWarning: function(cVal, wVal) {
        var isReturn = false;
        if (cVal <= wVal) {
            Ext.MessageBox.show({
                title   : '',
                icon    : Ext.MessageBox.WARNING,
                message : common.Util.TR('Warning value is greater than critical value.'),
                modal   : true,
                cls     : 'popup-message',
                buttons : Ext.Msg.OK
            });
            isReturn = true;

        } else {
            this.descrRangeNormal.setText(Ext.String.format(this.formatLabel.between, 0, wVal));
            this.descrRangeWarning.setText(Ext.String.format(this.formatLabel.between, wVal, cVal));
            this.descrRangeCritical.setText(Ext.String.format(this.formatLabel.over, cVal));
        }
        return isReturn;
    },


    /**
     * 심각 항목에 입력된 값을 검증.
     *
     * @param {number} cVal - Critical Value
     * @param {number} wVal - Warning Value
     * @return {boolean}
     */
    validateOptionCritical: function(cVal, wVal) {
        var isReturn = false;
        if (cVal <= wVal) {
            Ext.MessageBox.show({
                title   : '',
                icon    : Ext.MessageBox.WARNING,
                message : common.Util.TR('Put a value greater than a warning to critical.'),
                modal   : true,
                cls     : 'popup-message',
                buttons : Ext.Msg.OK
            });
            isReturn = true;
        } else {
            this.descrRangeNormal.setText(Ext.String.format(this.formatLabel.between, 0, wVal));
            this.descrRangeWarning.setText(Ext.String.format(this.formatLabel.between, wVal, cVal));
            this.descrRangeCritical.setText(Ext.String.format(this.formatLabel.over, cVal));
        }
        return isReturn;
    },


    /**
     * 액티브 트랜잭션 옵션 설정화면에 보여지는 가이드 정보 설정.
     *
     * @param {object} target
     */
    setGuideInfo: function(target) {
        var iconNormal = Ext.create('Ext.form.Label', {
            x: 20,
            y: 55,
            html: '<div class="label-icon normal"></div>'
        });

        var descrNormal = Ext.create('Ext.form.Label', {
            x: 40,
            y: 55,
            html: '<div">' + common.Util.TR('Normal') + ' :</div>'
        });

        this.descrRangeNormal = Ext.create('Ext.form.Label', {
            x: 95,
            y: 55,
            text: this.formatLabel.between
        });

        var iconWarning = Ext.create('Ext.form.Label', {
            x: 20,
            y: 75,
            html: '<div class="label-icon warning"></div>'
        });

        var descrWarning = Ext.create('Ext.form.Label', {
            x: 40,
            y: 75,
            html: '<div>' + common.Util.TR('Warning') + ' :</div>'
        });

        this.descrRangeWarning = Ext.create('Ext.form.Label', {
            x: 95,
            y: 75,
            text: this.formatLabel.between
        });

        var iconCritical = Ext.create('Ext.form.Label', {
            x: 20,
            y: 95,
            html: '<div class="label-icon critical"></div>'
        });

        var descrCritical = Ext.create('Ext.form.Label', {
            x: 40,
            y: 95,
            html: '<div>' + common.Util.TR('Critical') + ' :</div>'
        });

        this.descrRangeCritical = Ext.create('Ext.form.Label', {
            x: 95,
            y: 95,
            text: this.formatLabel.over
        });

        target.add(
            iconNormal,   descrNormal,   this.descrRangeNormal,
            iconWarning,  descrWarning,  this.descrRangeWarning,
            iconCritical, descrCritical, this.descrRangeCritical
        );
    },


    /**
     * rtmActiveTxn.js의 changeAutoRefresh() Override
     *
     * @param {boolean} val - 체크박스 체크 유무 true: 체크됨, false: 체크안됨
     */
    changeAutoRefresh: function(val) {
        this.activeTxnRefreshCheck = val;
    },


    /**
     * 트랜잭션을 체크하는 체크로직 중지
     */
    stopTxnCheckRefresh: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },


    /**
     * 액티브 트랜잭션 데이터가 설정된 시간동안 발생하지 않으면 목록을 클리어
     */
    startTxnCheckRefresh: function() {
        this.stopTxnCheckRefresh();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp && this.activeTxnRefreshCheck) {
            this.diffSec = Ext.Date.diff(this.lastTxnTime , new Date(), Ext.Date.SECOND);

            if (this.diffSec > 6) {
                this.grid.clearRows();
                this.hideTooltip();
            }
        }

        this.refreshTimer = setTimeout(this.startTxnCheckRefresh.bind(this), 6000);
    },


    /**
     * 액티브 트랜잭션 패킷 데이터 로드
     *
     * @param {Object} adata
     */
    onData: function(adata) {
        var destFilterKeys;

        this.lastTxnTime = new Date();

        // 새로고침이 체크되어 있는지 확인
        if (!this.activeTxnRefreshCheck) {
            return;
        }

        if (document.hidden) {
            return;
        }

        if (adata.rows.length <= 0 || adata.rows[0].length <= 0) {
            return false;
        }

        // RTM 화면이 아닌 경우 데이터 갱신을 하지 않는다.
        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);
        if (!isDisplayCmp) {
            return;
        }

        if (adata.rows[0][2] === '') {
            this.grid.clearRows();
            this.hideTooltip();
            return;
        }

        if (!this.popupFilterWasId && !realtime.ActiveTxnGrid) {
            realtime.ActiveTxnGrid = this.grid;
        }

        if (this.isFromToRemoteList && realtime.topologyTxnFilterDest) {
            destFilterKeys = realtime.topologyTxnFilterDest[this.popupFilterDestKey];

            // 연계 데이터 Debug Code
            // console.debug('%c [Active Txn List] Filter Topology - Filter Key: ', 'color:#3191C8;', this.popupFilterDestKey)
            // console.debug('%c [Active Txn List] Filter Topology - Dest Key: ', 'color:#3191C8;', destFilterKeys)

            if (destFilterKeys) {
                this.filterTxnDest = destFilterKeys.concat();
            }

            if (!this.tempData) {
                this.tempData = [];
            }
            this.tempData = Ext.clone(adata);
        }

        this.drawData(adata);

        adata = null;
    },


    /**
     * 저장된 그리드 데이터를 목록에 다시 그리는 함수.
     *
     * 토폴로지 뷰에서 액티브 트랜잭션 목록 화면과 연계해서 보여줄 때
     * 액티브 트랜잭션 데이터와 토폴로지 카운트 데이터가 들어오는 시점에
     * 차이가 발생하여 데이터가 보여지지 않는 현상을 해결하기 위해 추가됨.
     */
    updateData: function() {
        if (!this.tempData || this.tempData.length <= 0) {
            return;
        }
        this.drawData(this.tempData);
    },


    /**
     * 액티브 트랜잭션 데이터 표시
     *
     * @param {Object} data
     */
    drawData: function(data) {

        if (data == null) {
            this.timerCount++;

            if (this.timerCount > 1 && this.activeTxnRefreshCheck) {
                this.grid.clearRows();
            }
        }

        if (this.grid.pnlExGrid.headerCt == null) {
            return;
        }

        if (!data || !data.rows || data.rows.length <= 0 || !this.activeTxnRefreshCheck) {
            return;
        }

        var d;
        var loginName;
        var browser;
        var bind;

        var ix, ixLen;

        var methodType;
        var startTime;
        var elapseTime;
        var txnCpuTime;
        var dbTime;
        var cpuTime;
        var waitTime;
        var state;
        var instance;
        var ratio, guidDest, dest, guid, splitIdx;
        var txnName, bizTxnName, txnParam, threadMemory, businessId;

        this.grid.clearRows();

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            d = data.rows[ix];

            if (this.monitorType === 'WAS' && Comm.tpIdArr.indexOf(d[1]) !== -1) {
                continue;
            }

            // 액티브 트랜잭션 패킷 데이터에 업무 ID 항목이 추가되기 전 버전인 경우 업무 ID를 -1로 설정함.
            businessId = (d.length > 60) ? d[60] : -1;

            // 필터된 업무 ID가 있으면 액티브 트랜잭션 목록에서 해당하는 데이터만 보이게 처리.
            if (this.filterBusinessId && this.filterBusinessId !== businessId) {
                continue;
            }

            if (this.wasList.indexOf(d[1]) !== -1) {

                if (this.isNotDrawData(d)) {
                    continue;
                }

                loginName = '';
                browser   = '';

                if (d[39] !== '') {
                    loginName = d[39].split(' ')[0];
                    browser   = d[39].split(' ')[1];
                }

                this.txnInfoList = this.getSplitTxnData(d[5]);

                txnName    = this.txnInfoList[0] || '';
                bizTxnName = this.txnInfoList[1] || '';
                txnParam   = this.txnInfoList[2] || '';

                bind       = this.getBindValue(d[55]);
                methodType = common.Util.codeBitToMethodType(d[41]);
                startTime  = new Date(parseInt(d[7]));
                dbTime     = (parseInt(d[10]) + parseInt(d[11])) / 1000;
                elapseTime = d[9] / 1000;
                txnCpuTime = parseInt(d[36]) / 1000;
                cpuTime    = parseInt(d[10]) / 1000;
                waitTime   = parseInt(d[11]) / 1000;
                state      = Comm.RTComm.getActiveTxnState(d[17]);
                instance   = (Comm.dbInfoObj[d[14]] != null) ? Comm.dbInfoObj[d[14]].instanceName : d[15];
                ratio      = (elapseTime > 0) ? Math.round(dbTime / elapseTime * 100) : 0;
                guidDest   = (d.length > 56) ? d[56] : '';

                threadMemory  = (d.length > 59) ? (d[59] / 1024) : 0;

                if (guidDest.indexOf('^') !== -1) {
                    guidDest = guidDest.substring(guidDest.indexOf('^') + 1);
                }

                splitIdx = guidDest.indexOf('|');
                if (splitIdx !== -1) {
                    guid = guidDest.substring(0, splitIdx);
                    dest = guidDest.substring(splitIdx + 1);
                } else {
                    guid = '';
                    dest = guidDest;
                }

                if (this.config.options && this.config.options.business_id) {
                    if (!((this.hasBizId(businessId)) && (this.config.options.tier_list.indexOf(d[1] + '') !== -1))) {
                        continue;
                    }
                }
                this.grid.addRow([
                    new Date(d[0]),                         // Time
                    d[2],                                   // WAS Name
                    d[5],                                   // Transaction
                    txnName,                                // 트랜잭션 - 트랜잭션 정보
                    bizTxnName,                             // 트랜잭션 - 업무명
                    txnParam,                               // 트랜잭션- 파라미터
                    d[54],                                  // Class Method
                    methodType,                             // Method Type
                    state,                                  // State
                    elapseTime,                             // Elapse Time
                    startTime,                              // Start Time
                    dbTime,                                 // DB Time (CPU Time + Wait Time)
                    waitTime,                               // Wait Time
                    cpuTime,                                // CPU Time
                    100 - ratio,                            // Elapse Time Ration (%)
                    threadMemory,                           // Thread Memory Usage
                    d[6],                                   // Client IP
                    d[13],                                  // Pool Name
                    instance,                               // Instance Name
                    d[14],                                  // DB ID
                    d[16],                                  // SID
                    Ext.isEmpty(d[19]) ? '' : d[18],           // SQLID 1
                    d[19],                                  // SQL Text 1
                    bind,                                   // Bind List
                    d[28],                                  // SQL Exec Count
                    d[30],                                  // Prepare Count
                    d[29],                                  // Fetch Count
                    d[35],                                  // Wait Info
                    Ext.isEmpty(d[21]) ? '' : d[20],           // SQLID 2
                    d[21],                                  // SQL Text 2
                    Ext.isEmpty(d[23]) ? '' : d[22],           // SQLID 3
                    d[23],                                  // SQL Text 3
                    Ext.isEmpty(d[25]) ? '' : d[24],           // SQLID 4
                    d[25],                                  // SQL Text 4
                    Ext.isEmpty(d[27]) ? '' : d[26],           // SQLID 5
                    d[27],                                  // SQL Text 5
                    d[33],                                  // Logical Reads
                    d[34],                                  // Physical Reads
                    d[32],                                  // MEM Usage
                    loginName,                              // Login Name
                    browser,                                // Browser
                    txnCpuTime,                             // Transaction CPU Time
                    d[51],                                  // OS Code
                    d[52],                                  // Bank Code
                    d[53],                                  // Error Code
                    d[3],                                  // TID
                    d[1],                                  // WAS ID
                    dest,                                   // Dest
                    (d.length > 57) ? d[57] : '',            // Dest Hash ID
                    guid,                                   // GUID,
                    businessId                              // Business ID
                ]);

            }
        }

        this.grid.drawGrid();
        this.timerCount = 0;

        this.hideTooltip();

        loginName    = null;
        browser      = null;
        bind         = null;
        methodType   = null;
        startTime    = null;
        dbTime       = null;
        cpuTime      = null;
        waitTime     = null;
        state        = null;
        d            = null;
        data         = null;
    },

    /**
     * Repository에 들어오는 패킷과 비교하면서 화면에 출력해야하는 데이터가 맞는지 확인
     *
     * @param {int} business_id
     * @return {boolean}
     */
    hasBizId: function(id) {
        if (!Repository.BizData || !Object.keys(Repository.BizData).length) {
            return;
        }

        var ix, split, bizData;

        bizData = Repository.BizData;

        for (ix in bizData[id]) {
            split = bizData[id][ix].TREE_KEY.split('-')[0];
            if (this.config.options.business_id === +split) {
                return true;
            }
        }

        return false;
    },


    /**
     * Grid 목록에 표시할 데이터인지 체크.
     *
     * @param {array} data
     * @return {boolean} true - 목록에 표시, false - 목록에 비표시
     */
    isNotDrawData: function(data) {
        var isContinue = false;

        // Check Topology View Dest Filter
        if (this.isFromToRemoteList && !this.filterTxnDest) {
            isContinue = true;
        }

        if (data.length > 57 && this.filterTxnDest && this.filterTxnDest.indexOf(data[57]) === -1) {
            isContinue = true;
        }
        return isContinue;
    },


    /**
     * Grid 목록에 표시되는 바인드값 설정.
     *
     * @param {string} data - bind data
     * @return {string} bind value;
     */
    getBindValue: function(data) {
        var jx, jxLen;
        var temp;
        var bind = '';

        if (data !== '') {
            temp = common.Util.convertBindList(data);

            for (jx = 0, jxLen = temp.length; jx < jxLen; jx++) {
                if (jx > 0) {
                    bind += ',';
                }
                bind += temp[jx].value;
            }
        }
        return bind;
    },


    /**
     * 트랜잭션 명칭을 구분하여 표시
     * 실시간 트랜잭션 데이터에 트랜잭션 값을 "트랜잭션 전체", "트랜잭션", "업무 트랜잭션", "파라미터" 로
     * 구분하여 표시되게 처리한다.
     *
     * 예)
     * 트랜잭션 전체: [테스트업무]/ktrerp/xp/executeds+ZCM_WEB_USR_SESSION_INFO+ZSD_01_0079_002
     * 트랜잭션: /ktrerp/xp/executeds
     * 업무 트랜잭션: [테스트업무]
     * 파라미터: ZCM_WEB_USR_SESSION_INFO+ZSD_01_0079_002
     *
     * @param {string} txnData - transaction data
     *
     * @return {array}
     *   [0] 트랜잭션명
     *   [1] 업무명
     *   [2] 파라미터
     */
    getSplitTxnData: function(txnData) {
        var txnArr;
        var txnName, bizTxnNames, bizTxnName, txnParam;
        var tmpTxnData;
        var regExp, specChar;

        if (txnData) {
            // 업무 트랜잭션
            if (txnData.indexOf('[') === 0 && txnData.indexOf(']') > 0) {
                // 괄호안의 업무 트랜잭션 정보 추출하기
                tmpTxnData = txnData;
                bizTxnNames = tmpTxnData.match(/\[.*?\]/gi);

                // 대괄호로 구분되는 다른 데이터가 있는지 체크하여 제외 처리
                while (bizTxnNames && bizTxnNames.length > 1) {
                    tmpTxnData = tmpTxnData.replace(bizTxnNames[bizTxnNames.length - 1], '');
                    bizTxnNames = tmpTxnData.match(/\[.*?\]/gi);
                }

                // 업무 트랜잭션 설정
                bizTxnName = tmpTxnData.match(/\[.*\]/gi);

                // 트랜잭션 데이터에서 업무 트랜잭션 데이터 제외
                txnData = txnData.replace(bizTxnName, '');
            }

            // 트랜잭션과 파라미터를 구분할 특수문자 지정
            regExp   = /[?,;:|*~!^\-+<>@\#$%&\=]/gi;
            specChar = regExp.exec(txnData);

            // 트랜잭션 및 파라미터 구하기
            if (specChar) {
                txnName  = txnData.substring(0, specChar.index);

                txnParam = txnData.substring(specChar.index + 1);
            } else {
                txnName  = txnData;
                txnParam = '';
            }
        }

        txnArr = [txnName, bizTxnName, txnParam];

        return txnArr;
    },


    /**
     * '수행 시간'이 설정된 임계치 값에 해당하는 경우 행의 색상을 설정.
     *
     * 색상을 강조하는 옵션이 설정된 경우 설정된 임계치 값을 기준으로 표시처리하며
     * 설정되지 않은 경우에는 색상을 표시하지 않는다.
     * 임계치 값이 설정되지 않은 경우에는 아래의 기본값으로 체크하여 표시한다.
     *
     *  [임계치 기본 값]
     *  0 ~ 3초 미만: Normal
     *  3 ~ 7초 미만: Warning
     *  7초 이상    : Critical
     */
    setRowClassByElapseTime: function() {
        this.grid.pnlExGrid.getView().getRowClass = function(record) {
            if (!this.useActiveTimeColor) {
                return;
            }

            // record.data.elapsedtime (s)
            // this.criticalTime, this.warningTime (ms)
            var cls;
            var eTime = record.data.elapsedtime * 1000;

            if (eTime >= this.criticalTime) {
                cls = 'rtm-txn-row-critical';
            } else if (eTime >= this.warningTime) {
                cls = 'rtm-txn-row-warning';
            } else {
                cls = '';
            }
            return cls;
        }.bind(this);
    }

});
