/**
 * Created by min on 14. 5. 9.
 * 4와 다른 로직으로 진행.
 */

Ext.define("view.PerformanceTrendStatChange", {
    extend: 'Exem.TabPanel',
    width      :'100%',
    //height     :'100%',
    flex       : 1,
    layout     : 'fit',
    instanceId : null,
    was_id     : null,
    useCheckBox: true,
    stat_data  :{
        Stat : [] ,
        DB   : [],
        Wait : [],
        GC   : [],
        Pool : []
    } ,
    style : 'background : #ffffff !important; borderRadius : 0px 0px 0px 0px;',
    bodyStyle: {
        //padding    : 10,
        background : '#e9e9e9'
    },
    useTab: {
        stat : true,
        db   : true,
        wait : true,
        gc   : true,
        pool : true
    },
    sql   : {
        stat: 'IMXPA_DBTrend_StatChange_s.sql',
        wait: 'IMXPA_DBTrend_StatChange_w.sql',
        pool: 'IMXPA_PerformanceTrend_StatChange_pool.sql'
    } ,
    activeTab: 0,
    items: [
        { title: common.Util.TR('Agent Stat'),  layout    : 'fit',  _type  : TrendStatChange.stat },
        { title: common.Util.TR('DB Stat'),     layout    : 'fit',  _type  : TrendStatChange.db   },
        { title: common.Util.TR('DB Wait'),     layout    : 'fit',  _type  : TrendStatChange.wait },
        { title: common.Util.TR('GC Stat'),     layout    : 'fit',  _type  : TrendStatChange.gc   },
        { title: common.Util.TR('Pool'),        layout    : 'fit',  _type  : TrendStatChange.pool }
    ],
    listeners: {
        tabchange: function ( grouptabPanel, newCard){
            var self = this;
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
            stat: [],
            db  : [],
            wait: [],
            gc  : [],
            pool : []
        };

        self.searchNameComboData = {
            0  : [],
            1  : [],
            2  : [],
            3  : [],
            4  : []
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

        self.executeCount = 0;

        self.addWASList();

        if(self.useTab.gc){
            self.addGCList();
        }

        if ( self.useTab.pool ){
            //get pool data
            var pool_dataSet = {};
            pool_dataSet.sql_file = self.sql.pool;
            pool_dataSet.replace_string = [{ name: 'was_id', value: self.was_id }] ;
            WS2.SQLExec(pool_dataSet, self.onData, self);
            self.executeCount++;
        }

        if ( self.instanceId == null || self.instanceId == '' ) {
            if(self.executeCount == 0){
                self.fireEvent('tabchange', self, self.items.items[0]);
            }

            return ;
        }

        var stat_dataSet = {};
        stat_dataSet.sql_file = self.sql.stat;
        stat_dataSet.bind = [
            { name  : 'db_id'  , value : self.instanceId, type: SQLBindType.INTEGER}
        ];
        WS2.SQLExec(stat_dataSet, self.onData, self);
        self.executeCount++;


        var wait_dataSet = {};
        wait_dataSet.sql_file = self.sql.wait;
        wait_dataSet.bind = [ { name  : 'db_id'  , value : self.instanceId, type: SQLBindType.INTEGER} ] ;
        wait_dataSet.replace_string = [{ name: 'IDLE_EVENT', value: common.DataModule.referenceToDB.eventName}] ;
        WS2.SQLExec(wait_dataSet, self.onData, self);
        self.executeCount++;

    },
    clearDataList: function() {
        var self = this;
        self.dataList.stat.length = 0;
        self.dataList.db.length = 0;
        self.dataList.wait.length = 0;
        self.dataList.gc.length = 0;
        self.dataList.pool.length = 0 ;

        self.searchNameComboData[0].length = 0;
        self.searchNameComboData[1].length = 0;
        self.searchNameComboData[2].length = 0;
        self.searchNameComboData[3].length = 0;
        self.searchNameComboData[4].length = 0;
    },

    initLayout: function() {

        var self = this;
        self.searchNameCombo = Ext.create('Exem.AjaxComboBox',{
            width    : '100%',
            data     : [],
            margin   : '5 0 5 0',
            enableKeyEvents: true,
            useSelectFirstRow: false,
            listeners: {
                render : function() {

                },
                select: function() {

                    // 선택한 이름으로 찾기
                    self.findStatValue();
                }
            }
        });

        self.addDocked( self.searchNameCombo );


        self.statTabGrid = self.addLeftEventTypeGrid(self.items.items[0], TrendStatChange.stat);
        self.dbTabGrid   = self.addLeftEventTypeGrid(self.items.items[1], TrendStatChange.db);
        self.waitTabGrid = self.addLeftEventTypeGrid(self.items.items[2], TrendStatChange.wait);
        self.gcTabGrid   = self.addLeftEventTypeGrid(self.items.items[3], TrendStatChange.gc);
        self.poolTabGrid = self.addLeftEventTypeGrid(self.items.items[4], TrendStatChange.pool);

        if( !self.useTab.db ) {
            self.items.items[1].setVisible(false);
            self.items.items[1].tab.setVisible(false);
            self.items.items[2].setVisible(false);
            self.items.items[2].tab.setVisible(false);
        }

        if ( !self.useTab.pool ){
            self.items.items[4].setVisible(false);
            self.items.items[4].tab.setVisible(false);
        }

        if( !self.useTab.gc) {
            self.items.items[3].setVisible(false);
            self.items.items[3].tab.setVisible(false);
        }
    },

    findStatValue: function() {
        var self = this;
        var targetGrid = null;
        // 검색할 store 찾기
        switch(self.getActiveTab()._type) {
            case TrendStatChange.stat:
                targetGrid = self.statTabGrid;
                break;
            case TrendStatChange.wait:
                targetGrid = self.waitTabGrid;
                break;
            case TrendStatChange.db:
                targetGrid = self.dbTabGrid ;
                break;
            case TrendStatChange.gc:
                targetGrid = self.gcTabGrid ;
                break;
            case TrendStatChange.pool:
                targetGrid = self.poolTabGrid ;
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
                { name : 'name'},
                { name : '_id' } ],
            data  : []
//            sorters: [{
//                property: 'name',
//                direction: 'ASC'
//            }]
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
            //margin  : '10 15 0 15',
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
            case TrendStatChange.stat:
                return self.statTabGrid;
            case TrendStatChange.db:
                return self.dbTabGrid;
            case TrendStatChange.wait:
                return self.waitTabGrid;
            case TrendStatChange.gc:
                return self.gcTabGrid;
            case TrendStatChange.pool:
                return self.poolTabGrid;
            default:
                return null;
        }
    },

    getTargetStore: function(type) {
        var self = this;
        switch(type) {
            case TrendStatChange.stat:
                return self.statTabGrid.getStore();
            case TrendStatChange.db:
                return self.dbTabGrid.getStore();
            case TrendStatChange.wait:
                return self.waitTabGrid.getStore();
            case TrendStatChange.gc:
                return self.gcTabGrid.getStore() ;
            case TrendStatChange.pool:
                return self.poolTabGrid.getStore() ;
            default:
                return null;
        }
    },


    addWASList: function() {
        var self = this;
        var targetStore = self.statTabGrid.getStore();
        var data =  self.stat_data['Stat'] ;

        for(var ix = 0; ix < data.length; ix++) {
            self.dataList.stat.push( {'name': common.Util.CTR(data[ix].name), '_id': data[ix].value, '_name': data[ix].name });
            self.searchNameComboData[0].push({name: common.Util.CTR(data[ix].name), value:data[ix].value, '_name': data[ix].name });
        }
//        self.statTabGrid.plugins.push({
//            ptype: 'bufferedrenderer',
//            trailingBufferZone: 20,  // Keep 20 rows rendered in the table behind scroll
//            leadingBufferZone: 50   // Keep 50 rows rendered in the table ahead of scroll
//        });
        targetStore.loadData( self.dataList.stat );
    },

    addGCList: function(){
        var self = this;
        var targetStore = self.gcTabGrid.getStore();
        var data =  self.stat_data['GC'] ;

        for(var ix = 0; ix < data.length; ix++) {
            self.dataList.gc.push( {'name': common.Util.CTR(data[ix].name), '_id': data[ix].value, '_name': data[ix].name });
            self.searchNameComboData[3].push({name: common.Util.CTR(data[ix].name), value:data[ix].value, '_name': data[ix].name });
        }
        targetStore.loadData( self.dataList.gc );

    } ,


    addDBList: function(adata){
        var self = this;
        var targetStore = self.dbTabGrid.getStore();
        var data =  adata.rows;

        self.dataList.db.length = 0 ;
        self.stat_data.DB.length = 0 ;
        self.searchNameComboData[1].length = 0;


        self.dataList.db.push({ name: 'CPU Usage', '_id': 'CPU Usage' });
        self.dataList.db.push({ name: 'free memory', '_id': 'free memory' });
        self.stat_data['DB'].push({ name: 'CPU Usage', value: 'CPU Usage' });
        self.stat_data['DB'].push({ name: 'free memory', value: 'free memory' });
        self.searchNameComboData[1].push({ name: 'CPU Usage', value: 'CPU Usage' });
        self.searchNameComboData[1].push({ name: 'free memory', value: 'free memory' });

        for(var ix = 0; ix < data.length; ix++) {
            self.dataList.db.push( {'name': data[ix][0], '_id': data[ix][0] });
            self.stat_data.DB.push( {'name': data[ix][0], '_id': data[ix][0] });
            self.searchNameComboData[1].push({name: data[ix][0], value: data[ix][0] });
        }

        if(self.items.items.length < 1){
            return;
        }


        if ( adata.length == 0 ){
            self.items.items[1].setVisible(false);
            self.items.items[1].tab.setVisible(false);
        }else{
            self.items.items[1].setVisible(true);
            self.items.items[1].tab.setVisible(true);
        }

        targetStore.loadData( self.dataList.db);

    },


    addWaitList: function(adata) {
        var self = this;
        var targetStore = self.waitTabGrid.getStore();
        var data =  adata.rows;

        self.dataList.wait.length = 0 ;
        self.stat_data.Wait.length = 0 ;
        self.searchNameComboData[2].length = 0;


        self.dataList.wait.push( {'name': 'Latch Wait Time (Total)', '_id': 'Latch Wait Time (Total)' });
        self.stat_data['Wait'].push({ name: 'Latch Wait Time (Total)', value: 'Latch Wait Time (Total)' });
        self.searchNameComboData[2].push({name: 'Latch Wait Time (Total)', value:'Latch Wait Time (Total)' });

        for(var ix = 0; ix < data.length; ix++) {
            self.dataList.wait.push( {'name': data[ix][0], '_id': data[ix][0] });
            self.stat_data.Wait.push( {'name': data[ix][0], '_id': data[ix][0] });
            self.searchNameComboData[2].push({name: data[ix][0], value: data[ix][0] });
        }

        if(self.items.items.length < 1){
            return;
        }

        if ( adata.length == 0 ){
            self.items.items[2].setVisible(false);
            self.items.items[2].tab.setVisible(false);
        }else{
            self.items.items[2].setVisible(true);
            self.items.items[2].tab.setVisible(true);
        }


        targetStore.loadData( self.dataList.wait);

    },


    addPoolList: function(adata){
        var self = this;
        var targetStore = self.poolTabGrid.getStore();
        //애는 배열로하면 안되욥. 일일이쿼리로 돌려야해욥.
//        var data =  self.stat_data['Pool'] ;

        //가져온 배열에 값이 없으면 쿼리데이터 insert.
//        if ( data == undefined || data.length == 0 ){

        self.dataList.pool.length = 0 ;
        self.stat_data.Pool.length = 0 ;
        self.searchNameComboData[4].length = 0;

        for(var ix = 0; ix < adata.rows.length; ix++) {

            self.dataList.pool.push( {'name': adata.rows[ix][0], '_id': adata.rows[ix][1] });
            self.searchNameComboData[4].push({name: adata.rows[ix][0], value:adata.rows[ix][1] });

//            var idx = _.pluck(self.stat_data.Pool, 'name').indexOf(adata.rows[ix][1]) ;
//            if ( idx == -1 )
            self.stat_data.Pool.push( {'name': adata.rows[ix][0], '_id': adata.rows[ix][1] });
        }

        if(self.items.items.length < 1){
            return;
        }

        if ( adata.rows.length == 0 ){
            self.items.items[4].setVisible(false);
            self.items.items[4].tab.setVisible(false);
        }else{
            self.items.items[4].setVisible(true);
            self.items.items[4].tab.setVisible(true);
        }

        targetStore.loadData( self.dataList.pool );

        ix = null ;
//        idx = null ;
        targetStore = null ;
        self = null ;
    } ,


    onData: function(aheader, adata) {
        var self = this;

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            console.debug('PerformanceTrendStatChange-onData');
            console.debug(aheader);
            console.debug(adata);
            return;
        }

        self.executeCount--;
        switch(aheader.command){

            case self.sql.stat :
                self.addDBList(adata);
                break;

            case self.sql.wait :
                self.addWaitList(adata);
                break;

            case self.sql.pool :
                self.addPoolList(adata);
                break ;

            default:
                break;
        }

        if(self.executeCount == 0){
            self.fireEvent('tabchange', self, self.items.items[0]);
        }
    },

    setTabDisplay: function(){
        var self = this;
        var ix, ixLen;
        var keys = Object.keys(self.useTab);

        for(ix = 0, ixLen = keys.length; ix < ixLen; ix++){
            switch (self.useTab[keys[ix]]){
                case true:
                    self.items.items[ix].setVisible(true);
                    self.items.items[ix].tab.setVisible(true);
                    break;
                case false:
                    self.items.items[ix].setVisible(false);
                    self.items.items[ix].tab.setVisible(false);
                    break;
                default:
                    break;
            }
        }
    }

});
