Ext.define('view.DBTrend_StatChange',{
    extend   : 'Exem.Window',
    title    : common.Util.TR('Stat Change'),
    layout   : 'fit',
    width    : 450 ,
    height   : 600 ,
    resizable: false,
    modal    : true ,
    closeAction: 'hide',
    sql   : {
        stat: 'IMXPA_DBTrend_StatChange_s.sql',
        wait: 'IMXPA_DBTrend_StatChange_w.sql'
    },

    ACTIVE_STAT  : 'Stat',
    ACTIVE_WAIT  : 'Wait',
    ACTIVE_RATIO : 'Ratio' ,

    stat_dt_list  : { Stat: [], Wait: [], Ratio: [] } ,
    stat_grd_list : { Stat: [], Wait: [], Ratio: [] } ,
    index_db_list : { Stat: [], Wait: [], Ratio: [] } ,

    prev_item : null ,

    init: function(){
        var self =  this ;
        /**
         self.scope ;               //호출한 DBTrendForm의 scope
         self.db_id ;
         self.active_tab_name ;     // 현재 액티브된 탭 이름
         self.cht_idx ;             //넘어온 차트의 인덱스 ,
         self.stat_change_list ;    //stat, wait, ratio의 statname담긴 오브젝
         self.active_stat_nm ;      //선택된 타이틀 이름.
         */

        self.ajax_combo = Ext.create('Exem.AjaxComboBox',{
            width : 350,
            data : [],
            enableKeyEvents: true,
            listeners: {
                select: function() {
                    self.find_stat_name() ;
                },
                keydown: function(comboboxThis, e) {
                    if(e.keyCode == 13) {
                        self.find_stat_name();
                    }
                }
            }
        });


        var pnl_main = Ext.create('Ext.panel.Panel',{
            layout: 'fit',
            itemId: 'pnl_main',
            tbar: [{
                xtype : 'container',
                height: 27,
                layout: {
                    type : 'hbox',
                    align: 'middle'
                },
                width : 500,
                items : [{xtype: 'label', text: 'Stat Name: ', width: 65}, self.ajax_combo]
            }],
            bbar:[{
                xtype: 'container',
                width: '100%',
                layout: 'hbox',
                items: [{
                    xtype: 'tbspacer',
                    flex: 1
                },{
                    xtype:'button',
                    text : common.Util.TR('OK'),
                    width: 60,
                    listeners: {
                        click: function(){
                            var active_tab = self.tab_pnl.getActiveTab() ;
                            var grd ;
                            var pnl ;
                            var arr_cht ;
                            switch(self.active_tab_name){
                                case self.ACTIVE_STAT:
                                    grd = active_tab.getComponent(self.ACTIVE_STAT) ;
                                    pnl = self.scope.pnl_stat ;
                                    arr_cht = self.scope.arr_stat_chart ;
                                    break ;

                                case self.ACTIVE_WAIT:
                                    grd = active_tab.getComponent(self.ACTIVE_WAIT) ;
                                    pnl = self.scope.pnl_wait ;
                                    arr_cht = self.scope.arr_wait_chart ;
                                    break ;

                                case self.ACTIVE_RATIO:
                                    grd = active_tab.getComponent(self.ACTIVE_RATIO) ;
                                    pnl = self.scope.pnl_ratio ;
                                    arr_cht = self.scope.arr_ratio_chart ;
                                    break ;
                                default : break ;
                            }
                            var row = grd.getStore().findRecord('active', true) ;

                            //1.체크를 하였는가.
                            if ( row == null ){
                                Ext.Msg.show({
                                    title  : common.Util.TR('Stat Change'),
                                    msg    : 'Stat을 선택해주세요',
                                    buttons: Ext.Msg.OK,
                                    icon   : Ext.MessageBox.ERROR,
                                    fn     : function(buttonId) {
                                        if (buttonId === "ok") {
                                            self.ajax_combo.focus();
                                        }
                                    }
                                });
                                return ;
                            }

                            var new_title = row.data.List ;
                            var check_exist_stat = function(){
                                var result = false ;

                                for ( var ix = 0; ix < arr_cht.length; ix++ ){
                                    var stat_title = arr_cht[ix].title ;
                                    if ( new_title == stat_title ){
                                        result = true ;
                                        break ;
                                    }
                                }
                                return result ;
                            } ;
                            //2.체크한값이 기존차트들에 있는가.
                            var is_exist = check_exist_stat() ;
                            if ( is_exist ){
                                Ext.Msg.show({
                                    title  : common.Util.TR('Stat Change'),
                                    msg    : '이미 존재하는 stat 입니다.',
                                    buttons: Ext.Msg.OK,
                                    icon   : Ext.MessageBox.ERROR,
                                    fn     : function(buttonId) {
                                        if (buttonId === "ok") {
                                            self.ajax_combo.focus();
                                        }
                                    }
                                });
                                return ;
                            }


                            switch( grd.itemId ){
                                case self.ACTIVE_STAT:
                                    self.scope.get_stat( new_title, self.cht_idx ) ;
                                    break ;

                                case self.ACTIVE_WAIT:
                                    self.scope.get_wait( new_title, self.cht_idx ) ;
                                    break ;

                                case self.ACTIVE_RATIO:
                                    self.scope.get_ratio( new_title, self.cht_idx ) ;
                                    break ;
                                default : break ;
                            }
                            self.scope.flag_statchange = true ;
                            self.index_db_list[ grd.itemId ][self.cht_idx] = new_title ;
                            self.scope.stat_name_list[ grd.itemId ] = self.index_db_list[ grd.itemId ] ;

                            self.scope.config_name( pnl ) ;
                            self.close();
                        }
                    }
                },{
                    xtype: 'tbspacer',
                    width: 3
                },{
                    xtype:'button',
                    text : common.Util.TR('Cancel'),
                    width: 60,
                    listeners: {
                        click: function(){
                            self.close() ;
                        }
                    }
                },{
                    xtype: 'tbspacer',
                    flex: 1
                }]
            }]
        }) ;
        self.add( pnl_main ) ;

        var add_tab_item = function( parent, txt, tab_pnl_id ){
            var pnl = Ext.create( 'Ext.panel.Panel',{
                layout : 'fit',
                title  : common.Util.TR(txt),
                flex   : 1,
                width  : '100%',
                itemId : tab_pnl_id
            } ) ;
            parent.add(pnl) ;
        } ;

        self.tab_pnl = Ext.create('Exem.TabPanel', {
            layout : 'vbox' ,
            width  : '100%',
            height : 500,
            itemId : 'tab_pnl',
            disable: true,
            listeners: {
                render: function(){


                    var get_store_grd = function( tab, data, grd_id ){
                        var tab_store = Ext.create('Ext.data.ArrayStore', {
                            fields: [{name: 'active', type: 'bool'},{name : 'List'}],
                            data : data
                        });

                        var grd = Ext.create('Ext.grid.Panel', {
                            store: tab_store,
                            itemId: grd_id,
                            forceFit: true,
                            columns: [{
                                xtype: 'checkcolumn',
                                text : common.Util.TR('Active'),
                                dataIndex: 'active',
                                width: 50,
                                beforeCheckedIndex: null,
                                listeners: {
                                    checkchange: function (column, recordIndex) {
                                        // 0321 수정. 해둠.  조금은 빨라짐
                                        // 여기서 체크된놈을 기억했다가, 다시 클릭되는 데서, false로 변경시켜주면 전체 data 루핑은 안돌아도됨....
                                        if(tab_store.beforeCheckedIndex == null) {
                                            tab_store.beforeCheckedIndex = recordIndex;
                                            //현재 체크한 인덱스와 비포인덱스가 같을때
                                        } else if (tab_store.beforeCheckedIndex == recordIndex) {
                                            //tab_store.getAt(tab_store.beforeCheckedIndex).commit();
                                        }
                                        else {
                                            tab_store.data.items[tab_store.beforeCheckedIndex].set('active', false);
                                            tab_store.beforeCheckedIndex = recordIndex;
                                        }
                                        tab_store.commitChanges();

                                    }

                                } //end listeners
                            },{ text: 'name', dataIndex: 'List', flex: 1 }] ,
                            hideHeaders: true,
                            viewConfig:{
                                listeners:{
                                    itemkeydown:function(view, record, item, index, e){
                                        var pressedKey = String.fromCharCode(e.getCharCode());
                                        var gridData =  this.getStore().data.items;
                                        for (var ix = 0; ix < gridData.length; ix++) {
                                            if (gridData[ix].raw[1][0].toLowerCase() == pressedKey.toLowerCase()) {
                                                this.getSelectionModel().select(this.getStore().data.items[ix]);
                                                this.focus(this.getStore().data.items[ix].data['List']);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }) ;

                        tab.add( grd ) ;
                        return grd ;
                    } ; //end function

                    //tab에 check box add
                    var stat_tab  = this.items.items[0];
                    var wait_tab  = this.items.items[1];
                    var ratio_tab  = this.items.items[2];

                    get_store_grd( stat_tab, self.stat_grd_list[self.ACTIVE_STAT]  , self.ACTIVE_STAT  ) ;
                    get_store_grd( wait_tab, self.stat_grd_list[self.ACTIVE_WAIT]  , self.ACTIVE_WAIT ) ;
                    get_store_grd( ratio_tab, self.stat_grd_list[self.ACTIVE_RATIO], self.ACTIVE_RATIO ) ;
                }
            }
        }) ;
        add_tab_item( self.tab_pnl, 'Stat',  'tab_stat' ) ;
        add_tab_item( self.tab_pnl, 'Wait',  'tab_wait' ) ;
        add_tab_item( self.tab_pnl, 'Ratio', 'tab_ratio' ) ;
        pnl_main.add( self.tab_pnl ) ;
    } ,

    /** 현재 사용하지 않는 함수 주석
    //stat data미리 세팅
    set_stat_data: function(){
        var self = this ;
        self.stat_dt_list[self.ACTIVE_STAT] = [] ;
        self.stat_dt_list[self.ACTIVE_WAIT] = [] ;
        self.stat_dt_list[self.ACTIVE_RATIO] = [] ;
        self.stat_grd_list[self.ACTIVE_STAT] = [] ;
        self.stat_grd_list[self.ACTIVE_WAIT] = [] ;
        self.stat_grd_list[self.ACTIVE_RATIO] = [] ;

        //stat
        for ( var ix = 0 ; ix < self.stat_change_list[ self.ACTIVE_STAT ].length; ix++ ){
            var active_stat_name = self.stat_change_list[ self.ACTIVE_STAT ][ix][0] ;
            self.stat_dt_list[ self.ACTIVE_STAT ].push( {name: active_stat_name, value: active_stat_name} ) ;
            self.stat_grd_list[ self.ACTIVE_STAT ].push( [false, active_stat_name] ) ;
        }

        //wait
        for ( ix = 0 ; ix < self.stat_change_list[ self.ACTIVE_WAIT ].length; ix++ ){
            active_stat_name = self.stat_change_list[ self.ACTIVE_WAIT ][ix][0] ;
            self.stat_dt_list[ self.ACTIVE_WAIT ].push( {name: active_stat_name, value: active_stat_name} ) ;
            self.stat_grd_list[ self.ACTIVE_WAIT ].push( [false, active_stat_name] ) ;
        }

        //ratio
        for ( ix = 0 ; ix < self.stat_change_list[ self.ACTIVE_RATIO ].length; ix++ ){
            active_stat_name =  self.stat_change_list[ self.ACTIVE_RATIO ][ix][0] ;
            self.stat_dt_list[ self.ACTIVE_RATIO ].push( {name: active_stat_name, value: active_stat_name} ) ;
            self.stat_grd_list[ self.ACTIVE_RATIO ].push( [false, active_stat_name] ) ;
        }
    },


    //현재 active한 tab만 보이도록 세팅
    set_active_stat: function( active_tab_name ){
        var self = this ;
        var item_idx ,
            data_type ,
            active_tab ;

        if ( active_tab_name == self.ACTIVE_STAT ){
            item_idx = 0 ;
            data_type = self.ACTIVE_STAT ;
            self.tab_pnl.items.items[0].tab.setVisible(true);
            self.tab_pnl.items.items[1].tab.setVisible(false);
            self.tab_pnl.items.items[2].tab.setVisible(false);

        }else if ( self.active_tab_name == self.ACTIVE_WAIT ){
            item_idx = 1 ;
            data_type = self.ACTIVE_WAIT ;
            self.tab_pnl.items.items[1].tab.setVisible(true);
            self.tab_pnl.items.items[0].tab.setVisible(false);
            self.tab_pnl.items.items[2].tab.setVisible(false);
        }else{
            item_idx = 2 ;
            data_type = self.ACTIVE_RATIO ;
            self.tab_pnl.items.items[2].tab.setVisible(true);
            self.tab_pnl.items.items[0].tab.setVisible(false);
            self.tab_pnl.items.items[1].tab.setVisible(false);
        }
        self.tab_pnl.setActiveTab( item_idx ) ;
        active_tab = self.tab_pnl.getActiveTab() ;
        self.ajax_combo.setData( self.stat_dt_list[ data_type ] ) ;
        self.ajax_combo.setSearchField( 'name' ) ;
        self.ajax_combo.setValue( '' ) ;

        //넘어온값 체크
        self.show() ;
        self.check_stat_name( active_tab, data_type ) ;
    },

    //ajaxcombo에서 seach한 stat에 체크해주기.
    check_stat_name: function( tab, tab_name ){
        var self = this ;

        var grd = tab.getComponent( tab_name ) ;
        var grd_store = grd.getStore() ;
        var row = grd_store.findRecord( 'List', self.active_stat_nm ) ;
        grd_store.beforeCheckedIndex = row.index;
        grd_store.getAt(row.index).set('active', true);
        grd_store.getAt(row.index).commit();
        grd.getSelectionModel().select(row);
        grd.getView().focus(row.data['List']);
    } ,
     */


    find_stat_name: function(){
        var self = this ;
        if(self.ajax_combo.getValue() == ''){
            self.ajax_combo.focus();
            return;
        }

        var get_tab = self.tab_pnl.getActiveTab() ;
        var target_grd = null ;
        switch( get_tab.title ){
            case self.ACTIVE_STAT:
                target_grd = get_tab.getComponent( self.ACTIVE_STAT ) ;
                break ;

            case self.ACTIVE_WAIT:
                target_grd = get_tab.getComponent( self.ACTIVE_WAIT ) ;
                break ;

            case self.ACTIVE_RATIO:
                target_grd = get_tab.getComponent( self.ACTIVE_RATIO ) ;
                break ;
            default : break ;
        }
        var target_grd_store = target_grd.getStore() ;
        var row = target_grd_store.findRecord('List',self.ajax_combo.getValue());
        if (target_grd_store.beforeCheckedIndex != null) {
            target_grd_store.getAt(target_grd_store.beforeCheckedIndex).set('active', false);
            target_grd_store.getAt(target_grd_store.beforeCheckedIndex).commit();
        }
        target_grd_store.beforeCheckedIndex = row.index;
        target_grd.getSelectionModel().select(row);
        target_grd_store.getAt(row.index).set('active', true);
        target_grd_store.getAt(row.index).commit();
        target_grd.getView().focus(row.data['List']);

    }

}) ;
