Ext.define('rtm.src.rtmIntegrationTrackingChart', {
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
        this.pie             = d3.layout.pie().sort(null);
        this.minRectWidth    = 200;
        this.title           = ['단말', '채널', '업무', '대외', '대외기관'];
        this.backgroundColor = ['#2b2e34', '#4b5358'];
        this.dataColor       = [this.normalColor, this.warningColor, this.criticalColor];
    },

    setRect: function(svg) {

        var self = this;

        var rectWidth       = this.rectWidth,
            rectWidthLast   = this.rectWidthLast,
            circleWidth     = this.circleWidth,
            circleHeight    = this.circleHeight,
            pie             = this.pie,
            radius          = this.radius,
            diameter        = this.diameter,
            backgroundColor = this.backgroundColor;

        var rectG = svg.append("g")
            .attr("class", "rect")
            .attr("transform", "translate(" + circleWidth / 2 + "," + circleHeight / 2 + ")");

        rectG.selectAll("path")
            .data(pie([1]))
            .enter().append("path")
            .attr("fill", backgroundColor[1])
            .attr("d", d3.svg.arc().innerRadius(radius - 24).outerRadius(radius - 22));

        var rect = rectG.append("rect")
            .attr("x", -radius + 10).attr("y", -15)
            .attr("width", function(){
                if( self.circleIndex == self.bizLastIndex ) {
                    return rectWidthLast;
                } else {
                    return rectWidth;
                }
            })
            .attr("height", 35)
            .attr("fill", "transparent");

        if( this.circleIndex != this.bizLastIndex ) {

            var translateX, translateY;
            translateX = radius + (rectWidth - diameter) / 2 - 12;
            translateY = -5;

            var rectArrowG = rectG.append("g")
                .attr("class", "rect-arrow");

            var ix, ixLen = 3, arrowG;

            for ( ix = 0 ; ix < ixLen; ix++) {
                arrowG = rectArrowG.append("g")
                    .attr("class", "arrow");

                if( ix > 0 ){
                    translateX = translateX + 10;
                }

                arrowG.append("rect").attr("width", 5 ).attr("height", 5).attr("transform", "translate(" + translateX       + ", " + translateY       + ") rotate(45)");
                arrowG.append("rect").attr("width", 10).attr("height", 5).attr("transform", "translate(" + (translateX + 7) + ", " + (translateY + 7) + ") rotate(135)");
            }
        }
    },

    setPolyLine: function(svg) {
        var circleWidth  = this.circleWidth,
            circleHeight = this.circleHeight,
            radius       = this.radius;

        var polyLineG = svg.append("g")
            .attr("class", "polyline")
            .attr("transform", "translate(" + circleWidth / 2 + "," + circleHeight / 2 + ")");

        var startX, startY,
            middleX, middleY,
            endX, endY;

        polyLineG.append("polyline")
            .attr("points", function(){
                startX = radius / 2 + 32 - 16 - 5 - 10 ;
                startY = startX + 20;
                middleX = startX + 10;
                middleY = startY + 15;
                endX = middleX + 60;
                endY = middleY;

                return startX + "," + startY + " " + middleX + "," + middleY + " " + endX + "," + endY;
            })
            .attr("style", "fill:none;stroke:#2b2e34;stroke-width:1.5px");

        polyLineG.append("text")
            .attr("x", middleX + 2)
            .attr("y", middleY - 5)
            .attr("fill", "#9de0ff")
            .attr("font-size", "12px")
            .style("font-family", "Gulim", "important")
            .text("1.25");

        polyLineG.append("text")
            .attr("x", middleX + 35)
            .attr("y", middleY - 5)
            .attr("fill", "#ABAEB5")
            .attr("font-size", "12px")
            .style("font-family", "Gulim", "important")
            .text("sec")
    },

    setAlarm: function(target, type){

        target.select(".alarm").remove();

        if( type == "normal" ) return;

        var circleWidth  = this.circleWidth,
            circleHeight = this.circleHeight,
            pie          = this.pie,
            radius       = this.radius;

        var colorObj = {
            warning  : this.warningColor,
            w        : this.warningColor,
            critical : this.criticalColor,
            c        : this.criticalColor
        }

        var alarmG = target.insert("g", ":first-child")
            .attr("class", "alarm")
            .attr("transform", "translate(" + circleWidth / 2 + "," + circleHeight / 2 + ")");

        alarmG.selectAll("path")
            .data(pie([1]))
            .enter().append("path")
            .attr("fill", colorObj[type])
            .attr("filter", "url(#f1)")
            .attr("d", d3.svg.arc().innerRadius(radius - 10).outerRadius(radius - 7));
    },

    setBackground: function(circleG) {
        this.circleWidth  = this.rectWidth * 0.85;
        this.circleHeight = this.height;
        this.radius       = Math.min(this.circleWidth, this.circleHeight) / 2;
        this.diameter     = this.radius * 2;

        this.rectWidthLast = this.diameter - 20;

        var circleWidth  = this.circleWidth,
            circleHeight = this.circleHeight,
            circleIndex  = this.circleIndex,
            radius       = this.radius,
            circleIndex  = this.circleIndex,
            title        = this.title,
            color = ['#1b1c21', '#4b5358', '#2b2e34', '#020302', '#2b2e34'];

        var backgroundG = circleG.append("g")
            .attr("class", "background")
            .attr("transform", "translate(" + circleWidth / 2 + "," + circleHeight / 2 + ")");

        var partition = d3.layout.partition()
            .sort(null)
            .size([2 * Math.PI, radius * radius])
            .value(function(d) { return 1; });

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y) - 10; })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy) - 10; });

        var arc2 = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(radius - 37).outerRadius(radius - 32)

        var root = {
            name: "background_root",
            size: 1,
            children : [{
                name: "background_1",
                size: 1,
                children : [{
                    name: "background_2",
                    size: 1,
                    children: [{
                        name: "background_3",
                        size: 1,
                        children: [{
                            name: "background_4",
                            size: 1
                        }]
                    }]
                }]
            }]
        }

        var path = backgroundG.datum(root).selectAll("path")
            .data(partition.nodes)
            .enter().append("path")
            .attr("d", function(d,i) {
                if( i == 3 ) {
                    return arc2(d);
                } else {
                    return arc(d);
                }
            })
            .style("fill", function(d,i) {
                if( i == 1 ) {
                    return 'url(#circles-1) ' + color[i];
                } else {
                    return color[i];
                }
            })
            .each(stash);

        backgroundG.append("text")
            .attr("y", -15)
            .attr("fill", "gray")
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .text("TOTAL_TPS");

        var total_tps = backgroundG.append("text")
            .attr("y", 15)
            .attr("class", "total_tps")
            .attr("fill", "#9de0ff")
            .attr("font-size", "30px")
            .attr("letter-spacing", "-3px")
            .attr("text-anchor", "middle")
            .style("font-family", "Gulim", "important");

        var random    = Math.floor(Math.random()*(99-1+1)) + 1 ;
        var random2   = Math.floor(Math.random()*(99-1+1)) + 1 ;
        var randomVal = random + "." + random2;

        total_tps.text(randomVal);

        backgroundG.append("text")
            .attr("y", 35)
            .attr("fill", "#06a9fc")
            .attr("font-size", "15px")
            .attr("text-anchor", "middle")
            .attr("style", "font-weight:bold")
            .text(title[circleIndex]);

        function stash(d) {
            d.x0 = d.x;
            d.dx0 = d.dx;
        }

        circleG.append("g")
            .attr("class", "data")
            .attr("transform", "translate(" + circleWidth / 2 + "," + circleHeight / 2 + ")");

        this.setRect(circleG);

        this.setPolyLine(circleG);
    },

    setData: function() {

        var self = this;

        var pie       = this.pie,
            dataColor = this.dataColor,
            radius    = this.radius,
            type;

        var data = {
            "단말" : {
                total_tps : Math.floor(Math.random()*(99-1+1)) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                polyline  : Math.floor(Math.random()*(99-1+1)) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                value     : [Math.floor(Math.random()*10), Math.floor(Math.random()*2), Math.floor(Math.random()*2)]
            },
            "채널" : {
                total_tps : Math.floor(Math.random()*(99-1+1)) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                polyline  : Math.floor(Math.random()*(99-1+1)) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                value     : [Math.floor(Math.random()*10), Math.floor(Math.random()*2), Math.floor(Math.random()*2)]
            },
            "업무" : {
                total_tps : Math.floor(Math.random()*(99-1+1)) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                polyline  : Math.floor(Math.random()*(99-1+1)) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                value     : [Math.floor(Math.random()*10), Math.floor(Math.random()*2), Math.floor(Math.random()*2)]
            },
            "대외" : {
                total_tps : Math.floor(Math.random()*99) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                polyline  : Math.floor(Math.random()*99) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                value     : [Math.floor(Math.random()*10), Math.floor(Math.random()*2), Math.floor(Math.random()*2)]
            },
            "대외기관" : {
                total_tps : Math.floor(Math.random()*99) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                polyline  : Math.floor(Math.random()*99) + 1 + "." + Math.floor(Math.random()*(99-1+1)),
                value     : [Math.floor(Math.random()*10), Math.floor(Math.random()*2), Math.floor(Math.random()*2)]
            }
        }

        this.svg.selectAll(".circle").each(function() {
            var key  = d3.select(this).attr("data-id");

            var path = d3.select(this).select(".data").selectAll("path")
                .data(pie(data[key].value));

            path.enter().append("path")
                .attr("fill", function(d, i) { return dataColor[i]; })
                .on("mouseover", function() {
                    self.circleTooltip.find('.wasname').text(key);

                    self.circleTooltip.css({
                        top     : $(this).offset().top,
                        left    : $(this).offset().left,
                        display : 'block'
                    });

                    self.circleTooltip.find(".normal").text(data[key].value[0]);
                    self.circleTooltip.find(".warning").text(data[key].value[1]);
                    self.circleTooltip.find(".critical").text(data[key].value[2]);
                })
                .on("mouseleave", function() {
                    self.circleTooltip.css({ display : 'none' });
                });

            path.exit().remove();

            path.attr("d", function(d) {
                if( d.startAngle || d.endAngle ) {
                    return d3.svg.arc().innerRadius(radius - 32).outerRadius(radius - 26)(d);
                }
            })

            if( data[key].value[2] > 0 ) {
                type = "critical";
            } else if ( data[key].value[1] > 0 ) {
                type = "warning";
            } else {
                type = "normal";
            }

            self.setAlarm(d3.select(this), type);

            d3.select(this).select(".total_tps").text(data[key].total_tps);
            d3.select(this).select(".polyline").select("text").text(data[key].polyline);
        })

        this.animation(data);
    },

    animation: function(data){

        if(this._animationInterval) {
            clearInterval(this._animationInterval);
        }

        var animationIndex = 1,
            key, type;

        this._animationInterval = setInterval(function(){

            this.svg.selectAll(".circle").each(function(){
                // 다 끄고
                key = d3.select(this).attr("data-id");

                if( data[key].value[2] > 0 ) {
                    type = "critical";
                } else if ( data[key].value[1] > 0 ) {
                    type = "warning";
                } else if ( data[key].value[0] > 0 ) {
                    type = "normal";
                } else {
                    type = "";
                }

                d3.select(this).selectAll(".rect-arrow .arrow").attr("class", "arrow");

                d3.select(this).select(".rect-arrow").selectAll(".arrow").each(function(){

                    //하나 키고
                    var current = d3.select(this.parentNode).select(".arrow:nth-child(" + animationIndex + ")");
                    current.attr("class", "arrow " + type);

                })
            })

            animationIndex++;

            if(animationIndex > 3){
                animationIndex = 0;
            }

        }.bind(this), 300)
    },

    draw: function(target, width, height) {
        if ( this.svg ) {
            this.svg.remove();
        }

        this.bizLength = this.title.length;
        this.bizLastIndex = this.bizLength - 1;

        var minWidth = this.bizLength * this.minRectWidth,
            minHeight = 160;

        this.width  = ( width  - 12 < minWidth ) ? minWidth : width - 12;
        this.height = ( height - 12 < minHeight ) ? minHeight : height - 12;

        this.rectWidth = this.width / this.bizLength;

        var translateX, translateY;

        this.svg = d3.select("#" + target).append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.setDefs();

        this.createTooltip();

        var ix, ixLen = this.bizLength, circleG;

        for ( ix = 0; ix < ixLen; ix++) {

            this.circleIndex = ix;

            translateX = this.rectWidth * this.circleIndex;
            translateY = 0;

            circleG = this.svg.append("g")
                .attr("class", "circle")
                .attr("data-id", this.title[ix])
                .attr("transform", "translate(" + translateX + "," + translateY + ")");

            this.setBackground(circleG);
        }

        this.setData();

    },

    setDefs: function() {
        var defs = this.svg.append("defs");

        this.setPattern(defs);

        this.setFilter(defs);
    },

    setPattern: function(defs) {
        var patternWidth = 10,
            patternHeight = 10,
            imageWidth = 1.5,
            imageHeight = 1.5;

        var pattern = defs.append("pattern")
            .attr("id", "circles-1")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width" , patternWidth)
            .attr("height", patternHeight);

        var image = pattern.append("image")
            .attr("xlink:href", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc2JyBoZWlnaHQ9JzQ5Jz4KICA8cmVjdCB3aWR0aD0nMycgaGVpZ2h0PSc1MCcgZmlsbD0nI2ZmZicvPgogIDxyZWN0IHg9JzMnIHdpZHRoPScxJyBoZWlnaHQ9JzUwJyBmaWxsPScjY2NjJy8+Cjwvc3ZnPgo=")
            .attr("width" , imageWidth)
            .attr("height", imageHeight);
    },

    setFilter: function(defs) {
        var filterX = "-10%",
            filterY = "-50%",
            stdDeviation = 5;

        var filter = defs.append("filter")
            .attr("id", "f1")
            .attr("x", filterX)
            .attr("y", filterY)
            .attr("filterUnits", "userSpaceOnUse")

        filter.append("feGaussianBlur")
            .attr("result", "blurOut")
            .attr("in", "offOut")
            .attr("stdDeviation", stdDeviation)

        filter.append("feBlend")
            .attr("in", "SourceGraphic")
            .attr("in2", "blurOut")
            .attr("mode", "normal")
    },

    /**
     * Create Bar Chart Tooltip
     */
    createTooltip: function() {

        var me = this;
        var updateStr;

        this.circleTooltip = $('<div class="circle-chart-tooltip tooltipPanel"></div>').css({
            'position': 'absolute',
            'display' : 'none',
            'z-index' : 20000,
            'color'   : '#000',
            'background-color': '#fff',
            'padding' : '0px 0px 0px 0px',
            'border'  : '1px solid #D8D8D8',
            'border-radius': '4px',
            'min-width':'120px'
        });

        updateStr =
            '<span style ="display: block;" class="toolTip">'+
            '<div style="padding: 10px; height: 10px;">'+
            '  <span class="wasname" style= "float:left ; color: #000000;font-size: 14px;"></span>';


        updateStr +=
            '</div>'+
            '<div style="height: 1px; background: #aaaaaa; margin: 5px 10px 5px 10px;"></div>'+
            '<div style ="display: block;height: 65px; margin: 0px 5px 0px 0px;" ;>';

        // Normal
        updateStr +=
            '<div style="float: left;width: 60%;margin-left: 9px;">' +
            '<div style="color:#42A5F6;margin-bottom: 4px;font-size: 14px;">'+common.Util.TR('Normal')+'</div>'+
            '</div>'+
            '<div style="margin-left: 4px;">' +
            '<div class="normal" style="margin-bottom: 4px;font-size: 14px;"></div>'+
            '</div>';

        // Warning
        updateStr +=
            '<div style="float: left;width: 60%;margin-left: 9px;">' +
            '<div style="color:#FF9803;margin-bottom: 4px;font-size: 14px;">'+common.Util.TR('Warning')+'</div>'+
            '</div>'+
            '<div style="margin-left: 4px;">' +
            '<div class="warning" style="margin-bottom: 4px;font-size: 14px;"></div>'+
            '</div>';

        // Critical
        updateStr +=
            '<div style="float: left;width: 60%;margin-left: 9px;">' +
            '<div style="color:#D7000F;margin-bottom: 4px;font-size: 14px;">'+common.Util.TR('Critical')+'</div>'+
            '</div>'+
            '<div style="margin-left: 4px;">' +
            '<div class="critical" style="margin-bottom: 4px;font-size: 14px;"></div>'+
            '</div>';

        updateStr +=  '</div></span>';

        this.circleTooltip.append(updateStr);
        $('body').append(this.circleTooltip);

        this.circleTooltip.bind('mouseenter', function(e) {
            e.preventDefault();
            me.circleTooltip.css({'display': 'block'});
        });

        this.circleTooltip.bind('mouseleave', function(e) {
            e.preventDefault();
            me.circleTooltip.css({'display': 'none'});
        });
    },
});