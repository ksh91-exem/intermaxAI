Ext.define ('rtm.src.rtmEtoEAlertInfo', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Alarm Info'),
    layout: 'fit',
    width : '100%',
    height: 50,
    minHeight: 50,
    maxHeight: 50,

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
        }
    },


    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.alarmList  = {};
        this.alarmIdArr = [];
    },

    init: function() {

        this.initProperty();

        this.topAlarmFrame = Ext.create('Exem.HListBox', {
            padding: '0px 6px 0px 6px',
            height : 50,
            maxHeight: 50,
            minHeight: 50,
            border : 1,
            useScrollBtn: false,
            listeners: {
                scope: this,
                resize: function() {
                    if (this.isAddScrollBtn) {
                        this.displayScrollButton();
                    }
                }
            }
        });

        this.topAlarmFrame.slideContainer.padding = '3 15 0 15';

        this.add(this.topAlarmFrame);

        this.topAlarmFrame.addCls('rtm-alertinfo-base');

        this.addScrollButton();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
    },


    /**
     * 알람 정보가 WAS, DB, Host 알람에 해당하는지 체크한다.
     *
     * @param {number} serverType - 서버타입
     * @param {number} serverId - 서버 ID
     */
    isDisplayAlarm: function(serverType, serverId) {
        var isDisplay = true;

        if (this.monitorType !== 'WAS') {
            isDisplay = false;
        }

        if (serverType == 1 && !Comm.wasInfoObj[serverId]) {
            isDisplay = false;
        }

        if (serverType == 15 && !Comm.wasInfoObj[serverId]) {
            isDisplay = false;
        }

        return isDisplay;
    },


    /**
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3:WebServer: 9: Host, 15: apim)
     *                   알람 서버 타입 중 apim 타입은 c api 모듈명임.
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type (WAS STAT, OS STAT, JVM STAT, Exception Alert)
     * 9: descr
     * 10: alert_resource_ID
     *
     * @param {object} adata
     */
    onAlarm : function(data) {
        if (!data) {
            return;
        }

        // 화면에 표시되는 알람인지 체크한다.
        if (this.isDisplayAlarm && !this.isDisplayAlarm(data[1], data[2])) {
            return;
        }

        if (!this.isBindMouseEvent) {
            this.bindMouseEvent();
        }

        var self = this;

        var alertTime   = data[0];
        var serverType  = data[1];
        var objId       = data[2];
        var objName     = data[3];
        var alertName   = data[4];
        var alertValue  = data[5];
        var alertLevel  = data[6];
        var alertType   = data[8];
        var alertDescr  = data[9];
        var resourceId  = data[10];
        var cmpId       = null;
        var delCmpId    = null;
        var isBootAlarm = false;

        if (alertName.toLocaleLowerCase() === 'license' && alertLevel > 0 &&
            alertDescr && alertDescr.toLocaleLowerCase() === 'unlimited') {
            alertLevel = 0;
        }

        // 알람 발생 내역과 알람 레벨 표시에 차이가 있어 값을 재설정.
        // Boot, Connected 알람은 노말 레벨 값 0 으로 설정하고 Down, Disconnected 알람은 크리티컬 레벨 값 2로 재설정.
        switch(alertName) {
            case realtime.alarms.CONNECTED:
            case realtime.alarms.SERVER_BOOT :
            case realtime.alarms.API_BOOT :
            case realtime.alarms.TP_BOOT :
            case realtime.alarms.PROCESS_BOOT :
                alertLevel = 0;
                break;

            case realtime.alarms.DISCONNECTED :
            case realtime.alarms.SERVER_DOWN :
            case realtime.alarms.API_DOWN :
            case realtime.alarms.TP_DOWN :
                alertLevel = 2;
                break;

            default:
                break;
        }

        if (Ext.isEmpty(objName)) {
            // WAS 알람
            if (serverType == 1) {
                objName = Comm.RTComm.getWASNamebyId(objId);

                // Web Server 알람
            } else if (serverType == 3) {
                console.debug('WebServer Alarm');

            } else if (serverType === 20) {
                objName = Comm.RTComm.getBusinessNameById(objId);
            }
        }

        // DB 알람
        if (serverType == 2) {
            if (Comm.dbInfoObj[objId]) {
                objName = Comm.dbInfoObj[objId].instanceName;
            } else {
                return;
            }

            // WebServer 알람
        } else if (serverType == 3 && !Comm.webServersInfo[objId]) {
            return;

            // C Daemon 알람
        } else if (serverType == 15 && !Comm.cdInfoObj[objId]) {
            return;
        }

        if (Ext.isEmpty(objName)) {
            return;
        }

        if (alertName === 'Elapsed Time') {
            cmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-' + resourceId + '-' + alertName;
        } else {
            cmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-' + alertName;
        }
        delCmpId = null;

        switch(alertName) {
            case realtime.alarms.CONNECTED :
                isBootAlarm = true;
                delCmpId    = 'rtm-alertinfo-'+serverType+'-'+objId + '-Disconnected';
                this.deleteAlarmObj(delCmpId);
                break;

            case realtime.alarms.SERVER_BOOT :
                isBootAlarm = true;
                delCmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-Server Down';
                this.deleteAlarmObj(delCmpId);
                delCmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-Server Hang';
                this.deleteAlarmObj(delCmpId);
                delCmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-Disconnected';
                this.deleteAlarmObj(delCmpId);
                break;

            case realtime.alarms.TP_BOOT :
                isBootAlarm = true;
                delCmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-TP Down';
                this.deleteAlarmObj(delCmpId);
                break;

            case realtime.alarms.API_BOOT :
                isBootAlarm = true;
                delCmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-API Down';
                this.deleteAlarmObj(delCmpId);
                break;

            case realtime.alarms.DISCONNECTED :
                delCmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-Server Hang';
                this.deleteAlarmObj(delCmpId);
                break;

            case realtime.alarms.SERVER_DOWN :
                delCmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-Server Hang';
                this.deleteAlarmObj(delCmpId);
                delCmpId = 'rtm-alertinfo-'+serverType+'-'+objId + '-Disconnected';
                this.deleteAlarmObj(delCmpId);
                break;

            default:
                break;
        }

        // Server Boot, Connected, TP Boot, API Boot 알람인 경우 진행하지 않는다.
        if (isBootAlarm) {
            return;
        }

        if (+alertLevel === 0) {
            this.deleteAlarmObj(cmpId);
        } else {

            if (this.alarmList[cmpId]) {
                if (alertLevel !== this.alarmList[cmpId].alertLabel) {
                    var alertIconClass = this.alarmList[cmpId].alertIcon.classList;
                    var alertLabelClass = this.alarmList[cmpId].alertLabel.classList;
                    var descrLabelClass = this.alarmList[cmpId].descrLabel.classList;

                    if (alertLevel == 2) {
                        alertIconClass.add('critical');
                        alertLabelClass.add('critical');
                        descrLabelClass.add('critical');
                        alertIconClass.remove('warning');
                        alertLabelClass.remove('warning');
                        descrLabelClass.remove('warning');

                        this.alarmList[cmpId].alertLevel = 2;

                    } else if (alertLevel == 1) {
                        alertIconClass.add('warning');
                        alertLabelClass.add('warning');
                        descrLabelClass.add('warning');
                        alertIconClass.remove('critical');
                        alertLabelClass.remove('critical');
                        descrLabelClass.remove('critical');
                        this.alarmList[cmpId].alertLabel.level = 1;
                    }
                }
            } else {
                var baseEl  = null,
                    sepEl   = null,
                    iconEl  = null,
                    wasEl   = null,
                    alertEl = null,
                    descrEl = null,
                    separatorEl = null,
                    closeIconEl = null;

                if (this.topAlarmFrame.slideContainer.getEl() == null) {
                    return;
                }

                var target = this.topAlarmFrame.slideContainer.getEl().dom;

                // PA화면으로 이동시 검색조건으로 주기 위한 시간
                var fromTime  = common.Util.getDate(alertTime - 300000);
                var toTime    = common.Util.getDate(alertTime + 60000);

                var firstEl = null;

                firstEl = target.getElementsByClassName('alarminfo')[0];

                var isClosableCls = '';

                if (firstEl != null) {
                    if (realtime.fixedAlarmList.indexOf(alertName) != -1 || realtime.nonClickAlarms.indexOf(alertName) != -1) {
                        separatorEl = target.insertBefore(document.createElement('div'), firstEl);
                        separatorEl.setAttribute('class', 'alert-separator');
                        isClosableCls = ' closable ';

                        baseEl = target.insertBefore(document.createElement('div'), separatorEl);
                    } else {
                        separatorEl = target.appendChild(document.createElement('div'));
                        separatorEl.setAttribute('class', 'alert-separator');

                        baseEl = target.appendChild(document.createElement('div'));
                    }

                } else {
                    baseEl = target.appendChild(document.createElement('div'));
                }

                if (realtime.fixedAlarmList.indexOf(alertName) != -1 || realtime.nonClickAlarms.indexOf(alertName) != -1) {
                    isClosableCls = ' closable ';
                }

                baseEl.setAttribute('class', 'alarminfo' + isClosableCls);

                sepEl = baseEl.appendChild(document.createElement('div'));
                sepEl.setAttribute('class', 'sep');

                iconEl = baseEl.appendChild(document.createElement('div'));
                iconEl.setAttribute('class', 'icon');

                wasEl = baseEl.appendChild(document.createElement('div'));
                wasEl.setAttribute('class', 'was');
                wasEl.textContent = objName;

                alertEl = baseEl.appendChild(document.createElement('div'));
                alertEl.setAttribute('class', 'alert');
                alertEl.textContent = alertName;

                descrEl = baseEl.appendChild(document.createElement('div'));
                descrEl.setAttribute('class', 'descr');

                if (realtime.displayDescrAlarmList.Name.indexOf(alertName) !== -1 ||
                    realtime.displayDescrAlarmList.Type.indexOf(alertType) !== -1) {

                    if (!alertDescr) {
                        descrEl.innerHTML = '&nbsp;';
                    } else {
                        descrEl.textContent = alertDescr;
                    }
                } else {
                    descrEl.innerHTML = '&nbsp;';
                }

                if (realtime.nonClickAlarms.indexOf(objName) === -1 && realtime.nonClickAlarms.indexOf(alertName) === -1) {

                    alertEl.onclick = function() {
                        if (resourceId && resourceId !== -1) {
                            self.checkEndTxn(resourceId, function(endTxn){
                                self.viewAlertHistory(
                                    objId, objName, alertName, serverType, resourceId,
                                    fromTime, toTime, alertTime, alertValue, alertLevel,
                                    alertType, alertDescr, self.monitorType, endTxn
                                );
                            })
                        } else {
                            var paView, serverTypeStr, mainTab;

                            switch (serverType){
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
                                case 15:
                                    serverTypeStr = 'APIM';
                                    break;
                                case 20:
                                    serverTypeStr = 'Business';
                                    break;
                                default :
                                    serverTypeStr = '';
                                    break;
                            }

                            paView = Ext.create('view.AlertHistory', {
                                title      : common.Util.TR('Alert Summary'),
                                closable   : true,
                                was_id     : objId,
                                server_type: serverTypeStr,
                                alert_level: alertLevel,
                                alert_name : alertName,
                                from_time  : fromTime,
                                to_time    : toTime,
                                isCallRTM  : true,
                                monitorType: 'E2E'
                            });

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
                }

                if (alertLevel == 2) {
                    iconEl.classList.add('critical');
                    alertEl.classList.add('critical');
                    descrEl.classList.add('critical');
                } else if (alertLevel == 1) {
                    iconEl.classList.add('warning');
                    alertEl.classList.add('warning');
                    descrEl.classList.add('warning');
                }

                closeIconEl = baseEl.appendChild(document.createElement('div'));
                closeIconEl.setAttribute('class', 'close-icon');
                closeIconEl.textContent = 'x';

                if (realtime.fixedAlarmList.indexOf(alertName) !== -1 || realtime.nonClickAlarms.indexOf(alertName) !== -1) {
                    closeIconEl.removeId = cmpId;
                    closeIconEl.classList.add('active');
                    closeIconEl.onclick = function(e) {
                        clearTimeout(this.iconTimeoutId);
                        this.deleteAlarmObj(e.target.removeId);
                    }.bind(this);
                }

                this.alarmList[cmpId] = {
                    alert      : baseEl,
                    lastTime   : +new Date(),
                    separator  : separatorEl,
                    alertIcon  : iconEl,
                    alertLabel : alertEl,
                    descrLabel : descrEl,
                    alertLevel : alertLevel
                };

                this.alarmIdArr[this.alarmIdArr.length] = {
                    id   : cmpId
                };

                this.displayScrollButton();

                closeIconEl     = null;
                separatorEl     = null;
                sepEl           = null;
                alertEl         = null;
                descrEl         = null;
                wasEl           = null;
                iconEl          = null;
                baseEl          = null;
                target          = null;

            }
        }
    },


    /**
     * PA의 알람 정보화면을 표시
     *
     * @param {string | number} objid
     * @param {string} objName
     * @param {string} alert
     * @param {string} serverType
     * @param {string} rid
     * @param {string} fromTime
     * @param {string} toTime
     * @param {string} alertTime
     * @param {string} alertValue
     * @param {string} alertLevel
     * @param {string} alertType
     * @param {string} alertDescr
     */
    viewAlertHistory: function() {
        var objId       = arguments[0];
        var objName     = arguments[1];
        var alert       = arguments[2];
        var serverType  = arguments[3];
        var rid         = arguments[4];
        var fromTime    = arguments[5];
        var toTime      = arguments[6];
        var alertTime   = arguments[7];
        var alertLevel  = arguments[9];
        var alertType   = arguments[10];
        var alertDescr  = arguments[11];
        var monitorType = arguments[12];
        var isEndTxn    = arguments[13];

        var paView;
        var serverTypeStr;

        // 모니터링 타입이 E2E인 경우 서버ID로 모니터링 타입을 찾아서 설정.
        monitorType = Comm.RTComm.getServerTypeById(objId);

        if (!Ext.Array.contains(realtime.txnLinkAlarmList, alert)) {

            switch (serverType){
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
                case 15:
                    serverTypeStr = 'APIM';
                    break;
                case 20:
                    serverTypeStr = 'Business';
                    break;
                default :
                    serverTypeStr = '';
                    break;
            }

            var startTime  = common.Util.getDate(alertTime - 300000);
            var endTime    = common.Util.getDate(alertTime + 300000);

            // 트랜잭션이 종료된 경우 알람이 발생된 구간에 해당하는 트랜잭션 상세 정보를 팝업으로 표시
            if (isEndTxn) {
                var currentWidth  = 1500;
                var currentHeight = 1000;

                // 트랜잭션 상세 정보를 조회하는데 필요한 값 설정
                var elapseDistRange = {
                    fromTime   : startTime,
                    toTime     : endTime,
                    minElapse  : 0,
                    maxElapse  : 100000000,
                    clientIp   : '',
                    txnName    : '',
                    exception  : '',
                    loginName  : '',
                    tid        : rid,
                    monitorType: monitorType,
                    wasId      : objId
                };

                localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(elapseDistRange));

                console.debug('%c [Alert List] Transaction Popup Parameters: ', 'color:#3191C8;',
                    'FromTime: '  + elapseDistRange.fromTime,
                    'ToTime: '    + elapseDistRange.toTime,
                    'Server ID: ' + elapseDistRange.wasId,
                    'Tid: '       + elapseDistRange.tid
                );

                var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;

                // 모니터링 화면에서 서비스를 변경 시 팝업 창을 닫기 위해서 realtime.txnPopupMonitorWindow 를 설정함.
                window.selectedPopupMonitorType = monitorType;
                realtime.txnPopupMonitorWindow = window.open('../txnDetail/txnDetail.html', 'hide_referrer_1', popupOptions);

            } else {
                // 트랜잭션이 종료되지 않은 경우 액티브 트랜잭션 상세화면을 표시
                var txnDetail = Ext.create('rtm.src.rtmActiveTxnDetail');
                txnDetail.stack_dump   = false;
                txnDetail.tid          = rid;
                txnDetail.wasid        = objId;
                txnDetail.starttime    = startTime;
                txnDetail.current_time = alertTime;
                txnDetail.monitorType  = monitorType;

                if (Comm.wasInfoObj[objId]) {
                    txnDetail.monitorType  = Comm.wasInfoObj[objId].type;
                }

                var record = {
                    tid       : rid,
                    wasid     : objId,
                    txnname   : alertDescr,
                    starttime : startTime,
                    time      : endTime
                };

                txnDetail.initWindow();
                setTimeout(function() {
                    txnDetail.init(record);
                    txnDetail = null;
                },10);
            }

        } else {
            // 설정된 WAS 알람인 경우 PA의 Transaction Trend 화면으로 이동
            var ResponseInspectorCls;
            if (monitorType == 'WAS') {
                ResponseInspectorCls = 'view.ResponseInspector';
            } else if (monitorType == 'TP') {
                ResponseInspectorCls = 'view.TPResponseInspector';
            } else if (monitorType == 'WEB') {
                ResponseInspectorCls = 'view.WebResponseInspector';
            } else if (monitorType == 'CD') {
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
                    wasName    : objName
                },
                tid: rid,
                monitorType : monitorType
            });

            var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTab.add(paView);
            mainTab.setActiveTab(mainTab.items.length - 1);
            var loadingMask = Ext.create('Exem.LoadingMask', {
                target: paView,
                type  : 'large-whirlpool'
            });
            loadingMask.showMask();

            setTimeout(function() {
                loadingMask.hide();
                paView.loadingMask.hide() ;
                paView.init();

                loadingMask = null;
                paView  = null ;
                mainTab = null ;
            });
        }

    },


    /**
     * 마우스 스크롤 이벤트 설정
     */
    bindMouseEvent: function() {
        this.scrollConID = this.topAlarmFrame.slideContainer.id;

        if (this.scrollConID) {
            this.isBindMouseEvent = true;
            this.scrollConDom = Ext.get(this.scrollConID).dom;

            this.scrollConDom.addEventListener('mousewheel', function (e) {
                this.scrollConDom.scrollLeft -= e.wheelDelta;
                e.preventDefault();

                if (this.scrollConDom.scrollLeft <= 0) {
                    this.prev.hide();
                } else {
                    this.prev.show();
                }

                if (this.scrollConDom.scrollLeft < this.scrollConDom.scrollWidth - $(this.scrollConDom).width() - 50) {
                    this.next.show();
                } else {
                    this.next.hide();
                }

            }.bind(this), false);
        }
    },


    /**
     * 알람 정보를 삭제
     */
    deleteAlarmObj: function(id) {
        var targetCmp = this.alarmList[id];

        if (targetCmp) {
            if (targetCmp.separator) {
                targetCmp.separator.remove();
            }
            targetCmp.alertIcon.remove();
            targetCmp.alertLabel.remove();
            targetCmp.descrLabel.remove();
            targetCmp.alert.remove();

            targetCmp = null;
            delete this.alarmList[id];

            for (var ix = 0; ix < this.alarmIdArr.length; ix++) {
                if (this.alarmIdArr[ix].id == id)  {
                    Ext.Array.removeAt(this.alarmIdArr, ix);
                    break;
                }
            }

            if (this.alarmIdArr[0] &&
                this.alarmList[this.alarmIdArr[0].id] &&
                this.alarmList[this.alarmIdArr[0].id].separator) {

                this.alarmList[this.alarmIdArr[0].id].separator.remove();
            }

            this.displayScrollButton();
        }
    },


    /**
     * 스크롤 버튼 추가
     */
    addScrollButton: function() {
        this.prev = Ext.create('Ext.Button', {
            cls    : 'leftButton',
            width  : 16,
            height : 35,
            hidden : true,
            border : false,
            padding: 0,
            listeners: {
                scope: this,
                click : function(me){
                    if (this.scrollConDom.scrollLeft >= 0) {
                        if (this.scrollConDom.scrollLeft < 120) {
                            this.scrollConDom.scrollLeft = 0;
                            me.hide();
                        } else {
                            this.scrollConDom.scrollLeft -= 120;
                        }
                    }

                    if (this.scrollConDom.scrollLeft < this.scrollConDom.scrollWidth - $(this.scrollConDom).width()) {
                        this.next.show();
                    } else {
                        this.next.hide();
                    }
                }
            }
        });

        this.next = Ext.create('Ext.Button', {
            cls    : 'rightButton',
            width  : 16,
            height : 35,
            hidden : true,
            border : false,
            padding: 0,
            listeners: {
                scope: this,
                click : function(me){
                    if (this.scrollConDom.scrollLeft >= 0) {
                        if (this.scrollConDom.scrollLeft + 120 > this.scrollConDom.scrollWidth - $(this.scrollConDom).width() - 50) {
                            this.scrollConDom.scrollLeft = this.scrollConDom.scrollWidth - $(this.scrollConDom).width() - 50;
                            me.hide();
                        } else {
                            this.scrollConDom.scrollLeft += 120;
                        }
                    }

                    if (this.scrollConDom.scrollLeft <= 0) {
                        this.prev.hide();
                    } else {
                        this.prev.show();
                    }
                }
            }
        });

        this.topAlarmFrame.insert(0, this.prev);
        this.topAlarmFrame.insert(2, this.next);
        this.isAddScrollBtn = true;
    },


    /**
     * 스크롤 버튼 표시 설정
     */
    displayScrollButton: function() {
        if (this.scrollConDom) {
            if (this.topAlarmFrame.slideContainer.getWidth() < this.scrollConDom.scrollWidth) {
                if (this.scrollConDom.scrollLeft <= 0) {
                    this.prev.hide();
                    this.next.show();
                } else if (this.scrollConDom.scrollLeft == this.scrollConDom.scrollWidth - $(this.scrollConDom).width()) {
                    this.prev.show();
                    this.next.hide();
                } else {
                    this.prev.show();
                    this.next.show();
                }
            } else {
                this.prev.hide();
                this.next.hide();
            }
        }
    },


    /**
     * 서버 상태 체크
     */
    checkServerStatus: function() {
        var status;
        var typeName;
        var serverType;
        var serverId;
        var alarm;
        var delCmpId;
        var isContinue;
        var ix, ixLen;

        for (ix = 0, ixLen = this.alarmIdArr.length; ix < ixLen; ix++) {
            isContinue = false;

            if (this.alarmIdArr[ix]) {
                serverType  = this.alarmIdArr[ix].id.split('-')[2];
                serverId    = this.alarmIdArr[ix].id.split('-')[3];
                alarm       = this.alarmIdArr[ix].id.split('-')[4];

                if (alarm !== 'Disconnected' && alarm !== 'Server Down' && alarm !== 'Server Hang' &&
                    alarm !== 'TP Down' && alarm !== 'API Down') {
                    isContinue = true;
                }

                switch(serverType) {
                    case '1' :
                        typeName = 'WAS';
                        break;
                    case '2' :
                        typeName = 'DB';
                        break;
                    case '3' :
                        typeName = 'WebServer';
                        break;
                    case '15' :
                        typeName = 'CD'; // APIM
                        break;
                    default :
                        typeName = '';
                        break;
                }

                if (isContinue || typeName === '') {
                    continue;
                }

                status = Comm.Status[typeName][serverId];

                switch(status) {
                    case realtime.alarms.TP_DOWN :
                    case realtime.alarms.API_DOWN :
                    case realtime.alarms.SERVER_DOWN :
                    case realtime.alarms.SERVER_HANG :
                    case realtime.alarms.DISCONNECTED :
                        break;

                    default:
                        delCmpId = 'rtm-alertinfo-'+serverType+'-'+serverId + '-Server Down';
                        this.deleteAlarmObj(delCmpId);
                        delCmpId = 'rtm-alertinfo-'+serverType+'-'+serverId + '-Server Hang';
                        this.deleteAlarmObj(delCmpId);
                        delCmpId = 'rtm-alertinfo-'+serverType+'-'+serverId + '-Disconnected';
                        this.deleteAlarmObj(delCmpId);
                        delCmpId = 'rtm-alertinfo-'+serverType+'-'+serverId + '-TP Down';
                        this.deleteAlarmObj(delCmpId);
                        delCmpId = 'rtm-alertinfo-'+serverType+'-'+serverId + '-API Down';
                        this.deleteAlarmObj(delCmpId);
                        break;
                }
            }
        }

        ix     = null;
        ixLen  = null;
        status = null;
        typeName   = null;
        serverType = null;
        serverId   = null;
        alarm      = null;
    },


    /**
     * 삭제 대상 알람 체크
     * RTMDataManager.js 에서 호출
     */
    clearAlarm: function() {
        this.diffSec = 0;
        var alarmId;

        for (var ix = 0; ix < this.alarmIdArr.length; ix++) {
            alarmId = this.alarmIdArr[ix].id;

            // Server Down, Server Hang, Disconnected, OutOfMemory, TP Down, API Down 이외의 알람에 대해서
            // 설정한 시간안에 알람데이터가 오지 않는 경우 화면에서 삭제처리한다.
            if (!Ext.Array.contains(realtime.notAutoClearAlarms, this.alarmList[alarmId].alertLabel.textContent)) {
                this.diffSec = Ext.Date.diff(this.alarmList[alarmId].lastTime , new Date(), Ext.Date.SECOND);
                if (this.diffSec > 3) {
                    this.deleteAlarmObj(alarmId);
                }
            }
        }

        this.checkServerStatus();

        alarmId = null;
    },


    /**
     * 종료된 트랜잭션인지 체크.
     *
     * @param {string | number} tid
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
    }

});

