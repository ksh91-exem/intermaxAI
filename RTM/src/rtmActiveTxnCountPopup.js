Ext.application({
    name: 'IMX_POPUP',
    appFolder: location.pathname.split('/')[1],

    launch: function() {
        if (!opener) {
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Sorry'));
            return;
        }

        window.msgMap = opener.msgMap;
        window.Comm   = opener.Comm;
        window.common = opener.common;
        window.WS     = opener.WS;
        window.realtime = opener.realtime;

        this.initProperty();

        var theme = opener.Comm.RTComm.getCurrentTheme();
        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        var girdLineColor, borderColor, backColor;

        switch (theme) {
            case 'Black' :
                labelStyle.color = '#fff';
                girdLineColor = '#525359';
                borderColor = '#81858A';
                backColor = '#212227';
                document.body.className = 'mx-theme-black';
                break;
            case 'Gray' :
                labelStyle.color = '#ABAEB5';
                girdLineColor = '#525359';
                borderColor = '#81858A';
                backColor = '#212227';
                document.body.className = 'mx-theme-gray';
                break;
            default :
                labelStyle.color = '#555555';
                girdLineColor = '#F0F0F0';
                borderColor = '#ccc';
                backColor = '#E5E5E5';
                break;
        }
        document.body.style.backgroundColor = backColor;

        var baseFrameDiv = document.createElement('div');
        baseFrameDiv.className = 'rtm-base';
        baseFrameDiv.id = 'baseFrame';
        baseFrameDiv.style.position = 'absolute';
        baseFrameDiv.style.width = '100%';
        baseFrameDiv.style.height = '100%';

        document.body.appendChild(baseFrameDiv);

        if (opener.window.nation === 'ja') {
            document.body.classList.add('ja');
        } else {
            document.body.classList.remove('ja');
        }

        this.initLayout();

        // 필터된 서버 목록이 있는지 체크하는 항목
        this.isGroupFilterWasList = false;

        if (realtime.openTxnFilterWasId && realtime.openTxnFilterWasId.length > 0) {
            this.frameChange(null, realtime.openTxnFilterWasId);
            realtime.openTxnFilterWasId = null;

            this.isGroupFilterWasList = true;
        } else {
            if (this.selectedServerNames.length > 0 && this.selectedServerNames.length !== this.serverIdArr.length) {
                this.frameChange(this.selectedServerNames);
            }
        }

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ACTIVITY, this.barChart);
    },

    initProperty: function() {
        this.openerProperty = Comm.RTComm.getPopupList(paraObj.src).opener;

        this.title = this.openerProperty.title;

        this.monitorType  = this.openerProperty.monitorType;
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.activeTxnListClass = this.openerProperty.activeTxnListClass;

        this.enableThreadDump = true;

        this.envKeyChartFit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_activeTxnChart_fit';

        // 서버에 스크립트를 실행하는 버튼을 표시할지 정하는 구분 값
        this.isUseSRuncript = common.Menu.useExecuteScript;

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);
    },

    initLayout: function() {

        this.baseFrame = Ext.create('Exem.Container', {
            layout: 'vbox',
            width : window.innerWidth,
            height: window.innerHeight,
            renderTo: 'baseFrame'
        });

        this.background = Ext.create('Exem.Container', {
            cls   : 'rtm-activitygroup-base',
            width : window.innerWidth - 8,
            height: window.innerHeight - 8,
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });

        this.topArea = Ext.create('Exem.Container', {
            width : '100%',
            height: 25,
            layout: 'hbox'
        });

        this.frameTitle = Ext.create('Ext.form.Label', {
            height: 20,
            margin: '5 0 0 10',
            cls   : 'header-title',
            text  : this.title
        });

        this.optionChartFit = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Scale'),
            name    : 'autoRefreshCheckbox',
            cls     : 'rtm-combobox-label',
            margin  : '4 20 0 0',
            checked : this.isFitChart,
            listeners: {
                scope: this,
                change: function(checkbox, newVal) {
                    this.barChart.isFitChart = newVal;
                    this.barChart.fireEvent('resize', this.barChart);

                    common.WebEnv.Save(this.envKeyChartFit, newVal);
                }
            }
        });

        this.topArea.add([ this.frameTitle, {xtype: 'tbspacer', flex : 1}, this.optionChartFit]);

        this.pnlCenter = Ext.create('Exem.Panel', {
            bodyCls  : 'group-center-base',
            layout   : 'fit',
            flex     : 1,
            height   : '100%',
            width    : '100%',
            minHeight: 80,
            margin   : '0 5 0 10',
            split    : false,
            border   : false
        });

        var barImg    = Comm.RTComm.getBachartBackImage();
        var barColors = Comm.RTComm.getBachartColors();

        var serverType;
        if (this.monitorType === 'TP') {
            serverType = 'WAS';
        } else if (this.monitorType === 'WEB') {
            serverType = 'WebServer';
        } else {
            serverType = this.monitorType;
        }

        this.barChart = Ext.create('Exem.chart.StackBarChart', {
            color        : barColors,
            devMode      : false,
            isBarStripe  : true,
            barStripeImg : barImg,
            maxValue     : 30,
            maxBarWidth  : 55,
            maxBarHeight : 50,
            minBarWidth  : 18,
            isGroupView  : false, // 인터페이스는 없으나 논리적으로 이해하기 쉽게 만들어둠.
            isCPUView    : false,
            isMouseEvent : false,
            isSingleView : true,
            isFitChart   : this.isFitChart,
            isScriptBtn  : this.isUseSRuncript,
            margin       : '0 0 0 0',
            serverType   : serverType,
            openActiveTxnList: null,
            executeThreadDump: null,
            executeScript    : null,
        });

        this.extendBarchartFn();

        this.background.add([this.topArea, this.pnlCenter]);

        this.baseFrame.add(this.background);

        this.pnlCenter.add(this.barChart);

        this.barChart.setChartLabels(this.serverIdArr, this.serverNameArr);

        if (realtime.openTxnFilterWasId != null && realtime.openTxnFilterWasId.length > 0) {
            var groupName = Comm.RTComm.getGroupNameByWasId(realtime.openTxnFilterWasId[0]);
            this.up().setTitle(this.title + ' ('+groupName+')');
        }

        this.eventListener();
    },

    eventListener: function() {
        window.addEventListener('resize', function() {
            this.baseFrame.setSize(window.innerWidth, window.innerHeight);
            this.background.setSize(window.innerWidth - 8, window.innerHeight - 8);
        }.bind(this));

        window.onbeforeunload = function() {
            if (this.barChart) {
                common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ACTIVITY, this.barChart);
            }

            Comm.RTComm.removePopupList(window);

            window.msgMap = null;
            window.Comm   = null;
            window.common = null;

            opener.window.removeEventListener('beforeunload', unloadHandler);
        }.bind(this);


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

    extendBarchartFn: function() {
        // this.barChart.openActiveTxnList = function(serverId) {
        //     realtime.openTxnFilterWasId = serverId;
        //
        //     if (realtime.openTxnFilterWasId == null) {
        //         return;
        //     }
        //
        //     common.OpenView.onMenuPopup(this.activeTxnListClass);
        // }.bind(this);

        if (Comm.config.login.permission.system_dump == 1 && this.enableThreadDump) {
            this.barChart.executeThreadDump = function(serverId) {
                var AJSON = {};
                AJSON.dll_name = 'IntermaxPlugin.dll';
                AJSON.options = {
                    was_id    : serverId,
                    tid       : 0,
                    dbname    : Comm.web_env_info.Intermax_MyRepository
                };
                AJSON['function'] =  'stack_dump';

                console.debug('%c Execute Thread Dump - TID / WASID / DB: ', 'color:#3191C8;', AJSON.options.tid + ' / ' + AJSON.options.was_id + ' / ' + AJSON.options.dbname);

                WS.PluginFunction( AJSON , function() {
                    Ext.MessageBox.show({
                        title    : common.Util.TR(' '),
                        msg      : common.Util.TR('Thread Dump was executed. You can see the contents at Thread Dump Viewer.'),
                        icon     : Ext.MessageBox.INFO,
                        buttons  : Ext.MessageBox.OK,
                        multiline: false
                    });
                    AJSON   = null;
                }, this);
            };
        }

        if (Comm.config.login.admin_check === 1) {
            this.barChart.executeScript = function(serverId) {
                var AJSON = {};
                AJSON.dll_name = 'IntermaxPlugin.dll';

                // {"type":"plugin_function","parameters":{"options":{"user_id":"intermax","file_name":"","was_id":188,"value":3,"alert_name":"IMXTEST","status":1}},"command":"user_script"}

                AJSON.options = {
                    was_id    : serverId,
                    dbname    : Comm.web_env_info.Intermax_MyRepository,
                    user_id :  Comm.config.login.login_id.toString(),
                    file_name : "",
                    value : 0,
                    alert_name : "RTM_CALL",
                    status: 1

                };
                AJSON['function'] =  'user_script';

                console.debug('%c Execute Script - TID / WASID / DB: ', 'color:#3191C8;', AJSON.options.tid + ' / ' + AJSON.options.was_id + ' / ' + AJSON.options.dbname);

                WS.PluginFunction( AJSON , function() {
                    Ext.MessageBox.show({
                        title    : common.Util.TR(' '),
                        msg      : common.Util.TR('Script file was executed.'),
                        icon     : Ext.MessageBox.INFO,
                        buttons  : Ext.MessageBox.OK,
                        multiline: false
                    });
                    AJSON   = null;
                }, this);
            };
        }
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * 선택된 서버 목록으로 재설정.
     *
     * @param {string[]} serverNameList - 서버명 배열
     * @param {string[] | number[]} serverIDList - 서버 ID 배열
     */
    frameChange: function(serverNameList, serverIDList) {

        // 그룹 별 액티브 트랜잭션에서 클릭하여 실행된 화면인 경우
        // 좌측에 에이전트 정보를 선택 시 변경되는 처리를 실행하지 않고 기존에 표시되던 서버 목록을 유지한다.
        if (this.isGroupFilterWasList) {
            return;
        }

        // 변형 뷰에서는 serverNameList 가 넘어오고 ( 이름 ) 그룹 트랜잭션에서는 serverIDList 로 넘어온다.
        var serverIdArr = [];
        var serverNameArr;
        var idx, serverName;

        if (serverNameList) {
            for (var i = 0, icnt = serverNameList.length; i < icnt; ++i) {
                serverName = serverNameList[i];

                idx = this.serverNameArr.indexOf(serverName) ;

                if (idx === -1 ) {
                    continue;
                }

                serverIdArr[serverIdArr.length] = this.serverIdArr[idx].toString();
            }
        }

        if (Ext.isEmpty(serverIDList) !== true && typeof(serverIDList.length) === 'number') {
            serverIdArr = [].concat( serverIDList );
        }

        if (serverIdArr.length <= 0) {
            serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
            serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        } else {
            serverIdArr   = Comm.RTComm.getSortServerID(serverIdArr, this.monitorType);
            serverNameArr = Comm.RTComm.getSortServerNames(serverIdArr, this.monitorType);
        }

        this.barChart.setChartLabels(serverIdArr, serverNameArr);

        serverIdArr   = null;
        serverNameArr = null;
    },


    /**
     * Start Bar Chart draw.
     */
    frameRefresh: function() {
        if (this.barChart) {
            this.barChart.startAnimationFrame();
        }
    },


    /**
     * Stop Bar chart draw.
     */
    // frameStopDraw: function() {
    //     if (this.barChart) {
    //         this.barChart.stopAnimationFrame();
    //     }
    // }

});