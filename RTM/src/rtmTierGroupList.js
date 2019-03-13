Ext.define('rtm.src.rtmTierGroupList', {
    extend   : 'Exem.XMWindow',
    title    : common.Util.TR('Stat Change'),
    layout   : 'fit',
    width    : 350,
    height   : 300,
    minWidth : 300,
    minHeight: 300,
    modal    : true,

    maximizable: false,

    statName    : '',
    oldStatName : '',
    statList : '',
    targetStat : null,

    cls      : 'xm-dock-window-base',
    bodyStyle: {
        padding: '10px'
    },

    listeners: {
        show : function() {
            var row = this.grid.getStore().findRecord('Display', this.statName);
            if (!Ext.isEmpty(row)) {
                this.grid.getView().focusRow(row) ;
                this.grid.getSelectionModel().select(row);
            }
            this.grid.fireEvent('itemclick', this.grid, this.grid.getSelectionModel().getLastSelected());

            var rowIndex;
            var selectRow;
            var displayStatList = this.statList;

            for (var ix = 0, ixLen = displayStatList.length; ix < ixLen; ix++) {
                selectRow = this.grid.store.findRecord('Name', displayStatList[ix]);

                if (selectRow) {
                    rowIndex = this.grid.view.store.indexOf(selectRow);

                    if (rowIndex > -1) {
                        this.grid.view.addRowCls(rowIndex, 'selected-row');
                    }
                }
            }
            displayStatList = null;
            selectRow = null;
            row = null;
        }
    },

    init: function() {
        this.stat      = [];
        this.comboData = [];

        this.background = Ext.create('Ext.container.Container', {
            layout : {
                type : 'vbox',
                pack  : 'middle'
            },
            width : '100%',
            flex : 1,
            cls  : 'rtm-statchange-base'
        });
        this.add( this.background );

        this.top = Ext.create( 'Ext.container.Container', {
            layout : 'fit',
            flex   : 1,
            width  : '100%'
        });

        this.bottom = Ext.create('Ext.container.Container', {
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
                        Ext.getCmp(this.targetStat).changeStat(this.oldStatName, this.statName);
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

        this.background.add( this.top, this.bottom );

        this.statStore = Ext.create( 'Ext.data.Store', {
            fields  : [
                {name : 'Index',   type : 'int' },
                {name : 'Name',    type : 'string'  },
                {name : 'Display', type : 'string'  }
            ],
            data    : [],
            sorters : [
                { property : 'Display', direction : 'ASC' }
            ]
        });

        this.grid = Ext.create( 'Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            store       : this.statStore,
            cls         : 'baseGridRTM',
            columns     : [
                { text: 'Index',    dataIndex : 'Index',    hidden: true},
                { text: 'Name',     dataIndex : 'Name' ,    hidden: true},
                { text: 'Display',  dataIndex : 'Display',  flex  : 1   }
            ],
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                mode: 'SINGLE',
                enableKeyNav: false
            }),
            listeners: {
                scope: this,
                itemclick: function (thisGrid, record) {

                    if (!Ext.isEmpty(record)) {
                        this.statName = record.data.Name;

                        if (thisGrid.store.getCount() !== this.searchNameCombo.store.getCount() &&
                            this.searchNameCombo.data.length > 0) {
                            this.searchNameCombo.store.loadData(this.searchNameCombo.data);
                        }

                        this.searchNameCombo.setValue(this.statName);
                    }
                }
            }
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
                },
                keydown: function(comboboxThis, e) {
                    // keyCode 은 ENTER , 입력 값이 있는경우에만 find and focus된다.
                    if(e.keyCode === 13 && comboboxThis.getValue()) {
                        this.findStatValue();
                    }
                },
                focus: function() {
                    if (this.searchNameCombo.editable === false) {
                        this.searchNameCombo.setEditable(true);
                    }
                }
            }
        });

        this.left = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : 320
        });

        this.left.add( this.searchGroupCombo, this.grid );

        this.top.add( this.left);

        this.addList();
    },


    addList: function() {
        var store = this.grid.getStore();

        var ix, ixLen;
        var statName;
        var display;
        var statList = realtime.TierGroupStat;

        for (ix = 0, ixLen = statList.length; ix < ixLen ; ix++ ) {
            statName = statList[ix].id;
            display  = statList[ix].name;

            this.stat[this.stat.length] = {Index: ix, Name:  statName, Display:  display};
            this.comboData[this.comboData.length] = {name: display, value: statName };
        }

        store.loadData(this.stat);

        this.searchNameCombo.setData(this.comboData);
        this.searchNameCombo.setSearchField( 'name' );

        this.stat = null;
        statList = null;
        store = null;
    },


    findStatValue: function() {

        var searchString = this.searchNameCombo.getValue();
        var targetStore  = this.grid.getStore();
        var row          = targetStore.findRecord('Name', searchString );

        this.grid.getView().focusRow(row) ;
        this.grid.getSelectionModel().select(row);
        this.groupName = row.data.Name;

        this.grid.fireEvent('itemclick', this.grid, this.grid.getSelectionModel().getLastSelected());
    }

});

