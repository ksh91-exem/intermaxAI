Ext.define('view.AbnormalTransactionDetection', {
    extend: 'Exem.FormOnCondition',
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql : {
        abnormalTransactionGrid: 'IMXPA_Abnormal_Transaction_Grid.sql',
        abnormalTransactionChart: 'IMXPA_Abnormal_Transaction_Chart.sql'
    },

    autoScroll: true,

    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    init: function() {
        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.retrieveFlag = false;
        this.isLoading  = false;
    },

    initLayout: function() {
        this.setWorkAreaLayout('border');
        this.createConditionArea();
        this.createWorkArea();
    },

    createConditionArea: function() {
        this.addWasComboBox();
        this.addTxnNameField();
        this.addTidField();
        this.addAbnormalToggle();
    },

    addWasComboBox: function() {
        this.wasComboBox = Ext.create('Exem.wasDBComboBox', {
            width           : 320,
            comboLabelWidth : 60,
            comboWidth      : 280,
            fieldLabel      : common.Util.TR('Agent'),
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            x               : 350,
            y               : 5,
            linkMonitorType : this.monitorType
        });

        this.conditionArea.add(this.wasComboBox);
    },

    addTxnNameField: function() {
        this.txnNameField = Ext.create('Exem.TextField', {
            allowBlank : false,
            value      : common.Util.TR('Transaction Name'),
            width      : 270,
            x          : 365,
            y          : 32,
            listeners: {
                focus: function() {
                    if ( this.getValue() === '%' || this.getValue() === common.Util.TR('Transaction Name') ) {
                        this.setValue('%');
                    }
                },
                blur: function() {
                    if ( this.getValue() === '%' ) {
                        this.setValue(common.Util.TR('Transaction Name'));
                    }
                }
            }
        });

        this.conditionArea.add(this.txnNameField);
    },

    addTidField: function() {
        this.tidField = Ext.create('Exem.TextField', {
            allowBlank : false,
            value      : 'TID',
            width      : 150,
            x          : 700,
            y          : 5 ,
            listeners: {
                focus: function() {
                    if ( this.getValue() === '%' || this.getValue() === 'TID' ) {
                        this.setValue('%');
                    }
                },
                blur: function() {
                    if ( this.getValue() === '%' ) {
                        this.setValue('TID');
                    }
                }
            }
        });

        this.conditionArea.add(this.tidField);
    },

    addAbnormalToggle: function() {
        var toggleCon = Ext.create('Exem.Container', {
            width : 74,
            x     : 900,
            y     : 6
        });

        this.abnormalToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            offLabelCls: 'x-toggle-slide-label-off2',
            onText: common.Util.CTR('Abnormal'),
            offText: common.Util.CTR('ALL'),
            state: true
        });

        toggleCon.add(this.abnormalToggle);

        this.conditionArea.add(toggleCon);
    },

    createWorkArea: function() {
        this.createGridArea();
        this.createChartArea();

        this.workArea.add(this.gridCon, this.chartCon);

        this.abnomarlTxnChart.init();
    },

    createGridArea: function() {
        this.gridCon = Ext.create('Exem.Container',{
            region : 'west',
            layout: 'fit',
            width: '42%',
            split: true
        });

        this.abnormalTxnGrid = Ext.create('Exem.BaseGrid', {
            defaultPageSize: 50,
            defaultbufferSize: 1,
            itemclick: function( me, record ) {
                if (record.data.abnormal === 'true' && record.data.tid) {
                    this.setChartData(record.data);
                } else {
                    console.warn('Normal or no TID value.');
                }
            }.bind(this)
        });

        this.abnormalTxnGrid.beginAddColumns();
        this.abnormalTxnGrid.addColumn(common.Util.CTR('Time'), 'time',  130, Grid.String, true, false);
        this.abnormalTxnGrid.addColumn(common.Util.CTR('Agent ID'), 'agent_id',  110, Grid.String, false, false);
        this.abnormalTxnGrid.addColumn(common.Util.CTR('Agent'), 'agent_name',  100, Grid.String, true, false);
        this.abnormalTxnGrid.addColumn(common.Util.CTR('TXN ID'), 'txn_id',  200, Grid.String, false, false);
        this.abnormalTxnGrid.addColumn(common.Util.CTR('Transaction'), 'txn_name',  200, Grid.String, true, false);
        this.abnormalTxnGrid.addColumn(common.Util.CTR('TID'), 'tid',  150, Grid.String, true, false);
        this.abnormalTxnGrid.addColumn(common.Util.CTR('Abnormal'), 'abnormal',  100, Grid.String, true, false);
        this.abnormalTxnGrid.addColumn(common.Util.CTR('Error Count'), 'errno',  100, Grid.String, true, false);
        this.abnormalTxnGrid.endAddColumns();

        this.gridCon.add(this.abnormalTxnGrid);
    },

    createChartArea: function() {
        this.chartCon = Ext.create('Exem.Container',{
            region : 'center',
            layout: 'fit',
            minWidth: 500
        });

        this.abnomarlTxnChart = Ext.create('Exem.abnormalChart', {
            target : this.chartCon,
            xyLineWidth: 15,
            textWidth: 300,
            lineCount: 7,
            margin: {
                top   : 10,
                right : 30,
                bottom: 20,
                left  : 20
            }
        });
    },

    executeSQL: function() {
        var dataSet = {},
            txnName, tid, abnormal;

        if (!this.isLoading) {
            this.isLoading = true;
            this.loadingMask.showMask();
        } else {
            return;
        }

        dataSet.sql_file = 'IMXPA_Abnormal_Transaction_Grid.sql';

        if (this.isCallRTM) {
            this.datePicker.mainFromField.setValue(Ext.util.Format.date(this.fromTime, 'Y-m-d H:i'));
            this.datePicker.mainToField.setValue(Ext.util.Format.date(this.toTime, 'Y-m-d H:i'));
            this.tidField.setValue(this.tid);
            this.txnNameField.setValue(this.txnName);
            this.isCallRTM = false;
        }

        if (this.txnNameField.getValue() ===  common.Util.TR('Transaction Name')) {
            txnName = '%';
        } else {
            txnName = this.txnNameField.getValue();
        }

        if (this.tidField.getValue() ===  'TID') {
            tid = '%';
        } else {
            tid = this.tidField.getValue();
        }

        if (this.abnormalToggle.getValue()) {
            abnormal = '\'true\'';
        } else {
            abnormal = '\'true\', \'false\'';
        }

        dataSet.bind = [{
            name: 'fromTime',
            value: Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type: SQLBindType.STRING
        }, {
            name: 'toTime',
            value: Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type: SQLBindType.STRING
        }, {
            name: 'tid',
            value: tid,
            type: SQLBindType.STRING
        }, {
            name: 'txnName',
            value: txnName,
            type: SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'wasId',
            value: this.wasComboBox.getValue()
        }, {
            name: 'abnormal',
            value: abnormal
        }];

        WS.SQLExec(dataSet, this.onAbnormalData, this);
    },

    onAbnormalData: function(header, data) {
        var ix, ixLen;

        if (this.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.warn('AbnormalTransactionDetection - onAbnormalData');
            console.warn(header);
            console.warn(data);
            this.isLoading = false;
            this.loadingMask.hide();
            return;
        }

        this.abnormalTxnGrid.clearRows();

        for ( ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            this.abnormalTxnGrid.addRow([
                data.rows[ix][0],   // time
                data.rows[ix][1],   // agent_id
                data.rows[ix][2],   // agent_name
                data.rows[ix][3],   // txn_id
                data.rows[ix][4],   // txn_name
                data.rows[ix][5],   // tid
                data.rows[ix][6],   // abnormal
                data.rows[ix][7]    // errno
            ]);
        }

        this.abnormalTxnGrid.drawGrid();

        if (this.isLoading) {
            this.isLoading = false;
            this.loadingMask.hide();
        }
    },

    setChartData: function(selectData) {
        var dataSet = {};

        if (!this.isLoading) {
            this.isLoading = true;
            this.loadingMask.showMask();
        } else {
            return;
        }

        dataSet.sql_file = 'IMXPA_Abnormal_Transaction_Chart.sql';

        dataSet.bind = [{
            name: 'selectTime',
            value: selectData.time,
            type: SQLBindType.STRING
        }, {
            name: 'txnId',
            value: selectData.txn_id,
            type: SQLBindType.STRING
        }, {
            name: 'tid',
            value: selectData.tid,
            type: SQLBindType.LONG
        }];

        WS.SQLExec(dataSet, this.chartDraw, this);
    },

    chartDraw: function(header, data) {
        var ix, ixLen;

        if (!common.Util.checkSQLExecValid(header, data)) {
            console.warn('AbnormalTransactionDetection - chartDraw');
            console.warn(header);
            console.warn(data);
            this.isLoading = false;
            this.loadingMask.hide();
            return;
        }

        this.abnomarlTxnChart.clearChart();
        this.abnomarlTxnChart.dataReset();

        for ( ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
            this.abnomarlTxnChart.methodList.push(data.rows[ix][0]);    // method_sig
            this.abnomarlTxnChart.elapseTime.push(data.rows[ix][1]);    // elapse_time
            this.abnomarlTxnChart.meanValue.push(data.rows[ix][2]);     // mean
            this.abnomarlTxnChart.upperBound.push(data.rows[ix][3]);    // upper_bound
            this.abnomarlTxnChart.lowerBound.push(data.rows[ix][4]);    // lower_bound
            this.abnomarlTxnChart.abnormal.push(data.rows[ix][5]);      // method_abnormal
            this.abnomarlTxnChart.boundValue.push(data.rows[ix][3] - data.rows[ix][4]);
        }

        this.abnomarlTxnChart.rowCount = data.rows.length;
        this.abnomarlTxnChart.tid.push(this.abnormalTxnGrid.getSelectedRow()[0].data.tid);

        this.abnomarlTxnChart.draw();

        if (this.isLoading) {
            this.isLoading = false;
            this.loadingMask.hide();
        }
    }
});