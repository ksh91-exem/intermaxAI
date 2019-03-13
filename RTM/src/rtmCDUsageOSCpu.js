Ext.define('rtm.src.rtmCDUsageOSCpu',{
    extend: 'rtm.src.rtmUsageOSCpu',
    title : common.Util.CTR('OS CPU Usage'),

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, this.barChart);

            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
            }

            this.frameStopDraw();
        }
    },

    initProperty: function() {
        this.monitorType  = 'CD';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.envKeyChartFit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_usageCpuChart_fit';

        this.title = common.Util.CTR('CPU Usage');

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);

        // 호스트 목록
        this.displayHostList = realtime.CDHostList.concat();

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    },


    init: function() {

        this.initProperty();

        this.initLayout();

        this.drawData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this.barChart);
    },


    /**
     * C Daemon 데이터는 WAS_STAT 데이터가 아닌 APIM_OS_STAT 데이터 값으로 표시 처리.
     * Repository 개체에서 OS CPU, MEM 데이터를 가져와 표시.
     * 데이터만 처리를 하기때문에 탭 화면이 비활성화 되었을 때도 중지하지 않고 처리를 하게 함.
     *
     * 데이터 갱신 주기: 3초
     */
    drawData: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        var ix, ixLen, idx,
            hostName, serverId,
            data, cpu, level;

        for (ix = 0, ixLen = Comm.cdIdArr.length; ix < ixLen; ix++) {
            serverId = Comm.cdIdArr[ix];

            data = Repository.CDTrendData[serverId];
            hostName = Comm.RTComm.HostRelWAS(serverId);

            if (data && hostName) {
                idx = this.barChart.nameArr.indexOf(hostName);

                if (idx !== -1) {
                    cpu   = +data.OS_CPU || 0
                    level = this.barChart.bar_objects[idx].level;

                    this.barChart.bar_objects[idx].setValues(
                        (level !== 1 && level !== 2)? cpu : 0,
                        (level === 1)? cpu : 0,
                        (level === 2)? cpu : 0
                    );
                }
            }
        }

        this.refreshTimer = setTimeout(this.drawData.bind(this), 3000);
    }

});
