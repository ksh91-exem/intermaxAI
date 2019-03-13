/**
 * Created by JONGHO on 14. 7. 17.
 */
Ext.define('Exem.calendar', {
    extend   : 'Ext.panel.Panel',
    width    : 780,
    height   : 350,
    floating : true,
    shadow   : false,
    layout   : 'fit',
    modal    : true,
    draggable: true,
    startFromTime: null,
    startToTime: null,

    dateField   : null,
    localeType  : null,
    singleMode  : false,
    DisplayTime : DisplayTimeMode.HMS,

    rangeOneDay: true,

    useGoDayButton: true,       // pa 성능 비교분석에서 사용  go today yesterday 버튼 사용 유무
                                // 버튼 영역이 안보이게되므로 show/draw 부분에서 전체 높이 수정됨.              // 2016-01-29 KJH
    useRangeOver  : false,      // pa 성능 비교분석에서 사용  오늘 보다 이후의 날짜를 선택하는경우. +1년 까지     //  2016-01-29 KJH

    disableMessage : null,
    onFromHourSelect : null,

    useRetrieve: null,

    comparisionMode : false,    // 오늘날짜 뺴기 LJW 20160908

    bodyStyle: {
        border       : '7px solid #000000',
        borderRadius : '8px',
        background   :'#000000'
    },

    constructor: function(){
        this.callParent(arguments);
    },

    init: function() {

        this.part = { FROM : 1, TO : 2 };
        this.selected = { fromHour: null, fromMinute: null, toHour: null, toMinute: null };
        this.fromHours   = [];                  // from - 시간영역 block 보관 순서는 index
        this.fromMinutes = [];                  //      - 분영역, 해당 index의 minute에 분 정보 들어있음.
        this.toHours     = [];
        this.toMinutes   = [];

        this.tempFromTime = null;               // 최종 from time 을 가공하기 위한 변수
        this.tempToTime   = null;               // 최종  to time을 가공하기 위한 변수



        this.initLayout();
    },

    // single mode 일 경우
    setSingleMode: function() {
        this.singleMode = true;
        this.setWidth(428);
        this.toArea.setVisible(false);          // 우측 달력 영역
        this.spaceArea.setVisible(false);       // 가운데 ~ 영역
        this.seper.setVisible(false);           // 하단 display 날짜 ~ 영역
        this.selectedToArea.setVisible(false);  // 하단 display 날짜 text 영역
        // single 모드 중에서도 낳짜만 사용할 경우
        if (this.DisplayTime == DisplayTimeMode.None || this.DisplayTime == DisplayTimeMode.YM) {
            this.setWidth(302);
            this.selectedFromArea.setVisible(false);
            this.fromTimeArea.timeArea.setVisible(false);
        }
    },

    toCalDisalble: function() {
        this.setWidth(418);
        this.toArea.setVisible(false);
        this.seper.setVisible(false);
        this.selectedToArea.setVisible(false);
        this.selectedFromArea.setVisible(false);
    },


    initLayout: function() {
        var self = this;


        // BG
        this.background = Ext.create('Ext.container.Container',{
            width : '100%',
            height: '100%',
            layout: 'vbox',
            style : {
                borderRadius : '8px',
                background :'#FFFFFF'
            }
        });
        this.add(this.background);

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
            height  : 40,
            layout : {
                type : 'hbox',
                align: 'middle'
            },
            style  : {
                background: '#E1EAF3'
            }
        });

        this.background.add(topArea);
        this.background.add(bodyArea);
        this.background.add(bottomBtnArea);

        // 상단
        /////////////////////////////////////////////////////////////////////////////////
        var titleTime = Ext.create('Ext.container.Container',{
            width : 100,
            height: 40,
            html  : '<div style="line-height: 40px; text-indent: 15px; font-size: 17px;  font-family:&quot;Droid Sans&quot;; font-weight: bold;">'+common.Util.TR('Time')+'</div>'
        });


        this.colseBtn = Ext.create('Ext.container.Container',{
            width : 40,
            height: 40,
            cls   : 'datePicker_close',
            listeners: {
                render: function() {

                    this.el.on('click', function() {
                        self.hide();
                    });
                }
            }
        });

        topArea.add(titleTime);
        topArea.add({ xtype: 'tbspacer', flex: 1});
        topArea.add(this.colseBtn);

        /////////////////////////////////////////////////////////////////////////////

        // 중간
        /////////////////////////////////////////////////////////////////////////////

        var bodyContentesArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : '100%',
            layout : 'vbox',
            margin : '14 15 10 15'
        });
        bodyArea.add(bodyContentesArea);

        var bodyTopArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : 30,
            layout : 'hbox'
        });
        bodyContentesArea.add(bodyTopArea);


        this.setYesterDayBtn =  this.createSetDateBtn( 0 , common.Util.TR('Yesterday'));
        this.settoDayBtn     =  this.createSetDateBtn( 1 , common.Util.TR('Today')    );
        this.setYesterDayBtn.addListener('render', function() {
            this.getEl().on('click', function() {
                // 오늘 날짜가 있는 달력 페이지로 이동
                self.fromCalender.gotoToday();
                self.toCalender.gotoToday();
                var today = new Date();
                today.setDate(today.getDate()-1);
                self.fromCalender.setDate(today);
                self.toCalender.setDate(today);


                // from을 00 시 00분  to를 23시 59분으로 set
                self.selectHours(self.part.FROM, self.fromHours[0]);
                self.selectMinute(self.part.FROM, self.fromMinutes[0]);
                self.selectHours(self.part.TO, self.toHours[23]);
                self.selectMinute(self.part.TO, self.toMinutes[6]);

            });
        });

        this.settoDayBtn.addListener('render', function() {
            this.getEl().on('click', function() {
                // 오늘 날짜가 있는 달력 페이지로 이동
                self.fromCalender.gotoToday();
                self.toCalender.gotoToday();
                self.fromCalender.setDate(new Date());
                self.toCalender.setDate(new Date());

                // from을 00 시 00분  to를 23시 59분으로 set
                self.selectHours(self.part.FROM, self.fromHours[0]);
                self.selectMinute(self.part.FROM, self.fromMinutes[0]);
                self.selectHours(self.part.TO, self.toHours[23]);
                self.selectMinute(self.part.TO, self.toMinutes[6]);

            });
        });

        if(!this.useGoDayButton) {
            bodyTopArea.setVisible(false);
        }

        // comparision 일경우에는 오늘날짜를 선택할수 없도록  LJW
        if (this.comparisionMode) {
            this.settoDayBtn.setVisible(false);
        }

        bodyTopArea.add(this.setYesterDayBtn, this.settoDayBtn);


        var bodyCalArea = Ext.create('Ext.container.Container',{
            width : '100%',
            flex  : 1,
            layout: 'hbox'
        });
        bodyContentesArea.add(bodyCalArea);



        var fromArea = Ext.create('Ext.container.Container',{
            //flex  : 1,
            height: '100%',
            layout: 'hbox'
        });

        // 달력이  생기는 영역
        this.fromCal = Ext.create('Ext.container.Container',{
            width : 237,
            height: '100%',
            layout: 'fit'
        });
        fromArea.add(this.fromCal);

        // 시 , 분 block 생기는 영역
        this.fromTimeArea = this.timeLayout(this.part.FROM, fromArea);

        self.spaceArea = Ext.create('Ext.container.Container',{
            width: 10,
            height: '100%',
            margin: '0 2 0 2',
            html : '<div style="margin-top: 100px; font-weight: bold;"> ~ </div>'
        });

        self.toArea = Ext.create('Ext.container.Container',{
            //flex : 1,
            height: '100%',
            layout: 'hbox'
        });

        this.toCal = Ext.create('Ext.container.Container',{
            width : 237,
            height: '100%',
            layout: 'fit'
        });
        self.toArea.add(this.toCal);

        this.toTimeArea =  this.timeLayout(this.part.TO, self.toArea);

        bodyCalArea.add(fromArea, self.spaceArea, self.toArea);

        /////////////////////////////////////////////////////////////////////////////

        // 하단
        ////////////////////////////////////////////////////////////////////////////////
        this.retriveBtn = this.createButton(common.Util.TR('Retrieve'));
        this.retriveBtn.addListener('render', function (){
            this.getEl().on('click', function(){

                var getFromTime;
                var getToTime;
                var format;


                switch(self.DisplayTime) {
                    case DisplayTimeMode.None :
                        format = Comm.dateFormat.NONE;
                        break;
                    case DisplayTimeMode.YM :
                        format = Comm.dateFormat.YM;
                        break;
                    case DisplayTimeMode.HMS :
                        format = Comm.dateFormat.HMS;
                        break;
                    case DisplayTimeMode.HM :
                        format = Comm.dateFormat.HM;
                        break;
                    case DisplayTimeMode.H :
                        format = Comm.dateFormat.H;
                        break;
                    default:
                        break;
                }
                var convertFromTime = new Date(self.tempFromTime).setSeconds(0);
                var convertToTime = new Date(self.tempToTime).setSeconds(0);

                getFromTime = Ext.Date.format(new Date(convertFromTime), format);
                getToTime   = Ext.Date.format(new Date(convertToTime),   format);

                var check = self.dateField.validation(getFromTime, getToTime);

                if (check === true) {

                    self.dateField.mainFromField.setValue(getFromTime);
                    self.dateField.mainToField.setValue(getToTime);

                    if (self.dateField.retriveClick != null) {
                        self.dateField.retriveClick(arguments);
                    } else {
                        var activeTab = Ext.getCmp('mainTab').getActiveTab();

                        if (activeTab.$className == 'config.config') {
                            var configTab = Ext.getCmp('cfg_tab_panel').getActiveTab();
                            configTab.query('[cls=config-retrieve-btn]')[0].getEl().dom.click();
                        } else {
                            activeTab.retrieve();
                        }
                    }
                    self.hide();
                }

                check       = null;
                format      = null;
                getFromTime = null;
                getToTime   = null;
            });
        });
        this.okBtn = this.createButton(common.Util.TR('OK'), '0 0 0 20');
        this.okBtn.addListener('render', function (){
            this.getEl().on('click', function(){
                // datePicker 에 있는 validation  사용
                var getFromTime;
                var getToTime;
                var format = '';
                switch(self.DisplayTime) {
                    case DisplayTimeMode.None :
                        format = Comm.dateFormat.NONE;
                        break;
                    case DisplayTimeMode.YM :
                        format = Comm.dateFormat.YM;
                        break;
                    case DisplayTimeMode.HMS :
                        format = Comm.dateFormat.HMS;
                        break;
                    case DisplayTimeMode.HM :
                        format = Comm.dateFormat.HM;
                        break;
                    case DisplayTimeMode.H :
                        format = Comm.dateFormat.H;
                        break;
                    default:
                        break;
                }
                var convertFromTime = new Date(self.tempFromTime).setSeconds(0);
                var convertToTime = new Date(self.tempToTime).setSeconds(0);

                getFromTime = Ext.Date.format(new Date(convertFromTime), format);
                getToTime   = Ext.Date.format(new Date(convertToTime),   format);

                var check = self.dateField.validation(getFromTime, getToTime);

                if(check === true) {
                    self.dateField.mainFromField.setValue(getFromTime);
                    self.dateField.mainToField.setValue(getToTime);

                    if (self.dateField.onCalenderValidFn != null) {
                        self.dateField.onCalenderValidFn();
                    }
                    else if(self.dateField.keyUpFn){
                        self.dateField.keyUpFn(new Date(getFromTime), new Date(getToTime));
                    }

                    self.hide();
                }

            });
        });

        this.cancelBtn = this.createButton(common.Util.TR('Cancel'));
        this.cancelBtn.addListener('render', function (){
            this.getEl().on('click', function(){
                self.hide();
            });
        });

        this.selectedFromArea = Ext.create('Ext.container.Container',{
            xtype: 'container',
            html : ''
        });
        this.seper = Ext.create('Ext.container.Container',{
            xtype: 'container',
            margin : '0 2 0 2',
            html : ' ~ '
        });
        this.selectedToArea = Ext.create('Ext.container.Container',{
            xtype: 'container',
            html : ''
        });

        bottomBtnArea.add(
            { xtype: 'tbspacer', width : 15 },
            this.retriveBtn,
            { xtype: 'tbspacer', flex : 1 },
            this.selectedFromArea,
            this.seper ,
            this.selectedToArea,
            this.okBtn,
            { xtype: 'tbspacer', width : 5 },
            this.cancelBtn,
            { xtype: 'tbspacer', width : 15 }
        );

        // 시간이 안보이는 경우
        if (this.DisplayTime == DisplayTimeMode.None || this.DisplayTime == DisplayTimeMode.YM) {
            this.fromTimeArea.timeArea.setVisible(false);
            this.toTimeArea.timeArea.setVisible(false);
            this.seper.setVisible(false);              // 하단 display 날짜 ~ 영역
            this.selectedToArea.setVisible(false);     // 하단 display 날짜 text 영역
            this.selectedFromArea.setVisible(false);  // 하단 display 날짜 text 영역
            this.setWidth(580);
        }

        if(!this.useRetrieve) {
            this.retriveBtn.setVisible(false);
        }

        ///////////////////////////////////////////////////////////////////////////////////
    },

    createButton: function(text, margin) {
        var btn  = Ext.create('Ext.container.Container',{
            html   : text,
            margin : margin,
            height: 26,
            width  : 80,
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
                border: '1px solid #CCC',
                borderLeft: 'none'
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

        var hour = 0;
        var hourAreaStyle = null;
        for (var ix = 0; ix < 4; ix ++) {
            // 시간 block 한줄 container
            var raw_con_h = Ext.create('Ext.container.Container',{
                width : '100%',
                layout: 'hbox',
                height: 26
            });

            for (var jx = 0; jx < 6; jx ++) {
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
                        render: function() {
                            this.getEl().on('click', function() {

                                self.selectHours(this._type, this);

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

        var minuteTitleBg = '#f5f5f5';
        var minuteLabelStyle = {'color': 'black'};
        if (this.DisplayTime == DisplayTimeMode.H) {
            minuteTitleBg = '#DEDEDE';
            minuteLabelStyle = {'color': 'grey'};
        }

        timeArea.add({
            xtype: 'container',
            width: '100%',
            flex: 1,

            style: {
                borderBottom: '1px solid #CCC',
                background: minuteTitleBg,
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
                text : common.Util.TR('Minute'),
                style: minuteLabelStyle
            }]
        });

        var raw_con_m = Ext.create('Ext.container.Container',{
            width: '100%',
            height: 26,
            layout: 'hbox'
        });
        var minuteList = ['0', '10', '20','30','40','50','59'];
        var minAreaStyle = { borderRight : '1px solid #CCC'};
        for( jx = 0; jx < 7; jx ++) {
            if (jx == 6) {
                minAreaStyle = null;
            } else if (jx == 0) {
                minAreaStyle = { borderRight : '1px solid #CCC',  borderLeft : '1px solid #CCC'};
            } else {
                minAreaStyle = { borderRight : '1px solid #CCC'};
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
                        // 시간 만 사용하는 경우  from은 0분만 to는 59 만 선택할수 있도록 set 해주기.
                        if (self.DisplayTime ==  DisplayTimeMode.H) {

                            _this.setDisabled(true);
                            _this.removeCls('timeNum');
                            _this.addCls('timeNumDisable');     // top n 에서 disable 효과 주기위해 추가 0608


                        } else {
                            // 시, 분 , 모두 사용 하는 경우.
                            _this.getEl().on('click', function() {

                                this.selectMinute(_this._type, _this);

                            }.bind(this));
                        }
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
        if(!target) {
             return;
        }
        target.removeCls('timeNum');
        target.addCls('timeNumActive');

        switch (type) {
            case this.part.FROM:
                if (this.selected.fromHour != null && this.selected.fromHour.hour != target.hour) {
                    this.deSelectBlock(this.selected.fromHour);
                }
                this.selected.fromHour = target;
                // 하단 시간 display update
                this.tempFromTime = new Date(this.tempFromTime).setHours(Number(target.hour));
                this.updateTime(this.part.FROM, this.tempFromTime);

                if(this.onFromHourSelect != null){
                    this.onFromHourSelect(this);
                }

                break;

            case this.part.TO:
                if (this.selected.toHour != null && this.selected.toHour.hour != target.hour) {
                    this.deSelectBlock(this.selected.toHour);
                }
                this.selected.toHour = target;
                // 하단 시간 display update
                this.tempToTime = new Date(this.tempToTime).setHours(Number(target.hour));
                this.updateTime(this.part.TO, this.tempToTime);
                break;

            default:
                break;
        }
    },

    selectMinute: function(type, target) {
        if (this.DisplayTime ==  DisplayTimeMode.H) {
            return;
        }

        if(!target) {
            return;
        }

        target.removeCls('timeNum');
        target.addCls('timeNumActive');


        switch (type) {
            case this.part.FROM:
                if (this.selected.fromMinute != null && this.selected.fromMinute.minute != target.minute) {
                    this.deSelectBlock(this.selected.fromMinute);
                }
                this.selected.fromMinute = target;
                // 하단 시간 display update
                this.tempFromTime = new Date(this.tempFromTime).setMinutes(Number(target.minute));
                this.updateTime(this.part.FROM, this.tempFromTime);
                break;

            case this.part.TO:
                if (this.selected.toMinute != null && this.selected.toMinute.minute != target.minute) {
                    this.deSelectBlock(this.selected.toMinute);
                }
                this.selected.toMinute = target;
                // 하단 시간 display update
                this.tempToTime = new Date(this.tempToTime).setMinutes(Number(target.minute));
                this.updateTime(this.part.TO, this.tempToTime);
                break;

            default:
                break;
        }
    },
    createCalender: function(type, targetId, time) {
        var self = this;
        var target = document.getElementById(targetId);
        var input  = document.createElement('input');
        input.setAttribute("hidden", "true");
        target.appendChild(input);

        var maxDate =  time;

        // 오늘 보다 1년 이후까지 선택할수 있다.
        if(self.useRangeOver) {
             maxDate.setFullYear(maxDate.getFullYear()+1);
        }


        var picker = new Pikaday({
            field: input,
            firstDay: 0,
            bound: false,
            minDate: new Date('2010-01-01'),
            //maxDate: time,
            maxDate: maxDate,
            _type: type,
            container: target,
            monthCalender: this.DisplayTime == DisplayTimeMode.YM,

            showMonthAfterYear: nation !== 'en',

            i18n: {
                previousMonth : common.Util.TR('Previous Month'),
                nextMonth     : common.Util.TR('Next Month'),
                months        : [common.Util.TR('January'),common.Util.TR('February'),common.Util.TR('March'),common.Util.TR('April'),common.Util.TR('May'),common.Util.TR('June'),common.Util.TR('July'),common.Util.TR('August'),common.Util.TR('September'),common.Util.TR('October'),common.Util.TR('November'),common.Util.TR('December')],
                weekdays      : [common.Util.TR('Sunday'),common.Util.TR('Monday'),common.Util.TR('Tuesday'),common.Util.TR('Wednesday'),common.Util.TR('Thursday'),common.Util.TR('Friday'),common.Util.TR('Saturday')],
                weekdaysShort : [common.Util.TR('Sun'),common.Util.TR('Mon'),common.Util.TR('Tue'),common.Util.TR('Wed'),common.Util.TR('Thu'),common.Util.TR('Fri'),common.Util.TR('Sat')]
            },

            onDraw: function(){
//                달력 이 6주가 되면 높이가 223 으로 늘어난다. 전체 panel의 size를 수정해준다.
                var maxHeight = 375;
                var minHeight = 350;

                // 버튼 사용 안하는 경우 영역 높이 조절.
                if(!self.useGoDayButton) {
                    maxHeight = maxHeight - 30;
                }

                if(this._o._type == self.part.FROM) {
                    if(this.el.clientHeight > 0) {
                        if(this.el.clientHeight >= 223) {
                            self.setHeight(maxHeight);
                            self.size1 = true;
                        } else if(this.el.clientHeight < 223) {
                            self.size1 = false;
                            if(self.size1 === false &&  self.size2 === false){
                                self.setHeight(minHeight);
                            }

                        }
                    }
                } else {
                    if(this.el.clientHeight > 0) {
                        if(this.el.clientHeight >= 223) {
                            self.setHeight(maxHeight);
                            self.size2 = true;
                        } else if(this.el.clientHeight < 223) {
                            self.size2 = false;
                            if(self.size1 === false &&  self.size2 === false){
                                self.setHeight(minHeight);
                            }
                        }
                    }
                }
            },
            onOpen: function() {

            },
            onSelect: function() {

                var _fullYear = this._d.getFullYear();
                var _month    = this._d.getMonth();
                var _date     = this._d.getDate();
                if (this._o._type == self.part.FROM) {

                    //console.log('FROM TIME2', this._d)
                    // display 날짜 update  year, month, date
                    self.tempFromTime = new Date(self.tempFromTime);

                    self.tempFromTime.setMonth(_month,1);
                    self.tempFromTime.setDate(_date);
                    self.tempFromTime.setFullYear(_fullYear);

                    //set Month  제일 마지막에 해야함.
                    //ex> 1월 31일 + setMonth(2월) -> 2월 31일 스크립트 valid check -> 3월 31일
                    //또는 setMonth 부분 setMonth(month,day)로 넣어주어야함.

                    self.updateTime(self.part.FROM, self.tempFromTime);

                    if( self.toCalender != undefined && self.rangeOneDay === true) {
                        // from 낳짜가 선택되면 to 낳짜도 선택
                        self.toCalender.setDate(new Date( self.tempFromTime));
                    }

                }
                else if (this._o._type == self.part.TO) {
                    //console.log('TO TIME1', date)
                    //console.log('TO TIME2', this._d)
                    self.tempToTime = new Date(self.tempToTime);
                    self.tempToTime.setMonth(_month,1);
                    self.tempToTime.setDate(_date);
                    self.tempToTime.setFullYear(_fullYear);

                    self.updateTime(self.part.TO, self.tempToTime);
                }
            },
            onChange: function(){
                var changeDate = this.calendars[0];
                if (this._o._type == self.part.FROM) {
                    self.tempFromTime = new Date(self.tempFromTime);

                    self.tempFromTime.setMonth(changeDate.month);
                    self.tempFromTime.setDate(1);
                    self.tempFromTime.setFullYear(changeDate.year);
                }
                else if (this._o._type == self.part.TO) {
                    self.tempToTime = new Date(self.tempToTime);

                    self.tempToTime.setMonth(changeDate.month);
                    self.tempToTime.setDate(1);
                    self.tempToTime.setFullYear(changeDate.year);
                }
            }
        });
        return picker;
    },

    createSetDateBtn: function(index, text) {
        var cssClass;

        if(index === 0){
            cssClass = 'setDateTodayBtn';
        } else if (index === 1){
            cssClass = 'setDateYesterBtn';
        }

        var setDateButton = Ext.create('Ext.container.Container',{
            width : 129,
            height: 25,
            cls   :cssClass,
            html  :'<div>'+text +'</div>'
        });
        return setDateButton;
    },
    // from 달력좌측 시. 분 set 해주기
    setFromTime: function(fromTime) {
        if (this.DisplayTime ==  DisplayTimeMode.H) {
            fromTime += ':00';
        }
        var fromHour  =  new Date(fromTime).getHours();
        var fromMinute = new Date(fromTime).getMinutes();
        this.selectHours(this.part.FROM, this.fromHours[fromHour]);

        // from 시간은
        var index = Math.floor(fromMinute/10); // 버림
        this.selectMinute(this.part.FROM, this.fromMinutes[index]);

    },
    // to 달력좌측 시. 분 set 해주기
    setToTime: function(toTime) {
        if (this.DisplayTime ==  DisplayTimeMode.H) {
            toTime += ':59';
        }
        var toHour  =  new Date(toTime).getHours();
        var toMinute = new Date(toTime).getMinutes();
        this.selectHours(this.part.TO, this.toHours[toHour]);

        var index = Math.ceil(toMinute/10);  // 올림.
        this.selectMinute(this.part.TO, this.toMinutes[index]);
    },

    updateTime: function(type, time) {
        if(type == this.part.FROM){
            this.selectedFromArea.update(this.timeFormatting(time));
        } else if(type == this.part.TO) {
            this.selectedToArea.update(this.timeFormatting(time));
        }
    },

    timeFormatting: function(time) {
        var self = this;
        var format = '';
        switch(self.DisplayTime) {
            case DisplayTimeMode.None :
                format = Comm.dateFormat.NONE;
                break;
            case DisplayTimeMode.YM :
                format = Comm.dateFormat.YM;
                break;
            case DisplayTimeMode.HMS :
                format = Comm.dateFormat.HMS;
                break;
            case DisplayTimeMode.HM :
                format = Comm.dateFormat.HM;
                break;
            case DisplayTimeMode.H :
                format = Comm.dateFormat.H;
                break;
            default:
                break;
        }
        return Ext.Date.format(new Date(time),format);
    },


    listeners: {
        render: function() {
            var today = new Date();

            if(this.comparisionMode) {
                today.setDate(today.getDate()-1);
            } else {
                today.setDate(today.getDate());
            }

            this.fromCalender = this.createCalender(this.part.FROM, this.fromCal.id, today);
            this.fromCalender.setDate(today);
            this.fromCalender.show();

            this.toCalender = this.createCalender(this.part.TO, this.toCal.id, today);
            this.toCalender.setDate(today);
            this.toCalender.show();

            // 여기서 보관된 시간을 사용하여 하단에 display 될 시간을 가공한다.
            // 날짜 선택시 setDate -> update
            // 시간 선택시 setHours -> update
            // 븐   선택시 setMinutes -> update
            this.tempFromTime = today;
            this.tempToTime   = today;

        },
        show: function() {
            // 화면이 보여질때
            this.updateTime(this.part.FROM, this.tempFromTime);
            this.updateTime(this.part.TO, this.tempToTime);

            if (this.DisplayTime ==  DisplayTimeMode.H) {
                this.startFromTime += ':00';
                this.startToTime   += ':59';
            }

            if (this.DisplayTime ==  DisplayTimeMode.None) {
                this.startFromTime += ' 00:00:00';
                this.startToTime   += ' 00:00:00';
            }


            this.fromCalender.setDate(Ext.util.Format.date(this.startFromTime, 'Y-m-d'));
            this.toCalender.setDate(Ext.util.Format.date(this.startToTime, 'Y-m-d'));

            var fromHeight = this.fromCalender.el.clientHeight;
            var toHeight = this.toCalender.el.clientHeight;
            var tempHeight;
            tempHeight = fromHeight > toHeight ?  fromHeight :  toHeight;

            var maxHeight = 375;
            var minHeight = 350;

            // 버튼 사용 안하는 경우 영역 높이 조절.
            if(!self.useGoDayButton) {
                maxHeight = maxHeight - 30;
            }


            if(tempHeight >= 223) {
                this.setHeight(maxHeight);
            } else if(tempHeight < 223) {
                this.setHeight(minHeight);
            }
        },
        hide: function () {
            // hide 될때 선택된 시간과 분을 지운다.
            var keys = Object.keys(this.selected);
            for(var ix = 0, len = keys.length; ix < len; ix++) {
                if(this.selected[keys[ix]] != null){
                    this.deSelectBlock(this.selected[keys[ix]]);
                    this.selected[keys[ix]] = null;
                }
            }

        }
    }

});
