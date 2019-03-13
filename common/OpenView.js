Ext.define('common.OpenView', {
    singleton: true,

    /**
     *  param 예제
     *  {
     *     fromTime : '2014-01-01 09:00:00',
     *     toTime   : '2014-01-01 10:00:00',
     *     wasId    : 1,
     *     itemId1  : value1,
     *     itemId2  : value2,
     *     config   : {
     *         padding  : '5 5 5 5',
     *         html     : 'test html'
     *     }
     * }
     */
    open: function(srcName, param, isNotJump) {
        var title, type;
        var ix, ixLen;

        if (srcName === 'Realtime') {
            if (window.RTMShow) {
                return;
            } else if (window.RTMShow == undefined) {
                window.RTMShow = true;
            }
        }

        if (window.rtmMonitorType) {
            if (!param.config) {
                param.config = {};
            }

            param.config.monitorType = window.rtmMonitorType;
        }

        var view = this._createView(srcName, param.config);

        if (!view) {
            return;
        }

        if (view.title === common.Util.TR('Configuration')) {
            if (!realtime.viewConfig) {
                realtime.viewConfig = true;
            } else {
                // Configuration 화면을 활성화
                for (ix = 0, ixLen = Ext.getCmp('mainTab').items.items.length; ix < ixLen; ix++) {
                    if (view.title === Ext.getCmp('mainTab').items.items[ix].title) {
                        Ext.getCmp('mainTab').setActiveTab(ix);
                        break;
                    }
                }
                return;
            }
        }

        if (param.isWindow) {
            if (!param.width || !param.height) {
                console.warn('[OpenView] window size is undefined');
                return null;
            }

            if (param.config.isDock) {
                param.view = view;
                this._showDockWindow(param);
            } else {
                this._showWindow(view, param.width, param.height, param.config.minWidth, param.config.minHeight);
            }

            this.loadingMask = Ext.create('Exem.LoadingMask', {
                target: view
            });
            this.loadingMask.show(null, true);

        } else {
            this._addToMainTab(view);

            if (isNotJump) {
                window.prevMonitorType = null;
            }

            if (view.title !== 'Configuration' && view.title !== common.Util.TR('Configuration')) {

                // 컴포넌트 화면에서 PA화면으로 연계 시 지정된 화면 타입이 있는 경우 해당 타입의 PA 화면으로
                // 연계되어 보여지게 수정함.
                if (param.monitorType) {
                    type = param.monitorType;
                    window.prevMonitorType = type;

                } else if (window.prevMonitorType) {
                    type = window.prevMonitorType;

                } else {
                    type = window.rtmMonitorType;
                }

                if (type === 'TP' || type === 'WEB' || type === 'CD') {
                    title = type + ' ' + view.title;
                } else {
                    title = view.title;
                }

                window.tabPanel.getActiveTab().tab.setText(title);
                view.title = title;
            }

            this.loadingMask = Ext.create('Exem.LoadingMask', {
                target: view,
                type  : 'large-whirlpool'
            });
            this.loadingMask.showMask();
        }

        common.DataModule.timeInfo.lastFormType = srcName;
        setTimeout(function() {
            view.init();
            this._setFieldsValue(view, param);
            this.loadingMask.hide();

        }.bind(this), 10);

        return view;

    },

    onMenuItemClick: function(treeview, rec, pgid) {
        var srcName = rec.substring(rec.lastIndexOf('.') + 1);
        var index;
        var classConfig;
        var param;
        var link;

        if (pgid === 'E2EMonitor') {

            if (rec === 'dashboard.TaskMonitorWas') {
                link = document.createElement('a');
                link.rel = 'noreferrer';
                link.href = common.Menu.useBizDashURL;
                link.target = '_blank';
                link.click();
                return;
            }

            // 업무 모니터링 화면이 추가되지 않은 경우
            if (!realtime.isAddRtmBizView) {

                Comm.RTComm.addBizMonitoringView(rec);

                realtime.isAddRtmBizView = true;

            } else {
                // 업무 모니터링 화면이 추가된 경우
                if (Comm.rtmBizShow !== true) {
                    index = realtime.rtmViewList.length;
                    window.tabPanel.setActiveTab(index);
                }

                setTimeout(function(srcName) {
                    Comm.RTComm.setRTMTabSubTitle(realtime.MenuTextKeys[srcName]);
                    Comm.rtmBizShow = true;
                    this._loadRealView(srcName);
                }.bind(this, srcName), 100);
            }

            return;
        }


        if (pgid === 'Dashboard') {
            realtime.isDashboardView = true;

            if (Comm.RTComm.isRTMShow() !== true) {
                index = Comm.RTComm.getRtmViewIndexByType();
                window.tabPanel.setActiveTab(index);
            }

            setTimeout(function(srcName) {
                Comm.RTComm.setRTMTabSubTitle(realtime.MenuTextKeys[srcName]);
                this._loadRealView(srcName);
            }.bind(this, srcName), 100);

            return;
        }

        classConfig = common.Menu.getClassConfig(srcName);
        param = {};

        if (window.jumpMonitorType) {
            window.jumpMonitorType = null;
        }

        if (classConfig['isWindow'] === true) {
            param.isWindow = true;
            param.width = classConfig['width'];
            param.height = classConfig['height'];
            param.minWidth = classConfig['minWidth'];
            param.minHeight = classConfig['minHeight'];
        }

        param.config = classConfig;
        this.open(srcName, param, true);
    },

    onMenuPopup: function(rec, options) {
        var srcName = rec.substring(rec.lastIndexOf('.') + 1),
            classConfig = common.Menu.getClassConfig(srcName),
            param = {};

        try {
            if (classConfig['isWindow']) {
                param.isWindow  = true;
                param.width     = classConfig['width'];
                param.height    = classConfig['height'];
                param.minWidth  = classConfig['minWidth'];
                param.minHeight = classConfig['minHeight'];
            }

            param.config = classConfig;

            param.config.isDock   = true;
            param.config.isExpand = true;
            param.config.isTool   = true;
            param.config.floatingLayer = true;
            param.config.options = options;

            return this.open(srcName, param);
        } finally {
            param        = null;
            srcName      = null;
            classConfig  = null;
        }
    },

    _loadRealView: function(type) {
        var dockLayerId = Comm.RTComm.getBaseDockLayerId();

        //if (window.imxDockLayerBaseId && Ext.getCmp(window.imxDockLayerBaseId)) {
        if (dockLayerId && Ext.getCmp(dockLayerId)) {
            this.loadingMask = Ext.create('Exem.LoadingMask', {
                //target: Ext.getCmp(window.imxDockLayerBaseId),
                target: Ext.getCmp(dockLayerId),
                type  : 'large-whirlpool'
            });
            this.loadingMask.show(null, true);

            setTimeout(function() {
                //Ext.getCmp(window.imxDockLayerBaseId).loadDashboardLayer(type);
                Ext.getCmp(dockLayerId).loadDashboardLayer(type);
                this.loadingMask.hide();
                this.loadingMask.target = null;
            }.bind(this), 50);
        }
    },

    _createView: function(srcName, classConfig) {
        var menuData = this._getMenuData(srcName);
        var configName, view;

        if (menuData) {

            if (menuData.config.singleton && common.Menu.singletonList[menuData.classFullName]) {
                common.Menu.singletonList[menuData.classFullName].focus();
                return;
            }

            for (configName in classConfig) {
                if (classConfig.hasOwnProperty(configName)) {
                    menuData.config[configName] = classConfig[configName];
                }
            }

            view = Ext.create(menuData.classFullName, menuData.config);

            if (menuData.config.singleton) {
                view.addListener('destroy', function() {
                    if (common.Menu.singletonList[this.$className]) {
                        delete common.Menu.singletonList[this.$className];
                    }
                });

                common.Menu.singletonList[menuData.classFullName] = view;
            }

            menuData = null;
            classConfig = null;
            srcName = null;

            return view;
        } else {
            //classConfig = null
            //srcName = null
            return Ext.create('view.' + srcName, classConfig);
        }
    },

    _getMenuData: function(srcName) {
        var menuDataAll;
        var tmpMenu;
        var ix;
        var config;

        menuDataAll = common.Menu.mainMenuData;

        var oList = Object.keys(menuDataAll);

        for (ix = 0; ix < oList.length; ix ++ ) {
            tmpMenu = menuDataAll[ oList[ix] ];

            if ( tmpMenu.cls.substring(tmpMenu.cls.lastIndexOf('.') + 1) == srcName ) {
                config = common.Menu.getClassConfig(srcName) || {};

                config.title = common.Util.TR(tmpMenu.text);

                return {classFullName: tmpMenu.cls, config: config};
            }
        }
        return null;
    },

    _addToMainTab: function(view) {
        var viewPort = Ext.getCmp('viewPort');
        var ix;

        view.closable = true;

        if (view.title === 'Configuration') {
            if (window.CFGShow) {
                // .../Intermax/Config/ 경로로 들어가게 되면 탭으로 생성될 때 닫기 버튼이 사라지게 한다.
                // 일반적인 경우엔 RTM 이나 PA 상태일 때 Configuration 화면으로 들어가는 경우엔 닫기 버튼이 보여진다.
                view.closable = false;
            }

            for (ix = 0; ix < viewPort.getComponent('mainTab').items.items.length; ix++) {
                if (view.title === viewPort.getComponent('mainTab').items.items[ix].title) {
                    viewPort.getComponent('mainTab').setActiveTab(ix);
                    break;
                }
            }
        }

        viewPort.getComponent('mainTab').add( view );
        viewPort.getComponent('mainTab').setActiveTab(view);

        viewPort = null;
        view = null;
    },

    _showWindow: function(view, width, height, minWidth, minHeight) {
        var window = Ext.create('Exem.XMWindow',{
            title : view.title,
            layout: 'fit',
            width: width,
            height: height,
            minWidth : minWidth,
            minHeight: minHeight
        });
        window.add(view);
        window.show();
    },

    _showDockWindow: function(param) {
        var windowMargin = 26;
        var windowTitleMargin = 30;
        param.view.floatingLayer = true;

        var win = Ext.create('Exem.XMWindow',{
            title       : param.view.title,
            layout      : 'fit',
            width       : param.width + windowMargin,
            height      : param.height + windowMargin,
            minWidth    : param.minWidth + windowMargin,
            minHeight   : param.minHeight + windowMargin + windowTitleMargin,
            draggable   : false,
            constrain   : true,
            floating    : {shadow: false},
            items       : param.view,
            isDock      : true,
            cls         : 'xm-dock-window-base'
        });

        win.show();



        if (! param.config.isTool) {
            $('#' + win.id).draggable({
                scroll: false,
                handle: '#' + win.header.id,
                create: function() {
                    $(this).addClass('xm-floating-layer');
                },
                start: function() {
                    $(this).addClass('xm-dragging').data('xmView')._isDragging = true;
                },
                drag: function() {
                    //self.$direct.fadeIn('fast')
                },
                stop: function() {
                    $(this).removeClass('xm-dragging').data('xmView')._isDragging = false;
                    //self.$direct.fadeOut('fast')
                }
            }).data('xmView', param.view).data('window', win);

        } else {
            $('#' + win.id).draggable({
                handle: '#' + win.header.id
            });
        }

        param = null;
        win = null;

    },

    _setFieldsValue: function(view, param) {
        var conArea = view.conditionArea;
        var itemId;
        var field = null;

        delete param.width;
        delete param.height;
        delete param.isWindow;
        delete param.config;

        if (conArea === undefined) {
            // stat/event/ratio 만 form left condition.
            conArea = view.componentArea;
        }

        for (itemId in param) {
            if (param.hasOwnProperty(itemId)) {
                if (typeof param[itemId] !== 'number' && !param[itemId]) {
                    continue;
                }
                switch (itemId) {
                    case 'fromTime':
                        view.datePicker.mainFromField.setValue(param.fromTime);
                        break;
                    case 'toTime':
                        view.datePicker.mainToField.setValue(param.toTime);
                        break;
                    case 'wasId':

                        if ( param.wasId.toString().split(',').length > 1 ) {
                            conArea.getComponent('wasCombo').selectByIndexs(param.wasId);
                        } else {
                            conArea.getComponent('wasCombo').selectByValue(param.wasId);
                        }
                        break;

                    case 'dbName':
                        conArea.getComponent('dbCombo').selectByName(param.dbName);
                        break;
                    case 'dbId':
                        conArea.getComponent('dbCombo').selectByValue(Number(param.dbId));
                        break;
                    default:
                        if (conArea) {
                            field = conArea.getComponent(itemId);
                        }

                        if (field != null && typeof field != 'undefined') {
                            field.setValue(param[itemId]);
                        } else {
                            //console.debug(itemId, 'is undefined!')
                        }
                        break;
                }
            }
        }
    }

    /** 현재 사용하지 않는 코드 주석처리.
     saveDockWindowToOwner: function(view){
        var mainTab = Ext.getCmp('mainTab');
        var activeTab = mainTab.getActiveTab();
        var rtmMenu = null;

        if(activeTab){
            rtmMenu = common.Menu.RTMMenu;

            for (var ix = 0, ixLen = rtmMenu.length; ix < ixLen; ix++) {
                if (rtmMenu[ix].isDockContainer && rtmMenu[ix].cls == activeTab.$className) {
                    var dockContainer = activeTab.down('dockcontainer');
                    if (dockContainer) {
                        dockContainer.addDockList(view);
                    }
                    return;
                }
            }
        }

        view = null;
        activeTab = null;
        mainTab = null;
        rtmMenu = null;
    },



     * @param className full class name (ex.. view.SummaryView)
     * @returns {Array}

     getOpenView: function(className){
        var mainTab = Ext.getCmp('mainTab');

        if(! mainTab){
            return;
        }

        var result = [];
        var items = mainTab.items.items;

        for(var ix = 0, ixLen = items.length; ix < ixLen; ix++){
            if(items[ix].$className == className){
                result.push(items[ix]);
            }
        }

        return result;
    }
     */
});
