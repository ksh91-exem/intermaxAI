/*
 *
 * Time조건
 * get_active_data, get_lock_date, get_active_sum함수의 시간은 2014-02-20 10:00:00 형.
 * move_time에들어가는 파라미터는 Unixtime형.*
 *
 *
 * 1510.5 Ratio지표 모두 제거.
 *
 * */
Ext.define("view.DBTrend",{
    extend: "Exem.FormOnCondition",
    width : '100%',
    heigth: '100%',
    DisplayTime: DisplayTimeMode.HM,
    rangeOnly  : true, //하루조회
    singeField : false,
    style : {
        background: '#cccccc'
    },
    sql   :{
        top_chart                  : 'IMXPA_DBTrend_TopChart.sql' ,
        top_cpu_chart              : 'IMXPA_DBTrend_TopCPUChart.sql',
        top_lock_chart             : 'IMXPA_DBTrend_TopLockTree.sql',

        mid_stat_chart             : 'IMXPA_DBTrend_Mid_Stat.sql',
//        mid_db_stat_name           : 'IMXPA_PerformanceTrend_Mid_DB_StatName.sql',

        mid_wait_chart             : 'IMXPA_DBTrend_Mid_Wait.sql',
        mid_wait_latch_chart       : 'IMXPA_DBTrend_Mid_Wait_Latch.sql',
        mid_val_stat_grd           : 'IMXPA_DBTrend_Mid_Value_stat.sql',
        mid_val_wait_grd           : 'IMXPA_DBTrend_Mid_Value_wait.sql',
        //mid_ratio_cursor_user_call : 'IMXPA_DBTrend_Mid_Ratio_cursor_user_call.sql',
        //mid_ratio_buffer_busy      : 'IMXPA_DBTrend_Mid_Ratio_buffer_busy.sql',
        //mid_ratio_buffer_cache     : 'IMXPA_DBTrend_Mid_Ratio_buffer_cache.sql',
        //mid_ratio_sort_disk_rows   : 'IMXPA_DBTrend_Mid_Ratio_sort_disk_rows.sql',
        //mid_ratio_buffer_avg       : 'IMXPA_DBTrend_Mid_Ratio_buffer_avg.sql',
        //mid_ratio_free_inspected   : 'IMXPA_DBTrend_Mid_Ratio_free_inspected.sql',
        //mid_ratio_log_buffer       : 'IMXPA_DBTrend_Mid_Ratio_log_buffer.sql',
        //mid_ratio_row_index_scan   : 'IMXPA_DBTrend_Mid_Ratio_row_index_scan.sql',
        mid_osstat_chart           : 'IMXPA_DBTrend_Mid_OSstat.sql',
        mid_lock_tree              : 'IMXPA_DBTrend_Mid_Locktree.sql',
        mid_lock_tree_list         : 'IMXPA_DBTrend_Mid_LocktreeList.sql',
        mid_lock_info              : 'IMXPA_DBTrend_Mid_LockInfo.sql',
        bot_activesession          : 'IMXPA_DBTrend_Bot_ActiveSession.sql',
        bot_process                : 'IMXPA_DBTrend_Bot_Process.sql',
        bot_activesession_sum      : 'IMXPA_DBTrend_Bot_ActiveSession_Sum.sql',
        lock_sec_frame             : 'IMXPA_DBTrend_Mid_SecFrame.sql',
        sec_frame                  : 'IMXPA_DBTrend_Bot_SecFrame.sql',

        stat                       : 'IMXPA_DBTrend_StatChange_s.sql',
        wait                       : 'IMXPA_DBTrend_StatChange_w.sql'
    },

    //탭 관련 플래그 변수
    flag_list : {
        flag_refresh     : false ,
        //tab_change이벤트가 첫페이지에서 실행이 되므로,
        //retrieve버튼을 누르지않았으면 실행하게 하지않는 플래그 따로둠.
        flag_execute     : false ,

        flag_cpu         : false ,
        flag_top_active  : false ,
        flag_lreads      : false ,
        flag_preads      : false ,
        flag_exec        : false ,
        flag_locked      : false ,
        flag_redo        : false ,

        flag_zoom     : {
            top_chart : false,
            top_locked: false,
            mid_wait  : false,
            mid_wait_latch: false ,
            //mid_ratio1: false,
            //mid_ratio2: false,
            //mid_ratio3: false,
            //mid_ratio4: false,
            mid_os    : false
        },

        flag_stat        : false ,
        flag_wait        : false ,
        flag_val         : false ,
        //flag_ratio       : false ,
        flag_osstat      : false ,
        flag_locktree    : false ,
        flag_lockinfo    : false ,

        flag_active      : false ,
        flag_process     : false ,
        flag_active_sum  : false
    } ,

    LABEL_FORMAT : '____-__-__ __:__:__',
    IDXDB_ENV : 'environment',

    //statchange form
    stat_change_form : null,

    //stat change관련 아그들
    stat_list : {
        Stat : [] ,
        Wait : [] ,
        Ratio: []
    } ,

    //인덱스디비값
    //각 스탯별 이름 리스트
    stat_name_list : {
        Stat: [],
        Wait: [],
        Ratio: [],
        OS: []
    } ,

    stat_id_list : [],

    all_stat_list: {
        Stat : [] ,
        Wait : [] ,
        Ratio: []
    } ,

    //event_name = common.DataModule.referenceToDB.eventName

    //stat 차트
    arr_stat_chart : [],
    //wait 차트
    arr_wait_chart : [],

//    ratio 관련 = common.DataModule.referenceToDB.ratioName
    ratio_dt_idx    : [] ,
    arr_ratio_chart : [] ,
    flag_statchange : false ,


    //os 차트
    arr_os_chart : [],

    move_pos: {
        x: 0,
        y: 0
    },


    //lock info에서 클릭한 시작시간의 초를저장 ->
    //초를제외한 시:분으로 데이터가져온후 해당초에맞게 bold해줘야하므로 따로저장,
    lock_info_sec: null,
    ///////////////////////////////////////////////////////

    checkValid: function() {
        var self = this;

        if (self.dbCombo.getValue().trim().length < 1) {

            Ext.Msg.show({
                title  : common.Util.TR('ERROR'),
                msg    : common.Util.TR('There is no DB info'),
                buttons: Ext.Msg.OK,
                icon   : Ext.MessageBox.ERROR,
                fn     : function() {
                    self.dbCombo.focus();
                }
            });

            return false;
        }

        return self.dbCombo.checkValid();
    },


    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
            if(this.stat_change){
                this.stat_change.destroy();
            }

            this.chart_cpu.clearDependentChart();
            Ext.destroy(this.move_form);
            this.brush.destroy();
        }
    },

    init: function(){
        var self = this ;

        self.conditionRetrieveArea.items.items[0].setDisabled( true ) ;

        //session detail 변수담기위한 배열
        self.sess_detail_var = [] ;
        self.click_time     = null;
        self.zoom_mode      = null ;

        self.curr_sec = {
            active: null ,
            lock  : null
        } ;

        self.curr_sec_frm = {
            active: null,
            lock  : null
        } ;

        self.IDXDB_DB_STAT    = 'pa_db_trend_stat';
        self.IDXDB_DB_WAIT    = 'pa_db_trend_wait';
        self.default_db_stat = [ 'session logical reads', 'physical reads', 'execute count', 'redo entries' ] ;
        self.default_db_wait = [ 'Latch Wait Time (Total)', 'db file sequential read', 'db file scattered read', 'library cache pin' ] ;
        /**
        //self.default_db_ratio =  [ 'Buffer Cache Hit Ratio', 'Log Buffer Retry Ratio', 'Log Space Request Ratio', 'Free Buffer Scan Ratio' ] ;
         */

        // label 날싸 format 형식 설정 2014/08/12 JH
        switch(nation) {
            case 'ko' :
                self.LABEL_FORMAT = '____-__-__ __:__:__';
                break;
            case 'zh-CN':
            case 'ja' :
                self.LABEL_FORMAT = '____/__/__ __:__:__';
                break;
            case 'en' :
                self.LABEL_FORMAT = '__/__/____ __:__:__';
                break;
            default :
                break;
        }

        self.curr_sec.active     = [];
        self.curr_sec.lock       = [];
        self.curr_sec_frm.active = [];
        self.curr_sec_frm.lock   = [];


        self.zoom_mode = false ;
        self.flag_list.flag_refresh = false ;
        self.first_collapsed = false ;

        self.gridInitFlag = {
            lockTree : false,
            grd_active_sum : false
        };

        //db combobox
        self.dbCombo = Ext.create('Exem.wasDBComboBox',{
            selectType : common.Util.TR('DB'),
            x         : 370,
            y         : 5  ,
            itemId    : 'dbCombo',
            width     : 350,
            comboWidth : 220,
            comboLabelWidth: 15,
            multiSelect: false,
            addSelectAllItem: false,
            //store     : common.DataModule.getDbStore(afterLoadDbComboStore, self, true),
            listeners :{
                afterrender: function(){
                    this.WASDBCombobox.addListener('select', function(){
                        self.get_stat_name(this.getValue());
                    });
                }
            }
        }) ;


        //    //stat change name 미리 가져와서 더블클릭시 넘겨주기~~
        //    //그러면서 폼도 같이 생성.
        self.conditionArea.add(self.dbCombo) ;
        self.dbCombo.init();
        self.get_stat_name(self.dbCombo.getValue());

        //time label
        self.lbl_time = Ext.create('Ext.form.Label',{
            itemId: 'lbl_time',
            type  : 'date',
            text  : self.LABEL_FORMAT,
            x     : 760,
            y     : 5,
            style : {
                fontSize: '16px'
            }
        }) ;
        self.conditionArea.add(self.lbl_time) ;



        self.btnArea = Ext.create('Exem.Container', {
            layout: 'hbox',
            width : 130,
            height: 20,
            x     : 600,
            y     : 5
        });
        self.conditionArea.add(self.btnArea);


        self.btn_move  = self.set_btn( 'btn_move' ,  'moveTimeOFF'   , 31 ) ;
        self.btn_first = self.set_btn( 'btn_first',  'firstLeftOFF'  , 21 ) ;
        self.btn_prev  = self.set_btn( 'btn_prev' ,  'leftMoveOFF'   , 21 ) ;
        self.btn_next  = self.set_btn( 'btn_next' ,  'rightMoveOFF'  , 21 ) ;
        self.btn_last  = self.set_btn( 'btn_last' ,  'firstRightOFF' , 21 ) ;


        //************ setting pnl ************************************************************
        self.setWorkAreaLayout('border') ;

        //*************************************************************************************
        //************ Tab setting ************************************************************
        //*************************************************************************************


        var top_main_pnl = Ext.create('Exem.Container',{
            region : 'north',
            layout: 'vbox',
            split  : true ,
            height : '15%',
            itemId : 'top_main_pnl',
            style  : 'borderRadius : 6px;'
        });

        var tab_top_pnl = Ext.create('Exem.TabPanel', {
            width : '100%',
            flex  : 1 ,
            layout : 'fit',
            itemId : 'tab_top_pnl',
            activeTab: 0
        }) ;

        //zoom in
        self.chart_brushFrame = Ext.create('Exem.Panel', {
            layout : 'fit',
            height: 20,
            width: '100%',
            border: 1,
            itemId: 'chart_brushFrame',
            listeners: {
                changetimerange: function(from, to) {

                    if (!self.chart_cpu){
                        return;
                    }

                    if(self.brush.fromTime == from && self.brush.toTime == to){
                        self.chart_cpu.setZoomStatus(false);
                    }

                    self.chart_cpu.dependentChartZoomIn( from, to ) ;
                }
            }
        });

        self.brush = Ext.create('Exem.TimeBrush', {
            target: self.chart_brushFrame,
            marginLeft: 75,
            marginRight: 190
        });
        self.workArea.add( top_main_pnl ) ;
        top_main_pnl.add( tab_top_pnl ) ;
        top_main_pnl.add( self.chart_brushFrame ) ;

        var tab_mid_pnl = Ext.create('Exem.TabPanel', {
            region : 'center',
            layout : 'vbox',
            height : '40%',
//            split  : true ,
            itemId : 'tab_mid_pnl',
            minHeight: 300,
            activeTab: 0 ,
            style  : 'borderRadius : 6px;'
        }) ;

        self.tab_top_pnl = tab_top_pnl ;
        self.tab_mid_pnl = tab_mid_pnl ;

        self.workArea.add( self.tab_mid_pnl ) ;

        /**
        //기본값 없을때에만 insert.
        //if ( Comm.web_env_info[self.IDXDB_DB_STAT] == undefined ){
        //    common.WebEnv.insert_config( self.IDXDB_DB_STAT , JSON.stringify(self.default_db_stat ), null ) ;
        //    common.WebEnv.insert_config( self.IDXDB_DB_WAIT , JSON.stringify(self.default_db_wait ), null ) ;
        //    common.WebEnv.insert_config( self.IDXDB_DB_RATIO, JSON.stringify(self.default_db_ratio), null ) ;
        //} ;
        //common.WebEnv.get_all_data() ;
         **/


        //*************************************************************************************
        //************ top pnl setting ********************************************************
        //*************************************************************************************
        self.chart_cpu    = self.set_pnl_chart( self.tab_top_pnl, 'CPU'           , 'pnl_cpu'       , 'chart_cpu'    ) ;
        self.chart_active = self.set_pnl_chart( self.tab_top_pnl, 'Active'        , 'pnl_top_active', 'chart_active' ) ;
        self.chart_lreads = self.set_pnl_chart( self.tab_top_pnl, 'Logical Reads' , 'pnl_lreads'    , 'chart_lreads' ) ;
        self.chart_preads = self.set_pnl_chart( self.tab_top_pnl, 'Physical Reads', 'pnl_preads'    , 'chart_preads' ) ;
        self.chart_exec   = self.set_pnl_chart( self.tab_top_pnl, 'Execution'     , 'pnl_exec'      , 'chart_exec'   ) ;
        self.chart_locked = self.set_pnl_chart( self.tab_top_pnl, 'Locked'        , 'pnl_locked'    , 'chart_locked' ) ;
        self.chart_redo   = self.set_pnl_chart( self.tab_top_pnl, 'Redo entries'  , 'pnl_redo'      , 'chart_redo'   ) ;
        self.arr_chart = [self.chart_active, self.chart_lreads, self.chart_preads, self.chart_exec, self.chart_redo];
        self.arr_chart_pnl = [ self.tab_top_pnl.getComponent('pnl_top_active')
            ,self.tab_top_pnl.getComponent('pnl_lreads')
            ,self.tab_top_pnl.getComponent('pnl_preads')
            ,self.tab_top_pnl.getComponent('pnl_exec')
            ,self.tab_top_pnl.getComponent('pnl_redo')
        ] ;

        //************ middle pnl setting *****************************************************
        self.pnl_stat     = self.set_pnl(self.tab_mid_pnl, common.Util.CTR('Stat'      )   , 'pnl_stat'       ) ;
        self.pnl_wait     = self.set_pnl(self.tab_mid_pnl, common.Util.CTR('Wait'      )   , 'pnl_wait'       ) ;
        self.pnl_val      = self.set_pnl(self.tab_mid_pnl, common.Util.CTR('Value'     )   , 'pnl_val'        ) ;
        /**
        //self.pnl_ratio    = self.set_pnl(self.tab_mid_pnl, common.Util.CTR('Ratio'     )   , 'pnl_ratio'      ) ;
         **/
        self.pnl_osstat   = self.set_pnl(self.tab_mid_pnl, common.Util.CTR('OS Stat'   )   , 'pnl_osstat'     ) ;
        self.pnl_locktree = self.set_pnl(self.tab_mid_pnl, common.Util.CTR('Lock Tree' )   , 'pnl_locktree'   ) ;
        self.pnl_lockinfo = self.set_pnl(self.tab_mid_pnl, common.Util.CTR('Lock Info' )   , 'pnl_lockinfo'   ) ;

        //************ stat setting ******************
        var stat_chart1 = self.set_chart( self.pnl_stat, 'stat_chart1', 0 ) ,
            stat_chart2 = self.set_chart( self.pnl_stat, 'stat_chart2', 1 ) ,
            stat_chart3 = self.set_chart( self.pnl_stat, 'stat_chart3', 2 ) ,
            stat_chart4 = self.set_chart( self.pnl_stat, 'stat_chart4', 3 ) ;
        self.arr_stat_chart = [stat_chart1, stat_chart2, stat_chart3, stat_chart4];
        self.pnl_stat.add(self.arr_stat_chart);



        //************ wait setting ******************
        var wait_chart1 = self.set_chart( self.pnl_wait, 'wait_chart1', 0 ) ,
            wait_chart2 = self.set_chart( self.pnl_wait, 'wait_chart2', 1 ) ,
            wait_chart3 = self.set_chart( self.pnl_wait, 'wait_chart3', 2 ) ,
            wait_chart4 = self.set_chart( self.pnl_wait, 'wait_chart4', 3 ) ;
        self.arr_wait_chart = [wait_chart1, wait_chart2, wait_chart3, wait_chart4];
        self.pnl_wait.add(self.arr_wait_chart);


        //************ value setting ******************
        var pnl_val1 = Ext.create('Exem.Panel', {
            layout : 'fit',
            region : 'west',
            width  : '50%',
            itemId: 'pnl_val1',
            split  : true
        }) ;
        var pnl_val2 = Ext.create('Exem.Panel', {
            layout : 'fit',
            region : 'center',
            itemId: 'pnl_val2',
            width  : '50%'
        });
        self.pnl_val.add(pnl_val1) ;
        self.pnl_val.add(pnl_val2) ;
        self.grd_val1 = Ext.create('Exem.BaseGrid', {
            itemId: 'grd_val1'
        }) ;
        self.grd_val2 = Ext.create('Exem.BaseGrid', {
            itemId: 'grd_val2'
        }) ;
        pnl_val1.add(self.grd_val1) ;
        pnl_val2.add(self.grd_val2) ;
        self.grd_val1.beginAddColumns() ;
        self.grd_val1.addColumn( common.Util.TR('Stat Name'       ), 'Stat_name'       , 200, Grid.String, true, false ) ;
        self.grd_val1.addColumn( common.Util.CTR('Value'           ), 'value'           , 100, Grid.Number, true, false ) ;
        self.grd_val1.addColumn( common.Util.TR('Max Value'       ), 'max_value'       , 200, Grid.Number, true, false ) ;

        self.grd_val2.addColumn( common.Util.TR('Event Name'      ), 'event_name'      , 200, Grid.String, true, false ) ;
        self.grd_val2.addColumn( common.Util.TR('Wait Time'       ), 'wait_time'       , 100, Grid.Number, true, false ) ;
        self.grd_val2.addColumn( common.Util.TR('Wait TimeOut'    ), 'wait_timeout'    , 100, Grid.Number, true, false ) ;
        self.grd_val2.addColumn( common.Util.TR('Wait Count'      ), 'wait_count'      , 100, Grid.Number, true, false ) ;
        self.grd_val2.addColumn( common.Util.TR('Max Wait Time'   ), 'max_wait_time'   , 100, Grid.Number, true, false ) ;
        self.grd_val2.addColumn( common.Util.TR('Max Wait TimeOut'), 'max_wait_timeout', 100, Grid.Number, true, false ) ;
        self.grd_val2.addColumn( common.Util.TR('Max Wait Count'  ), 'max_wait_count'  , 100, Grid.Number, true, false ) ;
        self.grd_val1.endAddColumns() ;


        //************ Ratio setting **********************
        /**
        //var ratio_chart1 = self.set_chart( self.pnl_ratio, 'ratio_chart1', 0 ) ,
        //    ratio_chart2 = self.set_chart( self.pnl_ratio, 'ratio_chart2', 1 ) ,
        //    ratio_chart3 = self.set_chart( self.pnl_ratio, 'ratio_chart3', 2 ) ,
        //    ratio_chart4 = self.set_chart( self.pnl_ratio, 'ratio_chart4', 3 ) ;
        //self.arr_ratio_chart = [ratio_chart1, ratio_chart2, ratio_chart3, ratio_chart4];
        //self.pnl_ratio.add(self.arr_ratio_chart);
         **/


        //************ OS Stat setting *********************
            //'OS CPU (%)'
        var os_chart1 = self.set_chart( self.pnl_osstat, 'os_chart1', 0 ) ,
            //'OS Free Memory (MG)'
            os_chart2 = self.set_chart( self.pnl_osstat, 'os_chart2', 1 ) ;
        self.arr_os_chart = [os_chart1, os_chart2] ;
        self.arr_os_chart[0].setTitle( 'OS CPU (%)' ) ;
        self.arr_os_chart[1].setTitle( 'OS Free Memory (MB)' ) ;
        self.pnl_osstat.add(self.arr_os_chart);

        self.title_update( self.arr_stat_chart , Comm.web_env_info[ self.IDXDB_DB_STAT ] ) ;
        self.title_update( self.arr_wait_chart , Comm.web_env_info[ self.IDXDB_DB_WAIT ] ) ;
        self.title_update( self.arr_ratio_chart, Comm.web_env_info[ self.IDXDB_DB_RATIO ]   ) ;

        self.workArea.loadingMask.showMask();

        setTimeout( function(){


            //************ Lock Tree setting *******************

            self.grd_locktree = Ext.create('Exem.BaseGrid', {
                itemId: 'grd_locktree',
                gridType: Grid.exTree
            });

            self.pnl_locktree.add( self.grd_locktree ) ;

            //************ setting sec frame **************************************************
            self.sec_60_frm('lock') ;

            self.grd_locktree.addEventListener('cellcontextmenu', function(me, td, cellIndex, record){
                self.grd_locktree.contextMenu.setDisableItem( 0, false );
                var data_rows = record.data ;
                //sqltext column이고 sql_id가 널이아닌경우
                if ( ( cellIndex == 9 ) && ( data_rows['sql_id'] !== '' ) )
                    self.grd_locktree.contextMenu.setDisableItem( 0, true );
            } , self ) ;

            //sql_text
            self.grd_locktree.contextMenu.addItem({
                title : common.Util.TR('Full SQL Text'),
                itemId: 'sql_text',
                fn: function() {
                    var record = self.grd_locktree.pnlExTree.getSelectionModel().getSelection()[0].data ;
                    var sql_id = record['sql_id'] ;
                    if ( sql_id == '' )
                        return;

                    var dbId     = self.dbCombo.getValue() ;
                    var fromTime = common.Util.getDate(self.datePicker.getFromDateTime());
                    var toTime   = common.Util.getDate(self.datePicker.getToDateTime());
                    self.open_sql_text( sql_id, dbId, fromTime, toTime) ;
                }
            }, 0);

            //************ Lock Info Tree setting *****************
            self.grd_lock_info = Ext.create('Exem.BaseGrid',{
                itemId: 'grd_lock_info',
                itemclick: function(dv, record) {

                    self.lock_info_click(record.data);

                }
            });
            self.pnl_lockinfo.add( self.grd_lock_info ) ;
            self.grd_lock_info.beginAddColumns() ;
            self.grd_lock_info.addColumn( common.Util.TR('From Time'  ), 'from_time'  , 200, Grid.DateTime, true, false ) ;
            self.grd_lock_info.addColumn( common.Util.TR('To Time'    ), 'to_time'    , 200, Grid.DateTime, true, false ) ;
            self.grd_lock_info.addColumn( common.Util.TR('Hold SID'   ), 'hold_sid'   , 200, Grid.String  , true, false ) ;
            self.grd_lock_info.addColumn( common.Util.TR('Waiting SID'), 'wait_sid'   , 200, Grid.String  , true, false ) ;
            self.grd_lock_info.addColumn( common.Util.TR('Lock Type'  ), 'lock_type'  , 300, Grid.String  , true, false ) ;
            self.grd_lock_info.addColumn( common.Util.TR('Hold Mode'  ), 'req_mode'   , 200, Grid.String  , true, false ) ;
            self.grd_lock_info.addColumn( common.Util.TR('Data Count' ), 'wait_count' , 100, Grid.Number  , true, false ) ;
            self.grd_lock_info.endAddColumns() ;


            //*************************************************************************************
            //************ bottom pnl setting *****************************************************
            //*************************************************************************************
            var tab_bot_pnl = Ext.create('Exem.TabPanel', {
                layout: 'vbox',
                region: 'south',
                height: '35%',
                split : true ,
                itemId: 'tab_bot_pnl',
                collapsible: true,
                collapsed  : false ,   //처음부터_접을꺼냐.
                collapseMode:'header',
                minHeight: 200,
                activeTab: 0,
                style  : 'borderRadius : 6px;',
                listeners: {
                    /**
                    afterrender: function(){
                        //self.tab_bot_pnl.collapsed = true ;

                    },
                     **/
                    collapse: function() {
                        console.debug('collapse!!!!!');
                        self.activeTabCollapse();
                    },
                    expand: function() {
                        self.activeTabExpand();
                        /**
                        //self.tab_bot_pnl.collapsed = false ;
                        //if ( !self.flag_list.flag_refresh ) { return; }
                        //한번 펼쳤다 접고 다시 펼칠때 같은 시각데이터라면 다시 뿌리지 않게하기위함.
                        //if ( self.click_time == self.last_save_time ) { return; }

                        //setTimeout(function(){
                        //    self.get_active_sec( self.click_time ) ;
                        //}, 1000) ;
                         **/
                    }
                }
            }) ;

            self.tab_bot_pnl = tab_bot_pnl ;
            self.workArea.add( self.tab_bot_pnl ) ;

            self.grd_active     = self.set_pnl_grid(common.Util.TR('Active Session'      ), 'pnl_active'    , 'grd_active'    ) ;
            self.grd_active_sum = self.set_pnl_grid(common.Util.TR('Active Session (SUM)'), 'pnl_active_sum', 'grd_active_sum') ;

            //active session
            self.addActiveColumns();

            if(self.tab_bot_pnl.getHeader()){
                self.tab_bot_pnl.getHeader().setVisible(false);
            }

            self.tab_bot_pnl.setActiveTab( 0 ) ;

            //************ setting sec frame **************************************************
            self.sec_60_frm( 'active' ) ;


            // Exclude Background 체크박스
            self.exclude_chk = Ext.create('Ext.form.field.Checkbox',{
                boxLabel  : common.Util.TR('Exclude Background'),
                checked   : false,
                margin    : '0 5 0 0',
                listeners : {
                    change: function() {
                        self.exclude_change( this.getValue() ) ;
                    }
                }
            });
            // tab header 와  체크 박스 사이의 공백
            self.tab_bot_pnl.getTabBar().add({xtype: 'tbspacer', flex: 1});
            self.tab_bot_pnl.getTabBar().add(self.exclude_chk);



            self.grd_active.addEventListener('cellcontextmenu', function(me, td, cellIndex, record){
                self.grd_active.contextMenu.setDisableItem( 1, false );
                self.grd_active.contextMenu.setDisableItem( 2, false );
                var data_rows = record.data ;
                //sqltext column이고 sql_id가 널이아닌경우
                if ( ( cellIndex == 12 ) && ( data_rows['sql_id'] !== '' ) ){
                    self.grd_active.contextMenu.setDisableItem( 2, true );
                }
                if ( data_rows['txn_name'] !== '' ) {
                    self.grd_active.contextMenu.setDisableItem( 1, true );
                }
            } , self ) ;

            self.grd_active.addEventListener('celldblclick', function( thisGrid, td, cellIndex, record) {
                if ( cellIndex == 12 ) {
                    var dbId     = self.dbCombo.getValue() ;
                    var fromTime = common.Util.getDate(self.datePicker.getFromDateTime());
                    var toTime   = common.Util.getDate(self.datePicker.getToDateTime());

                    self.open_sql_text( record.data['sql_id'], dbId, fromTime, toTime ) ;
                }
                else {
                    var from_time =  Ext.util.Format.date(record.data['time'], Comm.dateFormat.HM),
                        to_time   =  Ext.util.Format.date(common.Util.getDate(+new Date(record.data['time']) + 3600000 ), Comm.dateFormat.HM),
                        txn_name  = '%' + common.Util.cutOffTxnExtName( record.data['txn_name'] ),
                        was_id    = record.data['was_id'];

                    if ( txn_name == '' || !was_id ){
                        return;
                    }

                    var txn_history_form = common.OpenView.open('TxnHistory', {
                        isWindow : false,
                        width    : 1200,
                        height   : 800,
                        fromTime : from_time,
                        toTime   : to_time,
                        wasId    : was_id,
                        transactionTF: txn_name
                    });

                    setTimeout(function(){
                        txn_history_form.retrieve();
                    }, 300);
                }
            }) ;

            //session detail
            self.grd_active.contextMenu.addItem({
                title : common.Util.TR('Session Detail'),
                itemId: 'sess_detail',
                fn: function() {
                    var record = this.up().record;
                    var from_time = Ext.util.Format.date(record['time'], Comm.dateFormat.HM),
                        to_time   = Ext.util.Format.date(common.Util.getDate(+new Date(record['time']) + 3600000 ), Comm.dateFormat.HM) ;
                    self.sess_detail_var = [] ;
                    self.sess_detail_var.push( self.dbCombo.getValue() ) ;
                    self.sess_detail_var.push( from_time );
                    self.sess_detail_var.push( to_time );
                    self.sess_detail_var.push( common.Util.getDate(record['logon_time']) );
                    self.sess_detail_var.push( record['sid'] );
                    self.sess_detail_var.push( record['serial'] );
                    self.sess_detail_var.push( self.dbCombo.items.items[0].rawValue );
                    self.time_slice( from_time, to_time, 'sess_detail' ) ;
                }
            }, 0);

            //txn history
            self.grd_active.contextMenu.addItem({
                title : common.Util.TR('Transaction Summary'),
                itemId: 'txn_history',
                fn: function() {
                    var record = this.up().record,
                        from_time = Ext.util.Format.date(record['time'], Comm.dateFormat.HM),
                        to_time   = Ext.util.Format.date(common.Util.getDate(+new Date(record['time']) + 3600000 ), Comm.dateFormat.HM),
                        txn_name  = '%' + common.Util.cutOffTxnExtName( record['txn_name'] ),
                        was_id    = record['was_id'];

                    if ( txn_name == '' || !was_id){
                        return ;
                    }

                    var txn_history_form = common.OpenView.open('TxnHistory', {
                        isWindow : false,
                        width    : 1200,
                        height   : 800,
                        fromTime : from_time,
                        toTime   : to_time,
                        wasId    : was_id,
                        transactionTF: txn_name
                    });

                    setTimeout(function(){
                        txn_history_form.retrieve();
                    }, 300);
                }
            }, 1);

            //sql_text
            self.grd_active.contextMenu.addItem({
                title : common.Util.TR('Full SQL Text'),
                itemId: 'sql_text',
                fn: function() {
                    var record = this.up().record;
                    var sql_id = record['sql_id'] ;

                    if ( sql_id == '' ) {
                        return;
                    }
                    var dbId     = self.dbCombo.getValue() ;
                    var fromTime = common.Util.getDate(self.datePicker.getFromDateTime());
                    var toTime   = common.Util.getDate(self.datePicker.getToDateTime());

                    self.open_sql_text( sql_id, dbId, fromTime, toTime) ;
                }
            }, 2);

            /**
             //process
             self.grd_process.beginAddColumns() ;
             self.grd_process.addColumn( common.Util.TR('Time'              ), 'time'     , 130, Grid.DateTime, true, false) ;
             self.grd_process.addColumn( common.Util.TR('User Name'         ), 'user_name', 100, Grid.String  , true, false) ;
             self.grd_process.addColumn( common.Util.TR('PID'               ), 'pid'      , 100, Grid.StringNumber  , true, false) ;
             self.grd_process.addColumn( common.Util.TR('CPU'               ), 'cpu'      , 100, Grid.Number  , true, false) ;
             self.grd_process.addColumn( common.Util.TR('Virtual Memory (MB)'), 'vsz'      , 100, Grid.Number  , true, false) ;
             self.grd_process.addColumn( common.Util.TR('Real Memory (MB)'   ), 'rss'      , 100, Grid.Number  , true, false) ;
             self.grd_process.addColumn( common.Util.TR('Argument'          ), 'args'     , 500, Grid.String  , true, false) ;
             self.grd_process.endAddColumns() ;
             */

            self.init_flag_set() ;


            if(self.conditionRetrieveArea.items.items[0]){
                self.conditionRetrieveArea.items.items[0].setDisabled( false ) ;
            }

            self.workArea.loadingMask.hide();

        }, 10 );

        self.chart_cpu.timeBrush = self.brush;


        self.tab_top_pnl.setActiveTab( 0 ) ;
        self.tab_mid_pnl.setActiveTab( 0 ) ;

    } ,//end-init

    activeTabCollapse: function(){
        var self = this;

        if(!self.first_collapsed){
            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].style.paddingLeft = '47%';
            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].style.cursor = 'pointer' ;

            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].addEventListener('mouseover', function(){
                self.workArea.el.dom.getElementsByClassName('x-title-text')[1].style.color = '#379df0' ;
            }) ;
            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].addEventListener('mouseleave', function(){
                self.workArea.el.dom.getElementsByClassName('x-title-text')[1].style.color = 'black' ;
            }) ;
            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].onclick = function(){
                self.tab_bot_pnl.expand();
            } ;

            self.first_collapsed = true;
        }

        self.workArea.el.dom.getElementsByClassName('x-title-text')[1].innerHTML = common.Util.TR('Show Active Transaction') ;

        self.last_save_time = self.click_time ;

    },

    activeTabExpand: function(){
        var self = this;

        if ( !self.flag_list.flag_refresh )
            return;

        self.workArea.el.dom.getElementsByClassName('x-title-text')[1].innerHTML = common.Util.TR('Hide Active Transaction') ;

        //한번 펼쳤다 접고 다시 펼칠때 같은 시각데이터라면 다시 뿌리지 않게하기위함.
        if ( self.click_time == self.last_save_time )
            return;

        setTimeout(function(){
            self.get_active_sec( self.click_time ) ;
        }, 1000) ;
    },


    addLockTreeColumns: function(){
        var self = this;

        self.grd_locktree.beginAddColumns();
        self.grd_locktree.addColumn( common.Util.TR('SID'           ), 'hold_sid'    , 100, Grid.String, true , false , 'treecolumn' ) ;
        self.grd_locktree.addColumn( common.Util.TR('SPID'          ), 'spid'        , 100, Grid.StringNumber, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Hold Lock Type'), 'h_lock_type' , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Hold Mode'     ), 'hold_mode'   , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Wait Lock Type'), 'lock_type'   , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Request Mode'  ), 'req_mode'    , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Object ID'     ), 'object_id'   , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Status'        ), 'status'      , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Wait'          ), 'wait'        , 300, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('SQL Text'      ), 'sql_text'    , 500, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Elapse Time'   ), 'elapse_time' , 100, Grid.Float , true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('WAS'           ), 'was_name'    , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Transaction'   ), 'txn_name'    , 300, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Program'       ), 'program'     , 130, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Module'        ), 'MODULE'      , 130, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Action'        ), 'action'      , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Schema'        ), 'SCHEMA'      , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Machine'       ), 'machine'     , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('OS User'       ), 'os_user'     , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Logon Time'    ), 'logon_time'  , 200, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('Serial'        ), 'serial'      , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( common.Util.TR('User Name'     ), 'user_name'   , 100, Grid.String, true , false  ) ;
        self.grd_locktree.addColumn( 'Hold DB' , 'hold_db'     , 100, Grid.String, false, false  ) ;
        self.grd_locktree.addColumn( 'Hold SID', ''            , 100, Grid.StringNumber, false, false  ) ;
        self.grd_locktree.addColumn( 'SQL ID'        , 'sql_id'      , 100, Grid.String, false, true  ) ;
        self.grd_locktree.addColumn( 'Dead Lock'     , ''            , 100, Grid.String, false, true  ) ;
        self.grd_locktree.endAddColumns();
    },

    addActiveColumns: function(){
        var self = this;

        self.grd_active.beginAddColumns() ;
        self.grd_active.addColumn( common.Util.CTR('Time'                  ) , 'time'                  , 140, Grid.DateTime, true , false) ;
        self.grd_active.addColumn( common.Util.CTR('WAS Name'              ) , 'was_name'              , 100, Grid.String  , false, false) ;
        self.grd_active.addColumn( common.Util.CTR('WAS'                   ) , 'was_id'                , 100, Grid.String  , false, true ) ;
        self.grd_active.addColumn( common.Util.CTR('Transaction'           ) , 'txn_name'              , 300, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Schema'                ) , 'SCHEMA'                , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Program'               ) , 'program'               , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Module'                ) , 'MODULE'                , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('SID'                   ) , 'sid'                   , 100, Grid.StringNumber, true , false) ;
        self.grd_active.addColumn( common.Util.CTR('SPID'                  ) , 'spid'                  , 100, Grid.StringNumber  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Serial'                ) , 'serial'                , 100, Grid.StringNumber  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Status'                ) , 'status'                , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Wait'                  ) , 'wait'                  , 500, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('SQL Text'              ) , 'sql_text'              , 500, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Elapse Time'           ) , 'last_call_et'          , 100, Grid.Float   , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('PGA (MB)'              ) , 'pga'                   , 100, Grid.Float   , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Logical Reads'         ) , 'logical_reads'         , 100, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Physical Reads'        ) , 'physical_reads'        , 100, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Block Changes'         ) , 'db_block_change'       , 100, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Executions'            ) , 'executions'            , 100, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Hard Parse Count'      ) , 'parse_count_hard'      , 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Parse Count Total'     ) , 'parse_count_total'     , 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Opened Cursors Current') , 'opened_cursors_current', 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Undo Blocks'           ) , 'Undo Blocks'           , 100, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Undo Records'          ) , 'Undo Records'          , 100, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Undo Seq. ID'          ) , 'Undo Seq_ID'           , 100, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Command Type'          ) , 'command_type'          , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Action'                ) , 'action'                , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Logical Reads (Sigma)'  ) , 'Logical Reads(Sigma)'  , 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Physical Reads (Sigma)' ) , 'Physical Reads(Sigma)' , 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Block Changes (Sigma)'  ) , 'Block Change (Sigma)'  , 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Execute Count (Sigma)'  ) , 'Exection (Sigma)'      , 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Undo Blocks (Sigma)'    ) , 'Undo Blocks (Sigma)'   , 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Undo Record (Sigma)'    ) , 'Undo Records (Sigma)'  , 150, Grid.Number  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Machine'               ) , 'machine'               , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('OS User'               ) , 'os_user'               , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Logon Time'            ) , 'logon_time'            , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Client Info'           ) , 'client_info'           , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( common.Util.CTR('Session Type'          ) , 'session_type'          , 100, Grid.String  , true , false) ;
        self.grd_active.addColumn( 'SQL ID'                 , 'sql_id'                , 100, Grid.String  , false , true) ;
        self.grd_active.endAddColumns() ;
    },

    addActiveSummaryColumns: function(){
        var self = this;

        self.grd_active_sum.beginAddColumns() ;
        self.grd_active_sum.addColumn( 'DB ID'               , 'db_id'            , 100, Grid.String, false, true ) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Schema'              ), 'schema_name'      , 100, Grid.String, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Program'             ), 'program'          , 100, Grid.String, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('User Name'           ), 'user_name'        , 100, Grid.String, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('SID'                 ), 'sid'              , 100, Grid.StringNumber, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Serial'              ), 'serial'           , 100, Grid.StringNumber, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('CPU'                 ), 'max_cpu_usage'    , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Logical Reads'       ), 'lreads'           , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Physical Reads'      ), 'preads'           , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Block Changes'       ), 'block_changes'    , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Executions'          ), 'executions'       , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Hard Parse Count'    ), 'hard_parse_count' , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Parse Count Total'   ), 'total_parse_count', 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Opened Count Current'), 'max_open_cursors' , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Undo Blocks'         ), 'max_undo_blk'     , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Undo Records'        ), 'max_undo_rec'     , 100, Grid.Number, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('PGA (MB)'             ), 'max_pga'          , 100, Grid.Float , true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Elapse Time'         ), 'max_elapse_time'  , 100, Grid.Float , true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Logon Time'          ), 'logon_time'       , 100, Grid.String, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('AUDID'               ), 'audsid'           , 100, Grid.String, false, true) ; //1505.11-컬럼삭제요청-by한승민
        self.grd_active_sum.addColumn( common.Util.CTR('OS User'             ), 'os_user'          , 100, Grid.String, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Machine'             ), 'machine'          , 100, Grid.String, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Terminal'            ), 'terminal'         , 100, Grid.String, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('SPID'                ), 'spid'             , 100, Grid.StringNumber, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('CPID'                ), 'cpid'             , 100, Grid.StringNumber, true , false) ;
        self.grd_active_sum.addColumn( common.Util.CTR('Session Type'        ), 'session_type'     , 100, Grid.String, true , false) ;
        self.grd_active_sum.endAddColumns() ;
    },


    //-----------------------------------------------------------------------------------------------------------
    executeSQL: function(){
        var self = this ;

        if ( self.isLoading )
            return;

        self.zoom_mode = false ;
        self.stat_id_list = [] ;
        self.click_time = self.datePicker.getFromDateTime() ;
        //플래그 변수 초기화.
        self.init_flag_set() ;

        //zoomin 될 차트 add - cpu / arr_stat만 add.
        self.set_zoom_chart() ;

        //active session clear
        self.grd_active.clearRows() ;

        self.loadingMask.showMask();
        self.db_num = self.dbCombo.getValue() ;

        self.chart_cpu.setZoomStatus(false);

        self.get_top_cpu() ;
        self.get_chart_type( self.tab_mid_pnl.getActiveTab().itemId ) ;


        setTimeout(function(){
            if ( !self.tab_bot_pnl.collapsed ){
                self.flag_list.flag_execute = true ;
                self.get_active_sec( self.click_time ) ;
            }
        }, 300) ;

        self.flag_list.flag_refresh = true ;
    },  //end-executeSQL


    //-----------------------------------------------------------------------------------------------------------
    get_chart_type: function( active_tab ){
        var self = this,
            title_list = {
                Stat : [],
                Wait : [],
                Ratio: []
            },
            chart_list = {
                Stat : [],
                Wait : [],
                Ratio: []
            },
            chart_latch_list = { Wait: [] } ,
            chart_obj;

        var ix ;

        switch ( active_tab ){
            case 'pnl_stat':
                chart_obj = self.arr_stat_chart ;
                break ;

            case 'pnl_wait':
                chart_obj = self.arr_wait_chart ;
                break ;

            /**
            //case 'pnl_ratio':
            //    chart_obj = self.arr_ratio_chart ;
            //    break ;
             */
            default : break ;
        }

        _.each(['Stat', 'Wait', 'Ratio'], function(d) {
            find_chart_type( chart_obj , self.all_stat_list[d], d) ;
            call_chart_data(d) ;
        });
        ix = null ;


        function find_chart_type( cht_obj, list_obj, section_str ){
            for ( ix = 0; ix < cht_obj.length; ix++ ){
                var chart_idx = list_obj.indexOf( cht_obj[ix].title ) ;

                if ( chart_idx  > -1 ){
                    if ( cht_obj[ix].title == 'Latch Wait Time (Total)' ) {
                        chart_latch_list[section_str].push( cht_obj[ix] ) ;
                    }
                    else{
                        chart_list[section_str].push( cht_obj[ix] ) ;
                    }
                    title_list[section_str].push( cht_obj[ix].title ) ;
                }
            }
        }

        function call_chart_data( section_str ){
            if ( title_list[ section_str ].length > 0 ){
                self.stat_name_list[ section_str ] = title_list[ section_str ] ;

                switch ( section_str ){
                    case 'Stat':
                        self.get_stat( chart_list[section_str] ) ;
                        break ;

                    case 'Wait':
                        self.get_wait( chart_list[section_str], chart_latch_list[section_str] ) ;
                        break ;

                    case 'Ratio':
                        self.get_ratio( chart_list[section_str] ) ;
                        break ;

                    default :
                        break;
                }
            }
        }


    } ,



    //-----------------------------------------------------------------------------------------------------------
    get_top_cpu: function(){
        var self = this ;

        //cpu chart data add..
        var dt_cpu_chart = {} ;
        dt_cpu_chart.sql_file = self.sql.top_cpu_chart ;
        dt_cpu_chart.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(self.datePicker.getFromDateTime())
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(self.datePicker.getToDateTime())
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }]  ;
        WS.SQLExec( dt_cpu_chart, self.onTOPData, self ) ;
    },


    //-----------------------------------------------------------------------------------------------------------
    get_top_chart: function(){
        var self = this ;

        //top pnl data add..
        var dt_top_chart = {} ;
        dt_top_chart.sql_file = self.sql.top_chart ;
        dt_top_chart.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(self.datePicker.getFromDateTime())
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(self.datePicker.getToDateTime())
        },{
            name : 'fromdate',
            type : SQLBindType.STRING,
            value: common.Util.getDateFormat(self.datePicker.getFromDateTime())
        },{
            name : 'todate',
            type : SQLBindType.STRING,
            value: common.Util.getDateFormat(self.datePicker.getToDateTime())
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }]  ;
        WS.SQLExec( dt_top_chart, self.onTOPData, self ) ;
    } ,



    //-----------------------------------------------------------------------------------------------------------
    get_top_locked: function(){
        var self = this ;

        //lock chart data add..
        var dt_lock_chart = {} ;
        dt_lock_chart.sql_file = self.sql.top_lock_chart ;
        dt_lock_chart.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(self.datePicker.getFromDateTime())
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(self.datePicker.getToDateTime())
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }]  ;
        WS.SQLExec( dt_lock_chart, self.onTOPData, self ) ;
    } ,

    //-----------------------------------------------------------------------------------------------------------
    get_active_sec: function( from_time ){
        var self = this ;

        //sec
        var from,
            to ,
            curr_time ;

        curr_time = new Date( from_time ) ;
        from = self.get_full_time( curr_time , 'FROM' ) ;
        to   = self.get_full_time( curr_time , 'TO' ) ;

        var dt_serfrm = {} ;
        dt_serfrm.sql_file = self.sql.sec_frame ;
        dt_serfrm.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value:  from
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: to
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }] ;
        WS.SQLExec( dt_serfrm, self.onBOTData, self ) ;
    } ,


    //-----------------------------------------------------------------------------------------------------------
    get_lock_sec: function( from_time ){
        var self = this ;

        if ( self.dbCombo.getValue() == undefined )
            return;

        if ( !self.pnl_locktree.isLoading )
            self.pnl_locktree.loadingMask.showMask();
        //sec
        var from,
            to ,
            curr_time ;

        curr_time = new Date( from_time ) ;
        from = self.get_full_time( curr_time , 'FROM' ) ;
        to   = self.get_full_time( curr_time , 'TO' ) ;

        self.tab_mid_pnl.setActiveTab( 4 ) ;

        var dt_serfrm = {} ;
        dt_serfrm.sql_file = self.sql.lock_sec_frame ;
        dt_serfrm.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: from
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: to
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }] ;
        WS.SQLExec( dt_serfrm, self.on_mid_lock_data, self ) ;
    } ,


    //-----------------------------------------------------------------------------------------------------------
    set_sec: function( _sec, _sec_frm ){
        var ix ;
        var pnl ;
        var sec ;
        var frm_pnl ;

        for ( ix = 0 ; ix < _sec_frm.length; ix++ ){
            pnl = _sec_frm[ix] ;
            pnl.getEl().setStyle( 'color', '#dadada' ) ;
        }
        if ( _sec.length > 0 ){
            for ( ix = 0 ; ix < _sec.length; ix++ ){
                sec = _sec[ ix ] ;
                frm_pnl = _sec_frm[ sec ] ;
                if ( frm_pnl == undefined )
                    continue ;
                frm_pnl.getEl().setStyle( 'color', 'black' ) ;
                frm_pnl.getEl().setStyle( 'font-weight', 'normal' ) ;
                frm_pnl.getEl().setStyle( 'cursor', 'pointer' ) ;
                frm_pnl.enable() ;
            }
        }

        ix = null ;
        pnl = null ;
        sec = null ;
        frm_pnl = null ;
    },


    //-----------------------------------------------------------------------------------------------------------
    _set_click_state: function( type ){
        var self = this ;
        var curr_time, just_time ;
        var currentSec;

        curr_time = new Date( self.click_time ) ;

        if ( self.curr_sec[type].length == 0 ) {
            if(type == 'active'){
                self.grd_active.clearRows();
                self.loadingMask.hide();
            }
            else{
                self.grd_locktree.clearNodes() ;
                self.pnl_locktree.loadingMask.hide();
            }

            return ;
        }

        var sec = self.curr_sec[type][0] ;
        if ( sec == undefined )
            return ;

        currentSec = new Date(self.click_time).getSeconds();

        self.curr_sec_frm[type][currentSec].getEl().setStyle( 'color', 'red' ) ;
        self.curr_sec_frm[type][currentSec].getEl().setStyle( 'font-weight', 'bold' ) ;

        if ( currentSec < 10 )
            currentSec = '0'+currentSec ;

        just_time = self._get_time_hour(curr_time, '') ;
        self.click_time = just_time +':'+ currentSec ;
        self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

        if ( type == 'active' )
            self.get_active_data( self.click_time );
        else
            self.get_lock_data( self.click_time ) ;
    } ,



    //-----------------------------------------------------------------------------------------------------------
    top_tab_change: function(active_pnl){
        var self = this ;

        if ( active_pnl == null )
            return ;
        if ( !self.flag_list.flag_refresh )
            return;

        switch ( active_pnl.itemId ){
            case 'pnl_cpu':
                if ( self.flag_list.flag_cpu ){
                    self.chart_cpu.plotReSize() ;
                    return ;
                }

                self.chart_cpu.plotDraw() ;
                break ;
            case 'pnl_top_active':
            case 'pnl_lreads':
            case 'pnl_preads':
            case 'pnl_exec':
            case 'pnl_redo':
                if ( ( !self.flag_list.flag_top_active )
                    && ( !self.flag_list.flag_lreads )
                    && ( !self.flag_list.flag_preads )
                    && ( !self.flag_list.flag_exec )
                    && ( !self.flag_list.flag_redo )
                    && ( !self.flag_list.flag_zoom['top_chart'] ) ){
                    active_pnl.loadingMask.showMask();
                    self.flag_list.flag_zoom['top_chart'] = true ;
                    self.get_top_chart() ;
                }else{
                    switch ( active_pnl.itemId ){
                        case'pnl_top_active':

                            if ( !self.flag_list.flag_top_active ) {
                                self.arr_chart[0].plotReSize() ;
                                return ;
                            }

                            self.chart_cpu.addDependentChart( self.arr_chart[0] ) ;
                            self.arr_chart[0].plotDraw() ;
                            self.flag_list.flag_top_active = false ;
                            break ;

                        case 'pnl_lreads':
                            if ( !self.flag_list.flag_lreads ) {
                                self.arr_chart[1].plotReSize() ;
                                return ;
                            }

                            self.chart_cpu.addDependentChart( self.arr_chart[1] ) ;
                            self.arr_chart[1].plotDraw() ;
                            self.flag_list.flag_lreads = false ;
                            break ;

                        case 'pnl_preads':
                            if ( !self.flag_list.flag_preads ) {
                                self.arr_chart[2].plotReSize();
                                return ;
                            }

                            self.chart_cpu.addDependentChart( self.arr_chart[2] ) ;
                            self.arr_chart[2].plotDraw() ;
                            self.flag_list.flag_preads = false ;
                            break ;

                        case 'pnl_exec':
                            if ( !self.flag_list.flag_exec ) {
                                self.arr_chart[3].plotReSize();
                                return ;
                            }


                            self.chart_cpu.addDependentChart( self.arr_chart[3] ) ;
                            self.arr_chart[3].plotDraw() ;
                            self.flag_list.flag_exec = false ;
                            break ;

                        case 'pnl_redo':
                            if ( !self.flag_list.flag_redo ) {
                                self.arr_chart[4].plotReSize() ;
                                return ;
                            }

                            self.chart_cpu.addDependentChart( self.arr_chart[4] ) ;
                            self.arr_chart[4].plotDraw() ;
                            self.flag_list.flag_redo = false ;
                            break ;
                        default :
                            break;
                    }
                }
                break ;
            case 'pnl_locked':
                if ( !self.flag_list.flag_locked ){
                    if ( !self.isLoading )
                        active_pnl.loadingMask.showMask();
                    self.flag_list.flag_zoom['top_locked'] = false ;
                    self.get_top_locked() ;
                }else {
                    if ( self.flag_list.flag_zoom['top_locked'] ) {
                        self.chart_locked.plotReSize() ;
                        return ;
                    }

                    self.chart_cpu.addDependentChart( self.chart_locked ) ;
                    self.chart_locked.plotDraw() ;
                    self.flag_list.flag_zoom['top_locked'] = true ;
                }
                break ;
            default : break ;
        }
        self.move_line( { x: parseInt(new Date(self.click_time).getTime()), y: null } ) ;
        self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;
    } , //end-top_tab_change



    //-----------------------------------------------------------------------------------------------------------
    mid_tab_change: function(active_pnl){
        var self = this ;

        if(!self.gridInitFlag.lockTree && active_pnl == 'pnl_locktree'){
            self.addLockTreeColumns();
            self.gridInitFlag.lockTree = true;
        }

        if ( active_pnl == null )
            return ;

        if ( !self.flag_list.flag_refresh )
            return ;

        var ix ;

        self.move_line( { x: parseInt(new Date(self.click_time).getTime()), y: null } ) ;

        switch ( active_pnl ){
            case 'pnl_stat':
                if ( self.flag_list.flag_stat ){
                    for ( ix = 0 ; ix < self.arr_stat_chart.length; ix++ )
                        self.arr_stat_chart[ix].plotReSize() ;
                }else{
                    self.flag_list.flag_stat = true ;
                }
                break ;

            case 'pnl_wait' :
                if ( self.flag_list.flag_wait ){
                    for ( ix = 0 ; ix < self.arr_wait_chart.length; ix++ )
                        self.arr_wait_chart[ix].plotReSize() ;
                }else{
                    self.get_chart_type( active_pnl ) ;
                    self.flag_list.flag_wait = true ;
                }
                break ;

            case 'pnl_val':
                if ( self.flag_list.flag_val )
                    break ;

                if ( self.flag_list.flag_val )
                    break ;

                self.get_value( self.click_time ) ;
                self.flag_list.flag_val = true ;
                break ;

            /**
            //case 'pnl_ratio':
            //    if ( self.flag_list.flag_ratio ){
            //        for ( ix = 0 ; ix < self.arr_ratio_chart.length; ix++ )
            //            self.arr_ratio_chart[ix].plotReSize() ;
            //
            //    }else{
            //        self.get_chart_type( active_pnl ) ;
            //        self.flag_list.flag_ratio = true ;
            //    }
            //    break ;
             */

            case 'pnl_osstat':
                if ( self.arr_os_chart == null )
                    break ;
                if ( self.pnl_osstat.isLoading )
                    return;
                if ( self.flag_list.flag_osstat ){
                    for ( ix = 0 ; ix < self.arr_os_chart.length; ix++ )
                        self.arr_os_chart[ix].plotReSize() ;
                }else{
                    self.pnl_osstat.loadingMask.showMask() ;
                    var dt_mid_os = {} ;
                    dt_mid_os.sql_file = self.sql.mid_osstat_chart ;
                    dt_mid_os.bind = [{
                        name : 'fromtime',
                        type : SQLBindType.STRING,
                        value: common.Util.getDate(self.datePicker.getFromDateTime())
                    },{
                        name : 'totime',
                        type : SQLBindType.STRING,
                        value: common.Util.getDate(self.datePicker.getToDateTime())
                    },{
                        name : 'db_id',
                        type : SQLBindType.INTEGER,
                        value: self.db_num
                    }] ;
                    WS.SQLExec( dt_mid_os, self.onMIDData, self ) ;
                    self.flag_list.flag_osstat = true ;
                }
                break ;

            case 'pnl_locktree':
                if ( self.flag_list.flag_locktree )
                    break ;
                self.get_lock_sec( self.click_time ) ;
                self.flag_list.flag_locktree = true ;
                break ;

            case 'pnl_lockinfo':
                if ( self.flag_list.flag_lockinfo )
                    break ;
                self.get_lock_info() ;
                self.flag_list.flag_lockinfo = true ;
                break ;
            default:
                break ;
        }

        ix = null ;

    } , //end-mid_tab_change



    //-----------------------------------------------------------------------------------------------------------
    bot_tab_change: function(active_pnl){
        var self = this ;

        if(!self.gridInitFlag.grd_active_sum && active_pnl == 'pnl_active_sum'){
            self.addActiveSummaryColumns();
            self.gridInitFlag.grd_active_sum = true;
        }

        if ( active_pnl == null )
            return;
        if ( self.exclude_chk == undefined )
            return;

        if ( active_pnl !== 'pnl_active' )
            self.exclude_chk.setVisible(false) ;
        else self.exclude_chk.setVisible(true) ;

        if ( !self.flag_list.flag_refresh )
            return ;

        if ( active_pnl == 'pnl_active' && !self.flag_list.flag_active ) {
            if ( !self.flag_list.flag_active ){
                self.get_active_sec( self.click_time ) ;
                self.flag_list.flag_active = true ;
            }
        }else if ( ( active_pnl == 'pnl_process' ) && ( !self.flag_list.flag_process ) ) {
            self.get_os_process() ;
            self.flag_list.flag_process = true ;
        } else if ( (active_pnl == 'pnl_active_sum' ) && ( self.curr_sec['active'].length > 0  &&  !self.flag_list.flag_active_sum ) ){
                self.get_active_sum() ;
                self.flag_list.flag_active_sum = true ;
        }
    }, //end-bot_tab_change



    //-----------------------------------------------------------------------------------------------------------
    onTOPData: function(header, data){
        var self = this ;
        var param = header.parameters ;
        var command = header.command;
        var ix ;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('DBTrend-onTOPData');
            console.debug(header);
            console.debug(data);
            return;
        }

        switch(command){
            case self.sql.top_cpu_chart :
                self.chart_cpu.clearAllSeires() ;
                var arr_cpu = [] ;
                for ( ix = 0; ix < data.rows.length; ix++ ){
                    arr_cpu.push([data.rows[ix][0], data.rows[ix][1]]) ;
                } //end-for

                self.chart_cpu.addValues({
                    from: param.bind[0].value,
                    to  : param.bind[1].value,
                    time: 0,
                    data: arr_cpu,
                    series: {'cht': 1}
                }) ;

                self.chart_cpu.plotDraw() ;
                self.tab_top_pnl.getComponent('pnl_cpu').loadingMask.hide() ;
                self.get_cht_max_val( 'pnl_cpu' ) ;
                self.top_tab_change( self.tab_top_pnl.getComponent('pnl_cpu') ) ;
                self.flag_list.flag_cpu = true ;
                break ;


            case self.sql.top_lock_chart :
                self.chart_locked.clearAllSeires() ;
                var arr_locked = [] ;
                for ( ix = 0 ; ix < data.rows.length; ix++){
                    arr_locked.push([data.rows[ix][0], data.rows[ix][1]]) ;
                } //end-for
                self.chart_locked.addValues({
                    from: param.bind[0].value,
                    to  : param.bind[1].value,
                    time: 0,
                    data: arr_locked,
                    series: {'cht': 1}
                }) ;
                self.chart_locked.plotDraw() ;
                self.tab_top_pnl.getComponent('pnl_locked').loadingMask.hide() ;
                self.flag_list.flag_locked = true ;
                self.top_tab_change( self.tab_top_pnl.getComponent('pnl_locked') ) ;

                break ;


            case self.sql.top_chart :
                var arr_store = [];

                for(ix=0; ix<5; ix++){
                    self.arr_chart[ix].clearAllSeires() ;
                    arr_store.push([]);
                }

                for ( ix in data.rows ){
                    if(data.rows.hasOwnProperty(ix)){
                        switch ( data.rows[ix][1] ){
                            case 'active sessions':
                                arr_store[0].push([ data.rows[ix][0], data.rows[ix][2] ]) ;
                                break ;

                            case 'session logical reads':
                                arr_store[1].push([ data.rows[ix][0], data.rows[ix][2] ]) ;
                                break ;

                            case 'physical reads':
                                arr_store[2].push([ data.rows[ix][0], data.rows[ix][2] ]) ;
                                break ;

                            case 'execute count':
                                arr_store[3].push([ data.rows[ix][0], data.rows[ix][2] ]) ;
                                break ;

                            case 'redo entries':
                                arr_store[4].push([ data.rows[ix][0], data.rows[ix][2] ]) ;
                                break ;

                            default:
                                break ;
                        } //end-switch
                    } //end-if
                }   // end-for

                for ( ix in self.arr_chart ) {
                    if(self.arr_chart.hasOwnProperty(ix)){
                        self.arr_chart[ix].addValues({
                            from: param.bind[0].value,
                            to  : param.bind[1].value,
//                        interval: 60000 ,
                            time: 0,
                            data: arr_store[ix],
                            series: {'cht': 1}
                        });
                        self.arr_chart[ix].plotDraw() ;
                        self.arr_chart_pnl[ix].loadingMask.hide() ;
                    }
                }

                /**
                switch ( self.tab_top_pnl.getActiveTab().itemId ){
                 case 'pnl_top_active': self.flag_list.flag_top_active = true ; break ;
                 case 'pnl_lreads'    : self.flag_list.flag_lreads     = true ; break ;
                 case 'pnl_preads'    : self.flag_list.flag_preads     = true ; break ;
                 case 'pnl_exec'      : self.flag_list.flag_exec       = true ; break ;
                 case 'pnl_locked'    : self.flag_list.flag_locked     = true ; break ;
                 case 'pnl_redo'      : self.flag_list.flag_redo       = true ; break ;
                 } ;*/
                self.flag_list.flag_top_active = true ;
                self.flag_list.flag_preads = true ;
                self.flag_list.flag_lreads = true ;
                self.flag_list.flag_exec   = true ;
                self.flag_list.flag_redo   = true ;

                self.top_tab_change( self.tab_top_pnl.getActiveTab() ) ;
                break ;
            default :
                break ;
        } //end-switch

        ix = null ;
    },//end-onTOPData



    //-----------------------------------------------------------------------------------------------------------
    on_mid_value_data: function(header, data){
        var self = this;
        var command = header.command;
        var ix ;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            if(command == self.sql.mid_val_wait_grd){
                self.pnl_val.loadingMask.hide();
            }

            console.debug('DBTrend-on_mid_value_data');
            console.debug(header);
            console.debug(data);
            return;
        }

        switch ( command ){
            case self.sql.mid_val_stat_grd:
                self.grd_val1.clearRows() ;
                for (ix=0; ix<data.rows.length; ix++) {
                    self.grd_val1.addRow([data.rows[ix][1]
                        ,data.rows[ix][2]
                        ,data.rows[ix][3]
                    ]) ;
                }
                self.grd_val1.drawGrid() ;
                break ;


            case self.sql.mid_val_wait_grd:
                self.grd_val2.clearRows() ;
                for (ix=0; ix<data.rows.length; ix++) {
                    self.grd_val2.addRow([data.rows[ix][1]
                        ,data.rows[ix][2]
                        ,data.rows[ix][3]
                        ,data.rows[ix][4]
                        ,data.rows[ix][5]
                        ,data.rows[ix][6]
                        ,data.rows[ix][7]
                    ]) ;
                }
                self.grd_val2.drawGrid() ;
                self.pnl_val.loadingMask.hide() ;
                break ;
            default :
                break;
        }

        self = null ;
        ix = null ;
    },

    //-----------------------------------------------------------------------------------------------------------
    on_mid_lock_data: function(header, data){
        var self = this;
        var command = header.command;
        var ix ;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            if(command == self.sql.mid_lock_tree || command == self.sql.mid_lock_tree_list){
                self.flag_list.flag_locktreelist = true ;
                self.pnl_locktree.loadingMask.hide() ;
            }
            else if(command == self.mid_lock_info){
                self.pnl_lockinfo.loadingMask.hide() ;
            }

            console.debug('DBTrend-on_mid_lock_data');
            console.debug(header);
            console.debug(data);
            return;
        }

        switch( command ){
            case self.sql.lock_sec_frame:

                self.curr_sec['lock'].length = 0 ;
                for ( ix = 0 ; ix < data.rows.length; ix++ )
                    self.curr_sec['lock'].push( data.rows[ix][0] ) ;
                self.set_sec( self.curr_sec['lock'], self.curr_sec_frm['lock'] ) ;

                self._set_click_state( 'lock' ) ;
                break ;


            case self.sql.mid_lock_tree:
                self.grd_locktree.clearNodes() ;
                self.grd_locktree.beginTreeUpdate();
                var sid = 0 ;
                for ( ix=0; ix<data.rows.length; ix++ ){
                    if ( sid !== data.rows[ix][0] ){
                        sid = data.rows[ix][0] ;
                        self.grd_locktree.addNode(null, [ data.rows[ix][ 0]    //sid
                            ,data.rows[ix][ 1]    //spid
                            ,data.rows[ix][ 2]    //hold-lock-type
                            ,common.DataModule.referenceToDB.lockType[data.rows[ix][ 3]]    //hold-mode
                            ,'--'                 //wait-lock-type
                            ,'--'                 //request-mode
                            ,data.rows[ix][ 4]    //object-id
                            ,data.rows[ix][ 5]    //state
                            ,data.rows[ix][ 6]    //wait
                            ,data.rows[ix][ 7]    //sql-text
                            ,data.rows[ix][ 8]    //elapse-time
                            ,data.rows[ix][20]    //was
                            ,data.rows[ix][22]    //transaction
                            ,data.rows[ix][ 9]    //program
                            ,data.rows[ix][10]    //module
                            ,data.rows[ix][11]    //action
                            ,data.rows[ix][12]    //schema
                            ,data.rows[ix][13]    //machine
                            ,data.rows[ix][14]    //os-user
                            ,data.rows[ix][15]    //logon-time
                            ,data.rows[ix][16]    //serial
                            ,data.rows[ix][17]    //user-name
                        ]) ;
                    }
                } //end-for

                self.grd_locktree.drawTree();
                self.grd_locktree.endTreeUpdate() ;
                if ( data.rows.length == 0 ){
                    self.flag_list.flag_locktreelist = true ;
                    self.pnl_locktree.loadingMask.hide() ;
                    return ;
                }
                var dt_mid_lock_list = {} ;
                dt_mid_lock_list.sql_file = self.sql.mid_lock_tree_list ;
                dt_mid_lock_list.bind = [{
                    name : 'currenttime',
                    type : SQLBindType.STRING,
                    value: self.click_time
                },{
                    name : 'db_id',
                    type : SQLBindType.INTEGER,
                    value: self.db_num
                }] ;
                WS.SQLExec( dt_mid_lock_list, self.on_mid_lock_data, self ) ;
                break ;


            case self.sql.mid_lock_tree_list:
                self.grd_locktree.beginTreeUpdate() ;
                for ( ix=0; ix<data.rows.length; ix++ ){
                    var h_sid = data.rows[ix][21] ;
                    var node = self.grd_locktree.findNode( 'hold_sid', h_sid );
                    //sid를 모르는것으로 판단!
                    if ( (node == null) && (( h_sid !== 0 ) || ( h_sid !== -1 ))){
                            self.grd_locktree.addNode( null, [ data.rows[ix][0] ] ) ;
                    }
                    var w_sid = data.rows[ix][0] ;
                    var child = self.grd_locktree.findNode( 'hold_sid', w_sid ) ;

                    //holder가 없으면 waiter만이라도 add한다(자식노드로 그림)
                    if ( child == null ){
                        if ( ( h_sid == 0 ) || ( h_sid == -1 ) ) {
                            self.grd_locktree.addNode( null, [ data.rows[ix][ 0]  //wait-sid
                                ,data.rows[ix][ 1]  //spid
                                ,'--'               //hold-lock-type
                                ,'--'               //hold-mode
                                ,data.rows[ix][ 4]  //wait-lock-type
                                ,common.DataModule.referenceToDB.lockType[data.rows[ix][ 5]] //request-mode
                                ,data.rows[ix][ 6] //obj-id
                                ,data.rows[ix][ 7] //status
                                ,data.rows[ix][ 8] //wait
                                ,data.rows[ix][ 9] //sql_text
                                ,data.rows[ix][10] //elapse_time
                                ,data.rows[ix][25] //was_name-elapse_time10
                                ,data.rows[ix][27] //txn_name-program11
                                ,data.rows[ix][11] //program
                                ,data.rows[ix][12] //modual
                                ,data.rows[ix][13] //action
                                ,data.rows[ix][14] //schema
                                ,data.rows[ix][15] //machine
                                ,data.rows[ix][16] //os-user
                                ,data.rows[ix][17] //logon-time
                                ,data.rows[ix][18] //serial
                                ,data.rows[ix][19] //user-name
                                ,data.rows[ix][20] //hold_db
                                ,data.rows[ix][21] //hold_sid
                                ,data.rows[ix][22] //sql_id
                                ,'--' //dead-lock
                            ] ) ;
                        }else{ //대부분-여길-타겠지.
                            self.grd_locktree.addNode( node, [   data.rows[ix][ 0]  //wait-sid
                                ,data.rows[ix][ 1]  //spid
                                ,'--'               //hold-lock-type
                                ,'--'               //hold-mode
                                ,data.rows[ix][ 4]  //wait-lock-type
                                ,common.DataModule.referenceToDB.lockType[data.rows[ix][ 5]] //request-mode
                                ,data.rows[ix][ 6] //obj-id
                                ,data.rows[ix][ 7] //status
                                ,data.rows[ix][ 8] //wait
                                ,data.rows[ix][ 9] //sql_text
                                ,data.rows[ix][10] //elapse_time
                                ,data.rows[ix][25] //was_name
                                ,data.rows[ix][27] //txn_name
                                ,data.rows[ix][11] //program
                                ,data.rows[ix][12] //modual
                                ,data.rows[ix][13] //action
                                ,data.rows[ix][14] //schema
                                ,data.rows[ix][15] //machine
                                ,data.rows[ix][16] //os-user
                                ,data.rows[ix][17] //logon-time
                                ,data.rows[ix][18] //serial
                                ,data.rows[ix][19] //user-name
                                ,data.rows[ix][20] //hold_db
                                ,data.rows[ix][21] //hold_sid
                                ,data.rows[ix][22] //sql_id
                                ,'--' //dead-lock
                            ] ) ;
                        }
                    }else{
                        //holding된게 있으면 부모꺼에서 나의 hold_sid를 찾는다.
                        var dead_lock_node = self.grd_locktree.findNode( 'hold_sid', h_sid, child ) ;
                        if ( dead_lock_node == null ) {
                            self.grd_locktree.moveNode( child, node ) ;
                        }else{


                            self.grd_locktree.addNode( node,  [   data.rows[ix][ 0]  //wait_sid
                                ,data.rows[ix][ 1]  //spid
                                ,'--'               //hold-lock-type
                                ,'--'               //hold-mode
                                ,data.rows[ix][ 4]  //wait-lock-type
                                ,common.DataModule.referenceToDB.lockType[data.rows[ix][ 5]] //request_mode
                                ,data.rows[ix][ 6] //obj-id
                                ,data.rows[ix][ 7] //status
                                ,data.rows[ix][ 8] //wait
                                ,data.rows[ix][ 9] //sql_text
                                ,data.rows[ix][10] //elapse_time
                                ,data.rows[ix][25] //was_name
                                ,data.rows[ix][27] //txn_name
                                ,data.rows[ix][11] //program
                                ,data.rows[ix][12] //modual
                                ,data.rows[ix][13] //action
                                ,data.rows[ix][14] //schema
                                ,data.rows[ix][15] //machine
                                ,data.rows[ix][16] //os-user
                                ,data.rows[ix][17] //logon-time
                                ,data.rows[ix][18] //serial
                                ,data.rows[ix][19] //user-name
                                ,data.rows[ix][20] //hold_db
                                ,data.rows[ix][21] //hold_sid
                                ,data.rows[ix][22] //sql_id
                                ,'1' //dead-lock
                            ] ) ;
                        }
                    }
                }
                self.flag_list.flag_locktreelist = true ;
                self.grd_locktree.drawTree();
                self.grd_locktree.endTreeUpdate() ;
                self.pnl_locktree.loadingMask.hide() ;
                break ;


            case self.sql.mid_lock_info:
                self.grd_lock_info.clearRows() ;
                sid = 0 ;
                for ( ix=0; ix<data.rows.length; ix++ ){
                    self.grd_lock_info.addRow([ data.rows[ix][0]    //fromtime
                        ,data.rows[ix][1]    //totime
                        ,data.rows[ix][2]    //hold_sid
                        ,data.rows[ix][3]    //wait_sid
                        ,data.rows[ix][4]    //lock_type
                        ,common.DataModule.referenceToDB.lockType[ data.rows[ix][5] ]    //req_mode
                        ,data.rows[ix][6]    //wait_count
                    ]) ;
                } //end-for
                self.grd_lock_info.drawGrid() ;
                self.pnl_lockinfo.loadingMask.hide() ;
                break ;
            default :
                break;
        }
    } ,


    //-----------------------------------------------------------------------------------------------------------
    onMIDData: function(header, data){
        var param = header.parameters ;
        var command = header.command;
        var self = this.self ;
        var ix,jx ;

        if(this.isClosed){
            return;
        }

        if ( this.self.tab_bot_pnl == undefined )
            self = this ;

        if(!common.Util.checkSQLExecValid(header, data)){
            if(command == self.sql.mid_osstat_chart){
                self.pnl_osstat.loadingMask.hide() ;
            }
            else {
                if(this.type == 'Wait'){
                    self.pnl_wait.loadingMask.hide() ;
                }

                self.loadingMask.hide();
            }

            console.debug('DBTrend-onMIDData');
            console.debug(header);
            console.debug(data);
            return;
        }

        if( command == self.sql.mid_osstat_chart ){
            var parameter = null;
            var seriesData = null;
            var dataRow = data.rows;
            var dataIndex = 1;

            for( ix=0; ix < self.arr_os_chart.length; ix++){
                parameter = {};
                seriesData = {};
                self.arr_os_chart[ix].clearAllSeires() ;

                parameter.from = param.bind[0].value;
                parameter.to  = param.bind[1].value;
                parameter.time= 0;
                parameter.data= dataRow;
                for ( jx = 0; jx<self.arr_os_chart[ix].serieseList.length; jx++ ){
                    seriesData[jx] = dataIndex++;
                }
                parameter.series = seriesData;

                self.arr_os_chart[ix].addValues(parameter);
                self.arr_os_chart[ix].plotDraw();
            }

            //zoom
            for ( var i=0; i<self.arr_os_chart.length; i++ ){
                if ( !self.flag_list.flag_zoom['mid_os'] ) {
                    self.chart_cpu.addDependentChart( self.arr_os_chart ) ;
                    self.flag_list.flag_zoom['mid_os'] = true ;

                }else{
                    self.arr_os_chart[i].prevZoomFrom = +new Date( self.zoom_from ) ;
                    self.arr_os_chart[i].prevZoomTo   = +new Date( self.zoom_to ) ;
                    self.arr_os_chart[i].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                }
                self.arr_os_chart[i].plotReSize() ;
            }

            self.pnl_osstat.loadingMask.hide() ;

        }else{
            var arr_store  = {};
            var col_idx;

            if ( this.type == 'Stat' )
                col_idx = 3 ;
            if ( this.type == 'Wait' || this.type == 'Wait_latch' )
                col_idx = 5 ;

            if (!Array.isArray(this.target))
                this.target = [this.target];


            for ( jx = 0 ; jx < this.target.length; jx++ ){
                arr_store[this.target[jx].title] = [] ;

                for ( ix = 0; ix < data.rows.length; ix++ ){
                    if ( this.type == 'Ratio' )
                        arr_store[this.target[jx].title].push( [data.rows[ix][0], data.rows[ix][this.idx]] ) ;
                    //wait_latch는 타이틀 매핑조건이 맞지않으므로 따로 조건문.
                    else if ( (this.type == 'Wait_latch') || ( data.rows[ix][1] == this.target[jx].title ) )
                        arr_store[ this.target[jx].title].push( [data.rows[ix][0], data.rows[ix][col_idx]] ) ;
                }
            }

            for ( ix = 0 ; ix < this.target.length; ix++ ){
                this.target[ix].addValues({
                    from: param.bind[0].value,
                    to  : param.bind[1].value,
                    time: 0,
                    data: arr_store[this.target[ix].title],
                    series: {'mid_cht': 1}
                });

                this.target[ix].loadingMask.hide() ;
            }


            switch ( this.type ){
                case 'Stat':
                    if ( self.flag_list.flag_stat ){
                        for ( ix = 0; ix < this.target.length; ix++ ){
                            this.target[ix].prevZoomFrom = +new Date( self.datePicker.getFromDateTime() ) ;
                            this.target[ix].prevZoomTo   = +new Date( self.datePicker.getToDateTime() ) ;
                            this.target[ix].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                        }
                    }
                    self.flag_list.flag_stat = true ;
                    break ;

                /**
                //case 'Ratio':
                //    var list , idx ;
                //
                //    if ( this.target[0].itemId.indexOf(1) > 0 ){
                //        idx = 0 ;
                //        list = 'mid_ratio1' ;
                //    }else if ( this.target[0].itemId.indexOf(2) > 0 ){
                //        idx = 1 ;
                //        list = 'mid_ratio2' ;
                //    }else if ( this.target[0].itemId.indexOf(3) > 0 ){
                //        idx = 2 ;
                //        list = 'mid_ratio3' ;
                //    }else if ( this.target[0].itemId.indexOf(4) > 0 ){
                //        idx = 3 ;
                //        list = 'mid_ratio4' ;
                //    }
                //
                //    //zoom
                //    self.arr_ratio_chart[idx].loadingMask.hide() ;
                //
                //    if ( !self.flag_list.flag_zoom[list] ) {
                //        self.chart_cpu.addDependentChart( self.arr_ratio_chart[idx] ) ;
                //        self.flag_list.flag_zoom[list] = true ;
                //    }else{
                //        self.arr_ratio_chart[idx].prevZoomFrom = +new Date( self.zoom_from ) ;
                //        self.arr_ratio_chart[idx].prevZoomTo   = +new Date( self.zoom_to ) ;
                //        self.arr_ratio_chart[idx].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                //    }
                //    self.pnl_ratio.loadingMask.hide();
                //    break ;
                 **/

                case 'Wait':
                    for ( ix = 0; ix < this.target.length; ix++ ){
                        if ( !self.flag_list.flag_zoom['mid_wait'] ) {
                            self.chart_cpu.addDependentChart( this.target[ix] ) ;
                            //self.flag_list.flag_zoom['mid_wait'] = true ;
                        }else{
                            this.target[ix].prevZoomFrom = +new Date( self.zoom_from ) ;
                            this.target[ix].prevZoomTo   = +new Date( self.zoom_to ) ;
                            this.target[ix].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                        }
                    }
                    self.flag_list.flag_zoom['mid_wait'] = true ;
                    self.pnl_wait.loadingMask.hide() ;
                    break ;

                case 'Wait_latch':
                    for ( ix = 0; ix < this.target.length; ix++ ){
                        if ( !self.flag_list.flag_zoom['mid_wait_latch'] ) {
                            self.chart_cpu.addDependentChart( this.target[ix] ) ;
                        }else{
                            this.target[ix].prevZoomFrom = +new Date( self.zoom_from ) ;
                            this.target[ix].prevZoomTo   = +new Date( self.zoom_to ) ;
                            this.target[ix].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                        }
                    }
                    self.flag_list.flag_zoom['mid_wait_latch'] = true ;
                    break ;
                default :
                    break;
            }

            if ( self.tab_bot_pnl.collapsed )
                self.loadingMask.hide() ;

            for ( ix = 0 ; ix < this.target.length; ix++ ){
                this.target[ix].plotReSize() ;
            }

            self.loadingMask.hide();
        }

        var active_panel = self.tab_mid_pnl.getActiveTab();
        self.mid_tab_change( active_panel.itemId ) ;

        ix = null ;

    }, // end-onMIDData



    //-----------------------------------------------------------------------------------------------------------
    onBOTData: function(header, data){
        var self = this ;
        var command = header.command;
        var ix ;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            if(command == self.sql.bot_activesession){
                self.loadingMask.hide();
            }

            console.debug('DBTrend-onBOTData');
            console.debug(header);
            console.debug(data);
            return;
        }

        switch(command){

            case self.sql.sec_frame:

                self.curr_sec['active'].length = 0 ;
                for ( ix = 0 ; ix < data.rows.length; ix++ ){
                    self.curr_sec['active'].push( data.rows[ix][0] ) ;
                }

                self.set_sec( self.curr_sec['active'], self.curr_sec_frm['active'] ) ;

                //00번이 있으면 00번은 클릭상태로 두기.
                self._set_click_state( 'active' ) ;
                break ;

            case self.sql.bot_activesession :
                self.grd_active.clearRows() ;

                /**
                var last_sigma_logical  = null,
                    last_sigma_physical = null,
                    last_sigma_exec     = null,
                    last_sigma_block    = null,
                    last_sigma_record   = null ;
                */

                for (ix=0; ix<data.rows.length; ix++) {

                    /**
                    if ( last_sigma_logical == null ){

                     last_sigma_logical   = data.rows[ix][24] ;
                     last_sigma_physical  = data.rows[ix][25] ;
                     last_sigma_block     = data.rows[ix][26] ;
                     last_sigma_exec      = data.rows[ix][27] ;
                     last_sigma_record    = data.rows[ix][28] ;
                     }else{
                     if ( last_sigma_logical > data.rows[ix][24] ){

                     last_sigma_logical   = data.rows[ix][24] ;
                     last_sigma_physical  = data.rows[ix][25] ;
                     last_sigma_block     = data.rows[ix][26] ;
                     last_sigma_exec      = data.rows[ix][27] ;
                     last_sigma_record    = data.rows[ix][28] ;
                     }
                     }*/




                    self.grd_active.addRow([ data.rows[ix][0]
                        ,data.rows[ix][36]  //was_name
                        ,data.rows[ix][35]
                        ,data.rows[ix][38]  //txn_name
                        ,data.rows[ix][ 1]  //schema
                        ,data.rows[ix][ 2]  //program
                        ,data.rows[ix][ 3]  //module
                        ,data.rows[ix][ 4]  //sid
                        ,data.rows[ix][ 5]  //spid
                        ,data.rows[ix][ 6]  //serial
                        ,data.rows[ix][ 7]  //status
                        ,data.rows[ix][ 8]  //wait
                        ,data.rows[ix][ 9]  //sql_text
                        ,data.rows[ix][10]  //elapse_time
                        ,data.rows[ix][11]  //pga
                        ,data.rows[ix][12]
                        ,data.rows[ix][13]
                        ,data.rows[ix][14]
                        ,data.rows[ix][15]  //executions
                        ,data.rows[ix][16]
                        ,data.rows[ix][17]
                        ,data.rows[ix][18]
                        ,data.rows[ix][19]  //Undo-Blocks
                        ,data.rows[ix][20]  //Undo-Records
                        ,data.rows[ix][21]  //seq
                        ,common.DataModule.referenceToDB.OracleCommandType[data.rows[ix][22]]  //command_type
                        ,data.rows[ix][23]  //action
                        ,data.rows[ix][24]  //logical-read(sig)
                        ,data.rows[ix][25]  //physical
                        ,data.rows[ix][26]  //block
                        ,data.rows[ix][27]  //execute
                        ,data.rows[ix][28]
                        ,data.rows[ix][29]
                        ,data.rows[ix][30]
                        ,data.rows[ix][31]
                        ,data.rows[ix][32]  //logon-time
                        ,data.rows[ix][33]  //client
                        ,data.rows[ix][34]  //sess
                        ,data.rows[ix][39]  //sql_id
                    ]) ;
                }
                self.grd_active.drawGrid() ;
                if ( !self.isLoading )
                    self.tab_bot_pnl.getComponent('pnl_active').loadingMask.hide() ;
                self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

                if ( data.rows.length > 0 )
                    self.exclude_change( self.exclude_chk.getValue() ) ;
                self.loadingMask.hide();
                break ;

            case self.sql.bot_process :
                self.grd_process.clearRows() ;
                for (ix=0; ix<data.rows.length; ix++) {
                    self.grd_process.addRow([data.rows[ix][0]
                        ,data.rows[ix][1]
                        ,data.rows[ix][2]
                        ,data.rows[ix][3]
                        ,data.rows[ix][4]
                        ,data.rows[ix][5]
                        ,data.rows[ix][6]
                    ]) ;
                }
                self.grd_process.drawGrid() ;
                self.tab_bot_pnl.getComponent('pnl_process').loadingMask.hide() ;
                break ;

            case self.sql.bot_activesession_sum :
                self.grd_active_sum.clearRows() ;
                for (ix=0; ix<data.rows.length; ix++) {
                    self.grd_active_sum.addRow([data.rows[ix][ 0] //db_id
                        ,data.rows[ix][ 1] //schema
                        ,data.rows[ix][ 2] //program
                        ,data.rows[ix][ 3] //user_name
                        ,data.rows[ix][ 4] //sid
                        ,data.rows[ix][ 5] //serial
                        ,data.rows[ix][ 6] //max_cpu_usage
                        ,data.rows[ix][ 7] //log_re
                        ,data.rows[ix][ 8] //phy_re
                        ,data.rows[ix][ 9] //block_ch
                        ,data.rows[ix][10] //execute
                        ,data.rows[ix][11] //hard_parse_cnt
                        ,data.rows[ix][12] //parse_cnt_total
                        ,data.rows[ix][13] //openend_cnt_curr
                        ,data.rows[ix][14] //undo_blocks
                        ,data.rows[ix][15] //undo_recs
                        ,data.rows[ix][16] //pga
                        ,data.rows[ix][17] //elapse_t
                        ,data.rows[ix][18] //logon_time
                        ,data.rows[ix][19] //audid
                        ,data.rows[ix][20] //os_user
                        ,data.rows[ix][21] //machine
                        ,data.rows[ix][22] //terminal
                        ,data.rows[ix][23] //spid
                        ,data.rows[ix][24] //cpid
                        ,data.rows[ix][25] //session_type
                    ]) ;
                }
                self.grd_active_sum.drawGrid() ;
                self.flag_list.flag_active_sum = true ;
                self.tab_bot_pnl.getComponent('pnl_active_sum').loadingMask.hide() ;
                break ;
            default:
                break ;
        }
        ix = null ;
    },// end-onBOTData



    //-----------------------------------------------------------------------------------------------------------
    get_stat: function( chart ){
        var self = this ;

        if ( self.pnl_stat.isLoading )
            return;


        //stat chart
        WS2.SQLExec({
            sql_file: self.sql.mid_stat_chart,
            bind : [{
                name : 'fromtime',
                type : SQLBindType.STRING,
                value: common.Util.getDate(self.datePicker.getFromDateTime())//+':00'
            },{
                name : 'totime',
                type : SQLBindType.STRING,
                value: common.Util.getDate(self.datePicker.getToDateTime())//+':00'
            },{
                name : 'db_id',
                type : SQLBindType.INTEGER,
                value: self.db_num
            },{
                name: 'fromdate',
                type : SQLBindType.STRING,
                value: common.Util.getDateFormat(self.datePicker.getFromDateTime())
            },{
                name: 'todate',
                type : SQLBindType.STRING,
                value: common.Util.getDateFormat(self.datePicker.getToDateTime())
            }] ,
            replace_string: [{
                name: 'stat_name',
                value:  "'"+self.stat_name_list['Stat'].join("','")+"'"
            }]
        }, self.onMIDData.bind({
            target: chart,
            type  : 'Stat',
            self: self
        }), self );

    }, // end-get_stat



    //-----------------------------------------------------------------------------------------------------------
    get_wait: function( chart, chart_latch ){
        var self = this ;

        WS.SQLExec({
            sql_file: self.sql.mid_wait_chart,
            bind : [{
                name : 'fromtime',
                type : SQLBindType.STRING,
                value: common.Util.getDate(self.datePicker.getFromDateTime())
            },{
                name : 'totime',
                type : SQLBindType.STRING,
                value: common.Util.getDate(self.datePicker.getToDateTime())
            },{
                name : 'db_id',
                type : SQLBindType.INTEGER,
                value: self.db_num
            }],
            replace_string: [{
                name: 'event_name',
                value: "'"+self.stat_name_list['Wait'].join("','")+"'"
            }]
        }, self.onMIDData.bind({
            target: chart,
            type  : 'Wait',
            self  : self
        }), self );




        if ( chart_latch == null || chart_latch.length == 0 )
            return;

        WS.SQLExec({
            sql_file: self.sql.mid_wait_latch_chart,
            bind : [{
                name : 'fromtime',
                type : SQLBindType.STRING,
                value: common.Util.getDate(self.datePicker.getFromDateTime())
            },{
                name : 'totime',
                type : SQLBindType.STRING,
                value: common.Util.getDate(self.datePicker.getToDateTime())
            },{
                name : 'db_id',
                type : SQLBindType.INTEGER,
                value: self.db_num
            }]
        }, self.onMIDData.bind({
            target: chart_latch,
            type  : 'Wait_latch',
            self: self
        }), self );



    } ,



    //-----------------------------------------------------------------------------------------------------------
    get_value: function( curr_time ){
        var self = this ;

        if ( !self.isLoading )
            self.pnl_val.loadingMask.showMask();

        //value grid
        //stat
        var new_fromtime = new Date( curr_time ) ;
        var tmp_fromtime = new Date( curr_time ) ;
        tmp_fromtime.setMinutes(new_fromtime.getMinutes()+1) ;

        var dt_mid_val_s = {} ;
        dt_mid_val_s.sql_file = self.sql.mid_val_stat_grd ;
        dt_mid_val_s.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(curr_time)
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(tmp_fromtime) //self.datePicker.getFromDateTime()
        },{
            name : 'fromdate',
            type : SQLBindType.STRING,
            value: common.Util.getDateFormat(curr_time)
        },{
            name : 'todate',
            type : SQLBindType.STRING,
            value: common.Util.getDateFormat(self.datePicker.getToDateTime())
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }] ;
        WS.SQLExec( dt_mid_val_s, self.on_mid_value_data, self ) ;

        //wait
        var dt_mid_val_w = {} ;
        dt_mid_val_w.sql_file = self.sql.mid_val_wait_grd ;
        dt_mid_val_w.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(curr_time)
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(tmp_fromtime)//self.datePicker.getFromDateTime()
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }] ;
        dt_mid_val_w.replace_string = [{
            name : 'IDLE_EVENT',
            value: common.DataModule.referenceToDB.eventName
        }];
        WS.SQLExec( dt_mid_val_w, self.on_mid_value_data, self ) ;
    } ,



    //-----------------------------------------------------------------------------------------------------------
    get_ratio: function( chart ){
        var self = this , ratio_sql_file;

        if ( Array.isArray(chart) ) {
            for (var ix in chart) {
                if (ix != chart.length-1)
                    getData(chart[ix]) ;
                else
                    getData(chart[ix], true) ;
            }
        }
        else
            getData(chart, true) ;

        function getData( chart, is_last ){
            var ratioIdx = common.DataModule.referenceToDB.ratioName.indexOf(chart.title);

            switch( ratioIdx ){
                //Buffer Cache Hit Ratio
                case 0 : self.ratio_dt_idx = 1 ;
                    ratio_sql_file = self.sql.mid_ratio_buffer_cache ;
                    break ;

                //Buffer Busy Wait Ratio
                case 1 :
                //Free Buffer Wait Ratio
                case 2 : self.ratio_dt_idx = 2 ;
                    ratio_sql_file = self.sql.mid_ratio_buffer_busy ;
                    break ;

                //Disk Sort Ratio
                case 3 :
                //Rows per Sort
                case 4 : self.ratio_dt_idx = 2 ;
                    ratio_sql_file = self.sql.mid_ratio_sort_disk_rows ;
                    break ;

                //Cursors Opened per Transaction
                case 5 :
                //Recursive to User Call Ratio
                case 6 :
                //Parse Count per User Calls
                case 7 :
                //Hard Parsing Ratio
                case 8 : self.ratio_dt_idx = 4 ;
                    ratio_sql_file = self.sql.mid_ratio_cursor_user_call ;
                    break ;

                //Average Reusable Buffers in LRU
                case 9 :
                //Average LRU Buffer Scan
                case 10: self.ratio_dt_idx = 2 ;
                    ratio_sql_file = self.sql.mid_ratio_buffer_avg ;
                    break ;

                //Free Buffer Scan Ratio
                case 11: self.ratio_dt_idx = 1 ;
                    ratio_sql_file = self.sql.mid_ratio_free_inspected ;
                    break ;

                //Log Space Request Ratio
                case 12:
                //Log Buffer Retry Ratio
                case 13: self.ratio_dt_idx = 2 ;
                    ratio_sql_file = self.sql.mid_ratio_log_buffer ;
                    break ;

                //Rows by Index Scan Ratio
                case 14:
                case 15: self.ratio_dt_idx = 2 ;
                    ratio_sql_file = self.sql.mid_ratio_row_index_scan ;
                    break ;
                default:
                    return ;
            }

            WS.SQLExec({
                sql_file: ratio_sql_file,
                bind : [{
                    name : 'fromtime',
                    type : SQLBindType.STRING,
                    value: common.Util.getDate(self.datePicker.getFromDateTime())
                },{
                    name : 'totime',
                    type : SQLBindType.STRING,
                    value: common.Util.getDate(self.datePicker.getToDateTime())
                },{
                    name : 'fromdate',
                    type : SQLBindType.STRING,
                    value: common.Util.getDateFormat(self.datePicker.getFromDateTime())
                },{
                    name : 'todate',
                    type : SQLBindType.STRING,
                    value: common.Util.getDateFormat(self.datePicker.getToDateTime())
                },{
                    name : 'db_id',
                    type : SQLBindType.INTEGER,
                    value: self.db_num
                }]
            }, self.onMIDData.bind({
                target: chart,
                type  : 'Ratio',
                self  : self,
                idx   : self.ratio_dt_idx,
                is_last_cb: is_last
            }), self );
        }
    },
    //end get_ratio



    //-----------------------------------------------------------------------------------------------------------
    get_active_data: function( curr_time ){
        var self = this ;
        if ( !self.isLoading )
            self.tab_bot_pnl.getComponent('pnl_active').loadingMask.showMask();

        var dt_bot_active = {} ;
        dt_bot_active.sql_file = self.sql.bot_activesession ;
        dt_bot_active.bind = [{
            name : 'currenttime',
            type : SQLBindType.STRING,
            value: curr_time
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }];
        WS.SQLExec( dt_bot_active, self.onBOTData, self ) ;
    } ,
    //end get_active_data

    //-----------------------------------------------------------------------------------------------------------
    exclude_change: function( chk_stat ){
        var self = this ;

        self.grd_active.pnlExGrid.getStore().clearFilter() ;
        chk_stat ? self.backgroundFilter(true) : self.backgroundFilter(false);
    },


    //-----------------------------------------------------------------------------------------------------------
    // 스토어가 아닌 뷰에서 특정 조건으로 그리드를 filter 해준다.
    backgroundFilter: function(state){
        var self = this;
        self.grd_active.pnlExGrid.getStore().filterBy(

            function(record){
                if ( state ){
                    if (record.data['session_type'] == 'BACKGROUND')
                        return !state;
                    else
                        return state;
                }else{
                    return !state ;
                }
            });
    },



    //-----------------------------------------------------------------------------------------------------------
    get_lock_data: function( curr_time ){
        var self = this ;

        if ( !self.pnl_locktree.isLoading )
            self.pnl_locktree.loadingMask.showMask();

        self.curr_sec['lock'].length = 0;

        var dt_mid_lock = {} ;
        dt_mid_lock.sql_file = self.sql.mid_lock_tree ;
        dt_mid_lock.bind = [{
            name : 'currenttime',
            type : SQLBindType.STRING,
            value: curr_time
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }] ;

        WS.SQLExec( dt_mid_lock, self.on_mid_lock_data, self ) ;
    },


    //-----------------------------------------------------------------------------------------------------------
    get_lock_info: function(){
        var self = this ;

        if ( !self.pnl_lockinfo.isLoading )
            self.pnl_lockinfo.loadingMask.showMask() ;

        //lock info
        var dt_mid_lockinfo = {} ;
        dt_mid_lockinfo.sql_file = self.sql.mid_lock_info ;
        dt_mid_lockinfo.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(self.datePicker.getFromDateTime())
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: common.Util.getDate(self.datePicker.getToDateTime())
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.dbCombo.getValue()
        }] ;
        WS.SQLExec( dt_mid_lockinfo, self.on_mid_lock_data, self ) ;
    } ,


    //-----------------------------------------------------------------------------------------------------------
    get_active_sum: function(){
        var self = this ;
        self.tab_bot_pnl.getComponent('pnl_active_sum').loadingMask.showMask() ;
        var date = new Date( self.lbl_time.text ) ;
        var fromdate =  date;
        var tmpFrom  = date ;
        var lbl_curr_time = tmpFrom.setMinutes( fromdate.getMinutes() + 1) ;
        lbl_curr_time = common.Util.getDate(lbl_curr_time) ;

        //active session sum data
        var dt_bot_active_sum = {} ;
        dt_bot_active_sum.sql_file = self.sql.bot_activesession_sum ;
        dt_bot_active_sum.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            //common.Util.getDate( date )
            value: common.Util.getDate(self.click_time)
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: lbl_curr_time
        },{
            name : 'db_id',
            type : SQLBindType.INTEGER,
            value: self.db_num
        }] ;
        WS.SQLExec( dt_bot_active_sum, self.onBOTData, self ) ;
    },





    //-----------------------------------------------------------------------------------------------------------
    get_os_process: function(){
        var self = this ;

        self.tab_bot_pnl.getComponent('pnl_process').loadingMask.showMask() ;

        var tmpFrom  =  Ext.util.Format.date( new Date( self.lbl_time.text ), 'Y-m-d H:i:s');

        var was_list = Comm.wasIdArr.join();
        self.was_list = was_list;
        var dt_bot_process = {} ;
        dt_bot_process.sql_file = self.sql.bot_process ;
        dt_bot_process.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            //.substring(0,16)+':00'   //self.datePicker.getFromDateTime()
            value: common.Util.getDate(tmpFrom)
        }] ;
        dt_bot_process.replace_string = [{
            name : 'was_id',
            value: self.was_list
        }] ;

        WS.SQLExec( dt_bot_process, self.onBOTData, self ) ;
    } ,


    //-----------------------------------------------------------------------------------------------------------
    move_line: function( line_pos ){
        var self = this ;
        var result = null ;
        var ix;
        self.move_pos = line_pos ;

        if ( ( self.arr_chart == null )
            || ( self.arr_stat_chart == null ) )
            return ;

        //top chart
        self.chart_cpu.drawIndicator( line_pos ) ;
        self.chart_locked.drawIndicator( line_pos ) ;
        for ( ix=0; ix<self.arr_chart.length; ix++ ){
            self.arr_chart[ix].drawIndicator( line_pos ) ;
        }

        //middle chart
        for ( ix=0; ix<self.arr_stat_chart.length; ix++ ){
            self.arr_stat_chart[ix].drawIndicator( line_pos ) ;
        }
        for ( ix=0; ix<self.arr_wait_chart.length; ix++ ){
            self.arr_wait_chart[ix].drawIndicator( line_pos ) ;
        }
        for ( ix=0; ix<self.arr_ratio_chart.length; ix++ ){
            self.arr_ratio_chart[ix].drawIndicator( line_pos ) ;
        }

        for ( ix=0; ix<self.arr_os_chart.length; ix++ ){
            self.arr_os_chart[ix].drawIndicator( line_pos ) ;
        }

        var str_time = common.Util.getDate( line_pos.x ) ;
        result = str_time ;
        return result ;
    }, // end-move_line


    //-----------------------------------------------------------------------------------------------------------
    lock_info_click: function( dt ){
        var self =  this ;

        //하단 draw flag초기화
        self.flag_list.flag_process = false ;
        self.flag_list.flag_active  = false ;
        self.flag_list.flag_active_sum = false ;
        self.flag_list.flag_execute = true ;


        var fromdate = new Date( dt.from_time );
        self.lock_info_sec = fromdate.getSeconds();

        self.move_pos.x = new Date( fromdate ) ;
        self.click_time = self.move_line( self.move_pos ) ;

        if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_active' )
            self.get_active_sec( self.click_time ) ;
        else if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_active_sum' )
            self.get_active_sum();
        else if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_process' )
            self.get_os_process();

        if ( this.flag_list.flag_locktree ){
            self.get_lock_sec( self.click_time ) ;
        }
    } , //end-lock_info_click


    //-----------------------------------------------------------------------------------------------------------
    //stat, wait, ratio 관련 stat name 한방에 get.
    get_stat_name: function(value){


        if ( WS.connect_state == 1 ){
            var self = this ;
            var db_id = value;

            if (db_id == null) {
                db_id = self.dbCombo.getValue() ;
            }

            //stat
            var dt_stat_list = {} ;
            dt_stat_list.sql_file = self.sql.stat ;
            dt_stat_list.bind = [{
                name : 'db_id',
                type : SQLBindType.INTEGER,
                value: db_id
            }]  ;
            WS.SQLExec( dt_stat_list, self.onData, self ) ;

            //wait
            var dt_wait_list = {} ;
            dt_wait_list.sql_file = self.sql.wait ;
            dt_wait_list.bind = [{
                name : 'db_id',
                type : SQLBindType.INTEGER,
                value: db_id
            }]  ;
            dt_wait_list.replace_string = [{
                name : 'IDLE_EVENT',
                value: common.DataModule.referenceToDB.eventName
            }] ;
            WS.SQLExec( dt_wait_list, self.onData, self ) ;

            self = null ;
            db_id = null ;
        }

    }, //end-get_stat_name



    //-----------------------------------------------------------------------------------------------------------
    onData:function(header, data){
        var self = this ;
        var command = header.command;
        var ix ;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            self.loadingMask.hide();

            console.debug('DBTrend-onData');
            console.debug(header);
            console.debug(data);
            return;
        }

        data = data.rows ;
        switch( command ){
            case self.sql.stat :
                self.all_stat_list.Stat.length = 0 ;

                if( data.length == 0 ){
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('There is no Stat Name'), Ext.Msg.OK, Ext.MessageBox.WARNING, function(){
                        self.loadingMask.hide() ;
                        return ;
                    });
                }

                for ( ix = 0; ix< data.length; ix++ ){
                    self.all_stat_list['Stat'].push( data[ix][0] ) ;
                    self.stat_list['Stat'].push( { Stat: data[ix][0] } ) ;
                }
                self.stat_list['Stat'] = data ;
                break ;

            case self.sql.wait :
                self.all_stat_list.Wait.length = 0 ;
                if( data.length == 0 ){
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('There is no Event Name'), Ext.Msg.OK, Ext.MessageBox.WARNING, function(){
                        self.loadingMask.hide() ;
                        return ;
                    });
                }

                for ( ix = 0; ix< data.length; ix++ ){
                    self.all_stat_list['Wait'].push( data[ix][0] ) ;
                    self.stat_list['Wait'].push( { Wait: data[ix][0] } ) ;
                }
                self.stat_list['Wait'] = data ;

                self.all_stat_list['Wait'].push( 'Latch Wait Time (Total)' ) ;
                self.stat_list['Wait'].push( ['Latch Wait Time (Total)'] ) ;

                /**
                 self.stat_change_form = Ext.create('view.DBTrend_StatChange') ;
                 self.stat_change_form.scope = self ; //this넘겨주기.
                 self.stat_change_form.db_id = self.dbCombo.getReplValue() ;
                 */

                //ratio
                var tmp_list = { Ratio: [] } ;
                self.all_stat_list.Ratio.length = 0 ;
                for ( ix = 0; ix<common.DataModule.referenceToDB.ratioName.length; ix++  ){
                    self.all_stat_list['Ratio'].push( common.DataModule.referenceToDB.ratioName[ix] ) ;
                    tmp_list['Ratio'].push( {Ratio: common.DataModule.referenceToDB.ratioName[ix]} ) ;
                }

                for ( ix = 0; ix < tmp_list['Ratio'].length; ix++  )
                    self.stat_list['Ratio'].push( [ tmp_list['Ratio'][ix].Ratio ] ) ;

                /**
                self.stat_change_form.stat_change_list = self.stat_list ;
                 self.stat_change_form.init() ;
                 */


                //statchange 미리만들어놓기.
                self.stat_change = Ext.create('Exem.StatChangeWindow',{
                    instanceId: self.dbCombo.getValue(),
                    useTab: {
                        osstat : false,
                        stat   : true,
                        wait   : true,
                        ratio  : false
                    },
                    okFn: function( type, name ){
                        console.debug('선택된 타입??', type);
                        console.debug('선택된 이름??', name);

                        //타이틀 업데이트
                        self.title_update( self.target_chart, name ) ;
                        if ( self.flag_list.flag_refresh )
                            self.target_chart.loadingMask.showMask();

                        if ( !self.flag_list.flag_refresh )
                            return;

                        //쿼리 재조회
                        var active_tab = self.tab_mid_pnl.getActiveTab().itemId ;
                        self.get_chart_type( active_tab ) ;

                    }
                }) ;
                self.stat_change.init() ;

                break ;
            default:
                break ;
        }
        ix = null ;
    }, // end-onData


    //-----------------------------------------------------------------------------------------------------------
    //call_popup -> 하단 액티브 그리드에서 우클릭으로 넘어오는 경우 time_slice거쳐서 session_detail로 넘어가기때문 생긴 파람.
    time_slice: function( start_time, end_time){
        var self = this ;

        if ( start_time == end_time )
            return ;

        if ( start_time > end_time ) {
            var tmp_time = start_time ;
            start_time = end_time ;
            end_time = tmp_time ;
        }

        var move_time_form = Ext.create('view.DBTrend_MoveTime') ;
        move_time_form.call_type    = 'time_slice' ;
        move_time_form.me           = self ;
        move_time_form.start_time   = start_time ;
        move_time_form.end_time     = end_time ;
        move_time_form.db_id        = self.db_num ;
        move_time_form.sess_list    = self.sess_detail_var ;
        move_time_form.init() ;
    } ,
    // end time_slice



    //-----------------------------------------------------------------------------------------------------------
    get_cht_max_val: function( active_tab ){
        var self = this ;
        var result = false ;
        var time,
            value ;


        switch ( active_tab ){
            case 'pnl_cpu':
                value = self.chart_cpu.maxOffSet.y ;
                time  = self.chart_cpu.maxOffSet.x ;
                result = true ;
                break ;

            case 'pnl_top_active':
                value = self.arr_chart[0].maxOffSet.y ;
                time  = self.arr_chart[0].maxOffSet.x ;
                result = true ;
                break ;

            case 'pnl_lreads':
                value = self.arr_chart[1].maxOffSet.y ;
                time  = self.arr_chart[1].maxOffSet.x ;
                result = true ;
                break ;

            case 'pnl_preads':
                value = self.arr_chart[2].maxOffSet.y ;
                time  = self.arr_chart[2].maxOffSet.x ;
                result = true ;
                break ;

            case 'pnl_exec':
                value = self.arr_chart[3].maxOffSet.y ;
                time  = self.arr_chart[3].maxOffSet.x ;
                result = true ;
                break ;

            case 'pnl_redo':
                value = self.arr_chart[4].maxOffSet.y ;
                time  = self.arr_chart[4].maxOffSet.x ;
                result = true ;
                break ;

            case 'pnl_locked':
                value = self.chart_locked.maxOffSet.y ;
                time  = self.chart_locked.maxOffSet.x ;
                result = true ;
                break ;

            default:
                break ;
        }//end-switch

        if ( time == -1 ) {
            self.click_time = self.datePicker.getFromDateTime();
            time = +new Date(self.click_time) ;
        }
        self.move_pos.x = time ;
        self.move_pos.y = value ;

        self.click_time = common.Util.getDate( time ) ;
        self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;
        return result ;
    },


    //-----------------------------------------------------------------------------------------------------------
    init_flag_set: function(){
        var self = this ;

        self.flag_list.flag_cpu         = false ;
        self.flag_list.flag_top_active  = false ;
        self.flag_list.flag_lreads      = false ;
        self.flag_list.flag_preads      = false ;
        self.flag_list.flag_exec        = false ;
        self.flag_list.flag_locked      = false ;
        self.flag_list.flag_redo        = false ;

        self.flag_list.flag_zoom['top_chart'] = false  ;
        self.flag_list.flag_zoom['top_locked']= false  ;
        self.flag_list.flag_zoom['mid_wait']  = false  ;
        self.flag_list.flag_zoom['mid_wait_latch']  = false  ;
        /**
        //self.flag_list.flag_zoom['mid_ratio1'] = false ;
        //self.flag_list.flag_zoom['mid_ratio2'] = false ;
        //self.flag_list.flag_zoom['mid_ratio3'] = false ;
        //self.flag_list.flag_zoom['mid_ratio4'] = false ;
         **/
        self.flag_list.flag_zoom['mid_os']    = false  ;

        self.flag_list.flag_refresh     = false ;
        self.flag_list.flag_execute     = false ;

        self.flag_list.flag_stat        = false ;
        self.flag_list.flag_wait        = false ;
        self.flag_list.flag_val         = false ;
        /**
        //self.flag_list.flag_ratio       = false ;
         **/
        self.flag_list.flag_osstat      = false ;
        self.flag_list.flag_locktree    = false ;
        self.flag_list.flag_lockinfo    = false ;

        self.flag_list.flag_active      = false ;
        self.flag_list.flag_process     = false ;
        self.flag_list.flag_active_sum  = false ;
/**
//        self.max_set.draw_flag = false ;
//        self.max_set.max_time  = null ;
//        self.max_set.max_value = null ;
 **/

        self.tab_top_pnl.setActiveTab(0) ;
        self.tab_mid_pnl.setActiveTab(0) ;
        self.tab_bot_pnl.setActiveTab(0) ;

        self.curr_sec['active'].length = 0;
        self.curr_sec['lock'].length = 0;

        self.zoom_from = null ;
        self.zoom_to   = null ;
        self.lock_info_sec = null ;

        self.chart_cpu.clearDependentChart() ;
    },


    //-----------------------------------------------------------------------------------------------------------
    //처음 active되는 차트만 add.
    set_zoom_chart: function(){
        var self = this ;

        self.chart_cpu.addDependentChart( self.arr_stat_chart ) ;
    },


    //-----------------------------------------------------------------------------------------------------------
    get_full_time: function( time, position ){
        var tmp_str ;

        if ( position == 'FROM' ){
            tmp_str = time.getFullYear() +"-"+
                ("0" + (time.getMonth()+1)).slice(-2) +"-"+
                ("0" + time.getDate()).slice(-2) + " " +
                ("0" + time.getHours()).slice(-2) + ":" +
                ("0" + time.getMinutes()).slice(-2) + ":" +
                ("00") ;
        }else{
            tmp_str = time.getFullYear() +"-"+
                ("0" + (time.getMonth()+1)).slice(-2) +"-"+
                ("0" + time.getDate()).slice(-2) + " " +
                ("0" + time.getHours()).slice(-2) + ":" +
                ("0" + time.getMinutes()).slice(-2) + ":" +
                ("59") ;
        }
        return tmp_str ;
    } ,



    //-----------------------------------------------------------------------------------------------------------
    _get_time_hour: function( time, type ){
        var tmp_str ;

        //type = hm이면 시:분
        //아니면 년-월-일 시:분

        time = new Date( time ) ;
        if ( type == 'hm' ){
            tmp_str = ("0" + time.getHours()).slice(-2) + ":" +
                ("0" + time.getMinutes()).slice(-2)   ;
        }else if( type == 'ymd' ){
            tmp_str = (time.getFullYear() +"-"+
            ("0" + (time.getMonth()+1)).slice(-2) +"-"+
            ("0" + time.getDate()).slice(-2) ) ;
        } else {
            tmp_str = (time.getFullYear() +"-"+
            ("0" + (time.getMonth()+1)).slice(-2) +"-"+
            ("0" + time.getDate()).slice(-2) + " " +
            ("0" + time.getHours()).slice(-2) + ":" +
            ("0" + time.getMinutes()).slice(-2) )  ;
        }

        return tmp_str ;
    } ,

    //-----------------------------------------------------------------------------------------------------------
    set_pnl_chart: function(parent, txt, pnl_id, cht_id){
        var self = this ;
        var result = null ,
            is_point ;
        /**
//        var pnl = Ext.create('Exem.Panel',{
//            layout: 'fit',
//            height: '100%',
//            title : txt,
//            itemId: pnl_id,
//            listeners:{
//                afterlayout: function(){
//                    self.top_tab_change(pnl) ;
//                }
//            }
//        }) ;
         **/
        var pnl = Ext.create('Exem.Panel',{
            layout: 'vbox',
            width: '100%',
            height: '100%',
            title : common.Util.CTR(txt),
            itemId: pnl_id,
            listeners:{
                afterlayout: function(){
                    self.top_tab_change(pnl) ;
                }
            }
        }) ;
        parent.add(pnl) ;

        var chart = Ext.create('Exem.chart.CanvasChartLayer', {
            width              : '100%',
//            height             : '100%',
            flex: 1,
            itemId             : cht_id ,
            interval           : PlotChart.time.exMin,
//            title              : txt,
//            titleHeight        : 15 ,
//            titleFontSize      : '8px',
//            showTitle          : true ,
            showLegend         : true,
            showLegendValueArea: true,
            legendTextAlign    : 'east',
            mouseSelect        : true,
            mouseSelectMode    : 'x',
            showIndicator      : true ,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip        : true,
            toolTipFormat      : '%x [value:%y] ',
            toolTipTimeFormat  : '%H:%M',
            chartProperty      : {
                yLabelWidth: 55,
                xLabelFont: {size: 8, color: 'black'},
                yLabelFont: {size: 8, color: 'black'},
                xaxis: true
            },
            selectionZoom: true,
            //레전드 영역의 인디케이터.
            historyInfoDblClick: function( chart, record){
                var history_time = record.data['TIME'] ;

                self.move_pos = { x: parseInt(new Date(history_time).getTime()) , y: null } ;
                self.click_time = self.move_line( self.move_pos ) ;
                self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

                self.get_active_data( self.click_time ) ;
            },
            plotdblclick : function(event, pos, item, xAxis){
                if ( ( pos.x < 0 ) )
                    return;

                //value, locktree변수 초기화.
                self.flag_list.flag_val = false ;
                self.flag_list.flag_locktree = false ;

                self.move_pos  = xAxis ; //pos
                self.click_time = self.move_line( { x: xAxis.x, y: xAxis.y } ) ;
                self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

                if ( self.tab_mid_pnl.getActiveTab().itemId == 'pnl_val' ){
                    self.mid_tab_change( 'pnl_val' ) ;
                }else if ( self.tab_mid_pnl.getActiveTab().itemId == 'pnl_locktree' )
                    self.get_lock_sec( self.click_time ) ;


                if ( !self.tab_bot_pnl.collapsed ){

                    //하단부 변수 초기화
                    self.flag_list.flag_active     = false ;
                    self.flag_list.flag_process    = false ;
                    self.flag_list.flag_active_sum = false ;


                    if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_active' ){
                        self.get_active_sec( self.click_time ) ;
                    }else if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_process' ){
                        self.get_os_process();
                    }else
                        self.get_active_sum() ;
                }
            },

            plotselection: function(){
            },

            afterZoomEvent: function(from, to){
                if ( !self.flag_list.flag_refresh )
                    return;

                self.move_line( { x: self.chart_cpu.maxOffSet.x, y: self.chart_cpu.maxOffSet.y } ) ;
                var from_sec = new Date(from).getSeconds() ;
                if ( from_sec !== 0 ){
                    self.zoom_mode = true ;
                    var fromtime = new Date(from).setMinutes( new Date(from).getMinutes()+1 ) ;
                    fromtime = new Date( fromtime ) ;
                    self.zoom_from = (fromtime.getFullYear() +"-"+
                        ("0" + (fromtime.getMonth()+1)).slice(-2) +"-"+
                        ("0" + fromtime.getDate()).slice(-2) + " " +
                        ("0" + fromtime.getHours()).slice(-2) + ":" +
                        ("0" + fromtime.getMinutes()).slice(-2) )  + ':' +
                        ("00") ;
                }else { self.zoom_from = common.Util.getDate( from ) ; }

                var totime = new Date(to) ;
                self.zoom_to = (totime.getFullYear() +"-"+
                    ("0" + (totime.getMonth()+1)).slice(-2) +"-"+
                    ("0" + totime.getDate()).slice(-2) + " " +
                    ("0" + totime.getHours()).slice(-2) + ":" +
                    ("0" + totime.getMinutes()).slice(-2) )  + ':' +
                    ("00") ;

                if ( self.click_time == common.Util.getDate( self.chart_cpu.maxOffSet.x ) )
                    return;
                self.click_time = common.Util.getDate( self.chart_cpu.maxOffSet.x ) ;
                self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

                if ( !self.tab_bot_pnl.collapsed )
                    self.get_active_sec( self.click_time ) ;

                /**
                 setTimeout(function(){
                 if ( self.tab_mid_pnl.getActiveTab() == 'pnl_locktree' ){
                 if ( self.curr_sec_frm['lock'].length > 0 )
                 self.curr_sec_frm['lock'][0].getEl().setStyle( 'color', 'red' ) ;
                 self.curr_sec_frm['lock'][0].getEl().setStyle( 'font-weight', 'bold' ) ;
                 }
                 if ( self.curr_sec_frm['active'].length > 0 )
                 self.curr_sec_frm['active'][0].getEl().setStyle( 'color', 'red' ) ;
                 self.curr_sec_frm['active'][0].getEl().setStyle( 'font-weight', 'bold' ) ;
                 }, 300);
                 */
            }
        });

        if ( cht_id == 'chart_locked' ) {
            is_point = true ;
        } else {
            is_point = false ;
        }

        chart.addSeries({
            label: common.Util.CTR(txt),
            id   : 'cht',
            point: is_point ,
            type : PlotChart.type.exLine
        }) ;
        pnl.add(chart) ;
        pnl.chart = chart;


        result = chart ;
        return result ;
    },


    //-----------------------------------------------------------------------------------------------------------
    set_pnl_grid: function(txt, pnl_id, grd_id){
        var self = this;
        var result = null ;
        var parent = self.tab_bot_pnl ;
        var pnl = Ext.create('Exem.Panel',{
            layout   : 'vbox',
            title    : txt,
            itemId   : pnl_id,
            usePager : false,
            listeners:{
                afterlayout: function(){
                    self.bot_tab_change(pnl_id) ;
                }
            }
        }) ;
        parent.add(pnl) ;
        var grd = Ext.create('Exem.BaseGrid', {
            itemId: grd_id
        });
        pnl.add(grd) ;
        result = grd ;
        return result ;
    },


    //-----------------------------------------------------------------------------------------------------------
    set_pnl: function(parent, txt, pnl_id){
        var self = this ;
        var result = null ;

        var layout_fomat ;
        if (pnl_id == 'pnl_val'){
            layout_fomat = 'border' ;
        }else{
            layout_fomat = 'vbox' ;
        }
        var pnl = Ext.create('Exem.Container', {
            layout: layout_fomat,
            title : txt,
            itemId: pnl_id,
            listeners: {
                afterlayout: function(){
                    self.mid_tab_change(pnl_id);
                }
            }
        }) ;
        parent.add(pnl) ;
        result = pnl ;
        return result ;
    },


    //-----------------------------------------------------------------------------------------------------------
    set_chart: function(parent, itemid, cht_idx){
        var self = this;

        var chart = Ext.create('Exem.chart.CanvasChartLayer', {
            flex           : 1,
            title          : itemid,//'',
            itemId         : itemid,
            interval       : PlotChart.time.exMin,
            dbclick_info   : {cb:self.onMIDData, scope: self, itemId: itemid, idx: cht_idx},
            titleHeight    : 17 ,
            titleFontSize  : '12px',
            showXAxis      : false,
            showTitle      : true ,
            showLegend     : true,
            legendNameWidth : 145,
            legendTextAlign: 'east',
            showIndicator  : true ,
            indicatorLegendFormat: '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip    : true,
            toolTipFormat  : '%x [value:%y] ',
            toolTipTimeFormat: '%H:%M',
            mouseSelect    : true,
//            mouseSelectMode: 'x',
            chartProperty: {
                yLabelWidth: 55,
                xLabelFont : {size: 8, color: 'black'},
                yLabelFont : {size: 8, color: 'black'},
                xaxis      : false
            },
            //자동으로 줌할껀지 설정하는 거임.
            selectionZoom: true,
            historyInfoDblClick: function( chart, record){
                var history_time = record.data['TIME'] ;

                self.move_pos = { x: parseInt(new Date(history_time).getTime()) , y: null  } ;
                self.click_time = self.move_line( self.move_pos ) ;
                self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

                self.get_active_data( self.click_time ) ;
            },
            plotdblclick : function(event, pos, item, xAxis){

                if ( ( pos.x < 0 ) )
                    return;

                self.move_pos  = xAxis ;//pos
                self.click_time = self.move_line( xAxis ) ;
                self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

                if ( self.tab_mid_pnl.getActiveTab().itemId == 'pnl_locktree' )
                    self.get_lock_sec( self.click_time ) ;

                if ( !self.tab_bot_pnl.collapsed ){

                    //하단그리드만 플래그 초기화.
                    self.flag_list.flag_active = false ;
                    self.flag_list.flag_active_sum = false ;
                    self.flag_list.flag_process = false ;

                    if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_active' )
                        self.get_active_sec( self.click_time ) ;
                    else if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_process' )
                        self.get_os_process() ;
                    else
                        self.get_active_sum() ;
                }
            },
            plotselection: function(){
                if ( !self.flag_list.flag_refresh )
                    return;
                /**
//                self.chart_cpu.dependentChartZoomIn( pos.xaxis.from, pos.xaxis.to ) ; //호출하지 마세여
//                self.move_line( { x: max_value.x, y: max_value.y } ) ;
//                self.click_time = max_value.x ;
//                var input_key = event.shiftKey ;
//                if ( input_key )
//                self.time_slice( pos.xaxis.from, pos.xaxis.to, null ) ;
                 **/
            },
            afterZoomEvent: function(from, to){
                if ( !self.flag_list.flag_refresh )
                    return;

                var from_sec = new Date(from).getSeconds() ;
                if ( from_sec !== 0 ){
                    self.zoom_mode = true ;
                    var fromtime = new Date(from).setMinutes( new Date(from).getMinutes()+1 ) ;
                    fromtime = new Date( fromtime ) ;
                    self.zoom_from = (fromtime.getFullYear() +"-"+
                        ("0" + (fromtime.getMonth()+1)).slice(-2) +"-"+
                        ("0" + fromtime.getDate()).slice(-2) + " " +
                        ("0" + fromtime.getHours()).slice(-2) + ":" +
                        ("0" + fromtime.getMinutes()).slice(-2) )  + ':' +
                        ("00") ;
                }else { self.zoom_from = common.Util.getDate( from ) ; }

                var totime = new Date(to) ;
                self.zoom_to = (totime.getFullYear() +"-"+
                    ("0" + (totime.getMonth()+1)).slice(-2) +"-"+
                    ("0" + totime.getDate()).slice(-2) + " " +
                    ("0" + totime.getHours()).slice(-2) + ":" +
                    ("0" + totime.getMinutes()).slice(-2) )  + ':' +
                    ("00") ;

                self.move_line( { x: self.chart_cpu.maxOffSet.x, y: self.chart_cpu.maxOffSet.y } ) ;

                if ( self.click_time == common.Util.getDate( self.chart_cpu.maxOffSet.x ) )
                    return;
                self.click_time = common.Util.getDate( self.chart_cpu.maxOffSet.x ) ;
                self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

                if ( !self.tab_bot_pnl.collapsed )
                    self.get_active_sec( self.click_time ) ;
            }
        });
        //---해당컴포넌트에 이벤트가 없는경우 -> 동적 이벤트 생성-----------------------
        chart.titleLayer.on({
            render: {fn: title_click, scope: chart}
        });
        //------------------------------------------------------------------------





        //chart add series
        if ( chart.itemId == 'os_chart1' ){
            chart.addSeries({
                label: common.Util.CTR('MAX'),
                id   : 'mid_cht0',
                type : PlotChart.type.exLine
            }) ;

            chart.addSeries({
                label: common.Util.CTR('AVG'),
                id   : 'mid_cht1',
                type : PlotChart.type.exLine
            }) ;
        }
        else if ( chart.itemId == 'os_chart2' ){
            chart.addSeries({
                label: common.Util.TR('OS Free Memory (MB)'),
                id   : 'mid_cht2',
                type : PlotChart.type.exLine
            }) ;
        }
        else {
            chart.addSeries({
                label: '',
                id   : 'mid_cht',
                type : PlotChart.type.exLine
            }) ;
        }

        function title_click() {
            var self = this;

            if ( self.dbclick_info == null )
                return;
            var el = self.titleLayer.getEl();
            var info = self.dbclick_info;
            self.dbclick_info = null;
            el.setStyle( 'cursor', 'pointer' ) ;
            el.scope = info.scope;
            el.itemId = info.itemId;
            el.cht_idx = info.idx ;

            //self = chart , info.scope = this
            self.titleLayer.getEl().addListener('click', function() {
                var active_tab = info.scope.tab_mid_pnl.getActiveTab() ;
                var active_pnl = info.scope.tab_mid_pnl.getComponent(active_tab.itemId) ;
                var stat_type ,
                    select_title = active_pnl.getComponent(info.idx).title ;

                //stat_type은 현재 클릭한 레전드타이틀의 값에 해당하는 놈.
                if ( info.scope.all_stat_list['Stat'].indexOf(select_title) > -1 ) {
                    stat_type = StatChange.stat;
                }else if ( info.scope.all_stat_list['Wait'].indexOf(select_title) > -1 ){
                    stat_type = StatChange.wait;
                }else if (info.scope.all_stat_list['Ratio'].indexOf(select_title) > -1 ){
                    stat_type = StatChange.ratio;
                }

                //target_chart는 현재 active되어있는 탭.
                switch ( active_tab.itemId ){
                    case 'pnl_stat':
                        info.scope.target_chart = info.scope.arr_stat_chart[ info.idx ] ;
                        break ;

                    case 'pnl_wait':
                        info.scope.target_chart = info.scope.arr_wait_chart[ info.idx ] ;
                        break ;

                    /**
                    //case 'pnl_ratio':
                    //    info.scope.target_chart = info.scope.arr_ratio_chart[ info.idx ] ;
                    //    break ;
                     **/
                    default :
                        return ;
                }
                info.scope.stat_change.selectValue( stat_type, select_title ) ;
            });
        }
        return chart ;
    } ,  //end-set_chart



    //-----------------------------------------------------------------------------------------------------------



    title_update: function( arr_cht, cut_title ){


        //배열인지 아닌지(StatChange) 체크
        if (!Array.isArray( arr_cht )) {
            arr_cht = [arr_cht] ;
            cut_title = [cut_title] ;
        }

        for ( var ix = 0 ; ix < arr_cht.length; ix++ ){
            arr_cht[ix].setTitle( cut_title[ix] ) ;
            if ( arr_cht[ix].itemId == 'os_chart1' && arr_cht[ix].itemId !== 'os_chart2'  )
                arr_cht[ix].setLegendText( 0, 'AVG' ) ;
            else
                arr_cht[ix].setLegendText( 0, cut_title[ix] ) ;
        }

        ix = null ;
    } ,





    //-----------------------------------------------------------------------------------------------------------
    sec_60_frm: function( type ){
        var self = this ;
        var parent ,
            arr_frm = [],
            total_sec_pnl ,
            info ;

        // 이게 sec_pnl 뒤의 배경이 되는 container 배경색.
        var tempContainer =  Ext.create('Exem.Container', {
            width :'100%',
            layout: 'hbox',
            height: 15,
            style : {
                background: '#ECECEC'
            }
        });

        if ( type == 'active' ) {
            self.active_sec_total = Ext.create('Exem.Container', {
                layout: 'hbox',
                align : 'stretch',
                itemid: 'sec_pnl',
                height: 15,
                width : 1200
            }) ;
            tempContainer.add(self.active_sec_total);
            total_sec_pnl = self.active_sec_total ;

            parent = self.tab_bot_pnl.getComponent('pnl_active') ;
            arr_frm = self.curr_sec_frm['active'] ;
            info = {cb:self.onBOTData, scope: self, type:'active'} ;
        }else{  // Lock
            self.lock_sec_total = Ext.create('Exem.Container', {
                layout: 'hbox',
                align : 'stretch',
                itemid: 'sec_pnl',
                height: 15,
                width : 1200
            }) ;
            tempContainer.add(self.lock_sec_total);
            total_sec_pnl = self.lock_sec_total ;

            parent = self.pnl_locktree ;
            arr_frm = self.curr_sec_frm['lock'] ;
            info = {cb:self.onMIDData, scope: self, type:'lock'} ;
        }
        parent.add(tempContainer) ;

        var caption ;
        for (var ix = 0; ix < 60; ix++){
            if ( ix == 0 )  {
                caption = '00';
            } else if( ix < 10 ) {
                caption = '0' + ix;
            } else {
                caption = ix;
            }
            var pnl_secfrm = Ext.create('Exem.Container', {
                flex: 1,
                html: caption,
                dbclick_info: info,
                itemId: caption,
                disabled: true,
                style: {
                    'font-size'       : self.titleFontSize,
                    'color'           : '#dadada',
                    'background-color': 'white',//'#EBEBEB',
                    'font-family'     : 'Roboto Condensed',
                    'font-weight'     : 500
                }
            }) ;
            pnl_secfrm.on({
                render: {fn: self.sec_click, scope: pnl_secfrm}
            }) ;
            arr_frm.push(pnl_secfrm) ;
            total_sec_pnl.add(pnl_secfrm) ;
        }
        // 60개 for end.
    },


    //-----------------------------------------------------------------------------------------------------------
    //sec_dblClick
    sec_click: function(){
        var self = this ;

        if(self.dbclick_info == null)
            return;

        var el = self.getEl();
        var info = self.dbclick_info;
        self.dbclick_info = null;
        el.scope = info.scope;
        el.itemId = self.itemId;

        self.getEl().addListener('click', function() {
            if(info.type == 'active') {
                var sec = this.itemId ;
                var pnl;

                if ( sec < 10 )
                    sec = parseInt( sec );
                pnl = info.scope.curr_sec_frm['active'][ sec ] ;
            }
            else if(info.type == 'lock') {
                sec = this.itemId ;

                if ( sec < 10 )
                    sec = parseInt( sec ) ;
                pnl = info.scope.curr_sec_frm['lock'][ sec ] ;
            }
            if ( pnl.el.dom.style.color !== 'black' )
                return ;

            //클릭한 시간값으로 세팅
            if ( sec < 10 )
                var click_sec = '0' + sec ;
            else click_sec = sec ;
            var from,
                tmp_str ;
            from    = new Date( info.scope.click_time ) ;
            tmp_str = from.getFullYear() +"-"+
                ("0" + (from.getMonth()+1)).slice(-2) +"-"+
                ("0" + from.getDate()).slice(-2) + " " +
                ("0" + from.getHours()).slice(-2) + ":" +
                ("0" + from.getMinutes()).slice(-2) + ":" +
                ( click_sec ) ;

            info.scope.lock_info_sec = click_sec ;
            info.scope.click_time = tmp_str ;

            if ( !info.scope.tab_bot_pnl.collapsed  ){
                info.scope.set_sec( info.scope.curr_sec['active'], info.scope.curr_sec_frm['active'] );

                var active_pnl = info.scope.curr_sec_frm['active'][ sec ] ;
                active_pnl.getEl().setStyle( 'color', 'red' ) ;
                active_pnl.getEl().setStyle( 'font-weight', 'bold' ) ;
                info.scope.get_active_data( info.scope.click_time ) ;
            }
            if ( info.scope.tab_mid_pnl.getActiveTab().itemId == 'pnl_locktree' ){
                info.scope.get_lock_sec( info.scope.click_time ) ;
                /**
//                info.scope.set_sec( info.scope.curr_sec['lock'], info.scope.curr_sec_frm['lock'] )

//                var lock_pnl = info.scope.curr_sec_frm['lock'][ sec ] ;
//                lock_pnl.getEl().setStyle( 'color', 'red' ) ;
//                lock_pnl.getEl().setStyle( 'font-weight', 'bold' ) ;
//                info.scope.get_lock_data( info.scope.click_time ) ;
                 **/

                info.scope.lbl_time.setText( info.scope.click_time ) ;
            }
        });
    } , //end-sec_dblClick

    //-----------------------------------------------------------------------------------------------------------
    set_btn: function( btn_id, cls, width ){
        var self = this ;
        var result = null ;
        var btn = Ext.create('Ext.container.Container',{
            itemId: btn_id,
            width : width,
            height: 18,
            cls   : cls,
            listeners:{
                render: function(){
                    var btn = this ;
                    this.getEl().on('click', function(){

                        if ( !self.flag_list.flag_refresh )
                            return;
                        if ( self.move_pos == null )
                            return;
                        if ( self.move_pos.y < 0 )
                            return;

                        var pos_x, pos_2 ;
                        pos_x = new Date( self.move_pos.x ) ;
                        pos_2 = pos_x ;

                        self.lock_info_sec = null ;
                        //click시 재쿼리 날리는 화면의 변수들 초기화.
                        self.flag_list.flag_val        = false ;
                        self.flag_list.flag_locktree   = false ;
                        self.flag_list.flag_lockinfo   = false ;
                        self.flag_list.flag_active     = false ;
                        self.flag_list.flag_process    = false ;
                        self.flag_list.flag_active_sum = false ;



                        if ( btn.itemId == 'btn_move' ){
                            if ( !self.flag_list.flag_refresh )
                                return;
                            var move_time_form = Ext.create('view.DBTrend_MoveTime') ;
                            move_time_form.me = self ;
                            move_time_form.call_type = 'move_time' ;

                            move_time_form.parent_lbl_time = Ext.util.Format.date(self.click_time, Comm.dateFormat.HM) ;
                            move_time_form.init() ;
                        }else{
                            if ( self.zoom_from == undefined ) {
                                self.zoom_from = +new Date(self.datePicker.getFromDateTime() ) ;
                                var totime = new Date( self.datePicker.getToDateTime() ) ;

                                totime = new Date(totime) ;
                                self.zoom_to = (totime.getFullYear() +"-"+
                                    ("0" + (totime.getMonth()+1)).slice(-2) +"-"+
                                    ("0" + totime.getDate()).slice(-2) + " " +
                                    ("0" + totime.getHours()).slice(-2) + ":" +
                                    ("0" + totime.getMinutes()).slice(-2) )  + ':' +
                                    ("00") ;

                            }

                            switch( btn.itemId ){
                                case 'btn_prev':
                                    var current_time = common.Util.getDate( pos_x ) ;
                                    var first_time = new Date(self.zoom_from) ;
                                    if ( current_time <= common.Util.getDate(first_time) )
                                        return;

                                    self.move_pos.x = pos_2.setMinutes( pos_x.getMinutes()-1 ) ;
                                    break ;

                                case 'btn_next':
                                    current_time = common.Util.getDate( pos_x ) ;
                                    var last_time = new Date(self.zoom_to) ;

                                    if ( current_time >= common.Util.getDate(last_time) )
                                        return;

                                    self.move_pos.x = pos_2.setMinutes( pos_x.getMinutes()+1 ) ;
                                    break ;

                                case 'btn_first':
                                    if ( self.move_pos.x <= +new Date(self.zoom_from) )
                                        return;
                                    self.move_pos.x = +new Date(self.zoom_from) ;
                                    break ;

                                case 'btn_last':
                                    if ( self.move_pos.x >= +new Date(self.zoom_to) )
                                        return;
                                    last_time = new Date(self.zoom_to) ;

                                    self.move_pos.x = +new Date( last_time );
                                    break ;
                                default :
                                    break;
                            }

                            self.click_time = self.move_line( { x: self.move_pos.x, y: self.move_pos.y } ) ;
                            self.lbl_time.setText( Ext.util.Format.date(self.click_time, Comm.dateFormat.HMS) ) ;

                            if ( self.tab_mid_pnl.getActiveTab().itemId == 'pnl_val' )
                                self.get_value( self.click_time ) ;

                            if ( !self.tab_bot_pnl.collapsed ){
                                if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_active' )
                                    self.get_active_sec( self.click_time );
                                else if ( self.tab_bot_pnl.getActiveTab().itemId == 'pnl_process' )
                                    self.get_os_process() ;
                                else
                                    self.get_active_sum() ;
                            }

                            if ( self.tab_mid_pnl.getActiveTab().itemId == 'pnl_locktree' ){
                                self.get_lock_sec( self.click_time ) ;
                            }
                        }

                    }) ;

                }
            }
        }) ;
        self.btnArea.add(btn);


        var seprator = Ext.create('Ext.container.Container',{
            width: 1,
            height: '100%',
            x     : 1020,
            margin: '4 0 4 0',
            style: {
                background: '#E3E3E3'
            }
        });
        self.btnArea.add(seprator);

        result = btn ;
        return result ;
    },  //end-set_btn

    //-----------------------------------------------------------------------------------------------------------
    open_sql_text: function( sqlid, dbId, fromTime, toTime ){
        // MFO 화면 연동에 필요한 파라미터 값을 설정함.
        var mxgParams = {
            dbId    : dbId,
            sqlUid  : sqlid,
            fromTime: fromTime,
            toTime  : toTime,
            viewType: 'LongTermTrendSQLView'
        };

        var sql_text_form = Ext.create('Exem.FullSQLTextWindow', {
            mxgParams : mxgParams
        }) ;
        sql_text_form.getFullSQLText( sqlid, null ) ;
        sql_text_form.show() ;
    } ,


    //-----------------------------------------------------------------------------------------------------------
    open_txn_history: function( from, to, txn, was ){
        var txn_history_form = common.OpenView.open('TxnHistory', {
            isWindow : false,
            width    : 1200,
            height   : 800,
            fromTime : from,
            toTime   : to,
            wasId    : was,
            transactionTF: txn
        });

        setTimeout(function(){
            txn_history_form.retrieve();
        }, 300);
    }
}) ;