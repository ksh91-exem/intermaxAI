Ext.define('rtm.src.rtmTPTmadmin', {
    extend : 'Exem.DockForm',
    title  : 'TP ' + common.Util.CTR('Realtime tmadmin'),
    layout: 'fit',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function(me) {
            me.isClosedDockForm = true;

            me.stopRefreshData();

            me.gridProcStat.removeAll();
            me.gridSvrStat.removeAll();
            me.gridSvcStat.removeAll();
            me.gridClientInfo.removeAll();
        }
    },

    sql: {
        st_p  : 'IMXRT_TP_Svr_Proc_Stat.sql',   // 프로세스 수
        st_v  : 'IMXRT_TP_Svr_Stat.sql',        // 큐잉 수
        st_s_x: 'IMXRT_TP_Svc_Stat.sql',        // 큐잉 시간 (aq 개수, 실패 건수, 에러 건수)
        ci    : 'IMXRT_TP_Client_Info.sql'      // 클라이언트 수
    },

    initProperty: function() {
        var saveKey, viewData;
        if (!this.componentId) {
            // 신규 dock 화면 추가 하면 componentid를 새로 만든다.
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.objOption = Comm.RTComm.getTPtmadminGroupList(this.componentId);

        this.enValueJson = [];

        // 실시간 TP tmadmin 모니터링인 경우 체크 4분할 화면
        if (this.componentId.indexOf('dash-rtm-rtmTPTmadmin-ext-7') !== -1) {
            this._dashboardDatset(this.componentId);
            Comm.RTComm.saveTPtmadminGroupList(this.componentId,  this.enValueJson);
        } else {
            // tmadmin 새로만들면 처름에는 무조건 objOption 값은 null 이다.
            if (this.objOption) {
                // WebEvn에 데이타가 있는경우
                saveKey  = Comm.RTComm.getEnvKeyTPtmadminGroupList();
                viewData = Comm.web_env_info[saveKey];

                if (typeof viewData !== 'object') {
                    viewData = JSON.parse(viewData);
                }

                // 적용 // 미적용
                this.useTPAgent = viewData.data[this.componentId][0];
                // 에이전트 선택 데이타.
                this.enValueJson[1] = viewData.data[this.componentId][1];

            } else {
                // WebEvn에 데이타가 없는경우
                this.useTPAgent = false;
                this.enValueJson.push(this.useTPAgent);
                Comm.RTComm.saveTPtmadminGroupList(this.componentId,  this.enValueJson);
            }
        }

        this.monitorType  = 'TP';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.beforeSqlCommand = '';

        this.autoRefreshCheck = true;

        this.intervalTime = 60;
    },

    _dashboardDatset: function(id) {
        var cmpId = id;
        var key1,key2,key3,key4;
        // 초기값은 true  셋팅
        this.useTPAgent = true;

        // TP Agent 갯수
        var tpAgentLength =  Object.keys(Comm.tpInfoObj).length;

        this.enValueJson.push(this.useTPAgent);
        // 실시간모니터링 화면에서는 옵션값을 강제로 셋팅.
        this.objOption = true;


        if (tpAgentLength === 1) {
            key1 = Object.keys(Comm.tpInfoObj)[0];
            key2 = Object.keys(Comm.tpInfoObj)[0];
            key3 = Object.keys(Comm.tpInfoObj)[0];
            key4 = Object.keys(Comm.tpInfoObj)[0];
        } else if (tpAgentLength === 2) {
            key1 = Object.keys(Comm.tpInfoObj)[0];
            key2 = Object.keys(Comm.tpInfoObj)[1];
            key3 = Object.keys(Comm.tpInfoObj)[0];
            key4 = Object.keys(Comm.tpInfoObj)[0];
        } else if (tpAgentLength === 3) {
            key1 = Object.keys(Comm.tpInfoObj)[0];
            key2 = Object.keys(Comm.tpInfoObj)[1];
            key3 = Object.keys(Comm.tpInfoObj)[2];
            key4 = Object.keys(Comm.tpInfoObj)[0];
        } else if (tpAgentLength === 4 || tpAgentLength > 5) {
            key1 = Object.keys(Comm.tpInfoObj)[0];
            key2 = Object.keys(Comm.tpInfoObj)[1];
            key3 = Object.keys(Comm.tpInfoObj)[2];
            key4 = Object.keys(Comm.tpInfoObj)[3];
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
                    me.el.on('click', function() {
                        // this.createTmadminOptionWindow.show();
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
            text   : 'TP ' + common.Util.CTR('Realtime tmadmin')
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
            this.up().setTitle('TP ' + this.title);
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
            bodyStyle   : {'border-bottom-width':'1px' },
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
                        this.useTPAgent = toggleOnOff.getValue();

                        this.enValueJson = [];
                        this.enValueJson.push(this.useTPAgent);
                        this.enValueJson.push(envAgentVal);

                        Comm.RTComm.saveTPtmadminGroupList(this.componentId, this.enValueJson);

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

        if (this.objOption && this.useTPAgent) {

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
        var TPserverObj =  Comm.tpInfoObj;
        var ix, ixLen, keys, key, TPobj;

        keys = Object.keys(TPserverObj);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key   = keys[ix];
            TPobj = TPserverObj[key];

            this.stat.push({ 'Index': ix, 'Id': TPobj['id'],'Name':  TPobj['name'], 'host':  TPobj['host']});
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
            {name: 'st -v',    value: 'st_v'  },
            {name: 'st -p',    value: 'st_p'  },
            {name: 'st -s -x', value: 'st_s_x'},
            {name: 'ci',       value: 'ci'    }
        ];

        this.commandNameCombo.setData(commandComboData);
        this.commandNameCombo.setSearchField( 'name' );

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

        // SVR_PROC_Stat (st -p)
        this.gridProcStat = Ext.create('Exem.BaseGrid', {
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

        this.gridProcStat.beginAddColumns();
        this.gridProcStat.addColumn('time',          'time'        , 100, Grid.DateTime     , true,  false);
        this.gridProcStat.addColumn('agent',         'was_name'    , 110, Grid.String       , true,  false);
        this.gridProcStat.addColumn('clhno',         'clhno'       ,  80, Grid.Number       , true,  false);
        this.gridProcStat.addColumn('svrname',       'svrname'     , 120, Grid.String       , true,  false);
        this.gridProcStat.addColumn('pid',           'pid'         ,  80, Grid.StringNumber , true,  false);
        this.gridProcStat.addColumn('status',        'status'      ,  80, Grid.String       , true,  false);
        this.gridProcStat.addColumn('count',         'count'       ,  80, Grid.Number       , true,  false);
        this.gridProcStat.addColumn('average',       'average'     ,  80, Grid.Float        , true,  false);
        this.gridProcStat.addColumn('no',            'no'          ,  80, Grid.Number       , false, false);
        this.gridProcStat.addColumn('svgname',       'svgname'     ,  80, Grid.String       , false, false);
        this.gridProcStat.addColumn('gid1',          'gid1'        ,  80, Grid.Number       , false, false);
        this.gridProcStat.addColumn('gid2',          'gid2'        ,  80, Grid.Number       , false, false);
        this.gridProcStat.addColumn('gid_seqno',     'gid_seqno'   ,  80, Grid.Number       , false, false);
        this.gridProcStat.addColumn('svcname',       'service'     , 100, Grid.String       , false, false);
        this.gridProcStat.addColumn('fail_cnt',      'fail_cnt'    ,  80, Grid.Number       , false, false);
        this.gridProcStat.addColumn('err_cnt',       'err_cnt'     ,  80, Grid.Number       , false, false);
        this.gridProcStat.addColumn('usravg',        'usravg'      ,  80, Grid.Float        , false, false);
        this.gridProcStat.addColumn('usrmin',        'usrmin'      ,  80, Grid.Float        , false, false);
        this.gridProcStat.addColumn('usrmax',        'usrmax'      ,  80, Grid.Float        , false, false);
        this.gridProcStat.addColumn('sysavg',        'sysavg'      ,  80, Grid.Float        , false, false);
        this.gridProcStat.addColumn('sysmin',        'sysmin'      ,  80, Grid.Float        , false, false);
        this.gridProcStat.addColumn('sysmax',        'sysmax'      ,  80, Grid.Float        , false, false);
        this.gridProcStat.addColumn('mintime',       'mintime'     ,  80, Grid.Float        , false, false);
        this.gridProcStat.addColumn('maxtime',       'maxtime'     ,  80, Grid.Float        , false, false);
        this.gridProcStat.endAddColumns();

        // SVR_Stat (st -v)
        this.gridSvrStat = Ext.create('Exem.BaseGrid', {
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

        this.gridSvrStat.beginAddColumns();
        this.gridSvrStat.addColumn('time',          'time'        , 100, Grid.DateTime, true,  false);
        this.gridSvrStat.addColumn('agent',         'was_name'    , 110, Grid.String  , true,  false);
        this.gridSvrStat.addColumn('clhno',         'clhno'       ,  80, Grid.Number  , true,  false);
        this.gridSvrStat.addColumn('svrname',       'svrname'     ,  80, Grid.String  , true,  false);
        this.gridSvrStat.addColumn('status',        'status'      ,  80, Grid.String  , true,  false);
        this.gridSvrStat.addColumn('svri',          'svri'        ,  80, Grid.Number  , true,  false);
        this.gridSvrStat.addColumn('count',         'count'       ,  80, Grid.Number  , true,  false);
        this.gridSvrStat.addColumn('qcount',        'qcount'      ,  80, Grid.Number  , true,  false);
        this.gridSvrStat.addColumn('emcount',       'emcount'     ,  80, Grid.Number  , true,  false);
        this.gridSvrStat.addColumn('qpcount',       'qpcount'     ,  80, Grid.Number  , false, false);
        this.gridSvrStat.endAddColumns();
        this.gridSvrStat.setOrderAct('qcount', 'desc');  // st -v

        // SVC_Stat (st -s -x)
        this.gridSvcStat = Ext.create('Exem.BaseGrid', {
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

        this.gridSvcStat.beginAddColumns();
        this.gridSvcStat.addColumn('time',          'time'        , 100, Grid.DateTime, true,  false);
        this.gridSvcStat.addColumn('agent',         'was_name'    , 110, Grid.String  , true,  false);
        this.gridSvcStat.addColumn('clhno',         'clhno'       ,  80, Grid.Number  , true,  false);
        this.gridSvcStat.addColumn('svcname',       'name'        ,  80, Grid.String  , true,  false);
        this.gridSvcStat.addColumn('count',         'count'       ,  80, Grid.Number  , true,  false);
        this.gridSvcStat.addColumn('cq_count',      'cq_count'    ,  80, Grid.Number  , true,  false);
        this.gridSvcStat.addColumn('aq_count',      'aq_count'    ,  80, Grid.Number  , true,  false);
        this.gridSvcStat.addColumn('average',       'average'     ,  80, Grid.Float   , true,  false);
        this.gridSvcStat.addColumn('q_average',     'q_average'   ,  80, Grid.Float   , true,  false);
        this.gridSvcStat.addColumn('no',            'no'          ,  80, Grid.Number  , false, false);
        this.gridSvcStat.addColumn('status',        'status'      ,  80, Grid.String  , false, false);
        this.gridSvcStat.addColumn('usravg',        'usravg'      ,  80, Grid.Float   , false, false);
        this.gridSvcStat.addColumn('usrmin',        'usrmin'      ,  80, Grid.Float   , false, false);
        this.gridSvcStat.addColumn('usrmax',        'usrmax'      ,  80, Grid.Float   , false, false);
        this.gridSvcStat.addColumn('sysavg',        'sysavg'      ,  80, Grid.Float   , false, false);
        this.gridSvcStat.addColumn('sysmin',        'sysmin'      ,  80, Grid.Float   , false, false);
        this.gridSvcStat.addColumn('sysmax',        'sysmax'      ,  80, Grid.Float   , false, false);
        this.gridSvcStat.addColumn('fail_count',    'fail_count'  ,  80, Grid.Number  , false, false);
        this.gridSvcStat.addColumn('error_count',   'error_count' ,  80, Grid.Number  , false, false);
        this.gridSvcStat.addColumn('mintime',       'mintime'     ,  80, Grid.Float   , false, false);
        this.gridSvcStat.addColumn('maxtime',       'maxtime'     ,  80, Grid.Float   , false, false);
        this.gridSvcStat.endAddColumns();

        // Client Info (ci)
        this.gridClientInfo = Ext.create('Exem.BaseGrid', {
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

        this.gridClientInfo.beginAddColumns();
        this.gridClientInfo.addColumn('time',       'time'        , 100, Grid.DateTime, true,  false);
        this.gridClientInfo.addColumn('agent',      'was_name'    , 110, Grid.String  , true,  false);
        this.gridClientInfo.addColumn('cli_id',     'cli_id'      ,  80, Grid.Number  , true,  false);
        this.gridClientInfo.addColumn('clid',       'clid'        ,  80, Grid.Number  , true,  false);
        this.gridClientInfo.addColumn('status',     'status'      ,  80, Grid.String  , true,  false);
        this.gridClientInfo.addColumn('count',      'count'       ,  80, Grid.Number  , true,  false);
        this.gridClientInfo.addColumn('idle',       'idle'        ,  80, Grid.Number  , true,  false);
        this.gridClientInfo.addColumn('ipaddr',     'ipaddr'      , 110, Grid.String  , true,  false);
        this.gridClientInfo.addColumn('usrname',    'usrname'     ,  80, Grid.String  , true,  false);
        this.gridClientInfo.endAddColumns();

        this.centerArea.add(this.gridProcStat, this.gridSvrStat, this.gridSvcStat, this.gridClientInfo);

        this.gridProcStat.drawGrid();
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
            console.debug('%c [TP Tmadmin] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

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

        if (this.useTPAgent) {
            chkKeyArray = this.enValueJson[1];
            idArr = chkKeyArray.join(',');

        } else {
            idArr = Comm.selectedTpArr.join(',');

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
            this.displayGrid = this.gridProcStat;
        }

        if (this.beforeSqlCommand !== sqlCommand) {
            isChangeCmd = true;
        }

        if (this.sql.st_p === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridProcStat;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('average', 'desc'); // st -p
            }

        } else if (this.sql.st_v === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridSvrStat;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('qcount', 'desc');  // st -v
            }

        } else if (this.sql.st_s_x === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridSvcStat;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('cq_count', 'desc'); // st -s -x
            }

        } else if (this.sql.ci === sqlCommand) {
            this.displayGrid.setVisible(false);
            this.displayGrid = this.gridClientInfo;
            this.displayGrid.setVisible(true);

            if (isChangeCmd) {
                this.displayGrid.setOrderAct('count', 'desc');  // ci
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
