/**
 * @param arg(Object)
 * @returns {BaseCanvasChart}
 * @author hwan
 *
 *  dependent JQuery, jquery.flot.js
 *
 *  chart color, type,
 */

Ext.define("Exem.chart.RealCanvasChart", {
    extend: 'Ext.container.Container',
    layout: 'fit',
    height: '100%',
    width: '100%',
    flex: 1,
    showHistoryInfo: true,
    showMaxValue: true,                         // 시리즈 중 최고 높은 값을 표시해준다.(pie 차트는 적용되지 않는다)
    maxValueFormat: '%y',                       // 최고 높은 값을 어떻게 표시할지 설정 ex) [%s] %x : %y  (%s = series name, %x = x축 값, %y = y축 값)
    maxValueAxisTimeFormat: '%H:%M',            // 최고 높은 값의 팁 표시중 X 축이나 Y 축 값이 Time 값일 경우 Time Format 설정


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
                                                        %Y: year (four digits)
                                                        %p: am/pm
                                                        %P: AM/PM (uppercase version of %p)
                                                        %w: weekday as number (0-6, 0 being Sunday)
                                                    */
    showTooltip: true,                          // 차트 마우스 오버시 툴팁 설정 default: true
    toolTipFormat: '[%s] %x : %y',
    toolTipTimeFormat: '%H:%M',
    indicatorLegendFormat: '%y',                // indicator에 x,y축 값 힌트를 어떻게 표시할지 설정 ex) %x : %y  (%x = x축 값, %y = y축 값. series name 은 표시하지 않는다)
    indicatorLegendAxisTimeFormat: '%H:%M',     // indicator X 축이나 Y 축 값이 Time 값일 경우 Time Format 설정
    showContextMenu: true,                     // 차트 context menu 설정 default: false
//    showZoomIn: false,                          // 차트 드레그 선택 영역 zoom in default: false
    mouseSelect: false,                         // 차트 드레그 선택 영역 설정 default: false
    mouseSelectMode: 'x',                       // 차트 드레그 선택시 x축 y축 선택 default: x 축으로만 선택 가능하게
    serieseList : null,                         // 차트 시리즈 리스트
    chartType: null,                            // 차트 옵션
    plot: null,                                 // 차트 객체
    chartTimer: null,                           // 차트 타이머
    chartDuration: 2000,                        // 차트 타이머 주기
    interval: PlotChart.time.exSecond,          // 차트 간격 default: 60초
    chartProperty: null,
    dataBufferSize: null,                       // 차트 데이터 사이즈 설정( 설정 시 addValue 를 사용하여 데이터를 넣게 되면 버퍼 이상의 데이터가 쌓였을 경우 자동으로 삭제한다)
    isDataBufferInit: false,
    higiLighHold : false,                       // 차트 영역중 빈 공간을 클릭 하였을 때 highlight 를 유지 할 것인지에 대한 설정
    orderByTime: false,                         // true 일 경우 addValue 로 데이터를 넣었을 때 타임 순선대로 정렬해서 넣는다.
    imageCaptureDom: null,                      // context menu의 save image 를 했을때 캡쳐 되는 범위

    chartLineWidth: 3,                          // 차트 그릴때 line width 설정
    hoverDataInfo : null,                       // 데이터 마우스 오버시 데이터의 정보를 저장한다.

    plotclick: null,
    plothover: null,
    plotdblclick: null,
    plotselection: null,
    plotYLabelClick: null,
    plotYLabelRightClick: null,

    historyInfoDblClick: null,

    maxOffSet: null,                            // 시리즈 중 최고 값 좌표
    minOffSet: null,                            // 시리즈 중 최저 값 좌표
    xaxisCurrentToTime: false,                  // x축 데이터가 타임일때 지정된 totime 시간까지 데이터를 표시할건지에 대한 설정 (false: totime - interval , true: totime)
    timeBrush: null,
    showDayLine: true,                          // 하루 단위의 선을 긋는 옵션
    showXAxis : true,
    showYAxis : true,

    showTitle: false,                       // 차트 타이틀 영역 생성 default: false
    title : null,                           // 차트 타이틀 설정 default: null
    titleAlign: 'left',                     // 차트 타이틀 정렬 설정 (left, center, right) default: left
    titleHeight: 40,                        // 차트 타이틀 영역 높이 조절 default: 40
    titleFontSize: '16px',                  // 차트 타이틀 영역 폰트 설정 default: 16px
    titleBackgroundColor : '#fff',          // 차트 타이틀 영역 백그라운드 색상 설정 default: #eee
    yAxisWidth: 20,                         // 차트 레전드 y축 레이블 영역 넓이 지정 default: 20
    highlightLegend: true,                  // 차트 레전드 영역 마우스 오버 하이라이팅 설정 default: false
    showLegendValueArea: false,             // 차트 레전드 데이터 표시 영역 설정
    legendValueStyle: {                     // 차트 레전드 데이터 표시 영역 설정
        'font-size': '10px'
    },
    showLegendNameArea: true,               // 차트 레전드 이름 영역 표시 설정
    legendVH: 'vbox',                       // 차트 레전드 영역 Vertical, Horizontal 설정 default: Horizontal
    showLegend : false,                     // 차트 레전드 영역 생성 default: false
    legendColorCheckbox: false,             // 차트 레전드 색상 표시 영역 체크 박스 렌더링
    legendWidth : 160,                      // 차트 레전드 영역 넓이 설정 default: 160
    legendHeight: 160,                      // 차트 레전드 영역 높이 설정 default: 160
    legendAlign : 'east',                   // 차트 레전드 영역 위치 설정 default: east (오른쪽)
    legendContentAlign : 'end',             // 차트 레전드의 레이블 위치 설정 (start, center, end)
    legendOrder : 'asc',                    // 차트 레전드 정렬 설정 default: asc (asc, desc)
    legendNameWidth: 90,

    legendNameHighLight: false,             // 차트 레전드 이름 영역 마우스 오버시 하이라이트 기능 설정 default: false

    legendBackgroundColor: '#fff',          // 차트 레전드 영역 백그라운드 색상 설정 default: #ccc
    BackgroundColor: '#fff',                // 차트 영역 백그라운드 색상 설정 default: #fff
    titleStyle : null,
    plotCheckBoxChange: null,
    legendColorClickType: 1,                // 0: history info 그리드, 1: 사용자 이벤트
    legendColorClickToVisible: false,       // 차트 레전드 색깔 영역 클릭시 해당 시리즈 visible 설정
    legendColorClick: null,                 // 차트 레전드 영역중 색깔 영역 클릭 이벤트
    legendNameHover: null,                  // 차트 레전드 이름 영역 마우스 over 이벤트
    legendNameLeave: null,                  // 차트 레전드 이름 영역 마우스 leave 이벤트
    legendNameDblClick: null,               // 차트 레전드 이름 영역 double click 이벤트




    _isStack: false,                            // 차트가 stack 차트로 그려지는지 확인 플레그
    _isFirstFlag: true,                         // 차트 생성시 처음 한번만 실행되게 하는 플레그
    _chartTarget: null,                         // 차트 타겟
    _chartOption: null,                         // 차트 옵션( 내부적으로 쓰는 옵션 )
    _chartContainer: null,                      // 메인 차트 컨테이너
    //_stackArrTemp: {},                          // stack 차트일경우 전체 시리즈 인덱스 별 합을 가지고 있는 변수
    _toolTipTimer: null,
    _dayDiff: null,
    _monthDiff: null,
    _longClickedTimer : null,
    _lineWidth: 0.5,

    constructor: function(config){
        this.callParent(arguments);

        this.initProperty();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });

        this._chartContainer = Ext.create('Ext.container.Container', {
            layout: 'border',
            height: '100%',
            width: '100%',
            flex: 1,
            cls : 'xm-realchart-base'
//            style: {
//                'background-color': '#fff',
//                'overflow': 'inherit'
//            }
        });

        this.add(this._chartContainer);

        this.titleLayer = null,
        this.labelLayer = null,
        this.chartLayer = null;

        var titleStyle = {
            'font-size' : this.titleFontSize,
            'background-color': this.titleBackgroundColor,
            'text-align': this.titleAlign,
            'text-indent': '20px'
        };

        $.extend(titleStyle, this.titleStyle || {});

        this.initChartOption();

        // showTitle 가 true 일 경우 타이틀 레이어 생성
        if(this.showTitle){
            this.titleLayer = Ext.create('Ext.container.Container', {
                region: 'north',
                height: this.titleHeight,
                overflowX: 'auto',
                html: this.title || '',
                cls : 'xm-realchart-title'
                //style: titleStyle
            });
            this._chartContainer.add(this.titleLayer);
        }
        // showLegend 가 true 일 경우 레이블 레이어 생성
        if(this.showLegend){
            this._chartOption.yaxis.yAxisWidth = this.yAxisWidth;
            if(this.legendAlign == 'south' || this.legendAlign == 'north'){
//                var labelContainer = Ext.create('Ext.container.Container',{
//                    region: this.legendAlign,
//    //                layout: 'fit',
//                    split: true,
//                    height: this.legendHeight,
//                    padding: '4 4 4 4',
//                    style: {
//                        'background-color': this.legendBackgroundColor
//                    }
//                });

                this.labelLayer = Ext.create('Ext.container.Container', {
                    region: this.legendAlign,
                    layout : {
                        type: this.legendVH,
                        pack: this.legendContentAlign
                    },
                    overflowY: 'auto',
                    padding: '4 4 4 4',
                    width: this.legendWidth,
                    cls  : 'xm-realchart-label'
//                    style: {
//                        'background-color': this.legendBackgroundColor
//                    }
                });

    //            labelContainer.add(this.labelLayer);
                this._chartContainer.add(this.labelLayer);
            }else{
                this.labelLayer = Ext.create('Ext.container.Container', {
                    layout: this.legendVH,
    //                padding: '4 4 4 4',
                    overflowY: 'auto',
                    split: true,
                    region: this.legendAlign,
                    width: this.legendWidth,
                    height: '100%',
                    cls  : 'xm-realchart-label'
//                    style: {
//                        'background-color': this.legendBackgroundColor
//                    }
                });
                this._chartContainer.add(this.labelLayer);
            }
        }
        // 차트 레이어 생성
        this.chartLayer = Ext.create('Ext.container.Container', {
            layout: 'fit',
            height: '100%',
            region: 'center',
            margin: '4 0 4 16',
            cls   : 'xm-realchart-area'
//            style: {
//                'background-color': this.BackgroundColor
//            }
        });

        this._chartContainer.add(this.chartLayer);

        this._chartTarget = '#'+ this.chartLayer.id;

        this.addListener('render', function(){
            this.el.dom.addEventListener('contextmenu', function(e){ e.preventDefault();});
            this.el.dom.addEventListener('mousedown', function(e){
                this._longClickedTimer = setTimeout(function(self, e){
                    self.contextMenu.showAt([e.pageX, e.pageY]);
                }, 1000, this, e);

            }.bind(this));

            this.el.dom.addEventListener('mouseup', function(e){
                clearTimeout(this._longClickedTimer);
            }.bind(this));

            this.el.dom.addEventListener('mousemove', function(e){
                clearTimeout(this._longClickedTimer);
            }.bind(this));
        });

        this.addListener('destroy', function(self, eOpts ){
            this._removeMaxValueTip();
        });
    },

    /**
     * object 로 정의될 프로퍼티들을 초기화 하는 함수
     */
    initProperty: function(){
        this.serieseList = [];
        this.serieseData = [];

        this.maxOffSet = {
            x: null,
            y: null,
            s: null,
            index: null
        };

        this.minOffSet = {
            x: 0,
            y: 0,
            s: ''
        };

        this.chartType = {
            colors : realtime.Colors,
//            colors : ['#4F74C4', '#72B43C', '#9D6734', '#05a0b1', '#6F4BC3', '#3D4D19',"#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed", '#ff0000', '#000000', '#536859', '#E9F378', '#888A79', '#D67D4B', '#2BEC69' ,'#4A2BEC', '#2BBEEC', '#DDACDF'],

            xaxis: true,
            xMin: null,
            xMax: null,
            xTickLength: 0,
            xTicks: null,
            xLabelFont: null,
            xTransform: null,
            xTickFormat : null,
            timezone: 'browser',
            yaxis: true,
            yaxes: null,
            yLabelWidth: null,
            yMin: 0,
            yMax: null,
            yPosition: 'left',
            yTickLength: null,
            yLabelFont: null,
            yTickFormat: function(val, axis){
                if(this._chartOption.yaxis.mode != null){
                    return;
                }

                return common.Util.numberWithComma(common.Util.numberFixed(val, 2));

            }.bind(this),
            lineWidth: 1,
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
            gridColor: '#ccc'
        };

        $.extend(this.chartType, this.chartProperty || {});

        this._chartOption = {};

        this.hoverDataInfo = {};
    },

    /**
     * 차트에서 쓰일 기본 옵션을 정의
     * 사용자가 xmOption 에서 주어진 값을 대입하여 option 값을 생성한다.
     * @param opt
     */
    initChartOption: function(){
        this._chartOption.series = {
            lines: {
                show: false
            },
            bars: {},
            shadowSize: 0,
            highlightColor: this.chartType.highlightColor
            //curvedLines: {
            //    apply: true,
            //    active: true,
            //    monotonicFit: true
            //}
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
//                autoscaleMargin: 0.2,
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
//                tickSize: this.option.yticksize,
            tickLength: this.chartType.yTickLength,
            labelWidth: this.chartType.yLabelWidth,
            position: this.chartType.yPosition,
            transform: this.chartType.yTransform,
            tickFormatter : this.chartType.yTickFormat,
            inverseTransform: this.chartType.yInverseTransform
        };

        if(this.chartType.yaxes){
            this._chartOption.yaxes = this.chartType.yaxes;
        };

        this._chartOption.grid = {
            margin: {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            },
            axisMargin : 0,
            hoverable: true,
            clickable: true,
//            markings: true,
//            autoHighlight: true,
            borderWidth: this.chartType.borderWidth,
            borderColor: this.chartType.borderColor,
            color: this.chartType.gridColor
        };

        if(this.mouseSelect || this.showZoomIn){
            this._chartOption.selection = {
                mode: this.mouseSelectMode,
                color : '#349BE7'
            };
        }

        if(this.showContextMenu){
            this._createContenxtMenu();
        }
    },

