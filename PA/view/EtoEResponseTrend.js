/**
 * Created with IntelliJ IDEA.
 * User: Boeun
 * Date: 14. 1. 3
 * Time: 오후 4:48
 * To change this template use File | Settings | File Templates.
 */
// View.
Ext.define("view.EtoEResponseTrend", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        top_chart       : 'IMXPA_EtoEResponseTrend_Chart.sql',
        bottom_Grid     : 'IMXPA_EtoEResponseTrend_Grid.sql'
    },
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    init: function(){
        var self = this;


        self.setWorkAreaLayout('border');

        /**************************** Condition Area *****************************/
            //TxnName TextField
        self.txnNameTF = Ext.create('Exem.TextField', {
            fieldLabel: '',
            labelAlign: 'right',
            itemId    : 'TxnName_TF',
            allowBlank: true,
            value     : common.Util.TR('Transaction Name'),
            labelWidth: 105,
            maxLength : 255,
            enforceMaxLength:true,
            width: 350,
            x: 380,
            y: 5,
            listeners: {
                focus: function () {
                    if ( this.getValue() == '%'
                        || this.getValue() == common.Util.TR('Transaction Name')
                        || this.getValue() == '' )
                        this.setValue('%') ;
                },
                blur: function() {
                    if ( this.getValue() == '%' )
                        this.setValue(common.Util.TR('Transaction Name')) ;
                }

            }
        });

        self.conditionArea.add(self.txnNameTF);


        //# 화면 구성.
        //top Chart Panel
        var top_Chart_panel = Ext.create('Exem.Panel', {
            region : 'north',
            layout : 'fit',
            height :  '20%',
            split  : true,
            itemId : 'top_Chart_panel',
            bodyStyle: {
                'border-radius': '6px;'
            }
        });
        self.top_Chart_panel = top_Chart_panel ;

        //bottom Grid Panel
        var bottom_panel = Ext.create('Exem.Panel', {
            region : 'center',
            layout : 'fit',         //'border',
            height : '80%',
            width : '100%',
            split  : true,
            itemId : 'bottom_panel'
        });
        self.bottom_panel = bottom_panel ;


        //chart.
        var EtoERespondChart = Ext.create('Exem.chart.CanvasChartLayer', {
            width : '100%',
            flex: 1,
//            title : 'EtoE Respond Trend',
            title : common.Util.TR('EtoE Response Trend'),
            //chartProperty : '',
            itemId       : 'EtoERespondChart',
            interval     : PlotChart.time.exTenMin,
            //titleHeight  : 15 ,
            //titleFontSize: '8px',
            showTitle    : false ,
            showLegend   : true,
            legendNameWidth : 140,
            //chartProperty: '%d %h:%m',

            showTooltip  : true,
            toolTipFormat : '[%s]%x [value:%y]',
            toolTipTimeFormat : '%d %H:%M',

            showMaxValue : true,
            maxValueFormat : '%y',
            maxValueAxisTimeFormat : '%H"%M',

            showIndicator : false,

            legendOrder: PlotChart.legendOrder.exDesc,
            chartProperty: {
                //델파이버전과 동일하게 맞춤.
                colors: ['#AE474E', '#5668D6', '#D1D21F', '#6EBDE8', '#929D9E']
            }
        }) ;
        self.EtoERespondChart = EtoERespondChart ;

        self.EtoERespondChart.addSeries({
            id    : 'Client',
//            label: 'Client Time',
            label : common.Util.TR('Client Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        self.EtoERespondChart.addSeries({
            id    : 'WEB',
//            label: 'WEB Time',
            label : common.Util.CTR('Web Server Response Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        self.EtoERespondChart.addSeries({
            id    : 'WAS',
//            label: 'WAS Time',
            label : common.Util.CTR('Agent Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        self.EtoERespondChart.addSeries({
            id    : 'REMOTE',
//            label: 'REMOTE Time',
            label : common.Util.CTR('Remote Response Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        self.EtoERespondChart.addSeries({
            id    : 'SQL',
//            label: 'SQL Time',
            label : common.Util.CTR('SQL Elapsed Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        //Bottom
        var Seires_panel2 = Ext.create('Exem.Panel', {
            region : 'north',
//            layout : 'fit',
//            flex : 1,
//            height : '5%',
            height :  '5%',
            width  : '100%',
            itemId : 'Seires_panel2'
            //tbar : [ 'seriesLabelContainer', {xtype: 'tbfill'} ]
        });
        self.Seires_panel2 = Seires_panel2;



        //Series_panel에 올릴 Label들.
        var seriesLabelContainer = Ext.create('Exem.Container', {
            layout: {
                type: "hbox",
                //pack: "start",
                align: "middle"
            },
            xtype : 'tbfill',
            width  : 500,
            itemId : 'seriesLabelContainer',
            items  : [{
                xtype: 'label',
                itemId: 'clientColor',
                width : 6,
                height: 8,
                margin: {
                    right: 4
                },
                style : {
                    'background-color': self.EtoERespondChart.chartType.colors[0]
                }
            }, {
                xtype: 'label',
                width: 80,
                itemId: 'clientTime',
                text : common.Util.TR('Client Time')
//                text: 'Client Time'
            },
                {
                    xtype: 'label',
                    itemId: 'webColor',
                    width: 6,
                    height: 8,
                    margin: {
                        right: 4
                    },
                    style: {
                        'background-color': self.EtoERespondChart.chartType.colors[1]
                    }
                }, {
                    xtype: 'label',
                    width: 80,
                    itemId: 'webTime',
                    text  : common.Util.TR('Web Server Response Time')
//                text: 'Web Time'
                },
                {
                    xtype: 'label',
                    itemId: 'wasColor',
                    width: 6,
                    height: 8,
                    margin: {
                        right: 4
                    },
                    style: {
                        'background-color': self.EtoERespondChart.chartType.colors[2]
                    }
                }, {
                    xtype : 'label',
                    width : 80,
                    itemId: 'wasTime',
                    text  : common.Util.TR('Agent Time')
//                text: 'WAS Time'
                },
                {
                    xtype: 'label',
                    itemId: 'RemoteColor',
                    width: 6,
                    height: 8,
                    margin: {
                        right: 4
                    },
                    style: {
                        'background-color': self.EtoERespondChart.chartType.colors[3]
                    }
                }, {
                    xtype: 'label',
                    width: 80,
                    itemId: 'remoteTime',
                    text  : common.Util.TR('Remote Response Time')
//                text: 'Remote Time'
                },
                {
                    xtype: 'label',
                    itemId: 'sqlColor',
                    width: 6,
                    height: 8,
                    margin: {
                        right: 4
                    },
                    style: {
                        'background-color': self.EtoERespondChart.chartType.colors[4]
                    }
                }, {
                    xtype: 'label',
                    width: 80,
                    itemId: 'sqlTime',
                    text  : common.Util.TR('SQL Elapsed Time')
//                text: 'SQL Time'
                }]
        });

        self.seriesLabelContainer = seriesLabelContainer;



        //toolbar를 하나 만듦.
        var toolbarSpacer = Ext.create('Ext.toolbar.Spacer', {
            width : 220
        });

        self.Seires_panel2.add(toolbarSpacer, self.seriesLabelContainer);


        var Grid_panel = Ext.create('Exem.Panel', {
            region : 'center',
            layout : 'fit',
//            flex : 15,
            height : '100%',
//            height :  '95%',
            width: '100%',
            itemId : 'Grid_panel'/*,
             padding: '5 5 5 5'*/
        });
        self.Grid_panel = Grid_panel;


        var EtoERespondGrid = Ext.create('Exem.BaseGrid', {
            height : '100%',
            width : '100%',
            Border : false,
            adjustGrid: false,
            stripeRows: false,
            defaultPageSize  : 32,
            defaultbufferSize: 32

        });
        self.EtoERespondGrid = EtoERespondGrid;

        /**
         //EtoERepondGrid Context Item 추가.
         //1. Transaction SQL
         //2. Transaction History
         /*
         self.EtoERespondGrid.contextMenu.addItem({
//            title : 'Transaction SQL',
            title : common.Util.TR('Transaction SQL'),
            itemId: 'Transaction_sql',
            fn: function() {
                //
                var record = this.up().record ;
                var txnSQL = common.OpenView.open('TxnSQL', {
                    isWindow : false,
                    width    : 1200,
                    height   : 800,
                    fromTime : self.datePicker.getFromDateTime(),
                    toTime   : self.datePicker.getToDateTime(),
                    transactionNameTF: common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId : record['was_id']
                });

                setTimeout(function(){
                    txnSQL.executeSQL();
                }, 300);
            }

        }, 0);
         */
        self.EtoERespondGrid.contextMenu.addItem({
//            title : 'Transaction History',
            title : common.Util.TR('Transaction Summary'),
            itemId: 'Transaction_history',
            fn: function() {
                //
                var record = this.up().record;
                var txnHistory = common.OpenView.open('TxnHistory', {
                    isWindow : false,
                    //width    : 1200,
                    //height   : 800,
                    fromTime : self.datePicker.getFromDateTime(),
                    toTime   : self.datePicker.getToDateTime(),
                    transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId : record['was_id']
                });

                setTimeout(function(){
                    txnHistory.executeSQL();
                }, 300);
            }

        }, 0);


        function createCellChart( value, meta, record ){
            //console.log('')

            if(record.data){

                //140609 마지막 avg로 나눠주는것 삭제(백분률을 위한 계산값임 - avg로 나눠주려면 *100도 함께 해주어야함.)_min

                //레코드 한줄 들어오면 그 record 내에서 계산하여 퍼센트 주고 차트 그려준다. - 이미 그리드 row에는  avg 값으로 들어있다. -JH
                var total_time ;

                var client_avg = record.data['c'] ;
                var web_avg    = record.data['w'] ;
                var was_avg    = record.data['was'] ;
                var remote_avg = record.data['r']  ;
                var db_avg     = record.data['s']  ;

                if ( client_avg != 0) {
                    client_avg = ( client_avg - web_avg );
                    web_avg    = ( web_avg - was_avg ) ;
                    was_avg    = (was_avg - (remote_avg + db_avg));
                } else {
                    if ( web_avg != 0) {
                        client_avg = 0;
                        web_avg    = (web_avg - was_avg) ;
                        was_avg    = (was_avg - (remote_avg + db_avg));
                    } else {
                        client_avg = 0;
                        web_avg    = 0 ;
                        was_avg    = (was_avg - (remote_avg + db_avg));
                    }
                }

                // 음수가 발생할 경우에는 0 처리
                if (client_avg < 0) {
                    client_avg = 0;
                }
                if (web_avg < 0)    {
                    web_avg = 0;
                }
                if (was_avg < 0)    {
                    was_avg = 0;
                }
                if (remote_avg < 0) {
                    remote_avg = 0;
                }
                if (db_avg < 0)     {
                    db_avg = 0;
                }

                total_time = client_avg + web_avg + was_avg + remote_avg + db_avg ;

                client_avg = ((client_avg / total_time) * 100).toFixed(3);
                web_avg    = ((web_avg / total_time) * 100).toFixed(3);
                was_avg    = ((was_avg / total_time) * 100).toFixed(3);
                remote_avg = ((remote_avg / total_time) * 100).toFixed(3);
                db_avg     = ((db_avg / total_time) * 100).toFixed(3);


                /**
                 var client_avg = (record.data['c'] || 0) / (record.data['cc'] || 1) ;
                 var web_avg    = (record.data['w'] || 0) / (record.data['wc'] || 1) ;
                 var was_avg    = (record.data['was'] || 0) / (record.data['wasc'] || 1) ;
                 var remote_avg = (record.data['r'] || 0) / (record.data['rc'] || 1) ;
                 var db_avg     = (record.data['s'] || 0) / (record.data['sc'] || 1) ;


                 console.log(client_avg);
                 console.log(web_avg);
                 console.log(was_avg);
                 console.log(remote_avg);
                 console.log(db_avg);



                 // c <> 0이 아닐 경우
                 if (record.data['c'] != 0){

                    client_time = client_avg - web_avg / client_avg;
                    web_time    = web_avg - was_avg / client_avg ;
                    was_time    = (was_avg - (remote_avg + db_avg)) / client_avg ;
                    remote_time = remote_avg / client_avg ;
                    sql_time    = db_avg / client_avg ;

                    total_time = client_time + web_time + was_time + remote_time + sql_time ;

                    console.log("1total : " + total_time) ;
                } else if (record.data['w'] != 0) {
                    //client 가 0이니깐 넌 그냥 0
                    client_time = 0;
                    web_time    = (web_avg - was_avg) / web_avg ;
                    was_time    = (was_avg - (remote_avg + db_avg)) / web_avg ;
                    remote_time = remote_avg / web_avg ;
                    sql_time    = db_avg / web_avg ;

                    total_time = client_time + web_time + was_time + remote_time + sql_time ;
                    console.log("2total : " + total_time) ;
                } else {

                    //client도 0이고 web도 0임
                    client_time = 0;
                    web_time    = 0 ;
                    was_time    = (was_avg - (remote_avg + db_avg)) / was_avg ;
                    remote_time = remote_avg / was_avg ;
                    sql_time    = db_avg / was_avg;

                    total_time = client_time + web_time + was_time + remote_time + sql_time ;
                    console.log("3total : " + total_time) ;
                }

                 client_time = ((client_time / total_time) * 100).toFixed(3);
                 web_time    = ((web_time / total_time) * 100).toFixed(3);
                 was_time    = ((was_time / total_time) * 100).toFixed(3);
                 remote_time = ((remote_time / total_time) * 100).toFixed(3);
                 sql_time    = ((sql_time / total_time) * 100).toFixed(3);

                 console.log(client_time);
                 console.log(web_time);
                 console.log(was_time);
                 console.log(remote_time);
                 console.log(sql_time);

                 */

                var BarChart = '<div style="position:relative; width:100%; height:13px">'
                    + '<div data-qtip="'+client_avg+'%'+'" style="float:left; background-color:#AE474E;background: linear-gradient(to bottom, #ff110f 0%, #f59e9e 50%,#ff110f 100%);height:100%;width:'+ client_avg +'%;"></div>'
                    + '<div data-qtip="'+web_avg+'%'+'" style="float:left; background-color:#5668D6;background: linear-gradient(to bottom, #5668D6 0%, #7bc1dc 50%,#5668D6 100%);height:100%;width:'+ web_avg +'%;"></div>'
                    + '<div data-qtip="'+was_avg+'%'+'" style="float:left; background-color:#D1D21F;background: linear-gradient(to bottom, #D1D21F 0%, #FFFF9C 50%,#D1D21F 100%);height:100%;width:'+ was_avg +'%;"></div>'
                    + '<div data-qtip="'+remote_avg+'%'+'" style="float:left; background-color:#6EBDE8;background: linear-gradient(to bottom, #6EBDE8 0%, #FFFFEB 50%,#6EBDE8 100%);height:100%;width:'+ remote_avg +'%;"></div>'
                    + '<div data-qtip="'+db_avg+'%'+'" style="float:left; background-color:#929D9E;background: linear-gradient(to bottom, #929D9E 0%, #FFFFFF 50%,#929D9E 100%);height:100%;width:'+ db_avg +'%;"></div>'
                    + '</div>';
                return BarChart;
            }
        }



        self.Grid_panel.add(self.EtoERespondGrid);

        self.top_Chart_panel.add(self.EtoERespondChart);
        self.bottom_panel.add(self.Grid_panel);

        self.workArea.add(self.top_Chart_panel);
        self.workArea.add(self.bottom_panel);


        //Grid 컬럼 추가.
        self.EtoERespondGrid.beginAddColumns();

        self.EtoERespondGrid.addColumn(common.Util.CTR('Transaction')   , 'txn_name', 350 , Grid.String , true, false);
        self.EtoERespondGrid.addColumn(common.Util.CTR('Agent')         , 'was_name', 100 , Grid.String , true, false);

        self.EtoERespondGrid.addColumn(common.Util.TR('Chart')         , 'chart'   , 100 , Grid.String , true, false);

        self.EtoERespondGrid.addColumn(common.Util.TR('Client (MAX)')   , 'cm'      , 110 , Grid.Float  , false, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn(common.Util.TR('Client (AVG)')   , 'c'       , 110 , Grid.Float  , false, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn(common.Util.TR('Client (Count)') , 'cc'      , 110 , Grid.Number , false, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn(common.Util.TR('Web (MAX)')      , 'wm'      , 110 , Grid.Float  , true, false);
        self.EtoERespondGrid.addColumn(common.Util.TR('Web (AVG)')      , 'w'       , 110 , Grid.Float  , true, false);
        self.EtoERespondGrid.addColumn(common.Util.TR('Web (Count)')    , 'wc'      , 110 , Grid.Number , true, false);
        self.EtoERespondGrid.addColumn(common.Util.TR('Agent (MAX)')    , 'wasm'    , 110 , Grid.Float  , true, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn(common.Util.TR('Agent (AVG)')    , 'was'     , 110 , Grid.Float  , true, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn(common.Util.TR('Agent (Count)')  , 'wasc'    , 110 , Grid.Number , true, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn(common.Util.TR('Remote (MAX)')   , 'rm'      , 110 , Grid.Float  , true, false);
        self.EtoERespondGrid.addColumn(common.Util.TR('Remote (AVG)')   , 'r'       , 110 , Grid.Float  , true, false);
        self.EtoERespondGrid.addColumn(common.Util.TR('Remote (Count)') , 'rc'      , 110 , Grid.Number , true, false);
        self.EtoERespondGrid.addColumn(common.Util.TR('SQL (MAX)')      , 'sm'      , 110 , Grid.Float  , true, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn(common.Util.TR('SQL (AVG)')      , 's'       , 110 , Grid.Float  , true, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn(common.Util.TR('SQL (Count)')    , 'sc'      , 110 , Grid.Number , true, false, null, Grid.columnBGColorType2);
        self.EtoERespondGrid.addColumn('WAS ID'                         , 'was_id'  , 150 , Grid.String , false, true);

        self.EtoERespondGrid.endAddColumns();

        self.EtoERespondGrid.addRenderer('chart', createCellChart) ;

    } ,

    executeSQL: function() {
        var self = this;
        var wasList = Comm.wasIdArr.join();
        self.wasList = wasList;
        var Chart_dataset = {};
        var Grid_dataset = {};
        var txn_name = this.txnNameTF.getValue() ;

        //self.

        /**
         이 작업은 아래 dataset.bind.push 를 할 때 초기화가 필요해서 하는 것임.
         dataset.bind = [];
         dataset.replace_string = [];
         dataset.extract_header = true;
         */

        self.loadingMask.showMask();

        if ( txn_name == common.Util.TR('Transaction Name')
            || txn_name == '' ) {
            txn_name = '%' ;
        }


        self.EtoERespondGrid.clearRows();
        self.EtoERespondChart.clearValues();
        //Chart
        Chart_dataset.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "txn_name",
            value : txn_name,
            type : SQLBindType.STRING
        }] ;

        Chart_dataset.replace_string = [{
            name : "was_id",
            value : wasList
        }] ;

        Chart_dataset.sql_file = self.sql.top_chart;
        WS.SQLExec(Chart_dataset, self.onChartData, self);

        //Grid
        Grid_dataset.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "txn_name",
            value : txn_name,
            type : SQLBindType.STRING
        }] ;

        Grid_dataset.replace_string = [{
            name : "was_id",
            value : wasList
        }] ;

        Grid_dataset.sql_file = self.sql.bottom_Grid;
        WS.SQLExec(Grid_dataset, self.onData, self);
    },

    /**
     ChartValueCalculateData: function(dataRows, idx){
     var self = this;

     for (var i=0; i < dataRows.length; i++){
     var wasId_Index = (Comm.wasIdArr.indexOf(dataRows[i][1])) + 1;
     var fromTime = Number(new Date(self.datePicker.getFromDateTime()));
     var diffHour = (new Date(dataRows[i][0]+':00:00') - fromTime) / 3600000;


     if (idx == 2) // Active Transaction Trend
     self.activeTxnStore[diffHour][wasId_Index] = dataRows[i][idx];
     else          // TPS Trend
     self.tpsStore[diffHour][wasId_Index] = dataRows[i][idx];
     }
     },
     */


    /**

     이건 그리드의 progress바에만 적용되는걸로 수정by부사장님(1406.09)
     차트 시리즈 값 계산식

     c <> 0 이면 (c_avg = c / cc)


     Client Time = c_avg - w_avg / c_avg
     WEB Time    = w_avg - was_avg / c_avg
     WAS Time    = was_avg - (r_avg + db_acg) / c_avg
     Remote Time = r_avg / c_avg
     DB Time     = db_avg / c_avg

     c = 0 이면 (w_avg = w / wc)

     Client Time = c_avg - w_avg / w_avg
     WEB Time    = w_avg - was_avg / w_avg
     WAS Time    = was_avg - (r_avg + db_acg) / w_avg
     Remote Time = r_avg / w_avg
     DB Time     = db_avg / w_avg

     c = 0 이고, w = 0 이면 (wac_avg = was / wasc)

     Client Time = c_avg - w_avg / wac_avg
     WEB Time    = w_avg - was_avg / wac_avg
     WAS Time    = was_avg - (r_avg + db_acg) / wac_avg
     Remote Time = r_avg / wac_avg
     DB Time     = db_avg / wac_avg

     단, R, DB값이 0이 아닌경우에만 각각 R_avg, db_avg 이다.

     */

    onChartData: function(header, data){
        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.warn('EtoEResponseTrend-onChartData');
            console.warn(header);
            console.warn(data);
            return;
        }

        if(data.rows.length > 0){
            if(header.command == this.sql.top_chart){
                var rowData = [] ;
                var param = header.parameters;

                var db_avg = 0,
                    row = null,
                    ix, client_avg, web_avg, was_avg, remote_avg;

                /*
                 c <> 0 이면 (c_avg = c / cc)


                 Client Time = c_avg - w_avg / c_avg
                 WEB Time    = w_avg - was_avg / c_avg
                 WAS Time    = was_avg - (r_avg + db_avg) / c_avg
                 Remote Time = r_avg / c_avg
                 DB Time     = db_avg / c_avg

                 c = 0 이면 (w_avg = w / wc)

                 Client Time = c_avg - w_avg / w_avg
                 WEB Time    = w_avg - was_avg / w_avg
                 WAS Time    = was_avg - (r_avg + db_acg) / w_avg
                 Remote Time = r_avg / w_avg
                 DB Time     = db_avg / w_avg

                 c = 0 이고, w = 0 이면 (wac_avg = was / wasc)

                 Client Time = c_avg - w_avg / wac_avg
                 WEB Time    = w_avg - was_avg / wac_avg
                 WAS Time    = was_avg - (r_avg + db_acg) / wac_avg
                 Remote Time = r_avg / wac_avg
                 DB Time     = db_avg / wac_avg

                 단, R, DB값이 0이 아닌경우에만 각각 R_avg, db_avg 이다.

                 */

                //쿼리 결과값 Rows 루프 돌면서, 계산하여 Rowdata에 담는다.
                for ( ix = 0; ix <= data.rows.length-1; ix++){
                    row = [];


                    // 각각의 avg data
                    client_avg = (data.rows[ix][1] || 0) / (data.rows[ix][3] || 1) ;
                    web_avg    = (data.rows[ix][4] || 0) / (data.rows[ix][6] || 1) ;
                    was_avg    = (data.rows[ix][7] || 0) / (data.rows[ix][9] || 1) ;
                    remote_avg = (data.rows[ix][10] || 0) / (data.rows[ix][12] || 1) ;
                    db_avg     = (data.rows[ix][13] || 0) / (data.rows[ix][15] || 1) ;

                    row[0] = data.rows[ix][0];   // time
                    //c <> 0 이 아닐 경우
                    if ( data.rows[ix][1] != null){
                        row[1] = (client_avg - web_avg) ;
                        row[2] = (web_avg - was_avg);
                        row[3] = (was_avg - (remote_avg + db_avg))  ;
                        row[4] = remote_avg ;
                        row[5] = db_avg ;
                    }
                    else if (data.rows[ix][4] != null) {
                        row[1] = 0 ;
                        row[2] = (web_avg - was_avg) ;
                        row[3] = (was_avg - (remote_avg + db_avg)) ;
                        row[4] = remote_avg ;
                        row[5] = db_avg ;
                    }
                    else {
                        //client 도 0이고, web도 0임
                        row[1] = 0 ;
                        row[2] = 0 ;
                        row[3] = (was_avg - (remote_avg + db_avg)) ;
                        row[4] = remote_avg ;
                        row[5] = db_avg ;
                    }

                    // 음수가 발생할 경우에는 0 처리
                    if (row[1] < 0) {
                        row[1] = 0;
                    }
                    if (row[2] < 0) {
                        row[2] = 0;
                    }
                    if (row[3] < 0) {
                        row[3] = 0;
                    }
                    if (row[4] < 0) {
                        row[4] = 0;
                    }
                    if (row[5] < 0) {
                        row[5] = 0;
                    }

                    rowData.push(row);
                }


                this.EtoERespondChart.addValues({
                    from: param.bind[0].value,
                    to: param.bind[1].value,
                    time: 0,
                    data: rowData,
                    series: {
                        Client: 1,
                        WEB   : 2,
                        WAS   : 3,
                        REMOTE: 4,
                        SQL   : 5
                    }
                }) ;

                /**
                 for (var ix=0; ix <= Rowdata.length-1; ix++){
                     Rowdata[ix][0] = +new Date(Rowdata[ix][0]);

                     self.EtoERespondChart.addValue(0, Rowdata[ix][1]);
                     self.EtoERespondChart.addValue(1, Rowdata[ix][2]);
                     self.EtoERespondChart.addValue(2, Rowdata[ix][3]);
                     self.EtoERespondChart.addValue(3, Rowdata[ix][4]);
                     self.EtoERespondChart.addValue(4, Rowdata[ix][5]);

                     console.log(Rowdata[ix]);
                     }
                 */

                this.EtoERespondChart.plotDraw();
            }

        }
        else{
            this.EtoERespondChart.plotDraw();
            console.info('callback', 'no data');
        }

        rowData    = null;
        param      = null;
        web_avg    = null;
        was_avg    = null;
        remote_avg = null;
        db_avg     = null;
        row        = null;
        ix         = null;
        header     = null;
        data       = null;
    },

    onData: function(aheader, adata) {
        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            this.loadingMask.hide();

            console.warn('EtoEResponseTrend-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        var ix = 0, jx,
            rowData, client_avg, web_avg, was_avg, remote_avg, db_avg, retText, totalTime;
        if (aheader.command == this.sql.bottom_Grid) {
            //3번쨰 컬럼에 넣어줄 배열 만들 것.
            if(adata.rows.length > 0){

                for (ix = 0; ix <= adata.rows.length-1; ix++){
                    rowData = adata.rows[ix];
                    for (jx = 4; jx < 19; jx++) {
                        if (rowData[jx] < 0) {
                            rowData[jx] = 0;
                        }
                    }

                    client_avg = rowData[5] || 0.000;
                    web_avg = rowData[8] || 0.000;
                    was_avg = rowData[11] || 0.000;
                    remote_avg = rowData[14] || 0.000;
                    db_avg = rowData[17] || 0.000;


                    if ( client_avg != 0) {
                        client_avg = (client_avg - web_avg);
                        web_avg = (web_avg - was_avg) ;
                        was_avg = (was_avg - (remote_avg + db_avg));
                    } else {
                        if ( web_avg != 0) {
                            client_avg = 0;
                            web_avg = (web_avg - was_avg) ;
                            was_avg = (was_avg - (remote_avg + db_avg));
                        } else {
                            client_avg = 0;
                            web_avg = 0 ;
                            was_avg = (was_avg - (remote_avg + db_avg));
                        }
                    }

                    totalTime = client_avg + web_avg + was_avg + remote_avg + db_avg ;

                    client_avg = ((client_avg / totalTime) * 100).toFixed(3);
                    web_avg    = ((web_avg / totalTime) * 100).toFixed(3);
                    was_avg    = ((was_avg / totalTime) * 100).toFixed(3);
                    remote_avg = ((remote_avg / totalTime) * 100).toFixed(3);
                    db_avg     = ((db_avg / totalTime) * 100).toFixed(3);

                    retText = db_avg + "/" + remote_avg + "/" + was_avg + "/" + web_avg + "/" + client_avg; //SQL, Remote, Agent, WebServer, Client


                    this.EtoERespondGrid.addRow([
                        (rowData[2] || '')              //txn_name
                        , (rowData[1] || '')            //was_name
                        , retText                       //chart
                        , (rowData[4] || 0.000)         //client_elapse_max
                        , (rowData[5] || 0.000)         //client_elapse_avg
                        , (rowData[6] || 0.000)         //client_count
                        , (rowData[7] || 0.000)         //web_elapse_max
                        , (rowData[8] || 0.000)         //web_elapse_avg
                        , (rowData[9] || 0.000)         //web_count
                        , (rowData[10] || 0.000)        //was_elapse_max
                        , (rowData[11] || 0.000)        //was_elapse_avg
                        , (rowData[12] || 0.000)        //was_count
                        , (rowData[13] || 0.000)        //remote_elapse_max
                        , (rowData[14] || 0.000)        //remote_elapse_avg
                        , (rowData[15] || 0.000)        //remote_count
                        , (rowData[16] || 0.000)        //sql_elapse_max
                        , (rowData[17] || 0.000)        //sql_elapse_avg
                        , (rowData[18] || 0.000)        //sql_count
                        , (rowData[0])
                    ]) ;
                }
            }

            this.EtoERespondGrid.drawGrid();
            this.loadingMask.hide();
        }
        ix      = null;
        aheader = null;
        adata   = null;
    }

});