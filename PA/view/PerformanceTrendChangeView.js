/*
 *
 * Created by min on 14. 5. 9.
 *
 * */
Ext.define('view.PerformanceTrendChangeView', {
    extend       : 'Exem.XMWindow',
    title        : common.Util.TR( 'User defined' ),
    layout       : 'vbox',
    width        : 660,
    height       : 410,
    modal        : true,
    resizable    : false ,
    closeAction  : 'hide',
    cls          : 'Exem-Form-workArea',
    bodyStyle: {
        background: '#fff',
        color : '#666'
    },

    total_stat_list : { Stat: [], DB: [], Wait: [], GC: [] } ,  //stat - 643개, wait - 1200개..(부모)
    curr_stat_list  : { Stat: [], DB: [], Wait: [], GC: [] } ,   //pt에서 넘어온 4개의 스탯들

    chk_stat_list   : { Stat: [], DB: [], Wait: [], GC: [] } ,  //curr_type에 해당하는 그리드 값들.
    db_stat_list    : { Stat: [], DB: [], Wait: [], GC: [] } , //
    db_stat_list_id : { Stat: [], DB: [], Wait: [], GC: [] } ,

//    type_list      : [] , //사용자가 저장하는 타입명들의 배열
    curr_type       : null ,
    scope           : null ,
    curr_active_tab : null , //부모의 현재 액티브된 탭 -> 스탯저장후 바로 그화면에 적용시켜주기위해.
    db_id           : null ,
    is_visible      : false,
    flag_refresh    : null ,

    stat_val        : [ 'Concurrent Users', 'Queue', 'JVM Free Heap (MB)', 'OS CPU (%)' ],
    wait_val        : [ 'latch free', 'db file sequential read', 'db file scattered read', 'library cache pin' ] ,
    ratio_val       : [ 'Buffer Cache Hit Ratio', 'Log Buffer Retry Ratio', 'Log Space Request Ratio', 'Free Buffer Scan Ratio' ],


    init_form: function(){
        var self = this ;

        self.IDXDB_STAT      = 'pa_performance_trend_stat' ;
        self.IDXDB_DB        = 'pa_performance_trend_db' ;
        self.IDXDB_WAIT      = 'pa_performance_trend_wait' ;
        self.IDXDB_GC        = 'pa_performance_trend_gc' ;
        self.IDXDB_LAST_TYPE = 'pa_last_type' ;
        self.IDXDB_TYPES     = 'pa_types' ;
        self.IDXDB_DEFAULT   = 'Default'  ;


        self.layout_main() ;
        //stat_name
        self.config_type = Comm.web_env_info[self.IDXDB_LAST_TYPE] ;

        self.db_stat_list.Stat = Comm.web_env_info[ self.IDXDB_STAT+'_'+self.config_type ] ;
        self.db_stat_list.DB   = Comm.web_env_info[ self.IDXDB_DB+'_'+self.config_type ] ;
        self.db_stat_list.Wait = Comm.web_env_info[ self.IDXDB_WAIT+'_'+self.config_type ] ;
        self.db_stat_list.GC   = Comm.web_env_info[ self.IDXDB_GC+'_'+self.config_type ] ;

        self.db_stat_list_id.Stat = Comm.web_env_info[ self.IDXDB_STAT+'_id_'+self.config_type ] ;
        self.db_stat_list_id.DB   = Comm.web_env_info[ self.IDXDB_DB+'_id_'+self.config_type ] ;
        self.db_stat_list_id.Wait = Comm.web_env_info[ self.IDXDB_WAIT+'_id_'+self.config_type ] ;
        self.db_stat_list_id.GC   = Comm.web_env_info[ self.IDXDB_GC+'_id_'+self.config_type ] ;


        //왼쪽그리드 데이터 그리기
        self.set_idxdb_data() ;
        //오른쪽그리드 데이터 그리기
        self.stat_change.stat_data = self.total_stat_list ;
        self.stat_change.init() ;
    } ,

    //----------------------------------------------------------------------------------------------------------------------
    //저장된 목록 불러와서 왼쪽 그리드에 세팅
    set_idxdb_data: function(){
        var self = this ;
        var ix = 0 ;



        //그간 저장된 타입들 모두
        self.total_types = Comm.web_env_info[self.IDXDB_TYPES] ;
        self.total_types = self.total_types.split(',') ;

        var last_type_data_add = function( grd_obj, key_name ){

            for ( ix = 0 ; ix < self.db_stat_list[key_name].length; ix++ ){
                grd_obj.addRow(  [ common.Util.CTR( self.db_stat_list[key_name][ix] ), self.db_stat_list_id[key_name][ix] ] ) ;
                grd_obj.drawGrid() ;
            }

        };


        //왼쪽 그리드 ADD Call.
        last_type_data_add( self.curr_stat_grd, 'Stat'  ) ;
        last_type_data_add( self.curr_db_grd  , 'DB' ) ;
        last_type_data_add( self.curr_wait_grd, 'Wait'  ) ;
        last_type_data_add( self.curr_gc_grd  , 'GC'  ) ;


        //인덱스 디비에 저장된 타입리스트들 하단 그리드에 ADD.
        for ( ix = 0 ; ix < self.total_types.length; ix++ ){
            self.list_grd_store.add({ 'active': false, 'List': self.total_types[ix] });
        }


        //체크해주기.
        self._set_check(self.config_type) ;

        self.tf_store_name.setValue( self.config_type ) ;

        ix = null ;
    } ,


    //----------------------------------------------------------------------------------------------------------------------
    add_grd_data: function( list_obj, curr_list_obj, grd_obj ){

        grd_obj.clearRows() ;
        for ( var jx = 0; jx < list_obj.length; jx++  ){
            var stat_data = list_obj[jx] ;
            grd_obj.addRow( [ stat_data, jx ] ) ;
        }
        grd_obj.drawGrid() ;
    } ,

    //----------------------------------------------------------------------------------------------------------------------

    /*
     * 디비에 저장할 형태(obj)로 변형.
     * */
    save_stat_dt: function(){
        var self = this ;
        var stat_name,
            tmp_arr = [],
            ix,
            jx ;

        var list_add = function( total_list, grd_obj, list_obj, list_id_obj, key_name ){
            tmp_arr = {
                name: [],
                id  : []
            } ;
            for ( ix = 0 ; ix < grd_obj.pnlExGrid.getStore().data.length; ix++ ){
                stat_name = grd_obj.pnlExGrid.getStore().data.items[ix].data ;

                /*
                 * 1412.12 한글화때문에 생긴로직
                 * 전체statlist에서 id값으로 인덱스찾아서 인덱스 디비에 저장(영어로)하는 방식.
                 * */
                if ( key_name == 'Stat' || key_name == 'GC' ){
                    for ( jx = 0 ; jx < total_list[key_name].length; jx++ ){
                        if ( total_list[key_name][jx].value == stat_name.Index ){
                            tmp_arr.name.push( total_list[key_name][jx].name ) ;
                            tmp_arr.id.push( total_list[key_name][jx].value ) ;
                        }
                    }
                }else{
                    tmp_arr.name.push( stat_name[key_name] ) ;
                }

            }

            if ( key_name == 'Stat' || key_name == 'GC' ){
                list_obj[key_name]   = tmp_arr.name ;
                list_id_obj[key_name] = tmp_arr.id ;
            }else{
                list_obj[key_name]   = tmp_arr.name ;
                list_id_obj[key_name] = tmp_arr.name ;
            }

        } ;

        //2. ADD
        list_add( self.total_stat_list, self.curr_stat_grd, self.db_stat_list, self.db_stat_list_id, 'Stat'  ) ;
        list_add( self.total_stat_list, self.curr_db_grd  , self.db_stat_list, self.db_stat_list_id, 'DB' ) ;
        list_add( self.total_stat_list, self.curr_wait_grd, self.db_stat_list, self.db_stat_list_id, 'Wait'  ) ;
        list_add( self.total_stat_list, self.curr_gc_grd  , self.db_stat_list, self.db_stat_list_id, 'GC'  ) ;

        stat_name = null ;
        tmp_arr = null ;
        ix = null ;
        jx = null ;

    } ,


    /*
     * 디비에 param type 값 삭제
     * */
    delete_db: function(){
        var self = this ;
        var types = '';
        var ix ;

        self.curr_type = self.tf_store_name.value ;

        //stat 삭제
        common.WebEnv.del_config( self.IDXDB_STAT, self.curr_type ) ;
        common.WebEnv.del_config( self.IDXDB_DB  , self.curr_type ) ;
        common.WebEnv.del_config( self.IDXDB_WAIT, self.curr_type ) ;
        common.WebEnv.del_config( self.IDXDB_GC  , self.curr_type ) ;

        //id 삭제
        common.WebEnv.del_config( self.IDXDB_STAT+'_id', self.curr_type ) ;
        common.WebEnv.del_config( self.IDXDB_DB  +'_id', self.curr_type ) ;
        common.WebEnv.del_config( self.IDXDB_WAIT+'_id', self.curr_type ) ;
        common.WebEnv.del_config( self.IDXDB_GC  +'_id', self.curr_type ) ;


        //type 삭제
        common.WebEnv.del_config( self.IDXDB_TYPES, null ) ;
        common.WebEnv.del_config( self.IDXDB_LAST_TYPE, null ) ;

        //하단그리드삭제
        self.list_grd_store.removeAt( self._select_row_index( self.curr_type ) ) ;

        self._set_check('Default') ;
        //self.list_grd_store.add({ 'active': true, 'List': 'Default' })


        for ( ix = 0 ; ix < self.list_grd_store.data.items.length; ix++ ){
            types = self.list_grd_store.data.items[ix].data.List + ',' + types ;
        }
        types = types.substring(0, types.length-1) ;
        common.WebEnv.insert_config( self.IDXDB_TYPES, types, null ) ;
        common.WebEnv.insert_config( self.IDXDB_LAST_TYPE , 'Default', null ) ;


        self.plus_btn.setDisabled(false) ;
        self.minus_btn.setDisabled(false) ;


        types = null ;
        ix = null ;
        self = null ;

    },

    //----------------------------------------------------------------------------------------------------------------------
    /*
     * plus버튼 클릭시 인덱스 디비에 저장하는 함수 -> ok누르면 저장하는것으로 변경(140414) -> 메시지OK클릭시 저장하는것으로 재변경(150114)
     * @_ok -> 창의 OK버튼클릭시에만 titleUpdate / 다른곳에서 OK시에는 디비에만 저장.
     * */
    save_db: function(_ok){
        var self = this ;



        self.curr_type = common.Util.CTR(self.tf_store_name.value) ;



        if ( _ok ){

            self.save_stat_dt( self.curr_type ) ;


            common.WebEnv.del_config( self.IDXDB_LAST_TYPE ) ;
            common.WebEnv.del_config( self.IDXDB_TYPES, null ) ;


            setTimeout(function(){

                common.WebEnv.insert_config( self.IDXDB_LAST_TYPE , self.curr_type, null ) ;


                //현재 스탯저장
                common.WebEnv.insert_config( self.IDXDB_STAT, JSON.stringify(self.db_stat_list.Stat ), self.curr_type ) ;
                common.WebEnv.insert_config( self.IDXDB_DB  , JSON.stringify(self.db_stat_list.DB   ), self.curr_type ) ;
                common.WebEnv.insert_config( self.IDXDB_WAIT, JSON.stringify(self.db_stat_list.Wait ), self.curr_type ) ;
                common.WebEnv.insert_config( self.IDXDB_GC  , JSON.stringify(self.db_stat_list.GC   ), self.curr_type ) ;

                common.WebEnv.insert_config( self.IDXDB_STAT+'_id', JSON.stringify(self.db_stat_list_id.Stat ), self.curr_type ) ;
                common.WebEnv.insert_config( self.IDXDB_DB  +'_id', JSON.stringify(self.db_stat_list_id.DB   ), self.curr_type ) ;
                common.WebEnv.insert_config( self.IDXDB_WAIT+'_id', JSON.stringify(self.db_stat_list_id.Wait ), self.curr_type ) ;
                common.WebEnv.insert_config( self.IDXDB_GC  +'_id', JSON.stringify(self.db_stat_list_id.GC   ), self.curr_type ) ;



                //이전타입해제
                var old_type, ix, types = '', before ;
                for ( ix = 0 ; ix < self.list_grd_store.data.items.length; ix++ ){

                    types = self.list_grd_store.data.items[ix].data.List + ',' + types ;

                    if ( self.list_grd_store.data.items[ix].data.active ) {
                        old_type = self.list_grd_store.data.items[ix].data.List ;
                    }
                }

                common.WebEnv.insert_config( self.IDXDB_TYPES, types+self.curr_type, null ) ;
                before = self._select_row_index( old_type ) ;

                if ( before !== undefined ){
                    self.list_grd_store.data.items[before].set( 'active', false ) ;
                }

                //하단그리드에 추가해주기.
                var addedRecord = self.list_grd_store.add({ 'active': false, 'List': self.curr_type });


                //call all data
                common.WebEnv.get_all_data() ;



                self.list_grd.getSelectionModel().select(addedRecord[0]);
                self.list_grd.fireEvent('cellclick',  self.list_grd,  null, null , addedRecord[0], null, self.list_grd_store.data.length-1 );
                before = null ;
                old_type = null ;
                ix = null ;

                self.plus_btn.setDisabled(false) ;
                self.minus_btn.setDisabled(false) ;

            },500);


        }



        if ( !_ok ){

            self.config_type = self.tf_store_name.value ;
            //Comm.web_env_info[self.IDXDB_LAST_TYPE]

            if ( Array.isArray(Comm.web_env_info[ self.IDXDB_STAT+'_'+self.config_type ]) ){
                self.db_stat_list.Stat = Comm.web_env_info[ self.IDXDB_STAT+'_'+self.config_type ]  ;
                self.db_stat_list.DB   = Comm.web_env_info[ self.IDXDB_DB+'_'+self.config_type ]  ;
                self.db_stat_list.Wait = Comm.web_env_info[ self.IDXDB_WAIT+'_'+self.config_type ]  ;
                self.db_stat_list.GC   = Comm.web_env_info[ self.IDXDB_GC+'_'+self.config_type ]  ;

                self.db_stat_list_id.Stat = Comm.web_env_info[ self.IDXDB_STAT+'_id_'+self.config_type ] ;
                self.db_stat_list_id.DB   = Comm.web_env_info[ self.IDXDB_DB+'_id_'+self.config_type ] ;
                self.db_stat_list_id.Wait = Comm.web_env_info[ self.IDXDB_WAIT+'_id_'+self.config_type ] ;
                self.db_stat_list_id.GC   = Comm.web_env_info[ self.IDXDB_GC+'_id_'+self.config_type ] ;
            }else{
                self.db_stat_list.Stat = JSON.parse( Comm.web_env_info[ self.IDXDB_STAT+'_'+self.config_type ] ) ;
                self.db_stat_list.DB   = JSON.parse( Comm.web_env_info[ self.IDXDB_DB+'_'+self.config_type ] ) ;
                self.db_stat_list.Wait = JSON.parse( Comm.web_env_info[ self.IDXDB_WAIT+'_'+self.config_type ] ) ;
                self.db_stat_list.GC   = JSON.parse( Comm.web_env_info[ self.IDXDB_GC+'_'+self.config_type ] ) ;

                self.db_stat_list_id.Stat = JSON.parse( Comm.web_env_info[ self.IDXDB_STAT+'_id_'+self.config_type ] );
                self.db_stat_list_id.DB   = JSON.parse( Comm.web_env_info[ self.IDXDB_DB+'_id_'+self.config_type ] );
                self.db_stat_list_id.Wait = JSON.parse( Comm.web_env_info[ self.IDXDB_WAIT+'_id_'+self.config_type ] );
                self.db_stat_list_id.GC   = JSON.parse( Comm.web_env_info[ self.IDXDB_GC+'_id_'+self.config_type ] );
            }



            //현재타입저장
            common.WebEnv.del_config( self.IDXDB_LAST_TYPE ) ;
            common.WebEnv.insert_config( self.IDXDB_LAST_TYPE , self.config_type, null ) ;

            setTimeout(function(){



                self.scope.pnl_stat.loadingMask.show() ;
                self.scope.pnl_db  .loadingMask.show() ;
                self.scope.pnl_wait.loadingMask.show() ;
                self.scope.pnl_gc  .loadingMask.show() ;

                self.scope.title_update( self.scope.arr_stat_chart , self.db_stat_list.Stat ) ;
                self.scope.title_update( self.scope.arr_db_chart   , self.db_stat_list.DB   ) ;
                self.scope.title_update( self.scope.arr_wait_chart , self.db_stat_list.Wait ) ;
                self.scope.title_update( self.scope.arr_gc_chart   , self.db_stat_list.GC   ) ;

                if ( !self.flag_refresh ) {
                    self.scope.pnl_stat.loadingMask.hide() ;
                    self.scope.pnl_db.loadingMask.hide() ;
                    self.scope.pnl_wait.loadingMask.hide() ;
                    self.scope.pnl_gc.loadingMask.hide() ;
                    return ;
                }

                self.scope.get_mid_chart( self.curr_active_tab.itemId ) ;
                self.scope.pnl_stat.loadingMask.hide() ;
                self.scope.pnl_db.loadingMask.hide() ;
                self.scope.pnl_wait.loadingMask.hide() ;
                self.scope.pnl_gc.loadingMask.hide() ;

                self = null ;

            }, 1000) ;
        }

    },


    //----------------------------------------------------------------------------------------------------------------------
    //첫번째 로우 선택
    set_select_first: function(){
        var self = this ;

        self.check_change() ;

        select_grd( self.left_tab_pnl, self.curr_stat_grd ) ;
        select_grd( self.left_tab_pnl, self.curr_gc_grd ) ;
        select_grd( self.stat_change, self.stat_change.statTabGrid ) ;
        select_grd( self.stat_change, self.stat_change.gcTabGrid ) ;

        if ( self.is_visible ){
            select_grd( self.left_tab_pnl, self.curr_db_grd ) ;
            select_grd( self.left_tab_pnl, self.curr_wait_grd ) ;
            select_grd( self.stat_change, self.stat_change.dbTabGrid ) ;
            select_grd( self.stat_change, self.stat_change.waitTabGrid ) ;
        }

        function select_grd( grd_parent, grd_obj ){
            if ( grd_parent == null ) {
                return;
            }

            //grid.Panel사용한경우(base stat change)
            if ( grd_parent.itemId == undefined ){
                grd_obj.getSelectionModel().select( grd_obj.getStore().getAt( 0 ) ) ;
            }else{
                var grd_store = grd_obj.pnlExGrid.getStore() ;
                grd_obj.pnlExGrid.getSelectionModel().select( grd_store.getAt(0) ) ; //이건 그냥 선택! 선택만임!
            }
            self.stat_change.statTabGrid.getSelectionModel().select( self.stat_change.statTabGrid.getStore().getAt( 0 ) ) ;
        }
    } ,

    //----------------------------------------------------------------------------------------------------------------------
    check_stat: function( before, curr, operator ){
        var self = this  ;

        if ( operator == '-' ) {
            self.list_grd_store.data.items[before].set( 'active', true ) ;
        } else {
            self.list_grd_store.data.items[before].set( 'active', false ) ;
        }

        self.list_grd.beforeIndex = curr ;
        self.tf_store_name.setValue( self.list_grd_store.data.items[ curr ].data.List ) ;
    } ,

    //----------------------------------------------------------------------------------------------------------------------
    validate_chk_len: function( active_tab ){
        var self = this ;
        var curr_grd ;

        switch ( active_tab.title ){
            case 'Stat':
                curr_grd = self.curr_stat_grd ;
                break ;

            case 'DB':
                curr_grd = self.curr_db_grd ;
                break ;

            case 'Wait':
                curr_grd = self.curr_wait_grd ;
                break ;

            case 'GC':
                curr_grd = self.curr_gc_grd ;
                break ;

            default:
                break;
        }

        var grd_len = curr_grd.pnlExGrid.getStore().data.length ;
        return grd_len ;
    } ,



    //----------------------------------------------------------------------------------------------------------------------
    selected_chk_grd: function( active_tab ){
        var self = this ;
        var curr_grd ;

        switch ( active_tab.getActiveTab().title ){
            case 'Stat':
                if ( active_tab.itemId == 'left_tab_pnl' )
                    curr_grd = self.curr_stat_grd ;
                else curr_grd = self.stat_change.statTabGrid ;
                break ;

            case 'DB':
                if ( active_tab.itemId == 'left_tab_pnl' )
                    curr_grd = self.curr_db_grd ;
                else curr_grd = self.stat_change.dbTabGrid ;
                break ;

            case 'Wait':
                if ( active_tab.itemId == 'left_tab_pnl' )
                    curr_grd = self.curr_wait_grd ;
                else curr_grd = self.stat_change.waitTabGrid ;
                break ;

            case 'GC':
                if ( active_tab.itemId == 'left_tab_pnl' )
                    curr_grd = self.curr_gc_grd ;
                else curr_grd = self.stat_change.gcTabGrid ;
                break ;

            default:
                break;
        }
        return curr_grd ;
    } ,


    //----------------------------------------------------------------------------------------------------------------------
    //오른쪽 -> 왼쪽
    add_click_fun: function( btn ){
        var self = this ;

        btn.addListener('click', function(){
            var active_curr_tab = self.left_tab_pnl.getActiveTab();

            var grd_len         = self.validate_chk_len( active_curr_tab ) ,
                select_grd      = self.selected_chk_grd( self.stat_change ) ,
                add_grd         = self.selected_chk_grd( self.left_tab_pnl ) ,
                key_name ;

            if ( grd_len >= 4  ) {
                return ;
            }
            switch ( self.left_tab_pnl.getActiveTab().title ){
                case 'Stat': key_name = 'Stat';
                    break ;

                case 'DB': key_name = 'DB';
                    break ;

                case 'Wait': key_name = 'Wait';
                    break;

                case 'GC': key_name = 'GC';
                    break;

                default:
                    break;
            }

            var select_row = select_grd.getSelectionModel().getSelection()[0] ;
            var select_val = select_grd.getStore().findRecord('name', select_row.data.name) ;

            //왼쪽꺼 루핑돌면서 이미 들어가있는 값이 있다면 얼럿창 뿅.
            for ( var ix = 0 ; ix < add_grd.pnlExGrid.getStore().data.length; ix++ ){
                var validate_str = add_grd.pnlExGrid.getStore().data.items[ix].data[key_name] ;
                if ( validate_str == select_val.data.name ){
                    common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Already exists'),
                        Ext.Msg.OK, Ext.MessageBox.ERROR, function() {

                        });
                    return false;
                }
            }
            add_grd.addRow( [ select_row.data.name, select_row.data._id ] ) ;
            add_grd.drawGrid() ;


            var select_pos = select_grd.store.indexOf(select_row) - 1 ;
            if ( select_pos < 0 ) {
                select_pos = 0 ;
            }
            select_grd.getSelectionModel().select( select_grd.getStore().getAt( select_pos ) ) ;
            add_grd.pnlExGrid.getSelectionModel().select( add_grd.pnlExGrid.getStore().getAt(0) ) ; //이건 그냥 선택! 선택만임!
        }) ;
    } ,


    //----------------------------------------------------------------------------------------------------------------------
    remove_click_fun: function( btn ){
        var self = this ;

        btn.addListener('click', function(){
            var active_curr_tab = self.left_tab_pnl.getActiveTab();
            var grd_len         = self.validate_chk_len( active_curr_tab ) ;
            var select_grd      = self.selected_chk_grd( self.left_tab_pnl ) ;
            var add_grd         = self.selected_chk_grd( self.stat_change ) ;
            var idx ;

            if ( grd_len == 0  ) {
                return ;
            }

            //왼쪽패널놈
            var select_row = select_grd.pnlExGrid.getSelectionModel().getSelection()[0] ;
            var select_pos = select_grd.pnlExGrid.store.indexOf(select_row) ;
            select_grd.deleteRow( select_pos ) ;
            select_grd.drawGrid() ;

            if ( select_pos > 0 ) {
                idx = select_pos - 1 ;
                select_grd.pnlExGrid.getSelectionModel().select(select_grd.pnlExGrid.getStore().getAt(idx)); //이건 그냥 선택! 선택만임!
                add_grd.getSelectionModel().select( add_grd.getStore().getAt(0) ) ;
            }

        }) ;
    } ,

    //----------------------------------------------------------------------------------------------------------------------
    up_click_fun: function( btn ){
        var self = this ;

        btn.addListener('click', function(){
            var select_grd = self.selected_chk_grd( self.left_tab_pnl ) ,
                select_row = select_grd.pnlExGrid.getSelectionModel().getSelection()[0],
                select_pos = select_grd.pnlExGrid.store.indexOf( select_row ) ;

            if ( select_pos == 0 ) {
                return ;
            }
            select_grd.deleteRow( select_pos ) ;
            select_grd.insertRow( select_pos-1, [ select_row.data[ select_grd.itemId ], select_row.data.Index ] ) ;
            select_grd.drawGrid() ;

//            self.save_stat_dt( self.tf_store_name.value ) ;
//            self.check_change() ;
            select_grd.pnlExGrid.getSelectionModel().select( select_grd.pnlExGrid.getStore().getAt(select_pos-1) ) ; //이건 그냥 선택! 선택만임!
        }) ;
    } ,

    //----------------------------------------------------------------------------------------------------------------------
    down_click_fun: function( btn ){
        var self = this ;

        btn.addListener('click', function(){
            var select_grd = self.selected_chk_grd( self.left_tab_pnl ) ,
                select_row = select_grd.pnlExGrid.getSelectionModel().getSelection()[0],
                select_pos = select_grd.pnlExGrid.store.indexOf( select_row ) ;

            if ( select_pos == 3 ) {
                return ;
            }

            select_grd.deleteRow( select_pos ) ;
            select_grd.insertRow( select_pos+1, [ select_row.data[ select_grd.itemId ], select_row.data.Index ] ) ;
            select_grd.drawGrid() ;


            select_grd.pnlExGrid.getSelectionModel().select( select_grd.pnlExGrid.getStore().getAt( select_pos+1 ) ) ; //이건 그냥 선택! 선택만임!
        }) ;
    } ,

    //----------------------------------------------------------------------------------------------------------------------
    layout_main: function(){
        var self = this ;


        //main
        self.main_pnl = Ext.create( 'Exem.Panel', {
            layout: 'hbox',
            width : '100%',
            flex  : 11,
            style : {
                borderRadius: '6px 6px 0px 0px'
            }
        } ) ;

        var main_btn = Ext.create( 'Exem.Container', {
            itemId: 'main_pnl',
            layout: {
                type : 'vbox',
                align: 'middle',
                pack : 'center'
            },
            width : '100%',
            flex  : 1,
            style : {
                background: '#fff',
                borderRadius: '0px 0px 6px 6px'
            }
        } ) ;




        var okBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('OK'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        var isOk = self.validate_stat_count() ;
                        if ( !isOk ) {
                            return ;
                        }

                        self.save_db(false);
                        self.close();
                    });
                }
            }
        });


        var cancelBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('Cancel'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {

                        self.close() ;
                    });
                }
            }
        });



        var bottomArea = Ext.create('Exem.Container', {
            width : '100%',
            //margin: '10 0 0 0',
            height: 25,
            layout: {
                type : 'hbox',
                align: 'middle',
                pack: 'center'
            },
            style : 'background: #ffffff',
            items : [ okBtn,{ xtype:'tbspacer', width: 3 }, cancelBtn ]
        });
        main_btn.add( bottomArea ) ;


        var layout_hbox_pnl = function( pnl_id, layout ){
            var pnl = Ext.create( 'Exem.Container',{
                itemId : pnl_id,
                layout : layout,
                flex   : 1
            } ) ;
            return pnl ;
        } ;
        var left_pnl  = layout_hbox_pnl( 'left_pnl', 'vbox' ) ;
        var right_pnl = layout_hbox_pnl( 'right_pnl', 'vbox' ) ;

        self.add( self.main_pnl, main_btn ) ;
        self.main_pnl.add( left_pnl, right_pnl ) ;





        //*******************************************************************
        //left layout
        var layout_left_pnl = function( pnl_id, size, layout_type ){

            var pnl = Ext.create( 'Exem.Panel',{
                itemId: pnl_id,
                layout: layout_type,
                width : '100%',
                flex  : size
            } ) ;

            if ( pnl_id == 'left_in_text' ){
                self.tf_store_name = Ext.create('Ext.form.field.Text',{
                    width: 230,
                    margin: '7 0 0 0'
                }) ;
                self.plus_btn = Ext.create('Ext.button.Button',{
                    text: '+',
                    width: 28,
                    margin: '7 3 0 3',
                    listeners:{
                        click: function(){
                            var type_name = common.Util.TR(self.tf_store_name.value) ;

                            // 1.갯수확인하는 함수호출.
                            var isOk = self.validate_stat_count() ;
                            if ( !isOk ) {
                                return ;
                            }

                            // 2.중복체크 -> 원하면 덮어씌운다. 디폴트는 예외.
                            if (type_name == common.Util.TR('Default')){
                                common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('You cannot modify Default.'),
                                    Ext.Msg.OK, Ext.MessageBox.ERROR, function() {

                                    });
                                return false;
                            }

                            for ( var ix = 0 ; ix < self.list_grd_store.data.items.length; ix++ ){
                                if ( self.list_grd_store.data.items[ix].data.List == type_name ){
                                    common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('The name that is already saved. Do you want to continue?'),
                                        Ext.Msg.OKCANCEL, Ext.MessageBox.INFO, function(buttonId) {
                                            if (buttonId === "ok") {

                                                self.plus_btn.setDisabled(true) ;
                                                self.minus_btn.setDisabled(true) ;

                                                self.delete_db( type_name ) ;
                                                self.save_db(true) ;

                                            }
                                        });
                                    return false;
                                }
                            }



                            common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Would you like to add?'),
                                Ext.Msg.OKCANCEL, Ext.MessageBox.INFO, function(buttonId) {
                                    if (buttonId === "ok") {
                                        //validation
                                        //2. 타입이름 체크
                                        if ( type_name == '' || type_name == undefined ){
                                            common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Please enter your Stat'),
                                                Ext.Msg.OK, Ext.MessageBox.INFO, function() {
                                                    self.tf_store_name.focus() ;
                                                });
                                            return false;
                                        }
                                        if ( type_name == common.Util.TR('Default') ) {
                                            common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Default already exists.'),
                                                Ext.Msg.OK, Ext.MessageBox.ERROR, function() {
                                                    self.list_grd_store.data.items[0].set( 'active', true ) ;
                                                });
                                            return false;
                                        }

                                        self.plus_btn.setDisabled(true) ;
                                        self.minus_btn.setDisabled(true) ;

                                        self.save_db(true) ;


                                        //체크해주기.
                                        self.check_stat( self.list_grd.beforeIndex, self.list_grd_store.data.items.length - 1, '+' ) ;
                                    }
                                });
                        }
                    }
                }) ;
                self.minus_btn = Ext.create('Ext.button.Button',{
                    text: '-',
                    width: 28,
                    margin: '7 3 0 0',
                    listeners:{
                        click: function(){
                            var type_name = common.Util.CTR( self.tf_store_name.value ) ;
                            if ( type_name == undefined || type_name == '' ) {
                                return ;
                            }

                            //1. Default삭제 예외
                            if ( type_name == common.Util.CTR(self.IDXDB_DEFAULT) ) {
                                common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('You cannot delete Default.'),
                                    Ext.Msg.OK, Ext.MessageBox.ERROR, function() {

                                    });
                                return false;
                            }


                            var select_row = self._select_row_index(type_name) ;

                            common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Are you sure you want to delete?'),
                                Ext.Msg.OKCANCEL, Ext.MessageBox.INFO, function(buttonId) {
                                    if (buttonId === "ok") {
                                        if ( type_name == common.Util.CTR(self.IDXDB_DEFAULT) ){

                                            common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('You cannot delete Default.'),
                                                Ext.Msg.OK, Ext.MessageBox.ERROR, function() {
                                                    self.list_grd_store.data.items[0].set( 'active', true ) ;
                                                });
                                            return;
                                        }
                                        self.list_grd_store.removeAt( select_row ) ;
                                        self.list_grd.getView().refresh();

                                        self.plus_btn.setDisabled(true) ;
                                        self.minus_btn.setDisabled(true) ;

                                        self.delete_db( type_name ) ;
                                        self.check_stat( 0, 0, '-' ) ;
                                    }
                                }
                            );
                        }
                    }
                }) ;
                pnl.add( self.tf_store_name, self.plus_btn, self.minus_btn ) ;
            }
            return pnl ;
        } ;
        var left_in_pnl  = layout_left_pnl( 'left_in_pnl' , 5 , 'hbox') ,
            left_in_text = layout_left_pnl( 'left_in_text', 1 , 'hbox') ,
            left_in_list = layout_left_pnl( 'left_in_list', 3 , 'hbox') ;


        //left tab panel
        self.left_tab_pnl = Ext.create('Exem.TabPanel',{
            itemId: 'left_tab_pnl',
            layout: 'fit',
            height: '100%',
            flex : 8,
            activeTab: 0,
            items: [{ title: common.Util.TR('Agent Stat'), layout: 'fit', tab_idx: 0 }
                ,{ title: common.Util.TR('DB Stat'), layout: 'fit', tab_idx: 1 }
                ,{ title: common.Util.TR('DB Wait'), layout: 'fit', tab_idx: 2 }
                ,{ title: common.Util.TR('GC Stat'), layout: 'fit', tab_idx: 3 }] ,
            listeners:{
                tabchange: function( tabPanel, newCard){
                    self.sync_tab( newCard.tab_idx ) ;
                }
            }
        }) ;
        var left_btn_pnl = Ext.create('Exem.Container', {
            layout: { type: 'vbox', align: 'center', pack: 'center' },
            flex  : 1
        }) ;
        left_in_pnl.add( self.left_tab_pnl, left_btn_pnl ) ;
        left_pnl.add( left_in_pnl, left_in_text, left_in_list ) ;

        //left_in_panel in Grid
        self.curr_stat_grd  = Ext.create('Exem.BaseGrid',{ usePager: false, hideGridHeader: true, adjustGrid: true, itemId: 'Stat'  }) ;
        self.curr_db_grd    = Ext.create('Exem.BaseGrid',{ usePager: false, hideGridHeader: true, adjustGrid: true, itemId: 'DB'    }) ;
        self.curr_wait_grd  = Ext.create('Exem.BaseGrid',{ usePager: false, hideGridHeader: true, adjustGrid: true, itemId: 'Wait'  }) ;
        self.curr_gc_grd    = Ext.create('Exem.BaseGrid',{ usePager: false, hideGridHeader: true, adjustGrid: true, itemId: 'GC'    }) ;
        self.left_tab_pnl.items.items[0].add(self.curr_stat_grd);
        self.left_tab_pnl.items.items[1].add(self.curr_db_grd);
        self.left_tab_pnl.items.items[2].add(self.curr_wait_grd);
        self.left_tab_pnl.items.items[3].add(self.curr_gc_grd);
        self.curr_stat_grd.addColumn('Stat' , 'Stat' , 200, Grid.String, true , false) ;
        self.curr_stat_grd.addColumn('Index', 'Index', 300, Grid.String, false, true ) ;
        self.curr_gc_grd  .addColumn('GC'   , 'GC'   , 300, Grid.String, true , false) ;
        self.curr_gc_grd  .addColumn('Index', 'Index', 300, Grid.String, false, true ) ;
        self.curr_db_grd  .addColumn('DB'   , 'DB'   , 300, Grid.String, true , false) ;
        self.curr_db_grd  .addColumn('Index', 'Index', 300, Grid.String, false, true ) ;
        self.curr_wait_grd.addColumn('Wait' , 'Wait' , 300, Grid.String, true , false) ;
        self.curr_wait_grd.addColumn('Index', 'Index', 300, Grid.String, false, true ) ;


        //left_in_list in Grid
        self.list_grd_store = Ext.create('Ext.data.Store',{
            data: [],
            fields: [{name: 'active', type: 'bool', width: 10 },{name : 'List'}]
        }) ;
        self.list_grd = Ext.create('Ext.grid.Panel',{
            store      : self.list_grd_store,
            width      : '100%',
            height     : '100%',
            hideHeaders: true,
            autoScroll : true,
            forceFit   : true,
            beforeIndex: 0,
            viewConfig :{
                markDirty:false
            },
            listeners: {
                cellclick: function( thisColumn, td, cellIndex, record, tr, rowIndex){
                    if ( !record.data.active ){
                        for ( var ix = 0; ix < self.list_grd_store.data.items.length; ix++ )
                            self.list_grd_store.data.items[ix].set( 'active', false ) ;

                        self.list_grd_store.data.items[rowIndex].set( 'active', true ) ;
                        self.tf_store_name.setValue( self.list_grd_store.data.items[rowIndex].data.List ) ;

                        self.check_change() ;

                    }
                }
            },
            columns    : [{
                xtype: 'checkcolumn',
                dataIndex: 'active',
                beforeIndex: null,
                width : 25 ,
                listeners: {
                    checkchange: function( thisColumn, rowIndex, checked, eOpts ){
                        if(checked === true) {
                            self.check_stat( this.up().up().beforeIndex, rowIndex, '+' ) ;
                            //self.check_change() ;
                        } else {
                            self.check_stat( this.up().up().beforeIndex, rowIndex, '-' );
                        }
                    }
                }
            },{ text:'NAME', dataIndex:'List', flex: 1 }]
        }) ;
        left_in_list.add( self.list_grd ) ;




        //left button
        var create_btn = function(_cls) {
            var button = Ext.create('Ext.button.Button',{
                width  : 30,
                margin : '0 0 3 0',
                iconCls: _cls
            });
            return button;
        };
        self.add_btn    = create_btn('arrow_add' );
        self.remove_btn = create_btn('arrow_remove');
        self.up_btn     = create_btn('arrow_up'   ) ;
        self.down_btn   = create_btn('arrow_down' ) ;

        //각버튼마다 리스너 연결
        self.add_click_fun( self.add_btn ) ;
        self.remove_click_fun( self.remove_btn ) ;
        self.up_click_fun( self.up_btn ) ;
        self.down_click_fun( self.down_btn ) ;

        left_btn_pnl.add( self.add_btn, self.remove_btn, self.up_btn, self.down_btn ) ;



        //*******************************************************************
        //right layout
        self.stat_change = Ext.create('view.PerformanceTrendStatChange',{
            instanceId: self.db_id,
            flex : 1,
            useTab: {
                stat   : true,
                db     : true,
                wait   : true,
                gc     : true,
                pool   : false
            },
            useCheckBox: false

        }) ;
        right_pnl.add( self.stat_change ) ;
    } ,

    //----------------------------------------------------------------------------------------------------------------------
    //체크되어있는 타입의 키로 디비검색해서 해당하는 value 그리드에 뿌리기.
    check_change: function(){
        var self = this ;
        var tmp_stat,
            tmp_id;

        self.curr_type = self.tf_store_name.value ;


        var _check_change = function( grd_obj, _key, key_name ){

            //if ( tmp_stat == undefined ){
            //common.WebEnv.get_config( self.IDXDB_STAT, self.db_stat_list.Stat, self.curr_type ) ;
            //common.WebEnv.get_config( self.IDXDB_DB  , self.db_stat_list.DB  , self.curr_type ) ;
            //common.WebEnv.get_config( self.IDXDB_WAIT, self.db_stat_list.Wait, self.curr_type ) ;
            //common.WebEnv.get_config( self.IDXDB_GC  , self.db_stat_list.GC  , self.curr_type ) ;
            //

            //get id
            //common.WebEnv.get_config( self.IDXDB_STAT+'_id', self.db_stat_list_id.Stat, self.curr_type ) ;
            //common.WebEnv.get_config( self.IDXDB_DB  +'_id', self.db_stat_list_id.DB  , self.curr_type ) ;
            //common.WebEnv.get_config( self.IDXDB_WAIT+'_id', self.db_stat_list_id.Wait, self.curr_type ) ;
            //common.WebEnv.get_config( self.IDXDB_GC  +'_id', self.db_stat_list_id.GC  , self.curr_type ) ;

            //} ;

            //setTimeout(function(){
            if ( Array.isArray(Comm.web_env_info[_key+'_'+self.curr_type]) ){
                tmp_stat = Comm.web_env_info[_key+'_'+self.curr_type] ;
                tmp_id  = Comm.web_env_info[_key+'_id_'+self.curr_type] ;
            }else{
                tmp_stat = JSON.parse(Comm.web_env_info[_key+'_'+self.curr_type] ) ;
                tmp_id  = JSON.parse(Comm.web_env_info[_key+'_id_'+self.curr_type]) ;
            }


            self.chk_stat_list[key_name] = [] ;

            //tmp_stat = tmp_stat.split(',') ;
            //tmp_id   = tmp_id.split(',') ;

            grd_obj.clearRows() ;

            for ( var jx = 0 ; jx < tmp_stat.length; jx++ ){
                //현재 체크되어있는 스탯 담기.
                self.chk_stat_list[key_name].push( tmp_stat[jx] ) ;
                grd_obj.addRow(  [ common.Util.CTR( tmp_stat[jx] ), tmp_id[jx]  ]) ;
            } ;

            grd_obj.drawGrid() ;
            //}, 1000)

        } ;


        _check_change( self.curr_stat_grd, self.IDXDB_STAT, 'Stat'  ) ;
        _check_change( self.curr_db_grd  , self.IDXDB_DB  , 'DB' ) ;
        _check_change( self.curr_wait_grd, self.IDXDB_WAIT, 'Wait'  ) ;
        _check_change( self.curr_gc_grd  , self.IDXDB_GC  , 'GC'  ) ;
        self.save_stat_dt() ;
    },


    //----------------------------------------------------------------------------------------------------------------------
    validate_stat_count: function(){
        var self = this ;
        var //apply_stat,
            apply_idx ;

        //갯수체크
        if ( self.curr_stat_grd.pnlExGrid.getStore().data.items.length < 4 ||
            self.curr_gc_grd.pnlExGrid.getStore().data.items.length < 4 ) {

            if ( self.curr_stat_grd.pnlExGrid.getStore().data.items.length < 4 )
                apply_idx = 0 ;
            else if ( self.curr_gc_grd.pnlExGrid.getStore().data.items.length < 4 )
                apply_idx = 3 ;

            if ( !self.is_visible ){
                if ( self.curr_db_grd.pnlExGrid.getStore().data.items.length < 4 )
                    apply_idx = 1 ;
                else if ( self.curr_wait_grd.pnlExGrid.getStore().data.items.length < 4 )
                    apply_idx = 2 ;
            } ;


            common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Stat count of tabs should be four.'),
                Ext.Msg.OK, Ext.MessageBox.ERROR, function() {
                    self.tf_store_name.focus() ;
                    self.left_tab_pnl.setActiveTab( apply_idx ) ;
                });
            return false;
        } ;
        return true ;
    } ,

    //----------------------------------------------------------------------------------------------------------------------
    sync_tab: function( idx ){
        var self = this ;

        self.left_tab_pnl.setActiveTab( idx ) ;
        self.stat_change.setActiveTab( idx ) ;
    } ,

    _set_check: function(_type){
        var self = this ;
        for ( var ix = 0; ix < self.list_grd_store.data.items.length; ix++ ){
            if ( self.list_grd_store.data.items[ix].data.List == _type ){
                self.list_grd_store.data.items[ix].set( 'active', true ) ;
                self.tf_store_name.setValue( self.curr_type ) ;
                self.list_grd.beforeIndex = ix ;
            }
        }

        ix = null ;
        self = null ;
    },

    _select_row_index: function( _type ){
        var self = this;
        var ix, select_row ;

        for ( ix = 0 ; ix < self.list_grd_store.data.items.length; ix++ ){
            if ( self.list_grd_store.data.items[ix].data.List == _type ){
                select_row = ix ;
                break ;
            }
        }

        self = null ;
        ix = null ;

        return select_row;
    }
}) ;