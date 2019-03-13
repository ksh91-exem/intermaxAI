/**
 * Created by min on 2015-12-03.
 */
Ext.define("view.ComparisonTrend",{
    extend         : "Exem.FormOnCondition",
    width          : "100%",
    height         : "100%",
    singeField     : false,
    retrieveY      : '25%',
    conditionHeight: 83 ,
    DisplayTime    : DisplayTimeMode.H,
    style          : { background: '#cccccc' },
    sql            : {},
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
            this.stat_change.destroy();
            if(this.stat_view){
                this.stat_view.destroy();
            }
        }
    },

    onFromHourSelect: function(toCal){
        var self = toCal.dateField.up().up().up() ;
        var set_to = new Date(toCal.tempFromTime + self.diff_time) ;

        if ( self.rdo_interval.getCheckedValue()  == 'hour' ){
            self.diff_time = Number(self.cbo_hour.getValue()) * 3600000 ;
        }else{
            self.diff_time = Number(self.cbo_day.getValue()) * 3600000 * 24 ;
        }

        toCal.toCalender.setMaxDate(set_to) ;
        toCal.toCalender.setDate(Ext.util.Format.date(new Date(set_to), 'Y-m-d'));
        toCal.setToTime(new Date(set_to)) ;
    },

    onCalenderValidFn: function(){
        var self = this.up().up().up();
        var set_to = +new Date( this.pickerUI.dateField.mainFromField.getValue()+':00:00' ) + self.diff_time ;
        var datePicker;

        switch(this.itemId){
            case 'second_date':
                datePicker = self.second_date ;
                break ;
            case 'third_date' :
                datePicker = self.third_date ;
                break ;
            default :
                datePicker = self.first_date ;
                break ;
        }

        if ( Comm.Lang == 'ko' ){
            this.date_format = 'Y-m-d H' ;
        } else if( Comm.Lang == 'ja' ){
            this.date_format = 'Y/m/d H' ;
        } else{
            this.date_format = 'm/d/Y H' ;
        }

        datePicker.mainToField.setValue(Ext.util.Format.date( new Date(set_to), this.date_format)) ;
    } ,



    /*
     * 2. 검색구간이 이틀이 넘으면 서머리나 데일리 테이블로 조회.
     //* 1. 첫데이터피커의 타임을 배열로 담는작업도 함 why? 두,세번째의 데이터피커시간조건을 무시하고 차트 그리기위해.
     //*    (쿼리조회는 본래 시간값으로 하고, 그릴때만 조작)
     * */
    get_chart_sql: function( type, date_obj ){

        try{
            var sql_file ;
            var diff1 = +new Date(date_obj.getFromDateTime()+':00:00').setMinutes(0) ;
            var diff2 = +new Date(date_obj.getToDateTime()+':00:00').setMinutes(0) ;

            if ( diff2 - diff1 >= 86400000 ){
                if ( type == 'agent' ){
                    sql_file = 'IMXPA_ComparisonTrend_Chart_Agent_daily.sql';
                }
                else {
                    sql_file = 'IMXPA_ComparisonTrend_Chart_GC_daily.sql';
                }
            }else{
                if ( type == 'agent' ){
                    sql_file = 'IMXPA_ComparisonTrend_Chart_Agent.sql';
                }
                else {
                    sql_file = 'IMXPA_ComparisonTrend_Chart_GC.sql';
                }
            }

            return sql_file ;

        }finally{
            diff1 = null ;
            diff2 = null ;
            sql_file = null ;
        }
    } ,


    executeSQL: function(){

        if ( !this.check_valid() ) {
            return;
        }

        this.workArea.getComponent('mid_tab').setActiveTab(0) ;
        this.retrieve_click = true ;
        this.target_chart = null ;
        this.draw_cnt = 0 ;

        var grid3 = this.h_pnl.getComponent('bot_tab_grid3') ;

        if ( this.cbo_cnt.getRawValue() == '2' ){
            grid3.setVisible(false) ;
        }else{
            grid3.setVisible(true) ;
        }


        this.get_chart_data('Agent') ;


        setTimeout(function(){
            this.get_grid_data() ;
        }.bind(this), 300) ;

    } ,


    /*
     * 1. 그리드 데이터 가져오기.
     * 2. 그리드 타이틀변경하기.
     * */
    get_grid_data: function(){
        var serverName, serverId;

        this.h_pnl.loadingMask.show() ;
        // ######## Grid #####################
        var color = ['#2b99f0', '#01cc00', '#e76627'] ;
        for ( var ix = 0; ix < Number(this.cbo_cnt.getRawValue()); ix++ ){
            serverId = this.stand_data[ix][2];
            serverName = Comm.RTComm.getServerNameByID(serverId);
            this.array_grid[ix].up().setTitle(serverName) ;
            this.array_grid[ix].up().up().el.dom.style.borderColor = color[ix] ;

            WS.SQLExec({
                sql_file: 'IMXPA_ComparisonTrend_Grid.sql',
                bind: [{ name: 'fromtime', value: this.stand_data[ix][0], type : SQLBindType.STRING }
                    ,{ name: 'totime', value: this.stand_data[ix][1], type : SQLBindType.STRING }
                    ,{ name: 'was_id', value: this.stand_data[ix][2], type : SQLBindType.INTEGER }]
            }, this.on_grid.bind({
                target: this.array_grid[ix],
                self  : this
            }), this);
        }

        ix = null ;
        color = null ;

    } ,

    on_grid: function( header, data ){
        var self = this.self ;
        var jx;

        if(this.isClosed){
            return;
        }

        this.target.clearRows() ;

        if(!common.Util.checkSQLExecValid(header, data)){
            this.target.loadingMask.hide();
            self.h_pnl.loadingMask.hide();

            console.debug('ComparisonTrend-on_grid');
            console.debug(header);
            console.debug(data);
            return;
        }

        for ( jx = 0 ; jx < data.rows.length; jx++ ){
            this.target.addRow( [
                data.rows[jx][0]     //'time'
                ,data.rows[jx][1]    //'txn'
                ,data.rows[jx][2]    //'txn_id'
                ,data.rows[jx][3]    //'txn_name'
                ,data.rows[jx][4]    //'txn_exec_count'
                ,data.rows[jx][5]    //'txn_elapse_max'
                ,data.rows[jx][6]    //'txn_elapse_avg'
                ,data.rows[jx][7]    //'sql_elapse_max'
                ,data.rows[jx][8]    //'sql_elapse_avg'
                ,data.rows[jx][9]    //'txn_elapse'
            ] );
        }

        this.target.drawGrid() ;
        this.target.loadingMask.hide() ;

        if ( self.cbo_cnt.getRawValue() == '2' && this.target.itemId == 'grid2' || self.cbo_cnt.getRawValue() == '3' && this.target.itemId == 'grid3'){
            self.h_pnl.loadingMask.hide() ;
        }
    } ,


    /*
     * 3개의 was에 대한 차트쿼리 load.
     * */
    get_chart_data: function( type ){
        var target;

        this.loadingMask.showMask() ;

        if ( type == 'pnl_Agent' ){
            type = 'Agent';
        }else if ( type == 'pnl_GC' ){
            type = 'GC';
        }

        if ( !this.target_chart){
            target = this.array_chart[type] ;
        }else{
            target = [this.target_chart];
        }


        var ix;
        for ( ix = 0 ; ix < target.length; ix++ ){
            target[ix].clearAllSeires() ;
            target[ix].plotDraw() ;
        }

        if ( type.toLowerCase().indexOf('agent') >= 0 ){
            type = 'agent';
        }
        else{
            type = 'gc';
        }

        //이틀부터는 daily테이블로 조회.
        var sql_file = this.get_chart_sql( type, this.first_date ) ;

        // ######## Chart #####################

        for ( ix = 0; ix < Number(this.cbo_cnt.getRawValue()); ix++ ){

            //단순히 따로 날려주기 위한 %연산.
            if ( ix % 2 == 0 ){
                WS2.SQLExec({
                    sql_file: sql_file,
                    bind: [{ name: 'fromtime', value: this.stand_data[ix][0], type: SQLBindType.STRING }
                        ,{ name: 'totime', value: this.stand_data[ix][1], type: SQLBindType.STRING }
                        ,{ name: 'was_id', value: this.stand_data[ix][2], type: SQLBindType.INTEGER }]
                }, this.on_chart.bind({
                    series_idx: ix,
                    target    : target,
                    self      : this,
                    type      : type
                }), this);
            }else{
                WS.SQLExec({
                    sql_file: sql_file,
                    bind: [{ name: 'fromtime', value: this.stand_data[ix][0], type: SQLBindType.STRING }
                        ,{ name: 'totime', value: this.stand_data[ix][1], type: SQLBindType.STRING }
                        ,{ name: 'was_id', value: this.stand_data[ix][2], type: SQLBindType.INTEGER }]
                }, this.on_chart.bind({
                    series_idx: ix,
                    target    : target,
                    self      : this,
                    type      : type
                }), this);
            }
        }


        ix = null ;
        sql_file = null ;
        target = null ;
    } ,


    on_chart: function( header, data ){
        var self = this.self ;
        var stat_list ;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            self.loadingMask.hide();

            console.debug('ComparisonTrend-on_chart');
            console.debug(header);
            console.debug(data);
            return;
        }

        if(data.rows.length == 0){
            self.loadingMask.hide();
            return;
        }

        if ( this.type == 'agent' ){
            stat_list = self.was_stat_alias ;
        }else{
            stat_list = self.gc_stat_alias ;
        }

        try{
            var cht_cnt;
            var ix = 0, jx = 0 ;
            var data_idx ;
            var series_id ;
            var arr_store  = {} ;
            var from_time, to_time, interval;
            var comboCnt = self.cbo_cnt.getRawValue();

            self.draw_cnt++ ;

            for ( cht_cnt = 0 ; cht_cnt < this.target.length; cht_cnt++ ){
                if(comboCnt < 3){
                    this.target[cht_cnt].setSeriesVisible(2, false);
                    this.target[cht_cnt].setSeriesLegendVisible(2, false);
                }

                if ( !arr_store[this.target[cht_cnt].stat_id]){
                    arr_store[this.target[cht_cnt].stat_id] = [] ;
                }

                for ( ix = 0 ; ix < data.columns.length; ix++ ){
                    //data index matching
                    data_idx = stat_list.indexOf( data.columns[ix].toLowerCase() ) ;
                    if( this.target[cht_cnt].stat_id !== data.columns[ix].toLowerCase() || data_idx == -1){
                        continue ;
                    }

                    data_idx += 2 ;
                    for ( jx = 0 ; jx < data.rows.length; jx++ ){
                        arr_store[this.target[cht_cnt].stat_id].push( [ data.rows[jx][0], data.rows[jx][data_idx] ] ) ;
                    }
                }

                //series matching
                switch ( this.series_idx ){
                    case 0:
                        series_id = 'mid_cht0' ;
                        break ;
                    case 1:
                        series_id = 'mid_cht1' ;
                        break ;
                    case 2:
                        series_id = 'mid_cht2' ;
                        this.target[cht_cnt].setSeriesVisible(2, true);
                        this.target[cht_cnt].setSeriesLegendVisible(2, true);
                        break ;
                    default :
                        break;
                }

                from_time = +new Date(header.parameters.bind[0].value);
                to_time = +new Date(header.parameters.bind[1].value) + 1000;

                if(common.Util.getBetweenDate(to_time, from_time)){
                    interval = PlotChart.time.exHour;
                }
                else{
                    interval = PlotChart.time.exMin;
                }

                this.target[cht_cnt].interval = interval;
                this.target[cht_cnt].addIndexValues([{
                    from  : header.parameters.bind[0].value,
                    to    : header.parameters.bind[1].value,
                    interval : interval,
                    time  : 0,
                    data  : arr_store[this.target[cht_cnt].stat_id],
                    series: series_id
                }]) ;
                this.target[cht_cnt].plotDraw() ;
                this.target[cht_cnt].loadingMask.hide() ;
            }
        }catch(e){
            self.loadingMask.hide() ;
            console.debug(e.message);
        }finally{
            if ( self.cbo_cnt.getRawValue() == self.draw_cnt ){
                self.loadingMask.hide() ;
                self.draw_cnt = 0;
            }

            ix        = null ;
            data_idx  = null ;
            arr_store = null ;
            stat_list = null ;
        }
    } ,

    check_valid: function(){

        var first_obj;
        var second_obj;
        var third_obj;

        try{
            switch( this.cbo_condition.getValue() ){

                //1. 기준이 에이전트라면,
                case '1':

                    if(!this.was_combo.checkValid()){
                        return false;
                    }

                    first_obj  = this.first_date.getFromDateTime() ;
                    second_obj = this.second_date.getFromDateTime() ;
                    third_obj  = this.third_date.getFromDateTime() ;


                    this.stand_data[0] = [ Ext.util.Format.date( this.first_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.first_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , this.was_combo.getValue()
                    ] ;
                    this.stand_data[1] = [ Ext.util.Format.date( this.second_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.second_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , this.was_combo.getValue()
                    ] ;
                    this.stand_data[2] = [ Ext.util.Format.date(  this.third_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.third_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , this.was_combo.getValue()
                    ] ;


                    break ;


                //2. 기준이 시간이라면,
                //-1.건수가 2개 or 3개
                case '2':

                    if(!this.was_combo.checkValid() || !this.second_was_combo.checkValid() || !this.third_was_combo.checkValid()){
                        return false;
                    }

                    first_obj  = this.was_combo.getValue() ;
                    second_obj = this.second_was_combo.getValue() ;
                    third_obj  = this.third_was_combo.getValue() ;

                    this.stand_data[0] = [ Ext.util.Format.date( this.first_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.first_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , this.was_combo.getValue()
                    ] ;
                    this.stand_data[1] = [ Ext.util.Format.date( this.first_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.first_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , this.second_was_combo.getValue()
                    ] ;
                    this.stand_data[2] = [ Ext.util.Format.date(  this.first_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.first_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , this.third_was_combo.getValue()
                    ] ;

                    break ;



                //3. 기준이 복합이라면,
                //얘는 여기서 검사하고 리턴.
                case '3':

                    if(!this.was_combo.checkValid() || !this.second_was_combo.checkValid() || !this.third_was_combo.checkValid()){
                        return false;
                    }

                    var first_was   = this.was_combo.getValue() ;
                    var second_was  = this.second_was_combo.getValue() ;
                    var third_was   = this.third_was_combo.getValue() ;

                    var first_time  = this.first_date.getFromDateTime() ;
                    var second_time = this.second_date.getFromDateTime() ;
                    var third_time  = this.third_date.getFromDateTime() ;


                    this.stand_data[0] = [ Ext.util.Format.date( this.first_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.first_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , first_was
                    ] ;
                    this.stand_data[1] = [ Ext.util.Format.date( this.second_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.second_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , second_was
                    ] ;
                    this.stand_data[2] = [ Ext.util.Format.date(  this.third_date.getFromDateTime()+':00:00', 'Y-m-d H:00:00')
                        , Ext.util.Format.date( new Date(+new Date(this.third_date.getToDateTime()+':00:00')- 3600000), 'Y-m-d H:59:59')
                        , third_was
                    ] ;



                    //갯수 2
                    if ( this.cbo_cnt.getValue() == '1' ){

                        if ( first_time == second_time && first_was == second_was ){
                            this.show_message('The duplicate comparison') ;
                            return false ;
                        }

                    }else {
                        //갯수 3
                        if (
                            ( first_time == second_time && first_was == second_was )
                            || ( second_time == third_time && second_was == third_was )
                            || ( third_time == first_time && third_was == first_was )
                        ){
                            this.show_message('The duplicate comparison');
                            return false ;
                        }
                    }

                    first_was  = null ;
                    second_was = null ;
                    third_was  = null ;

                    return true ;

                default :
                    break;
            }

            //갯수 2
            if ( this.cbo_cnt.getValue() == '1' ){

                if ( first_obj == second_obj ){
                    this.show_message('The duplicate comparison') ;
                    return false ;
                }
                else{
                    return true ;
                }

            }else {

                //갯수 3
                if (( first_obj == second_obj && first_was == second_was )
                    || ( second_obj == third_obj && second_was == third_was )
                    || ( third_obj == first_obj && third_was == first_was ) ){

                    this.show_message('The duplicate comparison');
                    return false ;
                }
                else{
                    return true ;
                }

            }

        }finally{

            first_obj  = null ;
            second_obj = null ;
            third_obj  = null ;

        }

    } ,

    show_message: function(_msg){
        common.Util.showMessage( common.Util.TR('Warning'), common.Util.TR(_msg),
            Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

            }.bind(this));
    } ,


    init: function(){

        this.retrieve_click = false ;
        this.diff_time = 3600000 ;
        //2 or 3
        this.draw_cnt = 0 ;

        if ( Comm.Lang == 'ko' ){
            this.date_format = 'Y-m-d H' ;
        } else if( Comm.Lang == 'ja' ){
            this.date_format = 'Y/m/d H' ;
        } else{
            this.date_format = 'm/d/Y H' ;
        }

        this.stand_data = {
            0: [],
            1: [],
            2: []
        } ;

        this.all_stat_list = {
            Stat : [] ,
            GC   : []
        } ;

        this.stat_name_list = {
            Stat: [],
            GC  : []
        } ;
        this.target_chart = null ;

        this.was_stat = [
            'Concurrent Users' //was_session
            //,'Queue'           //app_session
            ,'Active Transactions'
            //,'Total DB Connections'
            //,'Active DB Connections'
            ,'SQL Execute Count'
            ,'SQL Elapse Time' //게더생성후-daily에서만_에러날거임.컬럼이없음.
            //,'SQL Prepare Count'
            ,'SQL Fetch Count'
            ,'JVM CPU Usage (%)'
            ,'JVM Free Heap (MB)'
            //,'JVM Heap Size (MB)'
            ,'JVM Used Heap (MB)'
            //,'JVM Memory Size (MB)'
            ,'JVM Thread Count'
            ,'OS CPU (%)'
            ,'TPS'
            //,'OS CPU Sys (%)'
            //,'OS CPU User (%)'
            //,'OS CPU IO (%)'
            ,'OS Free Memory (MB)'
            //,'OS Total Memory (MB)'
            //,'OS Send Packets'
            //,'OS Rcv Packets'
            ,'Active Users'
            ,'Elapse Time'
        ]  ;

        this.was_stat_alias = [
            'was_sessions'
            //,'app_sessions'
            ,'active_txns'
            //,'db_sessions'
            //,'active_db_sessions'
            ,'sql_exec_count'
            ,'sql_elapse'
            //,'sql_prepare_count'
            ,'sql_fetch_count'
            ,'jvm_cpu_usage'
            ,'jvm_free_heap'
            //,'jvm_heap_size'
            ,'jvm_used_heap'
            //,'jvm_mem_size'
            ,'jvm_thread_count'
            ,'os_cpu'
            ,'tps'
            //,'os_cpu_sys'
            //,'os_cpu_user'
            //,'os_cpu_io'
            ,'os_free_memory'
            //,'os_total_memory'
            //,'os_send_packets'
            //,'os_rcv_packets'
            ,'active_users'
            ,'txn_elapse'
        ] ;



        this.gc_stat = [
            'Compile Count'
            ,'Compile Time (Sec)'
            ,'Class Loaded Count'
            ,'Class Count'
            ,'Class Loader Time (Sec)'
            ,'Eden Space Maximum Size (MB)'
            ,'Eden Current Size (MB)'
            ,'Eden Used Size (MB)'
            ,'Full GC Count'
            ,'Full GC Time (Sec)'
            ,'Old Current Size (MB)'
            ,'Old Maximum Size (MB)'
            ,'Old Used Size (MB)'
            ,'Perm Space Current Size (MB)'
            ,'Perm Space Maximum Size (MB)'
            ,'Perm Space Used Size (MB)'
            ,'Survivor 0 Current Size (MB)'
            ,'Survivor 0 Maximum Size (MB)'
            ,'Survivor 0 Used Size (MB)'
            ,'Survivor 1 Current Size (MB)'
            ,'Survivor 1 Maximum Size (MB)'
            ,'Survivor 1 Used Size (MB)'
            ,'Total GC Count'
            ,'Total GC Time (Sec)'
            ,'Young GC Count'
            ,'Young GC Time (Sec)'
        ] ;


        this.gc_stat_alias = [
            'compiles'
            ,'compile_time'
            ,'loaded'
            ,'class_count'
            ,'class_loader_time'
            ,'eden_size'
            ,'eden_capacity'
            ,'eden_used'
            ,'fgc'
            ,'old_gc_time'
            ,'old_capacity'
            ,'old_size'
            ,'old_used'
            ,'perm_capacity'
            ,'perm_size'
            ,'perm_used'
            ,'s0_capacity'
            ,'s0_size'
            ,'s0_used'
            ,'s1_capacity'
            ,'s1_size'
            ,'s1_used'
            ,'jvm_gc_count'
            ,'jvm_gc_time'
            ,'ygc'
            ,'eden_gc_time'
        ] ;

        this.IDXDB_DEFAULT   = 'Default' ;
        this.IDXDB_STAT      = 'pa_comparison_stat';
        this.IDXDB_STAT_ID   = 'pa_comparison_stat_id';
        this.IDXDB_GC        = 'pa_comparison_gc';
        this.IDXDB_GC_ID     = 'pa_comparison_gc_id';
        this.IDXDB_LAST_TYPE = 'pa_comparison_last_type';
        this.IDXDB_TYPES     = 'pa_comparison_types';


        this.get_stat_name() ;
        this.setWorkAreaLayout('border');


        this.layout_top() ;
        this.layout_condition() ;

        //make statchange
        this.layout_center() ;
        this.title_update( this.array_chart.Agent
            , Comm.web_env_info[ this.IDXDB_STAT+'_'+Comm.web_env_info[this.IDXDB_LAST_TYPE] ]
            , Comm.web_env_info[ this.IDXDB_STAT_ID+'_'+Comm.web_env_info[this.IDXDB_LAST_TYPE] ]
        ) ;
        this.title_update( this.array_chart.GC
            , Comm.web_env_info[ this.IDXDB_GC+'_'+Comm.web_env_info[this.IDXDB_LAST_TYPE] ]
            , Comm.web_env_info[ this.IDXDB_GC_ID+'_'+Comm.web_env_info[this.IDXDB_LAST_TYPE] ]
        ) ;



        this.layout_bot() ;
        this.datePicker.setVisible(false) ;
    } ,


    set_condition: function(){
        var first_stand = this.cbo_condition.getValue() ;
        var second_stand = this.cbo_cnt.getValue() ;

        switch (first_stand){

            case '1':
                //agent
                this.second_was_combo.setDisabled( true ) ;
                this.third_was_combo.setDisabled( true ) ;

                if ( second_stand == 1 ){
                    this.second_date.setDisabled(false) ;
                    this.third_date.setDisabled(true) ;
                }
                else{
                    this.second_date.setDisabled(false) ;
                    this.third_date.setDisabled(false) ;
                }

                break ;
            case '2':
                //time
                this.second_date.setDisabled(true) ;
                this.third_date.setDisabled(true) ;

                if ( second_stand == 1 ){
                    this.second_was_combo.setDisabled( false ) ;
                    this.third_was_combo.setDisabled( true ) ;
                }
                else{
                    this.second_was_combo.setDisabled( false ) ;
                    this.third_was_combo.setDisabled( false ) ;
                }

                break ;
            case '3':
                //agent + time
                this.second_date.setDisabled( false ) ;
                this.second_was_combo.setDisabled( false ) ;

                if ( second_stand == 1 ){
                    this.third_date.setDisabled( true ) ;
                    this.third_was_combo.setDisabled( true ) ;
                }
                else{
                    this.third_date.setDisabled( false ) ;
                    this.third_was_combo.setDisabled( false ) ;
                }

                break ;
            default :
                break ;
        }

        first_stand  = null ;
        second_stand = null ;
    } ,

    layout_top: function(){
        var ix;

        this.cbo_condition = Ext.create('Exem.ComboBox',{
            itemId    : 'cbo_condition',
            fieldLabel: common.Util.TR('Criteria'),
            labelWidth: 70,
            width     : 170,
            y         : 5  ,
            store     : Ext.create('Exem.Store') ,
            editable  : false,
            listeners : {
                scope : this,
                change: function(){
                    var self = this ;

                    if ( self.was_combo == undefined ){
                        return ;
                    }

                    self.set_condition() ;
                }
            }
        }) ;


        this.cbo_condition.addItem('3', common.Util.TR('Agent') + '+' + common.Util.TR('Time')) ;
        this.cbo_condition.addItem('2', common.Util.TR('Time')) ;
        this.cbo_condition.addItem('1', common.Util.TR('Agent')) ;
        this.cbo_condition.selectRow( 0 ) ;
        this.conditionArea.add( this.cbo_condition ) ;



        this.cbo_cnt = Ext.create('Exem.ComboBox', {
            itemId    : 'cbo_condition',
            fieldLabel: common.Util.TR('Count'),
            labelWidth: 70 ,
            width     : 120,
            x         : 150,
            y         : 5  ,
            store     : Ext.create('Exem.Store') ,
            editable  : false,
            listeners : {
                scope : this,
                change: function(){
                    var self = this ;

                    if ( self.was_combo == undefined ){
                        return;
                    }

                    self.set_condition() ;
                }
            }
        }) ;

        this.cbo_cnt.addItem('2', '3') ;
        this.cbo_cnt.addItem('1', '2') ;
        this.cbo_cnt.selectRow( 0 ) ;

        this.rdo_interval = Ext.create('Exem.FieldContainer',{
            itemId         : 'rdo_interval',
            defaultType    : 'radiofield',
            fieldLabel     : common.Util.TR('Interval'),
            //labelAlign     : 'top',
            labelWidth     : 60,
            labelSeparator : '',
            x              : 280,
            y              : 5,
            //columns      : 2,
            //vertical       : true,
            layout         : 'vbox',
            //defaults       : { flex: 1 },
            width          : 80,
            //style          : { //'borderColor': '#d0d0d0',
            // 'borderStyle': 'solid',
            // 'borderRadius': '10px',
            // 'padding': '-5px 0px 0px 0px',
            //  'borderWidth': '1px 1px 1px 1px',
            //  'left': '23px',
            //  'top': '46px',
            //  'width': '500px',
            //  'height': '40px' } ,
            //defaults       : { flex: 1 },
            items          : [{
                width     : 40,
                boxLabel  : common.Util.TR(''),
                name      : this.id + '_interval',
                inputValue: 'hour',
                checked   : true,
                style     : { 'marginTop': '-2px' },
                listeners : {
                    scope  : this,
                    change: function( me, nv ){
                        if ( nv ){
                            this.cbo_day.setDisabled(true) ;
                            this.conditionArea.getComponent('lbl_day').el.dom.style.color = '#cccccc' ;

                            this.cbo_hour.setDisabled(false) ;
                            this.conditionArea.getComponent('lbl_hour').el.dom.style.color = 'black' ;

                            this.diff_time = Number(this.cbo_hour.getValue()) * 3600000 ;
                            this.set_interval() ;
                        }
                    }
                }
            },{
                boxLabel  : common.Util.TR(''),
                name      : this.id + '_interval',
                inputValue: 'day',
                style     : { 'marginTop': '0px' },
                listeners : {
                    scope  : this,
                    change: function( me, nv){
                        if ( nv ){
                            this.cbo_hour.setDisabled(true) ;
                            this.conditionArea.getComponent('lbl_hour').el.dom.style.color = '#cccccc' ;

                            this.cbo_day.setDisabled(false) ;
                            this.conditionArea.getComponent('lbl_day').el.dom.style.color = 'black' ;

                            this.diff_time = Number(this.cbo_day.getValue()) * 3600000 * 24 ;
                            this.set_interval() ;
                        }

                    }
                }
            }]
        }) ;

        this.cbo_hour = Ext.create('Exem.ComboBox',{
            itemId    : 'cbo_hour',
            fieldLabel: '',//common.Util.TR('hour'),
            //labelAlign: 'right',
            //labelWidth: 50,
            width     : 90,
            x         : 367,
            y         : 5,
            store     : Ext.create('Exem.Store'),
            editable  : false ,
            listeners : {
                scope : this,
                change: function(){

                    if ( this.rdo_interval.getCheckedValue()  == 'hour'){
                        this.diff_time = Number(this.cbo_hour.getValue()) * 3600000 ;
                    }
                    else{
                        this.diff_time = Number(this.cbo_day.getValue()) * 3600000 * 24 ;
                    }

                    if ( this.second_date == undefined ){
                        return;
                    }

                    this.set_interval() ;
                }
            }
        }) ;

        var lbl_hour = Ext.create('Ext.form.Label',{
            itemId: 'lbl_hour',
            text  : common.Util.TR('Hour'),
            x     : 383,
            y     : 8
        }) ;


        for ( ix = 24 ; ix > 0 ; ix-- ){
            this.cbo_hour.addItem( ix.toString(), ix.toString() ) ;
        }
        this.cbo_hour.selectRow(0) ;

        this.cbo_day = Ext.create('Exem.ComboBox',{
            itemId    : 'cbo_day',
            fieldLabel: '',//common.Util.TR('hour'),
            width     : 90,
            x         : 367,
            y         : 32,
            store     : Ext.create('Exem.Store'),
            editable  : false ,
            listeners : {
                scope : this,
                change: function(){
                    if ( this.rdo_interval.getCheckedValue()  == 'hour'){
                        this.diff_time = Number(this.cbo_hour.getValue()) * 3600000 ;
                    }
                    else{
                        this.diff_time = Number(this.cbo_day.getValue()) * 3600000 * 24 ;
                    }

                    if ( this.second_date == undefined ){
                        return;
                    }

                    this.set_interval() ;
                }
            }
        }) ;

        var lbl_day = Ext.create('Ext.form.Label',{
            itemId: 'lbl_day',
            text  : common.Util.TR('Day'),
            x     : 383,
            y     : 35
        }) ;

        for ( ix = 31 ; ix > 0 ; ix-- ){
            this.cbo_day.addItem( ix.toString(), ix.toString() ) ;
        }

        this.cbo_day.selectRow(0) ;

        this.conditionArea.add( this.cbo_condition, this.cbo_cnt, this.rdo_interval, this.cbo_hour, lbl_hour, this.cbo_day, lbl_day ) ;
        this.cbo_day.setDisabled(true) ;

        lbl_day.el.dom.style.color = '#cccccc' ;

        ix = null ;
        lbl_hour = null ;
        lbl_day = null ;

    } ,


    set_interval: function(){

        this.change_interval( this.first_date.mainFromField, this.first_date.mainToField ) ;
        this.change_interval( this.second_date.mainFromField, this.second_date.mainToField ) ;
        this.change_interval( this.third_date.mainFromField, this.third_date.mainToField ) ;

    } ,


    /*
     * 하단 그리드 레이아웃
     * */
    layout_bot: function(){

        //유동적으로 max3개까지 탭이 붙는 컨테이너.
        this.h_pnl = Ext.create('Exem.Container',{
            layout   : 'hbox' ,
            region   : 'south',
            split    : true ,
            height   : '30%',
            flex     : 1
        }) ;


        this.create_grid( 'grid1' ) ;
        this.create_grid( 'grid2' ) ;
        this.create_grid( 'grid3' ) ;

        this.workArea.add( this.h_pnl ) ;
        /**
        //this.set_condition() ;
        //this.h_pnl.add( tab ) ;
        //tab.setActiveTab( 0 ) ;
         **/
    } ,


    /*
     * 중앙 레이아웃
     * */
    layout_center: function(){

        var self = this ;

        var default_stat = [
            'TPS'
            ,'OS CPU(%)'
            ,'JVM Used Heap (MB)'
            ,'Elapsed Time'
        ];

        var default_stat_id = [
            'tps'
            ,'os_cpu'
            ,'jvm_used_heap'
            ,'txn_elapse'
        ];


        var default_gc  = [
            'Total GC Count'
            ,'Total GC Time (Sec)'
            ,'Full GC Count'
            ,'Full GC Time (Sec)'
        ];

        var default_gc_id = [
            'jvm_gc_count'
            ,'jvm_gc_time'
            ,'fgc'
            ,'old_gc_time'
        ];


        var tab = Ext.create('Exem.TabPanel',{
            region   : 'center',
            layout   : 'vbox',
            height   : '40%',
            split    : true ,
            itemId   : 'mid_tab',
            style    : { 'border-radius': '6px' },
            listeners: {
                tabchange: function(_tabPanel, _newCard) {
                    if ( !self.retrieve_click ){
                        return;
                    }

                    if ( common.Util.TR( _newCard.title ) == common.Util.TR('GC') ){
                        self.target_chart = null ;
                        self.draw_cnt = 0 ;
                        self.get_chart_data( 'GC' ) ;
                    }
                }
            }
        }) ;


        var ix = 0 ;
        var jx = 0 ;
        var pnl ;
        var type = ['Agent', 'GC'] ;
        var stat ;
        var stat_id ;
        //-agent, gc 두개컨테이너 생성
        for ( ix = 0 ; ix < 2; ix++ ){

            //기본 지표 선택
            if ( type[ix] == 'Agent' ){
                stat = default_stat ;
                stat_id = default_stat_id ;
            }
            else{
                stat = default_gc ;
                stat_id = default_gc_id ;
            }

            //각각 4개지표가진 차트 생성.
            pnl = Ext.create('Exem.Container',{
                layout : 'vbox',
                flex   : 1,
                padding: '3 0 0 0',
                title  : common.Util.TR( type[ix] ),
                itemId : 'pnl_'+type[ix]
            }) ;
            tab.add(pnl) ;

            for ( jx = 0 ; jx < 4; jx++ ){
                this.create_chart( pnl, type[ix], stat, stat_id, jx ) ;
            }
        }

        this.workArea.add( tab ) ;
        tab.setActiveTab( 0 ) ;

        //stat change
        if ( this.stat_change == undefined || this.stat_change == null ){

            //statchange 미리만들어놓기.
            this.stat_change = Ext.create('view.PerformanceTrendStatChangeWindow',{
                was_id    : this.was_combo.getValue(),
                stat_data : this.all_stat_list,
                useTab: {
                    stat : true,
                    db   : false,//is_visible,
                    wait : false,//is_visible,
                    gc   : true ,
                    pool : false
                },
                okFn: function(type, name, id){
                    console.debug('선택된 타입??', type);
                    console.debug('선택된 이름??', name);
                    console.debug('선택된 아이디??', id);

                    //타이틀 업데이트
                    self.title_update(self.target_chart, name, id);

                    if (!self.retrieve_click || self.retrieve_click == undefined) {
                        return;
                    }
                    //쿼리 재조회
                    self.draw_cnt = 1 ;
                    self.get_chart_data(self.target_chart.chart_type) ;
                }
            });
            this.stat_change.init();


            setTimeout(function(){
                if(this.isClosed){
                    return;
                }

                this.stat_view                    = Ext.create('view.PerformanceTrendUserDefined');
                this.stat_view.scope              = this;
                this.stat_view.view_name          = 'comparison' ;
                this.stat_view.visible_stat_list  = ['stat', 'gc'] ;
                this.stat_view.db_visible         = false ;
                this.stat_view.wait_visible       = false ;
                this.stat_view.total_stat_list    = this.all_stat_list;
                this.stat_view.curr_active_tab    = this.workArea.getComponent('mid_tab').getActiveTab() ;
                this.stat_view.db_id              = 0 ;
                this.stat_view.init_form();
            }.bind(this), 1000);
        }

        //save stat change
        this.btn_save_stat = Ext.create('Ext.button.Button',{
            text      : common.Util.TR('User Defined'),
            margin    : '2 5 2 0',
            style     : {
                cursor    : 'pointer',
                lineHeight: '18px'
            },
            listeners : {
                click: function() {
                    if (self.stat_view == undefined) {
                        return;
                    }
                    self.stat_view.setTitle( common.Util.TR('User Defined') ) ;
                    self.stat_view.show();
                    self.stat_view.flag_refresh = self.retrieve_click;
                    self.stat_view.load_list_data();
                }
            }
        });
        tab.getTabBar().add({xtype: 'tbspacer', flex: 8});
        tab.getTabBar().add(self.btn_save_stat);

        tab = null ;
        pnl = null ;
        ix = null ;
        stat = null ;
        stat_id = null ;

    } ,


    /*
     * 상단 조건 레이아웃
     * */
    layout_condition: function(){

        var self = this ;

        var y_value = 25 ;
        var color = ['#2b99f0', '#01cc00', '#e76627'] ;
        var con1 ;
        //color container
        for ( var ix = 0 ; ix < 3; ix++ ){
            con1 = Ext.create('Exem.Container',{
                layout: 'fit',
                width : 10,
                height: 10,
                x     : 490,
                y     : (ix*y_value)+10 ,
                style : { 'background': color[ix], 'border-radius': '6px' }
            }) ;
            this.conditionArea.add(con1) ;
        }

        ix      = null ;
        color   = null ;
        con1    = null ;

        this.first_date = Ext.create('Exem.DatePicker', {
            x                : 505,
            y                : 5,
            itemId           : 'first_date',
            width            : 100,
            executeSQL       : this.executeSQL,
            executeScope     : this,
            rangeOneDay      : true,
            DisplayTime      : DisplayTimeMode.H,
            onCalenderValidFn: this.onCalenderValidFn,
            onFromHourSelect : this.onFromHourSelect,
            toCalNotUse      : true,   //toTime쪽달력 사용X
            toFieldEditable  : false,  //readonly기능
            useGoDayButton   : false,  //yesterday,today_사용X
            useRangeOver     : true   //1년후까지_선택가능
            //disableMessage   : common.Util.TR('인터벌 설정에 따라 변동되므로 선택 불가')
        });

        //datepicker
        this.second_date = Ext.create('Exem.DatePicker', {
            x                : 505,
            y                : 30,
            itemId           : 'second_date',
            width            : 100,
            executeSQL       : this.executeSQL,
            executeScope     : this,
            rangeOneDay      : true,
            DisplayTime      : DisplayTimeMode.H,
            onCalenderValidFn: this.onCalenderValidFn,
            onFromHourSelect : this.onFromHourSelect,
            toCalNotUse      : true,   //toTime쪽달력 사용X
            toFieldEditable  : false,  //readonly기능
            useGoDayButton   : false,  //yesterday,today_사용X
            useRangeOver     : true    //1년후까지_선택가능
            //disableMessage   : common.Util.TR('인터벌 설정에 따라 변동되므로 선택 불가')
        });

        this.third_date = Ext.create('Exem.DatePicker', {
            x                : 505,
            y                : 55,
            itemId           : 'third_date',
            width            : 100,
            executeSQL       : this.executeSQL,
            executeScope     : this,
            rangeOneDay      : true,
            DisplayTime      : DisplayTimeMode.H,
            onCalenderValidFn: this.onCalenderValidFn,
            onFromHourSelect : this.onFromHourSelect,
            toCalNotUse      : true ,
            toFieldEditable  : false,  //readonly기능
            useGoDayButton   : false,  //yesterday,today_사용X
            useRangeOver     : true    //1년후까지_선택가능
            //disableMessage   : common.Util.TR('인터벌 설정에 따라 변동되므로 선택 불가')
        });


        //### first_date ###########################################################################
        this.first_date.mainFromField.addListener('keyup', function(){
            var set_to = +new Date(this.getValue()+':00:00') + self.diff_time ;
            if(!set_to){
                self.first_date.mainFromField.setValue(this.lastValue);
            }
            else{
                self.first_date.mainToField.setValue( Ext.util.Format.date( new Date(set_to) , self.date_format) ) ;
            }
        }) ;

        //### second_date ###########################################################################
        this.second_date.mainFromField.addListener('keyup', function(){
            var set_to = +new Date(this.getValue()+':00:00') + self.diff_time ;
            if(!set_to){
                self.second_date.mainFromField.setValue(this.lastValue);
            }
            else{
                self.second_date.mainToField.setValue( Ext.util.Format.date( new Date(set_to) , self.date_format) ) ;
            }
        }) ;

        //### third_date ###########################################################################
        this.third_date.mainFromField.addListener('keyup', function(){
            var set_to = +new Date(this.getValue()+':00:00') + self.diff_time ;
            if(!set_to){
                self.third_date.mainFromField.setValue(this.lastValue);
            }
            else{
                self.third_date.mainToField.setValue( Ext.util.Format.date( new Date(set_to) , self.date_format) ) ;
            }
        }) ;

        this.first_date.mainToField.setDisabled(true) ;
        this.second_date.mainToField.setDisabled(true) ;
        this.third_date.mainToField.setDisabled(true) ;

        this.set_interval() ;

        //was combobox
        this.was_combo = Ext.create('Exem.wasDBComboBox',{
            x               : 730,
            y               : 5,
            comboLabelWidth : 60,
            itemId          : 'wasCombo',
            width           : 400,
            comboWidth      : 240,
            selectType      : common.Util.TR('Agent'),
            addSelectAllItem: false,
            listeners: {
                afterrender: function(){
                    this.WASDBCombobox.addListener('select', function(){

                    }) ;
                }
            }
        }) ;

        this.second_was_combo = Ext.create('Exem.wasDBComboBox',{
            x               : 730,
            y               : 30,
            comboLabelWidth : 60,
            itemId          : 'wasCombo2',
            width           : 400,
            comboWidth      : 240,
            selectType      : common.Util.TR('Agent'),
            addSelectAllItem: false
        }) ;


        this.third_was_combo = Ext.create('Exem.wasDBComboBox',{
            x               : 730,
            y               : 55,
            comboLabelWidth : 60,
            itemId          : 'wasCombo3',
            width           : 400,
            comboWidth      : 240,
            selectType      : common.Util.TR('Agent'),
            addSelectAllItem: false,
            listeners : {
                scope : this,
                afterrender: function(){
                    this.set_condition() ;
                }
            }
        }) ;
        this.conditionArea.add( this.first_date, this.second_date, this.third_date, this.was_combo, this.second_was_combo, this.third_was_combo ) ;


    },


    /*
     * 처음 달력의 인터벌만큼 두,세번째 From값변경 하면 toTime변경해주는 함수.
     * param - datePicker
     * */
    change_interval: function( from, to ){

        if ( this.diff_time == undefined ){
            return;
        }

        var time = +new Date(from.getValue()+':00:00')+this.diff_time ;

        to.setValue( Ext.util.Format.date( new Date(time), this.date_format) ) ;

        time = null ;
    } ,


    /*
     * 차트 생성 함수
     * */
    create_chart: function( parent, type, title, title_id, cht_idx ){


        /*
         * parent  -> pnl(Container)
         * type    -> Agent or GC
         * title   -> Stat List ..
         * id      -> itemId
         * cht_idx -> chart index (0~3)
         * */
        var chart = Ext.create('Exem.chart.CanvasChartLayer',{
            height                       : 50,
            title                        : common.Util.TR( title[cht_idx] ),
            chart_type                   : type,
            stat_title                   : title[cht_idx],
            stat_id                      : title_id[cht_idx],
            itemId                       : type+'_chart_'+cht_idx,
            interval                     : PlotChart.time.exHour,
            titleHeight                  : 17,
            titleWidth                   : 170,
            titleFontSize                : '12px',
            dbclick_info                 : { cb: this.on_chart, scope: this, itemId: type+'_chart_'+cht_idx, idx: cht_idx, chart_type: type },
            //showTitle                    : false,
            showTitle                    : true,
            showLegend                   : true,
            legendWidth                  : 170,
            legendTextAlign              : 'east',
            //showIndicator                : false,
            indicatorLegendFormat        : '%y',
            indicatorLegendAxisTimeFormat: '%H:%M',
            showTooltip                  : true,
            toolTipFormat                : '%x [value:%y] ',
            toolTipTimeFormat            : '%H:%M',
            //mouseSelect                  : false,
            xaxisCurrentToTime           : true,
            onIndexValue                 : true ,
            standardSeries               : 0,
            chartProperty   : {
                yLabelWidth : 55,
                xLabelFont  : {size: 8, color: 'black'},
                yLabelFont  : {size: 8, color: 'black'},
                xaxis       : false,
                mode        : null
            }
        }) ;

        var add_series = function(){
            chart.addSeries({
                label: common.Util.CTR('AVG'),
                id   : 'mid_cht0',
                type : PlotChart.type.exLine,
                color: '#2b99f0'
            });

            chart.addSeries({
                label: common.Util.CTR('AVG'),
                id   : 'mid_cht1',
                type : PlotChart.type.exLine,
                color: '#01cc00'
            });


            chart.addSeries({
                label: common.Util.CTR('AVG'),
                id   : 'mid_cht2',
                hideLegend: true,
                type : PlotChart.type.exLine,
                color: '#e76627'
            });
        } ;

        //chart header click - single stat change form
        chart.titleLayer.on({
            render: {
                fn   : this.title_click ,
                scope: chart,
                style: { cursor: 'pointer' }
            }
        }) ;

        add_series();



        if ( this.array_chart == undefined ){
            this.array_chart = { 'Agent': [], 'GC': [] } ;
            this.array_chart.Agent = [] ;
            this.array_chart.GC = [] ;
        }

        this.array_chart[type].push( chart ) ;
        parent.add( chart ) ;


    } ,


    title_click: function(){


        var el = this.titleLayer.getEl() ;
        var info = this.dbclick_info;

        if ( info == null ){
            return;
        }

        el.scope = info.scope ;
        el.itemId = 'chart'+info.itemId;
        el.cht_idx = info.idx;
        this.titleLayer.getEl().setStyle('cursor', 'pointer') ;

        this.titleLayer.getEl().addListener('click', function(){

            console.debug( info );

            var active_tab   = info.scope.workArea.getComponent('mid_tab').getActiveTab() ;
            var active_pnl   = info.scope.workArea.getComponent('mid_tab').getComponent(active_tab.itemId) ;
            var select_title = active_pnl.getComponent(info.idx).title ;
            var stat_type    = info.scope.find_stat_type( select_title ) ;

            // target_chart는 현재 active되어있는 탭.
            switch ( active_tab.itemId ){
                case 'pnl_Agent':
                    info.scope.target_chart = info.scope.array_chart.Agent[info.idx] ;
                    break ;
                case 'pnl_GC'   :
                    info.scope.target_chart = info.scope.array_chart.GC[info.idx] ;
                    break ;
                default :
                    break;
            }

            info.scope.target_chart = info.scope.array_chart[info.chart_type][info.idx] ;
            info.scope.stat_change.setUseTab(stat_type);
            info.scope.stat_change.selectValue(stat_type, select_title);
        }) ;

    } ,


    /*
     * 그리드 생성 함수
     * */
    create_grid: function( id ){

        /*
         * id -> itemId
         * */


        var tab = Ext.create('Exem.TabPanel',{
            layout   : 'fit',
            flex     : 1,
            height   : '100%',
            itemId   : 'bot_tab_'+id,
            style    : { 'border-radius': '6px', 'border-style': 'solid', 'border-width': '2px' }
        }) ;

        var con = Ext.create('Exem.Panel',{
            // executeSQL동작에서 setTitle로 변경함.
            title   : common.Util.TR('Agent'),
            layout  : 'fit'

        }) ;
        var grid = Ext.create('Exem.BaseGrid',{
            itemId    : id,
            usePager  : false
            //adjustGrid: true
        }) ;

        con.add( grid ) ;
        tab.add( con ) ;
        grid.beginAddColumns() ;
        grid.addColumn('was_id'                                         , 'time'            , 170, Grid.DateTime, false, true);
        grid.addColumn('was_name'                                       , 'txn'             , 100, Grid.String  , false, true);
        grid.addColumn('txn_id'                                         , 'txn_id'          , 100, Grid.String  , false, true);
        grid.addColumn(common.Util.CTR('Transaction')                   , 'txn_name'        , 100, Grid.String  , true , false);
        grid.addColumn(common.Util.CTR('Transaction Execution Count')   , 'txn_exec_count'  , 100, Grid.Number  , true , false);
        grid.addColumn(common.Util.CTR('Transaction Elapse Time (MAX)') , 'txn_elapse_max'  , 100, Grid.Float   , true , false);
        grid.addColumn(common.Util.CTR('Transaction Elapse Time (AVG)') , 'txn_elapse_avg'  , 100, Grid.Float   , true , false);
        grid.addColumn(common.Util.CTR('SQL Elapse Time (MAX)')         , 'sql_elapse_max'  , 100, Grid.Float   , true , false);
        grid.addColumn(common.Util.CTR('SQL Elapse Time (AVG)')         , 'sql_elapse_avg'  , 100, Grid.Float   , true , false);
        grid.addColumn('txn_elapse'                                     , 'txn_elapse'      , 100, Grid.Float   , false, true);
        grid.endAddColumns() ;

        this.h_pnl.add( tab, { type: 'tbspacer', width: 3 } ) ;
        tab.setActiveTab( 0 ) ;

        if ( this.array_grid == undefined ){
            this.array_grid = [] ;
        }

        this.array_grid.push( grid ) ;

        grid = null ;
        con = null ;
        tab = null ;

    } ,


    /*
     * 차트 타이틀 변경
     * */
    title_update: function( arr_cht, title, id ){
        if(!title || !id){
            return;
        }

        //배열인지 아닌지(StatChange) 체크
        if (!Array.isArray(arr_cht)) {
            arr_cht = [arr_cht];
            title   = [title] ;
            id      = [id] ;
        }


        for (var ix = 0; ix < arr_cht.length; ix++){
            console.debug(ix +'     :::     '+title[ix]);

            arr_cht[ix].up().loadingMask.showMask() ;

            arr_cht[ix].setTitle( common.Util.TR(title[ix]) );
            arr_cht[ix].stat_title = common.Util.TR(title[ix]) ;
            arr_cht[ix].stat_id = common.Util.TR(id[ix]) ;

            arr_cht[ix].up().loadingMask.hide() ;
        }

        ix = null ;

    } ,

    get_stat_name: function(){

        if (this.all_stat_list['Stat'].length == 0){

            for (var ix = 0; ix < this.was_stat.length; ix++)
                this.all_stat_list['Stat'].push({ name: this.was_stat[ix], value: this.was_stat_alias[ix] });

            for (ix = 0; ix < this.gc_stat.length; ix++)
                this.all_stat_list['GC'].push({ name: this.gc_stat[ix], value: this.gc_stat_alias[ix] });

            ix = null;
        }
    },

    find_stat_type: function(title){

        try{
            var ix = 0;
            var result;

            for (ix = 0; ix < this.all_stat_list['Stat'].length; ix++) {
                if ( common.Util.TR(this.all_stat_list['Stat'][ix].name ) == common.Util.TR(title)) {
                    result = TrendStatChange.stat;
                    break;
                }
            }

            for (ix = 0; ix < this.all_stat_list['GC'].length; ix++) {
                if ( common.Util.TR(this.all_stat_list['GC'][ix].name) == common.Util.TR(title)) {
                    result = TrendStatChange.gc;
                    break;
                }
            }

            return result;

        }finally{
            ix = null;
        }

    }
});