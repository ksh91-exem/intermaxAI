Ext.define('config.config_alertBusinessTxnName_form', {

    parent: null,
    select_businessid: '',
    select_businessname: '',
    keepRowsData : [],
    initCheck : true,

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 700,
            height: 600,
            resizable: true,
            title: common.Util.TR('Business Transaction Name'),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        self.form = form;

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 94,
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
            html: Comm.RTComm.setFont(9, common.Util.TR('Business'))
        });

        panelA1.add(labelA);

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var idLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 85,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('ID'))
        });

        this.idEdit = Ext.create('Ext.form.field.Text', {
            x: 95,
            y: 10,
            width: '80%',
            disabled: true
        });

        var nameLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 37,
            width: 85,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Business Name'))
        });

        this.nameEdit = Ext.create('Ext.form.field.Text', {
            x: 95,
            y: 35,
            width: '80%',
            maxLength : 64,
            enforceMaxLength : true
        });

        panelA2.add(idLabel);
        panelA2.add(this.idEdit);
        panelA2.add(nameLabel);
        panelA2.add(this.nameEdit);

        panelA.add(panelA1);
        panelA.add(panelA2);

        var panelB = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
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

        var labelB = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('Transaction List'))
        });

        panelB1.add(labelB);

        var panelB2 = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            margin: '2 2 2 2',
            padding: '1 1 1 1',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelB21 = Ext.create('Ext.panel.Panel', {
            layout : 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                xtype: 'label',
                x: 0,
                y: 5,
                width: 80,
                style: 'text-align:right;',
                margin : '6 10 0 0',
                html: Comm.RTComm.setFont(9, common.Util.TR('Search Txn'))
            }]
        });

        this.searchJSPField = Ext.create('Ext.form.field.Text',{
            x       : 90,
            y       : 3,
            width   : '55%',
            data    : [],
            enableKeyEvents: true,
            cls     : 'config_tab',
            margin : '3 10 0 0',
            listeners: {
                keypress : function(field, e) {
                    if(e.keyCode == 13){
                        self.retrieve();
                    }
                }
            }
        });

        var retrieveButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Retrieve'),
            cls: 'x-btn-config-default',
            x: 320,
            y: 3,
            width: 70,
            margin: '3 2 0 0',
            listeners: {
                click: function () {
                    self.retrieve();
                }
            }
        });

        var refreshButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Refresh'),
            cls: 'x-btn-config-default',
            x: 395,
            y: 3,
            width: 70,
            margin: '3 2 0 0',
            listeners: {
                click: function() {
                    self.keepRowsData = [];
                    self.searchJSPField.setValue('');
                    self.jsp_grid.unCheckAll();

                    if(self.mode == 'Add'){
                        self.executeSQL_Jsp();
                    }else{
                        self.selectedJspReload();
                    }

                    self.initCheck = true;
                }
            }
        });

        panelB21.add([this.searchJSPField, retrieveButton, refreshButton]);

        var panelB22 = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.jsp_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: false,
            useCheckBox: true,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: true,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            defaultHeaderHeight: 26,
            usePager: true,
            defaultbufferSize: 100,
            defaultPageSize: 100,
            multiCheckable: true
        });
        panelB22.add(this.jsp_grid);

        this.jsp_grid.beginAddColumns();
        this.jsp_grid.addColumn({text: common.Util.CTR('ID'),            dataIndex: 'business_id',      width: 100, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
        this.jsp_grid.addColumn({text: common.Util.CTR('Transaction Name'),      dataIndex: 'jsp_name',         width: 400, type: Grid.String, alowEdit: false, editMode: false});
        this.jsp_grid.addColumn({text: common.Util.CTR('Business Name'), dataIndex: 'business_name',    width: 190, type: Grid.String, alowEdit: false, editMode: false});
        this.jsp_grid.endAddColumns();

        this.jsp_grid.baseStore.addListener('refresh', function(store){
            var ix, ixLen,
                start, pageTotalCount,
                self = this;

            start = store.lastOptions.start;
            pageTotalCount = (store.getPageSize() * store.currentPage);

            var selectRows = function(gridCount){
                var ix,ixLen;
                var pageGridData = self.jsp_grid.getRow(gridCount).data;

                if(!self.initCheck){
                    for( ix = 0, ixLen = self.keepRowsData.length; ix < ixLen; ix++ ){
                        if (self.keepRowsData[ix].jsp_name == pageGridData.jsp_name) {
                            self.jsp_grid.selectRow(gridCount, true);
                        }
                    }
                } else{
                    if (self.select_businessid == pageGridData.business_id) {
                        self.jsp_grid.selectRow(gridCount, true);
                    }
                }
            };

            if(pageTotalCount > store.totalCount){
                for(ix = start, ixLen = store.totalCount; ix < ixLen; ix++){
                    selectRows(ixLen - ix -1);
                }
            } else {
                for (ix = start, ixLen = pageTotalCount; ix < ixLen; ix++) {
                    selectRows(ixLen - ix -1);
                }
            }
        }.bind(this));

        this.jsp_grid.baseGrid.selModel.addListener('deselect', function(model, record){
            var ix, ixLen,
                checkData = [];
            //check list
            for( ix = 0, ixLen = this.keepRowsData.length; ix < ixLen; ix++ ){
                checkData.push(this.keepRowsData[ix].jsp_name);
            }

            //선택하지 않은 row 데이터가 keepRowsData 에 있을 경우 해당 위치 제거.
            if( checkData.indexOf(record.data.jsp_name) !== -1 ){
                this.keepRowsData.splice(checkData.indexOf(record.data.jsp_name),1);
            }

            this.initCheck = false;
        }.bind(this));

        this.jsp_grid.baseGrid.selModel.addListener('select', function(model, record){
            var ix, ixLen,
                checkData = [];
            //check list
            for( ix = 0, ixLen = this.keepRowsData.length; ix < ixLen; ix++ ){
                checkData.push(this.keepRowsData[ix].jsp_name);
            }

            //선택한 row 데이터가 keepRowsData 에 없을 경우 push
            if( checkData.indexOf(record.data.jsp_name) === -1 ){
                this.keepRowsData.push(record.data);
            }

            this.initCheck = false;
        }.bind(this));

        panelB2.add(panelB21);
        panelB2.add(panelB22);

        panelB.add(panelB1);
        panelB.add(panelB2);

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

        form.add(panelA);
        form.add(panelB);
        form.add(panelC);

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.show();

        if (this.mode == 'Add') {
            // GET MAX BUSINESS_ID + 1
            this.nameEdit.setDisabled(false);
            this.businessIdSeq();
            this.executeSQL_Jsp();
        } else {
            this.idEdit.setValue(this.select_businessid);
            this.nameEdit.setValue(this.select_businessname);
            this.nameEdit.setDisabled(false);
            this.selectedJspReload();
        }

        this.nameEdit.focus();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    businessIdSeq : function(){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Business_Id_Seq.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, function(header,data) {
            this.idEdit.setValue(data.rows[0][0]);
        }, this);
    },

    executeSQL_Jsp: function() {
        var ix, ixLen;
        this.jsp_grid.suspendLayouts();
        this.jsp_grid.clearRows();
        for ( ix = 0, ixLen = this.addJSPData.length;  ix < ixLen; ix++) {
            this.jsp_grid.addRow([
                this.addJSPData[ix].business_id,  // business_id
                this.addJSPData[ix].jsp_name,     // jsp_name
                this.addJSPData[ix].business_name // business_name
            ]);
        }
        this.jsp_grid.resumeLayouts();
        this.jsp_grid.doLayout();
        this.jsp_grid.drawGrid();
    },

    selectedJspReload: function() {
        var ix, ixLen;
        this.jsp_grid.suspendLayouts();
        this.jsp_grid.clearRows();
        this.keepRowsData = [];

        for ( ix = 0, ixLen = this.editJSPData.length;  ix < ixLen; ix++) {
            this.jsp_grid.addRow([
                this.editJSPData[ix].business_id,  // business_id
                this.editJSPData[ix].jsp_name,     // jsp_name
                this.editJSPData[ix].business_name // business_name
            ]);

            if (this.select_businessid == this.editJSPData[ix].business_id) {
                this.keepRowsData.push(this.editJSPData[ix]);
            }
        }
        this.jsp_grid.resumeLayouts();
        this.jsp_grid.doLayout();
        this.jsp_grid.drawGrid();
    },

    retrieve: function(){
        var dataSet = {};
        var text = this.searchJSPField.getValue();

        if(text == null){
            text = '';
        }

        dataSet.sql_file = 'IMXConfig_JSP_Search.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        dataSet.replace_string = [{
            name : 'search_text',
            value : text
        }];

        WS.SQLExec(dataSet, function(aheader, adata) {
            if (aheader.success) {
                this.initCheck = false;
                //ExtJS 프레임워크 layout이벤트 중지
                this.jsp_grid.suspendLayouts();
                this.jsp_grid.clearRows();
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    this.jsp_grid.addRow([
                        adata.rows[ix][0],  // business_id
                        adata.rows[ix][1],  // txn_name
                        adata.rows[ix][2]   //business_name
                    ]);
                }
                // ExtJS 프레임워크 layout이벤트실행
                this.jsp_grid.resumeLayouts();
                this.jsp_grid.doLayout();
                this.jsp_grid.drawGrid();
            }
        }, this);
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        var dataSet = {};
        var businessID = this.idEdit.getValue();
        var businessName = this.nameEdit.getValue();
        var selectList   = this.keepRowsData;
        var businessNameByteLen = this.getTextLength(businessName);
        this.startCount = 0;
        this.endCount = selectList.length;

        if(businessNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.nameEdit.focus();
            return;
        }

        if ( this.mode == 'Add' ){

            dataSet.sql_file = 'IMXConfig_Add_Save_JSP_Business_Name.sql';

            dataSet.bind = [{
                name    :   'business_id',
                value   :   businessID,
                type    : SQLBindType.INTEGER
            },{
                name    :   'business_name',
                value   :   businessName,
                type    : SQLBindType.STRING
            }];
        } else {
            //EDIT
            dataSet.sql_file = 'IMXConfig_Edit_Save_JSP_Business_Name.sql';

            dataSet.bind = [{
                name    :   'business_name',
                value   :   businessName,
                type : SQLBindType.STRING
            },{
                name    :   'business_id',
                value   :   this.select_businessid,
                type : SQLBindType.INTEGER
            }];
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {

            dataSet.sql_file = 'IMXConfig_Get_Business_Id.sql';

            dataSet.bind = [{
                name    :   'business_name',
                value   :   businessName,
                type    :   SQLBindType.STRING
            }];

            WS.SQLExec(dataSet, function(aheader, adata) {

                var businessId = adata.rows[0][0];

                for (var ix = 0; ix < selectList.length; ix++) {
                    this.txnNameSave(businessId,businessName,selectList[ix]);
                }
            }, this );

        }, this );

    },

    txnNameSave : function (businessId,businessName,selectData){
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Save_Txn_Name.sql';

        dataSet.bind = [{
            name    :   'jsp_name',
            value   :   selectData.jsp_name,
            type : SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name    :   'business_id',
            value   :   businessId
        }, {
            name    :   'business_name',
            value   :   businessName
        }, {
            name    :   'replace_jsp_name',
            value   :   selectData.jsp_name
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            this.businessIdCheck(selectData);
        }, this);
    },

    businessIdCheck : function(selectData){
        var self = this;

        if(selectData.business_id){
            var dataSet = {};

            dataSet.sql_file = 'IMXConfig_Business_Id_Check.sql';

            dataSet.bind = [{
                name    :   'business_id',
                value   :   selectData.business_id,
                type    :   SQLBindType.INTEGER
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, function(aheader, adata) {
                if(adata.rows.length){
                    this.startCount++;
                    if(this.startCount === this.endCount){
                        self.form.close();
                        self.parent.refresh_business();
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    }
                } else{
                    dataSet.sql_file = 'IMXConfig_Delete_Txn_Name.sql';

                    dataSet.replace_string = [{
                        name    :   'business_id',
                        value   :   selectData.business_id
                    }];

                    if(common.Util.isMultiRepository()){
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }

                    WS.SQLExec(dataSet, function() {
                        this.startCount++;
                        if(this.startCount === this.endCount){
                            self.form.close();
                            self.parent.refresh_business();
                            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                        }
                    }, this);
                }
            }, this );

        } else {
            this.startCount++;
            if(this.startCount === this.endCount){
                self.form.close();
                self.parent.refresh_business();
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    update: function() {
        //변경되기전이름으로 delete 후 다시 insert 하는 방식. -> xapm_class_method 테이블은 삭제하지X
        //여기선 delete만 시키고 save() 호출하여 insert.
        var self = this ;
        var dataSet = {};

        dataSet.sql_file = 'IMXConfig_Delete_Null_Txn_Name.sql';

        dataSet.bind = [{
            name    :   'business_id',
            value   :   this.select_businessid,
            type    :   SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            self.save();
        }, self);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    fieldCheck: function() {
        var businessName = this.nameEdit.getValue();
        var selectCount = this.keepRowsData.length;

        if (businessName == '') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter business name'));
            return ;
        }

        if (selectCount == 0) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please, select JSP file.'));
            return ;
        }


        //1507.10 기존에 있는지도 검사하는 로직 추가 min
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Txn_Name_Business_Check.sql';

        dataSet.bind = [{
            name    :   'business_name',
            value   :   businessName,
            type    :   SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {

            if ( adata.rows[0] !== undefined ){

                if ( this.mode == 'Add' ){
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('The business name already exists.'));
                }else{
                    this.update() ;
                }

            }else{

                if ( this.mode == 'Add' ){
                    this.save() ;
                }else{
                    this.update() ;
                }

            }
        }, this);

    }
});
