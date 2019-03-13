Ext.define('rtm.src.rtmGCStat', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('GC Stat'),
    layout: 'fit',

    GCData   : {},
    dataCount: 30,

    isInitResize : true,

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_CHART, this);

            if (this.gcStatTooltip) {
                this.gcStatTooltip.remove();
                this.gcStatTooltip = null;
            }
        }
    },

    initProperty: function() {
        this.monitorType = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.chartList = [];
        this.chartId   = [];

        this.gcDataIndex = 0;
        this.statdata = {};
        this.YGC = 0;
        this.FGC = 0;
        this.YGCT = 0;
        this.FGCT = 0;
        this.Loaded = 0;
        this.UnLoaded = 0;
        this.EU = 0;
        this.OU = 0;
        this.PU = 0;

    },

    init: function() {

        this.initProperty();

        var ix, jx, cx, statname;

        var len = realtime.gcStatList.length;

        for (ix = 0; ix < len; ix++) {
            statname = realtime.gcStatList[ix].id;
            this.statdata[statname] = [];

            for (jx = 0; jx < this.serverIdArr.length; jx++) {
                this.statdata[statname][jx] = [];
                this.statdata[statname][jx][0] = 0;
                this.statdata[statname][jx][1] = [];

                for (cx = 0; cx < this.dataCount; cx++) {
                    this.statdata[statname][jx][1].push(null);
                }
            }
        }

        this.background = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            cls    : 'gcstat-area'
        });

        // 확대 레이어
        this.expandView = Ext.create('Ext.container.Container', {
            layout: 'fit',
            hidden: true,
            cls   : 'gcstat-area-expandview'
        });

        this.add([this.background, this.expandView]);

        var rowPanel, colPanel;
        var chartIdx = 0;

        this.chartLayer = [];

        for (ix = 0; ix < 2; ix++) {
            rowPanel = this.getRowChartPanel();

            for (jx = 0; jx < 3; jx++) {
                colPanel = this.getColChartPanel(chartIdx++);
                this.chartId[this.chartId.length] = colPanel.id;
                this.chartLayer.push(colPanel);
                rowPanel.add(colPanel);
            }

            this.background.add(rowPanel);

            rowPanel = null;
            colPanel = null;
        }

        for (ix = 0; ix < 6; ix++) {
            this.chartList[ix] = Ext.create('rtm.src.rtmGCStatChart');
            this.chartList[ix].target = Ext.getCmp(this.chartId[ix]);
            this.chartList[ix].parent = this;
            this.chartList[ix].statName = realtime.gcStatList[ix].name;
            this.chartList[ix].setTitle(common.Util.TR(realtime.gcStatList[ix].name));

            this.chartLayer[ix].add(this.chartList[ix]);
            this.chartList[ix].init();
        }

        this.toggleExpand();

        if (this.selectedServerNames.length > 0 && this.selectedServerNames.length !== this.serverIdArr.length) {
            this.frameChange(this.selectedServerNames);
        }

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_CHART, this);

        chartIdx = null;
    },

    refreshChartData: function() {
        if (this.isDrawStopChart) {
            return;
        }

        this.drawData();
    },

    getRowChartPanel: function() {
        return Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '2 2 1 2',
            width  : '100%',
            border : false,
            bodyCls: 'gcstat-chart-area',
            flex: 1
        });
    },

    getColChartPanel: function(index) {
        return Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'gcstat-chart',
            layout : 'fit',
            margin : '2 2 1 2',
            flex   : 1,
            height : '100%',
            border : false,
            html   : '<div class="was-stat-chart-tools"><div class="statchart-expand" index="'+index+'">'
        });
    },

    frameRefresh: function() {
        this.isDrawStopChart = false;
        this.refreshChartData();
    },


    frameStopDraw: function(){
        this.isDrawStopChart = true;
    },


    /**
     * 실시간 GC 지표 차트를 그리기 전에 데이터 설정
     */
    drawData: function() {
        var ix, jx, cx;
        var wasId, statname, statValue;
        var isDown;

        var len = realtime.gcStatList.length;

        for (ix = 0; ix < len; ix++) {
            statname = realtime.gcStatList[ix].id;

            for (jx = 0; jx < this.serverIdArr.length; jx++) {

                wasId = this.serverIdArr[jx];
                this.statdata[statname][jx][0] = wasId;
                this.statdata[statname][jx][2] = realtime.serverColorMap[this.openViewType][wasId];

                if (!Repository.JVMGCStat[wasId] || !Repository.JVMGCStat[wasId][statname]) {
                    continue;
                }

                isDown = Comm.RTComm.isDownByServer(wasId);

                for (cx = 0; cx < this.dataCount; cx++) {
                    statValue = isDown? null : Repository.JVMGCStat[wasId][statname][cx];
                    this.statdata[statname][jx][1][cx] = statValue;
                }
            }
        }

        this.drawChart();

        this.gcDataIndex++;
        if (this.gcDataIndex >= this.dataCount) {
            this.gcDataIndex = 0;
        }

        wasId    = null;
        len      = null;
        statname = null;
    },


    /**
     * 실시간 GC 지표 차트 그리기
     */
    drawChart: function() {
        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp !== true && !this.floatingLayer) {
            return;
        }

        for (var ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            if (realtime.gcStatList[ix].id === 'GCTime') {
                this.chartFixed = 2;
            } else {
                this.chartFixed = 0;
            }

            this.chartList[ix].drawData(Repository.trendChartData.timeRecordData, this.statdata[realtime.gcStatList[ix].id], this.chartFixed);
        }

        ix    = null;
        ixLen = null;
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        var serverId;
        var seriese;
        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.chartList[ix].chart.serieseList.length; jx < jxLen;) {

                this.chartList[ix].chart.removeSeries(jx);
                jxLen--;

            }
            this.chartList[ix].setChartSeries();
        }
        seriese  = null;
        serverId = null;

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * 모니터링 WAS 목록을 변경(선택)된 WAS 목록으로 재설정.
     * 화면에서 WAS 또는 그룹(Host, Business)을 선택하는 경우 호출.
     *
     * # TP, E2E 화면 추가와 관련하여 개선된 사항
     * 선택된 서버 정보가 차트 화면에서 모니터링 하고 있는 서버에 해당 하는지 확인하여
     * 모니터링하고 있는 서버에 대해서만 필터 처리를 하도록 수정함.
     *
     * @param {string[]} wasNameList - WAS명 배열
     */
    frameChange: function(wasList) {
        var ix, ixLen;
        var serverList = Ext.Array.intersect(this.serverNameArr, wasList);

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            this.chartList[ix].setVisibleSeries(serverList);
        }

        this.drawChart();

        serverList = null;
        wasList    = null;
    },


    /**
     * Change Chart Line & Label Colors
     */
    changeChartColors: function() {
        var serverId;
        var seriese;
        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.chartList[ix].chart.serieseList.length; jx < jxLen; jx++) {
                seriese = this.chartList[ix].chart.serieseList[jx];
                if (seriese) {
                    serverId = seriese.id;
                    seriese.color = realtime.serverColorMap[this.openViewType][serverId];
                    this.chartList[ix].chart.toolTip.removeSeries(seriese);
                    this.chartList[ix].chart.toolTip.addSeries(seriese);
                }
            }
            this.chartList[ix].setChartSeries();
        }
        seriese  = null;
        serverId = null;

        this.drawData();
    },


    /**
     * 차트 확대/축소
     */
    toggleExpand: function() {
        var me = this;
        var $expandToggle = $('#'+me.id+' .was-stat-chart-tools .statchart-expand');

        $expandToggle.on('click', function() {
            var expandChartIdx = Math.floor($(this).attr('index'));
            var expandChartCmp = Ext.getCmp(me.chartId[expandChartIdx]);

            me.beforeRowIndex = Math.ceil((expandChartIdx + 1) / 3);
            me.beforePanelId = me.background.items.keys[me.beforeRowIndex - 1];

            if (expandChartIdx < 3) {
                me.beforeColIndex = expandChartIdx;
            } else {
                me.beforeColIndex = expandChartIdx - (3 * Math.floor(expandChartIdx / 3));
            }

            var ix;
            if (this.isExpand) {
                this.isExpand = false;

                for (ix = 0; ix < 6; ix++) {
                    Ext.getCmp(me.chartId[ix]).setVisible(true);
                }
                me.hideExpandView(expandChartCmp);
            } else {
                this.isExpand = true;

                for (ix = 0; ix < 6; ix++) {
                    Ext.getCmp(me.chartId[ix]).setVisible(false);
                }
                me.showExpandView(expandChartCmp);
            }

            me.drawChart();

            expandChartCmp = null;
            expandChartIdx = null;
            $expandToggle  = null;
        });

    },

    /**
     * @note 한 차트를 자세히 보기 위해 확장하는 함수
     * @param chart
     */
    showExpandView: function(chart) {

        this.expandView.show();
        chart.setVisible(true);
        this.expandView.add(chart);
        this.fireEvent('resize', this);

        chart = null;
    },

    /**
     * @note 확장된 차트를 숨기는 함수
     * @param chart
     */
    hideExpandView: function(chart){

        this.expandView.hide();
        Ext.getCmp(this.beforePanelId).insert(this.beforeColIndex, chart);
        this.fireEvent('resize', this);

        chart = null;
    }

});
