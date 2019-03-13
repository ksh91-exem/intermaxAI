Ext.define('rtm.src.rtmCDStatList', {
    extend   : 'rtm.src.rtmStatList',

    interval : 3000,

    isWinClosed: false,

    initProperty: function() {
        this.frameType = 'CD';
        this.stat      = [];
        this.comboData = [];

        this.statTrendChartData = Repository.CDTrendData;

        this.statList       = realtime.CDStatName.concat();

        this.serverNameArr  = Comm.cdNameArr.concat();
    }

});

