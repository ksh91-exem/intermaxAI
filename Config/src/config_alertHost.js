Ext.define('config.config_alertHost', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    cls   : 'config_tab',

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(target){

        this.target = target;

        cfg.alert.sltMode = 'Host';

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var WestPanel = Ext.create('Ext.panel.Panel', {
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
                title: common.Util.TR('Host List'),
                itemId: 'cfg_alert_HostList_TreeMenu',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }]
        });

        var RightPanel = Ext.create('Ext.panel.Panel', {
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
            [ common.Util.TR('Disk Usage Alert'),    'DiskAlert'   ],
            [ common.Util.TR('Process Observer'),    'process_observer'   ]
        ];

        var rightTabPanel = Ext.create('Ext.tab.Panel', {
            plugins: Ext.create('Ext.ux.TabReorderer'),
            layout: 'fit',
            height: '100%',
            width: '100%',
            id: 'HostAlert_panel_TabPanel',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            listeners: {
                tabchange: function(_tabPanel, _newCard) {
                    if (Comm.Lang === 'ko') {
                        switch (_newCard.title) {
                            case common.Util.TR('Disk Usage Alert') :
                                cfg.frames.activeTab = common.Util.TR('Disk Usage Alert');
                                break;
                            case common.Util.TR('Process Observer') :
                                cfg.frames.activeTab = common.Util.TR('Process Observer');
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
                itemId: 'HostAlert_panel_TabPanel_' + pages[ix][1],
                border: false,
                width: '100%',
                flex: 1,
                autoScroll: true,
                style: { background: '#ffffff' }
            });
        }

        WestPanel.add(tabpanel);
        RightPanel.add(rightTabPanel);

        panel.add(WestPanel);
        panel.add(RightPanel);

        this.target.add(panel);

        var treemenuFrame  = Ext.create('config.config_alert_treemenu', { MODE: 'Host', target: tabpanel.getComponent('cfg_alert_HostList_TreeMenu') });
        treemenuFrame.init();

        cfg.frames[common.Util.TR('Disk Usage Alert')] = Ext.create('config.config_alert_disk',    { MODE: 'Host', target: rightTabPanel.getComponent('HostAlert_panel_TabPanel_DiskAlert')    });
        cfg.frames[common.Util.TR('Process Observer')] = Ext.create('config.config_alert_process',    { MODE: 'Host', target: rightTabPanel.getComponent('HostAlert_panel_TabPanel_process_observer')    });

        cfg.frames[common.Util.TR('Disk Usage Alert')].init();
        cfg.frames[common.Util.TR('Process Observer')].init();
    }
});