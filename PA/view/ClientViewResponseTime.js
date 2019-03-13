/**
 * Created by pjy
 */
Ext.define("view.ClientViewResponseTime",{
    extend: "Exem.FormOnCondition",
    width : '100%',
    height: '100%',
    layout: 'vbox',
    style : {
        background: '#cccccc'
    },
    sql   : {
        ClientVeiwTime: 'IMXPA_ClientViewResponseTime.sql',
    },
    cls   : 'list-condition Exem-FormOnCondition',
    DisplayTime: DisplayTimeMode.HMS,
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    init  : function(){
        this.setWorkAreaLayout('vbox') ;
        //검색 조건 레이아웃
        this.condition_layout() ;
        //그리드
        this.create_grid() ;


        var fDate = new Date((new Date())-20*60*1000);
        var tDate = new Date();

        fDate.setSeconds(0);
        fDate.setMilliseconds(0);

        tDate.setSeconds(0);
        tDate.setMilliseconds(0);

        this.datePicker.mainFromField.setValue( this.datePicker.dataFormatting(fDate, this.datePicker.DisplayTime));
        this.datePicker.mainToField.setValue( this.datePicker.dataFormatting(tDate, this.datePicker.DisplayTime));
    },

    executeSQL: function(){


        if ( !this.check_validate() )return;


        this.get_data() ;

    } ,

    check_validate: function(){

        if ( this.client_ip.getRawValue() == common.Util.TR('Client IP') ){
            return true ;
        }

        if ( this.client_ip.getRawValue().split('.').length !== 4 ){
            common.Util.showMessage(common.Util.TR('ERROR'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                return false ;
            });
            return false ;
        }

        return true ;

    },

    create_grid: function(){
        var self = this ;

        var create_time_line = function( value, meta ){
            meta.tdCls = meta.tdCls + ' customContentCell';
            return '';
        } ;

        var pnl = Ext.create('Exem.Container',{
            itemId: 'pnl',
            layout : {
                type : 'hbox',
                pack : 'end'
            },
            width : '100%',
            height: 20,
            items : [{
                xtype: 'container',
                width : 12,
                height: 12,
                margin: '0 5 0 0',
                style: { 'background-color': '#FFE699' }
            },{
                xtype: 'label',
                text :  common.Util.TR('Transmission'),
                margin: '-1 10 10 0'
            },{
                xtype: 'container',
                width : 12,
                height: 12,
                margin: '0 5 0 0',
                style: { 'background-color': '#F4B183' }
            },{
                xtype: 'label',
                text : common.Util.TR('Receive'),
                margin: '-1 10 10 0'
            },
            {
                xtype: 'container',
                width : 12,
                height: 12,
                margin: '0 5 0 0',
                style: { 'background-color': '#1F4E79' }
            },{
                xtype: 'label',
                text : common.Util.TR('Network Time'),
                margin: '-1 10 10 0'
            },{
                xtype: 'container',
                width : 12,
                height: 12,
                margin: '0 5 0 0',
                style: { 'background-color': '#A9D18E' }
            },{
                xtype: 'label',
                text : common.Util.TR('Server Time'),
                margin: '-1 10 10 0'
            }]
        }) ;

        this.timeline_grid = Ext.create('Exem.BaseGrid',{
            itemId     : 'timeline_grid',
            gridType   : Grid.exGrid,
            adjustGrid : true,
            useArrows  : true,
            defaultbufferSize : 1000,
            defaultPageSize: 40
        }) ;

        this.workArea.add( pnl, this.timeline_grid ) ;

        this.timeline_grid.beginAddColumns() ;
        this.timeline_grid.addColumn(common.Util.CTR('Transaction')      , 'txn_name'       , 200, Grid.String  , true, false) ;
        this.timeline_grid.addColumn(common.Util.CTR('Client IP')        , 'ip'             , 120, Grid.String  , true, false) ;
        this.timeline_grid.addColumn(common.Util.CTR('Service Name')     , 'service_name'   , 130, Grid.String  , true, false) ;
        this.timeline_grid.addColumn(common.Util.CTR('Feeling Time')     , 'feeling_time'   , 120, Grid.Float   , true, false) ; // 사용자 응답시간

        this.timeline_grid.beginGroupColumns(common.Util.TR('Client'));
        this.timeline_grid.addColumn(common.Util.CTR('Client Time')      , 'client_time'    , 135, Grid.Float   , true, false) ;
        this.timeline_grid.addColumn(common.Util.CTR('Transmitting Time'), 'transmission'   , 90 , Grid.Float   , true, false) ;
        this.timeline_grid.addColumn(common.Util.CTR('Reception Time')   , 'receive'        , 90 , Grid.Float   , true, false) ;
        this.timeline_grid.endGroupColumns();

        this.timeline_grid.beginGroupColumns(common.Util.TR('Network'));
        this.timeline_grid.addColumn(common.Util.CTR('Network Time')     , 'network_time'   , 130, Grid.Float   , true, false) ;
        this.timeline_grid.endGroupColumns();

        this.timeline_grid.beginGroupColumns(common.Util.TR('Server'));
        this.timeline_grid.addColumn(common.Util.CTR('Server Time')      , 'server_time'    , 100, Grid.Float   , true, false) ;
        this.timeline_grid.addColumn('AP Time'                           , 'ap_time'        , 80 , Grid.Float   , true, false) ;
        this.timeline_grid.addColumn('SQL Time'                          , 'sql_time'       , 80 , Grid.Float   , true, false) ;
        this.timeline_grid.addColumn('Fetch Time'                        , 'fetch_time'     , 80 , Grid.Float   , true, false) ;
        this.timeline_grid.endGroupColumns();

        this.timeline_grid.addColumn(common.Util.CTR('Start Time')       , 'tran_start_time', 120, Grid.DateTime, true, false) ;
        this.timeline_grid.addColumn(common.Util.CTR('Time Line')        , 'time_line'      , 230, Grid.String  , true, false) ;
        this.timeline_grid.addColumn('TID'                               , 'tid'            , 150, Grid.String  , false, false) ;
        this.timeline_grid.endAddColumns() ;

        this.timeline_grid.addRenderer( 'time_line', create_time_line, RendererType.bar );
        this.timeline_grid.setOrderAct('feeling_time', 'DESC');

        this.timeline_grid.contextMenu.addItem({
            title: common.Util.TR('Transaction Trend'),
            fn: function() {
                self.linkRecord = this.up().record;
                self.viewTransactionTrend(self.linkRecord);
                self.linkRecord = null;
            }
        }, 0);

        this.timeline_grid.pnlExGrid.getView().on('refresh', function() {

            var recordIdx, record;

            this.starttime = null ;

            for (recordIdx = 0; recordIdx < this.timeline_grid.pnlExGrid.store.getCount(); recordIdx++) {
                record = this.timeline_grid.pnlExGrid.store.getAt(recordIdx);

                if ( Number(record.data.tid) == 0 ){
                    this.starttime = record.data.start_time ;
                    var p_start = new Date(this.starttime).setMilliseconds(0) ;
                }

                var grid_row = this.timeline_grid.pnlExGrid.view.getNode(record) ;
                if ( grid_row && Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0] ){
                    var el = Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0].children ;
                }else{
                    return ;
                }


                if ( el[0].getElementsByClassName('quick-tip').length > 0 ) {

                    return ;

                }

                // maxtime 사용자체감시간
                var bodytime = record.data['feeling_time'];
                var tran =  record.data['transmission'];
                var recive  =  record.data['receive'];
                var net_time =  record.data['network_time'];
                var ser_time = record.data['server_time'];

                tran     = ((  tran / bodytime      ) * 100).toFixed(3) || 0 ;
                recive   = ((  recive / bodytime    ) * 100).toFixed(3) || 0 ;
                net_time = ((  net_time / bodytime  ) * 100).toFixed(3) || 0;
                ser_time = ((  ser_time  / bodytime ) * 100).toFixed(3) || 0;

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
                tra.style.backgroundColor = '#FFE699' ;
                tra.style.float = 'left' ;

                rec.style.width = (recive)+'%' ;
                rec.style.height = '10px' ;
                rec.style.backgroundColor = '#F4B183' ;
                rec.style.float = 'left' ;

                net.style.width = (net_time)+'%' ;
                net.style.height = '10px' ;
                net.style.backgroundColor = '#1F4E79' ;
                net.style.float = 'left' ;

                ser.style.width = (ser_time)+'%' ;
                ser.style.height = '10px' ;
                ser.style.backgroundColor = '#A9D18E' ;
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


    } ,



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
            if ( self.tip.getAttribute('data-tip-on') == null ) {
                self.tip.setAttribute('data-tip-on', 'false');
            }

            if ( self.tip.getAttribute('data-tab') !== self.id ) {
                return ;
            }

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

                self.bodytime.innerHTML =common.Util.TR('Feeling Time') +' : ' + record.data.feeling_time.toFixed(3);
                self.bodytime.style.top = rect.bottom + 10 + 'px';
                self.bodytime.style.fontWeight = 'bold';
                self.bodytime.style.size = '13px';
                self.bodytime.setAttribute('class', 'tip-title');

                self.tra_name.setAttribute('class', 'tip-title');
                self.tra_rec .setAttribute('class', 'tip-tra-rec');
                self.tra_name.innerHTML = common.Util.TR('Transmitting Time') +' : ' + record.data.transmission.toFixed(3);

                self.rec_name.setAttribute('class', 'tip-title');
                self.rec_rec .setAttribute('class', 'tip-rec-rec');
                self.rec_name.innerHTML = common.Util.TR('Reception Time') +' : ' +  record.data.receive.toFixed(3);

                self.net_name.setAttribute('class', 'tip-title');
                self.net_rec .setAttribute('class', 'tip-net-rec');
                self.net_name.innerHTML = common.Util.TR('Network Time') +' : ' + record.data.network_time.toFixed(3);

                self.ser_name.setAttribute('class', 'tip-title');
                self.ser_rec .setAttribute('class', 'tip-ser-rec tip-ser-rec-height24');
                self.ser_name.innerHTML = common.Util.TR('Server Time') +' : ' + record.data.server_time.toFixed(3)  + '<BR>' +
                    ' <span style="font-size:10px"> ( '+ ' AP : ' + record.data.ap_time.toFixed(3) + ',  SQL : ' + record.data.sql_time.toFixed(3) + ',  Fetch : '+ record.data.fetch_time.toFixed(3) + ')</span>';

                self.tip.appendChild( self.bodytime ) ;

                self.tip.appendChild( self.tra_rec ) ;
                self.tip.appendChild( self.tra_name ) ;

                self.tip.appendChild( self.rec_rec ) ;
                self.tip.appendChild( self.rec_name ) ;

                self.tip.appendChild( self.net_rec ) ;
                self.tip.appendChild( self.net_name ) ;

                self.tip.appendChild( self.ser_rec ) ;
                self.tip.appendChild( self.ser_name ) ;

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



    get_data: function(  ){

        var self = this ;

        this.loadingMask.show() ;

        var result = this.checkValid();

        if ( result ){

            var action_value = this.view_name.getValue() ;

            if ( action_value == common.Util.TR('Transaction') ){
                action_value = '' ;
            } else {
                action_value = 'AND Z.txn_name like \'' + action_value + '\'';
            }

            var ip_value = this.client_ip.getValue() ;
            if ( ip_value == common.Util.TR('Client IP') ){
                ip_value = '' ;
            } else {
                ip_value = 'AND Z.ip like \'' + ip_value + '\'';
            }

                //me.minElapseField.getValue()*1000, maxElapse
                this.minElapse= parseFloat(this.minElapseField.getValue());

                if (this.maxElapseField.getValue() !== common.Util.TR('infinite')) {
                    this.maxElapse = parseFloat(this.maxElapseField.getValue());
                }else{
                    this.maxElapse = 100000000;
                }

            WS.SQLExec({
                sql_file: this.sql.ClientVeiwTime ,

                bind: [{
                    name : 'fromtime',
                    type : SQLBindType.STRING,
                    value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00' //common.Util.getDate(this.datePicker.getFromDateTime())
                },{
                    name : 'totime',
                    type : SQLBindType.STRING,
                    value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00' //common.Util.getDate(this.datePicker.getToDateTime())
                }, {
                    name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
                }, {
                    name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
                }],

                replace_string: [{
                    name : 'condition_where',
                    value: action_value + ip_value
                }, {
                    name : 'was_id',
                    value : this.wasField.getValue()
                }]

            }, this.grid_data, this) ;

        }else {

            console.warn('Failed validation - ', this.title);

            if (typeof result == 'string'){
                console.warn('message :', result);
            }

            return;

        }

        result = null ;



    },

    grid_data: function(header, data){
        var ix;

        this.timeline_grid.clearRows();
        this.remove_tip() ;

        var self = this ;
        var flag = false ;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            this.loadingMask.hide();

            console.debug('ClientResponseTime-grid_data');
            console.debug(header);
            console.debug(data);
            return;
        }

        if ( header.command == this.sql.ClientVeiwTime ){

            for ( ix = 0 ; ix < data.rows.length; ix++ ){

                var tran, recive, net_time, ser_time, retText;

                tran =  data.rows[ix][10] || 0;
                tran.toFixed(3);
                recive  = data.rows[ix][11] || 0;
                recive.toFixed(3);
                net_time =  data.rows[ix][ 5] || 0;
                net_time.toFixed(3);
                ser_time = data.rows[ix][ 6] || 0;
                ser_time.toFixed(3);

                retText = tran + '/' + recive + '/' + net_time + '/' + ser_time ;

                this.timeline_grid.addRow(  [
                      data.rows[ix][ 0]                                   //'txn_name'
                    , data.rows[ix][ 1]                                   //'ip'
                    , data.rows[ix][ 2]                                   //'service_name'
                    , data.rows[ix][ 3] || 0.000                          //'feeling_time'
                    , data.rows[ix][ 4] || 0.000                          //'client_time'
                    , data.rows[ix][10] || 0.000                          //'transmission'
                    , data.rows[ix][11] || 0.000                          //'receive'
                    , data.rows[ix][ 5] || 0.000                          //'network_time'
                    , data.rows[ix][ 6] || 0.000                          //'server_time'
                    , data.rows[ix][ 7] || 0.000                          //'ap_time'
                    , data.rows[ix][ 8] || 0.000                          //'sql_time'
                    , data.rows[ix][ 9] || 0.000                          //'fetch_time'
                    , common.Util.getDate(data.rows[ix][ 12])             //'tran_start_time'
                    , retText                                             //'time_line'
                    , data.rows[ix][13]                                   //'tid'

                ]) ;
            }

            this.timeline_grid.drawGrid() ;
        }


        this.loadingMask.hide() ;
        flag = null ;
        ix = null ;
    } ,


    remove_tip: function(){
        if ( this.tip ){
            if ( this.tip.parentNode == undefined ){
                this.tip.remove() ;
            }else {
                this.tip.parentNode.removeChild(this.tip);
            }

        }

    },

    condition_layout: function(){

        var me = this;

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

        this.view_name = Ext.create('Exem.TextField',{
            fieldLabel: '',
            itemId    : 'view_name',
            labelAlign: 'right',
            labelWidth: 90,
            width     : 260,
            allowBank : false,
            value     : common.Util.TR('Transaction') ,
            x         : 25,
            y         : 32 ,
            listeners: {
                focus: function () {
                    if ( this.getValue() == '%' || this.getValue() == common.Util.TR('Transaction') ){
                        this.setValue('%') ;
                    }

                },
                blur: function() {
                    if ( this.getValue() == '%' ){
                        this.setValue(common.Util.TR('Transaction') ) ;
                    }
                }
            }
        }) ;



        this.client_ip = Ext.create('Exem.TextField',{
            fieldLabel: '',
            itemId    : 'client_ip',
            labelAlign: 'right',
            labelWidth: 100,
            width     : 260,
            allowBank : false,
            value     : common.Util.TR('Client IP') ,
            x         : 470,
            y         : 32,
            listeners: {
                focus: function () {
                    if (  this.getValue() == common.Util.TR('Client IP') ){
                        this.setValue('') ;
                    }

                },
                blur: function() {
                    if ( this.getValue() == '' ){
                        this.setValue(common.Util.TR('Client IP') ) ;
                    }
                }
            }
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
                        me.maxElapseField.setValue(common.Util.TR('infinite'));
                    });
                }
            }
        });

        this.conditionArea.add( [this.wasField, this.view_name, this.client_ip, this.minElapseField,elapseTideLabel,this.maxElapseField,infinityBtn ] ) ;
    }
    ,
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

    viewTransactionTrend: function(record) {
        var paView, mainTab, fromTime, toTime;

        fromTime = this.datePicker.getFromDateTime();
        toTime   = this.datePicker.getToDateTime();

        paView = Ext.create('view.ResponseInspector', {
            title      : common.Util.TR('Transaction Trend'),
            closable   : true,
            isAllWasRetrieve: false,
            detailScatterYRange: 'fixed',
            autoRetrieveRange: {
                timeRange: [
                    fromTime, toTime
                ],
                elapseRange: [0],
                tid        : record.tid
            },
            monitorType : 'WAS'
        });

        mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
        mainTab.add(paView);
        mainTab.setActiveTab(mainTab.items.length - 1);
        var loadingMask = Ext.create('Exem.LoadingMask', {
            target: paView,
            type  : 'large-whirlpool'
        });
        loadingMask.showMask();

        setTimeout(function() {
            loadingMask.hide();
            paView.loadingMask.hide() ;
            paView.init();

            loadingMask = null;
            paView  = null ;
            mainTab = null ;
        });
    }
}) ;