Ext.define('config.config_sysname_form', {
    parent: null,
    mode: '',

    // 변경사항 여부 체크
    isModified   : false,
    isModifiedAll: false,

    referenceObjArray: [],
    // Target 이전 객체
    beforeObj:{
        // 이전에 선택된 인덱스
        preIndex : 0,
        systemID : '',
        name     : '',
        desc     : ''
    },

    init: function (state) {
        var self = this;

        this.mode = state;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 600,
            height: 500,
            resizable: false,
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy',
            cls: 'config_tab',
            listeners   : {
                close: function(){
                    if (self.isModifiedAll) {
                        self.parent.onButtonClick('Refresh', 'sys');
                    }
                }
            }
        });

        if (state == 'Add') {
            form.setTitle(common.Util.TR('Add System'));
        } else {
            form.setTitle(common.Util.TR('Edit System'));
        }

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA1 = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            flex: 1,
            height: '100%',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: false,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function(dv, record, item, index) {
                if(state == 'Edit'){
                    var itemChange = true;
                    if(!self.dataCheck(itemChange)){
                        self.grid.selectRow(self.beforeObj.preIndex);
                    } else {
                        if(!self.wasClick(index, record.data)){
                            self.grid.selectRow(self.beforeObj.preIndex);
                            self.nameEdit.focus();
                        } else{
                            self.beforeObj.preIndex = index;
                        }
                    }
                }
            }
        });
        panelA1.add(this.grid);

        this.grid.beginAddColumns();
        this.grid.addColumn({text: 'sys_id'                      , dataIndex: 'sys_id'     , width: 120, type: Grid.Number, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Name')       , dataIndex: 'name'       , width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Description'), dataIndex: 'desc'       , width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.endAddColumns();

        panelA.add(panelA1);

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            flex: 1,
            height: '100%',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.systemIdEdit = Ext.create('Ext.form.field.Number', {
            x: 0,
            y: 10,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            hideTrigger : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('System ID')),
            allowBlank: true
        });

        this.nameEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 37,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            hideTrigger : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Name')),
            allowBlank: true
        });

        this.descEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 64,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Description')),
            allowBlank: true
        });

        panelA2.add(this.systemIdEdit, this.nameEdit, this.descEdit);
        panelA.add(panelA2);

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
            text: common.Util.TR('Save'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.save();
                }
            }
        });

        this.cancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Close'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        panelC.add([OKButton, this.cancelButton]);

        form.add(panelA);
        form.add(panelC);
        form.show();

        this.was_load();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    was_load: function() {
        var self = this,
            ix, ixLen, data;

        Ext.Ajax.request({ //호출 URL
            url : common.Menu.useGoogleCloudURL + '/admin/system',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === 'true') {
                    data = result.data;
                    self.grid.clearRows();

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        self.grid.addRow([data[ix].sys_id, data[ix].name, data[ix].desc]);
                    }

                    self.grid.drawGrid();

                    if (self.mode == 'Edit') {
                        var bfObj = self.beforeObj;
                        var grid = self.grid;
                        for (ix = 0; ix < self.grid.getRowCount(); ix++) {
                            var tempRowData = grid.getRow(ix).data;
                            if (tempRowData.sys_id == self.systemID) {
                                grid.selectRow(ix);

                                bfObj.preIndex  = ix;
                                bfObj.systemID  = tempRowData.sys_id;
                                bfObj.name      = tempRowData.name;
                                bfObj.desc      = tempRowData.desc;
                            }
                        }
                    }
                }
            },
            failure : function(){}
        });

        switch (this.mode) {
            case 'Add' :
                self.systemIdEdit.setDisabled(true);
                self.nameEdit.focus();
                break;
            case 'Edit' :
                self.systemIdEdit.setDisabled(true);

                self.systemIdEdit.setValue(self.systemID);
                self.nameEdit.setValue(self.name);
                self.descEdit.setValue(self.desc);

                self.nameEdit.focus();
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        var self = this;
        // 넣을 데이터 가져오기.
        var systemID = self.systemIdEdit.getValue();
        var name     = self.nameEdit.getValue();
        var desc     = self.descEdit.getValue();
        var cusorPointCheck = false;
        var ix, ixLen;
        var itemChange = false;

        if(!self.dataCheck(itemChange)){
            return;
        }

        // 마지막 변경사항 추가하기 위해
        if (self.beforeObj.systemID == systemID) {
            cusorPointCheck = true;
        }

        if (self.mode == 'Add') {
            Ext.Ajax.request({
                url : common.Menu.useGoogleCloudURL + '/admin/system',
                method : 'POST',
                params : JSON.stringify({
                    name : name,
                    desc : desc
                }),
                success : function(response) {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));

                    self.cancelButton.fireEvent('click');
                    self.parent.onButtonClick('Refresh', 'sys');
                },
                failure : function(){}
            });

        } else {
            // Edit mode
            var refObjArray = self.referenceObjArray;

            //마지막 변경사항 추가 이전 같은 sys_id값을 가진 referenceObjArray 제거.
            for (ix = 0; ix < refObjArray.length; ix++) {
                if (cusorPointCheck && refObjArray[ix].systemID === systemID) {
                    self.removeRefArray(ix);
                }
            }

            // 마지막 변경사항 추가하기 위해
            if (cusorPointCheck) {
                self.addRefArray(systemID, name, desc);
            }

            for (ix = 0, ixLen = refObjArray.length; ix < ixLen; ix++) {
                var currentData = {};
                var currentSystemID = refObjArray[ix].systemID;
                var currentName     = refObjArray[ix].name;
                var currentDesc     = refObjArray[ix].desc;
                var record = self.grid.findRow('sys_id', currentSystemID);

                //save 시 입력이 안된 에이전트명 및 호스트명을 전체 체크.
                if (currentName == '') {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the remaining Names.'));
                    return;
                }


                if (currentDesc == '') {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the remaining Description.'));
                    return;
                }

                if (record) {
                    self.setGridRow(currentSystemID, currentName, currentDesc);

                    if(ix == ixLen - 1){
                        self.beforeObj.systemID = currentSystemID;
                        self.beforeObj.name     = currentName;
                        self.beforeObj.desc     = currentDesc;
                    }
                }

                currentData.systemID = currentSystemID;
                currentData.name     = currentName;
                currentData.desc     = currentDesc;
                currentData.start    = ix + 1;
                currentData.end      = ixLen;
                this.editUpdate(currentData);
            }
        }
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

    /**
     * itemClick 을 통해 dataCheck 시 에이전트명과 호스트명 제외
     * @param itemChange
     * @returns {boolean}
     */
    dataCheck: function(itemChange){
        var self = this;
        // 넣을 데이터 가져오기.
        var systemID = self.systemIdEdit.getValue();
        var name = self.nameEdit.getValue();
        var desc = self.descEdit.getValue();
        var ix;

        // CHECK: WAS NAME + Byte Check
        if (name == '' && !itemChange) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Name.'));
            self.nameEdit.focus();
            return false;
        }

        if (name.indexOf(' ') > -1 ) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
            self.nameEdit.focus();
            return false;
        }

        var nameByteLen = this.getTextLength(name);

        if(nameByteLen > 128){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.nameEdit.focus();
            return false;
        }

        // CHECK: Description + Byte Check
        if (desc == '' && !itemChange) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Description.'));
            self.descEdit.focus();
            return false;
        }

        if (desc.indexOf(' ') > -1) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
            self.descEdit.focus();
            return false;
        }

        var descByteLen = this.getTextLength(desc);

        if(descByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.descEdit.focus();
            return false;
        }

        var parentGrid = self.parent.grid['sys'];

        // CHECK: WAS NAME 중복 체크
        if (self.mode == 'Add') {
            for (ix = 0; ix < parentGrid.getRowCount(); ix++) {
                if (parentGrid.getRow(ix).data.name == name) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Name is already registered.'));
                    self.nameEdit.focus();
                    return false;
                }
            }
        } else {
            //edit mode
            for (ix = 0; ix < parentGrid.getRowCount(); ix++) {
                if (parentGrid.getRow(ix).data.name == name) {
                    if(itemChange){
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if(name === '' || self.beforeObj.systemID == systemID){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Name is already registered.'));
                        self.nameEdit.focus();
                        return false;
                    } else{
                        if(parentGrid.getRow(ix).data.sys_id === systemID){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Name is already registered.'));
                        self.nameEdit.focus();
                        return false;
                    }
                }
            }
        }
        return true;
    },

    setGridRow: function(systemID, name, desc) {
        var ix, ixLen;
        for (ix = 0, ixLen = this.grid.getRowCount(); ix < ixLen; ix++) {
            if (this.grid.getRow(ix).data.sys_id == systemID) {
                var record = this.grid.findRow('sys_id', systemID);

                record.set('name', name);
                record.set('desc', desc);

                this.grid.drawGrid();
                break;
            }
        }
    },

    wasClick: function(index, recordData) {
        var self = this;
        var grid = self.grid;
        var parentGrid = self.parent.grid['sys'];
        var beforeObjOne = self.beforeObj;
        var isModified = self.isModified;

        // *tip)  beforeObjOne 와 pre*** 와 비교

        // 선택 포인트가 넘어가기 전에 값들을 미리 담아둔다.
        var preSystemIdEdit      = self.systemIdEdit;
        var preNameEdit          = self.nameEdit;
        var preDescEdit          = self.descEdit;
        var preSystemIdEditValue = self.systemIdEdit.getValue();
        var preNameEditValue     = self.nameEdit.getValue();
        var preDescEditValue     = self.descEdit.getValue();

        // 선택된 포인트의 값들을 저장한다.
        var rdSystemID = recordData.sys_id;
        var rdName = recordData.name;
        var rdDesc = recordData.desc;

        if (beforeObjOne.systemID == '') {
            beforeObjOne.systemID = preSystemIdEditValue;
            beforeObjOne.name     = preNameEditValue;
            beforeObjOne.desc     = preDescEditValue;
        }

        if (beforeObjOne.systemID == preSystemIdEditValue) {
            if (beforeObjOne.name != preNameEditValue) {
                for (var ix = 0; ix < parentGrid.getRowCount(); ix++) {
                    if (parentGrid.getRow(ix).data.name == preNameEditValue) {
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if(preNameEditValue === '' || parentGrid.getRow(ix).data.sys_id === preSystemIdEditValue){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Name is already registered.'));
                        var record = grid.findRow('sys_id', preSystemIdEditValue);
                        if (record) {
                            record.set('name', beforeObjOne.name);
                        }
                        return false;
                    }
                }

                grid.updateCell('name', beforeObjOne.preIndex, preNameEditValue);
                isModified = true;
            }

            if (beforeObjOne.desc != preDescEditValue) {
                grid.updateCell('desc', beforeObjOne.preIndex, preDescEditValue);
                isModified = true;
            }

            //referenceObjArray 값을 계속 쌓는것이 아닌 에이전트 ID당 1번만 쌓도록 수정.
            for (ix = 0; ix < self.referenceObjArray.length; ix++) {
                if(isModified && self.referenceObjArray[ix].systemID === preSystemIdEditValue){
                    self.removeRefArray(ix);
                }
            }

            if (isModified) {
                self.addRefArray(preSystemIdEditValue, preNameEditValue, preDescEditValue);
            }
        }

        // 선택 포인트가 이전포인트와 같을 경우, 변경된 값을 동기화 시켜 보여주기 위해
        if (preSystemIdEditValue == rdSystemID) {
            rdSystemID  = preSystemIdEditValue;
            rdName      = preNameEditValue;
            rdDesc      = preDescEditValue;
        }

        // 선택된 값들이 다시 이전 선택들의 값이 되기 위해
        beforeObjOne.systemID = rdSystemID;
        beforeObjOne.name     = rdName;
        beforeObjOne.desc     = rdDesc;

        preSystemIdEdit.setDisabled(true);
        preSystemIdEdit.setValue(rdSystemID);
        preNameEdit.setValue(rdName);
        preDescEdit.setValue(rdDesc);

        return true;
    },

    addRefArray: function (systemID, name, desc) {
        var self = this;

        var tempObj = {
            systemID: systemID,
            name: name,
            desc: desc
        };

        self.referenceObjArray.push(tempObj);
        self.isModified = false;
    },

    removeAllRefArray: function () {
        this.referenceObjArray.splice(0,this.referenceObjArray.length);
    },

    removeRefArray: function (index) {
        this.referenceObjArray.splice(index, 1);
    },

    editUpdate : function(currentData) {
        var self = this;

        self.isModifiedAll = true;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + currentData.systemID,
            method : 'PUT',
            params : JSON.stringify({
                name : currentData.name,
                desc : currentData.desc
            }),
            success : function(response) {
                if(currentData.start === currentData.end){
                    self.removeAllRefArray();
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                }
            },
            failure : function(){}
        });
   }

});
