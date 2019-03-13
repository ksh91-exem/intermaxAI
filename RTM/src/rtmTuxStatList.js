Ext.define('rtm.src.rtmTuxStatList', {
    extend   : 'rtm.src.rtmStatList',
    title    : common.Util.TR('Stat Change'),

    interval : 10000,

    initProperty: function() {
        this.frameType = 'TUX';
        this.stat      = [];
        this.comboData = [];

        this.statTrendChartData = Repository.TuxTrendData;

        this.statList = realtime.TuxStatName.concat();

        if (this.isTotal === true) {
            this.serverNameArr = ['Total'];
        } else {
            this.serverNameArr = Comm.tuxNameArr.concat();
        }
    }

});

