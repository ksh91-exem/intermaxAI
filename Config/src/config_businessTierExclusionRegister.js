Ext.define('config.config_businessTierExclusionRegister', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },

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

        var bizListPanel = this.createBizListPanel();

        var exclusionTierListPanel = this.createExclusionTierListPanel();

        panel.add(bizListPanel, exclusionTierListPanel);

        this.target.add(panel);

        this.getBusinessList();
    },

    createBizListPanel: function(){
        var self = this;

        var bizListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var bizListTitle = Ext.create('Ext.panel.Panel', {
            layout    : 'hbox',
            width     : '100%',
            height    : 30,
            border    : false,
            bodyStyle : { background: '#eeeeee' },
            items     : [{
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Business List'))
            }, {
                xtype: 'toolbar',
                width: 70,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                    id: 'cfg_business_tier_exclusion_edit',
                    scope: this,
                    handler: function() {
                        self.bizTierExclusion();
                    }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() {
                        self.getBusinessList();
                    }
                }]
            }]
        });

        var bizListBody = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        bizListPanel.add(bizListTitle);
        bizListPanel.add(bizListBody);

        this.createBizGrid(bizListBody);

        return bizListPanel;
    },

    createExclusionTierListPanel: function(){
        var exclusionTierListPanel = Ext.create('Ext.panel.Panel', {
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

        var exclusionTierListTitle = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('Exclusion Tier List'))
            }]
        });

        var exclusionTierListBody = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        exclusionTierListPanel.add(exclusionTierListTitle);
        exclusionTierListPanel.add(exclusionTierListBody);

        this.createExclusionTierListGrid(exclusionTierListBody);

        return exclusionTierListPanel;
    },

    createBizGrid: function(gridPanel) {
        var self = this;
        this.bizListGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
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
            itemclick:function(dv, record) {
                self.tierIdList = [];
                self.bizId = record.data.business_id;
                self.bizName = record.data.business_name;
                self.bizRowClick(record.data.business_id);
                Ext.getCmp('cfg_business_tier_exclusion_edit').setDisabled(false);
            }
        });

        this.bizListGrid.beginAddColumns();
        this.bizListGrid.addColumn({text: common.Util.CTR('Business ID'),    dataIndex: 'business_id',    width: 100,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.bizListGrid.addColumn({text: common.Util.CTR('Business Name'),  dataIndex: 'business_name',  width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.bizListGrid.endAddColumns();

        gridPanel.add(this.bizListGrid);
    },

    createExclusionTierListGrid: function(gridPanel) {
        this.exclusionTierListGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.SIMPLE,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });

        this.exclusionTierListGrid.beginAddColumns();
        this.exclusionTierListGrid.addColumn({text: common.Util.CTR('Tier ID'),   dataIndex: 'tier_id',   width: 100,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.exclusionTierListGrid.addColumn({text: common.Util.CTR('Tier Name'), dataIndex: 'tier_name', width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.exclusionTierListGrid.endAddColumns();

        gridPanel.add(this.exclusionTierListGrid);
    },

    getBusinessList: function() {
        Ext.getCmp('cfg_business_tier_exclusion_edit').setDisabled(true);
        this.exclusionTierListGrid.clearRows();

        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Get_Business_Name.sql';

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata){
            var ix, ixLen;
            var bizId, bizName, level;
            var bizNameData = adata[0].rows;

            this.bizListGrid.clearRows();
            for ( ix = 0, ixLen = bizNameData.length; ix < ixLen; ix++) {
                bizId    = bizNameData[ix][0];
                bizName  = bizNameData[ix][1];
                level = bizNameData[ix][3];
                if(level === 1){
                    this.bizListGrid.addRow([
                        bizId,  // business_id
                        bizName // business_name
                    ]);
                }
            }
            this.bizListGrid.drawGrid();
        }, this);
    },

    bizRowClick: function(bizId){
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Get_Exclusion_Tier_List.sql';

        dataSet.bind = [{
            name: 'business_id',
            value: bizId,
            type : SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata){
            var ix, ixLen, dataRows;

            this.exclusionTierListGrid.clearRows();
            for ( ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                dataRows = adata.rows[ix];
                this.exclusionTierListGrid.addRow([
                    dataRows[0],    //tier_id
                    dataRows[1]     //tier_name(group_name)
                ]);
                this.tierIdList.push(dataRows[0]);
            }
            this.exclusionTierListGrid.drawGrid();
        }, this);
    },

    bizTierExclusion: function(){
        var dataSet = {};
        var tierIdList = 0;

        dataSet.sql_file = 'IMXConfig_Business_Tier_Info.sql';

        if(this.tierIdList.join() !== ''){
            tierIdList = this.tierIdList.join();
        }

        dataSet.replace_string = [{
            name    : 'tier_id',
            value   : tierIdList
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            var ix, ixLen, title,
                notExclusionTierData        = data[0].rows,
                exclusionTierData           = data[1].rows,
                notExclusionTierDataList    = [],
                exclusionDataTierList       = [];

            for(ix = 0, ixLen = notExclusionTierData.length; ix < ixLen; ix++){
                notExclusionTierDataList.push({id : notExclusionTierData[ix][0], name : notExclusionTierData[ix][1], title : notExclusionTierData[ix][1]});
            }

            for( ix = 0, ixLen = exclusionTierData.length; ix < ixLen; ix++){
                exclusionDataTierList.push({id : exclusionTierData[ix][0], name : exclusionTierData[ix][1], title : exclusionTierData[ix][1]});
            }

            title = common.Util.TR('Selected Business Name') + ' : '  + this.bizName;

            this.showBizTierExclusionWindow(title, notExclusionTierDataList, exclusionDataTierList);
        },this);
    },

    showBizTierExclusionWindow: function(title, notExclusionTierDataList, exclusionDataTierList){
        this.bizTierExclusionWindow = Ext.create('Exem.MoveColumnWindow', {
            width            : 800,
            height           : 500,
            parent           : this,
            title            : title,
            columnInfo       : notExclusionTierDataList,
            useColumnInfo    : exclusionDataTierList,
            orderMode        : true,
            useDefaultBtn    : false,
            leftGridTitle    : common.Util.TR('Not Excluded Tier List'),
            rightGridTitle   : common.Util.TR('Excluded Tier List'),
            okFn             : this.apply
        });

        this.bizTierExclusionWindow.initBase();
    },

    apply: function(storeData){
        var self = this.parent,
            dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Tier_Exclusion_Delete.sql';
        dataSet.bind = [{
            name    : 'business_id',
            value   : self.bizId,
            type    : SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            self.save(storeData, self.bizId);
        }, this);
    },

    save: function(storeData, bizId){
        var dataSet = {},
            ix, ixLen, tierData;


        this.startCount = 0;

        for( ix = 0, ixLen = storeData.getCount(); ix < ixLen; ix++){
            tierData = storeData.getAt(ix).data;
            dataSet.sql_file = 'IMXConfig_Business_Tier_Exclusion_Insert.sql';
            dataSet.bind = [{
                name    : 'business_id',
                value   : bizId,
                type    : SQLBindType.INTEGER
            }, {
                name    : 'tier_id',
                value   : tierData.dataIdx,
                type    : SQLBindType.INTEGER
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            this.exclusionInsert(dataSet, storeData.getCount());
        }

        if(!storeData.getCount()){
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            this.getBusinessList();
            this.bizTierExclusionWindow.close();
        }
    },

    exclusionInsert: function(dataSet, endCount){
        WS.SQLExec(dataSet, function() {
            this.startCount++;
            if(this.startCount === endCount){
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                this.getBusinessList();
                this.bizTierExclusionWindow.close();
            }
        }, this);

    }
});
