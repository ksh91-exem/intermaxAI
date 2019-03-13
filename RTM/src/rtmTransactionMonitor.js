Ext.define('rtm.src.rtmTransactionMonitor', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Transaction Monitor'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    interval: 1000,

    listeners: {
        destroy: function() {
            // 연결 끊어줌.
            this.chart.txnInfo = null;
            this.chart.target  = null;

            if (this.timer) {
                clearTimeout(this.timer);
            }
            if (this.checkValueNCount) {
                clearTimeout(this.checkValueNCount);
            }
            Ext.Array.remove(Comm.onActivityTarget, this);
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.totalCountText = common.Util.TR('Total Count') + ' : ';
        this.maxOverText    = common.Util.TR('Max Over Count') + ' : ';
        this.maxValueText   = common.Util.TR('Max Elapsed Time (Sec)') + ' : ';

        this.isMemoryDB = (common.Util.isUsedMemoryDB && common.Util.isUsedMemoryDB() === true);

        this.topologyFilterWasNames = [];

        this.responseInspectorClass = 'view.ResponseInspector';
        this.responseInspectorTitle = common.Util.TR('Transaction Trend');
        this.responseInspectorType  = 'WAS';

        this.envKeyChartOption = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_transactionMonitor_chartOption';
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

        this.checkFilterWas();

        // 토폴로지 뷰에서 연계하여 표시가 된 경우 frameChagng 함수가 없으므로 함수 유무를 체크함.
        if (this.frameChange) {
            this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

            // 선택된 서버 정보가 있는 경우 해당 서버만 표시가 되게 필터하여 표시
            if (this.selectedServerNames.length > 0 && this.selectedServerNames.length !== this.serverIdArr.length) {
                this.frameChange(this.selectedServerNames);

            } else {
                this.frameChange();
            }
        }

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
            target: this.chartArea,
            toFixedNumber: 0,
            txnInfo: common.RTMDataManager.txnMonitorInfo,
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

                var minElapsed = Math.floor((offset.y - 0.1)* 1000);
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
                     // +- 0.1 elapse
                    elapseRange: [ minElapsed, Math.ceil((offset.y2 + 0.1) * 1000) ]
                };

                if (this.monitorType === 'CD') {
                    retrieveRange.elapseRange[0] = Math.floor(retrieveRange.elapseRange[0] / 1000);
                    retrieveRange.elapseRange[1] = Math.ceil(retrieveRange.elapseRange[1] / 1000);
                }

                var selectedServerName = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

                selectedServerName = Ext.Array.intersect(this.serverNameArr, selectedServerName);

                // 1. 모니터링 대상이 되는 서버가 없는 경우, 드래그시 PA화면으로 연계처리를 하지 않는다.
                // 모니터링 서버가 없기 때문에 데이터 조회를 할 수 없음.
                // 2. 토폴로지 뷰 화면에서 오픈되지 않은 경우만 화면 타입을 체크하며 토폴로지 뷰에서 오픈된 화면인 경우에는 체크하지 않는다.
                if (this.topologyFilterWasNames.length === 0 && this.openViewType === 'WAS' && selectedServerName && selectedServerName.length <= 0) {
                    return;
                }

                //Set Filter - Was
                 if (this.topologyFilterWasNames.length > 0) {
                    retrieveRange.wasName = this.topologyFilterWasNames.concat();

                } else if (selectedServerName.length !== this.serverIdArr.length && selectedServerName.length > 0) {
                    retrieveRange.wasName = [].concat(selectedServerName);

                } else {
                    retrieveRange.wasName = 'All';
                }

                //Set Filter - IP
                retrieveRange.ip = '%';

                // Exception Transaction
                retrieveRange.isExceptoin = this.chart.isOnlyErrorTxn;

                //15.07.17 PA 화면 전환을 빠르게 하기위해서 수정 (수정후)
                var inspector;

                // 트랜잭션 상세 팝업화면으로 표시하는지 체크
                if (this.monitorType === 'WEB' && this.openTxnList) {
                    /*
                     * [스펙 사항]
                     * 웹 모니터링 화면인 경우 트랜잭션 조회화면으로 넘어가지 않고 트랜잭션 목록 화면을
                     * 팝업으로 표시하도록 한다.
                     */
                    this.openTxnList(retrieveRange);
                } else if (common.Menu.useElapseDistribution) {
                    var currentWidth = 1500;
                    var currentHeight  = 1000;

                    var elapseDistRange = {
                        fromTime  : Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s' ),
                        toTime    : Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s' ),
                        minElapse : retrieveRange.elapseRange[0],
                        maxElapse : retrieveRange.elapseRange[1],
                        clientIp  : '',
                        txnName   : '',
                        exception : '',
                        loginName : '',
                        serverType: this.monitorType
                    };

                    if (retrieveRange.isExceptoin) {
                        elapseDistRange.exception = 'exist';
                    }

                    if (this.chart.selectedWasIdArr && this.chart.selectedWasIdArr.length > 0) {
                        elapseDistRange.wasId = this.chart.selectedWasIdArr.join(',');

                    } else {
                        elapseDistRange.wasId = Comm.RTComm.getSelectedIdArr(this.monitorType).join(',');
                    }

                    localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(elapseDistRange));

                    var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;
                    realtime.txnPopupMonitorWindow = window.open('../txnDetail/txnDetail.html', 'hide_referrer_1', popupOptions);
                } else if (this.responseInspectorClass) {
                    inspector = Ext.create(this.responseInspectorClass, {
                        title: this.responseInspectorTitle,
                        closable: true,
                        isAllWasRetrieve: false,
                        detailScatterYRange: 'fixed',
                        autoRetrieveRange: retrieveRange,
                        monitorType : this.responseInspectorType,
                        isRTM       : true
                    });

                    inspector.loadingMask = Ext.create('Exem.LoadingMask', {
                        target: inspector,
                        type  : 'large-whirlpool'
                    });

                    var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                    mainTab.add(inspector);
                    mainTab.setActiveTab(inspector);
                    inspector.loadingMask.show();

                    setTimeout(function() {
                        inspector.init();

                        if (typeof inspector.liveScatter !== 'undefined') {
                            inspector.liveScatter.lastRetrievedRange = retrieveRange;
                        }
                        inspector.loadingMask.hide();
                    }.bind(this), 10);
                }

                this.chart.clearSelection();
            }.bind(this),
            popupTrend: function() {
                if (this.isEnablePopupTrend()) {
                    var popupOptions = 'width=850px,height=550px';
                    realtime.txnPopupMonitorWindow = window.open('../txnDetail/transaction.html', 'IMX_Transaction_Trend_Popup_Monitor', popupOptions);
                    realtime.txnPopupMonitorType = this.responseInspectorType;
                    realtime.isBizView = false;

                    if (this.topologyFilterWasNames.length > 0) {
                        realtime.txnPopupMonitorWindow.filterWasNames = this.topologyFilterWasNames.concat();
                    }
                }
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
     * Topology View에서 실행 유무 체크.
     * Topology View에서 실행된 경우 해당 WAS들에 대해서만 필터링되어 표시되도록 설정함.
     */
    checkFilterWas: function() {
        this.popupFilterWasId = realtime.openTxnFilterWasId;
        var nodeName = realtime.openTxnFilterNodeName;
        realtime.openTxnFilterWasId = null;
        realtime.openTxnFilterNodeName = null;

        // 특정 WAS를 보기 위해서 실행되었는지 체크,
        // 지정된 WAS ID가 있으면 해당되는 WAS 정보만 보여준다.
        if (this.popupFilterWasId) {
            var wasName = '';
            var wasId;

            if (Number.isInteger(this.popupFilterWasId)) {
                this.chart.selectedWasIdArr = [this.popupFilterWasId];
            } else {
                this.chart.selectedWasIdArr = this.popupFilterWasId.split(',');
            }

            for (var ix = 0; ix < this.chart.selectedWasIdArr.length; ix++) {
                wasId = this.chart.selectedWasIdArr[ix];
                this.chart.selectedWasIdArr[ix] = +wasId;
                wasName += (((ix === 0)? '':',') + Comm.RTComm.getWASNamebyId(wasId));
                this.topologyFilterWasNames[this.topologyFilterWasNames.length] = Comm.RTComm.getWASNamebyId(wasId);
            }
            this.up().setTitle(this.title + ' ('+ (nodeName || wasName) +')');

            // 메인 화면 좌측 메뉴에서 WAS를 선택하는 경우에 표시되는 WAS가 변경되지 않도록
            // 관련 함수를 null 처리.
            this.frameChange = null;
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
        self.optoinOkBtnFlag =  false;

        self.changeValueWindow = Ext.create('Exem.XMWindow', {
            title: common.Util.TR('Transaction Monitor Option'),
            width: 350,
            height: 310,
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
                }
            ],
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
                            radius          : self.pointSizeField.getValue()
                        };

                        common.WebEnv.Save(this.envKeyChartOption, JSON.stringify(dataObj));
                        self.optoinOkBtnFlag = false;
                    }
                }
            }
        });

        self.visibleMaxInfo =  Ext.create('Ext.form.field.Checkbox',{
            checked : true,
            x: 20,
            y: 45,
            boxLabel: common.Util.TR('Visible Max Info')
        });

        self.radioBoxCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            x : 10,
            y : 5,
            margin : '5 0 0 10',
            cls : 'rtm-transactionmonitor-radioBoxCon'
        });

        self.filterError = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Error Transaction'),
            cls     : 'rtm-combobox-label',
            margin  : '5 0 0 10',
            x       : 11,
            y       : 75,
            checked : false
        });

        var maxValueCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            flex : 1
        });

        self.autoScaleRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('Auto Scale'),
            flex     : 1,
            name     : 'optiontype'
        });

        self.maxValueRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('Set Max Value'),
            width    : 85,
            name     : 'optiontype',
            checked  : true,
            listeners : {
                scope: this,
                change: function(self, newValue) {
                    if (newValue) {
                        this.autoScaleRadio.setValue(false);
                        this.setMaxField.setDisabled(false);
                        this.visibleMaxInfo.setDisabled(false);
                    } else {
                        this.autoScaleRadio.setValue(true);
                        this.visibleMaxInfo.setValue(false);
                        this.visibleMaxInfo.setDisabled(true);
                        this.setMaxField.setDisabled(true);
                    }
                }
            }
        });

        self.setMaxField = Ext.create('Ext.form.field.Number', {
            fieldLabel: ' ',
            width: 60,
            labelWidth: 5,
            maxValue: 9999999,
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

        maxValueCon.add(self.maxValueRadio, self.setMaxField);
        self.radioBoxCon.add(self.autoScaleRadio, maxValueCon);

        self.elapseFilterBoxCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            x : 10,
            y : 40,
            margin : '5 0 0 10',
            cls : 'rtm-transactionmonitor-radioBoxCon'
        });

        self.defaultMinRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel : common.Util.TR('Default Min Value'),
            flex     : 1,
            name     : 'optionMinType'
        });

        var minValueCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            flex : 1
        });

        self.minValueRadio = Ext.create('Ext.form.field.Radio', {
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

        self.setMinField = Ext.create('Ext.form.field.Number', {
            fieldLabel: ' ',
            width: 60,
            labelWidth: 5,
            maxValue: 9999999,
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

        minValueCon.add(self.minValueRadio, self.setMinField);
        self.elapseFilterBoxCon.add(self.defaultMinRadio, minValueCon);

        self.maxCheck =  Ext.create('Ext.form.field.Checkbox',{
            margin  : '5 0 0 10',
            checked : false,
            x: 10,
            y: 5
        });

        self.pointSizeField = Ext.create('Ext.form.field.Number', {
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

        self.setPointArea = Ext.create('Ext.form.FieldSet',{
            width : '100%',
            height: 100,
            title :  common.Util.TR('Set Dot Size'),
            layout: {
                type :'vbox'
            },
            cls: 'rtm-transactionmonitor-pointfield',
            margin: '0 0 0 20',
            x: 0,
            y: 120
        });

        var sampleArea = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 40,
            layout: 'hbox',
            margin : '15 0 0 0'
        });

        self.setPointArea.add(self.pointSizeField, sampleArea);
        self.changeValueWindow.add(self.radioBoxCon, self.elapseFilterBoxCon, self.filterError, self.visibleMaxInfo, self.setPointArea);

        self.addExample(sampleArea, 1 , 2);
        self.addExample(sampleArea, 2 , 4);
        self.addExample(sampleArea, 3 , 6);
        self.addExample(sampleArea, 4 , 8);
        self.addExample(sampleArea, 5 , 10);
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

            //this.totalCountLabel.setText(this.totalCountText + totalCount);
            this.checkMaxOverNValue();

            self.chart.customYaxisMax = changeMaxValue;
            self.chart.isAutoScale = false;
        }

        // 최소값을 설정
        if (isSetMinValue) {
            if (isSetMaxValue && changeMaxValue <= changeMinValue ) {
                Ext.Msg.alert(common.Util.TR('Change Max Value'), common.Util.TR('Please enter a value less than the maximum value.'));
                return;
            }

            //this.totalCountLabel.setText(this.totalCountText + totalCount);
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
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * 선택된 서버 목록으로 재설정.
     *
     * @param {string[]} serverNameList - 서버명 배열
     * @param {string[] | number[]} serverIDList - 서버 ID 배열
     */
    frameChange: function(serverNameList, serverIDList) {

        // 변형 뷰에서는 serverNameList 가 넘어오고 ( 이름 ) 그룹 트랜잭션에서는 serverIDList 로 넘어온다.
        var serverIdArr = [];
        var idx, serverName;

        if (serverNameList) {
            for (var i = 0, icnt = serverNameList.length; i < icnt; ++i) {
                serverName = serverNameList[i];
                idx = this.serverNameArr.indexOf(serverName) ;

                if (idx === -1 ) {
                    continue;
                }

                serverIdArr[serverIdArr.length] = +this.serverIdArr[idx];
            }
        }

        if (Ext.isEmpty(serverIDList) !== true && typeof(serverIDList.length) === 'number') {
            serverIdArr = [].concat( serverIDList );
        }

        if (serverIdArr.length <= 0) {
            serverIdArr = this.serverIdArr.concat();
        }

        // 모니터링 대상 서버가 없는 경우 트랜잭션 모니터에 다른 서버 유형의 점 데이터가 표시되는 것을 막기위해
        // 존재하지 않는 임의의 값을 설정하여 표시되지 않게 처리함.
        // WAS 모니터링이 기본으로 설계가 되어 있는데 WAS를 모니터링 하지 않는 경우가 발생되면서 처리함.
        if (serverIdArr.length <= 0) {
            serverIdArr = [-1000];
        }

        this.chart.selectedWasIdArr = serverIdArr.concat();

        serverIdArr    = null;
        serverNameList = null;
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
     * 장기추이 모니터 팝업 화면을 표시할 대상인지 체크.
     *
     * @return {boolean} true: 장기추이 모니터 팝업 화면 표시, false: 팝업 화면 비표시
     */
    isEnablePopupTrend: function() {
        var isEnable = false;

        if (this.isMemoryDB && common.Menu.useTxnTrendMonitor && this.monitorType !== 'WEB') {
            isEnable = true;
        }
        return isEnable;
    },


    /**
     * 차트 그리기
     */
    drawFrame: function() {

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.chart.draw();

        this.checkMaxOverNValue();

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
