Ext.define('rtm.src.rtmAnomalyDetectionStatList', {
    extend   : 'Exem.XMWindow',
    title    : common.Util.TR('Server Change'),
    layout   : 'fit',
    width    : 650,
    height   : 300,
    minWidth : 500,
    minHeight: 300,
    modal    : true,

    statName    : '',
    targetChart : null,

    cls      : 'xm-dock-window-base',
    bodyStyle: {
        padding: '10px'
    },

    listeners: {
        show : function() {
            if (!this.wasGrid) {
                return;
            }

            var wasRow = this.wasGrid.getStore().findRecord('Name', this.wasId);
            if (!Ext.isEmpty(wasRow)) {
                this.wasGrid.getView().focusRow(wasRow);
                this.wasGrid.getSelectionModel().select(wasRow);
            }

            var row = this.statGrid.getStore().findRecord('Display', this.statName);
            if (!Ext.isEmpty(row)) {
                this.statGrid.getView().focusRow(row);
                this.statGrid.getSelectionModel().select(row);
            }

            this.wasGrid.fireEvent('itemclick', this.wasGrid, this.wasGrid.getSelectionModel().getLastSelected());
            this.statGrid.fireEvent('itemclick', this.statGrid, this.statGrid.getSelectionModel().getLastSelected());
        }
    },

    init: function() {
        this.initProperty();
        this.initLayout();
        this.addList();
    },

    initProperty: function() {
        this.was          = [];
        this.stat         = [];
        this.comboData    = [];
        this.wasComboData = [];
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

        this.createChangeCon();
        this.createButtonCon();

        baseCon.add(this.changeCon, this.buttonCon);
        this.add(baseCon);
    },

    createChangeCon: function() {
        var hBoxCon;

        this.changeCon = Ext.create( 'Ext.container.Container', {
            layout : 'fit',
            flex   : 1,
            width  : '100%'
        });

        hBoxCon = Ext.create( 'Ext.container.Container', {
            layout : 'hbox',
            height : '100%',
            width  : '100%'
        });

        this.createWasChangeCon();
        this.createStatChangeCon();

        hBoxCon.add(this.wasChangeCon, this.statChangeCon);

        this.changeCon.add(hBoxCon);
    },

    createWasChangeCon: function() {
        var wasStore;

        this.wasChangeCon = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '50%',
            margin : '0 5 0 0'
        });

        this.searchWasNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls: 'rtm-list-condition',
            width: '100%',
            data : [],
            enableKeyEvents: true,
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findWasValue();
                }
            }
        });

        wasStore = Ext.create('Ext.data.Store', {
            fields  : [
                { name : 'Index',   type : 'int'    },
                { name : 'Name',    type : 'string' },
                { name : 'Display', type : 'string' }
            ],
            data    : [],
            sorters : [
                { property : 'Display', direction : 'ASC' }
            ]
        });

        this.wasGrid = Ext.create( 'Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            store       : wasStore,
            cls         : 'baseGridRTM',
            bodyStyle   : {'border-bottom-width':'1px'},
            columns     : [
                { text: 'Index',    dataIndex : 'Index',    hidden: true },
                { text: 'Name',     dataIndex : 'Name' ,    hidden: true },
                { text: 'Display',  dataIndex : 'Display',  flex  : 1    }
            ],
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                mode: 'SINGLE',
                enableKeyNav: false
            }),
            plugins: [{
                ptype: 'bufferedrenderer',
                trailingBufferZone: 5,
                leadingBufferZone: 5
            }],
            listeners: {
                scope: this,
                itemclick: function(thisGrid, record) {

                    if (!Ext.isEmpty(record)) {
                        this.wasId = record.data.Name;
                        if (thisGrid.store.getCount() !== this.searchWasNameCombo.store.getCount() && this.searchWasNameCombo.data.length > 0) {
                            this.searchWasNameCombo.store.loadData(this.searchWasNameCombo.data);
                        }
                        this.searchWasNameCombo.setValue(this.wasId);
                    }
                }
            }
        });

        this.wasChangeCon.add( this.searchWasNameCombo, this.wasGrid );
    },

    createStatChangeCon: function() {
        var statStore;

        this.statChangeCon = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '50%',
            margin : '0 0 0 5'
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
                    this.findStatValue();
                }
            }
        });

        statStore = Ext.create('Ext.data.Store', {
            fields  : [
                { name : 'Index',   type : 'int'    },
                { name : 'Name',    type : 'string' },
                { name : 'Display', type : 'string' }
            ],
            data    : [],
            sorters : [
                { property : 'Display', direction : 'ASC' }
            ]
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
                { text: 'Index',    dataIndex : 'Index',    hidden: true },
                { text: 'Name',     dataIndex : 'Name' ,    hidden: true },
                { text: 'Display',  dataIndex : 'Display',  flex  : 1    }
            ],
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                mode: 'SINGLE',
                enableKeyNav: false
            }),
            plugins: [{
                ptype: 'bufferedrenderer',
                trailingBufferZone: 5,
                leadingBufferZone: 5
            }],
            listeners: {
                scope: this,
                itemclick: function(thisGrid, record) {

                    if (!Ext.isEmpty(record)) {
                        this.statName = record.data.Name;
                        if (thisGrid.store.getCount() !== this.searchNameCombo.store.getCount() && this.searchNameCombo.data.length > 0) {
                            this.searchNameCombo.store.loadData(this.searchNameCombo.data);
                        }
                        this.searchNameCombo.setValue(this.statName);
                    }
                }
            }
        });

        this.statChangeCon.add( this.searchNameCombo, this.statGrid );
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
                        Ext.getCmp(this.targetChart.parentId).changeStat(this.statName, this.wasId);
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

    addList : function() {
        var statStore = this.statGrid.getStore();
        var wasStore = this.wasGrid.getStore();

        var ix, ixLen;
        var statName, display;

        for (ix = 0, ixLen = realtime.anoDetectionStatList.length; ix < ixLen; ix++ ) {
            statName = realtime.anoDetectionStatList[ix].id;
            display  = common.Util.TR(realtime.anoDetectionStatList[ix].name);

            this.stat.push({ Index: ix, Name:  statName, Display:  display});
            this.comboData.push ({ name: display, value: statName });
        }


        var wasId = Object.keys(Comm.wasInfoObj);
        for (ix = 0, ixLen = wasId.length; ix < ixLen; ix++) {
            if (Comm.wasInfoObj[wasId[ix]].type == 'WAS') {
                this.was.push({ Index: ix, Name:  wasId[ix], Display:  Comm.wasInfoObj[wasId[ix]].wasName});
                this.wasComboData.push({ name : Comm.wasInfoObj[wasId[ix]].wasName, value : wasId[ix]});
            }
        }

        statStore.loadData(this.stat);
        wasStore.loadData(this.was);

        this.searchNameCombo.setData(this.comboData);
        this.searchNameCombo.setSearchField('name');

        this.searchWasNameCombo.setData(this.wasComboData);
        this.searchWasNameCombo.setSearchField('name');
    },


    findStatValue: function() {
        var searchString = this.searchNameCombo.getValue();
        var targetStore  = this.statGrid.getStore();
        var row          = targetStore.findRecord('Name', searchString);

        if (!row) {
            return;
        }

        this.statGrid.getView().focusRow(row);
        this.statGrid.getSelectionModel().select(row);
        this.statName = row.data.Name;
        this.dbId = this.searchDBNameCombo.getValue();

        this.statGrid.fireEvent('itemclick', this.statGrid, this.statGrid.getSelectionModel().getLastSelected());
    },

    findWasValue: function() {
        var searchString = this.searchWasNameCombo.getValue();
        var targetStore  = this.wasGrid.getStore();
        var row          = targetStore.findRecord('Name', searchString );

        if (!row) {
            return;
        }

        this.wasGrid.getView().focusRow(row);
        this.wasGrid.getSelectionModel().select(row);
        this.statName = this.searchNameCombo.getValue();
        this.wasId = row.data.Name;

        this.wasGrid.fireEvent('itemclick', this.wasGrid, this.wasGrid.getSelectionModel().getLastSelected());
    }

});

