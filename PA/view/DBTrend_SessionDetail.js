/**
 * Created by min on 14. 3. 1.
 */
Ext.define('view.DBTrend_SessionDetail',{
    extend   : 'Exem.XMWindow',
    layout     : 'border',
    width      : 1000,
    height     : 700,
    minWidth   : 1000,
    title      : 'Session Detail',
    closable   : true,
    maximizable: false,
    type       : null,
    sql: {
        session_qry    : 'IMXPA_DBTrend_SessionDetail.sql',
        stat_qry       : 'IMXPA_DBTrend_SessionDetail_Stat.sql',
        rtm_cpu_qry    : 'IMXPA_DBMonitor_CPU.sql',
        rtm_session_qry: 'IMXPA_DBMonitor_Session.sql',
        rtm_stat_qry   : 'IMXPA_DBMonitor_Stat.sql'
    },
    cls: 'Exem-Form-workArea',
    style: {
        background: '#e8e8e8'
    },

    flag_list: {
        cpu: false,
        lreads: false,
        preads: false,
        exec: false,
        redo: false
    },

    //pa용 배열
    cht_dt_list: {
        cpu   : [],
        lreads: [],
        preads: [],
        exec  : [],
        redo  : []
    } ,

    //rtm용 배열 -> 여따가 액티비티껏도 추가해서 해야된답니다 그건 나중에 종호가 하면 하겠음둥.
    cht_stat_dt_list: {
        cpu   : [],
        lreads: [],
        preads: [],
        exec  : [],
        redo  : []
    } ,

    rtm_legend_list: [
                        'System',
                        'Session'
                    ],

    necessary_dt : {
        db_id     : null,
        from_time : null,
        to_time   : null,
        logon_time: null,
        sid       : null,
        serial    : null
    },
    db_name: null,


    sess_info_value_list: [],

    init_variable: function(){
        var self = this ;

        self.sess_info_value_list = [] ;
        self.cht_dt_list = {
                cpu   : [],
                lreads: [],
                preads: [],
                exec  : [],
                redo  : []
        };
    },

    init: function(){
        var self = this ;
        //오브젝, 배열 초기화

        self.init_variable() ;

        self.init_center_layout() ;
        self.init_bot_layout() ;

        self.init_form_title( self.db_name ) ;
        self.dt_gathering() ;
    } ,

    dt_gathering: function(){
        var self = this ;
        self.get_session_list() ;
    } ,

    get_session_list: function(){
        var self = this ;

        if ( self.type == 'PA' ){
            //session
            var dt_sess = {} ;
            dt_sess.sql_file = self.sql.session_qry ;
            dt_sess.bind = [{
                name : 'fromtime',
                type : SQLBindType.STRING,
                value: self.necessary_dt.from_time
            },{
                name : 'totime',
                type : SQLBindType.STRING,
                value: self.necessary_dt.to_time
            },{
                name : 'fdb_id',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.db_id
            },{
                name : 'fsid',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.sid
            },{
                name : 'fserial',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.serial
            },{
                name : 'logon_time',
                type : SQLBindType.STRING,
                value: self.necessary_dt.logon_time
            }]  ;
            WS.SQLExec( dt_sess, self.on_dt, self ) ;

            //stat
            var dt_stat = {} ;
            dt_stat.sql_file = self.sql.stat_qry ;
            dt_stat.bind = [{
                name : 'fromtime',
                type : SQLBindType.STRING,
                value: self.necessary_dt.from_time
            },{
                name : 'totime',
                type : SQLBindType.STRING,
                value: self.necessary_dt.to_time
            },{
                name : 'fdb_id',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.db_id
            },{
                name : 'fsid',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.sid
            },{
                name : 'fserial',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.serial
            },{
                name : 'logon_time',
                type : SQLBindType.STRING,
                value: self.necessary_dt.logon_time
            }]  ;
            WS.SQLExec( dt_stat, self.on_dt, self ) ;
        }else{ //RTM
            //cpu
            var dt_cpu = {} ;
            dt_cpu.sql_file = self.sql.rtm_cpu_qry ;
            dt_cpu.bind = [{
                name : 'fdb_id',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.db_id
            },{
                name : 'last_time',
                type : SQLBindType.STRING,
                value: self.necessary_dt.from_time
            }];
            WS.SQLExec( dt_cpu, self.on_rtm_dt, self ) ;


            //session
            var dt_rtm_sess = {} ;
            dt_rtm_sess.sql_file = self.sql.rtm_session_qry ;
            dt_rtm_sess.bind = [{
                name : 'fdb_id',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.db_id
            },{
                name : 'fsid',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.sid
            },{
                name : 'fserial',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.serial
            },{
                name : 'last_time',
                type : SQLBindType.STRING,
                value: self.necessary_dt.from_time
            },{
                name : 'logon_time',
                type : SQLBindType.STRING,
                value: self.necessary_dt.logon_time
            }]  ;
            WS.SQLExec( dt_rtm_sess, self.on_rtm_dt, self ) ;

            //stat
            var dt_rtm_stat = {} ;
            dt_rtm_stat.sql_file = self.sql.rtm_cpu_qry ;
            dt_rtm_stat.bind = [{
                name : 'fdb_id',
                type : SQLBindType.INTEGER,
                value: self.necessary_dt.db_id
            },{
                name : 'last_time',
                type : SQLBindType.STRING,
                value: self.necessary_dt.from_time
            }];
            WS.SQLExec( dt_rtm_stat, self.on_rtm_dt, self ) ;
        }

    } ,

    on_dt: function( h, dt ){
        var self = this ;
        switch( h.command ){
            case self.sql.session_qry:
                for ( var ix = 0 ; ix < dt.rows.length; ix++ ){
                    //session list
                    self.grd_sess_list.addRow([  dt.rows[ix][ 0]       //time
                        ,dt.rows[ix][ 1]       //db_id
                        ,dt.rows[ix][29]       //was_name
                        ,dt.rows[ix][31]       //txn_namee
                        ,dt.rows[ix][ 2]       //sid
                        ,dt.rows[ix][ 3]       //serial
                        ,dt.rows[ix][ 4]       //spid
                        ,dt.rows[ix][ 5]       //cpid
                        ,dt.rows[ix][ 6]       //logon_time
                        ,dt.rows[ix][ 7]       //audsid
                        ,dt.rows[ix][ 8]       //schema_name
                        ,dt.rows[ix][ 9]       //use_name
                        ,dt.rows[ix][10]       //os_user
                        ,dt.rows[ix][11]       //machine
                        ,dt.rows[ix][12]       //terminal
                        ,dt.rows[ix][13]       //program
                        ,dt.rows[ix][14]       //module
                        ,dt.rows[ix][15]       //action
                        ,dt.rows[ix][16]       //status
                        ,dt.rows[ix][17]       //elapse_time
                        ,dt.rows[ix][18]       //command
                        ,dt.rows[ix][20]       //cpu
                        ,dt.rows[ix][21]       //logical_read_d
                        ,dt.rows[ix][22]       //physical_read_d
                        ,dt.rows[ix][23]       //exec_count_d
                        ,dt.rows[ix][24]       //redo_d
                        ,dt.rows[ix][19]       //wait_event
                        ,dt.rows[ix][25]       //sql_text
                        ,dt.rows[ix][26]       //sql_address
                        ,dt.rows[ix][27]       //sql_hash_value
                        ,dt.rows[ix][28]       //was_id
                        ,dt.rows[ix][30]       //txn_id
                        ,dt.rows[ix][32]       //sql_id
                        ,dt.rows[ix][33]       //client_info
                    ]) ;

                    //session info data gathering..
                    if ( ix == dt.rows.length-1 ){
                        self.sess_info_value_list.push(dt.rows[ix][ 2]) ; //sid
                        self.sess_info_value_list.push(dt.rows[ix][ 3]) ; //serial
                        self.sess_info_value_list.push(dt.rows[ix][ 4]) ; //spid
                        self.sess_info_value_list.push(dt.rows[ix][ 5]) ; //cpid
                        self.sess_info_value_list.push(dt.rows[ix][ 6]) ; //logon time
                        self.sess_info_value_list.push(dt.rows[ix][ 7]) ; //audsid
                        self.sess_info_value_list.push(dt.rows[ix][ 8]) ; //schema
                        self.sess_info_value_list.push(dt.rows[ix][ 9]) ; //user name
                        self.sess_info_value_list.push(dt.rows[ix][10]) ; //os user
                        self.sess_info_value_list.push(dt.rows[ix][11]) ; //machine
                        self.sess_info_value_list.push(dt.rows[ix][12]) ; //terminal
                        self.sess_info_value_list.push(dt.rows[ix][13]) ; //program
                        self.sess_info_value_list.push(dt.rows[ix][14]) ; //module
                        self.sess_info_value_list.push(dt.rows[ix][15]) ; //action
                    }

                    //sql used
                    if ( dt.rows[ix][25] !== '' ){
                        self.grd_sql_used.addRow([ dt.rows[ix][0] //time
                            ,dt.rows[ix][25]
                        ]) ;
                    }
                } // end for
                self.grd_sess_list.drawGrid() ;
                self.get_sess_info() ;
                self.grd_sql_used.drawGrid() ;
                break ;


            case self.sql.stat_qry:
                var param = h.parameters ;
                for ( ix = 0 ; ix < dt.rows.length; ix++ ){
                    var time = dt.rows[ix][0] ;
                    self.cht_dt_list['cpu'].push( [ time, dt.rows[ix][1] ] ) ;
                    self.cht_dt_list['lreads'].push( [ time, dt.rows[ix][2] ] ) ;
                    self.cht_dt_list['preads'].push( [ time, dt.rows[ix][3] ] ) ;
                    self.cht_dt_list['exec'].push( [ time, dt.rows[ix][4] ] ) ;
                    self.cht_dt_list['redo'].push( [ time, dt.rows[ix][5] ] ) ;
                }  //end for

                //cpu
                self.cht_cpu.addValues( {
                    from: param.bind[0].value,
                    to  : param.bind[1].value,
//                    interval: 60000 ,
                    time: 0,
                    data: self.cht_dt_list['cpu'],
                    series: {'cht': 1}
                } ) ;

                //lreads
                self.cht_lreads.addValues( {
                    from: param.bind[0].value,
                    to  : param.bind[1].value,
//                    interval: 60000 ,
                    time: 0,
                    data: self.cht_dt_list['lreads'],
                    series: {'cht': 1}
                } ) ;

                //preads
                self.cht_preads.addValues( {
                    from: param.bind[0].value,
                    to  : param.bind[1].value,
//                    interval: 60000 ,
                    time: 0,
                    data: self.cht_dt_list['preads'],
                    series: {'cht': 1}
                } ) ;

                //executes
                self.cht_exec.addValues( {
                    from: param.bind[0].value,
                    to  : param.bind[1].value,
//                    interval: 60000 ,
                    time: 0,
                    data: self.cht_dt_list['exec'],
                    series: {'cht': 1}
                } ) ;

                //redo
                self.cht_redo.addValues( {
                    from: param.bind[0].value,
                    to  : param.bind[1].value,
//                    interval: 60000 ,
                    time: 0,
                    data: self.cht_dt_list['redo'],
                    series: {'cht': 1}
                } ) ;

                var active_tab =  self.tab_pnl.getActiveTab().itemId ;
                self.top_tab_change( active_tab ) ;
                self.loadingMask.hide();
                break ;

            default:
                break;
        }
    },

    on_rtm_dt: function( h, dt ){
        var self = this ;

        switch ( h.command ){
            case self.sql.rtm_cpu_qry:
                for ( var ix = 0 ; ix < dt.rows.length ; ix++ ){
                    var time = dt.rows[ix][0] ;
                    self.cht_stat_dt_list['cpu'].push( [time, dt.rows[ix][1]] ) ;
                }
                break ;

            case self.sql.rtm_session_qry :
                for ( ix = 0 ; ix < dt.rows.length; ix++ ){
                    //session list
                    self.grd_sess_list.addRow([  dt.rows[ix][ 0]       //time
                        ,dt.rows[ix][ 1]       //db_id
                        ,dt.rows[ix][29]       //was_name
                        ,dt.rows[ix][31]       //txn_namee
                        ,dt.rows[ix][ 2]       //sid
                        ,dt.rows[ix][ 3]       //serial
                        ,dt.rows[ix][ 4]       //spid
                        ,dt.rows[ix][ 5]       //cpid
                        ,dt.rows[ix][ 6]       //logon_time
                        ,dt.rows[ix][ 7]       //audsid
                        ,dt.rows[ix][ 8]       //schema_name
                        ,dt.rows[ix][ 9]       //use_name
                        ,dt.rows[ix][10]       //os_user
                        ,dt.rows[ix][11]       //machine
                        ,dt.rows[ix][12]       //terminal
                        ,dt.rows[ix][13]       //program
                        ,dt.rows[ix][14]       //module
                        ,dt.rows[ix][15]       //action
                        ,dt.rows[ix][16]       //status
                        ,dt.rows[ix][17]       //elapse_time
                        ,dt.rows[ix][18]       //command
                        ,dt.rows[ix][20]       //cpu
                        ,dt.rows[ix][21]       //logical_read_d
                        ,dt.rows[ix][22]       //physical_read_d
                        ,dt.rows[ix][23]       //exec_count_d
                        ,dt.rows[ix][24]       //redo_d
                        ,dt.rows[ix][19]       //wait_event
                        ,dt.rows[ix][25]       //sql_text
                        ,dt.rows[ix][26]       //sql_address
                        ,dt.rows[ix][27]       //sql_hash_value
                        ,dt.rows[ix][28]       //was_id
                        ,dt.rows[ix][30]       //txn_id
                        ,dt.rows[ix][32]       //sql_id
                        ,dt.rows[ix][33]       //client_info
                    ]) ;

                    //session info data gathering..
                    if ( ix == dt.rows.length-1 ){
                        self.sess_info_value_list.push(dt.rows[ix][ 2]) ; //sid
                        self.sess_info_value_list.push(dt.rows[ix][ 3]) ; //serial
                        self.sess_info_value_list.push(dt.rows[ix][ 4]) ; //spid
                        self.sess_info_value_list.push(dt.rows[ix][ 5]) ; //cpid
                        self.sess_info_value_list.push(dt.rows[ix][ 6]) ; //logon time
                        self.sess_info_value_list.push(dt.rows[ix][ 7]) ; //audsid
                        self.sess_info_value_list.push(dt.rows[ix][ 8]) ; //schema
                        self.sess_info_value_list.push(dt.rows[ix][ 9]) ; //user name
                        self.sess_info_value_list.push(dt.rows[ix][10]) ; //os user
                        self.sess_info_value_list.push(dt.rows[ix][11]) ; //machine
                        self.sess_info_value_list.push(dt.rows[ix][12]) ; //terminal
                        self.sess_info_value_list.push(dt.rows[ix][13]) ; //program
                        self.sess_info_value_list.push(dt.rows[ix][14]) ; //module
                        self.sess_info_value_list.push(dt.rows[ix][15]) ; //action
                    }

                    //sql used
                    if ( dt.rows[ix][25] !== '' ){
                        self.grd_sql_used.addRow([ dt.rows[ix][0] //time
                            ,dt.rows[ix][25]
                        ]) ;
                    }
                } // end for
                self.grd_sess_list.drawGrid() ;
                self.get_sess_info() ;
                self.grd_sql_used.drawGrid() ;
                break ;

            case self.sql.rtm_stat_qry:
                for ( ix = 0 ; ix < dt.rows.length ; ix++ ){
                    time = dt.rows[ix][0] ;
                    switch( dt.rows[ix][1] ){
                        case 'session logical reads':
                            self.cht_stat_dt_list['lreads'].push( [time, dt.rows[ix][2]] ) ;
                            break ;

                        case 'physical reads':
                            self.cht_stat_dt_list['preads'].push( [time, dt.rows[ix][2]] ) ;
                            break ;

                        case 'redo entries':
                            self.cht_stat_dt_list['redo'].push( [time, dt.rows[ix][2]] ) ;
                            break ;

                        case 'execute count':
                            self.cht_stat_dt_list['exec'].push( [time, dt.rows[ix][2]] ) ;
                            break ;

                        default:
                            break;
                    }
                }
                break ;

            default : break ;
        }
    },

    //session info tab draw..
    get_sess_info: function(){
        var self = this ;
        var tab_sess_info = self.tab_bot_pnl.getComponent('sess_info') ;

        var left_area = Ext.create('Ext.container.Container',{
            width : 120,
            height: '100%',
            layout: 'vbox'
        });

        var right_area = Ext.create('Ext.container.Container',{
            flex  : 1,
            height: '100%',
            layout: 'vbox'
        });

        var sess_info_name_list = ['SID'
                                 , 'Serial'
                                 , 'SPID'
                                 , 'CPID'
                                 , 'Logon Time'
                                 , 'AUDSID'
                                 , 'Schema'
                                 , 'User Name'
                                 , 'OS User'
                                 , 'Machine'
                                 , 'Terminal'
                                 , 'Program'
                                 , 'Module'
                                 , 'Action'
                                 ] ;

        for ( var ix = 0; ix < self.sess_info_value_list.length; ix++ ){
            left_area.add({
                xtype : 'label',
                width : '100%',
                style : {'text-align': 'right'},
                margin: '5 0 0 0' ,
                itemId: sess_info_name_list[ix],
                text  : common.Util.TR(sess_info_name_list[ix]) + " : "
            }) ;

            var lbl_val = Ext.create('Ext.form.Label',{
                xtype : 'label',
                margin: '5 0 0 10',
                width : '100%',
                text  : common.Util.TR(self.sess_info_value_list[ix]) ,
                style : {
                    '-webkit-user-select': 'text',
                    '-moz-user-select': 'text',
                    '-ms-user-select': 'text',
                    'user-select': 'text'
                }
            });

            right_area.add( lbl_val ) ;

            if ( common.Util.TR(self.sess_info_value_list[ix]) == '' ){
                lbl_val.margin = '20 0 0 10' ;
            }

            lbl_val = null ;
        }  // end for

        tab_sess_info.add( left_area ) ;
        tab_sess_info.add( right_area ) ;
    } ,


    init_center_layout: function(){
        var self = this ;

        self.tab_pnl = Ext.create('Exem.TabPanel',{
            region: 'center',
            width : '100%',
            flex  : 1,
            listeners: {
                render: function(){
                    self.tab_header = self.tab_pnl.getTabBar() ;
                    self.tab_header.add({
                        xtype: 'tbspacer',
                        flex : 1

                    });
                    self.tab_header.add({
                        xtype   : 'checkbox',
                        boxLabel: common.Util.TR('Refresh'),
                        itemId  : 'chk_refresh',
                        checked : true
                    }) ;
                },
                afterrender: function(){
                    var refresh = self.tab_header.getComponent('chk_refresh') ;
                    if ( self.type == 'PA' )
                        refresh.setVisible( false ) ;
                    else
                        refresh.setVisible( true ) ;
                }
            }
        }) ;
        self.add( self.tab_pnl ) ;

        self.cht_activity = self.create_chart( self.tab_pnl, 'Activity'    , 'activity') ;
        self.cht_cpu      = self.create_chart( self.tab_pnl, 'CPU'         , 'cpu'     ) ;
        self.cht_lreads   = self.create_chart( self.tab_pnl, 'L/Reads'     , 'lreads'  ) ;
        self.cht_preads   = self.create_chart( self.tab_pnl, 'P/Leads'     , 'preads'  ) ;
        self.cht_exec     = self.create_chart( self.tab_pnl, 'Executions'  , 'exec'    ) ;
        self.cht_redo     = self.create_chart( self.tab_pnl, 'Redo Entries', 'redo'    ) ;

        if ( self.type == 'PA' ){
            self.tab_pnl.items.items[0].tab.setVisible( false ) ;
            self.tab_pnl.setActiveTab( 1 ) ;
        }else{
            self.tab_pnl.setActiveTab( 0 ) ;
        }

    } ,
    create_chart: function( parent, title, cht_id ){
        var self = this ;
        var result = null ;

        var pnl = Ext.create('Exem.Panel',{
            layout: 'fit',
            height: '100%',
            width : '100%',
            title : title,
            itemId: cht_id,
            listeners:{
                afterlayout: function(){
                    self.top_tab_change(cht_id) ;
                }
            }
        }) ;
        parent.add(pnl) ;

        var chart = Ext.create('Exem.chart.CanvasChartLayer', {
            width              : '100%',
            height             : '100%',
            itemId             : cht_id ,
            interval           : 3000,
            showLegend         : true,
            showLegendValueArea: true,
            legendTextAlign    : 'east',
            mouseSelect        : false,
            showIndicator      : false,
            showTooltip        : true,
            toolTipFormat      : '%x [value:%y] ',
            toolTipTimeFormat  : '%H:%M',
            chartProperty      : {
                yLabelWidth: 50,
                xLabelFont: {size: 8, color: 'black'},
                yLabelFont: {size: 8, color: 'black'}
            }
        }) ;
        if ( self.type == 'PA' ){
            chart.addSeries({
                label: common.Util.TR(title),
                id   : 'cht',
                type : PlotChart.type.exLine
            }) ;
            pnl.add(chart) ;
            pnl.chart = chart;
            result = chart ;

        }else{ //RTM
            for ( var ix = 0; ix < self.rtm_legend_list.length; ix++ ){
                chart.addSeries({
                    label: self.rtm_legend_list[ix],
                    id   : self.rtm_legend_list[ix],
                    type : PlotChart.type.exLine
                }) ;
                pnl.add(chart) ;
                pnl.chart = chart;
                result = chart ;
            }
        }

        return result ;
    } ,

    init_bot_layout:function(){
        var self = this ;

        self.tab_bot_pnl = Ext.create('Exem.TabPanel',{
            region: 'south',
            split : true,
            layout: 'fit',
            itemId: 'tab_bot_pnl',
            width : '100%',
            flex  : 2
        }) ;
        self.add( self.tab_bot_pnl ) ;

        self.grd_sess_list = self.create_grd( self.tab_bot_pnl, 'Session List', 'sess_list', 'fit'  ) ;
        //Session Info는 패널만 생성. 그리드를 미리 만들어놓지 않는다.
        self.pnl_sess_info = self.create_grd( self.tab_bot_pnl, 'Session Info', 'sess_info', 'hbox' ) ;
        self.grd_sql_used  = self.create_grd( self.tab_bot_pnl, 'SQL Used'    , 'sql_used' , 'fit'  ) ;

        self.tab_bot_pnl.setActiveTab( 0 ) ;
    } ,

    create_grd: function( parent, title, grd_id , layout ){
        var self = this ;
        var result = null ;
        var pnl = Ext.create('Exem.Panel',{
            layout: layout,
            title : title,
            itemId: grd_id,
            listeners:{
                afterlayout: function(){
                    self.bot_tab_change( grd_id ) ;
                }
            }
        }) ;
        parent.add(pnl) ;

        switch ( grd_id ){
            case 'sess_list':
                var grd = Ext.create('Exem.BaseGrid', {
                    itemId: grd_id
                }) ;

                grd.beginAddColumns() ;
                grd.addColumn( 'Time'          , 'time'           , 140, Grid.DateTime, true , false ) ;
                grd.addColumn( 'DB ID'         , 'db_id'          , 100, Grid.String  , false, false ) ;
                grd.addColumn( 'Agent'         , 'was_name'       , 100, Grid.String  , true , false ) ;
                grd.addColumn( 'Transaction'   , 'txn_namee'      , 200, Grid.String  , true , false ) ;
                grd.addColumn( 'SID'           , 'sid'            , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Serial'        , 'serial'         , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'SPID'          , 'spid'           , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'CPID'          , 'cpid'           , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Logon Time'    , 'logon_time'     , 140, Grid.DateTime, false, false ) ;
                grd.addColumn( 'AUDSID'        , 'audsid'         , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Schema'        , 'schema_name'    , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'User Name'     , 'use_name'       , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'OS User'       , 'os_user'        , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Machine'       , 'machine'        , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Terminal'      , 'terminal'       , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Program'       , 'program '       , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Module'        , 'module'         , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Action'        , 'action'         , 140, Grid.String  , true , false ) ;
                grd.addColumn( 'Status'        , 'status'         , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Elapse Time'   , 'elapse_time'    , 140, Grid.Float   , true , false ) ;
                grd.addColumn( 'Command'       , 'command'        , 140, Grid.String  , true , false ) ;
                grd.addColumn( 'CPU Usage'     , 'cpu'            , 140, Grid.Number  , true , false ) ;
                grd.addColumn( 'Logical Reads' , 'logical_read_d' , 140, Grid.Number  , true , false ) ;
                grd.addColumn( 'Physical Reads', 'physical_read_d', 140, Grid.Number  , true , false ) ;
                grd.addColumn( 'Execution'     , 'exec_count_d'   , 140, Grid.Number  , true , false ) ;
                grd.addColumn( 'Redo Entries'  , 'redo_d'         , 140, Grid.Number  , true , false ) ;
                grd.addColumn( 'Wait'          , 'wait_event'     , 250, Grid.String  , true , false ) ;
                grd.addColumn( 'SQL Text'      , 'sql_text'       , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'SQL Address'   , 'sql_address'    , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'SQL Hash Value', 'sql_hash_value' , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'WAS ID'        , 'was_id'         , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'TXN ID'        , 'txn_id'         , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'SQL ID'        , 'sql_id'         , 140, Grid.String  , false, false ) ;
                grd.addColumn( 'Client Info'   , 'client_info'    , 140, Grid.String  , true , false ) ;
                grd.endAddColumns() ;
                pnl.add(grd) ;
                result = grd ;
                break ;

            case 'sql_used':
                grd = Ext.create('Exem.BaseGrid', {
                    itemId: grd_id
                }) ;
                grd.beginAddColumns() ;
                grd.addColumn( 'Time'          , 'time'           , 140, Grid.DateTime, true, false ) ;
                grd.addColumn( 'SQL Text'      , 'sql_text'       , 700, Grid.String  , true, false ) ;
                grd.endAddColumns() ;
                pnl.add(grd) ;
                result = grd ;
                break ;

            default:
                break;
        }
        return result ;
    } ,

    top_tab_change: function( active_tab ){
        var self = this ;

        switch ( active_tab ){
            case 'activity':

                break ;

            case 'cpu':
                if ( self.cht_dt_list['cpu'].length == 0 ) {
                    return ;
                }

                if ( !self.flag_list.cpu ){
                    self.cht_cpu.plotDraw() ;
                    self.flag_list.flag_cpu = true ;
                }
                break ;

            case 'lreads':
                if ( self.cht_dt_list['lreads'].length == 0 ) {
                    return ;
                }

                if ( !self.flag_list.lreads ){
                    self.cht_lreads.plotDraw() ;
                    self.flag_list.lreads = true ;
                }
                break ;

            case 'preads':
                if ( self.cht_dt_list['preads'].length == 0 ) {
                    return ;
                }

                if ( !self.flag_list.preads ){
                    self.cht_preads.plotDraw() ;
                    self.flag_list.preads = true ;
                }
                break ;

            case 'exec':
                if ( self.cht_dt_list['exec'].length == 0 ) {
                    return ;
                }

                if ( !self.flag_list.exec ){
                    self.cht_exec.plotDraw() ;
                    self.flag_list.exec = true ;
                }
                break ;

            case 'redo':
                if ( self.cht_dt_list['redo'].length == 0 ) {
                    return ;
                }

                if ( !self.flag_list.redo ){
                    self.cht_redo.plotDraw() ;
                    self.flag_list.redo = true ;
                }
                break ;

            default : break ;
        }
    },

    bot_tab_change: function( active_tab ){
        var self = this ;

        if (active_tab === 'sess_info') {
            self.tab_bot_pnl.getComponent('sess_info').getEl().setStyle( 'padding', '30px 0px 0px 30px' ) ;
        }

    },

    init_form_title: function( instance_name ){
        var self = this ;
        self.sess_info_value_list = [] ;
        self.flag_list.cpu    = false ;
        self.flag_list.lreads = false ;
        self.flag_list.preads = false ;
        self.flag_list.exec   = false ;
        self.flag_list.redo   = false ;
        self.setTitle( common.Util.TR('Session Detail') +'('+instance_name + '  SID: ' + self.necessary_dt.sid + '  Serial: '+ self.necessary_dt.serial+ ')' ) ;
    }
}) ;

