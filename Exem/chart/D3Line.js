Ext.define("Exem.chart.D3Line", {
    extend: 'Ext.Component',
    target: null,
    fromTime: null,
    toTime: null,
    interval: 60*1000,
    listeners: {
        render: function() {
            console.debug('rendered');
        }
    },

    setSeries: function(seriesId, name) {
        if (!this.series)
            this.series = [];

        this.series.push({ id: seriesId, data: [], name: name });
    },

    setTimeRange: function(from, to, interval) {
        this.fromTime = from;
        this.toTime = to;
        this.interval = interval;
    },

    removeSeries: function(seriesId) {
        this.series = _.reject(this.series, function(series) {
            return series.id == seriesId;
        });
    },

    putData: function(seriesId, data) {
        var targetSeries = _.find(this.series, function(series) {
            return series.id == seriesId;
        });
        targetSeries.data = data;
    },

    times: function() {
        var _results = [];

        for (var _i=Number(this.fromTime); _i<=Number(this.toTime); _i=_i+this.interval) {
            _results.push(_i);
        }
        return _results;
    },

    maxForStat: function (statsData, timesArray) {
        var self = this;

        var __indexOf = [].indexOf || function (item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) {
                    return i;
                }
            }
            return -1;
        };

        if (timesArray == null) {
            timesArray = this.times();
        }
        return d3.max(statsData, function(statData) {
            var count, i;
            return d3.max((function () {
                var _j, _len, _ref, _ref1, _results1;
                _ref = statData.data;
                _results1 = [];
                for (i = _j = 0, _len = _ref.length; _j < _len; i = ++_j) {
                    count = _ref[i];
                    if (_ref1 = self.times()[0] + i*self.interval, __indexOf.call(timesArray, _ref1) >= 0) {
                        _results1.push(count);
                    }
                }
                return _results1;
            })());
        }) || 0;
    },

    init: function() {
        var self = this,
            duration = 1000,
            xAxis, yAxis, time, redrawExistingLines, lineGenerator, updateYAxis, updateLines;

        this.axis = (function() {
            return {
                x: d3.time.scale().domain( _.map(d3.extent(self.times()), function(time) {
                                             return new Date(time); }) ),
                y: d3.scale.linear().domain([0, 1])
            };
        })();

        var g = self.target,
            statG = g.append('g').attr('class', 'stats');

        g.append('text').attr('x', 20).attr('y', 15).style('fill', 'darkred')
            .text(self.title);

        statG.append('g').attr('class', 'd3lines');
        g.append('g').attr('class', 'x_axis');
        g.append('g').attr('class', 'y_axis');

        xAxis = d3.svg.axis().scale(this.axis.x).orient("bottom").tickValues((function () {
            var _i, _len, _ref, _results;
            _ref = self.times();
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                time = _ref[_i];
                if (time % (self.interval*30) === 0) {
                    _results.push(new Date(time));
                }
            }
            return _results;
        })()).tickFormat(d3.time.format("%H:%M")).tickSubdivide(1).tickSize(6, 1);

        yAxis = d3.svg.axis().scale(this.axis.y).orient("left").tickFormat(String).ticks(3);

        redrawExistingLines = function (lines) {
            return lines.style("clip-path", "url(#graphs_clip_path_"+self.id+")")
                .select("g path").attr("d", function (statData) {
                    return lineGenerator(statData.data);
            });
        };

        lineGenerator = d3.svg.line().x(function (pt, i) {
            return self.axis.x(new Date(self.times()[0] + self.interval*i));
        }).y(self.axis.y).tension(0.1).interpolate("linear");

        PubSub.subscribe("container:resize", function () {
            self.width = self.targetCon.getWidth()*0.9;

            self.axis.x.range([80, self.width-50]);
            self.axis.y.range([self.height-20, 30]);
            yAxis.tickSize(-(self.axis.x.range()[1] - self.axis.x.range()[0]), 0, 1);
            xAxis.tickSize(-(self.axis.y.range()[0] - self.axis.y.range()[1]), 0, 1);
            g.select(".x_axis").attr("transform", "translate(0, " + (self.axis.y.range()[0] + 1) + ")").call(xAxis);
            g.select(".y_axis").attr("transform", "translate(" + (self.axis.x.range()[0]) + ", 0)").call(yAxis);
            g.selectAll(".stats .d3lines g").call(redrawExistingLines);
        });

        updateYAxis = function(max) {
            max = Math.max(max, 1);
            self.axis.y.domain([0, max]);
            g.select(".y_axis").transition().duration(duration).call(yAxis);
            return PubSub.publishSync("axis:y:update");
        };

        updateLines = function() {
            var clipPathId, disappear, initialLine, leftToRightAppearTransition, lines, newLines, new_max;
            new_max = self.maxForStat(self.series);
            updateYAxis(new_max);
            initialLine = lineGenerator((function () {
                var _j, _len, _ref2, _results1;
                _ref2 = self.times();
                _results1 = [];
                for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
                    time = _ref2[_j];
                    _results1.push(0);
                }
                return _results1;
            })());

            lines = g.select('.stats .d3lines').selectAll("g").data(self.series, function(d) {
                return d.id;
            });
            newLines = lines.enter().append("g").attr("opacity", 1).classed("line", true);

            lines.transition().duration(duration).call(redrawExistingLines);
            clipPathId = function(statData, i) {
                return "clip_path_series_"+ self.id + i;
            };
            newLines.append("clipPath").attr("class", "clippath").attr("id", clipPathId).append("rect")
                .attr("x", self.axis.x.range()[0]).attr("width", 0)
                .attr("y", self.axis.y.range()[1] - 10).attr("height", self.axis.y.range()[0] - self.axis.y.range()[1] + 20);
            newLines.append("path").attr("stroke", function(d) {return common.Util.wasColorScale(d.id);})
                .attr('fill', 'none').attr('stroke-width', 2)
                .style("clip-path",function (statData, i) {
                   return "url(#" + (clipPathId(statData, i)) + ")";
            }).attr("d", function(statData) {

                    return lineGenerator(statData.data);
                });
            leftToRightAppearTransition = newLines.transition().duration(duration).ease("linear");
            leftToRightAppearTransition.select(".clippath").remove().select("rect")
                .attr("width", self.axis.x.range()[1] - self.axis.x.range()[0]);
            leftToRightAppearTransition.select("path").each('end', function () {
                return d3.select(this).style("clip-path", "url(#graphs_clip_path_"+self.id+")");
            });

            disappear = function (sel) {
                return sel.exit().transition().ease('exp-out').duration(duration).attr("opacity", 0).remove();
            };
            disappear(lines).select("g.line path").attr("d", initialLine);
        };

        PubSub.subscribe("series:remove", function () {
            // arguments: msg, wasData
            return updateLines();
        });

        PubSub.subscribe("series:ondata", function () {
            // arguments: msg, wasData
            return updateLines();
        });
    }
});
