Ext.define('rtm.src.rtmDashboardAlarmChart', {
    extend        : 'Ext.container.Container',
    layout        : 'fit',
    style         : 'overflow: auto',

    constructor: function() {
        this.callParent(arguments);
    },

    init: function() {
        this.pie             = d3.layout.pie().sort(null);
    },

    setBackground: function(circleG) {
        var circleWidth  = this.circleWidth,
            circleHeight = this.circleHeight,
            radius       = this.radius;

        var translateX = circleWidth / 2.8;
        
        var backgroundG = circleG.append("g")
            .attr("class", "background")
            .attr("transform", "translate(" + translateX + "," + circleHeight / 2 + ")");

        var partition = d3.layout.partition()
            .sort(null)
            .size([2 * Math.PI, radius * radius])
            .value(function(d) { return 1; });

        var arc = d3.svg.arc()
            .startAngle(-Math.PI*0.5)
            .endAngle(Math.PI*0.5)
            .innerRadius(0)
            .outerRadius(function(d) { return Math.sqrt(d.dy) - 30; });

        var arc2 = d3.svg.arc()
            .startAngle(Math.PI*0.5)
            .endAngle(Math.PI*1.5)
            .innerRadius(0)
            .outerRadius(function(d) { return Math.sqrt(d.dy) - 30; });

        var root = {
            name: "background_root",
            size: 1,
            children : [{
                name: "background_1",
                size: 1
            }]
        };

        var path = backgroundG.datum(root).selectAll("path")
            .data(partition.nodes)
            .enter().append("path")
            .attr("d", function(d,i) {
                if (i == 0) {
                    return arc(d);
                } else {
                    return arc2(d);
                }
            })
            .attr('class', function(d, i) {
                if (i == 0) {
                    return 'transaction';
                } else {
                    return 'instance';
                }
            })
            .style("fill", '#1c8ffc')
            .each(stash);

        var data = [[-80, 0], [80, 0]];

        var lineGenerator = d3.svg.line();
        var pathString = lineGenerator(data);

        backgroundG.append('path')
            .attr('d', pathString)
            .style('fill', 'none')
            .style('stroke', '#ffffff');

        backgroundG.append("text")
            .attr("y", -20)
            .attr('class', 'transaction-text')
            .attr("fill", "#ffffff")
            .attr("font-size", "16px")
            .attr("letter-spacing", "-1px")
            .attr("text-anchor", "middle");

        backgroundG.append("text")
            .attr("y", 30)
            .attr('class', 'instance-text')
            .attr("fill", "#ffffff")
            .attr("font-size", "16px")
            .attr("letter-spacing", "-1px")
            .attr("text-anchor", "middle");

        function stash(d) {
            d.x0 = d.x;
            d.dx0 = d.dx;
        }

        circleG.append("g")
            .attr("class", "data")
            .attr("transform", "translate(" + translateX + "," + circleHeight / 2 + ")");
    },
    
    setTextArea: function(textG) {
        var data = [[50, 185], [280, 185]];

        var lineGenerator = d3.svg.line();
        var pathString = lineGenerator(data);

        textG.append('path')
            .attr('d', pathString)
            .style('fill', 'none')
            .style('stroke', '#5d6267');

        textG.append("circle")
            .attr("r", 3)
            .attr("cx", 280)
            .attr("cy", 185)
            .style('fill', '#5d6267');

        // Add buttons
        textG.append('rect')
            .attr('class', 'instance')
            .attr('width', 105)
            .attr('height', 40)
            .attr('x', 50)
            .attr('y', 130)
            .attr('rx', 20)
            .attr('style', 'fill:#1c8ffc');

        textG.append('rect')
            .attr('class', 'transaction')
            .attr('width', 105)
            .attr('height', 40)
            .attr('x', 160)
            .attr('y', 130)
            .attr('rx', 20)
            .attr('style', 'fill:#1c8ffc');
            
        textG.append('text')
            .attr('x', 70)
            .attr('y', 155)
            .attr('fill', '#ffffff')
            .attr('font-size', '16px')
            .attr('pointer-events', 'none')
            .html('인스턴스');

        textG.append('text')
            .attr('x', 180)
            .attr('y', 155)
            .attr('fill', '#ffffff')
            .attr('font-size', '16px')
            .attr('pointer-events', 'none')
            .html('트랜잭션');

        textG.append('text')
            .attr('class', 'text')
            .attr('x', 55)
            .attr('y', 215)
            .attr('font-size', '16px');

        textG.append('text')
            .attr('class', 'text')
            .attr('x', 55)
            .attr('y', 235)
            .attr('fill', '#ff4a6a')
            .attr('font-size', '14px');

        textG.append('text')
            .attr('class', 'text')
            .attr('x', 55)
            .attr('y', 255)
            .attr('fill', '#ff4a6a')
            .attr('font-size', '14px');

    },

    setData: function(data) {
        if (!data && this.data) {
            data = this.data;
        }

        if (!data) {
            return;
        }

        var self = this,
            alarmCount = 0;

        this.data = data;

        this.svg.selectAll(".background").each(function() {
            if (data.status.instance == 'critical') {
                d3.select(this).select('.instance').attr('style', 'fill:#ff4a6a;');
                alarmCount++;

            } else {
                d3.select(this).select('.instance').attr('style', 'fill:#1c8ffc');
            }

            if (data.status.transaction == 'critical') {
                d3.select(this).select('.transaction').attr('style', 'fill:#ff4a6a;');
                alarmCount++;
            } else {
                d3.select(this).select('.transaction').attr('style', 'fill:#1c8ffc');
            }
        });

        this.svg.selectAll('.background').each(function() {
            d3.select(this).select('.transaction-text').html(data.details.transaction);
            d3.select(this).select('.instance-text').html(data.details.instance);
        });

        if (alarmCount) {
            this.iframe = Ext.getCmp('alarmIframe');
            this.iframe.el.dom.src = '../images/poc_gauge_motion_red.svg';
        } else {
            this.iframe = Ext.getCmp('alarmIframe');
            this.iframe.el.dom.src = '../images/poc_gauge_motion_blue.svg';
        }

        this.svg.selectAll('.textG').each(function() {
            d3.select(this).selectAll('.text').each(function(d, i) {
                d3.select(this).text(data.description[i]);
            });

            if (data.status.instance == 'critical') {
                d3.select(this).select('.instance').attr('style', 'fill:#ff4a6a;cursor:pointer;');
                d3.select(this).select('.instance').on("click", function() {
                    self.createPopup('instance');
                });
            } else {
                d3.select(this).select('.instance').attr('style', 'fill:#1c8ffc');
            }

            if (data.status.transaction == 'critical') {
                d3.select(this).select('.transaction').attr('style', 'fill:#ff4a6a;cursor:pointer;');
                d3.select(this).select('.transaction').on("click", function() {
                    self.createPopup('transaction');
                });
            } else {
                d3.select(this).select('.transaction').attr('style', 'fill:#1c8ffc');
            }
        });

    },

    draw: function(target, width, height) {
        if (this.svg) {
            this.svg.remove();
        }

        var minWidth  = 200,
            minHeight = 160;

        this.width  = ( width  - 12 < minWidth ) ? minWidth : width - 12;
        this.height = ( height - 12 < minHeight ) ? minHeight : height - 12;

        this.circleWidth  = this.width * 0.85;
        this.circleHeight = this.height;
        this.radius       = Math.min(this.circleWidth, this.circleHeight) / 2;
        this.diameter     = this.radius * 2;

        this.rectWidthLast = this.diameter - 20;

        if (Ext.getCmp('alarmIframe')) {
            this.remove(Ext.getCmp('alarmIframe'));
        }

        var left = (-(this.width / 2)) + this.circleWidth / 2.8 - 8;

        this.alarmAnimation = {
            xtype: 'component',
            id : 'alarmIframe',
            autoEl: {
                tag: 'iframe',
                src: '../images/poc_gauge_motion_blue.svg',
                frameborder: '0',
                style : 'position:absolute;left:' +  left + 'px;top:-5px;pointer-events:none;'
            }
        };

        this.add(this.alarmAnimation);

        this.svg = d3.select("#" + target).append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        var circleG, textG;

        circleG = this.svg.append("g")
            .attr("class", "circle")
            .attr("transform", "translate(0,0)");

        textG = this.svg.append("g")
            .attr("class", "textG")
            .attr("transform", "translate(" + this.width / 2 + ",0)");

        this.setBackground(circleG);
        this.setTextArea(textG);
        this.setData();
    },

    createPopup: function(type) {
        if (type == 'instance') {
            common.OpenView._loadRealView('AIMonitor2');
        } else {
            var causalityAnalysis= Ext.create('Exem.AbnormalPopup');
            causalityAnalysis.init();
        }
    }
    
});