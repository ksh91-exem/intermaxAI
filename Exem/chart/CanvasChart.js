/**
 * @param arg(Object)
 * @returns {BaseCanvasChart}
 * @author hwan
 *
 *  dependent JQuery, jquery.flot.js
 *
 *  chart color, type,
 */

Ext.define('Exem.chart.CanvasChart', {
    extend: 'Ext.container.Container',
    layout: 'fit',
    height: '100%',
    width: '100%',
    flex: 1,
    firstShowXaxis: false,
    firstShowYaxis: false,
    showHistoryInfo: true,
    showMaxValue: true,                         // 시리즈 중 최고 높은 값을 표시해준다.(pie 차트는 적용되지 않는다)
    maxValueFormat: '%y',                       // 최고 높은 값을 어떻게 표시할지 설정 ex) [%s] %x : %y  (%s = series name, %x = x축 값, %y = y축 값)
    maxValueAxisTimeFormat: '%H:%M',            // 최고 높은 값의 팁 표시중 X 축이나 Y 축 값이 Time값일 경우 Time Format 설정
    showIndicator: false,                       // 차트 더블클릭시 해당 지점에 라인 생성 설정 default: false
    indicatorLegendFormat: '%y',                // indicator에 x,y축 값 힌트를 어떻게 표시할지 설정 ex) %x : %y  (%x = x축 값, %y = y축 값. series name 은 표시하지 않는다)
    indicatorLegendAxisTimeFormat: '%H:%M',     // indicator X 축이나 Y 축 값이 Time 값일 경우 Time Format 설정

    /*
     %a: weekday name (customizable)
     %b: month name (customizable)
     %d: day of month, zero-padded (01-31)
     %e: day of month, space-padded ( 1-31)
     %H: hours, 24-hour time, zero-padded (00-23)
     %I: hours, 12-hour time, zero-padded (01-12)
     %m: month, zero-padded (01-12)
     %M: minutes, zero-padded (00-59)
     %q: quarter (1-4)
     %S: seconds, zero-padded (00-59)
     %y: year (two digits)
     %p: am/pm
     %P: AM/PM (uppercase version of %p)
     %w: weekday as number (0-6, 0 being Sunday)
     */
    showTooltip: true,                          // 차트 마우스 오버시 툴팁 설정 default: true
    toolTipFormat: '[%s] %x : %y',
    toolTipTimeFormat: '%H:%M',
    showMultiToolTip: false,
    showContextMenu: true,                     // 차트 context menu 설정 default: false
    // showZoomIn: false,                       // 차트 드레그 선택 영역 zoom in default: false
    mouseSelect: false,                         // 차트 드레그 선택 영역 설정 default: false
    mouseSelectMode: 'x',                       // 차트 드레그 선택시 x축 y축 선택 default: x 축으로만 선택 가능하게
    serieseList : null,                         // 차트 시리즈 리스트
    chartType: null,                            // 차트 옵션
    plot: null,                                 // 차트 객체
    chartTimer: null,                           // 차트 타이머
    chartDuration: 2000,                        // 차트 타이머 주기
    interval: PlotChart.time.exSecond,          // 차트 간격 default: 60초
    fillIntervalValue: false,
    fillValue: null,                           // 차트 공백 채울 시 대입되는 값
    chartProperty: null,
    dataBufferSize: null,                       // 차트 데이터 사이즈 설정( 설정 시 addValue 를 사용하여 데이터를 넣게 되면 버퍼 이상의 데이터가 쌓였을 경우 자동으로 삭제한다)
    highLighHold : false,                       // 차트 영역중 빈 공간을 클릭 하였을 때 highlight 를 유지 할 것인지에 대한 설정
    orderByTime: false,                         // true 일 경우 addValue 로 데이터를 넣었을 때 타임 순선대로 정렬해서 넣는다.
    imageCaptureDom: null,                      // context menu의 save image 를 했을때 캡쳐 되는 범위

    chartLineWidth: 3,                          // 차트 그릴때 line width 설정

    plotclick: null,
    plothover: null,
    plotdblclick: null,
    plotselection: null,
    plotYLabelClick: null,
    plotYLabelRightClick: null,

    historyInfoDblClick: null,

    realTimeChart: false,                       // 실시간 차트 설정
    realDataLength: null,                       // 실시간 차트 데이터 길이
    maxOffSet: null,                            // 시리즈 중 최고 값 좌표
    minOffSet: null,                            // 시리즈 중 최저 값 좌표
    xaxisCurrentToTime: false,                  // x축 데이터가 타임일때 지정된 totime 시간까지 데이터를 표시할건지에 대한 설정 (false: totime - interval , true: totime)
    timeBrush: null,
    selectionZoom: false,                                // plotselection 이벤트가 발생할때 자동으로 줌을 할건지에 대한 설정

    showDayLine: true,                          // 하루 단위의 선을 긋는 옵션
    showXAxis : true,
    showYAxis : true,
    showBarNotice : true,
    showBaseLine : false,

    defaultBaseLine : 95,

    fixedWidth: false,                          // bar chart 사용 시 최소 bar width 를 설정하기 위한 옵션
    fixedWidthValue: 20,                         // bar chart 상용 시 최소 bar width 값

    onIndexValue   : false,                     // index 로 add 하기 위한 구분 값
    standardSeries : 0,                          // 기준이 되는 시리즈 인덱스

    _isStack: false,                            // 차트가 stack 차트로 그려지는지 확인 플레그
    _isFirstFlag: true,                         // 차트 생성시 처음 한번만 실행되게 하는 플레그
    _chartTarget: null,                         // 차트 타겟
    _chartOption: null,                         // 차트 옵션( 내부적으로 쓰는 옵션 )
    _chartContainer: null,                      // 메인 차트 컨테이너
    //_stackArrTemp: {},                          // stack 차트일경우 전체 시리즈 인덱스 별 합을 가지고 있는 변수
    _toolTipTimer: null,
    _dayDiff: null,
    _monthDiff: null,
    _visibleList : null,
    _longClickedTimer : null,
    _dependentChart: null,
    _lineWidth: 0.5,
    _ignoreEvent: false,

    onZooming : false,

    constructor: function(config) {
        this.callParent(arguments);
        this.initConfig(config);

        this.initProperty();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });

        this._chartContainer = Ext.create('Ext.container.Container', {
            layout: 'border',
            height: '100%',
            width: '100%',
            flex: 1,
            style: {
                'background-color': '#fff'
            }
        });

        this.chartLayer = this._chartContainer;
        this.add(this._chartContainer);

        this._chartTarget = '#' + this._chartContainer.id;

        this.initChartOption();

        //this.addListener('render', function(){
        //    this.el.dom.addEventListener('contextmenu', function(e){ e.preventDefault();});
        //    this.el.dom.addEventListener('mousedown', function(e){
        //        this._longClickedTimer = setTimeout(function(self, e){
        //            self.contextMenu.showAt([e.pageX, e.pageY]);
        //        }, 1000, this, e);
        //
        //    }.bind(this));
        //
        //    this.el.dom.addEventListener('mouseup', function(e){
        //        clearTimeout(this._longClickedTimer);
        //    }.bind(this));
        //
        //    this.el.dom.addEventListener('mousemove', function(e){
        //        clearTimeout(this._longClickedTimer);
        //    }.bind(this));
        //});

        this.addListener('afterlayout', this.afterlayoutEvent);

        this.addListener('destroy', function() {
            if (this.$toolTip) {
                this.$toolTip.remove();
            }

            if (this.indicatorLegend) {
                this.indicatorLegend.remove();
            }

            this._removeMaxValueTip();

            if (this.loadingMask) {
                this.loadingMask.destroy();
                this.loadingMask = null;
            }

            Ext.destroy(this.contextMenu);
            Ext.destroy(this.visibleSeriesMenu);
            Ext.destroy(this.historyInfoMenu);
            if (this.plot != null) {
                this.plot.shutdown();
            }
        });

        this.requestAnimationFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function(callback) {
                return setTimeout(callback, 1);
            };
    },

    afterlayoutEvent: function() {
        this._$chartTarget = $(this._chartTarget);
        this._chartOption.xaxis.show = this.firstShowXaxis;
        this._chartOption.yaxis.show = this.firstShowYaxis;
        this.plotDraw();
        this.plotChartEvent();
        this._chartOption.xaxis.show = this.chartType.xaxis;
        this._chartOption.yaxis.show = this.chartType.yaxis;

        this._isFirstFlag = false;

        this.removeListener('afterlayout', this.afterlayoutEvent);
    },
    /**
     * object 로 정의될 프로퍼티들을 초기화 하는 함수
     */
    initProperty: function() {
        this.serieseList = [];
        this._visibleList = [];

        this._dependentChart = [this];

        this.maxOffSet = {
            x: -1,
            y: -1,
            s: null,
            index: 0
        };

        this.minOffSet = {
            x: 0,
            y: 0,
            s: ''
        };

        this.chartType = {
            colors : ['#15679a', '#43bcd7', '#e76627', '#BCF061', '#A8A5A3', '#498700', '#832C2D', '#C98C5A', '#3478BE','#5C8558', '#B26600', '#27358F', '#A4534D', '#B89630', '#A865B4', '#254763', '#536859', '#E9F378', '#888A79', '#D67D4B', '#2BEC69' ,'#4A2BEC', '#2BBEEC', '#DDACDF'],
            // colors : ['#4F74C4', '#72B43C', '#9D6734', '#05a0b1', '#6F4BC3', '#3D4D19',"#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed", '#ff0000', '#000000', '#536859', '#E9F378', '#888A79', '#D67D4B', '#2BEC69' ,'#4A2BEC', '#2BBEEC', '#DDACDF'],

            xaxis: true,
            xMin: null,
            xMax: null,
            xTickLength: 0,
            xTicks: null,
            xLabelFont: null,
            xTransform: null,
            xTickFormat : function(val, axis) {
                var date = new Date(val);
                var day = common.Util.lPad(date.getDate(), '0', 2);
                var month = common.Util.lPad(date.getMonth() + 1, '0', 2);
                var timeFormat = this._chartOption.xaxis.timeformat;
                var text = '';
                ///var height = this.chartLayer.getHeight() - 10;
                ///var vLineStyle = 'width: 0px;height: ' + height + 'px;display: block;position: absolute;top:-' + height + 'px;border: 1px dashed #ccc;left: 30px;';

                // 한달간 표시는 from  - to 가 28일 이상일때 한다.
                if (timeFormat.indexOf('%m') > -1 && axis.datamax - axis.datamin > 1000 * 60 * 60 * 24 * 28 && (this._monthDiff == null || this._monthDiff != month)) {
                    timeFormat =  timeFormat.replace('%m', '<span style="font-weight: bold;color: #000;font-size: 10px;position: absolute;left: -36px;">' + month + '-</span>');
                    this._monthDiff = month;
                }

                if (timeFormat.indexOf('%d') > -1) {
                    if (this._dayDiff == null || timeFormat.length == 2) {
                        //timeFormat =  timeFormat.replace('%d', '<span style="visibility:hidden;">' + day + '</span>');
                        timeFormat =  timeFormat.replace('%d', '<span>' + day + '</span>');
                        this._dayDiff = day;
                    } else if (this._dayDiff != day) {
                        // timeFormat =  timeFormat.replace('%d', '<span style="font-weight: bold;color: #000;font-size: 10px;position: absolute;left: -18px;">' + day + '<span style="' + vLineStyle + '"></span></span>');
                        timeFormat =  timeFormat.replace('%d', '<span style="font-weight: bold;color: #000;font-size: 10px;position: absolute;left: -18px;">' + day + '</span>');
                        this._dayDiff = day;
                    } else {
                        timeFormat =  timeFormat.replace('%d', '<span style="visibility:hidden;">' + day + '</span>');
                    }
                }

                text += $.plot.formatDate(new Date(val), timeFormat);

                return text;
            }.bind(this),
            timezone: 'browser',
            yaxis: true,
            yaxes: null,
            yLabelWidth: null,
            yMin: 0,
            yMax: null,
            yPosition: 'left',
            yTickLength: null,
            yTickFormat: function(val) {
                if (this._chartOption.yaxis.mode != null) {
                    return;
                }

                var prefix = d3.formatPrefix(val),
                    number;

                if (Math.abs(val) >= 1000) {
                    number = prefix.scale(val) + '';
                    if (number.indexOf('.') > 0) {
                        number = prefix.scale(val).toFixed(2);
                    }

                    return number + prefix.symbol;
                } else {
                    return common.Util.numberWithComma(common.Util.numberFixed(val, 2));
                }

            }.bind(this),
            lineWidth: 1,
            yLabelFont: null,
            fill: true,
            bar_width: .5,
            scatter_radius: 1.5,
            pie: false,
            pie_radius: 'auto',
            pie_innerRadius: 0,
            combine: {
                threshold: 0.1
            },
            shadow: false,
            mode: 'time',
            yMode: null,
            timeformat: '%d %H:%M',
            borderWidth: {
                top: 0,
                right: 0,
                bottom: 1,
                left: 1
            },
            borderColor : null,
            gridColor: '#ccc',
            autoHighlight: true
        };

        $.extend(this.chartType, this.chartProperty || {});

        this._chartOption = {};
    },

    /**
     * 차트에서 쓰일 기본 옵션을 정의
     * 사용자가 xmOption 에서 주어진 값을 대입하여 option 값을 생성한다.
     * @param opt
     */
    initChartOption: function() {
        this._chartOption.series = {
            lines: {
                show: false
            },
            bars: {},
            shadowSize: 0,
            highlightColor: this.chartType.highlightColor
        };

        this._chartOption.colors = this.chartType.colors;

        this._chartOption.legend = {
            show: false
        };

        this._chartOption.xaxis = {
            show: this.chartType.xaxis,
            mode: this.chartType.mode,
            min: this.chartType.xMin,
            max: this.chartType.xMax,
            ticks: this.chartType.xTicks,
            timezone: this.chartType.timezone,
            timeformat: this.chartType.timeformat,
            tickSize: this.chartType.xticksize,
            tickLength: this.chartType.xTickLength,
            // autoscaleMargin: 0.2,
            font: this.chartType.xLabelFont,
            transform : this.chartType.xTransform,
            tickFormatter : this.chartType.xTickFormat,
            inverseTransform: this.chartType.xInverseTransform
        };

        this._chartOption.yaxis = {
            show: this.chartType.yaxis,
            min: this.chartType.yMin,
            max: this.chartType.yMax,
            font: this.chartType.yLabelFont,
            mode: this.chartType.yMode,
            autoscaleMargin: 0.3,
            // tickSize: this.option.yticksize,
            tickLength: this.chartType.yTickLength,
            labelWidth: this.chartType.yLabelWidth,
            position: this.chartType.yPosition,
            transform: this.chartType.yTransform,
            tickFormatter : this.chartType.yTickFormat,
            inverseTransform: this.chartType.yInverseTransform
        };

        if (this.chartType.yaxes) {
            this._chartOption.yaxes = this.chartType.yaxes;
        }

        if (this.chartType.xLabelWidth != null) {
            this._chartOption.xaxis.labelWidth = this.chartType.xLabelWidth;
        }

        this._chartOption.grid = {
            // margin: 1,
            hoverable: true,
            clickable: true,
            // markings: true,
            autoHighlight: this.chartType.autoHighlight,
            borderWidth: this.chartType.borderWidth,
            borderColor: this.chartType.borderColor,
            color: this.chartType.gridColor
        };

        if (this.mouseSelect || this.showZoomIn) {
            this._chartOption.selection = {
                mode: this.mouseSelectMode
            };
        }

        if (this.showContextMenu) {
            this._createContenxtMenu();
        }


    },

    _initTimeTick: function() {
        if (this.interval == null || this.serieseList == null || this.serieseList.length == 0 || this.plot == null || this.chartType.xTicks != null) {
            return;
        }

        //var canvasWidth = this.plot.width();
        var canvasWidth = this.plot.getCanvas().width;
        var ticks = [];
        var ticksLength = canvasWidth / (this._chartOption.xaxis.timeformat.length * 12);             // 한글자당 12px로 본다
        var inc = 1;
        var xAxisInfo = this._xAxisMaxRange();



        if (!xAxisInfo || canvasWidth <= 0 || ticksLength <= 0) {
            this._chartOption.xaxis.ticks = null;
            return;
        }

        var distince = xAxisInfo.max - xAxisInfo.min;
        var labelCount = distince / this.interval;
        var i;

        if (ticksLength > labelCount) {
            for (i = 0; i <= labelCount; i = i + inc) {
                ticks.push(xAxisInfo.min + (i * this.interval));
            }
        } else {
            inc = Math.ceil(labelCount / ticksLength);

            for (i = 0; i <= labelCount; i = i + inc) {
                ticks.push(xAxisInfo.min + (i * this.interval));
            }
        }

        this._chartOption.xaxis.ticks = ticks;
    },

    _initIndexTicks: function() {
        if (this.interval == null || this.serieseList == null || this.serieseList.length == 0 || this.plot == null) {
            return;
        }

        var stdSeries = this.serieseList[this.standardSeries];

        if (stdSeries == null || stdSeries.ticks == null || stdSeries.ticks.length == 0) {
            return;
        }

        var canvasWidth = this.plot.width();
        var ticks = stdSeries.ticks;
        var ticksLength = canvasWidth / this._chartOption.xaxis.timeformat.length * 13;
        var inc = Math.ceil(ticks.length / ticksLength);
        var xaxisTicks = [], prevXaxisData, currXaxisData,
            ix, ixLen;
        for (ix = 0, ixLen = ticks.length; ix < ixLen; ix += inc) {
            if (ticks[ix] != null) {
                currXaxisData = $.plot.formatDate(new Date(ticks[ix]), this._chartOption.xaxis.timeformat);
                if (prevXaxisData != currXaxisData) {
                    xaxisTicks.push([ix, currXaxisData]);
                    prevXaxisData = currXaxisData;
                }

            }
        }
        //
        //var distince = new Date(ticks[0]).setMilliseconds(0) - new Date(ticks[ticks.length - 1]).setMilliseconds(0);
        //var labelCount = distince / ticksLength;
        //
        //if(ticksLength > labelCount){
        //    for(var i = 0 ; i <= labelCount ; i = i + inc){
        //        ticks.push(xAxisInfo.min + (i * this.interval));
        //    }
        //}else{
        //    inc = Math.ceil(labelCount / ticksLength);
        //
        //    for(var i = 0 ; i <= labelCount ; i = i + inc){
        //        ticks.push(xAxisInfo.min + (i * this.interval));
        //    }
        //}

        this._chartOption.xaxis.ticks = xaxisTicks;
        xaxisTicks = null;
    },

    _xAxisMaxRange: function() {
        var seriesList = this.serieseList;
        var i = 0, seriesLen = seriesList.length;

        var result = null;

        if (this.isZoomIn) {
            result = {
                min: this._dateIntervalInit(this._chartOption.xaxis.min, this.interval),
                max: this._dateIntervalInit(this._chartOption.xaxis.max, this.interval)
            };
        } else {
            if (this.fromTime && this.toTime) {
                result = {
                    min: this.fromTime,
                    max: this.toTime
                };
            } else if (this._chartOption.xaxis.min && this._chartOption.xaxis.max) {
                result = {
                    min: this._chartOption.xaxis.min,
                    max: this._chartOption.xaxis.max
                };
            } else if (seriesLen > 0) {
                for (i; i < seriesLen; i++) {
                    if (seriesList[i].data.length > 0) {
                        if (result == null) {
                            result = {
                                min: seriesList[i].data[0][0],
                                max: seriesList[i].data[seriesList[i].data.length - 1][0]
                            };
                        } else {
                            result.min = Math.min(seriesList[i].data[0][0], result.min);
                            result.max = Math.max(seriesList[i].data[seriesList[i].data.length - 1][0], result.max);
                        }
                    }
                }
            }
        }

        return result;
    },

    /**
     * CanvasChat 객체 생성시 context menu 생성
     * 기본적으로 series visable, history 기능 포함
     * pie 차트 이거나 axis mode 가 categories 인경우 생성 안함
     */
    _createContenxtMenu: function() {
        if (this._type == 'pie' || this._chartOption.xaxis.mode == 'categories' || this._chartOption.xaxis.mode == 'categories') {
            return;
        }

        this.contextMenu         = Ext.create('Exem.ContextMenu');
        this.visibleSeriesMenu   = Ext.create('Exem.ContextMenu');

        this._addSubMenu(this.historyInfoMenu, 'All', this.openHistoryInfo, '', this);

        // this.contextMenu.addItem({
        //   title: 'VisibleSeries',
        //   items: this.visibleSeriesMenu
        // }).setDisableItem(0,false);
        //
        // this.contextMenu.addItem({
        //   title: 'HistoryInfo',
        //   items: this.historyInfoMenu
        // }).setDisableItem(1,false);
        //
        // this.contextMenu.addItem({
        //   title: 'Chart Minimum Value Zero',
        //   items: this.historyInfoMenu
        // }).setDisableItem(1,false);

        // 이미지 캡쳐
        this.contextMenu.addItem({
            title    : common.Util.TR('Save Image'),
            target   : this,
            fn       : function() {
                html2canvas( (this.imageCaptureDom && this.imageCaptureDom.el.dom) || this.el.dom,
                    {
                        // Canvas 로 복사 완료 이벤트
                        onrendered: function(canvas) {
                            procDownloadImg( canvas.toDataURL()  );
                        }

                    });
            }.bind(this)
        }, 0);

        // 전체 이미지 캡쳐
        this.contextMenu.addItem({
            title    : common.Util.TR('Image Capture'),
            target   : this,
            fn       : function() {
                html2canvas(document.body, {
                    onrendered: function(canvas) {
                        // Crop Window 를 팝업 시킨다.

                        var cropWindow = Ext.getCmp('cropimage_window');
                        if (!cropWindow) {
                            cropWindow = new Ext.create('pa.layout.cropimage.window',{
                                original_image: canvas.toDataURL()
                            });
                        }
                        //  console.debug( canvas.toDataURL() );

                        // 캡춰한 이미지 던짐
                        // cropWindow.setImage( canvas.toDataURL() );
                        // 팝업 띄움.
                        cropWindow.show();
                    }
                });
            }.bind(this)
        }, 1);

        this.addListener('render', function() {
            this.contextMenu.showAtToOwner(this);
        });
    },
    /**
     * CanvasChart 객체 생성 후 context menu 생성
     * 이미 생성 되어 있으면 만들지 않는다
     */
    createContextMenu: function() {
        if (this.contextMenu) {
            this.contextMenu = Ext.create('Exem.ContextMenu');
            this.visibleSeriesMenu = Ext.create('Exem.ContextMenu');
            this.historyInfoMenu = Ext.create('Exem.ContextMenu');

            if (this._type == 'pie' || this._chartOption.xaxis.mode == 'categories' || this._chartOption.xaxis.mode == 'categories') {
                return;
            }

            this._addSubMenu(this.historyInfoMenu, 'All', this.openHistoryInfo, '', this);

            this.contextMenu.addItem({
                title: 'VisibleSeries',
                items: this.visibleSeriesMenu
            }).addItem({
                title: 'HistoryInfo',
                items: this.historyInfoMenu
            });

            this.contextMenu.showAtToOwner(this);

            this._createSubMenuList();
        }
    },

    addVisibleSeries: function(name) {
        if (this.visibleSeriesMenu) {
            this.visibleSeriesMenu.addItem({
                title: name,
                icon: '/intermax/images/series_on.png',
                fn: this.setSeriesVisible,
                target: this
            });

            if (this.visibleSeriesMenu.itemList.length) {
                this.contextMenu.setDisableItem(0, true);
            }
        }
    },

    _addSubMenu: function(obj, title, fn, icon, target) {
        if (obj) {
            obj.addItem({
                title: title,
                icon: icon,
                fn: fn,
                target: target
            });

            if (obj.itemList.length) {
                this.contextMenu.setDisableItem(obj.index, true);
            }
        }
    },

    _createSubMenuList: function() {
        if (this.visibleSeriesMenu) {

            for (var i = 0; i < this.serieseList.length; i++) {
                this.visibleSeriesMenu.addItem({
                    title: this.serieseList[i].label,
                    fn: this.setSeriesVisible,
                    target: this
                });

                this.historyInfoMenu.addItem({
                    title: this.serieseList[i].label,
                    fn: this.historyInfo,
                    target: this
                });
            }
        }
    },

    /**
     * plot 에서 필요한 형태의 데이터로 가공 되어 리턴한다.
     * @returns {Array}
     *  ex) [[x,y], [x,y], [x,y]]
     */
    getPlotData: function() {
        var serieseList = this.serieseList;

        var data = [];
        var seriesType = null;
        var totalDataLength = 0;

        if (this.isZoomIn) {
            this.zoomMaxValue();
            this._chartOption.yaxis.max = this.maxOffSet.y * 1.3;
        } else {
            this._chartOption.yaxis.max = this.chartType.yMax;
        }

        for (var i = 0, iLen = serieseList.length; i < iLen; i++) {
            if (!serieseList[i].visible) {
                continue;
            }

            if (serieseList[i].data) {
                totalDataLength += serieseList[i].data.length;
            }

            if (!serieseList[i].color) {
                serieseList[i].color = this._chartOption.colors[i];
            }


            seriesType = serieseList[i][serieseList[i].type];

            if (serieseList[i].stack) {
                seriesType.fill = 0.3;
                // serieseList[i].fill = true;
                // seriesType.stack = true;
                seriesType.type = serieseList[i].type;
            }

            if (serieseList[i].point) {
                serieseList[i].points = {
                    show: true,
                    fill: true,
                    fillColor: '#fff',
                    //lineWidth: 1,
                    lineWidth: this._lineWidth,
                    radius: serieseList[i].pointSize ? serieseList[i].pointSize : 3
                };
            }

            // if(serieseList[i].show){
            //    seriesType.show = true;
            // }else{
            //    seriesType.show = false;
            // }


            if (serieseList[i].type == PlotChart.type.exBar && this.plot) {
                if (this._isStack) {
                    seriesType.lineWidth = 0;
                    seriesType.fill = 1;
                }

                // if(serieseList[i].data.length < 5){
                //    if(seriesType.horizontal){
                //        this._chartOption.xaxis.autoscaleMargin = 0.3;
                //        this._chartOption.yaxis.autoscaleMargin = 3;
                //    }else{
                //        this._chartOption.xaxis.autoscaleMargin = 3;
                //        this._chartOption.yaxis.autoscaleMargin = 0.3;
                //    }
                // }else{
                //    if(seriesType.horizontal){
                //        this._chartOption.xaxis.autoscaleMargin = 0.15;
                //        this._chartOption.yaxis.autoscaleMargin = 0;
                //    }else{
                //        this._chartOption.xaxis.autoscaleMargin = 0;
                //        this._chartOption.yaxis.autoscaleMargin = 0.15;
                //    }
                // }

                if (seriesType.horizontal) {
                    this._chartOption.xaxis.autoscaleMargin = 0.3;
                    this._chartOption.yaxis.autoscaleMargin = 0;
                } else {
                    this._chartOption.xaxis.autoscaleMargin = 0;
                    this._chartOption.yaxis.autoscaleMargin = 0.3;

                    seriesType.barWidth = this.chartType.bar_width > 1 ? this.chartType.bar_width : (this.chartType.mode == 'time' ? (this.interval ? this.interval * 0.7 : 24 * 60 * 60 * this.chartType.bar_width) : (this.chartType.bar_width));
                }

                if (this._isOrder) {
                    //this._chartOption.xaxis.axisLabelUseCanvas = true;
                    if (this.chartType.bar_width > 1) {
                        seriesType.barWidth = this.chartType.bar_width;
                    } else {
                        if (this.chartType.mode == 'time') {
                            seriesType.barWidth = this.interval * 0.7 / iLen;
                            seriesType.align = 'left';
                        } else if (this.chartType.mode == 'categories' || this.chartType.yMode == 'categories') {
                            seriesType.barWidth = this.chartType.bar_width / iLen ;
                        }

                        if (this._chartOption.xaxis.min) {
                            this._chartOption.xaxis.min = this._xaxisMin - seriesType.barWidth;
                        }

                        if (this._chartOption.xaxis.max) {
                            this._chartOption.xaxis.max = this._xaxisMax + seriesType.barWidth;
                        }
                    }

                    //seriesType.barWidth = this.chartType.bar_width > 1 ? this.chartType.bar_width : (this.chartType.mode == 'time' ? (this.interval ? (this.interval * 0.7 / iLen - 10 ) : (24 * 60 * 60 * this.chartType.bar_width / iLen - 10)) : (this.chartType.bar_width / iLen - 10));
                    //seriesType.align = 'left';
                } else {
                    if (serieseList[i].data.length > 0) {
                        if (this._chartOption.xaxis.min) {
                            this._chartOption.xaxis.min = this._xaxisMin - seriesType.barWidth / 2 || 0;
                        }

                        if (this._chartOption.xaxis.max) {
                            this._chartOption.xaxis.max = this._xaxisMax + seriesType.barWidth / 2 || 0;
                        }
                    }
                }

            }

            if (serieseList[i].type != PlotChart.type.exLine) {
                this._chartOption.xaxis.tickFormatter = null;
            }

            // if(serieseList[i].fill){
            //    serieseList[i][serieseList[i].type].fill = true;
            // }else{
            //    serieseList[i][serieseList[i].type].fill = serieseList[i].type.fill || false;
            // }
            data.push(serieseList[i]);
        }

        if (totalDataLength > 0) {
            this._chartOption.xaxis.show = this.chartType.xaxis;
        } else {
            this._chartOption.xaxis.show = false;
        }
        this._totalDataLength = totalDataLength;
        return data;
    },

    /**
     * 해당 series에 직접 데이터 지정
     * @param index series index or id
     * @param data
     */
    setData: function(index, data) {
        var i = 0, len;
        var series = this.getSeries(index);

        // if(this._type == PlotChart.type.exBar && this._isHorizontal){
        //    data.reverse();
        // }

        series.data = data;

        if (this.showMaxValue) {
            if (this._isStack) {
                return;
            }

            this.initMaxValue();

            for (i, len = data.length; i < len; i++) {
                // pie 차트 형식의 데이터입력을 제외하고
                if (Array.isArray(data[i])) {
                    this.setMaxValue(data[i][0], data[i][1], series, i);
                }
            }
        }

    },

    initMaxValue: function() {
        this.maxOffSet.x = -1;
        this.maxOffSet.y = -1;
        this.maxOffSet.s = null;
        this.maxOffSet.index = 0;
        this.maxOffSet.seriesIndex = 0;
        this.maxOffSet.yaxis = null;
    },

    setMaxValue: function(x, y, series, index) {
        if (!series.visible) {
            return;
        }

        if (this._isHorizontal) {
            // horizontal
            if (x != null && +x > this.maxOffSet.x) {
                this.maxOffSet.x = +x;
                this.maxOffSet.y = y;
                this.maxOffSet.s = series.lebel || series.id;
                this.maxOffSet.index = index;
                this.maxOffSet.seriesIndex = series.seriesIndex || 0;
                if (series.yaxis) {
                    this.maxOffSet.yaxis = series.yaxis;
                }
            }
        } else {
            // vertical
            if (y != null && +y > this.maxOffSet.y) {
                if (this._chartOption.xaxis.mode === 'time') {
                    if (this._chartOption.xaxis.max != null && this._chartOption.xaxis.min != null) {
                        if (x > this._chartOption.xaxis.max || x < this._chartOption.xaxis.min) {
                            return;
                        }
                    }
                }
                this.maxOffSet.x = x;
                this.maxOffSet.y = +y;
                this.maxOffSet.s = series.lebel || series.id;
                this.maxOffSet.index = index;
                this.maxOffSet.seriesIndex = series.seriesIndex || 0;
                if (series.yaxis) {
                    this.maxOffSet.yaxis = series.yaxis;
                }
            }
        }
    },

    zoomMaxValue: function() {
        //var data = this.plot.getData();
        var data = this.serieseList;
        var stackArrTemp = {};
        var i = null;
        var j = null;
        var seriesLen = null;
        var dataLen = null;

        this.initMaxValue();
        var time = null,
            max  = null;

        if (this._isStack) {
            if (data[0].bars ? data[0].bars.horizontal : false) {
                for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                    for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {
                        if (stackArrTemp[data[i].data[j][1]]) {
                            stackArrTemp[data[i].data[j][1]].x += (+data[i].data[j][0]);
                        } else {
                            stackArrTemp[data[i].data[j][1]] = {
                                x : +data[i].data[j][0],
                                y : data[i].data[j][1],
                                index: j
                            };
                        }
                    }
                }
                max = _.max(stackArrTemp, function(obj) {
                    return obj.x;
                });
            } else {
                for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                    for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {
                        time = data[i].data[j][0];
                        if (this._chartOption.xaxis.min > time || this._chartOption.xaxis.max < time) {
                            continue;
                        }

                        if (stackArrTemp[time]) {
                            stackArrTemp[time].y += +data[i].data[j][1];
                        } else {
                            stackArrTemp[time] = {
                                x : time,
                                y : data[i].data[j][1],
                                index: j
                            };
                        }
                    }
                }
                max = _.max(stackArrTemp, function(obj){
                    return obj.y;
                });
            }

            this.maxOffSet.x = max.x;
            this.maxOffSet.y = max.y;
            this.maxOffSet.s = '';
            this.maxOffSet.index = max.index;
        } else {
            for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {
                    if (!data[i].visible) {
                        continue;
                    }

                    this.setMaxValue(data[i].data[j][0], data[i].data[j][1], data[i], j);
                }
            }
        }
    },

    getMaxValue: function () {
        var data = this.serieseList;
        var stackArrTemp = {};
        var i = null;
        var j = null;
        var seriesLen = null;
        var dataLen = null;

        this.initMaxValue();
        var time = null;

        if (this._isStack) {
            var max = null;
            if (this._isHorizontal) {
                for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                    if (data[i].visible) {
                        for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {
                            if (stackArrTemp[data[i].data[j][1]]) {
                                stackArrTemp[data[i].data[j][1]].x += (+data[i].data[j][0]);
                            } else {
                                stackArrTemp[data[i].data[j][1]] = {
                                    x: +data[i].data[j][0],
                                    y: data[i].data[j][1],
                                    index: j,
                                    seriesIndex: i
                                };
                            }
                        }
                    }
                }
                max = _.max(stackArrTemp, function(obj) {
                    return obj.x;
                });
            } else {
                for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                    if (!data[i].visible) {
                        for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {
                            time = data[i].data[j][0];
                            if ((this._chartOption.xaxis.min != null && this._chartOption.xaxis.min > time)
                                || (this._chartOption.xaxis.max != null && this._chartOption.xaxis.max < time)) {
                                continue;
                            }

                            if (stackArrTemp[time]) {
                                stackArrTemp[time].y += +data[i].data[j][1];
                            } else {
                                stackArrTemp[time] = {
                                    x: time,
                                    y: +data[i].data[j][1],
                                    index: j,
                                    seriesIndex: i
                                };
                            }
                        }
                    }
                }
                max = _.max(stackArrTemp, function (obj) {
                    return obj.y;
                });
            }

            this.maxOffSet.x = max.x;
            this.maxOffSet.y = max.y;
            this.maxOffSet.s = '';
            this.maxOffSet.index = max.index;
            this.maxOffSet.seriesIndex = max.seriesIndex;
        } else if (this._type == PlotChart.type.exPie) {
            for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                //for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {
                var tmpLen = (data[i].data) ? data[i].data.length : 0;
                for (j = 0; j < tmpLen; j++) {

                    if (!data[i].visible) {
                        continue;
                    }

                    if (Array.isArray(data[i].data)) {
                        this.setMaxValue(data[i].data[0], data[i].data[1], data[i], j);
                    } else {
                        this.setMaxValue(null, data[i].data, data[i], j);
                    }
                }
            }
        } else {
            for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {

                    if (!data[i].visible) {
                        continue;
                    }

                    this.setMaxValue(data[i].data[j][0], data[i].data[j][1], data[i], j);
                }
            }
        }

        return this.maxOffSet;
    },

    getFixedChartOffset: function() {
        if (!this.fixedWidth) {
            return;
        }
        var displayWidth = this.chartWrap.getWidth();
        var displayHeight = this.chartWrap.getHeight();

        var length = 0,
            ix, ixLen;
        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            length = Math.max(this.serieseList[ix].data.length, length);
        }

        var width = (this.fixedWidthValue + 4 ) * length;


        if (width > displayWidth) {
            displayWidth = width;
            displayHeight -= 20; // scroll height;
        }

        return { width: displayWidth, height: displayHeight };
    },

    /**
     * plot 차트를 그리고 이벤트가 등록되어져 있으면 한번만 이벤트를 등록한다.
     */
    plotDraw: function() {
        var offset, $yLabel, timeBrushData;

        if (this._$chartTarget == null || this._$chartTarget.length == 0) {
            return;
        }

        if (this._type != PlotChart.type.exPie && this._chartOption.xaxis.mode == 'time' && this.interval != null) {
            this._dayDiff = null;
            this._monthDiff = null;

            if (this.fixedWidth) {
                offset = this.getFixedChartOffset();
                this.chartLayer.setWidth(offset.width);
                this.chartLayer.setHeight(offset.height); // 20 scroll height
            }

            this._initTimeTick();
        } else if (this.onIndexValue) {
            this._initIndexTicks();
        }

        this.plot = $.plot(this._chartTarget, this.getPlotData(), this._chartOption);

        this.displayXAxis(this.showXAxis);
        this.displayYAxis(this.showYAxis);

        if (this.showMaxValue) {
            this._createMaxValueTip();
        }

        if (this.showIndicator) {
            this.drawIndicator(this.prevIndicatorPos);
        }

        if (this._$barNotice) {
            this._createBarNotice();
        }

        if (this.plotYLabelClick) {
            $yLabel = this._$chartTarget.find('.flot-y-axis');
            if ($yLabel.length > 0) {
                $yLabel.children().on('click', this.plotYLabelClick).addClass('label-active');
            }
        }

        if (this.plotYLabelRightClick) {
            $yLabel = this._$chartTarget.find('.flot-y-axis');
            if ($yLabel.length > 0) {
                $yLabel.children().on('contextmenu', this.plotYLabelRightClick).addClass('label-active');
            }
        }

        if (this.timeBrush && this.plot && this.serieseList.length > 0) {
            timeBrushData = this.plot.getData()[0].data;
            if (timeBrushData.length > 0 ) {
                this.timeBrush.draw(this.fromTime, this.toTime, this.plot.getData()[0].data);
                if (this.isZoomIn) {
                    this.timeBrush.setTimeRange(this.prevZoomFrom, this.prevZoomTo);
                }
            }
        }

        if (this.showDayLine) {
            this._drawDayLine();
        }

        if (this.showBaseLine) {
            this._drawBaseLine();
        }

        if (this._historyInfoBtn && this._totalDataLength > 0) {
            if (this.changeLegendLayout) {
                this.iconLayer.show();
            } else {
                this._historyInfoBtn.show();
            }
        }
    },

    /**
     * 차트의 레이어가 깨질때 다시 그리는 함수
     */
    plotReSize: function() {
        if (!this._$chartTarget || this._$chartTarget.length == 0) {
            return;
        }

        this.plot = $.plot(this._chartTarget, this.getPlotData(), this._chartOption);

        this.displayXAxis(this.showXAxis);
        this.displayYAxis(this.showYAxis);

        if (this.showMaxValue) {
            this._createMaxValueTip();
        }

        if (this.showIndicator) {
            this.drawIndicator(this.prevIndicatorPos);
        }

        if (this._$barNotice) {
            this._createBarNotice();
        }

        var $yLabel;
        if (this.plotYLabelClick) {
            $yLabel = this._$chartTarget.find('.flot-y-axis');
            if ($yLabel.length > 0) {
                $yLabel.children().on('click', this.plotYLabelClick).addClass('label-active');
            }
        }

        if (this.plotYLabelRightClick) {
            $yLabel = this._$chartTarget.find('.flot-y-axis');
            if ($yLabel.length > 0) {
                $yLabel.children().on('contextmenu', this.plotYLabelRightClick).addClass('label-active');
            }
        }

        if (this.showDayLine) {
            this._drawDayLine();
        }

        if (this._historyInfoBtn && this._totalDataLength > 0) {
            if (this.changeLegendLayout) {
                this.iconLayer.show();
            } else {
                this._historyInfoBtn.show();
            }

        }
    },

    /**
     *  이미 그려진 canvas 에서 다시 그린다.
     * @param data  plot 형태의 data를 받아서 다시 그린다. 없으면 가지고 있는 기본 데이터로 다시 그린다.
     */
    plotRedraw: function() {
        if (this.plot) {
            this.plot.setData(this.getPlotData());
            this.plot.setupGrid();
            this.plot.draw();

            this.displayXAxis(this.showXAxis);
            this.displayYAxis(this.showYAxis);

            // if(this.showMaxValue){
            //    this._createMaxValueTip();
            // }
            //
            // if(this.showIndicator){
            //    this.drawIndicator(this.prevIndicatorPos);
            // }
            //
            // if(this._$barNotice){
            //    this._createBarNotice();
            // }
        }
        this._dayDiff = null;
        this._monthDiff = null;
    },

    /**
     *
     * 차트 타입별 옵션을 설정하는 함수
     * bar chart gradient 옵션을 변경함.(top -> bottom 에서 right -> left   flot API 수정: 2500라인, 2962: getColorOrGradient 함수)
     *
     * @param {string} type lines, bars, pie, points, ........ default lines
     * @param {boolean | number} fill
     * @param {number} lineWidth
     * @param {} order
     * @param {number} tilt
     * @param {boolean} pieLabel
     * @param {boolean} pieCombine
     * @param {object} options
     * @return {}
     */
    seriesTypeOption : function(type, fill, lineWidth, order, tilt, pieLabel, pieCombine, options) {
        var obj = null;
        var kind = PlotChart.type;

        switch (type) {
            case kind.exBar :
                this._lineWidth = 0;
                obj = {
                    show: true,
                    fill: 1,
                    order: order,
                    // fillColor: { colors: [ { opacity: 1 }, { opacity: 0.4 }, { opacity: 1 } ] },
                    lineWidth: this._lineWidth,
                    align: 'center',
                    barWidth: this.chartType.bar_width > 1 ? this.chartType.bar_width : (this.chartType.mode == 'time' ? (this.interval ? this.interval * 0.7 : 24 * 60 * 60 * this.chartType.bar_width) : (this.chartType.bar_width))
                    // barWidth: this.chartType.bar_width > 1 ? this.chartType.bar_width : (this.chartType.mode == 'time' ? (24 * 60 * 60 * this.chartType.bar_width) : (this.chartType.bar_width))
                };
                break;
            case kind.exScatter :
                this._lineWidth = 1;
                obj = {
                    show: true,
                    fill: true,
                    fillColor: null,
                    lineWidth: this._lineWidth,
                    radius: 2
                };
                break;

            case kind.exPie :
                obj = {
                    show: true
                };
                this._chartOption.series.pie = {
                    show: true,
                    tilt: tilt ? tilt : 0.3,
                    innerRadius: 30,
                    label: {
                        show: pieLabel ? false : true,
                        radius: 3 / 4,
                        threshold: 0.1,
                        formatter: function(label, series) {
                            return "<div style='overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:12px; text-align:center; padding:2px; color:#000;'>" + label + '<br/>' + Math.round(series.percent) + "%</div>";
                        }
                    },
                    combine: pieCombine ? this.chartType.combine['threshold'] = 0 : this.chartType.combine,
                    // gradient: { colors: [ { brightness: 1.5, opacity: 1 }, { brightness: 0.1, opacity: 0.1 } ] }
                    gradient: {
                        colors: [
                            {opacity: 1},
                            {opacity: 1},
                            {opacity: 0.8},
                            {opacity: 1},
                            {opacity: 1}
                        ],
                        radial: true
                    }
                };

                if (options) {
                    if (options.stroke) {
                        this._chartOption.series.pie.stroke = {
                            color: options.stroke.color || '#FFF',
                            width: options.stroke.width || 1
                        };
                    }
                    if (options.isDisableGradient) {
                        this._chartOption.series.pie.gradient = {};
                    }
                }
                break;

            default:
                this._lineWidth = lineWidth || 1;
                obj = {
                    show: true,
                    fill: fill,
                    // fillColor: { colors: [ { opacity: 0.7 } , { opacity: 0.6 } , { opacity: 0.3 } , { opacity: 0.6 } , { opacity: 0.7 }] },
                    lineWidth: this._lineWidth,
                    type : type
                };
                break;
        }

        return obj;
    },

    /**
     * @param arguments     id is Required!
     *  type:  object
     *   { id: 'id', label : 'label', type: 'type', stack: true || false (default false), cursor: true || false (default false)}
     * @returns index
     */
    addSeries: function() {
        var seriese = this.serieseList,
            param = arguments[0],
            id = '', label = '', type = null;


        id = param.id;
        label = param.label;
        if (id != null) {
            type = param.type || 'lines';
            param.data = [];
            param.show = true;
            param[type] = this.seriesTypeOption(type, param.fill, param.lineWidth, param.order, param.tilt, param.pieLable, param.pieCombine, param.options);
            if (param.visible === null || param.visible === undefined) {
                param.visible = true;
            }

            if (param.hbar) {
                this._isHorizontal = true;
                param[type].horizontal = param.hbar;
            }

            // if(type == PlotChart.type.exLine){
            //    param['points'] = {
            //        show: true,
            //        fill: true,
            //        lineWidth: 1,
            //        radius: 2
            //    };
            // }

            param.seriesIndex = seriese.length;
            seriese.push(param);

            if (!param.color) {
                param.color = this.chartType.colors[seriese.length - 1];
            }

            if (param.order != null) {
                this._isOrder = true;
            }

            if (param.label === common.Util.TR('isAnomaly')) {
                param.normalRangeCnt = 0;
                param.forecastRangeCnt = 0;
            }

        } else {
            console.debug('addSeries', 'id is Required! ex) { id : "id"}');
        }

        if (param.stack) {
            this._isStack = true;
        }

        if (this.contextMenu && type != PlotChart.type.exPie) {
            this._addSubMenu(this.visibleSeriesMenu, label || id, this.setSeriesVisible, '/intermax/images/series_on.png', this);
            this._addSubMenu(this.historyInfoMenu, label || id, this.openHistoryInfo, '', this);
        }

        this._chartType(param.type);

        if (this.showLegend) {
            this.createChartLegend(param.hideLegend);
        }

        return seriese.length - 1;
    },
    // /**
    // * 한 series 에 대한 모든 데이터를 한번에 넣을 경우
    // * @param series series index
    // * @param data   array [[x, y], [x,y], [x,y]....[x,y]]
    // * (x 축이 Time모드일경우 millisecond  date 값으로 넣어야 합니다)
    // */
    // addValues: function(series, data){
    //    var i = 0; data = data || [], len = data.length;
    //    if(this.serieseList[series]){
    //
    //        for(i = 0; i < len ; i++){
    //
    //        }
    //        this.serieseList[series].data = data;
    //    }else{
    //        console.debug('series is not defined!');
    //    }
    // },
    /**
     * series를 모두 추가한 후 초기화 함수를 호출 해야한다.
     * @param endTime 차트가 그려질 시작 시간
     * @param interval 초기화 할 데이터의 간격
     * @param initValue 초기화 할 데이터 값( 없으면 -1 로 초기화)
     * @param seriesIndex 초기화 대상 시리즈( 없으면 전체를 초기화 한다)
     */
    initData: function(endTime, interval, initValue, seriesIndex) {
        var time = +new Date(endTime);
        var i, j = 0;
        var initVal = initValue != undefined ? initValue : -1;

        if (!this.dataBufferSize) {
            console.debug('Error: chart dataBufferSize not defined...');
            return;
        }

        if (seriesIndex != undefined) {
            this.serieseList[seriesIndex].data.length = 0;
            for (i = this.dataBufferSize; i > 0; i--) {
                this.serieseList[seriesIndex].data.push([time - (interval * i), initVal]);
            }
        } else {
            for (i = 0; i < this.serieseList.length; i++) {
                this.serieseList[i].data.length = 0;
                for (j = this.dataBufferSize; j > 0; j--) {
                    this.serieseList[i].data.push([time - (interval * j), initVal]);
                }
            }
        }
    },

    /**
     * 한 series 에 추가적으로 데이터를 넣을 경우
     * dataBufferSize 를 설정한 경우 설정된 버퍼 사이즈 보다 데이터가 클 경우 자동으로 삭제한다.
     * orderByTime 이 설정되어 있는경우 addValue 를 할때마다 X 축 값으로 ASC 으로 정렬을 하게 된다.
     * 시간 값이 정렬되어 들어오지 않을 경우에만 사용 하시길 바랍니다.
     * @param series series index
     * @param data [x, y]
     * @param index data index || default last index
     */
    addValue: function(series, data, index) {
        var horizontal, lastTime, intervalGab,
            ix, ixLen;

        if (this.serieseList[series] && data) {
            horizontal = this.serieseList[series].bars ? this.serieseList[series].bars.horizontal : false;
            if (index == undefined) {
                if (this.fillIntervalValue && this.chartType.mode == 'time') {

                    // 새로 넣을 데이터의 시간과 마지막 들어있는 시간의 차이가 interval 이상차이날 경우 interval 만큼 채워넣는다.
                    if (this.serieseList[series].data.length > 0) {
                        lastTime = this.serieseList[series].data[this.serieseList[series].data.length - 1][0];

                        intervalGab = data[0] - lastTime;

                        if (intervalGab > this.interval) {
                            for (ix = 0, ixLen = (intervalGab / this.interval) - 1; ix < ixLen; ix++) {
                                //this.serieseList[series].data.push([lastTime + ( (ix +1 ) * this.interval ), this._isStack ? 0 : null]);
                                this.serieseList[series].data.push([lastTime + (ix + 1 ) * this.interval, this.fillValue]);
                            }
                        }
                    } else { // 처음 데이터가 없을 경우
                        lastTime = this.fromTime;

                        intervalGab = data[0] - lastTime;

                        for (ix = 0, ixLen = intervalGab / this.interval; ix < ixLen; ix++) {
                            //this.serieseList[series].data.push([lastTime + ( ix  * this.interval ), this._isStack ? 0 : null]);
                            this.serieseList[series].data.push([lastTime + ( ix * this.interval ), this.fillValue]);
                        }
                    }
                }

                index = this.serieseList[series].data.length;
                this.serieseList[series].data[index] = data;

                if (this.orderByTime) {
                    this.serieseList[series].data.sort(function(prev, next) {
                        return prev[0] - next[0];
                    });
                }
            } else {
                this.serieseList[series].data[index] = data;
            }

            if (this.dataBufferSize) {
                if (this.serieseList[series].data.length > this.dataBufferSize) {

                    this.serieseList[series].data.shift();
                    // 최고 값이 버퍼에서 없어질 경우 시리즈의 데이터를 다시 조회 하여 최고 값을 수집한다.
                    if (!this._isStack) {
                        if (+this.serieseList[series].data[0][1] >= this.maxOffSet.y) {

                            this.maxOffSet.y = 0;
                            for (ix = 1, ixLen = this.serieseList[series].data.length; ix < ixLen; ix++) {
                                if (this.serieseList[series].visible) {
                                    this.setMaxValue(this.serieseList[series].data[ix][0], this.serieseList[series].data[ix][1], this.serieseList[series], ix, horizontal);
                                }
                            }
                        }
                    }
                }
            }

            if (!this._isStack) {
                if (this.serieseList[series].visible) {
                    this.setMaxValue(data[0], data[1], this.serieseList[series], index);
                }
            }
        } else {
            console.debug('series is not defined!');
        }
    },

    /**
     * 데이터가 time 으로 정렬되어 들어온다고 가정하자..
     * series 에 처음 데이터는 모두 초기화 null 로 처리
     * @param param {
     *                  from : '2013-01-01 01:01:01',  // or millisecond(1356969661000) or date object
     *                  to   : '2013-01-01 01:01:01',  // or millisecond(1356969661000) or date object
     *                  interval : 60000               // 차트의 데이터 간격 (second) default: 60초
     *                  time : 0,                      // 데이터의 time 값 index (x축 값의 인덱스)
     *                  data : data,                   // 데이터 [[시간, series1 데이터, series2 데이터 ... seriesN 데이터]]
     *                  series: {                      // series id(key) : index (데이터의 y축 값 index)
     *                      (sereis id) : 0,
     *                      (sereis id) : 0,
     *                             .
     *                             .
     *                      (sereis id) : 0
     *                  }
     *              }
     * @returns serieseList
     */
    addValues: function(param) {
        if (!param) {
            console.debug('parameter :', 'parameter is not found');
            return null;
        }

        var from        = param.from,
            to          = param.to,
            time        = param.time,
            interval    = param.interval || this.interval,
            data        = param.data,
            series      = param.series;

        var i = 0, dataLen = 0, index = 0, key = null, t = null, s = null;
        var dataIndex = null;
        // if(!data || data.length == 0){
        //    return;
        // }

        this.initMaxValue();
        // paramter validation check
        if (!from && !to && !time && !series) {
            return null;
        }

        from = this._dateIntervalInit(from, interval, true, 0);
        to = this._dateIntervalInit(to, interval, false, 1);

        this.fromTime = from;
        this.toTime = to;

        if (this._type != PlotChart.type.exPie && !this._isHorizontal) {
            this._setChartRange(from, to);
        }

        dataLen = Math.floor((to - from) / interval);

        var list = Object.keys(series || {}),
            ix, ixLen;
        for (ix = 0, ixLen = list.length; ix < ixLen; ix++) {
            key = list[ix];
            s = this.getSeries(key);

            if (! s) {
                continue;
            }

            index = series[key];

            s.data.length = 0;

            if (time != null && s.type != PlotChart.type.exPie) {
                for (i = 0 ; i <= dataLen; ++i) {
                    // null 로 초기화
                    if (!s.data[i]) {
                        s.data[i] = [from + (i * interval), null];
                    }

                    if (data[i]) {
                        t = this._dateIntervalInit(data[i][time], interval);
                        dataIndex = Math.round((t - from) / interval);
                        s.data[Math.round((t - from) / interval)] = [t, data[i][index]];

                        if (!this._isStack) {
                            //this.setMaxValue(s.data[i][time], s.data[i][index], s, i);
                            this.setMaxValue(t, data[i][index], s, dataIndex);
                        }
                    }
                }
            } else {
                // pie chart
                for (i = 0; i < data.length; i++) {
                    s.data.push(data[0][index]);
                }
            }
        }

        return this.serieseList;
    },

    /**
     * @note xaxis 의 mode 가 null 이어야 한다.
     * @param param
     * [
     *   { seires: seriesIndex, from : time, to: time, interval : interval, data : [ [x, y]....n ] }
     *   .
     *   .
     *   .
     *   n
     * ]
     *
     * interval 은 생략가능 ( default : this.interval )
     *
     * @returns {null}
     */
    addIndexValues: function(param) {
        var interval = null;
        var from = null;
        var to = null;
        var data = null;
        var series = null;

        var ix = null, ixLen = null;
        var jx = null, jxLen = null;

        //this.initMaxValue();
        var ticks = null;
        var dataIndex = null;
        var time = null;
        var tick = null;
        for (ix = 0, ixLen = param.length; ix < ixLen; ix++) {
            series = this.getSeries(param[ix].series);

            if (series) {
                dataIndex = 0;
                from = param[ix].from;
                to = param[ix].to;
                data = param[ix].data;
                interval = param[ix].interval || this.interval;
                from = this._dateIntervalInit(from, interval, true, 0);
                to = this._dateIntervalInit(to, interval, false, 1);

                jxLen = Math.floor((to - from) / interval);
                ticks = [];
                series.data.length = 0;
                for (jx = 0; jx <= jxLen; jx++) {
                    tick = from + (jx * interval);

                    if (data[dataIndex]) {
                        time = data[dataIndex][0];
                        if (isNaN(time) && time != null) {
                            time = new Date(time).setMilliseconds(0);
                        }

                        if (time == tick) {
                            series.data[jx] = [jx, data[dataIndex][1]];

                            this.setMaxValue(jx, data[dataIndex][1], series, jx);

                            dataIndex++;
                        } else {
                            series.data[jx] = [jx, null];
                        }
                    } else {
                        series.data[jx] = [jx, null];
                    }

                    ticks[jx] = tick;
                }

                series.ticks = ticks;
            }
        }
    },

    /**
     * stack 차트 같은경우 인스턴스 마다 데이터 사이즈가 틀리면 제대로 그려지지 않는다.
     * 모든 인스턴스의 데이터 사이즈를 맞추기 위해 빈 시간에 데이터를 끝까지 채워넣는다
     * fromTime, toTime 이 설정 되어 있어야한다.
     * 중간에 있는 데이터는 채워넣지 않는다.
     * xaxis 용
     */
    setFillData: function(nullValue) {
        var ix = null, ixLen = null;
        var jx = null;
        var dataLength = Math.floor((this.toTime - this.fromTime) / this.interval) + 1;
        var seriesData = null;
        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            if (this.serieseList[ix].data.length != dataLength) {
                seriesData = this.serieseList[ix].data;
                for (jx = seriesData.length; jx < dataLength; jx++) {
                    seriesData.push([this.fromTime + ( jx * this.interval), nullValue]);
                }
            }
        }
    },

    /**
     * @note stack 차트 같은 경우 중간중간 데이터가 없으면 정상적인 처리를 못하기 때문에
     * 선택한 시리즈의 시작과 끝 까지 비어있는 데이터를 채워넣는다.
     * x축이 타임일경우만 가능
     */
    setSeriesFillData: function(seriesIndex, nullValue) {
        if (this.fromTime == null || this.toTime == null || this.serieseList[seriesIndex] == null) {
            return;
        }

        var ix, ixLen;
        var series = this.serieseList[seriesIndex];
        var dataLength = Math.floor((this.toTime - this.fromTime) / this.interval) + 1;

        for (ix = 0, ixLen = dataLength; ix < ixLen; ix++) {
            if (series.data[ix] == null || series.data[ix][1] == null) {
                series.data[ix] = [this.fromTime + ( ix * this.interval), nullValue];
            }
        }
    },

    /**
     *
     * @param series 시리즈 인덱스
     * @param dataIndex 데이터 인덱스
     */
    highLight: function(series, dataIndex) {
        if (this._totalDataLength == 0) {
            return;
        }
        var seriesList = this.plot.getData();

        if (!seriesList[series]) {
            console.debug('Error: no series data!');
            return;
        }

        var datapoints = seriesList[series].datapoints;
        var formatLength = datapoints.format.length;
        var index = dataIndex * formatLength;
        var datapoint = datapoints.points.slice(index, index + formatLength);

        if (this._isStack) {
            this._createBarNotice(datapoint, seriesList[series]);
        } else {
            this.plot.highlight(seriesList[series], datapoint);
            this._createBarNotice(datapoint, seriesList[series]);
        }
    },

    /**
     *
     * @param series
     * @param dataIndex
     */
    unHighLight: function(series, dataIndex) {
        var datapoints, formatLength, index, datapoint;

        if (this.plot == null) {
            return;
        }

        if (series == null) {
            this.plot.unhighlight();
            this._prevBarNoticeData = null;

            if (this._$barNotice) {
                this._$barNotice.remove();
                this._$barNotice = null;
            }
        } else {
            datapoints = seriesList[series].datapoints;
            formatLength = datapoints.format.length;
            index = dataIndex * formatLength;
            datapoint = datapoints.points.slice(index, index + formatLength);

            if (!this._isStack) {
                this.plot.unhighlight(seriesList[series], datapoint);
            }

            this._prevBarNoticeData = null;
            if (this._$barNotice) {
                this._$barNotice.remove();
                this._$barNotice = null;
            }
        }
    },

    /**
     * series의 데이터를 초기화 한다
     * 인자가 없을경우 모든 series의 데이터를 초기화 한다.
     * @param series series index
     */
    clearValues: function(series) {
        var i;

        if (series != undefined) {
            if (this.serieseList[series]) {
                if (Array.isArray(this.serieseList[series].data)) {
                    this.serieseList[series].data.length = 0;
                } else {
                    this.serieseList[series].data = null;
                }

            }
        } else {
            for (i = 0; i < this.serieseList.length; i++) {
                if (Array.isArray(this.serieseList[i].data)) {
                    this.serieseList[i].data.length = 0;
                } else {
                    this.serieseList[i].data = null;
                }
            }
        }

        this.initMaxValue();
        this._removeMaxValueTip();
        this.prevIndicatorPos = null;
        if (this.indicatorLegend) {
            this.indicatorLegend.remove();
        }
        this._removeDayLine();
        this._removeBaseLine();

        if (this.timeBrush) {
            this.timeBrush.clearData();
        }

        //this.clearDependentChart();

    },

    /**
     * 모든 series의 데이터 삭제
     */
    clearAllSeires: function() {
        var i;
        for (i = 0; i < this.serieseList.length; i++) {
            this.serieseList[i].data.length = 0;
        }
        this.prevIndicatorPos = null;

        if (this.maxValueTip) {
            this.maxValueTip.remove();
        }
        this.initMaxValue();

        if (this.timeBrush) {
            this.timeBrush.clearData();
        }
    },

    /**
     * 해당 인덱스의 series 데이터 삭제
     * @param index series index
     */
    clearSeries: function(index) {
        this.serieseList[index].data.length = 0;
        this.prevIndicatorPos = null;
    },

    /**
     * 모든 series 삭제
     */
    removeAllSeries: function() {
        var ix, ixLen;
        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            if (this.serieseList[ix].labelObj) {
                this.serieseList[ix].labelObj.destroy();
                this.serieseList[ix].labelObj = null;
            }
        }
        this.serieseList.length = 0;

        this.initMaxValue();

        if (this.maxValueTip) {
            this.maxValueTip.remove();
        }
    },

    /**
     * 해당 인덱스의 series 삭제
     * @param index
     */
    removeSeries: function(index) {
        if (this.serieseList[index] && this.serieseList[index].labelObj) {
            this.serieseList[index].labelObj.destroy();
        }
        this.serieseList.splice(index, 1);
    },

    /**
     * [event usage]
     *
     * click: function(event, pos, item) {
            alert("You clicked at " + pos.x + ", " + pos.y);
            // axis coordinates for other axes, if present, are in pos.x2, pos.x3, ...
            // if you need global screen coordinates, they are pos.pageX, pos.pageY

            if (item) {
                highlight(item.series, item.datapoint);
                alert("You clicked a point!");
            }
        });
     */
    plotChartEvent: function() {
        var self = this;
        if (this.plotclick) {
            this._$chartTarget.on('plotclick', function(event, pos, item) {
                if (item) {
                    if (self.showBarNotice) {
                        if (self._isStack) {
                            self._createBarNotice(item.datapoint, item.series);
                        } else {
                            self.plot.unhighlight();
                            self._createBarNotice(item.datapoint, item.series);
                            self.plot.highlight(item.series, item.datapoint);
                        }
                    }
                    self.plotclick(event, pos, item, self);
                } else {
                    if (self.highLighHold) {
                        return;
                    }
                    self.plot.unhighlight();
                    if (self._$barNotice) {
                        self._$barNotice.remove();
                        self._$barNotice = null;
                    }
                }
            });
        }

        if (this.showTooltip) {
            this.createToolTip();

            this._$chartTarget.on('plothover', function(event, pos, item) {
                if (item) {
                    if (this.showMultiToolTip) {
                        this.multiToolTip(event, pos, item);
                    } else {
                        this.singleToolTip(event, pos, item);
                    }
                } else {
                    if (this.toolTipTimer) {
                        return;
                    }

                    this.toolTipTimer = setTimeout(function() {
                        this.$toolTip.hide();
                    }.bind(this), 500);
                }

                if (this.plothover) {
                    self.plothover(event, pos, item, self);
                }
            }.bind(this));
        }

        // if(this.plothover){
        //    this._$chartTarget.on('plothover', function(event, pos, item){
        //        if (item) {
        //            var index = item.dataIndex;
        //            var x = null;
        //            var y = null;
        //
        //            if(this._type == PlotChart.type.exPie){
        //                x = item.datapoint[0];
        //                y = item.datapoint[1][0][1];
        //            }else if(this._type == PlotChart.type.exBar){
        //                if(this._isHorizontal){
        //                    if(this._chartOption.yaxis.mode == 'categories'){
        //                        x = item.datapoint[0] - (item.datapoint[2] || 0);
        //                        y = item.series.data[index] ? item.series.data[index][1] : item.datapoint[1];
        // //                                y = item.datapoint[1];
        //                    }else{
        //                        x = item.datapoint[0];
        //                        y = item.datapoint[1] - (item.datapoint[2] || 0);
        //                    }
        //                }else{
        //                    if(this._chartOption.xaxis.mode == 'categories'){
        //                        x = item.series.data[index][0];
        //                        y = item.datapoint[1] - (item.datapoint[2] || 0);
        //                    }else{
        //                        x = item.datapoint[0];
        //                        y = item.datapoint[1] - (item.datapoint[2] || 0);
        //                    }
        //                }
        //            }else if(this._type == PlotChart.type.exLine && this._isStack){
        //                if(this._chartOption.xaxis.mode == 'categories'){
        //                    x = item.series.data[index][0];
        //                }else{
        //                    x = item.datapoint[0];
        //                }
        //                y = item.datapoint[1] - (item.datapoint[2] || 0);
        //            }
        //            else{
        //                x = item.datapoint[0];
        //                y = item.datapoint[1] - (item.datapoint[2] || 0);
        //            }
        //
        //            self.hoverDataInfo.x = x;
        //            self.hoverDataInfo.y = y;
        //            self.hoverDataInfo.index = index;
        //
        //        }else{
        //            self.hoverDataInfo.x = null;
        //            self.hoverDataInfo.y = null;
        //            self.hoverDataInfo.index = null;
        //        }
        //        self.plothover(event, pos, item, self);
        //    }.bind(this));
        // }

        if (this.showIndicator) {
            this._$chartTarget.on('plotdblclick', function(event, pos, item) {
                var xAxis = self.drawIndicator(pos);

                if (self.plotdblclick) {
                    self.plotdblclick(event, pos, item, xAxis);
                }
            });
        } else {
            if (this.plotdblclick) {
                this._$chartTarget.on('plotdblclick', function(event, pos, item) {
                    self.plotdblclick(event, pos, item);
                });
            }
        }

        if (this.showZoomIn) {
            this._$chartTarget.bind('plotselected', function(event, ranges) {
                self.plot = $.plot(self._chartTarget, self.getPlotData(), $.extend(true, {}, self._chartOption, {
                    xaxis: {
                        min: ranges.xaxis.from,
                        max: ranges.xaxis.to
                    }
                }));
            });
        }

        if (this.plotselection) {
            this._$chartTarget.bind('plotselected', function(event, ranges) {

                if (self.selectionZoom) {
                    ranges.xaxis.from = self._dateIntervalInit(ranges.xaxis.from, self.interval, true, 0);
                    ranges.xaxis.to = self._dateIntervalInit(ranges.xaxis.to, self.interval, true, 1);

                    self.dependentChartZoomIn(ranges.xaxis.from, ranges.xaxis.to);
                }

                self.plotselection(event, ranges, self.maxOffSet);

                self.plot.setSelection({
                    xaxis: {
                        from: 0,
                        to: 0
                    },
                    yaxis: {
                        from: 0,
                        to: 0
                    }
                }, false);
            });
        } else if (this.mouseSelect) {
            this._$chartTarget.bind('plotselected', function(event, ranges) {

                if (self.selectionZoom) {
                    self.dependentChartZoomIn(ranges.xaxis.from, ranges.xaxis.to);
                }

                if (self.plotselection)  {
                    self.plotselection(event, ranges, self.maxOffSet);
                }

                self.plot.setSelection({
                    xaxis: {
                        from: 0,
                        to: 0
                    },
                    yaxis: {
                        from: 0,
                        to: 0
                    }
                }, false);
            });
        }

        // $(this.plot.getCanvas()).resize(function(){
        //    // xaxis time tick reset
        //    // if(this._type != PlotChart.type.exPie && this._chartOption.xaxis.mode == 'time' && this.interval != null){
        //        this.plotDraw();
        //    //     if(this.showMaxValue){
        //    //         this._createMaxValueTip();
        //    //     }
        //    //
        //    //     if(this.showIndicator){
        //    //         this.drawIndicator(this.prevIndicatorPos);
        //    //     }
        //    //
        //    //     if(this._$barNotice){
        //    //         this._createBarNotice();
        //    //     }
        //    // }
        // }.bind(this));

        if (this.fixedWidth && this.chartWrap) {
            this.chartWrap.addListener('resize', function() {
                this._chartWidth = this.chartLayer.getWidth();
                this.plot.resize();
                this.plotDraw();
                //if(this.resizeTimer){
                //    clearTimeout(this.resizeTimer);
                //}
                //this.resizeTimer = setTimeout(this.plotDraw.bind(this), 100);

            }, this);
        } else {
            this.chartLayer.addListener('resize', function() {
                this._chartWidth = this.chartLayer.getWidth();
                this.plot.resize();
                this.plotDraw();
                //if(this.resizeTimer){
                //    clearTimeout(this.resizeTimer);
                //}
                //this.resizeTimer = setTimeout(this.plotDraw.bind(this), 100);

            }, this);
        }

        $('#' + this._chartContainer.id).hover(function(){

        }, function(){
            if (this.$toolTip) {
                this.$toolTip.hide();
            }
        }.bind(this));

    },

    singleToolTip: function(event, pos, item) {
        var index = item.dataIndex;
        var x = null,
            y = null,
            s = item.series.label || item.series.id;

        var textFormat = this.toolTipFormat,
            tempX = null,
            tempY = null;
        var top = 0;
        var left = 0;

        if (this.toolTipTimer) {
            clearTimeout(this.toolTipTimer);
            this.toolTipTimer = null;
        }

        if (this._type == PlotChart.type.exPie) {
            x = item.datapoint[0];
            y = item.datapoint[1][0][1];
        } else if (this._type == PlotChart.type.exBar) {
            if (this._isHorizontal) {
                if (this._chartOption.yaxis.mode == 'categories') {
                    x = item.datapoint[0] - (item.datapoint[2] || 0);
                    y = item.series.data[index] ? item.series.data[index][1] : item.datapoint[1];
                    // y = item.datapoint[1];
                } else {
                    x = item.datapoint[0];
                    y = item.datapoint[1] - (item.datapoint[2] || 0);
                }
            } else {
                if (this._chartOption.xaxis.mode == 'categories') {
                    x = item.series.data[index][0];
                    y = item.datapoint[1] - (item.datapoint[2] || 0);
                } else {
                    x = item.datapoint[0];
                    y = item.datapoint[1] - (item.datapoint[2] || 0);
                }
            }
        } else if (this._type == PlotChart.type.exLine && this._isStack) {
            if (this._chartOption.xaxis.mode == 'categories') {
                x = item.series.data[index][0];
            } else {
                x = item.datapoint[0];
            }
            y = item.datapoint[1] - (item.datapoint[2] || 0);
        } else if (this._type == PlotChart.type.exLine && this.onIndexValue) {
            x = item.series.ticks[item.dataIndex];
            y = item.datapoint[1] - (item.datapoint[2] || 0);
        } else {
            x = item.datapoint[0];
            y = item.datapoint[1] - (item.datapoint[2] || 0);
        }

        tempX = x;
        tempY = y;

        if (typeof x === 'number' && isFinite(x)) {
            if (item.series.xaxis.options.mode === 'time' || this.onIndexValue) {
                if (item.series.xaxis.options.timezone === 'browser') {
                    tempX = $.plot.formatDate(new Date(x), this.toolTipTimeFormat);
                } else if (! item.series.xaxis.options.timezone || item.series.xaxis.options.timezone === 'utc') {
                    tempX = $.plot.formatDate(new Date(x - 32400000), this.toolTipTimeFormat);
                }
            } else {
                tempX = common.Util.numberFixed(x, 3);
            }
        }

        if (typeof y === 'number' && isFinite(y)) {
            if (item.series.yaxis.options.mode === 'time') {
                tempY = $.plot.formatDate(new Date(y), this.toolTipTimeFormat);
            } else {
                tempY = common.Util.numberFixed(y, 3);
            }
        }

        textFormat = textFormat.replace('%x', tempX).replace('%y', tempY).replace('%s', s);

        top  = (item.pageY || pos.pageY) - 25;
        left = (item.pageX || pos.pageX) + 5;

        var seriesColor = null;
        if (item.series.seriesIndex != null) {
            seriesColor = this.serieseList[item.series.seriesIndex].color;
        }
        var backgroundColor = seriesColor ? seriesColor : this._chartOption.colors[item.series.seriesIndex];

        var chartOffset = this._$chartTarget.offset();
        var bottom = chartOffset.top + this.getHeight();

        if (top + this.$toolTip.outerHeight() > bottom) {
            top = bottom - this.$toolTip.outerHeight() - 20;
        }

        //if(Math.abs(left - chartOffset.left) > this.getWidth() / 2){
        //    //if(this._type == PlotChart.type.exBar && ! this._isHorizontal && this._chartOption.xaxis.mode != 'categories'){
        //    if(! this.onIndexValue && this._type != PlotChart.type.exPie && ! this._isHorizontal && (this._chartOption.xaxis.mode != 'categories')){
        //        left -= ( (this.interval * 0.7 * this.plot.getXAxes()[0].scale / 2 ) + 10 + this.$toolTip.width() );
        //    }
        //}else{
        //    // bar 차트일 경우 바 넓이 오른쪽에 show
        //    if(this._type == PlotChart.type.exBar && ! this._isHorizontal && this._chartOption.xaxis.mode != 'categories'){
        //        left += (this.interval * 0.7 * this.plot.getXAxes()[0].scale / 2 ) - 10;
        //    }
        //}

        if (Math.abs(left - chartOffset.left) > this.getWidth() / 2) {
            if (this._type == PlotChart.type.exBar && ! this._isHorizontal && this._chartOption.xaxis.mode != 'categories') {
                left -= ( (this.interval * 0.7 * this.plot.getXAxes()[0].scale / 2 ) + 10 + this.$toolTip.width() );
            } else {
                if (!item.series.hbar) {
                    left -= ( 10 + this.$toolTip.width() );
                }
            }
        } else {
            // bar 차트일 경우 바 넓이 오른쪽에 show
            if (this._type == PlotChart.type.exBar && ! this._isHorizontal && this._chartOption.xaxis.mode != 'categories') {
                left += (this.interval * 0.7 * this.plot.getXAxes()[0].scale / 2 ) - 10;
            } else {
                if (!item.series.hbar) {
                    left -= 10;
                }
            }
        }

        //1512.9 tooltip이 창보다 left가 커지면 짤려
        if (left + this.$toolTip.width() >= document.body.clientWidth) {
            left = left - 50;
        }

        this.$toolTip.text(textFormat).css({top: top, left: left, backgroundColor: backgroundColor }).show();
    },

    multiToolTip: function(event, pos, item) {
        var diffValue = null;

        var ix = null;
        var ixLen = null;
        var jx = null;
        var jxLen = null;
        var dataset = this.plot.getData();
        var series = null;
        var xDisp = null;
        var color = null;
        var index = item.dataIndex;

        if (this.toolTipTimer) {
            clearTimeout(this.toolTipTimer);
            this.toolTipTimer = null;
        }

        if (this.$toolTip) {
            this.$toolTip.children().remove();
            this.$toolTip.css({
                background: '#fff',
                color: '#000',
                border: '1px solid #D8D8D8',
                padding: '10px'
            });
        }
        var $nameArea = $('<div class="xm-canvaschart-multil-tooltip-name" style="float:left"></div>');
        var $valueArea = $('<div class="xm-canvaschart-multil-tooltip-value" style="float:left;margin-left: 4px;"></div>');

        this.$toolTip.append($nameArea);
        this.$toolTip.append($valueArea);

        if (this._isHorizontal) {
            if (this._chartOption.yaxis.mode == 'categories') {
                diffValue = item.series.data[index] != null ? item.series.data[index][1] : item.datapoint[1];
            } else {
                diffValue = item.datapoint[1] - (item.datapoint[2] || 0);
            }
            //diffValue = item.datapoint[1];

            if (typeof diffValue === 'number' && isFinite(diffValue)) {
                if (item.series.yaxis.options.mode == 'time') {
                    xDisp = $.plot.formatDate(new Date(diffValue), this.toolTipTimeFormat);
                } else {
                    xDisp = diffValue;
                }
            } else {
                xDisp = diffValue;
            }
            // 상단 시간 영역
            this.$toolTip.prepend('<div class="xm-canvaschart-multil-tooltip-time" style="font-size: 14px;margin-bottom: 6px;padding-bottom: 2px;border-bottom: 1px solid #D2D2D2;">' + xDisp + '</div>');

            for (ix = 0, ixLen = dataset.length; ix < ixLen; ++ix) {
                series = dataset[ix];
                color = series.color ? series.color : this._chartOption.colors[series.seriesIndex];

                for (jx = 0, jxLen = series.data.length; jx < jxLen; ++jx) {
                    if (series.hideLegend) {
                        continue;
                    }
                    if (series.data[jx][1] == diffValue) {
                        $nameArea.append('<div style="color:' + color + ';margin-bottom: 4px;font-size: 14px;">' + (series.label || series.id) + ' </div>');
                        $valueArea.append('<div style="margin-bottom: 4px;font-size: 14px;"> : ' + common.Util.toFixed(series.data[jx][0], this.toFixedNumber) + '</div>');
                        break;
                    }
                }
            }
        } else {
            if (this._chartOption.xaxis.mode == 'categories') {
                diffValue = item.series.data[index][0];
            } else {
                diffValue = item.datapoint[0];
            }

            //diffValue = item.datapoint[0];

            if (typeof diffValue === 'number' && isFinite(diffValue)) {
                if (item.series.xaxis.options.mode == 'time') {
                    xDisp = $.plot.formatDate(new Date(diffValue), this.toolTipTimeFormat);
                } else {
                    xDisp = diffValue;
                }
            } else {
                xDisp = diffValue;
            }
            // 상단 시간 영역
            this.$toolTip.prepend('<div class="xm-canvaschart-multil-tooltip-time" style="font-size: 14px;margin-bottom: 6px;padding-bottom: 2px;border-bottom: 1px solid #D2D2D2;">' + xDisp + '</div>');

            for (ix = 0, ixLen = dataset.length; ix < ixLen; ++ix) {
                series = dataset[ix];
                color = series.color ? series.color : this._chartOption.colors[series.seriesIndex];

                for (jx = 0, jxLen = series.data.length; jx < jxLen; ++jx) {
                    if (series.hideLegend) {
                        continue;
                    }

                    if (series.data[jx][0] == diffValue) {

                        if (this.legendOrder == 'desc') {
                            $valueArea.prepend('<div style="margin-bottom: 4px;font-size: 14px;"> : ' + common.Util.toFixed(series.data[jx][1], this.toFixedNumber) + '</div>');
                            $nameArea.prepend('<div style="color:' + color + ';margin-bottom: 4px;font-size: 14px;">' + (series.label || series.id) + ' </div>');
                        } else {
                            $nameArea.append('<div style="color:' + color + ';margin-bottom: 4px;font-size: 14px;">' + (series.label || series.id) + ' </div>');

                            if (Array.isArray(series.data[jx][1])) {
                                $valueArea.append('<div style="margin-bottom: 4px;font-size: 14px;"> : ' + common.Util.toFixed(series.data[jx][1][0], this.toFixedNumber) + ' ~ ' + common.Util.toFixed(series.data[jx][1][1], this.toFixedNumber) + '</div>');
                            } else if (series.data[jx][1] === 'true' || series.data[jx][1] === 'false') {
                                $valueArea.append('<div style="margin-bottom: 4px;font-size: 14px;"> : ' + series.data[jx][1] + '</div>');
                            } else {
                                $valueArea.append('<div style="margin-bottom: 4px;font-size: 14px;"> : ' + common.Util.toFixed(series.data[jx][1], this.toFixedNumber) + '</div>');
                            }
                        }

                        break;
                    }
                }
            }
        }

        var top  = (item.pageY || pos.pageY) - 25;
        var left = (item.pageX || pos.pageX) + 15;

        if (left + this.$toolTip.width() + 40 >= document.body.clientWidth) {
            left = (item.pageX || pos.pageX) - this.$toolTip.width() - 40;
        }

        if (top + this.$toolTip.height() + 10 >= document.body.clientHeight) {
            top = (item.pageY || pos.pageY) - this.$toolTip.height() - 10;
        }

        this.$toolTip.css({
            top: top,
            left: left
        }).show();
    },

    /**
     * 이벤트 생성 함수
     *
     * @param eventName Envir.js 에 선언되어져 있는 PlotChart.event 참조
     * @param action 해당 이벤트시 실행되어져야 할 함수
     * @param scope scope default: chart scope
     */
    addEventListener: function(eventName, action, scope) {
        var self = this;
        self[eventName] = action;

        $(self._chartTarget).on(eventName, function(event, pos, item){
            self[eventName].call(scope || self, event, pos, item );
        });
    },

    /**
     * @param from millisecond (1397176462644)
     * @param to   millisecond (1397176462644)
     */
    zoomIn: function(from, to) {
        if (!this._$chartTarget || this._$chartTarget.length == 0 || to - from <= this.interval) {
            this.onZooming = false;
            return;
        }

        this.isZoomIn = true;

        // this._chartOption.xaxis.min = from;
        // this._chartOption.xaxis.max = to;
        //
        // this.plot = $.plot(this._chartTarget, this.getPlotData(), this._chartOption);

        this.zoomAnimate(from, to, 400);
    },

    zoomAnimate: function(from, to, duration) {
        var start = new Date().getTime();
        var end = start + duration;
        this.prevZoomFrom = this.prevZoomFrom || this.fromTime;
        this.prevZoomTo   = this.prevZoomTo   || this.toTime;

        var distFrom = from - this.prevZoomFrom;
        var distTo   = to   - this.prevZoomTo;

        var step = function() {
            var timestamp = new Date().getTime();
            var progress = Math.min((duration - (end - timestamp)) / duration, 1);

            this._chartOption.xaxis.max  = this.prevZoomTo + (distTo * progress);
            this._chartOption.xaxis.min  = this.prevZoomFrom + (distFrom * progress);

            // If the animation hasn't finished, repeat the step.
            if (progress < 1) {
                if (this._type != PlotChart.type.exPie && this._chartOption.xaxis.mode == 'time' && this.interval != null) {
                    this._dayDiff = null;
                    this._monthDiff = null;

                    this._initTimeTick();
                }
                this.plot = $.plot(this._chartTarget, this.getPlotData(), this._chartOption);

                //this.displayXAxis(this.showXAxis);
                //this.displayYAxis(this.showYAxis);

                this.requestAnimationFrame.call(window, step);
            } else {

                this.prevZoomTo = this._chartOption.xaxis.max;
                this.prevZoomFrom = this._chartOption.xaxis.min;

                if (this._$chartTarget.length == 0) {
                    return;
                }

                if (this._type != PlotChart.type.exPie && this._chartOption.xaxis.mode == 'time' && this.interval != null) {
                    this._dayDiff = null;
                    this._monthDiff = null;

                    this._initTimeTick();
                }


                if (this.fromTime == this._chartOption.xaxis.min && this.toTime == this._chartOption.xaxis.max) {
                    this._chartOption.yaxis.max = this.chartType.yMax;
                } else {
                    this._chartOption.yaxis.max = this.maxOffSet.y * 1.3;
                }

                //this.plot = $.plot(this._chartTarget, this.serieseList, this._chartOption);
                this.plot = $.plot(this._chartTarget, this.getPlotData(), this._chartOption);

                //this.displayXAxis(this.showXAxis);
                //this.displayYAxis(this.showYAxis);

                this.zoomMaxValue();

                if (this.showMaxValue) {
                    this._createMaxValueTip();
                }

                if (this.showIndicator) {
                    this.drawIndicator(this.prevIndicatorPos);
                }

                if (this._$barNotice) {
                    this._createBarNotice();
                }

                var $yLabel;
                if (this.plotYLabelClick) {
                    $yLabel = this._$chartTarget.find('.flot-y-axis');
                    if ($yLabel.length > 0) {
                        $yLabel.children().on('click', this.plotYLabelClick).addClass('label-active');
                    }
                }

                if (this.plotYLabelRightClick) {
                    $yLabel = this._$chartTarget.find('.flot-y-axis');
                    if ($yLabel.length > 0) {
                        $yLabel.children().on('contextmenu', this.plotYLabelRightClick).addClass('label-active');
                    }
                }

                if (this.timeBrush) {
                    this.timeBrush.setTimeRange(from, to);
                }

                if (this.afterZoomEvent) {
                    setTimeout(function(self, from, to , maxOffSet, plot) {
                        self.afterZoomEvent(from, to, maxOffSet, plot);
                        self.onZooming = false;
                    }, 300, this, from, to, this.maxOffSet, this.plot);
                }

                if (this.showDayLine) {
                    this._drawDayLine();
                }
            }
        }.bind(this);

        // Start the animation
        return step();
    },

    getZoomData: function() {
        var seriese = this.serieseList;

        var minX = this._chartOption.xaxis.min,
            minY = this._chartOption.xaxis.max,
            ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = seriese.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = seriese[ix].data.length; jx < jxLen; jx++) {
                if (seriese[ix].data[jx][0] >= minX && seriese[ix].data[jx][0] <= minY) {
                    this.data.push(seriese[ix].data[jx]);
                }
            }
        }
    },

    /**
     * 특정 예의 차트를 구분하기 위해서 차트의 타입을 지정.
     * bar , pie 차트는 다른 이벤트 혹은 액션이 추가 되기때문에 따로 구분이 되어야 함
     *
     * @param {} type
     */
    _chartType: function() {
        var i;
        for (i = 0; i < this.serieseList.length; i++) {
            switch (this.serieseList[i].type) {
                case PlotChart.type.exBar :
                    this._type = PlotChart.type.exBar;
                    break;
                case PlotChart.type.exPie :
                    this._type = PlotChart.type.exPie;
                    break;
                case PlotChart.type.exScatter :
                    this._type = PlotChart.type.exScatter;
                    break;
                case PlotChart.type.exBand :
                    this._type = PlotChart.type.exBand;
                    break;
                default : this._type = PlotChart.type.exLine;
                    break;
            }
        }
    },


    _createBarNotice: function(datapoint, series) {
        var i = 0, j = 0, seriesList = this.plot.getData(), seriesLen = seriesList.length,
            dataLen = null;
        var searchIndex = null;
        var sumData = [0, 0];
        var searchValue = null;

        if (datapoint) {
            this._prevBarNoticeData = {
                datapoint: datapoint,
                series: series
            };
        } else {
            datapoint = this._prevBarNoticeData.datapoint;
            series = this._prevBarNoticeData.series;
        }

        if (datapoint[0] == null && datapoint[1] == null && datapoint[2] == null) {
            return;
        }

        if (series.bars.horizontal) {
            // y축 데이터 찾기
            searchIndex = 1;
        } else {
            // x축 데이터 찾기
            searchIndex = 0;
        }

        if (this._isOrder) {
            var orderSearchIndex = 3;
            if (searchIndex == 1) {
                sumData[0] = series.xaxis.max;
                //sumData[1] = datapoint[1];
                orderSearchIndex = 3;
            } else {
                //sumData[0] = datapoint[2] + this.interval / 2;
                sumData[1] = series.yaxis.max;
            }

            if (this._chartOption.xaxis.mode == 'categories' || this._chartOption.yaxis.mode == 'categories') {
                if (seriesList[i].data[datapoint[searchIndex]]) {
                    searchValue = seriesList[i].data[datapoint[searchIndex]][searchIndex];
                } else {
                    return;
                }
            } else {
                for (i = 0; i < series.data.length; i++) {
                    if (series.data[i][orderSearchIndex] == datapoint[searchIndex]) {
                        //sumData[searchIndex] = series.data[i][searchIndex] + (this.interval / 2);
                        sumData[searchIndex] = series.data[i][searchIndex];
                        break;
                    }
                }
            }
        } else {
            for (i; i < seriesLen; i++) {
                if (this._chartOption.xaxis.mode == 'categories' || this._chartOption.yaxis.mode == 'categories') {

                    if (seriesList[i].data[datapoint[searchIndex]]) {
                        searchValue = seriesList[i].data[datapoint[searchIndex]][searchIndex];
                    } else {
                        return;
                    }
                } else {
                    searchValue = datapoint[searchIndex];
                }

                for (j = 0, dataLen = seriesList[i].data.length; j < dataLen; j++) {

                    if (seriesList[i].data[j][searchIndex] == searchValue) {
                        if (this._chartOption.xaxis.mode == 'categories') {
                            sumData[0] = j;
                            sumData[1] += +seriesList[i].data[j][1] || 0;
                        } else if (this._chartOption.yaxis.mode == 'categories') {
                            if (this._isStack) {
                                sumData[0] += +seriesList[i].data[j][0] || 0;
                                sumData[1] = j;
                            } else {
                                // 1511.06 min
                                // stack이 아니면서 stack처럼 포인트를 찍어주기때문에 너무 멀리표현되므로 수정.
                                if (sumData[0] < seriesList[i].data[j][0]) {
                                    sumData[0] = +seriesList[i].data[j][0] || 0;
                                };
                                sumData[1] = j;
                            }
                        } else {
                            if (searchIndex == 0) {
                                sumData[0] = +seriesList[i].data[j][0] || 0;
                                sumData[1] += +seriesList[i].data[j][1] || 0;
                            } else {
                                sumData[0] += +seriesList[i].data[j][0] || 0;
                                sumData[1] = +seriesList[i].data[j][1] || 0;
                            }
                        }
                        break;
                    }
                }
            }
        }



        var offSet = this.plot.pointOffset({
            x: sumData[0],
            y: sumData[1],
            yaxis: (this.maxOffSet.yaxis) ? this.maxOffSet.yaxis : 1
        });
        var style = '';
        var width = 0;
        var barPos = 0;
        width = Math.max(this.plot.width() * 0.004, 5);
        if (this._isHorizontal) {
            // Horizontal
            barPos = this.maxOffSet.x == sumData[0] ? (this.maxValueTip ? this.maxValueTip.outerWidth() + 10 : 40) : 0;

            if (this._chartOption.xaxis.transform) {
                if (this.maxOffSet.index === sumData[1]) {
                    style = 'position:absolute;top:' + (offSet.top - width) + 'px;left:' + (offSet.left - barPos - 10) + 'px;border-color: transparent transparent transparent #666666 ;border-style: solid;border-width:' + width + 'px;height:0;width:0;z-index:3;';
                } else {
                    style = 'position:absolute;top:' + (offSet.top - width) + 'px;left:' + (offSet.left - 10) + 'px;border-color: transparent transparent transparent #666666 ;border-style: solid;border-width:' + width + 'px;height:0;width:0;z-index:3;';
                }
            } else {
                if (this.maxOffSet.index === sumData[1]) {
                    style = 'position:absolute;top:' + (offSet.top - width) + 'px;left:' + (offSet.left + barPos) + 'px;border-color: transparent #666666 transparent transparent;border-style: solid;border-width:' + width + 'px;height:0;width:0;z-index:3;';
                } else {
                    style = 'position:absolute;top:' + (offSet.top - width) + 'px;left:' + (offSet.left) + 'px;border-color: transparent #666666 transparent transparent;border-style: solid;border-width:' + width + 'px;height:0;width:0;z-index:3;';
                }
            }
        } else {
            // Vertical
            barPos = this.maxOffSet.y == sumData[1] ? (this.maxValueTip ? this.maxValueTip.outerHeight() + 20: width + 5) : width + 5;
            if (this.maxOffSet.x == sumData[0]) {
                style = 'position:absolute;top:' + (offSet.top - barPos) + 'px;left:' + (offSet.left - width) + 'px;border-color: #666666 transparent transparent transparent;border-style: solid;border-width:' + width + 'px;height:0;width:0;z-index:3';
            } else {
                style = 'position:absolute;top:' + (offSet.top - 10) + 'px;left:' + (offSet.left - width) + 'px;border-color: #666666 transparent transparent transparent;border-style: solid;border-width:' + width + 'px;height:0;width:0;z-index:3';
            }
        }

        if (this._$barNotice) {
            this._$barNotice.remove();
            this._$barNotice = null;
        }

        this._$barNotice = $('<div style="' + style + '"></div>');
        this._$chartTarget.append(this._$barNotice);
    },

    _createIndicatorTip: function(height, x, y, text, realMaxY) {
        var width = 0, left = 0, direct = 0;
        var style = 'position:absolute;top:' + y + 'px;height:' + height + 'px;line-height: ' + height + 'px;border-radius:4px;background: linear-gradient(to right, #1E2C29 0%, #8BA395 50%,#222529 100%);color: #FFF;padding: 0px 4px;text-align:center;display:none;';
        var lineStyle = null;
        var canvasWidth = this.plot.width();

        if (this._type == PlotChart.type.exPie) {
            return;
        }

        if (this._type == PlotChart.type.exLine) {
            lineStyle = 'position:absolute;top:12px;width:2px;left:50%;height:' + (this.plot.height() - y) + 'px;background-image: linear-gradient(to bottom, rgb(30, 44, 41) 0%, rgb(220, 226, 223) 100%);';
        } else {
            lineStyle = 'position:absolute;top:12px;width:2px;left:50%;height:' + Math.abs(y - realMaxY + height) + 'px;background-image: linear-gradient(to bottom, rgb(30, 44, 41) 0%, rgb(220, 226, 223) 100%);';
        }

        if (this.indicatorLegend) {
            this.indicatorLegend.remove();
        }

        this.indicatorLegend = $('<div style="' + style + '">' + text + '<div style="' + lineStyle + '"></div></div>');
        this._$chartTarget.append(this.indicatorLegend);

        direct = this.indicatorLegend.outerWidth();
        if (x < direct / 2) {
            width = 0;
            left = 0;
        } else if (x > canvasWidth - (direct / 2)) {
            width = direct;
            left = 100 - ( 2 / width * 100);
        }else {
            width = direct / 2;
            left = 50;
        }

        this.indicatorLegend.css('left', x - width).show().children().eq(0).css('left', left + '%');
    },

    _drawDayLine: function() {
        if (this.plot && this._chartOption.xaxis.mode != 'time') {
            return;
        }

        var minTime = this._xaxisMin || this._chartOption.xaxis.min || this.fromTime;
        var maxTime = this._xaxisMax || this._chartOption.xaxis.max || this.toTime;

        if (this.isZoomIn) {
            minTime = this._chartOption.xaxis.min;
            maxTime = this._chartOption.xaxis.max;
        }

        var minDay = new Date(minTime).getDate();
        var maxDay = new Date(maxTime).getDate();

        var diff = maxTime - minTime;
        //86400000 === 1day
        var gap = Math.floor(diff / 86400000);

        //추가
        var gapDay = minDay + gap;
        if (gapDay !== maxDay) {
            gap = gap + 1;
        }

        if (gap == 0 && minDay != maxDay) {
            gap = 1;
        }

        if (gap == 0) {
            return;
        }

        var offSet = null;
        var $target = this._$chartTarget;
        var startDate = new Date(minTime);
        startDate = startDate.setHours(0, 0, 0, 0);

        for (var ix = 1, ixLen = gap + 1; ix < ixLen; ix++) {
            offSet = this.plot.pointOffset({
                x : startDate + (86400000 * ix),
                y: this.plot.getOptions().yaxis.max,
                yaxis: (this.maxOffSet.yaxis) ? this.maxOffSet.yaxis : 1
            });
            $target.append('<div class="chart-day-line" style="position:absolute;left:' + offSet.left + 'px;top:8px;border:1px dashed #aaa;height:' + this.plot.height() + 'px;"></div>');
        }
    },

    _drawBaseLine: function() {
        if (this.plot && this._chartOption.xaxis.mode != 'categories') {
            return;
        }

        var offSet;
        var $target = this._$chartTarget;

        if (this.maxOffSet.s !== null) {
            offSet = this.plot.pointOffset({
                y: this.defaultBaseLine
            });

            $target.append('<div class="chart-base-line" style="position:absolute;left:25px;top:' + offSet.top + 'px;border:1px dashed #aaa;width:' + this.plot.width() + 'px;"></div>');
        }
    },

    _removeBaseLine: function() {
        if (this._$chartTarget) {
            this._$chartTarget.find('.chart-base-line').remove();
        }
    },

    _removeDayLine: function() {
        if (this._$chartTarget) {
            this._$chartTarget.find('.chart-day-line').remove();
        }
    },

    _removeMaxValueTip: function() {
        if (this.maxValueTip) {
            this.maxValueTip.remove();
        }
    },

    _createMaxValueTip: function() {
        var width = 0;
        var textFormat = this.maxValueFormat;
        var lineStyle = null;
        var canvasWidth = this.plot.width();
        var data = this.plot.getData();
        var dataLen;
        var seriesLen;
        var time;
        var i = null;
        var j = null;

        // stack 차트일 경우 시리즈의 y값을 모두 더한 값의 위치에 레이블을 표시한다.
        // stack 차트일 경우 format 형식에 series(%s) 가 있어도 무시한다.
        var stackArrTemp = {};

        if (data.length == 0) {
            this._removeMaxValueTip();
            return;
        }

        var max = null;
        if (this._isStack) {
            if (this._isHorizontal) {
                for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                    if (data[i].visible) {
                        for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {
                            if (stackArrTemp[data[i].data[j][1]]) {
                                stackArrTemp[data[i].data[j][1]].x += (+data[i].data[j][0]);
                            } else {
                                stackArrTemp[data[i].data[j][1]] = {
                                    x: +data[i].data[j][0],
                                    y: data[i].data[j][1],
                                    index: j,
                                    seriesIndex: i
                                };
                            }
                        }
                    }
                }
                max = _.max(stackArrTemp, function (obj) {
                    return obj.x;
                });
            } else {
                for (i = 0, seriesLen = data.length; i < seriesLen; i++) {
                    if (data[i].visible) {
                        for (j = 0, dataLen = data[i].data.length; j < dataLen; j++) {
                            time = data[i].data[j][0];
                            if ((this._chartOption.xaxis.min != null && this._chartOption.xaxis.min > time)
                                || (this._chartOption.xaxis.max != null && this._chartOption.xaxis.max < time)) {
                                continue;
                            }

                            if (stackArrTemp[time]) {
                                stackArrTemp[time].y += +data[i].data[j][1];
                            } else {
                                stackArrTemp[time] = {
                                    x: time,
                                    y: +data[i].data[j][1],
                                    index: j,
                                    seriesIndex: i
                                };
                            }
                        }
                    }
                }
                max = _.max(stackArrTemp, function(obj) {
                    return obj.y;
                });
            }

            this.maxOffSet.x = max.x;
            this.maxOffSet.y = max.y;
            this.maxOffSet.s = '';
            this.maxOffSet.index = max.index;
            this.maxOffSet.seriesIndex = max.seriesIndex;
        }

        if (this.maxOffSet.y == null || this.maxOffSet.x == null || (this.maxOffSet.y + this.maxOffSet.x) <= 0 || this._type == PlotChart.type.exPie) {
            this._removeMaxValueTip();
            return;
        }

        var seriesColor = null;
        var backgroundColor = null;

        if (this._isStack || ! this.serieseList[this.maxOffSet.seriesIndex]) {
            backgroundColor = '#000';
        } else {
            seriesColor = this.serieseList[this.maxOffSet.seriesIndex].color;
            backgroundColor = seriesColor ? seriesColor : this._chartOption.colors[this.maxOffSet.seriesIndex];
        }
        var offSet = this.plot.pointOffset({
            x: this._chartOption.xaxis.mode == 'categories' ? this.maxOffSet.index : this.maxOffSet.x,
            y: this._chartOption.yaxis.mode == 'categories' ? this.maxOffSet.index : this.maxOffSet.y,
            yaxis: (this.maxOffSet.yaxis) ? this.maxOffSet.yaxis : 1
        });
        var top = null;

        var xAxisValue = this._chartOption.xaxis.mode == 'time' ? $.plot.formatDate(new Date(this.maxOffSet.x), this.maxValueAxisTimeFormat) : (this._chartOption.xaxis.mode == 'categories' ? this.maxOffSet.x : common.Util.numberFixed(this.maxOffSet.x, 3));
        var yAxisValue = this._chartOption.yaxis.mode == 'time' ? $.plot.formatDate(new Date(this.maxOffSet.y), this.maxValueAxisTimeFormat) : (this._chartOption.yaxis.mode == 'categories' ? this.maxOffSet.y : common.Util.numberFixed(this.maxOffSet.y, 3));

        textFormat = textFormat.replace('%x', xAxisValue).replace('%y', yAxisValue).replace('%s', this.maxOffSet.s);
        // var style = 'position:absolute;top:' + top + 'px;left:' + offSet.left + 'px;height:15px;border-radius:4px;background: linear-gradient(to right, #DD0E0E 0%, #E0A3A3 50%,#DB0606 100%);line-height: 14px;color: #FFF;padding:0px 4px;text-align:center';
        var style = 'position:absolute;height:15px;border-radius:4px;background-color: '+ backgroundColor +';line-height: 14px;color: #FFF;padding:0px 4px;text-align:center;z-index:2';

        // lineStyle = 'position:absolute;top:12px;width:2px;left:50%;height:0px;background: linear-gradient(to bottom, #DD0E0E 0%, #fff 100%);';
        lineStyle = 'position:absolute;width:0;height:0;left:50%;border-left: 4px solid transparent;border-right: 4px solid transparent;border-top: 4px solid ' + backgroundColor + ';';

        this._removeMaxValueTip();

        this.maxValueTip = $('<div style="' + style + '">' + textFormat + '<div style="' + lineStyle + '"></div></div>');
        this._$chartTarget.append(this.maxValueTip);

        var tipCss = null;
        var defualtBorderStyle = '4px solid ' + backgroundColor;
        var borderCss = {
            borderLeft: defualtBorderStyle,
            borderRight: defualtBorderStyle,
            borderTop: defualtBorderStyle,
            borderBottom: defualtBorderStyle
        };
        var lineLeft = 0;
        var lineTop = 0;
        var tipOuterWidth = this.maxValueTip.outerWidth();
        var tipOuterHeight = this.maxValueTip.outerHeight();

        if (this._isHorizontal) {
            lineTop = 4;
            top = offSet.top - 6;

            // x 축 기준으로 반대로 되어 있으면
            if (this._chartOption.xaxis.transform) {
                offSet.left -= this.maxValueTip.width() + 34;

                borderCss.borderRight = '4px solid transparent';
                borderCss.borderTop = '4px solid transparent';
                borderCss.borderBottom = '4px solid transparent';

                lineLeft = -1;
            } else {
                offSet.left += 10;
                lineLeft = -7;

                borderCss.borderLeft = '4px solid transparent';
                borderCss.borderTop = '4px solid transparent';
                borderCss.borderBottom = '4px solid transparent';
            }

        } else {
            top = offSet.top - 21;
            lineTop = tipOuterHeight;
            borderCss.borderBottom = '0px solid transparent';

            if (offSet.left < tipOuterWidth) {
                width = 0;
                // left = 0;
                tipCss = '4px 4px 4px 0px';
                borderCss.borderLeft = '0px solid transparent';
                borderCss.borderRight = '4px solid transparent';
                lineLeft = 0;
            } else if (offSet.left > canvasWidth - tipOuterWidth) {
                width = tipOuterWidth;
                // left = 100 - ( 2 / width * 100);
                tipCss = '4px 4px 0px 4px';
                borderCss.borderLeft = '4px solid transparent';
                borderCss.borderRight = '0px solid transparent';
                lineLeft = -4;
            } else {
                width = tipOuterWidth / 2;
                // left = 50;
                tipCss = '4px 4px 4px 4px';
                borderCss.borderLeft = '4px solid transparent';
                borderCss.borderRight = '4px solid transparent';
                lineLeft = -4;
            }
        }

        this.maxValueTip.css({
            'left': offSet.left - width,
            'top': top,
            'border-radius' : tipCss
        }).show().children().eq(0).css({
            'left': width + lineLeft,
            'top' : lineTop,
            'border-right': borderCss.borderRight,
            'border-left' : borderCss.borderLeft,
            'border-top' : borderCss.borderTop,
            'border-bottom' : borderCss.borderBottom
        });
    },

    /**
     * 클릭된 마우스 좌표에서 가장 가까운 데이터의 좌표에 구분선을 그린다
     * @param pos 클릭된 마우스 좌표 {x : 1, y : 1}
     * @returns 클릭된 마우스 좌표에서 가장 가까운 데이터
     */
    drawIndicator: function(offset) {
        if (!this.plot || ! offset || typeof offset != 'object' || offset.x == null || this._totalDataLength == 0) {
            if (this.indicatorLegend) {
                this.indicatorLegend.remove();
            }
            return;
        }

        var pos = {
            x : offset.x,
            y : offset.y
        };

        if (pos.x < this._chartOption.xaxis.min) {
            pos.x = this._chartOption.xaxis.min;
        } else if (pos.x > this._chartOption.xaxis.max) {
            pos.x = this._chartOption.xaxis.max;
        }

        var interval = this.interval,
            fromPos = this._dateIntervalInit(pos.x, interval),
            toPos = 0,
            o = null,
            item = {};

        var datas = this.plot.getData();
        var seriesLen = datas.length, dataLen = null;
        var yValues = [], legendFormat = this.indicatorLegendFormat;
        var i = 0, j = 0, k = 0, maxValue = 0;

        if (interval < 86400000) {
            fromPos -= (fromPos % interval);
        }
        toPos = fromPos + interval;

        if (pos.x - fromPos < interval / 2) {
            o = this.plot.pointOffset({
                x: fromPos,
                y: pos.y,
                yaxis: (this.maxOffSet.yaxis) ? this.maxOffSet.yaxis : 1
            });
            item.x = fromPos;
        } else {
            o = this.plot.pointOffset({
                x: toPos,
                y: pos.y,
                yaxis: (this.maxOffSet.yaxis) ? this.maxOffSet.yaxis : 1
            });
            item.x = toPos;
        }

        // if(pos.x % interval < interval / 2 ){
        //    o = this.plot.pointOffset({
        //        x: fromPos,
        //        y: pos.y
        //    });
        //    item.x = fromPos;
        // }else{
        //    o = this.plot.pointOffset({
        //        x: toPos,
        //        y: pos.y
        //    });
        //    item.x = toPos;
        // }
        //
        // this.plotRedraw();

        for (i; i < seriesLen; i++) {
            for (j = 0, dataLen = datas[i].data.length; j < dataLen; j++) {
                if (item.x == datas[i].data[j][0]) {
                    yValues.push({
                        series: datas[i].id,
                        y : datas[i].data[j][1]
                    });

                    pos.dataIndex = j;
                }
            }
        }

        item.y = yValues;

        // stack 차트일 경우 시리즈의 y값을 모두 더한 값의 위치에 레이블을 표시한다.
        // stack 차트일 경우 format 형식에 series 가 있어도 무시한다.
        for (k; k < yValues.length; k++) {
            if (yValues[k].y) {
                if (this._isStack) {
                    maxValue += (yValues[k].y);
                } else {
                    maxValue = (yValues[k].y > maxValue ? yValues[k].y : maxValue);
                }
            }
        }

        var xAxisValue = this._chartOption.xaxis.mode == 'time' ? $.plot.formatDate(new Date(item.x), this.indicatorLegendAxisTimeFormat) : common.Util.numberFixed(item.x, 3);
        var yAxisValue = this._chartOption.yaxis.mode == 'time' ? $.plot.formatDate(new Date(maxValue), this.indicatorLegendAxisTimeFormat) : common.Util.numberFixed(maxValue, 3);

        legendFormat = legendFormat.replace('%x', xAxisValue).replace('%y', yAxisValue);

        var maxY = this.plot.pointOffset({
                x: 0,
                y: this.plot.getAxes().yaxis.max,
                yaxis: (this.maxOffSet.yaxis) ? this.maxOffSet.yaxis : 1
            }).top - 12;
        var realMaxY = this.plot.pointOffset({
            x: 0,
            y: maxValue,
            yaxis: (this.maxOffSet.yaxis) ? this.maxOffSet.yaxis : 1
        }).top;

        this.prevIndicatorPos = pos;

        this._createIndicatorTip(15, o.left, maxY, legendFormat, realMaxY);

        return item;
    },

    // setSeriesVisible: function(flag){
    //    if(this.target.serieseList[this.index].show){
    //        this.target.serieseList[this.index].show = false;
    //        this.iconEl.dom.style.backgroundImage = 'url(../images/series_off.png)';
    //    }else{
    //        this.target.serieseList[this.index].show = true;
    //        this.iconEl.dom.style.backgroundImage = 'url(../images/series_on.png)';
    //    }
    //    this.target.plotRedraw();
    // },
    /*
     openHistryInfo: function(series){
     var i = 0, j = 0, id = '', temp = null, index = 0,
     seriese = (this.target ? this.target.serieseList : this.serieseList),
     value = null, columnWidth = 120;


     var len = 0;
     var maxIndex = 0;
     var serieseLen = 0;
     for(var ix = 0, ixLen = seriese.length; ix < ixLen; ix++){
     serieseLen = seriese[ix].data.length;
     if(serieseLen > len){
     maxIndex = ix;
     len = serieseLen;
     }
     }

     if(len == 0){
     return;
     }

     var localType = this.interval >= 60000 ? 'm-d H:i' : 'm-d H:i:s';

     var grid = Ext.create('Exem.BaseGrid', {
     title: this.text,
     layout: 'fit',
     height: '100%',
     width: '100%',
     defaultPageSize: 720,
     localeType: localType,
     itemdblclick: function(me, record, item, index, e, eOpts){
     if(this.showIndicator){
     this.drawIndicator({x: +new Date(record.data.time)});
     }

     if(this.historyInfoDblClick){
     this.historyInfoDblClick(this, record, item, index, e, eOpts);
     }
     }.bind(this.target || this)
     });

     grid.beginAddColumns();
     grid.addColumn(common.Util.TR('Time'), 'TIME', 100, Grid.DateTime, true, false);

     var type = null;
     var time = null;
     var milliTime = null;
     if(this.index == 0 || this.index == undefined){
     for(i = 0 ; i < seriese.length; i++){
     if(! seriese[i].visible){
     continue;
     }
     if(seriese[i].data[0] && seriese[i].data[0][1] != null){
     if((seriese[i].data[0][1] + '').indexOf('.') > -1 ){
     type = Grid.Float;
     }else{
     type = Grid.Number;
     }
     }

     id = seriese[i].id;
     grid.addColumn(common.Util.TR(seriese[i].label || id), id, columnWidth, type, true, false);
     }
     grid.endAddColumns();

     var rowData = null;
     var timeData = null;
     for(i = 0 ; i < len; i++){

     timeData = seriese[maxIndex].data[i][0];
     if(! timeData){
     continue;
     }

     time = new Date(timeData);
     milliTime = +time;

     if(milliTime < this._chartOption.xaxis.min || milliTime > this._chartOption.xaxis.max){
     continue;
     }

     rowData = [time];
     for(j = 0; j < seriese.length; j++){
     if(! seriese[j].visible){
     continue;
     }

     if(seriese[j].data[i]){
     value = seriese[j].data[i][1];
     }else{
     value = '';
     }

     rowData.push(value);
     }
     grid.addRow(rowData);
     }
     }else{
     index = this.index - 1;
     id = seriese[index].id;

     grid.addColumn(common.Util.TR(seriese[index].label || id), id, columnWidth, Grid.Float, true, false);

     for(i = 0 ; i < len; i++){
     grid.addRow([new Date(seriese[index].data[i][0]), value]);
     }
     }

     //        grid.addListener('itemdblclick', function(me, record, item, index, e, eOpts){
     //            if(this.showIndicator){
     //                this.drawIndicator({x: +new Date(record.data.time)});
     //            }
     //
     //            if(this.historyInfoDblClick){
     //                this.historyInfoDblClick(this, record, item, index, e, eOpts);
     //            }
     //        }, this.target || this);

     grid.drawGrid();

     Ext.create('Exem.XMWindow',{
     title: common.Util.TR(this.title || 'History Information'),
     width: Math.min(grid._fieldsList.length * columnWidth+ 20, window.outerWidth * 0.8),
     height: 400,
     layout: 'fit',
     closeAction: 'close',
     maximizable: false,
     items: grid
     }).show();

     if(this.prevIndicatorPos){
     grid.pnlExGrid.getView().focusRow(this.prevIndicatorPos.dataIndex || 0);
     }


     },
     */
    openHistoryInfo: function() {
        if (!this.plot || this._totalDataLength == 0) {
            return;
        }

        var serieseData = this.plot.getData();
        var type = Grid.Float;

        var grid = Ext.create('Exem.BaseGrid', {
            title: this.text,
            layout: 'fit',
            height: '100%',
            width: '100%',
            cls : 'Exem-BaseGrid Exem-CanvasChart-OpenHistoryInfo',
            defaultPageSize: 720,
            itemdblclick: function(me, record, item, index, e, eOpts) {
                if (this.showIndicator) {
                    this.drawIndicator({x: +new Date(record.data.time)});
                }

                if (this.historyInfoDblClick) {
                    this.historyInfoDblClick(this, record, item, index, e, eOpts);
                }
            }.bind(this)
        });

        var ix = null, ixLen = null;
        var jx = null, jxLen = null;
        var columnWidth = 120;
        var rowData = null;
        var dataLength = 0;
        var dataIndex = 1;
        var stdIndex = 0;
        var typeIndex = 0;
        var dispTime = null;
        var timeWidth = null;

        if (this.onIndexValue) {
            if (this.interval >= PlotChart.time.exDay) {
                dispTime = common.Util.getLocaleType(DisplayTimeMode.None);
                timeWidth = 100;
            } else if (this.interval >= PlotChart.time.exHour) {
                dispTime = common.Util.getLocaleType(DisplayTimeMode.H);
                timeWidth = 110;
            } else if (this.interval >= PlotChart.time.exMin) {
                dispTime = common.Util.getLocaleType(DisplayTimeMode.HM);
                timeWidth = 120;
            } else {
                dispTime = common.Util.getLocaleType(DisplayTimeMode.HMS);
                timeWidth = 130;
            }

            grid.changeLocale(dispTime);
            // column add
            grid.beginAddColumns();

            for (ix = 0, ixLen = serieseData.length; ix < ixLen; ix++) {
                if (serieseData[ix].gridType === 1) {
                    type = Grid.Number;
                }
                if (serieseData[ix].visible) {
                    grid.addColumn('Time', 'TIME' + serieseData[ix].id, timeWidth, Grid.DateTime, true, false);
                    grid.addColumn((serieseData[ix].label || serieseData[ix].id), serieseData[ix].id, columnWidth, type, true, false);
                    grid._columnsList[(ix * 2) + 1].DecimalPrecision = serieseData[ix].toFixedNumber == null ? this.toFixedNumber : serieseData[ix].toFixedNumber;

                    if (serieseData[ix].data.length > dataLength) {
                        dataLength = serieseData[ix].data.length;
                    }
                }
            }
            grid.endAddColumns();
            // data add
            for (ix = 0, ixLen = dataLength; ix <= ixLen; ix++) {
                rowData = [];
                for (jx = 0, jxLen = serieseData.length; jx < jxLen; jx++) {
                    if (serieseData[jx].visible && serieseData[jx].data[ix]) {
                        rowData.push(new Date(serieseData[jx].ticks[ix]));
                        rowData.push(serieseData[jx].data[ix][1]);
                    }
                }
                grid.addRow(rowData);
            }
        } else if (this._type == PlotChart.type.exPie) { // pie chart
            // column add
            grid.beginAddColumns();
            rowData = [];
            for (ix = 0, ixLen = serieseData.length; ix < ixLen; ix++) {
                if (serieseData[ix].gridType === 1) {
                    type = Grid.Number;
                }

                grid.addColumn(serieseData[ix].label, serieseData[ix].label, columnWidth, type, true, false);
                grid._columnsList[ix].DecimalPrecision = serieseData[ix].toFixedNumber == null ? this.toFixedNumber : serieseData[ix].toFixedNumber;

                rowData[ix] = +serieseData[ix].data[0][1];
            }
            grid.endAddColumns();
            // data add

            grid.addRow(rowData);
        } else if (this._chartOption.xaxis.mode == 'categories' || this._chartOption.yaxis.mode == 'categories') { // categories chart
            typeIndex = 0;

            if (this._chartOption.yaxis.mode == 'categories') {
                typeIndex = 1;
                dataIndex = 0;
            }
            // column add
            grid.beginAddColumns();
            grid.addColumn('', 'category', columnWidth, type, true, false);
            for (ix = 0, ixLen = serieseData.length; ix < ixLen; ix++) {
                //if(! serieseData[ix].visible){
                //    continue;
                //}
                if (serieseData[ix].gridType === 1) {
                    type = Grid.Number;
                }

                grid.addColumn((serieseData[ix].label || serieseData[ix].id), serieseData[ix].id, columnWidth, type, true, false);
                grid._columnsList[ix].DecimalPrecision = serieseData[ix].toFixedNumber == null ? this.toFixedNumber : serieseData[ix].toFixedNumber;

                if (serieseData[ix].data.length > dataLength) {
                    dataLength = serieseData[ix].data.length;
                    stdIndex = ix;
                }

            }
            grid.endAddColumns();
            // data add

            for (ix = 0, ixLen = dataLength; ix < ixLen; ix++) {
                rowData = new Array(serieseData.length + 1);
                for (jx = 0, jxLen = serieseData.length; jx < jxLen; jx++) {
                    if (jx == 0) {
                        rowData[0] = serieseData[stdIndex].data[ix][typeIndex];
                    }

                    //if(! serieseData[jx].visible){
                    //    continue;
                    //}

                    rowData[jx + 1] = +serieseData[jx].data[ix][dataIndex];
                }
                grid.addRow(rowData);
            }
        } else { // time chart
            typeIndex = 0;

            var option = this._xAxisMaxRange();
            var fromTime = option.min;
            var toTime = option.max;
            var time = null;

            if (this._isHorizontal) {
                typeIndex = 1;
                dataIndex = 0;
                //fromTime = option.yaxis.min
                //toTime = option.yaxis.max;
            }


            if (this.interval >= PlotChart.time.exDay) {
                dispTime = common.Util.getLocaleType(DisplayTimeMode.None);
                timeWidth = 100;
            } else if (this.interval >= PlotChart.time.exHour) {
                dispTime = common.Util.getLocaleType(DisplayTimeMode.H);
                timeWidth = 110;
            } else if (this.interval >= PlotChart.time.exMin) {
                dispTime = common.Util.getLocaleType(DisplayTimeMode.HM);
                timeWidth = 120;
            } else {
                dispTime = common.Util.getLocaleType(DisplayTimeMode.HMS);
                timeWidth = 130;
            }

            grid.changeLocale(dispTime);
            // column add
            grid.beginAddColumns();
            grid.addColumn('Time', 'TIME', timeWidth, Grid.DateTime, true, false);
            for (ix = 0, ixLen = serieseData.length; ix < ixLen; ix++) {
                if (!serieseData[ix].visible) {
                    continue;
                }
                if (serieseData[ix].gridType === 1) {
                    type = Grid.Number;
                }

                if (serieseData[ix].band) {
                    type = Grid.String;
                }

                grid.addColumn((serieseData[ix].label || serieseData[ix].id), serieseData[ix].id, columnWidth, type, true, false);
                grid._columnsList[ix + 1].DecimalPrecision = serieseData[ix].toFixedNumber == null ? this.toFixedNumber : serieseData[ix].toFixedNumber;

                if (serieseData[ix].data.length > dataLength) {
                    dataLength = serieseData[ix].data.length;
                    stdIndex = ix;
                }
            }
            grid.endAddColumns();
            // data add

            //dataLength = (toTime - fromTime) / this.interval;

            for (ix = 0, ixLen = dataLength; ix <= ixLen; ix++) {
                if (serieseData[stdIndex].data[ix]) {
                    time = serieseData[stdIndex].data[ix][typeIndex];

                    if (time >= fromTime && time <= toTime) {
                        rowData = [];
                        rowData[0] = new Date(time);

                        for (jx = 0, jxLen = serieseData.length; jx < jxLen; jx++) {
                            if (serieseData[jx].visible && serieseData[jx].data[ix]) {
                                if (Array.isArray(serieseData[jx].data[ix][dataIndex])) {
                                    if (serieseData[jx].data[ix][dataIndex][0] !== null && serieseData[jx].data[ix][dataIndex][1] !== null) {
                                        rowData[jx + 1] = +serieseData[jx].data[ix][dataIndex][0].toFixed(3) + ' ~ ' + +serieseData[jx].data[ix][dataIndex][1].toFixed(3);
                                    }
                                } else {
                                    rowData[jx + 1] = serieseData[jx].data[ix][dataIndex];
                                }
                            }
                        }
                        grid.addRow(rowData);
                    }
                }
            }
            /*
             for(ix = 0, ixLen = serieseData.length; ix < ixLen; ix++){
             if(! serieseData[ix].visible){
             continue;
             }

             grid.addColumn((serieseData[ix].label || serieseData[ix].id), serieseData[ix].id, columnWidth, type, true, false);
             grid._columnsList[ix + 1].DecimalPrecision = serieseData[ix].toFixedNumber == null ? this.toFixedNumber : serieseData[ix].toFixedNumber;

             if(serieseData[ix].data.length > dataLength){
             dataLength = serieseData[ix].data.length;
             stdIndex = ix;
             }
             }
             grid.endAddColumns();
             // data add

             dataLength = (toTime - fromTime) / this.interval;

             for(ix = 0, ixLen = dataLength; ix <= ixLen; ix++){
             rowData = new Array(serieseData.length + 1);
             time = fromTime + ( ix * this.interval );

             //rowData[0] = Ext.Date.format(new Date(time), dispTime);
             rowData[0] = new Date(time);

             for(jx = 0, jxLen = serieseData.length; jx < jxLen; jx++){
             if(! serieseData[jx].visible){
             continue;
             }

             if(this._chartOption.xaxis.min <= time && this._chartOption.xaxis.max >= time){
             rowData[jx + 1] = serieseData[jx].data[ix][dataIndex];
             }

             //if(serieseData[jx].data[ix] && time == serieseData[jx].data[ix][typeIndex]){
             // rowData.push(serieseData[jx].data[ix][dataIndex]);
             // rowData[jx + 1] = serieseData[jx].data[ix][dataIndex];
             //}
             }
             grid.addRow(rowData);
             }
             */
        }

        Ext.create('Exem.XMWindow',{
            title: common.Util.TR(this.title || 'History Information'),
            width: Math.min(grid._fieldsList.length * columnWidth + 50, window.outerWidth * 0.8),
            height: 400,
            layout: 'fit',

            items: grid,
            minWidth: 320
        }).show();

        grid.drawGrid();

        if (this.prevIndicatorPos) {
            grid.pnlExGrid.getView().focusRow(this.prevIndicatorPos.dataIndex || 0);
        }

        grid = null;


    },

    /**
     * serieseList 에서 해당 series 를 가져온다.
     * @param id 타입이 Number 일경우(1,2,3 or '1','2','3') index를 참조해서 가져오고
     *        아닐경우 series 에 id 를 비교하여 찾는다
     * @returns 해당 series, 없을경우 null
     */
    getSeries: function(id) {
        var i;

        if (typeof id === 'string') {
            for (i = 0; i < this.serieseList.length; i++) {
                if (this.serieseList[i].id == id) {
                    return this.serieseList[i];
                }
            }
        }
        return this.serieseList[id];

        /*
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
         */
    },

    /**
     * 의존되는 차트 리스트를 추가한다.
     * @param charts 차트 객체 또는 차트 배열 (ex. chart or [chart1, chart2...chart N])
     */
    addDependentChart: function(charts) {
        var option = this.plot.getOptions();

        var min = option.xaxis.min,
            max = option.xaxis.max,
            ix, ixLen;

        if (Array.isArray(charts)) {
            for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
                this._dependentChart.push(charts[ix]);

                charts[ix]._dependentChart = this._dependentChart;

                charts[ix].isZoomIn = this.isZoomIn;

                charts[ix].prevZoomFrom = min;
                charts[ix].prevZoomTo   = max;

                charts[ix]._chartOption.xaxis.min = min;
                charts[ix]._chartOption.xaxis.max = max;

                // charts[ix].zoomIn(option.xaxis.min, option.xaxis.max);
            }
        } else {
            this._dependentChart.push(charts);

            charts._dependentChart = this._dependentChart;

            charts.isZoomIn = this.isZoomIn;

            charts.prevZoomFrom = min;
            charts.prevZoomTo   = max;

            charts._chartOption.xaxis.min = min;
            charts._chartOption.xaxis.max = max;

            // charts.zoomIn(option.xaxis.min, option.xaxis.max);
        }
    },


    /**
     * 의존되는 차트 리스트를 정의한다.
     * @param charts 차트 객체 또는 차트 배열
     */
    setDependentChart: function(charts) {
        var option = this.plot.getOptions(),
            ix, ixLen;

        if (Array.isArray(charts)) {
            this._dependentChart.length = 0;

            for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
                this._dependentChart.push(charts[ix]);
                charts[ix]._dependentChart = this._dependentChart;

                charts[ix].zoomIn(option.xaxis.min, option.xaxis.max);
            }

            this._dependentChart.unshift(this);
        } else {
            this._dependentChart.length = 0;
            this._dependentChart.push(this);
            this._dependentChart.push(charts);

            charts._dependentChart = this._dependentChart;

            charts.zoomIn(option.xaxis.min, option.xaxis.max);
        }
    },

    /**
     * 의존되는 차트 리스트를 추가한다.
     * @param from  시간(1397536844334)
     * @param to 시간(1397536844334)
     */
    dependentChartZoomIn: function(from, to) {
        var min = this._dateIntervalInit(from, this.interval, true, 0);
        var max = this._dateIntervalInit(to, this.interval, false);
        var datalength = null,
            ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = this._dependentChart.length; ix < ixLen; ix++) {
            datalength = 0;
            for (jx = 0, jxLen = this._dependentChart[ix].serieseList.length; jx < jxLen; jx++) {
                datalength += this._dependentChart[ix].serieseList[jx].data.length;
            }

            if (datalength == 0) {
                continue;
            }


            if (!this._dependentChart[ix].onZooming) {
                this._dependentChart[ix].onZooming = true;
                this._dependentChart[ix].zoomIn(min, max);
            }

        }
    },

    /**
     * 의존되는 차트를 제거한다.
     */
    clearDependentChart: function() {
        this._dependentChart.length = 0;
        this._dependentChart.push(this);
    },
    // getSeries: function(id){
    //    if(isNaN(+id)){
    //        for(var i = 0; i < this.serieseList.length; i++){
    //            if(this.serieseList[i].id == id){
    //                return this.serieseList[i];
    //            }
    //        }
    //    }else if(typeof id == 'string'){
    //        return this.serieseList[id];
    //    }
    //
    //    return null;
    // },

    /**
     * 차트의 x축 길이를 설정한다
     * @param from 시작시간
     * @param to 끝시간
     */
    _setChartRange: function(from, to) {
        this._chartOption.xaxis.min = from;
        this._chartOption.xaxis.max = to;

        this._xaxisMin = from;
        this._xaxisMax = to;
    },

    setChartRange: function(from, to) {
        this._chartOption.xaxis.min = from;
        this._chartOption.xaxis.max = to;

        this._xaxisMin = from;
        this._xaxisMax = to;

        this.fromTime = from;
        this.toTime = to;
    },

    /**
     * @param date      초기화 될 date
     * @param interval  date가 얼마의 간격으로 초기화 될건지에 대한 interval
     * @param fisrtFlag
     * @param type      from : 0, to :1
     * @returns {Date}
     */
    _dateIntervalInit: function(date, interval, firstFlag, type) {
        var d = new Date(date),
            min;

        // interval이 초 단위 인경우
        if (interval >= 1000) {
            d.setMilliseconds(0);
        }
        // interval이 분 단위 인경우
        if (interval >= 60000) {
            d.setSeconds(0);
        }
        // interval이 시간 단위 인경우
        if (interval >= 3600000) {
            d.setMinutes(0);
        }
        // interval이 일 단위 인경우
        if (interval >= 86400000) {
            d.setHours(0);
        }

        if (firstFlag) {

            if (interval == PlotChart.time.exTenMin) {
                min = d.getMinutes();

                // if(min % 10 != 0){
                //     d = (+d) + ((10 - (min < 10 ? min : (min + '')[1])) * 1000 * 60);
                // }
                if (min % 10 != 0) {
                    d = (+d) - ((min < 10 ? min : (min + '')[1]) * 1000 * 60);

                    if (type == 0) {
                        d = (+d) + interval;
                    }
                }
            }

            if (type == 1 && ! this.xaxisCurrentToTime) {
                d = (+d) - interval;
            }
        }

        return +d;
    },

    createToolTip: function() {
        this.$toolTip = $('<div class="plot-tool-tip"></div>').css({
            'position': 'absolute',
            'display': 'none',
            'z-index': 100000,
            'color': '#fff',
            'background-color': '#000',
            // 'background-image': 'linear-gradient(to right, rgb(78, 78, 78) 0%, rgb(138, 138, 138) 50%, rgb(78, 78, 78) 100%)',
            'padding': '4px',
            'border-radius': '4px'
        });

        $('body').append(this.$toolTip);
    },

    /**
     * 시리즈 show ,hide 기능
     * @param series    series index
     * @param falg      true : show, false : hide
     */
    /**
     * 시리즈 show ,hide 기능
     * @param seriesIndex    series index
     * @param falg      true : show, false : hide
     */
    setSeriesVisible: function(seriesIndex, flag) {
        var tmpLen, visibleCount, colorObj,
            ix, ixLen;

        if (this.serieseList[seriesIndex]) {
            //if (this.serieseList[seriesIndex].data.length == 0 && !this.serieseList[seriesIndex].hideLegend) {
            //    return;
            //}
            tmpLen = (this.serieseList[seriesIndex].data) ? this.serieseList[seriesIndex].data.length : undefined;
            if (tmpLen == 0 && !this.serieseList[seriesIndex].hideLegend) {
                return;
            }
            if (!flag) {
                visibleCount = 0;
                for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
                    if (this.serieseList[ix].visible && ! this.serieseList[ix].labelObj.hidden) {
                        visibleCount++;
                    }
                }

                if (visibleCount == 1) {
                    return;
                }
            }

            this.serieseList[seriesIndex].visible = flag;

            if (this.serieseList[seriesIndex].labelObj) {
                colorObj = this.serieseList[seriesIndex].labelObj.items.items[0];
                if (colorObj && colorObj.el && colorObj.itemId == 'color') {
                    if (flag) {
                        colorObj.el.dom.style.background = this.serieseList[seriesIndex].color;
                    } else {
                        colorObj.el.dom.style.background = '';
                    }
                    colorObj.selected = flag;
                }
            }
        }
    },


    /**
     * @param series index
     * @returns true | false
     */
    isVisibleSeries: function(series) {
        var result = false;
        if (this.serieseList[series]) {
            result = this.serieseList[series].visible;
        }

        return result;
    },

    /**
     * 차트 line width 설정
     * @param series index
     * @param width
     */
    setLineWidth: function(series, width) {
        if (this.serieseList[series]) {
            this.serieseList[series][this.serieseList[series].type].lineWidth = width;
        }
    },

    /**
     * X축 레이블 숨기기
     * @param flag [boolean]
     */
    displayXAxis: function(flag) {
        if (this._$chartTarget == null || this._$chartTarget.length == 0) {
            return;
        }

        if (flag) {
            this._$chartTarget.find('.flot-x-axis').show();
        } else {
            this._$chartTarget.find('.flot-x-axis').hide();
        }
    },

    /**
     * Y축 레이블 숨기기
     * @param flag [boolean]
     */
    displayYAxis: function(flag) {
        if (this._$chartTarget == null || this._$chartTarget.length == 0) {
            return;
        }

        if (flag) {
            this._$chartTarget.find('.flot-y-axis').show();
        } else {
            this._$chartTarget.find('.flot-y-axis').hide();
        }
    },

    /**
     * @note 시리즈의 Y축 최소 값을 가져온다
     * @param seriesIndex 시리즈 인덱스
     * @returns
     */
    getYMinValue: function(seriesIndex) {
        if (!this.plot) {
            return null;
        }

        var series = this.plot.getData()[seriesIndex];
        if (!series) {
            return null;
        }

        return series.yaxis.min;
    },
    /**
     * @note 시리즈의 X축 최소 값을 가져온다
     * @param seriesIndex 시리즈 인덱스
     * @returns
     */
    getXMinValue: function(seriesIndex) {
        if (!this.plot) {
            return null;
        }

        var series = this.plot.getData()[seriesIndex];
        if (!series) {
            return null;
        }

        return series.xaxis.min;
    },

    checkUnitType: function(type) {
        var tickFormatFunc = null;

        if (this._chartOption.yaxis.mode == null && !type) {
            tickFormatFunc = function(val, axis) {
                return common.Util.numberWithComma(common.Util.toFixed(val, axis.tickDecimals));
            }.bind(this);

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
                    if (val >= 1000000000) {
                        return (val / 1000000000) + 'G';
                    } else if (val >= 1000000) {
                        return (val / 1000000) + 'M';
                    }

                    if (val >= 1000) {
                        return (val / 1000) + 'k';
                    } else {
                        return val;
                    }
                };
                break;
            default:
                break;
        }

        return tickFormatFunc;
    },

    /**
     * 테마에 따라 폰트, 라인 색상 설정
     */
    setColorByTheme: function(type) {
        if (type === 'black') {
            this._chartOption.grid.borderColor = '#81858A';
            this._chartOption.grid.color       = '#81858A';
            this._chartOption.xaxis.font.color = '#ABAEB5';
            this._chartOption.yaxis.font.color = '#ABAEB5';
        } else {
            this._chartOption.grid.borderColor = '#ccc';
            this._chartOption.grid.gridColor   = '#ccc';
            this._chartOption.xaxis.font.color = '#555';
            this._chartOption.yaxis.font.color = '#555';
        }
        this.plotReSize();
    },

    /**
     * ZOOM 상태 설정
     * Root 차트에 대해 ZOOM 상태 설정을 하게 되면 의존관계에 있는 차트 모두 변경됩니다.
     * @param flag{boolean}
     */
    setZoomStatus: function(flag) {
        var ix, ixLen;

        this.isZoomIn = flag;

        if (this._dependentChart && this._dependentChart.length > 0) {
            for (ix = 0, ixLen = this._dependentChart.length; ix < ixLen; ix++) {
                this._dependentChart[ix].isZoomIn = flag;
            }
        }
    }

    //listeners: {
    //    afterlayout: function(){
    //        if(this._isFirstFlag){
    //            this._$chartTarget = $(this._chartTarget);
    //
    //            this._chartOption.xaxis.show = this.firstShowXaxis;
    //            this._chartOption.yaxis.show = this.firstShowYaxis;
    //            this.plotDraw();
    //            this.plotChartEvent();
    //            this._chartOption.xaxis.show = this.chartType.xaxis;
    //            this._chartOption.yaxis.show = this.chartType.yaxis;
    //            this._isFirstFlag = false;
    //        }
    //    },
    //
    //    beforedestroy: function() {
    //        if (this.$toolTip) {
    //            this.$toolTip.remove();
    //        }
    //
    //        if (this.indicatorLegend) {
    //            this.indicatorLegend.remove();
    //        }
    //
    //        this._removeMaxValueTip();
    //
    //        this.loadingMask.destroy();
    //        this.loadingMask = null;
    //        Ext.destroy(this.contextMenu);
    //        Ext.destroy(this.visibleSeriesMenu);
    //        Ext.destroy(this.historyInfoMenu);
    //        if (this.plot != null) this.plot.shutdown();
    //    }
    //}
});