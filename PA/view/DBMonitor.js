Ext.define("view.DBMonitor", {
    extend: 'Exem.Window',
    title: common.Util.TR('DB Monitor'),
    width: 1000,
    height: 680,
    layout: 'fit',
    plain: false,
    minWidth: 600,
    // onEsc: Ext.emptyFn,
    minHeight: 400,
    intervalTime: 3000,
    closeAction: 'destroy',
    // checkbobox를 만들기위한 이름이 저장됨 obj array
    statChangeList: { Stat: [], Event: [], OS: [] },
    // combobox의 dataList가 저장됨 obj array
    statSearchData : { Stat: [], Event: [], OS: [] },
    listeners: {
        beforedestroy: function() {
            var self = this;
            if (self.timeOut){
                clearTimeout(self.timeOut);
            }
        },
        close: function() {
            this.parent.dbmonitor_release();
        }
    },
    parent: null,

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
        // 스탯 리스트  얻어오는 쿼리
        stat               : 'IMXPA_DBTrend_StatChange_s.sql',
        // 이벤트 리스트 얻어오는 쿼리
        event              : 'IMXPA_DBTrend_StatChange_w.sql',

        // 실시간 차트옹 stat value
        statValue          : 'IMXRT_DBMonitor_StatValue.sql',
        // 실시간 차트용 event value
        eventValue         : 'IMXRT_DBMonitor_eventValue.sql',
        // 실시간 차트용 freememory를 그리는 쿼리
        OS                 : 'IMXRT_DBMonitor_OS.sql',

        // 실시칸 차트 wait
        waitChart          : 'IMXRT_DBMonitor_Wait_chart.sql',
        // 그리드 한개 짜리 wait value
        waitValueGrid      : 'IMXRT_DBMonitor_WaitValue_grid.sql',

        activeSession      : 'IMXRT_DBMonitor_ActiveSessionList.sql',
        lockSessionParent  : 'IMXRT_DBMonitor_LockSessionList_parent.sql',
        lockSessionChild   : 'IMXRT_DBMonitor_LockSessionList_child.sql',

        serverTime         : 'IMXRT_DBMonitor_serverTime.sql'
    },
    // stat 쿼리 replace string 만들기위한 array
    statNames:  [],
    // event 쿼리 replace string 만들기위한 array
    eventNames: [],

    clickedTitlePanel: null,

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(db_id) {
        this.db_id = db_id;
        this.db_type = Comm.dbInfoObj[this.db_id].db_type;

        this.setTitle(common.Util.TR('DB Monitor') + '  ' + '['+Comm.dbInfoObj[this.db_id].instanceName + ']');

        this.chartareaList = [];
        this.chartList     = [];

        this.targetGrid = null;
        this.targetTree = null;

        this.addMainWindowItems();

        this.addLineItem(this.chartFirstLine , 0, 3);
        this.addLineItem(this.chartSeconLine , 4, 7 );
        this.makeGridColumn();
        this.makeReplaceString();
        this.addChart();

        this.addChartseries();

        // statList 가져오기
        this.exeSQL(this.sql.stat, [{ name : 'db_id',value: this.db_id, type: SQLBindType.INTEGER}], this.onDataStatEventOsList, this);
        // eventList 가져오기
        this.exeSQLRepaceString(this.sql.event, [{ name : 'db_id',value: this.db_id, type: SQLBindType.INTEGER}], {name: 'IDLE_EVENT', value: common.DataModule.referenceToDB.eventName}, this.onDataStatEventOsList, this);
        // os list 가져오기
        this.exeSQL(this.sql.OS , [{ name : 'db_id',value: this.db_id, type: SQLBindType.INTEGER}], this.onDataStatEventOsList, this);

        //StatChange Window 생성
        this.createStatChangeWindow();

        this.show();

        // GET SERVER TIME
        this.GetServerTime();
    },

    GetServerTime: function() {
        var self = this;

        WS.SQLExec({
            sql_file: this.sql.serverTime,
            bind: [{
                name: 'db_id',
                type: SQLBindType.INTEGER,
                value: this.db_id
            }]
        }, function(aheader, adata) {
            if (!self.initTime) {
                self.initTime = [];
            }
            self.serverTime = adata.rows[0][0];
            for (var ix = 60; ix > 0; ix--) {
                self.initTime.push(new Date(self.serverTime).getTime() - (ix*3*1000));
            }
            self.startInterval();
        }, this);
    },

    addLineItem: function(targetArea, start, end) {
        var self       = this;

        var chartId    = null;
        var chartPanel = null;

        for (var ix = start; ix <= end; ix++) {
            chartId = Ext.id();
            if (ix != 7) {
                chartPanel = Ext.create('Ext.panel.Panel',{
                    title  : self.chartInfo[ix].name,
                    flex   : 1,
                    id     : chartId,
                    _info  : self.chartInfo[ix],
                    _index : ix,
                    layout :'fit',
                    padding: '2 2 2 2',
                    height : '100%',
                    minHeight: 30
                });
                if (ix != 3) {
                    // index 가 3 WAIT차트 패널을 제외하고 리스너 달기.
                    chartPanel.addListener('afterrender',function() {
                        var header = this.getHeader() ;
                        // header에 mouse over 시 포인터 변경
                        header.getEl().on('mouseover', function() {
                            header.getEl().setStyle({'cursor': 'pointer'});
                        });
                        // 더블클릭 이벤트
                        header.addListener('click', function( header ) {
                            self.clickedTitlePanel = header.up();
                            var type = self.clickedTitlePanel._info.type;
                            var _type ;
                            switch( type ){
                                case 'Stat' : _type = StatChange.stat ;
                                    break ;
                                case 'Event': _type = StatChange.wait ;
                                    break ;
                                case 'Ratio': _type = StatChange.ratio ;
                                    break ;
                                case 'OS'   : _type = StatChange.osstat ;
                                    break ;
                                default :
                                    break;
                            }
                            self.stat_change.selectValue( _type, self.clickedTitlePanel.title ) ;
                            self.stat_change.show();
                            type = null ;
                            _type = null ;
                        });
                    });
                }
            } else {
                chartPanel = Ext.create('Ext.panel.Panel',{
                    flex   : 1,
                    id     : chartId,
                    layout :'fit',
                    padding: '2 2 2 2',
                    height : '100%',
                    minHeight: 30
                });
            }

            targetArea.add(chartPanel);
            this.chartareaList.push(chartPanel);
        }
    },

    addMainWindowItems: function() {
        var self = this;
        var windowBackground = Ext.create('Ext.container.Container',{
            flex   : 1,
            layout : 'border'
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
            boxLabel  : common.Util.TR('Auto Refresh'),
            checked   : true,
            listeners : {
                change: function() {
                    if (this.checked) {
                        self.stopInterval();
                        self.startInterval();
                    }else {
                        self.stopInterval();
                    }
                }
            }
        });

        this.DBchartArea = Ext.create('Ext.panel.Panel',{
            width : '100%',
            height: 400,
            region: 'north',
            split : true,
            flex  : 1,
            layout: { type: 'vbox', align: 'stretch'},
            items : [this.chartFirstLine, this.chartSeconLine],
            tbar  : [{ xtype: 'tbfill'}, this.refreshCheckBox],
            minHeight: 100
        });


        switch (this.db_type) {
            case 'ORACLE':
                this.activeSessionGrid  =  Ext.create('Exem.BaseGrid',{
                    gridType   : Grid.exGrid,
                    usePager   : false,
                    localeType : 'H:i:s'
                });
                this.lockSessionGrid    = this.createGrid(Grid.exTree);
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
            default :
                break;
        }


        this.DBSessionTab = Ext.create('Ext.tab.Panel',{
            width : '100%',
            region: 'center',
            height: 400,
            split : true,
            minHeight: 100,
            items: [{
                title : common.Util.TR('Active Session List'),
                layout: 'fit',
                items : [this.activeSessionGrid],
                showCheckbox: true
            },{
                title : common.Util.TR('Lock Session List'),
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
                    this.getActiveTab().showCheckbox ?  self.excludeCheckBox.setVisible(true) : self.excludeCheckBox.setVisible(false);
                }
            }
        });

        // Exclude Background
        self.excludeCheckBox = Ext.create('Ext.form.field.Checkbox',{
            boxLabel  : common.Util.TR('Exclude Background'),
            checked   : false,
            margin    : '0 5 0 0'
        });

        this.DBSessionTab.getTabBar().add({xtype: 'tbspacer', flex: 1});
        this.DBSessionTab.getTabBar().add(self.excludeCheckBox);

        windowBackground.add(this.DBchartArea);
        windowBackground.add(this.DBSessionTab);

        this.add(windowBackground);
    },

    startInterval: function() {
        var self = this;

        this.timeOut = setInterval(function() {
            // 그리드 데이터
            self.exeSQL(
                self.sql.waitValueGrid,
                [{
                    name: 'db_id',
                    type: SQLBindType.INTEGER,
                    value: self.db_id
                }, {
                    name: 'server_time',
                    type: SQLBindType.STRING,
                    value: self.serverTime
                }],
                self.onDataFixed,
                self
            );

            // WAIT CHART
            self.exeSQLRepaceString(
                self.sql.waitChart,
                [{
                    name: 'db_id',
                    type: SQLBindType.INTEGER,
                    value: self.db_id
                }, {
                    name: 'server_time',
                    type: SQLBindType.STRING,
                    value: self.serverTime
                }],
                {
                    name: 'IDLE_EVENT',
                    value: common.DataModule.referenceToDB.eventName
                },
                self.onDataFixed,
                self
            );

            // OS TYPE
            self.exeSQL(
                self.sql.OS,
                [{
                    name: 'db_id',
                    type: SQLBindType.INTEGER,
                    value: self.db_id
                }, {
                    name: 'server_time',
                    type: SQLBindType.STRING,
                    value: self.serverTime
                }],
                self.onDataChange,
                self
            );

            // STAT TYPE
            self.exeSQLRepaceString(
                self.sql.statValue,
                [{
                    name: 'db_id',
                    type: SQLBindType.INTEGER,
                    value: self.db_id
                }, {
                    name: 'server_time',
                    type: SQLBindType.STRING,
                    value: self.serverTime
                }], {
                    name: 'stat_name',
                    value: self.statNames
                },
                self.onDataChange,
                self
            );

            // EVENT TYPE
            self.exeSQLRepaceString(
                self.sql.eventValue,
                [{
                    name: 'db_id',
                    type: SQLBindType.INTEGER,
                    value: self.db_id
                }, {
                    name: 'server_time',
                    type: SQLBindType.STRING,
                    value: self.serverTime
                }],
                {
                    name: 'IDLE_EVENT',
                    value: self.eventNames
                },
                self.onDataChange,
                self
            );

            self.exeSQLBottomGrid(self.sql.activeSession, [{name: 'db_id', value: self.db_id, type: SQLBindType.INTEGER}, {
                name: 'server_time',
                type: SQLBindType.STRING,
                value: self.serverTime
            }], self.onDataFixed, self);
            self.exeSQLBottomGrid(self.sql.lockSessionParent, [{name: 'db_id', value: self.db_id, type: SQLBindType.INTEGER}, {
                name: 'server_time',
                type: SQLBindType.STRING,
                value: self.serverTime
            }], self.onDataFixed, self);
            self.exeSQLBottomGrid(self.sql.lockSessionChild, [{name: 'db_id', value: self.db_id, type: SQLBindType.INTEGER}, {
                name: 'server_time',
                type: SQLBindType.STRING,
                value: self.serverTime
            }], self.onDataFixed, self);
        }, this.intervalTime);
    },

    stopInterval: function() {
        var self = this;
        if(self.timeOut){
            clearTimeout(self.timeOut);
        }
    },

    createGrid:function(type) {
        var _grid = Ext.create('Exem.BaseGrid',{
            gridType : type,
            usePager : false
        });
        return _grid;
    },



    createStatChangeWindow: function(){
        var self = this ;

        this.stat_change = Ext.create('Exem.StatChangeWindow',{
            instanceId: this.db_id,
            useTab: {
                stat   : true,
                wait   : true,
                ratio  : true,
                osstat : true
            },
            okFn: function( type, name ){
                console.debug('선택된 타입??', type);
                console.debug('선택된 이름??', name);


                var _type ;
                switch (type) {
                    case 0:
                        _type = 'Stat';
                        break;
                    case 1:
                        _type = 'Event';
                        break;
                    case 3:
                        _type = 'OS';
                        break;
                    default :
                        break;
                }
                if (name == self.clickedTitlePanel.title) {
                    Ext.Msg.show({
                        title  : common.Util.TR('Confirmation'),
                        msg    : msgName + ' ' + common.Util.TR('Already exists'),
                        buttons: Ext.Msg.OK,
                        icon   : Ext.MessageBox.INFO
                    });
                } else {
                    self.chartInfo[self.clickedTitlePanel._index].name = name;
                    self.chartInfo[self.clickedTitlePanel._index].type = _type;
                    self.clickedTitlePanel.setTitle(name);
                    self.chartList[self.clickedTitlePanel._index].clearValues();
                    self.chartList[self.clickedTitlePanel._index].initData(+new Date(), self.intervalTime, 0, 0);
                    self.chartList[self.clickedTitlePanel._index].plotDraw();
                    self.makeReplaceString();
                    self.stat_change.hide() ;
                }

            }
        }) ;
        this.stat_change.init() ;
    } ,


    // STAT 과 EVENT NAME Replace String 만들기.
    makeReplaceString: function() {
        this.statNames   = null;
        this.eventNames  = null;
        this.statNames = [];
        this.eventNames  = [];
        for (var ix = 0; ix < this.chartInfo.length; ix++) {
            if (this.chartInfo[ix].type == 'Stat') {
                this.statNames.push( '\''+ this.chartInfo[ix].name+'\'');
            } else if (this.chartInfo[ix].type == 'Event') {
                this.eventNames.push( '\''+this.chartInfo[ix].name+'\'' );
            }
        }
        this.statNames  = this.statNames.join();
        this.eventNames = this.eventNames.join();
    },

    exeSQL : function (SQL, bindInfo, ondataFunction, scope) {
        var sql_Text_dataset = {};
        sql_Text_dataset.sql_file = SQL ;
        sql_Text_dataset.bind = bindInfo;
        WS.SQLExec(sql_Text_dataset, ondataFunction, scope);
    },

    exeSQLBottomGrid : function (SQL, bindInfo, ondataFunction, scope) {
        var sql_Text_dataset = {};
        sql_Text_dataset.sql_file = SQL ;
        sql_Text_dataset.bind = bindInfo;
        WS.SQLExec(sql_Text_dataset, ondataFunction, scope);
    },

    exeSQLRepaceString: function(SQL, bindInfo, replace, ondataFunction, scope) {
        var sql_Text_dataset = {};
        sql_Text_dataset.sql_file = SQL ;
        sql_Text_dataset.bind =  bindInfo;
        sql_Text_dataset.replace_string = [replace];
        WS.SQLExec( sql_Text_dataset, ondataFunction, scope ) ;
    },

    makeGridColumn: function() {
        if (this.db_type == 'ORACLE') {
            this.activeSessionGrid.beginAddColumns();
            this.activeSessionGrid.addColumn(common.Util.TR('Time')                  , 'time'                  , 80, Grid.DateTime, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('WAS')                   , 'was_name'              , 100, Grid.String, false, false);
            this.activeSessionGrid.addColumn(common.Util.TR('Transaction')           , 'txn_name'              , 200, Grid.String, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Schema')                , 'SCHEMA'                , 100, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Program')               , 'program'               , 100, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Module')                , 'MODULE'                , 100, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('SID')                   , 'sid'                   , 100, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('SPID')                  , 'spid'                  , 100, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Serial')                , 'serial'                , 100, Grid.String, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Status')                , 'status'                , 100, Grid.String, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Wait')                  , 'wait'                  , 500, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('SQL Text')              , 'sql_text'              , 500, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Elapse Time')           , 'last_call_et'          , 100, Grid.Number, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('PGA(MB)')               , 'pga'                   , 100, Grid.Float, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Logical Reads')         , 'logical_reads'         , 100, Grid.Number, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Physical Reads')        , 'physical_reads'        , 100, Grid.Number, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Block Changes')         , 'db_block_change'       , 100, Grid.Number, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Executions')            , 'executions'            , 100, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Hard Parse Count')      , 'parse_count_hard'      , 150, Grid.Number, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Parse Count Total')     , 'parse_count_total'     , 150, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Opened Cursors Current'), 'opened_cursors_current', 150, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Undo Blocks')           , 'Undo Blocks'           , 100, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Undo Records')          , 'Undo Records'          , 100, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Undo Seq. ID')          , 'Undo Seq_ID'           , 100, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Command Type')          , 'command_type'          , 100, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Action')                , 'action'                , 100, Grid.String, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Logical Reads (Sigma)')  , 'Logical Reads(Sigma)'  , 150, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Physical Reads (Sigma)') , 'Physical Reads(Sigma)' , 150, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Block Changes (Sigma)')  , 'Block Change (Sigma)'  , 150, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Execute Count (Sigma)')  , 'Exection (Sigma)'      , 150, Grid.Number, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Undo Blocks (Sigma)')    , 'Undo Blocks (Sigma)'   , 150, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Undo Record (Sigma)')    , 'Undo Records (Sigma)'  , 150, Grid.Number, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Machine')               , 'machine'               , 100, Grid.String, true , false);
            this.activeSessionGrid.addColumn(common.Util.TR('OS User')               , 'os_user'               , 100, Grid.String, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Logon Time')            , 'logon_time'            , 80, Grid.DateTime, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Client Info')           , 'client_info'           , 100, Grid.String, false , false);
            this.activeSessionGrid.addColumn(common.Util.TR('Session Type')          , 'session_type'          , 100, Grid.String, false , false);
            this.activeSessionGrid.endAddColumns();


            this.lockSessionGrid.beginAddColumns();
            this.lockSessionGrid.addColumn( common.Util.TR('SID')           , 'hold_sid'    , 100, Grid.String, true , false , 'treecolumn' );
            this.lockSessionGrid.addColumn( common.Util.TR('SPID')          , 'spid'        , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Hold Lock Type'), 'h_lock_type' , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Hold Mode')     , 'hold_mode'   , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Wait Lock Type'), 'lock_type'   , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Request Mode')  , 'req_mode'    , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Object ID')     , 'object_id'   , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Status')        , 'status'      , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Wait')          , 'wait'        , 300, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('SQL Text')      , 'sql_text'    , 500, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Elapse Time')   , 'elapse_time' , 100, Grid.Float , true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('WAS')           , 'was_name'    , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Transaction')   , 'txn_name'    , 300, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Program')       , 'program'     , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Module')        , 'MODULE'      , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Action')        , 'action'      , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Schema')        , 'SCHEMA'      , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Machine')       , 'machine'     , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('OS User')       , 'os_user'     , 100, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Logon Time')    , 'logon_time'  , 200, Grid.String, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('Serial')        , 'serial'      , 100, Grid.Number, true , false  );
            this.lockSessionGrid.addColumn( common.Util.TR('User Name')     , 'user_name'   , 100, Grid.String, true , false  );
            this.lockSessionGrid.endAddColumns();
        }

        if( this.db_type == 'DB2' ) {
            this.activeSessionGrid2.beginAddColumns();
            this.activeSessionGrid2.addColumn(common.Util.TR('Time')                  , 'time'                  , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('WAS')                   , 'was_name'              , 100, Grid.String, true, false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Transaction')           , 'txn_name'              , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('DB ID')                 , 'db_id'                 , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Agent ID')              , 'agent_id'              , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Agent PID')             , 'agent_pid'             , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Client PID')            , 'client_pid'            , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Primary Auth ID')       , 'primary_auth_id'       , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Execution ID')          , 'execution_id'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Appl ID')               , 'appl_id'               , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Appl Conn Time')        , 'appl_conn_time'        , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('UOW Elapse Time')       , 'uow_elapse_time'       , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Agent User CPU Time')   , 'agent_user_cpu_time'   , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Agent Sys CPU Time')    , 'agent_sys_cpu_time'    , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('STMT UID')              , 'stmt_uid'              , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('ANCH ID')               , 'anch_id'               , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('SQL Text')              , 'sql_text'              , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn('SQL Id'                , 'sql_id'                , 100, Grid.String, false , true);
            this.activeSessionGrid2.addColumn(common.Util.TR('Prev STMT UID')         , 'prev_stmt_uid'         , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Prev ANCH UID')         , 'prev_anch_uid'         , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Prev SQL UID')          , 'prev_sql_uid'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn('SQL ID 1'              , 'sqlid1'                , 100, Grid.String, false , true);
            this.activeSessionGrid2.addColumn(common.Util.TR('Appl Status')           , 'appl_status'           , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Rows Read')             , 'rows_read'             , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Rows Written')          , 'rows_written'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Rows Changed')          , 'rows_changed'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Total Sorts')           , 'total_sorts'           , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Sort Overflows')        , 'sort_over_flows'       , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Lock Escals')           , 'lock_escals'           , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('X Lock Escals')         , 'x_lock_escals'         , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Logical Reads')         , 'logical_reads'         , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Physical Reads')        , 'physical_reads'        , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Pool Temp DataReads')   , 'pool_temp_datareads'   , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Direct Reads')          , 'direct_reads'          , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Total Hash Joins')      , 'total_hash_joins'      , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('Horder')                , 'horder'                , 100, Grid.String, true , false);
            this.activeSessionGrid2.addColumn(common.Util.TR('CPU')                   , 'cpu'                   , 100, Grid.String, true , false);
            this.activeSessionGrid2.endAddColumns();

            this.lockSessionGrid2.beginAddColumns();
            this.lockSessionGrid2.addColumn(common.Util.TR('SID')                  , 'sid'                     , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Hold Lock Type')       , 'hold_lock_type'          , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Hold Mode')            , 'hold_mode'               , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Wait Lock Type')       , 'wait_lock_type'          , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Request Mode')         , 'request_mode'            , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Object ID')            , 'object_id'               , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('SQL Text')             , 'sql_text'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Primary Auth ID')      , 'primary_auth_id'         , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Execution ID')         , 'execution_id'            , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Appl ID')              , 'appl_id'                 , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Appl Conn Time')       , 'appl_conn_time'          , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('UOW  Elapse Time')     , 'uow_elapse_time'         , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Agent User CPU Time')  , 'Agent_user_cpu_time'     , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Agent Sys CPU Time')   , 'Agent_sys_cpu_time'      , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('STMT UID')             , 'stmt_uid'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('ANCH ID')              , 'anch_id'                 , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Agent ID')             , 'agent_id'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Client PID')           , 'client_id'               , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Hold DB')              , 'hold_id'                 , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Hold SID')             , 'hold_sid'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn('SQL_ID'               , 'sql_id'                  , 100, Grid.String, false , true);
            this.lockSessionGrid2.addColumn('WAS ID'               , 'was_id'                  , 100, Grid.String, false , true);
            this.lockSessionGrid2.addColumn(common.Util.TR('WAS Name')             , 'was_name'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn('TXN ID'               , 'txn_id'                  , 100, Grid.String, false , true);
            this.lockSessionGrid2.addColumn(common.Util.TR('Time')                 , 'time'                    , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('Transaction')          , 'transaction'             , 100, Grid.String, true , false);
            this.lockSessionGrid2.addColumn(common.Util.TR('DeadLock')             , 'deadlock'                , 100, Grid.String, true , false);
            this.lockSessionGrid2.endAddColumns();
        }
    },

    createChart:function() {
        var flowChart = Ext.create('Exem.chart.CanvasChartLayer',{
            titleBackgroundColor:'#E3EAF1',
            showTooltip   : true,
            dataBufferSize: 60,
            chartProperty : {
                xaxis: true,
                timeformat: '%M:%S',
                yLabelFont: {size: 8, color: 'black'},
                xLabelFont: {size: 8, color: 'black'}
            }
        });
        return flowChart;
    },

    addChart:function() {
        var self = this;
        var createdChart = null;

        for (var ix = 0; ix < self.chartareaList.length-1; ix++) {
            createdChart = self.createChart();
            self.chartareaList[ix].add(createdChart);
            self.chartList.push(createdChart);
            createdChart.plotDraw();
        }


        self.statGrid = self.createGrid(Grid.exGrid);
        self.chartareaList[7].add(self.statGrid);
        self.statGrid.beginAddColumns();
        self.statGrid.addColumn(common.Util.TR('Wait'), 'event_name', '48%',  Grid.String, true , false);
        self.statGrid.addColumn(common.Util.TR('Value'),'__COLUMN1', '48%',   Grid.Number, true , false);
        self.statGrid.endAddColumns();
    },

    onDataChange: function(aheader, adata) {
        var self = this ;
        var ix, jx;

        if (adata.rows.length > 0) {
            //1503.31 원래로직대로 하면 serverTime이 자꾸 줄어든다. 쿼리재조회해서 현재 maxserverTime 가져오도록 변경 by박유선대리(min)
            WS.SQLExec({
                sql_file: this.sql.serverTime,
                bind: [{
                    name: 'db_id',
                    type: SQLBindType.INTEGER,
                    value: this.db_id
                }]
            }, function(aheader, adata) {
                self.serverTime = adata.rows[0][0];

            }, this);
        }

        switch (aheader.command) {
            case 'IMXRT_DBMonitor_StatValue.sql':
                for ( ix = 0; ix < adata.rows.length; ix++) {
                    for ( jx = 0; jx < this.chartInfo.length; jx++) {
                        if (adata.rows[ix][3] == this.chartInfo[jx].name) {
                            this.chartList[jx].addValue(0, [new Date(this.serverTime).getTime(), adata.rows[ix][4]]);
                            this.chartList[jx].plotDraw();
                        }
                    }
                }
                break;
            case 'IMXRT_DBMonitor_eventValue.sql':

                if ( adata.rows.length == 0 )
                    return;

                for ( ix = 0; ix < adata.rows.length; ix++) {
                    for ( jx = 0; jx < this.chartInfo.length; jx++) {
                        if (adata.rows[ix][3] == this.chartInfo[jx].name) {
                            this.chartList[jx].addValue(0, [new Date(this.serverTime).getTime(), adata.rows[ix][4]]);
                            this.chartList[jx].plotDraw();
                        }
                    }
                }
                break;
            case 'IMXRT_DBMonitor_OS.sql':
                var dataIndex = null;
                for ( ix = 0; ix < adata.rows.length; ix++) {
                    for ( jx = 0; jx < this.chartInfo.length; jx++) {
                        if (this.chartInfo[jx].name == 'cpu') {
                            dataIndex = 1;
                            this.chartList[jx].addValue(0, [new Date(this.serverTime).getTime(), adata.rows[ix][dataIndex]]);
                            this.chartList[jx].plotDraw();
                        } else if (this.chartInfo[jx].name == 'free_memory') {
                            dataIndex = 2;
                            this.chartList[jx].addValue(0, [new Date(this.serverTime).getTime(), adata.rows[ix][dataIndex]]);
                            this.chartList[jx].plotDraw();
                        }
                    }
                }
                break;
            default :
                break;
        }
    },

    // stat Change에 들어가는 list ondata
    onDataStatEventOsList: function(aHeader, aData) {
        var ix;

        if (!aHeader.success)
            return;

        var data = aData.rows;
        switch (aHeader.command) {
            case 'IMXPA_DBTrend_StatChange_s.sql':
                for ( ix = 0; ix < data.length; ix++) {
                    this.statSearchData['Stat'].push({name: data[ix][0], value:data[ix][0] });
                    this.statChangeList['Stat'].push([false, data[ix][0]]);
                }
                break;

            case 'IMXPA_DBTrend_StatChange_w.sql':
                for ( ix = 0; ix < data.length; ix++) {
                    this.statSearchData['Event'].push({name: data[ix][0], value:data[ix][0] });
                    this.statChangeList['Event'].push([false , data[ix][0]]);
                }
                break;

            case 'IMXRT_DBMonitor_OS.sql':
                var colums = aData.columns;
                var temp = [];
                for ( ix = 1; ix < colums.length; ix++) {
                    this.statSearchData['OS'].push({name: colums[ix], value: colums[ix] });
                    temp.push([false,colums[ix]]);
                }
                this.statChangeList['OS'] = temp;
                break;
            default :
                break;
        }
    },

    addChartseries: function() {
        var self = this;
        var list = self.chartList;
        for (var ix = 0; ix < list.length; ix++) {
            list[ix].addSeries({
                id: 'data',
                label: self.chartInfo[ix].name,
                type: PlotChart.type.exLine
            });
            list[ix].initData(+new Date(), self.intervalTime, 0, 0);
            list[ix].plotDraw();
        }
    },

    backgroundFilter: function(state){
        var self = this;
        self.activeSessionGrid.pnlExGrid.getStore().filterBy(function(record){
            if ( state ){
                if (record.data['session_type'] == 'BACKGROUND') {
                    return !state;
                } else {
                    return state;
                }
            } else {
                return !state ;
            }
        });
    },

    onDataFixed: function(aHeader, aData) {
        var self = this;
        var data = aData.rows;
        var ix;

        switch (aHeader.command) {
            case 'IMXRT_DBMonitor_WaitValue_grid.sql':
                self.statGrid.clearRows();
                for ( ix = 0; ix < data.length; ix++ ) {
                    self.statGrid.addRow([
                        data[ix][3],    // event_name
                        data[ix][4]     //__COLUMN1
                    ]);
                }
                self.statGrid.drawGrid();
                break;
            case 'IMXRT_DBMonitor_Wait_chart.sql':
                var time = null;
                for ( ix = 0; ix < data.length; ix++) {
                    time = Math.floor( Number(new Date(data[ix][0])) * 1000 ) / 1000 ;
                    this.chartList[3].addValue(0, [time, data[ix][2]]);
                    this.chartList[3].plotDraw();
                }
                break;
            case 'IMXRT_DBMonitor_ActiveSessionList.sql':
                this.targetGrid.clearRows();
                if(self.DBSessionTab.getActiveTab().title !== 'Active Session List'){
                    return;
                }

                for ( ix = 0; ix < data.length; ix++) {
                    if (self.excludeCheckBox.getValue()) {
                        if (data[ix][34] != 'BACKGROUND') {
                            this.targetGrid.addRow([
                                data[ix][0],        // time
                                data[ix][37],       // was-name
                                data[ix][39],       // tramsaction
                                data[ix][1],        // schema
                                data[ix][2],        // program
                                data[ix][3],        // Module
                                data[ix][4],        // SID
                                data[ix][5],        // SPID
                                data[ix][6],        // Serial
                                data[ix][7],        // Status
                                data[ix][8],        // Wait
                                data[ix][9],        // SQL-Text
                                data[ix][10],       // Elapse-Time
                                data[ix][11],       // PGA(MB)
                                data[ix][12],       // Logical-Reads
                                data[ix][13],       // Physical-Reads
                                data[ix][26],       // Block-Change
                                data[ix][15],       // Executions
                                data[ix][16],       // Hard-Parse-Count
                                data[ix][17],       // Parse-Count-Total
                                data[ix][18],       // Openend-Cursors-current
                                data[ix][28],       // unDo-Blocks
                                data[ix][29],       // undo-Records
                                data[ix][21],       // Undo-seq.Id
                                common.DataModule.referenceToDB.OracleCommandType[data[ix][22]],       // command-type
                                data[ix][23],       // Action
                                data[ix][24],       // Logical-Reads(sigma)
                                data[ix][25],       // Physical-Reads(sigma)
                                data[ix][26],       // Block-Changes(sigma)
                                data[ix][27],       // Execute-Count(sigma)
                                data[ix][28],       // Undo-Blocks(singma)
                                data[ix][29],       // Undo-Records(sigma)
                                data[ix][30],       // Machine
                                data[ix][31],       // OS-User
                                data[ix][32],       // Logon-Time
                                data[ix][33],       // Client-Info
                                data[ix][34]        // session_type
                            ]);
                        }
                    } else {
                        this.targetGrid.addRow([
                            data[ix][0],        // time
                            data[ix][37],       // was-name
                            data[ix][39],       // tramsaction
                            data[ix][1],        // schema
                            data[ix][2],        // program
                            data[ix][3],        // Module
                            data[ix][4],        // SID
                            data[ix][5],        // SPID
                            data[ix][6],        // Serial
                            data[ix][7],        // Status
                            data[ix][8],        // Wait
                            data[ix][9],        // SQL-Text
                            data[ix][10],       // Elapse-Time
                            data[ix][11],       // PGA(MB)
                            data[ix][12],       // Logical-Reads
                            data[ix][13],       // Physical-Reads
                            data[ix][26],       // Block-Change
                            data[ix][15],       // Executions
                            data[ix][16],       // Hard-Parse-Count
                            data[ix][17],       // Parse-Count-Total
                            data[ix][18],       // Openend-Cursors-current
                            data[ix][28],       // unDo-Blocks
                            data[ix][29],       // undo-Records
                            data[ix][21],       // Undo-seq.Id
                            common.DataModule.referenceToDB.OracleCommandType[data[ix][22]],       // command-type
                            data[ix][23],       // Action
                            data[ix][24],       // Logical-Reads(sigma)
                            data[ix][25],       // Physical-Reads(sigma)
                            data[ix][26],       // Block-Changes(sigma)
                            data[ix][27],       // Execute-Count(sigma)
                            data[ix][28],       // Undo-Blocks(singma)
                            data[ix][29],       // Undo-Records(sigma)
                            data[ix][30],       // Machine
                            data[ix][31],       // OS-User
                            data[ix][32],       // Logon-Time
                            data[ix][33],       // Client-Info
                            data[ix][34]        // session_type
                        ]);
                    }
                }
                this.targetGrid.drawGrid();

                break;
            case 'IMXRT_DBMonitor_LockSessionList_parent.sql' :
                this.targetTree.clearNodes();
                this.targetTree.beginTreeUpdate();
                for ( ix = 0; ix < data.length; ix++) {
                    self.lockSessionGrid.addNode(null,[
                        data[ix][0],                                                    //'hold_sid'
                        data[ix][1],                                                    //'spid'
                        data[ix][2],                                                    //'h_lock_type'
                        common.DataModule.referenceToDB.lockType[data[ix][ 3]],    //'hold_mode'
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
                }
                if (self.DBSessionTab.getActiveTab().title !== 'Lock Session List') {
                    this.targetTree.endTreeUpdate();
                    return;
                }
                this.targetTree.drawTree();
                this.targetTree.endTreeUpdate();
                break;
            case 'IMXRT_DBMonitor_LockSessionList_child.sql' :
                this.targetTree.beginTreeUpdate() ;
                for ( ix = 0; ix < data.length; ix++) {
                    var holdSid = data[ix][21] ;
                    var node =  this.targetTree.findNode( 'hold_sid', holdSid );
                    if (node == null && (( holdSid !== 0 ) || ( holdSid !== -1 )) ) {
                        //sid를 모르는것으로 판단!
                        this.targetTree.addNode(null, [ data[ix][0] ]) ;
                    }
                    var waitSid = data[ix][0] ;
                    var child = self.lockSessionGrid.findNode( 'hold_sid', waitSid ) ;

                    //holder가 없으면 waiter만이라도 add한다.
                    if (child == null) {
                        if (( holdSid == 0 ) || ( holdSid == -1 )) {
                            this.targetTree.addNode( null, [
                                data[ix][ 0],                                          //wait-sid
                                data[ix][ 1],                                          //spid
                                '--'        ,                                          //hold-lock-type
                                '--'        ,                                          //hold-mode
                                data[ix][ 4],                                          //wait-lock-type
                                common.DataModule.referenceToDB.lockType[data[ix][ 5]], //request-mode
                                data[ix][ 6],                                           //obj-id
                                data[ix][ 7],                                           //status
                                data[ix][ 8],                                           //wait
                                data[ix][ 9],                                           //sql_text
                                data[ix][10],                                           //elapse_time
                                data[ix][25],                                           //was_name-elapse_time10
                                data[ix][27],                                           //txn_name-program11
                                data[ix][11],                                           //program
                                data[ix][12],                                           //modual
                                data[ix][13],                                           //action
                                data[ix][14],                                           //schema
                                data[ix][15],                                           //machine
                                data[ix][16],                                           //os-user
                                data[ix][17],                                           //logon-time
                                data[ix][18],                                           //serial
                                data[ix][19]                                            //user-name

                            ] ) ;
                        }else{
                            this.targetTree.addNode( node, [
                                data[ix][ 0],                                           //wait-sid
                                data[ix][ 1],                                           //spid
                                '--'        ,                                           //hold-lock-type
                                '--'        ,                                           //hold-mode
                                data[ix][ 4],                                           //wait-lock-type
                                common.DataModule.referenceToDB.lockType[data[ix][ 5]], //request-mode
                                data[ix][ 6],                                           //obj-id
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
                                data[ix][16],                                           //os-user
                                data[ix][17],                                           //logon-time
                                data[ix][18],                                           //serial
                                data[ix][19]                                            //user-name
                            ] ) ;
                        }
                    }else{
                        var deadLockNode =  this.targetTree.findNode( 'hold_sid', holdSid ) ;
                        if (deadLockNode == null) {
                            this.targetTree.moveNode( node, child ) ;
                        }else{
                            //deadlock detected
//                            child.raw.hold_sid = '1'
                            child.hold_sid = '1';
                            this.targetTree.addNode( child,  [
                                data[ix][ 0],                                           //wait-sid
                                data[ix][ 1],                                           //spid
                                '--'        ,                                           //hold-lock-type
                                '--'        ,                                           //hold-mode
                                data[ix][ 4],                                           //wait-lock-type
                                common.DataModule.referenceToDB.lockType[data[ix][ 5]], //request-mode
                                data[ix][ 6],                                            //obj-id
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
                                data[ix][16],                                            //os-user
                                data[ix][17],                                            //logon-time
                                data[ix][18],                                            //serial
                                data[ix][19]                                             //user-name
                            ] ) ;
                        }
                    }
                }
                if (self.DBSessionTab.getActiveTab().title != 'Lock Session List') {
                    this.targetTree.endTreeUpdate();
                    return;
                }
                this.targetTree.drawTree();
                this.targetTree.endTreeUpdate() ;
                break;
            default :
                break;
        }
    }
});