//    _initTimeTick: function(){
//        if(this.interval                            == null
//                || this.serieseList                 == null
//                || this.serieseList.length          == 0
////                || this.serieseList[0].data.length  == 0
//                || this.plot                        == null
//                || this.chartType.xTicks            != null){
//            return;
//        }
//
////        var canvasWidth = this.plot.width() || this.chartLayer.getWidth();
//        var canvasWidth = this.chartLayer.getWidth();
////        var canvasWidth = Math.min(this.plot.getCanvas().width, this.chartLayer.getWidth());
//        var ticksLength = Math.ceil(canvasWidth / (this._chartOption.xaxis.timeformat.length * 10));             // 한글자당 12px로 본다
//
//        var seriesTicks = null;
//        var series = null;
//        var ix = null;
//        var ixLen = null;
//
//        if(canvasWidth <= 0 || ticksLength <= 0){
//            this._chartOption.xaxis.ticks = null;
//            return;
//        }
//
//        if(this._chartOption.xaxis.ticks == null){
//            this._chartOption.xaxis.ticks = [];
//        }else{
//            this._chartOption.xaxis.ticks.length = 0;
//        }
//
//        for(ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
//            if(this.serieseList[ix].visible){
//                series = this.serieseList[ix];
//                seriesTicks = this.serieseList[ix].timeTicks;
//                break;
//            }
//        }
//
//        if(! seriesTicks || seriesTicks.length == 0){
//            return;
//        }
//
//        var inc = 1;
//        var tickIndex = null;
//
//        if(seriesTicks.length > ticksLength){
//            inc = Math.ceil(series._data.length / (ticksLength -1)) - 1;
//
//            for(ix = 0; ix < this.dataBufferSize; ix++){
//                if(ix * inc > this.dataBufferSize){
//                    break;
//                }
//
//                tickIndex = (series._startPoint + (ix * inc));
//                if(tickIndex >= this.dataBufferSize){
//                    tickIndex -= (this.dataBufferSize );
//                }
//
//                this._chartOption.xaxis.ticks.push(seriesTicks[tickIndex]);
//            }
//        }else{
//            this._chartOption.xaxis.ticks = seriesTicks.slice(0);
////            for(ix = series._startPoint, ixLen = seriesTicks.length; ix < ixLen; ix++){
////                this._chartOption.xaxis.ticks[ix] = seriesTicks[ix];
////            }
////
////            for(ix = 0, ixLen = series._startPoint; ix < ixLen; ix++){
////                this._chartOption.xaxis.ticks[ix] = seriesTicks[ix];
////            }
//        }
//
//        seriesTicks = null;
//        series = null;
//    },

    _initTimeTick: function(){
        if(this.interval                            == null
                || this.serieseList                 == null
                || this.serieseList.length          == 0
//                || this.serieseList[0].data.length  == 0
                || this.plot                        == null
                || this.chartType.xTicks            != null){
            return;
        }

//        var canvasWidth = this.plot.width() || this.chartLayer.getWidth();
        var canvasWidth = this.chartLayer.getWidth();
//        var canvasWidth = Math.min(this.plot.getCanvas().width, this.chartLayer.getWidth());
        var ticksLength = Math.ceil(canvasWidth / (this._chartOption.xaxis.timeformat.length * 10));             // 한글자당 12px로 본다

        var ix = null;

        if(canvasWidth <= 0 || ticksLength <= 0 || this.serieseList[0]._data.length == 0){
            this._chartOption.xaxis.ticks = null;
            return;
        }

        if(this._chartOption.xaxis.ticks == null){
             this._chartOption.xaxis.ticks = [];
         }else{
             this._chartOption.xaxis.ticks.length = 0;
         }

        var inc = 0;
        var tickIndex = null;
        var dataIndex = null;
        var dataValueIndex = null;
        //var lastTime = +window.serverTime;
        var lastTime = +new Date();

        var startIndex = null;

        this._chartOption.xaxis.ticks.length = 0;

        for(var ix = ticksLength - 1; ix >= 0; ix--){
            tickIndex = Math.round((inc++) * (this.dataBufferSize  / (ticksLength -1 )));
            startIndex = this.serieseList[0]._startPoint + tickIndex;
            // 마지막 xaxis 는 마지막 위치에 붙게 설정
            if(ix == 0){
                //if(ticksLength % 2 == 1){
                    dataIndex = this.serieseList[0]._startPoint - 1 == -1 ? this.dataBufferSize - 1 : this.serieseList[0]._startPoint - 1;
                //}
            }else{
                dataIndex = (startIndex >= this.dataBufferSize ) ? (startIndex) - this.dataBufferSize : startIndex;
            }
            dataValueIndex = this.serieseList[0]._data[dataIndex][0];
            this._chartOption.xaxis.ticks.push([dataValueIndex , $.plot.formatDate(new Date(lastTime - (ix * ticksLength * this.interval)), this._chartOption.xaxis.timeformat)]);
        }

        return this._chartOption.xaxis.ticks;
    },
