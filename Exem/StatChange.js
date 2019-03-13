/**
 * Created by JONGHO on 14. 4. 10.
 * for intermax
*/

Ext.define("Exem.StatChange", {
    extend: 'Exem.TabPanel',
    width     :'100%',
    //height    :'100%',
    flex      : 1,
    layout    : 'fit',
    instanceId: 1,
    useCheckBox: true,
    useTab: {
       stat   : true,
       wait   : true,
       ratio  : true,
       osstat : true
    },
    sql   : {
        stat: 'IMXPA_DBTrend_StatChange_s.sql',
        wait: 'IMXPA_DBTrend_StatChange_w.sql'
        //os  : 'IMXRT_DBMonitor_OS.sql'                  // 실시간 차트용 freememory를 그리는 쿼리
    } ,
    style : 'background : #ffffff !important; borderRadius : 6px 6px 0px 0px;',
    bodyStyle: {
        padding    : 10,
        background : '#e9e9e9'
    },
    activeItem: 0,
    items: [ { title: 'Stat',   layout    : 'fit',  _type  : StatChange.stat  },
             { title: 'Wait',   layout    : 'fit',  _type  : StatChange.wait  },
             { title: 'Ratio',  layout    : 'fit',  _type  : StatChange.ratio },
             { title: 'OSStat', layout    : 'fit',  _type  : StatChange.osstat} ],
    listeners: {
        tabchange: function ( grouptabPanel, newCard){
            var self = this;

            if(newCard.items.items[0].id == self.statTabGrid.id) {
                self.waitTabGrid.getSelectionModel().deselect(self.nowSelection.index);
            } else {
                self.statTabGrid.getSelectionModel().deselect(self.nowSelection.index)
            }

            self.searchNameCombo.setData(self.searchNameComboData[newCard._type]);
            self.searchNameCombo.setSearchField('name');
            // 이전에 선택된 값 삭제
            self.searchNameCombo.setValue('');
        }
    },

    init: function() {
        var self = this;
        self.initEnvir();
        self.initLayout();

        self.executeSQL();

    },

    initEnvir: function() {
        var self = this;

        self.dataList = {
            stat  : [],
            wait  : [],
            ratio : [],
            osstat: []
        };

        self.searchNameComboData = {
            0  : [],
            1  : [],
            2  : [],
            3  : []
        };

        self.nowSelection = {
            record: null,
            index: null,
            type : null
        };

        self.selectCheck = {
            value: null
        };
    },

    executeSQL: function() {
        var self = this;

        self.clearDataList();
        var stat_dataSet = {};
        stat_dataSet.sql_file = self.sql.stat;
        stat_dataSet.bind = [{ name  : 'db_id'  , value : self.instanceId, type: SQLBindType.INTEGER}];
        WS.SQLExec(stat_dataSet, self.onData, self);

        var wait_dataSet = {};
        wait_dataSet.sql_file = self.sql.wait;
        wait_dataSet.bind = [ { name  : 'db_id'  , value : self.instanceId, type: SQLBindType.INTEGER}];
        wait_dataSet.replace_string =  [{ name : 'IDLE_EVENT', value: common.DataModule.referenceToDB.eventName }];
        WS2.SQLExec(wait_dataSet, self.onData, self);

        stat_dataSet = null ;
        wait_dataSet = null ;
        self = null ;
    },
    clearDataList: function() {
        var self = this;
        self.dataList.stat.langth = 0;
        self.dataList.wait.langth = 0;
        self.dataList.ratio.langth = 0;
        self.dataList.osstat.langth = 0;

        self.searchNameComboData[0].langth = 0;
        self.searchNameComboData[1].langth = 0;
        self.searchNameComboData[2].langth = 0;
        self.searchNameComboData[3].langth = 0;
    },

    initLayout: function() {

        var self = this;

        self.searchNameCombo = Ext.create('Exem.AjaxComboBox',{
            width : '100%',
            data  : [],
            margin: '5 15 0 15',
            enableKeyEvents: true,
            useSelectFirstRow: false,
            listeners: {
                render : function() {

                },
                select: function() {
                    // 선택한 이름으로 찾기
                    self.findStatValue();
                },
                keydown: function(comboboxThis, e) {
                    // keyCode 은 ENTER , 입력 값이 있는경우에만 find and focus된다.
                    if(e.keyCode === 13 && this.getValue()) {
                        self.findStatValue();
                    }
                }
            }
        });


        self.addDocked( self.searchNameCombo );


        self.statTabGrid   = self.addLeftEventTypeGrid(self.items.items[0], StatChange.stat);
        self.waitTabGrid   = self.addLeftEventTypeGrid(self.items.items[1], StatChange.wait);
        self.ratioTabGrid  = self.addLeftEventTypeGrid(self.items.items[2], StatChange.ratio);

        if(self.useTab.ratio !== true) {
            self.items.items[2].setVisible(false);
            self.items.items[2].tab.setVisible(false);
        }
        if(self.useTab.osstat === true) {
            self.osstatTabGrid = self.addLeftEventTypeGrid(self.items.items[3], StatChange.osstat);
        } else {
            self.items.items[3].setVisible(false);
            self.items.items[3].tab.setVisible(false);
        }


    },

    findStatValue: function() {
        var self = this;
        var targetGrid = null;
        // 검색할 store 찾기
        switch(self.getActiveTab()._type) {
            case StatChange.stat:
                targetGrid = self.statTabGrid;
                break;
            case StatChange.wait:
                targetGrid = self.waitTabGrid;
                break;
            case StatChange.ratio:
                targetGrid = self.ratioTabGrid;
                break;
            case StatChange.osstat:
                targetGrid = self.osstatTabGrid ;
                break;
            default:
                break;
        }

        var searchString = self.searchNameCombo.rawValue ;
        var targetStore = targetGrid.getStore();
        var row = targetStore.findRecord('name',searchString);
        targetGrid.getView().focusRow(row) ;
        targetGrid.getSelectionModel().select(row);
    },

    addLeftEventTypeGrid: function(target, type) {
        var self = this;
        var store =  Ext.create('Ext.data.Store', {
            fields: [
                { name : 'name', sortType: 'asUCString'},
                { name : '_id'} ],
            data  : []
            //sorters: [{
            //    property: 'name',
            //    direction: 'ASC'
            //}]
        });

        var checkBoxModel = null;

        if (self.useCheckBox === true) {
            checkBoxModel = Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                mode: 'SIMPLE'
            });
        }

        var grid   = Ext.create('Ext.grid.Panel',{
            width   : '100%',
            margin  : '10 15 0 15',
            plugins : [],
            cls     : 'exem-statChange-grid',
            _type   : type,
            hideHeaders: true,
            forceFit: true,
            autoScroll: true,
            selModel: checkBoxModel,
            viewConfig: {
                listeners:{
                    itemkeydown:function(view, record, item, index, e){
                        // 눌러진 key로 focus가게 는 부분. s를 누르면 s로 시작하는 부분에 focus
                        var pressedKey = String.fromCharCode(e.getCharCode());
                        var gridData =  this.getStore().data.items;
                        for (var ix = 0; ix < gridData.length; ix++) {
                            if (gridData[ix].data['name'].toLowerCase() == pressedKey.toLowerCase()) {
                                this.getSelectionModel().select(this.getStore().data.items[ix]);
                                break;
                            }
                        }
                    }
                }
            },
            columns: [
                { text: 'NAME', dataIndex: 'name' , flex:1 },
                { text: '_id', dataIndex: '_id', hidden : true }
            ],
            store :store,
            listeners: {
                select: function (thisGrid, record, index) {

                    if (self.nowSelection.record == null) {
                        self.nowSelection.record = record;
                        self.nowSelection.index = index;
                        self.nowSelection.type = this._type;

                    } else if (self.nowSelection.record != null && self.nowSelection.record != record) {
                        var targetGrid = self.getTargetGrid(self.nowSelection.type);
                        targetGrid.getSelectionModel().deselect(self.nowSelection.index);

                        self.nowSelection.record = record;
                        self.nowSelection.index = index;
                        self.nowSelection.type = this._type;
                    }
                }
            }
        });

        target.add(grid);
        return grid;
    },

    getTargetGrid: function (type) {
        var self = this;

        switch(type) {
            case StatChange.stat:
                return self.statTabGrid;
            case StatChange.wait:
                return self.waitTabGrid;
            case StatChange.ratio:
                return self.ratioTabGrid;
            case StatChange.osstat:
                return self.osstatTabGrid;
            default:
                break;
        }
    },

    getTargetStore: function(type) {
        var self = this;

        switch(type) {
            case StatChange.stat:
                return self.statTabGrid.getStore();
            case StatChange.wait:
                return self.waitTabGrid.getStore();
            case StatChange.ratio:
                return self.ratioTabGrid.getStore();
            case StatChange.osstat:
                return self.osstatTabGrid.getStore() ;
            default:
                break;
        }
    },


    addStatList: function(adata) {
        var self = this;
        var targetStore = self.statTabGrid.getStore();
        var data =  adata.rows;

        if(!targetStore){
            return;
        }

        for(var ix = 0; ix < data.length; ix++) {
            self.dataList.stat.push( {'name':  data[ix][0], '_id': data[ix][0] });
            self.searchNameComboData[0].push({name:  data[ix][0], value: data[ix][0] });
        }
//        self.statTabGrid.plugins.push({
//            ptype: 'bufferedrenderer',
//            trailingBufferZone: 20,  // Keep 20 rows rendered in the table behind scroll
//            leadingBufferZone: 50   // Keep 50 rows rendered in the table ahead of scroll
//        });
        targetStore.loadData( self.dataList.stat);

        // search name list도 stat으로 해준다. 이거 안해주면, 첫번째 tab의 list는 tab을 이동 한후에 set 됨.
        self.searchNameCombo.setData(self.searchNameComboData[StatChange.stat]);
        self.searchNameCombo.setSearchField('name');

    },
    addRatio_OSList: function() {
        var self = this;
        //var ratio_data = null;
        //var targetStore = self.ratioTabGrid.getStore();
        //ratio_data = common.DataModule.referenceToDB.ratioName.slice(0);
        //ratio_data.sort();
        //for(var ix = 0; ix < ratio_data.length; ix++) {
        //    self.dataList.ratio.push( {'name': ratio_data[ix], '_id': ix });
        //    self.searchNameComboData[2].push({name: ratio_data[ix], value: ratio_data[ix] });
        //}
        //self.ratioTabGrid.plugins.push({
        //    ptype: 'bufferedrenderer',
        //    trailingBufferZone: 20,  // Keep 20 rows rendered in the table behind scroll
        //    leadingBufferZone: 50   // Keep 50 rows rendered in the table ahead of scroll
        //});
        //targetStore.loadData( self.dataList.ratio);


        if (self.useTab.osstat === true) {
            var osstatStore = self.osstatTabGrid.getStore();

            if(!osstatStore){
                return;
            }

            self.dataList.osstat.push( {'name': 'cpu', '_id': 'cpu' });
            self.searchNameComboData[3].push({name: 'cpu', value:'cpu' });
            self.dataList.osstat.push( {'name': 'free_memory', '_id': 'free_memory' });
            self.searchNameComboData[3].push({name: 'free_memory', value: 'free_memory' });
            osstatStore.loadData(self.dataList.osstat);
        }


    },
    addWaitList: function(adata) {
        var self = this;
        var targetStore = self.waitTabGrid.getStore();
        var data =  adata.rows;

        if(!targetStore){
            return;
        }

        self.dataList.wait.push( {'name': 'Latch Wait Time (Total)', '_id': 'Latch Wait Time (Total)' });
        self.searchNameComboData[1].push({name: 'Latch Wait Time (Total)', value:'Latch Wait Time (Total)' });

        for(var ix = 0; ix < data.length; ix++) {
            self.dataList.wait.push( {'name': data[ix][0], '_id': data[ix][0] });
            self.searchNameComboData[1].push({name: data[ix][0], value: data[ix][0] });
        }
//        self.waitTabGrid.plugins.push({
//            ptype: 'bufferedrenderer',
//            trailingBufferZone: 20,  // Keep 20 rows rendered in the table behind scroll
//            leadingBufferZone: 50   // Keep 50 rows rendered in the table ahead of scroll
//        });
        targetStore.loadData( self.dataList.wait);

    },

    addRatioData: function(data) {
       var self = this;
       for (var ix = 0; ix < data.length; ix++) {
           self.dataList.ratio.push( {'name': data[ix][0], '_id': data[ix][1] });
           self.searchNameComboData[2].push({name: data[ix][0], value: data[ix][0] });
       }
       self.ratioTabGrid.getStore().loadData( self.dataList.ratio);
    },



    onData: function(aheader, adata) {
        var self = this;

        switch(aheader.command){

            case 'IMXPA_DBTrend_StatChange_s.sql':
                self.addStatList(adata);
                self.addRatio_OSList();
                break;
            case 'IMXPA_DBTrend_StatChange_w.sql':
                self.addWaitList(adata);
                break;
            default:
                break;
        }
    }

});
