Ext.define("view.PerformanceTrend",{
    extend: "Exem.FormOnCondition",
    width: "100%",
    height: "100%",
    rangeOnly  : true,
    singeField : false,
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql : {
        set_db         : 'IMXPA_PerformanceTrend_Set_DB.sql',
        set_pool       : 'IMXPA_PerformanceTrend_StatChange_pool.sql',    //이름은 set_pool이지만 statchange에쓰인다.
        stat_change_s  : 'IMXPA_DBTrend_StatChange_s.sql',
        stat_change_w  : 'IMXPA_DBTrend_StatChange_w.sql',


        top_active     : 'IMXPA_PerformanceTrend_Top_Active.sql',
        mid_was        : 'IMXPA_PerformanceTrend_Mid_WAS.sql',

        mid_db         : 'IMXPA_PerformanceTrend_Mid_DB.sql',
        mid_db_os      : 'IMXPA_PerformanceTrend_Mid_DB_OS.sql',
        mid_wait       : 'IMXPA_PerformanceTrend_Mid_WAIT.sql',
        mid_wait_latch : 'IMXPA_PerformanceTrend_Mid_WAIT_Latch.sql',
        mid_os         : 'IMXPA_PerformanceTrend_Mid_OS.sql',
        mid_lock       : 'IMXPA_PerformanceTrend_Mid_Lock.sql',
        mid_gc         : 'IMXPA_PerformanceTrend_Mid_GC.sql',
        mid_pool       : 'IMXPA_PerformanceTrend_PoolInfo.sql',
        bot_active     : 'IMXPA_PerformanceTrend_Bot_Active.sql',
        bot_process    : 'IMXPA_PerformanceTrend_Bot_Process.sql',
        bot_active_sum : 'IMXPA_PerformanceTrend_Bot_Active_Sum.sql',

        mid_sec        : 'IMXPA_PerformanceTrend_Sec_Lock.sql',
        bot_sec        : 'IMXPA_PerformanceTrend_Sec_Active.sql'

        //BindList       : 'IMXPA_TOPTransaction_BindSQL.sql'
    } ,


    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
            this.stat_change.destroy();
            if(this.chart_view_frm){
                this.chart_view_frm.destroy();
            }

            this.chart_active.clearDependentChart();
            Ext.destroy(this.move_form);
            this.brush.destroy();
        }
    },

    checkValid: function(){
          return this.wasCombo.checkValid();
    },

    init: function(){
        var self = this;


        self.conditionRetrieveArea.items.items[0].setDisabled( true ) ;

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
            default:
                break;
        }

        self.IDXDB_DEFAULT   = 'Default' ;
        self.IDXDB_STAT      = 'pa_performance_trend_stat';
        self.IDXDB_DB        = 'pa_performance_trend_db';
        self.IDXDB_WAIT      = 'pa_performance_trend_wait';
        self.IDXDB_GC        = 'pa_performance_trend_gc';
        self.IDXDB_LAST_TYPE = 'pa_performance_trend_last_type';
        self.IDXDB_TYPES     = 'pa_performance_trend_types';
        self.IDXBUILD_NUM    = 'pa_build_num';


        self.default_stat = [ 'Concurrent Users'
            ,'Queue'
            ,'JVM Free Heap (MB)'
            ,'OS CPU (%)'
        ];

        self.default_stat_id = [  'was_sessions'
            ,'app_sessions'
            ,'jvm_free_heap'
            ,'os_cpu'
        ];

        self.default_db = [  'active sessions'
            ,'CPU Usage'
            ,'physical reads'
            ,'execute count'
        ];

        self.default_wait = [ 'Latch Wait Time (Total)'
            ,'db file sequential read'
            ,'db file scattered read'
            ,'library cache pin'
        ] ;

        self.default_gc  = [  'Total GC Count'
            ,'Total GC Time (Sec)'
            ,'Full GC Count'
            ,'Full GC Time (Sec)'
        ];

        self.default_gc_id = [    'jvm_gc_count'
            ,'jvm_gc_time'
            ,'ygc'
            ,'eden_gc_time'
        ];

        self.was_stat = [
            'Concurrent Users'
            ,'Queue'
            ,'Active Transactions'
            ,'Total DB Connections'
            ,'Active DB Connections'
            ,'SQL Elapse Time'
            ,'SQL Execute Count'
            ,'SQL Prepare Count'
            ,'SQL Fetch Count'
            ,'JVM CPU Usage (%)'
            ,'JVM Free Heap (MB)'
            ,'JVM Heap Size (MB)'
            ,'JVM Used Heap (MB)'
            ,'JVM Memory Size (MB)'
            ,'JVM Thread Count'
            ,'OS CPU (%)'
            ,'TPS'
            ,'OS CPU Sys (%)'
            ,'OS CPU User (%)'
            ,'OS CPU IO (%)'
            ,'OS Free Memory (MB)'
            ,'OS Total Memory (MB)'
            ,'OS Send Packets'
            ,'OS Rcv Packets'
            ,'Active Users'
            ,'Elapse Time'
        ]  ;

        self.was_stat_alias = [
            'was_sessions'
            ,'app_sessions'
            ,'active_txns'
            ,'db_sessions'
            ,'active_db_sessions'
            ,'sql_elapse'
            ,'sql_exec_count'
            ,'sql_prepare_count'
            ,'sql_fetch_count'
            ,'jvm_cpu_usage'
            ,'jvm_free_heap'
            ,'jvm_heap_size'
            ,'jvm_used_heap'
            ,'jvm_mem_size'
            ,'jvm_thread_count'
            ,'os_cpu'
            ,'tps'
            ,'os_cpu_sys'
            ,'os_cpu_user'
            ,'os_cpu_io'
            ,'os_free_memory'
            ,'os_total_memory'
            ,'os_send_packets'
            ,'os_rcv_packets'
            ,'active_client_ip'
            ,'txn_elapse'
        ] ;


        self.gc_stat = [
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


        self.gc_stat_alias = [
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


        self.all_stat_list = {
            Stat : null ,
            DB   : null,
            Wait : null,
            GC   : null,
            Pool : null
        } ;

        self.stat_name_list = {
            Stat: null,
            DB  : null,
            Wait: null,
            GC  : null,
            Pool: null
        } ;

        self.move_pos = {
            x: 0,
            y: 0
        } ;

        self.curr_sec = {
            active: null ,
            lock  : null
        } ;

        self.curr_sec_frm = {
            active: null,
            lock  : null
        } ;

        self.flag_list = {
            flag_top_active : false,
            flag_zoom     : {
                mid_db        : false,
                //mid_db_os     : false,
                mid_wait      : false,
                //mid_wait_latch: false,
                mid_os        : false,
                mid_gc        : false
            } ,

            flag_refresh  : false ,
            flag_execute  : false ,

            flag_was         : false ,
            flag_db          : false ,
            flag_wait        : false ,
            flag_os          : false ,
            flag_locktree    : false ,
            flag_gc          : false ,

            flag_active      : false ,
            flag_process     : false ,
            flag_active_sum  : false ,

            flag_first_collapsed : false
        } ;

        self.gridInitFlag = {
            lockTree : false,
            'grd_process' : false,
            'grd_active_sum' : false
        };

        self.click_time   = null ;
        self.target_chart = null ;
        self.zoom_mode    = null;
        self.lock_info_sec= null;

        self.zoom_mode = false;

        self.all_stat_list.Stat = [];
        self.all_stat_list.DB   = [];
        self.all_stat_list.Wait = [];
        self.all_stat_list.GC   = [];
        self.all_stat_list.Pool = [];

        self.stat_name_list.Stat = [];
        self.stat_name_list.DB   = [];
        self.stat_name_list.Wait = [];
        self.stat_name_list.GC   = [];
        self.stat_name_list.Pool = [];

        self.curr_sec.active     = [];
        self.curr_sec.lock       = [];
        self.curr_sec_frm.active = [];
        self.curr_sec_frm.lock   = [];


        self.config_type = Comm.web_env_info[self.IDXDB_LAST_TYPE];

        self.wasCombo = Ext.create('Exem.wasDBComboBox',{
            x : 350,  y: 5,
            labelWidth : 60,
            itemId     : 'wasCombo',
            comboLabelWidth : 60,
            width           : 400,
            comboWidth      : 210,
            selectType : common.Util.TR('Agent'),
            multiSelect: false,
            addSelectAllItem: false,
            listeners  : {
                afterrender: function(){
                    this.WASDBCombobox.addListener('select', function(){
                        self.get_db_value(this.getValue());
                    });
                },
                render: function(){
                    self.get_db_value(this.getValue());
                }
            }
        });
        self.conditionArea.add(self.wasCombo);
        self.wasCombo.init();

        self.dbCombo = Ext.create('Exem.AjaxComboBox',{
            fieldLabel: common.Util.TR('DB'),
            width : 200,
            labelWidth: 14,
            itemId: 'dbCombo',
            multiSelect: false,
            forceSelection: true,
            x : 570,
            y : 5,
            data : [],
            enableKeyEvents: true,
            listeners : {
                blur : function() {
                    var tmpArray = self.dbCombo.data;
                    var isFind = false;
                    for(var ix=0; ix<tmpArray.length; ix++) {
                        if(tmpArray[ix].name == self.dbCombo.getRawValue()) {
                            isFind = true;
                        }
                    }
                    if(!isFind) {
                        self.showMessage(
                            common.Util.TR('ERROR'),
                            common.Util.TR('The %1 name is invalid', this.fieldLabel),
                            Ext.Msg.OK,
                            Ext.MessageBox.ERROR,
                            null
                        );
                    }
                },
                change : function() {
                    if(self.dbCombo.getRawValue() == "" && self.dbCombo.data.length == 1) {
                        self.dbCombo.setRawValue(self.dbCombo.data[0].name);
                    }
                }
            }
        });
        self.conditionArea.add(self.dbCombo);

        // MaxGauge 연계 기능 체크. 사용하는 경우 Context Menu 에 연계 메뉴를 추가함.
        var isEnableMaxGaugeLink = Comm.RTComm.isMaxGaugeLink();

        if (isEnableMaxGaugeLink) {
            self.openMxg = Ext.create('Ext.container.Container', {
                x      : 777,
                y      : 8,
                html  : '<div class="trend-open-icon" title="' + common.Util.TR('MaxGauge for Oracle - Performance Trend') + '"/>',
                listeners: {
                    scope: self,
                    render : function(me) {
                        me.el.on( 'click', function() {
                            var dbId     = self.dbCombo.getValue();
                            if (dbId) {
                                var fromTime = common.Util.getDate(self.datePicker.getFromDateTime());
                                var toTime   = common.Util.getDate(self.datePicker.getToDateTime());
                                Comm.RTComm.openMaxGaugePerformanceTrend(dbId, fromTime, toTime);
                            }
                        }, this);
                    }
                }
            });
            self.conditionArea.add(self.openMxg);
        }

        self.btnArea = Ext.create('Exem.Container', {
            layout: 'hbox',
            width : 130,
            height: 20,
            x     : 800,
            y     : 10
        });
        self.conditionArea.add(self.btnArea);


        self.btn_move  = self.set_btn('btn_move' ,  'moveTimeOFF'   , 31);
        self.btn_first = self.set_btn('btn_first',  'firstLeftOFF'  , 21);
        self.btn_prev  = self.set_btn('btn_prev' ,  'leftMoveOFF'   , 21);
        self.btn_next  = self.set_btn('btn_next' ,  'rightMoveOFF'  , 21);
        self.btn_last  = self.set_btn('btn_last' ,  'firstRightOFF' , 21);


        //time label
        self.lbl_time = Ext.create('Ext.form.Label',{
            itemId: 'lbl_time',
            text  : self.LABEL_FORMAT,
            x     : 950,
            y     : 10 ,
            style : {
                fontSize: '16px'
            }
        });
        self.conditionArea.add(self.lbl_time);


        self.setWorkAreaLayout('border');
        var top_main_pnl = Ext.create('Exem.Container',{
            region : 'north',
            layout : 'vbox',
            split  : true ,
            height : '17%',
            itemId : 'top_main_pnl',
            style  : {
                borderRadius: '0px 0px 6px 6px'
            }
        });

        self.chart_active = self.layout_top();
        //zoom in
        self.chart_brushFrame = Ext.create('Exem.Panel', {
            layout : 'fit',
            height: 20,
            width: '100%',
            border: 1,
            hidden: true,
            itemId: 'chart_brushFrame',
            listeners: {
                changetimerange: function(from, to) {

                    if (!self.chart_active) {
                        return;
                    }

                    if(self.brush.fromTime == from && self.brush.toTime == to){
                        self.chart_active.setZoomStatus(false);
                    }

                    self.chart_active.dependentChartZoomIn(from, to);
                }
            }
        });
        self.brush = Ext.create('Exem.TimeBrush', {
            target: self.chart_brushFrame,
            marginLeft: 75,
            marginRight: 200,
            jumpVisible: false
        });
        self.chart_active.timeBrush = self.brush;
        self.workArea.add(top_main_pnl);
        top_main_pnl.add(self.chart_active);
        top_main_pnl.add(self.chart_brushFrame);


        self.mid_pnl = self.layout_mid(self.workArea);

        self.pnl_stat     = self.set_pnl(self.mid_pnl, common.Util.TR('Agent Stat'   )    , 'pnl_stat'   );
        self.pnl_db       = self.set_pnl(self.mid_pnl, common.Util.TR('DB Stat '   )    , 'pnl_db'     );
        self.pnl_wait     = self.set_pnl(self.mid_pnl, common.Util.TR('DB Wait Stat')   , 'pnl_wait'   );
        self.pnl_os       = self.set_pnl(self.mid_pnl, common.Util.TR('Agent OS Stat')    , 'pnl_os'     );
        self.pnl_locktree = self.set_pnl(self.mid_pnl, common.Util.TR('Lock Tree'  )    , 'pnl_locktree');
        self.pnl_gc       = self.set_pnl(self.mid_pnl, common.Util.TR('GC Stat'    )    , 'pnl_gc'     );

        var stat_chart1 = self.set_chart(self.pnl_stat, 'stat_chart', 0, 'Stat') ,
            stat_chart2 = self.set_chart(self.pnl_stat, 'stat_chart', 1, 'Stat') ,
            stat_chart3 = self.set_chart(self.pnl_stat, 'stat_chart', 2, 'Stat') ,
            stat_chart4 = self.set_chart(self.pnl_stat, 'stat_chart', 3, 'Stat');
        self.arr_stat_chart = [stat_chart1, stat_chart2, stat_chart3, stat_chart4];
        self.pnl_stat.add(self.arr_stat_chart);
        stat_chart1 = null, stat_chart2 = null, stat_chart3 = null, stat_chart4 = null;

        self.stat_name_list.Stat = Comm.web_env_info[self.IDXDB_STAT+'_'+Comm.web_env_info[self.IDXDB_LAST_TYPE]] ;
        self.title_update( self.arr_stat_chart, self.stat_name_list.Stat ) ;

        self.mid_pnl.setActiveTab(0);

        self.workArea.loadingMask.showMask();

        setTimeout(function(){

            var db_chart1 = self.set_chart(self.pnl_db, 'db_chart', 0, 'DB') ,
                db_chart2 = self.set_chart(self.pnl_db, 'db_chart', 1, 'DB') ,
                db_chart3 = self.set_chart(self.pnl_db, 'db_chart', 2, 'DB') ,
                db_chart4 = self.set_chart(self.pnl_db, 'db_chart', 3, 'DB');
            self.arr_db_chart = [db_chart1, db_chart2, db_chart3, db_chart4];
            self.pnl_db.add(self.arr_db_chart);

            var wait_chart1 = self.set_chart(self.pnl_wait, 'wait_chart', 0, 'Wait') ,
                wait_chart2 = self.set_chart(self.pnl_wait, 'wait_chart', 1, 'Wait') ,
                wait_chart3 = self.set_chart(self.pnl_wait, 'wait_chart', 2, 'Wait') ,
                wait_chart4 = self.set_chart(self.pnl_wait, 'wait_chart', 3, 'Wait');
            self.arr_wait_chart = [wait_chart1, wait_chart2, wait_chart3, wait_chart4];
            self.pnl_wait.add(self.arr_wait_chart);

            var os_chart1 = self.set_chart(self.pnl_os, 'OS CPU (%)'    , 'os_chart1', 'OS') ,
                os_chart2 = self.set_chart(self.pnl_os, 'OS Memory (MB)', 'os_chart2', 'OS');
            self.arr_os_chart = [os_chart1, os_chart2];
            self.pnl_os.add(self.arr_os_chart);

            self.grd_locktree = Ext.create('Exem.BaseGrid', {
                itemId  : 'grd_locktree',
                gridType: Grid.exTree
            });
            self.pnl_locktree.add(self.grd_locktree);

            self.sec_60_frm('lock');

            //6.gc
            var gc_chart1, gc_chart2, gc_chart3, gc_chart4;

            gc_chart1 = self.set_chart(self.pnl_gc, 'gc_chart', 0, 'GC');
            gc_chart2 = self.set_chart(self.pnl_gc, 'gc_chart', 1, 'GC');
            gc_chart3 = self.set_chart(self.pnl_gc, 'gc_chart', 2, 'GC');
            gc_chart4 = self.set_chart(self.pnl_gc, 'gc_chart', 3, 'GC');

            self.arr_gc_chart = [gc_chart1, gc_chart2, gc_chart3, gc_chart4];
            self.pnl_gc.add(self.arr_gc_chart);

            self.btn_stat_change = Ext.create('Ext.button.Button',{
                text      : common.Util.TR('User Defined'),
                //checked   : false,
                margin    : '2 5 2 0',
                //cls       : 'stat_change_b',
                //cls       : 'button3d',
                style     : {
                    cursor    : 'pointer',
                    lineHeight: '18px'
                },
                listeners : {
                    click: function() {
                        if (!self.chart_view_frm) {
                            return;
                        }
                        self.chart_view_frm.setTitle( common.Util.TR('User Defined') ) ;
                        self.chart_view_frm.show();
                        self.chart_view_frm.flag_refresh = self.flag_list.flag_refresh;
                        self.chart_view_frm.load_list_data();
                    }
                }
            });
            self.mid_pnl.getTabBar().add({xtype: 'tbspacer', flex: 8});
            self.mid_pnl.getTabBar().add(self.btn_stat_change);

            self.bot_pnl = self.layout_bot(self.workArea);

            self.grd_active     = self.set_pnl_grid('Active Session'     , 'pnl_active'    , 'grd_active'   );
            self.grd_process    = self.set_pnl_grid('Process'            , 'pnl_process'   , 'grd_process'  );
            self.grd_active_sum = self.set_pnl_grid('Active Session (SUM)', 'pnl_active_sum', 'grd_active_sum');

            self.addActiveColumns();
            self.sec_60_frm('active');

            self.bot_pnl.getHeader().setVisible(false);
            self.bot_pnl.setActiveTab(0);

            self.call_jump_list(
                self.grd_active
                ,self.dbCombo.getValue()
                ,self.datePicker.getFromDateTime()
                ,self.datePicker.getToDateTime()
            );

            self.call_jump_list(
                self.grd_active_sum
                ,self.dbCombo.getValue()
                ,self.datePicker.getFromDateTime()
                ,self.datePicker.getToDateTime()
            );


            var type = Comm.web_env_info[self.IDXDB_LAST_TYPE] ;

            self.title_update( self.arr_stat_chart, Comm.web_env_info[ self.IDXDB_STAT+'_'+type ] ) ;
            self.title_update( self.arr_db_chart  , Comm.web_env_info[ self.IDXDB_DB+'_'+type ] ) ;
            self.title_update( self.arr_wait_chart, Comm.web_env_info[ self.IDXDB_WAIT+'_'+type ] ) ;
            self.title_update( self.arr_gc_chart  , Comm.web_env_info[ self.IDXDB_GC+'_'+type ] ) ;

            self.get_db_value(self.wasCombo.getValue());
            self.get_stat_name();
            self.init_flag_set();


            stat_chart1 = null ;
            stat_chart2 = null ;
            stat_chart3 = null ;
            stat_chart4 = null ;

            db_chart1 = null ;
            db_chart2 = null ;
            db_chart3 = null ;
            db_chart4 = null ;

            wait_chart1 = null ;
            wait_chart2 = null ;
            wait_chart3 = null ;
            wait_chart4 = null ;

            os_chart1 = null ;
            os_chart2 = null ;

            gc_chart1  = null ;
            gc_chart2  = null ;
            gc_chart3  = null ;
            gc_chart4  = null ;

            type = null ;


            self.conditionRetrieveArea.items.items[0].setDisabled( false ) ;

            // Quick Launcher에서 실행시 화면 구성이 끝났는지 알기 위한 정보.
            self.isEndInitLoad = true;

            self.workArea.loadingMask.hide();

        }, 10);


    },

    addLockTreeColumns: function(){
        var self = this;

        self.grd_locktree.beginAddColumns();
        self.grd_locktree.addColumn(common.Util.CTR('SID'             ) , 'hold_sid'          , 100, Grid.String, true , false , 'treecolumn');
        self.grd_locktree.addColumn(common.Util.CTR('Hold Lock Type'  ) , 'hold_lock_type'    , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Hold Mode'       ) , 'hold_mode'         , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Wait Lock Type'  ) , 'wait_lock_type'    , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Request Mode'    ) , 'req_mode'          , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Wait Object ID'  ) , 'object_id'         , 100, Grid.String, true , false );
        self.grd_locktree.addColumn('Hold DB ID'        , 'hold_db_id'        , 100, Grid.String, false , true );
        self.grd_locktree.addColumn('Wait DB ID'        , 'wait_db_id'        , 100, Grid.String, false , true );
        self.grd_locktree.addColumn('Dead Lock'          , 'dead_lock'         , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn(common.Util.CTR('Agent'             ) , 'was_name'          , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Transaction'     ) , 'txn_name'          , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Class Method'    ) , 'class_method'      , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Client IP'       ) , 'client_ip'         , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Login Name'      ) , 'login_name'        , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Start Time'      ) , 'start_time'        , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('CPU Time'        ) , 'cpu_time'          , 100, Grid.String, true , false );
        self.grd_locktree.addColumn('Elapse Time (AVG)'                 , 'avg_elapse'        , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn(common.Util.CTR('Elapse Time'     ) , 'elapse_time'       , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Thread CPU'      ) , 'thread_cpu'        , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('IO Read'         ) , 'io_read'           , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('IO Write'        ) , 'io_write'          , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('DB Time'         ) , 'db_time'           , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Wait Time'       ) , 'wait_time'         , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Pool'            ) , 'pool_name'         , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Instance'        ) , 'instance_name'     , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('State'           ) , 'state'             , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('SQL 1'           ) , 'sql1'              , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('SQL 2'           ) , 'sql2'              , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('SQL 3'           ) , 'sql3'              , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('SQL 4'           ) , 'sql4'              , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('SQL 5'           ) , 'sql5'              , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('SQL Execution Count') , 'sql_execute_count' , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Fetch Count'     ) , 'fetch_count'       , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Prepare Count'   ) , 'prepare_count'     , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('PGA Usage (MB)'   ) , 'pga'               , 100, Grid.Float, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Logical Reads'   ) , 'logical_reads'     , 100, Grid.String, true , false );
        self.grd_locktree.addColumn(common.Util.CTR('Physical Reads'  ) , 'physical_reads'    , 100, Grid.String, true , false );
        self.grd_locktree.addColumn('WAS ID'            , 'was_id'            , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn(common.Util.CTR('Wait Info'       ) , 'wait_info'         , 100, Grid.String, true , false );
        self.grd_locktree.addColumn('TID'               , 'tid'               , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('Current CRC'       , 'current_crc'       , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('SQL ID1'           , 'sql_id1'           , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('SQL ID2'           , 'sql_id2'           , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('SQL ID3'           , 'sql_id3'           , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('SQL ID4'           , 'sql_id4'           , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('SQL ID5'           , 'sql_id5'           , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('Transaction ID'    , 'txn_id'            , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('Pool ID'           , 'pool_id'           , 100, Grid.String, false, true  );
        self.grd_locktree.addColumn('Time'              , 'time'              , 100, Grid.String, false, true  );
        self.grd_locktree.endAddColumns();
    },

    addActiveColumns: function(){
        var self = this;

        self.grd_active.beginAddColumns();
        self.grd_active.addColumn('Time'                                 , 'time'          , 170, Grid.DateTime     , false, true);
        self.grd_active.addColumn(common.Util.CTR('Agent'              )  , 'was_name'      , 100, Grid.String       , true , false);
        self.grd_active.addColumn('WAS ID'                               , 'was_id'        , 100, Grid.String       , false, true );
        self.grd_active.addColumn(common.Util.CTR('Transaction'        )  , 'txn_name'      , 150, Grid.String       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Class Method'       )  , 'class_method'  , 170, Grid.String       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Method Type'        )  , 'method_type'   , 100, Grid.String       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Client IP'          )  , 'client_ip'     , 130, Grid.String       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Login Name'         )  , 'login_name'    , 70 , Grid.String       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Start Time'         )  , 'start_time'    , 70 , Grid.String       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Elapse Time (AVG)'  )  , 'avg_elapse'    , 70 , Grid.Float        , false, true );
        self.grd_active.addColumn(common.Util.CTR('Transaction CPU TIME')  , 'txn_cpu_time'  , 100, Grid.Float        , true , false);//10
        self.grd_active.addColumn(common.Util.CTR('CPU Time'           )  , 'cpu_time'      , 70 , Grid.Float        , true , false);
        self.grd_active.addColumn(common.Util.CTR('Thread CPU'         )  , 'thread_cpu'    , 70 , Grid.Float        , false , true);
        self.grd_active.addColumn(common.Util.CTR('IO Read'            )  , 'io_read'       , 70 , Grid.Number       , true , false);
        self.grd_active.addColumn(common.Util.CTR('IO Write'           )  , 'io_write'      , 70 , Grid.Number       , true , false);
        self.grd_active.addColumn(common.Util.CTR('DB Time'            )  , 'db_time'       , 70 , Grid.Float        , true , false);
        self.grd_active.addColumn(common.Util.CTR('Wait Time'          )  , 'wait_time'     , 70 , Grid.Float        , false, true );
        self.grd_active.addColumn(common.Util.CTR('Pool'               )  , 'pool_name'     , 70 , Grid.String       , true , false);
        self.grd_active.addColumn('Pool ID'                              , 'pool_id'       , 100, Grid.String       , false, true );
        self.grd_active.addColumn(common.Util.CTR('Elapse Time'        )  , 'elapse_time'   , 70 , Grid.Float        , true , false);
        self.grd_active.addColumn(common.Util.CTR('Instance Name'      )  , 'instance_name' , 70 , Grid.String       , true , false);//20
        self.grd_active.addColumn(common.Util.CTR('SID'                )  , 'sid'           , 100, Grid.StringNumber , true , false);
        self.grd_active.addColumn(common.Util.CTR('State'              )  , 'state'         , 100, Grid.String       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Bind Value'          )  , 'bind_list'     , 200, Grid.String       , true , false);
        self.grd_active.addColumn('SQL ID1'                               , 'sql_id1'       , 500, Grid.String       , false, true );
        self.grd_active.addColumn(common.Util.CTR('SQL 1'               )  , 'sql_text1'     , 70 , Grid.String       , true , false);
        self.grd_active.addColumn('SQL ID2'                               , 'sql_id2'       , 100, Grid.String       , false, true );
        self.grd_active.addColumn(common.Util.CTR('SQL 2'               )  , 'sql_text2'     , 70 , Grid.String       , true , false);
        self.grd_active.addColumn('SQL ID3'                               , 'sql_id3'       , 100, Grid.String       , false, true );
        self.grd_active.addColumn(common.Util.CTR('SQL 3'               )  , 'sql_text3'     , 70 , Grid.String       , true , false);
        self.grd_active.addColumn('SQL ID4'                               , 'sql_id4'       , 100, Grid.String       , false, true );//30
        self.grd_active.addColumn(common.Util.CTR('SQL 4'               )  , 'sql_text4'     , 70 , Grid.String       , true , false);
        self.grd_active.addColumn('SQL ID5'                               , 'sql_id5'       , 100, Grid.String       , false, true );
        self.grd_active.addColumn(common.Util.CTR('SQL 5'               )  , 'sql_text5'     , 70 , Grid.String       , true , false);
        self.grd_active.addColumn(common.Util.CTR('SQL Execution Count'  )  , 'sql_exec_count', 105, Grid.Number       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Fetch Count'        )  , 'fetch_count'   , 70 , Grid.Number       , true , false);
        self.grd_active.addColumn('Current CRC'                           , 'current_crc'   , 70 , Grid.Number       , false , true);
        self.grd_active.addColumn(common.Util.CTR('Prepare Count'      )  , 'prepare_count' , 70 , Grid.Number       , true , false);
        self.grd_active.addColumn('Transaction ID'                        , 'txn_id'        , 70 , Grid.String       , false, true );
        self.grd_active.addColumn(common.Util.CTR('PGA Usage (MB)'     )  , 'mem_usage'     , 100, Grid.Float        , true , false);
        self.grd_active.addColumn(common.Util.CTR('Logical Reads'      )  , 'logical_reads' , 100, Grid.Number       , true , false);//40
        self.grd_active.addColumn(common.Util.CTR('Physical Reads'     )  , 'physical_reads', 100, Grid.Number       , true , false);
        self.grd_active.addColumn(common.Util.CTR('Wait Info'          )  , 'wait_info'     , 100, Grid.String       , true , false);
        self.grd_active.addColumn('TID'                                   , 'tid'           , 100, Grid.String       , true, false );
        self.grd_active.addColumn('Start Time Temp'                       , 'start_time_temp', 70 , Grid.String       , false, true );
        self.grd_active.endAddColumns();
        self.grd_active.loadLayout(self.grd_active.gridName);

        common.WebEnv.setVisibleGridColumn(self.grd_active, ['bind_list'], Comm.config.login.permission.bind !== 1? true : false ) ;
    },

    addActiveProcessColumns: function(){
        var self = this;

        self.grd_process.beginAddColumns();
        self.grd_process.addColumn(common.Util.CTR('Time'              ) , 'time'      , 100, Grid.String      , true , false);
        self.grd_process.addColumn(common.Util.CTR('User Name'         ) , 'user_name' , 100, Grid.String      , true , false);
        self.grd_process.addColumn(common.Util.CTR('PID'               ) , 'pid'       , 100, Grid.StringNumber, true , false);
        self.grd_process.addColumn(common.Util.CTR('CPU'               ) , 'cpu'       , 100, Grid.Number      , true , false);
        self.grd_process.addColumn(common.Util.CTR('Virtual Memory (MB)') , 'vsz'       , 100, Grid.Float       , true , false);
        self.grd_process.addColumn(common.Util.CTR('Real Memory (MB)'  ) , 'rss'       , 100, Grid.Float       , true , false);
        self.grd_process.addColumn(common.Util.CTR('Argument'          ) , 'args'      , 500, Grid.String      , true , false);
        self.grd_process.endAddColumns();
        self.grd_process.loadLayout(self.grd_process.gridName);
    },

    addActiveSumColumns: function(){
        var self = this;

        self.grd_active_sum.beginAddColumns();
        self.grd_active_sum.addColumn(common.Util.CTR('Time'         ) , 'time'              , 130, Grid.DateTime    , true , false);
        self.grd_active_sum.addColumn('WAS ID'         , 'was_id'            , 100, Grid.String      , false, true);
        self.grd_active_sum.addColumn(common.Util.CTR('Agent'          ) , 'was_name'          , 100, Grid.String      , true , false);
        self.grd_active_sum.addColumn('TXN ID'         , 'txn_id'            , 100, Grid.String      , false, true);
        self.grd_active_sum.addColumn(common.Util.CTR('Transaction'  ) , 'txn_name'          , 250, Grid.String      , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Current Method') , 'class_method'      , 250, Grid.String      , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Client IP'    ) , 'client_ip'         , 100, Grid.String      , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Start Time'   ) , 'start_time'        , 130, Grid.DateTime    , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Elapse Time'  ) , 'elapse_time'       , 100, Grid.Float       , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('CPU Time'     ) , 'cpu_time'          , 100, Grid.Float       , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Wait Time'    ) , 'wait_time'         , 100, Grid.String      , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Instance Name') , 'instance_name'     , 100, Grid.String      , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('SID'          ) , 'sid'               , 100, Grid.StringNumber, true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('State'        ) , 'state'             , 100, Grid.String      , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('SQL Execution Count') , 'sql_exec_count'    , 100, Grid.Float       , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Prepare Count') , 'prepare_count'     , 100, Grid.Float       , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Fetch Count'  ) , 'fetch_count'       , 100, Grid.Float       , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('PGA Usage (MB)') , 'mem_usage'         , 100, Grid.Float       , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Logical Reads') , 'logical_reads'     , 100, Grid.String      , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Physical Reads') , 'physical_reads'    , 100, Grid.String      , true , false);
        self.grd_active_sum.addColumn(common.Util.CTR('Wait Info'    ) , 'wait_info'         , 100, Grid.String      , true , false);
        self.grd_active_sum.addColumn('Current CRC'    , 'current_crc'       , 100, Grid.String      , false, true);
        self.grd_active_sum.addColumn('Pool ID'        , 'pool_id'           , 100, Grid.String      , false, true);
        self.grd_active_sum.addColumn('TID'            , 'tid'               , 100, Grid.String      , true, false);
        self.grd_active_sum.endAddColumns();
        self.grd_active_sum.loadLayout(self.grd_active_sum.gridName);
    },

    executeSQL: function(){
        var self = this;

        if (self.isLoading) {
            return;
        }

        self.zoom_mode = false;

        self.init_flag_set();
        self.click_time = self.datePicker.getFromDateTime();

        self.get_top_chart();
        self.set_zoom_chart(self.chart_active);
        self.flag_list.flag_execute = true;
        self.chart_active.setZoomStatus(false);


        setTimeout(function(){
            self.get_mid_chart(self.mid_pnl.getActiveTab().itemId);

            self = null ;
        }, 600);

        self.flag_list.flag_refresh = true;
    },

    set_zoom_chart: function(target){
        target.addDependentChart(this.arr_stat_chart);
    },

    get_top_chart: function(){
        var self = this;

        WS.SQLExec({
            sql_file: self.sql.top_active,
            bind : [{
                name : 'fromtime',
                type : SQLBindType.STRING,
                value: common.Util.getDate(self.datePicker.getFromDateTime())
            },{
                name : 'totime',
                type : SQLBindType.STRING,
                value: common.Util.getDate(self.datePicker.getToDateTime())
            },{
                name : 'was_id',
                type : SQLBindType.INTEGER,
                value: self.wasCombo.getValue()
            }]
        }, self.on_top_data, self);

        self = null;
    },

    get_mid_chart: function(active_tab){
        var self = this ,

            title_list = {
                Stat : [],
                DB   : [],
                Wait : [],
                GC   : [],
                Pool : []
            },
            chart_list = {
                Stat : [],
                DB   : [],
                Wait : [],
                GC   : [],
                Pool : []
            },
            chart_latch_list = { Wait: [] } ,
            chart_os_list = { DB : [] },
        //chart_txn_list = { Stat: [] } ,
            chart_obj ,

            ix = 0 ,
            jx = 0;

        if (active_tab === 'pnl_stat') {
            self.pnl_stat.loadingMask.showMask() ;
            chart_obj = self.arr_stat_chart;
            this.active_tab = self.pnl_stat ;
        } else if (active_tab === 'pnl_db') {
            self.pnl_db.loadingMask.showMask() ;
            chart_obj = self.arr_db_chart;
            this.active_tab = self.pnl_db ;
        } else if (active_tab === 'pnl_wait') {
            self.pnl_wait.loadingMask.showMask() ;
            chart_obj = self.arr_wait_chart;
            this.active_tab = self.pnl_wait ;
        } else if (active_tab === 'pnl_gc') {
            self.pnl_gc.loadingMask.showMask() ;
            chart_obj = self.arr_gc_chart;
            this.active_tab = self.pnl_gc ;
        }

        _.each(['Stat', 'DB', 'Wait', 'GC', 'Pool'], function(d) {
            find_chart_type(chart_obj , self.all_stat_list[d], d);
            call_chart_data(d);
        });

        jx = null;
        ix = null;


        function find_chart_type(cht_obj, list_obj, section_str){
            for (ix = 0; ix < cht_obj.length; ix++){
                for (jx = 0; jx < list_obj.length; jx++){
                    if ( common.Util.CTR( list_obj[jx].name ) !== common.Util.CTR( cht_obj[ix].title) ) {
                        continue;
                    }

                    if ((cht_obj[ix].title === 'CPU Usage')
                        || cht_obj[ix].title === common.Util.CTR( 'free memory') ){
                        chart_os_list[section_str].push(cht_obj[ix]);
                        title_list[section_str].push(cht_obj[ix].title);
                    }else if (cht_obj[ix].title === 'Latch Wait Time (Total)'){
                        chart_latch_list[section_str].push(cht_obj[ix]);
                        title_list[section_str].push(cht_obj[ix].title);
                    }else{
                        chart_list[section_str].push(cht_obj[ix]);
                        title_list[section_str].push(cht_obj[ix].title);
                    }
                }
            }
        }


        function call_chart_data(section_str){
            if (title_list[ section_str ].length > 0){
                self.stat_name_list[ section_str ] = title_list[ section_str ];
                self.executeCount = 0;

                switch (section_str){
                    case 'Stat':
                        self.get_stat(chart_list[section_str]);
                        break;

                    case 'DB':
                        self.get_db(chart_list[section_str], chart_os_list[section_str]);
                        break;

                    case 'Wait':
                        self.get_wait(chart_list[section_str], chart_latch_list[section_str]);
                        break;

                    case 'GC':
                        self.get_gc(chart_list[section_str]);
                        break;

                    case 'Pool':
                        self.get_pool(chart_list[section_str]);
                        break;

                    default :
                        break;
                }
            }
        }

        self = null;
    } ,


    get_active_sec: function(curr_time){
        var self = this;

        var currtime = new Date(curr_time);
        var from     = self.get_minute_time(currtime , 'FROM');
        var to       = self.get_minute_time(currtime , 'TO');

        self.curr_sec['active'].length = 0;
        WS.SQLExec({
            sql_file: self.sql.bot_sec,
            bind: [{ name: 'fromtime', value: from, type: SQLBindType.STRING },
                { name: 'totime', value: to, type: SQLBindType.STRING },
                { name: 'was_id', value: self.wasCombo.getValue(), type: SQLBindType.INTEGER }]
        }, self.on_bot_data, self);

        self = null;
        currtime = null ;
        from = null ;
        to = null ;
    } ,

    get_active_data: function(curr_time){
        var self = this;

        var currtime = new Date(curr_time);
        var from     = self.get_minute_time(currtime , 'FROM');
        var to       = self.get_minute_time(currtime , 'TO');

        WS.SQLExec({
            sql_file: self.sql.bot_active,
            bind: [{ name: 'fromtime', value: from, type: SQLBindType.STRING }
                ,{ name: 'totime', value: to, type: SQLBindType.STRING }
                ,{ name: 'current_time', value: common.Util.getDate(curr_time), type: SQLBindType.STRING }
                , { name: 'was_id', value: self.wasCombo.getValue(), type: SQLBindType.INTEGER }]
        }, self.on_bot_data, self);

        self = null;
        currtime = null ;
        from = null ;
        to = null ;
    },


    //-----------------------------------------------------------------------------------------
    get_process: function(curr_time){
        var self = this;

        var currtime = new Date(curr_time);
        var from = self.get_minute_time(currtime , 'FROM');

        WS.SQLExec({
            sql_file: self.sql.bot_process,
            bind: [{ name: 'fromtime', value: from, type: SQLBindType.STRING }
                ,{ name: 'was_id', value: self.wasCombo.getValue(), type: SQLBindType.INTEGER }
                ,{ name: 'server_type', value: 1, type: SQLBindType.INTEGER }]
        }, self.on_bot_data, self);

        self = null;
        currtime = null ;
        from = null ;
    },


    //-----------------------------------------------------------------------------------------
    get_active_sum: function(curr_time){
        var self = this;

        var currtime = new Date(curr_time);
        var from = self.get_minute_time(currtime , 'FROM') ,
            to = self.get_minute_time(currtime , 'TO');

        WS.SQLExec({
            sql_file: self.sql.bot_active_sum,
            bind: [{ name: 'fromtime', value: from, type: SQLBindType.STRING }
                ,{ name: 'totime'  , value: to, type: SQLBindType.STRING }
                ,{ name: 'was_id'  , value: self.wasCombo.getValue(), type: SQLBindType.INTEGER }]
        }, self.on_bot_data, self);

        self = null;
        currtime = null ;
        from = null ;
        to = null ;
    },


    //-----------------------------------------------------------------------------------------
    on_top_data: function(header, data){
        var self = this;
        var param = header.parameters;
        var parameter = {};
        var series_data = {};
        var data_idx = 1;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.error('PerformaceTrend-on_top_data');
            console.error(header);
            console.error(data);
            return;
        }

        self.chart_active.clearValues();

        if(data.rows.length != 0){
            parameter.from = param.bind[0].value;
            parameter.to  = param.bind[1].value;
            parameter.time = 0;
            parameter.data = data.rows;

            for ( var jx = 0; jx < self.chart_active.serieseList.length; jx++){
                series_data[jx] = data_idx++;
            }

            parameter.series = series_data;

            self.chart_active.addValues(parameter);
            self.chart_brushFrame.show();
        }
        else{
            self.chart_brushFrame.hide();
        }

        self.chart_active.plotDraw();

        if(self.chart_active.maxOffSet.seriesIndex != undefined){
            self.get_topchart_max_value();
        }

        self = null;
        param = null ;
        parameter = null ;
        series_data = null ;
        data_idx = null ;
    } ,


    //-----------------------------------------------------------------------------------------
    get_topchart_max_value: function(){
        var self = this;

        if (self.move_pos.x == -1) {
            self.click_time = self.datePicker.getFromDateTime();
            self.move_pos.x = +new Date(self.click_time);
        }
        self.move_pos.y = self.chart_active.maxOffSet.y ;


        if (self.chart_active.maxOffSet.x == -1 ){
            self.click_time = self.datePicker.getFromDateTime();
        }else{
            self.click_time = common.Util.getDate(self.chart_active.maxOffSet.x);
        }
        // date format fix for IE by KOJ
        self.lbl_time.setText( Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

        self = null;
    } ,


    //-----------------------------------------------------------------------------------------
    move_line: function( line_pos ){

        try{
            var self = this;
            var ix = 0;

            self.move_pos = line_pos;

            if (!self.chart_active) {
                return;
            }

            //top chart
            self.chart_active.drawIndicator( line_pos );

            var pos = line_pos ;
            //mid chart
            for (ix = 0; ix < self.arr_stat_chart.length; ix++){
                self.arr_stat_chart[ ix ].drawIndicator( pos );
            }

            for (ix = 0; ix < self.arr_db_chart.length; ix++){
                self.arr_db_chart[ ix ].drawIndicator( pos );
            }

            for (ix = 0; ix < self.arr_wait_chart.length; ix++){
                self.arr_wait_chart[ ix ].drawIndicator( pos );
            }

            for (ix = 0; ix < self.arr_gc_chart.length; ix++){
                self.arr_gc_chart[ ix ].drawIndicator( pos );
            }

            for (ix = 0; ix < self.arr_os_chart.length; ix++){
                self.arr_os_chart[ ix ].drawIndicator( pos );
            }

            return common.Util.getDate( line_pos.x );
        }finally{
            ix = null ;
            pos = null ;
            self = null ;
        }

    } ,

    //-----------------------------------------------------------------------------------------
    on_mid_lock_data: function(header, data){
        var self = this;
        var ix, jx;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            if(header.command == self.sql.mid_lock){
                self.pnl_locktree.loadingMask.hide();
            }

            console.error('PerformaceTrend-on_mid_lock_data');
            console.error(header);
            console.error(data);
            return;
        }

        switch ( header.command ){
            case self.sql.mid_sec:
                for (ix = 0; ix < data.rows.length; ix++){
                    self.curr_sec['lock'].push(data.rows[ix][0]);
                }

                self.set_sec(self.curr_sec['lock'], self.curr_sec_frm['lock']);
                self._set_click_state('lock');
                break ;

            case self.sql.mid_lock:
                var h_sid ,
                    w_sid ,
                    node ,
                    child_node;

                self.grd_locktree.clearNodes();
                self.grd_locktree.beginTreeUpdate();

                for (ix = 0; ix < data.rows.length; ix++){
                    h_sid = data.rows[ix][1];
                    w_sid = data.rows[ix][9];

                    node = self.grd_locktree.findNode('hold_sid', h_sid);
                    if (node == null){
                        self.grd_locktree.addNode(null,   [ data.rows[ix][1] //hold_sid
                            ,data.rows[ix][2] //hold_lock_type
                            ,common.DataModule.referenceToDB.lockType[data.rows[ix][3]] //hold_mode
                            ,'--'//data.rows[ix][4] //wait_lock_type
                            ,'--'//data.rows[ix][5] //req_mode
                            ,'0'//data.rows[ix][6] //object_id
                            ,data.rows[ix][7]      //hold_db_id
                            ,''//data.rows[ix][8]  //wait_db_id
                            ,''        //'dead_lock'
                            ,''        //'was_name'
                            ,''        //'txn_name'
                            ,''        //'class_method'
                            ,''        //'client_ip'
                            ,''        //'login_name'
                            ,''        //'start_time'
                            ,''        //'cpu_time'
                            ,''        //'avg_elapse'
                            ,''        //'elapse_time'
                            ,''        //'thread_cpu'
                            ,''        //'io_read'
                            ,''        //'io_write'
                            ,''        //'db_time'
                            ,''        //'wait_time'
                            ,''        //'pool_name'
                            ,''        //'instance_name'
                            ,''        //'state'
                            ,''        //'sql1'
                            ,''        //'sql2'
                            ,''        //'sql3'
                            ,''        //'sql4'
                            ,''        //'sql5'
                            ,''        //'sql_execute_count'
                            ,''        //'fetch_count'
                            ,''        //'prepare_count'
                            ,''        //'pga'
                            ,''        //'logical_reads'
                            ,''        //'physical_reads'
                            ,''        //'was_id'
                            ,''        //'wait_info'
                            ,''        //'tid'
                            ,''        //'current_crc'
                            ,''        //'sql_id1'
                            ,''        //'sql_id2'
                            ,''        //'sql_id3'
                            ,''        //'sql_id4'
                            ,''        //'sql_id5'
                            ,''        //'txn_id'
                            ,''        //'pool_id'
                            ,''        //'time'
                        ]);
                    }

                    child_node = self.grd_locktree.findNode('wait_sid', w_sid);
                    if (child_node == null){
                        node = self.grd_locktree.findNode('hold_sid', h_sid);
                        self.grd_locktree.addNode(node, [  data.rows[ix][9]//sid
                            ,'--'             //hode lock type
                            ,'--'             //hold mode
                            ,data.rows[ix][4] //wait_lock_type
                            ,common.DataModule.referenceToDB.lockType[data.rows[ix][3] ] //req_mode
                            ,data.rows[ix][6] //object_id
                            ,''               //hold_db_id
                            ,data.rows[ix][8] //wait_db_id
                            ,''        //'dead_lock'
                            ,''        //'was_name'
                            ,''        //'txn_name'
                            ,''        //'class_method'
                            ,''        //'client_ip'
                            ,''        //'login_name'
                            ,''        //'start_time'
                            ,''        //'cpu_time'
                            ,''        //'avg_elapse'
                            ,''        //'elapse_time'
                            ,''        //'thread_cpu'
                            ,''        //'io_read'
                            ,''        //'io_write'
                            ,''        //'db_time'
                            ,''        //'wait_time'
                            ,''        //'pool_name'
                            ,''        //'instance_name'
                            ,''        //'state'
                            ,''        //'sql1'
                            ,''        //'sql2'
                            ,''        //'sql3'
                            ,''        //'sql4'
                            ,''        //'sql5'
                            ,''        //'sql_execute_count'
                            ,''        //'fetch_count'
                            ,''        //'prepare_count'
                            ,''        //'pga'
                            ,''        //'logical_reads'
                            ,''        //'physical_reads'
                            ,''        //'was_id'
                            ,''        //'wait_info'
                            ,''        //'tid'
                            ,''        //'current_crc'
                            ,''        //'sql_id1'
                            ,''        //'sql_id2'
                            ,''        //'sql_id3'
                            ,''        //'sql_id4'
                            ,''        //'sql_id5'
                            ,''        //'txn_id'
                            ,''        //'pool_id'
                            ,''        //'time'
                        ]);
                    }else{
                        child_node = self.grd_locktree.findNode('wait_sid', w_sid);

                        var dead_lock_node = self.grd_locktree.findNode('hold_sid', h_sid);
                        if (!dead_lock_node) {
                            self.grd_locktree.moveNode(node, child_node);
                        }
                        else {
                            self.grd_locktree.addNode(child_node, [  data.rows[ix][9] //sid
                                ,'--'             //hode lock type
                                ,'--'             //hold mode
                                ,data.rows[ix][4] //wait_lock_type
                                ,common.DataModule.referenceToDB.lockType[data.rows[ix][3] ] //req_mode
                                ,data.rows[ix][6] //object_id
                                ,''               //hold_db_id
                                ,data.rows[ix][8] //wait_db_id
                                ,''        //'dead_lock'
                                ,''        //'was_name'
                                ,''        //'txn_name'
                                ,''        //'class_method'
                                ,''        //'client_ip'
                                ,''        //'login_name'
                                ,''        //'start_time'
                                ,''        //'cpu_time'
                                ,''        //'avg_elapse'
                                ,''        //'elapse_time'
                                ,''        //'thread_cpu'
                                ,''        //'io_read'
                                ,''        //'io_write'
                                ,''        //'db_time'
                                ,''        //'wait_time'
                                ,''        //'pool_name'
                                ,''        //'instance_name'
                                ,''        //'state'
                                ,''        //'sql1'
                                ,''        //'sql2'
                                ,''        //'sql3'
                                ,''        //'sql4'
                                ,''        //'sql5'
                                ,''        //'sql_execute_count'
                                ,''        //'fetch_count'
                                ,''        //'prepare_count'
                                ,''        //'pga'
                                ,''        //'logical_reads'
                                ,''        //'physical_reads'
                                ,''        //'was_id'
                                ,''        //'wait_info'
                                ,''        //'tid'
                                ,''        //'current_crc'
                                ,''        //'sql_id1'
                                ,''        //'sql_id2'
                                ,''        //'sql_id3'
                                ,''        //'sql_id4'
                                ,''        //'sql_id5'
                                ,''        //'txn_id'
                                ,''        //'pool_id'
                                ,''        //'time'
                            ]);
                        }
                    }
                }
                self.grd_locktree.drawTree();
                self.grd_locktree.endTreeUpdate();

                //active data 로 그리기
                if (self.grd_active.gridStore.data.items.length == 0){
                    self.pnl_locktree.loadingMask.hide();
                    return;
                }

                var tree_data = self.grd_locktree.getTreeDataList();
                var grid_node = self.grd_active.gridStore.data.items ,
                    sid;

                for (ix = 0; ix < tree_data.length; ix++){
                    sid = tree_data[ix].data.hold_sid;

                    self.grd_locktree.beginTreeUpdate();
                    for (jx = 0; jx < grid_node.length; jx++){
                        if (sid == grid_node[jx].data.sid){
                            node = self.grd_locktree.findNode('hold_sid', sid);
                            node.dead_lock         =  1;
                            node.was_name          =  grid_node[jx].data.was_name;
                            node.txn_name          =  grid_node[jx].data.txn_name;
                            node.class_method      =  grid_node[jx].data.class_method;
                            node.client_ip         =  grid_node[jx].data.client_ip;
                            node.login_name        =  grid_node[jx].data.login_name;
                            node.start_time        =  grid_node[jx].data.start_time;
                            node.cpu_time          =  grid_node[jx].data.cpu_time;
                            node.avg_elapse        =  grid_node[jx].data.avg_elapse;
                            node.elapse_time       =  grid_node[jx].data.elapse_time;
                            node.thread_cpu        =  grid_node[jx].data.thread_cpu;
                            node.io_read           =  grid_node[jx].data.io_read;
                            node.io_write          =  grid_node[jx].data.io_write;
                            node.db_time           =  grid_node[jx].data.db_time;
                            node.wait_time         =  grid_node[jx].data.wait_time;
                            node.pool_name         =  grid_node[jx].data.pool_name;
                            node.instance_name     =  grid_node[jx].data.instance_name;
                            node.state             =  grid_node[jx].data.state;
                            node.sql1              =  grid_node[jx].data.sql_text1;
                            node.sql2              =  grid_node[jx].data.sql_text2;
                            node.sql3              =  grid_node[jx].data.sql_text3;
                            node.sql4              =  grid_node[jx].data.sql_text4;
                            node.sql5              =  grid_node[jx].data.sql_text5;
                            node.sql_execute_count =  grid_node[jx].data.sql_execute_count;
                            node.fetch_count       =  grid_node[jx].data.fetch_count;
                            node.prepare_count     =  grid_node[jx].data.prepare_count;
                            node.pga               =  grid_node[jx].data.mem_usage;
                            node.logical_reads     =  grid_node[jx].data.logical_reads;
                            node.physical_reads    =  grid_node[jx].data.physical_reads;
                            node.was_id            =  grid_node[jx].data.was_id;
                            node.wait_info         =  grid_node[jx].data.wait_info;
                            node.tid               =  grid_node[jx].data.tid;
                            node.current_crc       =  grid_node[jx].data.current_crc;
                            node.sql_id1           =  grid_node[jx].data.sql_id1;
                            node.sql_id2           =  grid_node[jx].data.sql_id2;
                            node.sql_id3           =  grid_node[jx].data.sql_id3;
                            node.sql_id4           =  grid_node[jx].data.sql_id4;
                            node.sql_id5           =  grid_node[jx].data.sql_id5;
                            node.txn_id            =  grid_node[jx].data.txn_id;
                            node.pool_id           =  grid_node[jx].data.pool_id;
                            node.time              =  grid_node[jx].data.time;
                        }
                    }
                    self.grd_locktree.drawTree();
                    self.grd_locktree.endTreeUpdate();
                }
                self.pnl_locktree.loadingMask.hide();

                h_sid      = null;
                w_sid      = null;
                node       = null;
                child_node = null;

                dead_lock_node = null ;
                tree_data = null ;
                break ;

            default :
                break;
        }


    },
    //-----------------------------------------------------------------------------------------
    on_mid_data: function(header, data){
        var self = this,
            param = header.parameters,
            ix = 0, jx = 0, kx, kxLen,
            seriesData = null,
            midData;


        if(this.isClosed){
            return;
        }

        if (!self.bot_pnl) {
            self = this.self;
        }

        self.executeCount--;

        if(!common.Util.checkSQLExecValid(header, data)){
            if(header.command === self.sql.mid_os){
                self.pnl_os.loadingMask.hide();
            }

            self.active_tab.loadingMask.hide() ;
            self.loadingMask.hide();

            console.error('PerformaceTrend-on_mid_data');
            console.error(header);
            console.error(data);
            return;
        }

        if( header.command === self.sql.mid_os ){
            var parameter = null;
            var dataIndex = 1;

            midData = data.rows;

            for(ix=0; ix < self.arr_os_chart.length; ix++){
                parameter = {};
                seriesData = {};

                self.arr_os_chart[ix].clearValues();

                if(midData.length > 0){
                    parameter.from = param.bind[0].value;
                    parameter.to   = param.bind[1].value;
                    parameter.time = 0;
                    parameter.data = midData;
                    for (jx = 0; jx < self.arr_os_chart[ix].serieseList.length; jx++){
                        seriesData[jx] = dataIndex++;
                    }
                    jx = null ;

                    parameter.series = seriesData;

                    self.arr_os_chart[ix].addValues(parameter);
                }

                self.arr_os_chart[ix].plotDraw();
            }

            self.pnl_os.loadingMask.hide();

            //zoom
            if (!self.flag_list.flag_zoom['mid_os']) {
                for ( ix = 0 ; ix < self.arr_os_chart.length; ix++ ){
                    self.chart_active.addDependentChart(self.arr_os_chart[ix]);
                    self.arr_os_chart[ix].plotReSize();
                }
                self.flag_list.flag_zoom['mid_os'] = true;
            }else{
                for ( ix = 0 ; ix < self.arr_os_chart.length; ix++ ){
                    self.arr_os_chart[ix].prevZoomFrom = +new Date( self.zoom_from ) ;
                    self.arr_os_chart[ix].prevZoomTo   = +new Date( self.zoom_to ) ;
                    self.arr_os_chart[ix].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                    self.arr_os_chart[ix].plotReSize();
                }
            }

            self.move_line({ x: +new Date(self.click_time), y: null });

            parameter = null;
            seriesData = null;
            midData = null;
            dataIndex = null;

        }else{
            var arr_store  = { 0: [], 1: [], 2: [] };
            var stat_list , stat_alias, tempSeries;

            if (!Array.isArray(this.target)){
                this.target = [this.target];
            }

            for ( jx = 0; jx < this.target.length; jx++){
                arr_store[0][this.target[jx].title] = [];
                arr_store[1][this.target[jx].title] = [];
                arr_store[2][this.target[jx].title] = [];

                this.target[jx].setSeriesVisible(0, true);
                this.target[jx].setSeriesVisible(1, false);
                this.target[jx].setSeriesVisible(2, false);
                this.target[jx].setSeriesLegendVisible(0, true);
                this.target[jx].setSeriesLegendVisible(1, false);
                this.target[jx].setSeriesLegendVisible(2, false);

                if (this.type === 'Stat' || this.type === 'GC'){
                    this.target[jx].setSeriesLegendVisible(1, true);
                    this.target[jx].setSeriesVisible(1, true);

                    //if(this.target[jx].title === common.Util.TR( 'Elapse Time' )){
                    //    tempSeries = this.target[jx].getSeries(0);
                    //    tempSeries.hideLegend = true;
                    //    tempSeries.labelObj.hidden = false;
                    //    this.target[jx].setSeriesVisible(0, false);
                    //    this.target[jx].setSeriesLegendVisible(0, false);
                    //}

                    var max_value;
                    if(this.target[jx].title === common.Util.TR('Full GC Count') ||
                        this.target[jx].title === common.Util.TR('Full GC Time (Sec)') ||
                        this.target[jx].title === common.Util.TR('Total GC Count') ||
                        this.target[jx].title === common.Util.TR('Total GC Time (Sec)') ||
                        this.target[jx].title === common.Util.TR('Young GC Count') ||
                        this.target[jx].title === common.Util.TR('Young GC Time (Sec)')
                    ){
                        self.gcMetricsSetting(this.target[jx]);
                        max_value = 'max';
                    } else if (this.target[jx].title !== common.Util.TR( 'JVM Free Heap (MB)' ) && this.target[jx].title !== common.Util.TR( 'OS Free Memory (MB)' )) {
                        this.target[jx].setLegendText(0, common.Util.CTR('MAX'));
                        this.target[jx].setLegendText(1, common.Util.CTR('AVG'));
                        max_value = 'max';
                    } else if( this.type !== 'Pool' ) {
                        this.target[jx].setLegendText(0, common.Util.CTR('AVG'));
                        this.target[jx].setLegendText(1, common.Util.CTR('MIN'));
                        max_value = 'avg';
                    }

                    if (this.type === 'Stat') {
                        stat_list = self.was_stat;
                        stat_alias = self.was_stat_alias;
                    }
                    else {
                        stat_list =  self.gc_stat;
                        stat_alias = self.gc_stat_alias;
                    }

                    for (kx = 1; kx < data.columns.length; kx++){
                        var compair_max = data.columns[kx].toLowerCase().indexOf(max_value);

                        var compair_max_str = data.columns[kx].toLowerCase().substring(0, compair_max - 1);
                        var was_idx = stat_alias.indexOf(compair_max_str);

                        if (was_idx == -1) {
                            continue;
                        }

                        if ( common.Util.CTR( stat_list[was_idx] ) !== this.target[jx].title) {
                            continue;
                        }

                        for (ix = 0; ix < data.rows.length; ix++){
                            //max
                            arr_store[0][this.target[jx].title].push([data.rows[ix][0], data.rows[ix][kx]]);
                            //avg
                            arr_store[1][this.target[jx].title].push([data.rows[ix][0], data.rows[ix][kx+1]]);
                        }
                        break;
                    }

                    max_value = null ;
                }else if (this.type === 'DB_OS'){
                    for (ix = 0; ix < data.rows.length; ix++){
                        if (this.target[jx].title === 'CPU Usage' ){
                            arr_store[0][ this.target[jx].title].push([data.rows[ix][0], data.rows[ix][2]]);
                        }
                        else if (this.target[jx].title === common.Util.TR( 'free memory' ) ) {
                            arr_store[0][ this.target[jx].title].push([data.rows[ix][0], data.rows[ix][3]]);
                        }

                    }
                }else if( this.type === common.Util.TR( 'Wait_latch' ) ){
                    for (ix = 0; ix < data.rows.length; ix++){
                        arr_store[0][this.target[jx].title].push([data.rows[ix][0], data.rows[ix][3]]);
                    }
                }else if( common.Util.TR( this.type ) === common.Util.TR( 'Pool' ) ){
                    this.target[jx].setSeriesVisible(1, true);
                    this.target[jx].setSeriesVisible(2, true);
                    this.target[jx].setSeriesLegendVisible(1, true);
                    this.target[jx].setSeriesLegendVisible(2, true);

                    for (ix = 0; ix < data.rows.length; ix++){
                        if (data.rows[ix][2] === this.target[jx].title){
                            arr_store[0][ this.target[jx].title].push([data.rows[ix][1], data.rows[ix][3]]);
                            arr_store[1][ this.target[jx].title].push([data.rows[ix][1], data.rows[ix][4]]);
                            arr_store[2][ this.target[jx].title].push([data.rows[ix][1], data.rows[ix][5]]);
                        }
                    }

                }else{
                    this.target[jx].setLegendText(0, this.target[jx].title);
                    for (ix = 0; ix < data.rows.length; ix++){
                        if (data.rows[ix][2] === this.target[jx].title){
                            arr_store[0][ this.target[jx].title].push([data.rows[ix][0], data.rows[ix][3]]);
                        }
                    }
                }
            }

            for (ix = 0; ix < this.target.length; ix++){
                this.target[ix].clearValues();

                this.target[ix].setChartRange(+new Date(param.bind[0].value) , +new Date(param.bind[1].value));

                for ( jx in arr_store ){
                    for(kx = 0, kxLen = arr_store[jx][this.target[ix].title].length; kx < kxLen; kx++){
                        midData = arr_store[jx][this.target[ix].title][kx];
                        this.target[ix].addValue(+jx, [+new Date(midData[0]), +midData[1]]);
                    }
                }

                this.target[ix].setFillData(null);

                /*                               * this.type은 현재 실행할 쿼리 타입
                 * this.target.chart_type은 차트 프레임 타입(초기에만들어질때 뭐로 만들어졌는지)
                 * */
                //zoom
                if (this.target[ix].title === 'Latch Wait Time (Total)'){
                    this.target[ix].chart_type = 'Wait_latch';
                }

                if (this.target[ix].title === 'CPU Usage' ){
                    this.target[ix].chart_type = 'DB_OS';
                }

                switch (this.target[ix].chart_type){
                    case 'Stat':
                        if (!this.self.flag_list.flag_was ) {
                            self.flag_list.flag_was = true;
                        }
                        this.target[ix].prevZoomFrom = +new Date(self.datePicker.getFromDateTime());
                        this.target[ix].prevZoomTo   = +new Date(self.datePicker.getToDateTime());
                        this.target[ix].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                        break;

                    case 'DB':
                    case 'DB_OS':
                        if (!self.flag_list.flag_zoom['mid_db']) {
                            self.chart_active.addDependentChart( self.arr_db_chart ) ;
                        }
                        this.target[ix].prevZoomFrom = +new Date(self.datePicker.getFromDateTime());
                        this.target[ix].prevZoomTo   = +new Date(self.datePicker.getToDateTime());
                        this.target[ix].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                        self.flag_list.flag_zoom['mid_db'] = true;
                        break;

                    case 'Wait':
                    case 'Wait_latch':

                        if (!self.flag_list.flag_zoom['mid_wait']) {
                            self.chart_active.addDependentChart( self.arr_wait_chart ) ;
                        }
                        this.target[ix].prevZoomFrom = +new Date(self.datePicker.getFromDateTime());
                        this.target[ix].prevZoomTo   = +new Date(self.datePicker.getToDateTime());
                        this.target[ix].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                        self.flag_list.flag_zoom['mid_wait'] = true;
                        break;

                    case 'GC':
                        if (!self.flag_list.flag_zoom['mid_gc']) {
                            self.chart_active.addDependentChart( self.arr_gc_chart ) ;
                        }
                        this.target[ix].prevZoomFrom = +new Date(self.datePicker.getFromDateTime());
                        this.target[ix].prevZoomTo   = +new Date(self.datePicker.getToDateTime());
                        this.target[ix].zoomIn( +new Date(self.zoom_from), +new Date(self.zoom_to) ) ;
                        self.flag_list.flag_zoom['mid_gc'] = true;
                        break;

                    default :
                        break;
                }

                this.target[ix].plotReSize();
            }

            self.move_line({ x: +new Date(self.click_time), y: null });

            console.info('-------------------------------on_mid_data of move line-------------------------------');
        }

        if(!self.executeCount){
            if (!self.bot_pnl.collapsed){
                self.flag_list.flag_execute = true;
                self.get_active_sec(self.click_time);
            }

            self.active_tab.loadingMask.hide() ;
            self.loadingMask.hide();
        }

        ix = null;
        jx = null ;
        param = null ;
        self = null ;
    } ,

    gcMetricsSetting: function(target){
        switch(target.title){
            case common.Util.TR('Full GC Count'):
            case common.Util.TR('Total GC Count'):
            case common.Util.TR('Young GC Count'):
                target.setLegendText(0, common.Util.CTR('1 minute accumulation'));

                var tempSeries = target.getSeries(1);
                tempSeries.hideLegend = true;
                tempSeries.labelObj.hidden = false;
                target.setSeriesVisible(1, false);
                target.setSeriesLegendVisible(1, false);
                break;
            default:
                target.setLegendText(0, common.Util.CTR('1 minute accumulation'));
                break;
        }
    },


    //-----------------------------------------------------------------------------------------
    on_bot_data: function(header, data){
        var self = this;
        var ix, jx;
        var time_val;
        var state_val;
        var command = header.command;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            if(header.command === self.sql.bot_active && !self.isLoading){
                self.bot_pnl.getComponent('pnl_active').loadingMask.hide();
            }

            console.error('PerformaceTrend-on_bot_data');
            console.error(header);
            console.error(data);
            return;
        }

        switch (command){
            case self.sql.bot_sec:
                self.grd_active.clearRows();
                for (ix = 0; ix < data.rows.length; ix++)
                    self.curr_sec['active'].push(data.rows[ix][0]);

                self.set_sec(self.curr_sec['active'], self.curr_sec_frm['active']);

                //00번이 있으면 00번은 클릭상태로 두기.
                //다른초가 상단에 표시되어있으면 그시간으로. 없으면 그냥00초.
                self._set_click_state('active');
                break;

            case self.sql.bot_active:
                self.grd_active.clearRows();
                for (ix = 0; ix < data.rows.length; ix++){

                    //convert bind list
                    var tmp = common.Util.convertBindList(data.rows[ix][23]);
                    var resultTmp = [];
                    for(jx in tmp)
                        resultTmp.push(tmp[jx].value);
                    var bind_val = resultTmp.join(', ');

                    //cut start time
                    time_val = self._get_time(new Date(data.rows[ix][ 8]));
                    state_val = common.DataModule.threadStateType[data.rows[ix][22]];

                    self.grd_active.addRow([data.rows[ix][ 0] //time
                        ,data.rows[ix][ 1] //was_name
                        ,data.rows[ix][ 2] //was_id
                        ,data.rows[ix][ 3] //txn_name
                        ,data.rows[ix][ 4] //class_method
                        ,common.Util.codeBitToMethodType(data.rows[ix][ 5])//method_type
                        ,data.rows[ix][ 6] //client_ip
                        ,data.rows[ix][ 7] //login_name
                        ,time_val //data.rows[ix][ 8] //start_time
                        ,data.rows[ix][ 9] //avg_elapse
                        ,data.rows[ix][10] //txn_cpu_time
                        ,data.rows[ix][11] //cpu_time
                        ,data.rows[ix][12] //thread_cpu
                        ,data.rows[ix][13] //io_read
                        ,data.rows[ix][14] //io_write
                        ,data.rows[ix][15] //db_time
                        ,data.rows[ix][16] //wait_time
                        ,data.rows[ix][17] //pool
                        ,data.rows[ix][18] //pool_id
                        ,data.rows[ix][19] //elapse_time
                        ,data.rows[ix][20] //instance_name
                        ,data.rows[ix][21] //sid
                        ,state_val //state
                        ,bind_val//data.rows[ix][23] //bind_list
                        ,data.rows[ix][24] //sql_id1
                        ,data.rows[ix][25] //sql_text1
                        ,data.rows[ix][26] //2
                        ,data.rows[ix][27] //text2
                        ,data.rows[ix][28] //3
                        ,data.rows[ix][29] //text3
                        ,data.rows[ix][30] //4
                        ,data.rows[ix][31] //text4
                        ,data.rows[ix][32] //5
                        ,data.rows[ix][33] //text5
                        ,data.rows[ix][34] //sql_exec_count
                        ,data.rows[ix][35] //fetch_count
                        ,data.rows[ix][36] //current_crc
                        ,data.rows[ix][37] //prepare_cnt
                        ,data.rows[ix][38] //txn_id
                        ,data.rows[ix][39]
                        ,data.rows[ix][40]
                        ,data.rows[ix][41]
                        ,data.rows[ix][42] //wait_info
                        ,data.rows[ix][43] //tid
                        ,data.rows[ix][44] //start time tmp
                    ]);
                }
                self.grd_active.drawGrid();
                if (!self.isLoading){
                    self.bot_pnl.getComponent('pnl_active').loadingMask.hide();
                }

                self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

                if (self.mid_pnl.getActiveTab().itemId === 'pnl_locktree'){
                    self.get_lock_sec(self.click_time);
                }

                resultTmp = null;
                time_val = null;
                state_val = null;
                bind_val = null ;
                break;

            case self.sql.bot_process:
                self.grd_process.clearRows();
                for (ix = 0; ix < data.rows.length; ix++){
                    //cut start time
                    time_val = self._get_time(new Date(data.rows[ix][ 0]));

                    self.grd_process.addRow([time_val
                        ,data.rows[ix][ 1]
                        ,data.rows[ix][ 2]
                        ,data.rows[ix][ 3]
                        ,data.rows[ix][ 4]
                        ,data.rows[ix][ 5]
                        ,data.rows[ix][ 6]
                    ]);
                }
                self.grd_process.drawGrid();

                time_val = null;
                break;

            case self.sql.bot_active_sum:
                self.grd_active_sum.clearRows();
                if ( data.rows.length == 0  ){
                    return ;
                }

                for (ix = 0; ix < data.rows.length; ix++){
                    state_val = common.DataModule.threadStateType[data.rows[ix][14]];
                    self.grd_active_sum.addRow([ data.rows[ix][ 0]
                        ,data.rows[ix][ 1]
                        ,data.rows[ix][ 2]
                        ,data.rows[ix][ 4]
                        ,data.rows[ix][ 5]
                        ,data.rows[ix][ 6]
                        ,data.rows[ix][ 7]
                        ,data.rows[ix][ 8]
                        ,data.rows[ix][ 9]
                        ,data.rows[ix][10]
                        ,data.rows[ix][11]
                        ,data.rows[ix][12]
                        ,data.rows[ix][13] //sid
                        ,state_val         //state
                        ,data.rows[ix][15]
                        ,data.rows[ix][16]
                        ,data.rows[ix][17]
                        ,data.rows[ix][18]
                        ,data.rows[ix][19]
                        ,data.rows[ix][20]
                        ,data.rows[ix][21]
                        ,data.rows[ix][22]
                        ,data.rows[ix][23]
                        ,data.rows[ix][ 3] //tid
                    ]);
                }
                self.grd_active_sum.drawGrid();
                state_val = null ;
                break;
            default :
                break;
        }
        ix = null;
        jx = null ;
        self = null ;
    } ,


    //-----------------------------------------------------------------------------------------
    get_stat: function(chart){
        var self = this;

        WS.SQLExec({
            sql_file: self.sql.mid_was,
            bind: self.get_common_bind()
        }, self.on_mid_data.bind({
            target: chart,
            type  : 'Stat',
            self: self
        }), self);

        self.executeCount++;

        self = null ;
    } ,

    //-----------------------------------------------------------------------------------------
    get_db: function(chart, chart_os){
        var self = this;
        var db_id;

        if (!self.dbCombo.getValue()) {
            db_id = -1;
        } else {
            db_id = self.dbCombo.getValue();
        }

        WS.SQLExec({
            sql_file: self.sql.mid_db,
            bind:[{ name: 'fromtime', value: common.Util.getDate(self.datePicker.getFromDateTime()), type: SQLBindType.STRING  },
                { name: 'totime'  , value: common.Util.getDate(self.datePicker.getToDateTime()), type: SQLBindType.STRING  },
                { name: 'db_id'   , value: db_id, type: SQLBindType.INTEGER },
                { name: 'fromdate', value: common.Util.getDateFormat(self.datePicker.getFromDateTime()), type: SQLBindType.STRING  },
                { name: 'todate'  , value: common.Util.getDateFormat(self.datePicker.getToDateTime()), type: SQLBindType.STRING }],
            replace_string: [{ name: 'stat_name', value: "'"+self.stat_name_list['DB'].join("','")+"'" }]
        }, self.on_mid_data.bind({
            target: chart,
            type  : 'DB',
            self: self
        }), self);

        self.executeCount++;


        if (!chart_os || chart_os.length == 0) {
            return;
        }
        WS.SQLExec({
            sql_file: self.sql.mid_db_os,
            bind: self.get_common_bind_db()
        }, self.on_mid_data.bind({
            target: chart_os,
            type  : 'DB_OS',
            self: self
        }), self);

        self.executeCount++;

        self = null ;
        db_id = null ;
    } ,


    //-----------------------------------------------------------------------------------------
    get_wait: function(chart, chart_latch){
        var self = this;

        if (!chart || chart.length > 0){
            WS.SQLExec({
                sql_file: self.sql.mid_wait,
                bind: self.get_common_bind_db(),
                replace_string: [{ name: 'event_name', value: "'"+self.stat_name_list['Wait'].join("','")+"'" }]
            }, self.on_mid_data.bind({
                target: chart,
                type  : 'Wait',
                self: self
            }), self);

            self.executeCount++;
        }

        if (!chart_latch || chart_latch.length == 0) {
            return;
        }

        WS.SQLExec({
            sql_file: self.sql.mid_wait_latch,
            bind: self.get_common_bind_db()
        }, self.on_mid_data.bind({
            target: chart_latch,
            type  : 'Wait_latch',
            self: self
        }), self);

        self.executeCount++;

        self = null ;
    } ,


    //-----------------------------------------------------------------------------------------
    get_os: function(){
        var self = this;

        self.pnl_os.loadingMask.showMask();

        WS.SQLExec({
            sql_file: self.sql.mid_os,
            bind: self.get_common_bind()
        }, self.on_mid_data, self);

        self.executeCount++;

        self = null ;
    } ,


    //-----------------------------------------------------------------------------------------
    get_lock_sec: function(curr_time){
        var self = this;

        if (!self.dbCombo.getValue()) {
            return;
        }

        //sec
        var from,
            to ,
            currtime;

        currtime = new Date(curr_time);
        from = self.get_minute_time(currtime , 'FROM');
        to   = self.get_minute_time(currtime , 'TO');


        self.curr_sec['lock'].length = 0;
        WS.SQLExec({
            sql_file: self.sql.mid_sec,
            bind: [{ name: 'fromtime', value: from, type: SQLBindType.STRING },
                { name: 'totime'  , value: to, type: SQLBindType.STRING },
                { name: 'db_id'   , value: self.dbCombo.getValue(), type: SQLBindType.INTEGER }]
        }, self.on_mid_lock_data, self);


        self = null ;
        from = null ;
        to = null ;
        currtime = null ;
    } ,



    //-----------------------------------------------------------------------------------------
    get_lock_tree: function(curr_time){
        var self = this;

        if (!self.dbCombo.getValue()) {
            return;
        }


        //if (!self.isLoading)
        self.pnl_locktree.loadingMask.showMask();

        var to = new Date(curr_time),
            to2  = new Date(curr_time) ,
            to_time = to2.setSeconds(to.getSeconds()+1);

        WS.SQLExec({
            sql_file: self.sql.mid_lock,
            bind: [{ name: 'fromtime', value: curr_time, type: SQLBindType.STRING }
                ,{ name: 'totime'  , value: common.Util.getDate(to_time), type: SQLBindType.STRING }
                ,{ name: 'db_id'   , value: self.dbCombo.getValue(), type: SQLBindType.INTEGER }]
        }, self.on_mid_lock_data, self);

        to = null ;
        to2 = null ;
        to_time = null ;
        self = null ;
    },


    //-----------------------------------------------------------------------------------------
    get_gc: function(chart){
        var self = this;

        WS.SQLExec({
            sql_file: self.sql.mid_gc,
            bind: self.get_common_bind()
        }, self.on_mid_data.bind({
            target: chart,
            type  : 'GC',
            self: self
        }), self);

        self.executeCount++;

        self = null ;
    } ,

    //-----------------------------------------------------------------------------------------
    get_pool: function(chart){
        var self = this;

        for ( var ix = 0 ; ix < chart.length; ix++ ){
            WS.SQLExec({
                sql_file: self.sql.mid_pool,
                bind: [
                    { name: 'fromtime', value: common.Util.getDate(self.datePicker.getFromDateTime()), type: SQLBindType.STRING  },
                    { name: 'totime'  , value: common.Util.getDate(self.datePicker.getToDateTime()), type: SQLBindType.STRING  },
                    { name: 'was_id'  , value: self.wasCombo.getValue(), type: SQLBindType.INTEGER },
                    { name: 'pool_id' , value: chart[ix].pool_id, type: SQLBindType.INTEGER }]
            }, self.on_mid_data.bind({
                target: chart[ix],
                type  : 'Pool',
                self: self
            }), self);

            self.executeCount++;
        }

        self = null ;
        ix = null ;
    } ,

    //-----------------------------------------------------------------------------------------
    get_common_bind: function() {
        var self = this;

        return [{ name: 'fromtime', value: common.Util.getDate(self.datePicker.getFromDateTime()), type: SQLBindType.STRING  },
            { name: 'totime'  , value: common.Util.getDate(self.datePicker.getToDateTime()), type: SQLBindType.STRING  },
            { name: 'was_id'  , value: self.wasCombo.getValue(), type: SQLBindType.INTEGER }
        ];
    },

    get_common_bind_db: function() {
        try{
            var self = this;
            var db_id;

            if (!self.dbCombo.getValue()) {
                db_id = -1;
            } else {
                db_id = self.dbCombo.getValue();
            }

            return [{ name: 'fromtime', value: common.Util.getDate(self.datePicker.getFromDateTime()), type: SQLBindType.STRING  },
                { name: 'totime'  , value: common.Util.getDate(self.datePicker.getToDateTime()), type: SQLBindType.STRING  },
                { name: 'db_id'   , value: db_id, type: SQLBindType.INTEGER }
            ];
        }finally{
            self = null ;
            db_id = null ;
        }

    },

    //-----------------------------------------------------------------------------------------
    //00번이 있으면 00번은 클릭상태로 두기. but self.click_time과 비교도 해줘야함.
    //이미 액티브에서는 15초를 클릭했다면 락도 15초에 가있어야함. -> X
    //무조검 첫번째 데이터로 보내라고 하심(1405.12 by권차장님)
    _set_click_state: function(type){
        var self = this;
        var curr_time, just_time, sec;
        var currentSec;

        curr_time = new Date(self.click_time);

        if (self.curr_sec[type].length > 0){
            sec = self.curr_sec[type][0];
            if (sec === null || sec === undefined) {
                return;
            }

            currentSec = new Date(self.click_time).getSeconds();
            if(self.curr_sec[type].indexOf(currentSec) !== -1 ||
                type === 'lock' && self.bot_pnl.getActiveTab().itemId === 'pnl_active' ||
                type === 'active' && self.mid_pnl.getActiveTab().itemId === 'pnl_locktree'){
                sec = currentSec;
            }

            self.curr_sec_frm[type][sec].getEl().setStyle('color', 'red');
            self.curr_sec_frm[type][sec].getEl().setStyle('font-weight', 'bold');


            if (sec < 10) {
                sec = '0' + sec;
            }
        }
        else{
            sec = '00';
        }

        just_time = self._get_time_hour(curr_time, '');
        self.click_time = just_time +':'+ sec;
        self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

        if (type === 'active') {
            self.get_active_data(self.click_time);
        } else {
            self.get_lock_tree(self.click_time);
        }

        curr_time = null ;
        just_time = null ;
        sec = null ;
        self = null ;
    } ,

    //-----------------------------------------------------------------------------------------
    sec_click: function(){
        var self = this;
        var sec ;
        var pnl ;

        if(self.dbclick_info == null) {
            return;
        }

        var el = self.getEl();
        var info = self.dbclick_info;
        self.dbclick_info = null;
        el.scope = info.scope;
        el.itemId = this.itemId;

        self.getEl().addListener('click', function() {
            //lock누르고 -> bot sec을 누르고 -> 다시 lock을 누르면 retrieve가 안된다.
            //플래그가 초기화가 되어야 bot sec에서 누른 초로 다시 lock을 그릴수있으므로 플래그 false.
            if ( info == null ){
                return;
            }

            info.scope.flag_list.flag_active   = false;
            info.scope.flag_list.flag_locktree = false;

            if (info.type === 'active'){
                sec = Number( this.itemId.substring(3) );
                pnl = info.scope.curr_sec_frm['active'][ sec ];

                if (sec == '60'&& pnl.el.dom.style.color !== 'rgb(218, 218, 218)') {
                    info.scope.get_active_sum(info.scope.click_time);

                    //다른 60개들 색상만 초기화.
                    info.scope.set_sec(info.scope.curr_sec['active'], info.scope.curr_sec_frm['active']);
                    pnl.getEl().setStyle('color', 'red');
                    pnl.getEl().setStyle('font-weight', 'bold');
                    return;
                }
            }else{
                sec = Number( this.itemId.substring(3) );
                pnl = info.scope.curr_sec_frm['lock'][ sec ];
            }
            if (!pnl || pnl.el.dom.style.color !== 'black') {
                return;
            }

            var click_sec;
            //클릭한 시간값으로 세팅
            if (sec < 10) {
                click_sec = '0' + sec;
            }
            else {
                click_sec = sec;
            }

            var from,
                tmp_str;

            from    = new Date(info.scope.click_time);

            tmp_str = from.getFullYear() +"-"+
                ("0" + (from.getMonth()+1)).slice(-2) +"-"+
                ("0" + from.getDate()).slice(-2) + " " +
                ("0" + from.getHours()).slice(-2) + ":" +
                ("0" + from.getMinutes()).slice(-2) + ":" +
                (click_sec);

            info.scope.click_time = tmp_str;
            if (!info.scope.bot_pnl.collapsed ){
                info.scope.get_active_sec(info.scope.click_time);
            }

            sec = null ;
            pnl = null ;
            from = null ;
            tmp_str = null ;
            el = null ;
            self = null ;
            click_sec = null ;

        });
    },


    //-----------------------------------------------------------------------------------------
    mid_tab_change: function(active_pnl){

        if(!this.gridInitFlag.lockTree && active_pnl === 'pnl_locktree'){
            this.addLockTreeColumns();
            this.gridInitFlag.lockTree = true;
        }

        //retrieve버튼 누르고 오세요.
        if (!this.flag_list.flag_refresh) {
            return;
        }
        if (this.lbl_time.text === this.LABEL_FORMAT) {
            return;
        }

        var self = this;
        var ix;

        switch (active_pnl){
            case 'pnl_stat':
                if (!self.flag_list.flag_was){
                    self.flag_list.flag_was = true;
                }else{
                    for (ix = 0; ix < self.arr_stat_chart.length; ix++)
                        self.arr_stat_chart[ix].plotReSize();
                }
                break;
            case 'pnl_db':
                if (!self.flag_list.flag_db){
                    self.get_mid_chart(active_pnl);
                    self.flag_list.flag_db = true;
                }else{
                    for (ix = 0; ix < self.arr_db_chart.length; ix++)
                        self.arr_db_chart[ix].plotReSize();
                }
                break;
            case 'pnl_wait':
                if (!self.flag_list.flag_wait){
                    if (self.click_time == null) {
                        return;
                    }
                    self.get_mid_chart(active_pnl);
                    self.flag_list.flag_wait = true;
                }else{
                    for (ix = 0; ix < self.arr_wait_chart.length; ix++)
                        self.arr_wait_chart[ix].plotReSize();
                }
                break;
            case 'pnl_os':
                if (!self.flag_list.flag_os){
                    self.get_os();
                    self.flag_list.flag_os = true;
                }else{
                    for (ix = 0; ix < self.arr_os_chart.length; ix++)
                        self.arr_os_chart[ix].plotReSize();
                }
                break;
            case 'pnl_locktree':
                if (!self.flag_list.flag_locktree){
                    self.get_lock_sec(self.click_time);
                    self.flag_list.flag_locktree = true;
                }
                break;
            case 'pnl_gc':
                if (!self.flag_list.flag_gc){
                    self.get_mid_chart(active_pnl);
                    self.flag_list.flag_gc = true;
                }else{
                    for (ix = 0; ix < self.arr_gc_chart.length; ix++)
                        self.arr_gc_chart[ix].plotReSize();
                }
                break;
            default :
                break;
        }

        if (self.click_time == null) {
            return;
        }
        self.move_line({ x: +new Date(self.click_time), y: null });
        console.info('-------------------------------mid_tab_change of move line-------------------------------');
        self.chart_active.maxOffSet.x = +new Date(self.click_time);

        ix = null ;
        self = null ;
    } ,



    //-----------------------------------------------------------------------------------------

    bot_tab_change: function(active_pnl){
        var self = this;

        //retrieve버튼 누르고 오세요.
        if (!self.flag_list.flag_refresh) {
            return;
        }

        switch (active_pnl){
            case 'pnl_active':
                if (!self.flag_list.flag_active && self.flag_list.flag_execute){
                    self.get_active_sec(self.click_time);
                    self.flag_list.flag_active = true;
                }
                break;
            case 'pnl_process':
                if (!self.flag_list.flag_process){
                    self.get_process(self.click_time);
                    self.flag_list.flag_process = true;
                }
                break;

            case 'pnl_active_sum':
                if (!self.flag_list.flag_active_sum){
                    self.get_active_sum(self.click_time);
                    self.flag_list.flag_active_sum = true;
                }
                break;

            default :
                break;
        }

        self = null ;
    } ,


    //-----------------------------------------------------------------------------------------
    get_minute_time: function(time, position){

        try{
            var tmp_str;

            if (position === 'FROM'){
                tmp_str = time.getFullYear() +"-"+
                    ("0" + (time.getMonth()+1)).slice(-2) +"-"+
                    ("0" + time.getDate()).slice(-2) + " " +
                    ("0" + time.getHours()).slice(-2) + ":" +
                    ("0" + time.getMinutes()).slice(-2) + ":" +
                    ("00");
            }else{
                tmp_str = time.getFullYear() +"-"+
                    ("0" + (time.getMonth()+1)).slice(-2) +"-"+
                    ("0" + time.getDate()).slice(-2) + " " +
                    ("0" + time.getHours()).slice(-2) + ":" +
                    ("0" + time.getMinutes()).slice(-2) + ":" +
                    ("59");
            }
            return tmp_str;
        }finally{
            tmp_str = null ;
        }

    } ,


    //-----------------------------------------------------------------------------------------
    //y-m-d 자르고 h:m:s만 가져오는 함수
    _get_time: function(time){

        try{
            var tmp_str = ("0" + time.getHours()).slice(-2) + ":" +
                ("0" + time.getMinutes()).slice(-2) + ":" +
                ("0" + time.getSeconds()).slice(-2);

            return tmp_str;

        }finally{
            tmp_str = null ;
        }

    },


    /*
     * //type = hm이면 시:분
     * //아니면 년-월-일 시:분
     * */
    _get_time_hour: function(time, type){

        try{
            var tmp_str;

            time = new Date(time);
            if (type === 'hm'){
                tmp_str = ("0" + time.getHours()).slice(-2) + ":" +
                    ("0" + time.getMinutes()).slice(-2)  ;
            }else if(type === 'ymd'){
                tmp_str = (time.getFullYear() +"-"+
                ("0" + (time.getMonth()+1)).slice(-2) +"-"+
                ("0" + time.getDate()).slice(-2));
            } else {
                tmp_str = (time.getFullYear() +"-"+
                ("0" + (time.getMonth()+1)).slice(-2) +"-"+
                ("0" + time.getDate()).slice(-2) + " " +
                ("0" + time.getHours()).slice(-2) + ":" +
                ("0" + time.getMinutes()).slice(-2)) ;
            }

            return tmp_str;
        }finally{
            tmp_str = null ;
        }

    } ,

    /*self.IDXDB_STAT
     self.IDXDB_DB
     self.IDXDB_WAIT
     self.IDXDB_GC
     self.IDXDB_TYPE
     self.IDXBUILD_NUM*/

    //-----------------------------------------------------------------------------------------------------------
    title_update: function(arr_cht, title){


        //배열인지 아닌지(StatChange) 체크
        if (!Array.isArray(arr_cht)) {
            arr_cht = [arr_cht];
            title = [title] ;
        }

        console.debug('# Call 1');

        for (var ix = 0; ix < arr_cht.length; ix++){
            console.debug(ix +'     :::     '+title[ix]);

            arr_cht[ix].up().loadingMask.showMask() ;

            if (arr_cht[ix].stat_title === 'stat_chart'
                || arr_cht[ix].stat_title === 'gc_chart'){

                if ( common.Util.CTR(title[ix]) === common.Util.CTR('CPU Usage') ) {
                    arr_cht[ix].setTitle( 'CPU Usage' );
                }else{
                    arr_cht[ix].setTitle( common.Util.CTR(title[ix]) );
                }
            }else{
                if ( common.Util.CTR(title[ix]) === common.Util.CTR('CPU Usage') ) {
                    arr_cht[ix].setTitle( 'CPU Usage' );
                    arr_cht[ix].setLegendText(0, 'CPU Usage' );
                }else{
                    arr_cht[ix].setTitle( common.Util.CTR(title[ix]) );
                    arr_cht[ix].setLegendText(0, common.Util.CTR(title[ix]) );
                }
            }

            arr_cht[ix].up().loadingMask.hide() ;

        }
        ix = null ;
        title = null ;
    } ,

    //-----------------------------------------------------------------------------------------
    get_db_value: function(value){
        var self = this;

        if(!value){
            value = this.wasCombo.getValue();
        }

        //was에 연결된 pool정보가져오기
        if ( WS.connect_state == 1 ){
            WS.SQLExec({
                sql_file: self.sql.set_pool,
                replace_string: [{ name: 'was_id', value: value }]
            }, self.on_set_db, self);



            //was에 연결된 db가져오기
            WS.SQLExec({
                sql_file: self.sql.set_db,
                bind: [{ name: 'was_id', value: value, type: SQLBindType.INTEGER }] //value[0].data.value
            }, self.on_set_db, self);
        }

        self = null ;
    },


    //-----------------------------------------------------------------------------------------
    on_set_db: function(header, data){
        var self = this;
        var ix;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.error('PerformaceTrend-on_set_db');
            console.error(header);
            console.error(data);
            return;
        }

        switch ( header.command ){
            case self.sql.set_pool:
                if (!self.stat_change){
                    return;
                }

                self.stat_change.addPoolList(data) ;
                break ;

            case self.sql.set_db:
                var db_val = { DB : [] };

                for (ix = 0; ix < data.rows.length; ix++){
                    db_val['DB'].push({ name: data.rows[ix][0], value: data.rows[ix][1] });
                }

                self.dbCombo.setData(db_val['DB']);
                self.dbCombo.setSearchField('name');

                if (db_val['DB'].length > 0) {
                    //보이고
                    self.dbCombo.setValue(db_val['DB'][0].value);
                    self.get_stat_name();
                    self.dbCombo.enable();
                    self.pnl_db.tab.setVisible( true ) ;
                    self.pnl_wait.tab.setVisible( true ) ;
                    self.pnl_locktree.tab.setVisible( true ) ;

                    if ( self.grd_active ){
                        self.grd_active.down('[dataIndex = cpu_time]').show() ;
                        self.grd_active.down('[dataIndex = wait_time]').show() ;
                        self.grd_active.down('[dataIndex = logical_reads]').show() ;
                        self.grd_active.down('[dataIndex = physical_reads]').show() ;
                        self.grd_active.down('[dataIndex = wait_info]').show() ;
                        self.grd_active.down('[dataIndex = mem_usage]').show() ;
                    }

                }else {
                    //가리고
                    self.dbCombo.setValue('');
                    self.dbCombo.disable();
                    self.pnl_db.tab.setVisible( false ) ;
                    self.pnl_wait.tab.setVisible( false ) ;
                    self.pnl_locktree.tab.setVisible( false ) ;

                    if ( self.grd_active ){
                        self.grd_active.down('[dataIndex = cpu_time]').hide() ;
                        self.grd_active.down('[dataIndex = wait_time]').hide() ;
                        self.grd_active.down('[dataIndex = logical_reads]').hide() ;
                        self.grd_active.down('[dataIndex = physical_reads]').hide() ;
                        self.grd_active.down('[dataIndex = wait_info]').hide() ;
                        self.grd_active.down('[dataIndex = mem_usage]').hide() ;
                    }

                    if ( self.stat_change !== undefined ) {
                        self.stat_change.statTab.items.items[1].setVisible(false);
                        self.stat_change.statTab.items.items[1].tab.setVisible(false);
                        self.stat_change.statTab.items.items[2].setVisible(false);
                        self.stat_change.statTab.items.items[2].tab.setVisible(false);
                    }

                    //change view의 왼쪽그리드 db,wait탭 없애기
                    if ( self.chart_view_frm !== undefined ){

                        var db_tab       = self.chart_view_frm.left_tab_pnl.items.items[1],
                            db_tab_right = self.chart_view_frm.stat_change.items.items[1] ;

                        db_tab.setVisible(false);
                        db_tab.tab.setVisible(false);
                        db_tab_right.setVisible(false);
                        db_tab_right.tab.setVisible(false);
                        db_tab = null ;
                        db_tab_right = null;

                        var wait_tab       = self.chart_view_frm.left_tab_pnl.items.items[2],
                            wait_tab_right = self.chart_view_frm.stat_change.items.items[2] ;
                        wait_tab.setVisible(false);
                        wait_tab.tab.setVisible(false);
                        wait_tab_right.setVisible(false);
                        wait_tab_right.tab.setVisible(false);
                        wait_tab = null ;
                        wait_tab_right = null ;
                    }
                }
                break ;

            default :
                break;
        }

        self = null ;
    } ,


    //-----------------------------------------------------------------------------------------
    layout_top: function(){
        try{
            var self = this;

            var chart = Ext.create('Exem.chart.CanvasChartLayer', {
                width              : '100%',
                height             : '100%',
                itemId             : 'top_active_chart' ,
                title              : 'Active Transaction',
                titleHeight        : 17 ,
                titleFontSize      : '12px',
                interval           : PlotChart.time.exMin,
                showLegend         : true,
                legendWidth        : 170,
                legendTextAlign    : 'east',
                mouseSelect        : true,
                mouseSelectMode    : 'x',
                showIndicator      : true ,
                indicatorLegendFormat: '%y',
                indicatorLegendAxisTimeFormat: '%H:%M',
                showTooltip        : true,
                showTitle          : true ,
                toolTipFormat      : '%x [value:%y] ',
                toolTipTimeFormat  : '%H:%M',
                chartProperty      : {
                    yLabelWidth: 55,
                    xLabelFont: {size: 8, color: 'black'},
                    yLabelFont: {size: 8, color: 'black'},
                    xaxis: true
                },
                xaxisCurrentToTime : true,
                selectionZoom: true,
                //레전드 영역의 인디케이터.
                historyInfoDblClick: function(chart, record){
                    var history_time = record.data['TIME'];
                    history_time = new Date(history_time);

                    self.move_pos = { x:history_time , y: null  };
                    self.click_time = self.move_line(self.move_pos);
                    self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

                    if (!self.bot_pnl.collapsed){
                        self.get_active_sec(self.click_time);
                    }
                },
                plotdblclick : function(event, pos, item, xAxis){
                    if ((pos.x < 0)) {
                        return;
                    }

                    if (common.Util.getDate(pos.x) < +new Date(self.datePicker.getFromDateTime())
                        ||   common.Util.getDate(pos.x) > +new Date(self.datePicker.getToDateTime())) { return; }

                    self.flag_list.flag_active     = false;
                    self.flag_list.flag_process    = false;
                    self.flag_list.flag_active_sum = false;
                    self.flag_list.flag_locktree   = false;


                    self.move_pos = xAxis;
                    self.click_time = self.move_line({ x: xAxis.x, y:xAxis.y });
                    self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

                    if (!self.bot_pnl.collapsed){
                        if (self.bot_pnl.getActiveTab().itemId === 'pnl_active') {
                            self.get_active_sec(self.click_time);
                        }
                        else if (self.bot_pnl.getActiveTab().itemId === 'pnl_process') {
                            self.get_process(self.click_time);
                        }
                        else self.get_active_sum(self.click_time);
                    }
                },
                plotselection: function(){

                },
                afterZoomEvent: function(from, to){
                    if (!self.flag_list.flag_refresh) {
                        return;
                    }

                    self.move_line({ x: self.chart_active.maxOffSet.x, y: self.chart_active.maxOffSet.y });
                    common.DataModule.lastZoomFromTime = new Date( from ) ;
                    common.DataModule.lastZoomToTime   = new Date( to ) ;

                    //드래그한 starttime의 초가 0보다 크다면 무조건 +1M.
                    var from_sec = new Date(from).getSeconds();
                    if (from_sec !== 0){
                        //초가 0이 아닌경우는 줌을 한 경우만 있다고 생각하고 플래그를 둠.
                        self.zoom_mode = true;
                        var fromtime = new Date(from).setMinutes(new Date(from).getMinutes()+1);
                        fromtime = new Date(fromtime);
                        self.zoom_from = (fromtime.getFullYear() +"-"+
                            ("0" + (fromtime.getMonth()+1)).slice(-2) +"-"+
                            ("0" + fromtime.getDate()).slice(-2) + " " +
                            ("0" + fromtime.getHours()).slice(-2) + ":" +
                            ("0" + fromtime.getMinutes()).slice(-2))  + ':' +
                            ("00");
                    }else { self.zoom_from = common.Util.getDate(from); }

                    var totime = new Date(to);
                    self.zoom_to = (totime.getFullYear() +"-"+
                        ("0" + (totime.getMonth()+1)).slice(-2) +"-"+
                        ("0" + totime.getDate()).slice(-2) + " " +
                        ("0" + totime.getHours()).slice(-2) + ":" +
                        ("0" + totime.getMinutes()).slice(-2))  + ':' +
                        ("00");

                    if (!self.bot_pnl.collapsed &&  self.click_time !== common.Util.getDate(self.chart_active.maxOffSet.x)) {
                        self.click_time = common.Util.getDate(self.chart_active.maxOffSet.x);
                        self.get_active_sec(self.click_time);
                        self.get_active_data(self.click_time);
                    }
                    self.click_time = common.Util.getDate(self.chart_active.maxOffSet.x);
                    self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

                }
            });


            chart.addSeries({
                label: common.Util.TR('Normal'),
                id   : 'normal_avg',
                type : PlotChart.type.exLine,
                stack: true
            });

            chart.addSeries({
                label: common.Util.TR('Warning'),
                id   : 'warning_avg',
                type : PlotChart.type.exLine,
                stack: true
            });

            chart.addSeries({
                label: common.Util.TR('Critical'),
                id   : 'critical_avg',
                type : PlotChart.type.exLine,
                stack: true
            });

            return chart;
        }finally{
            chart = null;
        }
    } ,

    //-----------------------------------------------------------------------------------------
    layout_mid: function(parent){

        try{

            var tab = Ext.create('Exem.TabPanel', {
                region   : 'center' ,
                layout   : 'vbox' ,
                height   : '40%' ,
                split    : true ,
                itemId   : 'mid_pnl',
                activeTab: 0,
                style    : 'borderRadius : 6px;'
                //cls      : 'exem-tabpanel exem-tabpanel-border',
            });
            parent.add(tab);

            return tab;

        }finally{
            tab = null;
        }

    } ,


    //-----------------------------------------------------------------------------------------
    layout_bot: function(parent){
        try{
            var self = this;

            var tab = Ext.create('Exem.TabPanel', {
                region : 'south' ,
                layout : 'vbox' ,
                height : '33%' ,
                split  : true ,
                itemId : 'bot_pnl',
                activeTab: 0,
                collapsible: true,
                collapsed  : false,
                collapseMode:'header',
                style  : 'borderRadius : 6px;',
                listeners: {
                    collapse: function() {
                        if(!self.flag_list.flag_first_collapsed){
                            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].style.paddingLeft = '47%';
                            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].style.cursor = 'pointer' ;


                            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].addEventListener('mouseover', function(){
                                self.workArea.el.dom.getElementsByClassName('x-title-text')[1].style.color = '#379df0' ;
                            }) ;
                            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].addEventListener('mouseleave', function(){
                                self.workArea.el.dom.getElementsByClassName('x-title-text')[1].style.color = 'black' ;
                            }) ;
                            self.workArea.el.dom.getElementsByClassName('x-title-text')[1].onclick = function(){
                                self.bot_pnl.expand();
                            } ;

                            self.flag_list.flag_first_collapsed = true;
                        }

                        self.workArea.el.dom.getElementsByClassName('x-title-text')[1].innerHTML = common.Util.TR('Show Active Transaction') ;

                        self.flag_list.flag_locktree = true;
                        self.last_save_time = self.click_time;
                    },
                    expand: function() {
                        self.tab_expand() ;
                    },
                    tabchange: function ( tabPanel, newCard){
                        if(!self.gridInitFlag[newCard.items.items[0].itemId]){
                            switch (newCard.items.items[0].itemId){
                                case 'grd_process':
                                    self.addActiveProcessColumns();
                                    break;
                                case 'grd_active_sum':
                                    self.addActiveSumColumns();
                                    break;
                                default :
                                    break;
                            }

                            self.gridInitFlag[newCard.items.items[0].itemId] = true;
                        }
                    }
                }
            });
            parent.add(tab);

            return tab;
        }finally{
            tab = null;
        }

    } ,

    tab_expand: function(){
        var self = this ;

        if (!this.flag_list.flag_refresh) {
            return;
        }

        this.workArea.el.dom.getElementsByClassName('x-title-text')[1].innerHTML = common.Util.TR('Hide Active Transaction') ;
        //한번 펼쳤다 접고 다시 펼칠때 같은 시각데이터라면 다시 뿌리지 않게하기위함.
        if (this.click_time === this.last_save_time) {
            return;
        }

        setTimeout(function(){
            self.get_active_sec(self.click_time);
        }, 500);
    },

    //-----------------------------------------------------------------------------------------
    set_pnl: function(parent, txt, pnl_id){

        try{
            var self = this;

            var pnl = Ext.create('Exem.Container', {
                layout: 'vbox',
                padding: '3 0 0 0',
                title : common.Util.TR(txt),
                itemId: pnl_id,
                listeners: {
                    afterlayout: function(){
                        self.mid_tab_change(pnl_id);
                    }
                }
            });

            parent.add(pnl);
            return pnl;
        }finally{
            pnl = null ;
        }

    },

    //-----------------------------------------------------------------------------------------
    set_chart: function( parent, itemid, cht_idx, _chart_type ){

        try{
            var self = this;

            var chart = Ext.create('Exem.chart.CanvasChartLayer', {
//            flex           : 1,
                height         : 50,
                title          : common.Util.TR(itemid),
                stat_title     : itemid,
                chart_type     : _chart_type ,
                pool_id        : null,
                itemId         : 'chart'+cht_idx,
                interval       : PlotChart.time.exMin,
                dbclick_info   : {cb:self.on_mid_data, scope: self, itemId: itemid, idx: cht_idx},
                titleHeight    : 17 ,
                titleWidth     : 170,
                titleFontSize  : '12px',
                showTitle      : true ,
                showLegend     : true,
                showXAxis      : false,
                legendWidth    : 170,
                legendNameWidth : 150,
                legendTextAlign: 'east',
                showIndicator  : true ,
                indicatorLegendFormat: '%y',
                indicatorLegendAxisTimeFormat: '%H:%M',
                showTooltip    : true,
                toolTipFormat  : '%x [value:%y] ',
                toolTipTimeFormat: '%H:%M',
                mouseSelect    : true,
                fillIntervalValue : true,
                chartProperty: {
                    yLabelWidth: 55,
                    xLabelFont : {size: 8, color: 'black'},
                    yLabelFont : {size: 8, color: 'black'},
                    xaxis      : false
                },
                xaxisCurrentToTime : true,
                selectionZoom: true,
                historyInfoDblClick: function(chart, record){
                    var history_time = record.data['TIME'];
                    history_time = new Date(history_time);

                    self.move_pos = { x:history_time , y: null  };
                    self.click_time = self.move_line(self.move_pos);
                    self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

                    if (!self.bot_pnl.collapsed){
                        self.get_active_sec(self.click_time);
                    }

                    history_time = null ;
                },
                plotdblclick : function(event, pos, item, xAxis){
                    if ((pos.x < 0)) {
                        return;
                    }

                    if (common.Util.getDate(pos.x) < +new Date(self.datePicker.getFromDateTime())
                        ||   common.Util.getDate(pos.x) > +new Date(self.datePicker.getToDateTime())) { return; }

                    self.flag_list.flag_active     = false;
                    self.flag_list.flag_process    = false;
                    self.flag_list.flag_active_sum = false;
                    self.flag_list.flag_locktree   = false;

                    self.move_pos  = xAxis;
                    self.click_time = self.move_line({x: xAxis.x, y: xAxis.y});
                    self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

                    if (!self.bot_pnl.collapsed){
                        if (self.bot_pnl.getActiveTab().itemId === 'pnl_active') {
                            self.get_active_sec(self.click_time);
                        }
                        else if (self.bot_pnl.getActiveTab().itemId === 'pnl_process') {
                            self.get_process(self.click_time);
                        }
                        else self.get_active_sum(self.click_time);
                    }
                },
                plotselection: function(){

                },
                afterZoomEvent: function(from, to){
                    if (!self.flag_list.flag_refresh) {
                        return;
                    }

                    var from_sec = new Date(from).getSeconds();
                    if (from_sec !== 0){
                        self.zoom_mode = true;
                        var fromtime = new Date(from).setMinutes(new Date(from).getMinutes()+1);
                        fromtime = new Date(fromtime);
                        self.zoom_from = (fromtime.getFullYear() +"-"+
                            ("0" + (fromtime.getMonth()+1)).slice(-2) +"-"+
                            ("0" + fromtime.getDate()).slice(-2) + " " +
                            ("0" + fromtime.getHours()).slice(-2) + ":" +
                            ("0" + fromtime.getMinutes()).slice(-2))  + ':' +
                            ("00");
                    }else { self.zoom_from = common.Util.getDate(from); }

                    var totime = new Date(to);
                    self.zoom_to = (totime.getFullYear() +"-"+
                        ("0" + (totime.getMonth()+1)).slice(-2) +"-"+
                        ("0" + totime.getDate()).slice(-2) + " " +
                        ("0" + totime.getHours()).slice(-2) + ":" +
                        ("0" + totime.getMinutes()).slice(-2))  + ':' +
                        ("00");

                    self.move_line({ x: self.chart_active.maxOffSet.x, y: self.chart_active.maxOffSet.y });

                    common.DataModule.lastZoomFromTime = new Date( from ) ;
                    common.DataModule.lastZoomToTime   = new Date( to ) ;


                    if (!self.bot_pnl.collapsed &&  self.click_time !== common.Util.getDate(self.chart_active.maxOffSet.x)) {
                        self.click_time = common.Util.getDate(self.chart_active.maxOffSet.x);
                        self.get_active_sec(self.click_time);
                    }
                    self.click_time = common.Util.getDate(self.chart_active.maxOffSet.x);
                    self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

                    from_sec = null ;
                    fromtime = null ;
                    totime = null ;
                }
            });
            //---해당컴포넌트에 이벤트가 없는경우 -> 동적 이벤트 생성-----------------------
            if ( cht_idx !== 'os_chart1' && cht_idx !== 'os_chart2' ){
                chart.titleLayer.on({
                    render: {
                        fn: title_click,
                        scope: chart,
                        style: { cursor: 'pointer' }
                    }
                });
            }



            //chart add series
            var _add_series = function(type){
                if ( type === 'stat_chart' || type === 'gc_chart' ){
                    chart.addSeries({
                        label: common.Util.CTR('MAX'),
                        id   : 'mid_cht0',
                        type : PlotChart.type.exLine
                    });

                    chart.addSeries({
                        label: common.Util.CTR('AVG'),
                        id   : 'mid_cht1',
                        type : PlotChart.type.exLine
                    });

                    chart.addSeries({
                        label: common.Util.TR(''),
                        id   : 'mid_cht2',
                        hideLegend: true,
                        type : PlotChart.type.exLine
                    });
                }else if( type === 'OS CPU (%)' || type === 'OS Memory (MB)'){
                    if (cht_idx === 'os_chart1'){
                        chart.addSeries({
                            label: 'CPU SYS',
                            id   : 'mid_cht0',
                            type : PlotChart.type.exLine
                        });
                        chart.addSeries({
                            label: 'CPU USER',
                            id   : 'mid_cht1',
                            type : PlotChart.type.exLine
                        });
                        chart.addSeries({
                            label: 'CPU IO',
                            id   : 'mid_cht2',
                            type : PlotChart.type.exLine
                        });
                    }else{
                        chart.addSeries({
                            label: common.Util.TR('Free Memory'),
                            id   : 'mid_cht0',
                            type : PlotChart.type.exLine
                        });
                        chart.addSeries({
                            label: common.Util.TR('Total Memory'),
                            id   : 'mid_cht1',
                            type : PlotChart.type.exLine
                        });
                    }
                }else{
                    //1개 -> 1405.12 2개로 만들고 하나는 visible = false
                    //2개 -> 1411.5 3개로 만들고(pool때문에) 두개는 visible - false
                    chart.addSeries({
                        label: '',
                        id   : 'mid_cht0',
                        type : PlotChart.type.exLine
                    });

                    chart.addSeries({
                        label: '',
                        id   : 'mid_cht1',
                        type : PlotChart.type.exLine,
                        hideLegend: true,
                        visible: false
                    });

                    chart.addSeries({
                        label: '',
                        id   : 'mid_cht2',
                        type : PlotChart.type.exLine,
                        hideLegend: true,
                        visible: false
                    });

                }
            };


            _add_series(itemid);

            function title_click() {
                var self = this;

                if (self.dbclick_info == null) {
                    return;

                }
                var el = self.titleLayer.getEl();
                var info = self.dbclick_info;
                self.dbclick_info = null;
                el.scope = info.scope;
                el.itemId = 'chart'+info.itemId;
                el.cht_idx = info.idx;
                self.titleLayer.getEl().setStyle('cursor', 'pointer');

                self.titleLayer.getEl().addListener('click', function() {
                    var active_tab = info.scope.mid_pnl.getActiveTab();
                    var active_pnl = info.scope.mid_pnl.getComponent(active_tab.itemId);


                    var stat_type ,
                        select_title = active_pnl.getComponent(info.idx).title;

                    //stat_type은 현재 클릭한 레전드타이틀의 값에 해당하는 놈.
                    stat_type = info.scope._find_stat_type(select_title);


                    // target_chart는 현재 active되어있는 탭.
                    switch (active_tab.itemId){
                        case 'pnl_stat':
                            info.scope.target_chart = info.scope.arr_stat_chart[ info.idx ];
                            break;

                        case 'pnl_wait':
                            info.scope.target_chart = info.scope.arr_wait_chart[ info.idx ];
                            if (!info.scope.dbCombo.getValue()) {
                                return ;
                            }
                            break;

                        case 'pnl_db':
                            info.scope.target_chart = info.scope.arr_db_chart[ info.idx ];
                            if (!info.scope.dbCombo.getValue()) {
                                return ;
                            }
                            break;

                        case 'pnl_gc':
                            info.scope.target_chart = info.scope.arr_gc_chart[ info.idx ];
                            break;

                        default :
                            break;
                    }

                    //pool 정보가 없을시에 생길 팝업.
                    if (stat_type === null || stat_type === undefined){
                        common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('It does not exist selected status. Please change to the other status.'),
                            Ext.Msg.OK, Ext.MessageBox.WARNING, function() {
                                if ( info.scope.all_stat_list.Pool.length  > 0)
                                    stat_type = 4 ;
                                else stat_type = 0 ;
                                info.scope.stat_change.selectValue(stat_type, select_title);
                            });

                        return false;
                    }

                    info.scope.stat_change.selectValue(stat_type, select_title);
                });
            }

            return chart;
        }finally{
            chart = null;
        }

    },


    //-----------------------------------------------------------------------------------------------------------
    call_jump_list: function(grd_obj){
        var self = this;

        if (grd_obj.itemId === 'grd_active'){
            self._add_txndetail(grd_obj);
            self._add_txnhistory(grd_obj);
            self._add_sqlHistory(grd_obj);
        }

        self = null ;
    },



    //-----------------------------------------------------------------------------------------------------------
    _add_txndetail: function(grd_obj){

        var openTxnDetail = function(record){

            var txnView = Ext.create('view.TransactionDetailView',{
                startTime : record['start_time_temp'],
                endTime   : common.Util.getDate(record['time']),
                wasId     : record['was_id'],
                name      : record['was_name'],
                txnName   : record['txn_name'],
                tid       : record['tid'],
                elapseTime: record['elapse_time'],
                socket    : WS
            });

            var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTab.add(txnView);
            mainTab.setActiveTab(mainTab.items.length - 1);
            txnView.init();

            txnView = null ;
            mainTab = null ;
        };


        //transaction detail
        grd_obj.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),
            fn: function(){
                var record = this.up().record;
                openTxnDetail(record);
            }
        }, 0);
    },


    //-----------------------------------------------------------------------------------------------------------
    _add_txnhistory: function(grd_obj){
        grd_obj.contextMenu.addItem({
            title: common.Util.TR('Transaction Summary'),
            fn: function() {
                var record = this.up().record;
                var txnHistory = common.OpenView.open('TxnHistory', {
//                    fromTime: common.Util.getDate(record['time']),
//                    toTime: common.Util.getDate(+new Date(record['time']) + 600000), //+10M
                    fromTime:  Ext.util.Format.date(record['time'], Comm.dateFormat.HM),
                    toTime  :  Ext.util.Format.date(common.Util.getDate(+new Date(record['time']) + 600000), Comm.dateFormat.HM), //+10M
                    transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId : record['was_id']
                });
                setTimeout(function (){
                    txnHistory.executeSQL();
                }, 300);
            }
        }, 1);
    },

    //-----------------------------------------------------------------------------------------------------------
    _add_sqlHistory: function(grd_obj){
        var self = this;
        var id_name;
        var sql_text;
        var dataIndex;
        grd_obj.addEventListener('cellcontextmenu', function(me, td, cellIndex, record){
            dataIndex = me.headerCt.gridDataColumns[cellIndex].dataIndex;
            grd_obj.contextMenu.setDisableItem(2, false);
            grd_obj.contextMenu.setDisableItem(3, false);
            var data_rows = record.data;

            switch (dataIndex){
                case 'sql_text1':
                    sql_text = dataIndex;
                    id_name = 'sql_id1';
                    break;

                case 'sql_text2':
                    sql_text = dataIndex;
                    id_name = 'sql_id2';
                    break;

                case 'sql_text3':
                    sql_text = dataIndex;
                    id_name = 'sql_id3';
                    break;

                case 'sql_text4':
                    sql_text = dataIndex;
                    id_name = 'sql_id4';
                    break;

                case 'sql_text5':
                    sql_text = dataIndex;
                    id_name = 'sql_id5';
                    break;

                default :
                    sql_text = '';
                    id_name = '';
                    break;

            }

            if (sql_text === '' || !sql_text) {
                return;
            }


            if (data_rows[id_name] !== ''){
                grd_obj.contextMenu.setDisableItem(2, true);
                grd_obj.contextMenu.setDisableItem(3, true);
            }
        } , self);



        grd_obj.contextMenu.addItem({
            title : common.Util.TR('SQL Summary'),
            fn: function() {
                //
                var record = this.up().record;
                var sqlHistory = common.OpenView.open('SQLHistory', {
                    isWindow : false,
                    width    : 1200,
                    height   : 800,
                    fromTime : self.datePicker.getFromDateTime(),
                    toTime   : self.datePicker.getToDateTime(),
                    transactionNameTF: common.Util.cutOffTxnExtName(record['txn_name']),
                    sqlIdTF: record[id_name],
                    wasId : record['was_id']
                });

                setTimeout(function(){
                    sqlHistory.executeSQL();
                }, 300);
            }

        }, 2);


        grd_obj.contextMenu.addItem({
            title : common.Util.TR('Full SQL Text'),
            target: self,
            fn: function() {
                var targetRow = grd_obj.pnlExGrid.getSelectionModel().getSelection()[0].data;

                // MaxGauge 연동에 필요한 정보 설정
                var dbId  = Comm.RTComm.getDBIdyName(targetRow.instance_name);
                var sqlId = targetRow[id_name];
                var tid   = targetRow.tid;
                var fromTime = common.Util.getDate(self.datePicker.getFromDateTime());
                var toTime   = common.Util.getDate(self.datePicker.getToDateTime());

                var mxgParams = {
                    dbId    : dbId,
                    sqlUid  : sqlId,
                    tid     : tid,
                    fromTime: fromTime,
                    toTime  : toTime
                };

                //SQL Full Text 새창으로
                var bind_sql_text = Ext.create('view.FullSQLText_TOP10', {
                    mxgParams: mxgParams
                });
                bind_sql_text.arr_dt['sql_id']    = targetRow[id_name];
                bind_sql_text.arr_dt['txn_id']    = targetRow['txn_id'];
                bind_sql_text.arr_dt['was_id']    = this.target.wasCombo.getValue();
                bind_sql_text.arr_dt['from_time'] = Ext.util.Format.date(this.target.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00';
                bind_sql_text.arr_dt['to_time']   = Ext.util.Format.date(this.target.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59';
                bind_sql_text.loading_grd         = this.target.grd_active;
                bind_sql_text.init();
            }
        }, 3);
    } ,


    //-----------------------------------------------------------------------------------------------------------
    convert_bind: function(dt, idx){
        var tmp = [];

        if(!dt){
            return;
        }

        for (var ix = 0; ix < dt.length; ix++){
            tmp = common.Util.convertBindList(dt[ix][idx]);
            var resultTmp = [];

            for(var jx in tmp){
                resultTmp.push(tmp[jx].value);
            }
            dt[ix][idx] = resultTmp.join(', ');
        }
    } ,

    //-----------------------------------------------------------------------------------------------------------
    open_sql_text: function(sqlid, bind){
        var sql_text_form = Ext.create('Exem.FullSQLTextWindow');
        sql_text_form.getFullSQLText(sqlid, bind);
        sql_text_form.show();
    } ,

    //-----------------------------------------------------------------------------------------------------------
    _find_stat_type: function(title){
        var self = this;

        var ix = 0;
        var result;

        for (ix = 0; ix < self.all_stat_list['Stat'].length; ix++) {
            if ( common.Util.CTR(self.all_stat_list['Stat'][ix].name ) === common.Util.CTR(title)) {
                result = TrendStatChange.stat;
                break;
            }
        }

        for (ix = 0; ix < self.all_stat_list['GC'].length; ix++) {
            if ( common.Util.CTR(self.all_stat_list['GC'][ix].name) === common.Util.CTR(title)) {
                result = TrendStatChange.gc;
                break;
            }
        }

        for (ix = 0; ix < self.all_stat_list['Pool'].length; ix++) {
            if (self.all_stat_list['Pool'][ix].name === common.Util.CTR(title)) {
                result = TrendStatChange.pool;
                break;
            }
        }


        if (self.dbCombo.getValue() !== '' || self.dbCombo.getValue() == null) {
            for (ix = 0; ix < self.all_stat_list['Wait'].length; ix++) {
                if (self.all_stat_list['Wait'][ix].name === title) {
                    result = TrendStatChange.wait;
                    break;
                }
            }

            for (ix = 0; ix < self.all_stat_list['DB'].length; ix++) {
                if (self.all_stat_list['DB'][ix].name === title) {
                    result = TrendStatChange.db;
                    break;
                }
            }
        }

        ix = null;
        return result;
    } ,



    //-----------------------------------------------------------------------------------------------------------
    set_pnl_grid: function(txt, pnl_id, grd_id){
        var self = this;
        var parent = self.bot_pnl;

        var pnl = Ext.create('Exem.Panel',{
            layout   : 'vbox',
            title    : common.Util.TR(txt),
            itemId   : pnl_id,
            usePager : false,
            style : {
                background: '#ECECEC'
            },
            listeners:{
                afterlayout: function(){
                    self.bot_tab_change(pnl_id);
                }
            }
        });
        parent.add(pnl);
        var grd = Ext.create('Exem.BaseGrid', {
            itemId: grd_id,
            gridName: 'pa_performance_trend_'+grd_id+'gridName',
            celldblclick: function( thisGrid, td, cellIndex, record) {

                /*
                 * 1503.27 cellclick시 추가요청by정과장님.
                 * */

                if ( this.itemId !== 'grd_active' ){
                    return;
                }

                var sql_text = thisGrid.headerCt.getHeaderAtIndex(cellIndex);
                var id_name ;

                switch (sql_text.dataIndex){
                    case 'sql_text1':
                        id_name = 'sql_id1';
                        break;

                    case 'sql_text2':
                        id_name = 'sql_id2';
                        break;

                    case 'sql_text3':
                        id_name = 'sql_id3';
                        break;

                    case 'sql_text4':
                        id_name = 'sql_id4';
                        break;

                    case 'sql_text5':
                        id_name = 'sql_id5';
                        break;

                    default:
                        return;

                }

                if (sql_text === '' || !sql_text) {
                    id_name = null ;
                    return;
                }

                if ( record.data[id_name] === '' ) {
                    id_name = null ;
                    return ;
                }


                // MaxGauge 연동에 필요한 정보 설정
                var dbId  = Comm.RTComm.getDBIdyName(record.data.instance_name);
                var sqlId = record.data.sql_id1;
                var tid   = record.data.tid;
                var fromTime = common.Util.getDate(self.datePicker.getFromDateTime());
                var toTime   = common.Util.getDate(self.datePicker.getToDateTime());

                var mxgParams = {
                    dbId    : dbId,
                    sqlUid  : sqlId,
                    tid     : tid,
                    fromTime: fromTime,
                    toTime  : toTime
                };

                //SQL Full Text 새창으로
                var bind_sql_text = Ext.create('view.FullSQLText_TOP10', {
                    mxgParams: mxgParams
                });
                bind_sql_text.arr_dt['sql_id']    = record.data[id_name];
                bind_sql_text.arr_dt['txn_id']    = record.data['txn_id'];
                bind_sql_text.arr_dt['was_id']    = self.wasCombo.getValue();
                bind_sql_text.arr_dt['from_time'] = Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00';
                bind_sql_text.arr_dt['to_time']   = Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59';
                bind_sql_text.loading_grd         = self.grd_active;
                bind_sql_text.init();


                bind_sql_text = null ;
                sql_text = null ;
                id_name = null ;
            }
        });

        if (pnl_id === 'pnl_active'){
            var sub_pnl = Ext.create('Exem.Panel',{
                layout: 'vbox',
                width : '100%',
                flex  : 1
            });
            pnl.add(sub_pnl);
            sub_pnl.add(grd);
        }else{
            pnl.add(grd);
        }
        return grd;
    },


    //-----------------------------------------------------------------------------------------
    set_btn: function(btn_id, cls, width){
        var self = this;
        var result = null;
        var btn = Ext.create('Ext.container.Container',{
            itemId: btn_id,
            width : width,
            height: 18,
            cls   : cls,
            listeners:{
                render: function(){
                    var btn = this;
                    this.getEl().on('click', function(){

                        if (!self.flag_list.flag_refresh) {
                            return;
                        }

                        if (self.move_pos == null) {
                            return;
                        }

                        if (self.move_pos.y < 0) {
                            return;
                        }

                        var pos_x, pos_x2;

                        pos_x = new Date(self.move_pos.x);
                        pos_x2 = pos_x;

                        //click시 재쿼리 날리는 화면의 변수들 초기화.
                        self.flag_list.flag_locktree   = false;
                        self.flag_list.flag_active     = false;
                        self.flag_list.flag_process    = false;
                        self.flag_list.flag_active_sum = false;

                        if (btn.itemId === 'btn_move'){
                            var move_form      = Ext.create('view.PerformanceTrendMoveTime');
                            move_form.parent   = self;
                            move_form.was_name = self.wasCombo.WASDBCombobox.rawValue;
                            move_form.db_name = self.dbCombo.rawValue;
                            var tmp_log = new Date(self.click_time);
                            var tmp_str = tmp_log.getFullYear() +"-"+
                                ("0" + (tmp_log.getMonth()+1)).slice(-2) +"-"+
                                ("0" + tmp_log.getDate()).slice(-2) ;
                            move_form.log_date = tmp_str;
                            var click_hour_min_time = self._get_time_hour(self.click_time, 'hm');
                            move_form.init(click_hour_min_time);
                        }else{
                            if (!self.zoom_from) {
                                self.zoom_from = +new Date(self.datePicker.getFromDateTime());

                                var totime = new Date(self.datePicker.getToDateTime());
                                totime = new Date(totime);
                                self.zoom_to = (totime.getFullYear() +"-"+
                                    ("0" + (totime.getMonth()+1)).slice(-2) +"-"+
                                    ("0" + totime.getDate()).slice(-2) + " " +
                                    ("0" + totime.getHours()).slice(-2) + ":" +
                                    ("0" + totime.getMinutes()).slice(-2))  + ':' +
                                    ("00");
                            }

                            var current_time;
                            var last_time;
                            switch(btn.itemId){
                                case 'btn_prev':
                                    current_time = common.Util.getDate(pos_x);
                                    if (current_time <= common.Util.getDate(self.zoom_from)) {
                                        return;
                                    }

                                    self.move_pos.x = pos_x2.setMinutes(pos_x.getMinutes()-1);
                                    break;

                                case 'btn_next':
                                    current_time = common.Util.getDate(pos_x);
                                    last_time = new Date(self.zoom_to);

                                    if (current_time >= common.Util.getDate(last_time)) {
                                        return;
                                    }

                                    self.move_pos.x = pos_x2.setMinutes(pos_x.getMinutes()+1);
                                    break;

                                case 'btn_first':
                                    if (self.move_pos.x <= +new Date(self.zoom_from)) {
                                        return;
                                    }
                                    self.move_pos.x = +new Date(self.zoom_from);
                                    break;

                                case 'btn_last':

                                    if (self.move_pos.x >= +new Date(self.zoom_to)) {
                                        return;
                                    }

                                    last_time = new Date(self.zoom_to);
                                    self.move_pos.x = +new Date(last_time);
                                    break;

                                default :
                                    break;
                            }

                            self.click_time = self.move_line({ x: self.move_pos.x, y: self.move_pos.y });
                            self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));

                            if (!self.bot_pnl.collapsed){
                                if (self.bot_pnl.getActiveTab().itemId === 'pnl_active') {
                                    self.get_active_sec(self.click_time);
                                }
                                else if (self.bot_pnl.getActiveTab().itemId === 'pnl_process') {
                                    self.get_process(self.click_time);
                                }
                                else self.get_active_sum(self.click_time);
                            }

                            if (self.curr_sec['active'].length > 0){
                                self.curr_sec_frm['active'][0].getEl().setStyle('color', 'red');
                            }

                            self.curr_sec_frm['active'][0].getEl().setStyle('font-weight', 'bold');
                        }
                    });

                }
            }
        });
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

        result = btn;
        return result;
    },


    //-----------------------------------------------------------------------------------------
    get_stat_name: function(){
        var self = this;
        var is_visible ;
        var ix;

        if (self.all_stat_list['Stat'].length == 0){
            for (ix = 0; ix < self.was_stat.length; ix++)
                self.all_stat_list['Stat'].push({ name: self.was_stat[ix], value: self.was_stat_alias[ix] });

            for (ix = 0; ix < self.gc_stat.length; ix++)
                self.all_stat_list['GC'].push({ name: self.gc_stat[ix], value: self.gc_stat_alias[ix] });

            for (ix = 0; ix < self.default_db.length; ix++)
                self.all_stat_list['DB'].push({ name: self.default_db[ix], value: self.default_db[ix] });

            for (ix = 0; ix < self.default_wait.length; ix++)
                self.all_stat_list['Wait'].push({ name: self.default_wait[ix], value: self.default_wait[ix] });

            ix = null;
        }




        if (self.dbCombo.getValue() === '' || !self.dbCombo.getValue())
            is_visible = false;
        else {
            is_visible = true;
        }

        if (!self.stat_change){

            //statchange 미리만들어놓기.
            self.stat_change = Ext.create('view.PerformanceTrendStatChangeWindow',{
                instanceId: self.dbCombo.getValue(),
                was_id    : self.wasCombo.getValue(),
                stat_data : self.all_stat_list,
                useTab: {
                    stat : true,
                    db   : true,//is_visible,
                    wait : true,//is_visible,
                    gc   : true ,
                    pool : true
                },
                okFn: function(type, name, id){
                    console.info('선택된 타입??', type);
                    console.info('선택된 이름??', name);
                    console.info('선택된 아이디??', id);
                    /*
                     * 1411.05
                     * pool이 추가가되면서 statchange 파라미터가 하나더 늘었다.
                     * title이라는 파라미터인데, 기존꺼에는 null이 넘어올것이고,
                     * pool의경우에는 마지막 id 파라미터에 pool_id 가 넘어온다.
                     *
                     * */

                    //타이틀 업데이트
                    self.title_update(self.target_chart, name);

                    if (name === 'JVM Free Heap (MB)' || name ==='OS Free Memory (MB)'){
                        self.target_chart.setLegendText(0, common.Util.CTR('AVG'));
                        self.target_chart.setLegendText(1, common.Util.CTR('MIN'));
                    }

                    //type == 4는 pool을 의미한다.
                    if ( type == '4' ){
                        self.target_chart.pool_id = id ;
                        self.target_chart.setLegendText(0, common.Util.CTR('MAX'));
                        self.target_chart.setLegendText(1, common.Util.CTR('Active(MAX)'));
                        self.target_chart.setLegendText(2, common.Util.CTR('Active(AVG)'));
                        self.target_chart.setSeriesVisible(1, true);
                        self.target_chart.setSeriesVisible(2, true);
                        self.target_chart.setSeriesLegendVisible(1, true) ;
                        self.target_chart.setSeriesLegendVisible(2, true);
                    }


                    if (!self.flag_list.flag_refresh) {
                        return;
                    }
                    //쿼리 재조회
                    var active_tab = self.mid_pnl.getActiveTab().itemId;
                    self.get_mid_chart(active_tab);
                }
            });
            self.stat_change.init();


            setTimeout(function(){
                //chart view 폼 미리 만들기
                self.chart_view_frm                    = Ext.create('view.PerformanceTrendUserDefined');
                self.chart_view_frm.is_visible         = is_visible;
                self.chart_view_frm.scope              = self;
                self.chart_view_frm.total_stat_list    = self.all_stat_list;
                self.chart_view_frm.curr_active_tab    = self.mid_pnl.getActiveTab();
                self.chart_view_frm.db_id              = self.dbCombo.getValue();
                self.chart_view_frm.flag_refresh       = self.flag_list.flag_refresh;
                self.chart_view_frm.view_name          = 'performance_trend' ;
                self.chart_view_frm.visible_stat_list  = ['stat', 'db', 'wait', 'gc'] ;
                self.chart_view_frm.db_visible         = true ;
                self.chart_view_frm.wait_visible       = true ;

                self.chart_view_frm.init_form();

                //timeout때문에 처음에는 db가 visible이면 true주고 그다음부턴 on_stat_change_data함수안에서.
                if ( self.dbCombo.getValue() !== null && self.dbCombo.getValue() !== '' ){
                    self.chart_view_frm.left_tab_pnl.items.items[1].setVisible(true);
                    self.chart_view_frm.left_tab_pnl.items.items[1].tab.setVisible(true);
                    self.chart_view_frm.left_tab_pnl.items.items[2].setVisible(true);
                    self.chart_view_frm.left_tab_pnl.items.items[2].tab.setVisible(true);

                    self.get_db_data() ;
                }else{
                    self.chart_view_frm.left_tab_pnl.items.items[1].setVisible(false);
                    self.chart_view_frm.left_tab_pnl.items.items[1].tab.setVisible(false);
                    self.chart_view_frm.left_tab_pnl.items.items[2].setVisible(false);
                    self.chart_view_frm.left_tab_pnl.items.items[2].tab.setVisible(false);
                }

            }, 1000);
        }


        if ( self.chart_view_frm !== undefined ) {
            self.get_db_data() ;
        }


    } ,


    //-----------------------------------------------------------------------------------------
    get_db_data: function(){

        this.all_stat_list['DB'].length = 0;
        this.all_stat_list['Wait'].length = 0;
        if ( this.dbCombo.getValue() === '' ){
            return ;
        }
        WS.SQLExec({
            sql_file: this.sql.stat_change_s,
            bind: [{ name: 'db_id', value: this.dbCombo.getValue(), type: SQLBindType.INTEGER }]
        }, this.on_stat_change_data, this);

        WS.SQLExec({
            sql_file: this.sql.stat_change_w,
            bind: [{ name: 'db_id', value: this.dbCombo.getValue(), type: SQLBindType.INTEGER }],
            replace_string: [{
                name : 'IDLE_EVENT',
                value: common.DataModule.referenceToDB.eventName
            }]
        }, this.on_stat_change_data, this);
    } ,


    //-----------------------------------------------------------------------------------------
    on_stat_change_data: function(header, data){
        var self = this;

        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.error('PerformaceTrend-on_stat_change_data');
            console.error(header);
            console.error(data);
            return;
        }

        switch(header.command){
            case self.sql.stat_change_s:
                //statchange
                self.stat_change.addDBList(data) ;

                if ( self.chart_view_frm !== undefined ){
                    //user defined
                    self.chart_view_frm.stat_change.addDBList(data) ;

                    var db_tab_left  = self.chart_view_frm.left_tab_pnl.items.items[1],
                        db_tab_right = self.chart_view_frm.stat_change.items.items[1] ;

                    if ( data.rows.length > 0 ) {

                        self.stat_change.statTab.items.items[1].setVisible(true) ;
                        self.stat_change.statTab.items.items[1].tab.setVisible(true) ;

                        db_tab_left.setVisible(true);
                        db_tab_left.tab.setVisible(true);
                        db_tab_right.setVisible(true);
                        db_tab_right.tab.setVisible(true);
                    }
                    db_tab_left  = null ;
                    db_tab_right = null ;
                }

                break;

            //wait
            case self.sql.stat_change_w:
                self.stat_change.addWaitList(data) ;

                if ( self.chart_view_frm !== undefined ){

                    self.chart_view_frm.stat_change.addWaitList(data) ;

                    var wait_tab_left  = self.chart_view_frm.left_tab_pnl.items.items[2],
                        wait_tab_right = self.chart_view_frm.stat_change.items.items[2] ;

                    if ( data.rows.length > 0 ) {

                        self.stat_change.statTab.items.items[2].setVisible(true) ;
                        self.stat_change.statTab.items.items[2].tab.setVisible(true) ;

                        wait_tab_left.setVisible(true);
                        wait_tab_left.tab.setVisible(true);
                        wait_tab_right.setVisible(true);
                        wait_tab_right.tab.setVisible(true);
                    }
                    wait_tab_left  = null ;
                    wait_tab_right = null ;

                    self.chart_view_frm.left_tab_pnl.setActiveTab( 0 ) ;
                    self.chart_view_frm.stat_change.setActiveTab( 0 ) ;
                }
                break;

            default :
                break;
        }
    } ,

    //-----------------------------------------------------------------------------------------
    init_flag_set: function(){
        var self = this;

        self.flag_list.flag_top_active = false ;

        self.flag_list.flag_zoom['mid_db']    = false;
        self.flag_list.flag_zoom['mid_wait']  = false;
        self.flag_list.flag_zoom['mid_os']    = false;
        self.flag_list.flag_zoom['mid_gc']    = false;

        self.flag_list.flag_refresh      = false;
        self.flag_list.flag_execute      = false;
        self.zoom_mode                   = false;

        self.flag_list.flag_was          = false;
        self.flag_list.flag_db           = false;
        self.flag_list.flag_wait         = false;
        self.flag_list.flag_os           = false;
        self.flag_list.flag_locktree     = false;
        self.flag_list.flag_gc           = false;

        self.flag_list.flag_active       = false;
        self.flag_list.flag_process      = false;
        self.flag_list.flag_active_sum   = false;

        self.mid_pnl.setActiveTab(0);
        self.bot_pnl.setActiveTab(0);

        self.curr_sec['active'].length = 0;
        self.curr_sec['lock'].length = 0;

        self.zoom_from = null;
        self.zoom_to   = null;


        if (self.chart_active == null) {
            return;
        }
        self.chart_active.clearDependentChart();
    } ,


    //-----------------------------------------------------------------------------------------
    set_sec: function(_sec, _sec_frm){
        var ix ;
        var pnl ;
        var sec ;
        var frm_pnl ;

        for ( ix = 0; ix < _sec_frm.length; ix++){
            pnl = _sec_frm[ix];
            pnl.getEl().setStyle('color', '#dadada');
        }

        if (_sec.length > 0){
            for ( ix = 0; ix < _sec.length; ix++){
                sec = _sec[ ix ];
                frm_pnl = _sec_frm[ sec ];
                if (!frm_pnl) {
                    continue;
                }
                frm_pnl.getEl().setStyle('color', 'black');
                frm_pnl.getEl().setStyle('font-weight', 'normal');
                frm_pnl.getEl().setStyle('cursor', 'pointer');
                frm_pnl.enable();
            }
        }

        ix = null ;
        pnl = null ;
        sec = null ;
        frm_pnl = null ;
    },


    //-----------------------------------------------------------------------------------------
    sec_60_frm: function(type){
        var self = this;
        var parent ,
            arr_frm,
            info;
        var sec_pnl;

        if (type === 'active') {
            parent = self.bot_pnl.getComponent('pnl_active');
            arr_frm = self.curr_sec_frm['active'];
            info = {cb:self.on_bot_data, scope: self, type:'active'};

            sec_pnl = Ext.create('Exem.Container', {
                layout: 'hbox',
                align : 'stretch',
                itemid: 'sec_pnl',
                height: 15,
                width : 1310
            });

        }else{  // Lock
            parent = self.pnl_locktree;
            arr_frm = self.curr_sec_frm['lock'];
            info = {cb:self.on_mid_data, scope: self, type:'lock'};

            sec_pnl = Ext.create('Exem.Container', {
                layout: 'hbox',
                align : 'stretch',
                itemid: 'sec_pnl',
                height: 15,
                width : 1200
            });
        }

        parent.add(sec_pnl);

        var caption , arr_sec_btn = [];
        for (var ix = 0; ix <= 59; ix++){
            if (ix == 0)  {
                caption = '00';
            }else {
                if (ix < 10){
                    caption = '0'+ix;
                }else{
                    caption = ix;
                }
            }
            var pnl_secfrm = Ext.create('Exem.Container', {
                flex: 1,
                html: caption,
                itemId: 'sec'+ix.toString(),
                dbclick_info: info,
                disabled: true,
                style: {
                    'font-size'       : self.titleFontSize,
                    'color'           : '#dadada',
                    'background-color': 'white',//'#EBEBEB',
                    'font-family'     : 'Roboto Condensed',
                    'font-weight'     : 500
                }
            });

            pnl_secfrm.on({
                render: {fn: self.sec_click, scope: pnl_secfrm}
            });
            arr_frm.push(pnl_secfrm);
            arr_sec_btn.push(pnl_secfrm);

        }
        sec_pnl.add(arr_sec_btn);
        if (type === 'active') {
            sec_pnl.add({xtype: 'tbspacer', flex: 1});
            self.btn_sec_first = self.set_sec_btn(sec_pnl, 'btn_sec_first',  'firstLeftOFF'  , 21);
            self.btn_sec_prev  = self.set_sec_btn(sec_pnl, 'btn_sec_prev' ,  'leftMoveOFF'   , 21);
            self.btn_sec_next  = self.set_sec_btn(sec_pnl, 'btn_sec_next' ,  'rightMoveOFF'  , 21);
            self.btn_sec_last  = self.set_sec_btn(sec_pnl, 'btn_sec_last' ,  'firstRightOFF' , 21);
        }
    } ,

    set_sec_btn: function(parent, btn_id, cls, width){
        var self = this;
        var btn = Ext.create('Ext.container.Container',{
            itemId: btn_id,
            width : width,
            height: 18,
            cls   : cls,
            listeners:{
                render: function(){
                    var btn = this;
                    this.getEl().on('click', function(){
                        var ix;

                        if (!self.flag_list.flag_refresh || self.curr_sec['active'].length < 1) {
                            return;
                        }

                        var curr_sec;
                        switch (btn.itemId){
                            case 'btn_sec_first':
                                //맨첨
                                curr_sec = self.curr_sec['active'][0];

                                //현재 0초에 있는데도 0초를 눌렀다면 그냥 리턴.
                                if (self.curr_sec_frm['active'][curr_sec].el.dom.style.color === 'rgb(218, 218, 218)') {
                                    return;
                                }

                                self.call_active_sec_data(curr_sec);
                                break;

                            case 'btn_sec_prev':
                                //지금 클릭한 시점에서부터 1초전.
                                var prev_sec;

                                for (ix = 0; ix < self.curr_sec['active'].length; ix++){
                                    curr_sec = self.curr_sec['active'][ix];
                                    if (self.curr_sec_frm['active'][curr_sec].el.dom.style.color === 'black') {
                                        continue;
                                    }

                                    if (ix == 0) {
                                        return;
                                    }
                                    else {
                                        prev_sec = self.curr_sec['active'][ix-1];
                                    }
                                    break;
                                }
                                self.call_active_sec_data(prev_sec);

                                break;

                            case 'btn_sec_next':
                                //지금 클릭한 시점에서부터 1초후.
                                var next_sec, last_sec;


                                last_sec = self.curr_sec['active'].length-1;
                                for (ix = 0; ix < self.curr_sec['active'].length; ix++){
                                    curr_sec = self.curr_sec['active'][ix];
                                    if (self.curr_sec_frm['active'][curr_sec].el.dom.style.color === 'black') {
                                        continue;
                                    }

                                    if (ix == last_sec) {
                                        return;
                                    }
                                    else {
                                        next_sec = self.curr_sec['active'][ix+1];
                                    }
                                    break;
                                }
                                self.call_active_sec_data(next_sec);

                                break;

                            case 'btn_sec_last':
                                curr_sec = self.curr_sec['active'][self.curr_sec['active'].length - 1];

                                //마지막에 있는데 또 누르면 리턴
                                if (self.curr_sec_frm['active'][curr_sec].el.dom.style.color === 'red') {
                                    return;
                                }

                                self.call_active_sec_data(curr_sec);

                                break;
                            default :
                                break;
                        }

                    });
                }
            }
        });
        parent.add(btn);

    } ,


    showMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : title,
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    },



    //현재 초데이터를 초기화시키고, 선택된 패널 enable처리하고, 레이블현재시간으로 세팅하고, active session데이터 재로드.
    call_active_sec_data: function(curr_sec){
        var self = this;

        self.set_sec(self.curr_sec['active'], self.curr_sec_frm['active']);
        self.curr_sec_frm['active'][curr_sec].getEl().setStyle('color', 'red');
        self.curr_sec_frm['active'][curr_sec].getEl().setStyle('font-weight', 'bold');

        if (curr_sec < 10) {
            curr_sec = '0'+curr_sec;
        }
        var from = new Date(self.click_time);
        var curr_time = from.getFullYear() +"-"+
            ("0" + (from.getMonth()+1)).slice(-2) +"-"+
            ("0" + from.getDate()).slice(-2) + " " +
            ("0" + from.getHours()).slice(-2) + ":" +
            ("0" + from.getMinutes()).slice(-2) + ":" +
            (curr_sec);

        self.click_time = curr_time;
        self.lbl_time.setText(Ext.util.Format.date(new Date(self.click_time), Comm.dateFormat.HMS));
        self.get_active_data(self.click_time);


        self = null ;
    }
});
