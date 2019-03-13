Ext.define('Exem.chart.D3Scatter', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    // 필수
    type: null,  // live, detail, detailLive
    target: null,

    liveDataRetention: 360,
    liveInterval: 1,
    minuteIntervalOfTimeTicks: 2,
    timeTolerance: 120,
    slowCriteria: 10,
    defaultMaxElapse: 100,
    yRange: [],
    detailScatterYRange: 'dataSensitive',

    parentView: null,
    invisible: false,
    dataTarget: null,
    liveTask: null,
    isPaused: false,
    liveData: {},
    lastData: [],
    pushedActivity: {},
    lastRetrievedRange: null,
    fromTime: null,
    toTime: null,
    slowScatterHeightRatio: null,


    constructor: function(config) {
        var me = this;
        this.mixins.observable.constructor.call (this);

        for(var i in config)
            this[i] = config[i];

        if (String(localStorage.getItem('rumbleFish_slowCriteria')) !== 'null')
            this.slowCriteria = Number(localStorage.getItem('rumbleFish_slowCriteria'));

/*      # ExtJS5
        # ExtJS5에서는 앞으로 addEvents 메소드가 향후 제거될 예정이니 이 메소드 사용을
        # 지양할 것을 당부한다.
        # http://docs-origin.sencha.com/extjs/5.0/apidocs/#!/api/Ext.mixin.Observable-method-addEvents

        this.addEvents('ondata');
        this.addEvents('dataTargetActivate');
        this.addEvents('resize');
*/

        this.initCanvas = _.once(function() {
            var target = document.getElementById(me.target.id+"-body"),
                c = document.createElement('canvas');

            c.width = target.clientWidth;
            c.height = target.clientHeight;
            c.style.position = 'absolute';
//            c.style['z-index'] = 2;
            target.appendChild(c);
            me.canvas = c;
            me.ctx = c.getContext('2d');
            me.ctx.lineWidth = 1;
        });

        if(this.type == 'live')
            this._initLiveScatter();
    },

    listeners: {
        ondata: function(data, fromTime, toTime) {
            this.fromTime = fromTime;
            this.toTime = toTime;
            this.draw(data);

//            data = null;
//            fromTime = null;
//            toTime = null;
        },
        dataTargetActivate: function(target) {
            this.dataTarget = target;
            this.generateScatterData(this.liveData);
        },
        resize: function() {
            if (this.type == 'detail' && this.parentView.retrRangeBeforeDragDetail !== 'null') {
                this.parentView.setRetrieveRange(this.parentView.retrRangeBeforeDragDetail);
                this.parentView.clearFilterGrid();
            }

            var target = document.getElementById(this.target.id+"-body");
            this.canvas.width = target.clientWidth;
            this.canvas.height = target.clientHeight;
            this.draw();
        },
        beforeDestroy: function() {
            this.removeElement();
            this.lastData.length = 0;
            this.lastData = [];
        }
    },

    _initLiveScatter: function() {
        //var me = this;

        if (Comm.isRandomMode)
            this.initRandomPush();

        this.mergePushedActivity(this.pushedActivity);
        this.draw(this.generateScatterData(this.liveData));

        this._initLiveTimer();

        /*
         * _initLiveTimer 함수에서 아래 코드 실행하도록 수정
         * setInterval --> setTimeout
         *
        this.liveTask = setInterval( function () {
            me.mergePushedActivity(me.pushedActivity);
            me.draw( me.generateScatterData(me.liveData) );
        }, this.liveInterval * 1000);
        */
    },

    _initLiveTimer: function() {
        var me = this;
        if (this.liveTask) {
            clearTimeout(this.liveTask);

            this.liveTask = null;
        }
        this.liveTask = setTimeout(function() {
            try {
                me.mergePushedActivity(me.pushedActivity);
                me.draw(me.generateScatterData(me.liveData));
                me._initLiveTimer();
            } finally {
                me = null;
            }
        }, this.liveInterval * 1000);
    },

//    redraw: function() {
//        if(this.type == 'live') {
//            this.mergePushedActivity( this.pushedActivity );
//            this.draw(this.generateScatterData(this.liveData));
//        }
//        else if(this.type == 'detailLive' || this.type == 'detail')
//            this.draw();
//    },

    pauseLiveScatter: function() {
        this.isPaused = true;
    },

    resumeLiveScatter: function() {
        this.isPaused = false;
        this.draw();
    },

    initRandomPush: function() {
//        var me = this;
//        var data = {rows:[]};
//        var probability = 0;
//        var exception = 0;
//        var time = new Date();
//        var elapse = 0;
//
//        setInterval(function() {
//            data = {rows:[]};
//            time = new Date();
//
//            for(var i=0; i<Number(Comm.currentReqRes[1]); i++) {
//                data.rows.push([time, 0, []]);
//                probability = Math.floor(Math.random() * 10000) + 1;
//                exception = 0;
//
//                if(probability >= 10000)
//                    elapse = Math.floor(Math.random() * 400000)+100000;
//                else if(probability > 9990)
//                    elapse = Math.floor(Math.random() * 87000)+13000;
//                else if(probability > 9000)
//                    elapse = Math.floor(Math.random() * 10000)+3000;
//                else
//                    elapse = Math.floor(Math.random() * 3000);
//
//                if(i%1000 == 0)
//                    exception = 1;
//
//                data.rows[i][2].push([elapse, exception]);
//            }
//            me.pushData(null, data);
//        }, 1000);
    },

    pushData: function(header, data) {
        var ix         = 0;
        var jx         = 0;
        var d          = null;
        var clientTime = new Date().getSeconds();
        var fromTime   = new Date().setSeconds(clientTime - this.liveDataRetention);
        var toTime     = new Date().setSeconds(clientTime + this.timeTolerance);
        var time       = 0;
        var endTxns    = 0;
        var elapse     = 0;

        try {
            for (ix = 0; ix < data.rows.length; ix++) {
                d = data.rows[ix];
                if (d[0] >= fromTime && d[0] <= toTime ) {
                    time = Math.floor( d[0]/1000 ) * 1000;
                    endTxns = d[2];

                    !Array.isArray(this.pushedActivity[time]) ? this.pushedActivity[time] = [] : {};

                    for (jx = 0; jx < endTxns.length; jx++) {
                        elapse = endTxns[jx][0];
                        if (elapse >= 100000)
                            elapse = Math.floor(elapse / 1000);
                        else
                            elapse < 100 ? elapse = 0.1 : elapse = Math.floor(elapse / 100) / 10;

                        // Exception이면 elapse를 음수로 변환
                        endTxns[jx][1] > 0 ? elapse = -(elapse) : {};

                        // 24시간보다 큰 elapse 데이터 버림.(임의값)
                        elapse < 86400 ? this.pushedActivity[time].push(elapse) : {};
                    }
                }
            }
        } finally {
            ix = null;
            jx = null;
            d = null;
            clientTime = null;
            fromTime = null;
            toTime = null;
            time = null;
            endTxns = null;
            elapse = null;
//            header = null;
//            data = null;
        }
    },

    mergePushedActivity: function(pushedActivity) {
        var addedTime = Object.keys(pushedActivity);
        var ix = 0;
        var time = 0;

        try {
            for (ix = 0; ix < addedTime.length; ix++) {
                time = addedTime[ix];
                !Array.isArray(this.liveData[time]) ? this.liveData[time] = [] : {};

                this.liveData[time] = this.liveData[time].concat(pushedActivity[time]);
                this.liveData[time] = common.Util.extractDupArray(this.liveData[time]);
            }
        } finally {
            time = null;
            ix = null;
            addedTime = null;
            this.pushedActivity = {};
//            pushedActivity = null;
        }
    },

    generateScatterData: function(data) {
        var me = this;
        var ix = 0;
        var jx = 0;
        var scatterData = [];
        var time = 0;

        var timeArr = Object.keys(data);

        var dataMaxTime = d3.max(timeArr);
        this.toTime = Math.floor(new Date().getTime() / 1000) * 1000;
        this.fromTime = this.toTime - (this.liveDataRetention * 1000);
        this.toTime < dataMaxTime ? this.toTime = dataMaxTime : {};


        for (ix = 0; ix < timeArr.length; ix++) {
            time = timeArr[ix];

            if (time >= this.fromTime) {
                for (jx = 0; jx < data[time].length; jx++) {
                    !me.isPaused ? scatterData.push([time, data[time][jx]]) : {};
                }
            } else {
                data[time] = null;
            }
        }

        ix = null;
        jx = null;
        time = null;
        timeArr = null;
//        data = null;
        dataMaxTime = null;

        if (this.dataTarget != null)
            this.dataTarget.fireEvent('ondata', scatterData, this.fromTime, this.toTime);

        return scatterData;
    },

    removeElement: function() {
        var panel = d3.select("#" + this.target.id + "-body");
        panel.select("svg").selectAll('rect').remove();
        panel.select("svg").remove();
        panel = null;
    },

    draw: function(dataOrigin) {
        var drawStart = new Date();

        var me = this;
        var data = null;

        if (me.isPaused || me.invisible)
            return;

        if (arguments.length == 0)
            data = this.lastData.slice(0);
        else {
            this.lastData.length = 0;
            data = dataOrigin.slice(0);
            this.lastData = dataOrigin.slice(0);
        }

        this.removeElement();

        var width = this.target.getWidth(),
            height = this.target.getHeight(),
            leftMargin = 50,
            margin = 25;
        this.width = width;
        this.height = height;
        this.leftMargin = leftMargin;
        this.margin = margin;

        var x_extent = null;
        var y_slow_extent = null;
        var rectSize = 0;

        if ( this.fromTime !== null && this.toTime !== null )
            x_extent = [ this.fromTime, this.toTime ];
        else
            x_extent = d3.extent(data, function(d) {
                return d[0];
            });

        var x_scale = d3.time.scale()
            .range([leftMargin, width-margin])
            //.range([width-margin, leftMargin]) //시간 흐름을 좌에서 우 방향으로
            .domain(x_extent);
        this.x_scale = x_scale;

        var x_axis = d3.svg.axis()
            .scale(x_scale)
            .tickSize(0)
            .tickPadding(5);

        if (this.type === 'live' || this.type === 'detailLive') {
            rectSize = 3;
            x_axis.ticks(d3.time.minutes, me.minuteIntervalOfTimeTicks ).tickFormat(d3.time.format("%H:%M"));
            this.slowScatterHeightRatio = 0.4;

            y_slow_extent = [ this.slowCriteria, d3.max(data, function(d){
                return d[1];
            }) * 1.1 ];
            if (y_slow_extent[1] < this.defaultMaxElapse || isNaN(y_slow_extent[1]))
                y_slow_extent = [this.slowCriteria, this.defaultMaxElapse];
        }
        else if (this.type === 'detail') {
            rectSize = 5;
            x_axis.ticks(3).tickFormat(d3.time.format("%H:%M:%S"));
            this.slowScatterHeightRatio = 0;

            if (String(localStorage.getItem('rumbleFish_slowCriteria')) !== 'null')
                this.slowCriteria = Number(localStorage.getItem('rumbleFish_slowCriteria'));

            if (this.detailScatterYRange === 'dataSensitive') {
                this.yRange = d3.extent(data, function(d){
                    return Math.abs(d[1]);
                });
                this.yRange = [this.yRange[0] * 0.9, this.yRange[1] * 1.1];
            }
            y_slow_extent = [this.slowCriteria, this.yRange[1]];

            console.debug('calc extent time :', Number(new Date())-drawStart,'ms');
        }

        this.rectSize = rectSize;
        var slowScatterHeight = Math.floor((height - margin - margin) * this.slowScatterHeightRatio);
        var slowCriteriaHeight = slowScatterHeight + margin;
        var normalScatterHeight = height-slowScatterHeight-margin * 2;

        var y_scale = d3.scale.linear()
            .range([margin + slowScatterHeight + normalScatterHeight, margin + slowScatterHeight]);
        this.y_scale = y_scale;

        var y_axis = d3.svg.axis()
            .scale(y_scale)
            .orient('left')
            .tickSize( (-width+leftMargin+margin), 0, 0 )
            .tickPadding(15);

        if (this.type == 'detail') {
            y_scale.domain( me.yRange );
            y_axis.ticks(10);
        }
        else {
            y_scale.domain([0, this.slowCriteria]);
//            y_axis.ticks(2)
            y_axis.tickFormat(d3.format(',.1f'))
                .tickValues([this.slowCriteria/2, this.slowCriteria]);
        }

        var y_slow_scale = d3.scale.linear()
            .range([slowScatterHeight + margin, margin])
            .domain(y_slow_extent);
        this.y_slow_scale = y_slow_scale;

        var y_slow_axis = d3.svg.axis()
            .scale(y_slow_scale)
            .orient('left')
            .ticks(2)
            .tickFormat(d3.format(',.1f'))
            .tickSize( (-width+leftMargin+margin), 0, 0 )
            .tickPadding(15);


        me.initCanvas();
        var y;
        me.ctx.clearRect(0, 0, width, height);
        me.ctx.lineWidth = 1;

        var svg = d3.select("#" + this.target.id + "-body")
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('position', 'absolute');

        if (me.type != 'detail') {

            _.each(data, function(d) {
//                me.ctx.beginPath();
                if (d[1] >= 0) {      // Normal
                    if ( d[1] >= me.slowCriteria ) {
                        me.ctx.fillStyle = '#14b4be'; // '#e3b61c';
//                        me.ctx.fill();
//                        me.ctx.lineWidth = 1;
//                        me.ctx.strokeStyle = '#14b4be';
                        y = y_slow_scale( d[1] );
                    }
                    else {
                        me.ctx.fillStyle = '#14b4be';
//                        me.ctx.fill();
//                        me.ctx.lineWidth = 1;
//                        me.ctx.strokeStyle = '#14b4be';
                        y = y_scale( d[1] );
                    }
                }
                else {               // Exception
                    me.ctx.fillStyle = 'red';
//                    me.ctx.fill();
//                    me.ctx.lineWidth = 1;
//                    me.ctx.strokeStyle = 'red';
                    if ( d[1] <= -me.slowCriteria )
                        y = y_slow_scale( -d[1] );
                    else
                        y = y_scale( -(d[1]) );
                }
                me.ctx.fillRect(Math.round(x_scale(d[0])), Math.round(y), rectSize, rectSize);
//                me.ctx.arc(Math.round(x_scale(d[0])), Math.round(y), 1, 0, 2*Math.PI, false);
//                me.ctx.closePath();
//                me.ctx.stroke();
            });
        }
        else {
            _.each(data, function(d) {
//                me.ctx.beginPath();
                if (d[1] >= 0) {      // Normal
                    if ( d[1] >= me.slowCriteria ) {
                        me.ctx.fillStyle = '#14b4be'; // '#e3b61c';
//                        me.ctx.fill();
//                        me.ctx.lineWidth = 1;
//                        me.ctx.strokeStyle = '#14b4be';
                    } else {
                        me.ctx.fillStyle = '#14b4be';
//                        me.ctx.fill();
//                        me.ctx.lineWidth = 1;
//                        me.ctx.strokeStyle = '#14b4be';
                    }

                    y = y_scale( d[1] );
                }
                else {               // Exception
                    me.ctx.fillStyle = 'red';
                    y = y_scale( -(d[1]) );
                }
                me.ctx.fillRect(Math.round(x_scale(d[0])), Math.round(y), rectSize, rectSize);
//                me.ctx.arc(Math.round(x_scale(d[0])), Math.round(y), 1, 0, 2*Math.PI, false);
//                me.ctx.stroke();
            });
        }
//        console.debug('canvas draw time :', Number(new Date())-drawStart,'ms');

        data.length = 0;
        data = [];

        svg.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 0);

        svg.append("g")
            .attr("class", "axis scatterGrid d3scatter-axis-"+me.type)
            .attr("transform", "translate(0," + (rectSize+normalScatterHeight+slowScatterHeight+margin) + ")")
            .call(x_axis);

        svg.append("g")
            .attr("class", "axis scatterGrid d3scatter-axis-"+me.type)
            .attr("transform", "translate(" + leftMargin + "," + rectSize + ")")
            .call(y_axis);

        if (this.type !== 'detail') {
            svg.append("g")
                .attr("class", "axis scatterGrid d3scatter-axis-"+me.type)
                .attr("transform", "translate(" + leftMargin + "," + rectSize + ")")
                .call(y_slow_axis);

            var criteriaChangeG = svg.append('g')
                .attr("transform", "translate(0,"+(slowScatterHeight+margin-17)+")")
                .on('mouseover', function() {
                    d3.selectAll('.criteriaChange').style('opacity', 1);
                })
                .on('mouseout', function() {
                    d3.selectAll('.criteriaChange').style('opacity', 0);
                });

            criteriaChangeG.append('rect')
                .attr('x',0).attr('y',0)
                .attr('width', 45).attr('height', 40)
                .style('opacity', 0);

            criteriaChangeG.append('image')
                .attr('class', 'criteriaChange')
                .attr('xlink:href', '/intermax/images/criteria-up.png')
                .attr('x',20)
                .attr('y',0)
                .attr('width', 12).attr('height', 12)
                .style('opacity', 0)
                .on('mousedown', function() {
                    d3.event.stopPropagation();
                    if (me.slowCriteria < 30) {
                        me.slowCriteria += 1;
                        localStorage.setItem('rumbleFish_slowCriteria', me.slowCriteria);
                        me.draw();
                    }
                })
                .on('mouseup', function() {
                    d3.event.stopPropagation();
                });

            criteriaChangeG.append('image')
                .attr('xlink:href', '/intermax/images/criteria-down.png')
                .attr('class', 'criteriaChange')
                .attr('x',20).attr('y',25)
                .attr('width', 12).attr('height', 12)
                .style('opacity', 0)
                .on('mousedown', function() {
                    d3.event.stopPropagation();
                    if (me.slowCriteria > 1) {
                        me.slowCriteria -= 1;
                        localStorage.setItem('rumbleFish_slowCriteria', me.slowCriteria);
                        me.draw();
                    }
                })
                .on('mouseup', function() {
                    d3.event.stopPropagation();
                });
        }

        svg.selectAll('.d3scatter-axis-live > g > text')
            .style({'font-family': 'Roboto Condensed Light', 'font-size': '8pt'});
//            .style({'font-family': 'imaxval', 'font-size': '8px'});


        // Drag Event 처리

        var selectZoneTop, selectZoneBottom,
            selectZoneLeft, selectZoneRight,
            lastSelectedZone, selectZoneMinLimit = 10,
            pointer0, pointer1,
            minX, minY, maxX, maxY,
            lastMinX, lastMinY, lastMaxX, lastMaxY,
            tmpFrom, tmpTo, tmpMin, tmpMax,
            isSelectedZoneClick;

        var isExistDetailSelectZone = false,
            isClearDetailSelectZone = false;

        // 조회 영역을 Inspector의 Live Scatter에 표시해줌.
        if ( this.type === 'detailLive' && this.lastRetrievedRange != null) {

            tmpTo = this.x_scale( this.lastRetrievedRange['timeRange'][1]);
            tmpFrom = this.x_scale( this.lastRetrievedRange['timeRange'][0] );

            if ( this.lastRetrievedRange['elapseRange'][0] < this.slowCriteria )
                tmpMin = this.y_scale( this.lastRetrievedRange['elapseRange'][0] );
            else
                tmpMin = this.y_slow_scale( this.lastRetrievedRange['elapseRange'][0] );

            if ( this.lastRetrievedRange['elapseRange'][1] < this.slowCriteria )
                tmpMax = this.y_scale( this.lastRetrievedRange['elapseRange'][1] );
            else
                tmpMax = this.y_slow_scale( this.lastRetrievedRange['elapseRange'][1] );

            lastMinX = tmpFrom;
            lastMaxX = tmpTo;
            lastMinY = tmpMax;
            lastMaxY = tmpMin;

            if ( tmpFrom >= leftMargin ) {
                svg.append('rect')
                    .attr('x', tmpFrom)
                    .attr('y', tmpMax)
                    .attr('width', tmpTo - tmpFrom)
                    .attr('height', tmpMin - tmpMax)
                    .attr('class', 'lastSelectedZoneDetail');
            }
        }


        svg.on('mousedown', function(){
            pointer0 = d3.mouse(this);

            // margin 영역의 mousedown은 무시
            if ( pointer0[0] < me.leftMargin || pointer0[0] > me.width - me.margin )
                return;
            if ( pointer0[1] < me.margin || pointer0[1] > me.height - me.margin )
                return;

            minX = maxX = pointer0[0];
            minY = maxY = pointer0[1];

            if(me.type !== 'detail')
                me.pauseLiveScatter();

            svg.select('circle.focus').remove();

            selectZoneTop = svg.append('rect').attr('class','selectZone');
            selectZoneBottom = svg.append('rect').attr('class','selectZone');
            selectZoneLeft = svg.append('rect').attr('class','selectZone');
            selectZoneRight = svg.append('rect').attr('class','selectZone');


            if (pointer0[0] > lastMinX && pointer0[0] < lastMaxX && pointer0[1] > lastMinY && pointer0[1] < lastMaxY) {
                isSelectedZoneClick = true;
            }
            else {
                isSelectedZoneClick = false;
                svg.select('rect.lastSelectedZone').remove();
                svg.select('rect.lastSelectedZoneDetail').remove();
                lastSelectedZone = svg.append('rect').attr('class','lastSelectedZone');
            }
            d3.event.preventDefault();
        })
            .on('mousemove', function(){
                if( !selectZoneTop ) {
                    return;
                }

                pointer1 = d3.mouse(this);

                if (isSelectedZoneClick) {
                    var diff = [pointer1[0] - pointer0[0], pointer1[1] - pointer0[1]];
                    minX = lastMinX + diff[0];
                    maxX = lastMaxX + diff[0];
                    minY = lastMinY + diff[1];
                    maxY = lastMaxY + diff[1];
                }
                else {
                    minX = Math.min(pointer0[0], pointer1[0]);
                    maxX = Math.max(pointer0[0], pointer1[0]);
                    minY = Math.min(pointer0[1], pointer1[1]);
                    maxY = Math.max(pointer0[1], pointer1[1]);
                }

                minX < me.leftMargin ? minX = me.leftMargin : {};
                maxX > me.width-me.margin+rectSize ? maxX = me.width-me.margin+rectSize : {};
                minY < me.margin ? minY = me.margin : {};
                maxY > me.height-me.margin ? maxY = me.height-me.margin : {};

                if( maxY-minY >= selectZoneMinLimit && maxX-minX >= selectZoneMinLimit ) {
                    selectZoneTop
                        .attr("x", me.leftMargin)
                        .attr("y", me.margin)
                        .attr("width", me.width - me.leftMargin - me.margin + rectSize)
                        .attr("height", minY - me.margin);

                    svg.select('rect.lastSelectedZone')
                        .attr("x", minX + rectSize/2)
                        .attr("y", minY + rectSize/2)
                        .attr("width", maxX - minX - rectSize/2)
                        .attr("height", maxY - minY);

                    svg.select('rect.lastSelectedZoneDetail')
                        .attr("x", minX + rectSize/2)
                        .attr("y", minY + rectSize/2)
                        .attr("width", maxX - minX - rectSize/2)
                        .attr("height", maxY - minY);

                    if (me.type !== 'live')
                        svg.select('rect.lastSelectedZone').attr('class', 'lastSelectedZoneDetail');
                }
                else {
                    selectZoneTop.attr("width", 0).attr("height", 0);
                    selectZoneBottom.attr("width", 0).attr("height", 0);
                    selectZoneLeft.attr("width", 0).attr("height", 0);
                    selectZoneRight.attr("width", 0).attr("height", 0);
                    lastSelectedZone.attr("width", 0).attr("height", 0);
                }

                // svg 경계 근처까지 드래그 하면 액션 중지
                if ( pointer1[0] < 5 || pointer1[0] > me.width-5 || pointer1[1] < 5 || pointer1[1] > me.height-5 ) {
                    clearSelectZone();

                    if( maxY-minY < selectZoneMinLimit && maxX-minX < selectZoneMinLimit ) {
                        lastSelectedZone.remove();
                        me.resumeLiveScatter();
                        return;
                    }
                    afterDrag( invertCoordinate() );
                }
            })
            .on('mouseup', function() {
                clearSelectZone();

                if (maxY != undefined && minY != undefined && selectZoneMinLimit) {
                    if ( maxY-minY < selectZoneMinLimit && maxX-minX < selectZoneMinLimit ) {

                        if (me.type === 'live' || me.type === 'detailLive') {
                            lastSelectedZone.remove();

                            me.resumeLiveScatter();
                            return;
                        }
                        else if (me.type === 'detail') {
                            if (isExistDetailSelectZone) {
                                isClearDetailSelectZone = true;
                                minX = me.leftMargin;
                                maxX = me.width-me.margin;
                                minY = me.margin;
                                maxY = me.height-me.margin;
                            }
                            else
                                return;
                        }
                    }
                    afterDrag( invertCoordinate() );
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
        }

        // 선택된 영역의 좌표값을 시간 범위와 Elapse Time 범위로 계산
        function invertCoordinate() {
            var minTime = new Date( me.x_scale.invert(minX).setSeconds( me.x_scale.invert(minX).getSeconds()+1 ) ),
                maxTime = me.x_scale.invert(maxX),
                minElapse, maxElapse;

            if (me.type === 'detail') {
                minElapse=me.y_scale.invert(maxY);
                maxElapse=me.y_scale.invert(minY);
            }
            else {
                maxY > slowCriteriaHeight ? minElapse=me.y_scale.invert(maxY) : minElapse=me.y_slow_scale.invert(maxY);
                minY > slowCriteriaHeight ? maxElapse=me.y_scale.invert(minY) : maxElapse=me.y_slow_scale.invert(minY);
            }
            if (minElapse<0)
                minElapse = 0;

            minElapse = Math.floor(minElapse * 1000);
            maxElapse = Math.floor(maxElapse * 1000);

            return {
                timeRange  : [ minTime, maxTime ],
                elapseRange: [ minElapse, maxElapse ]
            };
        }

        function afterDrag(retrieveRange) {

            if (me.type === 'live') {

                var inspector = Ext.create('view.ResponseInspector', {
                    title: common.Util.TR('Transaction Trend'),
                    closable: true,
                    parentScatter: me,
                    isAllWasRetrieve: true,
                    detailScatterYRange: 'fixed',
                    autoRetrieveRange: retrieveRange
                });
                inspector.init();

                var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.add(inspector);
                mainTab.setActiveTab(inspector);

                if (typeof inspector.liveScatter !== 'undefined') {
                    retrieveRange.elapseRange = _.map(retrieveRange.elapseRange, function(milliSec) { return milliSec/1000; });
                    inspector.liveScatter.lastRetrievedRange = retrieveRange;
                }

                me.resumeLiveScatter();
            }
            else if (me.type === 'detailLive') {
                me.parentView._txnNameRepl = '';
                me.parentView._clientIpRepl = '';
                me.parentView._gidRepl = '';
                me.parentView._exceptionRepl = '';
                me.parentView._loginNameRepl = '';

                me.parentView.setRetrieveRange(retrieveRange);
                retrieveRange.elapseRange = _.map(retrieveRange.elapseRange, function(milliSec) { return milliSec/1000; });
                me.lastRetrievedRange = retrieveRange;

                me.parentView.retrieveScatter();
                me.parentView.retrieveGrid();
                me.resumeLiveScatter();
            }
            else if (me.type === 'detail') {
                me.parentView.setRetrieveRange(retrieveRange, true);

                if (!isClearDetailSelectZone) {
                    lastMinX = minX, lastMinY = minY, lastMaxX = maxX, lastMaxY = maxY;
                    isExistDetailSelectZone = true;
                    me.parentView.filterGrid();
                }
                else {
                    lastMinX = null, lastMinY = null, lastMaxX = null, lastMaxY = null;
                    isExistDetailSelectZone = false;
                    isClearDetailSelectZone = false;
                    me.parentView.clearFilterGrid();
                }
            }
        }

        slowScatterHeight = null;
//        slowCriteriaHeight = null;
        normalScatterHeight = null;
        width = null;
        height = null;
        margin = null;
        y_slow_extent = null;
        y_slow_scale = null;
        y_slow_axis = null;
        x_scale = null;
        y_scale = null;
        x_axis = null;
        y_axis = null;
    },

    setFocus: function(time, elapse) {
        var me, svg, x, y;

        me = this;
        svg = d3.select("#" + this.target.id + "-body").select("svg");
        x = me.x_scale( time ) + this.rectSize / 2;

        if (x >= this.leftMargin-3) {
            if (this.type == 'detailLive' && elapse >= this.slowCriteria)
                y = me.y_slow_scale( elapse ) + this.rectSize / 2;
            else
                y = me.y_scale( elapse ) + this.rectSize / 2;

            svg.selectAll('circle.focus').remove();

            svg.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 10)
                .attr("class", "focus")
                .transition()
                .duration(40)
                .style("opacity", .8);
        }
    },

    onGroupData: function(data) {
        this.liveData = {};
        if (this.lastData) {
            this.lastData.length = 0;
        } else {
            this.lastData = [];
        }

        var tmpData = {rows: data};
        this.pushData(null, tmpData);
        this.groupDataAssigned = true;
    }
});