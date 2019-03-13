Ext.define('rtm.view.rtmView', {
    extend: 'view.baseView',
    width : '100%',
    height: '100%',
    baseMargin : '0 10 0 5',
    cls   : 'rtm-base',

    selectedGroup : null,
    selectedWAS   : null,
    selectedType  : 0,     // 0: Agent List, 1: Business List
    timerInc      : null,

    timer         : null,
    isStop        : false,

    listeners: {
        beforedestroy: function(me){
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WASSTAT, me);
            if (me.menuBarGroup) {
                common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me.menuBarGroup);
            }
        },
        hide: function() {
            Comm.rtmShow = false;
        },
        show: function() {
            Comm.rtmShow = true;

            window.isLockRTMFrame = Comm.RTComm.getBooleanValue(Comm.web_env_info.rtm_frame_lock);
        }
    },

    bindEvent: function(){
        var hidden, visibilityChange;
        if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';

        } else if (typeof document.mozHidden !== 'undefined') {
            hidden = 'mozHidden';
            visibilityChange = 'mozvisibilitychange';

        } else if (typeof document.msHidden !== 'undefined') {
            hidden = 'msHidden';
            visibilityChange = 'msvisibilitychange';

        } else if (typeof document.webkitHidden !== 'undefined') {
            hidden = 'webkitHidden';
            visibilityChange = 'webkitvisibilitychange';
        }

        // Warn if the browser doesn't support addEventListener or the Page Visibility API
        if (typeof document.addEventListener === 'undefined' ||
            typeof document[hidden] === 'undefined') {
            window.alert('This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.');

        } else {
            // Handle page visibility change
            document.addEventListener(visibilityChange, this.handleVisibilityChange.bind(this), false);
        }
    },


    handleVisibilityChange: function(){
        if (document.hidden) {
            this.stopFrameDraw();
        } else {
            this.startFrameDraw();
        }
    },


    iniProperty: function() {
        this.defaultView = '../images/View_Image/rtmViewDefault2.png';

        this.selectedGroup = null;
        this.selectedType  = 0;

        this.loadWaitCount = 0;

        this.wasStatData   = [];
        this.groupList     = {};
        this.wasCpuMem     = {};

        this.wasStatDataCache = [];

        Comm.rtmShow = true;
    },


    /**
     * 실시간 화면에 설정된 테마에 해당하는 css 설정
     */
    initViewTheme: function() {
        // 저장된 테마 정보 가져오기
        var theme = Comm.RTComm.getCurrentTheme();

        switch(theme) {
            case 'White':
                document.body.classList.remove('mx-theme-black');
                document.body.classList.remove('mx-theme-gray');
                break;
            case 'Black':
                document.body.classList.remove('mx-theme-gray');
                document.body.classList.add('mx-theme-black');
                break;
            default:
                document.body.classList.remove('mx-theme-black');
                document.body.classList.add('mx-theme-gray');
        }
    },


    init: function() {
        this.iniProperty();

        this.initViewTheme();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this,
            type: 'large-whirlpool'
        });
        this.loadingMask.show(true);

        this.bindEvent();

        this.loadViews();
    },


    /**
     * WAS ID 별로 Timezone 설정
     *
     * WebSocket에서 설정된 TimeZone 데이터가 없는 경우 클라이언트의 타임존 값을 설정.
     */
    setTimeZonByServer: function() {
        var ix, ixLen;

        if (!Repository.time_zone) {
            Repository.time_zone = {};
            var defaultTimezone = +new Date();

            for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                Repository.time_zone[Comm.wasIdArr[ix]] = defaultTimezone;
            }
        }

        if (!Repository.timeZoneOffset) {
            Repository.timeZoneOffset = {};

            for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                Repository.timeZoneOffset[Comm.wasIdArr[ix]] = new Date().getTimezoneOffset();
            }
        }
    },


    /**
     * 실시간 모니터링 화면의 잠금 여부를 체크 및 설정.
     */
    setRealtimeViewLock: function() {
        if (!Comm.web_env_info.rtm_frame_lock) {
            common.WebEnv.Save('rtm_frame_lock', false);
            window.isLockRTMFrame = false;

        } else {
            window.isLockRTMFrame = (Comm.web_env_info.rtm_frame_lock.toLowerCase() === 'true');
            this.setFrameLock(window.isLockRTMFrame);
        }
    },


    loadViews: function() {
        var dataFlags = realtime.flags;

        if (!this.isStop) {
            requestAnimationFrame(this.loadViews.bind(this));

            var dataLoadCount  = 0;
            var baseDataLength = 17;

            for (var jx = 0; jx < baseDataLength; jx++) {
                if (dataFlags[jx] === true || dataFlags[jx] === 'true') {
                    dataLoadCount++;
                }
            }

            // 실시간 화면 구성에 필요한 데이터가 모두 로드된 경우 화면 구성 진행함.
            if (dataLoadCount === baseDataLength && common.WebEnv.isLoadWebEnvData) {

                if (this.loadWaitCount > 5) {
                    this.setTimeZonByServer();
                }

                if (Repository.time_zone && Repository.timeZoneOffset) {
                    this.isStop = true;

                    realtime.packetReceive = true;
                    realtime.WasMode = true;

                    // 실시간 화면 타임존 설정
                    realtime.time_zone   = Repository.time_zone;
                    Comm.timeZoneOffset  = Repository.timeZoneOffset[Repository.trendChartData.timeRecordWasId];

                    this.setRealtimeViewLock();

                    Comm.RTComm.checkServerStatusObject();

                    Comm.RTComm.initCheckExpiredLicense();

                    common.RTMDataManager.init();

                    this.loadingMask.hide();

                    this.createView();

                    common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WASSTAT, this);

                    common.RTMDataManager.onClearAlarm();

                    if (common.RTMDataManager.onRefresRealChart) {
                        common.RTMDataManager.onRefresRealChart();
                    }

                    if (common.RTMDataManager.onRefreshWasSessionChart) {
                        common.RTMDataManager.onRefreshWasSessionChart();
                    }

                    if (common.RTMDataManager.onRefreshServiceStatChart) {
                        common.RTMDataManager.onRefreshServiceStatChart();
                    }

                    if (common.RTMDataManager.onRefreshLoadPredictChart) {
                        common.RTMDataManager.onRefreshLoadPredictChart();
                    }

                    // MaxGauge 연동 화면 표시
                    if (window.mxgCallOptions) {
                        this.openTransactionDetailByMxg();
                    }

                    this.frameRefresh();

                    this.resetPAWebInfo();

                    this.configAlarmSound();

                    if (realTimeWS != null) {
                        var addServerInfo = {
                            command: COMMAND.ADD_SERVER,
                            data   : {}
                        };

                        // 모니터링 대상으로 WAS가 있는 경우
                        if (Comm.wasIdArr.length > 0) {
                            addServerInfo.data.wasNames = Comm.wasIdArr.join(',');
                        }

                        // 모니터링 대상으로 WebServer가 있는 경우
                        if (Comm.webIdArr.length > 0) {
                            addServerInfo.data.webIdArr = Comm.webIdArr.join(',');
                        }

                        realTimeWS.send(addServerInfo);
                        addServerInfo = null;
                    }

                    this.repeatCheckServerTime();

                    // TP, Web, C Daemon, E2E 등 실시간 모니터링 화면을 설정.
                    if (common.Menu.useRealtimeMultiTab) {
                        Comm.RTComm.setMonitoringView();
                    }

                    // URL을 통해서 접속하여 PA 화면을 표시하는 경우인지 체크하여 실시간 화면이 표시된 후
                    // 해당 PA 화면으로 이동한다.
                    common.LinkedManager.showPAView();

                    dataFlags = null;

                } else {
                    this.loadWaitCount++;
                }
            }
        }

    },


    /**
     * 실시간 화면에 보여지는 각 레이어 화면 생성
     */
    createView: function() {

        this.frameLockArea.setVisible(true);

        this._getImageList();

        if (Ext.isEmpty(Comm.hosts)) {
            this.selectedType = 1;
        }

        var baseCon = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'fit'
        });
        this.body.add(baseCon);

        this.createWasColors();

        // this.createLeftLayer();

        // 실시간 화면에 기본 화면 구성 정보 체크
        Comm.RTComm.checkChangeDefaultLayout();

        // 토폴로지 뷰 연계 데이터 유무 체크
        var isTopologyViewOn = localStorage.getItem('ImxTopologyViewOn');
        localStorage.removeItem('ImxTopologyViewOn');
        var viewIndex    = Comm.web_env_info['xm-dock-save-rtm.view.rtmView'] || 0;
        var originalData = Comm.web_env_info['xm-dock-position-rtm.view.rtmView-' + viewIndex];

        // 토폴로지 연계 정보가 있는 경우 토폴로지 화면이 보이게 설정
        if (isTopologyViewOn === 'true') {
            var topologyViewLayout = Comm.RTComm.getDockLayer('TopologyView');
            Comm.web_env_info['xm-dock-position-rtm.view.rtmView-' + viewIndex] = topologyViewLayout;
            Comm.RTComm.setRTMTabSubTitle('Topology View');
        }

        // 실시간 메인 화면 중앙 구성.
        this.dockLayer  = Ext.create('Exem.DockContainer', {
            className: this.$className,
            width    : '100%',
            height   : '100%',
            autoSave : false,
            defaultDockLayer: 'AIMonitor'
        });

        baseCon.add(this.dockLayer);
        this.dockLayer.init();
        this.dockSite = this.dockLayer;

        window.imxDockLayerBaseId = this.dockSite.id;
        window.imxBaseViewId = this.id;

        // 토폴로지 화면은 초기 실시간 화면을 표시할 때만 보여주는 것이므로
        // 연계 전 화면 구성으로 재설정함.
        if (isTopologyViewOn === 'true') {
            Comm.web_env_info['xm-dock-position-rtm.view.rtmView-' + viewIndex] = originalData;
        }

        baseCon = null;
        originalData = null;
        topologyViewLayout = null;
    },


    /**
     * 실시간 화면 왼쪽에 보여지는 메뉴 레이어 생성
     */
    createLeftLayer: function() {
        var self =  this;

        var leftCollapse;
        if (Comm.web_env_info.rtm_leftMenuCollapse && Comm.web_env_info.rtm_leftMenuCollapse === 'true') {
            leftCollapse = true;
        } else {
            leftCollapse = false;
        }

        this.leftCon = Ext.create('Exem.Panel',{
            region      : 'west',
            layout      : 'vbox',
            minWidth    : 250,
            height      : '100%',
            split       : true,
            collapsible : true,
            animCollapse: false,
            cls   : 'Exem-Panel-RTM-LeftView',
            style : {
                background: '#474a53'
            },
            listeners: {
                collapse: function(p) {
                    var title = (self.selectedType === 0)?common.Util.TR('Agent List'):common.Util.TR('Business List');
                    self.leftCon.setTitle(title);

                    common.WebEnv.Save('rtm_leftMenuCollapse', true);

                    if (p.getEl()) {
                        p.el.dom.style.display = 'none';
                    }

                    if (self.leftCon.placeholder != null) {
                        var isClickEvent = self.leftCon.placeholder.hasListener('click');
                        if (isClickEvent === false) {
                            self.leftCon.placeholder.addListener('click', function() {
                                self.leftCon.isExpandLock = true;
                            });
                        }
                    }
                },
                beforeexpand: function() {
                    if (self.leftCon.isExpandLock === true) {
                        return false;
                    }
                    self.leftCon.setTitle('');
                    common.WebEnv.Save('rtm_leftMenuCollapse', false);
                },
                expand: function() {
                    if (self.leftCon.isExpandLock === true) {
                        return false;
                    }
                },
                float: function() {
                    self.leftCon.isExpandLock = false;
                },
                unfloat: function() {
                    self.leftCon.isExpandLock = false;
                }
            }
        });

        this.add(this.leftCon);

        this.leftCon.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.leftCon,
            type: 'small-circleloading'
        });

        this.createGroupList();

        this.leftCon.setCollapsed(leftCollapse);
    },


    /**
     * 화면 좌측에 표시되는 호스트 및 비즈니스 그룹 목록 생성
     */
    createGroupList: function() {
        var self = this;

        var isBizGroup = (Comm.bizGroups.length > 0)? true : false;

        this.viewText = common.Menu.isBusinessPerspectiveMonitoring ? common.Util.TR('Tier List') : common.Util.TR('Business List');

        // 목록 유형을 선택하는 라디오 박스
        this.checkBoxCon = Ext.create('Exem.FieldContainer', {
            defaultType  : 'radiofield',
            selectionMode: 'single',
            layout       : 'hbox',
            defaults     : {flex: 1},
            margin       : '5 0 5 20',
            style        : {color: '#FFF'},
            items: [{
                boxLabel  : common.Util.TR('Host List'),
                width     : 100,
                name      : 'grouptype',
                inputValue: 0,
                checked   : (this.selectedType === 0),
                fieldStyle: 'margin-top:3px'
            },{
                boxLabel  : this.viewText,
                width     : 110,
                name      : 'grouptype',
                hidden    : !isBizGroup,
                inputValue: 1,
                checked   : (this.selectedType === 1),
                fieldStyle: 'margin-top:3px',
                listeners: {
                    change: function(field, newValue) {

                        if (self.leftCon.floated === false) {
                            self.leftCon.suspendLayouts();
                        }

                        if (newValue === true) {
                            self.selectedType = 1;
                            self.leftCon.setTitle(self.viewText);
                            self.menuBarGroup.changeGroup(1);
                        } else {
                            self.selectedType = 0;
                            self.leftCon.setTitle(common.Util.TR('Agent List'));
                            self.menuBarGroup.changeGroup(0);
                        }

                        if (self.leftCon.floated === false) {
                            self.leftCon.resumeLayouts();

                            self.updateLayout();
                        }

                    }
                }

            }]
        });

        this.menuListGroup = Ext.create('Ext.container.Container', {
            layout   : 'fit',
            flex     : 1,
            height   : '100%',
            width    : '100%',
            margin   : '0 0 0 0',
            style    : 'overflow-y: auto;overflow-x: hidden;'
        });

        this.leftCon.add([this.searchBoxCon, this.checkBoxCon, this.menuListGroup]);
        this.setGroupDataOnCanvas();

    },


    /**
     * 서버 갯수에 맞게 색상을 설정.
     */
    createWasColors: function() {
        var ix, ixLen;
        var viewIndex = Comm.web_env_info['xm-dock-save-rtm.view.rtmView'];
        var wasColor  = Comm.web_env_info['rtm_InstanceColors_View_' + viewIndex];
        var customColor;

        if (wasColor) {
            if (typeof wasColor === 'object') {
                customColor = wasColor;
            } else {
                customColor = JSON.parse(wasColor);
            }
            if (customColor && !Array.isArray(customColor)) {
                realtime.serverColorMap = customColor;
            }
            customColor = null;
            wasColor    = null;
        }

        var color;
        var colorIdx = 0, randomIdx = 0;
        var serverType, serverId;

        for(ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++ ) {
            serverId   = Comm.wasIdArr[ix];
            serverType = Comm.wasInfoObj[serverId].type;

            if (!realtime.serverColorMap[serverType]) {
                realtime.serverColorMap[serverType] = {};
            }

            color      = realtime.serverColorMap[serverType][serverId];

            // 서버 ID에 해당 하는 정보가 저장되어 있지 않는 경우 색상 코드 목록에서 가져와 설정.
            if (!color) {
                color = realtime.Colors[colorIdx++];
            }

            // 기존 색상 코드 목록보다 서버 갯수가 많은 경우 기존 색상 코드값을 기준으로 랜덤 색상을
            // 생성하여 설정한다.
            if (!color) {
                color = Comm.RTComm.decimalToHex(realtime.Colors[randomIdx++]);
                realtime.Colors[colorIdx -1] = color;
                realtime.DefaultColors[colorIdx -1] = color;
            }
            realtime.serverColorMap[serverType][serverId] = color;

            if (!Comm.wasInfoObj[Comm.wasIdArr[ix]].labelColor){
                Comm.wasInfoObj[Comm.wasIdArr[ix]].labelColor = color;
            }
        }

        color     = null;
        randomIdx = null;
        viewIndex = null;
    },


    /**
     * 호스트, 업무 그룹 별로 서버 목록 구성
     */
    setMenuGroupList: function() {
        var ix, ixLen, jx;
        var wasList   = [];

        var groupName;
        var wasCount = Comm.wasIdArr.length;
        var wasID;
        var isContainNotWAS, addWasCount;

        wasList[wasList.length] = {
            isTitle      : true,
            groupType    : 0,
            groupName    : 'OVERALL',
            serverId     : -1,
            serverName   : '',
            serverType   : 'WAS',
            labelColor   : ''
        };

        for (jx = 0; jx < wasCount; jx++) {
            wasID = Comm.wasIdArr[jx];

            if (Comm.wasInfoObj[wasID].type !== 'WAS') {
                continue;
            }

            wasList[wasList.length] = {
                isTitle      : false,
                groupType    : 0,
                groupName    : 'OVERALL',
                serverId     : wasID,
                serverName   : Comm.wasInfoObj[wasID].wasName,
                serverType   : 'WAS',
                labelColor   : Comm.wasInfoObj[wasID].labelColor,
                isContainNet : Comm.wasInfoObj[wasID].isDotNet
            };
        }

        // Host List
        for (ix = 0, ixLen = Comm.hosts.length; ix < ixLen; ix++) {
            groupName = Comm.hosts[ix];

            if (Ext.isEmpty(groupName)) {
                continue;
            }

            isContainNotWAS = false;
            addWasCount = 0;

            wasList[wasList.length] = {
                isTitle      : true,
                groupType    : 0,
                groupName    : groupName,
                serverId     : -1,
                serverName   : '',
                labelColor   : ''
            };

            for (jx = 0; jx < wasCount; jx++) {
                wasID = Comm.wasIdArr[jx];

                if (Comm.wasInfoObj[wasID].type !== 'WAS') {
                    isContainNotWAS = true;
                    continue;
                }


                if (groupName === Comm.RTComm.getGroupNameByType(0, wasID)) {

                    addWasCount++;
                    wasList[wasList.length] = {
                        isTitle      : false,
                        groupType    : 0,
                        groupName    : groupName,
                        serverId     : wasID,
                        serverName   : Comm.wasInfoObj[wasID].wasName,
                        serverType   : 'WAS',
                        labelColor   : Comm.wasInfoObj[wasID].labelColor,
                        isContainNet : Comm.wasInfoObj[wasID].isDotNet
                    };
                }
            }

            if (isContainNotWAS && addWasCount === 0) {
                wasList.splice(wasList.length - 1, 1);
            }

        }

        // Business List
        for (ix = 0, ixLen = Comm.bizGroups.length; ix < ixLen; ix++) {
            groupName = Comm.bizGroups[ix];

            if (Ext.isEmpty(groupName)) {
                continue;
            }

            isContainNotWAS = false;
            addWasCount = 0;

            wasList[wasList.length] = {
                isTitle      : true,
                groupType    : 1,
                groupName    : groupName,
                serverId     : -1,
                serverName   : '',
                serverType   : 'WAS',
                labelColor   : ''
            };

            for (jx = 0; jx < wasCount; jx++) {
                wasID = Comm.wasIdArr[jx];

                if (Comm.wasInfoObj[wasID].type !== 'WAS') {
                    isContainNotWAS = true;
                    continue;
                }

                if (groupName === Comm.RTComm.getGroupNameByType(1, wasID)) {

                    addWasCount++;
                    wasList[wasList.length] = {
                        isTitle      : false,
                        groupType    : 1,
                        groupName    : groupName,
                        serverId     : wasID,
                        serverName   : Comm.wasInfoObj[wasID].wasName,
                        serverType   : 'WAS',
                        labelColor   : Comm.wasInfoObj[wasID].labelColor,
                        isContainNet : Comm.wasInfoObj[wasID].isDotNet
                    };
                }
            }

            if (isContainNotWAS && addWasCount === 0) {
                wasList.splice(wasList.length - 1, 1);
            }
        }

        this.menuBarGroup.setMenuList(wasList.concat());
        wasList = null;
    },


    /**
     * 그룹 유형에 해당하는 그룹 및 WAS 목록 구성 (Canvas 방식)
     */
    setGroupDataOnCanvas: function() {

        this.menuBarGroup = Ext.create('rtm.src.rtmGroupList', {
            margin       : '0 0 0 0',
            monitorType  : 'WAS'
        });

        // 호스트, 업무 그룹 별로 서버 목록 구성
        this.setMenuGroupList();

        this.menuBarGroup.frameChange = function() {
            Ext.ComponentQuery.query('container[cls=rtm-base]')[0].frameChange(realtime.WasModeSelected);
        };

        this.menuListGroup.add(this.menuBarGroup);

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this.menuBarGroup);
    },


    /**
     * 알람 발생시 재생되는 알람 설정.
     */
    configAlarmSound: function() {

        realtime.sound = Ext.create('Exem.XMAlarmSound',{
            soundUrls: {
                KO: {warning : '../sound/mx_warning_ko.mp3', critical: '../sound/mx_critical_ko.mp3'},
                EN: {warning : '../sound/mx_warning_en.mp3', critical: '../sound/mx_critical_en.mp3'},
                JA: {warning : '../sound/mx_warning_ja.mp3', critical: '../sound/mx_critical_ja.mp3'},
                ZH: {warning : '../sound/mx_warning_zh.mp3', critical: '../sound/mx_critical_zh.mp3'}
            },
            userLanguage : window.nation,
            getAlarmSoundOn   : function() {
                return Comm.web_env_info.AlarmSoundOn;
            },
            getCriticalSoundOn: function() {
                return Comm.web_env_info.AlarmSoundCritical;
            },
            getWarningSoundOn : function() {
                return Comm.web_env_info.AlarmSoundWarning;
            }
        });
    },


    frameDraw: function(isSnapShot) {
        this.frameStopDraw();

        try {
            this.drawFrames();
        } catch (exception) {
            this.loadingMask.hide();

            // DEBUG CODE
            console.error(exception);

            var errorMsg  = 'Error Message: ' + exception.message + '<br>';
            errorMsg += 'Error Name: '    + exception.name;

            common.Util.showMessage(common.Util.TR('ERROR'), errorMsg, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
        } finally {
            if (! isSnapShot) {
                this.timer = setTimeout( this.frameDraw.bind(this) , this.interval );
            }

            isSnapShot = null;
        }
    },


    frameStopDraw: function(){
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    },


    /**
     * 메인 화면에 구성된 각 패널의 frameRefresh() 함수를 실행.
     */
    drawFrames: function(){
        var ix, ixLen;
        var frame;

        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            frame = this.dockLayer.dockList[ix].obj;

            if (frame.frameRefresh) {
                requestAnimationFrame(frame.frameRefresh.bind(frame));
            }
        }

        frame = null;
        ix    = null;
        ixLen = null;
    },


    /**
     * 메인 화면에 구성된 각 패널의 frameOptionChange() 함수를 실행.
     */
    frameOptionChange: function() {
        var ix, ixLen;
        var frame;

        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            frame = this.dockLayer.dockList[ix].obj;

            if (frame.frameOptionChange) {
                frame.frameOptionChange();
            }
        }

        frame  = null;
        ix     = null;
        ixLen  = null;
    },


    /**
     * 화면좌측 메뉴에서 WAS 또는 그룹을 선택하는 경우 실행.
     *
     * @param {string[]} wasList - WAS Name 배열
     */
    frameChange: function(wasList) {
        var ix, ixLen;
        var windowComponent;

        var windowFloatingList = Ext.WindowManager.zIndexStack.items;
        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent &&
                    windowComponent.$className.indexOf('rtm.src.') === 0 &&
                    windowComponent.frameChange) {

                    windowComponent.frameChange(wasList);

                    if (windowComponent.frameRefresh) {
                        windowComponent.frameRefresh();
                    }
                }
            }
        }

        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            if (this.dockLayer.dockList[ix].obj.frameChange) {
                this.dockLayer.dockList[ix].obj.frameChange(wasList);

                if (this.dockLayer.dockList[ix].obj.frameChange.frameRefresh) {
                    this.dockLayer.dockList[ix].obj.frameChange.frameRefresh();
                }
            }
        }

        for (ix = 0, ixLen = realtime.rtmPopupList.length; ix < ixLen; ix++) {
            if (realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameChange) {
                realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameChange(wasList);

                if (realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameChange.frameRefresh) {
                    realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameChange.frameRefresh();
                }
            }
        }

        ix      = null;
        ixLen   = null;
        wasList = null;
        windowFloatingList = null;
        windowComponent    = null;
    },


    /**
     * 좌측 메뉴에서 WAS 선택.
     *
     * @param {string} wasName - WAS명
     */
    wasSelect: function(wasName) {

        if (Ext.isEmpty(wasName)) {
            realtime.WasModeSelected.length = 0;

        } else {
            var isContain = Ext.Array.contains(realtime.WasModeSelected, wasName);
            if (isContain === true) {
                Ext.Array.remove(realtime.WasModeSelected, wasName);
            } else {
                realtime.WasModeSelected[realtime.WasModeSelected.length] = wasName;
            }
        }

        Comm.selectedWasArr.length = 0;

        var ix, ixLen;

        if (realtime.WasModeSelected.length === 0 || realtime.WasModeSelected.length === Comm.wasIdArr.length) {
            for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                Comm.selectedWasArr[Comm.selectedWasArr.length] = Comm.wasIdArr[ix];
                realtime.WasModeSelected.length = 0;
            }
            common.RTMDataManager.clearSelectedAgent();
        } else {
            for (ix = 0, ixLen = realtime.WasModeSelected.length; ix < ixLen; ix++) {
                Comm.selectedWasArr[Comm.selectedWasArr.length] = Comm.RTComm.getWASIdbyName(realtime.WasModeSelected[ix]);
            }
        }

        this.selectedWAS = wasName;

        if (this.menuBarGroup && this.menuBarGroup.selectAgentList) {
            var wasId = Comm.RTComm.getWASIdbyName(wasName);
            this.menuBarGroup.selectAgentList(wasId);
        }

        this.frameChange(realtime.WasModeSelected);
    },


    /**
     * WAS Label Color 를 변경한다.
     */
    changeWasColor: function() {
        var ix, ixLen;

        this.menuBarGroup.changeLabelColor();

        var windowComponent;
        var windowFloatingList = Ext.WindowManager.zIndexStack.items;

        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent &&
                    windowComponent.$className.indexOf('rtm.src.') === 0 &&
                    windowComponent.changeChartColors) {

                    windowComponent.changeChartColors();
                }
            }
        }

        // Change Chart Color
        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            if (this.dockLayer.dockList[ix].obj.changeChartColors) {
                this.dockLayer.dockList[ix].obj.changeChartColors();
            }
        }

        windowFloatingList = null;
        windowComponent    = null;
    },


    /**
     * Change All Sum chart colors.
     *
     * @param {string} color - Changed Sum Chart Color
     */
    changeSumChartColor: function(color) {
        var ix, ixLen;
        var windowComponent;
        var windowFloatingList = Ext.WindowManager.zIndexStack.items;

        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent &&
                    windowComponent.$className.indexOf('rtm.src.') === 0 &&
                    windowComponent.changeSumChartColors) {

                    windowComponent.changeSumChartColors(color);
                }
            }
        }

        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            if (this.dockLayer.dockList[ix].obj.changeSumChartColors) {
                this.dockLayer.dockList[ix].obj.changeSumChartColors(color);
            }
        }
    },


    /**
     * PA 화면구성에 필요한 기본 데이터 설정 및 변환
     */
    resetPAWebInfo: function() {
        var isExecuteReconfig = false;

        var get_pa_info = function() {
            var keys = Object.keys(Comm.web_env_info);
            var envData;

            for (var ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                if (keys[ix].indexOf('pa_') !== 0) {
                    continue;
                }

                envData = Comm.web_env_info[keys[ix]];

                if (!Ext.isObject(envData) && !Ext.isArray(envData)) {
                    try {
                        Comm.web_env_info[keys[ix]] = JSON.parse(envData);
                    } catch(e) {
                        console.debug('%c [RTM View] Is String format data.', 'color:blue;', envData);
                    }
                }
            }
        };

        var default_gc, default_stat,
            default_gc_id, default_stat_id;

        if ( !Comm.web_env_info['pa_performance_trend_stat_Default']) {

            //DB Trend variable
            var default_db_stat  = JSON.stringify([
                'session logical reads'
                , 'physical reads'
                , 'execute count'
                , 'redo entries'
            ]);
            var default_db_wait  = JSON.stringify([
                'Latch Wait Time (Total)'
                , 'db file sequential read'
                , 'db file scattered read'
                , 'library cache pin'
            ]) ;
            var default_db_ratio = JSON.stringify([
                'Buffer Cache Hit Ratio'
                , 'Log Buffer Retry Ratio'
                , 'Log Space Request Ratio'
                , 'Free Buffer Scan Ratio'
            ]) ;

            //Performance Trend
            default_stat = JSON.stringify([
                'Concurrent Users'
                ,'Active Users'
                ,'TPS'
                ,'Elapse Time'
            ]);

            default_stat_id = JSON.stringify([
                'was_sessions'
                ,'active_client_ip'
                ,'tps'
                ,'txn_elapse'
            ]);

            var default_db = JSON.stringify([
                'active sessions'
                ,'CPU Usage'
                ,'physical reads'
                ,'execute count'
            ]);

            var default_wait = JSON.stringify([
                'Latch Wait Time (Total)'
                ,'db file sequential read'
                ,'db file scattered read'
                ,'library cache pin'
            ]);

            default_gc  = JSON.stringify([
                'Total GC Count'
                ,'Total GC Time (Sec)'
                ,'Full GC Count'
                ,'Full GC Time (Sec)'
            ]);

            default_gc_id = JSON.stringify([
                'jvm_gc_count'
                ,'jvm_gc_time'
                ,'fgc'
                ,'old_gc_time'
            ]);

            common.WebEnv.insert_config( 'pa_db_trend_stat' , default_db_stat , null ) ;
            common.WebEnv.insert_config( 'pa_db_trend_wait' , default_db_wait , null ) ;
            common.WebEnv.insert_config( 'pa_db_trend_ratio', default_db_ratio, null ) ;

            common.WebEnv.insert_config( 'pa_performance_trend_types',     'Default' ) ;
            common.WebEnv.insert_config( 'pa_performance_trend_last_type', 'Default' ) ;

            common.WebEnv.insert_config( 'pa_performance_trend_stat', default_stat, 'Default' ) ;
            common.WebEnv.insert_config( 'pa_performance_trend_db'  , default_db  , 'Default' ) ;
            common.WebEnv.insert_config( 'pa_performance_trend_wait', default_wait, 'Default' ) ;
            common.WebEnv.insert_config( 'pa_performance_trend_gc'  , default_gc  , 'Default' ) ;

            common.WebEnv.insert_config( 'pa_performance_trend_stat_id', default_stat_id, 'Default' ) ;
            common.WebEnv.insert_config( 'pa_performance_trend_db_id'  , default_db     , 'Default' ) ;
            common.WebEnv.insert_config( 'pa_performance_trend_wait_id', default_wait   , 'Default' ) ;
            common.WebEnv.insert_config( 'pa_performance_trend_gc_id'  , default_gc_id  , 'Default' ) ;

            isExecuteReconfig = true;

            default_db_stat  = null ;
            default_db_wait  = null ;
            default_db_ratio = null ;

            default_stat = null ;
            default_db   = null ;
            default_wait = null ;
            default_gc   = null ;

            default_stat_id = null ;
            default_db      = null ;
            default_wait    = null ;
            default_gc_id   = null ;

        } else {
            if (Comm.web_env_info.pa_performance_trend_last_type == null) {
                common.WebEnv.insert_config( 'pa_performance_trend_last_type', 'Default' ) ;
            }
            if (Comm.web_env_info.pa_performance_trend_types == null) {
                common.WebEnv.insert_config( 'pa_performance_trend_types', 'Default' ) ;
            }
        }

        if ( !Comm.web_env_info['pa_comparison_stat_Default']) {
            default_stat = [
                'TPS'
                ,'OS CPU (%)'
                ,'JVM Used Heap (MB)'
                ,'Elapse Time'
            ];

            default_stat_id = [
                'tps'
                ,'os_cpu'
                ,'jvm_used_heap'
                ,'txn_elapse'
            ];

            default_gc  = JSON.stringify([
                'Total GC Count'
                ,'Total GC Time (Sec)'
                ,'Full GC Count'
                ,'Full GC Time (Sec)'
            ]);

            default_gc_id = JSON.stringify([
                'jvm_gc_count'
                ,'jvm_gc_time'
                ,'fgc'
                ,'old_gc_time'
            ]);

            common.WebEnv.insert_config( 'pa_comparison_types',     'Default' ) ;
            common.WebEnv.insert_config( 'pa_comparison_last_type', 'Default' ) ;

            common.WebEnv.insert_config( 'pa_comparison_stat'   , default_stat  , 'Default' ) ;
            common.WebEnv.insert_config( 'pa_comparison_stat_id', default_stat_id, 'Default' ) ;
            common.WebEnv.insert_config( 'pa_comparison_gc'     , default_gc   , 'Default' ) ;
            common.WebEnv.insert_config( 'pa_comparison_gc_id'  , default_gc_id, 'Default' ) ;

            isExecuteReconfig = true;

            default_stat = null;
            default_stat_id = null;
            default_gc      = null ;
            default_gc_id   = null ;
        }

        if (!Comm.web_env_info['pa_was_performance_trend_all_stat_Default']) {
            default_stat = JSON.stringify([
                'Concurrent Users'
                ,'Active Users'
                ,'TPS'
                ,'Elapse Time'
                ,'Active Transactions'
            ]);

            default_stat_id = JSON.stringify([
                'was_sessions'
                ,'active_client_ip'
                ,'tps'
                ,'txn_elapse'
                ,'active_txns'
            ]);

            default_gc  = JSON.stringify([
                'Total GC Count'
                ,'Total GC Time (Sec)'
                ,'Full GC Count'
                ,'Full GC Time (Sec)'
                ,'Young GC Count'
            ]);

            default_gc_id = JSON.stringify([
                'jvm_gc_count'
                ,'jvm_gc_time'
                ,'fgc'
                ,'old_gc_time'
                ,'ygc'
            ]);

            common.WebEnv.insert_config( 'pa_was_performance_trend_all_types',     'Default' ) ;
            common.WebEnv.insert_config( 'pa_was_performance_trend_all_last_type', 'Default' ) ;

            common.WebEnv.insert_config( 'pa_was_performance_trend_all_stat', default_stat, 'Default' ) ;
            common.WebEnv.insert_config( 'pa_was_performance_trend_all_gc'  , default_gc, 'Default' ) ;
            common.WebEnv.insert_config( 'pa_was_performance_trend_all_stat_id', default_stat_id, 'Default' ) ;
            common.WebEnv.insert_config( 'pa_was_performance_trend_all_gc_id'  , default_gc_id, 'Default' ) ;

            isExecuteReconfig = true;
        }

        if (isExecuteReconfig === true) {
            get_pa_info();
        }

    },


    /**
     * CPU, Memory 정보 업데이트
     *
     * 실시간 정보를 바로 보여주는 경우 렌더링 작업이 빈번하게 발생하여서
     * CPU 사용량이 증가하게되기 때문에 실시간으로 받은 데이터를 변환해서 가지고 있다가 일정 주기로
     * 데이터를 그리도록 처리함.
     */
    frameRefresh: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        if (Comm.rtmShow === true) {
            var wasId;
            var data;

            for (var ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                wasId = Comm.wasIdArr[ix];
                data = this.wasCpuMem[wasId];
                if (data) {
                    this.parseData(wasId, data);
                }
            }
            data = null;
            // this.menuBarGroup.onData(this.wasStatData.concat());
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 1000);
    },


    /**
     * 실시간 화면에 도킹되어 있는 각 콤포넌트 화면에서 중지되어 있던 Draw 를 다시 시작함
     */
    startFrameDraw: function(){
        var ix, ixLen,
            windowFloatingList, windowComponent;

        if (!this.dockLayer) {
            return;
        }

        windowFloatingList = Ext.WindowManager.zIndexStack.items;
        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent && windowComponent.frameRefresh && windowComponent.openViewType === 'WAS') {
                    if (windowComponent.title === common.Util.TR('Activity Monitor') && Comm.rtmShow) {
                        windowComponent.init();
                    }
                    windowComponent.frameRefresh();
                }
            }
        }

        for(ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++){
            if(this.dockLayer.dockList[ix].obj.frameRefresh){
                if(this.dockLayer.dockList[ix].obj.frameStopDraw){
                    this.dockLayer.dockList[ix].obj.frameStopDraw();
                }
                this.dockLayer.dockList[ix].obj.frameRefresh();
            }
        }

        for (ix = 0, ixLen = realtime.rtmPopupList.length; ix < ixLen; ix++) {
            if (realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameRefresh) {
                if (realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameStopDraw) {
                    realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameStopDraw();
                }
                realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameRefresh();
            }
        }
    },


    /**
     * 실시간 화면에 도킹되어 있는 각 콤포넌트 화면에서 실행되는 Draw 를 중지함.
     */
    stopFrameDraw: function(){
        var ix, ixLen,
            windowFloatingList, windowComponent;

        if (! this.dockLayer) {
            return;
        }

        windowFloatingList = Ext.WindowManager.zIndexStack.items;
        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent && windowComponent.frameStopDraw) {
                    windowComponent.frameStopDraw();
                    if (windowComponent.title === common.Util.TR('Activity Monitor')) {
                        windowComponent.removeAll();
                    }
                }
            }
        }

        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            if (this.dockLayer.dockList[ix].obj.frameStopDraw) {
                this.dockLayer.dockList[ix].obj.frameStopDraw();
            }
        }
    },


    /**
     * 실시간 CPU, Memory 데이터 로드
     *
     * @param {Object} adata - WAS Stat packet data
     */
    onData: function(adata) {
        if (!adata) {
            return;
        }

        var ix, ixLen;
        var v;

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            v = adata.rows[ix];

            if (!v || v.length <= 0) {
                continue;
            }

            this.wasCpuMem[v[1]] = [v[2], v[3], v[20], v[21], v[22], v[23], v[24]];
        }

        v     = null;
        adata = null;
    },


    /**
     * 실시간 서버 CPU, Memory 데이터를 보여주기 위한 정보로 변환.
     *
     * @param {number} wasId - WAS ID
     * @param {array} data - CPU, Memory Data
     */
    parseData: function(wasId, data) {
        var index   = -1;

        if (!this.wasStatDataCache) {
            this.wasStatDataCache = [];
        }

        var wasStatData = this.wasStatDataCache[wasId];

        if (!wasStatData) {
            for (var ix = 0, ixLen = this.wasStatData.length; ix < ixLen; ix++) {
                if (wasId === this.wasStatData[ix].wasID) {
                    index = ix;
                    break;
                }
            }
            if (index !== -1) {
                wasStatData = this.wasStatData[index];
                index = 999999;
            }
        } else {
            index = 999999;
        }

        this.tmpGroupName = Comm.RTComm.getGroupNameByWasName(data[0]);

        if (index === -1) {
            index = this.wasStatData.length;
            this.wasStatData[index] = {
                wasID        : wasId,
                wasName      : data[0],
                groupName    : this.tmpGroupName,
                hostName     : data[1],
                os_cpu_sys   : Math.floor(data[2] / 10),
                os_cpu_usr   : Math.floor(data[3] / 10),
                os_cpu_io    : Math.floor(data[4] / 10),
                os_free_mem  : +data[5],
                os_total_mem : +data[6],
                cpu          : 0,
                mem          : 0
            };
            this.wasStatDataCache[wasId] = this.wasStatData[index];
            wasStatData = this.wasStatData[index];

        } else {
            wasStatData.wasName      = data[0];
            wasStatData.groupName    = this.tmpGroupName;
            wasStatData.hostName     = data[1];
            wasStatData.os_cpu_sys   = Math.floor(data[2] / 10);
            wasStatData.os_cpu_usr   = Math.floor(data[3] / 10);
            wasStatData.os_cpu_io    = Math.floor(data[4] / 10);
            wasStatData.os_free_mem  = +data[5];
            wasStatData.os_total_mem = +data[6];
        }

        wasStatData.cpu = wasStatData.os_cpu_sys + wasStatData.os_cpu_usr + wasStatData.os_cpu_io;

        if (wasStatData.os_free_mem === 0 || wasStatData.os_total_mem === 0) {
            wasStatData.mem = 0;
        } else {
            wasStatData.mem = 100 - Math.floor((wasStatData.os_free_mem / wasStatData.os_total_mem) * 100);
        }

        ix            = null;
        ixLen         = null;
        index         = null;
        wasId         = null;
        data          = null;
        wasStatData   = null;
    },


    /**
     * MaxGauge와 연계하여 호출된 경우 트랜잭션 상세화면을 표시.
     */
    openTransactionDetailByMxg: function() {
        var popupOptions = window.mxgCallOptions;
        var isEndTxn     = window.mxgCallIsEndTxn;

        var popupWin;

        window.mxgCallOptions  = null;
        window.mxgCallIsEndTxn = null;

        if (isEndTxn) {
            popupWin = window.open("../txnDetail/txnDetail.html", "hide_referrer_1", popupOptions);

        } else {
            popupWin = window.open("../txnDetail/activeTxnDetail.html", "hide_referrer_2", popupOptions);
        }

        if (popupWin == null) {
            Ext.MessageBox.show({
                title   : '',
                icon    : Ext.MessageBox.INFO,
                message : common.Util.TR('Pop-up blocked'),
                modal   : true,
                cls     : 'popup-message',
                buttons : Ext.Msg.OK
            });
        }
    },


    /**
     * 1분 주기로 WAS별 서버 시간 정보를 조회
     */
    repeatCheckServerTime: function() {
        if (this.refreshTimeId) {
            clearTimeout(this.refreshTimeId);
        }

        if (!Comm.wasIdArr || Comm.wasIdArr.length <= 0) {
            WS.SQLExec({
                sql_file: 'IMXRT_ServerTime.sql',
                replace_string: [{
                    name: 'wasid', value: Comm.wasIdArr.join(',')
                }]
            }, function(aheader, adata) {

                if (aheader && aheader.success === false && !adata) {
                    console.debug('%c [RTM View] [ERROR] Failed to retrieve the server time.', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                    return;
                }

                var result = adata.rows;
                if (result.length > 0) {
                    Comm.lastServerTime = result[0][1];
                }

                for (var ix = 0, ixLen = result.length; ix < ixLen; ix++) {
                    Comm.serverTimeByWasId[result[ix][0]] = result[ix][1];
                }

                result  = null;
                adata   = null;
                aheader = null;
            });
        }

        this.refreshTimeId = setTimeout(this.repeatCheckServerTime.bind(this), 1000 * 60);
    }

});
