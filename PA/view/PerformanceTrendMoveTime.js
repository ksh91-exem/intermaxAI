/*
 *
 * 1403.31 min -> 1405.08 go intermax!
 * time slice기능 X
 *
 * */
Ext.define('view.PerformanceTrendMoveTime', {
    extend   : 'Exem.XMWindow',
    title    : common.Util.TR(''),
    layout   : 'fit',
    width    : 450 ,
    height   : 280,
    modal    : true,
    resizable: false,
    bodyStyle: {
        background: 'white'
    },
    cls   : 'Exem-Form-workArea' ,

//    frm_type: null ,
    parent  : null ,
    was_name: null ,
    db_name : null ,
    db_id   : null ,
    log_date: null ,

    isTpMode: false,

    jump_time: {
        start: null,
        end  : null
    } ,

    detail_data: {
        sid       : null,
        session_id: null,
        serial_no : null
    },

    init: function(curr_time) {
        var self = this;

        self.layout_format();
        self.show();

        var input_time = self.bot_pnl.getComponent('tf_input_time');
        input_time.setValue(curr_time);
        input_time.focus();
    },
    //-------------------------------------------------------------------------------------------
    call_move_time: function() {
        var self = this;

        //유효성검사
        //1. 현재차트의 From보다 앞으로, To보다 뒤로 입력될때.
        var inputText = self.bot_pnl.getComponent('tf_input_time') ,
            clickTime = self.isTpMode ? self.parent.indicatorTime : self.parent.click_time,
            inputTime = common.Util.getDateFormat(clickTime) + ' ' + inputText.value + ':00',
            fromTime = new Date( self.parent.datePicker.getFromDateTime() ) ,
            toTime = new Date( self.parent.datePicker.getToDateTime()),
            changeTime = new Date(inputTime);

        if (+changeTime < +fromTime || +changeTime > +toTime || inputText.value.indexOf('_') !== -1) {
            Ext.Msg.show({
                title  : common.Util.TR('ERROR'),
                msg    : common.Util.TR('Time value is incorrect.'),
                buttons: Ext.Msg.OK,
                icon   : Ext.MessageBox.ERROR,
                fn     : function(buttonId) {
                    if (buttonId === 'ok') {
                        inputText.focus();
                    }
                }
            }); // msg
            return;
        } //end validation

        if(self.isTpMode) {
            self.parent.setIndicatorTime(inputTime);
            self.parent.moveIndicator();
        }
        else {
            //Performance Trend Time Setting..
            self.parent.click_time = inputTime ;
            self.parent.lbl_time.setText( inputTime ) ;
            self.parent.move_pos = { x: +changeTime, y: null } ;
            self.parent.move_line( self.parent.move_pos ) ;

            //active
            if ( !self.parent.bot_pnl.collapsed ){
                switch( self.parent.bot_pnl.activeTab.itemId ){
                    case 'pnl_active':
                        self.parent.get_active_sec( inputTime ) ;
                        break ;

                    case 'pnl_process':
                        self.parent.get_process( inputTime ) ;
                        break ;


                    case 'pnl_active_sum':
                        self.parent.get_active_sum( inputTime ) ;
                        break ;

                    default:
                        break;
                }
            }

            //lock
            if ( self.parent.mid_pnl.getActiveTab().itemId == 'pnl_locktree' ){
                self.parent.get_lock_sec( inputTime ) ;
            }
        }

        self.close() ;
    },


    //-------------------------------------------------------------------------------------------
    layout_format: function(){
        var self = this ;

        self.main_pnl = Ext.create( 'Exem.Container',{
            itemId: 'pnl',
            layout: {
                type :'vbox',
                align: 'center',
                pack : 'center'
            } ,
            padding: '5 5 5 5',
            width : '100%',
            flex  : 1,
            baseCls: 'x-box-blue',
            bodyStyle: { background: 'white' }
        }) ;
        self.add( self.main_pnl ) ;





        var okBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('OK'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        self.call_move_time() ;
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

        self.setWidth( 250 ) ;

        self.setTitle( common.Util.TR( 'Time Input' ) ) ;
        self.top_pnl = Ext.create( 'Exem.Panel',{
            itemId: 'pnl',
            layout: {
                type :'vbox',
                align: 'center',
                pack : 'center'
            } ,
            padding: '7 10 7 7',
            width : '100%',
            height: 130 ,
            baseCls: 'x-box-blue',
            bodyStyle: {
                background: 'white',
                border    : '1px solid #c6c7c8'
            },
            items: [{
                xtype: 'textfield',
                itemId: 'tf_was_name',
                fieldLabel: common.Util.TR('Agent'),
                readOnly  : true ,
                allowBlank: false ,
                enableKeyEvents: true,
                width     : 200,
                labelWidth: 90,
                labelAlign: 'right'
            },
            {
                xtype: 'textfield',
                itemId: 'tf_instance_name',
                fieldLabel: common.Util.TR('Instance Name'),
                readOnly  : true ,
                allowBlank: false ,
                enableKeyEvents: true,
                width     : 200,
                labelWidth: 90,
                labelAlign: 'right'
            },{
                xtype: 'textfield',
                itemId: 'tf_log_date',
                fieldLabel: common.Util.TR( 'Log Date' ),
                readOnly  : true ,
                allowBlank: false ,
                enableKeyEvents: true,
                width     : 200,
                labelWidth: 90,
                labelAlign: 'right'
//                        plugins: [new Ext.ux.InputTextMask('99:99')]
            }]
        }) ;
        self.bot_pnl = Ext.create( 'Ext.panel.Panel', {
            itemId: 'bot_pnl',
            layout: {
                type :'vbox',
                align: 'middle',
                pack : 'center'
            } ,
            padding: '7 7 7 7',
            width : '100%',
            flex  : 2 ,
            baseCls: 'x-box-blue',
            bodyStyle: {
                background: 'white',
                border    : '1px solid #c6c7c8'
            },
            items: [{
                xtype     : 'textfield',
                itemId    : 'tf_input_time',
                fieldLabel: '(HH:MM)',
                allowBlank: false ,
                enableKeyEvents: true,
                width     : 180,
                labelWidth: 90,
                labelAlign: 'right',
                plugins: [new Ext.ux.InputTextMask('99:99')],
                listeners:{
                    scope: this,
                    keydown: function(tf, e) {
                        var self = this ;
                        if (e.keyCode == 13 ){
                            setTimeout(function(){
                                self.call_move_time() ;
                            }, 500);

                        }
                    }
                }
            }]
        } ) ;
        self.main_pnl.add( self.top_pnl ) ;
        self.main_pnl.add( self.bot_pnl ) ;

        if(self.isTpMode){
            self.top_pnl.getComponent('tf_instance_name').setVisible(false);
        } else{
            self.top_pnl.getComponent('tf_instance_name').setVisible(true);
            self.top_pnl.getComponent('tf_instance_name').setValue( self.db_name ) ;
        }

        self.top_pnl.getComponent('tf_was_name').setValue( self.was_name ) ;
        self.top_pnl.getComponent('tf_log_date').setValue(  Ext.util.Format.date(self.log_date, Comm.dateFormat.NONE)) ;

        self.main_pnl.add( bottomArea ) ;
    }
}) ;
