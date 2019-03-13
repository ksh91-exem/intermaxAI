Ext.define('config.config_alertDB', {
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

        cfg.alert.sltMode = 'DB';

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        //

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
                title: common.Util.TR('DB List'),
                itemId: 'cfg_alert_dblist_treemenu',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }]
        });

        //

        var panelB = Ext.create('Ext.panel.Panel', {
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
            // [ common.Util.TR('Summary'),       'db_summary'  ],
            [ common.Util.TR('DB Stat Alert'),    'statalert'   ],
            [ common.Util.TR('DB Session Alert'), 'sessionalert'],
            [ common.Util.TR('DB Server Alert'),   'serveralert']
            //[ common.Util.TR('DB Script Alert'),  'scriptalert' ]
            //[ common.Util.TR('DB Log Filter'),    'logfilter'   ]
            //[ 'File System',   'filesystem'  ],
            //[ 'DB Warning',    'dbwarning'   ],
            //[ 'Tablespace',    'tablespace'  ]
        ];

        var rightTabPanel = Ext.create('Ext.tab.Panel', {
            plugins: Ext.create('Ext.ux.TabReorderer'),
            layout: 'fit',
            height: '100%',
            width: '100%',
            id: 'dbalert_panel_tabpanel',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            listeners: {
                tabchange: function(_tabPanel, _newCard) {
                    if (Comm.Lang == 'ko') {
                        switch (_newCard.title) {
                            case common.Util.TR('DB Stat Alert') :
                                cfg.frames.activeTab = common.Util.TR('DB Stat Alert');
                                break;
                            case common.Util.TR('DB Session Alert') :
                                cfg.frames.activeTab = common.Util.TR('DB Session Alert');
                                break;
                            case common.Util.TR('DB Server Alert') :
                                cfg.frames.activeTab = common.Util.TR('DB Server Alert');
                                break;
                            /**
                            case common.Util.TR('DB Script Alert') :
                                cfg.alertDB.activeTabTitle = 'DB Script Alert';
                                break;
                            case common.Util.TR('DB Log Filter') :
                                cfg.alertDB.activeTabTitle = 'DB Log Filter';
                                break;
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
                xtype: 'container',
                title: pages[ix][0],
                itemId: 'dbalert_panel_tabpanel_' + pages[ix][1],
                layout: 'vbox',
                border: false,
                width: '100%',
                flex: 1,
                autoScroll: true,
                style: { background: '#ffffff' }
            });
        }

        panelA.add(tabpanel);
        panelB.add(rightTabPanel);

        panel.add(panelA);
        panel.add(panelB);

        this.target.add(panel);

        var treemenuFrame  = Ext.create('config.config_alert_treemenu', { MODE: 'DB', target: tabpanel.getComponent('cfg_alert_dblist_treemenu') });
        treemenuFrame.init();

        cfg.frames[common.Util.TR('DB Stat Alert'   )] = Ext.create('config.config_alert_statalert',    { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_statalert')    });
        cfg.frames[common.Util.TR('DB Session Alert')] = Ext.create('config.config_alert_sessionalert', { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_sessionalert') });
        cfg.frames[common.Util.TR('DB Server Alert')] = Ext.create('config.config_alert_serveralert', { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_serveralert') });
        /**
         cfg.frames['DB Summary'      ] = Ext.create('config.config_alert_db_summary',   { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_db_summary'), pages: pages  });
         cfg.frames[common.Util.TR('DB Script Alert' )] = Ext.create('config.config_alert_scriptalert',  { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_scriptalert')  });
         cfg.frames[common.Util.TR('DB Log Filter'   )] = Ext.create('config.config_alert_logfilter',    { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_logfilter')    });
         cfg.frames['DB File System'  ] = Ext.create('view.config.config_alert_filesystem',   { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_filesystem')   });
         cfg.frames['DB DB Warning'   ] = Ext.create('view.config.config_alert_dbwarning',    { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_dbwarning')    });
         cfg.frames['DB Tablespace'   ] = Ext.create('view.config.config_alert_tablespace',   { MODE: 'DB', target: rightTabPanel.getComponent('dbalert_panel_tabpanel_tablespace')   });
         **/


        cfg.frames[common.Util.TR('DB Stat Alert'   )].init();
        cfg.frames[common.Util.TR('DB Session Alert')].init();
        cfg.frames[common.Util.TR('DB Server Alert')].init();
        /**
         cfg.frames['DB Summary'      ].init();
         cfg.frames[common.Util.TR('DB Script Alert' )].init();
         cfg.frames[common.Util.TR('DB Log Filter'   )].init();
         cfg.frames['DB File System'  ].init();
         cfg.frames['DB DB Warning'   ].init();
         cfg.frames['DB Tablespace'   ].init();
         **/
    },

    alertMenuClick: function(s, r) {
        console.debug('s -->', s);
        console.debug('r -->', r);
    }
});
