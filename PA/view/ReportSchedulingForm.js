/**
 * Created by Kang on 2017-07-05.
 */

Ext.define('view.ReportSchedulingForm', {
    extend     : 'Exem.Container',
    width      : 750,
    height     : 900,
    minWidth   : 600,
    minHeight  : 600,
    layout     : 'vbox',

    parent     : null,
    reportType : 1,
    templateSeq: null,
    scheduleSeq: null,

    constructor: function() {
        this.callParent(arguments);
        this.init();
    },

    init: function() {
        this._initProperty();
        this._initLayout();
    },

    _initProperty: function() {
    },

    _initLayout: function() {
        this.scheduleForm = Ext.create('Exem.ReportScheduleBaseForm', {
            height          : 175,
            margin          : '10 20 0 20',
            parent          : this,
            reportType      : this.reportType,
            scheduleState   : this.scheduleState
        });

        this.add(
            this.scheduleForm,
            this._createRetentionArea(),
            this._createSmtpArea(),
            this._createEmailArea()
        );
    },

    _createRetentionArea: function() {
        var retentionFieldSet = Ext.create('Ext.form.FieldSet', {
            title       : '<span style="font-size:14px;">' + common.Util.TR('Retention') + '</span>',
            itemId      : 'retentionFieldSet',
            width       : '100%',
            height      : 65,
            layout      : 'fit',
            margin      : '10 20 0 20',
            defaultType : 'textfield'
        });

        var reportRetentionPeriodLabel = Ext.create('Ext.form.Label', {
            text   : common.Util.TR('Report Retention Period'),
            width  : 160,
            height : '100%',
            margin : '5 0 0 0'
        });

        this.reportRetentionPeriodNumberField = Ext.create('Exem.NumberField', {
            itemId     : 'reportRetentionPeriodNumberField',
            width      : 60,
            height     : 21,
            labelWidth : '',
            minValue   : 1,
            maxValue   : 9999,
            maxLength  : 4,
            value      : 30,
            readOnly   : false,
            enforceMaxLength: true,
            enableKeyEvents : true,
            maskRe     : new RegExp('^[A-Za-z0-9]'),
            regexText  : common.Util.TR('Please enter only numbers and alphabets'),
            //valueType: 'value', default 값.
            listeners: {
                keydown: function (numField, e) {
                    // 'e' , '-' '.' 숫자 이외의 값 막기
                    if ((e.button == 189) || (e.button == 188) || (e.button == 186) || (e.button == 68) || (e.button == 228)){
                        e.stopEvent();
                    }
                }.bind(this),
                blur: function(me) {
                    if ( me.getValue() <= me.minValue ) {
                        me.setValue(me.minValue);
                    } else if(me.getValue() >= me.maxValue) {
                        me.setValue(me.maxValue);
                    }
                }.bind(this),
                change: function(me) {
                    var convertRetentionUnit = {
                        1: 'Days',
                        2: 'Weeks',
                        3: 'Months',
                        4: 'Years'
                    };

                    var retentionUnit = convertRetentionUnit[this.scheduleForm.intervalInfo.intervalUnit];
                    this.retentionUnitLabel.setText( me.getValue() == 1 ? retentionUnit.slice(0,retentionUnit.length-1) : retentionUnit );
                }.bind(this)
            }
        });

        this.retentionUnitLabel = Ext.create('Ext.form.Label', {
            text   : common.Util.TR('Days'),
            width  : 150,
            height : '100%',
            margin : '5 0 0 10'
        });

        retentionFieldSet.add(
            Ext.create('Ext.container.Container', {
                width : '100%',
                height: 22,
                layout: 'hbox',
                margin: '7 0 0 3',
                items: [
                    reportRetentionPeriodLabel,
                    this.reportRetentionPeriodNumberField,
                    this.retentionUnitLabel
                ]
            })
        );

        return retentionFieldSet;
    },

    _createSmtpArea: function() {
        var smtpFieldSet = Ext.create('Ext.form.FieldSet', {
            defaultType: 'textfield',
            title   : '<span style="font-size:14px;">'+ common.Util.TR('EMail') +'</span>',
            width  : '100%',
            height : 65,
            margin : '10 20 0 20'
        });


        var container = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : '100%',
            layout : 'hbox'
        });

        this.smtpAjaxCbBox = Ext.create('Exem.AjaxComboBox',{
            width      : 240,
            margin     : '7 0 0 3',
            labelWidth : 40,
            labelAlign : 'left',
            allowblank : false,
            editable   : false,
            fieldLabel : common.Util.TR('SMTP')
        });

        this.smtpComboBoxSetting();

        this.signatureCheckBox = Ext.create('Ext.form.field.Checkbox', {
            checked: true,
            boxLabel: Comm.RTComm.setFont(9, common.Util.CTR('Include signature')),
            style : {
                margin : '7px 0px 0px 20px'
            }
        });

        container.add(this.smtpAjaxCbBox, this.signatureCheckBox);

        smtpFieldSet.add(container);
        return smtpFieldSet;
    },

    smtpComboBoxSetting : function(){
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Report_SMTP_Info.sql';

        WS.SQLExec(dataSet, function(aheader, adata) {
            if(!common.Util.checkSQLExecValid(aheader, adata)){
                console.info(aheader);
                console.info(adata);
                return;
            }

            var result = [];
            for (var ix = 0; ix < adata.rows.length; ix++) {
                var dataRows = adata.rows[ix];
                result.push({name : dataRows[1], value: dataRows[0]});
            }

            this.smtpAjaxCbBox.setData(result);
            this.smtpAjaxCbBox.setSearchField('name');
            if(this.selectSMTP){
                this.smtpAjaxCbBox.setValue(this.selectSMTP);
            } else{
                this.smtpAjaxCbBox.selectByIndex(0);
            }
        }, this);
    },

    _createEmailArea: function() {
        var emailFieldSet = Ext.create('Ext.form.FieldSet', {
            defaultType: 'textfield',
            title   : '<span style="font-size:14px;">'+ common.Util.TR('Recipient') +'</span>',
            itemId : 'emailFieldSet',
            width  : '100%',
            flex   : 1,
            layout : 'vbox',
            margin : '10 20 0 20'
        });

        this.emailForm = Ext.create('Exem.ReportEmailBaseForm', {
            flex        : 1,
            padding     : 5,
            parent      : this,
            scheduleSeq : this.scheduleSeq
        });

        this.emailForm.init();

        emailFieldSet.add(this.emailForm);
        return emailFieldSet;
    },

    _getScheduleInfo: function() {
        var scheduleInfo   = this.scheduleForm._getSchedule();
        var retentionValue = this.reportRetentionPeriodNumberField.getValue();
        var smtpSeq        = +this.smtpAjaxCbBox.getValue();
        var mailSignature  = this.signatureCheckBox.getValue();

        if(mailSignature){
            mailSignature = 1;
        } else{
            mailSignature = 0;
        }

        return {
            startDate         : scheduleInfo.startDate,
            endDate           : scheduleInfo.endDate,
            endTimeCbBoxData  : scheduleInfo.endTimeCbBoxData,
            intervalValue     : scheduleInfo.intervalValue,
            intervalUnit      : scheduleInfo.intervalUnit,
            intervalDayOfWeek : scheduleInfo.intervalDayOfWeek,
            reportStartPoint  : scheduleInfo.reportStartPoint,
            reportEndPoint    : scheduleInfo.reportEndPoint,
            reportPastFlag    : scheduleInfo.reportPastFlag,
            isEndOfTheMonth   : scheduleInfo.isEndOfTheMonth,
            scheduleState     : scheduleInfo.scheduleState,
            retentionValue    : retentionValue,
            smtpSeq           : smtpSeq,
            mailSignature     : mailSignature
        };
    },

    _getRecipientSeqList: function() {
        var userSeqListStr = '';
        var recipientList  = this.emailForm.listGrid.getStore().data.items;

        for ( var ix = 0, ixLen = recipientList.length; ix < ixLen; ix++ ) {
            if ( ix > 0 ) {
                userSeqListStr += ', ';
            }
            userSeqListStr += recipientList[ix].data['userSeq'];
        }

        return userSeqListStr;
    },

    /**
     * schedule 있을 경우, 있는 값으로 Setting
     *
     * @param scheduleSeq
     * @param templateSeq
     * @param paramObj{Object}
     *  reportType      , startDate     , endDate
     *  intervalUnit    , intervalValue , intervalDayOfWeek
     *  retentionValue
     *
     * */
    _setInitData: function( scheduleSeq, templateSeq, paramObj ) {
        paramObj = paramObj || {};
        this.scheduleSeq = scheduleSeq;
        this.templateSeq = templateSeq;
        this.selectSMTP  = paramObj['selectSMTP'];

        var convertRetentionUnit = {
            1: 'Days',
            2: 'Weeks',
            3: 'Months',
            4: 'Years'
        };

        var retentionUnit  = convertRetentionUnit[paramObj['intervalUnit']] || '';
        var retentionValue = paramObj['retentionValue'] || (paramObj['reportType'] == 1 ? 30 : 1);

        this.reportRetentionPeriodNumberField.setValue(retentionValue);
        this.retentionUnitLabel.setText( retentionValue == 1 ? retentionUnit.slice(0,retentionUnit.length-1) : retentionUnit );
        this.signatureCheckBox.setValue(paramObj['mailSignature']);

        // Set Schedule
        this.scheduleForm._setSchedule(paramObj);
    }

});