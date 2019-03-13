//min
//1408.12 꽤오래되었지만 time_slice type은 쓰지않음. 줌기능이 따로있으므로.
//로직삭제는 하지않음.

Ext.define('view.DBTrend_MoveTime', {
    extend     : 'Exem.XMWindow',
    title      : common.Util.TR('DB Trend'),
    layout     : 'fit',
    width      : 300 ,
    height     : 130,
    modal      : true,
    resizable  : false,
    maximizable: false,
    cls        : 'Exem-Form-workArea',

    init: function(){
        var self = this ;

        self.parent_lbl_time ; //dbtrend의 현재 레이블 타임.
        self.start_time ; //time slice의 fromtime
        self.end_time ;   //time slice의 totime
        self.db_id ;
        self.me ; //DB Trend
        self.call_type ; //호출되는 폼방식 = time_slice, move_time 2가지.
        self.sess_list ; //세션디테일로 넘길때 필요한 변수담겨있는 리스트.
//        self.session_form; //session_detail 화면

        self.pnl_main = Ext.create('Exem.FormPanel',{
            layout: 'vbox',
            itemId: 'pnl_main'
        }) ;
        self.add( self.pnl_main ) ;
        var LABEL_FORMAT = '';
        switch(nation) {
            case 'ko' :
                LABEL_FORMAT = 'YYYY-MM-DD HH:MM ';
                break;
            case 'zh-CN':
            case 'ja' :
                LABEL_FORMAT = 'YYYY/MM/DD HH:MM ';
                break;
            case 'en' :
                LABEL_FORMAT = 'MM/DD/YYYY HH:MM ';
                break;
            default:
                break;
        }

        if ( self.call_type == 'move_time' )          //parent,       lbl_id,  textfield_id,  label_text
            self.pnl_move_time = self.create_pnl_type( self.pnl_main, 'move', 'move_field', LABEL_FORMAT ) ;
        else
            self.pnl_time_slice = self.create_pnl_type( self.pnl_main, 'slice', 'start_field', 'TimeSlice ' ) ;

        var pnl_bot = Ext.create('Ext.container.Container', {
            itemId: 'pnl_bot',
            region: 'south',
            width : '100%',
            layout: {
                type: 'vbox',
                align:'middle', //좌우
                pack: 'center'  //상하
            }
        }) ; //end pnl_bot
        self.pnl_main.add( pnl_bot ) ;


        var okBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('OK'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        if ( self.call_type == 'move_time' ){
                            self.call_move_time() ;
                        }else{ //time slice
                            self.call_time_slice() ;
                        }
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
                        self.close();
                    });
                }
            }
        });

        var bottomArea = Ext.create('Exem.Container', {
            width : '100%',
            margin: '10 0 0 0',
            height: 25,
            layout: {
                type : 'hbox',
                align: 'middle',
                pack: 'center'
            },
            style : 'background: #ffffff',
            items : [ okBtn,{ xtype:'tbspacer', width: 3 }, cancelBtn ]
        });

        pnl_bot.add( bottomArea ) ;


        if ( self.call_type == 'move_time' ){
            var move = self.pnl_move_time.getComponent('move_field') ;
            move.setValue( self.parent_lbl_time ) ;
        }
        else {
            var start_slice = self.pnl_time_slice.getComponent('start_field') ,
                end_slice = self.pnl_time_slice.getComponent('end_field') ;
            start_slice.setValue( self.start_time ) ;
            end_slice.setValue( self.end_time ) ;
        }

        self.show() ;
    },

    call_move_time: function(){
        var self = this,
            time_field = self.pnl_move_time.getComponent('move_field'),
            inputTime = new Date(time_field.value),
            fromTime = new Date(self.me.datePicker.getFromDateTime()),
            toTime = new Date(self.me.datePicker.getToDateTime());

        //2. 현재차트의 From보다 앞으로, To보다 뒤로 입력될때.
        if ( ( +inputTime < +fromTime ) || ( +inputTime >= +toTime )  ){
            Ext.Msg.show({
                title  : common.Util.TR('ERROR'),
                msg    : common.Util.TR( 'Time value is incorrect.' ),//('Incorrect Time input Value'),
                buttons: Ext.Msg.OK,
                icon   : Ext.MessageBox.ERROR,
                fn     : function(buttonId) {
                    if (buttonId === "ok") {
                        self.pnl_move_time.getComponent('move_field').focus();
                    }
                }
            }); // msg
            time_field.setValue( self.me.lbl_time.text.substring(0, 16) ) ;
            return ;
        }

        //active session call
        self.me.lbl_time.setText( common.Util.getDate(inputTime) ) ;
        self.me.move_pos  = { x : +inputTime, y : null } ;
        self.me.click_time = self.me.move_line( self.me.move_pos ) ;

        //click시 재쿼리 날리는 화면의 변수들 초기화.
        self.me.flag_list.flag_val        = false ;
        self.me.flag_list.flag_locktree   = false ;
        self.me.flag_list.flag_lockinfo   = false ;
        self.me.flag_list.flag_active     = false ;

        if (!self.me.tab_bot_pnl.collapsed ){
            self.me.get_active_sec( self.me.click_time ) ;
        }

        self.close() ;
    },


    call_time_slice: function(){
        var self = this ;

        //time convert
        var start_field = self.pnl_time_slice.getComponent('start_field') ,
            end_field = self.pnl_time_slice.getComponent('end_field') ;
        var s_time = start_field.getValue() + ':00',
            e_time = end_field.getValue() + ':00' ;

        //유효성검사
        var isOk = self.validation_time( start_field, end_field ) ;
        if ( !isOk ) {
            return ;
        }

        //세션디테일의 호출
        if ( self.sess_list.length > 0 ){
            var sess_form = Ext.create('view.DBTrend_SessionDetail') ;
            sess_form.type = 'PA' ;
            //필요한 정보 : db_id, from_time, to_time, logon_time, sid, serial
            sess_form.necessary_dt['db_id'     ] = self.sess_list[0] ;
            sess_form.necessary_dt['from_time' ] = common.Util.getDate(s_time); //start_field
            sess_form.necessary_dt['to_time'   ] = common.Util.getDate(e_time); //end_field

            sess_form.necessary_dt['logon_time'] = self.sess_list[3] ;
            sess_form.necessary_dt['sid'       ] = self.sess_list[4] ;
            sess_form.necessary_dt['serial'    ] = self.sess_list[5] ;
            sess_form.db_name                    = self.sess_list[6] ;
            sess_form.init();
            sess_form.show() ;
            sess_form.loadingMask.show();
        }
        /**else{  //걍 move_time
            var db_trend = common.OpenView.open('DBTrend', {
                isWindow : false,
                width    : 1200,
                height   : 800,
                fromTime : s_time,//self.start_time,
                toTime   : e_time,//self.end_time,
                db_id    : self.db_id
            });
            setTimeout(function(){ db_trend.executeSQL(); }, 100);
            setTimeout(function(){
                db_trend.top_tab_change( self.me.tab_top_pnl.getComponent('pnl_cpu') ) ;
            }, 1000);
        }**/
        self.close() ;
    } ,

    validation_time: function( s_field, e_field ){
        var self = this ;
        var result = null,
            cmp, reset_time;

        result = true ;

        //유효성 검사
        //1.from, to값을 제대로 입력하지 않으면 오류인 텍스트필드로 포커스.
        var validation = false;
        if ( ( s_field.getValue() == '' ) || ( s_field.getValue().indexOf('_') > 0 ) ){
            cmp = s_field ;
            reset_time = self.start_time ;
            validation = true ;
        }else if ( ( e_field.getValue() == '' ) || ( e_field.getValue().indexOf('_') > 0 ) ){
            cmp = e_field ;
            reset_time = self.end_time ;
            validation = true ;
        }
        if ( validation ){
            Ext.Msg.show({
                title  : common.Util.TR('ERROR'),
                msg    : common.Util.TR('Time value is incorrect.'),//('Incorrect Time input Value'),
                buttons: Ext.Msg.OK,
                icon   : Ext.MessageBox.ERROR,
                fn     : function(buttonId) {
                    if (buttonId === "ok") {
                        cmp.setValue( reset_time ) ;
                        cmp.focus();
                    }
                }
            }); // msg
            result = false ;
            return ;
        }



        //2.from이 to보다 큰경우 시간 제정렬후 엔드텍스트필드로 포커스.
        var s_time = s_field.getValue() + ':00',
            e_time = e_field.getValue() + ':00' ;
        if ( s_time >=  e_time ){
            Ext.Msg.show({
                title  : common.Util.TR('ERROR'),
                msg    : common.Util.TR('Time value is incorrect.'),//('Incorrect Time input Value'),
                buttons: Ext.Msg.OK,
                icon   : Ext.MessageBox.ERROR,
                fn     : function(buttonId) {
                    if (buttonId === "ok") {
                        e_field.focus();
                    }
                }
            }); // msg
            s_field.setValue( self.start_time ) ;
            e_field.setValue( self.end_time ) ;
            return false ;
        }

        return result ;
    } ,


    create_pnl_type: function( parent, lbl_id, text_id, lbl_text ){
        var self = this ;
        var result = null ;

        var container = Ext.create('Ext.container.Container', {
            itemId: 'container',
            padding: '5 5 5 5',
            layout: 'fit',
            width : '100%',
            flex  : 1
        }) ;

        var maskType = '';
        switch(nation) {
            case 'ko' :
                maskType  =  '9999-99-99 99:99:99';
                break;
            case 'zh-CN':
            case 'ja' :
                maskType  =  '9999/99/99 99:99:99';

                break;
            case 'en' :
                maskType  =  '99/99/9999 99:99:99';
                break;

            default :
                maskType  =  '99/99/9999 99:99:99';
                break ;
        }

        var lbl_width ;
        if ( lbl_id == 'slice' ) {
            lbl_width = 90;
        }
        else lbl_width = 155 ;

        var pnl = Ext.create( 'Exem.Panel',{
            itemId: 'pnl',
            layout: {
                type :'hbox',
                align: 'middle',
                pack : 'center'
            } ,
            width : '100%',
            height: 80 ,
            items : [{
                xtype : 'label',
                itemId: lbl_id ,
                text : lbl_text,
                width: lbl_width,
                //flex : 1,
                padding: '2 5 0 5'
            },{
                xtype: 'textfield',
                itemId: text_id,
                fieldLabel: '',
                allowBlank: false ,
                enableKeyEvents: true,
                width  : 110,
                flex   : 1,
                plugins: [new Ext.ux.InputTextMask(maskType)]
            }]
        } ) ;


        if ( lbl_id == 'slice' ){
            var lbl = Ext.create('Ext.form.Label',{
                itemId: 'slice_lbl',
                text  : '~'
            }) ;
            pnl.add( lbl ) ;

            var text = Ext.create('Ext.form.field.Text', {
                itemId    : 'end_field',
                width     : 110,
                allowBlank: false,
                enableKeyEvents: true,
//                readOnly  : true,
                plugins: [new Ext.ux.InputTextMask(maskType)],
                listeners:{
                    scope: this,
                    keydown: function(tf, e) {
                        var self = this ;
                        if (e.keyCode == 13 ){
                            self.call_time_slice() ;
                        }
                    }
                }
            });
            pnl.add( text ) ;

            self.width = 350 ;
        } //end if

        parent.add( container ) ;
        container.add( pnl ) ;


        //이벤트 걸어주기.엔터치면 콜타입에따라 액션이 달라지므로.
        var con = container.getComponent('pnl') ;
        if ( text_id == 'move_field' ){
            con.getComponent(text_id).addListener('keydown', function(tf, e){
                if ( e.keyCode == 13 ){
                    self.call_move_time();
                }
            }) ;
        }else{
            con.getComponent(text_id).addListener('keydown', function(tf, e){
                if ( e.keyCode == 13 ){
                    con.getComponent('end_field').focus() ;
                    self.call_time_slice() ;
                }
            }) ;
        }
        result = pnl ;
        return result ;
    }


})  ;
