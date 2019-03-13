Ext.define('rtm.src.rtmWebActiveTxnList', {
    extend : 'rtm.src.rtmActiveTxn',
    title  : common.Util.CTR('Active Transaction'),
    layout : 'fit',

    isOption: true,

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WEB_ACTIVE_DETAIL, me);

            this.stopTxnCheckRefresh();
            this.refreshTimer = null;

            me.grid.removeAll();
        }
    },


    init: function() {
        this.callParent();

        this.initProperty();

        this.frameTitle.setText(this.title);

        this.createGrid();

        this.checkFilterWs();

        this.startTxnCheckRefresh();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WEB_ACTIVE_DETAIL, this);

        if (this.optionBtn) {
            this.optionBtn.optionView = this.createOptionWindow();
        }

    },


    /**
     * Init Property Parameters
     */
    initProperty: function() {
        this.monitorType  = 'WEB';
        this.openViewType = Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        // 그리드 목록에서 클래스 자바 소스 및 트랜잭션 자보 소스를 볼 수 있는 메뉴 표시
        // TP, WEB 인 경우에는 false 로 설정되어 소스보기 메뉴가 표시되지 않는다.
        this.enableClassView  = false;
        this.enableThreadDump = false;

        // 관리자 권한인 경우에 대해서만 옵션 창을 볼 수 있게 설정
        if (cfg.login.admin_check !== 1 && this.optionBtn) {
            this.optionBtn.setVisible(false);
        }

        this.wasList = [];

        if (realtime.selectedTPNames.length > 0) {
            this.wasList = this.selectedServerIdArr.concat();
        } else {
            this.wasList = this.serverIdArr.concat();
        }

        this.timerCount = 0;
        this.refreshTimer = null;
        this.sqlFullText  = null;

        this.activeTxnRefreshCheck = true;
        this.useActiveTimeColor = Comm.RTComm.getBooleanValue(Comm.web_env_info['WEBuseActiveTimeColor']);

        // 기본 값
        this.warningTime  = 3000;
        this.criticalTime = 7000;

        var activeLevel = Comm.web_env_info['WEB_ACTTIME_LEVEL(MS)'];

        if (activeLevel) {
            this.warningTime  = activeLevel.split(',')[0];
            this.criticalTime = activeLevel.split(',')[1];
        }

        this.formatLabel = {
            over   : common.Util.TR('{0} MilliSec and over'),
            between: common.Util.TR('{0} MilliSec and over under {1} MilliSec')
        };

    },


    checkFilterWs: function() {
        this.popupFilterWasId   = realtime.openTxnFilterWasId;

        realtime.openTxnFilterWasId = null;

        // 특정 WAS를 보기 위해서 실행되었는지 체크,
        // 지정된 WAS ID가 있으면 해당되는 WAS 정보만 보여준다.
        if (this.popupFilterWasId) {
            this.wasList.length = 0;

            var wasName = [];

            if (Number.isInteger(this.popupFilterWasId)) {
                this.wasList[0] = this.popupFilterWasId;

                wasName[wasName.length] = Comm.RTComm.getServerNameByID(this.popupFilterWasId, this.monitorType);
            } else {
                this.wasList = this.popupFilterWasId.split(',');
                for (var ix = 0; ix < this.wasList.length; ix++) {
                    this.wasList[ix] = +this.wasList[ix];

                    wasName[wasName.length] = Comm.RTComm.getServerNameByID(this.wasList[ix], this.monitorType);
                }
            }
            wasName = wasName.join();

            this.up().setTitle(this.title + ' ('+ (wasName) +')');

            // 메인 화면 좌측 메뉴에서 WAS를 선택하는 경우에 표시되는 WAS가 변경되지 않도록
            // 관련 함수를 null 처리.
            this.frameChange = null;
        }

    },


    /**
     * 그리드 생성
     */
    createGrid: function() {

        this.grid = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'H:i:s',
            usePager      : false,
            borderVisible : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title
        });

        this.grid.beginAddColumns();

        try {
            this.grid.addColumn(common.Util.CTR('Time'              ), 'time'          ,  70, Grid.DateTime  , false, true);
            this.grid.addColumn(common.Util.CTR('Server ID'         ), 'serverid'      , 100, Grid.Number    , false, true);
            this.grid.addColumn(common.Util.CTR('Server Name'       ), 'servername'    , 110, Grid.String    , false, false);
            this.grid.addColumn(common.Util.CTR('Transaction'       ), 'txnName'       , 250, Grid.String    , true,  false);
            this.grid.addColumn(common.Util.CTR('Status'            ), 'status'        ,  80, Grid.String    , false,  true);
            this.grid.addColumn(common.Util.CTR('Type'              ), 'type'          ,  80, Grid.String    , true,  false);
            this.grid.addColumn(common.Util.CTR('Start Time'        ), 'starttime'     , 110, Grid.DateTime  , true,  false);
            this.grid.addColumn(common.Util.CTR('Elapse Time'       ), 'elapsetime'    ,  90, Grid.Float     , true,  false);
            this.grid.addColumn(common.Util.CTR('Client IP'         ), 'clientip'      , 110, Grid.String    , true,  false);
            this.grid.addColumn(common.Util.CTR('TID'               ), 'tid'           , 110, Grid.String    , false,  true);
        } finally {
            this.grid.setOrderAct('elapsedtime', 'desc');
            this.grid.endAddColumns();
        }

        this.setRowClassByElapseTime();

        this.tabpanel.add(this.grid);

        this.grid.drawGrid();
    },

    /**
     * 액티브 트랜잭션 옵션창 생성
     */
    createOptionWindow: function() {

        var optionPanel = Ext.create('Ext.panel.Panel', {
            layout : 'vbox',
            width  : '100%',
            height : 120,
            border : false,
            split  : true,
            margin : '3 0 3 0',
            padding: '2 2 2 2',
            items: [{
                xtype : 'container',
                layout: 'absolute',
                cls   : 'rtm-activetxn-option',
                itemId: 'optionPanelLeft',
                width : '100%',
                flex  : 1
            }]
        });

        var firstOption = Ext.create('Ext.form.FieldSet',{
            width : 395,
            height: 140,
            layout: {
                type :'absolute'
            },
            title: common.Util.TR('Activity Monitor Color Indication Criteria'),
            x: 10,
            y: 12
        });

        var warningValue, criticalValue;

        warningValue = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Warning'),
            labelAlign: 'left',
            allowBlank: false,
            width     : 120,
            labelWidth: 55,
            maxLength : 5,
            value     : this.warningTime,
            oldValue  : this.warningTime,
            x         : 20,
            y         : 2,
            allowExponential: false,
            allowDecimals   : false,
            enforceMaxLength: true,
            enableKeyEvents : true,
            hideTrigger     : true,
            cls : 'rtm-list-condition',
            listeners: {
                scope: this,
                blur: function(me) {
                    if (me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value >= 100000) {
                            me.setValue(99999);
                        }

                        if (this.validateOptionWarning(criticalValue.getValue(), me.value)) {
                            me.setValue(me.oldValue);
                            return;
                        }

                        me.oldValue = me.value;
                    }
                },
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value >= 100000) {
                            me.setValue(99999);
                        }

                        if (this.validateOptionWarning(criticalValue.getValue(), me.value)) {
                            me.setValue(me.oldValue);
                            return;
                        }

                        me.oldValue = me.value;
                    }
                }
            }
        });

        var warningLabel = Ext.create('Ext.form.Label', {
            x   : 145,
            y   : 8,
            html: '<span>' + common.Util.TR('MilliSec and over') + '</span>'
        });

        criticalValue = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Critical'),
            labelAlign: 'left',
            allowBlank: false,
            width     : 120,
            labelWidth: 55,
            maxLength : 5,
            value     : this.criticalTime,
            oldValue  : this.criticalTime,
            x         : 20,
            y         : 22,
            allowExponential: false,
            allowDecimals   : false,
            enforceMaxLength: true,
            enableKeyEvents : true,
            hideTrigger     : true,
            cls : 'rtm-list-condition',
            listeners: {
                scope: this,
                blur: function(me) {
                    if (me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value >= 100000) {
                            me.setValue(99999);
                        }

                        if (this.validateOptionCritical(me.value, warningValue.getValue())) {
                            me.setValue(me.oldValue);
                            return;
                        }
                        me.oldValue = me.value;
                    }
                },
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value >= 100000) {
                            me.setValue(99999);
                        }

                        if (this.validateOptionCritical(me.value, warningValue.getValue())) {
                            me.setValue(me.oldValue);
                            return;
                        }
                        me.oldValue = me.value;
                    }
                }
            }
        });

        var criticalLabel = Ext.create('Ext.form.Label', {
            x   : 145,
            y   : 27,
            html: '<span>' + common.Util.TR('MilliSec and over') + '</span>'
        });

        firstOption.add(warningLabel, warningValue, criticalLabel, criticalValue);

        this.setGuideInfo(firstOption);

        this.descrRangeNormal.text = Ext.String.format(this.formatLabel.between, 0, this.warningTime);
        this.descrRangeWarning.text = Ext.String.format(this.formatLabel.between, this.warningTime, this.criticalTime);
        this.descrRangeCritical.text = Ext.String.format(this.formatLabel.over, this.criticalTime);

        var secondOption = Ext.create('Ext.form.FieldSet',{
            width : 395,
            height: 60,
            layout: {
                type :'absolute'
            },
            title: common.Util.TR('Active Transaction Elapse Time Color Display'),
            x: 10,
            y: 165
        });

        var useStatusLabel = Ext.create('Ext.form.Label', {
            x   : 20,
            y   : 10,
            html: '<span>' + common.Util.TR('Use Status') + '</span>'
        });

        var toggleOnOff = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width  : 100,
            margin: '10 0 0 100',
            onText : common.Util.TR('Apply'),
            offText: common.Util.TR('Unapplied'),
            state  : this.useActiveTimeColor
        });

        secondOption.add(useStatusLabel, toggleOnOff);

        optionPanel.getComponent('optionPanelLeft').add(firstOption, secondOption);

        var bottomArea =  Ext.create('Exem.Container', {
            cls    : 'rtm-activetxn-option-bottom',
            layout : {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            margin: '0 0 0 0',
            width : '100%',
            height: 38,
            items: [{
                xtype: 'button',
                cls : 'rtm-btn',
                text: common.Util.TR('OK'),
                width : 60,
                height: 20,
                listeners: {
                    scope: this,
                    click: function(me) {
                        this.useActiveTimeColor = toggleOnOff.getValue();
                        this.warningTime = warningValue.getValue();
                        this.criticalTime = criticalValue.getValue();

                        common.WebEnv.Save('WEBuseActiveTimeColor', this.useActiveTimeColor);

                        // 공통 데이터라서 사용자 ID를 -1로 설정
                        var actTimeLevel = this.warningTime + ',' + this.criticalTime;
                        common.WebEnv.SaveByUserID('WEB_ACTTIME_LEVEL(MS)', actTimeLevel, -1);

                        me.up('.window').close();
                    }
                }
            },{
                xtype : 'button',
                cls   : 'rtm-btn',
                text  : common.Util.TR('Cancel'),
                margin: '0 0 0 15',
                height: 20,
                listeners: {
                    scope: this,
                    click: function(me) {
                        this.changeLvWas = null;
                        this.changeTxnLv = '';
                        me.up('.window').close();
                    }
                }
            }]
        });

        optionPanel.add(bottomArea);

        var optionWin =  Ext.create('Exem.XMWindow', {
            layout  : 'fit',
            title   : common.Util.TR('Active Transaction Option'),
            cls     : 'xm-dock-window-base',
            width   : 440,
            height  : 340,
            modal   : true,
            resizable  : false,
            maximizable: false,
            closeAction: 'hide',
            listeners: {
                scope: this,
                beforeshow: function() {
                    if (toggleOnOff.state !== this.useActiveTimeColor) {
                        toggleOnOff.toggle();
                    }
                    warningValue.setValue(this.warningTime);
                    criticalValue.setValue(this.criticalTime);

                    this.descrRangeNormal.setText(Ext.String.format(this.formatLabel.between, 0, this.warningTime));
                    this.descrRangeWarning.setText(Ext.String.format(this.formatLabel.between, this.warningTime, this.criticalTime));
                    this.descrRangeCritical.setText(Ext.String.format(this.formatLabel.over, this.criticalTime));
                }
            }
        });
        optionWin.add(optionPanel);

        return optionWin;
    },

    /**
     * 경고 항목에 입력된 값을 검증.
     *
     * @param {number} cVal - Critical Value
     * @param {number} wVal - Warning Value
     * @return {boolean}
     */
    validateOptionWarning: function(cVal, wVal) {
        var isReturn = false;
        if (cVal <= wVal) {
            Ext.MessageBox.show({
                title   : '',
                icon    : Ext.MessageBox.WARNING,
                message : common.Util.TR('Warning value is greater than critical value.'),
                modal   : true,
                cls     : 'popup-message',
                buttons : Ext.Msg.OK
            });
            isReturn = true;

        } else {
            this.descrRangeNormal.setText(Ext.String.format(this.formatLabel.between, 0, wVal));
            this.descrRangeWarning.setText(Ext.String.format(this.formatLabel.between, wVal, cVal));
            this.descrRangeCritical.setText(Ext.String.format(this.formatLabel.over, cVal));
        }
        return isReturn;
    },


    /**
     * 심각 항목에 입력된 값을 검증.
     *
     * @param {number} cVal - Critical Value
     * @param {number} wVal - Warning Value
     * @return {boolean}
     */
    validateOptionCritical: function(cVal, wVal) {
        var isReturn = false;
        if (cVal <= wVal) {
            Ext.MessageBox.show({
                title   : '',
                icon    : Ext.MessageBox.WARNING,
                message : common.Util.TR('Put a value greater than a warning to critical.'),
                modal   : true,
                cls     : 'popup-message',
                buttons : Ext.Msg.OK
            });
            isReturn = true;
        } else {
            this.descrRangeNormal.setText(Ext.String.format(this.formatLabel.between, 0, wVal));
            this.descrRangeWarning.setText(Ext.String.format(this.formatLabel.between, wVal, cVal));
            this.descrRangeCritical.setText(Ext.String.format(this.formatLabel.over, cVal));
        }
        return isReturn;
    },


    /**
     * 액티브 트랜잭션 옵션 설정화면에 보여지는 가이드 정보 설정.
     *
     * @param {object} target
     */
    setGuideInfo: function(target) {
        var iconNormal = Ext.create('Ext.form.Label', {
            x: 20,
            y: 55,
            html: '<div class="label-icon normal"></div>'
        });

        var descrNormal = Ext.create('Ext.form.Label', {
            x: 40,
            y: 55,
            html: '<div">' + common.Util.TR('Normal') + ' :</div>'
        });

        this.descrRangeNormal = Ext.create('Ext.form.Label', {
            x: 95,
            y: 55,
            text: this.formatLabel.between
        });

        var iconWarning = Ext.create('Ext.form.Label', {
            x: 20,
            y: 75,
            html: '<div class="label-icon warning"></div>'
        });

        var descrWarning = Ext.create('Ext.form.Label', {
            x: 40,
            y: 75,
            html: '<div>' + common.Util.TR('Warning') + ' :</div>'
        });

        this.descrRangeWarning = Ext.create('Ext.form.Label', {
            x: 95,
            y: 75,
            text: this.formatLabel.between
        });

        var iconCritical = Ext.create('Ext.form.Label', {
            x: 20,
            y: 95,
            html: '<div class="label-icon critical"></div>'
        });

        var descrCritical = Ext.create('Ext.form.Label', {
            x: 40,
            y: 95,
            html: '<div>' + common.Util.TR('Critical') + ' :</div>'
        });

        this.descrRangeCritical = Ext.create('Ext.form.Label', {
            x: 95,
            y: 95,
            text: this.formatLabel.over
        });

        target.add(
            iconNormal,   descrNormal,   this.descrRangeNormal,
            iconWarning,  descrWarning,  this.descrRangeWarning,
            iconCritical, descrCritical, this.descrRangeCritical
        );
    },


    /**
     * rtmActiveTxn.js의 changeAutoRefresh() Override
     *
     * @param {boolean} val - 체크박스 체크 유무 true: 체크됨, false: 체크안됨
     */
    changeAutoRefresh: function(val) {
        this.activeTxnRefreshCheck = val;
    },


    /**
     * 트랜잭션을 체크하는 체크로직 중지
     */
    stopTxnCheckRefresh: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },


    /**
     * 액티브 트랜잭션 데이터가 설정된 시간동안 발생하지 않으면 목록을 클리어
     */
    startTxnCheckRefresh: function() {
        this.stopTxnCheckRefresh();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp && this.activeTxnRefreshCheck) {
            this.diffSec = Ext.Date.diff(this.lastTxnTime , new Date(), Ext.Date.SECOND);

            if (this.diffSec > 6) {
                this.grid.clearRows();
                this.hideTooltip();
            }
        }

        this.refreshTimer = setTimeout(this.startTxnCheckRefresh.bind(this), 6000);
    },


    /**
     * 액티브 트랜잭션 패킷 데이터 로드
     *
     * @param {Object} adata
     */
    onData: function(adata) {

        this.lastTxnTime = new Date();

        // 새로고침이 체크되어 있는지 확인
        if (!this.activeTxnRefreshCheck) {
            return;
        }

        if(document.hidden){
            return;
        }

        if (adata.rows.length <= 0 || adata.rows[0].length <= 0) {
            return false;
        }

        // RTM 화면이 아닌 경우 데이터 갱신을 하지 않는다.
        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);
        if (!isDisplayCmp) {
            return;
        }

        this.drawData(adata);

        adata = null;
    },


    /**
     * 액티브 트랜잭션 데이터 표시
     *
     * @param {Object} data
     * [0] time
     * [1] start_time
     * [2] server_id
     * [3] server_ip
     * [4] server_port
     * [5] path
     * [6] http_status
     * [7] http_method
     * [8] webid
     * [9] tid
     * [10] client_ip
     * [11] elapse_time
     */
    drawData: function(data) {

        if (data == null) {
            this.timerCount++;

            if (this.timerCount > 1 && this.activeTxnRefreshCheck) {
                this.grid.clearRows();
            }
        }

        if (this.grid.pnlExGrid.headerCt == null) {
            return;
        }

        if (!data || !data.rows || data.rows.length <= 0 || !this.activeTxnRefreshCheck) {
            return;
        }

        var d;
        var svrId, svrName;

        this.grid.clearRows();

        for (var ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            d = data.rows[ix];
            svrId = d[2];

            if (this.wasList.indexOf(svrId) !== -1) {

                if (Comm.webServersInfo[svrId]) {
                    svrName = Comm.webServersInfo[svrId].name;
                } else {
                    svrName = '';
                }

                this.grid.addRow([
                    new Date(d[0]),               // Time
                    svrId,                        // Server ID
                    svrName,                      // Server Name
                    d[5],                         // URL
                    d[6],                         // Status
                    d[7],                         // Type
                    new Date(d[1]),               // Start Time
                    d[11] / 1000,                 // Elapsed Time
                    d[10],                        // User IP
                    d[9]                          // TID
                ]);
            }
        }

        this.grid.drawGrid();
        this.timerCount = 0;

    },


    /**
     * '수행 시간'이 설정된 임계치 값에 해당하는 경우 행의 색상을 설정.
     *
     * 색상을 강조하는 옵션이 설정된 경우 설정된 임계치 값을 기준으로 표시처리하며
     * 설정되지 않은 경우에는 색상을 표시하지 않는다.
     * 임계치 값이 설정되지 않은 경우에는 아래의 기본값으로 체크하여 표시한다.
     *
     *  [임계치 기본 값]
     *  0 ~ 3초 미만: Normal
     *  3 ~ 7초 미만: Warning
     *  7초 이상    : Critical
     */
    setRowClassByElapseTime: function() {
        this.grid.pnlExGrid.getView().getRowClass = function(record) {
            if (!this.useActiveTimeColor) {
                return;
            }

            // record.data.elapsedtime (s)
            // this.criticalTime, this.warningTime (ms)
            var cls;
            var eTime = record.data.elapsetime * 1000;

            if (eTime >= this.criticalTime) {
                cls = 'rtm-txn-row-critical';
            } else if (eTime >= this.warningTime) {
                cls = 'rtm-txn-row-warning';
            } else {
                cls = '';
            }
            return cls;
        }.bind(this);
    }


});
