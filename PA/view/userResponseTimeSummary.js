Ext.define("view.userResponseTimeSummary", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        top_chart       : 'IMXPA_UserResponseTrend_Chart.sql',
        bottom_Grid     : 'IMXPA_UserResponseTrend_Grid.sql'
    },
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    init: function(){
        var self = this;


        this.setWorkAreaLayout('border');

        /**************************** Condition Area *****************************/
        this.wasField = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 300,
            comboLabelWidth : 60,
            comboWidth      : 260,
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            x               : 400,
            y               : 5,
            linkMonitorType : 'WAS'
        });

        this.minElapseField = Ext.create('Exem.NumberField', {
            x: 715,
            y: 5,
            width: 145,
            fieldLabel: common.Util.CTR('feeling time'),
            labelWidth: 90,
            fieldStyle: 'text-align: right;',
            value: 0,
            maxLength: 9,
            hideTrigger: true,
            decimalPrecision: 3,
            allowExponential: false
        });
        var elapseTideLabel = Ext.create('Ext.form.Label', {
            x: 861,
            y: 10,
            text : '~'
        });
        this.maxElapseField = Ext.create('Exem.TextField', {
            x: 870,
            y: 5,
            width: 50,
            labelWidth: 0,
            fieldStyle: 'text-align: right;',
            value: common.Util.CTR('infinite'),
            maxLength: 9
        });
        var infinityBtn = Ext.create('Exem.Container', {
            x: 923,
            y: 10,
            width: 18,
            height: 13,
            html: '<img src="../images/infinity.png" class="res-inspector-infinity-btn"/>',
            listeners: {
                render: function() {
                    this.getEl().addListener('click', function() {
                        self.maxElapseField.setValue(common.Util.TR('infinite'));
                    });
                }
            }
        });

        this.txnTextField = Ext.create('Exem.TextField', {
            x           : 25,
            y           : 32,
            width       : 350,
            fieldLabel  : '',
            labelAlign  : 'right',
            allowBlank  : true,
            value       : common.Util.TR('Transaction'),
            labelWidth  : 105,
            maxLength   : 255,
            enforceMaxLength: true,
            listeners: {
                focus: function () {
                    if ( this.getValue() == '%'
                        || this.getValue() == common.Util.TR('Transaction')
                        || this.getValue() == '' )
                        this.setValue('%') ;
                },
                blur: function() {
                    if ( this.getValue() == '%' )
                        this.setValue(common.Util.TR('Transaction')) ;
                }

            }
        });

        this.conditionArea.add([this.wasField, this.minElapseField, elapseTideLabel, this.maxElapseField, infinityBtn,
                                this.txnTextField]);

        //# 화면 구성.
        //top Chart Panel
        var topChartPanel = Ext.create('Exem.Panel', {
            region : 'north',
            layout : 'fit',
            height :  '20%',
            split  : true,
            bodyStyle: {
                'border-radius': '6px;'
            }
        });

        //bottom Grid Panel
        var bottomPanel = Ext.create('Exem.Panel', {
            region : 'center',
            layout : 'fit',         //'border',
            height : '80%',
            width : '100%',
            split  : true
        });

        //chart
        this.userResponseChart = Ext.create('Exem.chart.CanvasChartLayer', {
            width : '100%',
            flex: 1,
            title : common.Util.TR('User Response Time Summary'),
            itemId       : 'userResponseChart',
            interval     : PlotChart.time.exTenMin,
            showTitle    : false ,
            showLegend   : true,
            legendNameWidth : 140,

            showTooltip  : true,
            toolTipFormat : '[%s]%x [value:%y]',
            toolTipTimeFormat : '%d %H:%M',

            showMaxValue : true,
            maxValueFormat : '%y',
            maxValueAxisTimeFormat : '%H"%M',

            showIndicator : false,

            legendOrder: PlotChart.legendOrder.exDesc,
            chartProperty: {
                colors: ['#4d44c2', '#7fcd2a', '#2b99f0']
            }
        }) ;

        this.userResponseChart.addSeries({
            id    : 'Client',
            label : common.Util.TR('Client Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        this.userResponseChart.addSeries({
            id    : 'Network',
            label : common.Util.CTR('Network Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        this.userResponseChart.addSeries({
            id    : 'Server',
            label : common.Util.CTR('Server Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });


        var gridPanel = Ext.create('Exem.Panel', {
            region : 'center',
            layout : 'fit',
            height : '100%',
            width: '100%'
        });


        this.userResponseGrid = Ext.create('Exem.BaseGrid', {
            height : '100%',
            width : '100%',
            Border : false,
            adjustGrid: false,
            stripeRows: false,
            defaultPageSize  : 32,
            defaultbufferSize: 32,
            itemdblclick: function( dv, record){
                self.openChartDetail(record.data);
            }
        });


        function createCellChart( value, meta, record ){
            if(record.data){
                meta.tdCls = meta.tdCls + ' customContentCell';
                return '';
            }
        }

        gridPanel.add(this.userResponseGrid);

        topChartPanel.add(this.userResponseChart);
        bottomPanel.add(gridPanel);

        this.workArea.add(topChartPanel);
        this.workArea.add(bottomPanel);


        //Grid 컬럼 추가.
        this.userResponseGrid.beginAddColumns();
        this.userResponseGrid.addColumn(common.Util.CTR('Transaction')    , 'txn_name'    , 350 , Grid.String , true, false);
        this.userResponseGrid.addColumn(common.Util.CTR('Agent')          , 'was_name'    , 100 , Grid.String , true, false);
        this.userResponseGrid.addColumn(common.Util.TR('Feeling Time')    , 'feeling_time', 120 , Grid.Float , true, false);
        this.userResponseGrid.addColumn(common.Util.TR('Chart')           , 'chart'       , 100 , Grid.String , true, false);
        this.userResponseGrid.addColumn(common.Util.TR('Processing Count'), 'count'       , 100 , Grid.Number , true, false);

        this.userResponseGrid.beginGroupColumns(common.Util.TR('Client Time'));
        this.userResponseGrid.addColumn(common.Util.TR('Client (MAX)')  , 'client_max'      , 110 , Grid.Float  , true, false);
        this.userResponseGrid.addColumn(common.Util.TR('Client (AVG)')  , 'client_avg'      , 110 , Grid.Float  , true, false);
        this.userResponseGrid.endGroupColumns();

        this.userResponseGrid.beginGroupColumns(common.Util.TR('Network Time'));
        this.userResponseGrid.addColumn(common.Util.TR('Network (MAX)') , 'network_max'     , 110 , Grid.Float  , true, false);
        this.userResponseGrid.addColumn(common.Util.TR('Network (AVG)') , 'network_avg'     , 110 , Grid.Float  , true, false);
        this.userResponseGrid.endGroupColumns();

        this.userResponseGrid.beginGroupColumns(common.Util.TR('Server Time'));
        this.userResponseGrid.addColumn(common.Util.TR('Server (MAX)')  , 'server_max'      , 110 , Grid.Float  , true, false);
        this.userResponseGrid.addColumn(common.Util.TR('Server (AVG)')  , 'server_avg'      , 110 , Grid.Float  , true, false);
        this.userResponseGrid.endGroupColumns();

        this.userResponseGrid.addColumn(common.Util.TR('txn_id')        , 'txn_id'          , 100 , Grid.String  , false, false);
        this.userResponseGrid.addColumn(common.Util.TR('was_id')        , 'was_id'          , 100 , Grid.Number  , false, false);

        this.userResponseGrid.addColumn(common.Util.TR('Transmitting Time') , 'transmit_time_avg'   , 100 , Grid.Float , false, false);
        this.userResponseGrid.addColumn(common.Util.TR('Reception Time')    , 'reception_time_avg'  , 100 , Grid.Float , false, false);

        this.userResponseGrid.endAddColumns();

        this.userResponseGrid.addRenderer('chart', createCellChart) ;
        this.userResponseGrid.setOrderAct('feeling_time', 'DESC');

        this.userResponseGrid.pnlExGrid.getView().on('refresh', function() {

            var recordIdx, record;

            this.starttime = null ;

            for (recordIdx = 0; recordIdx < this.userResponseGrid.pnlExGrid.store.getCount(); recordIdx++) {
                record = this.userResponseGrid.pnlExGrid.store.getAt(recordIdx);

                if ( Number(record.data.tid) == 0 ){
                    this.starttime = record.data.start_time ;
                    var p_start = new Date(this.starttime).setMilliseconds(0) ;
                }

                var grid_row = this.userResponseGrid.pnlExGrid.view.getNode(record) ;
                if ( grid_row && Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0] ){
                    var el = Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0].children ;
                }else{
                    return ;
                }

                if ( el[0].getElementsByClassName('quick-tip').length > 0 )
                    return ;

                // maxtime 사용자체감시간
                var tran     = parseFloat(record.data['transmit_time_avg']);
                var recive   = parseFloat(record.data['reception_time_avg']);
                var net_time = parseFloat(record.data['network_avg']);
                var ser_time = parseFloat(record.data['server_avg']);
                var total    = tran + recive + net_time + ser_time;

                tran =  ((  tran / total  ) * 100).toFixed(3) || 0 ;
                recive = ((  recive / total )* 100).toFixed(3) || 0 ;
                net_time = ((  net_time / total )* 100).toFixed(3) || 0;
                ser_time = ((  ser_time  / total ) * 100).toFixed(3) || 0;

                var bg  = document.createElement("div");
                var tra = document.createElement("div");
                var rec = document.createElement("div");
                var net = document.createElement("div");
                var ser = document.createElement("div");

                tra.setAttribute('class', 'quick-tip') ;
                rec.setAttribute('class', 'quick-tip') ;
                net.setAttribute('class', 'quick-tip') ;
                ser.setAttribute('class', 'quick-tip') ;
                tra.setAttribute('data-tab', self.id);
                rec.setAttribute('data-tab', self.id);
                net.setAttribute('data-tab', self.id);
                ser.setAttribute('data-tab', self.id);

                bg.style.width = '100%' ;
                bg.style.height = '100%' ;
                bg.style.marginTop = '-12px' ;

                tra.style.width = (tran)+'%' ;
                tra.style.height = '10px' ;
                tra.style.backgroundColor = '#00f0f8' ;
                tra.style.float = 'left' ;

                rec.style.width = (recive)+'%' ;
                rec.style.height = '10px' ;
                rec.style.backgroundColor = '#b86c5c' ;
                rec.style.float = 'left' ;

                net.style.width = (net_time)+'%' ;
                net.style.height = '10px' ;
                net.style.backgroundColor = '#7fcd2a' ;
                net.style.float = 'left' ;

                ser.style.width = (ser_time)+'%' ;
                ser.style.height = '10px' ;
                ser.style.backgroundColor = '#2b99f0' ;
                ser.style.float = 'left' ;

                el[0].appendChild( bg ) ;

                bg.appendChild( tra ) ;
                bg.appendChild( rec ) ;
                bg.appendChild( net ) ;
                bg.appendChild( ser ) ;

                bg = null ;
                tra = null ;
                rec = null ;
                net = null ;
                ser = null ;
                tran  = null ;
                recive  = null ;
                net_time  = null ;
                ser_time  = null ;

                self.create_tooltip(record) ;
            }
        }.bind(this));


        this.userResponseGrid.contextMenu.addItem({
            title : common.Util.TR('Detailed Chart'),
            fn: function() {
                var record = this.up().record;
                self.openChartDetail(record);
            }
        }, 0);
    },

    create_tooltip: function(record){

        var self = this ;

        //<div class="quick-tip" data-tip="THIS IS THE TIP! change elements 'data-tip' to change." data-tip-on="false">?</div>

        /*
         * 0,1 -> 0
         * 2,3 -> 1
         * 4,5 -> 2
         * 6,7 -> 3
         * .
         * .
         * */

        this.tip      = document.createElement("div");
        this.bodytime = document.createElement("div");

        this.tra_name = document.createElement("div");
        this.tra_rec  = document.createElement("div");

        this.rec_name  = document.createElement("div");
        this.rec_rec   = document.createElement("div");

        this.net_name  = document.createElement("div");
        this.net_rec   = document.createElement("div");

        this.ser_name  = document.createElement("div");
        this.ser_rec   = document.createElement("div");



        if ( self.tip.getAttribute('data-tab') == null )
            self.tip.setAttribute('data-tab', self.id);

        var elems_arr = [] ;

        var elems = document.getElementsByClassName('quick-tip') ;
        for(var ix = 0; ix < elems.length; ix++) {
            if ( (elems[ix].getAttribute('data-tab') !== self.id) || (elems[ix].getAttribute('data-tool-tip') !== null) )
                continue ;
            elems[ix].setAttribute('data-tool-tip', true);
            elems_arr.push( elems[ix] ) ;
        }

        for ( ix = 0 ; ix < elems_arr.length; ix++ ){
            elems_arr[ix].addEventListener("mouseover", doTip.bind(record), false);
            elems_arr[ix].addEventListener("mouseout" , doTip.bind(record), true);
        }
        ix = null ;
        elems_arr = null ;


        function doTip(e){
            var elem = e.toElement;
            if ( self.tip.getAttribute('data-tip-on') == null )
                self.tip.setAttribute('data-tip-on', 'false');

            if ( self.tip.getAttribute('data-tab') !== self.id )
                return ;
            if( self.tip.getAttribute('data-tip-on')  === 'false' ) {

                self.tip.setAttribute('data-tip-on', 'true');

                var rect = elem.parentNode.getBoundingClientRect();
                var left_loc = rect.left;
                var bottom_loc = rect.bottom;

                if(bottom_loc > 723){
                    bottom_loc =  bottom_loc - 140  ;
                }

                self.tip.innerHTML = elem.getAttribute('data-tip');
                self.tip.style.top =  bottom_loc  + 'px';
                self.tip.style.left = (left_loc) + 'px';
                self.tip.style.height = 120 + 'px';
                self.tip.style.border = 1;

                self.tip.style.zIndex = 100;

                self.tip.setAttribute('class','tip-box');


                var total    = record.data['transmit_time_avg'] + record.data['reception_time_avg'] + record.data['network_avg'] + record.data['server_avg'];

                self.bodytime.innerHTML = common.Util.TR('Feeling Time') +' : ' + total.toFixed(3);
                self.bodytime.style.top = rect.bottom + 10 + 'px';
                self.bodytime.style.fontWeight = 'bold';
                self.bodytime.style.size = '13px';
                self.bodytime.setAttribute('class','tip-title');

                self.tra_name.setAttribute('class','tip-title');
                self.tra_rec .setAttribute('class','tip-tra-rec tip-tra-rec-bg');
                self.tra_name.innerHTML = common.Util.TR('Transmitting Time') +' : ' + record.data['transmit_time_avg'].toFixed(3);

                self.rec_name.setAttribute('class','tip-title');
                self.rec_rec .setAttribute('class','tip-rec-rec tip-rec-rec-bg');
                self.rec_name.innerHTML = common.Util.TR('Reception Time') +' : ' +  record.data['reception_time_avg'].toFixed(3);

                self.net_name.setAttribute('class','tip-title');
                self.net_rec .setAttribute('class','tip-net-rec tip-net-rec-bg');
                self.net_name.innerHTML = common.Util.TR('Network Time') +' : ' + record.data['network_avg'].toFixed(3);

                self.ser_name.setAttribute('class','tip-title');
                self.ser_rec .setAttribute('class','tip-ser-rec tip-ser-rec-bg');
                self.ser_name.innerHTML = common.Util.TR('Server Time') +' : ' + record.data['server_avg'].toFixed(3);

                self.tip.appendChild( self.bodytime );

                self.tip.appendChild( self.tra_rec  );
                self.tip.appendChild( self.tra_name );

                self.tip.appendChild( self.rec_rec  );
                self.tip.appendChild( self.rec_name );

                self.tip.appendChild( self.net_rec  );
                self.tip.appendChild( self.net_name );

                self.tip.appendChild( self.ser_rec  );
                self.tip.appendChild( self.ser_name );

                document.body.appendChild(self.tip);

            } else {

                self.tip.setAttribute('data-tip-on', 'false');
                if ( self.tip.parentNode == undefined ) {
                    self.tip.remove();
                }else{
                    self.tip.parentNode.removeChild(self.tip);
                }
            }
        }


        ix = null ;
        elems = null ;

    } ,

    openChartDetail: function(record){

        if(this.chartDetailWin) {
            this.chartDetailWin.close();
        }

        this.chartDetailWin = Ext.create('Exem.XMWindow', {
            layout  : 'fit',
            maximizable: false,
            width: 1000,
            height: 500,
            minWidth: 750,
            minHeight: 375,
            resizable: true,
            title: common.Util.TR('Transaction Name') + ' : ' + record.txn_name,
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var chartPanel = Ext.create('Ext.panel.Panel', {
            layout : 'vbox',
            width  : '100%',
            height : '100%',
            border : false,
            split  : true
        });

        var totalTime ;

        var transmit_time_avg_percent, reception_time_avg_percent, network_avg_percent, server_avg_percent;

        var transmit_time_avg = record['transmit_time_avg'];
        var reception_time_avg = record['reception_time_avg'];
        var network_avg  = record['network_avg'] ;
        var server_avg   = record['server_avg'] ;

        if (transmit_time_avg < 0) {
            transmit_time_avg = 0;
        }
        if (reception_time_avg < 0) {
            reception_time_avg = 0;
        }
        if (network_avg < 0)    {
            network_avg = 0;
        }
        if (server_avg < 0)    {
            server_avg = 0;
        }

        totalTime = transmit_time_avg + reception_time_avg + network_avg + server_avg;


        transmit_time_avg_percent    = ((transmit_time_avg / totalTime) * 97).toFixed(3);
        reception_time_avg_percent = ((reception_time_avg / totalTime) * 97).toFixed(3);
        network_avg_percent      = ((network_avg / totalTime) * 97).toFixed(3);
        server_avg_percent       = ((server_avg / totalTime) * 97).toFixed(3);

        if(isNaN(transmit_time_avg_percent)){
            transmit_time_avg_percent = 0;
        }

        if(isNaN(reception_time_avg_percent)){
            reception_time_avg_percent = 0;
        }

        if(isNaN(network_avg_percent)){
            network_avg_percent = 0;
        }

        if(isNaN(server_avg_percent)){
            server_avg_percent = 0;
        }

        var barChartContainer = Ext.create('Exem.Container', {
            width  : '100%',
            height :  60,
            margin : '10 20 20 20',
            style : {
                display: 'flex'
            }
        });

        var barChartArea = Ext.create('Exem.Container', {
            style : {
                'flex-basis': '80%'
            }
        });

        var split = Ext.create('Exem.Container', {
            style : {
                flex: 1
            }
        });

        var barChartLegendArea = Ext.create('Exem.Container', {
            style : {
                'flex-basis': '180px'
            }
        });

        barChartContainer.add(barChartArea, split, barChartLegendArea);

        this.userResponseChartDetail = Ext.create('Exem.chart.CanvasChartLayer', {
            width : '100%',
            flex: 1,
            title : common.Util.TR('User Response Time Summary'),
            itemId       : 'userResponseChartDetail',
            interval     : PlotChart.time.exTenMin,
            showTitle    : false ,
            legendNameWidth : 140,
            showLegend         : true,
            //legendTextAlign    : 'east',
            legendAlign        : 'south',
            legendVH           : 'hbox',
            legendHeight       : 30,
            legendContentAlign : 'center',
            showTooltip  : true,
            toolTipFormat : '[%s]%x [value:%y]',
            toolTipTimeFormat : '%d %H:%M',
            showMaxValue : true,
            maxValueFormat : '%y',
            maxValueAxisTimeFormat : '%H"%M',
            legendOrder: PlotChart.legendOrder.exAsc,
            chartProperty: {
                colors: ['#00f0f8', '#b86c5c', '#7fcd2a', '#2b99f0']
            }
        }) ;

        this.userResponseChartDetail._chartOption.xaxis.timeformat = '%H:%M';

        this.userResponseChartDetail.addSeries({
            id    : 'transmit',
            label : common.Util.TR('Transmitting Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        this.userResponseChartDetail.addSeries({
            id    : 'reception',
            label : common.Util.TR('Reception Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        this.userResponseChartDetail.addSeries({
            id    : 'Network',
            label : common.Util.CTR('Network Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        this.userResponseChartDetail.addSeries({
            id    : 'Server',
            label : common.Util.CTR('Server Time'),
            type  : PlotChart.type.exLine,
            stack : true
        });

        this.userResponseChartDetail.clearValues();

        var chartDetailDataSet = {};

        chartDetailDataSet.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
        }, {
            name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
        }, {
            name  : 'txn_name',
            value : record.txn_name,
            type : SQLBindType.STRING
        }] ;

        chartDetailDataSet.replace_string = [{
            name : 'was_id',
            value : record.was_id
        }] ;

        chartDetailDataSet.sql_file = this.sql.top_chart;
        this.isDetailChart = true;
        WS.SQLExec(chartDetailDataSet, this.onChartData, this);

        chartPanel.add(barChartContainer,this.userResponseChartDetail);
        this.chartDetailWin.add(chartPanel);

        this.chartDetailWin.show();

        this.beginBarLineChartDom(true);
        this.addChartDom( 'transmit', transmit_time_avg, transmit_time_avg_percent, 'Transmitting Time' );
        this.addChartDom( 'reception', reception_time_avg, reception_time_avg_percent, 'Reception Time' );
        this.addChartDom( 'network', network_avg, network_avg_percent, 'Network Time' );
        this.addChartDom( 'server', server_avg, server_avg_percent, 'Server Time' );

        this.addLegendDom( barChartLegendArea.el.dom, server_avg, 'Server Time', '#2b99f0' );
        this.addLegendDom( barChartLegendArea.el.dom, network_avg, 'Network Time', '#7fcd2a' );
        this.addLegendDom( barChartLegendArea.el.dom, reception_time_avg, 'Reception Time', '#b86c5c' );
        this.addLegendDom( barChartLegendArea.el.dom, transmit_time_avg, 'Transmitting Time', '#00f0f8' );

        this.endBarLineChartDom( barChartArea.el.dom );
    },

    beginBarLineChartDom: function(lineTextOption){
        if(lineTextOption){
            this.textDiv = document.createElement('div');
            this.textDiv.setAttribute('style','position:relative; width:100%; height:15px;');

            this.widthLineDiv = document.createElement('div');
            this.widthLineDiv.setAttribute('style','position:relative; width:100%; height:10px;');
            this.lineTextOption = true;
        }

        this.barChartDiv = document.createElement('div');
        this.barChartDiv.setAttribute('style','position:relative; width:100%; height:35px;');
    },

    addChartDom: function( classType, addChartValue, addChartWidth, chartText ){
        if(this.lineTextOption){
            var topText = document.createElement('div');
            var widthLine = document.createElement('div');

            if(addChartWidth > 3){
                var secondText= document.createTextNode(addChartValue+'s');
                topText.appendChild(secondText);
            }

            if(addChartValue === 0){
                topText.setAttribute('class', 'line-bar-chart-top-text empty');
                topText.setAttribute('style','width:'+ addChartWidth +'%;');
                topText.setAttribute('data-qtip',common.Util.TR(chartText)+' '+addChartValue+'s');

                widthLine.setAttribute('class', 'chart-guide-line empty '+ classType);
                widthLine.setAttribute('style','width:'+ addChartWidth +'%;');
            } else {
                topText.setAttribute('class', 'line-bar-chart-top-text');
                topText.setAttribute('style','width:'+ addChartWidth +'%;');
                topText.setAttribute('data-qtip',common.Util.TR(chartText)+' '+addChartValue+'s');

                widthLine.setAttribute('class', 'chart-guide-line '+ classType);
                widthLine.setAttribute('style','width:'+ addChartWidth +'%;');
            }

            this.textDiv.appendChild(topText);
            this.widthLineDiv.appendChild(widthLine);
        }

        var chart = document.createElement('div');
        if(addChartWidth > 3){
            var chartTextNode = document.createTextNode(common.Util.TR(chartText));
            chart.appendChild(chartTextNode);
        }

        if(addChartValue === 0){
            chart.setAttribute('class','line-bar-chart empty '+ classType);
            chart.setAttribute('style','width:'+ addChartWidth +'%; ');
            chart.setAttribute('data-qtip',common.Util.TR(chartText)+' '+addChartValue+'s');
        } else {
            chart.setAttribute('class','line-bar-chart '+ classType);
            chart.setAttribute('style','width:'+ addChartWidth +'%; ');
            chart.setAttribute('data-qtip',common.Util.TR(chartText)+' '+addChartValue+'s');
        }

        this.barChartDiv.appendChild(chart);
    },

    addLegendDom: function(targetDom, value, text, color){
        var legendDiv = document.createElement('div');
        legendDiv.setAttribute('style','height:15px; margin-left:10px; margin-bottom: 3px;');

        var colorLabel = document.createElement('label');
        colorLabel.setAttribute('style','vertical-align:middle; display: inline-block; width:10px; height:10px; background-color:'+color);

        var textLabel = document.createElement('label');
        var textNode = document.createTextNode(common.Util.TR(text)+' '+value+'s');
        textLabel.appendChild(textNode);
        textLabel.setAttribute('style','margin-left:4px; color:#666;');

        legendDiv.appendChild(colorLabel);
        legendDiv.appendChild(textLabel);

        targetDom.appendChild(legendDiv);
    },

    endBarLineChartDom: function(targetDom){
        if(this.lineTextOption){
            targetDom.appendChild(this.textDiv);
            targetDom.appendChild(this.widthLineDiv);
        }
        targetDom.appendChild(this.barChartDiv);
    },

    checkValid: function() {
        var minElapse = this.minElapseField.getValue(),
            maxElapse = this.maxElapseField.getValue();

        if (isNaN(minElapse))
            this.minElapseField.setValue(0);
        if (isNaN(maxElapse)) {
            this.maxElapseField.setValue(common.Util.TR('infinite'));
            maxElapse = 99999999999;
        }

        if (minElapse > maxElapse) {
            this.minElapseField.markInvalid('');
            this.maxElapseField.markInvalid('');
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Minimum elapse time cannot be greater than maximum elapse time.'));
            return false;
        }
        return true;
    },

    executeSQL: function() {

        var chartDataSet = {};
        var gridDataSet = {};
        var txn_name = this.txnTextField.getValue() ;

        this.loadingMask.showMask();

        if ( txn_name == common.Util.TR('Transaction') || txn_name == '' ) {
            txn_name = '%' ;
        }

        this.minElapse = this.minElapseField.getValue()*1000;

        if (this.maxElapseField.getValue() == common.Util.TR('infinite')){
            this.maxElapse = 99999999999;
        }
        else{
            this.maxElapse = this.maxElapseField.getValue()*1000;
        }

        this.userResponseGrid.clearRows();
        this.remove_tip();
        this.userResponseChart.clearValues();
        //Chart
        chartDataSet.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
        }, {
            name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
        }, {
            name  : "txn_name",
            value : txn_name,
            type : SQLBindType.STRING
        }] ;

        chartDataSet.replace_string = [{
            name : "was_id",
            value : this.wasField.getValue()
        }] ;

        chartDataSet.sql_file = this.sql.top_chart;
        this.isDetailChart = false;
        WS.SQLExec(chartDataSet, this.onChartData, this);

        //Grid
        gridDataSet.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
        }, {
            name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "txn_name",
            value : txn_name,
            type : SQLBindType.STRING
        }] ;

        gridDataSet.replace_string = [{
            name : "was_id",
            value : this.wasField.getValue()
        }] ;

        gridDataSet.sql_file = this.sql.bottom_Grid;
        WS.SQLExec(gridDataSet, this.onData, this);
    },

    remove_tip: function(){
        if ( this.tip ){
            if ( this.tip.parentNode == undefined ){
                this.tip.remove() ;
            }else {
                this.tip.parentNode.removeChild(this.tip);
            }
        }
    },

    onChartData: function(header, data){
        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            console.warn('userResponseTimeSummary-onChartData');
            console.warn(header);
            console.warn(data);
            return;
        }

        if(data.rows.length > 0){
            if(header.command == this.sql.top_chart){
                var rowData = [] ;
                var param = header.parameters;

                var row = null,
                    ix, client_avg, network_avg, server_avg, transmit_avg, reception_avg;

                //쿼리 결과값 Rows 루프 돌면서, 계산하여 Rowdata에 담는다.
                for ( ix = 0; ix <= data.rows.length-1; ix++){
                    row = [];


                    network_avg    = (data.rows[ix][5] || 0);
                    server_avg    = (data.rows[ix][7] || 0);
                    if(this.isDetailChart){
                        transmit_avg     = (data.rows[ix][8] || 0);
                        reception_avg  = (data.rows[ix][9] || 0);
                    } else {
                        client_avg = (data.rows[ix][3] || 0);
                    }


                    row[0] = data.rows[ix][0];   // time
                    if(this.isDetailChart){
                        row[1] = transmit_avg;
                        row[2] = reception_avg;
                        row[3] = network_avg;
                        row[4] = server_avg;

                        if (row[4] < 0) {
                            row[4] = 0;
                        }
                    } else {
                        row[1] = client_avg;
                        row[2] = network_avg;
                        row[3] = server_avg;
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

                    rowData.push(row);
                }

                if(this.isDetailChart){
                    this.userResponseChartDetail.addValues({
                        from: param.bind[0].value,
                        to: param.bind[1].value,
                        time: 0,
                        data: rowData,
                        series: {
                            transmit  : 1,
                            reception : 2,
                            Network   : 3,
                            Server    : 4
                        }
                    });

                    this.userResponseChartDetail.plotDraw();
                } else {
                    this.userResponseChart.addValues({
                        from: param.bind[0].value,
                        to: param.bind[1].value,
                        time: 0,
                        data: rowData,
                        series: {
                            Client  : 1,
                            Network : 2,
                            Server  : 3
                        }
                    });

                    this.userResponseChart.plotDraw();
                }
            }
        }
        else{
            if(this.isDetailChart){
                this.userResponseChartDetail.plotDraw();
            } else{
                this.userResponseChart.plotDraw();
            }
            console.info('callback', 'no data');
        }

        rowData    = null;
        param      = null;
        network_avg    = null;
        server_avg    = null;
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

            console.warn('userResponseTimeSummary-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        var ix = 0,
            rowData, client_avg, network_avg, server_avg, retText, totalTime;
        if (aheader.command == this.sql.bottom_Grid) {
            //3번쨰 컬럼에 넣어줄 배열 만들 것.
            if(adata.rows.length > 0){

                for (ix = 0; ix <= adata.rows.length-1; ix++){
                    rowData = adata.rows[ix];

                    client_avg = rowData[4];
                    network_avg = rowData[6];
                    server_avg = rowData[8];

                    totalTime = client_avg + network_avg + server_avg;

                    client_avg = ((client_avg / totalTime) * 100).toFixed(3);
                    network_avg    = ((network_avg / totalTime) * 100).toFixed(3);
                    server_avg    = ((server_avg / totalTime) * 100).toFixed(3);

                    retText = server_avg + "/" + network_avg + "/" + client_avg;

                    this.userResponseGrid.addRow([
                        (rowData[0] || '')              //txn_name
                        , (rowData[1] || '')            //was_name
                        , (rowData[4] + rowData[6] + +rowData[8] || 0.000)          //feeling_time
                        , retText                       //chart
                        , rowData[2]                    //count
                        , (rowData[3] || 0.000)         //client_max
                        , (rowData[4] || 0.000)         //client_avg
                        , (rowData[5] || 0.000)         //network_max
                        , (rowData[6] || 0.000)         //network_avg
                        , (rowData[7] || 0.000)         //server_max
                        , (rowData[8] || 0.000)         //server_avg
                        , (rowData[9] || 0.000)         //txn_id
                        , (rowData[10] || 0.000)        //was_id
                        , (rowData[11] || 0.000)        //transmit_time_avg
                        , (rowData[12] || 0.000)        //reception_time_avg
                    ]) ;
                }
            }

            this.userResponseGrid.drawGrid();
            this.loadingMask.hide();
        }
        ix      = null;
        aheader = null;
        adata   = null;
    }

});