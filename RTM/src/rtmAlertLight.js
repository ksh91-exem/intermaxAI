Ext.define('rtm.src.rtmAlertLight', {
    extend   : 'Exem.DockForm',
    title    : common.Util.CTR('Alarm Log History'),
    layout   : 'fit',

    DISPLAYTYPE: {CHART: 1, GRID: 2},
    SERVERTYPE : {WAS: 1, DB: 2, SERVER: 3},

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);

            if (this.refreshTimerId) {
                clearTimeout(this.refreshTimerId);
            }

            this.isComponentClosed = true;
        }
    },

    initPorperty: function() {
        var webEnvData;

        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        // Icon <-> Grid
        this.mode = this.DISPLAYTYPE.CHART;

        this.alarmGridList   = [];
        this.alarmGridLevelList = [];

        this.initAlarmList();

        // 알람 내역 삭제 주기 옵션 설정
        if (Comm.web_env_info.alarm_option) {
            webEnvData = JSON.parse(Comm.web_env_info.alarm_option);
        }

        // 알람 발생 목록 표시 갯수 설정
        this.gridBufSize = webEnvData ? webEnvData.gridBufferSize : 100;

        // 알람 발생 목록 삭제 주기 설정
        this.expiredInterval = webEnvData ? webEnvData.timeout : 1;
        this.expiredInterval = this.expiredInterval * 60 * 1000;
    },


    /**
     * 서버 타입별 알람 레벨 목록을 구성 및 초기화
     */
    initAlarmList: function() {
        var ix, ixLen;
        var wasKeys, dbKeys;

        this.alarmLevelList  = {};

        wasKeys = Object.keys(Comm.wasInfoObj);
        for (ix = 0, ixLen = wasKeys.length; ix < ixLen; ix++) {
            if (Comm.wasInfoObj[wasKeys[ix]].type === 'WAS') {
                this.alarmLevelList[Comm.wasInfoObj[wasKeys[ix]].wasName] = {};
            }
        }

        dbKeys = Object.keys(Comm.dbInfoObj);
        for (ix = 0, ixLen = dbKeys.length; ix < ixLen; ix++) {
            this.alarmLevelList[Comm.dbInfoObj[dbKeys[ix]].instanceName] = {};
        }
    },


    init : function() {
        var alarmMode;
        var colors;
        var theme = Comm.RTComm.getCurrentTheme();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);

        this.initPorperty();

        //  floating panel
        this.tootipArea = this.createAlarmInfoArea();

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            listeners: {
                scope : this,
                render: function(_this) {
                    _this.el.on('mouseleave', function() {
                        this.closeTimer = setTimeout(function() {
                            this.hideAlertDetail();
                        }.bind(this), 100);
                    }.bind(this));
                }
            }
        });

        this.titleArea = Ext.create('Exem.Container', {
            width : '100%',
            height: 20,
            margin: '5 0 5 0',
            layout: {
                type: 'hbox'
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label', {
            height: 20,
            margin: '0 0 0 10',
            cls   : 'header-title',
            text  : common.Util.CTR('Alarm Log History')
        });

        alarmMode = Comm.web_env_info.rtm_alert_list_mode;

        if (alarmMode === 'GRID') {
            this.mode = this.DISPLAYTYPE.GRID;
        }

        this.jumpAlarmHistoryBtn = Ext.create('Ext.button.Button', {
            text : common.Util.TR('Alert Summary'),
            cls  : 'rtm-button',
            width: 100,
            padding: '1',
            margin: '0 2 0 4',
            listeners: {
                scope: this,
                click: function() {
                    var paView, mainTab;

                    paView = Ext.create('view.AlertHistory', {
                        title       : common.Util.TR('Alert Summary'),
                        closable    : true,
                        monitorType : this.monitorType
                    });

                    if (this.monitorType === 'TP' || this.monitorType === 'WEB' || this.monitorType === 'CD') {
                        paView.title = this.monitorType + ' ' + paView.title;
                    }

                    mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                    mainTab.add(paView);
                    mainTab.setActiveTab(mainTab.items.length - 1);
                    paView.init();
                    setTimeout(function() {
                        paView.executeSQL();
                        paView  = null;
                    },500);
                }
            }
        });

        this.toggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width    : 100,
            height   : 20,
            margin   : '1 10 0 1',
            onText   : common.Util.TR('GRAPH'),
            offText  : common.Util.TR('GRID'),
            state    : (alarmMode !== 'GRID'),
            listeners: {
                scope : this,
                change: function(toggle, state) {
                    if (state) {
                        common.WebEnv.Save('rtm_alert_list_mode', 'GRAPH');
                        this.alarmDispArea.setVisible(true);
                        this.alarmGridArea.setVisible(false);
                        this.mode = this.DISPLAYTYPE.CHART;

                        if (this.alarmIcon) {
                            this.alarmIcon.startAnimationFrame();
                        }
                    } else {
                        this.alarmDispArea.setVisible(false);
                        this.alarmGridArea.setVisible(true);
                        this.mode = this.DISPLAYTYPE.GRID;

                        common.WebEnv.Save('rtm_alert_list_mode', 'GRID');
                        this.drawAlarm();

                        if (this.alarmIcon) {
                            this.alarmIcon.stopAnimationFrame();
                        }
                    }
                }
            }
        });

        this.optionButton = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '2 10 0 0',
            html  : '<div class="frame-option-icon" title="' + common.Util.TR('option') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function() {
                        this.alarmOptionWindow.show();
                    }, this);
                }
            }
        });

        this.titleArea.add(this.frameTitle, {xtype: 'tbfill', flex: 1}, this.jumpAlarmHistoryBtn, this.toggle, this.optionButton);

        this.changeViewArea = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'fit',
            flex  : 1,
            margin: '5'
        });

        switch (theme) {
            case 'Black' :
                colors = realtime.CircleColor.Black;
                break;
            case 'White' :
                colors = realtime.CircleColor.White;
                break;
            default :
                colors = realtime.CircleColor.Gray;
                break;
        }

        this.alarmIcon = Ext.create('Exem.chart.AlarmIcon', {
            color        : colors,
            margin       : '0 0 0 0'
        });
        this.alarmIcon.iconMouseOver  = this.showAlertDetail.bind(this);
        this.alarmIcon.iconMouseLeave = this.hideAlertDetail.bind(this);
        this.alarmIcon.checkAlarmLevel = this.getMaxAlarmLevel.bind(this);

        this.alarmDispArea = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            margin: '5',
            hidden: (alarmMode === 'GRID')
        });

        this.alarmGridArea = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            hidden: (alarmMode !== 'GRID')
        });

        this.alarmGrid = Ext.create('Exem.BaseGrid', {
            layout           : 'fit',
            usePager         : false,
            borderVisible    : true,
            stripeRows       : false,
            defaultbufferSize: 0,
            defaultPageSize  : 0,
            localeType       : 'H:i:s',
            baseGridCls      : 'baseGridRTM',
            exportFileName   : this.title
        });

        this.addGridColumns();

        this.add(this.background);
        this.changeViewArea.add(this.alarmDispArea, this.alarmGridArea);

        this.alarmDispArea.add(this.alarmIcon);
        this.background.add(this.titleArea, this.changeViewArea);


        this.setServerList();

        this.createOptionWindow();

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
        }

        // 마지막 들어온 알람을 그려주고 시작
        setTimeout(function() {
            this.lastAlarmCheck();

            this.drawAlarm();

        }.bind(this), 1000);

        this.checkExpiredTimer = setTimeout(this.checkExpiredAlarm.bind(this), this.expiredInterval);
    },


    /**
     * 알람 화면에 아이콘으로 표시될 대상 서버 설정
     */
    setServerList: function() {
        var ix, ixLen;
        var idArr   = [];
        var nameArr = [];
        var typeArr = [];

        var wasKeys, dbKeys, serverKeys, serverId;

        wasKeys = Object.keys(Comm.wasInfoObj);
        for (ix = 0, ixLen = wasKeys.length; ix < ixLen; ix++) {
            serverId = wasKeys[ix];

            if (Comm.wasInfoObj[serverId].type !== 'WAS') {
                continue;
            }

            idArr[idArr.length]     = serverId;
            nameArr[nameArr.length] = Comm.wasInfoObj[serverId].wasName;
            typeArr[typeArr.length] = 1;
        }

        dbKeys = Object.keys(Comm.dbInfoObj);
        for (ix = 0, ixLen = dbKeys.length; ix < ixLen; ix++) {
            idArr[idArr.length]     = dbKeys[ix];
            nameArr[nameArr.length] = Comm.dbInfoObj[dbKeys[ix]].instanceName;
            typeArr[typeArr.length] = 2;
        }

        serverKeys = Object.keys(Comm.webServersInfo);
        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            idArr[idArr.length]     = serverKeys[ix];
            nameArr[nameArr.length] = Comm.webServersInfo[serverKeys[ix]].name;
            typeArr[typeArr.length] = 3;
        }

        this.alarmIcon.setChartLabels(idArr, nameArr, typeArr);
    },


    /**
     * Create Alarm Grid Column
     */
    addGridColumns: function() {
        var gridStore;

        this.alarmGrid.beginAddColumns();

        this.alarmGrid.addColumn(common.Util.CTR('Date')               , 'date'               , 70, Grid.String,   false, false);
        this.alarmGrid.addColumn(common.Util.CTR('Time')               , 'time'               , 70, Grid.DateTime, true,  false);
        this.alarmGrid.addColumn(common.Util.CTR('Server Type')        , 'server_type'        , 80, Grid.String  , false, false);
        this.alarmGrid.addColumn(common.Util.CTR('Server ID')          , 'server_id'          , 70, Grid.String  , false, true);

        if (common.Menu.isBusinessPerspectiveMonitoring) {
            this.alarmGrid.addColumn(common.Util.CTR('Tier Name')      , 'business_name'      , 70, Grid.String  , true,  false);
        } else {
            this.alarmGrid.addColumn(common.Util.CTR('Business Name')  , 'business_name'      , 70, Grid.String  , true,  false);
        }
        this.alarmGrid.addColumn(common.Util.CTR('Host Name')          , 'host_name'          , 70, Grid.String  , true,  false);

        this.alarmGrid.addColumn(common.Util.CTR('Agent')              , 'server_name'        , 70, Grid.String  , true,  false);
        this.alarmGrid.addColumn(common.Util.CTR('Event Name')         , 'alert_resource_name', 90, Grid.String  , true,  false);
        this.alarmGrid.addColumn(common.Util.CTR('Alert Level')        , 'alert_level'        , 70, Grid.String  , false, true);
        this.alarmGrid.addColumn(common.Util.CTR('Status')             , 'levelType'          , 80, Grid.String  , true,  false);
        this.alarmGrid.addColumn(common.Util.CTR('Value')              , 'value'              , 70, Grid.String  , true,  false);
        this.alarmGrid.addColumn(common.Util.CTR('Alert Type')         , 'alert_type'         , 80, Grid.String  , false, false);
        this.alarmGrid.addColumn(common.Util.CTR('Description')        , 'descr'              , 80, Grid.String  , true,  false);
        this.alarmGrid.addColumn(common.Util.CTR('Alert Resource ID')  , 'alert_resource_ID'  , 80, Grid.String  , false, true);
        this.alarmGrid.addColumn(common.Util.CTR('Module Type')        , 'moduleType'         , 80, Grid.String  , false, true);
        this.alarmGrid.endAddColumns();

        this.alarmGrid._columnsList[7].minWidth = 80;
        this.alarmGrid._columnsList[12].minWidth = 80;
        this.alarmGrid._columnsList[10].align = 'right';
        this.alarmGrid._columnsList[7].flex = 2;
        this.alarmGrid._columnsList[12].flex = 1;

        this.alarmGridArea.add(this.alarmGrid);

        gridStore = this.alarmGrid.pnlExGrid.getStore();
        gridStore.sort([
            { property : 'time', direction : 'ASC' }
        ]);

        this.alarmGrid._columnsList[2].renderer = function(value) {
            var type = '';
            if (value === 1) {
                type = 'WAS';
            } else if (value === 2) {
                type = 'DB';
            } else if (value === 3) {
                type = 'WebServer';
            } else if (value === 15) {
                type = 'C Daemon';
            } else if (value === 20) {
                type = 'Business';
            } else if (value === 30) {
                type = 'AI';
            }
            return type;
        };

        this.alarmGrid._columnsList[9].renderer = function(value, meta) {
            if (value == null) {
                return;

            } else if (value === 'Critical') {
                meta.style = 'background: #D92E2E; color: white; border-radius:8px; text-align:center; margin-left: 4x; margin-right: 4px;';

            } else if (value === 'Warning') {
                meta.style = 'background: #DB8930;  color: white; border-radius:8px; text-align:center; margin-left: 4x; margin-right: 4px;';
            }

            return value;
        };

        this.addContextMenu();

        this.alarmGrid.pnlExGrid.addListener('beforecellcontextmenu', function(thisGrid, td, cellIndex, record) {
            var alertName  = record.data.alert_resource_name;
            var alertType  = record.data.alert_type;
            var alertResourceID = record.data.alert_resource_ID; // tid
            var serverType = record.data.server_type;

            this.alarmGrid.contextMenu.setDisableItem('exception_summary'  , false);
            this.alarmGrid.contextMenu.setDisableItem('alert_summary'      , true);
            this.alarmGrid.contextMenu.setDisableItem('transaction_detail' , false);
            this.alarmGrid.contextMenu.setDisableItem('transaction_trend'  , false);

            if (!Ext.Array.contains(realtime.txnLinkAlarmList, alertName)) {
                if (alertType === 'Exception Alert') {
                    this.alarmGrid.contextMenu.setDisableItem('exception_summary', true);
                }

                if (serverType === 30 && record.data.server_name === '' && alertResourceID && alertResourceID !== -1) {
                    this.alarmGrid.contextMenu.setDisableItem('abnormal_transaction' , true);
                } else {
                    this.alarmGrid.contextMenu.setDisableItem('abnormal_transaction' , false);
                }

                // Tid 가 있는 경우 '트랜잭션 상세' 및 '트랜잭션 조회' 메뉴를 활성화 (요청사항)
                if (alertResourceID && alertResourceID !== -1) {
                    if (serverType === 30) {
                        this.alarmGrid.contextMenu.setDisableItem('transaction_trend', true);
                    } else {
                        this.alarmGrid.contextMenu.setDisableItem('transaction_trend', true);
                        this.alarmGrid.contextMenu.setDisableItem('transaction_detail', true);
                    }
                } else {
                    this.alarmGrid.contextMenu.setDisableItem('alert_summary', true);
                }
            } else {
                this.alarmGrid.contextMenu.setDisableItem('transaction_trend', true);
            }
        }, this);
    },


    /**
     * 알람 내역 삭제 주기를 설정하는 옵션창 구성.
     */
    createOptionWindow: function() {
        var webEnvData;

        var baseCon, topCon, bottomCon, okBtn, cancelBtn,
            gridTimeoutCon, gridUnitLabel;

        this.alarmOptionWindow = Ext.create('Exem.XMWindow', {
            title : common.Util.TR('Alarm Option'),
            width : 280,
            height: 200,
            resizable   : false,
            maximizable : false,
            closable    : false,
            isChangeMode: false,
            closeAction : 'hide',
            modal   : true,
            cls     : 'xm-dock-window-base'
        });

        if (Comm.web_env_info.alarm_option) {
            webEnvData = JSON.parse(Comm.web_env_info.alarm_option);
        }

        this.gridBufferSize    = webEnvData ? webEnvData.gridBufferSize : 100;
        this.checkTimeInterval = webEnvData ? webEnvData.timeout : 1;

        baseCon = Ext.create('Exem.Container', {
            layout: 'vbox',
            flex: 1
        });

        this.alarmOptionWindow.add(baseCon);

        topCon = Ext.create('Exem.Container', {
            layout: {
                type: 'vbox',
                pack: 'center'
            },
            height: 100,
            margin : '6 0 0 10'
        });

        bottomCon = Ext.create('Exem.Container', {
            width: '100%',
            height: 30,
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            }
        });

        baseCon.add(topCon, bottomCon);

        this.alarmOptionWindow.gridBufSize = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Max Alarm Log Count'),
            labelAlign: 'right',
            allowBlank: false,
            width     : 190,
            labelWidth: 140,
            maxValue  : 300,
            minValue  : 10,
            value     : this.gridBufferSize,
            enforceMaxLength: true,
            enableKeyEvents : true,
            hideTrigger     : false,
            cls : 'rtm-list-condition'
        });

        gridTimeoutCon = Ext.create('Exem.Container', {
            layout: 'hbox',
            height: 40
        });

        this.alarmOptionWindow.gridTimeout = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Remove Alarm Log After'),
            labelAlign: 'right',
            allowBlank: false,
            width: 190,
            labelWidth: 140,
            maxValue: 60,
            minValue: 1,
            value: this.checkTimeInterval,
            enforceMaxLength: true,
            enableKeyEvents: true,
            hideTrigger: false,
            cls : 'rtm-list-condition'
        });

        gridUnitLabel = Ext.create('Ext.form.Label', {
            text: '(' + common.Util.TR('Minute') + ')',
            width: 30,
            margin: '4 0 0 4',
            cls: 'rtm-default-label'
        });

        gridTimeoutCon.add(this.alarmOptionWindow.gridTimeout, gridUnitLabel);
        topCon.add(this.alarmOptionWindow.gridBufSize, gridTimeoutCon);

        okBtn = Ext.create('Exem.Button', {
            text: common.Util.TR('OK'),
            height: 25,
            cls: 'rtm-btn',
            listeners: {
                scope: this,
                click: function() {
                    var dataObj = {
                        gridBufferSize: this.alarmOptionWindow.gridBufSize.getValue(),
                        timeout: this.alarmOptionWindow.gridTimeout.getValue()
                    };
                    common.WebEnv.Save('alarm_option', JSON.stringify(dataObj));

                    this.gridBufSize = dataObj.gridBufferSize;
                    this.expiredInterval = dataObj.timeout * 60 * 1000;

                    this.alarmOptionWindow.close();
                }
            }
        });

        cancelBtn = Ext.create('Exem.Button', {
            text: common.Util.TR('Cancel'),
            height: 25,
            cls: 'rtm-btn',
            listeners: {
                scope: this,
                click: function() {
                    this.alarmOptionWindow.close();
                }
            }
        });

        bottomCon.add(okBtn, {xtype: 'tbspacer', width: 5}, cancelBtn);
    },


    createAlarmInfoArea: function() {
        var floatingPnl = Ext.create('Exem.Container', {
            width    : 380,
            height   : 200,
            floating : true,
            shadow   : false,
            cls      : 'transParentPanel',
            layout   : {
                type : 'hbox',
                align: 'middle',
                pack : 'center'
            },
            listeners: {
                scope : this,
                render: function(_this) {
                    // 이벤트 리스너
                    _this.el.on('mouseover', function() {
                        if (this.closeTimer) {
                            clearTimeout(this.closeTimer);
                        }
                    }.bind(this));

                    _this.el.on('mouseleave', function() {
                        this.closeTimer = setTimeout(function() {
                            this.hideAlertDetail();
                        }.bind(this), 100);
                    }.bind(this));

                    _this.el.on('click', function() {
                        this.hideAlertDetail();
                    }.bind(this));
                }
            }
        });

        // 실제 alerm 리스트가 그려지는 부분,
        this.detailBodyArea = Ext.create('Ext.container.Container', {
            width     : 360,
            height    : 200,
            cls       : 'alertToolTip',
            updateFlag: false,
            html      : ''
        });

        floatingPnl.add(this.detailBodyArea);
        return floatingPnl;
    },


    /**
     * 알람 아이콘 툴팁 표시
     *
     * @param {string} serverName - server name
     * @param {object} position
     * @param {object} mouseEvent - event object
     */
    showAlertDetail: function(serverName, position, mouseEvent) {
        var valuehtml = '';
        var ix, len;
        var clsLevel;
        var name;
        var clsType;
        var updateStr;
        var level;
        var _value;
        var alarmTypeInfo;
        var header;
        var _x, _y;

        var data  = this.alarmLevelList[serverName];
        var alarmGroup = Object.keys(data);

        // 포지션이 왼쪽인지 오른쪽인지 계산해주기
        var marginCheck = window.innerWidth - mouseEvent.x;

        if (marginCheck < 400) {
            clsType = 'directRight';
        } else {
            clsType = 'directLeft';
        }

        // 항목별 알람 리스트
        for (ix = 0, len = alarmGroup.length; ix < len; ix++) {
            alarmTypeInfo = data[alarmGroup[ix]];

            if (alarmTypeInfo.length === 0) {
                continue;
            }

            name      = alarmTypeInfo[4];
            _value    = alarmTypeInfo[5];
            level     = alarmTypeInfo[7];
            clsLevel  = level.toLocaleLowerCase();

            valuehtml +=
                '<div class="alertinfo">' +
                '<span class="' + clsLevel + '" style="float: left; display: inline-block;  width: 75px; text-align:center;">' + this.convertTimeToString(alarmTypeInfo[0]) + '</span>' +
                '<span class="' + clsLevel + '" style=" text-overflow: ellipsis;  overflow:hidden; white-space : nowrap; display: inline-block;  width: 130px;">' + name + '</span>' +
                '<span class="' + clsLevel + '" style=" display: inline-block;  width: 60px;  text-align: right;    overflow: hidden; text-overflow: ellipsis;">' + _value + '</span>' +
                '<span class="' + clsLevel + '" style=" float: right; display: inline-block;  width:  52px;  margin: 0 0 0 10px; text-align: right;">' + level + '</span>' +
                '</div>';
        }

        // 업데이트 정보 없을경우 처리하지 않음.
        if (valuehtml.length === 0) {
            return;
        }

        header =
            '<span class="rtm-base ' + clsType + '"; style ="display: block;">' +
            '<div style="padding: 10px; height: 30px;">' +
            '  <span style= "float:left ;  font-size:17px; ">' + serverName + '</span>' +
            '</div>' +
            '<div class="frame-AlertLogHistoryFrame-AlertDetail";></div>' +
            '<div style ="display: block; height: 150px;  margin: 0px 5px 0px 0px;overflow-x:auto;"  >';

        updateStr = header + valuehtml;
        updateStr += '</div></span>';

        if (this.detailBodyArea.updateFlag === false) {
            this.detailBodyArea.update(updateStr);
            this.detailBodyArea.updateFlag = true;

            _x = position.x;
            _y = position.y;
            if (marginCheck > 400) {
                this.tootipArea.showAt(_x + position.width - 28, _y - this.tootipArea.height + 28);
            } else {
                this.tootipArea.showAt(_x - this.tootipArea.width - 18, _y - this.tootipArea.height + 28);
            }
        }

        position      = null;
        mouseEvent    = null;
    },


    convertTimeToString: function(atime) {
        var date = new Date(atime);
        var h    = date.getHours();
        var m    = date.getMinutes();
        var s    = date.getSeconds();

        atime = null;
        return '' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    },


    /**
     * 알람 아이콘 툴팁 숨김
     */
    hideAlertDetail: function() {
        this.detailBodyArea.updateFlag = false;
        this.tootipArea.hide();
    },


    /**
     * 처리 대상 알람인지 체크, 대상이 아닌 경우 건너뛴다.
     *
     * @param {number} serverType
     * @param {string} serverName
     * @return {boolean} true: 비처리 대상 알람, false: 처리 대상 알람
     */
    isSkipAlarm: function(serverType, serverName) {
        var isSkipData = true;

        if ((serverType === 9 && realtime.TPHostList.indexOf(serverName) !== -1) ||
            (serverType < 3 && this.alarmLevelList[serverName]) ||
            serverType === 30) {

            isSkipData = false;
        }
        return isSkipData;
    },


    /**
     * 알람 실시간 패킷 데이터 처리
     *
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3:WebServer, 9: Host, 15: apim, 20: BIZ)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type (WAS STAT, OS STAT, JVM STAT, Exception Alert)
     * 9: descr
     * 10: alert_resource_ID
     * 11: tier_id
     * 12: business_id
     * 13: warning
     * 14: critical
     * 15: customData
     *
     * @param {object} data - alarm data
     */
    onAlarm: function(data) {
        var time, serverType, serverID, serverName, alermResName, alarmValue, alarmLevel, levelType, alarmType, descr, resID, alarmKey;
        var tierID, businessID, customData;

        var bizName, gridDataKey, dataIndex;

        var predictionTime, diffMinTime, displayPredictionTime, moduleType, isTxnModule;

        if (!data) {
            return;
        }

        time         = data[0];
        serverType   = data[1];
        serverID     = data[2];
        serverName   = data[3];
        alermResName = data[4];
        alarmValue   = data[5];
        alarmLevel   = data[6];
        levelType    = data[7];
        alarmType    = data[8];
        descr        = data[9];
        resID        = data[10];
        alarmKey     = data[4];

        tierID       = data[11];
        businessID   = data[12];
        customData   = data[15];

        if (this.isSkipAlarm(serverType, serverName)) {
            return;
        }

        bizName = Comm.RTComm.getBusinessNameById(+businessID);

        // 업무 알람인 경우 업무ID를 가지고 업무명을 찾아 Description 에 설정함.
        if (serverType === 20 && bizName) {
            descr = common.Util.TR('Business') + ' : ' + Comm.RTComm.getBusinessNameById(+businessID);

        } else if (resID && resID !== -1 && bizName) {
            descr += ', ' + common.Util.TR('Business') + ' : ' + Comm.RTComm.getBusinessNameById(+businessID);
        }

        // AI 알람 커스텀
        if (serverType === 30) {
            moduleType = serverName;
            predictionTime = +customData;
            diffMinTime = (predictionTime - time) / 60000;

            if (diffMinTime === 0) {
                displayPredictionTime = common.Util.TR('Current Value');
            } else {
                displayPredictionTime = Ext.String.format(common.Util.TR('Estimated value after {0} minute'), diffMinTime);
            }

            if (moduleType === 1 || moduleType === 4) {
                if (moduleType === 1) {
                    descr = common.Util.TR('Load Prediction WAS') + ' (' + displayPredictionTime + ')';
                }
                if (moduleType === 4) {
                    descr = common.Util.TR('Abnormal Detection WAS');
                }
                serverName = Comm.RTComm.getWASNamebyId(serverID) || '';
            }

            if (moduleType === 2 || moduleType === 5) {
                if (moduleType === 2) {
                    descr = common.Util.TR('Load Prediction DB') + ' (' + displayPredictionTime + ')';
                }
                if (moduleType === 5) {
                    descr = common.Util.TR('Abnormal Detection DB');
                }
                serverName = Comm.RTComm.getDBNameById(serverID) || '';
            }

            if (moduleType === 3 || moduleType === 6) {
                if (moduleType === 3) {
                    descr = common.Util.TR('Load Prediction Transaction') + ' (' + displayPredictionTime + ')';
                }
                if (moduleType === 6) {
                    descr = common.Util.TR('Abnormal Detection Transaction');
                }
                serverName = '';
                isTxnModule = true;
            }

            if (moduleType === 7) {
                descr = common.Util.TR('Load Prediction Business') + ' (' + displayPredictionTime + ')';
                serverName = Comm.RTComm.getBusinessNameById(serverID) || '';
            }

            if (!serverName && !isTxnModule) {
                return;
            }
        }


        // 그리드에 data 넣기
        if (this.alarmGrid._localStore.rootItems.length > 100) {
            this.alarmGrid._localStore.rootItems.pop();
        }

        switch (alermResName) {
            case realtime.alarms.CONNECTED:
            case realtime.alarms.SERVER_BOOT :
            case realtime.alarms.API_BOOT :
            case realtime.alarms.TP_BOOT :
            case realtime.alarms.PROCESS_BOOT :
                alarmLevel = 0;
                levelType = '';
                break;

            case realtime.alarms.DISCONNECTED :
            case realtime.alarms.SERVER_DOWN :
            case realtime.alarms.API_DOWN :
            case realtime.alarms.TP_DOWN :
                alarmLevel = 2;
                levelType = 'Critical';
                alarmValue = '';
                break;

            default:
                break;
        }

        // 라이선스 알람을 체크할 때 알람 값이 0 이상인 경우 정상으로 체크한다.
        // description 항목 값이 'UNLIMITED' 인 경우 정상으로 체크해도 되지만 빈 값으로 오는 경우가 있어서
        // 화면에서 필터 처리를 함.
        if (alermResName.toLocaleLowerCase() === 'license' && alarmLevel > 0 && alarmValue >= 0) {
            alarmLevel = 0;
        }

        if (alermResName === realtime.alarms.ELAPSED_TIME) {
            alarmKey = alermResName + '-' + resID;
            alarmValue = +alarmValue / 1000;

        } else if (alermResName === realtime.alarms.TP_ERROR) {
            alarmKey = alermResName + '-' + resID;

        } else if (alermResName === realtime.alarms.CONNECTED) {
            alarmKey = realtime.alarms.DISCONNECTED;

        } else if (alermResName === realtime.alarms.SERVER_BOOT) {
            alarmKey = realtime.alarms.SERVER_DOWN;

        } else if (alermResName === realtime.alarms.API_BOOT) {
            alarmKey = realtime.alarms.API_DOWN;

        } else if (alermResName === realtime.alarms.TP_BOOT) {
            alarmKey = realtime.alarms.TP_DOWN;

        } else if (alermResName === realtime.alarms.PROCESS_BOOT) {
            alarmKey = realtime.alarms.PROCESS_DOWN;
        }

        if (serverType === 30) {
            alarmKey = alermResName + '-' + customData;
        }

        gridDataKey = serverType + '_' + serverID + '_' + alarmKey;
        dataIndex = this.alarmGridLevelList.indexOf(gridDataKey);

        if (+alarmLevel === 0) {
            if (this.alarmLevelList[serverName]) {
                if (alermResName === realtime.alarms.CONNECTED) {
                    delete this.alarmLevelList[serverName][realtime.alarms.DISCONNECTED];
                    delete this.alarmLevelList[serverName].XM_JVM_OUTOFMEMORYERROR;

                } else if (alermResName === realtime.alarms.SERVER_BOOT) {
                    delete this.alarmLevelList[serverName][realtime.alarms.SERVER_DOWN];

                } else if (alermResName === realtime.alarms.API_BOOT) {
                    delete this.alarmLevelList[serverName][realtime.alarms.API_DOWN];

                } else if (alermResName === realtime.alarms.TP_BOOT) {
                    delete this.alarmLevelList[serverName][realtime.alarms.TP_DOWN];

                } else if (alermResName === realtime.alarms.PROCESS_BOOT) {
                    delete this.alarmLevelList[serverName][realtime.alarms.PROCESS_DOWN];

                } else if (alermResName === realtime.alarms.ELAPSED_TIME ||
                    alermResName === realtime.alarms.TP_ERROR) {
                    delete this.alarmLevelList[serverName][alarmKey];

                } else {
                    delete this.alarmLevelList[serverName][alermResName];
                }

                if (dataIndex !== -1) {
                    this.alarmGridList[dataIndex][13] = true;
                }

                // Connected 알람이 들어온 경우 XM_JVM_OUTOFMEMORYERROR 알람도 해소가 되게 처리
                // 알람 발생 내역 스펙 상 바로 없어지지 않고 지정된 체크 시간에 없어진다.
                if (alermResName === realtime.alarms.CONNECTED) {
                    gridDataKey = serverType + '_' + serverID + '_' + 'XM_JVM_OUTOFMEMORYERROR';
                    dataIndex = this.alarmGridLevelList.indexOf(gridDataKey);

                    if (dataIndex !== -1) {
                        this.alarmGridList[dataIndex][13] = true;
                    }
                }
            }

        } else {
            if (this.alarmLevelList[serverName]) {
                if (this.alarmLevelList[serverName][alarmKey]) {
                    this.alarmLevelList[serverName][alarmKey][5]  = alarmValue;
                    this.alarmLevelList[serverName][alarmKey][6]  = alarmLevel;
                    this.alarmLevelList[serverName][alarmKey][7]  = levelType;
                    this.alarmLevelList[serverName][alarmKey][9]  = descr;
                    this.alarmLevelList[serverName][alarmKey][10] = resID;
                    this.alarmLevelList[serverName][alarmKey][12] = +new Date();
                    this.alarmLevelList[serverName][alarmKey][13] = false;
                } else {
                    this.alarmLevelList[serverName][alarmKey] = [time, serverType, serverID, serverName, alermResName, alarmValue, alarmLevel, levelType, alarmType, descr, resID, tierID, +new Date(), false, moduleType];
                }

            } else if (serverType > 3) {
                this.alarmLevelList[serverName] = {};
                this.alarmLevelList[serverName][alarmKey] = [time, serverType, serverID, serverName, alermResName, alarmValue, alarmLevel, levelType, alarmType, descr, resID, tierID, +new Date(), false, moduleType];
            }

            if (dataIndex === -1) {
                this.alarmGridLevelList[this.alarmGridLevelList.length] = gridDataKey;
                try {
                    this.alarmGridList[this.alarmGridList.length] = this.alarmLevelList[serverName][alarmKey];
                } catch (e) {
                    console.debug(serverName, alarmKey, this.alarmLevelList);
                }
            } else {
                this.alarmGridList[dataIndex] = this.alarmLevelList[serverName][alarmKey];
            }

            if (this.alarmGridList.length > this.gridBufSize) {
                this.alarmGridList.splice(0, this.alarmGridList.length - this.gridBufSize);
                this.alarmGridLevelList.splice(0, this.alarmGridLevelList.length - this.gridBufSize);
            }
        }

        data = null;
    },


    /**
     * 알람 발생 내역 목록 새로고침
     */
    drawAlarm: function() {
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
        }

        if (this.mode === this.DISPLAYTYPE.GRID) {
            this.drawAlarmGrid();
        }

        this.refreshTimerId = setTimeout(this.drawAlarm.bind(this), 3000);
    },


    /**
     * 알람 발생 내역 목록 업데이트
     */
    drawAlarmGrid: function() {
        var ix, ixLen;
        var data;
        var hostName, groupName;
        var time, serverType, serverID, serverName, alermResName, alarmValue, alarmLevel,
            levelType, alarmType, descr, resID, alertDate, alertTime, tierId, moduleType;

        this.alarmGrid.clearRows();
        this.tidList = [];

        for (ix = 0, ixLen = this.alarmGridList.length; ix < ixLen; ix++) {
            data = this.alarmGridList[ix];

            if (!data) {
                continue;
            }

            time         = data[0];
            serverType   = data[1];
            serverID     = data[2];
            serverName   = data[3];
            alermResName = data[4];
            alarmValue   = data[5];
            alarmLevel   = data[6];
            levelType    = data[7];
            alarmType    = data[8];
            descr        = data[9];
            resID        = data[10];
            tierId       = data[11];
            moduleType   = data[14];

            if (alarmType === 'Exception Alert' && this.tidList.indexOf(resID) === -1) {
                this.tidList[this.tidList.length] = resID;
            }

            if (serverType === 9) {
                hostName = serverName || '';
                serverName = '';
            } else {
                hostName = Comm.RTComm.HostRelWAS(serverID) || '';
            }

            if (serverType !== 20 &&
                realtime.displayDescrAlarmList.Name.indexOf(alermResName) === -1 &&
                realtime.displayDescrAlarmList.Type.indexOf(alarmType) === -1) {
                if (serverType !== 30) {
                    descr = '';
                }
            }

            alertTime = new Date(time);
            alertDate = Ext.Date.format(alertTime, 'y-m-d');

            if (serverType === 20) {
                groupName = Comm.RTComm.getTierNameById(tierId) || '';

            } else {
                groupName = Comm.RTComm.getGroupNameByWasId(serverID) || '';
            }

            if (serverType === 30 && (moduleType === 1 || moduleType === 4)) {
                groupName = Comm.RTComm.getGroupNameByWasId(serverID) || '';
                hostName = Comm.RTComm.HostRelWAS(serverID) || '';
            }

            this.alarmGrid.addRow([
                alertDate,
                alertTime,
                serverType,
                serverID,
                groupName,
                hostName,
                serverName,
                alermResName,
                alarmLevel,
                levelType,
                alarmValue,
                alarmType,
                descr,
                resID,
                moduleType
            ]);
        }

        this.alarmGrid.drawGrid();
    },


    /**
     * Check Critical alarm.
     *
     * @param {object} groupList - alarm data
     *  ex) {
     *       'Elapsed Time' : [...],
     *       'Active Transaction' : [...]
     *      }
     *
     * @return {boolean} - true: critical alarm, false: not critical alarm
     */
    hasCritical: function(groupList) {
        var keys     = Object.keys(groupList);
        var criCount = 0;
        var exist    = false;
        var alarm;
        var ix;

        for (ix = 0; ix < keys.length; ix++) {
            alarm = groupList[keys[ix]];

            if (alarm[7] === 'Critical') {
                criCount++;
            }
        }

        if (criCount !== 0) {
            exist = true;
        }

        groupList = null;

        return exist;
    },


    /**
     * 선택된 서버에서 발생되고 있는 알람 중 제일 높은 알람 레벨을 반환.
     *
     * @param {string} name - 서버명
     */
    getMaxAlarmLevel: function(name) {
        var maxLevel  = 0,
            groupList, keys, alarm,
            ix, ixLen;

        if (!this.alarmLevelList[name]) {
            return;
        }

        groupList = this.alarmLevelList[name];
        keys      = Object.keys(groupList);

        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            alarm = groupList[keys[ix]];

            if (alarm[6] != null && alarm.length > 7) {
                maxLevel = Math.max(alarm[6], maxLevel);
            }

            if (maxLevel === 2) {
                break;
            }
        }

        return maxLevel;
    },


    /**
     * 마지막 알람 상태를 체크.
     */
    lastAlarmCheck: function() {

        // Database
        this.checkAlarmByServerType('DB');

        // WSA
        this.checkAlarmByServerType('WAS');

        // WebServer
        this.checkAlarmByServerType('WebServer');
    },


    /**
     * 서버 타입별로 알람 상태를 체크
     *
     * @param {string} type - Server Type (1: WAS, 2: DB, 3:WebServer)
     */
    checkAlarmByServerType: function(type) {
        var ix, ixLen;
        var serverList, serverKeys, serverName, serverId,
            time, serverType, alertName, value, alertLevel,
            levelType, alertType;

        if (type === 'DB') {
            serverList = Repository.alarmListInfo.DB;

        } else if (type === 'WAS') {
            serverList = Repository.alarmListInfo.WAS;

        } else if (type === 'WebServer') {
            serverList = Repository.alarmListInfo.WebServer;
        }

        if (!serverList) {
            return;
        }

        serverKeys = Object.keys(serverList);

        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            serverId  = +serverKeys[ix];
            serverName = '';

            if (serverList[serverId].length === 0) {
                continue;
            }
            time       = serverList[serverId][0].alarmTime;
            serverType = serverList[serverId][0].serverType;
            alertName  = serverList[serverId][0].name;
            value      = serverList[serverId][0].value;
            alertLevel = serverList[serverId][0].level;
            alertType  = serverList[serverId][0].alertType;
            levelType  = (+alertLevel === 2) ? 'Critical' : 'Warning';

            if (type === 'DB' && Comm.dbInfoObj[serverId]) {
                serverName = Comm.dbInfoObj[serverId].instanceName;

            } else if (type === 'WAS' && Comm.wasInfoObj[serverId]) {
                serverName = Comm.wasInfoObj[serverId].wasName;

            } else if (type === 'WebServer' && Comm.webServersInfo[serverId]) {
                serverName = Comm.webServersInfo[serverId].name;
            }

            if (serverName) {
                this.onAlarm([time, serverType, serverId, serverName, alertName, value, alertLevel, levelType, alertType, '', -1]);
            }
        }
    },


    /**
     * 알람 발생 내역 목록에 Context Menu 추가
     */
    addContextMenu: function() {
        var self = this;

        // Abnormal Transaction Detection
        this.alarmGrid.contextMenu.addItem({
            title : common.Util.TR('Abnormal Transaction Detection'),
            itemId: 'abnormal_transaction',
            fn: function() {
                self.linkRecord = this.up().record;
                self.viewAlertHistory(self.linkRecord, 'abnormal_transaction');
                self.linkRecord = null;
            }
        }, 0);

        // Alert Summary
        this.alarmGrid.contextMenu.addItem({
            title : common.Util.TR('Alert Summary'),
            itemId: 'alert_summary',
            fn: function() {
                self.linkRecord = this.up().record;
                self.viewAlertHistory(self.linkRecord, 'alert_summary', self.monitorType);
                self.linkRecord = null;
            }
        }, 0);

        // Exception Summary
        this.alarmGrid.contextMenu.addItem({
            title : common.Util.TR('Exception Summary'),
            itemId: 'exception_summary',
            fn: function() {
                self.linkRecord = this.up().record;
                self.viewAlertHistory(self.linkRecord, 'exception_summary', self.monitorType);
                self.linkRecord = null;
            }
        }, 0);

        // Transaction Trend
        this.alarmGrid.contextMenu.addItem({
            title : common.Util.TR('Transaction Trend'),
            itemId: 'transaction_trend',
            fn: function() {
                self.linkRecord = this.up().record;
                self.viewAlertHistory(self.linkRecord, 'transaction_trend', self.monitorType);
                self.linkRecord = null;
            }
        }, 0);

        // Transaction Detail
        this.alarmGrid.contextMenu.addItem({
            title : common.Util.TR('Transaction Detail'),
            itemId: 'transaction_detail',
            fn: function() {
                self.linkRecord = this.up().record;

                // 트랜잭션이 종료되었는지 유무를 체크.
                self.checkEndTxn(self.linkRecord.alert_resource_ID, function(endTxn) {
                    self.viewAlertHistory(self.linkRecord, 'transaction_detail', self.monitorType, endTxn);
                    self.linkRecord = null;
                }.bind(self));
            }
        }, 0);
    },


    /**
     * Context Menu에서 선택된 알람정보에 따른 연계 화면 표시.
     *
     * @param {array} data - alarm data
     *    0: time
     *    1: server_type
     *    2: server_id
     *    3: server_name
     *    4: alert_resource_name
     *    5: value
     *    6: alert_level
     *    7: levelType
     *    8: alert_type
     *    9: descr
     *   10: alert_resource_ID
     * @param {string} menuType - context menu id
     * @param {string} monitorType - Monitor View Type
     * @param {boolean} isEndTxn - Is End Transaction
     */
    viewAlertHistory: function(data, menuType, monitorType, isEndTxn) {
        var paView;
        var serverTypeStr;
        var mainTab;

        var serverId    = data.server_id;
        var serverName  = data.server_name;
        var alertName   = data.alert_resource_name;
        var serverType  = data.server_type;
        var alertTime   = +data.time;
        var descripton  = data.descr;
        var resourceId  = data.alert_resource_ID;
        var alertLevel  = data.alert_level;
        var alertType   = data.alert_type;
        var moduleType  = data.moduleType;

        var fromTime  = common.Util.getDate(alertTime - 300000);
        var toTime    = common.Util.getDate(alertTime + 60000);

        var ResponseInspectorCls, loadingMask;

        var startTime, endTime;

        var currentWidth, currentHeight, elapseDistRange, popupOptions;

        var txnDetail, record;

        // 모니터링 타입이 E2E인 경우 서버ID로 모니터링 타입을 찾아서 설정.
        if (monitorType === 'E2E' && alertType !== 'Business Alert') {
            monitorType = Comm.RTComm.getServerTypeById(serverId);
        }

        if (realtime.txnLinkAlarmList.indexOf(alertName) !== -1 || menuType === 'transaction_trend') {

            // 설정된 WAS 알람인 경우 PA의 Transaction Trend 화면으로 이동

            if (monitorType === 'WAS') {
                ResponseInspectorCls = 'view.ResponseInspector';
            } else if (monitorType === 'TP') {
                ResponseInspectorCls = 'view.TPResponseInspector';
            } else if (monitorType === 'WEB') {
                ResponseInspectorCls = 'view.WebResponseInspector';
            } else if (monitorType === 'CD') {
                ResponseInspectorCls = 'view.CDResponseInspector';
            }

            paView = Ext.create(ResponseInspectorCls, {
                title      : common.Util.TR('Transaction Trend'),
                closable   : true,
                isAllWasRetrieve: false,
                detailScatterYRange: 'fixed',
                autoRetrieveRange: {
                    timeRange: [
                        fromTime, toTime
                    ],
                    elapseRange: [0],
                    wasName    : serverName,
                    tid        : resourceId
                },
                monitorType : monitorType
            });

            mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTab.add(paView);
            mainTab.setActiveTab(mainTab.items.length - 1);
            loadingMask = Ext.create('Exem.LoadingMask', {
                target: paView,
                type  : 'large-whirlpool'
            });
            loadingMask.showMask();

            setTimeout(function() {
                loadingMask.hide();
                paView.loadingMask.hide();
                paView.init();

                loadingMask = null;
                paView  = null;
                mainTab = null;
            });

        } else {
            switch (serverType) {
                case 1:
                    serverTypeStr = 'WAS';
                    break;
                case 2:
                    serverTypeStr = 'DB';
                    break;
                case 3:
                    serverTypeStr = 'WebServer';
                    break;
                case 9:
                    serverTypeStr = 'Host';
                    break;
                case 20:
                    serverTypeStr = 'Business';
                    break;
                case 30:
                    serverTypeStr = 'AI';
                    break;
                default :
                    serverTypeStr = '';
                    break;
            }

            // PA Exception Alert
            if (alertType === 'Exception Alert' && menuType === 'exception_summary') {
                fromTime  = common.Util.getDate(alertTime - 1000 * 60);
                toTime    = common.Util.getDate(alertTime + 1000 * 10);
                paView = Ext.create('view.ExceptionHistory', {
                    title      : common.Util.TR('Exception Summary'),
                    closable   : true,
                    autoRetrieveRange: {
                        wasId      : serverId,
                        wasName    : Comm.RTComm.getWASNamebyId(serverId),
                        alertName  : alertName,
                        fromTime   : fromTime,
                        toTime     : toTime
                    }
                });

                setTimeout(function() {
                    mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                    mainTab.add(paView);
                    mainTab.setActiveTab(mainTab.items.length - 1);
                    paView.init();
                    paView.executeSQL();
                    paView  = null;
                    mainTab = null;
                },500);

                // 실시간 액티브 트랜잭션 상세화면 또는  트랜잭션 상세 정보를 팝업 화면으로 표시
            } else if (menuType === 'transaction_detail' && resourceId && resourceId !== -1) {
                startTime  = common.Util.getDate(alertTime - 300000);
                endTime    = common.Util.getDate(alertTime + 300000);

                // 트랜잭션이 종료된 경우 알람이 발생된 구간에 해당하는 트랜잭션 상세 정보를 팝업으로 표시
                if (isEndTxn) {
                    currentWidth  = 1500;
                    currentHeight = 1000;

                    // 트랜잭션 상세 정보를 조회하는데 필요한 값 설정
                    elapseDistRange = {
                        fromTime   : startTime,
                        toTime     : endTime,
                        minElapse  : 0,
                        maxElapse  : 100000000,
                        clientIp   : '',
                        txnName    : '',
                        exception  : '',
                        loginName  : '',
                        tid        : resourceId,
                        monitorType: monitorType,
                        wasId      : serverId
                    };

                    localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(elapseDistRange));

                    console.debug('%c [Alert List] Transaction Popup Parameters: ', 'color:#3191C8;',
                        'FromTime: '  + elapseDistRange.fromTime,
                        'ToTime: '    + elapseDistRange.toTime,
                        'Server ID: ' + elapseDistRange.wasId,
                        'Tid: '       + elapseDistRange.tid
                    );

                    popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;

                    // 모니터링 화면에서 서비스를 변경 시 팝업 창을 닫기 위해서 realtime.txnPopupMonitorWindow 를 설정함.
                    window.selectedPopupMonitorType = monitorType;
                    realtime.txnPopupMonitorWindow = window.open('../txnDetail/txnDetail.html', 'hide_referrer_1', popupOptions);

                } else {
                    // 트랜잭션이 종료되지 않은 경우 액티브 트랜잭션 상세화면을 표시
                    txnDetail = Ext.create('rtm.src.rtmActiveTxnDetail');
                    txnDetail.stack_dump   = false;
                    txnDetail.tid          = resourceId;
                    txnDetail.wasid        = serverId;
                    txnDetail.starttime    = startTime;
                    txnDetail.current_time = alertTime;
                    txnDetail.monitorType  = monitorType;

                    record = {
                        tid       : resourceId,
                        wasid     : serverId,
                        txnname   : descripton,
                        starttime : startTime,
                        time      : endTime
                    };

                    txnDetail.initWindow();

                    setTimeout(function() {
                        txnDetail.init(record);
                        txnDetail = null;
                    }, 10);
                }

            } else if (menuType === 'abnormal_transaction' && resourceId && resourceId !== -1) {
                paView = Ext.create('view.AbnormalTransactionDetection', {
                    title     : common.Util.TR('Abnormal Transaction Detection'),
                    closable  : true,
                    fromTime  : fromTime,
                    toTime    : toTime,
                    tid       : resourceId,
                    txnName   : alertName,
                    isCallRTM : true
                });


                mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.add(paView);
                mainTab.setActiveTab(mainTab.items.length - 1);
                paView.init();
                paView.executeSQL();
            } else {
                paView = Ext.create('view.AlertHistory', {
                    title      : common.Util.TR('Alert Summary'),
                    closable   : true,
                    was_id     : serverId,
                    server_type: serverTypeStr,
                    alert_level: alertLevel,
                    alert_name : alertName,
                    from_time  : fromTime,
                    to_time    : toTime,
                    isCallRTM  : true,
                    moduleType : moduleType,
                    monitorType: monitorType
                });

                if (this.monitorType === 'TP' || this.monitorType === 'WEB' || this.monitorType === 'CD') {
                    paView.title = this.monitorType + ' ' + paView.title;
                }

                mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.add(paView);
                mainTab.setActiveTab(mainTab.items.length - 1);
                paView.init();
                setTimeout(function() {
                    paView.executeSQL();
                    paView  = null;
                    mainTab = null;
                }, 500);
            }
        }
    },


    /**
     * 그래프 화면에 표시되는 데이터에서 삭제 대상 알람 체크.
     * RTMDataManager.js 에서 호출
     */
    clearAlarm: function() {
        var ix, ixLen, jx, jxLen;
        var alarmKeys, alarmName;
        var alarmList;
        var serverName;

        var serverKeys = Object.keys(this.alarmLevelList);

        this.diffSec = 0;

        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            serverName = serverKeys[ix];
            alarmList = this.alarmLevelList[serverName];
            alarmKeys = Object.keys(alarmList);

            for (jx = 0, jxLen = alarmKeys.length; jx < jxLen; jx++) {
                alarmName = alarmKeys[jx];

                this.diffSec = 0;

                if (!Ext.Array.contains(realtime.notAutoClearAlarms, alarmName)) {
                    this.diffSec = Ext.Date.diff(alarmList[alarmName][12], new Date(), Ext.Date.SECOND);
                }

                if (this.diffSec > 3) {
                    delete this.alarmLevelList[serverName][alarmName];
                }
            }
        }
    },


    /**
     * 알람 발생 내역 목록에서 삭제 대상 알람 체크
     */
    checkExpiredAlarm: function() {
        var diffSec;
        var logTime, alarmName, isClear;
        var alarmList;
        var ix;

        if (this.checkExpiredTimer) {
            clearTimeout(this.checkExpiredTimer);
        }

        for (ix = 0; ix < this.alarmGridList.length;) {
            alarmList = this.alarmGridList[ix];

            if (!alarmList) {
                ix++;
                continue;
            }

            alarmName = alarmList[4];
            logTime   = alarmList[12];
            isClear   = alarmList[13];

            if (!Ext.Array.contains(realtime.notAutoClearAlarms, alarmName) || isClear) {
                diffSec = Ext.Date.diff(new Date(logTime), new Date(), Ext.Date.SECOND);

                if (diffSec > this.expiredInterval / 1000) {
                    this.alarmGridList.splice(ix, 1);
                    this.alarmGridLevelList.splice(ix, 1);
                    ix--;
                }
            }
            ix++;
        }

        this.checkExpiredTimer = setTimeout(this.checkExpiredAlarm.bind(this), 1000 * 30);
    },


    /**
     * 종료된 트랜잭션인지 체크.
     *
     * @param {string | number} tid
     * @param callback
     */
    checkEndTxn: function(tid, callback) {
        var endTxn = false;

        if (!tid) {
            console.debug('%c [Alert List] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'TID, Parameter is undefined.');
            return;
        }

        WS.SQLExec({
            sql_file: 'IMXRT_Check_EndTxn.sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: tid
            }]
        }, function(aheader, adata) {
            if (this.isComponentClosed === true) {
                return;

            } else if (aheader && aheader.success === false && !adata) {
                console.debug('%c [Alert List] [ERROR] Failed to retrieve the End Txn Data.', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                return;
            }

            if (adata.rows && adata.rows.length > 0) {
                endTxn = true;
            }

            callback(endTxn);

        }, this);
    },


    frameRefresh: function() {
        if (! this.refreshTimerId) {
            setTimeout(this.drawAlarm.bind(this), 30);
        }
        if (this.alarmIcon != null && this.mode === this.DISPLAYTYPE.CHART) {
            this.alarmIcon.startAnimationFrame();
        }
    },


    frameStopDraw: function() {
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
            this.refreshTimerId = null;
        }
        if (this.alarmIcon != null) {
            this.alarmIcon.stopAnimationFrame();
        }
    }

});
