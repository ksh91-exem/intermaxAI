/**
 * Created by min on 2015-02-02.
 */
Ext.define("view.WebStat", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,

    sql   :{
        grd_webserver: 'IMXPA_WebStat_WebServerGrid.sql',
        grd_url      : 'IMXPA_WebStat_URLGrid.sql',
        grd_webalert : 'IMXPA_WebStat_WebAlertGrid.sql',
        trend_total  : 'IMXPA_WebStat_Trend_Total.sql',
        trend_ip     : 'IMXPA_WebStat_Trend_IP.sql'
    },

    executeSQL: function(){
        var self = this ;


        if (self.first_retrieve ){
            self._init_draw_property() ;
            for ( var ix = 1; ix < self.chart_array.length; ix++ ){
                self.chart_array[ix].destroy() ;
            }
            ix = null ;
        }

        self.get_query( '' ) ;
        self.first_retrieve = true ;

        self = null ;

    } ,

    get_query: function( title ){
        var self = this ;
        var sql_text ;



        self.fromTime = common.Util.getDate(new Date(self.datePicker.getFromDateTime()));
        self.toTime = common.Util.getDate(new Date(self.datePicker.getToDateTime()));

        if ( title == '' ){
            title = self.main_top_tab.getActiveTab().title;
        }
        switch( title ){
            case common.Util.CTR('Webserver'):

                self.main_top_tab.loadingMask.showMask() ;
                self.main_bot_tab.loadingMask.showMask() ;

                self.main_top_tab.setActiveTab(0) ;
                self.main_bot_tab.setActiveTab(0) ;

                if ( self.is_web_serv_draw ) {
                    self.main_top_tab.loadingMask.hide() ;
                    self.main_bot_tab.loadingMask.hide() ;
                    return ;
                }

                self.web_grid.clearRows() ;
                self.web_exec_chart.clearValues() ;
                self.web_elapse_chart.clearValues() ;
                sql_text = self.sql.grd_webserver ;

                break ;

            case common.Util.CTR('URL'):

                self.main_top_tab.loadingMask.showMask() ;
                self.main_bot_tab.loadingMask.showMask() ;

                self.main_top_tab.setActiveTab(1) ;
                self.main_bot_tab.setActiveTab(1) ;


                if ( self.is_url_draw ){
                    self.main_top_tab.loadingMask.hide() ;
                    self.main_bot_tab.loadingMask.hide() ;
                    return ;
                }

                self.url_grid.clearRows() ;
                self.url_exec_chart.clearValues() ;
                self.url_elapse_chart.clearValues() ;
                sql_text = self.sql.grd_url ;

                break ;

            case common.Util.CTR('Trend'):


                self.fromTime = common.Util.getDate(new Date(self.trendPicker.getFromDateTime()));
                self.toTime = common.Util.getDate(new Date(self.trendPicker.getFromDateTime()));

                if ( self.is_trend_draw ) {
                    /**
                    //self.main_top_tab.loadingMask.hide();
                    //self.main_bot_tab.loadingMask.hide();
                     */
                    return ;
                }

                self.main_top_tab.loadingMask.showMask() ;


                self.trend_exec_chart.clearValues() ;
                self.trend_elapse_chart.clearValues() ;

                self.main_top_tab.setActiveTab(2) ;


                WS.SQLExec({
                    sql_file: self.sql.trend_total ,
                    bind    : [{name: 'fromtime', value: common.Util.getDateFormat(self.fromTime) + ' 00:00:00', type: SQLBindType.STRING}
                        ,{ name: 'totime', value: common.Util.getDateFormat(self.toTime) + ' 23:59:59', type: SQLBindType.STRING}]
                }, self.on_trend_data, self) ;


                WS.SQLExec({
                    sql_file: self.sql.trend_ip ,
                    bind    : [{name: 'fromtime', value: common.Util.getDateFormat(self.fromTime) + ' 00:00:00', type: SQLBindType.STRING}
                        ,{ name: 'totime', value: common.Util.getDateFormat(self.toTime) + ' 23:59:59', type: SQLBindType.STRING}]
                }, self.on_trend_data, self) ;

                return;

            case 'Web Alert':
                if (!self.is_web_alert_draw) {
                    self.alert_grid.clearRows();

                    if(!self.isLoading) {
                        self.main_bot_tab.loadingMask.showMask();
                    }

                    WS.SQLExec({
                        sql_file: self.sql.grd_webalert ,
                        bind    : [{name: 'fromtime', value: self.fromTime, type: SQLBindType.STRING}
                            ,{ name: 'totime', value: self.toTime, type: SQLBindType.STRING}]
                    }, self.on_data, self) ;
                }
                return;

            default:
                break;
        }

        WS.SQLExec({
            sql_file: sql_text ,
            bind    : [  {name: 'fromtime', value: self.fromTime, type: SQLBindType.STRING}
                ,{ name: 'totime', value: self.toTime, type: SQLBindType.STRING}]
        }, self.on_data, self) ;

        sql_text = null ;
        self = null ;
    } ,


    on_data: function( header, data ){
        var self = this ;
        var ix ;
        var ExecData = [];
        var ElapsData = [];
        var dataRows ;
        var chartIdx ;
        if(!common.Util.checkSQLExecValid(header, data)){
            self.main_top_tab.loadingMask.hide() ;
            self.main_bot_tab.loadingMask.hide() ;

            console.debug('WebStat-on_data');
            console.debug(header);
            console.debug(data);
            return;
        }

        switch( header.command ) {
            case self.sql.grd_webserver:

                self.is_web_serv_draw = true;

                for( ix = 0 ; ix < data.rows.length; ix++ ){

                    dataRows = data.rows[ix];
                    chartIdx = data.rows.length - 1 - ix;
                    self.web_grid.addRow([
                        dataRows[0]  // ip
                        ,dataRows[1]  // avg_elapse
                        ,dataRows[2]  // exec_count
                        ,dataRows[3]  // error_count
                        ,dataRows[4]  // min_elapse
                        ,dataRows[5]  // max_elapse
                        ,dataRows[6]  // total_elapse
                        ,chartIdx
                    ]);

                    ExecData.push([dataRows[2], dataRows[0]]);
                    ElapsData.push([dataRows[6], dataRows[0]]);
                }
                ExecData.reverse();
                ElapsData.reverse();

                self.web_grid.drawGrid() ;
                self.web_exec_chart.setData( 0, ExecData ) ;
                self.web_elapse_chart.setData( 0, ElapsData ) ;

                self.web_exec_chart.plotDraw() ;
                self.web_elapse_chart.plotDraw() ;

                break ;
            case self.sql.grd_url :

                self.is_url_draw = true;

                for ( ix = 0; ix < data.rows.length;  ix++) {
                    dataRows = data.rows[ix];
                    chartIdx = data.rows.length - 1 - ix;

                    self.url_grid.addRow([
                        dataRows[0]   // path
                        ,dataRows[5] / dataRows[1]
                        ,dataRows[1]   // exec_count
                        ,dataRows[2]   // error_count
                        ,dataRows[3]   // min_elapse
                        ,dataRows[4]   // max_elapse
                        ,dataRows[5]   // total_elapse
                        ,chartIdx            // hidden_idx
                    ]);

                    if ( ix < 30 ){
                        ExecData.push([dataRows[1], dataRows[0]]);
                        ElapsData.push([dataRows[5], dataRows[0]]);
                    }
                }

                ExecData.reverse();
                ElapsData.reverse();

                self.url_grid.drawGrid();

                self.url_exec_chart.setData(0, ExecData);
                self.url_elapse_chart.setData(0, ElapsData);

                self.url_exec_chart.plotDraw();
                self.url_elapse_chart.plotDraw();

                break ;

            case self.sql.grd_webalert:

                if (data.rows.length > 0) {
                    self.is_web_alert_draw = true;
                    self.alert_grid.onData(header, data);
                    self.main_bot_tab.loadingMask.hide() ;
                } else {
                    console.debug('no-data callback');
                    self.loadingMask.hide();
                    self.main_bot_tab.loadingMask.hide() ;
                }
                return ;

            default:
                break;
        }

        self.main_top_tab.loadingMask.hide() ;
        self.main_bot_tab.loadingMask.hide() ;

        ix = null;
        ExecData = null;
        ElapsData = null;
        dataRows = null;
        chartIdx = null;
        self = null;
    } ,

    on_trend_data: function( header, data ){
        var self = this ;
        var ix = 0 ;
        var tmp_chart;
        var tmp_exec_chart = [];
        var tmp_elapse_chart = [];
        var trend_pnlBG;

        var exec_data   = [];
        var elapse_data = [];
        var tmp_ip = '' ;

        if(!common.Util.checkSQLExecValid(header, data)){
            self.main_top_tab.loadingMask.hide() ;

            console.debug('WebStat-on_trend_data');
            console.debug(header);
            console.debug(data);
            return;
        }


        switch(header.command){
            case self.sql.trend_total :

                for ( ix = 0; ix < data.rows.length; ix++ ) {

                    //1410.22 null이면 0값적용하도록 수정(null이 들어간 시간레이블도 모두 표시하기 위함) min
                    if (data.rows[ix][1] == null ) {
                        data.rows[ix][1] = 0;
                    }
                    if (data.rows[ix][2] == null ) {
                        data.rows[ix][2] = 0;
                    }

                    exec_data.push([data.rows[ix][0], data.rows[ix][1]]);
                    elapse_data.push([data.rows[ix][0], data.rows[ix][2]]);
                }

                self.trend_exec_chart.setData(0, exec_data);
                self.trend_elapse_chart.setData(0, elapse_data);

                self.trend_exec_chart.plotDraw();
                self.trend_elapse_chart.plotDraw();

                break ;

            case self.sql.trend_ip:
                for ( ix = 0; ix < data.rows.length; ix++ ) {
                    if ( tmp_ip !== data.rows[ix][0] ){

                        tmp_ip = data.rows[ix][0] ;

                        if ( tmp_chart !== undefined ) {
                            tmp_exec_chart.setData(0, exec_data);
                            tmp_elapse_chart.setData(0, elapse_data);
                            tmp_exec_chart.plotDraw();
                            tmp_elapse_chart.plotDraw();

                            tmp_chart        = null ;
                            tmp_exec_chart   = null ;
                            tmp_elapse_chart = null ;
                            trend_pnlBG      = null ;
                            exec_data        = [] ;
                            elapse_data      = [] ;
                        }


                        trend_pnlBG = Ext.create('Exem.Container', {
                            itemId: 'trend_pnlBG_'+tmp_ip,
                            layout: 'fit',
                            height: 150,
                            width : '100%'
                        }) ;
                        self.main_trend_pnl.add( trend_pnlBG ) ;

                        tmp_chart = self.create_trend_chart(trend_pnlBG, true, tmp_ip) ;
                        tmp_exec_chart = tmp_chart.getComponent('trend_exec_chart_'+tmp_ip) ;
                        tmp_elapse_chart = tmp_chart.getComponent('trend_elapse_chart_'+tmp_ip) ;
                        self.chart_array.push( trend_pnlBG ) ;
                        //tmp_chart.add( tmp_exec_chart, tmp_elapse_chart )
                    }
                    exec_data.push([data.rows[ix][1], data.rows[ix][2]]);
                    elapse_data.push([data.rows[ix][1], data.rows[ix][3]]);
                }

                if ( tmp_exec_chart !== undefined && tmp_exec_chart.length !=0){
                    tmp_exec_chart.setData(0, exec_data);
                    tmp_elapse_chart.setData(0, elapse_data);
                    tmp_exec_chart.plotDraw();
                    tmp_elapse_chart.plotDraw();

                }

                tmp_chart        = null ;
                tmp_exec_chart   = null ;
                tmp_elapse_chart = null ;
                trend_pnlBG      = null ;
                exec_data        = null ;
                elapse_data      = null ;
                self.is_trend_draw = true ;
                break ;

            default: break ;
        }
        self.main_top_tab.loadingMask.hide() ;

        exec_data = null ;
        elapse_data = null ;
        ix = null ;
        tmp_ip = null ;
    } ,

    init: function(){
        var self = this;

        self.setWorkAreaLayout('border') ;
        self.first_retrieve = false;
        self.chart_array = [] ;


        self.trendPicker = Ext.create('Exem.DatePicker',{
            x: 25,
            //y: 19,
            width: 72,
            executeSQL: self.executeSQL,
            executeScope: self,
            hidden: true,
            //<0------ DatePicker Type 관련
            DisplayTime   : DisplayTimeMode.None,
            rangeOneDay   : self.rangeOneDay,
            //singleField   : self.singleField,
            isDaily       : self.isDaily,
            singleField   : true
        });
        self.conditionArea.add(self.trendPicker);


        self.main_pnl = Ext.create('Exem.Panel',{
            //title : '메인이다!',
            itemId: 'main_pnl',
            region: 'north',
            layout: 'vbox',
            width : '100%',
            height: '100%'
        }) ;

        self.main_top_tab = Ext.create('Exem.TabPanel',{
            //title : '윗동네!',
            itemId: 'main_top_tab',
            region: 'north',
            layout: 'fit',
            width : '100%',
            height: '100%',
            flex  : 1 ,
            listeners: {
                tabchange: function(tabPanel, newCard, oldCard){

                    if (oldCard) {
                        self._datePickerToFieldToggle(common.Util.CTR(oldCard.title));
                    }

                    if ( newCard.title == common.Util.CTR('Trend') ) {
                        self.con.hide();
                    } else {
                        self.con.show();
                    }

                    if (self.first_retrieve === true ) {
                        self.get_query(common.Util.CTR(newCard.title));
                    }
                }
            }
        }) ;

        //1.chart
        var web_chart = self.create_chart('web_chart_pnl', 'Webserver') ;
        var url_chart = self.create_chart('url_chart_pnl', 'URL'      ) ;
        self.web_exec_chart    = web_chart.getComponent('execute_chart') ;
        self.web_elapse_chart  = web_chart.getComponent('elapse_chart') ;
        self.url_exec_chart    = url_chart.getComponent('execute_chart') ;
        self.url_elapse_chart  = url_chart.getComponent('elapse_chart') ;




        self.main_trend_pnl = Ext.create('Exem.Container',{
            title : common.Util.TR('Trend') ,
            itemId: 'main_trend_pnl',
            layout: 'vbox',
            //split : true,
            autoScroll : true,
            height: '100%',
            width : '100%'
        }) ;


        var trend_pnlBG = Ext.create('Exem.Container', {
            itemId: 'trend_pnlBG_total',
            layout: 'fit',
            height: 150,
            width : '100%'
        }) ;
        self.main_trend_pnl.add( trend_pnlBG ) ;


        var trend_chart = self.create_trend_chart(trend_pnlBG, false, 'total') ;
        self.trend_exec_chart = trend_chart.getComponent('trend_exec_chart_total') ;
        self.trend_elapse_chart = trend_chart.getComponent('trend_elapse_chart_total') ;
        self.chart_array.push( trend_pnlBG ) ;
        self.main_top_tab.add( self.main_trend_pnl ) ;


        trend_pnlBG = null ;
        trend_chart = null ;


        self.con = Ext.create('Exem.Container',{
            region: 'center',
            layout: 'fit',
            split : true,
            height: '100%',
            width : '100%',
            flex  : 1
        }) ;

        self.main_bot_tab = Ext.create('Exem.TabPanel',{
            itemId: 'main_bot_tab',
            //title : '아랫동네',
            listeners: {
                tabchange: function(tabPanel, newCard){


                    if( self.first_retrieve && newCard.title == 'Web Alert' ){
                        self.get_query( newCard.title );
                    }

                    if (newCard.title == 'Webserver') {
                        self.main_top_tab.setActiveTab(0);
                    } else if (newCard.title == 'URL') {
                        self.main_top_tab.setActiveTab(1);
                    }
                }
            }
        }) ;
        //2.grid
        var web_grid   = self.create_grid('web_bot_pnl', 'Webserver') ;
        var url_grid   = self.create_grid('url_bot_pnl', 'URL') ;
        var alert_grid = self.create_grid('alert_pnl'  , 'Web Alert') ;
        self.web_grid = web_grid ;
        self.url_grid = url_grid ;
        self.alert_grid = alert_grid ;


        self.workArea.add( self.main_pnl ) ;
        self.main_pnl.add( self.main_top_tab, self.con ) ;
        self.con.add( self.main_bot_tab ) ;

        self.main_top_tab.setActiveTab( 0 ) ;
        self.main_bot_tab.setActiveTab( 0 ) ;

    },

    create_chart: function(chart_id, title){
        var self = this ;


        var m_pnl = Ext.create('Exem.TabPanel',{
            itemId: 'm_pnl'+title,
            title : title,
            layout: 'fit',
            split : true,
            height: '100%',
            width : '100%',
            flex  : 1
        }) ;


        var pnl = Ext.create('Exem.Panel', {
            itemId: chart_id+'_pnl',
            title : title,
            layout: 'vbox',
            split : true,
            height: '100%',
            width : '100%',
            flex  : 1
        }) ;


        var chart_pnl = Ext.create('Exem.Panel', {
            itemId: chart_id+'_chart_pnl',
            //title : title,
            layout: 'hbox',
            split : true,
            height: '50%',
            width : '100%',
            flex  : 1
        }) ;



        var execute_chart = Ext.create('Exem.chart.CanvasChartLayer', {
            itemId        : 'execute_chart',
            width         : '50%',
            height        : '100%',
            flex          : 1,
            showLegend    : true,
            showTooltip   : true,
            showHistoryInfo: false,
            maxValueFormat : '%x',
            toolTipFormat  : '[%y] %x',
            chartProperty: {
                mode : null,
                yMin : null,
                yMode: "categories"
            },
            plotclick: function(event, pos, item){

                self.grid_highlight( item ) ;
            }
        });


        execute_chart.addSeries({
            id: 'execute_chart',
            label: common.Util.TR('Execute Count'),
            type: PlotChart.type.exBar,
            hbar: true
        }) ;



        var elapse_chart = Ext.create('Exem.chart.CanvasChartLayer', {
            itemId         : 'elapse_chart',
            width          : '50%',
            height         : '100%',
            flex           : 1,
            showLegend     : true,
            maxValueFormat : '%x',
            showTooltip    : true,
            toolTipFormat  : '[%y] %x',
            showHistoryInfo: false,
            chartProperty: {
                mode  : null,
                yMin  : null,
                yaxis : false,
                yMode : "categories"
            },
            plotclick: function(event, pos, item){
                self.grid_highlight( item ) ;
            }
        });

        elapse_chart.addSeries({
            id: 'elapse_chart',
            label: common.Util.TR('Elapse Time (Total)'),
            type: PlotChart.type.exBar,
            hbar: true
        });



        chart_pnl.add( execute_chart, elapse_chart ) ;
        pnl.add( chart_pnl );
        m_pnl.add( pnl ) ;
        self.main_top_tab.add( pnl ) ;

        try {
            return chart_pnl ;
        } finally {
            m_pnl = null ;
            chart_pnl = null ;
        }
    },

    grid_highlight: function( _item ){

        var self = this ;
        var _chart_exec, _chart_elapse, _grid, //_target,
                idx ;

        switch( self.main_top_tab.getActiveTab().title ) {
            case 'Webserver':
                _chart_exec   = self.web_exec_chart ;
                _chart_elapse = self.web_elapse_chart ;
                _grid         = self.web_grid ;
                break ;
            case 'URL':
                _chart_exec   = self.url_exec_chart ;
                _chart_elapse = self.url_elapse_chart ;
                _grid         = self.url_grid ;
                break ;
            default:
                break;
        }

        idx = self._findGridIdx( _grid.pnlExGrid, _item.dataIndex ) ;
        _chart_exec.plot.unhighlight() ;
        _chart_elapse.plot.unhighlight() ;
        _chart_exec.highLight( 0, _item.dataIndex ) ;
        _chart_elapse.highLight( 0, _item.dataIndex ) ;

        _grid.pnlExGrid.getView().getSelectionModel().select( idx ) ;


        /**
        //var grid = self.first_grd.pnlExGrid;
        //var dataIdx = self._findGridIdx(grid, item.dataIndex);

        //self.right_chart.plot.unhighlight();
        //self.left_chart.highLight(0, item.dataIndex);
        //self.right_chart.highLight(0, item.dataIndex);

        //grid.getView().getSelectionModel().select(dataIdx);
         **/

    },

    create_grid: function(grid_id, title){
        var self = this ;

        var pnl = Ext.create('Exem.Panel',{
            itemId: grid_id+'_pnl',
            width : '100%',
            height: '100%',
            layout: 'fit',
            title : title
        });

        var grid = Ext.create('Exem.BaseGrid', {
            itemId: grid_id,
            gridName  : 'pa_web_stat_'+grid_id
            /**
            itemclick : function () {
                // function arguments: (this_view , record, item, index, e)
                ////self.left_chart.plot.unhighlight();
                ////self.right_chart.plot.unhighlight();
                ////self.left_chart.highLight(0, record.data['hidden_idx']);
                ////self.right_chart.highLight(0, record.data['hidden_idx']);
            }
             **/
        }) ;

        if ( title === 'Web Alert' ){
            grid.beginAddColumns();
            grid.addColumn(common.Util.TR('Time'),        'time',        200, Grid.DateTime, true, false) ;
            grid.addColumn(common.Util.TR('Webserver'),  'web_server',  200, Grid.String, true, false) ;
            grid.addColumn(common.Util.TR('Alert Value'), 'ALERT_VALUE', 200, Grid.Number, true, false) ;
            grid.addColumn(common.Util.TR('Description'), 'DESCRIPTION', 200, Grid.String, true, false) ;

            grid.endAddColumns();

        } else {
            var first_col =  ( title == 'Webserver' ? 'IP' : 'Path' ) ;
            var first_idx = ( title == 'Webserver' ? 'ip' : 'path' ) ;
            grid.beginAddColumns();
            grid.addColumn(common.Util.TR(first_col) ,           first_idx   ,  200, Grid.String, true, false) ;
            grid.addColumn(common.Util.TR('AVG Elapse Time') ,   'avg_elapse',  200, Grid.Float,  true, false) ;
            grid.addColumn(common.Util.TR('Execute Count'),      'exec_count',  200, Grid.Number, true, false) ;
            grid.addColumn(common.Util.TR('Error Count'),        'error_count', 200, Grid.Number, true, false) ;
            grid.addColumn(common.Util.TR('Min Elapse Time'),    'min_elapse',  200, Grid.Float,  true, false) ;
            grid.addColumn(common.Util.TR('Max Elapse Time'),    'max_elapse',  200, Grid.Float,  true, false) ;
            grid.addColumn(common.Util.TR('Total Elapse Time'),  'total_elapse',200, Grid.Float,  true, false) ;
            grid.addColumn('Hidden Idx'                       ,  'hidden_idx',  100, Grid.String, false, true) ;
            grid.endAddColumns();
            grid.setOrderAct('total_elapse', 'desc');

        }
        grid.loadLayout(grid.gridName);
        grid.setOrderAct('total_elapse', 'desc');

        pnl.add( grid ) ;
        self.main_bot_tab.add( pnl ) ;

        try {
            return grid ;
        } finally {
            pnl = null ;
            grid = null ;
        }

    },


    create_trend_chart: function(parent, flag, id){
        var trend_pnl = Ext.create('Exem.Container', {
            itemId: 'trend_pnl',
            //title : 'trend_pnl',
            layout: 'hbox',
            //split : true,
            height: '100%',
            width : '100%'
        }) ;
        parent.add(trend_pnl);


        var trend_exec_chart = Ext.create('Exem.chart.CanvasChartLayer', {
            itemId: 'trend_exec_chart_'+id,
            title :  id,
            width : '50%',
            height : 150,//'100%',
            flex   : 1,
            showTitle: flag,
            showLegend : true,
            showTooltip : true,
            showHistoryInfo : false,
            toolTipFormat : '[%x] %y',
            chartProperty   : {
                mode: "categories"
            }
        });

        trend_exec_chart.addSeries({
            id: 'trend_exec_chart_'+id,
            label: common.Util.TR('Execute count'),
            type: PlotChart.type.exBar
        }) ;


        var trend_elapse_chart = Ext.create('Exem.chart.CanvasChartLayer', {
            itemId : 'trend_elapse_chart_'+id,
            width  : '50%',
            height : 150, //'100%',
            flex   : 1,
            showTitle: flag,
            showTooltip : true,
            showHistoryInfo : false,
            toolTipFormat : '[%x] %y',
            titleHeight: 15,
            showLegend : true,
            chartProperty   : {
                mode: "categories"
            }
        });

        trend_elapse_chart.addSeries({
            id: 'trend_elapse_chart_'+id,
            label: common.Util.TR('Total Elapse Time'),
            type: PlotChart.type.exBar
        }) ;

        trend_pnl.add( trend_exec_chart, trend_elapse_chart  ) ;

        try {
            return trend_pnl ;
        } finally {
            trend_exec_chart = null ;
            trend_elapse_chart = null ;
        }


    },

    _datePickerToFieldToggle : function(oldId) {

        var tabId = this.main_top_tab.getActiveTab().title;

        if (tabId === common.Util.CTR('Trend')) {
            var fullFromDate = this.datePicker.getFromDateTime();
            var newFromDate = Ext.Date.format(new Date(fullFromDate), Comm.dateFormat.NONE);
            this.trendPicker.mainFromField.setValue(newFromDate);
            this.datePicker.setVisible(false);
            this.trendPicker.setVisible(true);

        } else {

            if (oldId === common.Util.CTR('Webserver') || common.Util.CTR(oldId === 'URL')) {
                return;
            }

            var fullFromDateTime = Ext.Date.format(new Date(this.datePicker.getFromDateTime()), 'H:i');
            var fullToDateTime = Ext.Date.format(new Date(this.datePicker.getToDateTime()), 'H:i');
            var shortFromdate = this.trendPicker.getFromDateTime();
            var newFromTime = Ext.Date.format(new Date(shortFromdate +' '+fullFromDateTime), Comm.dateFormat.HM);
            var newToTime = Ext.Date.format(new Date(shortFromdate +' '+fullToDateTime), Comm.dateFormat.HM);

            this.datePicker.mainFromField.setValue(newFromTime);
            this.datePicker.mainToField.setValue(newToTime);
            this.datePicker.setVisible(true);
            this.trendPicker.setVisible(false);
        }

    },

    _init_draw_property : function (){
        var self = this;
        self.first_retrieve    = false;
        self.is_web_serv_draw  = false;
        self.is_url_draw       = false;
        self.is_web_alert_draw = false;
        self.is_trend_draw     = false;

        self = null ;
    },

    _findGridIdx: function(grid, itemIdx) {
        for (var ix = 0, len = grid.store.data.items.length; ix < len; ix++) {
            var record = grid.store.data.items[ix];
            if (record.data['hidden_idx'] == itemIdx) {
                return ix;
            }
        }
    }
});