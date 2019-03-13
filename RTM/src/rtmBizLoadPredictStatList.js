Ext.define('rtm.src.rtmBizLoadPredictStatList', {
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

            WS.SQLExec({
                sql_file: Comm.bizNameInfo.length > 0 ? 'IMXConfig_Txn_Name_Business_Name.sql' : 'IMXConfig_Txn_Name_Business_Info.sql'
            }, function(header, data) {
                var bizStore = this.bizGrid.getStore(),
                    bizRow, row, ix, ixLen;

                for (ix = 0, ixLen = data[0].rows.length; ix < ixLen; ix++) {
                    // data.rows[ix][0] - biz_id;
                    // data.rows[ix][1] - biz_name;

                    this.biz.push({ Index: ix, Name:  data[0].rows[ix][0], Display:  data[0].rows[ix][1]});
                    this.bizComboData.push({ name : data[0].rows[ix][1], value : data[0].rows[ix][0]});
                }

                bizStore.loadData(this.biz);

                this.searchBizNameCombo.setData(this.bizComboData);
                this.searchBizNameCombo.setSearchField('name');

                if (!this.bizGrid) {
                    return;
                }

                bizRow = this.bizGrid.getStore().findRecord('Name', this.bizId);

                if (!Ext.isEmpty(bizRow)) {
                    this.bizGrid.getView().focusRow(bizRow);
                    this.bizGrid.getSelectionModel().select(bizRow);
                }

                row = this.statGrid.getStore().findRecord('Display', this.statName);
                if (!Ext.isEmpty(row)) {
                    this.statGrid.getView().focusRow(row);
                    this.statGrid.getSelectionModel().select(row);
                }

                this.statGrid.fireEvent('itemclick', this.statGrid, this.statGrid.getSelectionModel().getLastSelected());
                this.bizGrid.fireEvent('itemclick', this.bizGrid, this.bizGrid.getSelectionModel().getLastSelected());
            }, this);
        }
    },

    init: function() {
        this.initProperty();
        this.initLayout();
        this.addList();
    },

    initProperty: function() {
        this.biz         = [];
        this.bizComboData = [];
        this.stat        = [];
        this.comboData   = [];
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

        this.createBizChangeCon();
        this.createStatChangeCon();

        hBoxCon.add(this.bizChangeCon, this.statChangeCon);

        this.changeCon.add(hBoxCon);
    },

    createBizChangeCon: function() {
        var bizStore;

        this.bizChangeCon = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '50%',
            margin : '0 5 0 0'
        });

        this.searchBizNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls: 'rtm-list-condition',
            width : '100%',
            data : [],
            enableKeyEvents: true,
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findBizValue();
                }
            }
        });

        bizStore = Ext.create('Ext.data.Store', {
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

        this.bizGrid = Ext.create('Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            store       : bizStore,
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
                itemclick: function(thisGrid, record) {

                    if (!Ext.isEmpty(record)) {
                        this.bizId = record.data.Name;
                        this.bizName = record.data.Display;
                        if (thisGrid.store.getCount() !== this.searchBizNameCombo.store.getCount() && this.searchBizNameCombo.data.length > 0) {
                            this.searchBizNameCombo.store.loadData(this.searchBizNameCombo.data);
                        }
                        this.searchBizNameCombo.setValue(this.bizId);
                    }
                }.bind(this)
            }
        });

        this.bizChangeCon.add(this.searchBizNameCombo, this.bizGrid);
    },

    createStatChangeCon: function() {
        var statStore;

        this.statChangeCon = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '50%',
            margin : '0 5 0 0'
        });

        this.searchStatNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls: 'rtm-list-condition',
            width : '100%',
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

        this.statGrid = Ext.create('Ext.grid.Panel', {
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
                itemclick: function(thisGrid, record) {

                    if (!Ext.isEmpty(record)) {
                        this.statName = record.data.Name;
                        if (thisGrid.store.getCount() !== this.searchStatNameCombo.store.getCount() && this.searchStatNameCombo.data.length > 0) {
                            this.searchStatNameCombo.store.loadData(this.searchStatNameCombo.data);
                        }
                        this.searchStatNameCombo.setValue(this.statName);
                    }
                }.bind(this)
            }
        });

        this.statChangeCon.add(this.searchStatNameCombo, this.statGrid);
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
                    click: function() {
                        Ext.getCmp(this.targetChart.parentId).changeStat(this.statName, this.bizId, this.bizName);
                        this.close();
                    }.bind(this)
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
                    click: function() {
                        this.close();
                    }.bind(this)
                }
            }]
        });
    },


    addList : function() {
        var statStore = this.statGrid.getStore();
        var ix, ixLen;
        var statName, display;

        for (ix = 0, ixLen = realtime.loadPredictTxnStatList.length; ix < ixLen; ix++ ) {
            statName = realtime.loadPredictTxnStatList[ix].id;
            display  = common.Util.TR(realtime.loadPredictTxnStatList[ix].name);

            this.stat.push({ Index: ix, Name:  statName, Display:  display});
            this.comboData.push ({ name: display, value: statName });
        }

        statStore.loadData(this.stat);

        this.searchStatNameCombo.setData(this.comboData);
        this.searchStatNameCombo.setSearchField('name');
    },


    findStatValue: function() {
        var searchString = this.searchStatNameCombo.getValue();
        var targetStore  = this.statGrid.getStore();
        var row          = targetStore.findRecord('Name', searchString);

        if (!row) {
            return;
        }

        this.statGrid.getView().focusRow(row);
        this.statGrid.getSelectionModel().select(row);
        this.statName = row.data.Name;
        this.bizId = this.searchTxnNameCombo.getValue();
        this.txnName = this.searchTxnNameCombo.getName();

        this.statGrid.fireEvent('itemclick', this.statGrid, this.statGrid.getSelectionModel().getLastSelected());
    },

    findBizValue: function() {
        var searchString = this.searchBizNameCombo.getValue();
        var targetStore  = this.bizGrid.getStore();
        var row          = targetStore.findRecord('Name', searchString);

        if (!row) {
            return;
        }

        this.bizGrid.getView().focusRow(row);
        this.bizGrid.getSelectionModel().select(row);
        this.statName = this.searchStatNameCombo.getValue();
        this.bizId = row.data.Name;
        this.bizName = row.data.Display;

        this.bizGrid.fireEvent('itemclick', this.bizGrid, this.bizGrid.getSelectionModel().getLastSelected());
    }

});

