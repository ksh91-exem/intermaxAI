Ext.define('config.config_alert_smsschedulemgr', {

    target: null,
    sms_schedule_name: '',

    init: function(_parent_) {
        var self = this;

        this.parent = _parent_;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 500,
            height: 285,
            resizable: false,
            title: common.Util.TR('SMS Schedule Manager'),
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

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                scope: this,
                id: 'cfg_smsschedulemgr_edit',
                handler: function() { self.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                scope: this,
                handler: function() { self.onButtonClick('Delete'); }
            }]
        });

        panelA.add(toolbar);

        this.grid = Ext.create('Exem.adminGrid', {
            flex: 1,
            width: '100%',
            border: false,
            editMode: false,
            useCheckBox: true,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick: function(dv, record) {
                self.sms_schedule_name = record.data.sms_schedule_name;
                var edit = Ext.getCmp('cfg_smsschedulemgr_edit');
                if(edit){
                    edit.setDisabled(false);
                }
            }
        });
        panelA.add(this.grid);

        this.grid.beginAddColumns();
        this.grid.addColumn({text: common.Util.CTR('SMS Schedule Name'), dataIndex: 'sms_schedule_name', width: 250, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Used Count'),        dataIndex: 'used_count',        width: 150, type: Grid.Number, alowEdit: false, editMode: false});
        this.grid.endAddColumns();

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
            text: common.Util.TR('OK'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    if (self.parent == null) {
                        this.up('.window').close();
                    } else {
                        var select = self.grid.getSelectedRow()[0];
                        if (select) {
                            if (!self.target) {
                                self.parent.setSMSScheduleName(select.data.sms_schedule_name);
                            } else {
                                self.target.setValue(select.data.sms_schedule_name);
                            }
                        }
                        this.up('.window').close();
                    }
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
        form.add(panelC);

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.show();

        this.refresh();
    },

    refresh: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Schedule_Manager.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        var edit = Ext.getCmp('cfg_smsschedulemgr_edit');
        if (edit) {
            edit.setDisabled(true);
        }

        WS.SQLExec(dataSet, this.smsScheduleMgrRefresh, this);
    },

    smsScheduleMgrRefresh: function(aheader, adata) {
        this.grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.grid.addRow([
                adata.rows[ix][0],
                adata.rows[ix][1]
            ]);
        }
        this.grid.drawGrid();
    },

    onButtonClick: function(cmd) {
        var schedule_form;
        switch (cmd) {
            case 'Add' :
                schedule_form = Ext.create('config.config_alert_smsschedulemgr_form');
                schedule_form.parent = this;
                schedule_form.init(cmd);
                break;
            case 'Edit' :
                var select = this.grid.getSelectedRow().length;
                if(!select){
                    return;
                }
                schedule_form = Ext.create('config.config_alert_smsschedulemgr_form');
                schedule_form.parent = this;
                schedule_form.sms_schedule_name = this.sms_schedule_name;
                schedule_form.init(cmd);
                break;
            case 'Delete' :
                var self = this;
                var dataSet = {};
                Ext.MessageBox.confirm(common.Util.TR('Delete SMS Schedule'), common.Util.TR('Are you sure you want to delete selected SMS Schedule?'), function(btn) {
                    if (btn === 'yes') {
                        dataSet.sql_file = 'IMXConfig_Schedule_Delete.sql';
                        dataSet.bind = [{
                            name    :   'scheduleName',
                            value   :   self.sms_schedule_name,
                            type : SQLBindType.STRING
                        }];

                        if(common.Util.isMultiRepository()){
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function() {
                            Ext.Msg.alert(common.Util.TR('Delete'), common.Util.TR('Delete succeeded'));
                            self.refresh();
                        }, this);
                    }
                });
                break;
            default:
                break;
        }
    }
});
