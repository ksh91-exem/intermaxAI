Ext.define('rtm.src.rtmDashAbnormalLogInfo', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('이상 로그 정보'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',
    url : 'http://192.168.0.11:9999',

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

    // 차트를 그릴지 체크하는 항목
    isDrawStopChart : false,

    isSkip : false,

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);

            this.isClosedDockForm = true;
            this.chartId = null;
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this,
            type  : 'small-circleloading'
        });
    },

    init: function() {

        this.initProperty();
        this.initLayout();

    },

    initLayout: function() {
        var targetPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            height: 400,
            margin: '4 4 4 4',
            border: false,
            autoScroll: true,
            bodyStyle: { background: '#ffffff' }
        });

        var summaryTitle = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: '100%',
            margin: '4 4 0 4',
            border: false,
            html : '<div class="anomaly-log-title single">이상 로그 정보</div><div><span class="anomaly-log-span">logloglog</span></div>'
        });

        targetPanel.add(summaryTitle)

        this.add(targetPanel);
    }

});

