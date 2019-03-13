Ext.define('rtm.src.rtmWebStatList', {
    extend   : 'rtm.src.rtmStatList',

    interval : 3000,

    isWinClosed: false,

    initProperty: function() {
        this.frameType = 'WEB';
        this.stat      = [];
        this.comboData = [];

        this.statTrendChartData = Repository.WebTrendData;

        this.statList       = realtime.WebStatName.concat();

        this.serverNameArr  = Comm.webNameArr.concat();
    }

});

