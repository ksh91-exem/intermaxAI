Ext.define('rtm.src.rtmWebResponseStatus', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Response Status Code'),
    layout: 'fit',

    listeners: {
        beforedestroy: function() {
            this.stopRefreshData();
            this.refreshTimer = null;
        }
    },

    initProperty: function() {
        this.monitorType  = 'WEB';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.monitorType);
        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.chartId   = [];

        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.txnOption = Comm.RTComm.getChartOption(this.componentId);

        this.psStatData = {
            statdata    : []
        };
        this.psDataCount = 30;
        this.waitTarget  = null;

        this.statusCodeList = realtime.ResponseStatusKeys.concat();
        this.statusCodeList[this.statusCodeList.length] = 'TIME';
    },


    init: function() {

        this.initProperty();

        this.initTrendData();

        var jx, kx;

        for (jx = 0; jx < realtime.ResponseStatusKeys.length; jx++) {
            this.psStatData.statdata[jx] = [];

            this.psStatData.statdata[jx][0] = 0;    // WASID --> Stat Code ID
            this.psStatData.statdata[jx][1] = [];   // Data
            this.psStatData.statdata[jx][2] = '';   // Color

            for (kx = 0 ; kx < this.psDataCount; kx ++ ) {
                this.psStatData.statdata[jx][1].push(0);  // Init data
            }
        }

        // 메인 레이어
        this.background = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            cls    : 'gcstat-area'
        });

        this.add(this.background);

        this.chartLayer = [];

        var rowPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '2 2 0 2',
            width  : '100%',
            border : false,
            bodyCls: 'gcstat-chart-area',
            flex   : 1
        });

        var colPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'gcstat-chart',
            layout : 'fit',
            margin : '2 2 0 2',
            flex   : 1,
            height : '100%',
            border : false,
            html   : '<div class="was-stat-chart-tools"><div class="statchart-expand" style="display:none;" index="0">'
        });

        this.chartId[this.chartId.length] = colPanel.id;
        this.chartLayer.push(colPanel);

        rowPanel.add(colPanel);

        this.bottomLayer = Ext.create('Exem.Container',{
            width  : '100%',
            height : 23,
            cls    : 'rtm-response-status-bottom',
            layout: {
                type: 'hbox',
                align: 'middle',
                pack: 'center'
            },
            margin : '0 0 0 0'
        });

        this.chartLegend = Ext.create('Ext.container.Container',{
            margin: '2 0 0 0',
            cls   : 'rtm-response-status-code legendLabel',
            html  : //'<div class="icon informational"></div><div class="label">' + common.Util.TR('1xx') + '</div>'+
                    //'<div class="icon success"></div><div class="label">'       + common.Util.TR('2xx') + '</div>'+
                    //'<div class="icon redirection"></div><div class="label">'   + common.Util.TR('3xx') + '</div>'+
                    '<div class="icon client-errors"></div><div class="label">' + common.Util.TR('4xx') + '</div>'+
                    '<div class="icon server-errors"></div><div class="label">' + common.Util.TR('5xx') + '</div>'
        });
        this.bottomLayer.add(this.chartLegend);

        this.background.add(rowPanel, this.bottomLayer);

        rowPanel = null;
        colPanel = null;

        this.chart = Ext.create('rtm.src.rtmWebResponseStatusChart');
        this.chart.target      = Ext.getCmp(this.chartId[0]);
        this.chart.parent      = this;
        this.chart.chartOption = this.txnOption.chartOption;
        this.chart.setTitle(common.Util.CTR('Response Status Code'));

        this.chartLayer[0].add(this.chart);
        this.chart.init();

        if (this.selectedServerNames.length > 0 && this.selectedServerNames.length !== this.serverIdArr.length) {
            this.frameChange(this.selectedServerNames);
        }

        this.refreshChartData();

    },


    initTrendData: function() {
        var ix, ixLen, jx, jxLen, kx, kxLen;
        var serverId, statName;

        for (ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            serverId = this.serverIdArr[ix];

            if (!Repository.responseStatus[serverId]) {
                Repository.responseStatus[serverId] = {};
                Repository.responseStatusLog[serverId] = {};

                for (jx = 0, jxLen = this.statusCodeList.length; jx < jxLen; jx++) {
                    statName = this.statusCodeList[jx];

                    Repository.responseStatus[serverId][statName] = 0;
                    Repository.responseStatusLog[serverId][statName] = [];

                    for (kx = 0, kxLen = this.psDataCount; kx < kxLen; kx++) {
                        Repository.responseStatusLog[serverId][statName].push(0);
                    }
                }
            }
        }

    },


    /**
     * 데이터 새로고침을 중지.
     */
    stopRefreshData: function(){
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },


    /**
     * 차트 새로고침 (3초 주기)
     */
    refreshChartData: function() {
        this.stopRefreshData();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (this.isDrawStopChart || !isDisplayCmp) {
            return;
        }

        this.drawChartData();

        this.refreshTimer = setTimeout(this.refreshChartData.bind(this), 1000 * 3);
    },


    frameRefresh: function() {
        this.isDrawStopChart = false;

        this.refreshChartData();
    },


    frameStopDraw: function(){
        this.isDrawStopChart = true;
    },


    /**
     * Response Status Code 현황 차트 그리기
     */
    drawChartData: function() {
        var ix, ixLen, jx, cx;
        var serverId;
        var statName;

        var serverCount = this.selectedServerIdArr.length;

        for (ix = 0, ixLen = realtime.ResponseStatusKeys.length; ix < ixLen; ix++) {
            statName = realtime.ResponseStatusKeys[ix].toUpperCase();

            for (cx = 0; cx < this.psDataCount; cx++) {

                for (jx = 0; jx < serverCount; jx++) {
                    serverId = this.selectedServerIdArr[jx];

                    if (jx === 0) {
                        this.psStatData.statdata[ix][1][cx] = Repository.responseStatusLog[serverId][statName][cx];

                    } else {
                        this.psStatData.statdata[ix][1][cx] += Repository.responseStatusLog[serverId][statName][cx];
                    }
                }
            }

            this.psStatData.statdata[ix][0] = statName;
            this.psStatData.statdata[ix][2] = realtime.ResponseStatusColors[ix];
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

        this.chart.drawData(
            //Repository.responseStatus.timeRecordData,
            Repository.WebTrendData.timeRecordData,
            this.psStatData.statdata,
            this.chartFixed,
            this.chartMaxValue
        );
    },


    /**
     * 모니터링 Web 서버 목록을 변경(선택)된 WAS 목록으로 재설정.
     * 화면에서 Web 서버 또는 그룹(Host, Business)을 선택하는 경우 호출.
     *
     * @param {string[]} serverList - 서버 명 배열
     */
    frameChange: function(serverNameList) {
        var serverIdArr = [];
        var idx, serverName;

        if (serverNameList) {
            for (var i = 0, icnt = serverNameList.length; i < icnt; ++i) {
                serverName = serverNameList[i];
                idx = this.serverNameArr.indexOf(serverName) ;

                if (idx === -1 ) {
                    continue;
                }
                serverIdArr[serverIdArr.length] = +this.serverIdArr[idx];
            }
        }

        if (serverIdArr.length <= 0) {
            serverIdArr = this.serverIdArr.concat();
        }

        this.selectedServerIdArr = serverIdArr;

        serverIdArr    = null;
        serverNameList = null;

        this.refreshChartData();
    }


});