/*
    _initTimeTick: function(){
        if(this.interval                            == null
            || this.serieseList                 == null
            || this.serieseList.length          == 0
//                || this.serieseList[0].data.length  == 0
            || this.plot                        == null
            || this.chartType.xTicks            != null){
            return;
        }

//        var canvasWidth = this.plot.width() || this.chartLayer.getWidth();
        var canvasWidth = this.chartLayer.getWidth();
//        var canvasWidth = Math.min(this.plot.getCanvas().width, this.chartLayer.getWidth());
        var ticksLength = Math.ceil(canvasWidth / (this._chartOption.xaxis.timeformat.length * 10));             // 한글자당 12px로 본다

        var seriesTicks = null;
        var series = null;
        var ix = null;
        var ixLen = null;
        var result = [];

        if(canvasWidth <= 0 || ticksLength <= 0){
            this._chartOption.xaxis.ticks = null;
            return;
        }

        for(ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
            if(this.serieseList[ix].visible){
                series = this.serieseList[ix];
                seriesTicks = this.serieseList[ix].timeTicks;
                break;
            }
        }

        if(! seriesTicks || seriesTicks.length == 0){
            return;
        }

        var inc = 1;
        var tickIndex = null;

        if(seriesTicks.length > ticksLength){
            inc = Math.ceil(series._data.length / (ticksLength -1)) - 1;

            for(ix = 0; ix < this.dataBufferSize; ix++){
                if(ix * inc > this.dataBufferSize){
                    break;
                }

                tickIndex = (series._startPoint + (ix * inc));
                if(tickIndex >= this.dataBufferSize){
                    tickIndex -= (this.dataBufferSize );
                }

                result.push(seriesTicks[tickIndex]);
            }
        }else{
            result = seriesTicks.slice(0);
//            for(ix = series._startPoint, ixLen = seriesTicks.length; ix < ixLen; ix++){
//                this._chartOption.xaxis.ticks[ix] = seriesTicks[ix];
//            }
//
//            for(ix = 0, ixLen = series._startPoint; ix < ixLen; ix++){
//                this._chartOption.xaxis.ticks[ix] = seriesTicks[ix];
//            }
        }

        seriesTicks = null;
        series = null;

        return result;
    },
*/
    _xAxisMaxRange: function(){
        var seriesList = this.serieseList;
        var i = 0, seriesLen = seriesList.length;

        var result = null;

        if(this.prevZoomFrom && this.prevZoomTo){
            result = {
                    min: this._dateIntervalInit(this._chartOption.xaxis.min, this.interval),
                    max: this._dateIntervalInit(this._chartOption.xaxis.max, this.interval)
                };
        }else{
            if(this.fromTime && this.toTime){
                result = {
                    min: this.fromTime,
                    max: this.toTime
                };
            }else if(this._chartOption.xaxis.min && this._chartOption.xaxis.max){
                result = {
                        min: this._chartOption.xaxis.min,
                        max: this._chartOption.xaxis.max
                    };
            }else if(seriesLen > 0){
                for(i; i < seriesLen; i++){
                    if(seriesList[i].data.length > 0){
                        if(result == null){
                            result = {
                                min: seriesList[i].data[0][0],
                                max: seriesList[i].data[seriesList[i].data.length -1][0]
                            };
                        }else{
                            result.min = Math.min(seriesList[i].data[0][0], result.min);
                            result.max = Math.max(seriesList[i].data[seriesList[i].data.length -1][0], result.max);
                        }
                    }
                }
            }
        }

        seriesList = null;
        return result;
    },


    /**
     * CanvasChat 객체 생성시 context menu 생성
     * 기본적으로 series visable, history 기능 포함
     * pie 차트 이거나 axis mode 가 categories 인경우 생성 안함
     */
    _createContenxtMenu: function(){
       if(this._type == 'pie' || this._chartOption.xaxis.mode == 'categories' || this._chartOption.xaxis.mode == 'categories'){
           return;
       }

       this.contextMenu         = Ext.create('Exem.ContextMenu');

       // 이미지 캡쳐
       this.contextMenu.addItem({
           title    : 'Save Image',
           target   : this,
           fn       : function(){
               html2canvas( (this.imageCaptureDom && this.imageCaptureDom.el.dom) || this.el.dom ,
               {
                     // Canvas 로 복사 완료 이벤트
                     onrendered: function(canvas)
                     {
                          procDownloadImg( canvas.toDataURL()  );
                     }

               });
           }.bind(this)
       });

       // 전체 이미지 캡쳐
//       this.contextMenu.addItem({
//           title    : 'Image Capture',
//           target   : this,
//           fn       : function(){
//               html2canvas(document.body, {
//                   onrendered: function(canvas){
//                       // Crop Window 를 팝업 시킨다.
//
//                       var cropWindow = Ext.getCmp('cropimage_window');
//                       if( !cropWindow )
//                           cropWindow = new Ext.create('pa.layout.cropimage.window',{
//                               original_image: canvas.toDataURL()
//                           });
//
//                       //  console.debug( canvas.toDataURL() );
//
//                       // 캡춰한 이미지 던짐
////                       cropWindow.setImage( canvas.toDataURL() );
//                       // 팝업 띄움.
//                       cropWindow.show();
//                   }
//               });
//           }.bind(this)
//       });

       this.addListener('render', function(){
           this.contextMenu.showAtToOwner(this);
       });
    },


    /**
     * plot 에서 필요한 형태의 데이터로 가공 되어 리턴한다.
     * @returns {Array}
     *  ex) [[x,y], [x,y], [x,y]]
     */
    getPlotData: function(){
        var serieseList = this.serieseList;
        var series = null;
        var dataIndex = null;
        //var data = [];
        var seriesType = null;
        var ix = null;
        var ixLen = null;
        var jx = null;
        var jxLen = null;

        this.serieseData.length = 0;

//        this._chartOption.yaxis.max = this.chartType.yMax;

        for(ix = 0, ixLen = serieseList.length; ix < ixLen; ix++){
            series = serieseList[ix];

            if(! series.visible){
                continue;
            }

            if(! series.color){
                series.color = this._chartOption.colors[ix];
            }

            seriesType = series[series.type];

            if(series.stack){
                seriesType.fill = 0.3;
//                series.fill = true;
//                seriesType.stack = true;
                seriesType.type = series.type;
            }

            if(series.point){
                series.points = {
                    show: true,
                    fill: true,
                    //fillColor: '#fff',
                    fillColor: 'transparent',
                    lineWidth: this._lineWidth,
                    radius: 3
                };
            }

            if(series.type == PlotChart.type.exBar){
                if(this.plot){
                    if(this._isStack && seriesType.lineWidth != this.chartLineWidth){
                        seriesType.lineWidth = 0;
                        seriesType.fill = 1;
                    }

                    if(seriesType.horizontal){
                        this._chartOption.xaxis.autoscaleMargin = 0.3;
                        this._chartOption.yaxis.autoscaleMargin = 0;
                    }else{
                        this._chartOption.xaxis.autoscaleMargin = 0;
                        this._chartOption.yaxis.autoscaleMargin = 0.3;
                    }

                    if(series.data.length > 0){
                        if(this._chartOption.xaxis.min){
                            this._chartOption.xaxis.min = this._xaxisMin - seriesType.barWidth / 2 || 0;
                        }

                        if(this._chartOption.xaxis.max){
                            this._chartOption.xaxis.max = this._xaxisMax + seriesType.barWidth / 2 || 0;
                        }
                    }
                }
            }

            if(series.type != PlotChart.type.exLine){
                this._chartOption.xaxis.tickFormatter = null;
            }

//            if(series.fill){
//                series[series.type].fill = true;
//            }else{
//                series[series.type].fill = series.type.fill || false;
//            }

            series.data.length = 0;
            dataIndex = 0;
            for(jx = series._startPoint, jxLen = series._data.length; jx < jxLen; jx++){
                if(series._data[jx]){
                    series.data[dataIndex++] = series._data[jx];
                }
            }

            for(jx = 0, jxLen = series._startPoint; jx < jxLen; jx++){
                if(series._data[jx]){
                    series.data[dataIndex++] = series._data[jx];
                }
            }

            this.serieseData.push(series);
        }

        serieseList = null;
        series = null;
    },


    /**
     * 해당 series에 직접 데이터 지정
     * @param index series index or id
     * @param data
     */
//    setData: function(index, data){
//        var i = 0;
//        var series = this.getSeries(index);

//        series.data = data;

//        if(this.showMaxValue){
//            if(this._isStack){
//                return;
//            }

//            this.initMaxValue();

