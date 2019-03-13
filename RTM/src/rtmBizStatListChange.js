Ext.define('rtm.src.rtmBizStatListChange', {
    extend   : 'Exem.XMWindow',
    title    : common.Util.TR('Stat Change'),
    layout   : 'fit',
    width    : 700,
    height   : 300,
    minWidth : 600,
    minHeight: 300,
    modal    : true,

    cls      : 'xm-dock-window-base',
    bodyStyle: {
        padding: '10px'
    },

    listeners: {
        show: function() {
            this.showEvent(this.statGrid, this.statId);
            this.showEvent(this.bizGrid, this.bizId);
        }
    },

    showEvent: function(grid, recordId) {
        var row = grid.getStore().findRecord('Id', recordId);

        if ( !Ext.isEmpty(row) ) {
            grid.getView().focusRow(row);
            grid.getSelectionModel().select(row);
        }

        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
    },

    init: function() {
        this.initLayout();
        this.initDataSetting();
    },

    initLayout: function() {
        var baseCon = Ext.create('Ext.container.Container', {
            layout : {
                type : 'vbox',
                pack  : 'middle'
            },
            width : '100%',
            flex : 1,
            cls  : 'rtm-statchange-base'
        });

        this.createBizStatChangeCon();
        this.createButtonCon();

        baseCon.add( this.bizStatChangeCon, this.buttonCon );

        this.add( baseCon );
    },

    createBizStatChangeCon: function() {
        this.bizStatChangeCon = Ext.create( 'Ext.container.Container', {
            layout : 'fit',
            flex   : 1,
            width  : '100%'
        });

        var hBoxCon = Ext.create( 'Ext.container.Container', {
            layout : 'hbox',
            height : '100%',
            width  : '100%'
        });

        this.createStatChangeCon();
        this.createBizChangeCon();

        hBoxCon.add( this.statChangeCon, this.bizChangeCon );

        this.bizStatChangeCon.add( hBoxCon );
    },

    createStatChangeCon: function() {
        this.statChangeCon = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '50%',
            margin : '0 5 0 0'
        });

        this.searchNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls: 'rtm-list-condition',
            width: '100%',
            data : [],
            enableKeyEvents: true,
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findStatValue('stat');
                }
            }
        });

        var statStore = Ext.create( 'Ext.data.Store', {
            fields  : [
                {name : 'Index',    type : 'int' },
                {name : 'Id',       type : 'string'  },
                {name : 'Display',  type : 'string'  }
            ],
            data    : []
        });

        this.statGrid = Ext.create( 'Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            store       : statStore,
            cls         : 'baseGridRTM',
            bodyStyle   : {'border-bottom-width':'1px'},
            columns     : [
                { text: 'Index',    dataIndex : 'Index',    hidden: true},
                { text: 'Id',       dataIndex : 'Id' ,      hidden: true},
                { text: 'Display',  dataIndex : 'Display',  flex  : 1   }
            ],
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                mode: 'SINGLE',
                enableKeyNav: false
            }),
            listeners: {
                scope: this,
                itemclick: function(thisGrid, record) {

                    if ( !Ext.isEmpty(record) ) {
                        this.statId = record.data.Id;
                        this.statName = record.data.Display;
                        if ( thisGrid.store.getCount() !== this.searchNameCombo.store.getCount()
                            && this.searchNameCombo.data.length ) {
                            this.searchNameCombo.store.loadData(this.searchNameCombo.data);
                        }
                        this.searchNameCombo.setValue(this.statId);
                    }
                }
            }
        });

        this.statChangeCon.add( this.searchNameCombo, this.statGrid );
    },

    createBizChangeCon: function() {
        this.bizChangeCon = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '50%',
            margin : '0 0 0 5'
        });

        this.searchBizCombo = Ext.create('Exem.AjaxComboBox',{
            cls: 'rtm-list-condition',
            width: '100%',
            data : [],
            enableKeyEvents: true,
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findStatValue('biz');
                }
            }
        });

        var bizStatStore = Ext.create('Ext.data.Store', {
            fields  : [
                {name : 'Index',    type : 'int' },
                {name : 'Id',       type : 'string'  },
                {name : 'Display',  type : 'string'  }
            ],
            data    : []
        });

        this.bizGrid = Ext.create('Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            store       : bizStatStore,
            cls         : 'baseGridRTM',
            bodyStyle   : {'border-bottom-width':'1px'},
            columns     : [
                { text: 'Index',    dataIndex : 'Index',    hidden: true },
                { text: 'Id',       dataIndex : 'Id' ,      hidden: true },
                { text: 'Display',  dataIndex : 'Display',  flex  : 1   }
            ],
            selModel : Ext.create('Ext.selection.CheckboxModel', {
                showHeaderCheckbox: false,
                mode: 'SINGLE',
                enableKeyNav: false
            }),
            listeners: {
                scope: this,
                itemclick: function(thisGrid, record) {
                    if ( !Ext.isEmpty(record) ) {
                        this.bizId = record.data.Id;
                        this.bizName = record.data.Display;
                        if ( thisGrid.store.getCount() !== this.searchBizCombo.store.getCount()
                            && this.searchBizCombo.data.length ) {
                            this.searchBizCombo.store.loadData(this.searchBizCombo.data);
                        }
                        this.searchBizCombo.setValue(this.bizId);
                    }
                }
            }
        });

        this.bizChangeCon.add( this.searchBizCombo, this.bizGrid );
    },

    createButtonCon: function() {
        this.buttonCon = Ext.create('Ext.container.Container', {
            layout : {
                type  : 'hbox',
                align : 'middle',
                pack  : 'center'
            },
            width  : '100%',
            height : 25,
            margin : '5 0 0 0',
            items  : [{
                xtype : 'button',
                text  : common.Util.TR('OK'),
                cls   : 'rtm-btn',
                width : 55,
                height: 25,
                listeners: {
                    scope: this,
                    click: function() {
                        this.save(this.statName, this.bizName, this.statId, this.bizId);
                        this.close();
                    }
                }
            },{
                xtype : 'tbspacer',
                width : 5
            },{
                xtype : 'button',
                text  : common.Util.TR('Cancel'),
                cls   : 'rtm-btn',
                height: 25,
                listeners: {
                    scope: this,
                    click: function() {
                        this.close();
                    }
                }
            }]
        });
    },

    initDataSetting: function() {
        this.addList('stat');
        this.addList('biz');
    },

    addList: function(addType) {
        var pushList = [], comboData = [],
            ix, ixLen,
            store, selectId, display, addList, searchCombo;

        if (addType === 'stat') {
            store = this.statGrid.getStore();
            addList = realtime.bizServiceStatList;
            searchCombo = this.searchNameCombo;
        } else {
            store = this.bizGrid.getStore();
            addList = Comm.businessRegisterInfo;
            searchCombo = this.searchBizCombo;
            pushList.push({ Index: 0, Id: 'All', Display: 'All' });
            comboData.push({ name: 'All', value: 'All' });
        }

        for (ix = 0, ixLen = addList.length; ix < ixLen; ix++ ) {
            if (addType === 'stat') {
                selectId = addList[ix].id;
                display  = common.Util.TR(addList[ix].name);
            } else if (addType === 'biz') {
                selectId = addList[ix].parent['bizId'];
                display  = addList[ix].parent['bizName'];
            }

            pushList.push({ Index: ix + 1, Id:  selectId, Display:  display });

            comboData.push({ name: display, value: selectId });
        }

        store.loadData(pushList);

        searchCombo.setData(comboData);
        searchCombo.setSearchField( 'name' );
    },

    findStatValue: function(searchType) {
        var searchString, targetStore, selectGrid ,row;

        if (searchType === 'stat') {
            selectGrid = this.statGrid;
            searchString = this.searchNameCombo.getValue();
        } else {
            selectGrid = this.bizGrid;
            searchString = this.searchBizCombo.getValue();
        }

        targetStore  = selectGrid.getStore();
        row = targetStore.findRecord('Id', searchString );

        if (!row) {
            return;
        }

        selectGrid.getView().focusRow(row);
        selectGrid.getSelectionModel().select(row);

        if (searchType === 'stat') {
            this.statId = row.data.Id;
            this.statName = row.data.Name;
        } else {
            this.bizId  = row.data.Id;
            this.bizName  = row.data.Name;
        }

        selectGrid.fireEvent('itemclick', selectGrid, selectGrid.getSelectionModel().getLastSelected());
    }
});

