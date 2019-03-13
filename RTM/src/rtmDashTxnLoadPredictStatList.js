Ext.define('rtm.src.rtmDashTxnLoadPredictStatList', {
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
            var row;

            if (!this.statGrid) {
                return;
            }

            row = this.statGrid.getStore().findRecord('Display', this.statName);
            if (!Ext.isEmpty(row)) {
                this.statGrid.getView().focusRow(row);
                this.statGrid.getSelectionModel().select(row);
            }

            this.statGrid.fireEvent('itemclick', this.statGrid, this.statGrid.getSelectionModel().getLastSelected());
        }
    },

    init: function() {
        this.initProperty();
        this.initLayout();
        this.addList();
    },

    initProperty: function() {
        this.stat         = [];
        this.comboData    = [];
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

        this.changeCon = Ext.create('Ext.container.Container', {
            layout : 'fit',
            flex   : 1,
            width  : '100%'
        });

        hBoxCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            height : '100%',
            width  : '100%'
        });

        this.createStatChangeCon();

        hBoxCon.add(this.statChangeCon);

        this.changeCon.add(hBoxCon);
    },

    createStatChangeCon: function() {
        var statStore;

        this.statChangeCon = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '100%',
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

        this.statChangeCon.add(this.searchNameCombo, this.statGrid);
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
                        Ext.getCmp(this.targetChart.parentId).changeStat(this.statName);
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

        var ix, ixLen;
        var statName, display;

        for (ix = 0, ixLen = realtime.dashTxnLoadPredictStatList.length; ix < ixLen; ix++ ) {
            statName = realtime.dashTxnLoadPredictStatList[ix].id;
            display  = common.Util.TR(realtime.dashTxnLoadPredictStatList[ix].name);

            this.stat.push({ Index: ix, Name:  statName, Display:  display});
            this.comboData.push ({ name: display, value: statName });
        }

        statStore.loadData(this.stat);

        this.searchNameCombo.setData(this.comboData);
        this.searchNameCombo.setSearchField('name');
    },


    findStatValue: function() {
        var searchString = this.searchNameCombo.getValue();
        var targetStore  = this.statGrid.getStore();
        var row          = targetStore.findRecord('Name', searchString );

        if (!row) {
            return;
        }

        this.statGrid.getView().focusRow(row);
        this.statGrid.getSelectionModel().select(row);
        this.statName = row.data.Name;

        this.statGrid.fireEvent('itemclick', this.statGrid, this.statGrid.getSelectionModel().getLastSelected());
    }
});