//            for(i, len = data.length; i < len; i++){
//                // pie 차트 형식의 데이터입력을 제외하고
//                if(Array.isArray(data[i])){
//                    this.setMaxValue(data[i][0],data[i][1],series,i);
//                }
//            }
//        }
//    },

    initMaxValue: function(){
        this.maxOffSet.x = -1;
        this.maxOffSet.y = -1;
        this.maxOffSet.s = null;
        this.maxOffSet.index = 0;
    },

    setMaxValue: function(x, y, series, index, realX){

        y = +y;
        // vertical
        if (!y) {
            return;
        }

        if (y >= this.maxOffSet.y) {
            if(this._chartOption.xaxis.mode == 'time'){
                if(this._chartOption.xaxis.max != null && this._chartOption.xaxis.min != null){
                    if(x > this._chartOption.xaxis.max || x < this._chartOption.xaxis.min){
                        return;
                    }
                }
            }
            this.maxOffSet.x = x;
            this.maxOffSet.realX = realX;
            this.maxOffSet.y = y;
            this.maxOffSet.s = series.lebel || series.id;
            this.maxOffSet.index = index;
            this.maxOffSet.seriesIndex = series.seriesIndex || 0;
        }

        series = null;
    },


    /**
     *
     */
    plotDraw: function(){
        if(this._$chartTarget == null || this._$chartTarget.length == 0){
            return;
        }

        this.getPlotData();
        //this._chartOption.xaxis.ticks = this._initTimeTick();
        this._initTimeTick();

        this.plot = $.plot(this._chartTarget, this.serieseData , this._chartOption);

        if(this.showMaxValue){
            this._createMaxValueTip();
        }

        this.displayXAxis(this.showXAxis);
    },


    /**
     *  이미 그려진 canvas 에서 다시 그린다.
     * @param data  plot 형태의 data를 받아서 다시 그린다. 없으면 가지고 있는 기본 데이터로 다시 그린다.
     */
    plotResize: function(){
        if(! this._chartTarget){
            return;
        }

        this._chartOption.isRealCanvas = true;
        this.plot = $.plot(this._chartTarget, this.serieseData , this._chartOption);
        if(this.showMaxValue){
            this._createMaxValueTip();
        }
    },


    /**
     *  이미 그려진 canvas 에서 다시 그린다.
     * @param data  plot 형태의 data를 받아서 다시 그린다. 없으면 가지고 있는 기본 데이터로 다시 그린다.
     */
    plotRedraw: function(){

        //this._$chartTarget.find('.flot-x-axis > div').remove();
        //this._$chartTarget.find('.flot-y-axis > div').remove();

        if(this.plot){
            this.getPlotData();

            var axes = this.plot.getAxes();
            axes.xaxis.options.ticks = this._initTimeTick();
            //axes.xaxis.options.min = 0;
            //axes.xaxis.options.max = 0;

//            this.plot.setData(this.serieseData);
//            this.plot.setupGrid();
//            this.plot.draw();

            this.setData(this.serieseData);
            this.setupGrid();

            //this.hide();
//            this.getEl().dom.style.display = 'none';

            this.draw();

            if(this.showMaxValue){
                this._createMaxValueTip();
            }

            //this.show();
//            this.getEl().dom.style.display = 'block';
        }
    },


    /**
     * X축 레이블 숨기기
     * @param flag [boolean]
     */
    displayXAxis: function(flag){
        if(this._$chartTarget == null || this._$chartTarget.length == 0){
            return;
        }

        if(flag){
            this._$chartTarget.find('.flot-x-axis').show();
        }else{
            this._$chartTarget.find('.flot-x-axis').hide();
        }
    },

    /**
     * 차트 타입별 옵션을 설정하는 함수
     * bar chart gradient 옵션을 변경함.(top -> bottom 에서 right -> left   flot API 수정: 2500라인, 2962: getColorOrGradient 함수)
     * @param type lines, bars, pie, points, ........ default lines
     * @returns {}
     */
    seriesTypeOption : function(type, fill){
        var obj = null;
        var kind = PlotChart.type;

        switch(type){
            case kind.exBar :
                this._lineWidth = 0;
                obj = {
                    show: true,
                    fill: 1,
//                    fillColor: { colors: [ { opacity: 1 }, { opacity: 0.4 }, { opacity: 1 } ] },
                    lineWidth: this._lineWidth,
                    align: 'center',
                    barWidth: this.chartType.bar_width > 1 ? this.chartType.bar_width : (this.chartType.mode == 'time' ? (this.interval ? this.interval * 0.7 : 24 * 60 * 60 * this.chartType.bar_width) : (this.chartType.bar_width))
//                    barWidth: this.chartType.bar_width > 1 ? this.chartType.bar_width : (this.chartType.mode == 'time' ? (24 * 60 * 60 * this.chartType.bar_width) : (this.chartType.bar_width))
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
                    tilt: 0.3,
                    innerRadius: 30,
                    label: {
                        show: true,
                        radius: 3/4,
                        threshold: 0.1,
                        formatter: function(label, series) {
                            return "<div style='font-size:12px; text-align:center; padding:2px; color:#000;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
                        }
                    },
                    combine: this.chartType.combine,
//                    gradient: { colors: [ { brightness: 1.5, opacity: 1 }, { brightness: 0.1, opacity: 0.1 } ] }
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
                break;

            default:
                this._lineWidth = 1;
                obj = {
                    show: true,
                    fill: fill,
//                    fillColor: { colors: [ { opacity: 0.7 } , { opacity: 0.6 } , { opacity: 0.3 } , { opacity: 0.6 } , { opacity: 0.7 }] },
                    lineWidth: this._lineWidth
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
    addSeries: function(){
        var seriese = this.serieseList,
        param = arguments[0],
        id = '', label = '', type = null;


        id = param.id;
        label = param.label;
        if(id != null){
            type = param.type || 'lines';
            param.data = [];                    // 실제 순서대로 정렬된 데이터 배열
            param._data = [];                   // shfit, push 를 사용하지 않기 위해 startPoint 로 정렬된 배열
            param.timeTicks = [];
            param.show = true;
            param._dataIndex = 0;
            param._startPoint = 0;
            param._insertIndex = -1;
            param[type] = this.seriesTypeOption(type, param.fill);
            param.visible = true;
            param.lineWidth = param.lineWidth || 1;

            if(param.hbar){
                this._isHorizontal = true;
                param[type].horizontal = param.hbar;
            }

            param.seriesIndex = seriese.length;
            seriese.push(param);

//            if(! param.color){
//                param.color = this.chartType.colors[seriese.length - 1];
//            }
        }else{
            console.debug('addSeries', 'id is Required! ex) { id : "id"}');
        }

        if(param.stack){
            this._isStack = true;
        }

        if(param.hbar){
            this._isHorizontal = true;
        }

        this._chartType();

        if(this.showLegend){
            this.createChartLegend(param.hideLegend);
        }

        param = null;

        return seriese.length - 1;
    },


    createChartLegend : function(hideLegend){
        var self = this;
        var colorWidth = 5,
            colorHeight = 10,
            nameHeight = 13,
            index = this.serieseList.length -1,
            series = this.serieseList[index];

        series.labelObj = Ext.create('Ext.container.Container', {
            layout: {
                type: "hbox",
                pack: "start",
                align: "middle"
            },
            width: this.showLegendValueArea ? '100%' : null
        });

        if(hideLegend){
            series.labelObj.hide();
        }

        var legendStyle = this.legendColorClickType == 0 ? {
            'background-color'  : series.color || self.chartType.colors[index],
            'border'            : '1px solid ' + (series.color || self.chartType.colors[index]),
            'cursor'            : (! this.showHistoryInfo || this._type == 'pie' || this._chartOption.xaxis.mode == 'categories' || this._chartOption.yaxis.mode == 'categories') ? 'default' : 'pointer'
        } : {
            'background-color'  : series.color || self.chartType.colors[index],
            'border'            : '1px solid ' + (series.color || self.chartType.colors[index]),
            'cursor'            : this.legendColorClickToVisible ? 'pointer' : (! this.showHistoryInfo || this._type == 'pie' || this._chartOption.xaxis.mode == 'categories' || this._chartOption.yaxis.mode == 'categories') ? 'default' : 'pointer',
//            'width'             : '8px',
//            'height'            : '8px',
//            'border-radius'     : '50%',
//            'border'            : '2px solid #fff',
//            'box-shadow'        : '0px 0px 3px #5B796B',
//            cursor: 'pointer',
            width: '5px',
            height: '10px',
            margin: '0px',
            right: 'auto',
            left: '7px',
            top: '4px'
        };

        var legendColor = Ext.create('Ext.form.Label',{
            itemId: 'color',
            width: this.legendColorClickType == 0 ? 6 : colorWidth,
            height: colorHeight,
            index: index,
            selected: true,
            bgColor : series.color || self.chartType.colors[index],
            margin: {
                top: 2,
                left: 2
            },
            border: 1,
            style: legendStyle,
            listeners: {
                scope: this,
                render: function( me, eOpts ){

                    me.el.on('click',function(event, el){
                        if(self.legendColorClickType == 0){
                            if(this._type == 'pie' || this._isHorizontal || this._chartOption.xaxis.mode == 'categories' || this._chartOption.xaxis.mode == 'categories'){
                                return;
                            }
                            if(self.showHistoryInfo){
                                self.openHistryInfo();
                            }
                        }else if(self.legendColorClickType == 1){
                            if(this.selected){
                                this.selected = false;

                                if(self.legendColorClickToVisible){
                                    self.setSeriesVisible(this.index, false);
                                    self.plotDraw();
                                }
                            }else{
                                this.selected = true;

                                if(self.legendColorClickToVisible){
                                    self.setSeriesVisible(this.index, true);
                                    self.plotDraw();
                                }
                            }

                            if(! self.legendColorClickToVisible){
                                if(self.showHistoryInfo){
                                    self.openHistryInfo();
                                }
                            }

                            if(self.legendColorClick){
                                self.legendColorClick(self, this, event, el);
                            }
                        }
                    }.bind(me));
                }
            }
        });

        if(this.legendColorCheckbox){
            series.labelObj.checkObj = Ext.create('Ext.form.Checkbox',{
                name: this.id,
                width: 20,
                inputValue: series.id || series.name,
                checked: true,
                seriesIndex: index,
//                boxLabel : '<span style="background-color:' + series.color || self.chartType.colors[index] + ';width:6px;display:inline-block;height:9px;margin-right:4px;"></span>' + series.label,
                listeners: {
                    scope: this,
                    change: function(self, newValue, oldValue, eOpts){
                        this.plotCheckBoxChange(this, self, newValue, oldValue, eOpts);
                    }
                }
            });

            series.labelObj.add(series.labelObj.checkObj);
        }

        series.labelObj.add(legendColor);

        if(this.showLegendNameArea){
            series.labelObj.legendName = Ext.create('Ext.form.Label',{
                itemId: 'name',
                width: this.showLegendValueArea ? this.legendNameWidth : (this.legendVH == 'column' ? this.legendNameWidth : this.legendWidth - 10),
                height: nameHeight,
                index: index,
                text: series.label,
//                    text: series.label ? (series.label[0].toUpperCase() + series.label.substr(1, series.label.length)) : (series.id[0].toUpperCase() + series.id.substr(1, series.id.length)),
                margin: {
//                    left    : 4,
                    bottom  : 4
                },
                style: {
                    'border'        : 'none',
                    'background'    : 'none',
                    'text-overflow' : 'ellipsis',
                    'white-space'   : 'nowrap',
                    'overflow'      : 'hidden',
                    'padding-left'  : '4px'
                },
                textAlign: 'left',
                listeners: {
                    scope: this,
                    render: function( me, eOpts ){
                        if(this.$className.indexOf('Checkbox') > -1){
                            me.el.dom.setAttribute('for', this.id + '-inputEl');
                        }

                        me.el.dom.setAttribute('data-qtip', me.el.dom.innerHTML);

                        if(this.legendNameHighLight){
                            me.el.dom.style.cursor = 'pointer';

                            me.el.on('mouseenter',function(event, el){
                                el.style.fontWeight = 'bold';
                                self.setLineWidth(this.index, (self.serieseList[this.index].lineWidth || self.serieseList[this.index][self.serieseList[this.index].type].lineWidth|| 1) + 1);
                                self.plotDraw();

//                                if(self.legendNameHover){
//                                    self.legendNameHover(self, this, event, el);
//                                }
                            }.bind(me));

                            me.el.on('mouseleave',function(event, el){
                                el.style.fontWeight = 'normal';
                                self.setLineWidth(this.index, (self.serieseList[this.index].lineWidth || self.serieseList[this.index][self.serieseList[this.index].type].lineWidth || 1));
                                self.plotDraw();

//                                if(self.legendNameLeave){
//                                    self.legendNameLeave(self, this, event, el);
//                                }
                            }.bind(me));
                        }

                        if(this.legendNameClick){
                            me.el.on('click', this.legendNameClick, this);
                        }

                        if(this.legendNameDblClick){
                            me.el.on('dblclick', this.legendNameDblClick, this);
                        }
                    }.bind(series.labelObj.checkObj || this)
                }
            });

            series.labelObj.add(series.labelObj.legendName);
        }

        if(this.showLegendValueArea){
            series.labelObj.legendValue = Ext.create('Ext.form.Label',{
                cls: 'imx-font chart-legend-value',
                style: this.legendValueStyle
            });
            series.labelObj.add(series.labelObj.legendValue);

//            series.labelObj.legendValue.el.dom.style.right = '0px';
//            series.labelObj.legendValue.el.dom.style.left = 'initial';
        }

        if(this.legendOrder == 'desc'){
            this.labelLayer.insert(0, series.labelObj);
        }else{
            this.labelLayer.add(series.labelObj);
        }

        series = null;
    },

    setTitle: function(title){
        if(this.titleLayer){
            this.titleLayer.update(title || '');
            this.title = title;
        }
    },

    getTitle: function(){
        return this.title;
    },

    setLegendValue: function(index, value){
        var series = this.getSeries(index);

//        value = (value == null ? 0 : value);

        if(series && series.labelObj && series.labelObj.legendValue.el && series.labelObj.legendValue.el.dom){
            series.labelObj.legendValue.el.dom.textContent = common.Util.numberFixed(value, 1);
        }

        series = null;
    },

    setLegendText: function(index, text){
        var series = this.getSeries(index);

        if(series && series.labelObj && series.labelObj.legendName){
            series.labelObj.legendName.setText(text);
            series.label = text;

            if(series.labelObj.legendName.el){
                series.labelObj.legendName.el.dom.setAttribute('data-qtip', text);
            }
        }

        series = null;
    },

    /**
     * @param value 값이 없을 경우 '' 로 초기화
     */
    setLegendValues: function(value){
        var seriesList = this.serieseList;
        var i = 0, len = seriesList.length;

        value = (value == null ? 0 : value);
        for(i; i < len; i++){
            seriesList[i].labelObj.legendValue.setText(common.Util.numberFixed(value, 1));
        }

        seriesList = null;
    },

    /**
     * 레이블 체크 박스 enable, disable
     * @param series    series index
     * @param flag      true:  disabled, false: enabled
     */
    setCheckBoxVisible: function(series, flag){
        if(this.serieseList[series]){
            this.serieseList[series].labelObj.checkObj.setDisabled(flag);
        }
    },

    setSeriesLegendVisible: function(series, flag){
        if(series == null){
            for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
                if(this.serieseList[ix].labelObj){
                    if(flag){
                        this.serieseList[ix].labelObj.show();
                    }else{
                        this.serieseList[ix].labelObj.hide();
                    }
                }
            }
        }else{
            if(this.serieseList[series]){
                if(this.serieseList[series].labelObj){
                    if(flag){
                        this.serieseList[series].labelObj.show();
                    }else{
                        this.serieseList[series].labelObj.hide();
                    }
                }
            }
        }
    },

    /**
     * series를 모두 추가한 후 초기화 함수를 호출 해야한다.
     * @param endTime 차트가 그려질 시작 시간
     * @param interval 초기화 할 데이터의 간격
     * @param initValue 초기화 할 데이터 값( 없으면 -1 로 초기화)
     * @param seriesIndex 초기화 대상 시리즈( 없으면 전체를 초기화 한다)
     */
    initData: function(endTime, interval, initValue, seriesIndex){
        var time = +new Date(endTime);
        var ix = null;
        var initVal = initValue != undefined ? initValue : null;
        var series = null;
        var bufferCount = this.dataBufferSize - 1;

        if(! this.dataBufferSize){
            console.debug(common.Util.TR('Error: chart dataBufferSize not defined...'));
            return;
        }

        if(seriesIndex != undefined){
            series = this.serieseList[seriesIndex];
            series.data.length = 0;
            series._data.length = 0;
            series.timeTicks.length = 0;
            series._dataIndex = 0;
            series._startPoint = 0;
            series._insertIndex = 0;

            timeCount = 0;

            var tempTime = null;
            for(ix = 0; ix < this.dataBufferSize; ix++){
                tempTime = time - (interval * bufferCount--);

                //this.addValue(seriesIndex, [time - (interval * ix), initVal]);
                series._data[series._insertIndex] = [series._dataIndex, initVal];
                series.timeTicks[series._insertIndex] = [series._dataIndex, $.plot.formatDate(new Date(tempTime), this._chartOption.xaxis.timeformat)];
                series.timeTicks[series._insertIndex].milliTime = tempTime;

                series._dataIndex++;
                series._insertIndex++;
            }
        }else{
            //for(ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
            //    series = this.serieseList[ix];
            //    series.data.length = 0;
            //    series._data.length = 0;
            //    series.timeTicks.length = 0;
            //    series._dataIndex = 0;
            //    series._startPoint = 0;
            //    series._insertIndex = -1;
            //
            //    timeCount = 0;
            //    for(jx = this.dataBufferSize -1; jx >= 0; jx--){
            //        this.addValue(ix, [time - (interval * jx), initVal]);
            //    }
            //}
        }

        series = null;
    },


    /**
     * 데이터의 X 값은 실제 시간 값 대신 index 로 들어가며 레이블에 표시 할때는 해당 index 의 시간 값으로 표시한다.
     * @param series series index
     * @param data [x, y]
     * @param index data index || default last index
     */
    addValue: function(seriesIndex, data, index){
        var value = null;
        var series = null;
        var ix = null;
        var ixLen = null;
        var jx = null;
        var jxLen = null;

        if(! data){
            return;
        }

        //처음 addvalue 시 데이터 버퍼 만큼 데이터를 미리 만단다


        series = this.serieseList[seriesIndex];
        if(! series){
            console.debug('serise is not define');
            return;
        }

        if(this.isDataBufferInit && series._data.length == 0){
            this.initData(data[0], this.interval, -1, seriesIndex);
        }

        if(index == null){

            series._insertIndex++;

            if(this.dataBufferSize){
                if(series._data.length == this.dataBufferSize){
                    series._startPoint++;

                    if(series._startPoint >= this.dataBufferSize){
                        series._startPoint = 0;
                    }
                }

                if(series._insertIndex >= this.dataBufferSize){
                    series._insertIndex = 0;
                }
            }

            index = series._insertIndex;
        }

        value = (data[1] == null ? null : +data[1]);
        series._data[index] = [series._dataIndex, value];

        series.timeTicks[index] = [series._dataIndex, $.plot.formatDate(new Date(data[0]), this._chartOption.xaxis.timeformat)];
        series.timeTicks[index].milliTime = data[0];

        if(series.visible){
            if(series._insertIndex == this.maxOffSet.index){
                this.initMaxValue();

                for(ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
                    if(this.serieseList[ix].visible){
                        for(jx = 0, jxLen = this.serieseList[ix]._data.length; jx < jxLen; jx++){
                            this.setMaxValue(this.serieseList[ix].timeTicks[jx].milliTime, this.serieseList[ix]._data[jx][1], this.serieseList[ix], jx, this.serieseList[ix]._data[jx][0]);
                        }
                    }
                }
            }else{
                this.setMaxValue(data[0], value, series, index, series._dataIndex);
            }
        }

        ++series._dataIndex;

        // 데이터의 인덱스증가가 한계치에 다르면 0으로 초기화 시킨다
        if(series._dataIndex > 999999999999998){
            for(var ix = 0, ixLen = series.data.length; ix < ixLen; ix++){
                series.data[ix][0] = ix;
            }
            series._dataIndex = ix;
        }

        series = null;
        data = null;
    },


    /**
     *
     * @param series 시리즈 인덱스
     * @param dataIndex 데이터 인덱스
     */
    highLight: function(series, dataIndex){
        var seriesList = this.plot.getData();

        if(! seriesList[series]){
            console.debug('Error: no series data!');
            return;
        }

        var datapoints = seriesList[series].datapoints;
        var formatLength = datapoints.format.length;
        var index = dataIndex * formatLength;
        var datapoint = datapoints.points.slice(index, index + formatLength);

        if(this._isStack){
            this._createBarNotice(datapoint, seriesList[series]);
        }else{
            this.plot.highlight(seriesList[series], datapoint);
            this._createBarNotice(datapoint, seriesList[series]);
        }

        seriesList = null;
        datapoints = null;
        datapoint = null;
    },


    /**
     *
     * @param series
     * @param dataIndex
     */
    unHighLight: function(series, dataIndex){
        if(series == null){
            this.plot.unhighlight();
            this._prevBarNoticeData = null;

            if(this._$barNotice){
                this._$barNotice.remove();
                this._$barNotice = null;
            }
        }else{
            var serieseList = this.plot.getData();
            if(! serieseList || ! serieseList[series] || ! serieseList[series].datapoints){
                return;
            }

            var datapoints = serieseList[series].datapoints;
            var formatLength = datapoints.format.length;
            var index = dataIndex * formatLength;
            var datapoint = datapoints.points.slice(index, index + formatLength);

            if(! this._isStack){
                this.plot.unhighlight(serieseList[series], datapoint);
            }

            this._prevBarNoticeData = null;
            if(this._$barNotice){
                this._$barNotice.remove();
                this._$barNotice = null;
            }
        }

        serieseList = null;
        datapoints = null;
        datapoint = null;
    },


    /**
     * series의 데이터를 초기화 한다
     * 인자가 없을경우 모든 series의 데이터를 초기화 한다.
     * @param series series index
     */
    clearValues: function(series){
        if(series != undefined){
            if(this.serieseList[series]){
                if(this.serieseList[series].type == PlotChart.type.exPie){
                    this.serieseList[series].data = null;
                }else{
                    this.serieseList[series].data.length = 0;
                    this.serieseList[series]._data.length = 0;
                }
            }
        }else{
            for(var i = 0 ;i < this.serieseList.length; i++){
                if(this.serieseList[i].type == PlotChart.type.exPie){
                    this.serieseList[i].data = null;
                }else{
                    this.serieseList[i].data.length = 0;
                    this.serieseList[i]._data.length = 0;
                    this.serieseList[i].timeTicks.length = 0;
                    this.serieseList[i]._startPoint = 0;
                    this.serieseList[i]._insertIndex = -1;
                }
            }
        }

        this.initMaxValue();
        this._removeMaxValueTip();
    },


    /**
     * 모든 series의 데이터 삭제
     */
    clearAllSeires: function(){
        for(var i = 0 ; i < this.serieseList.length; i++){
            this.serieseList[i].data.length = 0;
        }
        this.prevIndicatorPos = null;

        if(this.maxValueTip){
            this.maxValueTip.remove();
            this.maxValueTip = null;
        }
    },

    /**
     * 해당 인덱스의 series 데이터 삭제
     * @param index series index
     */
    clearSeries: function(index){
        this.serieseList[index].data.length = 0;
        this.prevIndicatorPos = null;
    },

    /**
     * 모든 series 삭제
     */
    removeAllSeries: function(){
        for(var ix = 0, ixLen = this.serieseList.length; ix< ixLen; ix++){
            if(this.serieseList[ix].labelObj){
                this.serieseList[ix].labelObj.destroy();
                this.serieseList[ix].labelObj = null;
            }
        }
        this.serieseList.length = 0;

        this.initMaxValue();

        if(this.maxValueTip){
            this.maxValueTip.remove();
            this.maxValueTip = null;
        }
    },

    /**
     * 해당 인덱스의 series 삭제
     * @param index
     */
    removeSeries: function(index){
        if(this.serieseList[index] && this.serieseList[index].labelObj){
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
    plotChartEvent: function(){
        var self = this;
        if(this.plotclick){
            this._$chartTarget.on('plotclick', function(event, pos, item){
                if (item) {
                    if(this._isStack){
                        this._createBarNotice(item.datapoint, item.series);
                    }else{
                        this.plot.unhighlight();
                        this._createBarNotice(item.datapoint, item.series);
                        this.plot.highlight(item.series, item.datapoint);
                    }
                    this.plotclick(event, pos, item, this);
                }else{
                    if(this.higiLighHold){
                        return;
                    }
                    this.plot.unhighlight();
                    if(this._$barNotice){
                        this._$barNotice.remove();
                        this._$barNotice = null;
                    }
                }

                event = null;
                pos = null;
                item = null;
            }.bind(this));
        }

        if(this.showTooltip){
            this.createToolTip();

            this._$chartTarget.on('plothover', function(event, pos, item){
                if (item) {
                    var index = (item.dataIndex + item.series._startPoint);
                    var x = null,
                        y = null,
                        s = item.series.label || item.series.id;
                    var textFormat = this.toolTipFormat;
                    var top = 0;
                    var left = 0;

                    if(index >= this.dataBufferSize){
                        index -= this.dataBufferSize;
                    }

                    x = item.series.timeTicks[index][1];

                    y = common.Util.toFixed(item.datapoint[1], this.toFixedNumber || 1);

                    this.hoverDataInfo.x = x;
                    this.hoverDataInfo.y = y;
                    this.hoverDataInfo.index = index;

                    textFormat = textFormat.replace('%x', x).replace('%y', y).replace('%s', s);

                    top  = (item.pageY || pos.pageY) - 25;
                    left = (item.pageX || pos.pageX) + 5;

                    var seriesColor = null;
                    if(item.series.seriesIndex != null){
                        seriesColor = this.serieseList[item.series.seriesIndex].color;
                    }
                    var backgroundColor = seriesColor ? seriesColor : this._chartOption.colors[item.series.seriesIndex];
                    this.$toolTip.text(textFormat).css({top: top, left: left, backgroundColor: backgroundColor }).show();
                } else {

                    this.hoverDataInfo.x = null;
                    this.hoverDataInfo.y = null;
                    this.hoverDataInfo.index = null;

                    this.$toolTip.hide();
                }

                event = null;
                pos = null;
                item = null;

            }.bind(this));
        }

        if(this.plothover){
            this._$chartTarget.on('plothover', function(event, pos, item){
                if (item) {
                    var index = item.dataIndex;
                    var x = null;
                    var y = null;

                    if(this._type == PlotChart.type.exPie){
                        x = item.datapoint[0];
                        y = item.datapoint[1][0][1];
                    }else if(this._type == PlotChart.type.exBar){
                        if(this._isHorizontal){
                            if(this._chartOption.yaxis.mode == 'categories'){
                                x = item.datapoint[0] - (item.datapoint[2] || 0);
                                y = item.series.data[index] ? item.series.data[index][1] : item.datapoint[1];
                            }else{
                                x = item.datapoint[0];
                                y = item.datapoint[1] - (item.datapoint[2] || 0);
                            }
                        }else{
                            if(this._chartOption.xaxis.mode == 'categories'){
                                x = item.series.data[index][0];
                                y = item.datapoint[1] - (item.datapoint[2] || 0);
                            }else{
                                x = item.datapoint[0];
                                y = item.datapoint[1] - (item.datapoint[2] || 0);
                            }
                        }
                    }else if(this._type == PlotChart.type.exLine && this._isStack){
                        if(this._chartOption.xaxis.mode == 'categories'){
                            x = item.series.data[index][0];
                        }else{
                            x = item.datapoint[0];
                        }
                        y = item.datapoint[1] - (item.datapoint[2] || 0);
                    }
                    else{
                        x = item.datapoint[0];
                        y = item.datapoint[1] - (item.datapoint[2] || 0);
                    }

                    this.hoverDataInfo.x = x;
                    this.hoverDataInfo.y = y;
                    this.hoverDataInfo.index = index;

                }else{
                    this.hoverDataInfo.x = null;
                    this.hoverDataInfo.y = null;
                    this.hoverDataInfo.index = null;
                }
                this.plothover(event, pos, item, this);

                event = null;
                pos = null;
                item = null;
            }.bind(this));
        }

        if(this.showIndicator){
            this._$chartTarget.on('plotdblclick', function(event, pos, item){
                var xAxis = this.drawIndicator(pos);

                if(this.plotdblclick){
                    this.plotdblclick(event, pos, item, xAxis, self);
                }

                event = null;
                pos = null;
                item = null;
                xAxis = null;
            }.bind(this));
        }else{
            if(this.plotdblclick){
                this._$chartTarget.on('plotdblclick', function(event, pos, item){
                    this.plotdblclick(event, pos, item, self);

                    event = null;
                    pos = null;
                    item = null;
                }.bind(this));
            }
        }

        if(this.showZoomIn){
            this._$chartTarget.bind("plotselected", function (event, ranges){
                this.plot = $.plot(this._chartTarget, this.getPlotData(), $.extend(true, {}, this._chartOption, {
                    xaxis: {
                        min: ranges.xaxis.from,
                        max: ranges.xaxis.to
                    }
                }));

                event = null;
                ranges = null;
            }.bind(this));
        }

        if(this.plotselection){
            this._$chartTarget.bind("plotselected", function (event, ranges){

                if(this.selectionZoom){
                    ranges.xaxis.from = this._dateIntervalInit(ranges.xaxis.from, this.interval, true, 0);
                    ranges.xaxis.to = this._dateIntervalInit(ranges.xaxis.to, this.interval, true, 1);

                    this.dependentChartZoomIn(ranges.xaxis.from, ranges.xaxis.to);
                }

                this.plotselection(event, ranges, this.maxOffSet, this);

                this.plot.setSelection({
                    xaxis: {
                        from: 0,
                        to: 0
                    },
                    yaxis: {
                        from: 0,
                        to: 0
                    }
                }, false);

                event = null;
                ranges = null;

            }.bind(this));
        }else if(this.mouseSelect){
            this._$chartTarget.bind("plotselected", function (event, ranges){

                if(this.selectionZoom){
                    this.dependentChartZoomIn(ranges.xaxis.from, ranges.xaxis.to);
                }

                this.plotselection(event, ranges, this.maxOffSet);

                this.plot.setSelection({
                    xaxis: {
                        from: 0,
                        to: 0
                    },
                    yaxis: {
                        from: 0,
                        to: 0
                    }
                }, false);

                event = null;
                ranges = null;
            }.bind(this));
        }

//        this._$chartTarget.resize(function(){

//            this._initTimeTick();
//            this.plotResize();

//        }.bind(this));

        this.chartLayer.addListener('resize',function(){
            this._initTimeTick();
            this.plotResize();
        },this);

//        $(this.plot.getCanvas()).resize(function(){
//            this._initTimeTick();
//            this.plotResize();
//        }.bind(this));

        $('#' + this._chartContainer.id).hover(function(){

        }, function(e){
            if(this.$toolTip){
                this.$toolTip.hide();
            }
        }.bind(this));

    },

    /**
     * 이벤트 생성 함수
     *
     * @param eventName Envir.js 에 선언되어져 있는 PlotChart.event 참조
     * @param action 해당 이벤트시 실행되어져야 할 함수
     * @param scope scope default: chart scope
     */
    addEventListener: function(eventName, action, scope){
        this[eventName] = action;

        $(this._chartTarget).on(eventName, function(event, pos, item){
            this[eventName].call(scope || this, event, pos, item );
        });
    },


    /**
     * 특정 예의 차트를 구분하기 위해서 차트의 타입을 지정.
     * bar , pie 차트는 다른 이벤트 혹은 액션이 추가 되기때문에 따로 구분이 되어야 함
     */
    _chartType: function(type){
        for(var i = 0 ; i < this.serieseList.length; i++){
            switch(this.serieseList[i].type){
                case PlotChart.type.exBar :
                    this._type = PlotChart.type.exBar;
                    break;
                case PlotChart.type.exPie :
                    this._type = PlotChart.type.exPie;
                    break;
                default : this._type = PlotChart.type.exLine;
                    break;
            }
        }
    },

    _removeMaxValueTip: function(){
        if(this.maxValueTip){
            this.maxValueTip.remove();
            this.maxValueTip = null;
        }
    },

    _createMaxValueTip: function(){
        var width = 0;
        var textFormat = this.maxValueFormat;
        var lineStyle = null;
        var canvasWidth = this.plot.width();
        var data = this.plot.getData();

        if(
                this.maxOffSet.y == null
                || this.maxOffSet.x == null
                || (this.maxOffSet.y + this.maxOffSet.x) <= 0
                || this._type == PlotChart.type.exPie
                || data.length == 0
        ){

            this._removeMaxValueTip();
            return;
        }

        var seriesColor = null;
        var backgroundColor = null;

        if(this.serieseList[this.maxOffSet.seriesIndex]){
            seriesColor = this.serieseList[this.maxOffSet.seriesIndex].color;
            backgroundColor = seriesColor ? seriesColor : this._chartOption.colors[this.maxOffSet.seriesIndex];
        }else{
            backgroundColor = '#333';
        }

        var offSet = this.plot.pointOffset({
            x: this.maxOffSet.realX,
            y: this.maxOffSet.y
        });
        var top = null;

        var xAxisValue = $.plot.formatDate(new Date(this.maxOffSet.x), this.maxValueAxisTimeFormat);
        var yAxisValue = common.Util.numberFixed(this.maxOffSet.y, 1);

        textFormat = textFormat.replace('%x', xAxisValue).replace('%y', yAxisValue).replace('%s', this.maxOffSet.s);
//        var style = 'transition: all 0.4s;position:absolute;height:15px;border-radius:4px;background-color: '+ backgroundColor +';line-height: 14px;color: #FFF;padding:0px 15px;text-align:center;';
        var style = 'position:absolute;height:15px;border-radius:4px;background-color: '+ backgroundColor +';line-height: 14px;color: #FFF;padding:0px 15px;text-align:center;';

        lineStyle = 'position:absolute;width:0;height:0;';

        if(! this.maxValueTip){
            this.maxValueTip = $('<div style="' + style + '">' + textFormat + '<div style="' + lineStyle + '"></div></div>');
            this._$chartTarget.append(this.maxValueTip);
        }else{
            this.maxValueTip.css('background' , seriesColor).text(textFormat);;
            this._$chartTarget.append(this.maxValueTip);
        }

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

        if(this._isHorizontal){
            lineTop = 4;
            top = offSet.top - 6;

            // x 축 기준으로 반대로 되어 있으면
            if(this._chartOption.xaxis.transform){
                offSet.left -=( tipOuterWidth + 15);

                borderCss.borderRight = '4px solid transparent';
                borderCss.borderTop = '4px solid transparent';
                borderCss.borderBottom = '4px solid transparent';

                lineLeft = -1;
            }else{
                offSet.left += 10;
                lineLeft = -7;

                borderCss.borderLeft = '4px solid transparent';
                borderCss.borderTop = '4px solid transparent';
                borderCss.borderBottom = '4px solid transparent';
            }

        }else{
            top = offSet.top - 21;
            lineTop = tipOuterHeight;
            borderCss.borderBottom = '0px solid transparent';

            if(offSet.left < tipOuterWidth){
                width = 0;
//                left = 0;
                tipCss = '4px 4px 4px 0px';
                borderCss.borderLeft = '0px solid transparent';
                borderCss.borderRight = '4px solid transparent';
                lineLeft = 0;
            }else if(offSet.left > canvasWidth - tipOuterWidth){
                width = tipOuterWidth;
//                left = 100 - ( 2 / width * 100);
                tipCss = '4px 4px 0px 4px';
                borderCss.borderLeft = '4px solid transparent';
                borderCss.borderRight = '0px solid transparent';
                lineLeft = -4;
            }else{
                width = tipOuterWidth / 2;
//                left = 50;
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
        }).children().eq(0).css({
            'left': width + lineLeft,
            'top' : lineTop,
            'border-right': borderCss.borderRight,
            'border-left' : borderCss.borderLeft,
            'border-top' : borderCss.borderTop,
            'border-bottom' : borderCss.borderBottom
        });

        textFormat = null;
        data = null;
        borderCss = null;
        offSet = null;
    },

    openHistryInfo: function(series){
        var i = 0, j = 0, id = '', index = 0,
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

        grid.drawGrid();

        Ext.create('Exem.Window',{
            title: this.title || 'History Information',
            width: Math.min(grid._fieldsList.length * columnWidth+ 10, window.outerWidth * 0.8),
            height: 400,
            layout: 'fit',

            items: grid
        }).show();

        if(this.prevIndicatorPos){
            grid.pnlExGrid.getView().focusRow(this.prevIndicatorPos.dataIndex || 0);
        }

        seriese = null;
        grid = null;
    },

    /**
     * serieseList 에서 해당 series 를 가져온다.
     * @param id 타입이 Number 일경우(1,2,3 or '1','2','3') index를 참조해서 가져오고
     *        아닐경우 series 에 id 를 비교하여 찾는다
     * @returns 해당 series, 없을경우 null
     */
    getSeries: function(id){

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
    },


    /**
     * @param date      초기화 될 date
     * @param interval  date가 얼마의 간격으로 초기화 될건지에 대한 interval
     * @param fisrtFlag
     * @param type      from : 0, to :1
     * @returns {Date}
     */
    _dateIntervalInit: function(date, interval, firstFlag, type){
      var d = new Date(date);

      // interval이 초 단위 인경우
      if(interval >= 1000){
          d.setMilliseconds(0);
      }
      // interval이 분 단위 인경우
      if(interval >= 60000){
          d.setSeconds(0);
      }
      // interval이 시간 단위 인경우
      if(interval >= 3600000){
          d.setMinutes(0);
      }
      // interval이 일 단위 인경우
      if(interval >= 86400000){
          d.setHours(0);
      }

      if(firstFlag){

          if(interval == PlotChart.time.exMin){

          }

          if(interval == PlotChart.time.exTenMin){
              var min = d.getMinutes();

//              if(min % 10 != 0){
//                  d = (+d) + ((10 - (min < 10 ? min : (min + '')[1])) * 1000 * 60);
//              }
              if(min % 10 != 0){
                  d = (+d) - ((min < 10 ? min : (min + '')[1]) * 1000 * 60);

                  if(type == 0){
                      d = (+d) + interval;
                  }
              }
          }

          if(type == 1 && ! this.xaxisCurrentToTime){
              d = (+d) - interval;
          }
      }

      return +d;
    },

    createToolTip: function(){

        if(this.$toolTip){
            return;
        }

        this.$toolTip = $('<div class="plot-tool-tip"></div>').css({
            'position': 'absolute',
            'display': 'none',
            'z-index': 100000,
            'color': '#fff',
            'background-color': '#000',
//            'background-image': 'linear-gradient(to right, rgb(78, 78, 78) 0%, rgb(138, 138, 138) 50%, rgb(78, 78, 78) 100%)',
            'padding': '4px',
            'border-radius': '4px'
//            'border': '1px solid #cdcdcd',
//            'padding': '8px 14px',
//            'box-sizing': 'content-box',
//            'font-size': '13px',
//            'font-weight': 'bold',

        });

        $('body').append(this.$toolTip);
    },

    /**
     * 시리즈 show ,hide 기능
     * @param series    series index
     * @param falg      true : show, false : hide
     */
    setSeriesVisible: function(series, flag){
        if(this.serieseList[series]){
            this.serieseList[series].visible = flag;

            if(this.serieseList[series].labelObj){
                var colorObj = this.serieseList[series].labelObj.items.items[0];
                if(colorObj && colorObj.itemId == 'color'){
                    if(flag){
                        colorObj.el.dom.style.background = this.serieseList[series].color;
                    }else{
                        colorObj.el.dom.style.background = '';
                    }
                    colorObj.selected = flag;
                }
            }
            this.setCurrentMaxValue();
        }
    },

    setCurrentMaxValue: function(){
        var i = null;
        var j = null;
        var seriesLen = null;
        var dataLen = null;
        var series = null;
        var seriesList = this.serieseList;

        this.initMaxValue();

        for(i = 0, seriesLen = seriesList.length; i < seriesLen; i++){
            series = seriesList[i];
            if(series.visible){
                for(j = 0, dataLen = series._data.length; j < dataLen; j++){
                    this.setMaxValue(series._data[j][0], series._data[j][1], series, j, series._data[j][0]);
                }
            }
        }

        seriesList = null;
        series = null;
    },

    /**
     * @param series index
     * @returns true | false
     */
    isVisibleSeries: function(series){
        var result = false;
        if(this.serieseList[series]){
            result = this.serieseList[series].visible;
        }

        return result;
    },

    /**
     * 차트 line width 설정
     * @param series index
     * @param width
     */
    setLineWidth: function(seriesIndex, width){
        if(seriesIndex == null){
            for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
                this.serieseList[ix][this.serieseList[ix].type].lineWidth = width;
            }
        }else{
            if(this.serieseList[seriesIndex]){
                this.serieseList[seriesIndex][this.serieseList[seriesIndex].type].lineWidth = width;
            }
        }
    },

    setSeriesColor: function(seriesIndex, color){
        if(seriesIndex == null){
            for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
                this.serieseList[ix].color = this.chartType.colors[ix];

                if(this.serieseList[ix].labelObj && this.serieseList[ix].labelObj.items.items[0] && this.serieseList[ix].labelObj.items.items[0].el){
                    this.serieseList[ix].labelObj.items.items[0].el.dom.style.background = this.chartType.colors[ix];
                }
            }
        }else{
            if(this.serieseList[seriesIndex]){
                this.serieseList[seriesIndex].color = color;
                if(this.serieseList[seriesIndex].labelObj && this.serieseList[seriesIndex].labelObj.items.items[0] && this.serieseList[seriesIndex].labelObj.items.items[0].el){
                    this.serieseList[seriesIndex].labelObj.items.items[0].el.dom.style.background = color;
                }
            }
        }
    },

    legendPositionChange: function(region){},

    /**
     * 클릭된 마우스 좌표에서 가장 가까운 데이터의 좌표에 구분선을 그린다
     * @param pos 클릭된 마우스 좌표 {x : 1, y : 1}
     * @returns 클릭된 마우스 좌표에서 가장 가까운 데이터
     */
    drawIndicator: function(pos){
        if(! this.plot || ! pos || typeof pos != 'object' || pos.x == null ) {
            this.removeIndicator();
            return;
        }

        var o = null,
            item = {};

        var datas = this.plot.getData();
        var seriesLen = datas.length, dataLen = null;
        var yValues = [], legendFormat = this.indicatorLegendFormat;
        var i = 0, j = 0, k = 0, maxValue = 0;

        pos.x = (+pos.x).toFixed(0);

        o = this.plot.pointOffset({
            x: pos.x,
            y: pos.y
        });

        for(i; i < seriesLen; i++){
            for(j = 0, dataLen = datas[i].data.length; j < dataLen; j++){
                if(pos.x == datas[i].data[j][0]){
                    yValues.push({
                        series: datas[i].id,
                        y : datas[i].data[j][1],
                        time : this.serieseList[i].timeTicks[j].milliTime
                    });

                    pos.dataIndex = j;
                }
            }
        }

        for(k; k < yValues.length; k++){
            if(yValues[k].y){
                maxValue = (yValues[k].y > maxValue ? yValues[k].y : maxValue);
            }
        }

        item.x = yValues[0].time;
        item.y = maxValue;

        var xAxisValue = $.plot.formatDate(new Date(yValues[0].time), this.indicatorLegendAxisTimeFormat);
        var yAxisValue = common.Util.toFixed(maxValue, this.toFixedNumber);

        legendFormat = legendFormat.replace('%x', xAxisValue).replace('%y', yAxisValue);

        var maxY = this.plot.pointOffset({x: 0, y: this.plot.getAxes().yaxis.max }).top - 12;
        var realMaxY = this.plot.pointOffset({x: 0, y: maxValue }).top;

        this.prevIndicatorPos = pos;

        this._createIndicatorTip(15, o.left, maxY, legendFormat, realMaxY);

        return item;
    },

    _createIndicatorTip: function(height, x, y, text, realMaxY){
        var width = 0, left = 0, direct = 0;
        var style = 'position:absolute;top:' + y + 'px;height:' + height + 'px;line-height: ' + height + 'px;border-radius:4px;background: #414141;color: #FFF;padding: 0px 4px;text-align:center;display:none;';
//        var style = 'position:absolute;top:' + y + 'px;height:' + height + 'px;line-height: ' + height + 'px;border-radius:4px;background: linear-gradient(to right, #1E2C29 0%, #8BA395 50%,#222529 100%);color: #FFF;padding: 0px 4px;text-align:center;display:none;';
        var lineStyle = null;
        var canvasWidth = this.plot.width();

        if(this._type == PlotChart.type.exPie){
            return;
        }

        var totalDataCount = 0;
        for(var ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++){
            totalDataCount += this.serieseList[ix].data.length;
        }

        if(totalDataCount == 0){
            return;
        }

        if(this._type == PlotChart.type.exLine){
            lineStyle = 'position:absolute;top:12px;width:2px;left:50%;height:' + (this.plot.height() - y) + 'px;background: #414141;';
//            lineStyle = 'position:absolute;top:12px;width:2px;left:50%;height:' + (this.plot.height() - y) + 'px;background-image: linear-gradient(to bottom, rgb(30, 44, 41) 0%, rgb(220, 226, 223) 100%);';
        }else{
            lineStyle = 'position:absolute;top:12px;width:2px;left:50%;height:' + Math.abs(y - realMaxY + height) + 'px;background: #414141;';
//            lineStyle = 'position:absolute;top:12px;width:2px;left:50%;height:' + Math.abs(y - realMaxY + height) + 'px;background-image: linear-gradient(to bottom, rgb(30, 44, 41) 0%, rgb(220, 226, 223) 100%);';
        }

        this.removeIndicator();

        this.indicatorLegend = $('<div style="' + style + '">' + text + '<div style="' + lineStyle + '"></div></div>');
        this._$chartTarget.append(this.indicatorLegend);

        direct = this.indicatorLegend.outerWidth();
        if(x < direct / 2){
            width = 0;
            left = 0;
        }else if(x > canvasWidth - (direct / 2)){
            width = direct;
            left = 100 - ( 2 / width * 100);
        }else{
            width = direct / 2;
            left = 50;
        }

        this.indicatorLegend.css('left', x - width).show().children().eq(0).css('left', left + '%');
    },

    removeIndicator: function(){
        if(this.indicatorLegend){
            this.indicatorLegend.remove();
        }
    },


    /**
     * Wrapper of flot setData
     *<br><br>
     * You can use this to reset the data used. Note that axis scaling, ticks, legend etc.
     * will not be recomputed (use setupGrid() to do that).
     * You'll probably want to call draw() afterwards.
     *<br><br>
     * @param {Array} Series to set
     */
    setData: function(series) {
        return this.plot.setData(series);
    },

    /**
     *
     * Wrapper of flot setupGrid
     *<br><br>
     * Recalculate and set axis scaling, ticks, legend etc.
     *<br><br>
     * You need to call draw() to get the canvas redrawn.
     */
    setupGrid: function() {
        return this.plot.setupGrid();
    },

    /**
     * Wrapper of flot draw
     * <br><br>
     * Redraws the canvas.
     */
    draw: function() {
        return this.plot.draw();
    },

    /**
     * 테마에 따라 폰트, 라인 색상 설정
     */
    setColorByTheme: function(type) {
        if (type === 'black') {
            this._chartOption.grid.borderColor = '#81858A';
            this._chartOption.grid.color = '#81858A';
            this._chartOption.xaxis.font.color='#ABAEB5';
            this._chartOption.yaxis.font.color='#ABAEB5';
        } else {
            this._chartOption.grid.borderColor = '#ccc';
            this._chartOption.grid.gridColor = '#ccc';
            this._chartOption.xaxis.font.color='#555';
            this._chartOption.yaxis.font.color='#555';
        }
        this.plotReSize();
    },


    listeners: {
        afterrender: function(){
            if(this._isFirstFlag){
                this._isFirstFlag = false;
                this._$chartTarget = $(this._chartTarget);

                this.plotDraw();
                this.plotChartEvent();
            }
        }
    }
});