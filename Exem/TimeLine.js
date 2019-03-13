Ext.define('Exem.TimeLine', {
    extend: "Ext.Component",

    setObj: {
        rowHeight : 20,
        margin: {
            top   : 30,
            right : 30,
            bottom: 5,
            left  : 250 //left값은 Y축테이블의 넓이와 관련됨
        }
    },
    colorObj : {
        headBackground : '#DBDBDB',
        rowBackground : '#FFFFFF',
        lineBar : '#0E6ABD',
        border : '#CBCACA',
        text : '#000000',
        multiBar : [
            '#3ca0ff', '#90db3b', '#00c4c5', '#ffde00', '#ff7781',
            '#8470ff', '#75cd8e', '#48d1cc', '#fec64f', '#fe984f',
            '#0052ff', '#00a48c', '#83cfde', '#dfe32d', '#ff7d40',
            '#99c7ff', '#a5fee3', '#0379c9', '#eef093', '#ffa891',
            '#00c5cd', '#009bc7', '#cacaff', '#ffc125', '#df6264'
        ]
    },
    showTooltip: false,
    isSetExtInfo: false,
    showDataValue: false,
    /**
     * 1. EtoE Transaction TimeLine Chart로, 2가지 부분으로 분리가 된다.
     *   - Y축 좌측에 붙을 테이블 형태의 트랜잭션 정보 부문
     *   - 실제 타임라인 차트
     */
    init: function() {
        var self = this;

        //resize에 대응하기 위해 추가 background container 생성
        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height : '100%',
            listeners : {
                resize : function() {
                    if(self.isInit) {
                        self.draw();
                    }
                }
            },
            style : 'overflow-y: auto; overflow-x: hidden;'
        });

        this.target.add(this.background);

        //d3에 node select custom function을 선언
        this.setD3CustomFn();
        //chart data를 timeline을 그리기 위한 구조로 파싱
        this.initChartData();
        //차트 DOM 생성
        this.createChartDOM();

        // tooltip DOM 생성
        if (this.showTooltip) {
            this.createTooltip();
        }

        this.draw();

        if(!this.isInit) {
            this.isInit = true;
        }
    },

    //d3의 DOM Select 사용 중 First/Last Item Select를 사용하기 위한 커스텀 함수
    setD3CustomFn: function() {

        if(!d3.selection.prototype.selectFirst) {
            d3.selection.prototype.selectFirst = function () {
                return d3.select(this[0][0]);
            };
        }
        if(!d3.selection.prototype.selectLast) {
            d3.selection.prototype.selectLast = function () {
                return d3.select(this[0][this.size() - 1]);
            };
        }

    },

    initChartData: function() {
        var ix, ixLen,
            cWidthSum = 0;

        if(!this.chartData.data.length) {
            this.chartData.data[0] = 'NoData';
            console.warn('No Chart Data for TimeLine');
        }

        for(ix=0, ixLen=this.chartData.columnInfo.length; ix<ixLen; ix++) {
            cWidthSum += this.chartData.columnInfo[ix].cWidth;
        }

        // margin.left는 차트가 시작되는 위치이므로 좌측 테이블의 컬럼 넓이 합계 + 여유 padding 값
        this.setObj.margin.left = cWidthSum + 20;
        this.chartData.cWidthSum = cWidthSum;
    },

    //scale 처리를 위해 그리기 전에 차트 전체 크기 확인
    setChartSize: function() {

        // 차트 전체 Size 지정
        this.setObj.width  = this.background.getWidth() - this.setObj.margin.left - this.setObj.margin.right;
        this.setObj.height = (this.chartData.data.length || 1) * this.setObj.rowHeight;
    },

    // SVG DOM 생성 및 scale 처리
    createChartDOM: function() {
        var txnElapse, data, key;

        txnElapse = this.chartData.elapse;
        data = this.chartData.data;
        key = this.chartData.keyData;

        this.svgChart = d3.select('#' + this.background.id).append('svg');
        this.xScale = d3.scale.linear().domain([txnElapse , 0]).nice(); // nice : Extends the domain (d3 api)
        this.yScale = d3.scale.ordinal().domain(data.map(function(d) { return d[key]; }));
    },

    // 생성된 SVG DOM의 attr에 size 정보 처리
    draw: function() {
        var self = this, key,
            width, height, margin, rowBgColor;

        this.setChartSize();

        width = this.setObj.width;
        height = this.setObj.height;
        margin = this.setObj.margin;
        rowBgColor = this.colorObj.rowBackground;

        key = this.chartData.keyData;

        //resize시 남아있을 수 있는 svg 태그 제거
        this.svgChart.selectAll('g').remove();

        this.svgChart
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('class', 'xm-timeline-chart');

        this.svgChart.select('g.xm-timeline-chart')
            .selectAll('.axisHorizontal line')
            .attr('y2', height);

        //set background
        this.svgChart.select('g.xm-timeline-chart')
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', rowBgColor);

        this.xScale.range([width, 0]);
        this.yScale.rangeRoundBands([0, height]);

        // 순서 중요

        if(this.chartData.columnInfo.length) {
            this.drawYTable(width, height, margin);
        } else {
            this.svgChart.select('g.xm-timeline-chart')
                .append('g')
                .attr('class', 'xm-timeline-tbl-data');

            this.svgChart.select('g.xm-timeline-tbl-data').selectAll('g')
                .data(this.chartData.data)
                .enter()
                .append('g')
                .attr('class', function(d) {
                    return 'timeline-tbl-row-' + self.convertDOMClassName(d[key]) + ' timeline-tbl-rows';
                });
        }

        this.drawAxis(width, height, margin);
        this.drawTimeBar();
        this.setDOMText();

        if (this.isSetExtInfo) {
            this.extProcTimeBar();
        }

        if (this.showDataValue) {
            this.setTimeBarDataValue();
        }
    },

    // Y축 테이블 처리
    drawYTable: function() {

        var self = this,
            columnInfo = this.chartData.columnInfo,
            data = this.chartData.data,
            key = this.chartData.keyData,
            tblHead, tblData, dataRow,
            rowHeight, colLen, alignXPos,
            headBgColor, borderColor, rowBgColor, textColor,
            ix, xPos;

        rowHeight = this.setObj.rowHeight;
        headBgColor = this.colorObj.headBackground;
        rowBgColor = this.colorObj.rowBackground;
        borderColor = this.colorObj.border;
        textColor = this.colorObj.text;

        colLen = columnInfo.length;

        xPos = -this.chartData.cWidthSum;
        for(ix=0; ix<colLen; ix++) {
            if(ix > 0) {
                xPos += columnInfo[ix-1].cWidth;
            }
            columnInfo[ix].cXPos = xPos;
        }

        //Set Agent Data (agent 수 만큼 'g' 생성)
        this.svgChart.select('g.xm-timeline-chart')
            .append('g')
            .attr('class', 'xm-timeline-tbl-head');

        tblHead = this.svgChart.select('g.xm-timeline-tbl-head').selectAll('g')
            .data(columnInfo)
            .enter()
            .append('g');

        // Y축 테이블 헤더 세팅
        tblHead.each(function(d) {
            d3.select(this)
                .append('rect')
                .attr('x',  d.cXPos)
                .attr('y', -rowHeight)
                .attr('width', function(d) { return d.cWidth; })
                .attr('height', rowHeight)
                .style('fill', headBgColor)
                .style('stroke', borderColor)
                .style('stroke-width', '1px');

            // 중앙정렬 = rect의 시작점(x) + 넓이의 중간 + text-anchor middle 세팅
            d3.select(this)
                .append('text')
                .attr('x', d.cXPos + (d.cWidth / 2))
                .attr('y', -(rowHeight / 2))
                .attr('width', function(d) { return d.cWidth; })
                .attr('height', rowHeight)
                .attr('alignment-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .attr('fill', textColor)
                .text(function(d) { return common.Util.TR(d.cName); });
        });


        this.svgChart.select('g.xm-timeline-chart')
            .append('g')
            .attr('class', 'xm-timeline-tbl-data');


        tblData = this.svgChart.select('g.xm-timeline-tbl-data').selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('class', function(d) {return 'timeline-tbl-row-' + self.convertDOMClassName(d[key]) + ' timeline-tbl-rows';});

        // Y축 테이블 row 데이터 입력
        tblData.each(function(d) {
            dataRow = d3.select(this).selectAll('g')
                .data(columnInfo)
                .enter()
                .append('g')
                .attr('class', function(c) { return 'timeline-row-data-' + c.cId; });


            dataRow.each(function(c, i) {
                var dasharray;
                dasharray = (i>0) ? c.cWidth +','+ rowHeight : c.cWidth + ',' + rowHeight + ',' + (+c.cWidth*2);

                d3.select(this)
                    .append('rect')
                    .attr('x', c.cXPos)
                    .attr('y', self.yScale(d[key]))
                    .attr('width', c.cWidth)
                    .attr('height', rowHeight)
                    .style('fill', rowBgColor)
                    .style('stroke', borderColor)
                    .style('stroke-width', '1px')
                    .style('stroke-dasharray', dasharray);

                switch(c.cAlign) {
                    case 'start':
                        alignXPos = c.cXPos + 3;
                        break;
                    case 'middle':
                        alignXPos = c.cXPos + 3 + (c.cWidth / 2);
                        break;
                    case 'end':
                        alignXPos = c.cXPos - 3 + c.cWidth;
                        break;
                    default:
                        alignXPos = c.cXPos;
                        break;
                }

                d3.select(this)
                    .append('text')
                    .attr('x', alignXPos)
                    .attr('y', self.yScale(d[key]) + (rowHeight / 2) - 10) // -10은 font-size
                    .attr('dy', '1em')
                    .attr('text-anchor', c.cAlign)
                    .attr('width', c.cWidth)
                    .attr('height', rowHeight)
                    .attr('fill', textColor)
                    .text(function(c) { return d[c.cId]; });
            });
        });
    },

    drawAxis: function(width, height, margin) {

        var xAxis, yAxis, rowHeight, headBgColor, borderColor, textColor;
        rowHeight = this.setObj.rowHeight;
        headBgColor = this.colorObj.headBackground;
        borderColor = this.colorObj.border;
        textColor = this.colorObj.text;

        //X축 선언
        xAxis = d3.svg.axis()
            .scale(this.xScale)
            .outerTickSize(0)
            .tickFormat('')
            .orient('top');


        //X축을 감싸는 사각형
        this.svgChart.select('g.xm-timeline-chart')
            .append('rect')
            .attr('x', '0')
            .attr('y', -rowHeight)
            .attr('width' , width)
            .attr('height', rowHeight)
            .style('fill', headBgColor)
            .style('stroke', borderColor)
            .style('stroke-width', '1px');

        this.svgChart.select('g.xm-timeline-chart')
            .append('text')
            .attr('x', width / 2)
            .attr('y', -(rowHeight / 2))
            .attr('width' , width)
            .attr('height', rowHeight)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('fill', textColor)
            .text('Executions');

        //X축 추가
        this.svgChart.select('g.xm-timeline-chart')
            .append('g')
            .attr('class', 'x axis')
            .call(xAxis);

        //Y축 선언
        yAxis = d3.svg.axis()
            .scale(this.yScale)
            .outerTickSize(0)
            .tickFormat('') // Y축 값을 보이지 않게 하기 위한 처리
            .orient('left');

        //Y축 추가
        this.svgChart.select('g.xm-timeline-chart')
            .append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(0.5,0)')  //라인이 약간 빗나가서 보정
            .call(yAxis);

        //Tick별 세로 선 추가
        this.svgChart.select('g.xm-timeline-chart')
            .insert('g',':nth-child(2)')
            .attr('class', 'xm-timeline-xaxis-vertical')
            .call(xAxis);

        this.svgChart.select('g.xm-timeline-chart')
            .selectAll('.xm-timeline-xaxis-vertical line')
            .attr('y2', height)
            .style('stroke' , borderColor);

        //xAxis를 콜하여 Tick Text가 표출되므로 해당 DOM 제거
        this.svgChart.selectAll('.xm-timeline-xaxis-vertical text').remove();

        this.svgChart.select('.x.axis')
            .selectAll('text')
            .style('text-anchor', 'end')
            .selectFirst()
            .style('text-anchor', 'start')
            .attr('transform', 'translate(3,0)');

        this.svgChart.select('.x.axis')
            .selectAll('text')
            .selectLast()
            .attr('transform', 'translate(-3,0)');

        this.svgChart.select('g.xm-timeline-chart')
            .insert('g',':nth-child(2)')
            .attr('class', 'xm-timeline-xaxis-horizontal')
            .call(yAxis);

        this.svgChart.select('g.xm-timeline-chart')
            .selectAll('.xm-timeline-xaxis-horizontal line')
            .attr('y1', (rowHeight / 2))
            .attr('y2', (rowHeight / 2))
            .attr('x2', width)
            .style('stroke', borderColor);

    },

    drawTimeBar: function() {

        var self = this,
            ix, ixLen, jx, jxLen,
            useMultiBar, currData,
            timeData, key, lineBarColor, multiBarColor, colorLen,
            timeKey = this.chartData.keyData;

        timeData = this.chartData.data;
        lineBarColor = this.colorObj.lineBar;
        multiBarColor = this.colorObj.multiBar;
        colorLen = multiBarColor.length || 1;
        useMultiBar = false;
        // each parameter중 d는 사용하지 않으나 i를 사용하기 위해 처리

        if(timeData[0] === 'NoData') {
            return;
        }

        d3.selectAll(timeData).each(function(d, i) {

            key = timeData[i][timeKey];
            currData = timeData[i].times;
            useMultiBar = false;

            for(ix=0, ixLen=currData.length-1; ix<ixLen; ix++) {
                for(jx=ix+1, jxLen=currData.length; jx<jxLen; jx++) {

                    if(currData[ix].start < currData[jx].start) {

                        if(currData[ix].start + currData[ix].value >= currData[jx].start) {
                            useMultiBar = true;
                            break;
                        }

                    }
                    else if(currData[ix].start === currData[jx].start) {
                        useMultiBar = true;
                        break;
                    }
                    else {
                        if(currData[jx].start + currData[jx].value >= currData[ix].start) {
                            useMultiBar = true;
                            break;
                        }
                    }
                }

                if(useMultiBar) {
                    break;
                }
            }

            self.svgChart.select('g.timeline-tbl-row-' + self.convertDOMClassName(key)).selectAll('rect.xm-timeline-bar')
                .data(timeData[i].times)
                .enter()
                .append('rect')
                .attr('x', function(d) { return self.xScale(d.start);})
                .attr('y', function() { return self.yScale(key) + 5;})
                .attr('width', function(d) {
                    var barWidth = 0;

                    if(self.xScale(d.value) === 0) {
                        barWidth = 0;
                    }
                    else if (self.xScale(d.value) < 5) {
                        barWidth = 5;
                    }
                    else {
                        barWidth = self.xScale(d.value);
                    }

                    return barWidth;
                })
                .attr('height', function() { return self.yScale.rangeBand() - 10; })
                .attr('class', 'xm-timeline-bar')
                .style('fill', function(d, i) {return useMultiBar ? multiBarColor[i%colorLen] : lineBarColor;})
                .on('click', function(d) { self.onClickTimeBar(d.tid, d.wasId); })
                .on('mouseover', function(d) {
                    d3.select(this).style('opacity', '0.85');
                    if (self.showTooltip) {
                        self.showTooltipDOM(d);
                    }
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', '1');
                    self.hideTooltipDOM();
                });
        });
    },

    setDOMText: function() {

        this.svgChart.selectAll('rect.xm-timeline-bar')
            .append('g')
            .text(function (d) {
                var ix, ixLen, tooltipKey,
                    tooltipStr = '';

                tooltipKey = Object.keys(d.tooltip);
                for(ix=0, ixLen=tooltipKey.length; ix<ixLen; ix++) {

                    if(tooltipKey[ix].length) {
                        tooltipStr += common.Util.TR(tooltipKey[ix]) + ': ' + d.tooltip[tooltipKey[ix]];
                    }
                    else {
                        tooltipStr += d.tooltip[tooltipKey[ix]];
                    }

                    if(ix < ixLen -1) {
                        tooltipStr += '\r\n';
                    }
                }

                return tooltipStr;
            });
    },

    createTooltip: function() {
        this.tooltipWrapper = document.createElement('div');
        this.tooltipWrapper.className = 'xm-timeline-tooltip-wrapper';
        this.tooltipTable = document.createElement('table');
        this.tooltipTable.className = 'xm-timeline-tooltip-table';

        this.tooltipWrapper.style.display = 'none';
        this.tooltipWrapper.appendChild(this.tooltipTable);
        document.body.appendChild(this.tooltipWrapper);
    },

    showTooltipDOM(d) {
        var tooltip = d.tooltip;
        var evt = d3.event;
        var targetWidth, tooltipWidth, transPosX, tooltipPosX;

        this.setTooltipDOM(tooltip);
        this.tooltipWrapper.style.display = 'block';

        targetWidth = this.target.getEl().getWidth();
        tooltipWidth = this.tooltipWrapper.clientWidth;
        transPosX = (targetWidth / 3) * 2;

        if ((evt.pageX > transPosX) || (evt.pageX + 10 + tooltipWidth > targetWidth - 10)) {
            tooltipPosX = evt.pageX - (tooltipWidth + 4);
        } else {
            tooltipPosX = evt.pageX + 10;
        }

        this.tooltipWrapper.style.top = (evt.pageY + 10) + 'px';
        this.tooltipWrapper.style.left = tooltipPosX + 'px';
    },

    setTooltipDOM: function(tooltip) {
        var table = this.tooltipTable;

        var ix, ixLen,
            keys;
        var trDOM, tdKeyDOM, tdValDOM;

        keys = Object.keys(tooltip);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            trDOM = document.createElement('tr');

            if (keys[ix] && keys[ix] !== 'empty-line') {
                tdKeyDOM = document.createElement('td');
                tdKeyDOM.className = 'xm-timeline-td-key';
                tdKeyDOM.textContent = common.Util.TR(keys[ix]);

                tdValDOM = document.createElement('td');
                tdValDOM.textContent = tooltip[keys[ix]];
                tdValDOM.className = 'xm-timeline-td-val';

                trDOM.appendChild(tdKeyDOM);
                trDOM.appendChild(tdValDOM);
            } else {
                tdValDOM = document.createElement('td');
                tdValDOM.className = 'xm-timeline-td-val';
                tdValDOM.setAttribute('colspan', '2');

                if (keys[ix] === 'empty-line') {
                    tdValDOM.classList.add('xm-timeline-tooltip-divisor')
                } else if (tooltip[keys[ix]]) {
                    tdValDOM.textContent = tooltip[keys[ix]];
                }

                trDOM.appendChild(tdValDOM);
            }

            table.appendChild(trDOM);
        }
    },

    hideTooltipDOM() {
        var table = this.tooltipTable;

        while (table.hasChildNodes()) {
            table.removeChild(table.firstChild);
        }

        this.tooltipWrapper.style.display = 'none';
    },

    setTimeBarDataValue: function() {

        // timeData에 textInfo 객체가 필요
        // sample. textInfo : { 'align': 'center', data: [txnName, tooltipElapse] }

        var self = this,
            ix, ixLen,
            timeData, key, tagStart, valueStr, tagEnd,
            timeKey = this.chartData.keyData,
            rowHeight = this.setObj.rowHeight;

        timeData = this.chartData.data;
        tagEnd = '</p>';

        if(timeData[0] == 'NoData') {
            return;
        }

        d3.selectAll(timeData).each(function(d, i) {

            key = timeData[i][timeKey];

            self.svgChart.select('g.timeline-tbl-row-' + self.convertDOMClassName(key)).selectAll('text.xm-timeline-value')
                .data(timeData[i].times)
                .enter()
                .append('foreignObject')
                .attr('x', function(d) { return self.xScale(d.start);})
                .attr('y', self.yScale(key) + (rowHeight /2) - 5)
                .attr('dy', '1em')
                .attr('width', function(d) { return self.xScale(d.value); })
                .attr('height', rowHeight )
                .append('xhtml:div')
                .html(function(d) {

                    valueStr = '';
                    tagStart = '<p style="font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ';
                    tagStart += 'text-align: ' + (d.textInfo.align || 'center') + ';"';
                    tagStart += '>';

                    if(d.textInfo && d.textInfo.data) {

                        for(ix=0, ixLen=d.textInfo.data.length; ix<ixLen; ix++) {
                            valueStr += ix < ixLen - 1 ? d.textInfo.data[ix] + ' ' : d.textInfo.data[ix];
                        }
                    }

                    return tagStart + valueStr + tagEnd;
                });
        });
    },



    extProcTimeBar: function() {
    },

    onClickTimeBar: function() {
    },

    convertDOMClassName: function(string) {
        var result;

        result = (this.id + '_' + string).
        split(':').join('').
        split(' ').join('').
        split('.').join('').
        split('?').join('').
        split(';').join('').
        split('/').join('').
        split(',').join('').
        split('&').join('').
        split('=').join('').
        split('[').join('').
        split(']').join('').
        split('(').join('').
        split(')').join('').
        split('@').join('').
        split('+').join('').
        split('$').join('').
        split('!').join('').
        split('~').join('').
        split('*').join('').
        split('#').join('').
        split('{').join('').
        split('}').join('').
        split('%').join('');

        return result;
    }
});
