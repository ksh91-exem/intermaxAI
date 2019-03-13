Ext.define('config.config_alertBusinessClassName_form', {

    parent: null,
    keepRowsData : [],
    initCheck : true,

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 700,
            height: 600,
            resizable: true,
            title: common.Util.TR('Business Class Name'),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        self.form = form;

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 71,
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

        var nameLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 85,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('Business Name'))
        });

        this.nameEdit = Ext.create('Ext.form.field.Text', {
            x: 95,
            y: 10,
            width: '80%'
        });

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
            html: Comm.RTComm.setFont(9, common.Util.TR('Class List'))
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
                html: Comm.RTComm.setFont(9, common.Util.TR('Search Class'))
            }]
        });

        this.searchClassFiled = Ext.create('Ext.form.field.Text',{
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
                    self.searchClassFiled.setValue('');
                    self.class_grid.unCheckAll();

                    if(self.mode == 'Add'){
                        self.executeSQL_ClassName();
                    } else {
                        self.selectedClassNameReload();
                    }

                    self.initCheck = true;
                }
            }
        });

        panelB21.add([this.searchClassFiled, retrieveButton, refreshButton]);

        var panelB22 = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.class_grid = Ext.create('Exem.adminGrid', {
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
        panelB22.add(this.class_grid);

        this.class_grid.beginAddColumns();
        this.class_grid.addColumn({text: common.Util.CTR('Class Name'),    dataIndex: 'class_name',       width: 400, type: Grid.String, alowEdit: false, editMode: false});
        this.class_grid.addColumn({text: common.Util.CTR('Business Name'), dataIndex: 'business_name',    width: 190, type: Grid.String, alowEdit: false, editMode: false});
        this.class_grid.endAddColumns();

        this.class_grid.baseStore.addListener('refresh', function(store){
            var ix, ixLen,
                start, pageTotalCount,
                self = this;

            start = store.lastOptions.start;
            pageTotalCount = (store.getPageSize() * store.currentPage);

            var selectRows = function(gridCount){
                var ix,ixLen;
                var pageGridData = self.class_grid.getRow(gridCount).data;
                if(!self.initCheck){
                    for( ix = 0, ixLen = self.keepRowsData.length; ix < ixLen; ix++ ){
                        if (self.keepRowsData[ix].class_name == pageGridData.class_name) {
                            self.class_grid.selectRow(gridCount, true);
                        }
                    }
                } else{
                    if (self.select_businessname == pageGridData.business_name) {
                        self.class_grid.selectRow(gridCount, true);
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

        this.class_grid.baseGrid.selModel.addListener('deselect', function(model, record){
            var ix, ixLen,
                checkData = [];
            //check list
            for( ix = 0, ixLen = this.keepRowsData.length; ix < ixLen; ix++ ){
                checkData.push(this.keepRowsData[ix].class_name);
            }

            //선택하지 않은 row 데이터가 keepRowsData 에 있을 경우 해당 위치 제거.
            if( checkData.indexOf(record.data.class_name) !== -1 ){
                this.keepRowsData.splice(checkData.indexOf(record.data.class_name),1);
            }

            this.initCheck = false;
        }.bind(this));

        this.class_grid.baseGrid.selModel.addListener('select', function(model, record){
            var ix, ixLen,
                checkData = [];
            //check list
            for( ix = 0, ixLen = this.keepRowsData.length; ix < ixLen; ix++ ){
                checkData.push(this.keepRowsData[ix].class_name);
            }

            //선택한 row 데이터가 keepRowsData 에 없을 경우 push
            if( checkData.indexOf(record.data.class_name) === -1 ){
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

        if (this.mode === 'Add') {
            // GET MAX BUSINESS_ID + 1
            this.nameEdit.setDisabled(false);
            this.executeSQL_ClassName();
        } else {
            this.nameEdit.setValue(this.select_businessname);
            //1506.24 true -> false 로변경 by한승민과장님 min
            this.nameEdit.setDisabled(false);
            this.selectedClassNameReload();
        }

        this.nameEdit.focus();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL_ClassName: function() {
        var ix, ixLen;
        this.class_grid.suspendLayouts();
        this.class_grid.clearRows();
        for ( ix = 0, ixLen = this.addClassData.length;  ix < ixLen; ix++) {
            this.class_grid.addRow([
                this.addClassData[ix].class_name,     // class_name
                this.addClassData[ix].business_name   // business_name
            ]);
        }
        this.class_grid.resumeLayouts();
        this.class_grid.doLayout();
        this.class_grid.drawGrid();
    },

    selectedClassNameReload: function() {
        var ix, ixLen;
        this.class_grid.suspendLayouts();
        this.class_grid.clearRows();

        for ( ix = 0, ixLen = this.editClassData.length;  ix < ixLen; ix++) {
            this.class_grid.addRow([
                this.editClassData[ix].class_name,      // class_name
                this.editClassData[ix].business_name    // business_name
            ]);

            if (this.select_businessname == this.editClassData[ix].business_name) {
                this.keepRowsData.push(this.editClassData[ix]);
            }
        }
        this.class_grid.resumeLayouts();
        this.class_grid.doLayout();
        this.class_grid.drawGrid();
    },

    retrieve: function(){
        var dataSet = {};
        var text = this.searchClassFiled.getValue();

        if(text == null){
            text = '';
        }

        dataSet.sql_file = 'IMXConfig_Class_Search.sql';

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
                this.class_grid.suspendLayouts();
                this.class_grid.clearRows();
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    this.class_grid.addRow([
                        adata.rows[ix][0],  // class_name
                        adata.rows[ix][1]   // business_name
                    ]);
                }
                // ExtJS 프레임워크 layout이벤트실행
                this.class_grid.resumeLayouts();
                this.class_grid.doLayout();
                this.class_grid.drawGrid();
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
        var ix, ixLen, selectData;

        var business_name = this.nameEdit.getValue();

        var businessNameByteLen = this.getTextLength(business_name);

        if(businessNameByteLen > 100){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            this.nameEdit.focus();
            return;
        }

        for ( ix = 0, ixLen = this.keepRowsData.length; ix < ixLen; ix++) {
            selectData = this.keepRowsData[ix];
            selectData.count = ix;
            selectData.end_count = this.keepRowsData.length -1;

            this.update(selectData);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    update : function(selectData){
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Update_Class_Name.sql';

        dataSet.bind = [{
            name    :   'business_name',
            value   :   this.nameEdit.getValue(),
            type    :   SQLBindType.STRING
        }, {
            name    :   'class_name',
            value   :   selectData.class_name,
            type    :   SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            if(selectData.count === selectData.end_count){
                setTimeout(function() {
                    self.form.close();
                    self.parent.refresh_business();
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                }, 100);
            }
        }, this);
    },

    deleteSave: function() {
        //변경되기전이름으로 delete 후 다시 insert 하는 방식. -> xapm_class_method 테이블은 삭제하지X
        //여기선 delete만 시키고 save() 호출하여 insert.
        var self = this ;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Delete_Class_Name.sql';

        dataSet.bind = [{
            name    :   'business_name',
            value   :   self.select_businessname,
            type    :   SQLBindType.STRING
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
        //처리 방식 순서 delete -> save -> update
        var businessName = this.nameEdit.getValue();
        var selectCount = this.keepRowsData.length;

        if (businessName == '') {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter business name'));
            return;
        }

        if (selectCount === 0) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please, select class name.'));
            return;
        }


        //1506.24 기존에 있는지도 검사하는 로직 추가 min
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Class_Name_Business_Check.sql';

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
                    this.deleteSave() ;
                }


            }else{
                if ( this.mode == 'Add' ){
                    this.save() ;
                }else{
                    this.deleteSave() ;
                }

            }
        }, this);
    }
});
