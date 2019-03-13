/**
 * Created by Kang on 2017-07-05.
 */

Ext.define('Exem.ReportScheduleBaseForm', {
    extend : 'Exem.Form',
    layout : 'vbox',

    parent     : null,
    reportType : 1,     // 0: Custom, 1: Daily, 2: Long-Term

    constructor: function() {
        this.callParent(arguments);
        this._baseInit();
    },

    _baseInit: function() {
        this._initBaseProperty();
        this._initBaseLayout();
    },

    _initBaseProperty: function() {
        this.DEFAULT_DAY_OF_WEEK = 124;
        this.DEFAULT_LABEL_WIDTH = 98;

        this.intervalInfo = {
            intervalUnit     : 1,   // 0: Once, 1: Daily, 2: Weekly, 3: Monthly, 4: Yearly
            intervalValue    : 1,
            intervalDayOfWeek: this.DEFAULT_DAY_OF_WEEK
        };

        this.pastCheckDataObj = {
            // 0: last, 1: this
            1: [
                { name: 'Yesterday', value: 1 },
                { name: 'Today'    , value: 0 }
            ],
            2: [
                { name: 'Last Week', value: 1 },
                { name: 'This Week', value: 0 }
            ],
            3: [
                { name: 'Last Month', value: 1 },
                { name: 'This Month', value: 0 }
            ]
        };

        this.storeNumberData = [];

        for ( var ix = 1; ix < 32; ix++ ) {
            this.storeNumberData.push({ name: ix, value: ix });
        }

        this.storeWeekData = [
            { name: 'Mon', value: 64 },
            { name: 'Tue', value: 32 },
            { name: 'Wed', value: 16 },
            { name: 'Thu', value: 8  },
            { name: 'Fri', value: 4  },
            { name: 'Sat', value: 2  },
            { name: 'Sun', value: 1  }
        ];

        this.scheduleState = this.scheduleState ? true : false;
    },

    _initBaseLayout: function() {
        this.repeatsCbBox = Ext.create('Exem.ComboBox', {
            width        : 95,
            fieldLabel   : '',
            displayField : 'name',
            valueField   : 'value',
            value        : 1,
            store        : Ext.create( 'Ext.data.Store', {
                fields : [ 'name', 'value' ],
                data   : [
                    { name: 'Daily'  , value: 1 }
                    // Weekly, Monthly 가 아직 작업이 끝나지 않아서 주석처리.
                    //{ name: 'Weekly' , value: 2 },
                    //{ name: 'Monthly', value: 3 }
                ]
            }),
            listeners : {
                select: function(me) {
                    var intervalUnit = me.getValue();
                    this.intervalInfo.intervalUnit = intervalUnit;

                    this.transLayoutByIntervalUnit( intervalUnit );
                }.bind(this)
            }
        });

        this.startDatePicker = Ext.create('Exem.DatePicker', {
            width               : 98,
            DisplayTime         : DisplayTimeMode.None,
            rangeOneDay         : false,
            useRetriveBtn       : false,
            labelYPos           : 7,
            keyUpCheck          : true,
            singleField         : true,
            comparisionMode     : true,
            useRangeOver        : true,
            getPluginMaskFormat : this._getStartPluginMaskFormat,
            keyUpFn : function ( fromTime ) {
                if ( this.repeatsCbBox.getValue() == 3 ) {
                    this.sendDayCbBox.setValue(+Ext.Date.format(new Date(fromTime), 'd'));
                }
            }.bind(this)
        });

        this.endsCbBox = Ext.create('Exem.ComboBox', {
            width        : 110,
            labelWidth   : 40,
            margin       : '0 0 0 10',
            fieldLabel   : common.Util.TR('Ends'),
            displayField : 'name',
            valueField   : 'value',
            value        : 'never',
            store        : Ext.create( 'Ext.data.Store', {
                fields : [ 'name', 'value' ],
                data   : [
                    { name: 'Never', value: 'never' },
                    { name: 'On'   , value: 'on'    }
                ]
            }),
            listeners : {
                select: function(me) {
                    switch ( me.getValue() ) {
                        case 'never':
                            this.endDatePicker.mainFromField.disable();
                            break;
                        case 'on':
                            this.endDatePicker.mainFromField.enable();
                            this.endDatePicker.mainFromField.setValue( Ext.Date.format(new Date(), common.Util.getLocaleType(DisplayTimeMode.None)) );
                            break;
                        default: break;
                    }
                }.bind(this)
            }
        });

        this.endDatePicker = Ext.create('Exem.DatePicker', {
            width               : 140,
            margin              : '0 0 0 10',
            DisplayTime         : DisplayTimeMode.None,
            rangeOneDay         : false,
            useRetriveBtn       : false,
            labelYPos           : 7,
            keyUpCheck          : true,
            singleField         : true,
            useRangeOver        : true,
            getPluginMaskFormat : this._getEndPluginMaskFormat,
            keyUpFn : function (fromTime, toTime) {}.bind(this)
        });

        this.sendDayLabel = Ext.create('Ext.form.Label', {
            text   : common.Util.TR('Day of week'),
            width  : this.DEFAULT_LABEL_WIDTH,
            margin : '3 0 0 0'
        });

        this.sendDayCheckField = Ext.create('Exem.CheckList', {
            width        : 360,
            margin       : '-3 0 0 0',
            instanceList : [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ],
            listeners    : {
                afterrender: function() {
                    this.sendDayCheckField.setCheckValue( [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri' ], true);
                }.bind(this)
            },
            checkedChange: function (selectedList) {
                this.intervalInfo.intervalDayOfWeek = selectedList.reduce( function(initValue, nextValue) {
                    var convertObj = {
                        Mon : 64,
                        Tue : 32,
                        Wed : 16,
                        Thu : 8,
                        Fri : 4,
                        Sat : 2,
                        Sun : 1
                    };

                    return initValue + convertObj[nextValue];
                }, 0);
            }.bind(this)
        });

        this.sendDayCbBox = Ext.create('Exem.ComboBox', {
            displayField: 'name',
            valueField  : 'value',
            value       : 64,
            margin      : '0 10 0 0',
            store       : Ext.create( 'Ext.data.Store', {
                fields: [ 'name', 'value' ],
                data  : this.storeWeekData
            }),
            listeners : {
                select: function(me) {
                    if ( this.repeatsCbBox.getValue() == 3 ) {
                        // Monthly 일 경우, intervalDayOfWeek 를 사용하지않고 start date 의 day 를 가지고 스케줄링한다
                        this.intervalInfo.intervalDayOfWeek = 0;

                        var monthlyFromDate = Ext.Date.format( new Date( new Date(this.startDatePicker.mainFromField.getValue()).setDate(me.getValue()) ), 'Y-m-d' );
                        this.startDatePicker.mainFromField.setValue(monthlyFromDate);
                    } else {
                        this.intervalInfo.intervalDayOfWeek = me.getValue();
                    }
                }.bind(this)
            }
        });

        this.specificDayRadioField = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('Specific Day'),
            itemId   : 'specificDayRadioField',
            name     : 'sendTypeRadioField',
            checked  : true,
            listeners: {
                change: function( me, newValue ) {
                    if ( newValue ) {
                        this.sendDayCbBox.setDisabled(false);
                    }
                }.bind(this)
            }
        });

        this.specificDayRadioCon = Ext.create('Ext.form.FieldContainer', {
            defaultType : 'radiofield',
            width       : 100,
            margin      : '1 0 0 0',
            layout      : 'fit',
            hidden      : true,
            items       : this.specificDayRadioField
        });

        this.endOfMonthRadioField = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('The end of the Month'),
            itemId   : 'endOfMonthRadioField',
            name     : 'sendTypeRadioField',
            listeners: {
                change: function( me, newValue ) {
                    if ( newValue ) {
                        this.sendDayCbBox.setDisabled(true);
                    }
                }.bind(this)
            }
        });

        this.endOfMonthRadioCon = Ext.create('Ext.form.FieldContainer', {
            defaultType : 'radiofield',
            width       : 165,
            margin      : '1 0 0 5',
            layout      : 'fit',
            hidden      : true,
            items       : this.endOfMonthRadioField
        });

        this.sendTimeWindow = Ext.create('Exem.TimePicker',{
            itemId        : 'sendTimeWindow',
            width         : 120,
            height        : '100%',
            margin        : '0 0 0 5',
            useSingleTime : true,
            showRetrieveBtn : false,
            okValid  : function() { return true; },  // override 동작 막기
            validCheck : function(){ return true; }, // override 동작 막기
            listeners: {
                afterlayout: function(me) {
                    me.fromLabel.setMargin('0 3 0 0');
                    me.fromLabel.el.dom.style.color = '';
                    me.fromLabel.el.dom.style.fontSize = '12px';
                    me.fromLabel.show();

                    me.fromTimeBg.setWidth(78);
                    me.fromTimeField.setWidth(45);
                    me.fromTimeField.setValue(Ext.Date.format(new Date(), 'H:i'));
                }
            }
        });

        this.rangeStartCbBox = Ext.create('Exem.ComboBox', {
            displayField: 'name',
            valueField  : 'value',
            value       : 64,
            store       : Ext.create( 'Ext.data.Store', {
                fields: [ 'name', 'value' ],
                data  : this.storeWeekData
            })
        });

        this.tildeLabel = Ext.create('Ext.form.Label', {
            text   : '~',
            width  : 10,
            margin : '7 0 0 10'
        });

        this.rangeEndCbBox = Ext.create('Exem.ComboBox', {
            margin      : '0 10 0 10',
            displayField: 'name',
            valueField  : 'value',
            value       : 4,
            store       : Ext.create( 'Ext.data.Store', {
                fields: [ 'name', 'value' ],
                data  : this.storeWeekData
            })
        });

        this.pastCheckCbBox = Ext.create('Exem.ComboBox', {
            width       : 95,
            displayField: 'name',
            valueField  : 'value',
            value       : 'yesterday',
            store       : Ext.create( 'Ext.data.Store', {
                fields: [ 'name', 'value' ],
                data  : this.pastCheckDataObj['Daily']
            })
        });

        this.schedulingLabel = Ext.create('Ext.form.Label', {
            text   : common.Util.TR('Scheduling'),
            itemId : 'scheduleStateLabel',
            width  : 80,
            height : 22,
            margin : '5 0 0 21'
        });

        this.scheduleToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            itemId : 'scheduleToggle',
            height : 22,
            margin : '2 0 7 0',
            onText : common.Util.TR('Running'),
            offText: common.Util.TR('Stop'),
            state  : this.scheduleState,
            resizeHandle: true,
            offLabelCls : 'x-toggle-slide-label-off2'
        });

        var scheduleInfoFieldSet = Ext.create('Ext.form.FieldSet', {
            title      : '<span style="font-size:14px;">'+ common.Util.TR('Schedule') +'</span>',
            itemId     : 'scheduleInfoFieldSet',
            width      : '100%',
            height     : 175,
            layout     : 'vbox',
            defaultType: 'textfield',
            listeners  : {
                afterlayout: function() {
                    this.endDatePicker.mainFromField.disable();
                    this.transLayoutByIntervalUnit( this.intervalInfo.intervalUnit );
                }.bind(this)
            },
            items: [
                Ext.create('Ext.container.Container', {
                    width    : '100%',
                    height   : 24,
                    layout   : 'hbox',
                    margin   : '11 0 0 3',
                    defaults : { height: 21 },
                    items    : [
                        Ext.create('Ext.form.Label', {
                            text   : common.Util.TR('Repeats'),
                            width  : this.DEFAULT_LABEL_WIDTH,
                            margin : '3 0 0 0'
                        }),
                        this.repeatsCbBox,
                        this.schedulingLabel,
                        this.scheduleToggle
                    ]
                }),
                Ext.create('Ext.container.Container', {
                    width    : '100%',
                    height   : 24,
                    layout   : 'hbox',
                    margin   : '11 0 0 3',
                    defaults : { height: 21 },
                    items    : [
                        Ext.create('Ext.form.Label', {
                            text   : common.Util.TR('Starts on'),
                            width  : this.DEFAULT_LABEL_WIDTH,
                            margin : '3 0 0 0'
                        }),
                        this.startDatePicker,
                        this.endsCbBox,
                        this.endDatePicker
                    ]
                }),
                Ext.create('Ext.container.Container', {
                    width    : '100%',
                    height   : 24,
                    layout   : 'hbox',
                    margin   : '11 0 0 3',
                    defaults : { width : 56, height: 21 },
                    items    : [
                        this.sendDayLabel,
                        this.sendDayCheckField,
                        this.specificDayRadioCon,
                        this.sendDayCbBox,
                        this.endOfMonthRadioCon,
                        this.sendTimeWindow
                    ]
                }),
                Ext.create('Ext.container.Container', {
                    width    : '100%',
                    height   : 24,
                    layout   : 'hbox',
                    margin   : '11 0 0 3',
                    defaults : { width : 56, height: 21 },
                    items    : [
                        Ext.create('Ext.form.Label', {
                            text   : common.Util.TR('Report range'),
                            width  : this.DEFAULT_LABEL_WIDTH,
                            margin : '3 0 0 0'
                        }),
                        this.rangeStartCbBox,
                        this.tildeLabel,
                        this.rangeEndCbBox,
                        this.pastCheckCbBox
                    ]
                })
            ]
        });

        this.add( scheduleInfoFieldSet );
    },

    _getStartPluginMaskFormat: function() {
        // Override Function
        return {
            fieldWidth     : 75,    // 120
            fromgFieldX    : 0,
            fromLabelWidth : 0,
            fromLabel      : '',
            fromIconPosX   : 210,
            toFieldX       : 0,
            toLabelX       : 0,
            toLabelWidth   : 0,
            toLabel        : '',
            toIconPosX     : 0,
            toFieldY       : 0,
            toIconPosY     : 0,
            displayFormat  : this.getMaskType().NONE
        };
    },

    _getEndPluginMaskFormat: function() {
        // Override Function
        return {
            fieldWidth     : 130,
            fromgFieldX    : 0,
            fromLabelWidth : 50,
            fromLabel      : common.Util.TR('Ends on'),
            fromIconPosX   : 265,
            toFieldX       : 0,
            toLabelX       : 0,
            toLabelWidth   : 0,
            toLabel        : '',
            toIconPosX     : 0,
            toFieldY       : 0,
            toIconPosY     : 0,
            displayFormat  : this.getMaskType().NONE
        };
    },

    _getConvertIntervalDayOfWeek: function( value ) {
        if ( !value ) {
            return null;
        }

        var ix, dayNum;
        var resultStr = '';
        var convertObj = {
            6: 'Mon',
            5: 'Tue',
            4: 'Wed',
            3: 'Thu',
            2: 'Fri',
            1: 'Sat',
            0: 'Sun'
        };

        for ( ix = 6; ix >= 0; ix-- ) {
            dayNum = value & ( 1 << ix );

            if ( dayNum ) {
                if ( resultStr ) {
                    resultStr += ', ';
                }

                resultStr += convertObj[ix];
            }
        }

        return resultStr;
    },

    transLayoutByIntervalUnit: function( intervalUnit ) {
        // Repeats ( Daily, Weekly, Monthly ) 에 따라 하위 Component 들의 show, hide 와 data 변경
        var sendDayStore    = this.sendDayCbBox.getStore();
        var rangeStartStore = this.rangeStartCbBox.getStore();
        var rangeEndStore   = this.rangeEndCbBox.getStore();
        var pastCheckStore  = this.pastCheckCbBox.getStore();

        this.sendDayCheckField.hide();
        this.sendDayCbBox.hide();
        this.specificDayRadioCon.hide();
        this.endOfMonthRadioCon.hide();
        this.rangeStartCbBox.hide();
        this.tildeLabel.hide();
        this.rangeEndCbBox.hide();

        switch ( intervalUnit ) {
            case 1:
                this.sendDayLabel.setText(common.Util.TR('Day(s) of week'));
                this.sendDayCheckField.show();

                //Check된 필드 값으로 intervalDayOfWeek값 구하기.
                this.intervalInfo.intervalDayOfWeek = 0;
                for(var ix = 0, ixLen = this.storeWeekData.length; ix < ixLen; ix++){
                    if(this.sendDayCheckField.selectedValue.indexOf(this.storeWeekData[ix].name) > -1){
                        this.intervalInfo.intervalDayOfWeek += this.storeWeekData[ix].value;
                    }
                }

                break;
            case 2:
                this.sendDayLabel.setText(common.Util.TR('Day of week'));
                this.sendDayCbBox.show();
                this.rangeStartCbBox.show();
                this.tildeLabel.show();
                this.rangeEndCbBox.show();

                //defult값을 mon으로 설정
                this.intervalInfo.intervalDayOfWeek = 64;

                sendDayStore.loadData(this.storeWeekData);
                rangeStartStore.loadData(this.storeWeekData);
                rangeEndStore.loadData(this.storeWeekData);

                this.sendDayCbBox.setValue(sendDayStore.getAt(0).get(this.sendDayCbBox.valueField));
                this.rangeEndCbBox.setValue(rangeEndStore.getAt(4).get(this.rangeEndCbBox.valueField));
                break;
            case 3:
                this.sendDayLabel.setText(common.Util.TR('Day of month'));
                this.sendDayCbBox.show();
                this.specificDayRadioCon.show();
                this.endOfMonthRadioCon.show();
                this.rangeStartCbBox.show();
                this.tildeLabel.show();
                this.rangeEndCbBox.show();

                // Monthly 일 경우, intervalDayOfWeek 를 사용하지않고 start date 의 day 를 가지고 스케줄링한다
                this.intervalInfo.intervalDayOfWeek = 0;

                sendDayStore.loadData(this.storeNumberData);
                rangeStartStore.loadData(this.storeNumberData);
                rangeEndStore.loadData(this.storeNumberData);

                this.sendDayCbBox.setValue(+Ext.Date.format(new Date(this.startDatePicker.mainFromField.getValue()), 'd'));
                this.rangeEndCbBox.setValue(rangeEndStore.getAt(30).get(this.rangeEndCbBox.valueField));
                break;
            default: break;
        }

        pastCheckStore.loadData(this.pastCheckDataObj[intervalUnit]);

        this.rangeStartCbBox.setValue(rangeStartStore.getAt(0).get(this.rangeStartCbBox.valueField));
        this.pastCheckCbBox.setValue(pastCheckStore.getAt(0).get(this.pastCheckCbBox.valueField));
    },

    /**
     * @param paramObj{Object}
     *  reportType       , startDate      , endDate
     *  intervalUnit     , intervalValue  , intervalDayOfWeek
     *  reportStartPoint , reportEndPoint , reportPastFlag
     * */
    _setSchedule: function( paramObj ) {
        if ( !paramObj ) {
            return false;
        }

        var reportType        = paramObj['reportType']        || 1;
        var startDate         = paramObj['startDate']         || Ext.Date.format(new Date(), 'Y-m-d');
        var endDate           = paramObj['endDate']           || null;
        var intervalUnit      = paramObj['intervalUnit']      || 1;
        var intervalValue     = paramObj['intervalValue']     || 1;
        var intervalDayOfWeek = paramObj['intervalDayOfWeek'] || (intervalUnit == 3 ? 0 : this.DEFAULT_DAY_OF_WEEK);
        //var retentionValue    = paramObj['retentionValue']    || 30;
        var reportStartPoint  = paramObj['reportStartPoint']  || 64;    // Monday
        var reportEndPoint    = paramObj['reportEndPoint']    || 4;     // Friday
        var reportPastFlag    = paramObj['reportPastFlag'] == null ? 1 : paramObj['reportPastFlag'];
        var isEndOfTheMonth   = paramObj['isEndOfTheMonth']   || 0;     // Friday

        this.reportType = reportType;

        this.transLayoutByIntervalUnit( intervalUnit );

        this.repeatsCbBox.setValue(intervalUnit);
        this.startDatePicker.mainFromField.setValue(Ext.Date.format(new Date(startDate), 'Y-m-d'));
        this.sendTimeWindow.fromTimeField.setValue(Ext.Date.format(new Date(startDate), 'H:i'));

        if ( endDate ) {
            this.endsCbBox.setValue('on');
            this.endDatePicker.mainFromField.enable();
            this.endDatePicker.mainFromField.setValue(Ext.Date.format(new Date(endDate), 'Y-m-d'));
        } else {
            this.endsCbBox.setValue('never');
            this.endDatePicker.mainFromField.disable();
        }

        if ( isEndOfTheMonth ) {
            this.specificDayRadioField.setValue(false);
            this.sendDayCbBox.setDisabled(true);
            this.endOfMonthRadioField.setValue(true);
        }

        this.intervalInfo = {
            intervalUnit     : intervalUnit,
            intervalValue    : intervalValue,
            intervalDayOfWeek: intervalDayOfWeek
        };

        switch ( intervalUnit ) {
            case 1: // Daily
                this.sendDayCheckField.selectedValue.length = 0;

                if ( intervalDayOfWeek == 127 ) {
                    this.sendDayCheckField.setCheckValue( null, null, true);
                } else {
                    this.sendDayCheckField.setCheckValue( (this._getConvertIntervalDayOfWeek(intervalDayOfWeek)).split(', '), true);
                }
                break;
            case 2: // Weekly
                this.sendDayCbBox.setValue(intervalDayOfWeek);
                this.rangeStartCbBox.setValue(reportStartPoint);
                this.rangeEndCbBox.setValue(reportEndPoint);
                break;
            case 3: // Monthly
                this.sendDayCbBox.setValue(+Ext.Date.format(new Date(startDate), 'd'));
                this.rangeStartCbBox.setValue(reportStartPoint);
                this.rangeEndCbBox.setValue(reportEndPoint);
                break;
            default: break;
        }

        this.pastCheckCbBox.setValue(reportPastFlag);
    },

    _getSchedule: function() {
        var startDate        = this.startDatePicker.mainFromField.getValue();
        var endTimeCbBoxData = this.endsCbBox.getValue();
        var endDate          = null;
        var sendTimeWindow   = this.sendTimeWindow.fromTimeField.getValue();
        var scheduleState    = this.scheduleToggle.getValue() ? 1 : 0;

        if ( endTimeCbBoxData == 'on' && !this.endDatePicker.isDisabled() ) {
            endDate = Ext.Date.format(new Date(this.endDatePicker.mainFromField.getValue()), 'Y-m-d 23:59:59');
        }

        return {
            startDate         : Ext.Date.format(new Date(startDate), 'Y-m-d ') + sendTimeWindow + ':00',
            endDate           : endDate,
            endTimeCbBoxData  : endTimeCbBoxData,
            intervalValue     : this.intervalInfo.intervalValue,
            intervalUnit      : this.intervalInfo.intervalUnit,
            intervalDayOfWeek : this.intervalInfo.intervalDayOfWeek,
            reportStartPoint  : this.rangeStartCbBox.getValue(),
            reportEndPoint    : this.rangeEndCbBox.getValue(),
            reportPastFlag    : this.pastCheckCbBox.getValue(),
            isEndOfTheMonth   : this.endOfMonthRadioField.getValue() ? 1 : 0,
            scheduleState     : scheduleState
        };
    }

});
