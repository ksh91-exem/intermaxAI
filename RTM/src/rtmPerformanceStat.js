Ext.define('rtm.src.rtmPerformanceStat', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Performance Stat'),
    layout: 'fit',

    chartRows : 2,      // 가로 갯수  Max 4
    chartCols : 3,      // 세로 갯수  Max 4

    showToolMenu : true,    // 프레임 전체에 적용되는 옵션 아이콘 사용 여부

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_CHART, this);
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

        this.psWasStatList = [];

        if (this.componentId == null) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.txnOption = Comm.RTComm.getChartOption(this.componentId);

        this.chartRows = this.txnOption.defaultLayout[0] || 2;
        this.chartCols = this.txnOption.defaultLayout[1] || 3;

        this.psStatData = {
            statdata    : [],
            psServerList: []
        };
        this.psDataCount = 30;
        this.waitTarget  = null;

        this.wasStatNameList = Comm.RTComm.getWasStatIdArr();
        this.wasStatNameList[this.wasStatNameList.length] = 'TIME';

    },

    init: function() {

        this.initProperty();

        this.initTrendData();

        this.initViewStat();

        var ix = 0, jx = 0, kx = 0;

        this.psStatData.psServerList.length = 0;

        for (ix = 0; ix < this.serverIdArr.length; ix++) {
            this.psStatData.psServerList.push(this.serverIdArr[ix]);
        }

        this.statListCount = this.psWasStatList.length;

        for (ix = 0; ix < this.psWasStatList.length; ix++) {
            this.psStatData.statdata[ix] = [];

            for (jx = 0; jx < this.psStatData.psServerList.length; jx++) {
                this.psStatData.statdata[ix][jx] = [];
                this.psStatData.statdata[ix][jx][0] = 0;   // WASID

                if (this.psStatData.statdata[ix][jx][1] == null){
                    this.psStatData.statdata[ix][jx][1] = [];
                }

                for (kx = 0 ; kx < this.psDataCount; kx ++ ) {
                    this.psStatData.statdata[ix][jx][1].push(null);  // DATA
                }
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

        var rowPanel;
        var colPanel;
        var chartIdx = 0;
        this.chartLayer = [];

        var chartCount = this.chartRows * this.chartCols;

        for (ix = 0; ix < this.chartRows; ix++) {
            rowPanel = this.getRowChartPanel();

            for (jx = 0; jx < this.chartCols; jx++) {
                colPanel = this.getColChartPanel(chartIdx++, ((chartCount <= 1)? false : true));
                this.chartId[this.chartId.length] = colPanel.id;
                this.chartLayer.push(colPanel);
                rowPanel.add(colPanel);
            }

            this.background.add(rowPanel);

            rowPanel = null;
            colPanel = null;
        }

        for (ix = 0; ix < chartCount; ix++) {
            this.chartList[ix] = Ext.create('rtm.src.rtmPerformanceStatChart');

            this.chartList[ix].target = Ext.getCmp(this.chartId[ix]);
            this.chartList[ix].parent = this;
            this.chartList[ix].chartOption = this.txnOption.chartOption;
            this.chartList[ix].statName = this.psWasStatList[ix];
            this.chartList[ix].setTitle(Comm.RTComm.getStatNameById(this.psWasStatList[ix]));

            this.chartLayer[ix].add(this.chartList[ix]);
            this.chartList[ix].init();
        }

        this.toggleExpand();

        if (this.selectedServerNames.length > 0 && this.selectedServerNames.length !== this.serverIdArr.length) {
            this.frameChange(this.selectedServerNames);
        }

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_CHART, this);

        ix   = null;
        jx   = null;
        kx   = null;
    },


    initViewStat: function() {

        // Intermax_RTM_WasStatList 정보에 추가되면서
        // 기존에 설치되어 사용하던 곳에서 에러가 발생할 수 있기에 변경하는 로직을 추가.
        if (Comm.web_env_info.Intermax_RTM_WasStatList) {
            Comm.RTComm.saveWasStatList(this.componentId, Comm.web_env_info.Intermax_RTM_WasStatList);
            common.WebEnv.del_config('Intermax_RTM_WasStatList');
        }

        var ix, ixLen;
        var statCount = this.chartRows * this.chartCols;
        var statData = Comm.RTComm.getDashboardWasChartStat(this.componentId);

        if (statData) {
            this.psWasStatList = statData.split(',');

            var saveOptions = this.getSaveChartOptions();
            if (!realtime.isDashboardView && statCount > this.psWasStatList.length && statCount <= saveOptions.length) {
                this.psWasStatList = saveOptions.concat();
            }

            Comm.RTComm.saveWasStatList(this.componentId, this.psWasStatList.join(','));

        } else {
            var envKey = Comm.RTComm.getEnvKeyWasChart();
            var viewData;

            if (!Comm.web_env_info[envKey]) {
                this.setDefaultViewData();

            } else {
                if (realtime.viewOriginalData[envKey] != null) {
                    Comm.web_env_info[envKey] = realtime.viewOriginalData[envKey];
                }
                viewData = JSON.parse(Comm.web_env_info[envKey]).data;

                if (Ext.isObject(viewData)) {
                    if (viewData[this.componentId]) {
                        this.psWasStatList = viewData[this.componentId].split(',');
                    } else {
                        this.setDefaultViewData();
                    }

                } else if (Ext.isString(viewData)) {
                    this.psWasStatList = viewData.split(',');

                } else {
                    this.setDefaultViewData();
                }

                if (this.psWasStatList.length < statCount) {
                    for (ix = this.psWasStatList.length; ix < statCount; ix++) {
                        this.psWasStatList[this.psWasStatList.length] = realtime.defaultWasStatName[ix].id;
                    }
                    Comm.RTComm.saveWasStatList(this.componentId, this.psWasStatList.join(','));
                }
            }
        }

        // 동시접속자수 지표가 삭제됨에 따라 기존에 저장된 경우 변경하는 코드를 추가.
        // 기존에 저장되어 있는 경우 액티브 사용자수로 변경하며 액티브 사용자 수가 지정되어 있는 경우
        // 지정되지 않은 다른 지표로 변경하도록 처리.
        // 해당 코드는 5.2.16.12.22 이전 버전에서만 필요한 코드임.
        var index = this.psWasStatList.indexOf('WAS_SESSION');
        if (index === -1) {
            return;
        }

        if (this.psWasStatList.indexOf('ACTIVE_USERS') === -1) {
            this.psWasStatList[index] = 'ACTIVE_USERS';

        } else {
            for (ix = 0, ixLen = realtime.InfoWasStatName.length; ix < ixLen; ix++) {
                if (this.psWasStatList.indexOf(realtime.InfoWasStatName[ix].id) === -1) {
                    this.psWasStatList[index] = realtime.InfoWasStatName[ix].id;
                }
            }
        }
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
                    envWasStatList[envWasStatList.length] = realtime.defaultWasStatName[ix].id;
                }
            }
        }
        return envWasStatList;
    },


    setDefaultViewData: function() {
        var statCount = this.chartRows * this.chartCols;

        for (var ix = 0; ix < statCount; ix++) {
            this.psWasStatList[this.psWasStatList.length] = realtime.defaultWasStatName[ix].id;
        }
        Comm.RTComm.saveWasStatList(this.componentId, this.psWasStatList.join(','));
    },


    initTrendData: function() {

        var ix, ixLen;
        var jx, jxLen;
        var kx, kxLen;
        var wasid;
        var statName;

        for (ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            wasid = this.serverIdArr[ix];

            if (!Repository.trendChartData[wasid]) {
                Repository.trendChartData[wasid] = {};
                Repository.trendDataLog[wasid]   = {};

                for (jx = 0, jxLen = this.wasStatNameList.length; jx < jxLen; jx++) {
                    statName = this.wasStatNameList[jx];

                    Repository.trendChartData[wasid][statName] = 0;
                    Repository.trendDataLog[wasid][statName]   = [];

                    for (kx = 0, kxLen = this.psDataCount; kx < kxLen; kx++) {
                        Repository.trendDataLog[wasid][statName].push(null);
                    }
                }
            }
        }

        ix = null;
        jx = null;
        kx = null;
        ixLen    = null;
        jxLen    = null;
        kxLen    = null;
        wasid    = null;
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
            flex   : 1
        });
    },

    getColChartPanel: function(index, isDisplayIcon) {
        var iconDisplay = (isDisplayIcon === false)? 'none' : 'block';

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
        var ix, jx, cx, kx, ixLen;
        var wasid, statname, statValue, isDown;

        var serverCount = this.serverIdArr.length;

        for (ix = 0, ixLen = this.psWasStatList.length; ix < ixLen; ix++) {
            statname = this.psWasStatList[ix];

            for (jx = 0; jx < serverCount; jx++) {
                wasid = this.serverIdArr[jx];

                // 처리될 데이터 개수가 화면에 보여지는 서버 개수보다 적은 경우 빈 값을 설정하여 추가
                if (!this.psStatData.statdata[ix][jx] && this.psStatData.statdata[ix].length < this.serverIdArr.length) {
                    this.psStatData.statdata[ix][jx]    = [];
                    this.psStatData.statdata[ix][jx][0] = wasid;   // WASID

                    if (!this.psStatData.statdata[ix][jx][1]) {
                        this.psStatData.statdata[ix][jx][1] = [];
                    }

                    for (kx = 0 ; kx < this.psDataCount; kx ++ ) {
                        this.psStatData.statdata[ix][jx][1].push(null);  // Init Data
                    }
                }

                this.psStatData.statdata[ix][jx][0] = wasid;

                // 화면에서 보여지는 서버에 해당하는 값이 없는 경우 데이터 설정을 하지 않는다.
                if (!Repository.trendDataLog[wasid]) {
                    continue;
                }

                isDown = Comm.RTComm.isDownByServer(wasid);

                for (cx = 0; cx < this.psDataCount; cx++) {
                    statValue = isDown? null : Repository.trendDataLog[wasid][statname][cx];
                    this.psStatData.statdata[ix][jx][1][cx] = statValue;
                }
            }
        }

        if (this.loadingMask) {
            this.loadingMask.hide();
        }

        this.drawChart();

        ix    = null;
        jx    = null;
        cx    = null;
        wasid = null;
        statname = null ;
    },


    drawChart: function() {
        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp !== true && !this.floatingLayer) {
            return;
        }

        var statName, statId;

        for (var ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            statId = this.psWasStatList[ix];

            if (statId === 'TXN_ELAPSE') {
                this.chartFixed = 3;
            } else if (statId === 'ACTIVE_DB_SESSIONS') {
                this.chartFixed = 1;
            } else {
                this.chartFixed = 0;
            }

            if (realtime.maxHundredStatData.indexOf(statId) !== -1) {
                this.chartMaxValue = 100;
            } else {
                this.chartMaxValue = null;
            }

            statName = Comm.RTComm.getStatNameById(statId);

            if (this.chartList[ix].title !== statName) {
                this.chartList[ix].setTitle(statName);
            }
            this.chartList[ix].drawData(Repository.trendChartData.timeRecordData, this.psStatData.statdata[ix], this.chartFixed, this.chartMaxValue);
        }

        ix        = null;
        ixLen     = null;
        statName  = null;
    },


    /**
     * 모니터링 WAS 목록을 변경(선택)된 WAS 목록으로 재설정.
     * 화면에서 WAS 또는 그룹(Host, Business)을 선택하는 경우 호출.
     *
     * # TP, E2E 화면 추가와 관련하여 개선된 사항
     * 선택된 서버 정보가 차트 화면에서 모니터링 하고 있는 서버에 해당 하는지 확인하여
     * 모니터링하고 있는 서버에 대해서만 필터 처리를 하도록 수정함.
     *
     * @param {string[]} serverNameList - WAS 명 배열
     */
    frameChange: function(serverNameList) {
        var ix, ixLen;
        var serverList = Ext.Array.intersect(this.serverNameArr, serverNameList);

        for (ix = 0, ixLen = this.chartList.length; ix < ixLen; ix++) {
            this.chartList[ix].setVisibleSeries(serverList);
        }

        this.drawChart();

        serverList     = null;
        serverNameList = null;
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
     * 차트 옵션(갯수) 변경
     */
    changeOption: function() {

        var ix, jx, kx;
        var rowPanel, colPanel;
        var chartIdx = 0;

        this.txnOption = Comm.RTComm.getChartOption(this.componentId, true);

        this.chartRows = this.txnOption.defaultLayout[0];
        this.chartCols = this.txnOption.defaultLayout[1];

        this.background.removeAll(true);
        this.chartId = [];

        this.chartList.length = 0;
        this.chartLayer.length = 0;

        this.isExpand = false;
        this.expandView.removeAll();
        this.expandView.hide();

        var chartCount = this.chartRows * this.chartCols;

        if (chartCount - this.psWasStatList.length > 0) {
            for (ix = this.psWasStatList.length; ix < chartCount; ix++) {

                for (kx = 0; kx < realtime.defaultWasStatName.length; kx++) {
                    if (this.psWasStatList.indexOf(realtime.defaultWasStatName[kx].id) === -1) {
                        this.psWasStatList[ix] = realtime.defaultWasStatName[kx].id;
                        break;
                    }
                }
            }
        } else if (this.psWasStatList.length > chartCount){
            this.psWasStatList.length = chartCount;
        }

        for (ix = 0; ix < this.psWasStatList.length; ix++) {
            this.psStatData.statdata[ix] = [];

            for (jx = 0; jx < this.psStatData.psServerList.length; jx++) {
                this.psStatData.statdata[ix][jx] = [];
                this.psStatData.statdata[ix][jx][0] = 0;   /* WASID        */

                if ( !this.psStatData.statdata[ix][jx][1] ){
                    this.psStatData.statdata[ix][jx][1] = [];
                }

                for (kx = 0 ; kx < this.psDataCount; kx ++ ) {
                    this.psStatData.statdata[ix][jx][1].push(null);  /* DATA         */
                }
            }
        }

        this.statListCount = this.psWasStatList.length;

        for (ix = 0; ix < this.chartRows; ix++) {
            rowPanel = this.getRowChartPanel();

            for (jx = 0; jx < this.chartCols; jx++) {
                colPanel = this.getColChartPanel(chartIdx++, ((chartCount <= 1)? false : true));
                this.chartId[this.chartId.length] = colPanel.id;
                this.chartLayer.push(colPanel);
                rowPanel.add(colPanel);
            }

            this.background.add(rowPanel);

            rowPanel = null;
            colPanel = null;
        }

        for (ix = 0; ix < chartCount; ix++) {
            this.chartList[ix] = Ext.create('rtm.src.rtmPerformanceStatChart');
            this.chartList[ix].parent = this;
            this.chartList[ix].chartOption = this.txnOption.chartOption;
            this.chartList[ix].statName = this.psWasStatList[ix];
            this.chartList[ix].setTitle(Comm.RTComm.getStatNameById(this.psWasStatList[ix]));

            this.chartLayer[ix].add(this.chartList[ix]);
            this.chartList[ix].init();
        }

        this.updateStorage();

        this.toggleExpand();

        if (this.selectedServerNames.length > 0 && this.selectedServerNames.length !== this.serverIdArr.length) {
            this.frameChange(this.selectedServerNames);
        }

        this.drawData();

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
     * 실시간 지표 변경
     */
    changeStat: function(oldCaption, statname) {
        var index;

        // 동일한 Stat은 동작하지 않는다.
        statname   = statname.replace(/ /gi, '_');
        oldCaption = oldCaption.replace(/ /gi, '_');

        if (this.psWasStatList.indexOf(statname) === -1) {
            if (oldCaption === common.Util.TR('Concurrent_Users')) {
                oldCaption = 'WAS_SESSION';
                index = this.psWasStatList.indexOf(oldCaption);
            } else {
                index = this.psWasStatList.indexOf(oldCaption);
            }
            if (index !== -1) {
                if (statname === common.Util.TR('CONCURRENT_USERS')) {
                    statname = 'WAS_SESSION';
                }

                this.psWasStatList[index] = statname;
                this.updateStorage();
                this.loadStatData(index, statname);
            }
        } else {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('StatName is already registered.'));
        }

        index      = null;
        statname   = null;
        oldCaption = null;
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
     * 변경된 실시간 지표 정보 저장
     */
    updateStorage: function() {
        var tmpWasList = '';
        for (var ix = 0; ix < this.psWasStatList.length; ix++) {
            tmpWasList += Comm.RTComm.getStatIdByName(this.psWasStatList[ix]);

            if (ix < this.psWasStatList.length-1) {
                tmpWasList += ',';
            }
        }
        Comm.RTComm.saveWasStatList(this.componentId, tmpWasList);

        tmpWasList = null;
        ix         = null ;
    },


    /**
     * @note 차트 확대/축소
     */
    toggleExpand: function() {
        var me = this;
        var $expandToggle = $('#'+me.id+' .was-stat-chart-tools .statchart-expand');

        $expandToggle.on('click', function() {
            var expandChartIdx = Math.floor($(this).attr('index'));
            var expandChartCmp = Ext.getCmp(me.chartId[expandChartIdx]);
            var ix, ixLen;

            me.beforeRowIndex = Math.ceil((expandChartIdx + 1) / me.chartCols);
            me.beforePanelId = me.background.items.keys[me.beforeRowIndex - 1];

            if (expandChartIdx < me.chartCols) {
                me.beforeColIndex = expandChartIdx;
            } else {
                me.beforeColIndex = expandChartIdx - (me.chartCols * Math.floor(expandChartIdx / me.chartCols));
            }

            if (me.isExpand) {
                me.isExpand = false;

                for (ix = 0, ixLen = me.chartRows * me.chartCols; ix < ixLen; ix++) {
                    Ext.getCmp(me.chartId[ix]).setVisible(true);
                }
                me.hideExpandView(expandChartCmp);
            } else {
                me.isExpand = true;

                for (ix = 0, ixLen = me.chartRows * me.chartCols; ix < ixLen; ix++) {
                    Ext.getCmp(me.chartId[ix]).setVisible(false);
                }
                me.showExpandView(expandChartCmp);
            }

            me.refreshChartData();

            ix    = null;
            ixLen = null;
            expandChartIdx = null;
            expandChartCmp = null;
            $expandToggle  = null;
        });

    },


    /**
     * 한 차트를 자세히 보기 위해 확장하는 함수
     *
     * @param {Object} chart - 확장 차트 콤포넌트
     */
    showExpandView: function(chart) {

        this.expandView.show();
        chart.setVisible(true);
        this.expandView.add(chart);
        this.fireEvent('resize', this);

        chart = null;
    },


    /**
     * 확장된 차트를 숨기는 함수
     *
     * @param {Object} chart - 확장 차트 콤포넌트
     */
    hideExpandView: function(chart){

        this.expandView.hide();
        Ext.getCmp(this.beforePanelId).insert(this.beforeColIndex, chart);
        this.fireEvent('resize', this);

        chart = null;
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
                        trendChart   : me.target
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
