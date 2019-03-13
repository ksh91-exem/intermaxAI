Ext.application({
    name: 'IntermaxTransaction',
    appFolder: location.pathname.split('/')[1],

    launch: function() {
        if (!opener) {
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Sorry'));
            return;
        }
        $('#baseFrame').empty();
        $('#baseFrame').remove();

        // console.log('bizView:', opener.realtime.isBizView);
        // console.log('monitorType:', opener.realtime.txnPopupMonitorType);

        window.msgMap = opener.msgMap;
        window.Comm   = opener.Comm;
        window.common = opener.common;
        window.WS     = opener.WS;
        window.realtime = opener.realtime;
        //window.rtmMonitorType = !window.rtmMonitorType ? opener.window.rtmMonitorType : window.rtmMonitorType;
        this.monitorType = !window.realtime.txnPopupMonitorType ? opener.window.rtmMonitorType : window.realtime.txnPopupMonitorType;
        this.filterUrlTimer = null;
        this.filterIpTimer = null;
        this.filterLoginTimer = null;
        this.bizId  = opener.realtime.bizId;
        this.agentIdList = opener.realtime.agentIdList;
        this.bizData = opener.realtime.bizData;
        this.isBizView = opener.realtime.isBizView;

        // if(!this.isBizView){
        //     opener.realtime.isBizView = null;
        // }

        this.envKeyChartOption = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_transactionMonitor_chartOption';

        var theme = opener.Comm.RTComm.getCurrentTheme();
        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        this.filterFormat = {
            WAS_ID          : ' AND was_id IN ({0})',
            USER_ID         : ' AND userid like \'%{0}%\'',
            URL             : ' AND url like \'%{0}%\'',
            CLIENT_IP       : ' AND client_ip like \'%{0}%\'',
            GUID            : ' AND guid like \'%{0}%\'',
            EXCEPTION       : ' AND elapse < 0',
            SQL_FETCH_TIME  : ' AND fetch_time >= {0}',
            // SQL_ELASPED     : ' AND sql_elasped >= {0}'
            SQL_ELASPED     : ' AND sql_elasped >= {0}',
            BUSINESS_ID     : ' AND business_id IN ({0})'
        };

        this.openFilterFormat = {
            USER_ID         : '%{0}%',
            URL             : '%{0}%',
            CLIENT_IP       : '%{0}%',
            GUID            : '%{0}%'
        };

        var girdLineColor, borderColor, backColor;

        var isAddMenuLine = false;

        this.topBarHeight = (isAddMenuLine)? 90 : 60;
        this.bottomMarginHeight = (isAddMenuLine)? 190 : 160;

        switch (theme) {
            case 'Black' :
                labelStyle.color = '#fff';
                girdLineColor = '#525359';
                borderColor = '#81858A';
                backColor = '#212227';
                document.body.className = 'mx-theme-black';
                break;
            case 'Gray' :
                labelStyle.color = '#ABAEB5';
                girdLineColor = '#525359';
                borderColor = '#81858A';
                backColor = '#212227';
                document.body.className = 'mx-theme-gray';
                break;
            default :
                labelStyle.color = '#555555';
                girdLineColor = '#F0F0F0';
                borderColor = '#ccc';
                backColor = '#E5E5E5';
                break;
        }
        document.body.style.backgroundColor = backColor;

        var baseFrameDiv = document.createElement('div');
        baseFrameDiv.className = 'rtm-base';
        baseFrameDiv.id = 'baseFrame';
        baseFrameDiv.style.position = 'absolute';
        baseFrameDiv.style.top = '0px';
        baseFrameDiv.style.left = '0px';
        baseFrameDiv.style.bottom = '0px';
        baseFrameDiv.style.width = '100%';
        baseFrameDiv.style.height = '100%';
        baseFrameDiv.style.minWidth = '750px';
        baseFrameDiv.style.minHeight = '400px';

        document.body.appendChild(baseFrameDiv);

        if (opener.window.nation === 'ja') {
            document.body.classList.add('ja');
        } else {
            document.body.classList.remove('ja');
        }

        this.defaultFiters = {
            range : 110,
            filter: '1 = 1'
        };

        this.baseFrame = Ext.create('Exem.Container', {
            layout: 'vbox',
            width : '100%',
            height: '100%',
            minWidth: 750,
            minHeight: 400,
            renderTo: 'baseFrame'
        });

        this.chartBase = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            cls   : 'rtm-panel',
            width : '100%',
            height: '100%',
            flex  : 1,
            margin: '5 5 5 5'
        });

        var chartArea = Ext.create('Ext.container.Container', {
            itemId: 'txn-chart-area',
            cls   : 'rtm-panel',
            layout: 'fit',
            width : '100%',
            height: (window.innerHeight - this.bottomMarginHeight),
            flex  : 1,
            margin: '15 5 5 15'
        });

        var titleArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 26,
            layout : {
                type : 'hbox'
            }
        });

        var frameTitle = Ext.create('Ext.form.Label', {
            height : 20,
            margin : '5 0 0 5',
            cls    : 'header-title',
            text   : common.Util.TR('Transaction Trend Monitor')
        });

        titleArea.add(frameTitle);

        this.visibleMaxInfo =  Ext.create('Ext.form.field.Checkbox', {
            checked : false,
            x: 20,
            y: 45,
            boxLabel: common.Util.TR('Visible Max Info')
        });

        this.maxValueContainer = Ext.create('Ext.container.Container', {
            height: 23,
            layout: 'hbox',
            margin: '0 0 2 10',
            items : [{
                xtype : 'label',
                height: 22,
                itemId: 'totalCount',
                text  : common.Util.TR('Total Count'),
                margin: '3 0 0 0',
                hidden: false,
                cls   : 'header-title'
            },{
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
        this.totalCountLabel = this.maxValueContainer.getComponent('totalCount');
        this.maxOverLabel = this.maxValueContainer.getComponent('overCount');
        this.maxValueLabel = this.maxValueContainer.getComponent('maxValue');

        this.totalCountText = common.Util.TR('Total Count') + ' : ';
        this.maxOverText  = common.Util.TR('Max Over Count') + ' : ';
        this.maxValueText = common.Util.TR('Max Elapsed Time (Sec)') + ' : ';

        this.maxTimeRange = realtime.txnPopupMonitorTimeRange || 120;

        var topBarArea = Ext.create('Ext.container.Container', {
            cls    : 'rtm-panel',
            layout : 'vbox',
            width  : '100%',
            height : this.topBarHeight,
            margin: '5 5 0 5'
        });

        var bottomArea = Ext.create('Ext.container.Container', {
            cls    : 'rtm-panel',
            layout : 'hbox',
            width  : '100%',
            height : 26,
            margin: '0 5 0 5'
        });

        var firstRowBar = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            width  : '100%',
            height : 30,
            margin: '0 5 0 5'
        });

        var secondRowBar = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            width  : '100%',
            height : 30,
            margin: '0 5 0 5'
        });

        var thirdRowBar = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width  : '100%',
            height : 30,
            margin: '0 5 0 5'
        });

        topBarArea.add(firstRowBar, secondRowBar);

        if (isAddMenuLine) {
            topBarArea.add(thirdRowBar);
        }

        this.wasField = Ext.create('Exem.wasDBComboBox', {
            cls             : 'rtm-list-condition',
            itemId          : 'wasCombo',
            margin          : '5 10 0 3',
            width           : 400,
            comboLabelWidth : (Comm.Lang === 'ja') ? 75 : 50,
            comboWidth      : 250,
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            linkMonitorType : this.monitorType,
            agentIdList     : this.agentIdList,
            isBizView       : this.isBizView,
            isAddOldServer  : false,
            listeners : {
                scope : this,
                afterrender: function(wasField){
                    wasField.WASDBCombobox.addListener('select', function(combo, records){
                        if (combo.multiSelect === true) {
                            // multiSelect인 경우 record는 array로 들어온다.마지막에 선택된게 (All)이면 나머지는 해제.
                            var lastSelect = records[records.length-1];

                            if (lastSelect.data.name === common.Util.TR('(All)')) {
                                combo.reset();
                                combo.setValue( common.Util.TR('(All)') );
                            } else {
                                if (combo.getValue().indexOf( common.Util.TR('(All)') ) !== -1) {
                                    combo.reset();
                                    combo.setValue(lastSelect.data.value);
                                }
                            }
                        }
                    }.bind(this)) ;

                    var filterNames;

                    var selectedServerList = Comm.RTComm.getSelectedNameArr(this.monitorType, opener.rtmMonitorType);

                    if (window.filterWasNames && window.filterWasNames.length > 0) {
                        filterNames = window.filterWasNames.join(',');
                        window.filterWasNames = null;

                        //} else if (Comm.selectedWasArr.length < Comm.wasIdArr.length) {
                    } else if (selectedServerList && selectedServerList.length > 0) {
                        filterNames = selectedServerList.join(',');
                    }

                    if (filterNames) {
                        wasField.selectByValues(filterNames);
                    }
                }
            }
        });
        this.wasField.WASDBCombobox.labelAlign = 'left';

