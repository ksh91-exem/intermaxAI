Ext.define('rtm.src.rtmStatList', {
    extend   : 'Exem.XMWindow',
    title    : common.Util.TR('Stat Change'),
    layout   : 'fit',
    width    : 800,
    height   : 400,
    minWidth : 800,
    minHeight: 400,
    modal    : true,

    statName    : '',
    oldStatName : '',
    targetChart : null,
    interval : 3000,
    cls      : 'xm-dock-window-base',
    bodyStyle: {
        padding: '10px'
    },

    isWinClosed: false,

    listeners: {
        show : function() {
            var row = this.grid.getStore().findRecord('Display', this.statName);
            if (!Ext.isEmpty(row)) {
                this.grid.getView().focusRow(row);
                this.grid.getSelectionModel().select(row);
            }
            this.grid.fireEvent('itemclick', this.grid, this.grid.getSelectionModel().getLastSelected());

            var rowIndex, selectRow;
            var displayStatList = this.targetChart.parent.psWasStatList;
            var ix, ixLen;

            for (ix = 0, ixLen = displayStatList.length; ix < ixLen; ix++) {
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
        },
        beforedestroy: function() {
            this.isWinClosed = true;
            this.stopDrawChart();
        }
    },

    initProperty: function() {
        this.frameType = 'WAS';
        this.stat      = [];
        this.comboData = [];

        this.statTrendChartData = Repository.trendChartData;

        if (this.isTotal === true) {
            this.statList = realtime.InfoSumWasStat.concat();
        } else {
            this.statList = realtime.InfoWasStatName.concat();
        }

        if (this.isTotal === true) {
            this.serverNameArr = ['Total'];
        } else {
            this.serverNameArr = Comm.RTComm.getServerNameArr(this.frameType).concat();
        }
    },

    init: function() {
        this.initProperty();

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
            layout : {
                type : 'hbox'
            },
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
                        this.targetChart.parent.changeStat(this.oldStatName, this.statName);
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
                {name : 'Index', type : 'int' },
                {name : 'Name',  type : 'string'  },
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
                itemclick: function(thisGrid, record) {

                    if (!Ext.isEmpty(record)) {
                        this.statName = record.data.Name;

                        if (thisGrid.store.getCount() !== this.searchNameCombo.store.getCount() &&
                            this.searchNameCombo.data.length > 0) {
                            this.searchNameCombo.store.loadData(this.searchNameCombo.data);
                        }
                        this.searchNameCombo.setValue(this.statName);

                        this.chart.trendChartStatInfo = {
                            statId: this.statName, statName: record.data.Display
                        };

                        this.chart.toFixedNumber = 1;
                        if (this.statName === 'TXN_ELAPSE') {
                            this.chart.toFixedNumber = 3;
                        }

                        this.chart.setStat(this.statName);
                        this.chart.getBeforeChartData();
                        this.startDrawChart();
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
                focus: function() {
                    if (this.searchNameCombo.editable === false) {
                        this.searchNameCombo.setEditable(true);
                    }
                },
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findStatValue();
                }
            }
        });

        this.left = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : 320
        });

        this.left.add(this.searchNameCombo, this.grid);

        this.right = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            flex   : 1,
            height : '100%',
            style  : {
                background: 'transparent'
            }
        });

        this.chart = Ext.create('rtm.src.rtmChartFrame',{
            width : '100%',
            flex  :  1,
            //instanceList : (this.isTotal === true)? ['Total']:Comm.wasNameArr,
            instanceList : this.serverNameArr,
            isStatList   : true,
            statInterval : 3000,
            showLegend   : false,
            isTotal      : (this.isTotal === true),
            isRatioStat  : false,
            margin       : '0 0 0 8',
            frameType    : this.frameType
        });

        this.right.add(Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 25
        }), this.chart);

        this.chart.init();

        this.chart.trendChartData = this.statTrendChartData;

        this.chart.addSerieses();
        this.chart.setVisibleMenuPanel(false);
        this.chart.setTitle(this.statName , this.unit);

        this.top.add(this.left, this.right);

        this.addList();
    },


    addList : function() {
        var store = this.grid.getStore();

        var statName;
        var display;
        var ix, ixLen;

        for (ix = 0, ixLen = this.statList.length; ix < ixLen; ix++ ) {
            statName = this.statList[ix].id;
            display  = this.statList[ix].name;

            this.stat[this.stat.length]           = { Index: ix, Name: statName, Display: display };
            this.comboData[this.comboData.length] = { name: display, value: statName };
        }

        store.loadData(this.stat);

        this.searchNameCombo.setData(this.comboData);
        this.searchNameCombo.setSearchField('name');

        this.stat = null;

        store = null;
    },


    findStatValue: function() {
        if (this.isWinClosed === true) {
            return;
        }

        var searchString = this.searchNameCombo.getValue();
        var targetStore  = this.grid.getStore();
        var row          = targetStore.findRecord('Name', searchString);

        this.grid.getView().focusRow(row);
        this.grid.getSelectionModel().select(row);
        this.statName = row.data.Name;

        this.grid.fireEvent('itemclick', this.grid, this.grid.getSelectionModel().getLastSelected());
    },


    startDrawChart: function() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.chart.drawChart();

        this.timer = setTimeout(this.startDrawChart.bind(this), this.interval);
    },


    stopDrawChart: function() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

});

