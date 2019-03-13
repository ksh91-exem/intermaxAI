Ext.define ('rtm.src.rtmWebAlertInfo', {
    extend: 'rtm.src.rtmAlertInfo',
    title : 'Web ' + common.Util.TR('Alarm Info'),

    initProperty: function() {
        this.monitorType  = 'WEB';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.alarmList  = {};
        this.alarmIdArr = [];

        this.title = 'Web ' + common.Util.TR('Alarm Info');
    },


    /**
     * 알람 정보가 Web 알람에 해당 하는지 체크한다.
     *
     * @param {number} serverType - 서버타입
     * @param {number} serverId - 서버 ID
     */
    isDisplayAlarm: function(serverType, serverId) {
        var isDisplay = true;

        if (serverType === 3 && Comm.webIdArr.indexOf(serverId) === -1) {
            isDisplay = false;
        }

        if (serverType === 1 || serverType === 9 || serverType == 15 || serverType === 20) {
            isDisplay = false;
        }

        return isDisplay;
    }

});

