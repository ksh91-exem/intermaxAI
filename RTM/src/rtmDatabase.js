Ext.define('rtm.src.rtmDatabase', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('DB Statistics'),
    layout: 'fit',
    width : '100%',
    height: '100%',
    border: true,

    timerIncChart: null,

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.DBSTAUTS, me);

            this.stopRefreshData();
            this.timerIncChart = null;

            this.stopStatCheckRefresh();
        }
    },

    init: function() {

        this.dataInit();

        this.initLayout();

        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }

        this.frameRefresh();

        this.starStatCheckRefresh();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.DBSTAUTS, this);
    },


    /**
     * 기본 화면 레이어 구성
     */
    initLayout: function() {
        var self = this;

        this.background = Ext.create('Exem.Container', {
            layout: 'vbox',
            width : '100%',
            height: '100%',
            cls   : 'rtm-database-base'
        });

        this.topContentsArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 0 0 0'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 15',
            cls    : 'header-title',
            text   : common.Util.CTR('DB Statistics')
        });

        this.topContentsArea.add(this.frameTitle);

        this.statGuideIcon = Ext.create('Ext.container.Container',{
            width : 110,
            height: 18,
            margin: '2 10 0 0',
            cls   : 'rtm-database-guide-icon'
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin : '2 19 0 0',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function(){
                        this.dockContainer.toggleExpand(this);
                    }, this);
                }
            }
        });

        this.topContentsArea.add([{xtype: 'tbfill', flex: 1 }, this.statGuideIcon, this.expendIcon ]);

        this.statGroupArea = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            flex  : 1,
            margin: '0 10 10 10',
            listeners: {
                render: function(s) {
                    Ext.get(s.id).dom.addEventListener('mousewheel', function (e) {
                        self.dbStatChart.moveScroll(e.wheelDelta);
                    }, false);     // Webkit browsers and IE9+

                    Ext.get(s.id).dom.addEventListener('DOMMouseScroll', function (e) {
                        self.dbStatChart.moveScroll(e.wheelDelta);
                    }, false); // Firefox
                }
            }
        });

        var viewDBList = [];
        for (var ix = 0, len = this.viewdblist.length; ix < len; ix++) {
            viewDBList[viewDBList.length] = {
                id  : this.viewdblist[ix],
                name: Comm.dbInfoObj[this.viewdblist[ix]].instanceName
            };
        }

        this.dbStatChart = Ext.create('rtm.src.rtmDatabaseChart',{
            instanceList: viewDBList
        });
        this.statGroupArea.add(this.dbStatChart);

        this.background.add([this.topContentsArea, this.statGroupArea]);

        this.add(this.background);

        this.dbStatChart.init();
    },


    /**
     * 기본 데이터 구조 설정
     */
    dataInit: function() {

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        // 표시할 DB 목록
        this.viewdblist = [];
        this.data = {};

        var dbid;
        var ix, jx;

        for (ix = 0; ix < Comm.activateDB.length; ix++) {
            dbid = Comm.activateDB[ix][0];
            this.viewdblist[this.viewdblist.length] = dbid;

            this.data[dbid] = {};
            this.data[dbid] = {
                dbdown       : false,
                rtsdown      : false,
                alertStatus  : 0,
                releaseCount : 1,
                cpuobj       : '',
                alertStatusColor : realtime.normalColor,
                data: {
                    cpu       : 0,
                    lock      : 0,
                    cpuLevel  : 0,
                    lockLevel : 0,
                    'active sessions'        : [],
                    'total sessions'         : [],
                    'session logical reads'  : [],
                    'physical reads'         : [],
                    'execute count'          : [],
                    'opened cursors current' : []
                }
            };

            for (jx = 0; jx < this.datacount; jx++) {
                this.data[dbid].data['active sessions'       ].push(0);
                this.data[dbid].data['total sessions'        ].push(0);
                this.data[dbid].data['session logical reads' ].push(0);
                this.data[dbid].data['physical reads'        ].push(0);
                this.data[dbid].data['execute count'         ].push(0);
                this.data[dbid].data['opened cursors current'].push(0);
            }
        }
    },


    /**
     * DB Stat을 체크하는 로직 중지
     */
    stopStatCheckRefresh: function() {
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
        }
    },


    /**
     * DB Stat 데이터가 설정된 시간동안 발생하지 않으면 '0'으로 클리어. (16.01.28 요청)
     */
    starStatCheckRefresh: function() {
        this.stopStatCheckRefresh();

        var dbId;
        var dataObj;

        for (var ix = 0, ixLen = Comm.activateDB.length; ix < ixLen; ix++) {
            dbId = Comm.activateDB[ix][0];
            this.lastStatTime = Repository.DBCpuLastTime[dbId];

            if (this.lastStatTime && +new Date() - this.lastStatTime > 10000) {
                dataObj = this.data[dbId];

                if (dataObj) {
                    dataObj.data.cpu = 0;
                }
            }
        }

        dbId = null;
        dataObj = null;

        this.refreshTimerId = setTimeout(this.starStatCheckRefresh.bind(this), 5000);
    },


    /**
     * 데이터 새로고침 중지
     */
    stopRefreshData: function(){
        if (this.timerIncChart) {
            clearTimeout(this.timerIncChart);
        }
    },


    /**
     * DB 상태 정보 새로고침
     */
    frameRefresh: function() {
        this.stopRefreshData();

        this.drawData();

        this.timerIncChart = setTimeout(this.frameRefresh.bind(this), 3000);
    },


    /**
     * DB 상태 정보 업데이트
     */
    drawData: function() {

        if (this.dbStatChart.dbObjList) {

            var dbObj, dbid, status;
            var activeCnt, lockCnt, cpuCnt;

            for (var ix = 0, len = this.viewdblist.length; ix < len; ix++) {

                dbid  = this.viewdblist[ix];
                dbObj = this.dbStatChart.dbObjList[dbid];
                if (!dbObj) {
                    continue;
                }
                status = Comm.Status.DB[dbid];

                // Active Sessions
                activeCnt = this.data[dbid].data['active sessions'][this.dataindex];
                dbObj.activeCount.textContent = activeCnt || 0;

                // Lock
                lockCnt = this.data[dbid].data.lock;
                dbObj.lockCount.textContent = lockCnt || 0;

                // CPU
                cpuCnt = this.data[dbid].data.cpu;
                dbObj.cpuCount.textContent = cpuCnt || 0;

                if (this.data[dbid].data.lock > 0) {
                    dbObj.lockEl.style.visibility = 'visible';
                    dbObj.lockEl.style.cursor     = 'pointer';
                    dbObj.lockEl.style.backgroundColor = realtime.criticalColor;
                } else {
                    dbObj.lockEl.style.visibility = 'hidden';
                    dbObj.lockEl.style.cursor     = 'default';
                    dbObj.lockEl.style.backgroundColor = realtime.normalColor;
                }

                if (status === 'Server Hang' || status === 'Server Down') {
                    dbObj.cpuEl.classList.add('down');
                    dbObj.cpuEl.style.backgroundColor = realtime.dbChartColor.down;
                    dbObj.cpuCount.textContent = 'DOWN';

                    dbObj.activeEl.style.backgroundColor = realtime.dbChartColor.down;
                    dbObj.activeEl.style.borderWidth = '0px';
                    dbObj.activeCount.textContent = '';

                    dbObj.lockEl.style.visibility = 'hidden';
                    dbObj.lockCount.textContent = '';

                    dbObj.alertStatusName = status;

                } else if (status === 'Disconnected') {
                    dbObj.cpuEl.classList.add('disconnect');
                    dbObj.cpuEl.style.backgroundColor = realtime.dbChartColor.down;
                    dbObj.cpuCount.textContent = 'Disconnect';

                    dbObj.activeEl.style.backgroundColor = realtime.dbChartColor.down;
                    dbObj.activeEl.style.borderWidth = '0px';
                    dbObj.activeCount.textContent = '';

                    dbObj.lockEl.style.visibility = 'hidden';
                    dbObj.lockCount.textContent = '';

                    dbObj.alertStatusName = status;

                } else {
                    dbObj.cpuEl.classList.remove('down');
                    dbObj.cpuEl.classList.remove('disconnect');
                    dbObj.activeEl.style.borderWidth = '1px';

                    if (Comm.RTComm.isDown(dbObj.alertStatusName)) {
                        this.setAlertStatus(dbid, 0);
                    }
                }
            }

            dbObj  = null;
            status = null;
            dbid   = null;
        }
    },


    /**
     * 실시간 CPU 데이터 로드
     *
     * @private
     * @param {Object} adata
     */
    _onCPUData: function(adata) {

        var dbid;
        var cpu;
        var pCpu;
        var dataObj;

        dbid = adata.rows[0][1];
        cpu  = adata.rows[0][3];

        dataObj = this.data[dbid];

        if (dataObj) {
            pCpu = Math.round(cpu/100);
            dataObj.data.cpu = pCpu;
        }

        dbid    = null;
        cpu     = null;
        pCpu    = null;
        adata   = null;
        dataObj = null;
    },


    /**
     * 실시간 DB Stat 데이터 로드
     *
     * @private
     * @param {Object} adata
     */
    _onStatData: function(adata) {

        var d;
        var dbid;
        var statname, statvalue;
        var dataObj;
        var ix, len, jx;

        if (adata && adata.rows) {
            if (this.data == null) {
                return;
            }
            for (ix = 0, len = adata.rows.length; ix < len; ix++) {
                d         = adata.rows[ix];
                dbid      = d[1];
                statname  = d[4];
                statvalue = Number(d[5]);

                dataObj = this.data[dbid];

                if (!dataObj) {
                    continue;
                }

                if (statname === 'lock waiting sessions') {
                    dataObj.data.lock = statvalue;
                } else {
                    dataObj.data[statname][this.dataindex] = statvalue;
                }
            }
        } else {
            var dbData;
            var key1, key2;
            var dbDataKeys;

            var dataKeys = Object.keys(this.data);

            for (ix = 0; ix < dataKeys.length; ix++) {
                key1 = dataKeys[ix];
                dbData = this.data[key1].data;
                dbDataKeys = Object.keys(dbData);

                for (jx = 0; jx < dbDataKeys.length; jx++) {
                    key2 = dbDataKeys[jx];
                    dbData[key2][this.dataindex] = 0;
                }
            }

            dataKeys   = null;
            dbDataKeys = null;
            dbData     = null;
        }

        adata     = null;
        statvalue = null;
        statname  = null;
        dbid      = null;
        d         = null;
        dataObj   = null;
    },


    /**
     * DB CPU 및 Stat 데이터 로드
     * RTMDataManager.frameGroup에서 사용
     *
     * @param {Object} data
     */
    onData: function(adata) {
        if (!adata || !this.data) {
            return;
        }

        if (Comm.activateDB.length === 0) {
            return;
        }

        if (adata.rows != null && adata.rows.length > 0) {
            if (adata.rows[0].length === 5 || adata.rows[0].length === 4) { // 멀티게더 고도화에  의해 REPO seq가 추가됨
                // CPU Usage
                this._onCPUData(adata);

            } else if (adata.rows[0].length === 7 || adata.rows[0].length === 6) { // 멀티게더 고도화에  의해 REPO seq가 추가됨
                // DB Stat
                this._onStatData(adata);
            }
        }
        adata = null;
    },


    /**
     * 이벤트 알람 데이터
     * RTMDataManager.frameGroup에서 사용
     *
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3:WEB-SERVER)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type
     * 9: descr
     *
     * @param {Object} data
     */
    onAlarm: function(adata) {
        if (!adata) {
            return;
        }

        if (adata[1] !== 2) {
            return;
        }

        this.alarmData = adata;

        this.drawAlarm();

        adata = null;
    },


    /**
     * 알람 정보 표시
     */
    drawAlarm: function() {
        var data = this.alarmData;

        var server_id   = data[2];
        var alert_name  = data[4];
        var alert_level = data[6];

        switch (alert_name) {
            case realtime.alarms.SERVER_DOWN :
                this.DB_Down_ON(server_id);
                break;

            case realtime.alarms.DISCONNECTED :
                this.RTS_Disconnected_ON(server_id);
                break;

            case realtime.alarms.CONNECTED :
            case realtime.alarms.SERVER_BOOT :
                this.DB_Down_OFF(server_id);
                this.RTS_Disconnected_OFF(server_id);
                this.setAlertStatus(server_id, 0);
                break;

            case 'active sessions' :
            case 'ACTIVE SESSIONS' :
                this.setAlertStatus(server_id, 0);
                break;

            default:
                this.setAlertStatus(server_id, alert_level);
                break;
        }
        alert_name  = null;
        alert_level = null;
        server_id   = null;
        data        = null;
    },


    /**
     * @private
     * @param {String} dbid
     */
    RTS_Disconnected_ON: function(dbid) {
        if (this.data && this.data[dbid]) {
            this.data[dbid].rtsdown = true;

            var dbObj = this.dbStatChart.dbObjList[dbid];

            dbObj.cpuEl.classList.add('disconnect');
            dbObj.activeEl.style.backgroundColor = realtime.dbChartColor.down;
            dbObj.activeCount.textContent        = '';
            dbObj.cpuEl.style.backgroundColor    = realtime.dbChartColor.down;
            dbObj.cpuCount.textContent           = 'Disconnect';
            dbObj.lockEl.style.visibility        = 'hidden';
            dbObj.lockCount.textContent          = '';
            dbObj.alertStatusName                = Comm.Status.DB[dbid];

            dbObj = null;
        }
    },


    /**
     * @private
     * @param {String} dbid
     */
    RTS_Disconnected_OFF: function(dbid) {
        if (this.data && this.data[dbid]) {
            this.data[dbid].rtsdown = false;

            var dbObj = this.dbStatChart.dbObjList[dbid];

            dbObj.cpuEl.classList.remove('disconnect');
            dbObj.activeEl.style.backgroundColor = realtime.normalColor;
            dbObj.activeCount.textContent        = '';
            dbObj.cpuEl.style.backgroundColor    = realtime.normalColor;
            dbObj.cpuCount.textContent           = '';
            dbObj.lockEl.style.visibility        = 'hidden';
            dbObj.lockCount.textContent          = '';
            dbObj.alertStatusName                = Comm.Status.DB[dbid];

            dbObj = null;
        }
    },


    /**
     * @private
     * @param {String} dbid
     */
    DB_Down_ON: function(dbid) {
        if (this.data && this.data[dbid]) {
            this.data[dbid].dbdown = true;

            var dbObj = this.dbStatChart.dbObjList[dbid];

            dbObj.cpuEl.classList.add('down');
            dbObj.activeEl.style.backgroundColor = realtime.dbChartColor.down;
            dbObj.activeCount.textContent        = '';
            dbObj.cpuEl.style.backgroundColor    = realtime.dbChartColor.down;
            dbObj.cpuCount.textContent           = 'DOWN';
            dbObj.lockEl.style.visibility        = 'hidden';
            dbObj.lockCount.textContent          = '';
            dbObj.alertStatusName                = Comm.Status.DB[dbid];

            dbObj = null;
        }
    },


    /**
     * @private
     * @param {String} dbid
     */
    DB_Down_OFF: function(dbid) {
        if (this.data && this.data[dbid]) {
            this.data[dbid].dbdown = false;

            var dbObj = this.dbStatChart.dbObjList[dbid];
            dbObj.cpuEl.classList.remove('down');
            dbObj.cpuEl.classList.remove('disconnect');

            dbObj.activeEl.style.backgroundColor = realtime.normalColor;
            dbObj.activeCount.textContent        = '';
            dbObj.cpuEl.style.backgroundColor    = realtime.normalColor;
            dbObj.cpuCount.textContent           = '';
            dbObj.lockEl.style.visibility        = 'hidden';
            dbObj.lockCount.textContent          = '';
            dbObj.alertStatusName                = Comm.Status.DB[dbid];

            dbObj = null;
        }
    },


    /**
     *
     * @param {String} dbid
     * @param {String} alertstatus
     */
    setAlertStatus: function(dbid, alertstatus) {

        if (!this.data || !this.data[dbid]) {
            return;
        }

        var dbObj;

        this.data[dbid].alertStatus = alertstatus;

        for (var ix = 0, len = this.viewdblist.length; ix < len; ix++) {
            if (this.state && ix > 3) {
                continue;
            }

            this.data[dbid].alertStatusColor = this.getAlarmColor(alertstatus);

            if (this.viewdblist[ix] === dbid) {
                this.data[dbid].releaseCount++;
                if (this.data[dbid].releaseCount > 1) {
                    this.data[dbid].releaseCount = 2;
                }

                dbObj = this.dbStatChart.dbObjList[dbid];
                dbObj.activeEl.style.backgroundColor = this.data[dbid].alertStatusColor;
                dbObj.cpuEl.style.backgroundColor    = this.data[dbid].alertStatusColor;

                if (this.data[dbid].data.lock > 0 ) {
                    dbObj.lockEl.style.visibility = 'visible';
                    dbObj.lockEl.style.backgroundColor = realtime.criticalColor;
                } else {
                    dbObj.lockEl.style.visibility = 'hidden';
                    dbObj.lockEl.style.backgroundColor = this.data[dbid].alertStatusColor;
                }
            }
        }
    },


    getAlarmColor: function(status) {
        var color;
        switch(status) {
            case 0:
                color = realtime.normalColor;
                break;
            case 1:
                color = realtime.warningColor;
                break;
            case 2:
                color = realtime.criticalColor;
                break;
            default:
                break;
        }
        return color;
    }

});