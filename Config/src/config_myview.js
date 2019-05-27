Ext.define('config.config_myview', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    constructor: function() {
        this.callParent();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initProperty: function(){
        this.popupObj  = {};

        if (Comm.web_env_info['JSON_RTM_ALARM_POPUP_OPTION']) {
            this.popupObj = JSON.parse(Comm.web_env_info['JSON_RTM_ALARM_POPUP_OPTION']);
        } else {
            this.popupObj.alarmPopup = 'ON';
            this.popupObj.All        = 'OFF';
            this.popupObj.DB         = 'OFF';
            this.popupObj.SERVER     = 'ON';
            this.popupObj.DG         = 'OFF';
            this.popupObj.PJS        = 'OFF';
        }

        this.popupDetailKeyList = Object.keys(this.popupObj);
    },

    init: function(target) {
        this.initProperty();
        this.initLayout(target);
    },

    initLayout: function(target) {
        this.target = target;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            autoScroll: true,
            bodyStyle: { background: '#ffffff' }
        });

        var repoPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            id: 'config-myview-repoPanel',
            region: 'north',
            width: '100%',
            height: 95,
            border: false,
            split: true,
            margin: '3 6 3 6',
            padding: '1 1 1 1',
            bodyStyle: { background: '#f1f1f1' },
            items: [{
                xtype: 'container',
                html: common.Util.usedFont(9, common.Util.TR('Repository')),
                width: '100%',
                padding: '3 0 0 10',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                itemId: 'repoPanel_body',
                layout: 'hbox',
                width: '100%',
                flex: 1
            }]
        });

        var myview_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'north',
            width: '100%',
            height: 150,
            border: false,
            split: true,
            margin: '3 6 3 6',
            padding: '1 1 1 1',
            bodyStyle: { background: '#f1f1f1' },
            items: [{
                xtype: 'container',
                html: common.Util.usedFont(9, common.Util.TR('General')),
                width: '100%',
                padding: '3 0 0 10',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                itemId: 'myview_panel_body',
                layout: 'hbox',
                width: '100%',
                flex: 1
            }]
        });

        var mypermission_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'north',
            width: '100%',
            height: 60,
            border: false,
            margin: '3 6 3 6',
            padding: '1 1 1 1',
            bodyStyle: { background: '#f1f1f1' },
            split: true,
            items: [{
                xtype: 'container',
                layout: 'absolute',
                itemId: 'mypermission_panel_title',
                html: common.Util.usedFont(9, common.Util.TR('Permission')),
                width: '100%',
                padding: '3 0 0 10',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                layout: 'hbox',
                itemId: 'mypermission_panel_body',
                width: '100%',
                flex: 1,
                style: { background: '#ffffff' }
            }]
        });

        var myservice_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'north',
            width: '100%',
            height: 180,
            border: false,
            split: true,
            autoScroll: true ,
            margin: '3 6 3 6',
            padding: '1 1 1 1',
            bodyStyle: { background: '#f1f1f1' },
            items: [{
                xtype: 'container',
                layout: 'absolute',
                itemId: 'myservice_panel_title',
                html: common.Util.usedFont(9, common.Util.TR('Service List')),
                width: '100%',
                padding: '3 0 0 10',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                itemId: 'myservice_panel_body',
                layout: 'hbox',
                width: '100%',
                flex: 1,
                style: { background: '#ffffff' }
            }]
        });

        var mypassword_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'north',
            width: '100%',
            height: 110,
            border: false,
            split: true,
            margin: '3 6 3 6',
            padding: '1 1 1 1',
            bodyStyle: { background: '#f1f1f1' },
            items: [{
                xtype: 'container',
                layout: 'absolute',
                itemId: 'mypassword_panel_title',
                html: common.Util.usedFont(9, common.Util.TR('Change password')),
                width: '100%',
                padding: '3 0 0 10',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                itemId: 'mypassword_panel_body',
                layout: 'hbox',
                width: '100%',
                flex: 1,
                style: { background: '#ffffff' }
            }]
        });

        var alarmSetting_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'north',
            width: '100%',
            height: 105,
            border: false,
            split: true,
            margin: '3 6 3 6',
            padding: '1 1 1 1',
            bodyStyle: { background: '#f1f1f1' },
            items: [{
                xtype: 'container',
                layout: 'absolute',
                itemId: 'alarm_panel_title',
                html: common.Util.usedFont(9, common.Util.TR('Alarm Setting')),
                width: '100%',
                padding: '3 0 0 10',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                itemId: 'alarm_panel_body',
                layout: 'hbox',
                width: '100%',
                flex: 1,
                style: { background: '#ffffff' }
            }]
        });

        var restartConfig_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'north',
            width: '100%',
            height: 80,
            border: false,
            split: true,
            margin: '3 6 3 6',
            padding: '1 1 1 1',
            bodyStyle: { background: '#f1f1f1' },
            items: [{
                xtype: 'container',
                layout: 'absolute',
                itemId: 'restart_panel_title',
                html: common.Util.usedFont(9, common.Util.TR('Browser Restart Configuration')),
                width: '100%',
                padding: '3 0 0 10',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                itemId: 'restart_panel_body',
                layout: 'hbox',
                width: '100%',
                flex: 1,
                style: { background: '#ffffff' }
            }]
        });

        this.target.add(panel);

        panel.add(repoPanel);
        panel.add(myview_panel);
        panel.add(mypermission_panel);
        panel.add(myservice_panel);
        panel.add(mypassword_panel);

        panel.add(alarmSetting_panel);
        this.alarmSetting(alarmSetting_panel.getComponent('alarm_panel_body'));

        if (!common.Menu.useOTP) {
            panel.add(restartConfig_panel);
        }
        this.browserRestartSetting(restartConfig_panel.getComponent('restart_panel_body'));

        // Chrome 43 이전 버전에서는 정상적으로 화면이 보여지는 43 버전에서
        // 화면에 내용이 표시되지 않는 현상이 발생해서 화면이 보여지도록 크기를 재설정함.
        // (추후 Chrome이 업데이트 되는 경우 해당 코드는 삭제 예정)
        panel.setWidth(panel.getWidth());

        this.repositorySetting(repoPanel.getComponent('repoPanel_body'));
        this.startViewSetting(myview_panel.getComponent('myview_panel_body'));
        this.permissionSetting(mypermission_panel.getComponent('mypermission_panel_title'), mypermission_panel.getComponent('mypermission_panel_body'));
        this.servicelistSetting(myservice_panel.getComponent('myservice_panel_title'), myservice_panel.getComponent('myservice_panel_body'));
        this.passwordSetting(mypassword_panel.getComponent('mypassword_panel_body'));
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    repositorySetting: function(target){
        var titleArea, bodyArea,
            repoInfoStore, repoCombo, saveButton,
            repoInfoList, repoInfo,
            ix, ixLen;

        target.add({
            xtype: 'container',
            layout: 'absolute',
            itemId: 'repositorySetting_title',
            width: 200,
            height: '100%',
            style: { background: '#eeeeee' }
        }, {
            xtype: 'container',
            layout: 'absolute',
            itemId: 'repositorySetting_body',
            flex: 1,
            height: '100%',
            style: { background: '#ffffff' }
        });

        titleArea = target.getComponent('repositorySetting_title');
        titleArea.add({
            xtype: 'label',
            x: 0,
            y: 10,
            width: 180,
            style: 'text-align:right;',
            html: common.Util.usedFont(9, common.Util.TR('Repository'))
        });

        bodyArea = target.getComponent('repositorySetting_body');
        repoInfoStore = Ext.create('Exem.Store');
        repoInfoList = cfg.repositoryInfo.other;
        for (ix = 0, ixLen = repoInfoList.length; ix < ixLen; ix++) {
            repoInfo = repoInfoList[ix];
            repoInfoStore.add({'1': repoInfo.database_name, '2': repoInfo.database_name});
        }

        repoCombo = Ext.create('Exem.ComboBox', {
            width: 200,
            height: 22,
            x: 15,
            y: 8,
            store: repoInfoStore
        });

        bodyArea.add(repoCombo);

        if (common.Util.isMultiRepository()) {
            common.DataModule.getGatherList(cfg.repositoryInfo.currentRepoName);
        } else {
            common.DataModule.getGatherList();
        }

        saveButton = Ext.create('Exem.Button', {
            text: common.Util.usedFont(9, common.Util.TR('Apply')),
            cls: 'x-btn-config-default',
            width: 200,
            height: 22,
            x: 13,
            y: 35,
            handler: function() {
                Ext.Msg.confirm(common.Util.TR(''), common.Util.TR('Do you want to change?'), function(choose) {
                    var tabList, currentActiveTab,
                        ix, ixLen;

                    currentActiveTab = cfg.tabpanel.getActiveTab();
                    if (choose == 'yes') {
                        tabList = cfg.tabpanel.items.items;

                        for(ix = tabList.length - 1, ixLen = -1; ix > ixLen; ix--){
                            if(tabList[ix].id == currentActiveTab.id){
                                continue;
                            }

                            tabList[ix].close();
                        }

                        cfg.repositoryInfo.currentRepoName = repoCombo.getReplValue();

                        if (common.Util.isMultiRepository()) {
                            common.DataModule.getGatherList(cfg.repositoryInfo.currentRepoName);
                        } else {
                            common.DataModule.getGatherList();
                        }
                    }
                    else{
                        repoCombo.selectExactByName(cfg.repositoryInfo.currentRepoName);
                    }
                });
            }
        });

        bodyArea.add(saveButton);

        var myRepo = Comm.web_env_info.Intermax_MyRepository || String(localStorage.getItem('Intermax_MyRepository'));
        if (myRepo !== 'null' && cfg.repositoryInfo.master && cfg.repositoryInfo.master.database_name != myRepo){
            cfg.repositoryInfo.currentRepoName = myRepo;
            repoCombo.selectExactByName(myRepo);
        }
        else{
            repoCombo.selectRow(0);
        }
    },

    startViewSetting: function(target) {
        var self = this;
        var classStore = Ext.create('Exem.Store');
        var menuData = common.Menu.mainMenuData;

        for(var i in menuData) {
            if (menuData[i].text != common.Util.TR('RealTime Monitor')) {
                classStore.add( { '1': menuData[i].cls, '2': menuData[i].text } );
            }
        }

        target.add({
            xtype: 'container',
            layout: 'absolute',
            itemId: 'startViewSetting_title',
            width: 200,
            height: '100%',
            style: { background: '#eeeeee' }
        }, {
            xtype: 'container',
            layout: 'absolute',
            itemId: 'startViewSetting_body',
            flex: 1,
            height: '100%',
            style: { background: '#ffffff' }
        });

        var title_area = target.getComponent('startViewSetting_title');
        title_area.add({
            xtype: 'label',
            x: 0,
            y: 10,
            width: 180,
            style: 'text-align:right;',
            html: common.Util.usedFont(9, common.Util.TR('Language'))
        }, {
            xtype: 'label',
            x: 0,
            y: 37,
            width: 180,
            style: 'text-align:right;',
            html: common.Util.usedFont(9, common.Util.TR('Theme'))
        },{
            xtype: 'label',
            x: 0,
            y: 64,
            width: 180,
            style: 'text-align:right;',
            html: common.Util.usedFont(9, common.Util.TR('Detail Elapse Filter'))
        });



        var body_area = target.getComponent('startViewSetting_body');

        var langStore = Ext.create('Exem.Store');
        var langCombo = Ext.create('Exem.ComboBox', {
            width: 200,
            height: 22,
            x: 15,
            y: 8,
            store : langStore
        });

        body_area.add(langCombo);

        var AJSON = {};
        AJSON.dll_name = "IntermaxPlugin.dll";

        var root = location.pathname.split('/')[1];
        AJSON.options  = { filepath: "\\"+root+"\\common\\locale\\" };
        AJSON.function =  "getDirectoryFileList";

        WS.PluginFunction( AJSON , function(aheader, adata) {
            var store = self.getLangStore(adata);
            langCombo.setStore(store);

            var lang = Comm.web_env_info.Intermax_MyLanguage || localStorage.getItem('Intermax_MyLanguage');

            if (lang !== null){
                langCombo.selectByName(lang);
            } else {
                langCombo.selectByName('en');
            }
        }, this);

        //Combo Box Theme Change
        var themeStore = Ext.create('Exem.Store');
        themeStore.add({'1': 'Black', '2': 'Black'});
        themeStore.add({'1': 'White', '2': 'White'});
        themeStore.add({'1': 'Gray',  '2': 'Gray'});

        var themeCombo = Ext.create('Exem.ComboBox', {
            width: 200,
            height: 22,
            x: 15,
            y: 35,
            store : themeStore
        });

        body_area.add(themeCombo);



        var elapse_filter = Ext.create('Exem.TextField',{
            x     : 15,
            y     : 62,
            width : 118,
            value : 1
        }) ;
        body_area.add( elapse_filter ) ;

        //

        var save_reload_button = Ext.create('Exem.Button', {
            text: common.Util.usedFont(9, common.Util.TR('Save & Reload')),
            cls: 'x-btn-config-default',
            width: 200,
            height: 22,
            x: 13,
            y: 89,
            handler: function() {
                localStorage.setItem('Intermax_MyLanguage', langCombo.getReplValue());
                localStorage.setItem('Intermax_DetailElapse', elapse_filter.getValue() );

                common.WebEnv.Save('Intermax_MyLanguage', langCombo.getReplValue(), cfg.setConfigToRepo);
                common.WebEnv.Save('Intermax_MyTheme', themeCombo.getReplValue(), cfg.setConfigToRepo);
                common.WebEnv.Save('Intermax_DetailElapse', elapse_filter.getValue(), null );

                if ( Comm.selectedServiceInfo != null) {
                    sessionStorage.setItem('Intermax_SelectedServiceInfo', JSON.stringify(Comm.selectedServiceInfo));
                    sessionStorage.setItem('Intermax_ServiceReconfigure', true);
                    sessionStorage.setItem('Intermax_MyTheme', Comm.web_env_info.Intermax_MyTheme);
                }

                try {
                    if (location.pathname.toLocaleLowerCase().indexOf('/config/view.html') >= 0) {
                        sessionStorage.removeItem('Intermax_ServiceReconfigure');
                        sessionStorage.removeItem('Intermax_SelectedServiceInfo');
                    }
                } catch (e) {
                    console.debug('');
                }

                location.reload();
            }
        });

        body_area.add(save_reload_button);

        var myLang = Comm.web_env_info.Intermax_MyLanguage || String(localStorage.getItem('Intermax_MyLanguage'));
        if (myLang !== 'null'){
            langCombo.selectByName(myLang);
        } else {
            langCombo.selectByName(window.nation);
        }

        var filter = Comm.web_env_info.Intermax_DetailElapse || localStorage.getItem('Intermax_DetailElapse');
        if ( !filter ){
            localStorage.setItem('Intermax_DetailElapse', 1) ;
            common.WebEnv.Save('Intermax_DetailElapse', 1 );
            filter = 1 ;
        }
        elapse_filter.setValue( filter ) ;


        var myTheme = Comm.web_env_info.Intermax_MyTheme;
        if ( myTheme){
            themeCombo.selectByName(myTheme) ;
        } else {
            if ($('body').hasClass('mx-theme-black')) {
                themeCombo.selectByName('Black');
            } else if ($('body').hasClass('mx-theme-gray')) {
                themeCombo.selectByName('Gray');
            } else {
                themeCombo.selectByName('White');
            }
        }
        filter = null ;
        myLang = null ;
        myTheme = null ;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getLangStore: function(data) {
        var index = 0;
        var filename = '';
        var lang_filename = '';
        var resultStore = Ext.create('Exem.Store');

        for (var ix = 0; ix < data.fileList.length; ix++) {
            filename = data.fileList[ix];
            if (filename.substr(0, 9) != 'exem-lang') {
                continue;
            }
            index = filename.indexOf('.');
            if ((index != -1) && (filename.substr(index+1, 2) == 'js')){
                lang_filename = filename.substr(10, index-10); // exem-lang-en.js
                resultStore.add({
                    '1': lang_filename,
                    '2': lang_filename
                });
            }
        }
        return resultStore;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    permissionSetting: function(title, target) {
        var L = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: 200,
            height: '100%',
            style: { background: '#eeeeee' }
        });

        var R = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: 150,
            height: '100%',
            style: { background: '#ffffff' }
        });

        target.add(L);
        target.add(R);

        title.add({
            xtype: 'container',
            x: 200,
            y: 0,
            html: '<img src="../images/realtime/realtime_cfg_title_vline.png"/>'
        }, {
            xtype: 'label',
            x: 200,
            y: 4,
            width: 150,
            style: 'text-align:center;',
            html: common.Util.usedFont(9, common.Util.TR('Kill Thread'))
        }, {
            xtype: 'container',
            x: 350,
            y: 0,
            html: '<img src="../images/realtime/realtime_cfg_title_vline.png"/>'
        }, {
            xtype: 'label',
            x: 350,
            y: 4,
            width: 150,
            style: 'text-align:center;',
            html: common.Util.usedFont(9, common.Util.TR('System Dump'))
        }, {
            xtype: 'container',
            x: 500,
            y: 0,
            html: '<img src="../images/realtime/realtime_cfg_title_vline.png"/>'
        }, {
            xtype: 'label',
            x: 500,
            y: 4,
            width: 150,
            style: 'text-align:center;',
            html: common.Util.usedFont(9, common.Util.TR('JSPD Property Change'))
        }, {
            xtype: 'container',
            x: 650,
            y: 0,
            html: '<img src="../images/realtime/realtime_cfg_title_vline.png"/>'
        }, {
            xtype: 'label',
            x: 650,
            y: 4,
            width: 150,
            style: 'text-align:center;',
            html: common.Util.usedFont(9, common.Util.TR('Show Bind Variable'))
        }, {
            xtype: 'container',
            x: 800,
            y: 0,
            html: '<img src="../images/realtime/realtime_cfg_title_vline.png"/>'
        });

        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_MyView_Permission.sql';
        dataSet.replace_string = [{
            name    :   'user_id',
            value   :   cfg.login.user_id
        }];

        WS.SQLExec(dataSet, function(aheader, adata) {
            if (adata.rows.length > 0) {
                var _kill_thread   = adata.rows[0][0];
                var _system_dump   = adata.rows[0][1];
                var _property_load = adata.rows[0][2];
                var _bind          = adata.rows[0][3];

                if (_kill_thread == 1) {
                    R.add({
                        xtype: 'container',
                        x: 0,
                        y: 10,
                        width: 150,
                        style: 'text-align:center;',
                        html: '<img src="../images/realtime/realtime_cfg_checkmark.png"/>'
                    });
                }

                if (_system_dump == 1) {
                    R.add({
                        xtype: 'container',
                        x: 150,
                        y: 10,
                        width: 150,
                        style: 'text-align:center;',
                        html: '<img src="../images/realtime/realtime_cfg_checkmark.png"/>'
                    });
                }

                if (_property_load == 1) {
                    R.add({
                        xtype: 'container',
                        x: 300,
                        y: 10,
                        width: 150,
                        style: 'text-align:center;',
                        html: '<img src="../images/realtime/realtime_cfg_checkmark.png"/>'
                    });
                }


                if (_bind == 1) {
                    R.add({
                        xtype: 'container',
                        x: 450,
                        y: 10,
                        width: 150,
                        style: 'text-align:center;',
                        html: '<img src="../images/realtime/realtime_cfg_checkmark.png"/>'
                    });
                }
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    servicelistSetting: function(title, target) {
        var dataSet = {};
        var htmlimage = '<img src="../images/realtime/realtime_cfg_title_vline.png"/>';

        var L = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            itemId: 'servicelistSetting_title',
            width: 200,
            height: '100%',
            style: { background: '#eeeeee' }
        });

        var R = Ext.create('Ext.container.Container', {
            layout    : 'border',
            itemId    : 'servicelistSetting_body',
            flex      : 1,
            height    : '100%',
            style     : { background: '#ffffff' },
            autoScroll: true
        });

        target.add(L);
        target.add(R);

        title.add({ xtype: 'container', x: 200, y: 0, html: htmlimage },
            { xtype: 'container', x: 350, y: 0, html: htmlimage },
            { xtype: 'container', x: 800, y: 0, html: htmlimage },
            { xtype: 'label', x: 200, y: 4, width: 150, style: 'text-align:center;', html: common.Util.usedFont(9, common.Util.TR('Service ID')) },
            { xtype: 'label', x: 370, y: 4, width: 430, style: 'text-align:left;', html: common.Util.usedFont(9, common.Util.TR('Service Name')) });

        dataSet.sql_file = 'IMXConfig_MyView_Service_List.sql';
        dataSet.replace_string = [{
            name    :   'user_id',
            value   :   cfg.login.user_id
        }];

        WS.SQLExec(dataSet, function(aheader, adata) {
            var color = '';
            for (var ix = 0; ix < adata.rows.length; ix++) {
                color = (ix % 2 == 0) ? '#f5f5f5' : '#ffffff';
                R.add({
                    xtype: 'container',
                    layout: 'absolute',
                    region: 'north',
                    width: '100%',
                    height: 25,
                    style: { background: color },
                    items: [{
                        xtype: 'label',
                        x: 0,
                        y: 4,
                        width: 150,
                        style: 'text-align:center;',
                        html: common.Util.usedFont(9, adata.rows[ix][0])
                    }, {
                        xtype: 'label',
                        x: 170,
                        y: 4,
                        width: 430,
                        style: 'text-align:left;',
                        html: common.Util.usedFont(9, adata.rows[ix][1])
                    }]
                });
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    passwordSetting: function(target) {
        var L = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            itemId: 'passwordSetting_title',
            width: 200,
            height: '100%',
            style: { background: '#eeeeee' }
        });

        var R = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            itemId: 'passwordSetting_body',
            width: 200,
            height: '100%',
            style: { background: '#ffffff' }
        });

        target.add(L);
        target.add(R);

        R.add({
            xtype: 'textfield',
            itemId: 'changePassword_textfield',
            inputType: 'password',
            cls: 'login_area_idpweditbox',
            emptyText:common.Util.TR('Change password'),
            x: 10,
            y: 15,
            width: 200,
            height: 22,
            listeners: {
                'change': function() {
                    var pwTxt = R.getComponent('changePassword_textfield');
                    var pwTxtConfirm = R.getComponent('changePasswordConfirm_textfield');
                    var checkButton = R.getComponent('checkButton');

                    if (pwTxt.getValue().trim() == '' || pwTxtConfirm.getValue().trim() == '') {
                        checkButton.setDisabled(true);
                    } else {
                        checkButton.setDisabled(false);
                    }
                }
            }
        });

        R.add({
            xtype: 'textfield',
            itemId: 'changePasswordConfirm_textfield',
            inputType: 'password',
            cls: 'login_area_idpweditbox',
            emptyText:common.Util.TR('Confirm Password'),
            x: 10,
            y: 45,  // 15
            width: 200,
            height: 22,
            listeners: {
                'change': function() {
                    var pwTxt = R.getComponent('changePassword_textfield');
                    var pwTxtConfirm = R.getComponent('changePasswordConfirm_textfield');
                    var checkButton = R.getComponent('checkButton');

                    if (pwTxt.getValue().trim() == '' || pwTxtConfirm.getValue().trim() == '') {
                        checkButton.setDisabled(true);
                    } else {
                        checkButton.setDisabled(false);
                    }
                }
            }
        });

        R.add({
            xtype: 'button',
            itemId: 'checkButton',
            text: common.Util.usedFont(9, common.Util.TR('Change')),
            cls: 'x-btn-config-default',
            disabled:true,
            width: 100,
            height: 22,
            x: 220,
            y: 42,  // 12
            handler: function() {
                var edit = R.getComponent('changePassword_textfield');
                var editConfirm = R.getComponent('changePasswordConfirm_textfield');
                var objDefault  = {};
                var objMaster = {};
                var optionList;

                if ( edit.getValue() == '' ) {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Sorry, your password is incorrect. Please try again.'));
                    return edit.focus();
                }

                if ( (edit.getValue()).indexOf(' ') > -1 ) {
                    Ext.Msg.alert('ERROR', common.Util.TR('Blank Character is not allowed'));
                    return edit.focus();
                }

                if ( edit.getValue() != editConfirm.getValue()) {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Sorry, your password is incorrect. Please try again.'));
                    return editConfirm.focus();
                }

                optionList = {
                    type    : 'update',
                    login_id: cfg.login.login_id,
                    password: edit.getValue()
                };

                objMaster.dll_name = 'IntermaxPlugin.dll';
                objMaster.options  = optionList;

                if(common.Util.isMultiRepository()){
                    objDefault.dll_name = 'IntermaxPlugin.dll';
                    objDefault.options  = optionList;
                    objDefault.options.dbname = cfg.repositoryInfo.currentRepoName;
                    objDefault['function'] = 'checkLogin';
                    WS.PluginFunction(objDefault, null, null);

                    objMaster.options.dbname = cfg.repositoryInfo.master.database_name;
                } else{
                    //Comm.currentRepositoryInfo.database_name (이전 코드상의 dbname 값)
                    objMaster.options.dbname = cfg.repositoryInfo.currentRepoName;
                }
                objMaster['function'] = 'checkLogin';
                WS.PluginFunction(objMaster, function(aheader, adata) {
                    if (adata.result == 'true') {
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Saved.'));
                    }
                });
            }
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    alarmSetting: function(target) {
        var self = this;

        var left = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            itemId: 'alarmSoundSetting_title',
            width : 200,
            height: '100%',
            style: { background: '#eeeeee' },
            items:[{
                xtype: 'label',
                x: 0,
                y: 15,
                width: 180,
                style: 'text-align:right;',
                html: common.Util.usedFont(9, common.Util.TR('Alarm Sound'))
            }, {
                xtype: 'label',
                x: 0,
                y: 45,
                width: 180,
                style: 'text-align:right;',
                html: common.Util.usedFont(9, common.Util.TR('Alarm Popup'))
            }]
        });

        var right = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            itemId: 'alarmSoundSetting_body',
            height: '100%',
            style : { background: '#ffffff' }
        });

        var toggleAllOnOff = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width  : 100,
            margin: '1 1 0 1',
            onText : common.Util.TR('On'),
            offText: common.Util.TR('Off'),
            state  : (Comm.web_env_info.AlarmSoundOn == 'ON'),
            listeners: {
                change: function() {
                    if (this.getValue()) {
                        common.WebEnv.Save('AlarmSoundOn', 'ON');
                        target.down('#c_play_checkbox').setDisabled(false);
                        target.down('#w_play_checkbox').setDisabled(false);
                    } else {
                        common.WebEnv.Save('AlarmSoundOn', 'OFF');
                        target.down('#c_play_checkbox').setDisabled(true);
                        target.down('#w_play_checkbox').setDisabled(true);
                    }
                }
            }
        });

        var configAlarmSoundField = Ext.create('Ext.form.FieldSet', {
            x: 10,
            y: 15,
            border: false,
            items: [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                margin: '0 0 0 0',
                items: [toggleAllOnOff,
                    {
                        xtype : 'tbspacer',
                        width : 1,
                        height: 23,
                        margin: '0 25 0 10',
                        style : 'background-image: url(../images/sidebyside_white.png);'
                    }, {
                        xtype: 'checkbox',
                        itemId:'c_play_checkbox',
                        labelSeparator: '',
                        boxLabel: common.Util.TR('Critical'),
                        disabled: (Comm.web_env_info.AlarmSoundOn !== 'ON'),
                        checked : (Comm.web_env_info.AlarmSoundCritical === 'ON'),
                        fieldStyle: 'background-image: url(../images/xm_icon_White_v1.png);'+
                        'width: 16px;' +
                        'height: 16px;'+
                        'margin-top: 3px;'+
                        'background-position: '+ ((Comm.web_env_info.AlarmSoundCritical == 'ON')? '-5px -160px;':'-5px -177px;')+
                        'cursor: pointer;',
                        listeners: {
                            change: function(f, nval) {
                                if (nval) {
                                    f.setFieldStyle('background-position: -5px -160px');
                                    common.WebEnv.Save('AlarmSoundCritical', 'ON');
                                } else {
                                    f.setFieldStyle('background-position: -5px -177px');
                                    common.WebEnv.Save('AlarmSoundCritical', 'OFF');
                                }
                            }
                        }
                    },{
                        xtype: 'button',
                        itemId:'c_play_button',
                        margin: '4 0 0 10',
                        padding: '0 0 0 0',
                        width: 18,
                        height: 15,
                        style: {
                            border: 'none',
                            width: '18px',
                            backgroundRepeat: 'no-repeat',
                            height: '15px',
                            background: 'url(../images/earphone_MouseOff.png)'
                        },
                        isPressed : false,
                        handler : function(me) {
                            if (me.isPressed === true) {
                                me.isPressed = false;
                                target.down('#w_play_button').setDisabled(false);
                                target.down('#w_play_button').setStyle('opacity', '1');

                                self.alarmObj.critical.stop();

                                me.setStyle('background', 'url(../images/earphone_MouseOff.png)');

                            } else {
                                me.isPressed = true;
                                target.down('#w_play_button').setDisabled(true);
                                target.down('#w_play_button').setStyle('opacity', '0.3');

                                self.alarmObj.critical.play();

                                me.setStyle('background', 'url(../images/earphone_MouseOn.png)');
                            }
                        }
                    },{
                        xtype: 'checkbox',
                        itemId:'w_play_checkbox',
                        margin: '0 0 0 30',
                        labelSeparator: '',
                        boxLabel: common.Util.TR('Warning'),
                        disabled: (Comm.web_env_info.AlarmSoundOn !== 'ON'),
                        checked   : (Comm.web_env_info.AlarmSoundWarning === 'ON'),
                        fieldStyle: 'background-image: url(../images/xm_icon_White_v1.png);'+
                        'width: 16px;' +
                        'height: 16px;'+
                        'margin-top: 3px;'+
                        'background-position: '+ ((Comm.web_env_info.AlarmSoundWarning == 'ON')? '-5px -160px;':'-5px -177px;')+
                        'cursor: pointer;',
                        listeners: {
                            change: function(f, nval) {
                                if (nval) {
                                    f.setFieldStyle('background-position: -5px -160px');
                                    common.WebEnv.Save('AlarmSoundWarning', 'ON');
                                } else {
                                    f.setFieldStyle('background-position: -5px -177px');
                                    common.WebEnv.Save('AlarmSoundWarning', 'OFF');
                                }
                            }
                        }
                    },{
                        xtype: 'button',
                        itemId:'w_play_button',
                        margin: '4 0 0 10',
                        padding: '0 0 0 0',
                        width: 18,
                        height: 15,
                        style: {
                            border: 'none',
                            width: '18px',
                            backgroundRepeat: 'no-repeat',
                            height: '15px',
                            background: 'url(../images/earphone_MouseOff.png)'
                        },
                        isPressed: false,
                        handler : function(me) {
                            if (me.isPressed === true) {
                                me.isPressed = false;
                                target.down('#c_play_button').setDisabled(false);
                                target.down('#c_play_button').setStyle('opacity', '1');

                                self.alarmObj.warning.stop();

                                me.setStyle('background', 'url(../images/earphone_MouseOff.png)');

                            } else {
                                me.isPressed = true;
                                target.down('#c_play_button').setDisabled(true);
                                target.down('#c_play_button').setStyle('opacity', '0.2');

                                self.alarmObj.warning.play();

                                me.setStyle('background', 'url(../images/earphone_MouseOn.png)');
                            }
                        }
                    }]
            }]
        });

        var togglePopupOnOff = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width  : 100,
            margin: '1 1 0 1',
            onText : common.Util.TR('On'),
            offText: common.Util.TR('Off'),
            state  : (this.popupObj.alarmPopup == 'ON'),
            listeners: {
                change: function(toggle, state) {
                    if (state) {
                        this.popupObj.alarmPopup = 'ON';
                        this.popupDetailAll.setDisabled(false);
                        this.popupDetailDB.setDisabled(false);
                        this.popupDetailSERVER.setDisabled(false);
                        this.popupDetailDG.setDisabled(false);
                        this.popupDetailPJS.setDisabled(false);
                    } else {
                        this.popupObj.alarmPopup = 'OFF';
                        this.popupDetailAll.setDisabled(true);
                        this.popupDetailDB.setDisabled(true);
                        this.popupDetailSERVER.setDisabled(true);
                        this.popupDetailDG.setDisabled(true);
                        this.popupDetailPJS.setDisabled(true);
                    }

                    common.WebEnv.Save('JSON_RTM_ALARM_POPUP_OPTION', JSON.stringify(this.popupObj));
                }.bind(this)
            }
        });

        this.popupDetailAll        = this.addCheckBox('All',        'All');
        this.popupDetailDB         = this.addCheckBox('Database',   'DB');
        this.popupDetailSERVER     = this.addCheckBox('Server',     'SERVER');
        this.popupDetailDG         = this.addCheckBox('DataGather', 'DG');
        this.popupDetailPJS        = this.addCheckBox('PlatformJS', 'PJS');

        var configAlarmPopupField = Ext.create('Ext.form.FieldSet', {
            x: 10,
            y: 45,
            border: false,
            items: [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                margin: '0 0 0 0',
                items: [togglePopupOnOff,
                    {
                        xtype : 'tbspacer',
                        width : 1,
                        height: 23,
                        margin: '0 25 0 10',
                        style : 'background-image: url(../images/sidebyside_white.png);'
                    }, this.popupDetailAll, this.popupDetailDB, this.popupDetailSERVER, this.popupDetailDG, this.popupDetailPJS]
            }]
        });

        right.add(configAlarmSoundField);
        right.add(configAlarmPopupField);
        target.add(left, right);
    },

    browserRestartSetting: function(target) {
        var checkTime = localStorage.getItem('Intermax_Restart_Time');
        var checkHour   = 0;
        var checkMinute = 0;
        if (checkTime != null) {
            var values = checkTime.split(':');
            if (values.length == 2) {
                checkHour   = +values[0];
                checkMinute = +values[1];
            }
        }

        var left = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            itemId: 'restartSetting_title',
            width : 200,
            height: '100%',
            style: { background: '#eeeeee' },
            items:[{
                xtype: 'label',
                x: 0,
                y: 15,
                width: 180,
                style: 'text-align:right;'
            }]
        });

        var right = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            itemId: 'restartSetting_body',
            height: '100%',
            style : { background: '#ffffff' }
        });

        var isObserverOn = false;
        var toggleAllOnOff = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width  : 100,
            margin: '1 1 0 1',
            onText : common.Util.TR('On'),
            offText: common.Util.TR('Off'),
            state  : (localStorage.getItem('Intermax_Observer_Execute') == 'true'),
            listeners: {
                change: function() {
                    if (this.getValue()) {
                        isObserverOn = true;
                        target.down('#hourCombo').setDisabled(false);
                        target.down('#minuteCombo').setDisabled(false);
                    } else {
                        isObserverOn = false;
                        target.down('#hourCombo').setDisabled(true);
                        target.down('#minuteCombo').setDisabled(true);
                    }
                }
            }
        });

        var hourStore = Ext.create('Exem.Store');
        for (var ix = 0; ix < 24; ix++) {
            hourStore.add({'1': ix, '2': ix});
        }

        var minStore = Ext.create('Exem.Store');
        for (ix = 0; ix <= 11; ix++) {
            minStore.add({'1': ix*5, '2': ix*5});
        }


        var hourCombo = Ext.create('Exem.ComboBox', {
            width : 60,
            height: 22,
            margin: '0 10 0 0',
            itemId : 'hourCombo',
            disabled: (localStorage.getItem('Intermax_Observer_Execute') != 'true'),
            x: 5,
            y: 62,
            store : hourStore
        });

        var minCombo = Ext.create('Exem.ComboBox', {
            width: 60,
            height: 22,
            margin: '0 10 0 0',
            itemId : 'minuteCombo',
            disabled: (localStorage.getItem('Intermax_Observer_Execute') != 'true'),
            x: 5,
            y: 62,
            store : minStore
        });

        var configField = Ext.create('Ext.form.FieldSet', {
            x: 10,
            y: 15,
            border: false,
            items: [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                margin: '0 0 0 0',
                items: [toggleAllOnOff, hourCombo, {
                    xtype: 'label',
                    margin: '5 0 0 0',
                    width: 40,
                    text: common.Util.TR('Hour')
                }, minCombo,{
                    xtype: 'label',
                    margin: '5 0 0 0',
                    width: 40,
                    text: common.Util.TR('Minute')
                },
                    {
                        xtype: 'button',
                        text: common.Util.usedFont(9, common.Util.TR('Apply')),
                        cls: 'x-btn-config-default',
                        width: 100,
                        height: 22,
                        margin: '0 0 0 10',
                        handler: function() {
                            Ext.MessageBox.confirm(common.Util.TR(''), common.Util.TR('Do you want to apply?'), function(btn) {
                                if (btn == 'yes') {
                                    var time   = target.down('#hourCombo').getValue();
                                    var minute = target.down('#minuteCombo').getValue();

                                    localStorage.setItem('Intermax_Observer_Execute', isObserverOn);
                                    localStorage.setItem('Intermax_Restart_Time', time+':'+minute);

                                    var refreshMessage = common.Util.TR('Change Success');

                                    if (!isObserverOn) {
                                        Ext.Msg.alert(common.Util.TR(''), refreshMessage);
                                    } else {
                                        refreshMessage = refreshMessage +'<br>'+common.Util.TR('To apply the changes made, you may need to refresh the browser. Do you want to now refresh?');
                                        Ext.Msg.confirm(common.Util.TR(''), refreshMessage, function(btn2) {
                                            if (btn2 == 'yes') {
                                                window.parent.location.reload();
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }]
            }]
        });

        right.add(configField);
        target.add(left, right);

        hourCombo.setValue(checkHour);
        minCombo.setValue(checkMinute);
    },

    addCheckBox: function (name, id) {
        return Ext.create('Ext.form.field.Checkbox', {
            boxLabel: name,
            height: 18,
            margin : id == 'All' ? null : '0 0 0 10',
            itemId: id,
            checked : this.popupObj[id] == 'ON',
            fieldStyle: 'background-image: url(../images/xm_icon_White_v1.png);'+
            'width: 16px;' +
            'height: 16px;'+
            'margin-top: 3px;'+
            'background-position: '+ ((this.popupObj[id] == 'ON') ? '-5px -160px;':'-5px -177px;') +
            'cursor: pointer;',
            listeners: {
                afterrender: function(me) {
                    if (this.popupObj['alarmPopup'] == 'OFF') {
                        me.setDisabled(true);
                    }
                }.bind(this),

                change: function(me, newValue){
                    if (newValue) {
                        if (id == 'All') {
                            this.popupDetailDB.setValue(false);
                            this.popupDetailSERVER.setValue(false);
                            this.popupDetailDG.setValue(false);
                            this.popupDetailPJS.setValue(false);
                        } else {
                            this.popupDetailAll.setValue(false);
                        }
                        this.popupObj[id] = 'ON';
                        me.setFieldStyle('background-position: -5px -160px');
                    } else {
                        this.popupObj[id] = 'OFF';
                        me.setFieldStyle('background-position: -5px -177px');
                    }

                    common.WebEnv.Save('JSON_RTM_ALARM_POPUP_OPTION', JSON.stringify(this.popupObj));
                }.bind(this)
            }
        });
    }
});
