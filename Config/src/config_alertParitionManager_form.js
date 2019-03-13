Ext.define('config.config_alertParitionManager_form', {

    parent: null,
    day: '',

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 640,
            height: 450,
            resizable: false,
            title: common.Util.TR('Partition Manager'),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        var labelA = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Table List'))
        });

        panelA1.add(labelA);

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        panelA.add(panelA1);
        panelA.add(panelA2);

        this.grid = Ext.create('Exem.adminGrid', {
            flex: 1,
            width: '100%',
            border: false,
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });
        panelA2.add(this.grid);

        this.grid.beginAddColumns();
        this.grid.addColumn({text: common.Util.CTR('Table'),         dataIndex: 'table_name',   width: 450, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Retention Period'), dataIndex: 'retentionday', width: 120, type: Grid.Number, alowEdit: false, editMode: false});
        this.grid.endAddColumns();

        var panelB = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 68,
            margin: '0 4 4 4',
            padding: '1 1 1 1',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelB1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        panelB.add(panelB1);

        var labelB = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Retention Period Settings'))
        });

        panelB1.add(labelB);

        var panelB2 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        panelB.add(panelB2);

        var retentionDayLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 90,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Retention Period'))
        });

        this.retentionDayEdit = Ext.create('Ext.form.field.Text', {
            x: 100,
            y: 10,
            width: 50,
            allowBlank: false,
            maxLength : 3,
            enforceMaxLength : true,
            minValue : 1
        });

        panelB2.add(retentionDayLabel);
        panelB2.add(this.retentionDayEdit);

        var panelC = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 25,
            border: false,
            bodyStyle: { background: '#f5f5f5' }
        });

        var OKButton = Ext.create('Ext.button.Button', {
            text: 'OK',
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    if (self.mode == 'Add') {
                        self.save();
                    } else {
                        self.update();
                    }
                    this.up('.window').close();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Cancel'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        form.add(panelA);
        form.add(panelB);
        form.add(panelC);

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.show();

        // GET TABLE LIST
        var d = null;
        this.grid.clearRows();
        for (var ix = 0; ix < this.parent.partition_grid.getSelectedRow().length; ix++) {
            d = this.parent.partition_grid.getSelectedRow()[ix].data;
            this.grid.addRow([
                d.table_name,
                d.retentionday
            ]);
        }
        this.grid.drawGrid();

        this.retentionDayEdit.focus();
    },

    save: function() {
        if (this.retentionDayEdit.getValue() == '')
            return;

        var d = null;

        for (var ix = 0; ix < this.grid.getRowCount(); ix++) {
            d = this.grid.getRow(ix).data;
            d.start = ix + 1;
            d.end = this.grid.getRowCount();
            this.partitionUpdate(d);
        }
    },

    partitionUpdate : function(d){
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Partition_Manage_Update.sql';
        dataSet.bind = [{
            name: 'table_name',
            value: d.table_name,
            type : SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'retention_day',
            value: parseInt(this.retentionDayEdit.getValue())
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            if(d.start === d.end) {
                setTimeout(function () {
                    self.parent.refresh_PartitionManage();
                }, 100);
            }
        }, this);
    },

    update: function() {
        this.save();
    }
});
