Ext.define('config.config_insname_form', {
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
        instID   : '',
        type     : '',
        name     : '',
        desc     : ''
    },

    systemID : '',

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
                        self.parent.onButtonClick('Refresh', 'ins', self.systemID);
                        self.parent.onButtonClick('Refresh', 'svr', self.systemID);
                    }
                }
            }
        });

        if (state == 'Add') {
            form.setTitle(common.Util.TR('Add Instance'));
        } else {
            form.setTitle(common.Util.TR('Edit Instance'));
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
                if (state == 'Edit') {
                    var itemChange = true;
                    if(!self.dataCheck(itemChange)){
                        self.grid.selectRow(self.beforeObj.preIndex);
                    } else {
                        if (!self.wasClick(index, record.data)) {
                            self.grid.selectRow(self.beforeObj.preIndex);
                            self.wasNameEdit.focus();
                        } else{
                            self.beforeObj.preIndex = index;
                        }
                    }
                }
            }
        });
        panelA1.add(this.grid);

        this.grid.beginAddColumns();
        this.grid.addColumn({text: common.Util.CTR('Instance ID')       , dataIndex: 'inst_id'      , width: 90,  type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Type')              , dataIndex: 'type'         , width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Name')              , dataIndex: 'name'         , width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Description')       , dataIndex: 'desc'         , width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Host Name')         , dataIndex: 'host_name'    , width: 100, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Address')           , dataIndex: 'addr'         , width: 100, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('isEnabled')         , dataIndex: 'enable'       , width: 100, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Automatic Learning'), dataIndex: 'auto_training', width: 100, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.grid.endAddColumns();

        panelA.add(panelA1);

        //

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            flex: 1,
            height: '100%',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.instIdEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            hideTrigger : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Instance ID')),
            allowBlank: true
        });

        this.typeEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 37,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 128,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Type')),
            allowBlank: true
        });

        this.nameEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 64,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Name')),
            allowBlank: true
        });

        this.descEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 91,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 64,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Description')),
            allowBlank: true
        });

        panelA2.add(this.instIdEdit, this.typeEdit, this.nameEdit, this.descEdit);
        panelA.add(panelA2);

        //

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

    showMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : title,
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    was_load: function() {
        var self = this,
            ix, ixLen, data;

        Ext.Ajax.request({ //호출 URL
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/instance',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === 'true') {
                    data = result.data;
                    self.grid.clearRows();

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        self.grid.addRow([data[ix].inst_id, data[ix].type, data[ix].name, data[ix].desc, data[ix].host_name, data[ix].addr, data[ix].enable, data[ix].auto_training]);
                    }

                    self.grid.drawGrid();

                    if (self.mode == 'Edit') {
                        var bfObj = self.beforeObj;
                        var grid = self.grid;
                        for (ix = 0; ix < self.grid.getRowCount(); ix++) {
                            var tempRowData = grid.getRow(ix).data;
                            if (tempRowData.inst_id == self.instID) {
                                grid.selectRow(ix);

                                bfObj.preIndex  = ix;
                                bfObj.instID    = tempRowData.inst_id;
                                bfObj.type      = tempRowData.type;
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
                self.instIdEdit.focus();
                break;
            case 'Edit' :
                self.instIdEdit.setDisabled(true);

                self.instIdEdit.setValue(self.instID);
                self.typeEdit.setValue(self.type);
                self.nameEdit.setValue(self.name);
                self.descEdit.setValue(self.desc);

                self.instIdEdit.focus();
                break;
            default :
                break;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        var self = this;
        // 넣을 데이터 가져오기.
        var instID   = self.instIdEdit.getValue();
        var type     = self.typeEdit.getValue();
        var name     = self.nameEdit.getValue();
        var desc     = self.descEdit.getValue();
        var cusorPointCheck = false;
        var ix, ixLen;
        var itemChange = false;

        if (!self.dataCheck(itemChange)) {
            return;
        }

        // 마지막 변경사항 추가하기 위해
        if (self.beforeObj.instID == instID) {
            cusorPointCheck = true;
        }

        if (self.mode == 'Add') {
            Ext.Ajax.request({
                url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/instance',
                method : 'POST',
                params : JSON.stringify({
                    inst_id       : instID,
                    type          : type,
                    name          : name,
                    desc          : desc,
                    enable        : "0",
                    auto_training : "1"
                }),
                success : function(response) {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    self.isModifiedAll = true;
                    self.cancelButton.fireEvent('click');
                },
                failure : function(){}
            });

        } else {
            // Edit mode
            var refObjArray = self.referenceObjArray;
            var rowData      = self.grid.getSelectedRow()[0].data;
            var hostName     = rowData.host_name;
            var addr         = rowData.addr;
            var enable       = rowData.enable;
            var autoTraining = rowData.auto_training;

            //마지막 변경사항 추가 이전 같은 inst_id값을 가진 referenceObjArray 제거.
            for (ix = 0; ix < refObjArray.length; ix++) {
                if (cusorPointCheck && refObjArray[ix].instID === instID) {
                    self.removeRefArray(ix);
                }
            }

            // 마지막 변경사항 추가하기 위해
            if (cusorPointCheck) {
                self.addRefArray(instID, type, name, desc, hostName, addr, enable, autoTraining);
            }

            for (ix = 0, ixLen = refObjArray.length; ix < ixLen; ix++) {
                var currentData = {};
                var currentInstID       = refObjArray[ix].instID;
                var currentType         = refObjArray[ix].type;
                var currentName         = refObjArray[ix].name;
                var currentDesc         = refObjArray[ix].desc;
                var currentHostName     = refObjArray[ix].hostName;
                var currentAddr         = refObjArray[ix].addr;
                var currentEnable       = refObjArray[ix].enable;
                var currentAutoTraining = refObjArray[ix].autoTraining;
                var record = self.grid.findRow('inst_id', currentInstID);

                //save 시 입력이 안된 에이전트명 및 호스트명을 전체 체크.
                if (currentType == '') {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the remaining Types.'));
                    return;
                }


                if (currentName == '') {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the remaining Names.'));
                    return;
                }

                if (record) {
                    self.setGridRow(currentInstID, currentType, currentName, currentDesc);

                    if(ix == ixLen - 1){
                        self.beforeObj.instID = currentInstID;
                        self.beforeObj.type   = currentType;
                        self.beforeObj.name   = currentName;
                        self.beforeObj.desc   = currentDesc;
                    }
                }

                currentData.instID       = currentInstID;
                currentData.type         = currentType;
                currentData.name         = currentName;
                currentData.desc         = currentDesc;
                currentData.hostName     = currentHostName;
                currentData.addr         = currentAddr;
                currentData.enable       = currentEnable;
                currentData.autoTraining = currentAutoTraining;
                currentData.start  = ix + 1;
                currentData.end    = ixLen;
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
        var instID = self.instIdEdit.getValue();
        var type   = self.typeEdit.getValue();
        var name   = self.nameEdit.getValue();
        var desc   = self.descEdit.getValue();
        var ix;

        // CHECK: WAS NAME + Byte Check
        if (instID == '' && !itemChange) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Instance ID.'));
            self.instIdEdit.focus();
            return false;
        }

        if (instID.indexOf(' ') > -1 ) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
            self.instIdEdit.focus();
            return false;
        }

        var instIdByteLen = this.getTextLength(instID);

        if(instIdByteLen > 128){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.instIdEdit.focus();
            return false;
        }

        // CHECK: TYPE + Byte Check
        if (type == '' && !itemChange) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Type.'));
            self.typeEdit.focus();
            return false;
        }

        if (type.indexOf(' ') > -1 ) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
            self.typeEdit.focus();
            return false;
        }

        var typeByteLen = this.getTextLength(type);

        if(typeByteLen > 128){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.typeEdit.focus();
            return false;
        }

        // CHECK: Name + Byte Check
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

        var parentGrid = self.parent.grid['ins'];

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

        // CHECK: WAS NAME 중복 체크
        if (self.mode == 'Add') {
            for (ix = 0; ix < parentGrid.getRowCount(); ix++) {
                if (parentGrid.getRow(ix).data.inst_id == instID) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Name is already registered.'));
                    self.instIdEdit.focus();
                    return false;
                }
            }
        } else {
            //edit mode
            for (ix = 0; ix < parentGrid.getRowCount(); ix++) {
                if (parentGrid.getRow(ix).data.inst_id == instID) {
                    if(itemChange){
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if(instID === '' || self.beforeObj.instID == instID){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Instance ID is already registered.'));
                        self.instIdEdit.focus();
                        return false;
                    } else{
                        if(parentGrid.getRow(ix).data.inst_id === instID){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Instance ID is already registered.'));
                        self.instIdEdit.focus();
                        return false;
                    }
                }
            }
        }
        return true;
    },

    setGridRow: function(instID, type, name, desc) {
        var ix, ixLen;
        for (ix = 0, ixLen = this.grid.getRowCount(); ix < ixLen; ix++) {
            if (this.grid.getRow(ix).data.inst_id == instID) {
                var record = this.grid.findRow('inst_id', instID);

                record.set('type', type);
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
        var parentGrid = self.parent.grid['ins'];
        var beforeObjOne = self.beforeObj;
        var isModified = self.isModified;

        // *tip)  beforeObjOne 와 pre*** 와 비교

        // 선택 포인트가 넘어가기 전에 값들을 미리 담아둔다.
        var preInstIdEdit      = self.instIdEdit;
        var preTypeEdit        = self.typeEdit;
        var preNameEdit        = self.nameEdit;
        var preDescEdit        = self.descEdit;
        var preInstIdEditValue = self.instIdEdit.getValue();
        var preTypeEditValue   = self.typeEdit.getValue();
        var preNameEditValue   = self.nameEdit.getValue();
        var preDescEditValue   = self.descEdit.getValue();
        var rowData            = self.grid.getSelectedRow()[0].data;
        var hostName           = rowData.host_name;
        var addr               = rowData.addr;
        var enable             = rowData.enable;
        var autoTraining       = rowData.auto_training;

        // 선택된 포인트의 값들을 저장한다.
        var rdInstID = recordData.inst_id;
        var rdType   = recordData.type;
        var rdName   = recordData.name;
        var rdDesc   = recordData.desc;

        if (beforeObjOne.instID == '') {
            beforeObjOne.instID = preInstIdEditValue;
            beforeObjOne.type   = preTypeEditValue;
            beforeObjOne.name   = preNameEditValue;
            beforeObjOne.desc   = preDescEditValue;
        }

        if (beforeObjOne.instID == preInstIdEditValue) {
            if (beforeObjOne.type != preTypeEditValue) {
                for (var ix = 0; ix < parentGrid.getRowCount(); ix++) {
                    if (parentGrid.getRow(ix).data.type == preTypeEditValue) {
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if (preTypeEditValue === '' || parentGrid.getRow(ix).data.inst_id === preInstIdEditValue) {
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Type is already registered.'));
                        var record = grid.findRow('inst_id', preInstIdEditValue);
                        if (record) {
                            record.set('type', beforeObjOne.type);
                        }
                        return false;
                    }
                }

                grid.updateCell('type', beforeObjOne.preIndex, preTypeEditValue);
                isModified = true;
            }

            if (beforeObjOne.name != preNameEditValue) {
                grid.updateCell('name', beforeObjOne.preIndex, preNameEditValue);
                isModified = true;
            }

            if (beforeObjOne.desc != preDescEditValue) {
                grid.updateCell('desc', beforeObjOne.preIndex, preDescEditValue);
                isModified = true;
            }
        }

        //referenceObjArray 값을 계속 쌓는것이 아닌 에이전트 ID당 1번만 쌓도록 수정.
        for (var ix = 0; ix < self.referenceObjArray.length; ix++) {
            if(isModified && self.referenceObjArray[ix].instID === preInstIdEditValue){
                self.removeRefArray(ix);
            }
        }

        if (isModified) {
            self.addRefArray(preInstIdEditValue, preTypeEditValue, preNameEditValue, preDescEditValue, hostName, addr, enable, autoTraining);
        }

        // 선택 포인트가 이전포인트와 같을 경우, 변경된 값을 동기화 시켜 보여주기 위해
        if (preInstIdEditValue == rdInstID) {
            rdInstID = preInstIdEditValue;
            rdType   = preTypeEditValue;
            rdName   = preNameEditValue;
            rdDesc   = preDescEditValue;
        }

        // 선택된 값들이 다시 이전 선택들의 값이 되기 위해
        beforeObjOne.instID = rdInstID;
        beforeObjOne.type   = rdType;
        beforeObjOne.name   = rdName;
        beforeObjOne.desc   = rdDesc;

        preInstIdEdit.setValue(rdInstID);
        preTypeEdit.setValue(rdType);
        preNameEdit.setValue(rdName);
        preDescEdit.setValue(rdDesc);

        return true;
    },

    addRefArray: function (instID, type, name, desc, hostName, addr, enable, autoTraining) {
        var self = this;

        var tempObj = {
            instID       : instID,
            type         : type,
            name         : name,
            desc         : desc,
            hostName     : hostName,
            addr         : addr,
            enable       : enable,
            autoTraining : autoTraining
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
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/instance/' + currentData.instID,
            method : 'PUT',
            params : JSON.stringify({
                type          : currentData.type,
                name          : currentData.name,
                desc          : currentData.desc,
                host_name     : currentData.hostName,
                addr          : currentData.addr,
                enable        : currentData.enable,
                auto_training : currentData.autoTraining
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
