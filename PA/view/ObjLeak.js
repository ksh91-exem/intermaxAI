Ext.define('view.ObjLeak',{
    extend: 'Exem.FormOnCondition',
    width : '100%',
    heigth: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style : {
        background: '#cccccc'
    },
    sql   :{
        objleak_mem    : 'IMXPA_ObjLeak_Member.sql',
        objleak_mem_dt : 'IMXPA_ObjLeak_Member_Data.sql'
//        objleak_mem_txn: 'IMXPA_ObjLeak_TxnList.sql'
    } ,
    //first data draw flag
    flag_draw_grd  : null,
    //all or mem check
    flag_leck_check: null,
    cht_list : {},

    MAX_SIZE : 2147483647,
    mem_store : {} ,

    alert_popup: function( show_title, msg_str, err_type, comp ){
        var self = this ;
        Ext.Msg.show({
            title  : common.Util.TR(show_title),
            msg    : msg_str ,
            buttons: Ext.Msg.OK,
            icon   : err_type, //Ext.MessageBox.INFO,
            fn     : function(buttonId) {
                if (buttonId === 'ok') {
                    comp.focus();
                    self.executeSQL() ;
                }
            }
        });
        return true;
    } ,


    alert_popup_size: function( show_title, msg_str, err_type, comp ){

        Ext.Msg.show({
            title  : common.Util.TR(show_title),
            msg    : msg_str ,
            buttons: Ext.Msg.OK,
            icon   : err_type, //Ext.MessageBox.INFO,
            fn     : function(buttonId) {
                if (buttonId === 'ok') {
                    comp.focus();
                    comp.setValue( 0 ) ;
                }
            }
        });
        return true;
    } ,


    checkValid: function() {
        var self = this;
        var msg_str,
            cmp ;

        if (self.wasCombo.getValue() == null ) {
            msg_str = common.Util.TR( 'Please select WAS.' );
            cmp = self.wasCombo ;
//            self.alert_popup( 'ERROR!!!', msg_str, Ext.MessageBox.ERROR, cmp.WASDBCombobox ) ;
            //this.WASDBCombobox.select(this.WASDBCombobox.store.getAt(0));
            cmp.selectByIndex( 0 ) ;
            self.executeSQL() ;

            return false;
        } ;

        //입력값 밸리데이션은 keydown이벤트에서 따로 해주므로 여기선 필요없음(min)

        /*if ( self.tf_num.value > 5000 ){
         msg_str = '입력값을 초과하였습니다' ;
         cmp = self.tf_num ;
         self.alert_popup( 'ERROR!!!', msg_str, Ext.MessageBox.ERROR, cmp ) ;
         return false;
         }else */
         if ( self.tf_num.value == null ) {
            msg_str = common.Util.TR( 'Please enter the size.' ) ;//('Please enter the SIZE Value') ;
            cmp = self.tf_num ;
//            self.alert_popup( 'ERROR!!!', msg_str, Ext.MessageBox.ERROR, cmp ) ;
            cmp.setValue( 0 ) ;
            self.executeSQL() ;
            return false;
        }

        if ( self.tf_num.value < 0 ) {
            msg_str = common.Util.TR( 'Please enter a valid integer value.' ); //('Please enter an integer') ;
            cmp = self.tf_num ;
            self.alert_popup( common.Util.TR('ERROR'), msg_str, Ext.MessageBox.ERROR, cmp ) ;
            return false;
        }
        return true;
    },


    init: function(){
        var self = this ;

        //if ( self.isLoading ) {
        //    return ;
        //}

        self.flag_draw_grd = false ;
        self.flag_leck_check = false ;

        self.setWorkAreaLayout('fit') ;

        //main pnl
        self.pnl_main = Ext.create('Ext.panel.Panel', {
            layout: 'fit'
        });
        self.workArea.add( self.pnl_main ) ;

        //was
        self.wasCombo = Ext.create('Exem.wasDBComboBox',{
            x               : 350,
            y               : 5,
            width           : 300,
            labelWidth      : 60,
            comboWidth      : 260,
            comboLabelWidth : 60,
            selectType      : common.Util.TR('Agent'),
            itemId          : 'wasCombo',
            addSelectAllItem: true,
            multiSelect     : true
        });
        self.conditionArea.add(self.wasCombo);
        self.wasCombo.init();
        /*self.tf_was = Ext.create('Ext.form.field.Text',{
         itemId     : 'tf_was',
         name       : 'was',
         fieldLabel : 'WAS',
         x          : 380,
         y          : 5  ,
         labelWidth : 50,
         width      : 250
         }) ;*/


        //radio
        self.rdo_group  = Ext.create('Ext.form.RadioGroup', {
            itemId : 'rdo_group',
            x      : 650,
            columns: 1,
            items: [{
                width     : 60,
                boxLabel  : common.Util.TR('All'),
                name      : 'rg',//'filtertype',
                inputValue: 1,
                itemId    : 'rdo_all',
                checked   : true,
                listeners : {
                    scope   : this ,
                    /*beforerender: function( me, eOpts ){
                     var self = this ;
                     self.rdo_click( me.itemId ) ;
                     },*/
                    change: function( me,new_value){
                        var self = this ;
                        var check_state = new_value ;
                        if ( check_state )
                            self.rdo_click( me.itemId ) ;
                    }
                }
            },{
                boxLabel  : common.Util.TR('Memory Leak - Object'),
                name      : 'rg',//'filtertype',
                inputValue: 2,
                itemId    : 'rdo_mem',
                listeners: {
                    scope   : this ,
                    change: function(me,new_value){
                        var self = this ;
                        var check_state = new_value ;
                        if ( check_state )
                            self.rdo_click( me ) ;
                    }
                }
            }]
        });
        self.conditionArea.add( self.rdo_group ) ;

        //number
        self.tf_num =  Ext.create('Ext.form.field.Number', {
            imteId         : 'tf_num' ,
            width          : 250,
            x              : 810,
            y              : 5,
            maxValue       : self.MAX_SIZE,
            fieldLabel     : common.Util.TR('Memory Size (KB) >='),
            labelAlign     : 'right',
            labelSeparator : '',
            labelWidth     : 150,
            allowBlank     : false,
            maxLength      : 10,
            enableKeyEvents: true,
            value          : 0,//5000,
            listeners      :{
                keydown: function(){
                    if ( this.value > self.MAX_SIZE ){
                        var msg_str =  common.Util.TR('Input value is out of range.') ; // + (allowed range: 0~2147483647)' ;
                        var cmp = this ;
                        self.alert_popup_size( common.Util.TR('ERROR'), msg_str, Ext.MessageBox.ERROR, cmp ) ;
                    }
                }
            }
        });
        self.conditionArea.add( self.tf_num ) ;


        //chart grid
        function createCellChart(value, meta, record, r, c, store, view) {

            if (self.mem_store[record.data.var_id1].length > 0) {
                setTimeout(function() {
                    var row = view.getNode(record);

                    if (row) {
                        //var el = Ext.fly(Ext.fly(row).query('.x-grid-cell')[c]).down('div');
                        var el = Ext.get(row).dom.getElementsByClassName('x-grid-cell-last')[0].children;
                        if ( Ext.get(el[0]).dom.children.length > 0 ) {
                            return ;
                        }
                    } else {
                        return;
                    }

                    var chart = Ext.create('Exem.chart.CanvasChartLayer', {
                        layout        : 'fit',
                        width         : '100%',
                        interval      : PlotChart.time.exMin,
                        height        : 70,
                        showLegend    : false,
                        showTooltip   : true,
                        toolTipFormat : '%x [value:%y] ',
                        firstShowXaxis: true,
                        firstShowYaxis: true,
                        chartProperty: {
                            yLabelWidth: 10,
                            xLabelFont: {size: 8, color: 'black'},
                            yLabelFont: {size: 8, color: 'black'}
                        }
                    });
                    chart.addSeries({
                        id: 'txn_usage',
                        type: PlotChart.type.exLine,
                        label: 'txn'
                    });
                    self.cht_list[ record.data.var_id1 ] = [] ;
                    self.cht_list[ record.data.var_id1 ].push( chart ) ;

                    var x_val, y_val;
                    for ( var ix = 0; ix < self.mem_store[record.data.var_id1].length; ix++ ){
                        x_val = self.mem_store[record.data.var_id1][ix][0] ;//parseInt(new Date( self.mem_store[record.data.var_id1][ix][0]  ).getTime() ),
                        y_val = self.mem_store[record.data.var_id1][ix][1] ;
                        chart.addValue( 0, [x_val, y_val] );
                    };

                    /*chart.addValues({
                     from: self.datePicker.getFromDateTime(),
                     to  : self.datePicker.getToDateTime(),
                     interval: 60000,
                     time: 0,
                     data: self.mem_store[record.data.var_id1],
                     series: { txn_usage: 4 }
                     });*/

                    chart.render(el);

                    self.grd_objleak.pnlExGrid.on('columnresize', function(){
                        chart._chartContainer.setWidth(1);
                    });
                }, 30);

            }

            //차트의 가장 마지막ID를 모두 그린후 all로 체크를 변경함으로써 radio change이벤트를 타게한다.
            setTimeout( function(){
                //last id이고, 처음으로 그려질때에만(false) 태운다.
//                if ( ( record.data.var_id1 == self.last_var_id ) && ( !self.flag_draw_grd ) )
//                self.rdo_group.items.items[0].setValue( true )
                if ( !self.flag_leck_check ) {
                    self.flag_leck_check = true ;
                    self.rdo_click( self.rdo_group.items.items[0].itemId ) ;
                }
            }, 300 );
        } ; //end fun


        self.grd_objleak = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            itemId: 'grd_objleak'
            //adjustGrid: true

            /*itemdblclick: function(dv, record, item, index, e) {
             console.log('dv ==> ', dv);
             console.log('record ==> ', record);
             console.log('item ==> ', item);
             console.log('e ==> ', e);
             }*/
        });
        self.pnl_main.add( self.grd_objleak ) ;


        self.grd_objleak.beginAddColumns();
        self.grd_objleak.addColumn('Var id1'                             , 'var_id1'     , 200,  Grid.String  , false, true );  // Hide
        self.grd_objleak.addColumn(common.Util.CTR('Member Variable')    , 'name'        , 300,  Grid.String  , true , false);
        self.grd_objleak.addColumn('Static Field'                        , 'static_flag' , 50 ,  Grid.String  , false, true );  // Hide
        self.grd_objleak.addColumn(common.Util.CTR('Transaction Name')   , 'txn_name'    , 300,  Grid.String  , true , false);
        self.grd_objleak.addColumn(common.Util.CTR('First Time')         , 'first_time'  , 140,  Grid.String  , true , false);
        self.grd_objleak.addColumn(common.Util.CTR('First Size')         , 'first_size'  , 80,   Grid.Number  , true , false);
        self.grd_objleak.addColumn(common.Util.CTR('Last Time')          , 'last_time'   , 140,  Grid.String  , true , false);
        self.grd_objleak.addColumn(common.Util.CTR('Last Size')          , 'last_size'   , 100 , Grid.Number  , true , false);
        self.grd_objleak.addColumn('txn id'                              , 'txn_id'      , 150,  Grid.String  , false, true );  // Hide
        self.grd_objleak.addColumn(common.Util.CTR('Gap Size')           , 'gap_size'    , 100 , Grid.Number  , true , false);
        self.grd_objleak.addColumn(common.Util.CTR('Leak')               , 'leak'        , 60 ,  Grid.Number  , true , false);
        self.grd_objleak.addColumn(common.Util.CTR('Transaction Memory Usage (KB)'), 'var_mem_size', 400, Grid.String, true, false);
        self.grd_objleak.endAddColumns() ;
        self.grd_objleak.addRenderer('var_mem_size', createCellChart) ;

        self.grd_objleak.contextMenu.addItem({
            title : common.Util.TR('Memory Leak - Transaction'),
            itemId: 'txn_leak_suspeak',
            fn: function() {
                var txn_leak_suspeak = common.OpenView.open('TransactionLeakSuspect', {
                    isWindow : false,
                    width    : 1200,
                    height   : 800,
                    fromTime : self.datePicker.getFromDateTime() ,//record['TIME'],
                    toTime   : self.datePicker.getToDateTime(),   //common.Util.getDate( Number(new Date(record['TIME']))+600000 ), // 10분 더하기
                    number_field: self.tf_num.value,
                    wasId    : self.wasCombo.getValue() //self.wasCombo.getValue()
                });

                setTimeout(function(){
                    txn_leak_suspeak.retrieve();
                }, 300);
            }

        }, 0);
    } ,


    rdo_click: function( rdo_itemId ) {
        var self = this ;
        if ( !self.flag_leck_check ) {
            return ;
        }
        var ix, jx;
        var cht;
        var grd;
        var y_max_val, x_cnt, limit_idx;

        if ( rdo_itemId === 'rdo_all' ) {
            if ( self.grd_objleak.gridStore.data.items.length > 0 )
                self.flag_draw_grd = true ;

            //첫번째 조건 -> MAX값이 마지막20%안에 존재하고 나머지 80%안에 존재하지 않는지를 확인.
            for (ix = 0; ix < self.grd_objleak.gridStore.data.items.length; ix++ ) {
                grd = self.grd_objleak.gridStore.data.items[ix] ;
                grd.raw.leak = 0 ;

                if ( self.var_id[ix] == grd.raw.var_id1 ) {
                    cht = self.cht_list[self.var_id[ix]];

                    y_max_val = cht[0].maxOffSet.y ;
                    x_cnt     = cht[0].plot.getData()[0].data.length ;
                    limit_idx = Math.round( x_cnt * 8 / 10 ) ;
                }
                for (jx = x_cnt-1; jx > 0; --jx  ) {
                    if ( y_max_val == cht[0].serieseList[0].data[jx][1] ) {
                        if ( jx < limit_idx ) {
                            grd.raw.leak = 0 ;
                        } else if ( jx >= limit_idx ) {
                            grd.raw.leak = 1 ;
                        }
                    }  // end if
                } //end x_cnt
            } // end grd for
//                self.grd_objleak.drawGrid() ;

            //두번째 조건 -> 처음 20%MAX값과 마지막20%MAX값 차이가 10%이상 되는것만 찾는다.
            var y_min_var;
            for ( ix = 0; ix < self.grd_objleak.gridStore.data.items.length; ix++ ){
                grd = self.grd_objleak.gridStore.data.items[ix] ;

                if ( grd.raw.leak == 1 ){
                    for (jx = 0 ; jx < self.cht_list[self.var_id[jx]]; jx++ ) {
                        if ( self.var_id[ix] == grd.raw.var_id1 ) {
                            cht = self.cht_list[self.var_id[ix]] ;
                            break ;
                        }
                    } //

                    //10%에 최저가 있는경우!
                    y_min_var = 0;
                    x_cnt     = cht[0].plot.getData()[0].data.length ;
                    grd       = self.grd_objleak.gridStore.data.items[ix] ;
                    grd.raw.leak = 0 ;

                    for (jx = 0; jx < x_cnt ; jx++ ){
                        if ( y_min_var == cht[0].serieseList[0].data[jx][1] ) {
                            grd.raw.leak = 1 ;
                        }
                    }
                }
            } // end for
            self.grd_objleak.drawGrid() ;
        } else { //rdo_mem
//                self.flag_leck_check = true ;
            self.grd_objleak.pnlExGrid.getStore().filterBy(function(record) {
                return (record.data.leak == 1)? false : true;
                /*
                //if(record.data.leak == 1){
                //    return false; //visible = true
                //} else {
                //    return true; //visible = false
                //}
                */
            });
            /*for ( var ix = 0; ix < self.grd_objleak.gridStore.data.items.length; ix++ ){
             var grd = self.grd_objleak.gridStore.data.items[ix] ;
             if ( grd.raw.leak == 0){

             }
             //                    grd.raw.leak = 1 ;
             }*/
//                self.grd_objleak.drawGrid() ;
        }
    }, //end rdo_click


    executeSQL: function(){
        var self = this ;

        self.grd_objleak.clearRows() ;
        self.loadingMask.show();

        var dt_mem = {} ;
        dt_mem.sql_file = self.sql.objleak_mem ;
        dt_mem.bind = [{
            name : 'from_time',
            type : SQLBindType.STRING,
            value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00'
        },{
            name : 'to_time',
            type : SQLBindType.STRING,
            value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59'
        },{
            name : 'mem_size',
            type : SQLBindType.FLOAT,
            value: self.tf_num.value
        }] ;
        dt_mem.replace_string = [{
            name : 'was_id',
            value: self.wasCombo.getValue() //self.was_list//self.tf_was.getRawValue()
        }] ;
        WS.SQLExec( dt_mem, self.onMEMData, self ) ;

    }, //end execute sql


    onMEMData: function( h, dt ){
        var self = this ;

        var ix, ixLen;

        var static_field,
            x_val,
            var_id,
            first_time,
            last_time,
            cut_first_date,
            cut_last_date,
            cut_first_time,
            cut_last_time;

        var y_time, m_time, d_time;

        switch( h.command ){
            case self.sql.objleak_mem :
                self.var_id = [] ;
                self.mem_store = {};

                for (ix = 0, ixLen = dt.rows.length; ix < ixLen; ix++ ){
                    static_field = dt.rows[ix][2],
                    var_id       = dt.rows[ix][0],
                    first_time   = dt.rows[ix][4],
                    last_time    = dt.rows[ix][6];

                    self.var_id.push( var_id ) ;
                    //store에 담을 배열을 var_id별로 생성
                    self.mem_store[ var_id ] = [] ;

                    //데이터 조작
                    if ( static_field == 1 )
                        static_field = 'static' ;

                    //20140303 -> 2014-03-03 으로변경해서 넣기.

                    y_time = first_time.substring( 0, 4 ) ;
                    m_time = first_time.substring( 4, 6 ) ;
                    d_time = first_time.substring( 6, 8 ) ;
                    cut_first_date = y_time + '-' + m_time + '-' + d_time ;

                    y_time = last_time.substring( 0, 4 ) ;
                    m_time = last_time.substring( 4, 6 ) ;
                    d_time = last_time.substring( 6, 8 ) ;
                    cut_last_date = y_time + '-' + m_time + '-' + d_time ;

                    cut_first_time = first_time.substring( 9, 17 );
                    cut_last_time  = last_time.substring( 9, 17 );

                    first_time = cut_first_date + ' ' + cut_first_time ;
                    last_time  = cut_last_date + ' ' + cut_last_time ;

                    dt.rows[ix][ 2] = static_field ;
                    dt.rows[ix][ 4] = first_time ;
                    dt.rows[ix][ 6] = last_time ;
                    dt.rows[ix][10] = 0 ;

                    self.grd_dt = {header: common.Util.deepObjCopy(h), data: common.Util.deepObjCopy(dt)};
                }

                //차트 데이터 호출
                if ( dt.rows.length > 0 ){
                    self.get_mem_chart() ;
                } else {
                    self.rdo_group.items.items[0].setValue( true ) ;
                    self.loadingMask.hide();
                }
                break ;

            case self.sql.objleak_mem_dt :
                for (ix = 0, ixLen = dt.rows.length; ix < ixLen; ix++ ){
                    var_id = dt.rows[ix][3] ;
                    x_val  = parseInt(new Date( dt.rows[ix][0] ).getTime() );
                    self.mem_store[ var_id ].push( [ x_val, dt.rows[ix][4] ]);
                }
                self.last_var_id = var_id;

                //Grid Data Insert..
                self.grd_objleak.onData( self.grd_dt.header, self.grd_dt.data ) ;
                self.grd_objleak.PagerVisible( false ) ;

                self.loadingMask.hide();
                break ;
            default : break ;
        }
    } ,


    get_mem_chart: function(){
        var self = this ;

        var dt_mem_cht = {} ;
        dt_mem_cht.sql_file = self.sql.objleak_mem_dt ;
        dt_mem_cht.bind = [{
            name : 'from_time',
            type : SQLBindType.STRING,
            value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00'
        },{
            name : 'to_time',
            type : SQLBindType.STRING,
            value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59'
        }] ;
        dt_mem_cht.replace_string = [{
            name : 'was_id',
            value: self.wasCombo.getValue() //self.tf_was.getRawValue() //self.was_list
        },{
            name : 'var_id1',
            value: self.var_id.toString()
        }] ;
        WS.SQLExec( dt_mem_cht, self.onMEMData, self ) ;
    }

});