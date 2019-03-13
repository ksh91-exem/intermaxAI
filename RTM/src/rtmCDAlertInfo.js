Ext.define ('rtm.src.rtmCDAlertInfo', {
    extend: 'rtm.src.rtmAlertInfo',
    title : common.Util.TR('Alarm Info'),

    initProperty: function() {
        this.monitorType  = 'CD';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.alarmList  = {};
        this.alarmIdArr = [];

        this.title = common.Util.TR('Alarm Info');
    },


    /**
     * 알람 정보가 CD 알람에 해당 하는지 체크한다.
     *
     * @param {number} serverType - 서버타입
     * @param {number} serverId - 서버 ID
     * @param {number} serverName - 서버 명
     */
    isDisplayAlarm: function(serverType, serverId, serverName) {
        var isDisplay = true;

        if (serverType === 9 && realtime.CDHostList.indexOf(serverName) === -1) {
            isDisplay = false;
        }

        if (serverType === 15 && Comm.cdIdArr.indexOf(serverId) === -1) {
            isDisplay = false;
        }

        if (serverType === 1 || serverType === 3 || serverType === 20) {
            isDisplay = false;
        }

        return isDisplay;
    }

});

