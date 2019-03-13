Ext.define('rtm.src.rtmServiceStatTrend', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('Service Stat'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',

    SQL: null,

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

    // 쿼리를 실행한 시간
    isRunningTime   : null,

    // 차트를 그릴지 체크하는 항목
    isDrawStopChart : false,

    sqlBystat: {
        'concurrent_user' :  'IMXRT_ServiceStat_ConcurrentUsers.sql',
        'tps'             :  'IMXRT_ServiceStat_TPS.sql',
        'txn_count'       :  'IMXRT_ServiceStat_TxnCount.sql',
        'avgrage_elapse'  :  'IMXRT_ServiceStat_TxnElapse.sql',
        'request_rate'    :  'IMXRT_ServiceStat_RequestRate.sql',
        'lastTime'        :  'IMXRT_ServiceStat_LastTime.sql'
    },


    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);

            this.isClosedDockForm = true;

            this.chartId = null;
            this.selectWasList = null;
        },
        activate: function() {
            if (this.lastExcuteTime != null && this.lastExcuteTime != this.beforeLastestTime) {
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

        this.chartId   = [];

        this.compareCnt = 1439;

        this.yesterdayData = [];
        this.todayData     = [];

        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        var statId = Comm.RTComm.getDashboardServiceStat(this.componentId);

        if (statId == null) {
            statId = Comm.RTComm.getServiceStatList(this.componentId);
        } else {
            Comm.RTComm.saveServiceStatList(this.componentId, [statId]);
        }

        var ix;

        if (statId != null) {
            for (ix = 0; ix < realtime.serviceStatList.length; ix++) {
                if (statId == realtime.serviceStatList[ix].id) {
                    this.chartTitle = common.Util.TR(realtime.serviceStatList[ix].name);
                    this.SQL = this.sqlBystat[statId];
                    break;
                }
            }
        }

        if (this.chartTitle == null) {
            this.SQL = 'IMXRT_ServiceStat_ConcurrentUsers.sql';
            this.chartTitle = common.Util.TR('Today Concurrent Users');
        }

        for (ix = 0; ix < 1440; ix++) {
            this.yesterdayData[ix] = [ix,0,0];
            this.todayData[ix]     = [ix,0,0];
        }

        this.selectWasList = [];

        if (this.selectedServerIdArr.length > 0 && this.serverIdArr.length !== this.selectedServerIdArr.length) {
            this.selectWasList = this.selectedServerIdArr.concat();

        } else {
            this.selectWasList = this.serverIdArr.concat();
        }

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this,
            type  : 'small-circleloading'
        });
    },

    init: function() {

        this.initProperty();

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

        var infoDom = this.background.getEl().dom;
        var maxValueInfo = infoDom.appendChild(document.createElement('div'));
        maxValueInfo.className = 'servicestat-value';

        var maxLabel = maxValueInfo.appendChild(document.createElement('div'));
        maxLabel.className = 'box maxtext maxLabel';
        maxLabel.textContent = common.Util.TR('MAX') + ': ';

        this.maxTInfo = maxValueInfo.appendChild(document.createElement('div'));
        this.maxTInfo.className = 'box maxtext maxToday';
        this.maxTInfo.textContent = 0;

        var maxFlag = maxValueInfo.appendChild(document.createElement('div'));
        maxFlag.className = 'box maxtext flag';
        maxFlag.textContent = ' / ';

        this.maxYInfo = maxValueInfo.appendChild(document.createElement('div'));
        this.maxYInfo.className = 'box maxtext maxYesterday';
        this.maxYInfo.textContent = 0;

        var rowPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '2 2 1 2',
            width  : '100%',
            border : false,
            bodyCls: 'servicestat-chart-area',
            flex: 1
        });

        var colPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'servicestat-chart',
            layout : 'fit',
            margin : '2 2 1 2',
            flex   : 1,
            height : '100%',
            border : false
        });

        this.chartId = colPanel.id;

        rowPanel.add(colPanel);

        this.background.add(rowPanel);

        this.chart = Ext.create('rtm.src.rtmServiceStatTrendChart');
        this.chart.parent    = this;
        this.chart.parentId  = this.id;
        this.chart.setTitle(this.chartTitle);
        colPanel.add(this.chart);
        this.chart.init();

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_SERVICE_STAT, this);

        rowPanel   = null;
        colPanel   = null;
    },


    frameRefresh: function() {
        this.isDrawStopChart = false;

        setTimeout(this.refreshChartData.bind(this), 30);
    },


    frameStopDraw: function(){
        this.isDrawStopChart = true;
    },


    /**
     * 모니터링 서버 대상 변경
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
                idx = this.serverNameArr.indexOf(serverName);

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
     * 서비스 지표 변경.
     *
     * @param {String} statId 서비스 지표 ID
     */
    changeStat: function(statId) {

        this.isChangeStat = true;

        this.loadingMask.show();

        this.SQL = this.sqlBystat[statId];

        for (var ix = 0; ix < realtime.serviceStatList.length; ix++) {
            if (statId == realtime.serviceStatList[ix].id) {
                this.chart.setTitle(common.Util.TR(realtime.serviceStatList[ix].name));
                break;
            }
        }

        Comm.RTComm.saveServiceStatList(this.componentId, [statId]);

        this.refreshChartData();

        statId   = null;
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
            console.debug('%cService Stat Trend - Invalid Date: ' + realtime.lastestTime, 'color:#800000;background-color:silver;font-size:14px;');

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
            ds.sql_file = this.sqlBystat.lastTime;
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
    onServerTime: function(aheader, adata) {
        var isValidate = common.Util.checkSQLExecValid(aheader, adata);

        if (!isValidate) {
            realtime.lastServiceStatTime = null;
            return;
        }

        realtime.lastServiceStatTime = adata.rows[0][0];

        aheader = null;
        adata   = null;
    },


    /**
     * 설정된 지표에 해당하는 데이터를 조회.
     */
    queryRefresh: function() {

        var temp = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if ( Comm.RTComm.isValidDate(temp) !== true) {
            console.debug('%cService Stat Trend - Invalid Date: ' + realtime.lastestTime, 'color:#800000;background-color:silver;font-size:14px;');

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

        try {
            this.isRunningQuery = true;
            this.isRunningTime  = Date.now();

            WS.SQLExec({
                sql_file: this.SQL,
                bind: [{
                    name: 'fromtime', value: fromtime, type: SQLBindType.STRING
                }, {
                    name: 'totime',   value: totime, type: SQLBindType.STRING
                }],
                replace_string: [{
                    name: 'was_id',   value: value
                }]
            }, this.onData, this);
        } finally {
            temp        = null;
            fromtime    = null;
            totime      = null;
            value       = null;
        }
    },


    /**
     * 조회된 데이터를 차트에 그리기 위한 데이터로 구성.
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

            if (this.isChangeStat === true) {
                this.isChangeStat = false;
                this.loadingMask.hide();
            }
            return;
        }

        var today_compare, time;

        var temp = new Date(this.beforeLastestTime);

        var yesterdayTime = Ext.Date.format(Ext.Date.subtract(temp, Ext.Date.DAY, 1), 'Y-m-d 00:00:00');
        var todayTime     = Ext.Date.format(temp, 'Y-m-d 00:00:00');

        for ( var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++ ) {

            if ( ix <= this.compareCnt ) {
                time = +new Date(+new Date(yesterdayTime) + (ix * 60000));
                this.yesterdayData[ix] = [ time, adata.rows[ix][1] ];
            } else {
                today_compare = ix;
                today_compare -= 1440;

                time = +new Date(+new Date(todayTime) + (today_compare * 60000));
                this.todayData[today_compare] = [ time, adata.rows[ix][1] ];
            }
        }

        temp          = null;
        time          = null;
        today_compare = null;
        adata         = null;

        this.drawData();

        if (this.isChangeStat === true) {
            this.isChangeStat = false;
            this.loadingMask.hide();
        }
    },


    /**
     * 차트 그리기
     */
    drawData: function() {
        this.chart.drawData([this.yesterdayData, this.todayData]);
    },


    /**
     * 차트의 최대값 정보를 설정.
     */
    setMaxValueLabel: function(yVal, tVal) {
        this.maxYInfo.textContent = yVal;
        this.maxTInfo.textContent = tVal;
    }

});

