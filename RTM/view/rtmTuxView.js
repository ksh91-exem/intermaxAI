Ext.define('rtm.view.rtmTuxView', {
    extend: 'view.baseView',
    width : '100%',
    height: '100%',
    baseMargin : '0 10 0 5',
    cls   : 'rtm-base tux',

    selectedGroup : null,
    selectedType  : 0,     // 0: Agent List, 1: Business List
    timerInc      : null,

    timer         : null,
    isStop        : false,
    isCreateView  : false,

    listeners: {
        beforedestroy: function() {

            if (this.menuBarGroup) {
                common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, this.menuBarGroup);
            }
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WASSTAT, this);
            Comm.rtmTuxShow = false;
        },
        hide: function() {
            Comm.rtmTuxShow = false;
        },
        show: function() {
            if (this.isDestroyStart) {
                return;
            }

            Comm.rtmTuxShow = true;

            window.isLockRTMFrame = Comm.RTComm.getBooleanValue(Comm.web_env_info.rtm_tux_frame_lock);

            if (!this.isCreateView) {
                this.loadingMask = Ext.create('Exem.LoadingMask', {
                    target: this,
                    type: 'large-whirlpool'
                });
                this.loadingMask.show(true);

                this.isCreateView = true;
                setTimeout(this.loadViews.bind(this), 10);
            }
        }
    },

    bindEvent: function() {
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

    iniProperty: function() {
        this.defaultView = '../images/View_Image/rtmTuxViewDefault.png';

        this.selectedGroup = null;
        this.selectedType  = 0;

        this.wasStatData   = [];
        this.groupList     = {};
        this.wasCpuMem     = {};

        this.wasStatDataCache = [];
    },


    /**
     * 실시간 화면에 설정된 테마에 해당하는 css 설정
     */
    initViewTheme: function() {
        // 저장된 테마 정보 가져오기
        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
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

        this.bindEvent();
    },


    /**
     * 실시간 모니터링 화면의 잠금 여부를 체크 및 설정.
     */
    setRealtimeViewLock: function() {
        if (!Comm.web_env_info['rtm_tux_frame_lock']) {
            common.WebEnv.Save('rtm_tux_frame_lock', false);
            window.isLockRTMFrame = false;

        } else {
            window.isLockRTMFrame = (Comm.web_env_info['rtm_tux_frame_lock'].toLowerCase() === 'true');
            this.setFrameLock(window.isLockRTMFrame);
        }
    },


    loadViews: function() {

        this.createView();

        this.resetPAWebInfo();

        this.setRealtimeViewLock();

        this.loadingMask.hide();

        Comm.RTComm.checkServerStatusObject();

        Comm.RTComm.initCheckExpiredLicense();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WASSTAT, this);

        this.frameRefresh();

    },


    /**
     * 화면에 보여지는 각 레이어 화면 생성
     */
    createView: function() {

        this.frameLockArea.setVisible(true);

        this._getImageList();

        if (Ext.isEmpty(realtime.TuxHostList)) {
            this.selectedType = 1;
        }

        var baseCon = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'fit'
        });
        this.body.add(baseCon);

        this.setServerColors();

        this.createLeftLayer();

        if (Comm.RTComm.checkChangeDefaultTuxLayout) {
            Comm.RTComm.checkChangeDefaultTuxLayout();
        }

        var defaultLayer = Comm.RTComm.getDockLayer('TuxMonitor');

        // 실시간 메인 화면 중앙 구성.
        this.dockLayer  = Ext.create('Exem.DockContainer', {
            className: this.$className,
            width    : '100%',
            height   : '100%',
            autoSave : false,
            defaultDockLayer: defaultLayer
        });

        baseCon.add(this.dockLayer);
        this.dockLayer.init();

        this.dockSite = this.dockLayer;

        window.imxTPDockLayerBaseId = this.dockSite.id;
        window.imxTPBaseViewId      = this.id;
    },


    /**
     * 화면 왼쪽에 보여지는 메뉴 레이어 생성
     */
    createLeftLayer: function() {

        var leftCollapse;
        if (Comm.web_env_info['rtm_tux_leftMenuCollapse'] && Comm.web_env_info['rtm_tux_leftMenuCollapse'] === 'true') {
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
                scope: this,
                collapse: function(p) {
                    var title, isClickEvent;

                    if (this.selectedType === 0) {
                        title = common.Util.TR('Agent List');
                    } else {
                        title = common.Util.TR('Business List');
                    }
                    this.leftCon.setTitle(title);

                    common.WebEnv.Save('rtm_tux_leftMenuCollapse', true);

                    if (p.getEl()) {
                        p.el.dom.style.display = 'none';
                    }

                    if (this.leftCon.placeholder != null) {
                        isClickEvent = this.leftCon.placeholder.hasListener('click');
                        if (isClickEvent === false) {
                            this.leftCon.placeholder.addListener('click', function() {
                                this.leftCon.isExpandLock = true;
                            }.bind(this));
                        }
                    }
                },
                beforeexpand: function() {
                    if (this.leftCon.isExpandLock === true) {
                        return false;
                    }
                    this.leftCon.setTitle('');
                    common.WebEnv.Save('rtm_tux_leftMenuCollapse', false);
                },
                expand: function() {
                    if (this.leftCon.isExpandLock === true) {
                        return false;
                    }
                },
                float: function() {
                    this.leftCon.isExpandLock = false;
                },
                unfloat: function() {
                    this.leftCon.isExpandLock = false;
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
        var isBizGroup = (Comm.tpBizGroups.length > 0);

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
                name      : 'tuxgrouptype',
                inputValue: 0,
                checked   : (this.selectedType === 0),
                fieldStyle: 'margin-top:3px'
            },{
                boxLabel  : this.viewText,
                width     : 110,
                name      : 'tuxgrouptype',
                hidden    : !isBizGroup,
                inputValue: 1,
                checked   : (this.selectedType === 1),
                fieldStyle: 'margin-top:3px',
                listeners: {
                    scope : this,
                    change: function(field, newValue) {

                        if (this.leftCon.floated === false) {
                            this.leftCon.suspendLayouts();
                        }

                        if (newValue === true) {
                            this.selectedType = 1;
                            this.leftCon.setTitle(this.viewText);
                            this.menuBarGroup.changeGroup(1); // Business Group

                        } else {
                            this.selectedType = 0;
                            this.leftCon.setTitle(common.Util.TR('Agent List'));
                            this.menuBarGroup.changeGroup(0); // Agent Group
                        }

                        if (this.leftCon.floated === false) {
                            this.leftCon.resumeLayouts();

                            this.updateLayout();
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

        this.setGroupData();
    },


    /**
     * 서버 갯수에 맞게 서버 색상을 설정.
     */
    setServerColors: function() {
        var ix, ixLen;
        var viewIndex   = Comm.web_env_info['xm-dock-save-rtm.view.rtmTuxView'];
        var serverColor = Comm.web_env_info['rtm_InstanceColors_View_' + viewIndex];
        var customColor;

        if (serverColor) {
            if (typeof serverColor === 'object') {
                customColor = serverColor;
            } else {
                customColor = JSON.parse(serverColor);
            }
            if (customColor && !Array.isArray(customColor)) {
                realtime.serverColorMap.TUX = customColor.TUX;
            }
            customColor = null;
            serverColor = null;
        }

        var color;
        var colorIdx = 0, randomIdx = 0;
        var serverId;

        if (!realtime.serverColorMap.TUX) {
            realtime.serverColorMap.TUX = {};
        }

        for (ix = 0, ixLen = Comm.tuxIdArr.length; ix < ixLen; ix++ ) {
            serverId   = Comm.tuxIdArr[ix];
            color      = realtime.serverColorMap.TUX[serverId];

            // 서버 ID에 해당 하는 정보가 저장되어 있지 않는 경우 색상 코드 목록에서 가져와 설정.
            if (!color) {
                color = realtime.Colors[colorIdx++];
            }

            // 기존 색상 코드 목록보다 서버 갯수가 많은 경우 기존 색상 코드값을 기준으로 랜덤 색상을
            // 생성하여 설정한다.
            if (!color) {
                color = Comm.RTComm.decimalToHex(realtime.Colors[randomIdx++]);
                realtime.Colors[colorIdx - 1] = color;
                realtime.DefaultColors[colorIdx - 1] = color;
            }
            realtime.serverColorMap.TUX[serverId] = color;

            if (!Comm.tuxInfoObj[Comm.tuxIdArr[ix]].labelColor) {
                Comm.tuxInfoObj[Comm.tuxIdArr[ix]].labelColor = realtime.Colors[ix];
            }
        }
    },

    /**
     * 왼쪽 메뉴 목록에 표시되는 그룹 및 서버 정보를 설정
     */
    setGroupData: function() {
        this.menuBarGroup = Ext.create('rtm.src.rtmGroupList', {
            margin       : '0 0 0 0',
            monitorType  : 'TUX'
        });
        this.setMenuGroupList();
    },

    /**
     * 호스트, 업무 그룹 별로 서버 목록 구성
     */
    setMenuGroupList: function() {
        var ix, ixLen, jx;
        var serverList = [];

        var groupName;
        var serverCount = Comm.tuxIdArr.length;
        var serverID;

        serverList[serverList.length] = {
            isTitle      : true,
            groupType    : 0,
            groupName    : 'OVERALL',
            serverId     : -1,
            serverName   : '',
            serverType   : 'TUX',
            labelColor   : ''
        };

        for (jx = 0; jx < serverCount; jx++) {
            serverID = Comm.tuxIdArr[jx];

            serverList[serverList.length] = {
                isTitle      : false,
                groupType    : 0,
                groupName    : 'OVERALL',
                serverId     : serverID,
                serverName   : Comm.tuxInfoObj[serverID].name,
                serverType   : 'TUX',
                labelColor   : realtime.serverColorMap.TUX[serverID]
            };
        }

        // Host List
        for (ix = 0, ixLen = realtime.TuxHostList.length; ix < ixLen; ix++) {
            groupName = realtime.TuxHostList[ix];

            if (Ext.isEmpty(groupName)) {
                continue;
            }

            serverList[serverList.length] = {
                isTitle      : true,
                groupType    : 0,
                groupName    : groupName,
                serverId     : -1,
                serverName   : '',
                serverType   : 'TUX',
                labelColor   : ''
            };

            for (jx = 0; jx < serverCount; jx++) {
                serverID = Comm.tuxIdArr[jx];

                if (groupName === Comm.RTComm.getGroupNameByType(0, serverID)) {
                    serverList[serverList.length] = {
                        isTitle      : false,
                        groupType    : 0,
                        groupName    : groupName,
                        serverId     : serverID,
                        serverName   : Comm.tuxInfoObj[serverID].name,
                        serverType   : 'TUX',
                        labelColor   : realtime.serverColorMap.TUX[serverID]
                    };
                }
            }
        }

        // Business List
        for (ix = 0, ixLen = Comm.tuxBizGroups.length; ix < ixLen; ix++) {
            groupName = Comm.tuxBizGroups[ix];

            if (Ext.isEmpty(groupName)) {
                continue;
            }

            serverList[serverList.length] = {
                isTitle      : true,
                groupType    : 1,
                groupName    : groupName,
                serverId     : -1,
                serverName   : '',
                serverType   : 'TUX',
                labelColor   : ''
            };

            for (jx = 0; jx < serverCount; jx++) {
                serverID = Comm.tuxIdArr[jx];

                if (groupName === Comm.RTComm.getGroupNameByType(1, serverID)) {
                    serverList[serverList.length] = {
                        isTitle      : false,
                        groupType    : 1,
                        groupName    : groupName,
                        serverId     : serverID,
                        serverName   : Comm.tuxInfoObj[serverID].name,
                        serverType   : 'TUX',
                        labelColor   : realtime.serverColorMap.TUX[serverID]
                    };
                }
            }
        }

        this.menuBarGroup.setMenuList(serverList.concat());
        var rtmBase = Comm.RTComm.getRtmBaseContainer();

        this.menuBarGroup.frameChange = function() {
            rtmBase.frameChange(realtime.selectedTuxNames);
        };
        serverList = null;

        this.menuListGroup.add(this.menuBarGroup);

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this.menuBarGroup);
    },

    /**
     *
     * @param {} isSnapShot
     */
    frameDraw: function(isSnapShot) {
        this.frameStopDraw();

        var errorMsg;

        try {
            this.drawFrames();
        } catch (exception) {
            this.loadingMask.hide();

            // DEBUG CODE
            console.error(exception);

            errorMsg  = 'Error Message: ' + exception.message + '<br>';
            errorMsg += 'Error Name: '    + exception.name;

            common.Util.showMessage(common.Util.TR('ERROR'), errorMsg, Ext.Msg.OK, Ext.MessageBox.ERROR, function() {});
        } finally {
            if (! isSnapShot) {
                this.timer = setTimeout( this.frameDraw.bind(this) , this.interval );
            }

            isSnapShot = null;
        }
    },


    /**
     *
     */
    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    },


    /**
     * 메인 화면에 구성된 각 패널의 frameRefresh() 함수를 실행.
     */
    drawFrames: function() {
    },


    /**
     * 메인 화면에 구성된 각 패널의 frameOptionChange() 함수를 실행.
     */
    frameOptionChange: function() {
    },


    /**
     * 화면좌측 메뉴에서 서버 또는 그룹을 선택하는 경우 실행.
     * 선택된 서버에 해당하는 정보만 보여주게 실시간 컴포넌트 화면에 표시되는 서버 목록을 재설정한다.
     *
     * @param {string[]} serverList - 서버명 배열
     */
    frameChange: function(serverList) {
        var ix, ixLen;
        var windowComponent;

        var windowFloatingList = Ext.WindowManager.zIndexStack.items;
        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent &&
                    windowComponent.$className.indexOf('rtm.src.') === 0 &&
                    windowComponent.monitorType === 'TP' &&
                    windowComponent.frameChange) {

                    windowComponent.frameChange(serverList);

                    if (windowComponent.frameRefresh) {
                        windowComponent.frameRefresh();
                    }
                }
            }
        }

        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            if (this.dockLayer.dockList[ix].obj.frameChange) {
                this.dockLayer.dockList[ix].obj.frameChange(serverList);

                if (this.dockLayer.dockList[ix].obj.frameChange.frameRefresh) {
                    this.dockLayer.dockList[ix].obj.frameChange.frameRefresh();
                }
            }
        }

        for (ix = 0, ixLen = realtime.rtmPopupList.length; ix < ixLen; ix++) {
            if (realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameChange) {
                realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameChange(serverList);

                if (realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameChange.frameRefresh) {
                    realtime.rtmPopupList[ix].obj['IMX_POPUP'].app.frameChange.frameRefresh();
                }
            }
        }

        serverList = null;
    },


    /**
     * 좌측 메뉴에서 서버 선택.
     *
     * @param {string} serverName - 서버명
     */
    wasSelect: function(serverName) {

        if (Ext.isEmpty(serverName)) {
            Comm.selectedTuxArr.length = 0;
        }

        var serverId  = Comm.RTComm.getTuxIdByName(serverName);
        var isContain = Ext.Array.contains(Comm.selectedTuxArr, serverId);

        if (Comm.selectedTuxArr.length === Comm.tuxIdArr.length) {
            Comm.selectedTuxArr.length = 0;
            realtime.selectedTuxNames.length = 0;

            Comm.selectedTuxArr.push(serverId);
            realtime.selectedTuxNames.push(serverName);

        } else if (isContain || Ext.isEmpty(serverName)) {
            Ext.Array.remove(Comm.selectedTuxArr, serverId);
            Ext.Array.remove(realtime.selectedTuxNames, serverName);

            if (Comm.selectedTuxArr.length === 0) {
                Comm.selectedTuxArr = Comm.tuxIdArr.concat();
            }

        } else {
            Comm.selectedTuxArr.push(serverId);
            realtime.selectedTuxNames.push(serverName);
        }

        // 선택된 서버 와 모니터링 서버 갯수가 같은면 서버에 선택된 마크 표시를 지운다
        if (Comm.selectedTuxArr.length === Comm.tuxIdArr.length) {
            common.RTMDataManager.clearSelectedAgent();
            realtime.selectedTuxNames.length = 0;
        }

        this.selectedServerName = serverName;

        if (this.menuBarGroup && this.menuBarGroup.selectAgentList) {
            this.menuBarGroup.selectAgentList(serverId);
        }

        this.frameChange(realtime.selectedTuxNames);
    },


    /**
     * 서버 라벨 색상을 변경한다.
     */
    changeWasColor: function() {
        var ix, ixLen;

        this.menuBarGroup.changeLabelColor();

        var windowComponent;
        var windowFloatingList = Ext.WindowManager.zIndexStack.items;

        if (windowFloatingList.length) {
            // 윈도우 모드로 실행되어 있는 차트 컴포넌트에 대해서 변경된 색상 적용
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent &&
                    windowComponent.$className.indexOf('rtm.src.') === 0 &&
                    windowComponent.monitorType === 'TUX' &&
                    windowComponent.changeChartColors) {

                    windowComponent.changeChartColors();
                }
            }
        }

        // 차트에 표시되는 서버 색상을 변경
        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            if (this.dockLayer.dockList[ix].obj.changeChartColors) {
                this.dockLayer.dockList[ix].obj.changeChartColors();
            }
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

        var serverId;
        var data, ix, ixLen;
        if (Comm.rtmTuxShow === true) {

            for (ix = 0, ixLen = Comm.tuxIdArr.length; ix < ixLen; ix++) {
                serverId = Comm.tuxIdArr[ix];
                data = this.wasCpuMem[serverId];

                if (data) {
                    this.parseData(serverId, data);
                }
            }
            data = null;
            this.menuBarGroup.onData(this.wasStatData.concat());
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 1000);
    },


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
     * @param {number} serverId - Server ID
     * @param {array} data - CPU, Memory Data
     */
    parseData: function(serverId, data) {
        var index   = -1;
        var ix, ixLen;

        if (!this.wasStatDataCache) {
            this.wasStatDataCache = [];
        }

        var wasStatData = this.wasStatDataCache[serverId];

        if (!wasStatData) {
            for (ix = 0, ixLen = this.wasStatData.length; ix < ixLen; ix++) {
                if (serverId === this.wasStatData[ix].wasID) {
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
                wasID        : serverId,
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
            this.wasStatDataCache[serverId] = this.wasStatData[index];
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

        data          = null;
        wasStatData   = null;
    },


    /**
     * 실시간 화면에 도킹되어 있는 각 콤포넌트 화면에서 실행되는 Draw 를 실행함.
     */
    startFrameDraw: function() {
        var ix, ixLen,
            windowFloatingList, windowComponent;

        if (!this.dockLayer || !Comm.rtmTuxShow) {
            return;
        }

        windowFloatingList = Ext.WindowManager.zIndexStack.items;
        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent && windowComponent.frameRefresh && windowComponent.openViewType === 'TUX') {

                    if (windowComponent.title === common.Util.TR('Activity Monitor') && Comm.rtmTuxShow) {
                        windowComponent.init();
                    }
                    windowComponent.frameRefresh();
                }
            }
        }

        // Tuxedo 모니터링 화면에 표시되고 있는 각 컴포넌트를 새로고침한다.
        for (ix = 0, ixLen = this.dockLayer.dockList.length; ix < ixLen; ix++) {
            if (this.dockLayer.dockList[ix].obj.frameRefresh) {
                if (this.dockLayer.dockList[ix].obj.frameStopDraw) {
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

        if (this.menuBarGroup.startAnimationFrame) {
            this.menuBarGroup.startAnimationFrame();
        }
    },


    /**
     * 실시간 화면에 도킹되어 있는 각 콤포넌트 화면에서 실행되는 Draw 를 중지함.
     */
    stopFrameDraw: function() {
        var ix, ixLen,
            windowFloatingList, windowComponent;

        if (!this.dockLayer) {
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

        if (this.menuBarGroup.stopAnimationFrame) {
            this.menuBarGroup.stopAnimationFrame();
        }
    },


    handleVisibilityChange: function() {
        if (document.hidden) {
            this.stopFrameDraw();
        } else {
            this.startFrameDraw();
        }
    },

    /**
     * PA 화면구성에 필요한 기본 데이터 설정 및 변환
     */
    resetPAWebInfo: function() {
        var isExecuteReconfig = false;

        var get_pa_info = function() {
            var keys = Object.keys(Comm.web_env_info);
            var envData, ix, ixLen;

            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                if (keys[ix].indexOf('pa_') !== 0) {
                    continue;
                }

                envData = Comm.web_env_info[keys[ix]];

                if (!Ext.isObject(envData) && !Ext.isArray(envData)) {
                    try {
                        Comm.web_env_info[keys[ix]] = JSON.parse(envData);
                    } catch (e) {
                        console.debug('%c [RTM TuxView] Is String format data.', 'color:blue;', envData);
                    }
                }
            }
        };

        var default_stat, default_stat_id;

        if (!Comm.web_env_info['pa_tux_performance_trend_stat_Default']) {

            //Performance Trend
            default_stat = JSON.stringify([
                'cur_servers'
                ,'wkqueued'
                ,'req'
                ,'wkcompleted'
            ]);

            default_stat_id = JSON.stringify([
                'cur_servers'
                ,'wkqueued'
                ,'req'
                ,'wkcompleted'
            ]);

            common.WebEnv.insert_config('pa_tux_performance_trend_types',     'Default');
            common.WebEnv.insert_config('pa_tux_performance_trend_last_type', 'Default');

            common.WebEnv.insert_config('pa_tux_performance_trend_stat', default_stat, 'Default');
            common.WebEnv.insert_config('pa_tux_performance_trend_stat_id', default_stat_id, 'Default');

            isExecuteReconfig = true;

            default_stat = null;
            default_stat_id = null;
        } else {
            if (Comm.web_env_info['pa_tux_performance_trend_last_type'] == null) {
                common.WebEnv.insert_config('pa_tux_performance_trend_last_type', 'Default');
            }
            if (Comm.web_env_info['pa_tux_performance_trend_types'] == null) {
                common.WebEnv.insert_config('pa_tux_performance_trend_types', 'Default');
            }
        }

        if (!Comm.web_env_info['pa_tux_performance_trend_all_stat_Default']) {
            default_stat = JSON.stringify([
                'cur_servers'
                ,'wkqueued'
                ,'req'
                ,'wkcompleted'
                ,'num_tran'
            ]);

            default_stat_id = JSON.stringify([
                'cur_servers'
                ,'wkqueued'
                ,'req'
                ,'wkcompleted'
                ,'num_tran'
            ]);

            common.WebEnv.insert_config('pa_tux_performance_trend_all_types',     'Default');
            common.WebEnv.insert_config('pa_tux_performance_trend_all_last_type', 'Default');

            common.WebEnv.insert_config('pa_tux_performance_trend_all_stat', default_stat, 'Default');
            common.WebEnv.insert_config('pa_tux_performance_trend_all_stat_id', default_stat_id, 'Default');

            isExecuteReconfig = true;
        }

        var default_comparison_stat, default_comparison_stat_id;

        if (!Comm.web_env_info['pa_tux_comparison_stat_Default']) {
            default_comparison_stat = [
                'cur_servers'
                ,'wkqueued'
                ,'req'
                ,'wkcompleted'
            ];

            default_comparison_stat_id = [
                'cur_servers'
                ,'wkqueued'
                ,'req'
                ,'wkcompleted'
            ];

            common.WebEnv.insert_config('pa_tux_comparison_types',     'Default');
            common.WebEnv.insert_config('pa_tux_comparison_last_type', 'Default');

            common.WebEnv.insert_config('pa_tux_comparison_stat'   , default_comparison_stat  , 'Default');
            common.WebEnv.insert_config('pa_tux_comparison_stat_id', default_comparison_stat_id, 'Default');

            isExecuteReconfig = true;

            default_comparison_stat = null;
            default_comparison_stat_id = null;
        }

        if (isExecuteReconfig === true) {
            get_pa_info();
        }

    }
});
