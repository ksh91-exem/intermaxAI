Ext.define('config.config_alert_business_statalert', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    sql: {
        bizAlertSet             : 'IMXConfig_Business_Alert_Set.sql',
        bizAlertTagValue        : 'IMXConfig_Business_Alert_Tag_Value.sql',
        bizAlertDelete          : 'IMXConfig_Business_Alert_Delete.sql'
    },

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    init: function() {
        var toolBar = this.createToolBar();

        var titlePanel = this.createTitle();

        var grid = this.createGrid();

        this.target.add(toolBar, titlePanel, grid);
    },

    createToolBar: function() {
        return Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                id: 'cfg_statalert_add' + this.MODE,
                scope: this,
                handler: function() {
                    this.onButtonClick('Add');
                }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_statalert_edit' + this.MODE,
                scope: this,
                handler: function() {
                    this.onButtonClick('Edit');
                }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_statalert_delete' + this.MODE,
                scope: this,
                handler: function() {
                    this.onButtonClick('Delete');
                }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() {
                    this.onButtonClick('Refresh');
                }
            }]
        });
    },

    createTitle: function() {
        this.statAlertPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        this.businessLabel = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Business'))
        });

        this.statAlertPanel.add(this.businessLabel);

        return this.statAlertPanel;
    },

    createGrid: function() {
        this.statAlertGrid = Ext.create('Exem.adminGrid', {
            height: '100%',
            width: '100%',
            flex: 1,
            border: false,
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function() {
                Ext.getCmp('cfg_statalert_edit' + this.MODE).setDisabled( false );
                Ext.getCmp('cfg_statalert_delete' + this.MODE).setDisabled( false );
            }.bind(this)
        });

        this.statAlertGrid.beginAddColumns();
        this.statAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),       dataIndex: 'alert_name', width: 200, type: Grid.String, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('Stat Type'),        dataIndex: 'stat_type',  width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('Comparison'),       dataIndex: 'comparison', width: 100, type: Grid.String, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('Warning'),          dataIndex: 'warning',    width:  80, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('Critical'),         dataIndex: 'critical',   width:  80, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('Repeat'),           dataIndex: 'repeat',     width: 100, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),     dataIndex: 'sms',        width: 150, type: Grid.String, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('Delay Time'),       dataIndex: 'delay_time', width: 100, type: Grid.Number, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('Tier Name'),        dataIndex: 'tier_name',  width: 100, type: Grid.String, alowEdit: true,  editMode: true});
        this.statAlertGrid.addColumn({text: common.Util.CTR('Tier ID'),          dataIndex: 'tier_id',    width: 100, type: Grid.Number, alowEdit: true,  editMode: true, hide: true});
        this.statAlertGrid.endAddColumns();

        return this.statAlertGrid;
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                this.onAdd();
                break;
            case 'Edit' :
                this.onEdit();
                break;
            case 'Delete' :
                this.onDelete();
                break;
            case 'Refresh' :
                this.onRefresh();
                break;
            default :
                break;
        }
    },

    onAdd: function() {
        var statalert_form = Ext.create('config.config_alert_business_statalert_form');
        statalert_form.parent = this;
        statalert_form.init('Add');
    },

    onEdit: function() {
        var d = this.statAlertGrid.getSelectedRow()[0].data;

        var statalert_form = Ext.create('config.config_alert_business_statalert_form');
        statalert_form.parent         = this;
        statalert_form.stat_type      = d.stat_type;
        statalert_form.alert_name     = d.alert_name;
        statalert_form.comparison     = d.comparison;
        statalert_form.repeat         = d.repeat;
        statalert_form.warning_value  = d.warning;
        statalert_form.critical_value = d.critical;
        statalert_form.sms_schedule   = d.sms;
        statalert_form.delay_time     = d.delay_time;
        statalert_form.tier_id        = d.tier_id;
        statalert_form.tier_name      = d.tier_name;
        statalert_form.init('Edit');
    },

    onDelete: function() {
        var selectData = this.statAlertGrid.getSelectedRow()[0].data;

        if (selectData) {
            Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                var dataSet = {};

                if (btn === 'yes') {
                    dataSet.sql_file = 'IMXConfig_Business_Alert_Delete.sql';

                    dataSet.bind = [{
                        name    : 'business_id',
                        value   : cfg.alert.sltId,
                        type    : SQLBindType.INTEGER
                    }, {
                        name    : 'alert_type',
                        value   : 'Stat Alert',
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'alert_resource_name',
                        value   : selectData.alert_name,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'tier_id',
                        value   : selectData.tier_id,
                        type    : SQLBindType.INTEGER
                    }];

                    if (common.Util.isMultiRepository()) {
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    WS.SQLExec(dataSet, function() {
                        this.onRefresh();
                    }, this);
                }
            }.bind(this));
        }
    },

    onRefresh: function() {
        this.statAlertPanel.items.items[0].update(Comm.RTComm.setFont(9, common.Util.TR('Business')) + ' (' + cfg.alert.sltName + ')');

        this.setQuery();
        Ext.getCmp('cfg_statalert_edit' + this.MODE).setDisabled(true);
        Ext.getCmp('cfg_statalert_delete' + this.MODE).setDisabled(true);

    },

    setQuery: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Alert_Set.sql';
        dataSet.bind = [{
            name: 'business_id',
            value: cfg.alert.sltId,
            type : SQLBindType.INTEGER
        },{
            name: 'alert_type',
            value: 'Stat Alert',
            type : SQLBindType.STRING
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.setQueryResult, this);
    },

    setQueryResult: function(aheader, adata) {
        var ix, ixLen;
        this.setData = [];

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            this.setData.push(adata.rows[ix]);
        }

        this.tagValueQuery();
    },

    tagValueQuery: function() {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Business_Alert_Tag_Value.sql';
        dataSet.bind = [{
            name: 'business_id',
            value: cfg.alert.sltId,
            type : SQLBindType.INTEGER
        },{
            name: 'alert_type',
            value: 'Stat Alert',
            type : SQLBindType.STRING
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.tagValueQueryResult, this);
    },

    tagValueQueryResult: function(aheader, adata) {
        var ix, ixLen, jx, jxLen, kx, kxLen, gridDataList,
            resourceData, dataRow, alertName, bizSetData, viewGridDataKey, tierId, gridKey,
            bizId = cfg.alert.sltId,
            gridKeyList = [];

        this.viewGridData = {};

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            resourceData = adata.rows[ix][2];
            tierId = adata.rows[ix][5];

            viewGridDataKey = resourceData + '_' + tierId;

            if (gridKeyList.indexOf(viewGridDataKey) === -1) {
                gridKeyList.push(viewGridDataKey);
                this.viewGridData[viewGridDataKey] = {};
            }
        }


        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            dataRow = adata.rows[ix];
            for (jx = 0, jxLen = gridKeyList.length; jx < jxLen; jx++) {
                gridKey = gridKeyList[jx];
                alertName = gridKey.split('_')[0];
                tierId = gridKey.split('_')[1];
                if (dataRow[0] === bizId && dataRow[2] === alertName && dataRow[5] === +tierId) {
                    switch (dataRow[3]) {
                        case 'COMPARISON'     : this.viewGridData[gridKey].comparison     = dataRow[4];
                            break;
                        case 'CRITICAL_VALUE' : this.viewGridData[gridKey].critical_value = dataRow[4];
                            break;
                        case 'REPEAT'         : this.viewGridData[gridKey].repeat         = dataRow[4];
                            break;
                        case 'STAT_TYPE'      : this.viewGridData[gridKey].stat_type      = dataRow[4];
                            break;
                        case 'WARNING_VALUE'  : this.viewGridData[gridKey].warning_value  = dataRow[4];
                            break;
                        case 'DELAY_TIME'     : this.viewGridData[gridKey].delay_time     = dataRow[4];
                            break;
                        default :
                            break;
                    }
                }

                for (kx = 0, kxLen = this.setData.length; kx < kxLen; kx++) {
                    bizSetData = this.setData[kx];
                    if (bizSetData[0] === bizId && bizSetData[1] === 'Stat Alert' &&
                        bizSetData[2] === alertName && bizSetData[6] === +tierId) {
                        this.viewGridData[gridKey].sms_schedule   = bizSetData[3];
                        this.viewGridData[gridKey].tier_name      = bizSetData[5];
                        this.viewGridData[gridKey].tier_id        = bizSetData[6];
                    }
                }
            }
        }

        this.statAlertGrid.clearRows();

        gridDataList = Object.keys(this.viewGridData);

        for (ix = 0, ixLen = gridDataList.length; ix < ixLen; ix++) {
            this.statAlertGrid.addRow([
                gridDataList[ix].split('_')[0],
                this.viewGridData[gridDataList[ix]].stat_type,
                this.viewGridData[gridDataList[ix]].comparison,
                parseInt(this.viewGridData[gridDataList[ix]].warning_value),
                parseInt(this.viewGridData[gridDataList[ix]].critical_value),
                parseInt(this.viewGridData[gridDataList[ix]].repeat),
                this.viewGridData[gridDataList[ix]].sms_schedule,
                this.viewGridData[gridDataList[ix]].delay_time ? parseInt(this.viewGridData[gridDataList[ix]].delay_time) : 0,
                this.viewGridData[gridDataList[ix]].tier_name,
                this.viewGridData[gridDataList[ix]].tier_id
            ]);
        }

        this.statAlertGrid.drawGrid();
    }
});
