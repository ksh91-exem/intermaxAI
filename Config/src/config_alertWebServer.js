Ext.define('config.config_alertWebServer', {
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

        cfg.alert.sltMode = 'WS';

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA = Ext.create('Ext.panel.Panel', {
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

        var tabpanel = Ext.create('Ext.tab.Panel', {
            plugins: Ext.create('Ext.ux.TabReorderer'),
            layout: 'fit',
            flex: 1,
            width: '100%',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            items: [{
                title: common.Util.TR('Webserver List'),
                itemId: 'cfg_alert_wslist_treemenu',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }]
        });

        var wasalert_panel = Ext.create('Ext.panel.Panel', {
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

        var pages = [
            // [ common.Util.TR('Summary'),       'ws_summary'  ],
            [ common.Util.TR('WS Stat Alert'),    'statalert'   ],
            [ common.Util.TR('WS Session Alert'),    'sessionalert'   ]
            //[ common.Util.TR('Script Alert'),  'scriptalert' ]
            //[ common.Util.TR('Log Filter'),    'logfilter'   ]
            // [ 'File System',   'filesystem'  ],
        ];

        var rightTabPanel = Ext.create('Ext.tab.Panel', {
            plugins: Ext.create('Ext.ux.TabReorderer'),
            layout: 'fit',
            height: '100%',
            width: '100%',
            id: 'ws_alert_panel_tabpanel',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            listeners: {
                tabchange: function(_tabPanel, _newCard) {
                    if (Comm.Lang === 'ko' || window.nation === 'ko') {
                        switch (_newCard.title) {
                            case common.Util.TR('WS Stat Alert') :
                                cfg.frames.activeTab = common.Util.TR('WS Stat Alert');
                                break;
                            case common.Util.TR('WS Session Alert') :
                                cfg.frames.activeTab = common.Util.TR('WS Session Alert');
                                break;
                        /**
                         case common.Util.TR('Script Alert') : cfg.frames.activeTab = 'Script Alert'; break;
                         case common.Util.TR('Log Filter'  ) : cfg.frames.activeTab = 'Log Filter';   break;
                         **/
                            default :
                                break;
                        }
                    } else {
                        cfg.frames.activeTab = _newCard.title;
                    }
                    if (cfg.frames[cfg.frames.activeTab]) {
                        cfg.frames[cfg.frames.activeTab].onRefresh();
                    }
                }
            }
        });

        for (var ix = 0; ix < pages.length; ix++) {
            rightTabPanel.add({
                title: pages[ix][0],
                itemId: 'ws_alert_panel_tabpanel_' + pages[ix][1],
                layout: 'vbox',
                border: false,
                width: '100%',
                autoScroll: true,
                flex: 1,
                style: { background: '#ffffff' }
            });
        }

        panelA.add(tabpanel);
        wasalert_panel.add(rightTabPanel);

        panel.add(panelA);
        panel.add(wasalert_panel);

        this.target.add(panel);

        var treemenuFrame  = Ext.create('config.config_alert_treemenu', { MODE: 'WS', target: tabpanel.getComponent('cfg_alert_wslist_treemenu') });
        treemenuFrame.init();

        cfg.frames[common.Util.TR('WS Stat Alert'   )] = Ext.create('config.config_alert_statalert',    { MODE: 'WS', target: rightTabPanel.getComponent('ws_alert_panel_tabpanel_statalert')    });
        cfg.frames[common.Util.TR('WS Session Alert'   )] = Ext.create('config.config_alert_sessionalert',    { MODE: 'WS', target: rightTabPanel.getComponent('ws_alert_panel_tabpanel_sessionalert')    });
        /**
         cfg.frames['WS Summary'      ] = Ext.create('config.config_alert_ws_summary',   { MODE: 'WS', target: rightTabPanel.getComponent('ws_alert_panel_tabpanel_ws_summary'), pages: pages    });
         cfg.frames[common.Util.TR('WS Script Alert' )] = Ext.create('config.config_alert_scriptalert',  { MODE: 'WS', target: rightTabPanel.getComponent('ws_alert_panel_tabpanel_scriptalert')  });
         cfg.frames[common.Util.TR('WS Log Filter'   )] = Ext.create('config.config_alert_logfilter',    { MODE: 'WS', target: rightTabPanel.getComponent('ws_alert_panel_tabpanel_logfilter')    });
         cfg.frames['WS File System'  ] = Ext.create('view.config.config_alert_filesystem',   { MODE: 'WAS', target: rightTabPanel.getComponent('wasalert_panel_tabpanel_filesystem')   });
         **/

        cfg.frames[common.Util.TR('WS Stat Alert'   )].init();
        cfg.frames[common.Util.TR('WS Session Alert'   )].init();
        /**
         cfg.frames['WS Summary'      ].init();
         cfg.frames[common.Util.TR('WS Script Alert' )].init();
         cfg.frames[common.Util.TR('WS Log Filter'   )].init();
         cfg.frames['File System'  ].init();
         **/
    },

    alertMenuClick: function(s, r) {
        console.debug('s -->', s);
        console.debug('r -->', r);
    }
});
