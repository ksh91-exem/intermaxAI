Ext.define ('rtm.src.rtmTuxAlertInfo', {
    extend: 'rtm.src.rtmAlertInfo',
    title : 'Tuxedo ' + common.Util.TR('Alarm Info'),

    initProperty: function() {
        this.monitorType  = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.alarmList  = {};
        this.alarmIdArr = [];

        this.title = 'Tuxedo ' + common.Util.TR('Alarm Info');
    },


    /**
     * 알람 정보가 TP 알람에 해당 하는지 체크한다.
     *
     * @param {number} serverType - 서버타입
     * @param {number} serverId - 서버 ID
     * @param {number} serverName - 서버 명
     */
    isDisplayAlarm: function(serverType, serverId, serverName) {
        var isDisplay = true;

        if (serverType === 1 && Comm.tuxIdArr.indexOf(serverId) === -1) {
            isDisplay = false;
        }

        if (serverType === 9 && realtime.TuxHostList.indexOf(serverName) === -1) {
            isDisplay = false;
        }

        if (serverType === 3 || serverType === 15 || serverType === 20) {
            isDisplay = false;
        }

        return isDisplay;
    }

});

