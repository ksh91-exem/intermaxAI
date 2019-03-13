Ext.define("view.Trend", {
    extend: "Exem.FormOnCondition",

    statInfo: {
        'Active Transactions': {
            category: 'Activity', sql: 'IMXPA_Trend_WasStat.sql', sqlColumn: 'active_txns'},
        'Concurrent Users': {
            category: 'Activity', sql: 'IMXPA_Trend_WasStat.sql', sqlColumn: 'was_sessions'},
        'TPS': {
            category: 'Activity', sql: 'IMXPA_Trend_WasStat.sql', sqlColumn: 'tps'},

        'JVM CPU Usage (%)': {
            category: 'JVM',    sql: 'IMXPA_Trend_WasStat.sql', sqlColumn: 'jvm_cpu_usage'},
        'JVM Free Heap (MB)': {
            category: 'JVM',    sql: 'IMXPA_Trend_WasStat.sql', sqlColumn: 'jvm_free_heap', aggregate: 'min'},
        'JVM Thread Count': {
            category: 'JVM',    sql: 'IMXPA_Trend_WasStat.sql', sqlColumn: 'jvm_thread_count'},

        'OS CPU (%)': {
            category: 'OS',     sql: 'IMXPA_Trend_WasStat.sql', sqlColumn: 'os_cpu'},
        'OS Free Memory (MB)': {
            category: 'OS',     sql: 'IMXPA_Trend_WasStat.sql', sqlColumn: 'os_free_memory', aggregate: 'min'},

        'Total GC Count': {
            category: 'GC',     sql: 'IMXPA_Trend_GCStat.sql', sqlColumn: 'jvm_gc_count'},
        'Total GC Time (Sec)': {
            category: 'GC',     sql: 'IMXPA_Trend_GCStat.sql', sqlColumn: 'jvm_gc_time'},
        'Full GC Count': {
            category: 'GC',     sql: 'IMXPA_Trend_GCStat.sql', sqlColumn: 'fgc'},
        'Full GC Time (Sec)': {
            category: 'GC',     sql: 'IMXPA_Trend_GCStat.sql', sqlColumn: 'old_gc_time'},

        'Elapse Time': {
            category: 'Activity', sql: 'IMXPA_Trend_ElapseTime.sql', sqlColumn: 'txn_elapse'}
    },
    interval: 60000,
//    selectedWas: [],

    init: function() {
        var self = this;
        this.setWorkAreaLayout('border');
//        this.datePicker.mainFromField.setValue('2014-04-07 08:00:00');
//        this.datePicker.mainToField.setValue('2014-04-07 08:30:00');
        this.setTimeRange();


        var wasSelectZone = Ext.create('Exem.Panel', {
            layout: 'fit',
            width: '15%',
            minWidth: 150,
            height: '100%',
            region: 'west',
            border: 1
        });

        this.statPanel = Ext.create('Exem.Panel', {
            layout: 'fit',
            width: '80%',
            region: 'center',
            border: 1,
            overflowY: 'auto',
            listeners: {
                render: function() {
                    setTimeout(function() {
                        _.each(self.chartInfo, function(info) {
                            info.chart.init();
                        });

                        $(window).resize(function() {
                            PubSub.publish("container:resize");
                        });
                        PubSub.publish("container:resize");
                    }, 100);
                },
                resize: function() {
                    PubSub.publish("container:resize");
                }
            }
        });


        this.workArea.add([wasSelectZone, this.statPanel]);
        self.drawWasList(wasSelectZone);


        this.statStore = {};
        this.chartInfo = {};
        this.sqlColAndStatPair = {};
        _.each(this.statInfo, function(info, statName){
            info.colIdx = {};
            self.sqlColAndStatPair[info['sqlColumn']] = statName;
        });

        this.createChart();
    },

    setTimeRange: function() {
        this.fromTime = new Date(this.datePicker.getFromDateTime());
        this.toTime = new Date(this.datePicker.getToDateTime());
    },

    initStatStore: function(seriesId) {
        var self = this;

        self.statStore[seriesId] = {};
    },

    createChart: function() {
        var self = this,
            stats = ['OS CPU (%)', 'Active Transactions', 'JVM Free Heap (MB)',
                'Concurrent Users', 'TPS', 'JVM CPU Usage (%)', 'JVM Thread Count',
                'Total GC Count', 'Total GC Time (Sec)', 'Elapse Time'],
//            stats = ['JVM Free Heap (MB)'],
            height = 170;
        var totalheight = stats.length * height,
            svg = d3.select('#'+this.statPanel.id+'-body').append('svg')
                .attr('width', '100%')
                .attr('height', totalheight),
            chart, g;

        svg.append('defs').append('clipPath').attr('id', 'graphs_clip_path').append('rect');
        svg.select("defs #graphs_clip_path rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", '100%').attr("height", totalheight);

        _.each(stats, function(statName, ix) {
            g = svg.append('g').attr('transform', 'translate(0, '+ (height*ix) +')');
            chart = Ext.create('Exem.chart.D3Line', {
                target: g,
                targetCon: self.statPanel,
                title: statName,
                height: height
            });

            chart.setTimeRange(self.fromTime, self.toTime, self.interval);

            self.chartInfo[statName] = {chart: chart, g: g, statInfo: self.statInfo[statName]};
        });
    },

    drawWasList: function(target) {
        var self = this,
            wasList, addRemove;

        var wasInfo = _.chain(Comm.wasIdArr)
            .map(function(d){
                 return {id: d, name: Comm.RTComm.getServerNameByID(d) };
            })
            .sortBy(function(d){ return d.name; }).value();

        wasList = d3.select('#'+target.id+'-body')
            .append('ul').attr('class', 'trend-waslist-ul').selectAll('li')
            .data(wasInfo).enter()
            .append('li').attr('class', 'trend-waslist-li')
            .text(function(d) { return d.name; })
//            .style("line-height", 1.8)
            .style('fill', 'black')
            .style("font-size", "14px")
            .on("click", function(d) {
                var selected;
                selected = d3.select(this).classed("selected");
                PubSub.publish("series:" + (selected ? "remove" : "add"), d);
                return false;
            });

        $('#'+target.id+'-body ul li').after(" ");

        addRemove = function(msg, wasData) {
            var sel = wasList.filter(function(d) {
                return d === wasData;
            });
            if (msg === "series:add") {
                self.initStatStore(wasData.id);
                self.getStat(wasData.id);
                _.each(self.chartInfo, function(info) {
                    info.chart.setSeries(wasData.id, wasData.name);
                });

                return sel.style("background-color", function(d) { return common.Util.wasColorScale(d.id); })
                    .classed("selected", true);
            }
            else {
                _.each(self.chartInfo, function(info) {
                    info.chart.removeSeries(wasData.id);
                });

                return sel.style("background-color", "").classed("selected", false);
            }
        };
        PubSub.subscribe("series:remove", addRemove);
        PubSub.subscribe("series:add", addRemove);
    },

    executeSQL: function() {
        this.setTimeRange();
    },

    getStat: function(seriesId) {
        var statQuery = {
            bind: [{
                name: 'fromTime', value: common.Util.getDate(this.fromTime), type  : SQLBindType.STRING
            }, {
                name: 'toTime', value: common.Util.getDate(this.toTime), type  : SQLBindType.STRING
            }],
            replace_string: [{
                name: 'wasId', value: seriesId
            }]
        };

        var statCb = this.onStatData.bind({
            self: this, fromTime: this.fromTime, toTime: this.toTime, interval: this.interval
        });

        statQuery.sql_file = 'IMXPA_Trend_WasStat.sql';
        WS.SQLExec(statQuery, statCb, this);
        statQuery.sql_file = 'IMXPA_Trend_GCStat.sql';
        WS.SQLExec(statQuery, statCb, this);
        statQuery.sql_file = 'IMXPA_Trend_ElapseTime.sql';
        WS.SQLExec(statQuery, statCb, this);
    },

    onStatData: function(header, data) {
        var self = this.self;

        var procStart = new Date();

        var barIdx, statName;
        _.each(data.columns, function(column, key) {
            barIdx = column.lastIndexOf('_');
            statName = column.substring(0, barIdx);
            if (self.sqlColAndStatPair.hasOwnProperty(statName))
                self.statInfo[self.sqlColAndStatPair[statName]].colIdx[column.substring(barIdx+1)] = key;
        });

        var id = header.parameters.replace_string[0].value,
            store = data.rows,
            idx, chart, columnInfo = {};

        self.statStore[id][header.command] = data.rows;

        _.each(self.chartInfo, function(info, statName) {
            if (info.statInfo.sql == header.command) {
                idx = info.statInfo.colIdx[(!info.statInfo.hasOwnProperty('aggregate')?'max':info.statInfo.aggregate)];
                columnInfo[idx] = statName;
            }
        });

        var getRangeData = self.convertToTimeRangeData.bind({
            data: store,
            timeIdx: 0,
            from: this.fromTime,
            to: this.toTime,
            interval: this.interval,
            columnInfo: columnInfo
        });

        console.debug('process time :', Number(new Date())-procStart,'ms');

        _.each(getRangeData(), function(d, statName) {
            chart = self.chartInfo[statName]['chart'];
            chart.putData(id, d);
            PubSub.publish("series:ondata");
        });

    },

    convertToTimeRangeData: function() {
        var from = Number(this.from),
            timeIdx = this.timeIdx,
            interval = this.interval,
            fromToDiff = (Number(this.to) - from) / interval,
            idxs = _.keys(this.columnInfo),
            columnInfo = this.columnInfo,
            ret = {}, diff;

        _.each(columnInfo, function(statName) {
            ret[statName] = new Array(fromToDiff);
        });

        _.each(ret, function(arr) {
            _.map(arr, function() { return 0; });
        });

        _.each(this.data, function(row) {
            diff = (Number(new Date(row[timeIdx])) - from) / interval;
            _.each(idxs, function(idx) {
                ret[columnInfo[idx]][diff] = Number(row[idx]);
            });
        });
        return ret;
    }
});