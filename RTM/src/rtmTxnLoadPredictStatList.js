Ext.define('rtm.src.rtmTxnLoadPredictStatList', {
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
                sql_file: 'IMXRT_Get_TxnNameCombo.sql'
            }, function(header, data) {
                var txnStore = this.txnGrid.getStore(),
                    txnRow, row, ix, ixLen;

                for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                    // data.rows[ix][0] - txn_id;
                    // data.rows[ix][1] - txn_name;

                    this.txn.push({ Index: ix, Name:  data.rows[ix][0], Display:  data.rows[ix][1]});
                    this.txnComboData.push({ name : data.rows[ix][1], value : data.rows[ix][0]});
                }

                txnStore.loadData(this.txn);

                this.searchTxnNameCombo.setData(this.txnComboData);
                this.searchTxnNameCombo.setSearchField('name');

                if (!this.txnGrid) {
                    return;
                }

                txnRow = this.txnGrid.getStore().findRecord('Name', this.txnId);

                if (!Ext.isEmpty(txnRow)) {
                    this.txnGrid.getView().focusRow(txnRow);
                    this.txnGrid.getSelectionModel().select(txnRow);
                }

                row = this.statGrid.getStore().findRecord('Display', this.statName);
                if (!Ext.isEmpty(row)) {
                    this.statGrid.getView().focusRow(row);
                    this.statGrid.getSelectionModel().select(row);
                }

                this.statGrid.fireEvent('itemclick', this.statGrid, this.statGrid.getSelectionModel().getLastSelected());
                this.txnGrid.fireEvent('itemclick', this.txnGrid, this.txnGrid.getSelectionModel().getLastSelected());
            }, this);
        }
    },

    init: function() {
        this.initProperty();
        this.initLayout();
        this.addList();
    },

    initProperty: function() {
        this.txn         = [];
        this.stat        = [];
        this.comboData   = [];
        this.txnComboData = [];
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

        this.createTxnChangeCon();
        this.createStatChangeCon();

        hBoxCon.add(this.txnChangeCon, this.statChangeCon);

        this.changeCon.add(hBoxCon);
    },

    createTxnChangeCon: function() {
        var txnStore;

        this.txnChangeCon = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : '50%',
            margin : '0 5 0 0'
        });

        this.searchTxnNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls: 'rtm-list-condition',
            width : '100%',
            data : [],
            enableKeyEvents: true,
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findTxnValue();
                }
            }
        });

        txnStore = Ext.create('Ext.data.Store', {
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

        this.txnGrid = Ext.create('Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            store       : txnStore,
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
                        this.txnId = record.data.Name;
                        this.txnName = record.data.Display;
                        if (thisGrid.store.getCount() !== this.searchTxnNameCombo.store.getCount() && this.searchTxnNameCombo.data.length > 0) {
                            this.searchTxnNameCombo.store.loadData(this.searchTxnNameCombo.data);
                        }
                        this.searchTxnNameCombo.setValue(this.txnId);
                    }
                }.bind(this)
            }
        });

        this.txnChangeCon.add(this.searchTxnNameCombo, this.txnGrid);
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
                        Ext.getCmp(this.targetChart.parentId).changeStat(this.statName, this.txnId, this.txnName);
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
        this.txnId = this.searchTxnNameCombo.getValue();
        this.txnName = this.searchTxnNameCombo.getName();

        this.statGrid.fireEvent('itemclick', this.statGrid, this.statGrid.getSelectionModel().getLastSelected());
    },

    findTxnValue: function() {
        var searchString = this.searchTxnNameCombo.getValue();
        var targetStore  = this.txnGrid.getStore();
        var row          = targetStore.findRecord('Name', searchString);

        if (!row) {
            return;
        }

        this.txnGrid.getView().focusRow(row);
        this.txnGrid.getSelectionModel().select(row);
        this.statName = this.searchStatNameCombo.getValue();
        this.txnId = row.data.Name;
        this.txnName = row.data.Display;

        this.txnGrid.fireEvent('itemclick', this.txnGrid, this.txnGrid.getSelectionModel().getLastSelected());
    }

});

