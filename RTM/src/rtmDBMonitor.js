Ext.define('rtm.src.rtmDBMonitor', {
    extend   : 'Exem.XMWindow',
    title    : common.Util.TR('DB Monitor'),
    cls      : 'xm-dock-window-base',

    width    : 1000,
    height   : 680,
    minWidth : 850,
    minHeight: 600,
    layout   : 'fit',
    plain    : false,

    intervalTime: 3000,
    closeAction : 'destroy',

    isInitResize : true,
    isWinClosed  : false,
    isAutoRefresh: true,

    listeners: {
        resize: function() {
            if (this.isInitResize) {
                this.isInitResize = false;
            } else {
                this.redDrawChart();
            }
        },
        beforedestroy: function() {
            if (this.timeOut){
                clearTimeout(this.timeOut);
                this.timeOut = null;
            }

            this.activeSessionGrid.destroy();
            this.lockSessionGrid.destroy();
            this.targetGrid.destroy();
            this.targetTree.destroy();

            this.DBchartArea.destroy();
            this.excludeCheckBox.destroy();
            this.excludeCheckLabel.destroy();
            this.DBSessionTab.destroy();

            this.activeSessionGrid = null;
            this.lockSessionGrid   = null;
            this.targetGrid        = null;
            this.targetTree        = null;

            this.DBchartArea       = null;
            this.excludeCheckBox   = null;
            this.excludeCheckLabel = null;
            this.DBSessionTab      = null;
        },
        close: function() {
            this.isWinClosed = true;
            if (realtime.openDBMonitor) {
                Ext.Array.remove(realtime.openDBMonitor, this.db_id);
            }
        }
    },

    chartInfo:[
        { type: 'OS'  ,  name:'free_memory'                    },
        { type: 'Stat',  name:'session logical reads'          },
        { type: 'Stat',  name:'OS Integral unshared stack size'},
        { type: 'wait',  name:'Wait'                           },
        { type: 'Stat',  name:'execute count'                  },
        { type: 'Event', name:'db file sequential read'        },
        { type: 'Stat',  name:'parse count (hard)'             }
    ],
    sql : {
        list               : 'IMXRT_DBMonitor_StatList.sql',             // Stat, Event, OS List 가져오는 쿼리

        Chart              : 'IMXRT_DBMonitor_Chart.sql',               // 실시간 차트용 stat value, event value, freememory를 그리는 쿼리

        waitValue          : 'IMXRT_DBMonitor_WaitValue.sql',           // 실시칸 차트 wait 및 그리드 한개 짜리 wait value

        activeSession      : 'IMXRT_DBMonitor_ActiveSessionList.sql',
        lockSession        : 'IMXRT_DBMonitor_LockSessionList.sql',

        serverTime         : 'IMXRT_DBMonitor_serverTime.sql'
    },
    statNames:  [],                                                     // stat 쿼리 replace string 만들기위한 array
    eventNames: [],                                                     // event 쿼리 replace string 만들기위한 array

    clickedTitlePanel: null,                                            // 헤더 panel

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(db_id) {
        this.string_Active_Session_List = common.Util.TR('Active Session List');
        this.string_Lock_Session_List   = common.Util.TR('Lock Session List');

        this.db_id = db_id;
        this.db_type = Comm.dbInfoObj[this.db_id].db_type;

        if (!this.db_type) {
            this.db_type = 'ORACLE';
        } else {
            this.db_type = this.db_type.toUpperCase();
        }

        this.setTitle(common.Util.TR('DB Monitor') + '  ' + '['+Comm.dbInfoObj[this.db_id].instanceName + ']');

        this.chartareaList = [];
        this.chartList     = [];
        this.chartTimeRecord = [];
        this.chartStatData   = {};

        this.targetGrid = null;
        this.targetTree = null;

        this.addMainWindowItems();

        this.addLineItem(this.chartFirstLine , 0, 3);
        this.addLineItem(this.chartSeconLine , 4, 7 );
        this.makeGridColumn();
        this.makeReplaceString();
        this.addChart();

        this.createStatChangeWindow();  //StatChange Window 생성

        // GET SERVER TIME
        this.getServerTime(function() {
            this.initChartData();
            this.startInterval();
        }.bind(this));
    },


    /**
     * 데이터 검색조건에 사용할 서버시간 가져오기
     */
    getServerTime: function(callback) {

        WS.SQLExec({
            sql_file: this.sql.serverTime,
            bind: [{
                name: 'db_id',
                type: SQLBindType.INTEGER,
                value: this.db_id
            }]
        }, this.onServerTime, {
            scope: this,
            callback: callback
        });
    },

    onServerTime: function(aheader, adata){
        if (this.scope.isWinClosed) {
            return;
        }

        this.scope.serverTime = adata.rows[0][0];

        if (this.callback) {
            this.callback();
        }
        adata = null;
    },


    addLineItem: function(targetArea, start, end) {
        var self = this;

        var chartId;
        var chartPanel;

        for (var ix = start; ix <= end; ix++) {
            chartId = Ext.id();
            if (ix !== 7) {
                chartPanel = Ext.create('Ext.panel.Panel',{
                    title  : self.chartInfo[ix].name,
                    flex   : 1,
                    id     : chartId,
                    _info  : self.chartInfo[ix],
                    _index : ix,
                    layout :'fit',
                    padding: '2 2 2 2',
                    height : '100%',
                    width  : '100%',
                    minHeight: 30
                });

                if (ix !== 3) {
                    // index 가 3 WAIT차트 패널을 제외하고 리스너 달기.
                    chartPanel.addCls('header-pointer');
                    chartPanel.addListener('afterrender', this.onAfterRenderEvent.bind(this));

                }
            } else {
                chartPanel = Ext.create('Ext.container.Container',{
                    flex   : 1,
                    id     : chartId,
                    layout :'fit',
                    padding: '2 2 2 2',
                    height : '100%',
                    minHeight: 30
                });
            }

            targetArea.add(chartPanel);
            this.chartareaList[this.chartareaList.length] = chartPanel;
        }
        chartPanel = null;
    },


    onAfterRenderEvent: function(me) {
        var header = me.getHeader() ;
        header.addListener('click', this.onHeaderClick.bind(this));
    },


    onHeaderClick: function(header) {
        this.clickedTitlePanel = header.up();

        if (!this.clickedTitlePanel._info) {
            return;
        }

        var type = this.clickedTitlePanel._info.type;
        var _type ;

        switch( type ){
            case 'Stat':
                _type = StatChange.stat;
                break;
            case 'Event':
                _type = StatChange.wait;
                break;
            case 'Ratio':
                _type = StatChange.ratio;
                break;
            case 'OS':
                _type = StatChange.osstat;
                break;
            default:
                break;
        }
        this.stat_change.selectValue( _type, this.clickedTitlePanel.title ) ;
        this.stat_change.show();

        type = null ;
        _type = null ;
    },


    addMainWindowItems: function() {
        var self = this;
        var windowBackground = Ext.create('Exem.Form',{
            flex   : 1,
            layout : 'border',
            cls    : 'rtm-dbmonitor-base'
        });

        this.chartFirstLine = Ext.create('Ext.container.Container',{
            flex  : 1,
            layout: 'hbox',
            height: 200,
            minHeight: 50
        });

        this.chartSeconLine = Ext.create('Ext.container.Container',{
            flex  : 1,
            layout: 'hbox',
            width : '100%',
            height: 200
        });

        this.refreshCheckBox = Ext.create('Ext.form.field.Checkbox',{
            checked   : true,
            listeners : {
                change: function() {
                    if (this.checked === true) {
                        self.isAutoRefresh = true;
                        self.startInterval();
                    } else {
                        self.isAutoRefresh = false;
                    }
                }
            }
        });

        self.refreshCheckLabel = Ext.create('Ext.toolbar.TextItem',{
            cls   : 'refreshCheckLabel',
            text  : common.Util.TR('Auto Refresh'),
            margin: '3 5 0 0'
        });

        this.comboContainer = Ext.create('Ext.container.Container',{
            width: '100%',
            height : 20,
            layout : {
                type :'hbox'
            },
            items: [{xtype: 'tbfill'}, this.refreshCheckBox, this.refreshCheckLabel]
        });

        this.DBchartArea = Ext.create('Exem.Panel',{
            width    : '100%',
            height   : 400,
            minHeight: 250,
            region   : 'north',
            split    : true,
            flex     : 1,
            layout   : { type: 'vbox', align: 'stretch'},
            cls      : 'rtm-dbmonitor-dbchart-area',
            items    : [this.comboContainer, this.chartFirstLine, this.chartSeconLine],
            listeners: {
                resize: function() {
                    if (!this.isInitResize) {
                        self.redDrawChart();
                    }
                }
            }
        });


        switch (this.db_type) {
            case 'ORACLE':
                this.activeSessionGrid  =  Ext.create('Exem.BaseGrid',{
                    gridType      : Grid.exGrid,
                    usePager      : false,
                    defaultbufferSize : 0,
                    defaultPageSize   : 0,
                    baseGridCls   : 'baseGridRTM',
                    contextBaseCls: 'rtm-context-base',
                    exportFileName: this.string_Active_Session_List,
                    localeType    : 'H:i:s'
                });
                this.lockSessionGrid    = this.createGrid(Grid.exTree);
                this.lockSessionGrid.exportFileName = this.string_Lock_Session_List;

                this.activeSessionGrid2 = null;
                this.lockSessionGrid2   = null;

                this.targetGrid = this.activeSessionGrid;
                this.targetTree =  this.lockSessionGrid;

                break;
            case 'DB2':
                this.activeSessionGrid  =  null;
                this.lockSessionGrid    =  null;
                this.activeSessionGrid2 =  this.createGrid(Grid.exGrid);
                this.lockSessionGrid2   =  this.createGrid(Grid.exTree);

                this.targetGrid = this.activeSessionGrid2;
                this.targetTree =  this.lockSessionGrid2;
                break;

            default:
                break;
        }

        if (this.targetTree) {
            this.targetTree.searchCombo.cls = 'rtm-list-condition';
            this.targetTree.JhCombo.cls = 'rtm-list-condition';
        }

        this.DBSessionTab = Ext.create('Exem.TabPanel',{
            width  : '100%',
            region : 'center',
            height : 400,
            split  : true,
            minHeight: 120,
            items: [{
                title : this.string_Active_Session_List ,
                layout: 'fit',
                items : [this.activeSessionGrid],
                showCheckbox: true
            },{
                title : this.string_Lock_Session_List,
                layout: 'fit',
                items : [this.lockSessionGrid],
                showCheckbox: false
            },{
                title: common.Util.TR('Active Session List 2'),
                layout: 'fit',
                hidden: true,
                items : [this.activeSessionGrid2],
                showCheckbox: false
            },{
                title : common.Util.TR('Lock Session List 2'),
                layout: 'fit',
                hidden: true,
                items : [this.lockSessionGrid2],
                showCheckbox: false
            }],
            listeners: {
                tabchange: function() {
                    if (this.getActiveTab().showCheckbox === true) {
                        self.excludeCheckBox.setVisible(true);
                        self.excludeCheckLabel.setVisible(true);
                    } else {
                        self.excludeCheckBox.setVisible(false);
                        self.excludeCheckLabel.setVisible(false);
                    }
                }
            }
        });

        // Exclude Background
        self.excludeCheckBox = Ext.create('Ext.form.field.Checkbox',{
            checked   : false,
            margin    : '3 2 0 0'
        });

        self.excludeCheckLabel = Ext.create('Ext.toolbar.TextItem',{
            cls   : 'excludeLabel',
            text  : common.Util.TR('Exclude Background'),
            margin: '6 5 0 0'
        });

        this.DBSessionTab.getTabBar().add({xtype: 'tbspacer', flex: 1});
        this.DBSessionTab.getTabBar().add(self.excludeCheckBox, self.excludeCheckLabel);
        this.DBSessionTab.addCls('rtm-dbmonitor-dbsession');

        windowBackground.add(this.DBchartArea, this.DBSessionTab);

        this.add(windowBackground);
    },


    /**
     * 데이터 새로고침 중지
     */
    stopInterval: function() {
        if(this.timeOut){
            clearTimeout(this.timeOut);
        }
    },


    /**
     * 데이터 새로고침
     */
    startInterval: function() {
        this.stopInterval();

        this.getServerTime(this.loadData.bind(this));

        this.timeOut = setTimeout(this.startInterval.bind(this), this.intervalTime);
    },


    /**
     * 차트 및 그리드 데이터 로드
     */
    loadData: function() {

        this.chartTimeRecord.shift();
        this.chartTimeRecord[this.chartTimeRecord.length] = +new Date(this.serverTime);

        // Wait 차트 및 그리드 데이터
        this.exeSQLRepaceString(
            this.sql.waitValue,
            [{
                name: 'db_id',
                type: SQLBindType.INTEGER,
                value: this.db_id
            }, {
                name: 'server_time',
                type: SQLBindType.STRING,
                value: this.serverTime
            }],
            [{
                name: 'IDLE_EVENT',
                value: common.DataModule.referenceToDB.eventName
            }],
            this.onWaitData,
            this
        );

        // Chart
        this.exeSQLRepaceString(
            this.sql.Chart,
            [{
                name: 'db_id',
                type: SQLBindType.INTEGER,
                value: this.db_id
            }, {
                name: 'server_time',
                type: SQLBindType.STRING,
                value: this.serverTime
            }],
            [{
                name: 'stat_name',
                value: this.statNames
            },{
                name: 'IDLE_EVENT',
                value: this.eventNames || '\'\''
            }],
            this.onDataChange,
            this
        );

        if (!this.isAutoRefresh) {
            return;
        }

        var ActiveTabTitle = this.DBSessionTab.getActiveTab().title;

        // Grid - Active Session List
        if( ActiveTabTitle === this.string_Active_Session_List ) {
            this.exeSQLBottomGrid(this.sql.activeSession, [
                {
                    name: 'db_id',
                    type: SQLBindType.INTEGER,
                    value: this.db_id
                },
                {
                    name: 'server_time',
                    type: SQLBindType.STRING,
                    value: this.serverTime
                }
            ], this.onDataFixed, this);

        } else if (this.DBSessionTab.getActiveTab().title === this.string_Lock_Session_List ) {
            // Grid - Lock Session List
            this.exeSQLBottomGrid(this.sql.lockSession, [
                {
                    name: 'db_id',
                    type: SQLBindType.INTEGER,
                    value: this.db_id
                },
                {
                    name: 'server_time',
                    type: SQLBindType.STRING,
                    value: this.serverTime
                }
            ], this.onDataFixed, this);
        }

        ActiveTabTitle = null;
    },


    /**
     * 그리드 생성
     */
    createGrid: function(type) {

        var obj = Ext.create('Exem.BaseGrid', {
            gridType    : type,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls : 'baseGridRTM',
            usePager    : false
        });

        try {
            return obj;
        } finally {
            obj = null;
        }
    },


    /**
     * 지표를 변경할 수 있는 설정화면 생성.
     */
    createStatChangeWindow: function(){
        var self = this ;

        this.stat_change = Ext.create('Exem.StatChangeWindow',{
            instanceId: this.db_id,
            useTab: {
                stat   : true,
                wait   : true,
                ratio  : false,
                osstat : true
            },
            okFn: function( type, name ){
                var _type ;
                switch (type) {
                    case 0:
                        _type = 'Stat';
                        break;
                    case 1:
                        _type = 'Event';
                        break;
                    case 2:
                        _type = 'Ratio';
                        break;
                    case 3:
                        _type = 'OS';
                        break;
                    default:
                        break;
                }
                if (name === self.clickedTitlePanel.title) {
                    Ext.Msg.show({
                        title  : common.Util.TR('Confirmation'),
                        msg    : name + ' ' + common.Util.TR('Already exists'),
                        buttons: Ext.Msg.OK,
                        icon   : Ext.MessageBox.INFO
                    });
                } else {
                    self.chartInfo[self.clickedTitlePanel._index].name = name;
                    self.chartInfo[self.clickedTitlePanel._index].type = _type;
                    self.clickedTitlePanel.setTitle(name);

                    self.setInitStatData(name);
                    self.chartList[self.clickedTitlePanel._index].drawData(self.chartTimeRecord, self.chartStatData[name], name);

                    self.makeReplaceString();
                    self.stat_change.hide() ;

                }

            }
        }) ;

        this.stat_change.init() ;
    } ,


    /**
     * STAT 과 EVENT NAME Replace String 만들기.
     */
    makeReplaceString: function() {
        this.statNames   = [];
        this.eventNames  = [];
        var tmpStatNames  = [];
        var tmpEventNames = [];

        for (var ix = 0, ixLen = this.chartInfo.length; ix < ixLen; ix++) {
            if (this.chartInfo[ix].type === 'Stat') {
                tmpStatNames[tmpStatNames.length] = ( '\''+ this.chartInfo[ix].name+'\'');

            } else if (this.chartInfo[ix].type === 'Event') {
                tmpEventNames[tmpEventNames.length] = ( '\''+this.chartInfo[ix].name+'\'' );
            }
        }
        this.statNames  = tmpStatNames.join();
        this.eventNames = tmpEventNames.join();

        tmpStatNames  = null;
        tmpEventNames = null;
    },

    exeSQLBottomGrid : function (SQL, bindInfo, ondataFunction, scope) {
        var sql_Text_dataset = {
            sql_file : SQL,
            bind     : bindInfo
        };
        WS.SQLExec(sql_Text_dataset, ondataFunction, scope);

        bindInfo         = null;
        sql_Text_dataset = null;
        ondataFunction   = null;
    },

    exeSQLRepaceString: function(SQL, bindInfo, replace, ondataFunction, scope) {
        var sql_Text_dataset = {
            sql_file       : SQL,
            bind           : bindInfo,
            replace_string : replace
        };
        WS.SQLExec( sql_Text_dataset, ondataFunction, scope ) ;

        replace          = null;
        bindInfo         = null;
        sql_Text_dataset = null;
        ondataFunction   = null;
    },

    makeGridColumn: function() {
        if (this.db_type === 'ORACLE') {
            this.activeSessionGrid.beginAddColumns();
            this.activeSessionGrid.addColumn(common.Util.CTR('Time')                  , 'time'                  , 80,  Grid.DateTime,     true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('WAS')                   , 'was_name'              , 100, Grid.String,       false, false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Transaction')           , 'txn_name'              , 200, Grid.String,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Schema')                , 'SCHEMA'                , 100, Grid.String,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Program')               , 'program'               , 100, Grid.String,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Module')                , 'MODULE'                , 100, Grid.String,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('SID')                   , 'sid'                   , 100, Grid.StringNumber, true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('SPID')                  , 'spid'                  , 100, Grid.StringNumber, true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Serial')                , 'serial'                , 100, Grid.String,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Status')                , 'status'                , 100, Grid.String,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Wait')                  , 'wait'                  , 500, Grid.String,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('SQL Text')              , 'sql_text'              , 500, Grid.String,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Elapse Time')           , 'last_call_et'          , 100, Grid.Number,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('PGA(MB)')               , 'pga'                   , 100, Grid.Float,        true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Logical Reads')         , 'logical_reads'         , 100, Grid.Number,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Physical Reads')        , 'physical_reads'        , 100, Grid.Number,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Block Changes')         , 'db_block_change'       , 100, Grid.Number,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Executions')            , 'executions'            , 100, Grid.Number,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Hard Parse Count')      , 'parse_count_hard'      , 150, Grid.Number,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Parse Count Total')     , 'parse_count_total'     , 150, Grid.Number,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Opened Cursors Current'), 'opened_cursors_current', 150, Grid.Number,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Undo Blocks')           , 'Undo Blocks'           , 100, Grid.Number,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Undo Records')          , 'Undo Records'          , 100, Grid.Number,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Undo Seq. ID')          , 'Undo Seq_ID'           , 100, Grid.Number,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Command Type')          , 'command_type'          , 100, Grid.String,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Action')                , 'action'                , 100, Grid.String,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Logical Reads (Sigma)')  , 'Logical Reads(Sigma)'  , 150, Grid.Number,      false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Physical Reads (Sigma)') , 'Physical Reads(Sigma)' , 150, Grid.Number,      false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Block Changes (Sigma)')  , 'Block Change (Sigma)'  , 150, Grid.Number,      false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Execute Count (Sigma)')  , 'Exection (Sigma)'      , 150, Grid.Number,      true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Undo Blocks (Sigma)')    , 'Undo Blocks (Sigma)'   , 150, Grid.Number,      false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Undo Record (Sigma)')    , 'Undo Records (Sigma)'  , 150, Grid.Number,      false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Machine')               , 'machine'               , 100, Grid.String,       true , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('OS User')               , 'os_user'               , 100, Grid.String,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Logon Time')            , 'logon_time'            , 80, Grid.DateTime,      false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Client Info')           , 'client_info'           , 100, Grid.String,       false , false);
            this.activeSessionGrid.addColumn(common.Util.CTR('Session Type')          , 'session_type'          , 100, Grid.String,       false , false);
            this.activeSessionGrid.endAddColumns();


            this.lockSessionGrid.beginAddColumns();
            this.lockSessionGrid.addColumn( common.Util.CTR('SID')           , 'hold_sid'    , 100, Grid.String, true , false , 'treecolumn' );
            this.lockSessionGrid.addColumn( common.Util.CTR('SPID')          , 'spid'        , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Hold Lock Type'), 'h_lock_type' , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Hold Mode')     , 'hold_mode'   , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Wait Lock Type'), 'lock_type'   , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Request Mode')  , 'req_mode'    , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Object ID')     , 'object_id'   , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Status')        , 'status'      , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Wait')          , 'wait'        , 300, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('SQL Text')      , 'sql_text'    , 500, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Elapse Time')   , 'elapse_time' , 100, Grid.Float , true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('WAS')           , 'was_name'    , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Transaction')   , 'txn_name'    , 300, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Program')       , 'program'     , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Module')        , 'MODULE'      , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Action')        , 'action'      , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Schema')        , 'SCHEMA'      , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Machine')       , 'machine'     , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('OS User')       , 'os_user'     , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Logon Time')    , 'logon_time'  , 200, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('Serial')        , 'serial'      , 100, Grid.Number, true , false  );
            this.lockSessionGrid.addColumn( common.Util.CTR('User Name')     , 'user_name'   , 100, Grid.String, true , false  );
            this.lockSessionGrid.endAddColumns();
        }

        if( this.db_type === 'DB2' ) {
            this.activeSessionGrid2.beginAddColumns();
            this.activeSessionGrid2.addColumn(common.Util.CTR('Time')                  , 'time'                  , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('WAS')                   , 'was_name'              , 100, Grid.String, true, false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Transaction')           , 'txn_name'              , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('DB ID')                 , 'db_id'                 , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Agent ID')              , 'agent_id'              , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Agent PID')             , 'agent_pid'             , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Client PID')            , 'client_pid'            , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Primary Auth ID')       , 'primary_auth_id'       , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Execution ID')          , 'execution_id'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Appl ID')               , 'appl_id'               , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Appl Conn Time')        , 'appl_conn_time'        , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('UOW Elapse Time')       , 'uow_elapse_time'       , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Agent User CPU Time')   , 'agent_user_cpu_time'   , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Agent Sys CPU Time')    , 'agent_sys_cpu_time'    , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('STMT UID')              , 'stmt_uid'              , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('ANCH ID')               , 'anch_id'               , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('SQL Text')              , 'sql_text'              , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn('SQL Id'                , 'sql_id'                , 100, Grid.String, false , true);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Prev STMT UID')         , 'prev_stmt_uid'         , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Prev ANCH UID')         , 'prev_anch_uid'         , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Prev SQL UID')          , 'prev_sql_uid'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn('SQL ID 1'              , 'sqlid1'                , 100, Grid.String, false , true);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Appl Status')           , 'appl_status'           , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Rows Read')             , 'rows_read'             , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Rows Written')          , 'rows_written'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Rows Changed')          , 'rows_changed'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Total Sorts')           , 'total_sorts'           , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Sort Overflows')        , 'sort_over_flows'       , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Lock Escals')           , 'lock_escals'           , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('X Lock Escals')         , 'x_lock_escals'         , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Logical Reads')         , 'logical_reads'         , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Physical Reads')        , 'physical_reads'        , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Pool Temp DataReads')   , 'pool_temp_datareads'   , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Direct Reads')          , 'direct_reads'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Total Hash Joins')      , 'total_hash_joins'      , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('Horder')                , 'horder'                , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.CTR('CPU')                   , 'cpu'                   , 100, Grid.String, true , false);
            this.activeSessionGrid2.endAddColumns();

            this.lockSessionGrid2.beginAddColumns();
            this.lockSessionGrid2.addColumn(common.Util.CTR('SID')                  , 'sid'                     , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Hold Lock Type')       , 'hold_lock_type'          , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Hold Mode')            , 'hold_mode'               , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Wait Lock Type')       , 'wait_lock_type'          , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Request Mode')         , 'request_mode'            , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Object ID')            , 'object_id'               , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('SQL Text')             , 'sql_text'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Primary Auth ID')      , 'primary_auth_id'         , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Execution ID')         , 'execution_id'            , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Appl ID')              , 'appl_id'                 , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Appl Conn Time')       , 'appl_conn_time'          , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('UOW  Elapse Time')     , 'uow_elapse_time'         , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Agent User CPU Time')  , 'Agent_user_cpu_time'     , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Agent Sys CPU Time')   , 'Agent_sys_cpu_time'      , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('STMT UID')             , 'stmt_uid'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('ANCH ID')              , 'anch_id'                 , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Agent ID')             , 'agent_id'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Client PID')           , 'client_id'               , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Hold DB')              , 'hold_id'                 , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Hold SID')             , 'hold_sid'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn('SQL_ID'               , 'sql_id'                  , 100, Grid.String, false , true);
            this.lockSessionGrid2.addColumn('WAS ID'               , 'was_id'                  , 100, Grid.String, false , true);
            this.lockSessionGrid2.addColumn(common.Util.CTR('WAS Name')             , 'was_name'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn('TXN ID'               , 'txn_id'                  , 100, Grid.String, false , true);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Time')                 , 'time'                    , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('Transaction')          , 'transaction'             , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.CTR('DeadLock')             , 'deadlock'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.endAddColumns();
        }
    },


    /**
     * 지표 차트 및 Wait 정보를 보여주는 차트, 그리드 생성.
     */
    addChart: function() {
        for (var ix = 0; ix < this.chartareaList.length-1; ix++) {
            this.chartList[ix] = Ext.create('rtm.src.rtmDBMonitorChart');
            this.chartList[ix].parent = this;
            this.chartList[ix].chartIndex = ix;

            this.chartareaList[ix].add(this.chartList[ix]);

            this.chartList[ix].init();
        }

        this.statGrid = Ext.create('Exem.BaseGrid',{
            gridType      : Grid.exGrid,
            baseGridCls   : 'baseGridRTM',
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            usePager      : false,
            borderVisible : true,
            exportFileName: common.Util.TR('DB Monitor') +'-' +common.Util.CTR('Wait'),
            listeners: {
                resize: function(me, width){
                    var length = this.pnlExGrid.headerCt.items.length;
                    var w = width / length - 7;
                    for(var ix = 0; ix < length; ix++){
                        this.pnlExGrid.headerCt.items.items[ix].setWidth(w);
                    }
                }
            }
        });
        this.chartareaList[7].add(this.statGrid);
        this.statGrid.beginAddColumns();
        // 일정 주기로 업데이트 되는 Grid의 Column Width 값은 Percentage 로 설정하지 않도록 한다.
        this.statGrid.addColumn(common.Util.CTR('Wait'), 'event_name', 110,  Grid.String, true , false);
        this.statGrid.addColumn(common.Util.CTR('Value'),'__COLUMN1', 100,   Grid.Number, true , false);
        this.statGrid.endAddColumns();
    },


    /**
     * 초기 차트 데이터 설정.
     */
    initChartData: function() {
        var ix, ixLen;
        var date;

        for (ix = 0; ix < 60; ix++) {
            date = new Date(new Date(this.serverTime).getTime() - (ix * 3000));
            this.chartTimeRecord.unshift(date.getTime());
        }

        for (ix = 0, ixLen = this.chartInfo.length; ix < ixLen; ix++) {
            this.setInitStatData(this.chartInfo[ix].name);
        }

        this.redDrawChart();

        date = null;
        ix   = null;
    },


    /**
     * 지표 기본 데이터 설정.
     */
    setInitStatData: function(statName) {
        this.chartStatData[statName] = [];

        for (var jx = 0; jx < 60; jx++) {
            this.chartStatData[statName][jx] = 0;
        }
    },

    /**
     * 차트 다시 그리기
     */
    redDrawChart: function() {
        for (var ix = 0, ixLen = this.chartInfo.length; ix < ixLen; ix++) {
            if (this.chartList[ix] != null) {
                this.chartList[ix].drawData(this.chartTimeRecord, this.chartStatData[this.chartInfo[ix].name], this.chartInfo[ix].name);
            }
        }
    },


    /**
     * Stat, Event, OS Chart 데이터를 갱신
     */
    onDataChange: function(aheader, adata) {
        if (this.isWinClosed) {
            return;
        }

        var ix, ixLen, jx, jxLen;

        var data;
        var value;
        var statName;
        /*
         * 0: time
         * 1: db_id
         * 2: stat_id
         * 3: stat_name
         * 4: value
         */
        data = adata[0].rows;
        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.chartInfo.length; jx < jxLen; jx++) {
                statName = this.chartInfo[jx].name;

                if (data[ix][3] === statName) {
                    value    = Number(data[ix][4]);

                    this.chartStatData[statName].shift();
                    this.chartStatData[statName][this.chartStatData[statName].length] = value;

                    if (this.isAutoRefresh) {
                        this.chartList[jx].drawData(this.chartTimeRecord, this.chartStatData[statName], statName);
                    }
                }
            }
        }
        statName = null;

        /*
         * 0: time
         * 1: db_id
         * 2: event_id
         * 3: event_name
         * 4: value
         */
        data = adata[1].rows;
        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.chartInfo.length; jx < jxLen; jx++) {
                statName = this.chartInfo[jx].name;

                if (data[ix][3] === statName) {
                    value = Number(data[ix][4]);

                    this.chartStatData[statName].shift();
                    this.chartStatData[statName][this.chartStatData[statName].length] = value;

                    if (this.isAutoRefresh) {
                        this.chartList[jx].drawData(this.chartTimeRecord, this.chartStatData[statName], statName);
                    }
                }
            }
        }
        statName = null;

        /*
         * 0: time
         * 1: cpu
         * 2: free_memory
         */
        data = adata[2].rows;
        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.chartInfo.length; jx < jxLen; jx++) {
                statName = this.chartInfo[jx].name;

                if (statName === 'cpu') {
                    value = Number(data[ix][1]);
                    this.chartStatData[statName].shift();
                    this.chartStatData[statName][this.chartStatData[statName].length] = value;

                    if (this.isAutoRefresh) {
                        this.chartList[jx].drawData(this.chartTimeRecord, this.chartStatData[statName], statName);
                    }

                } else if (statName === 'free_memory') {
                    value = Number(data[ix][2]);
                    this.chartStatData[statName].shift();
                    this.chartStatData[statName][this.chartStatData[statName].length] = value;

                    if (this.isAutoRefresh) {
                        this.chartList[jx].drawData(this.chartTimeRecord, this.chartStatData[statName], statName);
                    }
                }
            }
        }
        statName = null;
        data     = null;
        value    = null;

        adata         = null;
    },


    /**
     * Wait Data - Grid & Chart
     */
    onWaitData: function(aHeader, aData) {
        if (this.statGrid == null) {
            return;
        }
        var ix, ixLen;
        var data  = aData[0].rows;
        var value;

        if (this.isAutoRefresh) {
            this.statGrid.clearRows();

            if (this.statGrid.pnlExGrid.headerCt == null) {
                return;
            }

            for (ix = 0, ixLen = data.length; ix < ixLen; ix++ ) {
                this.statGrid.addRow([
                    data[ix][3],    // event_name
                    data[ix][4]     //__COLUMN1
                ]);
            }

            this.statGrid.drawGrid();
        }

        data = aData[1].rows;
        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            value = Number(data[ix][2]);
            this.chartStatData.Wait.shift();
            this.chartStatData.Wait[this.chartStatData.Wait.length] = value;

            if (this.isAutoRefresh) {
                this.chartList[3].drawData(this.chartTimeRecord, this.chartStatData.Wait, 'Wait');
            }
        }

        data     = null;
        value    = null;
        aData[0].rows = null;
        aData[0]      = null;
        aData[1].rows = null;
        aData[1]      = null;
        aData         = null;
    },


    /**
     * Active Session 또는 Lock Session List
     */
    onDataFixed: function(aHeader, aData) {
        if (!this.targetGrid) {
            return;
        }

        var data;
        var commandType;
        var ix, ixLen, k;

        switch (aHeader.command) {
            case this.sql.activeSession:
                data = aData.rows;
                this.targetGrid.clearRows();

                if(this.DBSessionTab.getActiveTab().title !== this.string_Active_Session_List){
                    return;
                }

                for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                    commandType = common.DataModule.referenceToDB.OracleCommandType[data[ix][22]];

                    if (this.excludeCheckBox.getValue() === true) {
                        if (data[ix][34] !== 'BACKGROUND') {

                            this.targetGrid.addRow([
                                data[ix][0],        // time
                                data[ix][37],       // was name
                                data[ix][39],       // tramsaction
                                data[ix][1],        // schema
                                data[ix][2],        // program
                                data[ix][3],        // Module
                                data[ix][4],        // SID
                                data[ix][5],        // SPID
                                data[ix][6],        // Serial
                                data[ix][7],        // Status
                                data[ix][8],        // Wait
                                data[ix][9],        // SQL Text
                                data[ix][10],       // Elapse Time
                                data[ix][11],       // PGA(MB)
                                data[ix][12],       // Logical Reads
                                data[ix][13],       // Physical Reads
                                data[ix][14],       // Block Change
                                data[ix][15],       // Executions
                                data[ix][16],       // Hard Parse Count
                                data[ix][17],       // Parse Count Total
                                data[ix][18],       // Openend Cursors current
                                data[ix][28],       // unDo Blocks
                                data[ix][29],       // undo Records
                                data[ix][21],       // Undo seq.Id
                                commandType,        // command type
                                data[ix][23],       // Action
                                data[ix][24],       // Logical Reads(sigma)
                                data[ix][25],       // Physical Reads(sigma)
                                data[ix][26],       // Block Changes(sigma)
                                data[ix][27],       // Execute Count(sigma)
                                data[ix][28],       // Undo Blocks (singma)
                                data[ix][29],       // Undo Records(sigma)
                                data[ix][30],       // Machine
                                data[ix][31],       // OS User
                                data[ix][32],       // Logon Time
                                data[ix][33],       // Client Info
                                data[ix][34]        // session_type
                            ]);
                        }
                    } else {
                        this.targetGrid.addRow([
                            data[ix][0],        // time
                            data[ix][37],       // was name
                            data[ix][39],       // tramsaction
                            data[ix][1],        // schema
                            data[ix][2],        // program
                            data[ix][3],        // Module
                            data[ix][4],        // SID
                            data[ix][5],        // SPID
                            data[ix][6],        // Serial
                            data[ix][7],        // Status
                            data[ix][8],        // Wait
                            data[ix][9],        // SQL Text
                            data[ix][10],       // Elapse Time
                            data[ix][11],       // PGA(MB)
                            data[ix][12],       // Logical Reads
                            data[ix][13],       // Physical Reads
                            data[ix][14],       // Block Change
                            data[ix][15],       // Executions
                            data[ix][16],       // Hard Parse Count
                            data[ix][17],       // Parse Count Total
                            data[ix][18],       // Openend Cursors current
                            data[ix][28],       // unDo Blocks
                            data[ix][29],       // undo Records
                            data[ix][21],       // Undo seq.Id
                            commandType,        // command type
                            data[ix][23],       // Action
                            data[ix][24],       // Logical Reads(sigma)
                            data[ix][25],       // Physical Reads(sigma)
                            data[ix][26],       // Block Changes(sigma)
                            data[ix][27],       // Execute Count(sigma)
                            data[ix][28],       // Undo Blocks (singma)
                            data[ix][29],       // Undo Records(sigma)
                            data[ix][30],       // Machine
                            data[ix][31],       // OS User
                            data[ix][32],       // Logon Time
                            data[ix][33],       // Client Info
                            data[ix][34]        // session_type
                        ]);
                    }

                    // 명시적 해제
                    for(k = data[ix].length -1; k > -1 ; --k ) {
                        data[ix][k] = null;
                    }
                    data[ix].length =0;

                }
                this.targetGrid.drawGrid();

                aData.rows.length =0;
                aData.rows = null;
                aData      = null;

                break;
            case this.sql.lockSession :
                // Lock Session List Parent Data
                data = aData[0].rows;
                this.targetTree.clearNodes();
                this.targetTree.beginTreeUpdate();

                var holdMode;

                for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                    holdMode = common.DataModule.referenceToDB.lockType[data[ix][ 3]];

                    this.lockSessionGrid.addNode(null,[
                        data[ix][0],                                                    //'hold_sid'
                        data[ix][1],                                                    //'spid'
                        data[ix][2],                                                    //'h_lock_type'
                        holdMode,                                                       //'hold_mode'
                        '--',                                                           //'lock_type'
                        '--',                                                           //'req_mode'
                        data[ix][4],                                                    //'object_id'
                        data[ix][5],                                                    //'status'
                        data[ix][6],                                                    //'wait'
                        data[ix][7],                                                    //'sql_text'
                        data[ix][8],                                                    //'elapse_time'
                        data[ix][20],                                                   //'was_name'
                        data[ix][23],                                                   //'txn_name'
                        data[ix][9],                                                    //'program'
                        data[ix][10],                                                   //'MODULE'
                        data[ix][11],                                                   //'action'
                        data[ix][12],                                                   //'SCHEMA'
                        data[ix][13],                                                   //'machine'
                        data[ix][14],                                                   //'os_user'
                        data[ix][15],                                                   //'logon_time'
                        data[ix][16],                                                   //'serial'
                        data[ix][17]                                                    //'user_name'
                    ]);

                    // 명시적 해제
                    for(k = data[ix].length -1; k > -1 ; --k ) {
                        data[ix][k] = null;
                    }
                    data[ix].length =0;
                }

                if (this.DBSessionTab.getActiveTab().title !== this.string_Lock_Session_List ) {

                    this.targetTree.endTreeUpdate();
                    return;
                }

                this.targetTree.drawTree();
                this.targetTree.endTreeUpdate();

                // Lock Session List Child Data
                data = aData[1].rows;
                this.targetTree.beginTreeUpdate() ;

                var requestMode;
                var waitSid;
                var holdSid;
                var child;
                var node;
                var deadLockNode;

                for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                    holdSid = data[ix][21] ;
                    node =  this.targetTree.findNode( 'hold_sid', holdSid );

                    //sid를 모르는것으로 판단!
                    if (node == null && (( holdSid !== 0 ) || ( holdSid !== -1 ))) {
                        this.targetTree.addNode(null, [ data[ix][0] ]) ;
                    }
                    waitSid = data[ix][0] ;
                    child = this.lockSessionGrid.findNode( 'hold_sid', waitSid ) ;

                    requestMode = common.DataModule.referenceToDB.lockType[data[ix][ 5]];

                    //holder가 없으면 waiter만이라도 add한다.
                    if (child == null) {
                        if (( holdSid == 0 ) || ( holdSid == -1 )) {
                            this.targetTree.addNode( null, [
                                data[ix][ 0],                                          //wait sid
                                data[ix][ 1],                                          //spid
                                '--'        ,                                          //hold lock type
                                '--'        ,                                          //hold mode
                                data[ix][ 4],                                          //wait lock type
                                requestMode,                                           //request mode
                                data[ix][ 6],                                           //obj id
                                data[ix][ 7],                                           //status
                                data[ix][ 8],                                           //wait
                                data[ix][ 9],                                           //sql_text
                                data[ix][10],                                           //elapse_time
                                data[ix][25],                                           //was_name elapse_time10
                                data[ix][27],                                           //txn_name program11
                                data[ix][11],                                           //program
                                data[ix][12],                                           //modual
                                data[ix][13],                                           //action
                                data[ix][14],                                           //schema
                                data[ix][15],                                           //machine
                                data[ix][16],                                           //os user
                                data[ix][17],                                           //logon time
                                data[ix][18],                                           //serial
                                data[ix][19]                                            //user name

                            ] ) ;
                        }else{
                            this.targetTree.addNode( node, [
                                data[ix][ 0],                                           //wait sid
                                data[ix][ 1],                                           //spid
                                '--'        ,                                           //hold lock type
                                '--'        ,                                           //hold mode
                                data[ix][ 4],                                           //wait lock type
                                requestMode,                                            //request mode
                                data[ix][ 6],                                           //obj id
                                data[ix][ 7],                                           //status
                                data[ix][ 8],                                           //wait
                                data[ix][ 9],                                           //sql_text
                                data[ix][10],                                           //elapse_time
                                data[ix][25],                                           //was_name
                                data[ix][27],                                           //txn_name
                                data[ix][11],                                           //program
                                data[ix][12],                                           //modual
                                data[ix][13],                                           //action
                                data[ix][14],                                           //schema
                                data[ix][15],                                           //machine
                                data[ix][16],                                           //os user
                                data[ix][17],                                           //logon time
                                data[ix][18],                                           //serial
                                data[ix][19]                                            //user name
                            ] ) ;
                        }
                    } else {
                        deadLockNode =  this.targetTree.findNode( 'hold_sid', holdSid ) ;
                        if (deadLockNode == null) {
                            if (node != null && child != null) {
                                this.targetTree.moveNode( node, child ) ;
                            }
                        }else{
                            //deadlock detected
//                            child.raw.hold_sid = '1'
                            child.hold_sid = '1';
                            this.targetTree.addNode( child,  [
                                data[ix][ 0],                                           //wait sid
                                data[ix][ 1],                                           //spid
                                '--'        ,                                           //hold lock type
                                '--'        ,                                           //hold mode
                                data[ix][ 4],                                           //wait lock type
                                requestMode,                                            //request mode
                                data[ix][ 6],                                            //obj id
                                data[ix][ 7],                                            //status
                                data[ix][ 8],                                            //wait
                                data[ix][ 9],                                            //sql_text
                                data[ix][10],                                            //elapse_time
                                data[ix][25],                                            //was_name
                                data[ix][27],                                            //txn_name
                                data[ix][11],                                            //program
                                data[ix][12],                                            //modual
                                data[ix][13],                                            //action
                                data[ix][14],                                            //schema
                                data[ix][15],                                            //machine
                                data[ix][16],                                            //os user
                                data[ix][17],                                            //logon time
                                data[ix][18],                                            //serial
                                data[ix][19]                                             //user name
                            ] ) ;
                        }
                    }

                    // 명시적 해제
                    for(k = data[ix].length -1; k > -1 ; --k ) {
                        data[ix][k] = null;
                    }
                    data[ix].length =0;

                }

                this.targetTree.drawTree();
                this.targetTree.endTreeUpdate();

                node    = null;
                child   = null;
                holdSid = null;
                deadLockNode = null;
                requestMode  = null;
                waitSid      = null;

                aData[0].rows.length =0;
                aData[0].rows = null;
                aData[0]      = null;
                aData[1].rows.length =0;
                aData[1].rows = null;
                aData[1]      = null;
                aData         = null;

                break;

            default:
                break;
        }

        data = null;
        commandType = null;
    }
});