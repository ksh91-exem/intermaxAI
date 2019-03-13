Ext.define('config.config_businessgroup_form', {
    groupName: '',

    sql: {
        wasList         : 'IMXConfig_WasInfo.sql',
        groupList       : 'IMXConfig_Business_Group_List.sql',

        //group_id로 전부 delete
        deleteBizGroupByGroupId   : 'IMXConfig_Delete_Update_Business_Group_Info.sql',
        //update시 group_name 으로 delete
        deleteBizGroupByGroupName : 'IMXConfig_Delete_Only_Business_Group_Info.sql',

        groupInsert     : 'IMXConfig_Insert_Business_Group_Info.sql',
        groupUpdate     : 'IMXConfig_Business_Group_Update.sql',

        //티어 정보 컬럼이 추가된 sql, option.conf의 옵션으로 분기쳐서 사용하고 있음.
        tierInsert      : 'IMXConfig_Insert_Business_Group_Info_Add_Tier_Id.sql',
        maxTierId       : 'IMXConfig_Get_Max_Business_Group_Tier_Id.sql',
        tierList        : 'IMXConfig_Business_Group_List_Add_Tier_Id.sql',

        //sortKey 값을 유지 및 Update 할 SQL
        getSortKey      : 'IMXConfig_Get_Business_Group_Sort_Key.sql',
        updateSortKey   : 'IMXConfig_Update_Business_Group_Sort_Key.sql'
    },

    init: function(_state_) {
        this.mode = _state_;

        var window = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 400,
            height: 500,
            resizable: false,
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var bodyPanel = this.createBodyPanel();
        var buttonPanel = this.createButtonPanel();

        window.add(bodyPanel, buttonPanel);

        if(common.Menu.isBusinessPerspectiveMonitoring){
            if (this.mode == 'Add') {
                window.setTitle(common.Util.TR('Add Tier'));
            } else {
                window.setTitle(common.Util.TR('Edit Tier'));
            }
        } else{
            if (this.mode == 'Add') {
                window.setTitle(common.Util.TR('Add Business Group'));
            } else {
                window.setTitle(common.Util.TR('Edit Business Group'));
            }
        }

        window.show();
        this.groupNameEdit.focus();

        this.wasLoad();
    },

    createBodyPanel: function(){
        var bodyPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var nameEditPanel = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 70,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.groupNameEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10,
            width: 370,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: (common.Menu.isBusinessPerspectiveMonitoring) ? Comm.RTComm.setFont(9, common.Util.CTR('Tier')) : Comm.RTComm.setFont(9, common.Util.CTR('Group Name')),
            allowBlank: true
        });

        this.codeNameEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 37,
            width: 370,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 20,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Code Name')),
            allowBlank: true
        });

        nameEditPanel.add(this.groupNameEdit);
        nameEditPanel.add(this.codeNameEdit);

        var gridPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.wasGrid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });
        gridPanel.add(this.wasGrid);

        this.wasGrid.beginAddColumns();
        this.wasGrid.addColumn({text: common.Util.CTR('Agent ID')  , dataIndex: 'was_id',     width: 100,  type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.wasGrid.addColumn({text: common.Util.CTR('Agent Name'), dataIndex: 'was_name',   width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.wasGrid.endAddColumns();

        bodyPanel.add(nameEditPanel, gridPanel);

        return bodyPanel;
    },

    createButtonPanel: function(){
        var self = this;

        var buttonPanel = Ext.create('Ext.panel.Panel', {
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

        this.OKButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Save'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.OKButton.setDisabled(true);
                    self.fieldCheck() ;
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

        buttonPanel.add(this.OKButton, this.CancelButton);

        return buttonPanel;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    editWasLoad: function() {
        this.groupNameEdit.setValue(this.groupName);
        this.codeNameEdit.setValue(this.codeName);

        var select = this.parent.wasGrid.getSelectedRow();
        for (var ix = 0; ix < this.wasGrid.getRowCount(); ix++) {
            for (var jx = 0; jx < select.length; jx++) {
                if (this.wasGrid.getRow(ix).data.was_id == select[jx].data.was_id) {
                    this.wasGrid.selectRow(ix, true);
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    wasLoad: function() {
        var self = this;
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

        WS.SQLExec(dataSet, function(aheader, adata) {
            self.wasGrid.clearRows();
            if (adata.rows != undefined) {
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    self.wasGrid.addRow([
                        adata.rows[ix][0],
                        adata.rows[ix][1]
                    ]);
                }
                self.wasGrid.drawGrid();

                if (self.mode == 'Edit') {
                    self.editWasLoad();
                }
            }
        }, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    fieldCheck: function() {
        var self = this ;
        var parentGroupName = this.groupName;
        var groupName = this.groupNameEdit.getValue();
        var select_count = this.wasGrid.getSelectedRow().length;
        var dataSet = {};

        if (groupName == '') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter group name'));
            this.groupNameEdit.focus() ;
            self.OKButton.setDisabled(false);
            return ;
        }


        if (select_count == 0) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please select WAS.'));
            self.OKButton.setDisabled(false);
            return ;
        }


        //1506.10 기존에 있는지도 검사하는 로직 추가 min
        if(common.Menu.isBusinessPerspectiveMonitoring){
            dataSet.sql_file = 'IMXConfig_Business_Group_List_Add_Tier_Id.sql';
        } else{
            dataSet.sql_file = 'IMXConfig_Business_Group_List.sql';
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            var ix, tierId, dataSet = {};
            for ( ix = 0; ix < adata.rows.length; ix++ ){
                //자기 자신은 제외.(edit 처리)
                if( adata.rows[ix][0] === parentGroupName ){
                    continue;
                }
                if ( adata.rows[ix][0] == groupName ) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Group name is already registered.'));
                    self.OKButton.setDisabled(false);
                    return;
                }
            }

            if(common.Menu.isBusinessPerspectiveMonitoring){
                dataSet.sql_file = 'IMXConfig_Get_Max_Business_Group_Tier_Id.sql';

                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                WS.SQLExec(dataSet, function(aheader, adata) {
                    if(this.mode === 'Add'){
                        tierId = adata.rows[0][0];
                    } else {
                        tierId = this.tierId;
                    }
                    this.sortKeyKeep(this.groupName, groupName, tierId);
                },this);
            } else{
                this.sortKeyKeep(this.groupName, groupName);
            }

        }, this);
    },

    deleteInsert: function(tierId){
        //변경되기전이름으로 delete 후 다시 insert 하는 방식.
        //여기선 delete만 시키고 save() 호출하여 insert.
        var dataSet = {};
        var ix;
        var groupIDArray = [];
        var currentSelect = this.wasGrid.getSelectedRow();

        for( ix = 0; ix < currentSelect.length; ix++){
            groupIDArray.push(currentSelect[ix].data.was_id);
        }

        dataSet.sql_file = 'IMXConfig_Delete_Update_Business_Group_Info.sql';

        dataSet.replace_string = [{
            name    :   'group_id',
            value   :   groupIDArray.join(',')
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(){
            if(this.mode == 'Add'){
                this.save(tierId);
            } else {
                var dataSet = {};

                dataSet.sql_file = 'IMXConfig_Delete_Only_Business_Group_Info.sql';

                dataSet.bind = [{
                    name    :   'group_name',
                    value   :   this.groupName,
                    type    :   SQLBindType.STRING
                }];

                dataSet.replace_string = [{
                    name    :   'was_id',
                    value   :   this.groupWasList.join(',')
                }];

                if(common.Util.isMultiRepository()){
                    dataSet.database = cfg.repositoryInfo.currentRepoName;
                }

                WS.SQLExec(dataSet, function() {
                    this.save(tierId) ;
                }, this);
            }
        }, this ) ;
    },

    /**
     * xapm_rtm_sort_key 테이블 데이터가 xapm_business_group_info 테이블의 delete 트리거에 의해서
     * 삭제가 되는 현상이 있어 데이터 유지를 위해서 추가됨.
     * update 이면 유지. 아닐경우 유지 하지 않음.
     * groupName으로 가져오므로 update에만 반영.
     */
    sortKeyKeep: function(parentGroupName, currentGroupName, tierId){
        var ix,ixLen,
            sortId, sortSeq, userId, serviceId,
            dataSet = {};

        this.sortKeepData = [];
        dataSet.sql_file = 'IMXConfig_Get_Business_Group_Sort_Key.sql';

        dataSet.bind = [{
            name    :   'groupName',
            value   :   parentGroupName,
            type    :   SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                sortId      =   currentGroupName;
                sortSeq     =   adata.rows[ix][1];
                userId      =   adata.rows[ix][2];
                serviceId   =   adata.rows[ix][3];

                this.sortKeepData.push({
                    id          :   sortId,
                    seq         :   sortSeq,
                    userId      :   userId,
                    serviceId   :   serviceId
                });
            }
            this.deleteInsert(tierId);
        }, this);
    },

    save: function(tierId) {
        var dataSet     = {};
        var groupName   = this.groupNameEdit.getValue();
        var codeName    = this.codeNameEdit.getValue();
        var ixLen       = this.wasGrid.getSelectedRow().length;
        var ix;

        //byte check
        var groupNameByteLen = this.getTextLength(groupName);

        if(groupNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.groupNameEdit.focus();
            this.OKButton.setDisabled(false);
            return;
        }

        var codeNameByteLen = this.getTextLength(codeName);

        if(codeNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.codeNameEdit.focus();
            this.OKButton.setDisabled(false);
            return;
        }

        var serverIDList = [];
        for (ix = 0; ix < ixLen; ix++) {
            var d = this.wasGrid.getSelectedRow()[ix].data;
            if(common.Menu.isBusinessPerspectiveMonitoring){
                dataSet.sql_file = 'IMXConfig_Insert_Business_Group_Info_Add_Tier_Id.sql';
                dataSet.bind = [{
                    name    :   'group_name',
                    value   :   groupName,
                    type    :   SQLBindType.STRING
                }, {
                    name    :   'region',
                    value   :   null,
                    type    :   SQLBindType.STRING
                }, {
                    name    :   'tier_id',
                    value   :   tierId,
                    type    :   SQLBindType.INTEGER
                }, {
                    name    :   'code_name',
                    value   :   codeName,
                    type    :   SQLBindType.STRING
                }, {
                    name    :   'was_id',
                    value   :   d.was_id,
                    type    :   SQLBindType.INTEGER
                }];

            } else{
                dataSet.sql_file = 'IMXConfig_Insert_Business_Group_Info.sql';
                dataSet.bind = [{
                    name    :   'group_name',
                    value   :   groupName,
                    type    :   SQLBindType.STRING
                }, {
                    name    :   'region',
                    value   :   null,
                    type    :   SQLBindType.STRING
                }, {
                    name    :   'was_id',
                    value   :   d.was_id,
                    type    :   SQLBindType.INTEGER
                }];
            }

            d.start = ix+1;
            d.end = ixLen;

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            this.insertBusinessGroup(dataSet,d);

            serverIDList.push(d.was_id);
        }

        dataSet = {};

        dataSet.sql_file = 'IMXConfig_Business_Group_Update.sql';
        dataSet.bind = [{
            name    :   'group_name',
            value   :   groupName,
            type    :   SQLBindType.STRING
        }, {
            name    :   'parent_group_name',
            value   :   this.groupName,
            type    :   SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name    :   'server_id',
            value   :   serverIDList.join(',')
        }];
        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(){}, this);
    },

    getTextLength : function(str){
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            if (encodeURI(str.charAt(i)).length == 9) {
                //DB가 UTF-8 일경우 한글 byte는 3byte 취급.
                len += 2;
            }
            len++;
        }
        return len;
    },

    insertBusinessGroup : function(dataSet,d){
        var self = this ;
        WS.SQLExec(dataSet, function() {
            if(d.start === d.end) {
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                self.parent.onButtonClick('Refresh');
                self.CancelButton.fireHandler('click');
                setTimeout(function(){
                    self.saveSortKey();
                }, 100);
            }
        }, this);
    },

    saveSortKey: function() {
        var ix, ixLen,
            dataSet = {};

        var insertSortKey = function(dataSet){
            WS.SQLExec(dataSet, function(){}, this);
        };

        for (ix = 0, ixLen = this.sortKeepData.length; ix < ixLen; ix++) {
            dataSet.sql_file = 'IMXConfig_Update_Business_Group_Sort_Key.sql';

            if (common.Util.isMultiRepository()) {
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            dataSet.bind = [{
                name: 'id',
                value: this.sortKeepData[ix].id,
                type: SQLBindType.STRING
            }, {
                name: 'seq',
                value: this.sortKeepData[ix].seq,
                type: SQLBindType.INTEGER
            }, {
                name: 'userId',
                value: this.sortKeepData[ix].userId,
                type: SQLBindType.INTEGER
            }, {
                name: 'serviceId',
                value: this.sortKeepData[ix].serviceId,
                type: SQLBindType.INTEGER
            }];

            insertSortKey(dataSet);
        }
    }
});
