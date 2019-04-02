/**
 * @note Repository 가 전역으로 먼저 선언된 이후 호출 되어야 한다.
 * Repository 에 대한정보는 Comm.js 파일에 선언되어 있다.
 * RTMDataManger 에서 관리하는 데이터를 사용하는 Frame은 destroy 이벤트를 추가하여
 * RTMDataManger 에 등록되어져 있는 자신의 frame 객체를 삭제해야 한다.(removeFrame)
 */
Ext.define ('common.RTMDataManager', {
    singleton       : true,
    option          : null,                                       // 각각의 실시간 데이터를 가공하기 위한 조건
    frameManager    : null,
    instanceList    : null,
    data            : null,

    initProperty    : function() {

        this.instanceList = Comm.wasNameArr;

        this.option = {};

        /**
         * TOP Transaction 데이터 업데이트 주기
         */
        this.throughput = {
            beforeTime: null,
            timeRange : 10 * 60 * 1000
        };

        this.data = {};

        /**
         * @note
         * 그룹 리스트가 정의된 오브젝트
         * addFrame, removeFrame 사용시 frameGroup에 정의되어 있는 변수명을 사용하여 frame을 추가,삭제한다.
         * 추가될 그룹이 있으면 여기에 순차적으로 추가
         */
        this.frameGroup = {
            ALERT              : '0',
            ALARM              : '1',
            SQLELASPEDTIME     : '2',
            DBSTAUTS           : '3',
            WASSTAT            : '4',
            GCSTAT             : '5',
            ACTIVETXN          : '6',
            ACTIVITY           : '7',
            PROCESS            : '8',
            CONNPOOL           : '9',
            LOCKINFO           : '10',
            WASTPS             : '11',
            PROCESS_STATUS     : '12',
            TOPOLOGY           : '13',
            TOPOLOGY_COUNT     : '14',
            REMOTE_TXN         : '15',
            WAS_CHART          : '16',
            WAS_SESSION_DATA   : 17,
            WEB_ACTIVE_DETAIL  : 18,
            WEB_ACTIVITY_FILTER: 19,
            WAS_SERVICE_STAT   : 20,
            END_BUSINESS_STAT  : 21,
            WAS_LOAD_PREDICT   : 22
        };

        // Frame 관리 객체
        this.frameManager = {};
        this.frameKeys    = {};

        this.alertmManager = {};

        var frameGroupKeys = Object.keys(this.frameGroup);
        var key = null, ix, ixLen;
        for (ix = 0, ixLen = frameGroupKeys.length; ix < ixLen; ix++) {
            key = frameGroupKeys[ix];
            this.frameManager[this.frameGroup[key]] = {};
            this.frameKeys[this.frameGroup[key]]    = [];
        }
        key = null;
        frameGroupKeys = null;

        this.agentManager = {};

        this.txnTrendData = {
            guidList : []
        };

        this.tempTxnTrendData = [];

        this.txnMonitorInfo = {
            data: null,
            range: 6,      // 6 분
            startIndex: 0
        };

        this.txnMonitorInfo.length   = this.txnMonitorInfo.range * 60;
        this.txnMonitorInfo.endIndex = this.txnMonitorInfo.length - 1;
        this.txnMonitorInfo.toTime   = +new Date(realtime.lastestTime);
        this.txnMonitorInfo.fromTime = this.txnMonitorInfo.toTime - (this.txnMonitorInfo.range  * 1000 * 60);

        // data[0] 가 fromTime. index가 증가 할수록 1초씩 증가 data[299]는 라스트 타임
        this.txnMonitorInfo.data = [];
        this.txnMonitorInfo.data.length = this.txnMonitorInfo.length;

        // 지나간 Transaction Monitor 데이터를 가져오는 SQL 실행 유무를 체크하기 위한 플래그.
        this.isBeforeDataSelect = false;
    },


    /**
     * 트랜잭션 모니터를 처음 표시 시 지난 데이터 가져오기
     */
    getTxnMonitorData: function() {
        // was stat 에서 라스트 타임을 갱신하기 떄문에 제대로된 라스트 타임으로 데이터를 불러오기 위해 일정시간 뒤에 트랜잭션 데이터를 불러온다.
        if (this.sqlExecTimerId) {
            clearTimeout(this.sqlExecTimerId);
        }

        var selectedServerIdArr = Comm.wasIdArr.concat();

        this.sqlExecTimerId = setTimeout(function() {
            this.isBeforeDataSelect = true;

            var lastestTime = this.activityLastestTime || +new Date(realtime.lastestTime);

            if (+new Date(this.activityLastestTime) < +new Date(realtime.lastestTime)) {
                lastestTime = +new Date(realtime.lastestTime);
            }

            this.txnMonitorInfo.toTime = +new Date(lastestTime);
            this.txnMonitorInfo.fromTime = this.txnMonitorInfo.toTime - (this.txnMonitorInfo.range  * 1000 * 60);
            this.getTxnMonitorMemData(selectedServerIdArr.concat());
        }.bind(this), 3000);
    },


    /**
     * 입력된 시간 데이터를 WAS 별 Timezone에 맞게 계산해서
     *
     * @param {number} time
     * @param {number} wasId
     * @return {number} time
     */
    getConvertTimeByWasId: function(time, wasId) {
        if (wasId <= 0 || !Repository.timeZoneOffset || Repository.timeZoneOffset[wasId] == null || !Repository.time_zone[wasId]) {
            return +time;
        }
        return +new Date(+time + (new Date(Repository.time_zone[wasId]).getTimezoneOffset() + Repository.timeZoneOffset[wasId]) * 1000 * 60);
    },


    /**
     * 초기 화면 표시시 Transaction Monitor에 표시할 지나간 데이터 조회
     */
    getTxnMonitorMemData: function(serverIdArr) {
        var targetDatabase = Comm.currentRepositoryInfo.database_name;
        var self = this;

        var filterParams = {
            'function': 'scatter_loadpastdata',
            options: {
                database: targetDatabase,
                fromTime: Ext.Date.format( new Date(this.txnMonitorInfo.fromTime), 'Y-m-d H:i:s' ),
                toTime  : Ext.Date.format( new Date(this.txnMonitorInfo.toTime), 'Y-m-d H:i:s' ),
                wasId   : serverIdArr.join(',')
            }
        };

        WS.PluginFunction(filterParams, function(header, data) {
            var d = null, dupCount = 0,
                time, instanceId, elapse, diffSec, idx,
                type; // normal : 0 , exception 1

            var ix, ixLen;
            if (header.success) {
                for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                    d = data.rows[ix];

                    if (isNaN(new Date(+d[0]))) {
                        console.error('was id : ' +  d[1] + '\t time : ' + d[0]);
                    } else {

                        if (self.getConvertTimeByWasId) {
                            time = self.getConvertTimeByWasId(d[0], d[1]);
                        } else {
                            time = +d[0];
                        }

                        if (Math.floor(time / 1000 ) * 1000 > Math.floor(this.fromTime / 1000 ) * 1000) {
                            instanceId = d[1];

                            if (d[2] < 0) { // - 값이면 exception
                                type = 1;
                            } else {
                                type = 0;
                            }
                            elapse = Math.abs(d[2] * 100);        // query 에서 100으로 나눠서 가져온다.
                            dupCount = +d[3];

                            elapse = self.changeCAPIElapsedTime(instanceId, elapse);

                            diffSec = Math.floor((this.toTime - (Math.floor( time / 1000 ) * 1000)) / 1000);

                            idx = this.endIndex - diffSec;
                            if (idx < 0) {
                                idx = this.length + idx;
                            }

                            if (this.data[idx] == null) {
                                this.data[idx] = {
                                    data : [],
                                    max : {},
                                    errorMax: {},
                                    total: 0
                                };
                            }

                            if (type === 1) {
                                this.data[idx].errorMax[instanceId] = Math.max((this.data[idx].errorMax[instanceId] || 0), elapse);
                            }
                            this.data[idx].max[instanceId] = Math.max((this.data[idx].max[instanceId] || 0), elapse);
                            this.data[idx].data.push([ instanceId, elapse, type, dupCount]);
                        }

                    }
                }

            }
        }, this.txnMonitorInfo);
    },


    /**
     * Transaction 장기 추이 모니터에서 설정된 필터정보를 서버에 전달.
     */
    setTxnTrendMonitorFilters: function() {
        var filterParams, filters, guid;
        if (realTimeWS) {
            if (arguments.length <= 0) {
                return;
            }

            guid = arguments[0];

            if (arguments.length > 1) {
                filters = arguments[1];
            } else {
                filters = '1 = 1';
            }

            filterParams = {
                type: 'plugin_function',
                command: 'xview_filter',
                bind: [{
                    uniq_key: guid,
                    filter: filters
                }]
            };

            realTimeWS.send({
                command: COMMAND.SET_TXN_FILTERS,
                data: filterParams
            });

            filterParams = null;
            guid = null;
            filters = null;
        }
    },


    /**
     * Transaction Popup Monitor 에 보여지는 데이터 분할 조회.
     * 지정된 시간범위를 10분 단위로 분할해서 데이터를 조회한다.
     *
     * 예) 2016-06-10 15:02:10 ~ 2016-06-10 15:22:10 범위를 조회하는 경우
     *      [0] 2016-06-10 15:02:10.000 ~ 2016-06-10 15:09:59.999
     *      [1] 2016-06-10 15:10:00.000 ~ 2016-06-10 15:19:59.999
     *      [2] 2016-06-10 15:20:00.000 ~ 2016-06-10 15:22:10.999
     *     3 개로 분할하여 데이터를 조회해서 그린다.
     */
    getTxnMonitorTrendSplitData: function() {
        if (arguments.length < 3) {
            return;
        }

        var maxTimeRange = realtime.txnPopupMonitorTimeRange || 120;

        var guid      = arguments[0];                  // Component ID
        var timeRange = maxTimeRange - arguments[1];   // 시간 범위
        var filters   = arguments[2];                  // Filters 항목
        var callback  = arguments[3];                  // 실행 후 호출 함수

        var fromTime = this.txnTrendData[guid].toTime - (timeRange * 1000 * 60);
        var toTime = this.txnTrendData[guid].toTime;
        this.txnTrendFromTime = fromTime;

        var filterParams;
        var fromStepTime;
        var toStepTime;

        var baseTime = fromTime;
        var ix;

        if (this.isTrendDataSQLRun) {
            if (callback) {
                callback();
            }
            return;
        }

        this.isTrendDataSQLRun = true;
        this.splitExecuteLength = 0;

        this.txnTrendData[guid].data.length = 0;
        this.txnTrendData[guid].range = maxTimeRange - timeRange;
        this.txnTrendData[guid].length = timeRange * 60;
        this.txnTrendData[guid].startIndex = 0;
        this.txnTrendData[guid].endIndex = this.txnTrendData[guid].length - 1;
        this.txnTrendData[guid].data = [];

        if (this.txnTrendData[guid].length) {
            this.txnTrendData[guid].data.length = this.txnTrendData[guid].length;
        }

        var targetDatabase = Comm.currentRepositoryInfo.database_name;

        var minVal, minLeft;
        for (ix = 0; ix <= this.splitExecuteLength; ix++) {
            if (ix === 0) {
                fromStepTime = new Date(baseTime);
                minVal = Ext.Date.format(fromStepTime, 'i');
                minLeft = Math.trunc(minVal / 10);
                toStepTime = new Date(Ext.Date.format( new Date(baseTime), 'Y-m-d H:'+ (minLeft+'9') +':59.999' ));
            } else {
                fromStepTime = Ext.Date.add(new Date(baseTime), Ext.Date.MILLI, 1);
                toStepTime = Ext.Date.subtract(Ext.Date.add(fromStepTime, Ext.Date.MINUTE, 10), Ext.Date.MILLI, 1);
            }

            if (+fromStepTime > +toTime) {
                break;
            } else if (+toStepTime > +toTime) {
                toStepTime = new Date(toTime);
            }

            filterParams = {
                'function': 'scatter_loadpastdata',
                options: {
                    database: targetDatabase,
                    splitKey: 'Keys-' + (+new Date()),
                    fromTime: Ext.Date.format( fromStepTime, 'Y-m-d H:i:s.000' ),
                    toTime  : Ext.Date.format( toStepTime, 'Y-m-d H:i:s.999' ),
                    filter  : filters
                }
            };

            this.executePluginFn(filterParams, guid, callback);

            this.splitExecuteLength++;
            baseTime = toStepTime;
        }

        if (this.splitExecuteLength === 0) {
            this.isTrendDataSQLRun = false;
        }
    },


    /**
     * 트랜잭션 데이터를 가져오는 플러그인 함수 호출.
     *
     * @param {object} - filters
     * @param {string} - guid
     * @param {object} - callback function
     */
    executePluginFn: function() {
        var filters  = arguments[0];
        var guid     = arguments[1];
        var callback = arguments[2];

        WS.PluginFunction(filters, function(header, data) {

            if (header.success) {
                this.setTxnTrenDataOfMem(guid, data.rows, callback);
            }
        }.bind(this));
    },


    /**
     * Set Transaction Popup Monitor Data (Split Data)
     *
     * Data
     * [0] : TIME,
     * [1] : WAS_ID
     * [2] : ELAPSE
     * [3] : DUP_COUNT
     * ex) ['1465453296131', 790, 0.01, 186]
     *
     * @param {string} guid - Component ID
     * @param {array} data - Trend data
     * @param {object} callback - callback function
     */
    setTxnTrenDataOfMem: function(guid, data, callback) {
        var ix, ixLen;

        var lastTime;
        var txnData;
        var txnLength;

        var instanceTime;
        var instanceData;
        var instanceId;
        var index;

        var elapsedTime;
        var maxValue;
        var txnMonitorInfo;
        var dupCount;


        txnMonitorInfo = this.txnTrendData[guid];

        if (!txnMonitorInfo) {
            return;
        }

        lastTime  = txnMonitorInfo.toTime;
        txnData   = txnMonitorInfo.data;
        txnLength = txnMonitorInfo.length;
        maxValue  = txnMonitorInfo.maxValue;

        this.isTrendDataSQLRun = true;

        for (ix = 0, ixLen = data.length; ix < ixLen; ++ix) {
            instanceData = data[ix];

            // 리눅스 시간 타임이 이상하게 들어오는지 체크
            if (isNaN(new Date(+instanceData[0]))) {
                console.debug('%c [RTMDataManager] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'WAS ID: ' +  instanceData[2] + ', Time: ' + instanceData[0]);
                continue;
            }

            instanceTime = Math.floor(instanceData[0] / 1000) * 1000;
            instanceId = +instanceData[1];
            elapsedTime = Math.abs(instanceData[2] * 100);
            dupCount = +instanceData[3];

            elapsedTime = this.changeCAPIElapsedTime(instanceId, elapsedTime);

            if (this.getConvertTimeByWasId) {
                instanceTime = this.getConvertTimeByWasId(instanceTime, instanceId);
            }

            if (this.txnTrendFromTime && this.txnTrendFromTime >= instanceTime) {
                continue;
            }

            if (elapsedTime < 0) {
                elapsedTime = elapsedTime * -1;
            }

            if (instanceTime > lastTime) {
                txnMonitorInfo.toTime = instanceTime;
                txnMonitorInfo.fromTime = txnMonitorInfo.toTime - (txnMonitorInfo.range  * 1000 * 60);

                lastTime = instanceTime;

                index = txnMonitorInfo.endIndex - ((instanceTime - lastTime) / 1000);
                if (index < 0) {
                    index = txnMonitorInfo.length + index;
                }

            } else {
                index = txnMonitorInfo.endIndex - ((lastTime - instanceTime) / 1000);
                if (index < 0) {
                    index = txnMonitorInfo.length + index;
                }
            }

            // 마지막 시간을 기준으로 화면 표시 시간범위 안에 속하는 데이터이면
            if (index >= 0 && index < txnLength) {
                if (txnData[index] == null) {
                    txnData[index] = {
                        data : [],
                        max  : 0,
                        errorMax: 0
                    };
                }

                if (instanceData[2] !== null) {
                    if (instanceData[2] < 0) {
                        txnData[index].errorMax = Math.max(txnData[index].errorMax || 0, elapsedTime);
                    }

                    txnData[index].max = Math.max(txnData[index].max || 0, elapsedTime);

                    // [0] elapsed time
                    // [1] exceptoin type ( normal | exception )
                    // [2] duplicate Count
                    txnData[index].data.push([elapsedTime, ((instanceData[2] < 0) ? 1 : 0), dupCount ]);

                    if (elapsedTime > maxValue) {
                        maxValue = elapsedTime;
                        txnMonitorInfo.maxValue = maxValue;
                    }
                }
            }
        }
        this.splitExecuteLength--;

        if (this.splitExecuteLength === 0) {
            this.isTrendDataSQLRun = false;
            this.drawTempTrendData();
            callback();
        }
    },


    drawTempTrendData: function() {
        var ix, ixLen;
        for (ix = 0, ixLen = this.tempTxnTrendData.length; ix < ixLen; ix++) {
            this.txnMonitorTrendDataParser(this.tempTxnTrendData[ix]);
        }
        Ext.Object.clear(this.tempTxnTrendData);
        this.tempTxnTrendData = [];
    },


    /**
     *
     * @param optionName
     * @returns
     */
    getOption: function(optionName) {
        if (optionName) {
            return this.option[optionName];
        } else {
            return this.option;
        }
    },


    /**
     * @note 실시간 패킷 데이터를 전역으로 관리 해야 하는경우 RTMDataManager에서 바인드 시켜 관리한다.
     */
    bindRTMEvent: function() {
        Repository.data = {};

    },

    init: function() {
        if (!Repository) {
            console.error('Repository is undefined!');
            return;
        }

        this.initProperty();

        this.getTxnMonitorData();

        this.bindRTMEvent();
    },


    /**
     * @note TOP Transaction 데이터의 업데이트 간격을 체크.
     * 설정된 시간에 해당하는 경우 업데이트 유무를 TRUE로 설정하고 업데이트 시간을 초기화
     *
     * @return {boolean}
     */
    checkThroughputTime: function() {
        var isRefresh = false,
            curTime;

        if (!this.throughput.beforeTime) {
            this.throughput.beforeTime = new Date().setSeconds(0, 0);
        } else {
            curTime = new Date().setSeconds(0, 0);

            if ((this.throughput.beforeTime + this.throughput.timeRange) < curTime) {
                this.throughput.beforeTime = curTime - this.throughput.timeRange;
                isRefresh = true;
            }
            curTime = null;
        }
        return isRefresh;
    },

    /**
     *
     * @param data [array]
     */
    onWasStatFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.WASSTAT].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.WASSTAT][ix];
            if (this.frameManager[this.frameGroup.WASSTAT][key].onData) {
                this.frameManager[this.frameGroup.WASSTAT][key].onData(data);
            }
        }
        key  = null;
        ix   = null;
        data = null;
    },

    /**
     *
     * @param data [array]
     */
    onDBStatusFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.DBSTAUTS].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.DBSTAUTS][ix];
            if (this.frameManager[this.frameGroup.DBSTAUTS][key].onData) {
                this.frameManager[this.frameGroup.DBSTAUTS][key].onData(data);
            }
        }
        key  = null;
        ix   = null;
        data = null;
    },

    /**
     *
     * @param data [array]
     */
    onConnPoolStatusFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.CONNPOOL].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.CONNPOOL][ix];
            if (this.frameManager[this.frameGroup.CONNPOOL][key].onData) {
                this.frameManager[this.frameGroup.CONNPOOL][key].onData(data);
            }
        }
        key  = null;
        ix   = null;
        data = null;
    },

    /**
     *
     * @param data [array]
     */
    onWasTPSFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.WASTPS].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.WASTPS][ix];
            if (this.frameManager[this.frameGroup.WASTPS][key].onData) {
                this.frameManager[this.frameGroup.WASTPS][key].onData(data);
            }
        }
        key  = null;
        ix   = null;
        data = null;
    },

    /**
     *
     * @param data [array]
     * @param header
     */
    onActivityFrame: function(data, header){
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }

        var isChangePacket = typeof(header.datatype ) != 'undefined' && (header.datatype === 2 || header.datatype === 3);

        var key, ix, ixLen;
        if (isChangePacket === true) {

            if (header.datatype == 2) {
                this.txnMonitorDataParser(data);
            } else {
                this.txnMonitorTrendDataParser(data);
            }

        } else {
            for (ix = 0, ixLen = this.frameKeys[this.frameGroup.ACTIVITY].length; ix < ixLen; ix++) {
                key = this.frameKeys[this.frameGroup.ACTIVITY][ix];
                if (this.frameManager[this.frameGroup.ACTIVITY][key].onData) {
                    this.frameManager[this.frameGroup.ACTIVITY][key].onData(data);
                }
            }
        }
        key  = null;
        ix   = null;
        data = null;
        header = null;
    },

    onBizActivityFrame: function(data) {
        var key, ix, ixLen;
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }

        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.END_BUSINESS_STAT].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.END_BUSINESS_STAT][ix];
            if (this.frameManager[this.frameGroup.END_BUSINESS_STAT][key].onData) {
                this.frameManager[this.frameGroup.END_BUSINESS_STAT][key].onData(data, 'bizActive');
            }
        }
    },


    /**
     * 액티브 트랜잭션 패킷 데이터
     *
     * @param {array} data
     */
    onActiveTxnFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.ACTIVETXN].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.ACTIVETXN][ix];
            if (this.frameManager[this.frameGroup.ACTIVETXN][key].onData) {
                this.frameManager[this.frameGroup.ACTIVETXN][key].onData(data);
            }
        }
        key  = null;
        ix   = null;
        data = null;
    },


    /**
     * WEB 액티브 트랜잭션 패킷 데이터
     *
     * @param {array} data
     */
    onWebActiveDetailFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key;
        var ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.WEB_ACTIVE_DETAIL].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.WEB_ACTIVE_DETAIL][ix];
            if (this.frameManager[this.frameGroup.WEB_ACTIVE_DETAIL][key].onData) {
                this.frameManager[this.frameGroup.WEB_ACTIVE_DETAIL][key].onData(data);
            }
        }
        data = null;
    },


    /**
     * WEB 액티비티 패킷 데이터
     *
     * @param {} data
     * @param {} header
     */
    onWebActivityFrame: function(data, header) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }

        var isChangePacket = typeof(header.datatype ) != 'undefined' && (header.datatype == 2 || header.datatype == 3);

        var key, ix, ixLen;
        if (isChangePacket === true) {

            if (header.datatype == 2) {
                this.webTxnMonitorDataParser(data);
            } else {
                this.webTxnMonitorTrendDataParser(data);
            }

        } else {
            for (ix = 0, ixLen = this.frameKeys[this.frameGroup.WEB_ACTIVITY_FILTER].length; ix < ixLen; ix++) {
                key = this.frameKeys[this.frameGroup.WEB_ACTIVITY_FILTER][ix];
                if (this.frameManager[this.frameGroup.WEB_ACTIVITY_FILTER][key].onData) {
                    this.frameManager[this.frameGroup.WEB_ACTIVITY_FILTER][key].onData(data);
                }
            }
        }
        key  = null;
        ix   = null;
        data = null;
        header = null;


    },

    /**
     *
     * @param data [array]
     */

    /** 사용하지 않는 함수 주석 처리.
    onActiveRemoteFrame: function(data){
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key;
        for (var ix = 0, ixLen = this.frameKeys[this.frameGroup.REMOTE_TXN].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.REMOTE_TXN][ix];
            if (this.frameManager[this.frameGroup.REMOTE_TXN][key].onRemoteData) {
                this.frameManager[this.frameGroup.REMOTE_TXN][key].onRemoteData(data);
            }
        }
        key  = null;
        ix   = null;
        data = null;
    },
     */

    /**
     *
     * @param data [array]
     */
    onLockInforame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.LOCKINFO].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.LOCKINFO][ix];
            if (this.frameManager[this.frameGroup.LOCKINFO][key].onData) {
                this.frameManager[this.frameGroup.LOCKINFO][key].onData(data);
            }
        }
        key  = null;
        ix   = null;
        data = null;
    },


    /**
     *
     * @paramer data [array]
     */
    onTopologyFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.TOPOLOGY].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.TOPOLOGY][ix];
            if (this.frameManager[this.frameGroup.TOPOLOGY][key].onData) {
                this.frameManager[this.frameGroup.TOPOLOGY][key].onData(data);
            }
        }
        key  = null;
        data = null;
    },

    /**
     *
     * @paramer data [array]
     */
    onTopologyCountFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.TOPOLOGY_COUNT].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.TOPOLOGY_COUNT][ix];
            if (this.frameManager[this.frameGroup.TOPOLOGY_COUNT][key] && this.frameManager[this.frameGroup.TOPOLOGY_COUNT][key].onData) {
                this.frameManager[this.frameGroup.TOPOLOGY_COUNT][key].onData(data);
            }
        }
        key  = null;
        data = null;
    },

    /**
     * Alarm Packet Data
     *
     * @param {array} data
     *  0: time
     *  1: server_type
     *  2: server_id
     *  3: server_name
     *  4: alert_resource_name
     *  5: value
     *  6: alert_level
     *  7: levelType
     *  8: alert_type
     *  9: descr
     * 10: alert_resource_ID
     */
    onAlarmFrame: function(data) {
        if (!data || !this.frameGroup) {
            data = null;
            return;
        }

        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.ALARM].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.ALARM][ix];
            if (this.frameManager[this.frameGroup.ALARM][key].onAlarm) {
                this.frameManager[this.frameGroup.ALARM][key].onAlarm(data);
            }
        }
        key = null;
        ix  = null;

        this.onHeaderAlarm(data);

        this.onAlarmSound(data[6]);

        data = null;
    },

    /**
     * 알람 발생시 알람음 재생
     *
     * @param {string} level - alarm level (2: Critical, 1: Warning)
     */
    onAlarmSound: function(level) {
        if (realtime.sound != null) {

            if (level == 2) {
                realtime.sound.critical.play();

            } else if (level == 1 ) {
                realtime.sound.warning.play();
            }
        }
    },


    /**
     *
     * @param {Object} data
     */
    onHeaderAlarm: function(data) {
        if (this.alertmManager && this.alertmManager.onAlarm) {
            setTimeout(function(a, b) {
                a.onAlarm(b);
            }, 10, this.alertmManager, data);
        }
    },


    /**
     *Clear Old Alarm
     */
    onClearAlarm: function() {
        if (this.clearAlarmTime) {
            clearTimeout(this.clearAlarmTime);
        }
        this.clearAlarmTime = null;
        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.ALARM].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.ALARM][ix];
            if (this.frameManager[this.frameGroup.ALARM][key].clearAlarm) {
                this.frameManager[this.frameGroup.ALARM][key].clearAlarm();
            }
        }
        key = null;
        ix  = null;

        this.checkClearAlarmList();

        this.clearAlarmTime = setTimeout(this.onClearAlarm.bind(this), 10000);
    },

    /**
     * Check Clear Alarm
     */
    checkClearAlarmList: function() {
        if (!Repository.alarmListInfo) {
            return;
        }

        var ix, jx, jxLen;
        var serverId;
        var checkList;
        var serverIdList;
        var diffSec;
        var checkTime = new Date();
        var alarmName;

        // WAS Alarm
        checkList = Repository.alarmListInfo.WAS;
        if (checkList) {
            serverIdList = Object.keys(checkList);
            for (jx = 0, jxLen = serverIdList.length; jx < jxLen; jx++) {
                serverId = serverIdList[jx];

                for (ix = 0; ix < checkList[serverId].length; ) {
                    alarmName = checkList[serverId][ix].name;
                    if (realtime.downAlarms.indexOf(alarmName) === -1 && window.realtime.alarms.LICENSE !== alarmName) {
                        diffSec = Ext.Date.diff(checkList[serverId][ix].lastTime , checkTime, Ext.Date.SECOND);
                        if (diffSec > 3) {
                            checkList[serverId].splice(ix, 1);
                            ix--;
                        }
                    }
                    ix++;
                }
            }
        }

        // DB Alarm
        checkList = Repository.alarmListInfo.DB;
        if (checkList) {
            serverIdList = Object.keys(checkList);
            for (jx = 0, jxLen = serverIdList.length; jx < jxLen; jx++) {
                serverId = serverIdList[jx];

                for (ix = 0; ix < checkList[serverId].length; ) {
                    alarmName = checkList[serverId][ix].name;
                    if (realtime.downAlarms.indexOf(alarmName) === -1) {
                        diffSec = Ext.Date.diff(checkList[serverId][ix].lastTime , checkTime, Ext.Date.SECOND);
                        if (diffSec > 3) {
                            checkList[serverId].splice(ix, 1);
                            ix--;
                        }
                    }
                    ix++;
                }
            }
        }

        // WebServer
        checkList = Repository.alarmListInfo.WebServer;
        if (checkList) {
            serverIdList = Object.keys(checkList);
            for (jx = 0, jxLen = serverIdList.length; jx < jxLen; jx++) {
                serverId = serverIdList[jx];

                for (ix = 0; ix < checkList[serverId].length; ) {
                    alarmName = checkList[serverId][ix].name;
                    if (realtime.downAlarms.indexOf(alarmName) === -1 && alarmName !== realtime.webProcessAlarm.ACTIVE_DOWN) {
                        diffSec = Ext.Date.diff(checkList[serverId][ix].lastTime , checkTime, Ext.Date.SECOND);
                        if (diffSec > 3) {
                            checkList[serverId].splice(ix, 1);
                            ix--;
                        }
                    }
                    ix++;
                }
            }
        }

        // Business
        checkList = Repository.alarmListInfo.BIZ;
        if (checkList) {
            serverIdList = Object.keys(checkList);
            for (jx = 0, jxLen = serverIdList.length; jx < jxLen; jx++) {
                serverId = serverIdList[jx];

                for (ix = 0; ix < checkList[serverId].length; ) {
                    alarmName = checkList[serverId][ix].name;
                    if (realtime.downAlarms.indexOf(alarmName) === -1) {
                        diffSec = Ext.Date.diff(checkList[serverId][ix].lastTime , checkTime, Ext.Date.SECOND);
                        if (diffSec > 3) {
                            checkList[serverId].splice(ix, 1);
                            ix--;
                        }
                    }
                    ix++;
                }
            }
        }
        checkList = null;
        checkTime = null;
    },


    /**
     * 서버별 성능지표 및 성능지표 합계, GC 지표의 차트를 그리는 함수 실행.
     * 실행 주기: 3초
     */
    onRefresRealChart: function() {
        if (this.wasChartTimerId) {
            clearTimeout(this.wasChartTimerId);
        }

        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.WAS_CHART].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.WAS_CHART][ix];
            if (this.frameManager[this.frameGroup.WAS_CHART][key].refreshChartData) {
                this.frameManager[this.frameGroup.WAS_CHART][key].refreshChartData();
            }
        }
        key   = null;
        ix    = null;
        ixLen = null;

        this.wasChartTimerId = setTimeout(this.onRefresRealChart.bind(this), 3000);
    },

    /**
     * 서버별 성능지표 중 동시 사용자 수 차트를 그리는 함수 실행.
     * 실행 주기 :3초
     */
    onRefreshWasSessionChart: function() {
        if (this.wasSessionChartTimerId) {
            clearTimeout(this.wasSessionChartTimerId);
        }

        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.WAS_SESSION_DATA].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.WAS_SESSION_DATA][ix];
            if (this.frameManager[this.frameGroup.WAS_SESSION_DATA][key].refreshChartData) {
                this.frameManager[this.frameGroup.WAS_SESSION_DATA][key].refreshChartData();
            }
        }
        key   = null;
        ix    = null;
        ixLen = null;

        this.wasSessionChartTimerId = setTimeout(this.onRefreshWasSessionChart.bind(this), 3000);
    },

    /**
     * 서비스 지표 차트를 그리는 함수 실행.
     * 실행 주기: 60초 -> 30초
     */
    onRefreshServiceStatChart: function() {
        if (this.serviceStatChartTimerId) {
            clearTimeout(this.serviceStatChartTimerId);
        }

        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.WAS_SERVICE_STAT].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.WAS_SERVICE_STAT][ix];
            if (this.frameManager[this.frameGroup.WAS_SERVICE_STAT][key].refreshChartData) {
                this.frameManager[this.frameGroup.WAS_SERVICE_STAT][key].refreshChartData();
            }
        }
        key   = null;
        ix    = null;
        ixLen = null;

        this.serviceStatChartTimerId = setTimeout(this.onRefreshServiceStatChart.bind(this), 30000);
    },

    /**
     * AI 부하예측 차트를 그리는 함수 실행.
     * 실행 주기: 10초
     */
    onRefreshLoadPredictChart: function() {
        if (this.loadPredictChartTimerId) {
            clearTimeout(this.loadPredictChartTimerId);
        }

        var key, ix, ixLen;
        for (ix = 0, ixLen = this.frameKeys[this.frameGroup.WAS_LOAD_PREDICT].length; ix < ixLen; ix++) {
            key = this.frameKeys[this.frameGroup.WAS_LOAD_PREDICT][ix];
            if (this.frameManager[this.frameGroup.WAS_LOAD_PREDICT][key].refreshChartData) {
                this.frameManager[this.frameGroup.WAS_LOAD_PREDICT][key].refreshChartData();
            }
        }
        key   = null;
        ix    = null;
        ixLen = null;

        this.loadPredictChartTimerId = setTimeout(this.onRefreshLoadPredictChart.bind(this), 10000);
    },

    /**
     * Transaction Monitor 에 보여지는 실시간 패킷 데이터를 관리.
     *
     * @param {Object} data
     * columns
     * [0] : Time
     * [1] : Start_TXNs
     * [2] : End_TXNs (Array Type)
     *       [0] : elapsed time
     *       [1] : dot duplicate count
     * [3] : was id
     */
    txnMonitorDataParser: function(data) {
        var ix, ixLen;
        var jx = null, jxLen = null;

        var lastTime = this.txnMonitorInfo.toTime;
        var txnData = this.txnMonitorInfo.data;
        var txnLength = this.txnMonitorInfo.length;
        var cnt = null;

        var instanceTime = null;
        var instanceData = null;
        var instanceId = null;
        var index = null;
        var endTxnList = null;

        var elapsedTime;
        var dupCount, errorCount;

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ++ix) {
            instanceData = data.rows[ix];

            // 시간값이 잘못된 값으로 들어오는지 체크한다.
            if (isNaN(new Date(instanceData[0]))) {
                console.debug('%c [RTMDataManager] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', 'WAS ID: ' +  instanceData[3] + ', Time: ' + instanceData[0]);
                continue;
            }

            if (instanceData[3] <= 0) {
                instanceId = Repository.trendChartData.timeRecordWasId;
            } else {
                instanceId = instanceData[3];
            }

            if (instanceId == null) {
                return;
            }

            if (this.getConvertTimeByWasId && instanceData[2].length <= 0) {
                instanceTime = +this.getConvertTimeByWasId(instanceData[0], instanceId);
            } else {
                instanceTime = instanceData[0];
            }

            instanceTime = Math.floor(instanceTime / 1000) * 1000; //Math.floor(instanceData[0] / 1000) * 1000
            endTxnList = instanceData[2];

            if (!this.isBeforeDataSelect) {
                if (+new Date(realtime.lastestTime) < instanceTime) {
                    this.activityLastestTime = instanceTime;
                } else {
                    this.activityLastestTime = +new Date(realtime.lastestTime);
                }
            }

            // 지정된 시간 이전 데이터인 경우 화면에 표시하지 않는다.
            if ( ((lastTime - instanceTime) / 1000) > txnLength) {
                continue;
            }

            if (instanceTime > lastTime) {
                cnt = (instanceTime - lastTime) / 1000;

                // 지정된 시간 범위값과 차이가 나는 시간 값이 들어올 경우 마지막 시간 ( 인스턴스 시간 ) 값으로 초기화 ( 데이터 ) 한다.
                if (cnt >= txnLength) {
                    for (jx = 0; jx < txnLength; jx++) {
                        if (txnData[jx]) {
                            txnData[jx].data.length = 0;
                            txnData[jx].data.max = {};
                        }
                    }
                    this.txnMonitorInfo.startIndex = 0;
                    this.txnMonitorInfo.endIndex = txnLength - 1;

                    lastTime = instanceTime;
                } else {
                    while (cnt > 0) {
                        if (txnData[this.txnMonitorInfo.startIndex] == null) {
                            txnData[this.txnMonitorInfo.startIndex] = {
                                data: [],
                                max: {},
                                errorMax: {}
                            };
                        } else {
                            txnData[this.txnMonitorInfo.startIndex].data.length = 0;
                            txnData[this.txnMonitorInfo.startIndex].max = {};
                            txnData[this.txnMonitorInfo.startIndex].errorMax = {};
                        }

                        ++this.txnMonitorInfo.startIndex;

                        if (this.txnMonitorInfo.startIndex >= txnLength) {
                            this.txnMonitorInfo.startIndex = 0;
                        }

                        ++this.txnMonitorInfo.endIndex;
                        if (this.txnMonitorInfo.endIndex >= txnLength) {
                            this.txnMonitorInfo.endIndex = 0;
                        }
                        --cnt;
                    }
                }

                this.txnMonitorInfo.toTime = instanceTime;
                this.txnMonitorInfo.fromTime = this.txnMonitorInfo.toTime - (this.txnMonitorInfo.range  * 1000 * 60);

                lastTime = instanceTime;

                index = this.txnMonitorInfo.endIndex - ((instanceTime - lastTime) / 1000);
                if (index < 0) {
                    index = this.txnMonitorInfo.length + index;
                }
            } else {
                index = this.txnMonitorInfo.endIndex - ((lastTime - instanceTime) / 1000);
                if (index < 0) {
                    index = this.txnMonitorInfo.length + index;
                }
            }

            // 마지막 시간을 기준으로 지정된 시간범위 안에 속하는 데이터이면
            if (index >= 0 && index < txnLength) {
                if (txnData[index] == null) {
                    txnData[index] = {
                        data : [],
                        max : {},
                        errorMax: {}
                        //time : instanceTime
                    };
                }

                errorCount = 0;

                for (jx = 0, jxLen = endTxnList.length; jx < jxLen; ++jx) {
                    elapsedTime = endTxnList[jx][0];
                    dupCount = +endTxnList[jx][1];
                    if (elapsedTime < 0) {
                        elapsedTime = elapsedTime * -1;
                    }

                    elapsedTime = this.changeCAPIElapsedTime(instanceId, elapsedTime);

                    // 에러 트랜잭션 최대값
                    if (endTxnList[jx][0] < 0) {
                        txnData[index].errorMax[instanceId] = Math.max((txnData[index].errorMax[instanceId] || 0), elapsedTime);

                        errorCount += dupCount;
                    }

                    // 각 초마다 인스턴스의 max 값을 가지고 있는다.
                    txnData[index].max[instanceId] = Math.max((txnData[index].max[instanceId] || 0), elapsedTime);

                    // [ instanceId, elapsedTime, duplicate count ]
                    txnData[index].data.push([ instanceId, elapsedTime, ((endTxnList[jx][0] < 0) ? 1 : 0), dupCount]);
                }

                if (!Repository.txnError) {
                    Repository.txnError = {};
                }

                Repository.txnError[instanceData[3]] = errorCount;
            }

        }
    },


    /**
     * Transaction Popup Monitor View 에 보여지는 실시간 패킷 데이터를 관리.
     *
     * @param {Object} adata
     * columns
     * [0] : uniq_key (Component Unique ID)
     * [1] : End_TXNs (Array Type)
     *       [0] : time
     *       [1] : elapsed time
     *       [2] : Dot duplicate count
     */
    txnMonitorTrendDataParser: function(adata) {
        var ix, jx, ixLen;

        var lastTime;
        var txnData;
        var txnLength;
        var cnt;

        var instanceTime;
        var instanceData;
        var index;

        var guid;
        var data;

        var elapsedTime;
        var maxValue;
        var txnMonitorInfo;
        var dupCount;
        var instanceId;

        if (!this.txnTrendData.guidList || this.txnTrendData.guidList.length <= 0) {
            return;
        }

        if (this.isTrendDataSQLRun) {
            if (this.txnTrendData.guidList.length > 0) {
                this.tempTxnTrendData[this.tempTxnTrendData.length] = adata;
            }
            return;
        }

        var hx, hxLen;
        for (hx = 0, hxLen = this.txnTrendData.guidList.length; hx < hxLen; hx++) {
            guid = this.txnTrendData.guidList[hx];

            data = adata.rows[0][guid];

            if (data === null || data === undefined) {
                continue;
            }

            txnMonitorInfo = this.txnTrendData[guid];

            lastTime  = txnMonitorInfo.toTime;
            txnData   = txnMonitorInfo.data;
            txnLength = txnMonitorInfo.length;
            maxValue  = txnMonitorInfo.maxValue;

            instanceTime = null;
            instanceData = null;
            index = null;

            for (ix = 0, ixLen = data.length; ix < ixLen; ++ix) {
                instanceData = data[ix];

                // 리눅스 시간 타임이 이상하게 들어오는지 체크
                if (isNaN(new Date(instanceData[0]))) {
                    console.debug('%c [RTMDataManager] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'WAS ID: ' +  instanceData[3] + ', Time: ' + instanceData[0]);
                    continue;
                }

                instanceId = instanceData[3];

                if (!instanceId && Repository.trendChartData.timeRecordWasId) {
                    instanceId = Repository.trendChartData.timeRecordWasId;
                }

                if (this.getConvertTimeByWasId && instanceData[1] == null) {
                    instanceTime = +this.getConvertTimeByWasId(instanceData[0], instanceId);
                } else {
                    instanceTime = instanceData[0];
                }

                instanceTime = Math.floor(instanceTime / 1000) * 1000;
                //elapsedTime = instanceData[1] * 100
                elapsedTime = instanceData[1];
                dupCount = +instanceData[2];

                if (elapsedTime < 0) {
                    elapsedTime = elapsedTime * -1;
                }

                elapsedTime = this.changeCAPIElapsedTime(instanceId, elapsedTime);

                if (instanceTime > lastTime) {
                    cnt = (instanceTime - lastTime) / 1000;

                    // 차이가 나는 시간 값이 들어올 경우 마지막 시간 ( 인스턴스 시간 ) 값으로 초기화 ( 데이터 ) 한다.
                    if (cnt >= txnLength) {
                        for (jx = 0; jx < txnLength; jx++) {
                            if (txnData[jx]) {
                                txnData[jx].data.length = 0;
                                txnData[jx].data.max = 0;
                            }
                        }
                        txnMonitorInfo.startIndex = 0;
                        txnMonitorInfo.endIndex = txnLength - 1;

                        lastTime = instanceTime;
                    } else {
                        while (cnt > 0) {
                            if (txnData[txnMonitorInfo.startIndex] == null) {
                                txnData[txnMonitorInfo.startIndex] = {
                                    data: [],
                                    max: 0,
                                    errorMax: 0
                                };
                            } else {
                                txnData[txnMonitorInfo.startIndex].data.length = 0;
                                txnData[txnMonitorInfo.startIndex].max = 0;
                                txnData[txnMonitorInfo.startIndex].errorMax = 0;
                            }

                            ++txnMonitorInfo.startIndex;

                            if (txnMonitorInfo.startIndex >= txnLength) {
                                txnMonitorInfo.startIndex = 0;
                            }

                            ++txnMonitorInfo.endIndex;
                            if (txnMonitorInfo.endIndex >= txnLength) {
                                txnMonitorInfo.endIndex = 0;
                            }
                            --cnt;
                        }
                    }

                    txnMonitorInfo.toTime = instanceTime;
                    txnMonitorInfo.fromTime = txnMonitorInfo.toTime - (txnMonitorInfo.range  * 1000 * 60);

                    lastTime = instanceTime;

                    index = txnMonitorInfo.endIndex - ((instanceTime - lastTime) / 1000);
                    if (index < 0) {
                        index = txnMonitorInfo.length + index;
                    }
                } else {
                    index = txnMonitorInfo.endIndex - ((lastTime - instanceTime) / 1000);
                    if (index < 0) {
                        index = txnMonitorInfo.length + index;
                    }
                }

                // 마지막 시간을 기준으로 화면 표시 시간범위 안에 속하는 데이터이면
                if (index >= 0 && index < txnLength) {
                    if (txnData[index] == null) {
                        txnData[index] = {
                            data : [],
                            max  : 0,
                            errorMax: 0
                        };
                    }

                    if (instanceData[1] !== null) {
                        if (instanceData[1] < 0) {
                            txnData[index].errorMax = Math.max(txnData[index].errorMax || 0, elapsedTime);
                        }

                        txnData[index].max = Math.max(txnData[index].max || 0, elapsedTime);

                        // [ value, type ( normal | exception ) ]
                        txnData[index].data.push([elapsedTime, ((instanceData[1] < 0) ? 1 : 0), dupCount ]);

                        if (elapsedTime > maxValue) {
                            maxValue = elapsedTime;
                            txnMonitorInfo.maxValue = maxValue;
                        }
                    }
                }

            }
        }

    },

    /**
     * Web Transaction Monitor 에 보여지는 실시간 패킷 데이터를 관리. (주기 3초)
     *
     * @param {Object} data
     * columns
     * [0] : Time
     * [1] : End_TXNs (Array Type)
     *       [0] : elapsed time
     *       [1] : dot duplicate count
     * [2] : web id
     */
    webTxnMonitorDataParser: function(data) {
        var ix, ixLen, jx, jxLen, cnt;

        var lastTime  = this.txnMonitorInfo.toTime;
        var txnData   = this.txnMonitorInfo.data;
        var txnLength = this.txnMonitorInfo.length;

        var instanceTime, instanceData, instanceId;
        var index;
        var endTxnList;

        var elapsedTime;
        var dupCount;

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ++ix) {
            instanceData = data.rows[ix];
            instanceId   = instanceData[2];

            // 시간값이 잘못된 값으로 들어오는지 체크한다.
            if (isNaN(new Date(instanceData[0]))) {
                console.debug('%c [RTMDataManager] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', 'WEB ID: ' +  instanceId + ', Time: ' + instanceData[0]);
                continue;
            }

            if (instanceId <= 0 || instanceId == null) {
                continue;
            }

            if (this.getConvertTimeByWasId && instanceData[2].length <= 0) {
                instanceTime = +this.getConvertTimeByWasId(instanceData[0], instanceId);
            } else {
                instanceTime = instanceData[0];
            }

            instanceTime = Math.floor(instanceTime / 1000) * 1000;
            endTxnList = instanceData[2];

            if (!this.isBeforeDataSelect) {
                if (+new Date(realtime.lastestTime) < instanceTime) {
                    this.activityLastestTime = instanceTime;
                } else {
                    this.activityLastestTime = +new Date(realtime.lastestTime);
                }
            }

            // 지정된 시간 이전 데이터인 경우 화면에 표시하지 않는다.
            if ( ((lastTime - instanceTime) / 1000) > txnLength) {
                continue;
            }

            if (instanceTime > lastTime) {
                cnt = (instanceTime - lastTime) / 1000;

                // 지정된 시간 범위값과 차이가 나는 시간 값이 들어올 경우 마지막 시간 ( 인스턴스 시간 ) 값으로 초기화 ( 데이터 ) 한다.
                if (cnt >= txnLength) {
                    for (jx = 0; jx < txnLength; jx++) {
                        if (txnData[jx]) {
                            txnData[jx].data.length = 0;
                            txnData[jx].data.max = {};
                        }
                    }
                    this.txnMonitorInfo.startIndex = 0;
                    this.txnMonitorInfo.endIndex = txnLength - 1;

                } else {
                    while (cnt > 0) {
                        if (txnData[this.txnMonitorInfo.startIndex] == null) {
                            txnData[this.txnMonitorInfo.startIndex] = {
                                data: [],
                                max: {},
                                errorMax: {}
                            };
                        } else {
                            txnData[this.txnMonitorInfo.startIndex].data.length = 0;
                            txnData[this.txnMonitorInfo.startIndex].max = {};
                            txnData[this.txnMonitorInfo.startIndex].errorMax = {};
                        }

                        ++this.txnMonitorInfo.startIndex;

                        if (this.txnMonitorInfo.startIndex >= txnLength) {
                            this.txnMonitorInfo.startIndex = 0;
                        }

                        ++this.txnMonitorInfo.endIndex;
                        if (this.txnMonitorInfo.endIndex >= txnLength) {
                            this.txnMonitorInfo.endIndex = 0;
                        }
                        --cnt;
                    }
                }

                this.txnMonitorInfo.toTime = instanceTime;
                this.txnMonitorInfo.fromTime = this.txnMonitorInfo.toTime - (this.txnMonitorInfo.range  * 1000 * 60);

                lastTime = instanceTime;

                index = this.txnMonitorInfo.endIndex - ((instanceTime - lastTime) / 1000);
                if (index < 0) {
                    index = this.txnMonitorInfo.length + index;
                }
            } else {
                index = this.txnMonitorInfo.endIndex - ((lastTime - instanceTime) / 1000);
                if (index < 0) {
                    index = this.txnMonitorInfo.length + index;
                }
            }

            // 마지막 시간을 기준으로 지정된 시간범위 안에 속하는 데이터이면
            if (index >= 0 && index < txnLength) {
                if (txnData[index] == null) {
                    txnData[index] = {
                        data : [],
                        max : {},
                        errorMax: {}
                        //time : instanceTime
                    };
                }

                for (jx = 0, jxLen = endTxnList.length; jx < jxLen; ++jx) {
                    elapsedTime = endTxnList[jx][0];
                    dupCount = +endTxnList[jx][1];
                    if (elapsedTime < 0) {
                        elapsedTime = elapsedTime * -1;
                    }

                    // 에러 트랜잭션 최대값
                    if (endTxnList[jx][0] < 0) {
                        txnData[index].errorMax[instanceId] = Math.max((txnData[index].errorMax[instanceId] || 0), elapsedTime);
                    }

                    // 각 초마다 인스턴스의 max 값을 가지고 있는다.
                    txnData[index].max[instanceId] = Math.max((txnData[index].max[instanceId] || 0), elapsedTime);

                    // [ instanceId, elapsedTime, duplicate count ]
                    txnData[index].data.push([ instanceId, elapsedTime, ((endTxnList[jx][0] < 0) ? 1 : 0), dupCount]);
                }
            }

        }
    },



    /**
     * Web Transaction Popup Monitor View 에 보여지는 실시간 패킷 데이터를 관리.
     *
     * @param {Object} adata
     * columns
     * [0] : uniq_key (Component Unique ID)
     * [1] : End_TXNs (Array Type)
     *       [0] : time
     *       [1] : elapsed time
     *       [2] : Dot duplicate count
     */
    webTxnMonitorTrendDataParser: function(adata) {
        var ix, jx, ixLen;

        var lastTime;
        var txnData;
        var txnLength;
        var cnt;

        var instanceTime;
        var instanceData;
        var index;

        var guid;
        var data;

        var elapsedTime;
        var maxValue;
        var txnMonitorInfo;
        var dupCount;
        var instanceId;

        if (!this.txnTrendData.guidList || this.txnTrendData.guidList.length <= 0) {
            return;
        }

        if (this.isTrendDataSQLRun) {
            if (this.txnTrendData.guidList.length > 0) {
                this.tempTxnTrendData[this.tempTxnTrendData.length] = adata;
            }
            return;
        }

        var hx, hxLen;
        for (hx = 0, hxLen = this.txnTrendData.guidList.length; hx < hxLen; hx++) {
            guid = this.txnTrendData.guidList[hx];

            data = adata.rows[0][guid];

            if (data === null || data === undefined) {
                continue;
            }

            txnMonitorInfo = this.txnTrendData[guid];

            lastTime  = txnMonitorInfo.toTime;
            txnData   = txnMonitorInfo.data;
            txnLength = txnMonitorInfo.length;
            maxValue  = txnMonitorInfo.maxValue;

            instanceTime = null;
            instanceData = null;
            index = null;

            for (ix = 0, ixLen = data.length; ix < ixLen; ++ix) {
                instanceData = data[ix];

                // 리눅스 시간 타임이 이상하게 들어오는지 체크
                if (isNaN(new Date(instanceData[0]))) {
                    console.debug('%c [RTMDataManager] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'WAS ID: ' +  instanceData[3] + ', Time: ' + instanceData[0]);
                    continue;
                }

                instanceId = Repository.trendChartData.timeRecordWasId;

                if (this.getConvertTimeByWasId && instanceData[1] == null) {
                    instanceTime = +this.getConvertTimeByWasId(instanceData[0], instanceId);
                } else {
                    instanceTime = instanceData[0];
                }

                instanceTime = Math.floor(instanceTime / 1000) * 1000;
                //elapsedTime = instanceData[1] * 100
                elapsedTime = instanceData[1];
                dupCount = +instanceData[2];

                if (elapsedTime < 0) {
                    elapsedTime = elapsedTime * -1;
                }

                if (instanceTime > lastTime) {
                    cnt = (instanceTime - lastTime) / 1000;

                    // 차이가 나는 시간 값이 들어올 경우 마지막 시간 ( 인스턴스 시간 ) 값으로 초기화 ( 데이터 ) 한다.
                    if (cnt >= txnLength) {
                        for (jx = 0; jx < txnLength; jx++) {
                            if (txnData[jx]) {
                                txnData[jx].data.length = 0;
                                txnData[jx].data.max = 0;
                            }
                        }
                        txnMonitorInfo.startIndex = 0;
                        txnMonitorInfo.endIndex = txnLength - 1;

                        lastTime = instanceTime;
                    } else {
                        while (cnt > 0) {
                            if (txnData[txnMonitorInfo.startIndex] == null) {
                                txnData[txnMonitorInfo.startIndex] = {
                                    data: [],
                                    max: 0,
                                    errorMax: 0
                                };
                            } else {
                                txnData[txnMonitorInfo.startIndex].data.length = 0;
                                txnData[txnMonitorInfo.startIndex].max = 0;
                                txnData[txnMonitorInfo.startIndex].errorMax = 0;
                            }

                            ++txnMonitorInfo.startIndex;

                            if (txnMonitorInfo.startIndex >= txnLength) {
                                txnMonitorInfo.startIndex = 0;
                            }

                            ++txnMonitorInfo.endIndex;
                            if (txnMonitorInfo.endIndex >= txnLength) {
                                txnMonitorInfo.endIndex = 0;
                            }
                            --cnt;
                        }
                    }

                    txnMonitorInfo.toTime = instanceTime;
                    txnMonitorInfo.fromTime = txnMonitorInfo.toTime - (txnMonitorInfo.range  * 1000 * 60);

                    lastTime = instanceTime;

                    index = txnMonitorInfo.endIndex - ((instanceTime - lastTime) / 1000);
                    if (index < 0) {
                        index = txnMonitorInfo.length + index;
                    }
                } else {
                    index = txnMonitorInfo.endIndex - ((lastTime - instanceTime) / 1000);
                    if (index < 0) {
                        index = txnMonitorInfo.length + index;
                    }
                }

                // 마지막 시간을 기준으로 화면 표시 시간범위 안에 속하는 데이터이면
                if (index >= 0 && index < txnLength) {
                    if (txnData[index] == null) {
                        txnData[index] = {
                            data : [],
                            max  : 0,
                            errorMax: 0
                        };
                    }

                    if (instanceData[1] !== null) {
                        if (instanceData[1] < 0) {
                            txnData[index].errorMax = Math.max(txnData[index].errorMax || 0, elapsedTime);
                        }

                        txnData[index].max = Math.max(txnData[index].max || 0, elapsedTime);

                        // [ value, type ( normal | exception ) ]
                        txnData[index].data.push([elapsedTime, ((instanceData[1] < 0) ? 1 : 0), dupCount ]);

                        if (elapsedTime > maxValue) {
                            maxValue = elapsedTime;
                            txnMonitorInfo.maxValue = maxValue;
                        }
                    }
                }

            }
        }

    },



    /**
     * @param frameName [string] frameManager 객체에 선언되어 있는 frame 그룹 이름
     * @param frame [object] frameManger 에서 해당 그룹에 포함할 객체
     */
    addFrame: function(frameName, frame) {
        var frameList = this.frameManager[frameName];

        if (frameList) {
            frameList[frame.id] = frame;
            this.frameKeys[frameName][this.frameKeys[frameName].length] = frame.id;
        }
        frameList = null;
    },

    /**
     * @param frameName [string] frameManager 객체에 선언되어 있는 frame 그룹 이름
     * @param frame [object] frameManger 에서 자신의 객체를 찾아 삭제 하기 위한 객체
     */
    removeFrame: function(frameName, frame) {
        var frameList = this.frameManager[frameName];

        if (frameList) {
            Ext.Array.remove(common.RTMDataManager.frameKeys[frameName], frame.id);
            delete frameList[frame.id];
        }
    },


    selectAgent: function(wasId, openViewType) {
        if (!openViewType) {
            openViewType = 'WAS';
        }

        if (!this.agentManager[openViewType]) {
            return;
        }

        var agentList = this.agentManager[openViewType][wasId];
        var agentElem, ix, ixLen;

        if (!agentList) {
            return;
        }
        for (ix = 0, ixLen = agentList.length; ix < ixLen; ix++) {
            try {
                agentElem = document.getElementById(agentList[ix]);
                if (agentElem.selectAgent) {
                    agentElem.selectAgent(openViewType);
                }
            } catch (e) {
                console.debug(e.message);
            }
        }
        agentElem = null;
        agentList = null;
    },


    clearSelectedAgent: function(openViewType) {
        openViewType = (!openViewType) ? '.WAS' : '.' + openViewType;

        // Left Was Group View
        if (openViewType === '.WAS') {
            $('.rtm-base .basewrap .was-selected-icon').removeClass('enable');
            $('.rtm-base .basewrap').removeClass('selected');
        }

        // Agent List
        $('.rtm-base .wasinfo' + openViewType + ' .was').removeClass('selected');
        $('.rtm-base .wasinfo' + openViewType + ' .underline').removeClass('selected');
        $('.xm-dock-window-base .wasinfo' + openViewType + ' .was').removeClass('selected');
        $('.xm-dock-window-base .wasinfo' + openViewType + ' .underline').removeClass('selected');
    },


    addAgent: function(wasId, objId, openViewType) {

        if (!openViewType) {
            openViewType = 'WAS';
        }

        if (!this.agentManager[openViewType]) {
            this.agentManager[openViewType] = {};
        }

        if (!this.agentManager[openViewType][wasId]) {
            this.agentManager[openViewType][wasId] = [];
        }

        this.agentManager[openViewType][wasId].push(objId);
    },


    removeAgent: function(wasId, objId, openViewType) {
        if (!openViewType) {
            openViewType = 'WAS';
        }

        if (this.agentManager[openViewType] && this.agentManager[openViewType][wasId]) {
            Ext.Array.remove(this.agentManager[openViewType][wasId], objId);
        }
    },


    /**
     * Transaction Monitor에서 Y축에 표시되는 elapse time 값을 초 단위로 표시하기
     * 위해 1000 으로 나누어 표시 처리를 하고 있는데 C API 인 경우에는 마이크로 세컨드 단위로
     * 표시를 해야되기에 C API 데이터 인 경우에는 1000을 곱한 값으로 처리가 되게 설정.
     *
     * @param {number} serverId
     * @param {number} elapseTime
     */
    changeCAPIElapsedTime: function(serverId, elapsedTime) {
        var time = elapsedTime;
        if (Comm.cdIdArr.indexOf(serverId) !== -1) {
            time = time * 1000;
        }
        return time;
    },


    /**
     * 모니터링 대상이 되는 서비스를 변경 시 Repository 개체에 설정된 실시간 추이 및
     * 알람, 서버 상태 등 데이터를 초기화 처리.
     */
    resetObjectData: function() {
        var tabComponents = Ext.getCmp('mainTab').items.items;

        var ix, ixLen;
        for (ix = 0, ixLen = tabComponents.length; ix < ixLen; ix++) {
            tabComponents[ix].isDestroyStart = true;
        }

        while (tabComponents.length > 0) {
            tabComponents[0].destroy();
        }

        Ext.Object.clear(Repository);
        window.Repository = {
            instances         : [],    // 인스턴스 이름
            sgaframes         : [],    // RealTime sgaStatus Frames
            activeSessionFrame: [],    // session Frames
            onProcessListDraw : null,  // Process list draw event
            racGroup          : {},
            reqSocketCount    : 0,
            onFrameDraw       : null,

            alarmListInfo     : {},
            alarmStatsData    : {},
            alarmServers      : [],
            trendChartData    : {},
            trendDataLog      : {},
            statListData      : {},     // trendchart 의 statlist 에 필요한 데이터

            tmadminChartData  : {},
            tmadminDataLog    : {},

            TP3SecTrendData   : {},
            TP3SecTrendLog    : {},

            responseStatus    : {},
            responseStatusLog : {},

            WasSessionData    : {},
            WasSessionDataLog : {},

            OsStatExtend      : {},
            OsStatExtendLog   : {},

            WebToBSIData      : {},
            WebToBSIDataLog   : {},

            WebToBCIData      : {},
            WebToBCIDataLOg   : {},

            WebTrendData      : {},
            WebTrendDataLog   : {},

            CDTrendData       : {},
            CDTrendDataLog    : {},

            Activity          : {},     // 실시간 패킷 데이터
            ActiveTxn         : {},
            WasStat           : {},     // 실시간 패킷 데이터
            WasStatChart      : {},
            WasMonitorDaily   : {},
            DBCPU             : {},     // 실시간 패킷 데이터
            DBCpuLastTime     : {},     // DB CPU 패킷 마지막 시간
            DBStat            : {},     // 실시간 패킷 데이터
            DBStatLastTime    : {},     // DB Stat 패킷 마지막 시간
            JVMGCStat         : {},
            JVMGCStatChart    : {},
            JVMGCMax          : {},
            Lock              : {},
            Service           : {},
            Alarm             : {},     // 실시간 알람 데이터
            processStatus     : {},
            Others            : {},
            txnError          : {},

            BizData           : {},     // 업무 관점 패킷 데이터
            BizTrendData      : {},     // 업무 관점 패킷 데이터 (성능 지표 차트)
            BizTrendDataLog   : {},     // 업무 관점 패킷 데이터 (성능 지표 차트 로그)

            ActivityServerIP  : [],     // 실시간 패킷 데이터 Activitiy Server IP
            ActivityIPAddTime : []      // Activitiy IP 시간
        };
        Repository.trendChartData.timeRecordData   = [];
        Repository.tmadminChartData.timeRecordData = [];
        Repository.responseStatus.timeRecordData   = [];
        Repository.OsStatExtend.timeRecordData     = [];
        Repository.WebTrendData.timeRecordData     = [];
        Repository.CDTrendData.timeRecordData      = [];

        Ext.Object.clear(gcStat);
        window.gcStat = {
            names: ['EdenUsage', 'OldUsage', 'PermUsage', 'GCTime', 'GCCount', 'ClassCount'],
            YGC      : null,
            FGC      : null,
            YGCT     : null,
            FGCT     : null,
            Loaded   : null,
            UnLoaded : null,
            EU       : null,
            OU       : null,
            PU       : null
        };

        window.isAddWeb    = false;
        window.wasLastTime = null;

        if (Comm.RTComm.realtime) {
            Comm.RTComm.realtime.WasModeSelected  = [];
            Comm.RTComm.realtime.selectedTPNames  = [];
            Comm.RTComm.realtime.selectedTuxNames = [];
            Comm.RTComm.realtime.selectedWebNames = [];
        }

        Comm.RTComm.hideRtmViewSelectBtn();

        Comm.rtmShow     = false;
        Comm.rtmTPShow   = false;
        Comm.rtmTuxShow  = false;
        Comm.rtmWebShow  = false;
        Comm.rtmCDShow   = false;
        Comm.rtmWE2EShow = false;

        Comm.isE2EMonitor = false;

        Comm.Status = {
            WAS: {},
            DB: {},
            WebServer: {},
            CD: {}
        };

        Ext.Object.clear(Comm.onActivityTarget);
        Comm.onActivityTarget = [];

        Ext.Object.clear(Comm.onProcessMonitorTarget);
        Comm.onProcessMonitorTarget = [];

        Ext.Object.clear(bullet_alert_object);

        Ext.Object.clear(common.RTMDataManager.agentManager);
        Ext.Object.clear(common.RTMDataManager.txnTrendData);
        Ext.Object.clear(common.RTMDataManager.txnMonitorInfo);
    }


});