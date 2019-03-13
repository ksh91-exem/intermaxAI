(function() {

    common.Menu.hiddenList = null;

    var isEanbleMenuConfig = common.Util.checkOverVersion('5.1.160321.01');

    if (isEanbleMenuConfig === true) {
        Ext.Ajax.request({
            url: '../Menu.conf',
            success: function(response) {
                common.Menu.hiddenList = [];

                var obj;

                try {
                    obj = Ext.decode(response.responseText);

                    var checkCategories = function(id) {
                        var ix;
                        for (ix = 0; ix < common.Menu.Menucategorization.length; ) {
                            if (common.Menu.Menucategorization[ix].PGID === id) {
                                Ext.Array.removeAt(common.Menu.Menucategorization, ix);
                                ix--;
                            }
                            ix++;
                        }
                        for (ix = 0; ix < common.Menu.mainMenuData.length; ) {
                            if (common.Menu.mainMenuData[ix].PGID === id) {
                                Ext.Array.removeAt(common.Menu.mainMenuData, ix);
                                ix--;
                            }
                            ix++;
                        }
                    };

                    var checkMenu = function(id) {
                        for (var ix = 0; ix < common.Menu.mainMenuData.length; ) {
                            if (common.Menu.mainMenuData[ix].ID === id) {
                                Ext.Array.removeAt(common.Menu.mainMenuData, ix);
                                ix--;
                            }
                            ix++;
                        }
                    };

                    var ix;
                    common.Menu.categoriesConf = {};
                    for (ix = 0; ix < obj.categories.length; ix++) {
                        if (obj.categories[ix].hide === true) {
                            checkCategories(obj.categories[ix].id);
                        }

                        common.Menu.categoriesConf[obj.categories[ix].id] = obj.categories[ix].hide;
                    }

                    for (ix = 0; ix < obj.menu.length; ix++) {
                        if (obj.menu[ix].hide === true) {
                            checkMenu(obj.menu[ix].id);
                        }
                    }

                    for (ix = 0; ix < obj.configMenu.length; ix++) {
                        if (obj.configMenu[ix].hide === true) {
                            common.Menu.hiddenList.push(obj.configMenu[ix].id);
                        }
                    }

                } catch(e) {
                    console.debug('%c [Menu Configuration] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', e.message);
                }
            },
            failure: function(response) {
                console.debug('%c [Menu Configuration] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;',
                    'Server-side failure with status code ' + response.status);
            }
        });
    }

})();
