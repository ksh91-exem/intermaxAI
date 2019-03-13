Ext.define("view.ConfigMyView", {
    extend: "Exem.Form",
    width: '100%',
    height: '100%',
    layout: 'absolute',
    style: {
        background: '#cccccc'
    },

    init: function() {
        var self = this;

        var classStore = Ext.create('Exem.Store'),
            menuData = common.Menu.mainMenuData;

        for(var i in menuData){
            if(menuData.hasOwnProperty(i)){
                classStore.add( { '1': menuData[i].cls, '2': menuData[i].text } );
            }
        }


        var classCombo = Ext.create('Exem.ComboBox', {
            fieldLabel: 'AutoLoad View',
            width: 300,
            height: 20,
            x: 0, y: 10,
            store : classStore
        });
        var btn = Ext.create('Exem.Button', {
            text: 'OK',
            height: 20,
            x: 300, y: 10,
            handler: function() {
                localStorage.setItem('Intermax_MyView', classCombo.getReplValue() );
                location.reload();
            }
        });
        var clearBtn = Ext.create('Exem.Button', {
            text: 'Clear MyView',
            height: 20,
            x: 330, y: 10,
            handler: function() {
                localStorage.removeItem('Intermax_MyView');
                location.reload();
            }
        });


        var repoInfoStore = Ext.create('Exem.Store');
        for(i in Comm.repositoryInfo) {
            if(Comm.repositoryInfo.hasOwnProperty(i)){
                repoInfoStore.add({'1': Comm.repositoryInfo[i]['database_name'],
                    '2': Comm.repositoryInfo[i]['database_name']});
            }
        }

        var repoCombo = Ext.create('Exem.ComboBox', {
            fieldLabel: 'Repository',
            width: 300,
            height: 20,
            x: 0, y: 40,
            store : repoInfoStore
        });

        var repoBtn = Ext.create('Exem.Button', {
            text: 'OK',
            height: 20,
            x: 300, y: 40,
            handler: function() {
                localStorage.setItem('Intermax_MyRepository', repoCombo.getReplValue() );
                location.reload();
            }
        });

        var langStore = Ext.create('Exem.Store');
        for(i in common.DataModule.languageList) {
            if(common.DataModule.languageList.hasOwnProperty(i)){
                langStore.add({
                    '1': common.DataModule.languageList[i],
                    '2': i
                });
            }
        }

        var langCombo = Ext.create('Exem.ComboBox', {
            fieldLabel: 'Language',
            width: 300,
            height: 20,
            x: 0, y: 70,
            store : langStore
        });

        var langBtn = Ext.create('Exem.Button', {
            text: 'OK',
            height: 20,
            x: 300, y: 70,
            handler: function() {
                localStorage.setItem('Intermax_MyLanguage', langCombo.getReplValue() );
                location.reload();
            }
        });

        var changeSvcLabel = Ext.create('Ext.form.Label', {
            x: 0, y: 100,
            width: 100,
            text: 'Change Service',
            style: 'text-align:right;'
        });
        var changeSvcBtn = Ext.create('Exem.Button', {
            text : 'Open',
            height: 20,
            x: 105, y: 100,
            handler: function() {
                Comm.selectService.show();
            }
        });

// ====================================================================================================== Menu View ==========
        var MenuAnimateView = Ext.create('Exem.Store');
             MenuAnimateView.add({ '1': 'MenuAnimate', '2': 'MenuAnimate'});
             MenuAnimateView.add({ '1': 'NotAnimate',  '2': 'NotAnimate'});

        var MenuAnimateCombo = Ext.create('Exem.ComboBox', {
            fieldLabel: 'MenuAnimate',
            width: 300,
            height: 20,
            x: 0, y: 130,
            store : MenuAnimateView
        });

        var MenuAnimateBtn = Ext.create('Exem.Button', {
            text: 'OK',
            height: 20,
            x: 300, y: 130,
            handler: function() {
                localStorage.setItem('MenuAnimate', MenuAnimateCombo.getReplValue() );
                location.reload();
            }
        });
// ====================================================================================================== Menu View ==========

        self.add([classCombo, btn, clearBtn, repoCombo, repoBtn, langCombo, langBtn, changeSvcLabel, changeSvcBtn, MenuAnimateCombo, MenuAnimateBtn ]);


        var myView = String(localStorage.getItem('Intermax_MyView'));
        if (myView !== 'null')
            classCombo.selectByValue(myView);

        var myRepo = String(localStorage.getItem('Intermax_MyRepository'));
        if (myRepo !== 'null')
            repoCombo.selectByName(myRepo);
        else
            repoCombo.selectByName(Comm.currentRepositoryInfo.database_name);

        var myLang = String(localStorage.getItem('Intermax_MyLanguage'));
        if (myLang !== 'null'){
            langCombo.selectByName(myLang);
        }else{
            langCombo.selectByName(window.nation);
        }

// ====================================================================================================== Menu View ==========
        var menuAni = String(localStorage.getItem('MenuAnimate'));
        if (menuAni !== 'null'){
            MenuAnimateCombo.selectByName(menuAni);
        }else{
            MenuAnimateCombo.selectByName('MenuAnimate');
        }
// ====================================================================================================== Menu View ==========

    },

    config: function() {
        //var ws = localStorage.getItem('Intermax_WSAddress').substring(0, 18)+'9';
        //localStorage.setItem('Intermax_WSAddress', ws);
    }
});