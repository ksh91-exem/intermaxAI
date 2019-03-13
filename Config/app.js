Ext.Loader.setPath({
    'config': '../Config/src',
    'rtm'   : '../RTM',
    'view'  : '../PA/view',
    'Exem'  : '../Exem',
    'Ext.ux': '../extjs/src/ux'
});

Ext.require([
    'common.Menu',
    'common.OpenView',
    'common.WebSocket',
    'common.Util',
    'common.DataModule',
    'common.WebEnv'
]);

Ext.application({
    name: 'Intermax',
    appFolder: location.pathname.split('/')[1],

    launch: function() {
        var self = this;

        Comm.Lang = localStorage.getItem('Intermax_MyLanguage');
        common.DataModule.init();

        this.viewport = Ext.create('Ext.container.Container', {
            id: 'viewPort',
            layout: 'border',
            width: '100%',
            height: '100%',
            cls: 'viewport',
            renderTo: Ext.get('homediv')
        });
        Ext.EventManager.onWindowResize(function() {
            self.viewport.setSize(window.innerWidth, window.innerHeight);
        });

        this.tabPanel = Ext.create('Exem.MainTabPanel');

        this.continue_process();
    },


    login_process: function() {
        Comm.after_login_process = this.after_login;
        this.login = Ext.create('login');
        this.login.parent = this;
        this.login.init(this.viewport);
    },

    continue_process: function() {
        //common.DataModule.getGatherList()

        this.viewport.removeAll();
        //realtime.maintab = this.tabPanel
        this.viewport.add(this.tabPanel);
        this.after_login();
    },

    after_login: function() {

        // Setting logo image by langauge.
        if (navigator.language === 'ko' || navigator.language === 'ko-KR') {
            $('body').append('<div class="header-log" style="background:url(../images/InterMax_Logo.png) no-repeat">');
        } else {
            $('body').append('<div class="header-log" style="background:url(../images/InterMax_Logo_Global.png) no-repeat">');
        }

        window.CFGShow = true;
        common.OpenView.onMenuItemClick( null, 'config.config');
    }
});
