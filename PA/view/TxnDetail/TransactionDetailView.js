Ext.define("view.TransactionDetailView", {
    extend: "Ext.container.Container",
    title : common.Util.TR('Transaction Detail'),
    closable: true,
    width: '100%',
    height: '100%',
    layout: 'fit',
    cls: 'txn-detail-container',

    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
            _.each(this.callTreeList, function(callTree) {
                callTree.isClosed = true;
            });
        },


        activate: function(){
            try {

                var connections = jsPlumb.getConnections({scope: 'path' + this.id});

                for(var i = 0, len = connections.length; i < len ; i++){
                    jsPlumb.repaint(connections[i].target[0].id);
                }
            } catch (e) {
                console.error(e.message);
            }
        }

    },

    constructor: function () {
        this.callTreeExcludeData = {};
        this.excludeForm = {TP : null, WAS : null, CD : null};

        this.methodSummaryData = [];
        this.callTreePopUpInfo = {
            idList: [],
            tabList: {}
        };
        this.callTreeInfo = {
            sqlCount: 0,
            dataList: {},
            sortList: [],
            isLoaded: false
        };

        this.draw_flag = {
            sql_list: false,
            active_history: false,
            execption: false,
            method_summary: false,
            user_data: false
        } ;

        this.sqlDataList = {};

        this.callParent(arguments);
        this.initLayouts();

    },

    initLayouts: function() {

        // HEAD LAYER
        this.headLayer = Ext.create('Ext.container.Container',{
            layout: 'fit',
            height: 70,
            width: '100%',
            cls: 'txn-detail-info-header'
        });

        // BODY LAYER
        this.sideNavLayer = Ext.create('Ext.container.Container',{
            layout: 'fit',
            height : '100%',
            width: 180,
            //cls: 'txn-detail-body-sidenav'
            cls : 'txn-detail-center-side'
        });


        this.contentsLayer = Ext.create('Ext.container.Container',{
            layout: 'fit',
            height : '100%',
            flex : 1,
            cls: 'txn-detail-body-contents',
            listeners: {
                resize: function(){
                    try {
                        var center, connections;

                        center = this.contentsLayer.el.dom;

                        if(center.children.length) {
                            connections = jsPlumb.getConnections({scope : this.txnPathDOM.id});
                            for(var i = 0, len = connections.length; i < len ; i++){
                                jsPlumb.repaint(connections[i].target[0].id);
                            }
                        } else {
                            console.info('jsPlumb Connection not Found');
                        }
                    } catch (e) {
                        console.error(e.message);
                    }
                }.bind(this)
            }
        });

        this.bodyLayer = Ext.create('Ext.container.Container',{
            layout: 'hbox',
            height : '100%',
            width: '100%',
            flex : 1,
            minHeight : 400,
            cls: 'txn-detail-center',
            items : [this.sideNavLayer, this.contentsLayer]
        });


        this.backgroundLayer = Ext.create('Ext.container.Container',{
            layout: 'vbox',
            width : '100%',
            height: '100%',
            minHeight: 500,
            cls   : 'txn-detail-background',
            items : [this.headLayer, this.bodyLayer]
        });


        this.bodyLayer.add([this.sideNavLayer, this.contentsLayer]);
        this.add(this.backgroundLayer);

        if (Comm.isBGF) {
            var prevBtn = document.createElement('img');
            prevBtn.style.opacity = 0.5;
            prevBtn.src = '../images/realtime/left_arrow.png';
            prevBtn.style.position = 'absolute';
            prevBtn.style.top = '42px';
            prevBtn.style.left = '10px';
            prevBtn.style.cursor = 'pointer';
            prevBtn.onclick = function() {
                me.destroy();
            };
            prevBtn.onmouseover = function() {
                this.style.opacity = 1;
            };
            prevBtn.onmouseout = function() {
                this.style.opacity = 0.5;
            };
            setTimeout(function() {
                me.headLayer.getEl().appendChild(prevBtn);
            }, 10);
        }

    },


    init: function() {
        // temp code RTM장기추이에 타임라인 포함 가능 시. 변경 예정
        this.useTimeLine = common.Menu.useTxnDetailTimeLine;

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        }) ;

        this.loadingMask.showMask();

        // step1. initialized properties
        this.initProperty();

        // step2. append Default Fixed DOM
        if(this.useTimeLine) {
            this.createTimeLine();
        }
        this.createHeader();
        this.createSideNav();

        // step3. get a Top TID
        this.execInitQuery();
    },


    initProperty: function(){

        this.monitorType = !this.monitorType ? window.rtmMonitorType : this.monitorType;
        this.webEnvKey = this.monitorType === 'CD' ? 'pa_cd_txn_detail_menu_conf' : 'pa_txn_detail_menu_conf';


        var textModeKey = 'pa_txn_path_call_tree_text_mode';

        if ( Comm.web_env_info[textModeKey] == undefined ){
            this.last_text_mode = true;
        }else{
            this.last_text_mode = (Comm.web_env_info[textModeKey] === true || Comm.web_env_info[textModeKey] === 'true');
        }

        var checkElapseKey = 'pa_txn_path_call_tree_check_elapse';

        if ( Comm.web_env_info[checkElapseKey] == undefined ){
            this.last_check_elapse = false;
        }else{
            this.last_check_elapse = (Comm.web_env_info[checkElapseKey] === true || Comm.web_env_info[checkElapseKey] === 'true');
        }

        this.width = null;
        this.height = null;
        this.headerHeight = 100;
        this.webInfo = null;
        this.container = null;
        this.txnPathClass = null;
        this.callTreeList = {};
        this.callTreeBuffer = {};
        this.isException = null;
        this.remoteValue = 0;
        this.processCount = {
            exception: 0,
            etoeInfo : 0
        };
        this.exceptBufferNumber = 0;
        this.exceptionCnt = 0;  //query 수행 종료시점용
        this.activeHistoryCnt = 0;
        this.$loading = $('#spinLoading');
        this.store = {
            activeHistory : null,
            remoteCall : null,
            exception: null,
            methodSummary: null
        };
        this.exceptionData = {
            root : '.',
            children : []
        };

        this.userDataCodeReplaceData = [];

        this.startTime = Ext.Date.format(new Date(this.startTime), 'Y-m-d  H:i:s');
        this.endTime = Ext.Date.format(new Date(this.endTime), 'Y-m-d  H:i:s');

        this.target = this.id;

        this.$target = $(this.el.dom);
        this.width = this.$target.width();
        this.height = this.$target.height();

        this.contentsList = [];

        if(this.monitorType === 'CD') {
            this.defaultNav = [{
                id : 'callTree',
                callFn : this.loadCallTree,
                name : 'Call Tree',
                use : true
            }, {
                id : 'txnPath',
                callFn : this.loadTxnPath,
                name : 'Transaction Path',
                use : true
            }, {
                id : 'sqlList',
                callFn : this.loadSqlList,
                name : 'SQL List',
                use : true
            }, {
                id : 'exception',
                callFn : this.loadException,
                name : 'Exception',
                use : true
            }, {
                id : 'methodSummary',
                callFn : this.loadMethodSummary,
                name : 'Method Summary',
                use : true
            }, {
                id : 'userData',
                callFn : this.loadUserData,
                name : 'User Data',
                use : true
            }];
        }
        else {
            this.defaultNav = [{
                id : 'callTree',
                callFn : this.loadCallTree,
                name : 'Call Tree',
                use : true
            }, {
                id : 'txnPath',
                callFn : this.loadTxnPath,
                name : 'Transaction Path',
                use : true
            }, {
                id : 'sqlList',
                callFn : this.loadSqlList,
                name : 'SQL List',
                use : true
            }, {
                id : 'exception',
                callFn : this.loadException,
                name : 'Exception',
                use : true
            }, {
                id : 'activeHistory',
                callFn : this.loadActiveHistory,
                name : 'Active History',
                use : true
            }, {
                id : 'methodSummary',
                callFn : this.loadMethodSummary,
                name : 'Method Summary',
                use : true
            }, {
                id : 'userData',
                callFn : this.loadUserData,
                name : 'User Data',
                use : true
            }];
        }


        this.uselessNav = [];
        var ix, ixLen, jx, jxLen;

        if(Comm.web_env_info[this.webEnvKey]) {
            this.uselessNav = Comm.web_env_info[this.webEnvKey]['uselessNav'];
            for(ix=0, ixLen=this.uselessNav.length; ix<ixLen; ix++) {
                for(jx=0, jxLen=this.defaultNav.length; jx<jxLen; jx++) {
                    if(this.uselessNav[ix].id == this.defaultNav[jx].id) {
                        this.uselessNav[ix]['callFn'] =  this.defaultNav[jx].callFn;
                    }
                }
            }

            this.navList = Comm.web_env_info[this.webEnvKey]['useNav'];
            for(ix=0, ixLen=this.navList.length; ix<ixLen; ix++) {
                for(jx=0, jxLen=this.defaultNav.length; jx<jxLen; jx++) {
                    if(this.navList[ix].id == this.defaultNav[jx].id) {
                        this.navList[ix]['callFn'] =  this.defaultNav[jx].callFn;
                    }
                }
            }
        } else {
            this.navList = this.defaultNav;
        }

        this.wasData = null;
        this.dbData = null;
        this.sqlData = null;
        this.isAsync = null;
        this.isExistAsyncData = null;
        this.callTreeData = null;
        this.sqlListData = null;
        this.clientData = null;
        this.webData = null;

        this.bodyContentsDOM = this.contentsLayer.el.dom;
        this.txnPathDOM = document.createElement('div');
        this.$txnPathDOM = $(this.txnPathDOM);

        var elapseFilter = Comm.web_env_info.Intermax_DetailElapse || 1;

        this.txnPathClass = new XMTransactionPath({
            id: this.target,
            $target : this.$txnPathDOM,
            elapsefilter: this.isMicroUnit ? (+elapseFilter)*1000 : elapseFilter,
            param: {
                detail_view: this,
                topTid     : this.tid,
                startTime  : this.startTime,
                endTime    : this.endTime,
                center_side: this.sideNavLayer,
                unitedBody : true,
                monitorType : this.monitorType,
                isMicroUnit : null
            }
        });

        this.txnPathClass_sap = new XMTransactionPath_sap({
            id: this.target,
            $target : this.$txnPathDOM,
            //$center_target: $centerLayer,
            elapsefilter: this.isMicroUnit ? (+elapseFilter)*1000 : elapseFilter,
            param: {
                detail_view: this,
                topTid     : this.tid,
                startTime  : this.startTime,
                endTime    : this.endTime,
                center_side: this.sideNavLayer
            }
        });

        this.txnPathClass.asyncInfo = {
            asyncTidList: [],
            replyInfo: [],
            executeAsyncCount: 0
        };

        this.txnPathReplyInfo = [];
        this.asyncQueryCnt = 0;

        this.pathDataArr = [];

        this.loadDone = false;
        this.isMicroUnit = false;     // C Daemon 관련 속성값. 해당 속성이 True가 되면 TimeLine의 Elapse Value를 Micro로 통일
    },

    createTimeLine: function() {
        var theme = Comm.RTComm.getCurrentTheme();
        var colorObj, borderStyle;

        if(!this.isRTM) {
            theme = 'White';
        }
        switch(theme) {
            case 'White':
                colorObj = {
                    headBackground : '#DBDBDB',
                    rowBackground : '#FFFFFF',
                    lineBar : '#0E6ABD',
                    border : '#CBCACA',
                    text : '#000000',
                    multiBar : Comm.RTComm.realtime.DefaultColors
                };
                borderStyle = 'margin : 0 0 6px 0 !important;  border-bottom : 4px solid #CBCACA !important;';
                break;
            case 'Gray':
                colorObj = {
                    headBackground : '#282B32',
                    rowBackground : '#363940',
                    lineBar : '#4B9AFF',
                    border : '#50555C',
                    text : '#A5A9B0',
                    multiBar : Comm.RTComm.realtime.DefaultColors
                };
                borderStyle = 'margin : 0 0 6px 0 !important;  border-bottom : 4px solid #212228 !important;';
                break;
            case 'Black':
                colorObj = {
                    headBackground : '#252424',
                    rowBackground : '#000000',
                    lineBar : '#4B9AFF',
                    border : '#50555C',
                    text : '#A5A9B0',
                    multiBar : Comm.RTComm.realtime.DefaultColors
                };
                borderStyle = 'margin : 0 0 6px 0 !important;  border-bottom : 4px solid #2E2E2E !important;';
                break;
            default:
                colorObj = {
                    headBackground : '#DBDBDB',
                    rowBackground : '#FFFFFF',
                    lineBar : '#0E6ABD',
                    border : '#CBCACA',
                    text : '#000000',
                    multiBar : Comm.RTComm.realtime.DefaultColors
                };
                borderStyle = 'margin : 0 0 6px 0 !important; border-bottom : 4px solid #CBCACA !important;';
                break;
        }


        this.timeLineLayer = Ext.create('Exem.Container',{
            layout: 'fit',
            height: 125,
            width: '100%',
            cls: 'txn-detail-timeline-layer',
            style : borderStyle
        });
        this.backgroundLayer.insert(0, this.timeLineLayer);

        this.txnTimeLine = Ext.create('Exem.TimeLine', {
            target        : this.timeLineLayer,
            colorObj      : colorObj,
            showTooltip   : true,
            isSetExtInfo  : true,
            onClickTimeBar: this.onClickTimeBar.bind(this),
            extProcTimeBar: this.extProcTimeBar.bind(this)
        });

    },

    /**********************CREATE DETAIL LAYOUT***************************/

    createHeader : function(){
        this.$infoContainer = $('<div class="txn-detail-info-container">'
            + '<div class="txn-detail-info-name-label">' + common.Util.TR('Agent Name') + '</div><div class="txn-detail-info-wrap"><div class="txn-detail-info-name"><div class="txn-detail-info-name-value"></div></div>'
            + '<div class="txn-detail-bar" style="display:none;"></div>'
            + '<div class="txn-detail-info-detail-wrap"><div class="txn-detail-info-detail"></div>'
            + '<div class="txn-detail-info-start"></div><div class="txn-detail-info-guid"></div></div>'
            + '<div class="txn-detail-bar col" style="display:none;"></div>'
            + '<div class="txn-detail-info-client icon"></div>'
            + '<div class="txn-detail-bar" style="display:none;"></div>'
            + '<div class="txn-detail-info-web icon"><div class="wrap"><div class="txn-detail-info-web-name"></div><div class="txn-detail-info-web-value"></div></div></div>'
            + '<div class="txn-detail-bar" style="display:none;"></div>'
            + '<div class="txn-detail-info-java icon"><div class="wrap"><div class="txn-detail-info-java-name"></div><div class="txn-detail-info-java-value"></div></div></div>'
            + '<div class="txn-detail-bar" style="display:none;"></div>'
            + '<div class="txn-detail-info-db icon"><div class="wrap"><div class="txn-detail-info-db-name"></div><div class="txn-detail-info-db-value"></div></div></div>'
            + '<div class="txn-detail-bar" style="display:none;"></div>'
            + '<div class="txn-detail-info-remote icon"></div>'
            + '<button class="txn-detail-btn-conf rtm-btn" id="' + this.target + '-btn-conf">' + common.Util.TR('Menu Configuration') + '</button></div></div>'
            + '<div class="txn-detail-info-container2">'
            + '<div class="txn-detail-info-url-label">' + common.Util.TR('URL : ') + '</div><div class="txn-detail-info-last-wrap"><div class="txn-detail-info-url"></div></div>');

        this.$infoContainer.on('contextmenu', function(e){
            e.preventDefault();
            e.stopPropagation();
        });

        $(this.headLayer.el.dom).append(this.$infoContainer);

        $('#' + this.target + '-btn-conf').on('click', function() {
            this.showMenuConf();
        }.bind(this));

        this.$infoContainer.find('.txn-detail-info-url-label').hide();
    },

    showMenuConf: function(){
        var uselessList = [], useList = [];
        var ix, ixLen;


        for(ix = 0, ixLen = this.uselessNav.length; ix < ixLen; ix++){
            uselessList.push({id : this.uselessNav[ix].id, name : this.uselessNav[ix].name, title : common.Util.TR(this.uselessNav[ix].name), callFn : this.uselessNav[ix].callFn});
        }

        for(ix = 0, ixLen = this.navList.length; ix<ixLen; ix++) {
            useList.push({id : this.navList[ix].id, name : this.navList[ix].name, title : common.Util.TR(this.navList[ix].name), callFn : this.navList[ix].callFn});
        }

        var orderingWindow = Ext.create('Exem.MoveColumnWindow', {
            width : 800,
            height : 500,
            parent : this,
            title : common.Util.TR('Menu Configuration'),
            columnInfo : uselessList,
            useColumnInfo : useList,
            orderMode : true,
            useDefaultBtn : false,
            leftGridTitle : common.Util.TR('Unused Menu'),
            rightGridTitle : common.Util.TR('Used Menu'),
            okFn : this.applyOrder,
            baseCls : 'xm-window-base',
            bodyCls : 'xm-window-body',
            overflowX : 'hidden',
            overflowY : 'hidden',
            style : {
                'border': '5px solid #424242',
                'border-radius': '6px',
                'background': '#424242'
            },
            header : {
                height: 40
            },
            maximizable : false,
            ghost : false,
            draggable : false,
            resizable   : false,
            shadow: false
        });


        orderingWindow.addListener('render', function(){
            if(! orderingWindow.isDock){
                $('#' + orderingWindow.id).draggable({
                    handle: '#' + orderingWindow.header.id
                });
            }
        }, this);

        orderingWindow.initBase();
    },

    applyOrder: function(orderStore, oriStore) {
        var parent = this.parent;

        var ix, ixLen, tmpData, tmpIdx, isExistException = false;
        var retObj = {};

        var sideDOM = parent.sideNavLayer.el.dom;
        var contentsDOM = parent.contentsLayer.el.dom;

        var orderLen = orderStore.getCount();
        if(!orderLen) {
            Ext.MessageBox.show({
                title   : common.Util.TR('Warning'),
                icon    : Ext.MessageBox.WARNING,
                message : common.Util.TR('Please select at least one menu item.'),
                modal   : true,
                cls     : 'popup-message',
                buttons : Ext.Msg.OK,
                renderTo : this.el.dom
            });
            return;
        }

        /* 전체 초기화 */
        /* DOM 삭제 */
        while(sideDOM.hasChildNodes()) {
            sideDOM.lastChild.onclick = null;
            sideDOM.removeChild(sideDOM.lastChild);
        }
        while(contentsDOM.hasChildNodes()) {
            contentsDOM.removeChild(contentsDOM.lastChild);
        }
        /* Sencha 내부 객체 삭제 (제대로 삭제되지 않으면 센차가 자동으로 생성) */
        parent.sideNavLayer.removeAll();
        parent.contentsLayer.removeAll();


        for(ix=0, ixLen=parent.contentsList.length; ix<ixLen; ix++) {

            if(parent.contentsList[ix].id == 'callTree') {
                parent.callTreeLayer = null;
            } else if(parent.contentsList[ix].id == 'exception') {
                parent.exception = null;
            } else if(parent.contentsList[ix].id == 'txnPath') {
                parent.txnPathClass = null;
            } else if(parent.contentsList[ix].id == 'sqlList') {
                parent.sqlListContainer = null;
            } else if(parent.contentsList[ix].id == 'methodSummary') {
                parent.methodSummary = null;
            } else if(parent.contentsList[ix].id == 'activeHistory') {
                parent.activeHistory = null;
            } else {
                parent.userData = null;
            }
            parent.contentsList[ix].content = null;
        }
        parent.processCount.exception = 0;

        parent.exceptionCnt = 0;  //query 수행 종료시점용
        parent.activeHistoryCnt = 0;

        parent.navList.length = 0;
        parent.uselessNav.length = 0;
        parent.contentsList.length = 0;

        for(ix=0, ixLen=oriStore.getCount(); ix<ixLen; ix++) {
            tmpData = oriStore.getAt(ix).data;
            parent.uselessNav.push({id : tmpData.dataIdx, name : tmpData.name, callFn : tmpData.callFn, use : true});
        }

        for(ix=0, ixLen=orderStore.getCount(); ix<ixLen; ix++) {
            tmpData = orderStore.getAt(ix).data;
            if(tmpData.dataIdx == 'txnPath') {
                parent.reloadTxnPath();
            }

            if(tmpData.dataIdx == 'exception') {
                tmpIdx = ix;
                isExistException = true;
                parent.isDrawNaviExceptionCnt = false;
            }
            parent.navList.push({id : tmpData.dataIdx, name : tmpData.name, callFn : tmpData.callFn, use : true});
        }

        retObj['uselessNav'] = parent.uselessNav;
        retObj['useNav'] = parent.navList;

        common.WebEnv.Save(parent.webEnvKey, retObj);

        parent.createSideNav();

        if(isExistException && tmpIdx != null && tmpIdx > 0) {
            parent.setExceptionData(parent.callTreeData);
        }

        parent.loadFirstContents();

        this.close();

    },

    reloadTxnPath : function() {

        this.clientData = null;
        this.webData = null;

        this.txnPathDOM = null;
        this.$txnPathDOM = null;
        this.txnPathClass = null;
        this.txnPathClass_sap = null;


        this.txnPathDOM = document.createElement('div');
        this.$txnPathDOM = $(this.txnPathDOM);

        var resetConn = jsPlumb.getConnections({scope : 'path' + this.id});
        for(var ix= 0, ixLen = resetConn.length; ix<ixLen; ix++) {
            jsPlumb.detach(resetConn[ix]);
        }

        //여기서 elapsefilter값 받아옵시다.
        if(this.txnPathClass) {
            this.txnPathClass.box_design = null;
            this.txnPathClass.box_connect = null;
        }

        var elapseFilter = Comm.web_env_info.Intermax_DetailElapse || 1;

        this.txnPathClass = new XMTransactionPath({
            id: this.target,
            $target : this.$txnPathDOM,
            elapsefilter: this.isMicroUnit ? (+elapseFilter)*1000 : elapseFilter,
            param: {
                detail_view: this,
                topTid     : this.tid,
                startTime  : this.startTime,
                endTime    : this.endTime,
                calltree   : this.callTreeLayer,
                center_side: this.sideNavLayer,
                unitedBody : true,
                monitorType : this.monitorType,
                isMicroUnit : null
            }
        });

        this.txnPathClass_sap = new XMTransactionPath_sap({
            id: this.target,
            $target : this.$txnPathDOM,
            //$center_target: $centerLayer,
            elapsefilter: this.isMicroUnit ? (+elapseFilter)*1000 : elapseFilter,
            param: {
                detail_view: this,
                topTid     : this.tid,
                startTime  : this.startTime,
                endTime    : this.endTime,
                center_side: this.sideNavLayer
            }
        });

        this.txnPathClass.asyncInfo = {
            asyncTidList: [],
            replyInfo: [],
            executeAsyncCount: 0
        };

    },

    createSideNav : function() {
        var targetDOM = this.sideNavLayer.el.dom;
        var sideDOM, sideTextNode, exceptionDOM;


        for(var ix=0; ix<this.navList.length; ix++) {

            if(this.navList[ix].use) {
                sideDOM = document.createElement('div');
                sideDOM.setAttribute('class', 'txn-side-nav');
                sideDOM.setAttribute('data-tabid', this.navList[ix].id);

                sideTextNode = document.createTextNode(common.Util.TR(this.navList[ix].name));
                sideDOM.appendChild(sideTextNode);

                if(this.navList[ix].id == 'exception') {
                    exceptionDOM = document.createElement('span');
                    exceptionDOM.setAttribute('class', 'nav-exception-cnt');
                    exceptionDOM.setAttribute('style', 'display:none; color:#F00; font-size:12px;');
                    sideDOM.appendChild(exceptionDOM);
                }

                targetDOM.appendChild(sideDOM);

                // onclick에 추가 parameter를 넣고 싶을 때...대신 scope 제어가 좀 어려웠음
                sideDOM.txnContent = this.navList[ix];
                sideDOM.onclick = this.loadContents.bind(this);

            }
        }
        $(this.sideNavLayer.el.dom).on('contextmenu', function(e){
            e.preventDefault();
            e.stopPropagation();
        });


        targetDOM = null;
        sideDOM = null;
        sideTextNode = null;

    },

    /***************INIT QUERY DATA - TOP TID, TID_PATH , HEAD INFO SETTING **********************/

    execInitQuery : function() {
        WS.SQLExec({
            sql_file: 'txn_detail_remote_rd.sql'
        }, function(header, data){
            if(header.rows_affected > 0){
                this.rd = data.rows[0][0];

                WS.StoredProcExec({
                    stored_proc: 'top_tid',
                    bind: [{
                        name: 'tid',
                        type: SQLBindType.LONG,
                        value: this.tid
                    }, {
                        name: 'start_time',
                        type: SQLBindType.STRING,
                        value: this.startTime
                    }]
                }, this.onTopTIDData, this);
            }

        }, this);
    },

    onTopTIDData: function (header, data) {
        var self = this;

        if(this.isClosed || !common){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('txnDetail-onTopTIDData');
            console.debug(header);
            console.debug(data);
            return;
        }


        console.info('call back : ', header.command);

        /**
         * 2014-01-18 remote 탭 삭제
         * result : 0: time, 1: method, 2: ELAPSE_TIME, 3: DEST, 4: METHOD_Id, 5: METHOD_SEQ, 6: port, 7: tid
         */
        if(header.rows_affected && header.rows_affected > 0){
            var r = data.rows;

            if(r[0][7]){
                self.topTid = r[0][7];
            } else {
                self.topTid = self.tid;
            }
        } else {
            self.topTid = self.tid;
        }

        this.execHeadInfoQuery();

    },

    execHeadInfoQuery : function () {
        WS.SQLExec({
            sql_file: 'txn_detail_tid_info.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: this.topTid
            },{
                name: 'from_time',
                type: SQLBindType.STRING,
                value: this.endTime
            }],
            replace_string: [{
                name: 'rd',
                value: this.rd
            }]
        }, this.onHeadInfoData, this);
    },

    onHeadInfoData : function(header, data) {
        var target, noticeLayer, textLayer;

        if (!window) {
            return;
        }

        if(this.isClosed || !common){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('txnDetail-onTidInfo');
            console.debug(header);
            console.debug(data);
            return;
        }

        console.info('call back : ', header.command);
        /**
         * [0] wasInfo  : 0: "time" 1: "was_id" 2: "was_name" 3: "instance_name" 4: "tid" 5: "txn_id" 6: "txn_name" 7: "client_ip" 8: "sql_exec_count" 9: "txn_elapse" 10: "fetch_count" 11: "start_time"
         * [1] client   : 0: "client_ip" 1: "CLIENT_TIME"
         * [2] web      : 0: "web_ip" 1: "was_id" 2: "was_name" 3: "exec_count" 4: "w_elapse_time"
         * [3] was      : 0: "was_id" 1: "was_name" 2: "txn_elapse" 3: "exec_cnt" 4: "sql_elapse"
         * [4] db       : 0: "WAS_ID" 1: "was_name" 2: "DB_ID" 3: "INSTANCE_NAME" 4: "exec_cnt" 5: "elapse_time" 6: "elapse_time_max"
         * [5] remote   : 0: "DEST" 1: "elapse_time" 2: "key2"
         * [6] user data: 0: "name" 1: "offset" 2: "len"
         * [7] guid     : 0: "guid"
         * [8] terminal : 0: "client_ip", 1: "elapse_time_us", 2: "type"
         */
        if(Array.isArray(data)){
            var ix, ixLen, isExistData = false;

            for(ix = 0, ixLen = data.length; ix < ixLen; ix++){
                if(!data[0].rows.length) {
                    break;
                }

                if(data[ix].rows.length > 0){
                    isExistData = true;
                }
            }

            if(!isExistData){
                if (this.topTid === this.tid) {
                    target = this.el.dom;
                    noticeLayer = document.createElement('div');
                    textLayer = document.createElement('div');

                    noticeLayer.setAttribute('style', 'position:absolute; top: 0; left: 0; bottom: 0; right: 0; width:100%; height:100%; background:rgba(0,0,0,0.4);z-index:100;');
                    noticeLayer.setAttribute('class', 'not_support');

                    textLayer.setAttribute('style', 'position:absolute; top: 40%; left: 38%; bottom: 0; right: 0; width:620px; height:80px; background:black; z-index:101; font-size:14px; line-height:75px; text-align:center; color:white');
                    textLayer.setAttribute('class', 'not_support_text');

                    textLayer.textContent = common.Util.TR('The selected transaction is now ongoing, or transaction data does not exist.');
                    noticeLayer.appendChild(textLayer);
                    target.appendChild(noticeLayer);

                    this.loadingMask.hide();
                } else {
                    this.topTid = this.tid;
                    this.execHeadInfoQuery();
                }

                return;
            }

            var wasInfo = data[0].rows,
                client  = data[8].rows.length ? data[8].rows : data[1].rows,
                web     = data[2].rows,
                was     = data[3].rows,
                db      = data[4].rows,
                remote  = data[5].rows,
                guid    = (data.length > 7)? data[7].rows : '';

            this.wasInfo = wasInfo;
            this.wasRemoteInfo = remote;
            this.was = was ; //1409.24 (min)

            var txnContainerDOM = this.el.dom.getElementsByClassName('txn-detail-info-container')[0];

            if(wasInfo && wasInfo.length > 0){
                var infoNameVal,infoNameBar,
                    infoStart, infoStartBar, startTimeData,
                    infoClient,
                    infoWeb, infoWebElapseText,
                    infoWas, infoWasElapseText,
                    infoDB, infoDBElapseText,
                    infoRemote;

                infoNameVal = this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-name-value', wasInfo[0][2]);
                infoNameBar = infoNameVal.parentElement.nextElementSibling;
                infoNameBar.style.display = 'block';

                this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-detail', wasInfo[0][6]);


                if(guid && guid.length > 0) {
                    this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-guid', guid[0][0]);
                }

                startTimeData = common.Util.TR('Start Time') + ' : ' + Ext.Date.format(new Date(wasInfo[0][11]), Comm.dateFormat.HMSMS);
                infoStart = this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-start', startTimeData);

                infoStartBar = infoStart.parentElement.nextElementSibling;
                infoStartBar.style.display = 'block';
            }

            if(client && client.length > 0){
                if(client[0][0].length) {
                    infoClient = this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-client', client[0][0]);

                    infoClient.style.display = 'block';
                    infoClient.nextElementSibling.style.display = 'block';
                }
            }

            if(web && web.length > 0){
                infoWebElapseText = document.createTextNode(common.Util.TR('Elapse') + ': ' + (web[0][4] / 1000).toFixed(3) + ' / ' + common.Util.TR('Exec') + ': ' + web[0][3]);

                infoWeb = this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-web-name', web[0][0]);
                infoWeb.nextElementSibling.appendChild(infoWebElapseText);

                infoWeb.parentElement.parentElement.style.display = 'block';
                infoWeb.parentElement.parentElement.nextElementSibling.style.display = 'block';
            }

            if(was && was.length > 0){
                infoWasElapseText = document.createTextNode(common.Util.TR('Elapse') + ': ' + (was[0][2] / 1000).toFixed(3) + ' / ' + common.Util.TR('Exec') + ': ' + was[0][3]);
                infoWas = this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-java-name', was[0][1]);

                infoWas.nextElementSibling.appendChild(infoWasElapseText);

                infoWas.parentElement.parentElement.style.display = 'block';
                infoWas.parentElement.parentElement.nextElementSibling.style.display = 'block';

            }
            // db 가 2개 이상일 경우 합을 구한다.
            if(db && db.length > 0){
                var name = db[0][3], dbElapse = parseInt( db[0][5] ), dbExec = parseInt( db[0][4] ) ;

                if(db.length > 1){
                    name = 'DB';
                    for(var i = 1; i < db.length; i++){
                        dbElapse += parseInt( db[i][5] ) ;
                        dbExec += parseInt( db[i][4] ) ;
                    }
                }

                infoDBElapseText = document.createTextNode(common.Util.TR('Elapse') + ': ' + (dbElapse/ 1000).toFixed(3) + ' / ' + common.Util.TR('Exec') + ': ' + dbExec);
                infoDB = this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-db-name', name);

                infoDB.nextElementSibling.appendChild(infoDBElapseText);

                infoDB.parentElement.parentElement.style.display = 'block';
                infoDB.parentElement.parentElement.nextElementSibling.style.display = 'block';
            }

            if(remote && remote.length > 0){
                this.remoteValue = (remote[0][0]/1000).toFixed(3);

                infoRemote = this.setDOMHeadInfo(txnContainerDOM, 'txn-detail-info-remote', this.remoteValue);
                infoRemote.style.display = 'block';
            }

            if(data[6] && data[6].rows.length > 0){
                this.userDataCodeReplaceData = data[6].rows;
            }

            //1501.30 추가(min)
            //1502.24 style code 추가(min) -> 1506.18 재수정
            /*
             * url[0][0] : text
             * url[0][1] : url1_value
             * url[0][2] : attribute
             * url[0][3] : cookie
             * */
            /*if( url && url.length > 0 ){
                var url_name = url[0][0].substring(0, url[0][0].indexOf('?')+1) ;
                var url_value = url[0][0].substring(url[0][0].indexOf('?')+1, url[0][0].length ) ;
                var txnContainer2DOM = this.el.dom.getElementsByClassName('txn-detail-info-container2')[0];

                txnContainer2DOM.getElementsByClassName('txn-detail-info-url-label')[0].style.display = 'block';
                this.setDOMHeadInfo(txnContainer2DOM, 'txn-detail-info-url', url_name + url_value);

                url_name = null ;
                url_value = null ;
            }*/

            txnContainerDOM = null;
            infoNameVal = null;
            infoNameBar = null;
            infoStart = null;
            infoStartBar = null;
            infoClient = null;
            infoWeb = null;
            infoWebElapseText = null;
            infoWas = null;
            infoWasElapseText = null;
            infoDB = null;
            infoDBElapseText = null;
            infoRemote = null;

            this.execTidPathQuery();
        }
    },

    setDOMHeadInfo : function(headDOM, findCls, textData) {
        var findDOM, inputTextNode;

        try {
            findDOM = headDOM.getElementsByClassName(findCls)[0];
            inputTextNode = document.createTextNode(textData);
            findDOM.appendChild(inputTextNode);

            return findDOM;
        } catch(e) {
            console.error(e);
        } finally {
            findDOM = null;
            inputTextNode = null;
        }
    },

    execTidPathQuery : function() {

        this.callTreeData = [];
        this.sqlListData = [];

        if ( Comm.service_type == '' ){
            WS.StoredProcExec({
                stored_proc: 'tid_path',
                bind: [{
                    name: 'tid',
                    type: SQLBindType.LONG,
                    value: this.topTid
                }, {
                    name: 'start_time',
                    type: SQLBindType.STRING,
                    value: this.startTime
                }]
            }, this.onTIDPathData, this);
        } else {
            //SAP
            WS.SQLExec({
                sql_file: 'txn_detail_sap_get_parent.sql',
                bind: [{
                    name: 'tid',
                    type: SQLBindType.LONG,
                    value: this.topTid
                }]
            }, this.onSapGetParenthData, this);
        }

    },

    onTIDPathData : function(header, data) {
        var self = this;
        var ix, ixLen, dest,
            tidPathCallTreeData, abnormalWasDataIdx;

        if (this.isClosed || !common) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.debug('txnDetail-onTIDPathData');
            console.debug(header);
            console.debug(data);
            return;
        }

        console.info('call back : ', header.command);

        if (Array.isArray(data)) {

            tidPathCallTreeData = data[2].rows;

            this.wasData = data[0].rows;
            this.dbData = data[1].rows;

            this.sqlData = data[3].rows;
            this.isAsync = false;
            this.isExistAsyncData = false;

            if (this.wasData.length || this.dbData.length) {
                for (ix = 0, ixLen = this.wasData.length; ix < ixLen; ix++) {
                    dest = this.wasData[ix][14].split('|')[1] || this.wasData[ix][14];

                    if (!dest.includes('http://') && dest.indexOf('async') !== -1) {
                        this.txnPathClass.asyncInfo.asyncTidList.push({
                            time: this.wasData[ix][1],
                            tid: this.wasData[ix][2],
                            type : this.wasData[ix][27]
                        });
                    }
                }

                if (this.isAsync && this.wasData[0][2] === null) {
                    abnormalWasDataIdx = this.txnPathReplyInfo.findIndex(function(item) {
                        return item.destId === header.parameters.bind[0].value;
                    });

                    this.txnPathReplyInfo.splice(abnormalWasDataIdx, 1);
                } else {
                    this.pathDataArr.push({
                        wasData : this.wasData,
                        dbData : this.dbData
                    });
                }
            }

            if (header.parameters.bind[0].value !== this.topTid) {
                this.isAsync = true;
                this.txnPathClass.asyncInfo.executeAsyncCount--;
            }

            for (ix = 0, ixLen = tidPathCallTreeData.length; ix < ixLen; ix++) {
                this.callTreeData.push(tidPathCallTreeData[ix]);
            }

            for (ix = 0, ixLen = this.sqlData.length; ix < ixLen; ix++) {
                this.sqlListData.push(this.sqlData[ix]);
            }

            if (this.wasData && this.wasData.length && this.wasData[0][2] && this.txnPathClass.asyncInfo.asyncTidList.length) {
                this.isExistAsyncData = true;
                this.executeAsync();
            }

            if ((!this.txnPathClass.asyncInfo.executeAsyncCount && !this.asyncQueryCnt && this.isAsync) ||
                (!this.isExistAsyncData && !this.isAsync)) {
                this.loadTxnDetailContents();
            }
        }
    },


    execTimeLineQuery: function() {
        var ix, ixLen, oriWasData,
            tidList = [], replTidList, sqlFile, guidList = [], replGuidList,
            tlInfoObj = {was : [], tid : []};


        if (!this.pathDataArr || !this.pathDataArr[0]) {
            this.timeLineLayer.loadingMask.hide();
            this.timeLineLayer.hide();
            console.warn('TimeLine - ref_cursor1 no data (tid_path)');
            return;
        }

        oriWasData = this.pathDataArr[0].wasData;

        this.txnTimeLine.chartData = {
            keyData : 'tier',
            columnInfo: [
                {cName: 'Tier',        cId: 'tier',       cAlign: 'start',  cWidth: 120},
                {cName: 'Agent',       cId: 'agent',      cAlign: 'start',  cWidth: 120},
                {cName: 'Start Time',  cId: 'start_time', cAlign: 'start',  cWidth: 170},
                {cName: 'Elapse Time', cId: 'elapse',     cAlign: 'end',    cWidth: 100}
            ],
            data: []
        };

        for (ix = 0, ixLen = oriWasData.length; ix < ixLen; ix++) {
            if (oriWasData[ix][4]) {
                tlInfoObj.was.push(oriWasData[ix][4]);
            }
            if (oriWasData[ix][10]) {
                tlInfoObj.was.push(oriWasData[ix][10]);
            }
            tlInfoObj.tid.push(oriWasData[ix][2]);
        }

        for (ix = 0, ixLen = this.callTreeData.length; ix < ixLen; ix++) {
            if (this.callTreeData[ix][5] && tidList.indexOf(this.callTreeData[ix][5]) < 0 ) {
                tidList.push(this.callTreeData[ix][5]);
            }

            if (this.callTreeData[ix][12] && guidList.indexOf('\'' + this.callTreeData[ix][12] + '\'') < 0 ) {
                guidList.push('\'' + this.callTreeData[ix][12] + '\'');
            }
        }

        replTidList = tidList.length > 0 ? tidList.join() : this.topTid;

        if (this.monitorType === 'CD' &&  guidList.length) {
            replGuidList = 'OR guid in (' + guidList.join() + ')';
        } else {
            replGuidList = '';
        }


        if (tlInfoObj.was.length) {
            this.processCount.etoeInfo++;
            if (common.Menu.isBusinessPerspectiveMonitoring) {
                sqlFile = 'txn_detail_was_etoe_business_info.sql';
            } else {
                sqlFile = 'txn_detail_was_etoe_info.sql';
            }

            WS.SQLExec({
                sql_file: sqlFile,
                replace_string:[{
                    name: 'was_id',
                    value: tlInfoObj.was.join()
                }]
            }, this.onTimeLineData, this);

            this.processCount.etoeInfo++;
            WS.SQLExec({
                sql_file: 'txn_detail_client_api_info.sql',
                bind: [{
                    name: 'start_time',
                    type: SQLBindType.STRING,
                    value: this.wasData[0][1]
                },{
                    name: 'tid',
                    type: SQLBindType.LONG,
                    value: this.topTid
                }],
                replace_string:[{
                    name: 'tid',
                    value: replTidList
                }, {
                    name: 'guid',
                    value: replGuidList
                }]
            }, this.onTimeLineData, this);

        } else {
            console.warn('No WAS Data');
            this.timeLineLayer.loadingMask.hide();
            this.timeLineLayer.hide();
        }
    },

    onTimeLineData: function(header, data) {
        this.processCount.etoeInfo--;

        if (!common.Util.checkSQLExecValid(header, data)){
            console.debug('txnDetail-onTimeLineData');
            console.debug(header);
            console.debug(data);
            return;
        }

        console.info('call back : ', header.command);

        switch (header.command) {
            case 'txn_detail_was_etoe_info.sql':
            case 'txn_detail_was_etoe_business_info.sql':
                this.etoeMetaData = data[0].rows;
                this.cliExtData = data[1].rows;
                break;
            case 'txn_detail_client_api_info.sql':
                this.clientAPIData = data.rows;
                break;
            default:
                break;
        }

        if (!this.processCount.etoeInfo) {
            if (!this.etoeMetaData.length) {
                this.timeLineLayer.hide();

                console.warn('No EtoE Tier Data');
                return;
            }

            this.parseTimeLineData();
            this.calcTimeLineChartData();
            this.txnTimeLine.init();
            this.timeLineLayer.loadingMask.hide();
        }
    },

    parseTimeLineData: function() {
        var ix, ixLen,
            cliTierName, cliTierSeq, extTierName, extTierSeq;

        this.etePathArr = [];
        this.etePathBranch = {};
        this.eteTierArr = [];
        this.timeLineAsyncArr = [];
        this.useClientTier = false;
        this.eteCliLastValue = 0;

        // get Tier Name (Terminal , EXT (Async)
        for (ix = 0, ixLen = this.cliExtData.length; ix < ixLen; ix++) {
            if (this.cliExtData[ix][1] === 'CLIENT') {
                cliTierName = this.cliExtData[ix][0];
                cliTierSeq = this.cliExtData[ix][2];
            } else if (this.cliExtData[ix][1] === 'EXT') {
                extTierName = this.cliExtData[ix][0];
                extTierSeq = this.cliExtData[ix][2];
            }
        }

        // client
        this.parseTimeLineClientData(cliTierName, cliTierSeq);

        // tid_path의 결과 데이터를 1차 가공
        // pathDataArr의 p / c 를 나눔.
        this.parseTimeLinePathInfo();

        // 단말 및 어싱크 티어 정보 처리
        this.parseClientAsyncInfo(extTierName, extTierSeq);

        // 위에서 만들어진 txn 배열을 tier로 그루핑
        this.parsePathInfoTierGrouping();

        // Tier별 Tier Elapse를 계산
        this.calcTimeLineTierElapse();

        if (!this.eteTierArr.length) {
            this.timeLineLayer.hide();
            console.warn('Not found EtoE tier array data');
        }
    },

    parseTimeLineClientData: function(cliTierName, cliTierSeq) {
        var ix, ixLen,
            clientAgent, clientElapse = 0, clientStartTime, clientTimeData = [],
            pushElapse = 0, pushStart, pushTimeType, pushDataIdx = -1,
            tierType , timeType, elapseValue, convertElapse;

        var data = this.clientAPIData;
        var clientTxnInfo = {
            '4' : 'Start',
            '5' : 'End',
            '6' : common.Util.CTR('Push Receive')
        };


        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {

            if (!clientStartTime) {
                clientStartTime = data[ix][4];
                clientAgent = common.Util.hexIpToDecStr(this.clientAPIData[ix][2]);
            }

            if (+new Date(data[ix][4]) < +new Date(clientStartTime)) {
                clientStartTime = data[ix][4];
                clientAgent = common.Util.hexIpToDecStr(this.clientAPIData[ix][2]);
            }

            // microsec 데이터가 0이거나 없을 경우 WAS 및 millisec 으로 취급하여 조회
            timeType = (!data[ix][6] || data[ix][6] === '' || data[ix][6] === 0) ? 'WAS' : 'APIM';
            elapseValue = (!data[ix][6] || data[ix][6] === '' || data[ix][6] === 0) ? +data[ix][7] : +data[ix][6];

            if (timeType === 'APIM') {
                this.isMicroUnit = true;
                tierType = 'APIM';
            }

            if (this.isMicroUnit) {
                convertElapse = timeType === 'APIM' ? elapseValue : elapseValue*1000;
                clientElapse += convertElapse;
            } else {
                convertElapse = elapseValue;
                clientElapse += convertElapse;
            }

            if (data[ix][3] === '4' || data[ix][3] === '5') {

                clientTimeData.push([
                    data[ix][4] || 0,               // start_time
                    elapseValue,                    // elapse
                    [0],                            // tid
                    clientTxnInfo[data[ix][3]],     // txn_name
                    0,                              // exception (default : true , Not a Define IMXOSM)
                    timeType,                       // TYPE
                    0,                              // start_value
                    convertElapse,                  // convert_elapse
                    null                            // was_Id
                ]);

            } else if (data[ix][3] === '6') {

                if (!pushStart) {
                    pushStart = data[ix][4];
                    pushDataIdx = ix;
                    pushElapse = convertElapse;
                }

                if (+new Date(data[ix][4]) < +new Date(pushStart)) {
                    pushStart = data[ix][4];
                    pushDataIdx = ix;
                    pushElapse = convertElapse;
                }

                if (timeType === 'APIM') {
                    pushTimeType = 'APIM';
                }
            }
        }

        if (pushDataIdx > -1) {

            // pushElapse = pushElapse / (pushCnt || 1);
            // clientElapse = common.Util.toFixed(clientElapse, 1);
            clientElapse = common.Util.numberWithComma(clientElapse);

            clientTimeData.push([
                data[pushDataIdx][4] || 0,               // start_time
                pushElapse,                              // elapse
                [0],                                     // tid
                clientTxnInfo[data[pushDataIdx][3]],     // txn_name
                0,                                       // exception (default : true , Not a Define IMXOSM)
                pushTimeType,                            // TYPE
                0,                                       // start_value
                pushElapse,                              // convert_elapse
                null                                     // was_Id
            ]);

        }

        if (this.clientAPIData.length) {
            this.useClientTier = true;

            this.eteTierArr.push({
                tier      : cliTierName || 'CLIENT',
                agent     : clientAgent,
                start_time: clientStartTime ? Ext.Date.format(new Date(clientStartTime), 'Y-m-d H:i:s.u') : 'No Data',
                elapse    : clientElapse,
                tierValue : 'client',
                times     : clientTimeData,
                tierType  : tierType,
                seq       : cliTierSeq || 0
            });
        }
    },

    /* TimeLine TID Path Parsing */
    parseTimeLinePathInfo: function() {

        var ix, ixLen,
            jx, jxLen,
            data, nodeTypeChangeList = {},
            prevTid, currTid, pathInfo, pInfo, cInfo, prevInfo;


        var bKeys, findIdx;

        for (ix = 0, ixLen = this.pathDataArr.length; ix < ixLen; ix++) {

            prevInfo = { tid: null, id: null };

            for (jx = 0, jxLen = this.pathDataArr[ix].wasData.length; jx < jxLen; jx++) {
                data = this.pathDataArr[ix].wasData[jx];
                currTid = data[2];
                // p_info, c_info
                pathInfo = this.getTimeLinePathInfo(data, ix);  // ix는 async index 구분을 위함.

                pInfo = pathInfo.p_info;
                cInfo = pathInfo.c_info;

                prevTid = prevInfo.tid;

                if (prevTid !== currTid) {
                    prevInfo = this.parseMainPath(pInfo, cInfo, nodeTypeChangeList);
                    prevTid = prevInfo.tid;
                } else {
                    // branch
                    prevInfo = this.parseBranchPath(pInfo, cInfo, nodeTypeChangeList, prevInfo);
                    prevTid = prevInfo.tid;
                }
            }
        }

        // Branch에 남은 C값들 MainPath에 이동
        bKeys = Object.keys(this.etePathBranch);
        for (ix = 0, ixLen = bKeys.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.etePathBranch[bKeys[ix]].length; jx < jxLen; jx++) {
                this.etePathArr.push(this.etePathBranch[bKeys[ix]][jx]);

                if (jx + 1 === jxLen) {
                    this.etePathBranch[bKeys[ix]] = null;
                    delete this.etePathBranch[bKeys[ix]];
                }
            }
        }

        // Main Path Start 값 계산
        for (ix = 0, ixLen = this.etePathArr.length; ix < ixLen; ix++) {

            if (this.etePathArr[ix].async) {
                continue;
            }

            if (!this.etePathArr[ix].parent) {

                if (this.useClientTier && this.eteTierArr && this.eteTierArr[0].tierValue === 'client') {
                    if (this.eteTierArr[0].times[0][1] && (this.eteTierArr[0].times[0][3] === 'Start')) {
                        this.etePathArr[ix].start = this.eteTierArr[0].times[0][1];
                    } else {
                        this.etePathArr[ix].start = 0;
                    }
                } else {
                    this.etePathArr[ix].start = 0;
                }
            } else {
                findIdx = this.getTxnIndexETEPath(this.etePathArr[ix].parent);
                if (findIdx > -1) {
                    this.etePathArr[ix].start = this.etePathArr[findIdx].start + this.etePathArr[findIdx].convert_elapse;
                    if (this.useClientTier) {
                        this.eteCliLastValue = this.eteCliLastValue < this.etePathArr[ix].start + this.etePathArr[ix].convert_elapse ?
                            this.etePathArr[ix].start + this.etePathArr[ix].convert_elapse : this.eteCliLastValue;
                    }
                }
            }
        }
    },

    parseMainPath: function(pInfo, cInfo, nodeTypeChangeList) {

        var findIdx, branchObj;

        if (pInfo) {
            findIdx = this.getTxnIndexETEPath(pInfo.id);

            if (findIdx) {
                if (this.etePathArr[findIdx].type === 'c') {
                    if (!nodeTypeChangeList[pInfo.id]) {
                        nodeTypeChangeList[pInfo.id] = 1;
                    }
                    this.etePathArr[findIdx].type = 'p';
                    this.etePathArr[findIdx].tid = pInfo.tid;
                } else {
                    if (this.etePathArr[findIdx].tid.indexOf(pInfo.raw_tid) < 0) {
                        if (!nodeTypeChangeList[pInfo.id]) {
                            this.etePathArr[findIdx].elapse += pInfo.elapse;
                            this.etePathArr[findIdx].convert_elapse += pInfo.convert_elapse;
                        }

                        if (pInfo.time < this.etePathArr[findIdx].time) {
                            this.etePathArr[findIdx].time = pInfo.time;
                        }

                        this.etePathArr[findIdx].tid.push(pInfo.raw_tid);
                    }
                }
            } else {
                branchObj = this.getTxnInfoBranchPath(pInfo.id);
                if (branchObj) {
                    this.etePathArr.push(branchObj[0]);
                } else {
                    this.etePathArr.push(pInfo);
                }
            }
        }

        if (cInfo) {
            findIdx = this.getTxnIndexETEPath(cInfo.id);

            if (findIdx) {
                if (this.etePathArr[findIdx].type === 'c') {
                    if (this.etePathArr[findIdx].tid.indexOf(cInfo.raw_tid) < 0) {
                        this.etePathArr[findIdx].tid.push(cInfo.raw_tid);
                    }

                    if (cInfo.time < this.etePathArr[findIdx].time) {
                        this.etePathArr[findIdx].time = cInfo.time;
                    }

                    this.etePathArr[findIdx].elapse += cInfo.elapse;
                    this.etePathArr[findIdx].convert_elapse += cInfo.convert_elapse;
                }
            } else {
                this.etePathArr.push(cInfo);
            }
        }

        return pInfo ? {id : pInfo.id, tid: pInfo.tid[pInfo.tid.length - 1]} : null;
    },

    parseBranchPath: function(pInfo, cInfo, nodeTypeChangeList, prevInfo) {
        var findIdx, prevId;

        prevId = prevInfo.id;

        if (!this.etePathBranch[prevId]) {
            if (pInfo) {
                findIdx = this.getTxnIndexETEPath(pInfo.id);

                if (findIdx) {
                    if (this.etePathArr[findIdx].type === 'c') {
                        if (!nodeTypeChangeList[pInfo.id]) {
                            nodeTypeChangeList[pInfo.id] = 1;
                        }
                        this.etePathArr[findIdx].type = 'p';
                        this.etePathArr[findIdx].tid = pInfo.tid;
                    } else {
                        if (this.etePathArr[findIdx].tid.indexOf(pInfo.raw_tid) < 0) {
                            if (!nodeTypeChangeList[pInfo.id]) {
                                this.etePathArr[findIdx].elapse += pInfo.elapse;
                                this.etePathArr[findIdx].convert_elapse += pInfo.convert_elapse;
                            }

                            if (pInfo.time < this.etePathArr[findIdx].time) {
                                this.etePathArr[findIdx].time = pInfo.time;
                            }

                            this.etePathArr[findIdx].tid.push(pInfo.raw_tid);
                        }
                    }
                }
            }

            if (cInfo) {
                findIdx = this.getTxnIndexETEPath(cInfo.id);

                if (findIdx) {
                    if (this.etePathArr[findIdx].type === 'c') {
                        if (this.etePathArr[findIdx].tid.indexOf(cInfo.raw_tid) < 0) {
                            this.etePathArr[findIdx].tid.push(cInfo.raw_tid);
                        }

                        if (cInfo.time < this.etePathArr[findIdx].time) {
                            this.etePathArr[findIdx].time = cInfo.time;
                        }

                        this.etePathArr[findIdx].elapse += cInfo.elapse;
                        this.etePathArr[findIdx].convert_elapse += cInfo.convert_elapse;
                    }
                } else {
                    this.etePathBranch[prevId] = [];
                    this.etePathBranch[prevId].push(cInfo);
                }
            }
        } else {
            if (pInfo) {
                findIdx = this.getTxnIndexETEPath(pInfo.id);

                if (findIdx) {
                    if (this.etePathArr[findIdx].type === 'c') {
                        if (!nodeTypeChangeList[pInfo.id]) {
                            nodeTypeChangeList[pInfo.id] = 1;
                        }
                        this.etePathArr[findIdx].type = 'p';
                        this.etePathArr[findIdx].tid = pInfo.tid;
                    } else {
                        if (this.etePathArr[findIdx].tid.indexOf(pInfo.raw_tid) < 0) {
                            if (!nodeTypeChangeList[pInfo.id]) {
                                this.etePathArr[findIdx].elapse += pInfo.elapse;
                                this.etePathArr[findIdx].convert_elapse += pInfo.convert_elapse;
                            }

                            if (pInfo.time < this.etePathArr[findIdx].time) {
                                this.etePathArr[findIdx].time = pInfo.time;
                            }

                            this.etePathArr[findIdx].tid.push(pInfo.raw_tid);
                        }
                    }
                }
            }

            if (cInfo) {
                findIdx = this.getTxnIndexETEPath(cInfo.id);

                if (findIdx) {
                    if (this.etePathArr[findIdx].type === 'c') {
                        if (this.etePathArr[findIdx].tid.indexOf(cInfo.raw_tid) < 0) {
                            this.etePathArr[findIdx].tid.push(cInfo.raw_tid);
                        }

                        if (pInfo.time < this.etePathArr[findIdx].time) {
                            this.etePathArr[findIdx].time = pInfo.time;
                        }

                        this.etePathArr[findIdx].elapse += cInfo.elapse;
                        this.etePathArr[findIdx].convert_elapse += cInfo.convert_elapse;
                    }
                } else {
                    this.etePathBranch[prevId].push(cInfo);
                }
            }

        }

        return pInfo ? { id : pInfo.id, tid: pInfo.tid[pInfo.tid.length - 1] } : null;
    },

    /* TimeLine Parsed Path Data Tier Grouping */

    parsePathInfoTierGrouping: function() {

        var ix, ixLen,
            jx, jxLen,
            tier, seq, tierData={};

        var tierKey, tierAgent, tierStartTime, tierTimeData, currentTier, tierType;
        var findIdx, pTime, cTime, hopTime = null;

        // Tier로 단위로 변경
        for (ix = 0, ixLen = this.etoeMetaData.length; ix < ixLen; ix++) {
            tier = this.etoeMetaData[ix][4];
            seq = this.etoeMetaData[ix][0];
            if (!tierData[tier]) {
                tierData[tier] = {
                    seq : seq,
                    data: []
                };
            }

            for (jx = 0, jxLen = this.etePathArr.length; jx < jxLen; jx++) {
                if (this.etoeMetaData[ix][1] === +this.etePathArr[jx].was_id) {
                    findIdx = this.getTxnIndexETEPath(this.etePathArr[jx].parent);
                    if (findIdx !== false && findIdx > -1) {
                        pTime = +new Date(this.etePathArr[findIdx].time);
                        cTime = +new Date(this.etePathArr[jx].time);

                        if (!isNaN(pTime) && !isNaN(cTime)) {
                            hopTime = cTime - pTime;
                        }
                    }

                    tierData[tier].data.push([
                        this.etePathArr[jx].was_name,
                        this.etePathArr[jx].time || 0,
                        this.etePathArr[jx].elapse || 0,
                        this.etePathArr[jx].was_type,
                        this.etePathArr[jx].tid,
                        this.etePathArr[jx].txn_name,
                        this.etePathArr[jx].exception,
                        this.etePathArr[jx].id,
                        this.etePathArr[jx].parent,
                        this.etePathArr[jx].start,
                        this.etePathArr[jx].convert_elapse,
                        this.etePathArr[jx].was_id,
                        this.etePathArr[jx].p_txn_name,
                        hopTime
                    ]);
                }
            }
        }

        console.debug('tierData', tierData);

        // 각 Tier별 Agent 데이터 파싱
        tierKey = Object.keys(tierData);
        if (tierKey.length) {
            // 각 Tier별 Start Time이 가장 빠른 Transaction Agent 정보를 추출하며 eteTierArr에 TimeBar Data push
            // loop tier
            for (ix = 0, ixLen = tierKey.length; ix < ixLen; ix++) {
                // init
                currentTier = tierData[tierKey[ix]].data;

                if (currentTier.length) {
                    tierStartTime = new Date(currentTier[0][1]);
                    tierAgent = currentTier[0][0];
                    tierTimeData = [];
                    tierType = '';
                }

                // loop transaction data in tier
                // currentTier Array Info
                // [0] : was_name, [1] : start_time, [2] : elapse, [3] : was_type, [4] : tid [5] : txn_name [6] : exception
                for (jx = 0, jxLen = currentTier.length; jx < jxLen; jx++) {
                    // comparision start time
                    if (new Date(currentTier[jx][1]) < tierStartTime) {
                        tierStartTime = currentTier[jx][1];
                        tierAgent = currentTier[jx][0];
                    }
                    // 각 Tier의 Elapse는 해당 Tier에서 발생된 Transaction Elapse Sum.
                    // CallTree 연계를 위한 tid, 하나의 txnObj에서 여러건의 tid가 생길 경우 0번째 처리


                    if (currentTier[jx][3] === 'APIM') {
                        tierType = 'APIM';
                        this.isMicroUnit = true;
                    }

                    tierTimeData.push([
                        currentTier[jx][1], // start_time
                        +currentTier[jx][2], // elapse
                        currentTier[jx][4].length ? currentTier[jx][4] : null, // tid(array)
                        currentTier[jx][5], // txn_name
                        currentTier[jx][6], // exception
                        currentTier[jx][3], // was_type
                        currentTier[jx][9], // start_value
                        +currentTier[jx][10], // convert_elapse
                        currentTier[jx][11], // was_id
                        currentTier[jx][12], // parent_txn_name,
                        currentTier[jx][8], // parent
                        currentTier[jx][13] // hop time,
                    ]);
                }

                // 각 Tier의 정보를 세팅 후 eteTierArr에 push
                this.eteTierArr.push({
                    tier      : tierKey[ix],
                    agent     : tierAgent,
                    start_time: Ext.Date.format(new Date(tierStartTime), 'Y-m-d H:i:s.u'),
                    tierValue : 'agent',
                    times     : tierTimeData,
                    tierType  : tierType,
                    seq       : tierData[tierKey[ix]].seq
                });
            }
        }
    },

    /* TimeLine Client Async Tier Data Parse */
    parseClientAsyncInfo: function(extTierName, extTierSeq) {
        var ix, ixLen, jx, jxLen,
            findIdx, clientEndIdx = -1, clientPushIdx = -1,
            asyncArr, asyncTimeData = [], asyncSrcIdx, asyncSrcTxn, asyncDestIdx, asyncMapArr = [],
            asyncLvlIdx, asyncLvlGap, asyncLvlSrc, asyncLvlDest, asyncElapse,
            asyncTierType = '', asyncStartValue, asyncConvElapse, asyncStartTime;

        // Async 데이터 존재 시 해당 데이터 파싱 후 eteTierArr에 push.
        // Async Obj Props : time, gapTime, type
        asyncArr = this.timeLineAsyncArr;

        if (asyncArr.length) {
            for (ix = 0, ixLen = asyncArr.length; ix < ixLen; ix++) {

                asyncSrcIdx = this.getTxnIndexETEPath(asyncArr[ix].srcId);
                asyncDestIdx = this.getTxnIndexETEPathTid(asyncArr[ix].destTid);

                if (!asyncSrcIdx) {
                    console.warn('Not Found Matched Txn : ' + asyncArr[ix].srcId);
                    continue;
                }

                asyncSrcTxn = this.etePathArr[asyncSrcIdx];

                asyncStartValue = this.etePathArr[asyncSrcIdx].start + this.etePathArr[asyncSrcIdx].convert_elapse;

                // GapTime은 화면에서 시간계산한 ms단위이며 이미 /1000이 되어있음.
                asyncConvElapse = this.isMicroUnit ? +asyncArr[ix].gapTime * 1000000 : +asyncArr[ix].gapTime * 1000;
                asyncElapse = asyncArr[ix].type === 'APIM' ? +asyncArr[ix].gapTime * 1000000 : +asyncArr[ix].gapTime;

                if (asyncDestIdx) {
                    asyncMapArr.push([this.etePathArr[asyncDestIdx].async, asyncConvElapse, asyncSrcIdx, asyncDestIdx]);
                } else {
                    console.warn('Not Found Matched Dest Tid : ' + asyncArr[ix].destTid);
                }

                // Tier Start Time 계산
                if (!asyncStartTime) {
                    asyncStartTime = asyncArr[ix].time;
                }

                if (+new Date(asyncStartTime) > +new Date(asyncArr[ix].time)) {
                    asyncStartTime = asyncArr[ix].time;
                }

                // Tier Type 처리
                if (asyncArr[ix].type === 'APIM') {
                    asyncTierType = 'APIM';
                }

                asyncTimeData.push([
                    asyncArr[ix].time,                // start_time
                    asyncElapse,                      // elapse
                    [0],                              // tid
                    'Async',                          // txn_name
                    0,                                // exception
                    asyncArr[ix].type,                // was_type
                    asyncStartValue,                  // start_value
                    asyncConvElapse,                  // convert_elapse
                    null                              // was_id
                ]);
            }

            // Async Path Start 값 계산
            for (ix = 0, ixLen = asyncMapArr.length; ix < ixLen; ix++) {

                asyncLvlIdx = asyncMapArr[ix][0];
                asyncLvlGap = asyncMapArr[ix][1];
                asyncLvlSrc = asyncMapArr[ix][2];
                asyncLvlDest = asyncMapArr[ix][3];

                for (jx = 0, jxLen=this.etePathArr.length; jx<jxLen; jx++) {

                    if (this.etePathArr[jx].async === asyncLvlIdx) {

                        if (!this.etePathArr[jx].parent) {
                            if (asyncLvlDest) {
                                this.etePathArr[jx].start = this.etePathArr[asyncLvlSrc].start + this.etePathArr[asyncLvlSrc].convert_elapse + asyncLvlGap;
                            } else {
                                this.etePathArr[jx].start = 0;
                            }
                        } else {
                            findIdx = this.getTxnIndexETEPath(this.etePathArr[jx].parent);
                            if (findIdx > -1) {
                                this.etePathArr[jx].start = this.etePathArr[findIdx].start + this.etePathArr[findIdx].convert_elapse;
                                if (this.useClientTier) {
                                    this.eteCliLastValue = this.eteCliLastValue < this.etePathArr[jx].start + this.etePathArr[jx].convert_elapse ?
                                        this.etePathArr[jx].start + this.etePathArr[jx].convert_elapse : this.eteCliLastValue;
                                }
                            }
                        }
                    }
                }
            }

            this.eteTierArr.push({
                tier      : extTierName || 'Async',
                agent     : 'Async',
                start_time: asyncStartTime,
                tierValue : 'async',
                times     : asyncTimeData,
                tierType  : asyncTierType,
                seq       : extTierSeq || 99999 // 임시 값
            });
        }

        // Client End Time Data 처리
        if (this.clientAPIData.length && this.eteTierArr[0].tierValue === 'client') {

            for (ix = 0, ixLen = this.eteTierArr[0].times.length; ix < ixLen; ix++) {
                //timeData[6] = this.eteCliLastValue;

                if (this.eteTierArr[0].times[ix][3] === 'End') {
                    clientEndIdx = ix;
                } else if (this.eteTierArr[0].times[ix][3] === common.Util.CTR('Push Receive')) {
                    clientPushIdx = ix;
                }
            }

            if (clientEndIdx > -1) {
                this.eteTierArr[0].times[clientEndIdx][6] = this.eteCliLastValue;
                this.eteCliLastValue += this.eteTierArr[0].times[clientEndIdx][7];
            }

            if (clientPushIdx > -1) {
                this.eteTierArr[0].times[clientPushIdx][6] = this.eteCliLastValue;
                this.eteCliLastValue += this.eteTierArr[0].times[clientPushIdx][7];
            }

        }
    },

    /* TimeLine Util Function Area */
    getTimeLinePathInfo: function(data, asyncIdx) {
        var p_info = null, c_info = null;

        var p_id, p_tid, p_was_id, p_txn_elapse, p_txn_name, p_txn_id, p_exception, p_was_type, p_time, p_was_name,
            c_id, c_tid, c_was_id, c_txn_elapse, c_txn_name, c_txn_id, c_exception, c_was_type, c_time, c_was_name;

        var asyncInfo;

        var convert_p_elapse, convert_c_elapse;

        p_tid = data[2];
        p_was_id = data[4] || '';
        p_was_type = data[27];
        p_txn_elapse = p_was_type === 'APIM' ? +data[25] : +data[19];
        p_txn_name = data[7];
        p_txn_id = data[6];
        p_exception = data[22];
        p_time = data[32];
        p_was_name = data[5] || '';

        p_id = p_was_id + '_' + p_txn_id + '_' + asyncIdx;

        c_tid = data[9];

        c_was_id = data[10] || '';
        c_was_type = data[28];
        c_txn_name = data[13];
        c_txn_id = data[12];
        c_exception = data[23];
        c_txn_elapse = c_was_type === 'APIM' ? +data[26] : +data[20];
        c_time = data[33];
        c_was_name = data[11] || '';

        c_id = c_was_id + '_' + c_txn_id + '_' + asyncIdx;

        if (p_was_type === 'APIM' || c_was_type === 'APIM') {
            this.isMicroUnit = true;
        }

        if (this.isMicroUnit) {
            convert_p_elapse = p_was_type === 'APIM' ? p_txn_elapse : p_txn_elapse * 1000;
            convert_c_elapse = c_was_type === 'APIM' ? c_txn_elapse : c_txn_elapse * 1000;
        } else {
            convert_p_elapse = p_txn_elapse;
            convert_c_elapse = c_txn_elapse;
        }

        if (p_was_id) {
            p_info = {
                id: p_id,
                type: 'p',
                was_id: p_was_id,
                tid: [p_tid],
                was_type: p_was_type,
                elapse: p_txn_elapse,
                txn_name: p_txn_name,
                exception: p_exception,
                time: p_time,
                was_name: p_was_name,
                parent: null,
                raw_tid: p_tid,
                convert_elapse: convert_p_elapse,
                async: asyncIdx,
                p_txn_name: ''
            };
        }

        if (c_was_id) {
            c_info = {
                id: c_id,
                type: 'c',
                was_id: c_was_id,
                tid: [c_tid],
                was_type: c_was_type,
                elapse: c_txn_elapse,
                txn_name: c_txn_name,
                exception: c_exception,
                time: c_time,
                was_name: c_was_name,
                parent: p_id,
                raw_tid: c_tid,
                convert_elapse: convert_c_elapse,
                async: asyncIdx,
                p_txn_name: p_txn_name
            };
        }

        asyncInfo = this.findTimeLineAsyncData(p_tid);
        if (asyncInfo) {
            this.timeLineAsyncArr.push({
                time: p_time,
                gapTime: asyncInfo.gapTime,
                type: asyncInfo.type,
                srcTid: p_tid,
                srcId: p_id,
                destTid: asyncInfo.destId
            });
        }

        return {
            'p_info': p_info,
            'c_info': c_info
        };
    },

    getTxnIndexETEPath: function(id) {
        var ix, ixLen,
            findIdx = false;

        for (ix = 0, ixLen = this.etePathArr.length; ix < ixLen; ix++) {
            if (this.etePathArr[ix].id === id) {
                findIdx = ix;
                break;
            }
        }
        return findIdx;
    },

    getTxnIndexETEPathTid: function(tid) {
        var ix, ixLen,
            findIdx = false;

        for (ix = 0, ixLen = this.etePathArr.length; ix < ixLen; ix++) {
            if (this.etePathArr[ix].tid.indexOf(tid) > -1) {
                findIdx = ix;
                break;
            }
        }
        return findIdx;
    },

    getTxnInfoBranchPath: function(id) {
        var bKeys, ix, ixLen, jx, jxLen, retVal = false;

        bKeys = Object.keys(this.etePathBranch);
        for (ix = 0, ixLen = bKeys.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.etePathBranch[bKeys[ix]].length; jx < jxLen; jx++) {

                if (this.etePathBranch[bKeys[ix]][jx].id === id) {
                    retVal = this.etePathBranch[bKeys[ix]].splice(jx);

                    if (!this.etePathBranch[bKeys[ix]].length) {
                        this.etePathBranch[bKeys[ix]] = null;
                        delete this.etePathBranch[bKeys[ix]];
                    }
                    break;
                }

            }
        }

        return retVal;
    },

    findTimeLineAsyncData: function(tid) {
        var replyInfo = this.txnPathReplyInfo;
        var ix, ixLen,
            replyTid, isExist = false;

        for (ix = 0, ixLen = replyInfo.length; ix < ixLen; ix++) {
            replyTid = replyInfo[ix].srcId;

            if (replyTid === tid) {
                isExist = true;
                break;
            }
        }

        return isExist ? replyInfo[ix] : isExist;
    },

    /*
    *
    * Tier Grouping Data Parsing for Table Info
    * Tier 정보를 구할 때는 해당 Tier Type이 Micro인지 알 수 없기 때문에 Tier Elapse는 따로 처리
    *
    * */
    calcTimeLineTierElapse: function() {
        var ix, ixLen,
            jx, jxLen, tierElapse, timeData, tierUnit;

        for (ix = 0, ixLen = this.eteTierArr.length; ix < ixLen; ix++) {

            tierElapse = 0;
            tierUnit = this.eteTierArr[ix].tierType === 'APIM' ? ' (' + decodeURI('%C2%B5') + 's)' : ' (s)';

            for (jx = 0, jxLen = this.eteTierArr[ix].times.length; jx < jxLen; jx++) {

                timeData = this.eteTierArr[ix].times[jx];
                tierElapse += timeData[7];
            }

            if (this.eteTierArr[ix].tierType === 'APIM') {
                tierElapse = common.Util.numberWithComma(+tierElapse);
            } else {
                tierElapse = common.Util.toFixed(+tierElapse / 1000.0, 3);
            }
            // tierElapse = this.eteTierArr[ix].tierType === 'APIM' ? common.Util.numberWithComma(+tierElapse) : common.Util.toFixed(+tierElapse / 1000.0, 3);
            this.eteTierArr[ix].tier_elapse = tierElapse + tierUnit;
        }
    },

    calcTimeLineChartData: function() {
        // total Elapse

        var chartData = this.txnTimeLine.chartData;
        var ix, ixLen, jx, jxLen,
            totalElapse = 0, timeData, tooltipObj,
            startVal, elapseVal, elapse, tid, txnName, tooltipStart, tooltipElapse, exception, wasId,
            parentTxnName, hopTime;


        this.eteTierArr.sort(function(a, b) {
            return a.seq > b.seq;
        });

        for (ix = 0, ixLen = this.eteTierArr.length; ix < ixLen; ix++) {

            timeData = [];

            for (jx = 0, jxLen = this.eteTierArr[ix].times.length; jx < jxLen; jx++) {

                elapse = this.eteTierArr[ix].times[jx][1];
                elapseVal = this.eteTierArr[ix].times[jx][7];
                startVal = this.eteTierArr[ix].times[jx][6];
                tid = this.eteTierArr[ix].times[jx][2];
                txnName = this.eteTierArr[ix].times[jx][3];
                exception = this.eteTierArr[ix].times[jx][4] || 0;
                wasId = this.eteTierArr[ix].times[jx][8];
                parentTxnName = this.eteTierArr[ix].times[jx][9];
                hopTime = this.eteTierArr[ix].times[jx][11] || 0;

                tooltipStart = this.eteTierArr[ix].times[jx][0];

                if (txnName === common.Util.CTR('Push Receive')) {
                    // tooltipElapse = common.Util.toFixed(+elapse , 1) + '(' + decodeURI('%C2%B5') + 's)';
                    tooltipElapse = common.Util.numberWithComma(+elapse) + '(' + decodeURI('%C2%B5') + 's)';
                } else {
                    if (this.eteTierArr[ix].times[jx][5] === 'APIM') {
                        tooltipElapse = common.Util.numberWithComma(+elapse) + '(' + decodeURI('%C2%B5') + 's)';
                    }
                    else {
                        tooltipElapse = common.Util.toFixed(+elapse / 1000.0, 3) + ' (s)';
                    }
                }

                // Start Value가 크다는건 늦게 시작한다는 의미
                // 하지만 빨리 시작해서 늦게끝나는 Txn이 존재가능하므로 Start+Elapse를 total로 간주.
                totalElapse = (startVal + elapseVal) > totalElapse ? (startVal + elapseVal) : totalElapse;
                if (this.eteTierArr[ix].tierValue === 'agent' && this.eteTierArr[ix].times[jx][10]) {
                    tooltipObj = {
                        '': txnName,
                        'Start Time': tooltipStart,
                        'Elapse Time': tooltipElapse,
                        'empty-line': true,
                        'Parent': parentTxnName,
                        'Hop Time': common.Util.numberWithComma(hopTime) + ' (ms)'
                    };
                } else {
                    tooltipObj = {
                        '': txnName,
                        'Start Time': tooltipStart,
                        'Elapse Time': tooltipElapse
                    };
                }

                timeData.push({
                    value        : elapseVal,
                    start        : startVal,
                    tid          : tid,
                    tooltip      : tooltipObj,
                    extInfo      : { 'exception' : exception },
                    wasId        : wasId
                });
            }

            // TimeBar가 겹칠 경우에 작은걸 위에 올리기 위해 정렬처리
            timeData.sort(function(a, b) {
                return b.value - a.value;
            });

            chartData.data.push({
                tier      : this.eteTierArr[ix].tier,
                agent     : this.eteTierArr[ix].agent,
                start_time: this.eteTierArr[ix].start_time,
                elapse    : this.eteTierArr[ix].tier_elapse,
                times     : timeData
            });
        }

        chartData.elapse = totalElapse;

        console.debug('etePathArr', this.etePathArr);
        console.debug('eteTierArr', this.eteTierArr);
        console.debug('chartData', chartData);
    },

    checkMicroUnitAgentData: function() {
        var ix, ixLen,
            jx, jxLen,
            pathData, data;

        for(ix = 0, ixLen = this.pathDataArr.length; ix < ixLen; ix++) {
            pathData = this.pathDataArr[ix];
            for(jx = 0, jxLen = pathData.wasData.length; jx < jxLen; jx++) {

                data = pathData.wasData[jx];

                if (jxLen > 1) {
                    if(data[27] === 'APIM' || data[28] === 'APIM') {
                        this.isMicroUnit = true;
                        break;
                    }
                }
                else {
                    if (Comm.wasInfoObj[this.wasInfo[0][1]].type === 'CD') {
                        this.isMicroUnit = true;
                        break;
                    }
                }
            }
        }
    },

    onClickTimeBar: function(tidList, wasId) {
        var callTreeList, pathListForCallTree, callTreePopInfo,
            tid, listId, ix, ixLen;


        if (tidList.length) {

            callTreeList = this.callTreeInfo.dataList;
            pathListForCallTree = this.callTreeBuffer;
            callTreePopInfo = this.callTreePopUpInfo;
            callTreePopInfo.idList = [];
            callTreePopInfo.tabList = {};

            this.loadingMask.showMask();

            for (ix = 0, ixLen = tidList.length; ix < ixLen; ix++) {
                tid = tidList[ix];
                listId = '_' + wasId + '_' + tid;

                if (!tid) {
                    this.loadingMask.hide();
                    return;
                }

                callTreePopInfo.idList.push(listId);

                if (!callTreeList[listId]) {
                    if (!pathListForCallTree[tid]) {
                        tid = this.topTid;
                    }

                    this.execCallTreeQuery(tid);
                    this.execExcludeDataQuery(tid);
                }
            }

            if (!this.callTreeInfo.sqlCount) {
                this.createCallTreeWindow();
            }
        }
    },

    extProcTimeBar: function() {
        var chart = this.txnTimeLine.svgChart;

        chart.selectAll('rect.xm-timeline-bar')
            .style('fill', function(d) { return d.extInfo.exception ? '#F40000' : this.style.fill; });
    },

    loadTxnDetailContents: function() {
        var ix, ixLen;
        this.setCallTreeData();

        for(ix=0, ixLen=this.navList.length; ix<ixLen; ix++) {
            if(this.navList[ix].id == 'exception' && ix > 0) {
                this.setExceptionData(this.callTreeData);
                break;
            }
        }

        // check Require Set Micro Unit
        this.checkMicroUnitAgentData();

        if(this.useTimeLine && this.txnTimeLine) {
            this.timeLineLayer.loadingMask.show();
            this.execTimeLineQuery();
        }

        this.loadingMask.hide();    // 최초 로딩 종료
        this.loadDone = true;
        this.loadFirstContents();
    },

    onSapGetParenthData : function(header, data) {    //txn_detail_sap_get_parent
        if ( data.rows.length == 0 ){
            return ;
        }

        var ix;
        var time = [], key2 = [], elapse_time = [], tid = data.rows[0][3];
        var last_idx = data.rows.length-1 ;


        for ( ix = 0 ; ix < data.rows.length; ix++ ){

            time.push( data.rows[ix][0] ) ;
            key2.push( data.rows[ix][1] ) ;
            elapse_time.push( Number(data.rows[ix][2]) ) ;

        }


        WS.SQLExec({
            sql_file: 'txn_detail_sap_connect.sql',
            bind: [{
                name: 'from_time',
                type: SQLBindType.STRING,
                value: time[0]
            },{
                name: 'to_time',
                type: SQLBindType.STRING,
                value: time[last_idx]
            },{
                name: 'min_key2',
                type: SQLBindType.LONG,
                value: key2[0]
            },{
                name: 'max_key2',
                type: SQLBindType.LONG,
                value: key2[last_idx]
            },{
                name: 'elapse_time',
                type: SQLBindType.FLOAT,
                value: elapse_time[last_idx]
            }],
            replace_string:[{
                name: 'tid',
                value: tid
            }]
        }, this.onSapConnectData, this);

        ix = null ;
        time = null ;
        key2 = null ;
        elapse_time = null ;
    },

    onSapConnectData : function(header, data) {
        if ( data.rows.length == 0 ) {
            return ;
        }

        this.loadingMask.show() ;

        var dp_tid = [] ;
        var dp_time = '' ;
        this.wp_tid = [] ;
        var assign_tid = [] ;

        var time = common.Util.getDate(data.rows[0][1]), tid ;
        for ( var ix = 0 ; ix < data.rows.length; ix++ ){

            tid  = data.rows[ix][2] ;
            assign_tid.push(tid) ;

            //최초의 p와 tid가 다른 p는 제낀다.
            if ( data.rows[ix][12] == 'P' ){

                //단 역시 DP는 제외 -> P인 DP TID는 모두 다르므로.
                if ( data.rows[ix][16] != 'DP' ){
                    if ( this.topTid !== tid ) {
                        continue ;
                    }

                    if ( (data.rows[ix][16] == 'WP') && (this.wp_tid.indexOf(tid) < 0) ){ //type
                        this.wp_tid.push( tid ) ;
                    }

                    if ( (data.rows[ix][17] == 'DP') &&  (dp_tid.indexOf( tid ) == -1) ){ //txn_id
                        dp_tid.push( tid ) ;
                        dp_time = data.rows[ix][1] ;
                    }
                }
            }else{
                //c의 경우에는 내 p가 최초의 tid와 다르면 제낀다.
                //단 역시 DP는 제외 -> P인 DP TID는 모두 다르므로.
                if ( data.rows[ix-1][16] == 'DP' &&  data.rows[ix][16] == 'WP' ){ //type
                    //wp만 sql이 있으므로 tid따로 수집.
                    if ( this.wp_tid.indexOf(tid) < 0 ){
                        this.wp_tid.push( tid ) ;
                    }

                }else{
                    if ( this.topTid !== data.rows[ix-1][2] ) {
                        continue ;
                    }

                    if ( (data.rows[ix][16] == 'WP') && (this.wp_tid.indexOf(tid) < 0) ){ //type
                        //wp만 sql이 있으므로 tid따로 수집.
                        this.wp_tid.push( tid ) ;
                    }

                    if ( (data.rows[ix][17] == 'DP') && (dp_tid.indexOf( tid ) == -1) ){ //txn_id
                        dp_tid.push( tid ) ;
                        dp_time = data.rows[ix][1] ;
                    }
                }
            }
        }

        ix = null ;

        self.txnPathClass_sap.javaDataParser( data.rows ) ;

        if ( dp_tid.length > 0 ){
            //SAP DP
            WS.SQLExec({
                sql_file: 'txn_detail_sap_dp_get_parent.sql',
                bind: [{
                    name : 'time',
                    type: SQLBindType.STRING,
                    value: dp_time
                }],
                replace_string: [{
                    name : 'tid',
                    value: dp_tid.join(',')
                }]
            }, this.onSapDPGetParentData, this);

            dp_tid = null ;
            dp_time = null ;
        }


        if ( this.wp_tid.length > 0 ){
            WS.SQLExec({
                sql_file: 'txn_detail_sap_db_connect.sql',
                bind: [{
                    name : 'time',
                    type: SQLBindType.STRING,
                    value: time
                }],
                replace_string: [{
                    name : 'tid',
                    value: this.wp_tid.join(',')
                }]
            }, this.onSapDBConnectData, this);

            var txn_detail_sap_sql_list = 'txn_detail_sap_sql_list.sql';

            WS.SQLExec({
                sql_file: txn_detail_sap_sql_list,
                bind: [{
                    name : 'time',
                    type: SQLBindType.STRING,
                    value: time
                }],
                replace_string: [{
                    name : 'tid',
                    value: this.wp_tid.join(',')
                }]
            }, this.onSapSqlListData, this);

        }
    },

    onSapDPGetParentData : function(header, data) {
        if ( data.rows.length == 0 ){
            return ;
        }

        var ix, time = [], key2 = [], elapse_time = [], tid = [] ;
        var last_idx = data.rows.length-1 ;


        for ( ix = 0 ; ix < data.rows.length; ix++ ){

            time.push( data.rows[ix][0] ) ;
            key2.push( data.rows[ix][1] ) ;
            elapse_time.push( Number(data.rows[ix][2]) ) ;

            if ( tid.indexOf( data.rows[ix][3] ) == -1 ){
                tid.push( data.rows[ix][3] ) ;
            }
        }

        WS.SQLExec({
            sql_file: 'txn_detail_sap_connect.sql',
            bind: [{
                name: 'from_time',
                type: SQLBindType.STRING,
                value: time[0]
            },{
                name: 'to_time',
                type: SQLBindType.STRING,
                value: time[last_idx]
            },{
                name: 'min_key2',
                type: SQLBindType.LONG,
                value: key2[0]
            },{
                name: 'max_key2',
                type: SQLBindType.LONG,
                value: key2[last_idx]
            },{
                name: 'elapse_time',
                type: SQLBindType.FLOAT,
                value: elapse_time[last_idx]
            }],
            replace_string: [{
                name: 'tid',
                value: tid.join(',')
            }]
        }, this.onSapConnectData, this);

        ix = null ;
        time = null ;
        key2 = null;
        elapse_time = null;
        tid = null;
    },

    onSapDBConnectData : function(header, data) {
        if ( data == null ){
            return ;
        }

        if ( data.rows.length > 0 ){
            this.txnPathClass_sap.dbDataParser(data.rows, this.was, this.wasInfo, this.wasRemoteInfo);
            this.wp_tid.length = 0 ;
        }

        if (this.wp_tid.length == 0 ){
            self.txnPathClass_sap.draw() ;
        }

    },

    onSapSqlListData : function(header, data) {
        if ( data == null ){
            return ;
        }

        if ( data.rows.length > 0 ){
            this.sqlListCreate([data]);
        }

    },


    /*************** Load Content - First Fire EVENT ********************/

    loadFirstContents : function() {    // 1번처리
        var targetDOM = this.sideNavLayer.el.dom;
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('click', true, false);
        targetDOM.children[0].dispatchEvent(evt);

    },

    /*************** Load Content - onClick SideMenu ********************/

    loadContents : function(e) {
        if(!this.loadDone || this.isClosed) {
            return;
        }

        var content = e.target.txnContent;
        var callBackFunc = content.callFn.bind(this);
        var ix, ixLen, retObj, isLoaded = false;

        // 여기에...활성화 되어있는 메뉴를 콜했을 때 return; 처리해주는 로직이 있으면 좋을듯...
        var navLists = this.sideNavLayer.el.dom.getElementsByClassName('active-nav');
        if(navLists.length) {
            for(ix=0, ixLen=navLists.length; ix<ixLen; ix++) {
                navLists[ix].className = 'txn-side-nav';
            }
        }

        if(e.target.className !== 'nav-exception-cnt') {
            e.target.classList.add('active-nav');
        }
        else {
            e.target.parentElement.classList.add('active-nav');
        }

        this.currContent = content.id;
        this.loadingMask.showMask();
        for(ix = 0, ixLen = this.contentsList.length; ix<ixLen; ix++) {

            if (this.contentsList[ix].id == content.id) {
                isLoaded = true;
                this.contentsList[ix].content.show();


                if(content.id == 'txnPath') {
                    try{
                        jsPlumb.repaintEverything();
                    }catch(e){
                        console.error(e.message);
                    }
                }
            } else {
                this.contentsList[ix].content.hide();
            }

        }
        this.loadingMask.hide();
        if(!isLoaded) {
            this.loadDone = false;
            retObj = callBackFunc();
            this.contentsList.push({id : content.id, content : retObj});
            retObj.show();
        }
    },

    /*************** Transaction Path ********************/

    loadTxnPath : function() {

        var elapseFilter = Comm.web_env_info.Intermax_DetailElapse || 1;

        this.txnPathDOM.id = 'path' + this.target;
        this.txnPathDOM.className = 'txn-detail-center-path';
        this.txnPathDOM.setAttribute('style', 'width:100%; height:100%; position:relative; overflow:auto;');

        this.bodyContentsDOM.appendChild(this.txnPathDOM);

        this.loadingMask.showMask();

        this.txnPathClass.param.isMicroUnit = this.isMicroUnit;
        this.txnPathClass.elapsefilter = this.isMicroUnit ? +elapseFilter*1000 : +elapseFilter;
        this.execTxnPathQuery();

        return this.$txnPathDOM;
    },

    execTxnPathQuery : function() {
        var ix, ixLen,
            tidList = [], replTidList,
            guidList = [], replGuidList;

        var startTime = +new Date(this.startTime);

        for (ix = 0, ixLen = this.callTreeData.length; ix < ixLen; ix++) {
            if (this.callTreeData[ix][5] && tidList.indexOf(this.callTreeData[ix][5]) < 0 ) {
                tidList.push(this.callTreeData[ix][5]);
            }

            if (this.callTreeData[ix][12] && guidList.indexOf('\'' + this.callTreeData[ix][12] + '\'') < 0 ) {
                guidList.push('\'' + this.callTreeData[ix][12] + '\'');
            }
        }

        replTidList = tidList.length > 0 ? tidList.join() : this.topTid;

        if (this.monitorType === 'CD' &&  guidList.length) {
            replGuidList = 'OR c.guid in (' + guidList.join() + ')';
        } else {
            replGuidList = '';
        }

        WS2.SQLExec({
            sql_file: 'txn_detail_client_web.sql',
            bind: [{
                name: 'from_time',
                type: SQLBindType.STRING,
                value: Ext.util.Format.date(new Date(startTime - 300000), 'Y-m-d H:i:s')
            },{
                name: 'to_time',
                type: SQLBindType.STRING,
                value: Ext.util.Format.date(new Date(startTime + (this.elapseTime  * 1000) + 300000), 'Y-m-d H:i:s')
            },{
                name: 'tid',
                type: SQLBindType.LONG,
                value: this.topTid
            }],
            replace_string: [{
                name: 'rd',
                value: this.rd
            },{
                name: 'tid_list',
                value: replTidList
            }, {
                name: 'guid_list',
                value: replGuidList
            }]
        }, this.onTxnPathData, this);
    },

    onTxnPathData : function(header, data) {
        var isExistClient = false,
            isExistWebServer = false;
        var ix, ixLen, wasData, dbData;
        var defaultWasType;

        if (this.isClosed || !common) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.debug('txnDetail-onTxnPathData');
            console.debug(header);
            console.debug(data);
            return;
        }

        console.info('call back : ', header.command);

        /**
         * Transaction Path Data
         * [0 ~ 3] = 0 : client Path, 1: web Path, 2: was Path, 3: db Path
         * [4] : call tree
         * [5 ~ ] : sql list
         *
         * [0] = 0: "client_ip" 1: "CLIENT_TIME"
         * [1] = 0: "web_ip" 1: "was_id" 2: "was_name" 3: "exec_count" 4: "w_elapse_time"
         * [2] = 0: "lvl" 1: "time" 2: "tid" 3: "type" 4: "p_was" 5: "WAS_NAME" 6: "txn_id"
         *       7: "TXN_NAME" 8: "method" 9: "c_tid" 10: "was" 11: "c_was_name" 12: "c_txn_id"
         *       13: "c_txn_name" 14: "dest" 15: "p_elapse_time" 16: "c_elapse_time" 17: "p_exec_cnt"
         *       18: "c_exec_cnt" 19: "txn_elapse" 20: "c_txn_elapse" 21: "web_ip" 22: "exception" 23: "c_exception"
         * [3] = 0: "WAS_ID" 1: "was_name" 2: "DB_ID" 3: "INSTANCE_NAME" 4: "exec_cnt" 5: "elapse_time" 6: "elapse_time_max"
         * [4] = 0: "was_id" 1: "was_name" 2: "txn_name" 3: "txn_elapse" 4: "remote_elapse" 5: "tid" 6: "dest" 7: "seq", txn_id
         * [5] = 0: "TIME" 1: "was_id" 2: "was_name" 3: "txn_id" 4: "instance_name" 5: "db_id" 6: "sql_id"
         *       7: "method_id" 8: "method_seq" 9: "sql_exec_count" 10: "sql_elapse_max" 11: "sql_elapse_avg" 12: "cpu_time"
         *       13: "wait_time" 14: "logical_reads" 15: "physical_reads" 16: "tid" 17: "sql_text"
         *
         **/

        if (Array.isArray(data)) {
            this.clientData = data[2].rows.length > 0 ? data[2].rows : data[0].rows;
            this.webData = data[1].rows;

            if (this.clientData && this.clientData.length > 0) {
                isExistClient = true;
                this.txnPathClass.clientDataParser(this.clientData);
            }

            if (this.webData && this.webData.length > 0) {
                isExistWebServer = true;
                this.txnPathClass.webDataParser(this.webData);
            } else {
                this.txnPathClass.pBasicLvl = 0;
                this.txnPathClass.cBasicLvl = 1;
            }

            for (ix = 0, ixLen = this.pathDataArr.length; ix < ixLen; ix++) {

                wasData = this.pathDataArr[ix].wasData;
                dbData  = this.pathDataArr[ix].dbData;

                if (this.txnPathReplyInfo.length && !this.txnPathClass.asyncInfo.replyInfo.length) {
                    this.txnPathClass.asyncInfo.replyInfo = common.Util.deepObjCopy(this.txnPathReplyInfo);
                }

                if (wasData && wasData.length > 0 && wasData[0][2]) {
                    this.txnPathClass.javaDataParser(wasData, ix === 0 ? false : this.isAsync, ix);
                } else {
                    if (this.wasInfo && this.wasInfo.length > 0 && (!dbData || !dbData.length)) {
                        wasData = [0, this.wasInfo[0][0], this.wasInfo[0][4], 'P', this.wasInfo[0][1], this.wasInfo[0][2], this.wasInfo[0][5], this.wasInfo[0][6], this.wasInfo[0][6], null,
                            null, null, null, null, this.wasInfo[0][7], this.remoteValue, null, this.wasInfo[0][8], null, (this.wasInfo[0][9] / 1000).toFixed(3),
                            null, null, this.wasInfo[0][12], null, this.wasInfo[0][13]];

                        defaultWasType = Comm.wasInfoObj[wasData[4]] ? Comm.wasInfoObj[wasData[4]].type || 'WAS' : 'WAS';
                        this.isMicroUnit = defaultWasType === 'CD';

                        this.txnPathClass.param.isMicroUnit = this.isMicroUnit;
                        this.txnPathClass.defaultJavaDataParser(wasData);
                    }
                }

                if (dbData && dbData.length > 0) {
                    this.txnPathClass.dbDataParser(dbData, this.was, this.wasInfo, this.wasRemoteInfo, wasData, ix === 0 ? false : this.isAsync, ix);
                }
            }

            if (!this.pathDataArr.length && this.wasInfo && this.wasInfo.length > 0) {
                wasData = [0, this.wasInfo[0][0], this.wasInfo[0][4], 'P', this.wasInfo[0][1], this.wasInfo[0][2], this.wasInfo[0][5], this.wasInfo[0][6], this.wasInfo[0][6], null,
                    null, null, null, null, this.wasInfo[0][7], this.remoteValue, null, this.wasInfo[0][8], null, (this.wasInfo[0][9] / 1000).toFixed(3),
                    null, null, this.wasInfo[0][12], null, this.wasInfo[0][13]];

                defaultWasType = Comm.wasInfoObj[wasData[4]] ? Comm.wasInfoObj[wasData[4]].type || 'WAS' : 'WAS';
                this.isMicroUnit = defaultWasType === 'CD';

                this.txnPathClass.param.isMicroUnit = this.isMicroUnit;
                this.txnPathClass.defaultJavaDataParser(wasData);
            }

            if (isExistClient && !isExistWebServer) {
                this.txnPathClass.addClientToAgent(this.topTid);
            }

            this.txnPathClass.draw();

        }
        this.loadingMask.hide();
        this.loadDone = true;
    },

    /*************** Call Tree ********************/

    loadCallTree : function() {
        var self = this;
        this.callTreeLayer = Ext.create('Exem.TabPanel',{
            width : '100%',
            height: '100%',
            layout : 'fit',
            flex  : 1 ,
            activeTab: 0,
            listeners: {
                tabchange: function(tabPanel, tab) {
                    self.find_active_tab( self.methodSummary, 'tid', tab.tid ) ;

                    if (!self.callTreeList[tab.tabId]) {
                        self.callTreeLayer.setActiveTab(0);
                    }
                    else {
                        self.callTreeList[tab.tabId].load_active_data() ;
                    }
                }
            }
        });
        this.loadingMask.showMask();
        this.contentsLayer.add(this.callTreeLayer);
        this.getTidCallTreeData();

        return this.callTreeLayer;
    },

    setCallTreeData : function() {
        var callTreeTidList = {}, callTreeData,
            tid, wasId, txnName, unique, txnElapse, oriElapse,
            ix, ixLen;

        if (this.callTreeData && this.callTreeData.length > 0) {     // tid_path에서 self.callTreeData에 넣어줌
            for (ix = 0, ixLen =  this.callTreeData.length; ix < ixLen; ix++) {
                callTreeData = this.callTreeData[ix];

                tid = callTreeData[5];
                wasId = callTreeData[0];
                txnName = callTreeData[2];

                if (callTreeData[11] === 'APIM') {
                    oriElapse = +callTreeData[10];
                    txnElapse = common.Util.numberWithComma(+callTreeData[10]);
                }
                else {
                    txnElapse = callTreeData[3] / 1000;
                }

                unique = tid;


                if (callTreeData[11] === 'APIM') {
                    this.callTreeBuffer[unique] = {
                        txnName : txnName,
                        wasId   : wasId,
                        txnElapse : txnElapse,
                        oriElapse : oriElapse
                    };
                }
                else {
                    this.callTreeBuffer[unique] = {
                        txnName : txnName,
                        wasId   : wasId,
                        txnElapse : txnElapse
                    };
                }

                // 같은 tid 는 그리지 않는다.
                if(callTreeTidList[unique]){
                    continue;
                }

                callTreeTidList[unique] = true;
            }
        }
    },

    getTidCallTreeData : function() {
        var isRetrieve = false,
            pathListForCallTree, callTreeDataList,
            keys, tid, wasId, listId,
            ix, ixLen;

        var compContent = (this.currContent === 'callTree') ? 'methodSummary' : 'callTree';

        for(ix = 0, ixLen = this.contentsList.length; ix<ixLen; ix++) {
            if(this.contentsList[ix].id === compContent) {
                isRetrieve = true;
                break;
            }
        }

        if(isRetrieve) {
            if(this.currContent === 'callTree') {
                this.createCallTreeLayer();

                this.callTreeInfo.isLoaded = true;

                setTimeout(function(){
                    var tmpTid = this.topTid ? this.topTid : this.tid;

                    this.find_active_tab( this.callTreeLayer, 'tid', tmpTid);
                    this.loadingMask.hide();
                    this.loadDone = true;
                }.bind(this), 100 ) ;
            }
            else {
                if(this.methodSummaryData && this.methodSummaryData.length) {
                    this.createMethodSummaryLayer();
                }
                else {
                    this.loadingMask.hide();
                    this.loadDone = true;
                    console.info('No data - callTreeInfo.callTreeData');
                }
            }
        } else {
            pathListForCallTree = this.callTreeBuffer;
            callTreeDataList = this.callTreeInfo.dataList;
            keys = Object.keys(pathListForCallTree);

            if (pathListForCallTree && keys.length > 0) {
                for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                    tid = keys[ix];
                    wasId = pathListForCallTree[tid].wasId;
                    listId = '_' + wasId.toString() + '_' + tid.toString();

                    if (!callTreeDataList[listId]) {
                        this.execCallTreeQuery(tid);
                        this.execExcludeDataQuery(tid);
                    }
                }

                if (!this.callTreeInfo.sqlCount) {
                    if(this.currContent === 'callTree') {
                        this.createCallTreeLayer();

                        this.callTreeInfo.isLoaded = true;

                        setTimeout(function(){
                            var tmpTid = this.topTid ? this.topTid : this.tid;

                            this.find_active_tab( this.callTreeLayer, 'tid', tmpTid);
                            this.loadingMask.hide();
                            this.loadDone = true;
                        }.bind(this), 100 ) ;
                    }
                    else {
                        if(this.methodSummaryData && this.methodSummaryData.length) {
                            this.createMethodSummaryLayer();
                        }
                        else {
                            this.loadingMask.hide();
                            this.loadDone = true;
                            console.info('No data - callTreeInfo.callTreeData');
                        }
                    }
                }
            }
            else {
                this.execCallTreeQuery(this.topTid);
                this.execExcludeDataQuery(this.topTid);
            }
        }
    },


    execCallTreeQuery : function(tid) {
        WS2.StoredProcExec({
            stored_proc: 'txn_detail',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: tid
            }, {
                name: 'start_time',
                type: SQLBindType.STRING,
                value: this.startTime
            }, {
                name: 'end_time',
                type: SQLBindType.STRING,
                value: this.endTime
            }]
        }, this.onCallTreeData, this);

        this.callTreeInfo.sqlCount++;
    },

    execExcludeDataQuery : function(tid) {

        WS.SQLExec({
            sql_file: 'txn_detail_exclude_classmethod.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: tid
            }]
        }, this.onCallTreeData, this);

    },

    createCallTreeWindow: function() {
        var idList = this.callTreePopUpInfo.idList,
            ixLen = idList.length,
            dataList, tabList, useTabPanel, target, callTree,
            listId, ix;

        if (!ixLen) {
            return;
        }

        if (this.callTreeWindow) {
            this.callTreeWindow.removeAll();
        }

        dataList = this.callTreeInfo.dataList;
        tabList = this.callTreePopUpInfo.tabList;
        useTabPanel = ixLen > 1;

        this.callTreeWindow = Ext.create('Exem.XMWindow', {
            title: common.Util.TR('Call Tree'),
            width: 1100,
            height: 600,
            minWidth: 500,
            minHeight: 500,
            layout: 'vbox',
            closable: true,
            modal: true
        });

        if (useTabPanel) {
            target = Ext.create('Exem.TabPanel',{
                width : '100%',
                height: '100%',
                layout : 'fit',
                flex  : 1 ,
                activeTab: 0,
                listeners: {
                    scope: this,
                    tabchange: function(tabPanel, tab) {
                        var callTree = this.callTreePopUpInfo.tabList[tab.tabId];

                        if (callTree === undefined) {
                            tabPanel.setActiveTab(0);
                        }
                        else {
                            callTree.load_active_data();
                        }
                    }
                }
            });

            this.callTreeWindow.add(target);
        }
        else {
            target = this.callTreeWindow;
        }

        for (ix = 0; ix < ixLen; ix++) {
            listId = idList[ix];
            callTree = this.addCallTreeTab(target, dataList[listId], listId, useTabPanel);

            if (useTabPanel) {
                tabList[listId] = callTree;
            }
        }

        this.loadingMask.hide();
        this.callTreeWindow.show();

        if (useTabPanel) {
            target.setActiveTab(0);
        }
        else {
            callTree.load_active_data();
        }
    },

    onCallTreeData : function(header, data) {
        var self = this,
            ix, ixLen,
            listId, currMenu, rowData, className, methodName;

        if(this.isClosed || !common){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('txnDetail-onCallTreeData');
            console.debug(header);
            console.debug(data);
            return;
        }

        console.info('call back : ', header.command);

        switch(header.command) {
            case 'txn_detail' :
            case 'txn_detail.sql' :

                this.callTreeInfo.sqlCount--;

                this.setCallTreeQueryData(header, data);

                currMenu = this.currContent;
                if(!this.callTreeInfo.sqlCount){
                    if (currMenu === 'callTree' && !this.callTreeLayer.items.items.length) {
                        this.sortOfCallTree();
                        this.createCallTreeLayer();

                        setTimeout(function(){
                            this.find_active_tab( self.callTreeLayer, 'tid', this.topTid ? this.topTid : this.tid);
                            this.loadingMask.hide();
                            this.loadDone = true;
                        }.bind(this), 100 ) ;
                    }
                    else if (currMenu === 'methodSummary' && !this.methodSummary.items.items.length) {
                        this.sortOfCallTree();
                        this.createMethodSummaryLayer();
                    }
                    else {
                        this.createCallTreeWindow();
                    }
                }

                break;

            case 'txn_detail_exclude_classmethod.sql':

                for(ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                    rowData = data.rows[ix];
                    className = rowData[0];
                    methodName = rowData[1];
                    listId = '_' + rowData[2].toString() + '_' + rowData[3].toString();

                    if(!this.callTreeExcludeData[listId]) {
                        this.callTreeExcludeData[listId] = {
                            0 : [],
                            1 : []
                        };
                    }

                    this.callTreeExcludeData[listId][0].push({name: className, value: className});
                    this.callTreeExcludeData[listId][1].push({name: methodName, value: methodName});
                }

                break ;

            default : break;
        }

    },

    setCallTreeQueryData: function(header, data){
        var callTreeData = data[0].rows,
            methodSummaryData = data[1].rows,
            tid, elapse, wasId, storeId;

        if (callTreeData.length) {
            tid = callTreeData[0][17] + '';
            wasId = callTreeData[0][1] + '';
            storeId = '_' + wasId + '_' + tid;
        }
        else {
            callTreeData = [];
            methodSummaryData = [];
            tid = header.parameters.bind[0].value;
            wasId = this.callTreeBuffer[tid] ? this.callTreeBuffer[tid].wasId : this.wasId;
            storeId = '_' + wasId + '_'+ tid;
        }

        if(this.callTreeBuffer[tid]){
            elapse = this.callTreeBuffer[tid].oriElapse || this.callTreeBuffer[tid].txnElapse || 0;
        }
        else{
            elapse = 0;
        }

        this.callTreeInfo.dataList[storeId] = callTreeData;
        this.methodSummaryData.push(methodSummaryData);
        this.callTreeInfo.sortList.push({elapse: elapse, id: storeId});
    },

    sortOfCallTree: function(){
        var ix, ixLen, jx, jxLen,
            methodSummaryData = this.methodSummaryData,
            callTreeDataList = this.callTreeInfo.dataList,
            sortList = this.callTreeInfo.sortList,
            callTreeData, tempCallTreeData, tempMethodData, key, keys;

        if (!sortList.length) {
            return;
        }

        sortList.sort(function(a, b){
            return a.elapse > b.elapse ? -1 : a.elapse < b.elapse ? 1 : 0;
        });

        tempMethodData = [];
        tempCallTreeData = {};
        for (ix = 0, ixLen = sortList.length; ix < ixLen; ix++){
            keys = Object.keys(callTreeDataList);
            for(jx = 0, jxLen = keys.length; jx < jxLen; jx++){
                key = keys[jx];
                callTreeData = callTreeDataList[key];
                if(sortList[ix].id === key){
                    tempMethodData[ix] = methodSummaryData[jx];
                    tempCallTreeData[key] = callTreeData;
                    break;
                }
            }
        }

        this.callTreeInfo.sortList = [];
        this.callTreeInfo.dataList = tempCallTreeData;
        this.methodSummaryData = tempMethodData;

        callTreeDataList = null;
        tempCallTreeData = null;
        tempMethodData = null;
    },

    addCallTreeTab: function(base, data, tabId, isWrap) {
        var tid, elapse, txnName, wasId, wasName, title, tidForDebug,
            monitorType, callTree, tabContainer;

        if (data.length) {
            tid = data[0][17];
            elapse = (this.callTreeBuffer[tid] ? ':' + this.callTreeBuffer[tid].txnElapse : '');
            txnName = (this.callTreeBuffer[tid] ? ':' + this.callTreeBuffer[tid].txnName : '');
            wasId = data[0][1];
            wasName = data[0][2];
            tidForDebug = '';
        }
        else {
            tid = tabId.split('_')[2];
            wasId = (this.callTreeBuffer[tid] ? this.callTreeBuffer[tid].wasId : this.wasId);
            elapse = (this.callTreeBuffer[tid] ? ':' + this.callTreeBuffer[tid].txnElapse : '');
            txnName = (this.callTreeBuffer[tid] ? ':' + this.callTreeBuffer[tid].txnName : '');
            wasName = Comm.RTComm.getServerNameByID(wasId) || '';
            tidForDebug = '(TID: ' + tid + ')';
        }

        if (Comm.wasInfoObj[wasId]) {
            monitorType = Comm.wasInfoObj[wasId].type;
        }
        else {
            monitorType = 'WAS';
            console.debug('Call Tree - Unregistered agent (was_id) ', wasId);
        }

        title = wasName + txnName + elapse;

        if (isWrap) {
            tabContainer = Ext.create('Exem.Container',{
                title: title,
                tabId: tabId,
                tid: tid,
                layout: 'vbox',
                width: '100%',
                height: '100%',
                flex: 1,
                cls: 'call-tree-checkbox',
                // listeners : {
                //     boxready: function() {
                //         var tabId = this.tab.id,
                //             tabBtnId = this.tab.btnEl.id;
                //
                //         Ext.select(`#${tabId}, #${tabBtnId}`).selectable();
                //     }
                // }
            });

            base.add(tabContainer);
        }
        else {
            base.setTitle(common.Util.TR('Call Tree') + ' ( ' + title + ' )');
        }

        callTree = new XMCallTree({
            id: tabId,
            tid: tid,
            $target: isWrap ? tabContainer : base,
            data: data,
            tidForDebug: tidForDebug,
            monitorType: monitorType,
            inherent: this.target,
            txn_path: this
        });

        return callTree;
    },

    createCallTreeLayer: function(){
        var callTreeDataList = this.callTreeInfo.dataList,
            callTreeData, ix, ixLen, key, keys;

        if(this.callTreeLayer) {
            this.callTreeLayer.suspendLayouts();

            keys = Object.keys(callTreeDataList);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                key = keys[ix];
                callTreeData = callTreeDataList[key];

                this.callTreeList[key] = this.addCallTreeTab(this.callTreeLayer, callTreeData, key, true);
            }

            this.callTreeLayer.resumeLayouts();
            this.callTreeLayer.doLayout();
        }
    },

    /****************** SQL LIST *********************/

    loadSqlList : function() {

        this.sqlContextMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: common.Util.TR('Format SQL'),
                handler: function() {

                    self.open_sql_bind_text( null, 'format', self.sqlListTab.getActiveTab().title ) ;

                }
            },{
                text: common.Util.TR('Full SQL Text'),
                handler: function() {
                    self.open_sql_bind_text( null, '', self.sqlListTab.getActiveTab().title ) ;
                },
                tabchange: function( tabPanel, tab ){
                    console.info( tabPanel );
                    console.info( tab );
                }
            }]
        });

        this.sqlList = Ext.create('Exem.TabPanel', {
            layout    : 'fit',
            height    : '100%',
            deferredRender: false,
            flex      : 1,
            cls   : 'exem-tabpanel txn_path_tab',
            listeners : {
                tabchange: function(tabPanel, tab) {
                    tab.add(this.treeInSqlList);

                    this.treeInSqlList.clearNodes();
                    this.setSqlDataListToTree(tab.title);
                }.bind(this)
            }
        });

        this.sql = Ext.create('Exem.SyntaxEditor', {
            title       : common.Util.TR('SQL'),
            autoScroll  : true,
            readOnly    : true,
            sql_id      : null,
            hidden      : true
        });

        this.sqlBind = Ext.create('Exem.SyntaxEditor', {
            title     : common.Util.TR('SQL with binded value'),
            autoScroll: true,
            hidden    : true,
            readOnly  : true,
            bind_value: null
        });

        if(this.themeType){
            var editTheme;

            if(this.themeType === 'White'){
                editTheme = 'ace/theme/eclipse';
            }
            else{
                editTheme = 'ace/theme/dark_imx';
            }

            this.sql.editTheme = editTheme;
            this.sqlBind.editTheme = editTheme;
        }

        this.sqlListTab = Ext.create('Exem.TabPanel',{
            layout: 'fit',
            deferredRender: false,
            activeTab: 0,
            width: 300,
            height: '100%',
            hidden: true,
            bodyStyle: 'border:1px solid #d0d0d0;',
            items: [this.sql, this.sqlBind],
            cls   : 'exem-tabpanel txn_path_tab',
            listeners: {
                render: function(p) {
                    p.el.dom.addEventListener('contextmenu', function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        self.sqlContextMenu.showAt({x : e.pageX , y : e.pageY});
                    });
                },
                tabchange : function() {
                    var tmpBindSql = this.sqlBind.getText();
                    this.sqlBind.setText(tmpBindSql);
                }.bind(this)
            }
        });

        /************************* sql bind *************************/
        this.sqlListContainer = Ext.create('Exem.Panel',{
            layout: 'hbox',
            height: '100%',
            width: '100%',
            flex  : 1,
            items: [this.sqlList, {xtype: 'splitter'}, this.sqlListTab]

        });
        this.loadingMask.showMask();
        this.sqlListCreate(this.sqlListData);
        this.contentsLayer.add(this.sqlListContainer);

        this.loadingMask.hide();
        this.loadDone = true;

        return this.sqlListContainer;
    },

    /************************* active history *************************/
    loadActiveHistory : function() {
        this.activeHistory = Ext.create('Exem.TabPanel', {
            layout: 'fit',
            deferredRender: false,
            height: '100%',
            width : '100%',
            cls   : 'exem-tabpanel txn_path_tab'
        });

        this.loadingMask.showMask();
        this.execActiveHistoryQuery();
        this.contentsLayer.add(this.activeHistory);

        return this.activeHistory;
    },

    execActiveHistoryQuery : function() {
        var self = this;

        var call_tid = [] ;
        var call_was_id = [] ;

        var limitString;

        if ( Object.keys(self.callTreeBuffer).length === 0 ){
            call_tid.push( self.topTid ) ;
            call_was_id.push( self.wasId ) ;
        }else{

            for (var tid in self.callTreeBuffer ){
                if(self.callTreeBuffer.hasOwnProperty(tid)) {
                    call_tid.push(tid) ;
                    call_was_id.push(self.callTreeBuffer[tid].wasId) ;
                }
            }
        }

        if(common.Menu.useActiveTxnTableLimit){
            if (Comm.currentRepositoryInfo.database_type == 'PostgreSQL') {
                limitString = 'limit 500';
            } else if ( Comm.currentRepositoryInfo.database_type == 'MSSQL' ) {
                limitString = 'top 500';
            } else {
                limitString = 'WHERE ROWNUM <= 500' ;
            }
        } else {
            limitString = '';
        }

        for ( var ix = 0 ; ix < call_tid.length; ix++ ){
            // active history (쿼리에서 +- 5 time 추가)
            WS2.SQLExec({
                sql_file: 'txn_detail_active.sql',
                bind: [{
                    name: 'tid',
                    type: SQLBindType.LONG,
                    value: call_tid[ix] //self.topTid
                },{
                    name: 'from_time',
                    type: SQLBindType.STRING,
                    value: Common.fn.dateToYMDHMS(self.startTime)
                },{
                    name: 'to_time',
                    type: SQLBindType.STRING,
                    value: Common.fn.dateToYMDHMS(self.endTime)
                },{
                    name: 'was_id',
                    type: SQLBindType.INTEGER,
                    value : call_was_id[ix]
                }],
                replace_string: [{
                    name    : 'limit',
                    value   : limitString
                }]
            }, self.onActiveHistoryData, self);
            this.activeHistoryCnt++;
        }
    },

    onActiveHistoryData : function(header, data) {
        if(this.isClosed || !common){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('txnDetail-onActiveHistoryData');
            console.debug(header);
            console.debug(data);
            return;
        }
        console.info('call back : ', header.command);

        var ix ;
        var active_grid = null ,
            tab_title = '', wasMonitorType, cpuTimeVal;
        this.activeHistoryCnt--;
        for ( ix = 0; ix < data.rows.length; ix++ ){

            if ( tab_title !== data.rows[ix][2] + (this.callTreeBuffer[data.rows[ix][3]] ? ':' + this.callTreeBuffer[data.rows[ix][3]].txnName : '') ){
                if(Comm.wasInfoObj[data.rows[ix][1]]) {
                    wasMonitorType = Comm.wasInfoObj[data.rows[ix][1]].type;
                }
                else {
                    wasMonitorType = 'WAS';
                    console.debug('Active History - Unregistered agent (was_id) ', data.rows[ix][1]);
                }

                active_grid = null ;
                active_grid = this._set_active_grid() ;
                this._set_class_view(active_grid, wasMonitorType) ;
                tab_title = data.rows[ix][2] + (this.callTreeBuffer[data.rows[ix][3]] ? ':' + this.callTreeBuffer[data.rows[ix][3]].txnName : '') ;
                active_grid.tab.setText( tab_title ) ;
                active_grid.drawGrid() ;
            }

            cpuTimeVal = wasMonitorType === 'TP' ? data.rows[ix][43] : data.rows[ix][38];

            active_grid.addRow( [ data.rows[ix][ 0]                         //'time'
                ,data.rows[ix][28]                                          //'class_method'
                ,Common.fn.codeBitToMethodType(data.rows[ix][29])           //'method_type'
                ,data.rows[ix][ 6]                                          //'client_ip'
                ,data.rows[ix][39]                                          //'login_name'
                ,data.rows[ix][ 7]                                          //'start_time'
                ,data.rows[ix][43]                                          //'txn_cpu_time'
                ,data.rows[ix][31]                                          //'cpu_time'
                ,data.rows[ix][32]                                          //'wait_time'
                ,data.rows[ix][33]                                          //'db_time'
                ,data.rows[ix][11]                                          //'pool_name'
                ,data.rows[ix][ 9]                                          //'elapse_time'
                ,data.rows[ix][12]                                          //'instance_name'
                ,data.rows[ix][13]                                          //'sid'
                ,common.DataModule.threadStateType[data.rows[ix][14]]       //'state'
                ,this._get_bind( data.rows[ix][42] )                        //'bind_list'
                ,data.rows[ix][16]                                          //'sql_text1'
                ,data.rows[ix][18]                                          //'sql_text2'
                ,data.rows[ix][20]                                          //'sql_text3'
                ,data.rows[ix][22]                                          //'sql_text4'
                ,data.rows[ix][24]                                          //'sql_text5'
                ,data.rows[ix][25]                                          //'sql_exec_count'
                ,data.rows[ix][26]                                          //'fetch_count'
                ,data.rows[ix][27]                                          //'prepare_count'
                ,data.rows[ix][34]                                          //'mem_usage'
                ,data.rows[ix][35]                                          //'logical_reads'
                ,data.rows[ix][36]                                          //'physical_reads'
                ,data.rows[ix][37]                                          //'wait_info'
                ,data.rows[ix][ 1]                                          //'was_id'
                ,data.rows[ix][ 2]                                          //'was_name'
                ,data.rows[ix][ 3]                                          //'tid'
                ,data.rows[ix][ 4]                                          //'txn_id'
                ,data.rows[ix][ 5]                                          //'txn_name'
                ,data.rows[ix][ 8]                                          //'avg_elapse'
                ,data.rows[ix][10]                                          //'pool_id'
                ,data.rows[ix][15]                                          //'sql_id1'
                ,data.rows[ix][17]                                          //'sql_id2'
                ,data.rows[ix][19]                                          //'sql_id3'
                ,data.rows[ix][21]                                          //'sql_id4'
                ,data.rows[ix][23]                                          //'sql_id5'
                ,data.rows[ix][30]                                          //'current_crc'
                ,data.rows[ix][40]                                          //'io_read'
                ,data.rows[ix][41]                                          //'io_write'
            ] );

        }
        if ( active_grid !== null && active_grid !== undefined ){
            active_grid.drawGrid();
        }

        this.activeHistory.setActiveTab(0) ;
        if(this.activeHistoryCnt === 0) {
            this.loadingMask.hide();
            this.loadDone = true;
        }
        ix = null ;
        active_grid = null ;
        tab_title = null ;
    },

    /************************** EXCEPTION ************************************/

    loadException : function() {
        var self = this;

        this.exception = Ext.create('Exem.BaseGrid',{
            flex      : 1,
            itemId    : 'exception',
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            gridType  : Grid.exTree ,
            adjustGrid: true
        });


        this.exception.beginAddColumns() ;
        this.exception.addColumn( common.Util.TR('LOG TEXT'), 'log_text' , 100, Grid.String, true, false, 'treecolumn' );
        this.exception.addColumn( 'sql_id'                  , 'sql_id'   , 100, Grid.String, true, true  );
        this.exception.addColumn( 'bind_list'               , 'bind_list', 100, Grid.String, true, true  );


        this.exception.addRenderer('log_text', function(value, meta, record) {
            if ( record.data['sql_id'] == '' || record.data['sql_id'] == undefined ) {
                return value;
            }

            var el = '<div style="display: inline-flex; position: relative; width:100%; height: 100%">' +
                '<div style="display: inline-block;  height:20px; line-height: 20px; font-size: 11px;">' +record.data['log_text'] + '</div>' +
                '<div class="exception-sql" id="'+self.id+'" data-sql="'+ record.data['sql_id'] + '" data-bind="'+record.data['bind_list']+'"></div>' +
                '</div>';



            return el ;
        } ) ;

        this.exception.endAddColumns() ;
        common.WebEnv.setVisibleGridColumn(this.exception, ['bind_list'], Comm.config.login.permission.bind !== 1 ) ;


        this.exception.pnlExTree.getView().addListener('refresh', function(_view) {
            var openFullSqlText = function(){
                var full_sql_view = Ext.create('Exem.FullSQLTextWindow'),
                    editTheme;
                full_sql_view.getFullSQLText(this.dataset.sql, this.dataset.bind);

                if(self.themeType){
                    switch (self.themeType) {
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

                    full_sql_view.addCls('xm-dock-window-base rtm-sqlview');
                    full_sql_view.BaseFrame.sqlEditor.editTheme = editTheme;
                    full_sql_view.BaseFrame.bindEditor.editTheme = editTheme;
                }

                full_sql_view.show();
            };

            var exceptionSql = _view.el.dom.getElementsByClassName('exception-sql');
            if(exceptionSql.length > 0){
                for(var ix = 0, ixLen = exceptionSql.length; ix < ixLen; ix++){
                    exceptionSql[ix].onclick = openFullSqlText;
                }
            }
        });

        this.exception.pnlExTree.addListener('afteritemcollapse', function() {
            if (self.exception.pnlExTree.getPlugin('bufferedrendererPlugin').bodyTop > 0) {
                self.exception.pnlExTree.getPlugin('bufferedrendererPlugin').bodyTop = 0;
                self.exception.pnlExTree.getView().refresh();
            }
        });

        this.exception.pnlExTree.addListener('afteritemexpand', function() {
            if (self.exception.pnlExTree.getPlugin('bufferedrendererPlugin').bodyTop > 0) {
                self.exception.pnlExTree.getPlugin('bufferedrendererPlugin').bodyTop = 0;
                self.exception.pnlExTree.getView().refresh();
            }
        });

        this.loadingMask.showMask();

        this.setExceptionData(self.callTreeData);
        this.contentsLayer.add(this.exception);


        return this.exception;
    },

    setExceptionData: function(callTreeData){
        var ix, ixLen,
            tId, tIdList, wasId, errCnt = 0,
            treeData, exception;

        if(callTreeData && callTreeData.length > 0){
            tIdList = {};
            for(ix = 0, ixLen =  callTreeData.length; ix < ixLen; ix++){
                treeData = callTreeData[ix];
                tId = treeData[5];
                wasId = treeData[0];
                exception = treeData[9] || 0;
                // 같은 tid 는 그리지 않는다.
                if(tIdList[tId] || exception < 1){
                    continue;
                }

                tIdList[tId] = true;
                errCnt++;
                this.execExceptionQuery(tId, wasId, this.startTime);
            }
        }
        else {
            // top_tid로 검사 하되 top_tid exception이 1인 경우.
            if(this.wasInfo[0][12] > 0) {
                this.execExceptionQuery(this.topTid, this.wasId, this.startTime);
            }
        }

        if(!errCnt) {
            this.loadingMask.hide();
            this.loadDone = true;
        }
    },

    execExceptionQuery: function(tId, wasId, fromTime){
        this.exceptionCnt++;
        WS2.SQLExec({
            sql_file: 'txn_detail_exception.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: tId
            },{
                name: 'was_id',
                type: SQLBindType.INTEGER,
                value : wasId
            },{
                name: 'from_time',
                type: SQLBindType.STRING,
                value: fromTime
            }]
        }, this.onExceptionData, this);
    },

    onExceptionData : function(header, data) {
        var ix, ixLen, jx,
            token, node,
            wasId = '',  sqlId = '', bindList = '', wasName,
            $exception;

        this.exceptionCnt--;

        if(this.isClosed || !common){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('txnDetail-onExceptionData');
            console.debug(header);
            console.debug(data);
            return;
        }

        console.info('call back : ', header.command);

        if(this.exception) {

            if (data.rows.length){

                this.exception.beginTreeUpdate();

                for (ix=0, ixLen=data.rows.length; ix<ixLen; ix++) {

                    wasId = data.rows[ix][4];
                    sqlId = data.rows[ix][2] ? data.rows[ix][2] : '';
                    bindList = data.rows[ix][3];

                    node = this.exception.addNode(null, [wasId, sqlId, bindList]);

                    this.processCount.exception++;
                    token = Common.fn.splitN( data.rows[ix][0], '\n');

                    for (jx=0; jx<token.length; jx++) {
                        if(token[jx] && token[jx].length && token[jx] != '\r') {
                            this.exception.addNode(node, [token[jx]]);
                        }
                    }
                }

                this.exception.drawTree();
                this.exception.endTreeUpdate();

                this.exceptBufferNumber += ixLen;

                if(this.exceptionCnt === 0) {
                    this.exception.pnlExTree.plugins[0].trailingBufferZone = (this.exceptBufferNumber + 100);
                    this.exception.pnlExTree.plugins[0].leadingBufferZone  = (this.exceptBufferNumber + 100);
                    this.exception.pnlExTree.getView().refresh();
                }
            }
            else {
                if(this.navList[0].id === 'exception') {
                    this.processCount.exception++;
                }

                this.exception.beginTreeUpdate();
                wasName = Comm.RTComm.getEtoEServerNameByID(header.parameters.bind[1].value) || 'Unknown Agent';

                node = this.exception.addNode(null, [wasName, '', '']);
                this.exception.addNode(node, ['UnCaught Exception', '', '']);

                this.exception.drawTree();
                this.exception.endTreeUpdate();
            }
        }
        else {
            if(data.rows.length) {
                for (ix=0, ixLen=data.rows.length; ix<ixLen; ix++) {
                    this.processCount.exception++;
                }
            }
            else {
                this.processCount.exception++;
            }
        }

        if(!this.isDrawNaviExceptionCnt && !this.exceptionCnt) {
            $exception = $('#' + this.id + ' .txn-side-nav').find('span.nav-exception-cnt');
            $exception.show();
            $exception.text(' (' + this.processCount.exception + ')');

            for (ix=0, ixLen=this.navList.length; ix<ixLen; ix++) {
                if (this.navList[ix].id === 'exception') {
                    $exception[0].txnContent = this.navList[ix];
                    break;
                }
            }
            $exception[0].onclick = this.loadContents.bind(this);

            this.isDrawNaviExceptionCnt = true;
        }

        if(this.exceptionCnt === 0) {
            this.loadingMask.hide();
            this.loadDone = true;
        }
    },

    /*****************************METHOD SUMMARY************************************/

    loadMethodSummary : function() {
        var self = this;
        this.methodSummary = Ext.create('Exem.TabPanel', {
            layout: 'fit',
            deferredRender: false,
            activeTab: 0,
            height: '100%',
            width: '100%',
            cls   : 'exem-tabpanel txn_path_tab',
            listeners: {
                tabchange: function(tabPanel, tab) {
                    self.find_active_tab( self.callTreeLayer, 'tid', tab.tid );
                }
            }
        });

        this.contentsLayer.add(this.methodSummary);
        this.loadingMask.showMask();
        this.getTidCallTreeData();
        return this.methodSummary;
    },

    createMethodSummaryLayer: function(){
        var ix, ixLen,
            callTreeDataList, callTreeKeys, callTreeData,
            methodSummaryDataList, methodSummaryData,
            txnName, tabId, wasId, title, tid, elapse, wasName;


        if(this.methodSummary) {
            this.methodSummary.suspendLayouts();

            callTreeDataList = this.callTreeInfo.dataList;
            callTreeKeys = Object.keys(callTreeDataList);
            methodSummaryDataList = this.methodSummaryData;

            for(ix = 0, ixLen = methodSummaryDataList.length; ix < ixLen; ix++){
                callTreeData = callTreeDataList[callTreeKeys[ix]];
                methodSummaryData = methodSummaryDataList[ix];

                if (callTreeData.length){
                    wasId = callTreeData[0][1];
                    tid = callTreeData[0][17];
                    elapse = (this.callTreeBuffer[tid] ? ':' + this.callTreeBuffer[tid].txnElapse : '');
                    txnName = (this.callTreeBuffer[tid] ? ':' + this.callTreeBuffer[tid].txnName : '');
                    tabId = '_' + callTreeData[0][1].toString() + '_' + tid.toString();
                    title = callTreeData[0][2] + txnName + elapse;
                } else {
                    tid = callTreeKeys[ix].split('_')[2];
                    wasId = (this.callTreeBuffer[tid] ? this.callTreeBuffer[tid].wasId : this.wasId);
                    elapse = (this.callTreeBuffer[tid] ? ':' + this.callTreeBuffer[tid].txnElapse : '');
                    txnName = (this.callTreeBuffer[tid] ? ':' + this.callTreeBuffer[tid].txnName : '');
                    wasName = Comm.RTComm.getServerNameByID(wasId) || '';
                    title = wasName + txnName + elapse;
                    tabId = '_' + wasId + '_' + tid;
                }

                this.methodSummaryAddTab(tabId, title, methodSummaryData, tid, wasId);
                this.methodSummary.resumeLayouts();
                this.methodSummary.doLayout();
            }
        }

        this.loadingMask.hide();
        this.loadDone = true;
    },


    loadUserData : function() {
        this.userData = Ext.create('Exem.TabPanel', {
            layout: 'fit',
            deferredRender: false,
            autoScroll : true,
            activeTab: 0,
            height: '100%',
            cls   : 'exem-tabpanel txn_path_tab'
        });

        this.loadingMask.showMask();
        this.execUserDataQuery();
        this.contentsLayer.add(this.userData);

        return this.userData;

    },

    execUserDataQuery : function() {
        var self = this;
        var call_tid = [] ;

        if ( Object.keys(self.callTreeBuffer).length == 0 ){
            call_tid.push( self.topTid ) ;
        }else{

            for (var tid in self.callTreeBuffer ){
                if(self.callTreeBuffer.hasOwnProperty(tid)) {
                    call_tid.push( tid ) ;
                }
            }
        }


        for ( var ix = 0 ; ix < call_tid.length; ix++ ){

            WS2.SQLExec({
                sql_file: 'txn_detail_user_data.sql',
                bind: [{
                    name: 'tid',
                    type: SQLBindType.LONG,
                    value: call_tid[ix]//self.topTid
                },{
                    name: 'from_time',
                    type: SQLBindType.STRING,
                    value: Common.fn.dateToYMDHMS(self.startTime)
                }]
            }, self.onUserData, self);

        }
    },

    onUserData : function (header, data) {
        if(this.isClosed || !common){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('txnDetail-onUserData');
            console.debug(header);
            console.debug(data);
            return;
        }

        console.info('call back : ', header.command);

        try{
            if(header.rows_affected){
                this.userDataAddTab(data.rows);
            }
        }catch(e){
            console.info(e.message);
        }finally{
            this.loadingMask.hide();
            this.loadDone = true;
        }
    },

    methodSummaryAddTab: function(tabId, title, data, tid, wasId){
        var self = this,
            methodSummaryTab = self.methodSummary,
            agentGrid, wasMonitorType, elpaseVal, elapseRatio,
            elapseGridType, elapseTime, saveGridName,
            ix, ixLen;

        if(Comm.wasInfoObj[wasId]) {
            wasMonitorType = Comm.wasInfoObj[wasId].type;
        }
        else {
            wasMonitorType = 'WAS';
            console.debug('Call Tree - Unregistered agent (was_id) ', wasId);
        }

        elapseGridType = wasMonitorType === 'CD' ? Grid.Number : Grid.Float;
        elapseTime = wasMonitorType === 'CD' ? common.Util.CTR('Elapsed Time') + ' (' + decodeURI('%C2%B5') + 's)' : common.Util.CTR('Elapse Time');
        saveGridName = 'pa_txn_detail_method_summary';

        agentGrid = Ext.create('Exem.BaseGrid', {
            gridName: saveGridName,
            itemId: 'txnDetailGrid',
            usePager: false,
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            useEmptyText: true,
            emptyTextMsg: common.Util.TR('No data to display'),
            itemdblclick: function(view, record) {
                var key, seq,
                    sideDOM, callTreeDOM, methodSummaryDOM;

                sideDOM = self.sideNavLayer.el.dom;

                if(self.callTreeLayer) {
                    methodSummaryDOM = sideDOM.getElementsByClassName('active-nav')[0];
                    methodSummaryDOM.classList.remove('active-nav');

                    callTreeDOM = sideDOM.querySelectorAll("[data-tabid = 'callTree']")[0];
                    callTreeDOM.classList.add('active-nav');
                    self.callTreeLayer.show();
                    self.methodSummary.hide();

                    key = record.data.method_id;
                    seq = record.data.method_seq;

                    self.callTreeList[record.data.tab_id].filter_off.show_state = true;
                    self.callTreeList[record.data.tab_id].filter_off.sql_list = false;
                    self.callTreeList[record.data.tab_id].callTreeGrid.pnlExTree.expandAll();
                    self.callTreeList[record.data.tab_id].filter_off.filter_key = key;
                    self.callTreeList[record.data.tab_id].filter_off.filter_seq = seq;
                    self.callTreeList[record.data.tab_id].filtering(key, seq);
                }
            }
        });

        agentGrid.beginAddColumns();
        agentGrid.addColumn('tab_id',                               'tab_id',       90,     Grid.String, false, true);
        agentGrid.addColumn('method_id',                            'method_id',    150,    Grid.String, false, true);
        agentGrid.addColumn('method_seq',                           'method_seq',   250,    Grid.String, false, true);
        agentGrid.addColumn(common.Util.CTR('Ratio (%)'),           'elapse_ratio', 120,    Grid.StringNumber, true , false);
        if(wasMonitorType === 'TP' || wasMonitorType === 'CD') {
            agentGrid.addColumn(common.Util.CTR('Class Name'),          'class_name',   200,    Grid.String, false,true);
            agentGrid.addColumn(common.Util.CTR('Trace'),              'trace',  200,    Grid.String, true, false);
        }
        else {
            agentGrid.addColumn(common.Util.CTR('Class Name'),          'class_name',   200,    Grid.String, true, false);
            agentGrid.addColumn(common.Util.CTR('Method'),              'method_name',  200,    Grid.String, true, false);
        }
        agentGrid.addColumn(common.Util.CTR('Execute Count'),       'exec_count',   120,    Grid.Number, true, false);
        agentGrid.addColumn(elapseTime,         'elapse_time',  120,    elapseGridType , true, false);
        agentGrid.addColumn(common.Util.CTR('Exception Count'),     'error_count',  150,    Grid.Number, true, false);
        agentGrid.endAddColumns();

        agentGrid.loadLayout(saveGridName);
        agentGrid.addRenderer('elapse_ratio', function(v) {
            var ratio_style = 'background: -webkit-gradient(linear,left center,right center, color-stop(0%,#76addb ), color-stop(100%, #4a8fd7 )); width:'+ v +'%;height:13px';

            return '<div style="position:relative;overflow:hidden;height:13px;"><div style="position:absolute;left:0px;top:0px;text-align:center;width:100%;">'+ Common.fn.zeroToFixed(v,3) +'%</div><div style="'+ ratio_style +'"></div></div>';
        });

        agentGrid.setOrderAct('elapse_time', 'DESC');

        methodSummaryTab.add({
            xtype: 'panel',
            title: title,
            tid: tid,
            layout: 'fit',
            items : [agentGrid]
        });
        //8 9

        if(data.length){
            for(ix = 0, ixLen = data.length; ix < ixLen; ix++){
                elpaseVal = wasMonitorType === 'CD' ? data[ix][8] : data[ix][4];
                elapseRatio = wasMonitorType === 'CD' ? Common.fn.round(data[ix][9], 1) : Common.fn.round(data[ix][6], 1);

                agentGrid.addRow([
                     tabId              // 'tab_id'
                    ,data[ix][0]        // 'method_id'
                    ,''                 // 'method_seq'
                    ,elapseRatio        // 'elapse_ratio'
                    ,data[ix][1]        // 'class_name'
                    ,data[ix][2]        // 'method_name'
                    ,data[ix][3]        // 'exec_count'
                    ,elpaseVal          // 'elapse_time'
                    ,data[ix][5]        // 'error_count'
                ]);
            }

            agentGrid.drawGrid();
        } else {
            agentGrid.showEmptyText();
        }

        methodSummaryTab.setActiveTab(0);
    },

    userDataAddTab: function(data){
        var ix, ixLen, jx, jxLen;
        var tabPanel = this.userData;
        var sqlIdDefine = {
            UD_P: '&lt;OUT&gt;<br/>',
            UD_C: '&lt;IN&gt;<br/>',
            UD_R: '&lt;RETURN&gt;<br/>',
            UD_H: ''
        };
        var userDataCodeReplaceData = this.userDataCodeReplaceData;
        var userData, originValue, replaceString;
        var wasName, wasId, tId;
        var text = '';

        for(ix = 0, ixLen = data.length; ix < ixLen; ix++){
            if(data[ix][1]){
                tId = data[ix][1];
                wasId = data[ix][3];
                wasName = data[ix][4];
                break;
            }
        }

        if(!tId){
            return;
        }

        userData = Ext.create('Ext.container.Container', {
            cls: 'txn-detail-bottom-userData'
        });

        for(ix = 0, ixLen = data.length; ix < ixLen; ix++){
            originValue = Ext.String.htmlEncode(data[ix][2]);
            replaceString = originValue.replace(/\n/gi, '<br/>');
            text += sqlIdDefine[data[ix][0]];
            text += replaceString + '<br/>';

            for(jx = 0, jxLen = userDataCodeReplaceData.length; jx < jxLen; jx++){
                text += userDataCodeReplaceData[jx][0] + ' : ' + originValue.substr(userDataCodeReplaceData[jx][1], userDataCodeReplaceData[jx][2]) + '<br/>';
            }
        }
        userData.update(text);

        tabPanel.add({
            title: wasName + ':' + (this.callTreeBuffer[tId] ? this.callTreeBuffer[tId].txnName : ''),
            wasId: wasId,
            items: userData,
            autoScroll: true
        });

        tabPanel.setActiveTab(0);
    },

    _set_active_grid: function(){
        var self = this;

        var active_grid = Ext.create('Exem.BaseGrid',{
            usePager: false,
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            celldblclick: function( thisGrid, td, cellIndex, record) {
                var id_name, sql_text;

                sql_text = thisGrid.headerCt.getHeaderAtIndex(cellIndex);

                switch (sql_text.dataIndex){
                    case 'sql_text1':
                        id_name = 'sql_id1';
                        break;

                    case 'sql_text2':
                        id_name = 'sql_id2';
                        break;

                    case 'sql_text3':
                        id_name = 'sql_id3';
                        break;

                    case 'sql_text4':
                        id_name = 'sql_id4';
                        break;

                    case 'sql_text5':
                        id_name = 'sql_id5';
                        break;

                    default:
                        return;

                }

                if (sql_text === '' || !sql_text) {
                    id_name = null ;
                    return;
                }

                if ( record.data[id_name] === '' ) {
                    id_name = null ;
                    return ;
                }

                //SQL Full Text 새창으로
                var bind_sql_text = Ext.create('view.FullSQLText_TOP10');
                bind_sql_text.arr_dt['sql_id']    = record.data[id_name];
                bind_sql_text.arr_dt['txn_id']    = record.data['txn_id'];
                bind_sql_text.arr_dt['was_id']    = record.data['was_id'];
                bind_sql_text.arr_dt['from_time'] = self.startTime;
                bind_sql_text.arr_dt['to_time']   = self.endTime;
                bind_sql_text.loading_grd         = active_grid;
                bind_sql_text.init();


                bind_sql_text = null ;
                sql_text = null ;
                id_name = null ;
            }
        }) ;

        active_grid.beginAddColumns() ;
        active_grid.addColumn(common.Util.CTR('Time')             , 'time'          , 150, Grid.DateTime, true , false)  ;
        active_grid.addColumn(common.Util.CTR('Current Method'   ), 'class_method'  , 200, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Method Type'      ), 'method_type'   , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Client IP'        ), 'client_ip'     , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Login Name'       ), 'login_name'    , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Start Time'       ), 'start_time'    , 150, Grid.DateTime, true , false)  ;
        active_grid.addColumn(common.Util.CTR('Transaction CPU TIME'),'txn_cpu_time',   90,  Grid.Float,    true,  false);
        active_grid.addColumn(common.Util.CTR('CPU Time'         ), 'cpu_time'      , 100, Grid.Float   , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Wait Time'        ), 'wait_time'     , 100, Grid.Float   , true , false)  ;
        active_grid.addColumn(common.Util.CTR('DB Time'          ), 'db_time'       , 100, Grid.Float   , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Pool   '          ), 'pool_name'     , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Elapse Time'      ), 'elapse_time'   , 100, Grid.Float   , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Instance Name'    ), 'instance_name' , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('SID'              ), 'sid'           , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('State'            ), 'state'         , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Bind List'        ), 'bind_list'     , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('SQL 1'            ), 'sql_text1'    , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('SQL 2'            ), 'sql_text2'    , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('SQL 3'            ), 'sql_text3'    , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('SQL 4'            ), 'sql_text4'    , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('SQL 5'            ), 'sql_text5'    , 100, Grid.String  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('SQL Execute Count'), 'sql_exec_count', 100, Grid.Number  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Fetch Count'      ), 'fetch_count'   , 100, Grid.Number  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Prepare Count'    ), 'prepare_count' , 100, Grid.Number  , true , false)  ;
        active_grid.addColumn(common.Util.CTR('PGA Usage (MB)'   ), 'mem_usage'     , 100, Grid.Float   , true , false)  ;
        active_grid.addColumn(common.Util.CTR('Logical Reads'    ), 'logical_reads' , 100, Grid.Number  , false, true )  ;
        active_grid.addColumn(common.Util.CTR('Physical Reads'   ), 'physical_reads', 100, Grid.Number  , false, true )  ;
        active_grid.addColumn(common.Util.CTR('Wait Info'        ), 'wait_info'     , 100, Grid.String  , true , false)  ;
        active_grid.addColumn('WAS ID'                           , 'was_id'        , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('WAS Name'                         , 'was_name'      , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('TID'                              , 'tid'           , 100, Grid.String  , false, false )  ;
        active_grid.addColumn('TXN ID'                           , 'txn_id'        , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('TXN Name'                         , 'txn_name'      , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('Elapse Time(AVG)'                 , 'avg_elapse'    , 100, Grid.Float   , false, true )  ;
        active_grid.addColumn('Pool ID'                          , 'pool_id'       , 100, Grid.String  , true , false)  ;
        active_grid.addColumn('SQL ID1'                          , 'sql_id1'       , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('SQL ID2'                          , 'sql_id2'       , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('SQL ID3'                          , 'sql_id3'       , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('SQL ID4'                          , 'sql_id4'       , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('SQL ID5'                          , 'sql_id5'       , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('Current CRC'                      , 'current_crc'   , 100, Grid.Number  , false, true )  ;
        active_grid.addColumn('IO Read'                          , 'io_read'       , 100, Grid.String  , false, true )  ;
        active_grid.addColumn('IO Write'                         , 'io_write'      , 100, Grid.String  , false, true )  ;
        active_grid.endAddColumns() ;

        this.activeHistory.add( active_grid ) ;

        common.WebEnv.set_nondb( active_grid, false ) ;
        common.WebEnv.setVisibleGridColumn(active_grid, ['bind_list'], Comm.config.login.permission.bind !== 1 ) ;


        return active_grid ;
    },

    _set_class_view: function(target_grid, currMonitorType){

        target_grid.contextMenu.addItem({
            title: common.Util.TR('Class View'),
            fn: function(){
                var record = this.up().record,
                    className = record.class_method.replace('[] ', ''),
                    index = className.indexOf('.');

                if(index > -1){
                    className = className.substr(0, index) + '.class';
                }else{
                    className += '.class';
                }

                if(className.indexOf('] ') > -1){
                    className = className.substr(className.indexOf('] ') + 2, className.length);
                }

                var classView = Ext.create('Exem.ClassView',{
                    wasid : record.was_id,
                    classmethod : className
                });

                classView.init();
            }

        }, 0) ;

        if(currMonitorType == 'TP') {
            target_grid.contextMenu.setDisableItem(0, false);
        }

        if(currMonitorType == 'WAS') {
            target_grid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record, tr, rowIndex) {
                var dataRows = record.data;
                target_grid.contextMenu.setDisableItem(0, false);

                if (!Comm.wasInfoObj[dataRows['was_id']] || !Comm.wasInfoObj[dataRows['was_id']].isDotNet) {
                    target_grid.contextMenu.setDisableItem(0, true);
                }
            });
        }
    },

    _get_bind: function(bind){
        var obj = Common.fn.ConvertBindList(bind);
        var bind_list = '';
        for(var j = 0 ; j < obj.length; j++){
            if(j){
                bind_list += ',' + obj[j].value;
            }else{
                bind_list += obj[j].value;
            }
        }
        return bind_list;
    },

    /** data 내에 함수 인자와 동일한 sid 값을 찾는 함수 ( 현재는 미사용 ) by jykim
     findSid: function(targetSid, sqlList) {
        var findIndex = -1,
            ix, ixLen, tempSid;

        for (ix = 0, ixLen = sqlList.length; ix < ixLen; ix++) {
            tempSid = sqlList[ix].data[1];
            if (tempSid === targetSid) {
                findIndex = ix;
                break;
            }
        }

        return findIndex;
    },
     **/

    setSqlData: function(sqlData, isInit, isExistSid) {
        var cpuTime = sqlData[16] > 0 ? sqlData[16] : 0,
            sid = sqlData[21],
            rowData;

        if(isExistSid){
            sid = '';
        }

        rowData = {
            data : [
                isInit ? sqlData[4] : ''                   //'instance_name'
                , isInit ? '' : sid                        //'sid'
                , isInit ? null : sqlData[0]              //'TIME'
                , isInit ? '' : (isExistSid ? '' : sqlData[1])  //'was_id'
                , isInit ? '' : (isExistSid ? '' : sqlData[2])  //'was_name'
                , isInit ? '' : (isExistSid ? '' : sqlData[3])  //'txn_id'
                , isInit ? '' : (isExistSid ? '' : sqlData[5])  //'db_id'
                , sqlData[6]    //'sql_id'
                , isInit ? '' : (isExistSid ? '' : sqlData[7])  //'method_id'
                , isInit ? '' : (isExistSid ? '' : sqlData[8])  //'method_seq'
                , isInit ? '' : +sqlData[9]                //'sql_exec_count'
                , isInit ? null : sqlData[23]             //'sql.elapse_sum'
                , isInit ? null : sqlData[10]             //'sql_elapse_max'
                , isInit ? null : sqlData[11]             //'sql_elapse_avg'
                , isInit ? null : sqlData[12]             //'fetch_count_sum'
                , isInit ? null : sqlData[13]             //'fetch_count_max'
                , isInit ? null : sqlData[14]             //'fetch_time_sum'
                , isInit ? null : sqlData[15]             //'fetch_time_max'
                , isInit ? null : cpuTime                 //'cpu_time'
                , isInit ? null : sqlData[17]             //'wait_time'
                , isInit ? null : sqlData[18]             //'logical_reads'
                , isInit ? null : sqlData[19]             //'physical_reads'
                , isInit ? '' : sqlData[20]                //'tid'
                , isInit ? '' : sqlData[22]                //'sql_text'
            ],
            child : []
        };

        return rowData;
    },

    sqlListCreate: function(data){
        var was_id = null,
            title = null,
            storeSqlList = this.sqlDataList,
            sqlList = this.sqlList,
            titleList = [],
            ix, ixLen, sqlData, instanceName, tabCon;

        this.sqlList.suspendLayouts();

        for(ix = 0, ixLen = data.length; ix < ixLen; ix++){
            sqlData = data[ix];
            instanceName = sqlData[4];
            title = sqlData[2] + ':' + (this.callTreeBuffer[sqlData[20]] ? this.callTreeBuffer[sqlData[20]].txnName : '');
            if (titleList.indexOf(title) === -1) {
                titleList.push(title);
                tabCon = Ext.create('Exem.Container', {
                    title: title
                });

                sqlList.add(tabCon);

                if (ix == 0) {
                    this.setTreeToSqlListTab(tabCon);
                }

                storeSqlList[title] = {};
            }

            if (was_id !== sqlData[1]) {
                was_id = sqlData[1];

                if (!storeSqlList[title][instanceName]){
                    storeSqlList[title][instanceName] = this.setSqlData(sqlData, true, false);
                    storeSqlList[title][instanceName].child.push(this.setSqlData(sqlData, false, false));
                } else {
                    /** sid 중복 값을 확인하는 경우 사용 ( 현재는 미사용 ) by jykim
                     findSidIndex = this.findSid(sqlData[17], storeSqlList[title][instanceName].child);
                     if (findSidIndex !== -1) {
                        storeSqlList[title][instanceName].child[findSidIndex].child.push(this.setSqlData(sqlData, false, true));
                    } else {
                        storeSqlList[title][instanceName].child.push(this.setSqlData(sqlData, false, false));
                    }
                     **/

                    storeSqlList[title][instanceName].child.push(this.setSqlData(sqlData, false, false));
                }
            }
            else {
                if (!storeSqlList[title][instanceName]) {
                    storeSqlList[title][instanceName] = this.setSqlData(sqlData, true, false);
                }

                storeSqlList[title][instanceName].child.push(this.setSqlData(sqlData, false, false));
            }
        }

        sqlList.setActiveTab(0);
        this.sqlList.resumeLayouts();
        this.sqlList.doLayout();
    },

    setTreeToSqlListTab: function(tabCon){
        var self = this;

        this.treeInSqlList = Ext.create('Exem.BaseGrid', {
            gridName: 'pa_txn_detail_sql_tree',
            gridType: Grid.exTree,
            useTreeSortable: true,
            baseGridCls: 'baseGridRTM',

            itemdblclick: function (dv, record, item, index, e) {
                var tabId, key, seq, sideDOM, callTreeDOM, sqlListDOM;

                if (e.position.column.dataIndex === 'sql_text' || !record
                    || !record.data.tid || !self.callTreeLayer) {
                    return;
                }

                //1503.3 this.sql_count 추가(min)
                self.sql_count = record.data.sql_exec_count ;
                tabId  = '_' + record.data.was_id + '_' + record.data.tid;

                if (!self.callTreeList[tabId]){
                    return;
                }

                key = record.data.method_id;
                seq = record.data.method_seq;
                sideDOM = self.sideNavLayer.el.dom;

                sqlListDOM = sideDOM.getElementsByClassName('active-nav')[0];
                sqlListDOM.classList.remove('active-nav');

                callTreeDOM = sideDOM.querySelectorAll("[data-tabid = 'callTree']")[0];
                callTreeDOM.classList.add('active-nav');

                self.sqlListContainer.hide();
                self.callTreeLayer.show();

                self.find_active_tab(self.callTreeLayer, 'tid', record.data.tid);
                self.callTreeList[tabId].filter_off.show();
                self.callTreeList[tabId].filter_off.show_state = true;
                self.callTreeList[tabId].callTreeGrid.pnlExTree.expandAll();
                self.callTreeList[tabId].filter_off.filter_key = key;
                self.callTreeList[tabId].filter_off.filter_seq = seq;
                self.callTreeList[tabId].filter_off.sql_list = true;
                self.callTreeList[tabId].filtering(key, seq);
            },
            celldblclick: function(thisGrid, td, cellIndex, record) {
                if (thisGrid.getHeaderCt().getHeaderAtIndex(cellIndex).dataIndex !== 'sql_text'){
                    return;
                }

                self.sql_id = null;
                self.txn_id = null;

                if(record.data != null && record.data.sql_text != '') {
                    var sqlId   = record.data.sql_id,
                        dbId    = record.data.db_id,
                        txnId   = record.data.tid,
                        endTime = record.data.TIME;

                    var fromTime = Ext.Date.format(Ext.Date.subtract(new Date(self.startTime), Ext.Date.MINUTE, 30), 'Y-m-d H:i:s.u');
                    var toTime   = Ext.Date.format(Ext.Date.add(new Date(self.startTime), Ext.Date.MINUTE, 10), 'Y-m-d H:i:s.u');
                    // MaxGauge 연동에 필요한 정보 설정
                    var mxgParams = {
                        dbId    : dbId,
                        sqlUid  : sqlId,
                        tid     : txnId,
                        fromTime: fromTime,
                        toTime  : toTime
                    };

                    var bindSqlText = Ext.create('view.FullSQLText_TOP10', {
                        parentView: self,
                        mxgParams : mxgParams
                    });

                    bindSqlText.arr_dt['sql_id'] = sqlId;
                    bindSqlText.arr_dt['db_id']  = dbId;
                    bindSqlText.arr_dt['txn_id'] = txnId;
                    bindSqlText.arr_dt['start_time'] = self.startTime;
                    bindSqlText.arr_dt['end_time'] = endTime;
                    bindSqlText.loading_grd = self.treeInSqlList;
                    self.treeInSqlList.loadingMask.showMask();
                    bindSqlText.init();
                }
            }
        });

        tabCon.add(this.treeInSqlList);
        this.treeInSqlList.beginAddColumns();
        this.treeInSqlList.addColumn(common.Util.CTR('Instance Name'),           'instance_name',   150, Grid.String,   true,  false, 'treecolumn');
        this.treeInSqlList.addColumn(common.Util.CTR('SID'),                     'sid',             100, Grid.String,   true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('TIME'),                    'TIME',            130, Grid.DateTime, true,  false);
        this.treeInSqlList.addColumn('was_id',                                   'was_id',          100, Grid.String,   false, true );
        this.treeInSqlList.addColumn(common.Util.CTR('WAS'),                     'was_name',        130, Grid.String,   false, true );
        this.treeInSqlList.addColumn('txn_id',                                   'txn_id',          150, Grid.String,   false, true );
        this.treeInSqlList.addColumn('db_id',                                    'db_id',           100, Grid.String,   false, true );
        this.treeInSqlList.addColumn('sql_id',                                   'sql_id',          100, Grid.String,   false, true );
        this.treeInSqlList.addColumn('method_id',                                'method_id',       100, Grid.String,   false, true );
        this.treeInSqlList.addColumn('method_seq',                               'method_seq',      100, Grid.Number,   false, true );
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Execution Count'),     'sql_exec_count',  70,  Grid.Number,   true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Elapse Time (Total)'), 'sql_elapse_sum',  95,  Grid.Float,    true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Elapse Time (MAX)'),   'sql_elapse_max',  95,  Grid.Float,    true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Elapse Time (AVG)'),   'sql_elapse_avg',  95,  Grid.Float,    true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Fetch Count (Total)'), 'fetch_count_tot', 95,  Grid.Number,   true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Fetch Count (MAX)'),   'fetch_count_max', 95,  Grid.Number,   true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Fetch Time (Total)'),  'fetch_Time_tot',  95,  Grid.Float,    true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Fetch Time (MAX)'),    'fetch_Time_max',  95,  Grid.Float,    true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('CPU Time'),                'cpu_time',        100, Grid.Float,    true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('Wait Time'),               'wait_time',       100, Grid.Float,    true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('Logical Reads'),           'logical_reads' ,  100, Grid.Number,   true,  false);
        this.treeInSqlList.addColumn(common.Util.CTR('Physical Reads'),          'physical_reads',  100, Grid.Number,   true,  false);
        this.treeInSqlList.addColumn('TID',                                      'tid',             100, Grid.String,   false, false);
        this.treeInSqlList.addColumn(common.Util.CTR('SQL Text'),                'sql_text',        250, Grid.String,   true,  false);
        this.treeInSqlList.endAddColumns();
        this.treeInSqlList.loadLayout('pa_txn_detail_sql_tree');
        common.WebEnv.set_nondb( this.treeInSqlList, false ) ;
    },

    setSqlDataListToTree: function(title){
        var ix, ixLen, jx, jxLen,
            titleData,instanceNames, instanceData,
            parent, parentData, nodeData;

        this.treeInSqlList.beginTreeUpdate();

        titleData = this.sqlDataList[title];
        instanceNames = Object.keys(titleData);
        for(ix = 0, ixLen = instanceNames.length; ix < ixLen; ix++){
            instanceData = titleData[instanceNames[ix]].child;
            parentData = titleData[instanceNames[ix]].data;
            parent = this.treeInSqlList.addNode(null, parentData);
            for(jx = 0, jxLen = instanceData.length; jx < jxLen; jx++){
                nodeData = instanceData[jx].data;
                this.treeInSqlList.addNode(parent, nodeData);
            }
        }

        this.treeInSqlList.endTreeUpdate();
        this.treeInSqlList.drawTree();
    },


    screen_reset: function(){
        var textModeKey = 'pa_txn_path_call_tree_text_mode';
        var excludeKey = 'pa_txn_path_call_tree_exclude';
        var checkElapseKey = 'pa_txn_path_call_tree_check_elapse';

        common.WebEnv.Save( textModeKey     , this.last_text_mode, null );
        common.WebEnv.Save( excludeKey      , this.last_exclude, null );
        common.WebEnv.Save( checkElapseKey  , this.last_check_elapse, null );
    } ,

    open_sql_bind_text: function( data, format, text ){
        var editTheme;
        this.sql_base = Ext.create('Exem.FullSQLTextWindow') ;

        if(this.themeType){
            switch (this.themeType) {
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

            this.sql_base.addCls('xm-dock-window-base rtm-sqlview');
            this.sql_base.BaseFrame.sqlEditor.editTheme = editTheme;
            this.sql_base.BaseFrame.bindEditor.editTheme = editTheme;
        }

        // MaxGauge 연동에 필요한 정보 설정
        if (this.sql_base.setMxgOpenParams) {
            var dbId = Comm.RTComm.getDBIdyName(record.data.instance_name);
            var mxgParams = {
                dbId    : dbId,
                sqlId   : bind_sql_text.arr_dt.sql_id,
                tid     : record.data.tid,
                fromTime: bind_sql_text.arr_dt.from_time,
                toTime  : bind_sql_text.arr_dt.to_time
            };
            this.sql_base.setMxgOpenParams(mxgParams);
        }

        if ( data == null ){

            if ( text == common.Util.TR('SQL with binded value') ){
                this.sql_base.BaseFrame.setActiveTab(this.sql_base.BaseFrame.bindContainer) ;
            }else{
                this.sql_base.BaseFrame.setActiveTab(this.sql_base.BaseFrame.sqlContainer) ;
            }

            this.sql_base.show() ;

            this.sql_base.BaseFrame.sqlContainer.items.items[0].setText(this.sql.getText()) ;

            if ( this.sqlBind.getText() == '' ){
                this.sql_base.BaseFrame.bindEditor.hide() ;
                this.sql_base.BaseFrame.tabBar.items.items[1].hide() ;
            }else{
                this.sql_base.BaseFrame.bindContainer.items.items[0].setText(this.sqlBind.getText()) ;
            }

            if ( format != ''  && format != undefined ){
                this.sql_base.BaseFrame.setFormatSQL() ;
            }


        }else{
            this.sql_base.getFullSQLText( data.sql_id, data.default_bind_list ) ;
            this.sql_base.show() ;
        }



    } ,


    find_active_tab:  function( find_obj, find_str, compare_str ){

        var ix, ixLen,
            isFindTab = false;

        if ( compare_str == undefined ) {
            return ;
        }

        if(!find_obj ) {
            return;
        }

        var sub_find_str ;

        for ( ix = 0, ixLen = find_obj.items.length ; ix < ixLen; ix++ ){

            if ( find_str == 'tid' ){
                sub_find_str = find_obj.items.items[ix].tid;
            } else {
                sub_find_str = find_obj.items.items[ix].title;
            }

            if ( sub_find_str == compare_str ){
                find_obj.setActiveTab(ix);
                isFindTab = true;
                sub_find_str = null;
                break;
            }
        }

        // topTid 와 같은 tid를 가진 콜 트리 탭을 못 찾았을 때, (콜 트리 탭이 1개 이상 존재 시)
        // 외부에서 넘어온 tid와 같은 tid를 가진 콜 트리를 active 시킨다.
        if(!isFindTab && find_obj.items.length) {
            for( ix = 0, ixLen = find_obj.items.length; ix < ixLen; ix++) {
                sub_find_str =  find_obj.items.items[ix].tid;
                if(sub_find_str == this.tid) {
                    find_obj.setActiveTab(ix);
                    break;
                }
            }
        }

    },

    click_exclude: function(target, wasMonitorType, tabId){

        if(!this.excludeForm[wasMonitorType]) {
            this.excludeForm[wasMonitorType] = Ext.create('view.TxnDetail.XMCallTreeExclude', {
                monitorType : wasMonitorType
            });

            this.excludeForm[wasMonitorType].init();
            this.excludeForm[wasMonitorType].setExclusionCbxData(this.callTreeExcludeData[tabId]);
        }


        this.excludeForm[wasMonitorType].target = target ;
        this.excludeForm[wasMonitorType].setExclusionCbxData(this.callTreeExcludeData[tabId]);
        this.excludeForm[wasMonitorType].loadExclusionListData() ;
        this.excludeForm[wasMonitorType].show();

    },



    executeAsync: function(){
        var ix, ixLen,
            asyncList = this.txnPathClass.asyncInfo.asyncTidList;

        for(ix = 0, ixLen = asyncList.length; ix < ixLen; ix++){
            WS2.SQLExec({
                sql_file: 'txn_detail_async_data.sql',
                bind: [{
                    name: 'tid',
                    type: SQLBindType.LONG,
                    value: asyncList[ix].tid
                },{
                    name: 'start_time',
                    type: SQLBindType.STRING,
                    value: asyncList[ix].time
                },{
                    name: 'wasType',
                    type: SQLBindType.STRING,
                    value: asyncList[ix].type
                }]
            }, this.onAsyncData, this);

            this.asyncQueryCnt++;
        }

        this.txnPathClass.asyncInfo.asyncTidList = [];
    },

    onAsyncData: function(header, data){

        var wasType = '',
            rows, asyncData, destTid, destTime, srcTid, srcTime, gapTime,
            ix, ixLen;

        this.asyncQueryCnt--;

        if(this.isClosed || !common) {
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            if(!this.asyncQueryCnt && !this.txnPathClass.asyncInfo.executeAsyncCount) {
                this.loadTxnDetailContents();
            }

            return;
        }

        rows = data.rows;
        for (ix = 0, ixLen = rows.length; ix < ixLen; ix++) {
            asyncData = rows[ix];

            srcTid = header.parameters.bind[0].value;
            srcTime = asyncData[2];
            destTid = asyncData[0];
            destTime = asyncData[1];
            gapTime = (+new Date(destTime) - (+new Date(srcTime))) / 1000;

            if(header.parameters.bind[2]) {
                wasType = header.parameters.bind[2].value;
            }

            this.txnPathReplyInfo.push({
                srcId: srcTid,
                srcTime: srcTime,
                srcTxnName: '',
                srcDest: '',
                destId: destTid,
                destTime: destTime,
                gapTime: gapTime.toFixed(3),
                type: wasType
            });

            WS.StoredProcExec({
                stored_proc: 'tid_path',
                bind: [{
                    name: 'tid',
                    value: destTid,
                    type: SQLBindType.LONG
                },{
                    name : 'start_time',
                    value: destTime
                }]
            }, this.onTIDPathData, this);

            this.txnPathClass.asyncInfo.executeAsyncCount++;
        }
    }
});


//sql list
Ext.define('sqlListModel', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'tid', type: 'string'},
        {name: 'sql_id', type: 'string'},
        {name: 'method_id', type: 'string'},
        {name: 'method_seq', type: 'string'},
        {name: 'TIME', type : 'string'},
        {name: 'was_id', type: 'string'},
        {name: 'was_name', type: 'string'},
        {name: 'instance_name', type: 'string'},
        {name: 'sql_text', type: 'string'},
        {name: 'sql_exec_count', type: 'string'},
        {name: 'sql_elapse_max', type: 'string'},
        {name: 'sql_elapse_avg', type: 'string'},
        {name: 'cpu_time', type: 'string'},
        {name: 'wait_time', type: 'string'},
        {name: 'logical_reads', type : 'string'},
        {name: 'physical_reads', type: 'string'}
    ]
});