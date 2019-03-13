(function(XM) {
    /**
     * @note XMCanvas 상속.
     * @param arg
     * @constructor
     */
    var XMLineChart = function(arg){
        if(arg){
            if(! this.initProperty(arg)){
                return ;
            }

            this.init();
        }
    };

    // 상속
    XMLineChart.prototype = XM.cls.create('XMCanvas');

    /**
     * @note XMLineChart property 설정
     *  ** target 인자는 센차 object 입니다. **
     *
     * @param arg{object}
     */
    XMLineChart.prototype.initProperty = function(arg){
        this.target = null;																			// 차트가 생성될 레이어

        this.showTitle = false;
        this.firstShowTitle = true;
        this.title = '';
        this.titleHeight = 40;
        this.titleClass = '';

        this.showLegend = false;
        this.firstShowLegend = true;												// 처음 레전드 영역 생성 시 차트 영역의 resize 이벤트가 타지 않기 위한 플래그 , true | false
        this.showLegendResizeBar = true;
        this.legendWidth = 120;

        this.toFixedNumber = 3;
        this.dataBufferSize = 30;

        this.showLastValueToolTip = false;
        this.lastValueSeriesIndex = 0;								// 툴립을 그릴 기준 시리즈 인덱스

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

        for(var key in arg){
            this[key] = arg[key];
        }

        if(! this.target){
            console.debug('XMLineChart : Can not find the target.');
            return false;
        }

        this.serieseList = [];

        this.offset = {
            grid: {
                x: null,
                x2 : null,
                y: null,
                y2: null,
                width: null,
                height: null
            },
            xaxis: {
                steps 		: null,
                labelWidth	: null,
                point		: null
            },
            yaxis: {
                steps		: null,
                stepValue	: null,
                min			: null,
                max			: null,
                startPoint  : null,
                endPoint    : null,
                labelWidth	: null,
                point		: null
            }
        };

        this.maxValueInfo = {
            x			: null,
            y			: null,
            index		: null,
            seriesIndex : null
        };
        this.minValueInfo = {
            x			: null,
            y			: null,
            index		: null,
            seriesIndex : null
        };

        this.initOption();

        this.offset.xaxis.point = [];
        ///this.offset.yaxis.point = new Array(this.dataBufferSize);

        this.overlayCanvas.style.position = 'absolute';
        this.overlayCanvas.style.top = '0px';
        this.overlayCanvas.style.left = '0px';

        this.target.addListener('resize', this.resize, this);
        this.target.addListener('destroy', this.destroy, this);

        return true;
    };

    XMLineChart.prototype.initOption = function(){
        this.options = {
            colors: ['#2b99f0', '#8ac449', '#009697', '#959c2c', '#004ae7', '#01cc00','#15679a', '#43bcd7', '#e76627', '#5C8558', '#A8A5A3', '#498700', '#832C2D', '#C98C5A', '#3478BE',"#BCF061", "#B26600", "#27358F", "#A4534D", "#B89630", '#A865B4', '#254763', '#536859', '#E9F378', '#888A79', '#D67D4B', '#2BEC69' ,'#4A2BEC', '#2BBEEC', '#DDACDF'],
            xaxis: {
                show	: true,
                mode	: null,
                min		: 0,
                max		: null,
                autoscaleRatio : null,
                ticks	: null,
                tickLength : null,
                tickDecimals: null,
                tickInterval: null,
                labelHeight: 20,
                labelStyle  : {
                    fontSize: 13,
                    color: '#333',
                    fontFamily: 'normal'
                }
            },
            yaxis: {
                show	: true,
                mode	: null,
                min		: 0,
                minIndex: null,
                max		: null,
                maxIndex: null,
                autoscaleRatio : null,		// 0 ~ 1
                ticks	: null,
                tickLength : null,
                tickDecimals : null,
                scale   : 0,
                labelWidth	: null,			// null : auto scale, number : fixed,
                labelStyle  : {
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
                padding: 0,
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
                    fill : true,
                    fillColor: null,
                    radius: 3
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
                width : 4,
                color : null
            },
            maxValueTip: {
                show: true,
                fix : false
            },
            selection: {
                show: false,
                mode: "xy",
                color : '#349BE7'
            }
        };

        if(this.chartProperty){
            this.setOption(this.options, this.chartProperty);
        }
    };

    XMLineChart.prototype.setOption = function(root, obj){
        var keys = Object.keys(obj);

        for(var ix = 0, ixLen = keys.length; ix < ixLen; ix++){
            if(typeof obj[keys[ix]] === 'object'){
                if(root[ keys[ix] ]){
                    this.setOption(root[ keys[ix] ], obj[keys[ix]], keys[ix]);
                }
            }else{
                root[ keys[ix] ] = obj[keys[ix]];
            }
        }
    };

    XMLineChart.prototype.init = function(arg){

        if(this.showTitle){
            this.createTitle();
        }

        if(this.showLegend){
            this.createLegend();
        }

        if(this.options.tooltip.show){
            this.createMultiTooltip();
        }

        if(this.options.maxValueTip.show){
            this.createMaxValueTip();
        }

        if(this.showLastValueToolTip){
            this.craeteLastValueToolTip();
        }

        //if(this.showTitle || this.showLegend || this.container.parentElement != null){
        //	var offset = this.chartContainer.getClientRects()[0];
        //	if(offset){
        //		this.resize(null, offset.width, offset.height);
        //	}
        //}

        if(this.target.getEl()){
            this.targetEl = this.target.el.dom;
            this.targetEl.appendChild(this.container);

            this.width = this.chartContainer.offsetWidth || this.initWidth;
            this.height = this.chartContainer.offsetHeight || this.initHeight;
            this.setWidth(this.width);
            this.setHeight(this.height);
            this.bindEvent();
        }else{
            this.target.addListener('render', function(){
                this.targetEl = this.target.el.dom;
                this.targetEl.appendChild(this.container);

                this.width = this.chartContainer.offsetWidth || this.initWidth;
                this.height = this.chartContainer.offsetHeight || this.initHeight;
                this.setWidth(this.width);
                this.setHeight(this.height);
                this.bindEvent();
            }, this);
        }

        this.initScale();
    };

    XMLineChart.prototype.createTitle = function(){
        this.titleLayer = {
            container: document.createElement('div'),
            setTitle: function(title){
                this.titleLayer.container.textContent = title;
            }.bind(this),
            getTitle: function(){
                return this.titleLayer.container.textContent;
            }.bind(this),
            show: function(){
                this.titleLayer.container.style.display = 'block';
                this.container.style.paddingTop = this.titleHeight + 'px';
                this.resize();
            }.bind(this),
            hide: function(){
                this.titleLayer.container.style.display = 'none';
                this.container.style.paddingTop = '0px';
                this.resize();
            }.bind(this)
        };

        this.titleLayer.setTitle(this.title);
        if(! this.firstShowTitle){
            this.titleLayer.container.style.display = 'none';
        }else{
            this.container.style.paddingTop = this.titleHeight + 'px';
        }
        this.titleLayer.container.className = 'XMLineChart-title ' + this.titleClass;
        this.titleLayer.container.style.height = this.titleHeight + 'px';

        if(this.titleClickEvent){
            this.titleLayer.container.addEventListener('click', this.titleClickEvent, false);
        }

        this.container.appendChild(this.titleLayer.container);

    };

    XMLineChart.prototype.createLegend = function(){
        this.legendLayer = {
            container: document.createElement('div'),
            resizeBar: document.createElement('div'),
            show: function(){
                this.legendLayer.container.style.display = 'block';
                this.container.style.paddingRight = this.legendWidth + 'px';
                this.resize();
            }.bind(this),
            hide: function(){
                this.legendLayer.container.style.display = 'none';
                this.container.style.paddingRight = '0px';
                this.resize();
            }.bind(this),
            addSeries: function(series) {
                var legend = {
                    container 	: document.createElement('div'),
                    colorEl		: document.createElement('span'),
                    nameEl		: document.createElement('span'),
                    valueEl		: document.createElement('span')
                };

                legend.container.className = 'XMLineChart-legend-container';
                if (!series.visible) {
                    legend.container.style.display = 'none';
                }
                legend.colorEl.className = 'XMLineChart-legend-color';
                legend.nameEl.className = 'XMLineChart-legend-name';
                legend.valueEl.className = 'XMLineChart-legend-value';

                legend.colorEl.style.backgroundColor = series.color || this.options.colors[series.seriesIndex];
                this.options.xaxis.labelStyle.color
                if (this.legendColorClick) {
                    legend.colorEl.dataset.seriesIndex = series.seriesIndex;
                    legend.colorEl.dataset.check = 1;
                    legend.colorEl.onclick = this.legendColorClick.bind(this);
                }

                legend.nameEl.textContent = series.label || series.id;
                legend.nameEl.setAttribute('title', series.label || series.id);
                legend.nameEl.style.color = this.options.xaxis.labelStyle.color;
                if (this.legendNameHighLight) {
                    legend.nameEl.dataset.seriesIndex = series.seriesIndex;
                    if (this.legendNameMouseEnter) {
                        legend.nameEl.onmouseenter = this.legendNameMouseEnter.bind(this);
                    }
                    if (this.legendNameMouseLeave) {
                        legend.nameEl.onmouseleave = this.legendNameMouseLeave.bind(this);
                    }
                }

                legend.container.appendChild(legend.colorEl);
                legend.container.appendChild(legend.nameEl);
                legend.container.appendChild(legend.valueEl);

                series.labelObj = legend;

                this.legendLayer.container.appendChild(legend.container);
            }.bind(this),
            setLegendValue: function(index, value) {
                var series = this.getSeries(index);

                if (series && series.labelObj && series.labelObj.valueEl) {
                    series.labelObj.valueEl.textContent = this.toFixed(value, this.toFixedNumber);
                    series.labelObj.valueEl.setAttribute('title', value);
                }

                series = null;
            }.bind(this),
            showIndex: function(index) {
                var legendArr = this.legendLayer.container.getElementsByClassName('XMLineChart-legend-container'),
                    legend, ix, ixLen;

                for (ix = 0, ixLen = legendArr.length; ix < ixLen; ix++) {
                    legend = legendArr[ix];
                    if (+legend.getElementsByClassName('XMLineChart-legend-color')[0].getAttribute('data-series-index') === index) {
                        legend.style.display = '';
                    }
                }
            }.bind(this),
            hideIndex: function(index) {
                var legendArr = this.legendLayer.container.getElementsByClassName('XMLineChart-legend-container'),
                    legend, ix, ixLen;

                for (ix = 0, ixLen = legendArr.length; ix < ixLen; ix++) {
                    legend = legendArr[ix];
                    if (+legend.getElementsByClassName('XMLineChart-legend-color')[0].getAttribute('data-series-index') === index) {
                        legend.style.display = 'none';
                    }
                }
            }.bind(this)
        };

        this.legendLayer.container.className = 'XMLineChart-legend';
        this.legendLayer.container.style.width = this.legendWidth + 'px';
        if (!this.firstShowLegend) {
            this.legendLayer.container.style.display = 'none';
        } else {
            this.container.style.paddingRight = this.legendWidth + 'px';
        }
        if (this.showLegendResizeBar) {
            this.legendLayer.container.appendChild(this.legendLayer.resizeBar);
        }

        this.legendLayer.resizeBar.className = 'XM-resize-h-bar';

        var resize = document.createElement('div');
        var self = this;
        this.legendLayer.resizeBar.onmousedown = function() {
            //var resize = document.createElement('div');
            resize.className = 'XM-resizer';
            self.container.appendChild(resize);
            self.container.dataset.left = 0;

            document.documentElement.addEventListener('mousemove', resizeMouseMove, false);
            document.documentElement.addEventListener('mouseup', resizeMouseUp, false);
        };
        function resizeMouseMove(e){
            var offset = self.container.getClientRects()[0];
            var left = e.clientX - offset.left;
            if (left < 200) {
                left = 200;
            }
            resize.style.left = left + 'px';
        }
        function resizeMouseUp() {
            document.documentElement.removeEventListener('mousemove', resizeMouseMove, false);
            document.documentElement.removeEventListener('mouseup', resizeMouseUp, false);

            self.chartContainer.style.width = resize.style.left;
            var width = resize.style.left.replace('px', '');
            //self.resize(null, +width, self.height);
            self.resize();
            self.legendLayer.container.style.width = (self.container.offsetWidth - width) + 'px';
            self.container.style.rightPadding = self.legendLayer.container.style.width;
            resize.remove();
        }

        this.container.appendChild(this.legendLayer.container);

    };

    XMLineChart.prototype.bindEvent = function(){
        //this.chartContainer.onresize = this.resize;
        this.chartContainer.addEventListener('resize', this.resize.bind(this), false);
        this.chartContainer.addEventListener('mouseleave', function(){
            if(this.options.tooltip.show){
                this.toolTip.hide();
            }
            if(this.options.maxValueTip.show && !this.options.maxValueTip.fix){
                this.maxValueTip.hide();
            }
            if(this.options.crosshair.show){
                this.overlayClear();
            }
        }.bind(this), false);

        if(this.options.tooltip.show){
            this.overlayCanvas.onmousemove  = this.mousemoveEvent.bind(this);
            this.overlayCanvas.onmouseout   = this.mouseoutEvent.bind(this);
            this.overlayCanvas.onmousewheel = this.mousewheel.bind(this);
            this.overlayCanvas.onclick      = this.onclick.bind(this);
        }

        if(this.options.selection.show){
            this.selection = {
                first: { x: -1, y: -1},
                second: { x: -1, y: -1},
                show: false,
                active: false,
                isDrawing: false
            };

            this.overlayCanvas.onmousedown = this.mousedownEvent.bind(this);
            //this.overlayCanvas.onmouseup = this.mouseupEvent.bind(this);
        }
    };

    XMLineChart.prototype.unBindEvent = function(){

    };

    XMLineChart.prototype.createMaxValueTip = function(){

        this.maxValueTip = {
            container 	: document.createElement('div'),
            text 	: document.createElement('span'),
            tail	 	: document.createElement('div'),
            show 		: function(){
                if (this.maxValueInfo.y == null || this.maxValueInfo.seriesIndex == null || this.container.parentElement == null) {
                    return;
                }

                var series = this.serieseList[ this.maxValueInfo.seriesIndex ];

                if (!series.visible) {
                    this.maxValueTip.hide();
                    return;
                }

                var color = series.color || this.options.colors[this.maxValueInfo.seriesIndex];

                this.maxValueTip.text.textContent = this.toFixed(this.maxValueInfo.y, this.toFixedNumber);
                this.maxValueTip.container.style.background = color;
                this.maxValueTip.container.style.top = (series.yPoint[this.maxValueInfo.index] - 25) + 'px';

                if (series.yPoint[this.maxValueInfo.index] == null) {
                    this.maxValueTip.container.style.top = this.calculateY(0) - 25 + 'px';
                }

                var x = this.offset.xaxis.point[this.maxValueInfo.index];

                this.maxValueTip.container.style.display = 'block';

                var width;
                // 툴팁 개체가 없거나 찾이 못하는 경우 툴팁 표시 처리가 되지 않게 예외 조건을 추가
                if (this.initType == 'grid') {
                    width = 43.21875;
                } else if (this.maxValueTip.container.getClientRects().length === 0) {
                    return;
                } else {
                    width = this.maxValueTip.container.getClientRects()[0].width;
                }

                // 왼쪽
                if(this.valuesCount / 3  > this.maxValueInfo.index){
                    this.maxValueTip.tail.style.borderLeft = '4px solid ' + color;
                    this.maxValueTip.tail.style.borderRight = '4px solid transparent';
                    this.maxValueTip.tail.style.borderTop = '4px solid ' + color;
                    this.maxValueTip.tail.style.borderBottom = '4px solid transparent';
                    this.maxValueTip.tail.style.top = '13px';
                    this.maxValueTip.tail.style.left = '0px';
                    this.maxValueTip.tail.style.right = '';
                    this.maxValueTip.container.style.left = this.offset.xaxis.point[this.maxValueInfo.index] + 'px';
                }
                // 오른쪽
                else if(this.valuesCount / 3 * 2  < this.maxValueInfo.index){
                    this.maxValueTip.tail.style.borderLeft = '4px solid transparent';
                    this.maxValueTip.tail.style.borderRight = '4px solid ' + color;
                    this.maxValueTip.tail.style.borderTop = '4px solid ' + color;
                    this.maxValueTip.tail.style.borderBottom = '4px solid transparent';
                    this.maxValueTip.tail.style.top = '13px';
                    this.maxValueTip.tail.style.left = '';
                    this.maxValueTip.tail.style.right = '0px';
                    this.maxValueTip.container.style.left = (this.offset.xaxis.point[this.maxValueInfo.index] - (width)) + 'px';
                }
                // 중앙
                else{
                    this.maxValueTip.tail.style.borderLeft = '4px solid transparent';
                    this.maxValueTip.tail.style.borderRight = '4px solid transparent';
                    this.maxValueTip.tail.style.borderTop = '4px solid ' + color;
                    this.maxValueTip.tail.style.borderBottom = '4px solid transparent';
                    this.maxValueTip.tail.style.top = '15px';
                    this.maxValueTip.tail.style.left = (width / 2 - 3) + 'px';
                    this.maxValueTip.tail.style.right = '0px';
                    this.maxValueTip.container.style.left = (this.offset.xaxis.point[this.maxValueInfo.index] - (width / 2)) + 'px';
                }
            }.bind(this),
            hide		: function(){
                this.maxValueTip.container.style.display = 'none';
            }.bind(this),
            destroy: function(){
                this.maxValueTip.container.remove();
            }.bind(this)
        };

        this.maxValueTip.container.setAttribute('style', 'position: absolute;height: 15px;border-radius: 4px;line-height: 14px;color:#fff;padding: 0px 15px;text-align: center;z-index: 2;display:none;');
        this.maxValueTip.tail.setAttribute('style', '    position: absolute;width: 0px;height: 0px;top: 15px;border-style: solid;');

        this.maxValueTip.container.appendChild(this.maxValueTip.text);
        this.maxValueTip.container.appendChild(this.maxValueTip.tail);
        this.chartContainer.appendChild(this.maxValueTip.container);
    };

    XMLineChart.prototype.createMultiTooltip = function(){
        this.toolTip = {
            container 	: document.createElement('div'),
            title	 	: document.createElement('div'),
            name 		: document.createElement('div'),
            value		: document.createElement('div'),
            show		: function(index, offset, e){
                if(index != null && offset != null){
                    var series = null;

                    var xMaxInfo = this.getXMaxValue();
                    var standardSeries = this.serieseList[xMaxInfo.seriesIndex];

                    // 기준 시리즈에 데이터가 없으면
                    if(!standardSeries || standardSeries.data[index] == null){
                        return;
                    }

                    if (this.options.xaxis.tickInterval) {
                        if (window.rtmMonitorType === 'CD') {
                            this.toolTip.title.textContent = this.toolTipFormat(Repository.CDTrendData.timeRecordData[index]);

                        } else if (window.rtmMonitorType ===  'E2E' && Comm.rtmBizShow) {
                            this.toolTip.title.textContent = this.toolTipFormat(Repository.BizTrendData.timeRecordData[index]);

                        } else {
                            this.toolTip.title.textContent = this.toolTipFormat(Repository.trendChartData.timeRecordData[index]);
                        }
                    } else {
                        this.toolTip.title.textContent = this.toolTipFormat(standardSeries.data[index][0]);
                    }


                    for (var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
                        series = this.serieseList[ix];

                        if (series.visible && series.data[index] && series.data[index][1] != null && series.type != 'anomaly') {
                            series.toolTip.value.textContent = this.toFixed(series.data[index][1], series.toFixedNumber == null ? this.toFixedNumber : series.toFixedNumber);

                            series.toolTip.name.style.display = 'block';
                            series.toolTip.value.style.display = 'block';
                        } else {
                            series.toolTip.name.style.display = 'none';
                            series.toolTip.value.style.display = 'none';
                        }
                    }


                    this.toolTip.container.style.display = 'block';
                    var containerRect = this.toolTip.container.getClientRects()[0];
                    // 왼쪽
                    if (this.valuesCount / 2  > index) {
                        //this.toolTip.container.style.left = (offset[0] + 10) + 'px';
                        //this.toolTip.container.style.left = ( e.x + 10 )+ 'px';

                        if (e.x + containerRect.width + 50 > window.innerWidth) {
                            this.toolTip.container.style.left = (e.x - containerRect.width - 10) + 'px';
                        } else {
                            this.toolTip.container.style.left = (e.x + 10) + 'px';
                        }
                    }
                    // 오른쪽
                    else {
                        //this.toolTip.container.style.left = (e.x - containerRect.width - 10) + 'px';

                        if (e.x  < containerRect.width) {
                            this.toolTip.container.style.left = containerRect.width - (containerRect.width - e.x - 10) + 'px';
                        } else {
                            this.toolTip.container.style.left = (e.x - containerRect.width - 10) + 'px';
                        }
                    }

                    //var top = offset[1];
                    //
                    //if(top > this.offset.grid.y2 - containerRect.height){
                    //	top = this.offset.grid.y2 - containerRect.height - 10;
                    //}

                    var top = e.y;
                    if (top + containerRect.height > window.innerHeight) {
                        top = window.innerHeight - containerRect.height - 30;
                    }

                    this.toolTip.container.style.top = (top + 10) + 'px';
                }
            }.bind(this),
            hide		: function() {
                this.toolTip.container.style.display = 'none';
            }.bind(this),
            addSeries	: function(series) {
                var nameEl = document.createElement('div');
                var valueEl = document.createElement('div');
                var bar = document.createElement('span');
                var colorEl = document.createElement('span');

                colorEl.setAttribute('style', 'position:absolute;top:4px;left:0px;background:' + (series.color || this.options.colors[series.seriesIndex]) +';display: inline-block;width: 7px;height: 9px;');

                nameEl.setAttribute('style', 'position:relative;text-indent:12px;font-size:12px;height:14px;margin-bottom:4px;');
                nameEl.textContent = series.label || series.id;

                bar.setAttribute('style', 'float:right;margin-left:8px;');
                bar.textContent = ' : ';

                nameEl.appendChild(colorEl);
                nameEl.appendChild(bar);
                this.toolTip.name.appendChild(nameEl);
                this.toolTip.value.appendChild(valueEl);

                series.toolTip.name = nameEl;
                series.toolTip.value = valueEl;
            }.bind(this),
            removeSeries: function(series) {
                if (series.toolTip.name) {
                    series.toolTip.name.remove();
                    delete series.toolTip.name;
                    series.toolTip.name = null;
                }

                if (series.toolTip.value) {
                    series.toolTip.value.remove();
                    delete series.toolTip.value;
                    series.toolTip.value = null;
                }
            }.bind(this),
            setData: function(index, offset) {

            }.bind(this),
            destroy: function(){
                this.toolTip.container.remove();
            }.bind(this)
        };

        this.toolTip.container.className = 'XMCanvas-multil-tooltip';
        this.toolTip.container.setAttribute('style', 'position: absolute;z-index: 100000;color: rgb(0, 0, 0);padding: 10px;border-radius: 4px;border: 1px solid rgb(216, 216, 216);	display: none;background: rgb(255, 255, 255);overflow-y:auto;max-height:500px;');
        this.toolTip.title.className = 'XMCanvas-multil-tooltip-time';
        this.toolTip.title.setAttribute('style', 'font-size: 14px;margin-bottom: 6px;padding-bottom: 2px;border-bottom: 1px solid #D2D2D2;');
        this.toolTip.name.className = 'XMCanvas-multil-tooltip-name';
        this.toolTip.name.setAttribute('style', 'float:left');
        this.toolTip.value.className = 'XMCanvas-multil-tooltip-value';
        this.toolTip.value.setAttribute('style', 'float:right;margin-left:4px;text-align:right;line-height:14px;');

        this.toolTip.container.appendChild(this.toolTip.title);
        this.toolTip.container.appendChild(this.toolTip.name);
        this.toolTip.container.appendChild(this.toolTip.value);

        document.body.appendChild(this.toolTip.container);
    };

    /**
     *
     * @param param{obejct}
     */
    XMLineChart.prototype.addSeries = function(param){
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

    /**
     * @note intermax 에 맞게 됨
     */
    XMLineChart.prototype.craeteLastValueToolTip = function(){
        this.lastValueToolTip = {
            container: document.createElement('div'),
            title: document.createElement('div'),
            value: document.createElement('div'),
            line: document.createElement('div'),
            show: function (seriesIndex, standardLastIndex) {
                if(seriesIndex == null || this.serieseList[seriesIndex] == null){
                    return;
                }

                var el = [];
                //var standardLastIndex = this.serieseList[seriesIndex].data.length - 1;

                if(standardLastIndex == null){
                    return;
                }

                for(var ix = this.serieseList.length - 1;  ix >=0 ; ix--){
                    if(this.serieseList[ix].data[standardLastIndex] != null){
                        el.push('<div class="' + (this.serieseList[ix].cls || '') + '">' + this.toFixed(this.serieseList[ix].data[standardLastIndex][1], this.toFixedNumber) + '</div>');
                    }
                }

                this.lastValueToolTip.value.innerHTML = el.join('');

                this.lastValueToolTip.title.textContent = this.lastToolTipFormat(this.serieseList[seriesIndex].data[standardLastIndex][0]);
                this.lastValueToolTip.container.style.display = 'block';
                this.lastValueToolTip.container.style.left = '0px';

                var containerRect = this.lastValueToolTip.container.getClientRects()[0];
                if(containerRect == null){
                    return;
                }

                // 왼쪽
                if (this.valuesCount / 3 > standardLastIndex) {
                    //this.toolTip.container.style.left = (offset[0] + 10) + 'px';
                    this.lastValueToolTip.container.style.left = ( this.offset.xaxis.point[standardLastIndex]) + 'px';
                    this.lastValueToolTip.line.style.left = '0px';
                }else if (this.valuesCount * 1.7 < standardLastIndex) {	// 오른쪽
                    this.lastValueToolTip.container.style.left = ( this.offset.xaxis.point[standardLastIndex] - containerRect.width ) + 'px';
                    this.lastValueToolTip.line.style.left = containerRect.width + 'px';
                }
                else {
                    this.lastValueToolTip.container.style.left = ( this.offset.xaxis.point[standardLastIndex] - ( containerRect.width / 2 )) + 'px';
                    this.lastValueToolTip.line.style.left = (containerRect.width / 2) + 'px';
                }

                this.lastValueToolTip.line.style.top = containerRect.height + 'px';
                this.lastValueToolTip.line.style.height = (this.offset.grid.y2 - containerRect.height - 10) + 'px';


                //var top = offset[1];
                //
                //if(top > this.offset.grid.y2 - containerRect.height){
                //	top = this.offset.grid.y2 - containerRect.height - 10;
                //}

                //var top = e.y;
                //if (top + containerRect.height > window.innerHeight) {
                //	top = window.innerHeight - containerRect.height - 30;
                //}
                //
                //this.lastValueToolTip.container.style.top = (top + 10) + 'px';



            }.bind(this),
            hide: function () {
                this.lastValueToolTip.container.style.display = 'none';
            }.bind(this),
            //addSeries: function (series) {
            //
            //}.bind(this),
            //removeSeries: function (series) {
            //	if (series.toolTip.name) {
            //		series.toolTip.name.remove();
            //		delete series.toolTip.name;
            //		series.toolTip.name = null;
            //	}
            //
            //	if (series.toolTip.value) {
            //		series.toolTip.value.remove();
            //		delete series.toolTip.value;
            //		series.toolTip.value = null;
            //	}
            //}.bind(this),
            destroy: function () {
                this.lastValueToolTip.container.remove();
                this.lastValueToolTip = null;
            }.bind(this)
        };

        this.lastValueToolTip.container.className = 'current-tooltip';
        //this.lastValueToolTip.container.setAttribute('style', 'position: absolute;z-index: 100000;color: rgb(0, 0, 0);padding: 10px;border-radius: 4px;border: 1px solid rgb(216, 216, 216);	display: none;background: rgb(255, 255, 255);');
        this.lastValueToolTip.title.className = 'current-tooltip-title timetext';
        this.lastValueToolTip.value.className = 'current-tooltip-value';
        this.lastValueToolTip.line.className = 'current-tooltip-line';

        this.lastValueToolTip.container.appendChild(this.lastValueToolTip.title);
        this.lastValueToolTip.container.appendChild(this.lastValueToolTip.value);
        this.lastValueToolTip.container.appendChild(this.lastValueToolTip.line);

        this.chartContainer.appendChild(this.lastValueToolTip.container);
    };

    XMLineChart.prototype.removeSeries = function(seriesIndex){
        if(this.serieseList[seriesIndex]){
            this.toolTip.removeSeries(this.serieseList[seriesIndex]);
            delete this.serieseList[seriesIndex];

            this.serieseList.splice(seriesIndex, 1);
        }
    };

    XMLineChart.prototype.removeAllSeries = function() {
        var ix;
        for (ix = this.serieseList.length - 1; ix >= 0; ix--) {
            this.removeSeries(ix);
        }
    };

    XMLineChart.prototype.initSeries = function(seriesIndex){
        if(this.serieseList[seriesIndex]){
            this.serieseList[seriesIndex].min = null;
            this.serieseList[seriesIndex].minIndex = null;
            this.serieseList[seriesIndex].max = null;
            this.serieseList[seriesIndex].maxIndex = null;
            this.serieseList[seriesIndex].data.length = 0;
            this.serieseList[seriesIndex].yPoint.length = 0;
        }
    };

    XMLineChart.prototype.initData = function(endTime, interval, initValue, seriesIndex){
        //var time = +new Date(endTime);
        //var ix = null;
        //var ixLen = null;
        //var jx = null;
        //var initVal = initValue != undefined ? initValue : null;
        //var series = null;
        //var bufferCount = this.dataBufferSize - 1;
        //
        //if(! this.dataBufferSize){
        //	console.debug(common.Util.TR('Error: chart dataBufferSize not defined...'));
        //	return;
        //}
        //
        //if(seriesIndex != undefined){
        //	series = this.serieseList[seriesIndex];
        //	series.data.length = 0;
        //	series._data.length = 0;
        //	series.timeTicks.length = 0;
        //	series.timeTicksMillitime.length = 0;
        //	series._dataIndex = 0;
        //	series._startPoint = 0;
        //	series._insertIndex = -1;
        //
        //	var tempTime = null;
        //	for(ix = 0; ix < this.dataBufferSize; ix++){
        //		tempTime = time - (interval * bufferCount--);
        //		series._dataIndex++;
        //		series._insertIndex++;
        //
        //		//this.addValue(seriesIndex, [time - (interval * ix), initVal]);
        //		series._data[series._insertIndex] = new Array(series._dataIndex, initVal);
        //		series.timeTicks[series._insertIndex] = new Array(series._dataIndex, $.plot.formatDate(new Date(tempTime), this._chartOption.xaxis.timeformat));
        //		series.timeTicksMillitime[series._insertIndex] = tempTime;
        //	}
        //}else{
        //
        //}
        //
        //series = null;
    };

    /**
     *
     * @param seriesIndex{number}
     * @param flag{boolean}
     */
    XMLineChart.prototype.setVisible = function(seriesIndex, flag) {
        if (this.serieseList[seriesIndex]) {
            this.serieseList[seriesIndex].visible = flag;
        }

        if (this.legendLayer) {
            if (flag) {
                this.legendLayer.showIndex(seriesIndex);
            } else {
                this.legendLayer.hideIndex(seriesIndex);
            }

        };
    };


    /**
     * @note 차트 데이터의 최소, 최고 값을 저장한다.
     * @param value{array} [x,y]
     * @param index{number} data index
     */
    XMLineChart.prototype.setMinMaxValue = function(series, value, index){
        var x = value[0];
        var y = (+value[1]);

        // 전체 시리즈의 최소값
        if(this.minValueInfo.y == null){
            this.minValueInfo.x = x;
            this.minValueInfo.y = y;
            this.minValueInfo.index = index;
            this.minValueInfo.seriesIndex = series.seriesIndex;
        }else{
            if( this.minValueInfo.y > y ){
                this.minValueInfo.x = x;
                this.minValueInfo.y = y;
                this.minValueInfo.index = index;
                this.minValueInfo.seriesIndex = series.seriesIndex;
            }
        }

        // 시리즈의 최소값
        if(series.min == null){
            series.min = y;
            series.minIndex = index;
        }else{
            if( series.min > y ){
                series.min = x;
                series.minIndex = index;
            }
        }

        // 전체 시리즈의 최대값 ( 마지막 시리즈의 최대값을 저장하기 위해 > 에서 >= 로 변경 )
        if(this.maxValueInfo.y == null || y >= this.maxValueInfo.y ){
            this.maxValueInfo.x = x;
            this.maxValueInfo.y = y;
            this.maxValueInfo.index = index;
            this.maxValueInfo.seriesIndex = series.seriesIndex;
        }

        // 시리즈의 최대값
        if(y > series.max ){
            series.max = y;
            series.maxIndex = index;
        }
        value = null;
    };

    /**
     * @note
     * @param seriesIndex{number}
     * @param value{array} [ x, y ]
     */
    XMLineChart.prototype.addValue = function(seriesIndex, value, dataIndex){
        var series = this.serieseList[seriesIndex];
        if(! series){
            return;
        }

        if(dataIndex == null) {
            dataIndex = series.data.length;
        }

        series.data[dataIndex] = value;

        if(this.dataBufferSize != null){
            if(series.data.length > this.dataBufferSize){
                series.data.shift();
                --dataIndex;

                --series.maxIndex;
                --series.minIndex;

                this.maxValueInfo.index = this.serieseList[this.maxValueInfo.seriesIndex].maxIndex;
                this.minValueInfo.index = this.serieseList[this.minValueInfo.seriesIndex].minIndex;

                if(series.maxIndex < 0){
                    this.setMaxInfo(seriesIndex, 'y');

                    this.setTotalYMaxValue();
                }

                if(series.minIndex < 0){
                    this.setMinInfo(seriesIndex, 'y');

                    var info = this.getYMinValue();

                    this.minValueInfo.x = info.x;
                    this.minValueInfo.y = info.y;
                    this.minValueInfo.index = info.index;
                    this.minValueInfo.seriesIndex = info.seriesIndex;
                }
            }
        }

        // min, max 설정
        if(series.visible){
            this.setMinMaxValue(series, value, dataIndex);
            if(this.options.yaxis.labelWidth == null){
                this.setMaxLabelWidth(value);
            }
        }
    };

    /**
     * @param seriesIndex{number}
     * @param values{array}  [ [x1, y1], [x2, y2]. [x3, y3] ... n  ]
     */
    XMLineChart.prototype.addValues = function(seriesIndex, values){

        for(var ix = 0, ixLen = values.length; ix < ixLen; ix++){
            this.addValue(seriesIndex, values[ix]);
        }
    };

    XMLineChart.prototype.clearValues = function(){
        for (var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            this.initSeries(ix);
        }
        this.offset.xaxis.point.length = 0;

        this.initMinMax();
        this.clearDraw();
    };


    /**
     * @note 시리즈중 최고 데이터 length 를 반환한다.
     * @returns {number}
     */
    XMLineChart.prototype.getMaxDataCount = function(){
        var temp = 0;
        for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
            if(this.serieseList[ix].visible){
                temp = Math.max(temp, this.serieseList[ix].data.length);
            }
        }

        return temp;
    };


    /**
     * 정확히 게산하기 위해선 canvas 의 measureText 을 이용하여 텍스트 width 를 가져와야 하지만
     * 일단 성능적으로 처리를 우선시 하여 텍스트의 길이 만큼만 width 를 구한다.
     * @param value{number}
     */
    XMLineChart.prototype.setMaxLabelWidth = function(value){
        if((value[0] + '').length > this.offset.xaxis.labelWidth ){
            this.maxXLabelText = value[0] + '';
            this.offset.xaxis.labelWidth = this.maxXLabelText.length;
        }
        if((value[1] + '').length > this.offset.yaxis.labelWidth ){
            this.maxYLabelText = Math.ceil(value[1]) + '';
            this.offset.yaxis.labelWidth = this.maxYLabelText.length;
        }
    };

    /**
     * @override XMCanvas 오버라이드
     * canvas 에 그린다.
     * double buffering 으로 beffuer canvas 에 그린후 display canvas 에 buffer canvas 를 엎는다.
     */
    XMLineChart.prototype.draw = function() {
        if (this.width == null || this.height == null) {
            return;
        }

        this.isDrawing = true;
        this.clearDraw();
        this.setGrid();
        for (var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            this.drawSeries(ix);
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
    XMLineChart.prototype.drawSeries = function(seriesIndex){
        if (this.serieseList[seriesIndex] == null || ! this.serieseList[seriesIndex].visible) {
            return;
        }

        var series = this.serieseList[seriesIndex];
        var data = null;
        var yOffset = this.offset.yaxis;
        var yPoint = series.yPoint;
        var xPoint = this.offset.xaxis.point;

        var color = series.color || this.options.colors[seriesIndex];
        var ctx = this.bufferCtx;

        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineWidth = series.lineWidth;
        // global alpha 보다 rgba 가 성능이 더 좋음
        var seriesFillStyle = series.fill == null ? '' : 'rgba(' + this.hexToRgb(series.color || this.options.colors[seriesIndex]) + ',' + (series.fill) + ')';

        if(series.fill != null){
            ctx.fillStyle = seriesFillStyle;
        }

        ctx.lineWidth = series.overLineWidth == null ? series.lineWidth : series.overLineWidth;
        ctx.strokeStyle = color;

        var startFillIndex = 0;
        //var moveFlag = true;
        var x = null;
        var y = null;
        var ix = null, ixLen = null;
        for(ix = 0, ixLen = series.data.length; ix < ixLen; ix++){

            data = series.data[ix];
            x = xPoint[ix];
            y = null;
            // 데이터 Y 값이 null인 경우
            if(data[1] == null){
                yPoint[ix] = null;
                //moveFlag = true;

                if( ix - 1 >= 0){

                    if(series.fill != null && series.data[ix - 1] != null && series.data[ix - 1][1] != null){
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
            }else{
                y = this.calculateY(data[1]);
                yPoint[ix] = y;

                if(series.line){
                    if(ix === 0 || series.data[ix - 1] == null || series.data[ix - 1][1] == null){
                        ctx.moveTo(x, y);
                    }else{
                        ctx.lineTo(x, y);
                    }
                }else{
                    if(ix === 0 || series.data[ix - 1] == null || series.data[ix - 1][1] == null){
                        ctx.moveTo(x, y);
                    }
                }
            }
        }
        ctx.stroke();

        if(series.fill != null && series.data[ix - 1] != null && series.data[ix - 1][1] != null){
            ctx.stroke();

            ctx.fillStyle = seriesFillStyle;
            //ctx.strokeStyle = seriesFillStyle;
            ctx.lineTo(xPoint[ ix - 1 ], yOffset.endPoint);
            ctx.lineTo(xPoint[ startFillIndex ], yOffset.endPoint);
            ctx.lineTo(xPoint[ startFillIndex ], yPoint[ startFillIndex ]);

            ctx.fill();
        }

        // 포인트 효과를 마지막에 다시 그리는 이유는 마지막에 그려야 겹쳐 다른 그림과 겹치지 않기 위해서입니다.
        var pointOption = this.options.series.point;
        if(series.point || this.options.series.point.show){
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.fillStyle = series.fillColor || pointOption.fillColor || '#fff';
            ctx.lineWidth = pointOption.lineWidth;
            for(ix = 0, ixLen = series.data.length; ix < ixLen; ix++){
                if(xPoint[ix] != null && yPoint[ix] != null){
                    ctx.moveTo(xPoint[ix], yPoint[ix]);
                    ctx.arc(xPoint[ix], yPoint[ix], pointOption.radius, 0 , Math.PI*2);
                }
            }
            ctx.stroke();
            ctx.fill();
        }
    };

    XMLineChart.prototype.initMinMax = function(){
        this.maxValueInfo.x = null;
        this.maxValueInfo.y = null;
        this.maxValueInfo.index = null;
        this.maxValueInfo.seriesIndex = null;

        this.minValueInfo.x = null;
        this.minValueInfo.y = null;
        this.minValueInfo.index = null;
        this.minValueInfo.seriesIndex = null;
    };

    XMLineChart.prototype.calculateLabelPosition = function(coord){
        var ticks = this.options[coord].ticks;
    };

    XMLineChart.prototype.setGrid = function(){
        // 차트가 그려질 그리드 영역
        this.valuesCount = this.getMaxDataCount();

        this.createYLabel();
        this.createXLabel();
    };

    XMLineChart.prototype.setGridOffset = function() {
        //this.bufferCtx.font = this.getLabelStyle('x');
        var xLabelWidth = this.bufferCtx.measureText(this.xLabelFormat(this.maxXLabelText)).width + 20;
        //this.bufferCtx.font = this.getLabelStyle('y');
        var yLabelWidth = this.options.yaxis.labelWidth || this.bufferCtx.measureText(this.yLabelFormat(this.offset.yaxis.max, this.options.yaxis)).width + 20;

        //var xLabelWidth = (this.offset.xaxis.labelWidth * this.options.xaxis.labelStyle.fontSize / 2) + 10;
        //var yLabelWidth = (this.offset.yaxis.labelWidth * this.options.yaxis.labelStyle.fontSize / 2) + 10;
        //this.xScalePaddingRight = Math.round(xLabelWidth/2 + 3) ;
        this.xScalePaddingRight = 15;		// 마지막 label 길이가 짤려도 상관없다고함
        this.xScalePaddingLeft = Math.round((xLabelWidth / 2 > yLabelWidth ) ? xLabelWidth / 2 : yLabelWidth );

        this.offset.grid.x = this.xScalePaddingLeft;
        this.offset.grid.x2 = this.width - this.xScalePaddingRight;

        this.maxXLabelWidth = xLabelWidth;
        this.maxYLabelWidth = yLabelWidth;
    };

    XMLineChart.prototype.getGridOffset = function() {
        return {
            x : this.offset.grid.x,
            y : this.offset.grid.y,
            width : this.offset.grid.width,
            height : this.offset.grid.height
        };
    };

    XMLineChart.prototype.createXLabel = function() {
        if (this.options.xaxis.tickInterval == null) {
            this.calculateXRange();
        } else {
            this.calculateXInterval();
        }
    };

    XMLineChart.prototype.createYLabel = function() {
        var info = this.offset.yaxis;
        var ix, ixLen;

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

        if (yaxis.ticks == null) {
            yaxis.ticks = new Array();
        } else {
            yaxis.ticks.length = 0;
        }

        this.bufferCtx.font = this.getLabelStyle('y');
        this.bufferCtx.textAlign = 'center';
        this.bufferCtx.textBaseline = 'middle';
        this.bufferCtx.fillStyle = this.options.xaxis.labelStyle.color;

        this.bufferCtx.lineWidth = grid.gridLineWidth;

        var aliasPixel = this.aliasPixel(this.bufferCtx.lineWidth);

        this.bufferCtx.beginPath();

        for (ix = 0, ixLen = info.steps; ix <= ixLen; ix++) {
            if (info.isStepValueFloat) {
                // 자바스크립트 실수 연산이 최악이다
                yaxis.ticks[ix] = Math.round((info.min + (ix * info.stepValue)) * 1000) / 1000;
            } else {
                yaxis.ticks[ix] = info.min + (ix * info.stepValue);
            }

            yLabelCenter = info.endPoint - (yLabelGap * ix);
            linePositionY = Math.round(yLabelCenter) + aliasPixel;
            //linePositionY = yLabelCenter + aliasPixel;

            // y축 label 그리기
            this.bufferCtx.fillText(this.yLabelFormat(yaxis.ticks[ix], this.options.yaxis), xStart - (this.maxYLabelWidth / 2) , yLabelCenter);
            // y축 label 선 그리기

            //this.bufferCtx.moveTo(xStart + 15, linePositionY);
            this.bufferCtx.moveTo(xStart , linePositionY);
            this.bufferCtx.lineTo(xEnd, linePositionY);
            if (ix == 0) {
                this.bufferCtx.strokeStyle = grid.border.color;
                this.bufferCtx.stroke();
                this.bufferCtx.beginPath();
            } else {
                this.bufferCtx.strokeStyle = grid.gridLineColor;
            }
        }

        this.bufferCtx.stroke();

        grid = null;
        info = null;
    };

    XMLineChart.prototype.calculateXInterval = function(){
        var xMaxInfo = this.getXMaxValue();
        var standardSeries = this.serieseList[xMaxInfo.seriesIndex];

        if(! standardSeries){
            return;
        }

        //if(standardSeries.data[0]){
        //    this.offset.xaxis.min = standardSeries.data[0][0];
        //}

        var grid = this.options.grid;

        //var xLabelWidth = this.offset.xaxis.labelWidth;
        //this.bufferCtx.font = this.getLabelStyle('y');
        this.bufferCtx.textAlign = 'center';
        this.bufferCtx.textBaseline = 'top';
        this.bufferCtx.fillStyle = this.options.yaxis.labelStyle.color;

        var xLabelWidth = this.maxXLabelWidth + 10;
        var interval = this.options.xaxis.tickInterval;
        var point = this.offset.xaxis.point;

        var xPos = null;
        var step = null;
        //if(this.options.xaxis.tickLength == null){
        //    step = Math.ceil(this.valuesCount / ((this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / xLabelWidth));
        //}else{
        //    step = Math.ceil(this.valuesCount / this.options.xaxis.tickLength);
        //
        //    if( this.options.xaxis.tickLength > (this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / xLabelWidth){
        //        step = Math.ceil(this.valuesCount / ((this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / xLabelWidth));
        //    }
        //}

        //step = Math.min(step, range);

        var pixel = this.aliasPixel(this.bufferCtx.lineWidth);
        //var timeRecordData = Repository.trendChartData.timeRecordData;
        //var xMax = timeRecordData[Repository.trendChartData.timeRecordData.length - 1];

        var timeRecordData;
        var xMax;

        if (window.rtmMonitorType === 'CD') {
            timeRecordData = Repository.CDTrendData.timeRecordData;
            xMax = timeRecordData[Repository.CDTrendData.timeRecordData.length - 1];

        } else if (window.rtmMonitorType ===  'E2E' && Comm.rtmBizShow) {
            timeRecordData = Repository.BizTrendData.timeRecordData;
            xMax = timeRecordData[Repository.BizTrendData.timeRecordData.length - 1];

        } else {
            timeRecordData = Repository.trendChartData.timeRecordData;
            xMax = timeRecordData[Repository.trendChartData.timeRecordData.length - 1];
        }

        var xMin = timeRecordData[0];
        this.offset.xaxis.min = xMin;
        this.offset.xaxis.max = xMax;

        // 왼쪽 y축 border
        this.bufferCtx.beginPath();
        this.bufferCtx.lineWidth = grid.gridLineWidth;
        this.bufferCtx.strokeStyle = grid.border.color;

        this.bufferCtx.moveTo(this.xScalePaddingLeft,	this.offset.yaxis.endPoint);
        this.bufferCtx.lineTo(this.xScalePaddingLeft,	this.offset.yaxis.startPoint - 3);
        this.bufferCtx.stroke();

        for(var ix = 0; ix < this.valuesCount; ix++){
            xPos = this.calculateXIndex(ix) + pixel;
            point[ix] = xPos;
        }


        var labelCount = Math.floor((this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / xLabelWidth) || 1;
        var range = Math.floor((xMax - xMin) / this.options.xaxis.tickInterval);
        var minute = null;
        var startTime = new Date(xMin).setSeconds(0,0);
        var inc = Math.floor(range / labelCount);
        if(inc < 1){
            inc = 1;
        }
        //var cnt = 0;

        for(ix = 0; ix <= range + 1; ix += inc){
            //if(ix % inc === 0){
                // x축 label 그리기
                minute = startTime + (interval * ix);
                if(minute >= xMin && minute <= xMax){
                    // x축 label 그리기
                    //if(standardSeries.data[ix]){
                    this.bufferCtx.fillText(this.xLabelFormat(minute) , this.calculateX(minute) , this.offset.yaxis.endPoint + 8);
                    //}
                }

                //cnt++;
            //}
        }


        //this.offset.xaxis.max = standardSeries.data[standardSeries.data.length - 1][0];

        //if((ix -1) % step !== 0 && ix % step === 0){
        //    // 마지막 x축 label 그리기
        //    if(standardSeries.data[ix - 1]){
        //        this.bufferCtx.fillText(this.xLabelFormat(standardSeries.data[ix - 1][0]) , point[ix - 1] , this.offset.yaxis.endPoint + 8);
        //    }
        //}

        this.offset.xaxis.step = step;
        //this.offset.grid.x = point[0];
        this.standardSeries = standardSeries;

        grid =  null;
        point = null;
    };

    XMLineChart.prototype.calculateXRange = function(){
        var xMaxInfo = this.getXMaxValue();
        var standardSeries = this.serieseList[xMaxInfo.seriesIndex];

        if(! standardSeries){
            return;
        }

        if(standardSeries.data[0]){
            this.offset.xaxis.min = standardSeries.data[0][0];
        }

        var grid = this.options.grid;

        //var xLabelWidth = this.offset.xaxis.labelWidth;
        //this.bufferCtx.font = this.getLabelStyle('y');
        this.bufferCtx.textAlign = "center";
        this.bufferCtx.textBaseline = "top";
        this.bufferCtx.fillStyle = this.options.yaxis.labelStyle.color;

        var xLabelWidth = this.maxXLabelWidth;

        var point = this.offset.xaxis.point;

        var xPos = null;
        var step = null;
        if(this.options.xaxis.tickLength == null){
            step = Math.ceil(this.valuesCount / ((this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / xLabelWidth));
        }else{
            step = Math.ceil(this.valuesCount / this.options.xaxis.tickLength);

            if( this.options.xaxis.tickLength > (this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / xLabelWidth){
                step = Math.ceil(this.valuesCount / ((this.width - this.xScalePaddingLeft - this.xScalePaddingRight ) / xLabelWidth));
            }
        }


        var pixel = this.aliasPixel(this.bufferCtx.lineWidth);


        for(var ix = 0; ix < this.valuesCount; ix++){
            xPos = this.calculateXIndex(ix) + pixel;

            if(ix % step === 0){

                if(ix == 0){
                    // 왼쪽 y축 border
                    this.bufferCtx.beginPath();
                    this.bufferCtx.lineWidth = grid.gridLineWidth;
                    this.bufferCtx.strokeStyle = grid.border.color;

                    this.bufferCtx.moveTo(xPos,	this.offset.yaxis.endPoint);
                    this.bufferCtx.lineTo(xPos,	this.offset.yaxis.startPoint - 3);
                    this.bufferCtx.stroke();
                }

                if(ix != 0 && grid.showYLine){
                    this.bufferCtx.beginPath();
                    this.bufferCtx.lineWidth = grid.gridLineWidth;
                    this.bufferCtx.strokeStyle = grid.gridLineColor;

                    this.bufferCtx.moveTo(xPos,	this.offset.yaxis.endPoint);
                    this.bufferCtx.lineTo(xPos,	this.offset.yaxis.startPoint - 3);
                    this.bufferCtx.stroke();
                }
                // x축 label 그리기
                if(standardSeries.data[ix]){
                    this.bufferCtx.fillText(this.xLabelFormat(standardSeries.data[ix][0]) , xPos , this.offset.yaxis.endPoint + 8);
                }

            }
            point[ix] = xPos;
        }

        this.offset.xaxis.max = standardSeries.data[ix - 1][0];

        if((ix -1) % step !== 0 && ix % step === 0){
            // 마지막 x축 label 그리기
            if(standardSeries.data[ix - 1]){
                this.bufferCtx.fillText(this.xLabelFormat(standardSeries.data[ix - 1][0]) , point[ix - 1] , this.offset.yaxis.endPoint + 8);
            }
        }

        this.offset.xaxis.step = step;
        //this.offset.grid.x = point[0];
        this.standardSeries = standardSeries;

        grid =  null;
        point = null;
    };

    XMLineChart.prototype.calculateX = function (value) {
        var innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight);

        return Math.round(this.xScalePaddingLeft + ((value - this.offset.xaxis.min) * innerWidth) / (this.offset.xaxis.max - this.offset.xaxis.min));
    };

    XMLineChart.prototype.calculateXIndex = function(index){
        var innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight);
        var valueWidth = innerWidth / Math.max(this.valuesCount - 1, 1);
        var valueOffset = (valueWidth * index) + this.xScalePaddingLeft;

        //valueOffset += (valueWidth/2);

        //return Math.round(valueOffset);
        return valueOffset;
    };

    XMLineChart.prototype.calculateY = function(value){
        if (value == null) {
            return null;
        }

        var scalingFactor = this.drawingArea() / (this.offset.yaxis.max - this.options.yaxis.min);
        return this.offset.yaxis.endPoint - (scalingFactor * (value - (this.options.yaxis.min || 0)));
    };

    XMLineChart.prototype.drawingArea = function(){
        return this.offset.yaxis.endPoint - this.offset.yaxis.startPoint;
    };

    XMLineChart.prototype.calculateYRange = function() {
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

        var maxValue = this.options.yaxis.max == null ? this.getYMaxValue().y : this.options.yaxis.max;
        if (this.options.yaxis.max == null && this.options.yaxis.autoscaleRatio != null) {
            maxValue *= (this.options.yaxis.autoscaleRatio + 1);
        }

        if (maxValue < 1) {
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

        if (maxValue == 1) {
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
                if (integersOnly && rangeMagnitude >= 0) {
                    //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
                    if (stepValue / 2 % 1 === 0) {
                        stepValue /= 2;
                        numberOfSteps = Math.round(graphRange / stepValue);
                    } else {
                        //If it would make it a float break out of the loop
                        break;
                    }
                } else {
                    //If the scale doesn't have to be an int, make the scale more granular anyway.
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
        this.offset.yaxis.max = Math.round((graphMin + (numberOfSteps * stepValue)) * 1000) / 1000;
        this.offset.yaxis.startPoint = startPoint;
        this.offset.yaxis.endPoint = endPoint;

        this.offset.grid.y = startPoint;
        this.offset.grid.y2 = endPoint;

        this.setGridOffset();

        yaxis = null;
    };

    XMLineChart.prototype.xLabelFormat = function(value){
        return value;
    };

    XMLineChart.prototype.yLabelFormat = function(value, axis){
        return value;
    };

    XMLineChart.prototype.toolTipFormat = function(value){
        return value;
    };

    XMLineChart.prototype.lastToolTipFormat = function(value){
        var date = new Date(value);
        return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ":" +
            (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    };

    XMLineChart.prototype.setMaxInfo = function(seriesIndex, direct){
        var max = 0;
        var maxIndex = 0;
        var directIndex = 1;
        if(this.serieseList[seriesIndex]){
            if(direct == 'x'){
                directIndex = 0;
            }

            for(var ix = 0, ixLen = this.serieseList[seriesIndex].data.length; ix < ixLen; ix++){
                if(this.serieseList[seriesIndex].data[ix][directIndex] > max){
                    max = this.serieseList[seriesIndex].data[ix][directIndex];
                    maxIndex = ix;
                }
            }

            this.serieseList[seriesIndex].max = max;
            this.serieseList[seriesIndex].maxIndex = maxIndex;
        }
    };

    XMLineChart.prototype.setMinInfo = function(seriesIndex, direct){
        var min = null;
        var minIndex = 0;
        var directIndex = 1;
        if(this.serieseList[seriesIndex]){
            if(direct == 'x'){
                directIndex = 0;
            }

            for(var ix = 0, ixLen = this.serieseList[seriesIndex].data.length; ix < ixLen; ix++){
                if(min == null){
                    min = this.serieseList[seriesIndex].data[ix][directIndex];
                }else{
                    if(this.serieseList[seriesIndex].data[ix][directIndex] < min){
                        min = this.serieseList[seriesIndex].data[ix][directIndex];
                        minIndex = ix;
                    }
                }
            }

            this.serieseList[seriesIndex].min = min;
            this.serieseList[seriesIndex].minIndex = minIndex;
        }
    };

    /**
     * @note 현재 보여지고 있는 시리즈 ( visible : true )의 최대값 정보를 가져온다.
     * @returns {}
     */
    XMLineChart.prototype.getYMaxValue = function(){
        var result = {
            x : null,
            y : null,
            index : null,
            seriesIndex: null
        };

        for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
            if(this.serieseList[ix].visible && this.serieseList[ix].max != null){
                // 마지막 시리즈의 정보를 저장하기 위해 부등호르 >  에서 >= 로 변경
                if(this.serieseList[ix].max >= result.y){
                    result.x = this.serieseList[ix].data[this.serieseList[ix].maxIndex][0];
                    result.y = this.serieseList[ix].max;
                    result.index = this.serieseList[ix].maxIndex;
                    result.seriesIndex = ix;
                }
            }
        }

        return result;
    };

    /**
     * @note 현재 보여지고 있는 시리즈 ( visible : true )의 최소값 정보를 가져온다.
     * @returns {{value: null, seriesIndex: null, dataIndex: null}}
     */
    XMLineChart.prototype.getYMinValue = function(){
        var result = {
            x : null,
            y : null,
            index: null,
            seriesIndex : null
        };

        for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
            if(this.serieseList[ix].visible && this.serieseList[ix].minIndex != null){
                if(result.value == null){
                    result.x = this.serieseList[ix].data[this.serieseList[ix].minIndex][0];
                    result.y = this.serieseList[ix].min;
                    result.index = this.serieseList[ix].minIndex;
                    result.seriesIndex = ix;
                }else{
                    if(this.serieseList[ix].min < result.y){
                        result.x = this.serieseList[ix].data[this.serieseList[ix].minIndex][0];
                        result.y = this.serieseList[ix].min;
                        result.index = this.serieseList[ix].minIndex;
                        result.seriesIndex = ix;
                    }
                }
            }
        }

        return result;
    };

    /**
     * @note 현재 보여지고 있는 시리즈 ( visible : true )의 최소값 정보를 가져온다.
     * 시리즈 데이터의 가장 마지막 인덱스의 데이터를 가지고 판단. x 축 값이 number 일경우 사용
     * @returns {{value: null, seriesIndex: null, dataIndex: null}}
     */
    XMLineChart.prototype.getXMaxValue = function(){
        var result = {
            value : null,
            seriesIndex : null,
            dataIndex: null
        };

        var data = null;
        for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
            if(this.serieseList[ix].visible){
                data = this.serieseList[ix].data[this.serieseList[ix].data.length -1];
                if(data && data[0]){
                    if(data[0] > result.value){
                        result.value = data[0];
                        result.dataIndex = this.serieseList[ix].data.length -1;
                        result.seriesIndex = ix;
                    }
                }
            }
        }

        return result;
    };

    XMLineChart.prototype.setTotalYMaxValue = function(){
        var info = this.getYMaxValue();

        this.maxValueInfo.x = info.x;
        this.maxValueInfo.y = info.y;
        this.maxValueInfo.index = info.index;
        this.maxValueInfo.seriesIndex = info.seriesIndex;
    };

    /**
     * 시리즈 show ,hide 기능
     * @param seriesIndex    series index
     * @param flag      true : show, false : hide
     */
    XMLineChart.prototype.setSeriesVisible = function(seriesIndex, flag){
        var color;

        if(this.serieseList[seriesIndex]){
            this.serieseList[seriesIndex].visible = flag;
            color = this.serieseList[seriesIndex].color || this.options.colors[seriesIndex];

            if(this.serieseList[seriesIndex].labelObj){
                var colorObj = this.serieseList[seriesIndex].labelObj.colorEl;
                if (colorObj) {
                    if (flag) {
                        colorObj.style.background = color;
                    } else {
                        colorObj.style.backgroundColor = '';
                        colorObj.style.border = '2px solid ' + color;
                        colorObj.dataset.check = 0;
                    }
                }
            }
        }
        this.setTotalYMaxValue();
        this.draw();
    };

    /**
     * @note label 스타일을 설정한다.
     * @param direct{string}
     * @param fontSize{number}
     * @param color{string}	ex ) #000
     * @param fontFamily{string}
     */
    XMLineChart.prototype.setLabelStyle = function(direct, fontSize, color, fontFamily){
        var style = null;
        if(direct == 'x'){
            style = this.options.xaxis.labelStyle;
        }else{
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
    XMLineChart.prototype.getLabelStyle = function(direct){
        var style = null;
        if(direct == 'x'){
            style = this.options.xaxis.labelStyle;
        }else{
            style = this.options.yaxis.labelStyle;
        }

        return 'normal ' + style.fontSize + 'px ' + style.fontFamily;
    };

    /**
     * serieseList 에서 해당 series 를 가져온다.
     * @param id 타입이 Number 일경우(1,2,3 or '1','2','3') index를 참조해서 가져오고
     *        아닐경우 series 에 id 를 비교하여 찾는다
     * @returns 해당 series, 없을경우 null
     */
    XMLineChart.prototype.getSeries = function(id){
        if(typeof id == 'number'){
            return this.serieseList[id];
        }
        else if(!isNaN(+id)){
            return this.serieseList[id];
        }
        else if(typeof id == 'string'){
            for(var i = 0; i < this.serieseList.length; i++){
                if(this.serieseList[i].id == id){
                    return this.serieseList[i];
                }
            }
        }else{
            return this.serieseList[id];
        }

        return null;
    };

    /**
     * 차트 line width 설정
     * @param seriesIndex{number} null 이면 모든 시리즈 변경
     * @param width{number}
     */
    XMLineChart.prototype.setLineWidth = function(seriesIndex, width){
        if(seriesIndex == null){
            for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
                this.serieseList[ix].lineWidth = width;
            }
        }else{
            if(this.serieseList[seriesIndex]){
                this.serieseList[seriesIndex].lineWidth = width;
            }
        }
    };

    XMLineChart.prototype.setXAxisStyle = function(style){
        this.options.xaxis.labelStyle.fontSize = style.size;
        this.options.xaxis.labelStyle.color = style.color;
        this.options.xaxis.labelStyle.fontFamily = style.family;
    };

    XMLineChart.prototype.setYAxisStyle = function(style){
        this.options.yaxis.labelStyle.fontSize = style.size;
        this.options.yaxis.labelStyle.color = style.color;
        this.options.yaxis.labelStyle.fontFamily = style.family;
    };

//////////////////////////////////////////////////// OVERLAY ////////////////////////////////////////////////////



//////////////////////////////////////////////////// OVERLAY ACTION ////////////////////////////////////////////////////

    XMLineChart.prototype.drawCrosshair = function(offset){
        var gridOffset = this.offset.grid;
        var ctx = this.overlayCtx;
        var x = offset[0];
        var y = offset[1];

        if(x >= gridOffset.x && gridOffset.x2 >= x &&
            y >= gridOffset.y && gridOffset.y2 >= y){
            ctx.strokeStyle = this.options.crosshair.color;

            ctx.beginPath();
            ctx.moveTo(x, gridOffset.y);
            ctx.lineTo(x, gridOffset.y2);
            ctx.stroke();
        }
    };

    XMLineChart.prototype.drawHighlight = function(info){
        if(! info){
            return;
        }

        var ctx = this.overlayCtx;
        var series = this.serieseList[info.seriesIndex];
        //var pointOption = series.point || this.options.series.point;
        var pointOption = this.options.series.point;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(' + this.hexToRgb(series.color || this.options.colors[info.seriesIndex]) + ',' + 0.5 + ')';
        ctx.lineWidth = this.options.highlight.width;
        //ctx.arc(this.offset.xaxis.point[info.dataIndex], series.yPoint[info.dataIndex], this.options.series.point.radius, 0 , Math.PI*2);
        ctx.arc(this.offset.xaxis.point[info.dataIndex], series.yPoint[info.dataIndex], pointOption.radius + 4, 0 , Math.PI*2);
        ctx.stroke();
    };

    XMLineChart.prototype.showMultiTooltip = function(index, offset){
        var series = null;
        var isShow = false;
        var time = null;
        var firstFlag = true;
        for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
            series = this.serieseList[ix];

            if(series.visible && series.data[index] && series.data[index][1] != null){
                if(firstFlag){
                    this.toolTip.title.textContent = series.data[0];
                    firstFlag = false;
                }

                isShow = true;

                series.toolTip.value.textContent = series.data[index][1];

                series.toolTip.name.style.display = 'block';
                series.toolTip.value.style.display = 'block';
            }else{
                series.toolTip.name.style.display = 'none';
                series.toolTip.value.style.display = 'none';
            }
        }

        this.toolTip.container.style.top = (offset[1] + 10) + 'px';
        this.toolTip.container.style.left = (offset[0] + 10) + 'px';

        if(isShow){
            this.toolTip.show();
        }else{
            this.toolTip.hide();
        }

    };


    XMLineChart.prototype.clearSelection = function(e){
        this.overlayClear();
        this.selection.active = false;
        this.selection.isDrawing = false;
        this.selection.first.x = -1;
        this.selection.first.y = -1;
        this.selection.second.x = -1;
        this.selection.second.y = -1;
    };

    XMLineChart.prototype.drawSelection = function(e){
        if(this.options.selection.show){
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

    XMLineChart.prototype.setSelectionPos = function(pos, e){
        var offset = this.chartContainer.getClientRects()[0];
        var grid = this.offset.grid;
        pos.x = this.clamp(0, e.pageX - offset.left, this.width);
        pos.y = this.clamp(0, e.pageY - offset.top, this.height);

        if (this.options.selection.mode == "y")
            pos.x = pos == this.selection.first ? 0 : this.width;

        if (this.options.selection.mode == "x")
            pos.y = pos == this.selection.first ? 0 : this.height;
    };

    XMLineChart.prototype.getSelection = function() {
        if(! this.options.selection.show || ! this.selection.active){
            return;
        }

        var first = this.pointToValue(this.selection.first.x, this.selection.first.y);
        var second = this.pointToValue(this.selection.second.x, this.selection.second.y);

        return {
            x : Math.max(this.offset.xaxis.min, Math.min(first[0], second[0])),
            x2 : Math.min(this.offset.xaxis.max, Math.max(first[0], second[0])),
            y : Math.max(this.offset.yaxis.min, Math.min(first[1], second[1])),
            y2 : Math.min(this.offset.yaxis.max, Math.max(first[1], second[1]))
        };
    };

    XMLineChart.prototype.clamp = function(min, value, max) {
        return value < min ? min: (value > max ? max: value);
    };

    XMLineChart.prototype.pointToValue = function(x, y){
        var xOffset = this.offset.xaxis;
        var yOffset = this.offset.yaxis;

        var xMin = xOffset.point[0];
        var xMax = xOffset.point[xOffset.point.length - 1];
        var xMinVal = this.standardSeries.data[0][0];
        var xMaxVal = this.standardSeries.data[this.standardSeries.data.length - 1][0];

        var yMin = yOffset.startPoint;
        var yMax = yOffset.endPoint;
        var yMinVal = yOffset.min;
        var yMaxVal = yOffset.max;

        return [
            (((x - xMin) / (xMax - xMin)) * (xMaxVal - xMinVal)) + xMinVal,
            yMaxVal - (((y - yMin) / (yMax - yMin)) * (yMaxVal - yMinVal)) + yMinVal
        ];
    };




//////////////////////////////////////////////////// EVENT ////////////////////////////////////////////////////


    XMLineChart.prototype.mousemoveEvent = function(e){
        var offset = this.getMousePosition(e);

        if(this.options.crosshair.show){
            this.overlayClear();
            this.drawCrosshair(offset);
        }

        var index = this.findHitXaxis(offset[0]);

        if(index != null){
            this.toolTip.show(index, offset, e);
        }

        //if(this.options.selection.show && this.selection.active){
        //	this.overlayClear();
        //	this.setSelectionPos(this.selection.second, e);
        //	this.drawSelection(e);
        //}else{
        //	if(!this.selection || ! this.selection.isDrawing){
        //		var info = this.findHitItem(offset);
        //
        //		if(info){
        //			if(this.options.highlight.show){
        //				this.overlayClear();
        //				this.drawHighlight(info);
        //			}
        //			if(this.options.tooltip.show){
        //				this.toolTip.show(info.dataIndex, offset);
        //			}
        //		}else{
        //			if(this.options.highlight.show){
        //				this.overlayClear();
        //			}
        //			if(this.options.tooltip.show){
        //				this.toolTip.hide();
        //			}
        //		}
        //	}
        //}
    };

    XMLineChart.prototype.mouseoutEvent = function(e){
        e.stopPropagation();
        if(this.options != null){
            if (this.options.tooltip.show) {
                this.toolTip.hide();
            }
        }
    };

    XMLineChart.prototype.mousedownEvent = function(e) {
        e.stopPropagation();
        if (e.which != 1)  // only accept left-click
            return;

        // cancel out any text selections
        document.body.focus();
        this.overlayClear();
        this.setSelectionPos(this.selection.first, e);
        this.selection.active = true;

        this.mouseUpHandler = this.mouseupEvent.bind(this);

        window.addEventListener('mouseup', this.mouseUpHandler, false);


    };


    XMLineChart.prototype.mouseupEvent = function(e) {
        mouseUpHandler = null;

        this.setSelectionPos(this.selection.second, e);

        if(this.selection.active && this.selectionEvent){
            this.selectionEvent(this.getSelection());
        }
        // no more dragging
        this.selection.active = false;

        if(this.selection.first.x == this.selection.second.x && this.selection.first.y == this.selection.second.y){
            this.clearSelection();
        }

        window.removeEventListener('mouseup', this.mouseUpHandler);
        return false;
    };


    XMLineChart.prototype.mousewheel = function(e) {
        if (e.wheelDelta > 0) {
            if (this.toolTip.container.scrollTop + 20 > 0) {
                this.toolTip.container.scrollTop -= 20;
            } else {
                this.toolTip.container.scrollTop = 0;
            }
        } else {
            this.toolTip.container.scrollTop += 20;
        }
        return false;
    };

    XMLineChart.prototype.onclick = function(e) {
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
    XMLineChart.prototype.resize = function( ){
        if (!this.chartContainer) {
            return;
        }

        var offset;
        offset = this.chartContainer.getClientRects()[0];

        if(offset){
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

            if(this.resizeTimer){
                clearTimeout(this.resizeTimer);
            }

            this.resizeTimer = setTimeout(this.redraw.bind(this), 50);
        }
    };


    XMLineChart.prototype.findHitXaxis = function (mouseX) {
        var grid = this.offset.grid;
        //var gridWidth = grid.x2 - grid.x;
        var gridWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight);
        var xPoint = this.offset.xaxis.point;
        var mouseActiveRadius = this.options.grid.mouseActiveRadius;

        if(mouseX >= grid.x - mouseActiveRadius && mouseX <= grid.x2 + mouseActiveRadius){
            var index = Math.round((xPoint.length-1) / gridWidth * (mouseX - grid.x));

            if(mouseX <= xPoint[index] + mouseActiveRadius && mouseX >= xPoint[index] - mouseActiveRadius){
                return index;
            }
        }
        return null;
    };

    XMLineChart.prototype.findHitItem = function (offset) {
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
                    dataIndex: xIndex
                };
            }
        }

        return null;
    };

    XMLineChart.prototype.destroy = function( ){
        if(this.toolTip){
            this.toolTip.destroy();
        }

        if(this.maxValueTip){
            this.maxValueTip.destroy();
        }

        var list = Object.keys(this);
        for(var ix = 0, ixLen = list.length; ix < ixLen; ix++){
            delete this[list[ix]];
        }
    };

    /**
     *
     * @param mouseX
     * @param mouseY
     * @param seriesFilter
     * @returns {*}
     */
//XMLineChart.prototype.findHitItem = function (mouseX, mouseY, seriesFilter) {
//	var maxDistance = options.grid.mouseActiveRadius;
//	var smallestDistance = maxDistance * maxDistance + 1;
//	var item = null;
//	var foundPoint = false;
//	var ix = null, ixLen = null;
//	var jx = null, jxLen = null;
//	var ps = null;
//
//	//for(var ix = 0, ixLen = series)
//
//	for (i = series.length - 1; i >= 0; --i) {
//		if (!seriesFilter(series[i]))
//			continue;
//
//		var s = series[i],
//			axisx = s.xaxis,
//			axisy = s.yaxis,
//			points = s.datapoints.points,
//			mx = axisx.c2p(mouseX), // precompute some stuff to make the loop faster
//			my = axisy.c2p(mouseY),
//			maxx = maxDistance / axisx.scale,
//			maxy = maxDistance / axisy.scale;
//
//		ps = s.datapoints.pointsize;
//		// with inverse transforms, we can't use the maxx/maxy
//		// optimization, sadly
//		if (axisx.options.inverseTransform)
//			maxx = Number.MAX_VALUE;
//		if (axisy.options.inverseTransform)
//			maxy = Number.MAX_VALUE;
//
//		if (s.lines.show || s.points.show) {
//			for (j = 0; j < points.length; j += ps) {
//				var x = points[j], y = points[j + 1];
//				if (x == null)
//					continue;
//
//				// For points and lines, the cursor must be within a
//				// certain distance to the data point
//				if (x - mx > maxx || x - mx < -maxx ||
//					y - my > maxy || y - my < -maxy)
//					continue;
//
//				// We have to calculate distances in pixels, not in
//				// data units, because the scales of the axes may be different
//				var dx = Math.abs(axisx.p2c(x) - mouseX),
//					dy = Math.abs(axisy.p2c(y) - mouseY),
//					dist = dx * dx + dy * dy; // we save the sqrt
//
//				// use <= to ensure last point takes precedence
//				// (last generally means on top of)
//				if (dist < smallestDistance) {
//					smallestDistance = dist;
//					item = [i, j / ps];
//				}
//			}
//		}
//
//		if (s.bars.show && !item) { // no other point can be nearby
//
//			var barLeft, barRight;
//
//			switch (s.bars.align) {
//				case "left":
//					barLeft = 0;
//					break;
//				case "right":
//					barLeft = -s.bars.barWidth;
//					break;
//				default:
//					barLeft = -s.bars.barWidth / 2;
//			}
//
//			barRight = barLeft + s.bars.barWidth;
//
//			for (j = 0; j < points.length; j += ps) {
//				var x = points[j], y = points[j + 1], b = points[j + 2];
//				if (x == null)
//					continue;
//
//				// for a bar graph, the cursor must be inside the bar
//				if (series[i].bars.horizontal ?
//						(mx <= Math.max(b, x) && mx >= Math.min(b, x) &&
//						my >= y + barLeft && my <= y + barRight) :
//						(mx >= x + barLeft && mx <= x + barRight &&
//						my >= Math.min(b, y) && my <= Math.max(b, y)))
//					item = [i, j / ps];
//			}
//		}
//	}
//
//	if (item) {
//		i = item[0];
//		j = item[1];
//		ps = series[i].datapoints.pointsize;
//
//		return { datapoint: series[i].datapoints.points.slice(j * ps, (j + 1) * ps),
//			dataIndex: j,
//			series: series[i],
//			seriesIndex: i };
//	}
//
//	return null;
//};

//////////////////////////////////////////////////// UTIL ////////////////////////////////////////////////////
    XMLineChart.prototype.toFixed = function(number, point) {
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

    XM.cls['XMLineChart'] = XMLineChart;
})(window.EXEM);
