(function (XM) {
    /**
     * @note XMCanvas 상속.
     * Intermax 트랜잭션 모니터에 최적화된 로직
     * @param arg
     * @constructor
     */
    var XMTxnMonitorChart = function (arg) {
        if (arg) {
            if (!this.initProperty(arg)) {
                return;
            }

            //this.init();
        }
    };

    // 상속
    XMTxnMonitorChart.prototype = XM.cls.create('XMCanvas');

    /**
     * @note XMTxnMonitorChart property 설정
     *    **    target 인자는 센차 object 입니다. **
     * @param arg{object}
     */
    XMTxnMonitorChart.prototype.initProperty = function (arg) {
        //this.maximumValue = null;		// y 축 상한 값
        //this.maxValue = null;
        //this.minValue = 0;
        //this.fromTime = null;  // x 축 시작 시간
        //this.toTime = null;	// x 축 마지막 시간
        this.txnInfo = null;		// 트랜잭션 모니터 정보
        this.normalColor = '#3CA0FF';
        this.normalOverColor = '#a3d3ff';
        this.exceptionColor = '#DF6264';
        this.exceptionOverColor = '#ff00ff';

        this.normalYaxisMax = 0;
        this.totalCount = 0;
        this.maxOverCount = 0;
        this.maxTimeValue = 0;

        Object.defineProperty(this, 'customRectSize', {			// 도트 크기. options.series.point.radius
            set: function (value) {
                this.options.series.point.radius = value;
            },
            get: function () {
                return this.options.series.point.radius;
            }
        });
        Object.defineProperty(this, 'customYaxisMax', {			// 최대 크기. options.yaxis.max
            set: function (value) {
                this.options.yaxis.max = value;
            },
            get: function () {
                return this.options.yaxis.max;
            }
        });
        Object.defineProperty(this, 'customYaxisMin', {        // 최소 크기. options.yaxis.min
            set: function (value) {
                this.options.yaxis.min = value;
            },
            get: function () {
                return this.options.yaxis.min;
            }
        });

        this.isOnlyErrorTxn = false;
        this.isAutoScale = true;
        this.sliderMax = 0;
        this.delayCount = 0;

        this.toFixedNumber = 3;
        this.selectionEvent = null;

        this.displayCanvas = document.createElement('canvas');	// 메인 뷰 캔버스
        this.displayCtx = this.displayCanvas.getContext('2d');
        this.bufferCanvas = document.createElement('canvas');	// 버퍼 캔버스
        this.bufferCtx = this.bufferCanvas.getContext('2d');
        this.overlayCanvas = document.createElement('canvas');	// overlay 캔버스
        this.overlayCtx = this.overlayCanvas.getContext('2d');

        this.container = document.createElement('div');
        this.container.className = 'XMLineChart';
        this.chartContainer = document.createElement('div');
        this.chartContainer.className = 'XMLineChart-chart';

        this.chartContainer.appendChild(this.displayCanvas);
        this.chartContainer.appendChild(this.overlayCanvas);

        this.container.appendChild(this.chartContainer);

        var devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio =
                this.displayCtx.webkitBackingStorePixelRatio ||
                this.displayCtx.mozBackingStorePixelRatio ||
                this.displayCtx.msBackingStorePixelRatio ||
                this.displayCtx.oBackingStorePixelRatio ||
                this.displayCtx.backingStorePixelRatio || 1;

        this.pixelRatio = devicePixelRatio / backingStoreRatio;

        if (devicePixelRatio !== backingStoreRatio) {
            this.bufferCtx.scale(this.pixelRatio, this.pixelRatio);
            this.overlayCtx.scale(this.pixelRatio, this.pixelRatio);
        }

        for (var key in arg) {
            this[key] = arg[key];
        }

        if (!this.target) {
            console.debug('XMTxnMonitorChart : Can not find the target.');
            return false;
        }

        this.offset = {
            grid: {
                x: null,
                x2: null,
                y: null,
                y2: null,
                width: null,
                height: null
            },
            xaxis: {
                steps: null,
                labelWidth: null,
                point: null
            },
            yaxis: {
                steps: null,
                stepValue: null,
                min: null,
                max: null,
                startPoint: null,
                endPoint: null,
                labelWidth: null,
                point: null
            }
        };

        this.initOption();

        this.offset.xaxis.point = new Array();
        //this.offset.yaxis.point = new Array(this.dataBufferSize);

        this.overlayCanvas.style.position = 'absolute';
        this.overlayCanvas.style.top = '0px';
        this.overlayCanvas.style.left = '0px';

        this.target.addListener('resize', this.resize, this);
        this.target.addListener('destroy', this.destroy, this);

        return true;
    };

    XMTxnMonitorChart.prototype.initOption = function () {
        this.options = {
            colors: ['#2b99f0', '#8ac449', '#009697', '#959c2c', '#004ae7', '#01cc00', '#15679a', '#43bcd7', '#e76627', '#5C8558', '#A8A5A3', '#498700', '#832C2D', '#C98C5A', '#3478BE', "#BCF061", "#B26600", "#27358F", "#A4534D", "#B89630", '#A865B4', '#254763', '#536859', '#E9F378', '#888A79', '#D67D4B', '#2BEC69', '#4A2BEC', '#2BBEEC', '#DDACDF'],
            xaxis: {
                show: true,
                mode: null,
                min: 0,
                max: null,
                autoscaleRatio: null,
                ticks: null,
                tickLength: 3,
                tickDecimals: null,
                tickInterval: 60000,
                labelHeight: 20,
                labelStyle: {
                    fontSize: 13,
                    color: '#333',
                    fontFamily: 'normal'
                }
            },
            yaxis: {
                show: true,
                mode: null,
                min: 0,
                minIndex: null,
                max: null,
                maxIndex: null,
                autoscaleRatio: 0.5,		// 0 ~ 1
                ticks: null,
                tickLength: null,
                tickDecimals: null,
                scale: 0,
                labelWidth: null,			// null : auto scale, number : fixed,
                labelStyle: {
                    fontSize: 13,
                    color: '#333',
                    fontFamily: 'normal'
                }
            },
            grid: {
                gridLineWidth: 1,
                gridLineColor: '#F0F0F0',
                showXLine: true,
                showYLine: false,
                padding: 10,
                border: {
                    color: '#ccc'
                },
                mouseActiveRadius: 10 		// 아이템을 찾는 hit 영역 범위
            },
            series: {
                lines: {
                    show: true,
                    lineWidth: 2,
                    fill: false,
                    fillColor: null,
                    steps: false
                },
                point: {
                    show: false,
                    lineWidth: 3,
                    color: '#fff',
                    fill: true,
                    fillColor: null,
                    radius: 2
                }
            },
            crosshair: {
                show: false,
                mode: 'x',
                color: '#FF7781'

            },
            tooltip: {
                show: true,
                timeformat: '%d %H:%M'
            },
            highlight: {
                show: true,
                width: 4,
                color: null
            },
            maxValueTip: {
                show: true
            },
            selection: {
                show: false,
                mode: "xy",
                color: '#349BE7'
            }
        };

        if (this.chartProperty) {
            this.setOption(this.options, this.chartProperty);
        }
    };

    XMTxnMonitorChart.prototype.setOption = function (root, obj) {
        var keys = Object.keys(obj);

        for (var ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            if (typeof obj[keys[ix]] === 'object') {
                if (root[keys[ix]]) {
                    this.setOption(root[keys[ix]], obj[keys[ix]], keys[ix]);
                }
            } else {
                root[keys[ix]] = obj[keys[ix]];
            }
        }
    };

    XMTxnMonitorChart.prototype.init = function (arg) {

        if (this.target.getEl()) {
            this.targetEl = this.target.el.dom;
            this.targetEl.appendChild(this.container);

            this.width = this.chartContainer.offsetWidth;
            this.height = this.chartContainer.offsetHeight;
            this.setWidth(this.width);
            this.setHeight(this.height);
            this.bindEvent();
        } else {
            this.target.addListener('render', function () {
                this.targetEl = this.target.el.dom;
                this.targetEl.appendChild(this.container);

                this.width = this.chartContainer.offsetWidth;
                this.height = this.chartContainer.offsetHeight;
                this.setWidth(this.width);
                this.setHeight(this.height);
                this.bindEvent();
            }, this);
        }

        this.initScale();
    };

    XMTxnMonitorChart.prototype.bindEvent = function () {
        this.chartContainer.addEventListener('resize', this.resize.bind(this), false);

        if (this.options.selection.show) {
            this.selection = {
                first: {x: -1, y: -1},
                second: {x: -1, y: -1},
                show: false,
                active: false,
                isDrawing: false
            };

            //this.overlayCanvas.onmousemove = this.mousemoveEvent.bind(this);
            this.overlayCanvas.onmousedown = this.mousedownEvent.bind(this);
            this.overlayCanvas.ondblclick = this.dblclickEvent.bind(this);
            this.overlayCanvas.onmousewheel = this.mouseWheelEvent.bind(this);
        }
    };


    /**
     *
     * @param param{obejct}
     */
    XMTxnMonitorChart.prototype.addSeries = function (param) {
        var series = {
            id: param.id,
            color: param.color,
            label: param.label,
            min: null,
            minIndex: null,
            max: null,
            maxIndex: null,
            seriesIndex: this.serieseList.length,
            //data		: (this.dataBufferSize == null ? new Array() : new Array(this.dataBufferSize)),
            data: new Array(),
            visible: param.visible == null ? true : param.visible,
            lineWidth: 2,
            line: param.line == null ? true : param.line,
            fill: param.fill,
            fillColor: param.fillColor,
            point: param.point,
            toolTip: {},
            yPoint: new Array(),

            insertIndex: -1,
            dataIndex: 0,
            startPoint: 0
        };

        this.serieseList.push(series);

        param = null;
        series = null;
    };

    XMTxnMonitorChart.prototype.initSeries = function (seriesIndex) {
        if (this.serieseList[seriesIndex]) {
            this.serieseList[seriesIndex].min = null;
            this.serieseList[seriesIndex].minIndex = null;
            this.serieseList[seriesIndex].max = null;
            this.serieseList[seriesIndex].maxIndex = null;
            this.serieseList[seriesIndex].data.length = 0;
            this.serieseList[seriesIndex].yPoint.length = 0;
        }
    };

    XMTxnMonitorChart.prototype.clearValues = function () {
        //for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
        //	this.initSeries(ix);
        //}
        //this.offset.xaxis.point.length = 0;
        //
        //this.clearDraw();
    };

    /**
     * 정확히 게산하기 위해선 canvas 의 measureText 을 이용하여 텍스트 width 를 가져와야 하지만
     * 일단 성능적으로 처리를 우선시 하여 텍스트의 길이 만큼만 width 를 구한다.
     * @param value{number}
     */
    XMTxnMonitorChart.prototype.setMaxLabelWidth = function (value) {
        if ((value[0] + '').length > this.offset.xaxis.labelWidth) {
            this.maxXLabelText = value[0] + '';
            this.offset.xaxis.labelWidth = this.maxXLabelText.length;
        }
        if ((value[1] + '').length > this.offset.yaxis.labelWidth) {
            this.maxYLabelText = Math.ceil(value[1]) + '';
            this.offset.yaxis.labelWidth = this.maxYLabelText.length;
        }
    };

    /**
     * @override XMCanvas 오버라이드
     * canvas 에 그린다.
     * double buffering 으로 beffuer canvas 에 그린후 display canvas 에 buffer canvas 를 엎는다.
     */
    XMTxnMonitorChart.prototype.draw = function () {
        if (this.width == null || this.height == null || this.txnInfo == null || this.txnInfo.data.length == 0 || this.selection.active) {
            return;
        }

        this.isDrawing = true;
        this.clearDraw();
        this.setGrid();
        this.drawSeries();
        this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
    };

    XMTxnMonitorChart.prototype.compactDraw = function () {
        if (this.width == null || this.height == null || this.txnInfo == null || this.txnInfo.data.length == 0 || this.selection.active) {
            return;
        }

        this.isDrawing = true;
        this.clearDraw();
        this.setGrid();
        this.compactDrawSeries();
        this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
    };

    XMTxnMonitorChart.prototype.getMaxValue = function () {
        var ix = null, ixLen = null;
        var jx = null, jxLen = null;

        var maxValue = 0;
        var maxList = null;

        for (ix = 0, ixLen = this.txnInfo.data.length; ix < ixLen; ++ix) {
            if (this.txnInfo.data[ix]) {

                if (this.isOnlyErrorTxn) {
                    maxList = this.txnInfo.data[ix].errorMax;
                } else {
                    maxList = this.txnInfo.data[ix].max;
                }

                if (this.databaseType === 'memory') {
                    maxValue = (maxList > maxValue)? maxList : maxValue;

                } else if (this.selectedWasIdArr && this.selectedWasIdArr.length > 0) {
                    for (jx = 0, jxLen = this.selectedWasIdArr.length; jx < jxLen; ++jx) {
                        // max 가 0이상이거나 null 이 아니면
                        if (maxList[this.selectedWasIdArr[jx]]) {
                            maxValue = Math.max(maxValue, maxList[this.selectedWasIdArr[jx]]);
                        }
                    }

                } else {
                    for (jx = 0, jxLen = Comm.selectedWasArr.length; jx < jxLen; ++jx) {
                        // max 가 0이상이거나 null 이 아니면
                        if (maxList[Comm.selectedWasArr[jx]]) {
                            maxValue = Math.max(maxValue, maxList[Comm.selectedWasArr[jx]]);
                        }
                    }
                }
            }
        }

        return maxValue;
    };

//    XMTxnMonitorChart.prototype.getMaxValue = function () {
//        var ix = null, ixLen = null;
//        var jx = null, jxLen = null;
//
//        var maxValue = 0;
//        var maxList  = null;
//        var instanceId = null;
//        var elapsedArr = null;
//        var clientIP = null;
//        var valideIP = false;
//
//        for (ix = 0, ixLen = this.txnInfo.data.length; ix < ixLen; ++ix) {
//            if (this.txnInfo.data[ix]) {
//                maxList = this.txnInfo.data[ix].max;
//                elapsedArr = this.txnInfo.data[ix].data;
//
//                for (jx = 0, jxLen = elapsedArr.length; jx < jxLen; jx++) {
//                    instanceId = elapsedArr[jx][0];
//
//                    if (Comm.txnFilterClientIPArr.length > 0) {
//
//                        if (elapsedArr[jx].length <= 3) {
//                            continue;
//                        }
//                        clientIP = elapsedArr[jx][3];
//                        valideIP = common.Util.compareIpAddress(Comm.txnFilterClientIPArr[0], clientIP);
//
//                        if (clientIP == null || valideIP == false) {
//                            continue;
//                        }
//                    }
//
//                    if (Comm.selectedWasArr.indexOf(instanceId) < 0) {
//                        continue;
//                    }
//
//                    if (maxList[instanceId]) {
//                        maxValue = Math.max(maxValue, maxList[instanceId]);
//                    }
//                }
//            }
//        }
//        maxList    = null;
//        elapsedArr = null;
//        clientIP   = null;
//        valideIP   = null;
//        instanceId = null;
//
//        return maxValue;
//    };

    /**
     *
     * @param seriesIndex{number}
     */
    XMTxnMonitorChart.prototype.drawSeries = function () {
        this.totalCount = 0;
        this.maxOverCount = 0;
        this.maxTimeValue = 0;

        var yOffset = this.offset.yaxis;
        var xPoint = this.offset.xaxis.point;
        var pointOption = this.options.series.point;
        var pointHalf = pointOption.radius / 2;

        var ctx = this.bufferCtx;
        //var ctx = this.displayCtx;

        ctx.beginPath();

        ctx.fillStyle = this.normalColor;

        var startFillIndex = 0;
        //var moveFlag = true;
        var pi = Math.PI * 2;
        var x = null;
        var y = null;
        var ix = null, ixLen = null;
        var jx = null, jxLen = null;
        var data = this.txnInfo.data;
        var normal = new Array(0); 	// 0.1 초 단위로 중복 제거
        var normalDistinct = null;
        var exception = new Array(0);
        var elapsedArr = null;
        var instanceId = null;
        var elapsed = null;
        var clientIP = null;
        var valideIP = false;
        var aliasPixel = this.aliasPixel(ctx.lineWidth);
        var isDisplayWas = false;

        if (!this.isAutoScale) {
            var overElapsed = {
                n: new Array(0),
                e: new Array(0)
            };
        }

        var overFlag = false;
        // normal 그리기
        var cnt = 0;
        for (ix = this.txnInfo.startIndex, ixLen = data.length; ix < ixLen; ix++) {
            if (data[ix]) {
                elapsedArr = data[ix].data;
                //if (this.isAutoScale) {
                //    if (xPoint[cnt] == null) {
                        xPoint[cnt] = this.calculateXIndex(cnt);
                        //xPoint[ix] = this.calculateX(ix);
                    //}
                //} else {
                //    xPoint[cnt] = this.calculateXIndex(cnt);
                //}

                //x = Math.round(xPoint[ix]);
                x = xPoint[cnt] + aliasPixel;

                normal.length = 0;
                for (jx = 0, jxLen = elapsedArr.length; jx < jxLen; jx++) {
                    overFlag = false;
                    instanceId = elapsedArr[jx][0];

                    // 선택된 그룹에 포함된 인스턴스이면
                    if (this.selectedWasIdArr && this.selectedWasIdArr.length > 0) {
                        isDisplayWas = (+this.selectedWasIdArr.indexOf(+instanceId) !== -1);
                    } else {
                        isDisplayWas = (Comm.selectedWasArr.indexOf(instanceId) > -1);
                    }

                    if (this.isOnlyErrorTxn && +elapsedArr[jx][2] !== 1) {
                        continue;
                    }

                    if (isDisplayWas === true) {

                        elapsed = Math.round(elapsedArr[jx][1] / 100) / 10;

                        // 전체 건수 계산
                        if (elapsedArr[jx].length > 3) {
                            this.totalCount += elapsedArr[jx][3];
                        }

                        // undder elapsed
                        if (this.isMinValue && elapsed < this.customYaxisMin) {
                            //++this.maxOverCount;

                        // over elapsed
                        } else if (!this.isAutoScale && elapsed > this.customYaxisMax) {
                            this.maxTimeValue = Math.max(elapsed, this.maxTimeValue);
                            ++this.maxOverCount;
                            elapsed = this.customYaxisMax;

                            if (elapsedArr[jx][2] == 1) {
                                // over exception
                                // 중복 제거
                                if (overElapsed.e.indexOf(x) == -1) {
                                    overElapsed.e.push(x);	// x 축 좌표만 기억, y 는 같으니
                                }
                            } else {
                                // over normal
                                if (overElapsed.n.indexOf(x) == -1) {
                                    overElapsed.n.push(x);	// x 축 좌표만 기억, y 는 같으니
                                }
                            }
                        } else {
                            // exception 이면 normal 을 먼저 그린 이후 그린다
                            if (elapsedArr[jx][2] == 1) {
                                //y = Math.round(this.calculateY(elapsed));
                                y = this.calculateY(elapsed) + aliasPixel - pointHalf;
                                exception.push([x, y, overFlag]);
                            } else {
                                // 0.1 초 단위로 중복 제거
                                if (normal.indexOf(elapsed) == -1) {
                                    normal.push(elapsed);
                                    //y = Math.round(this.calculateY(elapsed));
                                    y = this.calculateY(elapsed) + aliasPixel - pointHalf;
                                    // moveTo 보다 beginPath 효율이 좋음
                                    ctx.beginPath();
                                    //ctx.moveTo(x, y);
                                    ctx.fillRect(x, y, pointOption.radius, pointOption.radius);
                                    //ctx.arc(x, y, pointOption.radius, 0, pi, false);
                                }
                            }
                        }
                    }
                }
            }
            cnt ++;
        }
        if(this.txnInfo.startIndex != 0){
            for (ix = 0, ixLen = this.txnInfo.endIndex; ix <= ixLen; ix++) {
                if (data[ix]) {
                    elapsedArr = data[ix].data;
                    //if (this.isAutoScale) {
                    //    if (xPoint[cnt] == null) {
                            xPoint[cnt] = this.calculateXIndex(cnt);
                            //xPoint[ix] = this.calculateX(ix);
                        //}
                    //} else {
                    //    xPoint[cnt] = this.calculateXIndex(cnt);
                    //}

                    //x = Math.round(xPoint[ix]);
                    x = xPoint[cnt] + aliasPixel;

                    normal.length = 0;
                    for (jx = 0, jxLen = elapsedArr.length; jx < jxLen; jx++) {
                        overFlag = false;
                        instanceId = elapsedArr[jx][0];

                        if (this.selectedWasIdArr && this.selectedWasIdArr.length > 0) {
                            isDisplayWas = (+this.selectedWasIdArr.indexOf(+instanceId) !== -1);
                        } else {
                            isDisplayWas = (Comm.selectedWasArr.indexOf(instanceId) > -1);
                        }

                        if (this.isOnlyErrorTxn && +elapsedArr[jx][2] !== 1) {
                            continue;
                        }

                        // 선택된 그룹에 포함된 인스턴스이면
                        if (isDisplayWas === true) {

                            elapsed = Math.round(elapsedArr[jx][1] / 100) / 10;

                            if (elapsedArr[jx].length > 3) {
                                this.totalCount += elapsedArr[jx][3];
                            }

                            // undder elapsed
                            if (this.isMinValue && elapsed < this.customYaxisMin) {
                                //++this.maxOverCount;

                            // over elapsed
                            } else if (!this.isAutoScale && elapsed > this.customYaxisMax) {
                                this.maxTimeValue = Math.max(elapsed, this.maxTimeValue);
                                ++this.maxOverCount;
                                elapsed = this.customYaxisMax;

                                if (elapsedArr[jx][2] == 1) {
                                    // over exception
                                    // 중복 제거
                                    if (overElapsed.e.indexOf(x) == -1) {
                                        overElapsed.e.push(x);	// x 축 좌표만 기억, y 는 같으니
                                    }
                                } else {
                                    // over normal
                                    if (overElapsed.n.indexOf(x) == -1) {
                                        overElapsed.n.push(x);	// x 축 좌표만 기억, y 는 같으니
                                    }
                                }
                            } else {
                                // exception 이면 normal 을 먼저 그린 이후 그린다
                                if (elapsedArr[jx][2] == 1) {
                                    //y = Math.round(this.calculateY(elapsed));
                                    y = this.calculateY(elapsed) + aliasPixel - pointHalf;
                                    exception.push([x, y, overFlag]);
                                } else {
                                    // 0.1 초 단위로 중복 제거
                                    if (normal.indexOf(elapsed) == -1) {
                                        normal.push(elapsed);
                                        //y = Math.round(this.calculateY(elapsed));
                                        y = this.calculateY(elapsed) + aliasPixel - pointHalf;
                                        // moveTo 보다 beginPath 효율이 좋음
                                        ctx.beginPath();
                                        //ctx.moveTo(x, y);
                                        ctx.fillRect(x, y, pointOption.radius, pointOption.radius);
                                        //ctx.arc(x, y, pointOption.radius, 0, pi, false);
                                    }
                                }
                            }
                        }
                    }
                }
                cnt++;
            }
        }

        //ctx.stroke();
        //ctx.fill();

        // exception 그리기
        ctx.beginPath();
        ctx.fillStyle = this.exceptionColor;
        var pos = null;
        for (ix = 0, ixLen = exception.length; ix < ixLen; ix++) {
            pos = exception[ix];
            ctx.beginPath();
            //ctx.moveTo(pos[0], pos[1]);
            //ctx.arc(pos[0], pos[1], pointOption.radius, 0, pi);
            ctx.fillRect(pos[0], pos[1], pointOption.radius, pointOption.radius);
        }

        //ctx.stroke();
        //ctx.fill();

        if (!this.isAutoScale) {
            var overYPos = this.calculateY(this.customYaxisMax) + aliasPixel - pointHalf;
            //ctx.beginPath();
            ctx.fillStyle = this.normalOverColor;
            for (ix = 0, ixLen = overElapsed.n.length; ix < ixLen; ix++) {
                //ctx.arc(overElapsed.n[ix], overYPos, pointOption.radius, 0, pi);
                ctx.beginPath();
                ctx.fillRect(overElapsed.n[ix], overYPos, pointOption.radius, pointOption.radius);
            }
            //ctx.fill();

            //ctx.beginPath();
            ctx.fillStyle = this.exceptionOverColor;
            for (ix = 0, ixLen = overElapsed.e.length; ix < ixLen; ix++) {
                //ctx.arc(overElapsed.e[ix], overYPos, pointOption.radius, 0, pi);
                ctx.beginPath();
                ctx.fillRect(overElapsed.e[ix], overYPos, pointOption.radius, pointOption.radius);
            }
            //ctx.fill();
        }

        data = null;
        yOffset = null;
        xPoint = null;
        pointOption = null;
        ctx = null;
        data = null;
        normal = null;
        normalDistinct = null;
        exception = null;
        elapsedArr = null;
        instanceId = null;
        elapsed = null;
        pos = null;
    };

    XMTxnMonitorChart.prototype.compactDrawSeries = function () {
        this.totalCount = 0;
        this.maxOverCount = 0;
        this.maxTimeValue = 0;

        var yOffset = this.offset.yaxis;
        var xPoint = this.offset.xaxis.point;
        var pointOption = this.options.series.point;
        var pointHalf = pointOption.radius / 2;

        var ctx = this.bufferCtx;

        ctx.beginPath();
        ctx.fillStyle = this.normalColor;

        var startFillIndex = 0;
        var pi = Math.PI * 2;
        var x = null;
        var y = null;
        var ix = null, ixLen = null;
        var jx = null, jxLen = null;
        var data = this.txnInfo.data;
        var normal = []; // 0.1 초 단위로 중복 제거
        var exception = [];
        var elapsedArr;
        var elapsed;
        var aliasPixel = this.aliasPixel(ctx.lineWidth);

        if (!this.isAutoScale) {
            var overElapsed = {
                n: [],
                e: []
            };
        }

        var overFlag = false;
        // normal 그리기
        var cnt = 0;

        for (ix = this.txnInfo.startIndex, ixLen = data.length; ix < ixLen; ix++) {
            if (data[ix]) {
                elapsedArr = data[ix].data;
                xPoint[cnt] = this.calculateXIndex(cnt);
                x = xPoint[cnt] + aliasPixel;

                normal.length = 0;
                for (jx = 0, jxLen = elapsedArr.length; jx < jxLen; jx++) {
                    overFlag = false;

                    // 선택된 그룹에 포함된 인스턴스이면
                    elapsed = Math.round(elapsedArr[jx][0] / 100) / 10;

                    if (elapsedArr[jx].length > 2) {
                        this.totalCount += elapsedArr[jx][2];
                    }

                    // undder elapsed
                    if (this.isMinValue && elapsed < this.customYaxisMin) {
                        //++this.maxOverCount;

                    // over elapsed
                    } else if (!this.isAutoScale && elapsed > this.customYaxisMax) {
                        this.maxTimeValue = Math.max(elapsed, this.maxTimeValue);
                        ++this.maxOverCount;
                        elapsed = this.customYaxisMax;

                        if (elapsedArr[jx][1] == 1) {
                            // over exception
                            // 중복 제거
                            if (overElapsed.e.indexOf(x) == -1) {
                                overElapsed.e[overElapsed.e.length] = x;  // x 축 좌표만 기억, y 는 같으니
                            }
                        } else {
                            // over normal
                            if (overElapsed.n.indexOf(x) == -1) {
                                overElapsed.n[overElapsed.n.length] = x; // x 축 좌표만 기억, y 는 같으니
                            }
                        }
                    } else {
                        // exception 이면 normal 을 먼저 그린 이후 그린다
                        if (elapsedArr[jx][1] == 1) {
                            y = this.calculateY(elapsed) + aliasPixel - pointHalf;
                            exception[exception.length] = [x, y, overFlag];
                        } else {
                            // 0.1 초 단위로 중복 제거
                            if (normal.indexOf(elapsed) == -1) {
                                normal[normal.length] = elapsed;
                                y = this.calculateY(elapsed) + aliasPixel - pointHalf;
                                // moveTo 보다 beginPath 효율이 좋음
                                ctx.beginPath();
                                ctx.fillRect(x, y, pointOption.radius, pointOption.radius);
                            }
                        }
                    }

                }
            }
            cnt ++;
        }

        if (this.txnInfo.startIndex !== 0) {
            for (ix = 0, ixLen = this.txnInfo.endIndex; ix <= ixLen; ix++) {
                if (data[ix]) {
                    elapsedArr = data[ix].data;
                    xPoint[cnt] = this.calculateXIndex(cnt);

                    x = xPoint[cnt] + aliasPixel;

                    normal.length = 0;
                    for (jx = 0, jxLen = elapsedArr.length; jx < jxLen; jx++) {
                        overFlag = false;

                        // 선택된 그룹에 포함된 인스턴스이면
                        elapsed = Math.round(elapsedArr[jx][0] / 100) / 10;

                        if (elapsedArr[jx].length > 2) {
                            this.totalCount += elapsedArr[jx][2];
                        }

                        // undder elapsed
                        if (this.isMinValue && elapsed < this.customYaxisMin) {
                            //++this.maxOverCount;

                        // over elapsed
                        } else if (!this.isAutoScale && elapsed > this.customYaxisMax) {
                            this.maxTimeValue = Math.max(elapsed, this.maxTimeValue);
                            ++this.maxOverCount;
                            elapsed = this.customYaxisMax;

                            if (+elapsedArr[jx][1] === 1) {
                                // over exception
                                // 중복 제거
                                if (overElapsed.e.indexOf(x) == -1) {
                                    overElapsed.e[overElapsed.e.length] = x;       // x 축 좌표만 기억, y 는 같으니
                                }
                            } else {
                                // over normal
                                if (overElapsed.n.indexOf(x) == -1) {
                                    overElapsed.n[overElapsed.n.length] = x;    // x 축 좌표만 기억, y 는 같으니
                                }
                            }
                        } else {
                            // exception 이면 normal 을 먼저 그린 이후 그린다
                            if (+elapsedArr[jx][1] === 1) {
                                y = this.calculateY(elapsed) + aliasPixel - pointHalf;
                                exception[exception.length] = [x, y, overFlag];

                            } else {
                                // 0.1 초 단위로 중복 제거
                                if (normal.indexOf(elapsed) == -1) {
                                    //normal.push(elapsed);
                                    normal[normal.length] = elapsed;
                                    y = this.calculateY(elapsed) + aliasPixel - pointHalf;
                                    // moveTo 보다 beginPath 효율이 좋음
                                    ctx.beginPath();
                                    ctx.fillRect(x, y, pointOption.radius, pointOption.radius);
                                }
                            }
                        }

                    }
                }
                cnt++;
            }
        }

        // exception 그리기
        ctx.beginPath();
        ctx.fillStyle = this.exceptionColor;

        var pos;
        for (ix = 0, ixLen = exception.length; ix < ixLen; ix++) {
            pos = exception[ix];
            ctx.beginPath();
            ctx.fillRect(pos[0], pos[1], pointOption.radius, pointOption.radius);
        }

        if (!this.isAutoScale) {
            var overYPos = this.calculateY(this.customYaxisMax) + aliasPixel - pointHalf;

            ctx.fillStyle = this.normalOverColor;
            for (ix = 0, ixLen = overElapsed.n.length; ix < ixLen; ix++) {
                ctx.beginPath();
                ctx.fillRect(overElapsed.n[ix], overYPos, pointOption.radius, pointOption.radius);
            }

            ctx.fillStyle = this.exceptionOverColor;
            for (ix = 0, ixLen = overElapsed.e.length; ix < ixLen; ix++) {
                ctx.beginPath();
                ctx.fillRect(overElapsed.e[ix], overYPos, pointOption.radius, pointOption.radius);
            }
        }

        data = null;
        yOffset = null;
        xPoint = null;
        pointOption = null;
        ctx = null;
        normal = null;
        exception = null;
        elapsedArr = null;
        elapsed = null;
        pos = null;
    };

    XMTxnMonitorChart.prototype.setGrid = function () {
        // 차트가 그려질 그리드 영역
        this.createYLabel();
        this.createXLabel();
    };

    XMTxnMonitorChart.prototype.setGridOffset = function () {
        //var ctx = this.displayCtx;
        var ctx = this.bufferCtx;

        ctx.font = this.getLabelStyle('x');
        var xLabelWidth = ctx.measureText('88:88:88').width + 20;		// 88:88 넓이 계산용. 의미없음
        ctx.font = this.getLabelStyle('y');
        var yLabelWidth = ctx.measureText(this.yLabelFormat(this.offset.yaxis.max, this.options.yaxis)).width + 20;
        //var xLabelWidth = this.offset.xaxis.labelWidth;
        //var yLabelWidth = this.offset.yaxis.labelWidth;
        if (this.isFixedYLabelWidth && this.options.yaxis.labelWidth > 0) {
            yLabelWidth = this.options.yaxis.labelWidth;
        }
        //this.xScalePaddingRight = Math.round(xLabelWidth / 2 + 3);
        this.xScalePaddingRight = 10;
        this.xScalePaddingLeft = Math.round((xLabelWidth / 2 > yLabelWidth ) ? xLabelWidth / 2 : yLabelWidth);

        this.offset.grid.x = this.xScalePaddingLeft;
        this.offset.grid.x2 = this.width - this.xScalePaddingRight;

        this.maxXLabelWidth = xLabelWidth;
        this.maxYLabelWidth = yLabelWidth;

        ctx = null;
    };

    XMTxnMonitorChart.prototype.getGridOffset = function () {
        return {
            x: this.offset.grid.x,
            y: this.offset.grid.y,
            width: this.offset.grid.width,
            height: this.offset.grid.height
        };
    };

    XMTxnMonitorChart.prototype.createXLabel = function () {
        this.calculateXRange();
    };

    XMTxnMonitorChart.prototype.createYLabel = function () {
        var info = this.offset.yaxis;
        this.valuesCount = this.txnInfo.data.length;

        this.calculateYRange();

        if (info.steps == 0) {
            return;
        }

        var grid = this.options.grid;
        var yaxis = this.options.yaxis;
        var yLabelGap = (info.endPoint - info.startPoint) / info.steps;
        var xStart = this.xScalePaddingLeft;
        var xEnd = this.width - this.xScalePaddingRight;
        var yLabelCenter = null;
        var linePositionY = null;
        var circleMargin = this.options.series.point.radius / 2;
        //var circleMargin = 0;
        if (yaxis.ticks == null) {
            yaxis.ticks = new Array(0);
        } else {
            yaxis.ticks.length = 0;
        }

        var ctx = this.bufferCtx;
        //var ctx = this.displayCtx;

        //this.bufferCtx.font = this.getLabelStyle('y');
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.options.xaxis.labelStyle.color;

        ctx.lineWidth = grid.gridLineWidth;

        var aliasPixel = this.aliasPixel(ctx.lineWidth);

        ctx.beginPath();

        for (var ix = 0, ixLen = info.steps; ix <= ixLen; ix++) {
            if (info.isStepValueFloat) {
                // 자바스크립트 실수 연산이 최악이다
                yaxis.ticks[ix] = Math.round((info.min + (ix * info.stepValue)) * 10) / 10;
            } else {
                yaxis.ticks[ix] = info.min + (ix * info.stepValue);
            }

            if(yaxis.ticks[ix] <= info.max){
                //yLabelCenter = info.endPoint - (yLabelGap * ix);
                yLabelCenter = this.calculateY(yaxis.ticks[ix]);
                //linePositionY = Math.round(yLabelCenter) + aliasPixel;
                linePositionY = yLabelCenter + aliasPixel;

                // y축 label 그리기
                ctx.fillText(this.yLabelFormat(yaxis.ticks[ix], this.options.yaxis), xStart - (this.maxYLabelWidth / 2) - circleMargin, yLabelCenter);
                // y축 label 선 그리기

                //ctx.moveTo(xStart + 15, linePositionY);

                if (ix == 0) {
                    //ctx.moveTo(xStart - circleMargin, linePositionY + circleMargin);
                    ctx.moveTo(xStart, linePositionY + circleMargin);
                    ctx.lineTo(xEnd, linePositionY + circleMargin);
                    ctx.strokeStyle = grid.border.color;
                    ctx.stroke();
                    ctx.beginPath();
                } else {
                    ctx.moveTo(xStart, linePositionY);
                    ctx.lineTo(xEnd, linePositionY);
                    ctx.strokeStyle = grid.gridLineColor;
                }
            }

        }

        ctx.stroke();

        grid = null;
        info = null;
    };

    XMTxnMonitorChart.prototype.calculateXRange = function () {
        var maxStep = (this.displayTimeRange > 0)? this.displayTimeRange : 6;

        this.offset.xaxis.min = (this.txnInfo.toTime - (maxStep * 1000 * 60));
        //this.offset.xaxis.min = this.txnInfo.fromTime;
        this.offset.xaxis.max = this.txnInfo.toTime;

        var grid = this.options.grid;
        //var ctx = this.displayCtx;
        var ctx = this.bufferCtx;
        var circleMargin = this.options.series.point.radius;
        //var circleMargin = 0;
        //var xLabelWidth = this.offset.xaxis.labelWidth;
        //ctx.font = this.getLabelStyle('y');
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = this.options.yaxis.labelStyle.color;

        var xLabelWidth = this.maxXLabelWidth;
        var interval = this.options.xaxis.tickInterval;
        var xPos = null;

        var step = Math.min(Math.ceil((this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / this.maxXLabelWidth), maxStep) || 1;
        var pixel = this.aliasPixel(ctx.lineWidth);


        //var interval = (this.offset.xaxis.max - this.offset.xaxis.min) / step;
        var startTime = new Date(this.offset.xaxis.min).setSeconds(0,0);
        var minute = null;

        ctx.beginPath();
        ctx.lineWidth = grid.gridLineWidth;
        ctx.strokeStyle = grid.border.color;

        ctx.moveTo(this.xScalePaddingLeft,	this.offset.yaxis.endPoint + circleMargin);
        ctx.lineTo(this.xScalePaddingLeft,	this.offset.yaxis.startPoint - 3);
        ctx.stroke();

        var inc = maxStep / step;

        for(var ix = 0; ix <= maxStep; ix+= inc){
            minute = startTime +  (ix * interval);
            if(minute >= this.offset.xaxis.min && minute <= this.offset.xaxis.max){
                xPos = this.calculateX(minute); // + pixel;

                // x축 label 그리기
                ctx.fillText(this.xLabelFormat(minute) , xPos , this.offset.yaxis.endPoint + 8);
            }
        }

        //var xLabelWidth = this.maxXLabelWidth;
        //
        //var xPos = null;
        //var step = Math.ceil(this.valuesCount / ((this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / xLabelWidth));
        //
        //var pixel = this.aliasPixel(ctx.lineWidth);
        //
        //for (var ix = 0; ix < this.valuesCount; ix = ix + step) {
        //
        //
        //    if (ix % step === 0) {
        //        xPos = this.calculateXIndex(ix) + pixel;
        //
        //        if (ix == 0) {
        //            // 왼쪽 y축 border
        //            ctx.beginPath();
        //            ctx.lineWidth = grid.gridLineWidth;
        //            ctx.strokeStyle = grid.border.color;
        //
        //            ctx.moveTo(xPos, this.offset.yaxis.endPoint + circleMargin);
        //            ctx.lineTo(xPos, this.offset.yaxis.startPoint - 3);
        //            //ctx.moveTo(xPos - circleMargin, this.offset.yaxis.endPoint + circleMargin);
        //            //ctx.lineTo(xPos - circleMargin, this.offset.yaxis.startPoint - 3);
        //            ctx.stroke();
        //        }
        //
        //        if (ix != 0 && grid.showYLine) {
        //            ctx.beginPath();
        //            ctx.lineWidth = grid.gridLineWidth;
        //            ctx.strokeStyle = grid.gridLineColor;
        //
        //            ctx.moveTo(xPos, this.offset.yaxis.endPoint);
        //            ctx.lineTo(xPos, this.offset.yaxis.startPoint - 3);
        //            //ctx.moveTo(xPos - circleMargin, this.offset.yaxis.endPoint);
        //            //ctx.lineTo(xPos - circleMargin, this.offset.yaxis.startPoint - 3);
        //            ctx.stroke();
        //        }
        //        // x축 label 그리기
        //        ctx.fillText(this.xLabelFormat(this.offset.xaxis.min + (ix * 1000)), xPos, this.offset.yaxis.endPoint + 8);
        //
        //    }
        //}

        this.offset.xaxis.step = step;
        //this.offset.grid.x = point[0];

        grid = null;
        //point = null;
        ctx = null;
    };

    XMTxnMonitorChart.prototype.calculateXIndex = function (index) {
        var innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight);
        var valueWidth = innerWidth / Math.max(this.valuesCount - 1, 1);
        var valueOffset = (valueWidth * index) + this.xScalePaddingLeft;

        //valueOffset += (valueWidth/2);

        //return Math.round(valueOffset);
        return valueOffset;
        //return valueOffset;
    };

    XMTxnMonitorChart.prototype.calculateX = function (value) {
        var innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight);

        return Math.round(this.xScalePaddingLeft + ((value - this.offset.xaxis.min) * innerWidth) / (this.offset.xaxis.max - this.offset.xaxis.min));
    };

    XMTxnMonitorChart.prototype.calculateY = function (value) {
        if (value == null) {
            return null;
        }

        var scalingFactor = this.drawingArea() / (this.offset.yaxis.max - this.options.yaxis.min);
        //return this.offset.yaxis.endPoint - (scalingFactor * (value - (this.options.yaxis.min || 0)));
        return Math.round(this.offset.yaxis.endPoint - (scalingFactor * (value - (this.options.yaxis.min || 0))));
    };

    XMTxnMonitorChart.prototype.drawingArea = function () {
        return this.offset.yaxis.endPoint - this.offset.yaxis.startPoint;
    };

    XMTxnMonitorChart.prototype.calculateYRange = function () {
        var yaxis = this.options.yaxis;
        var padding = this.options.grid.padding;
        var startPoint = +yaxis.labelStyle.fontSize;
        var endPoint = this.height - (yaxis.labelStyle.fontSize * 1.5) - 5; // -5 to pad labels

        startPoint += padding;
        endPoint -= padding;

        var drawYRange = endPoint - startPoint;

        var minSteps = 2;
        var maxSteps = Math.floor(drawYRange / (yaxis.labelStyle.fontSize * 1.5));
        var skipFitting = (minSteps >= maxSteps);

        var maxValue = this.options.yaxis.max == null ? this.getMaxValue() / 1000 : this.options.yaxis.max;
        if (this.isAutoScale && this.options.yaxis.autoscaleRatio != null) {
            maxValue *= (this.options.yaxis.autoscaleRatio + 1);
        }

        if (maxValue < 1) {
            maxValue = 1;
        }
        var minValue = (this.customYaxisMin > 0)? this.customYaxisMin : 0;
        var startFromZero = (this.customYaxisMin === 0); //true;
        var integersOnly = true;

        //if (maxValue === minValue) {
        if (maxValue <= minValue) {
            maxValue = Math.max(maxValue, minValue) + 1;
            // So we don't end up with a graph with a negative start value if we've said always start from zero
            if (minValue >= 1 && !startFromZero) {
                //minValue -= 1;
            }
            else {
                // Make up a whole number above the values
                maxValue += 1;
            }
        }

        var valueRange = Math.abs(maxValue - minValue),
            rangeMagnitude = this.calculateMagnitude(valueRange),
            graphMax = this.options.yaxis.max == null ? (Math.ceil(maxValue / (1 * Math.pow(10, rangeMagnitude))) * Math.pow(10, rangeMagnitude)) : maxValue,
            graphMin = (startFromZero) ? 0 : minValue,//Math.floor(minValue / (1 * Math.pow(10, rangeMagnitude))) * Math.pow(10, rangeMagnitude),
            graphRange = (graphMax < graphMin)? 0 : graphMax - graphMin,
            stepValue = Math.pow(10, rangeMagnitude),
            numberOfSteps = Math.round(graphRange / stepValue);

        if (maxValue == 1) {
            stepValue = 0.2;
            numberOfSteps = 5;
        }

        //If we have more space on the graph we'll use it to give more definition to the data
        while (graphRange > 0 && (numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
            if (numberOfSteps > maxSteps) {
                stepValue *= 2;
                numberOfSteps = Math.round(graphRange / stepValue);
                // Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
                if (numberOfSteps % 1 !== 0) {
                    skipFitting = true;
                }
            }
            //We can fit in double the amount of scale points on the scale
            else {
                //If user has declared ints only, and the step value isn't a decimal
                if (integersOnly && rangeMagnitude >= 0) {
                    //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
                    if (stepValue / 2 % 1 === 0) {
                        stepValue /= 2;
                        numberOfSteps = Math.round(graphRange / stepValue);
                    }
                    //If it would make it a float break out of the loop
                    else {
                        break;
                    }
                }
                //If the scale doesn't have to be an int, make the scale more granular anyway.
                else {
                    stepValue /= 2;
                    numberOfSteps = Math.round(graphRange / stepValue);
                }

            }
        }

        if (skipFitting) {
            numberOfSteps = minSteps;
            stepValue = graphRange / numberOfSteps;
        }

        this.offset.yaxis.steps = numberOfSteps;
        this.offset.yaxis.stepValue = stepValue;
        this.offset.yaxis.isStepValueFloat = (stepValue + '').indexOf('.') > -1 ? true : false;
        this.offset.yaxis.min = graphMin;
        this.offset.yaxis.max = this.options.yaxis.max == null ? (graphMin + (numberOfSteps * stepValue)) : this.options.yaxis.max;
        this.offset.yaxis.startPoint = startPoint;
        this.offset.yaxis.endPoint = endPoint;

        this.offset.grid.y = startPoint;
        this.offset.grid.y2 = endPoint;

        this.setGridOffset();

        yaxis = null;
    };

    XMTxnMonitorChart.prototype.xLabelFormat = function (value) {
        var date = new Date(+value);
        return (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" +
            (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    };

    XMTxnMonitorChart.prototype.yLabelFormat = function (value, axis) {
        var prefix = d3.formatPrefix(value),
            tempValue = value + '',
            decPoint = 0;

        if (tempValue.indexOf('.') !== -1) {
            tempValue = tempValue.substring(tempValue.indexOf('.') + 1);
            decPoint = tempValue.length > 3 ? 3 : tempValue.length;
        }

        tempValue = +value.toFixed(decPoint);

        if (tempValue >= 1000) {
            var decimal = 1;
            if (prefix.symbol !== 'k'){
                decimal = 2;
            }
            return d3.round(prefix.scale(tempValue), decimal) + prefix.symbol;
        } else {
            return tempValue;
        }
    };

    /**
     * @note label 스타일을 설정한다.
     * @param direct{string}
     * @param fontSize{number}
     * @param color{string}    ex ) #000
     * @param fontFamily{string}
     */
    XMTxnMonitorChart.prototype.setLabelStyle = function (direct, fontSize, color, fontFamily) {
        var style = null;
        if (direct === 'x') {
            style = this.options.xaxis.labelStyle;
        } else {
            style = this.options.yaxis.labelStyle;
        }

        style.fontSize = fontSize;
        style.color = color;
        style.fontFamily = fontFamily;
    };

    /**
     * @note label 스타일을 가져온다.
     * @param direct{string} x | y
     * @returns {string}
     */
    XMTxnMonitorChart.prototype.getLabelStyle = function (direct) {
        var style = null;
        if (direct === 'x') {
            style = this.options.xaxis.labelStyle;
        } else {
            style = this.options.yaxis.labelStyle;
        }

        return 'normal ' + style.fontSize + 'px ' + style.fontFamily;
    };

    XMTxnMonitorChart.prototype.setXAxisStyle = function (style) {
        this.options.xaxis.labelStyle.fontSize = style.size;
        this.options.xaxis.labelStyle.color = style.color;
        this.options.xaxis.labelStyle.fontFamily = style.family;
    };

    XMTxnMonitorChart.prototype.setYAxisStyle = function (style) {
        this.options.yaxis.labelStyle.fontSize = style.size;
        this.options.yaxis.labelStyle.color = style.color;
        this.options.yaxis.labelStyle.fontFamily = style.family;
    };

    XMTxnMonitorChart.prototype.getXValueToIndex = function (value) {
        return Math.round((this.valuesCount - 1) / (this.offset.xaxis.max - this.offset.xaxis.min) * (value - this.offset.xaxis.min));
    };

//////////////////////////////////////////////////// OVERLAY ////////////////////////////////////////////////////


//////////////////////////////////////////////////// OVERLAY ACTION ////////////////////////////////////////////////////


    XMTxnMonitorChart.prototype.clearSelection = function (e) {
        this.overlayClear();
        this.selection.active = false;
        this.selection.isDrawing = false;
        this.selection.first.x = -1;
        this.selection.first.y = -1;
        this.selection.second.x = -1;
        this.selection.second.y = -1;
    };

    XMTxnMonitorChart.prototype.drawSelection = function (e) {
        if (this.options.selection.show) {
            var ctx = this.overlayCtx;

            ctx.save();

            var color = 'rgba(' + this.hexToRgb(this.options.selection.color) + ',';
            //+ series.fill + ')';

            ctx.strokeStyle = color + 0.8 + ')';
            ctx.lineWidth = 1;
            ctx.lineJoin = 'round';
            ctx.fillStyle = color + 0.4 + ')';

            var x = Math.min(this.selection.first.x, this.selection.second.x) + 0.5,
                y = Math.min(this.selection.first.y, this.selection.second.y) + 0.5,
                w = Math.abs(this.selection.second.x - this.selection.first.x) - 1,
                h = Math.abs(this.selection.second.y - this.selection.first.y) - 1;

            ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);

            ctx.restore();

            this.selection.isDrawing = true;
        }
    };

    XMTxnMonitorChart.prototype.setSelectionPos = function (pos, e) {
        var offset = this.chartContainer.getClientRects()[0];
        if (!offset) {
            return;
        }
        var grid = this.offset.grid;
        pos.x = this.clamp(0, e.pageX - offset.left, this.width);
        pos.y = this.clamp(0, e.pageY - offset.top, this.height);

        if (this.options.selection.mode === 'y')
            pos.x = pos == this.selection.first ? 0 : this.width;

        if (this.options.selection.mode === 'x')
            pos.y = pos == this.selection.first ? 0 : this.height;
    };

    XMTxnMonitorChart.prototype.getSelection = function () {
        if (!this.options.selection.show || !this.selection.active) {
            return;
        }

        var first = this.pointToValue(this.selection.first.x, this.selection.first.y);
        var second = this.pointToValue(this.selection.second.x, this.selection.second.y);

        return {
            x: Math.max(this.offset.xaxis.min, Math.min(first[0], second[0])),
            x2: Math.min(this.offset.xaxis.max, Math.max(first[0], second[0])),
            y: Math.max(this.offset.yaxis.min, Math.min(first[1], second[1])),
            y2: Math.min(this.offset.yaxis.max, Math.max(first[1], second[1]))
        };
    };

    XMTxnMonitorChart.prototype.clamp = function (min, value, max) {
        return value < min ? min : (value > max ? max : value);
    };

    XMTxnMonitorChart.prototype.pointToValue = function (x, y) {
        var xOffset = this.offset.xaxis;
        var yOffset = this.offset.yaxis;

        var xMin = this.calculateXIndex(0);
        //var xMax = xOffset.point[xOffset.point.length - 1];
        var xMax = this.calculateXIndex(this.valuesCount -1);
        var xMinVal = xOffset.min;
        var xMaxVal = xOffset.max;

        var yMin = yOffset.startPoint;
        var yMax = yOffset.endPoint;
        var yMinVal = yOffset.min;
        var yMaxVal = yOffset.max;

        return [
            (((x - xMin) / (xMax - xMin)) * (xMaxVal - xMinVal)) + xMinVal,
            yMaxVal - (((y - yMin) / (yMax - yMin)) * (yMaxVal - yMinVal)) // + yMinVal
        ];
    };

    /**
     *
     * @param x{number} x value
     * @param x2{number} x2 value
     * @param y{number} y value
     * @param y2{number} y2 value
     */
    XMTxnMonitorChart.prototype.getSelectionData = function (x, x2, y, y2) {
        var xIndex = this.getXValueToIndex(x);
        var x2Index = this.getXValueToIndex(x2);

        var data = this.txnInfo.data;
        var ix = null, ixLen = null;
        var jx = null, jxLen = null;
        var txnList = null;
        var length = this.txnInfo.length;
        var wasList = [];
        var value = null;
        var clientIP = null;
        var valideIP = false;
        var isDisplayWas = false;

        ix = xIndex + this.txnInfo.startIndex;
        if(ix >= length){
            ix = ix - length;
        }

        ixLen = x2Index + this.txnInfo.startIndex;

        if(xIndex >= 0 && xIndex < length &&
            x2Index >= 0 && x2Index < length){

            wasList[0] = [];  // Was ID
            wasList[1] = [];  // Client IP

            if(ixLen >= length){
                ixLen = ixLen - length;

                for(ix; ix <= length; ix++){
                    if(data[ix] != null){
                        txnList = data[ix].data;

                        for(jx = 0, jxLen = txnList.length; jx < jxLen; jx++){
                            value = txnList[jx][1] / 1000;
                            // y 보다 크고 y2 보다 작으며 선택된 인스턴스에 포함되며 중복되지 않는 조건
                            //if(value >= y && value <= y2 && Comm.selectedWasArr.indexOf(txnList[jx][0]) > -1 && wasList.indexOf(txnList[jx][0]) == -1){
                            //    wasList.push(txnList[jx][0]);
                            //}

                            if (value >= y && value <= y2 ) {

                                if (this.selectedWasIdArr && this.selectedWasIdArr.length > 0) {
                                    isDisplayWas = (+this.selectedWasIdArr.indexOf(+txnList[jx][0]) !== -1);
                                } else {
                                    isDisplayWas = (Comm.selectedWasArr.indexOf(txnList[jx][0]) > -1 && wasList[0].indexOf(txnList[jx][0]) === -1);
                                }

                                if (this.isOnlyErrorTxn && +txnList[jx][2] !== 1) {
                                    continue;
                                }

                                if (isDisplayWas) {
                                    wasList[0].push(txnList[jx][0]);
                                }
                            }
                        }
                    }
                }
                for(ix = 0; ix <= ixLen; ix++){
                    if(data[ix] != null){
                        txnList = data[ix].data;

                        for(jx = 0, jxLen = txnList.length; jx < jxLen; jx++){
                            value = txnList[jx][1] / 1000;
                            // y 보다 크고 y2 보다 작으며 선택된 인스턴스에 포함되며 중복되지 않는 조건
                            //if(value >= y && value <= y2 && Comm.selectedWasArr.indexOf(txnList[jx][0]) > -1 && wasList.indexOf(txnList[jx][0]) == -1){
                            //    wasList.push(txnList[jx][0]);
                            //}

                            if (value >= y && value <= y2 ) {

                                if (this.selectedWasIdArr && this.selectedWasIdArr.length > 0) {
                                    isDisplayWas = (+this.selectedWasIdArr.indexOf(+txnList[jx][0]) !== -1);
                                } else {
                                    isDisplayWas = (Comm.selectedWasArr.indexOf(txnList[jx][0]) > -1 && wasList[0].indexOf(txnList[jx][0]) === -1);
                                }

                                if (this.isOnlyErrorTxn && +txnList[jx][2] !== 1) {
                                    continue;
                                }

                                if (isDisplayWas) {
                                    wasList[0].push(txnList[jx][0]);
                                }
                            }
                        }
                    }
                }
            }else{
                for(ix; ix <= ixLen; ix++){
                    if(data[ix] != null){
                        txnList = data[ix].data;

                        for(jx = 0, jxLen = txnList.length; jx < jxLen; jx++){
                            value = txnList[jx][1] / 1000;
                            // y 보다 크고 y2 보다 작으며 선택된 인스턴스에 포함되며 중복되지 않는 조건
                            //if(value >= y && value <= y2 && Comm.selectedWasArr.indexOf(txnList[jx][0]) > -1 && wasList.indexOf(txnList[jx][0]) == -1){
                            //    wasList.push(txnList[jx][0]);
                            //}

                            if (value >= y && value <= y2) {

                                if (this.selectedWasIdArr && this.selectedWasIdArr.length > 0) {
                                    isDisplayWas = (+this.selectedWasIdArr.indexOf(+txnList[jx][0]) !== -1);
                                } else {
                                    isDisplayWas = (Comm.selectedWasArr.indexOf(txnList[jx][0]) > -1 && wasList[0].indexOf(txnList[jx][0]) === -1);
                                }
                                if (this.isOnlyErrorTxn && +txnList[jx][2] !== 1) {
                                    continue;
                                }
                                if (isDisplayWas) {
                                    wasList[0].push(txnList[jx][0]);
                                }
                            }
                        }
                    }
                }
            }
        }

        return wasList;
    };
//////////////////////////////////////////////////// EVENT ////////////////////////////////////////////////////


    XMTxnMonitorChart.prototype.mousedownEvent = function (e) {
        if (e.which != 1)  // only accept left-click
            return;

        if(! this.selection){
            return;
        }

        // cancel out any text selections
        document.body.focus();
        this.overlayClear();
        this.setSelectionPos(this.selection.first, e);
        this.selection.active = true;

        this.mouseUpHandler = this.mouseupEvent.bind(this);
        this.mouseMoveHandler = this.mousemoveEvent.bind(this);

        window.addEventListener('mouseup', this.mouseUpHandler, false);
        window.addEventListener('mousemove', this.mouseMoveHandler, false);
    };

    XMTxnMonitorChart.prototype.dblclickEvent = function (e) {
        if (this.popupTrend !== undefined) {
            this.popupTrend();
        }
    };

    XMTxnMonitorChart.prototype.mouseWheelEvent = function (e) {
        if (this.displayMouseWheel !== undefined) {
            this.displayMouseWheel(e);
        }
    };

    XMTxnMonitorChart.prototype.mousemoveEvent = function (e) {
        if(! this.selection){
            return;
        }

        //var offset = this.getMousePosition(e);

        if (this.options.selection.show && this.selection.active) {
            this.overlayCanvas.style.cursor = 'crosshair';
            this.overlayClear();
            this.setSelectionPos(this.selection.second, e);
            this.drawSelection(e);
        }
    };


    XMTxnMonitorChart.prototype.mouseupEvent = function (e) {
        mouseUpHandler = null;

        if (! this.selection) {
            return;
        }

        this.setSelectionPos(this.selection.second, e);

        if (this.selection.active && this.selectionEvent) {
            var offset = this.getSelection();
            this.selectionEvent({
                offset: offset,
                data: this.getSelectionData(offset.x, offset.x2, offset.y, offset.y2)
            });
        }
        // no more dragging
        this.selection.active = false;

        this.overlayCanvas.style.cursor = 'default';
        if (this.selection.first.x == this.selection.second.x && this.selection.first.y == this.selection.second.y) {
            this.clearSelection();
        }

        window.removeEventListener('mouseup', this.mouseUpHandler);
        return false;
    };


    /**
     * dom resize 가 안먹어서 extjs resize 이벤트를 대입.
     * @param me
     * @param width
     * @param height
     * @param oldWidth
     * @param oldHeight
     * @param eOpts
     */
    XMTxnMonitorChart.prototype.resize = function () {
        var offset = this.chartContainer.getClientRects()[0];
        if (offset) {
            this.width = offset.width;
            this.height = offset.height;

            var context = this.bufferCtx;
            // Save the context, so we can reset in case we get replotted.  The
            // restore ensure that we're really back at the initial state, and
            // should be safe even if we haven't saved the initial state yet.

            context.restore();
            context.save();

            // Scale the coordinate space to match the display density; so even though we
            // may have twice as many pixels, we still want lines and other drawing to
            // appear at the same size; the extra pixels will just make them crisper.

            context.scale(this.pixelRatio, this.pixelRatio);

            if (this.resizeTimer) {
                clearTimeout(this.resizeTimer);
            }

            this.resizeTimer = setTimeout(this.redraw.bind(this), 50);
        }
    };


    XMTxnMonitorChart.prototype.findHitXaxis = function (mouseX) {
        var grid = this.offset.grid;
        //var gridWidth = grid.x2 - grid.x;
        var gridWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight);
        var xPoint = this.offset.xaxis.point;
        var mouseActiveRadius = this.options.grid.mouseActiveRadius;

        if (mouseX >= grid.x - mouseActiveRadius && mouseX <= grid.x2 + mouseActiveRadius) {
            var index = Math.round((xPoint.length - 1) / gridWidth * (mouseX - grid.x));

            if (mouseX <= xPoint[index] + mouseActiveRadius && mouseX >= xPoint[index] - mouseActiveRadius) {
                return index;
            }
        }
        return null;
    };

    XMTxnMonitorChart.prototype.findHitItem = function (offset) {
        var x = offset[0];
        var y = offset[1];
        var mouseActiveRadius = this.options.grid.mouseActiveRadius;

        var xIndex = this.findHitXaxis(x);

        if (xIndex !== null) {
            var yPoint = null;
            var seriesIndex = null;
            for (var ix = this.serieseList.length - 1; ix >= 0; ix--) {
                yPoint = this.serieseList[ix].yPoint[xIndex];
                if (y <= yPoint + mouseActiveRadius && y >= yPoint - mouseActiveRadius) {
                    seriesIndex = ix;
                    break;
                }
            }

            if (seriesIndex !== null) {
                return {
                    x: this.serieseList[ix].data[xIndex][0],
                    y: this.serieseList[ix].data[xIndex][1],
                    seriesIndex: ix,
                    dataIndex: xIndex
                };
            }
        }

        return null;
    };

    XMTxnMonitorChart.prototype.destroy = function () {
        var list = Object.keys(this);
        for(var ix = 0, ixLen = list.length; ix < ixLen; ix++){
            delete this[list[ix]];
        }
    };


//////////////////////////////////////////////////// UTIL ////////////////////////////////////////////////////
    XMTxnMonitorChart.prototype.toFixed = function (number, point) {
        if (number == null) {
            return null;
        }
        var temp = (+number).toFixed(point);
        var dotPos = temp.indexOf('.');
        var integer = null;

        if (dotPos == -1) {
            integer = temp;
            return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            integer = temp.substring(0, dotPos);
            return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + temp.substring(dotPos, temp.length);
        }

    };


    XM.cls['XMTxnMonitorChart'] = XMTxnMonitorChart;
})(window.EXEM);
