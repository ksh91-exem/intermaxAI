Ext.define('Exem.TimeBrush', {
    extend: "Ext.Component",
    interval: 60000,

    draw: function(fromTime, toTime, data) {
        var self = this;

        this.fromTime = new Date(fromTime);
        this.toTime = new Date(toTime);

        var parent = this.target,
            parentEl = parent.getEl(),
            width = parent.getWidth(),
            height = parent.getHeight();

//        console.log(width, height);
        d3.select("#" + parent.id).select('svg').remove();

        var svg = d3.select("#" + parent.id).append('svg')
            .attr('class', 'overray-svg')
            .attr('width', '100%').attr('height', '100%')
//            .attr('width', width).attr('height', height)
            .style('position', 'absolute')
            .style('left', 0).style('top', 0);

        svg.append('defs').append('clipPath')
            .attr('class', 'clip')
            .append('rect')
//            .attr('width', '100%').attr('height', '100%')
            .attr('width', width).attr('height', height);


        var x = d3.time.scale().domain([this.fromTime, this.toTime]).range([this.marginLeft, width-this.marginRight]),
            x2 = d3.time.scale().domain([this.fromTime, this.toTime]).range([this.marginLeft, width-this.marginRight]),
//            xAxis = d3.svg.axis().scale(x).orient("bottom"),
            y = d3.scale.linear().domain(d3.extent(_.map(data, function(d) { return d[1]; }))).range([height-2, 0]),
            brush = d3.svg.brush().x(x2),
            context = svg.append('g').attr('class', 'context'),
            gBrush = context.append('g').attr('class', 'x-brush').call(brush),
            isInExtent, p0, extent;

        var lineGenerator = d3.svg.line()
            .x(function(d) { return x(new Date(d[0])); })
            .y(function(d) { return y(d[1]); })
            .tension(0.1).interpolate('linear');

        svg.append('path')
            .attr('stroke', 'black').attr('fill', 'none').attr('stroke-width', 1)
            .attr('d', lineGenerator(data));


        this.brush = brush;
        brush.on('brushstart', brushStart);
        brush.on('brush', brushed);
        brush.on('brushend', brushEnd);
//        context.append('g').attr('class', 'x-axis').call(xAxis);

        var extentRect = gBrush.select('.extent');
        gBrush.selectAll('rect').attr('height', height);
        gBrush.selectAll('.resize').attr('fill', 'none').attr('stroke', 'black')
            .append('path').attr('d', resizePath);

        this.xBrush = context.select('.x-brush');
        this.xBrush.call(brush.extent([this.fromTime, this.toTime]))
            .selectAll('.resize').style('display', null);
//        self.lastExtent = [this.fromTime, this.toTime];
//        extentRect.attr('x', x2.range()[0]).attr('width', x2.range()[1]-x2.range()[0]);


        var viewAllBtn = svg.append('image')
            .attr('xlink:href', '../images/viewall.png')
            .attr('x', width-this.marginRight+15)
            .attr('y', height/2-9)
            .attr('width', 72)
            .attr('height', 18)
            .style('opacity', 0.5)
            .on('mouseover', function() {
                viewAllBtn.style('opacity', 1);
            })
            .on('mouseout', function() {
                viewAllBtn.style('opacity', 0.5);
            })
            .on('mousedown', function() {
                self.xBrush.call(self.brush.extent([self.fromTime, self.toTime]));
                brushEnd();
            });


        function brushStart() {
//            p0 = d3.mouse(this);

//            console.log('pointer time :', x2.invert(p0[0]));
//            console.log('last extent time :', self.lastExtent);

//            if ( p0[0] < x2(self.lastExtent[0])-5 || p0[0] > x2(self.lastExtent[1])+5 ) {
//                isInExtent = false;
//                brush.extent(self.lastExtent);
//                extentRect.attr('x', x2(self.lastExtent[0])).attr('width', x2(self.lastExtent[1]) - x2(self.lastExtent[0]));
//            }
//            else
//                isInExtent = true;

//            console.log('is in extent? ', isInExtent);
        }

        function brushed() {
//            if (!isInExtent) {
//                brush.extent(self.lastExtent);
//                extentRect.attr('x', x2(self.lastExtent[0])).attr('width', x2(self.lastExtent[1]) - x2(self.lastExtent[0]));
//            }
        }

        function brushEnd() {
//            if (isInExtent) {
//                self.lastExtent = brush.extent();
//                console.log('extent time :', brush.extent());
//                console.log('extent x :', x2(self.lastExtent[0]), ' ~ ', x2(self.lastExtent[1]));

            x.domain(brush.empty() ? x2.domain() : brush.extent());
            extent = (brush.empty() ? x2.domain() : brush.extent());

            if (Math.floor(Number(extent[0]) / self.interval) + 1 > Number(extent[1])) {
                self.xBrush.call(self.brush.extent(self.lastExtent));
                return;
            }
            self.lastExtent = extent;
            parent.fireEvent('changetimerange', Number(extent[0]), Number(extent[1]));

            if (brush.empty()) {
                self.xBrush.call(brush.extent([self.fromTime, self.toTime]));
            }
//            }
//            else if (p0[0] == d3.mouse(this)[0]) {
//                self.lastExtent = [this.fromTime, this.toTime];
//                brush.extent([self.fromTime, self.toTime]);
//                extentRect.attr('x',x2.range()[0]).attr('width', x2.range()[1]-x2.range()[0]);
//
//            }
        }

        function resizePath(d) {
            var e = +(d == "e"),
                x = e ? 1 : -1,
                y = height / 3;
            return "M" + (.5 * x) + "," + y
                + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                + "V" + (2 * y - 6)
                + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                + "Z"
                + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8)
                + "M" + (4.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8);
        }
    },

    setTimeRange: function(fromTime, toTime) {
        this.xBrush.call(this.brush.extent([fromTime, toTime]));
    }
});