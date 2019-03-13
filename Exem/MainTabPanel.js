/**
 * Created by JONGHO on 14. 7. 4.
 */
Ext.define('Exem.MainTabPanel', {
    extend : 'Ext.tab.Panel',
    id     : 'mainTab',
    itemId : 'mainTab',
    region : 'center',
    deferredRender: false,
    layout : 'fit',
    border : false,
    plain  : true,
    plugins: [
        Ext.create('Ext.ux.TabReorderer'),
        Ext.create('Ext.ux.TabCloseMenu', {
            pluginId            : 'mainTabCloseMenu',
            closeTabText        : common.Util.TR('Close Tab'),
            closeOthersTabsText : common.Util.TR('Close Other Tabs'),
            closeAllTabsText    : common.Util.TR('Close All Tabs')
    })],
    cls    : 'maintab',
    tabBar : {
        height: 60
    },
    constructor: function() {
        this.callParent(arguments);

        this.getTabBar().layout.overflowHandler.scrollIncrement = 100;
    },

    setRightScrollPosition: function() {
        var tabDom = this.getTabBar().el.dom;
        var tabsWidth = tabDom.getElementsByClassName('x-tab-bar-body')[0].offsetWidth - 20;
        var tabs = tabDom.getElementsByClassName('x-tab');
        var rightScroll = tabDom.getElementsByClassName('x-box-scroller-right')[0];
        var leftPos = 39 ;

        for (var ix = 0, ixLen = tabs.length; ix < ixLen; ix++) {
            leftPos += tabs[ix].offsetWidth;
        }

        rightScroll.style.left = Math.min(leftPos, tabsWidth) + 'px';
    },

    listeners: {
        afterrender: function() {
            Ext.create('Ext.util.KeyNav', window, {
                scope: this,
                backspace: function(e) {
                    var targetDom = e.target;
                    var contentEditable = targetDom.contentEditable;
                    var isTextfieldDom = (targetDom.tagName === 'INPUT' || targetDom.tagName === 'TEXTAREA');

                    if ((isTextfieldDom && targetDom.type !== 'button') || contentEditable === '' || contentEditable === 'true') {
                        // No work.
                    } else {
                        e.stopEvent();

                        var tabIndex = this.items.findIndex('id', this.getActiveTab().id);

                        if (+tabIndex !== -1 && +tabIndex !== 0) {
                            this.setActiveTab(0);
                        }
                    }
                }
            });
        },
        contextmenu: {
            element: 'el',
            fn: function() {
                try {
                    var classList = window.tabPanel.getPlugin('mainTabCloseMenu').menu.el.dom.classList;
                    if (!classList.contains('maintab-closemenu')) {
                        classList.add('maintab-closemenu');
                    }
                    var mainTabContextMenus = window.tabPanel.getPlugin('mainTabCloseMenu').menu.items.items;
                    var tpCheckMenu, webCheckMenu, e2eCheckMenu, cdCheckMenu, closeMenu;

                    if (mainTabContextMenus.length === 4 && common.Menu.useRealtimeMultiTab) {
                        var menuIndex = 0;
                        var tabMenuIndex = 0;

                        // WAS Context
                        var wasIdArr = Comm.RTComm.getServerIdArr('WAS');

                        if (wasIdArr.length > 0) {
                            window.tabPanel.getPlugin('mainTabCloseMenu').menu.insert(menuIndex, [{
                                xtype: 'menucheckitem',
                                text : common.Util.TR('WAS Monitor'),
                                checked: true,
                                disabled: true,
                                tabMenuIndex: tabMenuIndex++
                            }, {
                                xtype: 'menuseparator',
                                cls  : 'dotline'
                            }]);
                        } else {
                            // WAS 메뉴가 기본으로 보여지는 것을 기반으로 처리가 되어있던 것을 보여지지 않게
                            // 처리를 하게되면서 처리함
                            menuIndex = -2;
                        }

                        // TP
                        if (Comm.tpIdArr.length > 0) {
                            tpCheckMenu = Ext.create('Ext.menu.CheckItem', {
                                text : common.Util.TR('TP Monitor'),
                                checked: true,
                                disabled: (tabMenuIndex === 0),
                                tabMenuIndex: tabMenuIndex++,
                                handler: function() {
                                    if (tabPanel.activeTab.title === this.text) {
                                        window.tabPanel.setActiveTab(0);
                                    }
                                    window.tabPanel.getTabBar().items.items[this.tabMenuIndex].setVisible(this.checked);
                                    window.tabPanel.updateLayout();
                                }
                            });

                            menuIndex += 2;
                            window.tabPanel.getPlugin('mainTabCloseMenu').menu.insert(menuIndex, [tpCheckMenu, {
                                xtype: 'menuseparator',
                                cls  : 'dotline'
                            }]);
                        }

                        // WEB
                        if (Comm.webIdArr.length > 0) {
                            webCheckMenu = Ext.create('Ext.menu.CheckItem', {
                                text : common.Util.TR('Web Monitor'),
                                checked: true,
                                disabled: (tabMenuIndex === 0),
                                tabMenuIndex: tabMenuIndex++,
                                handler: function() {
                                    if (tabPanel.activeTab.title === this.text) {
                                        window.tabPanel.setActiveTab(0);
                                    }
                                    window.tabPanel.getTabBar().items.items[this.tabMenuIndex].setVisible(this.checked);
                                    window.tabPanel.updateLayout();
                                }
                            });

                            menuIndex += 2;
                            window.tabPanel.getPlugin('mainTabCloseMenu').menu.insert(menuIndex, [webCheckMenu, {
                                xtype: 'menuseparator',
                                cls  : 'dotline'
                            }]);
                        }

                        // C Daemon
                        if (Comm.cdIdArr.length > 0) {
                            cdCheckMenu = Ext.create('Ext.menu.CheckItem', {
                                text : common.Util.TR('C Daemon Monitor'),
                                checked: true,
                                disabled: (tabMenuIndex === 0),
                                tabMenuIndex: tabMenuIndex++,
                                handler: function() {
                                    if (tabPanel.activeTab.title === this.text) {
                                        window.tabPanel.setActiveTab(0);
                                    }
                                    window.tabPanel.getTabBar().items.items[this.tabMenuIndex].setVisible(this.checked);
                                    window.tabPanel.updateLayout();
                                }
                            });

                            menuIndex += 2;
                            window.tabPanel.getPlugin('mainTabCloseMenu').menu.insert(menuIndex, [cdCheckMenu, {
                                xtype: 'menuseparator',
                                cls  : 'dotline'
                            }]);
                        }

                        // E2E
                        if (Comm.tpIdArr.length > 0 || Comm.webIdArr.length > 0) {
                            e2eCheckMenu = Ext.create('Ext.menu.CheckItem', {
                                text : common.Util.TR('EtoE Monitor'),
                                checked: true,
                                tabMenuIndex: tabMenuIndex++,
                                handler: function() {
                                    if (tabPanel.activeTab.title === this.text) {
                                        window.tabPanel.setActiveTab(0);
                                    }
                                    window.tabPanel.getTabBar().items.items[this.tabMenuIndex].setVisible(this.checked);
                                    window.tabPanel.updateLayout();
                                }
                            });

                            menuIndex += 2;
                            window.tabPanel.getPlugin('mainTabCloseMenu').menu.insert(menuIndex, [e2eCheckMenu, {
                                xtype: 'menuseparator',
                                cls  : 'dotline'
                            }]);
                        }

                        // Menu Expand & Collapse
                        if (Comm.tpIdArr.length > 0 || Comm.webIdArr.length > 0) {
                            closeMenu = Ext.create('Ext.menu.Item', {
                                text : common.Util.TR('Menu Collapse'),
                                menuExpand: true,
                                handler: function() {
                                    this.menuExpand = !this.menuExpand; 
                                    Comm.RTComm.toggleVisibleTab(this.menuExpand);
                                    if (!this.menuExpand) {
                                        this.setText(common.Util.TR('Menu Expand'));
                                        window.tabPanel.setActiveTab(0);
                                    } else {
                                        this.setText(common.Util.TR('Menu Collapse'));

                                        for (var ix = 0; ix < tabMenuIndex; ix++) {
                                            window.tabPanel.getTabBar().items.items[ix].setVisible(true);
                                        }
                                    }
                                }
                            });

                            menuIndex += 2;
                            window.tabPanel.getPlugin('mainTabCloseMenu').menu.insert(menuIndex, [closeMenu, {
                                xtype: 'menuseparator'
                            }]);
                        }
                    }
                } catch (e) {
                    console.debug('');
                }
            }
        },
        // arguments: me, component, index
        add: function(me, component) {
            component.addListener('resize', function() {
                this.setRightScrollPosition();
            }, this);

            me.focus();
        },
        beforetabchange: function(tabPanel, newCard, oldCard) {
            // WAS 모니터링 화면을 표시하지 않는데 WAS 모니터링 화면으로 이동을 하려고 하는 경우 예외처리함.
            if (newCard.$className === 'rtm.view.rtmView' && realtime.rtmViewList && realtime.rtmViewList.indexOf('WAS') === -1) {
                // 실제로 화면에 보여지는 첫번째 화면으로 이동하여 보여주게 처리함.
                tabPanel.setActiveTab(1);

                // false를 반환하여 setActiveTab 함수가 실행되지 않게 처리함.
                // false를 반환하지 않으면 setActiveTab 이 실행되면서 WAS 모니터링 화면으로 전환되는 처리가
                // 실행되므로 fasle 를 반환하게함.
                return false;
            }
        },
        tabchange: function(tabPanel, newCard, oldCard) {

            Comm.RTComm.checkMonitorViewType(newCard.$className);
            if (oldCard && oldCard.monitorType) {
                window.prevMonitorType = oldCard.monitorType;
            }
            else {
                window.prevMonitorType = null;
            }

            if (oldCard && realtime.rtmViewClassList.indexOf(oldCard.$className) !== -1) {
                oldCard.stopFrameDraw();

                common.Util.hideComponentWindow(oldCard.$className);
            }

            if (realtime.rtmViewClassList.indexOf(newCard.$className) !== -1) {
                newCard.startFrameDraw();

                common.Util.destroyConfigComponentWindow();

                common.Util.showComponentWindow(newCard.$className);
            }

            if (this.isBackspaceEvent !== true) {
                this.items.findIndex('id', this.getActiveTab().id);

            } else {
                this.isBackspaceEvent = false;
            }

            this.setSize(window.innerWidth, window.innerHeight);
        },
        resize: function(){
            this.setRightScrollPosition();
        },
        afterlayout: function(){
            this.setRightScrollPosition();
        }
    }
});
