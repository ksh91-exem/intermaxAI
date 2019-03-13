/**
 * Created by Kang on 2017-06-19.
 */

Ext.define('view.ReportTemplateForm', {
    extend: 'Exem.Form',

    initFlag        : false,
    isConfiguration : true,
    mainPageInfo    : null,

    reportType      : 1,
    templateSeq     : null,
    templateOptions : null,

    init: function() {
        this._initProperty();
        this._initLayout();
    },

    _initProperty: function() {
        this.initFlag = true;
    },

    _initLayout: function() {
        this.mainView = Ext.create('view.ReportAgentDaily', {
            flex               : 1,
            parent             : this,
            isConfiguration    : this.isConfiguration,
            templateOptions    : this.templateOptions,
            useDefaultStat     : this.useDefaultStat,
            useTimeWindow      : false,
            openSetScheduleWin : this.openSetScheduleWin.bind(this),
            executeSql         : this._saveTemplate.bind(this),   // Override
            addDatePicker      : this.addDatePicker    // Override
        });

        this.mainView.addListener('afterlayout', function() {
            this.mainView.buttonContainer.setMargin('10 0 0 3');
            this.operationTimeArea.add( this.mainView.dateArea );
        }.bind(this));

        this.mainView.init();
        this.mainView.datePicker.hide();

        this.add(
            this._createReportTitleArea(),
            this._createOperationArea(),
            this.mainView
        );
    },

    _createReportTitleArea: function() {
        this.templateTitleTxtField = Ext.create('Exem.TextField',{
            itemId        : 'templateTitleTxtField',
            width         : 200,
            height        : 21,
            labelWidth    : 70,
            fieldLabel    : '',
            labelSeparator: '',
            labelAlign    : 'right',
            emptyText     : common.Util.TR('Please enter title'),
            maxLength     : 100,
            listeners : {
                focus: function () {
                    this.emptyText = [' '];
                    this.applyEmptyText();
                }
            }
        });

        return Ext.create( 'Ext.container.Container', {
            width  : '100%',
            height : 40,
            layout : 'hbox',
            margin : '0 0 0 30',
            cls    : 'list-condition',
            padding       : 0,
            style         : {background : 'transparent !important'},
            items  : [
                Ext.create('Ext.form.Label', {
                    text   : common.Util.TR('Template Title'),
                    itemId : 'templateTitleLabel',
                    width  : 100,
                    height : 22,
                    margin : '5 0 0 0'
                }),
                this.templateTitleTxtField
            ]
        });
    },

    _createOperationArea: function() {
        this.operationTimeArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 40,
            layout : 'hbox',
            margin : '0 0 0 30',
            cls    : 'list-condition',
            padding       : 0,
            style         : {background : 'transparent !important'}
        });

        this.operationTimeWindow = Ext.create('Exem.TimeWindow',{
            boxLabel        : '',
            width           : 184,
            height          : 24,
            margin          : 0,
            showRetrieveBtn : false,
            useFixedMinute  : true
        });

        if(this.timeWindowCheck){
            this.operationTimeWindow.setTimeWindowCheck(true);
        }

        this.operationTimeWindow.timeWindow.fromTimeField.setValue('00');
        this.operationTimeWindow.timeWindow.toTimeField.setValue('23');

        this.operationTimeArea.add(
            Ext.create('Ext.form.Label', {
                text   : common.Util.TR('Time Window'),
                itemId : 'operationTime',
                width  : 100,
                height : 22,
                margin : '5 0 0 0'
            }),
            this.operationTimeWindow
        );
        return this.operationTimeArea;
    },

    _createButton: function( paramObj, ignoreDefaultObj ) {
        var defaultObj = {
            width   : 100,
            height  : 25,
            margin  : '0 10 0 0',
            listeners : {
                click : function(me) {
                    this._buttonClick(me.itemId);
                }.bind(this)
            }
        };

        return Ext.create('Ext.Button', ignoreDefaultObj === true && paramObj ? paramObj : Object.assign( defaultObj, paramObj ));
    },

    addDatePicker: function (target) {
        var datePicker = Ext.create('Exem.DatePicker', {
            height         : 24,
            executeSQL     : this.executeSQL,
            executeScope   : this,
            DisplayTime    : DisplayTimeMode.None,
            rangeOneDay    : false,
            useRetrieveBtn : false,
            isDaily        : true,
            retrieveScope  : this,
            labelYPos      : 7,
            keyUpCheck     : true,
            margin         : '0 0 0 0',
            getPluginMaskFormat: this.parent._getPluginMaskFormat
        });
        target.add(datePicker);
        return datePicker;
    },

    _getPluginMaskFormat: function() {
        // Override Function
        var maskType = nation == 'ja' || nation == 'zh-CN' ? '9999/99/99' : '9999-99-99';

        return {
            fromIconPosX   : 216,
            toIconPosY     : 0,
            toFieldY       : 0,
            fromLabel      : common.Util.TR(''),
            toLabel        : '',
            fromLabelWidth : 0,
            toLabelWidth   : 0,
            displayFormat  : maskType,
            fieldWidth     : 90,
            fromgFieldX    : 0,
            toFieldX       : 108,
            toLabelX       : 95,
            toIconPosX     : 195
        };
    },

    _buttonClick: function( itemId ) {
        switch ( itemId ) {
            case 'scheduleOkBtn':
                if ( !this.scheduleValueCheck() ) {
                    return false;
                }
                this.scheduleWin.hide();
                break;
            case 'scheduleCancelBtn':
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('The schedule setting value will be deleted when canceling. Are you sure you want to cancel?'), Ext.Msg.YESNO, Ext.Msg.WARNING,
                    function( check ) {
                        if ( check == 'yes' ) {
                            this.scheduleWin.destroy();
                            delete(this.scheduleWin);
                        }
                    }.bind(this));
                break;
            default: break;
        }
    },

    openSetScheduleWin: function() {
        if ( this.scheduleWin && this.scheduleWin.rendered ) {
            this.scheduleWin.show();
            return false;
        }

        this.scheduleWin = Ext.create('Exem.XMWindow', {
            title       : common.Util.TR('Set Schedule'),
            width       : 700,
            height      : 900,
            minWidth    : 500,
            minHeight   : 500,
            layout      : 'vbox',
            minimizable : false,
            maximizable : false,
            closable    : false,
            modal       : true,
            cls           : 'list-condition',
            padding       : 0,
            style         : {background : 'transparent !important'},
            listeners   : {
                show: function() {
                }.bind(this)
            }
        });

        var scheduleTitleFieldSet = Ext.create('Ext.form.FieldSet', {
            title       : '',
            itemId      : 'scheduleTitleFieldSet',
            width       : '100%',
            height      : 45,
            layout      : 'absolute',
            margin      : '20 20 10 20',
            defaultType : 'textfield'
        });

        this.scheduleTitleTxtField  = Ext.create('Exem.TextField',{
            fieldLabel : common.Util.TR('Schedule Title'),
            itemId     : 'scheduleTitle',
            width      : '98%',
            height     : 20,
            margin     : '10 0 0 4',
            labelAlign : 'left',
            labelWidth : 92,
            emptyText  : common.Util.TR('Please enter schedule title'),
            listeners: {
                focus: function (me) {
                    if ( !me.getValue() || !me.getValue().length ) {
                        me.setValue('');
                    }
                },
                blur: function(me) {
                    if ( !me.getValue() || !me.getValue().length ) {
                        me.applyEmptyText();
                    }
                }
            }
        });

        this.schedulingForm = Ext.create('view.ReportSchedulingForm', {
            parent : this.scheduleWin,
            width  : '100%',
            flex   : 1
        });

        var bottomBtnCon = Ext.create('Ext.container.Container', {
            width : '100%',
            height: 30,
            layout: { type: 'hbox', pack: 'center', align: 'middle' },
            items : [
                this._createButton({ text: common.Util.TR('Ok')    , itemId: 'scheduleOkBtn'     }),
                this._createButton({ text: common.Util.TR('Cancel'), itemId: 'scheduleCancelBtn' })
            ]
        });

        scheduleTitleFieldSet.add(this.scheduleTitleTxtField);
        this.scheduleWin.show();
        this.scheduleWin.add( scheduleTitleFieldSet, this.schedulingForm, bottomBtnCon );

        //this.scheduleWin.addListener('beforeclose', function(){
        //    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('취소 하시겠습니까? 스케줄 설정 작업이 삭제됩니다.'), Ext.Msg.YESNO, Ext.Msg.WARNING,
        //        function( check ) {
        //            if ( check == 'yes' ) {
        //                this.scheduleWin.destroy();
        //                delete(this.scheduleWin);
        //            }
        //        }.bind(this));
        //}.bind(this));
        //
        //this.scheduleWin.addListener('close', function(){
        //    this.scheduleWin.destroy();
        //    delete(this.scheduleWin);
        //}.bind(this));
    },

    templateValidCheck: function() {
        // 유효성 체크 >> title 등등 해야됨...

        if ( !this.mainView.getReportParams() ) {
            return false;
        }

        if ( !this.templateTitleTxtField.getValue() ) {
            this.templateTitleTxtField.focus();
            common.Util.showMessage( common.Util.TR('Warning'), common.Util.TR('Please enter template title.'), Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }

        var currentTitle = this.templateTitleTxtField.getValue(),
            newTemplateWin = this.parent,
            reportConfigurationView = newTemplateWin.parent,
            templateRecodeData = newTemplateWin.recordData,
            templateRecodeDataTitle;

        if(templateRecodeData != undefined){
            templateRecodeDataTitle =  templateRecodeData.templateTitle;
        }

        //중복체크
        if ( templateRecodeDataTitle != currentTitle && reportConfigurationView.templateGrid.findRow('templateTitle', currentTitle) !== -1) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Template name is duplicated.'));
            this.templateTitleTxtField.focus();
            return false;
        }

        return true;
    },

    scheduleValueCheck: function(){
        var scheduleTitle, userSeqListStr,
            reportConfigurationView = this.parent.parent;

        scheduleTitle  = this.scheduleTitleTxtField.getValue().trim();
        userSeqListStr = this.schedulingForm._getRecipientSeqList();

        if ( scheduleTitle == '' ) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please enter schedule title.'), Ext.Msg.OK, Ext.MessageBox.INFO, function(){
                this.scheduleTitleTxtField.focus();
            }.bind(this));
            return false;
        }

        if ( reportConfigurationView.scheduleGrid.findRow('scheduleTitle', scheduleTitle) !== -1) {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('schedule name is duplicated.'));
            return false;
        }

        if ( !userSeqListStr.length ) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please set recipient(s).'), Ext.Msg.OK, Ext.MessageBox.INFO);
            return false;
        }

        return true;
    },

    _getQueryBindData: function() {
        var performanceTrendSelectedInfo;
        var viewScope = this.mainView;

        var queryBindInfo = {
            selectedWasIds   : [],
            selectedWasNames : [],
            selectedStats    : [],
            fromTime         : null,
            toTime           : null,
            pageDirection    : 0,
            aggregate        : null,
            chkAvg           : null,
            chkMax           : null,
            timeWindowCheck  : false
        };

        var ix,ixLen;
        var wasIds = [], wasNames = [];

        performanceTrendSelectedInfo = viewScope.statChange.getSelectedList();

        for( ix = 0, ixLen = viewScope.agentList.length; ix < ixLen; ix++){
            wasIds.push(+viewScope.agentList[ix].wasId);
            wasNames.push(viewScope.agentList[ix].wasName);
        }

        var aggregate;

        if(viewScope.chkAvg.getValue() && viewScope.chkMax.getValue()){
            aggregate = 'ALL';
        } else if (viewScope.chkAvg.getValue()){
            aggregate = 'AVG';
        } else if (viewScope.chkMax.getValue()){
            aggregate = 'MAX';
        }

        var fromTime, toTime;
        var timeWindowCheck = this.operationTimeWindow.timeWindowCheck.getValue();

        if(timeWindowCheck){
            fromTime = this.operationTimeWindow.getFromTime();
            toTime   = this.operationTimeWindow.getToTime();
        } else{
            fromTime = '00:00';
            toTime   = '23:59';
        }

        queryBindInfo['selectedWasIds']    = wasIds   || [];
        queryBindInfo['selectedWasNames']  = wasNames || [];
        queryBindInfo['selectedStats']     = performanceTrendSelectedInfo || [];
        queryBindInfo['fromTime']          = fromTime;
        queryBindInfo['toTime']            = toTime;
        queryBindInfo['pageDirection']     = viewScope.pageDirection;    // 0: vertical,  1: horizontal
        queryBindInfo['aggregate']         = aggregate; // AVG, MAX, ALL
        queryBindInfo['chkAvg']            = viewScope.chkAvg.getValue();
        queryBindInfo['chkMax']            = viewScope.chkMax.getValue();
        queryBindInfo['timeWindowCheck']   = timeWindowCheck;

        return queryBindInfo;
    },

    _saveTemplate: function() {
        var type, url, scheduleTitle, scheduleState, scheduleInfo, userSeqListStr;

        if ( !this.templateValidCheck() ) {
            return false;
        }

        var dataSet = {
            bind: [
                { name: 'template_title', type: SQLBindType.STRING , value: this.templateTitleTxtField.getValue() || '' },
                { name: 'report_type'   , type: SQLBindType.INTEGER, value: 1                                            },
                { name: 'login_user'    , type: SQLBindType.INTEGER, value: Comm.config.login.user_id                    },
                { name: 'article_num'   , type: SQLBindType.INTEGER, value: 1                                            },
                { name: 'article_type'  , type: SQLBindType.INTEGER, value: 1                                            }
            ],
            replace_string : [
                { name: 'query_bind', value: '\'' + JSON.stringify(this._getQueryBindData()) + '\'' }
            ]
        };

        if ( this.scheduleWin ) {
            scheduleTitle  = this.scheduleTitleTxtField.getValue().trim();
            scheduleInfo   = this.schedulingForm._getScheduleInfo();
            userSeqListStr = this.schedulingForm._getRecipientSeqList();
            scheduleState = scheduleInfo.scheduleState;

            dataSet.bind.push(
                { name: 'schedule_title'      , type: SQLBindType.STRING , value: scheduleTitle                   },
                { name: 'start_date'          , type: SQLBindType.STRING , value: scheduleInfo.startDate          },
                { name: 'end_date'            , type: SQLBindType.STRING , value: scheduleInfo.endDate            },
                { name: 'interval_value'      , type: SQLBindType.INTEGER, value: scheduleInfo.intervalValue      },
                { name: 'interval_unit'       , type: SQLBindType.INTEGER, value: scheduleInfo.intervalUnit       },
                { name: 'interval_day_of_week', type: SQLBindType.INTEGER, value: scheduleInfo.intervalDayOfWeek  },
                { name: 'retention_value'     , type: SQLBindType.INTEGER, value: scheduleInfo.retentionValue     },
                { name: 'smtp_seq'            , type: SQLBindType.INTEGER, value: scheduleInfo.smtpSeq            },
                { name: 'state'               , type: SQLBindType.INTEGER, value: scheduleState                   },
                { name: 'login_user'          , type: SQLBindType.INTEGER, value: Comm.config.login.user_id       },
                { name: 'report_start_point'  , type: SQLBindType.INTEGER, value: scheduleInfo.reportStartPoint   },
                { name: 'report_end_point'    , type: SQLBindType.INTEGER, value: scheduleInfo.reportEndPoint     },
                { name: 'report_past_flag'    , type: SQLBindType.INTEGER, value: scheduleInfo.reportPastFlag     },
                { name: 'is_end_of_the_month' , type: SQLBindType.INTEGER, value: scheduleInfo.isEndOfTheMonth    },
                { name: 'mail_signature'      , type: SQLBindType.INTEGER, value: scheduleInfo.mailSignature      }
            );
            dataSet.replace_string.push({
                name : 'user_seq_list',
                value: userSeqListStr
            });

            type = 'post';  // IMXPA_Report_Configuration_Template_Insert_With_Schedule.sql
            url  = '/reportTemplate/saveSchedule';
        } else {
            if ( this.templateSeq ) {
                dataSet.bind.push({
                    name : 'template_seq',
                    type : SQLBindType.INTEGER,
                    value: this.templateSeq
                });

                type = 'put';   // IMXPA_Report_Configuration_Template_Update.sql
                url  = '/reportTemplate?dataSet=' + JSON.stringify(dataSet);
            } else {
                type = 'post';  // IMXPA_Report_Configuration_Template_Insert.sql
                url  = '/reportTemplate';
            }
        }

        $.ajax({
            type : type,
            url  : url,
            data : JSON.stringify(dataSet),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
                if ( response.header.success ) {
                    common.Util.showMessage(common.Util.TR('Confirm'), common.Util.TR('Report Template is successfully saved.'), Ext.Msg.OK, Ext.MessageBox.INFO);
                    var newTemplateWin    = this.parent;
                    var reportConfigurationView = newTemplateWin.parent;
                    reportConfigurationView._execGetList('template');
                    newTemplateWin.close();
                } else {
                    common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Cannot save report template.'), Ext.Msg.OK, Ext.MessageBox.ERROR);
                }
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {}
        });
    }
});