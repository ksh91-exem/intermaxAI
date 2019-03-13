Ext.define('config.config_report_setting', {
    extend  : 'Exem.Form',
    width   : '100%',
    height  : '100%',
    cls     : 'config_tab',

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function(target) {
        this.target = target;

        var panel = Ext.create('Ext.panel.Panel', {
            layout    : 'border',
            width     : '100%',
            height    : '100%',
            flex      : 1,
            border    : false,
            bodyStyle : { background: '#eeeeee' }
        });

        var reportSettingPanel = Ext.create('Ext.panel.Panel', {
            layout    : 'fit',
            cls       : 'x-config-used-round-panel',
            region    : 'center',
            height    : '100%',
            flex      : 1,
            border    : false,
            split     : true,
            margin    : '3 0 3 6',
            padding   : '9 2 2 2',
            bodyStyle : { background: '#e7e7e7' }
        });

        var pages = [
            [ common.Util.TR('User') , 'user' ],
            [ common.Util.TR('Group'), 'group'],
            [ common.Util.TR('SMTP') , 'smtp' ]
        ];

        var tabPanel = Ext.create('Ext.tab.Panel', {
            plugins   : Ext.create('Ext.ux.TabReorderer'),
            layout    : 'fit',
            height    : '100%',
            width     : '100%',
            id        : 'report_setting_tab_panel',
            border    : false,
            style     : { background: '#e7e7e7' },
            listeners : {
                tabchange: function(_tabPanel, _newCard) {
                    if (Comm.Lang === 'ko' || window.nation === 'ko') {
                        switch (_newCard.title) {
                            case common.Util.TR('User')  :
                                cfg.frames.activeTab = common.Util.TR('User');
                                break;
                            case common.Util.TR('Group') :
                                cfg.frames.activeTab = common.Util.TR('Group');
                                break;
                            case common.Util.TR('SMTP')  :
                                cfg.frames.activeTab = common.Util.TR('SMTP');
                                break;
                            default :
                                break;
                        }
                    } else {
                        cfg.frames.activeTab = _newCard.title;
                    }
                    if (cfg.frames[cfg.frames.activeTab]) {
                        cfg.frames[cfg.frames.activeTab].onButtonClick('Refresh');
                    }
                }
            }
        });

        for (var ix = 0; ix < pages.length; ix++) {
            tabPanel.add({
                xtype      : 'container',
                layout     : 'vbox',
                title      : pages[ix][0],
                itemId     : 'report_setting_tab_panel_' + pages[ix][1],
                border     : false,
                width      : '100%',
                flex       : 1,
                autoScroll : true,
                style      : { background: '#ffffff' }
            });
        }

        reportSettingPanel.add(tabPanel);

        panel.add(reportSettingPanel);

        this.target.add(panel);


        cfg.frames[common.Util.TR('User' )] = Ext.create('config.config_report_user_setting',  {
            target: tabPanel.getComponent('report_setting_tab_panel_user')
        });
        cfg.frames[common.Util.TR('Group')] = Ext.create('config.config_report_group_setting', {
            target: tabPanel.getComponent('report_setting_tab_panel_group')
        });
        cfg.frames[common.Util.TR('SMTP' )] = Ext.create('config.config_report_smtp_setting',  {
            target: tabPanel.getComponent('report_setting_tab_panel_smtp')
        });

        cfg.frames[common.Util.TR('User' )].init();
        cfg.frames[common.Util.TR('Group')].init();
        cfg.frames[common.Util.TR('SMTP' )].init();

        tabPanel.setActiveTab(0);
    }
});
