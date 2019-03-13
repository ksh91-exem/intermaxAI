Ext.define('rtm.src.rtmTuxTmadmin', {
    extend : 'Exem.DockForm',
    title  : 'Tuxedo ' + common.Util.CTR('Realtime tmadmin'),
    layout: 'fit',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function(me) {
            me.isClosedDockForm = true;

            me.stopRefreshData();

            me.gridServer.removeAll();
            me.gridService.removeAll();
            me.gridClient.removeAll();
            me.gridQueue.removeAll();
        }
    },

    sql: {
        psr  : 'IMXRT_Tux_Server.sql',
        psc  : 'IMXRT_Tux_Service.sql',
        pclt : 'IMXRT_Tux_Client.sql',
        pq   : 'IMXRT_Tux_Queue.sql'
    },

    initProperty: function() {
        var saveKey, viewData;
        if (!this.componentId) {
            // 신규 dock 화면 추가 하면 componentid를 새로 만든다.
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.objOption = Comm.RTComm.getTuxtmadminGroupList(this.componentId);

        this.enValueJson = [];

        // 실시간 TP tmadmin 모니터링인 경우 체크 4분할 화면
        if (this.componentId.indexOf('dash-rtm-rtmTuxTmadmin-ext-7') !== -1) {
            this._dashboardDatset(this.componentId);
            Comm.RTComm.saveTuxtmadminGroupList(this.componentId, this.enValueJson);
        } else {
            // tmadmin 새로만들면 처름에는 무조건 objOption 값은 null 이다.
            if (this.objOption) {
                // WebEvn에 데이타가 있는경우
                saveKey  = Comm.RTComm.getEnvKeyTuxtmadminGroupList();
                viewData = Comm.web_env_info[saveKey];

                if (typeof viewData !== 'object') {
                    viewData = JSON.parse(viewData);
                }

                // 적용 // 미적용
                this.useTuxAgent = viewData.data[this.componentId][0];
                // 에이전트 선택 데이타.
                this.enValueJson[1] = viewData.data[this.componentId][1];

            } else {
                // WebEvn에 데이타가 없는경우
                this.useTuxAgent = false;
                this.enValueJson.push(this.useTuxAgent);
                Comm.RTComm.saveTuxtmadminGroupList(this.componentId, this.enValueJson);
            }
        }

        this.monitorType  = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.beforeSqlCommand = '';

        this.autoRefreshCheck = true;

        this.intervalTime = 60;
    },

    _dashboardDatset: function(id) {
        var cmpId = id;
        var key1, key2, key3, key4;
        // 초기값은 true  셋팅
        this.useTuxAgent = true;

        // Tuxedo Agent 갯수
        var tuxAgentLength =  Object.keys(Comm.tuxInfoObj).length;

        this.enValueJson.push(this.useTuxAgent);
        // 실시간모니터링 화면에서는 옵션값을 강제로 셋팅.
        this.objOption = true;


        if (tuxAgentLength === 1) {
            key1 = Object.keys(Comm.tuxInfoObj)[0];
            key2 = Object.keys(Comm.tuxInfoObj)[0];
            key3 = Object.keys(Comm.tuxInfoObj)[0];
            key4 = Object.keys(Comm.tuxInfoObj)[0];
        } else if (tuxAgentLength === 2) {
            key1 = Object.keys(Comm.tuxInfoObj)[0];
            key2 = Object.keys(Comm.tuxInfoObj)[1];
            key3 = Object.keys(Comm.tuxInfoObj)[0];
            key4 = Object.keys(Comm.tuxInfoObj)[0];
        } else if (tuxAgentLength === 3) {
            key1 = Object.keys(Comm.tuxInfoObj)[0];
            key2 = Object.keys(Comm.tuxInfoObj)[1];
            key3 = Object.keys(Comm.tuxInfoObj)[2];
            key4 = Object.keys(Comm.tuxInfoObj)[0];
        } else if (tuxAgentLength === 4 || tuxAgentLength > 5) {
            key1 = Object.keys(Comm.tuxInfoObj)[0];
            key2 = Object.keys(Comm.tuxInfoObj)[1];
            key3 = Object.keys(Comm.tuxInfoObj)[2];
            key4 = Object.keys(Comm.tuxInfoObj)[3];
        } else {
            return;
        }


        // 실시간 모니터링 고정값
        if (cmpId.indexOf('70001') !== -1) {
            this.enValueJson.push([key1]);
        } else if (cmpId.indexOf('70002') !== -1) {
            this.enValueJson.push([key2]);
        } else if (cmpId.indexOf('70003') !== -1) {
            this.enValueJson.push([key3]);
        } else {
            // 70004
            this.enValueJson.push([key4]);
        }
    },

    init: function() {
        this.stat = [];

        this.fillterapply = false;

        this.initProperty();

        this.initLayout();

        this.frameRefresh();

        if (this.optionButton) {
            this.optionButton.optionView = this.createTmadminOptionWindow();
        }
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
            margin: '2 5 0 0',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on('click', function() {
                        this.dockContainer.toggleExpand(this);
                    }, this);
                }
            }
        });

        this.optionButton = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '2 10 0 0',
            html  : '<div class="frame-option-icon" title="' + common.Util.TR('option') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function() {
                        this.setWebEnvoption();
                        me.optionView.show();
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

        this.limitCombo = Ext.create('Exem.AjaxComboBox',{
            cls    : 'rtm-list-condition',
            width  : 85,
            labelWidth: 35,
            margin : '0 0 0 5',
            fieldLabel: common.Util.TR('Top'),
            enableKeyEvents: false,
            editable: false,
            listeners: {
                scope: this,
                select: function() {
                    this.executeSQL();
                }
            }
        });

        this.commandNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls    : 'rtm-list-condition',
            width  : 125,
            labelWidth: 60,
            margin : '0 5 0 5',
            fieldLabel: common.Util.TR('Command'),
            enableKeyEvents: false,
            editable: false,
            listeners: {
                scope: this,
                select: function() {
                    this.executeSQL();
                }
            }
        });

        this.executeIntervalCombo = Ext.create('Exem.AjaxComboBox',{
            cls    : 'rtm-list-condition',
            width  : 130,
            labelWidth: 75,
            margin : '0 5 0 5',
            fieldLabel: common.Util.TR('Interval (Sec)'),
            enableKeyEvents: false,
            editable: false,
            listeners: {
                scope: this,
                select: function() {
                    this.executeSQL();
                }
            }
        });

        this.autoRefreshBox = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Refresh'),
            name    : 'autoRefreshCheckbox',
            margin  : '0 20 0 10',
            cls     : 'rtm-checkbox-label',
            checked : true,
            listeners: {
                scope: this,
                change: function(checkbox, val) {
                    this.autoRefreshCheck = val;
                }
            }
        });

        this.topContentsArea.add([
            this.frameTitle, {xtype: 'tbfill'},
            this.limitCombo,
            this.commandNameCombo,
            this.executeIntervalCombo,
            this.autoRefreshBox,
            this.expendIcon,
            this.optionButton
        ]);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.setComboBoxData();

        this.createGrid();

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.up().setTitle('Tuxedo ' + this.title);
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },

    /**
     *  옵션 설정 팝업창
     */
    createTmadminOptionWindow : function() {

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
        this.statStore = Ext.create( 'Ext.data.Store', {
            fields  : [
                {name : 'Index',   type : 'int' },
                {name : 'Name',    type : 'string'  },
                {name : 'Display', type : 'string'  }
            ],
            data    : [],
            sorters : [
                { property : 'Display', direction : 'ASC' }
            ]
        });

        var envAgentVal = [];
        //  .x-grid-row-checker
        this.grid = Ext.create( 'Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : false,
            autoScroll  : true,
            store       : this.statStore,
            cls         : 'baseGridRTM',
            bodyStyle   : { 'border-bottom-width':'1px' },
            columns     : [
                { text: 'Index',  dataIndex : 'Index',  hidden: true },
                { text: 'Id',     dataIndex : 'Id' ,    hidden: true },
                { text: 'Name',   dataIndex : 'Name' ,  hidden: false, flex  : 1 },
                { text: 'host',   dataIndex : 'host' ,  hidden: true }
            ],
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                mode: 'SIMPLE',
                enableKeyNav: false
            }),
            listeners: {
                scope: this,
                itemclick: function(thisGrid, record) {
                    var ChkCnt = thisGrid.getSelectionModel().getSelected().items.length;
                    var SelectChkList = thisGrid.getSelectionModel().selected.items;

                    envAgentVal = [];

                    if (ChkCnt == 5) {
                        Ext.MessageBox.show({
                            title   : common.Util.TR('Error'),
                            icon    : Ext.MessageBox.ERROR,
                            message : 'Agent List ' + common.Util.TR('A maximum of 4 selections can be made.'),
                            modal   : true,
                            cls     : 'popup-message',
                            buttons : Ext.Msg.OK
                        });


                        // 4개 초과 선택 시 5번째 체크는 삭제처리한다.
                        thisGrid.getSelectionModel().deselect(record,true);

                    }

                    // WebEnv 체크된 에이전트 값을 담는다
                    var ix, ixLen;
                    for (ix = 0, ixLen = SelectChkList.length; ix < ixLen; ix++) {
                        envAgentVal.push(SelectChkList[ix].data['Id']);
                    }
                }
            }
        });

        // agent 데이타 화면에 출력
        this.addList();


        var firstOption = Ext.create('Ext.form.FieldSet',{
            width : 395,
            height: 140,
            autoScroll  : true,
            cls         : 'rtm-statchange-base',
            layout: {
                type :'hbox'
            },
            title:  common.Util.TR('Agent List'),
            x: 10,
            y: 12
        });


        firstOption.add(this.grid);


        var secondOption = Ext.create('Ext.form.FieldSet',{
            width : 395,
            height: 60,
            layout: {
                type :'absolute'
            },
            title:  common.Util.TR('Apply Options'),
            x: 10,
            y: 165
        });

        var useStatusLabel = Ext.create('Ext.form.Label', {
            x   : 20,
            y   : 10,
            html: '<span>' + common.Util.TR('Application status') + '</span>'
        });

        var toggleOnOff = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width  : 100,
            x   : 30,

            margin: '7 0 0 100',
            onText : common.Util.TR('Apply'),
            offText: common.Util.TR('Unapplied'),
            state  : this.useTPAgent
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
                        this.useTuxAgent = toggleOnOff.getValue();

                        this.enValueJson = [];
                        this.enValueJson.push(this.useTuxAgent);
                        this.enValueJson.push(envAgentVal);

                        Comm.RTComm.saveTuxtmadminGroupList(this.componentId, this.enValueJson);

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
                        me.up('.window').close();
                    }
                }
            }]
        });

        optionPanel.add(bottomArea);

        var optionWin =  Ext.create('Exem.XMWindow', {
            layout  : 'fit',
            title   :  common.Util.TR('Option'),
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
                    if (toggleOnOff.state !== this.useTPAgent) {
                        toggleOnOff.toggle();
                    }
                }
            }
        });

        optionWin.add(optionPanel);

        this.setWebEnvoption();

        return optionWin;

    },

    setWebEnvoption :function() {

        var Agentgrid = this.statStore.data.items;
        var chkKeyArray = this.enValueJson[1];
        var chkindex, ix, ixLen, i, iLen;

        if (this.objOption && this.useTuxAgent) {

            // 옵션정보를 한번도 저장안하면 데이타 없음. 예외처리
            if (chkKeyArray !== undefined) {

                for (ix = 0, ixLen = Agentgrid.length; ix < ixLen; ix++) {
                    // 체크값 전부 해지
                    chkindex = this.statStore.getAt(ix);
                    this.grid.getSelectionModel().deselect(chkindex, true);
                }

                // max가 4개라고 기준 정의
                for (i = 0, iLen = chkKeyArray.length; i < iLen; i++) {

                    for (ix = 0, ixLen = Agentgrid.length; ix < ixLen; ix++) {
                        // Agent 값 비교해서 같으면 체크 처리
                        if (chkKeyArray[i] ==  Agentgrid[ix].data.Id) {

                            chkindex = this.statStore.getAt(ix);
                            this.grid.getSelectionModel().select(chkindex, true);

                        }
                    }
                }
            }

        } else {

            if (chkKeyArray !== undefined) {

                for (ix = 0, ixLen = Agentgrid.length; ix < ixLen; ix++) {
                    // 체크값 전부 해지
                    chkindex = this.statStore.getAt(ix);
                    this.grid.getSelectionModel().deselect(chkindex, true);
                }

                // max가 4개라고 기준 정의
                for (i = 0, iLen = chkKeyArray.length; i < iLen; i++) {

                    for (ix = 0, ixLen = Agentgrid.length; ix < ixLen; ix++) {
                        // Agent 값 비교해서 같으면 체크 처리
                        if (chkKeyArray[i] == Agentgrid[ix].data.Id) {

                            chkindex = this.statStore.getAt(ix);
                            this.grid.getSelectionModel().select(chkindex, true);

                        }
                    }
                }

            } else {

                for (ix = 0, ixLen = Agentgrid.length; ix < ixLen; ix++) {
                    // 체크값 전부 해지
                    chkindex = this.statStore.getAt(ix);
                    this.grid.getSelectionModel().deselect(chkindex, true);
                }

            }

        }

    },

    addList : function() {

        var store = this.grid.getStore();
        var TuxServerObj =  Comm.tuxInfoObj;
        var ix, ixLen, keys, key, TuxObj;

        keys = Object.keys(TuxServerObj);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key   = keys[ix];
            TuxObj = TuxServerObj[key];

            this.stat.push({ 'Index': ix, 'Id': TuxObj['id'],'Name': TuxObj['name'], 'host': TuxObj['host']});
        }

        store.loadData(this.stat);

    },
    /**
     * 에러 레벨 콤보박스에 보여지는 데이터 설정
     */
    setComboBoxData: function() {
        var limitComboData = [
            { name: 50,  value: 50  },
            { name: 100, value: 100 },
            { name: 200, value: 200 },
            { name: 'ALL', value: 'ALL' }
        ];

        this.limitCombo.setData(limitComboData);
        this.limitCombo.setSearchField('name');

        var commandComboData = [
            { name: 'psr',  value: 'psr'  },
            { name: 'psc',  value: 'psc'  },
            { name: 'pclt', value: 'pclt' },
            { name: 'pq',   value: 'pq'    }
        ];

        this.commandNameCombo.setData(commandComboData);
        this.commandNameCombo.setSearchField('name');

        var intervalComboData = [
            { name: 10,    value: 10  },
            { name: 30,    value: 30  },
            { name: 60,    value: 60  }
        ];

        this.executeIntervalCombo.setData(intervalComboData);
        this.executeIntervalCombo.setSearchField('name');
    },


    /**
     * 그리드 생성
     */
    createGrid: function() {

        // TUX_SERVER (psc)
        this.gridServer = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            hidden        : false,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            onSortChange: function(ct, column) {
                this.executeSQL(column);
            }.bind(this)
        });

        this.gridServer.beginAddColumns();
        this.gridServer.addColumn('time'           , 'time'        , 100, Grid.DateTime, true,  false);
        this.gridServer.addColumn('agent'          , 'was_name'    , 110, Grid.String  , true,  false);
        this.gridServer.addColumn('Prog Name'      , 'name'        ,  80, Grid.String  , true,  false);
        this.gridServer.addColumn('Queue Name'     , 'q_name'      , 150, Grid.String  , true,  false);
        this.gridServer.addColumn('Grp Name'       , 'grp_name'    ,  80, Grid.String  , true,  false);
        this.gridServer.addColumn('ID'             , 'svr_id'      ,  80, Grid.Number  , true,  false);
        this.gridServer.addColumn('RqDone'         , 'reqc'        ,  80, Grid.Number  , true,  false);
        this.gridServer.addColumn('Load Done'      , 'reqd'        , 110, Grid.Number  , true,  false);
        this.gridServer.addColumn('Current Service', 'curr_service', 150, Grid.String  , true,  false);
        this.gridServer.endAddColumns();
        this.gridServer.setOrderAct('reqc', 'desc');  // service

        // TUX_SERVICE (psc)
        this.gridService = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            hidden        : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            onSortChange: function(ct, column) {
                this.executeSQL(column);
            }.bind(this)
        });

        this.gridService.beginAddColumns();
        this.gridService.addColumn('time'        , 'time'      , 100, Grid.DateTime, true,  false);
        this.gridService.addColumn('agent'       , 'was_name'  , 110, Grid.String  , true,  false);
        this.gridService.addColumn('Service Name', 'svc_name'  , 120, Grid.String  , true,  false);
        this.gridService.addColumn('Grp Name'    , 'srv_grp'   ,  80, Grid.String  , true,  false);
        this.gridService.addColumn('Prog Name'   , 'prog_name' ,  80, Grid.String  , true,  false);
        this.gridService.addColumn('Status'      , 'status'    ,  80, Grid.Number  , true,  false);
        this.gridService.addColumn('Machine'     , 'lmid'      ,  80, Grid.String  , true,  false);
        this.gridService.addColumn('ID'          , 'srv_id'    ,  80, Grid.Number  , true,  false);
        this.gridService.addColumn('Routine Name', 'svc_rname'  , 120, Grid.String  , true,  false);
        this.gridService.addColumn('# done'      , 'ncompleted',  80, Grid.Number  , true,  false);
        this.gridService.endAddColumns();

        // TUX_CLIENT (pclt)
        this.gridClient = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            hidden        : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            onSortChange: function(ct, column) {
                this.executeSQL(column);
            }.bind(this)
        });

        this.gridClient.beginAddColumns();
        this.gridClient.addColumn('Time'                  , 'start_time', 100, Grid.DateTime, true,  false);
        this.gridClient.addColumn('agent'                 , 'was_name'  , 110, Grid.String  , true,  false);
        this.gridClient.addColumn('Machine'               , 'lmid'      ,  80, Grid.String  , true,  false);
        this.gridClient.addColumn('User Name'             , 'user_name' ,  80, Grid.String  , true,  false);
        this.gridClient.addColumn('Client Name'           , 'cli_name'  ,  80, Grid.String  , true,  false);
        this.gridClient.addColumn('Transactions Begun'    , 'tran'      , 110, Grid.Number  , true,  false);
        this.gridClient.addColumn('Transactions Committed', 'trancmt'   ,  80, Grid.Number  , true,  false);
        this.gridClient.addColumn('Transactions Aborted'  , 'tranabt'   ,  80, Grid.Number  , true,  false);
        this.gridClient.addColumn('Status'                , 'status'    ,  80, Grid.Number  , true,  false);
        this.gridClient.endAddColumns();

        // TUX_QUEUE (pq)
        this.gridQueue = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            hidden        : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            onSortChange: function(ct, column) {
                this.executeSQL(column);
            }.bind(this)
        });

        this.gridQueue.beginAddColumns();
        this.gridQueue.addColumn('time'      , 'time'        , 100, Grid.DateTime, true,  false);
        this.gridQueue.addColumn('agent'     , 'was_name'    , 110, Grid.String  , true,  false);
        this.gridQueue.addColumn('Prog Name' , 'server_name' ,  80, Grid.String  , true,  false);
        this.gridQueue.addColumn('Queue Name', 'rqaddr'      ,  80, Grid.String  , true,  false);
        this.gridQueue.addColumn('# Serve'   , 'server_cnt'  ,  80, Grid.Number  , true,  false);
        this.gridQueue.addColumn('Wk Queued' , 'ntotwkqueued', 100, Grid.Number  , true,  false);
        this.gridQueue.addColumn('Machine'   , 'lmid'        , 110, Grid.String  , true,  false);
        this.gridQueue.addColumn('# Queued'  , 'wkqueued'    , 100, Grid.Number  , true,  false);
        this.gridQueue.endAddColumns();

        this.centerArea.add(this.gridServer, this.gridService, this.gridClient, this.gridQueue);

        this.gridServer.drawGrid();
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
     * Tmadmin 데이터 로드
     * 데이터 새로 고침 간격은 설정된 간격으로 실행한다.
     */
    frameRefresh: function() {
        this.stopRefreshData();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp && this.autoRefreshCheck) {
            this.executeSQL();
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 1000 * this.intervalTime);
    },


    /**
     * 쿼리 실행
     */
    executeSQL: function(column) {
        var lastTime, commandValue, sqlFile,
            fromtime, totime, chkKeyArray, idArr,
            limitString, orderByStr, limitValue;

        lastTime = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if (Comm.RTComm.isValidDate(lastTime) !== true) {
            console.debug('%c [Tuxedp Tmadmin] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            lastTime = new Date(this.beforeLastestTime);

        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        // 조회 대상이 되는 실행 명령어
        commandValue = this.commandNameCombo.value;

        // 실행 명령어에 따라 실행되는 쿼리 설정.
        sqlFile = this.sql[commandValue];

        // 조회 범위 설정 - 최근 시간에서 설정된 실행 간격의 전 데이터 조회
        this.intervalTime = this.executeIntervalCombo.value;

        fromtime   = Ext.Date.format(Ext.Date.subtract(lastTime, Ext.Date.SECOND, this.intervalTime), 'Y-m-d H:i:s.u');
        totime     = Ext.Date.format(lastTime, 'Y-m-d H:i:s.u');
        limitValue = this.limitCombo.getValue();

        if (this.useTuxAgent) {
            chkKeyArray = this.enValueJson[1];
            idArr = chkKeyArray.join(',');

        } else {
            idArr = Comm.selectedTuxArr.join(',');

        }

        if (this.limitCombo.getValue() === 'ALL') {
            limitString = '';
        } else {
            if (Comm.currentRepositoryInfo.database_type == 'PostgreSQL') {
                limitString = 'limit ' + limitValue;
            } else if ( Comm.currentRepositoryInfo.database_type == 'MSSQL' ) {
                limitString = 'top ' + limitValue;
            } else {
                limitString = 'AND ROWNUM <= ' + limitValue;
            }
        }

        if (column && column.dataIndex) {
            orderByStr = 'order by ' + column.dataIndex + ' ' + column.sortState;
        } else {
            orderByStr = '';
        }

        WS.SQLExec({
            sql_file: sqlFile,
            bind: [
                { name: 'from_time', value: fromtime, type: SQLBindType.STRING },
                { name: 'to_time',   value: totime,   type: SQLBindType.STRING }
            ],
            replace_string: [{
                name : 'was_id',
                value:  idArr
            }, {
                name : 'limit',
                value: limitString
            }, {
                name : 'orderByStr',
                value : orderByStr
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm) {
                return;
            }

            var isValid = common.Util.checkSQLExecValid(aheader, adata);

            if (isValid) {
                this.drawData(adata, aheader.command);
            }

        }, this);
    },


    /**
     * tmadmin 데이터 그리기
     *
     * @param {object} adata - 조회 데이터
     */
    drawData: function(adata, sqlCommand) {
        var data, ix, ixLen;
        var isChangeCmd = false;

        if (!this.displayGrid) {
            this.displayGrid = this.gridServer;
        }

        if (this.beforeSqlCommand !== sqlCommand) {
            isChangeCmd = true;
        }

        if (this.sql.psr === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridServer;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('average', 'desc'); // psr
            }

        } else if (this.sql.psc === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridService;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('qcount', 'desc');  // psc
            }

        } else if (this.sql.pclt === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridClient;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('cq_count', 'desc'); // pclt
            }

        } else if (this.sql.pq === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridQueue;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('count', 'desc');  // pq
            }
        }

        this.beforeSqlCommand = sqlCommand;

        if (this.displayGrid) {
            this.displayGrid.clearRows();

            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                data = adata.rows[ix];
                this.displayGrid.addRow(data.concat());
            }

            this.displayGrid.drawGrid();
        }

        adata = null;
        data  = null;
    }


});
