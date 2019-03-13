Ext.define('Exem.chart.D3ScatterSelectable', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    normalColor: '#14b4be',
    normalOverColor: '#a3d3ff',
    exceptionColor: 'red',
    exceptionOverColor: '#ff00ff',

    // 필수
    type: null,  // live, detail, detailLive
    target: null,

    liveDataRetention: 360,
    liveInterval: 1,
    minuteIntervalOfTimeTicks: 2,
    timeTolerance: 120,
    slowCriteria: 1,
    defaultMaxElapse: 100,
    detailScatterYRange: 'dataSensitive',

    parentView: null,
    invisible: false,
    dataTarget: null,
    liveTask: null,
    isPaused: false,
    lastRetrievedRange: null,
    fromTime: null,
    toTime: null,
    slowScatterHeightRatio: null,

    onSparkle: false,

    customYaxisMax : null,
    normalYaxisMax : 0,
    maxOverCount   : 0,
    maxTimeValue   : 0,
    customRectSize : null,
    isAutoScale    : false,
    sliderMax      : 0,
    delayCount     : 0,
    tmpMinY : 0,
    tmpMaxY : 0,

    lastSelectRange : null,

    isDistribution : false,

    constructor: function(config) {
        var me = this;
        this.mixins.observable.constructor.call (this);

        me.yRange = [];
        me.liveData = [];
        me.lastData = [];
        me.lastScatterData = [];

        var keys = Object.keys(config), key,
            ix, ixLen;

        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];
            this[key] = config[key];
        }

        if (String(localStorage.getItem('rumbleFish_slowCriteria')) !== 'null') {
            this.slowCriteria = Number(localStorage.getItem('rumbleFish_slowCriteria'));
        }

        this.initCanvas = _.once(function() {
            var target = document.getElementById(me.target.id + '-body'),
                c = document.createElement('canvas'),
                c2 = document.createElement('canvas');

            c.width = target.clientWidth;
            c.height = target.clientHeight;
            c.style.position = 'absolute';
            c2.width = target.clientWidth;
            c2.height = target.clientHeight;
            c2.style.position = 'absolute';
            target.appendChild(c);
            target.appendChild(c2);
            me.canvas = c;
            me.canvasHigh = c2;
            me.ctx = c.getContext('2d');
            me.ctxHigh = c2.getContext('2d');
            me.ctxHigh.globalAlpha = 0.5;
            me.ctx.lineWidth = 1;
            me.initDrawSparkle = _.once(me.drawSparkle);
            me.drawSparkleStatus = false;
        });

        if (this.type == 'live') {
            this._initLiveScatter();
        }
    },

    listeners: {
        ondata: function(data, fromTime, toTime) {
            this.fromTime = fromTime;
            this.toTime = toTime;
            this.draw(data, this.parentView.scatterWidth, this.parentView.scatterHeight);
        },

        dataTargetActivate: function(target) {
            this.dataTarget = target;
            this.generateScatterData(this.liveData);
        },

        resize: function() {
            if (this.type == 'detail' && this.parentView.retrRangeBeforeDragDetail !== null) {
                this.parentView.setRetrieveRange(this.parentView.retrRangeBeforeDragDetail);
                if (!this.isDistribution) {
                    this.parentView.clearFilterGrid();
                }
            }

            var target = document.getElementById(this.target.id + '-body');

            if (this.canvas !== undefined) {
                this.canvas.width = target.clientWidth;
                this.canvas.height = target.clientHeight;
                this.canvasHigh.width = target.clientWidth;
                this.canvasHigh.height = target.clientHeight;
                this.ctxHigh.globalAlpha = 0.5;
            }

            this.parentView.scatterWidth  = target.clientWidth;
            this.parentView.scatterHeight = target.clientHeight;
            this.draw(null , this.parentView.scatterWidth, this.parentView.scatterHeight);
        },

        beforeDestroy: function() {
            Ext.Array.remove(Comm.onActivityTarget, this);

            if (this.liveTask) {
                clearTimeout(this.liveTask);
            }

            if (this.sparkleTimer) {
                clearTimeout(this.sparkleTimer);
                this.drawSparkleStatus = false;
            }


            this.removeElement();
            this.lastData.length = 0;
            this.lastData = [];
        }
    },

    _initLiveScatter: function() {
        var me = this;

        if (Comm.isRandomMode) {
            this.initRandomPush();
        }

        this.liveOutput = [];
        this.liveOutputLength = 0;
        this.liveOverData = [];
        this.recvDataWasStatus = [];
        this.toTimeIdx = 0;
        this.fromTimeIdx = 1;
        this.isFirstPush = true;
        this.delayCount = 0;
        this.onceLoadPastData = _.once(this.loadPastData);

        var ix;
        for (ix = 0; ix < Comm.wasIdArr.length; ix++) {
            me.recvDataWasStatus[ix] = {wasId : Comm.wasIdArr[ix], status : 0};
        }

        for (ix = 0; ix <  this.liveDataRetention; ix++) {
            this.liveData.push([]);

            _.each(Comm.wasIdArr, function(v) {
                me.liveData[ix][v] = [];
            });
        }

        this.generateScatterData();
        this.draw(this.liveOutput, this.parentView.scatterWidth, this.parentView.scatterHeight);

        Comm.onActivityTarget.push(this);

        this._initLiveTimer();
    },

    _initLiveTimer: function() {
        var me = this;

        if (this.liveTask) {
            clearTimeout(this.liveTask);
        }

        this.liveTask = setTimeout(function() {
            me.generateScatterData();

            me.draw(null , this.parentView.scatterWidth, this.parentView.scatterHeight);

            me._initLiveTimer();
        }, this.liveInterval * 1000);
    },

    pauseLiveScatter: function() {
        this.isPaused = true;
    },

    resumeLiveScatter: function() {
        this.isPaused = false;
        //this.draw();
    },

    initRandomPush: function() {
        var me = this;
        var data = {rows:[]};
        var probability = 0, exception = 0, elapse = 0;
        var time = new Date(),
            i;

        setInterval(function() {
            data = {rows:[]};
            time = new Date();

            for (i = 0; i < 2000; i++) {
                data.rows.push([time, 0, [], Math.floor(Math.random() * 10) + 1]);
                probability = Math.floor(Math.random() * 10000) + 1;

                if (probability >= 10000) {
                    elapse = Math.floor(Math.random() * 70000) + 100000;
                } else if (probability > 9990) {
                    elapse = Math.floor(Math.random() * 87000) + 13000;
                } else if (probability > 9000) {
                    elapse = Math.floor(Math.random() * 10000) + 3000;
                } else {
                    elapse = Math.floor(Math.random() * 3000);
                }

                if (i % 1000 == 0) {
                    exception = 1;
                }

                data.rows[i][2].push([elapse, exception]);
            }
            me.pushData(null, data);
        }, 1000);
    },

    pushData: function(header, data) {
        var me = this;

        var ix, jx, jxLen, kx, kxLen;
        var wasId, elapse, tmp, diffSec, endTxns, idx, time;
        var yaxisMax;
        me.lastScatterData = [];

        this.lastToTime = this.toTime;
        this.toTime = Math.floor(
            _.max(data.rows, function(activity) {
                if (activity[2].length > 0) {
                    return activity[0];
                } else {
                    return 0;
                }
            })[0] / 1000
        ) * 1000;

        if (this.isFirstPush && this.toTime < (+new Date(realtime.lastestTime))) {
            this.toTime = +new Date(realtime.lastestTime);
        } else if (this.lastToTime > this.toTime) {
            this.toTime = this.lastToTime;
        }

        this.fromTime = this.toTime - this.liveDataRetention * 1000;

        if (!this.isFirstPush && this.lastToTime < this.toTime) {
            diffSec = Math.floor((this.toTime - this.lastToTime) / 1000);

            for (ix = 1; ix <= diffSec; ix++) {
                this.toTimeIdx++;
                if (this.toTimeIdx > me.liveDataRetention - 1) {
                    this.toTimeIdx = 0;
                }

                wasId = Object.keys(this.liveData[this.toTimeIdx] || {});
                for (jx = 0, jxLen = wasId.length; jx < jxLen; jx++) {
                    tmp = this.liveData[this.toTimeIdx][wasId[jx]];
                    elapse = Object.keys(tmp || {});

                    for (kx = 0, kxLen = elapse.length; kx < kxLen; kx++) {
                        tmp[elapse[kx]] = 0;
                    }
                }
            }

            if (this.toTimeIdx == me.liveDataRetention - 1) {
                this.fromTimeIdx = 0;
            } else {
                this.fromTimeIdx = this.toTimeIdx + 1;
            }
        }

        if (this.isFirstPush) {
            setTimeout(function() {
                this.onceLoadPastData();
            }.bind(this), 2500);
        }

        this.isFirstPush = false;

        for (ix = 0; ix < data.rows.length; ix++) {
            me.tmpData = data.rows[ix];

            if (me.tmpData[0] >= this.fromTime ) {

                endTxns = me.tmpData[2];
                wasId = me.tmpData[3];
                time = Math.floor( me.tmpData[0] / 1000 ) * 1000;
                diffSec = Math.floor((this.toTime - time) / 1000);

                // 설정된 WAS 이외의 ID가 들어오는 경우 넘김.
                if (Comm.wasIdArr.indexOf(wasId) == -1) {
                    continue;
                }

                if (this.toTimeIdx - diffSec < 0) {
                    idx = me.liveDataRetention - (diffSec - this.toTimeIdx);
                } else {
                    idx = this.toTimeIdx - diffSec;
                }

                for (jx = 0; jx < endTxns.length; jx++) {
                    elapse = endTxns[jx][0];

                    elapse < 100 ? elapse = 0 : elapse = Math.round(elapse / 100);

                    if (elapse < 8640000) {          // 10일보다 큰 elapse 데이터 버림.(임의값)
                        if (endTxns[jx][1] > 0) {
                            // exception이면
                            this.liveData[idx][wasId][elapse] = 10000;
                        } else {
                            if (this.liveData[idx][wasId][elapse] != 10000) {
                                this.liveData[idx][wasId][elapse] = 1;
                            }
                        }

                        if (this.onSparkle) {
                            if (Comm.selectedWasArr.indexOf(wasId) != -1) {
                                yaxisMax = this.customYaxisMax || this.normalYaxisMax;
                                if (yaxisMax > elapse / 10) {
                                    me.lastScatterData.push([time, elapse / 10, endTxns[jx][1], wasId]);
                                }
                            }
                        }

                    }
                }
                endTxns = null;
            }
        }

        if (this.onSparkle) {
            me.lastScatterData = _.sortBy(me.lastScatterData, function(d) {
                return -(d[1]);
            });
            me.lastScatterData.length = 5;
        }
    },

    loadPastData: function() {
        var me = this;
        var ix, wasId, elapse, tmp, diffSec, idx;

        if (this.toTime < +(new Date(realtime.lastestTime))) {
            this.toTime = +new Date(realtime.lastestTime);
        }

        this.fromTime = this.toTime - (this.liveDataRetention * 1000);

        WS.SQLExec({
            sql_file: 'IMXRT_Scatter_loadpastdata.sql',
            bind: [{
                name: 'fromTime', value: Ext.Date.format( new Date(this.fromTime), 'Y-m-d H:i:s' ), type: SQLBindType.STRING
            }, {
                name: 'toTime', value: Ext.Date.format( new Date(this.toTime), 'Y-m-d H:i:s' ), type: SQLBindType.STRING
            }, {
                name: 'time_zone', value: new Date().getTimezoneOffset() * 60 * -1, type: SQLBindType.INTEGER
            }],
            replace_string: [{
                name: 'wasId', value: Comm.wasIdArr.join(',')
            }]
        }, function(header, data) {

            for (ix = 0; ix < data.rows.length; ix++) {
                tmp = data.rows[ix];

                if (tmp[0] > me.fromTime ) {

                    wasId = tmp[1];
                    elapse = Math.abs(tmp[2]);
                    diffSec = Math.floor((me.toTime - (Math.floor( tmp[0] / 1000 ) * 1000)) / 1000);

                    if (me.toTimeIdx - diffSec < 0) {
                        idx = me.liveDataRetention - (diffSec - me.toTimeIdx);
                    } else {
                        idx = me.toTimeIdx - diffSec;
                    }

                    if (tmp[2] < 0) {
                        // exception이면
                        me.liveData[idx][wasId][elapse] = 10000;
                    } else {
                        if (me.liveData[idx][wasId][elapse] != 10000) {
                            me.liveData[idx][wasId][elapse] = 1;
                        }
                    }
                }
            }
        });

    },

    generateScatterData: function() {

        var ix, jx, jxLen, kx, kxLen, elapse, d;
        var outIdx = 0;
        var idx = this.fromTimeIdx;
        var time = this.fromTime;

        for (ix = 0; ix < this.liveDataRetention; ix++) {

            for (jx = 0, jxLen = Comm.selectedWasArr.length; jx < jxLen; jx++) {

                d = this.liveData[idx][Comm.selectedWasArr[jx]];
                elapse = Object.keys(d || {});

                for (kx = 0, kxLen = elapse.length; kx < kxLen; kx++) {
                    if (d[elapse[kx]] == 0) {
                        continue;
                    }

                    if (d[elapse[kx]] == 1) {
                        if (outIdx >= this.liveOutputLength) {
                            this.liveOutput[outIdx] = [time, elapse[kx] / 10, true];
                        } else {
                            this.liveOutput[outIdx][0] = time;
                            this.liveOutput[outIdx][1] = elapse[kx] / 10;
                            this.liveOutput[outIdx][2] = true;
                        }
                    } else if (d[elapse[kx]] == 10000) {
                        if (outIdx >= this.liveOutputLength) {
                            this.liveOutput[outIdx] = [time, elapse[kx] / 10, false];
                        } else {
                            this.liveOutput[outIdx][0] = time;
                            this.liveOutput[outIdx][1] = elapse[kx] / 10;
                            this.liveOutput[outIdx][2] = false;
                        }
                    }

                    if (!this.isAutoScale) {
                        if (this.customYaxisMax < (elapse[kx] / 10)) {
                            this.setOverData(time, elapse[kx] / 10);
                        }
                    }

                    outIdx++;
                }
            }
            time += 1000;

            if (idx < this.liveDataRetention - 1) {
                idx++;
            } else {
                idx = 0;
            }
        }

        this.liveOutput.length = outIdx;
        this.liveOutputLength = outIdx;

        if (this.dataTarget != null) {
            this.dataTarget.fireEvent('ondata', this.liveOutput, this.fromTime, this.toTime);
        }
    },

    removeElement: function() {
        var panel = d3.select('#' + this.target.id + '-body');
        panel.select('svg').selectAll('rect').remove();
        panel.select('svg').remove();
        panel = null;
    },

    draw: function(dataOrigin, width, height) {
        var me = this;
        var data;

        // Drag Event 처리
        var selectZoneTop, selectZoneBottom,
            selectZoneLeft, selectZoneRight,
            lastSelectedZone, selectZoneMinLimit = 10,
            pointer0, pointer1,
            minX, minY, maxX, maxY,
            lastMinX, lastMinY, lastMaxX, lastMaxY,
            isSelectedZoneClick, selectRectTop;

        var isMouseUpExecute, isMouseMoveExecute;

        var isExistDetailSelectZone = false,
            isClearDetailSelectZone = false;


        if (me.isPaused || me.invisible) {
            return;
        }

        if (this.type != 'detail') {
            data = this.liveOutput;
        } else if (arguments[0]) {
            data = dataOrigin;
            this.lastData.length = 0;
            this.lastData = dataOrigin;
        } else {
            data = this.lastData;
        }

        this.removeElement();

        var leftMargin = 50,
            margin = 25;
        this.width = width;
        this.height = height;
        this.leftMargin = leftMargin;
        this.margin = margin;

        var x_extent = null;
        var y_slow_extent = null;
        var rectSize = 0, max_elapse;

        if (this.fromTime !== null && this.toTime !== null) {
            x_extent = [ this.fromTime, this.toTime ];
        } else {
            x_extent = d3.extent(data, function(d) {
                return d[0];
            });
        }

        var x_scale = d3.time.scale()
            .range([leftMargin, width - margin])
            .domain(x_extent);
        this.x_scale = x_scale;

        var x_axis = d3.svg.axis()
            .scale(x_scale)
            .tickSize(0)
            .tickPadding(5);

        if (this.type == 'live' || this.type == 'detailLive') {
            rectSize = this.customRectSize || 3;
            x_axis.ticks(d3.time.minutes, me.minuteIntervalOfTimeTicks ).tickFormat(d3.time.format('%H:%M'));
            this.slowScatterHeightRatio = 0.4;

            y_slow_extent = [ this.slowCriteria, d3.max(data, function(d) {
                return Math.abs(d[1]);
            }) * 1.5 ];
            if (isNaN(y_slow_extent[1])) {
                y_slow_extent[1] = this.defaultMaxElapse;
            }
        } else if (this.type == 'detail') {
            rectSize = this.customRectSize || 5;
            x_axis.ticks(3).tickFormat(d3.time.format('%H:%M:%S'));
            this.slowScatterHeightRatio = 0;

            if (this.detailScatterYRange == 'dataSensitive') {
                this.yRange = d3.extent(data, function(d) {
                    return Math.abs(d[1]);
                });
                this.yRange = [this.yRange[0] * 0.9, this.yRange[1] * 1.1];
            } else {
                //1508.12 RT에서 Alert클릭하고오는경우 0~100 으로 y축 설정(min)
                max_elapse = d3.max(data, function(d) {
                    return Math.abs(d[1]);
                }) * 1.5;
                if (!max_elapse) {
                    max_elapse = 1;
                }
                if (isNaN(max_elapse)) {
                    max_elapse = this.yRange[1];
                }
                this.yRange = [0, max_elapse];
                max_elapse = null;
            }
        }

        this.rectSize = rectSize;
        var slowScatterHeight = Math.floor((height - margin - margin) * this.slowScatterHeightRatio);
        var normalScatterHeight = height - slowScatterHeight - margin * 2;

        var y_scale = d3.scale.linear()
            .range([height - margin, margin]);
        this.y_scale = y_scale;

        var y_axis = d3.svg.axis()
            .scale(y_scale)
            .orient('left')
            .tickSize((-width + leftMargin + margin), 0, 0)
            .tickPadding(15)
            .tickFormat(function(d) {
                var prefix = d3.formatPrefix(d);
                if (d >= 1000) {
                    return prefix.scale(d) + prefix.symbol;
                } else {
                    return d;
                }
            });

        var maxDomain;
        if (this.type == 'detail') {
            maxDomain = this.customYaxisMax || me.yRange[1];
            y_scale.domain( [0, maxDomain] );
            y_axis.ticks(10);

            this.normalYaxisMax = me.yRange[1];
        } else {
            maxDomain = this.customYaxisMax || y_slow_extent[1];
            y_scale.domain([0, maxDomain]);
            y_axis.ticks(4)
                //.tickFormat(d3.format(',.1f'))
                .tickSize((-width + leftMargin + margin), 0, 0 )
                .tickPadding(20);

            this.normalYaxisMax = y_slow_extent[1];
        }

        me.initCanvas();
        var y;
        me.ctx.clearRect(0, 0, width, height);

        var svg = d3.select('#' + this.target.id + '-body')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('position', 'absolute');

        var dr = rectSize / 2;
        var tempData, exceptionData = [], pa_except = [];

        if (me.type != 'detail') {

            me.ctx.strokeStyle = 'lightgrey';
            me.ctx.lineWidth = 1;

            me.maxOverCount = 0;
            me.maxTimeValue = 0;

            _.each(data, function(d) {
                if (d[2]) {      // Normal
                    if (!me.isAutoScale && d[1] > me.customYaxisMax) {
                        me.maxOverCount++;
                        me.maxTimeValue = Math.max(me.maxTimeValue, d[1]);

                        me.ctx.fillStyle = me.normalOverColor;
                        y = y_scale( me.customYaxisMax );
                    } else {
                        if (maxDomain - 0.1 < d[1]) {
                            return;
                        }
                        me.ctx.fillStyle = me.normalColor;
                        y = y_scale( d[1] );
                    }

                    me.ctx.beginPath();
                    me.ctx.arc(Math.round(x_scale(d[0])) + dr, Math.round(y) + dr, dr, 0, 2 * Math.PI);
                    me.ctx.closePath();
                    me.ctx.fill();
                } else {               // Exception
                    tempData = [];
                    tempData.push(d[0]);
                    tempData.push(d[1]);
                    exceptionData.push(tempData);
                }
            });

            _.each(exceptionData, function(d) {
                if (!me.isAutoScale && d[1] > me.customYaxisMax) {
                    me.maxOverCount++;
                    me.maxTimeValue = Math.max(me.maxTimeValue, d[1]);

                    me.ctx.fillStyle = me.exceptionOverColor;
                    y = y_scale( me.customYaxisMax );
                } else {
                    if (maxDomain - 0.1 < d[1]) {
                        return;
                    }
                    me.ctx.fillStyle = me.exceptionColor;
                    y = y_scale( d[1] );

                }

                me.ctx.beginPath();
                me.ctx.arc(Math.round(x_scale(d[0])) + dr, Math.round(y) + dr, dr, 0, 2 * Math.PI);
                me.ctx.closePath();
                me.ctx.fill();
            });

            if (!this.drawSparkleStatus) {
                me.drawSparkle();
                this.drawSparkleStatus = true;
            }

            exceptionData = null;
        } else {

            _.each(data, function(d) {
                if (d[1] >= 0) {      // Normal
                    me.ctx.fillStyle = me.normalColor;
                    y = y_scale( d[1] );

                    me.ctx.beginPath();
                    me.ctx.arc(Math.round(x_scale(d[0])) + dr, Math.round(y) + dr, dr, 0, 2 * Math.PI);
                    me.ctx.closePath();
                    me.ctx.fill();
                } else {               // Exception
                    tempData = [];
                    tempData.push(d[0]);
                    tempData.push(+d[1].toFixed(3));
                    pa_except.push(tempData);
                }
            });

            _.each(pa_except, function(d) {
                me.ctx.fillStyle = me.exceptionColor;
                y = y_scale( -(d[1]) );

                me.ctx.beginPath();
                me.ctx.arc(Math.round(x_scale(d[0])) + dr, Math.round(y) + dr, dr, 0, 2 * Math.PI);
                me.ctx.closePath();
                me.ctx.fill();
            });

            pa_except = null;

            if (!arguments[0] && me.lastSelectRange) {

                isSelectedZoneClick = false;

                selectRectTop = svg.append('rect').attr('class','selectZone');
                lastSelectedZone = svg.append('rect').attr('class','lastSelectedZone');
                me.lastSelZone = lastSelectedZone;

                minX = me.x_scale(me.lastSelectRange.invMinX);
                maxX = me.x_scale(me.lastSelectRange.invMaxX);
                minY = me.y_scale(me.lastSelectRange.invMinY);
                maxY = me.y_scale(me.lastSelectRange.invMaxY);

                lastMinX = minX, lastMinY = minY, lastMaxX = maxX, lastMaxY = maxY;

                pointer0 = [minX, maxY];

                minX < me.leftMargin - 1 ? minX = me.leftMargin - 1 : {};
                maxX > me.width - me.margin + rectSize ? maxX = me.width - me.margin + rectSize : {};
                minY < 0 ? minY = 0 : {};
                maxY > me.height - me.margin + 2 ? maxY = me.height - me.margin + 2 : {};

                if (maxY - minY >= selectZoneMinLimit && maxX - minX >= selectZoneMinLimit) {
                    selectRectTop
                        .attr('x', me.leftMargin)
                        .attr('y', 0)
                        .attr('width', me.width - me.leftMargin - me.margin + rectSize)
                        .attr('height', minY);

                    svg.select('rect.lastSelectedZone')
                        .attr('x', minX + rectSize / 2)
                        .attr('y', minY + rectSize / 2)
                        .attr('width', maxX - minX - rectSize / 2)
                        .attr('height', maxY - minY);

                    svg.select('rect.lastSelectedZoneDetail')
                        .attr('x', minX + rectSize / 2)
                        .attr('y', minY + rectSize / 2)
                        .attr('width', maxX - minX - rectSize / 2)
                        .attr('height', maxY - minY);

                    if (me.type !== 'live') {
                        svg.select('rect.lastSelectedZone').attr('class', 'lastSelectedZoneDetail');
                    }

                    afterDrag(invertCoordinate());
                }

            }
        }

        svg.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 0);

        svg.append('g')
            .attr('class', 'axis scatterGrid d3scatter-axis-' + me.type)
            .attr('transform', 'translate(0,' + (rectSize + normalScatterHeight + slowScatterHeight + margin) + ')')
            .call(x_axis);

        svg.append('g')
            .attr('class', 'axis scatterGrid d3scatter-axis-' + me.type)
            .attr('transform', 'translate(' + leftMargin + ',' + rectSize + ')')
            .call(y_axis);

        svg.selectAll('.d3scatter-axis-live > g > text')
            .style({'font-family': "'Droid Sans','NanumGothic'", 'font-size': '8pt'});


        // 조회 영역을 Inspector의 Live Scatter에 표시해줌.
        //if ( this.type == 'detailLive' && this.lastRetrievedRange != null) {
        //
        //    tmpTo = this.x_scale( this.lastRetrievedRange['timeRange'][1]);
        //    tmpFrom = this.x_scale( this.lastRetrievedRange['timeRange'][0] );
        //
        //    if ( this.lastRetrievedRange['elapseRange'][0]/1000 < this.slowCriteria )
        //        tmpMin = this.y_scale( this.lastRetrievedRange['elapseRange'][0]/1000 );
        //    else
        //        tmpMin = this.y_slow_scale( this.lastRetrievedRange['elapseRange'][0]/1000 );
        //
        //    if ( this.lastRetrievedRange['elapseRange'][1]/1000 < this.slowCriteria )
        //        tmpMax = this.y_scale( this.lastRetrievedRange['elapseRange'][1]/1000 );
        //    else
        //        tmpMax = this.y_slow_scale( this.lastRetrievedRange['elapseRange'][1]/1000 );
        //
        //    lastMinX = tmpFrom;
        //    lastMaxX = tmpTo;
        //    lastMinY = tmpMax;
        //    lastMaxY = tmpMin;
        //
        //    if ( tmpFrom >= leftMargin ) {
        //        svg.append('rect')
        //            .attr('x', tmpFrom)
        //            .attr('y', tmpMax)
        //            .attr('width', tmpTo - tmpFrom)
        //            .attr('height', tmpMin - tmpMax)
        //            .attr('class', 'lastSelectedZoneDetail')
        //    }
        //}


        svg.on('mousedown', function() {
            if (me.retrieveLoading) {
                return;
            }
            pointer0 = d3.mouse(this);

            // margin 영역의 mousedown은 무시
            if (pointer0[0] < me.leftMargin || pointer0[0] > me.width - me.margin) {
                return;
            }

            if (pointer0[1] < 10 || pointer0[1] > me.height - me.margin) {
                return;
            }

            minX = maxX = pointer0[0];
            minY = maxY = pointer0[1];

            isMouseUpExecute   = false;
            isMouseMoveExecute = false;

            if (me.type !== 'detail') {
                me.pauseLiveScatter();
            }

            svg.select('circle.focus').remove();

            selectZoneTop = svg.append('rect').attr('class','selectZone');
            selectZoneBottom = svg.append('rect').attr('class','selectZone');
            selectZoneLeft = svg.append('rect').attr('class','selectZone');
            selectZoneRight = svg.append('rect').attr('class','selectZone');


            if (pointer0[0] > lastMinX && pointer0[0] < lastMaxX && pointer0[1] > lastMinY && pointer0[1] < lastMaxY) {
                isSelectedZoneClick = true;
            } else {
                isSelectedZoneClick = false;
                svg.select('rect.lastSelectedZone').remove();
                svg.select('rect.lastSelectedZoneDetail').remove();
                lastSelectedZone = svg.append('rect').attr('class','lastSelectedZone');
                me.lastSelZone = lastSelectedZone;
            }
            d3.event.preventDefault();
        })
            .on('mousemove', function() {

                var diff;

                if (me.retrieveLoading) {
                    return;
                }
                if (!selectZoneTop) {
                    return;
                }

                pointer1 = d3.mouse(this);

                if (isSelectedZoneClick) {
                    diff = [pointer1[0] - pointer0[0], pointer1[1] - pointer0[1]];
                    minX = lastMinX + diff[0];
                    maxX = lastMaxX + diff[0];
                    minY = lastMinY + diff[1];
                    maxY = lastMaxY + diff[1];
                } else {
                    minX = Math.min(pointer0[0], pointer1[0]);
                    maxX = Math.max(pointer0[0], pointer1[0]);
                    minY = Math.min(pointer0[1], pointer1[1]);
                    maxY = Math.max(pointer0[1], pointer1[1]);
                }

                minX < me.leftMargin - 1 ? minX = me.leftMargin - 1 : {};
                maxX > me.width - me.margin + rectSize ? maxX = me.width - me.margin + rectSize : {};
                minY < 0 ? minY = 0 : {};
                maxY > me.height - me.margin + 2 ? maxY = me.height - me.margin + 2 : {};

                if (maxY - minY >= selectZoneMinLimit && maxX - minX >= selectZoneMinLimit) {
                    selectZoneTop
                        .attr('x', me.leftMargin)
                        .attr('y', 0)
                        .attr('width', me.width - me.leftMargin - me.margin + rectSize)
                        .attr('height', minY);

                    svg.select('rect.lastSelectedZone')
                        .attr('x', minX + rectSize / 2)
                        .attr('y', minY + rectSize / 2)
                        .attr('width', maxX - minX - rectSize / 2)
                        .attr('height', maxY - minY);

                    svg.select('rect.lastSelectedZoneDetail')
                        .attr('x', minX + rectSize / 2)
                        .attr('y', minY + rectSize / 2)
                        .attr('width', maxX - minX - rectSize / 2)
                        .attr('height', maxY - minY);

                    if (me.type !== 'live') {
                        svg.select('rect.lastSelectedZone').attr('class', 'lastSelectedZoneDetail');
                    }
                } else {
                    selectZoneTop.attr('width', 0).attr('height', 0);
                    selectZoneBottom.attr('width', 0).attr('height', 0);
                    selectZoneLeft.attr('width', 0).attr('height', 0);
                    selectZoneRight.attr('width', 0).attr('height', 0);
                    lastSelectedZone.attr('width', 0).attr('height', 0);
                }

                // svg 경계 근처까지 드래그 하면 액션 중지
                if (pointer1[0] < 25 || pointer1[0] > me.width - 5 || pointer1[1] < 5 || pointer1[1] > me.height - 10) {
                    isMouseMoveExecute = true;

                    clearSelectZone();

                    if (maxY - minY < selectZoneMinLimit && maxX - minX < selectZoneMinLimit) {
                        lastSelectedZone.remove();
                        me.resumeLiveScatter();
                        return;
                    }
                    me.tmpMinY = me.y_scale.invert(maxY);
                    me.tmpMaxY = me.y_scale.invert(minY);

                    if (me.lastSelectRange) {
                        me.lastSelectRange.invMinX = me.x_scale.invert(minX);
                        me.lastSelectRange.invMaxX = me.x_scale.invert(maxX);
                        me.lastSelectRange.invMinY = me.y_scale.invert(minY);
                        me.lastSelectRange.invMaxY = me.y_scale.invert(maxY);
                    }

                    afterDrag( invertCoordinate() );
                }
            })
            .on('mouseup', function() {
                if (me.retrieveLoading) {
                    return;
                }
                isMouseUpExecute = true;

                clearSelectZone();
                me.tmpMinY = me.y_scale.invert(maxY);
                me.tmpMaxY = me.y_scale.invert(minY);

                if (me.lastSelectRange) {
                    me.lastSelectRange.invMinX = me.x_scale.invert(minX);
                    me.lastSelectRange.invMaxX = me.x_scale.invert(maxX);
                    me.lastSelectRange.invMinY = me.y_scale.invert(minY);
                    me.lastSelectRange.invMaxY = me.y_scale.invert(maxY);
                }


                if (maxY != undefined && minY != undefined) {
                    if (selectZoneMinLimit) {
                        if ( maxY - minY < selectZoneMinLimit && maxX - minX < selectZoneMinLimit) {

                            if (me.type == 'live' || me.type == 'detailLive') {
                                lastSelectedZone.remove();

                                me.resumeLiveScatter();
                                return;
                            } else if (me.type == 'detail') {
                                if (isExistDetailSelectZone) {
                                    isClearDetailSelectZone = true;
                                    minX = me.leftMargin - 1;
                                    maxX = me.width - me.margin + rectSize;
                                    minY = 0;//me.margin;
                                    maxY = me.height - me.margin + 2;
                                } else {
                                    return;
                                }
                            }
                        }
                        afterDrag( invertCoordinate() );
                    }
                }
            })
            .on('mouseleave', function() {
                if (me.retrieveLoading) {
                    return;
                }
                if (me.type == 'live' || me.type == 'detailLive') {
                    if (pointer1 !== null && isMouseUpExecute === false && isMouseMoveExecute === false) {
                        clearSelectZone();

                        if (maxY - minY < selectZoneMinLimit && maxX - minX < selectZoneMinLimit) {
                            lastSelectedZone.remove();
                            me.resumeLiveScatter();
                            return;
                        }
                        me.tmpMinY = me.y_scale.invert(maxY);
                        me.tmpMaxY = me.y_scale.invert(minY);

                        afterDrag( invertCoordinate() );
                    }
                }
            });

        function clearSelectZone() {
            if (selectZoneTop) {
                selectZoneTop.remove();
                selectZoneTop = null;
            }
            if (selectZoneBottom) {
                selectZoneBottom.remove();
                selectZoneBottom = null;
            }
            if (selectZoneLeft) {
                selectZoneLeft.remove();
                selectZoneLeft = null;
            }
            if (selectZoneRight) {
                selectZoneRight.remove();
                selectZoneRight = null;
            }

            if (pointer1 != null) {
                pointer1 = null;
            }

            if (me.type == 'live') {
                lastSelectedZone.remove();
            }
        }

        // 선택된 영역의 좌표값을 시간 범위와 Elapse Time 범위로 계산
        function invertCoordinate() {
            var minChartTime, maxChartTime, minTime, maxTime,
                minElapse, maxElapse, was_name, extraElapse,
                parentMinTime, parentMaxTime, tempData;

            if (me.type == 'detail') {
                minChartTime = me.x_scale.invert(minX);
                maxChartTime = me.x_scale.invert(maxX);

                minTime = minChartTime;
                maxTime = maxChartTime;

                if (+me.toTime === +maxTime) {
                    maxTime = me.toTime;
                }

                minElapse = me.y_scale.invert(maxY);
                maxElapse = me.y_scale.invert(minY);

                if (minElapse < me.parentView.tmpMinElapse) {
                    minElapse = me.parentView.tmpMinElapse;
                }

                if (maxElapse > me.parentView.tmpMaxElapse) {
                    maxElapse = me.parentView.tmpMaxElapse;
                }
                parentMinTime = new Date(me.parentView.tmpFromVal);
                parentMaxTime = new Date(me.parentView.tmpToVal);

                if (minTime.getTime() < parentMinTime.getTime()) {
                    minTime = parentMinTime;
                }

                if (maxTime.getTime() > parentMaxTime.getTime()) {
                    maxTime = parentMaxTime;
                }
            } else {
                minTime = new Date(me.x_scale.invert(minX).setMilliseconds(me.x_scale.invert(minX).getMilliseconds() - 500));
                maxTime = new Date(me.x_scale.invert(maxX).setMilliseconds(me.x_scale.invert(maxX).getMilliseconds() + 1000));

                minElapse = me.y_scale.invert(maxY);
                maxElapse = me.y_scale.invert(minY);
                if (maxElapse > me.customYaxisMax) {
                    maxElapse = me.checkOverData(+new Date(minTime), +new Date(maxTime)) || maxElapse;
                }

                if (maxElapse < (Math.round(maxElapse * 10) / 10)) {
                    extraElapse = 0.099;
                } else {
                    extraElapse = 0.049;
                }
                maxElapse = (Math.floor(maxElapse * 10) / 10) + extraElapse;

                if (minElapse < (Math.round(minElapse * 10) / 10)) {
                    extraElapse = 0.050;
                } else {
                    extraElapse = 0.001;
                }
                minElapse = (Math.floor(minElapse * 10) / 10) + extraElapse;
            }

            if (minElapse < 0) {
                minElapse = 0;
            }


            if (me.parentView.monitorType === 'CD') {
                minElapse = Math.floor(minElapse);
                maxElapse = Math.floor(maxElapse);
            } else {
                minElapse = Math.floor(minElapse * 1000);
                maxElapse = Math.floor(maxElapse * 1000);
            }

            if (minElapse > maxElapse) {
                tempData = minElapse;
                minElapse = maxElapse;
                maxElapse = tempData;
            }

            was_name = 'All';
            if (realtime) {
                if (realtime.WasModeSelected.length == 0) {
                    was_name = realtime.WasNames;
                } else {
                    was_name = realtime.WasModeSelected;
                }
            }
            return {
                timeRange  : [ minTime, maxTime ],
                elapseRange: [ minElapse, maxElapse ],
                wasName    : was_name
            };
        }

        function afterDrag(retrieveRange) {

            var inspector, mainTab,
                txnGrid, bottomTab;

            if (me.type == 'live') {

                //15.07.17 PA 화면 전환을 빠르게 하기위해서 수정 (수정전)
                // inspector = Ext.create('view.ResponseInspector', {
                //     title: common.Util.TR('Transaction Trend'),
                //     closable: true,
                //     parentScatter: me,
                //     isAllWasRetrieve: true,
                //     detailScatterYRange: 'fixed',
                //     autoRetrieveRange: retrieveRange
                // });
                // inspector.init();
                //
                // var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                // mainTab.add(inspector);
                // mainTab.setActiveTab(inspector);
                //
                // if (typeof inspector.liveScatter !== 'undefined') {
                //     inspector.liveScatter.lastRetrievedRange = retrieveRange;
                // }
                //
                // me.resumeLiveScatter();

                //15.07.17 PA 화면 전환을 빠르게 하기위해서 수정 (수정후)
                inspector = Ext.create('view.ResponseInspector', {
                    title: common.Util.TR('Transaction Trend'),
                    closable: true,
                    parentScatter: me,
                    isAllWasRetrieve: true,
                    detailScatterYRange: 'fixed',
                    autoRetrieveRange: retrieveRange
                });
                inspector.loadingMask = Ext.create('Exem.LoadingMask', {
                    target: inspector,
                    type  : 'large-whirlpool'
                });

                mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.add(inspector);
                mainTab.setActiveTab(inspector);
                inspector.loadingMask.show();

                setTimeout(function() {
                    inspector.init();

                    if (typeof inspector.liveScatter !== 'undefined') {
                        inspector.liveScatter.lastRetrievedRange = retrieveRange;
                    }
                    me.resumeLiveScatter();
                    inspector.loadingMask.hide();
                }.bind(this), 10);

            } else if (me.type == 'detailLive') {
                me.parentView._txnNameRepl = '';
                me.parentView._clientIpRepl = '';
                me.parentView._gidRepl = '';
                me.parentView._exceptionRepl = '';
                me.parentView._loginNameRepl = '';

                me.parentView.setRetrieveRange(retrieveRange);
                me.lastRetrievedRange = retrieveRange;

                me.parentView.retrieveScatter();
                me.parentView.retrieveGrid();
                me.resumeLiveScatter();
            } else if (me.type == 'detail') {
                me.tmpMinY = me.y_scale.invert(maxY);
                me.tmpMaxY = me.y_scale.invert(minY);

                if (!me.checkExistDetailData(retrieveRange)) {
                    lastMinX = minX, lastMinY = minY, lastMaxX = maxX, lastMaxY = maxY;
                    isExistDetailSelectZone = true;

                    txnGrid = me.parentView.grd_txn ? me.parentView.grd_txn : me.parentView.txnGrid;
                    bottomTab = me.parentView.bottom_tab ? me.parentView.bottom_tab : me.parentView.bottomTab;

                    if (!me.isDistribution) {
                        me.parentView.clearFilterGrid();
                        me.parentView.detailListGrid.clearRows();
                        me.parentView.detailListGrid.drawGrid();
                        txnGrid.clearRows();
                        me.parentView.detailListGrid.down('#grid_detail_list_more_btn').setVisible(false);
                        me.parentView.detailListGrid.down('#grid_detail_list_fetch_all').setVisible(false);
                        bottomTab.setActiveTab(0);
                        bottomTab.tabBar.items.items[1].setVisible(false);
                        if (bottomTab.tabBar.items.items[2]) {
                            bottomTab.tabBar.items.items[2].setVisible(false);
                        }
                        me.parentView.detailListGrid.getEl().dom.style.opacity = '1';
                        txnGrid.getEl().dom.style.opacity = '1';
                    } else {
                        me.lastSelZone.remove();
                    }

                } else {
                    me.parentView.setRetrieveRange(retrieveRange, true);

                    if (!isClearDetailSelectZone) {
                        lastMinX = minX, lastMinY = minY, lastMaxX = maxX, lastMaxY = maxY;
                        isExistDetailSelectZone = true;
                        if (me.isDistribution) {
                            if (me.parentView.monitorType == 'WEB') {
                                return;
                            }

                            var currentWidth = 1500, currentHeight  = 1000;
                            var opException, opClientIp, opTxnName, opLoginName, opGid, opTid, opPcid, opTxnCode,
                                opFetchCnt, opSQLElapseTime, opSQLExec, opTxCode, opServerName, opGid;

                            var elapseDistRange = {
                                fromTime : Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s' ),
                                toTime : Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s' ),
                                minElapse : retrieveRange.elapseRange[0],
                                maxElapse : retrieveRange.elapseRange[1],
                                clientIp : '',
                                txnName : '',
                                txCode : '',
                                serverName : '',
                                exception : '',
                                loginName : '',
                                gid : '',
                                fetchCnt : 0,
                                sqlElapseTime : 0,
                                sqlExecCnt : 0,
                                tid : 0,
                                pcid : '',
                                txnCode : '',
                                msFromTime : Ext.Date.format( retrieveRange.timeRange[0], 'Y-m-d H:i:s.u' ),
                                msToTime   : Ext.Date.format( retrieveRange.timeRange[1], 'Y-m-d H:i:s.u' )
                            };

                            if (me.parentView.monitorType === 'WAS') {
                                opException = me.parentView.opException;
                                opClientIp = me.parentView.opClientIp;
                                opTxnName = me.parentView.opTxnName;
                                opLoginName = me.parentView.opLoginName;
                                opGid = me.parentView.opGid;
                                opFetchCnt = me.parentView.opFetchCnt;
                                opSQLElapseTime = me.parentView.opSQLElapseTime;
                                opSQLExec = me.parentView.opSQLExecCnt;
                                opTid = me.parentView.opTid;
                                opPcid = me.parentView.opPcid;

                                if (opTxnName != '%') {
                                    elapseDistRange.txnName = opTxnName;
                                }

                                if (opClientIp != '%') {
                                    elapseDistRange.clientIp = opClientIp;
                                }

                                if (opLoginName != '%') {
                                    elapseDistRange.loginName = opLoginName;
                                }

                                if (opGid != '%') {
                                    elapseDistRange.gid = opGid;
                                }

                                if (opPcid !== '') {
                                    elapseDistRange.pcid = opPcid;
                                }

                                if (!opException) {
                                    elapseDistRange.exception = 'exist';
                                }

                                if (opFetchCnt) {
                                    elapseDistRange.fetchCnt = opFetchCnt;
                                }

                                if (opSQLElapseTime) {
                                    elapseDistRange.sqlElapseTime = opSQLElapseTime * 1000;
                                }

                                if (opSQLExec) {
                                    elapseDistRange.sqlExecCnt = opSQLExec;
                                }

                                if (opTid) {
                                    elapseDistRange.tid = opTid;
                                }
                                elapseDistRange.wasId = me.parentView._getWasList();
                            } else if (me.parentView.monitorType === 'CD') {
                                opException = me.parentView.opException;
                                opTxnName = me.parentView.opTxnName;
                                opTid = me.parentView.opTid;
                                opGid = me.parentView.opgid;
                                opTxnCode = me.parentView.opTxnCode;

                                if (opTxnName != '%') {
                                    elapseDistRange.txnName = opTxnName;
                                }

                                if (!opException) {
                                    elapseDistRange.exception = 'exist';
                                }

                                if (opTid) {
                                    elapseDistRange.tid = opTid;
                                }

                                if (opGid != '%') {
                                    elapseDistRange.gid = opGid;
                                }

                                if (opTxnCode != '%') {
                                    elapseDistRange.txnCode = opTxnCode;
                                }

                                elapseDistRange.wasId = me.parentView.getWasList();
                            } else if (me.parentView.monitorType === 'TP') {
                                opTxnName       = me.parentView.opTxnName;
                                opTxCode        = me.parentView.opTxCode;
                                opServerName    = me.parentView.opServerName;
                                opException     = me.parentView.opException;
                                opTid           = me.parentView.opTid;
                                opGid           = me.parentView.opgid;

                                if (opTxnName != '%') {
                                    elapseDistRange.txnName = opTxnName;
                                }

                                if (opTxCode != '%') {
                                    elapseDistRange.txCode = opTxCode;
                                }

                                if (opServerName != '%') {
                                    elapseDistRange.serverName = opServerName;
                                }

                                if (!opException) {
                                    elapseDistRange.exception = 'exist';
                                }

                                if (opTid) {
                                    elapseDistRange.tid = opTid;
                                }

                                if (opGid != '%') {
                                    elapseDistRange.gid = opGid;
                                }

                                elapseDistRange.wasId = me.parentView.getWasList();
                            } else if (me.parentView.monitorType === 'TUX') {
                                opTxnName       = me.parentView.opTxnName;
                                opServerName    = me.parentView.opServerName;
                                opException     = me.parentView.opException;
                                opTid           = me.parentView.opTid;
                                opGid           = me.parentView.opgid;

                                if (opTxnName != '%') {
                                    elapseDistRange.txnName = opTxnName;
                                }

                                if (opServerName != '%') {
                                    elapseDistRange.serverName = opServerName;
                                }

                                if (!opException) {
                                    elapseDistRange.exception = 'exist';
                                }

                                if (opTid) {
                                    elapseDistRange.tid = opTid;
                                }

                                if (opGid != '%') {
                                    elapseDistRange.gid = opGid;
                                }

                                elapseDistRange.wasId = me.parentView.getWasList();
                            } else if (me.parentView.monitorType === 'E2E') {
                                opTxnName       = me.parentView.opTxnName;
                                opClientIp      = me.parentView.opClientIp;
                                opGid           = me.parentView.opGid;
                                opTxCode        = me.parentView.opTxCode;
                                opException     = me.parentView.opException;
                                opTid           = me.parentView.opTid;

                                //ms로 변환작업
                                elapseDistRange.minElapse = elapseDistRange.minElapse / 1000;
                                elapseDistRange.maxElapse = elapseDistRange.maxElapse / 1000;

                                if (opTxnName != '%') {
                                    elapseDistRange.txnName = opTxnName;
                                }

                                if (opClientIp != '%') {
                                    elapseDistRange.clientIp = opClientIp;
                                }

                                if (opGid != '%') {
                                    elapseDistRange.gid = opGid;
                                }

                                if (opTxCode != '%') {
                                    elapseDistRange.txCode = opTxCode;
                                }

                                if (opTid) {
                                    elapseDistRange.tid = opTid;
                                }

                                if (!opException) {
                                    elapseDistRange.exception = 'exist';
                                }

                                elapseDistRange.serverType = 'E2E'; //rtmTransactionMonitor 에서는 serverType 키를 사용하고 있어 활용합니다.
                                window.selectedPopupMonitorType = me.parentView.monitorType;
                            }


                            localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(elapseDistRange));

                            var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;
                            realtime.txnPopupMonitorWindow = window.open('../txnDetail/txnDetail.html', 'hide_referrer_1', popupOptions);
                            me.lastSelZone.remove();
                        } else {
                            me.parentView.filterGrid(me.yRange);
                        }
                    } else {
                        if (!me.isDistribution) {
                            me.parentView.clearFilterGrid();
                            me.parentView.filterGrid(me.yRange, isClearDetailSelectZone);
                        }
                        lastMinX = null, lastMinY = null, lastMaxX = null, lastMaxY = null;
                        isExistDetailSelectZone = false;
                        isClearDetailSelectZone = false;
                    }
                }
            }
        }

        slowScatterHeight = null;
        normalScatterHeight = null;
        width = null;
        height = null;
        margin = null;
        y_slow_extent = null;
        x_scale = null;
        y_scale = null;
        x_axis = null;
        y_axis = null;
    },

    drawSparkle: function() {
        var me = this;

        if (!this.onSparkle) {
            return;
        }

        var frames = 4, frameCnt = 1, y = 0, dr = 0;
        var halfRectsize = me.rectSize / 2;

        function animate() {

            me.sparkleTimer = setTimeout(function() {
                requestAnimationFrame(animate);
            }, Math.floor(1000 / frames));

            me.ctxHigh.clearRect(0, 0, me.canvasHigh.width, me.canvasHigh.height);

            frameCnt <= frames / 2 ? dr += 3 : dr -= 3;

            _.each(me.lastScatterData, function(d) {
                if (d[2] == 0) {      // Normal
                    me.ctxHigh.fillStyle = me.normalColor;
                    y = me.y_scale( d[1] );
                } else if (d[2] > 0) {               // Exception
                    me.ctxHigh.fillStyle = me.exceptionColor;
                    y = me.y_scale( d[1] );
                } else {
                    return;
                }

                me.ctxHigh.beginPath();
                me.ctxHigh.arc(me.x_scale(d[0]) + halfRectsize, Math.round(y) + halfRectsize, 1 + dr, 0, 2 * Math.PI);
                me.ctxHigh.closePath();
                me.ctxHigh.fill();
            });
            if (frameCnt < frames) {
                frameCnt++;
            } else {
                frameCnt = 1;
            }

        }
        animate();
    },

    setFocus: function(time, elapse) {
        var me, svg, x, y;

        me = this;
        svg = d3.select('#' + this.target.id + '-body').select('svg');
        x = me.x_scale( +new Date(time) ) + this.rectSize / 2;

        if (x >= this.leftMargin - 3) {
            if (this.type == 'detailLive' && elapse >= this.slowCriteria) {
                y = me.y_slow_scale( elapse ) + this.rectSize / 2;
            } else {
                y = me.y_scale( elapse ) + this.rectSize / 2;
            }

            svg.selectAll('circle.focus').remove();

            svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 10)
                .attr('class', 'focus')
                .transition()
                .duration(40)
                .style('opacity', .8);
        }
    },

    checkExistDetailData: function(retrieveRange) {
        var me = this;
        var fromElapse, toElapse;
        var ix, ixLen;
        var time, elapse, result = false;

        var fromTime = +retrieveRange.timeRange[0];
        var toTime = +retrieveRange.timeRange[1];

        if (me.parentView.monitorType === 'CD') {
            fromElapse = retrieveRange.elapseRange[0];
            toElapse = retrieveRange.elapseRange[1];
        } else {
            fromElapse = retrieveRange.elapseRange[0] / 1000;
            toElapse = retrieveRange.elapseRange[1] / 1000;
        }

        for (ix = 0, ixLen = this.lastData.length; ix < ixLen; ix++) {
            time = +new Date(+this.lastData[ix][0]);
            elapse = Math.abs(this.lastData[ix][1]);
            if ((time >= fromTime && time <= toTime) && ((elapse >= fromElapse && elapse <= toElapse && elapse >= me.tmpMinY && elapse <= me.tmpMaxY))) {
                result = true;
                break;
            }
        }

        return result;
    },

    checkExistWasId: function(wasId) {
        var ix, ixLen;
        var result = true;

        for (ix = 0, ixLen = Comm.selectedWasArr.length; ix < ixLen; ix++) {
            if (wasId == Comm.selectedWasArr[ix]) {
                result = true;
                break;
            }
        }

        return result;
    },

    checkWasDown: function() {
        var wasId;
        var status;
        var ix, ixLen;
        wasId = Object.keys(Comm.Status.WAS || {});
        for (ix = 0, ixLen = wasId.length; ix < ixLen; ix++) {
            if (Comm.wasIdArr.indexOf(+wasId[ix]) == -1) {
                continue;
            }

            status = Comm.Status.WAS[wasId[ix]];
            if (status == 'Disconnected' || status == 'Server Down' || status == 'Server Hang' || status == 'TP Down') {
                this.setRecvData(wasId[ix], 1);
            }
        }

        this.setRecvData(10, 1);
    },

    setRecvData: function(wasId, status) {
        var ix;
        for (ix = 0; ix < this.recvDataWasStatus.length; ix++) {
            if (this.recvDataWasStatus[ix].wasId == wasId) {
                this.recvDataWasStatus[ix].status = status;
                break;
            }
        }
    },

    checkRecvData: function() {
        var ix;
        for (ix = 0; ix < this.recvDataWasStatus.length; ix++) {
            if (this.recvDataWasStatus[ix].status == 0) {
                return false;
            }
        }

        return true;
    },

    clearRecvDataStatus: function() {
        var ix;
        for (ix = 0; ix < this.recvDataWasStatus.length; ix++) {
            this.recvDataWasStatus[ix].status = 0;
        }
    },

    setOverData: function(time, value) {
        var ix, flag = 0;
        for (ix = 0; ix < this.liveOverData.length; ix++) {
            if (this.liveOverData[ix].time == time) {
                this.liveOverData[ix].value = Math.max(this.liveOverData[ix].value, value);
                flag = 1;
                break;
            }
        }

        if (!flag) {
            this.liveOverData[ix] = {time : time, value : value};
        }
    },

    checkOverData: function(from, to) {
        var ix;
        var maxValue = 0;
        for (ix = 0; ix < this.liveOverData.length; ix++) {
            if (this.liveOverData[ix].time > from && this.liveOverData[ix].time < to) {
                maxValue = Math.max(maxValue, this.liveOverData[ix].value);
            }
        }

        return maxValue;
    },

    frameRefresh: function() {
        this._initLiveTimer();
    },

    frameStopDraw: function() {
        if (this.liveTask) {
            clearTimeout(this.liveTask);
        }

        if (this.sparkleTimer) {
            clearTimeout(this.sparkleTimer);
            this.drawSparkleStatus = false;
            this.ctxHigh.clearRect(0, 0, this.canvasHigh.width, this.canvasHigh.height);
        }

    }
});