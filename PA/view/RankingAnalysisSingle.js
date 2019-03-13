Ext.define('view.RankingAnalysisSingle', {
    extend: 'Exem.FormOnCollapseCondition',
    minWidth: 1080,
    width: '100%',
    height: '100%',
    title: '',
    analysisMode : '',

    constructor: function() {
        this.callParent(arguments);
        this.init();
    },

    init: function() {
        if(!this.analysisMode) {
            console.debug('Not Initialized Analysis Mode');
            return false;
        }

        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.findComboData = [];
        this.retrieveFlag    = false;
        this.agentList       = { id : [], text : [] };
        this.currentCalendar = null;

        this.treeData = null;

        this.startTime = '00:00';
        this.endTime   = '23:59';

        this.gridDateList = [];
        this.baseGridIdx  = 0;

        this.isBizGrpList = Comm.bizGroups.length;
    },

    initLayout: function() {
        this.baseInit();

        if(this.extCondition) {
            this.conditionBackground.addListener('afterlayout', function() {
                if(!this.singleViewInit) {
                    this.singleViewInit = true;
                    this.extCondition(this);
                }
            }.bind(this));
        }

        this.conditionAgentLayout(this.conditionBackground);
        this.conditionDetailLayout(this.conditionBackground);
        this.conditionDateLayout(this.conditionBackground);
        this.conditionCalendarLayout(this.conditionBackground);

        this.workArea = null;

        if(this.analysisMode === 'TXN') {
            this.workArea = Ext.create('view.TxnRankingAnalysisWork', {
                width : '100%',
                height : '100%',
                minHeight : 890
            });
        } else if(this.analysisMode == 'SQL') {
            this.workArea = Ext.create('view.SqlRankingAnalysisWork', {
                width : '100%',
                height : '100%',
                minHeight : 890
            });
        }

        this.workBackground.add(this.workArea);
    },


    conditionAgentLayout: function(target) {

        this.wasDBTreeCombo = Ext.create('Exem.wasDBTreeCombo', {
            width : 250,
            height : 300,
            style : {
                margin : '15px 0 0 15px'
            }
        });

        target.add(this.wasDBTreeCombo);
    },

    conditionDetailLayout: function(target) {
        var self = this;

        self.detailArea = Ext.create('Ext.container.Container', {
            width : 260,
            height: '100%',
            layout: {
                type : 'vbox',
                align : 'right'
            },
            padding: '50 10 10 10'
        });

        self.topRecord = Ext.create('Exem.NumberField', {
            itemId      :'topRecord',
            fieldLabel  : common.Util.TR('TOP'),
            width       : 106,
            labelWidth  : 31,
            value       : 10,
            maxValue    : 10,
            minValue    : 1,
            defaultEmptyText: 10,
            isOnlyNumber    : true,
            enforceMaxLength: true,
            enableKeyEvents : true,
            listeners : {
                blur: function() {
                    if ( this.getValue() < 1 ) {
                        this.setValue(this.minValue);
                    } else if ( this.getValue() > 10 ) {
                        this.setValue(this.maxValue);
                    }
                }
            }
        });

        self.timeWindow = Ext.create('Exem.TimeWindow',{
            useOnlyHour: false,
            showRetrieveBtn: false,
            width: 230,
            margin : '10 0 10 0'
        });

        self.detailArea.add(self.topRecord, self.timeWindow);
        target.add(self.detailArea);
    },

    conditionDateLayout: function(target) {
        var dateArea = Ext.create('Ext.container.Container', {
            width : 220,
            height: '100%',
            margin: '46 0 0 27',
            layout: 'vbox'
        });

        var baseAreaCon = Ext.create('Ext.container.Container', {
            width : '100%',
            height: 22,
            layout: 'vbox'
        });

        var baseDateCon = Ext.create('Ext.container.Container', {
            width : '100%',
            height: 22,
            layout: 'hbox'
        });

        this.baseDateRadioField = Ext.create('Ext.form.FieldContainer', {
            defaultType : 'radiofield',
            layout : 'fit',
            cls    : 'exem-BaseForm-dateArea'
        });

        this.baseDateRadioField.add(this.addSelectDateRadioBtn('singleStandardDateRadioField', 'base', common.Util.TR('Base'), 130, true));

        var baseDateTextFieldCon = Ext.create('Ext.container.Container', {
            flex  : 1,
            height: '100%',
            layout: 'vbox'
        });

        this.baseDateTextField = Ext.create('Exem.TextField', {
            width           : 87,
            height          : 21,
            enableKeyEvents : true,
            fieldLabel      : '',
            labelWidth      : 0,
            labelAlign      : 'center',
            labelSeparator  : '',
            plugins         : [new Ext.ux.InputTextMask(this.getMaskType().NONE, false)],
            listeners       : {
                focus: function() {
                    var baseDateRadioField = this.baseDateRadioField.getComponent('base');

                    if ( !baseDateRadioField.getValue() ) {
                        baseDateRadioField.setValue(true);
                    }
                }.bind(this),
                blur: function(me) {
                    var date = new Date(me.getValue());
                    var userObj = this.currentCalendar.usersObj[this.currentCalendar.selectUser];

                    if ( date > new Date() || date == 'Invalid Date' ||
                        !this.currentCalendar._duplicationValidCheck([ me.getValue() ]) ) {
                        me.setValue(userObj.lastSelectedDate);
                    } else {
                        this.currentCalendar.usersObj['base'].multiSelectArr[0] = me.getValue();

                        this.calendarSetting( date.getFullYear(), date.getMonth() );
                        this.currentCalendar.fromCalendar.draw();

                        userObj.lastSelectedDate = me.getValue();
                    }
                }.bind(this)
            }
        });

        var compareAreaCon = Ext.create('Ext.container.Container', {
            width : '100%',
            height: 178,
            layout: 'vbox'
        });

        var compareDateCon = Ext.create('Ext.container.Container', {
            width : '100%',
            height: 22,
            layout: 'hbox',
            margin: '5 0 5 0'
        });

        this.compareDateRadioField = Ext.create('Ext.form.FieldContainer', {
            defaultType : 'radiofield',
            layout : 'fit',
            cls    : 'exem-BaseForm-dateArea'
        });

        this.compareDateRadioField.add(this.addSelectDateRadioBtn('singleStandardDateRadioField', 'compare', common.Util.TR('Comparison'), 130, false));

        this.compareRadioAreaCon = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 146,
            layout : 'vbox',
            style  : {
                border: '1px solid #DDDDDD'
            }
        });

        this.guideLabel = Ext.create('Ext.form.Label', {
            width  : '100%',
            height : 23,
            text   : common.Util.TR('Comparison'),
            margin : '10 0 7 20',
            style  : 'font-size: 14px; font-weight:bold; color:#636363;'
        });

        var compareRadioFieldCon = Ext.create('Ext.container.Container', {
            width : '100%',
            flex  : 1,
            layout: 'hbox',
            margin: '0 8 0 0'
        });

        this.compareRadioField = Ext.create('Ext.form.FieldContainer', {
            defaultType : 'radiofield',
            layout : 'vbox',
            cls    : 'exem-BaseForm-dateArea'
        });


        this.compareRadioField.add([
            this.addCompareAreaRadioBtn('singleCompareRadioField', 'weekDay', common.Util.TR('Monday') + ' ~ ' + common.Util.TR('Friday'), 160, true),
            this.addCompareAreaRadioBtn('singleCompareRadioField', 'week', common.Util.TR('Week'), 160, false),
            this.addCompareAreaRadioBtn('singleCompareRadioField', 'specificDate', common.Util.TR('Specific date (up to 7)'), 160, false)
        ]);

        baseDateTextFieldCon.add(this.baseDateTextField);
        baseDateCon.add( this.baseDateRadioField, baseDateTextFieldCon );
        baseAreaCon.add(baseDateCon);

        compareDateCon.add(this.compareDateRadioField);
        compareRadioFieldCon.add( {xtype: 'tbspacer', flex:1}, this.compareRadioField );
        this.compareRadioAreaCon.add( this.guideLabel, compareRadioFieldCon );
        compareAreaCon.add( compareDateCon, this.compareRadioAreaCon );

        dateArea.add( baseAreaCon, compareAreaCon );

        target.add(dateArea);
    },

    conditionCalendarLayout: function(target) {
        this.calendarArea = Ext.create('Ext.container.Container', {
            width : 239,
            height: '100%',
            margin: '46 0 0 27',
            layout: 'vbox'
        });

        this.singleCalendar = Ext.create('Exem.SelectDate',{
            width           : 237,
            multiSelectCount: 7,
            minHeight       : 205,
            multiSelectDate : true,
            floating        : false,
            trendMode       : true,
            border          : false,
            bodyStyle       : null,
            paramTextField  : this.baseDateTextField,
            isPreventInit  : true
        });

        this.singleCalendar.init();

        this.multiCalendar = Ext.create('Exem.SelectDate',{
            width           : 473,
            multiSelectCount: 7,
            numberOfMonths  : 2,
            minHeight       : 205,
            mainCalendar    :'right',
            multiSelectDate : true,
            floating        : false,
            trendMode       : true,
            border          : false,
            bodyStyle       : null,
            paramTextField  : this.baseDateTextField,
            isPreventInit  : true
        });

        this.multiCalendar.init();

        var retrieveCon = Ext.create("Ext.container.Container", {
            xtype: 'container',
            layout: 'absolute',
            width: '100%',
            height: 40,
            border: false,
            items: Ext.create('Ext.button.Button', {
                text: common.Util.TR('Comparison'),
                y: '20%',
                width: 90,
                height: 30,
                cls: 'retrieve-btn',
                style : {
                    right : '7px'
                },
                handler: function() {
                    this.retrieve();
                }.bind(this)
            })
        });

        var calendarOptionArea = Ext.create('Ext.container.Container', {
            width : 80,
            height: '100%',
            margin: '46 0 0 5',
            layout: 'vbox'
        });

        this.calExpandCon = Ext.create('Ext.container.Container', {
            width : 75,
            height: 15,
            margin: '6 0 0 4',
            layout: 'hbox',
            style : 'cursor:pointer;',
            listeners: {
                render: function() {
                    this.calExpandCon.getEl().on('click', function() {
                        this.changeCalendar(1);
                    }.bind(this));
                }.bind(this)
            }
        });

        this.calExpandBtn = Ext.create('Exem.Container',{
            width  : 23,
            height : 13,
            cls    : 'calendar-expand'

        });

        this.calExpandLabel = Ext.create('Ext.form.Label', {
            width  : 50,
            height : 13,
            text   : 'Expand',
            margin : '1 0 0 6',
            style  : 'font-size: 12px; color:#636363;cursor:pointer;'
        });

        this.calCollapseCon = Ext.create('Ext.container.Container', {
            width : 75,
            height: 15,
            margin: '6 0 0 4',
            layout: 'hbox',
            style : 'cursor:pointer;',
            listeners: {
                render: function() {
                    this.calCollapseCon.getEl().on('click', function() {
                        this.changeCalendar(0);
                    }.bind(this));
                }.bind(this)
            }
        });

        this.calCollapseBtn = Ext.create('Ext.container.Container',{
            width  : 23,
            height : 13,
            cls    : 'calendar-collapse'
        });

        this.calCollapseLabel = Ext.create('Ext.form.Label', {
            width  : 50,
            height : 13,
            text   : 'Collapse',
            margin : '1 0 0 6',
            style  : 'font-size: 12px; color:#636363;cursor:pointer;'
        });

        var calClearCon = Ext.create('Ext.container.Container', {
            width : 70,
            height: 15,
            margin: '6 0 0 4',
            layout: 'hbox',
            style : 'cursor:pointer;',
            listeners: {
                render: function() {
                    calClearCon.getEl().on('click', function() {
                        this.baseDateTextField.setValue('');

                        this.currentCalendar.allClearDate();
                        this.currentCalendar.fromCalendar.draw();
                    }.bind(this));
                }.bind(this)
            }
        });

        this.calClearBtn = Ext.create('Ext.container.Container',{
            width  : 23,
            height : 13,
            cls    : 'calendar-clear'
        });

        this.calClearLabel = Ext.create('Ext.form.Label', {
            width  : 45,
            height : 13,
            text   : 'Clear',
            margin : '1 0 0 6',
            style  : 'font-size: 12px; color:#636363;cursor:pointer;'
        });


        this.calExpandCon.add( this.calExpandBtn, this.calExpandLabel );
        this.calCollapseCon.add( this.calCollapseBtn, this.calCollapseLabel );
        calClearCon.add( this.calClearBtn, this.calClearLabel );

        this.calendarArea.add( this.singleCalendar, this.multiCalendar, retrieveCon );
        calendarOptionArea.add( this.calExpandCon, this.calCollapseCon, calClearCon );
        target.add(this.calendarArea);
        target.add(calendarOptionArea);
    },

    baseSetting:function() {
        var today = Ext.Date.format (new Date(), common.Util.getLocaleType(DisplayTimeMode.None));

        this.multiCalendar.hide();
        this.calCollapseCon.hide();

        this.singleCalendar.beforeCalOpenCheck = this.beforeCalOpenCheck.bind(this);
        this.multiCalendar.beforeCalOpenCheck = this.beforeCalOpenCheck.bind(this);

        this.currentCalendar = this.singleCalendar;
        this.currentCalendar.usersObj['base'].multiSelectDate = false;
        this.currentCalendar.usersObj['base'].lastSelectedDate = today;
        this.currentCalendar.usersObj['base'].multiSelectArr[0] = today;
        this.currentCalendar.fromCalendar.draw();

        this.baseDateTextField.setValue(today);
    },

    beforeCalOpenCheck: function( date, comparisonDay ) {
        var firstDayOfMonth = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1);

        if ( comparisonDay < firstDayOfMonth && this.currentCalendar == this.singleCalendar ) {
            this.changeCalendar(1);
        }
    },

    changeCalendar: function(type) {
        if ( type == 0 ) {
            this.calendarArea.setWidth(239);
            this.calCollapseCon.hide();
            this.calExpandCon.show();
            this.singleCalendar.show();
            this.multiCalendar.hide();

            this.singleCalendar.selectUser = this.currentCalendar.selectUser;
            this.singleCalendar.usersObj = this.currentCalendar.usersObj;
            this.currentCalendar = this.singleCalendar;
        } else {
            this.calendarArea.setWidth(473);
            this.calCollapseCon.show();
            this.calExpandCon.hide();
            this.singleCalendar.hide();
            this.multiCalendar.show();

            this.multiCalendar.selectUser = this.currentCalendar.selectUser;
            this.multiCalendar.usersObj = this.currentCalendar.usersObj;
            this.currentCalendar = this.multiCalendar;
        }

        this.calendarSetting();
        this.currentCalendar.fromCalendar.draw();
    },

    calendarSetting: function( year, month ) {
        var dateSectionList;
        var lastDate;
        var calendars = this.currentCalendar.fromCalendar.calendars;

        if ( !year && !month ) {
            dateSectionList = this.makeDateList();

            if ( dateSectionList.length == 0 ) {
                return;
            }

            lastDate = new Date(dateSectionList[dateSectionList.length-1][0]);

            if(!lastDate) {
                return;
            }

            year = lastDate.getFullYear();
            month = lastDate.getMonth();
        }

        if ( this.currentCalendar.fromCalendar._o.numberOfMonths == 1 ) {
            calendars[0].year = year;
            calendars[0].month = month;
        } else {
            calendars[1].year = year;
            calendars[1].month = month;

            calendars[0] = this.adjustCalendar({
                month: calendars[1].month - 1,
                year: calendars[1].year
            });
        }
    },

    adjustCalendar: function(calendar) {
        if ( calendar.month < 0 ) {
            calendar.year -= Math.ceil(Math.abs(calendar.month)/12);
            calendar.month += 12;
        }
        if ( calendar.month > 11 ) {
            calendar.year += Math.floor(Math.abs(calendar.month)/12);
            calendar.month -= 12;
        }

        return calendar;
    },


    makeDateList: function() {
        var ix, jx, jxLen;
        var usersObj = this.currentCalendar.usersObj;
        var usersObjKeyList = Object.keys(usersObj);
        var multiSelectArr;
        var gridDateList = [];

        for ( ix = 0; ix < usersObjKeyList.length; ix++ ) {
            multiSelectArr = usersObj[usersObjKeyList[ix]].multiSelectArr;

            for ( jx = 0, jxLen = multiSelectArr.length; jx < jxLen; jx++ ) {
                gridDateList.push([ multiSelectArr[jx] ]);
            }
        }

        return gridDateList.sort();
    },

    addSelectDateRadioBtn: function( name, itemId, label, width, checked, paramObj ) {
        return Ext.create('Ext.form.field.Radio', {
            boxLabel: label,
            itemId: itemId,
            width    : width,
            flex     : 1,
            name     : this.id + name,
            paramObj : paramObj,
            checked  : checked,
            style    : 'color:#636363;',
            listeners: {
                change: function(me, newValue) {
                    var user = me.itemId;

                    if ( newValue ) {
                        this.currentCalendar.userChange(user);

                        if (user == 'compare') {
                            this.calendarSelectTypeChange();
                        }
                    }
                }.bind(this)
            }
        });
    },

    addCompareAreaRadioBtn: function (name, itemId, label, width, checked, paramObj) {
        return Ext.create('Ext.form.field.Radio', {
            boxLabel : label,
            itemId   : itemId,
            width    : width,
            height   : 21,
            name     : this.id + name,
            paramObj : paramObj,
            checked  : checked,
            style    : 'color:#636363;',
            listeners: {
                change: function(me, newValue) {
                    if (newValue && this.compareDateRadioField.getComponent('compare').getValue()) {
                        this.calendarSelectTypeChange(me.itemId);
                    }
                }.bind(this)
            }
        });
    },

    calendarSelectTypeChange: function(type) {
        var radioCmp;
        var radioField = this.compareRadioField;

        if (!type) {
            if (radioField.getComponent('weekDay').getValue()) {
                type = 'weekDay';
            } else if (radioField.getComponent('week').getValue()) {
                type = 'week';
            } else {
                type = 'specificDate';
            }
            radioField.getComponent(type).setValue(true);
        }

        radioCmp = radioField.getComponent(type);

        if (!radioCmp) {
            return;
        }

        if (type == 'weekDay' || type == 'week') {
            this.currentCalendar.usersObj['compare'].selectType = type;
        } else {
            this.currentCalendar.usersObj['compare'].selectType = null;
        }
    },

    getMaskType : function() {
        var maskType = {};
        switch(nation) {
            case 'zh-CN':
            case 'ja' :
                maskType.HMS  =  '9999/99/99 99:99:99';
                maskType.HM   =  '9999/99/99 99:99';
                maskType.H    =  '9999/99/99 99';
                maskType.NONE =  '9999/99/99';
                return maskType;
            case 'en' :
            case 'ko' :
            default:
                maskType.HMS  =  '9999-99-99 99:99:99';
                maskType.HM   =  '9999-99-99 99:99';
                maskType.H    =  '9999-99-99 99';
                maskType.NONE =  '9999-99-99';
                return maskType;
        }
    },

    executeSQL: function(){

        if(!this.retrieveValidationCheck()) {
            return;
        }


        if ( this.timeWindow.isChecked() ) {
            this.startTime = this.timeWindow.getFromTime();
            this.endTime = this.timeWindow.getToTime();
        } else {
            this.startTime = '00:00';
            this.endTime   = '23:59';
        }

        this.gridDateList = this.makeDateList();

        for ( var ix = 0, ixLen = this.gridDateList.length; ix < ixLen; ix++ ) {
            if ( this.gridDateList[ix][0] == this.currentCalendar.usersObj['base'].multiSelectArr[0] ) {
                this.baseGridIdx = ix;
            }
        }

        if ( !this.retrieveFlag ) {
            this.retrieveFlag = true;
        }


        this.conditionBackground.collapse();
        this.conBackgroundCollapse();

        var paramObj = {
            viewTab       : 0,
            retrieveFlag  : this.retrieveFlag,
            agentList     : this.agentList.id,
            topRecordValue: this.topRecord.getValue(),
            gridDateList  : this.gridDateList,
            baseGridIdx   : this.baseGridIdx,
            baseConIdx    : this.baseGridIdx == 0 ? 0 : 1,
            startTime     : this.startTime,
            endTime       : this.endTime
        };

        if(this.extCondition) {
            paramObj.minElapse = this.elapseField.getValue();
            paramObj.txnName = this.txnNameField.getValue();
            paramObj.elapseBase = this.elapseBase;
        }

        this.workArea.executeSQL(paramObj);
    },

    conBackgroundCollapse: function() {
        var panelHeader = this.conditionBackground.el.dom.getElementsByClassName('x-title-text')[0];

        var ix, ixLen, selAgentList,
            baseDateTxt = '', compareDateFromTxt = '', compareDateToTxt = '', agentTxt = '';

        selAgentList = this.wasDBTreeCombo.tree.getChecked();
        this.agentList.id.length = 0;
        this.agentList.text.length = 0;

        for(ix=0, ixLen=selAgentList.length; ix<ixLen; ix++) {
            if(!selAgentList[ix].data.root && selAgentList[ix].data.leaf) {
                this.agentList.id.push(selAgentList[ix].data.id);
                this.agentList.text.push(selAgentList[ix].data.text);
            }
        }

        for ( ix = 0, ixLen = this.gridDateList.length; ix < ixLen; ix++ ) {
            if ( ix == this.baseGridIdx ) {
                baseDateTxt = this.gridDateList[ix];
            } else {
                compareDateFromTxt = compareDateFromTxt || this.gridDateList[ix];
            }

            if ( ix == ixLen-1 && ixLen > 2 ) {
                if ( ix == this.baseGridIdx ) {
                    compareDateToTxt = '&nbsp; ~ &nbsp;' + this.gridDateList[ix-1];
                } else {
                    compareDateToTxt = '&nbsp; ~ &nbsp;' + this.gridDateList[ix];
                }
            }
        }

        for(ix=0, ixLen=this.agentList.text.length; ix<ixLen; ix++) {
            agentTxt += this.agentList.text[ix];
            agentTxt += ix < ixLen - 1 ? ', ' : ' ';
        }

        var tmpString =
            common.Util.TR('Agent') + ' : &nbsp; <b>' + agentTxt + '</b> &nbsp;&nbsp;&nbsp;&nbsp; ' +
            common.Util.TR('Base') + ' : ' + baseDateTxt + ' &nbsp; ' +
            this.startTime + '&nbsp; ~ &nbsp;' + this.endTime + ' &nbsp;&nbsp;&nbsp;&nbsp; ' +
            common.Util.TR('Comparison') + ' : ' + compareDateFromTxt + compareDateToTxt + ' &nbsp; ' +
            this.startTime + '&nbsp; ~ &nbsp;' + this.endTime;

        panelHeader.style.fontWeight = 'normal';
        panelHeader.style.fontSize = '13px';
        panelHeader.innerHTML = tmpString;

        panelHeader = null;
        tmpString = null;

    },


    retrieveValidationCheck: function() {

        var usersObj = this.currentCalendar.usersObj;

        if (usersObj['base'].multiSelectArr.length == 0) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select base date'), Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        } else if (Object.keys(usersObj).length < 2 || !usersObj['compare'] || usersObj['compare'].multiSelectArr.length == 0) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select comparison date'), Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        } else if (!this.wasDBTreeCombo.tree.getChecked().length) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select Agent') , Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        return true;
    }

});