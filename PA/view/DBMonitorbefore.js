/**
 * Created by JONGHO on 14. 2. 12.
 */
Ext.define("view.DBMonitor", {
    extend : "Exem.Form",
    width  : '100%',
    height : '100%',
    intervalTime  : 3000,
    TDataBaseType : { exOracle: 'exOracle', exSQLServer: 'exSQLServer', exMySQL: 'exMySQL', exUDB: 'exUDB', exAltibase: 'exAltibase', exDB2: 'exDB2', exTibero: 'exTibero', exUnkown: 'exUnkown'},
    // checkbobox를 만들기위한 이름이 저장됨 obj array
    statChangeList     : { Stat: [], Event: [], OS: []},
    // combobox의 dataList가 저장됨 obj array
    statSearchData     : { Stat: [], Event: [], OS: []},
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
        OS                 : 'IMXRT_DBMonitor_OS.sql',                  // 실시간 차트용 freememory를 그리는 쿼리

        // 실시칸 차트 wait
        waitChart          : 'IMXRT_DBMonitor_Wait_chart.sql',
        // 그리드 한개 짜리 wait value
        waitValueGrid      : 'IMXRT_DBMonitor_WaitValue_grid.sql',

        activeSession      : 'IMXRT_DBMonitor_ActiveSessionList.sql',
        lockSessionParent  : 'IMXRT_DBMonitor_LockSessionList_parent.sql',
        lockSessionChild   : 'IMXRT_DBMonitor_LockSessionList_child.sql'
    },
    // stat 쿼리 replace string 만들기위한 array
    statNames:  [],
    // event 쿼리 replace string 만들기위한 array
    eventNames: [],

    // 클릭된 panel
    clickedTitlePanel: null,

    plain: true,  // test

    init: function() {

        // chart 가 들어갈 panel list
        this.chartareaList = [];
        // chart list
        this.chartList     = [];

        this.mainWindow = this.createMainWindow();

        this.addLineItem(this.chartFirstLine , 0, 3);     // 차트_윗줄,
        this.addLineItem(this.chartSeconLine , 4, 7 );    // 차트_아랫줄

        this.makeGridColumn();
        this.mainWindow.show();

        // 쿼리 날릴 Stirng 만들기
        this.makeReplaceString();

        this.addChart();
        this.startInterval(this.intervalTime);
        this.addChartseries();


        // statList 가져오기
        this.exeSQL(this.sql.stat, { name : 'db_id',value: 1}, this.onDataStatEventOsList, this);
        // eventList 가져오기
        this.exeSQLRepaceString(this.sql.event, { name : 'db_id',value: 1}, {name: 'IDLE_EVENT', value: common.DataModule.referenceToDB.eventName}, this.onDataStatEventOsList, this);
        // os list 가져오기
        this.exeSQL(this.sql.OS , { name : 'db_id',value: 1}, this.onDataStatEventOsList, this);


        //StatChange Window 생성
        this.statChangeWindow = this.createStatChangeWindow();
        // add 해주어야지 큰 window 안에 포함됨 범위에서 움직임.
        this.mainWindow.add(this.statChangeWindow);

    },

    // STAT 과 EVENT NAME Replace String 만들기.
    makeReplaceString: function() {
        this.statNames   = null;
        this.eventNames  = null;
        this.statNames   = [];
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

    // 주기적으로 쿼리 보내기 시작
    startInterval: function(time) {
        var self = this;
        var runner = new Ext.util.TaskRunner();
        self.task = runner.newTask({
            self: this,
            run: function() {
                // 그리드 7번
                self.exeSQL(self.sql.waitValueGrid, { name : 'db_id',value: 1}, self.onDataFixed, self);
                // 차트 3번 WAIT
                self.exeSQLRepaceString( self.sql.waitChart , {name : 'db_id', value: 1}, {name: 'IDLE_EVENT', value: common.DataModule.referenceToDB.eventName}, self.onDataFixed, self );

                // 차트 OS Type
                self.exeSQL(self.sql.OS , { name : 'db_id',value: 1}, self.onDataChange, self);
                // 차트 STAT Type
                self.exeSQLRepaceString( self.sql.statValue , {name : 'db_id', value: 1}, {name : 'stat_name', value: self.statNames}, self.onDataChange, self );
                // 차트 Event Type
                self.exeSQLRepaceString( self.sql.eventValue, {name : 'db_id', value: 1}, {name : 'IDLE_EVENT', value: self.eventNames}, self.onDataChange, self );

                //active session tab
                self.exeSQL(self.sql.activeSession, { name : 'db_id',value: 1}, self.onDataFixed, self);
                self.exeSQL(self.sql.lockSessionParent, { name : 'db_id',value: 1}, self.onDataFixed, self);
                self.exeSQL(self.sql.lockSessionChild, { name : 'db_id',value: 1}, self.onDataFixed, self);
            },
            interval: time
        });
        self.task.start();
    },

    // interval 정지
    stopInterval: function() {
        var self = this;
        if (self.task) {
            self.task.stop();
        }
    },

    // 메인 윈도우 생성
    createMainWindow: function() {
        var self = this;
        var mainWindow = Ext.create('Ext.window.Window',{
            title  : common.Util.TR('DB Monitor'),
            width  : 1000,
            height : 800,
            layout : 'fit',
            plain  : true,
            minWidth : 600,
            onEsc:  Ext.emptyFn,
            minHeight: 400,
            listeners: {
                beforedestroy: function() {
                    if (self.task) {
                        // inverval이 돌고 있으면 정지.
                        self.stopInterval();
                    }
                }
            }
        });

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
                        self.startInterval(self.intervalTime);
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

        //그리드 생성
        this.activeSessionGrid  =  Ext.create('Exem.BaseGrid',{
            gridType   : Grid.exGrid,
            usePager   : false,
            localeType : 'H:i:s'
        });
        this.lockSessionGrid    = this.createGrid(Grid.exTree);
        this.activeSessionGrid2 = this.createGrid(Grid.exGrid);
        this.lockSessionGrid2   = this.createGrid(Grid.exGrid);

        this.DBSessionTab = Ext.create('Ext.tab.Panel',{
            width : '100%',
            region: 'center',
            height: 400,
            split : true,
            minHeight: 100,
            items: [{
                title : 'Active Session List',
                layout: 'fit',
                items : [this.activeSessionGrid],
                showCheckbox: true
            },{
                title : 'Lock Session List',
                layout: 'fit',
                items : [this.lockSessionGrid],
                showCheckbox: false
            },{
                title: 'Active Session List2',
                layout: 'fit',
                hidden: true,
                items : [this.activeSessionGrid2],
                showCheckbox: false
            },{
                title : 'Lock Session List2',
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

        // Exclude Background 체크박스
        self.excludeCheckBox = Ext.create('Ext.form.field.Checkbox',{
            boxLabel  : common.Util.TR('Exclude BackGround'),
            checked   : false,
            margin    : '0 5 0 0',
            listeners : {
                change: function() {
                    this.getValue() ? self.backgroundFilter(true) : self.backgroundFilter(false);
                }
            }
        });


        // tab header 와  체크 박스 사이의 공백
        this.DBSessionTab.getTabBar().add({xtype: 'tbspacer', flex: 1});
        this.DBSessionTab.getTabBar().add(self.excludeCheckBox);

        windowBackground.add(this.DBchartArea);
        windowBackground.add(this.DBSessionTab);

        mainWindow.add(windowBackground);
        return mainWindow;
    },

    createGrid:function(type) {
        var _grid = Ext.create('Exem.BaseGrid',{
            gridType : type,
            usePager : false
        });
        return _grid;
    },

    findStatValue: function() {
        var self = this;
        if(self.ajaxCombo.getValue() == ''){
            self.ajaxCombo.focus();
            return;
        }
        var getTab = self.windowTabBackgroundTab.getActiveTab();
        var gridItemId = null ;
        switch (getTab.title) {
            case 'Stat':
                gridItemId = 'statGrid';
                break;
            case 'Event':
                gridItemId = 'EventGrid';
                break;
            case 'OS':
                gridItemId = 'osGrid';
                break;
            default :
                break;
        }
        var targetGrid = getTab.getComponent(gridItemId);
        var targetGridStore = targetGrid.getStore();
        var row = targetGridStore.findRecord('List',self.ajaxCombo.getValue());

        targetGrid.getSelectionModel().select(row);
        /**
        //if (targetGridStore.beforeCheckedIndex != null) {
        //    targetGridStore.getAt(targetGridStore.beforeCheckedIndex).set('active', false);
        //    targetGridStore.getAt(targetGridStore.beforeCheckedIndex).commit();
        //}
        //targetGridStore.beforeCheckedIndex = row.index;

        //targetGridStore.getAt(row.index).set('active', true);
        //targetGridStore.getAt(row.index).commit();
        //targetGrid.getView().focus(row.data['List']);
         */

    },

    createStatChangeWindow: function() {
        var self = this;
        self.searchCombo = Ext.create('Exem.ComboBox',{
            valueField  : 'value',
            margin      : '0 5 0 10',
            multiSelect : false,
            labelWidth  : 25,
            width       : 100,
            displayField: 'name',
            store: Ext.create('Ext.data.Store',{
                fields:['name', 'value'],
                data  :[{'name': 'Stat', value: 'Stat'}, {'name': 'Event', value: 'Event'}, {'name': 'OS', value: 'OS'}]
            }),
            listeners: {
                render: function() {
                    this.setValue('Stat');
                    self.ajaxCombo.setData(self.statSearchData['Stat']);
                    self.ajaxCombo.setSearchField('name');
                },
                change: function() {
                    switch (this.getValue()) {
                        case 'Stat':
                            self.ajaxCombo.setData(self.statSearchData['Stat']);
                            self.windowTabBackgroundTab.setActiveTab(0);
                            break;
                        case 'Event':
                            self.ajaxCombo.setData(self.statSearchData['Event']);
                            self.windowTabBackgroundTab.setActiveTab(1);
                            break;
                        case 'OS':
                            self.ajaxCombo.setData(self.statSearchData['OS']);
                            self.windowTabBackgroundTab.setActiveTab(2);
                            break;
                        default :
                            break;
                    }
                    self.ajaxCombo.setSearchField('name');
                    self.ajaxCombo.setValue(' ');
                }
            }
        });

        self.ajaxCombo = Ext.create('Exem.AjaxComboBox',{
            width: 260,
            data : [],
            enableKeyEvents: true,
            listeners: {
                select: function() {
                    self.findStatValue();
                },
                keydown: function(comboboxThis, e) {
                    if(e.keyCode == 13) {
                        self.findStatValue();
                    }
                }
            }
        });

        var statWindow = Ext.create('Ext.window.Window',{
            title      : common.Util.TR('Stat change'),
            width      : 400,
            height     : 500,
            layout     : 'fit',
            closeAction: 'hide',
            modal      : true,
            resizable  : false,
            constrainHeader: true,
            tbar: [{
                xtype : 'container',
                height: 27,
                layout: {
                    type : 'hbox',
                    align: 'middle'
                },
                width : '100%',
                items : [self.searchCombo, self.ajaxCombo]
            }],
            bbar:[{
                xtype: 'tbspacer',
                flex : 1
            },{
                xtype:'button',
                text : 'OK',
                listeners: {
                    click: function() {
                        var getTab = self.windowTabBackgroundTab.getActiveTab();
                        var gridItemId = null ;
                        var msgName = null;
                        switch (getTab.title) {
                            case 'Stat':
                                gridItemId = 'statGrid';
                                msgName = 'Stat Name ';
                                break;
                            case 'Event':
                                gridItemId = 'EventGrid';
                                msgName = 'Event Name ';
                                break;
                            case 'OS':
                                gridItemId = 'osGrid';
                                msgName = 'OS Name ';
                                break;
                            default :
                                break;
                        }
                        var targetGrid = getTab.getComponent(gridItemId);
                        var row = targetGrid.getStore().findRecord('active',true);
                        var newTitle = row.data.List;
                        if (newTitle == self.clickedTitlePanel.title) {
                            Ext.Msg.show({
                                title  : common.Util.TR('Confirmation'),
                                msg    : msgName + ' ' + common.Util.TR('Already exists'),
                                buttons: Ext.Msg.OK,
                                icon   : Ext.MessageBox.INFO
                            });
                        } else {
                            self.chartInfo[self.clickedTitlePanel._index].name = newTitle;
                            self.chartInfo[self.clickedTitlePanel._index].type = getTab.title;
                            self.clickedTitlePanel.setTitle(newTitle);
                            self.chartList[self.clickedTitlePanel._index].clearValues();
                            self.chartList[self.clickedTitlePanel._index].initData(+new Date(), self.intervalTime, 0, 0);;
                            self.chartList[self.clickedTitlePanel._index].plotDraw();
                            self.makeReplaceString();
                            this.up().up().hide();
                        }
                    }
                }
            },{
                xtype: 'tbspacer',
                width: 20
            },{
                xtype: 'button',
                text : common.Util.TR('Cancel'),
                listeners: {
                    click: function() {
                        this.up().up().hide();
                    }
                }
            },{
                xtype: 'tbspacer',
                flex: 1
            }],
            listeners:  {
                show: function() {

                    var chartType = self.clickedTitlePanel._info.type;

                    var setCheckValue = function(grid) {
                        var gridStore = grid.getStore();
                        var row = gridStore.findRecord('List',self.clickedTitlePanel.title);
                        gridStore.beforeCheckedIndex = row.index;
                        gridStore.getAt(row.index).set('active', true);
                        gridStore.getAt(row.index).commit();
                        grid.getSelectionModel().select(row);
                        grid.getView().focus(row.data['List']);
                    };

                    switch (chartType) {
                        case 'Stat':
                            var statTab = self.windowTabBackgroundTab.setActiveTab(0);
                            var statGrid = statTab.getComponent('statGrid');
                            self.searchCombo.setValue('Stat');
                            self.ajaxCombo.setData(self.statSearchData['Stat']);
                            setCheckValue(statGrid);
                            break;
                        case 'Event':
                            var eventTab = self.windowTabBackgroundTab.setActiveTab(1);
                            var eventGrid = eventTab.getComponent('EventGrid');
                            self.searchCombo.setValue('Event');
                            self.ajaxCombo.setData(self.statSearchData['Event']);
                            setCheckValue(eventGrid);
                            break;
                        case 'OS':
                            var osTab = self.windowTabBackgroundTab.setActiveTab(2);
                            var osGrid = osTab.getComponent('osGrid');
                            self.searchCombo.setValue('OS');
                            self.ajaxCombo.setData(self.statSearchData['OS']);
                            setCheckValue(osGrid);
                            break;
                        default :
                            break;
                    }
                },
                close: function() {
                    var statRecord = self.statStore.findRecord('active',true);
                    if(statRecord){
                        self.statStore.getAt(statRecord.index).set('active', false);
                        self.statStore.getAt(statRecord.index).commit();
                    }
                    var eventRecord = self.eventStore.findRecord('active',true);
                    if(eventRecord){
                        self.eventStore.getAt(eventRecord.index).set('active', false);
                        self.eventStore.getAt(eventRecord.index).commit();
                    }
                    var osRecord = self.osStore.findRecord('active',true);
                    if(osRecord){
                        self.osStore.getAt(osRecord.index).set('active', false);
                        self.osStore.getAt(osRecord.index).commit();
                    }
                }
            }
        });

        /**
        var addTabItem = function(target, title) {
            var pnl = Ext.create('Ext.panel.Panel',{
                layout: 'fit',
                title : title,
                width : '100%',
                height: '100%'
            });
            target.add(pnl);

            return pnl;
        };
         **/




        self.windowTabBackgroundTab = Ext.create('Ext.tab.Panel',{
            width : 300,
            height: 500,
            listeners: {
                beforerender: function() {

//                    각각의 tab에 check box add 해주기.
                    var statTab  = this.items.items[0];
                    var statData = self.statChangeList['Stat'];

                    self.statStore = Ext.create('Ext.data.ArrayStore', {
                        fields: [{name: 'active', type: 'bool'},{name : 'List'}],
                        data : statData,
                        beforeCheckedIndex: null
                    });

                    var statGrid = Ext.create('Ext.grid.Panel', {
                        store: self.statStore,
                        autoScroll: true,
                        itemId : 'statGrid',
                        forceFit: true,
                        columns: [ { xtype: 'checkcolumn',
                            text: 'Active',
                            dataIndex: 'active',
                            width: 50,
                            listeners: {
                                checkchange: function (column, recordIndex) {
                                    // 여기서 체크된놈을 기억했다가, 다시 클릭되는 데서, false로 변경시켜주면 전체 data 루핑은 안돌아도됨....
                                    if (self.statStore.beforeCheckedIndex == null) {
                                        self.statStore.beforeCheckedIndex = recordIndex;

                                    } else {
                                        self.statStore.data.items[self.statStore.beforeCheckedIndex].set('active', false);
                                        self.statStore.beforeCheckedIndex = recordIndex;
                                    }
                                    self.statStore.commitChanges();

                                }
                            }
                        },
                            {text     : 'name', dataIndex : 'List', flex: 1 }],
                        hideHeaders: true,
                        viewConfig:{
                            listeners:{
                                itemkeydown:function(view, record, item, index, e){
                                    var pressedKey = String.fromCharCode(e.getCharCode());
                                    var gridData =  this.getStore().data.items;
                                    for (var ix = 0; ix < gridData.length; ix++) {
                                        if (gridData[ix].raw[1][0].toLowerCase() == pressedKey.toLowerCase()) {
                                            this.getSelectionModel().select(this.getStore().data.items[ix]);
                                            this.focus(this.getStore().data.items[ix].data['List']);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    });

                    statTab.add(statGrid);


                    var eventTab = this.items.items[1];
                    var eventData = self.statChangeList['Event'];

                    self.eventStore = Ext.create('Ext.data.ArrayStore', {
                        fields: [{name: 'active', type: 'bool'}, {name: 'List'}],
                        data : eventData,
                        beforeCheckedIndex: null
                    });

                    var eventGrid = Ext.create('Ext.grid.Panel', {
                        store: self.eventStore,
                        itemId : 'EventGrid',
                        beforeCheckedIndex: null,
                        forceFit: true,
                        columns: [ { xtype: 'checkcolumn',
                            text: 'Active',
                            dataIndex: 'active',
                            width: 50,
                            beforeCheckedIndex: null,
                            listeners: {
                                checkchange: function (column, recordIndex) {
                                    // 여기서 체크된놈을 기억했다가, 다시 클릭되는 데서, false로 변경시켜주면 전체 data 루핑은 안돌아도됨....
                                    if (self.eventStore.beforeCheckedIndex == null) {
                                        self.eventStore.beforeCheckedIndex = recordIndex;
                                        self.eventStore.getAt(recordIndex).commit();
                                    } else if (self.eventStore.beforeCheckedIndex == recordIndex) {
                                        self.eventStore.getAt(self.eventStore.beforeCheckedIndex).commit();
                                    } else {
                                        self.eventStore.getAt(self.eventStore.beforeCheckedIndex).set('active', false);
                                        self.eventStore.getAt(self.eventStore.beforeCheckedIndex).commit();
                                        self.eventStore.getAt(recordIndex).commit();
                                        self.eventStore.beforeCheckedIndex = recordIndex;
                                    }
                                }
                            }
                        },
                            {text     : 'name', dataIndex : 'List', flex: 1 }],
                        hideHeaders: true,
                        viewConfig:{
                            listeners:{
                                itemkeydown:function(view, record, item, index, e){
                                    var pressedKey = String.fromCharCode(e.getCharCode());
                                    var gridData =  this.getStore().data.items;
                                    for (var ix = 0; ix < gridData.length; ix++) {
                                        if (gridData[ix].raw[1][0].toLowerCase() == pressedKey.toLowerCase()) {
                                            this.getSelectionModel().select(this.getStore().data.items[ix]);
                                            this.focus(this.getStore().data.items[ix].data['List']);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    eventTab.add(eventGrid);


                    var osTab = this.items.items[2];
                    var osData = self.statChangeList['OS'];
                    self.osStore = Ext.create('Ext.data.ArrayStore', {
                        fields: [{name: 'active', type: 'bool'},{name : 'List'}],
                        data : osData,
                        beforeCheckedIndex: null
                    });
                    var osGrid = Ext.create('Ext.grid.Panel', {
                        store: self.osStore,
                        itemId : 'osGrid',
                        forceFit: true,
                        columns: [ { xtype: 'checkcolumn',
                            text: 'Active',
                            dataIndex: 'active',
                            width: 50,
                            beforeCheckedIndex: null,
                            listeners: {
                                checkchange: function (column, recordIndex) {
                                    // 여기서 체크된놈을 기억했다가, 다시 클릭되는 데서, false로 변경시켜주면 전체 data 루핑은 안돌아도됨....
                                    if (self.osStore.beforeCheckedIndex == null) {
                                        self.osStore.beforeCheckedIndex = recordIndex;
                                        self.osStore.getAt(recordIndex).commit();
                                    } else if (self.osStore.beforeCheckedIndex == recordIndex) {
                                        self.osStore.getAt(self.osStore.beforeCheckedIndex).commit();
                                    } else {
                                        self.osStore.getAt(self.osStore.beforeCheckedIndex).set('active', false);
                                        self.osStore.getAt(self.osStore.beforeCheckedIndex).commit();
                                        self.osStore.getAt(recordIndex).commit();
                                        self.osStore.beforeCheckedIndex = recordIndex;
                                    }
                                }
                            }
                        },
                            {text     : 'name', dataIndex : 'List', flex: 1 }],
                        hideHeaders: true,
                        viewConfig:{
                            listeners:{
                                itemkeydown:function(view, record, item, index, e){
                                    // 키코드는 아스키값, 스트링으로 변환해준다.
                                    var pressedKey = String.fromCharCode(e.getCharCode());
                                    var gridData =  this.getStore().data.items;
                                    for (var ix = 0; ix < gridData.length; ix++) {
                                        // 그리드의 raw의 1번은 statname, 첫긓짜를 서로 소문자로 바꿔서 비교
                                        if (gridData[ix].raw[1][0].toLowerCase() == pressedKey.toLowerCase()) {
                                            this.getSelectionModel().select(this.getStore().data.items[ix]);
                                            this.focus(this.getStore().data.items[ix].data['List']);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    osTab.add(osGrid);

                },
                tabchange: function() {
                    self.searchCombo.setValue(this.getActiveTab().title);
                    self.ajaxCombo.setData(self.statSearchData[this.getActiveTab().title]);
                }
            }
        });
        /////////////////////

        /**
        var statTab  = addTabItem(self.windowTabBackgroundTab, 'Stat');
        var eventTab = addTabItem(self.windowTabBackgroundTab, 'Event');
        var osTab    = addTabItem(self.windowTabBackgroundTab, 'OS');
         **/



        ////////////////////////////////////






        statWindow.add(self.windowTabBackgroundTab);

        return statWindow;
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
                        header.addListener('dblclick', function(header) {
                            self.clickedTitlePanel = header.up();
                            self.statChangeWindow.show();
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

    createChart:function() {
        var flowChart = Ext.create('Exem.chart.CanvasChartLayer',{
            titleBackgroundColor:'#E3EAF1',
            showTooltip   : true,
            dataBufferSize: 140,
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
        // 차트 7개
        for (var ix = 0; ix < self.chartareaList.length-1; ix++) {
            createdChart = self.createChart();
            self.chartareaList[ix].add(createdChart);
            self.chartList.push(createdChart);
            createdChart.plotDraw();
        }

        // 그리드 1개짜리
        self.statGrid = self.createGrid(Grid.exGrid);
        self.chartareaList[7].add(self.statGrid);
        self.statGrid.beginAddColumns();
        self.statGrid.addColumn(common.Util.TR('Wait'), 'event_name', '48%',  Grid.String, true , false);
        self.statGrid.addColumn(common.Util.TR('Value'),'__COLUMN1', '48%',   Grid.Number, true , false);
        self.statGrid.endAddColumns();
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

    makeGridColumn: function() {

        this.activeSessionGrid.beginAddColumns();
        this.activeSessionGrid.addColumn(common.Util.TR('Time')                  , 'time'                  , 80, Grid.DateTime, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('WAS')                   , 'was_name'              , 100, Grid.String, true, false);
        this.activeSessionGrid.addColumn(common.Util.TR('Transaction')           , 'txn_name'              , 200, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Schema')                , 'SCHEMA'                , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Program')               , 'program'               , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Module')                , 'MODULE'                , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('SID')                   , 'sid'                   , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('SPID')                  , 'spid'                  , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Serial')                , 'serial'                , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Status')                , 'status'                , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Wait')                  , 'wait'                  , 500, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('SQL Text')              , 'sql_text'              , 500, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Elapse Time')           , 'last_call_et'          , 100, Grid.Float , true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('PGA(MB)')               , 'pga'                   , 100, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Logical Reads')         , 'logical_reads'         , 100, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Physical Reads')        , 'physical_reads'        , 100, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Block Changes')         , 'db_block_change'       , 100, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Executions')            , 'executions'            , 100, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Hard Parse Count')      , 'parse_count_hard'      , 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Parse Count Total')     , 'parse_count_total'     , 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Opened Cursors Current'), 'opened_cursors_current', 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Undo Blocks')           , 'Undo Blocks'           , 100, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Undo Records')          , 'Undo Records'          , 100, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Undo Seq. ID')          , 'Undo Seq_ID'           , 100, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Command Type')          , 'command_type'          , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Action')                , 'action'                , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Logical Reads (Sigma)')  , 'Logical Reads(Sigma)'  , 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Physical Reads (Sigma)') , 'Physical Reads(Sigma)' , 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Block Changes (Sigma)')  , 'Block Change (Sigma)'  , 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Execute Count (Sigma)')  , 'Exection (Sigma)'      , 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Undo Blocks (Sigma)')    , 'Undo Blocks (Sigma)'   , 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Undo Record (Sigma)')    , 'Undo Records (Sigma)'  , 150, Grid.Number, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Machine')               , 'machine'               , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('OS User')               , 'os_user'               , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Logon Time')            , 'logon_time'            , 80, Grid.DateTime, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Client Info')           , 'client_info'           , 100, Grid.String, true , false);
        this.activeSessionGrid.addColumn(common.Util.TR('Session Type')          , 'session_type'          , 100, Grid.String, true , false);
        this.activeSessionGrid.endAddColumns();


        this.lockSessionGrid.beginAddColumns();
        this.lockSessionGrid.addColumn( common.Util.TR('SID')           , 'hold_sid'    , 100, Grid.String, true , false , 'treecolumn' );
        this.lockSessionGrid.addColumn( common.Util.TR('SPID')          , 'spid'        , 100, Grid.String, true , false  );
        this.lockSessionGrid.addColumn( common.Util.TR('Hold lock Type'), 'h_lock_type' , 100, Grid.String, true , false  );
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

        this.activeSessionGrid2.beginAddColumns();
        this.activeSessionGrid2.addColumn(common.Util.TR('Time')                  , 'time'                  , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('WAS')                   , 'was_name'              , 100, Grid.String, true, false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Transaction')           , 'txn_name'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('DB ID')                 , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Agent ID')             , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Agent PID')             , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Client PID')            , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Primary Auth ID')       , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Execution ID')          , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Appl ID')               , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Appl Conn Time')        , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('UOW Elapse Time')       , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Agent User CPU Time')   , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Agent Sys CPu Time')    , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('STMT UID')              , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('ANCH ID')               , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('SQL Text')              , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('SQL Id')                , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Prev STMT UID')         , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Prev ANCH UID')         , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Prev SQL UID')          , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('SQL ID 1')              , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Appl Status')           , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Rows Read')             , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Rows Written')          , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Rows Changed')          , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Total Sorts')           , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Sort Overflows')        , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Lock Escals')           , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('X Lock Escals')         , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Logical Reads')         , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Physical Reads')        , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Pool Temp DataReads')   , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Direct Reads')          , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Totla Hash Joins')      , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('Horder')                , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.addColumn(common.Util.TR('CPU')                   , '-'              , 100, Grid.String, true , false);
        this.activeSessionGrid2.endAddColumns();

        this.lockSessionGrid2.beginAddColumns();
        this.lockSessionGrid2.addColumn(common.Util.TR('SID')                  , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Hold Lock Type')       , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Hold Mode')            , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Wait Lock Type')       , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Request Mode')         , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Object ID')            , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('SQL Text')             , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Primary Auth ID')      , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Execution ID')         , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Appl ID')              , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Appl Conn Time')       , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('UOW  Elapse Time')     , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Agent User CPU Time')  , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Agent Sys CPU Time')   , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('STMT UID')             , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('ANCH ID')              , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Agent ID')             , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Client PID')           , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Hold DB')              , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Hold SID')             , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('SQL_ID')               , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('WAS ID')               , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('WAS Name')             , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('TXN ID')               , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Time')                 , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('Transaction')          , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.addColumn(common.Util.TR('DeadLock')             , '_'                  , 100, Grid.String, true , false);
        this.lockSessionGrid2.endAddColumns();
    },

    exeSQL : function (SQL, bindInfo, ondataFunction, scope) {
        var sql_Text_dataset = {};
        sql_Text_dataset.sql_file = SQL ;
        sql_Text_dataset.bind = [bindInfo];
        WS.SQLExec(sql_Text_dataset, ondataFunction, scope);
    },

    exeSQLRepaceString: function(SQL, bindInfo, replace, ondataFunction, scope) {
        var sql_Text_dataset = {};
        sql_Text_dataset.sql_file = SQL ;
        sql_Text_dataset.bind = [bindInfo];
        sql_Text_dataset.replace_string = [replace];
        WS.SQLExec( sql_Text_dataset, ondataFunction, scope ) ;
    },

    // stat Change에 들어가는 list ondata
    onDataStatEventOsList: function(aHeader, aData) {
        var ix;

        if (!aHeader.success) {
            console.debug('onDataStatEventOsList:',aHeader.message);
        }
        var data = aData.rows;
        switch (aHeader.command) {
            case 'IMXPA_DBTrend_StatChange_s.sql':
                for (ix = 0; ix < data.length; ix++) {
                    this.statSearchData['Stat'].push({name: data[ix][0], value:data[ix][0] });
                    this.statChangeList['Stat'].push([false, data[ix][0]]);
                }

                break;

            case 'IMXPA_DBTrend_StatChange_w.sql':
                for (ix = 0; ix < data.length; ix++) {
                    this.statSearchData['Event'].push({name: data[ix][0], value:data[ix][0] });
                    this.statChangeList['Event'].push([false , data[ix][0]]);
                }
                break;

            case 'IMXRT_DBMonitor_OS.sql':
                var colums = aData.columns;
                var temp = [];
                for (ix = 1; ix < colums.length; ix++) {
                    this.statSearchData['OS'].push({name: colums[ix], value: colums[ix] });
                    temp.push([false,colums[ix]]);
                }
                this.statChangeList['OS'] = temp;
                break;
            default :
                break;
        }
    },

    onDataChange: function(aHeader, aData) {
        var time = null;
        var data, ix, jx;
        switch (aHeader.command) {
            case 'IMXRT_DBMonitor_StatValue.sql':
            case 'IMXRT_DBMonitor_eventValue.sql':
                data = aData.rows;
                for (ix = 0; ix < data.length; ix++) {
                    time = Math.floor( Number(new Date(data[ix][0])) * 1000 ) / 1000 ;
                    for (jx = 0; jx < this.chartInfo.length; jx++) {
                        if (data[ix][3] == this.chartInfo[jx].name) {
                            this.chartList[jx].addValue(0, [time, data[ix][4]]);
                            this.chartList[jx].plotDraw();
                        }
                    }
                }
                break;
            case 'IMXRT_DBMonitor_OS.sql':
                data = aData.rows;
                var dataIndex = null;
                for (ix = 0; ix < data.length; ix++) {
                    time = Math.floor( Number(new Date(data[ix][0])) * 1000 ) / 1000 ;
                    for (jx = 0; jx < this.chartInfo.length; jx++) {
                        if (this.chartInfo[jx].name == 'cpu') {
                            dataIndex = 1;
                            this.chartList[jx].addValue(0, [time, data[ix][dataIndex]]);
                            this.chartList[jx].plotDraw();
                        } else if (this.chartInfo[jx].name == 'free_memory') {
                            dataIndex = 2;
                            this.chartList[jx].addValue(0, [time, data[ix][dataIndex]]);
                            this.chartList[jx].plotDraw();
                        }
                    }

                }
                break;
            default :
                break;
        }
    },

    // 스토어가 아닌 뷰에서 특정 조건으로 그리드를 filter 해준다.
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
                for (ix = 0; ix < data.length; ix++ ) {
                    self.statGrid.addRow([
                        data[ix][3],    // event_name
                        data[ix][4]     //__COLUMN1
                    ]);
                }
                self.statGrid.drawGrid();
                break;
            case 'IMXRT_DBMonitor_Wait_chart.sql':
                var time = null;
                for (ix = 0; ix < data.length; ix++) {
                    time = Math.floor( Number(new Date(data[ix][0])) * 1000 ) / 1000 ;
                    this.chartList[3].addValue(0, [time, data[ix][2]]);
                    this.chartList[3].plotDraw();
                }
                break;
            case 'IMXRT_DBMonitor_ActiveSessionList.sql':
                self.activeSessionGrid.clearRows();

                for (ix = 0; ix < data.length; ix++) {
                    self.activeSessionGrid.addRow([
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
                        data[ix][22],       // command-type
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
                self.activeSessionGrid.drawGrid();
                self.activeSessionGrid.setOrderAct('time', 'desc');

                break;
            case 'IMXRT_DBMonitor_LockSessionList_parent.sql' :
                self.lockSessionGrid.clearNodes();
                self.lockSessionGrid.beginTreeUpdate();
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
                    self.lockSessionGrid.endTreeUpdate();
                    return;
                }
                self.lockSessionGrid.drawTree();
                self.lockSessionGrid.endTreeUpdate();
                break;
            case 'IMXRT_DBMonitor_LockSessionList_child.sql' :
                self.lockSessionGrid.beginTreeUpdate() ;
                for ( ix = 0; ix < data.length; ix++) {
                    var holdSid = data[ix][21] ;
                    var node = self.lockSessionGrid.findNode( 'hold_sid', holdSid );
                    if (node == null && (( holdSid !== 0 ) || ( holdSid !== -1 )) ) {
                        //sid를 모르는것으로 판단!
                        self.lockSessionGrid.addNode(null, [ data[ix][0] ]) ;
                    }
                    var waitSid = data[ix][0] ;
                    var child = self.lockSessionGrid.findNode( 'hold_sid', waitSid ) ;

                    //holder가 없으면 waiter만이라도 add한다.
                    if (child == null) {
                        if (( holdSid == 0 ) || ( holdSid == -1 )) {
                            self.lockSessionGrid.addNode( null, [
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
                            self.lockSessionGrid.addNode( node, [
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
                        var deadLockNode = self.lockSessionGrid.findNode( 'hold_sid', holdSid ) ;
                        if (deadLockNode == null) {
                            self.lockSessionGrid.moveNode( node, child ) ;
                        }else{
                            //deadlock detected
                            child.raw.hold_sid = '1';
                            self.lockSessionGrid.addNode( child,  [
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
                if (self.DBSessionTab.getActiveTab().title !== 'Lock Session List') {
                    return;
                }
                self.lockSessionGrid.drawTree();
                self.lockSessionGrid.endTreeUpdate() ;
                break;
            default :
                break;
        }
    }
});


