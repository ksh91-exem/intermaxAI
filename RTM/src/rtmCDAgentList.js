Ext.define ('rtm.src.rtmCDAgentList', {
    extend: 'rtm.src.rtmAgentList',
    title : common.Util.TR('Agent List'),

    initProperty: function() {
        this.monitorType  = 'CD';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.monitorType).concat();

        this.alarmList    = {};
        this.alarmNameArr = [];
        this.agentList    = {};

        this.removeAgentKeys = [];

        if (!realtime.agentListId) {
            realtime.agentListId = [];
        }
    }

});

