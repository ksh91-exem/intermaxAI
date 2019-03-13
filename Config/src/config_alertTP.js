/**
 * Created by 신정훈 on 2017-08-07.
 */
Ext.define('config.config_alertTP', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    cls   : 'config_tab',

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function(target) {
        this.target = target;

        cfg.alert.sltMode = 'TP';

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var westPanel = Ext.create('Ext.panel.Panel', {
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

        var tabPanel = Ext.create('Ext.tab.Panel', {
            plugins: Ext.create('Ext.ux.TabReorderer'),
            layout: 'fit',
            flex: 1,
            width: '100%',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            items: [{
                title: common.Util.TR('TP List'),
                itemId: 'cfg_alert_tp_treemenu',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }]
        });

        var wasAlertPanel = Ext.create('Ext.panel.Panel', {
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
            [ common.Util.TR('TP Stat Alert'),     'stat_alert'     ],
            [ common.Util.TR('TP Session Alert'),  'session_alert'  ],
            [ common.Util.TR('TP Exception Alert'),'exception_alert'],
            [ common.Util.TR('TP Slog Alert'),     'slog_alert'     ],
            [ common.Util.TR('TP Server Alert'),   'server_alert'   ]
        ];

        var rightTabPanel = Ext.create('Ext.tab.Panel', {
            plugins: Ext.create('Ext.ux.TabReorderer'),
            layout: 'fit',
            height: '100%',
            width: '100%',
            id: 'tp_alert_panel_tab_panel',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            listeners: {
                tabchange: function(_tabPanel, _newCard) {
                    if (Comm.Lang === 'ko' || window.nation === 'ko') {
                        switch (_newCard.title) {
                            case common.Util.TR('TP Stat Alert') :
                                cfg.frames.activeTab = common.Util.TR('TP Stat Alert');
                                break;
                            case common.Util.TR('TP Session Alert') :
                                cfg.frames.activeTab = common.Util.TR('TP Session Alert');
                                break;
                            case common.Util.TR('TP Server Alert') :
                                cfg.frames.activeTab = common.Util.TR('TP Server Alert');
                                break;
                            case common.Util.TR('TP Exception Alert') :
                                cfg.frames.activeTab = common.Util.TR('TP Exception Alert');
                                break;
                            case common.Util.TR('TP Slog Alert') :
                                cfg.frames.activeTab = common.Util.TR('TP Slog Alert');
                                break;
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
                layout: 'vbox',
                title: pages[ix][0],
                itemId: 'tp_alert_tab_panel_' + pages[ix][1],
                border: false,
                width: '100%',
                flex: 1,
                autoScroll: true,
                style: { background: '#ffffff' }
            });
        }

        westPanel.add(tabPanel);
        wasAlertPanel.add(rightTabPanel);

        panel.add(westPanel);
        panel.add(wasAlertPanel);

        this.target.add(panel);

        var treeMenuFrame  = Ext.create('config.config_alert_treemenu',
            {
                MODE: 'TP',
                target: tabPanel.getComponent('cfg_alert_tp_treemenu')
            });
        treeMenuFrame.MODE = 'TP';
        treeMenuFrame.init();

        cfg.frames[common.Util.TR('TP Stat Alert')   ]    =  Ext.create('config.config_alert_statalert',     { MODE: 'TP', target: rightTabPanel.getComponent('tp_alert_tab_panel_stat_alert')      });
        cfg.frames[common.Util.TR('TP Session Alert')]    =  Ext.create('config.config_alert_sessionalert',  { MODE: 'TP', target: rightTabPanel.getComponent('tp_alert_tab_panel_session_alert')   });
        cfg.frames[common.Util.TR('TP Server Alert') ]    =  Ext.create('config.config_alert_serveralert',   { MODE: 'TP', target: rightTabPanel.getComponent('tp_alert_tab_panel_server_alert')    });
        cfg.frames[common.Util.TR('TP Exception Alert') ] =  Ext.create('config.config_alert_exception',     { MODE: 'TP', target: rightTabPanel.getComponent('tp_alert_tab_panel_exception_alert') });
        cfg.frames[common.Util.TR('TP Slog Alert') ]      =  Ext.create('config.config_alert_slog_alert',    { MODE: 'TP', target: rightTabPanel.getComponent('tp_alert_tab_panel_slog_alert')      });

        cfg.frames[common.Util.TR('TP Stat Alert')].init();
        cfg.frames[common.Util.TR('TP Session Alert')].init();
        cfg.frames[common.Util.TR('TP Server Alert')].init();
        cfg.frames[common.Util.TR('TP Exception Alert')].init();
        cfg.frames[common.Util.TR('TP Slog Alert')].init();
    }
});
