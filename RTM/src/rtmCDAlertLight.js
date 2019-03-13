Ext.define('rtm.src.rtmCDAlertLight', {
    extend   : 'rtm.src.rtmAlertLight',
    title    : common.Util.CTR('Alarm Log History'),

    initPorperty: function () {

        this.monitorType  = 'CD';
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
        var serverKeys = Object.keys(Comm.cdInfoObj);

        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            this.alarmLevelList[Comm.cdInfoObj[serverKeys[ix]].name] = {};
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

        var serverKeys = Object.keys(Comm.cdInfoObj);

        for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
            idArr[idArr.length]     = serverKeys[ix];
            nameArr[nameArr.length] = Comm.cdInfoObj[serverKeys[ix]].name;
            typeArr[typeArr.length] = 1;
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
        return serverType !== 15 || !this.alarmLevelList[serverName];
    },


    /**
     * 마지막 알람 상태를 체크.
     */
    lastAlarmCheck: function () {

        this.checkAlarmByServerType();
    },


    /**
     * 서버 타입별로 알람 상태를 체크
     *
     * @param {string} type - Server Type (1: WAS, 2: DB, 3:WebServer)
     */
    checkAlarmByServerType: function() {
        var ix, ixLen;
        var serverKeys, serverName, serverId,
            time, serverType, alertName, value, alertLevel,
            levelType, alertType;

        var serverList = Repository.alarmListInfo.WAS;

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

            if (Comm.cdInfoObj[serverId]) {
                serverName = Comm.cdInfoObj[serverId].name;
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
