Ext.define('config.config_alertWAS', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    cls   : 'config_tab',

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(target) {
        this.target = target;

        this.initProperty();
        this.initLayout();
        this.initFramesSetting();
    },

    initProperty: function(){
        cfg.alert.sltMode = 'Agent';
    },

    initLayout: function(){
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.createWasListPanel();
        this.createWasAlertPanel();

        baseCon.add(this.wasListPanel, this.wasAlertPanel);

        this.target.add(baseCon);
    },

    createWasListPanel: function(){
        this.wasListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            width: 250,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '9 2 2 2',
            bodyStyle: { background: '#e7e7e7' }
        });

        this.wasTabPanel = Ext.create('Ext.tab.Panel', {
            layout: 'fit',
            flex: 1,
            width: '100%',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            items: [{
                title: common.Util.TR('Agent List'),
                itemId: 'cfg_alert_waslist_treemenu',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }]
        });

        this.wasListPanel.add(this.wasTabPanel);
    },

    createWasAlertPanel: function(){
        var ix, ixLen, pages;

        pages = [
            [ common.Util.TR('Stat Alert'),    'statalert'   ],
            [ common.Util.TR('Session Alert'), 'sessionalert'],
            [ common.Util.TR('URL'),           'url'         ],
            [ common.Util.TR('Exception'),     'exception'   ],
            [ common.Util.TR('Pool Alert'),    'poolalert'   ],
            [ common.Util.TR('Agent Alert'),   'wasalert'    ],
            [ common.Util.TR('Server Alert'),  'serveralert' ],
            [ common.Util.TR('User Alert'),    'useralert'   ]
        ];

        this.wasAlertPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '9 2 2 2',
            bodyStyle: { background: '#e7e7e7' }
        });

        this.alertTabPanel = Ext.create('Ext.tab.Panel', {
            layout: 'fit',
            height: '100%',
            width: '100%',
            id: 'wasalert_panel_tabpanel',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            listeners: {
                tabchange: function(tabPanel, newCard) {
                    cfg.frames.activeTab = newCard.title;

                    if ( newCard.title !== common.Util.TR('User Alert') ) {
                        this.wasListPanel.setVisible(true);
                    } else {
                        this.wasListPanel.setVisible(false);
                    }

                    if ( cfg.frames[cfg.frames.activeTab] ) {
                        cfg.frames[cfg.frames.activeTab].onRefresh();
                    }
                }.bind(this)
            }
        });

        for ( ix = 0, ixLen = pages.length; ix < ixLen; ix++ ) {
            if ( !common.Menu.userAlert.isUsed ) {
                if ( pages[ix][0] === common.Util.TR('User Alert') ) {
                    continue;
                }
            }

            this.alertTabPanel.add({
                xtype: 'container',
                layout: 'vbox',
                title: pages[ix][0],
                itemId: 'wasalert_panel_tabpanel_' + pages[ix][1],
                border: false,
                width: '100%',
                flex: 1,
                autoScroll: true,
                style: { background: '#ffffff' }
            });
        }

        this.wasAlertPanel.add(this.alertTabPanel);
    },

    initFramesSetting: function(){
        var treeMenuFrame = Ext.create('config.config_alert_treemenu', {
            MODE: 'Agent',
            target: this.wasTabPanel.getComponent('cfg_alert_waslist_treemenu')
        });

        treeMenuFrame.init();

        this.alertTabSetting(common.Util.TR('Stat Alert'), 'config.config_alert_statalert', 'wasalert_panel_tabpanel_statalert');
        this.alertTabSetting(common.Util.TR('Session Alert'), 'config.config_alert_sessionalert', 'wasalert_panel_tabpanel_sessionalert');
        this.alertTabSetting(common.Util.TR('URL'), 'config.config_alert_url', 'wasalert_panel_tabpanel_url');
        this.alertTabSetting(common.Util.TR('Exception'), 'config.config_alert_exception', 'wasalert_panel_tabpanel_exception');
        this.alertTabSetting(common.Util.TR('Pool Alert'), 'config.config_alert_poolalert', 'wasalert_panel_tabpanel_poolalert');
        this.alertTabSetting(common.Util.TR('Agent Alert'), 'config.config_wasalert', 'wasalert_panel_tabpanel_wasalert');
        this.alertTabSetting(common.Util.TR('Server Alert'), 'config.config_alert_serveralert', 'wasalert_panel_tabpanel_serveralert');

        if ( common.Menu.userAlert.isUsed ) {
            this.alertTabSetting(common.Util.TR('User Alert'), 'config.config_alert_useralert', 'wasalert_panel_tabpanel_useralert');
        }
    },

    alertTabSetting: function(showText, scriptFile, target){
        cfg.frames[showText] = Ext.create(scriptFile, {
            MODE: 'Agent',
            target: this.alertTabPanel.getComponent(target)
        });

        cfg.frames[showText].init();
    }
});
