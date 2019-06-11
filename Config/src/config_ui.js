Ext.define('config.config_ui', {
    extend: 'Exem.Form',
    width: '100%',
    height: '100%',
    border: false,
    style: { background: '#ffffff' },
    listeners: {
        destroy: {
            fn: function() {
                realtime.viewConfig = false;
            }
        }
    },

    create_layout: function() {
        var self = this;

        var usefont = function(size, text) {
            return '<span style="font-family: Roboto Condensed; font-size: ' + size + 'px">' + text + '</span>';
        };

        /**
         this.shortcut_panel = Ext.create('Ext.panel.Panel', {
            layout: { type: 'hbox', align: 'middle', pack: 'start' },
            width: '100%',
            height: 32,
            bodyStyle: { background: '#cccccc' },
            items: [{
                xtype: 'button',
                text: usefont(12, common.Util.TR('SMS Schedule Manager')),
                width: 150,
                height: 25,
                cls: 'x-btn-config-default',
                listeners: {
                    click: function() {
                        var smsschedule_form = Ext.create('config.config_alert_smsschedulemgr');
                        smsschedule_form.init(self);
                    }
                }
            }, {
                xtype: 'panel',
                layout: { type: 'hbox', align: 'middle', pack: 'end' },
                border: false,
                height: 25,
                flex: 1,
                items: [{
                    xtype: 'button',
                    text: usefont(12, common.Util.TR('Realtime')),
                    width: 150,
                    height: 25,
                    cls: 'x-btn-config-default',
                    listeners: {
                        click: function() {
                            location.URL = location.origin + '/' + location.pathname.split('/')[1];
                            location.reload();
                        }
                    }
                }, {
                    xtype: 'button',
                    text: usefont(12, common.Util.TR('Performance Analyzer')),
                    width: 150,
                    height: 25,
                    cls: 'x-btn-config-default',
                    listeners: {
                        click: function() {
                            location.URL = location.origin + '/'+location.pathname.split('/')[1]+'/PA';
                            location.reload();
                        }
                    }
                }]
            }]
        });
         **/

        this.area = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            items: [{
                xtype: 'container',
                layout: 'border',
                width: '100%',
                flex: 1,
                items: [{
                    title: usefont(12, common.Util.TR('Menu')),
                    layout: {
                        type: 'accordion',
                        hideCollapseTool: true
                    },
                    region: 'west',
                    floatable: false,
                    collapsible: true,
                    margins: '0 0 0 0',
                    width: 200,
                    minWidth: 150,
                    maxWidth: 400,
                    split: true,
                    items: [{
                        title: usefont(12, common.Util.TR('Configuration')),
                        id: 'cfg_menu_configuration'
                    }]
                }, {
                    title: '',
                    region: 'center',
                    id: 'cfg_tab_body',
                    layout: 'fit',
                    collapsible: false,
                    margins: '0 0 0 0',
                    bodyStyle: {
                        background: '#f4f4f4'
                    }
                }],
                style: {
                    background: '#e7e7e7'
                }
            }]
        });

        this.treeConfigPanel = Ext.create('Ext.tree.Panel', {
            layout: 'fit',
            border: false,
            width : 200,
            height: '100%',
            store : Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true,
                    children: [
                        { text: common.Util.TR('System Settings')           , id: 'config_system_setting'         , leaf: true },
                        { text: common.Util.TR('Training Settings')         , id: 'config_training_setting'      , leaf: true },
                        { text: common.Util.TR('Business Calendar Settings'), id: 'config_bizcal_setting'         , leaf: true },
                        { text: common.Util.TR('Failure History Settings')  , id: 'config_failure_history_setting', leaf: true },
                        { text: common.Util.TR('Metric Settings')           , id: 'config_metric_setting'         , leaf: true }
                    ]
                }
            }),
            rootVisible: false,
            listeners: {
                itemclick: function(s, r) {
                    self.menuClick(s, r);
                }
            }
        });

        var tabPanel = Ext.create('Ext.tab.Panel', {
            plugins: [
                Ext.create('Ext.ux.TabReorderer'),
                Ext.create('Ext.ux.TabCloseMenu', {
                    closeTabText        : common.Util.TR('Close Tab'),
                    closeOthersTabsText : common.Util.TR('Close Other Tabs'),
                    closeAllTabsText    : common.Util.TR('Close All Tabs')
                })],
            layout: 'fit',
            height: '100%',
            width: '100%',
            id: 'cfg_tab_panel',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            cls  : 'config_tab',
            listeners: {
                tabchange: function(_tabPanel, _newCard, _oldCard) {
                    if (_oldCard == null)
                        return;
                    switch (_oldCard.title) {
                        case common.Util.TR('WAS Agent List') :
                            cfg.alertWas.selectWas           = cfg.alert.sltName;
                            cfg.alertWas.selectWasId         = cfg.alert.sltId;
                            cfg.alertWas.selectGroup         = cfg.alert.sltGroup;
                            cfg.alertWas.selectSub           = cfg.alert.sltExistSub;
                            cfg.alertWas.selectWasFirstChild = cfg.alert.sltFirstChild;
                            cfg.alertWas.selectWasIds        = cfg.alert.wasIds;
                            break;
                        case common.Util.TR('DB List') :
                            cfg.alertDB.selectDB           = cfg.alert.sltName;
                            cfg.alertDB.selectDBId         = cfg.alert.sltId;
                            cfg.alertDB.selectGroup        = cfg.alert.sltGroup;
                            cfg.alertDB.selectSub          = cfg.alert.sltExistSub;
                            cfg.alertDB.selectDBFirstChild = cfg.alert.sltFirstChild;
                            cfg.alertDB.selectDBType       = cfg.alert.sltType;
                            break;
                        case common.Util.TR('Webserver List') :
                            cfg.alertWS.selectWas           = cfg.alert.sltName;
                            cfg.alertWS.selectWasId         = cfg.alert.sltId;
                            cfg.alertWS.selectGroup         = cfg.alert.sltGroup;
                            cfg.alertWS.selectSub           = cfg.alert.sltExistSub;
                            cfg.alertWS.selectWasFirstChild = cfg.alert.sltFirstChild;
                            break;
                        case common.Util.TR('Host List') :
                            cfg.alertHost.selectHost              = cfg.alert.sltName;
                            cfg.alertHost.selectTreeHostId        = cfg.alert.sltId;
                            cfg.alertHost.selectGroup             = cfg.alert.sltGroup;
                            cfg.alertHost.selectSub               = cfg.alert.sltExistSub;
                            cfg.alertHost.selectHostFirstChild    = cfg.alert.sltFirstChild;
                            cfg.alertHost.selectHostId            = cfg.alert.sltHostId;
                            break;
                        case common.Util.TR('SMS Mapping') :
                            cfg.alertSMS.selectWas      = cfg.alert.sltName;
                            cfg.alertSMS.selectWasId    = cfg.alert.sltId;
                            cfg.alertSMS.selectGroup    = cfg.alert.sltGroup;
                            cfg.alertSMS.selectSub      = cfg.alert.sltExistSub;
                            cfg.alertSMS.selectWasIds   = cfg.alert.wasIds;
                            cfg.alertSMS.selectTreeTab  = cfg.alert.tabMode;
                            break;
                        case common.Util.TR('APIM Agent List') :
                            cfg.alertAPIM.selectWas           = cfg.alert.sltName;
                            cfg.alertAPIM.selectWasId         = cfg.alert.sltId;
                            cfg.alertAPIM.selectGroup         = cfg.alert.sltGroup;
                            cfg.alertAPIM.selectSub           = cfg.alert.sltExistSub;
                            cfg.alertAPIM.selectWasFirstChild = cfg.alert.sltFirstChild;
                            cfg.alertAPIM.selectWasIds        = cfg.alert.wasIds;
                            break;
                        case common.Util.TR('TP Agent List') :
                            cfg.alertTP.selectWas           = cfg.alert.sltName;
                            cfg.alertTP.selectWasId         = cfg.alert.sltId;
                            cfg.alertTP.selectGroup         = cfg.alert.sltGroup;
                            cfg.alertTP.selectSub           = cfg.alert.sltExistSub;
                            cfg.alertTP.selectWasFirstChild = cfg.alert.sltFirstChild;
                            cfg.alertTP.selectWasIds        = cfg.alert.wasIds;
                            break;
                        case common.Util.TR('Business List') :
                            cfg.alertBusiness.selectWas           = cfg.alert.sltName;
                            cfg.alertBusiness.selectWasId         = cfg.alert.sltId;
                            cfg.alertBusiness.selectGroup         = cfg.alert.sltGroup;
                            cfg.alertBusiness.selectSub           = cfg.alert.sltExistSub;
                            cfg.alertBusiness.selectWasFirstChild = cfg.alert.sltFirstChild;
                            cfg.alertBusiness.selectWasIds        = cfg.alert.wasIds;
                            cfg.alertBusiness.selectDepth         = cfg.alert.sltDepth;
                            break;
                        default :
                            break;
                    }

                    switch (_newCard.title) {
                        case common.Util.TR('WAS Agent List') :
                            cfg.frames.activeTab    = common.Util.TR('Stat Alert');
                            cfg.alert.sltName       = cfg.alertWas.selectWas;
                            cfg.alert.sltId         = cfg.alertWas.selectWasId;
                            cfg.alert.wasIds        = cfg.alertWas.selectWasIds;
                            cfg.alert.sltGroup      = cfg.alertWas.selectGroup;
                            cfg.alert.sltExistSub   = cfg.alertWas.selectSub;
                            cfg.alert.sltFirstChild = cfg.alertWas.selectWasFirstChild;
                            cfg.alert.sltMode       = 'Agent';
                            break;
                        case common.Util.TR('DB List') :
                            cfg.frames.activeTab    = common.Util.TR('DB Stat Alert');
                            cfg.alert.sltName       = cfg.alertDB.selectDB;
                            cfg.alert.sltId         = cfg.alertDB.selectDBId;
                            cfg.alert.sltGroup      = cfg.alertDB.selectGroup;
                            cfg.alert.sltExistSub   = cfg.alertDB.selectSub;
                            cfg.alert.sltFirstChild = cfg.alertDB.selectDBFirstChild;
                            cfg.alert.sltType       = cfg.alertDB.selectDBType;
                            cfg.alert.sltMode       = 'DB';
                            break;
                        case common.Util.TR('Webserver List') :
                            cfg.frames.activeTab    = common.Util.TR('WS Stat Alert');
                            cfg.alert.sltName       = cfg.alertWS.selectWas;
                            cfg.alert.sltId         = cfg.alertWS.selectWasId;
                            cfg.alert.sltGroup      = cfg.alertWS.selectGroup;
                            cfg.alert.sltExistSub   = cfg.alertWS.selectSub;
                            cfg.alert.sltFirstChild = cfg.alertWS.selectWasFirstChild;
                            cfg.alert.sltMode       = 'WS';
                            break;
                        case common.Util.TR('Host List') :
                            cfg.frames.activeTab    = common.Util.TR('Disk Usage Alert');
                            cfg.alert.sltName       = cfg.alertHost.selectHost;
                            cfg.alert.sltId         = cfg.alertHost.selectTreeHostId;
                            cfg.alert.sltGroup      = cfg.alertHost.selectGroup;
                            cfg.alert.sltExistSub   = cfg.alertHost.selectSub;
                            cfg.alert.sltFirstChild = cfg.alertHost.selectHostFirstChild;
                            cfg.alert.sltHostId     = cfg.alertHost.selectHostId;
                            cfg.alert.sltMode       = 'Host';
                            break;
                        case common.Util.TR('SMS Mapping') :
                            cfg.frames.activeTab    = common.Util.TR('SMS Mapping');
                            cfg.alert.sltName       = cfg.alertSMS.selectWas;
                            cfg.alert.wasIds        = cfg.alertSMS.selectWasIds;
                            cfg.alert.sltGroup      = cfg.alertSMS.selectGroup;
                            cfg.alert.sltExistSub   = cfg.alertSMS.selectSub;
                            cfg.alert.sltId         = cfg.alertSMS.selectWasId;
                            cfg.alert.tabMode       = cfg.alertSMS.selectTreeTab;
                            cfg.alert.sltMode       = 'SMS';
                            break;
                        case common.Util.TR('APIM Agent List') :
                            cfg.frames.activeTab    = common.Util.TR('APIM Stat Alert');
                            cfg.alert.sltName       = cfg.alertAPIM.selectWas;
                            cfg.alert.sltId         = cfg.alertAPIM.selectWasId;
                            cfg.alert.wasIds        = cfg.alertAPIM.selectWasIds;
                            cfg.alert.sltGroup      = cfg.alertAPIM.selectGroup;
                            cfg.alert.sltExistSub   = cfg.alertAPIM.selectSub;
                            cfg.alert.sltFirstChild = cfg.alertAPIM.selectWasFirstChild;
                            cfg.alert.sltMode       = 'APIM';
                            break;
                        case common.Util.TR('TP Agent List') :
                            cfg.frames.activeTab    = common.Util.TR('TP Stat Alert');
                            cfg.alert.sltName       = cfg.alertTP.selectWas;
                            cfg.alert.sltId         = cfg.alertTP.selectWasId;
                            cfg.alert.wasIds        = cfg.alertTP.selectWasIds;
                            cfg.alert.sltGroup      = cfg.alertTP.selectGroup;
                            cfg.alert.sltExistSub   = cfg.alertTP.selectSub;
                            cfg.alert.sltFirstChild = cfg.alertTP.selectWasFirstChild;
                            cfg.alert.sltMode       = 'TP';
                            break;
                        case common.Util.TR('Business List') :
                            cfg.frames.activeTab    = common.Util.TR('Business Stat Alert');
                            cfg.alert.sltName       = cfg.alertBusiness.selectWas;
                            cfg.alert.sltId         = cfg.alertBusiness.selectWasId;
                            cfg.alert.wasIds        = cfg.alertBusiness.selectWasIds;
                            cfg.alert.sltGroup      = cfg.alertBusiness.selectGroup;
                            cfg.alert.sltExistSub   = cfg.alertBusiness.selectSub;
                            cfg.alert.sltFirstChild = cfg.alertBusiness.selectWasFirstChild;
                            cfg.alert.sltDepth      = cfg.alertBusiness.selectDepth;
                            cfg.alert.sltMode       = 'Business';
                            break;
                        default :
                            break;
                    }
                }
            }
        });

        Ext.getCmp('cfg_menu_configuration').add(this.treeConfigPanel);
        Ext.getCmp('cfg_tab_body').add(tabPanel);

        // // DB연결이 있어야지 DB설정이 보이도록 변경
        // if(window.isConnectDB){
        //     var rootNode = this.treeConfigPanel.getRootNode();
        //     rootNode.appendChild({ text: common.Util.TR('DB Settings'),  id: 'config_db_setting', leaf: true});
        // }

        // Check Configuration Menu Show/Hide
        if (common.Menu.hiddenList && common.Menu.hiddenList.length > 0) {
            this.treeConfigPanel.store.filterBy(function(record) {
                return common.Menu.hiddenList.indexOf(record.data.id) === -1;
            });
        }
        this.add(this.area);
        this.area.setVisible(false);
    },

    init: function() {
        this.create_layout();
    }
});

