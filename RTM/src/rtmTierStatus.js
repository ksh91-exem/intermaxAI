Ext.define('rtm.src.rtmTierStatus', {
    extend: 'Exem.DockForm',
    layout : 'fit',
    width : '100%',
    height: '100%',

    showToolMenu : false,    // 프레임 전체에 적용되는 옵션 아이콘 사용 여부
    isDockFrame  : false,

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.tierInfo[this.tierId].serverList;
        this.serverNameArr = [];

        for (var ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            this.serverNameArr.push(Comm.wasInfoObj[this.serverIdArr[ix]].wasName);
        }

        // 구간(Tier)에서 발생한 알람 목록
        this.alarmLevelList = {};

        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.compaveKey = 'rtm_tier_status_' + this.tierIndex;
    },

    init: function() {

        this.initProperty();

        this.tootipArea = this.createAlarmInfoArea();

        // Background
        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: {
                type : 'vbox',
                pack : 'center',
                align: 'middle'
            },
            flex  : 1
        });

        this.pnlCenter = Ext.create('Exem.Panel', {
            bodyCls  : 'group-center-base',
            layout   : 'fit',
            flex     : 1,
            height   : '100%',
            width    : '100%',
            minHeight: 80,
            margin   : '0 0 0 0',
            split    : false,
            border   : false
        });

        var colors;
        var theme = Comm.RTComm.getCurrentTheme();

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

        var serverType;

        if (this.tierType === 'TP') {
            serverType = 'WAS';

        } else if (this.tierType === 'WEB') {
            serverType = 'WebServer';

        } else if (this.tierType === 'APIM') {
            serverType = 'CD';

        } else {
            serverType = this.tierType;
        }

        this.statusCircle = Ext.create('Exem.chart.AlarmCircle', {
            color        : colors,
            devMode      : false,
            margin       : '0 0 0 0',
            circleClick  : null,
            navMenuclick : null,
            serverType   : serverType
        });

        this.statusCircle.setChartInfo(
            this.tierId, this.tierName,
            this.serverIdArr.concat(), this.serverNameArr.concat()
        );

        this.statusCircle.iconMouseOver   = this.showAlertDetail.bind(this);
        this.statusCircle.iconMouseLeave  = this.hideAlertDetail.bind(this);
        this.statusCircle.checkAlarmLevel = this.getMaxAlarmLevel.bind(this);

        this.background.add(this.pnlCenter);

        this.add(this.background);

        this.pnlCenter.add(this.statusCircle);

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);

        // 마지막 들어온 알람을 그려주고 시작
        setTimeout(function() {
            this.lastAlarmCheck();
        }.bind(this), 500);

    },


    /**
     * 알람 상태 정보를 보여주는 툴팁 화면 구성
     *
     * @return {object} 알람 툴팁 영역
     */
    createAlarmInfoArea: function () {
        var floatingPnl = Ext.create('Exem.Container', {
            width    : 480,
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
                render: function (_this) {
                    // 이벤트 리스너
                    _this.el.on('mouseover', function () {
                        if (this.closeTimer) {
                            clearTimeout(this.closeTimer);
                        }
                    }.bind(this));

                    _this.el.on('mouseleave', function () {
                        this.closeTimer = setTimeout(function () {
                            this.hideAlertDetail();
                        }.bind(this), 100);
                    }.bind(this));

                    _this.el.on('click', function () {
                        this.hideAlertDetail();
                    }.bind(this));
                }
            }
        });

        // 실제 알람 리스트가 그려지는 부분
        this.detailBodyArea = Ext.create('Ext.container.Container', {
            width     : 460,
            height    : 200,
            cls       : 'alertToolTip wide',
            updateFlag: false,
            html      : ''
        });

        floatingPnl.add(this.detailBodyArea);

        return floatingPnl;
    },


    /**
     * 알람 정보가 모니터링 대상 알람에 해당하는지 체크한다.
     *
     * @param {number} serverType - 서버타입
     * @param {number} serverId - 서버 ID
     */
    isDisplayAlarm: function(serverType, serverId) {
        var isDisplay = false;

        if (this.tierType === 'WAS' || !this.tierType) {
            isDisplay = (serverType === 1 && this.serverIdArr.indexOf(serverId) !== -1);
        }

        if (this.tierType === 'TP') {
            isDisplay = (serverType === 1 && this.serverIdArr.indexOf(serverId) !== -1);
        }

        if (this.tierType === 'WEB') {
            isDisplay = (serverType === 3 && this.serverIdArr.indexOf(serverId) !== -1);
        }

        if (this.tierType === 'APIM' || this.tierType === 'CD') {
            isDisplay = (serverType === 15 && this.serverIdArr.indexOf(serverId) !== -1);
        }

        return isDisplay;
    },


    /**
     * 알람 실시간 패킷 데이터 처리
     *
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3:WebServer, 9: Host, 15: apim)
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
     * @param {object} data - alarm data
     */
    onAlarm: function (data) {
        if (!data) {
            return;
        }

        var time         = data[0];
        var serverType   = data[1];
        var serverID     = data[2];
        var serverName   = data[3];
        var alermResName = data[4];
        var alarmValue   = data[5];
        var alarmLevel   = data[6];
        var levelType    = data[7];
        var alarmType    = data[8];
        var descr        = data[9];
        var resID        = data[10];

        // 화면에 표시되는 알람인지 체크한다.
        if (this.isDisplayAlarm && !this.isDisplayAlarm(serverType, serverID)) {
            return;
        }

        // 라이선스 알람을 체크할 때 알람 값이 0 이상인 경우 정상으로 체크한다.
        // description 항목 값이 'UNLIMITED' 인 경우 정상으로 체크해도 되지만 빈 값으로 오는 경우가 있어서
        // 화면에서 필터 처리를 함.
        if (alermResName.toLocaleLowerCase() === 'license' && alarmLevel > 0 && alarmValue >= 0) {
            alarmLevel = 0;
        }

        switch(alermResName) {
            case realtime.alarms.CONNECTED:
            case realtime.alarms.SERVER_BOOT :
            case realtime.alarms.API_BOOT :
            case realtime.alarms.TP_BOOT :
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

        if (+alarmLevel === 0) {
            if (alermResName === realtime.alarms.CONNECTED) {
                delete this.alarmLevelList[realtime.alarms.DISCONNECTED];
                delete this.alarmLevelList.XM_JVM_OUTOFMEMORYERROR;

            } else if (alermResName === realtime.alarms.SERVER_BOOT) {
                delete this.alarmLevelList[realtime.alarms.SERVER_DOWN];

            } else if (alermResName === realtime.alarms.API_BOOT) {
                delete this.alarmLevelList[realtime.alarms.API_DOWN];

            } else if (alermResName === realtime.alarms.TP_BOOT) {
                delete this.alarmLevelList[realtime.alarms.TP_DOWN];

            } else {
                delete this.alarmLevelList[alermResName];
            }

        } else {
            if (this.alarmLevelList[alermResName]) {
                this.alarmLevelList[alermResName][5]  = alarmValue;
                this.alarmLevelList[alermResName][6]  = alarmLevel;
                this.alarmLevelList[alermResName][7]  = levelType;
                this.alarmLevelList[alermResName][9]  = descr;
                this.alarmLevelList[alermResName][10] = resID;
                this.alarmLevelList[alermResName][11] = +new Date();
                this.alarmLevelList[alermResName][12] = false;
            } else {
                this.alarmLevelList[alermResName] = [time, serverType, serverID, serverName, alermResName, alarmValue, alarmLevel, levelType, alarmType, descr, resID, +new Date(), false];
            }
        }

    },


    /**
     * 알람 아이콘 툴팁 숨김
     */
    hideAlertDetail: function () {
        this.detailBodyArea.updateFlag = false;
        this.tootipArea.hide();
    },


    /**
     * 알람 아이콘에 툴팁 표시
     */
    showAlertDetail: function (serverName, position, mouseEvent) {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
        }

        var valuehtml = '';

        var ix, ixLen;
        var clsLevel, clsType;
        var updateStr;
        var alarmName;
        var alarmLevel;
        var alarmValue;
        var alarmTypeInfo;

        var data  = this.alarmLevelList;

        // 포지션이 왼쪽인지 오른쪽인지 계산해주기
        var marginCheck = window.innerWidth - mouseEvent.x;

        if (marginCheck < 460) {
            clsType = 'directRight';
        } else {
            clsType = 'directLeft';
        }

        // 항목별 알람 리스트
        var alarmGroup = Object.keys(data);

        for (ix = 0, ixLen = alarmGroup.length; ix < ixLen; ix++) {
            alarmTypeInfo = data[alarmGroup[ix]];

            if (alarmTypeInfo.length === 0) {
                continue;
            }

            serverName = alarmTypeInfo[3];
            alarmName  = alarmTypeInfo[4];
            alarmValue = alarmTypeInfo[5];
            alarmLevel = alarmTypeInfo[7];
            clsLevel   = alarmLevel.toLocaleLowerCase();

            valuehtml +=
                '<div class="alertinfo wide">' +
                '<span class="'+clsLevel+'" style="float: left; display: inline-block; width: 75px; text-align:center;">' + this.convertTimeToString(alarmTypeInfo[0]) + '</span>' +
                '<span class="'+clsLevel+'" style="text-overflow: ellipsis; overflow:hidden; display: inline-block; white-space : nowrap; direction: rtl; width: 110px;">' + serverName + '</span>' +
                '<span class="'+clsLevel+'" style="text-overflow: ellipsis; overflow:hidden; display: inline-block; white-space : nowrap; width: 120px;">' + alarmName + '</span>' +
                '<span class="'+clsLevel+'" style="text-overflow: ellipsis; overflow:hidden; display: inline-block; width: 60px; text-align: right; ">' + alarmValue + '</span>' +
                '<span class="'+clsLevel+'" style="float: right; display: inline-block; width: 52px; margin: 0 0 0 10px; text-align: right;">' + alarmLevel + '</span>' +
                '</div>';
        }

        // 업데이트 정보 없을경우 처리하지 않음.
        if (valuehtml.length === 0) {
            return;
        }

        var header =
                '<span class="rtm-base ' + clsType + '"; style ="display: block;">' +
                '<div style="padding: 10px; height: 30px;">' +
                '  <span style= "float:left ;  font-size:17px; ">' + this.tierName + '</span>' +
                '</div>' +
                '<div class="frame-AlertLogHistoryFrame-AlertDetail";></div>' +
                '<div style ="display: block; height: 150px;  margin: 0px 5px 0px 0px;overflow-x:auto;"  >';

        updateStr = header + valuehtml;
        updateStr += '</div></span>';

        if (this.detailBodyArea.updateFlag === false) {
            this.detailBodyArea.update(updateStr);
            this.detailBodyArea.updateFlag = true;

            var posX = position.x;
            var posY = position.y;
            var margin = position.margin;

            var toolTipPosX, toolTipPosY;

            if (marginCheck > 460) {
                toolTipPosX = posX + position.width - margin - 20;
            } else {
                toolTipPosX = posX + margin - this.tootipArea.width;
            }

            toolTipPosY = posY + position.height / 2  - this.tootipArea.height + 28;

            if (toolTipPosY < 0) {
                toolTipPosY = 0;
            }

            this.tootipArea.showAt(toolTipPosX, toolTipPosY);
        }

        valuehtml     = null;
        clsLevel      = null;
        data          = null;
        serverName    = null;
        position      = null;
    },


    /**
     * 마지막 알람 상태를 체크.
     */
    lastAlarmCheck: function () {
        this.checkAlarmByServerType(this.tierType);
    },


    /**
     * 서버 타입별로 알람 상태를 체크
     *
     * @param {string} type - Server Type (1: WAS, 2: DB, 3:WebServer)
     */
    checkAlarmByServerType: function(type) {
        var ix, ixLen, jx, jxLen;
        var serverList, serverKeys, serverName, serverId,
            time, serverType, alertName, value, alertLevel,
            levelType, alertType;

        if (type === 'DB') {
            serverList = Repository.alarmListInfo.DB;

        } else if (type === 'WAS' || type === 'TP') {
            serverList = Repository.alarmListInfo.WAS;

        } else if (type === 'WebServer') {
            serverList = Repository.alarmListInfo.WebServer;

        } else if (type === 'APIM' || type === 'CD') {
            serverList = Repository.alarmListInfo.CD;
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

            for (jx = 0, jxLen = serverList[serverId].length; jx < jxLen; jx++) {
                time       = serverList[serverId][jx].alarmTime;
                serverType = serverList[serverId][jx].serverType;
                alertName  = serverList[serverId][jx].name;
                value      = serverList[serverId][jx].value;
                alertLevel = serverList[serverId][jx].level;
                alertType  = serverList[serverId][jx].alertType;
                levelType  = (+alertLevel === 2)? 'Critical' : 'Warning';

                if (type === 'DB' && Comm.dbInfoObj[serverId]) {
                    serverName = Comm.dbInfoObj[serverId].instanceName;

                } else if (type === 'TP' && Comm.tpInfoObj[serverId]) {
                    serverName = Comm.tpInfoObj[serverId].name;

                } else if (type === 'WAS' && Comm.wasInfoObj[serverId] && Comm.cdIdArr.indexOf(serverId) === -1) {
                    serverName = Comm.wasInfoObj[serverId].wasName;

                } else if (type === 'WebServer' && Comm.webServersInfo[serverId]) {
                    serverName = Comm.webServersInfo[serverId].name;

                } else if ((type === 'APIM' || type === 'CD') && Comm.cdInfoObj[serverId]) {
                    serverName = Comm.cdInfoObj[serverId].name;
                }

                if (serverName) {
                    this.onAlarm([time, serverType, serverId, serverName, alertName, value, alertLevel, levelType, alertType, '', -1]);
                }
            }
        }
    },


    /**
     * 선택된 서버에서 발생되고 있는 알람 중 제일 높은 알람 레벨을 반환.
     */
    getMaxAlarmLevel: function () {
        var ix, ixLen;
        var alarmData, alarmLevel, alarmKeys, maxLevel;

        alarmKeys = Object.keys(this.alarmLevelList);
        maxLevel = 0;

        for (ix = 0, ixLen = alarmKeys.length; ix < ixLen; ix++) {
            /*
             * [0] time
             * [1] serverType
             * [2] serverID
             * [3] serverName
             * [4] alermResName
             * [5] alarmValue
             * [6] alarmLevel
             * [7] levelType
             * [8] alarmType
             * [9] descr
             * [10] resID
             */
            alarmData = this.alarmLevelList[alarmKeys[ix]];
            alarmLevel = alarmData[6];

            if (alarmLevel != null && alarmData.length > 7) {
                maxLevel = Math.max(alarmLevel, maxLevel);
            }

            if (maxLevel === 2) {
                break;
            }
        }

        alarmData  = null;

        return maxLevel;
    },


    /**
     * 시간값을 '시:분:초' 형태로 변환해서 전달
     *
     * @param {string} atime 시간값
     * @return {string} 시간값
     */
    convertTimeToString: function (atime) {
        var date = new Date(atime);
        var h    = date.getHours();
        var m    = date.getMinutes();
        var s    = date.getSeconds();

        atime = null;
        date  = null;

        return '' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    },


    /**
     * 그래프 화면에 표시되는 데이터에서 삭제 대상 알람 체크.
     * RTMDataManager.js 에서 호출
     */
    clearAlarm: function() {
        this.diffSec = 0;

        var ix, ixLen;
        var alarmName;
        var alarmKeys = Object.keys(this.alarmLevelList);

        for (ix = 0, ixLen = alarmKeys.length; ix < ixLen; ix++) {
            alarmName = alarmKeys[ix];

            this.diffSec = 0;

            if (!Ext.Array.contains(realtime.downAlarms, alarmName)) {
                this.diffSec = Ext.Date.diff(this.alarmLevelList[alarmName][11], new Date(), Ext.Date.SECOND);
            }

            // 알람이 들어온지 3초가 넘는 경우 상태를 클리어 처리
            if (this.diffSec > 3) {
                delete this.alarmLevelList[alarmName];
            }
        }

        serverKeys = null;
        alarmKeys  = null;
        alarmName  = null;
    },


    frameRefresh: function() {
        if (this.statusCircle != null) {
            this.statusCircle.startAnimationFrame();
        }
    },


    frameStopDraw: function(){
        if (this.statusCircle != null) {
            this.statusCircle.stopAnimationFrame();
        }
    }


});