//        var optionButton = Ext.create('Ext.container.Container', {
//            width : 17,
//            height: 17,
//            margin: '7 0 0 0',
//            html  : '<div class="frame-option-icon" title="' + common.Util.TR('option') + '"/>',
//            listeners: {
//                scope: this,
//                render : function(me) {
//                    me.el.on( 'click', function() {
//                        if (this.filterWindow) {
//                            this.filterWindow.close();
//                        }
//                        this.changeValueWindow.show();
//                        this.changeValueWindow.setPosition(110, 62);
//
//                    }, this);
//                }
//            }
//        });

        this.isAutoRefresh = true;

        var toggleRealtime = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Refresh'),
            name    : 'autoRefreshCheckbox',
            cls     : 'rtm-combobox-label',
            margin  : '1 0 0 10',
            checked : true,
            listeners: {
                scope: this,
                change: function(checkbox, newVal) {
                    this.isAutoRefresh = newVal;

                    if (newVal === false) {
                        if (this.timeoutId) {
                            clearTimeout(this.timeoutId);
                        }
                    } else {
                        this.drawFrame();
                    }
                }
            }
        });

        this.createFilterForm();

        //firstRowBar.add(this.wasField, {xtype: 'tbfill', flex: 1 }, this.filterError, optionButton);
        firstRowBar.add(this.wasField, this.filterError);

        secondRowBar.add(this.filterUrl, this.filterIPText, this.filterLoginName, {xtype: 'tbfill', flex: 1 }, this.filterButton);

        if (isAddMenuLine) {
            thirdRowBar.add(this.filterSqlElapsed, this.filterFetchTime);
        }

        this.addSlider();

        bottomArea.add(toggleRealtime);

        this.chartBase.add(chartArea, this.maxValueContainer);
        this.baseFrame.add(titleArea, topBarArea, this.chartBase, bottomArea);

        this.txnComponentGuid = Ext.id().replace('ext', 'txn');

        if (common.RTMDataManager.txnTrendData.guidList.indexOf(this.txnComponentGuid) === -1) {
            common.RTMDataManager.txnTrendData.guidList.push(this.txnComponentGuid);
        }

        common.RTMDataManager.txnTrendData[this.txnComponentGuid] = {
            data : null,
            range: 110,
            startIndex : 0
        };

        this.txnTrendData = common.RTMDataManager.txnTrendData[this.txnComponentGuid];

        this.txnTrendData.maxValue = 0;
        this.txnTrendData.length = this.txnTrendData.range * 60;
        this.txnTrendData.endIndex = this.txnTrendData.length - 1;
        this.txnTrendData.toTime = +common.RTMDataManager.txnMonitorInfo.toTime;
        this.txnTrendData.fromTime = this.txnTrendData.toTime - (this.txnTrendData.range  * 1000 * 60);

        this.txnTrendData.data = [];
        this.txnTrendData.data.length = this.txnTrendData.length;

        this.setLoadingMask(true);
        this.filterDatas = this.getFilterParams();
        common.RTMDataManager.getTxnMonitorTrendSplitData(this.txnComponentGuid, this.defaultFiters.range, this.filterDatas, function() {
            this.setLoadingMask(false);
        }.bind(this));

        this.txnChart = EXEM.cls.create('XMTxnMonitorChart', {
            target: chartArea,
            toFixedNumber: 0,
            txnInfo: this.txnTrendData,
            displayTimeRange: 10, // minute
            timeBrush: null,
            databaseType: 'memory',
            chartProperty: {
                selection: {
                    show: true
                },
                xaxis: {
                    labelStyle: labelStyle
                },
                yaxis: {
                    autoscaleRatio: 0.15,
                    labelStyle: labelStyle,
                    labelWidth: 40
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
                return (date.getHours()   < 10 ? '0' : '') + date.getHours() + ':' +
                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
            },
            displayMouseWheel: function(e) {
                this.verticalSliderBar.fireEvent('mousewheel', this.verticalSliderBar, e);
            }.bind(this),
            selectionEvent: function(param) {
                var offset = param.offset;

                if (offset.x === offset.x2 && offset.y === offset.y2) {
                    return;
                }

                if (offset.y2 < 0 || offset.x > offset.x2 || offset.y > offset.y2 ) {
                    this.txnChart.clearSelection();
                    return;
                }

                if (! this.txnChart.isAutoScale && offset.y2 >= this.txnChart.customYaxisMax) {
                    offset.y2 = this.txnChart.maxTimeValue || this.txnChart.customYaxisMax;
                }

                var minElapsed = Math.floor((offset.y - 0.1) * 1000);
                if (minElapsed < 0 ) {
                    minElapsed = 0;
                }
                var maxElapsed = Math.ceil((offset.y2 + 0.1) * 1000);

                // C Daemon 인 경우 시간 단위가 다르게 처리되기에 처리함.
                if (this.monitorType === 'CD') {
                    minElapsed = Math.floor(minElapsed / 1000);
                    maxElapsed = Math.ceil(maxElapsed / 1000);
                }

                var fT = new Date(new Date(offset.x).setMilliseconds(0) - 1000);
                var tT = new Date(new Date(offset.x2).setMilliseconds(0) + 1000);

                var retrieveRange = {
                    fromTime: Ext.Date.format( fT, 'Y-m-d H:i:s' ),
                    toTime  : Ext.Date.format( tT, 'Y-m-d H:i:s' ),
                    minElapse: minElapsed,
                    maxElapse: maxElapsed,
                    clientIp: '',
                    txnName: '',
                    exception: '',
                    loginName: '',
                    txnCode: '',
                    businessId : '',
                    serverType: this.monitorType
                };

                retrieveRange.wasId = this.filterWasId || this.wasField.getValue();

                if (Ext.isEmpty(this.filterIP) !== true) {
                    retrieveRange.clientIp = Ext.String.format(this.openFilterFormat.CLIENT_IP, this.filterIP);
                }

                if (Ext.isEmpty(this.filterURLValue) !== true) {
                    retrieveRange.txnName = this.filterURLValue;
                }

                if (this.filterErrorChecked === true) {
                    retrieveRange.exception = 'exist';
                }

                if (Ext.isEmpty(this.filterLoginNameValue) !== true) {
                    retrieveRange.loginName = Ext.String.format(this.openFilterFormat.USER_ID, this.filterLoginNameValue);
                }

                if (this.bizIdList) {
                    retrieveRange.businessId = this.bizIdList;
                } else {
                    if (this.isBizView) {
                        retrieveRange.businessId = this.getBizList(this.bizId).join();
                    } else {
                        retrieveRange.businessId = '';
                    }
                }

                console.debug('[Transaction Detail] - Filter Parameters: ', JSON.stringify(retrieveRange));

                localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(retrieveRange));

                var currentWidth  = 1500;
                var currentHeight = 1000;
                window = opener.window;
                var dualScreenLeft = window.screenLeft != null ? window.screenLeft : screen.left;
                var dualScreenTop  = window.screenTop != null ? window.screenTop : screen.top;

                var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

                var left = ((width / 2) - (currentWidth / 2)) + dualScreenLeft;
                var top = ((height / 2) - (currentHeight / 2)) + dualScreenTop;

                var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight + ', top=' + top + ', left=' + left;
                var txnDetail = opener.window.open('txnDetail.html', 'hide_referrer_1', popupOptions);
                txnDetail.monitorType = this.monitorType;

                this.txnChart.clearSelection();
            }.bind(this)
        });
        this.txnChart.isFixedYLabelWidth = true;

        window.addEventListener('resize', function() {
            this.baseFrame.setSize(window.innerWidth, window.innerHeight);
            this.verticalSliderBar.setHeight(window.innerHeight - 190);
            this.horizonSliderBar.setWidth(window.innerWidth - 90);

            this.verticalSliderBar.fireEvent('resize', this.verticalSliderBar);
            this.horizonSliderBar.fireEvent('resize', this.horizonSliderBar);

            this.chartBase.down('#txn-chart-area').setHeight(window.innerHeight - this.bottomMarginHeight);
        }.bind(this));

        window.onbeforeunload = function() {
            window.msgMap = null;
            window.Comm   = null;
            window.common = null;

            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }

            if (this.filterTimeoutId) {
                clearTimeout(this.filterTimeoutId);
            }

            opener.window.removeEventListener('beforeunload', unloadHandler);
        };


        var unloadHandler = function() {
            if (window) {
                window.msgMap = null;
            }
            window.Comm = null;
            window.common = null;

            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }

            if (this.filterTimeoutId) {
                clearTimeout(this.filterTimeoutId);
            }

            if (window) {
                window.close();
            }
        };

        opener.window.addEventListener('beforeunload', unloadHandler);

        this.txnChart.init();

        var totalCount = common.Util.numberWithComma(this.txnChart.totalCount);
        var envInfo = Comm.web_env_info[this.envKeyChartOption];

        if (envInfo != null) {
            envInfo = JSON.parse(envInfo);
            if (envInfo.isSetMaxValue) {
                this.txnChart.customYaxisMax = envInfo.maxValue;
                this.txnChart.isAutoScale = false;
                this.totalCountLabel.setText(this.totalCountText + totalCount);
                //this.maxTimer = setTimeout(this.checkMaxOverNValue.bind(this), 1000);
                //this.maxValueContainer.setVisible(true);
            } else {
                this.isYaxisAutoScale = true;
                if(this.maxTimer){
                    clearTimeout(this.maxTimer);
                }
            }

            this.txnChart.options.series.point.radius = envInfo.radius;
        } else {
            this.txnChart.customYaxisMax = 8;
            this.txnChart.isAutoScale = false;
            this.txnChart.customRectSize = 2;
            this.totalCountLabel.setText(this.totalCountText + totalCount);
            //this.maxTimer = setTimeout(this.checkMaxOverNValue.bind(this), 1000);
            //this.maxValueContainer.setVisible(true);
        }
        this.maxTimer = setTimeout(this.checkMaxOverNValue.bind(this), 1000);

        this.drawFrame();

        ////this.createOptionWindow();

        this.repeatSetFilter();
    },


    /**
     * 필터 옵션 폼 설정
     */
    createFilterForm: function() {
        this.filterUrl = Ext.create('Ext.form.field.Text', {
            itmeId    : 'txn-filter-url',
            cls       : 'rtm-list-condition',
            fieldLabel: common.Util.TR('Transaction'),
            labelWidth: (Comm.Lang === 'ja')? 73 : 48,
            width     : 248,
            margin    : '0 10 0 10',
            labelSeparator: '',
            trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            enableKeyEvents : true,
            onTrigger1Click: function() {
                var me = this;
                if (me.hideTrigger) {
                    return;
                }

                me.setValue('');
            },
            listeners: {
                scope: this,
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER) {
                        this.applyFilterOptions();
                    }
                }
            }
        });

        this.filterIPText = Ext.create('Ext.form.field.Text', {
            cls       : 'rtm-list-condition',
            fieldLabel: common.Util.TR('Client IP'),
            labelWidth: 80,
            width     : 190,
            margin    : '0 10 0 10',
            labelSeparator: '',
            trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            maskRe: /[\.*0-9]$/,
            value : '',
            enableKeyEvents : true,
            onTrigger1Click: function() {
                var me = this;
                if (me.hideTrigger) {
                    return;
                }
                me.setValue('');
            },
            listeners: {
                scope: this,
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER) {
                        this.applyFilterOptions();
                    }
                }
            }
        });

        this.filterLoginName = Ext.create('Ext.form.field.Text', {
            cls       : 'rtm-list-condition',
            fieldLabel: common.Util.TR('User ID'),
            labelWidth: 60,
            width     : 150,
            margin    : '0 10 0 10',
            labelSeparator: '',
            enableKeyEvents : true,
            trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            onTrigger1Click: function() {
                var me = this;
                if (me.hideTrigger){
                    return;
                }
                me.setValue('');
            },
            listeners: {
                scope: this,
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER) {
                        this.applyFilterOptions();
                    }
                }
            }
        });

        this.filterError = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Error Transaction'),
            cls     : 'rtm-combobox-label',
            margin  : '4 20 0 139',
            checked : false
        });

        this.filterSqlElapsed = Ext.create('Exem.NumberField', {
            cls       : 'rtm-list-condition',
            labelAlign: 'left',
            fieldLabel: common.Util.TR('SQL Elapsed Time') + '<span style="margin-left:5px;">>=</span>',
            labelWidth: 100,
            width     : 170,
            flex: 1,
            margin    : '0 10 0 10',
            labelSeparator: '',
            minValue  : 0,
            maxValue  : 1000,
            value     : 0,
            step: 0.1,
            decimalPrecision: 3,
            hideTrigger: true,
            enforceMaxLength: true,
            enableKeyEvents : true,
            allowExponential: false
        });

        this.filterFetchTime = Ext.create('Exem.NumberField', {
            cls       : 'rtm-list-condition',
            labelAlign: 'left',
            fieldLabel: common.Util.TR('SQL Fetch Time') + '<span style="margin-left:5px;">>=</span>',
            x         : 270,
            labelWidth: 100,
            width     : 170,
            margin    : '0 10 0 10',
            flex: 1,
            labelSeparator: '',
            minValue  : 0,
            maxValue  : 1000,
            value     : 0,
            step      : 0.1,
            decimalPrecision: 3,
            hideTrigger: true,
            enforceMaxLength: true,
            enableKeyEvents : true,
            allowExponential: false
        });

        this.filterButton = Ext.create('Ext.Button', {
            cls  : 'rtm-button',
            text : common.Util.TR('Apply'),
            margin: '0 10 5 0',
            width: 80,
            height: 26,
            listeners:{
                scope: this,
                click: function() {
                    if (!this.wasField.checkValid() || this.filterButton.isDisabled()) {
                        return;
                    }

                    this.filterDatas = this.getFilterParams();
                    this.repeatSetFilter();
                    this.setLoadingMask(true);

                    this.filterButton.setDisabled(true);
                    common.RTMDataManager.getTxnMonitorTrendSplitData(this.txnComponentGuid, this.txnTrendData.range, this.filterDatas,
                        function() {
                            this.drawFrame();
                            this.setLoadingMask(false);
                            this.filterButton.setDisabled(false);
                        }.bind(this)
                    );
                }
            }
        });
    },


    /**
     * 필터 옵션 적용
     */
    applyFilterOptions: function() {
        if (!this.wasField.checkValid()) {
            return;
        }

        this.filterDatas = this.getFilterParams();
        this.repeatSetFilter();
        this.setLoadingMask(true);

        common.RTMDataManager.getTxnMonitorTrendSplitData(this.txnComponentGuid, this.txnTrendData.range, this.filterDatas,
            function() {
                this.drawFrame();
                this.setLoadingMask(false);
            }.bind(this)
        );
    },


    /**
     * 옵션 설정 창 구성
     */
    createOptionWindow: function() {
        var okBtnFlag =  false;
        var self = this;
        self.changeValueWindow = Ext.create('Exem.XMWindow', {
            title: common.Util.TR('Transaction Monitor Option'),
            width: 350,
            height: 270,
            resizable: false,
            closeAction: 'hide',
            layout: 'absolute',
            maximizable : false,
            closable: true,
            draggable : true,
            constrain: true,
            x: 110,
            y: 62,
            cls: 'xm-dock-window-base rtm-transactionmonitor-option-window',
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
                    handler: function () {
                        okBtnFlag = true;

                        var changeValue = self.setMaxField.getValue();

                        self.txnChart.maxOverCount = 0;
                        self.txnChart.maxTimeValue = 0;

                        var totalCount = common.Util.numberWithComma(+this.txnChart.totalCount) || 0;
                        self.totalCountLabel.setText(self.totalCountText + totalCount);
                        self.maxOverLabel.setText(self.maxOverText + self.txnChart.maxOverCount);
                        self.maxValueLabel.setText(self.maxValueText +  self.txnChart.maxTimeValue);

                        var isSetMaxValue = self.maxValueRadio.getValue();

                        if (isSetMaxValue === true) {
                            if (changeValue <= 0 ) {
                                Ext.Msg.alert(common.Util.TR('Change Max Value'), common.Util.TR('Please enter a value greater than 0'));
                                return;
                            }

                            if (self.visibleMaxInfo.getValue()) {
                                //self.maxValueContainer.setVisible(true);

                                self.maxTimer = setTimeout(self.checkMaxOverNValue.bind(self), 1000);
                            } else {
                                //self.maxValueContainer.setVisible(false);

                                if (self.maxTimer) {
                                    clearTimeout(self.maxTimer);
                                }
                            }

                            if (+self.txnChart.customYaxisMax !== +changeValue) {
                                self.txnChart.liveOverData = [];
                                self.txnChart.liveExceptionData = [];
                            }

                            self.txnChart.customYaxisMax = changeValue;
                            self.txnChart.isAutoScale = false;
                            self.txnChart.compactDraw();

                        } else {
                            //self.maxValueContainer.setVisible(false);
                            self.visibleMaxInfo.setValue(false);

                            self.txnChart.customYaxisMax = null;
                            self.txnChart.isAutoScale = true;
                            self.txnChart.liveOverData = [];
                            self.txnChart.liveExceptionData = [];
                            self.txnChart.compactDraw();
                        }

                        var pointSize = self.pointSizeField.getValue();

                        if (!pointSize) {
                            self.txnChart.customRectSize = pointSize;
                            self.txnChart.compactDraw();
                        }

                        self.verticalSliderBar.setValue(changeValue);
                        self.updateVerticalSliderStyle();

                        self.changeValueWindow.close();
                    }.bind(this)
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
                }]
            }
            ],
            listeners: {
                scope: this,
                beforeshow: function (_win) {
                    var envInfo = Comm.web_env_info[this.envKeyChartOption];
                    if (envInfo) {
                        envInfo = JSON.parse(envInfo);
                        self.maxValueRadio.setValue(envInfo.isSetMaxValue);
                        self.autoScaleRadio.setValue(!envInfo.isSetMaxValue);
                        self.visibleMaxInfo.setValue(envInfo.isVisibleMaxInfo);
                        self.setMaxField.setValue(envInfo.maxValue);
                        self.pointSizeField.setValue(envInfo.radius);
                    } else {
                        self.maxValueRadio.setValue(true);
                        self.setMaxField.setValue(8);
                        self.pointSizeField.setValue(2);
                    }

                    _win.setTitle(common.Util.TR('Transaction Monitor Option'));

                },
                hide: function () {
                    self.setMaxField.setValue('');
                },
                beforehide: function() {
                    var maxValue;
                    if (self.maxValueRadio.getValue() === true) {
                        maxValue = self.setMaxField.getValue();
                    } else {
                        maxValue = 8;
                    }

                    if (okBtnFlag === true) {
                        var dataObj = {
                            isSetMaxValue: self.maxValueRadio.getValue(),
                            isVisibleMaxInfo: self.visibleMaxInfo.getValue(),
                            maxValue: maxValue,
                            radius: self.pointSizeField.getValue()
                        };

                        common.WebEnv.Save(this.envKeyChartOption, JSON.stringify(dataObj));
                        okBtnFlag = false;
                    }
                }
            }
        });

        self.radioBoxCon = Ext.create('Ext.container.Container', {
            layout : 'hbox',
            x : 10,
            y : 5,
            margin : '5 0 0 10',
            cls : 'rtm-transactionmonitor-radioBoxCon'
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

        self.maxCheck =  Ext.create('Ext.form.field.Checkbox', {
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
                keyup: function (numfield) {
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

        self.setPointArea = Ext.create('Ext.form.FieldSet', {
            width : '100%',
            height: 100,
            title :  common.Util.TR('Set Dot Size'),
            layout: {
                type :'vbox'
            },
            cls: 'rtm-transactionmonitor-pointfield',
            margin: '0 0 0 20',
            x: 0,
            y: 80
        });

        var sampleArea = Ext.create('Ext.container.Container', {
            width : '100%',
            height: 40,
            layout: 'hbox',
            margin : '15 0 0 0'
        });

        self.setPointArea.add(self.pointSizeField, sampleArea);
        self.changeValueWindow.add(self.radioBoxCon, self.visibleMaxInfo, self.setPointArea);

        self.addExample(sampleArea, 1 , 2);
        self.addExample(sampleArea, 2 , 4);
        self.addExample(sampleArea, 3 , 6);
        self.addExample(sampleArea, 4 , 8);
        self.addExample(sampleArea, 5 , 10);
    },


    /**
     * 옵션 설정창에 표시되는 도트크기 예제
     */
    addExample: function(target, label, size) {
        var bgCon = Ext.create('Ext.container.Container', {
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

        var exampleLabel = Ext.create('Ext.container.Container', {
            width : '100%',
            html  : '<div style="text-align: center;">'+label+'</div>',
            margin: '2 0 0 0',
            cls   : 'rtm-transactionmonitor-example-label'
        });

        var pointEx = Ext.create('Ext.container.Container', {
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
     * 화면 그리기
     */
    drawFrame: function() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.txnChart.totalCount = 0;
        //this.txnChart.maxOverCount = 0;
        //this.txnChart.maxTimeValue = 0;

        var maxValue = +this.txnChart.getMaxValue() / 1000;

        if (this.isYaxisAutoScale && this.verticalSliderBar.maxValue !== maxValue + 2) {
            if (maxValue > 0) {
                this.verticalSliderBar.thumbs[0].value = maxValue + 2;
                this.txnChart.customYaxisMax = maxValue + 2;
            }
            this.verticalSliderBar.maxValue = maxValue + 2;
            this.verticalSliderBar.syncThumbs();
            this.updateVerticalSliderStyle();
        }

        this.txnChart.compactDraw();

        if (this.isAutoRefresh === true) {
            this.timeoutId = setTimeout(this.drawFrame.bind(this), 1000);
        }
    },


    /**
     * 설정된 Filter 정보를 전송.
     */
    repeatSetFilter: function() {
        if (this.filterTimeoutId) {
            clearTimeout(this.filterTimeoutId);
        }

        var filters = this.filterDatas || this.defaultFiters.filter;
        common.RTMDataManager.setTxnTrendMonitorFilters(this.txnComponentGuid, filters);

        this.filterTimeoutId = setTimeout(this.repeatSetFilter.bind(this), 30000);
    },


    /**
     * Add Slider
     */
    addSlider: function() {

        var defaultValue = 8;

        var envInfo = Comm.web_env_info[this.envKeyChartOption];
        if (envInfo != null) {
            envInfo = JSON.parse(envInfo);
            defaultValue = envInfo.maxValue;
        }

        this.verticalSliderBar = Ext.create('Ext.slider.Single', {
            height: window.innerHeight - 190,
            margin: '25 0 0 5',
            value: defaultValue,
            increment: 1,
            vertical: true,
            hidden : false,
            animate: false,
            minValue: 1,
            maxValue: defaultValue < 100 ? defaultValue : 100,
            cls : 'rtm-transaction-sliderbar',
            style: 'z-index: 10',
            listeners: {
                scope: this,
                render: function (s) {
                    Ext.get(s.id).dom.addEventListener('mousewheel', function (e) {
                        s.fireEvent('mousewheel', s, e);
                    }, false);
                    this.updateVerticalSliderStyle();
                },
                mousewheel: function (slider, evt) {
                    var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
                    var thumb, newValue, sliderInterval;

                    thumb =  slider.thumbs[0];
                    if (thumb.value > 10) {
                        sliderInterval = 5;
                    } else {
                        sliderInterval = 0.2;
                    }

                    if (delta === 1) {
                        newValue = thumb.value + sliderInterval;
                        if (slider.maxValue < newValue) {
                            newValue = slider.maxValue;
                        }
                    } else {
                        newValue = thumb.value - sliderInterval;
                        if (slider.minValue > newValue) {
                            newValue = slider.minValue;
                        }
                    }
                    ////newValue = Math.round(newValue);

                    this.txnChart.scatterHeight = newValue;
                    thumb.value = newValue;
                    slider.syncThumbs();
                    this.txnChart.options.yaxis.max = this.txnChart.scatterHeight;

                    this.drawFrame();

                    this.updateVerticalSliderStyle();
                },
                drag: function (_slider) {
                    this.updateVerticalSliderStyle(_slider);
                },
                changecomplete: function (_slider, newValue) {
                    this.updateVerticalSliderStyle();

                    this.txnChart.scatterHeight = newValue;
                    this.txnChart.options.yaxis.max = this.txnChart.scatterHeight;

                    this.drawFrame();
                },
                resize: function() {
                    this.updateVerticalSliderStyle();
                }
            }

        });

        var timeMaxValue = this.maxTimeRange;
        var timeMinValue = 0;
        var defaultTimeRange = 110;

        this.horizonSliderBar = Ext.create('Ext.slider.Multi', {
            width: window.innerWidth - defaultTimeRange,
            margin: '0 0 7 10',
            values: [defaultTimeRange, timeMaxValue],
            increment: 1,
            minValue: timeMinValue,
            animate: false,
            fixed: true,
            maxValue: timeMaxValue,
            cls : 'rtm-transaction-sliderbar',
            style: 'z-index: 10;left: 35px;bottom: 3px;',
            tipText: function(thumb) {
                var tipTime = common.RTMDataManager.txnMonitorInfo.toTime - ((timeMaxValue - thumb.value) * 1000 * 60);
                return Ext.String.format('<b>{0}</b>', Ext.Date.format( new Date(tipTime), 'Y-m-d H:i:s'));
            },
            listeners: {
                scope: this,
                render: function (s) {
                    this.updateHorizonSliderStyle(s);
                },
                mousewheel: function (slider, evt) {
                    if (slider.thumbs[1].value < timeMaxValue) {
                        return false;
                    }

                    var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
                    var thumb, newValue;

                    thumb =  slider.thumbs[0];

                    if (delta === 1) {
                        newValue = thumb.value - 10;
                        if (slider.minValue > newValue) {
                            newValue = slider.minValue;
                        }
                    } else {
                        newValue = thumb.value + 10;
                        if (slider.maxValue < newValue) {
                            newValue = slider.maxValue;
                        }
                    }

                    if (slider.oldValue !== newValue) {
                        slider.oldValue = newValue;
                    } else {
                        return;
                    }

                    this.txnChart.displayTimeRange = timeMaxValue - newValue;
                    thumb.value = newValue;
                    slider.syncThumbs();
                    this.updateHorizonSliderStyle(slider);

                    var filters = this.filterDatas || this.defaultFiters.filter;
                    this.setLoadingMask(true);
                    common.RTMDataManager.getTxnMonitorTrendSplitData(this.txnComponentGuid, newValue, filters, function() {
                        this.drawFrame();
                        this.setLoadingMask(false);
                    }.bind(this));
                },
                beforechange: function(_slider, newValue, oldValue) {
                    if (newValue >= 119) {
                        return false;
                    }
                    if ((oldValue === timeMaxValue && oldValue !== newValue) || newValue === timeMaxValue) {
                        if (this.timeoutId) {
                            clearTimeout(this.timeoutId);
                        }
                        _slider.thumbs[0].value = newValue;
                        _slider.syncThumbs();
                        this.updateHorizonSliderStyle(_slider);
                        this.txnChart.displayTimeRange = timeMaxValue - newValue;

                        var filters = this.filterDatas || this.defaultFiters.filter;
                        common.RTMDataManager.getTxnMonitorTrendSplitData(this.txnComponentGuid, newValue, filters, function() {
                            this.drawFrame();
                        }.bind(this));
                        return false;
                    }
                },
                drag: function (_slider) {
                    this.updateHorizonSliderStyle(_slider);
                },
                changecomplete: function (_slider, newValue) {
                    if (newValue >= 119) {
                        return false;
                    }
                    this.txnChart.displayTimeRange = timeMaxValue - newValue;
                    this.updateHorizonSliderStyle(_slider);

                    var filters = this.filterDatas || this.defaultFiters.filter;
                    this.setLoadingMask(true);
                    common.RTMDataManager.getTxnMonitorTrendSplitData(this.txnComponentGuid, newValue, filters, function() {
                        this.drawFrame();
                        this.setLoadingMask(false);
                    }.bind(this));
                },
                resize: function(_slider) {
                    this.updateHorizonSliderStyle(_slider);
                }
            }

        });

        this.chartBase.add(this.verticalSliderBar, this.horizonSliderBar);
    },


    /**
     * X축 Slider Bar Styles을 설정
     */
    updateHorizonSliderStyle: function(slider) {
        var thumbA = $(slider.getEl().dom).find('.x-slider-horz .x-slider-inner')[0];
        var thumbB = $(slider.getEl().dom).find('.x-slider-thumb')[0];
        var left = $(thumbB).css('left');
        var thumbId = '#'+thumbA.id;

        $(thumbId).css('background', '-webkit-linear-gradient(left, #212227 0px, #212227 '+left+', #4398F3 '+left+')');
        $(thumbId).css('background', '-webkit-gradient(left, #212227 0px, #212227 '+left+', #4398F3 '+left+')');
        $(thumbId).css('background', '-webkit-linear-gradient(left, #212227 0px, #212227 '+left+', #4398F3 '+left+')');
        $(thumbId).css('background', '-moz-linear-gradient(left, #212227 0px, #212227 '+left+', #4398F3 '+left+')');
        $(thumbId).css('background', '-ms-linear-gradient(left, #212227 0px, #212227 '+left+', #4398F3 '+left+')');
        $(thumbId).css('background', '-o-linear-gradient(left, #212227 0px, #212227 '+left+', #4398F3 '+left+')');
        $(thumbId).css('background', 'linear-gradient(left, #212227 0px, #212227 '+left+', #4398F3 '+left+')');
    },


    /**
     * Y축 Slider Bar Styles을 설정
     */
    updateVerticalSliderStyle: function() {
        var slider = this.verticalSliderBar;
        var thumbA = $(slider.getEl().dom).find('.x-slider-vert .x-slider-inner')[0];
        var thumbB = $(slider.getEl().dom).find('.x-slider-thumb')[0];
        var bottom = $(thumbB).css('bottom');
        var thumbId = '#'+thumbA.id;

        $(thumbId).css('background', '-webkit-linear-gradient(bottom, #4398F3 '+bottom+', #212227 '+bottom+', #212227 0px)');
        $(thumbId).css('background', '-webkit-gradient(bottom, #4398F3 '+bottom+', #212227 '+bottom+', #212227 0px)');
        $(thumbId).css('background', '-webkit-linear-gradient(bottom, #4398F3 '+bottom+', #212227 '+bottom+', #212227 0px)');
        $(thumbId).css('background', '-moz-linear-gradient(bottom, #4398F3 '+bottom+', #212227 '+bottom+', #212227 0px)');
        $(thumbId).css('background', '-ms-linear-gradient(bottom, #4398F3 '+bottom+', #212227 '+bottom+', #212227 0px)');
        $(thumbId).css('background', '-o-linear-gradient(bottom, #4398F3 '+bottom+', #212227 '+bottom+', #212227 0px)');
        $(thumbId).css('background', 'linear-gradient(bottom, #4398F3 '+bottom+', #212227 '+bottom+', #212227 0px)');
    },


    /**
     * 최대값 정보를 표시
     */
    checkMaxOverNValue: function() {
        var totalCount = common.Util.numberWithComma(+this.txnChart.totalCount) || 0;
        this.totalCountLabel.setText(this.totalCountText + totalCount);
        //this.maxOverLabel.setText(this.maxOverText + this.txnChart.maxOverCount);
        //this.maxValueLabel.setText(this.maxValueText + this.txnChart.maxTimeValue.toFixed(1));

        this.maxTimer = setTimeout(this.checkMaxOverNValue.bind(this), 500);
    },


    /**
     * Transaction Trend Monitor에 설정할 필터값을 구성.
     *
     * @return {string} filter string
     */
    getFilterParams: function() {

        var filters = '1 = 1';

        // WAS ID
        this.filterWasId = this.wasField.getValue();
        if (Ext.isEmpty(this.filterWasId) !== true) {
            filters += Ext.String.format(this.filterFormat.WAS_ID, this.filterWasId);
        }

        // User ID
        this.filterLoginNameValue = this.filterLoginName.getValue();
        if (Ext.isEmpty(this.filterLoginNameValue) !== true) {
            filters += Ext.String.format(this.filterFormat.USER_ID, this.filterLoginNameValue.toLocaleLowerCase());
        }

        // URL
        this.filterURLValue = this.filterUrl.getValue();
        if (Ext.isEmpty(this.filterURLValue) !== true) {
            filters += Ext.String.format(this.filterFormat.URL, this.filterURLValue.toLocaleLowerCase());
        }

        // Client IP
        this.filterIP = this.filterIPText.getValue();
        if (Ext.isEmpty(this.filterIP) !== true) {
            var ipFilter = this.filterIP;
            this.filterIP = common.Util.strIpToHex(this.filterIP);
            filters += Ext.String.format(this.filterFormat.CLIENT_IP, ipFilter);
        }

        // Exceptoin
        this.filterErrorChecked = this.filterError.getValue();
        if (this.filterErrorChecked === true) {
            filters += this.filterFormat.EXCEPTION;
        }

        // SQL Elapsed Time
        //var sqlElapseTime = this.filterSqlElapsed.getValue();
        //filters += Ext.String.format(this.filterFormat.SQL_ELASPED, sqlElapseTime);

        // SQL Fetch Time
        //var sqlFetchTime = this.filterFetchTime.getValue();
        //filters += Ext.String.format(this.filterFormat.SQL_FETCH_TIME, sqlFetchTime);
        if (this.isBizView) {
            this.bizIdList = this.getBizList(this.bizId).join();

            filters += Ext.String.format(this.filterFormat.BUSINESS_ID, this.bizIdList);
        }

        return filters;
    },

    /**
     * Find the list of business id
     * @param businessId
     * @returns {*[]}
     */
    getBizList: function(businessId) {
        if (Comm.etoeBizMaps[businessId] && Comm.etoeBizMaps[businessId].length) {
            return Comm.etoeBizMaps[businessId];
        } else {
            return [];
        }
    },

    /**
     * Show/Hide Loading mask
     *
     * @param {boolean} setFlag true: show, false: hide
     */
    setLoadingMask: function(setFlag){
        if(setFlag){
            this.baseFrame.loadingMask.show(null, true);
        }
        else{
            this.baseFrame.loadingMask.hide();
        }
    },

    setTimer: function(type, setFlag, field, event){
        var filterTimer = null;

        if (type === 'url') {
            filterTimer = this.filterUrlTimer;
        } else if(type === 'ip') {
            filterTimer = this.filterIpTimer;
        } else if(type === 'loginName') {
            filterTimer = this.filterLoginTimer;
        }

        if (filterTimer) {
            clearTimeout(filterTimer);
        }

        if (setFlag) {
            event.keyCode = Ext.event.Event.ENTER;
            filterTimer = setTimeout(field.fireEvent('specialkey', field, event), 1000);
        }
    }
});