Ext.define('rtm.src.rtmServiceStat', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('Service Stat'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',

    isInitResize: true,

    chartRows : 2,
    chartCols : 2,

    yesterdayData: [],
    todayData    : [],

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

    // 쿼리를 실행한 시간
    isRunningTime   : null,

    // 차트를 그릴지 체크하는 항목
    isDrawStopChart : false,

    SQL: {
        byWas   : 'IMXRT_ServiceStat_byWas.sql',
        lastTime: 'IMXRT_ServiceStat_LastTime.sql'
    },

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);

            this.isClosedDockForm = true;

            if (this.serviceStatTooltip) {
                this.serviceStatTooltip.remove();
                this.serviceStatTooltip = null;
            }

            this.chartId = null;
        },
        activate: function() {
            if (this.lastExcuteTime && this.lastExcuteTime !== this.beforeLastestTime) {
                this.drawData();
            }
        },
        deactivate: function() {
            this.lastExcuteTime = this.beforeLastestTime;
        }
    },


    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);
        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.isDrawStopChart = false;
        this.isRunningQuery  = false;
        this.isRunningTime   = null;

        this.chartList = [];
        this.chartId   = [];

        this.chartRows = 2;
        this.chartCols = 2;

        this.compareCnt = 1439;

        this.yesterdayData[0] = [];
        this.yesterdayData[1] = [];
        this.yesterdayData[2] = [];
        this.yesterdayData[3] = [];

        this.todayData[0] = [];
        this.todayData[1] = [];
        this.todayData[2] = [];
        this.todayData[3] = [];

        var ix;

        for (ix = 0; ix < 1440; ix++) {
            this.yesterdayData[0][ix] = [ix,0,0];
            this.yesterdayData[1][ix] = [ix,0,0];
            this.yesterdayData[2][ix] = [ix,0,0];
            this.yesterdayData[3][ix] = [ix,0,0];
            this.todayData[0][ix] = [ix,0,0];
            this.todayData[1][ix] = [ix,0,0];
            this.todayData[2][ix] = [ix,0,0];
            this.todayData[3][ix] = [ix,0,0];
        }

        this.selectWasList = [];

        if (this.selectedServerIdArr.length > 0 && this.serverIdArr.length !== this.selectedServerIdArr.length) {
            this.selectWasList = this.selectedServerIdArr.concat();

        } else {
            this.selectWasList = this.serverIdArr.concat();
        }
    },

    init: function() {

        this.initProperty();

        // 메인 레이어
        this.background = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            cls    : 'servicestat-area'
        });

        // 확대 레이어
        this.expandView = Ext.create('Ext.container.Container', {
            layout: 'fit',
            hidden: true,
            cls   : 'servicestat-area-expandview'
        });

        this.add([this.background, this.expandView]);

        var ix, jx;
        var rowPanel;
        var colPanel;
        var chartIdx = 0;
        this.chartLayer = [];

        for (ix = 0; ix < this.chartRows; ix++) {
            rowPanel = this.getRowChartPanel();

            for (jx = 0; jx < this.chartCols; jx++) {
                colPanel = this.getColChartPanel(chartIdx++);
                this.chartId[this.chartId.length] = colPanel.id;
                this.chartLayer.push(colPanel);
                rowPanel.add(colPanel);
            }

            this.background.add(rowPanel);

            rowPanel = null;
            colPanel = null;
        }

        var chartCount = this.chartRows * this.chartCols;

        for (ix = 0; ix < chartCount; ix++) {
            this.chartList[ix] = Ext.create('rtm.src.rtmServiceStatChart');
            this.chartList[ix].parent = this;
            this.chartList[ix].chartIndex = ix;
            this.chartList[ix].setTitle(common.Util.CTR(realtime.serviceStatList2[ix].name));

            this.chartLayer[ix].add(this.chartList[ix]);

            this.chartList[ix].init();
        }

        this.maxTInfo = [];
        this.maxYInfo = [];

        var infoDom, maxValueInfo, maxLabel, maxFlag;

        for (ix = 0; ix < chartCount; ix++) {

            infoDom = this.chartLayer[ix].getEl().dom;
            maxValueInfo = infoDom.appendChild(document.createElement('div'));
            maxValueInfo.className = 'servicestat-value multi';

            maxLabel = maxValueInfo.appendChild(document.createElement('div'));
            maxLabel.className = 'box maxtext maxLabel';
            maxLabel.textContent = common.Util.TR('MAX') + ': ';

            this.maxTInfo[ix] = maxValueInfo.appendChild(document.createElement('div'));
            this.maxTInfo[ix].className = 'box maxtext maxToday';
            this.maxTInfo[ix].textContent = 0;

            maxFlag = maxValueInfo.appendChild(document.createElement('div'));
            maxFlag.className = 'box maxtext flag';
            maxFlag.textContent = ' / ';

            this.maxYInfo[ix] = maxValueInfo.appendChild(document.createElement('div'));
            this.maxYInfo[ix].className = 'box maxtext maxYesterday';
            this.maxYInfo[ix].textContent = 0;
        }

        this.toggleExpand();

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);

        ix = null;
        jx = null;
        chartIdx   = null;
        chartCount = null;

        infoDom      = null;
        maxValueInfo = null;
        maxLabel     = null;
        maxFlag      = null;
    },

    getRowChartPanel: function() {
        return Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '2 2 1 2',
            width  : '100%',
            border : false,
            bodyCls: 'servicestat-chart-area',
            flex: 1
        });
    },

    /**
     * 차트 패널을 반환.
     *
     * @param {Number} index
     */
    getColChartPanel: function(index) {
        return Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'servicestat-chart',
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

        setTimeout(this.refreshChartData.bind(this), 30);
    },


    frameStopDraw: function(){
        this.isDrawStopChart = true;
    },


    /**
     * 차트 확대/축소
     */
    toggleExpand: function() {
        var me = this;
        var $expandToggle = $('#'+me.id+' .was-stat-chart-tools .statchart-expand');

        $expandToggle.on('click', function() {
            me.expandChartIdx = Math.floor($(this).attr('index'));
            var expandChartCmp = Ext.getCmp(me.chartId[me.expandChartIdx]);
            var ix, ixLen;

            me.beforeRowIndex = Math.ceil((me.expandChartIdx + 1) / me.chartCols);
            me.beforePanelId = me.background.items.keys[me.beforeRowIndex - 1];

            if (me.expandChartIdx < me.chartCols) {
                me.beforeColIndex = me.expandChartIdx;
            } else {
                me.beforeColIndex = me.expandChartIdx - (me.chartCols * Math.floor(me.expandChartIdx / me.chartCols));
            }

            if (me.isExpand === true) {
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

            expandChartCmp = null;
            $expandToggle  = null;
        });

    },


    /**
     * 한 차트를 자세히 보기 위해 확장하는 함수
     *
     * @param {Object} chart
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
     * @param {Object} chart
     */
    hideExpandView: function(chart){
        this.expandView.hide();
        Ext.getCmp(this.beforePanelId).insert(this.beforeColIndex, chart);
        this.fireEvent('resize', this);

        chart = null;
    },


    /**
     * 모니터링 서버 대상 변경
     * 예) Server ID가 자동 추가/해제 될 경우 실행.
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * Change Selected WAS.
     * Execute in rtmView.frameChange().
     *
     * @param {string[]} serverNameList - 서버명 배열
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

        this.selectWasList = serverIdArr;

        serverIdArr    = null;
        serverNameList = null;

        this.refreshChartData();
    },


    /**
     * 서비스 지표 차트를 일정주기로 업데이트.
     *
     * 각 컴포넌트에서 업데이트 처리하던 것을 RTMDataManager에서 일괄 관리하도록 변경.
     */
    refreshChartData: function() {

        if (this.isDrawStopChart) {
            return;
        }

        /*
         * 쿼리가 실행되고 있는지 체크하고 있는 시간이 2분이 넘는 경우 체크값을 초기화한다.
         * 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행유무를 체크하는 항목
         */
        if (Date.now() - this.isRunningTime > 120000) {
            this.isRunningQuery = false;
        }

        if (!this.isRunningQuery) {
            this.getLastStatTime();

            this.queryRefresh();
        }
    },


    /**
     * 서비스 지표 데이터의 마지막 시간 값을 조회
     *
     * [스펙]
     * 마지막 시간 값을 가지고 차트에 표시되는 기준선의 위치를 설정한다.
     * 기존에는 현재 시간 값으로 기준선 위치를 계산하여 표시하였으나 xapm_service_stat 테이블에
     * 데이터 추가가 늦어지는 경우 화면에서 0 으로 보여지는 문제가 발생되어 기준선을 표시하는
     * 기준을 변경함 (17-05-29 협의함.)
     */
    getLastStatTime: function() {
        var temp = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(temp) !== true) {
            console.debug('%cService Stat - Invalid Date: ' + realtime.lastestTime, 'color:#800000;background-color:silver;font-size:14px;');

            if (this.beforeLastestTime == null) {
                this.beforeLastestTime = +new Date();
            }
            temp = new Date(this.beforeLastestTime);
        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        var fromtime = Ext.Date.format(Ext.Date.subtract(temp, Ext.Date.DAY, 1), 'Y-m-d 00:00:00.000');
        var totime   = Ext.Date.format(temp, 'Y-m-d 23:59:00.000');

        var value;
        if (this.selectWasList.length <= 0) {
            value = -1;
        } else {
            value = this.selectWasList.join(',');
        }

        var ds = {};
        ds.bind = [{ name: 'fromtime', value: fromtime, type: SQLBindType.STRING },
                   { name: 'totime',   value: totime,   type: SQLBindType.STRING }];
        ds.replace_string = [{ name: 'was_id', value: value }];

        try {
            ds.sql_file = this.SQL.lastTime;
            WS.SQLExec(ds, this.onServerTime, this);
        } finally {
            temp        = null;
            fromtime    = null;
            totime      = null;
            value       = null;
            ds.bind     = null;
            ds.sql_file = null;
            ds          = null;
        }
    },


    /**
     * 서비스 지표 데이터의 마지막 시간 값을 설정
     *
     * @param {object} aheader
     * @param {object} adata
     */
    onServerTime: function(aheader, adata){
        var isValidate = common.Util.checkSQLExecValid(aheader, adata);

        if (!isValidate) {
            realtime.lastServiceStatTime = null;
            return;
        }

        realtime.lastServiceStatTime = adata.rows[0][0];

        aheader = null;
        adata   = null;
    },


    queryRefresh: function() {
        var temp = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(temp) !== true) {
            console.debug('%cService Stat - Invalid Date: ' + realtime.lastestTime, 'color:#800000;background-color:silver;font-size:14px;');

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            temp = new Date(this.beforeLastestTime);
        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        var fromtime = Ext.Date.format(Ext.Date.subtract(temp, Ext.Date.DAY, 1), 'Y-m-d 00:00:00.000');
        var totime   = Ext.Date.format(temp, 'Y-m-d 23:59:00.000');

        var value;
        if (this.selectWasList.length <= 0) {
            value = -1;
        } else {
            value = this.selectWasList.join(',');
        }

        var ds = {};
        ds.bind = [{ name: 'fromtime', value: fromtime, type: SQLBindType.STRING },
                   { name: 'totime',   value: totime, type: SQLBindType.STRING }];
        ds.replace_string = [{ name: 'was_id', value: value }];

        try {
            this.isRunningQuery = true;
            this.isRunningTime  = Date.now();

            ds.sql_file = this.SQL.byWas;
            WS.SQLExec(ds, this.onData, this);
        } finally {
            temp        = null;
            fromtime    = null;
            totime      = null;
            value       = null;
            ds.bind     = null;
            ds.sql_file = null;
            ds          = null;
        }
    },

    /**
     * Parse data
     *
     * @param {Object} aheader
     * @param {Object} adata
     */
    onData: function(aheader, adata) {
        this.isRunningQuery = false;

        if (this.isClosedDockForm === true) {
            return;
        }

        var isValidate = common.Util.checkSQLExecValid(aheader, adata);

        if (!isValidate) {
            return;
        }

        var today_compare, time;

        var temp = new Date(this.beforeLastestTime);
        var yesterdayTime = Ext.Date.format(Ext.Date.subtract(temp, Ext.Date.DAY, 1), 'Y-m-d 00:00:00');
        var todayTime     = Ext.Date.format(temp, 'Y-m-d 00:00:00');

        for ( var ix = 0, ixLen = adata.rows.length ; ix < ixLen; ix++ ) {
            if ( ix <= this.compareCnt ) {
                time = +new Date(+new Date(yesterdayTime) + (ix * 60000));

                this.yesterdayData[0][ix] = [ time, adata.rows[ix][1] ] ;
                this.yesterdayData[1][ix] = [ time, adata.rows[ix][2] ] ;
                this.yesterdayData[2][ix] = [ time, adata.rows[ix][4] ] ;
                this.yesterdayData[3][ix] = [ time, adata.rows[ix][3] ] ;
            } else {
                today_compare = ix ;
                today_compare -= 1440 ;

                time = +new Date(+new Date(todayTime) + (today_compare * 60000));

                this.todayData[0][today_compare] = [ time, adata.rows[ix][1] ] ;
                this.todayData[1][today_compare] = [ time, adata.rows[ix][2] ] ;
                this.todayData[2][today_compare] = [ time, adata.rows[ix][4] ] ;
                this.todayData[3][today_compare] = [ time, adata.rows[ix][3] ] ;
            }
        }

        today_compare = null;
        time          = null;
        adata         = null;
        temp          = null;

        this.drawData();
    },


    /**
     * Draw Chart
     */
    drawData: function() {
        if (!this.chartList) {
            return;
        }
        this.chartList[0].drawData( [this.yesterdayData[0], this.todayData[0]] );
        this.chartList[1].drawData( [this.yesterdayData[1], this.todayData[1]] );
        this.chartList[2].drawData( [this.yesterdayData[2], this.todayData[2]] );
        this.chartList[3].drawData( [this.yesterdayData[3], this.todayData[3]] );
    },


    /**
     * 차트의 최대값 정보를 설정.
     */
    setMaxValueLabel: function(index, yVal, tVal) {
        this.maxYInfo[index].textContent = yVal;
        this.maxTInfo[index].textContent = tVal;
    }

});
