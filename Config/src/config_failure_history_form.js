Ext.define('config.config_failure_history_form', {
    parent: null,
    systemID: '',
    failureTime: '',
    failureType: '',
    detail: '',
    mode: '',
    // 개당 변경사항 여부 체크
    isWasNameModified: false,
    // 전체의 변경사항 여부 체크
    isWasNameModifiedAll: false,

    clickObject:{
        index:0,
        recordData: null
    },

    referenceObjArray: [],
    // Target 이전 객체
    beforeObj:{
        // 이전에 선택된 인덱스
        preIndex:0,
        systemID: '',
        failureTime: '',
        failureType: '',
        detail: '',
    },

    init: function (state) {
        var self = this;

        this.mode = state;

        self.referenceObjArray = [];

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 300,
            height: 163,
            resizable: false,
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy',
            cls: 'config_tab',
            listeners   : {
                close: function(){
                    if ( self.isWasNameModifiedAll ) {
                        self.parent.onButtonClick('Refresh', 'failure', self.failureTime);
                        self.parent.onButtonClick('Refresh', 'history', self.failureTime);
                    }
                }
            }
        });

        form.setTitle(common.Util.TR('Edit Failure Type'));
        

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            flex: 1,
            height: '100%',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.wasNameEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            hideTrigger : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Time')),
            allowBlank: true
        });

        this.detailEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10+27,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            hideTrigger : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Description')),
            allowBlank: true
        });

        this.hostNameCombo = Ext.create('Exem.AjaxComboBox',{
            x: 0,
            y: 10+27+27,
            cls: 'config_tab',
            width: 270,
            data : [],
            labelWidth: 80,
            labelAlign: 'right',
            enableKeyEvents: true,
            multiSelect: false,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Failure Type')),
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findStatValue();
                }
            }
        });

        
        this.comboData    = [];

        this.comboData.push ({ name: '0 : 정상', value: '0' });
        this.comboData.push ({ name: '1 : 이상', value: '1' });
        this.comboData.push ({ name: '2 : 장애', value: '2' });

        this.hostNameCombo.setData(this.comboData);
        this.hostNameCombo.setSearchField('name');

        panelA2.add(this.wasNameEdit, this.detailEdit, this.hostNameCombo);
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

        this.OKButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Save'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            disabled: true,
            listeners: {
                click: function() {
                    self.save();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Close'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function() {
                    for (var ix = 0; ix < self.referenceObjArray.length; ix++) {
                        self.removeRefArray(ix);
                    }
                    this.up('.window').close();
                }
            }
        });

        panelC.add(this.OKButton);
        panelC.add(this.CancelButton);

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

        self.wasNameEdit.setValue(self.failureTime);
        self.wasNameEdit.setDisabled(true);
        self.detailEdit.setValue(self.detail);
        self.detailEdit.setDisabled(true);
        self.hostNameCombo.setValue(self.failureType);
        self.hostNameCombo.focus();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    findStatValue: function() {
        var self = this;
        var beforeObjOne = self.beforeObj;
        var isModified = self.isWasNameModified;

        // *tip)  beforeObjOne 와 pre*** 와 비교

        // 선택 포인트가 넘어가기 전에 값들을 미리 담아둔다.
        var preSystemIdEditValue     = self.systemID;
        var preFailureTimeEditValue   = self.failureTime;
        var preFailureTypeEditValue   = self.failureType;
        var preDetailEditValue     = self.detail;

        // 선택된 포인트의 값을 저장한다.
        var rdFailureType = self.hostNameCombo.getValue();

        if (beforeObjOne.failureTime == '') {
            beforeObjOne.systemID    = preSystemIdEditValue;
            beforeObjOne.failureTime = preFailureTimeEditValue;
            beforeObjOne.failureType = preFailureTypeEditValue;
            beforeObjOne.detail      = preDetailEditValue;
        }

        if (rdFailureType != preFailureTypeEditValue) {
            isModified = true;
        }

        //referenceObjArray 값을 1번만 쌓음.
        for (var ix = 0; ix < self.referenceObjArray.length; ix++) {
            self.removeRefArray(ix);
        }

        if (isModified) {
            self.OKButton.setDisabled(false);
            self.addRefArray(preSystemIdEditValue, preFailureTimeEditValue, rdFailureType, preDetailEditValue);
        }
        else {
            self.OKButton.setDisabled(true);
        }
        
        return;
    },

    save: function() {
        var self = this;
        // 넣을 데이터 가져오기.
        var systemId = self.systemID;
        var failureTime = self.wasNameEdit.getValue();
        var failureType = self.hostNameCombo.getValue();
        var detail = self.detailEdit.getValue();
        var cusorPointCheck = false;
        var ix, ixLen;
        var ds = {};
        var itemChange = false;

        if(!self.dataCheck(itemChange)){
            return;
        }

        // 마지막 변경사항 추가하기 위해
        if ( self.beforeObj.failureTime == failureTime ) {
            cusorPointCheck = true;
        }

        // Edit mode
        var refObjArray = self.referenceObjArray;

        //마지막 변경사항 추가 이전 같은 was_id값을 가진 referenceObjArray 제거.
        for( ix = 0; ix < refObjArray.length; ix++){
            if( cusorPointCheck && refObjArray[ix].failureTime === failureTime ){
                self.removeRefArray(ix);
            }
        }

        // 마지막 변경사항 추가하기 위해
        if ( cusorPointCheck ) {
            self.addRefArray(systemId, failureTime, failureType, detail);
        }

        for (ix = 0, ixLen = refObjArray.length; ix < ixLen; ix++) {
            var currentData = {};
            var currentSystemId = refObjArray[ix].systemId;
            var currentFailureTime = refObjArray[ix].failureTime;
            var currentDetail = refObjArray[ix].detail;
            var currentFailureType = refObjArray[ix].failureType;
            
            var record = self.parent.wasGrid.findRow('failure_time', currentFailureTime);

            //save 시 입력이 안된 실패 유형을 체크.
            if ( currentFailureType == '') {
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please select a type.'));
                return;
            }

            if (record) {
                self.parent.changeWasInfo(currentSystemId, currentFailureTime, currentFailureType, currentDetail);
                self.setGridRow(currentSystemId, currentFailureTime, currentFailureType, currentDetail);

                if(ix == ixLen - 1){
                    self.beforeObj.systemId = currentSystemId;
                    self.beforeObj.failureTime = currentFailureTime;
                    self.beforeObj.failureType = currentFailureType;
                    self.beforeObj.detail = currentDetail;
                }
            }

            currentData.systemID = currentSystemId;
            currentData.failureTime = currentFailureTime;
            currentData.failureType = currentFailureType;
            currentData.detail = currentDetail;
            currentData.start = ix+1;
            currentData.end = ixLen;
            this.editUpdate(currentData);
        }
        
        self.CancelButton.fireEvent('click');
    },

    editUpdate : function(currentData) {
        var self = this;

        self.isWasNameModifiedAll = true;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + currentData.systemID + '/failurehistory/' + currentData.failureTime + '/status',
            method : 'PUT',
            params : JSON.stringify({
                failure_type : currentData.failureType
            }),
            success : function(response) {
                if(currentData.start === currentData.end){
                    self.removeAllRefArray();
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                }
            },
            failure : function(){}
        });


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
        var systemId = self.systemID;
        var failureTime = self.wasNameEdit.getValue();
        var failureType = self.hostNameCombo.getValue();
        var detail = self.detailEdit.getValue();
        var ix;

        // CHECK: SYSTEM ID Check
        if ( systemId === null || systemId < 0) {
            Ext.Msg.alert(common.Util.TR('ERROR'));
            return false;
        }

        // CHECK: FAILURE TIME + Byte Check
        if ( failureTime == '' && !itemChange) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the Date.'));
            self.wasNameEdit.focus();
            return false;
        }

        if ( failureTime.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
            self.wasNameEdit.focus();
            return false;
        }

        var failureTimeByteLen = this.getTextLength(failureTime);

        if(failureTimeByteLen > 128){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.wasNameEdit.focus();
            return false;
        }

        // CHECK: FAILURE TYPE + Byte Check
        if (failureType == '' && !itemChange) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Value.'));
            self.hostNameCombo.focus();
            return false;
        }

        if ( failureType.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
            self.hostNameCombo.focus();
            return false;
        }

        var failureTypeByteLen = this.getTextLength(failureType);

        if(failureTypeByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.hostNameCombo.focus();
            return false;
        }

        // CHECK: WAS NAME 중복 체크
        if (self.mode == 'Add') {
            for (ix = 0; ix < self.parent.wasGrid.getRowCount(); ix++) {
                if (self.parent.wasGrid.getRow(ix).data.was_name == failureTime) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Already exists'));
                    self.wasNameEdit.focus();
                    return false;
                }
            }
        }else{
            //edit mode
            for (ix = 0; ix < self.parent.wasGrid.getRowCount(); ix++) {
                if (self.parent.wasGrid.getRow(ix).data.was_name == failureTime) {
                    if(itemChange){
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if(failureTime === '' || self.beforeObj.failureTime === failureTime){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Already exists'));
                        self.wasNameEdit.focus();
                        return false;
                    } else{
                        if(self.parent.wasGrid.getRow(ix).data.failure_time === failureTime){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Already exists'));
                        self.wasNameEdit.focus();
                        return false;
                    }
                }
            }
        }
        return true;
    },

    setGridRow: function(systemid, failuretime, failuretype, detail) {
        var ix, ixLen;
        for (ix = 0, ixLen = this.parent.historyGrid.getRowCount(); ix < ixLen; ix++) {
            if (this.parent.historyGrid.getRow(ix).data.failure_time == failuretime) {
                var record = this.parent.historyGrid.findRow('failure_time', failuretime);

                record.set('system_id', systemid);
                record.set('failure_time', failuretime);
                record.set('failure_type', failuretype);
                record.set('detail', detail);
                break;
            }
        }
    },

    addRefArray: function (systemId, failureTime, failureType, detail) {
        var self = this;

        var tempObj = {
            systemId    : systemId,
            failureTime : failureTime,
            failureType : failureType,
            detail      : detail
        };

        self.referenceObjArray.push(tempObj);
        self.isWasNameModified = false;
    },

    removeAllRefArray: function () {
        this.referenceObjArray.splice(0,this.referenceObjArray.length);
    },

    removeRefArray: function (index) {
        this.referenceObjArray.splice(index,1);
    }
});
