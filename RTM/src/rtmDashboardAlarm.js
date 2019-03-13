Ext.define('rtm.src.rtmDashboardAlarm', {
    extend: 'Exem.DockForm',
    layout: 'fit',
    width : '100%',
    height: '100%',

    interval: 10000,
    wooriPocDataFolder: realtime.wooriPocDataFolder,

    listeners: {
        destroy: function() {
            // 연결 끊어줌.
            this.chart.target  = null;

            if (this.timer) {
                clearTimeout(this.timer);
            }
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();
    },

    init: function() {
        var self = this;

        this.initProperty();

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 10 0 10'
        });
        this.add(this.background);

        this.chartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            margin : '0 0 10 0',
            flex: 1,
            listeners: {
                resize: function(_this) {
                    if (self.chart) {
                        self.chart.draw(self.chart.id, _this.el.dom.clientWidth, _this.el.dom.clientHeight);
                    }
                }
            }
        });

        this.background.add(this.chartArea);

        this.createIntegrationTrackingChart();

        this.drawFrame();
    },


    /**
     * 통합 추적 차트 구성
     */
    createIntegrationTrackingChart: function() {
        this.chart = Ext.create('rtm.src.rtmDashboardAlarmChart');

        this.chartArea.add(this.chart);

        this.chart.init();
        this.chart.draw(this.chart.id, this.chartArea.getWidth(), this.chartArea.getHeight());
    },

    /**
     * 차트 그리기
     */
    drawFrame: function() {
        var folder = this.wooriPocDataFolder + '_N';
        if (this.timer) {
            clearTimeout(this.timer);
            folder = this.wooriPocDataFolder;
        }

        $.ajax({
            type : 'get',
            url  : '../service/' + folder +'/anomaly_alarm_' + this.wooriPocDataFolder + '.json',
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                this.chart.setData(data);
            }.bind(this)
        });

        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },


    /**
     * 트랜잭션 모니터 차트 렌더링 시직
     */
    frameRefresh: function() {
        setTimeout(this.drawFrame.bind(this),10);
    },


    /**
     * 트랜잭션 모니터 차트 렌더링 중지
     */
    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
});