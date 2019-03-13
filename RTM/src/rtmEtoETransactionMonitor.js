Ext.define('rtm.src.rtmEtoETransactionMonitor', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('EtoE Transaction Monitor') + ' (ms)',
    layout: 'fit',
    width : '100%',
    height: '100%',

    interval: 1000 * 60 * 5,   // 5분

    txnMonitorRange: 30,       // 30분

    listeners: {
        destroy: function() {
            // 연결 끊어줌.
            this.chart.txnInfo = null;
            this.chart.target  = null;

            if (this.timer) {
                clearTimeout(this.timer);
            }

            Ext.Array.remove(Comm.onActivityTarget, this);
        }
    },

    initProperty: function() {
        this.monitorType  = 'Business';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getBizIdList(Comm.businessRegisterInfo);
        this.serverNameArr = Comm.RTComm.getBizNameList(Comm.businessRegisterInfo);

        this.totalCountText = common.Util.TR('Total Count') + ' : ';
        this.maxOverText    = common.Util.TR('Max Over Count') + ' : ';
        this.maxValueText   = common.Util.TR('Max Elapsed Time (Sec)') + ' : ';

        this.envKeyChartOption = 'rtm_etoe_transactionMonitor_chartOption';

        this.txnMonitorInfo = {
            data      : null,
            range     : 30,      // 30 분
            startIndex: 0
        };

        this.allBizIdList = [];

        this.txnMonitorInfo.length   = this.txnMonitorInfo.range * 60;
        this.txnMonitorInfo.endIndex = this.txnMonitorInfo.length - 1;
        this.txnMonitorInfo.toTime   = +new Date(realtime.lastestTime);
        this.txnMonitorInfo.fromTime = this.txnMonitorInfo.toTime - (this.txnMonitorInfo.range  * 1000 * 60);

        // data[0] 가 fromTime. index가 증가 할수록 1초씩 증가
        this.txnMonitorInfo.data = [];
        this.txnMonitorInfo.data.length = this.txnMonitorInfo.length;
    },

    init: function() {
        this.initProperty();

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 10 0 10'
        });
        this.add(this.background);

        this.titleArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 26,
            layout : {
                type : 'hbox'
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '5 0 0 5',
            cls    : 'header-title',
            text   : this.title
        });

        this.optionButton = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '7 0 0 0',
            html  : '<div class="frame-option-icon" title="' + common.Util.TR('option') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function() {
                        this.changeValueWindow.show();
                    }, this);
                }
            }
        });

        this.titleArea.add(this.frameTitle,{xtype: 'tbfill', flex: 1 }, this.optionButton);

        this.createOptionWindow();

        this.checkArea = Ext.create('Ext.container.Container', {
            width: '100%',
            height: 23,
            layout: 'hbox',
            hidden: false
        });

        this.maxValueContainer = Ext.create('Ext.container.Container', {
            height: 23,
            hidden: false,
            layout: 'hbox',
            margin: '4 0 0 5',
            items : [{
                xtype : 'label',
                height: 22,
                itemId: 'totalCount',
                text  : 'Total Count',
                margin: '3 0 0 0',
                hidden: false,
                cls   : 'header-title'
            }, {
                xtype : 'label',
                height: 22,
                itemId: 'overCount',
                text  : 'Max Over Count',
                margin: '3 0 0 0',
                hidden: true,
                cls   : 'header-title'
            }, {
                xtype : 'label',
                height: 22,
                width : 200,
                itemId: 'maxValue',
                text  : 'Max Value',
                margin: '3 0 0 10',
                hidden: true,
                cls   : 'header-title'
            }]
        });

        this.errorTxnLabel = Ext.create('Ext.form.Label', {
            height: 22,
            text  : common.Util.TR('Error Transaction'),
            margin: '7 10 0 0',
            hidden: true,
            cls   : 'header-title'
        });

        this.totalCountLabel = this.maxValueContainer.getComponent('totalCount');
        this.maxOverLabel = this.maxValueContainer.getComponent('overCount');
        this.maxValueLabel = this.maxValueContainer.getComponent('maxValue');

        this.checkArea.add(this.maxValueContainer,{xtype: 'tbspacer', flex: 1}, this.errorTxnLabel);

        this.chartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            flex: 1,
            cls : 'rtm-transaction'
        });

        this.background.add(this.titleArea, this.checkArea, this.chartArea);

        this.createTxnMonitorChart();

        this.drawFrame();

        if (this.floatingLayer) {
            this.frameTitle.hide();
        }
    },

    /**
     * 트랜잭션 모니터 점 차트 구성
     */
    createTxnMonitorChart: function() {
        var girdLineColor;
        var borderColor;
        var theme = Comm.RTComm.getCurrentTheme();
        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        switch (theme) {
            case 'Black' :
                labelStyle.color = '#fff';
                girdLineColor    = '#525359';
                borderColor      = '#81858A';
                break;
            case 'Gray' :
                labelStyle.color = '#ABAEB5';
                girdLineColor    = '#525359';
                borderColor      = '#81858A';
                break;
            default :
                labelStyle.color = '#555555';
                girdLineColor    = '#F0F0F0';
                borderColor      = '#ccc';
                break;
        }

        this.chart = EXEM.cls.create('XMTxnMonitorChart', {
            target          : this.chartArea,
            toFixedNumber   : 0,
            txnInfo         : this.txnMonitorInfo,
            displayTimeRange: this.txnMonitorRange,
            chartProperty: {
                selection: {
                    show: true
                },
                xaxis: {
                    labelStyle: labelStyle
                },
                yaxis: {
                    autoscaleRatio: 0.15,
                    labelStyle: labelStyle
                },
                grid: {
                    gridLineColor: girdLineColor,
                    border: {
                        color: borderColor
                    }
                }
            },
            xLabelFormat: function(value) {
                var date = new Date(+value);
                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
            },
            selectionEvent: function(param) {
                var offset = param.offset;

                if (offset.x === offset.x2 && offset.y === offset.y2) {
                    return;
                }

                if (offset.y2 < 0 || offset.x > offset.x2 || offset.y > offset.y2 ) {
                    this.chart.clearSelection();
                    return;
                }

                if (!this.chart.isAutoScale && offset.y2 >= this.chart.customYaxisMax) {
                    offset.y2 = this.chart.maxTimeValue || this.chart.customYaxisMax;
                }

                var minElapsed = offset.y;
                if (minElapsed < 0 ) {
                    minElapsed = 0;
                }

                //Set Filter - Time, Elapse time
                var retrieveRange = {
                    // millisecond 빼고  +- 1초
                    timeRange  : [
                        new Date(new Date(offset.x).setMilliseconds(0) - 1000),
                        new Date(new Date(offset.x2).setMilliseconds(0) + 1000)
                    ],

                    elapseRange: [ minElapsed, offset.y2 ]
                };

                retrieveRange.wasName = 'All';

                //Set Filter - IP
                retrieveRange.ip = '%';

                // Exception Transaction
                retrieveRange.isExceptoin = this.chart.isOnlyErrorTxn;

                var currentWidth = 1500;
                var currentHeight  = 1000;

                var elapseDistRange = {
                    fromTime  : Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s' ),
                    toTime    : Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s' ),
                    minElapse : retrieveRange.elapseRange[0],
                    maxElapse : retrieveRange.elapseRange[1],
                    clientIp  : '',
                    txnName   : '',
                    txCode    : '',
                    serverName: '',
                    exception : '',
                    loginName : '',
                    gid       : '',
                    fetchCnt  : 0,
                    sqlElapseTime : 0,
                    sqlExecCnt: 0,
                    tid       : 0,
                    pcid      : '',
                    txnCode   : '',
                    businessId: this.allBizIdList.join(','),
                    msFromTime: Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s.u' ),
                    msToTime  : Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s.u' ),
                    serverType : 'E2E'
                };

                if (retrieveRange.isExceptoin) {
                    elapseDistRange.exception = 'exist';
                }

                window.selectedPopupMonitorType = 'E2E';

                localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(elapseDistRange));

                var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;
                realtime.txnPopupMonitorWindow = window.open('../txnDetail/txnDetail.html', 'hide_referrer_1', popupOptions);

                this.chart.clearSelection();
            }.bind(this)
        });

        this.setTxnMonitorOption();

        this.chart.init();
    },


    /**
     * Apply saved transaction monitor options.
     *
     * 트랜잭션 모니터 옵션 창에서 설정되어 저장된 정보가 있는 경우 해당 정보로 설정하여 표시.
     */
    setTxnMonitorOption: function() {
        var totalCount = common.Util.numberWithComma(this.chart.totalCount);
        var envInfo = Comm.web_env_info[this.envKeyChartOption];

        if (envInfo) {
            envInfo = JSON.parse(envInfo);
            if (envInfo.isSetMaxValue) {
                this.chart.customYaxisMax = envInfo.maxValue;
                this.chart.isAutoScale = false;
                this.totalCountLabel.setText(this.totalCountText + totalCount);
                this.checkMaxOverNValue();
            }

            if (envInfo.isSetMinValue) {
                this.chart.customYaxisMin = envInfo.minValue || 0;
                this.chart.isMinValue = true;
                this.checkMaxOverNValue();
            }

            if (envInfo.isOnlyErrorTxn) {
                this.chart.isOnlyErrorTxn = true;
                this.errorTxnLabel.show();
            }

            this.chart.options.series.point.radius = envInfo.radius;
        } else {
            this.chart.customYaxisMax = 8;
            this.chart.customYaxisMin = 0;
            this.chart.isAutoScale    = false;
            this.chart.isMinValue     = false;
            this.chart.isOnlyErrorTxn = false;
            this.chart.customRectSize = 2;
            this.totalCountLabel.setText(this.totalCountText + totalCount);
            this.errorTxnLabel.hide();

            this.checkMaxOverNValue();
        }
    },

    /**
     * 도트 크기 샘플을 보여주는 콤포넌트 구성.
     *
     * @param {Object} target
     * @param {number} label
     * @param {number} size
     */
    addExample: function(target, label, size) {
        var bgCon = Ext.create('Ext.container.Container',{
            flex  : 1,
            height: 40,
            layout: {
                type :'vbox',
                align: 'center'
            },
            pointSize : label,
            cls : 'rtm-transactionmonitor-example-bgCon',
            style : 'cursor : pointer;',
            listeners : {
                scope : this,
                render: function (me) {
                    var self = this;
                    me.getEl().on('click', function () {
                        self.pointSizeField.setRawValue(me.pointSize);
                    });
                }
            }
        });

        var exampleLabel = Ext.create('Ext.container.Container',{
            width : '100%',
            html  : '<div style="text-align: center;">'+label+'</div>',
            margin: '2 0 0 0',
            cls   : 'rtm-transactionmonitor-example-label'
        });

        var pointEx = Ext.create('Ext.container.Container',{
            width : size / 2 ,
            height: size / 2,
            margin: '2 0 0 0',
            style: {
                'background': '#00DDFF'
            }
        });
        bgCon.add(exampleLabel, pointEx);
        target.add(bgCon);
    },


    /**
     * 트랜잭션 모니터 옵션 창 구성.
     */
    createOptionWindow: function() {
        var self = this;
        this.optoinOkBtnFlag =  false;

        this.changeValueWindow = Ext.create('Exem.XMWindow', {
            title: common.Util.TR('Transaction Monitor Option'),
            width: 380,
            height: 350,
            resizable: false,
            closeAction: 'hide',
            html: '',
            layout: 'absolute',
            maximizable : false,
            closable: true,
            cls     : 'xm-dock-window-base rtm-transactionmonitor-option-window',
            bbar: [{
                xtype: 'container',
                width: '100%',
                height: 30,
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'middle'
                },
                cls     : 'rtm-transactionmonitor-optionwindow-bottomcon',
                border: false,
                items: [{
                    xtype: 'basebutton',
                    styleType: 1,
                    text: common.Util.TR('OK'),
                    height: 25,
                    cls: 'rtm-btn',
                    handler: self.handleTxnOption.bind(self)
                }, {
                    xtype: 'tbspacer',
                    width: 5
                }, {
                    xtype: 'basebutton',
                    styleType: 1,
                    height: 25,
                    text: common.Util.TR('Cancel'),
                    cls: 'rtm-btn',
                    handler: function () {
                        self.changeValueWindow.close();
                    }
                }
                ]
            }],
            listeners: {
                scope: this,
                beforeshow: function (_win) {
                    var envInfo = Comm.web_env_info[this.envKeyChartOption];
                    if (envInfo) {
                        envInfo = JSON.parse(envInfo);

                        if (!envInfo.isSetMinValue) {
                            envInfo.isSetMinValue = false;
                        }

                        if (!envInfo.minValue) {
                            envInfo.minValue = 1;
                        }

                        self.maxValueRadio.setValue(envInfo.isSetMaxValue);
                        self.minValueRadio.setValue(envInfo.isSetMinValue);
                        self.autoScaleRadio.setValue(!envInfo.isSetMaxValue);
                        self.defaultMinRadio.setValue(!envInfo.isSetMinValue);
                        self.setMaxField.setValue(envInfo.maxValue);
                        self.setMinField.setValue(envInfo.minValue);
                        self.pointSizeField.setValue(envInfo.radius);
                        self.filterError.setValue(envInfo.isOnlyErrorTxn);
                    } else {
                        self.maxValueRadio.setValue(true);
                        self.minValueRadio.setValue(true);
                        self.setMaxField.setValue(8);
                        self.setMinField.setValue(1);
                        self.pointSizeField.setValue(2);
                    }

                    self.visibleMaxInfo.hide();

                    _win.setTitle(common.Util.TR('Transaction Monitor Option'));
                },
                afterrender: function (_win) {
                    var envInfo = Comm.web_env_info[this.envKeyChartOption];

                    if (envInfo) {
                        envInfo = JSON.parse(envInfo);

                        var recordList = [];
                        var bizRecord;

                        for(var ix = 0, ixLen = envInfo.bizIdList.length; ix < ixLen; ix++) {
                            bizRecord = self.bizComboBox.getStore().findRecord('value', envInfo.bizIdList[ix]);
                            if (bizRecord) {
                                recordList.push(bizRecord);
                            }
                        }
                        self.bizComboBox.setValue(recordList);

                    } else {
                        self.bizComboBox.selectByIndex(0);
                    }

                },
                hide: function () {
                    self.setMaxField.setValue('');
                    self.setMinField.setValue(1);
                },
                beforehide: function() {
                    var maxValue, minValue;

                    if (self.maxValueRadio.getValue() === true) {
                        maxValue = self.setMaxField.getValue();
                    } else {
                        maxValue = 8;
                    }
                    if (self.minValueRadio.getValue() === true) {
                        minValue = self.setMinField.getValue();
                    } else {
                        minValue = 0;
                    }

                    if (self.optoinOkBtnFlag === true) {
                        var dataObj = {
                            isSetMaxValue   : self.maxValueRadio.getValue(),
                            isSetMinValue   : self.minValueRadio.getValue(),
                            isVisibleMaxInfo: self.visibleMaxInfo.getValue(),
                            isOnlyErrorTxn  : self.filterError.getValue(),
                            maxValue        : maxValue,
                            minValue        : minValue,
                            radius          : self.pointSizeField.getValue(),
                            bizIdList       : self.bizComboBox.getValue()
                        };

                        common.WebEnv.Save(this.envKeyChartOption, JSON.stringify(dataObj));
                        self.optoinOkBtnFlag = false;
                    }
                }
            }
        });

        var radioBoxCon = this.createOptionRadioBoxCon();

        var minValueBoxCon = this.createOptionMinBoxCon();

        var filterError = this.createFilterError();

        var visibleMaxInfo = this.createVisibleMaxInfo();

        var pointArea = this.createOptionPointArea();

        var bizSelect = this.createOptionBizSelect();

        this.changeValueWindow.add(radioBoxCon, minValueBoxCon, filterError, visibleMaxInfo, pointArea, bizSelect);
    },

    /**
     * 자동 비율 및 최대값 설정 메뉴 + 최소값 설정 추가.
     *
     * @returns {Ext.container.Container|*}
     */
    createOptionRadioBoxCon: function() {
        var self = this;

        this.radioBoxCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            x : 10,
            y : 5,
            margin : '5 0 0 10',
            cls : 'rtm-transactionmonitor-radioBoxCon'
        });

        this.autoScaleRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('Auto Scale'),
            flex     : 1,
            name     : 'optiontype'
        });

        var maxValueCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            flex : 1
        });

        this.maxValueRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('Set Max Value'),
            width    : 85,
            name     : 'optiontype',
            checked  : true,
            listeners : {
                change: function(me, newValue) {
                    if (newValue) {
                        self.autoScaleRadio.setValue(false);
                        self.setMaxField.setDisabled(false);
                        self.visibleMaxInfo.setDisabled(false);
                    } else {
                        self.autoScaleRadio.setValue(true);
                        self.visibleMaxInfo.setValue(false);
                        self.visibleMaxInfo.setDisabled(true);
                        self.setMaxField.setDisabled(true);
                    }
                }
            }
        });

        this.setMaxField = Ext.create('Ext.form.field.Number', {
            fieldLabel: ' ',
            width: 90,
            labelWidth: 5,
            maxValue: 99999999,
            minValue: 1,
            margin: '0 0 0 2',
            enforceMaxLength: true,
            enableKeyEvents: true,
            hideTrigger: true,
            step: 1,
            cls : 'rtm-list-condition',
            listeners: {
                keydown: function( numfield, e) {
                    // e.button 값이     189 == '.' 188?? '-'  68?? e
                    if (e.button === 189 || e.button === 188 || e.button === 68 ) {
                        e.stopEvent();
                    }
                },
                blur: function(me, e) {
                    var maxValue, minValue;

                    maxValue = me.getValue();
                    minValue = self.setMinField.getValue();

                    if(!maxValue && !minValue){
                        return;
                    }

                    maxValue = maxValue || me.maxValue;
                    minValue = minValue || me.minValue;

                    if (self.defaultMinRadio.getValue() === false && minValue >= maxValue) {
                        Ext.Msg.show({
                            title  : common.Util.TR('ERROR'),
                            msg    : common.Util.CTR('The minimum is greater than the maximum'),
                            buttons: Ext.Msg.OK,
                            icon   : Ext.MessageBox.ERROR
                        });
                        me.setValue(minValue + 1);
                        e.stopEvent();
                    } else {
                        me.setValue(maxValue);
                    }
                }
            }
        });

        maxValueCon.add(this.maxValueRadio, this.setMaxField);

        this.radioBoxCon.add(this.autoScaleRadio, maxValueCon);

        return this.radioBoxCon;
    },

    createOptionMinBoxCon: function() {
        var self = this;

        this.minValueBoxCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            x : 10,
            y : 40,
            margin : '5 0 0 10',
            cls : 'rtm-transactionmonitor-radioBoxCon'
        });

        this.defaultMinRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('Default Min Value'),
            flex     : 1,
            name     : 'optionMinType'
        });

        var minValueCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            flex : 1
        });

        this.minValueRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('Set Min Value'),
            width    : 85,
            name     : 'optionMinType',
            checked  : true,
            listeners : {
                scope: this,
                change: function(self, newValue) {
                    if (newValue) {
                        this.defaultMinRadio.setValue(false);
                        this.setMinField.setDisabled(false);
                    } else {
                        this.defaultMinRadio.setValue(true);
                        this.setMinField.setDisabled(true);
                    }
                }
            }
        });

        this.setMinField = Ext.create('Ext.form.field.Number', {
            fieldLabel: ' ',
            width: 90,
            labelWidth: 5,
            maxValue: 99999999,
            minValue: 1,
            margin: '0 0 0 2',
            enforceMaxLength: true,
            enableKeyEvents: true,
            hideTrigger: true,
            step: 1,
            cls : 'rtm-list-condition',
            listeners: {
                keydown: function( numfield, e) {
                    // e.button 값이     189 == '.' 188?? '-'  68?? e
                    if (e.button === 189 || e.button === 188 || e.button === 68 ) {
                        e.stopEvent();
                    }
                },
                blur: function(me, e) {
                    var maxValue, minValue;

                    maxValue = self.setMaxField.getValue();
                    minValue = me.getValue();

                    if (!maxValue && !minValue) {
                        return;
                    }

                    maxValue = maxValue || me.maxValue;
                    minValue = minValue || me.minValue;

                    if (self.autoScaleRadio.getValue() === false && minValue >= maxValue) {
                        Ext.Msg.show({
                            title  : common.Util.TR('ERROR'),
                            msg    : common.Util.CTR('The maximum is less than the minimum'),
                            buttons: Ext.Msg.OK,
                            icon   : Ext.MessageBox.ERROR
                        });
                        me.setValue(me.minValue);
                        e.stopEvent();
                    } else {
                        me.setValue(minValue);
                    }
                }
            }
        });

        //hbox
        minValueCon.add(this.minValueRadio, this.setMinField);

        this.minValueBoxCon.add(this.defaultMinRadio, minValueCon);

        return this.minValueBoxCon;
    },

    /**
     * 에러 트랜잭션 설정
     * @returns {Ext.form.field.Checkbox|*}
     */
    createFilterError: function() {
        this.filterError = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Error Transaction'),
            cls     : 'rtm-combobox-label',
            margin  : '5 0 0 10',
            x       : 11,
            y       : 75,
            checked : false
        });

        return this.filterError;
    },

    /**
     * 화면상에서는 보이지 않음(숨겨진 메뉴)
     * @returns {Ext.form.field.Checkbox|*}
     */
    createVisibleMaxInfo: function() {
        this.visibleMaxInfo =  Ext.create('Ext.form.field.Checkbox',{
            checked : true,
            x: 20,
            y: 45,
            boxLabel: common.Util.TR('Visible Max Info')
        });

        return this.visibleMaxInfo;
    },

    /**
     * 화면 도트 크기 설정
     * @returns {Ext.form.FieldSet|*}
     */
    createOptionPointArea: function() {
        this.setPointArea = Ext.create('Ext.form.FieldSet',{
            width : '100%',
            height: 100,
            title :  common.Util.TR('Set Dot Size'),
            layout: {
                type :'vbox'
            },
            cls: 'rtm-transactionmonitor-pointfield',
            margin: '0 0 0 20',
            x: 0,
            y: 160
        });

        this.pointSizeField = Ext.create('Ext.form.field.Number', {
            fieldLabel: common.Util.TR('Dot Size'),
            labelSeparator: '',
            width: 150,
            labelAlign: 'right',
            labelWidth: 100,
            maxValue: 5,
            minValue: 1,
            margin: '0 0 0 125',
            enforceMaxLength: true,
            enableKeyEvents: true,
            value :1,
            step: 1,
            cls : 'rtm-list-condition',
            listeners: {
                keydown: function( numfield, e) {
                    // e.button 값이     189 == '.' 188?? '-'  68?? e

                    if (e.button === 189 || e.button === 188 || e.button === 68 ) {
                        e.stopEvent();
                    }
                },
                keyup: function ( numfield) {
                    if (numfield.getValue() > 5) {
                        numfield.setValue(5);
                    }
                },
                blur: function(me) {
                    var value = me.getValue();
                    if (value > me.maxValue) {
                        me.setValue(me.maxValue);
                    } else if (value < me.minValue) {
                        me.setValue(me.minValue);
                    }
                }
            }
        });

        var sampleArea = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 40,
            layout: 'hbox',
            margin : '15 0 0 0'
        });

        this.setPointArea.add(this.pointSizeField, sampleArea);

        this.addExample(sampleArea, 1 , 2);
        this.addExample(sampleArea, 2 , 4);
        this.addExample(sampleArea, 3 , 6);
        this.addExample(sampleArea, 4 , 8);
        this.addExample(sampleArea, 5 , 10);

        return this.setPointArea;
    },

    /**
     * 업무 선택 옵션 추가.
     * @returns {Exem.AjaxComboBox|*}
     */
    createOptionBizSelect: function() {
        this.bizComboBox = Ext.create('Exem.AjaxComboBox', {
            x           : 13,
            y           : 115,
            width       : 330,
            labelWidth  : 60,
            labelAlign  : 'right',
            multiSelect : true,
            fieldLabel  : common.Util.TR('Select Business') + ' :',
            store       : Ext.create('Exem.Store'),
            editable    : false,
            cls         : 'rtm-list-condition'
        });

        var ix, ixLen, bizComboData = [];
        for( ix = 0, ixLen = this.serverNameArr.length; ix < ixLen; ix++){
            bizComboData.push({id: this.serverIdArr[ix], name: this.serverNameArr[ix], value: this.serverIdArr[ix]});
        }

        this.bizComboBox.setData(bizComboData);
        this.bizComboBox.setSearchField('name');

        return this.bizComboBox;
    },

    /**
     * 트랜잭션 모니터 옵션 정보 적용
     */
    handleTxnOption: function() {
        var self = this;

        self.optoinOkBtnFlag = true;

        var changeMaxValue = self.setMaxField.getValue();
        var changeMinValue = self.setMinField.getValue();

        self.chart.maxOverCount = 0;
        self.chart.maxTimeValue = 0;

        var totalCount = common.Util.numberWithComma(self.chart.totalCount);
        self.totalCountLabel.setText(self.totalCountText + totalCount);
        self.maxOverLabel.setText(self.maxOverText + self.chart.maxOverCount);
        self.maxValueLabel.setText(self.maxValueText +  self.chart.maxTimeValue);

        var isSetMaxValue = self.maxValueRadio.getValue();
        var isSetMinValue = self.minValueRadio.getValue();

        self.chart.customYaxisMax = null;
        self.chart.customYaxisMin = null;
        self.chart.isAutoScale = true;
        self.chart.isMinValue  = false;

        // 최대값을 설정
        if (isSetMaxValue) {
            if (changeMaxValue <= 0 ) {
                Ext.Msg.alert(common.Util.TR('Change Max Value'), common.Util.TR('Please enter a value greater than 0'));
                return;
            }

            this.checkMaxOverNValue();

            self.chart.customYaxisMax = changeMaxValue;
            self.chart.isAutoScale = false;
        }

        // 최소값을 설정
        if (isSetMinValue) {
            if (isSetMaxValue && changeMaxValue <= changeMinValue ) {
                Ext.Msg.show({
                    title  : common.Util.TR('ERROR'),
                    msg    : common.Util.CTR('The minimum is greater than the maximum'),
                    buttons: Ext.Msg.OK,
                    icon   : Ext.MessageBox.ERROR
                });
                return;
            }

            this.checkMaxOverNValue();

            self.chart.customYaxisMin = changeMinValue;
            self.chart.isMinValue = true;
        }

        if (!isSetMaxValue && !isSetMinValue) {
            self.visibleMaxInfo.setValue(false);

            self.chart.customYaxisMax = null;
            self.chart.customYaxisMin = null;
            self.chart.isAutoScale    = true;
            self.chart.isMinValue     = false;
            self.chart.liveOverData   = [];
            self.chart.liveExceptionData = [];
        }

        self.chart.draw();

        var pointSize = self.pointSizeField.getValue();
        if (Ext.isEmpty(pointSize) !== true) {
            self.chart.customRectSize = pointSize;
            self.chart.draw();
        }

        var isOnlyError = self.filterError.getValue();
        self.chart.isOnlyErrorTxn = isOnlyError;
        self.errorTxnLabel.setVisible(isOnlyError);

        self.changeValueWindow.close();

        self.getEtoETxnMonitorData();
    },


    /**
     * 최대값 정보 (최대 초과값, 최대 응답시간) 설정.
     */
    checkMaxOverNValue: function() {
        var totalCount = common.Util.numberWithComma(this.chart.totalCount);
        this.totalCountLabel.setText(this.totalCountText + totalCount);
        this.maxOverLabel.setText(this.maxOverText + this.chart.maxOverCount);
        this.maxValueLabel.setText(this.maxValueText + this.chart.maxTimeValue.toFixed(1));
    },


    /**
     * EtoE Transaction Monitor에 표시할 데이터 조회
     */
    getEtoETxnMonitorData: function() {

        var toTime   = common.Util.getDate(+new Date(realtime.lastestTime));
        var fromTime = common.Util.getDate(+new Date(toTime) - (this.txnMonitorInfo.range  * 1000 * 60));

        var ix, ixLen;
        var bizList = [],
            subBizIdList = [],
            childBizIdList = [];

        var isSetMaxValue = false,
            isSetMinValue = false;

        var isOnlyErrorTxn = false;
        var maxValue = 99999999999,
            minValue = 0;

        this.selectedServerIdArr = [];
        this.allBizIdList        = [];

        var envInfo = Comm.web_env_info[this.envKeyChartOption];

        if (envInfo) {
            envInfo = JSON.parse(envInfo);
            bizList = envInfo.bizIdList;

            for (ix = 0, ixLen = bizList.length; ix < ixLen; ix++) {
                subBizIdList = common.Util.getAllBizList(bizList[ix]);
                childBizIdList.push(subBizIdList);
            }

            for (ix = 0, ixLen = childBizIdList.length; ix < ixLen; ix++) {
                for (var jx = 0, jxLen = childBizIdList[ix].length; jx< jxLen; jx++) {
                    this.allBizIdList.push(childBizIdList[ix][jx]);
                }
            }

            isSetMaxValue = envInfo.isSetMaxValue;
            isSetMinValue = envInfo.isSetMinValue;

            maxValue = envInfo.maxValue;
            minValue = envInfo.minValue;

            isOnlyErrorTxn = envInfo.isOnlyErrorTxn;
        }

        var businessId = this.allBizIdList.join(',') || -1;

        //한국시간 offset값 -3240000이어서 기본값 음수.
        var timeZone = new Date().getTimezoneOffset() * 1000 * 60;

        //만약 offset값이 양수일 경우는 문자열 + 를 넣어서 sql상 error가 발생 안하도록 변경.
        if (timeZone > 0) {
            timeZone = '+' + timeZone;
        }

        var exceptionStr;

        if (isOnlyErrorTxn) {
            exceptionStr = 'AND e.exception_count > 0 ';
        } else{
            exceptionStr = '';
        }

        if (!isSetMaxValue) {
            maxValue = 99999999999;
        } else {
            maxValue = maxValue;
        }

        if (!isSetMinValue) {
            minValue = 0;
        } else {
            minValue = minValue;
        }

        var filterParams = {
            sql_file: 'IMXRT_EtoE_TransactionMonitor.sql',
            bind: [{
                name: 'maxElapse',
                type: SQLBindType.FLOAT,
                value: maxValue
            }, {
                name: 'minElapse',
                type: SQLBindType.FLOAT,
                value: minValue
            }, {
                name: 'fromtime',
                type: SQLBindType.STRING,
                value: fromTime
            }, {
                name: 'totime',
                type: SQLBindType.STRING,
                value: toTime
            }],
            replace_string: [{
                name: 'businessId',   value: businessId
            }, {
                name: 'exception',    value: exceptionStr
            }, {
                name: 'time_zone',    value: timeZone
            }]
        };

        WS.SQLExec(filterParams, function(header, data) {
            if (header.success) {
                var d = null;
                var time;
                var instanceId;
                var elapse;
                var diffSec;
                var idx;
                var type; // normal : 0 , exception 1
                var dupCount = 0;

                this.txnMonitorInfo.startIndex = 0;
                this.txnMonitorInfo.length     = this.txnMonitorInfo.range * 60;
                this.txnMonitorInfo.endIndex   = this.txnMonitorInfo.length - 1;

                // 트랜잭션 모니터 차트 하단에 표시되는 시간 축을 조회된 범위로 갱신함.
                this.txnMonitorInfo.toTime   = +new Date(toTime);
                this.txnMonitorInfo.fromTime = +new Date(fromTime);

                // data[0] 가 fromTime. index가 증가 할수록 1초씩 증가
                this.txnMonitorInfo.data = [];
                this.txnMonitorInfo.data.length = this.txnMonitorInfo.length;

                for (var ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                    d = data.rows[ix];

                    if (isNaN(new Date(+d[0]))) {
                        console.debug('was id : ' +  d[1] + '\t time : ' + d[0]);
                        continue;
                    }

                    time = +d[0];

                    if (Math.floor(time/1000 ) * 1000 > Math.floor(this.txnMonitorInfo.fromTime/1000 ) * 1000) {
                        instanceId = +d[1];

                        if (this.selectedServerIdArr.indexOf(instanceId) === -1) {
                            this.selectedServerIdArr.push(instanceId);
                        }

                        if (d[2] < 0) { // - 값이면 exception
                            type = 1;
                        } else {
                            type = 0;
                        }

                        elapse = Math.abs(d[2] * 1000);        // ms단위로 표시하기 위해서 1000을 곱하여 표시함.

                        dupCount = +d[3];

                        diffSec = Math.floor((this.txnMonitorInfo.toTime - (Math.floor( time / 1000 ) * 1000)) /1000);

                        idx = this.txnMonitorInfo.endIndex - diffSec;

                        if (idx < 0) {
                            idx = this.txnMonitorInfo.length + idx;
                        }

                        // 마지막 시간을 기준으로 화면 표시 시간범위 안에 속하는 데이터이면
                        if (idx >= 0 && idx < this.txnMonitorInfo.data.length) {
                            if (this.txnMonitorInfo.data[idx] == null) {
                                this.txnMonitorInfo.data[idx] = {
                                    data : [],
                                    max : {},
                                    errorMax: {},
                                    total: 0
                                };
                            }

                            if (type === 1) {
                                this.txnMonitorInfo.data[idx].errorMax[instanceId] = Math.max((this.txnMonitorInfo.data[idx].errorMax[instanceId] || 0), elapse);
                            }
                            this.txnMonitorInfo.data[idx].max[instanceId] = Math.max((this.txnMonitorInfo.data[idx].max[instanceId] || 0), elapse);
                            this.txnMonitorInfo.data[idx].data.push([ instanceId, elapse, type, dupCount]);
                        }
                    }

                }
            }
            this.chart.selectedWasIdArr = this.selectedServerIdArr.concat();
            this.chart.draw();

            this.checkMaxOverNValue();

        }, this);
    },


    /**
     * 차트 그리기
     */
    drawFrame: function() {

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.getEtoETxnMonitorData();

        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },


    /**
     * 트랜잭션 모니터 차트 렌더링 시직
     */
    frameRefresh: function() {
        setTimeout(this.drawFrame.bind(this),10);
    },


    /**
     * 트랜잭션 모니터 차트 렌더링 중지
     */
    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
});
