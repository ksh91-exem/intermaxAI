/**
 * Created by JONGHO on 14. 9. 2.
 */
Ext.define('Exem.TimePicker',{
    extend: 'Ext.container.Container',
    width : 300,
    height: 50,
    layout: 'fit',
    timeGap: (1000*60) * 10,
    UILayout: 'hbox',
    fromWidth: 140,
    toWidth  : 140,
    showRetrieveBtn : true,
    minSelect: 'fixed0to59',        // 0분 59분만 선택되도록 고정   <=> 'fixed10min' 10분 단위로만 사용
    showClearButton: false,
    executeScope: null,
    fromTabIndex: null,
    useSingleTime: false,
    useOnlyHour: false,             // true -> 시간만사용 false 모두사용
    useFixedMinute: false,

    constructor: function(config) {
        //this.callParent(config)
        this.callParent(arguments);
        this.initEnvir();
        this.init();
        this.setTime();
    },

    initEnvir: function() {
        this.part = { FROM : 1, TO : 2 };
        this.selected = { fromHour: null, fromMinute: null, toHour: null, toMinute: null };
        this.fromHours   = [];                  // from - 시간영역 block 보관 순서는 index
        this.fromMinutes = [];                  //      - 분영역, 해당 index의 minute에 분 정보 들어있음.
        this.toHours     = [];
        this.toMinutes   = [];

        this.textMask       ='99:99';
        this.textFieldWidth = 44;
        this.regExptest     =  /(2[0-3]|[0-1]\d)(:[0-5]\d){1,2}/;
        this.textFiledMaxLength = 5;
        if (this.useOnlyHour) {
            this.textMask   = '99';
            this.textFieldWidth = 22;
            this.textFiledMaxLength = 2;
            this.regExptest     =  /(2[0-3]|[0-1]\d)/;
        } else if (this.useFixedMinute){
            this.useOnlyHour = true;
            this.textMask   = '99';
            // this.textFieldWidth = 22;
            this.textFiledMaxLength = 2;
            this.regExptest     =  /(2[0-3]|[0-1]\d)/;

            this.addCls('time-window-fixed-minute');
        }
    },

    init: function() {

        this.timePicker = this.createTimePicker();

        var timeBg  = Ext.create('Ext.container.Container',{
            width : '100%',
            height: '100%',
            layout : this.UILayout
        });
        this.add(timeBg);


        this.fromTimeBg = Ext.create('Ext.container.Container',{
            width : this.fromWidth,
            layout: 'hbox',
            cls   : 'time-window-from'
        });


        this.separ = Ext.create('Ext.container.Container',{
            margin : '0 2 0 2',
            html : ' ~ ',
            style: {
                'line-height': '22px'
            }
        });

        this.toTimeBg = Ext.create('Ext.container.Container',{
            width : this.toWidth,
            layout: 'hbox',
            cls   : 'time-window-to'
        });

        timeBg.add(this.fromTimeBg,this.separ,this.toTimeBg);

        if(this.showClearButton){
            this.clearButton = Ext.create('Ext.container.Container',{
                layout : 'fit',
                html   : common.Util.TR('Clear'),
                height : 21,
                width  : 40,
                style  : {
                    lineHeight: '21px'
                },
                cls    : 'button3d',
                listeners: {
                    scope: this,
                    render: function(me){
                        me.el.on('click', function(){
                            if (this.useOnlyHour) {
                                this.fromTimeField.setValue('00');
                                this.toTimeField.setValue('00');
                            }else{
                                this.fromTimeField.setValue('00:00');
                                this.toTimeField.setValue('00:00');
                            }

                            this.fromTimeField.focus();
                        }.bind(this));
                    }
                }
            });
            timeBg.add(this.clearButton);
        }

        this.fromLabel = Ext.create('Ext.form.Label',{
            text: 'From Time',
            height: 22,
            margin: '0 5 0 5',
            style: {
                'line-height': '22px',
                'font-size' : '14px',
                'color' : '#787878'
            }
        });

        this.fromTimeBg.add(this.fromLabel);

        this.toLabel = Ext.create('Ext.form.Label',{
            text: 'To Time',
            height: 22,
            margin: '0 5 0 5',
            style: {
                'line-height': '22px'
            }
        });
        this.toTimeBg.add(this.toLabel);

        this.fromTimeField = Ext.create( 'Exem.TextField', {
            enableKeyEvents : true,
            width           : this.textFieldWidth,
            validator       : '',
            plugins         : [new Ext.ux.InputTextMask(this.textMask, false)],
            labelSeparator  : '',
            tabIndex: this.fromTabIndex,
            regExpTextVal   : this.regExptest,
            maxLength       : this.textFiledMaxLength,
            listeners       : {
                scope: this,
/**
//                keydown : function( me, e, eOpts ) {
//                    if ( e.button === 12 ) {
//                        this.validCheck();
//                    }
//                },
 **/
                keyup : function( me, e) {
                    if (e.button >= 36 && e.button <= 39) {
                        e.stopEvent();
                    }
                    else {
                        this.cursorMove( me );
                    }
                },
                change: function( me, newValue){
                    if(me.regExpTextVal.test(newValue)){
                        me.beforeTime = newValue;
                    }
                },
                blur: function(me){
                    if(me.beforeTime != null && ! me.regExpTextVal.test(me.getValue())){
                        me.setValue(me.beforeTime);
                    }
                }
            }
        });

//        <--------------------- 버튼 수정함.q
        this.fromCalBtn = Ext.create('Ext.container.Container',{
//           icon  : '../images/calendar.png',
            cls: 'timepicker-from',
            width : 25,
            height: 23,
            listeners : {
                scope: this,
                render: function(_this) {
                    _this.getEl().on('click', function() {
                        if(this.validCheck()) {
                            this.timePicker.showBy(_this);
                        }
                    }.bind(this));
                }
            }
        });

        this.toCalBtn = Ext.create('Ext.container.Container',{
//           icon: '../images/calendar.png',
            cls: 'timepicker-to',
            width : 25,
            height: 23,
            style: {
                backgroundImage: 'url(../images/xm_icon_v1.png)',
                backgroundPosition: '-199px -105px',
                cursor: 'pointer'
            },
            listeners : {
                scope: this,
                render: function(_this) {
                    _this.getEl().on('click', function() {
                        if(this.validCheck()) {
                            this.timePicker.showBy(_this);
                        }
                    }.bind(this));
                }
            }
        });

        this.toTimeField = Ext.create( 'Exem.TextField', {
            enableKeyEvents : true,
            width           : this.textFieldWidth,
            plugins         : [new Ext.ux.InputTextMask(this.textMask, false)],
            regExpTextVal   : this.regExptest,
            maxLength       : this.textFiledMaxLength,
            listeners       : {
                scope: this,
                /**
//                keydown : function( me, e, eOpts ){
//                    if ( e.button === 12 ){
//                        this.validCheck();
//                    }
//                },
                 **/
                keyup : function( me, e){
                    if (e.button >= 36 && e.button <= 39)
                        e.stopEvent();
                    else {
                        this.cursorMove( me );
                    }
                },
                change: function( me, newValue){
                    if(me.regExpTextVal.test(newValue)){
                        me.beforeTime = newValue;
                    }
                },
                blur: function(me){
                    if(me.beforeTime != null && ! me.regExpTextVal.test(me.getValue())){
                        me.setValue(me.beforeTime);
                    }
                }
            }
        });
        this.fromTimeBg.add(this.fromTimeField, { xtype: 'tbspacer', width: 2}, this.fromCalBtn);
        this.toTimeBg.add(this.toTimeField, { xtype: 'tbspacer', width: 2},    this.toCalBtn);

        if (this.UILayout == 'hbox') {
            this.fromLabel.setText('Time');
            this.toLabel.setVisible(false);
            this.fromCalBtn.setVisible(false);
            this.fromTimeBg.setWidth(this.showClearButton ? this.fromWidth : 81);
        } else if(this.UILayout == 'vbox') {
            this.separ.setVisible(false);
        }


        if (this.useSingleTime) {
            this.fromTimeField.setWidth(122);
            this.fromTimeBg.setWidth(126);
            this.fromLabel.hide();
            this.separ.hide();
            this.toTimeField.hide();
        }

    },

    // scope : window
    setFromTimeFocus : function(){
        this.fromTimeField.markInvalid('');
        this.fromTimeField.focus();
    },
    // scope : window
    setToTimeFocus : function(){
        this.toTimeField.markInvalid('');
        this.toTimeField.focus();
    },

    // ok 누를때의 validCheck
    okValid: function(fromHour,fromMin,toHour,toMin) {
        if(Number(fromHour) > Number(toHour)) {
            return false;
        } else if(Number(fromHour) == Number(toHour)){
            if(this.useOnlyHour){
                return false;
            }
            else{
                if (Number(fromMin) > Number(toMin)) {
                    return false;
                }
            }
        }
        return true;
    },

    // 달력 누를때의 validCheck
    validCheck: function() {

        //var pt = /^([01]\d|[2][0-3]):[0-5]\d$/
        var pt = this.regExptest;

        var fromValue = this.fromTimeField.getValue().split(':');
        var toValue = this.toTimeField.getValue().split(':');

        try {
            if (!pt.test( this.fromTimeField.getValue()) ) {
                this.setFromTimeFocus();
                return false;
            }
            if (!pt.test( this.toTimeField.getValue()) ) {
                this.setToTimeFocus();
                return false;
            }

            if(Number(fromValue[0]) > Number(toValue[0]) || (Number(fromValue[0]) == Number(toValue[0]) && Number(fromValue[1]) > Number(toValue[1]))) {
                this.setFromTimeFocus();
                return false;
            }

            return true;
        } finally {
            pt = null;
            fromValue = null;
            toValue = null;
        }


    },


    cursorMove: function ( me ){
        var move = false;
        if (!me.getCaretPosition) {
            return;
        }

        if(me.getCaretPosition() == 2){
            move = true;
        }

        if (move){
            if (me.getCaretPosition() + 1  === 10 )
                me.setCaretPosition( me.getCaretPosition() + 2 );
            else
                me.setCaretPosition( me.getCaretPosition() + 1 );
            move = false;
        }
    },


    // timegap 만큼.
    setTime: function() {
        this.fromTimeField.setValue( Ext.util.Format.date(new Date(+new Date()-(this.timeGap)), 'H:i'));
        this.toTimeField.setValue( Ext.util.Format.date(new Date(), 'H:i'));
    },



    createTimePicker: function() {

        var width = 400;
        if (this.useSingleTime) {
            width = 230;
        }

        var timePanel = Ext.create('Ext.panel.Panel',{
            width   : width,
            height  : !this.useOnlyHour ? 337 : 260,
            floating: true,
            shadow  : false,
            layout  : 'fit',
            bodyStyle: {
                border       : '7px solid #000000',
                borderRadius : '8px',
                background   :'#000000'
            },
            listeners: {
                scope: this,
                hide: function () {
                    // hide 될때 선택된 시간과 분을 지운다.
                    var keys = Object.keys(this.selected);
                    for(var ix = 0, len = keys.length; ix< len; ix++) {
                        if(this.selected[keys[ix]] != null){
                            this.deSelectBlock(this.selected[keys[ix]]);
                            this.selected[keys[ix]] = null;
                        }
                    }
                },
                show: function() {
                    var fromValue = this.fromTimeField.getValue().split(':');
                    var toValue = this.toTimeField.getValue().split(':');

                    this.setFromTime(Number(fromValue[0]), Number(fromValue[1]));
                    this.setToTime(Number(toValue[0]), Number(toValue[1]));

                }
            }
        });

        var timeBackground = Ext.create('Ext.container.Container',{
            width : '100%',
            height: '100%',
            layout: 'vbox',
            style : {
                borderRadius : '8px',
                background :'#FFFFFF'
            }
        });
        timePanel.add(timeBackground);

        // 상단 yseterDay today 있는 영역
        var topArea = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 40,
            layout: 'hbox',
            style : {
                borderBottom: '1px solid #AAAAAA'
            }
        });

        var bodyArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            flex   : 1,
            layout : 'fit',
            style  : {
                borderBottom: '1px solid #AAAAAA'
            }
        });

        var bottomBtnArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            layout : {
                type : 'hbox',
                align: 'middle'
            },
            style  : {
                background: '#E1EAF3'
            },
            height: 40
        });

        timeBackground.add(topArea);
        timeBackground.add(bodyArea);
        timeBackground.add(bottomBtnArea);

        // 상단
        /////////////////////////////////////////////////////////////////////////////////

        var titleTime = Ext.create('Ext.container.Container',{
            width : 100,
            height: 40,
            html  : '<div style="line-height: 40px; text-indent: 15px; font-size: 17px;  font-weight: bold;">'+common.Util.TR('Time')+'</div>'
        });

        var closeBtn = Ext.create('Ext.container.Container',{
            width : 40,
            height: 40,
            cls   : 'datePicker_close',
            listeners: {
                scope: this,
                render: function(_this) {
                    _this.el.on('click', function() {
                        timePanel.hide();
                    });
                }
            }
        });

        topArea.add(titleTime);
        topArea.add({ xtype: 'tbspacer', flex: 1});
        topArea.add(closeBtn);

        /////////////////////////////////////////////////////////////////////////////

        // 중간
        /////////////////////////////////////////////////////////////////////////////

        var bodyContentesArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : '100%',
            layout : 'vbox',
            margin : '15 15 10 15'
        });
        bodyArea.add(bodyContentesArea);

        /**
//        var bodyTopArea = Ext.create('Ext.container.Container',{
//            width  : '100%',
//            height : 30,
//            style: {
//                border: '1px solid #aaaaaa'
//            }
//        });
//        bodyContentesArea.add(bodyTopArea);
**/
        // 날짜 블럭 생성되는 영역
        var bodyTimeArea = Ext.create('Ext.container.Container',{
            width : '100%',
            flex  : 1,
            layout: 'hbox'
        });
        bodyContentesArea.add(bodyTimeArea);

        var fromTimeBlockArea = Ext.create('Ext.container.Container',{
            flex  : 1,
            height: '100%',
            html : '123123',
            layout: 'fit'
        });

        var sepparEl = '<div style="margin-top: 100px; font-weight: bold;"> ~ </div>';
        if(this.useOnlyHour){
            sepparEl = '<div style="margin-top: 65px; font-weight: bold;"> ~ </div>';
        }

        this.bodySepar = Ext.create('Ext.container.Container',{
            width: 10,
            height: '100%',
            margin: '0 2 0 2',
            html : sepparEl,
            hidden: this.useSingleTime
        });

        var toTimeBlockArea = Ext.create('Ext.container.Container',{
            height: '100%',
            flex  : 1,
            html : '456456',
            layout: 'fit',
            hidden: this.useSingleTime
        });

        bodyTimeArea.add(fromTimeBlockArea, this.bodySepar, toTimeBlockArea);


        this.fromTimeArea = this.timeLayout(this.part.FROM, fromTimeBlockArea);
        this.toTimeArea   =  this.timeLayout(this.part.TO, toTimeBlockArea);

        /////////////////////////////////////////////////////////////////////////////

        // 하단 버튼 영역
        ////////////////////////////////////////////////////////////////////////////////

        if(this.showRetrieveBtn){
            this.retriveBtn = this.createButton(common.Util.TR('Retrieve'));
            this.retriveBtn.addListener('render', function (_this){
                _this.getEl().on('click', function(){
                    var fromHour, toHour;
                    if(this.useOnlyHour){
                        fromHour = this.selected.fromHour.hour;
                        toHour   = this.selected.toHour.hour;

                        if(!this.okValid(fromHour,0,toHour,59 )) {
                            Ext.Msg.alert(common.Util.TR('Error'), common.Util.TR('Time value is incorrect.'));
                            return;
                        }

                        if (Number(fromHour) < 10) {
                            fromHour = '0'+ fromHour;
                        }

                        if (Number(toHour) < 10) {
                            toHour = '0'+ toHour;
                        }

                        this.fromTimeField.setValue(fromHour);
                        this.toTimeField.setValue(toHour);
                    }else{
                        var fromMin  = this.selected.fromMinute.minute;
                        var toMin    = this.selected.toMinute.minute;

                        fromHour = this.selected.fromHour.hour;
                        toHour   = this.selected.toHour.hour;

                        if(!this.okValid(fromHour,fromMin,toHour,toMin )) {
                            Ext.Msg.alert(common.Util.TR('Error'), common.Util.TR('Time value is incorrect.'));
                            return;
                        }

                        if (Number(fromHour) < 10) {
                            fromHour = '0'+ fromHour;
                        }

                        if (Number(fromMin) == 0)  {
                            fromMin = '0'+ fromMin;
                        }

                        if (Number(toHour) < 10) {
                            toHour = '0'+ toHour;
                        }

                        if (Number(toMin) == 0) {
                            toMin = '0'+ toMin;
                        }

                        this.fromTimeField.setValue(fromHour + ':' + fromMin);
                        this.toTimeField.setValue(toHour + ':' + toMin);
                    }


                    //var activeTab = Ext.getCmp('mainTab').getActiveTab()
                    if(this.executeScope) {
                        this.executeScope.retrieve();
                    }

                    //activeTab.retrieve()
                    timePanel.hide();
                }.bind(this));
            }.bind(this));
        }




        this.okBtn      = this.createButton(common.Util.TR('OK'));
        this.okBtn.addListener('render', function (_this){
            _this.getEl().on('click', function(){
                var fromHour, toHour;

                if(this.useOnlyHour){
                    fromHour = this.selected.fromHour.hour;
                    toHour   = this.selected.toHour.hour;

                    if(!this.okValid(fromHour,0,toHour,59 )) {
                        Ext.Msg.alert(common.Util.TR('Error'), common.Util.TR('Time value is incorrect.'));
                        return;
                    }

                    if (Number(fromHour) < 10) {
                        fromHour = '0'+ fromHour;
                    }

                    if (Number(toHour) < 10) {
                        toHour = '0'+ toHour;
                    }

                    this.fromTimeField.setValue(fromHour);
                    this.toTimeField.setValue(toHour);
                }else{
                    var fromMin  = this.selected.fromMinute.minute;
                    var toMin    = this.selected.toMinute.minute;

                    fromHour = this.selected.fromHour.hour;
                    toHour   = this.selected.toHour.hour;


                    if(!this.okValid(fromHour,fromMin,toHour,toMin )) {
                        Ext.Msg.alert(common.Util.TR('Error'), common.Util.TR('Time value is incorrect.'));
                        return;
                    }


                    if (Number(fromHour) < 10) {
                        fromHour = '0'+ fromHour;
                    }

                    if (Number(fromMin) == 0)  {
                        fromMin = '0'+ fromMin;
                    }

                    if (Number(toHour) < 10) {
                        toHour = '0'+ toHour;
                    }

                    if (Number(toMin) == 0) {
                        toMin = '0'+ toMin;
                    }

                    this.fromTimeField.setValue(fromHour + ':' + fromMin);
                    this.toTimeField.setValue(toHour + ':' + toMin);
                }

                timePanel.hide();

            }.bind(this));
        }.bind(this));

        this.cancelBtn  = this.createButton(common.Util.TR('Cancel'));
        this.cancelBtn.addListener('render', function (_this){
            _this.getEl().on('click', function(){
                timePanel.hide();
            });
        });

        this.selectedFromArea = Ext.create('Ext.container.Container',{
            xtype: 'container',
            html : '11:11',
            hidden: true
        });
        this.separ = Ext.create('Ext.container.Container',{
            xtype: 'container',
            margin : '0 2 0 2',
            html : ' ~ ',
            hidden: true
        });
        this.selectedToArea = Ext.create('Ext.container.Container',{
            xtype: 'container',
            html : '22:22',
            hidden: true
        });

        if(this.showRetrieveBtn){
            bottomBtnArea.add(
                { xtype: 'tbspacer', width : 10 },
                this.retriveBtn,
                { xtype: 'tbspacer', flex : 1 },
                this.selectedFromArea,
                this.separ ,
                this.selectedToArea,
                { xtype: 'tbspacer', width : 10 },
                this.okBtn,
                { xtype: 'tbspacer', width : 5 },
                this.cancelBtn,
                { xtype: 'tbspacer', width : 10 }

            );
        }else{
            bottomBtnArea.add(
                { xtype: 'tbspacer', width : 10 },
                { xtype: 'tbspacer', flex : 1 },
                this.selectedFromArea,
                this.separ ,
                this.selectedToArea,
                { xtype: 'tbspacer', width : 10 },
                this.okBtn,
                { xtype: 'tbspacer', width : 5 },
                this.cancelBtn,
                { xtype: 'tbspacer', width : 10 }

            );
        }
        return timePanel;
    },

    createButton: function(text, margin) {
        var btn  = Ext.create('Ext.container.Container',{
            html   : text,
            margin : margin,
            height: 26,
            width  : 70,
            cls    : 'button3d'
        });
        return btn;
    },

    // 시간 과 분 선택하는 부분.
    timeLayout : function(type, target) {
        var self = this;
        // 시간 title 영역
        var timeArea = Ext.create('Ext.container.Container',{
            layout : 'vbox',
            width  : 123,
            height : '100%',
            style: {
                border: '1px solid #CCC'
//                borderLeft: 'none'
            },
            items  : [{
                xtype: 'container',
                width: '100%',
                flex: 1,
                style: {
                    borderBottom: '1px solid #CCC',
                    background: '#f5f5f5',
                    'font-family': "Helvetica Neue",
                    'font-weight': 'bold'
                },
                layout: {
                    type: 'hbox',
                    align: 'middle',
                    pack: 'center'
                },
                items: [{
                    xtype: 'label',
                    text : common.Util.TR('Hour')
                }]
            }]
        });
        target.add(timeArea);

        var hour = 0,
            hourAreaStyle = null,
            ix, jx;
        for (ix = 0; ix < 4; ix ++) {
            // 시간 block 한줄 container
            var raw_con_h = Ext.create('Ext.container.Container',{
                width : '100%',
                layout: 'hbox',
                height: 26
            });

            for (jx = 0; jx < 6; jx ++) {
                var time;

                if (hour < 10) {
                    time =  hour;
                } else {
                    time = String(hour);
                }

                if(jx == 5) {
                    hourAreaStyle = {
                        borderBottom: '1px solid #CCC'
                    };
                } else {
                    hourAreaStyle = {
                        borderBottom: '1px solid #CCC',
                        borderRight : '1px solid #CCC'
                    };
                }

                if (this.useOnlyHour && ix == 3) {
                    hourAreaStyle = {
                        borderBottom: 'none',
                        borderRight : '1px solid #CCC'
                    };

                    if (jx == 5) {
                        hourAreaStyle = {
                            borderBottom: 'none',
                            borderRight : 'none'
                        };
                    }

                }

                // 시간 숫자 한칸 영역
                var hourBlock = Ext.create('Ext.container.Container',{
                    flex  : 1,
                    height: 26,
                    html  : '<div style = "line-height: 26px; height: 26px; text-align: center;" >'+ time +'</div>',
                    style : hourAreaStyle,
                    cls   : 'timeNum',
                    hour  : time,
                    _type : type,
                    listeners: {
                        scope: this,
                        render: function(_this) {
                            _this.getEl().on('click', function() {

                                this.selectHours(_this._type, _this);

                            }.bind(this));
                        }
                    }
                });

                if (type == self.part.FROM) {
                    this.fromHours.push(hourBlock);
                } else if (type == self.part.TO) {
                    this.toHours.push(hourBlock);
                }


                raw_con_h.add(hourBlock);
                hour++;
            }
            timeArea.add(raw_con_h);
        }

        timeArea.add({
            xtype: 'container',
            width: '100%',
            flex: 1,
            hidden: this.useOnlyHour,
            style: {
                borderBottom: '1px solid #CCC',
                background: '#f5f5f5',
                'font-family': "Helvetica Neue",
                'font-weight': 'bold'
            },
            layout: {
                type: 'hbox',
                align: 'middle',
                pack: 'center'
            },
            items: [{
                xtype: 'label',
                text : common.Util.TR('Minute')
            }]
        });

        var raw_con_m = Ext.create('Ext.container.Container',{
            width: '100%',
            height: 26,
            layout: 'hbox',
            hidden: this.useOnlyHour
        });
        var minuteList = ['0', '10', '20','30','40','50','59'];
        var minAreaStyle = { borderRight : '1px solid #CCC'};
        for(jx = 0; jx < 7; jx ++) {

            if (jx == 6) {
                minAreaStyle = null;
            }
            var minuteBlock = Ext.create('Ext.container.Container',{
                flex : 1,
                height: 26,
                html  :  '<div style = "line-height: 26px; height: 26px; text-align: center;" >'+ minuteList[jx] +'</div>',
                style : minAreaStyle,
                minute: minuteList[jx],
                cls   : 'timeNum',
                _type : type,
                listeners: {
                    scope: this,
                    render: function(_this) {
/**
                        // from 은 0분  to 는 59만 선택 할수 있도록 수정.  -- 1006 JH
                        // long-term 이외의 view 에서 사용한다면. 아래 주석 부분처럼 처리하고
                        // 이부분을 옵션으로 처리해야함.
                        //if (_this._type == this.part.FROM ) {
                        //    if(this.minSelect ==  'fixed0to59') {
                        //        if (_this.minute == 0) {
                        //            _this.getEl().on('click', function() {
                        //
                        //                this.selectMinute(_this._type, _this);
                        //
                        //            }.bind(this));
                        //        } else {
                        //            _this.setDisabled(true);
                        //            _this.removeCls('timeNum');
                        //        }
                        //    } else if(this.minSelect ==  'fixed10min'){
                        //        if (_this.minute == 59) {
                        //
                        //            _this.setDisabled(true);
                        //            _this.removeCls('timeNum');
                        //
                        //        } else {
                        //            _this.getEl().on('click', function() {
                        //
                        //                this.selectMinute(_this._type, _this);
                        //
                        //            }.bind(this));
                        //        }
                        //    }
                        //
                        //}  else {
                        //    // to인 경우
                        //    if (_this.minute == 59) {
                        //        if(this.minSelect ==  'fixed0to59') {
                        //            _this.getEl().on('click', function() {
                        //
                        //                this.selectMinute(_this._type, _this);
                        //
                        //            }.bind(this));
                        //        } else if(this.minSelect ==  'fixed10min') {
                        //            _this.setDisabled(true);
                        //            _this.removeCls('timeNum');
                        //        }
                        //    } else {
                        //        if(this.minSelect ==  'fixed0to59') {
                        //            _this.setDisabled(true);
                        //            _this.removeCls('timeNum');
                        //        } else if(this.minSelect ==  'fixed10min') {
                        //            _this.getEl().on('click', function() {
                        //
                        //                this.selectMinute(_this._type, _this);
                        //
                        //            }.bind(this));
                        //        }
                        //
                        //    }
                        //}
**/
                        _this.getEl().on('click', function() {

                            this.selectMinute(_this._type, _this);

                        }.bind(this));

                    }
                }
            });

            if(type == self.part.FROM) {
                this.fromMinutes.push(minuteBlock);
            } else if (type == self.part.TO) {
                this.toMinutes.push(minuteBlock);
            }

            raw_con_m.add(minuteBlock);
        }
        timeArea.add(raw_con_m);

        var obj = {'timeArea' : timeArea};
        return obj;
    },


    // 시간 select 해제시
    deSelectBlock: function (target) {
        target.removeCls('timeNumActive');
        target.addCls('timeNum');
    },

    // 시간 클릭시 해당 container setStyle
    selectHours: function(type, target) {

        target.removeCls('timeNum');
        target.addCls('timeNumActive');

        switch (type) {
            case this.part.FROM:
                if (this.selected.fromHour != null && this.selected.fromHour.hour != target.hour) {
                    this.deSelectBlock(this.selected.fromHour);
                }
                this.selected.fromHour = target;

                break;

            case this.part.TO:
                if (this.selected.toHour != null && this.selected.toHour.hour != target.hour) {
                    this.deSelectBlock(this.selected.toHour);
                }
                this.selected.toHour = target;

                break;

            default :
                break;
        }
    },

    selectMinute: function(type, target) {
        if(this.useOnlyHour) {
            return;
        }

        target.removeCls('timeNum');
        target.addCls('timeNumActive');

        switch (type) {
            case this.part.FROM:
                if (this.selected.fromMinute != null) {
                    if(this.selected.fromMinute.minute != target.minute) {
                        this.deSelectBlock(this.selected.fromMinute);
                    }
                }
                this.selected.fromMinute = target;
                break;

            case this.part.TO:
                if (this.selected.toMinute != null) {
                    if (this.selected.toMinute.minute != target.minute) {
                        this.deSelectBlock(this.selected.toMinute);
                    }
                }
                this.selected.toMinute = target;
                break;

            default :
                break;
        }
    },

    // from 달력좌측 시. 분 set 해주기
    setFromTime: function(hour, min) {
        this.selectHours(this.part.FROM, this.fromHours[hour]);
        var index = Math.floor(min/10); // 버림
        this.selectMinute(this.part.FROM, this.fromMinutes[index]);
    },

    // to 달력좌측 시. 분 set 해주기
    setToTime: function(hour, min) {
        this.selectHours(this.part.TO, this.toHours[hour]);
        var index = Math.ceil(min/10);
        this.selectMinute(this.part.TO, this.toMinutes[index]);
    },

    // 지금은 사용 x
    updateTime: function(type, hour, min) {
        if(type == this.part.FROM){
            this.selectedFromArea.update(hour+ ':' + min);
        } else if(type == this.part.TO) {
            this.selectedToArea.update(hour+ ':' + min);
        }
    },

    getFromTime: function() {
        if(this.useFixedMinute){
            return this.fromTimeField.getValue() + ':00';
        }else{
            return this.fromTimeField.getValue();
        }
    },

    getToTime: function() {
        if(this.useFixedMinute){
            return this.toTimeField.getValue() + ':59';
        }else{
            return this.toTimeField.getValue();
        }
    }


});