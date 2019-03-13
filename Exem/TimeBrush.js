Ext.define('Exem.TimeBrush', {
    extend: "Ext.Component",
    jumpVisible: false,
    interval: 60000,

    draw: function(fromTime, toTime, data) {
        var self = this;

        this.fromTime = new Date(fromTime);
        this.toTime = new Date(toTime);

        var parent = this.target,
            width = parent.getWidth(),
            height = parent.getHeight();


        d3.select("#" + parent.id).select('svg').remove();
        d3.select("#" + parent.id).select('img').remove();

        var svg = d3.select("#" + parent.id).append('svg')
            .attr('class', 'overray-svg')
            .attr('width', '100%').attr('height', '100%')
            .style('position', 'absolute')
            .style('left', 0).style('top', 0);

        svg.append('defs').append('clipPath')
            .attr('class', 'clip')
            .append('rect')
            .attr('width', width).attr('height', height);


        var x = d3.time.scale().domain([this.fromTime, this.toTime]).range([this.marginLeft, width-this.marginRight]),
            x2 = d3.time.scale().domain([this.fromTime, this.toTime]).range([this.marginLeft, width-this.marginRight]),
//            xAxis = d3.svg.axis().scale(x).orient("bottom"),
            y = d3.scale.linear().domain(d3.extent(_.map(data, function(d) { return d[1] == null ? 0 : d[1]; }))).range([height-2, 0]),
            brush = d3.svg.brush().x(x2),
            context = svg.append('g').attr('class', 'context'),
            gBrush = context.append('g').attr('class', 'x-brush').call(brush),
            extent;

        //var lineGenerator = d3.svg.line()
        //    .x(function(d) { return x(new Date(d[0])); })
        //    .y(function(d) { return y(d[1] == null ? 0 : d[1]); })
        //    .tension(0.1).interpolate('linear');

        var lineGenerator = d3.svg.line()
            .defined(function(d) { if(d[1] != null) { return d[1] == 0 ? 1 : d[1]; } })
            .x(function(d) { return x(new Date(d[0])); })
            .y(function(d) { return y(d[1]); });

        svg.append('path')
            .attr('stroke', 'black').attr('fill', 'none').attr('stroke-width', 1)
            .attr('d', lineGenerator(data));


        this.brush = brush;
        brush.on('brushstart', brushStart);
        brush.on('brush', brushed);
        brush.on('brushend', brushEnd);

        gBrush.selectAll('rect').attr('height', height);
        gBrush.selectAll('.resize').attr('fill', 'none').attr('stroke', 'black')
            .append('path').attr('d', resizePath);

        this.xBrush = context.select('.x-brush');
        this.xBrush.call(brush.extent([this.fromTime, this.toTime]))
            .selectAll('.resize').style('display', null);


        var viewAllBtn = svg.append('image')
            .attr('xlink:href', '../images/viewall.png')
            .attr('x', width-this.marginRight+15)
            .attr('y', height/2-9)
            .attr('width', 72)
            .attr('height', 18)
            .style('opacity', 0.5)
            .style('cursor', 'pointer')
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


        if (this.jumpVisible) {
            var baseForm = parent.up('baseform'),
                jumpWin = Ext.create('Exem.Window',{
                    width: 110,
                    height: 87,
                    header: false,
                    resizable: false,
                    bodyStyle: {
                        background: 'white'
                    },
                    renderTo: baseForm.id
                }),
                jumpIcon = document.createElement('img');

            var jumpWinEl = document.getElementById(jumpWin.id+'-body');
            _.each(['TOP SQLs', 'TOP Session', 'Stat/Event/Ratio'], function(d, i) {
                var div = document.createElement('div');
                div.style.position = 'absolute';
                div.style.top = (i*26)+'px';
                div.style.width = '110px';
                div.style.height = '26px';
                div.style.cursor = 'pointer';
                div.style.padding = '4px 10px';
                div.innerHTML = d;
                div.addEventListener('mouseover', function() {
                    div.style['background-color'] = 'lightblue';
                    div.addEventListener('mouseout', function() {
                        div.style['background-color'] = 'white';
                    });
                });
                div.addEventListener('click', function() {
                    baseForm.fireEvent('jumpto', d, brush.extent());
                    jumpWin.hide();
                });
                jumpWinEl.appendChild(div);
            });

            jumpIcon.src = '../images/nJump_off.png';
            jumpIcon.id = parent.id+'-jump';
            jumpIcon.style.position = 'absolute';
            jumpIcon.style.top = '1px';
            jumpIcon.style.left = (width-this.marginRight+95)+'px';
            jumpIcon.style.cursor = 'pointer';
            jumpIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                if (jumpWin.isHidden())
                    jumpWin.showBy(Ext.get(jumpIcon.id));
                else
                    jumpWin.hide();
            });
            document.getElementById(baseForm.id).addEventListener('click', function() {
                jumpWin.hide();
            });

            jumpIcon.addEventListener('mouseover', function() {
                //            jumpIcon.style['background-color'] = 'lightblue';
                jumpIcon.addEventListener('mouseout', function() {
                    //                jumpIcon.style['background-color'] = 'white';
                });
            });
            document.getElementById(parent.id).appendChild(jumpIcon);
        }

        function brushStart() {
        }

        function brushed() {
        }

        function brushEnd() {

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
    },

    clearData: function(){
        var parent = this.target,
            svg = d3.select("#" + parent.id).select('svg'),
            path;

        path = svg.selectAll("path").data([]);
        path.exit().remove();
    }
});
