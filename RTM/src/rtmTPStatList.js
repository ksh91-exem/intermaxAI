Ext.define('rtm.src.rtmTPStatList', {
    extend   : 'rtm.src.rtmStatList',
    title    : common.Util.TR('Stat Change'),

    interval : 10000,

    initProperty: function() {
        this.frameType = 'TP';
        this.stat      = [];
        this.comboData = [];

        this.statTrendChartData = Repository.tmadminChartData;

        this.statList = realtime.TPStatName.concat();

        if (this.isTotal === true) {
            this.serverNameArr = ['Total'];
        } else {
            this.serverNameArr = Comm.tpNameArr.concat();
        }
    }

});

