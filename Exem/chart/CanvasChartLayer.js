/**
 * @param arg(Object)
 * @returns {BaseCanvasChart}
 * @author hwan
 *
 *  dependent JQuery, jquery.flot.js, and IMXWS.js
 */

//  차트별로
Ext.define("Exem.chart.CanvasChartLayer", {
    extend: 'Exem.chart.CanvasChart',
    showTitle: false,                       // 차트 타이틀 영역 생성 default: false
    title : null,                           // 차트 타이틀 설정 default: null
    titleRegion: 'north',
    titleAlign: 'left',                     // 차트 타이틀 정렬 설정 (left, center, right) default: left
    titleHeight: 40,                        // 차트 타이틀 영역 높이 조절 default: 40
    titleFontSize: '14px',                  // 차트 타이틀 영역 폰트 설정 default: 16px
    titleBackgroundColor : 'transparent',   // 차트 타이틀 영역 백그라운드 색상 설정 default: #eee
    yAxisWidth: 20,                         // 차트 레전드 y축 레이블 영역 넓이 지정 default: 20
    showHistoryInfo: true,
    changeLegendLayout: false,
    highlightLegend: true,                  // 차트 레전드 영역 마우스 오버 하이라이팅 설정 default: false
    showLegendValueArea: false,             // 차트 레전드 데이터 표시 영역 설정
    legendValueStyle: {                     // 차트 레전드 데이터 표시 영역 설정
        'font-size': '10px'
    },
    showLegendNameArea: true,               // 차트 레전드 이름 영역 표시 설정
    legendNameStyle: {},
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

    legendBackgroundColor: 'transparent',          // 차트 레전드 영역 백그라운드 색상 설정 default: #ccc
    backgroundColor: 'transparent',                // 차트 영역 백그라운드 색상 설정 default: #fff
    titleStyle : null,
    plotCheckBoxChange: null,
    legendColorClickType: 1,                // 0: history info 그리드, 1: 사용자 이벤트
    legendColorClickToVisible: true,        // 차트 레전드 색깔 영역 클릭시 해당 시리즈 visible 설정
    legendColorClick: null,                 // 차트 레전드 영역중 색깔 영역 클릭 이벤트
    legendNameHover: null,                  // 차트 레전드 이름 영역 마우스 over 이벤트
    legendNameLeave: null,                  // 차트 레전드 이름 영역 마우스 leave 이벤트
    legendNameClick: null,                  // 차트 레전드 이름 영역 click 이벤트
    legendNameDblClick: null,               // 차트 레전드 이름 영역 double click 이벤트

    customTitle    : false,                 // 차트 타이틀 영역 오른쪽 영역 쓸 수 있게 layout 변경
    currentHighLightIndex : null,           // 차트 hightlight 선택 시 인덱스 값 저장

//    padding: 10,
    constructor: function(){
//        this.superclass.constructor.call(this, config);
        this.callParent(arguments);
        var self = this;

        self.titleLayer = null,
            self.labelLayer = null;
        self.chartLayer = null;

        var titleStyle = {
            'font-size' : self.titleFontSize,
            'background-color': self.titleBackgroundColor,
            'text-align': self.titleAlign,
            'text-indent': '20px',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
            'overflow': 'hidden'
        };

        $.extend(titleStyle, this.titleStyle || {});


        // showTitle 가 true 일 경우 타이틀 레이어 생성
        if(self.showTitle){
            if (self.customTitle) {
                self.titleArea = Ext.create('Ext.container.Container', {
                    layout: 'hbox',
                    width : '100%',
                    height: self.titleHeight
                });

                self.titleLayer = Ext.create('Ext.container.Container', {
                    region: this.titleRegion,
                    //layout: 'fit',
                    flex : 1,
                    height: self.titleHeight,
                    //overflowX: 'auto',
                    html: self.title || '',
                    cls : 'Exem-CanvasChartLayer-titleLayer',
                    style: titleStyle
                });

                self.titleArea.add(self.titleLayer);
                self._chartContainer.add(self.titleArea);

            } else {
                self.titleLayer = Ext.create('Ext.container.Container', {
                    region: this.titleRegion,
                    layout: 'fit',
                    height: self.titleHeight,
                    //overflowX: 'auto',
                    html: self.title || '',
                    cls : 'Exem-CanvasChartLayer-titleLayer',
                    style: titleStyle
                });
                self._chartContainer.add(self.titleLayer);
            }
        }
        // showLegend 가 true 일 경우 레이블 레이어 생성
        if(self.showLegend){
            this._chartOption.yaxis.yAxisWidth = this.yAxisWidth;
            if(self.legendAlign == 'south' || self.legendAlign == 'north'){
//                var labelContainer = Ext.create('Ext.container.Container',{
//                    region: self.legendAlign,
////                    layout: 'fit',
//                    split: true,
//                    height: self.legendHeight,
//                    padding: '4 4 4 4',
//                    style: {
//                        'background-color': self.legendBackgroundColor
//                    }
//                });

                self.labelLayer = Ext.create('Ext.container.Container', {
                    region: self.legendAlign,
                    layout : {
                        type: self.legendVH,
                        pack: self.legendContentAlign
                    },
                    overflowY: 'auto',
                    padding: '4 4 4 10',
                    width: self.legendWidth,
                    height: self.legendHeight,
                    style: {
                        'background-color': self.legendBackgroundColor
                    }
                });

//                labelContainer.add(self.labelLayer);
                self._chartContainer.add(self.labelLayer);
            }else{
                if(this.showHistoryInfo){

                    // PerformanceTrend 에서 Icon 영역에 Toggle을 집어넣기 위해 Layout을 바꿀 경우
                    if (self.changeLegendLayout) {
                        self.labelLayer = Ext.create('Ext.container.Container', {
                            layout: self.legendVH,
                            //padding: '4 4 4 4',
                            padding: '4 0 0 0',
                            overflowY: 'auto',
                            region: self.legendAlign,
                            width: '100%',
                            flex : 1,
                            style: {
                                'background-color': self.legendBackgroundColor
                            }
                        });

                        self.iconLayer = Ext.create('Ext.container.Container', {
                            layout: 'hbox',
                            width : 117,
                            height: 25,
                            hidden: true
                        });

                        self._historyInfoBtn = Ext.create('Ext.button.Button',{
                            xtype: 'button',
                            height: 20,
                            width: 50,
                            text: common.Util.TR('Detail'),
                            margin: '4 0 0 0',
                            //style: {
                            //    background: 'url(../images/xm_icon_v1.png)',
                            //    backgroundPosition: '-5px -423px',
                            //    border: 'none',
                            //    borderRadius: '0px'
                            //},
                            listeners: {
                                scope:this,
                                click: function(){
                                    this.openHistoryInfo();
                                }
                                //mouseover: function(me){
                                //    me.el.dom.style.backgroundPosition = '-5px -404px';
                                //},
                                //mouseout: function(me){
                                //    me.el.dom.style.backgroundPosition = '-5px -423px';
                                //}
                            }
                        });

                        self.customLayer = Ext.create('Ext.container.Container', {
                            //layout: 'fit',
                            flex : 1,
                            height: '100%'
                        });

                        self.iconLayer.add(self._historyInfoBtn, self.customLayer);

                        self._chartContainer.add({
                            xtype: 'container',
                            layout: 'vbox',
                            width: self.legendWidth,
                            split: true,
                            region: self.legendAlign,
                            items: [
                                self.iconLayer,
                                self.labelLayer
                            ]
                        });


                    } else {

                        self.labelLayer = Ext.create('Ext.container.Container', {
                            layout: self.legendVH,
                            //padding: '4 4 4 4',
                            padding: '4 0 0 4',
                            overflowY: 'auto',
                            region: self.legendAlign,
                            width: '100%',
                            flex : 1,
                            style: {
                                'background-color': self.legendBackgroundColor
                            }
                        });
                        self._historyInfoBtn = Ext.create('Ext.button.Button',{
                            xtype: 'button',
                            height: 20,
                            width: 50,
                            margin: '4 0 5 6',
                            text: common.Util.TR('Detail'),
                            hidden: true,
                            //style: {
                            //    background: 'url(../images/xm_icon_v1.png)',
                            //    backgroundPosition: '-5px -423px',
                            //    border: 'none',
                            //    borderRadius: '0px'
                            //},
                            listeners: {
                                scope:this,
                                click: function(){
                                    this.openHistoryInfo();
                                }
                                //mouseover: function(me){
                                //    me.el.dom.style.backgroundPosition = '-5px -404px';
                                //},
                                //mouseout: function(me){
                                //    me.el.dom.style.backgroundPosition = '-5px -423px';
                                //}
                            }
                        });

                        self._chartContainer.add({
                            xtype: 'container',
                            layout: 'vbox',
                            width: self.legendWidth,
                            split: true,
                            region: self.legendAlign,
                            items: [
                                self._historyInfoBtn,
                                self.labelLayer
                            ]
                        });
                    }
                }else{
                    self.labelLayer = Ext.create('Ext.container.Container', {
                        layout: self.legendVH,
                        //padding: '4 4 4 4',
                        padding: '4 0 0 4',
                        overflowY: 'auto',
                        split: true,
                        region: self.legendAlign,
                        width: self.legendWidth,

                        style: {
                            'background-color': self.legendBackgroundColor
                        }
                    });
                    self._chartContainer.add(self.labelLayer);
                }
            }
        }

        self.chartLayer = Ext.create('Ext.container.Container', {
            region: 'center',
            layout: 'fit',
            height: '100%',
//            minWidth: 200,
            minHeight: 50,
            margin: this.fixedWidth ? null : '4 4 4 16',
            style: {
                'background-color': self.backgroundColor
            }
        });

        // 차트 레이어 생성
        if(this.fixedWidth){
            this.chartWrap = Ext.create('Ext.container.Container', {
                region: 'center',
                width: '100%',
                height: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                //padding: '4 4 4 16'
                margin: '4 4 4 16'
            });

            this._chartContainer.add(this.chartWrap);
            this.chartWrap.add(this.chartLayer);
        }else{
            self._chartContainer.add(self.chartLayer);
        }

        self._chartTarget = '#'+ self.chartLayer.id;
    },

    createChartLegend : function(hideLegend){
        var self = this;
        var colorWidth = 10,
            colorHeight = 10,
            nameHeight = 14,
            index = this.serieseList.length -1,
            series = this.serieseList[index];

        series.labelObj = Ext.create('Ext.container.Container', {
            layout: {
                type: "hbox",
                pack: "start",
                align: "middle"
            },
            //flex: 1,
            width: this.showLegendValueArea ? '100%' : null
            //width: '100%'
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
            //'width'             : '8px',
            //'height'            : '8px',
            //'border-radius'     : '50%',
            //'border'            : '2px solid #fff',
            //'box-shadow'        : '0px 0px 3px #5B796B'
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
            style: legendStyle,
            listeners: {
                scope: this,
                render: function( me, eOpts ){
                    me.el.on('click',function(event, el){
                        if(self.legendColorClickType == 0){
                            if(this._type == 'pie' || this._isHorizontal || this._chartOption.xaxis.mode == 'categories' || this._chartOption.xaxis.mode == 'categories'){
                                return;
                            }
                        }else if(self.legendColorClickType == 1){
                            if(this.selected){
                                this.selected = false;

                                if(self.legendColorClickToVisible){
                                    self.setSeriesVisible(this.index, false);
                                    self.getMaxValue();
                                    self.plotReSize();
                                }
                            }else{
                                this.selected = true;

                                if(self.legendColorClickToVisible){
                                    self.setSeriesVisible(this.index, true);
                                    self.getMaxValue();
                                    self.plotReSize();
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
            var legendNameWidth = null;
            if(self.legendAlign == 'south' || self.legendAlign == 'north' || this.legendVH == 'column' || self.legendAlign == 'east'){
                legendNameWidth = this.legendNameWidth;
            }

            series.labelObj.legendName = Ext.create('Ext.form.Label',{
                itemId: 'name',
                //width: this.showLegendValueArea ? this.legendNameWidth : (this.legendVH == 'column' ? this.legendNameWidth : this.legendWidth - 10),
                width: legendNameWidth,
                height: nameHeight,
                flex : 5,
                index: index,
                text: series.label,
//                    text: series.label ? (series.label[0].toUpperCase() + series.label.substr(1, series.label.length)) : (series.id[0].toUpperCase() + series.id.substr(1, series.id.length)),
                margin: {
//                    left    : 4,
                    bottom  : 4
                },
                //margin: '0 3 4 0',
                cls : 'Exem-CanvasChartLayer-legendName',
                textAlign: 'left',
                style : this.legendNameStyle,
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
                                self.setLineWidth(this.index, self.chartLineWidth);
                                self.plotDraw();

                                if(self.legendNameHover){
                                    self.legendNameHover(self, this, event, el);
                                }
                            }.bind(me));


                            me.el.on('mouseleave',function(event, el){
                                el.style.fontWeight = 'normal';
                                self.setLineWidth(this.index, self._lineWidth);
                                self.plotDraw();

                                if(self.legendNameLeave){
                                    self.legendNameLeave(self, this, event, el);
                                }
                            }.bind(me));

                        }

                        if(this.legendNameClick){
                            me.el.dom.style.cursor = 'pointer';
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
                flex: 1,
                margin: '2 0 0 2',
                cls: 'imx-font chart-legend-value',
                style: this.legendValueStyle
            });
            series.labelObj.add(series.labelObj.legendValue);

//            series.labelObj.legendValue.el.dom.style.right = '0px';
//            series.labelObj.legendValue.el.dom.style.left = 'initial';
        }

        //if(this.legendOrder == 'desc' || (this._isStack && this.legendVH == 'vbox')){
        if(this.legendOrder == 'desc'){
            this.labelLayer.insert(0, series.labelObj);
        }else{
            this.labelLayer.add(series.labelObj);
        }
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

        value = (value == null ? 0 : value);

        if(series && series.labelObj && series.labelObj.legendValue && series.labelObj.legendValue.el){
//            series.labelObj.legendValue.setText(common.Util.numberFixed(value, 3));
            series.labelObj.legendValue.el.dom.textContent = common.Util.toFixed(value, this.toFixedNumber);
            series.labelObj.legendValue.el.dom.style.top = '2px';
        }
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
    },

    /**
     * @param value 값이 없을 경우 '' 로 초기화
     */
    setLegendValues: function(value){
        var seriesList = this.serieseList;
        var i = 0, len = seriesList.length;

        value = (value == null ? 0 : value);
        for(i; i < len; i++){
            seriesList[i].labelObj.legendValue.setText(common.Util.numberFixed(value, this.toFixedNumber));
        }
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
    //
    //            this._isFirstFlag = false;
    //        }
    //    }
    //}
});