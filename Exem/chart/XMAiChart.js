(function(XM) {
    /**
     * @note XMCanvas 상속.
     * @param arg
     * @constructor
     */
    var XMAiChart = function(arg) {
        this.legendNameHighLight = true;
        if (!this.initProperty(arg)) {
            return;
        }
        // this.firstShowLegend = false;
        this.init();

    };

    // 상속
    XMAiChart.prototype = XM.cls.create('XMLineChart');

    XMAiChart.prototype.xLabelFormat = function(value) {
        var date = new Date(+value);
        return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ':' +
            (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
            (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    };

    XMAiChart.prototype.yLabelFormat = function(value) {
        var prefix = d3.formatPrefix(value);
        if (value >= 1000) {
            return prefix.scale(value) + prefix.symbol;
        } else {
            return value;
        }
    };

    XMAiChart.prototype.toolTipFormat = function(value) {
        var date = new Date(value);
        return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ':' +
            (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
            (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    };

    XMAiChart.prototype.setYAxisFormatter = function() {

        var fn = this.checkUnitType(this.unitType);
        if (fn) {
            this.yLabelFormat = fn;
        }

    };

    XMAiChart.prototype.checkUnitType = function(type) {
        var tickFormatFunc = null;

        if (!type) {
            return tickFormatFunc;
        }

        switch (type) {
            case 'count':
            case 'counts':
            case 'block':
            case 'blocks':
            case 'number':
            case 'byte':
            case 'bytes':
            case 'KB':
                tickFormatFunc = function suffixFormatter(val, axis) {
                    var result = 0;
                    if (val >= 1000000000) {
                        if (val % 1000000000 == 0) {
                            result = (val / 1000000000).toFixed(axis.tickDecimals) + 'G';
                        } else {
                            result = (val / 1000000000).toFixed(1) + 'G';
                        }
                        return result;
                    } else if (val >= 1000000) {
                        if (val % 1000000 == 0) {
                            result = (val / 1000000).toFixed(axis.tickDecimals) + 'M';
                        } else {
                            result = (val / 1000000).toFixed(1) + 'M';
                        }
                        return result;
                    } else if (val >= 1000) {
                        if (val % 1000 == 0) {
                            result = (val / 1000).toFixed(axis.tickDecimals) + 'k';
                        } else {
                            result = (val / 1000).toFixed(1) + 'k';
                        }
                        return result;
                    } else {
                        return val.toFixed(axis.tickDecimals);
                    }
                };
                break;

            case '%':
                this.options.yaxis.max = 100;
                break;

            default:
                break;
        }

        return tickFormatFunc;
    };
    //////////////////////////////////////////////////// OVERLAY ////////////////////////////////////////////////////

    //////////////////////////////////////////////////// OVERLAY ACTION ////////////////////////////////////////////////////

    //////////////////////////////////////////////////// EVENT ////////////////////////////////////////////////////
    /**
     * @note 레전드 영역 컬러 클릭 이벤트
     * @param e
     */
    XMAiChart.prototype.legendColorClick = function(e) {
        var seriesIndex = e.target.dataset.seriesIndex;
        var check = +e.target.dataset.check;
        var color = this.serieseList[seriesIndex].color || this.options.colors[seriesIndex];
        // 색이 채워져 있는 상태
        if (check == 1) {
            this.setSeriesVisible(seriesIndex, false);
            e.target.dataset.check = 0;
            e.target.style.backgroundColor = '';
            e.target.style.border = '2px solid ' + color;
        } else {
            this.setSeriesVisible(seriesIndex, true);
            e.target.dataset.check = 1;
            e.target.style.backgroundColor = color;
            e.target.style.border = 'none';
        }
        this.draw();
    };

    XMAiChart.prototype.legendNameMouseEnter = function(e) {
        var seriesIndex = e.target.dataset.seriesIndex;
        this.serieseList[seriesIndex].overLineWidth = this.serieseList[seriesIndex].lineWidth + 2;
        this.draw();
    };
    XMAiChart.prototype.legendNameMouseLeave = function(e) {
        var seriesIndex = e.target.dataset.seriesIndex;
        this.serieseList[seriesIndex].overLineWidth = null;
        this.draw();
    };

    XMAiChart.prototype.mousemoveEvent = function(e){
        var offset = this.getMousePosition(e);

        if(this.options.crosshair.show){
            this.overlayClear();
            this.drawCrosshair(offset);
        }

        var index = this.findHitXaxis(offset[0]);
        var item  = this.findHitItem(offset);

        if (item != null && item.type == 'anomaly' && !this.isTxn) {
            this.chartContainer.style.cursor = 'pointer';
        } else {
            this.chartContainer.style.cursor = 'default';
        }

        if(index != null){
            this.toolTip.show(index, offset, e);
        }
    };

    XMAiChart.prototype.onclick = function(e) {
        var offset = this.getMousePosition(e);
        var item  = this.findHitItem(offset);

        if (item != null && item.type == 'anomaly' && !this.isTxn) {

            var causalityAnalysis= Ext.create('Exem.CausalityAnalysis', {
                wasId : this.wasId,
                statId : this.statId,
                moment: item.x
            });

            causalityAnalysis.init();
        }
    };

    XMAiChart.prototype.findHitItem = function (offset) {
        var x = offset[0];
        var y = offset[1];
        var mouseActiveRadius = this.options.grid.mouseActiveRadius;

        var xIndex = this.findHitXaxis(x);

        if(xIndex !== null){
            var yPoint = null;
            var seriesIndex = null;
            for(var ix = this.serieseList.length -1; ix >= 0; ix--){
                if(this.serieseList[ix].visible){
                    yPoint = this.serieseList[ix].yPoint[xIndex];
                    if(yPoint != null && y <= yPoint + mouseActiveRadius && y >= yPoint - mouseActiveRadius){
                        seriesIndex = ix;
                        break;
                    }
                }
            }

            if(seriesIndex !== null){
                return {
                    x: this.serieseList[seriesIndex].data[xIndex][0],
                    y: this.serieseList[seriesIndex].data[xIndex][1],
                    seriesIndex: seriesIndex,
                    dataIndex: xIndex,
                    type : this.serieseList[seriesIndex].type
                };
            }
        }

        return null;
    };

    /**
     * @note 차트 데이터의 최소, 최고 값을 저장한다.
     * @param value{array} [x,y]
     * @param index{number} data index
     */
    XMAiChart.prototype.setMinMaxValue = function(series, value, index) {
        var x = value[0];
        var y;
        if (Array.isArray(value[1])) {
            y = (+value[1][1]);
        } else {
            y = (+value[1]);
        }

        // 전체 시리즈의 최소값
        if (this.minValueInfo.y == null) {
            this.minValueInfo.x = x;
            this.minValueInfo.y = y;
            this.minValueInfo.index = index;
            this.minValueInfo.seriesIndex = series.seriesIndex;
        } else {
            if (this.minValueInfo.y > y) {
                this.minValueInfo.x = x;
                this.minValueInfo.y = y;
                this.minValueInfo.index = index;
                this.minValueInfo.seriesIndex = series.seriesIndex;
            }
        }

        // 시리즈의 최소값
        if (series.min == null) {
            series.min = y;
            series.minIndex = index;
        } else {
            if (series.min > y) {
                series.min = x;
                series.minIndex = index;
            }
        }

        // 전체 시리즈의 최대값 ( 마지막 시리즈의 최대값을 저장하기 위해 > 에서 >= 로 변경 )
        if (this.maxValueInfo.y == null || y >= this.maxValueInfo.y) {
            this.maxValueInfo.x = x;
            this.maxValueInfo.y = y;
            this.maxValueInfo.index = index;
            this.maxValueInfo.seriesIndex = series.seriesIndex;
        }

        // 시리즈의 최대값
        if (y > series.max) {
            series.max = y;
            series.maxIndex = index;
        }
        value = null;
    };

    /**
     * @override XMCanvas 오버라이드
     * canvas 에 그린다.
     * double buffering 으로 beffuer canvas 에 그린후 display canvas 에 buffer canvas 를 엎는다.
     */
    XMAiChart.prototype.draw = function() {
        if (this.width == null || this.height == null) {
            return;
        }

        this.isDrawing = true;
        this.clearDraw();
        this.setGrid();
        var ix, ixLen;
        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            if (this.serieseList[ix].type != 'band') {
                continue;
            }
            this.drawBand(ix);
        }

        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            if (this.serieseList[ix].type == 'anomaly' || this.serieseList[ix].type == 'band') {
                continue;
            }
            this.drawSeries(ix);
        }

        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            if (this.serieseList[ix].type != 'anomaly') {
                continue;
            }
            this.drawAnomaly(ix);
        }
        this.displayCtx.drawImage(this.bufferCanvas, 0 , 0);

        if (this.options.maxValueTip.show) {
            this.maxValueTip.show();
        }

        if (this.showLastValueToolTip) {
            this.lastValueToolTip.show(this.lastValueSeriesIndex, this.lastValueIndex);
        }
    };

    /**
     *
     * @param seriesIndex{number}
     */
    XMAiChart.prototype.drawAnomaly = function(seriesIndex) {
        if (this.serieseList[seriesIndex] == null || ! this.serieseList[seriesIndex].visible) {
            return;
        }

        var series = this.serieseList[seriesIndex];
        var xPoint = this.offset.xaxis.point;

        var color = series.color || this.options.colors[seriesIndex];
        var ctx = this.bufferCtx;

        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineWidth = series.lineWidth;
        // global alpha 보다 rgba 가 성능이 더 좋음
        var seriesFillStyle = series.fill == null ? '' : 'rgba(' + this.hexToRgb(series.color || this.options.colors[seriesIndex]) + ',' + (series.fill) + ')';

        if (series.fill != null) {
            ctx.fillStyle = seriesFillStyle;
        }

        ctx.lineWidth = series.overLineWidth == null ? series.lineWidth : series.overLineWidth;
        ctx.strokeStyle = color;

        var ix, ixLen, jx, jxLen;

        // 포인트 찍기
        var pointOption = this.options.series.point,
            anomalySeries = series,
            targetSeries, targetBandSeries, bandSeries;

        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            if (this.serieseList[ix].type == 'band' && this.serieseList[ix].lineContinueID === undefined) {
                bandSeries = this.serieseList[ix];
            }
        }

        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            if (this.serieseList[ix].type == 'target' && this.serieseList[ix].visible) {
                targetSeries = this.serieseList[ix];
            }

            if (this.serieseList[ix].type == 'band' && this.serieseList[ix].visible && this.serieseList[ix].lineContinueID !== undefined) {
                targetBandSeries = this.serieseList[ix];
            }

            if (targetSeries) {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.fillStyle = 'transparent';
                ctx.lineWidth = 1;
                for (jx = 0, jxLen = targetSeries.yPoint.length; jx < jxLen; jx++) {
                    if (anomalySeries.data[jx][1] && anomalySeries.data[jx][1] === 'true' && targetSeries.data[jx][1] !== null) {
                        anomalySeries.yPoint[jx] = targetSeries.yPoint[jx];
                        ctx.moveTo(xPoint[jx], anomalySeries.yPoint[jx]);
                        ctx.arc(xPoint[jx], anomalySeries.yPoint[jx], pointOption.radius, 0 , Math.PI * 2);
                    }

                    if (anomalySeries.data[jx][1] === null && targetSeries.data[jx][1] !== null && bandSeries) {
                        if ((bandSeries.data[jx][1][0] > targetSeries.data[jx][1] || bandSeries.data[jx][1][1] < targetSeries.data[jx][1])) {
                            anomalySeries.yPoint[jx] = targetSeries.yPoint[jx];
                            ctx.moveTo(xPoint[jx], anomalySeries.yPoint[jx]);
                            ctx.arc(xPoint[jx], anomalySeries.yPoint[jx], pointOption.radius, 0 , Math.PI * 2);
                        }
                    }
                }
                ctx.stroke();
                ctx.fill();
            }

            var upperBand, lowerBand, upperTarget, lowerTarget;
            if (targetBandSeries) {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.fillStyle = 'transparent';
                ctx.lineWidth = 1;

                for (jx = 0, jxLen = targetBandSeries.yPoint.length; jx < jxLen; jx++) {
                    if (anomalySeries.data[jx][1] === null && targetBandSeries.data[jx][1][0] !== null && bandSeries) {
                        lowerBand = bandSeries.data[jx][1][0];
                        upperBand = bandSeries.data[jx][1][1];
                        lowerTarget = targetBandSeries.data[jx][1][0];
                        upperTarget = targetBandSeries.data[jx][1][1];

                        if (upperBand < lowerTarget) {
                            anomalySeries.yPoint[jx] = targetBandSeries.yPoint[jx][0];
                            ctx.moveTo(xPoint[jx], anomalySeries.yPoint[jx]);
                            ctx.arc(xPoint[jx], anomalySeries.yPoint[jx], pointOption.radius, 0 , Math.PI * 2);
                        }

                        if (lowerBand > upperTarget) {
                            anomalySeries.yPoint[jx] = targetBandSeries.yPoint[jx][1];
                            ctx.moveTo(xPoint[jx], anomalySeries.yPoint[jx]);
                            ctx.arc(xPoint[jx], anomalySeries.yPoint[jx], pointOption.radius, 0 , Math.PI * 2);
                        }
                    }
                }
                ctx.stroke();
                ctx.fill();
            }

        }
    };

    /**
     *
     * @param seriesIndex{number}
     */
    XMAiChart.prototype.drawBand = function(seriesIndex) {
        if (this.serieseList[seriesIndex] == null || ! this.serieseList[seriesIndex].visible) {
            return;
        }

        var series = this.serieseList[seriesIndex];
        var data = null;
        var xPoint = this.offset.xaxis.point;
        var yPoint = series.yPoint;
        var pointOption = this.options.series.point;

        var color = series.color || this.options.colors[seriesIndex];
        var ctx = this.bufferCtx;

        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineWidth = series.lineWidth;
        // global alpha 보다 rgba 가 성능이 더 좋음
        var seriesFillStyle = series.fill == null ? '' : 'rgba(' + this.hexToRgb(series.color || this.options.colors[seriesIndex]) + ',' + (series.fill) + ')';

        if (series.fill != null) {
            ctx.fillStyle = seriesFillStyle;
        }

        ctx.lineWidth = series.overLineWidth == null ? series.lineWidth : series.overLineWidth;
        ctx.strokeStyle = color;

        var x = null;
        var y = null;
        var ix, ixLen, jx, jxLen;
        var prevData, prevLowerData, prevUpperData, lowerData, upperData, lastY, bandCheckLine;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = series.fillColor || pointOption.fillColor || '#fff';
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = pointOption.lineWidth;

        if (series.lineContinueID !== undefined) {
            for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
                if (series.lineContinueID == this.serieseList[ix].id) {
                    for (jx = 0, jxLen = this.serieseList[ix].data.length; jx < jxLen; jx++) {
                        if (this.serieseList[ix].data[jx][1] !== null) {
                            lastY = this.serieseList[ix].data[jx][1];
                        }
                    }
                }
            }
        }

        if (series.data.length === 120) {
            bandCheckLine = 89;
        } else if (series.data.length === 72) {
            bandCheckLine = 65;
        }

        for (ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
            data = series.data[ix];
            lowerData = data[1][0];
            upperData = data[1][1];

            prevData = series.data[ix - 1];
            if (prevData) {
                prevLowerData = prevData[1][0];
                prevUpperData = prevData[1][1];
            }

            x = xPoint[ix];
            y = this.calculateY(upperData);
            yPoint[ix] = [this.calculateY(lowerData), y];

            if (series.predict) {
                // 현재값 마지막 데이터.
                if (ix === bandCheckLine) {
                    ctx.moveTo(x, this.calculateY(lastY));
                } else {
                    if (data && data[1] && (data[1][0] || data[1][0] === 0) && (data[1][1] || data[1][1] === 0)) {
                        if (!this.calculateY(lowerData)) {
                            ctx.moveTo(x, y);
                        }

                        ctx.lineTo(x, y);
                    }
                }
            } else {
                if (y) {
                    if (prevData && !this.calculateY(prevUpperData)) {
                        if (series.lineContinueID !== undefined) {
                            ctx.moveTo(xPoint[ix - 1], this.calculateY(lastY));
                        } else {
                            ctx.moveTo(x, y);
                        }
                    }
                    ctx.lineTo(x, y);
                } else {
                    if (prevData && this.calculateY(prevLowerData)) {
                        ctx.lineTo(xPoint[ix - 1], this.calculateY(prevLowerData));
                    }

                    ctx.moveTo(x, y);
                }
            }

            if (ix === +series.data.length - 1) {
                jx = ix;
                for (jxLen = 0; jx >= jxLen; jx--) {
                    data = series.data[jx];
                    lowerData = data[1][0];
                    upperData = data[1][1];

                    prevData = series.data[jx + 1];
                    if (prevData) {
                        prevLowerData = prevData[1][0];
                        prevUpperData = prevData[1][1];
                    }

                    x = xPoint[jx];
                    y = this.calculateY(lowerData);

                    if (series.predict) {
                        // 현재값 마지막 데이터.
                        if (jx === bandCheckLine) {
                            ctx.lineTo(x, this.calculateY(lastY));
                        } else {
                            if (data && data[1] && (data[1][0] || data[1][0] === 0) && (data[1][1] || data[1][1] === 0)) {
                                if (!this.calculateY(upperData)) {
                                    ctx.moveTo(x, y);
                                }
                                ctx.lineTo(x, y);
                            }
                        }
                    } else {
                        if (y) {
                            if (prevData && !this.calculateY(prevLowerData)) {
                                ctx.moveTo(x, y);
                            }

                            ctx.lineTo(x, y);

                            if (jx === 0) {
                                ctx.lineTo(x, this.calculateY(upperData));
                            }
                        } else {
                            if (prevData && this.calculateY(prevUpperData)) {
                                if (series.lineContinueID !== undefined) {
                                    ctx.moveTo(xPoint[ix - 1], this.calculateY(lastY));
                                } else {
                                    ctx.lineTo(xPoint[jx + 1], this.calculateY(prevUpperData));
                                }
                            }

                            ctx.moveTo(x, y);
                        }
                    }
                }
            }
        }
        ctx.stroke();
        ctx.fill();

        ctx.globalAlpha = 1;
    };

    /**
     *
     * @param seriesIndex{number}
     */
    XMAiChart.prototype.drawSeries = function(seriesIndex) {
        if (this.serieseList[seriesIndex] == null || ! this.serieseList[seriesIndex].visible) {
            return;
        }

        var series = this.serieseList[seriesIndex];
        var data = null;
        var yOffset = this.offset.yaxis;
        var yPoint = series.yPoint;
        var xPoint = this.offset.xaxis.point;
        var pointOption = this.options.series.point;

        var color = series.color || this.options.colors[seriesIndex];
        var ctx = this.bufferCtx;

        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineWidth = series.lineWidth;
        // global alpha 보다 rgba 가 성능이 더 좋음
        var seriesFillStyle = series.fill == null ? '' : 'rgba(' + this.hexToRgb(series.color || this.options.colors[seriesIndex]) + ',' + (series.fill) + ')';

        if (series.fill != null) {
            ctx.fillStyle = seriesFillStyle;
        }

        ctx.lineWidth = series.overLineWidth == null ? series.lineWidth : series.overLineWidth;
        ctx.strokeStyle = color;

        var startFillIndex = 0;
        var x, y, lastY;
        var ix, ixLen, jx, jxLen;

        if (series.lineContinueID !== undefined) {
            for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
                if (series.lineContinueID == this.serieseList[ix].id) {
                    for (jx = 0, jxLen = this.serieseList[ix].data.length; jx < jxLen; jx++) {
                        if (this.serieseList[ix].data[jx][1] !== null) {
                            lastY = this.serieseList[ix].data[jx][1];
                        }
                    }
                }
            }
        }

        for (ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
            data = series.data[ix];
            x = xPoint[ix];
            y = this.calculateY(data[1]);
            yPoint[ix] = y;

            if (series.predict) {
                // 현재값 마지막 데이터.
                if (ix === 89 || ix === 65) {
                    ctx.moveTo(x, this.calculateY(lastY));
                } else {
                    if (data && data[1] !== null) {
                        ctx.setLineDash([4,3]);
                        ctx.lineTo(x, y);
                    }
                }
            } else {
                // 데이터 Y 값이 null인 경우
                if (data[1] == null) {
                    yPoint[ix] = null;
                    //moveFlag = true;

                    if (ix - 1 >= 0) {

                        if (series.fill != null && series.data[ix - 1] != null && series.data[ix - 1][1] != null) {
                            ctx.stroke();

                            ctx.fillStyle = seriesFillStyle;
                            ctx.lineTo(xPoint[ ix - 1 ], yOffset.endPoint);
                            ctx.lineTo(xPoint[ startFillIndex ], yOffset.endPoint);
                            ctx.lineTo(xPoint[ startFillIndex ], yPoint[ startFillIndex ]);

                            ctx.fill();
                            ctx.beginPath();
                        }
                    }

                    startFillIndex = ix + 1;
                } else {
                    if (series.line) {
                        if (ix === 0) {
                            ctx.moveTo(x, y);
                        } else if (series.data[ix - 1] == null || series.data[ix - 1][1] == null) {
                            if (series.lineContinueID !== undefined) {
                                ctx.moveTo(xPoint[ix - 1], this.calculateY(lastY));
                            } else {
                                ctx.moveTo(x, y);
                            }
                        } else {
                            ctx.lineTo(x, y);
                        }
                    } else {
                        if (ix === 0 || series.data[ix - 1] == null || series.data[ix - 1][1] == null) {
                            ctx.moveTo(x, y);
                        }
                    }
                }
            }
        }
        ctx.stroke();
        ctx.setLineDash([0,0]);

        if (series.fill != null && series.data[ix - 1] != null && series.data[ix - 1][1] != null) {
            ctx.stroke();

            ctx.fillStyle = seriesFillStyle;
            ctx.lineTo(xPoint[ ix - 1 ], yOffset.endPoint);
            ctx.lineTo(xPoint[ startFillIndex ], yOffset.endPoint);
            ctx.lineTo(xPoint[ startFillIndex ], yPoint[ startFillIndex ]);
            ctx.fill();
        }

        // 포인트 효과를 마지막에 다시 그리는 이유는 마지막에 그려야 겹쳐 다른 그림과 겹치지 않기 위해서입니다.
        if (series.point || this.options.series.point.show) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.fillStyle = series.fillColor || pointOption.fillColor || '#fff';
            ctx.lineWidth = pointOption.lineWidth;
            for (ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
                if (xPoint[ix] != null && yPoint[ix] != null) {
                    ctx.moveTo(xPoint[ix], yPoint[ix]);
                    ctx.arc(xPoint[ix], yPoint[ix], pointOption.radius, 0 , Math.PI * 2);
                }
            }
            ctx.stroke();
            ctx.fill();
        }
    };

    /**
     *
     * @param param{obejct}
     */
    XMAiChart.prototype.addSeries = function(param) {
        var series = {
            id			: param.id,
            color		: param.color,
            label		: param.label,
            min			: null,
            minIndex	: null,
            max			: null,
            maxIndex	: null,
            seriesIndex : this.serieseList.length,
            //data		: (this.dataBufferSize == null ? new Array() : new Array(this.dataBufferSize)),
            data		: new Array(),
            visible		: param.visible == null ? true : param.visible,
            lineWidth	: param.lineWidth == null ? 2 : param.lineWidth,
            line		: param.line == null ? true : param.line,
            fill		: param.fill,
            fillColor	: param.fillColor,
            type    	: param.type,
            predict    	: param.predict,
            lineContinueID: param.lineContinueID,
            point		: param.point,
            toolTip		: {},
            yPoint		: new Array(),

            cls         : param.cls,

            insertIndex : -1,
            dataIndex   : 0,
            startPoint  : 0
        };

        this.serieseList.push(series);

        if (this.options.tooltip.show) {
            this.toolTip.addSeries(series);
        }

        if (this.showLegend) {
            this.legendLayer.addSeries(series);
        }

        param = null;
        series = null;
    };

    XMAiChart.prototype.toFixed = function(number, point) {
        if (number == null) {
            return null;
        }

        if (Array.isArray(number)) {
            return toFixed(number[0]) + ' ~ ' + toFixed(number[1]);
        } else {
            return toFixed(number);
        }

        function toFixed(num) {
            var temp = (+num).toFixed(point);
            var dotPos = temp.indexOf('.');
            var integer = null;

            if (dotPos == -1) {
                integer = temp;
                return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {
                integer = temp.substring(0, dotPos);
                return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + temp.substring(dotPos, temp.length);
            }
        }

    };

    XMAiChart.prototype.calculateYRange = function() {
        var yaxis = this.options.yaxis;
        var padding = this.options.grid.padding;
        var startPoint = +yaxis.labelStyle.fontSize + padding;
        var endPoint = this.height - (yaxis.labelStyle.fontSize * 1.5) - 5 - padding; // -5 to pad labels

        var drawYRange = endPoint - startPoint;

        var minSteps = 2;
        var maxSteps = Math.floor(drawYRange / (yaxis.labelStyle.fontSize * 1.5));
        var skipFitting = (minSteps >= maxSteps);

        var maxValue = this.options.yaxis.max == null ? this.getYMaxValue().y : this.options.yaxis.max;
        if (this.options.yaxis.max == null && this.options.yaxis.autoscaleRatio != null) {
            maxValue *= (this.options.yaxis.autoscaleRatio + 1);
        }

        if (maxValue < 0.01) {
            maxValue = 0.01;
        } else if (maxValue < 0.1) {
            maxValue = 0.1;
        } else if (maxValue < 1) {
            maxValue = 1;
        }
        var minValue = this.options.yaxis.min == null ? this.getYMinValue().y : this.options.yaxis.min;
        var startFromZero = true;
        var integersOnly = true;

        if (maxValue === minValue) {
            maxValue += 0.5;
            // So we don't end up with a graph with a negative start value if we've said always start from zero
            if (minValue >= 0.5 && !startFromZero) {
                minValue -= 0.5;
            } else {
                // Make up a whole number above the values
                maxValue += 0.5;
            }
        }

        var	valueRange = Math.abs(maxValue - minValue),
            rangeMagnitude = this.calculateMagnitude(valueRange),
            graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeMagnitude))) * Math.pow(10, rangeMagnitude),
            graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeMagnitude))) * Math.pow(10, rangeMagnitude),
            graphRange = graphMax - graphMin,
            stepValue = Math.pow(10, rangeMagnitude),
            numberOfSteps = Math.round(graphRange / stepValue);

        if (maxValue == 0.01) {
            stepValue = 0.002;
            numberOfSteps = 5;
        } else if (maxValue == 0.1) {
            stepValue = 0.02;
            numberOfSteps = 5;
        } else if (maxValue == 1) {
            stepValue = 0.2;
            numberOfSteps = 5;
        }

        //If we have more space on the graph we'll use it to give more definition to the data
        while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
            if (numberOfSteps > maxSteps) {
                stepValue *= 2;
                numberOfSteps = Math.round(graphRange / stepValue);
                // Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
                if (numberOfSteps % 1 !== 0) {
                    skipFitting = true;
                }
            } else {
                //We can fit in double the amount of scale points on the scale
                //If user has declared ints only, and the step value isn't a decimal
                //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
                if (stepValue / 2 % 1 === 0) {
                    stepValue /= 2;
                    numberOfSteps = Math.round(graphRange / stepValue);
                } else {
                    //If it would make it a float break out of the loop
                    break;
                }
                // if (integersOnly && rangeMagnitude >= 0) {
                //     if (stepValue / 2 % 1 === 0) {
                //         stepValue /= 2;
                //         numberOfSteps = Math.round(graphRange / stepValue);
                //     } else {
                //         //If it would make it a float break out of the loop
                //         break;
                //     }
                // } else {
                //     //If the scale doesn't have to be an int, make the scale more granular anyway.
                //     stepValue /= 2;
                //     numberOfSteps = Math.round(graphRange / stepValue);
                // }
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
        this.offset.yaxis.max = Math.round((graphMin + (numberOfSteps * stepValue)) * 1000) / 1000;
        this.offset.yaxis.startPoint = startPoint;
        this.offset.yaxis.endPoint = endPoint;

        this.offset.grid.y = startPoint;
        this.offset.grid.y2 = endPoint;

        this.setGridOffset();

        yaxis = null;
    };

    //////////////////////////////////////////////////// UTIL ////////////////////////////////////////////////////
    XM.cls['XMAiChart'] = XMAiChart;
})(window.EXEM);
