/**
 * Created by Administrator on 14. 2. 17.
 */

Ext.define( 'Exem.DatePicker', {
    extend: 'Ext.container.Container',
    layout: 'absolute',
    label : common.Util.TR('Time'),
    width : 500,
    height: 50,

    UImode  : FieldUI.HBOX,

    flipFromDate  : null,
    flipToDate    : null,
    isSecondField : false,
    mainFromField : null,
    mainToField   : null,
    selectFromTime: null,
    selectToTime  : null,
    executeSQL    : null,
    executeScope  : null,
    isDiff        : false,
    DisplayTime   :  DisplayTimeMode.HMS,
    rangeOneDay   : false,
    singleField   : false,

    toCalNotUse   : false,   // 달력에서 우측 disable 시키기.

    useRetriveBtn : true,
    useGoDayButton: true,    // go today yesterday 버튼 사용 유무 2016-01-29 추가 KJH
    useRangeOver  : false,

    localeType       : 'Y-m-d H:i:s',
    _displayType      : null,

    keyUpCheck    : false, // BaseForm 에서 사용 - HK 어제, 오늘, 한달전 체크위함
    keyUpFn       : null,

    fromFieldEditable: true,  // 2016-01-15 readOnly 기능 추가 KJH
    toFieldEditable  : true,
    disableMessage   : null,
    retriveClick: null,
    showAtTopLeft: false,
    onCalenderValidFn: null,
    onFromHourSelect : null,
    defaultTimeGap : null,    // 1시간 단위

    setRightCalPos : false,  //calendar가 우측으로가서 잘리는 경우 LJW 20160908
    comparisionMode: false, // 오늘날짜 선택 변경 LJW 20160908
    isRtmTxnList : false,  // LJW kbank용 증감 프레임

    listeners: {
        beforedestroy: function() {
            Ext.destroy(this.pickerUI);
        }
    },

    constructor: function(config) {
        this.callParent(arguments);
    },


    initComponent : function(){
        var self = this;


        self.setLocale();

        ////////////////

        // get/set cursor position
        Ext.override(Ext.form.field.Text, {
            setCaretPosition: function(pos) {
                var el = this.inputEl.dom;
                if (typeof(el.selectionStart) === "number") {
                    el.focus();
                    el.setSelectionRange(pos, pos);
                } else if (el.createTextRange) {
                    var range = el.createTextRange();
                    range.move("character", pos);
                    range.select();
                } else {
                    throw 'setCaretPosition() not supported';
                }
            },

            getCaretPosition: function() {
                var el = this.inputEl.dom;
                if (typeof(el.selectionStart) === "number") {
                    return el.selectionStart;
                } else if (document.selection && el.createTextRange){
                    var range = document.selection.createRange();
                    range.collapse(true);
                    range.moveStart("character", -el.value.length);
                    return range.text.length;
                } else {
                    throw 'getCaretPosition() not supported';
                }
            }
        });
        /////////////////////////////////

        function cursorMove( me ){
            var move = false;
            if(nation == 'en') {
                switch ( me.getCaretPosition() ) {
                    case 2 :
                    case 5 :
                    case 10:
                    case 13:
                    case 16:
                        move = true;
                        break;
                    default:
                        break;
                }
            } else {
                switch ( me.getCaretPosition() ) {
                    case 4 :
                    case 7 :
                    case 10:
                    case 13:
                    case 16:
                        move = true;
                        break;
                    default:
                        break;
                }
            }


            if (move){
                if (me.getCaretPosition() + 1  === 10 )
                    me.setCaretPosition( me.getCaretPosition() + 2 );
                else
                    me.setCaretPosition( me.getCaretPosition() + 1 );
                move = false;
            }
        }

        var plugInMaskInfo = self.getPluginMaskFormat(self.DisplayTime, this.UImode);

        var maskPluginFrom = [new Ext.ux.InputTextMask(plugInMaskInfo.displayFormat, false)];
        if(!this.fromFieldEditable){
            maskPluginFrom = null;
        }

        self.mainFromField = Ext.create( 'Ext.form.field.Text', {
            enableKeyEvents : true,
            fieldLabel      : plugInMaskInfo.fromLabel,
            x: plugInMaskInfo.fromgFieldX,
            y: 0,
            labelWidth      : plugInMaskInfo.fromLabelWidth,
            labelAlign      : 'right',
            width:  plugInMaskInfo.fieldWidth,
            labelSeparator  : '',
            readOnly  : !this.fromFieldEditable,
            plugins         : maskPluginFrom,
            listeners       : {
                keydown : function( me, e){
                    if ( e.keyCode === 13 && self.validation()){
                        self.mainToField.focus();
                    }
                },
                keyup : function( me, e){

                    if (e.keyCode >= 37 && e.keyCode <= 39)
                        e.stopEvent();
                    else{
                        cursorMove( this );
                        /*
                        //if (self.rangeOneDay && this.getCaretPosition() < 12) {
                        //    /// 자기 자신의 년 월 일 영역만 반대의 field에 적용시키기
                        //    this.fromMemo = this.getValue().split(' ');
                        //    this.toMemo = self.mainToField.getValue().split(' ');
                        //    var toTime = '';
                        //    if(this.toMemo[1] != undefined){
                        //        toTime = this.toMemo[1];
                        //    }
                        //    self.mainToField.setValue(this.fromMemo[0]+' '+toTime);
                        //}
                        */

                        if (self.keyUpCheck) {
                            if (self.singleField) {
                                self.keyUpFn(new Date(self.mainFromField.getValue()));
                            } else {
                                var tempFromTime = self.mainFromField.getValue();
                                var tempToTime = self.mainToField.getValue();
                                if(self.DisplayTime == DisplayTimeMode.H) {
                                    tempFromTime += ':00';
                                    tempToTime   += ':00';
                                }
                                self.keyUpFn(new Date(tempFromTime), new Date(tempToTime));
                            }
                        }
                    }
                },
                blur: function(me){         // valid 체크 LJW
                    if(!self.getRegExpPatternByNation(nation).test(me.getValue()) && self.isRtmTxnList) {
                        if(self.comparisionMode) {
                            var comp_date = new Date();
                            comp_date.setDate(comp_date.getDate() -1);
                            comp_date = Ext.Date.format( comp_date, Comm.dateFormat.NONE);

                            me.setValue(comp_date);

                            comp_date = null;
                        } else {
                            me.setValue(self.lastFromTime);
                        }
                        if (self.mainToField) {
                            self.mainToField.fireEvent('blur', self.mainToField);
                        }
                    }
                }
            }
        });

        var fromLabelState = true;
        var fromIconVisible = false;

        if(this.UImode ==  FieldUI.HBOX){
            fromLabelState = false;
            fromIconVisible = true;
        }

        var maskPluginTo = [new Ext.ux.InputTextMask(plugInMaskInfo.displayFormat, false)];
        if (!this.toFieldEditable) {
            maskPluginTo = null;
        }

        self.mainToField = Ext.create( 'Ext.form.field.Text', {
            enableKeyEvents : true,
            fieldLabel      : plugInMaskInfo.toLabel,
            labelWidth      : plugInMaskInfo.toLabelWidth,
            labelAlign      : 'right',
            x:  plugInMaskInfo.toFieldX,
            y: plugInMaskInfo.toFieldY,
            width:  plugInMaskInfo.fieldWidth,
            plugins         : maskPluginTo,
            readOnly        : !this.toFieldEditable,
            labelSeparator  : '',
            listeners       : {
                keydown : function( me, e){
                    if ( e.keyCode === 13 ){
                        self.validation();
                    }
                },
                keyup : function( me, e) {
                    if (e.keyCode >= 37 && e.keyCode <= 39)
                        e.stopEvent();
                    else {
                        cursorMove(this);

                        /*
                         //if (self.rangeOneDay && this.getCaretPosition() < 12) {
                         //    /// 자기 자신의 년 월 일 영역만 반대의 field에 적용시키기
                         //    this.toMemo = this.getValue().split(' ');
                         //    this.fromMemo = self.mainFromField.getValue().split(' ');
                         //    var fromTime = '';
                         //    if(this.fromMemo[1] != undefined){
                         //        fromTime = this.fromMemo[1];
                         //    }
                         //    self.mainFromField.setValue(this.toMemo[0]+' '+fromTime);
                         //}
                         */

                        if (self.keyUpCheck) {
                            if (self.singleField) {
                                self.keyUpFn(new Date(self.mainFromField.getValue()));
                            } else {
                                var tempFromTime = self.mainFromField.getValue();
                                var tempToTime = self.mainToField.getValue();
                                if (self.DisplayTime == DisplayTimeMode.H) {
                                    tempFromTime += ':00';
                                    tempToTime += ':00';
                                }
                                self.keyUpFn(new Date(tempFromTime), new Date(tempToTime));
                            }
                        }
                    }
                } ,
                blur: function(me){         // valid 체크 LJW
                    if (!self.getRegExpPatternByNation(nation).test(me.getValue()) && self.isRtmTxnList) {
                        if(self.comparisionMode) {
                            var comp_date = new Date();
                            comp_date.setDate(comp_date.getDate() -1);
                            comp_date = Ext.Date.format( comp_date, Comm.dateFormat.NONE);
                            me.setValue(comp_date);

                            comp_date = null;
                        } else {
                            me.setValue(self.lastToTime);
                        }
                    }
                }
            }
        });



        self.mainFormLabel = Ext.create('Ext.form.Label',{
            text  : '~',
            x:plugInMaskInfo.toLabelX,
            y:3,
            hidden: fromLabelState
        });

        // <0------ 여기
        var toIconVisible = false;
        if(self.singleField) {
            self.mainFormLabel.setVisible(false);
            self.mainToField.setVisible(false);
            toIconVisible = true;
            fromIconVisible = false;
            if (this.UImode ==  FieldUI.HBOX) {
                if (this.DisplayTime == DisplayTimeMode.None || this.DisplayTime == DisplayTimeMode.YM) {
                    plugInMaskInfo.fromIconPosX -= 130;
                }
                else{
                    plugInMaskInfo.fromIconPosX -= 72;
                }
            }
        }

        self.initializeDateTime();

        var pickerUI = Ext.create('Exem.calendar',{
            dateField   : self,
            localeType : self.localeType,
            DisplayTime :self.DisplayTime,
            useRetrieve: self.useRetriveBtn,
            onCalenderValidFn: this.onCalenderValidFn,
            onFromHourSelect : this.onFromHourSelect,
            disableMessage: this.disableMessage,
            useGoDayButton: this.useGoDayButton,
            useRangeOver  : this.useRangeOver,
            comparisionMode: this.comparisionMode      // 오늘날짜빼기..LJW 20160908
        });
        pickerUI.init();
        this.pickerUI = pickerUI;

        Ext.applyIf( self, {
            items: [
                self.mainFromField,
                {
                    xtype : 'button',
                    icon: '../PA/images/calendar.png',
                    hidden : fromIconVisible,
                    x: plugInMaskInfo.fromIconPosX,
                    y: 0,
                    listeners : {
                        click : function( me ){

                            if(!self.validation()){
                                self.mainFromField.focus();
                                return ;
                            }
                            pickerUI.startFromTime = self.getFromDateTime();
                            pickerUI.startToTime = self.getToDateTime();


                            if(self.singleField) {
                                pickerUI.setSingleMode();
                            }

                            if(!self.showAtTopLeft && !self.setRightCalPos) {
                                pickerUI.showBy(me, 'tl-bl');
                            } else {
                                pickerUI.showAt(100,100);
                            }

                            if(self.setRightCalPos) {
                                pickerUI.showBy(me, 'bl?');
                            }


                            pickerUI.setFromTime(self.getFromDateTime());
                            pickerUI.setToTime(self.getToDateTime());

                            if(self.toCalNotUse) {
                                pickerUI.toCalDisalble();
                            }
                        }
                    }
                },
                self.mainFormLabel,
                self.mainToField,
                {
                    xtype : 'button',
                    icon: '../PA/images/calendar.png',
                    x: plugInMaskInfo.toIconPosX,
                    hidden: toIconVisible,
                    y: plugInMaskInfo.toIconPosY,
                    listeners : {
                        click : function( me ){

                            if(!self.validation()){
                                if(self.fromField){
                                    self.mainFromField.focus();
                                } else {
                                    self.mainToField.focus();
                                }
                                return ;
                            }

                            pickerUI.startFromTime = self.getFromDateTime();
                            pickerUI.startToTime = self.getToDateTime();

                            if(!self.showAtTopLeft)
                                pickerUI.showBy(me, 'tl-bl');
                            else
                                pickerUI.showAt(100,100);



                            pickerUI.setFromTime(self.getFromDateTime());
                            pickerUI.setToTime(self.getToDateTime());
                            if(self.singleField) {
                                pickerUI.setSingleMode();
                            }

                            if(self.toCalNotUse) {
                                pickerUI.toCalDisalble();
                            }
                        }
                    }
                }
            ]
        });

        self.callParent( arguments );
    },

    _valueZeroPad: function(str){
        return ('' + str).length == 1 ? '0' + str : str;
    },

    validation: function( fromdate, todate ){
        var self = this;

        var pt = this.getRegExpPatternByNation(nation);

        var func = null;
        var fromValue = '';
        var toValue = '';

        if ( !fromdate ) {
            fromValue = self.mainFromField.getValue();
        } else {
            fromValue = fromdate;
            //1410.22
            if(this.DisplayTime == DisplayTimeMode.HMS) {
                /**fromValue +=':00'**/
            }
        }


        if ( !todate ) {
            toValue = self.mainToField.getValue();
        } else {
            toValue = todate;
            if(this.DisplayTime == DisplayTimeMode.HMS) {
                /**toValue +=':00'**/
            }
        }

        if (!pt.test( fromValue )){
            func = self.setFromTimeFocus;
            self.fromField = true;
        }

        if ((func === null) && (!pt.test( toValue ))){
            func = self.setToTimeFocus;
        }

        if (func !== null){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Date type value is incorrect.'));
            return false;
        }

        if(+new Date(fromValue) > +new Date(toValue) && !self.singleField){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Time value is incorrect.'));
            return false;
        }

        self      = null;
        pt        = null;
        func      = null;
        fromValue = null;
        toValue   = null;

        return true;
    },


    getRegExpPatternByNation: function(nation) {
        var pt;
        switch (nation) {
            case 'ko':
                switch (this.DisplayTime) {
                    case DisplayTimeMode.HMS:
                        pt = /^\d{4}-([0][1-9]|[1][0-2])-([0-2]\d|[3][0-1]) ([01]\d|[2][0-3]):[0-5]\d:[0-5]\d$/;
                        break;
                    case DisplayTimeMode.HM:
                        pt = /^\d{4}-([0][1-9]|[1][0-2])-([0-2]\d|[3][0-1]) ([01]\d|[2][0-3]):[0-5]\d$/;
                        break;
                    case DisplayTimeMode.H:
                        pt = /^\d{4}-([0][1-9]|[1][0-2])-([0-2]\d|[3][0-1]) ([01]\d|[2][0-3])/;
                        break;
                    case DisplayTimeMode.None:
                        pt = /^\d{4}-([0][1-9]|[1][0-2])-([0-2]\d|[3][0-1])/;
                        break;
                    case DisplayTimeMode.YM:
                        pt = /^\d{4}-([0][1-9]|[1][0-2])/;
                        break;
                    default :
                        break;
                }
                break;
            case 'zh-CN':
            case 'ja' :
                switch (this.DisplayTime) {
                    case DisplayTimeMode.HMS:
                        pt = /^\d{4}\/([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1]) ([01]\d|[2][0-3]):[0-5]\d:[0-5]\d$/;
                        break;
                    case DisplayTimeMode.HM:
                        pt = /^\d{4}\/([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1]) ([01]\d|[2][0-3]):[0-5]\d$/;
                        break;
                    case DisplayTimeMode.H:
                        pt = /^\d{4}\/([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1]) ([01]\d|[2][0-3])/;
                        break;
                    case DisplayTimeMode.None:
                        pt = /^\d{4}\/([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1])/;
                        break;
                    case DisplayTimeMode.YM:
                        pt = /^\d{4}\/([0][1-9]|[1][0-2])/;
                        break;
                    default :
                        break;
                }
                break;
            case 'en' :
                switch (this.DisplayTime) {
                    case DisplayTimeMode.HMS:
                        pt = /^([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1])\/\d{4} ([01]\d|[2][0-3]):[0-5]\d/;
                        //pt = /^([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1])\/\d{4} ([01]\d|[2][0-3]):[0-5]\d:[0-5]\d/
                        //  01/01/1999 01:01:01'
                        break;
                    case DisplayTimeMode.HM:
                        pt = /^([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1])\/\d{4} ([01]\d|[2][0-3]):[0-5]\d/;
                        break;
                    case DisplayTimeMode.H:
                        pt = /^([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1])\/\d{4} ([01]\d|[2][0-3])/;
                        break;
                    case DisplayTimeMode.None:
                        pt = /^([0][1-9]|[1][0-2])\/([0-2]\d|[3][0-1])\/\d{4}/;
                        break;
                    case DisplayTimeMode.YM:
                        pt = /^([0][1-9]|[1][0-2])\/\d{4}/;
                        break;
                    default :
                        break;
                }
                break;
            default :
                break;
        }
        return pt;
    },

    // scope : window
    setFromTimeFocus : function(){
        this.mainFromField.markInvalid('');
        this.mainFromField.focus();
    },
    // scope : window
    setToTimeFocus : function(){
        this.mainToField.markInvalid('');
        this.mainToField.focus();
    },

    // 체크
    isValidDatetime: function(str) {
        if (str.indexOf('_') != -1)
            return false;
        // ko = '2014-01-02 01:01:01'
        // ch/ jp = '2014/01/02 01:01:01'
        // en     = 01/02/2014 01:01:01
        if(this.DisplayTime == DisplayTimeMode.H) {
            str += ':00';
        }

        var validTime = new Date(str);
        if ( isNaN(validTime) ){
            validTime = this.mainFromField.getValue().split(' ') ;
            validTime = validTime[0] + ' 23:50' ;

            if( this.DisplayTime == DisplayTimeMode.HMS ){
                validTime += ':00';
            }
            this.mainToField.setValue(validTime) ;
            validTime = new Date(validTime) ;
        }


        // 년 월 일 시 분 초를 따로 구해서 체크해주기.
        var month   = validTime.getMonth()+1;
        var date    = validTime.getDate();
        var hours   = validTime.getHours();
        var minutes = validTime.getMinutes();
        var seconds = validTime.getSeconds();

        if (month > 12 || date > 31 || hours > 23 || minutes > 59 || seconds > 59){
            return false;
        }
        return true;
    },

    rangeCheck: function(from, to) {
        var self = this;
        var fromDate = from;
        var toDate   = to;

        // YYYY-MM-DD H 인 경우 new Date 할경우 invalid Date형식이라서 분까까지는 있어야함.
        if (self.DisplayTime == DisplayTimeMode.H) {
            fromDate +=':00';
            toDate   +=':00';
        }

        var fromMilli = new Date(fromDate);
        var toMilli = new Date(toDate);
        if (fromMilli > toMilli) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Time value is incorrect.'), function(){
                // 이게 빨간 박스
                self.mainFromField.markInvalid(common.Util.TR('Time value is incorrect.'));
                self.mainFromField.focus();
            }.bind(self));

            return false;
        }


        if(!self.validation()){
            return ;
        }

        if (self.isDiff) {
            // Diff 에서는 30일로 에러체크를 변경하기 위해 추가 - HK
            if ((+toMilli - (+fromMilli)) >= 25920000000) {
                // 에러가 아님에도 빨간 네모 포커스가 가기때문에 주석 처리 -JH
                Ext.Msg.show({
                    title: common.Util.TR('Warning'),
                    msg: common.Util.TR('It will take some time to retrieve data if you select more than thirty days. Click YES button to continue.'),
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.WARNING,
                    fn:  function(buttonId){
                        if(buttonId == 'yes'){
                            if(self.executeSQL){
                                self.executeSQL.call(self.executeScope, null);
                            }
                        }else{
                            self.mainFromField.selectText();
                            return false;
                        }
                    }.bind(this)
                });

                return false;
            }


        } else {
            if ((+toMilli - (+fromMilli)) >= 172800000) {
                // 에러가 아님에도 빨간 네모 포커스가 가기때문에 주석 처리 -JH
                //self.mainFromField.markInvalid('')
                //self.mainToField.markInvalid('')
                Ext.Msg.show({
                    title: common.Util.TR('Warning'),
                    msg: common.Util.TR('It will take some time to retrieve data if you select more than two days. Click YES button to continue.'),
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.WARNING,
                    fn:  function(buttonId){
                        if(buttonId == 'yes'){
                            if(self.executeSQL){
                                self.executeSQL.call(self.executeScope, null);
                            }
                        }else{
                            self.mainFromField.selectText();
                            return false;
                        }
                    }.bind(this)
                });

                return false;
            }
        }

        return true;
    },

    normalValid: function(from, to) {
        var self = this;
        if (!self.isValidDatetime(from)) {

            Ext.Msg.show({
                title: common.Util.TR('Time'),
                msg: common.Util.TR('Time value is incorrect.'),
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                fn: function() {
                    self.mainFromField.focus();
                    self.mainFromField.markInvalid( common.Util.TR('Time value is incorrect.'));
                }
            });

//            self.mainFromField.focus()
//            self.mainFromField.markInvalid('Invalid datetime')
            return false;
        }
        if (!self.isValidDatetime(to)) {
            Ext.Msg.show({
                title: common.Util.TR('Time'),
                msg: common.Util.TR('Time value is incorrect.'),
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                fn: function() {
                    self.mainToField.focus();
                    self.mainToField.markInvalid( common.Util.TR('Time value is incorrect.'));
                }
            });
//            self.mainToField.focus()
//            self.mainToField.markInvalid('Invalid datetime')
            return false;
        }

        return self.rangeCheck(from, to);


    },

    singleValid: function(from) {
        var self = this;
        if (!self.isValidDatetime(from)) {
            self.mainFromField.markInvalid('Time value is incorrect.');
            self.mainFromField.focus();
            return false;
        }
        return true;
    },

    checkValid: function() {
        var self = this;

        var from = this.mainFromField.getValue(),
            to = this.mainToField.getValue();
        var returnValue = null;
        if(self.singleField) {
            returnValue = self.singleValid(from);
        } else if (!self.singleField) {
            returnValue = self.normalValid(from, to);
        }

        return returnValue;
    },
    /**
     * @returns "2013-11-08 12:00:00"
     */
    getFromDateTime: function(){
        return this.mainFromField.getValue();
    },
    /**
     * @returns "2013-11-08 12:00:00"
     */
    getToDateTime: function(){
        return this.mainToField.getValue();
    },

    getPluginMaskFormat: function(type, mode) {
        var self = this;
        var dataInfo = {};

        dataInfo.displayFormat = null;
        dataInfo.fieldWidth    = null;
        dataInfo.fromIconPosX  = 208;
        dataInfo.toIconPosX    = 208;
        dataInfo.toIconPosY    = 25;
        dataInfo.fromgFieldX   = null;
        dataInfo.toFieldX      = null;
        dataInfo.toFieldY      = 25;
        dataInfo.toLabelX      = 204;
        dataInfo.fromLabel     = common.Util.TR('From Time');
        dataInfo.toLabel       = common.Util.TR('To Time');
        dataInfo.fromLabelWidth = 70;
        dataInfo.toLabelWidth    = 70;
        if (mode == FieldUI.VBOX) {
            switch (type) {
                case DisplayTimeMode.HMS:
                    dataInfo.displayFormat = self.getMaskType().HMS;
                    dataInfo.fieldWidth    = 204;
                    dataInfo.fromgFieldX   = 3;
                    dataInfo.toFieldX      = 3;
                    break;
                case DisplayTimeMode.HM:
                    dataInfo.displayFormat = self.getMaskType().HM;
                    dataInfo.fieldWidth    = 186;
                    dataInfo.fromgFieldX   = 21;
                    dataInfo.toFieldX      = 21;
                    break;
                case DisplayTimeMode.H:
                    dataInfo.displayFormat = self.getMaskType().H;
                    dataInfo.fieldWidth    = 171;
                    dataInfo.fromgFieldX   = 34;
                    dataInfo.toFieldX      = 34;
                    break;
                case DisplayTimeMode.None:
                    dataInfo.displayFormat = self.getMaskType().NONE;
                    dataInfo.fieldWidth    = 151;
                    dataInfo.fromgFieldX   = 54;
                    dataInfo.toFieldX      = 54;
                    break;
                case DisplayTimeMode.YM:
                    dataInfo.displayFormat = self.getMaskType().YM;
                    dataInfo.fieldWidth    = 151;
                    dataInfo.fromgFieldX   = 54;
                    dataInfo.toFieldX      = 54;
                    break;
                default:
                    break;
            }
        } else if (mode == FieldUI.HBOX) {
            dataInfo.toIconPosY      = 0;
            dataInfo.toFieldY        = 0;
            dataInfo.fromLabel       = '';
            dataInfo.toLabel         = '';
            dataInfo.fromLabelWidth  = 0 ;
            dataInfo.toLabelWidth    = 0;
            switch (type) {
                case DisplayTimeMode.HMS:
                    dataInfo.displayFormat = self.getMaskType().HMS;
                    dataInfo.fieldWidth    = 126 ; //184
                    dataInfo.fromgFieldX   = 0 ;
                    dataInfo.toFieldX      = 140 ; //194
                    dataInfo.toLabelX      = 129 ; //185
                    dataInfo.toIconPosX    = 270 ; //325
                    break;
                case DisplayTimeMode.HM:
                    dataInfo.displayFormat =  self.getMaskType().HM;
                    dataInfo.fieldWidth    = 110 ;//167
                    dataInfo.fromgFieldX   = 0;
                    dataInfo.toFieldX      = 125 ;//181
                    dataInfo.toLabelX      = 113 ;//170
                    dataInfo.toIconPosX    = 240 ;//295
                    break;
                case DisplayTimeMode.H:
                    dataInfo.displayFormat = self.getMaskType().H;
                    dataInfo.fieldWidth    = 90 ; //150
                    dataInfo.fromgFieldX   = 0;
                    dataInfo.toFieldX      = 105 ; //163
                    dataInfo.toLabelX      = 95 ; //152
                    dataInfo.toIconPosX    = 200 ; //260
                    break;
                case DisplayTimeMode.None:
                    dataInfo.displayFormat = self.getMaskType().NONE;
                    dataInfo.fieldWidth    = 72; //90
                    dataInfo.fromgFieldX   = 0;
                    dataInfo.toFieldX      = 95;
                    dataInfo.toLabelX      = 80;
                    dataInfo.toIconPosX    = 175;
                    break;
                case DisplayTimeMode.YM:
                    dataInfo.displayFormat = self.getMaskType().YM;
                    dataInfo.fieldWidth    = 52;
                    dataInfo.fromgFieldX   = 0;
                    dataInfo.fromIconPosX  = 188;
                    dataInfo.toFieldX      = 95;
                    dataInfo.toLabelX      = 80;
                    break;
                default :
                    break;
            }
        }



        return dataInfo;
    },

    initializeDateTime: function() {
        var self = this;
        var fDate, tDate;
        var timeGap;
        var displayType, fromHour, fromDay;

        tDate = new Date();
        fDate = new Date();

        timeGap = this.defaultTimeGap;
        displayType = this.DisplayTime;
        switch(displayType){
            case DisplayTimeMode.HM:
            case DisplayTimeMode.HMS:
                fromHour = fDate.getHours();
                if(timeGap){
                    fromHour = fromHour - timeGap;
                }
                else{
                    fromHour = fromHour - 1;
                }

                fDate.setHours(fromHour);
                break;
            case DisplayTimeMode.H:
                if(this.toCalNotUse){
                    break;
                }

                fromDay = fDate.getDate();
                if(timeGap){
                    fromDay = fromDay - timeGap;

                }
                else {
                    fromDay = fromDay - 1;
                }

                fDate.setDate(fromDay);
                break;
            case DisplayTimeMode.None:
                if(timeGap){
                    fromDay = fDate.getDate();
                    fromDay = fromDay - timeGap;
                    fDate.setDate(fromDay);
                }
                break;
            default :
                break;
        }

        fDate = self.dataFormatting(fDate, self.DisplayTime);
        tDate = self.dataFormatting(tDate, self.DisplayTime);

        self.mainFromField.setValue(fDate);
        self.mainToField.setValue(tDate);

        this.lastFromTime = fDate;  //JW 추가
        this.lastToTime = tDate;
    },

    dataFormatting : function(time, type) {
        var date = new Date(time),
            dataFormat;


        switch (type) {
            case DisplayTimeMode.HMS:
                dataFormat = Ext.Date.format(date, Comm.dateFormat.HMS);
                break;
            case DisplayTimeMode.HM:
                dataFormat = Ext.Date.format(date, Comm.dateFormat.HM);
                break;
            case DisplayTimeMode.H:
                dataFormat = Ext.Date.format(date, Comm.dateFormat.H);
                break;
            case DisplayTimeMode.None:
                dataFormat = Ext.Date.format(date, Comm.dateFormat.NONE);
                break;
            case DisplayTimeMode.YM:
                dataFormat = Ext.Date.format(date, Comm.dateFormat.YM);
                break;
            default :
                break;
        }

        return dataFormat;
    },

    getMaskType : function() {
        var maskType = {};
        switch(nation) {
            case 'ko' :
                maskType.HMS  =  '9999-99-99 99:99:99';
                maskType.HM   =  '9999-99-99 99:99';
                maskType.H    =  '9999-99-99 99';
                maskType.NONE =  '9999-99-99';
                maskType.YM   =  '9999-99';
                break;
            case 'zh-CN':
            case 'ja' :
                maskType.HMS  =  '9999/99/99 99:99:99';
                maskType.HM   =  '9999/99/99 99:99';
                maskType.H    =  '9999/99/99 99';
                maskType.NONE =  '9999/99/99';
                maskType.YM   =  '9999/99';
                break;
            case 'en' :
                maskType.HMS  =  '99/99/9999 99:99:99';
                maskType.HM   =  '99/99/9999 99:99';
                maskType.H    =  '99/99/9999 99';
                maskType.NONE =  '99/99/9999';
                maskType.YM   =  '99/9999';
                break;
            default :
                maskType.HMS  =  '99/99/9999 99:99:99';
                maskType.HM   =  '99/99/9999 99:99';
                maskType.H    =  '99/99/9999 99';
                maskType.NONE =  '99/99/9999';
                maskType.YM   =  '99/9999';
                break ;
        }

        return maskType;
    },


    // 시간 설정 관련
    /*

     */
    setLocale: function() {
        var self = this;
        self._displayType = self.localeType;
        var dateSplit  =  self._displayType.split(' ');
        var temp = [];
        if ( self._displayType.match('Y-') ||  self._displayType.match('m-')) {
            switch(nation) {
                case 'ko' :
                    break;
                case 'zh-CN':
                case 'ja' :
                    dateSplit[0] = dateSplit[0].replace(/-/g, '/');
                    break;
                case 'en' :
                    dateSplit[0] = dateSplit[0].replace(/-/g, '/');
                    if (dateSplit[0][0] == 'Y') {
                        temp.push('/Y');
                        temp.unshift('/d');
                        temp.unshift('m');
                        dateSplit[0] = temp.join('');
                    }
                    break;
                default :
                    break;
            }
        }
        if (dateSplit[1] != undefined) {
            self._displayType = dateSplit[0] + ' ' + dateSplit[1];
        } else {
            self._displayType = dateSplit[0];
        }
    },

    hideRetriveBtn: function(state) {
        if(this.pickerUI.useRetrieve){
            this.pickerUI.retriveBtn.setVisible(!state);
        }
    }


});
