Ext.define('rtm.src.rtmBizElapseMonitor', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Response Time') + '(ms)',
    layout: 'fit',
    id    : 'rtmBizElapseMonitor',

    dataCount: 30,

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_CHART, this);
        }
    },

    initProperty: function() {
        var ix, ixLen;
        var tierId, tierName, bizId, bizName;
        var date, latestTime;

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_CHART, this);

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.tierIdArr   = [];
        this.tierNameArr = [];

        this.bizIdArr   = [];
        this.bizNameArr = [];

        this.chartList = [];
        this.chartId   = [];

        this.statdata = {};

        for (ix = 0, ixLen = Comm.sortTierInfo.length; ix < ixLen; ix++) {
            tierId   = Comm.sortTierInfo[ix].tierId;
            tierName = Comm.sortTierInfo[ix].tierName;

            this.tierIdArr.push(tierId);
            this.tierNameArr.push(tierName);
        }

        for (ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++) {
            bizId   = Comm.businessRegisterInfo[ix].parent.bizId;
            bizName = Comm.businessRegisterInfo[ix].parent.bizName;

            this.bizIdArr.push(bizId);
            this.bizNameArr.push(bizName);
        }

        if (!Repository.BizTrendData.timeRecordData || !Repository.BizTrendData.timeRecordData.length) {
            Repository.BizTrendData.timeRecordData = [];

            latestTime = new Date(realtime.lastestTime).getTime() || new Date().getTime();

            for (ix = 0; ix < 30; ix++) {
                date = new Date(latestTime - (ix * 1000 * 3));
                Repository.BizTrendData.timeRecordData.unshift(date.getTime());
            }
        }

        this.initStatData();
    },

    init: function() {
        var ix, jx;
        var rowPanel, colPanel;

        this.initProperty();

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

        this.chartLayer = [];

        rowPanel = this.getRowChartPanel();

        for (jx = 0; jx < this.tierIdArr.length; jx++) {
            colPanel = this.getColChartPanel();
            this.chartId[this.chartId.length] = colPanel.id;
            this.chartLayer.push(colPanel);
            rowPanel.add(colPanel);
        }

        this.background.add(rowPanel);

        for (ix = 0; ix < this.tierIdArr.length; ix++) {
            this.chartList[ix] = Ext.create('rtm.src.rtmBizElapseMonitorChart');
            this.chartList[ix].target = Ext.getCmp(this.chartId[ix]);
            this.chartList[ix].parent = this;
            this.chartList[ix].statName = 'TXN_ELAPSE';

            this.chartList[ix].setTitle(common.Util.CTR('Response Time') + '(ms)');

            this.chartLayer[ix].add(this.chartList[ix]);
            this.chartList[ix].init();
        }

        this.refreshChartData();
    },

    initStatData: function() {
        var ix, ixLen, jx, jxLen, cx, cxLen, tierId, bizId;

        for (ix = 0, ixLen = this.tierIdArr.length; ix < ixLen; ix++) {
            tierId = this.tierIdArr[ix];

            this.statdata[tierId] = [];

            for (jx = 0, jxLen = this.bizIdArr.length; jx < jxLen; jx++) {
                bizId = this.bizIdArr[jx];
                this.statdata[tierId][bizId] = [];
                this.statdata[tierId][bizId][0] = 0;
                this.statdata[tierId][bizId][1] = [];
                this.statdata[tierId][bizId][2] = '';
                this.statdata[tierId][bizId][3] = 0;

                for (cx = 0, cxLen = this.dataCount; cx < cxLen; cx++) {
                    this.statdata[tierId][bizId][1].push(null);
                }
            }
        }
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

    getColChartPanel: function() {
        return Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'gcstat-chart',
            layout : 'fit',
            margin : '2 2 1 2',
            flex   : 1,
            height : '100%',
            border : false
        });
    },

    frameRefresh: function() {
        this.isDrawStopChart = false;
        this.refreshChartData();
    },


    frameStopDraw: function() {
        this.isDrawStopChart = true;
    },


    /**
     * 실시간 차트를 그리기 전에 데이터 설정
     */
    drawData: function() {
        var ix, ixLen, jx, jxLen, kx, kxLen;
        var tierId, treeKey, statValue, bizId;
        var bizData, topBizId, bizIdList, tierIdList;

        this.initStatData();

        if (!Repository ||
            !Repository.BizTrendDataLog) {
            return;
        }

        bizIdList = Object.keys(Repository.BizTrendDataLog);

        for (ix = 0, ixLen = bizIdList.length; ix < ixLen; ix++) {
            bizId = bizIdList[ix];
            bizData = Repository.BizTrendDataLog[bizId];

            if (!Comm.etoeBizInfos[bizId]) {
                continue;
            }

            tierIdList = Object.keys(bizData);

            for (jx = 0, jxLen = tierIdList.length; jx < jxLen; jx++) {
                tierId = tierIdList[jx];

                if (!Comm.tierInfo[tierId]) {
                    continue;
                }
                treeKey = bizData[tierId].TREE_KEY;

                if (+tierId === 0 || !treeKey) {
                    continue;
                }

                topBizId = +treeKey.split('-')[0];

                this.statdata[tierId][topBizId][0] = topBizId;

                for (kx = 0, kxLen = this.dataCount; kx < kxLen; kx++) {
                    statValue = Repository.BizTrendDataLog[bizId][tierId].TXN_ELAPSE[kx];
                    this.statdata[tierId][topBizId][1][kx] += statValue;
                }
                this.statdata[tierId][topBizId][3]++;
            }
        }


        tierIdList = Object.keys(this.statdata);

        for (ix = 0, ixLen = tierIdList.length; ix < ixLen; ix++) {
            tierId = tierIdList[ix];
            bizIdList = Object.keys(this.statdata[tierId]);

            for (jx = 0, jxLen = bizIdList.length; jx < jxLen; jx++) {
                bizId = bizIdList[jx];
                if (this.statdata[tierId][bizId][3] !== 0) {
                    for (kx = 0, kxLen = this.statdata[tierId][bizId][1].length; kx < kxLen; kx++) {
                        this.statdata[tierId][bizId][1][kx] /= this.statdata[tierId][bizId][3];
                    }
                }
            }
        }

        this.drawChart();
    },

    /**
     * 실시간 GC 지표 차트 그리기
     */
    drawChart: function() {
        var ix, ixLen, isDisplayCmp, timeRecordData;

        isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        timeRecordData = Repository.BizTrendData.timeRecordData;

        if (!isDisplayCmp && !this.floatingLayer) {
            return;
        }

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            this.chartFixed = 2;

            this.chartList[ix].drawData(timeRecordData, this.statdata[this.tierIdArr[ix]], this.chartFixed);
        }
    }
});
