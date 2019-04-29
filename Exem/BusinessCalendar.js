/**
 * Created by JONGHO on 2015-01-29.
 */
Ext.define('Exem.BusinessCalendar',{
    extend  : 'Ext.panel.Panel',
    width   : '100%',
    height  : '100%',
    floating: true,
    shadow  : false,
    layout  : 'fit',
    modal   : false,
    multiSelectDate: false,
    multiSelectCount: 0,
    isPreventInit: false,
    getSelectedDates: null,
    trendMode : false,
    bodyStyle: {
        border : '7px solid #000000',
        borderRadius : '8px',
        background   :'#000000'
    },
    selectUser      : 'base',
    selectType      : null,
    paramTextField  : null,
    numberOfMonths  : 1,
    mainCalendar    : 'left',
    isSelectMonthColor : null,
    clickMonthLabel : false,
    parent : null,

    constructor: function(){
        this.callParent(arguments);
    },
    listeners: {
        render: function() {
            this.fromCalendar = this.createCalendar( this.calArea.id, new Date());
            this.fromCalendar.show();
            // N:M에서 오버라이드 함수 수행
            if(this.isSelectMonthColor) {
                this.setSelectedMonthChangeColor();
            }
        },
        show: function() {
            // 선택된 날짜 초기화
            if(this.isPreventInit) {
                return ;
            }
            this.initializeCalendar();

            var userObj = this.usersObj[this.selectUser];

            // 보관 된 날짜를 비우고
            userObj.multiSelectArr.length = 0;
            // view 에서 선택된 날짜를 다시 넣어준다.
            if ( this.tempSelectArr.length != 0 ) {
                for ( var ix = 0; ix < this.tempSelectArr.length; ix++ ) {
                    userObj.multiSelectArr.push(this.tempSelectArr[ix]);
                }
            }

            this.fromCalendar.draw();
        }
    },

    // 달력에 선택된 날짜 해제 해주기.
    initializeCalendar: function() {
        var ix, jx, jxLen;
        var selectedList;

        for( ix = 0; ix < this.userColorList.length; ix++) {
            selectedList = $('.'+this.userColorList[ix]);

            for( jx = 0, jxLen = selectedList.length; jx < jxLen; jx++) {
                selectedList[jx].className = '';
            }
        }

        // 바로 전에 선택한 날짜가 들어가있다.
        if ( this.fromCalendar ) {
            this.fromCalendar._d = null;
        }
    } ,

    init: function() {

        // 사용자별 선택된 날짜 보관용
        this.usersObj = {};
        // 사용자별 선택 Color
        this.userColorList = [ 'is-selected', 'is-selected-second' ];

        // 달력에서 선택된 날짜 보관용
        this.multiSelectArr = [];
        // view 에서 넘겨줄때 사용하는 용도
        this.tempSelectArr  = [];

        this.userChange();

        this.background = Ext.create('Ext.container.Container',{
            width : '100%',
            height: '100%',
            layout: 'vbox',
            style : {
                borderRadius : this.trendMode ? null : '8px',
                background :'#FFFFFF'
            }
        });

        // 상단 yesterDay today 있는 영역
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
            layout: 'fit',
            padding : this.trendMode ? null : 10,
            style  : {
                //borderBottom: '1px solid #AAAAAA'
            }
        });

        var bottomBtnArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            layout : {
                type : 'hbox',
                align: 'middle',
                pack : 'end'
            },
            style  : {
                background: '#E1EAF3'
            },
            height: 40
        });

        if (this.trendMode) {
            this.background.add(bodyArea);
        } else {
            this.background.add(topArea, bodyArea, bottomBtnArea);
        }


        var titleTime = Ext.create('Ext.container.Container',{
            width : 100,
            height: 40,
            html  : '<div style="line-height: 40px; text-indent: 15px; font-size: 17px;  font-family: Roboto Condensed; font-weight: bold;">'+common.Util.TR('Select Date')+'</div>'
        });


        this.closeBtn = Ext.create('Ext.container.Container',{
            width : 40,
            height: 40,
            cls   : 'datePicker_close',
            listeners: {
                scope: this,
                render: function(_this) {
                    _this.el.on('click', function() {
                        this.hide();
                    }.bind(this));
                }
            }
        });

        topArea.add(titleTime);
        topArea.add({ xtype: 'tbspacer', flex: 1});
        topArea.add(this.closeBtn);


        this.calArea = Ext.create('Ext.container.Container',{
            width : 236,
            height: '100%',
            layout: 'fit'
        });


        this.okBtn      = this.createButton(common.Util.TR('OK'), '0 10 0 0', 64);
        this.okBtn.addListener('render', function (_this) {
            _this.getEl().on('click', function() {
                if (this.getSelectedDates != null) {
                    this.getSelectedDates(this.usersObj[this.selectUser].multiSelectArr) ;
                }
                this.hide();
            }.bind(this));
        }.bind(this));

        this.cancelBtn = this.createButton(common.Util.TR('Cancel'),'0 10 0 0', 64);
        this.cancelBtn.addListener('render', function (_this){
            _this.el.on('click', function() {
                this.usersObj[this.selectUser].multiSelectArr.length = 0;
                this.hide();
            }.bind(this));
        }.bind(this));

        bottomBtnArea.add(this.okBtn, this.cancelBtn);

        bodyArea.add(this.calArea);

        this.add(this.background);
    },

    createButton: function(text, margin, width) {
        return Ext.create('Ext.container.Container',{
            html   : text,
            margin : margin,
            height: 26,
            width  : width,
            cls    : 'button3d'
        });
    },

    allClearDate: function() {
        var ix;
        var userObj;
        var usersObjKeyList = Object.keys(this.usersObj);

        for ( ix = 0; ix < usersObjKeyList.length; ix++) {
            userObj = this.usersObj[usersObjKeyList[ix]];

            this._selectedColorChange( userObj, '' );
            userObj.multiSelectArr.length = 0;
        }
    },

    setSelectedMonthChangeColor: function() {
        var self = this;

        this.fromCalendar.findCurrentCalendar = function(clsName) {
            var cIdx, cArr;

            if(clsName) {
                cArr = clsName.split('-');
                cIdx = +(cArr[cArr.length-1]);
            }
            else {
                cIdx = 0;
            }

            return cIdx;
        };

        this.fromCalendar.gotoMonth = function(month, clsName) {
            self.clickMonthLabel = true;
            var currCalendarIdx = self.fromCalendar.findCurrentCalendar(clsName);

            if (!isNaN(month)) {


                this.calendars[0].month = parseInt(month, 10);
                this.adjustCalendars();

                if(self.usersObj && self.usersObj[self.selectUser] && self.usersObj[self.selectUser].selectType == 'month') {
                    self.fromCalendar.setDate(new Date(this.calendars[currCalendarIdx].year, this.calendars[currCalendarIdx].month, 1));
                }
            }

        };
    },

    createCalendar: function( targetId, time) {
        var self = this;
        var input = d3.select('#'+targetId).append('input')
            .attr('type', 'text')
            .attr('hidden', true);

        return new Pikaday({
            field: input[0][0],
            firstDay: 0,
            bound: false,
            minDate: new Date('2010-01-01'),
            maxDate: time,
            container: document.getElementById(targetId),
            mainCalendar  : this.mainCalendar,
            numberOfMonths: this.numberOfMonths,
            showMonthAfterYear: nation != 'en',

            i18n: {
                previousMonth : common.Util.TR('Previous Month'),
                nextMonth     : common.Util.TR('Next Month'),
                months        : [common.Util.TR('January'),common.Util.TR('February'),common.Util.TR('March'),common.Util.TR('April'),common.Util.TR('May'),common.Util.TR('June'),common.Util.TR('July'),common.Util.TR('August'),common.Util.TR('September'),common.Util.TR('October'),common.Util.TR('November'),common.Util.TR('December')],
                weekdays      : [common.Util.TR('Sunday'),common.Util.TR('Monday'),common.Util.TR('Tuesday'),common.Util.TR('Wednesday'),common.Util.TR('Thursday'),common.Util.TR('Friday'),common.Util.TR('Saturday')],
                weekdaysShort : [common.Util.TR('Sun'),common.Util.TR('Mon'),common.Util.TR('Tue'),common.Util.TR('Wed'),common.Util.TR('Thu'),common.Util.TR('Fri'),common.Util.TR('Sat')]
            },

            onDraw: function(cal) {
                cal = cal || this;
                // 달력 이 6주가 되면 높이가 223 으로 늘어난다. 전체 panel의 size를 수정해준다.
                if ( cal.el.clientHeight > 0 ) {
                    if ( self.trendMode ) {
                        // self.setHeight( cal.el.clientHeight >= 200 ? 225 : 200 );
                    } else {
                        // self.setHeight( cal.el.clientHeight >= 222 ? 340 : 315 );
                    }
                }

                var ix;
                var userObj;
                var usersObjKeyList = Object.keys(self.usersObj);

                self._removeColor(this._d);

                for ( ix = 0; ix < usersObjKeyList.length; ix++) {
                    userObj = self.usersObj[usersObjKeyList[ix]];
                    self._selectedColorChange(userObj);
                }

                if (self.parent && self.parent.setBusiness) {
                    self.parent.setBusiness();
                }
            },

            onOpen: function() {

            },
            onSelect: function(date) {
                var transDate = Ext.util.Format.date(date, 'Y-m-d');

                // 이미 조건에서 선택된 날짜는 선택하지 못하게 하기위함 (Single)
                if ( this.skipDate && this.skipDate == transDate ) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Compare date cannot be the same as base date.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
                    block = $(this.fromCalendar._o.container).find('td[data-day=' + new Date(date).getDate()+ ']')[0];
                    block.className = '';
                    return;
                }

                var ix, ixLen;
                var index;
                var selectDayList;
                var betweenDayList;
                var block   = null;
                var userObj = this.usersObj[this.selectUser];
                var multiSelectArr = userObj.multiSelectArr;

                if ( !this._duplicationValidCheck( [date] ) ) {
                    return;
                }

                if ( userObj.multiSelectDate ) {
                    if ( this.trendMode && this.getSelectedDates != null ) {
                        this.getSelectedDates(transDate) ;
                        return;
                    }

                    if(this.clickMonthLabel && this.isSelectMonthColor && userObj.selectType == 'month') {
                        multiSelectArr.length = 0;
                        this.clickMonthLabel = false;
                    }
                    index = multiSelectArr.indexOf(transDate);

                    if ( userObj.selectType ) {
                        // 클릭 시, week 혹은 weekDay 묶음(Bundle) 처리
                        selectDayList = this._getBundleDayList( userObj.selectType, date );

                        this._removeColor(date);

                        if ( !this._duplicationValidCheck(selectDayList) ) {
                            return;
                        }

                        multiSelectArr.length = 0;

                        if ( index < 0 ) {
                            for ( ix = 0, ixLen = selectDayList.length; ix < ixLen; ix++ ) {
                                userObj.lastSelectedDate = Ext.util.Format.date(selectDayList[ix], 'Y-m-d');
                                multiSelectArr.push(Ext.util.Format.date(selectDayList[ix], 'Y-m-d'));
                            }
                        }
                    } else {
                        // 클릭 시, 개별 처리
                        if ( index < 0 ) {
                            if ( !this._multiSelectMaxCheck() ) {
                                this._removeColor(date);
                                return;
                            }

                            if ( window.event.shiftKey && userObj.lastSelectedDate ) {
                                // Shift Key 사용한 경우
                                betweenDayList = this._getBetweenDays( userObj.lastSelectedDate, transDate );

                                if ( betweenDayList.length > this.multiSelectCount ) {
                                    this._removeColor(date);

                                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('You can select up to maximum %1 days', this.multiSelectCount), Ext.Msg.OK, Ext.MessageBox.WARNING);
                                    return;
                                }

                                userObj.multiSelectArr.length = 0;

                                for ( ix = 0, ixLen = betweenDayList.length; ix < ixLen; ix++ ) {
                                    userObj.lastSelectedDate = betweenDayList[ix];
                                    multiSelectArr.push(betweenDayList[ix]);
                                }
                            } else {
                                userObj.lastSelectedDate = transDate;
                                multiSelectArr.push(transDate);
                            }

                            this._setParamTextField(date);

                        } else {
                            // 기존 선택 되어 있을 경우, Date Color 제거
                            this._removeColor(date);
                            multiSelectArr.splice(index,1);
                        }
                    }
                }
                else {
                    if ( multiSelectArr[0] ) {
                        // 기존 선택 되어 있을 경우, Date Color 제거
                        this._removeColor(new Date(multiSelectArr[0]));
                        multiSelectArr.splice(0, 1);
                    }

                    userObj.lastSelectedDate = transDate;
                    multiSelectArr[0] = transDate;
                    this._setParamTextField(date);
                }

                if (self.parent && self.parent.initPopup) {
                    self.parent.initPopup();
                }

            }.bind(this)
        });
    },

    _multiSelectMaxCheck: function(addDateList) {
        if ( this.multiSelectCount > 0 && this.usersObj[this.selectUser].multiSelectArr.length + (addDateList ? addDateList.length : 0) >= this.multiSelectCount ) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('You can select up to maximum %1 days', this.multiSelectCount), Ext.Msg.OK, Ext.MessageBox.WARNING);

            return false;
        }

        return true;
    },

    _getBetweenDays: function( startDay, endDay ) {
        var dayList = [];

        startDay = +new Date(startDay);
        endDay   = +new Date(endDay);

        if ( startDay < endDay ) {
            while( startDay <= endDay ) {
                dayList.push(Ext.util.Format.date(new Date(startDay), 'Y-m-d'));
                startDay += 86400000;
            }
        } else {
            while( startDay >= endDay ) {
                dayList.push(Ext.util.Format.date(new Date(startDay), 'Y-m-d'));
                startDay -= 86400000;
            }
        }

        return dayList;
    },

    _duplicationValidCheck: function(dateList) {
        var ix, jx, jxLen;
        var userObj;
        var usersObjKeyList = Object.keys(this.usersObj);

        // Date 중복 체크 여부
        for ( ix = 0; ix < usersObjKeyList.length; ix++ ) {
            if ( this.selectUser == usersObjKeyList[ix] ) {
                continue;
            }

            userObj = this.usersObj[usersObjKeyList[ix]];

            for ( jx = 0, jxLen = dateList.length; jx < jxLen; jx++ ) {
                if ( userObj.multiSelectArr.indexOf(Ext.util.Format.date(dateList[jx], 'Y-m-d')) > -1 ) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Compare date cannot be the same as base date.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return false;
                }
            }
        }

        return true;
    },

    _getBundleDayList: function( type, date ) {
        var ix, ixLen;
        var tmpDay;
        var maxDay = this.fromCalendar._o.maxDate;
        var firstDayOfMonth;
        var lastDayOfMonth;
        var dayNum  = +new Date(date);
        var dayIdx  = new Date(date).getDay();
        var dayList = [];
        var plusCnt = 0;
        var minusCnt= dayIdx;

        var getPlusDayObj = {
            1: new Date(dayNum + 86400000),
            2: new Date(dayNum + 172800000),
            3: new Date(dayNum + 259200000),
            4: new Date(dayNum + 345600000),
            5: new Date(dayNum + 432000000),
            6: new Date(dayNum + 518400000)
        };

        var getMinusDayObj = {
            1: new Date(dayNum - 86400000),
            2: new Date(dayNum - 172800000),
            3: new Date(dayNum - 259200000),
            4: new Date(dayNum - 345600000),
            5: new Date(dayNum - 432000000),
            6: new Date(dayNum - 518400000)
        };

        if ( type == 'weekDay' ) {
            for ( ix = 1; ix <= 5; ix++ ) {
                if ( ix < dayIdx ) {
                    minusCnt--;
                    dayList.push(getMinusDayObj[minusCnt]);
                    this._beforeCalOpenCheck( date, getMinusDayObj[minusCnt] );
                } else if ( ix == dayIdx ) {
                    dayList.push(date);
                } else {
                    plusCnt++;
                    if ( getPlusDayObj[plusCnt] > maxDay ) {
                        break;
                    }
                    dayList.push(getPlusDayObj[plusCnt]);
                }
            }
        } else if ( type == 'week' ) {
            for ( ix = 0; ix <= 6; ix++ ) {
                if ( ix < dayIdx ) {
                    this._beforeCalOpenCheck( date, getMinusDayObj[minusCnt] );
                    dayList.push(getMinusDayObj[minusCnt]);
                    minusCnt--;
                } else if ( ix == dayIdx ) {
                    dayList.push(date);
                } else {
                    plusCnt++;
                    if ( getPlusDayObj[plusCnt] > maxDay ) {
                        break;
                    }
                    dayList.push(getPlusDayObj[plusCnt]);
                }
            }
        } else if ( type == 'month' ) {
            firstDayOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1);
            lastDayOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth()+1, 0);

            for ( ix = 0, ixLen = lastDayOfMonth.getDate(); ix < ixLen; ix++ ) {
                tmpDay = new Date(+firstDayOfMonth + (86400000*ix));

                if ( tmpDay > maxDay ) {
                    break;
                }

                dayList.push(tmpDay);
            }
        }

        return dayList;
    },

    _beforeCalOpenCheck: function(date, comparisonDay) {
        // Overriding Method
    },

    _setParamTextField: function(date) {
        if ( this.selectUser == 'base' && this.paramTextField ) {
            this.paramTextField.setValue(Ext.util.Format.date(date, common.Util.getLocaleType(DisplayTimeMode.None)));
        }
    },

    _removeColor: function(date) {
        var block = this._findBlock(date);

        if ( block ) {
            block.className = '';
        }
    },

    _findBlock: function(date) {
        if ( !date ) {
            return;
        }

        var ix, jx;
        var userObj;
        var usersObjKeyList = Object.keys(this.usersObj);
        var calList     = this.fromCalendar.el.children;
        var calInfoList = this.fromCalendar.calendars;

        for ( ix = 0; ix < usersObjKeyList.length; ix++) {
            userObj = this.usersObj[usersObjKeyList[ix]];

            for ( jx = 0; jx < calInfoList.length; jx++) {
                if ( calInfoList[jx].year == new Date(Ext.util.Format.date(date, 'Y-m-d')).getFullYear() && calInfoList[jx].month == new Date(Ext.util.Format.date(date, 'Y-m-d')).getMonth() ) {
                    return calList[jx].querySelector('td[data-day="' + new Date(Ext.util.Format.date(date, 'Y-m-d')).getDate() + '"]');
                }
            }
        }

        calList = null;
    },

    _selectedColorChange: function( userObj, color ) {
        var ix, jx, jxLen;
        var block;
        var calList = this.fromCalendar.el.children;
        var calInfoList = this.fromCalendar.calendars;

        for ( ix = 0; ix < calInfoList.length; ix++ ) {
            for ( jx = 0, jxLen = userObj.multiSelectArr.length; jx < jxLen; jx++ ) {
                if ( calInfoList[ix].year == new Date(userObj.multiSelectArr[jx]).getFullYear() && calInfoList[ix].month == new Date(userObj.multiSelectArr[jx]).getMonth() ) {
                    block = calList[ix].querySelector('td[data-day="' + new Date(userObj.multiSelectArr[jx]).getDate() + '"]');

                    if ( block ) {
                        block.className = color || userObj.color;
                    }
                }
            }
        }

        calList = null;
    },

    userChange: function(user) {
        this.selectUser = user || this.selectUser;

        this.usersObj[this.selectUser] = this.usersObj[this.selectUser] || {
            color           : this.userColorList[Object.keys(this.usersObj).length],
            selectType      : this.selectType,
            multiSelectDate : this.multiSelectDate,
            lastSelectedDate: null,
            multiSelectArr  : []
        };

        this.multiSelectArr = this.usersObj[this.selectUser].multiSelectArr;
    }
});
