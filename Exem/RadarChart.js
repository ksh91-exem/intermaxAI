Ext.define('Exem.RadarChart', {
    extend: 'Exem.Container',
    width : '100%',
    height : '100%',
    flex : 1,
    listeners : {
        resize : function() {
            if (this.isInit) {
                this.draw();
            }
        }.bind(this)
    },
    style : 'background : #FFFFFF',

    margin: {
        top : 10,
        bottom: 10
    },

    init: function() {
        this.initProperty();

        this.draw();
        this.isInit = true;
    },

    initProperty: function() {
        this.isInit = false;
        this.d = [];
    },

    getData: function() {
      return this.d;
    },

    setData: function(d) {
      this.d = [d];
    },

    draw: function() {
        var id = '#' + this.id;
        var data = this.getData();

        var cfg = {
            w: this.getWidth(),		//Width of the circle
            h: this.getHeight(),	//Height of the circle
            levels: 5,				//How many levels or inner circles should there be drawn
            maxValue: 0.5, 			//What is the value that the biggest circle will represent
            labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
            opacityArea: 0.35, 	//The opacity of the area of the blob
            dotRadius: 4, 			//The size of the colored circles of each blog
            opacityCircles: 0.1, 	//The opacity of the circles of each blob
            strokeWidth: 2, 		//The width of the stroke around each blob
            roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
            color: d3.scale.category10()	//Color function
        };

        var maxValue = 0;
        var allAxis = [];

        if (data.length > 0) {
            maxValue = Math.max(cfg.maxValue, d3.max(data, function(i) { return d3.max(i.map(function(o) { return o.value; })) }));
            allAxis = data[0].map(function(i) { return i.axis });	//Names of each axis
        }

        var total = allAxis.length,					//The number of different axes
            radius = Math.min(cfg.w/2, cfg.h/2) - 40, 	//Radius of the outermost circle
            angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

        //Scale for the radius
        var rScale = d3.scale.linear()
            .range([0, radius])
            .domain([0, maxValue]);

        /////////////////////////////////////////////////////////
        //////////// Create the container SVG and g /////////////
        /////////////////////////////////////////////////////////

        //Remove whatever chart with the same id/class was present before
        d3.select(id).select("svg").remove();

        //Initiate the radar chart SVG
        var svg = d3.select(id).append("svg")
            .attr("width",  cfg.w)
            .attr("height", cfg.h)
            .attr("class", "radar");
        //Append a g element
        var g = svg.append("g")
            .attr("transform", "translate(" + (cfg.w/2) + "," + (cfg.h/2) + ")");

        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////

        //Wrapper for the grid & axes
        var axisGrid = g.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
            .data(d3.range(1,(cfg.levels+1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d, i){return radius/cfg.levels*d;})
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
            .data(d3.range(1,(cfg.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function(d){return -d*radius/cfg.levels;})
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
            .text(function(d,i) { return maxValue * d/cfg.levels; });

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
            .text(function(d){return d})
            // .call(wrap, cfg.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        //The radial line function
        var radarLine = d3.svg.line.radial()
            .interpolate("linear-closed")
            .radius(function(d) { return rScale(d.value); })
            .angle(function(d,i) {	return i*angleSlice; });

        if(cfg.roundStrokes) {
            radarLine.interpolate("cardinal-closed");
        }

        //Create a wrapper for the blobs
        var blobWrapper = g.selectAll(".radarWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarWrapper");

        //Append the backgrounds
        blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", function(d,i) { return radarLine(d); })
            .style("fill", function(d,i) { return cfg.color(i); })
            .style("fill-opacity", cfg.opacityArea)
            .on('mouseover', function (d,i){
                //Dim all blobs
                d3.selectAll(id + ' .radarArea')
                    .transition().duration(200)
                    .style("fill-opacity", 0.1);
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.7);
            })
            .on('mouseout', function(){
                //Bring back all blobs
                d3.selectAll(id + ' .radarArea')
                    .transition().duration(200)
                    .style("fill-opacity", cfg.opacityArea);
            });

        //Create the outlines
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function(d,i) { return radarLine(d); })
            .style("stroke-width", cfg.strokeWidth + "px")
            .style("stroke", function(d,i) { return cfg.color(i); })
            .style("fill", "none")

        //Append the circles
        blobWrapper.selectAll(".radarCircle")
            .data(function(d,i) { return d; })
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
            .style("fill", function(d,i,j) { return cfg.color(j); })
            .style("fill-opacity", 0.8);

        /////////////////////////////////////////////////////////
        //////// Append invisible circles for tooltip ///////////
        /////////////////////////////////////////////////////////

        //Wrapper for the invisible circles on top
        var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(function(d,i) { return d; })
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius*1.5)
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function(d) {
                tooltip
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY) + "px")
                    .style('opacity', 1);

                tooltipTitle.html(d.title);
                tooltipName.html(d.axis);
                tooltipName.append('span')
                           .attr('style', 'position:absolute;top:4px;left:0px;background:' + '#1f77b4' +';display: inline-block;width: 7px;height: 9px;');

                tooltipName.append('span')
                    .attr('style', 'float:right;margin-left:8px;')
                    .html(' : ');

                tooltipValue.html(d.value);
            })
            .on("mouseout", function(){
                tooltip.style("opacity", 0)
            });

        //Set up the small tooltip for when you hover over a circle

        var tooltip = d3.select("body").append("div")
            .attr("class", "XMCanvas-multil-tooltip")
            .attr('style', 'position: absolute;z-index: 100000;color: rgb(0, 0, 0);padding: 10px;border-radius: 4px;border: 1px solid rgb(216, 216, 216);background: rgb(255, 255, 255);overflow-y:auto;max-height:500px;')
            .style("opacity", 0);

        var tooltipTitle = tooltip.append('div')
                           .attr('class', 'XMCanvas-multil-tooltip-time')
                           .attr('style', 'font-size: 14px;margin-bottom: 6px;padding-bottom: 2px;border-bottom: 1px solid #D2D2D2;');

        var tooltipNameCon = tooltip.append('div')
                          .attr('class', 'XMCanvas-multil-tooltip-name')
                          .attr('style', 'float:left');

        var tooltipName = tooltipNameCon.append('div')
            .attr('style', 'position:relative;text-indent:12px;font-size:12px;height:14px;margin-bottom:4px;');

        var tooltipValue = tooltip.append('div')
                           .attr('class', 'XMCanvas-multil-tooltip-value')
                           .attr('style', 'float:right;margin-left:4px;text-align:right;line-height:14px;');

    }
});
