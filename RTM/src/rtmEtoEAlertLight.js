Ext.define('rtm.src.rtmEtoEAlertLight', {
    extend   : 'rtm.src.rtmAlertLight',
    title    : common.Util.CTR('Alarm Log History'),

    initPorperty: function () {

        // E2E로 설정하면 PA 알람 발생 내역에 연계 시 서버 정보에 맞게 자동으로 선택되어 표시됨
        this.monitorType  = 'E2E';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        // Icon <-> Grid
        this.mode = this.DISPLAYTYPE.CHART;

        this.alarmGridList      = [];
        this.alarmGridLevelList = [];

        this.initAlarmList();

        // 알람 내역 삭제 주기 옵션 설정
        var webEnvData;
        if (Comm.web_env_info.alarm_option) {
            webEnvData = JSON.parse(Comm.web_env_info.alarm_option);
        }

        // 알람 발생 목록 표시 갯수 설정
        this.gridBufSize     = webEnvData ? webEnvData.gridBufferSize : 100;

        // 알람 발생 목록 삭제 주기 설정
        this.expiredInterval = webEnvData ? webEnvData.timeout : 1;
        this.expiredInterval = this.expiredInterval * 60 * 1000;
    },


    /**
     * 서버 타입별 알람 레벨 목록을 구성 및 초기화
     */
    initAlarmList: function() {
        this.alarmLevelList  = {};

        var ix, ixLen;
        var serverKeys;

        serverKeys = Object.keys(Comm.wasInfoObj);

        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            this.alarmLevelList[Comm.wasInfoObj[serverKeys[ix]].wasName] = {};
        }

        serverKeys = Object.keys(Comm.dbInfoObj);
        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            this.alarmLevelList[Comm.dbInfoObj[serverKeys[ix]].instanceName] = {};
        }

        serverKeys = Object.keys(Comm.webServersInfo);
        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            this.alarmLevelList[Comm.webServersInfo[serverKeys[ix]].name] = {};
        }

        serverKeys = Object.keys(Comm.cdInfoObj);
        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            this.alarmLevelList[Comm.cdInfoObj[serverKeys[ix]].name] = {};
        }

        serverKeys = Object.keys(Comm.etoeBizInfos);
        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            this.alarmLevelList[Comm.etoeBizInfos[serverKeys[ix]].name] = {};
        }
    },


    /**
     * 알람 화면에 아이콘으로 표시될 대상 서버 설정
     */
    setServerList: function() {
        var ix, ixLen;
        var idArr   = [];
        var nameArr = [];
        var typeArr = [];
        var serverKeys, serverName;

        serverKeys = Object.keys(Comm.wasInfoObj);

        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            serverName = Comm.wasInfoObj[serverKeys[ix]].wasName;

            if (serverName) {
                idArr[idArr.length]     = serverKeys[ix];
                nameArr[nameArr.length] = serverName;
                typeArr[typeArr.length] = 1;
            }
        }

        serverKeys = Object.keys(Comm.dbInfoObj);
        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            serverName = Comm.dbInfoObj[serverKeys[ix]].instanceName;

            if (serverName) {
                idArr[idArr.length]     = serverKeys[ix];
                nameArr[nameArr.length] = serverName;
                typeArr[typeArr.length] = 2;
            }
        }

        serverKeys = Object.keys(Comm.webServersInfo);
        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            serverName = Comm.webServersInfo[serverKeys[ix]].name;

            if (serverName) {
                idArr[idArr.length]     = serverKeys[ix];
                nameArr[nameArr.length] = serverName;
                typeArr[typeArr.length] = 3;
            }
        }

        serverKeys = Object.keys(Comm.cdInfoObj);
        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            serverName = Comm.cdInfoObj[serverKeys[ix]].name;

            if (idArr.indexOf(serverKeys[ix]) === -1 && serverName) {
                idArr[idArr.length]     = serverKeys[ix];
                nameArr[nameArr.length] = serverName;
                typeArr[typeArr.length] = 1;
            }
        }

        this.alarmIcon.setChartLabels(idArr, nameArr, typeArr);
    },


    /**
     * 처리 대상 알람인지 체크, 대상이 아닌 경우 건너뛴다.
     *
     * @param {string} serverType
     * @param {string} serverName
     * @return {boolean} true: 비처리 대상 알람, false: 처리 대상 알람
     */
    isSkipAlarm: function(serverType, serverName) {
        var isSkipData = true;

        if (serverType === 20) {
            isSkipData = false;

        } else {
            isSkipData = !this.alarmLevelList[serverName];
        }

        return isSkipData;
    },


    /**
     * 마지막 알람 상태를 체크.
     */
    lastAlarmCheck: function () {

        // Database
        this.checkAlarmByServerType('DB');

        // WAS
        this.checkAlarmByServerType('WAS');

        // WebServer
        this.checkAlarmByServerType('WebServer');

        // C Daemon
        this.checkAlarmByServerType('CD');

        // Business
        this.checkAlarmByServerType('BIZ');
    },


    /**
     * 서버 타입별로 알람 상태를 체크.
     * 알람 발생내역에서는 호스트 알람은 체크하여 보여주지 않음.
     *
     * @param {string} type - Server Type (1: WAS, 2: DB, 3:WebServer, 9: Host, 15: APIM, 20: BIZ)
     */
    checkAlarmByServerType: function(type) {
        var ix, ixLen;
        var serverKeys, serverName, serverId, serverList, serverType,
            time,
            value,
            levelType, alertName, alertLevel, alertType;

        if (type === 'DB') {
            serverList = Repository.alarmListInfo.DB;

        } else if (type === 'WAS') {
            serverList = Repository.alarmListInfo.WAS;

        } else if (type === 'WebServer') {
            serverList = Repository.alarmListInfo.WebServer;

        } else if (type === 'CD') {
            serverList = Repository.alarmListInfo.CD;

        } else if (type === 'BIZ') {
            serverList = Repository.alarmListInfo.BIZ;
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
            levelType  = (+alertLevel === 2)? 'Critical' : 'Warning';

            if (type === 'DB' && Comm.dbInfoObj[serverId]) {
                serverName = Comm.dbInfoObj[serverId].instanceName;

            } else if (type === 'WAS' && Comm.wasInfoObj[serverId]) {
                serverName = Comm.wasInfoObj[serverId].wasName;

            } else if (type === 'WebServer' && Comm.webServersInfo[serverId]) {
                serverName = Comm.webServersInfo[serverId].name;

            } else if (type === 'CD' && Comm.cdInfoObj[serverId]) {
                serverName = Comm.cdInfoObj[serverId].name;

            } else if (type === 'BIZ') {
                serverName = Comm.RTComm.getBusinessNameById(serverId);
            }

            if (serverName) {
                this.onAlarm([
                    time,          // time
                    serverType,    // server type
                    serverId,      // server id
                    serverName,    // server name
                    alertName,     // alert name
                    value,         // alert value
                    alertLevel,    // alert level
                    levelType,     // level type
                    alertType,     // alert tpye
                    '',            // descr
                    -1             // alert resource id
                ]);
            }
        }

    }

});
