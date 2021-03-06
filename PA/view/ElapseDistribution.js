Ext.define('view.ElapseDistribution', {
    extend: 'Exem.Form',
    layout: 'vbox',
    minWidth: 1080,
    width: '100%',
    height: '100%',
    title: '',
    isInitResize: true,
    isInitActivate: true,
    detailScatterYRange: 'dataSensitive',  // fixed or dataSensitive
    isStandAlone: false,
    isExtBankMode: false,
    isAllWasRetrieve: false,
    autoRetrieveRange: null,
    retrRangeBeforeDragDetail: null,
    tid: null,  // RTM ALERT 에서 넘여주는 프로퍼티값
    isChartDataVisible : true,

    cls : 'list-condition Exem-FormOnCondition',

    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        },
        afterrender: function() {

        },
        activate: function() {
            if (!this.isChartDataVisible) {
                this.detailScatter.fireEvent('resize');
                this.isChartDataVisible = true;
            }
            this.isInitActivate = false;
        }
    },

    init: function() {
        var me = this;

        this.retrieve_click = false;

        // 2016.09.09 점차트 범위 이외 그리드 출력 제거를 위한 변수
        this.tmpMinElapse = 0;
        this.tmpMaxElapse = 0;
        this.tmpFromVal = '';
        this.tmpToVal = '';
        this.isInit = false;    // tmpMinElapse, tmpMaxElapse가 잡히고 난 이후에는 retrieve 버튼을 누르기 전까지 true로 고정

        this.opException = '';
        this.opClientIp = '';
        this.opTxnName = '';
        this.opLoginName = '';
        this.opGid = '';

        this.opFetchCnt = 0;
        this.opSQLElapseTime = 0;
        this.opSQLExecCnt = 0;

        this.conditionBox = Ext.create('Exem.Container', {
            width: '100%',
            height: 39,
            layout: 'hbox',
            style : {
                background: '#ffffff',
                borderRadius: '6px'
            }
        });

        this.detailScatterWrap = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            flex: 1,
            width: '100%',
            height : '100%',
            minHeight: 265,
            border: 1,
            cls   : 'Exem-Form-workArea',
            style : {
                borderRadius: '6px'
            }
        });

        var conditionArea = Ext.create('Ext.container.Container', {
            flex: 1,
            height: '100%',
            layout: 'absolute'
        });
        this.conditionArea = conditionArea;

        if (Comm.isBGF) {
            var prevBtn = document.createElement('img');
            prevBtn.style.opacity = 0.5;
            prevBtn.src = '../images/LeftArrow_White_On.png';
            prevBtn.style.position = 'absolute';
            prevBtn.style.top = '0px';
            prevBtn.style.left = '10px';
            prevBtn.style.cursor = 'pointer';
            prevBtn.onclick = function() {
                me.destroy();
            };
            prevBtn.onmouseover = function() {
                this.style.opacity = 1;
            };
            prevBtn.onmouseout = function() {
                this.style.opacity = 0.5;
            };
            setTimeout(function() {
                conditionArea.getEl().appendChild(prevBtn);
            }, 10);
        }

        this.datePicker = Ext.create('Exem.DatePicker', {
            width: 110,
            x: 32,
            y: 5,
            executeSQL: this.executeSQL,
            executeScope: this,
            rangeOneDay: true
        });


        var fDate = new Date((new Date())-20*60*1000);
        var tDate = new Date();

        fDate.setSeconds(0);
        fDate.setMilliseconds(0);

        tDate.setSeconds(0);
        tDate.setMilliseconds(0);

        this.datePicker.mainFromField.setValue( this.datePicker.dataFormatting(fDate, this.datePicker.DisplayTime));
        this.datePicker.mainToField.setValue( this.datePicker.dataFormatting(tDate, this.datePicker.DisplayTime));


        this.wasField = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 300,
            comboLabelWidth : 60,
            comboWidth      : 260,
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            x               : 400,
            y               : 5
        });

        this.minElapseField = Ext.create('Exem.NumberField', {
            x: 715,
            y: 5,
            width: 145,
            fieldLabel: common.Util.CTR('Elapsed Time'),
            labelWidth: 90,
            fieldStyle: 'text-align: right;',
            value: 0,
            maxLength: 9,
            hideTrigger: true,
            decimalPrecision: 3,
            allowExponential: false
        });
        var elapseTideLabel = Ext.create('Ext.form.Label', {
            x: 861,
            y: 5,
            text : '~'
        });
        this.maxElapseField = Ext.create('Exem.TextField', {
            x: 870,
            y: 5,
            width: 50,
            labelWidth: 0,
            fieldStyle: 'text-align: right;',
            value: common.Util.CTR('infinite'),
            maxLength: 9
        });
        var infinityBtn = Ext.create('Exem.Container', {
            x: 923,
            y: 10,
            width: 18,
            height: 13,
            html: '<img src="../images/infinity.png" class="res-inspector-infinity-btn"/>',
            listeners: {
                render: function() {
                    this.getEl().addListener('click', function() {
                        me.maxElapseField.setValue(common.Util.TR('infinite'));
                        me.detailScatter.detailScatterYRange = 'dataSensitive';
                    });
                }
            }
        });
        conditionArea.add([this.datePicker, this.wasField, this.minElapseField, elapseTideLabel, this.maxElapseField, infinityBtn]);

        this.txnNameField = Ext.create('Exem.TextField', {
            itemId: 'txnNameField',
            fieldLabel: common.Util.CTR('Transaction Name'),
            labelWidth: 120,
            x: 10,
            y: 40,
            width: 410,
            value: '%',
            maxLength: 300
        });
        this.ipField = Ext.create('Exem.TextField', {
            fieldLabel: 'IP',
            labelWidth: 20,
            x: 495,
            y: 40,
            width: 170,
            value: '%',
            maxLength: 20
        });
        this.loginNameField = Ext.create('Exem.TextField', {
            fieldLabel: common.Util.CTR('Login Name'),
            labelWidth: 80,
            x: 725,
            y: 40,
            width: 195,
            value: '%',
            maxLength: 50
        });


        this.fetchCntField = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.CTR('Fetch Count >= '),
            labelWidth: 100,
            x: 55,
            y: 70,
            value: 0,
            width: 165,
            // fieldStyle: 'text-align: right;',
            maxLength: 7,
            step: 100,
            allowExponential: false
        });


        this.sqlElapseField = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.CTR('SQL Elapse Time >= '),
            labelWidth: 130,
            // fieldStyle: 'text-align: right;',
            x: 233,
            y: 70,
            value: 0,
            width: 187,
            maxLength: 9,
            step: 0.1,
            decimalPrecision: 3,
            allowExponential: false
        });


        this.sqlExecField = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.CTR('SQL Executions >= '),
            labelWidth: 120,
            // fieldStyle: 'text-align: right;',
            x: 485,
            y: 70,
            width: 180,
            value: 0,
            minValue: 0,
            maxLength: 7,
            allowExponential: false
        });


        this.gidField = Ext.create('Exem.TextField', {
            fieldLabel: 'GUID',
            labelWidth: 80,
            x: 725,
            y: 70,
            width: 195,
            value: '%',
            maxLength: 300
        });

        this.tidField = Ext.create('Exem.TextField', {
            fieldLabel: 'TID',
            labelWidth: 80,
            x: 935,
            y: 70,
            width: 195,
            value: '',
            defaultEmptyText: '',
            maxLength: 300,
            maskRe : /^[0-9]*$/
        });

        this.pcidField = Ext.create('Exem.TextField', {
            fieldLabel: 'PCID',
            labelWidth: 80,
            x: 935,
            y: 40,
            width: 195,
            value: '',
            defaultEmptyText: '',
            maxLength: 300
        });

        if (common.Menu.usePcidFilter) {
            conditionArea.add([
                this.txnNameField, this.ipField, this.loginNameField, this.pcidField,
                this.fetchCntField, this.sqlElapseField,
                this.sqlExecField, this.gidField, this.tidField
            ]);
        } else {
            conditionArea.add([
                this.txnNameField, this.ipField, this.loginNameField,
                this.fetchCntField, this.sqlElapseField,
                this.sqlExecField, this.gidField, this.tidField
            ]);
        }


        if (this.isExtBankMode) {
            this.extBankField = Ext.create('Exem.TextField', {
                x: 280,
                y: 100,
                width: 215,
                fieldLabel: common.Util.TR('Ext Bank Code'),
                labelWidth: 150,
                fieldStyle: 'text-align: right;'
            });
            this.extBankField.setValue(window.selectedBank);
            conditionArea.add(this.extBankField);
        }


        var retrieveArea = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: 180,
            height: '100%'
        });

        this.detailToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x: -20,
            y: 10,
            width: 95,
            onText: common.Util.TR('Detail'),
            offText: common.Util.TR('Common'),
            resizeHandle: false,
            state: false,
            listeners: {
                change: function(toggle, state) {
                    me.toggle_slide(state);
                }
            }
        });
        var retrieveBtn = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Retrieve'),
            x: 80,
            y: 8,
            width: 90,
            height: 25,
            cls: 'retrieve-btn',
            handler: function() {
                me.autoRetrieveRange = null;
                me.retrieve();
            }
        });

        this.exceptionToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x: -20,
            y: 40,
            width: 110,
            onText: common.Util.TR('All'),
            offText: common.Util.TR('Exception'),
            state: true
        });
        retrieveArea.add([this.detailToggle, retrieveBtn, this.exceptionToggle]);

        this.conditionBox.add([conditionArea, retrieveArea]);




        //****************************************************************************************
        //****************************************************************************************
        //********** condition. retrieve btn제외한 하단영역은 따로 (min) ***************************
        //****************************************************************************************
        //****************************************************************************************

        var detailScatterBox = Ext.create('Exem.Panel', {
            layout: 'fit',
            flex: 1,
            width: '100%',
            height : '100%',
            minHeight: 200,
            border: 0,
            margin: '0 20 20 20',
            listeners: {
                afterrender: function() {
                    if (me.autoRetrieveRange !== null) {
                        this.setLoading(true);
                    }
                },
                resize: function() {
                    if (!me.isInitResize) {
                        setTimeout(function() {
                            me.detailScatter.fireEvent('resize');
                        }, 10);
                    }
                    me.isInitResize = false;
                }
            }
        });
        this.detailScatterBox = detailScatterBox;

        this.detailScatter = Ext.create('Exem.chart.D3ScatterSelectable', {
            type: 'detail',
            target: detailScatterBox,
            parentView: me,
            isDistribution : true
        });
        this.detailScatter.detailScatterYRange = this.detailScatterYRange;

        var detailScatterTitle = Ext.create('Ext.panel.Panel', {
            html: '<p class="res-inspector-title">' + common.Util.TR('Response Time Chart') + '</p>',
            width: '100%',
            height: 30,
            margin: '15 0 0 30',
            border: 0
        });

        this.detailScatterWrap.add(detailScatterTitle);
        this.detailScatterWrap.add(detailScatterBox);

        this.add([this.conditionBox, { xtype: 'tbspacer', itemId: 'spacer', height:10, width: '100%', background: '#e9e9e9'}, this.detailScatterWrap]);

        if (this.autoRetrieveRange !== null) {
            this.setRetrieveRange(this.autoRetrieveRange);

            if (this.autoRetrieveRange.wasName) {
                if (this.autoRetrieveRange.wasName == 'All') {
                    this.wasField.selectByIndex(0);
                } else {
                    this.wasField.selectByValues(this.autoRetrieveRange.wasName);
                }
            }

            //rtm에서 넘어오는 ip가 하나면 그냥 하나.
            //여러개면 맨첫배열에 있는 *있는 값으로 set.
            if ( this.autoRetrieveRange.ip && this.autoRetrieveRange.ip != '%') {
                if ( this.autoRetrieveRange.ip[0] == this.autoRetrieveRange.ip[0].replace('*', '%') ) {
                    this.ipField.setValue(this.autoRetrieveRange.ip[0]);
                }

                this.toggle_slide(true);
            }
            this.retrieve();
        }
        this.isAllWasRetrieve = false;
    },

    toggle_slide: function(state) {
        if (state) {
            this.conditionBox.setHeight(105);
        } else {
            this.conditionBox.setHeight(39);

            this.txnNameField.setValue('%');
            this.ipField.setValue('%');
            this.gidField.setValue('%');
            this.tidField.setValue('');
            this.pcidField.setValue('');
            this.loginNameField.setValue('%');
            this.sqlElapseField.setValue(0);
            this.sqlExecField.setValue(0);
            this.fetchCntField.setValue(0);
            if (!this.exceptionToggle.getValue()) {
                this.exceptionToggle.toggle();
            }
        }
    },


    setRetrieveRange: function(retrieveRange, fromDetail) {
        if (!fromDetail) {
            this.retrRangeBeforeDragDetail = retrieveRange;
        }

        this.fromTime  = Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s' );
        this.toTime    = Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s' );
        this.minElapse = parseFloat(retrieveRange.elapseRange[0]);


        var tmp = retrieveRange.txnName;
        if ( tmp == undefined ) {
            tmp = '%';
        }

        this.txnNameField.setValue( tmp );

        if (retrieveRange.elapseRange[1] !== 'infinite') {
            this.maxElapse = parseFloat(retrieveRange.elapseRange[1]);
        } else {
            this.maxElapse = 100000000;
            this.init_elapse_max = this.maxElapse;
        }

        if ( this.init_time == undefined || this.init_time == null ) {
            this.init_time = [];
            this.init_time[0] = this.fromTime;
            this.init_time[1] = this.toTime;
        }

        //this.datePicker.mainFromField.setValue( this.datePicker.dataFormatting(retrieveRange.timeRange[0], this.datePicker.DisplayTime));
        //this.datePicker.mainToField.setValue( this.datePicker.dataFormatting(retrieveRange.timeRange[1], this.datePicker.DisplayTime));

        if (!this.isInit) {
            this.tmpMaxElapse = this.maxElapse / 1000;
            this.tmpMinElapse = this.minElapse / 1000;
            this.tmpFromVal = this.datePicker.mainFromField.getValue();
            this.tmpToVal = this.datePicker.mainToField.getValue();

            this.datePicker.mainFromField.setValue( this.datePicker.dataFormatting(retrieveRange.timeRange[0], this.datePicker.DisplayTime));
            this.datePicker.mainToField.setValue( this.datePicker.dataFormatting(retrieveRange.timeRange[1], this.datePicker.DisplayTime));

            this.minElapseField.setValue(this.tmpMinElapse);
            if (this.maxElapse == 100000000) {
                this.maxElapseField.setValue(common.Util.TR('infinite'));
            } else {
                this.maxElapseField.setValue(this.tmpMaxElapse);
            }
            this.isInit = true;

        }


        this.detailScatter.yRange = [this.minElapse / 1000, this.maxElapse / 1000];
        //this._updateElapseRangeField();
    },

    _getWasList: function() {
        if (this.isAllWasRetrieve) {
            if (this.isStandAlone) {
                //return 'select was_id from xapm_was_info';
                return ' SELECT was_id FROM xapm_was_info' +
                       ' UNION' +
                       ' SELECT server_id as was_id' +
                       ' FROM xapm_auto_id_history' +
                       ' WHERE unm3 is not null';
            } else {
                return Comm.selectedWasArr.join(',');
            }
        } else {
            return this.wasField.getValue();
        }
    },

    retrieveScatter: function() {
        this.detailScatterBox.loadingMask.showMask();

        this.scatterWidth = this.detailScatterBox.getWidth();
        this.scatterHeight = this.detailScatterBox.getHeight();

        var bankCode;
        if (this.isExtBankMode) {
            bankCode = 'AND BANK_CODE=\'' + this.extBankField.getValue() + '\'';
        } else {
            bankCode = '';
        }

        //한국시간 offset값 -3240000이어서 기본값 음수.
        var time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        //만약 offset값이 양수일 경우는 문자열 + 를 넣어서 sql상 error가 발생 안하도록 변경.
        if (time_zone > 0) {
            //양수일 경우
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: 'IMXPA_ResponseInspector_Scatter.sql',
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }, {
                name: 'sqlElapse', value: this.sqlElapseField.getValue() * 1000, type: SQLBindType.INTEGER
            }, {
                name: 'sqlExecCount', value: this.sqlExecField.getValue(), type: SQLBindType.INTEGER
            }, {
                name: 'fetchCount', value: this.fetchCntField.getValue(), type: SQLBindType.INTEGER
            }],
            replace_string: [{
                name: 'wasId', value: this._getWasList()
            }, {
                name: 'bankCode', value: bankCode
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'gid', value: this._gidRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'loginName', value: this._loginNameRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'pcid', value: this._pcidRepl
            }, {
                name: 'time_zone', value: time_zone
            }]
        }, this._onScatterData, this);

    },

    _onScatterData: function(header, data) {
        if (this.isClosed) {
            return;
        }

        this.detailScatter.fromTime = new Date(this.fromTime);
        this.detailScatter.toTime =   new Date(this.toTime);

        this.isChartDataVisible = (this.detailScatter.target.getWidth() > 0);

        this.detailScatter.draw(data.rows, this.scatterWidth, this.scatterHeight);
        this.detailScatterBox.setLoading(false);
        this.detailScatterBox.loadingMask.hide();

        this.completeScatterSqlExec = true;
    },

    checkValid: function() {
        var minElapse = this.minElapseField.getValue(),
            maxElapse = this.maxElapseField.getValue();

        if (isNaN(minElapse)) {
            this.minElapseField.setValue(0);
        }

        if (isNaN(maxElapse)) {
            this.maxElapseField.setValue(common.Util.TR('infinite'));
            maxElapse = 99999999999;
        }

        if (minElapse > maxElapse) {
            this.minElapseField.markInvalid('');
            this.maxElapseField.markInvalid('');
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Minimum elapse time cannot be greater than maximum elapse time.'));
            return false;
        }
        return true;
    },

    executeSQL: function() {
        var self = this;

        this.retrieve_click = true;
        this.init_time = null;
        this.completeScatterSqlExec = false;
        this.completeGridListSqlExec = false;

        this.retrieveScatter();

        setTimeout(function() {
            if (self.autoRetrieveRange == null) {
                self = null;
                return;
            }

            if ( self.autoRetrieveRange.wasName == 'All' ) {
                self.wasField.selectByIndex(0);
            } else {
                self.wasField.selectByValues(self.autoRetrieveRange.wasName);
            }
            self = null;
        },500);
    },

    retrieve: function() {
        var me = this;
        this.isInit = false;

        var result =  this.wasField.checkValid() && this.checkValid();

        if (result) {
            me.minElapse = me.minElapseField.getValue() * 1000;
            var maxElapse = 0;

            if (me.maxElapseField.getValue() == common.Util.TR('infinite')){
                maxElapse = 'infinite';
            } else {
                maxElapse = me.maxElapseField.getValue() * 1000;
            }

            var tmp = me.txnNameField.value;
            if ( tmp.indexOf(']') > 0 ) {
                tmp = tmp.substr(tmp.indexOf(']') + 2, tmp.length);
            }

            me.setRetrieveRange({
                timeRange  : [new Date(me.datePicker.mainFromField.getValue()),
                    new Date(me.datePicker.mainToField.getValue())],
                elapseRange: [me.minElapseField.getValue() * 1000, maxElapse],
                txnName: [ tmp ]
            });

            this.init_elapse_min = me.minElapseField.getValue();
            this.init_elapse_max = Number(me.maxElapseField.getValue());

            if (typeof this.liveScatter !== 'undefined') {
                this.liveScatter.lastRetrievedRange = null;
            }

            // txnDetail 호출 시 사용 txnDetail 호출할 때 getValue를 추출하면 조회 전 조건이 변경된걸 추출함.
            this.opTxnName = this.txnNameField.getValue();
            this.opClientIp = common.Util.strIpToHex(this.ipField.getValue());

            this.opGid = this.gidField.getValue();
            this.opTid = this.tidField.getValue();
            this.opPcid = this.pcidField.getValue();
            this.opException = this.exceptionToggle.getValue();
            this.opLoginName = this.loginNameField.getValue();

            // txnDetail 호출 시 사용
            this.opFetchCnt = this.fetchCntField.getValue();
            this.opSQLElapseTime = this.sqlElapseField.getValue();
            this.opSQLExecCnt = this.sqlExecField.getValue();

            if (this.opTxnName == '%') {
                this._txnNameRepl = '';
            } else {
                this._txnNameRepl = 'AND e.txn_id in (SELECT n.txn_id ' +
                  'FROM   xapm_txn_name n left outer join  xapm_txn_name_ext e ON  n.txn_name = e.txn_name ' +
                  'WHERE   n.txn_name LIKE \'' + this.opTxnName + '\' OR e.txn_name_ext LIKE \'' + this.opTxnName + '\' )';
            }

            if (this.opClientIp == '%') {
                this._clientIpRepl = '';
            } else {
                this._clientIpRepl = 'AND client_ip LIKE \'' + this.opClientIp + '\' ';
            }


            if (this.opGid == '%') {
                this._gidRepl = '';
            } else {
                this._gidRepl = 'AND guid LIKE \'' + this.opGid + '\'';
            }

            if (!this.opTid) {
                this._tidRepl = '';
            } else {
                this._tidRepl = 'AND e.tid = ' + this.opTid;
            }

            if (!this.opPcid) {
                this._pcidRepl = '';
            } else {
                this._pcidRepl = 'AND c.data = ' + this.opPcid;
            }

            if (this.opException) {
                this._exceptionRepl = '';
            } else {
                this._exceptionRepl = 'AND exception > 0 ';
            }

            if (this.opLoginName == '%') {
                this._loginNameRepl = '';
            } else {
                this._loginNameRepl = 'AND login_name LIKE \'' + this.opLoginName + '\' ';
            }
        } else {
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string') {
                console.warn('message :', result);
            }
            return;
        }

        result = this.datePicker.checkValid();
        if (!result) {
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string') {
                console.warn('');
            }
        } else {
            this.setTitleWithTimeRange();
            this.executeSQL();
        }
    },

    setTitleWithTimeRange: function() {
        var fromTime, toTime, findComponent, instanceName;
        if (this.tab) {

            fromTime = this.datePicker.getFromDateTime();
            toTime = this.datePicker.getToDateTime();

            if (fromTime.length == 13) {
                fromTime += ':00';
            } else if (fromTime.length == 10) {
                fromTime += ' 00:00';
            }

            if (toTime.length == 13) {
                toTime += ':00';
            } else if (toTime.length == 10) {
                toTime += ' 00:00';
            }

            common.DataModule.timeInfo.lastFromTime = fromTime;
            common.DataModule.timeInfo.lastToTime   = toTime;


            findComponent = this.conditionArea.getComponent('wasCombo');

            if (findComponent == 'undefined' || findComponent == null) {
                findComponent = this.conditionArea.getComponent('dbCombo');
            }


            if (findComponent == 'undefined' || findComponent == null) {
                this.tab.setText(this.title + '<div>[' +
                  Ext.util.Format.date(fromTime, 'H:i~') +
                  Ext.util.Format.date(toTime, 'H:i]</div>'));
            } else {
                instanceName = findComponent.WASDBCombobox.getRawValue() + ' : ';

                if (instanceName.length > 25) {
                    instanceName = instanceName.substr(0, 20) + '... : ';
                }

                if ( this.isDaily === true ) {
                    this.tab.setText(this.title + '<div>[' + instanceName +
                      Ext.util.Format.date(fromTime, 'm-d~') +
                      Ext.util.Format.date(toTime, 'm-d]</div>'));

                } else if (this.DisplayTime == DisplayTimeMode.None || this.singleField === true) {
                    this.tab.setText(this.title + '<div>[' + instanceName + Ext.util.Format.date(fromTime, 'Y-m-d]</div>'));
                } else {
                    this.tab.setText(this.title + '<div>[' + instanceName +
                      Ext.util.Format.date(fromTime, 'H:i~') +
                      Ext.util.Format.date(toTime, 'H:i]</div>'));
                }
            }
            window.tabPanel.setRightScrollPosition();
        }
    }

});