// Uncaught TypeError : 'isExpanded'of null
// https://www.sencha.com/forum/showthread.php?302493-onNodeInsert-function-implementation-bug
Ext.define('Ext.overrides.data.TreeStore', {
    override: 'Ext.data.TreeStore',

    indexOfPreviousVisibleNode: function (node) {
        var me = this,
            result;

        for (result = node; result && !result.get('visible'); result = result.previousSibling) {}

        if (result) {
            if (result.isExpanded() && result.lastChild) {
                return me.indexOfPreviousVisibleNode(result.lastChild);
            }
        }
        else {
            result = node.parentNode;
        }

        return result;
    },

    onNodeInsert: function (parent, node, index) {
        var me = this,
            data = node.raw || node.data,
            refNode, storeReader, nodeProxy, nodeReader, reader, dataRoot;
        if (parent && me.needsLocalFilter()) {
            me.doFilter(parent);
        }
        me.beginUpdate();

        if (me.isVisible(node)) {
            if (index === 0 || !node.previousSibling) {
                refNode = parent;
            } else {
                refNode = me.indexOfPreviousVisibleNode(node.previousSibling);
            }

            me.insert(me.indexOf(refNode) + 1, node);
            if (!node.isLeaf() && node.isExpanded()) {
                if (node.isLoaded()) {

                    me.onNodeExpand(node, node.childNodes);
                } else if (!me.fillCount) {

                    node.set('expanded', false);
                    node.expand();
                }
            }
        }

        me.needsSync = me.needsSync || node.phantom || node.dirty;
        if (!node.isLeaf() && !node.isLoaded() && !me.lazyFill) {


            storeReader = me.getProxy().getReader();
            nodeProxy = node.getProxy();
            nodeReader = nodeProxy ? nodeProxy.getReader() : null;

            reader = nodeReader && nodeReader.initialConfig.rootProperty ? nodeReader : storeReader;
            dataRoot = reader.getRoot(data);
            if (dataRoot) {
                me.fillNode(node, reader.extractData(dataRoot, {
                    model: node.childType,
                    recordCreator: me.recordCreator
                }));
            }
        }
        me.endUpdate();
    }
});