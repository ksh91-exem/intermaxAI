Ext.define('config.config_tiername_form', {
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
                        self.parent.onButtonClick('Refresh', 'tier', self.systemID);
                    }
                }
            }
        });

        if (state == 'Add') {
            form.setTitle(common.Util.TR('Add Tier'));
        } else {
            form.setTitle(common.Util.TR('Edit Tier'));
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

        this.grid = Ext.create('Exem.adminTree', {
            width : '100%',
            height: '100%',
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: false,
            localeType: 'H:i:s',
            defaultHeaderHeight: 26,
            usePager: false,
            useEmptyText: true,
            bufferedRenderer: true,
            sortableColumns: false,
            emptyTextMsg: common.Util.TR('No data to display'),
            itemclick:function(dv, record, item, index) {
                if (state == 'Add') {
                    self.parentEdit.setValue(record.data.name);

                } else if (state == 'Edit') {
                    var itemChange = true;
                    if (!self.dataCheck(itemChange)) {
                        self.grid.selectRow(self.beforeObj.preIndex);
                    } else {
                        if (!self.wasClick(index, record.data)) {
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
        this.grid.addColumn({text: 'tier_id'                     , dataIndex: 'tier_id', width: 80 , type: Grid.String      , alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Name')       , dataIndex: 'name'   , width: 120, type: Grid.tree        , alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Description'), dataIndex: 'desc'   , width: 120, type: Grid.StringNumber, alowEdit: false, editMode: false});
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

        this.tierIdEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 128,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Tier ID')),
            allowBlank: true
        });

        this.parentEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 128,
            enforceMaxLength : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Parent Tier Name')),
            allowBlank: true
        });

        this.nameEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 37,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            maxLength : 128,
            enforceMaxLength : true,
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


        if (state == 'Add') {
            panelA2.add(this.parentEdit, this.nameEdit, this.descEdit);
        } else {
            panelA2.add(this.tierIdEdit, this.nameEdit, this.descEdit);
        }
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

        panelC.add(OKButton);
        panelC.add(this.cancelButton);

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
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/tier',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                var treeObj = {};

                if (result.success === true) {
                    data = result.data;
                    self.grid.clearNodes();

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        if (data[ix].parent_id == 0) {
                            treeObj[data[ix].tier_id] = self.grid.addNode(null, [data[ix].tier_id, data[ix].name, data[ix].desc]);
                        } else {
                            treeObj[data[ix].tier_id] = self.grid.addNode(treeObj[data[ix].parent_id], [data[ix].tier_id, data[ix].name, data[ix].desc]);
                        }
                    }

                    self.grid.drawTree();

                    if (self.mode == 'Edit') {
                        var bfObj = self.beforeObj;
                        var grid = self.grid;
                        for (ix = 0; ix < self.grid.getNodeCount(); ix++) {
                            var tempRowData = grid.getNode(ix).data;
                            if (tempRowData.tier_id == self.tierID) {
                                grid.selectRow(ix);

                                bfObj.preIndex  = ix;
                                bfObj.tierID    = tempRowData.tier_id;
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
                self.tierIdEdit.setDisabled(true);
                self.parentEdit.setDisabled(true);
                self.nameEdit.focus();
                break;
            case 'Edit' :
                self.tierIdEdit.setDisabled(true);
                self.tierIdEdit.setValue(self.tierID);

                self.parentEdit.setDisabled(true);
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
        var tierID   = self.grid.getSelectedRow()[0] ? self.grid.getSelectedRow()[0].data.tier_id : 0;
        var name     = self.nameEdit.getValue();
        var desc     = self.descEdit.getValue();
        var cusorPointCheck = false;
        var ix, ixLen;
        var itemChange = false;

        if(!self.dataCheck(itemChange)){
            return;
        }

        // 마지막 변경사항 추가하기 위해
        if (self.beforeObj.tierID == tierID) {
            cusorPointCheck = true;
        }

        if (self.mode == 'Add') {
            Ext.Ajax.request({
                url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/tier',
                method : 'POST',
                params : JSON.stringify({
                    parent_id : tierID,
                    name      : name,
                    desc      : desc
                }),
                success : function(response) {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));

                    self.cancelButton.fireEvent('click');
                    self.parent.onButtonClick('Refresh', 'tier', self.systemID);
                },
                failure : function(){}
            });

        } else {
            // Edit mode
            var refObjArray = self.referenceObjArray;

            //마지막 변경사항 추가 이전 같은 inst_id값을 가진 referenceObjArray 제거.
            for (ix = 0; ix < refObjArray.length; ix++) {
                if (cusorPointCheck && refObjArray[ix].tierID === tierID) {
                    self.removeRefArray(ix);
                }
            }

            // 마지막 변경사항 추가하기 위해
            if (cusorPointCheck) {
                self.addRefArray(tierID, name, desc);
            }

            for (ix = 0, ixLen = refObjArray.length; ix < ixLen; ix++) {
                var currentData = {};
                var currentTierID = refObjArray[ix].tierID;
                var currentName = refObjArray[ix].name;
                var currentDesc = refObjArray[ix].desc;
                var record = self.grid.findRow('tier_id', currentTierID);

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
                    self.setGridRow(currentTierID, currentName, currentDesc);

                    if(ix == ixLen - 1){
                        self.beforeObj.tierID = currentTierID;
                        self.beforeObj.name   = currentName;
                        self.beforeObj.desc   = currentDesc;
                    }
                }

                currentData.tierID = currentTierID;
                currentData.name   = currentName;
                currentData.desc   = currentDesc;
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
        var tierID = self.tierIdEdit.getValue();
        var name   = self.nameEdit.getValue();
        var desc   = self.descEdit.getValue();
        var ix;

        // CHECK: NAME + Byte Check
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

        if (nameByteLen > 128) {
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

        var descByteLen = this.getTextLength(desc);

        if(descByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.descEdit.focus();
            return false;
        }

        var parentGrid = self.parent.grid['tier'];

        // CHECK: WAS NAME 중복 체크
        if (self.mode == 'Add') {
            for (ix = 0; ix < parentGrid.getNodeCount(); ix++) {
                if (parentGrid.getNode(ix).data.tier_id == tierID) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Tier ID is already registered.'));
                    self.nameEdit.focus();
                    return false;
                }
            }
        } else {
            //edit mode
            for (ix = 0; ix < parentGrid.getNodeCount(); ix++) {
                if (parentGrid.getNode(ix).data.tier_id == tierID) {
                    if(itemChange){
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if(name === '' || self.beforeObj.tierID == tierID){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Tier ID is already registered.'));
                        self.nameEdit.focus();
                        return false;
                    } else{
                        if(parentGrid.getNode(ix).data.tier_id === tierID){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Tier ID is already registered.'));
                        self.nameEdit.focus();
                        return false;
                    }
                }
            }
        }
        return true;
    },

    setGridRow: function(tierID, name, desc) {
        var ix, ixLen;
        for (ix = 0, ixLen = this.grid.getNodeCount(); ix < ixLen; ix++) {
            if (this.grid.getNode(ix).data.tier_id == tierID) {
                var record = this.grid.findRow('tier_id', tierID);

                record.set('name', name);
                record.set('desc', desc);

                this.grid.drawTree();
                break;
            }
        }
    },

    wasClick: function(index, recordData) {
        var self = this;
        var grid = self.grid;
        var parentGrid = self.parent.grid['tier'];
        var beforeObjOne = self.beforeObj;
        var isModified = self.isModified;

        // *tip)  beforeObjOne 와 pre*** 와 비교

        // 선택 포인트가 넘어가기 전에 값들을 미리 담아둔다.
        var preTierIdEdit    = self.tierIdEdit;
        var preNameEdit      = self.nameEdit;
        var preDescEdit      = self.descEdit;
        var preTierIdEditValue = self.tierIdEdit.getValue();
        var preNameEditValue  = self.nameEdit.getValue();
        var preDescEditValue  = self.descEdit.getValue();

        // 선택된 포인트의 값들을 저장한다.
        var rdTierID = recordData.tier_id;
        var rdName = recordData.name;
        var rdDesc = recordData.desc;

        if (beforeObjOne.name == '') {
            beforeObjOne.name = preNameEditValue;
            beforeObjOne.desc = preDescEditValue;
        }

        if (beforeObjOne.tierID == preTierIdEditValue) {
            if (beforeObjOne.name != preNameEditValue) {
                for (var ix = 0; ix < parentGrid.getNodeCount(); ix++) {
                    if (parentGrid.getNode(ix).data.name == preNameEditValue) {
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if (preNameEditValue === '' || parentGrid.getNode(ix).data.tier_id === preTierIdEditValue) {
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Name is already registered.'));
                        var record = grid.findRow('tier_id', preTierIdEditValue);
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
        }

        //referenceObjArray 값을 계속 쌓는것이 아닌 에이전트 ID당 1번만 쌓도록 수정.
        for (var ix = 0; ix < self.referenceObjArray.length; ix++) {
            if(isModified && self.referenceObjArray[ix].tierID === preTierIdEditValue){
                self.removeRefArray(ix);
            }
        }

        if (isModified) {
            self.addRefArray(preTierIdEditValue, preNameEditValue, preDescEditValue);
        }

        // 선택 포인트가 이전포인트와 같을 경우, 변경된 값을 동기화 시켜 보여주기 위해
        if (preTierIdEditValue == rdTierID) {
            rdTierID = preTierIdEditValue;
            rdName   = preNameEditValue;
            rdDesc   = preDescEditValue;
        }

        // 선택된 값들이 다시 이전 선택들의 값이 되기 위해
        beforeObjOne.tierID = rdTierID;
        beforeObjOne.name   = rdName;
        beforeObjOne.desc   = rdDesc;

        preTierIdEdit.setValue(rdTierID);
        preNameEdit.setValue(rdName);
        preDescEdit.setValue(rdDesc);

        return true;
    },

    addRefArray: function (tierID, name, desc) {
        var self = this;

        var tempObj = {
            tierID : tierID,
            name   : name,
            desc   : desc
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
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/tier/' + currentData.tierID,
            method : 'PUT',
            params : JSON.stringify({
                name : currentData.name,
                desc : currentData.desc
            }),
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);

                if (result.success === true) {
                    if(currentData.start === currentData.end){
                        self.removeAllRefArray();
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                        self.cancelButton.fireEvent('click');
                    }
                } else {
                    console.error(result.message);
                }
            },
            failure : function(){}
        });
    }
});
