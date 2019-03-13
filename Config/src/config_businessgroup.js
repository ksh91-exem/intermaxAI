Ext.define('config.config_businessgroup', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    data: [],
    target: undefined,
    buttons: [common.Util.TR('Add'), common.Util.TR('Save'), common.Util.TR('Delete'), common.Util.TR('Refresh')],
    selectGroupName: '',
    selectRegion: '',
    groupList: [],

    sql: {
        tierDelete      : 'IMXConfig_Delete_Business_Group_Info.sql',
        tierSelectList  : 'IMXConfig_Business_Group_Select_List.sql',
        wasList         : 'IMXConfig_WasInfo.sql',
        bizGroupList    : 'IMXConfig_Business_Group_List.sql',
        // 해당 sql 는 tier_id가 추가된 sql option.conf의 옵션으로 분기쳐서 사용하고 있음.
        tierListAddTierId : 'IMXConfig_Business_Group_List_Add_Tier_Id.sql'
    },

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        this.target = target;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var tierListPanel = this.createTierListPanel();
        var wasListPanel = this.createWasListPanel();

        panel.add(tierListPanel, wasListPanel);

        this.target.add(panel);

        this.onButtonClick('Refresh');
    },

    createTierListPanel: function(){
        var self = this;

        var tierListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            width: 390,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var tierListPanelTitle = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: (common.Menu.isBusinessPerspectiveMonitoring) ? Comm.RTComm.setFont(9, common.Util.TR('Tier List')) : Comm.RTComm.setFont(9, common.Util.TR('Business Group List'))
            }, {
                xtype: 'toolbar',
                width: 130,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_add.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Add'); }
                }, {
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_bizgroupset_edit',
                    scope: this,
                    handler: function() { self.onButtonClick('Edit'); }
                }, {
                    html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                    id: 'cfg_bizgroupset_delete',
                    scope: this,
                    handler: function() { self.onButtonClick('Delete'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var tierListPanelBody = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        tierListPanel.add(tierListPanelTitle);
        tierListPanel.add(tierListPanelBody);

        this.createTierGrid(tierListPanelBody);

        return tierListPanel;
    },

    createWasListPanel: function(){
        var wasListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        var wasListPanelTitle = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Agent List'))
            }]
        });

        var wasListPanelBody = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        wasListPanel.add(wasListPanelTitle);
        wasListPanel.add(wasListPanelBody);

        this.createWasGrid(wasListPanelBody);

        return wasListPanel;
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Add' :
                var bizform = Ext.create('config.config_businessgroup_form');
                bizform.parent = this;
                bizform.init('Add');
                break;
            case 'Edit' :
                bizform = Ext.create('config.config_businessgroup_form');
                bizform.parent = this;
                bizform.groupName = this.tierGrid.getSelectedRow()[0].data.group_name;
                bizform.region    = this.tierGrid.getSelectedRow()[0].data.region;
                bizform.tierId   = this.tierGrid.getSelectedRow()[0].data.tier_id;
                bizform.codeName   = this.tierGrid.getSelectedRow()[0].data.code_name;
                bizform.groupWasList = this.groupWasList;
                bizform.init('Edit');
                break;
            case 'Delete' :
                var self = this;

                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        var dataSet = {};

                        dataSet.sql_file = 'IMXConfig_Delete_Business_Group_Info.sql';

                        dataSet.bind = [{
                            name    :   'group_name',
                            value   :   self.selectGroupName,
                            type    :   SQLBindType.STRING
                        }];

                        dataSet.replace_string = [{
                            name    :   'was_id',
                            value   :   self.groupWasList.join(',')
                        }];

                        if(common.Util.isMultiRepository()){
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function() {
                            setTimeout(function() {
                                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                self.onButtonClick('Refresh');
                            }, 100);
                        }, this);
                    }
                });
                break;
            case 'Refresh' :
                this.tierExecuteSQL();
                this.wasExecuteSQL();
                this.tierListExecuteSQL();

                var edit = Ext.getCmp('cfg_bizgroupset_edit');
                if (edit) {
                    edit.setDisabled(true);
                }

                var del = Ext.getCmp('cfg_bizgroupset_delete');
                if (del) {
                    del.setDisabled(true);
                }

                edit = null;
                del  = null;
                break;
            default :
                break;
        }
    },

    createTierGrid: function(gridPanel) {
        var self = this;
        this.tierGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
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
            multiCheckable: false,
            itemclick:function(dv, record) {
                self.groupClick(record.data);

                var edit = Ext.getCmp('cfg_bizgroupset_edit');
                if (edit) {
                    edit.setDisabled(false);
                }

                var del = Ext.getCmp('cfg_bizgroupset_delete');
                if (del) {
                    del.setDisabled(false);
                }

                edit = null;
                del  = null;
            }
        });

        var tierName = (common.Menu.isBusinessPerspectiveMonitoring) ? common.Util.CTR('Tier') : common.Util.CTR('Business Group');

        this.tierGrid.beginAddColumns();
        this.tierGrid.addColumn({text: tierName,                    dataIndex: 'group_name', width: 150, type: Grid.String, alowEdit: true, editMode: true});
        this.tierGrid.addColumn({text: common.Util.CTR('Region'),   dataIndex: 'region',     width: 150, type: Grid.String, alowEdit: true, editMode: true, hide: true});
        this.tierGrid.addColumn({text: common.Util.CTR('Tier_id'),  dataIndex: 'tier_id',    width: 150, type: Grid.Number, alowEdit: true, editMode: true, hide: true});
        if(common.Menu.isBusinessPerspectiveMonitoring){
            this.tierGrid.addColumn({text: common.Util.CTR('Code Name'),      dataIndex: 'code_name',  width: 150, type: Grid.String, alowEdit: true, editMode: true});
        }
        this.tierGrid.endAddColumns();

        gridPanel.add(this.tierGrid);
    },

    createWasGrid: function(gridPanel) {
        this.wasGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            multiCheckable: true
        });
        gridPanel.add(this.wasGrid);

        this.wasGrid.beginAddColumns();
        this.wasGrid.addColumn({text: common.Util.CTR('Agent ID'),   dataIndex: 'was_id',     width: 100,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.wasGrid.addColumn({text: common.Util.CTR('Agent Name'), dataIndex: 'was_name',   width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.wasGrid.addColumn({text: common.Util.CTR('Group Name'), dataIndex: 'group_name', width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.wasGrid.addColumn({text: common.Util.CTR('Region'),     dataIndex: 'region',     width: 150, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.wasGrid.endAddColumns();
    },

    groupClick: function(d) {
        this.selectGroupName = d['group_name'];
        this.selectRegion    = d['region'];
        this.checkedWas();
    },

    findWas: function(wasId) {
        var result = false;
        var d = null;
        for (var ix = 0; ix < this.groupList.length; ix++) {
            d = this.groupList[ix];
            if (d[1] == this.selectGroupName && d[0] == 'WAS' && d[2] == wasId && d[4] == this.selectRegion) {
                result = true;
                break;
            }
        }
        return result;
    },

    checkedWas: function() {
        var d = null;

        this.wasGrid.unCheckAll();
        this.groupWasList = [];

        // Agent
        for (var ix = 0; ix < this.wasGrid.getRowCount(); ix++) {
            d = this.wasGrid.getRow(ix).data;
            if (this.findWas(d['was_id'])) {
                this.wasGrid.selectRow(ix, true);
                this.groupWasList.push(d['was_id']);
            }
        }
    },

    tierListExecuteSQL: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Group_Select_List.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.groupReloadOnData, this);
    },

    groupReloadOnData: function(aheader, adata) {
        var d = null;

        this.groupList.length = 0;

        for (var ix = 0; ix < adata.rows.length; ix++) {
            d = adata.rows[ix];
            this.groupList.push([
                d[0],               // group_type
                d[1],               // group_name
                parseInt(d[2]),     // group_id
                d[3],               // sub_group_name
                d[4]                // region
            ]);
        }

        for ( ix = 0; ix < this.wasGrid.getRowCount(); ix++) {
            d = this.wasGrid.getRow(ix).data;
            for (var jx = 0; jx < this.groupList.length; jx++) {
                if (this.groupList[jx][2] == d.was_id) {
                    d.group_name = this.groupList[jx][1];   // Group_Name
                    d.region = this.groupList[jx][4];       // Region
                }
            }
        }

        this.wasGrid.drawGrid();
    },

    tierExecuteSQL: function() {
        var dataSet = {};

        if(common.Menu.isBusinessPerspectiveMonitoring){
            dataSet.sql_file = 'IMXConfig_Business_Group_List_Add_Tier_Id.sql';
        } else {
            dataSet.sql_file = 'IMXConfig_Business_Group_List.sql';
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.groupOnData, this);
    },

    groupOnData: function(aheader, adata) {
        this.tierGrid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.tierGrid.addRow([
                adata.rows[ix][0],      // Group_Name
                adata.rows[ix][1],      // Region
                adata.rows[ix][2],      // tier_id
                adata.rows[ix][3]       // code_name
            ]);
        }
        this.tierGrid.drawGrid();
    },

    wasExecuteSQL: function() {
        var dataSet = {};
        var whereList = '1=1';
        var orderBy = 'order by was_name';

        dataSet.sql_file = 'IMXConfig_WasInfo.sql';
        dataSet.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.wasOnData, this);
    },

    wasOnData: function(aheader, adata) {
        this.wasGrid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.wasGrid.addRow([
                adata.rows[ix][0],  // Was_ID
                adata.rows[ix][1]   // Was_Name
            ]);
        }
        this.wasGrid.drawGrid();
    }
});
