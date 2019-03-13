Ext.define('Exem.abnormalChart', {
    extend: 'Ext.Component',

    margin: {
        top   : 20,
        right : 30,
        bottom: 20,
        left  : 20
    },

    lineCount: 7, // 라인을 표시할 수

    colorObj : {
        meanBar: '#91c729',
        boundBar: '#d0d04b',
        normalLineBar: '#0000b4',
        abnormalLineBar: '#fb7e4f',
        barText: '#ffffff',
        strokeLine: '#adadad'
    },


    xyLineWidth : 15, // x축 시작점과 y축 text 사이의 거리.
    textWidth: 300, // y축에 표시할 텍스트 넓이

    xAxisHeight: 20,  // x축을 표시할 높이
    legendHeight: 16, // 이값은 설정되는 font-size 에 의해서 변경할 필요가 있음.
    tidTextHeight: 20, // 상단의 tid 텍스트를 표시할 높이

    showElapseValue: false,

    legendList: [
        common.Util.CTR('Elapse Time (normal)'),
        common.Util.CTR('Elapse Time (abnormal)'),
        common.Util.CTR('Tolerance Range'),
        common.Util.CTR('Tolerance Range Average')],

    init: function() {
        // resize에 대응하기 위해 추가 background container 생성
        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height : '100%',
            listeners : {
                resize : function() {
                    if (this.isInit) {
                        this.clearChart();
                        this.setChartSize();
                        this.draw();
                    }
                }.bind(this)
            },
            style : 'background : #FFFFFF'
        });

        this.target.add(this.background);

        this.initProperty();
        this.setChartSize();
        this.draw();
    },

    initProperty: function() {
        this.isInit = false;
        this.isInitDataSetting = false;
        this.methodList = [];
        this.elapseTime = [];
        this.lowerBound = [];
        this.upperBound = [];
        this.meanValue = [];
        this.abnormal = [];
        this.boundValue = [];
        this.tid = [];
        this.rowCount = 0;
        this.maxValue = 0;
    },

    setChartSize: function() {
        // 차트 전체 Size 지정
        this.svgWidth  = this.background.getWidth();
        this.svgHeight = this.background.getHeight();

        this.chartWidth = this.svgWidth - this.margin.left - this.xyLineWidth - this.margin.right - this.textWidth;
        this.chartHeight = this.svgHeight - this.margin.bottom - this.margin.top - this.legendHeight - this.tidTextHeight - this.xAxisHeight;
    },

    clearChart: function() {
        if (this.svg) {
            this.svg.selectAll('g').remove();
        }
    },

    dataReset: function() {
        this.methodList = [];
        this.elapseTime = [];
        this.lowerBound = [];
        this.upperBound = [];
        this.meanValue = [];
        this.abnormal = [];
        this.boundValue = [];
        this.tid = [];
    },

    // 생성된 SVG DOM의 attr에 size 정보 처리
    draw: function() {
        if (!this.isInit) {
            this.svg = d3.select('#' + this.background.id).append('svg')
                .attr({'width':this.svgWidth,'height':this.svgHeight});
            this.createToolTip();
            this.isInit = true;
        } else {
            this.svg.attr({'width':this.svgWidth,'height':this.svgHeight});
        }

        this.dataSetting();
        this.scaleSetting();

        this.createAxisX();
        this.createAxisY();

        this.createLegend();

        this.createStrokeLine();
        this.createElapseBars();
        this.createBoundBars();
        this.createMeanBars();

        this.createTidText();
    },

    createToolTip: function() {
        this.toolTip = d3.select('#' + this.background.id).append('div')
            .style({
                'position': 'absolute',
                'display' : 'none',
                'z-index' : 20000,
                'color'   : '#000',
                'background-color': '#cccccc',
                'border'  : '1px solid #868686',
                'border-radius': '3px',
                'text-anchor': 'center',
                'line-height': '20px'
            });
    },

    dataSetting: function() {
        var ix, ixLen,
            elapseMax, upperMax,
            rangeCount, rangeValue;

        for ( ix = 0, ixLen = this.rowCount; ix < ixLen; ix ++ ) {
            if (!elapseMax || elapseMax < this.elapseTime[ix]) {
                elapseMax = this.elapseTime[ix];
            }

            if (!upperMax || upperMax < this.upperBound[ix]) {
                upperMax = this.upperBound[ix];
            }
        }

        this.maxValue = Math.max(elapseMax, upperMax) || 0;

        if (!this.isInitDataSetting) {
            this.isInitDataSetting = true;
            rangeCount = 1;
        } else {
            rangeCount = this.lineCount;
        }

        rangeValue = Math.round(this.maxValue / this.lineCount);

        this.strokeLine = d3.range(rangeCount).map(function() {
            return {
                'x1':0,
                'y1':0,
                'x2':0,
                'y2':this.chartHeight
            };
        }.bind(this));


        this.tickVal = this.strokeLine.map(function(d,i) {
            if ( i === 0 ) {
                return 0;
            } else {
                return i * rangeValue;
            }
        });
    },

    scaleSetting: function() {
        this.xscale = d3.scale.linear()
            .domain([0,this.maxValue])
            .range([0,this.chartWidth]);

        this.yscale = d3.scale.linear()
            .domain([0,this.rowCount + 1])
            .range([0,this.chartHeight]);

        this.abnormalScale = d3.scale.quantize()
            .domain([0,this.abnormal.length])
            .range(this.abnormal);

        this.legendScale = d3.scale.linear()
            .domain([0,this.legendList.length])
            .range([0,this.textWidth + this.chartWidth + this.xyLineWidth]);
    },

    createAxisX: function() {
        var xAxis = d3.svg.axis(),
            x = this.margin.left + this.xyLineWidth + this.textWidth,
            y = this.chartHeight + this.margin.top + this.tidTextHeight;

        xAxis.orient('bottom')
            .scale(this.xscale)
            .tickSize(1)
            .tickValues(this.tickVal);

        this.svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('id','xAxis')
            .call(xAxis);
    },

    createAxisY: function() {
        var yAxis = d3.svg.axis(),
            x = this.margin.left + this.textWidth,
            y = this.margin.top + this.tidTextHeight;

        yAxis.orient('left')
            .scale(this.yscale)
            .tickSize(1)
            .tickFormat(function() {
                return null;
            }.bind(this))
            .tickValues(d3.range(this.rowCount + 1));

        this.svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('id','yAxis')
            .call(yAxis);

        this.svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('id','yAxisArea')
            .selectAll()
            .data(this.methodList)
            .enter()
            .append('foreignObject')
            .attr({
                'id' : function(d,i) {
                    return 'yAxisText' + i;
                }
            })
            .attr({
                'x':'-' + this.textWidth,
                'y':function(d,i) {
                    return this.yscale(i + 1) - 7;
                }.bind(this)
            })
            .text(function(d) {
                return d;
            })
            .style({
                'width': (this.textWidth - 5) + 'px',
                'height': '14px',
                'overflow': 'hidden',
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap',
                'text-align': 'right',
                'z-index' : 100
            })
            .style('color', function(d,i) {
                if (this.abnormalScale(i) === 'true') {
                    return 'red';
                }
            }.bind(this))
            .on('mouseover', function(d) {
                var svg = this.svg[0][0].getBoundingClientRect();

                if (d) {
                    this.toolTip.text(d);
                    this.toolTip.style({
                        'display': 'block',
                        'top': (d3.event.pageY - svg.top + 10) + 'px',
                        'left': (d3.event.pageX - svg.left + 10) + 'px'
                    });
                } else {
                    this.toolTip.style({
                        'display': 'none'
                    });
                }
            }.bind(this))
            .on('mouseleave', function() {
                this.toolTip.style({'display': 'none'});
            }.bind(this));
    },

    createLegend: function() {
        var x = this.margin.left,
            y = this.margin.top + this.chartHeight + this.tidTextHeight + this.xAxisHeight;

        var legendArea = this.svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('id','legend')
            .append('svg');


        var legendSvg = legendArea.selectAll('#legend')
            .data(this.legendList)
            .enter().append('g')
            .attr('transform', function(d, i) {
                if (i === 0) {
                    return 'translate(0,5)';
                } else {
                    return 'translate(' + this.legendScale(i) + ', 5)';
                }
            }.bind(this));

        legendSvg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function(d, i) {
                var displayColor;
                switch (i) {
                    case 0:
                        displayColor = this.colorObj.normalLineBar;
                        break;
                    case 1:
                        displayColor = this.colorObj.abnormalLineBar;
                        break;
                    case 2:
                        displayColor = this.colorObj.boundBar;
                        break;
                    case 3:
                        displayColor = this.colorObj.meanBar;
                        break;
                    default:
                        break;
                }
                return displayColor;
            }.bind(this));

        legendSvg.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .text(function(d) {
                return d;
            })
            .style('text-anchor', 'start')
            .style('font-size', 14);
    },

    createTidText: function() {
        var x = this.margin.left + this.textWidth + this.xyLineWidth + this.xscale(this.maxValue / 2) - 75,
            y = this.margin.top + this.tidTextHeight - 6;

        if (this.tid.length) {
            this.svg.append('g')
                .attr('transform', 'translate(' + x + ',' + y + ')')
                .selectAll()
                .data(this.tid)
                .enter()
                .append('text')
                .text(function(d) {
                    return 'tid : ' + d;
                });
        }
    },

    createStrokeLine: function() {
        var x = this.margin.left + this.textWidth + this.xyLineWidth,
            y = this.margin.top + this.tidTextHeight;

        this.svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('id','strokeLine')
            .selectAll('line')
            .data(this.strokeLine)
            .enter()
            .append('line')
            .attr({
                'x1':function(d,i) {
                    return this.xscale(this.tickVal[i]);
                }.bind(this),
                'y1':function(d) {
                    return d.y1;
                },
                'x2':function(d,i) {
                    return this.xscale(this.tickVal[i]);
                }.bind(this),
                'y2':function(d) {
                    return d.y2;
                }
            })
            .style({'stroke':this.colorObj.strokeLine, 'stroke-width':'1px'});
    },

    createElapseBars: function() {
        var x = this.margin.left + this.textWidth + this.xyLineWidth,
            y = this.margin.top + this.tidTextHeight;

        this.svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('id','elapseBars')
            .selectAll('rect')
            .data(this.elapseTime)
            .enter()
            .append('rect')
            .attr('width',function(d) {
                return this.xscale(d);
            }.bind(this))
            .attr('height',12)
            .attr({
                'x':0,'y':function(d,i) {
                    return this.yscale(i + 1) - 6;
                }.bind(this)
            })
            .style('fill',function(d,i) {
                if (this.abnormalScale(i) === 'true') {
                    return this.colorObj.abnormalLineBar;
                } else {
                    return this.colorObj.normalLineBar;
                }
            }.bind(this));

        if (this.showElapseValue) {
            this.displayElapseBarValue();
        }
    },

    createBoundBars: function() {
        var x = this.margin.left + this.textWidth + this.xyLineWidth,
            y = this.margin.top + this.tidTextHeight;

        this.svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('id','boundBars')
            .selectAll('rect')
            .data(this.boundValue)
            .enter()
            .append('rect')
            .attr('height',8)
            .attr({
                'x': function(d,i) {
                    return this.xscale(this.lowerBound[i]);
                }.bind(this),
                'y':function(d,i) {
                    return this.yscale(i + 1) - 4;
                }.bind(this)
            })
            .style('fill', this.colorObj.boundBar)
            .style('opacity','0.7')
            .attr('width',function(d) {
                return this.xscale(d);
            }.bind(this));
    },

    createMeanBars: function() {
        var x = this.margin.left + this.textWidth + this.xyLineWidth,
            y = this.margin.top + this.tidTextHeight;

        this.svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('id','meanBars')
            .selectAll('rect')
            .data(this.meanValue)
            .enter()
            .append('rect')
            .attr('height',16)
            .attr({
                'x': function(d,i) {
                    return this.xscale(this.meanValue[i]) - 4;
                }.bind(this),
                'y':function(d,i) {
                    return this.yscale(i + 1) - 8;
                }.bind(this)
            })
            .style('fill',this.colorObj.meanBar)
            .style('opacity','0.8')
            .attr('width',function() {
                return 8;
            });
    },

    displayElapseBarValue: function() {
        d3.select('#elapseBars')
            .selectAll('text')
            .data(this.elapseTime)
            .enter()
            .append('text')
            .attr({
                'x':function(d) {
                    return this.xscale(d) / 2 - 4;
                }.bind(this),
                'y':function(d,i) {
                    return this.yscale(i + 1) + 5;
                }.bind(this)
            })
            .text(function(d) {
                return d;
            }).style({'fill':this.colorObj.barText,'font-size':'12px'});
    }
});
