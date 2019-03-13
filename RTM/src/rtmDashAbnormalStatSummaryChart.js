Ext.define('rtm.src.rtmDashAbnormalStatSummaryChart', {
    extend        : 'Ext.container.Container',
    layout        : 'fit',
    normalColor   : '#06a9fc',
    warningColor  : '#fbef34',
    criticalColor : '#fc0f17',
    style         : 'overflow: auto',

    constructor: function() {
        this.callParent(arguments);
    },

    init: function() {

    },

    draw: function(target, width, height) {
        if (this.svg) {
            this.svg.remove();
        }

        this.width  = width - 12;
        this.height = height - 12;

        this.svg = d3.select("#" + target).append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        if (this.data) {
            this.setData(this.data);
        }
    },

    setData: function(data) {
        this.data = data;

        var ix, ixLen = Object.keys(data).length,
            circleG, titleG, translateX;

        this.rectWidth = this.width / ixLen;

        var lineData = [[40, 60], [40, 350]];

        var lineGenerator = d3.svg.line();
        var pathString = lineGenerator(lineData);

        for (ix = 0; ix < ixLen; ix++) {

            this.circleIndex = ix;

            translateX = this.rectWidth * this.circleIndex;

            circleG = this.svg.append("g")
                .attr("class", "circle")
                .attr("data-id", data[ix])
                .attr("transform", "translate(" + translateX + ",0)");

            titleG = this.svg.append("g")
                .attr("class", "textG")
                .attr("transform", "translate(" + translateX + ",250)");

            circleG.append('path')
                .attr('d', pathString)
                .attr('style', 'stroke:#f2f2f2;stroke-width:12px;');

            circleG.append('circle')
                .attr('cx', 40)
                .attr('cy', 60)
                .attr('r', 6)
                .attr('fill', '#cccccc');

            circleG.append('circle')
                .attr('cx', 40)
                .attr('cy', 350)
                .attr('r', 6)
                .attr('fill', '#cccccc');

            circleG.append('rect')
                .attr('width', 55)
                .attr('height', 20)
                .attr('x', 13)
                .attr('y', 120)
                .attr('rx', 10)
                .attr('style', 'fill:#1c8ffc')

            titleG.append('rect')
                .attr('width', 80)
                .attr('height', 30)
                .attr('x', 0)
                .attr('y', 120)
                .attr('rx', 15)
                .attr('style', 'fill:#ffffff;stroke-width:1px;stroke:#cccccc;')

            titleG.append('text')
                .attr('x', 15)
                .attr('y', 140)
                .attr('fill', '#black')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('pointer-events', 'none')
                .html('지표명#1');


        }
    }

});