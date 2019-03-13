Ext.define('config.config_sms_destination_agent_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        var self = this;
        this.target = target;

        var panelText, gridText;

        if(common.Menu.isBusinessPerspectiveMonitoring){
            panelText   = common.Util.TR('Tier List');
            gridText    = common.Util.TR('Tier');
        } else{
            panelText   = common.Util.TR('Business Group List');
            gridText    = common.Util.TR('Business Group');
        }

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        var group_list_panel = Ext.create('Ext.panel.Panel', {
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

        var group_list_panel_title = Ext.create('Ext.panel.Panel', {
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
                html: Comm.RTComm.setFont(9, panelText)
            }, {
                xtype: 'toolbar',
                width: 70,
                height: 30,
                border: false,
                items: [{
                    html: '<img src="../images/cfg_save.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Save'); }
                }, '-', {
                    html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                    scope: this,
                    handler: function() { self.onButtonClick('Refresh'); }
                }]
            }]
        });

        var group_list_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        group_list_panel.add(group_list_panel_title);
        group_list_panel.add(group_list_panel_body);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        var was_list_panel = Ext.create('Ext.panel.Panel', {
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

        var was_list_panel_title = Ext.create('Ext.panel.Panel', {
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

        var was_list_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        was_list_panel.add(was_list_panel_title);
        was_list_panel.add(was_list_panel_body);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        this._createServiceGrid(group_list_panel_body, gridText);
        this._createWasGrid(was_list_panel_body, gridText);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        panel.add(group_list_panel);
        panel.add(was_list_panel);

        this.target.add(panel);

        this.onButtonClick('Refresh');
    },

    _createServiceGrid: function(grid_panel, gridText) {
        var self = this;
        this.group_grid = Ext.create('Exem.adminGrid', {
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
            cellclick:function(thisGrid, td, cellIndex, record) {
                if (cellIndex == 2) {
                    if (record.get('sms_enable') == 1) {
                        if(record.dirty){
                            record.set('sms_enable',record.previousValues.sms_enable);
                        } else{
                            record.set('sms_enable', 0);
                        }
                    } else {
                        record.set('sms_enable', 1);
                    }
                }
                self.groupClick(record.data);
            }
        });
        grid_panel.add(this.group_grid);

        this.group_grid.beginAddColumns();
        this.group_grid.addColumn({text: gridText                       , dataIndex: 'group_name', width: 150, type: Grid.String, alowEdit: true, editMode: true});
        this.group_grid.addColumn({text: common.Util.CTR('Use Status')  , dataIndex: 'sms_enable', width: 100, type: Grid.String, alowEdit: true,  editMode: true,
            renderer: function(v, m, r) {

                if (r.get('sms_enable') == 0 || r.get('sms_enable') == null) {
                    return '<div class="x-toggle-slide-container" style="width: 92px; top : -3px;">' +
                        '<div style="left: 0px; z-index: 10000; width: 39px;" class="x-toggle-slide-thumb" ></div><div class="holder">' +
                        '<label class="x-toggle-slide-label-on" style="width: 68.5px; margin-left: -45px;"><span style="font-size:8pt;">'+common.Util.TR('ON')+'</span></label>' +
                        '<label class="x-toggle-slide-label-off" style="width: 68.5px;"><span><span style="font-size:8pt;">'+common.Util.TR('OFF')+'</span></span></label></div></div>';
                } else {
                    return '<div class="x-toggle-slide-container" style="width: 92px; top : -3px;">' +
                        '<div style="left: 45px; z-index: 10000; width: 39px;" class="x-toggle-slide-thumb" ></div><div class="holder">' +
                        '<label class="x-toggle-slide-label-on" style="width: 68.5px; margin-left: 0px;"><span><span style="font-size:8pt;">'+common.Util.TR('ON')+'</span></span></label>' +
                        '<label class="x-toggle-slide-label-off" style="width: 68.5px;"><span><span style="font-size:8pt;">'+common.Util.TR('OFF')+'</span></span></label></div></div>';
                }
            }
        });
        this.group_grid.endAddColumns();
    },

    _createWasGrid: function(grid_panel, gridText) {
        this.was_grid = Ext.create('Exem.adminGrid', {
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
        grid_panel.add(this.was_grid);

        this.was_grid.beginAddColumns();
        this.was_grid.addColumn({text: common.Util.CTR('Agent ID')   , dataIndex: 'was_id'      , width: 100, type: Grid.StringNumber , alowEdit: false, editMode: false});
        this.was_grid.addColumn({text: common.Util.CTR('Agent Name') , dataIndex: 'was_name'    , width: 150, type: Grid.String       , alowEdit: false, editMode: false});
        this.was_grid.addColumn({text: common.Util.CTR('Use Status') , dataIndex: 'sms_enable'  , width: 100, type: Grid.CheckBox     , alowEdit: true , editMode: true});
        this.was_grid.addColumn({text: gridText                      , dataIndex: 'group_name'  , width: 100, type: Grid.String       , alowEdit: false ,editMode: false});
        this.was_grid.endAddColumns();

        this.was_grid.baseStore.addListener('update', function(thisGrid, record){
            if(this.opacity[record.data.was_id] && record.dirty){
                record.set('sms_enable',record.previousValues.sms_enable);
                for (var ix = 0; ix < this.was_grid.getRowCount(); ix++) {
                    if(record.data.was_id === this.was_grid.getRow(ix).data.was_id){
                        this.was_grid.baseGrid.getView().all.elements[ix]["style"].opacity = 0.3;
                    }
                }
            }
        },this);
    },

    onButtonClick: function(cmd) {
        switch (cmd) {
            case 'Save' :
                this.save();
                break;
            case 'Refresh' :
                this.onRefreshGroup();
                this.onRefreshWas();
                break;
            default :
                break;
        }
    },

    onRefreshGroup: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Destination_Group_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onDataGroup, this);
    },

    onDataGroup: function(aheader, adata) {
        this.group_grid.clearRows();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.group_grid.addRow([
                adata.rows[ix][0],
                adata.rows[ix][1]
            ]);
        }
        this.group_grid.drawGrid();
    },

    onRefreshWas: function() {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Destination_Server_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onDataWas, this);
    },

    groupWasOpacity: function(){
        this.opacity = {};
        for (var ix = 0; ix < this.was_grid.getRowCount(); ix++) {
            for(var jx = 0; jx < this.group_grid.getRowCount(); jx++){
                if(this.was_grid.getRow(ix).data.group_name === this.group_grid.getRow(jx).data.group_name){
                    if(!this.group_grid.getRow(jx).data.sms_enable){
                        this.was_grid.baseGrid.getView().all.elements[ix]["style"].opacity = 0.3;
                        this.opacity[this.was_grid.getRow(ix).data.was_id] = true;
                    } else {
                        this.was_grid.baseGrid.getView().all.elements[ix]["style"].opacity = 1;
                    }
                }
            }
        }
    },

    onDataWas: function(aheader, adata) {
        var ix, ixLen;

        this.was_grid.clearRows();

        if(aheader.command ==='IMXConfig_SMS_Destination_Reload_Server_Info.sql'){
            var allData,
                selectGroup = adata[0].rows,
                otherGroup  = adata[1].rows,
                noGroup     = adata[2].rows;

            allData = selectGroup.concat(otherGroup,noGroup);

            for (ix = 0, ixLen = allData.length; ix < ixLen ; ix++) {

                this.was_grid.addRow([
                    allData[ix][0],
                    allData[ix][1],
                    allData[ix][2],
                    allData[ix][3]
                ]);
            }
            this.was_grid.drawGrid();
            ///////////////////////////////////////////////////////////////////////////
            var dataSet = {};

            dataSet.sql_file = 'IMXConfig_SMS_Destination_Group_Select_Was_List.sql';

            dataSet.bind = [{
                name    : 'group_name',
                value   : aheader.parameters.bind[0].value,
                type    : SQLBindType.STRING
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, this.groupSelectWasList, this);
        } else {
            for (ix = 0, ixLen = adata.rows.length; ix < ixLen ; ix++) {
                this.was_grid.addRow([
                    adata.rows[ix][0],
                    adata.rows[ix][1],
                    adata.rows[ix][2],
                    adata.rows[ix][3]
                ]);
            }
            this.was_grid.drawGrid();
        }

        this.groupWasOpacity();
    },

    groupClick: function(data) {
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Destination_Reload_Server_Info.sql';

        dataSet.bind = [{
            name    : 'group_name',
            value   : data.group_name,
            type    : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, this.onDataWas, this);
    },

    groupSelectWasList : function(aheader, adata) {
        var ix, ixLen, jx, jxLen, wasData, serverID;

        this.was_grid.unCheckAll();

        for ( ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++ ) {
            serverID = adata.rows[ix][0];
            for ( jx = 0, jxLen = this.was_grid.getRowCount(); jx < jxLen; jx++ ) {
                wasData = this.was_grid.getRow(jx).data;
                if(serverID == wasData.was_id){
                    this.was_grid.selectRow(jx, true);
                }
            }
        }
    },

    save: function(){
        var ix, ixLen, dataSet = {},
            wasIDList = [],
            wasModified = this.was_grid.getModified(),
            groupModified = this.group_grid.getModified();

        if( wasModified.length == 0 && groupModified.length == 0 ){
            return;
        }


        if(wasModified.length == 0 && groupModified.length) {
            //Only Group
            this.groupDataCheck(groupModified);
        } else{
            //Only Was or Group in Was
            for(ix = 0, ixLen = wasModified.length; ix < ixLen; ix++){
                wasIDList.push(wasModified[ix].data.was_id);
            }
            dataSet.sql_file = 'IMXConfig_SMS_Destination_Delete.sql';

            dataSet.replace_string = [{
                name    : 'server_id',
                value   : wasIDList.join(',')
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }
            WS.SQLExec(dataSet, function(){}, this);

            this.groupWasInsert();
        }
    },

    groupWasInsert: function(){
        var ix, ixLen, jx, jxLen, wasData, groupData,
            dataSet = {},
            wasModified = this.was_grid.getModified();

        this.count = 0;

        dataSet.sql_file = 'IMXConfig_SMS_Destination_Insert.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        for(ix = 0, ixLen = wasModified.length; ix < ixLen; ix++){
            wasData = wasModified[ix].data;

            if(wasData.sms_enable){
                wasData.sms_enable = 1;
            } else{
                wasData.sms_enable = 0;
            }

            for(jx = 0, jxLen = this.group_grid.getRowCount(); jx < jxLen; jx++){
                groupData = this.group_grid.getRow(jx).data;

                if(groupData.sms_enable){
                    groupData.sms_enable = 1;
                } else {
                    groupData.sms_enable = 0;
                }

                if(wasData.group_name === groupData.group_name){
                    //Group in Was
                    dataSet.bind = [{
                        name    : 'group_name',
                        value   : groupData.group_name,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'server_id',
                        value   : wasData.was_id,
                        type    : SQLBindType.INTEGER
                    }, {
                        name    : 'group_enable',
                        value   : groupData.sms_enable,
                        type    : SQLBindType.INTEGER
                    }, {
                        name    : 'server_enable',
                        value   : wasData.sms_enable,
                        type    : SQLBindType.INTEGER
                    }];

                    WS.SQLExec(dataSet, this.saveRefresh, this);
                }
            }

            if(!wasData.group_name){
                //Only Was
                dataSet.bind = [{
                    name    : 'group_name',
                    value   : null,
                    type    : SQLBindType.STRING
                }, {
                    name    : 'server_id',
                    value   : wasData.was_id,
                    type    : SQLBindType.INTEGER
                }, {
                    name    : 'group_enable',
                    value   : 0,
                    type    : SQLBindType.INTEGER
                }, {
                    name    : 'server_enable',
                    value   : wasData.sms_enable,
                    type    : SQLBindType.INTEGER
                }];

                WS.SQLExec(dataSet, this.saveRefresh, this);
            }
        }
    },

    saveRefresh: function(){
        this.count++;
        if(this.count === this.was_grid.getModified().length){
            var groupModified = this.group_grid.getModified();
            this.onRefreshWas();

            //insert 후 Group Check
            if(groupModified.length){
                this.groupDataCheck(groupModified);
            } else{
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            }
        }
    },

    groupDataCheck: function(groupModified){
        var ix, ixLen, dataSet = {};
        this.groupCount = 0;

        for (ix = 0, ixLen = groupModified.length; ix < ixLen; ix++) {
            dataSet.sql_file = 'IMXConfig_SMS_Destination_Info.sql';

            dataSet.bind = [{
                name    : 'group_name',
                value   : groupModified[ix].data.group_name,
                type    : SQLBindType.STRING
            }];

            if (common.Util.isMultiRepository()) {
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }
            WS.SQLExec(dataSet, this.groupUpdateInsert, this);
        }
    },

    groupUpdateInsert: function(header,data){
        var ix, ixLen, groupData, dataSet = {},
            groupModified = this.group_grid.getModified(),
            selectGroup = header.parameters.bind[0].value;

        if(data.rows.length){
            for (ix = 0, ixLen = groupModified.length; ix < ixLen; ix++) {
                groupData = groupModified[ix].data;

                dataSet.sql_file = 'IMXConfig_SMS_Destination_Update.sql';

                if(selectGroup == groupData.group_name){
                    dataSet.bind = [{
                        name    : 'group_name',
                        value   : selectGroup,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'group_enable',
                        value   : groupData.sms_enable,
                        type    : SQLBindType.INTEGER
                    }];

                    if (common.Util.isMultiRepository()) {
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    WS.SQLExec(dataSet, this.getGroupWasList(selectGroup), this);
                }
            }
        } else{
            this.getGroupWasList(selectGroup);
        }
    },

    getGroupWasList : function(selectGroup){
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_SMS_Destination_Group_Was_List.sql';

        dataSet.bind = [{
            name    : 'group_name',
            value   : selectGroup,
            type    : SQLBindType.STRING
        }];

        if (common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function (header, data) {
            this.groupInsert(selectGroup, data.rows);
        }, this);
    },

    groupInsert : function(selectGroup, serverList){
        var ix, ixLen, jx, jxLen,
            dataSet = {}, groupData,
            groupModified = this.group_grid.getModified();

        this.groupCount++;

        for (ix = 0, ixLen = groupModified.length; ix < ixLen; ix++) {
            groupData = groupModified[ix].data;

            dataSet.sql_file = 'IMXConfig_SMS_Destination_Insert.sql';

            if(selectGroup === groupData.group_name){
                for(jx = 0, jxLen = serverList.length; jx < jxLen; jx++){
                    if(serverList[jx][1] === null){
                        dataSet.bind = [{
                            name    : 'group_name',
                            value   : selectGroup,
                            type    : SQLBindType.STRING
                        }, {
                            name    : 'server_id',
                            value   : serverList[jx][0],
                            type    : SQLBindType.INTEGER
                        }, {
                            name    : 'group_enable',
                            value   : groupData.sms_enable,
                            type    : SQLBindType.INTEGER
                        }, {
                            name    : 'server_enable',
                            value   : 0,
                            type    : SQLBindType.INTEGER
                        }];

                        if (common.Util.isMultiRepository()) {
                            dataSet.database = cfg.repositoryInfo.currentRepoName;
                        }

                        WS.SQLExec(dataSet, function () {
                            if(groupModified.length === this.groupCount){
                                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                                this.onRefreshGroup();
                            }
                        }, this);
                    } else if (jx +1 === jxLen && groupModified.length === this.groupCount){
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                        this.onRefreshGroup();
                    }
                }
            }
        }
    }
});
