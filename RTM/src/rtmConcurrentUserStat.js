Ext.define('rtm.src.rtmConcurrentUserStat', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Concurrent Users Stat'),
    layout: 'fit',

    showToolMenu : true,    // 프레임 전체에 적용되는 옵션 아이콘 사용 여부

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_SESSION_DATA, this);
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.chartList = [];
        this.chartId   = [];

        this.psWasStatList = [];

        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.txnOption = Comm.RTComm.getChartOption(this.componentId);

        this.psStatData = {
            statdata    : [],
            psServerList: []
        };
        this.psDataCount = 60;
        this.waitTarget  = null;

        this.wasStatNameList = Comm.RTComm.getWasStatIdArr();
        this.wasStatNameList[this.wasStatNameList.length] = 'TIME';
    },


    init: function() {

        this.initProperty();

        this.initTrendData();

        var ix, jx, kx;

        this.psStatData.psServerList.length = 0;

        for (ix = 0; ix < this.serverIdArr.length; ix++) {
            this.psStatData.psServerList.push(this.serverIdArr[ix]);
        }

        this.statListCount = this.psWasStatList.length;

        for (jx = 0; jx < this.psStatData.psServerList.length; jx++) {
            this.psStatData.statdata[jx] = [];
            this.psStatData.statdata[jx][0] = 0;   // WASID

            if (this.psStatData.statdata[jx][1] == null){
                this.psStatData.statdata[jx][1] = [];
            }

            for (kx = 0 ; kx < this.psDataCount; kx ++ ) {
                this.psStatData.statdata[jx][1].push(null);  // DATA
            }
        }

        // 프레임 전체 옵션
        this.initAllTrendContextMenu();

        // 메인 레이어
        this.background = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            cls    : 'performance-area'
        });

        // 확대 레이어
        this.expandView = Ext.create('Ext.container.Container', {
            layout: 'fit',
            hidden: true,
            cls   : 'performance-area-expandview'
        });

        this.add([this.background, this.expandView]);

        this.chartLayer = [];

        var rowPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '2 2 1 2',
            width  : '100%',
            border : false,
            bodyCls: 'performance-chart-area',
            flex   : 1
        });

        var colPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'performance-chart',
            layout : 'fit',
            margin : '2 2 1 2',
            flex   : 1,
            height : '100%',
            border : false,
            html   : '<div class="was-stat-chart-tools"><div class="statchart-expand" style="display:none;" index="0">'
        });

        this.chartId[this.chartId.length] = colPanel.id;
        this.chartLayer.push(colPanel);

        rowPanel.add(colPanel);

        this.background.add(rowPanel);

        rowPanel = null;
        colPanel = null;

        this.chartList[0] = Ext.create('rtm.src.rtmConcurrentUserStatChart');
        this.chartList[0].target = Ext.getCmp(this.chartId[0]);
        this.chartList[0].parent = this;
        this.chartList[0].chartOption = this.txnOption.chartOption;
        this.chartList[0].statName = this.psWasStatList[0];
        this.chartList[0].setTitle(common.Util.CTR('Concurrent Users'));

        this.chartLayer[0].add(this.chartList[0]);
        this.chartList[0].init();

        if (this.selectedServerNames.length > 0 && this.selectedServerNames.length !== this.serverIdArr.length) {
            this.frameChange(this.selectedServerNames);
        }

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_SESSION_DATA, this);
    },


    initTrendData: function() {
        var ix, ixLen;
        var kx, kxLen;
        var wasid;

        for (ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            wasid = this.serverIdArr[ix];

            if (!Repository.WasSessionData[wasid]) {
                Repository.WasSessionData[wasid] = {};
                Repository.WasSessionDataLog[wasid] = {};

                Repository.WasSessionData[wasid].SESSION_COUNT    = 0;
                Repository.WasSessionDataLog[wasid].SESSION_COUNT = [];

                for (kx = 0, kxLen = this.psDataCount; kx < kxLen; kx++) {
                    Repository.WasSessionDataLog[wasid].SESSION_COUNT.push(null);
                }
            }
        }

        if (!Repository.WasSessionData.timeRecordData) {
            Repository.WasSessionData.timeRecordData = [];
            Repository.WasSessionData.timeRecordWasId = Repository.trendChartData.timeRecordWasId;

            var date;
            for (ix = 0; ix < 60; ix++) {
                // 설정되는 시간을 클라이언트 시간이 아닌 서버 시간으로 설정. (1분 단위로 설정)
                date = new Date(+new Date(realtime.lastestTime) - (ix * 1000 * 60));
                Repository.WasSessionData.timeRecordData.unshift(date.getTime());
            }
            date = null;
        }
    },

    refreshChartData: function() {
        if (this.isDrawStopChart) {
            return;
        }

        if (this.statListCount !== this.psWasStatList.length) {

            this.statListCount = this.psWasStatList.length;
        }

        this.drawData();
    },


    frameRefresh: function() {
        this.isDrawStopChart = false;
        this.refreshChartData();
    },


    frameStopDraw: function(){
        this.isDrawStopChart = true;
    },


    /**
     * 동시접속자 수 차트 그리기
     */
    drawData: function() {
        var jx, cx;
        var wasid, statValue;
        var isDown;

        for (jx = 0; jx < this.serverIdArr.length; jx++) {
            wasid = this.serverIdArr[jx];

            if (!this.psStatData.statdata[jx] && this.psStatData.statdata.length < this.serverIdArr.length) {
                this.psStatData.statdata[jx]    = [];
                this.psStatData.statdata[jx][0] = wasid;   // WASID

                if (!this.psStatData.statdata[jx][1]) {
                    this.psStatData.statdata[jx][1] = [];
                }

                for (cx = 0 ; cx < this.psDataCount; cx ++ ) {
                    this.psStatData.statdata[jx][1].push(null);  // Init Data
                }
            }

            this.psStatData.statdata[jx][0] = wasid;

            isDown = Comm.RTComm.isDownByServer(wasid);

            for (cx = 0; cx < this.psDataCount; cx++) {
                if (!Repository.WasSessionDataLog[wasid]) {
                    statValue = null;
                } else {
                    statValue = isDown? null : Repository.WasSessionDataLog[wasid].SESSION_COUNT[cx];
                }
                this.psStatData.statdata[jx][1][cx] = statValue;
            }
        }

        if (this.loadingMask) {
            this.loadingMask.hide();
        }

        this.drawChart();
    },


    drawChart: function() {
        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp !== true && !this.floatingLayer) {
            return;
        }

        this.chartFixed = 0;
        this.chartMaxValue = null;

        this.chartList[0].drawData(Repository.WasSessionData.timeRecordData, this.psStatData.statdata, this.chartFixed, this.chartMaxValue);
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        var serverId;
        var trendDataLog;
        var ix, ixLen, jx, jxLen;

        for (jx = 0, jxLen = this.chartList[0].chart.serieseList.length; jx < jxLen;) {
            this.chartList[0].chart.removeSeries(jx);
            jxLen--;

        }
        this.chartList[0].setChartSeries();

        var dataCount = 60;
        for (jx = 0, jxLen = this.serverIdArr.length; jx < jxLen; jx++) {
            serverId = this.serverIdArr[jx];

            // WAS Concurrent User Data Log
            if (Repository.WasSessionDataLog[serverId]) {
                continue;
            }

            Repository.WasSessionDataLog[serverId] = {};
            trendDataLog = Repository.WasSessionDataLog[serverId];

            trendDataLog.TIME = [];
            for (ix = 0, ixLen = dataCount; ix < ixLen; ix++) {
                trendDataLog.TIME.push(0);
            }

            trendDataLog.SESSION_COUNT = [];
            for (ix = 0, ixLen = dataCount; ix < ixLen; ix++) {
                trendDataLog.SESSION_COUNT.push(null);
            }
        }

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * 모니터링 WAS 목록을 변경(선택)된 WAS 목록으로 재설정.
     * 화면에서 WAS 또는 그룹(Host, Business)을 선택하는 경우 호출.
     *
     * @param {string[]} wasList - WAS 명 배열
     */
    frameChange: function(wasList) {

        var serverList = Ext.Array.intersect(this.serverNameArr, wasList);

        this.chartList[0].setVisibleSeries(serverList);

        this.drawChart();

        serverList = null;
        wasList    = null;
    },


    /**
     * Change Chart Line & Label Colors
     */
    changeChartColors: function() {
        var serverId, serverName;
        var seriese;
        var jx, jxLen;

        var lineChart = this.chartList[0];

        this.txnOption = Comm.RTComm.getChartOption(this.componentId, true);

        for (jx = 0, jxLen = lineChart.chart.serieseList.length; jx < jxLen; jx++) {
            seriese = lineChart.chart.serieseList[jx];

            if (seriese) {
                serverId      = seriese.id;
                serverName    = Comm.wasInfoObj[serverId].wasName;
                seriese.color = realtime.serverColorMap[this.openViewType][serverId];
                seriese.lineWidth = this.txnOption.chartOption[serverName].lineWidth;
                lineChart.chart.toolTip.removeSeries(seriese);
                lineChart.chart.toolTip.addSeries(seriese);
            }
        }

        lineChart.setChartSeries();

        this.drawData();

        seriese   = null;
        lineChart = null;
    },


    /**
     * 지난 데이터 로드
     *
     * @param {number} index - 차트 인덱스
     * @param {string} title - 차트 지표 ID ex) WAS_SESSION
     */
    loadStatData: function(index, title) {

        this.tmpChart   = this.chartList[index];
        this.waitTarget = Ext.getCmp(this.chartId[index]);

        this.tmpChart.setTitle(Comm.RTComm.getStatNameById(title));
        this.tmpChart.chart.clearValues();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.waitTarget,
            type: 'small-circleloading'
        });
        this.loadingMask.show(null, true);

        this.refreshChartData();
    },


    /**
     * @note 프레임 전체 옵션 정의 함수
     */
    initAllTrendContextMenu: function(){
        this.allTrendMenuContext = Ext.create('Exem.ContextMenu', {
            shadow : false,
            cls    : 'rtm-contextmenu-base',
            listeners: {
                'mouseleave': function(menu) {
                    menu.hide();
                }
            }
        });

        if (! this.isRealTimeAnalysis) {
            this.allTrendMenuContext.addItem({
                title : common.Util.TR('Display Option'),
                target: this,
                fn : function(me) {
                    var colorNLine = Ext.create('rtm.src.rtmChartConfig',{
                        chartList    : me.target.chartList,
                        trendChart   : me.target,
                        isHideArrangement: true
                    });
                    colorNLine.addCls('xm-dock-window-base');
                    colorNLine.init();
                    colorNLine.show();

                    colorNLine = null;
                }
            });
        }

    },


    /**
     * @note 도킹 프레임의 옵션 처리 함수. toolMenuFn 함수가 정의되어 있으면 프레임 마우스 오버 시 옵션 아이콘이 생성됨
     * @param e
     */
    toolMenuFn: function(e) {
        this.allTrendMenuContext.showAt({x : e.originalEvent.x, y: e.originalEvent.y});
    }


});
