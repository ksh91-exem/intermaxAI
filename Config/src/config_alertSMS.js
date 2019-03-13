Ext.define('config.config_alertSMS', {
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

        cfg.alert.sltMode = 'SMS';

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
                title: common.Util.TR('Agent List'),
                itemId: 'cfg_alert_SMS_Mapping_TreeMenu',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }, {
                title: common.Util.TR('DB List'),
                itemId: 'cfg_alert_SMS_Mapping_TreeMenu_db',
                layout: 'vbox',
                width: '100%',
                height: '100%',
                border: false
            }],
            listeners: {
                tabchange: function(_tabPanel, _newCard) {
                    if (Comm.Lang == 'ko') {
                        switch (_newCard.title) {
                            case common.Util.TR('Agent List') :
                                cfg.frames.activeTab = common.Util.TR('Agent List');
                                break;
                            case common.Util.TR('DB List') :
                                cfg.frames.activeTab = common.Util.TR('DB List');
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
            [ common.Util.TR('SMS Mapping'),    'SMS_Mapping'   ]
        ];

        var rightTabPanel = Ext.create('Ext.tab.Panel', {
            plugins: Ext.create('Ext.ux.TabReorderer'),
            layout: 'fit',
            height: '100%',
            width: '100%',
            id: 'SMS_Alert_panel_TabPanel',
            border: false,
            activeTab: 0,
            style: { background: '#e7e7e7' },
            listeners: {
                tabchange: function(_tabPanel, _newCard) {
                    if (Comm.Lang === 'ko') {
                        switch (_newCard.title) {
                            case common.Util.TR('SMS Mapping') :
                                cfg.frames.activeTab = common.Util.TR('SMS Mapping');
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
                itemId: 'SMSAlert_panel_TabPanel_' + pages[ix][1],
                border: false,
                width: '100%',
                flex: 1,
                autoScroll: true,
                style: { background: '#ffffff' }
            });
        }

        var infoPanel = Ext.create('config.config_sms_mapping_info', {
            layout: 'hbox',
            height: '100%',
            region: 'east',
            flex: 2,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '9 2 2 2',
            cls: 'x-config-used-round-panel',
            bodyStyle: { background: '#e7e7e7' }
        });

        WestPanel.add(tabpanel);
        RightPanel.add(rightTabPanel);

        panel.add(WestPanel);
        panel.add(RightPanel);
        panel.add(infoPanel);

        this.target.add(panel);

        infoPanel.init();

        cfg.frames[common.Util.TR('SMS Mapping')] = Ext.create('config.config_sms_mapping',    { MODE: 'SMS', target: rightTabPanel.getComponent('SMSAlert_panel_TabPanel_SMS_Mapping')});
        /////////////////////////////////////////////////////////////////////////////////
        cfg.frames[common.Util.TR('DB List')]               = Ext.create('config.config_alert_treemenu', { MODE: 'TabDB',    target: tabpanel.getComponent('cfg_alert_SMS_Mapping_TreeMenu_db')});
        cfg.frames[common.Util.TR('Agent List')] = Ext.create('config.config_alert_treemenu', { MODE: 'SMS',      target: tabpanel.getComponent('cfg_alert_SMS_Mapping_TreeMenu')});
        /////////////////////////////////////////////////////////////////////////////////
        cfg.frames[common.Util.TR('DB List')].init();
        cfg.frames[common.Util.TR('Agent List')].init();
        cfg.frames[common.Util.TR('SMS Mapping')].init();
    }
});