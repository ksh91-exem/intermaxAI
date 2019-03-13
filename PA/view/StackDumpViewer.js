Ext.define("view.StackDumpViewer", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        dump : 'IMXPA_StackDump.sql'
    },
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    checkValid: function(){
        return this.wasField.checkValid();
    },

    init: function() {

        this.setWorkAreaLayout('border');
        this.workArea.setStyle( 'border-radius', '1px' ) ;

        this.wasField = Ext.create('Exem.wasDBComboBox', {
            x: 380,
            y: 5,
            width           : 400,
            multiSelect     : true,
            comboLabelWidth : 60,
            comboWidth      : 280,
            itemId          : 'wasCombo',
            selectType      : common.Util.TR('Agent')
        });

        this.conditionArea.add(this.wasField);

        this.dumpGrid = Ext.create('Exem.BaseGrid', {
            region: 'center',
            layout: 'fit',
            localeType: 'y-m-d H:i:s',
            gridName: 'pa_stack_dump_gridName',
            itemclick: function(dv, record) {
                this._selectRow(record.data);
            }.bind(this)
        });

        this.dumpGrid.beginAddColumns();
        this.dumpGrid.addColumn(common.Util.CTR('Time'),             'TIME',      250, Grid.DateTime, true, false);
        this.dumpGrid.addColumn(common.Util.CTR('Agent'),            'was_name',  250, Grid.String  , true, false);
        this.dumpGrid.addColumn(common.Util.CTR('Transaction Name'), 'txn_name',  250, Grid.String  , true, false);
        this.dumpGrid.addColumn(common.Util.CTR('TID'),              'tid',       250, Grid.String  , true, false);
        this.dumpGrid.addColumn(common.Util.CTR('Thread ID'),        'thread_Id', 250, Grid.StringNumber  , true, false);
        this.dumpGrid.addColumn('DumpText',                          'dump_text', 100, Grid.String, false, true);
        this.dumpGrid.endAddColumns();
        this.dumpGrid._columnsList[3].align = 'right';

        this.dumpGrid.loadLayout(this.dumpGrid.gridName);

        this.dumpTextField = Ext.create('Exem.Panel',{
            title  : common.Util.TR('Stack Dump'),
            layout : 'fit',
            region : 'south',
            width  : '100%',
            height : '60%'
//            autoScroll: true
        });

        this.dumpEditor = Ext.create('Exem.SyntaxEditor', {
            mode  : 'java',
            width : '100%',
            height: '100%',
            readOnly: true,
            autoScroll: true
        });

        this.dumpTextField.add(this.dumpEditor);
        this.workArea.add(this.dumpGrid, this.dumpTextField);

    } ,

    _gridClick: function (grid, idx) {
        grid.getView().getSelectionModel().select(idx);
        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
    },

    executeSQL: function() {

        this.dumpEditor.setText('');
        this.dumpGrid.clearRows();

        var dataset = {};

        dataset.bind = [{
            name: "from_time",
            type: SQLBindType.STRING,
            value: common.Util.getDate(this.datePicker.getFromDateTime())
        }, {
            name: "to_time",
            type: SQLBindType.STRING,
            value:  Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i:00')
        }];
        dataset.replace_string=[{
            name: "was_id",
            value: this.wasField.getValue()
        }];
        dataset.sql_file = this.sql.dump;
        WS.SQLExec(dataset, this.onData, this);

        this.loadingMask.showMask();

    },

    _selectRow: function(data) {

        this.dumpEditor.setText('');
        this.dumpEditor.setText(data['dump_text']);

    },

    onData: function(header, data) {
        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            common.Util.showMessage(common.Util.TR('ERROR'), header.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            this.loadingMask.hide();

            console.warn('StackDumpViewer-onData');
            console.warn(header);
            console.warn(data);
            return;
        }

        if (data.rows.length > 0) {

            var ix, ixLen, grid, dataRows;
            var lineStrList, txnIdx, tidIdx, idIdx ;
            var tid, id, txnName;

            grid = this.dumpGrid.pnlExGrid;

            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
                dataRows = data.rows[ix];

                lineStrList = dataRows[3].split('\n');

                if ( lineStrList[1] !== undefined && lineStrList[1].indexOf('txn name="') !== -1 ){
                    txnIdx = lineStrList[1].indexOf('txn name="');
                }else{
                    txnIdx = -1;
                }

                if ( lineStrList[1] !== undefined && lineStrList[1].indexOf('tid="') !== -1 ){
                    tidIdx = lineStrList[1].indexOf('tid="') ;
                    lineStrList[1] = lineStrList[1].replace(/tid=/gi, "ttt=");
                }else{
                    tidIdx = -1;
                }

                if ( lineStrList[1] !== undefined && lineStrList[1].indexOf('id="') !== -1 ){
                    idIdx  = lineStrList[1].indexOf('id="') ;
                }else{
                    idIdx = -1;
                }

                if ( tidIdx === -1 || idIdx === -1 ) {
                    txnName = 'FULL THREAD DUMP';
                    tid = '';
                    id = '' ;
                } else {
                    txnName = lineStrList[1].substring(txnIdx+10, tidIdx-2 );
                    tid = lineStrList[1].substring(tidIdx+5, tidIdx + idIdx - tidIdx -2);
                    lineStrList[1] = lineStrList[1].substring(idIdx+4, lineStrList[1].length);
                    id  = lineStrList[1].substring(0, lineStrList[1].length);
                    id = id.replace('"', '') ;
                }

                this.dumpGrid.addRow([
                    dataRows[0]  // time
                    ,dataRows[1]  // was
                    ,txnName      // txn_name
                    ,tid          // tid
                    ,id           // thread id
                    ,dataRows[3]  // dumpText
                ]);

            }

            this.dumpGrid.drawGrid();
            this._gridClick(grid, 0);

        }

        this.loadingMask.hide();
    }
});