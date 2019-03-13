Ext.define("view.CellRatioChart", {
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
                var store1 = [[30, 0]], store2 = [[10, 0]], store3 = [[60, 0]];

                var options = {
                    series: {
                        bars: {
                            show: true
                        },
                        stack: true
                    },
                    bars: {
                        align: 'center',
                        barWidth: 0.5,
                        horizontal: true,
                        lineWidth: 1
                    },
                    xaxis: {
                        max: 100,
                        show: false
                    },
                    yaxis: {
                        ticks: [[0, 'cat0']],
                        show: false
                    }
                };

                var chart = null;

                Ext.defer(function() {
                    chart = $.plot($('#'+id),
                                    [{data: store1, color:'red'},
                                     {data: store2, color:'yellow'},
                                     {data: store3, color:'blue'}],
                                    options);
                }, 5, this);
            }
            else {
                var con = Ext.create('Exem.Container', {
                    html: '&nbsp no data',
                    layout: 'fit'
                });
                Ext.defer(con.render, 5, con, [id]);
            }

            return "<div style='width:100px; height:20px; border:1px solid c3c3c3;'>" +
                        "<div id='" + id + "' style='width:100%; height:100%;'>" +
                    "</div>";
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
        this.grid.addColumn('JVM Heap Trend', 'heap', 110, Grid.String  , true , false) ;
        this.grid.endAddColumns();

        this.grid.addRenderer('heap', createCellChart ) ;

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
            if(data.rows.hasOwnProperty(ix)){
                wasId.push( data.rows[ix][0] );
                this.store[ data.rows[ix][0] ] = [];
            }
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
        for(var ix in data.rows){
            if(data.rows.hasOwnProperty(ix)){
                this.store[data.rows[ix][0]].push(data.rows[ix]);
            }
        }
        this.grid.onData(this.gridData.header, this.gridData.data);
    }
});