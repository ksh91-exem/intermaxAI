Ext.define('rtm.view.rtmBizView', {
    extend: 'view.baseView',
    width : '100%',
    height: '100%',
    baseMargin : '0 10 0 5',
    cls   : 'rtm-base biz',

    timerInc      : null,

    timer         : null,
    isStop        : false,
    isCreateView  : false,

    listeners: {
        beforedestroy: function(){

            if (this.menuBarGroup) {
                common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, this.menuBarGroup);
            }

            Comm.rtmBizShow = false;

            realtime.isAddRtmBizView = false;
        },
        hide: function() {
            Comm.rtmBizShow = false;
        },
        show: function() {
            if (this.isDestroyStart) {
                return;
            }

            Comm.rtmBizShow = true;

            window.isLockRTMFrame = Comm.RTComm.getBooleanValue(Comm.web_env_info.rtm_biz1_frame_lock);

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

    iniProperty: function() {

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

        this.bindEvent();
    },


    /**
     * 실시간 모니터링 화면의 잠금 여부를 체크 및 설정.
     */
    setRealtimeViewLock: function() {
        if (!Comm.web_env_info.rtm_biz1_frame_lock) {
            common.WebEnv.Save('rtm_biz1_frame_lock', true);
            window.isLockRTMFrame = true;

        } else {
            window.isLockRTMFrame = (Comm.web_env_info.rtm_biz1_frame_lock.toLowerCase() === 'true');

            this.setFrameLock(window.isLockRTMFrame);
        }
    },


    loadViews: function() {

        this.createView();

        this.setRealtimeViewLock();

        this.loadingMask.hide();

        Comm.RTComm.checkServerStatusObject();
    },


    /**
     * 화면에 보여지는 각 레이어 화면 생성
     */
    createView: function() {
        var defaultLayer;
        this.changeViews.setVisible(false);

        this.frameLockArea.setVisible(true);

        var baseCon = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'fit'
        });
        this.body.add(baseCon);

        if (Comm.RTComm.checkChangeDefaultBizLayout) {
            Comm.RTComm.checkChangeDefaultBizLayout(this.rec);
        }

        if (this.rec === 'dashboard.TaskMonitor') {
            defaultLayer = Comm.RTComm.getDockLayer('TaskMonitor');
        } else {
            defaultLayer = Comm.RTComm.getDockLayer('TaskMonitor2');
        }

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

        window.imxBizDockLayerBaseId = this.dockSite.id;
        window.imxBizBaseViewId      = this.id;
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
     * 실시간 화면에 도킹되어 있는 각 콤포넌트 화면에서 실행되는 Draw 를 실행함.
     */
    startFrameDraw: function() {
        var ix, ixLen,
            windowFloatingList, windowComponent;

        if (!this.dockLayer || !Comm.rtmBizShow) {
            return;
        }

        windowFloatingList = Ext.WindowManager.zIndexStack.items;
        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent && windowComponent.frameRefresh && windowComponent.openViewType === 'E2E') {

                    if (windowComponent.title === common.Util.TR('Activity Monitor') && Comm.rtmBizShow) {
                        windowComponent.init();
                    }
                    windowComponent.frameRefresh();
                }
            }
        }

        // 실시간 모니터링 화면에 표시되고 있는 각 컴포넌트를 새로고침한다.
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

    },


    handleVisibilityChange: function(){
        if (document.hidden) {
            this.stopFrameDraw();
        } else {
            this.startFrameDraw();
        }
    }

});
