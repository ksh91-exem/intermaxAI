Ext.define("view.GridCellChart", {
    extend: "Exem.FormOnCondition",
    width: "100%",
    height: "100%",
    style: {
        background: '#cccccc'
    },

    init: function() {
        var self = this;

        this.setWorkAreaLayout('border');

        this.wasCombo = Ext.create('Exem.ComboBox', {
            store: Comm.wasStoreWithAll,
            x: 400,
            y: 5
        });
        this.conditionArea.add(this.wasCombo);


        function createCellChart(value, meta, record) {
            var id = Ext.id();

            if (self.store[record.data.was_id].length > 0) {
                var chart = Ext.create('Exem.chart.CanvasChartLayer', {
                    layout: 'fit',
                    width: 400,
                    height: 70,
                    legendWidth: 60,
                    showLegend: true,
                    firstShowXaxis: true,
                    firstShowYaxis: true,
                    chartProperty: {
                        yLabelWidth: 25,
                        xLabelFont: {size: 8, color: 'black'},
                        yLabelFont: {size: 8, color: 'black'}
                    }
                });
                chart.addSeries({
                    id: 'heapSize',
                    type: PlotChart.type.exLine,
                    label: 'Total'
                });
                chart.addSeries({
                    id: 'usedHeap',
                    type: PlotChart.type.exLine,
                    label: 'Used'
                });

                chart.addValues({
                    from: self.datePicker.getFromDateTime(),
                    to  : self.datePicker.getToDateTime(),
                    interval: 3000,
                    time: 1,
                    data: self.store[record.data.was_id],
                    series: {
                        heapSize: 2,
                        usedHeap: 3
                    }
                });

                Ext.defer(chart.render, 5, chart, [id]);
            }
            else {
                var con = Ext.create('Exem.Container', {
                    html: '&nbsp no data',
                    width: 400,
                    height: 30
                });
                Ext.defer(con.render, 5, con, [id]);
            }

            return "<div id='" + id + "' style='height:70; border:1px solid c3c3c3;'></div>";
        }


        this.grid = Ext.create('Exem.BaseGrid', {
            layout		: 'fit',
            region      : 'center',
            width       : '100%',
            height 		: '100%'
        });

        this.grid.beginAddColumns();
        this.grid.addColumn('WAS ID', 'was_id', 60, Grid.Number  , true , false) ;
        this.grid.addColumn('WAS Name', 'was_name', 150, Grid.String  , true , false) ;
        this.grid.addColumn('JVM Heap Trend', 'heap', 410, Grid.String  , true , false) ;
        this.grid.endAddColumns();

        this.grid.addRenderer('heap', createCellChart) ;

        this.workArea.add(this.grid);
    },

    executeSQL: function() {
        WS.SQLExec({
            sql_file: 'IMXPA_CellChartTest_getWasInfo.sql',
            replace_string: [{
                name: 'wasId', value: this.wasCombo.getReplValue()
            }]
        }, this._onWasInfo, this);
    },

    _onWasInfo: function(header, data) {
        var self = this;

        var wasId = [];
        this.store = {};
        this.gridData = {header: header, data: data};

        for(var ix in data.rows) {
            wasId.push( data.rows[ix][0] );
            this.store[ data.rows[ix][0] ] = [];
        }

        WS.SQLExec({
            sql_file: 'IMXPA_CellChartTest_freeHeap.sql',
            bind: [{
                name: 'fromTime', value: self.datePicker.getFromDateTime()
            }, {
                name: 'toTime', value: self.datePicker.getToDateTime()
            }],
            replace_string: [{
                name: 'wasId', value: wasId.join(',')
            }]
        }, this._onFreeHeap, this);
    },

    _onFreeHeap: function(header, data) {
        for(var ix in data.rows)
            this.store[data.rows[ix][0]].push(data.rows[ix]);

        this.grid.onData(this.gridData.header, this.gridData.data);
    }
});