Ext.define('rtm.src.rtmTierTrend', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Performance Stat'),
    layout: 'fit',

    chartRows : 3,      // 가로 갯수  Max 3
    chartCols : 1,      // 세로 갯수  Max 1

    showToolMenu : false,    // 프레임 전체에 적용되는 옵션 아이콘 사용 여부
    isDockFrame  : false,

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_CHART, this);
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.tierInfo[this.tierId].serverList;
        this.serverNameArr = [];

        for (var ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            this.serverNameArr.push(Comm.wasInfoObj[this.serverIdArr[ix]].wasName);
        }

        this.chartList = [];
        this.chartId   = [];

        this.psWasStatList  = [];
        this.psWasStatNames = [];

        if (this.componentId == null) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.txnOption = Comm.RTComm.getChartOption(this.componentId);

        this.lineColor = Comm.RTComm.getSumChartColor();

        if (!this.lineColor) {
            this.lineColor = '#3ca0ff';
            Comm.RTComm.saveSumChartColor('#3ca0ff');
        }

        this.psStatData = {
            statdata    : [],
            psServerList: []
        };
        this.psDataCount = 30;
        this.waitTarget  = null;

        if (this.tierType === 'APIM') {
            this.tierType = 'CD';
        }

        this.trendLog = {};

        if (this.tierType === 'CD') {
            this.trendData = Repository.CDTrendData;

        } else if (this.tierType === 'WEB') {
            this.trendData = Repository.WebTrendData;

        } else if (this.tierType === 'TP') {
            this.trendData = Repository.TP3SecTrendData;

        } else {
            this.trendData = Repository.trendChartData;
        }

        // 임시 타임 레코드 데이터
        this.tempTimerecordData = [];
        this.tempTimerecordData.length = 30;

        this.TOTAL_NAME = 'Total';
    },


    init: function() {

        this.initProperty();

        this.initTrendData();

        this.psWasStatList  = ['TPS', 'TXN_ELAPSE', 'ERROR_COUNT'];

        this.psWasStatNames = [
            common.Util.CTR('TPS'),
            common.Util.CTR('Response Time'),
            common.Util.CTR('err_cnt')
        ];

        this.psStatData.psServerList.length = 0;
        this.psStatData.psServerList.push(this.TOTAL_NAME);

        this.statListCount = this.psWasStatList.length;

        var ix, kx, jx;
        for (ix = 0; ix < this.psWasStatList.length; ix++) {
            this.psStatData.statdata[ix] = [];

            this.psStatData.statdata[ix][0] = [];
            this.psStatData.statdata[ix][0][0] = '';    // WAS
            this.psStatData.statdata[ix][0][1] = [];    // DATA
            this.psStatData.statdata[ix][0][2] = '';    // COLOR

            for (kx = 0 ; kx < this.psDataCount; kx ++ ) {
                this.psStatData.statdata[ix][0][1].push(0);  // DATA
            }
        }

        // 프레임 전체 옵션
        this.initAllTrendContextMenu();

        // 메인 레이어
        this.background = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            cls    : 'performance-area'
        });

        var topContentsArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '0 0 10 5',
            style  : {
                borderRadius: '5px'
            }
        });

        var frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '5 0 0 10',
            cls    : 'header-title',
            text   : this.tierName
        });

        topContentsArea.add(frameTitle);

        this.background.add(topContentsArea);

        this.add(this.background);

        var rowPanel, colPanel;
        var chartIdx = 0;
        this.chartLayer = [];

        var chartCount = this.chartRows * this.chartCols;

        for (ix = 0; ix < this.chartRows; ix++) {
            rowPanel = this.getRowChartPanel();

            for (jx = 0; jx < this.chartCols; jx++) {
                colPanel = this.getColChartPanel(chartIdx++, false);
                this.chartId[this.chartId.length] = colPanel.id;
                this.chartLayer.push(colPanel);
                rowPanel.add(colPanel);
            }

            this.background.add(rowPanel);

            rowPanel = null;
            colPanel = null;
        }

        for (ix = 0; ix < chartCount; ix++) {
            this.chartList[ix] = Ext.create('rtm.src.rtmTierTrendChart');

            this.chartList[ix].target  = Ext.getCmp(this.chartId[ix]);
            this.chartList[ix].parent  = this;
            this.chartList[ix].isTotal = true;
            this.chartList[ix].color   = this.lineColor;
            this.chartList[ix].chartOption = this.txnOption.chartOption[this.TOTAL_NAME];
            this.chartList[ix].statName = this.psWasStatList[ix];
            this.chartList[ix].setTitle(this.psWasStatNames[ix]);

            this.chartLayer[ix].add(this.chartList[ix]);
            this.chartList[ix].init();
        }

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_CHART, this);
    },


    /**
     * Get Save Chart Options
     *
     * @return {array}
     */
    getSaveChartOptions: function() {
        var envWasStatList = [];

        var envKey    = Comm.RTComm.getEnvKeyWasChart();
        var statCount = this.chartRows * this.chartCols;
        var viewData;

        if (Comm.web_env_info[envKey]) {

            if (realtime.viewOriginalData[envKey] != null) {
                viewData = JSON.parse(realtime.viewOriginalData[envKey]).data;
            } else {
                viewData = JSON.parse(Comm.web_env_info[envKey]).data;
            }

            if (Ext.isObject(viewData)) {
                if (viewData[this.componentId]) {
                    envWasStatList = viewData[this.componentId].split(',');
                }

            } else if (Ext.isString(viewData)) {
                envWasStatList = viewData.split(',');
            }

            if (envWasStatList.length < statCount) {
                for (var ix = envWasStatList.length; ix < statCount; ix++) {
                    envWasStatList[envWasStatList.length] = realtime.TierStat[ix].id;
                }
            }
        }
        return envWasStatList;
    },


    initTrendData: function() {

        var ix, ixLen, jx, jxLen, kx, kxLen;
        var serverId, serverType, statName, statNameList;

        for (ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            serverId = this.serverIdArr[ix];

            if (!this.trendData[serverId]) {
                this.trendData[serverId] = {};
                this.trendLog[serverId]  = {};

                serverType = Comm.RTComm.getServerTypeById(serverId);

                // 서버 타입에 따라 차트에 보여지는 데이터를 구분하여 표시
                if (serverType === 'TP') {
                    statNameList = Comm.RTComm.getTPStatIdArr();

                } else if (serverType === 'WEB') {
                    statNameList = Comm.RTComm.getWebStatIdArr();

                } else if (serverType === 'CD') {
                    statNameList = Comm.RTComm.getCDStatIdArr();

                } else {
                    statNameList = Comm.RTComm.getWasStatIdArr();
                }
                statNameList[statNameList.length] = 'TIME';

                for (jx = 0, jxLen = statNameList.length; jx < jxLen; jx++) {
                    statName = statNameList[jx];

                    this.trendData[serverId][statName] = 0;
                    this.trendLog[serverId][statName]  = [];

                    for (kx = 0, kxLen = this.psDataCount; kx < kxLen; kx++) {
                        this.trendLog[serverId][statName].push(0);
                    }
                }
            }
        }

        serverId = null;
        statName = null;
    },


    refreshChartData: function() {
        if (this.isDrawStopChart) {
            return;
        }

        if (this.statListCount !== this.psWasStatList.length) {
            this.changeOption();
            this.statListCount = this.psWasStatList.length;
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
            bodyCls: 'performance-chart-area',
            flex: 1
        });
    },


    getColChartPanel: function(index, isDisplayIcon) {
        var iconDisplay = (isDisplayIcon === false)? 'none':'block';

        return Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'performance-chart',
            layout : 'fit',
            margin : '2 2 1 2',
            flex   : 1,
            height : '100%',
            border : false,
            html   : '<div class="was-stat-chart-tools"><div class="statchart-expand" style="display:'+iconDisplay+';" index="'+index+'">'
        });
    },


    frameRefresh: function() {
        this.isDrawStopChart = false;
        this.refreshChartData();
    },


    frameStopDraw: function(){
        this.isDrawStopChart = true;
    },


    drawData: function() {
        var ix, jx, cx, ixLen;
        var serverId, serverType, statId;
        var sumData, value;

        var wasCount = this.serverIdArr.length;

        for (ix = 0, ixLen = this.psWasStatList.length; ix < ixLen; ix++) {
            statId = this.psWasStatList[ix].toUpperCase();

            this.psStatData.statdata[ix][0][0] = this.TOTAL_NAME;
            this.psStatData.statdata[ix][0][2] = this.lineColor;

            for (cx = 0; cx < this.psDataCount; cx++) {
                this.psStatData.statdata[ix][0][1][cx] = [];
                sumData = 0;

                for (jx = 0; jx < wasCount; jx++) {
                    serverId = this.serverIdArr[jx];

                    // 서버 타입에 따라 차트에 보여지는 데이터를 구분하여 표시
                    serverType = Comm.RTComm.getServerTypeById(serverId);

                    if (serverType === 'CD') {
                        this.trendLog = Repository.CDTrendDataLog;

                    } else if (serverType === 'WEB') {
                        this.trendLog = Repository.WebTrendDataLog;

                    } else if (serverType === 'TP') {
                        this.trendLog = Repository.TP3SecTrendLog;

                        // TP인 경우 지표 ID가 기본 지표 ID와 다른 부분이 있어 ID값을 TP에 맞게 변경함.
                        if (statId === 'TPS') {
                            statId = 'TP_TPS';

                        } else if (statId === 'TXN_ELAPSE') {
                            statId = 'AVERAGE';
                        }

                    } else {
                        this.trendLog = Repository.trendDataLog;
                    }

                    if (this.trendLog[serverId] && this.trendLog[serverId][statId]) {
                        value = Number(this.trendLog[serverId][statId][cx]);

                        // EtoE 화면에서 트랜잭션 수행시간을 밀리 세컨드 단위로 통일하여 보지게 해달라는 요청에 의해
                        // 밀리 세컨드 단위로 보여지게 수정함.
                        if (statId === 'TXN_ELAPSE' || statId === 'AVERAGE') {
                            if (serverType === 'CD') {
                                value = parseFloat(value / 1000); // 마이크로 단위에서 밀리세컨드 단위
                            } else {
                                value = parseFloat(value * 1000); // 초 단위에서 밀리세컨드 단위
                            }
                        }

                        sumData += value;
                    }
                }

                if (realtime.percentStatData.indexOf(statId) !== -1) {
                    sumData = parseFloat(sumData / wasCount);
                }

                this.psStatData.statdata[ix][0][1][cx] = sumData;
            }
        }

        if (this.loadingMask) {
            this.loadingMask.hide();
        }

        this.drawChart();
    },


    /**
     * 구간(Tier) 차트 그리기
     */
    drawChart: function() {
        var ix, ixLen, statName, statId;
        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (!isDisplayCmp && !this.floatingLayer) {
            return;
        }

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            statId = this.psWasStatList[ix];

            // TP와 다른 에이전트의 지표 ID가 달라서 타입을 체크해서 지표명을 설정하는데
            // EtoE 화면의 구간 차트에 표시되는 명칭은 에이전트 타입과 상관없이 동일하여서 관련 코드를 삭제함.

            // 수행시간인 경우에는 소수점 3자리까지 표시 처리함.
            if (statId === 'TXN_ELAPSE') {
                this.chartFixed = 3;
            } else {
                this.chartFixed = 0;
            }

            statName = Comm.RTComm.getTierStatNameById(statId);

            // EtoE 화면에서 트랜잭션 수행시간의 단위를 표시해달라는 요청으로 추가함.
            if (statId === 'TXN_ELAPSE') {
                statName += ' (ms)';
            }

            if (this.chartList[ix].title !== statName) {
                this.chartList[ix].setTitle(statName);
            }

            if (!this.trendData.timeRecordData) {
                this.chartList[ix].drawData(this.tempTimerecordData, this.psStatData.statdata[ix], this.chartFixed);
            } else {
                this.chartList[ix].drawData(this.trendData.timeRecordData, this.psStatData.statdata[ix], this.chartFixed);
            }
        }

        statName  = null;
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
    },


    /**
     * 화면에서 서버 또는 그룹을 선택하는 경우 실행. (rtmView.js에서 호출)
     *
     * @param {string[]} serverNameList - WAS 명 배열
     */
    frameChange: function() {
    },


    /**
     * Change Chart Line & Label Colors
     *
     * @param {string} color - Change Chart Color
     */
    changeSumChartColors: function(color) {
        var seriese;
        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.chartList[ix].chart.serieseList.length; jx < jxLen; jx++) {
                seriese = this.chartList[ix].chart.serieseList[jx];

                if (seriese) {
                    seriese.color = color;
                    this.chartList[ix].chart.toolTip.removeSeries(seriese);
                    this.chartList[ix].chart.toolTip.addSeries(seriese);
                }
            }
            this.chartList[ix].setChartSeries();
        }
        seriese  = null;

        this.drawData();
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

        if(! this.isRealTimeAnalysis){
            this.allTrendMenuContext.addItem({
                title : common.Util.TR('Display Option'),
                target: this,
                fn : function(me){
                    var colorNLine = Ext.create('rtm.src.rtmSumChartConfig',{
                        chartList    : me.target.chartList,
                        trendChart   : me.target,
                        isTotal      : true
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
    toolMenuFn: function(e){
        this.allTrendMenuContext.showAt({x : e.originalEvent.x, y: e.originalEvent.y});
    },


    /**
     * 차트에서 더블 클릭 시 선택된 구간에 트랜잭션 상세 정보를 보여주는 팝업창 표시
     */
    openTxnDetail: function() {
        var timeIndex = arguments[0];

        // 선택된 구간에 해당하는 시간 정보 가져오기
        var time = this.trendData.timeRecordData[timeIndex];

        // 데이터가 시간 포맷에 맞는지 확인
        var isDate = Comm.RTComm.isValidDate(new Date(time));

        if (!isDate) {
            return;
        }

        var currentWidth  = 1500;
        var currentHeight = 1000;

        var fT = new Date(new Date(+time).setMilliseconds(0) - 6000);
        var tT = new Date(new Date(+time).setMilliseconds(0) + 6000);

        // 트랜잭션 상세 정보를 조회하는데 필요한 값 설정
        var elapseDistRange = {
            fromTime   : Ext.Date.format( fT, 'Y-m-d H:i:s' ),
            toTime     : Ext.Date.format( tT, 'Y-m-d H:i:s' ),
            minElapse  : 0,
            maxElapse  : 100000000,
            clientIp   : '',
            txnName    : '',
            tid        : '',
            exception  : '',
            loginName  : '',
            monitorType: this.tierType,
            wasId      : this.serverIdArr.join(',')
        };

        localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(elapseDistRange));

        console.debug('%c [EtoE Tier Trend] Transaction Popup Parameters: ', 'color:#3191C8;',
            'FromTime: '  + elapseDistRange.fromTime,
            'ToTime: '    + elapseDistRange.toTime,
            'Server ID: ' + elapseDistRange.wasId
        );

        var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;

        // 모니터링 화면에서 서비스를 변경 시 팝업 창을 닫기 위해서 realtime.txnPopupMonitorWindow 를 설정함.
        window.selectedPopupMonitorType = this.tierType;
        realtime.txnPopupMonitorWindow = window.open('../txnDetail/txnDetail.html', 'hide_referrer_1', popupOptions);
    }

});
